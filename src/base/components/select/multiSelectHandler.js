import { isNullOrEmpty } from "@/helpers/utils/objectHandle.js";

export const pushOrRemoveItemInList = (list, item) => {
    let data = []
    if (isNullOrEmpty(list)) list = [] 
    // try to append
    const isAppended = pushItemToList(list, item)
    // try to remove
    if (!isAppended.ok) {
        let isRemoved = removeItemFromList(list, item)
        data = isRemoved.l
    }
    else {
        data = isAppended.l
    }
    return data
}
export const pushItemToList = (list, item) => {
    if (isNullOrEmpty(list)) list = [] 
    // Test find by id
    const index = getIndexOfElInList(list, item)
    if (index == -1) {
        list.push(item)
        return {
            l: list,
            ok: true
        }
    }
    else return {
        l: list,
        ok: false
    }
}

const getIndexOfElInList = (list, item) => {
    // Tìm bằng ID, Tìm bằng full el
    // Mặc định là không tìm thấy
    let index = -1
    if (isNullOrEmpty(list)) return index
    try {
        list.forEach((el, i) => {
            if (el.id == item.id) {
                index = i
            }
        })
    }
    catch (err) {
        index = list.indexOf(item)
    }
    return index
}

export const removeItemFromList = (list, item) => {
    const index = getIndexOfElInList(list, item)
    if (index > -1) { // only splice array when item is found
        list.splice(index, 1); // 2nd parameter means remove one item only
        return {
            l: list,
            ok: true
        }
    }
    else {
        return {
            l: list,
            ok: false
        }
    }
}