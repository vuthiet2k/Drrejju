
export default (url_root) => {
  const defName = "object3dManage"
  const ROUTER_DATA_MANAGE = [
    {
      path: "/manage/object3d",
      name: "object3dManage",
      meta: {
        title: "Quản lý đối tượng 3d",
        icon: "ri-settings-3-line",
        name: "Quản lý đối tượng 3d",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: defName,
        requiresAuth: true,
        cpuiaPermission: true,
      },
      props: {
        nameKCN: "Quản lý đối tượng 3d",
      },
      component: () =>
        import(
          "./pages/ManageObject3d.vue"
        ),
    },
    {
      path: "/manage/object3d",
      name: "object3dManageSub",
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
        nameKCN: "Đối tượng 3d",
      },
      component: () =>
        import(
          "./pages/ManageObject3d.vue"
        ),
    },
  ];

  ROUTER_DATA_MANAGE.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return ROUTER_DATA_MANAGE;
};
