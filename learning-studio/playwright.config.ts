import { defineConfig } from '@playwright/test'

// Uses the locally installed Google Chrome (no browser download needed on this managed laptop).
// The default suite runs on its OWN dev server (port 5176, e2e/vite.offline-e2e.config.ts), started and stopped by
// Playwright, in offline mode (VITE_BACKEND=none, the static student edition's mode): it never reuses the shared 5173 dev
// server (or its dependency-optimizer cache) and never depends on a course server. Server-mode behaviour is covered by
// playwright.server.config.ts; the lecture pipeline by playwright.lectures.config.ts.
const PORT = 5176
export default defineConfig({
  testDir: './e2e',
  // transforms every lazily loaded route once on the fresh server before the tests start (e2e/warmup.global-setup.ts)
  globalSetup: './e2e/warmup.global-setup.ts',
  timeout: 60_000,
  // Every page is served as unbundled dev modules. With the default worker count (half the cores, 7 here) parallel Chrome
  // instances and the dev server compete on this managed laptop, and first renders of lazily loaded routes took longer
  // than the 5 s default expect timeout (2026-10-22 regression: 13 such timeouts, each passing alone). Fewer workers and
  // a 10 s expect timeout absorb that load; no assertion is changed.
  workers: 4,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: { baseURL: `http://127.0.0.1:${PORT}`, channel: 'chrome', trace: 'retain-on-failure' },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --config e2e/vite.offline-e2e.config.ts',
    url: `http://127.0.0.1:${PORT}`,
    env: { VITE_BACKEND: 'none' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
