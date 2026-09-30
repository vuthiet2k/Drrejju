// Bộ ảnh địa điểm mới: ảnh đại diện lấy từ file avatar.png riêng trong từng
// thư mục, ảnh lễ hội dùng riêng.
// Ghi chú: ảnh trong từng thư mục hiện được đặt tên theo số thứ tự
// (anh1, anh2, ... + le_hoi) thay cho tên mô tả cũ — vị trí ảnh dưới đây
// giữ đúng thứ tự/chú thích như bộ ảnh trước đó.
const photoContext = require.context("../@data/image/anh_dia_diem", true, /\.(png|jpe?g)$/i);

function createSitePhotos(folder, altarFile, festivalFile, entries) {
  const photo = (file) => photoContext(`./${folder}/${file}`);
  const gallery = entries.map(([file, cap]) => ({ image: photo(file), cap }));
  return {
    image: photo("avatar.png"),
    images: gallery.map(({ image }) => image),
    altarImage: photo(altarFile),
    festivalImage: photo(festivalFile),
    gallery,
  };
}

export const sitePhotos = {
  "dan-ha-den": createSitePhotos("den_dan_ha", "anh5.jpg", "anh_le_hoi.jpg", [
    ["anh1.png", "Cổng vào Đền Đan Hà"],
    ["anh2.jpg", "Toàn cảnh đền từ trên cao"],
    ["anh3.JPG", "Bên trong sân đền"],
    ["anh4.jpg", "Không gian bên trong đền"],
    ["anh5.jpg", "Ban thờ bên trong đền"],
    ["anh6.png", "Tượng phía sau đền"],
  ]),
  "dan-ha-dinh": createSitePhotos("dinh_dan_ha", "anh4.jpg", "le_hoi.jpg", [
    ["anh1.jpg", "Sân Đình Đan Hà"],
    ["anh2.png", "Toàn cảnh đình từ trên cao"],
    ["anh3.png", "Ban thờ giữa đình"],
    ["anh4.jpg", "Ban thờ công đồng Thành hoàng"],
    ["anh5.jpg", "Kiệu tại đình"],
    ["anh6.jpg", "Tượng Bác Hồ"],
  ]),
  "nguyen-tan": createSitePhotos("Nguyen_Tan", "anh4.jpg", "le_hoi.jpg", [
    ["anh1.jpg", "Cổng vào Đình – Chùa Nguyễn Tân"],
    ["anh2.jpg", "Toàn cảnh cụm đình – chùa từ trên cao"],
    ["anh3.png", "Chùa ba gian"],
    ["anh4.jpg", "Điện chính"],
    ["anh5.jpg", "Nhà thờ Mẫu"],
    ["anh6.jpg", "Không gian sân đình – chùa"],
  ]),
  "van-kim": createSitePhotos("Van_kim", "anh4.png", "le_hoi.png", [
    ["anh1.png", "Cổng vào Chùa Vạn Kim"],
    ["anh2.png", "Toàn cảnh chùa từ trên cao"],
    ["anh3.jpg", "Không gian giữa chùa"],
    ["anh4.png", "Thượng điện"],
    ["anh5.png", "Tượng Phật trong chùa"],
    ["anh9.jpg", "Tượng Phật Quan Âm"],
  ]),
  "linh-phuc": createSitePhotos("Linh_Phuc", "anh5.png", "le_hoi.png", [
    ["anh1.png", "Cổng vào Chùa Linh Phúc"],
    ["anh2.jpg", "Toàn cảnh chùa từ trên cao"],
    ["anh3.png", "Sân chùa"],
    ["anh4.jpg", "Không gian giữa chùa"],
    ["anh5.png", "Hệ thống tượng thờ"],
    ["anh6.jpg", "Tượng Bác Hồ"],
  ]),
  // Đủ 6 ảnh gallery nhưng chưa có ảnh lễ hội riêng — tạm dùng anh1 làm ảnh lễ hội.
  "ha-dat": createSitePhotos("Ha_dat", "anh4.jpg", "anh1.png", [
    ["anh1.png", "Đình Hạ Đạt"],
    ["anh2.png", "Toàn cảnh đình từ trên cao"],
    ["anh3.png", "Cây đại thụ trong khuôn viên"],
    ["anh4.jpg", "Ban thờ trong đình"],
    ["anh5.jpg", "Sân sau đình"],
    ["anh6.png", "Bằng khen tại đình"],
  ]),
  "dinh-bia": createSitePhotos("dinh_bia", "anh4.png", "le_hoi.png", [
    ["anh1.png", "Đình Bìa"],
    ["anh2.png", "Toàn cảnh đình từ trên cao"],
    ["anh3.jpg", "Lối vào đình"],
    ["anh4.png", "Gian thờ chính"],
    ["anh5.png", "Chân kê đá"],
    ["anh6.jpg", "Miếu Bà"],
  ]),
  "xuan-duong": createSitePhotos("Xuan_Duong", "anh4.jpg", "le_hoi.jpg", [
    ["anh1.png", "Cổng vào Đình Xuân Dương"],
    ["anh2.png", "Toàn cảnh đình từ trên cao"],
    ["anh3.png", "Sân đình"],
    ["anh4.jpg", "Gian thờ chính"],
    ["anh5.jpg", "Gian thờ bên trong"],
    ["anh6.jpg", "Cổ thụ trong khuôn viên"],
  ]),
  "an-mien": createSitePhotos("An_Mien", "anh3.jpg", "le_hoi.jpg", [
    ["anh1.jpg", "Đình An Miên"],
    ["anh2.png", "Toàn cảnh đình từ trên cao"],
    ["anh3.jpg", "Điện thờ chính"],
    ["anh4.png", "Miếu thờ"],
    ["anh5.jpg", "Tổ quốc ghi công"],
    ["anh6.jpg", "Bằng khen tại đình"],
  ]),
};
