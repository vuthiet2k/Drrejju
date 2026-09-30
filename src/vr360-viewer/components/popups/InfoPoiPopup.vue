<script setup>
import { computed, ref, watch } from 'vue';
import { youtubeEmbedUrl } from '../../common/utils/media.js';

const emit = defineEmits(['close']);
const props = defineProps({ point: { type: Object, required: true }, audioService: { type: Object, default: null }, audioSession: { type: Object, default: null } });
const title = computed(() => props.point.content?.title || props.point.label || 'Điểm tham quan');
const shortDescription = computed(() => props.point.content?.shortDescription || '');
const description = computed(() => props.point.content?.description || '');
const images = computed(() => [...new Set([
  ...(Array.isArray(props.point.media?.images) ? props.point.media.images : []),
  props.point.media?.imageUrl,
].filter(Boolean))]);
const heroImage = computed(() => images.value[0] || '');
const youtube = computed(() => youtubeEmbedUrl(props.point.media?.youtubeUrl));
const link = computed(() => { const value = String(props.point.content?.link || '').trim(); return /^https?:\/\//i.test(value) ? value : ''; });
const audio = computed(() => {
  if (typeof props.point.audio === 'string') return { url: props.point.audio };
  if (props.point.audio && typeof props.point.audio === 'object') return props.point.audio;
  return props.point.audio_url ? { url: props.point.audio_url } : {};
});
const hasAudio = computed(() => Boolean(audio.value.url));
const isAudioPlaying = computed(() => props.audioSession?.sourceType === 'poi' && props.audioSession?.sourceId === props.point.id && props.audioSession?.status === 'playing');
function toggleAudio() {
  if (!props.audioService || !hasAudio.value) return;
  if (props.audioSession?.sourceId === props.point.id && props.audioSession?.url) return props.audioService.toggle();
  props.audioService.playPoi(audio.value.url, { sourceId: props.point.id, title: audio.value.title || title.value, volume: audio.value.volume, loop: audio.value.loop, playbackRate: audio.value.playbackRate });
}
watch(() => props.point, () => { lightboxIndex.value = -1; });

const lightboxIndex = ref(-1);
const lightboxOpen = computed(() => lightboxIndex.value >= 0 && lightboxIndex.value < images.value.length);
const lightboxImage = computed(() => images.value[lightboxIndex.value] || '');
function openLightbox(index) { lightboxIndex.value = index; }
function closeLightbox() { lightboxIndex.value = -1; }
function lightboxMove(delta) {
  if (images.value.length <= 1) return;
  lightboxIndex.value = (lightboxIndex.value + delta + images.value.length) % images.value.length;
}
</script>

<template>
  <div class="poi-popup-backdrop" @click.self="emit('close')">
    <article class="poi-popup poi-info-popup poi-light-glass" role="dialog" aria-modal="true" aria-labelledby="poi-info-title">
      <header class="poi-info-header">
        <div>
          <span class="poi-popup-eyebrow">POINT OF INTEREST</span>
          <h2 id="poi-info-title">{{ title }}</h2>
        </div>
        <button class="poi-popup-close" type="button" aria-label="Đóng" @click="emit('close')">×</button>
      </header>
      <div class="poi-info-content">
        <section class="poi-info-section poi-info-hero" :class="{ 'is-image-less': !heroImage }" aria-label="Thông tin chính">
          <div v-if="heroImage" class="poi-info-hero-image"><img :src="heroImage" :alt="title" /></div>
          <div class="poi-info-hero-copy">
            <p v-if="shortDescription" class="poi-info-short-description">{{ shortDescription }}</p>
          </div>
        </section>
        <section v-if="description || hasAudio" class="poi-info-section poi-info-description-section">
          <h3>Mô tả chi tiết</h3>
          <p v-if="description" class="poi-info-description">{{ description }}</p>
          <div v-if="hasAudio" class="poi-info-audio">
            <div class="poi-info-audio-copy">
              <strong>Thuyết minh audio</strong>
              <span v-if="audio.description">{{ audio.description }}</span>
            </div>
            <button type="button" class="poi-info-audio-button" :aria-pressed="isAudioPlaying" @click="toggleAudio">{{ isAudioPlaying ? 'Tạm dừng' : 'Phát audio' }}</button>
          </div>
        </section>
        <section v-if="images.length" class="poi-info-section poi-info-gallery-section">
          <h3>Danh sách hình ảnh</h3>
          <div class="poi-info-gallery-grid">
            <button v-for="(image, index) in images" :key="`${image}-${index}`" type="button" class="poi-info-gallery-thumb" :aria-label="`Xem ảnh ${index + 1}`" @click="openLightbox(index)">
              <img :src="image" :alt="`${title} - ảnh ${index + 1}`" />
            </button>
          </div>
        </section>
        <section v-if="youtube" class="poi-info-section">
          <h3>Video tham quan</h3>
          <div class="poi-info-video"><iframe :src="youtube" :title="`${title} - YouTube`" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen /></div>
        </section>
        <a v-if="link" class="poi-info-link" :href="link" target="_blank" rel="noopener noreferrer">Khám phá thêm <span aria-hidden="true">↗</span></a>
      </div>
    </article>

    <div v-if="lightboxOpen" class="poi-lightbox-backdrop" @click.self="closeLightbox">
      <div class="poi-lightbox">
        <button class="poi-lightbox-close" type="button" aria-label="Đóng" @click="closeLightbox">×</button>
        <img class="poi-lightbox-image" :src="lightboxImage" :alt="`${title} - ảnh ${lightboxIndex + 1}`" />
        <button v-if="images.length > 1" class="poi-lightbox-nav poi-lightbox-prev" type="button" aria-label="Ảnh trước" @click="lightboxMove(-1)">‹</button>
        <button v-if="images.length > 1" class="poi-lightbox-nav poi-lightbox-next" type="button" aria-label="Ảnh tiếp theo" @click="lightboxMove(1)">›</button>
        <span v-if="images.length > 1" class="poi-lightbox-counter">{{ lightboxIndex + 1 }} / {{ images.length }}</span>
      </div>
    </div>
  </div>
</template>
