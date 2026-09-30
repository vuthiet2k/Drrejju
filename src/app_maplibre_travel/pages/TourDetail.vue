<script setup>
// Chi tiết tuyến du lịch — mirrors detail_tours_portal.html (Velzon).
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '../common/tenant'
import { parseLatLng } from '../common/media'

const { detail, routeNames: RN } = useTenant()
import DetailShell from '../components/DetailShell.vue'
import MaplibreTravelView from '../components/MaplibreTravelView.vue'
import RatingsBlock from '../components/RatingsBlock.vue'

const route = useRoute()
const item = computed(() => detail('routes', route.params.id))
const stops = computed(() => {
  if (!item.value) return []
  const out = []
  if (item.value.origin) out.push({ ...item.value.origin, role: 'Điểm bắt đầu' })
  ;(item.value.points || []).forEach((p) => out.push({ ...p, role: 'Điểm dừng' }))
  if (item.value.destination) out.push({ ...item.value.destination, role: 'Điểm kết thúc' })
  return out
})
const markers = computed(() =>
  stops.value.map((s) => ({ ...parseLatLng(s.location), title: s.name, id: s.id })).filter((m) => m.lat != null),
)
const center = computed(() => markers.value[0] || undefined)
</script>

<template>
  <DetailShell title="Chi tiết tuyến du lịch" :not-found="!item"
               :back-to="{ name: RN.tours }" back-label="Tuyến du lịch">
    <div v-if="item">
      <div class="row g-4">
        <div class="col-md-9">
          <h4 v-html="item.name"></h4>
          <div class="row">
            <div class="col-6">
              <div class="table-responsive mt-2">
                <table class="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <th class="ps-0" scope="row" style="width: 140px;">Điểm bắt đầu</th>
                      <td v-html="item.origin?.name"></td>
                    </tr>
                    <tr>
                      <th class="ps-0" scope="row">Điểm kết thúc</th>
                      <td v-html="item.destination?.name"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-6">
              <div class="table-responsive mt-2">
                <table class="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <th class="ps-0" scope="row">Chiều dài lộ trình</th>
                      <td>{{ item.distance ? item.distance + ' km' : '—' }}</td>
                    </tr>
                    <tr>
                      <th class="ps-0" scope="row" style="width: 140px;">Điện thoại trạm xe</th>
                      <td>{{ item.phone_number || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 text-center">
          <img v-if="item.qr_code" :src="item.qr_code" alt="QR" class="img-fluid" style="max-width: 160px;" />
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-sm-12 mb-4">
          <h6 class="fs-14 fw-semibold text-dark">Mô tả</h6>
          <div v-if="item.description" v-html="item.description"></div>
          <p v-else class="text-muted">Chưa có mô tả.</p>
        </div>

        <div class="col-sm-5">
          <h6 class="fs-14 fw-semibold text-dark">Phương tiện cho phép và thời gian ước tính (giờ)</h6>
          <div class="d-flex justify-content-between mt-2">
            <div class="d-flex align-items-center">
              <div class="avatar-sm flex-1">
                <div class="avatar-title rounded bg-transparent text-success fs-20"><i class="ri-bus-wifi-line"></i></div>
              </div>
              <div class="flex-grow-1 text-center flex-1"><span class="text-primary">{{ item.tramcar_duration || '1' }} giờ</span></div>
            </div>
            <div class="d-flex align-items-center">
              <div class="avatar-sm flex-1">
                <div class="avatar-title rounded bg-transparent text-success fs-20"><i class="ri-riding-line"></i></div>
              </div>
              <div class="flex-grow-1 text-center flex-1"><span class="text-primary">{{ item.bike_duration || '1.5' }} giờ</span></div>
            </div>
            <div class="d-flex align-items-center">
              <div class="avatar-sm flex-1">
                <div class="avatar-title rounded bg-transparent text-success fs-20"><i class="ri-walk-line"></i></div>
              </div>
              <div class="flex-grow-1 text-center flex-1"><span class="text-primary">{{ item.foot_duration || '2' }} giờ</span></div>
            </div>
          </div>

          <h6 class="fs-14 fw-semibold text-dark mt-3">Những địa điểm dừng</h6>
          <div class="px-2">
            <ul class="list-group list-group-flush">
              <li v-for="(s, index) in stops" :key="s.id ?? index" class="list-group-item">
                <i class="ri-map-pin-line text-info align-middle me-2"></i>
                <span v-html="s.name"></span>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-sm-7">
          <div v-if="markers.length" style="height: 500px;">
            <MaplibreTravelView :center="center" :markers="markers" :polyline="markers" height="500px" />
          </div>
        </div>
      </div>

      <RatingsBlock v-if="item.ratings && item.ratings.length" :ratings="item.ratings" />
    </div>
  </DetailShell>
</template>
