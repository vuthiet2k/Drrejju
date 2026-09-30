<template>
  <template v-if="isLoading">
    <div class="w-100">
      <Searching></Searching>
    </div>
  </template>
  <template v-else>
    <!-- Normal add modal -->
    <Modal
      :id="`manage-list` + modalId"
      v-model="showModal"
      hide-footer
      size="xl"
      :title="`Thêm ` + appInfo?.label"
      cancelVariant="light"
    >
      <Search
        @search-text="onChangeSearchText"
        :placeholder="`Nhập thông tin ` + this.appInfo?.label + ` cần tìm kiếm`"
      ></Search>
      <form action="javascript:void(0);">
        <b-row class="g-0 m-2">
          <b-col lg="12">
            <!-- Striped Rows -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th
                    style="width: 30px"
                    class="d-flex cursor-pointer no-select border-0"
                    @click="handleSelectAllCurrentRecord"
                  >
                    <input
                      type="checkbox"
                      :checked="isSelectedAllCurrentRecord()"
                    />
                  </th>
                  <th v-for="(attr, index) in attributes" :key="index">
                    {{ attr.name }}
                  </th>
                </tr>
              </thead>
              <tbody class="position-relative">
                <template v-if="isSearching">
                  <div
                    class="position-absolute w-100 h-100 bg-light d-flex justify-content-center align-items-center"
                  >
                    <Searching></Searching>
                  </div>
                </template>
                <template v-if="!dataList?.length && searchText">
                  <tr>
                    <td :colspan="attributes?.length + 1">
                      <notMatchSearch :searchText="searchText"></notMatchSearch>
                    </td>
                  </tr>
                </template>
                <template v-if="!dataList?.length && !searchText">
                  <tr>
                    <td :colspan="attributes?.length + 1">
                      Không có {{ this.appInfo?.label }} nào!
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr
                    v-for="(record, index) in dataList"
                    :key="index"
                    class="cursor-pointer"
                    @click="handleSelectRecord(record)"
                  >
                    <td>
                      <input
                        type="checkbox"
                        style="pointer-events: none"
                        :checked="
                          isSelectedRecord(record) || isAddedRecord(record)
                        "
                        :disabled="isAddedRecord(record)"
                      />
                    </td>
                    <td v-for="(attr, index) in attributes" :key="index">
                      {{ getVisualDataFromAttr(attr, record) ?? "_" }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
            <PaginationUI
              @change="changeDataListPage"
              :current-page="dataOptions.current_page_number"
              :page-size="dataOptions.total_pages"
            ></PaginationUI>
          </b-col>
          <b-col lg="12 mt-3 d-flex justify-content-center align-items-center">
            <div>
              Đã chọn {{ selectedList.length }}/{{ dataOptions.total_objects }}
            </div>
            <div class="hstack gap-2 justify-content-end ml-auto">
              <b-button
                type="button"
                variant="light"
                @click="showModal = false"
              >
                Đóng</b-button
              >
              <b-button
                type="button"
                variant="primary"
                @click="
                  () => {
                    handleAddSelectedRecord();
                  }
                "
                >Thêm</b-button
              >
            </div>
          </b-col>
        </b-row>
      </form>
    </Modal>
    <!-- Quick add modal -->
    <Modal
      :id="`manage-list-quick-add` + modalId"
      v-model="showModalQuickAdd"
      hide-footer
      size="xl"
      :title="`Thêm nhanh`"
      cancelVariant="light"
    >
      <div v-if="onSubmitQuickAdd">
        <div
          class="w-100 h-100 d-flex justify-content-center align-items-center"
        >
          <span class="spinner-grow flex-shrink-0" role="status"> </span>
          <span>Đang tiến hành thêm ứng viên, vui lòng đợi!</span>
        </div>
      </div>
      <template v-else>
        <div class="d-flex gap-3 mb-3">
          <button class="btn btn-primary" @click="addQuickAddCandidate">
            Thêm ứng viên
          </button>
          <button
            type="button"
            @click="handleGetEditForm"
            :disabled="isLoadingEditForm || isOnSubmitForm"
            class="btn btn-warning waves-effect waves-light"
          >
            <i class="bx bx-revision fs-16"></i>
          </button>
        </div>
        <FormOffcanvasBody
          :formStructures="quickFormRequired"
          ref="formQuickAddCandidate"
        />
        <div class="d-flex gap-3 mb-3 justify-content-end">
          <button class="btn btn-primary" @click="addQuickAddCandidate">
            Thêm ứng viên
          </button>
          <button
            type="button"
            @click="handleGetEditForm"
            :disabled="isLoadingEditForm || isOnSubmitForm"
            class="btn btn-warning waves-effect waves-light"
          >
            <i class="bx bx-revision fs-16"></i>
          </button>
        </div>
      </template>
    </Modal>
    <!-- Export excel modal -->
    <Modal
      :id="`manage-list-export-excel` + modalId"
      v-model="showExportExcel"
      hide-footer
      size="fullscreen"
      :title="`Xuất danh sách ` + appInfo?.label"
      cancelVariant="light"
    >
      <div class="d-flex gap-2 align-items-center">
        <div class="dropdown mb-2">
          <button
            class="btn btn-outline-primary btn-icon waves-effect waves-light"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="ri-settings-2-line fs-16"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" @click.stop>
            <li
              v-for="(item, index) in listFullAttributes"
              :key="index"
              @drop="($e) => handleDrop(item, index, $e)"
              @dragstart="($e) => startDrag(item, index, $e)"
              @dragover.prevent
              @dragenter.prevent
              draggable="true"
              class="position-relative"
            >
              <div
                class="d-flex align-items-center gap-2 cursor-pointer dropdown-item form-check form-switch px-2 ellipsis"
              >
                <input
                  class="form-check-input m-0"
                  role="switch"
                  type="checkbox"
                  v-model="item.show"
                />
                <span>{{ item.name }}</span>
              </div>
              <i class="ri-drag-drop-line fs-16 icon-drag"></i>
            </li>
          </ul>
        </div>
        <button
          class="btn btn-primary mb-2"
          @click="handleAddNewExportCustomColumn"
        >
          Thêm cột
        </button>
        <div class="w-75 mb-2">
          <input
            type="text"
            class="form-control"
            v-model="exportFileName"
            placeholder="Mặc định: Têncôngty_Ngàybắtđầuphỏngvấn"
          />
        </div>
        <div class="mb-2">.xlsx</div>
      </div>
      <div
        class="row"
        v-for="(item, index) in customExportColumns"
        :key="index"
      >
        <div class="col-3">
          <input
            type="text"
            class="form-control"
            v-model="item.column"
            placeholder="Nhập tên cột"
          />
        </div>
        <div class="col-8">
          <input
            type="text"
            class="form-control"
            v-model="item.value"
            placeholder="Nhập giá trị"
          />
        </div>
        <div
          class="col-1 mb-2 d-flex justify-content-center align-items-center"
        >
          <button
            class="btn btn-danger"
            type="button"
            @click="handleRemoveExportCustomColumn(index)"
          >
            X
          </button>
        </div>
      </div>
      <form action="javascript:void(0);">
        <b-row class="g-0 m-2">
          <b-col lg="12">
            <!-- Striped Rows -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th style="width: 45px">STT</th>
                  <th
                    v-for="(attr, index) in listExportAttributes"
                    :key="index"
                  >
                    {{ attr.name }}
                  </th>
                </tr>
              </thead>
              <tbody class="position-relative">
                <template v-if="!addedList?.length && !searchText">
                  <tr>
                    <td :colspan="listExportAttributes?.length + 1">
                      Không có {{ this.appInfo?.label }} nào!
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr
                    v-for="(item, index) in addedList.slice(0, 10)"
                    :key="index"
                  >
                    <td class="text-center">#{{ index + 1 }}</td>
                    <td
                      v-for="(attr, index) in listExportAttributes"
                      :key="index"
                    >
                      {{ getVisualDataFromAttr(attr, item) }}
                    </td>
                  </tr>
                </template>
                <template v-if="addedList.length > 10">
                  <tr>
                    <td :colspan="listExportAttributes.length + 1">(...)</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </b-col>
          <b-col lg="12 mt-3 d-flex justify-content-center align-items-center">
            <div class="hstack gap-2 justify-content-end ml-auto">
              <b-button
                type="button"
                variant="light"
                @click="showExportExcel = false"
              >
                Đóng</b-button
              >
              <b-button
                type="button"
                variant="primary"
                @click="
                  () => {
                    handleExportExcel();
                  }
                "
                >Xuất File Excel</b-button
              >
            </div>
          </b-col>
        </b-row>
      </form>
    </Modal>
    <!-- Multiple edit modal -->
    <Modal
      :id="`manage-list-edit-added` + modalId"
      v-model="showEditModal"
      hide-footer
      size="xl"
      :title="`Chỉnh sửa ` + appInfo?.label + ` hàng loạt`"
      cancelVariant="light"
    >
      <form action="javascript:void(0);">
        <b-row class="g-0 m-2">
          <b-col lg="12">
            <!-- Striped Rows -->
            <h5>Cập nhật thông tin</h5>
            <hr />
            <!-- <template v-for="(field, index) in selectedAddedEditData" :key="index">
                            <div class="d-flex align-items-center mt-3">
                                <input type="checkbox" class="form-check-outline cursor-pointer"
                                    :id="`checkbox-edit-all-` + field.field + modalId" v-model="field.value">
                                <label :for="`checkbox-edit-all-` + field.field + modalId"
                                    class="mb-0 cursor-pointer">&nbsp;&nbsp;{{ field.name }}</label>
                            </div>
                        </template> -->
            <template v-for="(field, index) in editableFields" :key="index">
              {{ field.label }}
              <template v-if="field.type == 'select'">
                <div class="d-flex align-items-center mt-3">
                  <label class="mb-0 cursor-pointer">{{ field.name }}</label>
                  <select class="form-select" v-model="field.value">
                    <option
                      v-for="option in field.options"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}
                    </option>
                  </select>
                </div>
              </template>
            </template>
            <hr />
            <h5 class="mt-2">
              Danh sách các {{ appInfo?.label }} được chỉnh sửa
            </h5>
            <SimpleBar :style="{ 'max-height': '300px' }">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th style="width: 45px">STT</th>
                    <th
                      class="text-center"
                      v-for="(attr, index) in listAttributes"
                      :key="index"
                    >
                      {{ attr.name }}
                    </th>
                  </tr>
                </thead>
                <tbody class="position-relative">
                  <tr
                    v-for="(record, index) in selectedAddedList"
                    :key="index"
                    class="form__user-data"
                  >
                    <td class="text-center">#{{ index + 1 }}</td>
                    <td
                      v-for="(attr, index) in listAttributes"
                      :key="index"
                      class="text-center"
                    >
                      <template v-if="isEditableField(attr.path)">
                        <template
                          v-if="getEditableField(attr.path).type == 'select'"
                        >
                          <select
                            class="form-select"
                            v-model="record[attr.path]"
                            disabled="true"
                            @change="handleActiveOnEditRecord(record)"
                          >
                            <option
                              v-for="option in getEditableField(attr.path)
                                .options"
                              :key="option.id"
                              :value="option.id"
                            >
                              {{ option.name }}
                            </option>
                          </select>
                        </template>
                      </template>
                      <template v-else>
                        {{ getVisualDataFromAttr(attr, record) }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </SimpleBar>
          </b-col>
          <b-col lg="12 mt-3 d-flex justify-content-center align-items-center">
            <div class="hstack gap-2 justify-content-end ml-auto">
              <b-button
                type="button"
                variant="light"
                @click="showEditModal = false"
              >
                Đóng</b-button
              >
              <b-button
                type="button"
                variant="primary"
                @click="
                  () => {
                    handleUpdateAllSelectedAdded();
                  }
                "
                >Chỉnh sửa</b-button
              >
            </div>
          </b-col>
        </b-row>
      </form>
    </Modal>
    <div
      ref="manageListContainer"
      :customID="id"
      class="position-relative"
      style=""
    >
      <b-row>
        <b-col lg="12" class="mb-3">
          <div class="d-flex gap-3">
            <button
              class="btn btn-sm btn-primary mb-2 d-flex align-items-center"
              type="button"
              @click="showModal = true"
              :disabled="disable"
            >
              <i class="ri-add-fill"></i> &nbsp; Thêm {{ appInfo?.label }}
            </button>
            <button
              class="btn btn-sm btn-warning mb-2 d-flex align-items-center"
              type="button"
              @click="showModalQuickAdd = true"
              v-if="quickAdd?.api"
              :disabled="disable"
            >
              <i class="ri-add-fill"></i> &nbsp; Thêm nhanh
            </button>
            <button
              class="btn btn-outline-success btn-icon waves-effect waves-light mb-2 ml-auto d-flex"
              v-if="exportApi"
              type="button"
              @click="showExportExcel = true"
            >
              <i class="ri-download-2-fill"></i>
            </button>
          </div>
          <table class="table align-middle table-striped table-bordered">
            <thead class="table-light text-dark text-center text-uppercase">
              <tr>
                <th style="width: 20px" v-if="!disable">
                  <input
                    type="checkbox"
                    class="cursor-pointer"
                    @click="($e) => handleSelectAllAddedRecord()"
                    :checked="isSelectedAllAddedRecord()"
                  />
                </th>
                <th style="width: 45px">STT</th>
                <th v-for="(attr, index) in listAttributes" :key="index">
                  <div class="d-flex align-items-center">
                    <input
                      v-if="attr?.path != 'status'"
                      type="text"
                      class="form-control"
                      v-model="attr.search"
                      :placeholder="attr.name"
                    />
                    <span v-else>
                      <select
                        class="form-select form-control"
                        style="min-width: 160px"
                        :placeholder="attr.name"
                        v-model="attr.search"
                      >
                        <option
                          v-for="option in getEditableField(attr.path).options"
                          :key="option.id"
                          :value="option.id"
                        >
                          {{ option.name }}
                        </option>
                      </select>
                    </span>
                  </div>
                </th>
                <th
                  class="text-center d-flex gap-2 justify-content-center"
                  v-if="!disable"
                >
                  <div class="dropdown text-center" data-v-aa1df486="">
                    <button
                      class="btn btn-soft-secondary btn-sm dropdown"
                      type="button"
                      v-if="selectedAddedList.length"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      data-v-aa1df486=""
                    >
                      <i class="mdi mdi-dots-vertical" data-v-aa1df486=""></i>
                    </button>
                    <ul
                      class="dropdown-menu dropdown-menu-end"
                      data-v-aa1df486=""
                    >
                      <li @click="handleEditSelectedAdded()">
                        <div class="dropdown-item text-muted">
                          <i
                            class="ri-pencil-fill align-bottom me-2 text-muted"
                          ></i>
                          Chỉnh sửa các {{ appInfo?.label }} đã chọn
                        </div>
                      </li>
                      <li @click="handleDelSelectedAdded()">
                        <div class="dropdown-item text-danger">
                          <i class="ri-delete-bin-fill align-bottom me-2"></i>
                          Xóa các {{ appInfo?.label }} đã chọn
                        </div>
                      </li>
                    </ul>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="list form-check-all" v-if="addedList?.length > 0">
              <tr
                v-for="(record, index) in filteredAddedData"
                :key="index"
                class="form__user-data"
              >
                <td v-if="!disable">
                  <input
                    type="checkbox"
                    class="cursor-pointer"
                    @click="
                      ($e) =>
                        handleToggleAddedRecord(record, $e?.target?.checked)
                    "
                    :checked="isSelectedAddedRecord(record)"
                  />
                </td>
                <td class="text-center">#{{ index + 1 }}</td>
                <td
                  v-for="(attr, index) in listAttributes"
                  :key="index"
                  class="text-center"
                  :class="{
                    'text-nowrap': attr?.path == 'candidate.full_name',
                  }"
                >
                  <template v-if="isEditableField(attr.path)">
                    <template
                      v-if="getEditableField(attr.path).type == 'select'"
                    >
                      <select
                        class="form-select"
                        v-model="record[attr.path]"
                        @change="handleActiveOnEditRecord(record)"
                      >
                        <option
                          v-for="option in getEditableField(attr.path).options"
                          :key="option.id"
                          :value="option.id"
                        >
                          {{ option.name }}
                        </option>
                      </select>
                    </template>
                  </template>
                  <template v-else>
                    {{ getVisualDataFromAttr(attr, record) }}
                  </template>
                </td>
                <td
                  class="text-center d-flex gap-2 justify-content-center"
                  v-if="!disable"
                >
                  <!-- <button type="button"
                                        class="btn btn-outline-primary btn-icon waves-effect waves-light"
                                        @click="handleActiveOnEditRecord(record)"><i
                                            :class="{ 'ri-save-2-fill': isRecordOnEdit(record), 'bx bxs-edit': !isRecordOnEdit(record) }"></i></button> -->
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-icon waves-effect waves-light"
                    @click="handleRemoveAddedRecord(record)"
                  >
                    <i class="ri-delete-bin-2-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody class="list form-check-all" v-else>
              <tr>
                <td :colspan="attributes.length + 4" class="text-center">
                  Chưa có {{ appInfo?.label }}
                  nào được thêm !
                </td>
              </tr>
            </tbody>
          </table>
        </b-col>
      </b-row>
    </div>
  </template>
</template>

<style scoped>
.icon-drag {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

li:hover .icon-drag {
  display: block;
}
</style>

<script>
import { v4 as uuidv4 } from "uuid";
import { useFetch } from "@/helpers/api/api.js";
import PaginationUI from "@/app_manage_dynamic_api/components/paging/PaginationUI.vue";
import Modal from "@/base/components/dtwinUI/Modal.vue";
import { useSwal } from "@/base/common/useSwal.js";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import { delData, objectToFormData, postData } from "./handleMangeList";
import { usePatch, usePost } from "@/helpers/api/api";
import Search from "../search/Search.vue";
import notMatchSearch from "../search/notMatchSearch.vue";
import Searching from "../search/searching.vue";
import { swapArr } from "@/app_manage_dynamic_api/common/common.js";
import { getAccessToken } from "@/helpers/api/token";
import { SimpleBar } from "simplebar-vue3";
import { getVisualDataFromAttr } from "@/helpers/utils/tableList.js";
import FormOffcanvasBody from "@/base/components/form/builder/FormOffcanvasBody1.vue";
import { API_SERVER_URL } from "@/base/store/api/server_api";
import {
  removeVietnamese,
  removeExtraSpaces,
} from "@/helpers/utils/stringHandle.js";
// useSwal là composable trả về các hàm xác nhận; 2 hàm này KHÔNG được export
// rời từ useSwal.js nên lấy sẵn ở scope module để dùng trong methods.
const { confirmDelete, confirmAction } = useSwal();
export default {
  props: {
    objId: {},
    disable: {},
    fieldName: {},
    preload: {},
    exportApi: {},
    dataApi: {},
    quickAdd: {},
    dataPreload: {},
    postLink: {},
    delLink: {},
    currentValue: {},
    modelValue: {},
    editableFields: {
      type: Array,
      /** @type ['is_arrived', 'is_success', ...] */
      default: () => [],
    },
    recordEditApi: {
      type: String,
      default: "",
    },
    recordValidation: {
      type: Array,
      /** @type { 'path': 'is-qualified', 'handle': 'Ứng viên không đủ điều kiện tham gia buổi phỏng vấn!'}[] */
      default: () => [],
    },
  },
  data: () => {
    return {
      onChecking: [],
      modalId: null,
      dataOptions: {},
      preloadData: {},
      preloadList: {},
      listFullAttributes: [],
      showModal: false,
      showModalQuickAdd: false,
      showExportExcel: false,
      showEditModal: false,
      onSubmitQuickAdd: false,
      quickForm: [],
      requiredFields: [],
      selectedList: [],
      addedList: [],
      searchText: "",
      selectedAddedList: [],
      isSearching: false,
      isLoadingData: false,
      isLoadingList: false,
      currentRecord: null,
      oldRecordValue: null,
      selectedAddedEditData: [],
      customExportColumns: [],
      customExportData: { column: "", value: "" },
      exportFileName: "",
    };
  },
  components: {
    PaginationUI,
    Modal,
    Search,
    notMatchSearch,
    Searching,
    SimpleBar,
    FormOffcanvasBody,
  },
  computed: {
    dataValidateLink() {
      return this.dataPreload.replace("/preload", "");
    },
    listExportAttributes() {
      let attrs = this.listFullAttributes;
      if (attrs?.length) {
        attrs = attrs.filter((attr) => {
          return attr.show;
        });
      } else attrs = [];
      return attrs;
    },
    listAttributes() {
      let attrs = this.preloadList?.attributes;
      if (attrs?.length) {
        attrs = attrs.filter((attr) => {
          return attr.show;
        });
      } else attrs = [];
      return attrs;
    },
    // Attributes dành cho danh sách chọn
    attributes() {
      let attrs = this.preloadData?.attributes;
      if (attrs?.length) {
        attrs = attrs.filter((attr) => {
          return attr.show;
        });
      } else attrs = [];
      return attrs;
    },
    appInfo() {
      let appInfo = this.preloadData?.app_info;
      return appInfo;
    },
    dataList() {
      let data = this.dataOptions.results;
      return data;
    },
    addedData() {
      return [...this.addedList];
    },
    filteredAddedData() {
      // const data = [...this.addedList]
      // const attributes = this.listAttributes
      // filter data with attributes value.value
      let data = [...this.addedList];
      return data.filter((item) => {
        return this.listAttributes.every((attr) => {
          // Nếu không có search ở field này thì nó mặc định là đúng
          if (attr.search === "" || attr.search === undefined) return true;

          let value = this.getValueByPath(item, attr?.path);
          if (typeof value == typeof {}) value = value?.str;
          if (value == undefined) value = "";

          if (typeof value == typeof 0) return value == attr?.search;

          let searchVal = removeVietnamese(attr?.search);
          searchVal = removeExtraSpaces(searchVal);

          let searchToSimple = removeVietnamese(value);
          searchToSimple = removeExtraSpaces(searchToSimple);
          return searchToSimple.includes(searchVal);
        });
      });
    },
    isLoading() {
      return this.isLoadingData && this.isLoadingList;
    },
    canEdit() {
      return this.editableFields?.length && this.recordEditApi;
    },
    quickFormRequired() {
      const removedFields = ["campaign", "department"];
      let form = this.removeFields(this.quickForm, removedFields);
      form = this.setRequiredFields(form, this.requiredFields);
      return form;
    },
  },
  async mounted() {
    this.modalId = uuidv4();
    this.getPreloadData();
    if (this.modelValue?.length) {
      this.addedList = [...this.modelValue];
    }
    this.getPreloadList().then(() => {
      // const tmpRecord = this.addedList[0]
      this.selectedAddedEditData = this.editableFields.map((fieldName) => {
        const attr = this.listAttributes.find((att) => att.path == fieldName);
        return { field: fieldName, name: attr?.name, value: false };
      });
    });
    this.getDataOptions();
    this.getPrepareQuickAdd();
  },
  beforeUnmount() {},
  methods: {
    getVisualDataFromAttr,
    getValueByPath(obj, path) {
      return path.split(".").reduce((acc, key) => acc?.[key], obj);
    },
    setRequiredFields(structures, requiredFields) {
      if (!requiredFields.length) return structures;
      // Chỉ cần set require cho các trường có id trong requiredFields
      const requiredIds = new Set(requiredFields.map((f) => f.id));
      structures.forEach((section) => {
        section.fields.forEach((field) => {
          if (requiredIds.has(field.field)) {
            field.require = true;
          }
        });
      });
      return structures;
    },
    removeFields(structures, fieldsToRemove) {
      const removeIds = new Set(fieldsToRemove);
      return structures.map((section) => {
        return {
          ...section,
          fields: section.fields.filter((field) => !removeIds.has(field.field)),
        };
      });
    },
    async getPrepareQuickAdd() {
      if (!this.quickAdd?.api) return;
      // get form
      const formApi = this.quickAdd?.api + "/form/add/";
      useFetch(formApi).then((data) => {
        this.quickForm = data;
      });
      if (!this.objId) return;
      const getRequireFieldsApi =
        API_SERVER_URL + "/interview/" + this.objId + "/require-fields";
      useFetch(getRequireFieldsApi).then((data) => {
        const fields = data?.fields;
        if (fields) {
          this.requiredFields = fields;
        }
      });
    },
    async addQuickAddCandidate() {
      this.onSubmitQuickAdd = true;
      try {
        const formData = this.$refs.formQuickAddCandidate.buildFormData(
          this.quickFormRequired
        );
        if (formData == false) return;

        const cccdFront = formData.get("cccd_front");
        const cccdBehind = formData.get("cccd_behind");
        formData.append("interview_id", this.objId);
        if (!cccdBehind || !cccdFront) {
          errorToast("Vui lòng nhập ảnh CCCD 2 mặt!", "top");
          return;
        }
        const response = await usePost("/candidate/", formData);
        if (response.status == 201) {
          const json = await response.json();
          const { username, first_name, last_name } = json.caregiver;
          json.candidate = {
            ...json,
          };
          json.caregiver.str = `${username} (${first_name} ${last_name})`;
          this.pushSelectedRecord(json);
          await this.handleAddSelectedRecord(true);
          this.showModalQuickAdd = false;
        } else {
          const json = await response.json();
          errorToast(
            json?.msg || "Có lỗi xảy ra, vui lòng liên hệ quản trị viên!",
            "top"
          );
        }
      } finally {
        this.onSubmitQuickAdd = false;
      }
    },
    // Preload cho modal pick
    async getPreloadData() {
      this.isLoadingData = true;
      await useFetch(this.dataPreload).then(
        (data) => (this.preloadData = data)
      );
      this.listFullAttributes = this.preloadData?.attributes;
      this.isLoadingData = false;
    },
    // Danh sách hiển thị
    async getPreloadList() {
      this.isLoadingList = true;
      await useFetch(this.preload).then((data) => (this.preloadList = data));
      this.isLoadingList = false;
    },
    async getDataOptions(page = 1) {
      await useFetch(
        this.dataApi + "?page=" + page + "&q=" + this.searchText
      ).then((data) => (this.dataOptions = data));
    },
    getLabelField(fieldName, attributes) {
      const attr = attributes.find((field) => field.path == fieldName);
      return attr?.name;
    },
    changeDataListPage(page) {
      this.getDataOptions(page);
    },
    isExistRecord(list, record) {
      const recordIndex = list.findIndex((item) => {
        return item?.id == record?.id;
      });
      return recordIndex != -1;
    },
    isSelectedRecord(record) {
      return this.isExistRecord(this.selectedList, record);
    },
    isSelectedAddedRecord(record) {
      return this.isExistRecord(this.selectedAddedList, record);
    },
    isAddedRecord(record) {
      return this.isExistRecord(this.addedList, record);
    },
    removeAddedRecord(record) {
      const recordIndex = this.addedList.findIndex((item) => {
        return item?.id == record?.id;
      });
      if (recordIndex != -1) this.addedList.splice(recordIndex, 1);
    },
    pushSelectedRecord(record) {
      if (!this.isSelectedRecord(record)) this.selectedList.push(record);
    },
    removeSelectedRecord(record) {
      const recordIndex = this.selectedList.findIndex((selected) => {
        return selected?.id == record?.id;
      });
      if (recordIndex != -1) this.selectedList.splice(recordIndex, 1);
    },
    isSelectedAllCurrentRecord() {
      const missRecords = [];
      if (!this.dataList) return false;
      this.dataList.forEach((record) => {
        if (!this.isSelectedRecord(record)) missRecords.push(record);
      });

      return missRecords.length == 0;
    },
    isSelectedAllAddedRecord() {
      const missRecords = [];
      if (!this.addedList) return false;
      this.addedList.forEach((record) => {
        if (!this.isSelectedAddedRecord(record)) missRecords.push(record);
      });

      return missRecords.length == 0;
    },
    async handleSelectRecord(record, forceSelect, onSelectAll = false) {
      if (this.onChecking.includes(record?.id)) {
        errorToast("Bản ghi này đang được kiểm tra, vui lòng đợi!", "top");
        return;
      }
      if (this.isAddedRecord(record)) {
        if (!onSelectAll)
          errorToast(
            `${this.appInfo?.label}: ${record?.str} đã có trong danh sách!`,
            "top"
          );
        return;
      }
      try {
        this.onChecking.push(record?.id);
        // Kiểm tra các điều kiện của bản ghi
        // VD: kiểm tra ứng viên có đủ điều kiện tham gia buổi phỏng vấn không
        if (this.recordValidation.length) {
          for (const validate of this.recordValidation) {
            const url = `${this.dataValidateLink}${record?.id}/${validate.path}`;
            const data = await useFetch(url);

            if (data?.status != "ok" && onSelectAll) {
              return {
                status: "error",
                message: `${record?.str} không đủ điều kiện!`,
              };
            }
            if (data?.status != "ok" && !onSelectAll) {
              errorToast(data?.msg ?? validate.handle, "top");
              // Thoát khỏi hàm handleSelectRecord luôn
              return;
            }
          }
        }

        if (!this.isSelectedRecord(record)) {
          this.pushSelectedRecord(record);
          return { status: "ok", message: `${record?.str} đã được chọn!` };
        } else {
          if (!forceSelect) this.removeSelectedRecord(record);
        }
      } catch (error) {
        errorToast(
          "Xảy ra lỗi trong quá trình kiểm tra, vui lòng liên hệ quản trị viên!",
          "top"
        );
      } finally {
        const index = this.onChecking.indexOf(record?.id);
        if (index !== -1) {
          this.onChecking.splice(index, 1);
        }
      }
    },
    // Chọn bản ghi trong danh sách đã thêm
    async handleToggleAddedRecord(record, checked) {
      if (checked) {
        if (this.isSelectedAddedRecord(record)) return;
        this.selectedAddedList.push(record);
      } else {
        if (!this.isSelectedAddedRecord(record)) return;
        const recordIndex = this.selectedAddedList.findIndex((selected) => {
          return selected?.id == record?.id;
        });
        if (recordIndex != -1) this.selectedAddedList.splice(recordIndex, 1);
      }
      // if (!this.isSelectedRecord(record)) {
      //     this.pushSelectedRecord(record)
      // } else {
      //     if (!forceSelect) this.removeSelectedRecord(record)
      // }
    },
    async handleSelectAllCurrentRecord() {
      let forceSelect = true;
      let errors = [];
      let success = [];
      if (this.isSelectedAllCurrentRecord()) forceSelect = false;
      for (const record of this.dataList) {
        const res = await this.handleSelectRecord(record, forceSelect, true);
        if (res?.status == "error") {
          errors.push(res.message);
        } else if (res?.status == "ok") {
          success.push(res.message);
        }
      }
      successToast(
        `Chọn thành công ${success.length} ${this.appInfo?.label}, và ${errors.length} ${this.appInfo?.label} không đủ điều kiện!`,
        "top"
      );
    },
    handleSelectAllAddedRecord() {
      let forceSelect = true;
      if (this.isSelectedAllAddedRecord()) forceSelect = false;
      this.addedList.forEach((record) => {
        this.handleToggleAddedRecord(record, forceSelect);
      });
    },
    async handleEditSelectedAdded() {
      this.showEditModal = true;
    },
    async handleDelSelectedAdded() {
      const result = await confirmDelete(
        `Xác nhận xóa ${this.selectedAddedList.length} ${this.appInfo?.label} đã chọn?`
      );

      if (!result.isConfirmed) {
        return;
      }

      await Promise.all(
        this.selectedAddedList.map((record) =>
          this.handleRemoveAddedRecord(record, true)
        )
      );
      
      successToast(
        `Xóa thành công ${this.selectedAddedList.length} ${this.appInfo.label}!`,
        "top"
      );
      this.selectedAddedList = [];
    },
    async handleAddSelectedRecord(force) {
      if (!this.selectedList.length) {
        errorToast("Chưa chọn " + this.appInfo?.label + " nào để thêm!", "top");
        return;
      }
      if (!force) {
  const result = await confirmAction(
    `Xác nhận thêm ${this.selectedList.length} ${this.appInfo?.label} đã chọn? Bạn có thể không có quyền xóa sau khi thêm dữ liệu này!`
  );
  
  if (!result.isConfirmed) {
    return;
  }
}

      this.showModal = false;
      let count = 0;
      this.selectedList.forEach((record) => {
        if (!this.isAddedRecord(record)) {
          this.addedList.push(record);
          count += 1;
        }
      });
      if (this.objId && count > 0) {
        const formData = new FormData();
        formData.append(this.fieldName, JSON.stringify(this.selectedList));
        await postData(this.postLink, formData).then(() => {
          successToast(
            `Thêm thành công ${count} ${this.appInfo?.label} vào danh sách!`,
            "top"
          );
        });
      }
      this.selectedList = [];
    },
    async handleRemoveAddedRecord(record, force) {
      if (!force) {
        const result = await confirmDelete(
          `Xác nhận xóa ${this.appInfo?.label}: <b>${record?.str}</b> đã chọn?`
        );
        
        if (!result.isConfirmed) {
          return;
        }
      }

      this.showModal = false;
      // Nếu thêm khi chỉnh sửa thì lúc này đã có id của đối tượng, sẽ sử dụng delLink để xóa đối tượng này trên API
      if (this.objId) {
        // Xử lý xóa ứng viên
        const formData = new FormData();
        formData.append(this.fieldName, JSON.stringify([record]));
        const resp = await delData(this.delLink, formData);
        if (resp?.status == 403) {
          errorToast("Không có quyền thực hiện chức năng này!", "top");
        } else {
          this.removeAddedRecord(record);
          if (!force)
            successToast(
              `Đã xóa ${this.appInfo?.label}: ${record?.str} khỏi danh sách!`,
              "top"
            );
        }
      }
    },
    async onChangeSearchText(text) {
      this.isSearching = true;
      this.searchText = text;
      await this.getDataOptions();
      this.isSearching = false;
    },
    async handleActiveOnEditRecord(record, force) {
      // Khi chọn vào nút chỉnh sửa và khác bản ghi hiện tại đang sửa

      // currentRecord == null in 2 cases first click and saved record
      // currentRecord != null when on active a record and active another record
      // if (!this.isRecordOnEdit(record) && !force) {
      //     // Trả lại dữ liệu cũ cho bản ghi không được lưu
      //     // if (this.currentRecord != null) {
      //     //     this.currentRecord = { ...this.oldRecordValue}
      //     // }
      //     this.oldRecordValue = { ...record }
      //     this.currentRecord = record
      //     return
      // }
      const formData = objectToFormData(record);
      const resp = await usePatch(this.recordEditApi, formData, false);
      if (resp.status == 403) {
        const data = await resp.json();
        errorToast(data?.msg, "top");
        return;
      }
      const data = await resp.json();
      if (data?.id && !force) {
        this.currentRecord = null;
        successToast("Cập nhật thành công!", "top");
      }
    },
    async handleUpdateAllSelectedAdded() {
      const result = await confirmAction(
        `Xác nhận chỉnh sửa thông tin ${this.selectedAddedList.length} ${this.appInfo?.label} đã chọn?`
      );

      if (!result.isConfirmed) {
        return;
      }

      this.selectedAddedList = this.selectedAddedList.map((record) => {
        this.editableFields.forEach((field) => {
          record[field.field] = field.value;
        });
        return record;
      });
      await Promise.all(
        this.selectedAddedList.map((record) =>
          this.handleActiveOnEditRecord(record, true)
        )
      );
      successToast(
        `Cập nhật thành công ${this.selectedAddedList.length} ${this.appInfo.label}!`,
        "top"
      );
      this.showEditModal = false;
      this.selectedAddedList = [];
    },
    isRecordOnEdit(record) {
      return record?.id == this.currentRecord?.id;
    },
    isBooleanData(data) {
      return typeof data === "boolean";
    },
    isEditableField(fieldName) {
      const index = this.editableFields.findIndex(
        (field) => field.field == fieldName
      );
      return index != -1;
    },
    getEditableField(fieldName) {
      const index = this.editableFields.findIndex(
        (field) => field.field == fieldName
      );
      return this.editableFields[index];
    },
    startDrag(item, index, $e) {
      $e.dataTransfer.setData("index", index);
    },
    handleDrop(item, index, $e) {
      const indexDrag = $e.dataTransfer.getData("index");
      this.swapAttribute(index, indexDrag);
    },
    //Action-attribute
    swapAttribute(index1, index2) {
      swapArr(this.listFullAttributes, index1, index2);
    },
    async handleExportExcel() {
      const columns = this.listExportAttributes.map((attr) => attr.path);
      const columnsJson = JSON.stringify(columns);
      const customColumnsJson = JSON.stringify(this.customExportColumns);
      const exportUrl =
        this.exportApi +
        "?columns=" +
        columnsJson +
        "&custom_columns=" +
        customColumnsJson +
        "&export_file_name=" +
        this.exportFileName;
      const token = await getAccessToken();
      this.downloadWithAuth(this.exportFileName, exportUrl, token);
    },
    async downloadWithAuth(filename, url, token) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            // token đã kèm sẵn tiền tố "Bearer " từ getAccessToken() (giống
            // các API khác dùng Authorization: token) — không thêm "Bearer" nữa.
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`);
        }

        const disposition = response.headers.get("Content-Disposition");
        if (disposition && disposition.includes("filename=")) {
          const matches = disposition.match(
            /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/
          );
          if (matches) {
            filename = decodeURIComponent(matches[1] || matches[2]);
          }
        }
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);

        const pom = document.createElement("a");
        pom.href = href;
        pom.download = filename;
        document.body.appendChild(pom);
        pom.click();

        // Cleanup
        document.body.removeChild(pom);
        URL.revokeObjectURL(href);
      } catch (error) {
        console.error("Download error:", error);
      }
    },
    handleAddNewExportCustomColumn() {
      this.customExportColumns.push({ ...this.customExportData });
    },
    handleRemoveExportCustomColumn(index) {
      this.customExportColumns.splice(index, 1);
    },
  },
  watch: {
    addedData: function (value) {
      this.$emit("update:modelValue", value);
    },
  },
};
</script>

<style scoped>
.ml-auto {
  margin-left: auto;
}

.no-select {
  user-select: none;
  -webkit-user-select: none;
  /* Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
}
</style>
