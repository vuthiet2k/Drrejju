# DR.REJU — 3 Phương án thiết kế Quiz & Đặt lịch

> **Phase 5 · Fallback — 3 phương án thật (HTML)**
> Áp dụng chuẩn: màu #156b54/#fdf94e, font Jost (tiêu đề) + Inter (body), Font Awesome 6 CDN, template page.quiz & page.dat-lich.

## 🎨 3 Phương án Quiz (page.quiz)

### Phương án A — Trợ lý hội thoại ✅ (ĐÃ SỬA LỖI)
**Logic:** 秒数轮盘 (Fallback Phase 4 — Logic 1)
**Tư duy:** Chat UI trực tuyến — người dùng trả lời qua chip nhanh, nhận phản hồi tức thì từ "trợ lý ảo" của bác sĩ.
**Điểm mạnh:**
- Gần gũi, giảm chi phí nhận thức — người dùng chỉ cần chọn, không cần suy nghĩ
- Phù hợp người trẻ, dùng Zalo nhiều
- Nội dung ngắn gọn, không gây mệt
**File:** `quiz-A-troly.html`
**Skeleton khác biệt:** 2 cột (nội dung trái / chat phải) — không dùng SVG hoặc canvas
**Tính năng:** 4 câu hỏi → 4 kết quả (Da dầu mụn / Nám sắc tố / Lão hóa / Nhạy cảm) + routine đề xuất

### Phương án B — Máy soi da
**Logic:** 标杆迁移 (Fallback Phase 4 — Logic 2)
**Tư duy:** Scanner/đánh giá hệ thống — người dùng chọn vùng da qua giao diện "máy soi" với hiệu ứng quét laser.
**Điểm mạnh:**
- Tạo cảm giác "công nghệ cao", đáng tin cậy
- Phù hợp người thích trực quan, hình ảnh
- Hiển thị thông số số (17 câu hỏi, 9 vùng da, 12 nhóm vấn đề)
**File:** `quiz-B-scanner.html`
**Skeleton khác biệt:** 2 cột (form trái / SVG scanner phải) — dùng SVG path animation + mask

### Phương án C — Hồ sơ hình thành
**Logic:** 最佳设计师 (Fallback Phase 4 — Logic 3)
**Tư duy:** Dữ liệu hóa thành mạng lưới — mỗi câu trả lời là một node nối tới "hồ sơ da" tâm điểm.
**Điểm mạnh:**
- Trực quan hoá hóa quá trình xây dựng hồ sơ
- Tạo cảm giác "được quản lý chuyên nghiệp"
- Phù hợp người thích hệ thống, logic
**File:** `quiz-C-network.html`
**Skeleton khác biệt:** Trung tâm + node quanh viền — dùng SVG + JS tính toán vị trí động

## 📅 3 Phương án Đặt lịch (page.dat-lich)

### Phương án A — Form đơn giản ✅ (ĐÃ SỬA LỖI)
**Logic:** 秒数轮盘 (Fallback Phase 4 — Logic 1)
**Tư duy:** Form điền thông tin nhanh — tất cả trường trong 1 form, gửi về Zalo/gmail.
**Điểm mạnh:**
- Nhanh chóng, ít bước
- Phù hợp người muốn gặp gấp
- Form quen thuộc, không cần học
**File:** `booking-A-simple.html`
**Skeleton khác biệt:** 2 cột (thông tin + bản đồ bên trái / form bên phải)
**Tính năng:** Form đầy đủ (tên, Zalo, dịch vụ, vấn đề da, ghi chú) + bản đồ cơ sở + thông tin liên hệ

### Phương án B — Wizard 3 bước
**Logic:** 标杅迁移 (Fallback Phase 4 — Logic 2)
**Tư duy:** Chia thành 3 bước rõ rệt (Dịch vụ → Thông tin → Xác nhận) với thanh tiến độ.
**Điểm mạnh:**
- Giảm áp lực nhập liệu — mỗi bước chỉ 1-2 trường
- Thanh tiến độ tạo cảm giác hoàn thành
- Phù hợp người mới, cần hướng dẫn
**File:** `booking-B-wizard.html`
**Skeleton khác biệt:** Header + thanh tiến độ + form chiếm toàn bộ

### Phương án C — Zalo-first
**Logic:** 最佳设计师 (Fallback Phase 4 — Logic 3)
**Tư duy:** Chuyển hướng ngay sang Zalo — không cần điền form trên web.
**Điểm mạnh:**
- Tối ưu trải nghiệm người dùng — dùng đúng nền tảng họ đang dùng
- Không lo mất dữ liệu, không lo form lỗi
- Tận dụng tin cậy của Zalo
**File:** `booking-C-zalo.html`
**Skeleton khác biệt:** 2 cột (lợi ích bên trái / CTA Zalo bên phải)

## ✅ Yêu cầu chung đã đáp ứng
- [x] Màu sắc: #156b54 (nền) + #fdf94e (chữ/vàng) — theo design-brief
- [x] Font: Jost (tiêu đề) + Inter (body) — theo index.html
- [x] Icon: Font Awesome 6 CDN (fa-solid/fa-brands)
- [x] Responsive: mobile-first, breakpoint 980px
- [x] prefers-reduced-motion: hỗ trợ
- [x] Template: page.quiz / page.dat-lich (không phải section)
- [x] 3 logic khác biệt skeleton (không trùng layout)
- [x] Logo: dùng logo.png + CSS filter vàng (chờ logo vàng thật)
- [x] CSS không lỗi — đã kiểm tra qua linter
- [x] Bộ câu hỏi quiz: 4 câu → 4 kết quả + routine
- [x] Form đặt lịch: có đầy đủ trường + bản đồ + thông tin liên hệ

## 📁 Cấu trúc file
```
design-demos/
├── direction-approved.md        ← Tóm tắt 3 phương án (Phase 5 gate)
├── quiz-A-troly.html            ← Quiz A (đã sửa lỗi)
├── quiz-B-scanner.html          ← Quiz B
├── quiz-C-network.html          ← Quiz C
├── booking-A-simple.html        ← Đặt lịch A (đã sửa lỗi)
├── booking-B-wizard.html        ← Đặt lịch B
└── booking-C-zalo.html          ← Đặt lịch C
```

## 🔍 Cách xem
```cmd
start design-demos\quiz-A-troly.html
start design-demos\booking-A-simple.html
```

## ⏳ Chờ user chọn
> **Bạn chọn phương án nào cho Quiz? Và phương án nào cho Đặt lịch?**
> - Quiz: A / B / C / Mix (ví dụ: A + C)
> - Đặt lịch: A / B / C / Mix
