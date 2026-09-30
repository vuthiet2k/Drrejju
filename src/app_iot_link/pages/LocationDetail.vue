<script setup>
// Chi tiết địa điểm — mirrors detail_location_portal.html (Velzon).
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '../common/tenant'
import { parseLatLng } from '../common/media'

const { detail, routeNames: RN } = useTenant()
import DetailShell from '../components/DetailShell.vue'
import ImageGallery from '../components/ImageGallery.vue'
import Map4dView from '../components/Map4dView.vue'
import RatingsBlock from '../components/RatingsBlock.vue'

const route = useRoute()
const item = computed(() => detail('places', route.params.id))
const coord = computed(() => (item.value ? parseLatLng(item.value.location) : null))

const showHours = ref(false)
const DAYS = [['Mo', 'Thứ hai'], ['Tu', 'Thứ ba'], ['We', 'Thứ tư'], ['Th', 'Thứ năm'], ['Fr', 'Thứ sáu'], ['Sa', 'Thứ bảy'], ['Su', 'Chủ nhật']]
function workText(d) {
  const w = item.value?.time_work?.[d]
  if (!w) return '—'
  if (String(w.is_close) === 'True' || w.is_close === true) return 'Đóng cửa'
  if (String(w.is_fulltime) === 'True' || w.is_fulltime === true) return 'Cả ngày'
  return w.time_start || w.time_end ? `${w.time_start || ''} - ${w.time_end || ''}` : 'Chưa cập nhật'
}
</script>

<template>
  <DetailShell title="Chi tiết địa điểm du lịch" :not-found="!item"
               :back-to="{ name: RN.locations }" back-label="Địa điểm du lịch">
    <div v-if="item" class="row g-4">
      <div class="col-md-5">
        <ImageGallery :images="item.images" :avatar="item.avatar" />
      </div>
      <div class="col-md-4">
        <h4 v-html="item.name"></h4>
        <div class="hstack gap-3 flex-wrap mt-2">
          <div class="text-secondary"><span class="fw-medium">Điểm du lịch</span></div>
        </div>
        <div class="mt-4 table-responsive">
          <table class="table table-borderless mb-0">
            <tbody>
              <tr v-if="coord">
                <th class="ps-0" scope="row" style="width: 120px;">Tọa độ</th>
                <td>{{ item.location }}</td>
              </tr>
              <tr>
                <th class="ps-0" scope="row">Giờ làm việc</th>
                <td>
                  <a class="link-success" href="javascript:void(0)" @click="showHours = !showHours">
                    Xem giờ làm việc
                    <i class="ri-arrow-down-circle-line align-middle ms-1 fs-16"></i>
                  </a>
                  <div v-if="showHours" class="card shadow-none border mt-2 mb-0">
                    <div class="card-body px-2 py-1">
                      <table class="table table-borderless mb-0">
                        <tbody>
                          <tr v-for="[k, l] in DAYS" :key="k">
                            <th scope="row" class="px-0" style="width: 90px;">{{ l }}</th>
                            <td class="px-0 text-success">{{ workText(k) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th class="ps-0" scope="row">Điện thoại</th>
                <td>{{ item.phone_number || '—' }}</td>
              </tr>
              <tr v-if="item.website">
                <th class="ps-0" scope="row">Website</th>
                <td><a class="text-info text-decoration-underline" :href="item.website" target="_blank" rel="noopener">{{ item.website }}</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-md-3 text-center">
        <img v-if="item.qr_code" :src="item.qr_code" alt="QR" class="img-fluid" style="max-width: 160px;" />
      </div>
    </div>

    <blockquote v-if="item && item.description_short" class="blockquote my-4">
      <p class="lead text-info fst-italic fs-15" v-html="item.description_short"></p>
    </blockquote>

    <div v-if="item" class="row">
      <div class="col-sm-7">
        <h6 class="fs-14 fw-semibold text-dark">Nội dung</h6>
        <div v-if="item.description" v-html="item.description"></div>
        <p v-else class="text-muted">Chưa có nội dung mô tả.</p>
      </div>
      <div class="col-sm-5">
        <div v-if="coord" style="width:100%;height:400px;">
          <Map4dView :center="coord" :markers="[{ ...coord, title: item.name }]" height="400px" />
        </div>
      </div>
    </div>

    <RatingsBlock v-if="item && item.ratings && item.ratings.length" :ratings="item.ratings" />
  </DetailShell>
</template>
