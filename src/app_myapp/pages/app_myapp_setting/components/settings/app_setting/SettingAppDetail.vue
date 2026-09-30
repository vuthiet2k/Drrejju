<script>
import { useManageAppStore } from "@/app_myapp/pages/app_myapp_setting/store.js"
import TabPermission from "./tab_permission/TabPermission.vue"
import TabRole from "./tab_role/TabRole.vue"
import TabOverview from "./tab_overview/TabOverview.vue"
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
        TabOverview,
        TabPermission,
        TabRole
    },
    watch: {
    },
    computed: {
        selectedApp() {
            return this.app
        },
    },
    methods: {
        handleClickTabPermission() {
            this.$refs.refTabPermission.getUsersCanAccessApp()
            this.$refs.refTabPermission.getAllRolesInApp()
        },
        handleClickTabRole() { 
            return
        }
    },
};
</script>

<template>
    <!-- Danger Alert -->
    <div class="alert alert-danger alert-border-left alert-dismissible fade show" role="alert"
        v-if="selectedApp.is_public">
        <i class="ri-error-warning-line me-3 align-middle"></i> <strong>CẢNH BÁO - ỨNG DỤNG ĐANG ĐƯỢC
            CÔNG KHAI </strong><br>
        <em>- Điều này nghĩa là tất cả mọi người đều có thể truy cập & tương tác với ứng dụng
            này!</em><br>
        <em>- Nếu bạn không muốn công khai ứng dụng,
            <strong>vui lòng tắt cho phép truy cập công khai</strong>!
        </em>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    <!-- Success Alert -->
    <div class="alert alert-success alert-border-left alert-dismissible fade show" role="alert"
        v-if="!selectedApp.is_public">
        <i class="ri-list-settings-line me-3 align-middle"></i> <strong>GIỚI HẠN - ỨNG DỤNG ĐANG GIỚI
            HẠN TRUY CẬP</strong><br>
        <em>- Điều này nghĩa là chỉ những người được phân quyền mới có thể truy cập & tương tác với ứng
            dụng
            này!</em>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>

    <b-row class="mb-4">
        <div order="1" class="col-auto d-block d-lg-none">
            <button type="button" class="btn btn-soft-success btn-icon btn-sm fs-16 file-menu-btn">
                <i class="ri-menu-2-fill align-bottom"></i>
            </button>
        </div>
        <b-col order="3" order-sm="2" class="mt-3 mt-sm-0" sm>
            <h5 class="fw-semibold mb-0">{{ selectedApp.name }}</h5>
        </b-col>
    </b-row>

    <ul class="nav nav-pills nav-custom nav-custom-light mb-3" role="tablist">
        <li class="nav-item">
            <a class="nav-link active fw-semibold" data-bs-toggle="tab" href="#project-overview" role="tab"
                ref="tabProjectOverview">
                Tổng quan
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link fw-semibold" data-bs-toggle="tab" href="#project-permission"
                @click="handleClickTabPermission" role="tab" ref="testProjectTeamRole">
                Phân quyền
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link fw-semibold" data-bs-toggle="tab" href="#project-role"
            @click="handleClickTabRole" role="tab" ref="projectRoleTab">
                Vai trò
            </a>
        </li>
    </ul>
    <div class="tab-content text-muted">
        <div class="tab-pane active" id="project-overview" role="tabpanel">
            <TabOverview :app="app" ref="refTabOverview"></TabOverview>
        </div>
        <div class="tab-pane" id="project-permission" role="tabpanel">
            <TabPermission :app="app" ref="refTabPermission"></TabPermission>
        </div>
        <div class="tab-pane" id="project-role" role="tabpanel">
            <TabRole :app="app" ref="refTabRole"></TabRole>
        </div>
    </div>
</template>