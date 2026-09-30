<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import AudioHoverControls from './audio/AudioHoverControls.vue';
import { VIEW_MODE } from '../common/controllers/viewModeManager.js';

const props = defineProps({
  sceneName: { type: String, default: '' },
  sceneIndex: { type: Number, default: -1 },
  sceneCount: { type: Number, default: 0 },
  hasMultipleScenes: { type: Boolean, default: false },
  isFirstScene: { type: Boolean, default: false },
  isLastScene: { type: Boolean, default: false },
  isTransitioning: { type: Boolean, default: false },
  audioSession: { type: Object, default: () => ({}) },
  audioService: { type: Object, default: null },
  audioTour: { type: Object, default: () => ({}) },
  activeViewMode: { type: String, default: VIEW_MODE.NORMAL },
});

const emit = defineEmits(['home', 'info', 'prev', 'next', 'view-mode-change']);

const collapsed = ref(false);
const infoOpen = ref(false);

const VIEW_MODE_ORDER = [VIEW_MODE.NORMAL, VIEW_MODE.FIT_EYES, VIEW_MODE.MEGA_VIEW];
const VIEW_MODE_LABEL = {
  [VIEW_MODE.NORMAL]: 'Normal',
  [VIEW_MODE.FIT_EYES]: 'Fit Eyes',
  [VIEW_MODE.MEGA_VIEW]: 'Mega View',
};

const currentViewModeLabel = computed(() => VIEW_MODE_LABEL[props.activeViewMode] || 'Normal');

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  if (collapsed.value) infoOpen.value = false;
}

function toggleInfo() {
  infoOpen.value = !infoOpen.value;
  emit('info', { open: infoOpen.value });
}

function cycleViewMode() {
  const idx = VIEW_MODE_ORDER.indexOf(props.activeViewMode);
  const next = VIEW_MODE_ORDER[(idx + 1) % VIEW_MODE_ORDER.length];
  emit('view-mode-change', next);
}

onBeforeUnmount(() => {});
</script>

<template>
  <div class="viewer-pill" :class="{ 'is-collapsed': collapsed }">
    <button
      type="button"
      class="viewer-pill-btn viewer-pill-arrow"
      :aria-label="collapsed ? 'Mở rộng' : 'Thu gọn'"
      :aria-expanded="!collapsed"
      :title="collapsed ? 'Mở rộng' : 'Thu gọn'"
      @click="toggleCollapse"
    >
      <span v-if="!collapsed" class="viewer-pill-arrow-label">Ẩn</span>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </button>
    <div class="viewer-pill-cluster">
      <button
        type="button"
        class="viewer-pill-btn viewer-pill-home"
        aria-label="Về góc nhìn mặc định"
        title="Về mặc định"
        @click="emit('home')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
        </svg>
      </button>
      <button
        type="button"
        class="viewer-pill-btn viewer-pill-view-mode"
        :aria-label="`Chế độ xem: ${currentViewModeLabel}`"
        :title="`Chế độ xem: ${currentViewModeLabel} (bấm để đổi)`"
        :data-mode="activeViewMode"
        @click="cycleViewMode"
      >
        <svg
          v-if="activeViewMode === VIEW_MODE.NORMAL"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <svg
          v-else-if="activeViewMode === VIEW_MODE.FIT_EYES"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
      <AudioHoverControls
        v-if="audioService"
        class="viewer-pill-audio"
        :session="audioSession"
        :audio-service="audioService"
        :tour="audioTour"
      />
      <!-- <button
        type="button"
        class="viewer-pill-btn viewer-pill-info"
        :aria-pressed="infoOpen"
        aria-label="Thông tin cảnh hiện tại"
        title="Thông tin"
        @click="toggleInfo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button> -->
      <button
        v-if="hasMultipleScenes"
        type="button"
        class="viewer-pill-btn"
        aria-label="Cảnh trước"
        title="Cảnh trước"
        :disabled="isFirstScene || isTransitioning"
        @click="emit('prev')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        v-if="hasMultipleScenes"
        type="button"
        class="viewer-pill-btn"
        aria-label="Cảnh tiếp theo"
        title="Cảnh tiếp theo"
        :disabled="isLastScene || isTransitioning"
        @click="emit('next')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
    <Transition name="viewer-pill-mobile-controls">
      <div v-if="!collapsed" class="viewer-pill-mobile-controls">
        <slot name="mobile-controls" />
      </div>
    </Transition>
    <transition name="viewer-pill-info-pop">
      <div v-if="infoOpen && !collapsed" class="viewer-pill-info-popup" role="status">
        <strong>{{ sceneName || 'Cảnh' }}</strong>
        <span v-if="sceneCount > 1 && sceneIndex >= 0">Cảnh {{ sceneIndex + 1 }} / {{ sceneCount }}</span>
        <span class="viewer-pill-info-view-mode">Chế độ: {{ currentViewModeLabel }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.viewer-pill {
  box-sizing: border-box;
  position: absolute;
  left: auto;
  right: 16px;
  bottom: 16px;
  height: 40px;
  background: rgba(255, 255, 255, 0.26);
  backdrop-filter: blur(14px) saturate(155%);
  -webkit-backdrop-filter: blur(14px) saturate(155%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 16px;
  z-index: 50;
  pointer-events: auto;
  transform: none;
  transition: background 360ms cubic-bezier(0.16, 1, 0.3, 1), border-color 360ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 360ms cubic-bezier(0.16, 1, 0.3, 1);
  animation: viewer-pill-enter 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow: visible;
}

.viewer-pill.is-collapsed {
  width: 40px;
  padding: 0;
  justify-content: center;
  background: rgba(255, 255, 255, 0.32);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.viewer-pill-cluster {
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: visible;
  transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.viewer-pill.is-collapsed .viewer-pill-cluster {
  position: absolute;
  opacity: 0;
  transform: scale(0.92);
  pointer-events: none;
}

.viewer-pill-mobile-controls {
  display: none;
}

@keyframes viewer-pill-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.viewer-pill-btn {
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 0;
  background: transparent;
  color: #222;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  transition: background 140ms ease, color 140ms ease;
}

.viewer-pill-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.08);
  color: #D5001C;
}

.viewer-pill-btn[aria-pressed="true"] {
  color: #D5001C;
}

.viewer-pill-btn:disabled {
  color: rgba(34, 34, 34, 0.35);
  opacity: 1;
  cursor: not-allowed;
}

.viewer-pill-btn:disabled:hover {
  background: transparent;
  color: rgba(34, 34, 34, 0.35);
}

.viewer-pill-btn svg {
  display: block;
  width: 20px;
  height: 20px;
}

.viewer-pill-arrow {
  width: auto;
  min-width: 40px;
  padding: 0 6px;
  gap: 4px;
  border-radius: 20px;
}

.viewer-pill-arrow-label {
  font-size: 10px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: inherit;
}

.viewer-pill-arrow svg {
  width: 20px;
  height: 20px;
  transform: rotate(0deg);
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.viewer-pill.is-collapsed .viewer-pill-arrow {
  padding: 0;
  width: 40px;
}

.viewer-pill.is-collapsed .viewer-pill-arrow svg {
  transform: rotate(180deg);
  width: 20px;
  height: 20px;
}

.viewer-pill-view-mode[data-mode="fit-eyes"],
.viewer-pill-view-mode[data-mode="mega-view"] {
  color: #D5001C;
}

.viewer-pill-audio {
  --viewer-audio-control-size: 40px;
  --viewer-audio-icon-size: 20px;
  align-items: center;
  display: inline-flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.viewer-pill-audio :deep(.viewer-audio-hover) {
  align-items: center;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.viewer-pill-audio :deep(.viewer-audio-hover-trigger) {
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #222;
}

.viewer-pill-audio :deep(.viewer-audio-hover-trigger:hover:not(:disabled)),
.viewer-pill-audio :deep(.viewer-audio-hover-trigger[aria-pressed="true"]) {
  background: rgba(0, 0, 0, 0.08);
  color: #D5001C;
}

.viewer-pill-audio :deep(.viewer-audio-icon) {
  width: 20px;
  height: 20px;
}

.viewer-pill-info-popup {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  min-width: 160px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
  color: #222;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
  white-space: nowrap;
  z-index: 2;
}

.viewer-pill-info-popup strong {
  font-weight: 600;
}

.viewer-pill-info-popup span {
  color: #666;
  font-size: 11px;
}

.viewer-pill-info-view-mode {
  color: #D5001C !important;
  font-weight: 500;
}

.viewer-pill-info-pop-enter-active,
.viewer-pill-info-pop-leave-active {
  transition: opacity 160ms ease, transform 200ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.viewer-pill-info-pop-enter-from,
.viewer-pill-info-pop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 768px), (max-height: 520px) and (pointer: coarse) {
  .viewer-pill {
    --viewer-pill-mobile-glass: rgba(255, 255, 255, 0.22);
    --viewer-pill-mobile-border: rgba(255, 255, 255, 0.3);
    --viewer-pill-mobile-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    bottom: calc(8px + env(safe-area-inset-bottom));
    height: 48px;
    padding: 2px 12px;
    gap: 12px;
    background: var(--viewer-pill-mobile-glass);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border-radius: 24px;
  }

  .viewer-pill:not(.is-collapsed) {
    animation-name: viewer-pill-mobile-expanded-enter;
    left: max(12px, env(safe-area-inset-left));
    right: max(12px, env(safe-area-inset-right));
    width: auto;
    justify-content: center;
    transform: none;
  }

  .viewer-pill.is-collapsed {
    left: auto;
    right: max(12px, env(safe-area-inset-right));
    width: 48px;
    padding: 2px;
    gap: 0;
    transform: none;
    animation-name: viewer-pill-mobile-collapsed-enter;
  }

  .viewer-pill-cluster {
    gap: 12px;
  }

  .viewer-pill-mobile-controls {
    align-items: center;
    box-sizing: border-box;
    background: var(--viewer-pill-mobile-glass);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid var(--viewer-pill-mobile-border);
    border-radius: 24px;
    bottom: calc(100% + 6px);
    box-shadow: var(--viewer-pill-mobile-shadow);
    display: flex;
    justify-content: center;
    pointer-events: auto;
    position: absolute;
    right: 0;
    width: 52px;
  }

  .viewer-pill-btn,
  .viewer-pill.is-collapsed .viewer-pill-arrow {
    height: 44px;
    width: 44px;
  }

  .viewer-pill-arrow {
    min-width: 44px;
    border-radius: 22px;
    padding: 0 6px;
    gap: 4px;
  }

  .viewer-pill-btn svg,
  .viewer-pill-arrow svg,
  .viewer-pill.is-collapsed .viewer-pill-arrow svg {
    width: 24px;
    height: 24px;
  }

  .viewer-pill-audio,
  .viewer-pill-audio :deep(.viewer-audio-hover),
  .viewer-pill-audio :deep(.viewer-audio-hover-trigger) {
    height: 44px;
    width: 44px;
  }

  .viewer-pill-audio {
    flex-basis: 44px;
  }

  .viewer-pill-audio {
    --viewer-audio-control-size: 44px;
    --viewer-audio-icon-size: 24px;
  }

  .viewer-pill-audio :deep(.viewer-audio-icon) {
    width: 24px;
    height: 24px;
  }
}

@keyframes viewer-pill-mobile-expanded-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.viewer-pill-mobile-controls-enter-active,
.viewer-pill-mobile-controls-leave-active {
  transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.viewer-pill-mobile-controls-enter-from,
.viewer-pill-mobile-controls-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}

@keyframes viewer-pill-mobile-collapsed-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .viewer-pill,
  .viewer-pill-cluster,
  .viewer-pill-mobile-controls,
  .viewer-pill-arrow svg {
    animation: none;
    transition: none;
  }
}
</style>
