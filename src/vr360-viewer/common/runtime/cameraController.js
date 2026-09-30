import * as THREE from 'three';

const MIN_LAT = -58;
const MAX_LAT = 82;
// Builder persists scene FOV in degrees within this same range.
const MIN_FOV = 30;
const MAX_FOV = 120;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampLat(value) {
  return clamp(Number(value || 0), MIN_LAT, MAX_LAT);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function shortestLonDelta(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

export function vectorToLonLat(vector) {
  const normalized = vector.clone().normalize();
  return {
    lon: Math.round(THREE.MathUtils.radToDeg(Math.atan2(normalized.z, normalized.x)) * 10) / 10,
    lat: Math.round(THREE.MathUtils.radToDeg(Math.asin(normalized.y)) * 10) / 10,
  };
}

const INERTIA_FRICTION = 0.85; // giảm chỉ số này -> intertia dừng nhanh hơn
const INERTIA_MIN_VELOCITY = 0.5; // dừng sớm hơn (ví dụ: 2)
const INERTIA_MAX_VELOCITY = 3000; // Giảm số này → giới hạn tốc độ tối đa (ví dụ: 1500)

export function createCameraController(camera) {
  let lon = 0;
  let lat = 0;
  let fov = 75;
  let introDistance = 0;
  let tween = null;
  let inertia = null;
  let lastTickAt = 0;

  function getView() {
    return { lon, lat, fov };
  }

  function getRoundedView() {
    return { lon: Math.round(lon * 10) / 10, lat: Math.round(lat * 10) / 10, fov: Math.round(fov) };
  }

  function updateCamera() {
    lat = clampLat(lat);
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    const direction = new THREE.Vector3(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta),
    ).normalize();
    camera.position.copy(direction).multiplyScalar(-introDistance);
    camera.lookAt(camera.position.clone().addScaledVector(direction, 500));
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  function setView(next = {}) {
    lon = Number(next.lon ?? lon);
    lat = clampLat(next.lat ?? lat);
    fov = clamp(Number(next.fov ?? fov), MIN_FOV, MAX_FOV);
  }

  function restoreView(next = {}) {
    lon = Number(next.lon ?? lon);
    lat = clampLat(next.lat ?? lat);
    fov = clamp(Number(next.fov ?? fov), MIN_FOV, MAX_FOV);
  }

  function setInitialView(next = {}) {
    lon = Number(next.lon ?? 0);
    lat = clampLat(next.lat ?? 0);
    fov = clamp(Number(next.fov ?? 75), MIN_FOV, MAX_FOV);
  }

  function setIntroDistance(distance = 0) {
    introDistance = Math.max(0, Number(distance) || 0);
  }

  function dragBy(deltaX, deltaY) {
    lon -= deltaX * 0.12;
    lat = clampLat(lat + deltaY * 0.12);
  }

  function startInertia(velocityX, velocityY) {
    const speed = Math.hypot(velocityX, velocityY);
    if (speed < INERTIA_MIN_VELOCITY) { inertia = null; return; }
    let vx = velocityX;
    let vy = velocityY;
    if (speed > INERTIA_MAX_VELOCITY) {
      const scale = INERTIA_MAX_VELOCITY / speed;
      vx *= scale;
      vy *= scale;
    }
    inertia = { vx, vy };
  }

  function stopInertia() {
    inertia = null;
  }

  function isInertiaActive() {
    return inertia !== null;
  }

  function zoomBy(deltaY) {
    fov = clamp(fov + deltaY * 0.04, MIN_FOV, MAX_FOV);
  }

  function animateTo(next = {}, duration = 520) {
    tween?.resolve?.({ cancelled: true });
    return new Promise((resolve) => {
      const targetLon = Number(next.lon ?? lon);
      const targetLat = clampLat(next.lat ?? lat);
      const targetFov = clamp(Number(next.fov ?? fov), MIN_FOV, MAX_FOV);
      tween = {
        startedAt: performance.now(), duration,
        from: { lon, lat, fov }, to: { lon: targetLon, lat: targetLat, fov: targetFov },
        lonDelta: shortestLonDelta(lon, targetLon), resolve,
      };
    });
  }

  function cancelTween() {
    if (!tween) return false;
    tween.resolve({ cancelled: true });
    tween = null;
    return true;
  }

  function tick(now) {
    let changed = false;
    if (tween) {
      const progress = Math.min((now - tween.startedAt) / tween.duration, 1);
      const eased = easeInOutCubic(progress);
      lon = tween.from.lon + tween.lonDelta * eased;
      lat = tween.from.lat + (tween.to.lat - tween.from.lat) * eased;
      fov = tween.from.fov + (tween.to.fov - tween.from.fov) * eased;
      if (progress >= 1) {
        lon = tween.to.lon;
        lat = tween.to.lat;
        fov = tween.to.fov;
        tween.resolve({ cancelled: false });
        tween = null;
      }
      changed = true;
    }
    if (inertia) {
      const dt = lastTickAt ? (now - lastTickAt) / 1000 : 1 / 60;
      lon -= inertia.vx * 0.12 * dt;
      lat = clampLat(lat + inertia.vy * 0.12 * dt);
      const friction = Math.pow(INERTIA_FRICTION, dt * 60);
      inertia.vx *= friction;
      inertia.vy *= friction;
      if (Math.hypot(inertia.vx, inertia.vy) < INERTIA_MIN_VELOCITY) {
        inertia = null;
      }
      changed = true;
    }
    lastTickAt = now;
    return changed;
  }

  function isAnimating() { return Boolean(tween); }

  return { getView, getRoundedView, updateCamera, setView, restoreView, setInitialView, setIntroDistance, dragBy, zoomBy, animateTo, cancelTween, tick, isAnimating, startInertia, stopInertia, isInertiaActive, vectorToLonLat };
}
