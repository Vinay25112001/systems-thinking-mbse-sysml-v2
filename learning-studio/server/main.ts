// Opening the database (with the pre-migration backup) and starting the HTTP listener on the loopback address.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createApp, type App } from './app'
import type { Config } from './config'
import { currentVersion } from './repo/migrations'
import { SqliteStore } from './repo/sqlite'
import { ensureSeeded } from './services/content' // publishing (M3)

export const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)

/** Opens (and migrates) the database of `cfg`. A file database with pending migrations is copied to
 *  backups/pre-migration-*.db first. */
export function openStore(cfg: Config): SqliteStore {
  if (cfg.dbFile !== ':memory:') mkdirSync(join(cfg.dataDir, 'backups'), { recursive: true })
  return new SqliteStore({
    file: cfg.dbFile,
    beforeMigrate: (from) => {
      if (cfg.dbFile === ':memory:') return
      const dest = join(cfg.dataDir, 'backups', `pre-migration-v${from}-${stamp()}.db`)
      const src = new DatabaseSync(cfg.dbFile, { readOnly: true })
      try {
        src.exec(`VACUUM INTO '${dest.replace(/'/g, "''")}'`)
      } finally {
        src.close()
      }
    },
  })
}

export const pidFile = (cfg: Config) => join(cfg.dataDir, 'server.pid')
export function serverRunning(cfg: Config): number | null {
  const f = pidFile(cfg)
  if (!existsSync(f)) return null
  const pid = Number(readFileSync(f, 'utf8'))
  try {
    process.kill(pid, 0)
    return pid
  } catch {
    return null
  }
}

/** Housekeeping (M2 review L6): expired and idle sessions leave the database and stale rate-limit keys leave memory.
 *  Runs once at start and then every SWEEP_MS. */
export const SWEEP_MS = 60 * 60 * 1000
export async function sweep(app: App): Promise<{ sessions: number; limiterKeys: number }> {
  const now = app.deps.clock().toISOString()
  const sessions = await app.deps.store.tx((r) => r.identity.deleteExpiredSessions(now))
  return { sessions, limiterKeys: app.deps.limiter.prune() }
}

export async function startServer(cfg: Config): Promise<{ server: Server; store: SqliteStore; close: () => Promise<void> }> {
  const store = openStore(cfg)
  if (cfg.mode === 'institutional' && (await store.read((r) => r.identity.countDemoUsers())) > 0) {
    store.close()
    throw new Error('Refusing to start in institutional mode while demo accounts exist (SECURITY_ARCHITECTURE.md §4.7).')
  }
  const app = createApp({ config: cfg, store })
  await ensureSeeded(app.deps) // publishing (M3): code-authored content becomes published v1 at first start (idempotent)
  await sweep(app)
  const timer = setInterval(() => void sweep(app).catch(() => undefined), SWEEP_MS)
  timer.unref()
  const server = createServer((req, res) => void app.handle(req, res))
  server.headersTimeout = 20_000
  server.requestTimeout = 60_000
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(cfg.port, cfg.host, () => resolve())
  })
  if (cfg.dbFile !== ':memory:') writeFileSync(pidFile(cfg), String(process.pid))
  const close = async () => {
    clearInterval(timer)
    await new Promise<void>((r) => server.close(() => r()))
    store.close()
    if (cfg.dbFile !== ':memory:') rmSync(pidFile(cfg), { force: true })
  }
  return { server, store, close }
}

export const schemaVersionOf = (store: SqliteStore) => currentVersion(store.db)
