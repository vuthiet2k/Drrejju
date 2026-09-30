import * as THREE from "three";

// ══════════════════════════════════════
//  LRU TEXTURE CACHE (max 3)
//  3 textures * ~128MB = ~384MB max VRAM
// ══════════════════════════════════════
export class LRUTextureCache {
  constructor(max = 3) {
    this.max = max;
    this.entries = [];
  }

  get(url) {
    const idx = this.entries.findIndex((e) => e.url === url);
    if (idx < 0) return null;
    const [entry] = this.entries.splice(idx, 1);
    this.entries.unshift(entry);
    return entry.texture;
  }

  set(url, texture) {
    const idx = this.entries.findIndex((e) => e.url === url);
    if (idx >= 0) {
      this.entries[idx].texture.dispose();
      this.entries.splice(idx, 1);
    }
    while (this.entries.length >= this.max) {
      const old = this.entries.pop();
      old.texture.dispose();
    }
    this.entries.unshift({ url, texture });
  }

  has(url) {
    return this.entries.some((e) => e.url === url);
  }

  clear() {
    this.entries.forEach((e) => e.texture.dispose());
    this.entries = [];
  }
}

// ══════════════════════════════════════
//  IMAGEBITMAP TEXTURE LOADER
//  Decode + downscale OFF main thread
//  Trần hiển thị = giới hạn GPU THẬT (gl.MAX_TEXTURE_SIZE), không hardcode:
//   - GPU yếu/mobile (4096) → tự an toàn, không vỡ texture.
//   - GPU desktop (8192-16384) → panorama giữ được nhiều chi tiết hơn.
//  DISPLAY_CEILING chặn trên để không ngốn VRAM vô hạn (12000px ≈ 576MB/scene
//  đủ cho preset High Quality trên GPU mạnh).
// ══════════════════════════════════════
const DISPLAY_CEILING = 12288;
let _gpuMaxTexture = 0;
function gpuMaxTextureSize() {
  if (_gpuMaxTexture) return _gpuMaxTexture;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    _gpuMaxTexture = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096;
  } catch {
    _gpuMaxTexture = 4096;
  }
  return _gpuMaxTexture || 4096;
}
function maxTextureWidth() {
  return Math.min(DISPLAY_CEILING, gpuMaxTextureSize());
}

// Convert ImageBitmap → Canvas → Three.js CanvasTexture
// Fixes: (1) flipY mismatch, (2) half-image on some browsers
function bitmapToTexture(bmp) {
  const cap = maxTextureWidth();
  const canvas = document.createElement("canvas");
  if (bmp.width > cap) {
    canvas.width = cap;
    canvas.height = Math.round(bmp.height * (cap / bmp.width));
  } else {
    canvas.width = bmp.width;
    canvas.height = bmp.height;
  }
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

async function loadTextureOptimized(url, abortSignal) {
  const res = await fetch(url, { signal: abortSignal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  if (abortSignal?.aborted) throw new DOMException("Aborted", "AbortError");

  const bmp = await createImageBitmap(blob);
  if (abortSignal?.aborted) {
    bmp.close();
    throw new DOMException("Aborted", "AbortError");
  }

  return bitmapToTexture(bmp);
}

async function loadTextureFromFile(file, abortSignal) {
  const bmp = await createImageBitmap(file);
  if (abortSignal?.aborted) {
    bmp.close();
    throw new DOMException("Aborted", "AbortError");
  }

  return bitmapToTexture(bmp);
}

// ══════════════════════════════════════
//  THUMBNAIL GENERATOR
//  Small 112x72 JPEG for sidebar
// ══════════════════════════════════════
export function generateThumb(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 112;
      c.height = 72;
      const ctx = c.getContext("2d");
      const srcR = img.width / img.height,
        dstR = 112 / 72;
      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height;
      if (srcR > dstR) {
        sw = img.height * dstR;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / dstR;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 112, 72);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.4));
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

// ══════════════════════════════════════
//  PREVIEW ENGINE
//  - On-demand rendering (no continuous loop)
//  - Reduced sphere geometry
//  - Reuse Vector3 objects
//
//  DOM-side updates (loading indicator, HUD, hotspot overlay) are
//  reported through `callbacks` instead of touching document ids
//  directly, so this class stays framework-agnostic and testable.
//  callbacks: { onLoadingChange(bool), onHudChange({lon,lat,fov}),
//               onHotspotsUpdate(engine), onHotspotPlace(lon,lat),
//               onCancelPlacing() }
// ══════════════════════════════════════
export class PreviewEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.lon = 0;
    this.lat = 0;
    this.targetLon = 0;
    this.targetLat = 0;
    this.fov = 75;
    this.targetFov = 75;
    this.isInteracting = false;
    this.pointerStart = { x: 0, y: 0 };
    this.pointerDelta = { lon: 0, lat: 0 };
    this.hasTexture = false;
    this.placingHotspot = false;

    this._needsRender = true;
    this._animating = false;
    this._rafId = 0;
    this._loadAbort = null;

    this._hudFrame = 0;
    this._lastHud = ["", "", ""];
    this._hsFrame = 0;

    this._initRenderer();
    this._initScene();
    this._initEvents();
    this._startLoop();
  }

  _initRenderer() {
    const p = this.canvas.parentElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(p.clientWidth, p.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    const p = this.canvas.parentElement;
    this.camera = new THREE.PerspectiveCamera(this.fov, p.clientWidth / p.clientHeight, 1, 1100);
    const geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0x111111 });
    this.sphere = new THREE.Mesh(geo, this.material);
    this.scene.add(this.sphere);
    this.textureCache = new LRUTextureCache(3);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this._lookAt = new THREE.Vector3();
    this._proj = new THREE.Vector3();
    this._camDir = new THREE.Vector3();
  }

  // ABORT-AWARE TEXTURE LOADING
  async loadPanorama(url, file) {
    if (this._loadAbort) this._loadAbort.abort();
    this._loadAbort = new AbortController();
    const signal = this._loadAbort.signal;

    const cached = this.textureCache.get(url);
    if (cached) {
      this.material.map = cached;
      this.material.color = null;
      this.material.needsUpdate = true;
      this.hasTexture = true;
      this.requestRender();
      return;
    }

    this.callbacks.onLoadingChange?.(true);

    try {
      let texture;
      if (file) {
        texture = await loadTextureFromFile(file, signal);
      } else {
        texture = await loadTextureOptimized(url, signal);
      }

      if (signal.aborted) {
        texture.dispose();
        return;
      }

      this.textureCache.set(url, texture);
      this.material.map = texture;
      this.material.color = null;
      this.material.needsUpdate = true;
      this.hasTexture = true;
      this.requestRender();
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("loadPanorama error:", e);
    } finally {
      if (!signal.aborted) {
        this.callbacks.onLoadingChange?.(false);
      }
    }
  }

  setView(lon, lat, fov) {
    this.lon = this.targetLon = lon;
    this.lat = this.targetLat = lat;
    this.fov = this.targetFov = fov ?? 75;
    this.requestRender();
  }

  getView() {
    return {
      lon: Math.round(this.lon * 10) / 10,
      lat: Math.round(this.lat * 10) / 10,
      fov: Math.round(this.fov * 10) / 10,
    };
  }

  // ON-DEMAND RENDERING — only spin the render loop when something changed
  requestRender() {
    this._needsRender = true;
    if (!this._animating) {
      this._animating = true;
      this._rafId = requestAnimationFrame(() => this._renderLoop());
    }
  }

  _renderLoop() {
    const lonD = Math.abs(this.targetLon - this.lon);
    const latD = Math.abs(this.targetLat - this.lat);
    const fovD = Math.abs(this.targetFov - this.fov);
    const animating = lonD > 0.01 || latD > 0.01 || fovD > 0.01;

    if (animating) {
      this.lon += (this.targetLon - this.lon) * 0.12;
      this.lat += (this.targetLat - this.lat) * 0.12;
      this.fov += (this.targetFov - this.fov) * 0.12;
    } else {
      this.lon = this.targetLon;
      this.lat = this.targetLat;
      this.fov = this.targetFov;
    }

    this.camera.fov = this.fov;
    this.camera.updateProjectionMatrix();
    const phi = THREE.MathUtils.degToRad(90 - this.lat);
    const theta = THREE.MathUtils.degToRad(this.lon);
    this._lookAt.set(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta)
    );
    this.camera.lookAt(this._lookAt);
    this.renderer.render(this.scene, this.camera);

    this._updateHUD();
    this._updateHotspots();

    if (animating || this.isInteracting || this._needsRender) {
      this._needsRender = false;
      this._rafId = requestAnimationFrame(() => this._renderLoop());
    } else {
      this._animating = false;
      this._updateHotspots();
    }
  }

  _startLoop() {
    this.requestRender();
  }

  _updateHUD() {
    if (++this._hudFrame % 5 !== 0) return; // ~12fps
    const sL = this.lon.toFixed(1),
      sA = this.lat.toFixed(1),
      sF = this.fov.toFixed(0);
    if (sL !== this._lastHud[0] || sA !== this._lastHud[1] || sF !== this._lastHud[2]) {
      this._lastHud = [sL, sA, sF];
      this.callbacks.onHudChange?.({ lon: sL, lat: sA, fov: sF });
    }
  }

  _updateHotspots() {
    if (++this._hsFrame % 3 !== 0) return; // ~20fps
    this.callbacks.onHotspotsUpdate?.(this);
  }

  // Analytic ray/sphere math instead of mesh raycasting: the camera always
  // sits at the sphere's exact center, so the intersection is just the ray
  // direction itself — no dependency on triangle winding. Mesh-based
  // intersectObject() used to miss right at the geometry's UV seam (theta≈0,
  // i.e. dead center on a freshly loaded scene, before any drag), which
  // silently broke both single-click and double-click hotspot placement.
  screenToSphere(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = ((cx - r.left) / r.width) * 2 - 1;
    this.mouse.y = -((cy - r.top) / r.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const dir = this.raycaster.ray.direction;
    return {
      lon: Math.round(THREE.MathUtils.radToDeg(Math.atan2(dir.z, dir.x)) * 10) / 10,
      lat: Math.round(THREE.MathUtils.radToDeg(Math.asin(dir.y)) * 10) / 10,
    };
  }

  sphereToScreen(lon, lat) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    this._proj.set(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta)
    );
    const proj = this._proj.clone().project(this.camera);
    this.camera.getWorldDirection(this._camDir);
    if (this._camDir.dot(this._proj.clone().normalize()) < 0) return null;
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (proj.x * 0.5 + 0.5) * r.width,
      y: (-proj.y * 0.5 + 0.5) * r.height,
      scale: Math.max(0.5, 1 - Math.sqrt(proj.x ** 2 + proj.y ** 2) * 0.2),
    };
  }

  _initEvents() {
    const c = this.canvas;
    c.addEventListener("pointerdown", (e) => {
      if (this.placingHotspot) return;
      this.isInteracting = true;
      this.pointerStart = { x: e.clientX, y: e.clientY };
      this.pointerDelta = { lon: this.targetLon, lat: this.targetLat };
      try {
        c.setPointerCapture(e.pointerId);
      } catch {
        // Invalid/inactive pointer id — dragging still works via isInteracting below
      }
      this.requestRender();
    });
    c.addEventListener("pointermove", (e) => {
      if (!this.isInteracting) return;
      const s = 0.15 * (this.fov / 75);
      this.targetLon = this.pointerDelta.lon - (e.clientX - this.pointerStart.x) * s;
      this.targetLat = Math.max(-85, Math.min(85, this.pointerDelta.lat + (e.clientY - this.pointerStart.y) * s));
      this.requestRender();
    });
    c.addEventListener("pointerup", () => {
      this.isInteracting = false;
      this.requestRender();
    });
    c.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.targetFov = Math.max(30, Math.min(120, this.targetFov + e.deltaY * 0.05));
        this.requestRender();
      },
      { passive: false }
    );
    c.addEventListener("click", (e) => {
      if (!this.placingHotspot) return;
      const coords = this.screenToSphere(e.clientX, e.clientY);
      if (coords) this.callbacks.onHotspotPlace?.(coords.lon, coords.lat);
    });
    c.addEventListener("dblclick", (e) => {
      if (this.placingHotspot) return; // avoid double-handling while the explicit "+ Thêm hotspot" flow is active
      const coords = this.screenToSphere(e.clientX, e.clientY);
      if (coords) this.callbacks.onHotspotDblClick?.(coords.lon, coords.lat);
    });
    this._onResize = () => {
      const p = this.canvas.parentElement;
      this.camera.aspect = p.clientWidth / p.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(p.clientWidth, p.clientHeight);
      this.requestRender();
    };
    window.addEventListener("resize", this._onResize);
    this._onKeydown = (e) => {
      if (e.key === "Escape" && this.placingHotspot) this.callbacks.onCancelPlacing?.();
    };
    window.addEventListener("keydown", this._onKeydown);
  }

  dispose() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._loadAbort) this._loadAbort.abort();
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("keydown", this._onKeydown);
    this.textureCache.clear();
    this.renderer.dispose();
  }
}
