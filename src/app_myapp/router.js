import { get } from "@/base/store/api/store_api.js"

const ARRROUTER = [
  {
    path: "/",
    name: "AppMyApp",
    meta: { title: "Ứng dụng của tôi" },
    component: () => import("@/app_myapp/pages/app_myapp_list/AppLayout.vue"),
  },
  {
    path: "/",
    name: "AppsPage",
    meta: { title: "Ứng dụng của tôi" },
    component: () => import("@/app_myapp/pages/app_myapp_list/AppLayout.vue"),
  },
  {
    path: "/apps",
    name: "AppStoreList",
    meta: { title: "Của hàng ứng dụng" },
    component: () => import("@/app_myapp/pages/app_store_list/appStoreList.vue"),
  },
  {
    path: "/apps/:id",
    name: "AppDetail",
    meta: { title: "Chi tiết ứng dụng" },
    component: () => import("@/app_myapp/pages/app_store_list/AppDetail.vue"),
    beforeEnter: async (to, from, next) => {
      const appId = to.params.id;
      const resp = await get(`/application/${appId}/`)
      if (!resp?.id) {
        window.location = `/error-404`;
      }
      else {
        next()
      }
    }
  },
  {
    path: "/settings",
    name: "AppSetting",
    meta: { title: "Cài đặt" },
    component: () => import("@/app_myapp/pages/app_myapp_setting/appSetting.vue"),
  },
];

export default function (path) {
  return ARRROUTER.map((item) => {
    if (path) item.path = "/" + path + item.path;
    return item;
  });
}
