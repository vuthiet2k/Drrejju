export const catchErrors = function (keyError, valueError) {
    let message = ""
    keyError = keyError.toLowerCase();
    if (keyError == 'message' || keyError == 'error') {
        message = valueError
    }
    else {
        valueError = getVietnameseValueError(keyError, valueError)
        keyError = getVietnameseKeyError(keyError)
        message = `${keyError} ${valueError}`
    }
    return message
}

const getVietnameseKeyError = (key) => {
    if (key == 'username') {
        return "Tên tài khoản"
    }
    else {
        return key
    }
}

const getVietnameseValueError = (key, value) => {
    let rl = ""
    value = value[0]
    value = value.toLowerCase()
    if (value.includes('already exists') && key != 'username') {
        rl = "đã tồn tại."
    }
    else if (value.includes('already exists') && key == 'username') {
        rl = "đã tồn tại hoặc bị xóa. vui lòng liên hệ admin"
    }
    return rl
}