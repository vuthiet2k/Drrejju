export default (url_root) => {
  const ROUTES = [
    {
      path: "/vr360-builder",
      name: "Vr360BuilderTool",
      meta: { title: "VR360 Builder" },
      component: () => import("./pages/Vr360Builder.vue"),
    },
  ];

  ROUTES.forEach((r) => {
    r.path = url_root ? "/" + url_root + r.path : r.path;
  });
  return ROUTES;
};
