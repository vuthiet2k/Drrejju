<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import Vr360ViewerLayout from '@/vr360-viewer/layout/Vr360ViewerLayout.vue';
import { ViewerCoreFacade } from '@/vr360-viewer/index.js';
import Vr360ViewerYtLayout from './layout/Vr360ViewerYtLayout.vue';

// Public component. Caller passes `tour` and `options` exactly like the
// original Vr360ViewerLayout. Internally we mount the core viewer with the
// default HUD disabled, wrap it in a facade, and pass that facade to the
// Youtube-style shell which teleports its overlays into `.tour-viewer-page`.
const props = defineProps({
  tour: { type: Object, default: null },
  options: { type: Object, default: () => ({}) },
});
defineEmits([
  'ready', 'scene-change', 'hotspot-click',
  'load-progress', 'load-complete', 'error', 'back',
]);

const coreRef = ref(null);
const facade = shallowRef(null);

const coreOptions = computed(() => ({
  ...props.options,
  hideDefaultHud: true, // Core builtin ViewerPill/Sidebar/TopBar hidden — YT UI replaces them.
}));

const tourTitle = computed(() => props.tour?.title || props.tour?.metadata?.title || '');

watch(
  coreRef,
  (core) => {
    if (!core) {
      facade.value?.clearReferences();
      facade.value = null;
      return;
    }
    const f = new ViewerCoreFacade(core);
    f.connect();
    facade.value = f;
  },
  { flush: 'post' },
);

onBeforeUnmount(() => {
  facade.value?.clearReferences();
  facade.value = null;
});
</script>

<template>
  <div class="vr360-yt-wrapper">
    <Vr360ViewerLayout
      ref="coreRef"
      :tour="tour"
      :options="coreOptions"
      @ready="$emit('ready', $event)"
      @scene-change="$emit('scene-change', $event)"
      @hotspot-click="$emit('hotspot-click', $event)"
      @load-progress="$emit('load-progress', $event)"
      @load-complete="$emit('load-complete', $event)"
      @error="$emit('error', $event)"
      @back="$emit('back')"
    />
    <Vr360ViewerYtLayout
      v-if="facade"
      :facade="facade"
      :host-ref="coreRef"
      :tour-title="tourTitle"
    />
  </div>
</template>

<style scoped>
.vr360-yt-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
