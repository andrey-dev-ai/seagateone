import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3001',
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
