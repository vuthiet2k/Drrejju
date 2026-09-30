import { defineStore } from "pinia";
import { ref } from "vue";
import { errorToast } from "@/helpers/api/toastStyle";
import { useFetch } from "@/helpers/api/api.js"
import { BASE_URL } from "@/helpers/api/axiosHttp.js";

const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'


export const useUserStore = defineStore("useUserStore", () => {
    // Get list
    const getListRole = async () => {
        let listRole = null
        await useFetch(PROXY + '/role/').then(data => {
            listRole = data['results']
        })
        return listRole
    }

    const userToPass = ref({
        value: {
            username: "",
            password: "",
            new_password: "",
            re_new_pass: "",
            is_baned: ""
        }
    })

    const userToLock = ref({
        value: {
            username: "",
            is_baned: true
        }
    })

    const currentUser = ref({
        value: {
            phone: "",
            username: "",
            password: "",
            last_name: "",
            first_name: "",
            user_role: "",
            gender: 0,
            photo: null,
            email: "",
            introduce: "",
            social_network_link: "[]",
            address: "",
            birth: "",
            cover_img: null,
            info_public: "{}"
        }
    })


    const getUserDetail = async (userId) => {
        let data = null
        await useFetch(PROXY + `/user/${userId}/`).then(res => {
            data = res
        })
        return data
    }

    const resetFromUpdate = async () => {
        const userId = currentUser.value.value.id

        getUserDetail(userId).then(data => {
            currentUser.value.value = {
                value: {
                    username: "",
                    password: "",
                    last_name: "",
                    first_name: "",
                    user_role: "",
                    gender: 0,
                    photo: null,
                    email: "",
                    introduce: "",
                    social_network_link: "[]",
                    address: "",
                    birth: "",
                    cover_img: null,
                    info_public: "{}"
                }
            }
            currentUser.value.value = data
        })
    }

    const resetFromPass = async () => {
        userToPass.value.value.password = ""
        userToPass.value.value.new_password = ""
        userToPass.value.value.re_new_pass = ""
    }

    const resetFromLock = async () => {
        const userId = currentUser.value.value.id

        getUserDetail(userId).then(data => {
            currentUser.value.value = {
                value: {
                    username: "",
                    is_baned: true
                }
            }
            currentUser.value.value = data
        })
    }


    const validateObj = (obj) => {
        if (obj.username == "") {
            errorToast("Vui lòng nhập tên tài khoản!")
            return false
        }
        if (obj.password == "") {
            errorToast("Vui lòng nhập mật khẩu!")
            return false
        }
        if (obj.first_name == "") {
            errorToast("Vui lòng nhập họ người dùng!")
            return false
        }
        if (obj.last_name == "") {
            errorToast("Vui lòng nhập tên người dùng!")
            return false
        }
        if (obj.email == "") {
            errorToast("Vui lòng nhập email!")
            return false
        }
        if (obj.user_role == "") {
            errorToast("Vui lòng chọn vai trò!")
            return false
        }
        if (obj.new_password == "") {
            errorToast("Vui lòng nhập mật khẩu mới!")
            return false
        }
        if (obj.new_password == obj.password) {
            errorToast("Mật khẩu mới không được trùng với mật khẩu cũ!")
            return false
        }
        if (obj.new_password != obj.re_new_pass) {
            errorToast("Mật khẩu mới không trùng khớp!")
            return false
        }
        return true
    }
    return {
        currentUser,
        userToPass,
        userToLock,
        validateObj,
        getListRole,
        getUserDetail,
        resetFromUpdate,
        resetFromPass,
        resetFromLock
    }
});