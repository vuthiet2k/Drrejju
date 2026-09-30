<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { loadMap4dSdk } from '../common/useMap4d'

const props = defineProps({
  center: { type: Object, default: () => ({ lat: 21.5338, lng: 105.8147 }) },
  zoom: { type: Number, default: 16 },
  bearing: { type: Number, default: 0 },
  tilt: { type: Number, default: 45 },
  markers: { type: Array, default: () => [] }, // [{ lat, lng, title, id }]
  // Styled markers that do not emit clicks — origin/destination of a route,
  // tour stops, place-search hits (mirror of the original markerTours_).
  // [{ lat, lng, title, snippet, icon, size }]
  pins: { type: Array, default: () => [] },
  // Zone overlays: [{ data: <GeoJSON FeatureCollection>, stroke, fill, fillOpacity }]
  geojson: { type: Array, default: () => [] },
  mode3d: { type: Boolean, default: false },
  height: { type: String, default: '100%' },
  fit: { type: Boolean, default: true },
  polyline: { type: Array, default: () => [] },
  // Extra dotted connectors — the "#aaa" 2px stubs the original portal drew
  // from each endpoint marker to the first/last vertex of the real route
  // (see directHomePortal's list_dot_polyline).
  dashedLines: { type: Array, default: () => [] },
})
const emit = defineEmits(['marker-click', 'ready', 'map-click'])

const el = ref(null)
let map = null
let markerObjs = []
let pinObjs = []
let geoFeatures = [] // arrays of features returned by map.data.addGeoJson
let lineObj = null
let dashedObjs = []
const failed = ref(false)

function clearMarkers() { markerObjs.forEach((m) => m.setMap && m.setMap(null)); markerObjs = [] }
function clearPins() { pinObjs.forEach((m) => m.setMap && m.setMap(null)); pinObjs = [] }
function clearGeojson() {
  if (map && map.data) geoFeatures.forEach((fs) => fs.forEach((f) => map.data.remove(f)))
  geoFeatures = []
}

function drawMarkers() {
  if (!map || !window.map4d) return
  clearMarkers()
  const pts = props.markers.filter((m) => m && m.lat != null && m.lng != null)
  pts.forEach((m) => {
    const marker = new window.map4d.Marker({ position: { lat: Number(m.lat), lng: Number(m.lng) }, title: m.title || '' })
    marker.setMap(map)
    marker.addListener && marker.addListener('click', () => emit('marker-click', m))
    markerObjs.push(marker)
  })
  if (props.fit && pts.length) {
    if (pts.length === 1) map.moveCamera({ target: { lat: Number(pts[0].lat), lng: Number(pts[0].lng) }, zoom: props.zoom })
    else if (window.map4d.LatLngBounds) {
      const b = new window.map4d.LatLngBounds()
      pts.forEach((p) => b.extend({ lat: Number(p.lat), lng: Number(p.lng) }))
      map.fitBounds(b)
    }
  }
}

// Styled, non-interactive markers. `icon` renders through iconView (anchored on
// its centre, like the original markerTours_); without it the default pin shows.
function drawPins() {
  if (!map || !window.map4d) return
  clearPins()
  props.pins
    .filter((p) => p && p.lat != null && p.lng != null)
    .forEach((p) => {
      const opts = { position: { lat: Number(p.lat), lng: Number(p.lng) }, title: p.title || '' }
      if (p.snippet) opts.snippet = p.snippet
      if (p.icon) {
        const size = p.size || 16
        opts.iconView = `<img src="${p.icon}" style="width:${size}px;height:${size}px;background-color:transparent;"/>`
        opts.anchor = [0.5, 0.5]
      }
      const marker = new window.map4d.Marker(opts)
      marker.setMap(map)
      pinObjs.push(marker)
    })
}

// Zone overlays (mirror of creatNewGeoJson + mapFitBoundsLayerGeoJson): style is
// injected into each feature's properties, then the camera fits the outline.
function drawGeojson() {
  if (!map || !map.data) return
  clearGeojson()
  const bounds = window.map4d?.LatLngBounds ? new window.map4d.LatLngBounds() : null
  let hasBounds = false
  props.geojson
    .filter((z) => z && z.data && Array.isArray(z.data.features) && z.data.features.length)
    .forEach((z) => {
      const style = {
        stroke: z.stroke || '#dc3545',
        'stroke-opacity': 1,
        fill: z.fill || '#ccc',
        'fill-opacity': z.fillOpacity == null ? 0.4 : z.fillOpacity,
      }
      const fc = { ...z.data, features: z.data.features.map((f) => ({ ...f, properties: style })) }
      geoFeatures.push(map.data.addGeoJson(JSON.stringify(fc)))
      if (!bounds) return
      fc.features.forEach((f) => {
        // Polygon → [ring][point]; MultiPolygon → [poly][ring][point].
        const rings = f.geometry?.type === 'MultiPolygon' ? f.geometry.coordinates.flat() : f.geometry?.coordinates || []
        rings.forEach((ring) => (ring || []).forEach(([lng, lat]) => { bounds.extend({ lat, lng }); hasBounds = true }))
      })
    })
  if (hasBounds && map.fitBounds) {
    map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 }, { duration: 1000, animate: true })
  }
}

function drawPolyline() {
  if (!map || !window.map4d || !window.map4d.Polyline) return
  if (lineObj) { lineObj.setMap(null); lineObj = null }
  const pts = props.polyline.filter((p) => p && p.lat != null && p.lng != null)
  if (pts.length < 2) return
  lineObj = new window.map4d.Polyline({ path: pts.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) })), strokeColor: '#405189', strokeWidth: 4 })
  lineObj.setMap(map)
}

function clearDashed() { dashedObjs.forEach((l) => l.setMap && l.setMap(null)); dashedObjs = [] }
// Two-point dotted stubs ("#aaa", 2px) — used for the origin↔first-step and
// last-step↔destination gaps on a route.
function drawDashed() {
  if (!map || !window.map4d || !window.map4d.Polyline) return
  clearDashed()
  props.dashedLines.forEach((path) => {
    const pts = (path || []).filter((p) => p && p.lat != null && p.lng != null)
    if (pts.length < 2) return
    const line = new window.map4d.Polyline({
      path: pts.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) })),
      strokeColor: '#aaa', strokeWidth: 2, style: 'dotted',
    })
    line.setMap(map)
    dashedObjs.push(line)
  })
}

onMounted(async () => {
  try {
    await loadMap4dSdk()
    map = new window.map4d.Map(el.value, {
      center: props.center, zoom: props.zoom, bearing: props.bearing, tilt: props.tilt, controls: true,
      mapType: props.mode3d && window.map4d.MapType ? window.map4d.MapType.map3d : undefined,
    })
    if (props.mode3d && map.enable3dMode) map.enable3dMode(true)
    drawMarkers()
    drawPins()
    drawGeojson()
    drawPolyline()
    drawDashed()
    if (map.addListener) map.addListener('click', (args) => emit('map-click', args && args.location ? args.location : null))
    emit('ready', map)
  } catch (e) { console.error(e); failed.value = true }
})

onBeforeUnmount(() => {
  clearMarkers(); clearPins(); clearGeojson(); clearDashed()
  if (lineObj) lineObj.setMap(null)
  if (map && map.destroy) map.destroy()
  map = null
})
watch(() => props.markers, () => drawMarkers(), { deep: true })
watch(() => props.pins, () => drawPins(), { deep: true })
watch(() => props.geojson, () => drawGeojson(), { deep: true })
watch(() => props.polyline, () => drawPolyline(), { deep: true })
watch(() => props.dashedLines, () => drawDashed(), { deep: true })
watch(() => props.mode3d, (v) => {
  if (!map || !window.map4d) return
  if (map.enable3dMode) map.enable3dMode(v)
  if (map.setMapType && window.map4d.MapType) {
    map.setMapType(v ? window.map4d.MapType.map3d : window.map4d.MapType.roadmap)
  }
})
defineExpose({ getMap: () => map })
</script>

<template>
  <div class="iot-map" :style="{ height }">
    <div ref="el" class="iot-map__canvas"></div>
    <div v-if="failed" class="iot-map__err">
      <div class="iot-map__err-card">
        <span>🗺️</span>
        <p>Không tải được bản đồ.<br />Kiểm tra <code>MAP4D_API_KEY</code> trong <code>config.js</code>.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.iot-map { position: relative; width: 100%; background: #dfe6e3; border-radius: var(--iot-radius); overflow: hidden; }
.iot-map__canvas { width: 100%; height: 100%; }
.iot-map__err { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: #eef3f1; }
.iot-map__err-card { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid var(--iot-border); border-radius: 12px; padding: 14px 18px; box-shadow: var(--iot-shadow-sm); max-width: 380px; }
.iot-map__err-card span { font-size: 26px; }
.iot-map__err-card p { margin: 0; color: var(--iot-muted); font-size: 13px; }
.iot-map__err-card code { background: #eef3f1; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
</style>
