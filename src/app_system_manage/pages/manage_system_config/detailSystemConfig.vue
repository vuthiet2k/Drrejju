<script setup>
import { reactive, watch } from "vue";
import { useSystemConfigStore } from "./systemConfigStore.js"
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue"

const systemConfigStore = useSystemConfigStore()

const obj = reactive({ ...systemConfigStore.baseObject })

watch(systemConfigStore.currentSystemConfig, () => {
    const currentSystemConfig = systemConfigStore.currentSystemConfig.value
    const specialFields = ['is_main']
    for (let [key, value] of Object.entries(currentSystemConfig)) {
        if (specialFields.includes(key)) {
            if (key == "is_main") obj.is_main = value == 'Không sử dụng' ? false : true
        }
        else {
            obj[key] = value
        }
    }
})
</script>
<template>
    <form action="#">
        <b-row class="g-3 p-2">
            <b-col xl="12">
                <b-row>
                    <!-- START THÔNG TIN CẤU HÌNH BẢN ĐỒ -->
                    <AccordionRecord title="THÔNG TIN CẤU HÌNH">
                        <b-row>

                            <b-col lg="6" class="mb-2">
                                <label for="nameSystemConfigInput" class="form-label mb-1">Tên cấu hình <span
                                        class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="nameSystemConfigInput" disabled
                                    placeholder="Nhập tên cấu hình" v-model="obj.name" autocomplete="new-name"
                                    :class="{ 'is-invalid': !obj.name }" />
                                <div class="invalid-feedback d-block" v-if="!obj.name">
                                    Vui lòng nhập tên cấu hình
                                </div>
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="isDefaultMapInput" class="form-label mb-1">Đặt mặc định <span
                                        class="text-danger">*</span></label>
                                <div class="form-check form-switch">
                                    <input class="form-check-input fs-15" disabled type="checkbox" role="switch"
                                        id="isDefaultMapInput" v-model="obj.is_main">
                                    <p v-if="obj.is_main">Bật</p>
                                    <p v-else>Tắt</p>
                                </div>
                            </b-col>
                        </b-row>
                    </AccordionRecord>
                    <!-- END THÔNG TIN CẤU HÌNH -->
                    <!-- START THÔNG TIN CẤU HÌNH BẢN ĐỒ -->
                    <AccordionRecord title="CẤU HÌNH CỔNG THÔNG TIN">
                        <b-row>
                            <b-col lg="12" class="mb-2">
                                <label for="formFileLogoInput_edit" class="form-label" v-if="obj.logo">Logo</label>
                                <label for="formFileLogoInput_edit" class="form-label" v-else>Logo (Hiện tại: Không có
                                    logo)</label>
                                <div class="img-upload-slot d-flex justify-content-center">
                                    <div class="img-slot img-logo">
                                        <img class="img-custom" :src="obj.logo"
                                            v-if="obj.logo && !preveiwLogo">
                                        <img class="img-custom" :src="preveiwLogo" v-else-if="preveiwLogo">
                                    </div>
                                </div>
                            </b-col>

                            <b-col lg="12" class="mb-2">
                                <label for="formFileBannerInput_edit" class="form-label"
                                    v-if="obj.banner">Banner</label>
                                <label for="formFileBannerInput_edit" class="form-label" v-else>Banner (Hiện tại: Không
                                    có
                                    banner)</label>
                                <div class="img-upload-slot">
                                    <div class="img-slot img-banner">
                                        <img class="img-custom" :src="obj.banner"
                                            v-if="obj.banner && !preveiwBanner">
                                        <img class="img-custom" :src="preveiwBanner" v-else-if="preveiwBanner">
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </AccordionRecord>
                    <AccordionRecord title="CẤU HÌNH DTWIN KEY">
                        <b-row>
                            <b-col lg="12" class="mb-2">
                                <label for="nameSystemConfigInput" class="form-label mb-1">DTWIN KEY</label>
                                <input type="text" class="form-control" id="nameSystemConfigInput"
                                    placeholder="Nhập dtwin key" v-model="obj.dtwin_key" disabled>
                            </b-col>
                        </b-row>
                    </AccordionRecord>
                    <AccordionRecord title="THÔNG TIN ĐƠN VỊ CHỦ QUẢN">
                        <b-row>
                            <b-col lg="6" class="mb-2">
                                <label for="manageUnitInput" class="form-label mb-1">Đơn vị chủ quản</label>
                                <input type="text" class="form-control" disabled id="manageUnitInput"
                                    placeholder="Nhập đơn vị chủ quản" v-model="obj.config.title_vn"
                                    autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="configTittleEn" class="form-label mb-1">Tên tiếng anh - Tên ngắn</label>
                                <input type="text" class="form-control" disabled id="configTittleEn"
                                    placeholder="Nhập tên tiếng anh - Tên ngắn" v-model="obj.config.title_en"
                                    autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="addressUnitInput" class="form-label mb-1">Địa chỉ</label>
                                <input type="text" class="form-control" disabled id="addressUnitInput"
                                    placeholder="Nhập địa chỉ đơn vị" v-model="obj.config.contact.address"
                                    autocomplete="new-address-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="configWebiste" class="form-label mb-1">Website</label>
                                <input type="text" class="form-control" disabled id="configWebiste"
                                    placeholder="Nhập website" v-model="obj.config.contact.website"
                                    autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="configWebiste" class="form-label mb-1">Thư điện tử (Email)</label>
                                <input type="text" class="form-control" disabled id="configWebiste"
                                    placeholder="Nhập email" v-model="obj.config.contact.email"
                                    autocomplete="new-manage-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="phoneUnitInput" class="form-label mb-1">Số điện thoại</label>
                                <input type="text" class="form-control" disabled id="phoneUnitInput"
                                    placeholder="Nhập số điện thoại đơn vị" v-model="obj.config.contact.phone"
                                    autocomplete="new-phone-unit" />
                            </b-col>
                            <b-col lg="6" class="mb-2">
                                <label for="faxUnitInput" class="form-label mb-1">Fax</label>
                                <input type="text" class="form-control" disabled id="faxUnitInput"
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

.label-upload-img {
    position: absolute;
    display: grid;
    padding: 10px;
    border-radius: 50%;
    border: 1px solid #ffffff;
    top: 45%;
    left: 34%;
    background: #d5d5d55c;
    color: white;
}

.img-logo {
    width: 125px !important;
    height: 125px !important;
}


.img-banner {
    width: 100% !important;
    height: 125px !important;
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

.img-custom {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>