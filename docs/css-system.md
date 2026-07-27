# DR.REJU — CSS System (class dùng chung)

> **Nguyên tắc số 1: GHÉP class có sẵn, KHÔNG đẻ class mới cho từng section.**
> 1 element mang nhiều class `dr-*` để đủ thuộc tính. Chỉ viết CSS mới cho widget thật sự độc nhất/phức tạp (khi đó dùng BEM prefix `dr-`).
> Icon: dùng **Font Awesome 6 CDN** (`fa-solid` / `fa-brands`), KHÔNG vẽ SVG tay.

## Nguồn sự thật
- **Tokens** (`:root`) → `snippets/header_style.bwt`. Đổi màu/font/size **ở đây** là đổi cả theme.
- **Utility + component** → `assets/utilities.scss.bwt` (đọc token qua `var()`), nạp mọi trang.
- **Icon** → Font Awesome CDN nạp trong `header_style.bwt`.

## Tokens (đọc qua `var(--x)`)
| Nhóm | Biến |
|---|---|
| Màu | `--bg` #156b54 · `--bg-soft` · `--bg-card` · `--surface` #fff · `--text` #fdf94e · `--text-soft` · `--text-on-surface` · `--line` · `--accent` · `--accent-ink` |
| Font | `--font-primary` · `--font-secondary` *(đang Quicksand — đổi 1 dòng nếu chốt font khác)* |
| Cỡ chữ | `--fs-xs sm base md lg xl 2xl 3xl` |
| Spacing (8pt) | `--sp-4 8 16 24 32 48 56 80 110` |
| Khác | `--container` 1320px · `--radius` · `--radius-sm` · `--radius-pill` · `--shadow` |

## Bảng class `dr-*`
**Layout:** `dr-container` · `dr-section` / `dr-section--sm` · `dr-grid-2/3/4` · `dr-flex` `dr-flex-col` `dr-flex-between` `dr-flex-center` `dr-items-center` · `dr-wrap` `dr-full` `dr-rel` · `dr-gap-8/16/24/32`
**Spacing:** `dr-mt-8/16/24/32` · `dr-mb-8/16/24/32/48` · `dr-p-16/24/32`
**Chữ:** `dr-h1/h2/h3/h4` · `dr-body` · `dr-lead` · `dr-small` · `dr-eyebrow` · modifier `dr-bold` `dr-medium` `dr-light` `dr-up` `dr-center` `dr-italic`
**Màu/nền:** `dr-c-text` `dr-c-soft` `dr-c-accent` `dr-c-ink` · `dr-bg` `dr-bg-soft` `dr-bg-card` `dr-surface`
**Ảnh (image-first):** `dr-media` (+`dr-media img`) · `dr-img-cover` · `dr-ratio-1x1/4x5/16x9/16x10` · `dr-overlay` / `dr-overlay--left`
**Component:** `dr-btn` +`dr-btn--primary/--outline/--ghost` · `dr-card` +`dr-card--surface` · `dr-badge` · `dr-appicon` (icon store) · `dr-tile` (+`dr-tile__in`) · `dr-hero` (+`dr-hero__in`) · `dr-banner` (+`dr-banner__in`) · `dr-scroll-x` (carousel)

## Mẫu dùng — 1 section = ghép class
```html
<section class="dr-section dr-bg-soft">
  <div class="dr-container">
    <span class="dr-eyebrow">Da liễu 1:1</span>
    <h2 class="dr-h2 dr-up dr-mt-8">Bắt đầu từ đúng vấn đề</h2>
    <div class="dr-grid-4 dr-gap-24 dr-mt-24">
      <a class="dr-tile"><img src="{{ 'bs_Hue-1.jpg' | asset_url }}" alt="">
        <div class="dr-tile__in"><h3 class="dr-h4 dr-up">Nám & sắc tố</h3></div></a>
    </div>
    <a href="#" class="dr-btn dr-btn--primary dr-mt-24">Khởi tạo hồ sơ da</a>
  </div>
</section>
```

Banner image-first (ảnh + 1 câu dẫn + CTA):
```html
<section class="dr-banner">
  <img src="{{ 'banner-x.jpg' | asset_url }}" alt="">
  <div class="dr-overlay dr-overlay--left"></div>
  <div class="dr-banner__in"><div class="dr-container">
    <h2 class="dr-h1">Điều trị nám bằng bằng chứng</h2>
    <a class="dr-btn dr-btn--primary dr-mt-16">Xem chương trình</a>
  </div></div>
</section>
```

Icon:
```html
<i class="fa-solid fa-user-doctor"></i>   <i class="fa-brands fa-app-store"></i>
```

## Khi cần thứ chưa có
1. Thiếu **giá trị** (màu/size mới) → thêm **token** ở `:root`, đừng hardcode.
2. Thiếu **1 tiện ích nhỏ** → thêm 1 class `dr-*` vào `utilities.scss.bwt` (tái dùng được).
3. Widget **phức tạp/độc nhất** → viết block BEM `dr-<block>__<el>--<mod>` trong file scss của section, vẫn đọc token qua `var()`.
> Không lặp lại thuộc tính đã có class. Không hardcode màu/size/font.
