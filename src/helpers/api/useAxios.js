import axios from "axios";
import axiosHttp from "@/helpers/api/axiosHttp.js";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import { getAccessToken } from "@/helpers/api/token.js"

// Hàm xử lý lỗi chung
const handleError = (err, isErrorToast) => {
  const status = err?.response?.status?.toString();
  const temErr = err?.response?.data ?? err;

  if (isErrorToast) {
    // Ép kiểu status về string để so sánh ổn định
    const statusCode = String(status);

    switch (statusCode) {
      case "400":
        // Xử lý trường hợp lỗi serializer Django
        if (temErr && typeof temErr === 'object') {
          // Lấy tất cả các message lỗi từ các trường
          const errorMessages = [];

          for (const key in temErr) {
            if (Array.isArray(temErr[key])) {
              // Nếu là array của các lỗi
              errorMessages.push(...temErr[key]);
            } else if (typeof temErr[key] === 'string') {
              // Nếu là string trực tiếp
              errorMessages.push(temErr[key]);
            }
          }

          if (errorMessages.length > 0) {
            errorToast(errorMessages.join(', '));
            break;
          }
        }

        // Fallback cho các trường hợp khác
        errorToast(temErr?.msg ?? temErr?.message ?? "Bad request");
        break;
      case "404":
        errorToast(temErr?.msg ?? temErr?.message ?? "404 not found");
        break;
      default:
        errorToast(isErrorToast);
        break;
    }
  }

  return {
    ...temErr,
    ok: false,
    error: true
  };
};

const API = () => {
  const call = async (url) => {
    try {
      const token = await getAccessToken()
      const response = await axios.create({
        headers: {
          Authorization: token,
        },
      }).get(url);
      return { ...response.data, ok: true };
    } catch (err) {
      return handleError(err, true);
    }
  };

  const get = async (url, responseType = "json", isErrorToast) => {
    try {
      const response = await axiosHttp.get(url, { responseType });
      const data = await response.data;
      return data;
    } catch (err) {
      return handleError(err, isErrorToast);
    }
  };

  const post = async (url, dataPost, isSuccessToast = false, isErrorToast = false) => {
    try {
      const response = await axiosHttp.post(url, dataPost);
      if (isSuccessToast) successToast(isSuccessToast);
      return response.data;
    } catch (err) {
      return handleError(err, isErrorToast);
    }
  };

  const put = async (url, dataPost, isSuccessToast = false, isErrorToast = false) => {
    try {
      const response = await axiosHttp.put(url, dataPost);
      if (isSuccessToast) successToast(isSuccessToast);
      return { ...response.data, ok: true };
    } catch (err) {
      return handleError(err, isErrorToast);
    }
  };

  const patch = async (url, dataPost, isSuccessToast = false, isErrorToast = false) => {
    try {
      const response = await axiosHttp.patch(url, dataPost);
      if (isSuccessToast) successToast(isSuccessToast);
      return { ...response.data, ok: true };
    } catch (err) {
      return handleError(err, isErrorToast);
    }
  };

  const remove = async (url, isSuccessToast = false, isErrorToast = false) => {
    try {
      const response = await axiosHttp.delete(url);
      if (isSuccessToast) successToast(isSuccessToast);
      return { ...response.data, ok: true };
    } catch (err) {
      return handleError(err, isErrorToast);
    }
  };
  const custom = async (config, isSuccessToast = false, isErrorToast = false) => {
    try {
      const response = await axiosHttp.request(config);
      if (isSuccessToast) successToast(isSuccessToast);
      return { ...response.data, ok: true };
    } catch (err) {
      return handleError(err, isErrorToast);
    }
  };

  return { get, post, put, patch, remove, call, custom };
};

export default API;
