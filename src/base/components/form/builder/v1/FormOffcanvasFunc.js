import { useFetch, usePost, usePatch } from "@/helpers/api/api.js";
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import { postData } from "../../../manage-list/handleMangeList";

export default {
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
    globalMapping: function (text) {
        // Hàm này sẽ mapping 1 số tham số được cấu hình sẵn ví dụ như tham số //object_id// sẽ được thay bằng currentObjectId thực tế
        const _map = [
            {
                key: "<_mapping::g:object_id>",
                value: this.currentObjectId
            }
        ]
        try {
            return _map.reduce((acc, { key, value }) => {
                const regex = new RegExp(key, 'g');
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

        const regex = /(<_mapping::[^>]+>)/
        const match = str.match(regex);
        return match ? match[1] : null;
    },
    getFieldMapping: function (mappingSubstr) {
        // Lấy về field mapping trong 1 mappingSubstring
        // input: "<_mapping::district>"
        // output: "district"
        const regex = /<_mapping::([^>]+)>/;
        const match = mappingSubstr.match(regex);
        return match ? match[1] : null
    },
    replaceMappingWithFieldValue: function (str, mappingSubstr, field) {
        // Thay thế mappingSubstr với field value

        // input: "http://example.com/?param=<_mapping::district>"
        // field.value = "111" => "http://example.com/?param=111"
        // field.value = { "id": "1", "name": "Ha Noi"} => "http://example.com/?param=1"
        // Nếu có dữ liệu đúng
        let fillStr = field?.value
        if (!this.isValueTruthy(field)) return str

        if (typeof field?.value === 'object') {
            fillStr = field?.value?.id
        }
        return str.replace(mappingSubstr, fillStr)
    },
    strMapping: function (str, structures) {
        // Hàm thay thế dữ liệu source dựa trên các dữ liệu mapping field
        str = this.globalMapping(str)
        const mappingSubstr = this.getMappingSubstring(str)
        if (!mappingSubstr) return str
        const fieldName = this.getFieldMapping(mappingSubstr)
        const fieldMapping = this.getFieldInForm(fieldName, structures)
        if (!fieldMapping) return str
        str = this.replaceMappingWithFieldValue(str, mappingSubstr, fieldMapping)
        return str
    },
    mappingField: function (field, structures) {
        for (const [key, value] of Object.entries(field)) {
            if (typeof value !== "string") continue;
            const fieldMapped = this.strMapping(value, structures)
            field[key] = fieldMapped
        }
        return field
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
        if (isToast) return placeholder
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
                if (field?.require && !field.value && this.isSatisfyDepend(field, structures)) {
                    const theFieldRef = this.getTheFieldRef(field, structure);
                    this.focusToField(theFieldRef);
                    const errorMsg = "Vui lòng " + this.getFieldPlaceholder(field, true);
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
        // Nếu dữ liệu rõng thì trả về không thực hiện kiểm tra nữa
        if (!data === "") return data;
        // Kiểm tra form select
        // Mặc định form select đã sử dụng TreeSelect hoặc SelectInput component nên dữ liệu sẽ được thống nhất theo 1 kiểu
        else if (field.form_type == this.formTypes.select) {
            if (field.multiple) {
                data = JSON.stringify(
                    data.map((d) => {
                        return { id: d.id };
                    })
                );
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
        }
        if (this.STRINGTIFY_FIELDS.includes(field.form_type)) {
            isPassed = false
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
                if (!this.isSatisfyDepend(field, structures)) return
                if (field?.value === null || field?.value == undefined) return

                const buildData = this.buildData(field);
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
        if (!structures) return []
        let manageListFields = this.getManageListFields(structures)
        manageListFields = manageListFields.map(field => {
            const mappedField = this.mappingField(field, structures)
            return mappedField
        })
        manageListFields.forEach(field => {
            const formData = new FormData()
            formData.append(field.field, JSON.stringify(field.value))
            postData(field.post_link, formData)
        })
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
                            click: ($e, structures) => this.handleAdd(structures),
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
        const formData = this.buildFormData(structures);
        if (formData == false) return;
        const res = await usePost(this.apiPath, formData)
        if (!this.successCode.includes(res?.status)) {
            errorToast("Thêm thất bại, vui lòng thử lại sau!");
            return;
        }

        const data = await res.json()
        this.currentObjectId = data?.id

        this.handleMappingFieldOnSubmit(structures)

        successToast("Thêm thành công!");
        this.manage_data.handleCallApi();
    },
    handEdit: function (structures) {
        const formData = this.buildFormData(structures);
        if (formData == false) return;
        usePatch(this.apiPath + `/${this.currentObjectId}`, formData).then(
            async (res) => {
                if (this.successCode.includes(res.status)) {
                    successToast("Cập nhật thành công!");
                } else {
                    errorToast("Cập nhật thất bại, vui lòng thử lại sau!");
                }
                this.handleClickEdit(this.currentObjectId);
                this.manage_data.handleCallApi();
            }
        );
    },
    handleDelete: function () {
        const objectId = { id: this.currentObjectId };

        this.manage_data.handleDelete(objectId);
    },
    getFieldsInStructure: function (structures) {
        let allFields = []
        if (!structures?.length) return allFields
        structures.forEach(structure => {
            const fields = structure?.fields
            allFields = [...allFields, ...fields]
        })
        return allFields
    },
    getFieldInForm: function (fieldName, structures) {
        // Hàm được sử dụng để tìm kiếm 1 field trong form
        // fieldName (Str): Tên trường cần tìm
        // form (Object):form tìm kiếm
        const fields = this.getFieldsInStructure(structures)
        const founded = fields.find(f => {
            return f.field == fieldName
        })

        return founded

    },
    getManageListFields: function (structures) {
        const fields = this.getFieldsInStructure(structures)
        const manageListFields = fields.filter(field => {
            return field.form_type == this.formTypes.manageList
        })
        return manageListFields
    },
    isValueTruthy: function (dependField) {
        // Check if dependField.value exists and is not null or undefined
        if (dependField && dependField?.value !== undefined && dependField?.value !== null) {
            // Check for non-empty object
            if (typeof dependField?.value === 'object' && Object.keys(dependField?.value).length === 0) {
                return false;
            }
            // Check for other falsy values
            return !!dependField?.value;
        }
        return false;
    },
    isSatisfyDepend: function (field, structures) {
        let dependFieldName = field.depend
        let isReverseDepend = false

        if (!dependFieldName) return true

        if (dependFieldName.startsWith('!')) {
            dependFieldName = dependFieldName.slice(1)
            isReverseDepend = true
        }
        // if dependFieldName startWiths('!')

        const dependField = this.getFieldInForm(dependFieldName, structures)
        if (isReverseDepend) {
            if (this.isValueTruthy(dependField)) {
                field.value = ""
                return false
            }
            else return true
        }

        if (!this.isValueTruthy(dependField)) {
            field.value = ""
            return false
        }
        return true
    }
}