# DR.REJU — Quyết định hướng thiết kế: Trang Hồ sơ da

## Cơ sở vào Phase 6
- Người dùng đã yêu cầu trực tiếp: “$huashu-design chạy prompt trên”.
- Vòng định hướng Quiz trước đó đã có ba prototype thực tế tại `design-demos/quiz-A-troly.html`, `quiz-B-scanner.html`, `quiz-C-network.html` và được ghi lại ở `design-demos/direction-approved.md`.
- Đây là lần triển khai production-ready của cùng luồng Quiz, không phải một thiết kế mới cần mở lại ba phương án.

## Hướng được triển khai
“Clinical intake” — lấy sự gần gũi của hướng Trợ lý hội thoại và cấu trúc Hồ sơ da, nhưng chuyển thành một trang chức năng đầy đủ trên Sapo: giới thiệu, lợi ích, quy trình, khảo sát theo bước, kết quả định hướng, nội dung liên quan và CTA cuối trang.

## Assumptions
- URL cuối cùng của trang do Sapo gán; template sử dụng `page.quiz.bwt`.
- Không có setting riêng cho Quiz trong schema hiện tại, nên không sửa schema/data; copy, CTA và liên kết dựa trên object/theme có sẵn và fallback trung tính.
- CTA đặt lịch dùng URL `/dat-lich`; Zalo dùng `settings.livechat_mes` khi có và fallback an toàn là `/lien-he` khi chưa cấu hình.

## Form quyết định
- Vai trò: một trang intake trước tư vấn, tạo tin cậy trước khi yêu cầu người dùng trả lời.
- Khoảng cách: desktop/laptop và mobile, ưu tiên text dễ đọc, button lớn, thao tác một tay.
- Nhiệt độ: bình tĩnh, lâm sàng, ấm áp; không “tech scanner”.
- Mẫu thị giác: hành trình hồ sơ từ “chia sẻ” → “đọc định hướng” → “trao đổi với bác sĩ”, diễn đạt bằng dải tiến trình và các lớp thông tin có mục đích.

---

# DR.REJU — Quyết định hướng thiết kế: Trang Đặt lịch

## Cơ sở vào Phase 6
- Người dùng yêu cầu tiếp tục: “page đặt lịch nữa”.
- Vòng định hướng Đặt lịch đã có các prototype thực tế tại `design-demos/booking-A-simple.html`, `design-demos/booking-B-wizard.html`, `design-demos/booking-C-zalo.html` và được ghi ở `design-demos/direction-approved.md`.
- Đây là triển khai production-ready của cùng flow booking, không phải một section hoặc một thiết kế mới cần mở lại ba phương án.

## Hướng được triển khai
“Assisted appointment” — trang đặt lịch một bước với form Sapo thật ở trọng tâm, được bao quanh bởi thông tin chuẩn bị, các lựa chọn dịch vụ và lối liên hệ thay thế. Form giữ cơ chế `{% form 'contact' %}` hiện hữu để merchant tiếp tục nhận lead qua workflow quen thuộc.

## Assumptions
- Không có dữ liệu địa chỉ/giờ làm việc DR.REJU đáng tin cậy trong config hiện tại; không bịa địa chỉ, bản đồ hoặc cam kết thời gian phản hồi.
- Số điện thoại/Zalo đọc từ settings/store khi có. Nếu chưa cấu hình, CTA an toàn trỏ về `/lien-he`.
- Trường ngày dùng datepicker hiện có; trường giờ chỉ là khung thời gian mong muốn và sẽ được đội ngũ xác nhận lại.

## Form quyết định
- Vai trò: chuyển người dùng đã có nhu cầu thành một yêu cầu tư vấn rõ ràng với ít ma sát.
- Nhiệt độ: tin cậy, bình tĩnh, trực diện; form là tâm điểm, không dùng giả lập ứng dụng hay wizard làm tăng thao tác.
- Mẫu thị giác: “chuẩn bị → gửi yêu cầu → xác nhận lại”, diễn đạt bằng dải thông tin ở phần đầu và form hai cột dễ quét.
