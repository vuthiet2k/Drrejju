import { SERVER_URL } from "@/helpers/utils/config_system.js";
const SSO_LOGIN_URL = `${SERVER_URL}/api/sso/login`;
export default (url_root) => {
  const ROUTER_DATA_MANAGE = [
    {
      path: "/login",
      name: "Login",
      meta: {
        title: "Đăng nhập",
      },
      component: () => import("./pages/Login.vue"),
    },
    {
      path: "/login-sso",
      name: "LoginSSO",
      meta: {
        title: "Đăng nhập",
      },
      redirect: () => {
        window.location.href = SSO_LOGIN_URL
      },
    },
    {
      path: "/forgot",
      name: "Forgot",
      meta: {
        title: "Quên mật khẩu",
      },
      props: {},
      component: () => import("./pages/Forgot.vue"),
    },
    {
      path: "/logout",
      name: "Logout",
      meta: {
        title: "Đăng xuất",
      },
      props: {},
    },
    {
      path: "/error-403",
      name: "Error403",
      meta: {
        title: "403 - Không có quyền truy cập!",
      },
      props: {},
      component: () => import("./errors/403.vue"),
    },
    {
      path: "/error-404",
      name: "Error404",
      meta: {
        title: "404 - Không tìm thấy!",
      },
      props: {},
      component: () => import("./errors/404.vue"),
    },
    {
      path: "/change-password",
      name: "ProfileChangePassword",
      meta: { title: "Thay đổi mật khẩu" },
      component: () => import("./pages/ChangePW.vue"),
    },
    // THÊM ROUTE CATCH-ALL 404
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      redirect: "/error-404"
    }
  ];

  // SỬA LẠI PHẦN MAP
  const processedRoutes = ROUTER_DATA_MANAGE.map(router => {
    const newRouter = { ...router }; // Tạo bản copy để không mutate object gốc
    if (url_root) {
      newRouter.path = `/${url_root}${router.path}`;
    }
    return newRouter;
  });

  return processedRoutes; // TRẢ VỀ MẢNG ĐÃ XỬ LÝ
};