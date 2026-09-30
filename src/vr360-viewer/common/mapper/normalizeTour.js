import { normalizeNavStyle } from '../constants/nav.js';
import { validateTourPayload } from './validateTour.js';
import { normalizePoint } from '../vr360/pointSchema.js';
import { isNavigationPoint } from '../vr360/pointRendererRegistry.js';

const DEFAULT_VIEW = { lon: 0, lat: 0, fov: 75 };
const DEFAULT_TRANSITION = { enabled: true, effect: 'fade', duration: 1200, speed: 10, rotation: true };
const runtimeHotspotCache = new WeakMap();

function asArray(value) { return Array.isArray(value) ? value : []; }
function firstValue(...values) { return values.find((value) => value !== undefined && value !== null && value !== '') ?? ''; }
function toNumber(value, fallback = 0) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function resolveAsset(value, resolveAssetUrl) { return resolveAssetUrl ? resolveAssetUrl(value || '') : (value || ''); }
function audioValue(value) {
  if (value && typeof value === 'object') return firstValue(value.file, value.url, value.src);
  return value;
}
function normalizeNarration(value, options = {}) {
  const config = value && typeof value === 'object' ? value : {};
  const url = resolveAsset(audioValue(value), options.resolveAssetUrl);
  return {
    url,
    enabled: config.enabled !== undefined ? Boolean(config.enabled) : Boolean(url),
    autoplay: Boolean(config.tu_dong_phat ?? config.autoplay),
    duration: toNumber(config.thoi_luong_giay ?? config.duration),
    volume: toNumber(config.volume, 1),
  };
}
function sourceScenes(payload) {
  const version = payload?.version || payload;
  const source = payload?.TOUR_DATA || payload?.tour_data || payload?.data || version?.TOUR_DATA || version?.tour_data || version?.data || version || {};
  return { source, scenes: asArray(source.scenes || source.SCENES) };
}

export function normalizeView(value = {}) {
  return {
    lon: toNumber(value.lon, DEFAULT_VIEW.lon),
    lat: toNumber(value.lat, DEFAULT_VIEW.lat),
    fov: toNumber(value.fov, DEFAULT_VIEW.fov),
  };
}

function normalizeHover(raw = {}, options) {
  const hover = raw.khi_dua_chuot_vao || raw.hover || {};
  return {
    van_ban_huong_dan: firstValue(hover.van_ban_huong_dan, hover.text),
    duong_dan_thumbnail: resolveAsset(firstValue(hover.duong_dan_thumbnail, hover.thumbnail), options.resolveAssetUrl),
    hien_thi_anh_thu_nho: Boolean(hover.hien_thi_anh_thu_nho),
    raw: hover,
  };
}

export function normalizeHotspot(rawHotspot = {}, sceneIndex = 0, hotspotIndex = 0, options = {}) {
  const raw = rawHotspot;
  const point = normalizePoint(raw, {
    fallbackId: `hotspot-${sceneIndex + 1}-${hotspotIndex + 1}`,
    fallbackLabel: `Hotspot ${hotspotIndex + 1}`,
    resolveAssetUrl: options.resolveAssetUrl,
  });
  if (import.meta.env?.DEV && point.type === 'audio') {
    console.debug('[Audio Viewer] Import Audio POI', point.id, raw.type, raw.loai_poi || '');
    console.debug('[Audio Viewer] Normalize Audio POI', point.id, point.audio?.url || '');
  }
  if (import.meta.env?.DEV) {
    console.debug('[POI Runtime] Runtime type:', point.id, point.type);
    if (point.type === 'area') console.debug('[AreaMedia] Import/Runtime', point.id, point.areaMedia.type, point.areaMedia.src);
  }
  return {
    ...point,
    navStyle: normalizeNavStyle(point.navStyle),
    targetSceneId: point.targetSceneId,
    targetView: point.targetView,
    raw,
  };
}

export function normalizeScene(rawScene = {}, sceneIndex = 0, options = {}) {
  const raw = rawScene;
  const rawImage = firstValue(raw.image, raw.original_file, raw.optimized_file, raw.image_url, raw.panorama, raw.url, raw.preview_file);
  const rawThumbnail = firstValue(raw.thumb, raw.thumbnail, raw.thumbnail_file, raw.thumb_url, raw.preview_file, raw.optimized_file, rawImage);
  const view = raw.initialView || raw.view || {};
  const id = String(firstValue(raw.id, raw.key, raw.scene_key, `scene-${sceneIndex + 1}`));
  const transition = raw.transition && typeof raw.transition === 'object' ? { ...DEFAULT_TRANSITION, ...raw.transition } : { ...DEFAULT_TRANSITION };
  return {
    id, name: firstValue(raw.name, raw.title, `Scene ${sceneIndex + 1}`), group: firstValue(raw.group, 'Default'),
    imageSources: [rawImage, raw.image_url, raw.original_file, raw.optimized_file, raw.preview_file].map((value) => resolveAsset(value, options.resolveAssetUrl)).filter(Boolean).filter((value, index, values) => values.indexOf(value) === index),
    thumbnailSource: resolveAsset(rawThumbnail, options.resolveAssetUrl),
    initialView: normalizeView({ ...view, lon: view.lon ?? raw.lon, lat: view.lat ?? raw.lat, fov: view.fov ?? raw.fov }),
    transition,
    hotspots: asArray(raw.hotspots).map((hotspot, index) => normalizeHotspot(hotspot, sceneIndex, index, options)),
    // Per-scene narration removed
    metadata: { description: firstValue(raw.description, raw.info), gps: raw.gps || null },
    raw,
  };
}

export function normalizeTour(payload = {}, options = {}) {
  const { source, scenes } = sourceScenes(payload);
  const runtimeScenes = scenes.map((scene, index) => normalizeScene(scene, index, options));
  if (import.meta.env?.DEV) console.debug('[Viewer Render] normalizeTour()', runtimeScenes.length, runtimeScenes.reduce((count, scene) => count + scene.hotspots.length, 0));
  validateTourPayload(payload, runtimeScenes);
  const version = payload.version || payload;
  return {
    id: String(firstValue(version.id, source.id, payload.id, 'tour')), title: firstValue(source.title, source.name, payload.title, 'VR360 Tour'), scenes: runtimeScenes,
    initialSceneId: runtimeScenes[0]?.id || '',
    narration: normalizeNarration(firstValue(source.audio, source.narration, source.tour_audio, version.tour_audio), options),
    audio: normalizeNarration(firstValue(source.audio, source.narration, source.tour_audio, version.tour_audio), options),
    backgroundMusic: (() => {
      const config = firstValue(version.background_audio, source.background_audio, source.background_music);
      const url = resolveAsset(audioValue(config), options.resolveAssetUrl);
      return { url, enabled: config?.enabled !== undefined ? Boolean(config.enabled) : Boolean(url), volume: toNumber(config?.volume, 0.55), loop: config?.loop !== false };
    })(),
    pointHotspotLogo: resolveAsset(firstValue(version.hotspot_point_logo, source.hotspot_point_logo), options.resolveAssetUrl),
    metadata: { version, source, tour: { id: version.id, location: version.location, version_number: version.version_number, label: version.label, thumbnail: version.thumbnail, status: version.status, changelog: version.changelog, created_by: version.created_by, created_by_name: version.created_by_name, created_at: version.created_at, updated_at: version.updated_at } },
    raw: payload,
  };
}

export function runtimeHotspotForViewer(hotspot, scenes, activeScene) {
  const target = scenes.find((scene) => scene.id === hotspot.targetSceneId);
  const signature = JSON.stringify({
    id: hotspot.id,
    type: hotspot.type,
    kind: hotspot.kind,
    position: hotspot.position,
    targetSceneId: hotspot.targetSceneId,
    targetView: hotspot.targetView,
    navStyle: hotspot.navStyle,
    label: hotspot.label,
    content: hotspot.content,
    media: hotspot.media,
    areaMedia: hotspot.areaMedia,
    audio: hotspot.audio,
    hover: hotspot.hover,
    style: hotspot.style,
    geometry: hotspot.geometry,
    pinHeight: hotspot.pinHeight,
  });
  const cached = runtimeHotspotCache.get(hotspot);
  if (cached && cached.scenes === scenes && cached.activeScene === activeScene && cached.target === target && cached.signature === signature) {
    return cached.value;
  }
  // Navigation is resolved from the renderer registry. This preserves Area
  // Landmark targets without allowing Area Media to navigate.
  const canNavigate = Boolean(hotspot.targetSceneId) && isNavigationPoint(hotspot);
  const value = {
    ...hotspot, target_scene_id: canNavigate && target ? hotspot.targetSceneId : '', target_scene_name: target?.name || '', target_scene_thumbnail: target?.thumbnailSource || '', target_view: hotspot.targetView,
    lon: hotspot.position.lon, lat: hotspot.position.lat, x: hotspot.position.x, y: hotspot.position.y, label: hotspot.label, type: hotspot.type, navStyle: hotspot.navStyle,
    ...(hotspot.audio ? { audio_url: hotspot.audio.url, audio: { ...hotspot.audio } } : {}),
    // Preview assets are opted into by the per-type preview registry. Do not
    // synthesize scene thumbnails for unrelated POIs.
    preview_image: hotspot.type === 'gallery'
      ? (hotspot.media.images?.[0] || hotspot.hover.thumbnail || '')
      : '',
    info: { title: hotspot.content.title, short_description: hotspot.content.shortDescription, description: hotspot.content.description, image_url: hotspot.media.imageUrl, images: hotspot.media.images, video_url: hotspot.media.videoUrl, youtube_url: hotspot.media.youtubeUrl },
    areaMedia: hotspot.areaMedia,
    vertices: hotspot.vertices, area_points: hotspot.areaPoints, polygon: hotspot.polygon, anchor: hotspot.anchor, label_config: hotspot.labelConfig, label_position: hotspot.labelPosition, line_height: hotspot.lineHeight, show_polygon_on_hover: hotspot.showPolygonOnHover, style: hotspot.annotationStyle || hotspot.style, glow: hotspot.style.glow, khi_dua_chuot_vao: hotspot.hover, loai_poi: hotspot.loaiPoi, chieu_cao_duong_ghim: hotspot.pinHeight,
  };
  if (import.meta.env?.DEV) console.debug('[POI Viewer] Viewer render type:', hotspot.id, hotspot.type);
  runtimeHotspotCache.set(hotspot, { activeScene, scenes, signature, target, value });
  if (import.meta.env?.DEV) console.debug('[Viewer Render] runtimeHotspotForViewer()', hotspot.id);
  if (import.meta.env?.DEV && hotspot.type === 'area') console.debug('[AreaMedia] runtimeHotspotForViewer', hotspot.id, hotspot.areaMedia?.src || '');
  return value;
}

/**
 * Compatibility projection for legacy host templates. Input normalization
 * remains exclusively in normalizeTour(); this only exposes established
 * display aliases while legacy routes are retained for rollback.
 */
export function legacySceneForViewer(scene, scenes = []) {
  return {
    ...scene.raw,
    id: scene.id,
    name: scene.name,
    group: scene.group,
    description: scene.metadata.description,
    imageSources: scene.imageSources,
    original_file: scene.imageSources[0] || '',
    thumbnail: scene.thumbnailSource,
    thumbnail_file: scene.thumbnailSource,
    view: scene.initialView,
    initialView: scene.initialView,
    hotspots: scene.hotspots.map((hotspot) => runtimeHotspotForViewer(hotspot, scenes, scene)),
  };
}
