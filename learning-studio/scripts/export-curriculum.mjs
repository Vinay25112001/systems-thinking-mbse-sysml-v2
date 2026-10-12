// Writes the curriculum documents (student and instructor editions) to ../exports/curriculum/ by loading the
// app's content modules through Vite (so import.meta.glob and JSON imports behave exactly as in the app).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outRoot = resolve(app, '..', 'exports', 'curriculum')
const server = await createServer({ root: app, configFile: false, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const mod = await server.ssrLoadModule('/src/export/curriculum.ts')
  for (const edition of ['student', 'instructor']) {
    const dir = join(outRoot, edition)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    const files = mod.exportEdition(edition)
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text, 'utf8')
    console.log(`${edition}: ${Object.keys(files).length} files -> ${dir}`)
  }
} finally {
  await server.close()
}
