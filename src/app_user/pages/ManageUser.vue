<script setup>
import FormManage from "@/base/components/form/builder/FormManage.vue";
import OffcanvasUser from "./manage_user/OffcanvasUser.vue";
import { useUserStore } from "./manage_user/userStore";
import Modal from "@/base/components/dtwinUI/Modal.vue";
import passUser from "@/base/components/user/passUser.vue";
import { ref } from "vue";

const userStore = useUserStore();
const selectedUserId = ref(null);
const isShowModal = ref(false);

const handleClickEditPassword = ($event) => {
  const item = getValueItem($event);
  if (item && item.id) {
    selectedUserId.value = item.id;
  }
  userStore.getUserDetail(item.id).then((res) => {
    userStore.currentUser.value = res;
  });
};

const handleClickEditActive = ($event) => {
  const item = getValueItem($event);
  userStore.getUserDetail(item.id).then((res) => {
    userStore.currentUser.value = res;
  });
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
  <FormManage :pageLayout="'none'" title="NGƯỜI DÙNG" sourceApi="user">
    <li v-b-modal.modal-pass-user__manager-user>
      <div class="dropdown-item" @click="handleClickEditPassword">
        <i class="ri-rotate-lock-fill align-bottom me-2 text-muted"></i>
        Đổi mật khẩu
      </div>
    </li>
    <li>
      <div
        class="dropdown-item"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvaslock-user"
        @click="handleClickEditActive"
        aria-controls="offcanvaslock-user"
      >
        <i class="ri-lock-line align-bottom me-2 text-muted"></i>
        Khóa/Mở khóa
      </div>
    </li>

    <OffcanvasUser></OffcanvasUser>
  </FormManage>
  <!-- Modal đổi mật khẩu -->
  <Modal
    :id="`modal-pass-user__manager-user`"
    v-model="isShowModal"
    size="xl"
    title="Đổi mật khẩu"
    hideFooter
  >
    <passUser
      :idUser="selectedUserId"
      @close="selectedUserId = null"
      @password-changed="
        () => {
          selectedUserId = null;
          isShowModal = false;
        }
      "
    />
  </Modal>
</template>
