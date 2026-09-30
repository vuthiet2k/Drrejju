export const CORE_FACADE_NOT_AVAILABLE = 'NOT_AVAILABLE';

export const CORE_FACADE_FOV_RANGE = Object.freeze({ min: 30, max: 120 });

export const CORE_FACADE_EVENTS = Object.freeze([
  'ready',
  'scene-change',
  'view-change',
  'view-mode-change',
  'load-progress',
  'load-complete',
  'error',
  'hotspot-click',
  'audio-loaded',
  'audio-play',
  'audio-pause',
  'audio-stop',
  'audio-ended',
  'audio-error',
  'audio-state-change',
  'audio-timeupdate',
  'audio-volumechange',
  'autorotate-change',
  'fullscreen-change',
  'intro-start',
  'intro-phase-change',
  'intro-complete',
  'poi-visibility-change',
]);

const EVENT_ALIASES = Object.freeze({
  'audio:loaded': 'audio-loaded',
  'audio:play': 'audio-play',
  'audio:pause': 'audio-pause',
  'audio:stop': 'audio-stop',
  'audio:ended': 'audio-ended',
  'audio:error': 'audio-error',
  'audio:state': 'audio-state-change',
  'audio:volumechange': 'audio-volumechange',
});

const DEFAULT_ZOOM_STEP = 5;

function resolveRef(value) {
  return value?.__v_isRef === true ? value.value : value;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function zoomStep(value) {
  const step = Number(value);
  return Number.isFinite(step) && step > 0 ? step : DEFAULT_ZOOM_STEP;
}

function notAvailable(feature) {
  return Object.freeze({ ok: false, feature, reason: CORE_FACADE_NOT_AVAILABLE });
}

function invalidArgument(feature, message) {
  return Object.freeze({ ok: false, feature, reason: 'INVALID_ARGUMENT', message });
}

function normalizeEventName(eventName) {
  return EVENT_ALIASES[eventName] || eventName;
}

function normalizeAudioState(state, available) {
  if (!state) {
    return Object.freeze({
      available,
      status: null,
      playing: null,
      paused: null,
      ended: null,
      muted: null,
      currentTime: null,
      duration: null,
      volume: null,
    });
  }

  const status = typeof state.status === 'string' ? state.status : null;
  return Object.freeze({
    ...state,
    available,
    status,
    playing: status === null ? null : status === 'playing',
    paused: status === null ? null : status === 'paused',
    ended: status === null ? null : status === 'ended',
    muted: typeof state.muted === 'boolean' ? state.muted : null,
    currentTime: Number.isFinite(Number(state.currentTime)) ? Number(state.currentTime) : null,
    duration: Number.isFinite(Number(state.duration)) ? Number(state.duration) : null,
    volume: Number.isFinite(Number(state.volume)) ? Number(state.volume) : null,
  });
}

/**
 * Public API boundary over a core viewer component instance.
 * The facade never owns or destroys the viewer, audio manager, intro controller,
 * fullscreen controller, camera, renderer, or scene transition runtime.
 */
export class ViewerCoreFacade {
  #coreReference = null;
  #eventSource = null;
  #connected = false;
  #unsubscribeCore = null;
  #listeners = new Map();

  constructor(core = null, options = {}) {
    this.#coreReference = core;
    this.#eventSource = options.eventSource || null;
  }

  get core() {
    return resolveRef(this.#coreReference);
  }

  get connected() {
    return this.#connected;
  }

  setCore(core) {
    const reconnect = this.#connected;
    if (reconnect) this.disconnect();
    this.#coreReference = core;
    if (reconnect) this.connect();
    return this;
  }

  setEventSource(eventSource) {
    const reconnect = this.#connected;
    if (reconnect) this.disconnect();
    this.#eventSource = eventSource;
    if (reconnect) this.connect();
    return this;
  }

  connect() {
    if (this.#connected) return this;
    this.#connected = true;

    const source = typeof this.core?.subscribeCoreEvents === 'function'
      ? { subscribeCoreEvents: this.core.subscribeCoreEvents.bind(this.core) }
      : this.#eventSource;
    this.#unsubscribeCore = this.#subscribe(source);
    return this;
  }

  disconnect() {
    this.#unsubscribeCore?.();
    this.#unsubscribeCore = null;
    this.#connected = false;
    return this;
  }

  clearReferences() {
    this.disconnect();
    this.#listeners.clear();
    this.#coreReference = null;
    this.#eventSource = null;
  }

  on(eventName, callback) {
    const normalizedName = normalizeEventName(eventName);
    if (!CORE_FACADE_EVENTS.includes(normalizedName)) {
      throw new RangeError(`Unsupported core facade event: ${eventName}`);
    }
    if (typeof callback !== 'function') throw new TypeError('Event callback must be a function.');
    const listeners = this.#listeners.get(normalizedName) || new Set();
    listeners.add(callback);
    this.#listeners.set(normalizedName, listeners);
    return () => this.off(normalizedName, callback);
  }

  off(eventName, callback) {
    const normalizedName = normalizeEventName(eventName);
    const listeners = this.#listeners.get(normalizedName);
    if (!listeners) return false;
    const removed = listeners.delete(callback);
    if (listeners.size === 0) this.#listeners.delete(normalizedName);
    return removed;
  }

  forwardCoreEvent(eventName, payload) {
    if (!this.#connected) return false;
    this.#publish(eventName, payload);
    return true;
  }

  getCapabilities() {
    const core = this.core;
    const scene = Boolean(
      typeof core?.goToScene === 'function'
      && typeof core?.nextScene === 'function'
      && typeof core?.previousScene === 'function',
    );
    const view = Boolean(typeof core?.getView === 'function' && typeof core?.setView === 'function');
    const viewMode = Boolean(
      typeof core?.getViewMode === 'function'
      && typeof core?.setViewMode === 'function'
      && typeof core?.getAvailableViewModes === 'function',
    );
    const audio = Boolean(
      typeof core?.getAudioState === 'function'
      && typeof core?.playAudio === 'function'
      && typeof core?.pauseAudio === 'function'
      && typeof core?.toggleAudio === 'function',
    );
    const autorotate = Boolean(
      typeof core?.toggleAutorotate === 'function'
      && typeof core?.getAutorotateState === 'function',
    );
    const fullscreen = Boolean(
      typeof core?.enterFullscreen === 'function'
      && typeof core?.exitFullscreen === 'function'
      && typeof core?.toggleFullscreen === 'function'
      && typeof core?.isFullscreen === 'function',
    );
    const intro = typeof core?.getIntroState === 'function';

    return Object.freeze({
      scene,
      view,
      viewMode,
      zoom: view,
      audio,
      autorotate,
      fullscreen,
      intro,
      poi: scene && typeof core?.subscribeCoreEvents === 'function',
      nav: scene,
      touch: view,
    });
  }

  get capabilities() {
    return this.getCapabilities();
  }

  getScenes() {
    if (typeof this.core?.getScenes === 'function') return this.core.getScenes();
    const runtimeTour = resolveRef(this.core?.runtimeTour);
    return Array.isArray(runtimeTour?.scenes) ? runtimeTour.scenes : [];
  }

  getCurrentSceneId() {
    if (typeof this.core?.getCurrentSceneId === 'function') return this.core.getCurrentSceneId();
    const activeSceneId = resolveRef(this.core?.activeSceneId);
    return typeof activeSceneId === 'string' ? activeSceneId : '';
  }

  getCurrentSceneIndex() {
    const sceneId = this.getCurrentSceneId();
    return sceneId ? this.getScenes().findIndex((scene) => scene?.id === sceneId) : -1;
  }

  getCurrentScene() {
    const index = this.getCurrentSceneIndex();
    return index >= 0 ? this.getScenes()[index] : null;
  }

  isFirstScene() {
    return this.getCurrentSceneIndex() === 0;
  }

  isLastScene() {
    const scenes = this.getScenes();
    const index = this.getCurrentSceneIndex();
    return index >= 0 && index === scenes.length - 1;
  }

  getSceneState() {
    const scenes = this.getScenes();
    const currentSceneIndex = this.getCurrentSceneIndex();
    return Object.freeze({
      scenes,
      currentScene: currentSceneIndex >= 0 ? scenes[currentSceneIndex] : null,
      currentSceneId: this.getCurrentSceneId(),
      currentSceneIndex,
      totalScenes: scenes.length,
      isFirstScene: currentSceneIndex === 0,
      isLastScene: currentSceneIndex >= 0 && currentSceneIndex === scenes.length - 1,
    });
  }

  goToScene(sceneId, options) { return this.#call('goToScene', [sceneId, options], 'scene.goToScene'); }
  nextScene() { return this.#call('nextScene', [], 'scene.nextScene'); }
  previousScene() { return this.#call('previousScene', [], 'scene.previousScene'); }

  getView() {
    return typeof this.core?.getView === 'function' ? this.core.getView() : null;
  }

  setView(view, options) { return this.#call('setView', [view, options], 'view.setView'); }
  resetView() { return this.#call('resetView', [], 'view.resetView'); }

  getViewMode() {
    return typeof this.core?.getViewMode === 'function' ? this.core.getViewMode() : null;
  }

  setViewMode(mode) { return this.#call('setViewMode', [mode], 'viewMode.setViewMode'); }

  getAvailableViewModes() {
    return typeof this.core?.getAvailableViewModes === 'function'
      ? this.core.getAvailableViewModes()
      : [];
  }

  getFov() {
    const fov = Number(this.getView()?.fov);
    return Number.isFinite(fov) ? fov : null;
  }

  setFov(fov) {
    const value = Number(fov);
    if (!Number.isFinite(value)) return invalidArgument('view.setFov', 'FOV must be a finite number.');
    const view = this.getView();
    if (!view || !this.getCapabilities().view) return notAvailable('view.setFov');
    return this.setView({
      ...view,
      fov: clamp(value, CORE_FACADE_FOV_RANGE.min, CORE_FACADE_FOV_RANGE.max),
    });
  }

  zoomIn(step = DEFAULT_ZOOM_STEP) {
    const fov = this.getFov();
    return fov === null ? notAvailable('zoom.zoomIn') : this.setFov(fov - zoomStep(step));
  }

  zoomOut(step = DEFAULT_ZOOM_STEP) {
    const fov = this.getFov();
    return fov === null ? notAvailable('zoom.zoomOut') : this.setFov(fov + zoomStep(step));
  }

  getAudioState() {
    const available = this.getCapabilities().audio;
    const state = typeof this.core?.getAudioState === 'function' ? this.core.getAudioState() : null;
    return normalizeAudioState(state, available);
  }

  playAudio() { return this.#call('playAudio', [], 'audio.play'); }
  pauseAudio() { return this.#call('pauseAudio', [], 'audio.pause'); }
  resumeAudio() { return this.#call('resumeAudio', [], 'audio.resume'); }
  toggleAudio() { return this.#call('toggleAudio', [], 'audio.toggle'); }
  stopAudio() { return this.#call('stopAudio', [], 'audio.stop'); }
  seekAudio(time) { return this.#call('seekAudio', [time], 'audio.seek'); }
  setAudioVolume(volume) { return this.#call('setAudioVolume', [volume], 'audio.setVolume'); }
  setAudioMuted(muted) { return this.#call('setAudioMuted', [Boolean(muted)], 'audio.setMuted'); }
  getAudioCurrentTime() { return this.getAudioState().currentTime; }
  getAudioDuration() { return this.getAudioState().duration; }
  getAudioVolume() { return this.getAudioState().volume; }
  isAudioPlaying() { return this.getAudioState().playing; }
  isAudioPaused() { return this.getAudioState().paused; }
  isAudioMuted() { return this.getAudioState().muted; }

  startAutorotate() { return this.toggleAutorotate(true); }
  stopAutorotate() { return this.toggleAutorotate(false); }
  toggleAutorotate(force) { return this.#call('toggleAutorotate', [force], 'autorotate.toggle'); }
  isAutorotateEnabled() {
    return typeof this.core?.getAutorotateState === 'function'
      ? Boolean(this.core.getAutorotateState())
      : null;
  }

  getAutorotateState() {
    return Object.freeze({
      available: this.getCapabilities().autorotate,
      enabled: this.isAutorotateEnabled(),
    });
  }

  enterFullscreen() { return this.#call('enterFullscreen', [], 'fullscreen.enter'); }
  exitFullscreen() { return this.#call('exitFullscreen', [], 'fullscreen.exit'); }
  toggleFullscreen() { return this.#call('toggleFullscreen', [], 'fullscreen.toggle'); }
  isFullscreen() {
    return typeof this.core?.isFullscreen === 'function' ? Boolean(this.core.isFullscreen()) : null;
  }

  getIntroState() {
    const available = this.getCapabilities().intro;
    const state = typeof this.core?.getIntroState === 'function' ? this.core.getIntroState() : null;
    return Object.freeze({
      available,
      phase: state?.phase ?? null,
      completed: typeof state?.completed === 'boolean' ? state.completed : null,
      interactive: typeof state?.interactive === 'boolean' ? state.interactive : null,
    });
  }

  startIntro() { return this.#call('startIntro', [], 'intro.start'); }

  isPoiHidden() {
    return typeof this.core?.isPoiHidden === 'function' ? Boolean(this.core.isPoiHidden()) : null;
  }

  getPoiState() {
    const available = this.getCapabilities().poi;
    const state = typeof this.core?.getPoiState === 'function' ? this.core.getPoiState() : null;
    return Object.freeze({
      available,
      hidden: state ? state.hidden === true : null,
    });
  }

  togglePoi(force) { return this.#call('togglePoi', [force], 'poi.toggle'); }
  setPoiHidden(hidden) { return this.#call('setPoiHidden', [Boolean(hidden)], 'poi.setHidden'); }

  #call(methodName, args, feature) {
    const method = this.core?.[methodName];
    return typeof method === 'function' ? method.apply(this.core, args) : notAvailable(feature);
  }

  #subscribe(source) {
    if (!source) return null;
    const handler = (event, payload) => {
      if (typeof event === 'string') this.#publish(event, payload);
      else if (event?.type) this.#publish(event.type, event.payload ?? event.session ?? event);
    };

    if (typeof source.subscribeCoreEvents === 'function') {
      const unsubscribe = source.subscribeCoreEvents(handler);
      return typeof unsubscribe === 'function' ? unsubscribe : null;
    }
    if (typeof source.subscribe === 'function') {
      const unsubscribe = source.subscribe(handler);
      return typeof unsubscribe === 'function' ? unsubscribe : null;
    }
    if (typeof source.on === 'function') {
      const unsubscribers = CORE_FACADE_EVENTS.map((eventName) => {
        const callback = (payload) => this.#publish(eventName, payload);
        const unsubscribe = source.on(eventName, callback);
        return typeof unsubscribe === 'function'
          ? unsubscribe
          : () => source.off?.(eventName, callback);
      });
      return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    }
    throw new TypeError('Core event source must expose subscribeCoreEvents(), subscribe(), or on()/off().');
  }

  #publish(eventName, payload) {
    const normalizedName = normalizeEventName(eventName);
    if (!CORE_FACADE_EVENTS.includes(normalizedName)) return;
    const eventNames = normalizedName === 'audio-state-change'
      ? ['audio-state-change', 'audio-timeupdate']
      : [normalizedName];
    for (const name of eventNames) {
      const listeners = this.#listeners.get(name);
      if (!listeners) continue;
      for (const callback of [...listeners]) callback(payload);
    }
  }
}

export function createViewerCoreFacade(core, options) {
  return new ViewerCoreFacade(core, options);
}

export default ViewerCoreFacade;
