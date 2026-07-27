# Sapo / Bizweb — Object Schema Reference

> Tra cứu object Liquid trong Sapo theme khi viết `.bwt`: field nào có, kiểu gì.
> Tài liệu **generic theo chuẩn Sapo** — ví dụ chỉ mang tính minh hoạ, không gắn brand cụ thể.

---

## Quy ước chung
- Sapo dùng ngôn ngữ template **Liquid** (KHÔNG phải Shopify — xem `sapo-conventions.md` §Sapo-vs-Shopify).
- Giá tiền là **số nguyên VND** (không nhân 100 như Shopify cents). `250000` = 250.000₫.
- Object được inject tự động vào template tương ứng — không cần khai báo.

---

## `store` *(global — mọi nơi)*
```
store.name                       → String   Tên cửa hàng
store.description                → String   Mô tả
store.domain                     → String   "myshop.mysapo.net"
store.permanent_domain           → String   "myshop.bizwebvietnam.net"
store.url                        → String
store.email                      → String
store.address                    → String   Địa chỉ (full text)
store.phone_number               → String
store.currency                   → String   "VND"
store.money_format               → String   "{{ amount }}đ"
store.products_count             → Integer
store.collections_count          → Integer
store.password_message           → String   Lời nhắn khi bật bảo trì (rỗng nếu tắt)
store.vendors                    → Array<String>  Thương hiệu (tổng hợp tự động từ SP)
store.types                      → Array<String>  Loại sản phẩm (tổng hợp tự động)
```

## `collections` *(global)* vs `collection` *(chỉ trang collection)*
`collections` là hash tra cứu theo handle, **dùng được mọi nơi**. `collection` (số ít) **chỉ có giá trị trong `collection.bwt`**, nil ở template khác → mọi nơi khác dùng `collections['handle']`.
```
collections['handle']                → collection object | nil
collections['handle'].products       → Array<product>
collection.id / .name / .alias / .url / .description
collection.products_count            → Integer
collection.image                     → null | { src }
collection.products                  → Array<product> (tối đa 50/trang → dùng paginate)
collection.tags / .all_types / .all_vendors → Array<String>
collection.current_type / .current_vendor   → null | String (khi URL có ?type= / ?vendor=)
collection.default_sort_by           → "manual" | "created-desc" | "alpha-asc" | "price-asc" | ...
```
```liquid
{% assign col = collections[settings.featured_col] %}
{% if col.products_count > 0 %}
  {% for p in col.products limit: 8 %}{{ p.name }}{% endfor %}
{% endif %}
```
> `collections['handle']` → `nil` nếu handle sai — luôn check `col.products_count > 0` trước khi loop. Không `{{ collections | json }}` (Sapo không serialize object phức tạp).

## `product`
```
product.id / .name / .alias / .url
product.description         → String (HTML)
product.summary            → String (mô tả ngắn)
product.vendor / .type     → String
product.available          → Boolean
product.price              → Integer (VND)
product.compare_at_price   → Integer (0 = không có giá gốc)
product.inventory_quantity → Integer
product.inventory_policy   → "deny" | "continue"
product.tags               → Array<String>
product.collections        → Array<collection>
product.featured_image     → { src, alt }
product.images             → Array<{ src, alt }>
product.variants           → Array<variant>
product.selected_or_first_available_variant → variant
product.metafields.<namespace>.<Key>        → String (đọc kiểu ["value"] → cần remove [ ] ")
```
**Pattern tính % giảm giá:**
```liquid
{% assign price   = product.selected_or_first_available_variant.price %}
{% assign compare = product.selected_or_first_available_variant.compare_at_price %}
{% if compare > price %}
  {{ compare | minus: price | times: 100 | divided_by: compare | round }}%
{% endif %}
```

## `variant`
```
variant.id / .title / .sku
variant.price / .compare_at_price → Integer
variant.available                 → Boolean
variant.inventory_quantity        → Integer
variant.inventory_policy          → "deny" | "continue"
```
```html
<input type="hidden" name="variantId" value="{{ variant.id }}">
```

## `image` + filter `img_url`
```
image.src → String   image.alt → String
```
`img_url` **CHỈ** nhận named size hợp lệ (dưới) — `WxH` tùy ý (300x300, 400x400…) → **404**.

| Tham số | Bounding box |
|---|---|
| `pico` | 16×16 |
| `icon` | 32×32 |
| `thumb` | 50×50 |
| `small` | 100×100 |
| `compact` | 160×160 |
| `medium` | 240×240 |
| `large` | 480×480 |
| `grande` | 600×600 |
| `1024x1024` | 1024×1024 |
| `2048x2048` | 2048×2048 |
| `master` | lớn nhất |

> `original` đã deprecated. Chỉ `1024x1024` / `2048x2048` là dạng số hợp lệ.

## `cart`
```
cart.item_count            → Integer
cart.total_price           → Integer (| money để format)
cart.items                 → Array<line_item>
  item.product / .title / .quantity
  item.price / .line_price → Integer
  item.image / .url / .variant
```
API JS: `POST /cart/add.json {variantId, quantity}` · `GET /cart.json` · `POST /cart/change.json {id, quantity}`.

## `customer` *(khi đăng nhập; guest = nil)*
```
customer.id / .name / .email / .phone
customer.addresses_count           → Integer
customer.default_address           → address
customer.addresses                 → Array<address>
customer.orders                    → Array<order>  (dùng với paginate)
address.address1 / .district / .city / .country / .phone / .company
```
Kiểm tra đăng nhập: `{% if customer %}`.

## `order`
```
order.name                 → "#1001"
order.created_on           → Date  ({{ | date: 'dd/MM/yyyy' }})
order.total_price / .subtotal_price / .shipping_price / .total_discounts → Integer
order.financial_status     → 'paid' | 'pending' | 'partially_paid' | 'refunded' | 'cancelled'
order.cancelled            → Boolean  (CỜ HỦY chính thức — ưu tiên dùng)
order.cancel_reason        → String
order.fulfillment_status   → 'fulfilled' | 'partial' | 'unfulfilled'/null (đã xuất kho, CHƯA chắc tới khách)
order.shipping_status      → 'delivering' | 'delivered' | 'returning' | 'returned' | 'cancelled' (GIAO tới khách)
order.line_items[]         → .price_final / .price_original (KHÔNG dùng .price/.line_price — deprecated)
                             .url (link SP), .quantity, .title
order.discounts[]          → { code, savings }   order.total_discounts
order.shipping_address     → address
```
> ❌ KHÔNG tồn tại trên `order`: `.gateway`, `.note`, `.shipping_methods`, `.discount` (số ít). Dùng `.financial_status`, `.shipping_price`, `.discounts[]`.

## `blog` & `article`
```
blog.name / .alias / .articles_count / .articles[]
article.title / .content(HTML) / .summary / .author / .url
article.image.src
article.published_on / .created_on → Date
article.tags → Array<String>
```

## `page` & `pages`
```
page.title / .content(HTML) / .url / .alias
pages['handle'].title / .url        (truy cập trang bất kỳ theo handle)
```

## `linklist` *(menu)*
```
linklists['handle'].title / .handle
linklists['handle'].links[]
  link.title / .url / .active / .type ('collection_link'|'page_link'|'http_link')
  link.links[]  (menu con — dropdown)
  link.object   (object đích: collection/page → .image, .products_count…)
```
> Guard 3 lớp trước khi render menu: `!= blank` + object tồn tại + `links.size > 0`.

## `search`
```
search.terms / .results_count / .results[]
  item.object_type == 'product' | 'article'
```

## `paginate`
```
{% paginate collection.products by 12 %} ... {% endpaginate %}
paginate.current_page / .pages / .items / .page_size
paginate.next.url / .previous.url
```

## `forloop`
```
forloop.index / .index0 / .first / .last / .length
```

## Biến global (mọi template)
```
template            → "product" | "index" | "collection" | "customers/account" ...
page_title / page_description / canonical_url / current_tags / current_page
content_for_header  → scripts từ Sapo apps (đặt trong <head>)
content_for_layout  → nội dung page (đặt trong <body> của layout)
```

---

## Settings Schema — các `type` hợp lệ trên Sapo

| Type | Admin UI | Giá trị trong `settings_data.json` | Lưu ý |
|---|---|---|---|
| `checkbox` | Toggle | `true`/`false` | `default: false` |
| `text` | Ô 1 dòng | `"string"` | — |
| `textarea` | Nhiều dòng | `"string"` | — |
| `color` | Color picker | `"#rrggbb"` | — |
| `image` | Upload ảnh | *(không set default)* | **Không có `default`** |
| `select` | Dropdown | `"value"` (string) | Bắt buộc `"options":[{value,label}]` |
| `page` | Chọn trang | handle | — |
| `collection` | Chọn danh mục | handle | — |
| `blog` | Chọn blog | handle | — |
| `link_list` | Chọn menu | handle | Không có default |
| `header` | Tiêu đề nhóm | *(không id)* | Chỉ field `"content"` |
| `paragraph` | Ghi chú | *(không id)* | Chỉ field `"content"` |

> ⚠️ **`range` và `number` KHÔNG hợp lệ** trên Sapo (gây lỗi runtime). Thay bằng `select` (options) hoặc `text`.
> Giá trị `select` **luôn là string** — trong `settings_data.json` phải `"8"` chứ không `8`. Trong Liquid ép số: `{% assign n = settings.x | times: 1 %}` (hoặc dùng thẳng `limit:` — Sapo tự coerce).

**Cấu trúc entry ví dụ:**
```json
{ "type": "checkbox", "id": "feature_enable", "label": "Bật X", "default": false }
{ "type": "text",     "id": "hero_title", "label": "Tiêu đề", "info": "≤80 ký tự", "default": "" }
{ "type": "color",    "id": "theme_accent", "label": "Màu nhấn", "default": "#000000" }
{ "type": "image",    "id": "hero_image", "label": "Ảnh Hero" }
{ "type": "select",   "id": "limit", "label": "Số SP", "default": "8",
  "options": [{"value":"4","label":"4"},{"value":"8","label":"8"},{"value":"12","label":"12"}] }
{ "type": "collection","id": "flash_col", "label": "Collection Flash Sale" }
{ "type": "link_list", "id": "footer_menu", "label": "Menu chân trang" }
{ "type": "header",    "content": "── TÊN MỤC ──" }
{ "type": "paragraph", "content": "Hướng dẫn cho admin." }
```
