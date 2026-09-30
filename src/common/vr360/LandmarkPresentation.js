import * as THREE from 'three';

export const LANDMARK_STYLE = Object.freeze({ fill: '#fbbf24', line: '#ffffff' });

export function projectLonLat(point, camera, width, height, vector = new THREE.Vector3(), direction = new THREE.Vector3(), cameraDirection = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(90 - Number(point.lat || 0));
  const theta = THREE.MathUtils.degToRad(Number(point.lon || 0));
  vector.set(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
  direction.copy(vector).normalize();
  if (cameraDirection.lengthSq() === 0) camera.getWorldDirection(cameraDirection);
  if (cameraDirection.dot(direction) <= 0) return null;
  vector.project(camera);
  if (vector.z < -1 || vector.z > 1) return null;
  return { x: (vector.x * 0.5 + 0.5) * width, y: (-vector.y * 0.5 + 0.5) * height };
}

/** Shared point landmark DOM/presentation. Geometry owners provide the anchor. */
export class LandmarkPresentation {
  constructor(container, { editMode = false, onClick, onHover, onHoverEnd } = {}) {
    this.container = container; this.options = { editMode, onClick, onHover, onHoverEnd }; this.items = new Map();
    this.layer = document.createElement('div'); this.layer.className = 'landmark-presentation-layer';
    this.layer.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:10;';
    container.appendChild(this.layer);
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.className.baseVal = 'landmark-layer'; this.svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0;';
    this.layer.appendChild(this.svg);
  }
  upsert(id, annotation) {
    let item = this.items.get(id); if (item) { item.annotation = annotation; return item; }
    item = { annotation };
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g'); group.classList.add('landmark-presentation');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); group.append(line, anchor);
    const label = document.createElement('button'); label.type = 'button'; label.className = 'landmark-label';
    const click = (event) => { event.stopPropagation(); this.options.onClick?.(item.annotation, event); };
    [label, anchor].forEach((el) => { el.addEventListener('click', click); el.addEventListener('mouseenter', () => { group.classList.add('is-hovered'); label.classList.add('is-hovered'); this.options.onHover?.(item.annotation, el); }); el.addEventListener('mouseleave', () => { group.classList.remove('is-hovered'); label.classList.remove('is-hovered'); this.options.onHoverEnd?.(item.annotation, el); }); });
    group.style.pointerEvents = 'none'; anchor.style.pointerEvents = 'auto'; this.svg.appendChild(group); this.layer.appendChild(label);
    label.style.pointerEvents = 'auto'; label.style.position = 'absolute'; label.style.zIndex = '1'; Object.assign(item, { group, line, anchor, label }); this.items.set(id, item); return item;
  }
  update(item, position, annotation) {
    const { group, line, anchor, label } = item; const labelText = annotation.label?.text || annotation.label || annotation.name || 'Địa danh';
    group.style.display = position ? '' : 'none'; label.style.display = position ? '' : 'none'; if (!position) return;
    const offset = Math.max(40, Number(annotation.line_height || annotation.lineHeight) || 48) * 2; label.textContent = labelText; label.title = annotation.metadata?.description || '';
    const bottom = position.y - offset; label.style.transform = `translate3d(${position.x}px, ${bottom - (label.offsetHeight || 32)}px, 0) translateX(-50%)`;
    line.setAttribute('x1', position.x); line.setAttribute('y1', position.y); line.setAttribute('x2', position.x); line.setAttribute('y2', bottom); line.setAttribute('stroke', annotation.style?.line || LANDMARK_STYLE.line); line.setAttribute('stroke-width', '2'); line.setAttribute('stroke-dasharray', '6 4');
    anchor.setAttribute('cx', position.x); anchor.setAttribute('cy', position.y); anchor.setAttribute('r', '5.5'); anchor.setAttribute('fill', '#ff5a1f'); anchor.setAttribute('stroke', '#fff'); anchor.setAttribute('stroke-width', '2');
  }
  removeMissing(ids) { for (const [id, item] of this.items) if (!ids.has(id)) { item.group.remove(); item.label.remove(); this.items.delete(id); } }
  dispose() { for (const item of this.items.values()) { item.group.remove(); item.label.remove(); } this.items.clear(); this.layer.remove(); }
}
