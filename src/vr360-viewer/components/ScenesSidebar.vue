<script setup>
import { ref } from "vue";
import SidebarToggleTab from "./SidebarToggleTab.vue";

defineProps({
  scenes: { type: Array, default: () => [] },
  activeSceneId: { type: String, default: "" },
  visitedSceneIds: { type: Object, default: () => new Set() },
  autoRotate: { type: Boolean, default: false },
  isFullscreen: { type: Boolean, default: false },
  poiHidden: { type: Boolean, default: false },
  controlsOnly: { type: Boolean, default: false },
});

const emit = defineEmits([
  "select-scene",
  "toggle-autorotate",
  "toggle-fullscreen",
  "toggle-poi",
]);

const expanded = ref(false);

function open() {
  expanded.value = true;
}

function toggle() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <div class="scenes-sidebar-root" :class="{ 'controls-only': controlsOnly }">
    <div
      v-if="!controlsOnly"
      class="scenes-sidebar-trigger"
      aria-hidden="true"
      @mouseenter="open"
    ></div>
    <aside
      class="scenes-sidebar"
      :class="{ open: expanded || controlsOnly }"
      :role="controlsOnly ? 'toolbar' : 'navigation'"
      :aria-label="controlsOnly ? 'Viewer controls' : 'Scene list'"
    >
      <header v-if="!controlsOnly" class="scenes-sidebar-header">Scenes</header>
      <div v-if="!controlsOnly" class="scenes-sidebar-list">
        <button
          v-for="scene in scenes"
          :key="scene.id"
          type="button"
          class="scenes-sidebar-item"
          :class="{
            active: scene.id === activeSceneId,
            visited: visitedSceneIds?.has?.(scene.id),
          }"
          :aria-current="scene.id === activeSceneId ? 'true' : undefined"
          :aria-label="`${scene.name}${scene.id === activeSceneId ? ', current scene' : ''}${visitedSceneIds?.has?.(scene.id) ? ', visited' : ''}`"
          @click="emit('select-scene', scene.id)"
        >
          <span class="scenes-sidebar-thumb">
            <img
              v-if="scene.thumbnailSource"
              :src="scene.thumbnailSource"
              alt=""
              crossorigin="anonymous"
            />
          </span>
          <span class="scenes-sidebar-name">{{ scene.name }}</span>
          <span
            v-if="visitedSceneIds?.has?.(scene.id)"
            class="scenes-sidebar-check"
            aria-hidden="true"
            >✓</span
          >
        </button>
      </div>
      <footer class="scenes-sidebar-controls">
        <!-- Fullscreen Button -->
        <button
          type="button"
          :class="{ active: isFullscreen }"
          :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          :aria-pressed="isFullscreen"
          :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
          @click="emit('toggle-fullscreen')"
        >
          <!-- Exit Fullscreen SVG -->
          <svg
            v-if="isFullscreen"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
            />
          </svg>
          <!-- Enter Fullscreen SVG -->
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            />
          </svg>
        </button>

        <!-- POI Button -->
        <button
          v-if="!controlsOnly"
          type="button"
          :class="{ active: poiHidden }"
          :aria-label="poiHidden ? 'Show POI icons' : 'Hide POI icons'"
          :aria-pressed="poiHidden"
          :title="poiHidden ? 'Show POI icons' : 'Hide POI icons'"
          @click="emit('toggle-poi')"
        >
          <!-- POI Off SVG (Gạch chéo) -->
          <svg
            v-if="poiHidden"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
          <!-- POI On SVG -->
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>

        <!-- Auto Rotate Button -->
        <button
          type="button"
          :class="{ active: autoRotate }"
          :aria-label="
            autoRotate ? 'Disable auto rotate' : 'Enable auto rotate'
          "
          :aria-pressed="autoRotate"
          :title="autoRotate ? 'Auto rotate on' : 'Auto rotate off'"
          @click="emit('toggle-autorotate')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </footer>
    </aside>
    <SidebarToggleTab v-if="!controlsOnly" :expanded="expanded" @toggle="toggle" />
  </div>
</template>

<style scoped>
.scenes-sidebar-root {
  position: absolute;
  inset: 0 auto 0 0;
  width: 245px;
  z-index: 50;
  pointer-events: none;
}

.scenes-sidebar-trigger {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 100%;
  z-index: 1;
  pointer-events: auto;
}

.scenes-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 245px;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  color: #222;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1);
  pointer-events: auto;
  z-index: 2;
}

.scenes-sidebar.open {
  transform: translateX(0);
}

.scenes-sidebar-header {
  padding: 20px 20px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #333;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.scenes-sidebar-list {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scenes-sidebar-list::-webkit-scrollbar {
  width: 6px;
}
.scenes-sidebar-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.scenes-sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: #222;
  font-size: 13px;
  text-align: left;
  transition:
    background 140ms ease,
    color 140ms ease;
}

.scenes-sidebar-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.scenes-sidebar-item.active {
  color: #d5001c;
  background: rgba(213, 0, 28, 0.06);
}

.scenes-sidebar-thumb {
  width: 100px;
  height: 70px;
  background-color: #d5d5d5;
  border-radius: 4px;
  border: 2px solid transparent;
  flex-shrink: 0;
  overflow: hidden;
  transition: border-color 140ms ease;
}

.scenes-sidebar-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.scenes-sidebar-item.active .scenes-sidebar-thumb {
  border-color: #d5001c;
}

.scenes-sidebar-name {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.scenes-sidebar-check {
  color: #999;
  font-size: 12px;
  flex-shrink: 0;
}

.scenes-sidebar-item.active .scenes-sidebar-check {
  color: #d5001c;
}

.scenes-sidebar-controls {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.scenes-sidebar-controls button {
  flex: 1 1 auto;
  height: 40px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  color: #333;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.scenes-sidebar-controls button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.scenes-sidebar-controls button.active {
  color: #d5001c;
}

.scenes-sidebar-root.controls-only {
  height: auto;
  inset: auto;
  position: static;
  width: auto;
}

.scenes-sidebar-root.controls-only .scenes-sidebar {
  background: transparent;
  border: 0;
  box-shadow: none;
  height: auto;
  position: static;
  transform: none;
  width: auto;
}

.scenes-sidebar-root.controls-only .scenes-sidebar-controls {
  box-sizing: border-box;
  border: 0;
  flex-direction: column;
  gap: 4px;
  padding: 3px;
}

.scenes-sidebar-root.controls-only .scenes-sidebar-controls button {
  flex: 0 0 44px;
  height: 44px;
  width: 44px;
}

.scenes-sidebar-root.controls-only .scenes-sidebar-controls svg {
  height: 24px;
  width: 24px;
}
</style>
