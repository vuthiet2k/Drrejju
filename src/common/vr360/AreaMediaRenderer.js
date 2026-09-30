import * as THREE from 'three';
import { isAreaOverlayPoint } from './pointRendererRegistry.js';
import { normalizeLandmarkVertices } from './pointSchema.js';

const OVERLAY_RADIUS = 499;

function pointToVector(point) {
  const phi = THREE.MathUtils.degToRad(90 - Number(point.lat || 0));
  const theta = THREE.MathUtils.degToRad(Number(point.lon || 0));
  return new THREE.Vector3(
    OVERLAY_RADIUS * Math.sin(phi) * Math.cos(theta),
    OVERLAY_RADIUS * Math.cos(phi),
    OVERLAY_RADIUS * Math.sin(phi) * Math.sin(theta),
  );
}

function geometryForArea(area) {
  const vertices = normalizeLandmarkVertices(area);
  if (vertices.length < 3) return null;

  const positions = vertices.map(pointToVector);
  const normal = positions.reduce((sum, position) => sum.add(position), new THREE.Vector3()).normalize();
  if (!normal.lengthSq()) return null;
  const reference = Math.abs(normal.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const axisX = new THREE.Vector3().crossVectors(reference, normal).normalize();
  const axisY = new THREE.Vector3().crossVectors(normal, axisX).normalize();
  const center = normal.clone().multiplyScalar(OVERLAY_RADIUS);
  const planar = positions.map((position) => {
    const relative = position.clone().sub(center);
    return new THREE.Vector2(relative.dot(axisX), relative.dot(axisY));
  });
  const triangles = THREE.ShapeUtils.triangulateShape(planar, []);
  if (!triangles.length) return null;

  const minX = Math.min(...planar.map((point) => point.x));
  const maxX = Math.max(...planar.map((point) => point.x));
  const minY = Math.min(...planar.map((point) => point.y));
  const maxY = Math.max(...planar.map((point) => point.y));
  const spanX = Math.max(maxX - minX, Number.EPSILON);
  const spanY = Math.max(maxY - minY, Number.EPSILON);
  const geometry = new THREE.BufferGeometry();
  const positionData = [];
  const uvData = [];
  triangles.forEach((triangle) => {
    triangle.forEach((index) => {
      const position = positions[index];
      const point = planar[index];
      positionData.push(position.x, position.y, position.z);
      uvData.push((point.x - minX) / spanX, (point.y - minY) / spanY);
    });
  });
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionData, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvData, 2));
  geometry.userData.areaAspect = spanX / spanY;
  geometry.computeVertexNormals();
  return geometry;
}

function textureForMedia(media, onImageLoad) {
  if (media.type === 'video') {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'metadata';
    video.addEventListener('error', () => {
      if (import.meta.env?.DEV) {
        console.warn('[AreaMedia] Texture failed', 'video', media.src || '', video.error?.code || 'unknown');
      }
    });
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { texture, video };
  }
  const texture = new THREE.TextureLoader().load(
    media.src || '',
    onImageLoad,
    undefined,
    () => {
      if (import.meta.env?.DEV) console.warn('[AreaMedia] Texture failed', 'image', media.src || '');
    },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, video: null };
}

function mediaAspect(item) {
  const source = item.video || item.texture?.image;
  const width = Number(source?.videoWidth || source?.naturalWidth || source?.width || 0);
  const height = Number(source?.videoHeight || source?.naturalHeight || source?.height || 0);
  return width > 0 && height > 0 ? width / height : 1;
}

function applyFitMode(item, media) {
  if (!item) return;
  const texture = item.texture;
  if (!texture) return;
  const fitMode = media.fitMode || 'cover';
  const areaAspect = item.mesh.geometry.userData.areaAspect || 1;
  const sourceAspect = mediaAspect(item);
  let repeatX = 1;
  let repeatY = 1;

  // UV cropping gives Area Media a poster/billboard cover fit without
  // creating a DOM overlay. `contain` and `fill` keep the complete source.
  if (fitMode === 'cover') {
    if (sourceAspect > areaAspect) repeatX = areaAspect / sourceAspect;
    else repeatY = sourceAspect / areaAspect;
  }
  texture.repeat.set(repeatX, repeatY);
  texture.offset.set((1 - repeatX) / 2, (1 - repeatY) / 2);
  texture.needsUpdate = true;
}

function createCornerMask(radius) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const pixelRadius = Math.min(size / 2, Math.max(0, Number(radius) || 0) * size / 100);
  context.fillStyle = '#fff';
  context.beginPath();
  if (typeof context.roundRect === 'function') context.roundRect(0, 0, size, size, pixelRadius);
  else context.rect(0, 0, size, size);
  context.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function releaseItem(item) {
  item.video?.pause();
  item.video?.removeAttribute('src');
  item.video?.load();
  item.mesh?.removeFromParent();
  item.mesh?.geometry.dispose();
  item.mesh?.material.dispose();
  item.texture?.dispose();
  item.cornerMask?.dispose();
}

/**
 * Renders Area Media as a triangulated texture mesh inside the panorama.
 * It intentionally owns no DOM interaction layer, so it never captures a
 * panorama drag gesture or becomes a marker/hotspot.
 */
export class AreaMediaRenderer {
  constructor(scene) {
    this.scene = scene;
    this.items = new Map();
  }

  setAreas(areas = []) {
    const activeIds = new Set();
    areas.filter(isAreaOverlayPoint).forEach((area, index) => {
      const id = String(area.id || index);
      activeIds.add(id);
      this._upsert(id, area);
    });
    for (const [id, item] of this.items) {
      if (!activeIds.has(id)) {
        releaseItem(item);
        this.items.delete(id);
      }
    }
  }

  _upsert(id, area) {
    const media = area.areaMedia || {};
    const source = media.src || '';
    const signature = JSON.stringify({
      source,
      type: media.type || 'image',
      vertices: normalizeLandmarkVertices(area),
    });
    let item = this.items.get(id);
    if (!source) {
      if (import.meta.env?.DEV) console.debug('[AreaMedia] Renderer skip empty source', id);
      if (item) {
        releaseItem(item);
        this.items.delete(id);
      }
      return;
    }
    if (!item || item.signature !== signature) {
      if (item) releaseItem(item);
      const geometry = geometryForArea(area);
      if (!geometry) return;
      const mediaSource = { ...media, src: source };
      const { texture, video } = textureForMedia(
        mediaSource,
        () => applyFitMode(this.items.get(id), mediaSource),
      );
      if (import.meta.env?.DEV) console.debug('[AreaMedia] Texture create', id, mediaSource.type, source);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      // Area Media is visual-only. Keep it out of every picking path so it
      // cannot ever intercept a panorama or Area Landmark interaction.
      mesh.raycast = () => {};
      mesh.renderOrder = 10 + Number(media.zIndex || 0);
      this.scene.add(mesh);
      item = { signature, mesh, texture, video, cornerMask: null, source: '', mediaType: '', configSignature: '' };
      this.items.set(id, item);
    }

    const configSignature = JSON.stringify(media);
    if (item.configSignature === configSignature) return;
    item.configSignature = configSignature;
    const material = item.mesh.material;
    material.opacity = Math.min(1, Math.max(0, Number(media.opacity ?? 1)));
    material.color.set(media.tint || '#ffffff');
    material.color.multiplyScalar(Math.min(2, Math.max(0, Number(media.brightness ?? 1))));
    item.mesh.renderOrder = 10 + Number(media.zIndex || 0);
    const radius = Math.max(0, Number(media.borderRadius) || 0);
    item.cornerMask?.dispose();
    item.cornerMask = radius ? createCornerMask(radius) : null;
    material.alphaMap = item.cornerMask;
    material.needsUpdate = true;
    applyFitMode(item, media);
    if (item.video) {
      item.video.src = source;
      item.video.loop = media.loop !== false;
      item.video.muted = media.muted !== false;
      item.video.defaultMuted = item.video.muted;
      item.video.playbackRate = Number(media.playbackRate) || 1;
      item.video.poster = media.poster || '';
      item.video.addEventListener('loadedmetadata', () => applyFitMode(item, media), { once: true });
      if (media.autoplay !== false) item.video.play().catch(() => {});
    }
  }

  dispose() {
    if (import.meta.env?.DEV) console.debug('[AreaMedia] Dispose', this.items.size);
    this.items.forEach(releaseItem);
    this.items.clear();
  }
}
