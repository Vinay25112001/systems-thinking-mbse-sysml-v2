// Schema migrations (forward-only, transactional, pre-migration backup), the data-directory guard, and the backup →
// restore drill (SECURITY_ARCHITECTURE.md §10, §12).
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, describe, expect, it } from 'vitest'
import { backup, integrity, restore } from '../backup'
import { APP_ROOT, dataDirProblems, testConfig, type Config } from '../config'
import { openStore } from '../main'
import { currentVersion, LATEST_VERSION, migrate, MIGRATIONS, type Migration } from '../repo/migrations'
import { SqliteStore } from '../repo/sqlite'
import { cid, createTeamProject, startTest } from './helpers'

const dirs: string[] = []
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'sls-test-'))
  dirs.push(d)
  return d
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})
const fileConfig = (dir: string): Config => testConfig({ dataDir: dir, dbFile: join(dir, 'sls.db') })

describe('migrations', () => {
  it('creates the latest schema on a fresh database and is idempotent', () => {
    const db = new DatabaseSync(':memory:')
    expect(migrate(db)).toEqual(MIGRATIONS.map((m) => m.version))
    expect(currentVersion(db)).toBe(LATEST_VERSION)
    expect(migrate(db)).toEqual([])
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name)
    for (const name of ['users', 'sessions', 'teams', 'team_memberships', 'projects', 'project_changes', 'project_snapshots', 'approval_requests', 'audit_log', 'import_records']) expect(tables).toContain(name)
  })
  it('refuses a database newer than the server (no downgrade)', () => {
    const db = new DatabaseSync(':memory:')
    migrate(db)
    db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(LATEST_VERSION + 1, 'future', 'x')
    expect(() => migrate(db)).toThrow(/newer than this server/)
  })
  it('rolls a failing migration back completely and records nothing', () => {
    const db = new DatabaseSync(':memory:')
    migrate(db)
    const bad: Migration[] = [...MIGRATIONS, { version: LATEST_VERSION + 1, name: 'broken', sql: 'CREATE TABLE half_done (x INTEGER); INSERT INTO no_such_table VALUES (1);' }]
    expect(() => migrate(db, bad)).toThrow(/rolled back/)
    expect(currentVersion(db)).toBe(LATEST_VERSION)
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name = 'half_done'").get()).toBeUndefined()
  })
  it('backs a file database up before applying a pending migration', () => {
    const dir = tmp()
    const cfg = fileConfig(dir)
    openStore(cfg).close()
    const next: Migration[] = [...MIGRATIONS, { version: LATEST_VERSION + 1, name: 'add column', sql: 'ALTER TABLE teams ADD COLUMN note TEXT' }]
    const s = new SqliteStore({ file: cfg.dbFile, migrations: next, beforeMigrate: (from) => {
        const copy = new DatabaseSync(cfg.dbFile)
        copy.exec(`VACUUM INTO '${join(dir, `pre-migration-v${from}.db`).replace(/'/g, "''")}'`)
        copy.close()
      } })
    expect(currentVersion(s.db)).toBe(LATEST_VERSION + 1)
    s.close()
    expect(existsSync(join(dir, `pre-migration-v${LATEST_VERSION}.db`))).toBe(true)
  })
  it('the audit log is append-only at the database level', () => {
    const s = new SqliteStore({ file: ':memory:' })
    s.db.prepare("INSERT INTO audit_log (at, action, outcome) VALUES ('x', 'test', 'ok')").run()
    expect(() => s.db.exec('UPDATE audit_log SET action = 1')).toThrow(/append-only/)
    expect(() => s.db.exec('DELETE FROM audit_log')).toThrow(/append-only/)
  })
})

describe('data directory guard', () => {
  it('refuses cloud-synced folders and the git worktree', () => {
    expect(dataDirProblems('C:\\Users\\x\\OneDrive - Org\\data')[0]).toMatch(/cloud-synced/)
    expect(dataDirProblems(join(APP_ROOT, '.data'))[0]).toMatch(/git worktree/)
    expect(dataDirProblems(join(tmpdir(), 'sls-data'))).toEqual([])
  })
})

describe('backup and restore drill', () => {
  it('backs up online, then restores into a fresh directory with identical project documents', async () => {
    const t = await startTest()
    const a = await t.signedIn(await t.user('student', 'Team 1'))
    const r = await createTeamProject(a, await t.team('Team 1'), 'Backup Drill Enterprise')
    const pid = r.body.doc.project.uid
    const e = Object.values(r.body.doc.artifacts as Record<string, { type: string; uid: string }>).find((x) => x.type === 'ENT')!
    await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: 1, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'x', ops: [{ op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.problem', before: '', after: 'Kept across restore' }] }] }] })
    const live = (await a.get(`/api/v1/projects/${pid}`)).body.doc

    // the in-memory test database is copied into a file store first (backup() works on any SqliteStore)
    const src = tmp()
    const srcCfg = fileConfig(src)
    await t.store.backupTo(srcCfg.dbFile)
    await t.close()
    const store = openStore(srcCfg)
    const b = await backup(srcCfg, store)
    store.close()
    const manifest = JSON.parse(readFileSync(join(b.dir, 'manifest.json'), 'utf8'))
    expect(manifest.schemaVersion).toBe(LATEST_VERSION)
    expect(manifest.files.map((f: { path: string }) => f.path)).toContain('sls.db')
    const exports = readdirSync(join(b.dir, 'projects'))
    expect(exports).toHaveLength(1)
    expect(JSON.parse(readFileSync(join(b.dir, 'projects', exports[0]), 'utf8')).format).toBe('sysml-studio-project')

    const dst = tmp()
    const dstCfg = fileConfig(dst)
    openStore(dstCfg).close() // an existing (empty) database is kept as pre-restore
    const res = await restore(dstCfg, b.dir)
    expect(res.report.ok).toBe(true)
    expect(existsSync(res.preRestore)).toBe(true)
    const back = openStore(dstCfg)
    const p = await back.read((x) => x.projects.get(pid))
    expect(p!.doc).toEqual(live)
    expect((await integrity(back)).ok).toBe(true)
    back.close()
  })
  it('refuses a backup whose database does not match its manifest', async () => {
    const src = tmp()
    const cfg = fileConfig(src)
    const s = openStore(cfg)
    const b = await backup(cfg, s)
    s.close()
    const db = new DatabaseSync(join(b.dir, 'sls.db'))
    db.exec("INSERT INTO server_meta (key, value) VALUES ('tampered', '1')")
    db.close()
    await expect(restore(fileConfig(tmp()), b.dir)).rejects.toThrow(/manifest checksum/)
  })
})
