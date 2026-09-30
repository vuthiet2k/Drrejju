<script setup>
import { defineProps, ref, reactive } from "vue";
import Layout from "@/app_manage_dynamic_api/layout/main.vue";
import { fullApplications as applications, getListApplications } from "@/helpers/user/applications.js";
import { usePost, usePatch, useDelete } from "@/helpers/api/api.js"
import { successToast, errorToast } from "@/helpers/api/toastStyle";
import { useSwal } from "@/base/common/useSwal.js";
const { confirmDelete } = useSwal(); // confirmDelete không được export rời từ useSwal.js
import { getInstalledApp } from '@/base/store/api/server_api.js'

const address = {
    title: props.nameKCN,
    details: [{ name: "Quản lý " + props.nameKCN, to: "#" }],
};

const TYPES = ['Thêm', 'Cập nhật']
const showUpdateTypeApp = ref(false)

const apps = ref([])

const getListApp = async () => {
    await getInstalledApp().then(data => {
        apps.value = data?.results
    })
}
getListApp()
const typeApplication = reactive({
    id: '',
    name: '',
    apps: [],
    appsUpdate: [],
    actionType: 0  // Type 0: Thêm Group, Type 1: Sửa group
})
const props = defineProps({
    slug: {
        type: String,
        default: "sipm-base",
    },
    nameKCN: {
        type: String,
        default: "Cấu hình",
    },
    sourceApi: {
        type: String,
        default: "system-config",
    },
});

function compareArrays(arr1, arr2) {
    // Chuyển đổi các mảng thành chuỗi JSON và so sánh chúng
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
}

const toggleShowMenu = (actionType, type) => {
    typeApplication.actionType = actionType
    if (actionType == 1) {
        typeApplication.id = type?.id
        typeApplication.name = type?.title
        typeApplication.apps = type.listPage.map(app => app.id)
        typeApplication.appsUpdate = type.listPage.map(app => app.id)
    }
    else if (actionType == 0) {
        typeApplication.id = ''
        typeApplication.name = ''
        typeApplication.apps = []
        typeApplication.appsUpdate = []
    }
    showUpdateTypeApp.value = true
}

const UpdateTypeApplication = async () => {
    const formData = new FormData()            
    formData.append('name', typeApplication.name)

    const changeAppType = async (listApp, data, setNull) => {
        await Promise.all(listApp.map(async (app) => {
            const formData = new FormData();
            if (setNull) {
                formData.append('type', ""); // Sử dụng append thay vì gán trực tiếp
            }
            else {
                formData.append('type', data.id)
            }
            await usePatch('/app-installed/' + app + '/', formData);
        }));
        return true
    }
    if (!typeApplication.name.length) {
        errorToast("Vui lòng nhập tên nhóm!")
        return
    }
    if (typeApplication.actionType == 0 || !typeApplication.id ) {
        // Thêm type mới
        const resp = await usePost('/type-app/', formData)
        const data = await resp.json()
        if (typeApplication.appsUpdate.length) {
            const listApp = typeApplication.appsUpdate
            await changeAppType(listApp, data)
        }
    }
    else if (typeApplication.actionType == 1) {
        // Cập nhật lại type
        const resp = await usePatch('/type-app/' + typeApplication.id + '/', formData)
        const data = await resp.json()
        if (!compareArrays(typeApplication.apps, typeApplication.appsUpdate)) {
            // Nếu có sự khác biệt giữa 2 mảng thì tiến hành cập nhật lại app
            const originApps = typeApplication.apps
            const updateApps = typeApplication.appsUpdate
            const removeApps = originApps.filter(id => !updateApps.includes(id));
            const addApps = updateApps.filter(id => !originApps.includes(id));
            await changeAppType(removeApps, data, true)
            await changeAppType(addApps, data)
        }
    }
    await getListApplications()
    showUpdateTypeApp.value = !showUpdateTypeApp.value
    successToast(TYPES[typeApplication.actionType] + ` nhóm menu thành công!`)
}

const DeleteTypeApplication = async (type) => {
    const result = await confirmDelete(
        `Xác nhận xóa nhóm ${type.title}!`
    );

    if (!result.isConfirmed) {
        return;
    }
    
    const res = await useDelete('/type-app/' + type.id);
    
    if (res?.error) {
        errorToast("Xóa thất bại!");
        return;
    }
    
    successToast(`Xóa nhóm ${type.title} thành công!`);
    await getListApplications();
}

</script>

<template>
    <Teleport to="body">
        <b-modal v-model="showUpdateTypeApp" hide-footer center
            :title="TYPES[typeApplication.actionType] + ` nhóm menu`" class="v-modal-custom" size="lg">
            <form action="javascript:void(0);">
                <b-row>
                    <b-col lg="12" class="mb-3">
                        <input type="text" placeholder="Vui lòng nhập tên nhóm menu" class="form-control"
                            v-model="typeApplication.name">
                    </b-col>
                    <b-col lg="12" class="mb-3">
                        <!-- Base Example -->
                        <div class="form-check mb-2" v-for="(app, index) in apps" :key="index">
                            <input class="form-check-input" :value="app.id" type="checkbox" :id="`formCheck` + index"
                                v-model="typeApplication.appsUpdate">
                            <label class="form-check-label" :for="`formCheck` + index">
                                {{ app.name }}
                            </label>
                        </div>
                    </b-col>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="primary" @click="UpdateTypeApplication()">
                                {{ TYPES[typeApplication.actionType] }} nhóm</b-button>
                            <b-button type="button" variant="light" @click="showUpdateTypeApp = false">
                                Đóng</b-button>
                        </div>
                    </b-col>
                </b-row>
            </form>
        </b-modal>
    </Teleport>
    <Layout :address="address" :items="address.details" chooseMenu="ban-do" :slug="props.slug">
        <div class="w-100" data-simplebar style="height: calc(100vh - 180px);">
            <div class="container">
                <button class="btn btn-primary" @click="toggleShowMenu(0)">Thêm nhóm</button>
                <div class="mt-5" v-for="(application, index) in applications" :key="index">
                    <div class="section-title mb-3 d-flex align-items-center">
                        <button class="btn btn-sm btn-info" style="margin-right: 7px;"
                            @click="toggleShowMenu(1, application)"> <i class="ri-pencil-fill"></i></button>
                        <button class="btn btn-sm btn-danger" style="margin-right: 7px;"
                            @click="DeleteTypeApplication(application)"> <i class="ri-delete-bin-fill"></i></button>
                        <h4 class="text-warning text-uppercase m-0">{{ application.title }}</h4>
                    </div>
                    <b-row class="row-cols-xxl-5 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1">
                        <b-col v-for="(ungdung, i) in application.listPage" :key="i">
                            <router-link :to="`/${ungdung.path}`">
                                <b-card no-body class="card-height-100 cursor-pointer card-animate ribbon-box">
                                    <div class="ribbon-two ribbon-two-danger" v-if="ungdung.meta.backendOnly">
                                        <span>Backend only</span>
                                    </div>
                                    <b-card-body class="text-center py-4">
                                        <i class="display-6 text-primary" :class="ungdung.meta.icon"></i>
                                        <h6 class="mt-4 text-muted">{{ ungdung.meta.name }}</h6>
                                    </b-card-body>
                                </b-card>
                            </router-link>
                            <!-- <router-link :to="{ name: ungdung.name }">
            <b-card no-body class="card-height-100 cursor-pointer card-animate">
                <b-card-body class="text-center py-4">
                <i class="display-6 text-primary" :class="ungdung.meta.icon"></i>
                <h6 class="mt-4 text-muted">{{ ungdung.meta.name }}</h6>
                </b-card-body>
            </b-card>
            </router-link> -->
                        </b-col>
                    </b-row>
                </div>
            </div>
        </div>
    </Layout>
</template>
