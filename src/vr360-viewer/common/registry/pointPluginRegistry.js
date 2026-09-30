import { resolvePointKind } from '../vr360/pointSchema.js';

const tooltip = (point) => ({
  kind: 'tooltip',
  title: point.content?.title || point.label || '',
  description: point.content?.shortDescription || '',
});
const noPreview = () => ({ kind: 'none' });

export const pointPreviewRegistry = Object.freeze({
  info: tooltip,
  gallery: tooltip,
  video: noPreview,
  audio: tooltip,
  nav: tooltip,
  area: noPreview,
  area_landmark: tooltip,
  point_landmark: tooltip,
  point_landmark: tooltip,
  pin: tooltip,
  generic: noPreview,
});

export const pointPopupRegistry = Object.freeze({
  info: 'info',
  gallery: 'image',
  video: 'video',
  area: 'area',
  info_area: 'info',
});

export const pointVisualRegistry = Object.freeze({
  nav: { nav: true, audio: false, info: false },
  info: { nav: false, audio: false, info: true },
  gallery: { nav: false, audio: false, info: false },
  video: { nav: false, audio: false, info: false, video: true },
  audio: { nav: false, audio: true, info: false },
  area: { nav: false, audio: false, info: false },
  area_landmark: { nav: false, audio: false, info: false },
  point_landmark: { nav: false, audio: false, info: false },
  point_landmark: { nav: false, audio: false, info: false },
  pin: { nav: false, audio: false, info: false },
  generic: { nav: false, audio: false, info: false },
});

export function resolvePointVisual(point) {
  return pointVisualRegistry[resolvePointKind(point)] || pointVisualRegistry.generic;
}

export function resolvePointPreview(point) {
  return (pointPreviewRegistry[resolvePointKind(point)] || noPreview)(point);
}

export const pointInteractionRegistry = Object.freeze({
  audio: (point, context) => context.playAudio(point),
  nav: (point, context) => context.navigate(point),
  area_landmark: (point, context) => context.navigate(point),
  point_landmark: (point, context) => context.navigate(point),
  point_landmark: (point, context) => context.navigate(point),
  info: (point, context) => context.openPopup('info', point),
  gallery: (point, context) => context.openPopup('image', point),
  video: (point, context) => context.openPopup('video', point),
  area: () => {},
  info_area: (point, context) => context.openPopup('info', point),
  pin: () => {},
  generic: () => {},
});

export function dispatchPointInteraction(point, context) {
  return (pointInteractionRegistry[resolvePointKind(point)] || pointInteractionRegistry.generic)(point, context);
}
