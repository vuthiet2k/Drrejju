/**
 * data/settings-demo.js — Settings bổ sung cho preview DR.REJU
 *
 * DR.REJU đã có settings thật trong configs/settings_data.json (current) — file này
 * chỉ để MERGE thêm/override khi cần test UI. Mặc định để trống để dùng đúng
 * settings thật của theme DR.REJU.
 *
 * Ưu tiên merge (trong preview-mock.js):
 *   demoSettings  < settings thật (settings_data.json > current)  < overrideSettings
 *
 * KHÔNG chứa key của Pharma / MOPS / Skin Healthy.
 */

// Bổ sung khi settings thật thiếu key (để trống mặc định)
const demoSettings = {
  // cart_related_blog chưa được cấu hình trong Sapo admin (settings_data.json không có
  // key này) — dùng 'tin-tuc' để preview/test được snippets/cart_related_articles.bwt.
  // Xoá dòng này khi merchant đã chọn blog thật ở Tùy chỉnh → Giỏ hàng.
  cart_related_blog: 'tin-tuc',
  // results_*_before_img/after_img là setting type "image" — merchant chưa upload nên
  // settings_data.json không có key này. Dùng placeholder để preview/test được
  // snippets/section_dr_results.bwt (before/after theo docs/design-brief.md §3.4).
  results_1_before_img: 'https://placehold.co/600x750/cccccc/666666?text=Truoc',
  results_1_after_img:  'https://placehold.co/600x750/156b54/ffffff?text=Sau',
  results_2_before_img: 'https://placehold.co/600x750/cccccc/666666?text=Truoc',
  results_2_after_img:  'https://placehold.co/600x750/DFBA73/333333?text=Sau',
};

// Override mạnh (luôn thắng settings thật) — dùng khi test UI mới
const overrideSettings = {
  // ví dụ: main_color: '#000000',
};

module.exports = { demoSettings, overrideSettings };
