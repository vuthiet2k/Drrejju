# **BÁO CÁO KIỂM THỬ GIAO DIỆN UI/UX & DANH SÁCH LỖI CẦN FIX — DR.REJU**

**Mục tiêu:** Khảo sát thực tế website [https://www.drreju.vn/](https://www.drreju.vn/), đối chiếu với bộ tiêu chuẩn kỹ nghệ chất lượng **/test-browser** (16 Hợp đồng Chất lượng & Bảng Checklist 50 Điểm) và lập kế hoạch sửa lỗi giao diện, tối ưu hóa trải nghiệm người dùng (UI/UX) và chuẩn hóa hệ thống Spacing (8pt/4pt Grid System) cho dự án [vuthiet2k/Drrejju](https://github.com/vuthiet2k/Drrejju).

**Môi trường kiểm thử:** Desktop (1440x900px, DPR 1x) & Mobile Viewport (390x844px, DPR 3x \- iPhone 14/15 Pro).

**Ngày lập báo cáo:** 15/09/2026

## ---

**I. TỔNG QUAN ĐÁNH GIÁ (EXECUTIVE SUMMARY)**

Giao diện website **Dr.REJU** sở hữu ngôn ngữ thiết kế y khoa chuẩn mực, định vị thương hiệu rõ ràng (*"Da liễu dựa trên bằng chứng · Phác đồ"*) với tông màu xanh lục đậm (\#05251c) kết hợp vàng kim (\#dfb56c). Tuy nhiên, qua quá trình kiểm thử chuyên sâu trên môi trường thực tế, hệ thống xuất hiện một số **lỗi nghiêm trọng (Critical & High Defects)** ảnh hưởng trực tiếp đến uy tín thương hiệu và tỷ lệ chuyển đổi, bao gồm:

> 1. **Lộ mã hướng dẫn Admin ra trang khách hàng:** Khối Flash Sale và Sản phẩm khuyên dùng hiển thị nguyên văn đoạn text hướng dẫn cấu hình theme setting của Sapo.  
> 2. **Lỗi đè chữ Mega Menu (Hover Overlap Bug):** Khi rê chuột giữa các mục menu chính, menu cũ không đóng hoặc thiếu màu nền khiến 2 lớp chữ chồng lên nhau không thể đọc được.  
> 3. **Lỗi cắt hình ảnh Bác sĩ (Image Crop Bug):** Ảnh đại diện Bác sĩ Nguyễn Huệ tại Hero Section bị cắt cụt phần trán/đầu do lỗi tràn khung.  
> 4. **Xung đột Floating Action Button & Google reCAPTCHA:** Huy hiệu reCAPTCHA v3 ở góc phải đè hoàn toàn lên nút bấm "Liên hệ" (Zalo/Hotline).  
> 5. **Vi phạm chuẩn tương phản màu sắc WCAG 2.1 AA:** Nút "GỬI YÊU CẦU TƯ VẤN" dùng chữ trắng trên nền vàng nhạt, viền các ô input quá nhạt không đạt độ tương phản tối thiểu 3:1.  
> 6. **Phá vỡ hệ thống nhịp điệu khoảng cách (Spacing 8pt Grid):** Tồn tại nhiều khoảng cách tùy tiện (11px, 13px, 17px, 21px, 23px) và vùng bấm icon nhỏ hơn chuẩn tiếp cận 44x44px.

## ---

**II. BẢNG PHÂN LOẠI MỨC ĐỘ ƯU TIÊN SỬA LỖI (SEVERITY MATRIX)**

| Mã Lỗi | Mức Độ (Severity) | Vị Trí Thành Phần | Tóm Tắt Khuyết Tật (Defect Summary) | Mức Ưu Tiên (Priority)&nbsp;&nbsp; |
| :---- | :---- | :---- | :---- | :---- |
| **DEF-01** | **CRITICAL (S0)** | Trang chủ — Section Flash Sale & Sản phẩm | Lộ đoạn text hướng dẫn quản trị Admin (setting sec\_flash\_sale\_col) ra giao diện khách hàng. | P1 — Khẩn cấp |
| **DEF-02** | **CRITICAL (S0)** | Header — Mega Menu Dropdown | Hover chuyển đổi giữa các menu con bị đè chữ 2 lớp (Double Text Overlay) do thiếu nền đặc và transition. | P1 — Khẩn cấp |
| **DEF-03** | **HIGH (S1)** | Hero Section Trang chủ | Ảnh Bác sĩ Nguyễn Huệ bị cắt cụt phần trán và đỉnh đầu bởi mép trên của khung chứa. | P1 — Khẩn cấp |
| **DEF-04** | **HIGH (S1)** | Góc dưới bên phải màn hình | Huy hiệu Google reCAPTCHA đè trực tiếp lên nút bấm Floating Action "Liên hệ" (Zalo/Hotline). | P2 — Cao |
| **DEF-05** | **HIGH (S1)** | Form Tư Vấn Trang chủ | Nút Submit dùng chữ trắng trên nền vàng nhạt (\#dfb56c), vi phạm tương phản WCAG 2.1 AA (\< 4.5:1). | P2 — Cao |
| **DEF-06** | **MEDIUM (S2)** | Chân trang (Footer) | Lặp lại tiêu đề cột "CHÍNH SÁCH" 2 lần; Icon Email xuất hiện nhưng thiếu địa chỉ email đi kèm. | P2 — Cao |
| **DEF-07** | **MEDIUM (S2)** | Danh mục Sản phẩm Trang chủ | Sai lệch phân loại nội dung: Tiêu đề ghi "THỰC PHẨM BỔ TRỢ" nhưng các card bên dưới là Dịch vụ thẩm mỹ. | P3 — Trung bình |
| **DEF-08** | **MEDIUM (S2)** | Section 8 Chips Vấn Đề Da | 8 chip bị ép cứng trên 1 hàng 8 cột ngang, card quá hẹp, text bị dồn đáy và thiếu hiệu ứng hover feedback. | P3 — Trung bình |
| **DEF-09** | **LOW (S3)** | Header, Topbar & Cards | Khoảng cách giữa các icon Search/User/Cart chỉ \~12px (\< chuẩn 44px); tồn tại nhiều khoảng spacing lẻ. | P3 — Trung bình |
| **DEF-10** | **LOW (S3)** | Toàn trang & Performance | Thẻ hình ảnh \<img\> thiếu thuộc tính width/height cố định, gây hiện tượng Layout Shift (CLS \> 0.1). | P4 — Thấp |

## ---

**III. CHI TIẾT CÁC MỤC LỖI & HƯỚNG DẪN FIX CODE CỤ THỂ**

### **1\. Sửa lỗi lộ mã Admin Placeholder (Mã DEF-01 & DEF-07)**

> * **Vấn đề thực tế:** Tại khối Flash Sale trang chủ xuất hiện dòng chữ: *"Chưa có sản phẩm cho Flash Sale — chọn danh mục ở phần Tùy chỉnh \-\> Trang chủ \- Flash Sale \-\> Danh mục sản phẩm (setting sec\_flash\_sale\_col)."* Tương tự, khối sản phẩm xuất hiện lỗi dr\_products\_col.  
> * **Nguyên nhân:** Đoạn mã Liquid hiển thị placeholder hỗ trợ người quản trị khi theme chưa được chọn collection trong Admin, nhưng không có điều kiện ẩn đi trên môi trường live khách hàng.  
> * **Giải pháp kỹ thuật (Defensive Liquid):** Bọc điều kiện kiểm tra tồn tại của collection trước khi xuất HTML:  
>   `{% comment %} Sửa trong file snippet/section tương ứng {% endcomment %}`  
>   `{% assign flash_col = collections[settings.sec_flash_sale_col] %}`  
>   `{% if flash_col != blank and flash_col.products_count > 0 %}`  
>   &nbsp;&nbsp;`<div class="section-flash-sale">`  
>   &nbsp;&nbsp;&nbsp;&nbsp;`<div class="container">`  
>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`{% comment %} Render tiêu đề và đồng hồ đếm ngược {% endcomment %}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`{% for product in flash_col.products limit: 8 %}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`{% include 'product-card', product: product %}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`{% endfor %}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;`</div>`  
>   &nbsp;&nbsp;`</div>`  
>   `{% else %}`  
>   &nbsp;&nbsp;`{% comment %} Nếu chưa chọn collection hoặc collection rỗng, ẩn hoàn toàn section, KHÔNG hiển thị text thông báo admin {% endcomment %}`  
>   `{% endif %}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;

### **2\. Sửa lỗi đè chữ hai lớp trên Mega Menu Dropdown (Mã DEF-02)**

> * **Vấn đề thực tế:** Khi rê chuột từ menu *"CÁC VẤN ĐỀ DA"* sang *"SẢN PHẨM"*, văn bản của hai menu con bị đè trực tiếp lên nhau, tạo thành một khối chữ lộn xộn không thể đọc được. Ngoài ra mục *"Da không đều màu \-Nám \- Tàn nhang"* bị dính chữ thiếu dấu cách trước \-Nám.  
> * **Nguyên nhân:** Container của mega menu con thiếu thuộc tính background-color: \#ffffff hoặc sử dụng nền bán trong suốt, đồng thời thiếu thuộc tính visibility và pointer-events để đóng hẳn menu trước đó khi hover sang menu khác.  
> * **Giải pháp kỹ thuật (CSS Fix):**  
>   `/* Cập nhật trong assets/style.scss.bwt */`  
>   `.site-nav__dropdown,`  
>   `.mega-menu-content {`  
>   &nbsp;&nbsp;`background-color: #ffffff !important;`  
>   &nbsp;&nbsp;`box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);`  
>   &nbsp;&nbsp;`border: 1px solid #e5e7eb;`  
>   &nbsp;&nbsp;`border-top: none;`  
>   &nbsp;&nbsp;`opacity: 0;`  
>   &nbsp;&nbsp;`visibility: hidden;`  
>   &nbsp;&nbsp;`pointer-events: none;`  
>   &nbsp;&nbsp;`transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s;`  
>   &nbsp;&nbsp;`z-index: 999;`  
>   `}`

>   `.site-nav__item:hover > .site-nav__dropdown,`  
>   `.site-nav__item:hover > .mega-menu-content {`  
>   &nbsp;&nbsp;`opacity: 1;`  
>   &nbsp;&nbsp;`visibility: visible;`  
>   &nbsp;&nbsp;`pointer-events: auto;`  
>   `}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;

### **3\. Sửa lỗi cắt hình ảnh Bác sĩ Nguyễn Huệ tại Hero Section (Mã DEF-03)**

> * **Vấn đề thực tế:** Phần trán và chỏm tóc của Bác sĩ Huệ bị cắt phăng bởi cạnh trên của section.  
> * **Nguyên nhân:** Container ảnh sử dụng overflow: hidden với chiều cao cố định (fixed height) nhỏ hơn chiều cao thực của ảnh, hoặc do thuộc tính object-position: center đẩy ảnh lên quá cao.  
> * **Giải pháp kỹ thuật (CSS Fix):**  
>   `.hero-banner__image-wrapper {`  
>   &nbsp;&nbsp;`overflow: visible !important; /* Tránh cắt đầu ảnh */`  
>   &nbsp;&nbsp;`display: flex;`  
>   &nbsp;&nbsp;`align-items: flex-end; /* Chân ảnh bám sát đáy section */`  
>   &nbsp;&nbsp;`justify-content: center;`  
>   `}`

>   `.hero-banner__image-wrapper img {`  
>   &nbsp;&nbsp;`max-height: 100%;`  
>   &nbsp;&nbsp;`width: auto;`  
>   &nbsp;&nbsp;`object-fit: contain;`  
>   &nbsp;&nbsp;`object-position: bottom center;`  
>   `}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;

### **4\. Sửa lỗi xung đột Google reCAPTCHA & Floating Action Button (Mã DEF-04)**

> * **Vấn đề thực tế:** Huy hiệu Google reCAPTCHA v3 cố định ở góc dưới cùng bên phải màn hình đè trực tiếp lên nút bấm nổi "Liên hệ" (Zalo/Hotline), khiến người dùng bấm trúng reCAPTCHA thay vì nút liên hệ.  
> * **Nguyên nhân:** Cả hai thành phần đều được định vị position: fixed; bottom: 20px; right: 20px; mà không có sự bù trừ tọa độ z-index và offset.  
> * **Giải pháp kỹ thuật (CSS Fix):** Nâng nút Floating Contact lên trên vị trí của reCAPTCHA:  
>   `/* Đẩy cụm nút Floating Actions lên cao hơn huy hiệu reCAPTCHA */`  
>   `.floating-action-group,`  
>   `.btn-contact-floating {`  
>   &nbsp;&nbsp;`bottom: 85px !important; /* Cao hơn 60px chiều cao của reCAPTCHA badge */`  
>   &nbsp;&nbsp;`right: 20px !important;`  
>   &nbsp;&nbsp;`z-index: 9990 !important;`  
>   `}`

>   `/* Đảm bảo reCAPTCHA nằm gọn bên dưới */`  
>   `.grecaptcha-badge {`  
>   &nbsp;&nbsp;`bottom: 16px !important;`  
>   &nbsp;&nbsp;`right: 16px !important;`  
>   &nbsp;&nbsp;`z-index: 9980 !important;`  
>   `}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;

### **5\. Sửa lỗi tương phản màu sắc Form Tư Vấn & Nút Submit (Mã DEF-05)**

> * **Vấn đề thực tế:** Nút "GỬI YÊU CẦU TƯ VẤN" dùng chữ màu trắng (\#ffffff) trên nền vàng kim loại sáng (\#dfb56c). Tỉ lệ tương phản thực tế chỉ đạt \~1.8:1, vi phạm nghiêm trọng tiêu chuẩn tiếp cận WCAG 2.1 AA (yêu cầu tối thiểu 4.5:1). Người dùng lớn tuổi hoặc trong môi trường nắng chói sẽ không đọc được chữ trên nút.  
> * **Giải pháp kỹ thuật:** Đổi màu chữ của nút thành màu đen/xanh đen thương hiệu (\#05251c), hoặc dùng nền vàng sậm hơn (\#b48628):  
>   `/* Cách 1: Giữ nền vàng kim, dùng chữ màu xanh thương hiệu đậm (Tương phản đạt 7.2:1 - Chuẩn AAA) */`  
>   `.btn-consultation-submit {`  
>   &nbsp;&nbsp;`background-color: #dfb56c !important;`  
>   &nbsp;&nbsp;`color: #05251c !important;`  
>   &nbsp;&nbsp;`font-weight: 700 !important;`  
>   &nbsp;&nbsp;`letter-spacing: 0.5px;`  
>   &nbsp;&nbsp;`border: none;`  
>   &nbsp;&nbsp;`padding: 14px 28px;`  
>   &nbsp;&nbsp;`border-radius: 6px;`  
>   &nbsp;&nbsp;`transition: all 0.2s ease;`  
>   `}`

>   `.btn-consultation-submit:hover {`  
>   &nbsp;&nbsp;`background-color: #cda255 !important;`  
>   &nbsp;&nbsp;`transform: translateY(-1px);`  
>   &nbsp;&nbsp;`box-shadow: 0 4px 12px rgba(223, 181, 108, 0.4);`  
>   `}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;

### **6\. Sửa lỗi Chân trang (Footer) lặp tiêu đề & thiếu email (Mã DEF-06)**

> * **Vấn đề thực tế:** Cột 2 có tiêu đề "CHÍNH SÁCH", Cột 4 cũng có tiêu đề "CHÍNH SÁCH". Icon Email có hiển thị nhưng không có địa chỉ email nào bên cạnh.  
> * **Giải pháp khắc phục:**  
  * Đổi tiêu đề Cột 2 thành **"DANH MỤC"** hoặc **"ĐIỀU HƯỚNG NHANH"**.  
  * Cột 4 giữ nguyên là **"CHÍNH SÁCH & QUY ĐỊNH"**.  
  * Bổ sung địa chỉ email chính thức bên cạnh icon Email: contact@drreju.vn (kèm liên kết href="mailto:contact@drreju.vn").

## ---

**IV. QUY CHUẨN SPACING & NHỊP ĐIỆU THỊ GIÁC (8PT / 4PT HARMONIC SCALE)**

### **1\. Bảng chuẩn hóa kích thước Spacing cho toàn bộ theme Drrejju**

| Token Name | Giá Trị (px) | Mục Đích Áp Dụng | Đối Chiếu Hiện Trạng Cần Sửa&nbsp;&nbsp; |
| :---- | :---- | :---- | :---- |
| space-1 | 4px | Khoảng cách vi mô: Padding icon badge, gap giữa icon và label nhỏ. | Thay thế các khoảng cách 3px, 5px tùy tiện. |
| space-2 | 8px | Khoảng cách nhỏ: Gap giữa các nút trong button group, margin dưới của label input. | Sửa margin-bottom của form input label đang bị lệch từ 5px-9px về chuẩn 8px. |
| space-3 | 12px | Khoảng cách trung bình nhỏ: Padding trong của input field, padding chip nhỏ. | Sửa padding ngang của 8 chips (hiện đang là 6px quá chật). |
| space-4 | 16px | Khoảng cách cơ sở (Base): Gap giữa các card sản phẩm trên mobile, padding trong của card. | Thay thế các khoảng cách 13px, 17px xuất hiện ngẫu nhiên. |
| space-6 | 24px | Khoảng cách tiêu chuẩn: Gap giữa các cột sản phẩm trên desktop (grid-gap), padding container. | Áp dụng chuẩn hóa cho lưới sản phẩm 4 cột. |
| space-8 | 32px | Khoảng cách phân đoạn: Margin giữa tiêu đề section và nội dung bên dưới. | Chuẩn hóa khoảng cách từ heading section "Bạn đang gặp vấn đề gì?" đến 8 chips. |
| space-12 | 48px | Khoảng cách section mobile: Padding top/bottom của các section trên di động. | Thay thế các khoảng cách 35px, 42px trên mobile. |
| space-16 | 64px | Khoảng cách section desktop: Padding top/bottom của các section lớn trên desktop. | Đảm bảo trang web có khoảng thở nhịp nhàng, thông thoáng theo chuẩn y khoa. |

### **2\. Chuẩn hóa Vùng bấm (Touch Target) & Icon Spacing**

> * **Vấn đề:** Cụm icon Search, User, Cart trên Header có khoảng cách giữa các icon chỉ \~12px. Chiều rộng vùng bấm thực tế chỉ \~28px, vi phạm tiêu chuẩn tiếp cận WCAG 2.2 SC 2.5.8 (Target Size tối thiểu 24x24px, khuyến nghị y khoa 44x44px).  
> * **Giải pháp kỹ thuật:**  
>   `.header-actions__item {`  
>   &nbsp;&nbsp;`display: inline-flex;`  
>   &nbsp;&nbsp;`align-items: center;`  
>   &nbsp;&nbsp;`justify-content: center;`  
>   &nbsp;&nbsp;`min-width: 44px;`  
>   &nbsp;&nbsp;`min-height: 44px;`  
>   &nbsp;&nbsp;`padding: 8px;`  
>   &nbsp;&nbsp;`margin-left: 8px;`  
>   &nbsp;&nbsp;`border-radius: 50%;`  
>   &nbsp;&nbsp;`transition: background-color 0.2s ease;`  
>   `}`

>   `.header-actions__item:hover {`  
>   &nbsp;&nbsp;`background-color: rgba(5, 37, 28, 0.06);`  
>   `}`  
>   &nbsp;&nbsp;&nbsp;&nbsp;

### **3\. Cải tiến UX Section 8 Chips ("Bạn đang gặp vấn đề gì?")**

> * **Vấn đề:** Trên desktop 1440px, 8 chips bị ép cứng thành 1 hàng 8 cột ngang khiến mỗi thẻ bị bóp hẹp chiều ngang nhưng lại kéo dài chiều dọc, chữ bị dồn sát đáy card.  
> * **Đề xuất giải pháp UI/UX:**  
  * Chuyển layout trên Desktop thành **Lưới 4 cột x 2 hàng (Grid 4x2)** với tỷ lệ cân đối hình chữ nhật nằm ngang (aspect-ratio \~ 16:9 hoặc padding 16px 20px).  
  * Bổ sung hiệu ứng tương tác:  
    `.skin-issue-card {`  
    &nbsp;&nbsp;`display: flex;`  
    &nbsp;&nbsp;`flex-direction: column;`  
    &nbsp;&nbsp;`align-items: center;`  
    &nbsp;&nbsp;`justify-content: center;`  
    &nbsp;&nbsp;`padding: 20px 16px;`  
    &nbsp;&nbsp;`background: #ffffff;`  
    &nbsp;&nbsp;`border: 1px solid #e5e7eb;`  
    &nbsp;&nbsp;`border-radius: 12px;`  
    &nbsp;&nbsp;`transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;`  
    &nbsp;&nbsp;`cursor: pointer;`  
    `}`

    `.skin-issue-card:hover {`  
    &nbsp;&nbsp;`transform: translateY(-4px);`  
    &nbsp;&nbsp;`border-color: #dfb56c;`  
    &nbsp;&nbsp;`box-shadow: 0 12px 20px -5px rgba(5, 37, 28, 0.08);`  
    `}`  
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

## ---

**V. CHECKLIST KIỂM THỬ XÁC NHẬN FIX LỖI (VERIFICATION CHECKLIST)**

Sau khi lập trình viên cập nhật mã nguồn trong repository [vuthiet2k/Drrejju](https://github.com/vuthiet2k/Drrejju), QA Operator sẽ chạy lại quy trình kiểm thử theo bảng sau:

| Mục Kiểm Tra | Tiêu Chuẩn Đạt (Pass Criteria) | Trạng Thái&nbsp;&nbsp; |
| :---- | :---- | :---- |
| Flash Sale & Sản phẩm (DEF-01) | Hoàn toàn không xuất hiện chữ sec\_flash\_sale\_col hay text hướng dẫn admin. | Chờ Fix |
| Mega Menu Hover (DEF-02) | Hover mượt mà giữa các menu, nền trắng đặc 100%, không bị đè chữ hai lớp. | Chờ Fix |
| Ảnh Bác sĩ Huệ (DEF-03) | Ảnh hiển thị đầy đủ khuôn mặt, trán và đỉnh đầu không bị cắt cụt. | Chờ Fix |
| Nút Liên hệ & reCAPTCHA (DEF-04) | Nút Floating cách đáy 85px, không bị huy hiệu reCAPTCHA che khuất; click mở chat Zalo chuẩn. | Chờ Fix |
| Màu sắc Nút Submit (DEF-05) | Độ tương phản chữ/nền nút bấm đạt ≥ 4.5:1 (chuẩn WCAG AA). | Chờ Fix |
| Tiêu đề Cột Footer (DEF-06) | Cột 2 là "DANH MỤC" hoặc "ĐIỀU HƯỚNG", Cột 4 là "CHÍNH SÁCH"; có địa chỉ email đi kèm icon. | Chờ Fix |
| Phân loại danh mục (DEF-07) | Section "Thực phẩm bổ trợ" hiển thị đúng viên uống/collagen, không hiển thị dịch vụ sẹo/laser. | Chờ Fix |
| Lưới 8 Chips (DEF-08) | Bố cục 4x2 cân đối, có hiệu ứng hover nhấc thẻ 4px, không tràn ngang màn hình. | Chờ Fix |
| Hệ thống Spacing 8pt (DEF-09) | 100% margin, padding, gap tuân thủ bội số 4px/8px; vùng bấm icon ≥ 44x44px. | Chờ Fix |
| DevTools Console & CLS (DEF-10) | Console đạt chuẩn 0 Uncaught Errors; thẻ ảnh có width/height chống giật khung. | Chờ Fix |

&nbsp;