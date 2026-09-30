const ARRROUTER = [
  {
    path: "/",
    name: "SystemConfig",
    redirect: { name: "SystemSecurityConfig" },
    meta: {
      title: "Cấu hình hệ thống",
      name: "Cấu hình hệ thống",
      showMenu: true,
      showNavSubMenu: false,
      requiresAuth: true,
      cpuiaPermission: true,
      icon: 'ri-list-settings-line'
    },
    component: () => import("@/base/layouts/LayoutDtwin2025.vue"),
    children: [
      {
        path: "/",
        name: "SystemSecurityConfig",
        meta: {
          title: "Cấu hình bảo mật",
          name: "Bảo mật",
          icon: "ri-list-settings-line",
          showMenu: false,
          showNavSubMenu: true,
          requiresAuth: true,
          cpuiaPermission: true,
        },
        component: () => import("./pages/security_config/SecurityConfig.vue"),
      },
      {
        path: "/email",
        name: "SystemEmailConfig",
        meta: {
          title: "Cấu hình Email",
          name: "Email",
          icon: "ri-mail-line",
          showMenu: false,
          showNavSubMenu: true,
          requiresAuth: true,
          cpuiaPermission: true,
        },
        component: () => import("./pages/security_config/EmailConfig.vue"),
      },

      {
        path: "/backup",
        name: "SystemBackupConfig",
        meta: {
          title: "Cấu hình Sao lưu",
          name: "Sao lưu",
          icon: "ri-database-2-line",
          showMenu: false,
          showNavSubMenu: true,
          requiresAuth: true,
          cpuiaPermission: true,
        },
        component: () => import("./pages/security_config/BackupConfig.vue"),
      }
    ]
  }
];

export default function (path) {
  return ARRROUTER.map((item) => {
    const newItem = { ...item };
    newItem.path = `/${path}${item.path}`;

    // Xử lý children paths
    if (newItem.children) {
      newItem.children = newItem.children.map(child => ({
        ...child,
        path: `/${path}${item.path === '/' ? '' : item.path}${child.path}`
      }));
    }

    return newItem;
  });
}