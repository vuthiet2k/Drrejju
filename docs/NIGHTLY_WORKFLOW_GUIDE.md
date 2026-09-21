# AUTONOMOUS NIGHTLY BATCH WORKFLOW GUIDE — DR.REJU

Hướng dẫn vận hành quy trình phát triển ca đêm tự chủ cho Tech Lead và đội ngũ AI Agent.

## 1. Lịch Trình Ca Làm Việc (The 3-Phase Cadence)

```text
22:00 PM ──────────────► 00:00 - 06:00 AM ──────────────► 08:00 AM
[Dispatch Phase]         [Autonomous Execution Phase]     [Morning Review & Ship]
Tech Lead giao việc      AI Workers lập trình             Tech Lead duyệt hàng loạt
theo lô 10-20 tasks      Benny tự kiểm chứng Playwright   15-30 phút mỗi sáng
gắn nhãn agent-ready     CI Gatekeeper kiểm tra rào cứng  Merge 10-20 PRs sạch sẽ
```

## 2. Hướng Dẫn Chi Tiết Từng Giai Đoạn
- **Giai đoạn 1 (22:00 PM):** Tech Lead nạp danh sách 10 - 20 Issues cần xử lý. Mỗi Issue ghi rõ: mã tính năng, file package trong `configs/feature-packages.json` và Playbook tương ứng.
- **Giai đoạn 2 (00:00 - 06:00 AM):** Các AI Agents tự động checkout nhánh độc lập `agent/<task-id>-<slug>`, thực hiện sửa đổi, tự kích hoạt Playwright verification, tự chấm điểm Rubric. Nếu đạt >= 95 điểm, Agent tự động mở PR kèm bằng chứng.
- **Giai đoạn 3 (08:00 AM):** Tech Lead mở danh sách PRs, dùng `docs/MORNING_REVIEW_CHECKLIST.md` kiểm tra nhanh 3 điểm và merge. Vận tốc bàn giao đạt hàng chục PRs mỗi ngày mà không bị kiệt quệ nhận thức.
