import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { renderSite, getDictionary, normalizeContacts, resolveLocale, getContacts } from '../lib/site.mjs';
import { parseContactSubmission, formatTelegramMessage } from '../lib/contact.mjs';

test('renders translated primary content and accessible labels without an iframe', () => {
  const cases = [['en', 'Company'], ['ru', 'Компания'], ['uk', 'Компанія'], ['de', 'Unternehmen'], ['ar', 'الشركة']];
  for (const [locale, company] of cases) {
    const $ = load(renderSite(locale));
    assert.equal($('iframe').length, 0);
    assert.equal($('nav a[href="#company"]').text(), company);
    assert.equal($('h1').length, 1);
    assert.ok($('.brand').attr('aria-label'));
    assert.equal($('.language-picker a').length, 5);
    assert.equal($(`.language-picker a[href="/${locale}"]`).attr('aria-current'), 'page');
    assert.equal($('img[src="/gate-one/assets/hero.webp"]').length, 1);
    assert.match($('body').text(), /2014/);
  }
});

test('each dictionary covers every template translation including aria and alt', () => {
  const en = getDictionary('en');
  for (const locale of ['ru', 'uk', 'de', 'ar']) {
    const dict = getDictionary(locale);
    assert.deepEqual(Object.keys(dict).sort(), Object.keys(en).sort());
    for (const value of Object.values(dict)) assert.ok(typeof value === 'string' && value.trim());
  }
});

test('locale selection rejects untrusted values and preserves explicit supported URLs', () => {
  assert.equal(resolveLocale('ar', 'de'), 'ar');
  assert.equal(resolveLocale(null, 'uk'), 'uk');
  assert.equal(resolveLocale('<script>', 'de'), 'de');
  assert.equal(resolveLocale('__proto__', null), 'en');
});

test('address-only contacts are visible and malformed phones never produce empty tel links', () => {
  const contacts = normalizeContacts({address: 'Verified address', phone: '-----', email: ''});
  assert.deepEqual(contacts, {email: '', phone: '', phoneHref: '', address: 'Verified address'});
  const $ = load(renderSite('en', contacts));
  assert.equal($('#contact').attr('hidden'), undefined);
  assert.equal($('#contact-links p').text(), 'Verified address');
  assert.equal($('#contact-links a[href="tel:"]').length, 0);
  assert.equal(normalizeContacts({phone: '+++++'}).phone, '');
  assert.equal(normalizeContacts({phone: '+49 (30) 123456'}).phoneHref, 'tel:+4930123456');
});

test('contacts are escaped as text rather than inserted as executable markup', () => {
  const $ = load(renderSite('en', normalizeContacts({address: '<img src=x onerror=alert(1)>'})));
  assert.equal($('#contact-links img').length, 0);
  assert.equal($('#contact-links p').text(), '<img src=x onerror=alert(1)>');
});

test('header and footer consistently use the approved G1 brand asset', () => {
  const $ = load(renderSite('uk'));
  assert.equal($('.brand img[src="/gate-one/assets/gateone-mark.webp"]').length, 1);
  assert.equal($('.footer-logo img[src="/gate-one/assets/gateone-mark.webp"]').length, 1);
  assert.equal($('.brand svg').length, 0);
  assert.equal($('.brand-type').text(), 'GATE ONE LTD');
});

test('accessible action names contain their visible labels and selected language', () => {
  for (const locale of ['en', 'ru', 'uk', 'de', 'ar']) {
    const $ = load(renderSite(locale));
    const dict = getDictionary(locale);
    const languageName = $('.language-picker summary').attr('aria-label');
    assert.ok(languageName.includes(locale.toUpperCase()));
    assert.ok(languageName.includes($('.language-picker a[aria-current]').text()));
    const imageLabel = $('#open-vessel .image-label > span').first().text();
    const imageName = $('#open-vessel').attr('aria-label');
    assert.ok(imageName.includes(imageLabel));
    assert.ok(imageName.includes(dict.openImage));
  }
});

test('section headings allow natural wrapping while preserving word boundaries', () => {
  for (const locale of ['en', 'ru', 'uk', 'de', 'ar']) {
    const $ = load(renderSite(locale));
    for (const id of ['company-title', 'activities-title', 'vessel-title', 'outlook-title']) {
      const heading = $('#' + id);
      assert.equal(heading.find('br').length, 0);
      assert.ok(heading.text().includes(' '));
    }
  }
});

test('company phone and WhatsApp are correctly formatted across all locales', () => {
  const contacts = getContacts();
  assert.equal(contacts.phoneHref, 'tel:+447470124572');
  assert.equal(contacts.whatsappHref, 'https://wa.me/447470124572');
  assert.equal(contacts.addressProvisional, false);
  for (const locale of ['en','ru','uk','de','ar']) {
    const $ = load(renderSite(locale));
    assert.equal($('#contact').attr('hidden'), undefined);
    assert.equal($('#contact-links a[href="tel:+447470124572"]').length, 1);
    assert.equal($('#contact-links a[href="https://wa.me/447470124572"]').length, 1);
    assert.equal($('#contact-form input[name="name"]').attr('required'), 'required');
    assert.equal($('#contact-form textarea[name="message"]').length, 1);
    const address = $('#contact-links .contact-detail').last();
    assert.equal(address.find('p').text(), 'Company Complex, Ajeltake Road, Ajeltake Island, Majuro, Marshall Islands MH9696');
    assert.equal(address.find('.contact-detail-label').text(), getDictionary(locale).contactAddressLabel);
    assert.equal(address.find('.contact-provisional').length, 0);
    assert.ok(!$('#contact-links').text().includes('British Virgin Islands'));
  }
});

test('contact submissions validate inputs and do not accept junk payloads', () => {
  assert.equal(parseContactSubmission(null), null);
  assert.equal(parseContactSubmission({name:'A',reply:'bad',message:'hi'}), null);
  assert.equal(parseContactSubmission({name:'Ada',reply:'ada@example.com',message:'Please contact me about a voyage.'}).name, 'Ada');
  assert.equal(parseContactSubmission({name:'Ada',reply:'ada@example.com',message:'Please contact me about a voyage.',companyWebsite:'spam.example'}).spam, true);
  assert.equal(parseContactSubmission({name:'Ada',reply:'ada@example.com',message:'x'.repeat(2001)}), null);
  const text = formatTelegramMessage(parseContactSubmission({name:'Ada',reply:'ada@example.com',message:'Please contact me about a voyage.',locale:'en'}));
  assert.match(text, /ada@example.com/);
  assert.match(text, /Please contact me/);
});
