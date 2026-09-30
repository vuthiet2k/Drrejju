<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue';
import * as THREE from 'three';
import NavRenderer from './nav/NavRenderer.vue';
import { createCameraController } from '../common/runtime/cameraController.js';
import { createLandmarkRenderer } from '../common/runtime/landmarkRenderer.js';
import { createAreaMediaRenderer } from '../common/runtime/areaMediaRenderer.js';
import { projectViewerPoints } from '../common/runtime/pointProjection.js';
import { createProjectionPanoramaMaterial } from '../common/runtime/projectionPanoramaMaterial.js';
import { createProjectionState } from '../common/runtime/projectionState.js';
import { createTextureManager } from '../common/runtime/textureManager.js';
import { resolvePointPreview, resolvePointVisual } from '../common/registry/pointPluginRegistry.js';

const props = defineProps({
  imageUrl: {
    type: String,
    default: '',
  },
  fallbackImageUrls: {
    type: Array,
    default: () => [],
  },
  hotspots: {
    type: Array,
    default: () => [],
  },
  selectedHotspotId: {
    type: String,
    default: '',
  },
  activeAudioPoiId: {
    type: String,
    default: '',
  },
  initialView: {
    type: Object,
    default: () => ({ lon: 0, lat: 0, fov: 75 }),
  },
  hotspotDisplayMode: {
    type: String,
    default: 'builder',
  },
  pointHotspotLogo: {
    type: String,
    default: '',
  },
  autoRotate: {
    type: Boolean,
    default: false,
  },
  autoRotateDelay: {
    type: Number,
    default: 2500,
  },
  autoRotateSpeed: {
    type: Number,
    default: 2.5,
  },
  transition: {
    type: Object,
    default: () => ({ enabled: true, effect: 'fade', duration: 650, rotation: true }),
  },
  maxPixelRatio: {
    type: Number,
    default: 2,
  },
  interactive: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['panorama-click', 'hotspot-click', 'hotspot-dblclick', 'view-change', 'texture-ready']);

const container = ref(null);
const projectedHotspots = ref([]);
const projectedInfoAreas = ref([]);
const isTextureLoading = ref(false);
const textureError = ref('');
const projectionBlend = ref(0);
const hasImage = computed(() => Boolean(props.imageUrl));
const hotspotsVisible = computed(() => projectionBlend.value >= 0.92);
const EMPTY_HOTSPOTS = Object.freeze([]);
const drawingBufferSize = new THREE.Vector2();

let renderer;
let scene;
let camera;
let mesh;
let animationId;
let resizeObserver;
let raycaster;
let pointer;
let isDragging = false;
let isPointerOver = false;
let pointerDown = null;
const activePointers = new Map();
const TAP_MOVEMENT_THRESHOLD = 7;
let gestureMode = 'idle';
let pinchDistance = 0;
let gestureHadMultiplePointers = false;
let lastInteractionAt = 0;
let lastFrameAt = 0;
let needsProjection = true;
let hasAppliedInitialView = false;
let textureReadyPending = false;
let areaLandmarkRenderer;
let areaMediaRenderer;
let cameraController;
let textureManager;
let projectionState;
let projectionRenderCount = 0;
let componentUpdateCount = 0;
let introRotationClock = 0;
let dragVelocityX = 0;
let dragVelocityY = 0;
let lastMoveAt = 0;

function emitViewChange() {
  emit('view-change', cameraController?.getRoundedView() || { lon: 0, lat: 0, fov: 75 });
}

function markInteraction() {
  lastInteractionAt = performance.now();
  needsProjection = true;
}

function youtubeEmbedUrl(url) {
  if (!url) return '';
  const value = String(url).trim();
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?&]+)/i,
    /youtube\.com\/embed\/([^?&/]+)/i,
    /youtube\.com\/shorts\/([^?&/]+)/i,
  ];
  const match = patterns.map((pattern) => value.match(pattern)).find(Boolean);
    if (!match?.[1]) return '';
    const params = new URLSearchParams({
      controls: '0',
      disablekb: '1',
      fs: '0',
      modestbranding: '1',
      playsinline: '1',
      rel: '0',
    });
    return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
  }

function updateProjectedHotspots() {
  if (!container.value || !camera || isTextureLoading.value || !hotspotsVisible.value) {
    projectedHotspots.value = [];
    projectedInfoAreas.value = [];
    if (container.value && camera) {
      areaLandmarkRenderer?.update(
        EMPTY_HOTSPOTS,
        camera,
        container.value.clientWidth || 1,
        container.value.clientHeight || 1,
      );
      areaMediaRenderer?.update(EMPTY_HOTSPOTS);
    }
    return;
  }

  const width = container.value.clientWidth || 1;
  const height = container.value.clientHeight || 1;
  projectionRenderCount += 1;
  if (import.meta.env?.DEV) console.debug('[Viewer Render] pointProjection()', projectionRenderCount);
  const projection = projectViewerPoints(props.hotspots, camera, width, height, youtubeEmbedUrl);
  projectedHotspots.value = projection.markers;
  if (import.meta.env?.DEV) {
    const audioMarkers = projection.markers.filter((hotspot) => hotspot.type === 'audio');
    if (audioMarkers.length) console.debug('[Audio Renderer] render()', audioMarkers.map((hotspot) => hotspot.id));
  }
  projectedInfoAreas.value = projection.infoAreas;
  areaLandmarkRenderer?.update(props.hotspots, camera, width, height);
  areaMediaRenderer?.update(props.hotspots);
}

function renderLoop() {
  const now = performance.now();
  const deltaSeconds = lastFrameAt ? (now - lastFrameAt) / 1000 : 0;
  lastFrameAt = now;
  if (!props.interactive && hasImage.value) {
    introRotationClock += deltaSeconds * 0.16;
    projectionState?.setIntroRotation?.(
      (projectionState?.state.introRotation ?? -Math.PI / 2) + deltaSeconds * 0.16,
    );
    mesh?.material.setProjectionState?.(projectionState?.state);
    needsProjection = true;
  }
  if (cameraController.tick(now)) {
    needsProjection = true;
    if (cameraController.isInertiaActive()) lastInteractionAt = now;
  }
  if (
    props.autoRotate &&
    hasImage.value &&
    !isDragging &&
    !isPointerOver &&
    !cameraController.isAnimating() &&
    !cameraController.isInertiaActive() &&
    now - lastInteractionAt >= props.autoRotateDelay
  ) {
    cameraController.dragBy(-props.autoRotateSpeed * deltaSeconds / 0.12, 0);
    needsProjection = true;
  }
  cameraController.updateCamera();
  if (needsProjection) {
    updateProjectedHotspots();
    needsProjection = false;
  }
  textureManager?.updateTransition();
  renderer.render(scene, camera);
  if (textureReadyPending) {
    textureReadyPending = false;
    emit('texture-ready');
  }
  animationId = requestAnimationFrame(renderLoop);
}

function animateToView(targetView = {}, duration = 520) {
  markInteraction();
  cameraController.stopInertia();
  return cameraController.animateTo(targetView, duration);
}

function getView() {
  return cameraController.getView();
}

function setView(targetView = {}) {
  markInteraction();
  cameraController.setView(targetView);
  emitViewChange();
  needsProjection = true;
}

function setIntroState(state = {}) {
  if (Number.isFinite(Number(state.fov))) {
    cameraController.setView({
      fov: Number(state.fov),
      lon: state.lon,
      lat: state.lat,
    });
  }
  if (Number.isFinite(Number(state.progress))) {
    projectionState?.setProgress(state.progress);
    if (Number.isFinite(Number(state.rotation))) {
      projectionState?.setRotation(state.rotation);
    }
    projectionBlend.value = projectionState?.state.projectionBlend ?? 1;
    mesh?.material.setProjectionState?.(projectionState?.state);
    needsProjection = true;
  }
}

function prepareIntroCamera(view = {}) {
  cameraController?.setView({ lon: view.lon, lat: view.lat, fov: view.fov });
  cameraController?.setIntroDistance(view.distance);
  needsProjection = true;
}

function setIntroCameraState(state = {}) {
  cameraController?.setView({ lon: state.lon, lat: state.lat, fov: state.fov });
  cameraController?.setIntroDistance(state.distance);
  setIntroState({ progress: state.progress });
  if (Number.isFinite(Number(state.rotation))) {
    projectionState?.setIntroRotation?.(Number(state.rotation) + introRotationClock);
    mesh?.material.setProjectionState?.(projectionState?.state);
  }
}

function completeIntroCamera() {
  cameraController?.setIntroDistance(0);
  needsProjection = true;
}

function resetProjectionIntro() {
  introRotationClock = 0;
  cameraController?.setIntroDistance(0);
  projectionState?.reset();
  projectionBlend.value = projectionState?.state.projectionBlend ?? 0;
  mesh?.material.setProjectionState?.(projectionState?.state);
  projectedHotspots.value = [];
  projectedInfoAreas.value = [];
  needsProjection = true;
}

function dispose() {
  window.removeEventListener('resize', resize);
  resizeObserver?.disconnect();
  cancelAnimationFrame(animationId);
  cameraController?.cancelTween?.();
  cameraController?.stopInertia?.();
  textureManager?.dispose();
  textureManager = null;
  projectionState = null;
  areaLandmarkRenderer?.dispose();
  areaLandmarkRenderer = null;
  areaMediaRenderer?.dispose();
  areaMediaRenderer = null;
  if (mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh = null;
  }
  renderer?.dispose();
  renderer = null;
  resetPointerGesture();
}

function resize() {
  if (!container.value || !renderer || !camera) return;
  const width = container.value.clientWidth || 1;
  const height = container.value.clientHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.getDrawingBufferSize(drawingBufferSize);
  mesh?.material.setProjectionResolution?.(drawingBufferSize.x, drawingBufferSize.y);
  needsProjection = true;
}

function textureCandidates() {
  return [props.imageUrl, ...props.fallbackImageUrls]
    .filter(Boolean)
    .filter((url, index, items) => items.indexOf(url) === index);
}

function loadTexture() {
  if (!mesh) return;
  cameraController?.stopInertia?.();
  isTextureLoading.value = true;
  projectedHotspots.value = [];
  projectedInfoAreas.value = [];
  textureError.value = '';
  textureManager.load(textureCandidates());
}

function preloadTexture(url) {
  return textureManager?.preload(url) || Promise.resolve(null);
}

function initThree() {
  if (!container.value) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 1, 1, 1100);
  cameraController = createCameraController(camera);
  if (!hasAppliedInitialView) {
    cameraController.setInitialView(props.initialView);
    hasAppliedInitialView = true;
  }
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const geometry = new THREE.SphereGeometry(500, 128, 64);
  geometry.scale(-1, 1, 1);
  projectionState = createProjectionState();
  const material = createProjectionPanoramaMaterial();
  material.setProjectionState(projectionState.state);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setClearColor(0x111827, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, props.maxPixelRatio));
  renderer.domElement.className = 'panorama-canvas';
  container.value.appendChild(renderer.domElement);
  textureManager = createTextureManager({
    scene,
    mesh,
    renderer,
    getTransition: () => props.transition,
    hasPrimaryImage: () => Boolean(props.imageUrl),
    onLoadingChange: (value) => { isTextureLoading.value = value; },
    onError: (value) => { textureError.value = value; },
    onApplied: () => {
      needsProjection = true;
      resize();
      textureReadyPending = true;
    },
  });
  areaLandmarkRenderer = createLandmarkRenderer(
    container.value,
    (hotspot, event) => emit('hotspot-click', hotspot, event),
  );
  areaMediaRenderer = createAreaMediaRenderer(scene);
  resize();
  loadTexture();
  markInteraction();
  renderLoop();
}

function onPointerEnter() {
  if (!props.interactive) return;
  isPointerOver = true;
  markInteraction();
}

function onPointerLeave(event) {
  isPointerOver = false;
}

function isViewerControlTarget(target) {
  return target instanceof Element && Boolean(target.closest(
    '.panorama-hotspot, .panorama-info-area, .area-landmark, .area-landmark-label, .landmark-presentation, .landmark-label',
  ));
}

function pointerDistance() {
  const [first, second] = [...activePointers.values()];
  return first && second ? Math.hypot(second.x - first.x, second.y - first.y) : 0;
}

function beginSinglePointerGesture(pointerState) {
  gestureMode = 'rotate';
  pointerDown = {
    id: pointerState.id,
    startX: pointerState.x,
    startY: pointerState.y,
    moved: false,
  };
}

function beginPinchGesture() {
  gestureMode = 'pinch';
  pointerDown = null;
  pinchDistance = pointerDistance();
  gestureHadMultiplePointers = true;
}

function resetPointerGesture() {
  activePointers.clear();
  isDragging = false;
  pointerDown = null;
  gestureMode = 'idle';
  pinchDistance = 0;
  gestureHadMultiplePointers = false;
}

function emitPanoramaClick(event) {
  const rect = container.value?.getBoundingClientRect();
  if (!rect || !raycaster || !pointer || !mesh) return;
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersection = raycaster.intersectObject(mesh, false)[0];
  const sphericalPoint = intersection ? cameraController.vectorToLonLat(intersection.point) : cameraController.getView();

  emit('panorama-click', {
    x: ((event.clientX - rect.left) / (container.value?.clientWidth || 1)) * 100,
    y: ((event.clientY - rect.top) / (container.value?.clientHeight || 1)) * 100,
    lon: sphericalPoint.lon,
    lat: sphericalPoint.lat,
  });
}

function onPointerDown(event) {
  if (
    !props.interactive
    || !hasImage.value
    || (event.pointerType === 'mouse' && event.button !== 0)
    || isViewerControlTarget(event.target)
  ) return;
  markInteraction();
  cameraController.cancelTween();
  cameraController.stopInertia();
  dragVelocityX = 0;
  dragVelocityY = 0;
  lastMoveAt = 0;
  isDragging = true;
  const pointerState = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    previousX: event.clientX,
    previousY: event.clientY,
  };
  activePointers.set(event.pointerId, pointerState);
  container.value?.setPointerCapture?.(event.pointerId);
  if (activePointers.size === 1) beginSinglePointerGesture(pointerState);
  else if (activePointers.size === 2) beginPinchGesture();
}

function onPointerMove(event) {
  const pointerState = activePointers.get(event.pointerId);
  if (!props.interactive || !isDragging || !pointerState) return;
  markInteraction();
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  if (activePointers.size === 1 && gestureMode === 'rotate' && pointerDown) {
    const deltaX = event.clientX - pointerState.previousX;
    const deltaY = event.clientY - pointerState.previousY;
    pointerDown.moved ||= Math.hypot(
      event.clientX - pointerDown.startX,
      event.clientY - pointerDown.startY,
    ) >= TAP_MOVEMENT_THRESHOLD;
    const now = performance.now();
    const dt = lastMoveAt ? (now - lastMoveAt) / 1000 : 0;
    lastMoveAt = now;
    if (dt > 0 && dt < 0.1) {
      const instantVx = deltaX / dt;
      const instantVy = deltaY / dt;
      dragVelocityX = dragVelocityX * 0.7 + instantVx * 0.3;
      dragVelocityY = dragVelocityY * 0.7 + instantVy * 0.3;
    }
    cameraController.dragBy(deltaX, deltaY);
  } else if (activePointers.size >= 2) {
    const currentDistance = pointerDistance();
    if (pinchDistance) cameraController.zoomBy(pinchDistance - currentDistance);
    pinchDistance = currentDistance;
  }
  pointerState.previousX = event.clientX;
  pointerState.previousY = event.clientY;
  emitViewChange();
}

function finishPointerGesture(event, { cancelled = false } = {}) {
  if (!activePointers.has(event.pointerId)) return;
  markInteraction();
  const finishedPointerDown = pointerDown;
  activePointers.delete(event.pointerId);
  container.value?.releasePointerCapture?.(event.pointerId);

  if (activePointers.size >= 2) {
    beginPinchGesture();
    return;
  }
  if (activePointers.size === 1) {
    beginSinglePointerGesture(activePointers.values().next().value);
    return;
  }

  isDragging = false;
  gestureMode = 'idle';
  pinchDistance = 0;
  pointerDown = null;
  if (!cancelled && !gestureHadMultiplePointers && finishedPointerDown && finishedPointerDown.moved) {
    const timeSinceLastMove = performance.now() - lastMoveAt;
    if (timeSinceLastMove < 80) {
      cameraController.startInertia(dragVelocityX, dragVelocityY);
    }
  }
  dragVelocityX = 0;
  dragVelocityY = 0;
  lastMoveAt = 0;
  if (!cancelled && !gestureHadMultiplePointers && finishedPointerDown && !finishedPointerDown.moved && hasImage.value) {
    emitPanoramaClick(event);
  }
  gestureHadMultiplePointers = false;
}

function onPointerUp(event) {
  finishPointerGesture(event);
}

function onPointerCancel(event) {
  finishPointerGesture(event, { cancelled: true });
}

function onLostPointerCapture(event) {
  if (event.pointerType === 'mouse') return;
  onPointerCancel(event);
}

function onHotspotClick(hotspot, event) {
  if (!props.interactive) return;
  if (hotspot.type === 'audio' && import.meta.env?.DEV) console.debug('[Audio Renderer] click()', hotspot.id);
  markInteraction();
  emit('hotspot-click', hotspot, event);
}

function videoMarkerPoster(hotspot) {
  return hotspot.media?.previewUrl || hotspot.hover?.thumbnail || '';
}

function onWheel(event) {
  if (!props.interactive || !hasImage.value) return;
  markInteraction();
  cameraController.cancelTween();
  event.preventDefault();
  cameraController.zoomBy(event.deltaY);
  emitViewChange();
}

watch(
  () => [props.imageUrl, props.fallbackImageUrls],
  async () => {
    await nextTick();
    loadTexture();
  },
  { deep: false },
);

watch(
  () => props.hotspots,
  () => { needsProjection = true; },
  { deep: false },
);

watch(
  () => props.initialView,
  (value) => {
    if (hasAppliedInitialView || !cameraController) return;
    hasAppliedInitialView = true;
    cameraController.setInitialView(value);
    markInteraction();
    emitViewChange();
  },
  { deep: false, immediate: true },
);

onMounted(() => {
  initThree();
  window.addEventListener('resize', resize);
  if (container.value) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container.value);
  }
});

onBeforeUnmount(() => {
  dispose();
});

onUpdated(() => {
  componentUpdateCount += 1;
  if (import.meta.env?.DEV) console.debug('[Viewer Render] PanoramaViewer updated()', componentUpdateCount);
});

defineExpose({
  animateToView,
  getView,
  setView,
  setIntroState,
  prepareIntroCamera,
  setIntroCameraState,
  completeIntroCamera,
  resetProjectionIntro,
  preloadTexture,
  dispose,
});
</script>

<template>
  <div
    ref="container"
    class="panorama-viewer"
    :class="{ empty: !hasImage, 'is-interaction-locked': !interactive }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @wheel="onWheel"
    @click="markInteraction"
  >
    <span v-if="!hasImage" class="canvas-empty-text">
      Upload panorama JPG 360 de xem preview, keo chuot de xoay ngang/doc.
    </span>
    <span v-else-if="textureError" class="canvas-empty-text panorama-error-text">
      {{ textureError }}
    </span>
    <svg v-if="projectedInfoAreas.length" class="panorama-info-area-layer" aria-hidden="true">
      <template v-for="area in projectedInfoAreas" :key="area.id">
        <polyline
          v-if="area.isDraft"
          class="panorama-info-area draft"
          :points="area.polygonPoints"
        />
        <polygon
          v-else
          class="panorama-info-area"
          :points="area.polygonPoints"
          @click.stop="interactive && (markInteraction(), emit('hotspot-click', area, $event))"
        />
      </template>
    </svg>
    <button
      v-for="hotspot in projectedHotspots"
      :key="hotspot.renderKey || hotspot.id"
      class="panorama-hotspot"
      :class="[
        hotspotDisplayMode === 'viewer' ? `viewer-hotspot viewer-hotspot-${hotspot.type || 'point'}` : 'hotspot-dot',
        { active: hotspot.id === selectedHotspotId, playing: hotspot.type === 'audio' && hotspot.id === activeAudioPoiId },
      ]"
      :style="{ left: `${hotspot.screenX}px`, top: `${hotspot.screenY}px` }"
      type="button"
      @click.stop="onHotspotClick(hotspot, $event)"
      @dblclick.stop="interactive && (markInteraction(), emit('hotspot-dblclick', hotspot, $event))"
    >
        <template v-if="hotspotDisplayMode === 'viewer' && resolvePointVisual(hotspot).nav">
        <NavRenderer :hotspot="hotspot" />
      </template>
      <template v-else>
        <span v-if="hotspotDisplayMode === 'viewer' && resolvePointVisual(hotspot).video" class="viewer-video-poi-marker" :class="{ 'has-poster': videoMarkerPoster(hotspot) }">
          <span v-if="videoMarkerPoster(hotspot)" class="viewer-video-poi-poster" :style="{ backgroundImage: `url(${videoMarkerPoster(hotspot)})` }"></span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 10 5-3v10l-5-3z"/><path class="viewer-video-poi-play" d="m9 9 4 3-4 3z"/></svg>
        </span>
        <span v-if="hotspotDisplayMode === 'viewer' && resolvePointVisual(hotspot).audio" class="viewer-audio-poi-icon" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M6 9v6M10 6v12M14 3v18M18 8v8" /></svg></span>
        <span
          v-else-if="hotspotDisplayMode === 'viewer' && !resolvePointVisual(hotspot).video && pointHotspotLogo && !resolvePointVisual(hotspot).info && !resolvePointVisual(hotspot).audio && !resolvePointVisual(hotspot).nav"
          class="viewer-point-logo"
          :style="{ backgroundImage: `url(${pointHotspotLogo})` }"
        ></span>
        <span v-else-if="hotspotDisplayMode === 'viewer' && !resolvePointVisual(hotspot).video && resolvePointVisual(hotspot).info" class="viewer-info-dot">i</span>
        <span v-else-if="!resolvePointVisual(hotspot).video && !resolvePointVisual(hotspot).audio && !resolvePointVisual(hotspot).nav" class="viewer-point-dot">{{ hotspot.index + 1 }}</span>
        <span v-if="!resolvePointVisual(hotspot).video" class="hotspot-label">{{ hotspot.label || 'Hotspot' }}</span>
        <template v-if="hotspotDisplayMode === 'viewer' && !resolvePointVisual(hotspot).video">
          <span v-if="resolvePointPreview(hotspot).kind === 'tooltip' && (resolvePointPreview(hotspot).title || resolvePointPreview(hotspot).description)" class="viewer-hotspot-tooltip">
            <strong v-if="resolvePointPreview(hotspot).title" class="viewer-hotspot-tooltip-title">{{ resolvePointPreview(hotspot).title }}</strong>
            <span v-if="resolvePointPreview(hotspot).description" class="viewer-hotspot-tooltip-description">{{ resolvePointPreview(hotspot).description }}</span>
          </span>
          <span v-else-if="resolvePointPreview(hotspot).kind === 'image' && resolvePointPreview(hotspot).imageUrl" class="viewer-hotspot-image-preview" :style="{ backgroundImage: `url(${resolvePointPreview(hotspot).imageUrl})` }"></span>
        </template>
      </template>
    </button>
  </div>
</template>
