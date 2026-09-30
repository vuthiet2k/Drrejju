// Public IoT Link travel portal. Mirrors the app_thanh_cong pattern: a single
// layout route with children, prefixed by the given path (e.g. "iot-link").
const ARRROUTER = [
  {
    path: '/',
    component: () => import('@/app_iot_link/layout/LayoutIotLink.vue'),
    redirect: { name: 'IotLinkHome' },
    children: [
      { path: '', name: 'IotLinkHome', meta: { title: 'Bản đồ số du lịch' }, component: () => import('./pages/HomeMap.vue') },
      { path: 'gioi-thieu', name: 'IotLinkIntro', meta: { title: 'Giới thiệu' }, component: () => import('./pages/IntroPage.vue') },
      { path: 'virtual-360', name: 'IotLinkVr360', meta: { title: 'VR 360' }, component: () => import('./pages/Vr360Page.vue') },
      { path: 'gop-y', name: 'IotLinkContact', meta: { title: 'Góp ý' }, component: () => import('./pages/ContactPage.vue') },

      { path: 'dia-diem', name: 'IotLinkLocations', meta: { title: 'Địa điểm du lịch' }, component: () => import('./pages/LocationList.vue') },
      { path: 'dia-diem/:id', name: 'IotLinkLocationDetail', meta: { title: 'Chi tiết địa điểm' }, component: () => import('./pages/LocationDetail.vue') },

      { path: 'di-tich', name: 'IotLinkRelics', meta: { title: 'Phân khu / Di tích' }, component: () => import('./pages/RelicList.vue') },
      { path: 'di-tich/:id', name: 'IotLinkRelicDetail', meta: { title: 'Chi tiết di tích' }, component: () => import('./pages/RelicDetail.vue') },

      { path: 'le-hoi', name: 'IotLinkFestivals', meta: { title: 'Sự kiện và lễ hội' }, component: () => import('./pages/FestivalList.vue') },
      { path: 'le-hoi/:id', name: 'IotLinkFestivalDetail', meta: { title: 'Chi tiết lễ hội' }, component: () => import('./pages/FestivalDetail.vue') },

      { path: 'tuyen-du-lich', name: 'IotLinkTours', meta: { title: 'Tuyến du lịch' }, component: () => import('./pages/TourList.vue') },
      { path: 'tuyen-du-lich/:id', name: 'IotLinkTourDetail', meta: { title: 'Chi tiết tuyến' }, component: () => import('./pages/TourDetail.vue') },

      { path: 'doi-tuong-3d/:id', name: 'IotLinkObject3d', meta: { title: 'Đối tượng 3D' }, component: () => import('./pages/Object3dDetail.vue') },
    ],
  },
]

export default function (path) {
  return ARRROUTER.map((item) => {
    if (path) item.path = '/' + path + item.path
    return item
  })
}
