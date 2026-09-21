# MORNING REVIEW CHECKLIST — BẢNG KIỂM DUYỆT PR BUỔI SÁNG (15 PHÚT)

Dành cho Tech Lead / PM duyệt nhanh 10-20 PRs do AI Agent nộp sau ca đêm.

| Bước | Hạng mục kiểm tra | Tiêu chuẩn ĐẠT (Pass Criteria) | Hành động nếu FAIL |
| :--- | :--- | :--- | :--- |
| **1** | **Ranh giới tác động** | PR chỉ thay đổi các file nằm trong `allowedEditFiles` của feature package. | Từ chối PR (Reject) nếu sửa lan ra ngoài. |
| **2** | **Bằng chứng Benny Verifier** | Có báo cáo Playwright đính kèm, 100% checks PASS, 0 console errors. | Yêu cầu Agent chạy lại test. |
| **3** | **Rào chắn Comment Rác** | Tuyệt đối không có comment rác do AI viết trong git diff. | Kích hoạt linter từ chối tự động. |
| **4** | **Điểm số Output Rubric** | Điểm tự chấm của Agent đạt >= 95/100. | Block merge nếu dưới 95 điểm. |

*Nếu cả 4 tiêu chuẩn đều ĐẠT: Nhấn **Merge Pull Request** ngay lập tức.*
