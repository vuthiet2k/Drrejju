<script setup>
// import DemoMange from '../../app_manage_dynamic_api/pages/DemoMange.vue';
import { defineProps, provide, ref } from "vue";
import classManageData from "@/app_manage_dynamic_api/hook/state/manage_data.js";
import Layout from "@/app_manage_dynamic_api/layout/main.vue";
import LayoutDemo from "@/app_manage_dynamic_api/layout/LayoutDemo.vue";
import OffcanvasUser from "./Offcanvas.vue";

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
    default: "NHẬT KÝ",
  },
  sourceApi: {
    type: String,
    default: "log-auth",
  },
});

const record_target = ref(null)
const manage_data = new classManageData(`${props.sourceApi}`);
provide("source-api", props.sourceApi);
provide("manage-data", manage_data);
provide("record-target", record_target);

const handleClickDetail = ($event) => {
  const item = getValueItem($event)
  record_target.value = item.id
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
    <!-- <DemoMange sourceApi="role" nameKCN="Vai trò"></DemoMange> -->
    <Layout :address="address" :items="address.details" chooseMenu="ban-do" :slug="props.slug">
    <LayoutDemo toolbarId="Log">
      <template v-slot:actions-toolbar>
        <button class="btn btn-light d-flex" @click="handleClickTest" type="button">
          <!-- <i class="align-bottom me-2"></i> -->
          custom
        </button>
      </template>
      <template v-slot:actions-field>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasview-log" @click="handleClickDetail"
            aria-controls="offcanvasview-log">
            <i class="ri-eye-fill align-bottom me-2 text-muted"></i>
            Xem chi tiết
          </div>
        </li>
        <!-- <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasupdate-role"
            aria-controls="offcanvasupdate-role">
            <i class="ri-pencil-fill align-bottom me-2 text-muted"></i>
            Chỉnh sửa
          </div>
        </li>
        <li>
          <div class="dropdown-item text-danger">
            <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
            Xóa
          </div>
        </li> -->
      </template>
    </LayoutDemo>
    <OffcanvasUser></OffcanvasUser>
  </Layout>
</template>