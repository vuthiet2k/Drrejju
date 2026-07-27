# DR.REJU — Design & Content Brief (bản NHÁP để bạn duyệt & bổ sung)

> Mục đích: gom thông tin từ 2 file bạn gửi để chốt trước khi sửa theme.
> Nguồn:
> - **Khung/thiết kế chuẩn** ← `web_demo_html/index.html` (bạn chốt đây là chuẩn theme: font, màu, khung, ưu tiên ảnh).
> - **Nội dung & brand** ← `web_demo_html/Dr.Reju — Da liễu dựa trên bằng chứng.html`.
>
> 👉 Chỗ nào có **❓** là cần bạn xác nhận/điền. Duyệt xong tôi mới sửa vào theme `E:\DRREJU-web`.

---

## 0. Nguyên tắc chủ đạo (quan trọng nhất)

1. **ƯU TIÊN ẢNH (image-first).** DR.REJU có đội làm **banner/poster quảng cáo**. Website KHÔNG ôm nhiều chữ.
2. **Mỗi section = 1 ẢNH lớn (banner) + 1 CÂU DẪN (hook) + 1 NÚT.** Câu dẫn chỉ để "gãi đúng chỗ ngứa" → thu hút click vào xem chương trình/chi tiết.
3. **Chữ tối giản, ảnh nói thay.** Không mô tả dài; nội dung chi tiết nằm trong banner (do team thiết kế) hoặc ở trang đích sau khi click.
4. Bố cục full-bleed, khoảng thở rộng, tông editorial/y khoa cao cấp (theo `index.html`).

> ❓ Xác nhận: mô hình "1 ảnh + 1 câu dẫn + 1 nút" áp cho **tất cả** section chính, đúng không? Hay có vài section vẫn cần nhiều chữ (vd Vì sao chọn / Liên hệ)?

---

## 1. HỆ THIẾT KẾ CHUẨN (rút từ `index.html`)

### 1.1 Font chữ
| Vai trò | Font | Weight dùng |
|---|---|---|
| Tiêu đề / hero / nav (display) | **Jost** | 300–600 |
| Nội dung / mô tả (body) | **Inter** | 300–500 |

### 1.2 Màu sắc — ✅ DR.REJU (bạn chốt)
**Nền chính `#156b54` (xanh lá đậm) · Chữ chính `#fdf94e` (vàng).** Đây là bộ nhận diện chính thức — KHÔNG dùng kem/hồng blush của `index.html` nữa (chỉ mượn *khung layout* của index).

| Token | Mã | Vai trò |
|---|---|---|
| `--bg` (nền chính) | **`#156b54`** | Xanh lá đậm — NỀN CHÍNH toàn trang |
| `--text` (chữ) | **`#fdf94e`** | Vàng — MÀU CHỮ chính |

**Token phụ trợ (tôi ĐỀ XUẤT — bạn chỉnh nếu muốn):** cần thêm vài sắc để có nền xen kẽ, thẻ, đường kẻ, chữ phụ mà vẫn đọc được:
| Token | Mã đề xuất | Vai trò |
|---|---|---|
| `--bg-soft` | `#0f5541` | Xanh đậm hơn — section xen kẽ / footer |
| `--bg-card` | `#1c7a60` | Nền thẻ/box nổi trên nền chính |
| `--text-soft` | `#e9e6b0` | Chữ phụ (vàng ngả kem, dịu hơn cho đoạn dài) |
| `--line` | `rgba(253,249,78,.22)` | Đường kẻ (vàng mờ) |
| `--accent` | `#fdf94e` | Nhấn = chính màu vàng |

> ❓ Xác nhận: chữ **vàng `#fdf94e` cho MỌI text** (kể cả đoạn dài) hay chỉ cho tiêu đề/nhấn, còn body dùng vàng-kem dịu `--text-soft`? (vàng chói cho cả đoạn dài dễ mỏi mắt).
> ❓ Nút bấm: nền vàng chữ xanh, hay viền vàng nền trong suốt? (cho tôi biết để khoá style nút).

### 1.3 Thông số layout
- Container: **1320px**, padding 40px (mobile 22px).
- Section padding dọc: **110px** (mobile 60px).
- Nút: chữ nhật bo nhẹ (radius 2px), UPPERCASE, giãn chữ `.18em`, nền `--ink` chữ trắng, hover đảo màu.
- Eyebrow: chữ nhỏ UPPERCASE giãn `.28em`, màu `--blush-dk`.
- Ảnh: full-bleed, `object-fit:cover`, hover zoom nhẹ (scale 1.05).

### 1.4 Font — CÒN CẦN CHỐT (màu đã xong ở 1.2)
Màu đã chốt: **xanh `#156b54` + vàng `#fdf94e`** (mục 1.2). Chỉ còn **font**:
- `index.html` dùng **Jost + Inter**.
- File nội dung DR.REJU dùng **Public Sans + Source Serif 4** (serif cho tiêu đề → cảm giác y khoa/uy tín).

> ❓ **Chốt cặp font nào?**
> - **(A) Jost (tiêu đề) + Inter (body)** — như `index.html`.
> - **(B) Source Serif 4 (tiêu đề) + Public Sans (body)** — như file nội dung, sang & "y khoa" hơn.
> - Font bạn tự định: __________
chốt theo "E:\DRREJJU\data\web_demo_html\index.html" màu xanh là nền của ảnh logo họ đưa, màu vàng chính là màu logo, vẫn lấy màu sắc theo index đã, tự lưu lại màu xanh và vàng này ở config để có 1 header, footer nổi lên được logo theo đúng màu của họ - vì họ đã quen logo trên nền xanh đó rồi
---

## 2. THƯ VIỆN BỐ CỤC (section patterns từ `index.html`)

Mỗi mẫu dưới đây = 1 "khối" tái sử dụng. Vai trò text ghi rõ để bám nguyên tắc **1 câu dẫn**.

| Mẫu | Mô tả | Text tối đa |
|---|---|---|
| **Topbar** | 1 dòng thông báo chạy trên cùng | 1 câu ngắn |
| **Header sticky** | Logo + menu + icon (search/account/cart) + nút CTA | menu 5 mục |
| **Hero full-bleed** | Ảnh nền lớn + overlay tối + badge + 1 tiêu đề + 1 nút | tiêu đề + 1 dòng |
| **Grid 3 ảnh** | 3 ô ảnh full-bleed, mỗi ô 1 tên + 1 link | tên + link |
| **Featured 2 cột** | Ảnh 1 bên + tiêu đề + vài gạch đầu dòng + nút | tiêu đề + 3 ý |
| **Carousel 6 item** | Cuộn ngang 6 thẻ ảnh + tên + giá/nhãn | tên + 1 dòng |
| **Promo full-bleed** | Ảnh nền + 1 tiêu đề + 1 nút (dạng banner click) | tiêu đề + nút |
| **Promo split** | 2 banner cạnh nhau, mỗi cái 1 hook + nút | hook + nút |
| **Newsletter** | Nền tối + 1 tiêu đề + ô email | tiêu đề |
| **Footer** | 4 cột: brand + liên kết + liên hệ | — |

> Các mẫu "Promo full-bleed / split" chính là chỗ đặt **banner do team bạn thiết kế** + 1 câu dẫn.

---

## 3. BRAND & NỘI DUNG (rút từ file Dr.Reju)

### 3.1 Nhận diện
- Tên: **Dr.REJU** (Dr.Reju) · dòng dưới logo: **"BÁC SĨ NGUYỄN HUỆ"** · biểu tượng hiện tại: ✿
- Định vị: **"Da liễu dựa trên bằng chứng, phác đồ 1:1"**
- Thông điệp lõi: *Chấm dứt điều trị da theo cảm tính — bác sĩ đọc dữ liệu thật trên da rồi mới ra phác đồ.*
- Tông giọng: thẳng thắn, có nguyên tắc, y khoa, tử tế (dám từ chối "trị mụn cấp tốc").

### 3.2 Đội ngũ
- **BS. Nguyễn Huệ** — Chuyên gia Da liễu Lâm sàng, Người sáng lập.
- DS. Trần Mai Linh — Dược sĩ lâm sàng.
- KTV. Lê Quốc Anh — Kỹ thuật viên trị liệu.
- CVCS. Phạm Thu Hà — Chuyên viên chăm sóc da.

### 3.3 Liên hệ (ưu tiên **Zalo**)
- Zalo: nút nổi góc phải + CTA khắp trang · Hotline: **0900 000 000** (❓ số thật?)
- Địa chỉ cơ sở: **[cần điền]** · Email: **[cần điền]**

### 3.4 Kho nội dung (các khối trong trang gốc)
| Khối | Nội dung | Ghi chú image-first |
|---|---|---|
| **Hero** | Hook "phác đồ dữ liệu lâm sàng 1:1" + 2 nút (Khởi tạo hồ sơ da / Xem vấn đề da) | 1 ảnh + 1 hook |
| **Vì sao chọn** | 6 nguyên tắc (bác sĩ xây phác đồ · chỉ thứ kiểm chứng · không lạm dụng thuốc · phân loại theo mức độ · theo sát Zalo · đạo đức nghề) + card bác sĩ | ❓ nhiều chữ — giữ hay rút thành ảnh? |
| **Vấn đề da** | 8 tile: Mụn & bít tắc · Nám & sắc tố · Da nhạy cảm & đỏ · Lão hóa · Da khô · Lỗ chân lông to · Da khi mang thai · "Chưa rõ? làm test" | mỗi tile 1 icon/ảnh + 1 nhãn |
| **Quiz hồ sơ da** | 4 câu → gợi ý routine 4 bước (Vue). Kết quả: Da dầu mụn / Nám & sắc tố / Lão hóa / Nhạy cảm | ❓ có đưa lên web không (cần JS)? |
| **Sản phẩm khuyên dùng** | 10 SP, lọc theo *vấn đề da / dòng / giá*. Nhãn: Mụn/Sắc tố/Nhạy cảm | thẻ ảnh vuông + tên + giá |
| **Dịch vụ điều trị** | 3: Laser PicoSure Pro (sắc tố/nám) · Soi da AI · Mesotherapy (phục hồi) | 3 ảnh 16:10 + 1 dòng |
| **TPCN bổ trợ** | 4: Viên chống nắng · Kẽm+B5 · Collagen peptide · Glutathione | thẻ ảnh + giá |
| **Blog kiến thức** | Case lâm sàng (nám thai kỳ, retinol, nám mảng…) | 1 ảnh lớn + list nhỏ |
| **Thương hiệu hợp tác** | 12 logo: SkinCeuticals, La Roche-Posay, EltaMD, Obagi, PCA Skin, Paula's Choice, Revision, Alastin, Martiderm, Bioderma, Vichy, Some By Mi | dải logo |
| **Kết quả thực tế** | Before/After + "quyết định bước ngoặt". Mỗi vấn đề da có thư viện 8–12 ảnh | ảnh trước/sau |
| **Liên hệ** | Card bác sĩ + form (tên/điện thoại/tình trạng da) + Zalo | form + ảnh |

### 3.5 Dữ liệu chi tiết (để tái dùng khi dựng)
**Sản phẩm (10):** SRM dịu nhẹ pH5.5 (La Roche-Posay, 380k) · Gel BHA 2% (Paula's Choice, 620k) · Serum Niacinamide 10% (The Ordinary, 320k) · Serum Tranexamic Acid (SkinCeuticals, 750k) · Serum Vit C 15% (SkinCeuticals, 1.850k) · KCN SPF50 (EltaMD, 690k) · Kem Ceramide phục hồi (Martiderm, 520k) · Retinol 0.3% (PCA Skin, 980k) · Xịt khoáng làm dịu (Vichy, 210k) · Chấm mụn Benzoyl 2.5% (Obagi, 250k).
Phân loại: **theo vấn đề** (Mụn / Nám-sắc tố / Nhạy cảm-phục hồi) · **theo dòng** (Làm sạch / Đặc trị / Dưỡng ẩm / Chống nắng) · **theo giá** (<500k / 500k–1tr / >1tr).

**Quiz:** 4 câu (loại da → vấn đề lo nhất → độ kích ứng → mục tiêu) → 4 kết quả (Da dầu mụn / Nám & sắc tố / Lão hóa / Nhạy cảm), mỗi kết quả kèm routine 4 bước gắn sản phẩm.

**Dịch vụ:** Điều trị sắc tố & nám — *Laser PicoSure Pro* · Soi & phân tích da — *Skin Analysis AI* · Phục hồi & nuôi dưỡng sâu — *Mesotherapy*.

---

## 4. MAP SANG THEME SAPO (đề xuất — cần bạn duyệt)

Thứ tự trang chủ `home_section_1..N` (image-first, mỗi khối 1 câu dẫn):

| Slot | Section | Kiểu | Nội dung/hook |
|---|---|---|---|
| 1 | Hero | Hero full-bleed | Banner + "Phác đồ da 1:1 dựa trên bằng chứng" + nút |
| 2 | Vấn đề da | Grid tile ảnh | 8 vấn đề → click sang collection/quiz |
| 3 | Vì sao chọn | Featured / banner | 1 banner + hook nguyên tắc (rút gọn) |
| 4 | Dịch vụ điều trị | Grid 3 ảnh | 3 dịch vụ (Laser/AI/Meso) |
| 5 | Sản phẩm khuyên dùng | Carousel | thẻ sản phẩm |
| 6 | Kết quả thực tế | Before/After | banner trước–sau |
| 7 | Thương hiệu hợp tác | Dải logo | 12 logo |
| 8 | Blog kiến thức | Grid bài | case lâm sàng |
| 9 | Liên hệ / Zalo | Promo tối | 1 hook + nút Zalo |

> ❓ Bạn muốn **giữ/bỏ** khối nào? Thứ tự có đổi không?
> ❓ Có làm phần **ecommerce thật** (giỏ hàng/sản phẩm Sapo) hay sản phẩm chỉ để **trưng bày → click Zalo tư vấn**?
> ❓ **Quiz hồ sơ da** có đưa lên không (cần Vue/JS trong theme)?

---

## 5. ❓ CHECKLIST CẦN BẠN XÁC NHẬN / BỔ SUNG

- [ ] **Palette & font cuối** (mục 1.4): chọn A / B / C / khác.
- [ ] Logo thật (file) & biểu tượng (đang tạm ✿).
- [ ] Hotline thật, Zalo (link/SĐT), địa chỉ cơ sở, email, giờ làm việc.
- [ ] Menu chính (mục) & các trang đích khi click.
- [ ] Danh sách section trang chủ + thứ tự (mục 4).
- [ ] Ecommerce thật hay chỉ trưng bày → Zalo?
- [ ] Có làm Quiz không?
- [ ] **Kích thước banner chuẩn** để team thiết kế đúng (đề xuất ở mục 6).
- [ ] Nội dung/câu dẫn (hook) cho từng section — bạn viết hay tôi đề xuất rồi bạn sửa?
- [ ] Sản phẩm/dịch vụ/giá: dùng danh sách ở mục 3.5 hay bạn gửi danh sách thật?

---

## 6. TÀI SẢN ẢNH CẦN (placeholder → team làm banner)

Đề xuất kích thước để đội thiết kế xuất đúng (16:9 hoặc dọc tùy vị trí):

| Vị trí | Kích thước gợi ý | Ghi chú |
|---|---|---|
| Hero (desktop) | 1920×1000 | chừa vùng tối để chữ nổi |
| Hero (mobile) | 1080×1350 | dọc |
| Tile vấn đề da | 800×800 | vuông, có thể chỉ icon |
| Banner dịch vụ | 1200×750 (16:10) | |
| Thẻ sản phẩm | 800×800 | nền sáng |
| Promo full-bleed | 1920×700 | banner ngang |
| Before/After | 1000×800 (mỗi bên 500×800) | |
| Logo thương hiệu | nền trong suốt PNG/SVG | |

> Trên Sapo: ảnh dữ liệu (sản phẩm/blog) lấy từ CDN qua `img_url`; banner cố định để `asset_url`. Ảnh chưa có → placeholder + `onerror` fallback.

---

---

## 7. ĐÃ THIẾT LẬP (cập nhật)

### 7.1 Hệ CSS — class dùng chung `dr-*` ✅
Chốt hướng: **utility + component layer tự dựng trong theme** (không Tailwind CDN). Chi tiết: [`css-system.md`](css-system.md).
- Tokens ở `snippets/header_style.bwt` (`:root`): màu #156b54/#fdf94e + phụ trợ, font, `--fs-*`, spacing, radius.
- Class `dr-*` ở `assets/utilities.scss.bwt`. Dựng section = **ghép class có sẵn**, không đẻ class mới.
- **Icon: Font Awesome 6 CDN** (`fa-solid`/`fa-brands`), không vẽ SVG tay.

### 7.2 Ảnh mặc định đã nạp vào `assets/` ✅
Copy từ `E:\DRREJJU\data` (phòng khi admin chưa cấu hình):
- `logo.png` (header dùng trực tiếp qua `asset_url`) · `logo_black.png` · `logo_icon.png` · `favicon.png` (đã bật `favicon_enable`).
- **Ảnh BS Nguyễn Huệ:** `bs_Hue-1..3.jpg`, `bstk_Hue-1..4.jpg` — dùng cho card bác sĩ / section "Vì sao chọn" / Liên hệ.
> ❓ Có logo bản **vàng/sáng** để đặt trên nền xanh #156b54 không? (logo hiện có thể chìm trên nền tối).

### 7.3 App-download đã bật ✅ (DR.REJU đã có app)
Footer hiển thị icon **App Store + Google Play** (Font Awesome). Đã set trong `current`:
`title_col_6="Tải ứng dụng DR.REJU"`, `appstore_link`, `playstore_link`.
> ❓ **Cần link app thật** — hiện đang để `#`. Gửi URL App Store + Google Play của app DR.REJU để thay.

---

### Ghi chú kỹ thuật khi triển khai (không cần bạn duyệt)
- Dự án: `E:\DRREJJU\website_drreju` (snippets `section_*.bwt` + `home_section_X`), xem qua `npm run preview` → http://localhost:3000.
- Text/nội dung → `settings` để admin tự sửa; ảnh banner → asset/settings image; icon → Font Awesome.
- **Không** đụng Pharma Cosmetics.
