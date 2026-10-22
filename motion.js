(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const image = document.querySelector('.hero-image');
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const animated = new Set();
  let observer = null;
  let frame = 0;
  let parallaxActive = false;

  function revealEverything() {
    observer?.disconnect();
    reveals.forEach((element) => {
      element.classList.remove('reveal-pending');
      element.classList.add('is-revealed');
    });
    animated.forEach((animation) => animation.cancel());
    animated.clear();
    document.documentElement.classList.remove('motion-ready');
    if (image) image.style.transform = '';
  }

  function enter(element, duration, delay) {
    if (!element || !element.animate || reduceMotion.matches) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(14px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    animated.add(animation);
    animation.finished.then(() => animated.delete(animation)).catch(() => {});
  }

  function setupReveals() {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealEverything();
      return;
    }
    document.documentElement.classList.add('motion-ready');
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach((element) => {
      if (element.classList.contains('is-revealed')) return;
      // Content already in the viewport is never hidden behind a delayed reveal.
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.classList.add('is-revealed');
      } else {
        element.classList.add('reveal-pending');
        observer.observe(element);
      }
    });
  }

  function updateParallax() {
    frame = 0;
    if (!image || !hero || !parallaxActive || reduceMotion.matches || document.hidden) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top > window.innerHeight) return;
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    image.style.transform = `translate3d(0, ${progress * 16}px, 0) scale(1.045)`;
  }

  function requestParallax() {
    if (frame || !parallaxActive) return;
    frame = window.requestAnimationFrame(updateParallax);
  }

  function setupParallax() {
    parallaxActive = desktopPointer.matches && !reduceMotion.matches;
    if (!parallaxActive && image) image.style.transform = '';
    if (parallaxActive) requestParallax();
  }

  setupReveals();
  setupParallax();
  if (!reduceMotion.matches) {
    document.querySelectorAll('.hero-line').forEach((line, index) => enter(line, 560, index * 70));
    enter(document.querySelector('.hero-intro'), 500, 120);
    enter(document.querySelector('.hero-actions'), 500, 160);
  }
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', setupParallax, { passive: true });
  document.addEventListener('visibilitychange', setupParallax);
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) revealEverything();
    else setupReveals();
    setupParallax();
  });
  desktopPointer.addEventListener('change', setupParallax);
})();
