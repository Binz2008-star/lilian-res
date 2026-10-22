(() => {
  'use strict';

  const site = window.LILIAN_SITE;
  const categories = Array.isArray(site?.categories) ? site.categories : [];
  const products = Array.isArray(site?.products) ? site.products : [];
  const categoriesById = new Map(categories.map((category) => [String(category.id), category]));
  const productsById = new Map(products.map((product) => [String(product.id), product]));
  const money = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  const menuRoot = document.querySelector('#menu-categories');
  const filters = document.querySelector('#category-filters');
  const searchInput = document.querySelector('#menu-search');
  const searchClear = document.querySelector('#search-clear');
  const menuReset = document.querySelector('#menu-reset');
  const menuEmpty = document.querySelector('#menu-empty');
  const resultsCount = document.querySelector('#results-count');
  const detailsDialog = document.querySelector('#product-dialog');
  const dialogTitle = document.querySelector('#product-dialog-title');
  const dialogCategory = document.querySelector('#product-dialog-category');
  const dialogPrice = document.querySelector('#product-dialog-price');
  const dialogDescription = document.querySelector('#product-dialog-description');
  const dialogOrderLink = document.querySelector('#product-dialog-order');
  const dialogClose = document.querySelector('#product-dialog-close');
  const dialogContinue = document.querySelector('#product-dialog-continue');

  if (resultsCount) resultsCount.setAttribute('aria-live', 'polite');

  const normalize = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('nl-NL')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim();

  const formatPrice = (priceCents) => money.format(Number(priceCents || 0) / 100);
  const categoryLabel = (categoryId) => categoriesById.get(String(categoryId))?.label ?? 'deze categorie';
  const hasReducedMotion = () => Boolean(reducedMotion?.matches);

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  if (site?.menuUrl) {
    document.querySelectorAll('[data-order-menu]').forEach((link) => {
      link.href = site.menuUrl;
    });
  }
  if (site?.orderUrl) {
    document.querySelectorAll('[data-order-checkout]').forEach((link) => {
      link.href = site.orderUrl;
    });
  }

  const hoursList = document.querySelector('#hours-list');
  if (hoursList && hoursList.children.length === 0 && Array.isArray(site?.hours)) {
    site.hours.forEach(([day, hours]) => {
      const item = document.createElement('li');
      const dayNode = document.createElement('span');
      const hoursNode = document.createElement('strong');
      dayNode.textContent = String(day ?? '');
      hoursNode.textContent = String(hours ?? '');
      item.append(dayNode, hoursNode);
      hoursList.append(item);
    });
  }

  const itemRecords = menuRoot
    ? [...menuRoot.querySelectorAll('.product-item[data-product-id]')].map((item) => {
      const section = item.closest('.menu-category[data-category-id]');
      const product = productsById.get(String(item.dataset.productId));
      return {
        item,
        section,
        product,
        categoryId: String(product?.categoryId ?? section?.dataset.categoryId ?? ''),
        searchable: normalize(`${product?.name ?? ''} ${product?.description ?? ''}`),
        visible: !item.hidden
      };
    })
    : [];
  const sections = menuRoot
    ? [...menuRoot.querySelectorAll('.menu-category[data-category-id]')]
    : [];
  const categoryFilterButtons = filters
    ? [...filters.querySelectorAll('[data-category-filter]')]
    : [];
  const selectableCategoryIds = new Set(['all', ...categories.map((category) => String(category.id))]);

  let selectedCategory = categoriesById.has('burgers') ? 'burgers' : 'all';
  let activeCardAnimations = [];

  const cancelCardAnimations = () => {
    activeCardAnimations.forEach((animation) => animation.cancel());
    activeCardAnimations = [];
  };

  const announceResults = (count, query) => {
    if (!resultsCount) return;
    const noun = count === 1 ? 'menu-item' : 'menu-items';
    if (query) {
      resultsCount.textContent = selectedCategory === 'all'
        ? `${count} ${noun} gevonden voor “${query}” in alle categorieën.`
        : `${count} ${noun} gevonden voor “${query}” in ${categoryLabel(selectedCategory)}.`;
      return;
    }
    resultsCount.textContent = selectedCategory === 'all'
      ? `${count} ${noun} op de kaart.`
      : `${count} ${noun} in ${categoryLabel(selectedCategory)}.`;
  };

  const updateCategoryCounts = (query) => {
    const counts = new Map(categories.map((category) => [String(category.id), 0]));
    itemRecords.forEach((record) => {
      if (!query || record.searchable.includes(query)) {
        counts.set(record.categoryId, (counts.get(record.categoryId) ?? 0) + 1);
      }
    });
    document.querySelectorAll('[data-category-count]').forEach((countNode) => {
      const categoryId = String(countNode.dataset.categoryCount ?? '');
      const count = counts.get(categoryId) ?? 0;
      countNode.textContent = `${count} ${count === 1 ? 'menu-item' : 'menu-items'}`;
    });
  };

  const updateFilterButtons = () => {
    categoryFilterButtons.forEach((button) => {
      const isActive = String(button.dataset.categoryFilter) === selectedCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const animateVisibleCards = () => {
    if (hasReducedMotion()) return;
    const visibleCards = itemRecords
      .filter((record) => record.visible)
      .map((record) => record.item.querySelector('[data-product-trigger]'))
      .filter(Boolean)
      .slice(0, 6);

    activeCardAnimations = visibleCards.map((card, index) => {
      const animation = card.animate([
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 180,
        delay: index * 20,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'both'
      });
      animation.finished.then(() => {
        if (activeCardAnimations.includes(animation)) animation.cancel();
      }).catch(() => {});
      return animation;
    });
  };

  const applyMenuState = ({ animateCards = false } = {}) => {
    cancelCardAnimations();
    const rawQuery = searchInput?.value ?? '';
    const query = normalize(rawQuery);
    const matchingBySection = new Map(sections.map((section) => [section, 0]));
    let visibleCount = 0;

    itemRecords.forEach((record) => {
      const categoryMatches = selectedCategory === 'all' || record.categoryId === selectedCategory;
      const queryMatches = !query || record.searchable.includes(query);
      record.visible = Boolean(record.product) && categoryMatches && queryMatches;
      record.item.hidden = !record.visible;
      if (record.visible) {
        visibleCount += 1;
        if (record.section) {
          matchingBySection.set(record.section, (matchingBySection.get(record.section) ?? 0) + 1);
        }
      }
    });

    sections.forEach((section) => {
      section.hidden = (matchingBySection.get(section) ?? 0) === 0;
    });

    updateFilterButtons();
    updateCategoryCounts(query);
    if (searchClear) searchClear.hidden = rawQuery.length === 0;
    if (menuEmpty) menuEmpty.hidden = visibleCount !== 0;
    announceResults(visibleCount, rawQuery.trim());

    if (animateCards) animateVisibleCards();
  };

  const selectCategory = (categoryId, options = {}) => {
    const nextCategory = String(categoryId);
    if (!selectableCategoryIds.has(nextCategory)) return;
    selectedCategory = nextCategory;
    applyMenuState(options);
  };

  categoryFilterButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      selectCategory(button.dataset.categoryFilter, { animateCards: event.detail !== 0 });
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      selectedCategory = 'all';
      applyMenuState();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', (event) => {
      event.preventDefault();
      if (searchInput) searchInput.value = '';
      selectedCategory = 'all';
      applyMenuState();
      searchInput?.focus({ preventScroll: true });
    });
  }

  if (menuReset) {
    menuReset.addEventListener('click', (event) => {
      event.preventDefault();
      if (searchInput) searchInput.value = '';
      selectedCategory = 'all';
      applyMenuState();
    });
  }

  document.querySelectorAll('[data-discover-category]').forEach((link) => {
    link.addEventListener('click', () => {
      const categoryId = String(link.dataset.discoverCategory ?? '');
      if (!selectableCategoryIds.has(categoryId)) return;
      if (searchInput) searchInput.value = '';
      selectedCategory = categoryId;
      applyMenuState();
    });
  });

  if (itemRecords.length > 0) {
    if (normalize(searchInput?.value ?? '')) selectedCategory = 'all';
    applyMenuState();
  }

  let lastProductTrigger = null;
  let dialogAnimation = null;
  let usesNativeDialog = false;
  let isClosingDialog = false;
  let fallbackBackdrop = null;
  let fallbackSiblings = [];
  const fallbackOriginalAttributes = detailsDialog ? {
    role: detailsDialog.getAttribute('role'),
    ariaModal: detailsDialog.getAttribute('aria-modal'),
    tabindex: detailsDialog.getAttribute('tabindex')
  } : null;

  const isDialogOpen = () => Boolean(detailsDialog?.open || detailsDialog?.hasAttribute('open'));
  const supportsNativeDialog = () => typeof detailsDialog?.showModal === 'function' && typeof detailsDialog?.close === 'function';

  const restoreAttribute = (element, name, value) => {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  };

  const activateDialogFallback = () => {
    if (!detailsDialog) return;
    usesNativeDialog = false;
    detailsDialog.setAttribute('open', '');
    detailsDialog.setAttribute('role', 'dialog');
    detailsDialog.setAttribute('aria-modal', 'true');
    detailsDialog.setAttribute('tabindex', '-1');
    detailsDialog.classList.add('is-fallback');
    fallbackBackdrop = document.createElement('div');
    fallbackBackdrop.className = 'dialog-fallback-backdrop';
    fallbackBackdrop.setAttribute('aria-hidden', 'true');
    document.body.append(fallbackBackdrop);
    fallbackSiblings = [...document.body.children]
      .filter((element) => element !== detailsDialog && element !== fallbackBackdrop)
      .map((element) => ({ element, inert: element.hasAttribute('inert'), ariaHidden: element.getAttribute('aria-hidden') }));
    fallbackSiblings.forEach(({ element }) => {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    });
  };

  const deactivateDialogFallback = () => {
    if (!detailsDialog || !fallbackOriginalAttributes) return;
    detailsDialog.removeAttribute('open');
    detailsDialog.classList.remove('is-fallback');
    fallbackBackdrop?.remove();
    fallbackBackdrop = null;
    fallbackSiblings.forEach(({ element, inert, ariaHidden }) => {
      if (!inert) element.removeAttribute('inert');
      restoreAttribute(element, 'aria-hidden', ariaHidden);
    });
    fallbackSiblings = [];
    restoreAttribute(detailsDialog, 'role', fallbackOriginalAttributes.role);
    restoreAttribute(detailsDialog, 'aria-modal', fallbackOriginalAttributes.ariaModal);
    restoreAttribute(detailsDialog, 'tabindex', fallbackOriginalAttributes.tabindex);
  };

  const interruptDialogAnimation = () => {
    if (!dialogAnimation) return null;
    let current = null;
    try {
      const computed = window.getComputedStyle(detailsDialog);
      current = {
        opacity: computed.opacity,
        transform: computed.transform === 'none' ? 'translateY(0) scale(1)' : computed.transform
      };
    } catch (_) {
      current = null;
    }
    dialogAnimation.cancel();
    dialogAnimation = null;
    return current;
  };

  const restoreProductTriggerFocus = () => {
    const trigger = lastProductTrigger;
    lastProductTrigger = null;
    if (trigger?.isConnected && typeof trigger.focus === 'function') {
      trigger.focus({ preventScroll: true });
    }
  };

  const finishDialogClose = () => {
    isClosingDialog = false;
    document.body?.classList.remove('dialog-open');
    if (!usesNativeDialog) deactivateDialogFallback();
    usesNativeDialog = false;
    restoreProductTriggerFocus();
  };

  const completeDialogClose = () => {
    if (!detailsDialog || !isDialogOpen()) return;
    if (usesNativeDialog && typeof detailsDialog.close === 'function') {
      try {
        detailsDialog.close();
        return;
      } catch (_) {
        // Fall through to the HTML fallback cleanup if a browser rejects close().
      }
    }
    deactivateDialogFallback();
    finishDialogClose();
  };

  const closeProductDialog = ({ instant = false } = {}) => {
    if (!detailsDialog || !isDialogOpen() || isClosingDialog) return;
    isClosingDialog = true;
    const interruptedFrame = interruptDialogAnimation();
    const finish = () => {
      if (!isDialogOpen()) return;
      completeDialogClose();
    };

    if (instant || hasReducedMotion() || typeof detailsDialog.animate !== 'function') {
      finish();
      return;
    }

    const animation = detailsDialog.animate([
      interruptedFrame ?? { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(8px) scale(.99)' }
    ], {
      duration: 140,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      fill: 'both'
    });
    dialogAnimation = animation;
    animation.finished.then(() => {
      if (dialogAnimation !== animation) return;
      dialogAnimation = null;
      animation.cancel();
      finish();
    }).catch(() => {});
  };

  const focusDialogClose = () => {
    const focusTarget = dialogClose ?? detailsDialog;
    if (!focusTarget?.isConnected) return;
    window.requestAnimationFrame(() => {
      if (isDialogOpen()) focusTarget.focus({ preventScroll: true });
    });
  };

  const openProductDetails = (product, trigger, { instant = false } = {}) => {
    if (!product || !detailsDialog) return;
    const interruptedFrame = interruptDialogAnimation();
    isClosingDialog = false;
    lastProductTrigger = trigger;

    if (dialogTitle) dialogTitle.textContent = String(product.name ?? 'Gerecht');
    if (dialogCategory) dialogCategory.textContent = categoryLabel(product.categoryId);
    if (dialogPrice) dialogPrice.textContent = formatPrice(product.priceCents);
    if (dialogDescription) {
      const description = String(product.description ?? '');
      dialogDescription.textContent = description;
      dialogDescription.hidden = !description;
    }
    if (dialogOrderLink && site?.productAnchorBaseUrl) {
      dialogOrderLink.href = `${site.productAnchorBaseUrl}${encodeURIComponent(String(product.id))}`;
      dialogOrderLink.setAttribute('aria-label', `Open dit gerecht bij Lilian: ${product.name} (opent in een nieuw tabblad)`);
      dialogOrderLink.target = '_blank';
      dialogOrderLink.rel = 'noopener noreferrer';
    }

    if (!isDialogOpen()) {
      if (supportsNativeDialog()) {
        try {
          detailsDialog.showModal();
          usesNativeDialog = true;
        } catch (_) {
          activateDialogFallback();
        }
      } else {
        activateDialogFallback();
      }
    }

    document.body?.classList.add('dialog-open');
    focusDialogClose();

    if (instant || hasReducedMotion() || typeof detailsDialog.animate !== 'function') return;
    const animation = detailsDialog.animate([
      interruptedFrame ?? { opacity: 0, transform: 'translateY(12px) scale(.98)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], {
      duration: 220,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      fill: 'both'
    });
    dialogAnimation = animation;
    animation.finished.then(() => {
      if (dialogAnimation !== animation) return;
      dialogAnimation = null;
      animation.cancel();
    }).catch(() => {});
  };

  if (menuRoot) {
    menuRoot.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-product-trigger][data-product-id]');
      if (!trigger || !menuRoot.contains(trigger)) return;
      const product = productsById.get(String(trigger.dataset.productId));
      openProductDetails(product, trigger, { instant: event.detail === 0 });
    });
  }

  dialogClose?.addEventListener('click', (event) => {
    closeProductDialog({ instant: event.detail === 0 });
  });
  dialogContinue?.addEventListener('click', (event) => {
    closeProductDialog({ instant: event.detail === 0 });
  });

  detailsDialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProductDialog({ instant: true });
  });
  detailsDialog?.addEventListener('close', () => {
    finishDialogClose();
  });

  document.addEventListener('click', (event) => {
    if (!detailsDialog || !isDialogOpen()) return;
    if (event.target !== detailsDialog && detailsDialog.contains(event.target)) return;
    const rect = detailsDialog.getBoundingClientRect();
    const outsideDialog = event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
    if (!outsideDialog) return;
    event.preventDefault();
    event.stopPropagation();
    closeProductDialog({ instant: event.detail === 0 });
  }, true);

  document.addEventListener('keydown', (event) => {
    if (!detailsDialog || !isDialogOpen()) return;
    if (event.key === 'Escape' && !usesNativeDialog) {
      event.preventDefault();
      closeProductDialog({ instant: true });
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [...detailsDialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && !element.closest('[hidden]'));
    if (focusable.length === 0) {
      event.preventDefault();
      detailsDialog.focus({ preventScroll: true });
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !detailsDialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (document.activeElement === last || !detailsDialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  });

  reducedMotion?.addEventListener('change', (event) => {
    if (!event.matches) return;
    cancelCardAnimations();
    const wasClosing = isClosingDialog;
    interruptDialogAnimation();
    if (wasClosing) completeDialogClose();
  });

  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('#main-nav');
  const isNavOpen = () => Boolean(navToggle && mainNav && navToggle.getAttribute('aria-expanded') === 'true');
  const setNavOpen = (open, { restoreFocus = false } = {}) => {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    mainNav.classList.toggle('is-open', open);
    if (!open && restoreFocus && navToggle.isConnected) {
      navToggle.focus({ preventScroll: true });
    }
  };

  if (navToggle && mainNav) {
    navToggle.setAttribute('aria-controls', mainNav.id);
    setNavOpen(false);
  }

  navToggle?.addEventListener('click', () => {
    setNavOpen(!isNavOpen());
  });
  mainNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
      const wasOpen = isNavOpen();
      setNavOpen(false);
      if (!wasOpen || event.detail !== 0) return;
      const href = link.getAttribute('href');
      const destination = href?.startsWith('#') ? document.querySelector(href) : null;
      if (destination) {
        destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
      } else {
        navToggle?.focus({ preventScroll: true });
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isNavOpen()) {
      event.preventDefault();
      setNavOpen(false, { restoreFocus: true });
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!isNavOpen() || !navToggle || !mainNav) return;
    if (navToggle.contains(event.target) || mainNav.contains(event.target)) return;
    setNavOpen(false);
  });

  const desktopNavMedia = window.matchMedia?.('(min-width: 900px)');
  const closeMobileNavAtDesktop = (event) => {
    if (event.matches) setNavOpen(false);
  };
  if (desktopNavMedia?.addEventListener) {
    desktopNavMedia.addEventListener('change', closeMobileNavAtDesktop);
  } else if (desktopNavMedia?.addListener) {
    desktopNavMedia.addListener(closeMobileNavAtDesktop);
  }

  const sectionLinks = mainNav
    ? [...mainNav.querySelectorAll('a[href^="#"]')].map((link) => ({
      link,
      section: document.querySelector(link.getAttribute('href'))
    })).filter(({ section }) => section)
    : [];
  const setCurrentNavSection = (sectionId) => {
    sectionLinks.forEach(({ link, section }) => {
      if (section.id === sectionId) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if (sectionLinks.length > 0 && 'IntersectionObserver' in window) {
    const intersections = new Map();
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) intersections.set(entry.target.id, entry);
        else intersections.delete(entry.target.id);
      });
      const current = [...intersections.values()]
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setCurrentNavSection(current.target.id);
    }, {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.15, 0.5]
    });
    sectionLinks.forEach(({ section }) => navObserver.observe(section));
  }
})();
