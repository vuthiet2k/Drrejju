import { isNavigationPoint } from '../vr360/pointRendererRegistry.js';

const warned = new Set();

function warnOnce(code, message) {
  if ((import.meta.env?.DEV === false) || warned.has(code)) return;
  warned.add(code);
  console.warn(`[VR360 Viewer] ${message}`);
}

function isFiniteNumber(value) {
  return value !== '' && value !== null && Number.isFinite(Number(value));
}

function invalidUrl(value) {
  if (!value || typeof value !== 'string') return Boolean(value);
  if (value.startsWith('blob:')) return true;
  if (value.startsWith('data:')) return !/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(value);
  return !/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(value);
}

export function validateTourPayload(source = {}, scenes = []) {
  const sceneIds = new Set();
  scenes.forEach((scene, sceneIndex) => {
    const label = `scene #${sceneIndex + 1}`;
    if (!scene.id) warnOnce(`scene-id-${sceneIndex}`, `${label} is missing id.`);
    if (!scene.imageSources?.length) warnOnce(`scene-image-${sceneIndex}`, `${label} is missing a usable panorama URL.`);
    if (sceneIds.has(scene.id)) warnOnce(`scene-duplicate-${scene.id}`, `duplicate scene id "${scene.id}".`);
    sceneIds.add(scene.id);
    if (invalidUrl(scene.raw?.image || scene.raw?.image_url || scene.raw?.original_file)) warnOnce(`scene-url-${scene.id}`, `${label} has a non-persistent or invalid panorama URL.`);
    if (String(scene.raw?.thumb || scene.raw?.thumbnail || '').startsWith('data:') && String(scene.raw?.thumb || scene.raw?.thumbnail).length > 2_000_000) {
      warnOnce(`thumbnail-large-${scene.id}`, `${label} has a very large Base64 thumbnail; it will only be loaded when visible.`);
    }
    ['lon', 'lat', 'fov'].forEach((key) => {
      const value = scene.raw?.initialView?.[key] ?? scene.raw?.view?.[key];
      if (value !== undefined && !isFiniteNumber(value)) warnOnce(`scene-view-${scene.id}-${key}`, `${label} has invalid initialView.${key}.`);
    });
    if (scene.raw?.transition && typeof scene.raw.transition !== 'object') warnOnce(`transition-${scene.id}`, `${label} has an invalid transition.`);
  });
  scenes.forEach((scene) => scene.hotspots.forEach((hotspot, index) => {
    if (!hotspot.raw?.id) warnOnce(`hotspot-id-${scene.id}-${index}`, `hotspot #${index + 1} in "${scene.name}" is missing id.`);
    if (!hotspot.raw?.type) warnOnce(`hotspot-type-${scene.id}-${index}`, `hotspot "${hotspot.id}" is missing type.`);
    const position = hotspot.type === 'area_landmark' ? hotspot.position : hotspot.raw;
    if (!isFiniteNumber(position?.lon) || !isFiniteNumber(position?.lat)) warnOnce(`hotspot-position-${scene.id}-${hotspot.id}`, `hotspot "${hotspot.id}" has invalid lon/lat.`);
    if (isNavigationPoint(hotspot) && !sceneIds.has(hotspot.targetSceneId)) warnOnce(`target-${scene.id}-${hotspot.id}`, `Navigation point "${hotspot.id}" targets a missing scene and is disabled.`);
    if (hotspot.raw?.navStyle && hotspot.navStyle !== hotspot.raw.navStyle && hotspot.raw.navStyle !== 'arrow') warnOnce(`nav-style-${hotspot.raw.navStyle}`, `unsupported navStyle "${hotspot.raw.navStyle}" falls back to default.`);
  }));
}
