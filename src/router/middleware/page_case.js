import Token from "../../helpers/user/user";
import API from "../../helpers/api/useAxios.js";
import { setPermissionApp } from "../../state/dataUser.js";

const checkLogout = (isPublic, next) => {
  Token().removeUser();
  if (isPublic) {
    next('/'); // Chuyển hướng đến trang chính
  } else {
    next('/login'); // Chuyển hướng đến trang đăng nhập
  }
};

const checkManage = async (matched, next, isLogin = false) => {
  let path = matched[0]?.path
  if (path) {
    path =  path.endsWith("/") ? path.slice(0, -1) : path
    const data = await API().get(`cpuia/?app=${path}`);
    setPermissionApp(matched[0].name, data);
    if (!data?.can_access && !isLogin) {
      next({ path: '/login'})
    }
    if (!data?.can_access && isLogin) {
      next({ path: "/error-403" });
      return;
    }
    next();
  }
  else {
    
    next({ path: "/error-404" });
  }
};

export { checkLogout, checkManage };
