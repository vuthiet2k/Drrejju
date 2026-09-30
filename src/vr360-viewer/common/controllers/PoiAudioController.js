import { AUDIO_SCOPE } from '../audio/constants.js';

function debug(...args) {
  if (import.meta.env?.DEV) console.debug('[Audio Controller]', ...args);
}

/**
 * POI boundary: accepts a normalized runtime point and translates it into a
 * command for the single AudioManager instance owned by the Viewer layout.
 */
export function createPoiAudioController({ manager } = {}) {
  return Object.freeze({
    play(point = {}) {
      const audio = point.audio || {};
      const source = audio.url || point.audio_url || '';
      if (!source || audio.enabled === false) {
        debug('POI Play skipped', point.id || 'unknown', 'no enabled audio source');
        return Promise.resolve({ status: 'stopped', source });
      }
      debug('POI Play', point.id || 'unknown');
      return manager.playNarration(source, AUDIO_SCOPE.POI, {
        sourceId: point.id,
        title: audio.title || point.label || 'Audio POI',
        volume: audio.volume,
        loop: audio.loop,
        playbackRate: audio.playbackRate,
      });
    },
  });
}

export default createPoiAudioController;
