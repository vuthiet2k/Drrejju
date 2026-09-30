<script>
import Layout from "@/base/layouts/LayoutDtwin2025.vue";
import { getInstalledApp, filerApps } from '@/base/store/api/server_api.js'
import { useManageAppStore } from "./store.js"
import SettingAppDetail from "./components/settings/app_setting/SettingAppDetail.vue";
import GeneralSetting from "./components/settings/general_setting/GeneralSetting.vue";
export default {
    data() {
        return {
            store: useManageAppStore(),
            selectedApp: {},
            selectedAppId: "all",
            listApp: {},
        };
    },
    components: {
        Layout,
        GeneralSetting,
        SettingAppDetail,
    },
    watch: {
    },
    computed: {
        filterApp() {
            return filerApps(this.listApp?.results)
        },
    },
    methods: {
        toggleApp(app) {
            this.selectedAppId = app?.id;
            this.selectedApp = app;
        },
    },
    async mounted() {
        var isShowMenu = false;
        var emailMenuSidebar = document.getElementsByClassName(
            "file-manager-sidebar"
        );
        Array.from(document.querySelectorAll(".file-menu-btn")).forEach(function (
            item
        ) {
            item.addEventListener("click", function () {
                Array.from(emailMenuSidebar).forEach(function (elm) {
                    elm.classList.add("menubar-show");
                    isShowMenu = true;
                });
            });
        });

        window.addEventListener("click", function () {
            try {
                if (
                    document
                        .querySelector(".file-manager-sidebar")
                        .classList.contains("menubar-show")
                ) {
                    if (!isShowMenu) {
                        document
                            .querySelector(".file-manager-sidebar")
                            .classList.remove("menubar-show");
                    }
                    isShowMenu = false;
                }
            }
            // eslint-disable-next-line
            catch {

            }
        });
        await getInstalledApp().then(data => {
            this.listApp = data
        })
    },

};
</script>

<template>
    <Layout>
        <div class="d-flex gap-1">
            <div class="file-manager-sidebar" id="my-menubar">
                <div class="p-4 d-flex flex-column h-100">
                    <div class="mx-n4" data-simplebar style="height: calc(100vh - 468px);">
                        <div class="nav flex-column nav-success nav-pills" id="v-pills-tab" role="tablist"
                            aria-orientation="vertical">
                            <b-link class="nav-link mb-2 d-flex align-items-center"
                                :class="{ 'active': selectedAppId == 'all' }" @click="selectedAppId = 'all'">
                                <i class="ri-settings-line fs-16"></i> &nbsp; Cài đặt chung
                            </b-link>
                            <b-link class="nav-link mb-2 d-flex align-items-center"
                                :class="{ 'active': selectedAppId == app?.id }" v-for="app in filterApp" :key="app.id"
                                @click="toggleApp(app)">
                                <i class="fs-16" :class="app?.icon"></i> &nbsp; {{ app.name }}
                            </b-link>
                        </div>
                    </div>
                </div>
            </div>
            <!--end side content-->
            <div class="file-manager-content w-100 p-4 pb-0">
                <div v-show="selectedAppId == 'all'">
                    <GeneralSetting></GeneralSetting>
                </div>
                <div v-show="selectedAppId != 'all'">
                    <SettingAppDetail :app="selectedApp" :selectedAppId="selectedAppId"></SettingAppDetail>
                </div>
            </div>
        </div>
    </Layout>
</template>

<style scoped>
.nav-success .nav-link.active {
    color: black;
    background-color: #e6f2f3;
    border-left: 3px solid #0ab39c;
}
</style>