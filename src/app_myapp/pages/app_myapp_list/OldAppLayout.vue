<script>
import Layout from "@/base/layouts/main.vue";
import { installApp } from '@/app_myapp/utils.js'
import { getInstalledApp } from '@/base/store/api/server_api.js'

export default {
    page: {
        title: "Starter",
        meta: [{ name: "description", content: "DTWIN TEAM" }],
    },
    data() {
        return {
            sortBy: "",
            filterBy: "all",
            listApp: {
                results: []
            },
            AppName: "AppStore",
            installedApp: [],
            idInstalledApp: [],
            isLoadingApp: true
        };
    },
    components: {
        Layout,
    },
    watch: {
        selectedimage() { },
    },
    computed: {
    },
    methods: {
        handleInstallApp(appId) {
            installApp(appId)
            // location.replace('/')
        },
        isAppInstalled(appId) {
            return this.idInstalledApp.includes(appId)
        }
    },
    mounted() {
        getInstalledApp().then(data => {
            this.listApp = data
            this.isLoadingApp = false
        })
    },

};
</script>

<template>
    <Layout>
        <div class="chat-wrapper gap-xl-1 d-flex mx-n4 p-1 justify-content-center user-select-none">
            <div class="row mt-5 col-12 col-sm-8 col-md-7 col-lg-6 col-xl-6">
                <template v-if="!isLoadingApp">
                    <div v-for="app in listApp.results" class="col-xl-2 col-lg-2 col-md-3 col-sm-3 col-3 text-center"
                        :key="app.id">
                        <router-link class="card-body justify-content-center item-app-router" :to="`/${app.root_path}`">
                            <div class="d-flex justify-content-center">
                                <div class="flex-shrink-0 p-3 card mb-1 shadow-hover">
                                    <img src="@/assets/images/nft/img-01.jpg" alt=""
                                        class="avatar-sm object-cover rounded">
                                </div>
                            </div>
                            <p class="text-truncate">{{ app.name }}</p>
                        </router-link>
                    </div>
                </template>
                <template v-else>
                    Đang tải ứng dụng
                </template>
            </div>
        </div>
    </Layout>
</template>

<style scoped>
.shadow-hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.item-app-router:hover .shadow-hover {
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
    transform: translateY(-0.5rem);
}

.shadow-hover:hover {
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
    transform: translateY(-0.5rem);
}
</style>