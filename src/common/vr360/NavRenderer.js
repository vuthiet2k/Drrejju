import { NAV_STYLES, normalizeNavStyle } from './tourDataMapper.js';

function renderDefault(el, { navArrowSrc }) {
  const marker = document.createElement('div');
  marker.className = 'hotspot-marker hotspot-marker-nav hotspot-walk';

  const image = document.createElement('img');
  image.className = 'hotspot-walk-img';
  image.src = navArrowSrc;
  image.alt = '';
  image.draggable = false;

  marker.appendChild(image);
  el.appendChild(marker);
}

function renderPreviewExpand(el, { targetScene }) {
  const marker = document.createElement('div');
  marker.className = 'hotspot-nav-preview-expand';
  const name = document.createElement('span');
  name.className = 'hotspot-nav-preview-expand-name';
  const media = document.createElement('span');
  media.className = 'hotspot-nav-preview-expand-media';
  marker.append(name, media);

  const setExpanded = (value) => {
    marker.classList.toggle('is-expanded', value);
    if (!value) {
      name.textContent = '';
      media.replaceChildren();
      return;
    }
    name.textContent = targetScene?.name || '';
    const thumbnail = targetScene?.thumb || targetScene?.image || '';
    if (thumbnail) {
      const image = document.createElement('img');
      image.className = 'hotspot-nav-preview-expand-img';
      image.src = thumbnail;
      image.alt = '';
      image.draggable = false;
      media.appendChild(image);
    }
  };
  marker.onmouseenter = () => setExpanded(true);
  marker.onmouseleave = () => setExpanded(false);
  el.appendChild(marker);
}

const navRendererMap = {
  [NAV_STYLES.default]: renderDefault,
  [NAV_STYLES.previewExpand]: renderPreviewExpand,
};

export function renderNavHotspot(el, hotspot, context = {}) {
  const renderer = navRendererMap[normalizeNavStyle(hotspot.navStyle)];
  renderer(el, context);
}
