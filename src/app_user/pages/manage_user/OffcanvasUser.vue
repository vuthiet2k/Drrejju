<script setup>
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
import { inject, ref } from "vue";
import { usePost } from "@/helpers/api/api.js";
import { useUserStore } from "./userStore.js";
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import lockUser from "./lockUser.vue";
const apiPath = "user";
const userStore = useUserStore();
const manage_data = inject("manage-data");

// Get list
const listRole = ref([]);

userStore.getListRole().then((data) => {
  listRole.value = data;
});

const handleClickReset = ($e, type = "add") => {
  if (type == "add") {
    let btnReset = $e.target.offsetParent.querySelector('button[name="reset"]');
    if (btnReset) {
      btnReset.click();
    } else {
      btnReset = $e.target.offsetParent.offsetParent.querySelector(
        'button[name="reset"]'
      );
      if (btnReset) {
        btnReset.click();
      } else {
        btnReset =
          $e.target.offsetParent.offsetParent.offsetParent.querySelector(
            'button[name="reset"]'
          );
        if (btnReset) {
          btnReset.click();
        }
      }
    }
  } else if (type == "update") {
    userStore.resetFromUpdate();
  } else if (type == "pass") {
    userStore.resetFromPass();
  } else if (type == "lock") {
    userStore.resetFromLock();
  }
};

function handleLockUser() {
  const userToLock = userStore.userToLock;
  const currentUser = userStore.currentUser;

  const formData = new FormData();
  formData.append("is_baned", userToLock.value.is_baned);

  try {
    usePost(apiPath + `/${currentUser.value.id}/ban-user`, formData).then(
      async (res) => {
        if (res.status == 200) {
          successToast("Thay đổi trạng thái thành công!");
          manage_data.handleCallApi();
        } else if (res.status == 403) {
          errorToast("Không có quyền thực hiện!");
        } else {
          const data = await res.json();
          errorToast(data.message);
        }
      }
    );
  } catch (error) {
    try {
      errorToast(error.response.data.message);
    } catch {
      errorToast("Thay đổi trạng thái thất bại!");
    }
  }
}
</script>

<template>
  <LayoutRecord id="lock-user" title="Khóa/Mở khóa tài khoản">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Khóa/Mở khóa tài khoản
      </button> -->
      <button
        type="button"
        class="btn btn-warning btn-icon waves-effect waves-light"
        @click="handleLockUser"
      >
        <i class="ri-save-2-fill"></i>
      </button>
      <button
        type="button"
        class="btn btn-danger btn-icon waves-effect waves-light"
        @click="($e) => handleClickReset($e, `lock`)"
      >
        <i class="las la-undo-alt"></i>
      </button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>

    <template #body>
      <form action="#">
        <lockUser></lockUser>
      </form>
    </template>
  </LayoutRecord>
</template>

<style scoped>
.bg-head-title {
  background-color: #dbe4ff;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}
</style>
