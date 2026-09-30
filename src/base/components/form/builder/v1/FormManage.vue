<script setup>
import { defineProps, provide, ref } from "vue";
import classManageData from "@/app_manage_dynamic_api/hook/state/manage_data.js";
import Layout from "@/app_manage_dynamic_api/layout/main.vue";
import LayoutDemo from "@/app_manage_dynamic_api/layout/LayoutDemo.vue";
import FormOffcanvas from "./FormOffcanvas.vue";
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
const PROXY = BASE_URL + "/api";

const address = {
  title: props.title,
  details: [{ name: "Quản lý " + props.title, to: "#" }],
};
const props = defineProps({
  slug: {
    type: String,
    default: "sipm-base",
  },
  title: {
    type: String,
    default: "Vui lòng nhập tiêu đề trang",
  },
  sourceApi: {
    type: String,
    default: "manage-subject/subject",
  },
});

const manage_data = new classManageData(`${props.sourceApi}`);
const formUrl = PROXY + "/" + manage_data.CONSTPATH + "/form/";

provide("form-url", formUrl);
provide("manage-data", manage_data);
provide("source-api", props.sourceApi);

const handleClickDelete = ($event) => {
  const item = getValueItem($event);
  manage_data.handleDelete(item);
};

const formOffcanvas = ref(null);

const handleClickDetail = ($event) => {
  const item = getValueItem($event);
  if (formOffcanvas.value) {
    formOffcanvas.value.handleClickView(item?.id);
  }
};

const handleClickEdit = ($event) => {
  const item = getValueItem($event);
  if (formOffcanvas.value) {
    formOffcanvas.value.handleClickEdit(item?.id);
  }
};

const getValueItem = ($event) => {
  const target = $event.target.closest("ul");
  if (target) {
    const dataTarget = target.getAttribute("item");
    return JSON.parse(dataTarget);
  }
  return null;
};
</script>

<template>
  <Layout
    :address="address"
    :items="address.details"
    chooseMenu="ban-do"
    :slug="props.slug"
  >
    <LayoutDemo toolbarId="add">
      <template v-slot:actions-field>
        <slot></slot>
        <li>
          <div
            class="dropdown-item"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasview"
            @click="handleClickDetail"
            aria-controls="offcanvasview"
          >
            <i class="ri-eye-fill align-bottom me-2 text-muted"></i>
            Xem chi tiết
          </div>
        </li>
        <li>
          <div
            class="dropdown-item"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasupdate"
            @click="handleClickEdit"
            aria-controls="offcanvasupdate"
          >
            <i class="ri-pencil-fill align-bottom me-2 text-muted"></i>
            Chỉnh sửa
          </div>
        </li>
        <li>
          <div class="dropdown-item text-danger" @click="handleClickDelete">
            <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
            Xóa
          </div>
        </li>
      </template>
    </LayoutDemo>
    <FormOffcanvas ref="formOffcanvas"></FormOffcanvas>
  </Layout>
</template>
