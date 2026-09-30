<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import YtNavButton from './YtNavButton.vue';

// Play/pause, volume (hover slider), current/duration label.
// Mirrors YtAudioTimeline's local RAF interpolation for the current time label
// so it advances every frame instead of only on adapter events.
const props = defineProps({
  adapter: { type: Object, required: true },
  audioState: { type: Object, default: () => ({ available: false }) },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['command-result']);

const localTime = ref(0);
let rafHandle = 0;
let lastFrameAt = 0;

function stopTick() {
  if (rafHandle) cancelAnimationFrame(rafHandle);
  rafHandle = 0;
  lastFrameAt = 0;
}
function tick(now) {
  const dt = (now - lastFrameAt) / 1000;
  lastFrameAt = now;
  if (props.audioState.playing) {
    const duration = Number(props.audioState.duration) || 0;
    localTime.value = Math.min(duration, localTime.value + dt);
  }
  rafHandle = requestAnimationFrame(tick);
}
function startTick() {
  if (rafHandle) return;
  lastFrameAt = performance.now();
  rafHandle = requestAnimationFrame(tick);
}

watch(
  () => [props.audioState.currentTime, props.audioState.playing],
  ([time, playing]) => {
    const t = Number(time);
    if (Number.isFinite(t)) localTime.value = t;
    if (playing) startTick(); else stopTick();
  },
  { immediate: true },
);
onBeforeUnmount(stopTick);

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const duration = computed(() => {
  const d = Number(props.audioState.duration);
  return Number.isFinite(d) && d > 0 ? d : 0;
});
const hasAudio = computed(() => props.audioState?.available && duration.value > 0);
const isPlaying = computed(() => Boolean(props.audioState?.playing));
const isMuted = computed(() => Boolean(props.audioState?.muted));
const volumeValue = computed(() => {
  const v = Number(props.audioState?.volume);
  return Number.isFinite(v) ? v : 1;
});
const currentLabel = computed(() => formatTime(localTime.value));
const durationLabel = computed(() => formatTime(duration.value));

function run(command, name, value) {
  if (!props.adapter || typeof props.adapter[command] !== 'function') return;
  try {
    const result = value === undefined ? props.adapter[command]() : props.adapter[command](value);
    if (result?.then) {
      result.then((r) => emit('command-result', { name, result: r }))
        .catch((error) => emit('command-result', { name, error }));
      return;
    }
    emit('command-result', { name, result });
  } catch (error) {
    emit('command-result', { name, error });
  }
}

function togglePlayback() { run('toggleAudio', 'toggle-audio'); }
function toggleMute() { run('setAudioMuted', 'set-audio-muted', !props.audioState.muted); }
function setVolume(event) {
  const value = Number(event.target.value);
  if (Number.isFinite(value)) run('setAudioVolume', 'set-audio-volume', value);
}
</script>

<template>
  <template v-if="hasAudio">
    <YtNavButton
      :label="isPlaying ? 'Tạm dừng' : 'Phát'"
      :active="isPlaying"
      :disabled="disabled"
      @activate="togglePlayback"
    >
      <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none" /></svg>
    </YtNavButton>

    <div class="yt-volume">
      <YtNavButton
        :label="isMuted ? 'Bật tiếng' : 'Tắt tiếng'"
        :active="isMuted"
        :disabled="disabled"
        @activate="toggleMute"
      >
        <svg v-if="isMuted" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h4l5-4v12l-5-4H4z" />
          <path d="m16 9 5 6m0-6-5 6" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h4l5-4v12l-5-4H4z" />
          <path d="M16 9c1.2 1.6 1.2 4.4 0 6" />
          <path d="M18.5 6.5c2.6 3.1 2.6 7.9 0 11" />
        </svg>
      </YtNavButton>
      <div class="yt-volume__slider">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="isMuted ? 0 : volumeValue"
          :disabled="disabled"
          aria-label="Âm lượng"
          @input="setVolume"
        />
      </div>
    </div>

    <span class="yt-control-row__time">
      {{ currentLabel }} <span class="yt-control-row__time--dim">/ {{ durationLabel }}</span>
    </span>
  </template>
</template>
