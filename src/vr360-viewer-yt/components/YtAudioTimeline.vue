<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';

// YT-style always-visible timeline. Local RAF interpolates between adapter
// events so the fill moves smoothly. Reset from adapter's currentTime on
// every event.
const props = defineProps({
  adapter: { type: Object, required: true },
  audioState: { type: Object, default: () => ({ available: false }) },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['command-result']);

const localTime = ref(0);
const draggingTime = ref(null);
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
  if (props.audioState.playing && draggingTime.value === null) {
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
  () => [props.audioState.currentTime, props.audioState.playing, props.audioState.duration],
  ([time, playing]) => {
    const t = Number(time);
    if (Number.isFinite(t) && draggingTime.value === null) localTime.value = t;
    if (playing) startTick(); else stopTick();
  },
  { immediate: true },
);
onBeforeUnmount(stopTick);

const duration = computed(() => {
  const d = Number(props.audioState.duration);
  return Number.isFinite(d) && d > 0 ? d : 0;
});
const displayedTime = computed(() => {
  const t = draggingTime.value !== null ? draggingTime.value : localTime.value;
  return Math.min(duration.value || t, Math.max(0, t));
});
const progressPct = computed(() => (duration.value > 0 ? (displayedTime.value / duration.value) * 100 : 0));
const hasAudio = computed(() => props.audioState?.available && duration.value > 0);

function run(command, name, value) {
  if (!props.adapter || typeof props.adapter[command] !== 'function') return;
  try {
    const result = props.adapter[command](value);
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

function onSeekInput(event) {
  const value = Number(event.target.value);
  if (Number.isFinite(value)) draggingTime.value = value;
}
function onSeekCommit(event) {
  const value = Number(event.target.value);
  draggingTime.value = null;
  if (Number.isFinite(value)) run('seekAudio', 'seek-audio', value);
}
</script>

<template>
  <div v-if="hasAudio" class="yt-timeline">
    <div class="yt-timeline__track">
      <div class="yt-timeline__fill" :style="{ width: `${progressPct}%` }"></div>
      <div class="yt-timeline__thumb" :style="{ left: `${progressPct}%` }"></div>
      <input
        class="yt-timeline__scrubber"
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        :value="displayedTime"
        :disabled="disabled"
        aria-label="Vị trí phát"
        @input="onSeekInput"
        @change="onSeekCommit"
      />
    </div>
  </div>
</template>
