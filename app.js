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
  document.querySelectorAll('a[href="https://www.lilianrestaurant.nl/#menu"]').forEach((link) => {
    link.href = data.menuUrl;
  });
  document.querySelectorAll('a[href="https://www.lilianrestaurant.nl/bestellen"]').forEach((link) => {
    link.href = data.orderUrl;
  });

  const filters = document.querySelector('#category-filters');
  const menuRoot = document.querySelector('#menu-categories');
  const results = document.querySelector('#results-count');
  const detailsDialog = document.querySelector('#product-dialog');
  const dialogTitle = document.querySelector('#product-dialog-title');
  const dialogCategory = document.querySelector('#product-dialog-category');
  const dialogPrice = document.querySelector('#product-dialog-price');
  const dialogDescription = document.querySelector('#product-dialog-description');
  const dialogOrderLink = document.querySelector('#product-dialog-order');
  let lastProductTrigger = null;

  function renderMenu(activeCategory = 'all', restoreFilterFocus = false) {
    const filterScrollLeft = filters.scrollLeft;
    const visibleCategories = activeCategory === 'all'
      ? data.categories
      : data.categories.filter((category) => category.id === activeCategory);

    filters.innerHTML = [
      `<button class="filter-button${activeCategory === 'all' ? ' is-active' : ''}" type="button" data-category-filter="all" aria-pressed="${activeCategory === 'all'}">Alles</button>`,
      ...data.categories.map((category) => `<button class="filter-button${activeCategory === category.id ? ' is-active' : ''}" type="button" data-category-filter="${escapeHTML(category.id)}" aria-pressed="${activeCategory === category.id}">${escapeHTML(category.label)}</button>`)
    ].join('');
    filters.scrollLeft = filterScrollLeft;

    menuRoot.innerHTML = visibleCategories.map((category) => {
      const items = data.products.filter((product) => product.categoryId === category.id);
      return `
        <section class="menu-category" aria-labelledby="category-${escapeHTML(category.id)}">
          <header class="category-heading">
            <h3 id="category-${escapeHTML(category.id)}">${escapeHTML(category.label)}</h3>
            <span class="category-count">${items.length} ${items.length === 1 ? 'ITEM' : 'ITEMS'}</span>
          </header>
          <ul class="product-list">
            ${items.map((item) => {
              const label = `${item.name}, ${money.format(item.priceCents / 100)}`;
              return `
                <li class="product-item">
                  <button class="product-card" type="button" data-product-trigger data-product-id="${escapeHTML(item.id)}" aria-haspopup="dialog" aria-controls="product-dialog" aria-label="Bekijk ${escapeHTML(label)}">
                    <span class="product-topline">
                      <span class="product-name">${escapeHTML(item.name)}</span>
                      <span class="product-price">${money.format(item.priceCents / 100)}</span>
                    </span>
                    ${item.description ? `<span class="product-description">${escapeHTML(item.description)}</span>` : ''}
                    <span class="product-open-hint">Bekijk gerecht <span aria-hidden="true">↗</span></span>
                  </button>
                </li>`;
            }).join('')}
          </ul>
        </section>`;
    }).join('');

    const count = activeCategory === 'all'
      ? data.products.length
      : data.products.filter((product) => product.categoryId === activeCategory).length;
    const categoryLabel = visibleCategories[0]?.label;
    results.textContent = `${count} ${count === 1 ? 'menu-item' : 'menu-items'}${activeCategory === 'all' ? ' op de kaart' : ` in ${categoryLabel}`}`;

    filters.querySelectorAll('[data-category-filter]').forEach((button) => {
      button.addEventListener('click', () => renderMenu(button.dataset.categoryFilter, true));
    });

    if (restoreFilterFocus) {
      [...filters.querySelectorAll('[data-category-filter]')]
        .find((button) => button.dataset.categoryFilter === activeCategory)
        ?.focus({ preventScroll: true });
    }
  }

  renderMenu();

  function openProductDetails(product, trigger) {
    if (!product || !detailsDialog) return;
    lastProductTrigger = trigger;
    const category = data.categories.find((entry) => entry.id === product.categoryId);

    dialogTitle.textContent = product.name;
    dialogCategory.textContent = category?.label ?? 'LILIAN · MENU';
    dialogPrice.textContent = money.format(product.priceCents / 100);
    dialogDescription.textContent = product.description || '';
    dialogDescription.hidden = !product.description;
    dialogOrderLink.href = `${data.productAnchorBaseUrl}${encodeURIComponent(product.id)}`;
    dialogOrderLink.setAttribute('aria-label', `Bekijk ${product.name} op de officiële menukaart van Lilian`);

    if (typeof detailsDialog.showModal === 'function') {
      detailsDialog.showModal();
    } else {
      detailsDialog.setAttribute('open', '');
      document.querySelector('#product-dialog-continue')?.focus();
    }
  }

  menuRoot.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-product-trigger]');
    if (!trigger) return;
    const product = data.products.find((entry) => String(entry.id) === trigger.dataset.productId);
    openProductDetails(product, trigger);
  });

  const closeDialog = () => {
    if (typeof detailsDialog?.close === 'function' && detailsDialog.open) {
      detailsDialog.close();
    } else {
      detailsDialog?.removeAttribute('open');
    }
  };

  document.querySelector('#product-dialog-close')?.addEventListener('click', closeDialog);
  document.querySelector('#product-dialog-continue')?.addEventListener('click', closeDialog);
  detailsDialog?.addEventListener('click', (event) => {
    if (event.target === detailsDialog) closeDialog();
  });
  detailsDialog?.addEventListener('close', () => {
    lastProductTrigger?.focus({ preventScroll: true });
  });

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
