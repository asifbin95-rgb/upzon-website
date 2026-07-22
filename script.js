/* Upzon shared content store and public-site behavior. */
(function () {
  'use strict';

  const STORAGE_KEY = 'upzon-site-data-v1';
  const approvedServices = ['Social Media Improvement', 'Thumbnail Designing', 'Short Video Editing'];
  const defaultData = {
    branding: { logoText: 'Upzon', logoImage: '' },
    hero: { title: 'Grow Faster.<br><em>Look Better.</em>', subtitle: 'Upzon shapes high-impact visual content for brands ready to move with clarity and momentum.', image: '' },
    about: { heading: 'A creative partner for digital growth.', intro: 'Upzon is a creative agency focused on stronger social presence, intentional thumbnails, and short-form video that holds attention.', mission: 'Make every digital touchpoint feel clearer, more distinctive, and ready to perform.', vision: 'Build visual systems that help ambitious brands look ahead of the moment.' },
    services: [
      { id: 'social-media-improvement', title: 'Social Media Improvement', description: 'Sharper visual direction for a social presence that feels considered, cohesive, and ready to connect.', icon: 'signal' },
      { id: 'thumbnail-designing', title: 'Thumbnail Designing', description: 'Purposeful thumbnail design that earns attention before the first second ever plays.', icon: 'frame' },
      { id: 'short-video-editing', title: 'Short Video Editing', description: 'Focused short-form editing with pace, polish, and a visual rhythm made for modern feeds.', icon: 'play' }
    ],
    contact: { heading: 'Let’s make your next move <em>matter.</em>', copy: 'Tell us what needs to look better, move faster, or connect more clearly.' },
    buttons: { header: 'Start a project', primary: 'Contact us', secondary: 'Get started', contact: 'Send message' },
    social: { instagram: '', linkedin: '', youtube: '' },
    footer: { statement: 'Grow Faster. Look Better.', copyright: '© 2026 Upzon. All rights reserved.' },
    seo: { title: 'Upzon — Grow Faster. Look Better.', description: 'Upzon — Grow Faster. Look Better.', keywords: 'creative agency, social media, thumbnail design, short video editing' }
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const merge = (base, saved) => {
    const output = clone(base);
    Object.keys(saved || {}).forEach((key) => {
      if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key]) && output[key]) output[key] = { ...output[key], ...saved[key] };
      else if (saved[key] !== undefined) output[key] = saved[key];
    });
    return output;
  };
  const getData = () => { try { return merge(defaultData, JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return clone(defaultData); } };
  const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.UpzonStore = { get: getData, save: saveData, reset: () => { localStorage.removeItem(STORAGE_KEY); return clone(defaultData); }, defaults: clone(defaultData), approvedServices };

  const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  const byPath = (object, path) => path.split('.').reduce((value, key) => value && value[key], object);
  const icons = {
    signal: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 25V19M13 25V13M21 25V7M29 25V3"/><path d="M4 8.5 11.5 4l6.5 3.5L28 2"/></svg>',
    frame: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="5" width="26" height="22" rx="3"/><path d="m12.5 11 8 5-8 5V11Z"/></svg>',
    play: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="5" width="26" height="22" rx="3"/><path d="m14 11 7 5-7 5v-10Z"/><path d="M7 9h2M7 13h2M7 17h2M7 21h2"/></svg>'
  };
  const socialIcons = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v6M8 7.5v.1M11.5 16v-3.4c0-1.8 4-2 4 0V16M11.5 12.8V10"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12s0-4-1-5-7-1-8-1-7 0-8 1-1 5-1 5 0 4 1 5 7 1 8 1 7 0 8-1 1-5 1-5Z"/><path d="m10 9 5 3-5 3V9Z"/></svg>'
  };

  function renderSite() {
    const data = getData();
    document.title = data.seo.title || defaultData.seo.title;
    ['description', 'keywords'].forEach((name) => { const el = document.querySelector(`meta[name="${name}"]`); if (el) el.content = data.seo[name] || ''; });
    document.querySelectorAll('[data-bind]').forEach((el) => {
      const value = byPath(data, el.dataset.bind);
      if (value === undefined) return;
      if (['hero.title', 'contact.heading'].includes(el.dataset.bind)) el.innerHTML = value;
      else el.textContent = value;
    });
    const serviceList = document.getElementById('service-list');
    if (serviceList) serviceList.innerHTML = data.services.map((service, index) => `<article class="service-card reveal" data-tilt><div class="service-visual icon-${index + 1}">${icons[service.icon] || icons.signal}<span class="icon-orbit"></span></div><span class="service-number">0${index + 1}</span><h3>${escapeHTML(service.title)}</h3><p>${escapeHTML(service.description)}</p><span class="service-arrow" aria-hidden="true">↗</span></article>`).join('');
    const socialContainer = document.querySelector('[data-social-container]');
    if (socialContainer) socialContainer.innerHTML = Object.keys(socialIcons).map((platform) => {
      const href = data.social[platform] || '';
      return `<a class="social-icon${href ? '' : ' is-empty'}" ${href ? `href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer"` : 'aria-disabled="true" tabindex="-1" title="Add this link in the Upzon admin"'} aria-label="${platform}">${socialIcons[platform]}</a>`;
    }).join('');
    const heroImage = data.hero.image;
    if (heroImage) document.documentElement.style.setProperty('--uploaded-hero', `url("${heroImage}")`);
  }

  function initInteractions() {
    const header = document.querySelector('.site-header');
    addEventListener('scroll', () => header && header.classList.toggle('is-scrolled', scrollY > 20), { passive: true });
    const toggle = document.querySelector('.menu-toggle'); const menu = document.querySelector('.mobile-menu');
    if (toggle && menu) toggle.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); toggle.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open)); });
    document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => toggle && toggle.click()));
    const observer = new IntersectionObserver((items) => items.forEach((item) => { if (item.isIntersecting) { item.target.classList.add('visible'); observer.unobserve(item.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    document.querySelectorAll('[data-tilt]').forEach((card) => { card.addEventListener('pointermove', (event) => { const box = card.getBoundingClientRect(); const x = (event.clientX - box.left) / box.width - .5; const y = (event.clientY - box.top) / box.height - .5; card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`; }); card.addEventListener('pointerleave', () => { card.style.transform = ''; }); });
    document.querySelectorAll('.magnetic').forEach((button) => { button.addEventListener('pointermove', (event) => { const box = button.getBoundingClientRect(); button.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .12}px, ${(event.clientY - box.top - box.height / 2) * .12}px)`; }); button.addEventListener('pointerleave', () => { button.style.transform = ''; }); });
    const form = document.getElementById('contact-form');
    if (form) form.addEventListener('submit', (event) => { event.preventDefault(); const message = document.getElementById('form-status'); if (!form.checkValidity()) { form.reportValidity(); return; } message.textContent = 'Your message is ready to send. Connect this form to your preferred inbox service to receive it.'; form.reset(); });
    initParticles();
  }

  function initParticles() {
    const canvas = document.getElementById('particle-canvas'); if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d'); let width, height; const dots = Array.from({ length: 48 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() * .6 + .2, s: Math.random() * .8 + .25 })); let mouse = { x: .5, y: .5 };
    const resize = () => { const rect = canvas.getBoundingClientRect(); width = canvas.width = rect.width * devicePixelRatio; height = canvas.height = rect.height * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    addEventListener('resize', resize); canvas.parentElement.addEventListener('pointermove', (event) => { const r = canvas.getBoundingClientRect(); mouse = { x: (event.clientX - r.left) / r.width, y: (event.clientY - r.top) / r.height }; }); resize();
    const draw = () => { const w = width / devicePixelRatio, h = height / devicePixelRatio; ctx.clearRect(0, 0, w, h); dots.forEach((dot, i) => { dot.y -= .00022 * dot.z; if (dot.y < -.04) dot.y = 1.04; const px = dot.x * w + (mouse.x - .5) * 20 * dot.z; const py = dot.y * h + (mouse.y - .5) * 16 * dot.z; ctx.beginPath(); ctx.fillStyle = i % 3 ? `rgba(129,88,255,${.24 * dot.z})` : `rgba(68,219,255,${.3 * dot.z})`; ctx.arc(px, py, dot.s * dot.z * 2, 0, Math.PI * 2); ctx.fill(); }); requestAnimationFrame(draw); }; draw();
  }

  document.addEventListener('DOMContentLoaded', () => { renderSite(); initInteractions(); addEventListener('load', () => document.body.classList.add('loaded')); });
}());
