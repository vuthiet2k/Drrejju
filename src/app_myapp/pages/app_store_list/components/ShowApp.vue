<script>
import { warningToast } from '@/helpers/api/toastStyle';
import { handleInstallApp, handleUninstallApp } from "../store.js"
import { getImagePath } from '@/base/store/utils/images.js';

export default {
    props: {
        app: {

        },
        isProcessing: {
            type: Boolean,
            default: false
        },
        typeProcess: {
            type: String,
            default: "Cài đặt"
        },
        installed: {
            default: false
        },
        view: {
            default: "card"
        },
        listApps: {
            default: () => []
        },
        idInstalledApp: {
            default: () => []
        }
    },
    components: {
    },
    computed: {
        requireDependencies() {
            let dependencies = this.dependencies.filter(dependency => dependency.strict_depend)
            dependencies = this.getDetailDependencies(dependencies)
            return dependencies
        },
        otherDependencies() {
            let dependencies = this.dependencies.filter(dependency => !dependency.strict_depend)
            dependencies = this.getDetailDependencies(dependencies)
            return dependencies
        }
    },
    data() {
        return {
            typeInstall: "Cài đặt",
            typeUninstall: "Gỡ cài đặt",
            appId: null,
            application: null,
            rootPath: "",
            isPublic: false,
            isLocalProcessing: false,
            localType: "Cài đặt",
            dependencies: [],
            actions: [
                {
                    name: "Thông tin ứng dụng",
                    action: (id) => this.redirectToAppDetail(id)
                },
                {
                    name: "Tìm hiểu thêm",
                    action: (id) => this.redirectToAppDetail(id)
                }
            ]
        };
    },
    mounted() {
    },
    methods: {
        getDetailDependencies(dependencies) {
            const results = dependencies.map(dependency => {
                let dependencyApp = dependency.dependency
                const app = this.listApps.find(app => app.id == dependencyApp)
                const isInstalled = this.idInstalledApp.findIndex(id => id == dependencyApp)
                const depend = {
                    application: app,
                    installed: isInstalled
                }
                return depend
            })
            return results
        },
        async handleInstallApp(appId) {
            this.localType = this.typeInstall
            this.isLocalProcessing = true
            const dependencies = await handleInstallApp(appId)
            this.isLocalProcessing = false
            if (dependencies?.length) {
                this.dependencies = dependencies
                this.showDependencies = true
            }
        },
        async handleUninstallApp(appId) {
            if (this.isProcessing) {
                warningToast("Đang xử lý thao tác khác, vui lòng đợi!")
                return
            }

            this.localType = this.typeUninstall
            this.isLocalProcessing = true
            await handleUninstallApp(appId)
            this.isLocalProcessing = false
        },
        redirectToAppDetail(appId) {
            window.location = `/system/apps/${appId}`;
        },
        getImagePath(photo) {
            return getImagePath(photo)
        }
    },
    watch: {
        isLocalProcessing() {
            this.$emit("update:isProcessing", this.isLocalProcessing)
        },
        localType() {
            this.$emit("update:typeProcess", this.localType)
        }
    }
};
</script>

<style>
/* Chia thành 4 cột khi màn hình rộng từ 1700px trở lên */
@media (min-width: 1700px) {
    .my-app-custom {
        flex: 0 0 calc(25%);
        margin-bottom: 40px;
    }
}

/* Chia thành 3 cột khi màn hình rộng từ 1600px đến 1699px */
@media (min-width: 1600px) and (max-width: 1699px) {
    .my-app-custom {
        flex: 0 0 calc(33.33%);
        margin-bottom: 40px;
    }
}

/* Chia thành 2 cột khi màn hình rộng từ 1200px đến 1599px */
@media (min-width: 1200px) and (max-width: 1599px) {
    .my-app-custom {
        flex: 0 0 calc(50%);
        margin-bottom: 40px;
    }
}

/* Chia thành 1 cột khi màn hình rộng dưới 1200px */
@media (max-width: 1199px) {
    .my-app-custom {
        margin-bottom: 40px;
    }
}

.my-card {
    background-color: white;
    box-shadow: 0 1px 2px rgba(56, 65, 74, 0.15);
}
</style>

<template>
    <div class="my-2 position-relative my-app-custom">
        <div class="my-card" v-if="view == 'card'">
            <div @click="redirectToAppDetail(app.id)" class="d-flex align-middle p-3 align-items-center cursor-pointer">
                <div class="flex-shrink-0">
                    <img :src="getImagePath(app.photo)" class="rounded img-fluid" style="height: 60px; width: 60px" alt="">
                </div>
                <div class="flex-grow-1 ms-2">
                    <div style="width: 90%;">
                        <h6 class="mb-1 lh-base">{{ app.name }}</h6>
                        <p class="text-muted fs-12 mb-0" style="min-height: 36px; max-height: 36px;">{{ app.description
                            }}</p>
                        <!-- <div class="d-flex">
                            <button class="btn btn-soft-secondary waves-effect btn-sm mt-1 me-auto"
                                @click="handleInstallApp(app.id)" :disabled="isProcessing" v-if="!installed">Cài
                                đặt</button>
                            <button class="btn btn-light btn-sm mt-1">Tìm hiểu thêm</button>
                        </div> -->
                    </div>
                    <!-- <div class="position-absolute d-flex justify-content-center align-items-center cursor-pointer dropdown user-select-none hover:bg-primary"
                        style="top: 7px; right: 20px; height: 31px; width: 21px;" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <i class="ri-more-2-fill"></i>
                        <ul class="dropdown-menu dropdown-menu-end border border-secondary"
                            aria-labelledby="dropdownMenuButton1">
                            <li @click="action.action(app.id)" v-for="action in actions" :key="action">
                                <router-link class="dropdown-item"
                                    :to="{ name: 'AppDetail', params: { 'id': app.id } }">{{ action.name }}</router-link>
                            </li>
                        </ul>
                    </div> -->
                </div>
            </div>
        </div>
        <div v-if="view == 'image'">
            <b-col @click="redirectToAppDetail(app.id)" class="cursor-pointer">
                <!-- <div class="position-absolute d-flex justify-content-center align-items-center cursor-pointer dropdown user-select-none hover:bg-primary"
                    style="top: 7px; right: 20px; height: 31px; width: 21px; z-index: 100;" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                    <ul class="dropdown-menu dropdown-menu-end border border-secondary"
                        aria-labelledby="dropdownMenuButton1">
                        <li @click="action.action(app.id)" v-for="action in actions" :key="action">
                                <router-link class="dropdown-item"
                                    :to="{ name: 'AppDetail', params: { 'id': app.id } }">{{ action.name }}</router-link>
                        </li>
                    </ul>
                </div> -->
                <b-card no-body class="explore-box card-animate">
                    <div class="bookmark-icon position-absolute top-0 end-0 p-2">
                        <button type="button" class="btn btn-icon active" data-bs-toggle="button" aria-pressed="true"><i
                                class="mdi mdi-cards-heart fs-16"></i></button>
                    </div>
                    <div class="explore-place-bid-img">
                        <img :src="getImagePath(app.photo)" alt="" class="card-img-top explore-img" />
                        <div class="bg-overlay"></div>
                        <!-- <div class="place-bid-btn">
                            <b-link href="#!" class="btn btn-success" @click="handleInstallApp(app.id)"
                                :disabled="isProcessing" v-if="!installed">
                                Cài đặt
                            </b-link>
                        </div> -->
                    </div>
                    <b-card-body>
                        <p class="fw-medium mb-0 float-end"><i class="ri-download-fill align-middle"></i>
                            {{ app.total_download }} </p>
                        <h5 class="mb-1">
                            <b-link href="#">{{ app.name }}</b-link>
                        </h5>
                    </b-card-body>
                    <b-card-footer class="border-top border-top-dashed">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1 fs-14">
                                <span v-for="tag in app.tags" :key="tag.id"><i
                                        class="ri-price-tag-3-fill text-warning align-bottom me-1"></i> {{ tag.name
                                    }}</span>
                            </div>
                            <h5 class="flex-shrink-0 fs-14 text-primary mb-0">v{{ app.version }}</h5>
                        </div>
                    </b-card-footer>
                </b-card>
            </b-col>
        </div>
    </div>
</template>