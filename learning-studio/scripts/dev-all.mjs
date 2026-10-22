// `npm run dev:all`: the course server (127.0.0.1:5174) and the Vite dev server (127.0.0.1:5173, /api proxied to the
// server) together, without adding a process-manager dependency. Ctrl+C stops both.
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const procs = [
  spawn(process.execPath, [path.join(APP, 'server', 'run.mjs'), 'serve'], { cwd: APP, stdio: 'inherit' }),
  spawn(process.execPath, [path.join(APP, 'node_modules', 'vite', 'bin', 'vite.js')], { cwd: APP, stdio: 'inherit' }),
]
const stop = (code = 0) => {
  for (const p of procs) if (p.exitCode === null) p.kill()
  process.exit(code)
}
for (const p of procs) p.on('exit', (code) => stop(code ?? 0))
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
