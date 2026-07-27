# Review Checklist — tự review trước khi commit

> Áp dụng cho mọi output có code (Liquid/BWT, SCSS, JS, schema JSON). Chạy trước khi giao — có vi phạm thì sửa, hoặc nêu rõ lý do chấp nhận. Generic theo chuẩn Sapo.

## 1. Convention & Sapo
- [ ] Không hardcode: màu → `var(--*)`; font-size → `var(--fs-*)`; font-family → `var(--font-*)`; handle/URL nội bộ.
- [ ] Naming đúng: BEM + prefix dự án cho component mới; `snake_case` cho settings & `section_*`.
- [ ] Sapo chứ không Shopify: `.name`/`.alias` (không `.title`/`.handle`); `{% include %}` (không `render`); HTML form thuần (không `{% form %}`); giá VND không ×100; comment `{% comment %}`.

## 2. Backward compatibility
- [ ] Grep trước khi đổi/xóa key settings hoặc snippet cũ (còn nơi nào dùng không?).
- [ ] Có nhánh fallback khi setting mới chưa được admin điền (empty-state / `!= blank`).
- [ ] Chỉ sửa `current` trong `settings_data.json` — không đụng `presets`.

## 3. Schema Sapo
- [ ] Type hợp lệ — **KHÔNG `range`/`number`**; menu dùng `link_list`; `image` không có `default`.
- [ ] Setting mới đã có giá trị trong `current` (nhất là `link_list` — không có default).
- [ ] ID không trùng.

## 4. Complexity & debt
- [ ] Object Sapo đã mang dữ liệu chưa (trước khi tạo setting mới)? (xem thang ưu tiên §9 conventions)
- [ ] Không đẻ pattern N×M settings mới (>6 item lặp → cân nhắc linklist/collection).
- [ ] Không thêm thư viện/dependency mới khi chưa cân nhắc.

## 5. UX mobile
- [ ] Đã xét breakpoint 991 / 767 / 480; container padding mobile.
- [ ] Touch target đủ lớn, không hành vi hover-only.

## 6. Ảnh & performance
- [ ] `img_url` chỉ named size hợp lệ (compact/large/grande/1024x1024…) — `WxH` tùy ý → 404.
- [ ] `<img>` đủ `width` + `height` + `alt`; below-fold có `lazyload` + base64 placeholder; hero `eager`.
- [ ] Ảnh settings có guard `!= blank` + `onerror` fallback; linklist guard 3 lớp.

## 7. Kỹ thuật đặc thù Sapo
- [ ] File không có UTF-8 BOM.
- [ ] SCSS không dùng `clamp()` / `dvh` / `ch` và biến Liquid rỗng (`$x: ;`); không `@import` CSS ngoài.
- [ ] Không xóa tag Google Analytics / script bên thứ 3 trong `theme.bwt` khi chỉnh layout.
