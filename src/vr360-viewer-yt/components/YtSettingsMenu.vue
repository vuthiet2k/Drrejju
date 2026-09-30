<script setup>
import { ref, watch } from 'vue';
import YtNavButton from './YtNavButton.vue';

const props = defineProps({
  adapter: { type: Object, default: null },
  capabilities: { type: Object, default: () => ({}) },
  autorotateEnabled: { type: Boolean, default: false },
  poiHidden: { type: Boolean, default: false },
  viewMode: { type: String, default: null },
  availableViewModes: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['command-result']);

const open = ref(false);
const rootEl = ref(null);

function close() { open.value = false; }
function toggle() { if (!props.disabled) open.value = !open.value; }

// Close when clicking outside — teleport lives inside .tour-viewer-page,
// document listener works because pointer events reach root.
function onDocPointer(event) {
  if (!open.value) return;
  if (rootEl.value && !rootEl.value.contains(event.target)) close();
}
watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('pointerdown', onDocPointer, true);
  else document.removeEventListener('pointerdown', onDocPointer, true);
});

const viewModeLabels = {
  'normal': 'Bình thường',
  'fit-eyes': 'Fit Eyes',
  'mega-view': 'Mega View',
};

function run(command, name, value) {
  if (!props.adapter || typeof props.adapter[command] !== 'function') return;
  try {
    const result = value === undefined ? props.adapter[command]() : props.adapter[command](value);
    if (result?.then) {
      result.then((resolved) => emit('command-result', { name, result: resolved }))
        .catch((error) => emit('command-result', { name, error }));
      return;
    }
    emit('command-result', { name, result });
  } catch (error) {
    emit('command-result', { name, error });
  }
}

function pickViewMode(mode) {
  run('setViewMode', 'set-view-mode', mode);
}
</script>

<template>
  <div
    ref="rootEl"
    class="yt-settings"
    :data-open="open ? 'true' : 'false'"
  >
    <YtNavButton
      label="Cài đặt"
      :active="open"
      :disabled="disabled"
      @activate="toggle"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    </YtNavButton>

    <div class="yt-settings__menu" role="menu" aria-label="Cài đặt xem">
      <button
        v-if="capabilities.poi"
        type="button"
        class="yt-settings__item"
        role="menuitemcheckbox"
        :data-on="poiHidden ? 'true' : 'false'"
        :aria-checked="poiHidden"
        @click="run('togglePoi', 'toggle-poi')"
      >
        <span class="yt-settings__item__label">
          <span>Ẩn điểm POI</span>
        </span>
        <span class="yt-settings__item__toggle" aria-hidden="true"></span>
      </button>

      <button
        v-if="capabilities.autorotate"
        type="button"
        class="yt-settings__item"
        role="menuitemcheckbox"
        :data-on="autorotateEnabled ? 'true' : 'false'"
        :aria-checked="autorotateEnabled"
        @click="run('toggleAutorotate', 'toggle-autorotate')"
      >
        <span class="yt-settings__item__label">
          <span>Tự động xoay</span>
        </span>
        <span class="yt-settings__item__toggle" aria-hidden="true"></span>
      </button>

      <button
        v-if="capabilities.view"
        type="button"
        class="yt-settings__item"
        role="menuitem"
        @click="run('resetView', 'reset-view'); close()"
      >
        <span class="yt-settings__item__label">
          <span>Góc mặc định</span>
        </span>
        <span class="yt-settings__item__value">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
        </span>
      </button>

      <template v-if="capabilities.viewMode && availableViewModes.length > 1">
        <div class="yt-settings__divider" aria-hidden="true"></div>
        <div class="yt-settings__section">Chế độ xem</div>
        <button
          v-for="mode in availableViewModes"
          :key="mode"
          type="button"
          class="yt-settings__item"
          role="menuitemradio"
          :data-active="viewMode === mode ? 'true' : 'false'"
          :aria-checked="viewMode === mode"
          @click="pickViewMode(mode); close()"
        >
          <span class="yt-settings__item__label">
            <span>{{ viewModeLabels[mode] || mode }}</span>
          </span>
          <span class="yt-settings__item__value">
            <svg v-if="viewMode === mode" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10" /></svg>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>
