import { AreaLandmarkRenderer } from '../../../common/vr360/AreaLandmarkRenderer.js';
import { PointLandmarkRenderer } from '../../../common/vr360/PointLandmarkRenderer.js';
import { isAreaLandmarkPoint } from '../../../common/vr360/pointRendererRegistry.js';
import { normalizePoint } from '../../../common/vr360/pointSchema.js';

export function createLandmarkRenderer(container, onClick) {
  const renderer = new AreaLandmarkRenderer(container, {
    showPolygonOnHover: true,
    onClick,
  });
  const pointRenderer = new PointLandmarkRenderer(container, { onClick });

  function update(hotspots, camera, width, height) {
    const runtimeHotspots = hotspots.map((hotspot) => {
      const point = normalizePoint(hotspot);
      return { ...point, target_scene_id: point.targetSceneId, target_view: point.targetView, lon: point.position.lon, lat: point.position.lat, label: point.labelConfig || { text: point.label }, style: point.annotationStyle, line_height: point.lineHeight, metadata: point.content };
    });
    const annotations = runtimeHotspots.filter(isAreaLandmarkPoint).map((hotspot) => ({
      ...hotspot,
      polygon: hotspot.polygon,
      label: hotspot.labelConfig || hotspot.label,
      style: hotspot.annotationStyle,
      line_height: hotspot.lineHeight,
      show_polygon_on_hover: hotspot.showPolygonOnHover,
      metadata: hotspot.content,
    }));
    renderer.setAnnotations(annotations);
    renderer.update(camera, width, height);
    pointRenderer.setAnnotations(runtimeHotspots);
    pointRenderer.update(camera, width, height);
  }

  return { update, dispose: () => { renderer.dispose(); pointRenderer.dispose(); } };
}
