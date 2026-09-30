<script setup>
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
import { reactive, inject, watch } from "vue";
import http from "@/helpers/api/axiosHttp";
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";


const source_api = inject("source-api");
const record_target = inject("record-target");
const manage_data = inject('manage-data')

const form_backup_add = reactive({
  name: "",
  format: "zip",
  prefix: "LMHTX",
  password: "",
  path: "/media",
  is_main: false
})

const form_backup = reactive({
  name: "",
  format: "zip",
  prefix: "LMHTX",
  password: "",
  path: "/media",
  is_main: false
})

watch(record_target, () => {
  getDetail()
})

const getDetail = async () => {
  form_backup.name = ""
  form_backup.format = ""
  form_backup.prefix = ""
  form_backup.password = ""
  form_backup.path = ""
  form_backup.is_main = false

  const response = await http.get(`/${source_api}/${record_target.value}/`);
  if (response.status === 200) {
    form_backup.name = response.data.name
    form_backup.is_main = response.data.is_main === "Không sử dụng" ? false : true

    form_backup.format = response.data.config.default.FORMAT
    form_backup.prefix = response.data.config.default.PREFIX
    form_backup.password = response.data.config.default.PASSWORD
    form_backup.path = response.data.config.default.PATH
  }
}


const submitForm_add = async () => {
  const form_add = {
    'default': {
      'FORMAT': form_backup_add.format,
      'PREFIX': form_backup_add.prefix,
      'PASSWORD': form_backup_add.password,
      'PATH': form_backup_add.path,
    }
  }
  const formData = new FormData();
  formData.append('name', form_backup_add.name)
  formData.append('is_main', form_backup_add.is_main)
  formData.append('config', JSON.stringify(form_add))

  try {
    const response = await http.post(`/${source_api}/`, formData);
    if (response.status === 201) {
      resetForm("add")
      successToast("Đã thêm mới thành công!")
      manage_data.handleCallApi()
    }
    else {
      try {
        errorToast(response.data.message);
      } catch {
        errorToast("Thêm mới thất bại!")
      }
    }
  }
  catch (error) {
    try {
      errorToast(error.response.data.message);
    } catch (error) {
      errorToast("Thêm mới thất bại!")
    }
  }
}

const submitForm_update = async () => {
  const form_update = {
    'default': {
      'FORMAT': form_backup.format,
      'PREFIX': form_backup.prefix,
      'PASSWORD': form_backup.password,
      'PATH': form_backup.path,
    }
  }
  const formData = new FormData();
  formData.append('name', form_backup.name)
  formData.append('is_main', form_backup.is_main)
  formData.append('config', JSON.stringify(form_update))

  try {
    const response = await http.patch(`/${source_api}/${record_target.value}/`, formData);
    if (response.status === 200) {
      successToast("Đã chỉnh sửa thành công!")
      manage_data.handleCallApi()
    }
    else {
      try {
        errorToast(response.data.message);
      } catch {
        errorToast("Chỉnh sửa thất bại!")
      }
    }
  }
  catch (error) {
    try {
      errorToast(error.response.data.message);
    } catch (error) {
      errorToast("Thêm mới thất bại!")
    }
  }
}

function resetForm(id) {
  document.getElementById(id).reset()
  if (id == "add") {
    form_backup_add.name = ""
    form_backup_add.format = ""
    form_backup_add.prefix = ""
    form_backup_add.password = ""
    form_backup_add.path = ""
    form_backup_add.is_main = false
  }
  else {
    record_target.value = ""
    form_backup.name = ""
    form_backup.format = ""
    form_backup.suffix = ""
    form_backup.password = ""
    form_backup.path = ""
    form_backup.is_main = false
  }
}

function deleteRecord() {
  manage_data.handleDelete({ 'id': record_target.value });
}

</script>

<template>
  <LayoutRecord id="Backup" title="Thêm mới">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Thêm mới
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" @click="submitForm_add"><i
          class="ri-save-2-fill"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light" @click="resetForm('add')"><i
          class="las la-undo-alt"></i></button>
    </template>
    <template #body>
      <form action="#" id="add">
        <b-row class="g-0 m-2">
          <b-col xl="12">
            <b-row>
              <b-col class="mb-3 bg-head-title" lg="12">
                <button class="accordion-button p-2" type="button" data-bs-toggle="collapse"
                  data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                  aria-controls="accor_iconExamplecollapse1">
                  THÔNG TIN BACKUP
                </button>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="name" class="form-label">
                  Tên <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" id="name" v-model="form_backup_add.name"
                  :class="{ 'is-invalid': !form_backup_add.name }">
                <div class="invalid-feedback d-block" v-if="!form_backup_add.name">
                  Vui lòng nhập tên
                </div>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="format" class="form-label">
                  Định dạng <span class="text-danger">*</span>
                </label>
                <select name="Định dạng" id="format" class="form-select" v-model="form_backup_add.format"
                  :class="{ 'is-invalid': !form_backup_add.format }">
                  <option value="zip">Zip</option>
                  <option value="rar">Rar</option>
                </select>
                <div class="invalid-feedback d-block" v-if="!form_backup_add.format">
                  Vui lòng nhập định dạng
                </div>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="Prefix" class="form-label">
                  Prefix <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" id="Prefix" v-model="form_backup_add.prefix"
                  :class="{ 'is-invalid': !form_backup_add.prefix }">
                <div class="invalid-feedback d-block" v-if="!form_backup_add.prefix">
                  Vui lòng nhập prefix
                </div>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="path" class="form-label">
                  Đường dẫn <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" id="path" v-model="form_backup_add.path"
                  :class="{ 'is-invalid': !form_backup_add.path }" disabled>
                <div class="invalid-feedback d-block" v-if="!form_backup_add.path">
                  Vui lòng nhập đường dẫn
                </div>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="password" class="form-label">
                  Mật khẩu
                </label>
                <input type="text" class="form-control" id="password" v-model="form_backup_add.password">
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định</label>
                <div class="form-check form-switch ms-2">
                  <input class="form-check-input fs-15" type="checkbox" role="switch" id="isDefaultMapInput"
                    v-model="form_backup_add.is_main">
                  <p v-if="form_backup_add.is_main">Bật</p>
                  <p v-else>Tắt</p>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </form>
    </template>
  </LayoutRecord>
  <LayoutRecord id="update-backup" title="Chỉnh sửa">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Chỉnh sửa
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" @click="submitForm_update"><i
          class="ri-save-2-fill"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light" @click="resetForm('update')"><i
          class="las la-undo-alt"></i></button>
    </template>
    <template #body>
      <form action="#" id="update">
        <b-row class="g-0 m-2">
          <b-col xl="12">
            <b-row>
              <b-col class="mb-3 bg-head-title" lg="12">
                <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                  data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                  aria-controls="accor_iconExamplecollapse1">
                  THÔNG TIN BACKUP
                </button>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="name" class="form-label">
                  Tên
                </label>
                <input type="text" class="form-control" id="name" v-model="form_backup.name">
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="format" class="form-label">
                  Định dạng
                </label>
                <input type="text" class="form-control" id="format" v-model="form_backup.format">
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="Prefix" class="form-label">
                  Prefix
                </label>
                <input type="text" class="form-control" id="Prefix" v-model="form_backup.prefix">
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="path" class="form-label">
                  Đường dẫn
                </label>
                <input type="text" class="form-control" id="path" v-model="form_backup.path" disabled>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="password" class="form-label">
                  Mật khẩu
                </label>
                <input type="text" class="form-control" id="password" v-model="form_backup.password">
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định</label>
                <div class="form-check form-switch ms-2">
                  <input class="form-check-input fs-15" type="checkbox" role="switch" id="isDefaultMapInput"
                    v-model="form_backup.is_main">
                  <p v-if="form_backup.is_main">Bật</p>
                  <p v-else>Tắt</p>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </form>
    </template>
  </LayoutRecord>
  <LayoutRecord id="view-backup" title="Xem chi tiết">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Xem chi tiết
      </button> -->
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasupdate-backup" aria-controls="#offcanvasupdate-backup"><i
          class="las la-edit"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light" @click="deleteRecord"><i
          class="ri-delete-bin-5-line"></i></button>
    </template>
    <template #body>
      <form action="#" id="view">
        <b-row class="g-0 m-2">
          <b-col xl="12">
            <b-row>
              <b-col class="mb-3 bg-head-title" lg="12">
                <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                  data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                  aria-controls="accor_iconExamplecollapse1">
                  THÔNG TIN BACKUP
                </button>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="name" class="form-label">
                  Tên
                </label>
                <input type="text" class="form-control" id="name" v-model="form_backup.name" disabled>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="format" class="form-label">
                  Định dạng
                </label>
                <input type="text" class="form-control" id="format" v-model="form_backup.format" disabled>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="Prefix" class="form-label">
                  Prefix
                </label>
                <input type="text" class="form-control" id="Prefix" v-model="form_backup.prefix" disabled>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="path" class="form-label">
                  Đường dẫn
                </label>
                <input type="text" class="form-control" id="path" v-model="form_backup.path" disabled>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="password" class="form-label">
                  Mật khẩu
                </label>
                <input type="text" class="form-control" id="password" v-model="form_backup.password" disabled>
              </b-col>
              <b-col lg="6" class="mb-3">
                <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định</label>
                <div class="form-check form-switch ms-2">
                  <input class="form-check-input fs-15" type="checkbox" role="switch" id="isDefaultMapInput"
                    v-model="form_backup.is_main" disabled>
                  <p v-if="form_backup.is_main">Bật</p>
                  <p v-else>Tắt</p>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </form>
    </template>
  </LayoutRecord>
</template>

<style>
.pre-img {
  width: 200px;
  border: 1px solid #ababab;
}

.bg-head-title {
  background-color: #DBE4FF;
}
</style>