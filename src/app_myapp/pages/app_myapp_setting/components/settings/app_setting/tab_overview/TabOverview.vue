<script>
import { useManageAppStore } from "@/app_myapp/pages/app_myapp_setting/store.js"
export default {
    props: {
        app: {
            default: {
                is_public: false
            }
        },
    },
    data() {
        return {
            store: useManageAppStore(),
        };
    },
    components: {
    },
    watch: {
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
    },
};
</script>

<template>
    <div class="text-muted">
        <h6 class="mb-3 fw-semibold text-uppercase mt-3">Tên ứng dụng</h6>
        <input type="text" class="form-control" disabled v-model="selectedApp.name">
        <h6 class="mb-3 fw-semibold text-uppercase mt-3">Mô tả</h6>
        <textarea name="" id="" cols="30" rows="5" class="form-control" disabled
            v-model="selectedApp.description"></textarea>
        <h6 class="mb-3 fw-semibold text-uppercase mt-3">Đường dẫn</h6>
        <input type="text" class="form-control" disabled v-model="selectedApp.root_path">
        <div class="pt-3 border-top border-top-dashed mt-4">
            <div class="row">
                <div class="col-lg-3 col-sm-4">
                    <div>
                        <p class="mb-2 text-uppercase fw-medium">Ngày tạo
                            :</p>
                        <h5 class="fs-15 mb-0">
                            {{ store.convertDate(selectedApp.created_date) }}
                        </h5>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-4">
                    <div>
                        <p class="mb-2 text-uppercase fw-medium">Cập nhật :
                        </p>
                        <h5 class="fs-15 mb-0">
                            {{
                                store.processUpdateTime(selectedApp.updated_date)
                            }}
                        </h5>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-4">
                    <div>
                        <p class="mb-2 text-uppercase fw-medium">Phiên bản :
                        </p>
                        <h5 class="fs-15 mb-0">
                            {{ selectedApp.version }}
                        </h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>