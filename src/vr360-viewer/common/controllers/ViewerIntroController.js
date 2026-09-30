const DEFAULT_CONFIG = Object.freeze({
  enabled: true,
  delay: 250,
  cameraDuration: 1700,
  projectionDuration: 620,
  enterDuration: 450,
  settleDuration: 500,
  startDistance: 430,
  projectionStartDistance: 130,
  enterDistance: 32,
  endDistance: 0,
  startFov: 60,
  endFov: 75,
  projectionNearComplete: 0.82,
  rotationAmount: Math.PI * 0.22,
  easing: 'easeInOutCubic',
});

export const INTRO_PHASE = Object.freeze({
  WAITING_TO_START: 'waiting-to-start',
  DELAY_AFTER_CLICK: 'delay-after-click',
  CAMERA_MOVE: 'camera-move',
  PROJECTION_RELAX: 'projection-relax',
  ENTER_WORLD: 'enter-world',
  SETTLE: 'settle',
  FINISHING: 'finishing',
  INTERACTIVE: 'interactive',
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function easeOutSine(progress) {
  return Math.sin((Math.PI * clamp(progress, 0, 1)) / 2);
}

function reducedMotionEnabled() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function createViewerIntroController(overrides = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...overrides,
    delay: clamp(Number(overrides.delay ?? DEFAULT_CONFIG.delay), 200, 300),
    cameraDuration: clamp(Number(overrides.cameraDuration ?? DEFAULT_CONFIG.cameraDuration), 1400, 2200),
    projectionDuration: clamp(Number(overrides.projectionDuration ?? DEFAULT_CONFIG.projectionDuration), 450, 850),
    enterDuration: clamp(Number(overrides.enterDuration ?? DEFAULT_CONFIG.enterDuration), 500, 700),
    settleDuration: clamp(Number(overrides.settleDuration ?? DEFAULT_CONFIG.settleDuration), 400, 600),
    startDistance: clamp(Number(overrides.startDistance ?? DEFAULT_CONFIG.startDistance), 320, 460),
    projectionStartDistance: clamp(Number(overrides.projectionStartDistance ?? DEFAULT_CONFIG.projectionStartDistance), 90, 180),
    enterDistance: clamp(Number(overrides.enterDistance ?? DEFAULT_CONFIG.enterDistance), 12, 60),
    endDistance: 0,
    startFov: clamp(Number(overrides.startFov ?? DEFAULT_CONFIG.startFov), 55, 75),
    endFov: clamp(Number(overrides.endFov ?? DEFAULT_CONFIG.endFov), 60, 75),
    projectionNearComplete: clamp(Number(overrides.projectionNearComplete ?? DEFAULT_CONFIG.projectionNearComplete), 0.8, 0.85),
    rotationAmount: clamp(Number(overrides.rotationAmount ?? DEFAULT_CONFIG.rotationAmount), 0, Math.PI * 0.45),
  };
  let frameId = null;
  let running = false;
  let phase = INTRO_PHASE.WAITING_TO_START;

  function createFrameFor(view = {}) {
    const targetLat = Number(view.lat) || 0;
    const targetLon = Number(view.lon) || 0;
    const targetFov = Number(view.fov) || 75;
    const projectionStartAt = config.cameraDuration;
    const enterStartAt = projectionStartAt + config.projectionDuration;

    return (elapsed = 0) => {
      const cameraMoveProgress = clamp(elapsed / config.cameraDuration, 0, 1);
      const projectionRelaxProgress = clamp(
        (elapsed - projectionStartAt) / config.projectionDuration,
        0,
        1,
      );
      const enterProgress = clamp(
        (elapsed - enterStartAt) / config.enterDuration,
        0,
        1,
      );
      const cameraMoveEased = easeInOutCubic(cameraMoveProgress);
      const projectionRelaxEased = easeOutSine(projectionRelaxProgress);
      const enterEased = easeInOutCubic(enterProgress);
      const distance = elapsed < projectionStartAt
        ? config.startDistance + (config.projectionStartDistance - config.startDistance) * cameraMoveEased
        : elapsed < enterStartAt
          ? config.projectionStartDistance + (config.enterDistance - config.projectionStartDistance) * easeInOutCubic(projectionRelaxProgress)
          : config.enterDistance + (config.endDistance - config.enterDistance) * enterEased;
      const progress = elapsed < projectionStartAt
        ? 0
        : elapsed < enterStartAt
          ? config.projectionNearComplete * projectionRelaxEased
          : config.projectionNearComplete
            + (1 - config.projectionNearComplete) * enterEased;
      const fov = elapsed < projectionStartAt
        ? config.startFov
        : elapsed < enterStartAt
          ? config.startFov + (68 - config.startFov) * projectionRelaxEased
          : 68 + (targetFov - 68) * easeOutSine(enterProgress);
      return {
        lon: targetLon,
        lat: targetLat,
        // Camera translation is the primary motion; FOV and projection are secondary.
        fov,
        distance,
        progress,
        rotation: -Math.PI / 2 + config.rotationAmount * easeOutSine(cameraMoveProgress),
      };
    };
  }

  function cancel() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    running = false;
    phase = INTRO_PHASE.WAITING_TO_START;
  }

  function start({ view = {}, onFrame, onPhase, onUnlock } = {}) {
    cancel();
    const frameFor = createFrameFor(view);
    const finish = () => {
      frameId = null;
      running = false;
      onFrame?.(frameFor(Number.MAX_SAFE_INTEGER));
      phase = INTRO_PHASE.FINISHING;
      onPhase?.(phase);
      onUnlock?.();
    };

    if (!config.enabled || reducedMotionEnabled()) {
      finish();
      return;
    }

    const projectionStartAt = config.cameraDuration;
    const enterStartAt = projectionStartAt + config.projectionDuration;
    const settleStartAt = enterStartAt + config.enterDuration;
    const completeAt = settleStartAt + config.settleDuration;
    running = true;
    phase = INTRO_PHASE.DELAY_AFTER_CLICK;
    onPhase?.(phase);
    onFrame?.(frameFor(0));
    const startedAt = performance.now() + config.delay;

    const tick = (now) => {
      if (now < startedAt) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startedAt;
      onFrame?.(frameFor(elapsed));
      if (elapsed >= completeAt) {
        finish();
        return;
      }

      phase = elapsed >= settleStartAt
        ? INTRO_PHASE.SETTLE
        : elapsed >= enterStartAt
          ? INTRO_PHASE.ENTER_WORLD
          : elapsed >= projectionStartAt
            ? INTRO_PHASE.PROJECTION_RELAX
            : INTRO_PHASE.CAMERA_MOVE;
      onPhase?.(phase);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
  }

  function getInitialFrame(view = {}) {
    return createFrameFor(view)(0);
  }

  function complete() {
    if (phase === INTRO_PHASE.FINISHING) phase = INTRO_PHASE.INTERACTIVE;
  }

  return {
    config: Object.freeze({ ...config }),
    start,
    getInitialFrame,
    complete,
    cancel,
    isRunning: () => running,
    getPhase: () => phase,
  };
}

export { DEFAULT_CONFIG as VIEWER_INTRO_DEFAULTS };
