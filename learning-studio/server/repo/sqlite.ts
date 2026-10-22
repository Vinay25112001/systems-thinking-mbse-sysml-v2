// node:sqlite implementation of the repository ports. One synchronous connection (DatabaseSync) in WAL mode with
// foreign keys on. Because an `await` inside a transaction would let another request interleave statements on the same
// connection, every read and transaction is serialised through an in-process async mutex, and transactions run
// BEGIN IMMEDIATE … COMMIT / ROLLBACK (backend doc §5). All SQL uses bound parameters; nothing is concatenated.
import { AsyncLocalStorage } from 'node:async_hooks'
import { backup as sqliteBackup, DatabaseSync, type StatementSync } from 'node:sqlite'
import type { ChangeSet, ProjectDoc } from '../../src/project/model/types'
import { migrate, type Migration, MIGRATIONS } from './migrations'
import { buildContentRepo, migrateContent } from './content' // publishing (M3)
import { buildSubmissionRepo, migrateSubmissions } from './submissions' // m6
import type { ApprovalRepo, ApprovalRow, ApprovalState, AuditRepo, FacultyRepo, ChangeRow, Credential, IdentityRepo, MemberRow, MetaRepo, ProjectRepo, ProjectRow, Repos, Role, SessionRow, SnapshotRow, Store, TeamRepo, TeamRow, UserRow } from './types'

type Row = Record<string, unknown>
const s = (v: unknown) => (v === null || v === undefined ? null : String(v))
const n = (v: unknown) => Number(v ?? 0)

class Mutex {
  private tail: Promise<void> = Promise.resolve()
  run<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.tail.then(fn)
    this.tail = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }
}

export type OpenOptions = { file: string; migrations?: Migration[]; beforeMigrate?: (from: number) => void }

export class SqliteStore implements Store {
  readonly db: DatabaseSync
  private mutex = new Mutex()
  private repos: Repos
  private cache = new Map<string, StatementSync>()
  /** Set only inside the async context of a running transaction (another request's read must wait for the mutex). */
  private txContext = new AsyncLocalStorage<boolean>()

  constructor(o: OpenOptions) {
    this.db = new DatabaseSync(o.file)
    if (o.file !== ':memory:') this.db.exec('PRAGMA journal_mode = WAL')
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')
    migrate(this.db, o.migrations ?? MIGRATIONS, o.beforeMigrate)
    migrateContent(this.db) // publishing (M3): the content store's own track (server/repo/content.ts)
    migrateSubmissions(this.db) // m6: the submissions store's own track (server/repo/submissions.ts)
    this.repos = this.build()
  }

  private st(sql: string): StatementSync {
    let p = this.cache.get(sql)
    if (!p) {
      p = this.db.prepare(sql)
      this.cache.set(sql, p)
    }
    return p
  }
  private all(sql: string, ...args: unknown[]): Row[] {
    return this.st(sql).all(...(args as never[])) as Row[]
  }
  private get(sql: string, ...args: unknown[]): Row | undefined {
    return this.st(sql).get(...(args as never[])) as Row | undefined
  }
  private run(sql: string, ...args: unknown[]) {
    return this.st(sql).run(...(args as never[]))
  }

  read<T>(fn: (r: Repos) => Promise<T>): Promise<T> {
    if (this.txContext.getStore()) return fn(this.repos) // called from inside this transaction: same connection
    return this.mutex.run(() => fn(this.repos))
  }
  tx<T>(fn: (r: Repos) => Promise<T>): Promise<T> {
    if (this.txContext.getStore()) throw new Error('Nested transactions are not supported.')
    return this.mutex.run(async () => {
      this.db.exec('BEGIN IMMEDIATE')
      try {
        const out = await this.txContext.run(true, () => fn(this.repos))
        this.db.exec('COMMIT')
        return out
      } catch (e) {
        this.db.exec('ROLLBACK')
        throw e
      }
    })
  }
  /** Online backup to a file (node:sqlite backup()); safe while the server is running. */
  backupTo(path: string): Promise<number> {
    return this.mutex.run(() => sqliteBackup(this.db, path))
  }
  close() {
    this.db.close()
  }

  // ------------------------------------------------------------------------------------------- repositories
  private build(): Repos {
    const user = (r: Row): UserRow => ({ id: String(r.id), displayName: String(r.display_name), email: s(r.email), initials: String(r.initials), status: r.status === 'disabled' ? 'disabled' : 'active', mustChangePassword: n(r.must_change_password) === 1, demo: n(r.demo) === 1, createdAt: String(r.created_at), createdBy: s(r.created_by) })
    const team = (r: Row): TeamRow => ({ id: String(r.id), label: String(r.label), maxMembers: n(r.max_members), status: r.status === 'archived' ? 'archived' : 'active', createdBy: String(r.created_by), createdAt: String(r.created_at) })
    const project = (r: Row): ProjectRow => ({ id: String(r.id), teamId: String(r.team_id), doc: JSON.parse(String(r.doc)) as ProjectDoc, version: n(r.version), createdAt: String(r.created_at), createdBy: String(r.created_by), updatedAt: String(r.updated_at), updatedBy: String(r.updated_by) })
    const change = (r: Row): ChangeRow => ({ id: String(r.chg_id), at: String(r.at), by: String(r.by_initials), source: String(r.source) as ChangeSet['source'], summary: String(r.summary), ...(r.rationale ? { rationale: String(r.rationale) } : {}), ops: JSON.parse(String(r.ops)), rev: n(r.rev), seq: n(r.seq), version: n(r.version), actorUserId: s(r.actor_user_id), clientChangeId: s(r.client_change_id) })
    const snap = (r: Row): SnapshotRow => ({ id: String(r.snp_id), kind: String(r.kind) as SnapshotRow['kind'], label: String(r.label), rev: n(r.rev), at: String(r.at), createdBy: String(r.created_by) })
    const approval = (r: Row): ApprovalRow => ({ id: String(r.id), projectId: String(r.project_id), state: String(r.state) as ApprovalState, requestedBy: String(r.requested_by), requestedAt: String(r.requested_at), proposalSnapshot: String(r.proposal_snapshot), decidedBy: s(r.decided_by), decidedAt: s(r.decided_at), decisionComment: s(r.decision_comment), approvedHash: s(r.approved_hash), changedAt: s(r.changed_at), supersedes: s(r.supersedes) })
    const session = (r: Row): SessionRow => ({ tokenHash: String(r.token_hash), userId: String(r.user_id), csrfHash: String(r.csrf_hash), createdAt: String(r.created_at), lastSeenAt: String(r.last_seen_at), idleSeconds: n(r.idle_seconds), expiresAt: String(r.expires_at) })

    const identity: IdentityRepo = {
      createUser: async (u, login, hash, roles, grantedBy) => {
        this.run('INSERT INTO users (id, display_name, email, initials, status, must_change_password, demo, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?)', u.id, u.displayName, u.email, u.initials, u.status, u.mustChangePassword ? 1 : 0, u.demo ? 1 : 0, u.createdAt, u.createdBy)
        this.run('INSERT INTO identities (id, user_id, provider, subject, created_at) VALUES (?,?,?,?,?)', crypto.randomUUID(), u.id, 'local', login, u.createdAt)
        this.run('INSERT INTO password_credentials (user_id, hash, updated_at) VALUES (?,?,?)', u.id, hash, u.createdAt)
        for (const role of roles) this.run("INSERT INTO user_roles (user_id, course_id, role, granted_by, granted_at) VALUES (?, 'default', ?, ?, ?)", u.id, role, grantedBy, u.createdAt)
      },
      userById: async (id) => {
        const r = this.get('SELECT * FROM users WHERE id = ?', id)
        return r ? user(r) : null
      },
      byLogin: async (login) => {
        const r = this.get("SELECT u.*, c.hash, c.failed_count, c.locked_until FROM identities i JOIN users u ON u.id = i.user_id JOIN password_credentials c ON c.user_id = u.id WHERE i.provider = 'local' AND i.subject = ?", login)
        if (!r) return null
        const cred: Credential = { userId: String(r.id), hash: String(r.hash), failedCount: n(r.failed_count), lockedUntil: s(r.locked_until) }
        return { user: user(r), cred }
      },
      loginOf: async (userId) => s(this.get("SELECT subject FROM identities WHERE provider = 'local' AND user_id = ?", userId)?.subject),
      roles: async (userId) => this.all("SELECT role FROM user_roles WHERE user_id = ? AND course_id = 'default' ORDER BY role", userId).map((r) => String(r.role) as Role),
      listUsers: async () =>
        this.all('SELECT * FROM users ORDER BY display_name').map((r) => ({
          ...user(r),
          login: s(this.get("SELECT subject FROM identities WHERE provider = 'local' AND user_id = ?", r.id)?.subject),
          roles: this.all("SELECT role FROM user_roles WHERE user_id = ? AND course_id = 'default' ORDER BY role", r.id).map((x) => String(x.role) as Role),
        })),
      setPassword: async (userId, hash, mustChange, at) => {
        this.run('UPDATE password_credentials SET hash = ?, updated_at = ?, failed_count = 0, locked_until = NULL WHERE user_id = ?', hash, at, userId)
        this.run('UPDATE users SET must_change_password = ? WHERE id = ?', mustChange ? 1 : 0, userId)
      },
      setLoginFailures: async (userId, failed, lockedUntil) => {
        this.run('UPDATE password_credentials SET failed_count = ?, locked_until = ? WHERE user_id = ?', failed, lockedUntil, userId)
      },
      countUsers: async () => n(this.get('SELECT COUNT(*) AS c FROM users')?.c),
      countDemoUsers: async () => n(this.get('SELECT COUNT(*) AS c FROM users WHERE demo = 1')?.c),
      createSession: async (x) => {
        this.run('INSERT INTO sessions (token_hash, user_id, csrf_hash, created_at, last_seen_at, idle_seconds, expires_at) VALUES (?,?,?,?,?,?,?)', x.tokenHash, x.userId, x.csrfHash, x.createdAt, x.lastSeenAt, x.idleSeconds, x.expiresAt)
      },
      session: async (h) => {
        const r = this.get('SELECT * FROM sessions WHERE token_hash = ? AND revoked_at IS NULL', h)
        return r ? session(r) : null
      },
      touchSession: async (h, at) => {
        this.run('UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?', at, h)
      },
      deleteSession: async (h) => {
        this.run('DELETE FROM sessions WHERE token_hash = ?', h)
      },
      deleteSessionsOf: async (userId, except) => Number(this.run('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?', userId, except ?? '').changes),
      deleteExpiredSessions: async (now) => Number(this.run('DELETE FROM sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL OR julianday(last_seen_at) + idle_seconds / 86400.0 <= julianday(?)', now, now).changes),
    }

    const teams: TeamRepo = {
      create: async (t) => {
        this.run("INSERT INTO teams (id, course_id, label, max_members, status, created_by, created_at) VALUES (?, 'default', ?, ?, ?, ?, ?)", t.id, t.label, t.maxMembers, t.status, t.createdBy, t.createdAt)
      },
      get: async (id) => {
        const r = this.get('SELECT * FROM teams WHERE id = ?', id)
        return r ? team(r) : null
      },
      list: async () => this.all('SELECT * FROM teams ORDER BY label').map(team),
      members: async (teamId) => this.all('SELECT m.user_id, m.joined_at, u.display_name, u.initials FROM team_memberships m JOIN users u ON u.id = m.user_id WHERE m.team_id = ? AND m.left_at IS NULL ORDER BY m.joined_at, u.initials', teamId).map((r): MemberRow => ({ userId: String(r.user_id), displayName: String(r.display_name), initials: String(r.initials), joinedAt: String(r.joined_at) })),
      activeTeamOf: async (userId) => {
        const r = this.get('SELECT t.* FROM team_memberships m JOIN teams t ON t.id = m.team_id WHERE m.user_id = ? AND m.left_at IS NULL', userId)
        return r ? team(r) : null
      },
      addMember: async (teamId, userId, by, at) => {
        this.run('INSERT INTO team_memberships (team_id, user_id, joined_at, added_by) VALUES (?,?,?,?)', teamId, userId, at, by)
      },
      removeMember: async (teamId, userId, by, at) => Number(this.run('UPDATE team_memberships SET left_at = ?, removed_by = ? WHERE team_id = ? AND user_id = ? AND left_at IS NULL', at, by, teamId, userId).changes) > 0,
      createInvite: async (h, teamId, by, exp, max) => {
        this.run('INSERT INTO team_invites (code_hash, team_id, created_by, expires_at, max_uses) VALUES (?,?,?,?,?)', h, teamId, by, exp, max)
      },
      invite: async (h) => {
        const r = this.get('SELECT * FROM team_invites WHERE code_hash = ?', h)
        return r ? { teamId: String(r.team_id), expiresAt: String(r.expires_at), maxUses: n(r.max_uses), uses: n(r.uses) } : null
      },
      useInvite: async (h) => {
        this.run('UPDATE team_invites SET uses = uses + 1 WHERE code_hash = ?', h)
      },
    }

    const projects: ProjectRepo = {
      create: async (p) => {
        this.run("INSERT INTO projects (id, team_id, course_id, doc, doc_rev, version, schema_version, created_at, created_by, updated_at, updated_by) VALUES (?, ?, 'default', ?, ?, ?, ?, ?, ?, ?, ?)", p.id, p.teamId, JSON.stringify(p.doc), p.doc.rev, p.version, p.doc.schemaVersion, p.createdAt, p.createdBy, p.updatedAt, p.updatedBy)
      },
      get: async (id) => {
        const r = this.get('SELECT * FROM projects WHERE id = ?', id)
        return r ? project(r) : null
      },
      byTeam: async (teamId) => {
        const r = this.get('SELECT * FROM projects WHERE team_id = ?', teamId)
        return r ? project(r) : null
      },
      list: async () => this.all('SELECT * FROM projects ORDER BY created_at').map(project),
      update: async (id, doc, expected, by, at) => Number(this.run('UPDATE projects SET doc = ?, doc_rev = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE id = ? AND version = ?', JSON.stringify(doc), doc.rev, at, by, id, expected).changes) === 1,
      appendChange: async (pid, c) => {
        this.run('INSERT INTO project_changes (project_id, seq, chg_id, actor_user_id, by_initials, at, source, summary, rationale, ops, rev, version, client_change_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', pid, c.seq, c.id, c.actorUserId, c.by, c.at, c.source, c.summary, c.rationale ?? null, JSON.stringify(c.ops), c.rev, c.version, c.clientChangeId)
      },
      nextSeq: async (pid) => n(this.get('SELECT COALESCE(MAX(seq), 0) AS m FROM project_changes WHERE project_id = ?', pid)?.m) + 1,
      changes: async (pid, since) => this.all('SELECT * FROM project_changes WHERE project_id = ? AND version > ? ORDER BY seq', pid, since ?? -1).map(change),
      changesByClientIds: async (pid, ids) => (ids.length ? this.all(`SELECT * FROM project_changes WHERE project_id = ? AND client_change_id IN (${ids.map(() => '?').join(',')}) ORDER BY seq`, pid, ...ids).map(change) : []),
      putSnapshot: async (pid, x, doc) => {
        this.run('INSERT INTO project_snapshots (project_id, snp_id, kind, label, rev, at, created_by, doc) VALUES (?,?,?,?,?,?,?,?)', pid, x.id, x.kind, x.label, x.rev, x.at, x.createdBy, JSON.stringify(doc))
        this.run('INSERT INTO snapshot_counters (project_id, last) VALUES (?, ?) ON CONFLICT(project_id) DO UPDATE SET last = MAX(last, excluded.last)', pid, Number(String(x.id).slice(4)) || 0) // m6 (N-1)
      },
      snapshots: async (pid) => this.all('SELECT project_id, snp_id, kind, label, rev, at, created_by FROM project_snapshots WHERE project_id = ? ORDER BY snp_id', pid).map(snap),
      snapshot: async (pid, id) => {
        const r = this.get('SELECT * FROM project_snapshots WHERE project_id = ? AND snp_id = ?', pid, id)
        return r ? { ...snap(r), doc: JSON.parse(String(r.doc)) as ProjectDoc } : null
      },
      deleteSnapshot: async (pid, id) => Number(this.run('DELETE FROM project_snapshots WHERE project_id = ? AND snp_id = ?', pid, id).changes) > 0,
      snapshotUsage: async (pid) => {
        // m6 (review M-3): proposal and submission versions are kept forever and have their own bound (the submission
        // limits in services/submissions.ts), so they never use up the members' version quota
        const r = this.get("SELECT COUNT(*) AS c, COALESCE(SUM(length(doc)), 0) AS b FROM project_snapshots WHERE project_id = ? AND kind NOT IN ('proposal','submission')", pid)
        return { count: n(r?.c), bytes: n(r?.b) }
      },
      // m6 (confirmation N-1): the highest number EVER issued (the counter survives deletions), so no snapshot ID is reused
      maxSnapshotNo: async (pid) => Math.max(0, n(this.get('SELECT last FROM snapshot_counters WHERE project_id = ?', pid)?.last), ...this.all('SELECT snp_id FROM project_snapshots WHERE project_id = ?', pid).map((r) => Number(String(r.snp_id).slice(4)) || 0)),
      putImportRecord: async (r) => {
        this.run('INSERT INTO import_records (id, project_id, user_id, at, format, file_name, file_sha256, file_size, warnings, created_ids, chg_id, pre_import_snapshot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', r.id, r.projectId, r.userId, r.at, r.format, r.fileName, r.fileSha256, r.fileSize, r.warnings, JSON.stringify(r.createdIds), r.chgId, r.preImportSnapshot)
      },
      // --- m6 ---
      importRecordAnywhere: async (id) => !!this.get('SELECT 1 AS x FROM import_records WHERE id = ?', id),
      importRecord: async (pid, id) => {
        const r = this.get('SELECT id, at, format, file_name, created_ids, chg_id, pre_import_snapshot FROM import_records WHERE project_id = ? AND id = ?', pid, id)
        return r ? { id: String(r.id), at: String(r.at), format: String(r.format), fileName: s(r.file_name), createdIds: JSON.parse(String(r.created_ids)) as string[], chgId: String(r.chg_id), preImportSnapshot: String(r.pre_import_snapshot) } : null
      },
      // --- end m6 ---
    }

    const approvals: ApprovalRepo = {
      create: async (a) => {
        this.run("INSERT INTO approval_requests (id, project_id, kind, state, requested_by, requested_at, proposal_snapshot, decided_by, decided_at, decision_comment, approved_hash, changed_at, supersedes) VALUES (?, ?, 'enterprise-proposal', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", a.id, a.projectId, a.state, a.requestedBy, a.requestedAt, a.proposalSnapshot, a.decidedBy, a.decidedAt, a.decisionComment, a.approvedHash, a.changedAt, a.supersedes)
      },
      get: async (id) => {
        const r = this.get('SELECT * FROM approval_requests WHERE id = ?', id)
        return r ? approval(r) : null
      },
      latest: async (pid) => {
        const r = this.get("SELECT * FROM approval_requests WHERE project_id = ? AND state <> 'withdrawn' ORDER BY requested_at DESC, rowid DESC LIMIT 1", pid)
        return r ? approval(r) : null
      },
      history: async (pid) => this.all('SELECT * FROM approval_requests WHERE project_id = ? ORDER BY requested_at, rowid', pid).map(approval),
      list: async (state) => (state ? this.all('SELECT * FROM approval_requests WHERE state = ? ORDER BY requested_at, rowid', state) : this.all('SELECT * FROM approval_requests ORDER BY requested_at, rowid')).map(approval),
      decide: async (id, state, by, at, comment, hash) => Number(this.run("UPDATE approval_requests SET state = ?, decided_by = ?, decided_at = ?, decision_comment = ?, approved_hash = ? WHERE id = ? AND state = 'pending'", state, by, at, comment, hash, id).changes) === 1,
      setState: async (id, from, to, at) => Number(this.run('UPDATE approval_requests SET state = ?, changed_at = ? WHERE id = ? AND state = ?', to, at, id, from).changes) === 1,
    }

    // faculty store: its own table, read and written only with an InstructorContext (the type is the access path)
    const faculty: FacultyRepo = {
      approvalNote: async (_ic, id) => s(this.get('SELECT note FROM approval_faculty_notes WHERE approval_id = ?', id)?.note),
      putApprovalNote: async (ic, id, note, at) => {
        this.run('INSERT INTO approval_faculty_notes (approval_id, note, author_user_id, at) VALUES (?, ?, ?, ?) ON CONFLICT(approval_id) DO UPDATE SET note = excluded.note, author_user_id = excluded.author_user_id, at = excluded.at', id, note, ic.userId, at)
      },
    }

    const audit: AuditRepo = {
      append: async (e) => {
        this.run('INSERT INTO audit_log (at, actor_user_id, actor_role, action, target_type, target_id, outcome, detail) VALUES (?,?,?,?,?,?,?,?)', e.at, e.actorUserId, e.actorRole, e.action, e.targetType ?? null, e.targetId ?? null, e.outcome, e.detail ? JSON.stringify(e.detail) : null)
      },
      list: async (limit = 200) =>
        this.all('SELECT * FROM audit_log ORDER BY seq DESC LIMIT ?', limit).map((r) => ({ seq: n(r.seq), at: String(r.at), actorUserId: s(r.actor_user_id), actorRole: s(r.actor_role), action: String(r.action), targetType: s(r.target_type) ?? undefined, targetId: s(r.target_id) ?? undefined, outcome: String(r.outcome) as 'ok', detail: r.detail ? (JSON.parse(String(r.detail)) as Record<string, unknown>) : undefined })),
    }
    const meta: MetaRepo = {
      get: async (k) => s(this.get('SELECT value FROM server_meta WHERE key = ?', k)?.value),
      set: async (k, v) => {
        this.run('INSERT INTO server_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', k, v)
      },
    }
    // --- publishing ---
    const content = buildContentRepo({ all: (q, ...a) => this.all(q, ...a), get: (q, ...a) => this.get(q, ...a), run: (q, ...a) => this.run(q, ...a) })
    // --- end publishing ---
    // --- m6 ---
    const submissions = buildSubmissionRepo({ all: (q, ...a) => this.all(q, ...a), get: (q, ...a) => this.get(q, ...a), run: (q, ...a) => this.run(q, ...a) })
    // --- end m6 ---
    return { identity, teams, projects, approvals, faculty, audit, meta, content, submissions }
  }
}
