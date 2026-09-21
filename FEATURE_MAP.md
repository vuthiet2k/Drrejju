# FEATURE MAP — BẢN ĐỒ TÍNH NĂNG 100% GIAO DIỆN DR.REJU

Bảng định vị 6 cột kết nối trực quan giữa màn hình, tuyến đường (routes), file template, DOM selectors, nguồn dữ liệu và mã kiểm thử.

| Màn hình / Khu vực (Screen / Section) | Tuyến đường (Route URL / Param) | File Template & Snippets (.bwt) | DOM Selectors & Nút bấm chính | Nguồn dữ liệu & Settings Key | Mã khuyết tật & Anchor Ref |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trang chủ — Hero Section** | `/` (hoặc `/?tpl=index`) | `snippets/section_dr_hero.bwt`, `section_doctor_hue_banner.bwt` | `.hero-banner`, `.hero-banner__image-wrapper`, `.hero-banner__image-wrapper img` | `settings.home_slider`, `store.name` | **DEF-03** (`SCR-HERO-01`) |
| **Trang chủ — Flash Sale** | `/` | `snippets/section_flashsale.bwt`, `flashsale_product.bwt` | `.section-flash-sale`, `.deal-timer`, `.flashsale__products` | `settings.sec_flash_sale_col`, `collections[handle]` | **DEF-01** (`SCR-FLASH-01`) |
| **Trang chủ — 8 Vấn Đề Da** | `/` | `snippets/section_dr_concerns.bwt` | `.skin-issues-section`, `.skin-issues-grid`, `.skin-issue-card` | `data/navigation.js['main-menu']` | **DEF-08** (`SCR-CONCERN-01`) |
| **Trang chủ — Form Tư Vấn Bác Sĩ** | `/` | `snippets/section_dr_contact.bwt` | `#consultation-form`, `input[name="contact[name]"]`, `.btn-consultation-submit` | `store.email`, `store.phone` | **DEF-05** (`SCR-CONTACT-01`) |
| **Header & Mega Menu** | Toàn bộ các trang | `snippets/header.bwt`, `mega-menu.bwt`, `site-nav.bwt` | `.site-header`, `.site-nav__item`, `.mega-menu-content`, `.header-actions__item` | `linklists['main-menu']`, `settings.logo` | **DEF-02**, **DEF-09** (`SCR-NAV-01`) |
| **Floating Actions (Zalo/Hotline)** | Toàn bộ các trang (Fixed bottom-right) | `snippets/footer.bwt` | `.floating-action-group`, `.btn-contact-floating`, `.grecaptcha-badge` | `configs/ssot-rules.json`, `settings.hotline` | **DEF-04** (`SCR-FLOAT-01`) |
| **Chân trang (Footer)** | Toàn bộ các trang | `snippets/footer.bwt` | `.site-footer`, `.footer-col-title`, `.footer-email-link` | `linklists['mega-footer']`, `settings.footer_*` | **DEF-06** (`SCR-FOOT-01`) |
| **Trang Bác Sĩ Nguyễn Huệ** | `/bac-si-hue` hoặc `/pages/bac-si-hue` | `templates/page.bac-si-hue.bwt` | `.doctor-profile-hero`, `.doctor-timeline`, `.doctor-certifications` | `data/pages.js['bac-si-hue']` | `SCR-PAGE-DOC` |
| **Trang Đặt Lịch Tư Vấn** | `/dat-lich` hoặc `/pages/dat-lich` | `templates/page.dat-lich.bwt` | `#booking-form`, `.datepicker-input`, `.btn-booking-submit` | `data/pages.js['dat-lich']` | `SCR-PAGE-BOOK` |
| **Trang Khảo Sát Hồ Sơ Da** | `/quiz` hoặc `/pages/quiz` | `templates/page.quiz.bwt`, `section_dr_quiz.bwt` | `.quiz-container`, `.quiz-step`, `.quiz-choice-btn`, `.quiz-result` | `data/pages.js['quiz']` | `SCR-PAGE-QUIZ` |
| **Trang Chi Tiết Sản Phẩm** | `/:product-alias` (vd `/serum-retinol-0-3-phuc-hoi`) | `templates/product.bwt`, `snippets/dr_product_card.bwt` | `.product-single`, `.product-title`, `.product-price`, `.btn-add-to-cart` | `data/products.js`, `collections.all` | **DEF-10** (`SCR-PROD-01`) |
| **Trang Giỏ Hàng** | `/cart` | `templates/cart.bwt`, `snippets/ajaxcart.bwt` | `.cart-container`, `.cart-table`, `.cart-line-item`, `.btn-checkout` | Cookie `dr_cart_items`, `preview-mock.js` | `SCR-CART-01` |
| **Trang Danh Mục Sản Phẩm** | `/collections/:handle` (vd `/collections/all`) | `templates/collection.bwt`, `snippets/aside-filter.bwt` | `.collection-main`, `.aside-filter`, `.product-grid` | `data/collections.js` | **DEF-07** (`SCR-COL-01`) |
| **Trang Blog & Bài Viết Y Khoa** | `/blogs/tin-tuc` & `/blogs/tin-tuc/:article` | `templates/blog.bwt`, `templates/article.bwt` | `.blog-listing`, `.article-single`, `.article-content` | `data/articles.js` | `SCR-BLOG-01` |
| **Trang 404 Không Tìm Thấy** | `/404` | `templates/404.bwt`, `assets/404page.scss.bwt` | `.page-404`, `.page-404__title`, `.btn-back-home` | Static layout | `SCR-404-01` |
