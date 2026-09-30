import { ref } from 'vue';

// Trạng thái ẩn thủ công control-bar (nút "Ẩn điều khiển" / yt-restore-controls
// trong YtControlBar.vue + Vr360ViewerYtLayout.vue) — singleton module-scope,
// KHÔNG khai báo cục bộ trong Vr360ViewerYtLayout.vue.
//
// Lý do: trang nhúng (vd. VR360ThanhCong.vue) dùng `:key="vrId"` trên
// <Vr360ViewerYt>, nên mỗi lần đổi site/tour (bấm POI trên tour tổng quan
// nhảy sang site khác) component NÀY BỊ HUỶ VÀ TẠO LẠI TỪ ĐẦU — state cục
// bộ (ref khai báo trong <script setup> của layout) sẽ mất, control-bar tự
// bật lại dù người dùng vừa ẩn. Đặt ref ở module-scope thế này để nó sống
// xuyên suốt qua các lần remount, chỉ mất khi cả trang tải lại.
export const controlsHidden = ref(false);
