// One-way adapter: internal hotspot shape -> photo-sphere-viewer Markers Plugin shape.
// Pure functions. NEVER import this into the editor storage path.
// Docs: https://photo-sphere-viewer.js.org/plugins/markers.html

const deg = (v) => `${Number(v || 0)}deg`;
const rad = (v) => (Number(v || 0) * Math.PI) / 180;

function baseData(hotspot) {
  return {
    loai_poi: hotspot.loai_poi || null,
    targetSceneId: hotspot.target || null,
    entryView: hotspot.entryView || null,
    noi_dung: hotspot.noi_dung || null,
    audio: hotspot.audio || null,
    khi_dua_chuot_vao: hotspot.khi_dua_chuot_vao || null,
    _source: hotspot,
  };
}

function imageMarker(hotspot) {
  const isNav = hotspot.type === "nav";
  return {
    id: hotspot.id,
    position: { yaw: deg(hotspot.lon), pitch: deg(hotspot.lat) },
    image: hotspot.icon || null,
    size: { width: 32, height: 32 },
    anchor: isNav ? "bottom center" : "center center",
    tooltip: hotspot.label || undefined,
    data: baseData(hotspot),
  };
}

function htmlMarker(hotspot) {
  const kind = hotspot.type || "info";
  const label = hotspot.label || hotspot.noi_dung?.tieu_de || "";
  return {
    id: hotspot.id,
    position: { yaw: deg(hotspot.lon), pitch: deg(hotspot.lat) },
    html: `<div class="poi-${kind}">${label}</div>`,
    anchor: "center center",
    tooltip: label || undefined,
    data: baseData(hotspot),
  };
}

function polygonMarker(hotspot) {
  const vertices = Array.isArray(hotspot.vertices) ? hotspot.vertices : [];
  return {
    id: hotspot.id,
    polygon: vertices.map((v) => [rad(v.lon), rad(v.lat)]),
    svgStyle: {
      fill: hotspot.style?.hoverFill || "rgba(56,189,248,0.32)",
      stroke: hotspot.style?.border || "#38bdf8",
      strokeWidth: `${hotspot.style?.borderWidth ?? 2}px`,
    },
    tooltip: hotspot.label
      ? { content: hotspot.label, position: "top center" }
      : undefined,
    data: baseData(hotspot),
  };
}

function areaLayerMarker(hotspot) {
  const media = hotspot.areaMedia || hotspot.media || {};
  const mediaType = media.type || hotspot.mediaType || "image";
  const isVideo = mediaType === "video";
  const vertices = Array.isArray(hotspot.vertices) ? hotspot.vertices : [];
  const key = isVideo ? "videoLayer" : "imageLayer";
  return {
    id: hotspot.id,
    [key]: media.src || "",
    position: vertices.map((v) => ({ yaw: rad(v.lon), pitch: rad(v.lat) })),
    autoplay: isVideo ? Boolean(media.autoplay) : undefined,
    data: {
      ...baseData(hotspot),
      mediaMeta: { duration: media.duration || null, fileSize: media.fileSize || null },
    },
  };
}

export function toPsvMarker(hotspot) {
  if (!hotspot) return null;
  switch (hotspot.type) {
    case "nav":
    case "pin":
    case "audio":
      return imageMarker(hotspot);
    case "info":
    case "gallery":
    case "video":
      return htmlMarker(hotspot);
    case "area_landmark":
      return polygonMarker(hotspot);
    case "area":
    case "area-media":
      return areaLayerMarker(hotspot);
    default:
      return {
        id: hotspot.id,
        position: { yaw: deg(hotspot.lon), pitch: deg(hotspot.lat) },
        data: baseData(hotspot),
      };
  }
}

export function toPsvSceneMarkers(scene) {
  if (!scene) return [];
  return (scene.hotspots || []).map(toPsvMarker).filter(Boolean);
}

export function toPsvTour(scenes) {
  return (scenes || []).map((s) => ({
    id: s.id,
    name: s.name,
    panorama: s.exportUrl || s.image || "",
    markers: toPsvSceneMarkers(s),
  }));
}
