(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const image = document.querySelector('.hero-image');
  const heroPicture = document.querySelector('.hero-visual picture');
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const animated = new Set();
  let observer = null;
  let frame = 0;
  let parallaxActive = false;

  function revealEverything() {
    observer?.disconnect();
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    reveals.forEach((element) => {
      element.classList.remove('reveal-pending');
      element.classList.add('is-revealed');
    });
    animated.forEach((animation) => animation.cancel());
    animated.clear();
    document.documentElement.classList.remove('motion-ready');
    if (image) image.style.transform = '';
  }

  function play(element, keyframes, options) {
    if (!element?.animate || reduceMotion.matches) return;
    const animation = element.animate(keyframes, options);
    animated.add(animation);
    animation.finished.then(() => animated.delete(animation)).catch(() => {});
  }

  function enter(element, duration, delay = 0, initialOpacity = 0) {
    if (!element || reduceMotion.matches) return;
    play(element, [
      { opacity: initialOpacity, transform: 'translate3d(0, 12px, 0)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
  }

  function enterHeroPicture() {
    play(heroPicture, [
      { opacity: 0.92, transform: 'translate3d(0, 12px, 0) scale(1.03)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
    ], { duration: 640, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
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
    if (!parallaxActive) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (image) image.style.transform = '';
    }
    if (parallaxActive) requestParallax();
  }

  setupReveals();
  setupParallax();
  if (!reduceMotion.matches) {
    enterHeroPicture();
    enter(document.querySelector('#hero-title'), 450, 0, 0.78);
    enter(document.querySelector('.hero-intro'), 420, 70);
    enter(document.querySelector('.hero-actions'), 420, 110);
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
