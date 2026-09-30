// Ảnh lễ hội thực tế theo từng địa điểm (ảnh chụp/screenshot lễ hội) —
// dùng làm gallery chi tiết cho lễ hội, phong phú hơn 1 ảnh lễ hội đại diện
// trong sitePhotos. Chỉ 7/9 địa điểm có ảnh; nơi thiếu sẽ fallback ở nơi dùng.
const photoContext = require.context("../@data/image/anh_le_hoi", true, /\.(png|jpe?g)$/i);

function photosOf(folder) {
  return photoContext
    .keys()
    .filter((key) => key.startsWith(`./${folder}/`))
    .sort()
    .map((key) => photoContext(key));
}

export const festivalPhotos = {
  "dan-ha-den": photosOf("Đền Đan Hà"),
  "dan-ha-dinh": photosOf("Đình Đan Hà"),
  "van-kim": photosOf("Chùa Vạn Kim"),
  "linh-phuc": photosOf("Chùa Linh Phúc"),
  "ha-dat": photosOf("Đình Hạ Đạt"),
  "xuan-duong": photosOf("Đình Xuân Dương"),
  "an-mien": photosOf("Đình An Miên"),
};
