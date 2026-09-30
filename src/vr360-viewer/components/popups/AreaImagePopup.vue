<script setup>
defineProps({ point: { type: Object, required: true } });
const emit = defineEmits(['close']);
</script>

<template>
  <div class="poi-popup-backdrop" @click.self="emit('close')">
    <article class="poi-popup poi-area-popup" role="dialog" aria-modal="true" aria-label="Area image">
      <button class="poi-popup-close" type="button" aria-label="Đóng" @click="emit('close')">×</button>
      <span class="poi-popup-eyebrow">AREA</span>
      <h2>{{ point.content?.title || point.label }}</h2>
      <img v-if="point.media?.overlayImageUrl" class="poi-area-image" :src="point.media.overlayImageUrl" alt="" />
      <p v-if="point.content?.description">{{ point.content.description }}</p>
    </article>
  </div>
</template>
