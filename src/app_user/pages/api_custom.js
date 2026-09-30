import {BASE_URL} from "@/helpers/api/axiosHttp.js";
import 'vue3-toastify/dist/index.css';
import { getAccessToken } from "@/helpers/api/token";

const PROXY = BASE_URL + "/api";
export const UerCustomer = JSON.parse(localStorage.getItem('auth'));

export const usePatchJSON = async function (url, dataPost) {
    const token = await getAccessToken();
    try {
        const response = await fetch(`${PROXY}/${url}/`, {
            method: "PATCH",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: dataPost,
        });
        return response;
    } catch (error) {
        return error
    }
};