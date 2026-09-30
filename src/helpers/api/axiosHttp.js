// src/helpers/api/axiosHttp.js
import axios from "axios";
import { SERVER_URL } from "@/helpers/utils/config_system.js";
import { getAccessToken } from "@/helpers/api/token.js";

export const BASE_URL = SERVER_URL;

// Tạo axios instance
const http = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: true, // 🔥 QUAN TRỌNG
  credentials: "include"
});

// Dùng interceptor để gắn Authorization mỗi lần gửi request
http.interceptors.request.use(async (config) => {
  const token = await getAccessToken(); // tự kiểm tra hết hạn, refresh nếu cần
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

export default http;
