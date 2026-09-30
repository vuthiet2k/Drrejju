export const portalRouter = "";
export const dataMangeRouter = "manage";
export const systemMangeRouter = "manage/settings";
import APP_AUTH from "@/app_auth/router.js";
import APP_MYAPP_ROUTER from "@/app_myapp/router.js";
import APP_MANAGE_USER_ROUTER from "@/app_user/router.js";
import APP_MANAGE_SYSTEM_ROUTER from "@/app_system_manage/router.js";
import APP_MANAGE_PLACE_ROUTER from "@/app_manage_place/router.js";
import APP_MANAGE_TOUR_ROUTER from "@/app_manage_tour/router.js";
import APP_MANAGE_OBJECT3D_ROUTER from "@/app_manage_object3d/router.js";
import APP_MANAGE_FESTIVAL_ROUTER from "@/app_manage_festival/router.js";
import APP_THANH_CONG_ROUTER from "@/app_thanh_cong/router.js";
import APP_DINH_HOA_ROUTER from "@/app_dinh_hoa/router.js";
import APP_VR360_BUILDER_ROUTER from "@/app_vr360_builder/router.js";
import APP_IOT_LINK_ROUTER from "@/app_iot_link/router.js";
import APP_MAPLIBRE_TRAVEL_ROUTER from "@/app_maplibre_travel/router.js";

export default [
    ...APP_MYAPP_ROUTER('system'),
    ...APP_MANAGE_USER_ROUTER(dataMangeRouter + '/user'),
    ...APP_MANAGE_SYSTEM_ROUTER('system/settings'),
    ...APP_AUTH(),
    ...APP_MANAGE_PLACE_ROUTER(dataMangeRouter + '/'),
    ...APP_MANAGE_TOUR_ROUTER(dataMangeRouter + '/'),
    ...APP_MANAGE_OBJECT3D_ROUTER(dataMangeRouter + '/'),
    ...APP_MANAGE_FESTIVAL_ROUTER(dataMangeRouter + '/'),
    ...APP_DINH_HOA_ROUTER('v2'),
    ...APP_THANH_CONG_ROUTER(),
    ...APP_VR360_BUILDER_ROUTER(),
    ...APP_IOT_LINK_ROUTER('iot-link'),
    ...APP_MAPLIBRE_TRAVEL_ROUTER('maplibre-travel'),
];
