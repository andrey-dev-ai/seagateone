import { test, expect } from '@playwright/test'

test('capture review screenshots and local load metrics', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const metrics = { lcp: 0, cls: 0 }
    Object.assign(window, { gateoneLabMetrics: metrics })
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) metrics.lcp = entry.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!shift.hadRecentInput) metrics.cls += shift.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/uk')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.hero img')).toBeVisible()
  await page.screenshot({ path: 'docs/screenshots/uk-desktop.png' })
  const metrics = await page.evaluate(() => {
    const values = (window as unknown as { gateoneLabMetrics: { lcp: number; cls: number } }).gateoneLabMetrics
    return { ...values, resourceBytes: performance.getEntriesByType('resource').reduce((total, entry) => total + (entry as PerformanceResourceTiming).transferSize, 0) }
  })
  await testInfo.attach('localhost-metrics-not-field-cwv', { body: JSON.stringify(metrics), contentType: 'application/json' })
  console.log('LOCAL LAB METRICS (not field CWV)', JSON.stringify(metrics))
  for (const [locale, width] of [['de', 320], ['ar', 375]] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/' + locale)
    await page.evaluate(() => document.fonts.ready)
    const illustration = page.locator('#open-vessel img')
    await illustration.scrollIntoViewIfNeeded()
    await illustration.evaluate(image => (image as HTMLImageElement).decode())
    await page.screenshot({ path: 'docs/screenshots/' + locale + '-mobile.png', fullPage: true })
  }
})
