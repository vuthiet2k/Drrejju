<script>
import { useFetch } from "@/helpers/api/api.js";
import { inject } from "vue";
import Select from "@/base/components/select/Select.vue";
import TreeSelect from "@/base/components/tree-select/TreeSelect.vue";
import DateInput from "@/base/components/date/date.vue";
import TimePicker from "../../date/TimePicker.vue";
import DateRange from "../../date/DateRange.vue";
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue";
import Photo from "@/base/components/photo/Photo.vue";
import Images from "@/base/components/photo/Images.vue";
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
import { usePost, usePatch } from "@/helpers/api/api.js";
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import FormLoading from "./components/FormLoading.vue";
import MapLocation from "@/base/components/type_form_record/MapLocation.vue";
import Object3d from "@/base/components/object3d/Object3d.vue";
import TextEditor from "@/base/components/editor/TextEditor.vue";
import FormManageList from "@/base/components/manage-list/FormManageList.vue";
import AddInforBasic from "../../type_form_record/AddInforBasic.vue";
import AddDistribution from "../../type_form_record/AddDistribution.vue";
import CustomField from "../../type_form_record/CustomField.vue";
import DocumentExtraction from "@/base/components/document-extraction/DocumentExtraction.vue"
import { postData } from "../../manage-list/handleMangeList";
export default {
  props: {
    externalFeatures: {
      type: Array,
    },
  },
  setup() {
    return {
      apiPath: inject("source-api"),
      manage_data: inject("manage-data"),
      successCode: [200, 201],
    };
  },
  data() {
    return {
      AUTOPASS_FIELDS: ["date", "text", "datetime", "switch"],
      STRINGTIFY_FIELDS: ["manage-list"],
      formUrl: inject("form-url"),
      arrHandleCustom: inject("handle-custom-event-table") ?? [],
      currentObjectId: "",
      formStructures: {},
      formStructuresAdd: [],
      isLoadingFormAdd: false,
      formStructuresEdit: [],
      isLoadingFormEdit: false,
      formStructuresView: [],
      isLoadingFormView: false,
      selectedPermissons: [],
      formsTemplate: [],
      formTypes: {
        text: "text",
        textarea: "textarea",
        texteditor: "text_editor",
        datetime: "datetime",
        date: "date",
        time: "time",
        DateRange: "date-range",
        select: "select",
        treeSelect: "tree-select",
        image: "image",
        point: "point",
        switch: "switch",
        polygon: "polygon",
        line: "line",
        object3d: "object3d",
        manageList: "manage-list",
        customFields: "custom-fields",
        listSelection: "list-selection",
        customInputFields: "custom-input-fields",
        documentExtractionField: "document-extraction-field"
      },
      dataTypes: {
        string: "string",
        string_separate: "string_separate",
        foreign_key: "foreign_key",
        boolean: "boolean",
        json: "json",
        file: "file",
        multi_file: "multi_file",
        dynamic_file_or_foreign_key: "dynamic_file_or_foreign_key",
        manageList: "manage-list",
      },
      mappingRegex: "/(<_mapping::[^>]+>)/",
      onSubmit: false,
    };
  },
  components: {
    Select,
    TreeSelect,
    DateInput,
    TimePicker,
    DateRange,
    AccordionRecord,
    LayoutRecord,
    FormLoading,
    Photo,
    Images,
    MapLocation,
    Object3d,
    TextEditor,
    FormManageList,
    AddInforBasic,
    AddDistribution,
    CustomField,
    DocumentExtraction
  },
  async mounted() {
    this.handleClickAdd();
  },
  methods: {
    isEmptyData(data) {
      // Check for null/undefined
      if (data == null || data == undefined) return true;

      // Check for empty string
      if (typeof data === 'string' && data.trim() === '') return true;

      // Handle objects
      if (typeof data === 'object' && !Array.isArray(data)) {
        // Empty object
        if (Object.keys(data).length === 0) return true;

        // Check for empty id (handling null/undefined/empty string)
        if ((Object.prototype.hasOwnProperty.call(data, 'id'))) {
          const id = data.id;
          return id == null || id === '' || (typeof id === 'object' && Object.keys(id).length === 0);
        }
      }

      return false;
    },
    compare: function (left, operator, right) {
      switch (operator) {
        case "==":
          return left == right;
        case "===":
          return left === right;
        case "!=":
          return left != right;
        case "!==":
          return left !== right;
        case ">":
          return left > right;
        case "<":
          return left < right;
        case ">=":
          return left >= right;
        case "<=":
          return left <= right;
        default:
          throw new Error("Operator không hợp lệ");
      }
    },
    allInMapping: function (data, path, structures) {
      // AllinMapping will check the type of data. If the type is array, we will use map and globalMapping it,
      // after that we will use mappingFields if structures is provided. If it's not an array, we will use
      // mappingFields directly if structures is provided, otherwise just globalMapping.
      if (Array.isArray(data)) {
        return data.map((item) => {
          const itemData = path ? item[path] : item;
          const globalMappedItem = this.globalMapping(itemData);
          const mappedItem = structures
            ? this.strMapping(globalMappedItem, structures)
            : globalMappedItem;
          if (path) {
            return { ...item, [path]: mappedItem };
          } else {
            return mappedItem;
          }
        });
      } else {
        const dataItem = path ? data[path] : data;
        const globalMappedData = this.globalMapping(dataItem);
        return structures
          ? this.strMapping(globalMappedData, structures)
          : globalMappedData;
      }
    },
    globalMapping: function (text) {
      // Hàm này sẽ mapping 1 số tham số được cấu hình sẵn ví dụ như tham số //object_id// sẽ được thay bằng currentObjectId thực tế
      const _map = [
        {
          key: "<_mapping::g:object_id>",
          value: this.currentObjectId,
        },
      ];
      try {
        return _map.reduce((acc, { key, value }) => {
          const regex = new RegExp(key, "g");
          return acc.replace(regex, value);
        }, text);
      } catch (error) {
        console.error("An error occurred while replacing text:", error);
        return text; // Return the original text in case of an error
      }
    },
    getMappingSubstring: function (str) {
      // Lấy về mapping field ở trong string sau đó trả về mappingSubstring đó
      // input: "http://example.com/?param=<_mapping::district>"
      // output: "<_mapping::district>"

      const regex = /(<_mapping::[^>]+>)/;
      const match = str.match(regex);
      return match ? match[1] : null;
    },
    getFieldMapping: function (mappingSubstr) {
      // Lấy về field mapping trong 1 mappingSubstring
      // input: "<_mapping::district>"
      // output: "district"
      const regex = /<_mapping::([^>]+)>/;
      const match = mappingSubstr.match(regex);
      return match ? match[1] : null;
    },
    replaceMappingWithFieldValue: function (str, mappingSubstr, field) {
      // Thay thế mappingSubstr với field value

      // input: "http://example.com/?param=<_mapping::district>"
      // field.value = "111" => "http://example.com/?param=111"
      // field.value = { "id": "1", "name": "Ha Noi"} => "http://example.com/?param=1"
      // Nếu có dữ liệu đúng
      let fillStr = field?.value;
      if (!this.isValueTruthy(field)) return str;

      if (typeof field?.value === "object") {
        fillStr = field?.value?.id;
      }
      return str.replace(mappingSubstr, fillStr);
    },
    strMapping: function (str, structures) {
      // Hàm thay thế dữ liệu source dựa trên các dữ liệu mapping field
      str = this.globalMapping(str);
      const mappingSubstr = this.getMappingSubstring(str);
      if (!mappingSubstr) return str;
      const fieldName = this.getFieldMapping(mappingSubstr);
      const fieldMapping = this.getFieldInForm(fieldName, structures);
      if (!fieldMapping) return str;
      str = this.replaceMappingWithFieldValue(str, mappingSubstr, fieldMapping);
      return str;
    },
    mappingField: function (field, structures) {
      for (const [key, value] of Object.entries(field)) {
        if (typeof value !== "string") continue;
        const fieldMapped = this.strMapping(value, structures);
        field[key] = fieldMapped;
      }
      return field;
    },
    getHeads: function (separateCondition) {
      /*
      NOTE: Tìm vị trí attribute của điều khiện
          ">form-thong-tin-chu-the#>fields#-type.slug#&==#(ca-nhan)"
      GIẢI NGHĨA: sẽ phân tách theo # và các element bắt đầu bằng > sẽ là heads
      */
      let heads = separateCondition.filter((separate) =>
        separate.startsWith(">")
      );
      heads = heads.map((head) => head.substring(1));
      return heads;
    },
    getOperator: function (separateCondition) {
      /*
      NOTE: Tìm vị trí attribute của điều khiện
          ">form-thong-tin-chu-the#>fields#-type.slug#&==#(ca-nhan)"
      GIẢI NGHĨA: sẽ phân tách theo # và các element bắt đầu bằng & sẽ là điều kiện so sánh
      */
      let operator = separateCondition.find((separate) =>
        separate.startsWith("&")
      );
      return operator.substring(1);
    },
    getVariables: function (separateCondition) {
      /*
      NOTE: Tìm vị trí attribute của điều khiện
          ">form-thong-tin-chu-the#>fields#-type.slug#&==#(ca-nhan)"
      GIẢI NGHĨA:
      leftVar sẽ phân tách theo # và element bắt đầu bằng - sẽ là biến so sánh trái
      rightVar sẽ phân tách theo # và element bắt đầu bằng ( và kết thúc bằng ) sẽ là dữ liệu so sánh phải
      */
      let leftVar = separateCondition.find((separate) =>
        separate.startsWith("-")
      );
      let rightVar = separateCondition.find(
        (separate) => separate.startsWith("(") && separate.endsWith(")")
      );
      return {
        leftVar: leftVar.substring(1),
        rightVar: rightVar ? rightVar.slice(1, -1) : "",
      };
    },
    locateStructure: function (heads, structures) {
      /*
      NOTE: Tìm vị trí attribute của điều khiện
      ["form-thong-tin-chu-the", "fields"]
      trường hợp này sẽ tìm element có id = form-thong-tin-chu-the và truy vấn trong fields
      [
      {
          "id":"form-thong-tin-chu-the",
          "title":"Thông tin chủ thể",
          "fields":[
              {
              ...
              "field":"name",
              ...
              },
              {
              ...
              "field":"type",
              ...
              }
          ]
      },
      {
          ...
          "conditions":[
              ...
              ">form-thong-tin-chu-the#>fields#-type.slug#&==#(ca-nhan)"
              ...
          ]
          ...
      ]
      */
      const formId = heads[0];
      const formAttr = heads[1];
      let form = structures.find((item) => item.id === formId);
      const attribute = form[formAttr];
      return attribute;
    },
    getValueLeftVar: function (leftVar, attribute) {
      const separateVar = leftVar.split(".");
      let fieldValue = null;
      /*
      NOTE: element đầu tiên trong mảng separateVar chính là tên của field cần lấy giá trị
            các element tiếp theo được mặc định là subFields hay là truy vấn sâu
    
      VÍ DỤ: trường type có giá trị như sau :
      "type": {
          "id":"2ea6442f-dd8e-438d-b0c0-e491c3aace78",
          "created_date":"2024-08-15T03:51:00Z",
          "updated_date":"2024-08-15T03:51:00Z",
          "is_active":true,
          "name":"Cá nhân",
          "slug":"ca-nhan"
      }
      VÀ TRUY VẤN CỦA NGƯỜI DÙNG LÀ type.slug == (ca-nhan)
      => Khi đó sẽ lấy attribute slug của trường type để truy vấn
      */
      if (separateVar.length) {
        const fieldName = separateVar[0];
        const field = attribute.find((attr) => attr["field"] == fieldName);
        fieldValue = field["value"];
      }
      // TRUY VẤN SÂU
      if (fieldValue && separateVar.length > 1) {
        const subFields = separateVar.slice(1);
        subFields.forEach((field) => {
          fieldValue = fieldValue[field];
        });
      }
      return fieldValue;
    },
    isSatisfyConditions: function (conditions, structures) {
      let isSatisfy = true;
      if (conditions) {
        conditions.forEach((condition) => {
          const separateCondition = condition.split("#");
          const heads = this.getHeads(separateCondition);
          const operator = this.getOperator(separateCondition);
          const varsCheck = this.getVariables(separateCondition);
          const attribute = this.locateStructure(heads, structures);
          const leftValue = this.getValueLeftVar(
            varsCheck["leftVar"],
            attribute
          );
          const rightValue = varsCheck["rightVar"];
          isSatisfy = this.compare(leftValue, operator, rightValue);
        });
      }
      return isSatisfy;
    },
    getFieldPlaceholder: function (field, isToast) {
      let placeholder = `Nhập ${field?.name?.toLowerCase()}`;
      if (field?.form_type == "select")
        placeholder = `Chọn ${field?.name?.toLowerCase()}`;
      if (isToast) return placeholder;
      return field.placeholder || placeholder;
    },
    getTheFieldRef: function (field, structure) {
      return structure?.id + field?.field;
    },
    focusToField: function (ref) {
      return ref;
    },
    isSatisfyFormRequires: function (structures) {
      let isSatisfied = true;
      structures.forEach((structure) => {
        // Nếu block này không thỏa mãn điều kiện thì không cần check (giống như việc nếu họ chọn type là cá nhân thì các phần type là
        // Đơn vị phòng ban và Công ty không cần nhập thông tin)
        if (!this.isSatisfyConditions(structure.conditions, structures)) return;
        structure?.fields?.forEach((field) => {
          if (
            field?.require &&
            this.isEmptyData(field.value) &&
            this.isSatisfyDepend(field, structures)
          ) {
            const theFieldRef = this.getTheFieldRef(field, structure);
            this.focusToField(theFieldRef);
            const errorMsg =
              "Vui lòng " + this.getFieldPlaceholder(field, true);
            errorToast(errorMsg);
            isSatisfied = false;
          }
        });
      });
      return isSatisfied;
    },
    convertStringPointToPoint: function (stringPoint) {
      const [lat, lng] = stringPoint.split(", ").map(Number);
      return { lat, lng };
    },
    buildData: function (field) {
      let isPassed = true;
      let data = field.value;
      // Kiểm tra form select
      // Mặc định form select đã sử dụng TreeSelect hoặc SelectInput component nên dữ liệu sẽ được thống nhất theo 1 kiểu
      if (field.form_type == this.formTypes.select || field.form_type == this.formTypes.treeSelect) {
        if (field.multiple) {
          // Có một số trường hợp dữ liệu đẩy lên sau này chính là dữ liệu hiển thị
          // Vậy nên là nếu trường dữ liệu có dataTypes là json thì sẽ chuyển thành dạng json không cần phân tách ra id
          if (field.data_type == this.dataTypes.json) {
            data = JSON.stringify(data);
          } else {
            data = JSON.stringify(
              data.map((d) => {
                return { id: d.id };
              })
            );
          }
        } else {
          data = field?.value?.id;
        }
      } else if (this.AUTOPASS_FIELDS.includes(field.form_type)) {
        if (field.data_type == this.dataTypes.string_separate) {
          data = JSON.stringify(
            data.split(",").map((separate) => separate.trim())
          );
        }
      } else if (
        field.form_type == this.formTypes.image ||
        field.form_type == this.formTypes.object3d
      ) {
        if (field.data_type == this.dataTypes.dynamic_file_or_foreign_key) {
          if (data?.id) data = data.id;
          else if (typeof data === "string" || data instanceof String) {
            isPassed = false;
          }
        } else {
          // Trường hợp ảnh được thêm và tiến hành chỉnh sửa thì dữ liệu ảnh sẽ trả về dưới dạng string
          // Nếu người dùng không thay đổi ảnh thì dữ liệu vẫn là string trường hợp này không cần đẩy lại field này
          // Khi đẩy lên sẽ bị lỗi ảnh
          if (typeof data === "string" || data instanceof String) {
            isPassed = false;
          }
        }
      } else if (field.form_type == this.formTypes.point) {
        if (field.data_type == this.dataTypes.json) {
          data = JSON.stringify(this.convertStringPointToPoint(data));
        }
      } else if (
        field.form_type == this.formTypes.customFields ||
        field.form_type == this.formTypes.customInputFields ||
        field.form_type == this.formTypes.listSelection
      ) {
        data = JSON.stringify(data);
      }
      if (this.STRINGTIFY_FIELDS.includes(field.form_type)) {
        isPassed = false;
      }

      return {
        accept: isPassed,
        data: data,
      };
    },
    buildFormData: function (structures) {
      if (!this.isSatisfyFormRequires(structures)) return false;
      const formData = new FormData();
      structures.forEach((structure) => {
        // Nếu block này không thỏa mãn điều kiện thì không cần check (giống như việc nếu họ chọn type là cá nhân thì các phần type là
        // Đơn vị phòng ban và Công ty không cần nhập thông tin)
        if (!this.isSatisfyConditions(structure.conditions, structures)) return;
        structure?.fields?.forEach((field) => {
          // Chỗ này cần check nếu dữ liệu rỗng thì không cho qua, tuy nhiên với trường hợp switch field thì có thể trả về dữ liệu là false và cũng không pass chỗ này
          if (!this.isSatisfyDepend(field, structures)) return;
          if (field?.value === null || field?.value == undefined) return;
          const buildData = this.buildData(field);

          if (buildData?.data === null || buildData?.data == undefined) return;

          const FORM_FILE_FIELDS = [this.formTypes.image];
          if (buildData.accept) {
            if (FORM_FILE_FIELDS.includes(field.form_type)) {
              if (
                field.data_type == this.dataTypes.multi_file ||
                field.multiple
              ) {
                buildData.data.forEach((file) => {
                  formData.append(field.field, file);
                });
              } else {
                formData.append(field.field, buildData.data);
              }
            } else {
              formData.append(field.field, buildData.data);
            }
          }
        });
      });
      return formData;
    },
    handleMappingFieldOnSubmit: async function (structures) {
      // Handle manage-list fields: ['manage-list']
      if (!structures) return [];
      let manageListFields = this.getManageListFields(structures);
      manageListFields = manageListFields.map((field) => {
        const mappedField = this.mappingField(field, structures);
        return mappedField;
      });
      manageListFields.forEach((field) => {
        const formData = new FormData();
        formData.append(field.field, JSON.stringify(field.value));
        postData(field.post_link, formData);
      });
    },
    setFormsStructures: function () {
      this.formsTemplate = [
        {
          head: {
            id: "add",
            name: "Thêm mới",
            btns: [
              {
                name: "Thêm mới",
                icon: "ri-save-2-fill",
                class: "btn btn-warning btn-icon waves-effect waves-light",
                click: ($e, structures) => {
                  this.handleAdd(structures);
                },
              },
              {
                name: "Làm mới",
                icon: "las la-undo-alt",
                class: "btn btn-danger btn-icon waves-effect waves-light",
                click: () => this.handleClickAdd(),
              },
            ],
          },
          body: {
            isLoading: this.isLoadingFormAdd,
            structures: this.formStructuresAdd,
          },
        },
        {
          head: {
            id: "update",
            name: "Chỉnh sửa",
            btns: [
              {
                name: "Chỉnh sửa",
                icon: "ri-save-2-fill",
                class: "btn btn-warning btn-icon waves-effect waves-light",
                click: ($e, structures) => this.handEdit(structures),
              },
              {
                name: "Làm mới",
                icon: "las la-undo-alt",
                class: "btn btn-danger btn-icon waves-effect waves-light",
                click: () => {
                  this.handleClickEdit(this.currentObjectId);
                },
              },
            ],
          },
          body: {
            isLoading: this.isLoadingFormEdit,
            structures: this.formStructuresEdit,
          },
        },
        {
          head: {
            id: "view",
            name: "Xem chi tiết",
            btns: [
              {
                name: "Chỉnh sửa",
                icon: "las la-edit",
                type: "offcanvas",
                dataBsTarget: "update",
                class: "btn btn-warning btn-icon waves-effect waves-light",
                click: () => {
                  this.handleClickEdit(this.currentObjectId);
                },
              },
              {
                name: "Xóa bản ghi",
                icon: "ri-delete-bin-5-line",
                class: "btn btn-danger btn-icon waves-effect waves-light",
                click: () => this.handleDelete(),
              },
            ],
          },
          body: {
            isLoading: this.isLoadingFormView,
            structures: this.formStructuresView,
          },
        },
      ];
    },
    handleClickAdd: async function () {
      this.isLoadingFormAdd = true;
      this.setFormsStructures();
      await useFetch(this.formUrl + `add/`).then((data) => {
        if (!data?.length) return;
        data.forEach((structure, index) => {
          this.formStructuresAdd[index] = { ...structure };
        });
      });
      this.isLoadingFormAdd = false;
      this.setFormsStructures();
    },
    handleClickEdit: async function (objectId) {
      this.currentObjectId = objectId;
      this.isLoadingFormEdit = true;
      this.setFormsStructures();
      await useFetch(this.formUrl + `update/?id=${objectId}`).then((data) => {
        data.forEach((structure, index) => {
          this.formStructuresEdit[index] = structure;
        });
      });
      this.isLoadingFormEdit = false;
      this.setFormsStructures();
    },
    handleClickView: async function (objectId) {
      this.currentObjectId = objectId;
      this.isLoadingFormView = true;
      this.setFormsStructures();
      await useFetch(this.formUrl + `view/?id=${objectId}`).then((data) => {
        data.forEach((structure, index) => {
          this.formStructuresView[index] = structure;
        });
      });
      this.isLoadingFormView = false;
      this.setFormsStructures();
    },
    handleAdd: async function (structures) {
      this.onSubmit = true;

      try {
        const formData = this.buildFormData(structures);
        if (formData == false) return;
        const res = await usePost(this.apiPath, formData);
        if (!this.successCode.includes(res?.status)) {
          errorToast("Thêm thất bại, vui lòng thử lại sau!");
          return;
        }

        const data = await res.json();
        this.currentObjectId = data?.id;

        this.handleMappingFieldOnSubmit(structures);

        successToast("Thêm thành công!");
        this.handleClickAdd();
        this.manage_data.handleCallApi();
      }
      finally {
        this.onSubmit = false;
      }
    },
    handEdit: async function (structures) {
      this.onSubmit = true;
      try {
        const formData = this.buildFormData(structures);
        if (formData == false) return;
        const resp = await usePatch(this.apiPath + `/${this.currentObjectId}`, formData)
        if (this.successCode.includes(resp.status)) {
          successToast("Cập nhật thành công!");
        } else {
          errorToast("Cập nhật thất bại, vui lòng thử lại sau!");
        }
        this.handleClickEdit(this.currentObjectId);
        this.manage_data.handleCallApi();
      }
      finally {
        this.onSubmit = false;
      }
    },
    handleDelete: function () {
      const objectId = { id: this.currentObjectId };

      this.manage_data.handleDelete(objectId);
    },
    getFieldsInStructure: function (structures) {
      let allFields = [];
      if (!structures?.length) return allFields;
      structures.forEach((structure) => {
        const fields = structure?.fields;
        allFields = [...allFields, ...fields];
      });
      return allFields;
    },
    getFieldInForm: function (fieldName, structures) {
      // Hàm được sử dụng để tìm kiếm 1 field trong form
      // fieldName (Str): Tên trường cần tìm
      // form (Object):form tìm kiếm
      const fields = this.getFieldsInStructure(structures);
      const founded = fields.find((f) => {
        return f.field == fieldName;
      });

      return founded;
    },
    getManageListFields: function (structures) {
      const fields = this.getFieldsInStructure(structures);
      const manageListFields = fields.filter((field) => {
        return field.form_type == this.formTypes.manageList;
      });
      return manageListFields;
    },
    isValueTruthy: function (dependField) {
      // Check if dependField.value exists and is not null or undefined
      if (
        dependField &&
        dependField?.value !== undefined &&
        dependField?.value !== null
      ) {
        // Check for non-empty object
        if (
          typeof dependField?.value === "object" &&
          Object.keys(dependField?.value).length === 0
        ) {
          return false;
        }
        // Check for other falsy values
        return !!dependField?.value;
      }
      return false;
    },
    isSatisfyDepend: function (field, structures) {
      let dependFieldName = field.depend;
      let isReverseDepend = false;

      if (!dependFieldName) return true;

      if (dependFieldName.startsWith("!")) {
        dependFieldName = dependFieldName.slice(1);
        isReverseDepend = true;
      }
      // if dependFieldName startWiths('!')

      const dependField = this.getFieldInForm(dependFieldName, structures);
      if (isReverseDepend) {
        if (this.isValueTruthy(dependField)) {
          field.value = "";
          return false;
        } else return true;
      }

      if (!this.isValueTruthy(dependField)) {
        field.value = "";
        return false;
      }
      return true;
    },
    handleOffcanvasClose(formId) {
      this.externalFeatures.forEach((feature) => {
        if (feature?.shows) {
          if (feature?.shows?.includes(formId)) {
            feature.actions.close();
          }
        }
      });
    },
    handleClickFiledType: function ($e, field) {
      if (!this.arrHandleCustom?.length || !this.arrHandleCustom) {
        return;
      }
      // Tìm phần tử trong mảng arrHandleCustom với điều kiện name === attribute.key
      const customHandler = this.arrHandleCustom
        .filter(
          (item) =>
            typeof item.type === "string" && item.type.startsWith("FIELD")
        )
        .find((item) => item.type === `FIELD${field.field}`);
      // Nếu tìm thấy, gọi hàm handle từ item đó
      if (customHandler && typeof customHandler.handle == "function") {
        customHandler.handle($e, field, this);
        return;
      }
    },
  },
};
</script>

<template>
  <LayoutRecord :id="form.head.id" :title="form.head.name" v-for="(form, index) in formsTemplate" :key="index"
    @close-offcanvas="() => handleOffcanvasClose(form.head.id)">
    <template #header>
      <template v-for="(btn, index) in form.head.btns" :key="index">
        <button v-if="btn.type == 'offcanvas'" type="button" :class="btn.class" :disabled="onSubmit"
          @click="($e) => btn.click($e, form.body.structures)" data-bs-toggle="offcanvas"
          :data-bs-target="'#offcanvas' + btn.dataBsTarget" :aria-controls="'#offcanvas' + btn.dataBsTarget">
          <i :class="btn.icon"></i>
        </button>
        <button v-else type="button" :class="btn.class" @click="($e) => btn.click($e, form.body.structures)"
          :disabled="onSubmit">
          <i :class="btn.icon"></i>
        </button>
      </template>
      <template v-for="(feature, index) in externalFeatures" :key="index">
        <template v-if="feature?.shows?.includes(form.head.id)">
          <button type="button" :class="feature.class" @click="($e) => feature.actions.click(currentObjectId)">
            <i :class="feature.icon"></i>
          </button>
        </template>
        <!-- {{ feature }}
        {{ feature.shows }} -->
        <!-- <template v-if="feature?.shows.includes(form.head.id)">
            <button type="button" :class="feature?.class" @click="($e) => feature.click()">
              <i :class="feature?.icon"></i>
            </button>

          </template> -->
      </template>
    </template>
    <template #body>
      <template v-if="form.body.isLoading">
        <FormLoading></FormLoading>
      </template>
      <template v-else>
        <form action="#">
          <template v-for="(structure, index) in form.body.structures" :key="index">
            <template v-if="
              !isSatisfyConditions(structure.conditions, form.body.structures)
            ">
            </template>
            <template v-else>
              <AccordionRecord :title="structure.title.toUpperCase()">
                <b-row>
                  <b-col :lg="field.col" v-for="(field, indexField) in structure.fields" :key="indexField"
                    @click="($e) => handleClickFiledType($e, field)">
                    <template v-if="isSatisfyDepend(field, form.body.structures) && !field?.hidden">
                      <div class="mb-3 position-relative">
                        <label v-if="field.show_label" :for="getTheFieldRef(field, structure)"
                          class="form-label mb-1 d-flex">{{ field.name }}
                          <span class="text-danger" v-if="field.require">*</span>
                          &nbsp;
                          <span v-if="field.help_text" class="d-flex cursor-pointer" :title="field.help_text"><i
                              class="ri-question-line"></i></span>
                        </label>
                        <template v-if="field.form_type == formTypes.text">
                          <input type="text" class="form-control" :id="getTheFieldRef(field, structure)"
                            :disabled="field.disable" :ref="getTheFieldRef(field, structure)"
                            :placeholder="getFieldPlaceholder(field)" v-model="field.value" />
                        </template>
                        <template v-else-if="field.form_type == formTypes.textarea">
                          <textarea class="form-control" :ref="getTheFieldRef(field, structure)"
                            :id="getTheFieldRef(field, structure)" :disabled="field.disable"
                            :placeholder="getFieldPlaceholder(field)" v-model="field.value"></textarea>
                        </template>
                        <template v-else-if="field.form_type == formTypes.texteditor">
                          <TextEditor v-model="field.value" :data="field.value" :disable="field.disable"></TextEditor>
                        </template>
                        <template v-else-if="field.form_type == formTypes.select">
                          <template v-if="field.depend">
                            <Select :api="strMapping(field.source, form?.body?.structures)
                              " :isLocalSearch="!field.source" :localData="field.init_data"
                              :multiSelect="field.multiple" :id="getTheFieldRef(field, structure)"
                              :ref="getTheFieldRef(field, structure)" :defaultValue="field.value"
                              :label="field.search_field" :searchField="field.search_field"
                              :labelField="field.label_field" :isCloseOnSelect="true"
                              :defaultValueLabel="getFieldPlaceholder(field)" :disable="field.disable"
                              :showIcon="field.show_icon" iconFiled="name"
                              @change-data="(data) => (field.value = data)">
                            </Select>
                          </template>
                          <template v-else>
                            <Select :api="field.source" :isLocalSearch="!field.source" :localData="field.init_data"
                              :multiSelect="field.multiple" :id="getTheFieldRef(field, structure)"
                              :ref="getTheFieldRef(field, structure)" :defaultValue="field.value"
                              :label="field.search_field" :searchField="field.search_field"
                              :labelField="field.label_field" :isCloseOnSelect="true"
                              :defaultValueLabel="getFieldPlaceholder(field)" :disable="field.disable"
                              :showIcon="field.show_icon" iconFiled="name"
                              @change-data="(data) => (field.value = data)">
                            </Select>
                          </template>
                        </template>
                        <template v-else-if="field.form_type == formTypes.treeSelect">
                          <TreeSelect :defaultSelected="field.value" :treeData="field.init_data"
                            :api="strMapping(field.source, form?.body?.structures)" :disable="field.disable"
                            :convert="true" @on-selected="(data) => (field.value = data)" :multiSelect="field.multiple">
                          </TreeSelect>
                        </template>
                        <template v-else-if="field.form_type == formTypes.date">
                          <DateInput :placeholder="getFieldPlaceholder(field)" :ref="getTheFieldRef(field, structure)"
                            :id="getTheFieldRef(field, structure)" v-model="field.value" :disabled="field.disable">
                          </DateInput>
                        </template>
                        <template v-else-if="field.form_type == formTypes.datetime">
                          <DateInput :placeholder="getFieldPlaceholder(field)" :ref="getTheFieldRef(field, structure)"
                            :isDateTime="true" :id="getTheFieldRef(field, structure)" v-model="field.value"
                            :disabled="field.disable">
                          </DateInput>
                        </template>
                        <template v-else-if="field.form_type == formTypes.time">
                          <TimePicker :placeholder="getFieldPlaceholder(field)" :ref="getTheFieldRef(field, structure)"
                            :isDateTime="false" :id="getTheFieldRef(field, structure)" v-model="field.value"
                            :disabled="field.disable">
                          </TimePicker>
                        </template>
                        <template v-else-if="field.form_type == formTypes.DateRange">
                          <DateRange :placeholder="getFieldPlaceholder(field)" :ref="getTheFieldRef(field, structure)"
                            :isDateTime="false" :id="getTheFieldRef(field, structure)" v-model="field.value"
                            :disabled="field.disable">
                          </DateRange>
                        </template>
                        <template v-else-if="field.form_type == formTypes.image">
                          <template v-if="field.data_type == dataTypes.multi_file">
                            <Images v-model="field.value" :disable="field.disable" :images="field.value"
                              @onDeleteImage="handleClickEdit(currentObjectId)" :id="getTheFieldRef(field, structure)"
                              :source="field.source">
                            </Images>
                          </template>
                          <template v-else>
                            <Photo :id="getTheFieldRef(field, structure)" :currentPhoto="field.value"
                              v-model="field.value" :label="field.name" :disable="field.disable"
                              :gallery="field.gallery" :dynamic_pick="field.data_type ==
                                dataTypes.dynamic_file_or_foreign_key
                                ">
                            </Photo>
                          </template>
                        </template>
                        <template v-else-if="field.form_type == formTypes.point">
                          <MapLocation v-model="field.value" :disable="field.disable"></MapLocation>
                        </template>
                        <template v-else-if="field.form_type == formTypes.object3d">
                          <Object3d :id="getTheFieldRef(field, structure)" v-model="field.value"
                            :disable="field.disable" :currentObject="field.value"></Object3d>
                        </template>
                        <template v-else-if="field.form_type == formTypes.manageList">
                          <FormManageList :dataApi="field.data_api" :dataPreload="field.data_preload"
                            :preload="field.preload" :postLink="globalMapping(field.post_link)" :fieldName="field.field"
                            :editableFields="field.editable_fields" :recordEditApi="globalMapping(field.record_edit_api)
                              " :recordValidation="allInMapping(
                                field.record_validation,
                                'path',
                                form.body.structures
                              )
                                " :delLink="globalMapping(field.del_link)" :objId="currentObjectId"
                            v-model="field.value" :exportApi="globalMapping(field.export_api)" :disable="field.disable">
                          </FormManageList>
                        </template>
                        <template v-else-if="field.form_type == formTypes.switch">
                          <div class="form-check form-switch form-switch-md" dir="ltr">
                            <input type="checkbox" class="form-check-input" v-model="field.value"
                              :disabled="field.disable" />
                          </div>
                        </template>
                        <template v-else-if="field.form_type == formTypes.customFields">
                          <div class="col-12">
                            <AddInforBasic :field="field" v-model="field.value"></AddInforBasic>
                          </div>
                        </template>
                        <template v-else-if="field.form_type == formTypes.listSelection">
                          <div class="col-12">
                            <AddDistribution :field="field" v-model="field.value" :structure="form.body.structures[1]">
                            </AddDistribution>
                          </div>
                        </template>
                        <template v-else-if="field.form_type == formTypes.customInputFields">
                          <div class="col-12">
                            <CustomField :field="field" v-model="field.value"></CustomField>
                          </div>
                        </template>
                        <template v-else-if="field.form_type == formTypes.documentExtractionField">
                          <DocumentExtraction></DocumentExtraction>
                        </template>
                        <template v-else>
                          <input type="text" class="form-control" :ref="getTheFieldRef(field, structure)"
                            :placeholder="getFieldPlaceholder(field)" :id="getTheFieldRef(field, structure)"
                            v-model="field.value" :disabled="field.disable" />
                        </template>
                      </div>
                    </template>
                  </b-col>
                </b-row>
              </AccordionRecord>
            </template>
          </template>

          <slot />
        </form>
      </template>
    </template>
  </LayoutRecord>
</template>
