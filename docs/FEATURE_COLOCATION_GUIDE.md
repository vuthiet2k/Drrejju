# FEATURE COLOCATION & BOUNDARY ISOLATION GUIDE

## 1. Nguyên Tắc Cốt Lõi
Trong kiến trúc theme Sapo truyền thống, các file bị phân tán ở `templates/`, `snippets/`, `assets/`, và `configs/`. Điều này khiến AI Agent dễ sửa lan sang các file không liên quan hoặc ghi đè code dùng chung.
Hệ thống DR.REJU áp dụng **Gói Tính Năng Ảo (Colocated Feature Packages)** định nghĩa tại `configs/feature-packages.json`.

## 2. Quy Định Phân Quyền Cho AI Agent
- Khi giao tác vụ cho Agent, Tech Lead hoặc Orchestrator script **BẮT BUỘC** chỉ cung cấp danh sách file trong trường `allowedEditFiles` của gói tính năng tương ứng.
- **Quy tắc bất biến:**
  1. Agent **CẤM** chỉnh sửa bất kỳ file nào nằm ngoài `allowedEditFiles`.
  2. Các file dùng chung như `layouts/theme.bwt` hay `configs/settings_data.json` chỉ được chỉnh sửa thông qua các PR cấu hình đặc biệt có sự phê duyệt trực tiếp của Tech Lead.
  3. Nếu tính năng cần tương tác giữa 2 gói, phải khai báo cờ `composite` và liệt kê rõ ràng trong PR description.
