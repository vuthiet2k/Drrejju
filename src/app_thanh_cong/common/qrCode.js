// Sinh mã QR client-side (offline, không gọi API bên thứ ba) cho các
// trang chi tiết — dùng thư viện `qrcode` (pure JS). Nội dung mã QR là
// URL tuyệt đối của CHÍNH trang đang xem, dựng từ `window.location`.
import QRCode from "qrcode";
import { toShortPath } from "./shortLinks.js";

/**
 * Xây URL tuyệt đối tới trang hiện tại, dùng làm nội dung mã QR.
 * origin lấy từ window.location (theo đúng domain đang chạy — dev/staging/
 * production đều tự đúng); đường dẫn lấy từ route.fullPath (reactive theo
 * vue-router) để mã QR luôn khớp đúng điểm di tích khi điều hướng SPA
 * giữa các slug khác nhau mà không cần load lại trang.
 * @param {{fullPath?: string}} [route] route hiện tại (từ useRoute())
 * @returns {string}
 */
export function buildPageQrUrl(route) {
  if (typeof window === "undefined" || !window.location) return "";
  const path = route?.fullPath || window.location.pathname;
  // Rút gọn đường dẫn trước khi mã hoá (/di-tich/<slug> → /dt/<số>): ma
  // trận QR ít module hơn nên in trên bia đá quét nhanh và chắc hơn. Xem
  // shortLinks.js; router chuyển hướng /dt/<số> về đường dẫn chuẩn.
  return window.location.origin + toShortPath(path);
}

/**
 * Sinh mã QR dạng data URL (PNG) cho một chuỗi nội dung (thường là URL).
 * @param {string} text nội dung mã hoá (rỗng → trả về '')
 * @param {{width?:number, margin?:number, dark?:string, light?:string}} [opts]
 * @returns {Promise<string>} data:image/png;base64,... hoặc '' nếu lỗi/rỗng
 */
export async function generateQrDataUrl(text, opts = {}) {
  if (!text) return "";
  try {
    return await QRCode.toDataURL(text, {
      width: opts.width || 240,
      margin: opts.margin ?? 1,
      color: {
        dark: opts.dark || "#2A2018",
        light: opts.light || "#FBF5E8",
      },
    });
  } catch (e) {
    console.error("Sinh mã QR thất bại:", e);
    return "";
  }
}
