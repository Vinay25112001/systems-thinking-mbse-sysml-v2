// Command line of the course server, loaded by server/run.mjs through Vite's SSR loader (so the shared TypeScript model
// in src/project/** runs unchanged). Commands:
//   serve                      start the API on 127.0.0.1:5174 (SLS_PORT / --port)
//   seed                       demo accounts and teams, random passwords printed ONCE (SLS_MODE=demo, empty DB only)
//   create-admin --login L --name "N" --initials XX   first admin, temporary password printed once
//   backup                     SQLite online backup + per-project JSON exports + manifest (server may run)
//   restore <folder|file.db>   replace the database with a backup (server stopped); integrity check after
//   integrity                  PRAGMA integrity_check + validateProject on every project
//   test-fixture --json        throwaway accounts for the Playwright two-session test (SLS_MODE=test only)
// Passwords printed here must never be pasted into commits, status files, test reports or screenshots.
import { createApp } from './app'
import { backup, integrity, restore } from './backup'
import { loadConfig, type Config } from './config'
import type { Deps } from './http/core'
import { openStore, startServer } from './main'
import type { SqliteStore } from './repo/sqlite'
import type { Role } from './repo/types'
import { createUser, type NewUser } from './services/teams'

const out = (s = '') => process.stdout.write(`${s}\n`)
const arg = (argv: string[], name: string) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
function depsFor(cfg: Config, store: SqliteStore): Deps {
  return createApp({ config: cfg, store }).deps
}

type Account = { login: string; password: string; role: Role; name: string; team: string | null }
async function makeAccounts(cfg: Config, store: SqliteStore, demo: boolean, spec: { name: string; login: string; initials: string; role: Role; team: string | null }[], teams: string[]): Promise<Account[]> {
  const deps = depsFor(cfg, store)
  const at = new Date().toISOString()
  const teamIds = new Map<string, string>()
  for (const label of teams) {
    const id = crypto.randomUUID()
    await store.tx((r) => r.teams.create({ id, label, maxMembers: 5, status: 'active', createdBy: 'cli', createdAt: at }))
    teamIds.set(label, id)
  }
  const accounts: Account[] = []
  for (const s of spec) {
    const u: NewUser = { displayName: s.name, login: s.login, initials: s.initials, role: s.role, email: null, demo }
    const made = await createUser(deps, null, u, { mustChange: false })
    if (s.team) await store.tx((r) => r.teams.addMember(teamIds.get(s.team!)!, made.user.id, 'cli', at))
    accounts.push({ login: s.login, password: made.temporaryPassword, role: s.role, name: s.name, team: s.team })
  }
  return accounts
}

export async function main(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv
  const cfg = loadConfig(process.env, rest)
  switch (cmd) {
    case 'serve': {
      const { close } = await startServer(cfg)
      out(`SysML Learning Studio course server (${cfg.mode}) on http://${cfg.host}:${cfg.port}/api/v1  data: ${cfg.dataDir}`)
      out('Synthetic demonstration data only (FD-S4). Stop with Ctrl+C.')
      const stop = () => void close().then(() => process.exit(0))
      process.on('SIGINT', stop)
      process.on('SIGTERM', stop)
      return -1 // keep running
    }
    case 'seed':
    case 'seed-demo': {
      if (cfg.mode !== 'demo') throw new Error('seed runs only with SLS_MODE=demo.')
      const store = openStore(cfg)
      try {
        const users = await store.read((r) => r.identity.countUsers())
        const flagged = (await store.read((r) => r.meta.get('demo'))) === '1'
        if (users > 0) throw new Error(flagged ? 'Demo accounts already exist in this database. To start over, stop the server and move the data directory away (or set SLS_DATA_DIR to a new folder).' : 'This database already holds accounts; refusing to add demo accounts.')
        await store.tx((r) => r.meta.set('demo', '1'))
        const accounts = await makeAccounts(cfg, store, true, [
          { name: 'Demo Instructor', login: 'instructor.demo', initials: 'DI', role: 'instructor', team: null },
          { name: 'Demo Student A', login: 'student.a', initials: 'DSA', role: 'student', team: 'Demo Team 1' },
          { name: 'Demo Student B', login: 'student.b', initials: 'DSB', role: 'student', team: 'Demo Team 1' },
          { name: 'Demo Student C', login: 'student.c', initials: 'DSC', role: 'student', team: 'Demo Team 2' },
        ], ['Demo Team 1', 'Demo Team 2'])
        out('Demo accounts created (fictional names, demo=1). These passwords are shown ONCE and stored only as hashes.')
        out('Do not paste them into commits, status files, test reports or screenshots.')
        out()
        for (const a of accounts) out(`  ${a.role.padEnd(10)} ${a.login.padEnd(16)} ${a.password}   ${a.team ?? ''}`)
        out()
        out(`Database: ${cfg.dbFile}`)
        return 0
      } finally {
        store.close()
      }
    }
    case 'create-admin': {
      const login = arg(rest, 'login')
      const name = arg(rest, 'name')
      const initials = arg(rest, 'initials')
      if (!login || !name || !initials) throw new Error('Usage: create-admin --login <login> --name "<display name>" --initials <XX>')
      const store = openStore(cfg)
      try {
        const made = await createUser(depsFor(cfg, store), null, { displayName: name, login: login.toLowerCase(), initials: initials.toUpperCase(), role: 'admin', email: null }, { mustChange: true, extraRoles: ['instructor'] })
        out(`Admin ${made.user.login} created (admin + instructor). Temporary password, shown once: ${made.temporaryPassword}`)
        out('It must be changed at the first sign-in.')
        return 0
      } finally {
        store.close()
      }
    }
    case 'backup': {
      const store = openStore(cfg)
      try {
        const b = await backup(cfg, store)
        out(`Backup written to ${b.dir}`)
        out(`  sls.db (online SQLite copy), ${b.projects} project export(s), manifest.json; schema version ${b.schemaVersion}`)
        return 0
      } finally {
        store.close()
      }
    }
    case 'restore': {
      const from = rest.find((a) => !a.startsWith('--') && rest[rest.indexOf(a) - 1] !== '--data-dir')
      if (!from) throw new Error('Usage: restore <backup folder | file.db>')
      const r = await restore(cfg, from)
      out(`Restored. The previous database is kept at ${r.preRestore}`)
      out(`Integrity: SQLite ${r.report.sqlite}; ${r.report.projects.length} project(s); ${r.report.ok ? 'no errors' : 'ERRORS FOUND'}`)
      for (const p of r.report.projects.filter((x) => x.errors.length)) out(`  ${p.id}: ${p.errors.join(' | ')}`)
      return r.report.ok ? 0 : 2
    }
    case 'integrity': {
      const store = openStore(cfg)
      try {
        const r = await integrity(store)
        out(JSON.stringify(r, null, 2))
        return r.ok ? 0 : 2
      } finally {
        store.close()
      }
    }
    case 'test-fixture': {
      if (cfg.mode !== 'test') throw new Error('test-fixture runs only with SLS_MODE=test (a temporary data directory).')
      const store = openStore(cfg)
      try {
        const sfx = Math.random().toString(36).slice(2, 7)
        const accounts = await makeAccounts(cfg, store, false, [
          { name: 'Test Instructor', login: `ti.${sfx}`, initials: 'TI', role: 'instructor', team: null },
          { name: 'Test Student A', login: `tsa.${sfx}`, initials: 'TSA', role: 'student', team: `Test Team ${sfx}` },
          { name: 'Test Student B', login: `tsb.${sfx}`, initials: 'TSB', role: 'student', team: `Test Team ${sfx}` },
        ], [`Test Team ${sfx}`])
        out(JSON.stringify({ accounts }))
        return 0
      } finally {
        store.close()
      }
    }
    default:
      out('Commands: serve | seed | create-admin | backup | restore <path> | integrity | test-fixture --json')
      return cmd ? 1 : 0
  }
}
