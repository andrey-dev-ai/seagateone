(() => {
  'use strict';
  const en = {};
  const ru = {
    skip: 'Перейти к содержанию', navLabel: 'Основная навигация', navCompany: 'Компания', navActivities: 'Направления', navVessel: 'Наше судно', navContact: 'Контакты', openMenu: 'Открыть меню', closeMenu: 'Закрыть меню',
    heroEyebrow: 'СУДОВЛАДЕНИЕ И МОРСКИЕ ПЕРЕВОЗКИ', heroTitle1: 'Точный курс.', heroTitle2: 'Открытый горизонт.', heroDescription: 'Судовладение — наша основа.<br>Морская торговля — наше направление.', exploreVessel: 'Наше судно', discover: 'Знакомство с Gate One', heroBottom: 'СУХОГРУЗ', tonnageSmall: '5 000 ТОНН', heroAlt: 'Иллюстрация сухогруза в открытом море',
    companyLabel: 'КОМПАНИЯ', companyTitle: 'Наша основа —<br>в море.', companyLead: 'Gate One LTD — компания-судовладелец, работающая в сфере сухогрузных перевозок и морских услуг.', companyText: 'В основе нашего бизнеса — собственный сухогруз 2014 года постройки. Направления компании объединяют владение судном, перевозку грузов, фрахтование и судовое агентирование.', exploreActivities: 'Направления деятельности', ownedVessel: 'Собственный сухогруз', yearOfBuild: 'Год постройки', tonnageFact: '5 000<span class="fact-unit"> т</span>', vesselTonnage: 'Тоннаж судна',
    activitiesLabel: 'НАПРАВЛЕНИЯ', activitiesTitle: 'Единый взгляд<br>на морской бизнес.', activitiesIntro: 'Судно, рейс и порт. Четыре взаимосвязанных направления морской деятельности.', service1: 'Судовладение', service1Text: 'Владение судном — основа Gate One LTD. Собственный сухогруз связывает компанию напрямую с активом, на котором строится морская торговля.', service1Tag: 'ОСНОВА КОМПАНИИ', service2: 'Грузоперевозки', service2Text: 'Перевозка сухих грузов морским транспортом. Отправной точкой каждой перевозки становятся требования к грузу, возможности судна и условия предстоящего рейса.', service2Tag: 'МОРСКИЕ ПЕРЕВОЗКИ', service3: 'Фрахтование', service3Text: 'Фрахтование судов на согласованный рейс или период. Условия каждого соглашения определяются грузом, сроками и коммерческими договорённостями.', service3Tag: 'СУДНО И РЕЙС', service4: 'Судовое агентирование', service4Text: 'Сопровождение судов при заходе в порт — связь между судном и берегом. Координация процессов, связанных с прибытием, стоянкой и отправлением.', service4Tag: 'СУДНО И БЕРЕГ',
    vesselLabel: 'НАШЕ СУДНО', vesselTitle: 'В центре<br>нашего бизнеса.', vesselIntro: 'Сухогруз тоннажем 5 000 тонн.<br>2014 год постройки. В собственности Gate One LTD.', openImage: 'Открыть изображение судна', dryCargo: 'СУХОГРУЗ', vesselCaption: 'GATE ONE LTD / СОБСТВЕННОЕ СУДНО', imageNote: 'Изображение носит иллюстративный характер', vesselAlt: 'Фотореалистичная иллюстрация сухогруза в море', typeLabel: 'ТИП СУДНА', typeValue: 'Сухогруз', builtLabel: 'ГОД ПОСТРОЙКИ', tonnageLabel: 'ТОННАЖ СУДНА', tonnageValue: '5 000 <span>тонн</span>', ownershipLabel: 'СУДОВЛАДЕЛЕЦ',
    outlookLabel: 'НАШ ПОДХОД', outlookTitle: 'Реальный актив.<br>Долгосрочный взгляд.', outlookText: 'Мы рассматриваем судовладение как долгосрочную ответственность. В центре нашего внимания — судно, люди, обеспечивающие его работу, и деловые отношения, которые определяют цель каждого рейса.', principle1: 'Владение', principle1Text: 'Бизнес, в основе которого — собственный морской актив.', principle2: 'Взаимодействие', principle2Text: 'Связь между судном, грузом и портом.', principle3: 'Перспектива', principle3Text: 'Внимание к партнёрству за рамками отдельного рейса.',
    footerLine: 'Точный курс.<br>Открытый горизонт.', backTop: 'Наверх', footerDescriptor: 'СУДОВЛАДЕНИЕ И МОРСКИЕ УСЛУГИ', visualsLink: 'Об изображениях', visualsTitle: 'Об изображениях', dialogTitle: 'Сухогруз · визуальная концепция', closeImage: 'Закрыть изображение', close: 'Закрыть', fullImageNote: 'Изображения созданы с помощью ИИ и иллюстрируют тип судна. Они не являются фотографиями или точным изображением судна компании.', contactTitle: 'Обсудим сотрудничество.'
  };
  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  textNodes.forEach(node => { en[node.dataset.i18n] = node.innerHTML; });
  document.querySelectorAll('[data-i18n-alt]').forEach(node => { en[node.dataset.i18nAlt] = node.alt; });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { en[node.dataset.i18nAria] = node.getAttribute('aria-label'); });
  en.closeMenu = 'Close menu';
  const dictionaries = { en, ru };
  const nav = document.getElementById('navigation');
  const toggle = document.getElementById('menu-toggle');
  const header = document.getElementById('header');
  const smallScreen = matchMedia('(max-width: 760px)');
  let language = 'en';
  let menuOpen = false;
  function setMenu(open, restoreFocus = false) {
    menuOpen = open && smallScreen.matches;
    header.classList.toggle('menu-open', menuOpen);
    toggle.setAttribute('aria-expanded', String(menuOpen));
    toggle.setAttribute('aria-label', dictionaries[language][menuOpen ? 'closeMenu' : 'openMenu']);
    nav.inert = smallScreen.matches && !menuOpen;
    if (restoreFocus) toggle.focus();
  }
  function setLanguage(next, remember = true) {
    language = Object.hasOwn(dictionaries, next) ? next : 'en';
    const dict = dictionaries[language];
    textNodes.forEach(node => { if (dict[node.dataset.i18n] !== undefined) node.innerHTML = dict[node.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-alt]').forEach(node => { node.alt = dict[node.dataset.i18nAlt]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', dict[node.dataset.i18nAria]); });
    document.querySelectorAll('[data-lang]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.lang === language)); });
    document.documentElement.lang = language;
    document.title = language === 'ru' ? 'Gate One LTD — Судовладение и морские услуги' : 'Gate One LTD — Shipowning & Maritime';
    document.querySelector('meta[name="description"]').content = language === 'ru' ? 'Gate One LTD — судовладение, морские грузоперевозки, фрахтование и агентирование. Собственный сухогруз 2014 года постройки, 5 000 тонн.' : 'Gate One LTD — shipownership and maritime activities. Discover our company and our 5,000-tonne dry cargo vessel, built in 2014.';
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = document.querySelector('meta[name="description"]').content;
    document.querySelector('meta[property="og:locale"]').content = language === 'ru' ? 'ru_RU' : 'en_GB';
    setMenu(menuOpen);
    if (remember) {
      try { localStorage.setItem('gateone-language', language); } catch {}
      try { const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); } catch {}
    }
  }
  let initial = window.GATE_ONE_CONFIG?.defaultLanguage || 'en';
  try { initial = new URLSearchParams(location.search).get('lang') || localStorage.getItem('gateone-language') || initial; } catch {}
  setLanguage(initial, false);
  document.querySelectorAll('[data-lang]').forEach(button => { button.addEventListener('click', () => setLanguage(button.dataset.lang)); });
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('click', event => { if (menuOpen && !header.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuOpen) setMenu(false, true); });
  smallScreen.addEventListener('change', () => setMenu(false));
  document.getElementById('year').textContent = new Date().getFullYear();
  const details = [...document.querySelectorAll('.service')];
  details.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) details.forEach(other => { if (other !== item) other.open = false; });
  }));
  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (typeof dialog.showModal === 'function') dialog.showModal();
  }
  document.getElementById('open-vessel').addEventListener('click', () => openDialog('vessel-dialog'));
  document.getElementById('image-info').addEventListener('click', () => openDialog('info-dialog'));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog).close()));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
  const config = window.GATE_ONE_CONFIG || {};
  const contactLinks = document.getElementById('contact-links');
  const email = typeof config.email === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.email) ? config.email : '';
  const phone = typeof config.phone === 'string' && /^[+\d ()-]{5,30}$/.test(config.phone) ? config.phone : '';
  if (email || phone) {
    for (const [label, href] of [[email, email && 'mailto:' + email], [phone, phone && 'tel:' + phone.replace(/[^+\d]/g, '')]]) {
      if (!label) continue;
      const link = document.createElement('a'); link.textContent = label; link.href = href; contactLinks.append(link);
    }
    if (typeof config.address === 'string' && config.address.trim()) { const p = document.createElement('p'); p.textContent = config.address; contactLinks.append(p); }
    document.getElementById('contact').hidden = false;
    document.querySelector('[data-contact-nav]').hidden = false;
  }
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-wait'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.company-layout,.company-facts,.activities-intro,.services,.vessel-heading,.vessel-figure,.vessel-specs,.outlook-layout,.principles').forEach(node => { node.classList.add('reveal-ready', 'reveal-wait'); observer.observe(node); });
    window.addEventListener('beforeprint', () => document.querySelectorAll('.reveal-wait').forEach(node => node.classList.remove('reveal-wait')));
  }
})();
