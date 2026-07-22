/* Upzon frontend demo admin. Replace local storage and password check with secure server endpoints in production. */
(function () {
  'use strict';
  const SESSION_KEY = 'upzon-admin-session-v1';
  const currentPage = location.pathname.split('/').pop();
  const isDashboard = currentPage === 'dashboard.html';
  const deepGet = (obj, path) => path.split('.').reduce((item, key) => item && item[key], obj);
  const deepSet = (obj, path, value) => { const keys = path.split('.'); const last = keys.pop(); const target = keys.reduce((item, key) => item[key] || (item[key] = {}), obj); target[last] = value; };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const serviceIcon = (name) => ({ 'Social Media Improvement': 'signal', 'Thumbnail Designing': 'frame', 'Short Video Editing': 'play' }[name] || 'signal');

  function getSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; } }
  function redirectIfNeeded() { if (isDashboard && !getSession()) location.replace('login.html'); if (currentPage === 'login.html' && getSession()) location.replace('dashboard.html'); }

  function initLogin() {
    const form = document.getElementById('login-form'); if (!form) return;
    form.addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(form); const status = document.getElementById('login-status');
      if (data.get('password') !== 'upzon-demo') { status.textContent = 'The demo password is incorrect.'; return; }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: data.get('email'), signedInAt: Date.now() })); location.assign('dashboard.html');
    });
  }

  function initDashboard() {
    const form = document.getElementById('content-form'); if (!form || !window.UpzonStore) return;
    let data = window.UpzonStore.get();
    const state = document.getElementById('save-state'); const serviceEditor = document.getElementById('service-editor'); const dialog = document.getElementById('service-dialog');
    const fieldNames = ['hero.title','hero.subtitle','buttons.primary','buttons.secondary','buttons.header','about.heading','about.intro','about.mission','about.vision','contact.heading','contact.copy','buttons.contact','social.instagram','social.linkedin','social.youtube','branding.logoText','footer.statement','footer.copyright','seo.title','seo.description','seo.keywords'];
    const setState = (message, isError) => { state.textContent = message; state.style.color = isError ? '#f1abb4' : ''; };
    const populate = () => fieldNames.forEach((name) => { const field = form.elements[name]; if (field) field.value = deepGet(data, name) || ''; });
    const renderServices = () => { serviceEditor.innerHTML = data.services.length ? data.services.map((service, i) => `<article class="service-row"><span class="number">0${i + 1}</span><h3>${escapeHTML(service.title)}</h3><p>${escapeHTML(service.description)}</p><div class="row-actions"><button type="button" data-edit="${service.id}">Edit</button><button type="button" class="delete" data-delete="${service.id}">Delete</button></div></article>`).join('') : '<p class="empty-note">No services are currently published.</p>'; };
    const escapeHTML = (text) => String(text || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
    const readAsDataURL = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    const save = () => { window.UpzonStore.save(data); setState('All changes saved locally'); };
    const saveForm = () => { fieldNames.forEach((name) => { const field = form.elements[name]; if (field) deepSet(data, name, field.value.trim()); }); save(); };
    const openService = (service) => { document.getElementById('service-dialog-title').textContent = service ? 'Edit service' : 'Add service'; document.getElementById('service-id').value = service ? service.id : ''; const select = document.getElementById('service-title'); select.innerHTML = window.UpzonStore.approvedServices.map((title) => `<option value="${title}">${title}</option>`).join(''); select.value = service ? service.title : window.UpzonStore.approvedServices.find((item) => !data.services.some((entry) => entry.title === item)) || window.UpzonStore.approvedServices[0]; document.getElementById('service-description').value = service ? service.description : ''; document.getElementById('save-service').disabled = !service && data.services.length >= 3; dialog.showModal(); };
    populate(); renderServices();
    document.getElementById('logout-button').addEventListener('click', () => { sessionStorage.removeItem(SESSION_KEY); location.assign('login.html'); });
    form.addEventListener('submit', (event) => { event.preventDefault(); saveForm(); });
    form.addEventListener('input', () => setState('Unsaved changes'));
    document.getElementById('add-service').addEventListener('click', () => openService(null));
    serviceEditor.addEventListener('click', (event) => { const edit = event.target.closest('[data-edit]'); const del = event.target.closest('[data-delete]'); if (edit) openService(data.services.find((service) => service.id === edit.dataset.edit)); if (del) { data.services = data.services.filter((service) => service.id !== del.dataset.delete); renderServices(); save(); } });
    document.getElementById('service-dialog-form').addEventListener('submit', (event) => { if (event.submitter && event.submitter.value === 'cancel') return; event.preventDefault(); const id = document.getElementById('service-id').value; const title = document.getElementById('service-title').value; const description = document.getElementById('service-description').value.trim(); if (!description) return; if (data.services.some((service) => service.title === title && service.id !== id)) { setState('Each approved service may be listed once.', true); return; } const next = { id: id || title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), title, description, icon: serviceIcon(title) }; if (id) data.services = data.services.map((service) => service.id === id ? next : service); else data.services.push(next); renderServices(); save(); dialog.close(); });
    document.getElementById('hero-image-upload').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; data.hero.image = await readAsDataURL(file); document.getElementById('hero-image-state').textContent = `${file.name} is saved locally.`; save(); });
    document.getElementById('logo-image-upload').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; data.branding.logoImage = await readAsDataURL(file); document.getElementById('logo-image-state').textContent = `${file.name} is saved locally.`; save(); });
    document.getElementById('export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = Object.assign(document.createElement('a'), { href: url, download: 'upzon-content.json' }); link.click(); URL.revokeObjectURL(url); });
    document.getElementById('import-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()); if (!parsed || typeof parsed !== 'object') throw new Error(); window.UpzonStore.save(parsed); data = window.UpzonStore.get(); populate(); renderServices(); setState('Content imported and saved locally'); } catch { setState('That file is not valid Upzon content JSON.', true); } event.target.value = ''; });
    document.getElementById('reset-button').addEventListener('click', () => { if (!confirm('Restore all content to the original Upzon defaults?')) return; data = window.UpzonStore.reset(); populate(); renderServices(); setState('Defaults restored locally'); });
  }
  document.addEventListener('DOMContentLoaded', () => { redirectIfNeeded(); if (currentPage === 'login.html') initLogin(); if (isDashboard) initDashboard(); });
}());
