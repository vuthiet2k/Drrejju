import { AUDIO_STATUS } from './constants.js';

export function createAudioSession(overrides = {}) {
  return {
    sourceType: null,
    sourceId: '',
    title: '',
    url: '',
    status: AUDIO_STATUS.IDLE,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    loop: false,
    playbackRate: 1,
    interruptedSession: null,
    pauseReason: null,
    error: null,
    ...overrides,
  };
}

export function isPlayableSession(session) {
  return Boolean(session?.url && session?.sourceType);
}
