// Versioned, forward-only schema migrations (PROJECT_DATA_SCHEMA.md §12). Each migration runs in its own transaction
// and records its version in schema_migrations; a database newer than this server is refused (no downgrade). A file
// database with pending migrations is backed up first (SECURITY_ARCHITECTURE.md §12). M2 creates the identity, teams,
// projects, approvals and audit stores; content, faculty, submissions and progress come with M3/M6.
import type { DatabaseSync } from 'node:sqlite'

export type Migration = { version: number; name: string; sql: string }

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'identity, teams, projects, approvals, audit',
    sql: `
CREATE TABLE server_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE courses (id TEXT PRIMARY KEY, code TEXT NOT NULL, term TEXT NOT NULL, title TEXT NOT NULL);
INSERT INTO courses (id, code, term, title) VALUES ('default', 'SYSML', 'current term', 'Systems Thinking and MBSE with SysML v2');

CREATE TABLE users (
  id TEXT PRIMARY KEY, display_name TEXT NOT NULL, email TEXT UNIQUE,
  initials TEXT NOT NULL CHECK (length(initials) BETWEEN 2 AND 4),
  status TEXT NOT NULL CHECK (status IN ('active','disabled')),
  must_change_password INTEGER NOT NULL DEFAULT 0, demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, created_by TEXT);
CREATE TABLE identities (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), provider TEXT NOT NULL, subject TEXT NOT NULL,
  created_at TEXT NOT NULL, UNIQUE (provider, subject));
CREATE TABLE password_credentials (
  user_id TEXT PRIMARY KEY REFERENCES users(id), hash TEXT NOT NULL, updated_at TEXT NOT NULL,
  failed_count INTEGER NOT NULL DEFAULT 0, locked_until TEXT);
CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL REFERENCES courses(id),
  role TEXT NOT NULL CHECK (role IN ('student','instructor','admin')),
  granted_by TEXT, granted_at TEXT NOT NULL, PRIMARY KEY (user_id, course_id, role));
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), csrf_hash TEXT NOT NULL,
  created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL, idle_seconds INTEGER NOT NULL, expires_at TEXT NOT NULL,
  revoked_at TEXT);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE teams (
  id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id), label TEXT NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 5, status TEXT NOT NULL CHECK (status IN ('active','archived')),
  created_by TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE (course_id, label));
CREATE TABLE team_memberships (
  team_id TEXT NOT NULL REFERENCES teams(id), user_id TEXT NOT NULL REFERENCES users(id),
  joined_at TEXT NOT NULL, added_by TEXT NOT NULL, left_at TEXT, removed_by TEXT,
  PRIMARY KEY (team_id, user_id, joined_at));
CREATE UNIQUE INDEX one_active_team_per_student ON team_memberships(user_id) WHERE left_at IS NULL;
CREATE TABLE team_invites (
  code_hash TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id), created_by TEXT NOT NULL,
  expires_at TEXT NOT NULL, max_uses INTEGER NOT NULL DEFAULT 5, uses INTEGER NOT NULL DEFAULT 0);

CREATE TABLE projects (
  id TEXT PRIMARY KEY, team_id TEXT NOT NULL UNIQUE REFERENCES teams(id), course_id TEXT NOT NULL,
  doc TEXT NOT NULL, doc_rev INTEGER NOT NULL, version INTEGER NOT NULL, schema_version INTEGER NOT NULL,
  created_at TEXT NOT NULL, created_by TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL);
CREATE TABLE project_changes (
  project_id TEXT NOT NULL REFERENCES projects(id), seq INTEGER NOT NULL, chg_id TEXT NOT NULL,
  actor_user_id TEXT, by_initials TEXT NOT NULL, at TEXT NOT NULL, source TEXT NOT NULL,
  summary TEXT NOT NULL, rationale TEXT, ops TEXT NOT NULL, rev INTEGER NOT NULL, version INTEGER NOT NULL,
  client_change_id TEXT,
  PRIMARY KEY (project_id, seq), UNIQUE (project_id, chg_id), UNIQUE (project_id, client_change_id));
CREATE TABLE project_snapshots (
  project_id TEXT NOT NULL REFERENCES projects(id), snp_id TEXT NOT NULL, kind TEXT NOT NULL, label TEXT NOT NULL,
  rev INTEGER NOT NULL, at TEXT NOT NULL, created_by TEXT NOT NULL, doc TEXT NOT NULL,
  PRIMARY KEY (project_id, snp_id));
CREATE TABLE import_records (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), user_id TEXT NOT NULL, at TEXT NOT NULL,
  format TEXT NOT NULL, file_name TEXT, file_sha256 TEXT, file_size INTEGER, sheet TEXT, mapping TEXT,
  rows_read INTEGER, rows_imported INTEGER, duplicates TEXT, warnings TEXT, created_ids TEXT NOT NULL,
  chg_id TEXT NOT NULL, pre_import_snapshot TEXT NOT NULL, raw_file_retained INTEGER NOT NULL DEFAULT 0);

CREATE TABLE approval_requests (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL CHECK (kind IN ('enterprise-proposal')),
  state TEXT NOT NULL CHECK (state IN ('pending','approved','revision-requested','withdrawn')),
  requested_by TEXT NOT NULL, requested_at TEXT NOT NULL, proposal_snapshot TEXT NOT NULL,
  decided_by TEXT, decided_at TEXT, decision_comment TEXT,
  private_note TEXT,
  supersedes TEXT REFERENCES approval_requests(id));
CREATE INDEX approvals_project ON approval_requests(project_id, requested_at);

CREATE TABLE audit_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor_user_id TEXT, actor_role TEXT, action TEXT NOT NULL,
  target_type TEXT, target_id TEXT, outcome TEXT NOT NULL CHECK (outcome IN ('ok','denied','error')),
  detail TEXT, prev_hash TEXT, hash TEXT);
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT, 'append-only'); END;
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT, 'append-only'); END;
`,
  },
  {
    // M2 review H1 and M5: the approval is bound to the approved content (approved_hash, changed_at, the new state
    // 'approved-changes-pending'); the faculty-only note moves out of the submissions store into its own faculty table.
    // SQLite cannot alter a CHECK constraint, so approval_requests is rebuilt (rows copied in their original order).
    version: 2,
    name: 'approval bound to approved content; faculty notes in their own table',
    sql: `
CREATE TABLE faculty_notes_tmp (approval_id TEXT NOT NULL, note TEXT NOT NULL, author_user_id TEXT NOT NULL, at TEXT NOT NULL);
INSERT INTO faculty_notes_tmp (approval_id, note, author_user_id, at)
  SELECT id, private_note, COALESCE(decided_by, requested_by), COALESCE(decided_at, requested_at) FROM approval_requests
  WHERE private_note IS NOT NULL AND private_note <> '';
CREATE TABLE approval_requests_new (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL CHECK (kind IN ('enterprise-proposal')),
  state TEXT NOT NULL CHECK (state IN ('pending','approved','approved-changes-pending','revision-requested','withdrawn')),
  requested_by TEXT NOT NULL, requested_at TEXT NOT NULL, proposal_snapshot TEXT NOT NULL,
  decided_by TEXT, decided_at TEXT, decision_comment TEXT,
  approved_hash TEXT, changed_at TEXT,
  supersedes TEXT REFERENCES approval_requests_new(id));
INSERT INTO approval_requests_new (id, project_id, kind, state, requested_by, requested_at, proposal_snapshot, decided_by, decided_at, decision_comment, supersedes)
  SELECT id, project_id, kind, state, requested_by, requested_at, proposal_snapshot, decided_by, decided_at, decision_comment, supersedes FROM approval_requests ORDER BY rowid;
DROP TABLE approval_requests;
ALTER TABLE approval_requests_new RENAME TO approval_requests;
CREATE INDEX approvals_project ON approval_requests(project_id, requested_at);
CREATE TABLE approval_faculty_notes (
  approval_id TEXT PRIMARY KEY REFERENCES approval_requests(id), note TEXT NOT NULL, author_user_id TEXT NOT NULL, at TEXT NOT NULL);
INSERT INTO approval_faculty_notes (approval_id, note, author_user_id, at) SELECT approval_id, note, author_user_id, at FROM faculty_notes_tmp;
DROP TABLE faculty_notes_tmp;
`,
  },
]

export const LATEST_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version

export function currentVersion(db: DatabaseSync): number {
  const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get()
  if (!t) return 0
  const r = db.prepare('SELECT MAX(version) AS v FROM schema_migrations').get() as { v: number | null }
  return r.v ?? 0
}

/** Applies pending migrations in order. `beforeApply` runs once when anything is pending on a database that already
 *  has a schema (the pre-migration backup). Returns the versions applied. */
export function migrate(db: DatabaseSync, list: Migration[] = MIGRATIONS, beforeApply?: (from: number) => void): number[] {
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)')
  const from = currentVersion(db)
  const known = list.length ? list[list.length - 1].version : 0
  if (from > known) throw new Error(`The database schema is version ${from}, newer than this server (${known}). Migrations are forward-only: use a server that knows version ${from}.`)
  const pending = list.filter((m) => m.version > from).sort((a, b) => a.version - b.version)
  if (!pending.length) return []
  if (from > 0 && beforeApply) beforeApply(from)
  const applied: number[] = []
  for (const m of pending) {
    db.exec('BEGIN IMMEDIATE')
    try {
      db.exec(m.sql)
      db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(m.version, m.name, new Date().toISOString())
      db.exec('COMMIT')
      applied.push(m.version)
    } catch (e) {
      db.exec('ROLLBACK')
      throw new Error(`Migration ${m.version} (${m.name}) failed and was rolled back: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return applied
}
