// Relic (phân khu) zone outlines. The original portal fetched
// `relic.geojson_file` at click time, but that host serves the .geojson files
// without an Access-Control-Allow-Origin header, so a browser fetch is blocked
// here — the files are bundled under @data/thaihai/geojson instead and resolved
// by the basename of the recorded geojson_file URL.
import khua from '../@data/thaihai/geojson/khua.json'
import khub from '../@data/thaihai/geojson/khub.json'
import khud from '../@data/thaihai/geojson/khud.json'

const ZONES = { khua, khub, khud }

// 'https://…/2023/12/khud.geojson' → 'khud'
function keyOf(url) {
  return String(url || '').split('/').pop().replace(/\.geojson$/i, '').toLowerCase()
}

export function relicGeojson(relic) {
  return ZONES[keyOf(relic?.geojson_file)] || null
}

// Mean of every vertex of every ring — the centre the original used to seed
// "Chỉ đường" from a zone (its own centroidMulti called an undefined global).
export function geojsonCenter(fc) {
  const feature = fc?.features?.[0]
  if (!feature?.geometry) return null
  const g = feature.geometry
  const rings = g.type === 'MultiPolygon' ? g.coordinates.flat() : g.coordinates || []
  let lat = 0, lng = 0, n = 0
  rings.forEach((ring) => (ring || []).forEach(([x, y]) => { lng += x; lat += y; n++ }))
  return n ? { lat: lat / n, lng: lng / n } : null
}
