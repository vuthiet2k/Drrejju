import { SERVER_URL } from "@/helpers/utils/config_system.js";
import "vue3-toastify/dist/index.css";
import { getAccessToken } from "@/helpers/api/token";

const PROXY = SERVER_URL + "/api";

export const useFetch = async function (fullApiUrl) {
  const apiUrl = validUrl(`${fullApiUrl}`);
  const token = await getAccessToken();
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return;
  }
};

export const usePost = async function (url, dataPost, useProxy = true) {
  let apiUrl = url;
  if (useProxy) {
    apiUrl = `${PROXY}/${url}`;
  }
  const token = await getAccessToken();
  try {
    const contenType = getContenTypeFromData(dataPost);
    const response = await fetch(validUrl(apiUrl), {
      method: "POST",
      headers: {
        ...contenType,
        Authorization: token,
      },
      body: dataPost,
      credentials: "include", // Thêm dòng này để gửi/lưu cookie
    });
    /*const data = await response.json();
        return data;*/
    return response;
  } catch (error) {
    return;
  }
};

export const usePatch = async function (url, dataPost, useProxy = true) {
  let apiUrl = url;
  if (useProxy) {
    apiUrl = `${PROXY}/${url}`;
  }

  const token = await getAccessToken();
  try {
    const contenType = getContenTypeFromData(dataPost);
    const response = await fetch(validUrl(apiUrl), {
      method: "PATCH",
      headers: {
        ...contenType,
        Authorization: token,
      },
      body: dataPost,
    });
    return response;
  } catch (error) {
    return;
  }
};

export const useDelete = async function (
  url,
  data,
  useProxy = true,
  useFormData = false
) {
  let apiUrl = url;
  if (useProxy) {
    apiUrl = `${PROXY}/${url}`;
  }

  const token = await getAccessToken();
  try {
    const contenType = getContenTypeFromData(data);
    let options = {
      method: "DELETE",
      headers: {
        ...contenType,
        Authorization: token,
      },
    };
    if (data && !useFormData) {
      data = JSON.stringify(data);
    }
    if (data) {
      options["body"] = data;
    }

    const response = await fetch(validUrl(apiUrl), options);
    return response;
  } catch (error) {
    return;
  }
};

const validUrl = (url) => {
  var regex = /([^:]\/)\/+(?!\/|$)/g;
  var hasParams = /\?/.test(url);
  var endsWithSlash = /\/$/.test(url);

  var normalizedURL = url.replace(regex, "$1");
  if (hasParams && endsWithSlash) {
    normalizedURL = normalizedURL.slice(0, -1);
  } else if (!hasParams && !endsWithSlash) {
    normalizedURL += "/";
  }
  return normalizedURL;
};

function isJSON(data) {
  try {
    JSON.parse(JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

function isFormData(data) {
  return data instanceof FormData;
}

function getContenTypeFromData(data) {
  let contenType = "application/json";
  if (data) {
    if (isFormData(data)) {
      const fileField = data.get("file");
      if (fileField instanceof File) {
        contenType = "";
      } else {
        contenType = "";
      }
    } else if (isJSON(data)) {
      contenType = "application/json";
    }
  }
  if (contenType) return { "Content-Type": contenType };
  else return {};
}
