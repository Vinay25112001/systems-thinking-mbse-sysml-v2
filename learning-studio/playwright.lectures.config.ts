import { defineConfig } from '@playwright/test'

// Lecture pipeline e2e (e2e/lectures.spec.ts) on its OWN dev server (port 5198), started and stopped by Playwright, so
// it never reuses or leaves behind the 5173 dev server another session may be using. Run: npx playwright test -c playwright.lectures.config.ts
export default defineConfig({
  testDir: './e2e',
  testMatch: ['lectures.spec.ts', 'lectures-week2.spec.ts', 'lectures-week3.spec.ts', 'lectures-week4.spec.ts', 'lectures-week5.spec.ts', 'lectures-week8.spec.ts'],
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:5198', channel: 'chrome', trace: 'retain-on-failure' },
  webServer: { command: 'npx vite --port 5198 --strictPort', url: 'http://127.0.0.1:5198', reuseExistingServer: false, timeout: 120_000 },
})
