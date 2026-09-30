<script setup>
// Chi tiết phân khu / di tích — mirrors detail_relic_portal.html (Velzon).
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '../common/tenant'
import { mediaUrl } from '../common/media'
import DetailShell from '../components/DetailShell.vue'
import RatingsBlock from '../components/RatingsBlock.vue'

const { detail, site: SITE, routeNames: RN } = useTenant()
const route = useRoute()
const item = computed(() => detail('relics', route.params.id))
const typeLabel = computed(() => (Number(item.value?.type) === 1 ? 'Di tích' : 'Phân khu'))
const avatar = computed(() => mediaUrl(item.value?.avatar) || SITE.logo1)
</script>

<template>
  <DetailShell title="Chi tiết Phân khu / Di tích" :not-found="!item"
               :back-to="{ name: RN.relics }" back-label="Phân khu / Di tích">
    <div v-if="item" class="row g-4">
      <div class="col-md-5">
        <img :src="avatar" class="gallery-img img-fluid mx-auto rounded" alt="" style="width:100%;object-fit:cover;" />
      </div>
      <div class="col-md-4">
        <h4 v-html="item.name"></h4>
        <div class="hstack gap-3 flex-wrap mt-2">
          <div class="text-secondary"><span class="fw-medium">{{ typeLabel }}</span></div>
        </div>
        <div class="mt-4 table-responsive">
          <table class="table table-borderless mb-0">
            <tbody>
              <tr>
                <th class="ps-0" scope="row" style="width: 130px;">Tổng diện tích</th>
                <td><span>{{ item.total_area }}</span> m<span class="position-relative fs-10" style="bottom: 6px;">2</span></td>
              </tr>
              <tr>
                <th class="ps-0" scope="row">Số công trình</th>
                <td>{{ item.total_works }}</td>
              </tr>
              <tr v-if="item.keywords">
                <th class="ps-0" scope="row">Từ khóa</th>
                <td>{{ item.keywords }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-md-3 text-center">
        <img v-if="item.qr_code" :src="item.qr_code" alt="QR" class="img-fluid" style="max-width: 160px;" />
      </div>
    </div>

    <div v-if="item" class="mt-4">
      <h6 class="fs-14 fw-semibold text-dark">Mô tả</h6>
      <div v-if="item.description" v-html="item.description"></div>
      <p v-else class="text-muted">Chưa có mô tả.</p>
    </div>

    <RatingsBlock v-if="item && item.ratings && item.ratings.length" :ratings="item.ratings" />
  </DetailShell>
</template>
