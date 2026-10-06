import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const locale of ['en', 'ru', 'uk', 'de', 'ar']) {
  test(locale + ': translated metadata, no overflow across six viewport sizes, accessibility', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    for (const width of [320, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/' + locale)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('iframe')).toHaveCount(0)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.gateone.ltd/' + locale)
      await expect(page.locator('link[hreflang]')).toHaveCount(6)
      await page.evaluate(() => document.fonts.ready)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(1)
    }
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/' + locale)
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(accessibility.violations).toEqual([])
    expect(errors).toEqual([])
  })
}

test('language link retains section, history changes language, and root remembers it', async ({ page }) => {
  await page.goto('/uk#vessel')
  await page.locator('.language-picker summary').click()
  await page.locator('.language-picker a[hreflang="de"]').click()
  await expect(page).toHaveURL(/\/de#vessel$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await page.goBack()
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
  await page.goto('/ar')
  await expect.poll(async () => (await page.context().cookies()).find(cookie => cookie.name === 'gateone-language')?.value).toBe('ar')
  await page.goto('/')
  await expect(page).toHaveURL(/\/ar$/)
  await page.goto('/?lang=de#company')
  await expect(page).toHaveURL(/\/de#company$/)
})

test('mobile menu, keyboard Escape, modal focus restore and accordion work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/uk')
  const menu = page.locator('#menu-toggle')
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await menu.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await page.locator('#navigation a[href="#vessel"]').click()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await page.locator('#open-vessel').click()
  await expect(page.locator('#vessel-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#vessel-dialog')).not.toBeVisible()
  await expect(page.locator('#open-vessel')).toBeFocused()
  await page.locator('.service').nth(1).locator('summary').click()
  await expect(page.locator('.service').nth(1)).toHaveAttribute('open', '')
  await expect(page.locator('.service').first()).not.toHaveAttribute('open', '')
  await page.locator('#image-info').click()
  await expect(page.locator('#info-dialog')).toBeVisible()
  await page.locator('[data-close-dialog="info-dialog"]').click()
  await expect(page.locator('#info-dialog')).not.toBeVisible()
})

test('server HTML remains translated without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto((process.env.TEST_BASE_URL ?? 'http://localhost:3001') + '/de')
  await expect(page.locator('#hero-title')).toContainText('Ein klarer Kurs.')
  await page.locator('.language-picker summary').click()
  await page.locator('.language-picker a[hreflang="ar"]').click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await context.close()
})

test('unknown locale fails closed; assets, sitemap and legacy language links work', async ({ request }) => {
  expect((await request.get('/xx')).status()).toBe(404)
  for (const file of ['hero.webp', 'hero-mobile.webp', 'vessel.webp', 'gate-sans.woff']) {
    expect((await request.get('/gate-one/assets/' + file)).status()).toBe(200)
  }
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain('https://www.gateone.ltd/ar')
  const legacy = await request.get('/gate-one/index.html?lang=ru', { maxRedirects: 0 })
  expect(legacy.status()).toBe(307)
  expect(legacy.headers().location).toMatch(/^\/ru/)
  expect((await request.get('/en')).headers()['x-content-type-options']).toBe('nosniff')
})

test('404 pages never overwrite the visitor language preference', async ({ page }) => {
  await page.goto('/de')
  await expect.poll(async () => (await page.context().cookies()).find(cookie => cookie.name === 'gateone-language')?.value).toBe('de')
  await page.goto('/de/no-such-page')
  await expect(page.locator('h1')).toContainText('404')
  await expect.poll(async () => (await page.context().cookies()).find(cookie => cookie.name === 'gateone-language')?.value).toBe('de')
  await page.goto('/')
  await expect(page).toHaveURL(/\/de$/)
})

test('keyboard opening enters the mobile navigation in every language', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  for (const locale of ['en', 'ru', 'uk', 'de', 'ar']) {
    await page.goto('/' + locale)
    const menu = page.locator('#menu-toggle')
    await menu.focus()
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#navigation a[href="#company"]')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.locator('#navigation a[href="#activities"]')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeFocused()
  }
})

test('mobile and tablet navigation remains usable without JavaScript in LTR and RTL', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const base = process.env.TEST_BASE_URL ?? 'http://localhost:3001'
    for (const locale of ['uk', 'ar']) {
      for (const width of [375, 1024]) {
        await page.setViewportSize({ width, height: 812 })
        await page.goto(base + '/' + locale)
        await expect(page.locator('#menu-toggle')).toBeHidden()
        const company = page.locator('#navigation a[href="#company"]')
        const vessel = page.locator('#navigation a[href="#vessel"]')
        await expect(company).toBeVisible()
        await expect(vessel).toBeVisible()
        await vessel.click()
        await expect(page).toHaveURL(new RegExp('/' + locale + '#vessel$'))
        await expect(page.locator('#vessel-title')).toBeInViewport()
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow).toBeLessThanOrEqual(1)
      }
    }
  } finally {
    await context.close()
  }
})
