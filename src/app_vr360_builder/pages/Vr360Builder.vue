<script setup>
import { reactive, ref, shallowRef, computed, onMounted, onBeforeUnmount } from "vue";
import { PreviewEngine, generateThumb } from "../common/PreviewEngine.js";
import { resizeImageFile, formatBytes } from "../common/imageResize.js";
import { readGpsFromFile, formatGps } from "../common/exifGps.js";
import { NAV_ICONS, DEFAULT_NAV_ICON, navIconSvg, POI_TYPES, resolveHotspotIcon } from "../../app_thanh_cong/common/hotspotIcons.js";

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
const scenes = reactive([]);
const activeSceneIndex = ref(-1);
const selectedHotspotIndex = ref(-1);
const placingHotspot = ref(false);

const activeScene = computed(() => (activeSceneIndex.value >= 0 ? scenes[activeSceneIndex.value] : null));
const selectedHotspot = computed(() =>
  activeScene.value && selectedHotspotIndex.value >= 0 ? activeScene.value.hotspots[selectedHotspotIndex.value] : null
);
const targetScene = computed(() => {
  if (!selectedHotspot.value?.target) return null;
  return scenes.find((s) => s.id === selectedHotspot.value.target) || null;
});
const navIconDefault = DEFAULT_NAV_ICON;
const navIconOptions = Object.entries(NAV_ICONS).map(([key, v]) => ({ key, label: v.label }));
const poiTypeOptions = Object.entries(POI_TYPES).map(([key, v]) => ({ key, label: v.label }));

// "Xem trước & chỉnh góc đến": tạm thời hiện scene đích lên canvas chính để
// người dùng xoay tìm góc nhìn khi vừa bước sang, không đổi activeSceneIndex
// (property panel bên phải vẫn hiển thị scene đang biên tập suốt quá trình).
const previewMode = reactive({ active: false });

const canvasRef = ref(null);
const hotspotLayerRef = ref(null);
const fileInputRef = ref(null);
const replaceImageInputRef = ref(null);
const audioInputRef = ref(null);
const engine = shallowRef(null);

const canvasLoading = ref(false);
const hud = reactive({ lon: "0.0", lat: "0.0", fov: "75" });
const addAreaDragover = ref(false);
const draggingIndex = ref(-1);
const dragOverIndex = ref(-1);

// Ảnh panorama gốc (drone/camera 360°) thường 50-70MB ở 15000px+ chiều rộng.
// Bảng preset thiết kế riêng cho 360°:
//   - Ảnh đã đủ nhỏ (<8MB) & không vượt maxWidth → giữ nguyên, không re-encode.
//   - Khi phải thu nhỏ dùng thu-nhỏ-nhiều-bước cho ảnh nét (xem imageResize.js).
//   - Trần hiển thị do GPU quyết định (PreviewEngine.gl.MAX_TEXTURE_SIZE), nên
//     preset >8192px chỉ nét hơn trên GPU desktop mạnh; máy yếu tự downscale.
// maxWidth = 0 → không resize; quality chỉ áp dụng khi thực sự re-encode.
const RESIZE_PRESETS = [
  { id: "original", label: "Original — giữ nguyên độ phân giải, tối ưu JPEG (lưu trữ/biên tập)", maxWidth: 999999, quality: 0.95 },
  { id: "preview", label: "Preview — 4096px, nhẹ (xem nhanh)", maxWidth: 4096, quality: 0.85 },
  { id: "standard", label: "Standard — 8192px (khuyến nghị)", maxWidth: 8192, quality: 0.92 },
  { id: "hq", label: "High Quality — 12000px, panorama nét cao", maxWidth: 12000, quality: 0.95 },
  { id: "lossless", label: "Lossless — không resize, giữ nguyên file gốc (chuyên nghiệp)", maxWidth: 0, quality: 0.95 },
];
const resizePresetId = ref("standard");
const resizeSettings = reactive({ maxWidth: 8192, quality: 0.92 });
function applyResizePreset() {
  const p = RESIZE_PRESETS.find((x) => x.id === resizePresetId.value) || RESIZE_PRESETS.find((x) => x.id === "standard");
  resizeSettings.maxWidth = p.maxWidth;
  resizeSettings.quality = p.quality;
}
const resizingCount = ref(0);

const modals = reactive({ export: false, import: false, api: false, load: false });
const exportJsonText = ref("");
const importJsonText = ref("");

const toastState = reactive({ show: false, type: "info", msg: "" });
let toastTimer = null;
function showToast(type, msg) {
  toastState.type = type;
  toastState.msg = msg;
  toastState.show = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastState.show = false;
  }, 3000);
}

// ══════════════════════════════════════
//  HOTSPOT OVERLAY (imperative DOM pool — driven by the ~20fps
//  render loop callback, kept outside Vue reactivity on purpose)
// ══════════════════════════════════════
function navHtml(icon) {
  return `<div class="bh-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${navIconSvg(icon)}</svg></div><div class="bh-label"></div>`;
}
const POI_ICON_HTML = '<div class="bh-dot"></div><div class="bh-label"></div>';

function updateHotspotOverlay(eng) {
  const layer = hotspotLayerRef.value;
  if (!layer) return;
  if (activeSceneIndex.value < 0 || previewMode.active) {
    if (layer.children.length) layer.innerHTML = "";
    return;
  }
  const hs = scenes[activeSceneIndex.value].hotspots;
  const n = hs.length;

  while (layer.children.length > n) layer.removeChild(layer.lastChild);
  while (layer.children.length < n) {
    const el = document.createElement("div");
    el.className = "builder-hotspot";
    layer.appendChild(el);
  }

  for (let i = 0; i < n; i++) {
    const el = layer.children[i];
    const pos = eng.sphereToScreen(hs[i].lon, hs[i].lat);
    if (!pos) {
      el.classList.add("hidden");
      continue;
    }
    el.classList.remove("hidden");
    el.classList.toggle("selected", i === selectedHotspotIndex.value);
    el.style.transform = `translate3d(${pos.x - 14}px,${pos.y - 14}px,0) scale(${pos.scale})`;

    const isNav = hs[i].type === "nav";
    const resolvedIcon = resolveHotspotIcon(hs[i]);
    if (el._type !== hs[i].type || (isNav && el._icon !== resolvedIcon)) {
      el._type = hs[i].type;
      el._icon = resolvedIcon;
      el.innerHTML = isNav ? navHtml(resolvedIcon) : POI_ICON_HTML;
    }
    const label = el.lastElementChild;

    if (!isNav) {
      const dot = el.firstElementChild;
      const num = String(i + 1);
      if (dot.textContent !== num) dot.textContent = num;
    }

    const txt = hs[i].label || (isNav ? "Lối đi " + (i + 1) : "Hotspot " + (i + 1));
    if (label.textContent !== txt) label.textContent = txt;
    if (el._i !== i) {
      el._i = i;
      el.onclick = (e) => {
        e.stopPropagation();
        selectHotspot(i);
      };
      el.ondblclick = (e) => {
        e.stopPropagation();
        goToHotspotTarget(i);
      };
    }
  }
}

// ══════════════════════════════════════
//  SCENE MANAGEMENT
// ══════════════════════════════════════
function generateId(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "scene_" + Date.now()
  );
}

async function processIncomingFile(file) {
  if (!resizeSettings.maxWidth) {
    return { file, originalSize: file.size, resizedSize: file.size, resized: false };
  }
  resizingCount.value++;
  try {
    return await resizeImageFile(file, resizeSettings);
  } catch (e) {
    console.error("resizeImageFile error:", e);
    return { file, originalSize: file.size, resizedSize: file.size, resized: false };
  } finally {
    resizingCount.value--;
  }
}

async function addScene(file) {
  // GPS must be read from the ORIGINAL file — resizing re-encodes through
  // <canvas> and strips all EXIF/XMP metadata.
  const [gps, { file: procFile, originalSize, resizedSize, resized }] = await Promise.all([
    readGpsFromFile(file),
    processIncomingFile(file),
  ]);
  const localUrl = URL.createObjectURL(procFile);
  const rawName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const scene = {
    id: generateId(name) + "_" + scenes.length,
    name,
    group: "Mặc định",
    image: localUrl,
    thumb: localUrl,
    info: "",
    initialView: { lon: 0, lat: 0, fov: 75 },
    hotspots: [],
    am_thanh_thuyet_minh: defaultNarration(),
    gps,
    _file: procFile,
    _audioLocalUrl: "",
    _audioFileName: "",
    _originalSize: originalSize,
    _resizedSize: resizedSize,
    _resized: resized,
    exportUrl: "",
    _serverThumb: "",
  };
  scenes.push(scene);
  if (scenes.length === 1) selectScene(0);

  generateThumb(procFile).then((t) => {
    scene.thumb = t;
  });
}

function removeScene(index) {
  if (!confirm(`Xóa scene "${scenes[index].name}"?`)) return;
  previewMode.active = false;
  const rem = scenes.splice(index, 1)[0];
  if (rem.image?.startsWith("blob:")) URL.revokeObjectURL(rem.image);
  if (activeSceneIndex.value === index) {
    activeSceneIndex.value = -1;
    selectedHotspotIndex.value = -1;
    if (scenes.length > 0) selectScene(Math.min(index, scenes.length - 1));
  } else if (activeSceneIndex.value > index) {
    activeSceneIndex.value--;
  }
}

async function selectScene(index) {
  if (index < 0 || index >= scenes.length) return;
  previewMode.active = false;
  activeSceneIndex.value = index;
  selectedHotspotIndex.value = -1;
  cancelPlacingHotspot();
  const s = scenes[index];
  await engine.value.loadPanorama(s.image, s._file);
  engine.value.setView(s.initialView.lon, s.initialView.lat, s.initialView.fov);
}

function onDragStart(index) {
  draggingIndex.value = index;
}
function onDragEnd() {
  draggingIndex.value = -1;
  dragOverIndex.value = -1;
}
function onDrop(toIndex, event) {
  dragOverIndex.value = -1;
  // Kéo 1 file ảnh từ ngoài (đã chỉnh sửa) thả vào thẻ scene -> thay ảnh scene đó,
  // thay vì coi là kéo-thả sắp xếp lại danh sách.
  const files = event?.dataTransfer?.files;
  if (files && files.length > 0) {
    const f = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (f) replaceSceneImage(toIndex, f);
    draggingIndex.value = -1;
    return;
  }
  const from = draggingIndex.value;
  const to = toIndex;
  if (from < 0 || from === to) return;
  const [moved] = scenes.splice(from, 1);
  scenes.splice(to, 0, moved);
  if (activeSceneIndex.value === from) activeSceneIndex.value = to;
  else if (from < activeSceneIndex.value && to >= activeSceneIndex.value) activeSceneIndex.value--;
  else if (from > activeSceneIndex.value && to <= activeSceneIndex.value) activeSceneIndex.value++;
}

// ══════════════════════════════════════
//  HOTSPOT PLACEMENT
// ══════════════════════════════════════
function startPlacingHotspot() {
  if (activeSceneIndex.value < 0 || previewMode.active) return;
  placingHotspot.value = true;
  if (engine.value) engine.value.placingHotspot = true;
  showToast("info", "🎯 Click vào panorama để đặt hotspot");
}
function cancelPlacingHotspot() {
  placingHotspot.value = false;
  if (engine.value) engine.value.placingHotspot = false;
}
function defaultHoverState() {
  return { hien_thi_anh_thu_nho: false, duong_dan_thumbnail: "", van_ban_huong_dan: "" };
}
function placeNewHotspot(lon, lat) {
  if (activeSceneIndex.value < 0 || previewMode.active) return;
  const hs = scenes[activeSceneIndex.value].hotspots;
  hs.push({
    lon, lat, label: "Hotspot " + (hs.length + 1), target: "", type: "poi", icon: null,
    loai_poi: null, khi_dua_chuot_vao: defaultHoverState(), entryView: null,
  });
  selectedHotspotIndex.value = hs.length - 1;
  cancelPlacingHotspot();
  engine.value.requestRender();
  showToast("success", `✅ Hotspot tại lon:${lon}°, lat:${lat}°`);
}
// Double-click canvas: đặt nhanh 1 điểm "chỉ đường" (nav) — không cần bấm
// "+ Thêm hotspot" trước, vì đây là thao tác lặp lại nhiều nhất khi build tour.
function placeNavHotspotQuick(lon, lat) {
  if (activeSceneIndex.value < 0 || previewMode.active) return;
  const hs = scenes[activeSceneIndex.value].hotspots;
  hs.push({
    lon, lat, label: "Lối đi " + (hs.length + 1), target: "", type: "nav", icon: DEFAULT_NAV_ICON,
    loai_poi: "chuyen_canh", khi_dua_chuot_vao: defaultHoverState(), entryView: null,
  });
  selectedHotspotIndex.value = hs.length - 1;
  engine.value.requestRender();
  showToast("info", "🧭 Đã đặt điểm chỉ đường — chọn scene đích bên phải");
}
function selectHotspot(i) {
  selectedHotspotIndex.value = selectedHotspotIndex.value === i ? -1 : i;
  engine.value.requestRender();
}
// Double-click a hotspot dot: jump straight to the scene it points to —
// lets you walk through the tour the same way an end user would, arriving
// at the hotspot's custom entry view if one was captured, else the target
// scene's own initial view.
async function goToHotspotTarget(i) {
  if (activeSceneIndex.value < 0 || previewMode.active) return;
  const hs = scenes[activeSceneIndex.value].hotspots[i];
  if (!hs?.target) {
    showToast("info", "⚠ Hotspot chưa gán scene đích");
    return;
  }
  const idx = scenes.findIndex((s) => s.id === hs.target);
  if (idx < 0) {
    showToast("error", "❌ Không tìm thấy scene đích");
    return;
  }
  await selectScene(idx);
  if (hs.entryView) engine.value.setView(hs.entryView.lon, hs.entryView.lat, hs.entryView.fov);
}
function removeHotspot(i) {
  if (activeSceneIndex.value < 0) return;
  scenes[activeSceneIndex.value].hotspots.splice(i, 1);
  if (selectedHotspotIndex.value === i) selectedHotspotIndex.value = -1;
  else if (selectedHotspotIndex.value > i) selectedHotspotIndex.value--;
  engine.value.requestRender();
}
function updateHotspot(key, value) {
  if (activeSceneIndex.value < 0 || selectedHotspotIndex.value < 0) return;
  const hs = scenes[activeSceneIndex.value].hotspots[selectedHotspotIndex.value];
  hs[key] = value;
  if (key === "type" && value === "nav" && !hs.icon) hs.icon = DEFAULT_NAV_ICON;
  // loai_poi quyết định luôn hình dạng pin: chuyển cảnh => pin "nav" (cần scene đích),
  // 3 loại còn lại => pin "poi" (thông tin/thư viện/video, không tự chuyển cảnh).
  if (key === "loai_poi") {
    hs.type = value === "chuyen_canh" ? "nav" : "poi";
    if (hs.type === "nav" && !hs.icon) hs.icon = DEFAULT_NAV_ICON;
  }
  engine.value.requestRender();
}
function updateHotspotHover(key, value) {
  if (activeSceneIndex.value < 0 || selectedHotspotIndex.value < 0) return;
  const hs = scenes[activeSceneIndex.value].hotspots[selectedHotspotIndex.value];
  if (!hs.khi_dua_chuot_vao) hs.khi_dua_chuot_vao = defaultHoverState();
  hs.khi_dua_chuot_vao[key] = value;
}

// ══════════════════════════════════════
//  XEM TRƯỚC SCENE ĐÍCH & ĐẶT GÓC NHÌN KHI ĐẾN
// ══════════════════════════════════════
async function previewTargetScene() {
  if (!targetScene.value || activeSceneIndex.value < 0 || selectedHotspotIndex.value < 0) return;
  previewMode.active = true;
  cancelPlacingHotspot();
  const t = targetScene.value;
  await engine.value.loadPanorama(t.image, t._file);
  const v = selectedHotspot.value.entryView || t.initialView;
  engine.value.setView(v.lon, v.lat, v.fov);
}
async function returnFromPreview() {
  const s = activeScene.value;
  previewMode.active = false;
  if (!s) return;
  await engine.value.loadPanorama(s.image, s._file);
  engine.value.setView(s.initialView.lon, s.initialView.lat, s.initialView.fov);
}
async function saveEntryView() {
  if (!selectedHotspot.value) return;
  selectedHotspot.value.entryView = engine.value.getView();
  await returnFromPreview();
  showToast("success", "✅ Đã lưu góc nhìn khi đến scene này");
}
function clearEntryView() {
  if (!selectedHotspot.value) return;
  selectedHotspot.value.entryView = null;
  showToast("info", "↺ Dùng lại góc nhìn mặc định của scene đích");
}

// ══════════════════════════════════════
//  PROPERTY PANEL ACTIONS
// ══════════════════════════════════════
function updateScene(key, value) {
  if (activeSceneIndex.value < 0) return;
  const s = scenes[activeSceneIndex.value];
  if (key === "imageUrl") s.exportUrl = value;
  else s[key] = value;
}
function updateView(key, value) {
  if (activeSceneIndex.value < 0) return;
  const iv = scenes[activeSceneIndex.value].initialView;
  iv[key] = value;
  engine.value.setView(iv.lon, iv.lat, iv.fov);
}
function saveCurrentView() {
  if (activeSceneIndex.value < 0) return;
  const v = engine.value.getView();
  scenes[activeSceneIndex.value].initialView = v;
  showToast("success", `✅ lon=${v.lon}° lat=${v.lat}° fov=${v.fov}°`);
}
function replaceImage() {
  if (activeSceneIndex.value < 0) return;
  replaceImageInputRef.value.click();
}
// Dùng chung cho cả 2 cách thay ảnh: chọn file trong panel thuộc tính, và kéo
// thả ảnh đã chỉnh sửa (Photoshop/Lightroom...) thẳng vào thẻ scene bên trái.
// Giữ nguyên id/group/hotspots/initialView của scene — chỉ thay ảnh + GPS.
async function replaceSceneImage(index, file) {
  if (!file || !file.type.startsWith("image/") || index < 0 || index >= scenes.length) return;
  const [gps, { file: procFile, originalSize, resizedSize, resized }] = await Promise.all([
    readGpsFromFile(file),
    processIncomingFile(file),
  ]);
  const url = URL.createObjectURL(procFile);
  const s = scenes[index];
  if (s.image?.startsWith("blob:")) URL.revokeObjectURL(s.image);
  s.image = url;
  s._file = procFile;
  s._originalSize = originalSize;
  s._resizedSize = resizedSize;
  s._resized = resized;
  s.gps = gps;
  s.exportUrl = "";
  s._serverThumb = "";
  generateThumb(procFile).then((t) => {
    s.thumb = t;
  });
  if (index === activeSceneIndex.value) {
    await engine.value.loadPanorama(url, procFile);
  }
  showToast("info", `✅ Đã thay ảnh "${s.name}"`);
}

async function handleReplaceImage(ev) {
  const f = ev.target.files?.[0];
  if (activeSceneIndex.value < 0) return;
  await replaceSceneImage(activeSceneIndex.value, f);
  ev.target.value = "";
}

// ══════════════════════════════════════
//  THUYẾT MINH (am_thanh_thuyet_minh) — audio riêng cho từng scene
// ══════════════════════════════════════
function defaultNarration() {
  return { duong_dan_file_audio: "", tu_dong_phat: false, thoi_luong_giay: 0 };
}
// Đảm bảo scene luôn có object thuyết minh để binding an toàn (scene import cũ
// có thể thiếu).
function ensureNarration(s) {
  if (!s.am_thanh_thuyet_minh) s.am_thanh_thuyet_minh = defaultNarration();
  return s.am_thanh_thuyet_minh;
}
// Nguồn phát cho trình nghe thử: ưu tiên file cục bộ vừa chọn, không thì dùng URL.
const audioPreviewSrc = computed(() => {
  const s = activeScene.value;
  if (!s) return "";
  return s._audioLocalUrl || s.am_thanh_thuyet_minh?.duong_dan_file_audio || "";
});
function updateNarration(key, value) {
  if (activeSceneIndex.value < 0) return;
  ensureNarration(scenes[activeSceneIndex.value])[key] = value;
}
function pickAudioFile() {
  if (activeSceneIndex.value < 0) return;
  audioInputRef.value?.click();
}
async function handleAudioFile(ev) {
  const f = ev.target.files?.[0];
  ev.target.value = "";
  if (!f || activeSceneIndex.value < 0) return;
  const s = scenes[activeSceneIndex.value];
  ensureNarration(s);
  // Nghe thử ngay từ file cục bộ + đọc thời lượng thật từ metadata.
  if (s._audioLocalUrl) URL.revokeObjectURL(s._audioLocalUrl);
  s._audioLocalUrl = URL.createObjectURL(f);
  s._audioFileName = f.name;
  readAudioDuration(s._audioLocalUrl, s);
  // Đã kết nối API → thử upload để có URL vĩnh viễn cho JSON xuất ra. Chưa kết
  // nối (hoặc server chưa nhận audio) thì để người dùng dán URL đã host.
  if (api.connected) {
    showToast("info", "⏳ Đang upload audio...");
    const url = await apiUploadAudio(f);
    if (url) {
      s.am_thanh_thuyet_minh.duong_dan_file_audio = url;
      showToast("success", "☁️ Đã upload audio");
    } else {
      showToast("info", "⚠ Server chưa nhận audio — dán URL đã host vào ô bên dưới để xuất JSON");
    }
  } else {
    showToast("info", "🎧 Đã nạp để nghe thử — dán URL đã host vào ô bên dưới để xuất JSON");
  }
}
function readAudioDuration(src, s) {
  const a = new Audio();
  a.preload = "metadata";
  a.src = src;
  a.addEventListener(
    "loadedmetadata",
    () => {
      if (isFinite(a.duration)) s.am_thanh_thuyet_minh.thoi_luong_giay = Math.round(a.duration);
    },
    { once: true },
  );
}
function clearNarration() {
  if (activeSceneIndex.value < 0) return;
  const s = scenes[activeSceneIndex.value];
  if (s._audioLocalUrl) {
    URL.revokeObjectURL(s._audioLocalUrl);
    s._audioLocalUrl = "";
  }
  s._audioFileName = "";
  s.am_thanh_thuyet_minh = defaultNarration();
  showToast("info", "↺ Đã xoá thuyết minh của scene");
}

// ══════════════════════════════════════
//  FILE HANDLING
// ══════════════════════════════════════
function addSceneFromFiles() {
  fileInputRef.value.click();
}
// Sequential on purpose: addScene() does async resize/GPS work whose duration
// varies per file, so firing them concurrently can land scenes out of order
// (whichever file finishes processing first wins the slot).
async function addScenesInOrder(files) {
  for (const f of files) {
    if (f.type.startsWith("image/")) await addScene(f);
  }
}
function handleFileInput(e) {
  addScenesInOrder(Array.from(e.target.files));
  e.target.value = "";
}
function onAddAreaDrop(e) {
  addAreaDragover.value = false;
  addScenesInOrder(Array.from(e.dataTransfer.files));
}

// ══════════════════════════════════════
//  API (external, user-configured server — plain fetch,
//  unrelated to this project's own Django backend/useAxios)
// ══════════════════════════════════════
const api = reactive({ baseUrl: "", connected: false, currentTourId: null });
const apiStatus = ref("off"); // off | loading | on
const apiUrlInput = ref("");
const apiTestBtnLoading = ref(false);
const apiTestResult = reactive({ show: false, ok: false, msg: "" });
const loadModalLoading = ref(false);
const loadModalTours = ref([]);

function apiUrl(p) {
  return api.baseUrl + p;
}

function initApi() {
  const saved = localStorage.getItem("vr360_api_url");
  if (saved) {
    api.baseUrl = saved;
    apiTestConnection(true);
  }
}

async function apiTestConnection(silent = false) {
  if (!api.baseUrl) {
    apiStatus.value = "off";
    api.connected = false;
    return false;
  }
  apiStatus.value = "loading";
  try {
    const r = await fetch(apiUrl("/api/health"), { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    apiStatus.value = "on";
    api.connected = true;
    if (!silent) {
      apiTestResult.show = true;
      apiTestResult.ok = true;
      apiTestResult.msg = `✅ OK — ${d.panoramas || 0} ảnh, ${d.tours || 0} tour`;
    }
    return true;
  } catch (e) {
    apiStatus.value = "off";
    api.connected = false;
    if (!silent) {
      apiTestResult.show = true;
      apiTestResult.ok = false;
      apiTestResult.msg = `❌ ${e.message}`;
    }
    return false;
  }
}

async function apiUpload(f) {
  if (!api.connected) return null;
  try {
    const fd = new FormData();
    fd.append("files", f);
    const r = await fetch(apiUrl("/api/upload"), { method: "POST", body: fd });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    if (d.images?.[0]) {
      const i = d.images[0];
      return { image_url: apiUrl(i.image_url), thumb_url: apiUrl(i.thumb_url), filename: i.filename };
    }
  } catch (e) {
    console.warn("Upload:", e.message);
  }
  return null;
}
// Upload 1 file audio thuyết minh. Backend hiện trả mảng "images" cho ảnh; audio
// (nếu server hỗ trợ) có thể nằm ở "audios"/"files". Thử lần lượt, lấy URL đầu
// tiên tìm thấy; không có thì trả null (người dùng dán URL thủ công).
async function apiUploadAudio(f) {
  if (!api.connected) return null;
  try {
    const fd = new FormData();
    fd.append("files", f);
    const r = await fetch(apiUrl("/api/upload"), { method: "POST", body: fd });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    const item = d.audios?.[0] || d.files?.[0] || d.images?.[0];
    const url = item?.url || item?.audio_url || item?.file_url || item?.image_url;
    if (!url) return null;
    return url.startsWith("/") ? apiUrl(url) : url;
  } catch (e) {
    console.warn("Upload audio:", e.message);
    return null;
  }
}
async function apiSaveTour(d) {
  if (!api.connected) {
    showToast("error", "❌ Chưa kết nối");
    return null;
  }
  try {
    const method = api.currentTourId ? "PUT" : "POST";
    const p = api.currentTourId ? `/api/tours/${api.currentTourId}` : "/api/tours";
    const r = await fetch(apiUrl(p), { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const res = await r.json();
    api.currentTourId = res.tour_id || api.currentTourId;
    return res;
  } catch (e) {
    showToast("error", "❌ " + e.message);
    return null;
  }
}
async function apiListTours() {
  if (!api.connected) return [];
  try {
    const r = await fetch(apiUrl("/api/tours"));
    if (!r.ok) throw new Error();
    const d = await r.json();
    return d.tours || [];
  } catch {
    return [];
  }
}
async function apiLoadTour(id) {
  if (!api.connected) return null;
  try {
    const r = await fetch(apiUrl(`/api/tours/${id}`));
    if (!r.ok) throw new Error();
    return await r.json();
  } catch (e) {
    showToast("error", "❌ " + e.message);
    return null;
  }
}

function openApiSettings() {
  apiUrlInput.value = api.baseUrl;
  apiTestResult.show = false;
  modals.api = true;
}
async function testApiConnection() {
  const u = apiUrlInput.value.trim().replace(/\/+$/, "");
  if (!u) {
    showToast("error", "❌ Nhập URL");
    return;
  }
  api.baseUrl = u;
  apiTestBtnLoading.value = true;
  await apiTestConnection(false);
  apiTestBtnLoading.value = false;
}
function saveApiSettings() {
  const u = apiUrlInput.value.trim().replace(/\/+$/, "");
  api.baseUrl = u;
  if (u) {
    localStorage.setItem("vr360_api_url", u);
    apiTestConnection(true).then((ok) => {
      showToast(ok ? "success" : "error", ok ? `✅ ${u}` : "⚠ Chưa kết nối");
    });
  } else {
    localStorage.removeItem("vr360_api_url");
    apiStatus.value = "off";
    api.connected = false;
  }
  modals.api = false;
}

async function saveToServer() {
  if (!api.connected) {
    showToast("error", "❌ Chưa kết nối");
    return;
  }
  if (!scenes.length) {
    showToast("error", "❌ Chưa có scene");
    return;
  }
  try {
    const c = cloneForExport();
    const pending = c.filter((x) => x._file && !x.exportUrl);
    if (pending.length) {
      showToast("info", `⏳ Upload ${pending.length} ảnh...`);
      const r = await uploadClone(c);
      if (!r.ok) {
        showToast("error", "❌ Upload thất bại");
        return;
      }
    }
    const res = await apiSaveTour(buildJson(c));
    if (res) {
      syncBack(c);
      showToast("success", `✅ Saved! ID: ${res.tour_id || api.currentTourId}`);
    }
  } catch (e) {
    showToast("error", "❌ " + e.message);
  }
}

async function loadFromServer() {
  if (!api.connected) {
    showToast("error", "❌ Chưa kết nối");
    return;
  }
  loadModalLoading.value = true;
  loadModalTours.value = [];
  modals.load = true;
  loadModalTours.value = await apiListTours();
  loadModalLoading.value = false;
}

async function loadTourById(id) {
  const d = await apiLoadTour(id);
  if (!d) return;
  const mapped = (d.scenes || []).map((s) => {
    const img = s.image?.startsWith("/") ? apiUrl(s.image) : s.image || "";
    const th = s.thumb?.startsWith("/") ? apiUrl(s.thumb) : s.thumb || img;
    return {
      id: s.id || generateId(s.name || "scene"),
      name: s.name || "Scene",
      group: s.group || "Mặc định",
      image: img,
      thumb: th,
      exportUrl: s.image || "",
      _serverThumb: s.thumb || "",
      _file: null,
      _audioLocalUrl: "",
      _audioFileName: "",
      info: s.info || "",
      gps: s.gps || null,
      initialView: { lon: 0, lat: 0, fov: 75, ...(s.initialView || {}) },
      am_thanh_thuyet_minh: s.am_thanh_thuyet_minh
        ? { ...defaultNarration(), ...s.am_thanh_thuyet_minh }
        : defaultNarration(),
      hotspots: (s.hotspots || []).map((h) => ({
        lon: h.lon || 0,
        lat: h.lat || 0,
        label: h.label || "",
        target: h.target || "",
        type: h.type || "poi",
        icon: h.icon || null,
        loai_poi: h.loai_poi || null,
        // Giữ nguyên các trường bổ sung (không dựng UI riêng, chỉnh tay trong
        // JSON): chiều cao đường ghim địa danh + giới thiệu riêng của POI. Chỉ
        // thêm khi có để JSON gọn — tránh mất dữ liệu khi nạp lại vào builder.
        ...(h.chieu_cao_duong_ghim != null ? { chieu_cao_duong_ghim: h.chieu_cao_duong_ghim } : {}),
        ...(h.thong_tin_gioi_thieu ? { thong_tin_gioi_thieu: h.thong_tin_gioi_thieu } : {}),
        khi_dua_chuot_vao: {
          hien_thi_anh_thu_nho: h.khi_dua_chuot_vao?.hien_thi_anh_thu_nho || false,
          duong_dan_thumbnail: h.khi_dua_chuot_vao?.duong_dan_thumbnail || "",
          van_ban_huong_dan: h.khi_dua_chuot_vao?.van_ban_huong_dan || "",
        },
        entryView: h.entryView || null,
      })),
    };
  });
  scenes.splice(0, scenes.length, ...mapped);
  api.currentTourId = id;
  activeSceneIndex.value = -1;
  selectedHotspotIndex.value = -1;
  modals.load = false;
  if (scenes.length > 0) selectScene(0);
  showToast("success", `✅ "${d.title || id}" — ${scenes.length} scenes`);
}

// ══════════════════════════════════════
//  EXPORT / IMPORT
// ══════════════════════════════════════
function cloneForExport() {
  return scenes.map((s) => ({
    id: s.id,
    name: s.name,
    group: s.group,
    image: s.image,
    thumb: s.thumb,
    info: s.info,
    gps: s.gps || null,
    exportUrl: s.exportUrl || "",
    _serverThumb: s._serverThumb || "",
    _file: s._file || null,
    initialView: { ...s.initialView },
    am_thanh_thuyet_minh: s.am_thanh_thuyet_minh ? { ...s.am_thanh_thuyet_minh } : null,
    hotspots: s.hotspots.map((h) => ({ ...h })),
  }));
}
function buildJson(c) {
  return {
    title: "VR360 Virtual Tour",
    scenes: c.map((s) => ({
      id: s.id,
      name: s.name,
      group: s.group,
      image: s.exportUrl || s.image,
      thumb: s._serverThumb || s.exportUrl || s.thumb,
      info: s.info,
      gps: s.gps || null,
      initialView: { ...s.initialView },
      // Chỉ xuất khi thực sự có file audio, để JSON gọn với scene không thuyết minh.
      ...(s.am_thanh_thuyet_minh?.duong_dan_file_audio
        ? { am_thanh_thuyet_minh: { ...s.am_thanh_thuyet_minh } }
        : {}),
      hotspots: s.hotspots.map((h) => ({ ...h })),
    })),
  };
}
async function uploadClone(c, prog) {
  const pending = c.filter((x) => x._file && !x.exportUrl);
  if (!pending.length) return { ok: true, up: 0, fail: 0 };
  if (!api.connected) return { ok: false, up: 0, fail: 0 };
  let up = 0,
    fail = 0;
  for (let i = 0; i < pending.length; i++) {
    if (prog) prog(i + 1, pending.length, pending[i].name);
    try {
      const r = await apiUpload(pending[i]._file);
      if (r) {
        pending[i].exportUrl = r.image_url;
        pending[i]._serverThumb = r.thumb_url;
        up++;
      } else fail++;
    } catch {
      fail++;
    }
  }
  return { ok: !fail, up, fail };
}
function syncBack(c) {
  c.forEach((x, i) => {
    const s = scenes[i];
    if (s && x.exportUrl && s.id === x.id) {
      s.exportUrl = x.exportUrl;
      s._serverThumb = x._serverThumb;
    }
  });
}

// Còn ảnh nào chưa có URL server (vẫn là blob cục bộ) thì chưa được xuất.
function hasPendingUploads(c) {
  return c.some((x) => x._file && !x.exportUrl);
}

async function exportJSON() {
  try {
    const c = cloneForExport();
    const pending = c.filter((x) => x._file && !x.exportUrl);

    // (2) Còn ảnh chưa upload mà chưa kết nối API → mở luôn cài đặt API và yêu
    // cầu kết nối, KHÔNG xuất blob.
    if (pending.length && !api.connected) {
      showToast("error", `⚠ Còn ${pending.length} ảnh chưa upload. Hãy kết nối API rồi export lại (không xuất blob).`);
      openApiSettings();
      return;
    }

    // Không còn ảnh nào cần upload → xuất trực tiếp (nhưng vẫn quét blob sót).
    if (!pending.length) {
      const json = buildJson(c);
      if (JSON.stringify(json).includes("blob:")) {
        showToast("error", "⚠ Còn ảnh dạng blob chưa được host. Hãy import lại ảnh gốc rồi export khi đã kết nối API.");
        openApiSettings();
        return;
      }
      exportJsonText.value = JSON.stringify(json, null, 2);
      modals.export = true;
      return;
    }

    // Đã kết nối → upload rồi mới xuất.
    exportJsonText.value = "⏳ Uploading...";
    modals.export = true;
    const r = await uploadClone(c, (i, t, n) => {
      exportJsonText.value = `⏳ ${i}/${t}: ${n}`;
    });
    syncBack(c);

    // (1) Sau upload vẫn còn ảnh chưa có URL server → chặn, không xuất blob.
    if (hasPendingUploads(c)) {
      exportJsonText.value = `❌ Upload thất bại ${r.fail} ảnh — chưa thể export vì còn ảnh dạng blob. Vui lòng thử export lại.`;
      showToast("error", `❌ ${r.fail} ảnh upload thất bại, chưa export`);
      return;
    }

    exportJsonText.value = JSON.stringify(buildJson(c), null, 2);
    if (r.up) showToast("success", `☁️ ${r.up} ảnh uploaded`);
  } catch (e) {
    exportJsonText.value = "❌ " + e.message;
    modals.export = true;
  }
}
function copyExportJSON() {
  navigator.clipboard.writeText(exportJsonText.value).then(() => showToast("success", "📋 Copied!"));
}
function downloadExportJSON() {
  const blob = new Blob([exportJsonText.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vr360-tour-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importJSON() {
  importJsonText.value = "";
  modals.import = true;
}
function doImportJSON() {
  try {
    const d = JSON.parse(importJsonText.value.trim());
    const sc = d.scenes || d;
    if (!Array.isArray(sc)) throw new Error("Invalid");
    const mapped = sc.map((s) => ({
      id: s.id || generateId(s.name || "scene"),
      name: s.name || "Scene",
      group: s.group || "Mặc định",
      image: s.image || "",
      thumb: s.thumb || s.image || "",
      exportUrl: s.image || "",
      _serverThumb: s.thumb || "",
      _file: null,
      _audioLocalUrl: "",
      _audioFileName: "",
      info: s.info || "",
      gps: s.gps || null,
      initialView: { lon: 0, lat: 0, fov: 75, ...(s.initialView || {}) },
      am_thanh_thuyet_minh: s.am_thanh_thuyet_minh
        ? { ...defaultNarration(), ...s.am_thanh_thuyet_minh }
        : defaultNarration(),
      hotspots: (s.hotspots || []).map((h) => ({
        lon: h.lon || 0,
        lat: h.lat || 0,
        label: h.label || "",
        target: h.target || "",
        type: h.type || "poi",
        icon: h.icon || null,
        loai_poi: h.loai_poi || null,
        // Giữ nguyên các trường bổ sung (không dựng UI riêng, chỉnh tay trong
        // JSON): chiều cao đường ghim địa danh + giới thiệu riêng của POI. Chỉ
        // thêm khi có để JSON gọn — tránh mất dữ liệu khi nạp lại vào builder.
        ...(h.chieu_cao_duong_ghim != null ? { chieu_cao_duong_ghim: h.chieu_cao_duong_ghim } : {}),
        ...(h.thong_tin_gioi_thieu ? { thong_tin_gioi_thieu: h.thong_tin_gioi_thieu } : {}),
        khi_dua_chuot_vao: {
          hien_thi_anh_thu_nho: h.khi_dua_chuot_vao?.hien_thi_anh_thu_nho || false,
          duong_dan_thumbnail: h.khi_dua_chuot_vao?.duong_dan_thumbnail || "",
          van_ban_huong_dan: h.khi_dua_chuot_vao?.van_ban_huong_dan || "",
        },
        entryView: h.entryView || null,
      })),
    }));
    scenes.splice(0, scenes.length, ...mapped);
    activeSceneIndex.value = -1;
    selectedHotspotIndex.value = -1;
    modals.import = false;
    if (scenes.length > 0) selectScene(0);
    showToast("success", `✅ ${scenes.length} scenes imported`);
  } catch (e) {
    showToast("error", "❌ " + e.message);
  }
}

function closeModal(name) {
  modals[name] = false;
}

// ══════════════════════════════════════
//  LIFECYCLE
// ══════════════════════════════════════
onMounted(() => {
  engine.value = new PreviewEngine(canvasRef.value, {
    onLoadingChange: (v) => {
      canvasLoading.value = v;
    },
    onHudChange: (h) => {
      hud.lon = h.lon;
      hud.lat = h.lat;
      hud.fov = h.fov;
    },
    onHotspotsUpdate: (eng) => updateHotspotOverlay(eng),
    onHotspotPlace: (lon, lat) => placeNewHotspot(lon, lat),
    onHotspotDblClick: (lon, lat) => placeNavHotspotQuick(lon, lat),
    onCancelPlacing: () => cancelPlacingHotspot(),
  });
  initApi();
});

onBeforeUnmount(() => {
  engine.value?.dispose();
  scenes.forEach((s) => {
    if (s.image?.startsWith("blob:")) URL.revokeObjectURL(s.image);
    if (s._audioLocalUrl?.startsWith("blob:")) URL.revokeObjectURL(s._audioLocalUrl);
  });
});
</script>

<template>
  <div class="vb-app">
    <div class="vb-topbar">
      <div class="vb-brand">VR360 BUILDER</div>
      <div class="vb-sep"></div>
      <button class="vb-btn" @click="addSceneFromFiles">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>
        Thêm ảnh
      </button>
      <button class="vb-btn" @click="importJSON">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        Import JSON
      </button>
      <div class="vb-resize-control" title="Ảnh panorama gốc thường rất nặng (50-70MB ở độ phân giải cao) — tự động giảm kích thước khi thêm vào tour">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
        <select v-model="resizePresetId" @change="applyResizePreset">
          <option v-for="p in RESIZE_PRESETS" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
      </div>
      <div class="vb-sep"></div>
      <button class="vb-btn" @click="loadFromServer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        Load Tour
      </button>
      <button class="vb-btn vb-btn-accent" @click="saveToServer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-8H7v8M7 3v5h8" /><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /></svg>
        Save Tour
      </button>
      <div class="vb-spacer"></div>
      <div class="vb-api-status" :class="{ connected: apiStatus === 'on' }" @click="openApiSettings">
        <div class="vb-api-dot" :class="apiStatus"></div>
        <span class="vb-api-label">{{ apiStatus === "on" ? api.baseUrl.replace(/^https?:\/\//, "") : apiStatus === "loading" ? "Đang kết nối..." : "Chưa kết nối" }}</span>
      </div>
      <div class="vb-sep"></div>
      <button class="vb-btn vb-btn-primary" @click="exportJSON">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
        Export JSON
      </button>
    </div>

    <div class="vb-center">
      <!-- CENTER: CANVAS -->
      <canvas ref="canvasRef" class="vb-canvas" :class="{ 'placing-hotspot': placingHotspot }"></canvas>
      <div class="vb-canvas-loading" :class="{ show: canvasLoading }">⏳ Đang tải ảnh...</div>
      <div class="vb-viewer-empty" v-show="scenes.length === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
        <p>Thêm ảnh panorama 360° để bắt đầu</p>
      </div>
      <div class="vb-crosshair-overlay" :class="{ active: placingHotspot }">
        <div class="vb-crosshair-msg">🎯 Click vào panorama để đặt hotspot — ESC để hủy</div>
      </div>
      <div class="vb-preview-banner" v-if="previewMode.active">
        <span>👁 Đang xem trước: <strong>{{ targetScene?.name }}</strong> — chỉnh góc nhìn rồi Lưu</span>
        <button class="vb-btn vb-btn-primary" @click="saveEntryView">💾 Lưu góc này</button>
        <button class="vb-btn" @click="returnFromPreview">✕ Hủy</button>
      </div>
      <div class="vb-viewer-overlay">
        <div class="vb-hud" v-show="activeSceneIndex >= 0">
          <div class="vb-hud-chip">LON <span>{{ hud.lon }}</span>°</div>
          <div class="vb-hud-chip">LAT <span>{{ hud.lat }}</span>°</div>
          <div class="vb-hud-chip">FOV <span>{{ hud.fov }}</span>°</div>
        </div>
      </div>
      <div ref="hotspotLayerRef" class="vb-hotspot-layer"></div>
    </div>

    <div class="vb-main">
      <!-- LEFT: SCENE LIST -->
      <div class="vb-left">
        <div class="vb-panel-header">
          <span class="vb-panel-title">Scenes</span>
          <span class="vb-scene-count">{{ scenes.length }}</span>
        </div>
        <div class="vb-scene-list">
          <div
            v-for="(s, i) in scenes"
            :key="s.id"
            class="vb-scene-card"
            :class="{ active: i === activeSceneIndex, dragover: dragOverIndex === i }"
            draggable="true"
            title="Kéo thả ảnh mới vào đây để thay ảnh (giữ nguyên hotspot)"
            @click="selectScene(i)"
            @dragstart="onDragStart(i)"
            @dragend="onDragEnd"
            @dragover.prevent="dragOverIndex = i"
            @dragleave="dragOverIndex = -1"
            @drop.prevent="onDrop(i, $event)"
          >
            <span class="vb-scene-num">{{ i + 1 }}</span>
            <span v-if="s.exportUrl" class="vb-scene-badge">☁</span>
            <div class="vb-scene-thumb"><img :src="s._serverThumb || s.thumb || s.image" alt="" loading="lazy" /></div>
            <div class="vb-scene-meta">
              <div class="vb-scene-name">{{ s.name }}</div>
              <div class="vb-scene-info">{{ s.hotspots.length }} hotspot · {{ s.group }}</div>
            </div>
            <button class="vb-scene-delete" @click.stop="removeScene(i)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </button>
          </div>
        </div>
        <div
          class="vb-add-area"
          :class="{ dragover: addAreaDragover }"
          @click="fileInputRef.click()"
          @dragover.prevent="addAreaDragover = true"
          @dragleave="addAreaDragover = false"
          @drop.prevent="onAddAreaDrop"
        >
          <input ref="fileInputRef" type="file" multiple accept="image/*" style="display: none" @change="handleFileInput" />
          <span v-if="resizingCount > 0">⏳ Đang xử lý {{ resizingCount }} ảnh...</span>
          <span v-else>+ Kéo thả hoặc click để thêm ảnh 360°</span>
        </div>
      </div>

      <!-- RIGHT: PROPERTIES -->
      <div class="vb-right">
        <div class="vb-right-scroll">
          <div v-if="!activeScene" class="vb-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            <p>Chọn một scene ở bên trái<br />để chỉnh sửa thuộc tính</p>
          </div>

          <template v-else>
            <div class="vb-prop-section">
              <div class="vb-prop-section-title">Scene Properties</div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Tên scene</label>
                <input class="vb-prop-input" :value="activeScene.name" @change="updateScene('name', $event.target.value)" />
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Ảnh</label>
                <div style="display: flex; gap: 8px; align-items: center">
                  <div class="vb-prop-thumb"><img :src="activeScene.thumb || activeScene.image" /></div>
                  <div style="flex: 1">
                    <button class="vb-prop-btn" style="padding: 6px" @click="replaceImage">Thay ảnh</button>
                    <span class="vb-prop-filename">{{
                      activeScene._file ? activeScene._file.name.substring(0, 30) : activeScene.exportUrl ? activeScene.exportUrl.split("/").pop().substring(0, 30) : "—"
                    }}</span>
                    <span v-if="activeScene._file" class="vb-prop-filesize">
                      <template v-if="activeScene._resized">{{ formatBytes(activeScene._originalSize) }} → <strong>{{ formatBytes(activeScene._resizedSize) }}</strong></template>
                      <template v-else>{{ formatBytes(activeScene._resizedSize) }}</template>
                    </span>
                  </div>
                </div>
                <input ref="replaceImageInputRef" type="file" accept="image/*" style="display: none" @change="handleReplaceImage" />
              </div>
              <div class="vb-prop-row-inline">
                <div class="vb-prop-row">
                  <label class="vb-prop-label">ID</label>
                  <input class="vb-prop-input vb-prop-input-mono" :value="activeScene.id" @change="updateScene('id', $event.target.value)" />
                </div>
                <div class="vb-prop-row">
                  <label class="vb-prop-label">Nhóm</label>
                  <input class="vb-prop-input" :value="activeScene.group" @change="updateScene('group', $event.target.value)" />
                </div>
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Mô tả</label>
                <textarea class="vb-prop-input" :value="activeScene.info" @change="updateScene('info', $event.target.value)"></textarea>
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">
                  URL
                  <span v-if="activeScene.exportUrl" style="color: #10b981">☁ Uploaded</span>
                  <span v-else style="color: var(--vb-text-dim)">Chưa upload</span>
                </label>
                <input class="vb-prop-input vb-prop-input-mono" :value="activeScene.exportUrl || ''" readonly />
              </div>
              <div class="vb-prop-row" style="margin-bottom: 0">
                <label class="vb-prop-label">GPS (từ ảnh gốc)</label>
                <div class="vb-gps-value">{{ activeScene.gps ? `📍 ${formatGps(activeScene.gps)}` : "— Ảnh không có dữ liệu GPS" }}</div>
              </div>
            </div>

            <div class="vb-prop-section">
              <div class="vb-prop-section-title">Góc nhìn</div>
              <div class="vb-prop-row-inline">
                <div class="vb-prop-row">
                  <label class="vb-prop-label">LON</label>
                  <input class="vb-prop-input vb-prop-input-mono" type="number" step="0.1" :value="activeScene.initialView.lon" @change="updateView('lon', +$event.target.value)" />
                </div>
                <div class="vb-prop-row">
                  <label class="vb-prop-label">LAT</label>
                  <input class="vb-prop-input vb-prop-input-mono" type="number" step="0.1" :value="activeScene.initialView.lat" @change="updateView('lat', +$event.target.value)" />
                </div>
                <div class="vb-prop-row">
                  <label class="vb-prop-label">FOV</label>
                  <input
                    class="vb-prop-input vb-prop-input-mono"
                    type="number"
                    step="1"
                    min="30"
                    max="120"
                    :value="activeScene.initialView.fov"
                    @change="updateView('fov', +$event.target.value)"
                  />
                </div>
              </div>
              <div class="vb-prop-row" style="margin-top: 4px">
                <button class="vb-prop-btn vb-prop-btn-primary" @click="saveCurrentView">Lưu góc nhìn hiện tại</button>
              </div>
            </div>

            <div class="vb-prop-section">
              <div class="vb-prop-section-title">Thuyết minh (audio)</div>
              <input ref="audioInputRef" type="file" accept="audio/*" style="display: none" @change="handleAudioFile" />
              <div class="vb-prop-row-inline" style="align-items: flex-end">
                <div class="vb-prop-row" style="flex: 0 0 auto; margin-bottom: 0">
                  <button class="vb-prop-btn vb-prop-btn-accent" @click="pickAudioFile">🎙 Chọn file audio</button>
                </div>
                <div class="vb-prop-row" style="flex: 1; margin-bottom: 0">
                  <label class="vb-prop-label">Thời lượng (giây)</label>
                  <input
                    class="vb-prop-input vb-prop-input-mono"
                    type="number"
                    min="0"
                    step="1"
                    :value="activeScene.am_thanh_thuyet_minh?.thoi_luong_giay || 0"
                    @change="updateNarration('thoi_luong_giay', +$event.target.value)"
                  />
                </div>
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Đường dẫn audio (URL — dùng khi xuất JSON)</label>
                <input
                  class="vb-prop-input vb-prop-input-mono"
                  placeholder="https://.../thuyet-minh.mp3"
                  :value="activeScene.am_thanh_thuyet_minh?.duong_dan_file_audio || ''"
                  @change="updateNarration('duong_dan_file_audio', $event.target.value)"
                />
                <span v-if="activeScene._audioFileName" class="vb-prop-filename">🎧 {{ activeScene._audioFileName }} — nghe thử cục bộ</span>
              </div>
              <div class="vb-prop-row" v-if="audioPreviewSrc">
                <audio class="vb-audio-player" controls :src="audioPreviewSrc"></audio>
              </div>
              <div class="vb-prop-row vb-hover-toggle-row">
                <label class="vb-prop-label vb-hover-toggle-label">
                  <input
                    type="checkbox"
                    :checked="!!activeScene.am_thanh_thuyet_minh?.tu_dong_phat"
                    @change="updateNarration('tu_dong_phat', $event.target.checked)"
                  />
                  Tự động phát khi mở cảnh
                </label>
              </div>
              <div class="vb-prop-row" v-if="audioPreviewSrc" style="margin-bottom: 0">
                <button class="vb-prop-btn vb-prop-btn-danger" @click="clearNarration">Xoá thuyết minh</button>
              </div>
            </div>

            <div class="vb-prop-section">
              <div class="vb-prop-section-title">Hotspots ({{ activeScene.hotspots.length }})</div>
              <div class="vb-prop-row">
                <button class="vb-prop-btn vb-prop-btn-accent" @click="startPlacingHotspot">+ Thêm hotspot</button>
              </div>
              <div class="vb-hs-list">
                <div v-if="activeScene.hotspots.length === 0" class="vb-hs-empty">Chưa có hotspot</div>
                <div
                  v-for="(h, i) in activeScene.hotspots"
                  :key="i"
                  class="vb-hs-card"
                  :class="{ selected: i === selectedHotspotIndex }"
                  @click="selectHotspot(i)"
                >
                  <div class="vb-hs-card-header">
                    <div class="vb-hs-card-title"><span class="vb-hs-idx">{{ i + 1 }}</span>{{ h.label || "Hotspot " + (i + 1) }}</div>
                    <button class="vb-hs-card-btn" @click.stop="removeHotspot(i)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div class="vb-hs-card-coords">lon:{{ h.lon }}° lat:{{ h.lat }}° → {{ h.target || "—" }} ({{ h.type }})</div>
                </div>
              </div>
            </div>

            <div class="vb-prop-section vb-hs-detail" v-if="selectedHotspot">
              <div class="vb-prop-section-title" style="color: var(--vb-warning)">Hotspot #{{ selectedHotspotIndex + 1 }}</div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Nhãn</label>
                <input class="vb-prop-input" :value="selectedHotspot.label" @change="updateHotspot('label', $event.target.value)" />
              </div>
              <div class="vb-prop-row-inline">
                <div class="vb-prop-row">
                  <label class="vb-prop-label">LON</label>
                  <input class="vb-prop-input vb-prop-input-mono" type="number" step="0.1" :value="selectedHotspot.lon" @change="updateHotspot('lon', +$event.target.value)" />
                </div>
                <div class="vb-prop-row">
                  <label class="vb-prop-label">LAT</label>
                  <input class="vb-prop-input vb-prop-input-mono" type="number" step="0.1" :value="selectedHotspot.lat" @change="updateHotspot('lat', +$event.target.value)" />
                </div>
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Phân loại POI</label>
                <select class="vb-prop-input" :value="selectedHotspot.loai_poi || ''" @change="updateHotspot('loai_poi', $event.target.value || null)">
                  <option value="">— Không phân loại —</option>
                  <option v-for="opt in poiTypeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
                </select>
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Loại</label>
                <select class="vb-prop-input" :value="selectedHotspot.type" @change="updateHotspot('type', $event.target.value)">
                  <option value="poi">📍 POI</option>
                  <option value="nav">➡️ NAV</option>
                </select>
              </div>
              <div class="vb-prop-row" v-if="selectedHotspot.type === 'nav' && !selectedHotspot.loai_poi">
                <label class="vb-prop-label">Icon chỉ đường</label>
                <select class="vb-prop-input" :value="selectedHotspot.icon || navIconDefault" @change="updateHotspot('icon', $event.target.value)">
                  <option v-for="opt in navIconOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
                </select>
              </div>
              <div class="vb-prop-row">
                <label class="vb-prop-label">Scene đích</label>
                <select class="vb-prop-input" :value="selectedHotspot.target" @change="updateHotspot('target', $event.target.value)">
                  <option value="">— Chọn —</option>
                  <option v-for="(sc, i) in scenes" :key="sc.id" :value="sc.id" :disabled="i === activeSceneIndex">{{ sc.name }}</option>
                </select>
              </div>

              <div class="vb-prop-row vb-hover-toggle-row">
                <label class="vb-prop-label vb-hover-toggle-label">
                  <input type="checkbox" :checked="!!selectedHotspot.khi_dua_chuot_vao?.hien_thi_anh_thu_nho" @change="updateHotspotHover('hien_thi_anh_thu_nho', $event.target.checked)" />
                  Hiện ảnh thu nhỏ khi hover
                </label>
              </div>
              <template v-if="selectedHotspot.khi_dua_chuot_vao?.hien_thi_anh_thu_nho">
                <div class="vb-prop-row">
                  <label class="vb-prop-label">Đường dẫn ảnh thumbnail</label>
                  <input
                    class="vb-prop-input vb-prop-input-mono"
                    placeholder="https://..."
                    :value="selectedHotspot.khi_dua_chuot_vao?.duong_dan_thumbnail"
                    @change="updateHotspotHover('duong_dan_thumbnail', $event.target.value)"
                  />
                </div>
                <div class="vb-prop-row">
                  <label class="vb-prop-label">Văn bản hướng dẫn</label>
                  <input
                    class="vb-prop-input"
                    placeholder="Bấm để đi vào Sân trung tâm"
                    :value="selectedHotspot.khi_dua_chuot_vao?.van_ban_huong_dan"
                    @change="updateHotspotHover('van_ban_huong_dan', $event.target.value)"
                  />
                </div>
              </template>

              <div v-if="targetScene" class="vb-target-preview">
                <div class="vb-target-preview-thumb"><img :src="targetScene.thumb || targetScene.image" /></div>
                <div class="vb-target-preview-meta">
                  <div class="vb-target-preview-name">{{ targetScene.name }}</div>
                  <div class="vb-target-preview-view">
                    {{ selectedHotspot.entryView ? `Góc đến tuỳ chỉnh: lon ${selectedHotspot.entryView.lon}° · lat ${selectedHotspot.entryView.lat}°` : "Góc đến: mặc định của scene" }}
                  </div>
                </div>
              </div>
              <div v-if="targetScene" class="vb-prop-row-inline" style="margin-top: 6px">
                <button class="vb-prop-btn" style="flex: 1" @click="previewTargetScene">👁 Xem trước & đặt góc đến</button>
                <button v-if="selectedHotspot.entryView" class="vb-prop-btn" style="flex: 0 0 auto; padding: 9px 10px" title="Xoá, dùng góc mặc định" @click="clearEntryView">↺</button>
              </div>

              <div class="vb-prop-row" style="margin-top: 8px">
                <button class="vb-prop-btn vb-prop-btn-danger" @click="removeHotspot(selectedHotspotIndex)">Xóa hotspot</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- MODALS -->
    <div class="vb-modal-overlay" :class="{ show: modals.export }">
      <div class="vb-modal">
        <div class="vb-modal-header">
          <h3>📦 Export TOUR_DATA</h3>
          <button class="vb-modal-close" @click="closeModal('export')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="vb-modal-body"><textarea class="vb-json-preview" readonly :value="exportJsonText"></textarea></div>
        <div class="vb-modal-footer">
          <button class="vb-btn" @click="closeModal('export')">Đóng</button>
          <button class="vb-btn" @click="downloadExportJSON">⬇ Tải file</button>
          <button class="vb-btn vb-btn-primary" @click="copyExportJSON">📋 Copy</button>
        </div>
      </div>
    </div>

    <div class="vb-modal-overlay" :class="{ show: modals.import }">
      <div class="vb-modal">
        <div class="vb-modal-header">
          <h3>📥 Import JSON</h3>
          <button class="vb-modal-close" @click="closeModal('import')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="vb-modal-body"><textarea class="vb-json-preview vb-json-editable" v-model="importJsonText" placeholder="Paste JSON..."></textarea></div>
        <div class="vb-modal-footer">
          <button class="vb-btn" @click="closeModal('import')">Hủy</button>
          <button class="vb-btn vb-btn-primary" @click="doImportJSON">Import</button>
        </div>
      </div>
    </div>

    <div class="vb-modal-overlay" :class="{ show: modals.api }">
      <div class="vb-modal" style="width: 480px">
        <div class="vb-modal-header">
          <h3>⚡ API Server</h3>
          <button class="vb-modal-close" @click="closeModal('api')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="vb-modal-body">
          <div style="margin-bottom: 14px">
            <label class="vb-prop-label">API Endpoint</label>
            <div style="display: flex; gap: 8px">
              <input class="vb-prop-input vb-prop-input-mono" v-model="apiUrlInput" placeholder="http://localhost:8360" style="flex: 1" />
              <button class="vb-btn" @click="testApiConnection">{{ apiTestBtnLoading ? "⏳..." : "🔌 Test" }}</button>
            </div>
          </div>
          <div v-if="apiTestResult.show" class="vb-api-test-result" :class="{ ok: apiTestResult.ok, err: !apiTestResult.ok }">{{ apiTestResult.msg }}</div>
        </div>
        <div class="vb-modal-footer">
          <button class="vb-btn" @click="closeModal('api')">Hủy</button>
          <button class="vb-btn vb-btn-primary" @click="saveApiSettings">💾 Lưu</button>
        </div>
      </div>
    </div>

    <div class="vb-modal-overlay" :class="{ show: modals.load }">
      <div class="vb-modal" style="width: 520px">
        <div class="vb-modal-header">
          <h3>📂 Chọn Tour</h3>
          <button class="vb-modal-close" @click="closeModal('load')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="vb-modal-body">
          <div v-if="loadModalLoading" class="vb-empty-state">⏳...</div>
          <div v-else-if="loadModalTours.length === 0" class="vb-empty-state">Chưa có tour</div>
          <template v-else>
            <div v-for="t in loadModalTours" :key="t.tour_id" class="vb-tour-row" @click="loadTourById(t.tour_id)">
              <div class="vb-tour-icon">🗺️</div>
              <div style="flex: 1; min-width: 0">
                <div style="font-size: 13px; font-weight: 500">{{ t.title || "Untitled" }}</div>
                <div class="vb-tour-meta">{{ t.scene_count }} scenes · {{ t.updated_at ? new Date(t.updated_at * 1000).toLocaleString("vi-VN") : "—" }}</div>
              </div>
            </div>
          </template>
        </div>
        <div class="vb-modal-footer"><button class="vb-btn" @click="closeModal('load')">Đóng</button></div>
      </div>
    </div>

    <div class="vb-toast" :class="[toastState.type, { show: toastState.show }]">{{ toastState.msg }}</div>
  </div>
</template>

<style scoped>
.vb-app {
  --vb-bg-0: #0c0c14;
  --vb-bg-1: #12121c;
  --vb-bg-2: #1a1a28;
  --vb-bg-3: #222234;
  --vb-bg-4: #2a2a40;
  --vb-border: rgba(255, 255, 255, 0.06);
  --vb-border-hover: rgba(255, 255, 255, 0.12);
  --vb-primary: #6c5ce7;
  --vb-primary-light: #a29bfe;
  --vb-primary-dim: rgba(108, 92, 231, 0.15);
  --vb-accent: #00cec9;
  --vb-accent-dim: rgba(0, 206, 201, 0.15);
  --vb-danger: #ff6b6b;
  --vb-danger-dim: rgba(255, 107, 107, 0.15);
  --vb-warning: #feca57;
  --vb-text: #e8e8f0;
  --vb-text-muted: rgba(232, 232, 240, 0.5);
  --vb-text-dim: rgba(232, 232, 240, 0.3);

  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: "Segoe UI", sans-serif;
  background: var(--vb-bg-0);
  color: var(--vb-text);
  font-size: 13px;
}
.vb-app * {
  box-sizing: border-box;
}

.vb-topbar {
  height: 48px;
  flex-shrink: 0;
  background: var(--vb-bg-1);
  border-bottom: 1px solid var(--vb-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  z-index: 100;
}
.vb-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.vb-brand {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, var(--vb-primary-light), var(--vb-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 16px;
  flex-shrink: 0;
}
.vb-sep {
  width: 1px;
  height: 24px;
  background: var(--vb-border);
  margin: 0 8px;
}
.vb-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--vb-border);
  background: var(--vb-bg-2);
  color: var(--vb-text-muted);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.vb-btn:hover {
  background: var(--vb-bg-3);
  color: var(--vb-text);
  border-color: var(--vb-border-hover);
}
.vb-btn-primary {
  background: var(--vb-primary);
  color: #fff;
  border-color: var(--vb-primary);
}
.vb-btn-primary:hover {
  background: var(--vb-primary-light);
}
.vb-btn-accent {
  background: var(--vb-accent-dim);
  color: var(--vb-accent);
  border-color: rgba(0, 206, 201, 0.3);
}
.vb-btn svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.vb-resize-control {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px;
  color: var(--vb-text-dim);
}
.vb-resize-control svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.vb-resize-control select {
  background: var(--vb-bg-2);
  color: var(--vb-text-muted);
  border: 1px solid var(--vb-border);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 11px;
  outline: none;
}
.vb-spacer {
  flex: 1;
}

/* LEFT PANEL */
.vb-left {
  width: 280px;
  flex-shrink: 0;
  background: var(--vb-bg-1);
  border-right: 1px solid var(--vb-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.vb-panel-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--vb-border);
  flex-shrink: 0;
}
.vb-panel-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--vb-text-muted);
}
.vb-scene-count {
  font-family: monospace;
  font-size: 11px;
  color: var(--vb-text-dim);
}
.vb-scene-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.vb-scene-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 4px;
  background: var(--vb-bg-2);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  position: relative;
}
.vb-scene-card:hover {
  background: var(--vb-bg-3);
  border-color: var(--vb-border-hover);
}
.vb-scene-card.active {
  border-color: var(--vb-primary);
  background: var(--vb-primary-dim);
}
.vb-scene-card.dragover {
  border-color: var(--vb-accent);
  border-style: dashed;
}
.vb-scene-thumb {
  width: 56px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--vb-bg-4);
  flex-shrink: 0;
}
.vb-scene-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-scene-meta {
  flex: 1;
  min-width: 0;
}
.vb-scene-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--vb-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vb-scene-info {
  font-size: 10px;
  color: var(--vb-text-dim);
  margin-top: 2px;
  font-family: monospace;
}
.vb-scene-num {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 9px;
  font-weight: 700;
  color: var(--vb-text-dim);
  background: var(--vb-bg-0);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: monospace;
}
.vb-scene-delete {
  opacity: 0;
  background: none;
  border: none;
  color: var(--vb-danger);
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.vb-scene-card:hover .vb-scene-delete {
  opacity: 1;
}
.vb-scene-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 8px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: #10b981;
  color: #fff;
}

.vb-add-area {
  margin: 8px;
  padding: 24px;
  text-align: center;
  border: 2px dashed var(--vb-border);
  border-radius: 8px;
  color: var(--vb-text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  flex-shrink: 0;
}
.vb-add-area:hover {
  border-color: var(--vb-primary);
  color: var(--vb-primary-light);
}
.vb-add-area.dragover {
  border-color: var(--vb-accent);
  background: var(--vb-accent-dim);
  color: var(--vb-accent);
}

/* CENTER */
.vb-center {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.vb-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  display: block;
}
.vb-canvas:active {
  cursor: grabbing;
}
.vb-canvas.placing-hotspot {
  cursor: crosshair !important;
}
.vb-viewer-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--vb-text-dim);
  z-index: 5;
}
.vb-viewer-empty svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}
.vb-crosshair-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 15;
  display: none;
}
.vb-crosshair-overlay.active {
  display: block;
}
.vb-crosshair-msg {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vb-accent);
  color: var(--vb-bg-0);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
}
.vb-preview-banner {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--vb-accent);
  color: var(--vb-text);
  padding: 8px 12px 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}
.vb-viewer-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}
.vb-hud {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}
.vb-hud-chip {
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 11px;
  color: var(--vb-text-muted);
  border: 1px solid var(--vb-border);
}
.vb-hud-chip span {
  color: var(--vb-accent);
  font-weight: 500;
}
.vb-hotspot-layer {
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
}
.vb-hotspot-layer :deep(.builder-hotspot) {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  will-change: transform;
}
.vb-hotspot-layer :deep(.builder-hotspot.hidden) {
  opacity: 0;
  pointer-events: none;
}
.vb-hotspot-layer :deep(.builder-hotspot.selected .bh-dot),
.vb-hotspot-layer :deep(.builder-hotspot.selected .bh-nav) {
  border-color: var(--vb-warning);
  box-shadow: 0 0 12px var(--vb-warning);
}
.vb-hotspot-layer :deep(.bh-dot) {
  width: 28px;
  height: 28px;
  background: var(--vb-primary);
  border: 3px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}
.vb-hotspot-layer :deep(.bh-nav) {
  width: 28px;
  height: 28px;
  background: var(--vb-accent);
  border: 3px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  color: #fff;
  transition: transform 0.15s;
}
.vb-hotspot-layer :deep(.bh-nav svg) {
  width: 16px;
  height: 16px;
}
.vb-hotspot-layer :deep(.bh-label) {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  margin-top: 4px;
}

.vb-canvas-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 6;
  color: var(--vb-accent);
  font-size: 12px;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 6px;
  display: none;
}
.vb-canvas-loading.show {
  display: block;
}

/* RIGHT PANEL */
.vb-right {
  width: 320px;
  flex-shrink: 0;
  background: var(--vb-bg-1);
  border-left: 1px solid var(--vb-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.vb-right-scroll {
  flex: 1;
  overflow-y: auto;
}
.vb-prop-section {
  border-bottom: 1px solid var(--vb-border);
  padding: 16px;
}
.vb-prop-section.vb-hs-detail {
  background: rgba(254, 202, 87, 0.03);
}
.vb-target-preview {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
  padding: 8px;
  background: var(--vb-bg-2);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
}
.vb-target-preview-thumb {
  width: 64px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--vb-bg-3);
  flex-shrink: 0;
}
.vb-target-preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-target-preview-meta {
  min-width: 0;
}
.vb-target-preview-name {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vb-target-preview-view {
  font-size: 10px;
  color: var(--vb-text-dim);
  font-family: monospace;
  margin-top: 2px;
}
.vb-hover-toggle-row {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--vb-border);
}
.vb-hover-toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--vb-text-muted);
}
.vb-prop-section-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--vb-text-dim);
  margin-bottom: 12px;
}
.vb-prop-row {
  margin-bottom: 10px;
}
.vb-prop-label {
  font-size: 11px;
  color: var(--vb-text-muted);
  margin-bottom: 4px;
  display: block;
}
.vb-prop-input {
  width: 100%;
  padding: 8px 10px;
  background: var(--vb-bg-2);
  border: 1px solid var(--vb-border);
  border-radius: 6px;
  color: var(--vb-text);
  font-size: 12px;
  outline: none;
}
.vb-prop-input:focus {
  border-color: var(--vb-primary);
}
.vb-prop-input-mono {
  font-family: monospace;
  font-size: 11px;
}
textarea.vb-prop-input {
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
}
.vb-prop-row-inline {
  display: flex;
  gap: 8px;
}
.vb-prop-row-inline .vb-prop-row {
  flex: 1;
  margin-bottom: 0;
}
.vb-prop-btn {
  width: 100%;
  padding: 9px;
  border: 1px solid var(--vb-border);
  background: var(--vb-bg-2);
  color: var(--vb-text-muted);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.vb-prop-btn:hover {
  background: var(--vb-bg-3);
  color: var(--vb-text);
}
.vb-prop-btn-primary {
  background: var(--vb-primary-dim);
  color: var(--vb-primary-light);
  border-color: var(--vb-primary);
}
.vb-prop-btn-primary:hover {
  background: var(--vb-primary);
  color: #fff;
}
.vb-prop-btn-accent {
  background: var(--vb-accent-dim);
  color: var(--vb-accent);
  border-color: rgba(0, 206, 201, 0.3);
}
.vb-prop-btn-danger {
  color: var(--vb-danger);
  border-color: rgba(255, 107, 107, 0.2);
}
.vb-prop-btn-danger:hover {
  background: var(--vb-danger-dim);
}
.vb-prop-thumb {
  width: 80px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--vb-bg-3);
  flex-shrink: 0;
  border: 1px solid var(--vb-border);
}
.vb-prop-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-prop-filename {
  font-size: 10px;
  color: var(--vb-text-dim);
  font-family: monospace;
  display: block;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vb-prop-filesize {
  font-size: 10px;
  color: var(--vb-accent);
  font-family: monospace;
  display: block;
  margin-top: 2px;
}
.vb-gps-value {
  font-size: 11px;
  color: var(--vb-text-muted);
  font-family: monospace;
}
.vb-audio-player {
  width: 100%;
  height: 34px;
  border-radius: 8px;
}

.vb-hs-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vb-hs-empty {
  text-align: center;
  color: var(--vb-text-dim);
  padding: 16px;
  font-size: 11px;
}
.vb-hs-card {
  padding: 10px;
  background: var(--vb-bg-2);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.vb-hs-card:hover {
  border-color: var(--vb-border-hover);
}
.vb-hs-card.selected {
  border-color: var(--vb-warning);
  background: rgba(254, 202, 87, 0.05);
}
.vb-hs-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.vb-hs-card-title {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.vb-hs-idx {
  background: var(--vb-primary-dim);
  color: var(--vb-primary-light);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
}
.vb-hs-card-btn {
  background: none;
  border: none;
  color: var(--vb-text-dim);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
}
.vb-hs-card-btn:hover {
  color: var(--vb-danger);
}
.vb-hs-card-coords {
  font-family: monospace;
  font-size: 10px;
  color: var(--vb-text-dim);
}

.vb-empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--vb-text-dim);
  font-size: 12px;
  line-height: 1.6;
}
.vb-empty-state svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  opacity: 0.3;
}

.vb-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  z-index: 9999;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}
.vb-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.vb-toast.success {
  background: #10b981;
  color: #fff;
}
.vb-toast.info {
  background: var(--vb-primary);
  color: #fff;
}
.vb-toast.error {
  background: var(--vb-danger);
  color: #fff;
}

.vb-api-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 8px;
  border: 1px solid var(--vb-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  background: var(--vb-bg-2);
  white-space: nowrap;
}
.vb-api-status:hover {
  background: var(--vb-bg-3);
}
.vb-api-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.vb-api-dot.off {
  background: var(--vb-text-dim);
}
.vb-api-dot.on {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}
.vb-api-dot.loading {
  background: var(--vb-warning);
}
.vb-api-label {
  color: var(--vb-text-muted);
}
.vb-api-status.connected .vb-api-label {
  color: #10b981;
}
.vb-api-test-result {
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
}
.vb-api-test-result.ok {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}
.vb-api-test-result.err {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
}

.vb-tour-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--vb-bg-2);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
}
.vb-tour-row:hover {
  border-color: var(--vb-primary);
}
.vb-tour-icon {
  width: 40px;
  height: 40px;
  background: var(--vb-primary-dim);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.vb-tour-meta {
  font-size: 10px;
  color: var(--vb-text-dim);
  font-family: monospace;
  margin-top: 2px;
}

.vb-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.6);
  display: none;
  align-items: center;
  justify-content: center;
}
.vb-modal-overlay.show {
  display: flex;
}
.vb-modal {
  background: var(--vb-bg-1);
  border: 1px solid var(--vb-border);
  border-radius: 12px;
  width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.vb-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vb-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vb-modal-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}
.vb-modal-close {
  background: none;
  border: none;
  color: var(--vb-text-muted);
  cursor: pointer;
  padding: 4px;
}
.vb-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.vb-modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--vb-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.vb-json-preview {
  width: 100%;
  min-height: 300px;
  max-height: 50vh;
  background: var(--vb-bg-0);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
  padding: 14px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--vb-accent);
  resize: vertical;
  outline: none;
}
.vb-json-editable {
  color: var(--vb-text);
}
</style>
