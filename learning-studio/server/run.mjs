// Runs the course server's CLI (server/cli.ts) through Vite's SSR module loader: the shared project model in
// src/project/** uses extensionless imports and import.meta.env, which plain Node cannot load. This is the same pattern
// as scripts/build-lectures.mjs. No new dependency: Vite is already a dev dependency.
//   node server/run.mjs serve | seed | create-admin ... | backup | restore <path> | integrity | test-fixture --json
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({
  root: APP,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  clearScreen: false,
  server: { middlewareMode: true, hmr: false, watch: null, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  define: { 'import.meta.env.VITE_EDITION': JSON.stringify('server') },
})
let code = 1
try {
  const cli = await vite.ssrLoadModule('/server/cli.ts')
  code = await cli.main(process.argv.slice(2))
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e))
  code = 1
}
if (code !== -1) {
  await vite.close()
  process.exit(code)
}
// `serve` keeps running; the module graph stays loaded (no file watching, no hot reload)
