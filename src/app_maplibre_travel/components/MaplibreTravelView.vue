<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Map as MaplibreMap, Marker, NavigationControl, LngLatBounds } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { createModel3dLayer } from '@/model_3d-maplibre'
import modelsConfig from '@/model_3d-maplibre/@data/models-config.json'

const props = defineProps({
  center: { type: Object, default: () => ({ lat: 21.392, lng: 105.807 }) },
  zoom: { type: Number, default: 15 },
  bearing: { type: Number, default: 0 },
  tilt: { type: Number, default: 0 },
  markers: { type: Array, default: () => [] },
  pins: { type: Array, default: () => [] },
  geojson: { type: Array, default: () => [] },
  // 'roadmap' | 'raster' | 'satellite' | '3d'. Nếu không set thì fallback theo
  // `mode3d` boolean (back-compat cho các trang cũ) → '3d' hoặc 'satellite'.
  mapMode: { type: String, default: '' },
  mode3d: { type: Boolean, default: false },
  height: { type: String, default: '100%' },
  fit: { type: Boolean, default: true },
  polyline: { type: Array, default: () => [] },
  dashedLines: { type: Array, default: () => [] },
})
const emit = defineEmits(['marker-click', 'ready', 'map-click'])

const el = ref(null)
const failed = ref(false)
let map = null
let markerInstances = []
const MODEL_LAYER_ID = 'maplibre-travel-3d-model'
const LINE_SOURCE_ID = 'maplibre-travel-line'
const DASHED_SOURCE_ID = 'maplibre-travel-dashed'
const ZONE_PREFIX = 'maplibre-travel-zone-'

// Nền vector roadmap dùng chung cho mode 'roadmap' và '3d' (3D = roadmap + GLB).
const ROADMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

function rasterStyle() {
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  }
}

function satelliteStyle() {
  return {
    version: 8,
    sources: {
      satellite: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© Esri',
      },
      labels: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        maxzoom: 19,
      },
    },
    layers: [
      { id: 'satellite', type: 'raster', source: 'satellite' },
      { id: 'labels', type: 'raster', source: 'labels' },
    ],
  }
}

// Mode → tuple { baseKey, style }. baseKey để so sánh xem có cần setStyle không
// (roadmap và 3d share cùng style → chỉ đổi pitch + toggle GLB layer).
function styleFor(mode) {
  if (mode === 'roadmap' || mode === '3d') return { baseKey: 'roadmap', style: ROADMAP_STYLE_URL }
  if (mode === 'raster') return { baseKey: 'raster', style: rasterStyle() }
  return { baseKey: 'satellite', style: satelliteStyle() }
}

function effectiveMode() {
  if (props.mapMode) return props.mapMode
  return props.mode3d ? '3d' : 'satellite'
}

function coordinates(point) {
  if (!point || point.lat == null || point.lng == null) return null
  return [Number(point.lng), Number(point.lat)]
}

function clearMarkers() {
  markerInstances.forEach((marker) => marker.remove())
  markerInstances = []
}

function markerElement(point, interactive) {
  const node = document.createElement('button')
  node.type = 'button'
  node.title = point.title || ''
  node.style.cssText = [
    'width:' + (point.size || 30) + 'px',
    'height:' + (point.size || 30) + 'px',
    'padding:0',
    'border:0',
    'border-radius:50% 50% 50% 0',
    'transform:rotate(-45deg)',
    'background:#d9534f',
    'box-shadow:0 2px 7px rgba(0,0,0,.4)',
    'cursor:' + (interactive ? 'pointer' : 'default'),
  ].join(';')
  if (point.icon) {
    node.style.background = '#fff url("' + point.icon + '") center/contain no-repeat'
  }
  return node
}

function drawMarkers() {
  if (!map) return
  clearMarkers()
  const all = [
    ...props.markers.map((point) => ({ point, interactive: true })),
    ...props.pins.map((point) => ({ point, interactive: false })),
  ]
  const valid = all.filter(({ point }) => coordinates(point))
  valid.forEach(({ point, interactive }) => {
    const node = markerElement(point, interactive)
    if (interactive) node.addEventListener('click', () => emit('marker-click', point))
    markerInstances.push(new Marker({ element: node, anchor: 'bottom' }).setLngLat(coordinates(point)).addTo(map))
  })
  if (props.fit && valid.length > 1) {
    const bounds = valid.reduce((result, { point }) => result.extend(coordinates(point)), new LngLatBounds())
    map.fitBounds(bounds, { padding: 56, maxZoom: props.zoom })
  } else if (props.fit && valid.length === 1) {
    map.flyTo({ center: coordinates(valid[0].point), zoom: props.zoom })
  }
}

function lineFeature(points) {
  const coordinatesList = points.map(coordinates).filter(Boolean)
  return coordinatesList.length > 1
    ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coordinatesList } }
    : { type: 'FeatureCollection', features: [] }
}

function upsertLine(sourceId, layerId, data, paint, layout = {}) {
  if (map.getSource(sourceId)) map.getSource(sourceId).setData(data)
  else map.addSource(sourceId, { type: 'geojson', data })
  if (!map.getLayer(layerId)) map.addLayer({ id: layerId, type: 'line', source: sourceId, layout, paint })
}

function drawLines() {
  if (!map || !map.isStyleLoaded()) return
  upsertLine(LINE_SOURCE_ID, LINE_SOURCE_ID, lineFeature(props.polyline), {
    'line-color': '#405189', 'line-width': 4, 'line-opacity': 0.92,
  }, { 'line-cap': 'round', 'line-join': 'round' })
  const features = props.dashedLines.map(lineFeature).filter((feature) => feature.geometry?.coordinates?.length > 1)
  upsertLine(DASHED_SOURCE_ID, DASHED_SOURCE_ID, { type: 'FeatureCollection', features }, {
    'line-color': '#808080', 'line-width': 2, 'line-dasharray': [1, 2],
  })
}

function drawZones() {
  if (!map || !map.isStyleLoaded()) return
  props.geojson.forEach((zone, index) => {
    if (!zone?.data) return
    const sourceId = ZONE_PREFIX + index
    if (map.getSource(sourceId)) map.getSource(sourceId).setData(zone.data)
    else map.addSource(sourceId, { type: 'geojson', data: zone.data })
    if (!map.getLayer(sourceId + '-fill')) {
      map.addLayer({ id: sourceId + '-fill', type: 'fill', source: sourceId, paint: { 'fill-color': zone.fill || '#cccccc', 'fill-opacity': zone.fillOpacity ?? 0.4 } })
      map.addLayer({ id: sourceId + '-line', type: 'line', source: sourceId, paint: { 'line-color': zone.stroke || '#dc3545', 'line-width': 2 } })
    }
  })
}

function sync3dMode() {
  if (!map) return
  const is3d = effectiveMode() === '3d'
  map.easeTo({ pitch: is3d ? Math.max(props.tilt, 55) : 0, duration: 350 })
  if (is3d && !map.getLayer(MODEL_LAYER_ID)) {
    try {
      map.addLayer(createModel3dLayer({ id: MODEL_LAYER_ID, origin: coordinates(props.center), modelsConfig }))
    } catch (error) { console.warn('[app_maplibre_travel] Không thể thêm lớp model 3D:', error) }
  }
  if (!is3d && map.getLayer(MODEL_LAYER_ID)) map.removeLayer(MODEL_LAYER_ID)
}

function sync() {
  drawMarkers(); drawLines(); drawZones(); sync3dMode()
}

// Đổi mode: nếu base style khác → setStyle rồi chờ style.load để re-add mọi
// layer custom (setStyle xoá hết source/layer app tạo). Cùng base → chỉ
// pitch/GLB layer (sync3dMode xử lý).
let currentBaseKey = null
function applyMode() {
  if (!map) return
  const { baseKey, style } = styleFor(effectiveMode())
  if (baseKey !== currentBaseKey) {
    currentBaseKey = baseKey
    map.setStyle(style)
    map.once('style.load', sync)
  } else {
    sync3dMode()
  }
}

onMounted(() => {
  try {
    const initial = styleFor(effectiveMode())
    currentBaseKey = initial.baseKey
    const is3dInit = effectiveMode() === '3d'
    map = new MaplibreMap({
      container: el.value, style: initial.style, center: coordinates(props.center), zoom: props.zoom,
      bearing: props.bearing, pitch: is3dInit ? Math.max(props.tilt, 55) : 0,
      maxPitch: 80, attributionControl: false, canvasContextAttributes: { antialias: true },
    })
    map.moveCamera = ({ target, zoom, tilt, bearing }) => map.flyTo({ center: coordinates(target) || map.getCenter(), zoom: zoom ?? map.getZoom(), pitch: tilt ?? map.getPitch(), bearing: bearing ?? map.getBearing() })
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right')
    map.on('load', () => { sync(); emit('ready', map) })
    map.on('click', (event) => emit('map-click', { lat: event.lngLat.lat, lng: event.lngLat.lng }))
    map.on('error', () => {})
  } catch (error) { console.error(error); failed.value = true }
})

onBeforeUnmount(() => { clearMarkers(); map?.remove(); map = null })
watch(() => [props.markers, props.pins, props.geojson, props.polyline, props.dashedLines], sync, { deep: true })
watch(() => [props.mapMode, props.mode3d], applyMode)
watch(() => props.center, (center) => map?.flyTo({ center: coordinates(center) }), { deep: true })
defineExpose({ getMap: () => map })
</script>

<template>
  <div class="iot-map" :style="{ height }">
    <div ref="el" class="iot-map__canvas"></div>
    <div v-if="failed" class="iot-map__err">Không thể tải bản đồ MapLibre.</div>
  </div>
</template>

<style scoped>
.iot-map { position: relative; width: 100%; background: #dfe6e3; border-radius: var(--iot-radius); overflow: hidden; }
.iot-map__canvas { width: 100%; height: 100%; }
.iot-map__err { position: absolute; inset: 0; display: grid; place-items: center; color: #596780; background: #eef3f1; }
</style>
