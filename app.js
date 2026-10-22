(() => {
  const data = window.LILIAN_SITE;
  if (!data) return;

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const money = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const filters = document.querySelector('#category-filters');
  const menuRoot = document.querySelector('#menu-categories');
  const results = document.querySelector('#results-count');

  function renderMenu(activeCategory = 'all') {
    const visibleCategories = activeCategory === 'all'
      ? data.categories
      : data.categories.filter((category) => category.id === activeCategory);

    filters.innerHTML = [
      `<button class="filter-button${activeCategory === 'all' ? ' is-active' : ''}" type="button" data-category-filter="all" aria-pressed="${activeCategory === 'all'}">Alles</button>`,
      ...data.categories.map((category) => `<button class="filter-button${activeCategory === category.id ? ' is-active' : ''}" type="button" data-category-filter="${escapeHTML(category.id)}" aria-pressed="${activeCategory === category.id}">${escapeHTML(category.label)}</button>`)
    ].join('');

    menuRoot.innerHTML = visibleCategories.map((category) => {
      const items = data.products.filter((product) => product.categoryId === category.id);
      return `
        <section class="menu-category" aria-labelledby="category-${escapeHTML(category.id)}">
          <header class="category-heading">
            <h3 id="category-${escapeHTML(category.id)}">${escapeHTML(category.label)}</h3>
            <span class="category-count">${items.length} ${items.length === 1 ? 'ITEM' : 'ITEMS'}</span>
          </header>
          <ul class="product-list">
            ${items.map((item) => `
              <li class="product-item">
                <div class="product-topline">
                  <h4 class="product-name">${escapeHTML(item.name)}</h4>
                  <span class="product-price">${money.format(item.priceCents / 100)}</span>
                </div>
                ${item.description ? `<p class="product-description">${escapeHTML(item.description)}</p>` : ''}
              </li>
            `).join('')}
          </ul>
        </section>`;
    }).join('');

    const count = activeCategory === 'all'
      ? data.products.length
      : data.products.filter((product) => product.categoryId === activeCategory).length;
    results.textContent = `${count} ${count === 1 ? 'menu-item' : 'menu-items'}${activeCategory === 'all' ? ' op de kaart' : ` in ${visibleCategories[0].label}`}`;

    filters.querySelectorAll('[data-category-filter]').forEach((button) => {
      button.addEventListener('click', () => renderMenu(button.dataset.categoryFilter));
    });
  }

  renderMenu();

  const hoursList = document.querySelector('#hours-list');
  hoursList.innerHTML = data.hours.map(([day, hours]) => `
    <li><span>${escapeHTML(day)}</span><strong>${escapeHTML(hours)}</strong></li>
  `).join('');

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#main-nav');
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Menu openen' : 'Menu sluiten');
    nav.classList.toggle('is-open', !isOpen);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menu openen');
    nav.classList.remove('is-open');
  }));
})();
