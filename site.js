(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const story = document.querySelector('.story');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const links = [...nav.querySelectorAll('a[href^="#"]')];

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) setMenu(false);
  });

  function onScroll() {
    const storyFinished = story.getBoundingClientRect().bottom <= header.offsetHeight + 10;
    const contentMode = storyFinished || matchMedia('(prefers-reduced-motion: reduce)').matches;
    header.classList.toggle('is-content', contentMode);
    header.classList.toggle('is-scrolled', scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    const observed = ['inicio', 'comite', 'objetivos', 'equipo', 'actividad', 'recursos']
      .map(id => document.getElementById(id));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.hash === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    observed.forEach(section => observer.observe(section));
  }
})();
