# DR.REJU — Brand Spec (trang Hồ sơ da)

## Nguồn đã xác minh trong theme
- Token màu: `snippets/header_style.bwt`, đọc qua `configs/settings_data.json > current`.
- Emerald thương hiệu: `settings.main_color` = `#156b54`; emerald đậm = `settings.hover_color` = `#06201a`.
- Gold thương hiệu: `settings.color_gold` = `#DFBA73`; gold nhạt = `settings.color_gold_lt` = `#E3C17E`.
- Nền sáng: `settings.color_bg_alt` = `#FAF6EF`; `settings.color_bg_soft` = `#F1ECE3`.
- Font nguồn sự thật: `--font-primary` / `--font-secondary` trong `header_style.bwt` (Quicksand tại thời điểm audit).
- Logo/header/footer: dùng component theme hiện hữu, không tái tạo logo hay recolor bằng filter.

## Quy tắc áp dụng
- Trang đọc nhiều nội dung sử dụng bề mặt sáng và text tokens của theme.
- Emerald là mảng nhận diện, trạng thái progress và đường dẫn hành động; gold là CTA/điểm nhấn theo `--btn-*`.
- Không dùng vàng làm body text, không giả lập chẩn đoán hoặc hứa hẹn kết quả điều trị.
- Asset nội dung: dùng ảnh/tài nguyên đã tồn tại trong `assets/` và ảnh bài viết do object Sapo cung cấp; không tải ảnh stock hay tạo hình minh hoạ AI.

## Trang Đặt lịch
- Trang booking dùng cùng brand tokens/theme như Trang Hồ sơ da.
- Form sử dụng `{% form 'contact' %}` của Sapo; không nối API hoặc xây backend mới.
- Không bịa địa chỉ, giờ mở cửa hay SLA vì config hiện tại không có dữ liệu DR.REJU đã xác minh.
