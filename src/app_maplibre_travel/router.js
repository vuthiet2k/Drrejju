// Public MapLibre travel portal backed by app_thanh_cong data.
const ARRROUTER = [
  {
    path: '/',
    component: () => import('@/app_maplibre_travel/layout/LayoutIotLink.vue'),
    redirect: { name: 'MaplibreTravelHome' },
    children: [
      { path: '', name: 'MaplibreTravelHome', meta: { title: 'Bản đồ du lịch Thành Công' }, component: () => import('./pages/HomeMap.vue') },
      { path: 'gioi-thieu', name: 'MaplibreTravelIntro', meta: { title: 'Giới thiệu' }, component: () => import('./pages/IntroPage.vue') },
      { path: 'virtual-360', name: 'MaplibreTravelVr360', meta: { title: 'VR 360' }, component: () => import('./pages/Vr360Page.vue') },
      { path: 'gop-y', name: 'MaplibreTravelContact', meta: { title: 'Góp ý' }, component: () => import('./pages/ContactPage.vue') },

      { path: 'dia-diem', name: 'MaplibreTravelLocations', meta: { title: 'Địa điểm du lịch' }, component: () => import('./pages/LocationList.vue') },
      { path: 'dia-diem/:id', name: 'MaplibreTravelLocationDetail', meta: { title: 'Chi tiết địa điểm' }, component: () => import('./pages/LocationDetail.vue') },

      { path: 'di-tich', name: 'MaplibreTravelRelics', meta: { title: 'Phân khu / Di tích' }, component: () => import('./pages/RelicList.vue') },
      { path: 'di-tich/:id', name: 'MaplibreTravelRelicDetail', meta: { title: 'Chi tiết di tích' }, component: () => import('./pages/RelicDetail.vue') },

      { path: 'le-hoi', name: 'MaplibreTravelFestivals', meta: { title: 'Sự kiện và lễ hội' }, component: () => import('./pages/FestivalList.vue') },
      { path: 'le-hoi/:id', name: 'MaplibreTravelFestivalDetail', meta: { title: 'Chi tiết lễ hội' }, component: () => import('./pages/FestivalDetail.vue') },

      { path: 'tuyen-du-lich', name: 'MaplibreTravelTours', meta: { title: 'Tuyến du lịch' }, component: () => import('./pages/TourList.vue') },
      { path: 'tuyen-du-lich/:id', name: 'MaplibreTravelTourDetail', meta: { title: 'Chi tiết tuyến' }, component: () => import('./pages/TourDetail.vue') },

      { path: 'doi-tuong-3d/:id', name: 'MaplibreTravelObject3d', meta: { title: 'Đối tượng 3D' }, component: () => import('./pages/Object3dDetail.vue') },
    ],
  },
]

export default function (path) {
  return ARRROUTER.map((item) => {
    if (path) item.path = '/' + path + item.path
    return item
  })
}
