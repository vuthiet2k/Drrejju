<script setup>
import { computed } from 'vue'
import StarRating from './StarRating.vue'
const props = defineProps({ ratings: { type: Array, default: () => [] } })
const list = computed(() => props.ratings || [])
const average = computed(() => {
  if (!list.value.length) return 0
  return list.value.reduce((s, r) => s + (Number(r.rate) || 0), 0) / list.value.length
})
function authorName(r) {
  const c = r.creator
  if (!c) return 'Ẩn danh'
  if (typeof c === 'string') return c
  return [c.first_name, c.last_name].filter(Boolean).join(' ') || c.username || 'Ẩn danh'
}
</script>
<template>
  <section class="iot-ratings">
    <h2 class="iot-section-title">Đánh giá &amp; nhận xét</h2>
    <div v-if="list.length" class="iot-ratings__summary">
      <span class="iot-ratings__avg">{{ average.toFixed(1) }}</span>
      <StarRating :value="average" :count="list.length" :size="20" />
    </div>
    <ul v-if="list.length" class="iot-ratings__list">
      <li v-for="r in list" :key="r.id" class="iot-ratings__item">
        <div class="iot-ratings__head"><strong>{{ authorName(r) }}</strong><StarRating :value="Number(r.rate) || 0" :size="14" /></div>
        <p v-if="r.content" class="iot-ratings__content">{{ r.content }}</p>
      </li>
    </ul>
    <p v-else class="iot-muted">Chưa có đánh giá.</p>
  </section>
</template>
<style scoped>
.iot-ratings { margin-top: 28px; }
.iot-ratings__summary { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.iot-ratings__avg { font-size: 32px; font-weight: 800; color: var(--iot-primary); }
.iot-ratings__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.iot-ratings__item { background: var(--iot-surface); border: 1px solid var(--iot-border); border-radius: 10px; padding: 12px 14px; }
.iot-ratings__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.iot-ratings__content { margin: 6px 0 0; }
</style>
