// ══════════════════════════════════════════════════════════════════════
//  LIÊN KẾT RÚT GỌN CHO MÃ QR TẠI THỰC ĐỊA
//
//  Mã QR in trên bia/bảng chỉ dẫn ở 09 điểm di tích được quét bằng camera
//  điện thoại, thường trong điều kiện nắng gắt, bia đá lồi lõm hoặc phủ
//  bụi. Nội dung càng ngắn thì ma trận QR càng ít module (ô vuông), mỗi
//  module càng to và càng dễ bắt nét — "/dt/1" cho ma trận nhỏ hơn hẳn so
//  với "/di-tich/dan-ha-dinh".
//
//  Đường dẫn chuẩn (canonical) vẫn là /di-tich/<slug> — dễ đọc, tốt cho
//  SEO và chia sẻ mạng xã hội. /dt/<số> chỉ là cửa vào tại thực địa, được
//  router chuyển hướng ngay sang dạng chuẩn (xem router.js).
//
//  Số thứ tự dưới đây khớp với danh mục 09 di tích cấp tỉnh của xã và
//  KHÔNG ĐƯỢC ĐỔI sau khi QR đã in — mã cũ ngoài hiện trường sẽ trỏ sai.
//  Điểm mới chỉ được thêm vào cuối danh sách.
// ══════════════════════════════════════════════════════════════════════
export const SITE_SLUG_BY_SHORT_ID = {
  1: "dan-ha-dinh", // Đình Đan Hà
  2: "dan-ha-den", // Đền Đan Hà
  3: "nguyen-tan", // Đình – Chùa Nguyễn Tân
  4: "linh-phuc", // Chùa Linh Phúc
  5: "van-kim", // Chùa Vạn Kim
  6: "an-mien", // Đình An Miên
  7: "dinh-bia", // Đình Bìa
  8: "xuan-duong", // Đình Xuân Dương
  9: "ha-dat", // Đình Hạ Đạt
};

export const SHORT_ID_BY_SITE_SLUG = Object.fromEntries(
  Object.entries(SITE_SLUG_BY_SHORT_ID).map(([n, slug]) => [slug, Number(n)]),
);

/**
 * Đổi một đường dẫn trong app sang dạng rút gọn nếu có. Hiện chỉ trang chi
 * tiết di tích có dạng rút gọn; mọi đường dẫn khác (lễ hội, chủ đề, …) giữ
 * nguyên. Query string / hash được giữ lại.
 * @param {string} fullPath ví dụ "/di-tich/dan-ha-dinh?tab=anh"
 * @returns {string} ví dụ "/dt/1?tab=anh"
 */
export function toShortPath(fullPath) {
  if (!fullPath) return fullPath;
  const m = /^\/di-tich\/([^/?#]+)([?#].*)?$/.exec(fullPath);
  if (!m) return fullPath;
  const n = SHORT_ID_BY_SITE_SLUG[decodeURIComponent(m[1])];
  return n ? "/dt/" + n + (m[2] || "") : fullPath;
}
