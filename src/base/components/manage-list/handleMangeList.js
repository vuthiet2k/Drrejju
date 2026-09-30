import { usePost, useDelete } from "@/helpers/api/api"

export const postData = async function (url, formData) {
    // url the link to post data 
    // formData is formdata 
    await usePost(url, formData, false)
}

export const delData = async function (url, formData) {
    try {
        const data = await useDelete(url, formData, false, true)
        return data
    }
    catch {
        return false
    }
}

export const objectToFormData = function (obj, form) {
    let fd = form || new FormData();
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && !(value instanceof File)) {
            fd.append(key, JSON.stringify(value))
        } else {
            // Otherwise append the value directly
            fd.append(key, value);
        }
    }

    return fd;
}