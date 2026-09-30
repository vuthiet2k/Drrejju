<script setup>
import { computed } from 'vue';

const props = defineProps({
  tourTitle: { type: String, default: '' },
  sceneTitle: { type: String, default: '' },
  sceneIndex: { type: Number, default: -1 },
  sceneCount: { type: Number, default: 0 },
  brand: { type: String, default: '' },
  breadcrumb: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
});

const emit = defineEmits(['back']);

const progressLabel = computed(() => {
  if (props.sceneIndex < 0 || props.sceneCount <= 1) return '';
  return `${props.sceneIndex + 1} of ${props.sceneCount}`;
});

const visibleBreadcrumb = computed(() => props.breadcrumb.filter(Boolean).slice(-4));
const displayTitle = computed(() => props.tourTitle || props.brand);
</script>

<template>
  <header class="viewer-topbar" :class="{ 'is-loading': loading, 'has-error': error }">
    <div class="viewer-topbar-left">
      <button class="viewer-icon-button" type="button" aria-label="Go back" title="Back" @click="emit('back')">←</button>
      <div class="viewer-topbar-identity">
        <strong v-if="displayTitle" class="viewer-tour-title" :title="displayTitle">{{ displayTitle }}</strong>
        <nav v-if="visibleBreadcrumb.length" class="viewer-breadcrumb" aria-label="Tour breadcrumb">
          <span v-for="(item, index) in visibleBreadcrumb" :key="`${item}-${index}`" :title="item">{{ item }}</span>
        </nav>
      </div>
    </div>

    <div class="viewer-topbar-scene" :title="sceneTitle" aria-live="polite">
      <strong>{{ sceneTitle || 'Scene' }}</strong>
      <small v-if="progressLabel">{{ progressLabel }}</small>
    </div>
    <div class="viewer-topbar-right"><slot /></div>
  </header>
</template>
