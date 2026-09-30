import { STORE_URL } from '@/base/store/api/store_api.js'

export function isImageExist(img) {
    return img != null && !img.includes("media/null")
}

export const defaultImg = require('@/assets/images/small/img-5.jpg')

export function getImage(img, dfImage = defaultImg) {
    return isImageExist(img) ? STORE_URL + img : dfImage
}

export function getImagePath(imagePath) {
    if (imagePath == null || imagePath == "/media/null") {
        imagePath = defaultImg
    }
    else {
        imagePath = STORE_URL + imagePath
    }
    return imagePath
}