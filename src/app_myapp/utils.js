export const AppName = 'AppStore'
import { delay } from '@/base/store/utils/etc.js'
import { usePost, usePatch, useDelete, useFetch } from "@/helpers/api/api.js"
import { get } from "@/base/store/api/store_api.js"
import { successToast, loadingToast, closeLoadingToast } from "@/helpers/api/toastStyle";
import { API_SERVER_URL } from "@/base/store/api/server_api.js"

import useSwal from "@/base/common/useSwal.js";

const { confirmAction } = useSwal(); 

export async function getAppDependents(appId) {
    const dependents = await useFetch(API_SERVER_URL + '/app-installed/get-app-dependents/?store_id=' + appId)
    return dependents
}

export async function checkAppDependencies(appId) {
    const resp = await get(`/application/${appId}/`)
    const dependencies = resp.dependencies
    return dependencies
}

export async function installApp(appId) {
    loadingToast(`Đang Cài đặt ứng dụng, vui lòng đợi!`)
    // Check is install or update
    await usePost('/app-installed/', JSON.stringify({ 'store_id': appId }))
    await delay(8000);
    closeLoadingToast()
    // await usePost('/app-installed/makemigrations/', JSON.stringify({ 'store_id': appId }));
    // await delay(5000);
    // await usePost('/app-installed/migrate/', JSON.stringify({ 'store_id': appId }));
    location.replace('/system')
    return { ok: 'ok' }
}

export async function uninstallApp(appId) {
    loadingToast(`Đang Gỡ cài đặt ứng dụng, vui lòng đợi!`)
    await useDelete('/app-installed/uninstall/', { 'store_id': appId })
    await delay(8000);
    closeLoadingToast()
    return { ok: 'ok' }
}

export function changePath(appId, newPath) {
    const data = {
        'store_id': appId,
        'new_path': newPath
    }
    usePatch('/app-installed/change-path/', data).then(() => {
        alert("Đường dẫn này đã được sử dụng!")
    })
}

// ✅ Dùng confirmAction để xác nhận hành động thay vì Swal.fire
export async function setAppToPrivate(storeId) {
    const result = await confirmAction(`
        <div>
            <strong class="text-danger text-uppercase">Cảnh báo: Chuyển sang chế độ giới hạn</strong>
            <br>
            <span class="ml-2"><em>Khi bạn chuyển ứng dụng này sang chế độ giới hạn truy cập, chỉ những người có quyền hạn và tùy theo mức độ quyền hạn để tương tác với ứng dụng. Bạn chắc chắn muốn tiếp tục không?</em></span>
        </div>
    `);

    if (!result.isConfirmed) {
        return false;
    }

    const formData = new FormData()
    formData.append('store_id', storeId)
    formData.append('is_public', false)
    await usePatch('/app-installed/change-perm/', formData).then(() => {
        successToast("Giới hạn truy cập ứng dụng thành công!")
    })
    return true
}

// ✅ Dùng confirmAction tương tự
export async function setAppToPublic(storeId) {
    const result = await confirmAction(`
        <div>
            <strong class="text-danger text-uppercase">Cảnh báo: Chuyển sang chế độ công khai</strong>
            <br>
            <span class="ml-2"><em>Khi bạn chuyển ứng dụng này sang chế độ công khai, tất cả mọi người sẽ có thể truy cập và tương tác. Bạn chắc chắn muốn tiếp tục không?</em></span>
        </div>
    `);

    if (!result.isConfirmed) {
        return false;
    }

    const formData = new FormData()
    formData.append('store_id', storeId)
    formData.append('is_public', true)
    await usePatch('/app-installed/change-perm/', formData).then(() => {
        successToast("Công khai truy cập ứng dụng thành công!")
    })
    return true
}
