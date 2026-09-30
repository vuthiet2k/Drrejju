<script setup>
import { ref, computed, watch } from 'vue'
import { mediaUrl } from '../common/media'
const props = defineProps({ images: { type: Array, default: () => [] }, avatar: { type: String, default: '' } })
const urls = computed(() => {
  let list = (props.images || []).map((i) => (typeof i === 'string' ? i : i.img || i.image || '')).map(mediaUrl).filter(Boolean)
  if (!list.length && props.avatar) list = [mediaUrl(props.avatar)]
  return list
})
const current = ref(0)
watch(urls, () => { current.value = 0 })
</script>
<template>
  <div class="iot-gallery">
    <div class="iot-gallery__main">
      <img v-if="urls.length" :src="urls[current]" alt="" />
      <div v-else class="iot-gallery__ph">Không có hình ảnh</div>
    </div>
    <div v-if="urls.length > 1" class="iot-gallery__thumbs">
      <button v-for="(u, i) in urls" :key="i" class="iot-gallery__thumb" :class="{ on: i === current }" @click="current = i"><img :src="u" alt="" /></button>
    </div>
  </div>
</template>
<style scoped>
.iot-gallery__main { aspect-ratio: 4 / 3; background: #eef3f1; border-radius: var(--iot-radius); overflow: hidden; }
.iot-gallery__main img { width: 100%; height: 100%; object-fit: cover; }
.iot-gallery__ph { width: 100%; height: 100%; display: grid; place-items: center; color: var(--iot-muted); }
.iot-gallery__thumbs { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.iot-gallery__thumb { width: 64px; height: 48px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; padding: 0; cursor: pointer; background: none; }
.iot-gallery__thumb.on { border-color: var(--iot-primary); }
.iot-gallery__thumb img { width: 100%; height: 100%; object-fit: cover; }
</style>
