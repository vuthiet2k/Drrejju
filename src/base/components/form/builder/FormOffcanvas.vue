<script>
import { inject, ref, computed } from "vue";
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
import { useFetch } from "@/helpers/api/api.js";
import API from "@/helpers/api/useAxios.js";
import FormOffcanvasBody from "./FormOffcanvasBody.vue";
export default {
  props: {
    externalFeatures: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  setup() {
    // Inject 4 flag
    const noAdd = inject("no-add", ref(false));
    const noView = inject("no-view", ref(false));
    const noEdit = inject("no-edit", ref(false));
    const noDelete = inject("no-delete", ref(false));

    // Một ref để chứa template gốc
    const formsTemplate = ref([]);
    // Computed lọc forms + buttons theo flag
    const filteredForms = computed(() => {
      return (
        formsTemplate.value
          // 1. Loại bỏ cả form nếu không có quyền
          .filter((form) => {
            if (form.head.id === "add" && noAdd.value) return false;
            if (form.head.id === "update" && noEdit.value) return false;
            if (form.head.id === "view" && noView.value) return false;
            return true;
          })
          // 2. Trong mỗi form, chỉ giữ lại những nút còn quyền
          .map((form) => {
            const id = form.head.id;
            const btns = form.head.btns.filter((btn) => {
              // Xác định action key tương ứng
              let flag = false;
              if (btn.click && id === "add") flag = noAdd.value;
              if (btn.click && id === "update") flag = noEdit.value;
              if (btn.click && id === "view") flag = noView.value;
              // Nếu là nút delete trong form view
              if (btn.name.includes("Xóa") && noDelete.value) flag = true;

              return !flag;
            });

            return {
              ...form,
              head: { ...form.head, btns },
            };
          })
      );
    });

    return {
      filteredForms,
      formsTemplate,
      apiPath: inject("source-api"),
      manage_data: inject("manage-data"),
      successCode: [200, 201],
      noAdd,
    };
  },

  data() {
    return {
      formUrl: inject("form-url"),
      currentObjectId: "",
      formStructuresAdd: [],
      isLoadingFormAdd: false,
      formStructuresEdit: [],
      isLoadingFormEdit: false,
      formStructuresView: [],
      isLoadingFormView: false,
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
        documentExtractionField: "document-extraction-field",
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
    LayoutRecord,
    FormOffcanvasBody,
  },
  async mounted() {
    if (this.noAdd) {
      this.setFormsStructures();
      return;
    }
    this.handleClickAdd();
  },
  methods: {
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
      if (!this.formUrl) return;
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
        const formData = this.$refs.formBodyadd[0].buildFormData(structures);
        if (formData == false) return;
        const data = await API().post(
          `${this.apiPath}/`,
          formData,
          "Thêm thành công!",
          "Thêm thất bại, vui lòng thử lại sau!"
        );

        if (!data || !data?.id) return;
        this.currentObjectId = data?.id;

        this.$refs.formBodyadd[0].handleMappingFieldOnSubmit(structures);
        this.handleClickAdd();
        this.manage_data.handleCallApi();
      } finally {
        this.onSubmit = false;
      }
    },
    handEdit: async function (structures) {
      this.onSubmit = true;
      try {
        const formData = this.$refs.formBodyupdate[0].buildFormData(structures);
        if (formData == false) return;
        const res = await API().patch(
          `${this.apiPath}/${this.currentObjectId}/`,
          formData,
          "Cập nhật thành công!",
          "Cập nhật thất bại, vui lòng thử lại sau!"
        );
        if (!res || !res?.id) return;
        this.handleClickEdit(this.currentObjectId);
        this.manage_data.handleCallApi();
      } finally {
        this.onSubmit = false;
      }
    },
    handleDelete: function () {
      const objectId = { id: this.currentObjectId };

      this.manage_data.handleDelete(objectId);
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
  },
};
</script>

<template>
  <LayoutRecord
    :id="form.head.id"
    :title="form.head.name"
    v-for="(form, index) in filteredForms"
    :key="index"
    @close-offcanvas="() => handleOffcanvasClose(form.head.id)"
  >
    <template #header>
      <template v-for="(btn, index) in form.head.btns" :key="index">
        <button
          v-if="btn.type == 'offcanvas'"
          type="button"
          :class="btn.class"
          :disabled="onSubmit"
          @click="($e) => btn.click($e, form.body.structures)"
          data-bs-toggle="offcanvas"
          :data-bs-target="'#offcanvas' + btn.dataBsTarget"
          :aria-controls="'#offcanvas' + btn.dataBsTarget"
        >
          <i :class="btn.icon"></i>
        </button>
        <button
          v-else
          type="button"
          :class="btn.class"
          @click="($e) => btn.click($e, form.body.structures)"
          :disabled="onSubmit"
        >
          <i :class="btn.icon"></i>
        </button>
      </template>
      <template v-for="(feature, index) in externalFeatures" :key="index">
        <template v-if="feature?.shows?.includes(form.head.id)">
          <button
            type="button"
            :class="feature.class"
            @click="($e) => feature.actions.click(currentObjectId)"
          >
            <i :class="feature.icon"></i>
          </button>
        </template>
      </template>
    </template>
    <template #body>
      <FormOffcanvasBody
        :formStructures="form.body.structures"
        :isLoading="form.body.isLoading"
        :currentObjectId="currentObjectId"
        :ref="`formBody` + form.head.id"
      ></FormOffcanvasBody>
    </template>
  </LayoutRecord>
</template>
