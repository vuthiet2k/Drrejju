<script setup>

import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
// import { ref, watch } from "vue";
import { inject } from "vue";
import { usePost, usePatch } from "@/helpers/api/api.js"
// import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { useSystemConfigStore } from "./systemConfigStore.js"
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import addSystemConfig from "./addSystemConfig.vue"
import editSystemConfig from "./editSystemConfig.vue"
import detailSystemConfig from "./detailSystemConfig.vue"

const apiPath = "system-config"
// const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'
const systemConfigStore = useSystemConfigStore()
const manage_data = inject('manage-data')

const successCode = [200, 201]

function handleAddSystemConfig() {
  const systemConfigToAdd = systemConfigStore.systemConfigToAdd.value
  if (systemConfigStore.validateObj(systemConfigToAdd)) {
    const formData = systemConfigStore.getFormData(systemConfigToAdd)
    usePost(apiPath, formData).then(async res => {
      const statusCode = res.status
      const data = await res.json()
      if (successCode.includes(statusCode) && data?.id) {
        successToast("Thêm cấu hình thành công!")
      }
      else {
        errorToast(data?.message)
      }
      manage_data.handleCallApi()
    })
  }
}


function handleEditSystemConfig() {
  const systemConfigToEdit = systemConfigStore.systemConfigToEdit.value
  const currentSystemConfig = systemConfigStore.currentSystemConfig.value
  if (systemConfigStore.validateObj(systemConfigToEdit)) {
    const formData = systemConfigStore.getFormData(systemConfigToEdit)
    usePatch(`${apiPath}/${currentSystemConfig.id}`, formData).then(async res => {
      const statusCode = res.status
      const data = await res.json()
      if (successCode.includes(statusCode) && data?.id) {
        successToast("Cập nhật cấu hình thành công!")
      }
      else {
        errorToast(data?.message)
      }
      manage_data.handleCallApi()
    })

  }
}

function handleDeleteUser() {
  manage_data.handleDelete(systemConfigStore.currentSystemConfig.value)
}

function handleClickEdit() {
  systemConfigStore.actionType = "edit"
}

const handleClickReset = ($e, type = "add") => {
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
    systemConfigStore.resetFromUpdate()
  }
}
</script>


<template>
  <LayoutRecord id="add-user" title="Thêm mới">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Thêm mới
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" @click="handleAddSystemConfig"><i
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
        <addSystemConfig></addSystemConfig>
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
        <editSystemConfig></editSystemConfig>
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
        <detailSystemConfig></detailSystemConfig>
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