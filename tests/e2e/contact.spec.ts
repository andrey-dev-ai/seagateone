import { test, expect } from '@playwright/test'
import { NextRequest } from 'next/server'
import { POST, GET } from '../../app/api/contact/route'

// These checks exercise form state without delivering messages to a real inbox.
for (const locale of ['en', 'ru', 'uk', 'de', 'ar']) {
  test(locale + ': contact form keeps input after failure and resets after success', async ({ page }) => {
    await page.goto('/' + locale + '#contact')
    const form = page.locator('#contact-form')
    const submit = form.locator('button[type="submit"]')
    const status = page.locator('#contact-form-status')
    await form.locator('[name="name"]').fill('Preview Test')
    await form.locator('[name="reply"]').fill('preview@example.com')
    await form.locator('[name="message"]').fill('Contact form verification without real delivery.')
    let responseStatus = 502
    await page.route('**/api/contact', async route => {
      expect(route.request().method()).toBe('POST')
      expect(route.request().postDataJSON()).toEqual({
        name: 'Preview Test', reply: 'preview@example.com',
        message: 'Contact form verification without real delivery.', companyWebsite: '', locale,
      })
      await route.fulfill({ status: responseStatus, json: { ok: responseStatus === 200 } })
    })
    await submit.click()
    await expect(status).toHaveAttribute('data-state', 'error')
    await expect(status).not.toBeEmpty()
    await expect(form.locator('[name="message"]')).toHaveValue('Contact form verification without real delivery.')
    await expect(submit).toBeEnabled()
    responseStatus = 200
    await submit.click()
    await expect(status).toHaveAttribute('data-state', 'success')
    await expect(status).not.toBeEmpty()
    await expect(form.locator('[name="name"]')).toHaveValue('')
    await expect(form.locator('[name="message"]')).toHaveValue('')
    await expect(submit).toBeEnabled()
  })
}

test('contact API rejects unsafe requests and handles delivery without exposing credentials', async () => {
  const originalFetch = globalThis.fetch
  const saved = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    NODE_ENV: process.env.NODE_ENV,
  }
  const valid = { name: 'Preview Test', reply: 'preview@example.com', message: 'Contact form verification without real delivery.', locale: 'ru' }
  const request = (body: unknown, headers: Record<string, string> = {}) => new NextRequest('https://localhost/api/contact', {
    method: 'POST', headers: { host: 'localhost', origin: 'https://localhost', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  let deliveries = 0
  const sent: Array<{ chat_id: string; text: string }> = []
  try {
    Object.assign(process.env, { NODE_ENV: 'production', TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '' })
    globalThis.fetch = async (_input, init) => {
      deliveries++
      sent.push(JSON.parse(String(init?.body)))
      return Response.json({ ok: true, result: { message_id: 1 } })
    }
    expect(GET().status).toBe(405)
    expect((await POST(request(valid, { origin: 'https://untrusted.example' }))).status).toBe(403)
    expect((await POST(request(valid, { origin: 'http://localhost' }))).status).toBe(403)
    expect((await POST(request(valid, { 'content-type': 'text/plain' }))).status).toBe(415)
    expect((await POST(request(valid, { 'content-length': '8193' }))).status).toBe(413)
    expect((await POST(request({ ...valid, message: 'x'.repeat(9000) }))).status).toBe(413)
    expect((await POST(request({ ...valid, name: 'A' }))).status).toBe(400)
    const trapped = await POST(request({ ...valid, companyWebsite: 'spam.example' }))
    expect(trapped.status).toBe(200)
    expect(deliveries).toBe(0)
    expect((await POST(request(valid))).status).toBe(503)
    expect(deliveries).toBe(0)
    // Deliberately fake fixtures; never use real Telegram credentials in tests.
    Object.assign(process.env, { TELEGRAM_BOT_TOKEN: '123456789:TEST_ONLY_NOT_A_REAL_TOKEN_123456', TELEGRAM_CHAT_ID: '-123456789' })
    const success = await POST(request(valid))
    expect(success.status).toBe(200)
    expect(success.headers.get('cache-control')).toBe('no-store')
    expect(await success.json()).toEqual({ ok: true })
    expect(deliveries).toBe(1)
    expect(sent[0].text).toContain('Language: RU')
    expect(sent[0].text).toContain('preview@example.com')
    expect(sent[0].chat_id).toBe('-123456789')
    globalThis.fetch = async () => new Response('', { status: 502 })
    const failed = await POST(request(valid))
    expect(failed.status).toBe(502)
    expect(await failed.json()).toEqual({ ok: false })
    globalThis.fetch = async () => { throw new Error('Simulated network failure') }
    expect((await POST(request(valid))).status).toBe(502)
  } finally {
    globalThis.fetch = originalFetch
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
