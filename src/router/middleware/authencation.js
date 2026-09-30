import userState from "../../state/dataUser";
import { checkLogout, checkManage } from "./page_case.js";

function getFullCasePath(paths) {
  let extendPaths = []
  paths.forEach(originPath => {
    const extendPs = [originPath, `/${originPath}`, `/${originPath}/`]
    extendPaths = [...extendPaths, ...extendPs]
  })
  return extendPaths
}

const RouterCheck = async (to, from, next) => {
  // Kiểm tra trạng thái đăng nhập
  const isUserLogined = userState.value?.id || false;
  const { name, matched, fullPath } = to;
  const requiresAuth = matched[0]?.meta?.requiresAuth || false;

  // Danh sách các route không yêu cầu đăng nhập
  const systemPath = getFullCasePath(['system']);
  const authPath = getFullCasePath(['login', 'register', 'forgot', 'posterPlace', 'posterTours', 'MapGL.index', 'MapGL.index2', 'MapGL.index3']);
  const errorsPath = getFullCasePath(['error-403', 'error-404']);
  const autoPassPath = [...systemPath, ...authPath, ...errorsPath];

  const logoutPath = getFullCasePath(['logout']);

  // Xử lý khi người dùng chọn Logout
  if (logoutPath.includes(fullPath)) {
    checkLogout(requiresAuth, next);
    return;
  }

  // Xử lý các trang được phép tự động truy cập
  if (autoPassPath.includes(fullPath)) {
    next();
    return;
  }

  // Kiểm tra các trang yêu cầu quyền
  if (requiresAuth && !isUserLogined) {
    next('/login');
    return;
  }

  if (isUserLogined) {
    const authRoutes = ["Login", "Register", "ResetPassword"];
    if (authRoutes.includes(name)) {
      next('/');
    } else if (name === "Home") {
      next();
    } else if (name === "Logout") {
      checkLogout(requiresAuth, next);
    } else if (matched.some((record) => record.meta.cpuiaPermission)) {
      await checkManage(matched, next, isUserLogined);
    } else {
      next();
    }
  } else {
    next();
  }
};


export { RouterCheck };
