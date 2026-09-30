import { getDetailLocalAppByStoreId } from '@/base/store/api/server_api.js'
import { API_SERVER_URL } from "@/base/store/api/server_api.js"
const BACKEND_FIRST_PATH = "backend-app"

export async function get_deep_api_app(app_store_id = null, path = null) {
    let fullPath = `${API_SERVER_URL}`
    if (app_store_id) {
        fullPath = `${fullPath}/${BACKEND_FIRST_PATH}`
        await getDetailLocalAppByStoreId(app_store_id).then(app_info => {
            if (app_info) {
                const root_path = app_info.root_path
                fullPath = `${fullPath}-${root_path}`
            }
        })
    }
    if (path) {
        fullPath = `${fullPath}/${path}`
    }
    else {
        fullPath = `${fullPath}/`
    }
    return fullPath
}