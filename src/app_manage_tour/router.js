
export default (url_root) => {
  const defName = "systemManage"
  const ROUTER_DATA_MANAGE = [
    {
      path: "/manage/tour",
      name: "tourManage",
      meta: {
        title: "Quản lý tuyến du lịch",
        icon: "ri-settings-3-line",
        name: "Quản lý tuyến du lịch",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Quản lý tuyến du lịch",
      },
      component: () =>
        import(
          "./pages/ManageTour.vue"
        ),
    },
    {
      path: "/manage/tour",
      name: "tourManage",
      meta: {
        title: "Danh sách",
        icon: "ri-settings-3-line",
        name: "Danh sách",
        showMenu: false,
        showNavSubMenu: true,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Quản lý tuyến du lịch",
      },
      component: () =>
        import(
          "./pages/ManageTour.vue"
        ),
    }
  ];

  ROUTER_DATA_MANAGE.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return ROUTER_DATA_MANAGE;
};
