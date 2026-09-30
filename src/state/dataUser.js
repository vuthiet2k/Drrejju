import { ref } from "vue";

const userState = ref({});

const permissionState = ref({});

const setPermissionApp = (nameApp, permission) => {
  if (!nameApp) return;
  permissionState.value[nameApp] = { ...permission };
};

const getPermissionApp = (nameApp) => {
  if (!permissionState.value[nameApp]) return {};
  return permissionState.value[nameApp];
};

export default userState;

export { permissionState, setPermissionApp, getPermissionApp };
