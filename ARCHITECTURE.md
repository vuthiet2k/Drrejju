# ARCHITECTURE SPECIFICATION — DR.REJU

## 1. Kiến Trúc Phân Tầng (Layered Architecture)

```text
+-----------------------------------------------------------------------------------+
| 1. PRESENTATION LAYER (SAPO THEME & ASSETS)                                       |
|    - layouts/theme.bwt                                                            |
|    - templates/*.bwt (index, product, collection, cart, page.bac-si-hue, etc.)   |
|    - snippets/*.bwt (section_dr_hero, mega-menu, footer, dr_product_card, etc.)   |
|    - assets/*.scss.bwt (main.scss.bwt, index.scss.bwt, utilities.scss.bwt)        |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 2. SHIM & COMPILATION ENGINE (DEV RUNTIME)                                        |
|    - dev-server.js: LiquidJS Engine, Dart Sass Compiler, WebSocket Server         |
|    - preprocessBwt(): Chuẩn hóa cú pháp Sapo (&& -> and, || -> or, layout strip)  |
|    - Custom Tags: {% paginate ... %}, {% form ... %}                              |
|    - Custom Filters: img_url, asset_url, money, date, link_to, stylesheet_tag     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 3. CONTEXT & STATE REGISTRY                                                       |
|    - configs/settings_data.json: 1,023 keys cấu hình Sapo Store                   |
|    - configs/ssot-rules.json: Chân lý duy nhất về thương hiệu, liên hệ, Spacing  |
|    - preview-mock.js: Giả lập store, linklists, pages, blogs, collections         |
|    - State Giỏ hàng: Cookie base64 `dr_cart_items` (persistent across refreshes)  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 4. PRODUCTION & DEPLOYMENT TARGETS                                                |
|    - Vercel Serverless: api/index.js (Export handleRequest từ dev-server.js)      |
|    - Sapo Production Store: Đồng bộ trực tiếp mã nguồn theme lên E:\DRREJJU       |
+-----------------------------------------------------------------------------------+
```

## 2. Bất Biến Kiến Trúc Bắt Buộc (Architectural Invariants)
1. **INVARIANT-01 (Sapo Theme Purity):** Tuyệt đối không đưa các cú pháp đặc thù của Node.js vào file `.bwt`. Mọi mã Liquid phải tương thích hoàn toàn với trình phân giải gốc của Sapo.
2. **INVARIANT-02 (Defensive Collection Rendering):** Mọi vòng lặp sản phẩm từ collection trong Liquid bắt buộc phải bọc điều kiện kiểm tra tồn tại:
   `{% assign col = collections[settings.key] %}`
   `{% if col != blank and col.products_count > 0 %}`
   Triệt tiêu vĩnh viễn lỗi lộ mã Admin placeholder (DEF-01).
3. **INVARIANT-03 (Single Source of Contact Info):** Tuyệt đối không hardcode số điện thoại, địa chỉ, email phòng khám vào file template. Bắt buộc đọc từ `settings.*` hoặc `store.*`.
4. **INVARIANT-04 (Harmonic 8pt Spacing Scale):** Toàn bộ thuộc tính margin, padding, gap trong SCSS phải tuân thủ nghiêm ngặt bội số 4px/8px (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px).
