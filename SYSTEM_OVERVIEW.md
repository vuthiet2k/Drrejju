# SYSTEM OVERVIEW — DR.REJU E-COMMERCE & CLINIC PLATFORM

## 1. Sứ Mệnh Thương Hiệu (Brand Mission)
**DR.REJU** định vị là hệ thống chăm sóc và điều trị da chuẩn y khoa chuyên sâu.
- **Khẩu hiệu cốt lõi:** *"Da liễu dựa trên bằng chứng · Phác đồ cá nhân hóa 1:1"*.
- **Chuyên môn dẫn dắt:** Bác sĩ Chuyên khoa Da liễu Nguyễn Huệ.
- **Mục tiêu sản phẩm:** Cung cấp trải nghiệm thương mại điện tử kết hợp tư vấn y khoa chuẩn mực, minh bạch về bảng thành phần, hoạt chất kê đơn, quy trình điều trị và hồ sơ năng lực bác sĩ.

## 2. Nhóm Người Dùng Mục Tiêu (Personas)
1. **Khách hàng điều trị (Treatment Seekers):** Người đang gặp vấn đề da nghiêm trọng (nám, mụn bít tắc, lão hóa, da mỏng đỏ sau xâm lấn). Cần sự tin tưởng tuyệt đối vào chuyên môn bác sĩ và phác đồ rõ ràng.
2. **Khách hàng chăm sóc duy trì (Maintenance Shoppers):** Người mua sản phẩm skincare định kỳ (kem chống nắng, sữa rửa mặt, serum cấp ẩm HA, viên uống collagen). Cần trải nghiệm duyệt danh mục nhanh, giỏ hàng tiện lợi.
3. **Bác sĩ & Chuyên gia tư vấn (Clinical Staff):** Đội ngũ y khoa sử dụng trang web làm tài liệu trực quan để giải thích cơ chế hoạt chất và hướng dẫn khách hàng chọn routine phù hợp.
4. **Quản trị viên & Kỹ sư vận hành (Admin / Developers):** Quản lý cấu hình theme Sapo, đồng bộ sản phẩm, triển khai code và kiểm thử tự động.

## 3. Các Hành Trình Cốt Lõi (Primary User Journeys)
```text
[Khách truy cập] 
       │
       ├─► Hành trình 1: Trang chủ ──► Chọn Vấn đề da (8 Chips) ──► Xem phác đồ ──► Gửi form tư vấn Bác sĩ Huệ
       ├─► Hành trình 2: Khảo sát da (/quiz) ──► Trả lời 5 câu hỏi ──► Nhận kết quả chẩn đoán ──► Thêm routine vào giỏ
       ├─► Hành trình 3: Mega Menu ──► Mua sắm theo hoạt chất ──► Xem chi tiết sản phẩm ──► Thêm giỏ hàng (Cookie Cart)
       └─► Hành trình 4: Giới thiệu Bác sĩ Huệ (/bac-si-hue) ──► Đọc bằng cấp/lịch sử ──► Bấm "Đặt lịch hẹn" (/dat-lich)
```

## 4. Ngăn Xếp Công Nghệ (Tech Stack Specs)
- **Theme Core:** Sapo Web Platform Theme Engine (`.bwt` Liquid templates, snippets, layouts).
- **Styling Architecture:** SCSS biên dịch thông qua Dart Sass (`style.scss.bwt`, `main.scss.bwt`, `index.scss.bwt`).
- **Local Dev & Preview Server:** `dev-server.js` (LiquidJS 10.17+, WebSocket live-reload, custom shim `preprocessBwt`, Express-like dynamic routing).
- **Mock State Engine:** `preview-mock.js` (cung cấp fallback mượt mà cho 1,023 settings keys của Sapo, cookie-based cart `dr_cart_items`).
- **Serverless Edge Adapter:** `api/index.js` và `vercel.json` phục vụ bản preview trên Vercel (`drrejju.vercel.app`).
- **Quality Standards:** 16 Hợp đồng Kỹ nghệ Chất lượng, 50 điểm Checklist UI/UX, WCAG 2.1 AA, Spacing 8pt/4pt Grid.
