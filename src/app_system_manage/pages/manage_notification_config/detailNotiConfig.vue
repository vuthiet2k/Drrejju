<script setup>
import { reactive, ref, watch } from "vue";
import { useNotiConfigStore } from "./notiConfigStore.js"

const notiConfigStore = useNotiConfigStore()

const showPassword = ref(false)

const notiConfigToEdit = reactive({
    name: "",
    email: "",
    password: "",
    is_main: false
})


watch(notiConfigStore.currentNotiConfig, () => {
    const currentNotiConfig = notiConfigStore.currentNotiConfig.value
    notiConfigToEdit.name = currentNotiConfig.name
    notiConfigToEdit.email = currentNotiConfig.email
    notiConfigToEdit.password = currentNotiConfig.password
    // notiConfigToEdit.is_main = currentNotiConfig.is_main
    notiConfigToEdit.is_main = currentNotiConfig.is_main == 'Không sử dụng' ? false : true
    showPassword.value = false
})

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
                            v-model="notiConfigToEdit.name" autocomplete="new-name" disabled/>
                    </b-col>
                    <b-col lg="6" class="mb-2">
                        <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định <span
                                class="text-danger">*</span></label>
                        <div class="form-check form-switch">
                            <div style="left:-6px;top:0;position:absolute;width:30px;height:100%"></div>
                            <input class="form-check-input fs-15" type="checkbox" role="switch" id="isDefaultMapInput" v-model="notiConfigToEdit.is_main">
                            <p v-if="notiConfigToEdit.is_main">Bật</p>
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
                        <input type="text" class="form-control" id="manageUnitInput" placeholder="Nhập email thông báo" disabled
                            v-model="notiConfigToEdit.email" autocomplete="new-email-config" />
                    </b-col>
                    <b-col lg="6" class="mb-2">
                        <label for="passwordInput" class="form-label mb-1">
                            Mật khẩu <span class="text-danger">*</span>
                        </label>
                        <div class="position-relative auth-pass-inputgroup">
                            <input :type="showPassword ? 'text' : 'password'" class="form-control pe-5 password-input" disabled
                                placeholder="Nhập mật khẩu" name="password" id="passwordInput" autocomplete="new-password"
                                v-model="notiConfigToEdit.password" />
                            <button :class="{ 'me-3': !notiConfigToEdit.password }" @click="showPassword = !showPassword"
                                tabindex="-1"
                                class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                                type="button" id="password-addon">
                                <i class="ri-eye-fill align-middle"></i>
                            </button>
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