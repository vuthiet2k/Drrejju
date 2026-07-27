# DR.REJU — Website (Sapo theme + môi trường preview local)

> ⚠️ **Dự án ĐỘC LẬP.** Không liên quan Pharma Cosmetics. Backup theme gốc (raw tải từ Sapo) nằm ở `E:\DRREJJU`. Đây là bản **làm việc** — theme DR.REJU + môi trường giả lập Sapo để xem giao diện.

## Chạy preview

```bash
npm install        # lần đầu
npm run preview    # → http://localhost:3000
```

- 🌐 Preview:  http://localhost:3000
- 🔍 Debug:    http://localhost:3000/debug  (xem settings/collections/nav mock)
- 📦 JSON:     http://localhost:3000/__data.json
- Đổi trang: dùng thanh **dev-toolbar** dưới cùng, hoặc `?tpl=<template>` (vd `/?tpl=product`, `/?tpl=page.about`).
- Sửa bất kỳ `.bwt` / `configs/settings_data.json` → trình duyệt tự reload (live).

## Cấu trúc

```
layouts/ templates/ snippets/ assets/ configs/   ← Theme DR.REJU (từ store thật)
dev-server.js      ← Server giả lập Sapo (LiquidJS + shim cú pháp Sapo + compile SCSS)
preview-mock.js    ← Ghép Sapo context (settings thật + object demo)
data/              ← Mock object demo (store, products, collections, nav, pages, cart, articles)
package.json
```

## Đã CỐ Ý loại bỏ (theo yêu cầu)
- **MOPS** (đặt lịch/thanh toán VietQR-GAS của Pharma) — không đem qua.
- **Trang nội dung & mock của Pharma** — thay bằng mock demo trung tính của DR.REJU.
- Toolbar/preview không còn mục Pharma / Skin Healthy / MOPS.

## Môi trường preview khác Sapo thật thế nào
- Ảnh `img_url` → placeholder (ảnh thật lấy từ CDN `bizweb.dktcdn.net` khi chạy trên Sapo).
- `settings` đọc từ `configs/settings_data.json` → `current`; key thiếu (mà Sapo lấy default từ schema) được bù trong `preview-mock.js` (vd `hover_color`).
- Compiler dùng Dart Sass: có bộ làm sạch vài typo theme (vd `calc(... ;)`, biến rỗng) mà Ruby-sass của Sapo tha. **Không sửa file theme** — theme giữ nguyên để sync ngược lên Sapo.

## Dữ liệu demo (mock)
Sửa trong `data/*.js`. Mặc định trung tính (brand "DR.REJU", sản phẩm demo). Sẽ cập nhật theo **plan/tài liệu DR.REJU** khi có.
