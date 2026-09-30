export default (url_root) => {
  const ROUTER_DATA_MANAGE = [
    {
      path: "/tree-select",
      name: "demoTreeSelect",
      meta: {
        title: "DEMO TREE-SELECT",
        icon: "ri-archive-line",
        name: "TREE-SELECT",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: "manage",
      },
      props: {
        nameKCN: "SẢN PHẨM",
      },
      component: () =>
        import("@/base/components/tree-select/Demo.vue"),
    },
    {
      path: "/select",
      name: "demoSelect",
      meta: {
        title: "DEMO SELECT",
        icon: "ri-archive-line",
        name: "SELECT",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: "manage",
      },
      props: {
        nameKCN: "SELECT",
      },
      component: () =>
        import("@/base/components/select/Demo.vue"),
    }
  ];

  ROUTER_DATA_MANAGE.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return ROUTER_DATA_MANAGE;
};
