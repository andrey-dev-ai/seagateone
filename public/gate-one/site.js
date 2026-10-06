(() => {
  'use strict';
  const locale = document.documentElement.lang;
  const supported = ['en', 'ru', 'uk', 'de', 'ar'];
  // Error/404 pages share the root layout but must never change the preference.
  if (!supported.includes(locale) || !document.querySelector('.site-content #header')) return;
  try {
    document.cookie = 'gateone-language=' + locale + '; Path=/; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    localStorage.setItem('gateone-language', locale);
  } catch {}
  const picker = document.querySelector('.language-picker');
  function updateLanguageLinks() {
    picker?.querySelectorAll('a').forEach(link => {
      const url = new URL(link.href);
      url.hash = location.hash;
      link.href = url.pathname + url.hash;
    });
  }
  updateLanguageLinks();
  window.addEventListener('hashchange', updateLanguageLinks);
  picker?.addEventListener('toggle', () => {
    updateLanguageLinks();
    if (picker.open) setMenu(false);
  });
  const header = document.getElementById('header');
  const nav = document.getElementById('navigation');
  const toggle = document.getElementById('menu-toggle');
  if (!header || !nav || !toggle) return;
  const small = matchMedia('(max-width: 1100px)');
  function setMenu(open, focus = false) {
    const expanded = Boolean(open && small.matches);
    header.classList.toggle('menu-open', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
    nav.inert = small.matches && !expanded;
    if (expanded) picker?.removeAttribute('open');
    if (focus) toggle.focus();
  }
  setMenu(false);
  toggle.addEventListener('click', event => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(opening);
    if (opening && small.matches && event.detail === 0) {
      nav.querySelector('a:not([hidden])')?.focus({ preventScroll: true });
    }
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
    if (picker && !picker.contains(event.target)) picker.removeAttribute('open');
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    if (picker?.open) { picker.removeAttribute('open'); picker.querySelector('summary').focus(); }
  });
  small.addEventListener('change', () => setMenu(false));
  const services = [...document.querySelectorAll('.service')];
  services.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) services.forEach(other => { if (other !== item) other.open = false; });
  }));
  const openDialog = id => {
    const dialog = document.getElementById(id);
    if (dialog && !dialog.open && typeof dialog.showModal === 'function') dialog.showModal();
  };
  document.getElementById('open-vessel')?.addEventListener('click', () => openDialog('vessel-dialog'));
  document.getElementById('image-info')?.addEventListener('click', () => openDialog('info-dialog'));
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog)?.close());
  });
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  }));
})();
