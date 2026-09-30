<script setup>
// Faithful clone of the thaihai.metatwin.vn home page: a full-screen Map4D
// portal with a left tool rail opening offcanvas panels (featured places /
// zones / festivals / tours / directions / account), a floating search +
// quick-suggest row, bottom-right floating widgets (festival drum, audio,
// fullscreen, 2D/3D toggle), a VR360 gallery + modal and an upcoming-festival
// popup — all Vue-driven (no bootstrap JS, no global ids) over the static @data.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTenant } from '../common/tenant'
import { mediaUrl, parseLatLng, stripHtml } from '../common/media'
import { fetchRoute, reverseGeocode, searchMap4dByType } from '../common/map4dRoute'
import { relicGeojson, geojsonCenter } from '../common/geojson'

const tenant = useTenant()
const { site: SITE, mapDefaults: MAP_DEFAULTS, locationTypes: LOCATION_TYPES, DATA, routeNames: RN } = tenant
import Map4dView from '../components/Map4dView.vue'
import StarRating from '../components/StarRating.vue'
import IotOffcanvas from '../components/IotOffcanvas.vue'
import IotVr360Modal from '../components/IotVr360Modal.vue'
import IotMainSearch from '../components/IotMainSearch.vue'

const ASSET = 'https://thaihai.metatwin.vn'
const IMG_DRUM = `${ASSET}/static/web_frontend/images/drum.png`
const IMG_3D = `${ASSET}/static/web_frontend/images/map-icon/map3d.png`
const IMG_2D = `${ASSET}/static/web_frontend/images/map-icon/satellite.png`
const AUDIO_SRC = `${ASSET}/media/music/duongveban.mp3`
// Marker art the original portal used for route endpoints / tour stops.
const ICON_FROM = 'https://map.map4d.vn/mapAppRoot/icon/directionsIcon/from.svg'
const ICON_STOP = `${ASSET}/static/web_frontend/images/marker-icon.png`
const RAIL = '60px'

const router = useRouter()
const query = ref('')
const selected = ref(null) // marker preview popup
const mode3d = ref(MAP_DEFAULTS.map3d) // initial map style from system-config `map_type`
const mapRef = ref(null)
const portalEl = ref(null)

/* ---- left tool rail / panels ---- */
const RAIL_ITEMS = [
  { key: 'places', title: 'Địa điểm nổi bật', icon: 'ri-road-map-line' },
  { key: 'relics', title: 'Cụm phân khu', icon: 'ri-landscape-fill' },
  { key: 'festivals', title: 'Lễ hội', icon: 'mdi mdi-party-popper' },
  { key: 'tours', title: 'Tuyến du lịch', icon: 'ri-treasure-map-line' },
  { key: 'direction', title: 'Chỉ đường', icon: 'ri-direction-fill' },
]
const activePanel = ref('places')
// Original rail also switches the map view: places/festivals → 3D, others → 2D.
const PANEL_MAP3D = { places: true, relics: false, festivals: true, tours: false, direction: false }
function togglePanel(key) {
  activePanel.value = activePanel.value === key ? null : key
  clearOverlays(key)
  if (activePanel.value && key in PANEL_MAP3D) mode3d.value = PANEL_MAP3D[key]
}
function setPanel(v, key) { if (!v && activePanel.value === key) { activePanel.value = null; clearOverlays(null) } }
// Leaving a panel drops whatever it drew on the map (mirror of the original
// deleteAllDrawingOnMap on panel switch).
function clearOverlays(keep) {
  if (keep !== 'places') { detailPlace.value = null; selected.value = null }
  if (keep !== 'relics') detailRelic.value = null
  if (keep !== 'festivals') detailFestival.value = null
  if (keep !== 'tours') { detailTour.value = null; tourRoute.value = null }
  searchPin.value = null
  typeOpen.value = false
  typeResults.value = []
  typePicked.value = null
}

/* ---- places ---- */
const withCoords = computed(() =>
  DATA.places.map((p) => ({ ...p, _c: parseLatLng(p.location) })).filter((p) => p._c),
)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return withCoords.value
  return withCoords.value.filter((p) => stripHtml(p.name).toLowerCase().includes(q))
})
const detailPlace = ref(null)
function panTo(p) { const map = mapRef.value?.getMap?.(); if (map && p?._c) map.moveCamera({ target: p._c, zoom: 18 }) }
function openPlaceDetail(p) { activePanel.value = 'places'; detailPlace.value = p; selected.value = null; panTo(p) }
function onMarkerClick(m) { const p = withCoords.value.find((x) => x.id === m.id); if (p) { selected.value = p; panTo(p) } }
function openFullPage(p) { router.push({ name: RN.locationDetail, params: { id: p.id } }) }

/* ---- relics / zones (mirror of sidebar/relic__relic-detail.js) ---- */
const relicQuery = ref('')
const filteredRelics = computed(() => {
  const q = relicQuery.value.trim().toLowerCase()
  const all = DATA.relics || []
  return q ? all.filter((r) => stripHtml(r.name).toLowerCase().includes(q)) : all
})
const detailRelic = ref(null)
// Opening a zone draws its GeoJSON outline; Map4dView fits the camera to it.
const relicZones = computed(() => {
  const fc = detailRelic.value && relicGeojson(detailRelic.value)
  return fc ? [{ data: fc, stroke: '#dc3545', fill: '#ccc', fillOpacity: 0.4 }] : []
})
// Centre of the outline — the point "Chỉ đường" routes to (the original tried
// to compute this too, via a centroidMulti that called a missing global).
const relicCenter = computed(() => {
  const fc = detailRelic.value && relicGeojson(detailRelic.value)
  return fc ? geojsonCenter(fc) : null
})
function openRelicDetail(r) { activePanel.value = 'relics'; detailRelic.value = r; mode3d.value = false }
function goRelic(r) { router.push({ name: RN.relicDetail, params: { id: r.id } }) }
function routeToRelic() {
  if (!relicCenter.value) return
  routeToPoint(stripHtml(detailRelic.value.name), relicCenter.value)
}

/* ---- festivals (mirror of sidebar/festival_detail.js) ---- */
const festivalQuery = ref('')
const filteredFestivals = computed(() => {
  const q = festivalQuery.value.trim().toLowerCase()
  const all = DATA.festivals || []
  return q ? all.filter((f) => stripHtml(f.name).toLowerCase().includes(q)) : all
})
const detailFestival = ref(null)
const festivalPlace = computed(() => parseLatLng(detailFestival.value?.place?.location))
function openFestivalDetail(f) {
  activePanel.value = 'festivals'
  detailFestival.value = f
  const c = parseLatLng(f?.place?.location)
  const map = mapRef.value?.getMap?.()
  if (map && c) map.moveCamera({ target: c, zoom: 18 })
}
function goFestival(f) { router.push({ name: RN.festivalDetail, params: { id: f.id } }) }
function routeToFestival() {
  if (!festivalPlace.value) return
  routeToPoint(detailFestival.value.place.name, festivalPlace.value)
}
// "2023-11-22T06:30:00Z" → "2023-11-22 06:30" (same split the original used).
function festivalDate(v) {
  if (!v) return '---'
  const [d, t] = String(v).split('T')
  if (!t) return d
  return `${d} ${t.replace(':00Z', '').replace('Z', '')}`
}

/* ---- tours / routes (mirror of sidebar/tours__tours-detail.js) ---- */
const tours = computed(() => DATA.routes || [])
// Tours carry no avatar in the static data; the original falls back to the same
// VR360 panorama (see getAvatar in portal/components/sidebar/tours__tours-detail.js).
const TOUR_FALLBACK = `${ASSET}/static/web_frontend/images/vr-360.jpg`
const tourQuery = ref('')
const filteredTours = computed(() => {
  const q = tourQuery.value.trim().toLowerCase()
  if (!q) return tours.value
  return tours.value.filter((t) =>
    [t.name, t.origin?.name, t.destination?.name].some((s) => stripHtml(s || '').toLowerCase().includes(q)),
  )
})
function tourImg(t) { return mediaUrl(t.avatar) || TOUR_FALLBACK }
const detailTour = ref(null)
const tourRoute = ref(null)
const tourLoading = ref(false)
// Every stop of the tour, in the order the data lists them.
const tourPoints = computed(() =>
  (detailTour.value?.points || [])
    .map((p) => ({ name: p.name, _c: parseLatLng(p.location) }))
    .filter((p) => p._c),
)
// Intermediate stops get their own 24px marker ("Đây là địa điểm tham quan
// trong tuyến"), exactly like handleRenderDirectTours did.
const tourStopPins = computed(() =>
  tourPoints.value.slice(1, -1).map((p, i) => ({
    ...p._c, title: `Địa điểm ${i + 1}`, snippet: 'Đây là địa điểm tham quan trong tuyến', icon: ICON_STOP, size: 24,
  })),
)
async function openTourDetail(t) {
  activePanel.value = 'tours'
  detailTour.value = t
  mode3d.value = false
  tourRoute.value = null
  const pts = tourPoints.value
  if (pts.length < 2) return
  tourLoading.value = true
  // The original walked tour routes on foot through the whole point list.
  try { tourRoute.value = await fetchRoute(pts[0]._c, pts[pts.length - 1]._c, 'foot', 0, pts.slice(1, -1).map((p) => p._c)) }
  catch { tourRoute.value = null }
  tourLoading.value = false
}
function goTour(t) { router.push({ name: RN.tourDetail, params: { id: t.id } }) }
function panToTourStop(p) {
  const map = mapRef.value?.getMap?.()
  if (map && p._c) map.moveCamera({ target: p._c, zoom: 18 })
}

/* ---- directions (REAL Map4D routing over api.map4d.vn/sdk/route) ---- */
const DIR_MODES = [
  { key: 'car', icon: 'ri-car-fill' },
  { key: 'motorcycle', icon: 'ri-motorbike-fill' },
  { key: 'bike', icon: 'ri-riding-line' },
  { key: 'foot', icon: 'ri-walk-line' },
]
const dirMode = ref('car')
const dirWeighting = ref('1')
const dirOrigin = ref(null) // { name, _c:{lat,lng} }
const dirDest = ref(null)
const dirOriginText = ref('')
const dirDestText = ref('')
const dirFocus = ref('') // 'origin' | 'dest' — which input is being edited
const dirRoute = ref(null) // { distanceText, durationText, steps, path }
const dirLoading = ref(false)
const dirViewDetails = ref(false)

// The map draws one polyline at a time: a tour route while a tour is open,
// otherwise the directions result.
const dirLine = computed(() => (detailTour.value ? tourRoute.value?.path : dirRoute.value?.path) || [])

// Dotted stubs from each endpoint to the first / last vertex of the real
// route path — the "#aaa" 2px pair the original portal drew alongside it.
const dashedLines = computed(() => {
  const path = dirLine.value
  if (!path || path.length < 2) return []
  const from = detailTour.value ? tourPoints.value[0]?._c : dirOrigin.value?._c
  const to = detailTour.value ? tourPoints.value[tourPoints.value.length - 1]?._c : dirDest.value?._c
  const out = []
  if (from) out.push([from, path[0]])
  if (to) out.push([path[path.length - 1], to])
  return out
})
const dirSearchList = computed(() => {
  const t = (dirFocus.value === 'dest' ? dirDestText.value : dirOriginText.value).trim().toLowerCase()
  const list = t ? withCoords.value.filter((p) => stripHtml(p.name).toLowerCase().includes(t)) : withCoords.value
  return list.slice(0, 8)
})
function pickDirPoint(p) {
  const pt = { name: stripHtml(p.name), _c: p._c }
  if (dirFocus.value === 'dest') { dirDest.value = pt; dirDestText.value = pt.name }
  else { dirOrigin.value = pt; dirOriginText.value = pt.name }
  dirFocus.value = ''
}
function onDirInput(which) { if (which === 'origin') dirOrigin.value = null; else dirDest.value = null }
async function computeRoute() {
  if (!dirOrigin.value || !dirDest.value) { dirRoute.value = null; return }
  dirLoading.value = true
  try { dirRoute.value = await fetchRoute(dirOrigin.value._c, dirDest.value._c, dirMode.value, dirWeighting.value) }
  catch { dirRoute.value = null }
  dirLoading.value = false
}
watch([dirOrigin, dirDest, dirMode, dirWeighting], computeRoute)
function swapDir() {
  const o = dirOrigin.value, ot = dirOriginText.value
  dirOrigin.value = dirDest.value; dirOriginText.value = dirDestText.value
  dirDest.value = o; dirDestText.value = ot
}
function clearDir() {
  dirOrigin.value = null; dirDest.value = null; dirRoute.value = null
  dirOriginText.value = ''; dirDestText.value = ''; dirViewDetails.value = false; dirFocus.value = ''
}
// Seed the directions panel with a destination and wait for the origin — the
// "Chỉ đường" action shared by the place / zone / festival detail views.
function routeToPoint(name, c) {
  if (!c) return
  activePanel.value = 'direction'; mode3d.value = false; dirViewDetails.value = false
  clearOverlays('direction')
  dirOrigin.value = null; dirOriginText.value = ''; dirRoute.value = null
  dirDest.value = { name, _c: c }; dirDestText.value = name
  dirFocus.value = 'origin'
}
function routeTo(p) { routeToPoint(stripHtml(p.name), p._c) }
function dirStepIcon(type) {
  if (type === 'finish') return 'ri-check-line'
  if (type === 'turn-right') return 'ri-arrow-right-line'
  if (type === 'turn-left' || type === 'keep-left') return 'ri-arrow-left-line'
  return 'ri-arrow-up-line'
}
// Click on the map to pick a routing point (origin by default, or whichever
// input is focused) — mirrors the original "nhấp trên bản đồ".
async function onMapClick(loc) {
  if (activePanel.value !== 'direction' || !loc || loc.lat == null) return
  const target = dirFocus.value === 'dest' ? 'dest' : 'origin'
  const label = `${(+loc.lat).toFixed(6)}, ${(+loc.lng).toFixed(6)}`
  const pt = { name: label, _c: { lat: +loc.lat, lng: +loc.lng } }
  if (target === 'dest') { dirDest.value = pt; dirDestText.value = label } else { dirOrigin.value = pt; dirOriginText.value = label }
  dirFocus.value = ''
  const addr = await reverseGeocode(loc.lat, loc.lng)
  if (addr) {
    pt.name = addr
    if (target === 'dest') dirDestText.value = addr
    else dirOriginText.value = addr
  }
}

/* ---- share (Web Share API, clipboard fallback) ---- */
function share(routeName, item) {
  const url = window.location.origin + router.resolve({ name: routeName, params: { id: item.id } }).href
  if (navigator.share) navigator.share({ title: stripHtml(item.name), url }).catch(() => {})
  else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {})
}
function sharePlace(p) { share(RN.locationDetail, p) }
function shareRelic(r) { share(RN.relicDetail, r) }
function shareFestival(f) { share(RN.festivalDetail, f) }
// Per-place narration audio (data field `audio`); falls back to site music.
const placeAudio = new Audio()
placeAudio.volume = 0.6
const placeAudioId = ref(null)
const placeAudioPlaying = ref(false)
placeAudio.addEventListener('ended', () => { placeAudioPlaying.value = false })
function togglePlaceAudio(p) {
  if (!p?.audio) { toggleAudio(); return }
  if (placeAudioPlaying.value && placeAudioId.value === p.id) { placeAudio.pause(); placeAudioPlaying.value = false; return }
  placeAudio.src = mediaUrl(p.audio); placeAudioId.value = p.id
  placeAudio.play().then(() => { placeAudioPlaying.value = true }).catch(() => {})
}
const audioActionIcon = computed(() =>
  placeAudioPlaying.value && placeAudioId.value === detailPlace.value?.id ? 'ri-pause-line' : 'ri-play-fill',
)

/* ---- VR360 gallery + modal ---- */
const vrList = computed(() => DATA.vr360 || [])
const vrUrl = ref('')
function openVr(v) { if (v.link) vrUrl.value = v.link }

/* ---- account panel ---- */
const accountOpen = ref(false)

/* ---- floating widgets ---- */
const audio = new Audio(AUDIO_SRC)
audio.loop = true
audio.volume = 0.1
const audioPlaying = ref(false)
const audioIcon = computed(() => (audioPlaying.value ? 'ri-volume-up-line' : 'ri-volume-mute-line'))
function toggleAudio() {
  if (audioPlaying.value) { audio.pause(); audioPlaying.value = false }
  else audio.play().then(() => (audioPlaying.value = true)).catch(() => {})
}

const isFullscreen = ref(false)
const fsIcon = computed(() => (isFullscreen.value ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'))
function toggleFullscreen() {
  if (!document.fullscreenElement) portalEl.value?.requestFullscreen?.().catch(() => {})
  else document.exitFullscreen?.().catch(() => {})
}
function onFullscreenChange() { isFullscreen.value = !!document.fullscreenElement }

// Show the icon of the CURRENT map style (3D map → 3D icon, 2D → satellite).
const mapTypeImg = computed(() => (mode3d.value ? IMG_3D : IMG_2D))
function toggleMapType() { mode3d.value = !mode3d.value }

/* ---- main search handlers ---- */
function onSearchHome() {
  activePanel.value = null; clearOverlays(null); clearDir()
  const map = mapRef.value?.getMap?.()
  if (map) map.moveCamera({ target: MAP_DEFAULTS.center, zoom: MAP_DEFAULTS.zoom, tilt: MAP_DEFAULTS.tilt, bearing: MAP_DEFAULTS.bearing })
}
function openDirections() { activePanel.value = 'direction'; mode3d.value = false }
// A single marker dropped by the main search box (the original's MarkerMap).
const searchPin = ref(null)
function onPickPoint(m) {
  if (m?.lat == null) return
  searchPin.value = { lat: m.lat, lng: m.lng, title: m.name || '' }
  const map = mapRef.value?.getMap?.()
  if (map) map.moveCamera({ target: { lat: m.lat, lng: m.lng }, zoom: 18 })
}

/* ---- quick-suggest category search (mirror of search_type.js +
   map_home.touristAttraction: Map4D viewbox-search by `types`) ---- */
const typeOpen = ref(false)
const typeLoading = ref(false)
const typeResults = ref([])
const typePicked = ref(null) // clicking a hit narrows the map down to it
const typePins = computed(() => {
  if (!typeOpen.value) return []
  if (typePicked.value) return [{ ...typePicked.value, title: typePicked.value.name }]
  return typeResults.value.map((r) => ({ lat: r.lat, lng: r.lng, title: r.name }))
})
async function openSearchType(item) {
  activePanel.value = null
  clearOverlays(null)
  typeOpen.value = true
  typePicked.value = null
  typeLoading.value = true
  typeResults.value = await searchMap4dByType(item.type_search)
  typeLoading.value = false
  // The original panned to the hits as it dropped their markers.
  const map = mapRef.value?.getMap?.()
  const first = typeResults.value[0]
  if (map && first) map.moveCamera({ target: { lat: first.lat, lng: first.lng } })
}
function closeSearchType() { typeOpen.value = false; typeResults.value = []; typePicked.value = null }
function pickTypeResult(r) {
  typePicked.value = { lat: r.lat, lng: r.lng, name: r.name }
  const map = mapRef.value?.getMap?.()
  if (map) map.moveCamera({ target: { lat: r.lat, lng: r.lng }, zoom: 18 })
}

/* ---- everything the map draws on top of the tiles ---- */
const mapPins = computed(() => {
  const out = []
  if (dirOrigin.value?._c) out.push({ ...dirOrigin.value._c, title: 'Địa điểm bắt đầu', icon: ICON_FROM, size: 16 })
  if (dirDest.value?._c) out.push({ ...dirDest.value._c, title: 'Địa điểm kết thúc' })
  if (detailTour.value) {
    // Tour endpoints get their own from.svg pin, just like the directions view.
    const first = tourPoints.value[0]?._c
    const last = tourPoints.value[tourPoints.value.length - 1]?._c
    if (first) out.push({ ...first, title: 'Địa điểm bắt đầu', icon: ICON_FROM, size: 16 })
    if (last) out.push({ ...last, title: 'Địa điểm kết thúc' })
    out.push(...tourStopPins.value)
  }
  // Opening a place / festival from the sidebar drops a marker on the map —
  // the original portal's `set-marker-location` → `MarkerMap` handoff.
  if (detailPlace.value?._c) out.push({ ...detailPlace.value._c, title: stripHtml(detailPlace.value.name) })
  if (festivalPlace.value) out.push({ ...festivalPlace.value, title: detailFestival.value?.place?.name || '' })
  out.push(...typePins.value)
  if (searchPin.value) out.push(searchPin.value)
  return out
})

/* ---- upcoming festival popup (drum widget) ---- */
const festivalOpen = ref(false)
const upcoming = computed(() => DATA.festivals[0] || null)
function festivalCover(f) { return mediaUrl(f?.avatar) || mediaUrl(f?.images?.[0]?.img || f?.images?.[0]?.image) || SITE.cover }

onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
onBeforeUnmount(() => {
  audio.pause()
  placeAudio.pause()
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
  <div ref="portalEl" class="iot-portal" :class="{ 'full-screen': isFullscreen }">
    <!-- ===== left tool rail (was #centerBottomNav) ===== -->
    <nav class="iot-rail">
      <div class="iot-rail__group">
        <button v-for="it in RAIL_ITEMS" :key="it.key" type="button" class="iot-rail__btn"
                :class="{ active: activePanel === it.key }" :title="it.title" @click="togglePanel(it.key)">
          <i :class="it.icon"></i>
        </button>
      </div>
      <div class="iot-rail__group">
        <button type="button" class="iot-rail__btn" title="Tài khoản" @click="accountOpen = !accountOpen">
          <i class="ri-user-settings-fill"></i>
        </button>
      </div>
    </nav>

    <!-- ===== offcanvas: featured places (+ inline detail) ===== -->
    <IotOffcanvas :model-value="activePanel === 'places'" :left="RAIL" width="380px" title="ĐỊA ĐIỂM NỔI BẬT"
                  @update:model-value="(v) => setPanel(v, 'places')">
      <template v-if="detailPlace" #head>
        <button type="button" class="oc-back" @click="detailPlace = null" aria-label="Quay lại">
          <i class="mdi mdi-keyboard-backspace fs-22"></i>
        </button>
        <h5 class="oc-head-title">Chi tiết địa điểm</h5>
        <button type="button" class="oc-x" @click="activePanel = null" aria-label="Đóng"><i class="ri-close-line"></i></button>
      </template>

      <!-- detail view -->
      <template v-if="detailPlace">
        <div class="place-detail">
          <div class="place-detail__media">
            <img v-if="mediaUrl(detailPlace.avatar)" :src="mediaUrl(detailPlace.avatar)" alt="" />
            <i v-else class="ri-image-2-line"></i>
          </div>
          <h5 class="place-detail__name" v-html="detailPlace.name"></h5>
          <StarRating v-if="detailPlace.rating" :value="detailPlace.rating.average || 0" :count="detailPlace.rating.count || 0" :size="14" />

          <!-- 4-action row (mirror of the original location detail) -->
          <div class="pd-actions">
            <a class="pd-action" @click="routeTo(detailPlace)">
              <span class="pd-ico"><i class="ri-direction-fill"></i></span><span>Chỉ đường</span>
            </a>
            <a class="pd-action" @click="sharePlace(detailPlace)">
              <span class="pd-ico"><i class="ri-share-fill"></i></span><span>Chia sẻ</span>
            </a>
            <a class="pd-action" :class="{ disabled: !detailPlace.audio }" @click="togglePlaceAudio(detailPlace)">
              <span class="pd-ico"><i :class="audioActionIcon"></i></span><span>Audio</span>
            </a>
            <a class="pd-action" :class="{ disabled: !vrList.length }" @click="vrList[0] && openVr(vrList[0])">
              <span class="pd-ico"><i class="mdi mdi-virtual-reality"></i></span><span>VR360</span>
            </a>
          </div>

          <p v-if="detailPlace.description_short" class="text-muted mt-1" v-html="detailPlace.description_short"></p>

          <table class="pd-info">
            <tbody>
              <tr><td><i class="ri-phone-fill"></i></td><td>{{ detailPlace.phone_number || '---' }}</td></tr>
              <tr><td><i class="ri-global-line"></i></td><td>
                <a v-if="detailPlace.website" :href="detailPlace.website" target="_blank" rel="noopener">{{ detailPlace.website }}</a>
                <span v-else>---</span>
              </td></tr>
              <tr><td><i class="ri-map-pin-line"></i></td><td>{{ detailPlace.location || '---' }}</td></tr>
            </tbody>
          </table>

          <div v-if="detailPlace.description" class="place-detail__desc" v-html="detailPlace.description"></div>

          <!-- VR360 gallery -->
          <template v-if="vrList.length">
            <h6 class="place-detail__sub">VR 360</h6>
            <div class="vr360">
              <button v-for="v in vrList" :key="v.id" type="button" class="vr360__item" :title="v.caption" @click="openVr(v)">
                <img :src="mediaUrl(v.image) || SITE.cover" alt="" />
                <span class="vr360__play"><i class="ri-vr-box-line"></i></span>
              </button>
            </div>
          </template>

          <a class="pd-more" @click="openFullPage(detailPlace)">Xem chi tiết <i class="ri-arrow-right-line align-bottom"></i></a>
        </div>
      </template>

      <!-- list view -->
      <template v-else>
        <div class="oc-search-row">
          <div class="oc-search">
            <i class="ri-search-line"></i>
            <input v-model="query" type="text" class="form-control" placeholder="Tìm kiếm" />
          </div>
          <button type="button" class="btn btn-primary oc-search-btn" aria-label="Tìm kiếm"><i class="ri-search-line"></i></button>
        </div>
        <ul class="oc-list">
          <li v-for="p in filtered" :key="p.id" class="oc-item" @click="openPlaceDetail(p)">
            <div class="oc-item__thumb">
              <img v-if="mediaUrl(p.avatar)" :src="mediaUrl(p.avatar)" alt="" loading="lazy" />
              <i v-else class="ri-map-pin-2-line"></i>
            </div>
            <div class="oc-item__meta">
              <div class="oc-item__name" v-html="p.name"></div>
              <div v-if="p.description_short" class="oc-item__desc" v-html="p.description_short"></div>
            </div>
          </li>
          <li v-if="!filtered.length" class="text-muted p-2">Không có dữ liệu</li>
        </ul>
      </template>
    </IotOffcanvas>

    <!-- ===== offcanvas: zones / relics (+ inline detail with GeoJSON outline) ===== -->
    <IotOffcanvas :model-value="activePanel === 'relics'" :left="RAIL" width="380px" title="CỤM PHÂN KHU"
                  @update:model-value="(v) => setPanel(v, 'relics')">
      <template v-if="detailRelic" #head>
        <button type="button" class="oc-back" @click="detailRelic = null" aria-label="Quay lại">
          <i class="mdi mdi-keyboard-backspace fs-22"></i>
        </button>
        <h5 class="oc-head-title">Chi tiết Phân khu</h5>
        <button type="button" class="oc-x" @click="activePanel = null" aria-label="Đóng"><i class="ri-close-line"></i></button>
      </template>

      <!-- detail view -->
      <template v-if="detailRelic">
        <div class="place-detail">
          <div class="place-detail__media">
            <img v-if="mediaUrl(detailRelic.avatar)" :src="mediaUrl(detailRelic.avatar)" alt="" />
            <i v-else class="ri-landscape-line"></i>
          </div>
          <h5 class="place-detail__name" v-html="detailRelic.name"></h5>

          <div class="pd-actions">
            <a class="pd-action" :class="{ disabled: !relicCenter }" @click="routeToRelic">
              <span class="pd-ico"><i class="ri-direction-fill"></i></span><span>Chỉ đường</span>
            </a>
            <a class="pd-action" @click="shareRelic(detailRelic)">
              <span class="pd-ico"><i class="ri-share-fill"></i></span><span>Chia sẻ</span>
            </a>
            <a class="pd-action" :class="{ disabled: !vrList.length }" @click="vrList[0] && openVr(vrList[0])">
              <span class="pd-ico"><i class="mdi mdi-virtual-reality"></i></span><span>VR360</span>
            </a>
          </div>

          <table class="pd-info">
            <tbody>
              <tr><td><i class="ri-shape-2-line"></i></td><td>Tổng diện tích: <b v-if="detailRelic.total_area">{{ detailRelic.total_area.toLocaleString('vi-VN') }} m²</b><b v-else>---</b></td></tr>
              <tr><td><i class="ri-home-8-line"></i></td><td>Tổng số công trình: <b>{{ detailRelic.total_works ?? '---' }}</b></td></tr>
            </tbody>
          </table>

          <div v-if="detailRelic.description" class="place-detail__desc" v-html="detailRelic.description"></div>
          <a class="pd-more" @click="goRelic(detailRelic)">Xem chi tiết <i class="ri-arrow-right-line align-bottom"></i></a>
        </div>
      </template>

      <!-- list view -->
      <template v-else>
        <div class="oc-search-row">
          <div class="oc-search">
            <i class="ri-search-line"></i>
            <input v-model="relicQuery" type="text" class="form-control" placeholder="Tìm kiếm" />
          </div>
          <button type="button" class="btn btn-primary oc-search-btn" aria-label="Tìm kiếm"><i class="ri-search-line"></i></button>
        </div>
        <ul class="oc-list">
          <li v-for="r in filteredRelics" :key="r.id" class="oc-item" @click="openRelicDetail(r)">
            <div class="oc-item__thumb">
              <img v-if="mediaUrl(r.avatar)" :src="mediaUrl(r.avatar)" alt="" loading="lazy" />
              <i v-else class="ri-landscape-line"></i>
            </div>
            <div class="oc-item__meta">
              <div class="oc-item__name" v-html="r.name"></div>
              <div v-if="r.total_area" class="oc-item__sub">Diện tích: {{ r.total_area.toLocaleString('vi-VN') }} m²</div>
              <div class="oc-item__sub">Số công trình: {{ r.total_works ?? 0 }}</div>
            </div>
          </li>
          <li v-if="!filteredRelics.length" class="text-muted p-2">Không có Phân khu nào!</li>
        </ul>
      </template>
    </IotOffcanvas>

    <!-- ===== offcanvas: festivals (+ inline detail) ===== -->
    <IotOffcanvas :model-value="activePanel === 'festivals'" :left="RAIL" width="380px" title="Sự kiện và lễ hội"
                  @update:model-value="(v) => setPanel(v, 'festivals')">
      <template v-if="detailFestival" #head>
        <button type="button" class="oc-back" @click="detailFestival = null" aria-label="Quay lại">
          <i class="mdi mdi-keyboard-backspace fs-22"></i>
        </button>
        <h5 class="oc-head-title">Chi tiết lễ hội</h5>
        <button type="button" class="oc-x" @click="activePanel = null" aria-label="Đóng"><i class="ri-close-line"></i></button>
      </template>

      <!-- detail view -->
      <template v-if="detailFestival">
        <div class="place-detail">
          <div class="place-detail__media"><img :src="festivalCover(detailFestival)" alt="" /></div>
          <h5 class="place-detail__name" v-html="detailFestival.name"></h5>

          <div class="pd-actions">
            <a class="pd-action" :class="{ disabled: !festivalPlace }" @click="routeToFestival">
              <span class="pd-ico"><i class="ri-direction-fill"></i></span><span>Chỉ đường</span>
            </a>
            <a class="pd-action" @click="shareFestival(detailFestival)">
              <span class="pd-ico"><i class="ri-share-fill"></i></span><span>Chia sẻ</span>
            </a>
          </div>

          <p v-if="detailFestival.description_short" class="text-muted mt-1" v-html="detailFestival.description_short"></p>

          <table class="pd-table">
            <tbody>
              <tr><td>Ngày bắt đầu</td><td>{{ festivalDate(detailFestival.start_date) }}</td></tr>
              <tr><td>Ngày kết thúc</td><td>{{ festivalDate(detailFestival.end_date) }}</td></tr>
              <tr><td>Địa chỉ</td><td>{{ detailFestival.place?.name || '---' }}</td></tr>
            </tbody>
          </table>

          <h6 class="place-detail__sub">Mô tả</h6>
          <div class="place-detail__desc" v-html="detailFestival.description"></div>
          <a class="pd-more" @click="goFestival(detailFestival)">Xem chi tiết <i class="ri-arrow-right-line align-bottom"></i></a>
        </div>
      </template>

      <!-- list view -->
      <template v-else>
        <div class="oc-search-row">
          <div class="oc-search">
            <i class="ri-search-line"></i>
            <input v-model="festivalQuery" type="text" class="form-control" placeholder="Tìm kiếm" />
          </div>
          <button type="button" class="btn btn-primary oc-search-btn" aria-label="Tìm kiếm"><i class="ri-search-line"></i></button>
        </div>
        <ul class="oc-list">
          <li v-for="f in filteredFestivals" :key="f.id" class="oc-item oc-item--col" @click="openFestivalDetail(f)">
            <div class="oc-item__banner"><img :src="festivalCover(f)" alt="" /></div>
            <div class="oc-item__name" v-html="f.name"></div>
            <div v-if="f.place" class="oc-item__sub"><i class="ri-map-pin-line me-1"></i>{{ f.place.name }}</div>
            <p class="oc-item__desc" v-html="f.description_short"></p>
          </li>
          <li v-if="!filteredFestivals.length" class="text-muted p-2">Không có lễ hội nào!</li>
        </ul>
      </template>
    </IotOffcanvas>

    <!-- ===== offcanvas: tours / routes (+ inline detail that walks the route) ===== -->
    <IotOffcanvas :model-value="activePanel === 'tours'" :left="RAIL" width="400px" title="Tuyến du lịch"
                  @update:model-value="(v) => setPanel(v, 'tours')">
      <template v-if="detailTour" #head>
        <button type="button" class="oc-back" @click="detailTour = null; tourRoute = null" aria-label="Quay lại">
          <i class="mdi mdi-keyboard-backspace fs-22"></i>
        </button>
        <h5 class="oc-head-title">Chi tiết tuyến du lịch</h5>
        <button type="button" class="oc-x" @click="activePanel = null" aria-label="Đóng"><i class="ri-close-line"></i></button>
      </template>

      <!-- detail view -->
      <template v-if="detailTour">
        <div class="place-detail">
          <div class="tour-logo"><img :src="SITE.logo1" alt="" /></div>
          <div class="text-center">
            <h5 class="place-detail__name" v-html="detailTour.name"></h5>
            <p class="text-info mb-2">{{ detailTour.is_active === false ? 'Tạm ngưng hoạt động' : 'Đang hoạt động' }}</p>
          </div>

          <table class="pd-table">
            <tbody>
              <tr v-if="detailTour.distance"><td>Chiều dài lộ trình</td><td>{{ detailTour.distance }} km</td></tr>
              <tr v-else-if="tourRoute"><td>Chiều dài lộ trình</td><td>{{ tourRoute.distanceText }}</td></tr>
              <tr><td>Điểm bắt đầu</td><td>{{ detailTour.origin?.name || '---' }}</td></tr>
              <tr><td>Điểm kết thúc</td><td>{{ detailTour.destination?.name || '---' }}</td></tr>
              <tr><td>Điện thoại</td><td>{{ detailTour.phone_number || '---' }}</td></tr>
            </tbody>
          </table>

          <div v-if="tourLoading" class="text-muted fs-13">Đang tìm lộ trình…</div>

          <h6 class="place-detail__sub">Mô tả</h6>
          <div class="place-detail__desc" v-html="detailTour.description"></div>

          <h6 class="place-detail__sub">Danh sách điểm dừng</h6>
          <ul class="tour-stops">
            <li v-for="(p, i) in tourPoints" :key="i" @click="panToTourStop(p)">
              <i class="ri-map-pin-line text-info align-middle me-2"></i>{{ p.name }}
            </li>
            <li v-if="!tourPoints.length" class="text-muted">Không có điểm dừng</li>
          </ul>
          <a class="pd-more" @click="goTour(detailTour)">Xem chi tiết <i class="ri-arrow-right-line align-bottom"></i></a>
        </div>
      </template>

      <!-- list view -->
      <template v-else>
        <div class="oc-search-row">
          <div class="oc-search">
            <i class="ri-search-line"></i>
            <input v-model="tourQuery" type="text" class="form-control" placeholder="Tìm kiếm" />
          </div>
          <button type="button" class="btn btn-primary oc-search-btn" aria-label="Tìm kiếm"><i class="ri-search-line"></i></button>
        </div>
        <ul class="oc-list">
          <li v-for="t in filteredTours" :key="t.id" class="oc-item" @click="openTourDetail(t)">
            <img class="tour-thumb" :src="tourImg(t)" alt="" loading="lazy" />
            <div class="tour-info">
              <h6 class="tour-name" v-html="t.name"></h6>
              <p v-if="t.origin" class="tour-line"><b>Xuất phát: </b>{{ t.origin.name }}</p>
              <p v-if="t.destination" class="tour-line"><b>Kết thúc: </b>{{ t.destination.name }}</p>
            </div>
          </li>
          <li v-if="!filteredTours.length" class="text-muted p-2">Không có tuyến du lịch nào!</li>
        </ul>
      </template>
    </IotOffcanvas>

    <!-- ===== offcanvas: quick-suggest category results (was #offcanvas-searchType) ===== -->
    <IotOffcanvas :model-value="typeOpen" :left="RAIL" width="360px" title="Kết quả tìm kiếm"
                  @update:model-value="(v) => { if (!v) closeSearchType() }">
      <ul class="oc-list">
        <li v-for="(r, i) in typeResults" :key="i" class="oc-item" @click="pickTypeResult(r)">
          <div class="oc-item__thumb st-thumb">
            <img src="https://map.map4d.vn/mapAppRoot/imageDefault/avater-default.png" alt="" loading="lazy" />
          </div>
          <div class="oc-item__meta">
            <div class="oc-item__name">{{ r.name }}</div>
            <div class="oc-item__desc">{{ r.address }}</div>
          </div>
        </li>
        <li v-if="typeLoading" class="text-muted p-2">Đang tìm kiếm…</li>
        <li v-else-if="!typeResults.length" class="text-muted p-2">Không có dữ liệu</li>
      </ul>
    </IotOffcanvas>

    <!-- ===== offcanvas: directions (real Map4D routing) ===== -->
    <IotOffcanvas :model-value="activePanel === 'direction'" :left="RAIL" width="360px" title="Chỉ đường"
                  @update:model-value="(v) => { setPanel(v, 'direction'); if (!v) clearDir() }">
      <!-- form view -->
      <div v-if="!dirViewDetails" class="dir">
        <div class="dir__modes">
          <button v-for="m in DIR_MODES" :key="m.key" type="button"
                  class="btn btn-sm rounded-pill dir__mode" :class="dirMode === m.key ? 'btn-primary' : 'btn-outline-primary'"
                  @click="dirMode = m.key"><i :class="m.icon"></i></button>
        </div>
        <div class="dir__row">
          <div class="dir__edge">
            <i class="ri-checkbox-blank-circle-line"></i>
            <i class="bx bx-dots-vertical-rounded"></i>
            <i class="mdi mdi-map-marker-radius-outline" style="color:#e47068"></i>
          </div>
          <div class="dir__inputs">
            <input type="text" class="form-control" placeholder="Chọn điểm bắt đầu hoặc nhấp trên bản đồ"
                   v-model="dirOriginText" @focus="dirFocus = 'origin'" @input="onDirInput('origin')" />
            <input type="text" class="form-control mt-2" placeholder="Chọn điểm đến…"
                   v-model="dirDestText" @focus="dirFocus = 'dest'" @input="onDirInput('dest')" />
          </div>
          <button type="button" class="btn btn-icon btn-ghost-secondary rounded-circle dir__swap" title="Đảo chiều" @click="swapDir">
            <i class="ri-arrow-up-down-line fs-20"></i>
          </button>
        </div>
        <div class="input-group input-group-sm mt-2">
          <label class="input-group-text">Tìm kiếm</label>
          <select v-model="dirWeighting" class="form-select">
            <option value="0">Ngắn nhất</option>
            <option value="1">Nhanh nhất</option>
            <option value="2">Cân bằng</option>
          </select>
        </div>
        <ul v-if="dirFocus" class="dir__list">
          <li v-for="p in dirSearchList" :key="p.id" @mousedown.prevent="pickDirPoint(p)">
            <i class="ri-map-pin-line"></i> <span v-html="p.name"></span>
          </li>
          <li v-if="!dirSearchList.length" class="text-muted">Không có địa điểm</li>
        </ul>
        <div v-if="dirLoading" class="dir__result text-muted">Đang tìm đường…</div>
        <div v-else-if="dirRoute" class="dir__result">
          <table>
            <tbody>
              <tr class="fw-semibold"><td style="width:90px">Khoảng cách:</td><td>{{ dirRoute.distanceText }}</td></tr>
              <tr><td>Thời gian:</td><td>{{ dirRoute.durationText }}</td></tr>
            </tbody>
          </table>
          <span v-if="dirRoute.steps.length" class="dir__more" @click="dirViewDetails = true">Xem chi tiết</span>
        </div>
        <div v-else-if="dirOrigin && dirDest" class="dir__result text-muted">Không tìm được tuyến đường.</div>
      </div>

      <!-- turn-by-turn detail view -->
      <div v-else class="dir-detail">
        <div class="dir-detail__bar">
          <i class="mdi mdi-keyboard-backspace" @click="dirViewDetails = false"></i>
          <div>
            <div><span>Từ: </span>{{ dirOriginText }}</div>
            <div><span>Đến: </span>{{ dirDestText }}</div>
          </div>
        </div>
        <div v-if="dirRoute" class="dir-detail__sum">{{ dirRoute.durationText }} <span>({{ dirRoute.distanceText }})</span></div>
        <div v-for="(s, i) in dirRoute?.steps || []" :key="i" class="dir-detail__step">
          <i :class="dirStepIcon(s.type)"></i>
          <div class="w-100"><p v-html="s.name"></p><div class="dir-detail__met"><span>{{ s.met }}</span><hr /></div></div>
        </div>
      </div>
    </IotOffcanvas>

    <!-- ===== offcanvas: account ===== -->
    <IotOffcanvas :model-value="accountOpen" :left="RAIL" width="240px" title="Tài khoản"
                  @update:model-value="(v) => (accountOpen = v)">
      <div class="d-flex align-items-center mb-3">
        <img :src="`${ASSET}/media/photos/avatar-1.jpg`" alt="" class="avatar-sm rounded" />
        <div class="ms-2"><h6 class="fs-14 mb-0">admin</h6></div>
      </div>
      <div class="list-group list-group-flush">
        <!-- <a :href="`${ASSET}/dashboard`" target="_blank" rel="noopener" class="list-group-item list-group-item-action">
          <i class="ri-home-gear-line text-warning align-middle me-2"></i>Trang quản trị
        </a> -->
        <button type="button" class="list-group-item list-group-item-action" @click="accountOpen = false">
          <i class="mdi mdi-logout text-danger align-middle me-2"></i>Đăng xuất
        </button>
      </div>
    </IotOffcanvas>

    <!-- ===== main search (separate) + quick suggest (top centre) ===== -->
    <div class="iot-portal__top">
      <IotMainSearch :places="withCoords" @home="onSearchHome" @directions="openDirections"
                     @pick-place="openPlaceDetail" @pick-point="onPickPoint" />
      <div class="iot-suggest">
        <button v-for="item in LOCATION_TYPES" :key="item.type_search" type="button"
                class="btn btn-primary btn-icon waves-effect waves-light itemQuickSuggest"
                @click="openSearchType(item)">
          <i :class="item.class"></i><span v-html="item.name"></span>
        </button>
      </div>
    </div>

    <!-- ===== map ===== -->
    <div class="iot-map-wrap">
      <Map4dView ref="mapRef" :center="MAP_DEFAULTS.center" :zoom="MAP_DEFAULTS.zoom" :tilt="MAP_DEFAULTS.tilt"
                 :bearing="MAP_DEFAULTS.bearing" :markers="[]" :pins="mapPins" :geojson="relicZones"
                 :mode3d="mode3d" :fit="false"
                 :polyline="dirLine" :dashed-lines="dashedLines"
                 height="100%" @marker-click="onMarkerClick" @map-click="onMapClick" />
    </div>

    <!-- ===== bottom-right floating widgets ===== -->
    <div class="iot-widgets">
      <div class="center item-in-list-widget" title="Sự kiện & lễ hội" @click="festivalOpen = !festivalOpen">
        <img :src="IMG_DRUM" width="18" height="18" alt="" />
      </div>
      <div class="center item-in-list-widget" title="Âm thanh" @click="toggleAudio"><i :class="audioIcon"></i></div>
      <div class="center item-in-list-widget" title="Toàn màn hình" @click="toggleFullscreen"><i :class="fsIcon"></i></div>
      <div class="center item-in-list-widget" title="Bản đồ 2D / 3D" @click="toggleMapType">
        <img :src="mapTypeImg" alt="" width="29" height="29" />
      </div>
    </div>

    <!-- ===== upcoming festival popup ===== -->
    <transition name="iot-fade">
      <div v-if="festivalOpen && upcoming" class="iot-event">
        <div class="event-head">
          <span class="fw-bold text-truncate">Sự kiện sắp diễn ra</span>
          <button class="oc-x" @click="festivalOpen = false">&times;</button>
        </div>
        <div class="event-body" @click="goFestival(upcoming)">
          <div class="event-thumb"><img :src="festivalCover(upcoming)" alt="" /></div>
          <h6 class="event-name" v-html="upcoming.name"></h6>
          <p class="event-desc" v-html="upcoming.description_short"></p>
          <span class="event-cta">Xem chi tiết <i class="ri-arrow-right-line"></i></span>
        </div>
      </div>
    </transition>

    <!-- ===== marker preview popup ===== -->
    <transition name="iot-pop">
      <div v-if="selected" class="iot-portal__popup">
        <button class="iot-portal__popup-close" @click="selected = null">&times;</button>
        <div class="iot-portal__popup-media">
          <img v-if="mediaUrl(selected.avatar)" :src="mediaUrl(selected.avatar)" alt="" />
          <i v-else class="ri-image-2-line"></i>
        </div>
        <div class="iot-portal__popup-body">
          <h3 v-html="selected.name"></h3>
          <p v-if="selected.description_short" class="text-muted" v-html="selected.description_short"></p>
          <button class="btn btn-primary btn-sm w-100" @click="openPlaceDetail(selected)">Xem chi tiết</button>
        </div>
      </div>
    </transition>

    <!-- ===== VR360 modal ===== -->
    <IotVr360Modal :url="vrUrl" @close="vrUrl = ''" />
  </div>
</template>

<style scoped>
/* ---- portal shell (map fills the viewport below the 116px header) ---- */
.iot-portal { position: relative; width: 100%; height: calc(100vh - var(--iot-header-h, 116px)); overflow: hidden; background: #dfe6e3; }
.iot-portal.full-screen { height: 100vh; }
.iot-map-wrap { width: 100%; height: 100%; }

/* ---- left tool rail ---- */
.iot-rail { position: absolute; left: 0; top: 0; height: 100%; width: 60px; z-index: 6; background: #fff; box-shadow: 0 0 4px #666; display: flex; flex-direction: column; justify-content: space-between; }
.iot-rail__group { display: flex; flex-direction: column; }
.iot-rail__btn { width: 60px; height: 60px; border: none; background: #fff; color: #495057; font-size: 22px; cursor: pointer; display: grid; place-items: center; border-bottom: 1px solid #f1f1f1; transition: .2s; }
.iot-rail__btn:hover { background: #f6f7f9; color: var(--iot-primary); }
.iot-rail__btn.active { color: var(--vz-danger);}

/* ---- offcanvas inner content ---- */
.oc-back, .oc-x { border: none; background: none; cursor: pointer; color: #878a99; padding: 0 4px; line-height: 1; }
.oc-back { color: var(--iot-primary); font-size: 22px; }
.oc-x { font-size: 22px; }
.oc-head-title { margin: 0; flex: 1; font-size: 15px; font-weight: 700; }
.oc-search-row { display: flex; gap: 10px; margin-bottom: 6px; }
.oc-search { position: relative; flex: 1; display: flex; align-items: center; }
.oc-search i { position: absolute; left: 12px; color: #878a99; }
.oc-search .form-control { padding-left: 36px; height: 44px; border-radius: 8px; }
.oc-search-btn { width: 64px; height: 44px; border-radius: 8px; flex: none; display: grid; place-items: center; font-size: 18px; }
.oc-list { list-style: none; margin: 0; padding: 0; }
.oc-item { display: flex; gap: 12px; padding: 12px 4px; border-top: 1px solid #eef0f2; cursor: pointer; align-items: flex-start; }
.oc-item:first-child { border-top: none; }
.oc-item:hover { background: #f6f7f9; }
.oc-item--col { flex-direction: column; align-items: stretch; }
.oc-item__thumb { width: 112px; height: 84px; border-radius: 8px; overflow: hidden; background: #eef2f7; display: grid; place-items: center; flex: none; color: #a9b0bd; font-size: 24px; }
.oc-item__thumb img { width: 100%; height: 100%; object-fit: cover; }
.oc-item__banner { height: 120px; border-radius: 6px; overflow: hidden; background: #eef2f7; margin-bottom: 8px; }
.oc-item__banner img { width: 100%; height: 100%; object-fit: cover; }
.oc-item__meta { min-width: 0; flex: 1; padding-top: 2px; }
.oc-item__name { font-weight: 700; font-size: 15px; line-height: 1.3; color: #212529; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.oc-item__sub { font-size: 12.5px; color: #878a99; margin-top: 2px; }
.oc-item__desc { font-size: 13px; color: #9aa0ab; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* tour rows: 2:1 panorama thumb + name over "Xuất phát / Kết thúc" (mirrors the
   original .list-group-item-action img / .list-item-info) */
.tour-thumb { width: 100px; aspect-ratio: 2 / 1; flex: none; border-radius: 4px; object-fit: cover; background: #eef2f7; }
.tour-info { min-width: 0; flex: 1; }
.tour-name { font-size: 15px; font-weight: 600; line-height: 1.5; color: #212529; margin: 0 0 4px; }
.tour-line { font-size: 12px; color: #878a99; margin: 0 0 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tour-line b { color: #212529; font-weight: 600; }

/* place detail */
.place-detail__media { height: 160px; border-radius: 8px; overflow: hidden; background: #eef2f7; display: grid; place-items: center; color: #a9b0bd; font-size: 30px; margin-bottom: 10px; }
.place-detail__media img { width: 100%; height: 100%; object-fit: cover; }
.place-detail__name { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
.place-detail__sub { font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--iot-primary); margin: 16px 0 8px; }
.place-detail__desc { font-size: 13.5px; color: #495057; }
.place-detail__desc :deep(img) { max-width: 100%; border-radius: 6px; }
/* 4-action row */
.pd-actions { display: flex; gap: 4px; margin: 14px 0; border-top: 1px solid #eef0f2; border-bottom: 1px solid #eef0f2; padding: 12px 0; }
.pd-action { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; color: #6c757d; font-size: 12px; text-align: center; }
.pd-action.disabled { opacity: .45; pointer-events: none; }
.pd-ico { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; background: rgba(var(--iot-primary-rgb), .12); color: var(--iot-primary); }
.pd-info { width: 100%; margin: 6px 0; border-collapse: collapse; }
.pd-info td { padding: 6px 0; font-size: 13px; vertical-align: top; color: #495057; }
.pd-info td:first-child { width: 30px; color: var(--iot-primary); font-size: 18px; }
.pd-info a { color: var(--iot-primary); text-decoration: underline; word-break: break-all; }
.pd-more { display: inline-block; margin-top: 14px; color: var(--iot-primary); text-decoration: underline; font-size: 13px; cursor: pointer; }
/* borderless label/value table used by the festival + tour detail views */
.pd-table { width: 100%; margin: 6px 0 2px; border-collapse: collapse; font-size: 13.5px; }
.pd-table td { padding: 7px 0; border-bottom: 1px solid #eef0f2; vertical-align: top; color: #495057; }
.pd-table td:first-child { width: 130px; font-weight: 600; color: #212529; }

/* tour detail: brand logo tile + clickable stop list */
.tour-logo { width: 72px; height: 72px; margin: 0 auto 12px; border-radius: 8px; background: #f3f6f9; display: grid; place-items: center; }
.tour-logo img { max-width: 48px; max-height: 48px; object-fit: contain; }
.tour-stops { list-style: none; margin: 0; padding: 0; }
.tour-stops li { padding: 10px 2px; border-bottom: 1px solid #eef0f2; font-size: 13.5px; cursor: pointer; }
.tour-stops li:hover { background: #f6f7f9; }

/* category-search result rows use a small square avatar, not a 4:3 thumb */
.st-thumb { width: 64px; height: 64px; }

/* VR360 gallery */
.vr360 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.vr360__item { position: relative; border: none; padding: 0; height: 64px; border-radius: 6px; overflow: hidden; cursor: pointer; background: #000; }
.vr360__item img { width: 100%; height: 100%; object-fit: cover; opacity: .85; }
.vr360__play { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-size: 20px; text-shadow: 0 1px 4px rgba(0,0,0,.6); }

/* directions */
.dir__modes { display: flex; justify-content: space-around; gap: 6px; margin-bottom: 14px; }
.dir__mode { width: 56px; }
.dir__row { display: flex; align-items: flex-start; gap: 8px; }
.dir__edge { display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding-top: 12px; height: 82px; font-size: 18px; color: #495057; }
.dir__inputs { flex: 1; min-width: 0; }
.dir__swap { flex: none; align-self: center; }
.dir__list { list-style: none; margin: 8px 0 0; padding: 0; max-height: 240px; overflow-y: auto; }
.dir__list li { display: flex; align-items: center; gap: 6px; padding: 8px 4px; border-bottom: 1px solid #f1f1f1; cursor: pointer; font-size: 13px; }
.dir__list li:hover { background: #eef2f7; }
.dir__list li i { color: #878a99; }
.dir__result { background: #eef2f7; border-radius: 8px; padding: 10px 12px; font-size: 13.5px; margin-top: 12px; }
.dir__result table td { padding: 2px 0; }
.dir__more { display: inline-block; margin-top: 6px; color: var(--iot-primary); cursor: pointer; font-weight: 600; }
/* turn-by-turn detail */
.dir-detail__bar { display: flex; align-items: center; gap: 10px; background: var(--iot-primary); color: #fff; padding: 10px 12px; border-radius: 8px; }
.dir-detail__bar i { font-size: 22px; cursor: pointer; }
.dir-detail__bar span { opacity: .8; }
.dir-detail__sum { font-size: 17px; margin: 12px 2px; }
.dir-detail__sum span { color: #70757a; }
.dir-detail__step { display: flex; gap: 12px; margin-top: 12px; align-items: flex-start; }
.dir-detail__step > i { font-size: 22px; color: #495057; margin-top: 2px; }
.dir-detail__step p { margin: 0 0 4px; font-size: 13.5px; }
.dir-detail__met { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #878a99; }
.dir-detail__met hr { flex: 1; margin: 0; }

/* ---- floating search + quick-suggest (top centre) ---- */
.iot-portal__top { position: absolute; top: 10px; left: 60px; right: 0; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; }
.iot-suggest { pointer-events: auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; width: min(424px, 96vw); }
.itemQuickSuggest { height: 30px; min-width: 110px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; border-radius: 6px; box-shadow: 0 0 4px rgba(0,0,0,.25); }
.itemQuickSuggest span { white-space: nowrap; }

/* ---- bottom-right widgets (mirror of the original #listWidgets) ---- */
.iot-widgets { position: absolute; right: 10px; bottom: 10px; z-index: 5; height: 140px; display: flex; flex-direction: column; justify-content: space-between; }
.item-in-list-widget { width: 29px; height: 29px; margin: 3px; border-radius: 2px; background: #fff; box-shadow: 0 0 4px #666; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; transition: .25s; font-size: 16px; color: #333; }
.item-in-list-widget:hover { color: var(--iot-primary); }
.item-in-list-widget img { object-fit: contain; }

/* ---- upcoming festival popup ---- */
.iot-event { position: absolute; right: 20px; top: 20px; z-index: 6; width: 300px; max-width: 88vw; background: #fff; border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,.18); overflow: hidden; }
.event-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #e9ebec; }
.event-body { padding: 12px 14px; cursor: pointer; }
.event-thumb { height: 130px; border-radius: 6px; overflow: hidden; background: #eef2f7; margin-bottom: 10px; }
.event-thumb img { width: 100%; height: 100%; object-fit: cover; }
.event-name { font-size: 14px; font-weight: 700; margin: 0 0 6px; }
.event-desc { font-size: 12.5px; color: #878a99; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.event-cta { font-size: 12.5px; font-weight: 600; color: var(--iot-primary); }

/* ---- marker preview popup ---- */
.iot-portal__popup { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 6; width: min(420px, 92%); display: flex; background: #fff; border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,.18); overflow: hidden; }
.iot-portal__popup-media { width: 130px; flex-shrink: 0; background: #eef2f7; display: grid; place-items: center; color: #a9b0bd; font-size: 28px; }
.iot-portal__popup-media img { width: 100%; height: 100%; object-fit: cover; }
.iot-portal__popup-body { padding: 14px; flex: 1; }
.iot-portal__popup-body h3 { margin: 0 0 6px; font-size: 16px; }
.iot-portal__popup-body p { font-size: 13px; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.iot-portal__popup-close { position: absolute; top: 6px; right: 8px; background: none; border: none; font-size: 22px; cursor: pointer; color: #878a99; z-index: 2; }

.iot-fade-enter-active, .iot-fade-leave-active { transition: opacity .18s; }
.iot-fade-enter-from, .iot-fade-leave-to { opacity: 0; }
.iot-pop-enter-active, .iot-pop-leave-active { transition: opacity .15s, transform .15s; }
.iot-pop-enter-from, .iot-pop-leave-to { opacity: 0; transform: translate(-50%, 10px); }

/* ---- responsive (portal.css uses a 116px→70px header at ≤1024px, and a bottom rail on phones) ---- */
@media (max-width: 1024px) {
  .iot-portal { height: calc(100vh - 70px); }
  .iot-suggest { width: 100%; }
  .itemQuickSuggest { min-width: 72px; font-size: 11px; padding: 0 8px; }
}
@media (max-width: 800px) {
  .iot-rail { top: auto; bottom: 0; height: 56px; width: 100%; flex-direction: row; justify-content: space-around; }
  .iot-rail__group { flex-direction: row; }
  .iot-rail__btn { width: 52px; height: 56px; border-bottom: none; }
  .iot-portal__top { left: 0; }
  .iot-widgets { bottom: 66px; }
  .iot-event { top: auto; bottom: 66px; }
}
</style>
