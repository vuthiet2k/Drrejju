import { defineStore } from "pinia";
import { useFetch, usePost, usePatch, useDelete } from "@/helpers/api/api.js";
import { BASE_URL } from "@/helpers/api/axiosHttp.js";

import { successToast, errorToast } from "@/helpers/api/toastStyle";

import useSwal from "@/base/common/useSwal.js";

const { confirmAction, confirmDelete } = useSwal(); 

const PROXY = BASE_URL.endsWith('/') ? BASE_URL + 'api' : BASE_URL + '/' + 'api';

const appSetting = {
  slug: "lmhtx",
  name: "Ứng dụng",
  sourceApi: "app-installed",
};

export const useManageAppStore = defineStore("useManageAppStore", () => {
  const getListApps = async function (currentPage) {
    let data = null;
    currentPage = currentPage ? `&page=${currentPage}` : "";
    await useFetch(PROXY + `/${appSetting.sourceApi}/?per_page=12${currentPage}`).then(res => {
      data = res;
    });
    return data;
  };

  const getSystemConfig = async function () {
    const data = await useFetch(PROXY + "/system-config/");
    return data;
  };

  const updateSystemConfig = async function (newConfigs) {
    const formData = new FormData();
    const jsonFields = [];
    for (let [key, value] of Object.entries(newConfigs)) {
      if (jsonFields.includes(key)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }

    const result = await confirmAction(`
      <div>
        <strong class="text-danger text-uppercase">Cảnh báo: Cập nhật cấu hình hệ thống</strong>
        <br>
        <span class="ml-2"><em>Bạn chắc chắn muốn tiếp tục không?</em></span>
      </div>
    `);

    if (!result.isConfirmed) {
      return;
    }

    const resp = await usePatch("/system-config/", formData);
    if (resp) {
      successToast("Cập nhật cấu hình cài đặt thành công!");
    } else {
      errorToast("Cập nhật cấu hình cài đặt thất bại, vui lòng thử lại sau!");
    }
    return resp;
  };

  const getListFullApps = async function () {
    let data = null;
    await useFetch(PROXY + `/${appSetting.sourceApi}/get-list-app`).then(res => {
      data = res;
    });
    return data;
  };

  const getAppDetail = async function (objId) {
    let data = null;
    await useFetch(PROXY + `/${appSetting.sourceApi}/${objId}`).then(res => {
      data = res;
    });
    return data;
  };

  const getUsersCanAccessApp = async function (objId) {
    let data = null;
    await useFetch(PROXY + `/${appSetting.sourceApi}/${objId}/get-pusers-in-app/?all`).then(res => {
      data = res;
    });
    return data;
  };

  const getAllRolesInApp = async function (objId) {
    let data = null;
    await useFetch(PROXY + `/${appSetting.sourceApi}/${objId}/get-roles-in-app/?all`).then(res => {
      data = res;
    });
    return data;
  };

  const convertDate = function (date) {
    if (date) {
      const bDate = date.split("T")[0];
      const bYear = bDate.split("-")[0];
      const bMont = bDate.split("-")[1];
      const bDay = bDate.split("-")[2];
      return `${bDay}/${bMont}/${bYear}`;
    }
  };

  const processUpdateTime = function (updateTime) {
    const currentTime = new Date();
    const updateDate = new Date(updateTime);

    const timeDiff = currentTime - updateDate;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return `Cập nhật vài giây trước`;
    } else if (minutes < 60) {
      return `Cập nhật ${minutes} phút trước`;
    } else if (hours < 24) {
      return `Cập nhật ${hours} giờ trước`;
    } else if (days < 7) {
      return `Cập nhật ${days} ngày trước`;
    } else if (weeks < 4) {
      return `Cập nhật ${weeks} tuần trước`;
    } else if (months < 12) {
      return `Cập nhật ${months} tháng trước`;
    } else {
      return `Cập nhật ${years} năm trước`;
    }
  };

  const updateUserRoleInApp = async function (userId, appRoles) {
    let isSuccess = false;
    const formData = new FormData();
    formData.append("user", userId);
    formData.append("roles", JSON.stringify(appRoles));
    await usePost(`role-app/set-role/`, formData).then(response => {
      if (response.status == 200) {
        isSuccess = true;
      }
    });
    return isSuccess;
  };

  const updateListUsersRoleInApp = async function (users) {
    let isSuccess = true;
    for (const user of users) {
      const isDone = await updateUserRoleInApp(user.userId, user.permissions);
      if (!isDone) {
        isSuccess = isDone;
      }
    }
    return isSuccess;
  };

  const getUsersCanAddToApp = async function (appId) {
    let data = null;
    await useFetch(PROXY + `/app-installed/${appId}/get-users-can-add-to-app/?all=1`).then(res => {
      data = res;
    });
    return data;
  };

  const getAllPersInApp = async function (appId) {
    let data = null;
    await useFetch(PROXY + `/app-installed/${appId}/get-permissions-in-app/`).then(res => {
      data = res;
    });
    return data;
  };

  const createAppRole = async function (obj) {
    let isSuccess = false;
    const formData = new FormData();
    formData.append("application", obj.appId);
    formData.append("name", obj.name);
    formData.append("description", obj.description);
    formData.append("permissions", JSON.stringify(obj.permissions));
    await usePost(`role-app/`, formData).then(response => {
      if (response.status == 200) {
        isSuccess = true;
      }
    });
    return isSuccess;
  };

  const updateAppRole = async function (obj, roleId, users = null) {
    let isSuccess = false;
    const formData = new FormData();
    formData.append("application", obj.appId);
    formData.append("name", obj.name);
    formData.append("description", obj.description);
    formData.append("permissions", JSON.stringify(obj.permissions));
    if (users != null) {
      formData.append("users", JSON.stringify(users));
    }
    await usePatch(`role-app/${roleId}/`, formData).then(response => {
      if (response.status == 200) {
        isSuccess = true;
      }
    });
    return isSuccess;
  };
  const getRoleDetail = async function (objId) {
      let data = null
      await useFetch(PROXY + `/role-app/${objId}`).then(res => {
        data = res
      })
      return data
    }

  const deleteRole = async function (objId) {
    const result = await confirmDelete("Chắc chắn xóa vai trò này?");
    if (!result.isConfirmed) {
      return;
    }

    let isSuccess = false;
    await useDelete(`/role-app/${objId}`).then(async response => {
      const data = await response.json();
      if (data?.instance) {
        successToast("Xóa vai trò thành công!");
        isSuccess = true;
      } else {
        errorToast(data?.message);
      }
    });
    return isSuccess;
  };

  const validRole = function (obj) {
    if (!obj.name) {
      errorToast("Vui lòng nhập tên vai trò");
      return false;
    }
    if (!obj.permissions.length) {
      errorToast("Vui lòng chọn ít nhất 1 quyền cho vai trò!");
      return false;
    }
    return true;
  };

  return {
    appSetting,
    getListApps,
    getSystemConfig,
    updateSystemConfig,
    getListFullApps,
    getAppDetail,
    getUsersCanAccessApp,
    getAllRolesInApp,
    convertDate,
    processUpdateTime,
    updateUserRoleInApp,
    updateListUsersRoleInApp,
    getUsersCanAddToApp,
    getAllPersInApp,
    createAppRole,
    updateAppRole,
    deleteRole,
    validRole,
    getRoleDetail,
  };
});
