# Gate One — Contact implementation (draft)

- Working branch: `feature/contact-telegram-form`. Production remains unchanged until approved.
- Telephone shown: +44 7470 124572. WhatsApp deep link uses the same number, subject to activation in WhatsApp.
- Provisional address displayed as *Road Town, Tortola, British Virgin Islands*, explicitly labelled **not a verified/registered address**. Remove or replace before final company approval.
- A localized form is available in all 5 languages, with name, email/phone, message. It posts same-origin JSON to `/api/contact`, which validates on the server and forwards to Telegram without a site database.
- Telegram messages persist under Telegram policies; avoid implying that they are not stored anywhere.
- Environment variables for the existing Vercel project: `TELEGRAM_BOT_TOKEN` (obtain from BotFather), `TELEGRAM_CHAT_ID` (recipient personal/group ID). **Never commit either variable.** For a private chat, start the bot before testing.
- In the absence of those variables the API returns 503, and the UI displays a failure status (no false success).
- Protections: payload size cap, required origin/host match, content type and field length validation, HTML escaping in SSR, hidden honeypot, no tokens in browser bundle. For sustained public traffic, add durable edge-level rate limiting (Vercel Firewall or an equivalent rate-limit store) and CAPTCHA/Turnstile if spam becomes an issue. The honeypot alone is not sufficient to block distributed bots.
- Verify `pnpm test`, `pnpm typecheck`, `pnpm build`, Playwright on all 5 languages and mobile sizes. Test with a disposable Telegram chat and actual Vercel environment variables before production publication.
- Update company location only once jurisdiction and registered legal address are confirmed. A fabricated address should **never** be represented as a legal company address.
