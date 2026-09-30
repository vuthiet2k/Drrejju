import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "@/helpers/api/api.js"
import { usePatchJSON } from "../api_custom.js"
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import useSwal from "@/base/common/useSwal.js";
import { successToast, errorToast } from "@/helpers/api/toastStyle";

const apiPath = "group"
const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'


export const useGroupStore = defineStore("useGroupStore", () => {
    const currentUser = ref({})

    const actionType = ref("add")

    const groupToAdd = ref({
        value: {
            name: "",
            users: [],
            permissions: [],
            department: [],
        }
    })

    const groupToEdit = ref({
        value: {
            name: "",
            users: [],
            permissions: [],
            department: [],
        }
    })

    const currentGroup = ref({
        value: {
            name: "",
            users: [],
            permissions: [],
            department: [],
        }
    })

    const removeUserFromGroup = async (userDel, groupId, type = "add") => {
        const { confirmDelete } = useSwal();
        let isRemoved = false;
        const result = await confirmDelete("Bạn có muốn xoá không?");
        if (!result.isConfirmed) return;
        
        if (type == "add") {
            const usersInGroup = groupToAdd.value.value.users
            usersInGroup.forEach(user => {
                if (user.id == userDel.id) {
                    var index = usersInGroup.indexOf(user);
                    if (index !== -1) {
                        usersInGroup.splice(index, 1);
                        isRemoved = true
                    }
                }
            })
        }
        else {
            await usePatchJSON(`${apiPath}/${groupId}/remove-users`, JSON.stringify({
                "users": [`${userDel.id}`]
            })).then(res => {
                if (res.status == 200 || res.status == 201) {
                    isRemoved = true
                    successToast(`Đã xóa thành viên ${userDel.username}`)
                }
                else {
                    errorToast(`Xóa thất bại, vui lòng thử lại sau!`)
                }
            })
        }
        return isRemoved
    }

    const getGroupDetail = async (groupId) => {
        let data = null
        await useFetch(PROXY + `/${apiPath}/${groupId}/`).then(res => {
            data = res
        })
        return data
    }

    const resetFromUpdate = async () => {
        const groupId = currentGroup.value.value.id

        getGroupDetail(groupId).then(data => {
            currentGroup.value.value = {
                value: {
                    name: "",
                    users: [],
                    permissions: [],
                    department: [],
                }
            }
            currentGroup.value.value = data
        })
    }
    const getUserCanAddToGroup = async (groupId) => {
        let data = null
        await useFetch(PROXY + `/${apiPath}/${groupId}/users-can-add-to-group`).then(res => {
            data = res
        })
        return data
    }
    const validateObj = (obj) => {
        if (obj.name == "") {
            errorToast("Vui lòng nhập tên phân quyền!")
            return false
        }
        return true
    }
    const handleRequireObjectField = (value) => {
        value = value.map(vli => {
            if (vli instanceof Object)
                return vli
            else return { id: vli }
        })
        return value
    }
    const getFormData = (obj) => {
        const formData = new FormData()
        const jsonFields = ['users', 'permissions', 'department']
        // { 'id': '...'}
        const requireObjectIdsData = ['users', 'permissions', 'department']
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            let value = obj[key]
            if (!value) break;
            if (requireObjectIdsData.includes(key)) {
                value = handleRequireObjectField(value)
            }
            if (jsonFields.includes(key)) {
                formData.append(key, JSON.stringify(value))
            }
            else {
                formData.append(key, value)
            }
        }
        return formData
    }

    return {
        actionType,
        currentUser,
        groupToAdd,
        groupToEdit,
        currentGroup,
        apiPath,
        getGroupDetail,
        getUserCanAddToGroup,
        removeUserFromGroup,
        validateObj,
        resetFromUpdate,
        getFormData
    }
});