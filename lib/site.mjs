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
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/company.json'), 'utf8'));
  const contacts = normalizeContacts(config);
  const e164 = contacts.phoneHref.replace('tel:', '');
  return {
    ...contacts,
    whatsappHref: config.whatsapp === true && /^\\+\\d{10,15}$/.test(e164) ? 'https://wa.me/' + e164.slice(1) : '',
    addressProvisional: config.addressProvisional === true,
  };
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
  const detail = (label, element) => $('<div class="contact-detail"></div>')
    .append($('<span class="contact-detail-label"></span>').text(label), element);
  if (contacts.phone) links.append(detail(dict.contactPhoneLabel,
    $('<a dir="ltr"></a>').attr('href', contacts.phoneHref).text(contacts.phone)));
  if (contacts.whatsappHref) links.append(detail('WhatsApp',
    $('<a dir="ltr" target="_blank" rel="noopener noreferrer"></a>').attr('href', contacts.whatsappHref).text(dict.contactWhatsApp)));
  if (contacts.email) links.append(detail('Email',
    $('<a dir="ltr"></a>').attr('href', 'mailto:' + contacts.email).text(contacts.email)));
  if (contacts.address) {
    const address = $('<div></div>').append($('<p></p>').text(contacts.address));
    if (contacts.addressProvisional) address.append($('<p class="contact-provisional"></p>').text(dict.contactAddressPending));
    links.append(detail(contacts.addressProvisional ? dict.contactProvisionalLabel : dict.contactAddressLabel, address));
  }
  $('#contact-form').attr({
    'data-sending-label': dict.contactSending,
    'data-success-label': dict.contactSuccess,
    'data-error-label': dict.contactError,
  });
  if (contacts.email || contacts.phone || contacts.address || contacts.whatsappHref) {
    $('#contact, [data-contact-nav]').removeAttr('hidden');
  }
  return $('body').html() ?? '';
}
