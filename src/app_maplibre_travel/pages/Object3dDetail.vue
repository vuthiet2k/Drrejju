<script setup>
// Chi tiết đối tượng 3D — mirrors detail_3d_object_portal.html (Velzon).
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '../common/tenant'
import { parseLatLng } from '../common/media'

const { detail, routeNames: RN } = useTenant()
import DetailShell from '../components/DetailShell.vue'
import ImageGallery from '../components/ImageGallery.vue'
import MaplibreTravelView from '../components/MaplibreTravelView.vue'
import RatingsBlock from '../components/RatingsBlock.vue'

const route = useRoute()
const item = computed(() => detail('objects', route.params.id))
const coord = computed(() => {
  if (!item.value) return null
  return parseLatLng(item.value.object_data?.location) || parseLatLng(item.value.location)
})
const authorName = computed(() => {
  const c = item.value?.created_by
  return typeof c === 'string' ? c : c?.username || ''
})
</script>

<template>
  <DetailShell title="Chi tiết đối tượng 3D" :not-found="!item"
               :back-to="{ name: RN.home }" back-label="Trang chủ">
    <div v-if="item" class="row g-4">
      <div class="col-md-5">
        <ImageGallery :images="item.images" :avatar="item.avatar" />
      </div>
      <div class="col-md-4">
        <h4 v-html="item.name"></h4>
        <div class="mt-4 table-responsive">
          <table class="table table-borderless mb-0">
            <tbody>
              <tr>
                <th class="ps-0" scope="row" style="width: 120px;">Mô tả ngắn</th>
                <td><span v-if="item.description_short" v-html="item.description_short"></span><span v-else>—</span></td>
              </tr>
              <tr v-if="item.updated_date">
                <th class="ps-0" scope="row">Ngày cập nhật</th>
                <td>{{ item.updated_date }}</td>
              </tr>
              <tr v-if="authorName">
                <th class="ps-0" scope="row">Người cập nhật</th>
                <td>{{ authorName }}</td>
              </tr>
              <tr v-if="item.views != null">
                <th class="ps-0" scope="row">Lượt xem</th>
                <td>{{ item.views }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-md-3 text-center">
        <img v-if="item.qr_code" :src="item.qr_code" alt="QR" class="img-fluid" style="max-width: 160px;" />
      </div>
    </div>

    <div v-if="item" class="row mt-3">
      <div class="col-sm-6">
        <h6 class="fs-16 fw-semibold text-dark">Mô tả chi tiết đối tượng</h6>
        <div v-if="item.description" v-html="item.description"></div>
        <p v-else class="text-muted">Chưa có mô tả chi tiết.</p>
      </div>
      <div class="col-sm-6">
        <div v-if="coord" style="height: 500px;">
          <MaplibreTravelView :center="coord" :markers="[{ ...coord, title: item.name }]" :mode3d="true" height="500px" />
        </div>
      </div>
    </div>

    <RatingsBlock v-if="item && item.ratings && item.ratings.length" :ratings="item.ratings" />
  </DetailShell>
</template>
