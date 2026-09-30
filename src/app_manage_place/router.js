
export default (url_root) => {
  const defName = "systemManage"
  const ROUTER_DATA_MANAGE = [
    {
      path: "place",
      name: "placeManage",
      meta: {
        title: "Quản lý địa điểm",
        icon: "ri-settings-3-line",
        name: "Quản lý địa điểm",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Quản lý địa điểm",
      },
      component: () =>
        import(
          "./pages/ManagePlace.vue"
        ),
    },
    {
      path: "place",
      name: "placeManageSub",
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
        nameKCN: "Địa điểm",
      },
      component: () =>
        import(
          "./pages/ManagePlace.vue"
        ),
    },
    {
      path: "place/type",
      name: "placeManageType",
      meta: {
        title: "Quản lý loại địa điểm",
        icon: "ri-settings-3-line",
        name: "Loại địa điểm",
        showMenu: false,
        showNavSubMenu: true,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Loại địa điểm",
      },
      component: () =>
        import(
          "./pages/ManagePlaceType.vue"
        ),
    },
    // {
    //   path: "/manage/place/form",
    //   name: "placeManageForm",
    //   meta: {
    //     title: "Quản lý loại địa điểm",
    //     icon: "ri-settings-3-line",
    //     name: "Loại địa điểm",
    //     showMenu: false,
    //     showNavSubMenu: true,
    //     belongTo: defName,
    //     requiresAuth: true,
    //     cpuiaPermission: true,
    //   },
    //   props: {
    //     nameKCN: "Loại địa điểm",
    //   },
    //   component: () =>
    //     import(
    //       "./pages/TestCKEditor.vue"
    //     ),
    // }
  ];

  ROUTER_DATA_MANAGE.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return ROUTER_DATA_MANAGE;
};
