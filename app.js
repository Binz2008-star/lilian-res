(() => {
  const data = window.LILIAN_SITE;
  if (!data) return;

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll('[data-address]').forEach((node) => {
    node.textContent = data.cityLabel;
  });
  document.querySelectorAll('[data-hours-summary]').forEach((node) => {
    node.textContent = data.hoursSummary;
  });
  document.querySelectorAll('[data-contact]').forEach((node) => {
    node.textContent = data.contactSummary;
  });

  const hoursList = document.querySelector('[data-hours-list]');
  if (hoursList && Array.isArray(data.exampleHours)) {
    hoursList.innerHTML = data.exampleHours.map(([day, hours]) => `
      <li><span>${day}</span><span>${hours}</span></li>
    `).join('');
  }

  const menuRoot = document.querySelector('#menu-items');
  const categories = [...new Set(data.menu.map((item) => item.category))];
  const categoryTitles = Object.fromEntries(data.menu.map((item) => [item.category, item.categoryLabel]));

  function renderMenu(filter = 'alles') {
    const visible = filter === 'alles' ? data.menu : data.menu.filter((item) => item.category === filter);
    const groups = categories
      .map((category) => ({ category, items: visible.filter((item) => item.category === category) }))
      .filter((group) => group.items.length);

    menuRoot.innerHTML = groups.map((group) => `
      <section class="menu-group" aria-label="${categoryTitles[group.category]}">
        <h3>${categoryTitles[group.category]}</h3>
        ${group.items.map((item) => `
          <article class="menu-item">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <span class="menu-price">${item.price}*</span>
          </article>
        `).join('')}
      </section>
    `).join('');
  }

  renderMenu();
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      renderMenu(button.dataset.filter);
    });
  });

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

  const booking = document.querySelector('[data-reservation-link]');
  if (data.reservationUrl) {
    booking.href = data.reservationUrl;
    booking.target = '_blank';
    booking.rel = 'noreferrer';
    booking.innerHTML = 'Reserveer een tafel <span aria-hidden="true">↗</span>';
  }
})();
