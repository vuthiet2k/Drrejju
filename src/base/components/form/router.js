export default function (url_root) {
  const USER_ROUTER = [
    {
      path: "/",
      name: "manageGroup",
      meta: {
        title: "QUẢN LÝ NHÓM NGƯỜI DÙNG",
        icon: "ri-pages-line",
        name: "Nhóm",
        showMenu: false,
        showNavSubMenu: true,
        belongTo: "systemManage",
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "NGƯỜI DÙNG",
      },
      component: () => import("./builder/FormManage.vue"),
    }
  ];

  USER_ROUTER.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return USER_ROUTER;
}
