const POI_KIND_BY_LEGACY_TYPE = {
  chuyen_canh: 'nav',
  thong_tin_van_ban: 'info',
  thu_vien_anh: 'gallery',
  phat_video: 'video',
  audio: 'audio',
  ghim_dia_danh: 'pin',
};

const TYPE_ALIASES = {
  nav: 'nav',
  navigate: 'nav',
  navigation: 'nav',
  chuyen_canh: 'nav',
  info: 'info',
  text: 'info',
  text_info: 'info',
  gallery: 'gallery',
  image_gallery: 'gallery',
  video: 'video',
  video_poi: 'video',
  audio: 'audio',
  pin: 'pin',
  pin_marker: 'pin',
  landmark: 'area_landmark',
  'landmark-area': 'area_landmark',
  place: 'area_landmark',
  point_landmark: 'point_landmark',
  area: 'area',
  image_area: 'area',
  image_overlay: 'area',
  'area-media': 'area',
  point: 'generic',
  poi: 'generic',
  generic: 'generic',
};

// Canonical dispatch keys.  Persisted aliases are accepted below, but all
// newly-created and normalized points use one of these keys so that a point
// can never select an editor/renderer by accident through a shared fallback.
export const POINT_TYPES = Object.freeze({
  NAV: 'nav',
  INFO: 'info',
  GALLERY: 'gallery',
  VIDEO: 'video',
  AUDIO: 'audio',
  PIN: 'pin',
  AREA_LANDMARK: 'area_landmark',
  POINT_LANDMARK: 'point_landmark',
  AREA: 'area',
  INFO_AREA: 'info_area',
  GENERIC: 'generic',
});

export function clonePointValue(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

export function createPoint(kind, { id, lon = 0, lat = 0, index = 0 } = {}) {
  const type = resolvePointKind({ type: kind });
  const point = {
    id: id || `hotspot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    lon: Number(lon) || 0,
    lat: Number(lat) || 0,
    label: type === 'nav' ? `Lối đi ${index + 1}` : `Hotspot ${index + 1}`,
    target: '',
    type,
    icon: type === 'nav' ? 'dot' : null,
    locked: false,
    khi_dua_chuot_vao: { hien_thi_anh_thu_nho: false, duong_dan_thumbnail: '', van_ban_huong_dan: '' },
    entryView: null,
  };
  if (type === 'nav') point.navStyle = 'default';
  if (type === 'audio') point.audio = { enabled: false, url: '', title: '', description: '', volume: 1, autoplay: false, loop: false, playbackRate: 1 };
  if (type === 'info') { point.loai_poi = 'thong_tin_van_ban'; point.noi_dung = { tieu_de: '', mo_ta: '', anh_minh_hoa: '', lien_ket: '' }; }
  if (type === 'gallery') { point.loai_poi = 'thu_vien_anh'; point.noi_dung = { tieu_de: '', danh_sach_anh: [] }; }
  if (type === 'video') { point.loai_poi = 'phat_video'; point.noi_dung = { url_video: '', tieu_de: '', tu_dong_phat: false }; }
  if (type === 'area') point.areaMedia = { type: 'image', src: '', opacity: 1, brightness: 1, borderRadius: 0, tint: '', fitMode: 'cover', loop: true, muted: true, autoplay: true, poster: '', playbackRate: 1, zIndex: 0 };
  if (type === 'pin') point.loai_poi = 'ghim_dia_danh';
  return point;
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mediaSource(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  return firstValue(value.url, value.src, value.file, value.image_url, value.imageUrl);
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? '';
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizePointCoordinates(points) {
  return asArray(points).map((point) => ({
    ...asObject(point),
    lon: toNumber(point?.lon),
    lat: toNumber(point?.lat),
  }));
}

export function calculateLandmarkAnchor(vertices = []) {
  if (!vertices.length) return { lon: 0, lat: 0 };
  const total = vertices.reduce((sum, point) => {
    const phi = (90 - point.lat) * (Math.PI / 180);
    const theta = point.lon * (Math.PI / 180);
    return {
      x: sum.x + Math.sin(phi) * Math.cos(theta),
      y: sum.y + Math.cos(phi),
      z: sum.z + Math.sin(phi) * Math.sin(theta),
    };
  }, { x: 0, y: 0, z: 0 });
  const length = Math.hypot(total.x, total.y, total.z);
  if (!length) return { lon: 0, lat: 0 };
  return {
    lon: Math.atan2(total.z, total.x) * (180 / Math.PI),
    lat: Math.asin(total.y / length) * (180 / Math.PI),
  };
}

export function normalizeLandmarkVertices(rawPoint = {}) {
  const raw = asObject(rawPoint);
  return normalizePointCoordinates(firstValue(raw.vertices, raw.polygon, raw.area_points, raw.areaPoints));
}

/**
 * Resolves the canonical point kind without mutating the persisted point type.
 * `type` remains a backwards-compatible storage field while `kind` is the
 * single dispatch key for editors and renderers.
 */
export function resolvePointKind(rawPoint = {}) {
  const raw = asObject(rawPoint);
  const sourceType = String(firstValue(raw.type, raw.poiType, raw.kind, raw.category)).toLowerCase();
  // A persisted Landmark may already use the canonical `vertices` field
  // while still carrying the old pin type. Treat all supported geometry
  // aliases as the same Landmark evidence so it reaches the shared runtime.
  const landmarkVertices = firstValue(raw.vertices, raw.polygon, raw.area_points, raw.areaPoints);
  const hasPolygon = asArray(landmarkVertices).length >= 3;
  const poiKind = POI_KIND_BY_LEGACY_TYPE[raw.loai_poi];

  if (sourceType === 'area_landmark') return 'area_landmark';
  if (sourceType === 'point_landmark') return 'point_landmark';
  if (sourceType === 'area' || sourceType === 'image_area' || sourceType === 'image_overlay' || sourceType === 'area-media') return 'area';
  if (sourceType === 'info_area') return 'info_area';
  // Persisted Builder/API records may retain the generic `poi` type while
  // storing the concrete POI kind in `loai_poi`. The concrete kind must win,
  // especially for Audio POI, otherwise the runtime dispatches it as generic.
  if (poiKind && (sourceType === 'poi' || !sourceType || sourceType === 'generic')) {
    return poiKind === 'pin' ? (hasPolygon ? 'area_landmark' : 'pin') : poiKind;
  }
  if (['nav', 'navigate', 'navigation', 'chuyen_canh', 'info', 'text', 'text_info', 'gallery', 'image_gallery', 'video', 'video_poi', 'audio', 'pin', 'pin_marker', 'landmark', 'landmark-area', 'place', 'point_landmark', 'area', 'image_area', 'image_overlay'].includes(sourceType)) {
    return TYPE_ALIASES[sourceType];
  }

  if (poiKind === 'pin') return hasPolygon ? 'area_landmark' : 'pin';
  return poiKind || TYPE_ALIASES[sourceType] || 'generic';
}

export function legacyTypeForPointKind(kind, raw = {}) {
  if (raw.type) return raw.type;
  if (kind === 'nav') return 'nav';
  if (kind === 'info_area') return 'info_area';
  if (kind === 'area_landmark') return 'area_landmark';
  return 'poi';
}

/**
 * Converts every accepted persisted point variant into one non-lossy runtime
 * contract. Unknown fields remain available through both the spread result and
 * `raw`, so normalization never discards API extensions.
 */
export function normalizePoint(rawPoint = {}, options = {}) {
  const raw = asObject(rawPoint);
  const kind = resolvePointKind(raw);
  const legacyContent = asObject(raw.noi_dung);
  const info = asObject(raw.info);
  const hoverRaw = asObject(firstValue(raw.khi_dua_chuot_vao, raw.hover));
  const style = asObject(raw.style);
  const isPolygonArea = kind === 'area_landmark' || kind === 'area';
  const vertices = isPolygonArea ? normalizeLandmarkVertices(raw) : [];
  const polygon = isPolygonArea ? vertices : normalizePointCoordinates(firstValue(raw.polygon, raw.area_points, raw.areaPoints));
  const areaPoints = isPolygonArea ? vertices : normalizePointCoordinates(firstValue(raw.area_points, raw.areaPoints, raw.polygon));
  const computedAnchor = isPolygonArea ? calculateLandmarkAnchor(vertices) : null;
  const anchorRaw = asObject(raw.anchor);
  const anchor = computedAnchor || (raw.anchor ? { lon: toNumber(anchorRaw.lon), lat: toNumber(anchorRaw.lat) } : null);
  const fallbackId = options.fallbackId || 'hotspot';
  const resolveAsset = options.resolveAssetUrl || ((value) => value || '');
  const label = firstValue(
    typeof raw.label === 'string' ? raw.label : '',
    raw.title,
    legacyContent.tieu_de,
    info.title,
    options.fallbackLabel,
  );

  const normalized = {
    ...raw,
    id: String(firstValue(raw.id, raw.key, fallbackId)),
    // Canonical runtime type. Builder adapter below restores the persisted type.
    type: kind,
    kind,
    poiType: firstValue(raw.poiType, raw.loai_poi) || null,
    loaiPoi: raw.loai_poi ?? null,
    position: {
      lon: toNumber(firstValue(anchor?.lon, raw.lon, raw.position?.lon)),
      lat: toNumber(firstValue(anchor?.lat, raw.lat, raw.position?.lat)),
      x: toNumber(firstValue(raw.x, raw.position?.x), 50),
      y: toNumber(firstValue(raw.y, raw.position?.y), 50),
    },
    targetSceneId: String(firstValue(raw.target_scene_id, raw.targetSceneId, raw.target, raw.scene_id)),
    targetView: firstValue(raw.target_view, raw.targetView, raw.entryView, raw.view) || null,
    entryView: raw.entryView || null,
    label,
    labelConfig: typeof raw.label === 'object' ? { ...raw.label } : { text: label },
    icon: raw.icon ?? null,
    navStyle: raw.navStyle || raw.nav_style || null,
    geometry: { vertices: isPolygonArea ? vertices : undefined, polygon, areaPoints, anchor },
    vertices: isPolygonArea ? vertices : undefined,
    polygon,
    areaPoints,
    anchor,
    // Landmark labels are always anchored to the computed screen position.
    // This legacy field is retained only for non-landmark points.
    labelPosition: isPolygonArea ? null : (raw.labelPosition || raw.label_position || null),
    lineHeight: toNumber(raw.line_height ?? raw.lineHeight, 48),
    pinHeight: raw.chieu_cao_duong_ghim ?? null,
    showPolygonOnHover: raw.show_polygon_on_hover !== false,
    content: {
      title: firstValue(legacyContent.tieu_de, info.title, raw.info_title, raw.title, label),
      shortDescription: firstValue(
        legacyContent.mo_ta_ngan,
        legacyContent.short_description,
        info.short_description,
        info.shortDescription,
        raw.info_short_description,
        raw.short_description,
      ),
      description: firstValue(legacyContent.mo_ta, info.description, raw.info_description, raw.description),
      link: firstValue(legacyContent.lien_ket, info.link, raw.link),
    },
    media: {
      imageUrl: resolveAsset(mediaSource(firstValue(legacyContent.anh_minh_hoa, info.image_url, raw.info_image_url, raw.image_url, raw.image))),
      images: [...new Set([
        mediaSource(legacyContent.anh_minh_hoa),
        ...asArray(firstValue(legacyContent.danh_sach_anh, raw.images, info.images)).map(mediaSource),
      ].map((value) => resolveAsset(value)).filter(Boolean))],
      videoUrl: resolveAsset(firstValue(legacyContent.url_video, info.video_url, raw.info_video_url, raw.video_url)),
      youtubeUrl: firstValue(
        legacyContent.youtube_url,
        legacyContent.youtubeUrl,
        info.youtube_url,
        info.youtubeUrl,
        raw.info_youtube_url,
        raw.youtube_url,
        raw.youtubeUrl,
      ),
      previewUrl: resolveAsset(firstValue(raw.preview_image, raw.preview, raw.image_url)),
      overlayImageUrl: resolveAsset(firstValue(raw.overlay_image, raw.overlayImage, legacyContent.anh_minh_hoa, raw.image_url, raw.image)),
    },
    areaMedia: (() => {
      const media = asObject(firstValue(raw.areaMedia, raw.area_media, raw.media));
      const source = resolveAsset(firstValue(media.src, media.url, media.imageUrl, media.videoUrl, raw.overlay_video, raw.overlay_image, raw.overlayImage));
      const type = String(firstValue(media.type, raw.overlay_video ? 'video' : '')).toLowerCase() === 'video' ? 'video' : 'image';
      return {
        type,
        src: source,
        opacity: Math.min(1, Math.max(0, toNumber(media.opacity, style.opacity ?? 1))),
        brightness: Math.min(2, Math.max(0, toNumber(media.brightness, 1))),
        borderRadius: Math.max(0, toNumber(media.borderRadius, media.border_radius ?? 0)),
        tint: firstValue(media.tint, ''),
        fitMode: ['contain', 'cover', 'fill'].includes(media.fitMode) ? media.fitMode : 'cover',
        loop: media.loop !== false,
        muted: media.muted !== false,
        autoplay: media.autoplay !== false,
        poster: resolveAsset(firstValue(media.poster, '')),
        playbackRate: Math.min(4, Math.max(0.25, toNumber(media.playbackRate, 1))),
        zIndex: toNumber(media.zIndex, 0),
        ...(firstValue(media.fileName, media.name) ? { fileName: firstValue(media.fileName, media.name) } : {}),
        ...(Number.isFinite(Number(media.fileSize)) ? { fileSize: Number(media.fileSize) } : {}),
        ...(Number.isFinite(Number(media.duration)) ? { duration: Number(media.duration) } : {}),
      };
    })(),
    audio: (() => {
      const hasLegacyAudio = Boolean(raw.audio_url || raw.audio || legacyContent.audio);
      if (kind !== 'audio' && !hasLegacyAudio) return null;
      const audio = raw.audio && typeof raw.audio === 'object' ? raw.audio : {};
      const url = resolveAsset(mediaSource(firstValue(audio.url, audio.file, raw.audio_url, raw.audio, legacyContent.audio)));
      return {
        enabled: audio.enabled !== undefined ? Boolean(audio.enabled) : Boolean(url),
        url,
        title: typeof audio.title === 'string' ? audio.title : '',
        description: typeof audio.description === 'string' ? audio.description : '',
        volume: Math.min(1, Math.max(0, toNumber(audio.volume, 1))),
        autoplay: Boolean(audio.autoplay),
        loop: Boolean(audio.loop),
        playbackRate: Math.min(2, Math.max(0.5, toNumber(audio.playbackRate, 1))),
      };
    })(),
    hover: {
      enabled: Boolean(hoverRaw.hien_thi_anh_thu_nho),
      showPolygon: raw.show_polygon_on_hover !== false,
      text: firstValue(hoverRaw.van_ban_huong_dan, hoverRaw.text),
      thumbnail: resolveAsset(firstValue(hoverRaw.duong_dan_thumbnail, hoverRaw.thumbnail)),
      hien_thi_anh_thu_nho: Boolean(hoverRaw.hien_thi_anh_thu_nho),
      van_ban_huong_dan: firstValue(hoverRaw.van_ban_huong_dan, hoverRaw.text),
      duong_dan_thumbnail: resolveAsset(firstValue(hoverRaw.duong_dan_thumbnail, hoverRaw.thumbnail)),
      raw: hoverRaw,
    },
    annotationStyle: Object.keys(style).length ? style : null,
    style: { glow: raw.glow ?? style.glow ?? true, ...style, icon: raw.icon || null },
    metadata: asObject(raw.metadata),
    locked: Boolean(raw.locked),
    raw,
  };
  if (import.meta.env?.DEV) {
    console.debug('[POI Normalize] Normalize type:', normalized.id, normalized.type, normalized.kind);
    if (normalized.kind === 'area') console.debug('[AreaMedia] Normalize', normalized.id, normalized.areaMedia.type, normalized.areaMedia.src);
  }
  return normalized;
}

/** Builder adapter: preserve the persisted JSON shape while filling safe defaults. */
export function normalizeBuilderPoint(rawPoint = {}, options = {}) {
  const point = normalizePoint(rawPoint, options);
  const builderPoint = {
    ...point.raw,
    id: point.id,
    // `type` is the canonical dispatch key. Legacy fields remain available
    // for API compatibility, but must not participate in component routing.
    type: point.kind,
    pointKind: point.kind,
    lon: point.position.lon,
    lat: point.position.lat,
    label: point.label,
    target: point.targetSceneId,
    loai_poi: point.loaiPoi,
    icon: point.icon,
    ...(point.audio ? { audio: { ...point.audio } } : {}),
    entryView: point.entryView,
    ...(point.navStyle ? { navStyle: point.navStyle } : {}),
    ...(point.pinHeight != null ? { chieu_cao_duong_ghim: point.pinHeight } : {}),
    ...(point.raw.khi_dua_chuot_vao || point.raw.hover ? { khi_dua_chuot_vao: point.raw.khi_dua_chuot_vao || point.raw.hover } : {}),
  };
  // `normalizePoint` reads this legacy field for compatibility; Builder state
  // itself remains canonical so every subsequent save/export writes `audio`.
  delete builderPoint.audio_url;
  if (point.kind !== 'audio') delete builderPoint.audio;
  if (point.kind === 'area_landmark') {
    builderPoint.vertices = point.vertices;
    // Builder UI still displays the derived center in its legacy coordinate
    // columns; cleanHotspotForSave removes these derived fields on export.
    builderPoint.lon = point.anchor.lon;
    builderPoint.lat = point.anchor.lat;
    delete builderPoint.anchor;
    delete builderPoint.label_position;
    delete builderPoint.polygon;
    delete builderPoint.area_points;
  }
  if (point.kind === 'area') {
    builderPoint.vertices = point.vertices;
    builderPoint.areaMedia = { ...point.areaMedia };
    builderPoint.lon = point.anchor.lon;
    builderPoint.lat = point.anchor.lat;
    delete builderPoint.anchor;
    delete builderPoint.label_position;
    delete builderPoint.polygon;
    delete builderPoint.area_points;
  }
  return builderPoint;
}
