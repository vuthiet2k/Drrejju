<script setup>
defineProps({
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  tooltipPlacement: { type: String, default: 'top' },
});
defineEmits(['activate']);
</script>

<template>
  <button
    type="button"
    class="yt-btn"
    :aria-label="label"
    :data-active="active ? 'true' : 'false'"
    :disabled="disabled"
    @click="!disabled && $emit('activate')"
  >
    <slot />
    <span class="yt-btn__tooltip" role="tooltip">{{ label }}</span>
  </button>
</template>
