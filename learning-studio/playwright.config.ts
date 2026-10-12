import { defineConfig } from '@playwright/test'

// Uses the locally installed Google Chrome (no browser download needed on this managed laptop).
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:5173', channel: 'chrome', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true, timeout: 120_000 },
})
