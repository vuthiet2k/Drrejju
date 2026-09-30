export default function (url_root) {
    return [
        {
            path: (url_root ? '/' : '') + `${url_root}/demo-dynamic-api`,
            meta: {
                title: "Demo",
            },
            component: () => import("@/app_manage_dynamic_api/pages/DemoMange.vue"),
        }, 
    ]
}