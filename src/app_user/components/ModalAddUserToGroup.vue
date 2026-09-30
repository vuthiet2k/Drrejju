<script setup>
import { defineProps, defineEmits, ref, reactive, watch } from "vue";
import { getImagePath } from "@/helpers/utils/images.js";
import API from "@/helpers/api/useAxios.js";
import PaginationUI from "@/app_manage_dynamic_api/components/paging/PaginationUI.vue";
import { useGroupStore } from "../pages/manage_group/groupStore";
import Modal from "@/base/components/dtwinUI/Modal.vue";
import { debounce } from "lodash";
import { base64Encode } from "@/base/common/common";
import Image from "@/base/components/image/Image.vue";

const emit = defineEmits(["update:modelValue"]);
const groupStore = useGroupStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  handleAddUserToGroup: {},
  type: {
    type: String,
    default: "add",
  },
});

const dataView = reactive({
  current_page_number: 0,
  total_pages: 0,
});

const usersCanAddToGroup = ref([]);
const textSearch = ref("");
const loadAPI = (page = 1) => {
  switch (props.type) {
    case "add":
      var FILTER = textSearch.value
        ? `&filter=${base64Encode(
            `[["first_name","unaccent_word_icontains","${textSearch.value}"], ["or_username","unaccent_word_icontains","${textSearch.value}"]]`
          )}`
        : "";
      API()
        .get(`user/?per_page=10&page=${page}${FILTER}`)
        .then((data) => {
          dataView.current_page_number = data?.current_page_number;
          dataView.total_pages = data?.total_pages;
          usersCanAddToGroup.value = data["results"];

          usersCanAddToGroup.value.forEach((user) => {
            user.selected = false;
          });
        });
      break;
    case "edit":
      if (!groupStore.currentGroup.value.id) break;
      API()
        .get(
          `group/${groupStore.currentGroup.value.id}/users-can-add-to-group/?per_page=10&page=${page}&search=${textSearch.value}`
        )
        .then((data) => {
          dataView.current_page_number = data?.current_page_number;
          dataView.total_pages = data?.total_pages;
          usersCanAddToGroup.value = data["results"];

          usersCanAddToGroup.value.forEach((user) => {
            user.selected = false;
          });
        });
      break;
  }
};
if (props.type != "edit") {
  loadAPI();
}
const handleChangePagination = (page) => {
  loadAPI(page);
};
const handleCloseModal = () => {
  emit("update:modelValue", false);
};

const handleKeydownSearch = debounce(() => {
  loadAPI(1);
}, 500);
watch(groupStore.currentGroup, () => {
  API()
    .get(
      `group/${
        groupStore.currentGroup.value.id
      }/users-can-add-to-group/?per_page=10&page=${1}`
    )
    .then((data) => {
      dataView.current_page_number = data?.current_page_number;
      dataView.total_pages = data?.total_pages;
      usersCanAddToGroup.value = data["results"];

      usersCanAddToGroup.value.forEach((user) => {
        user.selected = false;
      });
    });
});
</script>

<template>
  <Modal
    :modelValue="props.modelValue"
    :id="`add__user--modal-${props.type}`"
    hide-footer
    title="Thêm thành viên"
    class="v-modal-custom"
    @cancel="handleCloseModal"
  >
    <form action="javascript:void(0);">
      <b-row class="g-0 m-2">
        <b-col lg="12"
          ><div class="search-box w-100">
            <div class="form-control d-flex flex-wrap gap-1">
              <i class="ri-search-line search-icon"></i>
              <input
                v-model="textSearch"
                @keydown="handleKeydownSearch"
                type="text"
                class="flex-1 border-0 bg-transparent input__no-border"
                placeholder="Tìm kiếm"
              />
              <span
                class="position-absolute cursor-pointer fs-20 text-muted mdi mdi-close-circle search-widget-icon search-widget-icon-close"
                style="
                  right: 4px;
                  top: 50%;
                  transform: translateY(-50%);
                  display: none;
                "
              ></span>
            </div>
          </div>
          <!-- Striped Rows -->
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Chọn</th>
                <th scope="col">Avatar</th>
                <th scope="col">Tên tài khoản</th>
                <th scope="col">Tên người dùng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersCanAddToGroup" :key="user.id">
                <th scope="row" :for="`checkboxAddUser_${user.id}`">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="user.selected"
                      :id="`checkboxAddUser_${user.id}`"
                    />
                  </div>
                </th>
                <td>
                  <span class="d-flex align-items-center">
                    <Image
                      fallback="user"
                      class="rounded-circle header-profile-user"
                      :src="getImagePath(user.photo)"
                      alt="Header Avatar"
                    />
                  </span>
                </td>
                <td v-html="user.username"></td>
                <td v-html="`${user.first_name} ${user.last_name}`"></td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-between align-items-center pb-2">
            <div></div>
            <PaginationUI
              @change="handleChangePagination"
              :current-page="dataView.current_page_number"
              :page-size="dataView.total_pages"
            ></PaginationUI>
          </div>
        </b-col>
        <b-col lg="12">
          <div class="hstack gap-2 justify-content-end">
            <b-button type="button" variant="light" @click="handleCloseModal">
              Đóng</b-button
            >
            <b-button
              type="button"
              variant="primary"
              @click="
                () => {
                  props.handleAddUserToGroup(usersCanAddToGroup);
                  handleCloseModal();
                }
              "
              >Thêm</b-button
            >
          </div>
        </b-col>
      </b-row>
    </form>
  </Modal>
</template>
