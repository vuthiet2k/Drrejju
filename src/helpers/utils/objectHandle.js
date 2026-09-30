export function isEmptyObject(obj) {
    if (Object.keys(obj).length === 0) {
        return true;
    } else {
        return false;
    }
}

export function isNullOrEmpty(variable) {
    if (variable === null || variable === undefined) {
        return true;
    }

    if (Array.isArray(variable) || typeof variable === 'string') {
        return variable.length === 0;
    }

    if (typeof variable === 'object') {
        return Object.keys(variable || {}).length === 0;
    }

    return false;
}

export function areArraysEqual(arr1, arr2) {
    // Nếu cả hai tham số đều không phải là mảng, so sánh chúng trực tiếp
    if (!Array.isArray(arr1) && !Array.isArray(arr2)) {
        return arr1 === arr2;
    }

    // Nếu chỉ có một tham số là mảng, trả về false
    if ((Array.isArray(arr1) && !Array.isArray(arr2)) || (!Array.isArray(arr1) && Array.isArray(arr2))) {
        return false;
    }
    // Kiểm tra xem cả hai mảng có cùng độ dài không
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Sắp xếp các mảng theo thứ tự tăng dần dựa trên ID
    arr1.sort((a, b) => a.id - b.id);
    arr2.sort((a, b) => a.id - b.id);

    // Kiểm tra từng phần tử trong mảng
    for (let i = 0; i < arr1.length; i++) {
        const obj1 = arr1[i];
        const obj2 = arr2[i];
        if (!areObjectsEqual(obj1, obj2)) {
            return false
        }
    }

    return true;
}

export function areObjectsEqual(obj1, obj2) {
    if (!obj1 || !obj2)
        return false;
    // Nếu các đối tượng có thuộc tính "id", kiểm tra bằng id
    if (Object.prototype.hasOwnProperty.call(obj1, 'id') && Object.prototype.hasOwnProperty.call(obj2, 'id')) {
        if (obj1.id !== obj2.id) {
            return false;
        }
    } else {
        // Nếu không, kiểm tra bằng cách so sánh trực tiếp các đối tượng
        if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
            return false;
        }
    }
    return true
}