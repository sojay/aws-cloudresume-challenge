document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');
  const navLinks = panel ? Array.from(panel.querySelectorAll('a')) : [];

  const closeMenu = () => {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    body.classList.remove('nav-open');
  };

  const openMenu = () => {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    body.classList.add('nav-open');
  };

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (!body.classList.contains('nav-open')) return;
      if (header && header.contains(event.target)) return;
      closeMenu();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (targetElement instanceof HTMLElement) {
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
      }
    });
  });

  const counter = document.querySelector('[data-counter]');
  const updateCounter = async () => {
    if (!counter) return;
    try {
      const response = await fetch('https://kjnbxinxccc3nk7bs6r4qqx7ta0vjwid.lambda-url.ca-central-1.on.aws/', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Counter request failed: ${response.status}`);
      const data = await response.json();
      counter.textContent = `${data} visits recorded`;
    } catch (error) {
      counter.textContent = 'Visitor count unavailable';
    }
  };

  updateCounter();
});
