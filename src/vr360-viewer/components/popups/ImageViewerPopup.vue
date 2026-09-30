<script setup>
import { computed, ref } from 'vue';

const props = defineProps({ point: { type: Object, required: true } });
const emit = defineEmits(['close']);
const index = ref(0);
const zoom = ref(1);
const images = computed(() => {
  const values = props.point.media?.images?.length ? props.point.media.images : [props.point.media?.imageUrl].filter(Boolean);
  return values;
});
const current = computed(() => images.value[index.value] || '');
function move(delta) { index.value = (index.value + delta + images.value.length) % images.value.length; zoom.value = 1; }
</script>

<template>
  <div class="poi-popup-backdrop poi-image-backdrop" @click.self="emit('close')">
    <article class="poi-popup poi-image-popup" role="dialog" aria-modal="true" aria-label="Image viewer">
      <button class="poi-popup-close" type="button" aria-label="Đóng" @click="emit('close')">×</button>
      <div class="poi-image-stage" @wheel.prevent="zoom = Math.min(4, Math.max(1, zoom - $event.deltaY * 0.001))">
        <img :src="current" :alt="point.content?.title || point.label" :style="{ transform: `scale(${zoom})` }" />
      </div>
      <div class="poi-image-controls">
        <button type="button" @click="zoom = Math.max(1, zoom - 0.25)">−</button>
        <span>{{ index + 1 }} / {{ images.length }}</span>
        <button type="button" @click="zoom = Math.min(4, zoom + 0.25)">＋</button>
      </div>
      <button v-if="images.length > 1" class="poi-image-prev" type="button" aria-label="Ảnh trước" @click="move(-1)">‹</button>
      <button v-if="images.length > 1" class="poi-image-next" type="button" aria-label="Ảnh tiếp" @click="move(1)">›</button>
    </article>
  </div>
</template>
