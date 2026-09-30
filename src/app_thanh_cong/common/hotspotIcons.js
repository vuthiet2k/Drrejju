// Shared icon/POI-classification set — used by both the VR360 Builder
// (src/app_vr360_builder) and the live viewer (VrTourViewer.vue) so a
// hotspot's icon renders identically in the editor and on the real site.
// Plain data (SVG inner markup, viewBox 0 0 24 24, stroke-based to match
// the rest of the app's Feather-style icon set) — no framework deps.

export const DEFAULT_NAV_ICON = "dot";

export const NAV_ICONS = {
  dot: {
    label: "Chấm tròn (mặc định)",
    svg: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
  },
  arrow: {
    label: "Mũi tên",
    svg: '<path d="M4 6l6 6-6 6"/><path d="M12 6l6 6-6 6"/>',
  },
  stairs: {
    label: "Cầu thang",
    svg: '<path d="M3 21h4v-4h4v-4h4v-4h4v-4h2"/>',
  },
  door: {
    label: "Lối vào / cửa",
    svg: '<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
  },
  flag: {
    label: "Điểm đến",
    svg: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  },
  info: {
    label: "Thông tin",
    svg: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  },
  gallery: {
    label: "Thư viện ảnh",
    svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  },
  video: {
    label: "Phát video",
    svg: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>',
  },
};

export function navIconSvg(key) {
  return (NAV_ICONS[key] || NAV_ICONS[DEFAULT_NAV_ICON]).svg;
}

// ══════════════════════════════════════
// PHÂN LOẠI POI (loai_poi) — lớp phân loại theo CHỨC NĂNG, tách biệt với
// `type` (poi/nav, quyết định hình dạng pin + có chuyển cảnh hay không).
// `loai_poi` chỉ quyết định ICON hiển thị (và là chỗ để gắn hành vi riêng
// sau này cho thu_vien_anh/phat_video). Optional — dữ liệu cũ không có
// trường này vẫn hiển thị bình thường theo `type`/`icon` như trước.
// ══════════════════════════════════════
export const POI_TYPES = {
  chuyen_canh: { label: "Chuyển cảnh", icon: "dot" },
  thong_tin_van_ban: { label: "Thông tin văn bản", icon: "info" },
  thu_vien_anh: { label: "Thư viện ảnh", icon: "gallery" },
  phat_video: { label: "Phát video", icon: "video" },
  // "Thẻ ghim chân không" (Pin Marker Badge) — đánh dấu danh lam / vị trí địa
  // lý / phân khu nằm XA tầm mắt camera: nhãn chữ IN HOA nổi trên nền trời/núi,
  // đường nét đứt cắm xuống chấm neo tại điểm thực tế. Hình dạng riêng (không
  // dùng pin giọt nước) — dựng ở VrTourViewer; `icon` chỉ dùng cho dropdown
  // trong builder. Xem [[project_vr360_builder_platform]].
  ghim_dia_danh: { label: "Ghim địa danh (thẻ ở xa)", icon: "flag" },
};

// Thứ tự ưu tiên khi chọn icon cho 1 hotspot: loai_poi > icon tự chọn > mặc định.
export function resolveHotspotIcon(hs) {
  if (hs?.loai_poi && POI_TYPES[hs.loai_poi]) return POI_TYPES[hs.loai_poi].icon;
  return hs?.icon || DEFAULT_NAV_ICON;
}
