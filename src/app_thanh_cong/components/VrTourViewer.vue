<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, defineProps, defineEmits, defineExpose } from "vue";
import * as THREE from "three";
import { useThanhCongShared } from "../common/useThanhCongShared";
import { resolveHotspotIcon, navIconSvg } from "../common/hotspotIcons";
import navArrowImg from "@/assets/images/hotpost/hotspotelement.png";
const { isDesktop } = useThanhCongShared();
// data: { title: String, scenes: [{ id, name, group, image, thumb, info,
//   initialView:{lon,lat,fov}, hotspots:[{lon,lat,label,target,type}] }] }
const props = defineProps({
  data: { type: Object, required: true },
  devTools: { type: Boolean, default: false },
  syncHash: { type: Boolean, default: false },
  autorotate: { type: Boolean, default: true },
  chromeless: { type: Boolean, default: false }, // ẩn toàn bộ UI (cho auto-tour)
  disableNarration: { type: Boolean, default: false }, // bỏ audio thuyết minh nội bộ
});
const emit = defineEmits(["scene-change"]);

// ===== template refs =====
const rootEl = ref(null);
const canvasEl = ref(null);
const hotspotEl = ref(null);
const compassRingEl = ref(null);

// ===== reactive UI state (thay cho classList/getElementById của bản gốc) =====
const loadingHidden = ref(false);
const loadingPercent = ref(0);
const sceneBadgeShow = ref(false);
const sidebarOpen = ref(false);
const infoShow = ref(false);
const viewSetterShow = ref(false);
const thumbStripShow = ref(false);
const loaderShow = ref(false);
const autorotateActive = ref(props.autorotate);
const narrationEnabled = ref(true); // công tắc thuyết minh cả tour (nút menu)
const musicActive = ref(false); // nhạc nền (nút loa thanh dưới)
const musicEl = ref(null);
const currentSceneIndex = ref(0);

// ===== Popup giới thiệu (thong_tin_gioi_thieu) =====
const introContent = ref(null);

// ===== Audio thuyết minh (am_thanh_thuyet_minh) =====
const audioEl = ref(null);
const narration = ref(null);
const audioPlaying = ref(false);
const audioProgress = ref(0);
const audioCurTime = ref(0);
const audioDuration = ref(0);
const narrSrc = ref(""); // audio thuyết minh đang nạp (tránh phát lại khi cùng file)
// Hiệu ứng "nhấp nháy" thu hút khi vào cảnh có giới thiệu / thuyết minh, tắt
// ngay khi người dùng đã mở/nghe (để không gây rối mắt liên tục).
const introPulse = ref(false);
const audioPulse = ref(false);
const vsLon = ref("0.0°");
const vsLat = ref("0.0°");
const vsFov = ref(75);
const vsOutput = ref("");
const vsOutputShow = ref(false);
const toastMsg = ref("");
const toastShow = ref(false);
let toastTimer = null;
let badgeTimer = null;

const scenes = computed(() => props.data?.scenes || []);
const currentScene = computed(() => scenes.value[currentSceneIndex.value] || null);
// Ảnh cho popup giới thiệu: ưu tiên ảnh 2D cấu hình sẵn, chưa có thì dùng tạm
// thumbnail của cảnh đang xem.
const introImage = computed(
  () => introContent.value?.anh_dai_dien_2d || currentScene.value?.thumb || "",
);
const vsSceneLabel = computed(() =>
  currentScene.value ? `Scene: ${currentScene.value.name} (${currentScene.value.id})` : "Scene: —",
);

const groupedScenes = computed(() => {
  const groups = {};
  const order = [];
  scenes.value.forEach((scene, index) => {
    const g = scene.group || "Mặc định";
    if (!groups[g]) {
      groups[g] = [];
      order.push(g);
    }
    groups[g].push({ scene, index });
  });
  return order.map((group) => ({ group, items: groups[group] }));
});

// ╔══════════════════════════════════════════╗
// ║        THREE.JS PANORAMA ENGINE          ║
// ╚══════════════════════════════════════════╝
// Chuyển gần như nguyên vẹn từ bản HTML gốc (pages/vr360/*.html) — chỉ khác:
// kích thước theo container thay vì window, DOM lookup scoped theo instance
// thay vì getElementById toàn cục, có dispose() để dọn dẹp khi unmount.
class VR360Engine {
  constructor(canvas, hotspotContainer, compassRing, container, scenes, hooks) {
    this.canvas = canvas;
    this.hotspotContainer = hotspotContainer;
    this.compassRing = compassRing;
    this.container = container;
    this.scenes = scenes;
    this.hooks = hooks || {};
    this.currentSceneIndex = 0;
    this.isTransitioning = false;

    this.lon = 0; this.lat = 0;
    this.targetLon = 0; this.targetLat = 0;
    this.phi = 0; this.theta = 0;
    this.fov = 75; this.targetFov = 75;

    this.isUserInteracting = false;
    this.pointerStart = { x: 0, y: 0 };
    this.pointerDelta = { lon: 0, lat: 0 };
    this.momentum = { lon: 0, lat: 0 };

    this.autorotate = true;
    this.autorotateSpeed = 0.04; // chậm, êm — trước đây 0.15 nên xoay khá nhanh
    this.lastInteractionTime = 0;
    this.autorotateDelay = 3500;

    this.autoSweep = false; // chế độ auto-tour: xoay đều
    this.autoSweepSpeed = 0; // độ/giây
    this._lastFrameT = 0;

    this.textureCache = new Map();
    this.textureLoader = new THREE.TextureLoader();

    this._hovering = false;
    this._rafId = null;
    this._disposed = false;

    this._onKeydown = this.onKeydown.bind(this);
    // Chỉ tính "đang rê chuột" cho chuột thật (không phải touch) — để mobile
    // vẫn tự xoay bình thường, còn desktop thì dừng xoay khi con trỏ ở trên viewer.
    this._onPointerEnter = (e) => { if (e.pointerType !== "touch") this._hovering = true; };
    this._onPointerLeave = (e) => { if (e.pointerType !== "touch") this._hovering = false; };

    this.initRenderer();
    this.initScene();
    this.initEvents();

    // Popup xem trước ảnh thu nhỏ khi hover hotspot/POI — 1 phần tử dùng
    // chung, gắn vào rootEl (không bị xoá khi hotspotContainer.innerHTML="").
    this._hoveredEl = null;
    this.hoverPopupEl = document.createElement("div");
    this.hoverPopupEl.className = "hotspot-hover-popup";
    this.container.appendChild(this.hoverPopupEl);
  }

  showHoverPopup(hs, el) {
    const cfg = hs.khi_dua_chuot_vao;
    let thumb = null;
    let caption = "";
    if (cfg?.hien_thi_anh_thu_nho && cfg?.duong_dan_thumbnail) {
      // Ưu tiên cấu hình thủ công (khi_dua_chuot_vao) nếu có.
      thumb = cfg.duong_dan_thumbnail;
      caption = cfg.van_ban_huong_dan || "";
    } else if (hs.type === "nav" && hs.target) {
      // Lối đi: tự lấy ảnh thu nhỏ + tên của cảnh đích để xem trước.
      const target = this.scenes.find((s) => s.id === hs.target);
      if (target) {
        thumb = target.thumb || target.image;
        caption = hs.label || target.name || "";
      }
    }
    if (!thumb) return;
    this.hoverPopupEl.innerHTML = `
      <img src="${thumb}" alt="" />
      ${caption ? `<div class="hotspot-hover-caption">${caption}</div>` : ""}
    `;
    this._hoveredEl = el;
    this.hoverPopupEl.classList.add("show");
    this.positionHoverPopup(el);
  }

  hideHoverPopup() {
    this._hoveredEl = null;
    this.hoverPopupEl.classList.remove("show");
  }

  positionHoverPopup(el) {
    const elRect = el.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    this.hoverPopupEl.style.left = `${elRect.left - containerRect.left + elRect.width / 2}px`;
    this.hoverPopupEl.style.top = `${elRect.top - containerRect.top}px`;
  }

  size() {
    return {
      w: this.container.clientWidth || 1,
      h: this.container.clientHeight || 1,
    };
  }

  initRenderer() {
    const { w, h } = this.size();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    // Giới hạn kích thước texture theo GPU: ảnh pano gốc có thể tới ~12000px,
    // vượt MAX_TEXTURE_SIZE của nhiều máy (4096/8192) → WebGL bỏ texture, màn
    // hình đen. Cap về mức GPU hỗ trợ (tối đa 8192 cho nhẹ) rồi thu nhỏ ảnh nào
    // vượt ngưỡng trong loadTexture().
    this.maxTexSize = Math.min(this.renderer.capabilities?.maxTextureSize || 4096, 8192);
  }

  initScene() {
    const { w, h } = this.size();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.fov, w / h, 0.1, 1100);

    const geo = new THREE.SphereGeometry(500, 80, 60);
    geo.scale(-1, 1, 1);

    this.primaryMaterial = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.FrontSide });
    this.primarySphere = new THREE.Mesh(geo, this.primaryMaterial);
    this.scene.add(this.primarySphere);

    // Crossfade overlay (render-to-texture screenshot faded out on scene change)
    this.renderTarget = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.overlayScene = new THREE.Scene();
    this.overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.overlayMaterial = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });
    this.overlayQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.overlayMaterial);
    this.overlayScene.add(this.overlayQuad);

    this.fadeOpacity = 0;
    this.isFading = false;
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      if (this.textureCache.has(url)) {
        resolve(this.textureCache.get(url));
        return;
      }
      this.textureLoader.load(
        url,
        (texture) => {
          // Thu nhỏ ảnh vượt giới hạn texture GPU (nếu không sẽ đen màn). Vẽ lại
          // qua canvas theo đúng tỉ lệ rồi dùng canvas làm nguồn texture.
          const img = texture.image;
          const maxDim = Math.max(img?.width || 0, img?.height || 0);
          const cap = this.maxTexSize || 8192;
          if (img && maxDim > cap) {
            const scale = cap / maxDim;
            const cw = Math.max(1, Math.round(img.width * scale));
            const ch = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement("canvas");
            canvas.width = cw;
            canvas.height = ch;
            canvas.getContext("2d")?.drawImage(img, 0, 0, cw, ch);
            texture.image = canvas;
            texture.needsUpdate = true;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          this.textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  async loadInitialScene() {
    const scene = this.scenes[0];
    if (!scene) return;
    const setProgress = (p) => this.hooks.onProgress?.(p);

    setProgress(20);
    try {
      const thumbTex = await this.loadTexture(scene.thumb);
      this.primaryMaterial.map = thumbTex;
      this.primaryMaterial.color.set(0xffffff);
      this.primaryMaterial.needsUpdate = true;
      setProgress(40);
    } catch { setProgress(40); }

    try {
      const fullTex = await this.loadTexture(scene.image);
      this.primaryMaterial.map = fullTex;
      this.primaryMaterial.needsUpdate = true;
      setProgress(80);
    } catch { setProgress(80); }

    const preloadPromises = this.scenes.slice(1, 4).map((s) => this.loadTexture(s.thumb).catch(() => null));
    await Promise.allSettled(preloadPromises);
    setProgress(100);

    this.lon = scene.initialView?.lon ?? 0;
    this.lat = scene.initialView?.lat ?? 0;
    this.fov = scene.initialView?.fov ?? 75;
    this.targetLon = this.lon;
    this.targetLat = this.lat;
    this.targetFov = this.fov;

    setTimeout(() => {
      if (this._disposed) return;
      this.hooks.onLoadDone?.();
      this.updateHotspots();
      this.hooks.onSceneChange?.(scene, 0);
      this.startRenderLoop();
      this.preloadAllScenes();
    }, 400);
  }

  async preloadAllScenes() {
    for (const scene of this.scenes) {
      if (this._disposed) return;
      if (!this.textureCache.has(scene.image)) {
        await this.loadTexture(scene.image).catch(() => null);
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  }

  async transitionToScene(index, instant = false, entryView = null) {
    if (this.isTransitioning || index === this.currentSceneIndex) return;
    if (index < 0 || index >= this.scenes.length) return;

    this.isTransitioning = true;
    const scene = this.scenes[index];
    const duration = instant ? 0 : 800;

    this.hotspotContainer.innerHTML = "";

    try {
      let texture = this.textureCache.get(scene.image);
      if (!texture) {
        if (!instant && duration > 0) {
          const { w, h } = this.size();
          this.renderTarget.setSize(w, h);
          this.renderer.setRenderTarget(this.renderTarget);
          this.renderer.render(this.scene, this.camera);
          this.renderer.setRenderTarget(null);
          this.overlayMaterial.opacity = 1;
          this.fadeOpacity = 1;
          this.isFading = true;
        }
        this.hooks.onLoaderShow?.(true);
        try {
          texture = await this.loadTexture(scene.image);
        } catch {
          texture = this.textureCache.get(scene.thumb) || (await this.loadTexture(scene.thumb));
        }
        this.hooks.onLoaderShow?.(false);
      }

      if (instant || duration === 0) {
        this.primaryMaterial.map = texture;
        this.primaryMaterial.needsUpdate = true;
        this.snapCameraToView(scene, entryView);
      } else {
        if (!this.isFading) {
          const { w, h } = this.size();
          this.renderTarget.setSize(w, h);
          this.renderer.setRenderTarget(this.renderTarget);
          this.renderer.render(this.scene, this.camera);
          this.renderer.setRenderTarget(null);
          this.overlayMaterial.opacity = 1;
          this.fadeOpacity = 1;
          this.isFading = true;
        }
        this.primaryMaterial.map = texture;
        this.primaryMaterial.needsUpdate = true;
        this.snapCameraToView(scene, entryView);
        await this.animateFadeOut(duration);
      }

      this.currentSceneIndex = index;
      this.updateHotspots();
      this.hooks.onSceneChange?.(scene, index);
      this.lastInteractionTime = Date.now();
      this.preloadAdjacentScenes(index);
    } catch (err) {
      console.error("VrTourViewer transition error:", err);
    }

    this.isTransitioning = false;
  }

  snapCameraToView(scene, entryView = null) {
    const view = entryView || scene.initialView || {};
    const newLon = view.lon ?? 0;
    const newLat = view.lat ?? 0;
    const newFov = view.fov ?? 75;

    this.lon = newLon; this.lat = newLat;
    this.targetLon = newLon; this.targetLat = newLat;
    this.fov = newFov; this.targetFov = newFov;
    this.momentum.lon = 0; this.momentum.lat = 0;

    this.phi = THREE.MathUtils.degToRad(90 - this.lat);
    this.theta = THREE.MathUtils.degToRad(this.lon);
    const target = new THREE.Vector3(
      500 * Math.sin(this.phi) * Math.cos(this.theta),
      500 * Math.cos(this.phi),
      500 * Math.sin(this.phi) * Math.sin(this.theta),
    );
    this.camera.fov = this.fov;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(target);
  }

  animateFadeOut(duration) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const tick = (now) => {
        if (this._disposed) return resolve();
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        this.fadeOpacity = 1 - eased;
        this.overlayMaterial.opacity = this.fadeOpacity;
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          this.fadeOpacity = 0;
          this.overlayMaterial.opacity = 0;
          this.isFading = false;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  preloadAdjacentScenes(index) {
    const adjacent = [index - 1, index + 1, index + 2].filter((i) => i >= 0 && i < this.scenes.length);
    adjacent.forEach((i) => {
      const s = this.scenes[i];
      if (!this.textureCache.has(s.image)) this.loadTexture(s.image).catch(() => null);
    });
  }

  initEvents() {
    const canvas = this.canvas;
    canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    canvas.addEventListener("pointermove", (e) => this.onPointerMove(e));
    canvas.addEventListener("pointerup", (e) => this.onPointerUp(e));

    this._onWheel = (e) => {
      e.preventDefault();
      this.targetFov = Math.max(30, Math.min(100, this.targetFov + e.deltaY * 0.05));
      this.lastInteractionTime = Date.now();
    };
    canvas.addEventListener("wheel", this._onWheel, { passive: false });

    let lastTouchDist = 0;
    this._onTouchStart = (e) => {
      if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
      }
    };
    this._onTouchMove = (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const delta = (lastTouchDist - dist) * 0.1;
        this.targetFov = Math.max(30, Math.min(100, this.targetFov + delta));
        lastTouchDist = dist;
      }
    };
    canvas.addEventListener("touchstart", this._onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", this._onTouchMove, { passive: true });

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    window.addEventListener("keydown", this._onKeydown);
    this.container.addEventListener("pointerenter", this._onPointerEnter);
    this.container.addEventListener("pointerleave", this._onPointerLeave);
  }

  onResize() {
    const { w, h } = this.size();
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderTarget.setSize(w, h);
  }

  onKeydown(e) {
    if (!this._hovering) return;
    switch (e.key) {
      case "ArrowLeft": this.targetLon -= 10; break;
      case "ArrowRight": this.targetLon += 10; break;
      case "ArrowUp": this.targetLat = Math.min(85, this.targetLat + 10); break;
      case "ArrowDown": this.targetLat = Math.max(-85, this.targetLat - 10); break;
      case "+": case "=": this.targetFov = Math.max(30, this.targetFov - 5); break;
      case "-": this.targetFov = Math.min(100, this.targetFov + 5); break;
      default: return;
    }
    this.lastInteractionTime = Date.now();
  }

  onPointerDown(e) {
    this.isUserInteracting = true;
    this.pointerType = e.pointerType;
    this.pointerStart.x = e.clientX;
    this.pointerStart.y = e.clientY;
    this.pointerDelta.lon = this.targetLon;
    this.pointerDelta.lat = this.targetLat;
    this.momentum.lon = 0;
    this.momentum.lat = 0;
    this.lastInteractionTime = Date.now();
    this.canvas.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    if (!this.isUserInteracting) return;
    const baseSensitivity = this.pointerType === "touch" ? 0.25 : 0.15;
    const sensitivity = baseSensitivity * (this.fov / 75);
    const newLon = this.pointerDelta.lon - (e.clientX - this.pointerStart.x) * sensitivity;
    const newLat = this.pointerDelta.lat + (e.clientY - this.pointerStart.y) * sensitivity;
    this.momentum.lon = (newLon - this.targetLon) * 0.5;
    this.momentum.lat = (newLat - this.targetLat) * 0.5;
    this.targetLon = newLon;
    this.targetLat = Math.max(-85, Math.min(85, newLat));
  }

  onPointerUp() {
    this.isUserInteracting = false;
    this.lastInteractionTime = Date.now();
  }

  // Bật/tắt xoay tự động đều cho auto-tour (degPerSec = 360 / thời-lượng-cảnh).
  setAutoSweep(active, degPerSec) {
    this.autoSweep = !!active;
    this.autoSweepSpeed = degPerSec || 0;
  }

  startRenderLoop() {
    const render = () => {
      if (this._disposed) return;
      this._rafId = requestAnimationFrame(render);

      // Delta thời gian giữa 2 frame — cho auto-tour xoay đều theo thời lượng.
      const _now = performance.now();
      const _dt = this._lastFrameT ? (_now - this._lastFrameT) / 1000 : 0;
      this._lastFrameT = _now;
      if (this.autoSweep && !this.isUserInteracting) {
        this.targetLon += this.autoSweepSpeed * _dt;
      }

      // Chỉ tự xoay khi: bật autorotate, không đang kéo, VÀ con trỏ không ở
      // trên viewer (đang xem thì để yên cho họ ngắm). Mobile: _hovering luôn
      // false nên vẫn tự xoay sau khoảng nghỉ như cũ.
      if (this.autorotate && !this.isUserInteracting && !this._hovering) {
        const timeSinceInteraction = Date.now() - this.lastInteractionTime;
        if (timeSinceInteraction > this.autorotateDelay) this.targetLon += this.autorotateSpeed;
      }

      if (!this.isUserInteracting) {
        this.momentum.lon *= 0.95;
        this.momentum.lat *= 0.95;
        if (Math.abs(this.momentum.lon) > 0.01) this.targetLon += this.momentum.lon;
        if (Math.abs(this.momentum.lat) > 0.01) this.targetLat += this.momentum.lat;
        this.targetLat = Math.max(-85, Math.min(85, this.targetLat));
      }

      const lerpSpeed = this.isUserInteracting ? 0.25 : 0.12;
      this.lon += (this.targetLon - this.lon) * lerpSpeed;
      this.lat += (this.targetLat - this.lat) * lerpSpeed;
      this.fov += (this.targetFov - this.fov) * 0.12;

      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
      this.phi = THREE.MathUtils.degToRad(90 - this.lat);
      this.theta = THREE.MathUtils.degToRad(this.lon);
      const target = new THREE.Vector3(
        500 * Math.sin(this.phi) * Math.cos(this.theta),
        500 * Math.cos(this.phi),
        500 * Math.sin(this.phi) * Math.sin(this.theta),
      );
      this.camera.lookAt(target);

      this.renderer.render(this.scene, this.camera);
      if (this.isFading && this.fadeOpacity > 0.001) {
        this.renderer.autoClear = false;
        this.renderer.render(this.overlayScene, this.overlayCamera);
        this.renderer.autoClear = true;
      }

      if (this.compassRing) this.compassRing.style.transform = `rotate(${this.lon % 360}deg)`;
      this.updateHotspotPositions();
      this.hooks.onLiveView?.(this.lon, this.lat, this.fov);
    };
    render();
  }

  updateHotspots() {
    const container = this.hotspotContainer;
    container.innerHTML = "";
    this.hideHoverPopup();
    const scene = this.scenes[this.currentSceneIndex];
    if (!scene?.hotspots) return;

    scene.hotspots.forEach((hs, i) => {
      const el = document.createElement("div");
      el.className = "hotspot";
      el.dataset.lon = hs.lon;
      el.dataset.lat = hs.lat;
      el.dataset.index = i;

      if (hs.type === "nav") {
        // "Lối đi" — mũi tên chevron hướng xuống có hiệu ứng chảy (như tour
        // thực tế). Không kèm nhãn cố định; tên + ảnh cảnh đích hiện khi hover.
        el.classList.add("hotspot-nav");
        el.innerHTML = `
          <div class="hotspot-marker hotspot-marker-nav hotspot-walk">
            <img class="hotspot-walk-img" src="${this.navArrowImg}" alt="" draggable="false" />
          </div>`;
      } else if (hs.loai_poi === "ghim_dia_danh") {
        // "Thẻ ghim chân không" — nhãn chữ IN HOA + đường nét đứt cắm xuống
        // chấm neo tại vị trí địa lý ở xa. Neo (đáy cụm) nằm ĐÚNG toạ độ
        // lon/lat; nhãn nổi phía trên. Chiều cao đường ghim có thể chỉnh qua
        // `chieu_cao_duong_ghim` (px, mặc định 54) để tạo chiều sâu xa/gần.
        // Co giãn theo mức zoom được xử lý ở updateHotspotPositions().
        el.classList.add("hotspot-badge");
        const rawH = Number(hs.chieu_cao_duong_ghim);
        const lineH = rawH > 0 ? rawH : 54;
        const text = String(hs.label || "").toUpperCase();
        el.innerHTML = `
          <div class="badge-pin">
            <div class="badge-pin-label">${text}</div>
            <div class="badge-pin-line" style="height:${lineH}px"></div>
            <div class="badge-pin-anchor"></div>
          </div>`;
      } else {
        // Nếu có loai_poi (thong_tin_van_ban / thu_vien_anh / phat_video) thì
        // icon đổi theo phân loại; không có thì giữ icon ghim mặc định như cũ.
        const poiSvg = hs.loai_poi
          ? navIconSvg(resolveHotspotIcon(hs))
          : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>';
        el.innerHTML = `
          <div class="hotspot-marker">
            <div class="hotspot-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${poiSvg}</svg>
            </div>
            <div class="hotspot-label">${hs.label}</div>
          </div>`;
      }

      el.addEventListener("click", () => {
        // POI "thông tin văn bản" → mở popup giới thiệu (ưu tiên dữ liệu ghi đè
        // trên chính hotspot, nếu không có thì dùng giới thiệu của cảnh).
        if (hs.loai_poi === "thong_tin_van_ban" || hs.loai_poi === "ghim_dia_danh") {
          const ov = hs.thong_tin_gioi_thieu;
          const ovHas = ov && (ov.tieu_de_hop_thong_tin || ov.noi_dung_van_ban);
          // Ghim địa danh chỉ mở giới thiệu khi CHÍNH nó có nội dung (không mượn
          // của cảnh) — để ghim chỉ-điều-hướng vẫn chuyển cảnh như bình thường.
          const intro = ovHas
            ? ov
            : hs.loai_poi === "thong_tin_van_ban"
              ? this.scenes[this.currentSceneIndex]?.thong_tin_gioi_thieu
              : null;
          if (intro && (intro.tieu_de_hop_thong_tin || intro.noi_dung_van_ban)) {
            this.hooks.onOpenIntro?.(intro);
            return;
          }
        }
        const targetIndex = this.scenes.findIndex((s) => s.id === hs.target);
        if (targetIndex >= 0) this.transitionToScene(targetIndex, false, hs.entryView || null);
      });
      el.addEventListener("mouseenter", () => this.showHoverPopup(hs, el));
      el.addEventListener("mouseleave", () => this.hideHoverPopup());

      container.appendChild(el);
    });
  }

  updateHotspotPositions() {
    const container = this.hotspotContainer;
    const { w, h } = this.size();
    const hotspots = container.querySelectorAll(".hotspot");

    hotspots.forEach((el) => {
      const hsLon = parseFloat(el.dataset.lon);
      const hsLat = parseFloat(el.dataset.lat);
      const hsPhi = THREE.MathUtils.degToRad(90 - hsLat);
      const hsTheta = THREE.MathUtils.degToRad(hsLon);
      const point = new THREE.Vector3(
        500 * Math.sin(hsPhi) * Math.cos(hsTheta),
        500 * Math.cos(hsPhi),
        500 * Math.sin(hsPhi) * Math.sin(hsTheta),
      );

      const projected = point.clone().project(this.camera);
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;

      const cameraDir = new THREE.Vector3();
      this.camera.getWorldDirection(cameraDir);
      const toHotspot = point.clone().normalize();
      const dot = cameraDir.dot(toHotspot);

      if (dot < 0 || x < -100 || x > w + 100 || y < -100 || y > h + 100) {
        el.classList.add("hidden");
        if (el === this._hoveredEl) this.hideHoverPopup();
      } else {
        el.classList.remove("hidden");
        el.style.left = x + "px";
        el.style.top = y + "px";
        const distFromCenter = Math.sqrt(projected.x ** 2 + projected.y ** 2);
        const scale = Math.max(0.6, 1 - distFromCenter * 0.15);
        if (el.classList.contains("hotspot-badge")) {
          // "Thẻ ghim chân không": neo (đáy cụm) giữ đúng toạ độ → dịch lên
          // 100% chiều cao (transform-origin: bottom center trong CSS). Cỡ thẻ
          // + độ dài đường nét đứt co giãn theo MỨC ZOOM (fov) để giữ đúng cảm
          // giác khoảng cách thực: zoom vào (fov nhỏ) → to ra, zoom xa → nhỏ đi.
          const zoom = 75 / this.fov;
          const badgeScale = Math.max(0.55, Math.min(2.4, zoom * scale));
          el.style.transform = `translate(-50%, -100%) scale(${badgeScale})`;
        } else {
          el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
      }
    });

    if (this._hoveredEl) this.positionHoverPopup(this._hoveredEl);
  }

  dispose() {
    this._disposed = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.hoverPopupEl?.remove();
    this.resizeObserver?.disconnect();
    window.removeEventListener("keydown", this._onKeydown);
    this.container.removeEventListener("pointerenter", this._onPointerEnter);
    this.container.removeEventListener("pointerleave", this._onPointerLeave);
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.renderTarget?.dispose();
    this.primarySphere?.geometry.dispose();
    this.primaryMaterial?.dispose();
    this.overlayQuad?.geometry.dispose();
    this.overlayMaterial?.dispose();
    this.renderer?.dispose();
  }
}

// ╔══════════════════════════════════════════╗
// ║            COMPONENT WIRING              ║
// ╚══════════════════════════════════════════╝
let engine = null;

function buildEngine() {
  if (!canvasEl.value || !scenes.value.length) return;
  engine = new VR360Engine(canvasEl.value, hotspotEl.value, compassRingEl.value, rootEl.value, scenes.value, {
    onProgress: (p) => { loadingPercent.value = p; },
    onLoadDone: () => { loadingHidden.value = true; },
    onLoaderShow: (show) => { loaderShow.value = show; },
    onSceneChange: (scene, index) => {
      currentSceneIndex.value = index;
      sceneBadgeShow.value = false;
      clearTimeout(badgeTimer);
      badgeTimer = setTimeout(() => { sceneBadgeShow.value = true; }, 200);
      if (props.syncHash && scene) window.location.hash = scene.id;
      emit("scene-change", scene?.id, index);
      setupNarration(scene);
      introPulse.value =
        _hasIntro(scene?.thong_tin_gioi_thieu) || _hasIntro(props.data?.thong_tin_gioi_thieu);
    },
    onOpenIntro: (intro) => {
      introContent.value = intro;
      infoShow.value = true;
      introPulse.value = false;
    },
    onLiveView: (lon, lat, fov) => {
      if (!viewSetterShow.value) return;
      vsLon.value = `${lon.toFixed(1)}°`;
      vsLat.value = `${lat.toFixed(1)}°`;
      vsFov.value = Math.round(fov);
    },
  });
  engine.autorotate = props.autorotate;
  engine.navArrowImg = navArrowImg; // ảnh mũi tên "lối đi" cho nav hotspot
  loadingHidden.value = false;
  loadingPercent.value = 0;
  currentSceneIndex.value = 0;
  engine.loadInitialScene();
  setupMusic();

  if (props.syncHash) {
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      const index = scenes.value.findIndex((s) => s.id === initialHash);
      if (index > 0) setTimeout(() => engine?.transitionToScene(index), 1000);
    }
  }
}

onMounted(() => {
  if (!props.data?.scenes?.length) {
    console.warn("VrTourViewer: props.data.scenes rỗng hoặc thiếu.");
    return;
  }
  buildEngine();
});

// API cho component cha (vd Vr360AutoTour) điều khiển.
defineExpose({
  goToScene,
  setAutoSweep: (active, deg) => engine?.setAutoSweep(active, deg),
  getIndex: () => currentSceneIndex.value,
  getSceneCount: () => scenes.value.length,
});

onBeforeUnmount(() => {
  engine?.dispose();
  engine = null;
  audioEl.value?.pause();
  musicEl.value?.pause();
  clearTimeout(toastTimer);
  clearTimeout(badgeTimer);
});

// Cho phép đổi tour (props.data) mà không cần unmount component
watch(
  () => props.data,
  () => {
    engine?.dispose();
    engine = null;
    if (props.data?.scenes?.length) buildEngine();
  },
);

// ===== UI methods (thay cho các hàm window.* trong bản gốc) =====
function goToScene(index) { engine?.transitionToScene(index); }
function nextScene() {
  if (!engine) return;
  goToScene((engine.currentSceneIndex + 1) % engine.scenes.length);
}
function prevScene() {
  if (!engine) return;
  goToScene((engine.currentSceneIndex - 1 + engine.scenes.length) % engine.scenes.length);
}
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value; }
function toggleThumbnails() { thumbStripShow.value = !thumbStripShow.value; }

// ===== Popup giới thiệu =====
function _hasIntro(o) {
  return !!(o && (o.tieu_de_hop_thong_tin || o.noi_dung_van_ban));
}
// Nút "Thông tin" ở thanh công cụ: hiện giới thiệu của cảnh đang xem, nếu cảnh
// không có thì lùi về giới thiệu tổng quan của cả tour (di tích).
function openInfoPanel() {
  const scn = currentScene.value;
  if (_hasIntro(scn?.thong_tin_gioi_thieu)) introContent.value = scn.thong_tin_gioi_thieu;
  else if (_hasIntro(props.data?.thong_tin_gioi_thieu)) introContent.value = props.data.thong_tin_gioi_thieu;
  else
    introContent.value = {
      tieu_de_hop_thong_tin: scn?.name || "Thông tin",
      noi_dung_van_ban: scn?.info || "",
      anh_dai_dien_2d: "",
    };
  infoShow.value = true;
  introPulse.value = false;
}
function closeInfo() { infoShow.value = false; }

// Render markdown tối giản cho nội dung giới thiệu: **đậm** + tách đoạn (\n\n).
function _escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderRich(text) {
  if (!text) return "";
  const html = _escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return html
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// ===== Audio thuyết minh =====
function _resolveNarration(scene) {
  const a = scene?.am_thanh_thuyet_minh;
  if (a && a.duong_dan_file_audio) return a;
  const t = props.data?.am_thanh_thuyet_minh;
  if (t && t.duong_dan_file_audio) return t;
  return null;
}
function setupNarration(scene) {
  if (props.disableNarration) { narration.value = null; return; }
  const n = _resolveNarration(scene);
  narration.value = n;
  nextTick(() => {
    const el = audioEl.value;
    if (!el) return;
    if (!n) {
      narrSrc.value = "";
      el.pause();
      el.removeAttribute("src");
      audioPlaying.value = false;
      audioPulse.value = false;
      return;
    }
    // 1 audio dùng chung cho cả di tích: nếu cảnh mới vẫn là audio đang phát thì
    // GIỮ NGUYÊN — không nạp lại, không phát lại từ đầu khi chuyển cảnh.
    if (n.duong_dan_file_audio === narrSrc.value) {
      audioPulse.value = el.paused;
      return;
    }
    // Audio khác → nạp mới + reset trạng thái.
    narrSrc.value = n.duong_dan_file_audio;
    el.src = n.duong_dan_file_audio;
    el.load();
    audioPlaying.value = false;
    audioProgress.value = 0;
    audioCurTime.value = 0;
    audioDuration.value = n.thoi_luong_giay || 0;
    audioPulse.value = true;
    // Tự phát nếu tu_dong_phat + chưa tắt âm. Trình duyệt có thể chặn autoplay
    // lần đầu khi chưa có tương tác — khi đó để nút Play nhấp nháy cho người dùng.
    if (n.tu_dong_phat && narrationEnabled.value) {
      el.play().then(() => { audioPlaying.value = true; audioPulse.value = false; }).catch(() => { audioPlaying.value = false; });
    }
  });
}
function toggleNarration() {
  const el = audioEl.value;
  if (!el || !narration.value) return;
  if (el.paused) {
    audioPulse.value = false;
    el.play().then(() => { audioPlaying.value = true; }).catch(() => {});
  } else {
    el.pause();
    audioPlaying.value = false;
  }
}
function onAudioTime() {
  const el = audioEl.value;
  if (!el) return;
  audioCurTime.value = el.currentTime;
  const dur = el.duration && isFinite(el.duration) ? el.duration : audioDuration.value;
  audioProgress.value = dur ? Math.min(1, el.currentTime / dur) : 0;
}
function onAudioMeta() {
  const el = audioEl.value;
  if (el && isFinite(el.duration)) audioDuration.value = el.duration;
}
function onAudioEnded() {
  audioPlaying.value = false;
  audioProgress.value = 1;
}
// Nút THUYẾT MINH NỔI (mic) — CTA chính để người dùng chủ động bật tiếng. Cú
// chạm ở đây cũng chính là "sự kiện tương tác" mà trình duyệt bắt buộc phải có
// trước khi cho phát audio (autoplay bị chặn lần đầu → nếu không có nút này sẽ
// mất tiếng thuyết minh). Bấm lại để tạm dừng / tiếp tục.
function toggleNarrationFab() {
  const el = audioEl.value;
  if (!el || !narration.value) return;
  narrationEnabled.value = true; // đảm bảo công tắc tổng đang bật
  if (el.paused) {
    audioPulse.value = false;
    el.play().then(() => { audioPlaying.value = true; }).catch(() => {});
  } else {
    el.pause();
    audioPlaying.value = false;
  }
}

// ===== Nhạc nền (am_thanh_nen trong cau_hinh_he_thong) =====
function setupMusic() {
  const m = props.data?.cau_hinh_he_thong?.am_thanh_nen;
  musicActive.value = false;
  nextTick(() => {
    const el = musicEl.value;
    if (!el) return;
    if (!m || !m.duong_dan_file_audio) {
      el.pause();
      el.removeAttribute("src");
      return;
    }
    el.src = m.duong_dan_file_audio;
    el.loop = m.lap_lai !== false;
    el.volume = typeof m.am_luong === "number" ? m.am_luong : 0.4;
    el.load();
    if (m.tu_dong_phat) {
      el.play().then(() => { musicActive.value = true; }).catch(() => { musicActive.value = false; });
    }
  });
}
// Nút loa ở thanh dưới: bật/tắt NHẠC NỀN (tách khỏi thuyết minh).
function toggleSound() {
  const el = musicEl.value;
  const m = props.data?.cau_hinh_he_thong?.am_thanh_nen;
  if (!el || !m || !m.duong_dan_file_audio) {
    musicActive.value = !musicActive.value;
    return;
  }
  if (el.paused) {
    el.play().then(() => { musicActive.value = true; }).catch(() => {});
  } else {
    el.pause();
    musicActive.value = false;
  }
}
function toggleAutorotate() {
  if (!engine) return;
  engine.autorotate = !engine.autorotate;
  autorotateActive.value = engine.autorotate;
}
function toggleViewSetter() { viewSetterShow.value = !viewSetterShow.value; }
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    rootEl.value?.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}
function onFovSlider(e) {
  if (engine) engine.targetFov = +e.target.value;
}
function showToast(msg) {
  toastMsg.value = msg;
  toastShow.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastShow.value = false; }, 3000);
}
function saveCurrentView() {
  if (!engine) return;
  const scene = engine.scenes[engine.currentSceneIndex];
  scene.initialView = {
    lon: Math.round(engine.lon * 10) / 10,
    lat: Math.round(engine.lat * 10) / 10,
    fov: Math.round(engine.fov * 10) / 10,
  };
  showToast(`✅ Đã lưu góc nhìn cho "${scene.name}": lon=${scene.initialView.lon}°, lat=${scene.initialView.lat}°, fov=${scene.initialView.fov}°`);
}
function exportAllViews() {
  if (!engine) return;
  const data = engine.scenes.map((s) => ({
    id: s.id,
    name: s.name,
    initialView: s.initialView || { lon: 0, lat: 0, fov: 75 },
  }));
  const json = JSON.stringify(data, null, 2);
  vsOutput.value = json;
  vsOutputShow.value = true;
  navigator.clipboard?.writeText(json).then(
    () => showToast("📋 Đã copy JSON vào clipboard!"),
    () => showToast("⚠ Không thể copy, hãy copy thủ công từ bảng bên dưới"),
  );
}
</script>

<template>
  <div ref="rootEl" class="vr-tour" :class="{ chromeless }">
    <!-- LOADING SCREEN -->
    <div class="loading-screen" :class="{ hidden: loadingHidden }">
      <div class="loading-logo">VR360</div>
      <div class="loading-subtitle">Virtual Tour</div>
      <div class="loading-bar-container">
        <div class="loading-bar" :style="`width:${loadingPercent}%`"></div>
      </div>
      <div class="loading-percent">{{ Math.round(loadingPercent) }}%</div>
    </div>

    <!-- CANVAS -->
    <canvas ref="canvasEl" class="viewer-canvas"></canvas>

    <!-- TOP BAR -->
    <div v-if="isDesktop" class="top-bar">
      <div class="scene-badge" :class="{ show: sceneBadgeShow }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span>{{ currentScene?.name || "" }}</span>
      </div>
      <div class="brand-logo">{{ data?.title || "VR360" }}</div>
    </div>

    <!-- SIDEBAR -->
    <div class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2 class="text-white">VR360 VIRTUAL TOUR</h2>
        <button class="sidebar-close" @click="toggleSidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div class="sidebar-body">
        <template v-for="grp in groupedScenes" :key="grp.group">
          <div class="nav-group-title">{{ grp.group }}</div>
          <div
            v-for="item in grp.items"
            :key="item.scene.id"
            class="nav-item"
            :class="{ active: currentSceneIndex === item.index }"
            @click="goToScene(item.index)"
          >
            <div class="nav-item-preview" :style="`background-image:url('${item.scene.thumb}')`"></div>
            <div class="nav-item-label">{{ item.scene.name }}</div>
            <div class="nav-item-dot"></div>
          </div>
        </template>
      </div>
    </div>

    <!-- LEFT TOOLBAR -->
    <div class="left-toolbar">
      <button class="tool-btn" title="Menu" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
      </button>
      <button class="tool-btn" title="Toàn màn hình" @click="toggleFullscreen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
      </button>
      <button class="tool-btn" :class="{ active: autorotateActive }" title="Tự xoay" @click="toggleAutorotate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56" /><polyline points="21 3 21 9 15 9" /></svg>
      </button>
      <button class="tool-btn" :class="{ pulse: introPulse }" title="Thông tin" @click="openInfoPanel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
      </button>
      <!-- Nút bật/tắt thuyết minh đã chuyển thành nút mic NỔI (.narr-fab) ở góc
           phải dưới — bỏ nút trùng chức năng ở thanh công cụ trái. -->
      <button v-if="devTools" class="tool-btn devtools-btn" title="Set góc nhìn (Dev)" @click="toggleViewSetter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
      </button>
    </div>

    <!-- BOTTOM BAR -->
    <div class="bottom-bar">
      <button class="bottom-btn" title="Trang chủ" @click="goToScene(0)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
      </button>
      <div class="bottom-divider"></div>
      <button class="bottom-btn" title="Trước" @click="prevScene">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button class="bottom-btn" :class="{ active: thumbStripShow }" title="Danh sách" @click="toggleThumbnails">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
      </button>
      <button class="bottom-btn" title="Tiếp" @click="nextScene">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <!-- Nút THUYẾT MINH — chuyển từ FAB nổi vào đây (chỗ nút Nhạc nền vừa ẩn):
           chỉ icon (mic / vạch sóng) + tooltip title, KHÔNG kèm chữ. Vẫn là cú
           chạm mở khoá autoplay như FAB cũ. Vạch ngăn chỉ hiện khi có nút này. -->
      <div v-if="!disableNarration && narration && narrationEnabled" class="bottom-divider"></div>
      <button
        v-if="!disableNarration && narration && narrationEnabled"
        class="bottom-btn narr-bottom-btn"
        :class="{ active: audioPlaying, pulse: !audioPlaying }"
        :title="audioPlaying ? 'Tạm dừng thuyết minh' : 'Nghe thuyết minh'"
        @click="toggleNarrationFab"
      >
        <!-- mic khi CHƯA phát -->
        <svg v-if="!audioPlaying" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0014 0v-1" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
        <!-- vạch sóng khi ĐANG phát -->
        <span v-else class="narr-eq"><i></i><i></i><i></i><i></i></span>
      </button>
      <!-- Nút "Nhạc nền" tạm ẩn theo yêu cầu — đổi v-if thành true (hoặc bỏ) để bật lại. -->
      <button v-if="false" class="bottom-btn" :class="{ active: musicActive }" title="Nhạc nền" @click="toggleSound">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" /></svg>
      </button>
    </div>

    <!-- Nút thuyết minh (mic) đã chuyển vào THANH DƯỚI (.narr-bottom-btn), cạnh
         chỗ nút Nhạc nền vừa ẩn — không còn FAB nổi ở góc phải dưới. -->

    <!-- COMPASS -->
    <div v-if="isDesktop" class="compass">
      <div ref="compassRingEl" class="compass-ring">
        <span class="compass-n">N</span>
        <div class="compass-needle"></div>
      </div>
    </div>

    <!-- THUMBNAIL STRIP -->
    <div class="thumb-strip" :class="{ show: thumbStripShow }">
      <div
        v-for="(scene, i) in scenes"
        :key="scene.id"
        class="thumb-item"
        :class="{ active: currentSceneIndex === i }"
        @click="goToScene(i)"
      >
        <img :src="scene.thumb" :alt="scene.name" loading="lazy" />
        <div class="thumb-item-label">{{ scene.name }}</div>
      </div>
    </div>

    <!-- POPUP GIỚI THIỆU (thong_tin_gioi_thieu) -->
    <div class="intro-modal" :class="{ show: infoShow }" @click.self="closeInfo">
      <div class="intro-card overflow-auto">
        <button class="intro-close" title="Đóng" @click="closeInfo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <img v-if="introImage" class="intro-img" :src="introImage" alt="" />
        <div class="intro-content">
          <h3 class="intro-title">{{ introContent?.tieu_de_hop_thong_tin || "Thông tin" }}</h3>
          <div class="intro-text" v-html="renderRich(introContent?.noi_dung_van_ban)"></div>
          <button v-if="narration" class="intro-audio-btn" @click="toggleNarration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" /></svg>
            {{ audioPlaying ? "Đang phát thuyết minh…" : "Nghe thuyết minh" }}
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW SETTER (Dev tool) -->
    <div v-if="devTools" class="view-setter" :class="{ show: viewSetterShow }">
      <div class="view-setter-header">
        <h4>⚙ Set Góc Nhìn Mặc Định</h4>
        <button class="view-setter-close" @click="toggleViewSetter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div class="view-setter-body">
        <div class="view-setter-scene">{{ vsSceneLabel }}</div>
        <div class="view-setter-row">
          <span class="view-setter-label">LON</span>
          <div class="view-setter-value">{{ vsLon }}</div>
        </div>
        <div class="view-setter-row">
          <span class="view-setter-label">LAT</span>
          <div class="view-setter-value">{{ vsLat }}</div>
        </div>
        <div class="view-setter-row">
          <span class="view-setter-label">FOV</span>
          <div class="view-setter-value">{{ vsFov }}°</div>
          <input type="range" class="view-setter-slider" min="30" max="120" :value="vsFov" @input="onFovSlider" />
        </div>
        <div class="view-setter-actions">
          <button class="view-setter-btn primary" @click="saveCurrentView">💾 Lưu góc nhìn này</button>
          <button class="view-setter-btn secondary" @click="exportAllViews">📋 Export JSON</button>
        </div>
        <div class="view-setter-output" :class="{ show: vsOutputShow }">{{ vsOutput }}</div>
      </div>
    </div>

    <!-- SCENE LOADER -->
    <div class="scene-loader" :class="{ show: loaderShow }">
      <div class="scene-loader-ring"></div>
      <div class="scene-loader-text">Đang tải...</div>
    </div>

    <!-- TOAST -->
    <div class="toast" :class="{ show: toastShow }">{{ toastMsg }}</div>

    <!-- AUDIO THUYẾT MINH (điều khiển bằng nút ở thanh công cụ trái) -->
    <audio
      ref="audioEl"
      preload="metadata"
      @timeupdate="onAudioTime"
      @loadedmetadata="onAudioMeta"
      @ended="onAudioEnded"
      @play="audioPlaying = true"
      @pause="audioPlaying = false"
    ></audio>

    <!-- NHẠC NỀN (điều khiển bằng nút loa ở thanh dưới) -->
    <audio ref="musicEl" preload="auto" loop></audio>

    <!-- HOTSPOTS -->
    <div ref="hotspotEl" class="hotspot-container"></div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap");

.vr-tour {
  --primary: #8b1a2b;
  --primary-light: #b22e42;
  --primary-dark: #6b1020;
  --accent: #d4a853;
  --bg-dark: rgba(20, 20, 28, 0.85);
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --sidebar-w: 280px;
  --radius: 12px;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  overflow: hidden;
  font-family: "Be Vietnam Pro", sans-serif;
  background: #0a0a0f;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
.vr-tour * { box-sizing: border-box; }

.loading-screen {
  position: absolute; inset: 0; z-index: 9999;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: opacity 0.8s ease, visibility 0.8s ease;
}
.loading-screen.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.loading-logo {
  font-size: 42px; font-weight: 700; letter-spacing: 3px;
  background: linear-gradient(135deg, var(--primary-light), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;
}
.loading-subtitle { font-size: 13px; color: var(--text-muted); letter-spacing: 6px; text-transform: uppercase; margin-bottom: 40px; }
.loading-bar-container { width: 320px; max-width: 70%; height: 3px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; position: relative; }
.loading-bar { height: 100%; width: 0%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 4px; transition: width 0.3s ease; }
.loading-percent { margin-top: 16px; font-size: 14px; font-weight: 500; color: var(--text-muted); letter-spacing: 2px; }

.viewer-canvas { position: absolute; inset: 0; z-index: 1; cursor: grab; touch-action: none; display: block; width: 100%; height: 100%; }
.viewer-canvas:active { cursor: grabbing; }

.top-bar {
  position: absolute; top: 0; left: 0; right: 0; z-index: 100; height: 56px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 20px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  pointer-events: none;
}
.top-bar > * { pointer-events: auto; }
.scene-badge {
  display: flex; align-items: center; gap: 10px; background: var(--primary);
  padding: 8px 20px 8px 14px; border-radius: 24px; font-size: 13px; font-weight: 600;
  letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 20px rgba(139, 26, 43, 0.4);
  transform: translateY(-60px); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scene-badge.show { transform: translateY(0); }
.scene-badge svg { width: 16px; height: 16px; flex: none; }
.brand-logo {
  font-size: 18px; font-weight: 700; letter-spacing: 2px;
  background: linear-gradient(135deg, #fff, var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.sidebar {
  position: absolute; top: 0; left: 0; bottom: 0; width: var(--sidebar-w); z-index: 200;
  background: var(--bg-dark); backdrop-filter: blur(30px) saturate(1.5); -webkit-backdrop-filter: blur(30px) saturate(1.5);
  border-right: 1px solid rgba(255, 255, 255, 0.06); transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden;
}
.sidebar.open { transform: translateX(0); }
.sidebar-header { padding: 20px; display: flex; align-items: center; justify-content: space-between; background: var(--primary); min-height: 72px; }
.sidebar-header h2 { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.4; margin: 0; }
.sidebar-close {
  width: 32px; height: 32px; background: rgba(255, 255, 255, 0.15); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background var(--transition);
}
.sidebar-close:hover { background: rgba(255, 255, 255, 0.25); }
.sidebar-body { flex: 1; overflow-y: auto; padding: 8px 0; scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.1) transparent; }
.nav-group-title { padding: 14px 20px 8px; font-size: 11px; font-weight: 600; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; cursor: pointer; transition: all var(--transition); position: relative; border-left: 3px solid transparent; }
.nav-item:hover { background: rgba(255, 255, 255, 0.04); border-left-color: rgba(255, 255, 255, 0.2); }
.nav-item.active { background: rgba(139, 26, 43, 0.15); border-left-color: var(--primary); }
.nav-item-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; transition: all var(--transition); }
.nav-item.active .nav-item-dot { background: var(--primary-light); box-shadow: 0 0 8px var(--primary-light); }
.nav-item-label { font-size: 13px; font-weight: 400; color: var(--text-muted); transition: color var(--transition); flex: 1; }
.nav-item.active .nav-item-label, .nav-item:hover .nav-item-label { color: var(--text); }
.nav-item-preview { width: 40px; height: 40px; border-radius: 8px; background-size: cover; background-position: center; flex-shrink: 0; border: 2px solid rgba(255, 255, 255, 0.06); transition: border-color var(--transition); }
.nav-item.active .nav-item-preview { border-color: var(--primary-light); }

.left-toolbar { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 150; display: flex; flex-direction: column; gap: 4px; }
.tool-btn {
  width: 44px; height: 44px; background: var(--bg-dark); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius); color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all var(--transition);
}
.tool-btn:hover { background: rgba(40, 40, 55, 0.95); color: #fff; border-color: rgba(255, 255, 255, 0.15); }
.tool-btn.active { color: var(--accent); border-color: var(--accent); }
.tool-btn svg { width: 20px; height: 20px; }
.devtools-btn { border-color: rgba(212, 168, 83, 0.3); }
/* Nhấp nháy thu hút khi vào cảnh có giới thiệu / thuyết minh */
.tool-btn.pulse { color: var(--accent); border-color: var(--accent); animation: toolPulse 1.6s ease-in-out infinite; }
@keyframes toolPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.55); }
  50% { box-shadow: 0 0 0 8px rgba(212, 168, 83, 0); }
}

/* Chế độ chromeless (auto-tour): ẩn hết UI, chỉ còn panorama */
.vr-tour.chromeless .top-bar,
.vr-tour.chromeless .sidebar,
.vr-tour.chromeless .left-toolbar,
.vr-tour.chromeless .bottom-bar,
.vr-tour.chromeless .thumb-strip,
.vr-tour.chromeless .compass,
.vr-tour.chromeless .view-setter,
.vr-tour.chromeless .narr-fab,
.vr-tour.chromeless .hotspot-container { display: none !important; }

.bottom-bar {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 150;
  display: flex; align-items: center; gap: 6px; padding: 6px; background: var(--bg-dark);
  backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px;
}
.bottom-btn { width: 44px; height: 44px; background: transparent; border: none; border-radius: 50%; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition); position: relative; }
.bottom-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
.bottom-btn.active { color: var(--accent); }
.bottom-btn svg { width: 20px; height: 20px; }
.bottom-divider { width: 1px; height: 24px; background: rgba(255, 255, 255, 0.1); margin: 0 2px; }
/* Nút thuyết minh trong thanh dưới (chuyển từ FAB nổi) — chỉ icon, không chữ.
   Nhấp nháy mời gọi khi CHƯA phát; sóng nhạc (.narr-eq) thu nhỏ vừa nút tròn. */
.narr-bottom-btn.pulse { color: var(--accent); animation: toolPulse 1.8s ease-in-out infinite; }
.narr-bottom-btn .narr-eq { height: 18px; }

/* NÚT THUYẾT MINH NỔI (mic) — pill nổi góc phải dưới, icon tròn + nhãn chữ */
.narr-fab {
  position: absolute; right: 16px; bottom: 20px; z-index: 160;
  display: inline-flex; align-items: center; gap: 10px; padding: 0 20px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 30px; cursor: pointer;
  background: var(--bg-dark); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
  color: #fff; font-family: inherit; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
  transition: all var(--transition);
}
.narr-fab:hover { border-color: rgba(255, 255, 255, 0.2); transform: translateY(-1px); }
.narr-fab-icon {
  width: 52px; height: 52px; flex: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--primary); color: #fff; transition: background var(--transition);
}
.narr-fab:hover .narr-fab-icon { background: var(--primary-light); }
.narr-fab-icon svg { width: 22px; height: 22px; }
.narr-fab-label { font-size: 13px; font-weight: 600; letter-spacing: 0.3px; white-space: nowrap; }
/* Nhấp nháy mời gọi khi CHƯA phát (autoplay bị chặn hoặc đang tạm dừng) */
.narr-fab.pulse .narr-fab-icon { animation: narrPulse 1.8s ease-in-out infinite; }
@keyframes narrPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.55); }
  50% { box-shadow: 0 0 0 12px rgba(212, 168, 83, 0); }
}
/* Đang phát: icon đổi sang màu accent + hiện vạch sóng */
.narr-fab.playing .narr-fab-icon { background: var(--accent); color: #1a1208; }
.narr-eq { display: flex; align-items: center; gap: 2.5px; height: 20px; }
.narr-eq i {
  width: 3px; height: 100%; border-radius: 2px; background: currentColor;
  transform-origin: center; animation: narrEq 0.9s ease-in-out infinite;
}
.narr-eq i:nth-child(1) { animation-delay: 0s; }
.narr-eq i:nth-child(2) { animation-delay: 0.25s; }
.narr-eq i:nth-child(3) { animation-delay: 0.1s; }
.narr-eq i:nth-child(4) { animation-delay: 0.35s; }
@keyframes narrEq { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }

.compass { position: absolute; bottom: 24px; left: 24px; z-index: 150; width: 52px; height: 52px; }
.compass-ring { width: 100%; height: 100%; border: 2px solid rgba(255, 255, 255, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-dark); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); position: relative; transition: transform 0.15s ease-out; }
.compass-needle { width: 2px; height: 20px; background: linear-gradient(to top, var(--text-muted) 50%, #ef4444 50%); border-radius: 2px; }
.compass-n { position: absolute; top: 3px; font-size: 8px; font-weight: 700; color: #ef4444; letter-spacing: 1px; }

.hotspot-container { position: absolute; inset: 0; z-index: 50; pointer-events: none; }
.hotspot-container :deep(.hotspot) { position: absolute; pointer-events: auto; cursor: pointer; transform: translate(-50%, -50%); transition: transform 0.3s ease, opacity 0.3s ease; }
.hotspot-container :deep(.hotspot.hidden) { opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(0.5); }
.hotspot-container :deep(.hotspot-marker) { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.hotspot-container :deep(.hotspot-icon) {
  width: 40px; height: 40px; background: var(--primary); border: 3px solid #fff; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hotspot-container :deep(.hotspot:hover .hotspot-icon) { transform: rotate(-45deg) scale(1.15); box-shadow: 0 6px 25px rgba(139, 26, 43, 0.5); }
.hotspot-container :deep(.hotspot-icon svg) { transform: rotate(45deg); width: 16px; height: 16px; color: #fff; }
.hotspot-container :deep(.hotspot-label) { background: var(--primary); color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; white-space: nowrap; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); text-transform: uppercase; }
/* Nav ("chỉ đường") hotspots reuse the same calm pin shape as a POI marker —
   just a different color + icon, no pulsing circle. */
.hotspot-container :deep(.hotspot-icon-nav) { background: var(--accent); }
.hotspot-container :deep(.hotspot:hover .hotspot-icon-nav) { box-shadow: 0 6px 25px rgba(212, 168, 83, 0.5); }
.hotspot-container :deep(.hotspot-marker-nav .hotspot-label) { background: var(--accent); }

/* "Lối đi" — chồng 3 chevron hướng xuống, sáng chảy dần từ trên xuống tạo cảm
   giác mời bước tới; hover thì sáng + nhích to. */
.hotspot-container :deep(.hotspot-walk) { padding: 6px; }
/* Mũi tên "lối đi" bằng ảnh — nhấp nhô nhẹ mời bước tới, hover thì sáng + to. */
.hotspot-container :deep(.hotspot-walk-img) {
  display: block; width: 58px; height: auto; user-select: none;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.55));
  animation: walkBob 1.6s ease-in-out infinite;
  transition: filter 0.25s ease;
}
.hotspot-container :deep(.hotspot:hover .hotspot-walk-img) {
  filter: drop-shadow(0 5px 12px rgba(0, 0, 0, 0.6)) brightness(1.25);
}
@keyframes walkBob {
  0%, 100% { transform: translateY(0); opacity: 0.82; }
  50% { transform: translateY(-4px); opacity: 1; }
}

/* "THẺ GHIM CHÂN KHÔNG" (Pin Marker Badge) — đánh dấu danh lam / vị trí ở XA.
   Cấu trúc dọc: nhãn chữ IN HOA (cam→đỏ) → đường nét đứt → chấm neo. Chấm neo
   (đáy) ghim đúng vị trí địa lý; cả cụm lấy gốc biến đổi ở đáy để khi zoom co
   giãn quanh điểm neo (transform + translate xử lý ở updateHotspotPositions). */
.hotspot-container :deep(.hotspot.hotspot-badge) { transform-origin: bottom center; }
.hotspot-container :deep(.badge-pin) {
  display: flex; flex-direction: column; align-items: center;
  filter: drop-shadow(0 3px 9px rgba(0, 0, 0, 0.55));
}
.hotspot-container :deep(.badge-pin-label) {
  background: linear-gradient(135deg, #ff8a2b 0%, #e0301b 100%);
  color: #fff; font-family: inherit; font-weight: 800; font-size: 13px;
  line-height: 1.15; letter-spacing: 0.6px; text-transform: uppercase;
  white-space: nowrap; padding: 7px 14px; border-radius: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  transition: filter 0.25s ease, transform 0.25s ease;
}
/* Đường nối nét đứt — tạo cảm giác toạ độ không gian 3D sâu và xa. Chiều cao
   đặt inline (theo `chieu_cao_duong_ghim`); co giãn cùng cả cụm khi zoom. */
.hotspot-container :deep(.badge-pin-line) {
  width: 0; border-left: 2px dashed rgba(255, 255, 255, 0.95);
}
/* Chấm neo — "dính" vào đỉnh núi / vị trí địa lý, có vòng nhịp thu hút. */
.hotspot-container :deep(.badge-pin-anchor) {
  width: 11px; height: 11px; border-radius: 50%;
  background: #ff5a1f; border: 2px solid #fff;
  box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.3), 0 2px 6px rgba(0, 0, 0, 0.5);
  animation: badgeAnchorPulse 2.2s ease-in-out infinite;
}
.hotspot-container :deep(.hotspot-badge:hover .badge-pin-label) {
  filter: brightness(1.08); transform: translateY(-1px);
}
@keyframes badgeAnchorPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.3), 0 2px 6px rgba(0, 0, 0, 0.5); }
  50% { box-shadow: 0 0 0 9px rgba(255, 90, 31, 0), 0 2px 6px rgba(0, 0, 0, 0.5); }
}

/* Popup ảnh thu nhỏ khi hover hotspot (khi_dua_chuot_vao.hien_thi_anh_thu_nho) */
.vr-tour :deep(.hotspot-hover-popup) {
  position: absolute; z-index: 90; transform: translate(-50%, calc(-100% - 14px));
  width: 180px; background: var(--bg-dark); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; overflow: hidden;
  opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.vr-tour :deep(.hotspot-hover-popup.show) { opacity: 1; transform: translate(-50%, calc(-100% - 20px)); }
.vr-tour :deep(.hotspot-hover-popup img) { display: block; width: 100%; height: 100px; object-fit: cover; }
.vr-tour :deep(.hotspot-hover-caption) { padding: 8px 10px; font-size: 12px; color: var(--text); line-height: 1.4; }

.thumb-strip {
  position: absolute; bottom: 84px; left: 50%; transform: translateX(-50%); z-index: 140;
  display: flex; gap: 8px; padding: 8px; background: var(--bg-dark); backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; opacity: 0; pointer-events: none;
  transition: all 0.4s ease; max-width: 90%; overflow-x: auto;
}
.thumb-strip.show { opacity: 1; pointer-events: auto; }
.thumb-strip::-webkit-scrollbar { height: 0; }
.thumb-item { width: 80px; height: 50px; border-radius: 8px; overflow: hidden; cursor: pointer; flex-shrink: 0; border: 2px solid transparent; transition: all var(--transition); position: relative; }
.thumb-item.active { border-color: var(--primary-light); }
.thumb-item:hover { border-color: rgba(255, 255, 255, 0.3); }
.thumb-item img { width: 100%; height: 100%; object-fit: cover; }
.thumb-item-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 2px 4px; background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); font-size: 8px; font-weight: 500; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.view-setter {
  position: absolute; top: 64px; right: 20px; z-index: 250; width: 320px; max-width: calc(100% - 40px);
  background: rgba(10, 10, 18, 0.92); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius); opacity: 0; pointer-events: none;
  transform: translateY(-10px); transition: all 0.3s ease; font-variant-numeric: tabular-nums;
}
.view-setter.show { opacity: 1; pointer-events: auto; transform: translateY(0); }
.view-setter-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
.view-setter-header h4 { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin: 0; }
.view-setter-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; }
.view-setter-body { padding: 16px; }
.view-setter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.view-setter-label { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; width: 36px; flex-shrink: 0; }
.view-setter-value { flex: 1; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 8px 12px; font-size: 14px; font-weight: 500; color: #fff; font-family: "JetBrains Mono", "SF Mono", "Fira Code", monospace; text-align: center; }
.view-setter-slider { flex: 1; -webkit-appearance: none; appearance: none; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; outline: none; }
.view-setter-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: var(--primary-light); border-radius: 50%; cursor: pointer; border: 2px solid #fff; }
.view-setter-scene { padding: 8px 12px; background: rgba(139, 26, 43, 0.15); border: 1px solid rgba(139, 26, 43, 0.3); border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--primary-light); margin-bottom: 14px; text-align: center; }
.view-setter-actions { display: flex; gap: 8px; margin-top: 4px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.06); }
.view-setter-btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; transition: all var(--transition); }
.view-setter-btn.primary { background: var(--primary); color: #fff; }
.view-setter-btn.primary:hover { background: var(--primary-light); }
.view-setter-btn.secondary { background: rgba(255, 255, 255, 0.08); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1); }
.view-setter-btn.secondary:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
.view-setter-output { margin-top: 12px; padding: 10px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 11px; line-height: 1.6; color: var(--text-muted); white-space: pre-wrap; word-break: break-all; max-height: 160px; overflow-y: auto; display: none; }
.view-setter-output.show { display: block; }

.toast {
  position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(20px); z-index: 9999;
  background: rgba(34, 197, 94, 0.9); color: #fff; padding: 10px 24px; border-radius: 8px; font-size: 13px;
  font-weight: 500; opacity: 0; pointer-events: none; transition: all 0.3s ease;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

.info-panel {
  position: absolute; right: 20px; top: 50%; transform: translateY(-50%) translateX(120%); z-index: 200;
  width: 300px; max-width: calc(100% - 40px); background: var(--bg-dark); backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius); padding: 24px;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.info-panel.show { transform: translateY(-50%) translateX(0); }
.info-panel h3 { font-size: 16px; font-weight: 600; margin: 0 0 12px; color: var(--accent); }
.info-panel p { font-size: 13px; line-height: 1.6; color: var(--text-muted); margin: 0; }
.info-panel-close { position: absolute; top: 12px; right: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }

.scene-loader {
  position: absolute; inset: 0; z-index: 9000; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.35); opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.3s ease, visibility 0.3s ease;
}
.scene-loader.show { opacity: 1; visibility: visible; }
.scene-loader-ring { width: 48px; height: 48px; border: 3px solid rgba(255, 255, 255, 0.15); border-top-color: var(--accent); border-radius: 50%; animation: scene-spin 0.8s linear infinite; }
.scene-loader-text { margin-top: 14px; font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.7); letter-spacing: 1.5px; text-transform: uppercase; }
@keyframes scene-spin { to { transform: rotate(360deg); } }

/* POPUP GIỚI THIỆU */
.intro-modal {
  position: absolute; inset: 0; z-index: 300; display: flex; align-items: center; justify-content: center;
  padding: 24px; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.3s ease, visibility 0.3s ease;
}
.intro-modal.show { opacity: 1; visibility: visible; pointer-events: auto; }
.intro-card {
  width: 460px; max-width: 100%; max-height: calc(100% - 48px); overflow: hidden; position: relative;
  background: var(--bg-dark); backdrop-filter: blur(30px) saturate(1.5); -webkit-backdrop-filter: blur(30px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  display: flex; flex-direction: column; transform: translateY(12px) scale(0.98);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.intro-modal.show .intro-card { transform: translateY(0) scale(1); }
.intro-close {
  position: absolute; top: 12px; right: 12px; z-index: 2; width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.4); border: none; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background var(--transition);
}
.intro-close:hover { background: rgba(0, 0, 0, 0.65); }
.intro-img { width: 100%; height: 200px; object-fit: cover; flex-shrink: 0; display: block; }
.intro-content { padding: 20px 24px 24px;}
.intro-title { font-size: 20px; font-weight: 700; color: var(--accent); margin: 0 0 14px; letter-spacing: 0.3px; }
.intro-text { font-size: 14px; line-height: 1.75; color: rgba(255, 255, 255, 0.85); }
.intro-text :deep(p) { margin: 0 0 12px; }
.intro-text :deep(p:last-child) { margin-bottom: 0; }
.intro-text :deep(strong) { color: #fff; font-weight: 700; }
.intro-audio-btn {
  margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 24px;
  background: var(--primary); color: #fff; border: none; cursor: pointer; font-size: 13px; font-weight: 600;
  transition: background var(--transition);
}
.intro-audio-btn:hover { background: var(--primary-light); }
.intro-audio-btn svg { width: 16px; height: 16px; flex: none; }

@media (max-width: 768px) {
  .vr-tour { --sidebar-w: 260px; }
  .bottom-bar { bottom: 12px; }
  .left-toolbar { left: 8px; }
  .compass { left: 12px; bottom: 16px; width: 44px; height: 44px; }
  .thumb-strip { bottom: 72px; }
  /* Bottom-bar giữa màn hình đã rộng gần hết chiều ngang → nâng nút mic lên
     trên và thu về dạng icon tròn để không đè lên thanh điều khiển. */
  .narr-fab { right: 10px; bottom: 76px; padding: 0; gap: 0; }
  .narr-fab .narr-fab-label { display: none; }
}
</style>
