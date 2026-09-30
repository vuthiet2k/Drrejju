<script setup>
import { ref } from "vue";
import { useNotiConfigStore } from "./notiConfigStore.js"

const notiConfigStore = useNotiConfigStore()

const showPassword = ref(false)

const notiConfigToAdd = notiConfigStore.notiConfigToAdd.value
</script>
<template>
    <form action="#">
        <button class="d-none" type="reset" name="reset"></button>
        <b-row class="g-3 p-2">
            <b-col xl="12">
                <b-row>
                    <!-- START THÔNG TIN CẤU HÌNH BẢN ĐỒ -->
                    <b-col lg="12" class="mb-2">
                        <button class="accordion-button p-2 bg-head-title" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                            aria-controls="accor_iconExamplecollapse1">
                            THÔNG TIN CẤU HÌNH
                        </button>
                    </b-col>
                    <b-col lg="6" class="mb-2">
                        <label for="nameSystemConfigInput" class="form-label mb-1">Tên cấu hình <span
                                class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="nameSystemConfigInput" placeholder="Nhập tên cấu hình"
                            v-model="notiConfigToAdd.name" autocomplete="new-name"
                            :class="{ 'is-invalid': !notiConfigToAdd.name }" />
                        <div class="invalid-feedback d-block" v-if="!notiConfigToAdd.name">
                            Vui lòng nhập tên cấu hình
                        </div>
                    </b-col>
                    <b-col lg="6" class="mb-2">
                        <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định<span
                                class="text-danger">*</span></label><br> 
                        <div class="form-check form-switch">
                            <input class="form-check-input fs-15" type="checkbox" role="switch" id="isDefaultMapInput" v-model="notiConfigToAdd.is_main">
                            <p v-if="notiConfigToAdd.is_main">Bật</p>
                            <p v-else>Tắt</p>
                        </div>
                    </b-col>
                    <!-- END THÔNG TIN CẤU HÌNH -->
                    <!-- START THÔNG TIN CẤU HÌNH BẢN ĐỒ -->
                    <b-col lg="12" class="mb-2">
                        <button class="accordion-button p-2 bg-head-title" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                            aria-controls="accor_iconExamplecollapse1">
                            CẤU HÌNH EMAIL THÔNG BÁO
                        </button>
                    </b-col>
                    <b-col lg="6" class="mb-2">
                        <label for="manageUnitInput" class="form-label mb-1">Email <span
                                class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="manageUnitInput" placeholder="Nhập email thông báo"
                            v-model="notiConfigToAdd.email" autocomplete="new-email-config"
                            :class="{ 'is-invalid': !notiConfigToAdd.email }" />

                        <div class="invalid-feedback d-block" v-if="!notiConfigToAdd.email">
                            Vui lòng nhập email
                        </div>
                    </b-col>
                    <b-col lg="6" class="mb-2">
                        <label for="passwordInput" class="form-label mb-1">
                            Mật khẩu <span class="text-danger">*</span>
                        </label>
                        <div class="position-relative auth-pass-inputgroup">
                            <input :type="showPassword ? 'text' : 'password'" class="form-control pe-5 password-input"
                                placeholder="Nhập mật khẩu" name="password" id="passwordInput" autocomplete="new-password"
                                v-model="notiConfigToAdd.password" :class="{ 'is-invalid': !notiConfigToAdd.password }" />
                            <button :class="{ 'me-3': !notiConfigToAdd.password }" @click="showPassword = !showPassword"
                                tabindex="-1"
                                class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                                type="button" id="password-addon">
                                <i class="ri-eye-fill align-middle"></i>
                            </button>
                        </div>
                        <div class="invalid-feedback d-block" v-if="!notiConfigToAdd.password">
                            Vui lòng nhập mật khẩu
                        </div>
                    </b-col>
                    <!-- END THÔNG TIN CẤU HÌNH -->
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