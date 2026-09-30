<script setup>
import { ref } from "vue";
// import { useFetch } from "@/helpers/api/api.js"
// import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { useSystemConfigStore } from "./systemConfigStore.js"
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue"

const systemConfigStore = useSystemConfigStore()

const obj = systemConfigStore.systemConfigToAdd.value
const preveiwLogo = ref(null)
const preveiwBanner = ref(null)

const onChangeLogo = (e) => {
    try {
        const file = e.target.files[0];
        obj.logo = file

        const reader = new FileReader();
        reader.onload = (event) => {
            preveiwLogo.value = event.target.result;
        };
        reader.readAsDataURL(file);
    } catch (error) {
        preveiwLogo.value = null
        obj.logo = null
    }
}

const onChangeBanner = (e) => {
    try {
        const file = e.target.files[0];
        obj.banner = file

        const reader = new FileReader();
        reader.onload = (event) => {
            preveiwBanner.value = event.target.result;
        };
        reader.readAsDataURL(file);
    } catch (error) {
        preveiwBanner.value = null
        obj.banner = null
    }
}
</script>
<template>
    <form action="#">
        <button class="d-none" type="reset" name="reset"></button>
        <b-row class="g-3 p-2">
            <b-col xl="12">
                <b-row>
                    <AccordionRecord title="THÔNG TIN CẤU HÌNH">
                        <b-row>
                            <b-col lg="6" class="mb-2">
                                <label for="nameSystemConfigInput" class="form-label mb-1">Tên cấu hình <span
                                        class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="nameSystemConfigInput"
                                    placeholder="Nhập tên cấu hình" v-model="obj.name"
                                    autocomplete="new-name" :class="{ 'is-invalid': !obj.name }" />
                                <div class="invalid-feedback d-block" v-if="!obj.name">
                                    Vui lòng nhập tên cấu hình
                                </div>
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định<span
                                        class="text-danger">*</span></label><br>
                                <div class="form-check form-switch">
                                    <input class="form-check-input fs-15" type="checkbox" role="switch"
                                        id="isDefaultMapInput" v-model="obj.is_main">
                                    <p v-if="obj.is_main">Bật</p>
                                    <p v-else>Tắt</p>
                                </div>
                            </b-col>
                        </b-row>
                    </AccordionRecord>
                    <AccordionRecord title="CẤU HÌNH DTWIN KEY">
                        <b-row>
                            <b-col lg="12" class="mb-2">
                                <label for="nameSystemConfigInput" class="form-label mb-1">DTWIN KEY</label>
                                <input type="text" class="form-control" id="nameSystemConfigInput"
                                    placeholder="Nhập dtwin key" v-model="obj.dtwin_key"/>
                            </b-col>
                        </b-row>
                    </AccordionRecord>
                    <AccordionRecord title="CẤU HÌNH CỔNG THÔNG TIN">
                        <b-row>
                            <b-col lg="12" class="mb-2">
                                <label for="formFileLogoInput" class="form-label"
                                    v-if="obj.logo">Logo</label>
                                <label for="formFileLogoInput" class="form-label" v-else>Logo (Hiện tại: Không có
                                    logo)</label>
                                <div class="img-upload-slot">
                                    <div class="img-slot img-logo">
                                        <img class="img-custom" :src="preveiwLogo" v-if="preveiwLogo">
                                        <div class="img-custom" v-else></div>
                                    </div>
                                    <input class="form-control" type="file" id="formFileLogoInput"
                                        @change="onChangeLogo" style="display: none;">
                                    <label for="formFileLogoInput" class="label-upload-img"><i
                                            class="bx bx-camera fs-20"></i></label>
                                </div>
                            </b-col>

                            <b-col lg="12" class="mb-2">
                                <label for="formFileBannerInput" class="form-label" v-if="preveiwBanner">Banner</label>
                                <label for="formFileBannerInput" class="form-label" v-else>Banner (Hiện tại: Không có
                                    banner)</label>
                                <div class="img-upload-slot">
                                    <div class="img-slot img-banner">
                                        <img class="img-custom" :src="preveiwBanner" v-if="preveiwBanner">
                                        <div class="img-custom" v-else></div>
                                    </div>
                                    <input class="form-control" type="file" id="formFileBannerInput"
                                        @change="onChangeBanner" style="display: none;">
                                    <label for="formFileBannerInput" class="label-upload-img"><i
                                            class="bx bx-camera fs-20"></i></label>
                                </div>
                            </b-col>
                        </b-row>
                    </AccordionRecord>
                    <AccordionRecord title="THÔNG TIN ĐƠN VỊ CHỦ QUẢN">
                        <b-row>
                            <b-col lg="6" class="mb-2">
                                <label for="manageUnitInput" class="form-label mb-1">Đơn vị chủ quản</label>
                                <input type="text" class="form-control" id="manageUnitInput"
                                    placeholder="Nhập đơn vị chủ quản" v-model="obj.config.title_vn"
                                    autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="configTittleEn" class="form-label mb-1">Tên tiếng anh - Tên ngắn</label>
                                <input type="text" class="form-control" id="configTittleEn"
                                    placeholder="Nhập tên tiếng anh - Tên ngắn"
                                    v-model="obj.config.title_en" autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="addressUnitInput" class="form-label mb-1">Địa chỉ</label>
                                <input type="text" class="form-control" id="addressUnitInput"
                                    placeholder="Nhập địa chỉ đơn vị" v-model="obj.config.contact.address"
                                    autocomplete="new-address-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="configWebiste" class="form-label mb-1">Website</label>
                                <input type="text" class="form-control" id="configWebiste" placeholder="Nhập website"
                                    v-model="obj.config.contact.website" autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="configWebiste" class="form-label mb-1">Thư điện tử (Email)</label>
                                <input type="text" class="form-control" id="configWebiste" placeholder="Nhập email"
                                    v-model="obj.config.contact.email" autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="phoneUnitInput" class="form-label mb-1">Số điện thoại</label>
                                <input type="text" class="form-control" id="phoneUnitInput"
                                    placeholder="Nhập số điện thoại đơn vị"
                                    v-model="obj.config.contact.phone" autocomplete="new-phone-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="faxUnitInput" class="form-label mb-1">Fax</label>
                                <input type="text" class="form-control" id="faxUnitInput"
                                    placeholder="Nhập số fax của đơn vị" v-model="obj.config.contact.fax"
                                    autocomplete="new-fax-unit" />
                            </b-col>
                        </b-row>
                    </AccordionRecord>
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


.img-upload-slot {
    display: grid;
    place-items: center;
}

.label-upload-img {
    position: absolute;
    display: grid;
    padding: 10px;
    border-radius: 50%;
    border: 1px solid #ffffff;
    background: #d5d5d55c;
    color: white;
}

.img-slot {
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem;
    background-color: var(--vz-body-bg);
    border: 1px solid var(--vz-border-color);
    border-radius: 0.25rem;
}


.img-logo {
    width: 125px !important;
    height: 125px !important;
}


.img-banner {
    width: 100% !important;
    height: 125px !important;
}

.img-custom {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>