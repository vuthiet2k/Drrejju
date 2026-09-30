<script>
import { useManageAppStore } from "@/app_myapp/pages/app_myapp_setting/store.js"
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue"
import { ConfigSystem } from "@/base/store/api/server_api";
import {
    SimpleBar
} from "simplebar-vue3";
import { CountTo } from "vue3-count-to";

import { SERVER_URL } from "@/helpers/utils/config_system.js"
import { useFetch } from "@/helpers/api/api.js";
export default {
    props: {
        app: {
            default: {
                is_public: false
            }
        },
    },
    data() {
        return {
            store: useManageAppStore(),
            systemConfig: ConfigSystem,
            isShowToken: false,
            totalUser: 0

        };
    },
    components: {
        SimpleBar,
        CountTo,
        AccordionRecord
    },
    watch: {
    },
    computed: {
        selectedApp() {
            return this.app
        },
        typeDtwinKey() {
            return this.isShowToken ? "text" : "password"
        },
        classIcon() {
            return this.isShowToken ? ['ri-eye-line'] : ['ri-eye-off-line']
        }
    },
    methods: {
        async getTotalUser() {
            await useFetch(SERVER_URL + '/api/user/?all').then(data => {
                this.totalUser = data.total_objects
            })
        },
        saveSystemConfig() {
            this.store.updateSystemConfig(this.systemConfig)
        },
        toggleTokenkey() {
            this.isShowToken = !this.isShowToken
        },
        handleChangeFile(event, type) {
            const uploadedFile = event.target.files[0];
            if (type == "logo") this.systemConfig.logo = uploadedFile
            else if (type == "banner") this.systemConfig.banner = uploadedFile
        }
    },
    async mounted() {
        this.getTotalUser()
    }
};
</script>

<template>
    <b-row class="mb-4">
        <div order="1" class="col-auto d-block d-lg-none">
            <button type="button" class="btn btn-soft-success btn-icon btn-sm fs-16 file-menu-btn">
                <i class="ri-menu-2-fill align-bottom"></i>
            </button>
        </div>
        <b-col order="3" order-sm="2" class="mt-3 mt-sm-0" sm>
            <h5 class="fw-semibold mb-0">Cài đặt chung</h5>
        </b-col>

        <!-- <b-col order="2" order-sm="3" class="col-auto ms-auto">
                <div class="hstack gap-2">
                    <button type="button" class="btn btn-soft-success waves-effect waves-light d-flex"
                        @click="saveSystemConfig">
                        <i class="ri-save-3-line"></i> &nbsp;
                        Lưu cài đặt
                    </button>
                    <button type="button" class="btn btn-soft-danger waves-effect waves-light d-flex">
                        <i class="ri-refresh-line"></i> &nbsp;
                        Làm mới
                    </button>
                </div>
            </b-col> -->
    </b-row>
    <SimpleBar style="max-height: calc(100vh - 206px);">

        <AccordionRecord title="THÔNG TIN CẤU HÌNH HỆ THỐNG">
            <form class="px-4 mx-n4 mb-3 row g-3 justify-content-center " autocomplete="off">
                <img class="rounded" alt="Ảnh logo" style="max-height: 120px; max-width: 120px" :src="systemConfig.logo"
                    data-holder-rendered="true">
                <img class="rounded" alt="Ảnh banner" style="max-height: 120px;" :src="systemConfig.banner"
                    data-holder-rendered="true">
            </form>
            <form class="px-4 mx-n4 mb-3 row g-3" autocomplete="off">
                <h5 class="fs-16 text-uppercase footer__title mb-0 pb-0">{{ systemConfig.config.title_vn }}
                </h5>
                <p>{{ systemConfig.config.title_en }}</p>
                <div class="col-md-6 col-sm-12">
                    <div class="card-body footer__content">
                        <p><i class="ri-map-pin-line me-1 align-bottom"></i> Địa chỉ: {{
                            systemConfig.config.contact.address }}</p>
                        <p><i class=" ri-phone-line me-1 align-bottom"></i>
                            Điện thoại: {{ systemConfig.config.contact.phone }}</p>
                        <p><i class="ri-printer-line me-1 align-bottom"></i>
                            Fax: {{ systemConfig.config.contact.fax }}</p>
                    </div>
                </div>
                <div class="col-md-6 col-sm-12">
                    <div class="card-body footer__content">
                        <p><i class="ri-mail-line me-1 align-bottom"></i> Email: {{ systemConfig.config.contact.email
                            }}</p>
                        <p><i class="mdi mdi-web me-1 align-bottom"></i> Website: {{ systemConfig.config.contact.website
                            }}</p>
                    </div>
                </div>
            </form>
        </AccordionRecord>

        <router-link class="d-flex align-items-center fw-bold mt-0 mb-2" to="/system/settings/system">
            &nbsp;
            <i class="ri-arrow-right-line fs-18"></i>
            &nbsp; Thiết lập cấu hình
        </router-link>
        <AccordionRecord title="THIẾT LẬP DTWIN KEY">
            <form class="px-4 mx-n4 mb-3 row g-3" autocomplete="off">
                <div class="col-md-6">
                    <div>
                        <label for="iconInput" class="form-label">DTWIN KEY</label>
                        <div class="form-icon">
                            <input :type="typeDtwinKey" class="form-control form-control-icon" id="iconInput"
                                v-model="systemConfig.dtwin_key" placeholder="">
                            <i :class="classIcon" @click="toggleTokenkey" class="cursor-pointer"></i>
                        </div>
                    </div>
                </div>
            </form>
        </AccordionRecord>
        <router-link class="d-flex align-items-center fw-bold mt-0 mb-2" to="/system/settings/system">
            &nbsp;
            <i class="ri-arrow-right-line fs-18"></i>
            &nbsp; Thiết lập DTWIN KEY
        </router-link>
        <AccordionRecord title="QUẢN LÝ NGƯỜI DÙNG">
            <div class="position-relative px-4 mx-n4 m3 d-flex align-items-center">
                <i class="ri-user-location-fill fs-18"></i> &nbsp;
                <b>
                    <count-to :startVal='0' :endVal='totalUser' :duration='800'></count-to>
                    Người dùng đang hoạt động
                </b>
            </div>
        </AccordionRecord>
        <router-link class="d-flex align-items-center fw-bold mb-3" to="/manage/user">
            &nbsp;
            <i class="ri-arrow-right-line fs-18"></i>
            &nbsp; Quản lý người dùng
        </router-link>
    </SimpleBar>
</template>