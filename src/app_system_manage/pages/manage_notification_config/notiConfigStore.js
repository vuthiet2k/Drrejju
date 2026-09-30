import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "@/helpers/api/api.js"
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { errorToast } from "@/helpers/api/toastStyle.js";

const apiPath = "mail-config"
const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'


export const useNotiConfigStore = defineStore("useNotiConfigStore", () => {
    const actionType = ref("add")

    const notiConfigToAdd = ref({
        value: {
            name: "",
            email: "",
            password: "",
            is_main: false
        }
    })

    const notiConfigToEdit = ref({
        value: {
            name: "",
            email: "",
            password: "",
            is_main: false
        }
    })

    const currentNotiConfig = ref({
        value: {
            name: "",
            email: "",
            password: "",
            is_main: false
        }
    })

    const getDetailNotiConfig = async (systemConfigId) => {
        let data = null
        await useFetch(PROXY + `/${apiPath}/${systemConfigId}/`).then(res => {
            data = res
        })
        return data
    }

    const validateNotiConfig = (obj) => {
        if (obj.name == "") {
            errorToast("Vui lòng nhập tên cấu hình!")
            return false
        }
        if (obj.email == "") {
            errorToast("Vui lòng email thông báo!")
            return false
        }
        if (obj.password == "") {
            errorToast("Vui lòng mật khẩu email thông báo!")
            return false
        }
        return true
    }
    const resetFromUpdate = async () => {
        const notiConfigId = currentNotiConfig.value.value.id

        getDetailNotiConfig(notiConfigId).then(data => {
            currentNotiConfig.value.value = {
                value: {
                    name: "",
                    config: {
                        lat: "0",
                        lng: "0",
                        tilt: "",
                        type: "roadmap",
                        zoom: "0",
                        bearing: "0",
                        viewbox: "",
                        past_time: "2000",
                        time_step: "1",
                        suggestion: [
                        ],
                        future_time: "2030",
                    },
                    is_main: false
                }
            }
            currentNotiConfig.value.value = data
        })
    }
    return {
        actionType,
        notiConfigToAdd,
        notiConfigToEdit,
        currentNotiConfig,
        apiPath,
        getDetailNotiConfig,
        validateNotiConfig,
        resetFromUpdate

    }
});