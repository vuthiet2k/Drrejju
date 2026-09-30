<script setup>

import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
// import { ref, watch } from "vue";
import { inject } from "vue";
import { usePost, usePatch } from "@/helpers/api/api.js"
// import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { useNotiConfigStore } from "./notiConfigStore.js"
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import addNotiConfig from "./addNotiConfig.vue"
import editNotiConfig from "./editNotiConfig.vue"
import detailNotiConfig from "./detailNotiConfig.vue"

const apiPath = "mail-config"
// const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'
const notiConfigStore = useNotiConfigStore()
const manage_data = inject('manage-data')

const successCode = [200, 201]

function handleAddNotiConfig() {
  const notiConfigToAdd = notiConfigStore.notiConfigToAdd.value

  if (notiConfigStore.validateNotiConfig(notiConfigToAdd)) {
    const formData = new FormData()

    formData.append("name", notiConfigToAdd.name)
    formData.append("email", notiConfigToAdd.email)
    formData.append("password", notiConfigToAdd.name)
    formData.append("is_main", notiConfigToAdd.is_main)
    usePost(apiPath, formData).then(res => {
      if (successCode.includes(res.status)) {
        successToast("Thêm cấu hình thành công!")
      }
      else {
        errorToast("Thêm thất bại, vui lòng thử lại sau!")
      }
      manage_data.handleCallApi()
    })
  }

}


function handleEditSystemConfig() {
  const notiConfigToEdit = notiConfigStore.notiConfigToEdit.value
  const currentNotiConfig = notiConfigStore.currentNotiConfig.value

  const formData = new FormData()
  formData.append("name", notiConfigToEdit.name)
  formData.append("email", notiConfigToEdit.email)
  formData.append("password", notiConfigToEdit.password)
  formData.append("is_main", notiConfigToEdit.is_main)
  usePatch(`${apiPath}/${currentNotiConfig.id}`, formData).then(res => {
    if (successCode.includes(res.status)) {
      successToast("Cập nhật cấu hình thành công!")
    }
    else {
      errorToast("Cập nhật thất bại, vui lòng thử lại sau!")
    }
    manage_data.handleCallApi()
  })

}

function handleDeleteUser() {
  manage_data.handleDelete(notiConfigStore.currentNotiConfig.value)
}

function handleClickEdit() {
  notiConfigStore.actionType = "edit"
}

const handleClickReset = ($e, type ="add") => {
  if (type == "add") {
    let btnReset = $e.target.offsetParent.querySelector('button[name="reset"]')
    if (btnReset) {
      btnReset.click()
    }
    else {
      btnReset = $e.target.offsetParent.offsetParent.querySelector('button[name="reset"]')
      if (btnReset) {
        btnReset.click()
      }
      else {
        btnReset = $e.target.offsetParent.offsetParent.offsetParent.querySelector('button[name="reset"]')
        if (btnReset) {
          btnReset.click()
        }
      }
    }
  }
  else {
    notiConfigStore.resetFromUpdate()
  }
}
</script>


<template>
  <LayoutRecord id="add-user" title="Thêm mới">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Thêm mới
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" @click="handleAddNotiConfig"><i
          class="ri-save-2-fill"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light"
        @click="$e => handleClickReset($e)"><i class="las la-undo-alt"></i></button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
    <template #body>
      <form action="#">
        <addNotiConfig></addNotiConfig>
      </form>
    </template>
  </LayoutRecord>
  <LayoutRecord id="update-user" title="Chỉnh sửa">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Chỉnh sửa
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" @click="handleEditSystemConfig"><i
          class="ri-save-2-fill"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light"
        @click="$e => handleClickReset($e, `update`)"><i class="las la-undo-alt"></i></button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
    <template #body>
      <form action="#">
        <editNotiConfig></editNotiConfig>
      </form>
    </template>
  </LayoutRecord>
  <LayoutRecord id="view-user" title="Xem chi tiết">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Xem chi tiết
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" data-bs-toggle="offcanvas"
        @click="handleClickEdit" data-bs-target="#offcanvasupdate-user" aria-controls="offcanvasupdate-user"><i
          class="las la-edit"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light" @click="handleDeleteUser"><i
          class="ri-delete-bin-5-line"></i></button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
    <template #body>
      <form action="#">
        <detailNotiConfig></detailNotiConfig>
      </form>
    </template>
  </LayoutRecord>
</template>
<style scoped>
.bg-head-title {
  background-color: #DBE4FF;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}
</style>