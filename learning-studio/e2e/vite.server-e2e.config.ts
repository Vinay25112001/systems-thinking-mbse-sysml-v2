import { mergeConfig } from 'vite'
import base from '../vite.config.ts'

// Vite for the two-session end-to-end test only (playwright.server.config.ts): its own port, its own dependency cache
// (so it never disturbs the dev server on 5173) and /api proxied to the test course server on 5191.
export default mergeConfig(base, {
  cacheDir: 'node_modules/.vite-e2e-server',
  server: { port: 5190, strictPort: true, proxy: { '/api': { target: 'http://127.0.0.1:5191', changeOrigin: false } } },
})