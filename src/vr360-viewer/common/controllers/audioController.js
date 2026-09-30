import AudioManager from '../audio/AudioManager.js';
import { AUDIO_SCOPE } from '../audio/constants.js';

// Compatibility adapter for the existing layout API. HTMLAudioElement access
// remains exclusively inside AudioManager.
export function createAudioController(options = {}) {
  const manager = options.manager || new AudioManager(options);

  return {
    manager,
    preload: (source, scope = AUDIO_SCOPE.SCENE) => manager.preload(source, scope),
    preloadWithOptions: (source, scope, options) => manager.preload(source, scope, options),
    play: (source, scope, options) => manager.play(source, scope, options),
    playNarration: (source, scope, options) => manager.playNarration(source, scope, options),
    playScene: (source) => manager.play(source, AUDIO_SCOPE.SCENE),
    pauseScene: () => manager.pause(AUDIO_SCOPE.SCENE),
    resumeScene: () => manager.resume(AUDIO_SCOPE.SCENE),
    stopScene: () => manager.stop(AUDIO_SCOPE.SCENE),
    pause: (scope) => manager.pause(scope),
    resume: (scope) => manager.resume(scope),
    stop: (scope, options) => manager.stop(scope, options),
    playBackground: async (source, options = {}) => {
      if (!source) {
        manager.stop(AUDIO_SCOPE.BACKGROUND);
        return { playing: false, blocked: false };
      }
      return manager.play(source, AUDIO_SCOPE.BACKGROUND, { loop: true, ...options });
    },
    toggleBackground: async () => {
      if (manager.isPlaying(AUDIO_SCOPE.BACKGROUND)) {
        return manager.pause(AUDIO_SCOPE.BACKGROUND);
      }
      return manager.resume(AUDIO_SCOPE.BACKGROUND);
    },
    playHotspot: (source, options = {}) => {
      if (!source) return Promise.resolve();
      return manager.playNarration(source, AUDIO_SCOPE.POI, options);
    },
    seek: (time, scope) => manager.seek(time, scope),
    mute: (scope) => manager.mute(scope),
    unmute: (scope) => manager.unmute(scope),
    setVolume: (volume, scope) => manager.setVolume(volume, scope),
    setPlaybackRate: (rate, scope) => manager.setPlaybackRate(rate, scope),
    setMasterVolume: (volume) => manager.setMasterVolume(volume),
    getMasterVolume: () => manager.getMasterVolume(),
    setLoop: (loop, scope) => manager.setLoop(loop, scope),
    getPlaybackState: (scope) => manager.getPlaybackState(scope),
    getNarrationQueue: () => manager.getNarrationQueue(),
    resumeInterrupted: (scope) => manager.resumeInterrupted(scope),
    stopAll: () => manager.stop(),
    dispose: () => manager.dispose(),
  };
}
