// token.js - Bổ sung thêm remember me logic
import { BASE_URL } from "../api/axiosHttp.js";

// ======================
// ⚙️ TOKEN CORE với Remember Me
// ======================

// Constants
const AUTH_STORAGE_KEYS = {
  REMEMBER_ME: 'remember_me',
  AUTH_DATA: 'auth',
  SESSION_AUTH: 'session_auth'
}

export const setToken = (tokenData, rememberMe = false) => {
  const now = Date.now();
  tokenData.expire_at = now + tokenData.expires_in * 1000;

  if (rememberMe) {
    // Lưu vào localStorage (lâu dài)
    localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_DATA, JSON.stringify(tokenData));
    localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
    // Xóa session storage để tránh conflict
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_AUTH);
  } else {
    // Lưu vào sessionStorage (chỉ trong phiên)
    sessionStorage.setItem(AUTH_STORAGE_KEYS.SESSION_AUTH, JSON.stringify(tokenData));
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_DATA);
  }
};

export const getTokenData = () => {
  // Kiểm tra remember me trước
  const isRememberMe = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';

  if (isRememberMe) {
    const tokenString = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_DATA);
    return tokenString ? JSON.parse(tokenString) : null;
  } else {
    const tokenString = sessionStorage.getItem(AUTH_STORAGE_KEYS.SESSION_AUTH);
    return tokenString ? JSON.parse(tokenString) : null;
  }
};

export const clearToken = () => {
  // Xóa cả hai storage
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_DATA);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_AUTH);
};

export const isTokenExpired = () => {
  const token = getTokenData();
  if (!token || !token.expire_at) return true;
  return Date.now() >= token.expire_at;
};

export const hasRememberMe = () => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';
};

import { debounce } from 'lodash';

const _refreshAccessToken = async () => {
  const tokenData = getTokenData();
  if (!tokenData?.refresh_token) {
    clearToken();
    throw new Error("No refresh token found");
  }

  const formData = new FormData();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', tokenData.refresh_token);

  const res = await fetch(`${BASE_URL}/api/login/`, {
    method: "POST",
    body: formData,
    credentials: "include", // Thêm dòng này để gửi/lưu cookie
  });

  if (!res.ok) {
    clearToken();
    throw new Error("Refresh token invalid or expired");
  }

  const newToken = await res.json();

  // Giữ nguyên remember me setting khi refresh
  const rememberMe = hasRememberMe();
  setToken(newToken, rememberMe);

  return newToken;
};

// Debounce chỉ để tránh gọi API nhiều lần
const debouncedRefresh = debounce(async (resolve, reject) => {
  try {
    const result = await _refreshAccessToken();
    resolve(result);
  } catch (error) {
    reject(error);
  }
}, 300);

export const refreshAccessToken = () => {
  return new Promise((resolve, reject) => {
    debouncedRefresh(resolve, reject);
  });
};

export const getAccessToken = async () => {
  let token = getTokenData();

  if (!token) return null;

  // Hết hạn → refresh
  if (isTokenExpired()) {
    try {
      token = await refreshAccessToken();
    } catch (err) {
      console.warn("Token refresh failed:", err);
      return null;
    }
  }

  return `Bearer ${token.access_token}`;
};