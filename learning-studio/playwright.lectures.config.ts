import { defineConfig } from '@playwright/test'

// Lecture pipeline e2e (e2e/lectures.spec.ts) on its OWN dev server (port 5198), started and stopped by Playwright, so
// it never reuses or leaves behind the 5173 dev server another session may be using. Run: npx playwright test -c playwright.lectures.config.ts
export default defineConfig({
  testDir: './e2e',
  testMatch: ['lectures.spec.ts', 'lectures-week2.spec.ts', 'lectures-week3.spec.ts', 'lectures-week4.spec.ts', 'lectures-week5.spec.ts', 'lectures-week6.spec.ts', 'lectures-week7.spec.ts', 'lectures-week8.spec.ts', 'lectures-week9.spec.ts', 'lectures-week10.spec.ts', 'lectures-week11.spec.ts'],
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:5198', channel: 'chrome', trace: 'retain-on-failure' },
  // VITE_BACKEND=none (offline mode, the static student edition's mode): no course-server session probe through the /api
  // proxy, so a missing course server cannot log a failed request into the specs' "no console errors" checks
  webServer: { command: 'npx vite --port 5198 --strictPort', url: 'http://127.0.0.1:5198', env: { VITE_BACKEND: 'none' }, reuseExistingServer: false, timeout: 120_000 },
})
