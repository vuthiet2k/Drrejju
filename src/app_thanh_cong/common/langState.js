import { ref } from "vue";

// Trạng thái ngôn ngữ dùng chung cho toàn bộ app_thanh_cong (vi/en).
// Dùng singleton module-scope ref thay vì Vuex/Pinia, giống cách các
// trang public khác trong dự án (app_public, app_dinhphuongdo) không
// dùng store cho state cục bộ/hiển thị.
export const lang = ref("vi");

export function toggleLang() {
  lang.value = lang.value === "vi" ? "en" : "vi";
}

export function setLang(value) {
  lang.value = value === "en" ? "en" : "vi";
}
