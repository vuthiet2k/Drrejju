export function createFullscreenController(getTarget) {
  function getFullscreenElement() {
    if (typeof document === 'undefined') return null;
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function isFullscreen() {
    const target = getTarget?.();
    const fullscreenElement = getFullscreenElement();
    return Boolean(target && fullscreenElement && (fullscreenElement === target || target.contains?.(fullscreenElement)));
  }

  function notify(listener) {
    listener(isFullscreen());
  }

  return {
    enterFullscreen() {
      const target = getTarget?.();
      if (!target) return undefined;
      return target.requestFullscreen?.() || target.webkitRequestFullscreen?.();
    },
    exitFullscreen() {
      if (typeof document === 'undefined') return undefined;
      return document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    },
    isFullscreen,
    subscribe(listener) {
      if (typeof document === 'undefined' || typeof listener !== 'function') return () => {};
      const update = () => notify(listener);
      document.addEventListener('fullscreenchange', update);
      document.addEventListener('webkitfullscreenchange', update);
      update();
      return () => {
        document.removeEventListener('fullscreenchange', update);
        document.removeEventListener('webkitfullscreenchange', update);
      };
    },
  };
}
