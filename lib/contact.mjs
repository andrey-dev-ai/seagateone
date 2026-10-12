export const MAX_BODY_BYTES = 8192;
const text = (value, max) => typeof value === 'string' && value.length <= max ? value.trim().replace(/\r\n?/g, '\n') : '';
export function parseContactSubmission(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const name = text(value.name, 100);
  const reply = text(value.reply, 180);
  const message = text(value.message, 2000);
  const honeypot = text(value.companyWebsite, 200);
  const locale = ['en','ru','uk','de','ar'].includes(value.locale) ? value.locale : 'en';
  if (name.length < 2 || name.length > 100 || !/^[^<>\r\n]{2,100}$/.test(name)) return null;
  if (reply.length < 5 || !/^[^<>\r\n]{5,180}$/.test(reply) || !reply.includes('@') && !/\d{6,}/.test(reply.replace(/[\s()+-]/g,''))) return null;
  if (message.length < 10 || message.length > 2000) return null;
  return { name, reply, message, locale, spam: Boolean(honeypot) };
}
export function formatTelegramMessage(enquiry) {
  return ['📩 Gate One LTD — website enquiry', 'Language: ' + enquiry.locale.toUpperCase(),
    'Name: ' + enquiry.name, 'Contact: ' + enquiry.reply, '',
    'Message:', enquiry.message].join('\n');
}
