import { getDetailLocalAppByStoreId } from '@/base/store/api/server_api.js'

export async function get_deep_link_app(app_store_id = null, path = null) {
    let fullPath = "/"
    await getDetailLocalAppByStoreId(app_store_id).then(app_info => {
        if (app_info) {
            const root_path = app_info.root_path
            fullPath = `/${root_path}`
            if (path) {
                fullPath = `${fullPath}/${path}`
            }
            else {
                fullPath = `${fullPath}/`
            }
        }
    })
    return fullPath
}

export async function deep_link_redirect(app_store_id = null, path = null) {
    get_deep_link_app(app_store_id, path).then(fullPath => {
        location.replace(fullPath)
    })
}