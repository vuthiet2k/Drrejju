<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import PanoramaViewer from './PanoramaViewer.vue';
import { normalizeTour, runtimeHotspotForViewer } from '../common/mapper/normalizeTour.js';
import { dispatchPointInteraction } from '../common/registry/pointPluginRegistry.js';

const props = defineProps({
  tour: { type: Object, default: null },
  options: { type: Object, default: () => ({}) },
});
const emit = defineEmits([
  'ready',
  'scene-change',
  'hotspot-click',
  'load-progress',
  'load-complete',
  'error',
  'view-change',
]);

const panorama = ref(null);
const runtimeTour = ref(normalizeTour({}, props.options));

function transitionDuration(transition = {}) {
  if (transition.enabled === false || transition.effect === 'none') return 0;
  return Math.min(1200, Math.max(800, Number(transition.duration) || 1000));
}
const activeSceneId = ref('');
const isTransitioning = ref(false);
const hasEmittedReady = ref(false);
let navigationGeneration = 0;

const scenes = computed(() => runtimeTour.value.scenes);
const activeScene = computed(
  () => scenes.value.find((scene) => scene.id === activeSceneId.value) || null,
);
const activeSceneIndex = computed(() =>
  scenes.value.findIndex((scene) => scene.id === activeSceneId.value),
);
const activeSceneImageUrl = computed(() => activeScene.value?.imageSources?.[0] || '');
const activeSceneFallbackImageUrls = computed(
  () => activeScene.value?.imageSources?.slice(1) || [],
);
const displayHotspots = computed(() =>
  (activeScene.value?.hotspots || []).map((hotspot) =>
    runtimeHotspotForViewer(hotspot, scenes.value, activeScene.value),
  ),
);
const pointHotspotLogo = computed(() => runtimeTour.value.pointHotspotLogo);
const hasMultipleScenes = computed(() => scenes.value.length > 1);
const isFirstScene = computed(() => activeSceneIndex.value <= 0);
const isLastScene = computed(
  () => activeSceneIndex.value < 0 || activeSceneIndex.value >= scenes.value.length - 1,
);

function emitError(phase, cause) {
  emit('error', { phase, cause, message: cause?.message || String(cause || 'Viewer error.') });
}

function applyTour(payload) {
  emit('load-progress', { phase: 'normalize' });
  runtimeTour.value = normalizeTour(payload || {}, props.options);
  activeSceneId.value = runtimeTour.value.initialSceneId;
  if (!hasEmittedReady.value) {
    hasEmittedReady.value = true;
    emit('ready', { tour: runtimeTour.value });
  }
  emit('load-complete', { scope: 'tour', tour: runtimeTour.value });
}

async function goToScene(sceneId, options = {}) {
  const target = scenes.value.find((scene) => scene.id === sceneId);
  if (
    !target
    || isTransitioning.value
    || (target.id === activeSceneId.value && !options.force)
  ) return;
  const generation = ++navigationGeneration;
  const previousSceneId = activeSceneId.value;
  isTransitioning.value = true;
  try {
    emit('load-progress', { phase: 'scene', sceneId: target.id });
    await panorama.value?.preloadTexture?.(target.imageSources?.[0]);
    if (generation !== navigationGeneration) return;
    activeSceneId.value = target.id;
    await nextTick();
    await panorama.value?.animateToView?.(
      options.targetView || target.initialView,
      target.transition?.rotation === false ? 0 : transitionDuration(target.transition),
    );
    if (generation !== navigationGeneration) return;
    emit('scene-change', {
      previousSceneId,
      sceneId: target.id,
      source: options.source || 'api',
    });
    emit('load-complete', { scope: 'scene', scene: target });
  } catch (cause) {
    emitError('scene-change', cause);
  } finally {
    isTransitioning.value = false;
  }
}

function nextScene() {
  if (!hasMultipleScenes.value || isLastScene.value) return;
  goToScene(scenes.value[activeSceneIndex.value + 1].id, { source: 'next' });
}

function previousScene() {
  if (!hasMultipleScenes.value || isFirstScene.value) return;
  goToScene(scenes.value[activeSceneIndex.value - 1].id, { source: 'previous' });
}

function onHotspotClick(hotspot, event) {
  hotspot = hotspot?.hotspot || hotspot || {};
  hotspot = {
    ...hotspot,
    target_scene_id: String(hotspot.target_scene_id || hotspot.targetSceneId || hotspot.target || hotspot.scene_id || ''),
    target_view: hotspot.target_view || hotspot.targetView || hotspot.view,
  };
  // Preserve the public event contract: consumers receive the canonical
  // hotspot as the first argument, just like PanoramaViewer emits it.
  // Wrapping it here makes parent handlers read wrapper.target_scene_id and
  // silently skip navigation.
  emit('hotspot-click', hotspot, event);
  dispatchPointInteraction(hotspot, {
    navigate: (point) => {
      if (!point.target_scene_id) return;
      goToScene(point.target_scene_id, { targetView: point.target_view, source: 'hotspot' });
    },
  });
}

function getView() {
  return panorama.value?.getView?.() || { lon: 0, lat: 0, fov: 75 };
}

function setView(view, options = {}) {
  return options.animate
    ? panorama.value?.animateToView?.(view, options.duration)
    : panorama.value?.setView?.(view);
}

function resetView() {
  return panorama.value?.animateToView?.(activeScene.value?.initialView || {}, 180);
}

function dispose() {
  navigationGeneration += 1;
  panorama.value?.dispose?.();
}

watch(
  () => props.tour,
  (payload) => {
    try {
      applyTour(payload);
    } catch (cause) {
      emitError('tour-load', cause);
    }
  },
  { immediate: true, deep: false },
);

onBeforeUnmount(dispose);

defineExpose({
  goToScene,
  nextScene,
  previousScene,
  getView,
  setView,
  resetView,
  dispose,
  runtimeTour,
  activeSceneId,
});
</script>

<template>
  <PanoramaViewer
    ref="panorama"
    class="vr360-viewer-canvas"
    :image-url="activeSceneImageUrl"
    :fallback-image-urls="activeSceneFallbackImageUrls"
    :hotspots="displayHotspots"
    :initial-view="activeScene?.initialView || { lon: 0, lat: 0, fov: 75 }"
    :transition="activeScene?.transition"
    :max-pixel-ratio="options.maxPixelRatio ?? 2"
    :point-hotspot-logo="pointHotspotLogo"
    :auto-rotate="options.autoRotate ?? false"
    :auto-rotate-delay="options.autoRotateDelay ?? 3000"
    :auto-rotate-speed="options.autoRotateSpeed ?? 3"
    hotspot-display-mode="viewer"
    @hotspot-click="onHotspotClick"
    @view-change="$emit('view-change', $event)"
  />
</template>

<style scoped>
.vr360-viewer-canvas {
  width: 100%;
  height: 100%;
}
</style>
