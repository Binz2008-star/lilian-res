// Shared monochrome UI icons. Static SVG works without JavaScript or a CDN.
const paths = {
  'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
  'arrow-down': '<path d="M12 5v14m-6-6 6 6 6-6"/>',
  'arrow-up': '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  'arrow-left': '<path d="M19 12H5m6-6-6 6 6 6"/>',
  'location': '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  'close': '<path d="m6 6 12 12M18 6 6 18"/>'
};
export function uiIcon(name) {
  if (!Object.hasOwn(paths, name)) throw new Error(`Unknown UI icon: ${name}`);
  return `<svg class="ui-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><use href="#ui-${name}"></use></svg>`;
}
export const iconSprite = `<svg class="ui-sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${Object.entries(paths).map(([name, content]) => `<symbol id="ui-${name}" viewBox="0 0 24 24">${content}</symbol>`).join('')}</defs></svg>`;
