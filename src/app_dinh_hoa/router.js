const ARRROUTER = [
  {
    path: "/v2",
    component: () => import("@/app_dinh_hoa/layout/LayoutDinhHoa.vue"),
    redirect: { name: "DinhHoaTrangChuV2" },
    children: [
      {
        path: "",
        name: "DinhHoaTrangChuV2",
        meta: { title: "Bản đồ Di tích Lịch sử Xã Định Hóa - Thủ Đô Kháng Chiến ATK" },
        component: () => import("./pages/LandingDinhHoa.vue"),
      },
    ],
  },
];

export default function (path) {
  if (!path || path === "v2") return ARRROUTER;
  return ARRROUTER.map((item) => {
    const cloned = { ...item };
    cloned.path = "/" + path;
    return cloned;
  });
}
