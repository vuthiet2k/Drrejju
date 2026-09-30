<script setup>
defineProps({
  expanded: { type: Boolean, default: false },
});

defineEmits(['toggle']);
</script>

<template>
  <div
    class="sidebar-toggle-tab"
    :class="{ 'is-expanded': expanded }"
  >
    <button
      type="button"
      class="sidebar-toggle-button"
      :aria-expanded="expanded"
      :aria-label="expanded ? 'Ẩn danh sách cảnh' : 'Hiện danh sách cảnh'"
      :title="expanded ? 'Ẩn danh sách' : 'Hiện danh sách'"
      @click="$emit('toggle')"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          v-if="!expanded"
          d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"
        />
        <path
          v-else
          d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.sidebar-toggle-tab {
  position: absolute;
  top: 345px;
  left: 255px;
  width: 32px;
  height: 32px;
  transform: translateX(-245px);
  transition: transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1);
  pointer-events: auto;
  z-index: 3;
}

.sidebar-toggle-tab.is-expanded {
  transform: translateX(0);
}

.sidebar-toggle-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 0;
  padding: 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
  transition: color 160ms ease, background 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}

.sidebar-toggle-button:hover,
.sidebar-toggle-button:focus-visible {
  color: #D5001C;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 16px rgba(213, 0, 28, 0.16);
  outline: 0;
}

.sidebar-toggle-button:active {
  transform: scale(0.94);
}

.sidebar-toggle-button svg {
  width: 16px;
  height: 16px;
  transition: transform 200ms ease;
}
</style>
