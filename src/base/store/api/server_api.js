// THIS FILE CUSTOMS FOR SERVER API
// 

import { SERVER_URL } from "@/helpers/utils/config_system"
import { getAccessToken } from "@/helpers/api/token"
import { ref } from "vue"
export const API_SERVER_URL = SERVER_URL + "/api"

export const ConfigSystem = ref({
    id: "",
    name: "DTWIN CONFIG",
    dtwin_key: "ENTER_YOUR_DTWIN_KEY",
    banner: require("@/assets/images/base/banner.png"),
    logo: require('../../../../public/metadatawin.png') ?? require("@/assets/images/logo/metadatawin.png"),
    is_main: "",
    config: {
        contact: {
            address: "Địa chỉ tổ chức của bạn",
            website: "your_website.com",
            phone: "0123.456.789",
            email: "your_organization@gmail.com",
            fax: "Your Company Tax Number",
        },
        title_vn: "TÊN TỔ CHỨC CỦA BẠN",
        title_en: "Your Organization Name - YON",
    },
})

const BASIC_HEADER = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
}

getConfigsSystem()


export async function get(path = null, query = null) {
    let url = API_SERVER_URL
    let header = BASIC_HEADER
    header.method = "GET";
    header.headers['Authorization'] = await getAccessToken();
    if (path != null)
        url += path

    if (query != null)
        url += query
    const res = await fetch(url, header);
    return res.json()
}

export const login = async function (username, password) {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await fetch(API_SERVER_URL + '/login/', {
            method: "POST",
            headers: {
                "Accept": "*/*",
            },
            body: formData,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return false;
    }
};

export async function getDetailLocalAppByStoreId(appId) {
    return await get('/app-installed/s/?store_id=' + appId)
}

export async function getDetailAppInstalled(appId) {
    return await get(`/app-installed/${appId}/`)
}

export async function getInstalledApp(showPer = false) {
    let path = '/app-installed/?all=1'
    if (showPer)
        path = path + '&show-permissions=0'
    return await get(path)
}

export async function getCurrentAppByPath(path) {
    return await get('/app-installed/current-app/', `?path=${path}`)
}

export async function isCanRedirect(path) {
    return await get('/app-installed/redirect/', `?path=${path}`)
}

export async function getUserPermissionWithApp(path) {
    return await get(`/${path}/permissions/`)
}

export async function getConfigsSystem() {
    let systemConfig = { ...ConfigSystem.value }
    await get(`/system-config/`).then(data => {
        const configs = data?.results
        const mediaFields = ['banner', 'logo']
        if (configs.length) {
            const mainConfig = configs[0]
            for (let [key, value] of Object.entries(mainConfig)) {
                if (mediaFields.includes(key)) {
                    const resolved = typeof value === 'string' && /^https?:\/\//i.test(value)
                        ? value
                        : `${SERVER_URL}${value}`
                    ConfigSystem.value[key] = resolved
                    systemConfig[key] = resolved
                }
                else {
                    ConfigSystem.value[key] = value
                    systemConfig[key] = value
                }
            }

        }
    })
    return systemConfig
}

export function filerApps(apps) {
    let rl = []
    const ignoreApp = ['system/settings', 'system']
    if (apps?.length) {
        rl = apps.filter(app => {
            if (ignoreApp.includes(app.root_path)) return false
            else return true
        })
        rl = rl.map(app => {
            app.icon = app?.icon ?? "ri-at-fill"
            return app
        })
    }
    return rl
}