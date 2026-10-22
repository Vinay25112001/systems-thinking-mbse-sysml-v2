// The SUBMISSIONS store (PROJECT_DATA_SCHEMA.md §2, §5.3; spec §g, RS-01…RS-30; M6). One row per submitted package:
// the immutable `submission` snapshot it points to (full ProjectDoc in project_snapshots), the SHA-256 of that stored
// document, the validation summary the server computed from that frozen document (advisory, never a grade; the browser's
// own figure is kept only to flag a difference),
// the team's notes on items they chose to leave, and the instructor's decision with feedback.
//
// Migration track: like the content store (server/repo/content.ts), its own versioned forward-only track in
// `submission_schema_migrations`, run right after the main track, so concurrent milestones never collide on a version
// number of repo/migrations.ts. Immutability is enforced by the database: the submitted fields of a row and every
// `submission` or `proposal` snapshot can never be updated or deleted (triggers), whatever a service does.
import type { DatabaseSync } from 'node:sqlite'

export type SubmissionMigration = { version: number; name: string; sql: string }
export const SUBMISSION_MIGRATIONS: SubmissionMigration[] = [
  {
    version: 1,
    name: 'submissions with immutable snapshots, instructor decision and feedback',
    sql: `
CREATE TABLE submissions (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 14),
  snapshot_id TEXT NOT NULL, doc_sha256 TEXT NOT NULL, doc_rev INTEGER NOT NULL, validation TEXT NOT NULL, notes TEXT NOT NULL,
  proposal_state TEXT NOT NULL, submitted_by TEXT NOT NULL REFERENCES users(id), submitted_at TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('submitted','approved','returned','superseded')),
  decided_by TEXT, decided_at TEXT, feedback TEXT, anchors TEXT, supersedes TEXT REFERENCES submissions(id));
CREATE INDEX submissions_project ON submissions(project_id, week, submitted_at);
CREATE TRIGGER submission_record_immutable BEFORE UPDATE OF id, project_id, week, snapshot_id, doc_sha256, doc_rev, validation, notes, proposal_state, submitted_by, submitted_at, supersedes ON submissions
  BEGIN SELECT RAISE(ABORT, 'a submission record is immutable'); END;
CREATE TRIGGER submission_no_delete BEFORE DELETE ON submissions BEGIN SELECT RAISE(ABORT, 'submissions are kept'); END;
CREATE TRIGGER kept_snapshot_no_update BEFORE UPDATE ON project_snapshots WHEN OLD.kind IN ('submission','proposal')
  BEGIN SELECT RAISE(ABORT, 'proposal and submission versions are immutable'); END;
CREATE TRIGGER kept_snapshot_no_delete BEFORE DELETE ON project_snapshots WHEN OLD.kind IN ('submission','proposal')
  BEGIN SELECT RAISE(ABORT, 'proposal and submission versions are kept'); END;
`,
  },
  {
    // M6 review L-1: INSERT OR REPLACE deletes the conflicting row without firing DELETE triggers (recursive_triggers is
    // off), so a replacing insert is refused before it can happen; and a decided submission's decision cannot change
    // (only returned → superseded, by a newer submission).
    version: 2,
    name: 'no replacing insert over kept rows; decisions final',
    sql: `
CREATE TRIGGER kept_snapshot_no_replace BEFORE INSERT ON project_snapshots
  WHEN EXISTS (SELECT 1 FROM project_snapshots WHERE project_id = NEW.project_id AND snp_id = NEW.snp_id AND kind IN ('submission','proposal'))
  BEGIN SELECT RAISE(ABORT, 'proposal and submission versions are immutable'); END;
CREATE TRIGGER submission_no_replace BEFORE INSERT ON submissions
  WHEN EXISTS (SELECT 1 FROM submissions WHERE id = NEW.id)
  BEGIN SELECT RAISE(ABORT, 'a submission record is immutable'); END;
CREATE TRIGGER submission_decision_final BEFORE UPDATE OF state, decided_by, decided_at, feedback, anchors ON submissions
  WHEN OLD.state IN ('approved','superseded') OR (OLD.state = 'returned' AND (NEW.state <> 'superseded' OR NEW.decided_by IS NOT OLD.decided_by OR NEW.decided_at IS NOT OLD.decided_at OR NEW.feedback IS NOT OLD.feedback OR NEW.anchors IS NOT OLD.anchors))
  BEGIN SELECT RAISE(ABORT, 'a decided submission is final'); END;
`,
  },
  {
    // M6 confirmation N-1: snapshot numbers are never reused (the highest number ever issued per project); N-4: an
    // UPDATE (with any conflict clause, UPDATE OR REPLACE included) cannot move a row onto a kept version's key.
    version: 3,
    name: 'monotonic snapshot numbers; no update onto a kept version',
    sql: `
CREATE TABLE snapshot_counters (project_id TEXT PRIMARY KEY REFERENCES projects(id), last INTEGER NOT NULL);
INSERT INTO snapshot_counters (project_id, last)
  SELECT project_id, MAX(CAST(substr(snp_id, 5) AS INTEGER)) FROM project_snapshots GROUP BY project_id;
CREATE TRIGGER kept_snapshot_no_update_onto BEFORE UPDATE OF project_id, snp_id ON project_snapshots
  WHEN (NEW.project_id IS NOT OLD.project_id OR NEW.snp_id IS NOT OLD.snp_id)
   AND EXISTS (SELECT 1 FROM project_snapshots WHERE project_id = NEW.project_id AND snp_id = NEW.snp_id AND kind IN ('submission','proposal'))
  BEGIN SELECT RAISE(ABORT, 'proposal and submission versions are immutable'); END;
`,
  },
]

export function submissionSchemaVersion(db: DatabaseSync): number {
  const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='submission_schema_migrations'").get()
  if (!t) return 0
  return (db.prepare('SELECT MAX(version) AS v FROM submission_schema_migrations').get() as { v: number | null }).v ?? 0
}
export function migrateSubmissions(db: DatabaseSync, list: SubmissionMigration[] = SUBMISSION_MIGRATIONS): number[] {
  db.exec('CREATE TABLE IF NOT EXISTS submission_schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)')
  const from = submissionSchemaVersion(db)
  const known = list.length ? list[list.length - 1].version : 0
  if (from > known) throw new Error(`The submissions store schema is version ${from}, newer than this server (${known}).`)
  const applied: number[] = []
  for (const m of list.filter((x) => x.version > from).sort((a, b) => a.version - b.version)) {
    db.exec('BEGIN IMMEDIATE')
    try {
      db.exec(m.sql)
      db.prepare('INSERT INTO submission_schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(m.version, m.name, new Date().toISOString())
      db.exec('COMMIT')
      applied.push(m.version)
    } catch (e) {
      db.exec('ROLLBACK')
      throw new Error(`Submissions migration ${m.version} (${m.name}) failed and was rolled back: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return applied
}

export type SubmissionState = 'submitted' | 'approved' | 'returned' | 'superseded'
export const SUBMISSION_STATES: readonly SubmissionState[] = ['submitted', 'approved', 'returned', 'superseded']
export type Anchor = { artifactId: string; text: string }
export type SubmissionRow = {
  id: string
  projectId: string
  week: number
  snapshotId: string
  docSha256: string
  docRev: number
  validation: unknown
  notes: Record<string, string>
  proposalState: string
  submittedBy: string
  submittedAt: string
  state: SubmissionState
  decidedBy: string | null
  decidedAt: string | null
  feedback: string | null
  anchors: Anchor[]
  supersedes: string | null
}
export interface SubmissionRepo {
  create(s: SubmissionRow): Promise<void>
  get(id: string): Promise<SubmissionRow | null>
  byProject(projectId: string, week?: number): Promise<SubmissionRow[]>
  latest(projectId: string, week: number): Promise<SubmissionRow | null>
  list(state?: SubmissionState): Promise<SubmissionRow[]>
  /** Decides a submitted package (false when it is not `submitted` any more). */
  decide(id: string, state: 'approved' | 'returned', by: string, at: string, feedback: string, anchors: Anchor[]): Promise<boolean>
  /** Marks a submitted or returned package superseded by a new submission (false when it was in another state). */
  supersede(id: string): Promise<boolean>
}

type Row = Record<string, unknown>
export type Sql = { all: (sql: string, ...a: unknown[]) => Row[]; get: (sql: string, ...a: unknown[]) => Row | undefined; run: (sql: string, ...a: unknown[]) => { changes: number | bigint } }
const s = (v: unknown) => (v === null || v === undefined ? null : String(v))
const json = <T,>(v: unknown, d: T): T => {
  try {
    return v ? (JSON.parse(String(v)) as T) : d
  } catch {
    return d
  }
}

export function buildSubmissionRepo(q: Sql): SubmissionRepo {
  const row = (r: Row): SubmissionRow => ({
    id: String(r.id), projectId: String(r.project_id), week: Number(r.week), snapshotId: String(r.snapshot_id), docSha256: String(r.doc_sha256), docRev: Number(r.doc_rev),
    validation: json(r.validation, null), notes: json(r.notes, {}), proposalState: String(r.proposal_state), submittedBy: String(r.submitted_by), submittedAt: String(r.submitted_at),
    state: String(r.state) as SubmissionState, decidedBy: s(r.decided_by), decidedAt: s(r.decided_at), feedback: s(r.feedback), anchors: json(r.anchors, []), supersedes: s(r.supersedes),
  })
  return {
    create: async (x) => {
      q.run('INSERT INTO submissions (id, project_id, week, snapshot_id, doc_sha256, doc_rev, validation, notes, proposal_state, submitted_by, submitted_at, state, decided_by, decided_at, feedback, anchors, supersedes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', x.id, x.projectId, x.week, x.snapshotId, x.docSha256, x.docRev, JSON.stringify(x.validation ?? null), JSON.stringify(x.notes), x.proposalState, x.submittedBy, x.submittedAt, x.state, x.decidedBy, x.decidedAt, x.feedback, JSON.stringify(x.anchors), x.supersedes)
    },
    get: async (id) => {
      const r = q.get('SELECT * FROM submissions WHERE id = ?', id)
      return r ? row(r) : null
    },
    byProject: async (pid, week) => (week ? q.all('SELECT * FROM submissions WHERE project_id = ? AND week = ? ORDER BY submitted_at, rowid', pid, week) : q.all('SELECT * FROM submissions WHERE project_id = ? ORDER BY submitted_at, rowid', pid)).map(row),
    latest: async (pid, week) => {
      const r = q.get('SELECT * FROM submissions WHERE project_id = ? AND week = ? ORDER BY submitted_at DESC, rowid DESC LIMIT 1', pid, week)
      return r ? row(r) : null
    },
    list: async (state) => (state ? q.all('SELECT * FROM submissions WHERE state = ? ORDER BY submitted_at, rowid', state) : q.all('SELECT * FROM submissions ORDER BY submitted_at, rowid')).map(row),
    decide: async (id, state, by, at, feedback, anchors) => Number(q.run("UPDATE submissions SET state = ?, decided_by = ?, decided_at = ?, feedback = ?, anchors = ? WHERE id = ? AND state = 'submitted'", state, by, at, feedback, JSON.stringify(anchors), id).changes) === 1,
    supersede: async (id) => Number(q.run("UPDATE submissions SET state = 'superseded' WHERE id = ? AND state IN ('submitted','returned')", id).changes) === 1,
  }
}
