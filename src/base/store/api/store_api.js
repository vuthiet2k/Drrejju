import { getConfigsSystem } from "@/base/store/api/server_api.js"
export const STORE_URL = "https://api-store.metatwin.vn"
export const API_STORE_URL = STORE_URL + "/api"


export const getStoreAccessToken = async () => {
    const config = await getConfigsSystem()
    return config.dtwin_key
}
const addNewParam = (url, param, value) => {
    // Tách URL thành các thành phần
    const parsedUrl = new URL(url);

    // Thêm parameter `token`
    parsedUrl.searchParams.set(param, value);

    // Ghép lại URL
    const newUrl = parsedUrl.toString();
    return newUrl
}

export async function get(path = null, query = null, api_url = null) {
    let url = api_url ? `${api_url}` : API_STORE_URL

    let header = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    if (path != null)
        url += path

    if (query != null)
        url += query
    url = addNewParam(url, "token", await getStoreAccessToken())

    const res = await fetch(url, header);
    return res.json()
}

export async function getTags() {
    let data = []
    await get('/tag-application').then(res => {
        data = res
    })
    return data
}

export async function getListApp() {
    return await get('/application/')
}

export async function getDetailApp(appId) {
    return await get(`/application/${appId}/`)
}