export const AUDIO_STATUS = Object.freeze({
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  LOADING: 'loading',
  ERROR: 'error',
});

export const AUDIO_SCOPE = Object.freeze({
  TOUR: 'tour',
  SCENE: 'scene',
  POI: 'poi',
  BACKGROUND: 'background',
});

export const AUDIO_EVENT = Object.freeze({
  LOADED: 'audio:loaded',
  PLAY: 'audio:play',
  PAUSE: 'audio:pause',
  STOP: 'audio:stop',
  ENDED: 'audio:ended',
  ERROR: 'audio:error',
});

export const AUDIO_MUTE_STATE = Object.freeze({
  ON: 'on',
  OFF: 'off',
});
