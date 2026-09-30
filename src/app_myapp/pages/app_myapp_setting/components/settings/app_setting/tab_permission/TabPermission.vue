<script>
import { getInstalledApp } from '@/base/store/api/server_api.js'
import { useManageAppStore } from "@/app_myapp/pages/app_myapp_setting/store.js"

import AppUserEdit from "./AppUserEdit.vue"
import AppUserAdd from "./AppUserAdd.vue"
import { SERVER_URL } from "@/helpers/utils/config_system.js"
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import { AllBadges, gradientBadges } from "@/helpers/utils/badges.js"
import { setAppToPrivate, setAppToPublic } from "@/app_myapp/utils.js";

export default {
    props: {
        app: {
            default: {
                is_public: false
            }
        },
    },
    data() {
        const listPUserInApp = []
        const listRoles = []
        const isPUserLoading = true
        const isShowModalEditUser = false
        const isShowModalAddUser = false
        const userSelected = {
            "id": "",
            "username": "",
            "first_name": "",
            "last_name": "",
            "photo": null,
            "permissions": {},
            "role_in_app": [],
            "is_superuser": false,
            "roles_update": []
        }
        const listRoleToUpdate = []
        return {
            AllBadges: AllBadges,
            gradientBadges: gradientBadges,
            store: useManageAppStore(),
            listApp: {},
            listPUserInApp,
            listRoles,
            isPUserLoading,
            isShowModalEditUser,
            isShowModalAddUser,
            userSelected,
            listRoleToUpdate,
        };
    },
    components: {
        AppUserEdit,
        AppUserAdd,
    },
    watch: {
        app() {
            this.getUsersCanAccessApp()
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
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
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
        toggleModalEditUser(user) {
            if (user.is_superuser) {
                errorToast("Không thể thay đổi quyền của Quản trị hệ thống!")
            }
            else {
                this.getAllRolesInApp()
                this.userSelected = user
                this.isShowModalEditUser = !this.isShowModalEditUser
            }
        },
        async toggleModalAddUser() {
            const tmp = this.selectedAppId
            this.selectedAppId = null
            await this.sleep(100)
            this.selectedAppId = tmp
            this.isShowModalAddUser = !this.isShowModalAddUser
            this.store.getAllRolesInApp(this.selectedAppId).then(data => {
                this.listRoles = data['results']
            })
        },
        async updateListRole() {
            const totalUser = this.listRoleToUpdate.totalUser
            const rolesToUpdate = this.listRoleToUpdate.roles
            const promises = rolesToUpdate.map(async role => {
                const obj = await this.store.getRoleDetail(role.roleId);
                obj.appId = obj.application
                const newUsers = role.users.map(userId => { return { id: userId } })
                return await this.store.updateAppRole(obj, role.roleId, [...obj.users, ...newUsers]);
            });
            await Promise.all(promises);
            this.getUsersCanAccessApp()
            this.isShowModalAddUser = false
            this.$refs.appAddUser.reloadList()
            successToast(`Thêm mới ${totalUser} người dùng vào ứng dụng thành công!`)
        },
        async updateUserRoleInApp() {
            const promises = [
                ...this.userSelected.roles_removed.map(async roleId => {
                    const obj = await this.store.getRoleDetail(roleId);
                    obj.appId = obj.application;
                    const users = obj.users.filter(user => user.id !== this.userSelected.id);
                    await this.store.updateAppRole(obj, roleId, users);
                }),
                ...this.userSelected.roles_added.map(async roleId => {
                    const obj = await this.store.getRoleDetail(roleId);
                    obj.appId = obj.application;
                    return await this.store.updateAppRole(obj, roleId, [...obj.users, this.userSelected]);
                })
            ];
            await Promise.all(promises);

            this.isShowModalEditUser = false
            this.getUsersCanAccessApp()
            this.$refs.appAddUser.reloadList()
            successToast(`Cập nhật phân quyền tài khoản ${this.userSelected.username} thành công!`)
        },
        getUsersCanAccessApp() {
            this.isPUserLoading = true
            this.store.getUsersCanAccessApp(this.selectedAppId).then(data => {
                this.listPUserInApp = data['results']
                this.isPUserLoading = false
            })
        },
        getAllRolesInApp() {
            this.store.getAllRolesInApp(this.selectedAppId).then(data => {
                this.listRoles = data['results']
            })
        },
        onChangeUserRoles(roles) {
            this.userSelected.roles_update = roles.roles_update
            this.userSelected.roles_added = roles.added
            this.userSelected.roles_removed = roles.removed

        },
        async onUpdateListRole(roles) {
            this.listRoleToUpdate = roles
        },
        async setAppToPublic() {
            const isSettle = await setAppToPublic(this.selectedApp.store_id)
            await getInstalledApp().then(data => {
                this.listApp = data
            })
            if (isSettle) this.selectedApp.is_public = true
        },
        async setAppToPrivate() {
            const isSettle = await setAppToPrivate(this.selectedApp.store_id)
            await getInstalledApp().then(data => {
                this.listApp = data
            })
            if (isSettle) this.selectedApp.is_public = false
        },
    },
};
</script>

<template>
    <!-- Modal Thêm người dùng vào ứng dụng -->
    <Teleport to="body">
        <b-modal v-model="isShowModalAddUser" hide-footer title="Thêm người dùng vào ứng dụng" class="v-modal-custom"
            size="xl">
            <form action="javascript:void(0);">
                <b-row>
                    <AppUserAdd ref="appAddUser" :roles="listRoles" @change-user-app-role="onUpdateListRole"
                        :appId="selectedAppId">
                    </AppUserAdd>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="light" @click="isShowModalAddUser = false">
                                Đóng</b-button>
                            <b-button type="button" variant="primary" @click="() => { updateListRole(); }">Thêm người
                                dùng</b-button>
                        </div>
                    </b-col>
                </b-row>
            </form>
        </b-modal>
    </Teleport>
    <!-- Modal Sửa vai trò người dùng trong ứng dụng -->
    <Teleport to="body">
        <b-modal v-model="isShowModalEditUser" hide-footer title="Phân quyền ứng dụng" class="v-modal-custom" size="xl">
            <form action="javascript:void(0);">
                <b-row>
                    <AppUserEdit :userToEdit="userSelected" :roles="listRoles" @change-roles="onChangeUserRoles">
                    </AppUserEdit>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="light" @click="isShowModalEditUser = false">
                                Đóng</b-button>
                            <b-button type="button" variant="primary" @click="() => { updateUserRoleInApp(); }">Cập
                                nhật</b-button>
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
                    <div class="d-flex justify-content-between">
                        <button type="button" @click="toggleModalAddUser"
                            class="btn btn-sm btn-secondary waves-effect waves-light">
                            + Thêm người dùng
                        </button>
                        <button type="button" @click="setAppToPrivate" v-if="selectedApp.is_public"
                            class="btn btn-sm d-flex text-aligns-center btn-success waves-effect waves-light">
                            <i class="ri-list-settings-line align-middle"></i>&nbsp;Giới hạn
                            truy cập theo phân quyền
                        </button>
                        <button type="button" @click="setAppToPublic" v-if="!selectedApp.is_public"
                            class="btn btn-sm d-flex text-aligns-center btn-danger waves-effect waves-light">
                            <i class="ri-earth-line align-middle"></i>&nbsp;Cho phép truy cập
                            công khai
                        </button>
                    </div>
                    <!-- Striped Rows -->
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">TT</th>
                                <th scope="col">Người dùng</th>
                                <th scope="col">Vai trò trong ứng dụng</th>
                                <th scope="col" style="width: 10%;">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="!isPUserLoading">
                                <template v-if="listPUserInApp?.length">
                                    <tr v-for="(user, index) in listPUserInApp" :key="user.id">
                                        <th scope="row">{{ index + 1 }}</th>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="avatar-xs flex-shrink-0 me-3">
                                                    <img :src="getImagePath(user.photo)" alt=""
                                                        class="img-fluid rounded-circle">
                                                </div>
                                                <div class="flex-grow-1">
                                                    <h5 class="fs-13 mb-0">
                                                        <a href="#" class="text-body d-block">
                                                            {{ user.username }}
                                                            <span v-if="user.last_name || user.first_name">
                                                                ({{ user.first_name }}
                                                                {{ user.last_name }})
                                                            </span>
                                                        </a>
                                                    </h5>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <template v-if="user?.groups?.length">
                                                <template v-for="(gr, index) in user.groups" :key="index">
                                                    <span :class="`${gradientBadges[index]}`">
                                                        Thành viên thuộc {{ gr.name }}
                                                    </span>
                                                    &nbsp;
                                                </template>
                                            </template>
                                            <template v-if="!user.is_superuser">
                                                <template v-for="(role, index) in user.role_in_app" :key="index">
                                                    <span :class="`${AllBadges[index]}`">
                                                        {{ role.name }}
                                                    </span>
                                                    &nbsp;
                                                </template>
                                            </template>
                                            <template v-else>
                                                <span class="badge badge-label bg-secondary"><i
                                                        class="mdi mdi-circle-medium"></i> Quản
                                                    trị hệ thống</span>
                                            </template>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-soft-secondary waves-effect"
                                                @click="toggleModalEditUser(user)">
                                                <i class="ri-pencil-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                                <template v-else>
                                    <tr>
                                        <td colspan="4">
                                            <div class="noresult">
                                                <div class="text-center">
                                                    <h5 class="mt-2">Chưa người dùng nào được
                                                        phân quyền!</h5>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </template>
                            <tr v-else>
                                <td colspan="4">
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

<style scoped>
.nav-success .nav-link.active {
    color: black;
    background-color: #e6f2f3;
    border-left: 3px solid #0ab39c;
}

.bg-head-title {
    background-color: #dbe4ff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>