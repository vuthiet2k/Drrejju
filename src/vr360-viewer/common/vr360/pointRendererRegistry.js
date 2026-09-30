import { resolvePointKind } from './pointSchema.js';

/**
 * Shared renderer routing contract. It deliberately describes renderer
 * ownership instead of constructing framework-specific renderer instances.
 * Builder Preview and Viewer can therefore share the same dispatch decision
 * while retaining their existing DOM/Three.js implementations.
 */
export const pointRendererRegistry = Object.freeze({
  nav: { renderer: 'nav-marker', interaction: 'navigate', interactive: true },
  info: { renderer: 'info-marker', interaction: 'info-panel', interactive: true },
  gallery: { renderer: 'gallery-marker', interaction: 'info-panel', interactive: true },
  video: { renderer: 'video-marker', interaction: 'info-panel', interactive: true },
  audio: { renderer: 'audio-marker', interaction: 'poi-audio', interactive: true },
  pin: { renderer: 'pin-marker', interactive: true },
  info_area: { renderer: 'info-area', interaction: 'info-panel', interactive: true },
  area_landmark: { renderer: 'area-landmark', interaction: 'navigate', interactive: true },
  point_landmark: { renderer: 'point-landmark', interaction: 'navigate', interactive: true },
  point_landmark: { renderer: 'point-landmark', interaction: 'navigate', interactive: true },
  area: { renderer: 'area-media', interaction: 'none', interactive: false },
  generic: { renderer: 'generic-marker', interactive: true },
});

export function resolvePointRenderer(point) {
  const kind = resolvePointKind(point);
  const renderer = pointRendererRegistry[kind];
  if (!renderer) {
    if (import.meta.env?.DEV) console.warn('[POI Registry] Missing renderer mapping:', kind, point?.type, point?.id);
    return pointRendererRegistry.generic;
  }
  if (import.meta.env?.DEV) console.debug('[POI Registry] Viewer render type:', point?.id || 'unknown', kind, renderer.renderer);
  return renderer;
}

export function hasPointRenderer(point, renderer) {
  return resolvePointRenderer(point).renderer === renderer;
}

export function isMarkerPoint(point) {
  return String(resolvePointRenderer(point).renderer).endsWith('-marker');
}

export function isAreaLandmarkPoint(point) {
  return hasPointRenderer(point, 'area-landmark');
}

export function isPointLandmarkPoint(point) {
  return hasPointRenderer(point, 'point-landmark');
}

export function isAreaOverlayPoint(point) {
  return hasPointRenderer(point, 'area-media');
}

/** Navigation is a capability, not a visual marker type. Area Landmark uses
 * the same capability while keeping its own polygon renderer and events. */
export function isNavigationPoint(point) {
  return resolvePointRenderer(point).interaction === 'navigate';
}

export function isAreaAnnotationPoint(point) {
  return isAreaLandmarkPoint(point);
}

export function isInfoAreaPoint(point) {
  return hasPointRenderer(point, 'info-area');
}
