// The CONTENT store (PROJECT_DATA_SCHEMA.md §2, §8; CONTENT_PUBLISHING_DESIGN.md §4): content_items, content_revisions,
// content_releases, content_release_items. Its own repository module and its own SQL: no statement here names a table
// of another store (server/test/content.test.ts greps this file), so a publish cannot touch projects, progress,
// submissions or faculty material. Faculty-only content (notes, keys) is out of the limited scope (A24): slides and
// faculty notes stay code-authored, so faculty_content_revisions is not created yet.
//
// Migration track (written deviation from PROJECT_DATA_SCHEMA.md §12, which has one linear track): the content store
// keeps its own versioned, forward-only track in `content_schema_migrations`. Reason: the main track (repo/migrations.ts)
// is being extended concurrently by the M6 milestone (submissions, progress); two agents adding "version 3" would
// collide. A separate track per store keeps both forward-only and conflict-free; it runs in the same connection right
// after the main track, inside its own transaction per migration, and the pre-migration backup of the main track
// already covers the file. Merge into the main track is possible later (same SQL, one renumbering).
import type { DatabaseSync } from 'node:sqlite'
import type { ContentState, ItemKind } from '../../src/publishing/types'

export type ContentMigration = { version: number; name: string; sql: string }
export const CONTENT_MIGRATIONS: ContentMigration[] = [
  {
    version: 1,
    name: 'content store: items, immutable revisions, releases',
    sql: `
CREATE TABLE content_items (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('course-intro','course-settings','learn-section')),
  week INTEGER, parent_id TEXT, title TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0,
  seed_sha256 TEXT NOT NULL, created_at TEXT NOT NULL, created_by TEXT NOT NULL, retired_at TEXT);
CREATE TABLE content_revisions (
  id TEXT PRIMARY KEY, item_id TEXT NOT NULL REFERENCES content_items(id), seq INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft','ready-for-review','published','superseded','archived')),
  body TEXT NOT NULL, body_sha256 TEXT NOT NULL, base_revision_id TEXT, restored_from TEXT,
  author_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  submitted_at TEXT, submitted_by TEXT, published_at TEXT, published_by TEXT, release_id TEXT,
  superseded_at TEXT, archived_at TEXT, archived_by TEXT, change_note TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL, UNIQUE (item_id, seq));
CREATE UNIQUE INDEX content_one_open_draft ON content_revisions(item_id) WHERE state IN ('draft','ready-for-review');
CREATE UNIQUE INDEX content_one_published ON content_revisions(item_id) WHERE state = 'published';
CREATE TABLE content_releases (
  id TEXT PRIMARY KEY, seq INTEGER NOT NULL UNIQUE, published_at TEXT NOT NULL, published_by TEXT NOT NULL, note TEXT NOT NULL);
CREATE TABLE content_release_items (
  release_id TEXT NOT NULL REFERENCES content_releases(id), item_id TEXT NOT NULL, revision_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('publish','archive')), PRIMARY KEY (release_id, item_id));
-- revisions are immutable once they leave DRAFT (design §2.2): the body changes only while the row is a draft
CREATE TRIGGER content_body_immutable BEFORE UPDATE OF body, body_sha256 ON content_revisions WHEN OLD.state <> 'draft'
  BEGIN SELECT RAISE(ABORT, 'content revision body is immutable once it leaves draft'); END;
-- only an open draft may be deleted (discard); history is never deleted
CREATE TRIGGER content_history_kept BEFORE DELETE ON content_revisions WHEN OLD.state NOT IN ('draft','ready-for-review')
  BEGIN SELECT RAISE(ABORT, 'published, superseded and archived revisions are never deleted'); END;
-- superseded and archived are terminal; published may only become superseded or archived; a draft never jumps to superseded/archived
CREATE TRIGGER content_state_rules BEFORE UPDATE OF state ON content_revisions WHEN NEW.state <> OLD.state AND (
     OLD.state IN ('superseded','archived')
  OR (OLD.state = 'published' AND NEW.state NOT IN ('superseded','archived'))
  OR (OLD.state IN ('draft','ready-for-review') AND NEW.state NOT IN ('draft','ready-for-review','published')))
  BEGIN SELECT RAISE(ABORT, 'content state transition not allowed'); END;
CREATE TRIGGER content_release_items_append_only BEFORE UPDATE ON content_release_items BEGIN SELECT RAISE(ABORT, 'append-only'); END;
CREATE TRIGGER content_release_items_no_delete BEFORE DELETE ON content_release_items BEGIN SELECT RAISE(ABORT, 'append-only'); END;
CREATE TRIGGER content_releases_no_delete BEFORE DELETE ON content_releases BEGIN SELECT RAISE(ABORT, 'append-only'); END;
`,
  },
  {
    // M3 review L1: published, superseded and archived revisions are frozen whole (metadata included); the only update
    // allowed is a permitted state transition with its own timestamp columns. Releases and item identity are frozen.
    version: 2,
    name: 'content store: frozen revision metadata, immutable releases and item identity',
    sql: `
CREATE TRIGGER content_revision_frozen BEFORE UPDATE ON content_revisions WHEN OLD.state IN ('published','superseded','archived') AND (
     NEW.state = OLD.state
  OR NEW.id IS NOT OLD.id OR NEW.item_id IS NOT OLD.item_id OR NEW.seq IS NOT OLD.seq
  OR NEW.body IS NOT OLD.body OR NEW.body_sha256 IS NOT OLD.body_sha256
  OR NEW.base_revision_id IS NOT OLD.base_revision_id OR NEW.restored_from IS NOT OLD.restored_from
  OR NEW.author_id IS NOT OLD.author_id OR NEW.created_at IS NOT OLD.created_at
  OR NEW.submitted_at IS NOT OLD.submitted_at OR NEW.submitted_by IS NOT OLD.submitted_by
  OR NEW.published_at IS NOT OLD.published_at OR NEW.published_by IS NOT OLD.published_by OR NEW.release_id IS NOT OLD.release_id
  OR NEW.change_note IS NOT OLD.change_note OR NEW.version IS NOT OLD.version
  OR (NEW.superseded_at IS NOT OLD.superseded_at AND NOT (OLD.state = 'published' AND NEW.state = 'superseded'))
  OR ((NEW.archived_at IS NOT OLD.archived_at OR NEW.archived_by IS NOT OLD.archived_by) AND NOT (OLD.state = 'published' AND NEW.state = 'archived')))
  BEGIN SELECT RAISE(ABORT, 'published, superseded and archived revisions are immutable (only a permitted state transition)'); END;
CREATE TRIGGER content_releases_no_update BEFORE UPDATE ON content_releases BEGIN SELECT RAISE(ABORT, 'append-only'); END;
CREATE TRIGGER content_items_identity BEFORE UPDATE ON content_items WHEN NEW.id IS NOT OLD.id OR NEW.kind IS NOT OLD.kind
  OR NEW.seed_sha256 IS NOT OLD.seed_sha256 OR NEW.created_at IS NOT OLD.created_at OR NEW.created_by IS NOT OLD.created_by
  BEGIN SELECT RAISE(ABORT, 'content item identity is immutable'); END;
`,
  },
]
export const CONTENT_LATEST = CONTENT_MIGRATIONS[CONTENT_MIGRATIONS.length - 1].version

export function contentSchemaVersion(db: DatabaseSync): number {
  const t = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='content_schema_migrations'").get()
  if (!t) return 0
  return ((db.prepare('SELECT MAX(version) AS v FROM content_schema_migrations').get() as { v: number | null }).v ?? 0)
}
export function migrateContent(db: DatabaseSync, list: ContentMigration[] = CONTENT_MIGRATIONS): number[] {
  db.exec('CREATE TABLE IF NOT EXISTS content_schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)')
  const from = contentSchemaVersion(db)
  const known = list.length ? list[list.length - 1].version : 0
  if (from > known) throw new Error(`The content store schema is version ${from}, newer than this server (${known}).`)
  const applied: number[] = []
  for (const m of list.filter((x) => x.version > from).sort((a, b) => a.version - b.version)) {
    db.exec('BEGIN IMMEDIATE')
    try {
      db.exec(m.sql)
      db.prepare('INSERT INTO content_schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(m.version, m.name, new Date().toISOString())
      db.exec('COMMIT')
      applied.push(m.version)
    } catch (e) {
      db.exec('ROLLBACK')
      throw new Error(`Content migration ${m.version} (${m.name}) failed and was rolled back: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return applied
}

// ------------------------------------------------------------------------------------------- rows and port
export type ContentItemRow = { id: string; kind: ItemKind; week: number | null; parentId: string | null; title: string; sort: number; seedSha256: string; createdAt: string; createdBy: string }
export type RevisionRow = {
  id: string
  itemId: string
  seq: number
  state: ContentState
  body: string
  bodySha256: string
  baseRevisionId: string | null
  restoredFrom: string | null
  authorId: string
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  submittedBy: string | null
  publishedAt: string | null
  publishedBy: string | null
  releaseId: string | null
  supersededAt: string | null
  archivedAt: string | null
  archivedBy: string | null
  changeNote: string
  version: number
}
export type ReleaseRow = { id: string; seq: number; publishedAt: string; publishedBy: string; note: string; items: { itemId: string; revisionId: string; action: 'publish' | 'archive' }[] }

export interface ContentRepo {
  items(): Promise<ContentItemRow[]>
  item(id: string): Promise<ContentItemRow | null>
  createItem(i: ContentItemRow): Promise<void>
  revisions(itemId: string): Promise<RevisionRow[]>
  revision(id: string): Promise<RevisionRow | null>
  revisionBySeq(itemId: string, seq: number): Promise<RevisionRow | null>
  published(itemId: string): Promise<RevisionRow | null>
  /** Every published revision (the student view) — student-visible rows only. */
  allPublished(): Promise<RevisionRow[]>
  /** Items with an archived revision and no published one (withdrawn from the student view). */
  withdrawnItems(): Promise<string[]>
  openDraft(itemId: string): Promise<RevisionRow | null>
  openDrafts(): Promise<RevisionRow[]>
  nextSeq(itemId: string): Promise<number>
  insertRevision(r: RevisionRow): Promise<void>
  /** Writes a draft body only if the stored version is still `expectedVersion` and the row is a draft. */
  updateDraft(id: string, body: string, sha: string, expectedVersion: number, at: string, authorId: string): Promise<boolean>
  setState(id: string, from: ContentState, to: ContentState, fields: Partial<Pick<RevisionRow, 'submittedAt' | 'submittedBy' | 'publishedAt' | 'publishedBy' | 'releaseId' | 'supersededAt' | 'archivedAt' | 'archivedBy' | 'changeNote'>>, at: string): Promise<boolean>
  deleteOpenDraft(id: string): Promise<boolean>
  latestRelease(): Promise<ReleaseRow | null>
  releases(limit?: number): Promise<ReleaseRow[]>
  nextReleaseSeq(): Promise<number>
  insertRelease(r: ReleaseRow): Promise<void>
}

type Row = Record<string, unknown>
export type Sql = { all: (sql: string, ...a: unknown[]) => Row[]; get: (sql: string, ...a: unknown[]) => Row | undefined; run: (sql: string, ...a: unknown[]) => { changes: number | bigint } }
const s = (v: unknown) => (v === null || v === undefined ? null : String(v))
const n = (v: unknown) => Number(v ?? 0)

export function buildContentRepo(q: Sql): ContentRepo {
  const item = (r: Row): ContentItemRow => ({ id: String(r.id), kind: String(r.kind) as ItemKind, week: r.week === null ? null : n(r.week), parentId: s(r.parent_id), title: String(r.title), sort: n(r.sort), seedSha256: String(r.seed_sha256), createdAt: String(r.created_at), createdBy: String(r.created_by) })
  const rev = (r: Row): RevisionRow => ({
    id: String(r.id), itemId: String(r.item_id), seq: n(r.seq), state: String(r.state) as ContentState, body: String(r.body), bodySha256: String(r.body_sha256),
    baseRevisionId: s(r.base_revision_id), restoredFrom: s(r.restored_from), authorId: String(r.author_id), createdAt: String(r.created_at), updatedAt: String(r.updated_at),
    submittedAt: s(r.submitted_at), submittedBy: s(r.submitted_by), publishedAt: s(r.published_at), publishedBy: s(r.published_by), releaseId: s(r.release_id),
    supersededAt: s(r.superseded_at), archivedAt: s(r.archived_at), archivedBy: s(r.archived_by), changeNote: String(r.change_note ?? ''), version: n(r.version),
  })
  const release = (r: Row): ReleaseRow => ({
    id: String(r.id), seq: n(r.seq), publishedAt: String(r.published_at), publishedBy: String(r.published_by), note: String(r.note),
    items: q.all('SELECT item_id, revision_id, action FROM content_release_items WHERE release_id = ? ORDER BY item_id', r.id).map((x) => ({ itemId: String(x.item_id), revisionId: String(x.revision_id), action: String(x.action) as 'publish' | 'archive' })),
  })
  return {
    items: async () => q.all('SELECT * FROM content_items WHERE retired_at IS NULL ORDER BY sort, id').map(item),
    item: async (id) => {
      const r = q.get('SELECT * FROM content_items WHERE id = ? AND retired_at IS NULL', id)
      return r ? item(r) : null
    },
    createItem: async (i) => {
      q.run('INSERT INTO content_items (id, kind, week, parent_id, title, sort, seed_sha256, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?)', i.id, i.kind, i.week, i.parentId, i.title, i.sort, i.seedSha256, i.createdAt, i.createdBy)
    },
    revisions: async (itemId) => q.all('SELECT * FROM content_revisions WHERE item_id = ? ORDER BY seq', itemId).map(rev),
    revision: async (id) => {
      const r = q.get('SELECT * FROM content_revisions WHERE id = ?', id)
      return r ? rev(r) : null
    },
    revisionBySeq: async (itemId, seq) => {
      const r = q.get('SELECT * FROM content_revisions WHERE item_id = ? AND seq = ?', itemId, seq)
      return r ? rev(r) : null
    },
    published: async (itemId) => {
      const r = q.get("SELECT * FROM content_revisions WHERE item_id = ? AND state = 'published'", itemId)
      return r ? rev(r) : null
    },
    allPublished: async () => q.all("SELECT r.* FROM content_revisions r JOIN content_items i ON i.id = r.item_id WHERE r.state = 'published' AND i.retired_at IS NULL ORDER BY i.sort, i.id").map(rev),
    withdrawnItems: async () => q.all("SELECT DISTINCT a.item_id FROM content_revisions a WHERE a.state = 'archived' AND NOT EXISTS (SELECT 1 FROM content_revisions p WHERE p.item_id = a.item_id AND p.state = 'published') ORDER BY a.item_id").map((r) => String(r.item_id)),
    openDraft: async (itemId) => {
      const r = q.get("SELECT * FROM content_revisions WHERE item_id = ? AND state IN ('draft','ready-for-review')", itemId)
      return r ? rev(r) : null
    },
    openDrafts: async () => q.all("SELECT * FROM content_revisions WHERE state IN ('draft','ready-for-review') ORDER BY item_id").map(rev),
    nextSeq: async (itemId) => n(q.get('SELECT COALESCE(MAX(seq), 0) AS m FROM content_revisions WHERE item_id = ?', itemId)?.m) + 1,
    insertRevision: async (r) => {
      q.run(
        'INSERT INTO content_revisions (id, item_id, seq, state, body, body_sha256, base_revision_id, restored_from, author_id, created_at, updated_at, submitted_at, submitted_by, published_at, published_by, release_id, superseded_at, archived_at, archived_by, change_note, version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        r.id, r.itemId, r.seq, r.state, r.body, r.bodySha256, r.baseRevisionId, r.restoredFrom, r.authorId, r.createdAt, r.updatedAt, r.submittedAt, r.submittedBy, r.publishedAt, r.publishedBy, r.releaseId, r.supersededAt, r.archivedAt, r.archivedBy, r.changeNote, r.version,
      )
    },
    updateDraft: async (id, body, sha, expected, at, authorId) => Number(q.run("UPDATE content_revisions SET body = ?, body_sha256 = ?, updated_at = ?, author_id = ?, version = version + 1 WHERE id = ? AND version = ? AND state = 'draft'", body, sha, at, authorId, id, expected).changes) === 1,
    setState: async (id, from, to, f, at) => {
      if (from === to) return false // M3 review L1: no metadata-only update through setState
      const cols: string[] = ['state = ?', 'updated_at = ?']
      const vals: unknown[] = [to, at]
      const map: Record<string, string> = { submittedAt: 'submitted_at', submittedBy: 'submitted_by', publishedAt: 'published_at', publishedBy: 'published_by', releaseId: 'release_id', supersededAt: 'superseded_at', archivedAt: 'archived_at', archivedBy: 'archived_by', changeNote: 'change_note' }
      for (const [k, v] of Object.entries(f)) {
        if (!(k in map)) continue
        cols.push(`${map[k]} = ?`) // column names come from the fixed map above, never from input
        vals.push(v)
      }
      return Number(q.run(`UPDATE content_revisions SET ${cols.join(', ')} WHERE id = ? AND state = ?`, ...vals, id, from).changes) === 1
    },
    deleteOpenDraft: async (id) => Number(q.run("DELETE FROM content_revisions WHERE id = ? AND state IN ('draft','ready-for-review')", id).changes) === 1,
    latestRelease: async () => {
      const r = q.get('SELECT * FROM content_releases ORDER BY seq DESC LIMIT 1')
      return r ? release(r) : null
    },
    releases: async (limit = 100) => q.all('SELECT * FROM content_releases ORDER BY seq DESC LIMIT ?', limit).map(release),
    nextReleaseSeq: async () => n(q.get('SELECT COALESCE(MAX(seq), 0) AS m FROM content_releases')?.m) + 1,
    insertRelease: async (r) => {
      q.run('INSERT INTO content_releases (id, seq, published_at, published_by, note) VALUES (?,?,?,?,?)', r.id, r.seq, r.publishedAt, r.publishedBy, r.note)
      for (const x of r.items) q.run('INSERT INTO content_release_items (release_id, item_id, revision_id, action) VALUES (?,?,?,?)', r.id, x.itemId, x.revisionId, x.action)
    },
  }
}
