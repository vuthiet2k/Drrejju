# OUTPUT RUBRICS CHECKLIST — THANG ĐIỂM NGHIỆM THU AI AGENT

Mọi Pull Request do AI Agent tạo ra phải tự kiểm chứng và chấm điểm theo bộ Rubrics sau. Ngưỡng chấp thuận tối thiểu: **>= 95/100 điểm**. Nếu dưới 95 điểm, Agent bắt buộc phải tự khắc phục lỗi và chấm lại trước khi nộp bài.

## 1. Rubric A — Sửa Đổi Theme Sapo Liquid (.bwt) [Thang điểm 100]
| Tiêu chí đánh giá | Trọng số | Yêu cầu đạt điểm tối đa | Cách kiểm tra tự động |
| :--- | :--- | :--- | :--- |
| **Tính tương thích Liquid** | 25đ | Không làm hỏng bộ tag/filter của Sapo, không đưa cú pháp Node.js lạ vào `.bwt`. | AST Liquid Parser |
| **Defensive Collection Check** | 25đ | Mọi vòng lặp collection đều có điều kiện kiểm tra `if col != blank and col.products_count > 0`. | AST Linter Rule |
| **Đồng bộ biến SSOT** | 25đ | Thông tin phòng khám, hotline, email đọc từ `settings.*` hoặc `store.*`, không hardcode. | Regex String Search |
| **Không Comment Rác** | 25đ | Mã nguồn hoàn toàn sạch bóng các câu chú thích giải thích của AI. | Linter `no-ai-comments` |

## 2. Rubric B — Tối Ưu Giao Diện UI/UX & SCSS [Thang điểm 100]
| Tiêu chí đánh giá | Trọng số | Yêu cầu đạt điểm tối đa | Cách kiểm tra tự động |
| :--- | :--- | :--- | :--- |
| **Tương phản WCAG 2.1 AA** | 30đ | Độ tương phản màu sắc văn bản / nền đạt tối thiểu 4.5:1 (hoặc 3:1 cho tiêu đề lớn). | Playwright Luminance |
| **Spacing 8pt/4pt Grid** | 25đ | Margin, padding, gap 100% tuân thủ bội số 4px/8px từ `design-tokens.json`. | SCSS AST Validator |
| **Vùng bấm Touch Target** | 25đ | Icon, nút bấm và form inputs đạt kích thước tối thiểu 44x44px trên mobile. | BoundingBox Checker |
| **Tính toàn vẹn Responsive** | 20đ | Giao diện không bị tràn ngang (`scrollWidth <= clientWidth`) trên Desktop và Mobile. | DOM Dimensions Check |

## 3. Rubric C — Kiểm Thử & Tự Động Hóa Benny [Thang điểm 100]
| Tiêu chí đánh giá | Trọng số | Yêu cầu đạt điểm tối đa | Cách kiểm tra tự động |
| :--- | :--- | :--- | :--- |
| **Xác nhận tái hiện lỗi** | 35đ | Reproducer kịch bản chứng minh được lỗi xuất hiện trên nhánh main trước khi sửa. | Benny Runner Phase 1 |
| **Xác nhận triệt tiêu lỗi** | 35đ | Reproducer kịch bản chuyển 100% sang PASS trên nhánh làm việc mới. | Benny Runner Phase 2 |
| **Console Trình duyệt sạch** | 30đ | Trang web chạy không phát sinh bất kỳ lỗi Uncaught TypeError hoặc SyntaxError nào. | Window.onerror capture |
