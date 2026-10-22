// Backups, restore and the integrity check (SECURITY_ARCHITECTURE.md §12; backend doc §5 "Backup formats"):
//   1. a SQLite copy taken with node:sqlite backup() (online: safe while the server runs);
//   2. a logical export: one sysml-studio-project v1 file per project (portable to any host or database);
//   3. manifest.json with the SHA-256 of every file and the schema version.
// Restore (server stopped): the chosen copy is first staged and probed (manifest checksum, integrity_check, migrations on
// a throwaway copy, so a backup from a newer server is refused BEFORE anything is replaced); then the current database is
// kept as backups/pre-restore-*.db, the staged copy replaces it, migrations run, then PRAGMA integrity_check and
// validateProject on every project. Restoring the live database onto itself is refused (M2 review L7). Runbook: docs/server/M2_BACKEND_REPORT.md.
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { validateProject } from '../src/project/model/integrity'
import type { Config } from './config'
import { openStore, serverRunning, stamp } from './main'
import { currentVersion, migrate } from './repo/migrations'
import type { SqliteStore } from './repo/sqlite'
import { exportFile } from './services/projects'

const fileSha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const slug = (s: string) => (s.trim() || 'NN').replace(/[^A-Za-z0-9-]+/g, '-').slice(0, 40)

export type BackupResult = { dir: string; files: { path: string; sha256: string; bytes: number }[]; projects: number; schemaVersion: number }

export async function backup(cfg: Config, store: SqliteStore, now = new Date()): Promise<BackupResult> {
  const dir = join(cfg.dataDir, 'backups', `sls-${stamp(now)}`)
  mkdirSync(join(dir, 'projects'), { recursive: true })
  await store.backupTo(join(dir, 'sls.db'))
  const projects = await store.read((r) => r.projects.list())
  for (const p of projects) {
    const team = await store.read((r) => r.teams.get(p.teamId))
    const file = await store.read((r) => exportFile(r, p, 'backup', now.toISOString()))
    writeFileSync(join(dir, 'projects', `${slug(team?.label ?? '')}-${p.id}.json`), JSON.stringify(file, null, 2))
  }
  const list: BackupResult['files'] = []
  for (const f of [join(dir, 'sls.db'), ...readdirSync(join(dir, 'projects')).map((x) => join(dir, 'projects', x))]) list.push({ path: relative(dir, f).replace(/\\/g, '/'), sha256: fileSha(f), bytes: statSync(f).size })
  const schemaVersion = currentVersion(store.db)
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ format: 'sls-backup', version: 1, createdAt: now.toISOString(), schemaVersion, projects: projects.length, files: list }, null, 2))
  await store.tx((r) => r.audit.append({ at: now.toISOString(), actorUserId: null, actorRole: 'cli', action: 'admin.backup', outcome: 'ok', detail: { dir: relative(cfg.dataDir, dir), projects: projects.length } }))
  return { dir, files: list, projects: projects.length, schemaVersion }
}

export type IntegrityReport = { sqlite: string; projects: { id: string; team: string; errors: string[]; warnings: number }[]; ok: boolean }
export async function integrity(store: SqliteStore): Promise<IntegrityReport> {
  const rows = store.db.prepare('PRAGMA integrity_check').all() as { integrity_check: string }[]
  const sqlite = rows.map((r) => r.integrity_check).join('; ')
  const projects = []
  for (const p of await store.read((r) => r.projects.list())) {
    const issues = validateProject(p.doc)
    projects.push({ id: p.id, team: p.teamId, errors: issues.filter((i) => i.severity === 'error').map((i) => i.message), warnings: issues.filter((i) => i.severity === 'warning').length })
  }
  return { sqlite, projects, ok: sqlite === 'ok' && projects.every((p) => !p.errors.length) }
}

/** Restores a backup (a backup folder or a .db file). The server must be stopped. */
export async function restore(cfg: Config, from: string, now = new Date()): Promise<{ preRestore: string; report: IntegrityReport }> {
  const running = serverRunning(cfg)
  if (running) throw new Error(`The server is running (pid ${running}). Stop it before restoring.`)
  const isDir = existsSync(from) && statSync(from).isDirectory()
  const src = isDir ? join(from, 'sls.db') : from
  if (!existsSync(src)) throw new Error(`No database at ${src}.`)
  const live = resolve(cfg.dbFile)
  if (resolve(src) === live || resolve(src).startsWith(`${live}-`)) throw new Error('That is the live database itself; restore from a backup copy.')
  if (isDir && !existsSync(join(from, 'manifest.json'))) throw new Error('The backup folder has no manifest.json; refusing to restore it without its checksum.')
  mkdirSync(join(cfg.dataDir, 'backups'), { recursive: true })
  const staging = join(cfg.dataDir, 'backups', `restore-staging-${stamp(now)}.db`)
  const probeFile = `${staging}.probe`
  const cleanup = (f: string) => {
    for (const x of [f, `${f}-wal`, `${f}-shm`, `${f}-journal`]) rmSync(x, { force: true })
  }
  copyFileSync(src, staging)
  try {
    if (isDir) {
      const m = JSON.parse(readFileSync(join(from, 'manifest.json'), 'utf8')) as { files: { path: string; sha256: string }[] }
      const db = m.files.find((f) => f.path === 'sls.db')
      if (!db || db.sha256 !== fileSha(staging)) throw new Error('The backup database does not match its manifest checksum; refusing to restore it.')
    }
    const probe = new DatabaseSync(staging, { readOnly: true })
    const ok = (probe.prepare('PRAGMA integrity_check').get() as { integrity_check: string }).integrity_check
    probe.close()
    if (ok !== 'ok') throw new Error(`The backup database fails SQLite's integrity check: ${ok}`)
    // migrations on a throwaway copy: a newer schema or a failing migration stops here, with the live database untouched
    copyFileSync(staging, probeFile)
    const pdb = new DatabaseSync(probeFile)
    try {
      migrate(pdb)
    } finally {
      pdb.close()
      cleanup(probeFile)
    }
  } catch (e) {
    cleanup(staging)
    throw e
  }
  const preRestore = join(cfg.dataDir, 'backups', `pre-restore-${stamp(now)}.db`)
  if (existsSync(cfg.dbFile)) {
    const cur = new DatabaseSync(cfg.dbFile)
    cur.exec(`VACUUM INTO '${preRestore.replace(/'/g, "''")}'`)
    cur.close()
  }
  for (const f of [cfg.dbFile, `${cfg.dbFile}-wal`, `${cfg.dbFile}-shm`]) rmSync(f, { force: true })
  copyFileSync(staging, cfg.dbFile)
  cleanup(staging)
  const store = openStore(cfg)
  try {
    const report = await integrity(store)
    await store.tx((r) => r.audit.append({ at: now.toISOString(), actorUserId: null, actorRole: 'cli', action: 'admin.restore', outcome: report.ok ? 'ok' : 'error', detail: { from: isDir ? 'backup folder' : 'db file', preRestore: relative(cfg.dataDir, preRestore) } }))
    return { preRestore, report }
  } finally {
    store.close()
  }
}
