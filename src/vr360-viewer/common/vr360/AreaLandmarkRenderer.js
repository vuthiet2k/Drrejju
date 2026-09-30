import * as THREE from 'three';
import { isAreaLandmarkPoint } from './pointRendererRegistry.js';
import { normalizeLandmarkVertices, calculateLandmarkAnchor } from './pointSchema.js';

const DEFAULT_STYLE = {
  fill: '#fbbf24',
  hoverFill: 'rgba(251, 191, 36, 0.32)',
  border: '#fbbf24',
  hoverBorder: '#fde68a',
  line: '#ffffff',
  opacity: 0.3,
  borderWidth: 2,
  radius: 8,
};

function pointToVector(point, target) {
  const phi = THREE.MathUtils.degToRad(90 - Number(point.lat || 0));
  const theta = THREE.MathUtils.degToRad(Number(point.lon || 0));
  return target.set(
    500 * Math.sin(phi) * Math.cos(theta),
    500 * Math.cos(phi),
    500 * Math.sin(phi) * Math.sin(theta),
  );
}

function mergeStyle(style = {}) { return { ...DEFAULT_STYLE, ...style }; }

const LABEL_SCALE_REF_FOV = 75;
const LABEL_SCALE_REF_SHORT = 800;
const LABEL_SCALE_MIN = 0.65;
const LABEL_SCALE_MAX = 1.4;

function computeLabelScale(fov, width, height) {
  const f = Math.pow(LABEL_SCALE_REF_FOV / (fov || LABEL_SCALE_REF_FOV), 0.6);
  const v = Math.pow(Math.min(width, height) / LABEL_SCALE_REF_SHORT, 0.35);
  return Math.max(LABEL_SCALE_MIN, Math.min(LABEL_SCALE_MAX, f * v));
}

function project(point, camera, width, height, vector, direction, cameraDirection) {
  pointToVector(point, vector);
  direction.copy(vector).normalize();
  if (cameraDirection.dot(direction) <= 0) return null;
  vector.project(camera);
  if (vector.z < -1 || vector.z > 1) return null;
  return { x: (vector.x * 0.5 + 0.5) * width, y: (-vector.y * 0.5 + 0.5) * height };
}

function calculateProjectedPolygonCentroid(points) {
  let twiceArea = 0;
  let weightedX = 0;
  let weightedY = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const cross = point.x * next.y - next.x * point.y;
    twiceArea += cross;
    weightedX += (point.x + next.x) * cross;
    weightedY += (point.y + next.y) * cross;
  });
  if (Math.abs(twiceArea) > Number.EPSILON) {
    return { x: weightedX / (3 * twiceArea), y: weightedY / (3 * twiceArea) };
  }
  const average = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );
  return { x: average.x / points.length, y: average.y / points.length };
}

function projectLandmarkGeometry(vertices, anchorPoint, camera, width, height, vector, direction, cameraDirection) {
  const projectedVertices = vertices.map((point) => project(
    point,
    camera,
    width,
    height,
    vector,
    direction,
    cameraDirection,
  ));
  if (projectedVertices.some((point) => !point)) return null;

  const anchor = project(anchorPoint, camera, width, height, vector, direction, cameraDirection);
  if (!anchor) return null;
  return { projectedVertices, anchor };
}

export class AreaLandmarkRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { editMode: false, showPolygonOnHover: true, onClick: null, onHover: null, onHoverEnd: null, onLabelDragEnd: null, ...options };
    this.annotations = [];
    this.elements = new Map();
    this.vector = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.cameraDirection = new THREE.Vector3();
    this._camera = null;
    this._width = 0;
    this._height = 0;
    this.selectedId = null;
    this.activeTouchElement = null;
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'area-landmark-layer');
    this.svg.setAttribute('aria-hidden', 'true');
    this.svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;';
    this.container.appendChild(this.svg);
  }

  setAnnotations(annotations = []) {
    this.annotations = annotations.filter((item) => isAreaLandmarkPoint(item) && normalizeLandmarkVertices(item).length >= 3);
    const ids = new Set(this.annotations.map((item, index) => String(item.id || index)));
    for (const [id, element] of this.elements) if (!ids.has(id)) { element.group.remove(); element.label.remove(); this.elements.delete(id); }
  }

  setSelectedAnnotation(annotation) {
    this.selectedId = annotation ? String(annotation.id || '') : null;
  }

  _createElement(annotation, index) {
    const id = String(annotation.id || index);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';
    group.classList.add('area-landmark');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    group.append(polygon, line, anchor);
    const label = document.createElement('button');
    label.type = 'button'; label.className = 'area-landmark-label';
    label.style.transformOrigin = 'center bottom';
    const element = { group, polygon, line, anchor, label, vertices: [], annotation };
    let suppressClick = false;
    let hoverCount = 0;
    let hoverEndTimer;
    const setHovered = (value, target) => {
      hoverCount = Math.max(0, hoverCount + (value ? 1 : -1));
      clearTimeout(hoverEndTimer);
      if (value) {
        group.classList.add('is-hovered');
        label.classList.add('is-hovered');
        if (!this.options.editMode) polygon.style.display = '';
        this.options.onHover?.(element.annotation, target);
        return;
      }
      hoverEndTimer = setTimeout(() => {
        if (hoverCount > 0) return;
        group.classList.remove('is-hovered');
        label.classList.remove('is-hovered');
        if (!this.options.editMode) polygon.style.display = 'none';
        this.options.onHoverEnd?.(element.annotation, target);
      }, 60);
    };
    const activateTouch = (event) => {
      if (event.pointerType !== 'touch') return false;
      event.preventDefault();
      event.stopPropagation();
      if (this.activeTouchElement !== element) {
        if (this.activeTouchElement) {
          this.activeTouchElement.group.classList.remove('is-hovered');
          this.activeTouchElement.label.classList.remove('is-hovered');
          this.activeTouchElement.polygon.style.display = 'none';
        }
        this.activeTouchElement = element;
        setHovered(true, event.currentTarget);
        suppressClick = true;
        return false;
      }
      suppressClick = true;
      this.options.onClick?.(element.annotation, event);
      return true;
    };
    const stopTouchPropagation = (event) => {
      // Area Landmark owns its own interaction surface. Do not let a press
      // start the panorama drag handler beneath the SVG/label.
      event.stopPropagation();
    };
    const handleClick = (event) => {
      event.stopPropagation();
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      this.options.onClick?.(element.annotation, event);
    };
    const bindTouchActivation = (target) => {
      target.addEventListener('pointerdown', stopTouchPropagation);
      target.addEventListener('pointermove', stopTouchPropagation);
      target.addEventListener('pointerup', activateTouch);
      target.addEventListener('pointercancel', stopTouchPropagation);
      target.addEventListener('click', handleClick);
    };
    bindTouchActivation(label);
    label.addEventListener('mouseenter', () => setHovered(true, label));
    label.addEventListener('mouseleave', () => setHovered(false, label));
    polygon.style.pointerEvents = 'auto';
    bindTouchActivation(polygon);
    polygon.addEventListener('mouseenter', () => setHovered(true, polygon));
    polygon.addEventListener('mouseleave', () => setHovered(false, polygon));
    anchor.style.pointerEvents = 'auto';
    bindTouchActivation(anchor);
    anchor.addEventListener('mouseenter', () => setHovered(true, anchor));
    anchor.addEventListener('mouseleave', () => setHovered(false, anchor));
    this.svg.appendChild(group); this.container.appendChild(label);
    if (this.options.editMode) this._enableLabelDrag(label, annotation);
    this.elements.set(id, element);
    return element;
  }

  _enableLabelDrag(label, annotation) {
    let start = null;
    label.addEventListener('pointerdown', (event) => {
      start = { x: event.clientX, y: event.clientY };
      label.setPointerCapture?.(event.pointerId);
      event.stopPropagation();
    });
    label.addEventListener('pointerup', (event) => {
      if (!start) return;
      const rect = this.container.getBoundingClientRect();
      this.options.onLabelDragEnd?.(annotation, { x: event.clientX - start.x, y: event.clientY - start.y, rect });
      start = null;
    });
  }

  update(camera, width, height) {
    this._camera = camera; this._width = width; this._height = height;
    camera.getWorldDirection(this.cameraDirection);
    const scale = computeLabelScale(camera.fov, width, height);
    const seen = new Set();
    this.annotations.forEach((annotation, index) => {
      const id = String(annotation.id || index); seen.add(id);
      const element = this.elements.get(id) || this._createElement(annotation, index);
      element.annotation = annotation;
      const points = normalizeLandmarkVertices(annotation);
      const anchorPoint = annotation.anchor || calculateLandmarkAnchor(points);
      const geometry = projectLandmarkGeometry(points, anchorPoint, camera, width, height, this.vector, this.direction, this.cameraDirection);
      if (!geometry) { element.group.style.display = 'none'; element.label.style.display = 'none'; return; }
      const { projectedVertices: projected, anchor } = geometry;
      const style = mergeStyle(annotation.style);
      const positions = projected.filter(Boolean).map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
      element.group.style.display = '';
      element.group.classList.toggle('is-selected', this.selectedId === id);
      element.polygon.style.display = '';
      element.polygon.setAttribute('points', positions);
      element.polygon.setAttribute('fill', 'none');
      element.polygon.setAttribute('fill-opacity', '0');
      element.polygon.setAttribute('stroke', style.border);
      element.polygon.setAttribute('stroke-width', '1');
      element.polygon.setAttribute('stroke-dasharray', '4 4');
      element.polygon.setAttribute('stroke-linecap', 'round');
      element.polygon.setAttribute('stroke-linejoin', 'round');
      element.group.style.setProperty('--area-landmark-hover-fill', style.hoverFill);
      element.group.style.setProperty('--area-landmark-hover-border', style.hoverBorder);
      element.line.setAttribute('x1', String(anchor.x)); element.line.setAttribute('y1', String(anchor.y));
      const labelX = anchor.x;
      const baseOffset = Math.max(40, Number(annotation.line_height || annotation.lineHeight) || 48) * 2;
      const labelOffset = baseOffset * scale;
      const labelBottom = anchor.y - labelOffset;
      element.label.style.display = '';
      element.label.textContent = annotation.label?.text || annotation.label || annotation.name || 'Area Landmark';
      element.label.title = annotation.metadata?.description || annotation.raw?.khi_dua_chuot_vao?.van_ban_huong_dan || '';
      element.label.style.setProperty('--area-landmark-fill', style.fill);
      const labelHeight = element.label.offsetHeight || 32;
      const labelTop = labelBottom - labelHeight;
      element.line.setAttribute('x2', String(labelX)); element.line.setAttribute('y2', String(labelBottom));
      element.line.setAttribute('stroke', style.line || '#ffffff'); element.line.setAttribute('stroke-width', String(2 * scale)); element.line.setAttribute('stroke-dasharray', `${6 * scale} ${4 * scale}`);
      element.anchor.setAttribute('cx', String(anchor.x)); element.anchor.setAttribute('cy', String(anchor.y)); element.anchor.setAttribute('r', String(5.5 * scale)); element.anchor.setAttribute('fill', '#ff5a1f'); element.anchor.setAttribute('stroke', '#fff'); element.anchor.setAttribute('stroke-width', String(2 * scale));
      element.anchor.style.cursor = 'pointer';
      if (this.options.editMode) {
        while (element.vertices.length < projected.length) {
          const vertex = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          vertex.classList.add('area-landmark-vertex');
          vertex.style.pointerEvents = 'auto';
          vertex.setAttribute('r', '4'); vertex.setAttribute('fill', '#fff'); vertex.setAttribute('stroke', style.border); vertex.setAttribute('stroke-width', '2');
          element.group.appendChild(vertex); element.vertices.push(vertex);
        }
        element.vertices.forEach((vertex, vertexIndex) => {
          const point = projected[vertexIndex];
          vertex.style.display = point ? '' : 'none';
          if (!point) return;
          vertex.setAttribute('cx', String(point.x)); vertex.setAttribute('cy', String(point.y));
          vertex.onpointerup = (event) => {
            event.stopPropagation();
            const rect = this.container.getBoundingClientRect();
            this.options.onVertexDragEnd?.(annotation, vertexIndex, { x: event.clientX, y: event.clientY, rect });
          };
        });
      }
      element.label.style.transform = `translate3d(${labelX}px, ${labelTop}px, 0) translateX(-50%) scale(${scale})`;
      element._labelX = labelX;
      element._labelTop = labelTop;
      element._labelBottom = labelBottom;
      element.group.classList.toggle('is-editor', this.options.editMode);
    });
    if (!this.options.editMode) this._resolveCollisions(scale, width, height);
  }

  _resolveCollisions(scale, width, height) {
    const items = [];
    for (const [, el] of this.elements) {
      if (el.label.style.display === 'none' || el.group.style.display === 'none') continue;
      items.push(el);
    }
    if (items.length < 2) return;

    const GAP = 4 * scale;
    const maxDisplace = Math.max(40, Math.min(width, height) * 0.12);
    const containerRect = this.container.getBoundingClientRect();

    const entries = items.map((el) => ({
      el,
      rect: el.label.getBoundingClientRect(),
      dx: 0,
      dy: 0,
    }));

    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const a = entries[i];
          const b = entries[j];
          const al = a.rect.left + a.dx;
          const ar = a.rect.right + a.dx;
          const at = a.rect.top + a.dy;
          const ab = a.rect.bottom + a.dy;
          const bl = b.rect.left + b.dx;
          const br = b.rect.right + b.dx;
          const bt = b.rect.top + b.dy;
          const bb = b.rect.bottom + b.dy;
          const ox = Math.min(ar, br) - Math.max(al, bl) + GAP;
          const oy = Math.min(ab, bb) - Math.max(at, bt) + GAP;
          if (ox <= 0 || oy <= 0) continue;
          moved = true;
          if (ox <= oy) {
            const half = ox / 2;
            if ((al + ar) <= (bl + br)) { a.dx -= half; b.dx += half; }
            else { a.dx += half; b.dx -= half; }
          } else {
            const half = oy / 2;
            if ((at + ab) <= (bt + bb)) { a.dy -= half; b.dy += half; }
            else { a.dy += half; b.dy -= half; }
          }
        }
      }
      if (!moved) break;
    }

    for (const { el, rect, dx, dy } of entries) {
      if (dx === 0 && dy === 0) continue;
      let fdx = dx;
      let fdy = dy;
      const dist = Math.sqrt(fdx * fdx + fdy * fdy);
      if (dist > maxDisplace) { const r = maxDisplace / dist; fdx *= r; fdy *= r; }
      const nl = rect.left + fdx;
      const nr = rect.right + fdx;
      const nt = rect.top + fdy;
      const nb = rect.bottom + fdy;
      if (nl < containerRect.left) fdx += containerRect.left - nl;
      if (nr > containerRect.right) fdx -= nr - containerRect.right;
      if (nt < containerRect.top) fdy += containerRect.top - nt;
      if (nb > containerRect.bottom) fdy -= nb - containerRect.bottom;
      el.label.style.transform = `translate3d(${el._labelX + fdx}px, ${el._labelTop + fdy}px, 0) translateX(-50%) scale(${scale})`;
      el.line.setAttribute('x2', String(el._labelX + fdx));
      el.line.setAttribute('y2', String(el._labelBottom + fdy));
    }
  }

  dispose() { this.elements.forEach((element) => { element.group.remove(); element.label.remove(); }); this.elements.clear(); this.svg.remove(); }
}
