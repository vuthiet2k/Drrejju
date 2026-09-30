const NOMINATIM = 'https://nominatim.openstreetmap.org'
const OSRM = 'https://router.project-osrm.org/route/v1'

export async function searchPlaces(text) {
  try {
    const url = `${NOMINATIM}/search?format=jsonv2&limit=5&countrycodes=vn&q=${encodeURIComponent(text)}`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    const results = await response.json()
    return Array.isArray(results) ? results.map((item) => ({ name: item.display_name.split(',')[0], address: item.display_name, lat: Number(item.lat), lng: Number(item.lon) })) : []
  } catch { return [] }
}

export async function searchPlacesByType(type) {
  const terms = { tourist_attraction: 'di tích Thành Công Thái Nguyên', education: 'trường học Thành Công Thái Nguyên', grocery_store: 'tạp hóa Thành Công Thái Nguyên', gas_station: 'trạm xăng Thành Công Thái Nguyên' }
  return searchPlaces(terms[type] || `${type} Thành Công Thái Nguyên`)
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, { headers: { Accept: 'application/json' } })
    const result = await response.json()
    return result?.display_name || ''
  } catch { return '' }
}

export async function fetchRoute(origin, dest, mode = 'car', weighting = 1, waypoints = []) {
  void weighting
  if (origin?.lat == null || dest?.lat == null) return null
  const points = [origin, ...waypoints, dest].filter((point) => point?.lat != null && point?.lng != null)
  if (points.length < 2) return null
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(';')
  const profile = mode === 'foot' || mode === 'bike' ? 'foot' : 'driving'
  try {
    const response = await fetch(`${OSRM}/${profile}/${coordinates}?overview=full&geometries=geojson&steps=true`)
    const result = await response.json()
    const route = result?.routes?.[0]
    if (!route) return null
    const steps = route.legs.flatMap((leg) => leg.steps || []).map((step) => ({ type: step.maneuver?.type || 'continue', name: step.name || 'Tiếp tục theo tuyến đường', met: `${Math.round(step.distance)} m` }))
    return { distanceText: `${(route.distance / 1000).toFixed(1)} km`, durationText: `${Math.max(1, Math.round(route.duration / 60))} phút`, steps, path: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })) }
  } catch { return null }
}
