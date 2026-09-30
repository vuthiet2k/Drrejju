<script setup>
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
// import { ref, watch } from "vue";
import { inject } from "vue";
import { usePost, usePatch } from "@/helpers/api/api.js"
import { useMailConfigStore } from "./mailConfigStore.js"
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import addMailConfig from "./addMailConfig.vue"
import editMailConfig from "./editMailConfig.vue"
import detailMailConfig from "./detailMailConfig.vue"

const apiPath = "mail-template"
// const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'
const mailConfigStore = useMailConfigStore()
const manage_data = inject('manage-data')

const successCode = [200, 201]

function handleaddMailConfig() {
  const mailConfigToAdd = mailConfigStore.mailConfigToAdd.value

  if (mailConfigStore.validateMailConfig(mailConfigToAdd)) {
    const formData = new FormData()

    formData.append("name", mailConfigToAdd.name)
    formData.append("title", mailConfigToAdd.title)
    formData.append("body", mailConfigToAdd.body)
    formData.append("file_attachment", mailConfigToAdd.file_attachment)
    formData.append("is_default_template", mailConfigToAdd.is_default_template)

    usePost(apiPath, formData).then(res => {
      if (successCode.includes(res.status)) {
        successToast("Thêm cấu hình thành công!")
      }
      else {
        try {
          errorToast(res.data.message)
        } catch {
          errorToast("Thêm thất bại, vui lòng thử lại sau!")
        }
      }
      manage_data.handleCallApi()
    })
  }
}


function handleEditSystemConfig() {
  const mailConfigToEdit = mailConfigStore.mailConfigToEdit.value
  const currentNotiConfig = mailConfigStore.currentMailConfig.value

  const formData = new FormData()
  formData.append("name", mailConfigToEdit.name)
  formData.append("title", mailConfigToEdit.title)
  formData.append("body", mailConfigToEdit.body)
  formData.append("file_attachment", mailConfigToEdit.file_attachment)
  formData.append("is_default_template", mailConfigToEdit.is_default_template)

  usePatch(`${apiPath}/${currentNotiConfig.id}`, formData).then(res => {
    if (successCode.includes(res.status)) {
      successToast("Cập nhật cấu hình thành công!")
    }
    else {
      try {
        errorToast(res.data.message)
      } catch {
        errorToast("Cập nhật thất bại, vui lòng thử lại sau!")
      }
    }
    manage_data.handleCallApi()
  })

}

function handleDeleteUser() {
  manage_data.handleDelete(mailConfigStore.currentMailConfig.value)
}

function handleClickEdit() {
  mailConfigStore.actionType = "edit"
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
    mailConfigStore.resetFromUpdate()
  }
}
</script>


<template>
  <LayoutRecord id="add-user" title="Thêm mới">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Thêm mới
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" @click="handleaddMailConfig"><i
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
        <addMailConfig></addMailConfig>
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
        <editMailConfig></editMailConfig>
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
        <detailMailConfig></detailMailConfig>
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