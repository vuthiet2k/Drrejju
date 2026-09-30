<script setup>
import { ref } from 'vue';

defineProps({
  thumbnail: { type: String, default: '' },
  sceneName: { type: String, default: '' },
});

const isExpanded = ref(false);
</script>

<template>
  <span
    class="nav-preview-expand-marker"
    :class="{ 'is-expanded': isExpanded }"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
    @focusin="isExpanded = true"
    @focusout="isExpanded = false"
  >
    <span v-if="isExpanded && sceneName" class="nav-preview-expand-name">{{ sceneName }}</span>
    <span class="nav-preview-expand-media">
      <img
        v-if="isExpanded && thumbnail"
        :src="thumbnail"
        alt=""
        draggable="false"
      />
    </span>
  </span>
</template>
