---
name: AI Defect Three Questions Triage
about: Báo cáo khuyết tật và chuyển hóa thành rào chắn cứng theo chuẩn Lauren Tan
title: "[TRIAGE]: "
labels: ["triage-ready", "agent-guard"]
---

### 1. Mô tả khuyết tật phát hiện bởi con người
- **Mã lỗi / Màn hình:**
- **Hành vi sai sót của AI:**
- **URL / Selector bị ảnh hưởng:**

---

### 2. Quy Trình Triệt Tiêu Lỗi 3 Câu Hỏi (Bắt buộc điền)

#### Câu hỏi 1: Mảnh ghép bối cảnh bị thiếu (Missing Context)
> AI đã thiếu thông tin gì trong `FEATURE_MAP.md`, `SYSTEM_OVERVIEW.md` hoặc `GLOSSARY.md` dẫn đến hành vi sai này?

#### Câu hỏi 2: Bài kiểm tra tự động cần bổ sung (Verification Test)
> Có thể viết kịch bản Playwright nào trong `tests/reproducers/` để phát hiện ngay lập tức lỗi này trước khi AI nộp bài?

#### Câu hỏi 3: Rào chắn cứng bất biến (Hard Guardrail)
> Có thể thêm quy tắc AST Linter nào vào `packages/eslint-plugin-drreju-guard` để từ chối vĩnh viễn mẫu mã này tại pre-commit?
