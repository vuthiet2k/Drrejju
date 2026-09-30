<script setup>
// Card for the portal list pages — mirrors card_view_portal.js (Velzon explore-box).
// Default variant: photo + hover overlay + "Xem chi tiết" button, name centred.
// Tour variant: origin/destination + 3 transport-time chips.
import { computed } from 'vue'
import { mediaUrl } from '../common/media'
import { useTenant } from '../common/tenant'

const { site: SITE } = useTenant()

const props = defineProps({
  item: { type: Object, required: true },
  to: { type: [String, Object], required: true },
  variant: { type: String, default: 'default' }, // 'default' | 'tour'
})
const avatar = computed(() => mediaUrl(props.item.avatar) || '')
</script>

<template>
  <!-- Tour card -->
  <div v-if="variant === 'tour'" class="card explore-box rounded card-height-100">
    <div class="card-header border-bottom-dashed mb-0">
      <div class="d-flex">
        <div class="flex-shrink-0 me-1">
          <div class="avatar-sm">
            <span class="avatar-title bg-soft-light rounded-pill">
              <img :src="SITE.logo1" alt="" class="img-fluid p-1" />
            </span>
          </div>
        </div>
        <div class="flex-grow-1 align-self-center">
          <h5 class="mb-1 fs-15" v-html="item.name"></h5>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="mt-1 start-end-content">
        <p class="text-muted mb-1 text-truncate-two-lines"><b>Điểm xuất phát: </b>{{ item.origin?.name }}</p>
        <p class="text-muted mb-1 text-truncate-two-lines"><b>Điểm đến: </b>{{ item.destination?.name }}</p>
      </div>
      <div class="d-flex justify-content-between mt-3 px-1">
        <div class="p-1 border border-dashed rounded" title="Xe điện">
          <div class="d-flex align-items-center">
            <div class="avatar-sm flex-1">
              <div class="avatar-title rounded bg-transparent text-success fs-20"><i class="ri-bus-wifi-line"></i></div>
            </div>
            <div class="flex-grow-1 text-center flex-1"><span class="text-primary">{{ item.tramcar_duration || '1' }} giờ</span></div>
          </div>
        </div>
        <div class="p-1 border border-dashed rounded" title="Xe đạp">
          <div class="d-flex align-items-center">
            <div class="avatar-sm flex-1">
              <div class="avatar-title rounded bg-transparent text-success fs-20"><i class="ri-riding-line"></i></div>
            </div>
            <div class="flex-grow-1 text-center flex-1"><span class="text-primary">{{ item.bike_duration || '1.5' }} giờ</span></div>
          </div>
        </div>
        <div class="p-1 border border-dashed rounded" title="Đi bộ">
          <div class="d-flex align-items-center">
            <div class="avatar-sm flex-1">
              <div class="avatar-title rounded bg-transparent text-success fs-20"><i class="ri-walk-line"></i></div>
            </div>
            <div class="flex-grow-1 text-center flex-1"><span class="text-primary">{{ item.foot_duration || '2' }} giờ</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-footer bg-transparent border-top-dashed py-2 text-center">
      <router-link :to="to" class="btn btn-success">
        <i class="ri-external-link-line align-bottom me-1"></i> Xem chi tiết
      </router-link>
    </div>
  </div>

  <!-- Default card -->
  <div v-else class="card explore-box card-animate rounded card-height-100">
    <div class="explore-place-bid-img">
      <img v-if="avatar" :src="avatar" :alt="item.name" class="img-fluid card-img-top explore-img" loading="lazy" />
      <img v-else :src="SITE.logo1" alt="" class="img-fluid card-img-top explore-img" />
      <div class="bg-overlay"></div>
      <div class="place-bid-btn">
        <router-link :to="to" class="btn btn-success">
          <i class="ri-external-link-line align-bottom me-1"></i> Xem chi tiết
        </router-link>
      </div>
    </div>
    <div class="card-body border-top">
      <h6 class="my-2 text-center fw-semibold" v-html="item.name"></h6>
    </div>
  </div>
</template>
