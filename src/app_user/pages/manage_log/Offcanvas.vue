<script setup>
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";
import { reactive, inject, watch } from "vue";
import http from "../../../helpers/api/axiosHttp";


const source_api = inject("source-api");
const record_target = inject("record-target");

const form_role = reactive({
  time: "",
  user: "",
  login: "",
  ip_address: "",
  country_code: "",
  status: "",
  platform: "",
  info_machine: ""
})

watch(record_target, () => {
  getDetail()
})

const getDetail = async () => {
  form_role.time = ""
  form_role.user = ""
  form_role.login = ""
  form_role.ip_address = ""
  form_role.country_code = ""
  form_role.status = ""
  form_role.platform = ""
  form_role.info_machine = ""

  const response = await http.get(`/${source_api}/${record_target.value}/`);
  if (response.status === 200) {
    const keys = Object.keys(form_role)
    for (let i = 0; i < keys.length; i++) {
      form_role[keys[i]] = response.data[keys[i]]
    }
  }
}
</script>

<template>
  <LayoutRecord id="view-log" title="Xem chi tiết">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Xem chi tiết
      </button> -->
      <!-- <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasCooperative-update" aria-controls="#offcanvasCooperative-update"><i
          class="las la-edit"></i></button> -->
      <!-- <button type="button" class="btn btn-danger btn-icon waves-effect waves-light" @click="deleteRecord"><i
          class="ri-delete-bin-5-line"></i></button> -->
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
    <template #body>
      <form action="#" id="view">
        <b-row class="g-3">
          <b-col xl="12">
            <b-row>
              <b-col class="mb-2 bg-head-title">
                <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                  data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                  aria-controls="accor_iconExamplecollapse1">
                  THÔNG TIN NHẬT KÝ
                </button>
              </b-col>
              <b-row class="ms-0">
                <b-col lg="6" class="mb-3">
                  <label for="name" class="form-label">
                    Người thực thi
                  </label>
                  <input type="text" class="form-control" id="name" v-model="form_role.user" disabled>
                </b-col>
                <b-col lg="6" class="mb-3">
                  <label for="description" class="form-label">
                    Thời gian thực thi
                  </label>
                  <input type="text" class="form-control" id="name" v-model="form_role.time" disabled>
                </b-col>
                <b-col lg="6" class="mb-3">
                  <label for="name" class="form-label">
                    Đăng nhập
                  </label>
                  <input type="text" class="form-control" id="name" value="Đúng" disabled v-if="form_role.login">
                  <input type="text" class="form-control" id="name" value="Sai" disabled v-else>
                </b-col>
                <b-col lg="6" class="mb-3">
                  <label for="description" class="form-label">
                    Trạng thái
                  </label>
                  <input type="text" class="form-control" id="name" value="Thành công" disabled v-if="form_role.status">
                  <input type="text" class="form-control" id="name" value="Thất bại" disabled v-else>
                </b-col>
              </b-row>
              <b-col class="mb-2 bg-head-title">
                <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                  data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                  aria-controls="accor_iconExamplecollapse1">
                  THÔNG TIN THIẾT BỊ
                </button>
              </b-col>
              <b-row class="ms-0">
                <b-col lg="6" class="mb-3">
                  <label for="description" class="form-label">
                    Mã vùng
                  </label>
                  <input type="text" class="form-control" id="name" v-model="form_role.country_code" disabled>
                </b-col>
                <b-col lg="6" class="mb-3">
                  <label for="description" class="form-label">
                    Địa chỉ IP
                  </label>
                  <input type="text" class="form-control" id="name" v-model="form_role.ip_address" disabled>
                </b-col>
                <b-col lg="12" class="mb-3">
                  <label for="description" class="form-label">
                    Nền tảng
                  </label>
                  <input type="text" class="form-control" id="name" v-model="form_role.platform" disabled>
                </b-col>
                <b-col lg="12" class="mb-3">
                  <label for="description" class="form-label">
                    Thiết bị
                  </label>
                  <textarea type="text" class="form-control" id="name" v-model="form_role.info_machine" disabled></textarea>
                </b-col>
              </b-row>
            </b-row>
          </b-col>
        </b-row>
      </form>
    </template>
  </LayoutRecord>
  <LayoutRecord id="Log" title="Thêm mới">
    <template #header>
      <!-- <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Thêm mới
      </button> -->
      <!-- <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasCooperative-update" aria-controls="#offcanvasCooperative-update"><i
          class="las la-edit"></i></button> -->
      <!-- <button type="button" class="btn btn-danger btn-icon waves-effect waves-light" @click="deleteRecord"><i
          class="ri-delete-bin-5-line"></i></button> -->
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
    <template #body>
    </template>
  </LayoutRecord>
</template>

<style>
.pre-img {
  width: 200px;
  border: 1px solid #ababab;
}
</style>