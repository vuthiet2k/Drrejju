// Gộp 9 tour di tích của xã Thành Công thành 1 hành trình VR360 tự động
// (mỗi di tích 1 cảnh đại diện) dùng chung 1 file audio thuyết minh cho cả xã.
// Dùng bởi trang AutoTourThanhCong.vue và mục Video ở LandingThanhCong.vue.
import danHaDenTour from "../@data/vr360-tour-dan-ha-den.json";
import danHaDinhTour from "../@data/vr360-tour-dan-ha-dinh.json";
import nguyenTanTour from "../@data/vr360-tour-nguyen-tan.json";
import linhPhucTour from "../@data/vr360-tour-linh-phuc.json";
import haDatTour from "../@data/vr360-tour-ha-dat.json";
import dinhBiaTour from "../@data/vr360-tour-dinh-bia.json";
import vanKimTour from "../@data/vr360-tour-van-kim.json";
import xuanDuongTour from "../@data/vr360-tour-xuan-duong.json";
import anMienTour from "../@data/vr360-tour-an-mien.json";
import xaThanhCongTour from "../@data/xa_thanh_cong.json";

// Audio thuyết minh cho cả tour — lấy từ tour tổng quan xã (xa_thanh_cong.json),
// thay cho file mp3 bundle cục bộ trước đây.
const audioThuyetMinh = xaThanhCongTour?.data?.audio?.file || xaThanhCongTour?.background_audio || "";

// Thứ tự tham quan tự động qua 9 điểm di tích.
const TOURS = [
  { id: "dan-ha-den", json: danHaDenTour },
  { id: "dan-ha-dinh", json: danHaDinhTour },
  { id: "nguyen-tan", json: nguyenTanTour },
  { id: "linh-phuc", json: linhPhucTour },
  { id: "ha-dat", json: haDatTour },
  { id: "dinh-bia", json: dinhBiaTour },
  { id: "van-kim", json: vanKimTour },
  { id: "xuan-duong", json: xuanDuongTour },
  { id: "an-mien", json: anMienTour },
];

// Mỗi di tích lấy 1 cảnh đại diện (cảnh đầu) + giới thiệu cấp tour làm 1 điểm dừng.
// Các file tour export từ VR360 Builder bọc scenes/title trong `data` (xem
// vr360-tour-*.json: { data: { title, scenes: [...] }, ... }) — phải mở
// lớp `data` ra trước, nếu không s luôn rơi về {} và ảnh/tên đều undefined.
function toStop({ id, json }) {
  const d = json.data || json;
  const s = d.scenes?.[0] || {};
  const intro = d.thong_tin_gioi_thieu || null;
  return {
    id,
    name: intro?.tieu_de_hop_thong_tin || d.title || s.name || id,
    group: "Di tích Xã Thành Công",
    image: s.image,
    thumb: s.thumb,
    info: "",
    thong_tin_gioi_thieu: intro,
    initialView: s.initialView || { lon: 0, lat: 0, fov: 82 },
    hotspots: [],
  };
}

export const audioThuyetMinhUrl = audioThuyetMinh;

export function buildXaThanhCongAutoTour() {
  return {
    cau_hinh_he_thong: {
      ten_nen_tang: "VR360 Virtual Tour",
      phien_ban_cau_hinh: "2.0",
      ngon_ngu: "vi",
    },
    title: "VR360 Tự động — Xã Thành Công",
    thong_tin_gioi_thieu: {
      tieu_de_hop_thong_tin: "Xã Thành Công",
      noi_dung_van_ban:
        "Hành trình tham quan ảo tự động qua 9 di tích lịch sử tiêu biểu của xã Thành Công, có thuyết minh dẫn dắt xuyên suốt.",
      anh_dai_dien_2d: danHaDenTour.data?.scenes?.[0]?.thumb || "",
    },
    // 1 audio thuyết minh duy nhất cho cả tour (không phải mỗi cảnh một file).
    am_thanh_thuyet_minh: {
      duong_dan_file_audio: audioThuyetMinh,
      tu_dong_phat: true,
      thoi_luong_giay: 0,
    },
    scenes: TOURS.map(toStop),
  };
}
