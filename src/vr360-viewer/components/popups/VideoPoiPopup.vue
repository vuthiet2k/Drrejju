<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { youtubeEmbedUrl } from '../../common/utils/media.js';

const props = defineProps({ point: { type: Object, required: true } });
const emit = defineEmits(['close']);
const video = ref(null);
const youtube = computed(() => youtubeEmbedUrl(props.point.media?.youtubeUrl || props.point.media?.videoUrl));
const title = computed(() => props.point.content?.title || props.point.label || 'Video');
const description = computed(() => props.point.content?.description || '');
function close() { emit('close'); }
function onKeydown(event) { if (event.key === 'Escape') close(); }
function toggleFullscreen() { video.value?.requestFullscreen?.().catch(() => {}); }
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="viewer-video-modal-backdrop" @click.self="close">
    <article class="viewer-video-modal" role="dialog" aria-modal="true" aria-labelledby="viewer-video-modal-title">
      <header class="viewer-video-modal-header">
        <div><span>VIDEO</span><h2 id="viewer-video-modal-title">{{ title }}</h2></div>
        <button type="button" aria-label="Đóng video" @click="close">×</button>
      </header>
      <div class="viewer-video-modal-stage">
        <iframe v-if="youtube" :src="youtube" :title="title" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen />
        <video v-else ref="video" :src="point.media?.videoUrl" controls autoplay playsinline />
        <button v-if="!youtube" class="viewer-video-fullscreen" type="button" aria-label="Toàn màn hình" @click="toggleFullscreen">⛶</button>
      </div>
      <footer v-if="description" class="viewer-video-modal-meta">
        <p>{{ description }}</p>
      </footer>
    </article>
  </div>
</template>
