import axios from "axios";
import axiosHttp from "../../../helpers/api/axiosHttp.js";
import { errorToast } from "@/helpers/api/toastStyle";

const API = () => {
  const call = async (url) => {
    try {
      const reponsive = await axios.get(`${url}`);
      const data = await reponsive.data;
      return data;
    } catch (err) {
      return
    }
  };

  const get = async (url, responseType = "json") => {
    try {
      const reponsive = await axiosHttp.get(`${url}`, {
        responseType: responseType,
      });
      const data = await reponsive.data;
      return data;
    } catch (err) {
      if (!err?.response?.status) {
        errorToast("");
        return;
      }
      switch (err.response.status) {
        case 404:
          errorToast("Không tìm thấy");
          return;
        case "404":
          errorToast("Không tìm thấy");
          return err;
        default:
          break;
      }
    }
  };

  const remove = async (url) => {
    try {
      const response = await axiosHttp.delete(`${url}`);
      // Mã status 200-299: Yêu cầu thành công
      const data = await response.data;
      return { ...data, ok: true };
    } catch (err) {
      console.error(err);
      let temErr = err?.response?.data ?? err;
      return {
        ...temErr,
        ok: false,
      };
    }
  };

  const post = async (url, dataPost) => {
    try {
      const reponsive = await axiosHttp.post(`${url}`, dataPost);
      const data = await reponsive.data;
      return { ...data, ok: true };
    } catch (err) {
      console.error(err);
      let temErr = err?.response?.data ?? err;
      return {
        ...temErr,
        ok: false,
      };
    }
  };
  const patch = async (url, dataPost) => {
    try {
      const reponsive = await axiosHttp.patch(`${url}`, dataPost);
      const data = await reponsive.data;
      return { ...data, ok: true };
    } catch (err) {
      console.error(err);
      let temErr = err?.response?.data ?? err;
      return {
        ...temErr,
        ok: false,
      };
    }
  };
  const put = async (url, dataPost) => {
    try {
      const reponsive = await axiosHttp.put(`${url}`, dataPost);
      const data = await reponsive.data;
      return { ...data, ok: true };
    } catch (err) {
      console.error(err);
      let temErr = err?.response?.data ?? err;
      return {
        ...temErr,
        ok: false,
      };
    }
  };
  return { get, remove, post, call, patch, put };
};

export default API;
