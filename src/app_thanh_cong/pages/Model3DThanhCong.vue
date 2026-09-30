<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Map as MaplibreMap } from "maplibre-gl";
import * as THREE from "three";
import "maplibre-gl/dist/maplibre-gl.css";
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import { getThanhCongData } from "../common/thanhCongData.js";
import { createModel3dLayer } from "@/model_3d-maplibre";
import SiteDetailPanel from "../components/SiteDetailPanel.vue";
import rawModelsConfig from "../@data/models-config.json";

// ── Scene 3D thật (đình + đền Đan Hà + cây cối sân vườn xung quanh) ──
// Xuất từ trình biên tập 3D nguồn: https://github.com/hienpkam05/3D
// (models-config.json) — TOÀN BỘ model trong file này thuộc CÙNG 1 cảnh,
// định vị bằng position/rotation/scale cục bộ quanh 1 gốc toạ độ chung
// (KHÁC bản trước: 2 layer riêng biệt mỗi site 1 origin). Toạ độ gốc lấy
// nguyên từ mã nguồn gốc (MAP_CENTER trong js/app1.js của repo trên) —
// trùng khớp chính xác với toạ độ thật của site "dan-ha-dinh" trong
// thanhCongData.js, xác nhận đây đúng là điểm neo địa lý của cảnh.
//
// 2 model "chính" (id trong file config) ứng với 2 di tích thật — bấm
// vào sẽ mở panel; các model "decoration" còn lại (cây cối) chỉ để trang
// trí, bấm vào không có tác dụng gì (giống bấm vùng trống bản đồ).
const SITE_ID_BY_CONFIG_ID = {
  "dinh-dan-ha": "dan-ha-dinh",
  "den-dan-ha-1787815852618": "dan-ha-den",
};

// 2 GLB chính đã có sẵn trong dự án (app_thanh_cong/@data/object_file) —
// dùng lại thay vì tải lại, dù models-config.json trỏ path khác (đường
// dẫn nội bộ của repo nguồn, không tồn tại ở đây).
const MAIN_GLB_BY_CONFIG_ID = {
  "dinh-dan-ha": new URL("../@data/object_file/Dinh_Dan_Ha.glb", import.meta.url).href,
  "den-dan-ha-1787815852618": new URL("../@data/object_file/Den_Dan_Ha.glb", import.meta.url).href,
};

// Cây cối trang trí — 12 file GLB dùng chung (mỗi file lặp lại ở nhiều vị
// trí khác nhau trong cảnh), tải về từ assets-3d/libs/ của repo nguồn vào
// app_thanh_cong/@data/object_file/decor/. Khoá theo ĐÚNG tên file lấy từ
// trường "path" của từng model trong models-config.json.
const DECOR_GLB_BY_FILENAME = {
  "cay-van-tue.glb": new URL("../@data/object_file/decor/cay-van-tue.glb", import.meta.url).href,
  "cay-cau-vua.glb": new URL("../@data/object_file/decor/cay-cau-vua.glb", import.meta.url).href,
  "cay-thong.glb": new URL("../@data/object_file/decor/cay-thong.glb", import.meta.url).href,
  "cay-bong-mat-12m.glb": new URL("../@data/object_file/decor/cay-bong-mat-12m.glb", import.meta.url).href,
  "cay-bong-mat.glb": new URL("../@data/object_file/decor/cay-bong-mat.glb", import.meta.url).href,
  "cay-cau-bung.glb": new URL("../@data/object_file/decor/cay-cau-bung.glb", import.meta.url).href,
  "cay-xanh-cong-vien-20m.glb": new URL("../@data/object_file/decor/cay-xanh-cong-vien-20m.glb", import.meta.url).href,
  "cay-tung-dang-long.glb": new URL("../@data/object_file/decor/cay-tung-dang-long.glb", import.meta.url).href,
  "cay-da-02.glb": new URL("../@data/object_file/decor/cay-da-02.glb", import.meta.url).href,
  "cay-tung-1.glb": new URL("../@data/object_file/decor/cay-tung-1.glb", import.meta.url).href,
  "cay-dau-co-thu-04-3.glb": new URL("../@data/object_file/decor/cay-dau-co-thu-04-3.glb", import.meta.url).href,
  "cay-dau-co-thu-05-3.glb": new URL("../@data/object_file/decor/cay-dau-co-thu-05-3.glb", import.meta.url).href,
};

function resolveModelPath(m) {
  if (MAIN_GLB_BY_CONFIG_ID[m.id]) return MAIN_GLB_BY_CONFIG_ID[m.id];
  const filename = String(m.path || "").split("/").pop();
  return DECOR_GLB_BY_FILENAME[filename] || null;
}

// Giữ nguyên id/position/rotation/scale thật từ file config (không tự
// suy diễn) — chỉ thay "path" bằng URL asset cục bộ đã resolve; model nào
// không resolve được path thì bỏ qua (báo console.warn) thay vì phá cảnh.
const sceneModels = rawModelsConfig.models
  .filter((m) => !m.disabled)
  .map((m) => ({ ...m, path: resolveModelPath(m) }))
  .filter((m) => {
    if (!m.path) { console.warn("[Model3DThanhCong] Không resolve được path cho model:", m.id); return false; }
    return true;
  });

const is3d = true;
const { t, lang, route, router } = useThanhCongShared();
const D = computed(() => getThanhCongData());

// Gốc toạ độ địa lý của cả cảnh — trùng site "dan-ha-dinh" thật (xem giải
// thích ở đầu file); fallback về đúng giá trị hardcode trong mã nguồn gốc
// nếu vì lý do gì đó không tìm thấy site (phòng hờ, không nên xảy ra).
// LƯU Ý: đây là điểm NEO các model (origin của layer), khác với "mapView"
// bên dưới — góc CAMERA nhìn vào cảnh lúc mở trang.
const sceneOrigin = D.value.sites.find((s) => s.id === "dan-ha-dinh")?.ll || [105.807406, 21.402464];
const BOUNDS_PADDING = 0.0012; // ~130m quanh gốc — khớp mã nguồn gốc

// Khung nhìn RỘNG NHẤT được phép, canh tay tại thực tế rồi lấy từ tham số
// ?camera= của chính trang này: 21.402533,105.807323,20.58,-42.3,78.5,r,0.
// Người xem chỉ được phóng to thêm, không thu nhỏ quá mức này (cảnh 3D luôn
// choán khung, không lùi ra thấy nền trống xung quanh).
const MIN_ZOOM = 20.58;

// Góc nhìn camera đã lưu sẵn trong models-config.json (xuất từ trình biên
// tập 3D — đúng khung hình đẹp nhất mà người biên soạn cảnh đã canh sẵn,
// gồm cả bearing xoay chéo) — dùng làm view ban đầu VÀ view khi bấm "Reset
// view", thay vì tự đoán zoom/pitch/bearing. Fallback về góc nhìn thẳng
// (bearing 0) từ sceneOrigin nếu file config phiên bản cũ chưa có mapView.
const initialView = rawModelsConfig.mapView
  ? {
      center: [rawModelsConfig.mapView.center.lng, rawModelsConfig.mapView.center.lat],
      zoom: rawModelsConfig.mapView.zoom,
      pitch: rawModelsConfig.mapView.pitch,
      bearing: rawModelsConfig.mapView.bearing,
    }
  : { center: sceneOrigin, zoom: 19, pitch: 60, bearing: 0 };

// ---- Đọc/ghi góc nhìn camera qua query "?camera=lat,lng,zoom,bearing,
// pitch,r,0" — để lấy thông tin view hiện tại hoặc chia sẻ link dễ dàng.
// "r,0" là hậu tố cố định (chỗ dành cho roadmap sau này), không đọc/ghi
// động. Chỉ override VIEW LÚC MỞ TRANG — nút "Reset view" vẫn luôn quay
// về initialView (góc nhìn mặc định của cảnh), không phải camera từ URL. ----
function parseCameraQuery(raw) {
  if (!raw) return null;
  const parts = String(raw).split(",");
  if (parts.length < 5) return null;
  const [lat, lng, zoom, bearing, pitch] = parts.slice(0, 5).map(Number);
  if (![lat, lng, zoom, bearing, pitch].every(Number.isFinite)) return null;
  return { center: [lng, lat], zoom, bearing, pitch };
}
const startView = parseCameraQuery(route.query.camera) || initialView;

function syncCameraToQuery() {
  if (!map) return;
  const c = map.getCenter();
  const camera = [
    c.lat.toFixed(6),
    c.lng.toFixed(6),
    map.getZoom().toFixed(2),
    map.getBearing().toFixed(1),
    map.getPitch().toFixed(1),
    "r",
    "0",
  ].join(",");
  router.replace({ query: { ...route.query, camera } });
}

// ---- Panel chi tiết bên phải — cùng cấu trúc khung với MapThanhCong.vue
// (off-canvas trượt vào/ra), CHỈ mở khi bấm trúng 1 model chính trên bản đồ. ----
const selectedSiteId = ref(null);
const rightOpen = ref(false);
function closeRight() {
  rightOpen.value = false;
}

// ---- Toàn màn hình — cùng cơ chế với MapThanhCong.vue (Fullscreen API trên
// khung ngoài chứa map + controls + panel), kèm map.resize() sau khi đổi kích
// thước vì canvas MapLibre không tự bắt sự kiện resize của trình duyệt. ----
const mapWrapEl = ref(null);
let fsBound = false;
function toggleFullscreen() {
  const el = mapWrapEl.value;
  if (!el) return;
  if (document.fullscreenElement) {
    document.exitFullscreen && document.exitFullscreen();
  } else {
    (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  MapLibre + 1 layer 3D duy nhất (từ package @/model_3d-maplibre) chứa
//  TOÀN BỘ cảnh (2 di tích + cây cối) — cùng 1 origin nên gộp được 1 layer.
//  Nền map: vector (openfreemap positron — sạch, làm nổi model 3D) hoặc
//  raster satellite (Esri World Imagery — bối cảnh thật). Toggle nút góc
//  phải-trên map. Khi setStyle, MapLibre xoá layer custom → re-add.
// ══════════════════════════════════════════════════════════════════════
const mapContainer = ref(null);
let map = null;
const baseMode = ref("vector"); // "vector" | "sat"
// Giữ tham chiếu TRỰC TIẾP tới object layer (không qua map.getLayer, vì
// custom layer không được MapLibre trả lại nguyên vẹn) để dùng
// .scene/.camera nội bộ khi tự dò tia click (raycast) — thư viện
// model_3d-maplibre không có API bắt click sẵn.
let modelLayer = null;

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/positron";
const SAT_STYLE = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    sat: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Imagery © Esri",
    },
  },
  layers: [{ id: "sat", type: "raster", source: "sat" }],
};

function currentStyle() {
  return baseMode.value === "vector" ? VECTOR_STYLE : SAT_STYLE;
}

const baseTabs = computed(() => [
  { id: "vector", label: lang.value === "vi" ? "Vector" : "Vector" },
  { id: "sat", label: lang.value === "vi" ? "Vệ tinh" : "Satellite" },
]);

function addModelLayer() {
  if (!map) return;
  modelLayer = createModel3dLayer({
    id: "site-3d-scene",
    origin: sceneOrigin,
    altitude: 0,
    modelsConfig: { models: sceneModels },
  });
  map.addLayer(modelLayer);
}
function removeModelLayer() {
  if (!map || !modelLayer) return;
  if (map.getLayer(modelLayer.id)) map.removeLayer(modelLayer.id);
  modelLayer = null;
}

function flyToScene(animate) {
  if (!map) return;
  map.flyTo({ ...initialView, duration: animate ? 700 : 0 });
}

// ---- Raycast thủ công ----
// Camera của layer (xem model_3d-maplibre/createModel3dLayer.js) là 1
// THREE.Camera "trần" (không phải PerspectiveCamera) có projectionMatrix
// gán tay mỗi frame — Raycaster.setFromCamera() không nhận diện được loại
// camera này (chỉ hỗ trợ isPerspectiveCamera/isOrthographicCamera) nên
// phải tự unproject bằng tay, và tự cập nhật projectionMatrixInverse (lớp
// gốc KHÔNG tự đồng bộ giá trị này khi projectionMatrix bị gán trực tiếp).
const raycaster = new THREE.Raycaster();
function pickSiteAt(point) {
  if (!map || !modelLayer) return null;
  const cam = modelLayer.camera;
  if (!cam || !modelLayer.scene) return null;
  const canvas = map.getCanvas();
  // point (MapLibre MapMouseEvent) tính bằng CSS px — PHẢI chia cho
  // clientWidth/clientHeight (kích thước CSS), KHÔNG phải canvas.width/
  // height (kích thước buffer thật, đã nhân devicePixelRatio). Sai chỗ
  // này khiến tia lệch hẳn trên mọi máy có DPR khác 1 (hầu hết điện
  // thoại/màn Retina) — bấm đúng model vẫn không ra tia trúng.
  const ndcX = (point.x / canvas.clientWidth) * 2 - 1;
  const ndcY = -(point.y / canvas.clientHeight) * 2 + 1;
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  // Camera này KHÔNG có "vị trí" theo nghĩa thông thường (projectionMatrix
  // gộp thẳng local-space → clip-space, không tách view/projection) nên
  // (0,0,0) không phải điểm hợp lệ trên tia nhìn. Cách đúng: unproject 2
  // điểm ở 2 độ sâu NDC khác nhau (near/far) rồi nối lại thành tia — luôn
  // đúng với MỌI ma trận chiếu, không cần biết "vị trí camera".
  const near = new THREE.Vector3(ndcX, ndcY, -1).unproject(cam);
  const far = new THREE.Vector3(ndcX, ndcY, 1).unproject(cam);
  raycaster.set(near, far.sub(near).normalize());
  // scene chứa NHIỀU model (2 di tích + cây cối) — lấy vật thể GẦN CAMERA
  // NHẤT (hits đã sắp theo distance tăng dần), rồi truy ngược .parent lên
  // tới group cấp cao nhất (group.name = id trong models-config.json) để
  // biết bấm trúng model nào.
  const hits = raycaster.intersectObjects(modelLayer.scene.children, true);
  if (!hits.length) return null;
  let node = hits[0].object;
  while (node && node.parent !== modelLayer.scene) node = node.parent;
  return SITE_ID_BY_CONFIG_ID[node?.name] || null;
}
function onMapClick(e) {
  const siteId = pickSiteAt(e.point);
  if (siteId) {
    selectedSiteId.value = siteId;
    rightOpen.value = true;
  }
}

onMounted(() => {
  map = new MaplibreMap({
    container: mapContainer.value,
    style: currentStyle(),
    ...startView,
    maxPitch: 80,
    maxBounds: [
      [sceneOrigin[0] - BOUNDS_PADDING, sceneOrigin[1] - BOUNDS_PADDING],
      [sceneOrigin[0] + BOUNDS_PADDING, sceneOrigin[1] + BOUNDS_PADDING],
    ],
    minZoom: MIN_ZOOM,
    maxZoom: 23,
    attributionControl: false,
    canvasContextAttributes: { antialias: true },
  });
  map.on("error", () => {});
  map.on("style.load", addModelLayer);
  map.on("click", onMapClick);
  map.on("moveend", syncCameraToQuery);

  if (mapWrapEl.value && !fsBound) {
    fsBound = true;
    document.addEventListener("fullscreenchange", () => {
      for (const d of [120, 360, 620]) setTimeout(() => { if (map) map.resize(); }, d);
    });
  }
});

watch(baseMode, () => {
  if (!map) return;
  map.setStyle(currentStyle());
  // setStyle xoá custom layer → chờ style load rồi add lại
  map.once("style.load", addModelLayer);
});

onBeforeUnmount(() => {
  if (!map) return;
  map.off("click", onMapClick);
  removeModelLayer();
  map.remove();
  map = null;
});

const zoomIn = () => map?.zoomIn();
const zoomOut = () => map?.zoomOut();
const resetView = () => flyToScene(true);
</script>

<template>
  <template v-if="is3d">
    <!-- Khung bản đồ nằm trong container 1180px của layout chuẩn (Header +
         Footer), cùng bề ngang với các trang nội dung khác. -->
    <main class="d3-stage">
      <div ref="mapWrapEl" class="d3-map-wrap">
      <div ref="mapContainer" style="position: absolute; inset: 0"></div>

        <!-- Toggle nền vector / vệ tinh (góc phải trên) — TẠM ẨN chế độ
             vệ tinh theo yêu cầu; bật lại bằng cách xoá v-if="false". -->
        <div
          v-if="false"
          style="
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 6;
            display: inline-flex;
            gap: 2px;
            padding: 3px;
            background: rgba(23, 37, 48, 0.78);
            border: 1px solid rgba(231, 197, 107, 0.4);
            border-radius: 999px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          "
        >
          <template v-for="b in baseTabs" :key="b.id">
            <button
              type="button"
              @click="baseMode = b.id"
              :style="`background:${
                baseMode === b.id ? '#E7C56B' : 'transparent'
              };color:${
                baseMode === b.id ? '#22323F' : 'rgba(246,236,215,.85)'
              };border:none;padding:5px 12px;font-family:'Roboto Condensed',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;border-radius:999px;cursor:pointer;transition:background .18s, color .18s`"
            >
              {{ b.label }}
            </button>
          </template>
        </div>

        <!-- Gợi ý bấm vào mô hình (góc trái trên) -->
        <div v-if="t.d3ClickHint"
          style="
            position: absolute;
            top: 14px;
            left: 14px;
            z-index: 5;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(23, 37, 48, 0.78);
            color: rgba(246, 236, 215, 0.9);
            border: 1px solid rgba(231, 197, 107, 0.4);
            border-radius: 7px;
            padding: 8px 13px;
            font-family: 'Roboto Condensed', sans-serif;
            font-size: 12px;
            pointer-events: none;
          "
        >
          <span style="color: #e7c56b"></span>{{ t.d3ClickHint }}
        </div>

        <!-- Toàn màn hình (góc phải trên) -->
        <button
          type="button"
          @click="toggleFullscreen"
          :title="t.mapFullscreen"
          style="
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 6;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(23, 37, 48, 0.78);
            color: #e7c56b;
            border: 1px solid rgba(231, 197, 107, 0.4);
            border-radius: 6px;
            font-size: 18px;
            cursor: pointer;
          "
        >
          ⛶
        </button>

        <!-- Viewer controls (nối tới map) -->
        <div
          style="
            position: absolute;
            bottom: 14px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 6;
          "
        >
          <button
            type="button"
            @click="zoomIn"
            title="Zoom in"
            style="
              background: rgba(23, 37, 48, 0.78);
              color: #e7c56b;
              border: 1px solid rgba(231, 197, 107, 0.4);
              border-radius: 6px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              cursor: pointer;
            "
          >
            ＋
          </button>
          <button
            type="button"
            @click="zoomOut"
            title="Zoom out"
            style="
              background: rgba(23, 37, 48, 0.78);
              color: #e7c56b;
              border: 1px solid rgba(231, 197, 107, 0.4);
              border-radius: 6px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              cursor: pointer;
            "
          >
            －
          </button>
          <button
            type="button"
            @click="resetView"
            title="Reset view"
            style="
              background: rgba(23, 37, 48, 0.78);
              color: #e7c56b;
              border: 1px solid rgba(231, 197, 107, 0.4);
              border-radius: 6px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              cursor: pointer;
            "
          >
            ⟳
          </button>
        </div>

        <!-- RIGHT off-canvas: detail — mở khi bấm trúng 1 model -->
        <aside
          :style="`position:absolute;top:0;right:0;bottom:0;width:clamp(280px,86vw,360px);background:rgba(251,245,232,.98);border-left:1px solid #E0D0AE;box-shadow:-6px 0 26px rgba(90,70,40,.18);z-index:12;transform:${rightOpen ? 'translateX(0)' : 'translateX(115%)'};transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow:hidden;backdrop-filter:blur(2px)`"
        >
          <button
            @click="closeRight"
            :title="t.mapClose"
            style="
              position: absolute;
              top: 12px;
              right: 12px;
              z-index: 3;
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: rgba(239, 226, 199, 0.95);
              border: none;
              color: #7a6340;
              font-size: 17px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            class="hv4"
          >
            ✕
          </button>
          <div style="overflow-y: auto; flex: 1">
            <SiteDetailPanel v-if="selectedSiteId" :site-id="selectedSiteId" :show-model3d-button="false" />
          </div>
        </aside>
      </div>
    </main>
  </template>
</template>

<style scoped>
/* Cùng bề ngang + padding với các section nội dung của trang chủ. */
.d3-stage {
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 28px) clamp(16px, 4vw, 40px);
}
.d3-map-wrap {
  position: relative;
  width: 100%;
  height: 78vh;
  min-height: 460px;
  max-height: 860px;
  overflow: hidden;
  border-radius: 12px;
  border: 3px solid #2c4a5e;
  background: #22323f;
}
/* Khi bấm nút toàn màn hình, bỏ khung/bo góc và cho chiếm trọn màn hình —
   chiều cao 78vh ở trên nếu giữ nguyên sẽ chừa một dải đen phía dưới. */
.d3-map-wrap:fullscreen {
  height: 100%;
  max-height: none;
  border: none;
  border-radius: 0;
}
.hv4:hover {
  background: #e2d2b0;
}
/* Ẩn hẳn góc phải-dưới của MapLibre (kể cả container rỗng khi tắt AttributionControl
   thì Maplibre vẫn dựng div .maplibregl-ctrl-bottom-right) */
:deep(.maplibregl-ctrl-bottom-right) {
  display: none !important;
}
</style>
