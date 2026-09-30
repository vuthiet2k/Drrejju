import { SERVER_URL } from "@/helpers/utils/config_system.js"

export function isImageExist(img) {
    return img != null && !img.includes("media/null")
}

export const defaulImg = require('@/assets/images/logo/img-default.jpg')

export function getImage(img, dfImage = defaulImg) {
    return isImageExist(img) ? img : dfImage
}

export function getImagePath(imagePath) {
    const defaultImage = require('@/assets/images/users/user-dummy-img.jpg')
    if (imagePath == null || imagePath == "/media/null") {
        imagePath = defaultImage
    }
    else {
        imagePath = SERVER_URL + imagePath
    }
    return imagePath
}