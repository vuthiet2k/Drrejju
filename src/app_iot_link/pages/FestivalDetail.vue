<script setup>
// Chi tiết sự kiện / lễ hội — mirrors detail_festival_portal.html (Velzon).
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '../common/tenant'
import { parseLatLng } from '../common/media'

const { detail, festivalTypeName, routeNames: RN } = useTenant()
import DetailShell from '../components/DetailShell.vue'
import ImageGallery from '../components/ImageGallery.vue'
import Map4dView from '../components/Map4dView.vue'
import RatingsBlock from '../components/RatingsBlock.vue'

const route = useRoute()
const item = computed(() => detail('festivals', route.params.id))
const typeName = computed(() => festivalTypeName(item.value?.festival_type))
const coord = computed(() => parseLatLng(item.value?.place?.location))
</script>

<template>
  <DetailShell title="Chi tiết sự kiện và lễ hội" :not-found="!item"
               :back-to="{ name: RN.festivals }" back-label="Sự kiện và lễ hội">
    <div v-if="item" class="row g-4">
      <div class="col-md-5">
        <ImageGallery :images="item.images" :avatar="item.avatar" />
      </div>
      <div class="col-md-4">
        <h4 v-html="item.name"></h4>
        <div class="hstack gap-3 flex-wrap mt-2">
          <div class="text-secondary"><span class="fw-medium">{{ typeName || 'Lễ hội' }}</span></div>
        </div>
        <div class="mt-4 table-responsive">
          <table class="table table-borderless mb-0">
            <tbody>
              <tr v-if="item.place">
                <th class="ps-0" scope="row" style="width: 120px;">Địa điểm</th>
                <td v-html="item.place.name"></td>
              </tr>
              <tr v-if="item.start_date">
                <th class="ps-0" scope="row">Ngày bắt đầu</th>
                <td>{{ item.start_date }}</td>
              </tr>
              <tr v-if="item.end_date">
                <th class="ps-0" scope="row">Ngày kết thúc</th>
                <td>{{ item.end_date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-md-3 text-center">
        <img v-if="item.qr_code" :src="item.qr_code" alt="QR" class="img-fluid" style="max-width: 160px;" />
      </div>
    </div>

    <div v-if="item && item.description_short" class="mt-4">
      <h6 class="fs-16 fw-semibold text-dark">Mô tả ngắn</h6>
      <p v-html="item.description_short"></p>
    </div>

    <div v-if="item" class="row mt-2">
      <div class="col-sm-7">
        <h6 class="fs-16 fw-semibold text-dark">Mô tả chi tiết</h6>
        <div v-if="item.description" v-html="item.description"></div>
        <p v-else class="text-muted">Chưa có mô tả chi tiết.</p>
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
