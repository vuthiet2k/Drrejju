/**
 * data/services.js — Danh sách dịch vụ khám chữa bệnh & thẩm mỹ da liễu Dr.REJU từ Sapo Export
 * Đồng bộ với: DrREJU_Products_Services_Sapo_Export_Full.xlsx & Figma Node 41:12
 */

const services = [
  {
    id: 89270001,
    alias: 'mesotherapy-lam-sang-tre-hoa-vyng-da-mat',
    name: 'Mesotherapy làm sáng, trẻ hóa vùng da mắt',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Mesotherapy & Tiêm BAP Căng Bóng',
    sku: 'DV75',
    price: 3500000,
    compare_at_price: 4500000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2026/03/27/upload_peel-da_270326-022946.jpg',
    tags: ['Mesotherapy', 'Trẻ hóa mắt', 'Bs. Nguyễn Huệ trực tiếp thực hiện'],
    description: 'Mesotherapy làm sáng, trẻ hóa vùng da mắt là phác đồ can thiệp da liễu công nghệ cao được trực tiếp Thạc sĩ, Bác sĩ Nguyễn Huệ thực hiện.'
  },
  {
    id: 89270002,
    alias: 'peel-xu-lo-mun-an-cdng-bong-sang-da',
    name: 'Peel xử lí mụn ẩn, căng bóng, sáng da',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Chemical Peel & Tái Tạo Da',
    sku: 'DVG51',
    price: 1200000,
    compare_at_price: 1500000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2025/09/24/upload_triet-long-voi-diode-laser-10_240925-070149.png',
    tags: ['Chemical Peel', 'Trị mụn ẩn', 'Căng bóng da', 'Dr.REJU Clinical'],
    description: 'Peel xử lí mụn ẩn, căng bóng, sáng da với hoạt chất acid sinh học y khoa làm sạch sâu và tái sinh bề mặt biểu bì.'
  },
  {
    id: 89270003,
    alias: 'skinpen-tre-hoa-mo-seo-tai-tao-cau-trac-da',
    name: 'SKINPEN trẻ hóa, mờ sẹo, tái tạo cấu trúc da',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Laser & Điều Trị Sẹo Y Khoa',
    sku: 'DVG44',
    price: 2500000,
    compare_at_price: 3200000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2025/12/12/upload_dich-vu-hot-skinpen_121225-080644.jpg',
    tags: ['SkinPen', 'Điều trị sẹo', 'Tái tạo vi điểm', 'FDA Approved'],
    description: 'Thiết bị phi kim vi điểm SkinPen đạt chuẩn FDA Hoa Kỳ kích thích tăng sinh collagen và tái tạo mô sẹo lõm.'
  },
  {
    id: 89270004,
    alias: 'meso-phuc-hoi-tai-tao-sua-chua-dna',
    name: 'Meso phục hồi, tái tạo, sửa chữa DNA',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Mesotherapy & Tiêm BAP Căng Bóng',
    sku: 'DVG41',
    price: 3500000,
    compare_at_price: 4500000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2025/08/27/upload_thiet-ke-chua-co-ten-2_270825-100550.png',
    tags: ['Meso DNA', 'Phục hồi đa tầng', 'Sửa chữa màng tế bào'],
    description: 'Liệu trình tiêm vi điểm hoạt chất sinh học phục hồi cấu trúc DNA tế bào biểu bì.'
  },
  {
    id: 89270005,
    alias: 'hifu-ultra-booster-ngdn-ngua-chay-xi-koch-thoch-tdng-sinh-collagen-300shot',
    name: 'Hifu Ultra Booster ngăn ngừa chảy xệ, kích thích tăng sinh collagen (300 shot)',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Nâng Cơ & Trẻ Hóa Công Nghệ Cao',
    sku: 'DVG13',
    price: 6500000,
    compare_at_price: 8000000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2025/12/12/upload_dich-vu-hot-nang-co-hifu-rf_121225-080511.jpg',
    tags: ['HIFU Ultra', 'Nâng cơ', 'Trẻ hóa', 'Săn chắc da'],
    description: 'Công nghệ sóng siêu âm hội tụ vi điểm tác động lớp cân cơ nông SMAS nâng cơ thon gọn mặt.'
  },
  {
    id: 89270015,
    alias: 'bap-nang-cu-cdng-bong-da',
    name: 'BAP nâng cơ, căng bóng da',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Mesotherapy & Tiêm BAP Căng Bóng',
    sku: 'DV46',
    price: 8500000,
    compare_at_price: 10000000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2025/08/20/0_image_250820-0910412Bd.png',
    tags: ['BAP 5 điểm', 'Nâng cơ', 'Căng bóng da', 'Profhilo'],
    description: 'Kỹ thuật tiêm điểm thẩm mỹ sinh học BAP tái cấu trúc đa tầng, nâng cơ và trẻ hóa toàn diện.'
  },
  {
    id: 89270059,
    alias: 'bap-sdn-chac-cai-thiin-cau-trac-da-profhilo',
    name: 'BAP săn chắc, cải thiện cấu trúc da Profhilo',
    vendor: 'Dr.REJU Clinical',
    type: 'Dịch vụ Mesotherapy & Tiêm BAP Căng Bóng',
    sku: 'DVG37',
    price: 8500000,
    compare_at_price: 10000000,
    unit: 'Buổi / Liệu trình',
    image: 'https://drreju.ezs.vn/Upload/image/2025/08/27/upload_thiet-ke-chua-co-ten_270825-095429.png',
    tags: ['Profhilo', 'BAP', 'Trẻ hóa sinh học', 'Ý'],
    description: 'Dòng sản phẩm chứa Hyaluronic Acid tinh khiết nồng độ cao hàng đầu thế giới từ IBSA Ý.'
  }
];

const byServiceId = Object.fromEntries(services.map(s => [s.id, s]));
const byServiceAlias = Object.fromEntries(services.map(s => [s.alias, s]));

module.exports = { services, byServiceId, byServiceAlias };
