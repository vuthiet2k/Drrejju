<script>
import Layout from "@/base/layouts/main.vue";
import { getListApp, getTags } from '@/base/store/api/store_api.js'
import { getInstalledApp } from '@/base/store/api/server_api.js'
import ShowApp from "./components/ShowApp.vue"
import { removeVietnamese } from "@/helpers/utils/stringHandle.js"
export default {
    page: {
        title: "Starter",
        meta: [{ name: "description", content: "DTWIN TEAM" }],
    },
    data() {
        return {
            category: "all",
            sortBy: "name",
            viewBy: "image",
            filterBy: "all",
            searchText: "",
            options: [
                { name: 'James Forbes', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'John Robles', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Mary Gant', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Curtis Saenz', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Virgie Price', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Anthony Mills', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Marian Angel', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Johnnie Walton', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Donna Weston', value: require('@/assets/images/users/user-dummy-img.jpg') },
                { name: 'Diego Norris', value: require('@/assets/images/users/user-dummy-img.jpg') },
            ],
            listApp: {},
            listTags: {},
            AppName: "AppStore",
            installedApp: [],
            idInstalledApp: [],
            isLoadingApp: true,
            isProcessing: false,
            typeProcess: "Cài đặt"
        };
    },
    computed: {
        listFilterApp() {
            let rl = this.listApp
            if (!rl?.length) return []
            if (this.filterBy == "installed") {
                rl = rl.filter(d => d.installed)
            }
            else if (this.filterBy == "notInstalled") {
                rl = rl.filter(d => !d.installed)
            }
            if (this.searchText) {
                rl = rl.filter(app => {
                    const appName = removeVietnamese(app.name)
                    const searchT = removeVietnamese(this.searchText)
                    return appName.includes(searchT)
                })
            }

            if (this.category != 'all') {
                rl = rl.filter(app => {
                    return app.tags.some(tag => tag.slug == this.category)
                })
            }

            if (this.sortBy == "name") {
                rl = rl.sort((a, b) => a.name[0].localeCompare(b.name[0]));
            }
            if (this.sortBy == "date") {
                rl = rl.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            }
            return rl
        },
    },
    components: {
        ShowApp,
        Layout,
    },
    watch: {
        selectedimage() { }
    },
    methods: {
        isAppInstalled(appId) {
            return this.idInstalledApp.includes(appId)
        },
        isSelectedCategory(category) {
            return {
                'selected-category': category == this.category
            }
        }
    },
    async mounted() {
        await getInstalledApp().then(data => {
            this.installedApp = data
            if (data.total_objects) {
                this.installedApp['results'].forEach(data => {
                    this.idInstalledApp.push(data.store_id)
                })
            }
        })
        getTags().then(data => {
            this.listTags = data?.results
        })

        getListApp().then(data => {
            if (!data?.results) {
                this.isLoadingApp = false
                return
            }
            this.listApp = data?.results.map(d => {
                d.installed = this.isAppInstalled(d.id)
                return d
            })

            this.isLoadingApp = false
        })
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
    <Layout>
        <div class="chat-wrapper gap-xl-1 d-lg-flex mx-n4 p-1">
            <div class="file-manager-sidebar">
                <div class="p-4 d-flex flex-column h-100">
                    <div class="px-4 mx-n4" data-simplebar style="height: calc(100vh - 180px);">
                        <ul class="to-do-menu list-unstyled" id="projectlist-data">
                            <li>
                                <b-link v-b-toggle.velzonAdmin class="nav-link fs-13">
                                    DANH MỤC
                                </b-link>
                                <b-collapse id="velzonAdmin" visible>
                                    <ul class="mb-0 sub-menu list-unstyled ps-3 vstack gap-2 mb-2">
                                        <li class="cursor-pointer" :class="isSelectedCategory('all')"
                                            @click="category = 'all'">
                                            <b-link href="#!"><i
                                                    class="ri-stop-mini-fill align-middle fs-15 text-danger"></i>
                                                Tất cả</b-link>
                                        </li>
                                        <li v-for="tag in listTags" :key="tag.id" class="cursor-pointer"
                                            :class="isSelectedCategory(tag.slug)" @click="category = tag.slug">
                                            <b-link href="#!"><i
                                                    class="ri-stop-mini-fill align-middle fs-15 text-secondary"></i>
                                                {{ tag.name }}</b-link>
                                        </li>
                                    </ul>
                                </b-collapse>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <!--end side content-->
            <div class="file-manager-content w-100 p-4 pb-0 bg-light">
                <div class="p-3 bg-white rounded mb-4">
                    <b-row class="g-2">
                        <b-col lg="auto">
                            <select class="form-control" data-choices data-choices-search-false
                                name="choices-select-sortlist" id="choices-select-sortlist" v-model="sortBy">
                                <option value="">Sắp xếp</option>
                                <option value="name">Theo tên</option>
                                <option value="date">Theo thời gian</option>
                            </select>
                        </b-col>
                        <b-col lg="auto">
                            <select class="form-control" data-choices data-choices-search-false
                                name="choices-select-status" id="choices-select-status" v-model="filterBy"
                                @change="filterApps">
                                <option value="all">Tất cả</option>
                                <option value="installed">Đã cài đặt</option>
                                <option value="notInstalled">Chưa cài đặt</option>
                            </select>
                        </b-col>
                        <b-col lg>
                            <div class="search-box">
                                <input type="text" id="searchTaskList" class="form-control search"
                                    placeholder="Tìm kiếm theo tên ứng dụng..." v-model="searchText">
                                <i class="ri-search-line search-icon"></i>
                            </div>
                        </b-col>
                        <b-col lg="auto">
                            <select class="form-control" data-choices data-choices-search-false
                                name="choices-select-sortlist" id="choices-select-sortlist" v-model="viewBy">
                                <option value="card">Khối</option>
                                <option value="image">Hình ảnh</option>
                            </select>
                        </b-col>
                    </b-row>
                </div>
                <div class="todo-content position-relative px-4 mx-n4" id="todo-content">
                    <b-row class="todo-task" id="todo-task" v-if="!isLoadingApp">
                        <ShowApp v-for="app in listFilterApp" :key="app.id" :app="app" :isProcessing="isProcessing"
                            :view="viewBy" :typeProcess="typeProcess" @update:isProcessing="isProcessing = $event"
                            :listApps="listApp" :idInstalledApp="idInstalledApp"
                            @update:typeProcess="typeProcess = $event" :installed="app.installed"></ShowApp>
                    </b-row>
                    <b-row class="todo-task" id="todo-task" v-else>
                        Đang tải ứng dụng
                    </b-row>
                </div>

            </div>
        </div>
    </Layout>
</template>