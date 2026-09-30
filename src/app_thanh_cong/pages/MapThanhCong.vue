<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from "vue";
import { Map as MaplibreMap, Marker, NavigationControl, AttributionControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import { getThanhCongData } from "../common/thanhCongData.js";
import boundaryGeo from "../assets/boundary.json";
import logoUrl from "../assets/logo-thai-nguyen.png";
import Image from "@/base/components/image/Image.vue";
import SiteDetailPanel from "../components/SiteDetailPanel.vue";

const isMap = true;
const { t, lang, route, openDetail, openVr, open3d, highlightMajorSites } = useThanhCongShared();
const D = getThanhCongData();
const L = (o) => o[lang.value];

// ---- reactive UI state cho màn Bản đồ (thay cho this.state ở bản gốc) ----
const layers = reactive({
  ditich: true, dulich: true, lehoi: true, tuyen: true, proads: true, tienich: false,
});
const activeTour = ref(null);
const baseMode = ref("hybrid");
const terrain3d = ref(false);
const selected = ref(null);
const mapLeftOpen = ref(true);
const mapRightOpen = ref(false);

// ---- template refs cho vùng chứa bản đồ (thay cho setMapWrap/setMapEl callback) ----
const mapWrapEl = ref(null);
const mapEl = ref(null);

// ---- các biến nội bộ của MapLibre — không cần reactive (giống this.map, this.markers…) ----
let map = null;
let markers = [];
let pollSetup = null;
let setupDone = false;
let labelZoomBound = false;
let mapMoving = false;
let arrowRAF = null;
let phase = 0;
let tourGeom = {};
let fsBound = false;

function buildStyle() {
  return {
    version: 8,
    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    sources: {
      // maxzoom thấp hơn giới hạn kỹ thuật (19) vì ảnh vệ tinh Esri ở khu vực này chỉ có
      // độ phân giải thật tới ~18; zoom sát hơn Esri trả tile "Map data not yet available".
      // Hạ maxzoom để MapLibre tự phóng to tile cuối thay vì fetch tile placeholder đó.
      sat: { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, maxzoom: 18, attribution: "Imagery © Esri" },
      osm: { type: "raster", tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap" },
      ref: { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, maxzoom: 19 },
      dem: { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], tileSize: 256, encoding: "terrarium", maxzoom: 14 },
    },
    layers: [
      { id: "osm", type: "raster", source: "osm", layout: { visibility: "none" } },
      { id: "sat", type: "raster", source: "sat", layout: { visibility: "visible" } },
      { id: "ref", type: "raster", source: "ref", layout: { visibility: "visible" } },
      { id: "hillshade", type: "hillshade", source: "dem", layout: { visibility: "none" }, paint: { "hillshade-shadow-color": "#5a4a36", "hillshade-exaggeration": 0.5 } },
    ],
  };
}

function initMap() {
  if (map || !mapEl.value) return;
  map = new MaplibreMap({
    container: mapEl.value, style: buildStyle(),
    center: [105.762, 21.388], zoom: 12.3, pitch: 0, bearing: 0,
    minZoom: 11.5, maxZoom: 20, maxPitch: 80, attributionControl: false,
  });
  map.on("error", () => {}); // bỏ qua lỗi tile/network tạm thời
  setupDone = false;
  const trySetup = () => {
    if (setupDone || !map) return;
    try {
      onMapLoad();
      setupDone = true;
      if (pollSetup) clearInterval(pollSetup);
    } catch (e) {
      /* style chưa parse xong — thử lại ở event/tick kế tiếp */
    }
  };
  map.on("style.load", trySetup);
  map.on("styledata", trySetup);
  map.on("load", trySetup);
  pollSetup = setInterval(trySetup, 200);
  try {
    map.addControl(new NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-left");
  } catch (e) { /* ignore */ }
}

function onMapLoad() {
  if (!map) return;
  if (!map.getSource("tour-" + D.tours[0].id)) setupRoutes();
  if (!map.getSource("boundary")) addBoundary();
  applyBase();
  applyTerrain();
  syncMarkers();
  if (!labelZoomBound) {
    labelZoomBound = true;
    map.on("zoom", () => updateLabels());
    const pause = () => { mapMoving = true; };
    const resume = () => { mapMoving = false; };
    map.on("movestart", pause); map.on("move", pause); map.on("zoomstart", pause);
    map.on("moveend", resume); map.on("zoomend", resume); map.on("idle", resume);
  }
  updateLabels();
  focusSiteFromQuery();
}

function addBoundary() {
  if (!map || map.getSource("boundary")) return;
  const gj = boundaryGeo;
  map.addSource("boundary", { type: "geojson", data: gj });
  // mask: làm mờ mọi thứ NGOÀI ranh giới xã (vòng world với các đa giác xã là lỗ)
  const holes = [];
  (gj.features || []).forEach((f) => {
    const g = f.geometry; if (!g) return;
    if (g.type === "Polygon") holes.push(g.coordinates[0]);
    else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => holes.push(p[0]));
  });
  const mask = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ...holes] } };
  map.addSource("boundary-mask", { type: "geojson", data: mask });
  map.addLayer({ id: "boundary-mask-fill", type: "fill", source: "boundary-mask", paint: { "fill-color": "#F4EAD6", "fill-opacity": 0.95 } });
  map.addLayer({ id: "boundary-fill", type: "fill", source: "boundary", paint: { "fill-color": "#9E3B2E", "fill-opacity": 0.05 } });
  map.addLayer({ id: "boundary-line", type: "line", source: "boundary", paint: { "line-color": "#7C2B21", "line-width": 5, "line-opacity": 0.95 } });
  map.addLayer({ id: "boundary-line-glow", type: "line", source: "boundary", paint: { "line-color": "#E7C56B", "line-width": 1.5, "line-opacity": 0.7 } });
  // giữ đường & tuyến tham quan nổi trên lớp mask ranh giới
  const top = [];
  D.proads.forEach((r) => ["-case", "-fill", "-label"].forEach((s) => top.push("proad-" + r.id + s)));
  D.tours.forEach((tr) => ["-case", "-base", "-arrows-lyr"].forEach((s) => top.push("tour-" + tr.id + s)));
  top.forEach((id) => { if (map.getLayer(id)) { try { map.moveLayer(id); } catch (e) { /* ignore */ } } });
  const b = boundsOf(gj); if (b) map.fitBounds(b, { padding: 40, duration: 0 });
}

function updateLabels() {
  const z = map && map.getZoom ? map.getZoom() : 14;
  const show = z >= 13.2;
  document.querySelectorAll("[data-site-label]").forEach((e) => { e.style.display = show ? "block" : "none"; });
}

function boundsOf(gj) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90, found = false;
  const walk = (c) => {
    if (typeof c[0] === "number") { const x = c[0], y = c[1]; if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; found = true; }
    else c.forEach(walk);
  };
  (gj.features || []).forEach((f) => f.geometry && walk(f.geometry.coordinates));
  return found ? [[minX, minY], [maxX, maxY]] : null;
}

function applyBase() {
  if (!map) return;
  const m = baseMode.value;
  const set = (id, v) => { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v ? "visible" : "none"); };
  set("sat", m === "satellite" || m === "hybrid");
  set("osm", m === "giaothong");
  set("ref", m === "hybrid");
}

function applyTerrain() {
  if (!map) return;
  if (!map.isStyleLoaded()) { map.once("idle", () => applyTerrain()); return; }
  if (terrain3d.value) {
    map.setTerrain({ source: "dem", exaggeration: 1.5 });
    if (map.getLayer("hillshade")) map.setLayoutProperty("hillshade", "visibility", "visible");
    map.easeTo({ pitch: 62, bearing: -18, duration: 700 });
  } else {
    map.setTerrain(null);
    if (map.getLayer("hillshade")) map.setLayoutProperty("hillshade", "visibility", "none");
    map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
  }
}

function setupRoutes() {
  if (!map) return;
  addArrowImage();
  // tỉnh lộ chính (vẽ dưới tuyến tham quan)
  D.proads.forEach((r) => {
    const sid = "proad-" + r.id; if (map.getSource(sid)) return;
    const l = lang.value || "vi"; const nm = (r[l] && r[l].n) || r.vi.n;
    map.addSource(sid, { type: "geojson", data: { type: "Feature", properties: { name: nm }, geometry: { type: "LineString", coordinates: r.wp } } });
    const vis = layers.proads ? "visible" : "none";
    map.addLayer({ id: sid + "-case", type: "line", source: sid, layout: { visibility: vis, "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#FFFFFF", "line-width": 11, "line-opacity": 0.95 } });
    map.addLayer({ id: sid + "-fill", type: "line", source: sid, layout: { visibility: vis, "line-cap": "round", "line-join": "round" }, paint: { "line-color": r.color, "line-width": 6.5 } });
    map.addLayer({ id: sid + "-label", type: "symbol", source: sid, layout: { visibility: vis, "symbol-placement": "line", "text-field": ["get", "name"], "text-font": ["Noto Sans Bold"], "text-size": 13, "symbol-spacing": 320, "text-letter-spacing": 0.04, "text-rotation-alignment": "map", "text-pitch-alignment": "viewport", "text-keep-upright": true }, paint: { "text-color": "#2A2018", "text-halo-color": "#FFFFFF", "text-halo-width": 2.4 } });
    fetchPolyline(r.wp, (geo) => { const s = map.getSource(sid); if (s) s.setData({ type: "Feature", properties: { name: nm }, geometry: geo }); });
  });
  // tuyến tham quan (mỗi tuyến xuất phát từ UBND) — line đặc dày + mũi tên chuyển động
  D.tours.forEach((tr) => {
    const sid = "tour-" + tr.id; if (map.getSource(sid)) return;
    const pts = [D.ubnd.ll, ...tr.sites.map((id) => { const s = D.sites.find((x) => x.id === id); return s && s.ll; }).filter(Boolean)];
    const vis = layers.tuyen ? "visible" : "none";
    map.addSource(sid, { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts } } });
    map.addSource(sid + "-arrows", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({ id: sid + "-case", type: "line", source: sid, layout: { visibility: vis, "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#FBF5E8", "line-width": 9, "line-opacity": 0.9 } });
    map.addLayer({ id: sid + "-base", type: "line", source: sid, layout: { visibility: vis, "line-cap": "round", "line-join": "round" }, paint: { "line-color": tr.color, "line-width": 6, "line-opacity": 0.95 } });
    map.addLayer({ id: sid + "-arrows-lyr", type: "symbol", source: sid + "-arrows", layout: { visibility: vis, "icon-image": "arrowhead", "icon-size": 0.6, "icon-rotate": ["get", "bearing"], "icon-rotation-alignment": "map", "icon-allow-overlap": true, "icon-ignore-placement": true } });
    storeGeom(tr.id, { type: "LineString", coordinates: pts });
    fetchPolyline(pts, (geo) => { const s = map.getSource(sid); if (s) s.setData({ type: "Feature", properties: {}, geometry: geo }); storeGeom(tr.id, geo); });
  });
  startArrows();
  applyTourStyle();
}

function updateRoadLabels() {
  if (!map || !map.getLayer) return;
  const l = lang.value || "vi";
  (D.proads || []).forEach((r) => {
    const sid = "proad-" + r.id; const s = map.getSource(sid);
    if (s && s._data) {
      try {
        const nm = (r[l] && r[l].n) || r.vi.n;
        const d = s._data; d.properties = d.properties || {}; d.properties.name = nm; s.setData(d);
      } catch (e) { /* ignore */ }
    }
  });
}

function addArrowImage() {
  if (!map || (map.hasImage && map.hasImage("arrowhead"))) return;
  const s = 24, c = document.createElement("canvas"); c.width = s; c.height = s; const x = c.getContext("2d");
  x.clearRect(0, 0, s, s);
  x.beginPath(); x.moveTo(s / 2, 2); x.lineTo(s - 4, s - 4); x.lineTo(s / 2, s - 9); x.lineTo(4, s - 4); x.closePath();
  x.fillStyle = "#FFFFFF"; x.strokeStyle = "rgba(40,30,20,.9)"; x.lineWidth = 2.5; x.fill(); x.stroke();
  try { map.addImage("arrowhead", x.getImageData(0, 0, s, s)); } catch (e) { /* ignore */ }
}

function storeGeom(id, geo) {
  const coords = geo.coordinates; if (!coords || coords.length < 2) return;
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1], b = coords[i];
    const dx = (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180), dy = b[1] - a[1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  tourGeom[id] = { coords, cum, total: cum[cum.length - 1] || 0.0001 };
}

function ptAt(g, s) {
  const { coords, cum } = g; let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
  const a = coords[i - 1], b = coords[i]; const seg = cum[i] - cum[i - 1] || 1; const f = Math.max(0, Math.min(1, (s - cum[i - 1]) / seg));
  const lng = a[0] + (b[0] - a[0]) * f, lat = a[1] + (b[1] - a[1]) * f;
  const dx = (b[0] - a[0]) * Math.cos((lat * Math.PI) / 180), dy = b[1] - a[1];
  const bearing = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
  return { lng, lat, bearing };
}

function fetchPolyline(coords, cb) {
  const c = coords.map((p) => p[0].toFixed(6) + "," + p[1].toFixed(6)).join(";");
  fetch("https://router.project-osrm.org/route/v1/driving/" + c + "?overview=full&geometries=geojson")
    .then((r) => r.json())
    .then((j) => { if (map && j.routes && j.routes[0]) cb(j.routes[0].geometry); })
    .catch(() => {});
}

function startArrows() {
  if (arrowRAF) return;
  const tick = () => {
    arrowRAF = requestAnimationFrame(tick);
    if (!map || !tourGeom) return;
    if (!map.isStyleLoaded()) return;
    if (mapMoving || (map.isMoving && map.isMoving()) || (map.isZooming && map.isZooming()) || (map.isEasing && map.isEasing())) return;
    phase = ((phase || 0) + 0.0022) % 1;
    const show = layers.tuyen;
    D.tours.forEach((tr) => {
      const g = tourGeom[tr.id]; const src = map.getSource("tour-" + tr.id + "-arrows"); if (!g || !src) return;
      if (!show) { src.setData({ type: "FeatureCollection", features: [] }); return; }
      const n = Math.max(3, Math.round(g.total / 0.0055)); const feats = [];
      for (let k = 0; k < n; k++) {
        const s = (((k + phase) / n) % 1) * g.total; const p = ptAt(g, s);
        feats.push({ type: "Feature", properties: { bearing: p.bearing }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } });
      }
      src.setData({ type: "FeatureCollection", features: feats });
    });
  };
  arrowRAF = requestAnimationFrame(tick);
}

function applyRouteVisibility() {
  if (!map || !map.getLayer) return;
  D.tours.forEach((tr) => ["-case", "-base", "-arrows-lyr"].forEach((sf) => { const id = "tour-" + tr.id + sf; if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", layers.tuyen ? "visible" : "none"); }));
  D.proads.forEach((r) => ["-case", "-fill", "-label"].forEach((sf) => { const id = "proad-" + r.id + sf; if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", layers.proads ? "visible" : "none"); }));
  updateRoadLabels();
}

function applyTourStyle() {
  if (!map || !map.getLayer) return; const active = activeTour.value;
  D.tours.forEach((tr) => {
    const cas = "tour-" + tr.id + "-case", base = "tour-" + tr.id + "-base", arr = "tour-" + tr.id + "-arrows-lyr";
    const on = !active || active === tr.id; const isSel = active === tr.id;
    if (map.getLayer(base)) { try { map.setPaintProperty(base, "line-opacity", isSel ? 1 : on ? 0.9 : 0.1); map.setPaintProperty(base, "line-width", isSel ? 11 : active ? 4 : 6); map.setPaintProperty(base, "line-blur", isSel ? 0.5 : 0); } catch (e) { /* ignore */ } }
    if (map.getLayer(cas)) { try { map.setPaintProperty(cas, "line-opacity", isSel ? 1 : on ? 0.85 : 0.08); map.setPaintProperty(cas, "line-width", isSel ? 18 : active ? 7 : 9); map.setPaintProperty(cas, "line-color", isSel ? "#E7C56B" : "#FBF5E8"); } catch (e) { /* ignore */ } }
    if (map.getLayer(arr)) { try { map.setLayoutProperty(arr, "icon-size", isSel ? 0.95 : 0.58); map.setPaintProperty(arr, "icon-opacity", on ? 1 : 0.15); } catch (e) { /* ignore */ } }
  });
}

function sitePin(num, big, active, name, img) {
  const size = big ? 46 : 40;
  const el = document.createElement("div");
  el.style.cssText = "width:" + size + "px;height:" + size + "px;border-radius:50%;border:3px solid " + (active ? "#E7C56B" : "#9E3B2E") + ";box-shadow:0 3px 9px rgba(0,0,0,.4);cursor:pointer;overflow:hidden;background:#FBF5E8 center/" + (img ? "cover" : "68%") + " no-repeat url('" + (img || logoUrl) + "')";
  return el;
}

function otherPin(color, label) {
  const el = document.createElement("div");
  el.style.cssText = "width:22px;height:22px;border-radius:50%;background:" + color + ";border:2px solid #F6ECD7;box-shadow:0 2px 7px rgba(0,0,0,.35);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#F6ECD7;font-family:Roboto Condensed,sans-serif;font-weight:700;font-size:9px";
  el.textContent = label;
  return el;
}

function syncMarkers() {
  if (!map) return;
  (markers || []).forEach((m) => m.remove()); markers = [];
  const major = highlightMajorSites;
  const selId = selected.value && selected.value.id;
  const place = (ll, el, payload, anchor) => {
    el.addEventListener("click", (e) => { e.stopPropagation(); selected.value = payload; mapRightOpen.value = true; });
    markers.push(new Marker({ element: el, anchor: anchor || "center" }).setLngLat(ll).addTo(map));
  };
  if (layers.ditich) D.sites.forEach((s, i) => {
    place(s.ll, sitePin(i + 1, major && s.d3, selId === s.id, L(s).n, s.image), { isSite: true, id: s.id, d3: s.d3, ll: s.ll, color: "#9E3B2E", name: L(s).n, altName: s.en.n, type: L(s).t, desc: L(s).d, image: s.image || "", openDetail: openDetail(s.id), openVr: openVr(s.id), open3d: open3d(s.id) });
  });
  const others = (arr, color, label) => arr.forEach((o) => place(o.ll, otherPin(color, label), { isSite: false, ll: o.ll, color, name: L(o).n, altName: o.en.n, type: label, desc: L(o).d }));
  if (layers.dulich) others(D.dulich, "#2C4A5E", "DL");
  if (layers.lehoi) others(D.festivals, "#B5532A", "LH");
  if (layers.tienich) others(D.tienich, "#6E7B52", "TI");
  if (layers.tuyen) {
    const u = D.ubnd, el = document.createElement("div");
    el.style.cssText = "width:30px;height:30px;border-radius:8px;background:#1F4E66;border:2px solid #E7C56B;box-shadow:0 3px 10px rgba(0,0,0,.45);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#E7C56B;font-size:16px";
    el.innerHTML = "★";
    place(u.ll, el, { isSite: false, ll: u.ll, color: "#1F4E66", name: L(u).n, altName: u.en.n, type: L(u).t, desc: L(u).d });
  }
  updateLabels();
}

function focusSiteFromQuery() {
  const siteId = String(route.query.diem || "");
  if (!siteId || !map) return;
  const site = D.sites.find((item) => item.id === siteId);
  if (!site) return;
  layers.ditich = true;
  selected.value = {
    isSite: true,
    id: site.id,
    d3: site.d3,
    ll: site.ll,
    color: "#9E3B2E",
    name: L(site).n,
    altName: site.en.n,
    type: L(site).t,
    desc: L(site).d,
    image: site.image || "",
    openDetail: openDetail(site.id),
    openVr: openVr(site.id),
    open3d: open3d(site.id),
  };
  mapRightOpen.value = true;
  map.flyTo({ center: site.ll, zoom: 17.5, pitch: terrain3d.value ? 62 : 0, duration: 700 });
}

// ---- điều khiển UI (thay cho các setState() lẻ ở bản gốc) ----
function toggleLeft() { mapLeftOpen.value = !mapLeftOpen.value; }
function closeLeft() { mapLeftOpen.value = false; }
function toggleRight() { mapRightOpen.value = !mapRightOpen.value; }
function closeRight() { mapRightOpen.value = false; }
function toggle3d() { terrain3d.value = !terrain3d.value; }
function toggleTours() { layers.tuyen = !layers.tuyen; }
function toggleFullscreen() {
  const el = mapWrapEl.value; if (!el) return;
  if (document.fullscreenElement) { document.exitFullscreen && document.exitFullscreen(); }
  else { (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); }
}

// ---- dữ liệu hiển thị cho panel/lớp/tuyến (renderVals ở bản gốc) ----
const layerDef = computed(() => [
  ["ditich", t.value.layerDitich, "#9E3B2E"],
  ["dulich", t.value.layerDulich, "#2C4A5E"],
  ["lehoi", t.value.layerLehoi, "#B5532A"],
  ["proads", t.value.layerProads, "#E8902E"],
  ["tienich", t.value.layerTienich, "#6E7B52"],
]);
const layerItems = computed(() =>
  layerDef.value.map(([k, label, dot]) => {
    const on = layers[k];
    return {
      id: k, label, dot, opacity: on ? 1 : 0.3,
      bg: on ? "#FFFDF6" : "transparent", border: on ? "#D8C5A2" : "transparent",
      check: on ? "●" : "○", checkColor: on ? dot : "#C9B68F",
      onClick: () => { layers[k] = !layers[k]; },
    };
  }),
);

const baseDef = computed(() => [
  ["hybrid", t.value.baseHybrid], ["satellite", t.value.baseSat], ["giaothong", t.value.baseRoad],
]);
const baseModes = computed(() =>
  baseDef.value.map(([k, label]) => {
    const on = baseMode.value === k;
    return { label, onClick: () => { baseMode.value = k; }, bg: on ? "#9E3B2E" : "transparent", color: on ? "#F6ECD7" : "#5A4A39" };
  }),
);

const toursOn = computed(() => layers.tuyen);
const toursToggleColor = computed(() => (toursOn.value ? "#1F8A5B" : "#9C8868"));
const toursToggleIcon = computed(() => (toursOn.value ? "◉" : "○"));
const toursTitle = computed(() => t.value.toursTitle);
const toursAllLabel = computed(() => t.value.toursAllLabel);
const ubndStartLabel = computed(() => t.value.ubndStartLabel);

const tourItems = computed(() =>
  D.tours.map((tr) => {
    const isSel = activeTour.value === tr.id;
    return {
      id: tr.id, name: L(tr).n, color: tr.color, sel: isSel, selMark: isSel ? "●" : "",
      bg: isSel ? tr.color : "#FFFDF6", textColor: isSel ? "#FFFFFF" : "#2A2018",
      border: isSel ? tr.color : "#E0D0AE",
      onClick: () => { activeTour.value = activeTour.value === tr.id ? null : tr.id; layers.tuyen = true; },
    };
  }),
);

const terrainBg = computed(() => (terrain3d.value ? "#2C4A5E" : "rgba(247,239,222,.96)"));
const terrainColor = computed(() => (terrain3d.value ? "#E7C56B" : "#5A4A39"));
const leftDrawerTf = computed(() => (mapLeftOpen.value ? "translateX(0)" : "translateX(-115%)"));
const rightDrawerTf = computed(() => (mapRightOpen.value ? "translateX(0)" : "translateX(115%)"));
const hasSelection = computed(() => !!selected.value);
const noSelection = computed(() => !selected.value);
const sel = computed(() => selected.value || {});
// Link mở Google Maps tới toạ độ điểm đang chọn — ll lưu dạng [lng, lat]
// (chuẩn GeoJSON/MapLibre), Google Maps cần lat,lng nên phải đảo lại.
const googleMapsUrl = computed(() => {
  const ll = sel.value.ll;
  if (!ll || ll.length < 2) return "";
  return `https://www.google.com/maps/search/?api=1&query=${ll[1]},${ll[0]}`;
});


// ---- vòng đời + đồng bộ state → map (thay cho componentDidMount/componentDidUpdate) ----
onMounted(() => {
  initMap();
  if (mapWrapEl.value && !fsBound) {
    fsBound = true;
    document.addEventListener("fullscreenchange", () => {
      for (const d of [120, 360, 620]) setTimeout(() => { if (map) map.resize(); }, d);
    });
  }
});

watch(() => route.query.diem, () => focusSiteFromQuery());

onUnmounted(() => {
  if (map) { map.remove(); map = null; markers = []; }
  if (pollSetup) clearInterval(pollSetup);
  if (arrowRAF) cancelAnimationFrame(arrowRAF);
});

watch(baseMode, () => applyBase());
watch(terrain3d, () => applyTerrain());
watch(() => ({ ...layers }), () => { applyRouteVisibility(); syncMarkers(); }, { deep: true });
watch(activeTour, () => applyTourStyle());
watch(lang, () => { updateRoadLabels(); syncMarkers(); });
watch(selected, () => syncMarkers());
</script>

<template>
  <template v-if="isMap">
    <!-- full-bleed: fill .tc-fullscreen-stage (LayoutThanhCongFullscreen.vue) -->
    <div ref="mapWrapEl" style="position:absolute;inset:0;overflow:hidden;background:#cdd6c4">
      <div ref="mapEl" style="position:absolute;inset:0;background:#cdd6c4"></div>

      <!-- top-left floating controls -->
      <div style="position:absolute;top:14px;left:14px;display:flex;flex-direction:column;gap:9px;z-index:6">
        <button @click="toggleLeft" style="display:flex;align-items:center;gap:9px;align-self:flex-start;background:#9E3B2E;color:#F6ECD7;border:none;border-radius:9px;padding:10px 16px;font-family:'Roboto Condensed',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.22)" class="hv1"><span style="font-size:15px;line-height:1">☰</span>{{ t.mapLayersBtn }}</button>
        <div style="display:flex;background:rgba(247,239,222,.96);border:1px solid #C9B68F;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.18)">
          <template v-for="(b, __i) in baseModes" :key="__i">
            <button @click="b.onClick" :style="`background:${b.bg};color:${b.color};border:none;padding:8px 14px;font-family:'Roboto Condensed',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer`">{{ b.label }}</button>
          </template>
        </div>
        <button @click="toggle3d" :style="`display:flex;align-items:center;gap:7px;align-self:flex-start;background:${terrainBg};color:${terrainColor};border:1px solid #C9B68F;border-radius:8px;padding:8px 14px;font-family:'Roboto Condensed',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.18)`">⛰ {{ t.terrain3d }}</button>
      </div>

      <!-- top-right floating controls -->
      <div style="position:absolute;top:14px;right:14px;display:flex;gap:9px;z-index:6">
        <button @click="toggleRight" style="display:flex;align-items:center;gap:8px;background:rgba(44,74,94,.94);color:#E7C56B;border:1px solid #2C4A5E;border-radius:9px;padding:10px 15px;font-family:'Roboto Condensed',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.22)"><span style="font-size:15px;line-height:1">ⓘ</span>{{ t.mapInfoBtn }}</button>
        <button @click="toggleFullscreen" :title="t.mapFullscreen" style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;background:rgba(247,239,222,.96);color:#5A4A39;border:1px solid #C9B68F;border-radius:9px;font-size:18px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.2)" class="hv2">⛶</button>
      </div>

      <!-- boundary legend chip -->
      <div style="position:absolute;bottom:14px;left:14px;z-index:5;display:flex;align-items:center;gap:8px;background:rgba(247,239,222,.92);border:1px solid #C9B68F;border-radius:7px;padding:6px 11px;font-family:'Roboto Condensed',sans-serif;font-size:11.5px;color:#5A4A39;box-shadow:0 2px 8px rgba(0,0,0,.15)">
        <span style="width:16px;height:0;border-top:2px solid #7C2B21"></span>{{ t.boundaryLabel }}
      </div>

      <!-- LEFT off-canvas: layers -->
      <aside :style="`position:absolute;top:0;left:0;bottom:0;width:clamp(258px,82vw,322px);background:rgba(251,245,232,.98);border-right:1px solid #E0D0AE;box-shadow:6px 0 26px rgba(90,70,40,.18);z-index:12;transform:${leftDrawerTf};transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;backdrop-filter:blur(2px)`">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 16px 12px;border-bottom:1px solid #E6D8BA">
          <span style="font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;color:#2A2018;text-transform:uppercase;letter-spacing:.5px">{{ t.layersTitle }}</span>
          <button @click="closeLeft" :title="t.mapClose" style="width:30px;height:30px;border-radius:7px;background:#EFE2C7;border:none;color:#7A6340;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center" class="hv3">✕</button>
        </div>
        <div style="padding:16px;overflow-y:auto;flex:1">
          <div style="position:relative;margin-bottom:18px">
            <input :placeholder="t.searchPh" style="width:100%;box-sizing:border-box;padding:10px 12px 10px 34px;border:1px solid #D8C5A2;border-radius:6px;background:#FFFDF6;font-family:'Roboto Condensed',sans-serif;font-size:14px;color:#2A2018">
            <span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#B98F37">⌕</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <template v-for="(item, __i) in layerItems" :key="item?.id ?? __i">
              <button @click="item.onClick" :style="`display:flex;align-items:center;gap:10px;background:${item.bg};border:1px solid ${item.border};border-radius:7px;padding:9px 11px;cursor:pointer;text-align:left;font-family:'Roboto Condensed',sans-serif`">
                <span :style="`width:14px;height:14px;flex:none;border-radius:3px;background:${item.dot};transform:rotate(45deg);opacity:${item.opacity}`"></span>
                <span style="font-size:13.5px;font-weight:500;color:#2A2018;flex:1">{{ item.label }}</span>
                <span :style="`font-size:11px;color:${item.checkColor}`">{{ item.check }}</span>
              </button>
            </template>
          </div>
          <!-- tour routes -->
          <div style="margin-top:18px;padding-top:16px;border-top:1px dashed #D8C5A2">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#B98F37;font-weight:600">{{ toursTitle }}</span>
              <button @click="toggleTours" :title="toursAllLabel" :style="`display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:'Roboto Condensed',sans-serif;font-size:11.5px;font-weight:600;color:${toursToggleColor}`"><span style="font-size:13px">{{ toursToggleIcon }}</span>{{ toursAllLabel }}</button>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A7350;margin-bottom:10px"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:5px;background:#1F4E66;color:#E7C56B;font-size:10px;flex:none">★</span>{{ ubndStartLabel }}</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <template v-for="(tr, __i) in tourItems" :key="tr?.id ?? __i">
                <button @click="tr.onClick" :style="`display:flex;align-items:center;gap:10px;background:${tr.bg};border:1.5px solid ${tr.border};border-radius:8px;padding:9px 11px;cursor:pointer;text-align:left`">
                  <span :style="`width:18px;height:4px;border-radius:2px;background:${tr.color};flex:none;box-shadow:0 0 0 2px rgba(255,255,255,.5)`"></span>
                  <span :style="`font-family:'Roboto Condensed',sans-serif;font-size:13px;font-weight:600;color:${tr.textColor};flex:1`">{{ tr.name }}</span>
                  <span :style="`font-size:11px;color:${tr.textColor};opacity:.7`">{{ tr.selMark }}</span>
                </button>
              </template>
            </div>
          </div>
          <div style="margin-top:16px;padding-top:14px;border-top:1px dashed #D8C5A2;font-size:12px;color:#8A7350;text-wrap:pretty">{{ t.mapLegendNote }}</div>
        </div>
      </aside>

      <!-- RIGHT off-canvas: detail -->
      <aside :style="`position:absolute;top:0;right:0;bottom:0;width:clamp(280px,86vw,360px);background:rgba(251,245,232,.98);border-left:1px solid #E0D0AE;box-shadow:-6px 0 26px rgba(90,70,40,.18);z-index:12;transform:${rightDrawerTf};transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow:hidden;backdrop-filter:blur(2px)`">
        <button @click="closeRight" :title="t.mapClose" style="position:absolute;top:12px;right:12px;z-index:3;width:32px;height:32px;border-radius:8px;background:rgba(239,226,199,.95);border:none;color:#7A6340;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center" class="hv4">✕</button>
        <div style="overflow-y:auto;flex:1">
          <template v-if="hasSelection">
            <SiteDetailPanel v-if="sel.isSite" :site-id="sel.id" />
            <div v-else>
              <div style="height:150px;background:repeating-linear-gradient(45deg,#E3D2B0 0 12px,#DCC9A4 12px 24px);position:relative;overflow:hidden">
                <Image
                  v-if="sel.image"
                  :src="sel.image"
                  fallback="logo"
                  style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
                />
                <span :style="`position:absolute;left:16px;bottom:14px;background:${sel.color};color:#F6ECD7;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:4px 11px;border-radius:4px;z-index:1`">{{ sel.type }}</span>
              </div>
              <div style="padding:20px">
                <h3 style="font-family:'Playfair Display',serif;font-weight:700;font-size:24px;margin:0 0 2px;color:#2A2018;line-height:1.15">{{ sel.name }}</h3>
                <div style="font-family:'Carattere',cursive;font-size:24px;line-height:1;color:#B07A2E;margin:2px 0 12px">{{ sel.altName }}</div>
                <p style="font-size:14.5px;color:#5A4A39;margin:0 0 18px;line-height:1.65;text-wrap:pretty">{{ sel.desc }}</p>
                <a
                  v-if="googleMapsUrl"
                  :href="googleMapsUrl"
                  target="_blank"
                  rel="noopener"
                  style="display:flex;align-items:center;justify-content:center;gap:8px;background:#FBF5E8;color:#2A2018;border:1px solid #D8C5A2;border-radius:6px;padding:11px;font-family:'Roboto Condensed',sans-serif;font-weight:600;font-size:13.5px;cursor:pointer;text-decoration:none"
                >
                  <span style="color:#1F8A5B">⌖</span>{{ t.btnMaps }}
                </a>
              </div>
            </div>
          </template>
          <template v-if="noSelection">
            <div style="padding:64px 28px;text-align:center;color:#8A7350">
              <div style="font-size:38px;color:#C9B68F;margin-bottom:12px">⌖</div>
              <div style="font-family:'Oswald',sans-serif;font-size:18px;color:#2A2018;margin-bottom:7px">{{ t.mapEmptyTitle }}</div>
              <p style="font-size:13.5px;margin:0;text-wrap:pretty;line-height:1.6">{{ t.mapEmptyDesc }}</p>
            </div>
          </template>
        </div>
      </aside>
    </div>
  </template>
</template>

<style scoped>
.hv1:hover { background: #7C2B21; }
.hv2:hover { background: #fff; }
.hv3:hover { background: #E2D2B0; }
.hv4:hover { background: #E2D2B0; }
.hv5:hover { background: #7C2B21; }
</style>
