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
const demoSettings = {};

// Override mạnh (luôn thắng settings thật) — dùng khi test UI mới
const overrideSettings = {
  // ví dụ: main_color: '#000000',
};

module.exports = { demoSettings, overrideSettings };
