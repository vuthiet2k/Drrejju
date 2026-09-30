import API from "@/helpers/api/useAxios.js";
import { ref } from "vue"

const { get } = API()
export const applications = ref([])
export const isLoadingApp = ref(false)
export const fullApplications = ref([])
export const getListApplications = async () => {
    isLoadingApp.value = true
    await get('/user-apps/').then(data => {
        if (data?.error) return
        data = data.reverse()
        applications.value = formatListBlockApps(data)
        fullApplications.value = formatListBlockApps(data, true)
    })
    isLoadingApp.value = false
}

const formatListBlockApps = (parentApps, full) => {
    let results = []
    parentApps.forEach(block => {
        // Nếu không có app mà lấy full thì cho lấy
        if (full || block.apps.length) {
            const el = {
                id: block.type.id,
                title: block.type.name,
                listPage: formatListApplications(block.apps)
            }
            results.push(el)
        }
    })
    return results
}

const formatListApplications = (apps) => {
    let results = []
    apps.forEach(app => {
        const el = {
            id: app.id,
            path: app.root_path,
            meta: {
                title: app.name,
                icon: app.icon ?? "ri-apps-2-line",
                name: app.name,
                backendOnly: !app.exist_frontend && app.exist_backend,
                exist_frontend: app.exist_frontend,
                exist_backend: app.exist_backend
            },
            props: {
                nameKCN: app.name
            }
        }
        results.push(el)
    });
    return results
}