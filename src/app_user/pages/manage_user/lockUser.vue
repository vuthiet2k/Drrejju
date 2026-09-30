<script setup>

import { reactive, watch } from "vue";
import { useUserStore } from "./userStore.js"

const userStore = useUserStore()

const userToLock = reactive({
  username: "",
  is_baned: ""
})

watch(userStore.currentUser, () => {
  const currentUser = userStore.currentUser.value
  userToLock.username = currentUser.username
  userToLock.last_name = currentUser.last_name
  userToLock.first_name = currentUser.first_name
  userToLock.photoUrl = currentUser.photo != "/media/null" ? currentUser.photo : require('@/assets/images/users/user-dummy-img.jpg')
  userToLock.photo = currentUser.photo
  userToLock.username = currentUser.username
  userToLock.is_baned = currentUser?.is_baned
})

watch(userToLock, () => {
  userStore.userToLock.value = userToLock
})

</script>
<template>
  <form action="#">
    <button class="d-none" type="reset" name="reset"></button>
    <b-row class="g-0 m-2">
      <b-col xl="12">
        <b-row>
          <b-col class="mb-3" lg="12">
            <button class="accordion-button p-2 bg-head-title" type="button" data-bs-toggle="collapse"
              data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
              aria-controls="accor_iconExamplecollapse1">
              THÔNG TIN NGƯỜI DÙNG
            </button>
          </b-col>
          <b-col lg="6">
            <!-- Họ đệm -->
            <b-row>
              <b-col lg="6" class="mb-3">
                <label for="fnameInput" class="form-label mb-1">Họ đệm </label>
                <input type="text" class="form-control" id="fnameInput" placeholder="Nhập họ và tên đệm" name="first_name"
                  v-model="userToLock.first_name" disabled />
              </b-col>
              <b-col lg="6" class="mb-3">
                <!-- Tên -->
                <label for="lnameInput" class="form-label mb-1">Tên</label>
                <input type="text" class="form-control" id="lnameInput" placeholder="Nhập tên" name="last_name"
                  v-model="userToLock.last_name" disabled />
              </b-col>
            </b-row>
            <!-- Tên tài khoản -->
            <div class="mb-3">
              <label class="form-label mb-1">
                Tài khoản
              </label>
              <input type="text" class="form-control" placeholder="Nhập tên tài khoản" name="username"
                v-model="userToLock.username" disabled />
            </div>
            <!-- Trạng thái -->
            <div>
              <label for="isDefaultMapInput" class="form-label mb-1">Trạng thái <span
                  class="text-danger">*</span></label><br>
              <div class="form-check form-switch mt-1 ms-2">
                <input class="form-check-input fs-15" type="checkbox" role="switch" id="isDefaultMapInput"
                  v-model="userToLock.is_baned">
                <p v-if="userToLock.is_baned">Tài khoản đang bị khóa</p>
                <p v-else>Tài khoản đang hoạt động</p>
              </div>
            </div>
          </b-col>
          <!-- Ảnh -->
          <b-col lg="6">
            <label for="formFileLogoInput" class="form-label">Ảnh đại diện</label>
            <div class="img-upload-slot">
              <div class="img-slot">
                <img class="img-custom" :src="userToLock.photoUrl" v-if="userToLock.photo">
                <div class="img-custom" v-else></div>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </form>
</template>
<style scoped>
.bg-head-title {
  background-color: #DBE4FF;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}


.img-upload-slot {
  display: grid;
  place-items: center;
}

.label-upload-img {
  position: absolute;
  display: grid;
  padding: 10px;
  border-radius: 50%;
  border: 1px solid #393737;
  background: #d5d5d55c;
  color: #393737;
}

.img-slot {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem;
  background-color: var(--vz-body-bg);
  border: 1px solid var(--vz-border-color);
  border-radius: 0.25rem;
}

.img-custom {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>