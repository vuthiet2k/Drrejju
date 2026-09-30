import { normalizePoint } from './pointSchema.js';

/**
 * Compatibility view for the two legacy Vue viewers. The runtime source is
 * still normalizePoint(); these aliases exist only for their existing
 * templates and click handlers while those views are retired.
 */
export function normalizeLegacyPoint(rawPoint = {}, options = {}) {
  const point = normalizePoint(rawPoint, options);
  return {
    ...point.raw,
    id: point.id,
    kind: point.kind,
    type: point.type,
    pointKind: point.kind,
    label: point.label,
    navStyle: point.navStyle || 'default',
    target_scene_id: point.targetSceneId,
    target_view: point.targetView,
    lon: point.position.lon,
    lat: point.position.lat,
    x: point.position.x,
    y: point.position.y,
    audio_url: point.audio.url,
    area_points: point.areaPoints,
    polygon: point.polygon,
    vertices: point.vertices,
    anchor: point.anchor,
    line_height: point.lineHeight,
    label_position: point.labelPosition,
    show_polygon_on_hover: point.showPolygonOnHover,
    style: point.annotationStyle || point.style,
    glow: point.style.glow,
    info: {
      title: point.content.title,
      description: point.content.description,
      image_url: point.media.imageUrl,
      video_url: point.media.videoUrl,
      youtube_url: point.media.youtubeUrl,
    },
  };
}
