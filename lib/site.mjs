import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

export const LOCALES = ['en', 'ru', 'uk', 'de', 'ar'];
export const SITE_URL = 'https://www.gateone.ltd';
export const LANGUAGE_NAMES = { en: 'English', ru: 'Русский', uk: 'Українська', de: 'Deutsch', ar: 'العربية' };
const dictionaries = new Map();
export function getDictionary(locale) {
  const valid = LOCALES.includes(locale) ? locale : 'en';
  if (!dictionaries.has(valid)) dictionaries.set(valid, JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', valid + '.json'), 'utf8')));
  return dictionaries.get(valid);
}
export function resolveLocale(explicit, remembered) {
  return LOCALES.includes(explicit) ? explicit : LOCALES.includes(remembered) ? remembered : 'en';
}
export function normalizeContacts(config = {}) {
  const email = typeof config.email === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.email) ? config.email : '';
  const candidate = typeof config.phone === 'string' ? config.phone.trim() : '';
  const number = candidate.replace(/[ ()-]/g, '');
  const phone = /^[+\d ()-]{5,30}$/.test(candidate) && /^\+?\d{5,20}$/.test(number) ? candidate : '';
  return { email, phone, phoneHref: phone ? 'tel:' + number : '', address: typeof config.address === 'string' ? config.address.trim() : '' };
}
export function getContacts() {
  return normalizeContacts(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/company.json'), 'utf8')));
}
export function renderSite(locale, contacts = getContacts()) {
  if (!LOCALES.includes(locale)) throw new Error('Unsupported locale');
  const dict = getDictionary(locale);
  const $ = load(fs.readFileSync(path.join(process.cwd(), 'public/gate-one/index.html'), 'utf8'));
  // Only version-controlled template and dictionary HTML is trusted. Never accept user HTML here.
  $('[data-i18n]').each((_, node) => {
    const key = $(node).attr('data-i18n');
    if (typeof dict[key] !== 'string') throw new Error('Missing translation: ' + locale + '/' + key);
    $(node).html(dict[key]);
  });
  for (const [attribute, target] of [['data-i18n-alt', 'alt'], ['data-i18n-aria', 'aria-label']]) {
    $('[' + attribute + ']').each((_, node) => {
      const key = $(node).attr(attribute);
      if (typeof dict[key] !== 'string') throw new Error('Missing translation: ' + locale + '/' + key);
      $(node).attr(target, dict[key]);
    });
  }
  $('.brand').attr('aria-label', dict.homeLabel).attr('dir', 'ltr');
  $('.footer-logo').attr('dir', 'ltr');
  $('#open-vessel').attr('aria-label', dict.dryCargo + ' — ' + dict.openImage);
  $('img, source').each((_, node) => {
    for (const attr of ['src', 'srcset']) {
      const value = $(node).attr(attr);
      if (value?.startsWith('assets/')) $(node).attr(attr, '/gate-one/' + value);
    }
  });
  const picker = $('<details class="language-picker"></details>');
  const languageName = locale.toUpperCase() + ' — ' + LANGUAGE_NAMES[locale] + '. ' + dict.languageLabel;
  const summary = $('<summary></summary>').attr('aria-label', languageName).attr('dir', 'ltr').text(locale.toUpperCase());
  summary.append('<span aria-hidden="true">⌄</span>');
  const list = $('<ul></ul>').attr('aria-label', dict.languageLabel);
  for (const language of LOCALES) {
    const link = $('<a></a>').attr({ href: '/' + language, lang: language, hreflang: language, dir: language === 'ar' ? 'rtl' : 'ltr' }).text(LANGUAGE_NAMES[language]);
    if (language === locale) link.attr('aria-current', 'page');
    list.append($('<li></li>').append(link));
  }
  picker.append(summary, list);
  $('.language').replaceWith(picker);
  $('#menu-toggle').attr('data-open-label', dict.openMenu).attr('data-close-label', dict.closeMenu);
  $('#year').text(String(new Date().getFullYear()));
  const links = $('#contact-links').empty();
  if (contacts.email) links.append($('<a dir="ltr"></a>').attr('href', 'mailto:' + contacts.email).text(contacts.email));
  if (contacts.phone) links.append($('<a dir="ltr"></a>').attr('href', contacts.phoneHref).text(contacts.phone));
  if (contacts.address) links.append($('<p></p>').text(contacts.address));
  if (contacts.email || contacts.phone || contacts.address) {
    $('#contact, [data-contact-nav]').removeAttr('hidden');
  }
  return $('body').html() ?? '';
}
