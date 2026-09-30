export function createIntroCameraAdapter(getPanorama) {
  function prepare(view) {
    getPanorama()?.prepareIntroCamera?.(view);
  }

  function apply(frame) {
    getPanorama()?.setIntroCameraState?.(frame);
  }

  function complete() {
    getPanorama()?.completeIntroCamera?.();
  }

  return { prepare, apply, complete };
}
