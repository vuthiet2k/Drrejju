import * as THREE from 'three';
import {
  isInfoAreaPoint,
  isMarkerPoint,
  isPointLandmarkPoint,
  resolvePointRenderer,
} from '../vr360/pointRendererRegistry.js';

function lonLatToVector(lon, lat, radius = 500) {
  const phi = THREE.MathUtils.degToRad(90 - Number(lat || 0));
  const theta = THREE.MathUtils.degToRad(Number(lon || 0));
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createProjector(camera, width, height) {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  return (item) => {
    const worldPosition = lonLatToVector(item.lon, item.lat);
    const directionToPoint = worldPosition.clone().normalize();
    const isInFront = cameraDirection.dot(directionToPoint) > 0;
    const screenPosition = worldPosition.clone().project(camera);
    return {
      visible: isInFront && screenPosition.z > -1 && screenPosition.z < 1
        && screenPosition.x >= -1.2 && screenPosition.x <= 1.2
        && screenPosition.y >= -1.2 && screenPosition.y <= 1.2,
      screenX: (screenPosition.x * 0.5 + 0.5) * width,
      screenY: (-screenPosition.y * 0.5 + 0.5) * height,
    };
  };
}

export function projectViewerPoints(hotspots, camera, width, height, youtubeEmbedUrl) {
  const projectLonLat = createProjector(camera, width, height);
  const markers = hotspots
    .filter((hotspot) => {
      const result = !isPointLandmarkPoint(hotspot) && (
        isMarkerPoint(hotspot) || resolvePointRenderer(hotspot).renderer === 'audio-marker'
      );
      return result;
    })
    .map((hotspot, index) => ({
      ...hotspot,
      index,
      // Point IDs originate from persisted tour data and are not guaranteed
      // unique. The render key must identify this concrete list entry so Vue
      // never reuses a navigation marker DOM node at another position.
      renderKey: `${hotspot.id}:${index}`,
      ...projectLonLat(hotspot),
    }))
    .filter((hotspot) => hotspot.visible);

  const infoAreas = hotspots
    .filter((hotspot) => isInfoAreaPoint(hotspot) && Array.isArray(hotspot.area_points))
    .map((hotspot, index) => {
      const projectedPoints = hotspot.area_points.map(projectLonLat);
      const visiblePoints = projectedPoints.filter((point) => point.visible);
      const minimumPoints = hotspot.isDraft ? 2 : 3;
      const allPointsVisible = projectedPoints.length > 0 && visiblePoints.length === projectedPoints.length;
      const xs = projectedPoints.map((point) => point.screenX);
      const ys = projectedPoints.map((point) => point.screenY);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;
      const crossesScreenEdge = boxWidth > width * 0.72 || boxHeight > height * 0.72;
      const canRenderDraft = hotspot.isDraft && projectedPoints.length >= minimumPoints && visiblePoints.length >= minimumPoints;
      const canRenderArea = !hotspot.isDraft && projectedPoints.length >= minimumPoints && allPointsVisible && !crossesScreenEdge;
      const drawablePoints = hotspot.isDraft ? visiblePoints : projectedPoints;
      const clipPoints = drawablePoints.map((point) => {
        const x = boxWidth ? ((point.screenX - minX) / boxWidth) * 100 : 0;
        const y = boxHeight ? ((point.screenY - minY) / boxHeight) * 100 : 0;
        return `${Math.min(100, Math.max(0, x)).toFixed(2)}% ${Math.min(100, Math.max(0, y)).toFixed(2)}%`;
      });
      return {
        ...hotspot, index, visible: canRenderDraft || canRenderArea,
        polygonPoints: drawablePoints.map((point) => `${point.screenX},${point.screenY}`).join(' '),
        mediaClipPath: clipPoints.length >= 3 ? `polygon(${clipPoints.join(', ')})` : '',
        box: { left: minX, top: minY, width: boxWidth, height: boxHeight },
        mediaBox: { left: minX, top: minY, width: boxWidth, height: boxHeight },
        youtube_embed_url: youtubeEmbedUrl(hotspot.info?.youtube_url),
      };
    })
    .filter((area) => area.visible);

  return { markers, infoAreas };
}
