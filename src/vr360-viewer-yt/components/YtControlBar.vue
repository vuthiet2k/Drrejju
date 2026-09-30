<script setup>
import { computed } from 'vue';
import YtNavButton from './YtNavButton.vue';
import YtAudioTimeline from './YtAudioTimeline.vue';
import YtAudioControls from './YtAudioControls.vue';
import YtSettingsMenu from './YtSettingsMenu.vue';

const props = defineProps({
  adapter: { type: Object, required: true },
  capabilities: { type: Object, default: () => ({}) },
  sceneState: { type: Object, default: () => ({}) },
  audioState: { type: Object, default: () => ({ available: false }) },
  autorotateState: { type: Object, default: () => ({ available: false, enabled: null }) },
  poiHidden: { type: Boolean, default: false },
  viewMode: { type: String, default: null },
  availableViewModes: { type: Array, default: () => [] },
  fullscreen: { type: Boolean, default: false },
  sceneListOpen: { type: Boolean, default: false },
  controlsHidden: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['command-result', 'toggle-scene-list', 'toggle-controls']);

const canNavigate = computed(() => Boolean(props.capabilities.scene && props.sceneState.totalScenes > 1));
const hasSceneList = computed(() => Boolean(props.capabilities.scene && (props.sceneState.scenes?.length || 0) > 1));

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
</script>

<template>
  <div class="yt-control-bar yt-fadeable" role="toolbar" aria-label="Điều khiển VR360">
    <YtAudioTimeline
      v-if="capabilities.audio"
      :adapter="adapter"
      :audio-state="audioState"
      :disabled="disabled"
      @command-result="emit('command-result', $event)"
    />

    <div class="yt-control-row">
      <!-- LEFT: play/pause AUDIO trước (giống Youtube) + scene navigation.
           Tự động xoay đã chuyển hẳn vào menu Cài đặt (⚙) — không còn nút
           riêng ngoài thanh này nữa, tránh trùng chức năng với play/pause
           audio ở vị trí đầu tiên. -->
      <div class="yt-control-row__group">
        <YtAudioControls
          v-if="capabilities.audio"
          :adapter="adapter"
          :audio-state="audioState"
          :disabled="disabled"
          @command-result="emit('command-result', $event)"
        />
        <YtNavButton
          v-if="canNavigate"
          label="Cảnh trước"
          :disabled="disabled || sceneState.isFirstScene"
          @activate="run('previousScene', 'previous-scene')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
        </YtNavButton>
        <YtNavButton
          v-if="canNavigate"
          label="Cảnh kế tiếp"
          :disabled="disabled || sceneState.isLastScene"
          @activate="run('nextScene', 'next-scene')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
        </YtNavButton>
      </div>

      <div class="yt-control-row__spacer"></div>

      <!-- RIGHT: settings, scene list, fullscreen -->
      <div class="yt-control-row__group">
        <YtSettingsMenu
          :adapter="adapter"
          :capabilities="capabilities"
          :autorotate-enabled="Boolean(autorotateState.enabled)"
          :poi-hidden="poiHidden"
          :view-mode="viewMode"
          :available-view-modes="availableViewModes"
          :disabled="disabled"
          @command-result="emit('command-result', $event)"
        />

        <YtNavButton
          v-if="hasSceneList"
          class="yt-btn--scenelist"
          label="Danh sách cảnh"
          :active="sceneListOpen"
          :disabled="disabled"
          @activate="emit('toggle-scene-list')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h13M4 12h13M4 18h13" />
            <circle cx="20" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="20" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="20" cy="18" r="1" fill="currentColor" stroke="none" />
          </svg>
        </YtNavButton>

        <!-- Ẩn thủ công CHÍNH thanh điều khiển này (yt-control-bar) — KHÁC
             với tự-ẩn theo thời gian rảnh (data-idle): bấm là ẩn ngay bất kể
             có di chuột hay không, phù hợp khi chỉ muốn xem VR không muốn
             control-bar hiện lên mỗi khi rê chuột qua. Nút này cũng bị ẩn
             theo — tap 1 cái (không kéo) lên ảnh panorama để hiện lại, xem
             Vr360ViewerYtLayout.vue -> onSurfacePointerUp. -->
        <YtNavButton
          label="Ẩn điều khiển"
          :active="controlsHidden"
          :disabled="disabled"
          @activate="emit('toggle-controls')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </svg>
        </YtNavButton>

        <YtNavButton
          v-if="capabilities.fullscreen"
          :label="fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'"
          :active="fullscreen"
          :disabled="disabled"
          @activate="run('toggleFullscreen', 'toggle-fullscreen')"
        >
          <svg v-if="fullscreen" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
        </YtNavButton>
      </div>
    </div>
  </div>
</template>
