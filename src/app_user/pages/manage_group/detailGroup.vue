<script setup>
import FormSelectAppPermission from "../../components/FormSelectAppPermission.vue";
// import FormSelectDepartment from "./components/FormSelectDepartment.vue";
import { getImagePath } from '@/helpers/utils/images.js';

import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue";
import { reactive, watch } from "vue";
import { useGroupStore } from "./groupStore.js"
const groupStore = useGroupStore()
// const manage_data = inject('manage-data')
import Image from "@/base/components/image/Image.vue";
const obj = reactive({
    name: "",
    users: [],
    initialDepartment: [],
    department: []
})


// Using watch the store value when the group to edit change
watch(groupStore.currentGroup, () => {
    groupStore.getGroupDetail(groupStore.currentGroup.value.id).then(groupDetail => {
        obj.name = groupDetail.name
        obj.users = groupDetail.users
        obj.tmpPermissions = groupDetail.permissions
        obj.permissions = groupDetail.permissions
        obj.initialDepartment = groupDetail.department;

    })
})

</script>
<template>
    <form action="#">
        <b-row class="g-0 m-2">
            <b-col xl="12">
                <b-row>
                    <AccordionRecord title="THÔNG TIN PHÂN QUYỀN">
                        <b-col lg="12" class="mb-3">
                            <label for="addressInput" class="form-label mb-1">Tên phân quyền <span
                                    class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="addressInput" placeholder="Nhập tên phân quyền"
                                name="address" disabled v-model="obj.name" autocomplete="new-address" />
                        </b-col>

                    </AccordionRecord>
                    <AccordionRecord title="NGƯỜI ĐƯỢC PHÂN QUYỀN">
                        <b-col lg="12" class="mb-3">
                            <table class="table align-middle table-striped table-bordered">
                                <thead class="table-light text-dark text-center text-uppercase">
                                    <tr>
                                        <th>Tên đăng nhập</th>
                                        <th>Họ tên</th>
                                        <th>Ảnh</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody class="list form-check-all" v-if="obj?.users?.length > 0">
                                    <tr v-for="(user, index) in obj.users" :key="index" class="form__user-data">
                                        <td class="text-center">
                                            {{ user.username }}
                                        </td>
                                        <td class="text-center">
                                            {{ user.last_name }} {{ user.first_name }}
                                        </td>
                                        <td class="text-center">
                                            <span class="d-flex align-items-center">
                                                <Image class="rounded-circle header-profile-user"
                                                    fallback="user"
                                                    :src="getImagePath(user.photo)" alt="Header Avatar" />
                                            </span>
                                        </td>
                                        <td>
                                            <div class="dropdown table__action-group text-center">
                                                <button class="btn btn-soft-secondary btn-sm dropdown" type="button"
                                                    data-bs-toggle="dropdown" aria-expanded="false" disabled><i
                                                        class="mdi mdi-dots-vertical"></i></button>
                                                <ul class="dropdown-menu mb-0">
                                                    <li>
                                                        <a class="dropdown-item" href="#" target="_self">
                                                            <i
                                                                class="ri-delete-bin-line align-bottom me-2 text-muted"></i>
                                                            Xóa
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item" href="#" target="_self">
                                                            <i
                                                                class="ri-delete-bin-line align-bottom me-2 text-muted"></i>
                                                            Chỉnh sửa
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody class="list form-check-all" v-else>
                                    <tr>
                                        <td colspan="5" class="text-center">
                      Chưa có người nào được phân quyền!
                                        </td>
                                    </tr>
                                </tbody>

                            </table>
                        </b-col>
                    </AccordionRecord>
                    <AccordionRecord title="QUYỀN ỨNG DỤNG">
                        <FormSelectAppPermission :disable="true" @change-data="data => obj.permissions = data"
                            :defaultPermissions="obj.tmpPermissions">
                        </FormSelectAppPermission>
                    </AccordionRecord>
                    <!-- <AccordionRecord title="QUYỀN DỮ LIỆU" style="margin-bottom: 400px;">
                        <em>Cho phép nhóm này có quyền truy cập vào dữ liệu của các phòng ban khác</em>
                        <FormSelectDepartment @update:selectedData="handleSelectedData" class="mt-2" :disable="true"
                            @change-data="(data) => (obj.permissions = data)" :defaultData="obj.initialDepartment">
                        </FormSelectDepartment>
                    </AccordionRecord> -->
                </b-row>
            </b-col>
        </b-row>
    </form>
</template>
<style scoped>
.bg-head-title {
    background-color: #DBE4FF;
}
</style>