// Tenant plumbing for the shared IoT Link portal (app_iot_link is core; the
// per-site apps — app_thaihai, app_hoghenhche, app_tttmdungtan — provide their
// own tenant object at layout mount time). Every Vue component that used to
// pull `SITE`, `MAP_DEFAULTS`, `LOCATION_TYPES`, `DATA`, etc. from module-level
// imports now reads the same shape from `useTenant()`.
//
// Pure-JS helpers (map4dRoute / useMap4d) cannot use Vue's inject, so the
// active tenant's `apiKey` + `viewbox` are also mirrored to a module-scope
// runtime object that those helpers read. Only one tenant is live at a time —
// a tenant's layout calls `setRuntime(...)` on mount before its children run.
import { inject, provide } from 'vue'
import { stripHtml } from './media'

export const TENANT_KEY = Symbol('iot-tenant')

// Module-scope runtime consumed by the non-Vue helpers.
let currentApiKey = 'fda0ef247812a0f208b654c89a8f9308'
let currentViewbox = '21.522630,105.805081,21.539636,105.830830'
export const runtime = {
  get key() { return currentApiKey },
  get viewbox() { return currentViewbox },
}
export function setRuntime({ key, viewbox } = {}) {
  if (key) currentApiKey = key
  if (viewbox) currentViewbox = viewbox
}

// system-config `config` stores numbers as strings — some tenants leave them
// blank, so coerce with a fallback rather than crashing on NaN.
function num(v, fallback) {
  const n = Number(String(v ?? '').trim())
  return Number.isFinite(n) ? n : fallback
}

// The quick-suggest bar under the search box; every real tenant sets this via
// the system-config `location_type` JSON string but keep a working default.
const FALLBACK_LOCATION_TYPES = [
  { name: 'Tạp hóa', class: 'ri-shopping-cart-line', type_search: 'grocery_store' },
  { name: 'Trường học', class: 'ri-building-4-fill', type_search: 'education' },
  { name: 'Điểm du lịch', class: 'ri-ancient-gate-line', type_search: 'tourist_attraction' },
  { name: 'Trạm xăng', class: 'ri-gas-station-fill', type_search: 'gas_station' },
]

function paginate(all, { q = '', page = 1, perPage = 12 } = {}) {
  const s = String(q || '').trim().toLowerCase()
  const filtered = s ? all.filter((x) => stripHtml(x.name).toLowerCase().includes(s)) : all
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  return { results: filtered.slice(start, start + perPage), total_objects: total, total_pages: totalPages }
}

// Build a fully-resolved tenant from a raw system-config + collections bag.
// The returned object matches the fields every consumer expects; adding new
// tenant-specific values only needs a change here.
// Every tenant registers its own set of vue-router route names (Vue Router
// requires globally-unique names). Shared components reference these through
// `tenant.routeNames` instead of literal strings so they navigate to the
// correct tenant's routes.
export function buildRouteNames(prefix) {
  return {
    home: `${prefix}Home`,
    intro: `${prefix}Intro`,
    vr360: `${prefix}Vr360`,
    contact: `${prefix}Contact`,
    locations: `${prefix}Locations`,
    locationDetail: `${prefix}LocationDetail`,
    relics: `${prefix}Relics`,
    relicDetail: `${prefix}RelicDetail`,
    festivals: `${prefix}Festivals`,
    festivalDetail: `${prefix}FestivalDetail`,
    tours: `${prefix}Tours`,
    tourDetail: `${prefix}TourDetail`,
    object3d: `${prefix}Object3d`,
  }
}

const DEFAULT_ROUTE_NAMES = buildRouteNames('IotLink')

export function buildTenant({
  key,
  systemConfig,
  routeNames = DEFAULT_ROUTE_NAMES,
  places = [], relics = [], festivals = [], routes = [], vr360 = [],
  objects = [], festivalTypes = [], intro = null,
}) {
  const cfg = (systemConfig && systemConfig.config) || {}
  const site = {
    name: cfg.trip_link || '',
    subtitle: 'Thái Nguyên',
    logoLeft: systemConfig?.logo1,
    logoRight: systemConfig?.logo2,
    // Portrait Sở Văn hóa mark used across pages as generic logo fallback.
    logo1: systemConfig?.logo2,
    logo2: systemConfig?.logo1,
    cover: systemConfig?.bg_head,
    bgLogin: systemConfig?.bg_login,
    address: cfg.address || '',
    phone: cfg.phone || '',
    fax: cfg.fax || '',
  }
  const mapDefaults = {
    center: { lat: num(cfg.lat, 21.5338), lng: num(cfg.lng, 105.8147) },
    zoom: num(cfg.zoom, 16),
    bearing: num(cfg.bearing, 0),
    tilt: num(cfg.tilt, 45),
    map3d: (cfg.map_type || 'map3d') === 'map3d',
    waterEffect: cfg.water_effect === '1',
  }
  let locationTypes = FALLBACK_LOCATION_TYPES
  try {
    const parsed = JSON.parse(cfg.location_type || '[]')
    if (Array.isArray(parsed) && parsed.length) locationTypes = parsed
  } catch { /* keep fallback */ }
  const apiKey = cfg.key || 'fda0ef247812a0f208b654c89a8f9308'
  const viewbox = cfg.viewbox || '21.522630,105.805081,21.539636,105.830830'
  const collections = { places, relics, festivals, routes, objects, vr360, festivalTypes }

  return {
    key, systemConfig, site, mapDefaults, locationTypes, apiKey, viewbox, routeNames,
    places, relics, festivals, routes, objects, vr360, festivalTypes, intro,
    // Backwards-compat DATA bag — a few pages still index it by collection name.
    DATA: { ...collections, intro },
    list(name, opts) { return paginate(collections[name] || [], opts) },
    detail(name, id) { return (collections[name] || []).find((x) => String(x.id) === String(id)) || null },
    festivalTypeName(id) {
      const t = (collections.festivalTypes || []).find((x) => String(x.id) === String(id))
      return t ? t.name : ''
    },
    getIntro() { return intro },
  }
}

// Fallback tenant so pages / demo routes that don't sit under a tenant layout
// still render. Uses the bundled thaihai data + config.
import DEFAULT_SYSTEM_CONFIG from '../@data/thaihai/system-config.json'
import DEFAULT_PLACES from '../@data/thaihai/all_places.json'
import DEFAULT_RELICS from '../@data/thaihai/all_relics.json'
import DEFAULT_FESTIVALS from '../@data/thaihai/all_festivals.json'
import DEFAULT_VR360 from '../@data/thaihai/all_virtual_realities.json'
import DEFAULT_INTRO from '../@data/thaihai/intro.json'
import DEFAULT_FESTIVAL_TYPES from '../@data/festival-types.json'
import DEFAULT_ROUTES from '../@data/routes.json'
import DEFAULT_OBJECTS from '../@data/objects.json'

const DEFAULT_TENANT = buildTenant({
  key: 'thaihai',
  systemConfig: DEFAULT_SYSTEM_CONFIG,
  places: DEFAULT_PLACES, relics: DEFAULT_RELICS, festivals: DEFAULT_FESTIVALS,
  vr360: DEFAULT_VR360, intro: DEFAULT_INTRO,
  festivalTypes: DEFAULT_FESTIVAL_TYPES, routes: DEFAULT_ROUTES, objects: DEFAULT_OBJECTS,
})

export function useTenant() { return inject(TENANT_KEY, DEFAULT_TENANT) }

// Called by each tenant's Layout.vue. Also seeds the module-scope runtime so
// non-Vue helpers use this tenant's Map4D key + viewbox.
export function provideTenant(tenant) {
  provide(TENANT_KEY, tenant)
  setRuntime({ key: tenant.apiKey, viewbox: tenant.viewbox })
}
