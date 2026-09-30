export function defaultTransition() {
  return { enabled: true, rotation: true, effect: "fade", duration: 1200, speed: 10 };
}

export function defaultHoverState() {
  return { hien_thi_anh_thu_nho: false, duong_dan_thumbnail: "", van_ban_huong_dan: "" };
}

export const NAV_STYLES = {
  default: "default",
  previewExpand: "preview_expand",
};

export function normalizeNavStyle(navStyle) {
  if (navStyle === "arrow") return NAV_STYLES.default;
  return Object.values(NAV_STYLES).includes(navStyle)
    ? navStyle
    : NAV_STYLES.default;
}

import { normalizeBuilderPoint } from "./pointSchema.js";

export function normalizeHotspot(h = {}) {
  const point = normalizeBuilderPoint(h);
  return {
    ...point,
    ...(point.type === "nav" || point.loai_poi === "chuyen_canh"
      ? { navStyle: normalizeNavStyle(point.navStyle) }
      : {}),
    khi_dua_chuot_vao: {
      hien_thi_anh_thu_nho: point.khi_dua_chuot_vao?.hien_thi_anh_thu_nho || false,
      duong_dan_thumbnail: point.khi_dua_chuot_vao?.duong_dan_thumbnail || "",
      van_ban_huong_dan: point.khi_dua_chuot_vao?.van_ban_huong_dan || "",
    },
  };
}

export function normalizeScene(s, { generateId, resolveUrl } = {}) {
  const resolve = resolveUrl || ((u) => u || "");
  const genId = generateId || ((n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "scene");

  const rawImage =
    s.original_file ||
    s.image_url ||
    s.image ||
    s.panorama ||
    s.url ||
    s.preview_file ||
    s.optimized_file ||
    "";
  const rawThumb =
    s.thumbnail_file ||
    s.thumb_url ||
    s.thumb ||
    s.preview_file ||
    s.optimized_file ||
    rawImage;

  const img = resolve(rawImage);
  const th = resolve(rawThumb) || img;

  return {
    id: s.id || genId(s.name || "scene"),
    name: s.name || "Scene",
    group: s.group || "Mặc định",
    image: img,
    thumb: th,
    exportUrl: rawImage || "",
    _serverThumb: rawThumb || "",
    _file: null,
    info: s.info || "",
    gps: s.gps || null,
    initialView: { lon: 0, lat: 0, fov: 75, ...(s.initialView || {}) },
    transition: s.transition
      ? { ...defaultTransition(), ...s.transition }
      : defaultTransition(),
    hotspots: (s.hotspots || []).map((h) => normalizeHotspot(h, { resolveUrl: resolve })),
  };
}
