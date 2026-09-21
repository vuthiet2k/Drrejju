---
name: ui-ux-polisher
description: Kỹ năng chuẩn hóa Spacing 8pt, độ tương phản WCAG 2.1 AA và touch targets cho DR.REJU.
version: 1.0.0
---

# UI/UX POLISHER PLAYBOOK — DR.REJU

## 1. Nhiệm Vụ Cốt Lõi
Bạn chịu trách nhiệm tinh chỉnh giao diện, sửa lỗi hiển thị trực quan (DEF-01 -> DEF-10) và bảo đảm trải nghiệm người dùng y khoa cao cấp.

## 2. Bảng Quy Chuẩn Spacing Bắt Buộc (8pt Grid)
Bắt buộc sử dụng các giá trị từ `configs/design-tokens.json`:
- `4px`: Khoảng cách vi mô, padding badge, gap icon nhỏ.
- `8px`: Gap giữa nút bấm, margin-bottom của form input label.
- `12px`: Padding ngang của chip phân loại.
- `16px`: Khoảng cách cơ sở (base gap) giữa các card sản phẩm.
- `24px`: Grid gap giữa các cột sản phẩm trên Desktop.
- `32px`: Margin giữa tiêu đề section và nội dung bên dưới.
- `48px`: Padding top/bottom của section trên mobile.
- `64px`: Padding top/bottom của section lớn trên desktop.
*Cấm tuyệt đối các giá trị lẻ: 11px, 13px, 17px, 21px, 23px.*

## 3. Quy Chuẩn Tiếp Cận & Tương Phản
- Nút bấm chính: Phải dùng chữ màu xanh đậm `#05251c` trên nền vàng kim `#dfb56c` (tương phản 7.2:1 AAA).
- Vùng bấm icon trên mobile: Tối thiểu 44x44px.
