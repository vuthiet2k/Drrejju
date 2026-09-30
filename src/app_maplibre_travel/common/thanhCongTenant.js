import { buildRouteNames, buildTenant } from './tenant'
import { getThanhCongData } from '@/app_thanh_cong/common/thanhCongData.js'
import logoThaiNguyen from '@/app_thanh_cong/assets/logo-thai-nguyen.png'
import danHaDenTour from '@/app_thanh_cong/@data/vr360-tour-dan-ha-den.json'
import danHaDinhTour from '@/app_thanh_cong/@data/vr360-tour-dan-ha-dinh.json'
import nguyenTanTour from '@/app_thanh_cong/@data/vr360-tour-nguyen-tan.json'
import vanKimTour from '@/app_thanh_cong/@data/vr360-tour-van-kim.json'
import linhPhucTour from '@/app_thanh_cong/@data/vr360-tour-linh-phuc.json'
import haDatTour from '@/app_thanh_cong/@data/vr360-tour-ha-dat.json'
import dinhBiaTour from '@/app_thanh_cong/@data/vr360-tour-dinh-bia.json'
import xuanDuongTour from '@/app_thanh_cong/@data/vr360-tour-xuan-duong.json'
import anMienTour from '@/app_thanh_cong/@data/vr360-tour-an-mien.json'
import xaThanhCongTour from '@/app_thanh_cong/@data/xa_thanh_cong.json'

// Audio thuyết minh toàn xã lấy từ dữ liệu tour tổng (VR360 Builder xuất kèm
// URL file trên builder) — không bundle .mp3 vào app nữa.
const narration = xaThanhCongTour?.data?.audio?.file || ''

const data = getThanhCongData()
const tours360 = {
  'dan-ha-den': danHaDenTour, 'dan-ha-dinh': danHaDinhTour, 'nguyen-tan': nguyenTanTour,
  'van-kim': vanKimTour, 'linh-phuc': linhPhucTour, 'ha-dat': haDatTour,
  'dinh-bia': dinhBiaTour, 'xuan-duong': xuanDuongTour, 'an-mien': anMienTour,
}

const places = data.sites.map((site) => ({
  id: site.id, name: site.vi.n, description_short: site.vi.d, description: site.vi.d,
  location: `${site.ll[1]},${site.ll[0]}`, avatar: site.image, images: [{ image: site.image }],
  audio: narration, ratings: [],
}))
const relics = data.sites.map((site) => ({ id: site.id, name: site.vi.n, description_short: site.vi.d, location: `${site.ll[1]},${site.ll[0]}` }))
const festivals = data.festivals.map((festival) => ({
  id: festival.id, name: festival.vi.n, description_short: festival.vi.d,
  description: festival.vi.intro || festival.vi.d, avatar: festival.img,
  place: { name: festival.vi.n, location: `${festival.ll[1]},${festival.ll[0]}` }, ratings: [],
}))
const routes = data.tours.map((tour) => ({
  id: tour.id, name: tour.vi.n, description_short: `Hành trình ${tour.vi.n} qua các điểm di tích xã Thành Công.`, avatar: '',
  points: tour.sites.map((siteId) => places.find((place) => place.id === siteId)).filter(Boolean),
}))
const vr360 = data.sites.map((site) => {
  const tour = tours360[site.id]
  const firstScene = tour?.scenes?.[0]
  return { id: site.id, name: site.vi.n, caption: site.vi.n, image: firstScene?.thumb || site.image, link: firstScene?.image || '' }
})

export const thanhCongMaplibreTenant = buildTenant({
  key: 'thanh-cong-maplibre', routeNames: buildRouteNames('MaplibreTravel'),
  // logo1 = huy hiệu tỉnh Thái Nguyên (Thành Công thuộc TN). Không set logo2 —
  // ảnh Đền/Đình dùng làm "logo" phải bên trước nhìn lệch tone. bg_head bỏ
  // trống → topbar dùng primary-color solid, sạch cho map portal.
  systemConfig: {
    logo1: logoThaiNguyen,
    config: { trip_link: 'Bản đồ du lịch Thành Công', address: 'Xã Thành Công, TP Phổ Yên, Thái Nguyên', lat: '21.395', lng: '105.807', zoom: '13.5', tilt: '55', map_type: 'map3d' },
  },
  places, relics, festivals, routes, vr360, objects: data.sites.filter((site) => site.d3).map((site) => ({ id: site.id, name: site.vi.n, location: `${site.ll[1]},${site.ll[0]}` })),
  intro: { title: 'Xã Thành Công', content: 'Khám phá không gian văn hóa, di tích và các tour thực tế ảo 360° tại xã Thành Công.' },
})
