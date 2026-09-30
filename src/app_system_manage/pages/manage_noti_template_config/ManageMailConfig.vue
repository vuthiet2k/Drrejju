<script setup>
import { defineProps, provide } from "vue";
import classManageData from "@/app_manage_dynamic_api/hook/state/manage_data.js";
import Layout from "@/app_manage_dynamic_api/layout/main.vue";
import LayoutDemo from "@/app_manage_dynamic_api/layout/LayoutDemo.vue";
import OffcanvasMailConfig from "./OffcanvasMailConfig.vue";
import { useMailConfigStore } from "./mailConfigStore.js"

const address = {
  title: props.nameKCN,
  details: [{ name: "Quản lý " + props.nameKCN, to: "#" }],
};
const props = defineProps({
  slug: {
    type: String,
    default: "sipm-base",
  },
  nameKCN: {
    type: String,
    default: "Cấu hình thông báo",
  },
  sourceApi: {
    type: String,
    default: "notification-template",
  },
});

const manage_data = new classManageData(`${props.sourceApi}`);

const mailConfigStore = useMailConfigStore()
const currentMailConfig = mailConfigStore.currentMailConfig

provide("manage-data", manage_data);
provide("source-api", props.sourceApi);
const handleClickTest = () => {
  alert("demo");
};

const handleClickDelete = ($event) => {
  const item = getValueItem($event)
  manage_data.handleDelete(item);
}

const handleClickDetail = ($event) => {
  const item = getValueItem($event)
  mailConfigStore.actionType = "detail"
  currentMailConfig.value = item
}

const handleClickEdit = ($event) => {
  const item = getValueItem($event)
  mailConfigStore.actionType = "edit"
  currentMailConfig.value = item
}

const getValueItem = ($event) => {
  const target = $event.target.closest("ul");
  if (target) {
    const dataTarget = target.getAttribute("item");
    return JSON.parse(dataTarget);
  }
  return null
}
</script>

<template>
  <Layout :address="address" :items="address.details" chooseMenu="ban-do" :slug="props.slug">
    <LayoutDemo>
      <template v-slot:actions-toolbar>
        <button class="btn btn-light d-flex" @click="handleClickTest" type="button">
          <!-- <i class="align-bottom me-2"></i> -->
          custom
        </button>
      </template>
      <template v-slot:actions-field>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasview-user" @click="handleClickDetail"
            aria-controls="offcanvasview-user">
            <i class="ri-eye-fill align-bottom me-2 text-muted"></i>
            Xem chi tiết
          </div>
        </li>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasupdate-user" @click="handleClickEdit"
            aria-controls="offcanvasupdate-user">
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
    <OffcanvasMailConfig></OffcanvasMailConfig>
  </Layout>
</template>
