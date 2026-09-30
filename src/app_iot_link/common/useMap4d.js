import { runtime } from './tenant'

// Loads the Map4D JS SDK once and resolves when window.map4d is ready.
// The SDK sets its global asynchronously (its <script> onload does not reliably
// coincide), so we poll for window.map4d.
let sdkPromise = null

export function loadMap4dSdk(key = runtime.key) {
  if (typeof window !== 'undefined' && window.map4d) return Promise.resolve(window.map4d)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    if (!key) {
      reject(new Error('MAP4D_API_KEY chưa được cấu hình cho tenant hiện tại'))
      return
    }
    if (!document.querySelector('script[data-map4d-sdk]')) {
      const s = document.createElement('script')
      s.src = `https://api.map4d.vn/sdk/map/js?version=2.4&key=${encodeURIComponent(key)}`
      s.async = true
      s.setAttribute('data-map4d-sdk', '1')
      s.onerror = () => reject(new Error('Không tải được Map4D SDK'))
      document.head.appendChild(s)
    }
    const started = Date.now()
    const timer = setInterval(() => {
      if (window.map4d) {
        clearInterval(timer)
        resolve(window.map4d)
      } else if (Date.now() - started > 15000) {
        clearInterval(timer)
        reject(new Error('Hết thời gian chờ Map4D SDK'))
      }
    }, 50)
  })
  return sdkPromise
}
