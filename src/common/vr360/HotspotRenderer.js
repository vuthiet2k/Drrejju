// ═══════════════════════════════════════════════════════════════
//  Shared Hotspot Renderer — produces the SAME DOM markers that
//  VrTourViewer uses, so the builder preview is truly WYSIWYG.
//  Supports both VIEW mode (read-only) and EDIT mode (selectable,
//  draggable, with visual feedback).
// ═══════════════════════════════════════════════════════════════
import * as THREE from "three";
import { resolveHotspotIcon, navIconSvg } from "@/common/hotspotIcons";
import { renderNavHotspot } from "./NavRenderer.js";
import { resolvePointKind } from "./pointSchema.js";
import { resolvePointRenderer } from "./pointRendererRegistry.js";

// Re-export for convenience
export { resolveHotspotIcon, navIconSvg } from "@/common/hotspotIcons";
const NAV_ARROW_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <path d="M16 58 48 28l32 30" fill="none" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 70 48 51l20 19" fill="none" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
</svg>`;
export const NAV_ARROW_IMG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(NAV_ARROW_SVG)}`;
const AUDIO_ICON_SVG = '<path d="M6 9v6M10 6v12M14 3v18M18 8v8" stroke-linecap="round"/>';

// ═══════════════════════════════════════════════════════════════
//  Hotspot DOM Builder — creates the exact same HTML structure
//  that VrTourViewer uses for each hotspot type.
// ═══════════════════════════════════════════════════════════════
export function buildHotspotElement(hs, index, options = {}) {
  const { editMode = false, navArrowSrc = NAV_ARROW_IMG, targetScene = null } = options;
  const el = document.createElement("div");
  el.className = "hotspot";
  el.dataset.lon = hs.lon;
  el.dataset.lat = hs.lat;
  el.dataset.index = index;

  const kind = resolvePointKind(hs);
  const renderer = resolvePointRenderer(hs);
  if (kind === "nav") {
    el.classList.add("hotspot-nav");
    renderNavHotspot(el, hs, { navArrowSrc, targetScene });
  } else if (kind === "pin") {
    // "Th? ghim ch�n kh�ng" � nh�n ch? IN HOA + du?ng n�t d?t c?m xu?ng
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
    // POI mặc định — pin giọt nước + icon + nhãn
    const poiSvg = kind === "audio"
      ? AUDIO_ICON_SVG
      : hs.loai_poi
      ? navIconSvg(resolveHotspotIcon(hs))
      : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>';
    el.innerHTML = `
      <div class="hotspot-marker">
        <div class="hotspot-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${poiSvg}</svg>
        </div>
        <div class="hotspot-label">${hs.label || "Hotspot " + (index + 1)}</div>
      </div>`;
  }

  // Edit mode: add selection ring and drag handle
  if (editMode) {
    el.classList.add("hotspot-edit-mode");
    const ring = document.createElement("div");
    ring.className = "hotspot-edit-ring";
    el.appendChild(ring);
  }

  return el;
}

// ═══════════════════════════════════════════════════════════════
//  HotspotRenderer — manages the hotspot container, creates/
//  updates/positions hotspot elements each frame.
// ═══════════════════════════════════════════════════════════════
export class HotspotRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      editMode: false,
      navArrowSrc: NAV_ARROW_IMG,
      onHotspotClick: null,   // (index, event) => void
      onHotspotDblClick: null, // (index, event) => void
      onHotspotDragStart: null, // (index, event) => void
      onHotspotDrag: null,     // (index, lon, lat, event) => void
      onHotspotDragEnd: null,  // (index, event) => void
      onHotspotHover: null,    // (index, hs, el) => void
      onHotspotHoverEnd: null, // () => void
      resolveNavTarget: null, // (targetId) => scene
      selectedIndex: -1,
      ...options,
    };

    this._els = []; // pool of DOM elements
    this._hoveredEl = null;
    this._draggingIndex = -1;
    this._dragStartPos = null;
    this._dragStartLonLat = null;

    // Reusable THREE objects for projection math
    this._proj = new THREE.Vector3();
    this._camDir = new THREE.Vector3();
    this._toHotspot = new THREE.Vector3();
  }

  // Update all hotspots from scene data + camera
  update(hotspots, camera, containerWidth, containerHeight) {
    this._allHotspots = hotspots;
    const n = hotspots.length;
    const opts = this.options;

    // Grow/shrink element pool
    while (this._els.length > n) {
      const el = this._els.pop();
      el.remove();
    }
    while (this._els.length < n) {
      const el = document.createElement("div");
      el.className = "hotspot";
      this.container.appendChild(el);
      this._els.push(el);
    }

    for (let i = 0; i < n; i++) {
      const el = this._els[i];
      const hs = hotspots[i];

      // Rebuild DOM if hotspot data changed (type, icon, label, etc.)
  const kind = resolvePointKind(hs);
    const renderer = resolvePointRenderer(hs);
      const targetScene = kind === "nav" ? opts.resolveNavTarget?.(hs.target) : null;
      const dataKey = `${kind}|${hs.navStyle}|${hs.loai_poi}|${resolveHotspotIcon(hs)}|${hs.label}|${hs.target}|${targetScene?.name || ""}|${targetScene?.thumb || targetScene?.image || ""}|${hs.chieu_cao_duong_ghim}`;
      if (el._dataKey !== dataKey) {
        el._dataKey = dataKey;
        el.innerHTML = "";
        // Rebuild using the same structure as VrTourViewer
        this._rebuildElement(el, hs, i, targetScene);
      }

      // Update dataset
      el.dataset.lon = hs.lon;
      el.dataset.lat = hs.lat;
      el.dataset.index = i;

      // Position
      const pos = this._projectToScreen(hs.lon, hs.lat, camera, containerWidth, containerHeight);
      if (!pos) {
        el.classList.add("hidden");
        if (el === this._hoveredEl) this._hoveredEl = null;
        continue;
      }

      el.classList.remove("hidden");
      el.style.left = pos.x + "px";
      el.style.top = pos.y + "px";

      // Scale based on distance from center + zoom
      const distFromCenter = Math.sqrt(
        Math.pow((pos.x / containerWidth) * 2 - 1, 2) +
        Math.pow((pos.y / containerHeight) * 2 - 1, 2)
      );
      const baseScale = Math.max(0.6, 1 - distFromCenter * 0.15);
      const zoomScale = 75 / camera.fov;

      if (el.classList.contains("hotspot-badge")) {
        const badgeScale = Math.max(0.55, Math.min(2.4, zoomScale * baseScale));
        el.style.transform = `translate(-50%, -100%) scale(${badgeScale})`;
      } else {
        el.style.transform = `translate(-50%, -50%) scale(${baseScale})`;
      }

      // Selection highlight
      el.classList.toggle("hotspot-selected", i === opts.selectedIndex);

      // Fix #3+#6: locked state visual
      el.classList.toggle("hotspot-locked", !!hs.locked);
    }

  }

  _rebuildElement(el, hs, index, targetScene) {
    el.innerHTML = "";
    el.className = "hotspot";

    if (hs.loai_poi) el.classList.add("hotspot-poi-" + hs.loai_poi);

    const kind = resolvePointKind(hs);
    if (kind === "nav") {
      el.classList.add("hotspot-nav");
      renderNavHotspot(el, hs, {
        navArrowSrc: this.options.navArrowSrc,
        targetScene,
      });
    } else if (kind === "pin") {
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
      const poiSvg = kind === "audio"
        ? AUDIO_ICON_SVG
        : hs.loai_poi
        ? navIconSvg(resolveHotspotIcon(hs))
        : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>';
      const marker = document.createElement("div");
      marker.className = `hotspot-marker${kind === "audio" ? " hotspot-audio-marker" : ""}`;
      marker.innerHTML = `
        <div class="hotspot-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${poiSvg}</svg>
        </div>
        <div class="hotspot-label">${hs.label || "Hotspot " + (index + 1)}</div>`;
      el.appendChild(marker);
      if (kind === "audio") {
        el.classList.add("hotspot-audio-marker");
        marker.setAttribute("data-audio-renderer", "true");
        if (import.meta.env?.DEV) console.debug('[Audio Renderer] render()', hs.id || index);
      }
    }

    // Edit mode ring
    if (this.options.editMode) {
      el.classList.add("hotspot-edit-mode");
      const ring = document.createElement("div");
      ring.className = "hotspot-edit-ring";
      el.appendChild(ring);
    }

    // Events
    this._attachEvents(el, index);
  }

  _attachEvents(el, index) {
    const opts = this.options;

    el.onclick = (e) => {
      e.stopPropagation();
      if (resolvePointKind(this._allHotspots?.[index] || {}) === 'audio' && import.meta.env?.DEV) console.debug('[Audio Renderer] click()', this._allHotspots[index]?.id || index);
      opts.onHotspotClick?.(index, e);
    };

    el.ondblclick = (e) => {
      e.stopPropagation();
      opts.onHotspotDblClick?.(index, e);
    };

    el.onmouseenter = () => {
      this._hoveredEl = el;
      opts.onHotspotHover?.(index, el);
    };

    el.onmouseleave = () => {
      this._hoveredEl = null;
      opts.onHotspotHoverEnd?.();
    };

    // Drag support (edit mode)
    if (opts.editMode) {
      let dragState = null;

      el.onpointerdown = (ev) => {
        if (ev.button !== 0) return;
        ev.stopPropagation();
        // Fix #3: không cho drag nếu hotspot đang locked
        if (el.classList.contains("hotspot-locked")) return;
        dragState = {
          startX: ev.clientX,
          startY: ev.clientY,
          startLon: parseFloat(ev.target.dataset.lon || el.dataset.lon),
          startLat: parseFloat(ev.target.dataset.lat || el.dataset.lat),
          moved: false,
        };
        el.setPointerCapture(ev.pointerId);
        opts.onHotspotDragStart?.(index, ev);
      };

      el.onpointermove = (e) => {
        if (!dragState) return;
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          dragState.moved = true;
        }
        // We need the camera to convert screen delta to lon/lat delta
        // This is handled by the engine, not here
      };

      el.onpointerup = (ev) => {
        if (!dragState) return;
        el.releasePointerCapture(ev.pointerId);
        if (dragState.moved) {
          // Drag completed — engine will have updated coords
          opts.onHotspotDragEnd?.(index, ev);
        }
        dragState = null;
      };

      el.onpointercancel = () => {
        dragState = null;
      };
    }
  }

  // Project 3D sphere coords to 2D screen position
  _projectToScreen(lon, lat, camera, w, h) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    this._proj.set(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta)
    );

    const projected = this._proj.clone().project(camera);
    camera.getWorldDirection(this._camDir);
    this._toHotspot.copy(this._proj).normalize();

    if (this._camDir.dot(this._toHotspot) < 0) return null;

    const x = (projected.x * 0.5 + 0.5) * w;
    const y = (-projected.y * 0.5 + 0.5) * h;

    if (x < -100 || x > w + 100 || y < -100 || y > h + 100) return null;

    return { x, y };
  }

  // Convert screen coordinates to sphere lon/lat (for drag)
  screenToSphere(cx, cy, camera, canvasRect) {
    const mouse = new THREE.Vector2(
      ((cx - canvasRect.left) / canvasRect.width) * 2 - 1,
      -((cy - canvasRect.top) / canvasRect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const dir = raycaster.ray.direction;
    return {
      lon: Math.round(THREE.MathUtils.radToDeg(Math.atan2(dir.z, dir.x)) * 10) / 10,
      lat: Math.round(THREE.MathUtils.radToDeg(Math.asin(dir.y)) * 10) / 10,
    };
  }

  dispose() {
    this._els.forEach((el) => el.remove());
    this._els = [];
  }
}
