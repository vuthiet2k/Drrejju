import * as THREE from 'three';
import { isPointLandmarkPoint } from './pointRendererRegistry.js';
import { LandmarkPresentation, projectLonLat } from './LandmarkPresentation.js';

/**
 * Renders canonical point landmarks through the shared presentation layer.
 * The click callback receives the current runtime annotation, including
 * target_scene_id for the viewer navigation contract.
 */
export class PointLandmarkRenderer {
  constructor(container, options = {}) {
    this.annotations = [];
    this.presentation = new LandmarkPresentation(container, options);
    this.vector = null;
  }
  setAnnotations(items = []) { this.annotations = items.filter(isPointLandmarkPoint); }
  update(camera, width, height) { const ids = new Set(); const direction = camera.getWorldDirection(new THREE.Vector3()); this.annotations.forEach((annotation, index) => { const id = String(annotation.id || index); ids.add(id); const item = this.presentation.upsert(id, annotation); const position = projectLonLat({ ...annotation, lon: annotation.lon ?? annotation.position?.lon, lat: annotation.lat ?? annotation.position?.lat }, camera, width, height, new THREE.Vector3(), new THREE.Vector3(), direction); this.presentation.update(item, position, annotation, width, height); }); this.presentation.removeMissing(ids); }
  dispose() { this.presentation.dispose(); }
}
