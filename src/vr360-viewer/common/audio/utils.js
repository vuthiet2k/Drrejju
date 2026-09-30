export function normalizeAudioSource(source) {
  if (typeof source === 'string') return source.trim();
  if (source && typeof source.url === 'string') return source.url.trim();
  return '';
}

export function isValidAudioSource(source) {
  return Boolean(normalizeAudioSource(source));
}

export function formatDuration(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
