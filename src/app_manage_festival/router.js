
export default (url_root) => {
  const defName = "systemManage"
  const ROUTER_DATA_MANAGE = [
    {
      path: "/manage/festival",
      name: "festivalManage",
      meta: {
        title: "Quản lý lễ hội",
        icon: "ri-settings-3-line",
        name: "Quản lý lễ hội",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Quản lý lễ hội",
      },
      component: () =>
        import(
          "./pages/ManageFestival.vue"
        ),
    },
    {
      path: "/manage/festival",
      name: "festivalManageSub",
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
        nameKCN: "Quản lý lễ hội",
      },
      component: () =>
        import(
          "./pages/ManageFestival.vue"
        ),
    },
    {
      path: "/manage/festival/type",
      name: "festivalTypeManage",
      meta: {
        title: "Quản lý loại lễ hội",
        icon: "ri-settings-3-line",
        name: "Loại lễ hội",
        showMenu: false,
        showNavSubMenu: true,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Loại lễ hội",
      },
      component: () =>
        import(
          "./pages/ManageFestivalType.vue"
        ),
    }
  ];

  ROUTER_DATA_MANAGE.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return ROUTER_DATA_MANAGE;
};
