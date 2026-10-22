import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uiIcon, iconSprite } from './ui-icons.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'restaurant-data.js'), 'utf8'), context);
const data = context.window.LILIAN_SITE;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
const ids = new Set(data.products.map((item) => item.id));
if (ids.size !== data.products.length || data.products.length !== 125 || data.categories.length !== 14) {
  throw new Error('The catalogue must retain 125 unique products and 14 categories.');
}
const grouped = data.categories.map((category) => ({
  ...category, products: data.products.filter((product) => product.categoryId === category.id)
}));
if (grouped.some((category) => !category.products.length) || grouped.reduce((n, category) => n + category.products.length, 0) !== 125) {
  throw new Error('Each product must belong to a valid non-empty category.');
}

const filters = [
  '<button class="filter-button" type="button" data-category-filter="all" aria-pressed="false">Alles <span class="filter-count">125</span></button>',
  ...grouped.map((category) => `<button class="filter-button" type="button" data-category-filter="${esc(category.id)}" aria-pressed="false">${esc(category.label)} <span class="filter-count">${category.products.length}</span></button>`)
].join('\n');
const menu = grouped.map((category) => `
<section class="menu-category" data-category-id="${esc(category.id)}" aria-labelledby="category-${esc(category.id)}"${category.id !== 'burgers' ? ' hidden' : ''}>
  <header class="category-heading"><h3 id="category-${esc(category.id)}">${esc(category.label)}</h3><span class="category-count" data-category-count="${esc(category.id)}">${category.products.length} menu-items</span></header>
  <ul class="product-list">${category.products.map((product) => `
    <li class="product-item" data-product-id="${esc(product.id)}">
      <button class="product-card" type="button" data-product-trigger data-product-id="${esc(product.id)}" aria-haspopup="dialog" aria-controls="product-dialog">
        <span class="product-topline"><span class="product-name">${esc(product.name)}</span><span class="product-price">${esc(money.format(product.priceCents / 100))}</span></span>
        ${product.description ? `<span class="product-description">${esc(product.description)}</span>` : ''}
        <span class="product-open-hint">Bekijk gerecht <span aria-hidden="true">${uiIcon('arrow-up-right')}</span></span>
      </button>
      <noscript><a class="nojs-product-order" href="${esc(data.productAnchorBaseUrl + encodeURIComponent(product.id))}" target="_blank" rel="noopener noreferrer">Open ${esc(product.name)} bij Lilian <span aria-hidden="true">${uiIcon('arrow-up-right')}</span><span class="sr-only"> (nieuw tabblad)</span></a></noscript>
    </li>`).join('')}
  </ul>
</section>`).join('\n');
const hours = data.hours.map(([day, times]) => `<li><span>${esc(day)}</span><strong>${esc(times)}</strong></li>`).join('\n');
const baseUrl = 'https://binz2008-star.github.io/lilian-res/';
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Restaurant', '@id': `${baseUrl}#restaurant`, name: data.name,
      url: baseUrl, sameAs: data.sourceUrl, telephone: '+31647789977',
      image: `${baseUrl}assets/lilian-logo.webp`, logo: `${baseUrl}assets/lilian-logo.webp`,
      address: { '@type': 'PostalAddress', streetAddress: 'Voorstreek 86', postalCode: '8911 JT', addressLocality: 'Leeuwarden', addressCountry: 'NL' },
      hasMap: data.mapUrl, hasMenu: { '@id': `${baseUrl}#restaurant-menu` }
      // Hours are visibly sourced but deliberately not encoded as live availability or a guarantee.
    },
    {
      '@type': 'Menu', '@id': `${baseUrl}#restaurant-menu`, name: 'De menukaart van Lilian', url: `${baseUrl}#menu`, inLanguage: 'nl-NL',
      hasMenuSection: grouped.map((category) => ({
        '@type': 'MenuSection', name: category.label,
        hasMenuItem: category.products.map((product) => ({
          '@type': 'MenuItem', name: product.name, ...(product.description ? { description: product.description } : {}),
          url: `${data.productAnchorBaseUrl}${encodeURIComponent(product.id)}`,
          offers: { '@type': 'Offer', price: (product.priceCents / 100).toFixed(2), priceCurrency: 'EUR', url: `${data.productAnchorBaseUrl}${encodeURIComponent(product.id)}` }
        }))
      }))
    }
  ]
};
const schemaHTML = `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function replaceBlock(marker, value) {
  const start = `<!-- ${marker}:START -->`;
  const end = `<!-- ${marker}:END -->`;
  const left = html.indexOf(start);
  const right = html.indexOf(end);
  if (left < 0 || right <= left) throw new Error(`Missing ${marker} markers.`);
  html = html.slice(0, left + start.length) + '\n' + value + '\n' + html.slice(right);
}
replaceBlock('MENU-FILTERS', filters);
replaceBlock('MENU-CONTENT', menu);
replaceBlock('HOURS', hours);
replaceBlock('RESTAURANT-SCHEMA', schemaHTML);
replaceBlock('UI-ICONS', iconSprite);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Static catalogue regenerated: ${data.products.length} products, ${data.categories.length} categories, ${data.hours.length} hours rows.`);
