// dataUser.js - Phiên bản đơn giản không đệ quy
import userState from "../state/dataUser.js";
import { getCompanyInfor } from "@/helpers/user/company.js";
import {
  resetApplications,
  getListApplications,
} from "@/helpers/user/applications.js";
import {
  getAccessToken,
  setToken,
  getTokenData,
  clearToken,
  hasRememberMe,
  refreshAccessToken
} from "../api/token.js";
import http from "../api/axiosHttp.js";
import { BASE_URL } from "../api/axiosHttp.js";

// Hàm call API user
async function fetchUserData(accessToken) {
  const response = await fetch(`${BASE_URL}/api/user/current-user/`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

export async function fetchUserInfo() {
  try {
    const response = await fetch(`${BASE_URL}/api/user/current-user/`, {
      method: "GET",
      credentials: "include", // 🔥 bắt buộc để gửi cookie
    });

    if (!response.ok) {
      throw new Error("Không lấy được thông tin người dùng");
    }

    const userData = await response.json();
    console.log(userData);

    // 👉 Gán thông tin user theo format bạn cần
    userState.value = {
      ...userData,
      isLogin: true,
    };
  } catch (error) {
    console.error("fetchUserInfo error:", error);
    throw error;
  }
}


const Token = () => {
  let isRefreshing = false; // Biến cờ để tránh refresh nhiều lần

  async function setUser(tokenData, rememberMe = false) {
    setToken(tokenData, rememberMe);
    // Gọi getUser trực tiếp
    return await getUser();
  }

  async function getUser(navigate = "") {
    const tokenData = getTokenData();
    const isRemembered = hasRememberMe();

    if (!tokenData) {
      handleNavigation(navigate);
      return;
    }

    let accessToken = await getAccessToken();
    if (!accessToken) {
      handleNavigation(navigate);
      return;
    }

    try {
      const userData = await fetchUserData(accessToken);
      return await processUserData(userData, tokenData, isRemembered);

    } catch (error) {
      if (error.message === 'UNAUTHORIZED' && !isRefreshing) {
        isRefreshing = true;
        try {
          // Refresh token và thử lại
          const newToken = await refreshAccessToken();
          if (newToken) {
            const userData = await fetchUserData(newToken);
            return await processUserData(userData, { ...tokenData, access_token: newToken }, isRemembered);
          }
        } finally {
          isRefreshing = false;
        }
      }

      console.error("Error fetching user:", error);
      handleNavigation(navigate);
      return null;
    }
  }

  // Hàm xử lý dữ liệu user (tách riêng)
  async function processUserData(userData, tokenData, isRemembered) {
    const newUser = {
      ...userData,
      token: tokenData.access_token,
      isLogin: true,
      rememberMe: isRemembered,
    };

    userState.value = { ...newUser };

    await getCompanyInfor();
    await getListApplications();

    return newUser;
  }

  function handleNavigation(navigate) {
    if (navigate) {
      // location.replace(`/account?next=${navigate}`);
    }
  }

  function removeUser() {
    try {
      http.get(`/sso/logout/`);
      http.post(`/logout/`);
    } catch (err) {
      console.warn("Logout error:", err);
    }
    clearToken();
    userState.value = {};
    // resetCompanyInfor();
    resetApplications();
  }

  async function initializeAuth() {
    const tokenData = getTokenData();
    if (!tokenData) return false;

    try {
      const user = await getUser();
      return !!user;
    } catch (error) {
      console.error("Auth initialization failed:", error);
      return false;
    }
  }

  return {
    getUser,
    setUser,
    removeUser,
    initializeAuth,
    hasRememberMe,
    fetchUserData
  };
};

export default Token;