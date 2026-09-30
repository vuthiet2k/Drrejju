<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { formatDuration } from '../../common/audio/utils.js';

const props = defineProps({
  session: { type: Object, required: true },
  audioService: { type: Object, required: true },
  tour: { type: Object, default: () => ({}) },
});

const hovered = ref(false);
let hideTimer = null;

const isPlaying = computed(() => props.session.status === 'playing');
const isLoading = computed(() => props.session.status === 'loading');
const isMuted = computed(() => Boolean(props.session.muted));
const hasAudio = computed(() => Boolean(props.session.url));
const canStartTour = computed(() => Boolean(props.tour?.enabled && props.tour?.url));
const progressPercent = computed(() => {
  const d = Number(props.session.duration);
  const t = Number(props.session.currentTime);
  return d > 0 ? Math.min(100, Math.max(0, (t / d) * 100)) : 0;
});
const title = computed(() => props.session.title || (
  props.session.sourceType === 'poi' ? 'Audio POI' : props.tour.title || 'Tour narration'
));

function onEnter() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  hovered.value = true;
}

function onLeave() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { hovered.value = false; hideTimer = null; }, 250);
}

function onProgressClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const duration = Number(props.session.duration) || 0;
  props.audioService.seek(ratio * duration);
}

function togglePlay() {
  if (hasAudio.value) {
    if (import.meta.env?.DEV) console.debug('[Audio UI] Toggle active audio');
    props.audioService.toggle();
    return;
  }
  if (canStartTour.value) {
    if (import.meta.env?.DEV) console.debug('[Audio UI] Start tour audio');
    props.audioService.playTour(props.tour.url, {
      sourceId: 'tour',
      title: props.tour.title || 'Tour narration',
      volume: props.tour.volume,
    });
  }
}

function keepProgressOpen() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  hovered.value = true;
}

onBeforeUnmount(() => { if (hideTimer) clearTimeout(hideTimer); });
</script>

<template>
  <div class="viewer-audio-hover" @mouseenter="onEnter" @mouseleave="onLeave">
    <button
      type="button"
      class="viewer-audio-hover-trigger"
      :aria-pressed="isPlaying"
      :disabled="!hasAudio && !canStartTour"
      :aria-label="isPlaying ? 'Pause audio' : hasAudio || canStartTour ? 'Play audio' : 'Audio not available'"
      title="Audio"
      @click="togglePlay"
    >
      <span class="viewer-audio-icon" :class="{ 'is-loading': isLoading, 'is-muted': isMuted }" aria-hidden="true">
        <svg v-if="!isPlaying || isMuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
          <path v-if="isMuted" d="M16 9l5 6M21 9l-5 6" />
        </svg>
        <svg v-else class="viewer-audio-bars" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect class="viewer-audio-bar viewer-audio-bar-one" x="5.5" y="8" width="3" height="8" rx="1.5" />
          <rect class="viewer-audio-bar viewer-audio-bar-two" x="10.5" y="5" width="3" height="14" rx="1.5" />
          <rect class="viewer-audio-bar viewer-audio-bar-three" x="15.5" y="7" width="3" height="10" rx="1.5" />
        </svg>
        <i v-if="isLoading" class="viewer-audio-loading-pulse"></i>
      </span>
    </button>
    <Transition name="viewer-audio-hover">
      <div v-if="hovered && (hasAudio || canStartTour)" class="viewer-audio-hover-panel" role="group" aria-label="Audio controls" @mouseenter="keepProgressOpen">
        <strong class="viewer-audio-hover-title">{{ title }}</strong>
        <button class="viewer-audio-hover-play" type="button" :aria-label="isPlaying ? 'Pause audio' : 'Play audio'" @click="togglePlay">
          <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </button>
        <div v-if="hasAudio" class="viewer-audio-nav-progress" role="slider" aria-label="Audio progress"
          :aria-valuemin="0" :aria-valuemax="session.duration || 0" :aria-valuenow="session.currentTime || 0"
          @click="onProgressClick">
          <div class="viewer-audio-nav-progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span v-if="hasAudio" class="viewer-audio-hover-time">
          {{ formatDuration(session.currentTime) }} — {{ formatDuration(session.duration) }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.viewer-audio-hover {
  --viewer-audio-control-size: 40px;
  --viewer-audio-icon-size: 20px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.viewer-audio-hover-trigger {
  width: var(--viewer-audio-control-size);
  height: var(--viewer-audio-control-size);
  border-radius: 10px;
  border: 0;
  background: transparent;
  color: #333;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: background 140ms ease, color 140ms ease;
}

.viewer-audio-hover-trigger:hover:not(:disabled),
.viewer-audio-hover-trigger[aria-pressed="true"] {
  background: rgba(0, 0, 0, 0.05);
  color: #D5001C;
}

.viewer-audio-hover-trigger:disabled {
  color: #999;
  opacity: 0.5;
  cursor: not-allowed;
}

.viewer-audio-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--viewer-audio-icon-size);
  position: relative;
  width: var(--viewer-audio-icon-size);
}

.viewer-audio-icon svg {
  display: block;
  width: var(--viewer-audio-icon-size);
  height: var(--viewer-audio-icon-size);
}

.viewer-audio-bars {
  overflow: visible;
}

.viewer-audio-bar {
  transform-box: fill-box;
  transform-origin: center;
}

.viewer-audio-bar-one { animation: viewer-audio-bars 1.15s ease-in-out -0.35s infinite; }
.viewer-audio-bar-two { animation: viewer-audio-bars 1.15s ease-in-out -0.7s infinite; }
.viewer-audio-bar-three { animation: viewer-audio-bars 1.15s ease-in-out -0.1s infinite; }
.viewer-audio-bar-four { animation: viewer-audio-bars 1.15s ease-in-out -0.5s infinite; }

@keyframes viewer-audio-bars {
  0%, 100% { opacity: 0.62; transform: scaleY(0.38); }
  50% { opacity: 1; transform: scaleY(1); }
}

.viewer-audio-loading-pulse {
  box-sizing: border-box;
  pointer-events: none;
  position: absolute;
}

.viewer-audio-loading-pulse {
  border: 1px solid currentColor;
  border-radius: 50%;
  height: 14px;
  left: 3px;
  opacity: 0.6;
  top: 3px;
  transform: scale(0.82);
  width: 14px;
  animation: viewer-audio-loading-pulse 1.2s ease-out infinite;
}

@keyframes viewer-audio-loading-pulse {
  0% { opacity: 0.55; transform: scale(0.82); }
  100% { opacity: 0; transform: scale(1.22); }
}

@media (prefers-reduced-motion: reduce) {
  .viewer-audio-bar,
  .viewer-audio-loading-pulse {
    animation: none;
  }

  .viewer-audio-loading-pulse {
    opacity: 0;
  }
}

.viewer-audio-nav-progress {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  height: 8px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.viewer-audio-hover-panel {
  align-items: center;
  background: rgba(20, 20, 28, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  bottom: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  left: 50%;
  min-width: 190px;
  padding: 9px 11px;
  position: absolute;
  transform: translate(-50%, 0) scale(1);
  transform-origin: center bottom;
  transition: opacity 180ms ease, transform 180ms ease;
  z-index: 3;
}

.viewer-audio-hover-title {
  font-size: 11px;
  font-weight: 600;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-audio-hover-play {
  align-items: center;
  background: var(--viewer-accent, #D5001C);
  border: 0;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  height: 26px;
  justify-content: center;
  padding: 0;
  width: 26px;
}

.viewer-audio-hover-play svg {
  height: 13px;
  width: 13px;
}

.viewer-audio-hover-time {
  color: rgba(255, 255, 255, 0.62);
  font-size: 10px;
}

.viewer-audio-hover-enter-active,
.viewer-audio-hover-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.viewer-audio-hover-enter-from,
.viewer-audio-hover-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px) scale(0.98);
}

@media (max-width: 768px), (hover: none) {
  .viewer-audio-hover-panel,
  .viewer-audio-nav-progress {
    display: none;
  }
}

.viewer-audio-nav-progress::before {
  background: color-mix(in srgb, var(--viewer-accent, #D5001C) 20%, transparent);
  border-radius: inherit;
  content: '';
  inset: 0;
  position: absolute;
}

.viewer-audio-nav-progress-fill {
  position: absolute;
  background: var(--viewer-accent, #D5001C);
  border-radius: 999px;
  bottom: 0;
  left: 0;
  top: 0;
  transition: width 100ms linear;
}
</style>
