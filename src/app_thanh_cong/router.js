import { SITE_SLUG_BY_SHORT_ID } from "./common/shortLinks.js";

const ARRROUTER = [
  {
    path: "/",
    component: () => import("@/app_thanh_cong/layout/LayoutThanhCong.vue"),
    redirect: { name: "ThanhCongTrangChu" },
    children: [
      {
        path: "",
        name: "ThanhCongTrangChu",
        meta: { title: "Bản đồ di tích Xã Thành Công" },
        component: () => import("./pages/LandingThanhCong.vue"),
      },
      {
        // Demo trần dùng để verify UI package vr360-viewer-yt (không dùng
        // data thật, chạy fixture demo-tour.json).
        path: "vr360-yt-demo",
        name: "ThanhCongVr360YtDemo",
        meta: { title: "VR360 YT - Demo" },
        component: () => import("@/vr360-viewer-yt/pages/ViewerYtDemoPage.vue"),
      },
      {
        path: "vr360-tu-dong",
        name: "ThanhCongVr360Auto",
        meta: { title: "VR360 tự động - 09 điểm di tích" },
        component: () => import("./pages/AutoTourThanhCong.vue"),
      },
      {
        // Bản đồ 3D dùng layout chuẩn (Header + Footer), khung bản đồ đóng
        // trong container 1180px giống các trang nội dung khác.
        path: "mo-hinh-3d",
        name: "ThanhCongMoHinh3D",
        meta: { title: "Bản đồ 3D chi tiết" },
        component: () => import("./pages/Model3DThanhCong.vue"),
      },
      // ===== ĐIỂM DI TÍCH =====
      {
        // Cửa vào rút gọn cho mã QR in tại thực địa: /dt/1 … /dt/9. Chỉ
        // chuyển hướng sang đường dẫn chuẩn /di-tich/<slug> (giữ nguyên
        // query, ví dụ ?tab=anh); số không hợp lệ thì đưa về trang chủ.
        path: "dt/:n",
        redirect: (to) => {
          const slug = SITE_SLUG_BY_SHORT_ID[to.params.n];
          return slug
            ? { name: "ThanhCongChiTietDiTich", params: { slug }, query: to.query }
            : { name: "ThanhCongTrangChu" };
        },
      },
      {
        path: "di-tich/:slug",
        name: "ThanhCongChiTietDiTich",
        meta: { title: "Chi tiết di tích" },
        component: () => import("./pages/heritage/HeritageDetail.vue"),
      },

      // ===== CHỦ ĐỀ (ẩm thực / văn hóa / tín ngưỡng) =====
      {
        path: "chu-de/:slug",
        name: "ThanhCongChiTietChuDe",
        meta: { title: "Chi tiết chủ đề" },
        component: () => import("./pages/theme/ThemeDetail.vue"),
      },

      // ===== LỄ HỘI =====
      {
        path: "le-hoi/:slug",
        name: "ThanhCongChiTietLeHoi",
        meta: { title: "Chi tiết lễ hội" },
        component: () => import("./pages/festival/FestivalDetail.vue"),
      },
    ],
  },
  {
    // Layout full-screen riêng: chỉ Header + nội dung inset:0, không Footer
    // — dùng cho các trang cần chiếm trọn viewport.
    path: "/",
    component: () => import("@/app_thanh_cong/layout/LayoutThanhCongFullscreen.vue"),
    children: [
      {
        path: "ban-do",
        name: "ThanhCongBanDo",
        meta: { title: "Bản đồ số liên kết di tích" },
        component: () => import("./pages/MapThanhCong.vue"),
      },
      {
        path: "vr360",
        name: "ThanhCongVr360",
        meta: { title: "VR360 - 09 điểm di tích" },
        component: () => import("./pages/VR360ThanhCong.vue"),
      },
    ],
  },
];

export default function (path) {
  return ARRROUTER.map((item) => {
    if (path) item.path = "/" + path + item.path;
    return item;
  });
}
