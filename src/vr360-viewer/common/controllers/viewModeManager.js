export const VIEW_MODE = Object.freeze({
  NORMAL: 'normal',
  FIT_EYES: 'fit-eyes',
  MEGA_VIEW: 'mega-view',
});

const MODE_FOV = Object.freeze({
  [VIEW_MODE.FIT_EYES]: 70,
  [VIEW_MODE.MEGA_VIEW]: 120,
});

function clampFov(value) {
  return Math.min(120, Math.max(30, Number(value) || 85));
}

export function createViewModeManager(initialNormalFov = 85) {
  let mode = VIEW_MODE.NORMAL;
  let normalFov = clampFov(initialNormalFov);

  function setNormalFov(value) {
    normalFov = clampFov(value);
  }

  function select(nextMode) {
    if (!Object.values(VIEW_MODE).includes(nextMode)) return mode;
    mode = nextMode;
    return mode;
  }

  function getCurrentMode() {
    return mode;
  }

  function getTargetFov(nextMode = mode) {
    return nextMode === VIEW_MODE.NORMAL
      ? normalFov
      : MODE_FOV[nextMode] ?? normalFov;
  }

  return { setNormalFov, select, getCurrentMode, getTargetFov };
}
