export const NAV_STYLES = {
  default: 'default',
  previewExpand: 'preview_expand',
};

export function normalizeNavStyle(navStyle) {
  if (navStyle === 'arrow') return NAV_STYLES.default;
  return Object.values(NAV_STYLES).includes(navStyle) ? navStyle : NAV_STYLES.default;
}
