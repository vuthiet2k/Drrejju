export default function (url_root) {
  const USER_ROUTER = [
    {
      path: "/",
      name: "UserManagementLayout",
      redirect: { name: "manageUser" },
      meta: {
        title: "QUẢN LÝ NGƯỜI DÙNG",
        name: "Người dùng",
        showMenu: true,
        showNavSubMenu: false,
        belongTo: "systemManage",
        requiresAuth: true,
        cpuiaPermission: true,
      },
      component: () => import("@/base/layouts/LayoutDtwin2025.vue"),
      children: [
        {
          path: "list",
          name: "manageUser",
          meta: {
            title: "QUẢN LÝ NGƯỜI DÙNG",
            icon: "ri-account-circle-line",
            name: "Tài khoản",
            showMenu: false,
            showNavSubMenu: true,
            belongTo: "systemManage",
            requiresAuth: true,
            cpuiaPermission: true,
          },
          props: {
            nameKCN: "NGƯỜI DÙNG",
          },
          component: () => import("../app_user/pages/ManageUser.vue"),
        },
        {
          path: "permissions",
          name: "manageGroup",
          meta: {
            title: "QUẢN LÝ PHÂN QUYỀN",
            icon: "ri-pages-line",
            name: "Phân quyền",
            showMenu: false,
            showNavSubMenu: true,
            belongTo: "systemManage",
            requiresAuth: true,
            cpuiaPermission: true,
          },
          props: {
            nameKCN: "NGƯỜI DÙNG",
          },
          component: () => import("../app_user/pages/manage_group/ManageGroup.vue"),
        },
        {
          path: "role",
          name: "manageRole",
          meta: {
            title: "QUẢN LÝ VAI TRÒ NGƯỜI DÙNG",
            icon: "ri-briefcase-line",
            name: "Vai trò",
            showMenu: false,
            showNavSubMenu: true,
            belongTo: "systemManage",
            requiresAuth: true,
            cpuiaPermission: true,
          },
          props: {
            nameKCN: "NGƯỜI DÙNG",
          },
          component: () => import("../app_user/pages/manage_role/ManageRole.vue"),
        },
        // {
        //   path: "log-auth",
        //   name: "manageLogAuth",
        //   meta: {
        //     title: "manage-log-auth",
        //     icon: "ri-pages-line",
        //     name: "Nhật ký",
        //     showMenu: false,
        //     showNavSubMenu: true,
        //     belongTo: "systemManage",
        //   },
        //   props: {
        //     nameKCN: "NGƯỜI DÙNG",
        //   },
        //   component: () => import("../app_user/pages/manage_log/ManageLog.vue"),
        // },
      ]
    },
    // {
    //   path: "/log-auth",
    //   name: "manageLogAuth",
    //   meta: {
    //     title: "manage-log-auth",
    //     icon: "ri-pages-line",
    //     name: "Nhật ký",
    //     showMenu: false,
    //     showNavSubMenu: true,
    //     belongTo: "systemManage",
    //   },
    //   props: {
    //     nameKCN: "NGƯỜI DÙNG",
    //   },
    //   component: () => import("../app_user/pages/manage_log/ManageLog.vue"),
    // },
  ];

  USER_ROUTER.map((router) => {
    router.path = url_root ? "/" + url_root + router.path : router.path;
  });
  return [
    ...USER_ROUTER,
    // {
    //   path: "/profile/detail",
    //   name: "Profile",
    //   meta: { title: "Thông tin cá nhân" },
    //   component: () => import("./pages/public/Profile.vue"),
    // },
    // {
    //   path: "/profile/edit",
    //   name: "ProfileUpdate",
    //   meta: { title: "Cập nhật thông tin cá nhân" },
    //   component: () => import("./pages/public/UpdateProfile.vue"),
    // },
    {
      path: "/account",
      name: "ProfileGroup",
      meta: {
        title: "Hồ sơ cá nhân",
        // group: "profile",
        icon: "ri-user-line",
      },
      component: () =>
        import("./layout/LayoutWrapper.vue")
      ,
      children: [
        {
          path: "/dashboard",
          name: "ProfileDashboard",
          meta: {
            title: "Dashboard",
            group: "profile",
            icon: "ri-dashboard-line",
            order: 1
          },
          component: () => import("./pages/public/Dashboard.vue"),
        },
        {
          path: "/profile",
          name: "Profile",
          meta: {
            title: "Thông tin",
            group: "profile",
            icon: "ri-user-line",
            order: 2
          },
          component: () => import("./pages/public/Profile.vue"),
        },
        {
          path: "/security",
          name: "ProfileSecurity",
          meta: {
            title: "Bảo mật",
            group: "profile",
            icon: "ri-shield-keyhole-line",
            order: 6
          },
          component: () => import("./pages/public/Security.vue"),
        },
        {
          path: "/tracking",
          name: "ProfileTracking",
          meta: {
            title: "Theo dõi",
            group: "profile",
            icon: "ri-eye-line",
            order: 4
          },
          component: () => import("./pages/public/Tracking.vue"),
        },
        {
          path: "/bookmarks",
          name: "ProfileBookmarks",
          meta: {
            title: "Đánh dấu",
            group: "profile",
            icon: "ri-bookmark-line",
            order: 5
          },
          component: () => import("./pages/public/Bookmarks.vue"),
        },
        {
          path: "/notifications",
          name: "ProfileNotifications",
          meta: {
            title: "Thông báo",
            group: "profile",
            icon: "ri-notification-2-line",
            order: 7
          },
          component: () => import("./pages/manage_notify/Notifications.vue"),
        },
        // {
        //   path: "/settings",
        //   name: "ProfileSettings",
        //   meta: {
        //     title: "Cấu hình",
        //     group: "profile",
        //     icon: "ri-settings-3-line",
        //     order: 7
        //   },
        //   component: () => import("./pages/public/Settings.vue"),
        // },
      ]
    }
  ];
}
