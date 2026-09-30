function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createProjectionState() {
  const state = {
    projectionBlend: 0,
    fisheyeStrength: 1,
    projectionRotation: -Math.PI / 2,
    introRotation: -Math.PI / 2,
  };

  function setProgress(progress = 0) {
    const projectionBlend = clamp(Number(progress) || 0, 0, 1);
    state.projectionBlend = projectionBlend;
    state.fisheyeStrength = 1 - projectionBlend;
  }

  function reset() {
    setProgress(0);
    state.projectionRotation = -Math.PI / 2;
    state.introRotation = -Math.PI / 2;
  }

  function setRotation(rotation = -Math.PI / 2) {
    state.projectionRotation = Number.isFinite(Number(rotation))
      ? Number(rotation)
      : -Math.PI / 2;
  }

  function setIntroRotation(rotation = -Math.PI / 2) {
    state.introRotation = Number.isFinite(Number(rotation))
      ? Number(rotation)
      : -Math.PI / 2;
    state.projectionRotation = state.introRotation;
  }

  function complete() {
    setProgress(1);
  }

  return { state, setProgress, setRotation, setIntroRotation, reset, complete };
}
