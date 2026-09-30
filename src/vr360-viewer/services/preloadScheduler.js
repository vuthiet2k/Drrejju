/** Progressive, deduplicated panorama preload queue. */
const PRIORITY = { ACTIVE: 0, NAV_TARGET: 1, ADJACENT: 2, REMAINING: 3 };

export function createPreloadScheduler(preload, { concurrency = 3 } = {}) {
  const states = new Map();
  const queue = [];
  let active = 0;
  let disposed = false;

  function enqueue(url, priority = PRIORITY.REMAINING) {
    if (!url || disposed) return states.get(url)?.promise || Promise.resolve(null);
    const current = states.get(url);
    if (current?.status === 'loaded' || current?.status === 'loading') return current.promise;
    if (current?.status === 'queued') {
      current.priority = Math.min(current.priority, priority);
      queue.sort((a, b) => a.priority - b.priority);
      return current.promise;
    }
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    const item = { url, priority, resolve, promise, status: 'queued' };
    states.set(url, item);
    queue.push(item);
    queue.sort((a, b) => a.priority - b.priority);
    drain();
    return promise;
  }

  function drain() {
    while (!disposed && active < concurrency && queue.length) {
      const item = queue.shift();
      if (item.status !== 'queued') continue;
      item.status = 'loading';
      active += 1;
      Promise.resolve(preload(item.url)).then((value) => {
        item.status = value ? 'loaded' : 'failed';
        item.resolve(value);
      }).catch(() => {
        item.status = 'failed';
        item.resolve(null);
      }).finally(() => { active -= 1; drain(); });
    }
  }

  function schedule(scenes, activeSceneId, initialCount = 5) {
    const activeIndex = scenes.findIndex((scene) => scene.id === activeSceneId);
    const current = activeIndex >= 0 ? scenes[activeIndex] : scenes[0];
    const ordered = [];
    const add = (scene, priority) => {
      if (!scene || ordered.some((entry) => entry.scene.id === scene.id)) return;
      ordered.push({ scene, priority });
    };
    // The current panorama is loaded by PanoramaViewer.load(). Enqueuing it
    // here would create a second request before that load reaches the texture
    // cache, so only schedule scenes that can be viewed next.
    (current?.hotspots || []).forEach((hotspot) => {
      const targetId = hotspot.targetSceneId || hotspot.target_scene_id || hotspot.target;
      add(scenes.find((scene) => scene.id === String(targetId)), PRIORITY.NAV_TARGET);
    });
    add(scenes[activeIndex + 1], PRIORITY.ADJACENT);
    add(scenes[activeIndex - 1], PRIORITY.ADJACENT);
    scenes.forEach((scene) => add(scene, PRIORITY.REMAINING));
    ordered.slice(0, initialCount).forEach(({ scene, priority }) => enqueue(scene.imageSources?.[0], priority));
    drain();
  }

  function dispose() { disposed = true; queue.length = 0; }
  return { enqueue, schedule, drain, getState: (url) => states.get(url)?.status || 'idle', dispose };
}

export { PRIORITY };
