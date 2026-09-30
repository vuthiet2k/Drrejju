<script>
import Layout from "@/base/layouts/main.vue";
import { get, STORE_URL } from "@/base/store/api/store_api.js"
import { get as serverGet } from "@/base/store/api/server_api.js"
import { useManageAppStore } from "@/app_myapp/pages/app_myapp_setting/store.js"
import { handleInstallApp, handleUninstallApp, areAllDependenciesInstalled, areAllStrictDependenciesInstalled } from "./store.js"
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue"
import { getAppDependents } from "@/app_myapp/utils.js"
import { getListApp } from '@/base/store/api/store_api.js'
import { getInstalledApp } from '@/base/store/api/server_api.js'
import { checkAppDependencies, installApp } from '@/app_myapp/utils.js'
import { getImagePath } from '@/base/store/utils/images.js';
import { warningToast } from '@/helpers/api/toastStyle';

export default {
    page: {
        title: "Starter",
        meta: [{ name: "description", content: "DTWIN TEAM" }],
    },
    data() {
        return {
            idInstalledApp: [],
            listApps: [],
            showDependencies: false,
            dependencies: [],
            application: {},
            STORE_URL: STORE_URL,
            store: useManageAppStore(),
            localVersion: "",
            storeVersion: "",
            dependents: [],
            showDependents: false,
            //state: 0 // 0: Chưa cài đặt // 1: Đã cài đặt // 2: Đã cài đặt và hiện tại có bản cập nhật mới
            actions: [
                {
                    name: "Mở",
                    class: "btn-secondary",
                    click: () => {},
                    state: [1, 2]
                },
                {
                    name: "Cài đặt",
                    class: "btn-secondary",
                    click: async () => {
                        const dependencies = await handleInstallApp(this.application.id)
                        if (dependencies?.length) {
                            this.dependencies = dependencies
                            // Kiểm tra xem đã cài đặt đầy đủ tất cả các app phụ thuộc chưa
                            const isDependenciesInstalled = areAllDependenciesInstalled(this.dependencies, this.idInstalledApp)
                            if (isDependenciesInstalled) {
                                // Nếu đã cài đặt tất cả các app dependencies thì tiến hành cài đặt app này
                                await installApp(this.application.id)
                            }
                            else {
                                // Nếu chưa cài đặt đủ thì hiển thị model các app phụ thuộc
                                this.showDependencies = true
                            }
                        }
                    },
                    state: [0]
                },
                {
                    name: "Cập nhật",
                    class: "btn-secondary",
                    click: () => {},
                    state: [2]
                },
                {
                    name: "Gỡ cài đặt",
                    class: "btn-light",
                    click: async () => {
                        this.dependents = await getAppDependents(this.application.id)
                        const strict_depent = this.dependents?.strict_depend
                        const not_strict_depent = this.dependents?.not_strict_depend
                        if (strict_depent.length) {
                            this.showDependents = true
                            warningToast("Không thể gỡ ứng dụng đang có phụ thuộc bắt buộc!")
                        }
                        else if (not_strict_depent.length) {
                            this.showDependents = true
                            warningToast("Kiểm tra lại các ứng dụng có phụ thuộc!")
                        }
                        else {
                            await handleUninstallApp(this.application.id)
                        }
                    },
                    state: [1, 2]
                }
            ],
            isLoaded: false,
            isLoadingDependencies: true
        };
    },
    computed: {
        appId() {
            return this.$route.params.id;
        },
        state() {
            let state = 0
            //   Đã cài đặt
            if (this.localVersion == this.storeVersion) {
                state = 1
            }
            //   Chưa cài đặt
            else if (this.localVersion == "") {
                state = 0
            }
            //   Có phiên bản mới
            else {
                state = 2
            }
            return state
        },
        requireDependencies() {
            try {
                let dependencies = this.dependencies.filter(dependency => dependency.strict_depend)
                dependencies = this.getDetailDependencies(dependencies)
                return dependencies
            }
            catch {
                return []
            }
        },
        otherDependencies() {
            try {
                let dependencies = this.dependencies.filter(dependency => !dependency.strict_depend)
                dependencies = this.getDetailDependencies(dependencies)
                return dependencies
            }
            catch {
                return []
            }
        }
    },
    components: {
        Layout,
        AccordionRecord
    },
    watch: {
    },
    methods: {
        async forceInstallApp() {
            // Kiểm tra xem các app phụ 
            const isAllStrictDependenciesInstalled = areAllStrictDependenciesInstalled(this.dependencies, this.idInstalledApp)
            if (isAllStrictDependenciesInstalled)
                await installApp(this.application.id)
            else
                warningToast("Vui lòng cài đặt các phụ thuộc bắt buộc!")
        },
        async forceUninstall() {
            await handleUninstallApp(this.application.id)
        },
        redirectToAppDetail(appId) {
            window.location = `/system/apps/${appId}`;
        },
        getImagePath(imgPath) {
            return getImagePath(imgPath)
        },
        isAppInstalled(appId) {
            return this.idInstalledApp.includes(appId)
        },
        getDetailDependencies(dependencies) {
            const results = dependencies.map(dependency => {
                let dependencyApp = dependency.dependency
                const app = this.listApps.find(app => app.id == dependencyApp)
                const isInstalled = this.idInstalledApp.findIndex(id => id == dependencyApp)
                const depend = {
                    application: app,
                    installed: isInstalled,
                    strict_depend: dependency.strict_depend
                }
                return depend
            })
            return results
        },
        async getAppDetail() {
            const resp = await get(`/application/${this.appId}/`)
            this.application = resp
            this.storeVersion = resp?.version
        },
        async checkIsAppInstalled() {
            const resp = await serverGet(`/app-installed/s/?store_id=${this.appId}`)
            if (resp?.id) {
                this.localVersion = resp.version
            }
        }
    },
    async mounted() {
        this.isLoaded = false
        await this.getAppDetail()
        await this.checkIsAppInstalled()
        this.isLoaded = true
        await getInstalledApp().then(data => {
            this.installedApp = data
            if (data.total_objects) {
                this.installedApp['results'].forEach(data => {
                    this.idInstalledApp.push(data.store_id)
                })
            }
        })
        await getListApp().then(data => {
            this.listApps = data?.results.map(d => {
                d.installed = this.isAppInstalled(d.id)
                return d
            })
        })
        this.isLoadingDependencies = true
        this.dependencies = await checkAppDependencies(this.application?.id)
        this.isLoadingDependencies = false
    },

};
</script>

<style scoped>
.todo-content {
    height: calc(100vh - 256px);
}

.selected-category {
    background-color: #fbf0e7;
}
</style>

<template>
    <Teleport to="body">
        <b-modal v-model="showDependents" hide-footer :title="`Các ứng dụng yêu cầu ứng dụng này`"
            class="v-modal-custom" size="lg">
            <form action="javascript:void(0);">
                <b-row>
                    <b-col class="mb-3 mt-3 text-danger">
                        <b><em>
                            <span v-if="dependents?.strict_depend?.length">
                                Vui lòng gỡ cài đặt các ứng dụng phụ thuộc bắt buộc trước khi gỡ cài đặt ứng dụng này!
                            </span>
                            <span v-else>
                                Cân nhắc, Khi gỡ ứng dụng này có thể sẽ ảnh hưởng tới các ứng dụng liên quan! 
                            </span>
                        </em></b>
                    </b-col>
                    <AccordionRecord :title="`ỨNG DỤNG PHỤ THUỘC BẮT BUỘC (${dependents?.strict_depend?.length})`">
                        <div v-if="dependents?.strict_depend?.length < 1" class="mb-3">
                            <em>Không có ứng dụng nào đang phụ thuộc!</em>
                        </div>
                        <div v-else class="row mb-3">
                            <div v-for="dependent in dependents?.strict_depend" :key="dependent" class="col-auto">
                                <router-link class="dropdown-item" @click="redirectToAppDetail(dependent?.store_id)"
                                    :to="{ name: 'AppDetail', params: { 'id': dependent?.store_id } }">
                                    <b class="fs-15 text-primary">{{ dependent?.name }}</b>
                                    &nbsp; &nbsp;
                                </router-link>
                            </div>
                        </div>
                    </AccordionRecord>
                    <AccordionRecord :title="`ỨNG DỤNG PHỤ THUỘC TÙY CHỌN (${dependents?.not_strict_depend?.length})`">
                        <div v-if="dependents?.not_strict_depend?.length < 1" class="mb-3">
                            <em>Không có ứng dụng nào đang phụ thuộc!</em>
                        </div>
                        <div v-else class="row mb-3">
                            <div v-for="dependent in dependents?.not_strict_depend" :key="dependent" class="col-auto">
                                <router-link class="dropdown-item" @click="redirectToAppDetail(dependent?.store_id)"
                                    :to="{ name: 'AppDetail', params: { 'id': dependent?.store_id } }">
                                    <b class="fs-15 text-primary">{{ dependent?.name }}</b>
                                    &nbsp; &nbsp;
                                </router-link>
                            </div>
                        </div>
                    </AccordionRecord>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="danger" @click="forceUninstall"
                                v-if="!dependents?.strict_depend?.length">
                                Tiếp tục gỡ cài đặt</b-button>
                            <b-button type="button" variant="light" @click="showDependents = false">
                                Đóng</b-button>
                        </div>
                    </b-col>
                </b-row>
            </form>
        </b-modal>
    </Teleport>
    <Teleport to="body">
        <b-modal v-model="showDependencies" hide-footer
            :title="`Yêu cài đặt ứng dụng phụ thuộc cho ` + application.name" class="v-modal-custom" size="lg">
            <form action="javascript:void(0);">
                <b-row>
                    <AccordionRecord :title="`PHỤ THUỘC BẮT BUỘC (${requireDependencies.length})`">
                        <div v-if="requireDependencies.length < 1" class="mb-3">
                            <em>Không có ứng dụng nào phụ thuộc!</em>
                        </div>
                        <div v-else class="row mb-3">
                            <div v-for="dependency in requireDependencies" :key="dependency" class="col-auto">
                                <router-link class="dropdown-item"
                                    @click="redirectToAppDetail(dependency?.application?.id)"
                                    :to="{ name: 'AppDetail', params: { 'id': dependency?.application?.id } }">
                                    <b class="fs-15 text-primary">{{ dependency?.application?.name }}</b>
                                    (<span v-if="dependency.installed > 0"
                                        class="badge rounded-pill badge-soft-success">Đã cài đặt</span>
                                    <span v-else class="badge rounded-pill badge-soft-danger">Chưa cài đặt</span>)
                                    &nbsp; &nbsp;
                                </router-link>
                            </div>
                        </div>
                    </AccordionRecord>
                    <AccordionRecord :title="`CÁC PHỤ THUỘC TÙY CHỌN (${otherDependencies.length})`">
                        <div v-if="otherDependencies.length < 1" class="mb-3">
                            <em>Không có ứng dụng nào phụ thuộc!</em>
                        </div>
                        <div v-else class="row mb-3">
                            <div v-for="dependency in otherDependencies" :key="dependency" class="col-auto">
                                <router-link class="dropdown-item"
                                    @click="redirectToAppDetail(dependency?.application?.id)"
                                    :to="{ name: 'AppDetail', params: { 'id': dependency?.application?.id } }">
                                    <b class="fs-15 text-primary">{{ dependency?.application?.name }}</b>
                                    (<span v-if="dependency.installed > 0"
                                        class="badge rounded-pill badge-soft-success">Đã cài đặt</span>
                                    <span v-else class="badge rounded-pill badge-soft-danger">Chưa cài đặt</span>)
                                    &nbsp; &nbsp;
                                </router-link>
                            </div>
                        </div>
                    </AccordionRecord>
                    <b-col lg="12">
                        <div class="hstack gap-2 justify-content-end">
                            <b-button type="button" variant="primary" @click="forceInstallApp">
                                Tiếp tục cài đặt</b-button>
                            <b-button type="button" variant="light" @click="showDependencies = false">
                                Đóng</b-button>
                        </div>
                    </b-col>
                </b-row>
            </form>
        </b-modal>
    </Teleport>
    <Layout>
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="row gx-lg-5">
                            <div class="col-xl-4 col-md-8 mx-auto">
                                <div class="product-img-slider sticky-side-div">
                                    <div class="swiper product-thumbnail-slider p-2 rounded bg-light">
                                        <div class="swiper-wrapper">
                                            <div class="swiper-slide">
                                                <img :src="getImagePath(application.photo)" alt=""
                                                    class="img-fluid d-block" />
                                            </div>
                                        </div>
                                    </div>
                                    <!-- end swiper thumbnail slide -->
                                    <!-- <div class="swiper product-nav-slider mt-2">
                                        <div class="swiper-wrapper">
                                            <div class="swiper-slide">
                                                <div class="nav-slide-item">
                                                    <img :src="`${STORE_URL}${application.photo}`" alt=""
                                                        class="img-fluid d-block" />
                                                </div>
                                            </div>
                                        </div>
                                    </div> -->
                                    <!-- end swiper nav slide -->
                                </div>
                            </div>
                            <!-- end col -->

                            <div class="col-xl-8">
                                <div class="mt-xl-0 mt-5">
                                    <div class="d-flex">
                                        <div class="flex-grow-1">
                                            <h4>{{ application.name }}</h4>
                                            <div class="hstack gap-3 flex-wrap">
                                                <div><a href="#" class="text-primary d-block">DTWIN TEAM</a></div>
                                                <div class="vr"></div>
                                                <div class="text-muted">Danh mục :
                                                    <span v-for="tag in application.tags" :key="tag.id"
                                                        class="text-body fw-medium">{{ tag.name }}</span>
                                                </div>
                                                <div class="vr"></div>
                                                <div class="text-muted">Ngày phát hành : <span
                                                        class="text-body fw-medium">
                                                        {{ store.convertDate(application.created_date) }}
                                                    </span></div>
                                            </div>
                                        </div>
                                        <div class="d-flex" v-if="isLoaded">
                                            <div v-for="(action, index) in actions" :key="index">
                                                <template v-if="index >= actions.length">
                                                    <button v-if="action.state.includes(state)" class="btn"
                                                        @click="action.click()" :class="action.class"
                                                        data-bs-toggle="tooltip" data-bs-placement="top" title="Edit">{{
                                                            action.name }}</button>
                                                </template>
                                                <template v-else>
                                                    <button v-if="action.state.includes(state)" class="btn"
                                                        style="margin-right: 5px;" @click="action.click()"
                                                        :class="action.class" data-bs-toggle="tooltip"
                                                        data-bs-placement="top" title="Edit">{{
                                                            action.name }}</button>
                                                </template>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-flex flex-wrap gap-2 align-items-center mt-3">
                                        <div class="text-muted fs-16">
                                            <span class="mdi mdi-star text-warning"></span>
                                            <span class="mdi mdi-star text-warning"></span>
                                            <span class="mdi mdi-star text-warning"></span>
                                            <span class="mdi mdi-star text-warning"></span>
                                            <span class="mdi mdi-star text-warning"></span>
                                        </div>
                                        <div class="text-muted">( 5.50k Customer Review )</div>
                                    </div>

                                    <div class="row mt-4">
                                        <!-- end col -->
                                        <div class="col-lg-3 col-sm-6">
                                            <div class="p-2 border border-dashed rounded">
                                                <div class="d-flex align-items-center">
                                                    <div class="avatar-sm me-2">
                                                        <div
                                                            class="avatar-title rounded bg-transparent text-success fs-24">
                                                            <i class="bx bxs-tag-alt"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-grow-1">
                                                        <p class="text-muted mb-1">Phiên bản :</p>
                                                        <h5 class="mb-0">{{ application.version }}</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-lg-3 col-sm-6">
                                            <div class="p-2 border border-dashed rounded">
                                                <div class="d-flex align-items-center">
                                                    <div class="avatar-sm me-2">
                                                        <div
                                                            class="avatar-title rounded bg-transparent text-success fs-24">
                                                            <i class="ri-inbox-archive-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-grow-1">
                                                        <p class="text-muted mb-1">Lượt tải xuống :</p>
                                                        <h5 class="mb-0">{{ application.total_download }}</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- end col -->
                                    </div>

                                    <div class="mt-4 text-muted">
                                        <h5 class="fs-14">Mô tả :</h5>
                                        <p>{{ application.description }}</p>
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="mt-3">
                                                <h5 class="fs-14">Các ứng dụng phụ thuộc bắt buộc :</h5>
                                                <ul class="list-unstyled" v-if="requireDependencies?.length">
                                                    <li class="py-1" v-for="dependency in requireDependencies"
                                                        :key="dependency">
                                                        <i
                                                            class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                        <router-link
                                                            @click="redirectToAppDetail(dependency?.application?.id)"
                                                            :to="{ name: 'AppDetail', params: { 'id': dependency?.application?.id } }">
                                                            {{ dependency.application?.name }}
                                                        </router-link>
                                                    </li>
                                                </ul>
                                                <div v-else-if="isLoadingDependencies">
                                                    Đang tải các phụ thuộc cần thiết ...
                                                </div>
                                                <div v-else>
                                                    Không có ứng dụng phụ thuộc nào!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="mt-3">
                                                <h5 class="fs-14">Các ứng dụng phụ thuộc khác :</h5>
                                                <ul class="list-unstyled" v-if="otherDependencies?.length">
                                                    <li class="py-1" v-for="dependency in otherDependencies"
                                                        :key="dependency">
                                                        <i
                                                            class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                        <router-link
                                                            @click="redirectToAppDetail(dependency?.application?.id)"
                                                            :to="{ name: 'AppDetail', params: { 'id': dependency?.application?.id } }">
                                                            {{ dependency.application?.name }}
                                                        </router-link>
                                                    </li>
                                                </ul>
                                                <div v-else-if="isLoadingDependencies">
                                                    Đang tải các phụ thuộc cần thiết ...
                                                </div>
                                                <div v-else>
                                                    Không có ứng dụng phụ thuộc nào!
                                                </div>
                                            </div>
                                        </div>
                                        <!-- <div class="col-sm-6">
                                            <div class="mt-3">
                                                <h5 class="fs-14">Tính năng :</h5>
                                                <ul class="list-unstyled">
                                                    <li class="py-1"><i
                                                            class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                        ...</li>
                                                    <li class="py-1"><i
                                                            class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                        ...</li>
                                                    <li class="py-1"><i
                                                            class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                        ...</li>
                                                    <li class="py-1"><i
                                                            class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                        ...</li>
                                                </ul>
                                            </div>
                                        </div> -->
                                    </div>


                                    <!-- <div class="product-content mt-5">
                                        <h5 class="fs-14 mb-3">Product Description :</h5>
                                        <nav>
                                            <ul class="nav nav-tabs nav-tabs-custom nav-success" id="nav-tab"
                                                role="tablist">
                                                <li class="nav-item">
                                                    <a class="nav-link active" id="nav-speci-tab" data-bs-toggle="tab"
                                                        href="#nav-speci" role="tab" aria-controls="nav-speci"
                                                        aria-selected="true">Specification</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" id="nav-detail-tab" data-bs-toggle="tab"
                                                        href="#nav-detail" role="tab" aria-controls="nav-detail"
                                                        aria-selected="false">Details</a>
                                                </li>
                                            </ul>
                                        </nav>
                                        <div class="tab-content border border-top-0 p-4" id="nav-tabContent">
                                            <div class="tab-pane fade show active" id="nav-speci" role="tabpanel"
                                                aria-labelledby="nav-speci-tab">
                                                <div class="table-responsive">
                                                    <table class="table mb-0">
                                                        <tbody>
                                                            <tr>
                                                                <th scope="row" style="width: 200px;">Category</th>
                                                                <td>T-Shirt</td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">Brand</th>
                                                                <td>Tommy Hilfiger</td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">Color</th>
                                                                <td>Blue</td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">Material</th>
                                                                <td>Cotton</td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row">Weight</th>
                                                                <td>140 Gram</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="nav-detail" role="tabpanel"
                                                aria-labelledby="nav-detail-tab">
                                                <div>
                                                    <h5 class="font-size-16 mb-3">Tommy Hilfiger Sweatshirt for Men
                                                        (Pink)</h5>
                                                    <p>Tommy Hilfiger men striped pink sweatshirt. Crafted with cotton.
                                                        Material composition is 100% organic cotton. This is one of the
                                                        world’s leading designer lifestyle brands and is internationally
                                                        recognized for celebrating the essence of classic American cool
                                                        style, featuring preppy with a twist designs.</p>
                                                    <div>
                                                        <p class="mb-2"><i
                                                                class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                            Machine Wash</p>
                                                        <p class="mb-2"><i
                                                                class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                            Fit Type: Regular</p>
                                                        <p class="mb-2"><i
                                                                class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                            100% Cotton</p>
                                                        <p class="mb-0"><i
                                                                class="mdi mdi-circle-medium me-1 text-muted align-middle"></i>
                                                            Long sleeve</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> -->
                                    <!-- product-content -->

                                    <div class="mt-5">
                                        <div>
                                            <h5 class="fs-14 mb-3">Đánh giá & nhận xét</h5>
                                        </div>
                                        <div class="row gy-4 gx-0">
                                            <div class="col-lg-4">
                                                <div>
                                                    <div class="pb-3">
                                                        <div class="bg-light px-3 py-2 rounded-2 mb-2">
                                                            <div class="d-flex align-items-center">
                                                                <div class="flex-grow-1">
                                                                    <div class="fs-16 align-middle text-warning">
                                                                        <i class="ri-star-fill"></i>
                                                                        <i class="ri-star-fill"></i>
                                                                        <i class="ri-star-fill"></i>
                                                                        <i class="ri-star-fill"></i>
                                                                        <i class="ri-star-half-fill"></i>
                                                                    </div>
                                                                </div>
                                                                <div class="flex-shrink-0">
                                                                    <h6 class="mb-0">4.5 / 5</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="text-center">
                                                            <div class="text-muted">Tất cả <span
                                                                    class="fw-medium">5.50k</span> đánh giá
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="mt-3">
                                                        <div class="row align-items-center g-2">
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0">5 <i
                                                                            class="ri-star-fill text-warning"></i></h6>
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="p-2">
                                                                    <div class="progress animated-progress progress-sm">
                                                                        <div class="progress-bar bg-success"
                                                                            role="progressbar" style="width: 50.16%"
                                                                            aria-valuenow="50.16" aria-valuemin="0"
                                                                            aria-valuemax="100"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0 text-muted">2758</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!-- end row -->

                                                        <div class="row align-items-center g-2">
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0">4 <i
                                                                            class="ri-star-fill text-warning"></i></h6>
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="p-2">
                                                                    <div class="progress animated-progress progress-sm">
                                                                        <div class="progress-bar bg-success"
                                                                            role="progressbar" style="width: 19.32%"
                                                                            aria-valuenow="19.32" aria-valuemin="0"
                                                                            aria-valuemax="100"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0 text-muted">1063</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!-- end row -->

                                                        <div class="row align-items-center g-2">
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0">3 <i
                                                                            class="ri-star-fill text-warning"></i></h6>
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="p-2">
                                                                    <div class="progress animated-progress progress-sm">
                                                                        <div class="progress-bar bg-success"
                                                                            role="progressbar" style="width: 18.12%"
                                                                            aria-valuenow="18.12" aria-valuemin="0"
                                                                            aria-valuemax="100"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0 text-muted">997</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!-- end row -->

                                                        <div class="row align-items-center g-2">
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0">2 <i
                                                                            class="ri-star-fill text-warning"></i></h6>
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="p-2">
                                                                    <div class="progress animated-progress progress-sm">
                                                                        <div class="progress-bar bg-warning"
                                                                            role="progressbar" style="width: 7.42%"
                                                                            aria-valuenow="7.42" aria-valuemin="0"
                                                                            aria-valuemax="100"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0 text-muted">408</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!-- end row -->

                                                        <div class="row align-items-center g-2">
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0">1 <i
                                                                            class="ri-star-fill text-warning"></i></h6>
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="p-2">
                                                                    <div class="progress animated-progress progress-sm">
                                                                        <div class="progress-bar bg-danger"
                                                                            role="progressbar" style="width: 4.98%"
                                                                            aria-valuenow="4.98" aria-valuemin="0"
                                                                            aria-valuemax="100"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-auto">
                                                                <div class="p-2">
                                                                    <h6 class="mb-0 text-muted">274</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!-- end row -->
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end col -->

                                            <div class="col-lg-8">
                                                <div class="ps-lg-4">
                                                    <div class="d-flex flex-wrap align-items-start gap-3">
                                                        <h5 class="fs-14">Đánh giá: </h5>
                                                    </div>

                                                    <div class="me-lg-n3 pe-lg-4" data-simplebar
                                                        style="max-height: 225px;">
                                                        <ul class="list-unstyled mb-0">
                                                            <li class="py-2">
                                                                <div class="border border-dashed rounded p-3">
                                                                    <div class="d-flex align-items-start mb-3">
                                                                        <div class="hstack gap-3">
                                                                            <div
                                                                                class="badge rounded-pill bg-success mb-0">
                                                                                <i class="mdi mdi-star"></i> 4.2
                                                                            </div>
                                                                            <div class="vr"></div>
                                                                            <div class="flex-grow-1">
                                                                                <p class="text-muted mb-0"> Demo đánh
                                                                                    giá ứng dụng!.</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div class="d-flex flex-grow-1 gap-2 mb-3">
                                                                        <a href="#" class="d-block">
                                                                            <img src="@/assets/images/small/img-12.jpg"
                                                                                alt=""
                                                                                class="avatar-sm rounded object-cover">
                                                                        </a>
                                                                        <a href="#" class="d-block">
                                                                            <img src="@/assets/images/small/img-11.jpg"
                                                                                alt=""
                                                                                class="avatar-sm rounded object-cover">
                                                                        </a>
                                                                        <a href="#" class="d-block">
                                                                            <img src="@/assets/images/small/img-10.jpg"
                                                                                alt=""
                                                                                class="avatar-sm rounded object-cover">
                                                                        </a>
                                                                    </div>

                                                                    <div class="d-flex align-items-end">
                                                                        <div class="flex-grow-1">
                                                                            <h5 class="fs-14 mb-0">Demo người dùng</h5>
                                                                        </div>

                                                                        <div class="flex-shrink-0">
                                                                            <p class="text-muted fs-13 mb-0">12/07/2022
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end col -->
                                        </div>
                                        <!-- end Ratings & Reviews -->
                                    </div>
                                    <!-- end card body -->
                                </div>
                            </div>
                            <!-- end col -->
                        </div>
                        <!-- end row -->
                    </div>
                    <!-- end card body -->
                </div>
                <!-- end card -->
            </div>
            <!-- end col -->
        </div>
    </Layout>
</template>