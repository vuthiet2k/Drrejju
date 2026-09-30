export const AUDIO_POI_TYPE = 'audio';

export function createAudioPoi(overrides = {}) {
  return {
    id: '',
    type: AUDIO_POI_TYPE,
    label: 'Audio',
    lon: 0,
    lat: 0,
    radius: 0,
    audio: {
      url: '',
      title: '',
      description: '',
      autoplay: false,
      loop: false,
      volume: 1,
    },
    ...overrides,
  };
}

export function isAudioPoi(point) {
  return point?.type === AUDIO_POI_TYPE || point?.pointKind === AUDIO_POI_TYPE || point?.kind === AUDIO_POI_TYPE;
}

export function normalizeAudioConfig(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    url: String(source.url || source.file || '').trim(),
    title: String(source.title || '').trim(),
    description: String(source.description || '').trim(),
    autoplay: Boolean(source.autoplay),
    loop: Boolean(source.loop),
    volume: Math.min(1, Math.max(0, Number(source.volume) || 0)),
  };
}
