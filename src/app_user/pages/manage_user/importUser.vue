<script setup>
import { ref, inject } from "vue";
import { usePost } from "@/helpers/api/api.js"
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import { useUserStore } from "./userStore.js"
import API from "@/app_manage_dynamic_api/helper/api/useAxios.js";
import { createObjectFile } from '@/app_manage_dynamic_api/common/common.js'


const manage_data = inject('manage-data')
const userStore = useUserStore()

const file_input = ref(null)
const upload_status = ref(false)
const res_data = ref(null)
const listRole = ref([])


userStore.getListRole().then(data => {
  listRole.value = data
})

const onChangeFile = ($e) => {
  let file = $e.target.files[0];
  file_input.value = file
}

function getRoleName(id) {
  for (let i = 0; i < listRole.value.length; i++) {
    if (listRole.value[i].id == id) {
      return listRole.value[i].name
    }
  }
}

async function handleClickUpload() {
  const formData = new FormData()
  if (file_input.value) {
    formData.append('file', file_input.value)
  }
  else return;

  try {
    usePost('/user/import-excel/', formData).then(async res => {
      if (res.status < 300 && res.status >= 200) {
        upload_status.value = true
        const data = await res.json()
        res_data.value = data

        document.querySelector('#steparrow-gen-info-tab').classList.remove('active')
        document.querySelector('#steparrow-gen-info-tab').classList.add('done')
        document.querySelector('#steparrow-description-info-tab').classList.add('active')

        document.querySelector('#steparrow-gen-info').classList.remove('show')
        document.querySelector('#steparrow-gen-info').classList.remove('active')
        document.querySelector('#steparrow-description-info').classList.add('show')
        document.querySelector('#steparrow-description-info').classList.add('active')
      }
    })
  }
  catch {
    errorToast('Tải lên file dữ liệu thất bại!')
  }
}

async function handleClickCreate() {
  const keys = Object.keys(res_data.value)
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] == 'valid') {
      for (let j = 0; j < res_data.value[keys[i]].length; j++) {
        const formData = new FormData()
        const keys_form = Object.keys(res_data.value[keys[i]][j].data)
        for (let k = 0; k < keys_form.length; k++) {
          formData.append(keys_form[k], res_data.value[keys[i]][j].data[keys_form[k]])
        }
        try {
          await usePost("user", formData).then(res => {
            if (res.status == 201) {
              successToast("Thêm người dùng thành công!")
            }
            else {
              errorToast("Thêm người dùng thất bại!")
            }
          })
        }
        catch {
          errorToast("Thêm người dùng thất bại!")
        }
      }
    }
  }
  manage_data.handleCallApi()
  document.querySelector('#steparrow-description-info-tab').classList.remove('active')
  document.querySelector('#steparrow-description-info-tab').classList.add('done')
  document.querySelector('#pills-experience-tab').classList.add('active')

  document.querySelector('#steparrow-description-info').classList.remove('show')
  document.querySelector('#steparrow-description-info').classList.remove('active')
  document.querySelector('#pills-experience').classList.add('show')
  document.querySelector('#pills-experience').classList.add('active')
}

function previousTab() {
  document.querySelector('#steparrow-gen-info-tab').classList.add('active')
  document.querySelector('#steparrow-gen-info-tab').classList.remove('done')
  document.querySelector('#steparrow-description-info-tab').classList.remove('active')

  document.querySelector('#steparrow-gen-info').classList.add('show')
  document.querySelector('#steparrow-gen-info').classList.add('active')
  document.querySelector('#steparrow-description-info').classList.remove('show')
  document.querySelector('#steparrow-description-info').classList.remove('active')
}

function createNew() {
  file_input.value = null
  document.querySelector('#fileImport').value = null

  document.querySelector('#steparrow-gen-info-tab').classList.add('active')
  document.querySelector('#steparrow-gen-info-tab').classList.add('done')
  document.querySelector('#steparrow-description-info-tab').classList.remove('done')
  document.querySelector('#pills-experience-tab').classList.remove('active')

  document.querySelector('#pills-experience').classList.remove('show')
  document.querySelector('#pills-experience').classList.remove('active')
  document.querySelector('#steparrow-gen-info').classList.add('show')
  document.querySelector('#steparrow-gen-info').classList.add('active')
}

async function downloadFile() {
  try {
    const response = await API().get(`/user/export-excel/?user_ids=none`, 'arraybuffer');
    createObjectFile(response, "UserTemplate.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;")
  }
  catch {
    errorToast("Lỗi tải xuống!")
  }
}

</script>
<template>
  <form action="#">
    <button class="d-none" type="reset" name="reset"></button>
    <b-row class="g-0 m-2">
      <b-col xl="12">
        <b-row>
          <div class="step-arrow-nav mb-4">
            <ul class="nav nav-pills custom-nav nav-justified" role="tablist">
              <li class="nav-item" role="presentation">
                <b-button variant="link" class="nav-link active" id="steparrow-gen-info-tab" data-bs-toggle="pill"
                  data-bs-target="#steparrow-gen-info" type="button" role="tab" aria-controls="steparrow-gen-info"
                  aria-selected="true">Tải lên</b-button>
              </li>
              <li class="nav-item" role="presentation">
                <b-button variant="link" class="nav-link" id="steparrow-description-info-tab" data-bs-toggle="pill"
                  data-bs-target="#steparrow-description-info" type="button" role="tab"
                  aria-controls="steparrow-description-info" aria-selected="false">Kiểm tra</b-button>
              </li>
              <li class="nav-item" role="presentation">
                <b-button variant="link" class="nav-link" id="pills-experience-tab" data-bs-toggle="pill"
                  data-bs-target="#pills-experience" type="button" role="tab" aria-controls="pills-experience"
                  aria-selected="false">Kết quả</b-button>
              </li>
            </ul>
            <div class="cover-nav-pills"></div>
          </div>

          <div class="tab-content">
            <div class="tab-pane fade show active" id="steparrow-gen-info" role="tabpanel"
              aria-labelledby="steparrow-gen-info-tab">
              <div>
                <b-col lg="12" class="mb-3">
                  <label for="fileImport" class="form-label mb-1">Tệp excel</label>
                  <input type="file" class="form-control" id="fileImport"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    @change="onChangeFile" />
                </b-col>
              </div>
              <div class="d-flex align-items-start gap-3 mt-4">
                <div>
                  <label class="form-label">Bạn có thể tải file mẫu
                    <a class="fw-semibold text-primary text-decoration-underline cursor-pointer" @click="downloadFile">Tại
                      đây</a>
                  </label>
                </div>
                <b-button type="button" variant="success" class="btn-label right ms-auto nexttab nexttab"
                  data-nexttab="steparrow-description-info" @click="handleClickUpload"><i
                    class="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>Tiếp
                  theo</b-button>
              </div>
            </div>

            <div class="tab-pane fade" id="steparrow-description-info" role="tabpanel"
              aria-labelledby="steparrow-description-info-tab">
              <div>
                <b-col lg="12">
                  <div class="table-responsive">
                    <table class="table table-bordered align-middle table-nowrap mb-0">
                      <thead class="table-light">
                        <tr>
                          <th scope="col">Tài khoản</th>
                          <th scope="col">Họ tên</th>
                          <th scope="col">Email</th>
                          <th scope="col">Vai trò</th>
                          <th scope="col">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="i in res_data?.valid" :key="i.data.username">
                          <td>{{ i.data.username }}</td>
                          <td>{{ i.data.first_name }} {{ i.data.last_name }}</td>
                          <td>{{ i.data.email }}</td>
                          <td>{{ getRoleName(i.data.user_role) }}</td>
                          <td><span class="badge bg-success">Hợp lệ</span></td>
                        </tr>
                        <tr v-for="i in res_data?.invalid" :key="i.data.username">
                          <td>{{ i.data.username }}</td>
                          <td>{{ i.data.first_name }} {{ i.data.last_name }}</td>
                          <td>{{ i.data.email }}</td>
                          <td>{{ getRoleName(i.data.user_role) }}</td>
                          <td><span class="badge bg-danger">Không hợp lệ</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </b-col>
              </div>
              <div class="d-flex align-items-start gap-3 mt-4">
                <b-button type="button" variant="light" class="btn-label previestab"
                  data-previous="steparrow-gen-info-tab" @click="previousTab"><i
                    class="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>Trước đó</b-button>
                <b-button type="button" variant="success" class="btn-label right ms-auto nexttab nexttab"
                  data-nexttab="pills-experience-tab" @click="handleClickCreate"><i
                    class="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>Đồng
                  ý</b-button>
              </div>
            </div>

            <div class="tab-pane fade" id="pills-experience" role="tabpanel">
              <div class="text-center">
                <div class="avatar-md mt-5 mb-4 mx-auto">
                  <div class="avatar-title bg-light text-success display-4 rounded-circle">
                    <i class="ri-checkbox-circle-fill"></i>
                  </div>
                </div>
                <h5>Tạo thành công</h5>
                <div class="d-flex align-items-start gap-3 mt-4">
                  <button type="button" class="btn btn-label btn-primary" @click="createNew"><i
                      class="mdi mdi-plus label-icon align-middle fs-16"></i>Tạo mới</button>
                </div>
              </div>
            </div>
          </div>
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

.nav-link.done {
  background-color: rgba(37, 160, 226, .05) !important;
  color: #25a0e2 !important;
}

.nav-link.active {
  background-color: rgb(0 166 255 / 10%) !important;
  color: #25a0e2 !important;
}

.cover-nav-pills {
  position: absolute;
  z-index: 100;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>