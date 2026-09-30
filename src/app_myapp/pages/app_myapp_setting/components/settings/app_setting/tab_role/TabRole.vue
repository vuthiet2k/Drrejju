<script>
import { useManageAppStore } from "@/app_myapp/pages/app_myapp_setting/store.js"

import AppRoleAdd from "./AppRoleAdd.vue";
import AppRoleEdit from "./AppRoleEdit.vue";
import { SERVER_URL } from "@/helpers/utils/config_system.js"
import { successToast } from "@/helpers/api/toastStyle";
import { AllBadges } from "@/helpers/utils/badges.js"
export default {
    props: {
        app: {
            default: {
                is_public: false
            }
        },
    },
    data() {
        const listRoles = []
        const isRoleLoading = true
        const isShowModalAddRole = false
        const isShowModalEditRole = false
        const roleAddToApp = {

        }
        const roleSelected = {

        }
        return {
            AllBadges: AllBadges,
            store: useManageAppStore(),
            listRoles,
            isRoleLoading,
            isShowModalEditRole,
            isShowModalAddRole,
            roleAddToApp,
            roleSelected,
        };
    },
    components: {
        AppRoleAdd,
        AppRoleEdit,
    },
    watch: {
        app() {
            this.getAllRolesInApp()
        }
    },
    computed: {
        selectedApp() {
            return this.app
        },
        selectedAppId() {
            return this.app?.id
        }
    },
    methods: {
        getImagePath(imagePath) {
            const defaultImage = require('@/assets/images/users/user-dummy-img.jpg')
            if (imagePath == null || imagePath == "/media/null") {
                imagePath = defaultImage
            }
            else {
                imagePath = SERVER_URL + imagePath
            }
            return imagePath
        },
        toggleModalEditRole(role) {
            this.roleSelected = role
            this.isShowModalEditRole = !this.isShowModalEditRole
        },
        toggleShowModalAddRole() {
            this.isShowModalAddRole = !this.isShowModalAddRole
        },
        getAllRolesInApp() {
            this.isRoleLoading = true
            this.store.getAllRolesInApp(this.selectedAppId).then(data => {
                this.listRoles = data['results']
                this.isRoleLoading = false
            })
        },
        onChangeAppRoleAdd(data) {
            this.roleAddToApp = data
        },
        addRoleToApp() {
            if (this.store.validRole(this.roleAddToApp)) {
                this.store.createAppRole(this.roleAddToApp).then(() => {
                    this.getAllRolesInApp()
                    this.isShowModalAddRole = false
                    successToast("Tạo vai trò mới thành công!")
                    this.roleAddToApp = {}
                })
            }
        },
        updateRoleInApp() {
            if (this.store.validRole(this.roleAddToApp)) {
                this.store.updateAppRole(this.roleAddToApp, this.roleSelected.id).then(() => {
                    this.getAllRolesInApp()
                    this.isShowModalEditRole = false
                    successToast("Cập nhật vai trò mới thành công!")
                    this.roleAddToApp = {}
                })
            }
        },
        deleteRole(role) {
            this.store.deleteRole(role.id).then(isSuccess => {
                if (isSuccess) {
                    this.getAllRolesInApp()
                }
            })
        },
    },
};
</script>

<template>
    <!-- Modal Sửa vai trò ứng dụng -->
    <Teleport to="body">
        <b-modal v-model="isShowModalEditRole" hide-footer title="Chỉnh sửa vai trò ứng dụng" class="v-modal-custom"
            size="xl">
            <form action="javascript:void(0);">
                <b-row>
                    <AppRoleEdit @change-app-role="onChangeAppRoleAdd" :roleId="roleSelected.id" :appId="selectedAppId">
                    </AppRoleEdit>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="light" @click="isShowModalEditRole = false">
                                Đóng</b-button>
                            <b-button type="button" variant="primary" @click="() => { updateRoleInApp(); }">Cập
                                nhật</b-button>
                        </div>
                    </b-col>
                </b-row>
            </form>
        </b-modal>
    </Teleport>
    <!-- Modal Thêm vai trò ứng dụng -->
    <Teleport to="body">
        <b-modal v-model="isShowModalAddRole" hide-footer title="Thêm vai trò ứng dụng" class="v-modal-custom"
            size="xl">
            <form action="javascript:void(0);">
                <b-row>
                    <AppRoleAdd @change-app-role="onChangeAppRoleAdd" :appId="selectedAppId"></AppRoleAdd>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="light" @click="isShowModalAddRole = false">
                                Đóng</b-button>
                            <b-button type="button" variant="primary" @click="() => { addRoleToApp(); }">Thêm vai
                                trò</b-button>
                        </div>
                    </b-col>
                </b-row>
            </form>
        </b-modal>
    </Teleport>
    <div class="row g-4 mb-3">
        <div class="card" style="min-height: 540px;">
            <SimpleBar style="max-height: 540px; overflow-x: hidden;">
                <div class="card-body">
                    <button type="button" @click="toggleShowModalAddRole"
                        class="btn btn-sm btn-secondary waves-effect waves-light">
                        + Thêm vai trò
                    </button>
                    <!-- Striped Rows -->
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">TT</th>
                                <th scope="col">Tên vai trò</th>
                                <th scope="col">Mô tả</th>
                                <th scope="col">Quyền ứng dụng</th>
                                <th scope="col" style="width: 10%;">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="!isRoleLoading">
                                <template v-if="listRoles?.length">
                                    <tr v-for="(role, index) in listRoles" :key="role.id">
                                        <th scope="row">{{ index + 1 }}</th>
                                        <td>
                                            {{ role.name }}
                                        </td>
                                        <td>
                                            {{ role.description }}
                                        </td>
                                        <td>
                                            <template v-for="(per, index) in role.permissions" :key="index">
                                                <span :class="`${AllBadges[index]}`">{{
                                                    per.codename
                                                }}</span>
                                            </template>
                                        </td>
                                        <td class="d-flex gap-2">
                                            <button type="button"
                                                class="btn btn-sm ml-2 btn-soft-secondary waves-effect"
                                                @click="toggleModalEditRole(role)">
                                                <i class="ri-pencil-fill"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-soft-danger waves-effect"
                                                @click="deleteRole(role)">
                                                <i class="ri-delete-bin-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                                <template v-else>
                                    <tr>
                                        <td colspan="5">
                                            <div class="noresult">
                                                <div class="text-center">
                                                    <h5 class="mt-2">Ứng dụng chưa có vai trò
                                                        nào!</h5>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </template>

                            <tr v-else>
                                <td colspan="5">
                                    <div class="noresult">
                                        <div class="text-center">
                                            <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop"
                                                colors="primary:#121331,secondary:#08a88a"
                                                style="width:75px;height:75px"></lord-icon>
                                            <h5 class="mt-2">Đang tải ...</h5>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SimpleBar>
        </div>
    </div>
</template>