const MIN_SCENE_FOV = 30;
const MAX_SCENE_FOV = 120;
const DESKTOP_REFERENCE_ASPECT = 16 / 9;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * THREE.PerspectiveCamera.fov is vertical degrees. On portrait viewports,
 * derive a wider initial vertical FOV that preserves the desktop scene's
 * horizontal framing as far as the shared scene-FOV range permits.
 */
export function mobileInitialFovForAspect(sceneFov, aspectRatio) {
  const sourceFov = clamp(Number(sceneFov) || 75, MIN_SCENE_FOV, MAX_SCENE_FOV);
  const aspect = Math.max(Number(aspectRatio) || 1, 0.01);
  const sourceRadians = sourceFov * Math.PI / 180;
  const mobileRadians = 2 * Math.atan(
    Math.tan(sourceRadians / 2) * DESKTOP_REFERENCE_ASPECT / aspect,
  );
  return clamp(mobileRadians * 180 / Math.PI, MIN_SCENE_FOV, MAX_SCENE_FOV);
}
