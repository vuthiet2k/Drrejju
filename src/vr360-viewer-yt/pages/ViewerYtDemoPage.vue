<script setup>
import { ref } from 'vue';
import fixture from '@/vr360-viewer/assets/demo-tour.json';
import Vr360ViewerYt from '../Vr360ViewerYt.vue';

const tour = ref(fixture);
</script>

<template>
  <div class="vr360-yt-demo">
    <Vr360ViewerYt :tour="tour" :options="{ brand: 'VR360 YT DEMO', autoRotate: false }" />
  </div>
</template>

<style scoped>
.vr360-yt-demo {
  display: flex; flex-direction: column;
  min-height: 100vh;
  background: #0a0a0f;
}
.vr360-yt-demo > * { flex: 1; }
</style>
