import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "@/helpers/api/api.js"
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { errorToast } from "@/helpers/api/toastStyle.js";

const apiPath = "mail-template"
const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'


export const useMailConfigStore = defineStore("useMailConfigStore", () => {
    const actionType = ref("add")

    const mailConfigToAdd = ref({
        value: {
            name: "",
            title: "",
            body: "",
            file_attachment: "",
            is_default_template: false
        }
    })

    const mailConfigToEdit = ref({
        value: {
            name: "",
            title: "",
            body: "",
            file_attachment: "",
            is_default_template: false
        }
    })

    const currentMailConfig = ref({
        value: {
            name: "",
            title: "",
            body: "",
            file_attachment: "",
            is_default_template: false
        }
    })

    const getDetailMailConfig = async (systemConfigId) => {
        let data = null
        await useFetch(PROXY + `/${apiPath}/${systemConfigId}/`).then(res => {
            data = res
        })
        return data
    }

    const validateMailConfig = (obj) => {
        if (obj.name == "") {
            errorToast("Vui lòng nhập tên cấu hình!")
            return false
        }
        return true
    }
    const resetFromUpdate = async () => {
        const mailConfigId = currentMailConfig.value.value.id

        getDetailMailConfig(mailConfigId).then(data => {
            currentMailConfig.value.value = {
                value: {
                    name: "",
                    title: "",
                    body: "",
                    file_attachment: "",
                    is_default_template: false
                }
            }
            currentMailConfig.value.value = data
        })
    }
    return {
        actionType,
        mailConfigToAdd,
        mailConfigToEdit,
        currentMailConfig,
        apiPath,
        getDetailMailConfig,
        validateMailConfig,
        resetFromUpdate

    }
});