<script setup>
import { defineProps, provide, reactive } from "vue";
import classManageData from "../hook/state/manage_data.js";
import Layout from "../layout/main.vue";
import LayoutDemo from "../layout/LayoutDemo.vue";
import DemoRecord from "./DemoRecord.vue";

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
    default: "NGƯỜI DÙNG",
  },
  sourceApi: {
    type: String,
    default: "user",
  },
  param: {
    type: String,
    default: "",
  },
  toolbarId: {
    type: String,
    default: "add-user",
  },
});

const manage_data = new classManageData(`${props.sourceApi}`, props.param);
const action_target = reactive({
  endpoint: "",
  type: "add",
  data: {},
});

provide("manage-data", manage_data);
provide("source-api", props.sourceApi);
provide("action-target", action_target);

const handleClickDelete = ($event) => {
  const item = getValueItem($event);
  manage_data.handleDelete(item);
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
    :manageDynamic="true"
  >
    <LayoutDemo :toolbarId="props.toolbarId">
      <template v-slot:actions-feild>
        <li @click="handleClickDetail">
          <div
            class="dropdown-item"
            data-bs-toggle="offcanvas"
            :data-bs-target="'#offcanvas' + props.toolbarId"
            :aria-controls="'#offcanvas' + props.toolbarId"
          >
            <i class="ri-eye-fill align-bottom me-2 text-muted"></i>
            Xem chi tiết
          </div>
        </li>
        <li @click="handleClickEdit">
          <div
            class="dropdown-item"
            data-bs-toggle="offcanvas"
            :data-bs-target="'#offcanvas' + props.toolbarId"
            :aria-controls="'#offcanvas' + props.toolbarId"
          >
            <i class="ri-pencil-fill align-bottom me-2 text-muted"></i>
            Chỉnh sửa
          </div>
        </li>
        <li @click="($event) => handleClickDelete($event, props.toolbarId)">
          <div class="dropdown-item text-danger">
            <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
            Xóa
          </div>
        </li>
      </template>
    </LayoutDemo>
    <DemoRecord></DemoRecord>
  </Layout>
</template>
