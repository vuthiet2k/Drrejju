import { defineStore } from "pinia";
import { ref } from "vue";
import { useFetch } from "@/helpers/api/api.js"
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import { errorToast } from "@/helpers/api/toastStyle";

const apiPath = "system-config"
const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api'


export const useSystemConfigStore = defineStore("useSystemConfigStore", () => {
    const actionType = ref("add")
    const baseObject = {
        dtwin_key: "",
        logo: null,
        banner: null,
        name: "",
        config: {
            title_vn: "",
            title_en: "",
            contact: {
                address: "",
                website: "",
                phone: "",
                email: "",
                fax: "",
            }
        },
        is_main: false
    }
    const systemConfigToAdd = ref({ value: { ...baseObject } })

    const systemConfigToEdit = ref({ value: { ...baseObject } })

    const currentSystemConfig = ref({ value: { ...baseObject } })

    const getDetailSystemConfig = async (systemConfigId) => {
        let data = null
        await useFetch(PROXY + `/${apiPath}/${systemConfigId}/`).then(res => {
            data = res
        })
        return data
    }

    const validateObj = (obj) => {
        if (obj.name == "") {
            errorToast("Vui lòng nhập tên cấu hình!")
            return false
        }
        return true
    }

    const getFormData = (obj) => {
        const formData = new FormData()
        const jsonFields = ['config']
        const notNullFields = ['logo', 'banner']
        const fileFields = ['logo', 'banner']
        for (let [key, value] of Object.entries(obj)) {
            if (jsonFields.includes(key)) {
                formData.append(key, JSON.stringify(value))
            }
            else if (notNullFields.includes(key)) {
                if (fileFields.includes(key)) {
                    if (isFile(value)) {
                        formData.append(key, value)
                    }
                }
            }
            else {
                formData.append(key, value)
            }
        }
        return formData
    }
    function isFile(variable) {
        return variable instanceof File || variable instanceof Blob;
    }
    const resetFromUpdate = async () => {
        const systemConfigId = currentSystemConfig.value.value.id

        getDetailSystemConfig(systemConfigId).then(data => {
            currentSystemConfig.value.value = {
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
            currentSystemConfig.value.value = data
        })
    }
    return {
        actionType,
        baseObject,
        systemConfigToAdd,
        systemConfigToEdit,
        currentSystemConfig,
        apiPath,
        getDetailSystemConfig,
        validateObj,
        getFormData,
        resetFromUpdate

    }
});