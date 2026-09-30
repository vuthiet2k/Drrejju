// Service lấy dữ liệu VR360 từ VR360 Builder API — thay cho việc bundle 9 file
// JSON tour vào bundle chính. Trả về đúng shape `data` mà Vr360ViewerLayout
// nhận (title, scenes, audio). Có fallback local (JSON + MP3 trong @data/) khi
// gọi API không được — để trải nghiệm không đứt khi builder offline hoặc site
// chưa được publish.

const BASE = 'https://vr360-builder.metatwin.vn';

// Ánh xạ site.id (thanhCongData.sites) → location trên VR360 Builder.
// location_id là khoá bền (không đổi khi re-publish); location_name là fallback
// khi builder cấp lại ID vì lý do nào đó.
const SITE_MAP = {
  'dan-ha-den':  { locationId: 11, locationName: 'Đền Đan Hà' },
  'dan-ha-dinh': { locationId: 1,  locationName: 'Đình Đan Hà' },
  'nguyen-tan':  { locationId: 4,  locationName: 'Đình Chùa Nguyễn Tân' },
  'van-kim':     { locationId: 3,  locationName: 'Chùa Vạn Kim' },
  'linh-phuc':   { locationId: 10, locationName: 'Chùa Linh Phúc' },
  'ha-dat':      { locationId: 7,  locationName: 'Đình Hà Đạt' },
  'dinh-bia':    { locationId: 5,  locationName: 'Đình Bìa' },
  'xuan-duong':  { locationId: 2,  locationName: 'Đình Xuân Dương' },
  'an-mien':     { locationId: 9,  locationName: 'Đình An Miên' },
};

// Fallback local — dynamic import để Vite code-split, chỉ tải khi phải rơi về.
// JSON local đã kèm sẵn audio thuyết minh ở `data.audio` (VR360 Builder xuất
// ra, trỏ tới file mp3 trên chính builder) nên không cần bơm thêm gì —
// normalizeTour.js đọc thẳng trường này (xem normalizeNarration).
const LOCAL_TOUR_LOADERS = {
  'dan-ha-den':  () => import('../@data/vr360-tour-dan-ha-den.json'),
  'dan-ha-dinh': () => import('../@data/vr360-tour-dan-ha-dinh.json'),
  'nguyen-tan':  () => import('../@data/vr360-tour-nguyen-tan.json'),
  'van-kim':     () => import('../@data/vr360-tour-van-kim.json'),
  'linh-phuc':   () => import('../@data/vr360-tour-linh-phuc.json'),
  'ha-dat':      () => import('../@data/vr360-tour-ha-dat.json'),
  'dinh-bia':    () => import('../@data/vr360-tour-dinh-bia.json'),
  'xuan-duong':  () => import('../@data/vr360-tour-xuan-duong.json'),
  'an-mien':     () => import('../@data/vr360-tour-an-mien.json'),
};
async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`VR360 API ${res.status} — ${url}`);
  return res.json();
}

let publishedIndexPromise = null;
const tourCache = new Map();
const localCache = new Map();

// Gọi list published-tours 1 lần cho cả session, index theo location_id + name.
export function loadPublishedIndex() {
  if (!publishedIndexPromise) {
    publishedIndexPromise = fetchJson(`${BASE}/api/published-tours/`)
      .then((res) => {
        const byId = new Map();
        const byName = new Map();
        for (const item of res.results || []) {
          if (item.location_id != null && !byId.has(item.location_id)) byId.set(item.location_id, item);
          if (item.location_name && !byName.has(item.location_name)) byName.set(item.location_name, item);
        }
        return { byId, byName, raw: res.results || [] };
      })
      .catch((err) => { publishedIndexPromise = null; throw err; });
  }
  return publishedIndexPromise;
}

// Tra published-tour cho 1 site.id — trả về entry (hoặc null nếu chưa publish).
export async function findPublishedForSite(siteId) {
  const mapping = SITE_MAP[siteId];
  if (!mapping) return null;
  const { byId, byName } = await loadPublishedIndex();
  return byId.get(mapping.locationId) || byName.get(mapping.locationName) || null;
}

// Fetch chi tiết tour theo public_token — cache theo token. `embed_origin` bám
// theo builder host để pass CORS/Referer check phía server.
export async function fetchTourDataByToken(token) {
  if (!token) return null;
  if (!tourCache.has(token)) {
    const url = `${BASE}/api/public/tour/${token}/?embed_origin=${encodeURIComponent(BASE)}`;
    const p = fetchJson(url)
      .then((res) => res && res.data ? res.data : null)
      .catch((err) => { tourCache.delete(token); throw err; });
    tourCache.set(token, p);
  }
  return tourCache.get(token);
}

// Fallback: load JSON bundle local (đã có sẵn `data.audio` thuyết minh).
async function loadTourFromLocal(siteId) {
  if (localCache.has(siteId)) return localCache.get(siteId);
  const tourLoader = LOCAL_TOUR_LOADERS[siteId];
  if (!tourLoader) return null;
  const p = tourLoader()
    .then((mod) => mod?.default || mod)
    .catch((err) => { localCache.delete(siteId); throw err; });
  localCache.set(siteId, p);
  return p;
}

// Tiện: 1 gọi cho 1 site.id → tour data. Thử API trước; API fail hoặc chưa
// publish thì tự động rơi về bundle local. Trả về object thêm `source` để
// caller biết đang xem live-published hay fallback (debug/UI hint).
export async function loadTourForSite(siteId) {
  try {
    const entry = await findPublishedForSite(siteId);
    if (entry) {
      const data = await fetchTourDataByToken(entry.public_token);
      if (data) return { data, source: 'api' };
    }
    // chưa publish → rơi xuống local
  } catch (err) {
    console.warn('[VR360] API lỗi, dùng bundle local tạm:', err?.message || err);
  }
  const data = await loadTourFromLocal(siteId);
  return data ? { data, source: 'local' } : null;
}

// Trích URL audio thuyết minh nằm sẵn trong dữ liệu tour (trường `audio` do
// VR360 Builder xuất — xem @data/vr360-tour-*.json). Nhận cả 2 shape: JSON
// local bọc ngoài `{ ..., data: { audio } }` và payload API trả thẳng
// `{ title, scenes, audio }` — cùng thứ tự ưu tiên với normalizeTour.js.
export function narrationUrlOf(tour) {
  const version = tour?.version || tour;
  const source = tour?.TOUR_DATA || tour?.tour_data || tour?.data || version?.data || version || {};
  const audio = source.audio || source.narration || source.tour_audio || version?.tour_audio;
  if (!audio) return '';
  return typeof audio === 'string' ? audio : (audio.file || audio.url || audio.src || '');
}

// Tiện cho các trang KHÔNG nhúng viewer (trang chi tiết di tích, panel trên
// bản đồ) chỉ cần đúng file thuyết minh của 1 site — dùng lại cache tour nên
// không tải trùng khi người dùng mở VR360 sau đó.
export async function loadNarrationUrlForSite(siteId) {
  const result = await loadTourForSite(siteId);
  return narrationUrlOf(result?.data);
}

export const VR360_SITE_MAP = SITE_MAP;
