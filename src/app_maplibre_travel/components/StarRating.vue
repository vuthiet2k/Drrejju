<script setup>
import { computed } from 'vue'
const props = defineProps({ value: { type: Number, default: 0 }, count: { type: Number, default: 0 }, size: { type: Number, default: 16 } })
const stars = computed(() => {
  const v = Math.round(props.value * 2) / 2
  return [1, 2, 3, 4, 5].map((i) => (v >= i ? 'full' : v >= i - 0.5 ? 'half' : 'empty'))
})
</script>
<template>
  <span class="iot-rating" :style="{ fontSize: size + 'px' }">
    <span v-for="(s, i) in stars" :key="i" class="iot-star" :class="s">★</span>
    <span v-if="count" class="iot-rating__count">({{ count }})</span>
  </span>
</template>
<style scoped>
.iot-rating { display: inline-flex; align-items: center; gap: 1px; line-height: 1; }
.iot-star { color: #d9dedb; }
.iot-star.full { color: #f5a623; }
.iot-star.half { background: linear-gradient(90deg, #f5a623 50%, #d9dedb 50%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.iot-rating__count { color: var(--iot-muted); font-size: 0.75em; margin-left: 4px; }
</style>
