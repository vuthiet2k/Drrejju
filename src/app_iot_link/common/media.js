// Resolve an image URL: absolute/data URIs pass through; relative /media/...
// paths pass through as-is. (The old MEDIA_BASE prefix was always '' — dropped
// with the tenant refactor.)
export function mediaUrl(url) {
  if (!url) return ''
  const u = String(url)
  if (/^(https?:)?\/\//i.test(u) || u.startsWith('data:')) return u
  return u.startsWith('/') ? u : `/${u}`
}

// Parse a backend "lat,lng" string into { lat, lng } numbers.
export function parseLatLng(str) {
  if (!str || typeof str !== 'string') return null
  const [lat, lng] = str.split(',').map((s) => parseFloat(s.trim()))
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

export function stripHtml(s) {
  return String(s || '').replace(/<[^>]*>/g, '')
}
