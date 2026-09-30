<script setup>
import { useMailConfigStore } from "./mailConfigStore.js"

const mailConfigStore = useMailConfigStore()

const mailConfigToAdd = mailConfigStore.mailConfigToAdd.value

const onFileChange = (e) => {
  try {
    const file = e.target.files[0];
    mailConfigToAdd.file_attachment = file
  } catch (error) {
    mailConfigToAdd.file_attachment = null
  }
};

</script>
<template>
    <form action="#">
        <button class="d-none" type="reset" name="reset"></button>
        <b-row class="g-0 m-2">
            <b-col xl="12">
                <b-row>
                    <b-col lg="12" class="mb-3">
                        <button class="accordion-button p-2 bg-head-title" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                            aria-controls="accor_iconExamplecollapse1">
                            THÔNG TIN CẤU HÌNH
                        </button>
                    </b-col>
                    <b-col lg="12" class="mb-3">
                        <label for="nameSystemConfigInput" class="form-label mb-1">Tên cấu hình <span
                                class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="nameSystemConfigInput" placeholder="Nhập tên cấu hình"
                            v-model="mailConfigToAdd.name" :class="{ 'is-invalid': !mailConfigToAdd.name }" />
                        <div class="invalid-feedback d-block" v-if="!mailConfigToAdd.name">
                            Vui lòng nhập tên cấu hình
                        </div>
                    </b-col>
                    <b-col lg="12" class="mb-3">
                        <label for="titleSystemConfigInput" class="form-label mb-1">Tiêu đề <span
                                class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="titleSystemConfigInput" placeholder="Nhập tiêu đề"
                            v-model="mailConfigToAdd.title" :class="{ 'is-invalid': !mailConfigToAdd.title }" />
                        <div class="invalid-feedback d-block" v-if="!mailConfigToAdd.title">
                            Vui lòng nhập tiêu đề
                        </div>
                    </b-col>
                    <b-col lg="12" class="mb-3">
                        <label for="bodySystemConfigInput" class="form-label mb-1">Nội dung <span
                                class="text-danger">*</span></label>
                        <textarea type="text" class="form-control" id="bodySystemConfigInput" placeholder="Nhập nội dung"
                            v-model="mailConfigToAdd.body" :class="{ 'is-invalid': !mailConfigToAdd.body }"></textarea>
                        <div class="invalid-feedback d-block" v-if="!mailConfigToAdd.body">
                            Vui lòng nhập nội dung
                        </div>
                    </b-col>
                    <b-col lg="6" class="mb-3">
                        <label for="fileSystemConfigInput" class="form-label mb-1">Tệp đính kèm</label>
                        <input type="file" class="form-control" id="fileSystemConfigInput" @change="onFileChange"/>
                    </b-col>
                    <b-col lg="6" class="mb-3">
                        <label for="defaultSystemConfigInput" class="form-label mb-1">Đặt mặc định</label><br>
                        <div class="form-check form-switch">
                            <input class="form-check-input fs-15" type="checkbox" role="switch"
                                id="defaultSystemConfigInput" v-model="mailConfigToAdd.is_default_template">
                            <p v-if="mailConfigToAdd.is_default_template">Bật</p>
                            <p v-else>Tắt</p>
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
</style>