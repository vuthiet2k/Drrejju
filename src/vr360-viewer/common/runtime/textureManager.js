import * as THREE from 'three';

export function createTextureManager({ scene, mesh, renderer, getTransition, hasPrimaryImage, onLoadingChange, onError, onApplied }) {
  let texture = null;
  let transitionMesh = null;
  let transitionTexture = null;
  let transitionStartedAt = 0;
  let transitionDuration = 650;
  let loadGeneration = 0;
  let disposed = false;
  const cache = new Map();
  const pending = new Map();

  function clearTransition() {
    if (transitionMesh) {
      scene?.remove(transitionMesh);
      transitionMesh.geometry.dispose();
      transitionMesh.material.dispose();
      transitionMesh = null;
    }
    transitionTexture = null;
  }

  function cacheTexture(url, loadedTexture) {
    cache.set(url, loadedTexture);
    while (cache.size > 3) {
      const eviction = [...cache.entries()].find(([, value]) => value !== texture && value !== transitionTexture);
      if (!eviction) break;
      cache.delete(eviction[0]);
      eviction[1].dispose();
    }
  }

  function startTransition(oldTexture) {
    const transition = getTransition();
    if (!oldTexture || !scene || transition?.enabled === false || transition?.effect === 'none') return;
    clearTransition();
    const geometry = new THREE.SphereGeometry(499, 128, 64);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: oldTexture, transparent: true, opacity: 1, depthWrite: false });
    transitionMesh = new THREE.Mesh(geometry, material);
    transitionMesh.renderOrder = 2;
    transitionTexture = oldTexture;
    transitionDuration = transition?.enabled === false || transition?.effect === 'none'
      ? 0
      : Math.min(1200, Math.max(800, Number(transition?.duration) || 1000));
    transitionStartedAt = performance.now();
    scene.add(transitionMesh);
  }

  function applyTexture(loadedTexture, generation) {
    if (disposed || !mesh || generation !== loadGeneration) return;
    const oldTexture = texture;
    texture = loadedTexture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    if (renderer?.capabilities) texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    mesh.material.map = texture;
    mesh.material.color.set(0xffffff);
    mesh.material.needsUpdate = true;
    if (oldTexture && oldTexture !== texture) startTransition(oldTexture);
    onLoadingChange(false);
    onApplied(texture);
  }

  function load(candidates, candidateIndex = 0, generation = ++loadGeneration) {
    if (!mesh) return;
    onLoadingChange(true);
    onError('');
    const imageUrl = candidates[candidateIndex];
    if (!imageUrl) {
      texture = null;
      clearTransition();
      mesh.material.map = null;
      mesh.material.color.set(0x111827);
      mesh.material.needsUpdate = true;
      onLoadingChange(false);
      onError(hasPrimaryImage() ? 'Could not load panorama image.' : '');
      return;
    }
    const cachedTexture = cache.get(imageUrl);
    if (cachedTexture) {
      applyTexture(cachedTexture, generation);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(imageUrl, (loadedTexture) => {
      if (disposed || generation !== loadGeneration) { loadedTexture.dispose(); return; }
      cacheTexture(imageUrl, loadedTexture);
      applyTexture(loadedTexture, generation);
    }, undefined, (loadError) => {
      if (disposed || generation !== loadGeneration) return;
      if (candidateIndex + 1 < candidates.length) { load(candidates, candidateIndex + 1, generation); return; }
      console.warn('[VR360 Viewer] Panorama texture could not be loaded.', imageUrl, loadError);
      mesh.material.map = null;
      mesh.material.color.set(0x111827);
      mesh.material.needsUpdate = true;
      onLoadingChange(false);
      onError('Could not load panorama image.');
    });
  }

  function preload(url) {
    if (!url || cache.has(url)) return Promise.resolve(cache.get(url) || null);
    if (pending.has(url)) return pending.get(url);
    const request = new Promise((resolve) => {
      new THREE.TextureLoader().load(url, (loaded) => {
        if (disposed) { loaded.dispose(); resolve(null); return; }
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.minFilter = THREE.LinearFilter;
        loaded.magFilter = THREE.LinearFilter;
        loaded.generateMipmaps = false;
        cacheTexture(url, loaded);
        resolve(loaded);
      }, undefined, () => resolve(null));
    });
    pending.set(url, request);
    request.finally(() => pending.delete(url));
    return request;
  }

  function updateTransition() {
    if (!transitionMesh) return;
    if (transitionDuration <= 0) { clearTransition(); return; }
    const progress = Math.min((performance.now() - transitionStartedAt) / transitionDuration, 1);
    transitionMesh.material.opacity = 1 - (1 - Math.pow(1 - progress, 3));
    if (progress >= 1) clearTransition();
  }

  function dispose() {
    disposed = true;
    loadGeneration += 1;
    texture = null;
    clearTransition();
    cache.forEach((cachedTexture) => cachedTexture.dispose());
    cache.clear();
    pending.clear();
  }

  return { load, preload, updateTransition, dispose };
}
