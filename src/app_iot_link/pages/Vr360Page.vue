<script setup>
// VR 360 — gallery of 360° tours (mirrors the portal show-all VR grid).
import { ref } from 'vue'
import { useTenant } from '../common/tenant'
import { mediaUrl } from '../common/media'

const { vr360, site } = useTenant()
const items = vr360 || []
const active = ref(null)
function imgOf(v) { return mediaUrl(v.image || v.avatar || v.thumbnail) || site.logo1 }
function linkOf(v) { return v.link || v.url || v.iframe || '' }
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-3">
      <h4 class="fw-bold text-secondary text-uppercase fs-22">Tham quan thực tế ảo 360°</h4>
    </div>

    <div v-if="items.length" class="row g-3">
      <div v-for="v in items" :key="v.id" class="col-xxl-3 col-xl-4 col-sm-6">
        <div class="card explore-box card-animate rounded card-height-100" @click="active = v" style="cursor:pointer;">
          <div class="explore-place-bid-img">
            <img :src="imgOf(v)" :alt="v.caption || v.name" class="img-fluid card-img-top explore-img" loading="lazy" />
            <div class="bg-overlay"></div>
            <div class="place-bid-btn">
              <span class="btn btn-success"><i class="ri-vidicon-line align-bottom me-1"></i> Xem 360°</span>
            </div>
            <span class="badge bg-warning position-absolute top-0 start-0 m-2">360°</span>
          </div>
          <div class="card-body border-top">
            <h6 class="my-2 text-center fw-semibold" v-html="v.caption || v.name || 'VR 360'"></h6>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-muted py-5">Chưa có nội dung VR 360</div>

    <div v-if="active" class="iotlink-vr-modal" @click.self="active = null">
      <div class="iotlink-vr-modal__inner">
        <button class="btn btn-light btn-icon iotlink-vr-modal__close" @click="active = null"><i class="ri-close-line"></i></button>
        <iframe v-if="linkOf(active)" :src="linkOf(active)" frameborder="0" allowfullscreen class="iotlink-vr-modal__frame"></iframe>
        <div v-else class="text-center text-white p-5">Không có liên kết VR cho mục này.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.iotlink-vr-modal { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 2000; display: grid; place-items: center; padding: 20px; }
.iotlink-vr-modal__inner { position: relative; width: min(1000px, 96vw); aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; }
.iotlink-vr-modal__frame { width: 100%; height: 100%; border: 0; }
.iotlink-vr-modal__close { position: absolute; top: 8px; right: 8px; z-index: 3; }
</style>
