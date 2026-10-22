import type { UserConfig } from 'vite'
import base from '../vite.config.ts'

// Vite for the default end-to-end suite (playwright.config.ts) only: its own port (5176) and its own dependency cache,
// so it never reuses or disturbs the shared dev server on 5173 or its optimizer cache. It is started with
// VITE_BACKEND=none (offline mode, the static student edition's mode): no /api proxy and no course-server session
// probe, so the suite never depends on whether a course server happens to be running. The server-mode suites keep their
// own config (playwright.server.config.ts with e2e/vite.server-e2e.config.ts).
const config: UserConfig = { ...base, cacheDir: 'node_modules/.vite-e2e-offline', server: { ...base.server, port: 5176, strictPort: true, proxy: undefined } }
export default config
