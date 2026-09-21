# VISUAL-TO-CODE LOCATOR MATRIX — DR.REJU DEFECTS

Bảng ma trận ánh xạ từ triệu chứng lỗi giao diện thực tế sang vị trí mã nguồn, DOM Selector và giải pháp kỹ thuật cụ thể.

| Mã Lỗi | Triệu chứng thị giác (Visual Symptom) | Vị trí giao diện & Route | File cần sửa | DOM Selector chính | Giải pháp kỹ thuật chuẩn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Lộ nguyên văn đoạn text `sec_flash_sale_col` hướng dẫn admin. | Giữa trang chủ (`/`) | `snippets/section_flashsale.bwt` | `.section-flash-sale` | Bọc điều kiện `{% if flash_col != blank and flash_col.products_count > 0 %}` trước khi xuất HTML. |
| **DEF-02** | Rê chuột giữa các menu con bị đè chữ 2 lớp lộn xộn. | Header trên cùng (`/`) | `assets/main.scss.bwt` | `.site-nav__dropdown, .mega-menu-content` | Bổ sung `background-color: #ffffff !important; opacity: 0; visibility: hidden; pointer-events: none;`. |
| **DEF-03** | Ảnh đại diện Bác sĩ Huệ bị cắt cụt phần trán và đỉnh đầu. | Hero Section (`/`) | `assets/index.scss.bwt` | `.hero-banner__image-wrapper` | Đặt `overflow: visible !important; display: flex; align-items: flex-end;`. |
| **DEF-04** | Huy hiệu Google reCAPTCHA đè trực tiếp lên nút Liên hệ Zalo. | Góc dưới cùng bên phải | `assets/main.scss.bwt` | `.floating-action-group, .btn-contact-floating` | Đẩy `bottom: 85px !important; z-index: 9990 !important;` (reCAPTCHA ở `bottom: 16px; z-index: 9980`). |
| **DEF-05** | Nút "GỬI YÊU CẦU TƯ VẤN" chữ trắng trên nền vàng nhạt mờ mịt. | Form Tư Vấn Trang chủ | `assets/index.scss.bwt` | `.btn-consultation-submit` | Đổi sang `color: #05251c !important; background-color: #dfb56c !important;` (tương phản 7.2:1 AAA). |
| **DEF-06** | Cột chân trang bị lặp tiêu đề "CHÍNH SÁCH"; thiếu địa chỉ email. | Footer chân trang | `snippets/footer.bwt` | `.site-footer .footer-col-title` | Đổi tiêu đề Cột 2 thành "DANH MỤC", bổ sung email `contact@drreju.vn` bên cạnh icon thư. |
| **DEF-07** | Khối Thực phẩm bổ trợ hiển thị dịch vụ sẹo rỗ, thẩm mỹ. | Khối sản phẩm trang chủ | `configs/settings_data.json` | `settings.sec_tpcn_col` | Trỏ cấu hình `sec_tpcn_col` về đúng collection `tpcn` hoặc `collagen`. |
| **DEF-08** | 8 chips vấn đề da bị bóp nghẹt thành 1 hàng hẹp, chữ dồn đáy. | Section vấn đề da trang chủ | `assets/index.scss.bwt` | `.skin-issues-grid` | Chuyển bố cục sang CSS Grid 4 cột x 2 hàng, padding `20px 16px`, hover nhấc thẻ `translateY(-4px)`. |
| **DEF-09** | Vùng bấm icon Header quá nhỏ (~28px) và khoảng cách lẻ. | Header bar | `assets/main.scss.bwt` | `.header-actions__item` | Đặt `min-width: 44px; min-height: 44px; padding: 8px; margin-left: 8px; border-radius: 50%;`. |
| **DEF-10** | Trang web bị giật khung khi tải ảnh (Cumulative Layout Shift). | Toàn bộ trang | `snippets/dr_product_card.bwt` | `img.product-card__img` | Bổ sung thuộc tính `width="400" height="400" loading="lazy"`. |
