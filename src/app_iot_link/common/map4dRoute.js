// Real turn-by-turn routing via the Map4D Route REST API — same endpoint the
// original portal used (https://api.map4d.vn/sdk/route). Returns distance/
// duration text, the decoded path ({lat,lng}[]) and per-step instructions.
//
// These helpers read the active tenant's Map4D key + viewbox from the tenant
// runtime (set by each Layout on mount) — no per-call config plumbing needed.
import { runtime } from './tenant'

// Map4D place search within the home viewbox (for the main search box).
// Returns [{ name, address, lat, lng }] (max 2, like the original portal).
export async function searchMap4dPlaces(text) {
  try {
    const url = `https://api.map4d.vn/sdk/place/viewbox-search?key=${runtime.key}&viewbox=${runtime.viewbox}&text=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const data = await res.json()
    if (!Array.isArray(data?.result)) return []
    return data.result.slice(0, 2).map((r) => ({ name: r.name, address: r.address || '', lat: r.location?.lat, lng: r.location?.lng }))
  } catch {
    return []
  }
}

// Map4D place search by category within the home viewbox — what the original
// portal's quick-suggest buttons called (touristAttraction → viewbox-search
// with `types`). Returns the raw hit list shape the results panel needs.
export async function searchMap4dByType(type) {
  try {
    const url = `https://api.map4d.vn/sdk/place/viewbox-search?key=${runtime.key}&types=${encodeURIComponent(type)}&viewbox=${runtime.viewbox}`
    const res = await fetch(url)
    const data = await res.json()
    if (!Array.isArray(data?.result)) return []
    return data.result
      .filter((r) => r.location?.lat != null)
      .map((r) => ({ name: r.name, address: r.address || '', lat: r.location.lat, lng: r.location.lng }))
  } catch {
    return []
  }
}

// Google-style encoded polyline decoder (identical to the original portal's).
function decodePolyline(str, precision) {
  let index = 0, lat = 0, lng = 0, shift = 0, result = 0, byte = null
  const coordinates = []
  const factor = Math.pow(10, Number.isInteger(precision) ? precision : 5)
  while (index < str.length) {
    byte = null; shift = 0; result = 0
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5 } while (byte >= 0x20)
    const dLat = result & 1 ? ~(result >> 1) : result >> 1
    shift = result = 0
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5 } while (byte >= 0x20)
    const dLng = result & 1 ? ~(result >> 1) : result >> 1
    lat += dLat; lng += dLng
    coordinates.push({ lat: lat / factor, lng: lng / factor })
  }
  return coordinates
}

// Reverse geocode a clicked coordinate to a human address (same endpoint the
// original portal used). Returns '' on any failure.
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://api.map4d.vn/sdk/v2/geocode?key=${runtime.key}&location=${lat},${lng}`
    const res = await fetch(url)
    const data = await res.json()
    return data?.result?.[0]?.address || ''
  } catch {
    return ''
  }
}

// origin/dest: { lat, lng }. mode: car|motorcycle|bike|foot. weighting: 0|1|2.
// `waypoints` are intermediate stops ({lat,lng}[]) — used by tour routes, which
// thread the whole point list through one request like the original did.
export async function fetchRoute(origin, dest, mode = 'car', weighting = 1, waypoints = []) {
  if (!origin?.lat || !dest?.lat) return null
  const m = mode === 'disabilities' ? 'foot' : mode
  const points = waypoints.filter((p) => p?.lat != null).map((p) => `${p.lat},${p.lng}`).join(';')
  const url =
    `https://api.map4d.vn/sdk/route?key=${runtime.key}` +
    `&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}` +
    `&points=${points}&mode=${m}&language=vi&weighting=${weighting}&avoid=&avoidRoad=`
  const res = await fetch(url)
  const data = await res.json()
  const route = data?.result?.routes?.[0]
  if (!route) return null
  const steps = []
  const path = []
  for (const leg of route.legs || []) {
    for (const s of leg.steps || []) {
      steps.push({ type: s.maneuver, name: s.htmlInstructions, met: s.distance?.text || '' })
      if (s.polyline) path.push(...decodePolyline(s.polyline))
    }
  }
  return {
    distanceText: route.distance?.text || '',
    durationText: route.duration?.text || '',
    steps,
    path,
  }
}
