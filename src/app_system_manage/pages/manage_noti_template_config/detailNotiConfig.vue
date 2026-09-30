<script setup>
import { reactive, watch } from "vue";
import { useMailConfigStore } from "./mailConfigStore.js"

const mailConfigStore = useMailConfigStore()

const mailConfigToEdit = reactive({
    name: "",
    title: "",
    content: "",
    file_attachment: "",
    is_default_template: false
})


watch(mailConfigStore.currentMailConfig, () => {
    const currentMailConfig = mailConfigStore.currentMailConfig.value
    mailConfigToEdit.name = currentMailConfig.name
    mailConfigToEdit.title = currentMailConfig.title
    mailConfigToEdit.content = currentMailConfig.content
    mailConfigToEdit.is_default_template = currentMailConfig.is_default_template == 'Không sử dụng' ? false : true
})

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
                        <label for="nameSystemConfigInput" class="form-label mb-1">Tên cấu hình</label>
                        <input type="text" class="form-control" id="nameSystemConfigInput" placeholder="Nhập tên cấu hình"
                            v-model="mailConfigToEdit.name" disabled />
                    </b-col>
                    <b-col lg="12" class="mb-3">
                        <label for="titleSystemConfigInput" class="form-label mb-1">Tiêu đề</label>
                        <input type="text" class="form-control" id="titleSystemConfigInput" placeholder="Nhập tiêu đề"
                            v-model="mailConfigToEdit.title" disabled />
                    </b-col>
                    <b-col lg="12" class="mb-3">
                        <label for="bodySystemConfigInput" class="form-label mb-1">Nội dun</label>
                        <textarea type="text" class="form-control" id="bodySystemConfigInput" placeholder="Nhập nội dung"
                            v-model="mailConfigToEdit.content" disabled></textarea>
                    </b-col>
                    <b-col lg="6" class="mb-3">
                        <label for="defaultSystemConfigInput" class="form-label mb-1">Đặt mặc định</label><br>
                        <div class="form-check form-switch">
                            <input class="form-check-input fs-15" type="checkbox" role="switch"
                                id="defaultSystemConfigInput" v-model="mailConfigToEdit.is_default_template" disabled>
                            <p v-if="mailConfigToEdit.is_default_template">Bật</p>
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