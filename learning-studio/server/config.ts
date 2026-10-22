// Server configuration (SECURITY_ARCHITECTURE.md §10). Environment variables, overridable by CLI flags
// (--data-dir, --host, --port). No secrets exist in v1: sessions are opaque tokens and passwords are salted hashes.
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

export type Mode = 'demo' | 'test' | 'institutional'
export type Config = {
  mode: Mode
  /** Directory of the database and its backups; ':memory:' only in tests. */
  dataDir: string
  dbFile: string
  host: string
  port: number
  /** Origins allowed on state-changing requests (CSRF layer 3) and, as host:port, in the Host header (DNS rebinding). */
  origins: string[]
  hosts: string[]
  cookieSecure: boolean
  cookieName: string
  /** Session lifetimes in seconds (§4.2). */
  idle: { student: number; staff: number }
  absolute: { student: number; staff: number }
  /** scrypt cost (2^17 per §4.1). A lower value is accepted only in SLS_MODE=test, to keep the suite fast. */
  scryptN: number
  departmentLabel: string
  log: boolean
  /** Snapshot quota per project (M2 review M3): number of versions and stored bytes; one version at most `perSnapshot`
   *  bytes. Automatic and pre-restore versions beyond their retention are pruned first; then a new version is refused. */
  snapshotQuota: { count: number; bytes: number; perSnapshot: number }
}

export const SNAPSHOT_QUOTA = { count: 200, bytes: 50 * 1024 * 1024, perSnapshot: 1024 * 1024 }

export const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const REPO_ROOT = resolve(APP_ROOT, '..')
export const SCRYPT_N = 2 ** 17

const flag = (argv: string[], name: string) => {
  const i = argv.indexOf(`--${name}`)
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  const eq = argv.find((a) => a.startsWith(`--${name}=`))
  return eq ? eq.slice(name.length + 3) : undefined
}

export function defaultDataDir(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.LOCALAPPDATA ?? (process.platform === 'darwin' ? join(homedir(), 'Library', 'Application Support') : env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'))
  return join(base, 'SysMLStudio', 'data')
}

const inside = (child: string, parent: string) => {
  const r = relative(parent, child)
  return r === '' || (!r.startsWith('..') && !isAbsolute(r))
}

/** Reasons the data directory is unsafe (§10): synced folders corrupt a live SQLite file and are an external transfer;
 *  the repository must never hold student data. Empty = acceptable. */
export function dataDirProblems(dir: string): string[] {
  const out: string[] = []
  const abs = resolve(dir)
  if (/onedrive|sharepoint|dropbox|google drive/i.test(abs)) out.push(`the data directory ${abs} is inside a cloud-synced folder`)
  if (inside(abs, REPO_ROOT)) out.push(`the data directory ${abs} is inside the git worktree`)
  return out
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env, argv: string[] = process.argv.slice(2)): Config {
  const mode = (env.SLS_MODE ?? 'demo') as Mode
  if (!['demo', 'test', 'institutional'].includes(mode)) throw new Error(`SLS_MODE must be demo, test or institutional (got "${mode}").`)
  const dataDir = resolve(flag(argv, 'data-dir') ?? env.SLS_DATA_DIR ?? defaultDataDir(env))
  const problems = dataDirProblems(dataDir)
  if (problems.length) throw new Error(`Refusing to start: ${problems.join('; ')}. Set SLS_DATA_DIR to a local folder outside the repository (default ${defaultDataDir(env)}).`)
  const host = flag(argv, 'host') ?? env.SLS_HOST ?? '127.0.0.1'
  const port = Number(flag(argv, 'port') ?? env.SLS_PORT ?? 5174)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error(`Invalid port ${port}.`)
  const loopback = host === '127.0.0.1' || host === 'localhost' || host === '::1'
  if (!loopback && mode !== 'institutional') throw new Error(`Refusing to bind ${host}: the demonstration server binds the loopback address only (SLS_MODE=institutional is required for anything else).`)
  const extra = (env.SLS_ORIGINS ?? env.SLS_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  // the API itself and the Vite dev server (proxy, changeOrigin false) on both loopback names
  const origins = [...new Set([...(mode === 'institutional' ? [] : [`http://127.0.0.1:${port}`, `http://localhost:${port}`, 'http://127.0.0.1:5173', 'http://localhost:5173']), ...extra])]
  const hosts = [...new Set(origins.map((o) => new URL(o).host))]
  const secure = mode === 'institutional' || env.SLS_COOKIE_SECURE === 'true'
  const n = Number(env.SLS_SCRYPT_N ?? SCRYPT_N)
  mkdirSync(dataDir, { recursive: true })
  return {
    mode,
    dataDir,
    dbFile: join(dataDir, 'sls.db'),
    host,
    port,
    origins,
    hosts,
    cookieSecure: secure,
    cookieName: secure ? '__Host-sls_session' : 'sls_session',
    idle: { student: 2 * 3600, staff: 30 * 60 },
    absolute: { student: 12 * 3600, staff: 8 * 3600 },
    scryptN: mode === 'test' && Number.isInteger(Math.log2(n)) ? n : SCRYPT_N,
    departmentLabel: env.SLS_DEPARTMENT_LABEL ?? '',
    log: mode !== 'test',
    snapshotQuota: { ...SNAPSHOT_QUOTA },
  }
}

/** An in-memory configuration for the automated tests (never reachable from the CLI). */
export function testConfig(over: Partial<Config> = {}): Config {
  const port = over.port ?? 0
  return {
    mode: 'test',
    dataDir: ':memory:',
    dbFile: ':memory:',
    host: '127.0.0.1',
    port,
    origins: ['http://127.0.0.1:5173'],
    hosts: ['127.0.0.1:5173'],
    cookieSecure: false,
    cookieName: 'sls_session',
    idle: { student: 2 * 3600, staff: 30 * 60 },
    absolute: { student: 12 * 3600, staff: 8 * 3600 },
    scryptN: 2 ** 10,
    departmentLabel: '',
    log: false,
    snapshotQuota: { ...SNAPSHOT_QUOTA },
    ...over,
  }
}
