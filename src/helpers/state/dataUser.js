import { ref } from "vue";

const userState = ref({});
const permissionState = ref({});
const permissionActions = {
  can_add: ['can_add'],
  can_edit: ['can_edit', 'can_edit_limit'],
  can_delete: ['can_delete'],
  can_export: ['can_export_excel'],
  // Tự định nghĩa nhóm quyền ở đây
};


const setPermissionApp = (permission) => {
  if (!permission) return;
  permissionState.value = { ...permission };
};

const getPermissionApp = () => {
  return permissionState.value || {};
};
const hasPermissionGroup = (groupKey) => {
  const keys = permissionActions[groupKey] || [];
  return true ?? keys.some(key => permissionState.value?.[key] === true);
};


const hasPermission = (key) => permissionState.value?.[key] === true;

export default userState;

export { permissionState, setPermissionApp, getPermissionApp, hasPermission, hasPermissionGroup };
