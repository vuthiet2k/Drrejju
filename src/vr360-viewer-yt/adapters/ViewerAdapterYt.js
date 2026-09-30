import {
  CORE_FACADE_EVENTS,
  CORE_FACADE_NOT_AVAILABLE,
  ViewerCoreFacade,
} from '@/vr360-viewer/index.js';

export const NOT_AVAILABLE = CORE_FACADE_NOT_AVAILABLE;
export const CORE_EVENTS = CORE_FACADE_EVENTS;

function assertFacade(facade) {
  if (!(facade instanceof ViewerCoreFacade)) {
    throw new TypeError('ViewerAdapterYt requires a ViewerCoreFacade instance.');
  }
}

// Thin adapter over the public core facade. UI never imports core runtime.
// State kept in closure-scoped underscore-prefixed properties to stay compatible
// with the project's ESLint parser (no ES private-field syntax).
export class ViewerAdapterYt {
  constructor(facade) {
    assertFacade(facade);
    this._facade = facade;
    this._connected = false;
    this._eventUnsubscribers = [];
    this._listeners = new Map();
  }

  get facade() { return this._facade; }
  get connected() { return this._connected; }
  get capabilities() { return this._facade.getCapabilities(); }

  connect() {
    if (this._connected) return this;
    this._connected = true;
    if (!this._facade.connected) this._facade.connect();
    for (const eventName of CORE_EVENTS) {
      this._eventUnsubscribers.push(
        this._facade.on(eventName, (payload) => this._publish(eventName, payload)),
      );
    }
    return this;
  }

  disconnect() {
    for (const unsubscribe of this._eventUnsubscribers.splice(0)) unsubscribe();
    this._connected = false;
    return this;
  }

  destroy() {
    this.disconnect();
    this._listeners.clear();
    this._facade = null;
  }

  on(eventName, callback) {
    if (!CORE_EVENTS.includes(eventName)) {
      throw new RangeError(`Unsupported core event: ${eventName}`);
    }
    const listeners = this._listeners.get(eventName) || new Set();
    listeners.add(callback);
    this._listeners.set(eventName, listeners);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    const listeners = this._listeners.get(eventName);
    if (!listeners) return false;
    const removed = listeners.delete(callback);
    if (listeners.size === 0) this._listeners.delete(eventName);
    return removed;
  }

  // Scene
  getScenes() { return this._facade.getScenes(); }
  getCurrentScene() { return this._facade.getCurrentScene(); }
  getSceneState() { return this._facade.getSceneState(); }
  goToScene(id, options) { return this._facade.goToScene(id, options); }
  nextScene() { return this._facade.nextScene(); }
  previousScene() { return this._facade.previousScene(); }

  // View
  resetView() { return this._facade.resetView(); }
  getViewMode() { return this._facade.getViewMode(); }
  setViewMode(mode) { return this._facade.setViewMode(mode); }
  getAvailableViewModes() { return this._facade.getAvailableViewModes(); }

  // Audio
  getAudioState() { return this._facade.getAudioState(); }
  toggleAudio() { return this._facade.toggleAudio(); }
  playAudio() { return this._facade.playAudio(); }
  pauseAudio() { return this._facade.pauseAudio(); }
  seekAudio(time) { return this._facade.seekAudio(time); }
  setAudioVolume(volume) { return this._facade.setAudioVolume(volume); }
  setAudioMuted(muted) { return this._facade.setAudioMuted(muted); }

  // Autorotate
  toggleAutorotate(force) { return this._facade.toggleAutorotate(force); }
  getAutorotateState() { return this._facade.getAutorotateState(); }

  // Fullscreen
  toggleFullscreen() { return this._facade.toggleFullscreen(); }
  isFullscreen() { return this._facade.isFullscreen(); }

  // Intro
  getIntroState() { return this._facade.getIntroState(); }

  // POI (extended core capability)
  togglePoi(force) { return this._facade.togglePoi(force); }
  setPoiHidden(hidden) { return this._facade.setPoiHidden(hidden); }
  isPoiHidden() { return this._facade.isPoiHidden(); }
  getPoiState() { return this._facade.getPoiState(); }

  _publish(eventName, payload) {
    const listeners = this._listeners.get(eventName);
    if (!listeners) return;
    for (const callback of [...listeners]) callback(payload);
  }
}

export default ViewerAdapterYt;
