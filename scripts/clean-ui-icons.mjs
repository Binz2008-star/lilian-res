import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uiIcon, iconSprite } from './ui-icons.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const icons = { '↗': 'arrow-up-right', '↓': 'arrow-down', '↑': 'arrow-up', '←': 'arrow-left', '⌖': 'location', '×': 'close' };
// Only explicit decorative icon spans and three named UI controls are touched.
// Product names/descriptions, attributes, URLs and JSON-LD are never scrubbed.
html = html.replace(/(<span\b[^>]*\baria-hidden="true"[^>]*>)\s*([↗↓↑←⌖×])\s*(<\/span>)/g,
  (_, open, character, close) => open + uiIcon(icons[character]) + close);
html = html.replace(/(<div class="food-seal"[^>]*>[\s\S]*?<span>)\s*↗\s*(?=<\/span>)/g,
  (_, open) => open + uiIcon('arrow-up-right'));
html = html.replace(/(<button\b(?=[^>]*\bid="(?:search-clear|product-dialog-close)")[^>]*>)\s*×\s*(?=<\/button>)/g,
  (_, open) => open + uiIcon('close'));
html = html.replace(/(<button\b(?=[^>]*\bid="product-dialog-continue")[^>]*>)←\s*/g,
  (_, open) => open + uiIcon('arrow-left') + ' ');
const block = `<!-- UI-ICONS:START -->\n${iconSprite}\n<!-- UI-ICONS:END -->`;
if (html.includes('<!-- UI-ICONS:START -->')) html = html.replace(/<!-- UI-ICONS:START -->[\s\S]*?<!-- UI-ICONS:END -->/, block);
else html = html.replace('  <body>', '  <body>\n    ' + block);
fs.writeFileSync(file, html);
console.log('Explicit UI icon placeholders replaced; all restaurant copy preserved.');
