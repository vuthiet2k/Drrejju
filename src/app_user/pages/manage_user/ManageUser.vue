<script setup>
import { defineProps, provide } from "vue";
import classManageData from "@/app_manage_dynamic_api/hook/state/manage_data.js";
import Layout from "@/app_manage_dynamic_api/layout/main.vue";
import LayoutDemo from "@/app_manage_dynamic_api/layout/LayoutDemo.vue";
import OffcanvasUser from "./OffcanvasUser.vue";
import { useUserStore } from "./userStore.js"

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
});

const manage_data = new classManageData(`${props.sourceApi}`);

const userStore = useUserStore()

provide("manage-data", manage_data);
provide("source-api", props.sourceApi);

const handleClickDelete = ($event) => {
  const item = getValueItem($event);
  manage_data.handleDelete(item);
}

const handleClickDetail = ($event) => {
  const item = getValueItem($event)
  userStore.getUserDetail(item.id).then(res => {
    userStore.currentUser.value = res
  })

}

const handleClickEdit = ($event) => {
  const item = getValueItem($event)
  userStore.getUserDetail(item.id).then(res => {
    userStore.currentUser.value = res
  })
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
      <template v-slot:toolbar-action>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasimport-user"
            aria-controls="offcanvasimport-user">
            <i class="las la-download me-2 text-muted"></i> Nhập từ file excel
          </div>
        </li>
      </template>
      <template v-slot:actions-field>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasview-user"
            @click="handleClickDetail" aria-controls="offcanvasview-user">
            <i class="ri-eye-fill align-bottom me-2 text-muted"></i>
            Xem chi tiết
          </div>
        </li>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasupdate-user"
            @click="handleClickEdit" aria-controls="offcanvasupdate-user">
            <i class="ri-pencil-fill align-bottom me-2 text-muted"></i>
            Chỉnh sửa
          </div>
        </li>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvaspass-user"
            @click="handleClickEdit" aria-controls="offcanvaspass-user">
            <i class="ri-rotate-lock-fill align-bottom me-2 text-muted"></i>
            Đổi mật khẩu
          </div>
        </li>
        <li>
          <div class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvaslock-user"
            @click="handleClickEdit" aria-controls="offcanvaslock-user">
            <i class="ri-lock-line align-bottom me-2 text-muted"></i>
            Khóa/Mở khóa
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
    <OffcanvasUser></OffcanvasUser>
  </Layout>
</template>
