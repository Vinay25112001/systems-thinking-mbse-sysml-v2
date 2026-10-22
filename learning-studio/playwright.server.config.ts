import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from '@playwright/test'

// Two genuine browser sessions against the real course server (M2). Separate from the repository's other Playwright
// configs: its own ports (API 5191, Vite 5190), a temporary data directory (SLS_MODE=test, throwaway accounts), no
// screenshots or videos, and all output under test-results/server-e2e (never the tracked screenshot folders).
const API = 5191
const WEB = 5190
process.env.SLS_E2E_DIR ??= mkdtempSync(join(tmpdir(), 'sls-e2e-'))
const dataDir = process.env.SLS_E2E_DIR

export default defineConfig({
  testDir: './e2e',
  testMatch: ['server-two-session.e2e.ts', 'publishing-demo-a.e2e.ts' /* publishing (M3): Demo A */, 'project-canvas.e2e.ts' /* m6: Demos C and D */, 'demo-e-continuity.e2e.ts' /* m7: Demo E */],
  outputDir: 'test-results/server-e2e',
  timeout: 180_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${WEB}`, channel: 'chrome', screenshot: 'off', video: 'off', trace: 'off' },
  webServer: [
    {
      command: `node server/run.mjs serve --port ${API}`,
      url: `http://127.0.0.1:${API}/api/v1/health`,
      env: { SLS_MODE: 'test', SLS_DATA_DIR: dataDir, SLS_ORIGINS: `http://127.0.0.1:${WEB}`, SLS_SCRYPT_N: String(2 ** 14) },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'node node_modules/vite/bin/vite.js --config e2e/vite.server-e2e.config.ts',
      url: `http://127.0.0.1:${WEB}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})