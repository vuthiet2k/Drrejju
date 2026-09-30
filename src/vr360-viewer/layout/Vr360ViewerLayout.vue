<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
} from "vue";

import PanoramaViewer from "../components/PanoramaViewer.vue";
import IntroOverlay from "../components/IntroOverlay.vue";
import ScenesSidebar from "../components/ScenesSidebar.vue";
import ViewerPill from "../components/ViewerPill.vue";
import ViewerTopBar from "../components/ViewerTopBar.vue";
import AudioManager from "../common/audio/AudioManager.js";
import { AUDIO_SCOPE } from "../common/audio/constants.js";
import { createAudioStore } from "../common/audio/AudioStore.js";
import { createAudioService } from "../common/audio/audioService.js";
import { createPoiAudioController } from "../common/controllers/PoiAudioController.js";
import { createTourAudioController } from "../common/controllers/TourAudioController.js";
import { createFullscreenController } from "../common/controllers/fullscreen.js";
import { createViewerIntroController, INTRO_PHASE } from "../common/controllers/ViewerIntroController.js";
import { createIntroCameraAdapter } from "../common/intro/IntroCameraAdapter.js";
import { createViewModeManager, VIEW_MODE } from "../common/controllers/viewModeManager.js";
import { mobileInitialFovForAspect } from "../common/runtime/mobileFovPolicy.js";
import {
  normalizeTour,
  runtimeHotspotForViewer,
} from "../common/mapper/normalizeTour.js";
import { youtubeEmbedUrl } from "../common/utils/media.js";
import { dispatchPointInteraction } from '../common/registry/pointPluginRegistry.js';
import { createPreloadScheduler } from '../services/preloadScheduler.js';
import InfoPoiPopup from '../components/popups/InfoPoiPopup.vue';
import ImageViewerPopup from '../components/popups/ImageViewerPopup.vue';
import VideoPoiPopup from '../components/popups/VideoPoiPopup.vue';
import "../assets/viewer.css";
import "../assets/intro.css";

const props = defineProps({
  tour: { type: Object, default: null },
  options: { type: Object, default: () => ({}) },
});
const emit = defineEmits([
  "ready",
  "scene-change",
  "hotspot-click",
  "load-progress",
  "load-complete",
  "error",
  "back",
  "audio:loaded",
  "audio:play",
  "audio:pause",
  "audio:stop",
  "audio:ended",
  "audio:error",
]);

const root = ref(null);
const panorama = ref(null);
const runtimeTour = ref(normalizeTour({}, props.options));

function transitionDuration(transition = {}) {
  if (transition.enabled === false || transition.effect === 'none') return 0;
  return Math.min(1200, Math.max(800, Number(transition.duration) || 1000));
}
const activeSceneId = ref("");
const preloadScheduler = ref(null);
const activeBottomPanel = ref(null);
const visitedSceneIds = ref(new Set());
const poiHidden = ref(false);
const activePointPopup = ref(null);
const isTransitioning = ref(false);
const errorMessage = ref("");
const viewState = ref({ lon: 0, lat: 0, fov: 75 });
const autoRotate = ref(props.options.autoRotate ?? true);
const hasEmittedReady = ref(false);
const isFullscreen = ref(false);
const introPhase = ref(INTRO_PHASE.WAITING_TO_START);
const introPlayed = ref(false);
const hasCompletedInitialIntro = ref(false);
const autoTourActive = ref(false);
const autoTourIndex = ref(0);
let autoTourTimer = null;
let autoTourIdleTimer = null;
let autoTourRemainingMs = 0;
let autoTourTimerStartedAt = 0;

let hasStartedTourAudioForIntro = false;
let navigationGeneration = 0;
let stopFullscreenSync = () => {};
let stopAudioFacadeSync = () => {};
const coreEventListeners = new Set();
const defaultHudHidden = computed(() => props.options?.hideDefaultHud === true);

function publishCoreEvent(type, payload) {
  coreEventListeners.forEach((listener) => listener(type, payload));
}

function subscribeCoreEvents(listener) {
  if (typeof listener !== 'function') return () => {};
  coreEventListeners.add(listener);
  return () => coreEventListeners.delete(listener);
}

function handleAudioEvent(event) {
  emit(event.type, event);
  publishCoreEvent(event.type, event);
  if (import.meta.env?.DEV) console.debug('[Audio Viewer]', event.type, event.scope || '', event.source || '');
}

const audioManager = new AudioManager({ onEvent: handleAudioEvent });
const audioStore = createAudioStore(audioManager);
const audioService = createAudioService(audioManager, audioStore);
stopAudioFacadeSync = audioManager.subscribe((event) => {
  if (event.type === 'audio:state') publishCoreEvent(event.type, event.session);
});
const poiAudioController = createPoiAudioController({ manager: audioManager });
const tourAudioController = createTourAudioController({ manager: audioManager });

const fullscreen = createFullscreenController(() => root.value);
const intro = createViewerIntroController(props.options.introAnimation);
const introCamera = createIntroCameraAdapter(() => panorama.value);
const viewModeManager = createViewModeManager();
const activeViewMode = ref(VIEW_MODE.NORMAL);
const isViewModeSheetOpen = computed(() => activeBottomPanel.value === 'view');
const isMobileViewport = ref(false);
const viewportSize = ref({ width: 1, height: 1 });
let mobileViewportQuery;

const scenes = computed(() => runtimeTour.value.scenes);
const hasMultipleScenes = computed(() => scenes.value.length > 1);
const activeScene = computed(
  () => scenes.value.find((scene) => scene.id === activeSceneId.value) || null,
);
const activeSceneIndex = computed(() =>
  scenes.value.findIndex((scene) => scene.id === activeSceneId.value),
);
const activeSceneImageUrl = computed(() => activeScene.value?.imageSources?.[0] || '');
const activeSceneFallbackImageUrls = computed(() => activeScene.value?.imageSources?.slice(1) || []);
const isFirstScene = computed(() => activeSceneIndex.value <= 0);
const isLastScene = computed(() => activeSceneIndex.value < 0 || activeSceneIndex.value >= scenes.value.length - 1);
const introInitialView = computed(() => intro.getInitialFrame(sceneViewForViewer()));
const viewerUIReady = computed(() => hasCompletedInitialIntro.value);
const displayHotspots = computed(() =>
  (activeScene.value?.hotspots || []).map((hotspot) =>
    runtimeHotspotForViewer(hotspot, scenes.value, activeScene.value),
  ),
);
const visibleHotspots = computed(() => (poiHidden.value ? [] : displayHotspots.value));
const autoTourPanoramas = computed(() =>
  scenes.value.filter(scene => scene.raw?.autoTour === 1)
);
const pointHotspotLogo = computed(() => runtimeTour.value.pointHotspotLogo);
const activeAudioPoiId = computed(() => (
  audioStore.state.activeSession.sourceType === 'poi'
  && audioStore.state.activeSession.status === 'playing'
    ? audioStore.state.activeSession.sourceId
    : ''
));
let layoutUpdateCount = 0;

function error(phase, cause) {
  errorMessage.value = cause?.message || String(cause || "Viewer error.");
  const payload = { phase, cause, message: errorMessage.value };
  emit("error", payload);
  publishCoreEvent("error", payload);
}

function setIntroPhase(phase) {
  if (introPhase.value === phase) return;
  introPhase.value = phase;
  publishCoreEvent('intro-phase-change', getIntroState());
}

function markSceneVisited(sceneId) {
  if (!sceneId || visitedSceneIds.value.has(sceneId)) return;
  visitedSceneIds.value = new Set(visitedSceneIds.value).add(sceneId);
}

function viewForViewer(view = {}) {
  const sceneView = view || {};
  if (!isMobileViewport.value) return sceneView;
  return {
    ...sceneView,
    fov: mobileInitialFovForAspect(
      sceneView.fov,
      viewportSize.value.width / viewportSize.value.height,
    ),
  };
}

function sceneViewForViewer(scene = activeScene.value) {
  return viewForViewer(scene?.initialView || {});
}

function selectViewModeState(mode) {
  const previousMode = viewModeManager.getCurrentMode();
  const nextMode = viewModeManager.select(mode);
  activeViewMode.value = nextMode;
  if (nextMode !== previousMode) publishCoreEvent('view-mode-change', { mode: nextMode });
  return nextMode;
}

function preloadTourAudio() {
  const tourAudio = runtimeTour.value.narration;
  return tourAudioController.preload(tourAudio, runtimeTour.value.title).catch(() => {});
}

async function playTourAudio() {
  if (hasStartedTourAudioForIntro || !hasCompletedInitialIntro.value) return;
  hasStartedTourAudioForIntro = true;
  const narration = runtimeTour.value.narration;
  if (!narration?.enabled || !narration.autoplay || !narration.url) return;
  await tourAudioController.play(narration, runtimeTour.value.title);
}

async function applyTour(payload) {
  stopAutoTour();
  audioManager.stop();
  const progressPayload = { phase: "normalize" };
  emit("load-progress", progressPayload);
  publishCoreEvent("load-progress", progressPayload);
  runtimeTour.value = normalizeTour(payload || {}, props.options);
  activeSceneId.value = runtimeTour.value.initialSceneId;
  viewModeManager.setNormalFov(sceneViewForViewer().fov);
  selectViewModeState(VIEW_MODE.NORMAL);
  if (!hasCompletedInitialIntro.value) {
    panorama.value?.resetProjectionIntro?.();
    introPlayed.value = false;
    setIntroPhase(INTRO_PHASE.WAITING_TO_START);
    hasStartedTourAudioForIntro = false;
  }
  visitedSceneIds.value = new Set();
  activePointPopup.value = null;
  await nextTick();
  if (!preloadScheduler.value && panorama.value?.preloadTexture) {
    preloadScheduler.value = createPreloadScheduler(
      (url) => panorama.value.preloadTexture(url),
      { concurrency: 2 },
    );
  }
  if (!hasCompletedInitialIntro.value) {
    introCamera.prepare(intro.getInitialFrame(sceneViewForViewer()));
  }
  preloadTourAudio();
  if (!hasEmittedReady.value) {
    hasEmittedReady.value = true;
    const payload = { tour: runtimeTour.value };
    emit("ready", payload);
    publishCoreEvent("ready", payload);
  }
  const completePayload = { scope: "tour", tour: runtimeTour.value };
  emit("load-complete", completePayload);
  publishCoreEvent("load-complete", completePayload);
  if (hasCompletedInitialIntro.value && autoTourPanoramas.value.length > 0) {
    startAutoTour();
  }
}

async function goToScene(sceneId, options = {}) {
  const target = scenes.value.find((scene) => scene.id === sceneId);
  if (
    !target ||
    isTransitioning.value ||
    (target.id === activeSceneId.value && !options.force)
  )
    return;
  const generation = ++navigationGeneration;
  const previousSceneId = activeSceneId.value;
  isTransitioning.value = true;
  activePointPopup.value = null;
  if (activeBottomPanel.value === 'view') activeBottomPanel.value = null;
  try {
    const progressPayload = { phase: "scene", sceneId: target.id };
    emit("load-progress", progressPayload);
    publishCoreEvent("load-progress", progressPayload);
    audioManager.stop(AUDIO_SCOPE.POI);
    await panorama.value?.preloadTexture?.(target.imageSources?.[0]);
    if (preloadScheduler.value && scenes.value.length) {
      preloadScheduler.value.schedule(scenes.value, target.id, 5);
    }
    if (generation !== navigationGeneration) return;
    markSceneVisited(previousSceneId);
    activeSceneId.value = target.id;
    const targetView = sceneViewForViewer(target);
    const navigationView = options.targetView
      ? viewForViewer(options.targetView)
      : targetView;
    viewModeManager.setNormalFov(targetView.fov);
    await nextTick();
    await panorama.value?.animateToView?.(
      {
        ...navigationView,
        fov: viewModeManager.getTargetFov(),
      },
      target.transition?.rotation === false ? 0 : transitionDuration(target.transition),
    );
    if (generation !== navigationGeneration) return;
    const sceneChangePayload = {
      previousSceneId,
      sceneId: target.id,
      source: options.source || "api",
    };
    emit("scene-change", sceneChangePayload);
    publishCoreEvent("scene-change", sceneChangePayload);
    const completePayload = { scope: "scene", scene: target };
    emit("load-complete", completePayload);
    publishCoreEvent("load-complete", completePayload);
  } catch (cause) {
    error("scene-change", cause);
  } finally {
    isTransitioning.value = false;
  }
}

function nextScene() {
  if (!hasMultipleScenes.value || isLastScene.value) return;
  goToScene(scenes.value[activeSceneIndex.value + 1].id, { source: "next" });
}

function previousScene() {
  if (!hasMultipleScenes.value || isFirstScene.value) return;
  goToScene(scenes.value[activeSceneIndex.value - 1].id, { source: "previous" });
}

function onHotspotClick(hotspot, event) {
  if (!viewerUIReady.value) return;
  if (autoTourActive.value) stopAutoTour();
  hotspot = hotspot?.hotspot || hotspot || {};
  hotspot = {
    ...hotspot,
    target_scene_id: String(hotspot.target_scene_id || hotspot.targetSceneId || hotspot.target || hotspot.scene_id || ''),
    target_view: hotspot.target_view || hotspot.targetView || hotspot.view,
  };
  const payload = { hotspot, event };
  emit("hotspot-click", hotspot, event);
  publishCoreEvent("hotspot-click", payload);
  dispatchPointInteraction(hotspot, {
    playAudio: (point) => {
      poiAudioController.play(point);
    },
    navigate: (point) => {
      if (!point.target_scene_id) return;
      goToScene(point.target_scene_id, { targetView: point.target_view, source: 'hotspot' });
    },
    openPopup: (kind, point) => { activePointPopup.value = { kind, point }; },
  });
}

function onInteraction() {
  if (!viewerUIReady.value) return;
  if (autoTourActive.value) pauseAutoTour();
}

function onOnboardingWheel(event) {
  if (!viewerUIReady.value) {
    event.preventDefault();
    return;
  }
  onInteraction();
}

function blockIntroKeyboard(event) {
  if (viewerUIReady.value) return;
  event.preventDefault();
  event.stopPropagation();
}

function startIntro() {
  if (hasCompletedInitialIntro.value || introPlayed.value || !activeScene.value) return;
  introPlayed.value = true;
  publishCoreEvent('intro-start', getIntroState());
  setIntroPhase(INTRO_PHASE.CAMERA_MOVE);
  intro.start({
    view: sceneViewForViewer(),
    onFrame: (frame) => introCamera.apply(frame),
    onPhase: setIntroPhase,
    onUnlock: () => {
      setIntroPhase(INTRO_PHASE.FINISHING);
    },
  });
}

function completeIntro() {
  if (introPhase.value !== INTRO_PHASE.FINISHING) return;
  intro.complete();
  introCamera.complete();
  // Intro final frame now converges to the exact saved Builder view (lon, lat, fov).
  // No setView() needed; the camera state is already at the canonical target.
  hasCompletedInitialIntro.value = true;
  setIntroPhase(INTRO_PHASE.INTERACTIVE);
  publishCoreEvent('intro-complete', getIntroState());
  void playTourAudio().catch((cause) => error("tour-audio-play", cause));
  if (autoTourPanoramas.value.length > 0) startAutoTour();
}

function onPanoramaTextureReady() {
  // Do not compete with the critical first texture load. Start the initial
  // background queue only after PanoramaViewer confirms that the active
  // scene texture is ready.
  if (preloadScheduler.value && scenes.value.length) {
    preloadScheduler.value.schedule(scenes.value, activeSceneId.value, 3);
  }
  if (hasCompletedInitialIntro.value || introPlayed.value) return;
  introCamera.prepare(intro.getInitialFrame(sceneViewForViewer()));
}

function stopAutoTour() {
  autoTourActive.value = false;
  if (autoTourTimer !== null) { clearTimeout(autoTourTimer); autoTourTimer = null; }
  if (autoTourIdleTimer !== null) { clearTimeout(autoTourIdleTimer); autoTourIdleTimer = null; }
  autoTourRemainingMs = 0;
}

function pauseAutoTour() {
  if (!autoTourActive.value) return;
  if (autoTourTimer !== null) {
    const elapsed = performance.now() - autoTourTimerStartedAt;
    autoTourRemainingMs = Math.max(0, autoTourRemainingMs - elapsed);
    clearTimeout(autoTourTimer);
    autoTourTimer = null;
  }
  if (autoTourIdleTimer !== null) { clearTimeout(autoTourIdleTimer); autoTourIdleTimer = null; }
  const idleDelay = props.options.autoRotateDelay ?? 3000;
  autoTourIdleTimer = setTimeout(() => {
    autoTourIdleTimer = null;
    resumeAutoTour();
  }, idleDelay);
}

function resumeAutoTour() {
  if (!autoTourActive.value) return;
  const list = autoTourPanoramas.value;
  if (!list.length) { stopAutoTour(); return; }
  if (isTransitioning.value) return;
  autoRotate.value = true;

  const indexScene = list[autoTourIndex.value];
  if (indexScene && indexScene.id === activeSceneId.value) {
    const remaining = autoTourRemainingMs > 1000 ? autoTourRemainingMs : 1000;
    scheduleAutoTourAdvance(remaining);
  } else {
    const viewerIndex = list.findIndex(s => s.id === activeSceneId.value);
    if (viewerIndex >= 0) {
      autoTourIndex.value = viewerIndex;
    }
    scheduleAutoTourAdvance();
  }
}

function onPointerActivity() {
  if (autoTourIdleTimer !== null) {
    clearTimeout(autoTourIdleTimer);
    const idleDelay = props.options.autoRotateDelay ?? 3000;
    autoTourIdleTimer = setTimeout(() => {
      autoTourIdleTimer = null;
      resumeAutoTour();
    }, idleDelay);
  }
}

function scheduleAutoTourAdvance(remainingMs) {
  if (!autoTourActive.value) return;
  if (autoTourTimer !== null) { clearTimeout(autoTourTimer); autoTourTimer = null; }
  const scene = autoTourPanoramas.value[autoTourIndex.value];
  if (!scene) return;
  const duration = remainingMs ?? (Number(scene.raw?.autoTourDuration) || 20) * 1000;
  autoTourRemainingMs = duration;
  autoTourTimerStartedAt = performance.now();
  autoTourTimer = setTimeout(() => {
    autoTourTimer = null;
    autoTourRemainingMs = 0;
    advanceAutoTour();
  }, duration);
}

async function advanceAutoTour() {
  if (!autoTourActive.value) return;
  const list = autoTourPanoramas.value;
  if (!list.length) { stopAutoTour(); return; }
  autoTourIndex.value = (autoTourIndex.value + 1) % list.length;
  const target = list[autoTourIndex.value];
  if (target.id !== activeSceneId.value) {
    await goToScene(target.id, { source: 'auto-tour' });
  }
  if (!autoTourActive.value) return;
  scheduleAutoTourAdvance();
}

function startAutoTour() {
  const list = autoTourPanoramas.value;
  if (!list.length) return;
  autoTourActive.value = true;
  autoRotate.value = true;
  const currentIndex = list.findIndex(s => s.id === activeSceneId.value);
  if (currentIndex >= 0) {
    autoTourIndex.value = currentIndex;
    scheduleAutoTourAdvance();
  } else {
    autoTourIndex.value = -1;
    advanceAutoTour();
  }
}

function toggleAutorotate(force) {
  autoRotate.value = typeof force === "boolean" ? force : !autoRotate.value;
  publishCoreEvent('autorotate-change', { enabled: autoRotate.value });
  return autoRotate.value;
}

function getAutorotateState() {
  return autoRotate.value;
}

function resetView() {
  return panorama.value?.animateToView?.(
    sceneViewForViewer(),
    180,
  );
}

function setViewMode(mode) {
  if (!Object.values(VIEW_MODE).includes(mode)) {
    throw new RangeError(`Unsupported view mode: ${String(mode)}`);
  }
  if (!viewerUIReady.value) return Promise.resolve();
  const currentView = panorama.value?.getView?.();
  if (!currentView) return Promise.resolve();
  const previousMode = viewModeManager.getCurrentMode();
  selectViewModeState(mode);
  if (mode === previousMode) publishCoreEvent('view-mode-change', { mode });
  return panorama.value?.animateToView?.({
    lon: currentView.lon,
    lat: currentView.lat,
    fov: viewModeManager.getTargetFov(),
  }, 400);
}

function openViewModeSheet() {
  if (!viewerUIReady.value) return;
  activeBottomPanel.value = 'view';
}

function closeViewModeSheet() {
  if (activeBottomPanel.value === 'view') activeBottomPanel.value = null;
}

function setPoiHidden(hidden) {
  const next = Boolean(hidden);
  if (poiHidden.value === next) return next;
  poiHidden.value = next;
  publishCoreEvent('poi-visibility-change', { hidden: next });
  return next;
}

function togglePoi(force) {
  return setPoiHidden(typeof force === 'boolean' ? force : !poiHidden.value);
}

function isPoiHidden() {
  return poiHidden.value === true;
}

function getPoiState() {
  return { hidden: poiHidden.value === true };
}

function selectViewMode(mode) {
  setViewMode(mode);
  closeViewModeSheet();
}

function getViewMode() {
  return viewModeManager.getCurrentMode();
}

function getAvailableViewModes() {
  return Object.values(VIEW_MODE);
}

function updateMobileViewport(event) {
  isMobileViewport.value = typeof event?.matches === 'boolean'
    ? event.matches
    : Boolean(mobileViewportQuery?.matches);
  viewportSize.value = {
    width: root.value?.clientWidth || window.innerWidth || 1,
    height: root.value?.clientHeight || window.innerHeight || 1,
  };
  if (!isMobileViewport.value) closeViewModeSheet();
}

let viewModeSheetTouchStartY = null;
function onViewModeSheetTouchStart(event) {
  viewModeSheetTouchStartY = event.touches[0]?.clientY ?? null;
}

function onViewModeSheetTouchEnd(event) {
  const endY = event.changedTouches[0]?.clientY;
  if (viewModeSheetTouchStartY !== null && Number.isFinite(endY) && endY - viewModeSheetTouchStartY > 72) closeViewModeSheet();
  viewModeSheetTouchStartY = null;
}
function getView() {
  return panorama.value?.getView?.() || viewState.value;
}
function setView(view, options = {}) {
  return options.animate
    ? panorama.value?.animateToView?.(view, options.duration)
    : panorama.value?.setView?.(view);
}
function onViewChange(view) {
  viewState.value = view;
  publishCoreEvent('view-change', view);
}
function enterFullscreen() {
  return fullscreen.enterFullscreen();
}
function exitFullscreen() {
  return fullscreen.exitFullscreen();
}
function toggleFullscreen() {
  return fullscreen.isFullscreen() ? exitFullscreen() : enterFullscreen();
}
function getScenes() {
  return scenes.value;
}
function getCurrentSceneId() {
  return activeSceneId.value;
}
function getAudioState() {
  return audioStore.state.activeSession;
}
function audioBlockedByIntro() {
  return { ok: false, feature: 'audio', reason: 'INTRO_NOT_INTERACTIVE' };
}
function playAudio() {
  if (!viewerUIReady.value) return audioBlockedByIntro();
  const session = audioStore.state.activeSession;
  if (session.status === 'playing') return { status: 'playing', source: session.url };
  if (session.url) return audioService.resume();
  const narration = runtimeTour.value.narration;
  if (!narration?.enabled || !narration.url) {
    return { ok: false, feature: 'audio.play', reason: 'NOT_AVAILABLE' };
  }
  return tourAudioController.play(narration, runtimeTour.value.title);
}
function pauseAudio() {
  return audioService.pause();
}
function resumeAudio() {
  return playAudio();
}
function toggleAudio() {
  if (!viewerUIReady.value) return audioBlockedByIntro();
  return audioStore.state.activeSession.url ? audioService.toggle() : playAudio();
}
function stopAudio() {
  return audioService.stop();
}
function seekAudio(time) {
  return audioService.seek(time);
}
function setAudioVolume(volume) {
  const result = audioService.setVolume(volume);
  publishCoreEvent('audio:volumechange', getAudioState());
  return result;
}
function setAudioMuted(muted) {
  const result = muted ? audioService.mute() : audioService.unmute();
  publishCoreEvent('audio:volumechange', getAudioState());
  return result;
}
function isFullscreenActive() {
  return fullscreen.isFullscreen();
}
function getIntroState() {
  return {
    phase: introPhase.value,
    completed: hasCompletedInitialIntro.value,
    interactive: viewerUIReady.value,
  };
}
function dispose() {
  stopAutoTour();
  navigationGeneration += 1;
  preloadScheduler.value?.dispose();
  intro.cancel();
  mobileViewportQuery?.removeEventListener?.('change', updateMobileViewport);
  window.removeEventListener('resize', updateMobileViewport);
  window.removeEventListener("keydown", blockIntroKeyboard, true);
  stopFullscreenSync();
  stopFullscreenSync = () => {};
  stopAudioFacadeSync();
  stopAudioFacadeSync = () => {};
  coreEventListeners.clear();
  audioManager.dispose();
  audioStore.dispose();
  panorama.value?.dispose?.();
}

watch(
  () => props.tour,
  (payload) => applyTour(payload).catch((cause) => error("tour-load", cause)),
  { immediate: true, deep: false },
);
onMounted(() => {
  window.addEventListener("keydown", blockIntroKeyboard, true);
  mobileViewportQuery = window.matchMedia('(max-width: 768px), (max-height: 520px) and (pointer: coarse)');
  updateMobileViewport(mobileViewportQuery);
  mobileViewportQuery.addEventListener?.('change', updateMobileViewport);
  window.addEventListener('resize', updateMobileViewport);
  stopFullscreenSync = fullscreen.subscribe((active) => {
    isFullscreen.value = active;
    publishCoreEvent('fullscreen-change', { active });
  });
});
onBeforeUnmount(dispose);
onUpdated(() => {
  layoutUpdateCount += 1;
  if (import.meta.env?.DEV) console.debug('[Viewer Render] ViewerLayout updated()', layoutUpdateCount);
});

defineExpose({
  goToScene,
  nextScene,
  previousScene,
  getView,
  setView,
  resetView,
  getViewMode,
  setViewMode,
  getAvailableViewModes,
  toggleAutorotate,
  getAutorotateState,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
  isFullscreen: isFullscreenActive,
  getScenes,
  getCurrentSceneId,
  getAudioState,
  playAudio,
  pauseAudio,
  resumeAudio,
  toggleAudio,
  stopAudio,
  seekAudio,
  setAudioVolume,
  setAudioMuted,
  getIntroState,
  startIntro,
  togglePoi,
  setPoiHidden,
  isPoiHidden,
  getPoiState,
  subscribeCoreEvents,
  dispose,
});
</script>

<template>
  <section
    ref="root"
    class="tour-viewer-page"
    @pointerdown="onInteraction"
    @pointermove="onPointerActivity"
    @wheel.capture="onOnboardingWheel"
    @contextmenu.capture="!viewerUIReady && $event.preventDefault()"
  >
    <div class="viewer-shell">
      <main class="viewer-stage">
        <PanoramaViewer
          ref="panorama"
          v-memo="[activeSceneId, activeSceneImageUrl, activeSceneFallbackImageUrls, visibleHotspots, activeAudioPoiId, introInitialView, activeScene?.transition, pointHotspotLogo, viewerUIReady, autoRotate]"
          class="tour-panorama"
          :image-url="activeSceneImageUrl"
          :fallback-image-urls="activeSceneFallbackImageUrls"
          :hotspots="visibleHotspots"
          :active-audio-poi-id="activeAudioPoiId"
          :initial-view="introInitialView"
          :transition="activeScene?.transition"
          :max-pixel-ratio="options.maxPixelRatio ?? 2"
          :point-hotspot-logo="pointHotspotLogo"
          :auto-rotate="viewerUIReady ? autoRotate : false"
          :auto-rotate-delay="options.autoRotateDelay ?? 3000"
          :auto-rotate-speed="options.autoRotateSpeed ?? 3"
          :interactive="viewerUIReady"
          hotspot-display-mode="viewer"
          @hotspot-click="onHotspotClick"
          @texture-ready="onPanoramaTextureReady"
          @view-change="onViewChange"
        />
      </main>

      <div class="viewer-overlay" aria-hidden="true"></div>
      <Transition name="viewer-intro-fade" @after-leave="completeIntro">
        <IntroOverlay
          v-if="introPhase !== INTRO_PHASE.INTERACTIVE && introPhase !== INTRO_PHASE.FINISHING"
          :title="runtimeTour.title"
          :brand="options.brand || ''"
          :starting="introPhase !== INTRO_PHASE.WAITING_TO_START"
          @start="startIntro"
        />
      </Transition>
      <div v-if="viewerUIReady" class="viewer-hud viewer-presentation-enter">
        <ViewerTopBar
          v-if="options.showTopbar === true && !defaultHudHidden"
          :tour-title="runtimeTour.title"
          :scene-title="activeScene?.name || ''"
          :scene-index="activeSceneIndex"
          :scene-count="scenes.length"
          :brand="options.brand || ''"
          :breadcrumb="
            options.breadcrumb || runtimeTour.metadata?.source?.breadcrumb || []
          "
          :loading="isTransitioning"
          :error="Boolean(errorMessage)"
          @back="$emit('back')"
          ><slot name="topbar"
        /></ViewerTopBar>
      </div>
      <ViewerPill
        v-if="viewerUIReady && !defaultHudHidden"
        :scene-name="activeScene?.name || ''"
        :scene-index="activeSceneIndex"
        :scene-count="scenes.length"
        :has-multiple-scenes="hasMultipleScenes"
        :is-first-scene="isFirstScene"
        :is-last-scene="isLastScene"
        :is-transitioning="isTransitioning"
        :audio-session="audioStore.state.activeSession"
        :audio-service="audioService"
        :audio-tour="{ ...runtimeTour.narration, title: runtimeTour.title }"
        :active-view-mode="activeViewMode"
        @home="resetView"
        @prev="previousScene"
        @next="nextScene"
        @view-mode-change="setViewMode"
      >
        <template #mobile-controls>
          <ScenesSidebar
            v-if="isMobileViewport"
            controls-only
            :auto-rotate="autoRotate"
            :is-fullscreen="isFullscreen"
            @toggle-autorotate="toggleAutorotate()"
            @toggle-fullscreen="toggleFullscreen()"
          />
        </template>
      </ViewerPill>
      <ScenesSidebar
        v-if="viewerUIReady && scenes.length && !isMobileViewport && !defaultHudHidden"
        :scenes="scenes"
        :active-scene-id="activeSceneId"
        :visited-scene-ids="visitedSceneIds"
        :auto-rotate="autoRotate"
        :is-fullscreen="isFullscreen"
        :poi-hidden="poiHidden"
        @select-scene="goToScene($event, { source: 'sidebar' })"
        @toggle-autorotate="toggleAutorotate()"
        @toggle-fullscreen="toggleFullscreen()"
        @toggle-poi="togglePoi"
      />
      <div class="viewer-modal-layer" :class="{ 'has-poi-popup': viewerUIReady && activePointPopup?.kind === 'info' }">
        <div
          v-if="viewerUIReady && isMobileViewport && isViewModeSheetOpen"
          class="viewer-view-mode-backdrop"
          @click.self="closeViewModeSheet"
        >
          <section
            class="viewer-view-mode-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-view-mode-title"
            @touchstart="onViewModeSheetTouchStart"
            @touchend="onViewModeSheetTouchEnd"
          >
            <div class="viewer-view-mode-sheet-handle" aria-hidden="true"></div>
            <h2 id="viewer-view-mode-title">View Mode</h2>
            <p>Choose the viewing experience that feels most comfortable.</p>
            <button class="viewer-view-mode-card" :class="{ active: activeViewMode === VIEW_MODE.NORMAL }" type="button" @click="selectViewMode(VIEW_MODE.NORMAL)">
              <span class="viewer-view-mode-icon" aria-hidden="true">◌</span><span><strong>Normal</strong><small>Balanced immersive panorama.</small></span><b v-if="activeViewMode === VIEW_MODE.NORMAL" aria-label="Selected">✓</b>
            </button>
            <button class="viewer-view-mode-card" :class="{ active: activeViewMode === VIEW_MODE.FIT_EYES }" type="button" @click="selectViewMode(VIEW_MODE.FIT_EYES)">
              <span class="viewer-view-mode-icon" aria-hidden="true">&#128065;</span><span><strong>Fit Eyes</strong><small>Natural perspective similar to human vision.</small></span><b v-if="activeViewMode === VIEW_MODE.FIT_EYES" aria-label="Selected">✓</b>
            </button>
            <button class="viewer-view-mode-card" :class="{ active: activeViewMode === VIEW_MODE.MEGA_VIEW }" type="button" @click="selectViewMode(VIEW_MODE.MEGA_VIEW)">
              <span class="viewer-view-mode-icon" aria-hidden="true">↗</span><span><strong>Mega View</strong><small>Wide cinematic viewing.</small></span><b v-if="activeViewMode === VIEW_MODE.MEGA_VIEW" aria-label="Selected">✓</b>
            </button>
          </section>
        </div>
        <InfoPoiPopup v-if="viewerUIReady && activePointPopup?.kind === 'info'" :point="activePointPopup.point" :audio-service="audioService" :audio-session="audioStore.state.activeSession" @close="activePointPopup = null" />
        <ImageViewerPopup v-if="viewerUIReady && activePointPopup?.kind === 'image'" :point="activePointPopup.point" @close="activePointPopup = null" />
        <VideoPoiPopup v-if="viewerUIReady && activePointPopup?.kind === 'video'" :point="activePointPopup.point" @close="activePointPopup = null" />
      </div>
      <div class="viewer-notification-layer" aria-live="polite">
        <p v-if="errorMessage" class="viewer-error">{{ errorMessage }}</p>
      </div>
    </div>
  </section>
</template>
