<script setup>
import FormSelectAppPermission from "../../components/FormSelectAppPermission.vue";
// import FormSelectDepartment from "./components/FormSelectDepartment.vue";
import ModalAddUserToGroup from "../../components/ModalAddUserToGroup.vue";
import AccordionRecord from "@/base/components/accordion/AccordionRecord.vue";


import { reactive, ref, watch, inject } from "vue";
import { useGroupStore } from "./groupStore.js";
const groupStore = useGroupStore();
const manage_data = inject("manage-data");

const obj = reactive({
  name: "",
  users: [],
  permissions: [],
  tmpPermissions: [],
  initialDepartment: [],
  department: []
});

// Using watch the store value when the group to edit change
watch(groupStore.currentGroup, () => {
  groupStore
    .getGroupDetail(groupStore.currentGroup.value.id)
    .then((groupDetail) => {
      obj.name = groupDetail.name;
      obj.users = groupDetail.users;
      obj.tmpPermissions = groupDetail.permissions;
      obj.permissions = groupDetail.permissions;
      obj.initialDepartment = groupDetail.department;
    });
});

watch(obj, () => {
  groupStore.groupToEdit.value = obj;
});

const modalEditUserToGroup = ref(false);

function handleAddUserToGroup(usersCanAddToGroup) {
  usersCanAddToGroup.forEach((user) => {
    if (user.selected) {
      if (!obj.users.includes(user)) {
        obj.users.push(user);
      }
    }
  });
}

function removeUserFromGroup(userDel) {
  groupStore
    .removeUserFromGroup(userDel, groupStore.currentGroup.value.id, "edit")
    .then((isRemoved) => {
      if (isRemoved) {
        const usersInGroup = obj.users;
        usersInGroup.forEach((user) => {
          if (user.id == userDel.id) {
            var index = usersInGroup.indexOf(user);
            if (index !== -1) {
              usersInGroup.splice(index, 1);
            }
          }
        });
        manage_data.handleCallApi();
      }
    });
}

// function handleSelectedData(data) {
//   obj.department = data;
//   groupStore.groupToEdit.value = obj;
// }

</script>
<template>
  <ModalAddUserToGroup v-model="modalEditUserToGroup" :handleAddUserToGroup="handleAddUserToGroup" type="edit">
  </ModalAddUserToGroup>
  <form action="#">
    <button class="d-none" type="reset" name="reset"></button>
    <b-row class="g-0 m-2">
      <b-col xl="12">
        <b-row>
          <AccordionRecord title="THÔNG TIN PHÂN QUYỀN">
            <b-col lg="12" class="mb-3">
              <label for="addressInput" class="form-label mb-1">Tên phân quyền <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="addressInput" placeholder="Nhập tên phân quyền" name="address"
                v-model="obj.name" autocomplete="new-address" :class="{ 'is-invalid': !obj.name }" />
              <div class="invalid-feedback d-block" v-if="!obj.name">
                Vui lòng nhập tên phân quyền
              </div>
            </b-col>
          </AccordionRecord>
          <AccordionRecord title="NGƯỜI ĐƯỢC PHÂN QUYỀN">
            <b-col lg="12" class="mb-3">
              <button class="btn btn-sm btn-primary mb-2" type="button"
                @click="modalEditUserToGroup = !modalEditUserToGroup">
                Thêm người
              </button>
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
                  <tr v-for="(item, index) in obj.users" :key="index" class="form__user-data">
                    <td class="text-center">
                      {{ item.username }}
                    </td>
                    <td class="text-center">
                      {{ item.last_name }} {{ item.first_name }}
                    </td>
                    <td class="text-center">
                      <img :src="item.photo" alt="" width="80" />
                    </td>
                    <td>
                      <div class="dropdown table__action-group text-center">
                        <button class="btn btn-soft-secondary btn-sm dropdown" type="button" data-bs-toggle="dropdown"
                          aria-expanded="false">
                          <i class="mdi mdi-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu mb-0">
                          <li>
                            <a class="dropdown-item" href="#" target="_self" @click="removeUserFromGroup(item)">
                              <i class="ri-delete-bin-line align-bottom me-2 text-muted"></i>
                              Xóa
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
            <FormSelectAppPermission @change-data="(data) => (obj.permissions = data)"
              :defaultPermissions="obj.tmpPermissions">
            </FormSelectAppPermission>
          </AccordionRecord>
          <!-- <AccordionRecord title="QUYỀN DỮ LIỆU" style="margin-bottom: 400px;">
            <em>Cho phép nhóm này có quyền truy cập vào dữ liệu của các phòng ban khác</em>
            <FormSelectDepartment @update:selectedData="handleSelectedData" class="mt-2" @change-data="(data) => (obj.department = data)"
              :defaultData="obj.initialDepartment">
            </FormSelectDepartment>
          </AccordionRecord> -->
        </b-row>
      </b-col>
    </b-row>
  </form>
</template>
<style scoped>
.bg-head-title {
  background-color: #dbe4ff;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}
</style>
