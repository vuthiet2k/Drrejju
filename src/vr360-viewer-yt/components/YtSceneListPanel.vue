<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  scenes: { type: Array, default: () => [] },
  currentSceneId: { type: String, default: '' },
  open: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['select-scene', 'close']);

const items = computed(() =>
  props.scenes.map((scene, index) => ({
    id: scene?.id || '',
    name: scene?.name || scene?.title || `Scene ${index + 1}`,
    thumb: scene?.thumbnail || scene?.imageSources?.[0] || scene?.image || '',
    index,
    active: scene?.id === props.currentSceneId,
  })),
);

// Đóng panel khi bấm ra ngoài — cùng cách làm với YtSettingsMenu (document
// pointerdown ở capture phase, vì panel nằm trong Teleport nên listener gắn
// ở component cha bình thường sẽ không "thấy" click ở nơi khác trong DOM
// gốc). Bỏ qua click trúng nút toggle (`.yt-btn--scenelist` ở YtControlBar,
// một component anh em khác) để tránh đóng rồi mở lại ngay trong cùng thao
// tác (pointerdown đóng panel, rồi click trên cùng nút lại bật lại).
const rootEl = ref(null);
function onDocPointer(event) {
  if (!props.open) return;
  if (event.target?.closest?.('.yt-btn--scenelist')) return;
  if (rootEl.value && !rootEl.value.contains(event.target)) emit('close');
}
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) document.addEventListener('pointerdown', onDocPointer, true);
    else document.removeEventListener('pointerdown', onDocPointer, true);
  },
);
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer, true));
</script>

<template>
  <aside
    ref="rootEl"
    class="yt-scene-panel yt-fadeable"
    :data-open="open ? 'true' : 'false'"
    role="dialog"
    aria-label="Danh sách cảnh"
  >
    <header class="yt-scene-panel__head">
      <div>
        <h3 class="yt-scene-panel__title">Playlist cảnh</h3>
        <div class="yt-scene-panel__count">{{ items.length }} cảnh</div>
      </div>
      <button
        type="button"
        class="yt-btn"
        aria-label="Đóng danh sách"
        @click="emit('close')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </header>
    <div class="yt-scene-panel__list">
      <button
        v-for="item in items"
        :key="item.id || item.index"
        type="button"
        class="yt-scene-item"
        :data-active="item.active ? 'true' : 'false'"
        :disabled="disabled"
        @click="!disabled && emit('select-scene', item.id)"
      >
        <div class="yt-scene-item__thumb">
          <img v-if="item.thumb" :src="item.thumb" :alt="item.name" loading="lazy" />
          <span v-else class="yt-scene-item__badge">{{ item.index + 1 }}</span>
        </div>
        <div class="yt-scene-item__body">
          <p class="yt-scene-item__name">{{ item.name }}</p>
          <p class="yt-scene-item__meta">Cảnh {{ item.index + 1 }}</p>
          <span v-if="item.active" class="yt-scene-item__now">Đang xem</span>
        </div>
      </button>
    </div>
  </aside>
</template>
