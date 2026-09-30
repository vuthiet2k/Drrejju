import { AreaMediaRenderer } from '../vr360/AreaMediaRenderer.js';
import { isAreaOverlayPoint } from '../vr360/pointRendererRegistry.js';

export function createAreaMediaRenderer(scene) {
  const renderer = new AreaMediaRenderer(scene);
  return {
    update(hotspots) {
      if (import.meta.env?.DEV) console.debug('[AreaMedia] Viewer renderer update', hotspots.filter(isAreaOverlayPoint).map((point) => ({ id: point.id, type: point.areaMedia?.type, src: point.areaMedia?.src })));
      renderer.setAreas(hotspots);
    },
    dispose: () => renderer.dispose(),
  };
}
