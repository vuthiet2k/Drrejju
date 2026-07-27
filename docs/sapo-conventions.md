# Sapo / Bizweb — Quy chuẩn viết Theme (`.bwt`)

> Quy tắc chung theo chuẩn Sapo/Bizweb + best practice viết theme. **Generic** — không gắn brand.
> Đi kèm: `sapo-objects.md` (object reference), `review-checklist.md` (checklist trước commit).

---

## 1. Cấu trúc thư mục theme

```
Layouts/      theme.bwt              # Master layout (HEAD, header, footer, scripts)
Templates/    index / product / collection / cart / blog / article /
              page.* / search / 404 / password
              customers/ (login, register, account, orders, order, addresses, ...)
Snippets/     header, footer, header_style, section_*, product_*, aside-*, popup_*
Assets/       *.scss.bwt, *.js.bwt, *.css, *.js, ảnh   (FLAT — Sapo không hỗ trợ subfolder)
Configs/      settings_data.json (dữ liệu ACTIVE), settings_schema.json (mô tả settings)
```

- **1 template = 1 loại trang.** Logic phức tạp tách ra snippet, include bằng `{% include 'name' %}`.
- `Templates/customers/` là thư mục con đặc biệt duy nhất — Sapo nhận theo path `customers/{name}`.
- `Assets/` **phẳng**, không subfolder → nhóm bằng prefix tên file (`global_`, `page_`, `comp_`, `vendor_`).

---

## 2. Cú pháp Liquid / `.bwt`

```liquid
{% comment %} comment ĐÚNG của Liquid {% endcomment %}   {# KHÔNG dùng // hay /* */ #}
{{ variable }}                          {% if x %}...{% elsif y %}...{% else %}...{% endif %}
{% unless cond %}...{% endunless %}     {% for p in col.products limit: 8 offset: 4 %}...{% endfor %}
{% case status %}{% when 'paid' %}...{% else %}...{% endcase %}
{% assign name = product.name | upcase %}
{% capture html %}...{% endcapture %}{% assign all = all | append: html %}
{%- assign x = y | strip -%}            {# dấu - loại khoảng trắng thừa #}
{% for tag in product.tags %}{% if tag == 'hidden' %}{% continue %}{% endif %}{% endfor %}
```

**Pattern gán key động (đặc trưng Sapo) — dùng cho home section:**
```liquid
{% for i in (1..12) %}
  {% capture key %}home_section_{{ i }}{% endcapture %}
  {% if settings[key] != 'none' and settings[key] != blank %}
    {% include settings[key] %}
  {% endif %}
{% endfor %}
```

**Filters hay dùng:** `money`, `img_url:'large'`, `asset_url`, `stylesheet_tag`, `script_tag`, `escape`, `strip_html`, `truncate`, `date:'dd/MM/yyyy'`, `default:`, `split:`, `join:`, `size`, `remove:`, `replace:`, `json`.

---

## 3. Sapo vs Shopify — KHÁC NHAU (copy code Shopify sẽ lỗi)

| Chủ đề | Sapo (đúng) | Shopify (SAI trên Sapo) |
|---|---|---|
| Tên/handle SP | `product.name` / `product.alias` | `product.title` / `product.handle` |
| Collection | `collection.name` / `collection.alias` | `.title` / `.handle` |
| Bài viết | `article.summary` / `article.published_on` | `.excerpt` / `.published_at` |
| Đơn hàng | `order.created_on` | `order.created_at` |
| Include | `{% include 'x' %}` | `{% render 'x' %}` |
| Form | HTML `<form action="/...">` thuần | `{% form 'x' %}` |
| Comment | `{% comment %}` | `{# #}` (Jinja) |
| Giá | Số nguyên VND (không ×100) | cents ×100 |
| Resize ảnh | `img_url:'large'` (named size) | `img_url: '300x'` tùy ý |

**Form chuẩn Sapo (HTML thuần):**
```html
<form action="/account/login" method="post"> email + password </form>
<form action="/account/register" method="post"> customer[first_name]... </form>
<form action="/cart/add" method="post" enctype="multipart/form-data">
  <input type="hidden" name="variantId" value="{{ variant.id }}"> ...
</form>
```

**Routes Sapo mặc định:** `/cart`, `/cart/add`(POST), `/cart/change`(POST), `/cart.json`, `/checkout`,
`/account`, `/account/login|logout|register|recover|addresses`, `/search?query=&type=product`.
> URL slug trang/collection/blog do cấu hình store — luôn lấy qua `{{ product.url }}`, `{{ collection.url }}`, `{{ article.url }}`, KHÔNG tự ghép chuỗi.

---

## 4. Quy tắc đặt tên

| Loại | Pattern | Ví dụ |
|---|---|---|
| Template | `{type}.bwt`, `{type}.{variant}.bwt`, `page.{handle}.bwt` | `collection.sale.bwt` |
| Snippet section | `section_{name}.bwt` (snake_case) | `section_slider.bwt` |
| Snippet SP / sidebar | `product_{name}.bwt` / `aside-{name}.bwt` | `aside-filter.bwt` (kebab) |
| Asset | prefix nhóm | `global_core.scss.bwt`, `page_home.scss.bwt`, `comp_sidebar.scss.bwt`, `vendor_*.css` |
| CSS class (component mới) | **BEM + prefix dự án** | `.xx-hero`, `.xx-hero__title`, `.xx-hero__cta--primary` |
| Settings id | `snake_case`, prefix theo nhóm | `home_hero_title` |

> Prefix CSS riêng cho từng dự án để không đụng độ khi ghép nhiều site. BEM ≤ 2 cấp (`block__element`, không `block__el__sub`).

---

## 5. CSS / SCSS

- **KHÔNG hardcode** màu / font-size / font-family. Dùng **CSS variables** khai báo trong `header_style.bwt` (`:root`), map từ `settings`:
  ```css
  :root{ --mainColor: {{ settings.main_color }}; --fs-base: 1rem; --font-primary: 'X', sans-serif; }
  ```
- Thứ tự CSS: Layout/Box → Typography → Visual → Animation → States → Media queries (lớn→nhỏ).
- **Breakpoints chuẩn:** `1200` (desktop), `991` (tablet), `767` (tablet nhỏ/mobile lớn), `480` (mobile).
- Spacing hệ 8pt: 4/8/16/24/32/48/64px.

### ⚠️ SCSS Sapo compiler KHÔNG hỗ trợ (sẽ lỗi build)
- `clamp()`, `dvh`, `ch`, `&::before`/`&::after` viết kiểu nesting một số bản compiler cũ bắt lỗi → viết tách selector.
- **KHÔNG `@import` CSS ngoài trong SCSS** — nạp Google Fonts qua `<link>` trong `<head>` (`theme.bwt`).
- **KHÔNG để UTF-8 BOM** (`&#xFEFF;`) đầu file.
- Biến SCSS gán từ Liquid phải luôn có giá trị (`$x: {{ settings.y }};` — nếu `y` rỗng → `$x: ;` lỗi "Expected expression"). Đặt `default:` hoặc bù giá trị.

---

## 6. JavaScript
- jQuery có sẵn toàn trang → dùng cho DOM; vanilla JS cho logic đơn giản. **Không thêm thư viện mới** khi chưa cân nhắc.
- JS cuối trang trong `footer_script.bwt` hoặc file `*.js.bwt` riêng.
- Truy cập settings/Liquid trong JS: `var c = '{{ settings.main_color }}';`.
- Nếu nhúng framework (Vue CDN) trong file có Liquid → đổi delimiters để không đụng `{{ }}` của Liquid (vd `['[[', ']]']`).

---

## 7. Hình ảnh — quy chuẩn render

| Loại ảnh | Nguồn | Filter |
|---|---|---|
| Ảnh tĩnh thiết kế (logo, icon, banner nền) | file trong `Assets/` | `asset_url` |
| Ảnh nội dung (admin upload qua Tùy chỉnh) | `settings.X` (type image) | `settings.X \| img_url: 'WxH'` |
| Ảnh dữ liệu (product/collection/article) | object Sapo | `object.src \| img_url: 'WxH'` |

**Bắt buộc mọi `<img>`:** có `width` + `height` + `alt` có nghĩa. Below-the-fold → `class="lazyload"` + `data-src` + base64 placeholder; hero → `loading="eager"`.
**Ảnh settings** → guard `!= blank` + `onerror` fallback (ảnh upload lưu ở `theme_temp/` ngoài repo, dễ `E006 "Origin file not found"` khi grunt sync):
```liquid
{% if settings.hero_image != blank %}
  <img class="lazyload" width="1600" height="900"
    src="data:image/png;base64,iVBOR...=="
    data-src="{{ settings.hero_image | img_url: '1024x1024' }}" alt="..."
    onerror="this.onerror=null;this.nextElementSibling.style.display='';this.remove();">
  <div class="hero-placeholder" style="display:none"></div>
{% else %}
  <div class="hero-placeholder"></div>
{% endif %}
```
> `img_url` **luôn** kèm named size hợp lệ (xem `sapo-objects.md`) — để rỗng → tải ảnh gốc nặng; `WxH` tùy ý → 404.

---

## 8. Settings — hai file, hai vai trò
- `settings_schema.json` = **MÔ TẢ** (đọc để tra `id`). **Không sửa để bật/tắt tính năng.**
- `settings_data.json` = **DỮ LIỆU** → chỉ sửa section **`current`**. `presets` là bản gốc — không đụng.
- Thêm setting mới: (1) entry vào `settings_schema.json` đúng nhóm → (2) giá trị vào `current` → (3) dùng `{{ settings.x }}` → (4) thêm CSS var nếu cần.
- Nếu một key không có trong `current`, Sapo lấy `default` từ schema (⚠️ môi trường preview local chỉ đọc `current` → cần bù key thiếu).

---

## 9. Thang ưu tiên giải pháp (khi có nhiều cách)
```
1. DÙNG DỮ LIỆU CÓ SẴN   ← object Sapo đã mang thông tin? (link.object, collection.image, tags, metafield)
2. GIỮ WORKFLOW ADMIN     ← merchant không phải học chỗ nhập mới
3. KHÔNG TẠO CONFIG MỚI   ← thêm setting là chi phí vĩnh viễn
4. KHÔNG TẠO TECH DEBT    ← cảnh giác pattern N items × M fields (chỉ chấp nhận khi N≤6, là content biên tập)
5. REFACTOR LỚN           ← phương án cuối, cần audit + migration + backward-compatible
```
Tie-breakers: object > settings > hardcode · linklist-first > repeating settings · ít file phải sửa hơn · giữ được fallback/legacy.

---

## 10. Môi trường dev — `grunt-bizweb`
- Sync `.bwt` local ↔ store: `grunt watch` (live), `grunt bizweb:download` / `:upload` / `:themes`.
- Cần API key/secret từ **Private App** (Admin → Ứng dụng → Ứng dụng riêng, quyền Read/Write theme).
- `Gruntfile.js` chứa key/secret → **KHÔNG commit** (thêm `.gitignore`).
- Xác thực API trực tiếp: `https://API_KEY:API_SECRET@{store}.mysapo.net/admin/resource.json`.
