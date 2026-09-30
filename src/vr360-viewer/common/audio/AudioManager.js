import { AUDIO_EVENT, AUDIO_SCOPE, AUDIO_STATUS } from './constants.js';
import { normalizeAudioSource } from './utils.js';
import { createAudioSession } from './AudioSession.js';

const NARRATION_SCOPES = Object.freeze([
  AUDIO_SCOPE.TOUR,
  AUDIO_SCOPE.SCENE,
  AUDIO_SCOPE.POI,
]);

const PRIORITY = Object.freeze({
  [AUDIO_SCOPE.TOUR]: 1,
  [AUDIO_SCOPE.SCENE]: 2,
  [AUDIO_SCOPE.POI]: 3,
});

const DUCKED_BACKGROUND_VOLUME = 0.25;

/**
 * The only Viewer boundary allowed to own HTMLAudioElement instances.
 * It also owns narration priority, resumable interruptions and background
 * music ducking so View components never coordinate audio players directly.
 */
export class AudioManager {
  #players = new Map();
  #onEvent;
  #disposed = false;
  #masterVolume = 1;
  #activeScope = null;
  #listeners = new Set();
  #progressTimer = null;
  #activeSession = createAudioSession();

  constructor({ onEvent } = {}) {
    this.#onEvent = typeof onEvent === 'function' ? onEvent : null;
  }

  #emit(type, scope, source, extra = {}) {
    const event = { type, scope, source, ...extra };
    if (import.meta.env?.DEV && type !== 'audio:state') console.debug('[Audio Manager]', type, scope, source || '');
    this.#onEvent?.(event);
    this.#listeners.forEach((listener) => listener(event));
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #syncSession(scope = this.#activeScope, patch = {}) {
    const record = scope ? this.#players.get(scope) : null;
    if (!record) {
      this.#activeSession = createAudioSession({ status: AUDIO_STATUS.IDLE });
    } else {
      const { player } = record;
      this.#activeSession = createAudioSession({
        sourceType: scope === AUDIO_SCOPE.POI ? 'poi' : scope === AUDIO_SCOPE.TOUR ? 'tour' : scope,
        sourceId: record.sourceId || record.source,
        title: record.title || '',
        url: record.source,
        status: !player.paused && !player.ended ? AUDIO_STATUS.PLAYING : (patch.status || AUDIO_STATUS.PAUSED),
        currentTime: Number.isFinite(player.currentTime) ? player.currentTime : 0,
        duration: Number.isFinite(player.duration) ? player.duration : 0,
        volume: record.volume,
        muted: record.muted,
        loop: Boolean(player.loop),
        playbackRate: player.playbackRate,
        interruptedSession: record.interruptedSession || null,
        pauseReason: record.pauseReason || null,
        error: patch.error || null,
      });
    }
    this.#listeners.forEach((listener) => listener({ type: 'audio:state', session: this.#activeSession }));
  }

  #startProgress(scope) {
    clearInterval(this.#progressTimer);
    this.#progressTimer = setInterval(() => this.#syncSession(scope), 250);
  }

  #stopProgress() {
    clearInterval(this.#progressTimer);
    this.#progressTimer = null;
  }

  getActiveSession() {
    return { ...this.#activeSession };
  }

  #result(status = AUDIO_STATUS.IDLE, source = '', extra = {}) {
    return { status, source: normalizeAudioSource(source), ...extra };
  }

  #isNarration(scope) {
    return NARRATION_SCOPES.includes(scope);
  }

  #recordFor(scope, source = '', options = {}) {
    if (this.#disposed) return null;
    const normalized = normalizeAudioSource(source);
    if (!normalized || typeof Audio === 'undefined') return null;
    const current = this.#players.get(scope);
    if (current?.source === normalized) {
      this.#applyOptions(current, options);
      return current;
    }
    if (current) this.#disposeRecord(scope, current);

    const player = new Audio(normalized);
    if (import.meta.env?.DEV) console.debug('[Audio Manager] create player', scope, normalized);
    const record = {
      player,
      source: normalized,
      sourceId: options.sourceId || normalized,
      title: options.title || '',
      volume: 1,
      muted: false,
      pausedBy: null,
      pauseReason: null,
      interruptedSession: null,
    };
    player.preload = 'auto';
    player.addEventListener('canplaythrough', () => {
      if (this.#players.get(scope) === record) this.#emit(AUDIO_EVENT.LOADED, scope, normalized);
    });
    player.addEventListener('ended', () => this.#onEnded(scope, record));
    player.addEventListener('error', (cause) => this.#onError(scope, record, cause));
    this.#players.set(scope, record);
    this.#applyOptions(record, options);
    return record;
  }

  #applyOptions(record, { volume, muted, loop, playbackRate, sourceId, title } = {}) {
    if (volume !== undefined) record.volume = this.#volume(volume);
    if (muted !== undefined) record.muted = Boolean(muted);
    if (loop !== undefined) record.player.loop = Boolean(loop);
    if (playbackRate !== undefined) record.player.playbackRate = this.#playbackRate(playbackRate);
    if (sourceId !== undefined) record.sourceId = sourceId;
    if (title !== undefined) record.title = title;
    record.player.muted = record.muted;
    this.#applyEffectiveVolume(record);
  }

  #volume(value) {
    return Math.min(1, Math.max(0, Number(value) || 0));
  }

  #playbackRate(value) {
    return Math.min(2, Math.max(0.5, Number(value) || 1));
  }

  #applyEffectiveVolume(record) {
    const isBackground = this.#players.get(AUDIO_SCOPE.BACKGROUND) === record;
    const ducking = isBackground && this.#hasActiveNarration()
      ? DUCKED_BACKGROUND_VOLUME
      : 1;
    record.player.volume = record.volume * this.#masterVolume * ducking;
  }

  #hasActiveNarration() {
    return NARRATION_SCOPES.some((scope) => {
      const record = this.#players.get(scope);
      return Boolean(record && !record.player.paused && !record.player.ended);
    });
  }

  #syncBackgroundDucking() {
    const background = this.#players.get(AUDIO_SCOPE.BACKGROUND);
    if (background) this.#applyEffectiveVolume(background);
  }

  #disposeRecord(scope, record) {
    try {
      record.player.pause();
      record.player.currentTime = 0;
      record.player.removeAttribute('src');
      record.player.load();
    } catch (cause) {
      this.#emit(AUDIO_EVENT.ERROR, scope, record.source, { cause });
    }
    if (this.#players.get(scope) === record) this.#players.delete(scope);
  }

  #pauseForPriority(scope, byScope) {
    const record = this.#players.get(scope);
    if (!record) return;
    if (record.player.paused) return;
    record.player.pause();
    record.pausedBy = byScope;
    record.pauseReason = byScope === AUDIO_SCOPE.POI ? 'poi-interrupt' : 'priority';
    this.#emit(AUDIO_EVENT.PAUSE, scope, record.source, { reason: record.pauseReason, byScope });
  }

  #suspendLowerPriorities(scope) {
    const priority = PRIORITY[scope];
    NARRATION_SCOPES
      .filter((candidate) => PRIORITY[candidate] < priority)
      .forEach((candidate) => this.#pauseForPriority(candidate, scope));
  }

  async #playRecord(scope, record, { priority = false } = {}) {
    if (this.#isNarration(scope)) {
      this.#activeScope = scope;
      NARRATION_SCOPES
        .filter((candidate) => candidate !== scope)
        .forEach((candidate) => {
          const other = this.#players.get(candidate);
          if (other && !other.player.paused) this.#pauseForPriority(candidate, scope);
        });
    }
    if (priority) this.#suspendLowerPriorities(scope);
    record.pausedBy = null;
    record.pauseReason = null;
    this.#syncSession(scope, { status: AUDIO_STATUS.LOADING });
    try {
      if (import.meta.env?.DEV) console.debug('[Audio Manager] player.play()', scope, record.source);
      await record.player.play();
      if (import.meta.env?.DEV) console.debug('[Audio Manager] player.play() resolved', scope, record.source);
      this.#startProgress(scope);
      this.#emit(AUDIO_EVENT.PLAY, scope, record.source);
      this.#syncSession(scope, { status: AUDIO_STATUS.PLAYING });
      this.#syncBackgroundDucking();
      return this.#result(AUDIO_STATUS.PLAYING, record.source, { playing: true, blocked: false });
    } catch (cause) {
      if (import.meta.env?.DEV) console.debug('[Audio Manager] player.play() rejected', scope, record.source, cause);
      this.#emit(AUDIO_EVENT.ERROR, scope, record.source, { cause });
      this.#syncBackgroundDucking();
      this.#syncSession(scope, { status: AUDIO_STATUS.ERROR, error: cause });
      return this.#result(AUDIO_STATUS.PAUSED, record.source, { playing: false, blocked: true, error: cause });
    }
  }

  #onEnded(scope, record) {
    if (this.#players.get(scope) !== record) return;
    this.#emit(AUDIO_EVENT.ENDED, scope, record.source);
    this.#stopProgress();
    const wasActive = this.#activeScope === scope;
    // Trước đây xoá hẳn record (removeAttribute('src') + disposeRecord) VÀ
    // trả #activeScope về null khi phát xong, khiến duration/url về 0/rỗng.
    // YtAudioControls.vue chỉ hiện nút Play khi available && duration > 0,
    // nên nút Play biến mất vĩnh viễn; giữ #activeScope trỏ về scope vừa
    // xong (thay vì null) thì playAudio()/toggleAudio() (dùng
    // resumeActive/toggleActive theo #activeScope) mới bấm phát lại được.
    // Giữ nguyên record, chỉ tua currentTime về 0 để bấm Play là phát lại
    // từ đầu ngay, giống hành vi player thông thường. #playRecord sẽ tự gán
    // lại #activeScope đúng nếu có narration khác được resume ngay sau đây.
    if (this.#isNarration(scope)) {
      try { record.player.currentTime = 0; } catch { /* một số trình duyệt chặn seek trước khi có metadata — bỏ qua */ }
    }
    this.#syncBackgroundDucking();
    if (wasActive) this.#syncSession(scope, { status: AUDIO_STATUS.ENDED });
    if (this.#isNarration(scope)) this.#resumeInterruptedBy(scope);
  }

  #onError(scope, record, cause) {
    if (this.#players.get(scope) !== record) return;
    this.#emit(AUDIO_EVENT.ERROR, scope, record.source, { cause });
    const wasActive = this.#activeScope === scope;
    if (wasActive) this.#activeScope = null;
    if (this.#isNarration(scope)) {
      this.#disposeRecord(scope, record);
    }
    this.#syncBackgroundDucking();
    if (wasActive) this.#syncSession(null, { status: AUDIO_STATUS.ERROR, error: cause });
    if (this.#isNarration(scope)) this.#resumeInterruptedBy(scope);
  }

  #resumeInterruptedBy(scope) {
    const candidate = NARRATION_SCOPES
      .filter((item) => PRIORITY[item] < PRIORITY[scope])
      .sort((left, right) => PRIORITY[right] - PRIORITY[left])
      .map((item) => [item, this.#players.get(item)])
      .find(([, record]) => record?.pausedBy === scope);
    if (!candidate) return;
    const [resumeScope, record] = candidate;
    this.#playRecord(resumeScope, record, { priority: false });
  }

  async preload(source, scope = AUDIO_SCOPE.SCENE, options = {}) {
    const normalized = normalizeAudioSource(source);
    if (!normalized) return this.#result(AUDIO_STATUS.STOPPED, normalized);
    const record = this.#recordFor(scope, normalized, options);
    if (!record) return this.#result(AUDIO_STATUS.ERROR, normalized);
    if (record.player.readyState >= 3) {
      this.#emit(AUDIO_EVENT.LOADED, scope, normalized);
      return this.#result(AUDIO_STATUS.STOPPED, normalized, { ready: true });
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = (status, extra = {}) => {
        if (settled) return;
        settled = true;
        record.player.removeEventListener('canplaythrough', onLoaded);
        record.player.removeEventListener('loadedmetadata', onLoaded);
        record.player.removeEventListener('error', onError);
        resolve(this.#result(status, normalized, extra));
      };
      const onLoaded = () => finish(AUDIO_STATUS.STOPPED, { ready: true });
      const onError = (cause) => finish(AUDIO_STATUS.ERROR, { error: cause });
      record.player.addEventListener('canplaythrough', onLoaded, { once: true });
      record.player.addEventListener('loadedmetadata', onLoaded, { once: true });
      record.player.addEventListener('error', onError, { once: true });
      try { record.player.load(); } catch (cause) { onError(cause); }
    });
  }

  play(source, scope = AUDIO_SCOPE.SCENE, options = {}) {
    const record = this.#recordFor(scope, source, options);
    if (!record) return Promise.resolve(this.#result(AUDIO_STATUS.ERROR, source));
    return this.#playRecord(scope, record, { priority: this.#isNarration(scope) });
  }

  playNarration(source, scope, options = {}) {
    if (!this.#isNarration(scope)) return Promise.resolve(this.#result(AUDIO_STATUS.ERROR, source));
    return this.play(source, scope, options);
  }

  pause(scope = AUDIO_SCOPE.SCENE) {
    const record = this.#players.get(scope);
    if (!record) return this.#result(AUDIO_STATUS.PAUSED);
    record.player.pause();
    record.pausedBy = null;
    record.pauseReason = 'manual';
    this.#emit(AUDIO_EVENT.PAUSE, scope, record.source, { reason: 'manual' });
    this.#syncBackgroundDucking();
    if (this.#activeScope === scope) this.#syncSession(scope, { status: AUDIO_STATUS.PAUSED });
    return this.#result(AUDIO_STATUS.PAUSED, record.source, { playing: false });
  }

  stop(scope, { resume = false } = {}) {
    if (scope === undefined) {
      [...this.#players.keys()].forEach((key) => this.stop(key, { resume: false }));
      this.#activeScope = null;
      this.#syncSession(null, { status: AUDIO_STATUS.STOPPED });
      return this.#result(AUDIO_STATUS.STOPPED);
    }
    const record = this.#players.get(scope);
    if (!record) {
      if (resume && this.#isNarration(scope)) this.#resumeInterruptedBy(scope);
      return this.#result(AUDIO_STATUS.STOPPED);
    }
    this.#disposeRecord(scope, record);
    this.#emit(AUDIO_EVENT.STOP, scope, record.source);
    if (resume && this.#isNarration(scope)) this.#resumeInterruptedBy(scope);
    this.#syncBackgroundDucking();
    if (this.#activeScope === scope) {
      this.#activeScope = null;
      this.#syncSession(null, { status: AUDIO_STATUS.STOPPED });
    }
    return this.#result(AUDIO_STATUS.STOPPED, record.source);
  }

  async resume(scope = AUDIO_SCOPE.SCENE) {
    const record = this.#players.get(scope);
    if (!record) return this.#result(AUDIO_STATUS.STOPPED);
    return this.#playRecord(scope, record, { priority: this.#isNarration(scope) });
  }

  toggleSession(scope) {
    if (this.isPlaying(scope)) return this.pause(scope);
    return this.resume(scope);
  }

  toggleActive() {
    if (!this.#activeScope) return this.#result(AUDIO_STATUS.STOPPED);
    return this.toggleSession(this.#activeScope);
  }

  pauseActive() { return this.#activeScope ? this.pause(this.#activeScope) : this.#result(AUDIO_STATUS.PAUSED); }
  resumeActive() { return this.#activeScope ? this.resume(this.#activeScope) : this.#result(AUDIO_STATUS.STOPPED); }
  seekActive(time) { return this.#activeScope ? this.seek(time, this.#activeScope) : this.#result(AUDIO_STATUS.STOPPED); }
  setActiveVolume(volume) { return this.#activeScope ? this.setVolume(volume, this.#activeScope) : { status: AUDIO_STATUS.STOPPED, volume }; }
  muteActive() { return this.#activeScope ? this.mute(this.#activeScope) : { status: AUDIO_STATUS.STOPPED, muted: true }; }
  unmuteActive() { return this.#activeScope ? this.unmute(this.#activeScope) : { status: AUDIO_STATUS.STOPPED, muted: false }; }

  resumeInterrupted(scope) {
    if (this.#isNarration(scope)) this.#resumeInterruptedBy(scope);
  }

  setVolume(volume, scope) {
    const value = this.#volume(volume);
    const records = scope === undefined ? [...this.#players.values()] : [this.#players.get(scope)];
    records.filter(Boolean).forEach((record) => {
      record.volume = value;
      this.#applyEffectiveVolume(record);
    });
    if (scope === undefined || scope === this.#activeScope) this.#syncSession(this.#activeScope);
    return { status: AUDIO_STATUS.IDLE, volume: value };
  }

  setMasterVolume(volume) {
    this.#masterVolume = this.#volume(volume);
    this.#players.forEach((record) => this.#applyEffectiveVolume(record));
    this.#syncSession(this.#activeScope);
    return { status: AUDIO_STATUS.IDLE, volume: this.#masterVolume };
  }

  setPlaybackRate(rate, scope) {
    const value = this.#playbackRate(rate);
    const records = scope === undefined ? [...this.#players.values()] : [this.#players.get(scope)];
    records.filter(Boolean).forEach((record) => { record.player.playbackRate = value; });
    if (scope === undefined || scope === this.#activeScope) this.#syncSession(this.#activeScope);
    return { status: AUDIO_STATUS.IDLE, playbackRate: value };
  }

  setActivePlaybackRate(rate) {
    return this.#activeScope
      ? this.setPlaybackRate(rate, this.#activeScope)
      : { status: AUDIO_STATUS.STOPPED, playbackRate: this.#playbackRate(rate) };
  }

  getMasterVolume() {
    return this.#masterVolume;
  }

  seek(time, scope = AUDIO_SCOPE.SCENE) {
    const record = this.#players.get(scope);
    if (!record) return this.#result(AUDIO_STATUS.STOPPED);
    const duration = Number(record.player.duration);
    const value = Math.max(0, Math.min(Number.isFinite(duration) ? duration : Number.MAX_SAFE_INTEGER, Number(time) || 0));
    try {
      record.player.currentTime = value;
      if (this.#activeScope === scope) this.#syncSession(scope, { status: record.player.paused ? AUDIO_STATUS.PAUSED : AUDIO_STATUS.PLAYING });
      return this.#result(AUDIO_STATUS.IDLE, record.source, { currentTime: value });
    } catch (cause) {
      this.#emit(AUDIO_EVENT.ERROR, scope, record.source, { cause });
      return this.#result(AUDIO_STATUS.ERROR, record.source, { error: cause });
    }
  }

  setLoop(loop, scope = AUDIO_SCOPE.BACKGROUND) {
    const record = this.#players.get(scope);
    if (!record) return { status: AUDIO_STATUS.STOPPED, loop: Boolean(loop) };
    record.player.loop = Boolean(loop);
    return { status: AUDIO_STATUS.IDLE, loop: record.player.loop };
  }

  mute(scope) {
    const records = scope === undefined ? [...this.#players.values()] : [this.#players.get(scope)];
    records.filter(Boolean).forEach((record) => { record.muted = true; record.player.muted = true; });
    if (scope === undefined || scope === this.#activeScope) this.#syncSession(this.#activeScope);
    return { status: AUDIO_STATUS.IDLE, muted: true };
  }

  unmute(scope) {
    const records = scope === undefined ? [...this.#players.values()] : [this.#players.get(scope)];
    records.filter(Boolean).forEach((record) => { record.muted = false; record.player.muted = false; });
    if (scope === undefined || scope === this.#activeScope) this.#syncSession(this.#activeScope);
    return { status: AUDIO_STATUS.IDLE, muted: false };
  }

  isPlaying(scope) {
    const record = this.#players.get(scope);
    return Boolean(record && !record.player.paused && !record.player.ended);
  }

  getPlaybackState(scope) {
    const record = this.#players.get(scope);
    if (!record) return null;
    const { player } = record;
    return {
      source: record.source,
      playing: !player.paused && !player.ended,
      muted: record.muted,
      volume: record.volume,
      currentTime: Number.isFinite(player.currentTime) ? player.currentTime : 0,
      duration: Number.isFinite(player.duration) ? player.duration : 0,
    };
  }

  getNarrationQueue() {
    const records = NARRATION_SCOPES
      .map((scope) => {
        const record = this.#players.get(scope);
        if (!record) return null;
        const { player } = record;
        return {
          scope,
          source: record.source,
          playing: !player.paused && !player.ended,
          pausedBy: record.pausedBy,
        };
      })
      .filter(Boolean);
    const active = records
      .filter((record) => record.playing)
      .sort((left, right) => PRIORITY[right.scope] - PRIORITY[left.scope])[0];
    if (!active) return records.sort((left, right) => PRIORITY[right.scope] - PRIORITY[left.scope]);

    const queue = [active];
    let interruptedScope = active.scope;
    while (interruptedScope) {
      const resumable = records
        .filter((record) => record.pausedBy === interruptedScope)
        .sort((left, right) => PRIORITY[right.scope] - PRIORITY[left.scope])[0];
      if (!resumable) break;
      queue.push(resumable);
      interruptedScope = resumable.scope;
    }
    return queue;
  }

  dispose(scope) {
    if (scope === undefined) {
      [...this.#players.keys()].forEach((key) => this.dispose(key));
      this.#stopProgress();
      this.#disposed = true;
      return;
    }
    return this.stop(scope, { resume: false });
  }

  isDisposed() {
    return this.#disposed;
  }
}

export default AudioManager;
