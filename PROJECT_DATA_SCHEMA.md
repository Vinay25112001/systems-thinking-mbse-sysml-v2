# Project Data Schema: server stores, concurrency, migration (M0)

Status: **design, not built.** Written 2026-10-21 for M0, covering directive §6.5 (shared team projects), §7
(separate stores), §12 (one project identity, IDs, history), §13 (import provenance), §15 (saving), §16 (submissions)
and §18 M2. Security rules are in `SECURITY_ARCHITECTURE.md`, content tables in `CONTENT_PUBLISHING_DESIGN.md`, and the
stack in `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md`.

**Reuse first.** The canonical project document, its operations, integrity rules, change sets and snapshots already
exist and are tested:

- `learning-studio/src/project/model/types.ts`: `ProjectDoc`, `Artifact`, `Relationship`, `Operation`, `ChangeSet`,
  `Snapshot`;
- `model/ops.ts`: `applyOps`, `invertOps`;
- `model/commit.ts`: `commitOps`;
- `model/integrity.ts`: `checkOp`, `validateProject`;
- `model/ids.ts`;
- `store/ProjectStore.ts`;
- `store/adapter.ts`: `StorageAdapter`;
- `transfer/*`.

The server stores **that document unchanged** (schema version 1, additive fields only). It replays the **same pure
functions**. No second project model is introduced. Below, `src/` means `learning-studio/src/`.

## 1. Notation

SQL is written for SQLite, the recommended v1 store; PostgreSQL is portable later through the repository interface,
see the backend doc §5. Conventions:

- IDs are UUID text unless stated otherwise.
- Times are ISO 8601 UTC text, set by the server.
- JSON columns are `TEXT` holding canonical JSON.
- Every table belongs to exactly one **store** (§2).
- Foreign keys are on (`PRAGMA foreign_keys=ON`), and the journal mode is WAL.

## 2. Stores (directive §7: separate stores)

| Store | Tables | Who writes | Survives a content publish? |
|---|---|---|---|
| **identity** | `users`, `identities`, `password_credentials`, `user_roles`, `sessions`, `courses`, `course_settings`, `milestone_deadlines` | admin, instructor, auth | yes (untouched) |
| **teams** | `teams`, `team_memberships`, `team_invites` | students (within rules), instructor | yes |
| **projects** | `projects`, `project_changes`, `project_snapshots`, `import_records` | team members through change sets; server `system` changes | **yes (untouched)** |
| **submissions** | `approval_requests`, `submissions`, `feedback` | members (create), instructor (decide, comment) | yes |
| **progress** | `progress`, `assessment_attempts`, `practice_state` | each student, own rows only | yes |
| **content** | `content_items`, `content_revisions`, `content_releases`, `content_release_items` | instructor | — |
| **faculty** | `faculty_content_revisions` | instructor | — |
| **audit** | `audit_log`, `server_meta`, `schema_migrations` | server only | yes |

Separation is enforced in three ways:

1. Each store has its own repository module (`server/repo/<store>.ts`).
2. A publish transaction touches only `content*`, `faculty*` and `audit_log`.
3. A test asserts that row counts and hashes of the projects, submissions and progress stores are identical before and
   after a publish (directive §7 and the acceptance demonstration A9).

## 3. Identity and teams

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY, display_name TEXT NOT NULL, email TEXT UNIQUE,      -- email optional in D1
  initials TEXT NOT NULL CHECK (length(initials) BETWEEN 2 AND 4),          -- shown in project attribution (F7)
  status TEXT NOT NULL CHECK (status IN ('active','disabled')),
  must_change_password INTEGER NOT NULL DEFAULT 0, demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, created_by TEXT);
CREATE TABLE identities (                     -- SSO-ready (SECURITY_ARCHITECTURE.md §4.6)
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,                     -- 'local' | 'oidc:<issuer>' | 'saml:<entityId>'
  subject TEXT NOT NULL,                      -- local: normalised login name
  created_at TEXT NOT NULL, UNIQUE (provider, subject));
CREATE TABLE password_credentials (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  hash TEXT NOT NULL,                         -- 'scrypt$v=1$N=131072,r=8,p=1$salt$hash'
  updated_at TEXT NOT NULL, failed_count INTEGER NOT NULL DEFAULT 0, locked_until TEXT);
CREATE TABLE courses (id TEXT PRIMARY KEY, code TEXT NOT NULL, term TEXT NOT NULL, title TEXT NOT NULL);
CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL REFERENCES courses(id),
  role TEXT NOT NULL CHECK (role IN ('student','instructor','admin')),
  granted_by TEXT, granted_at TEXT NOT NULL, PRIMARY KEY (user_id, course_id, role));
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,                -- SHA-256 of the cookie token; the token itself is never stored
  user_id TEXT NOT NULL REFERENCES users(id), csrf_hash TEXT NOT NULL,
  created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL, idle_seconds INTEGER NOT NULL, expires_at TEXT NOT NULL,
  revoked_at TEXT);
CREATE TABLE course_settings (course_id TEXT, key TEXT, value TEXT NOT NULL, updated_by TEXT, updated_at TEXT,
  PRIMARY KEY (course_id, key));             -- e.g. department_label (unverified → empty), link allow-list
CREATE TABLE milestone_deadlines (course_id TEXT, week INTEGER CHECK (week BETWEEN 1 AND 14), due_at TEXT,
  updated_by TEXT, updated_at TEXT, PRIMARY KEY (course_id, week));

CREATE TABLE teams (
  id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id),
  label TEXT NOT NULL,                        -- "Team 07" (= ProjectDoc.team.label)
  max_members INTEGER NOT NULL DEFAULT 5, status TEXT NOT NULL CHECK (status IN ('active','archived')),
  created_by TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE (course_id, label));
CREATE TABLE team_memberships (
  team_id TEXT NOT NULL REFERENCES teams(id), user_id TEXT NOT NULL REFERENCES users(id),
  joined_at TEXT NOT NULL, added_by TEXT NOT NULL, left_at TEXT, removed_by TEXT,
  PRIMARY KEY (team_id, user_id, joined_at));
CREATE UNIQUE INDEX one_active_team_per_student ON team_memberships(user_id) WHERE left_at IS NULL;
CREATE TABLE team_invites (code_hash TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id),
  created_by TEXT NOT NULL, expires_at TEXT NOT NULL, max_uses INTEGER NOT NULL DEFAULT 5, uses INTEGER NOT NULL DEFAULT 0);
```

Membership history is kept: leaving sets `left_at`, and the row is never deleted. When membership changes, the server
writes a `system` change set that updates `ProjectDoc.team.members` (`types.ts:108-113`), where `Member.active=false`
means the person has left. The existing projections and the Week 1 lab tool then keep working, and the history shows
who was on the team when.

## 4. Progress and practice (per student, separate from the project)

```sql
CREATE TABLE progress (
  user_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL,
  item_id TEXT NOT NULL,                      -- stable content ID, e.g. 'w01.learn.boundaries' (content doc §3)
  revision_id TEXT,                           -- the published revision the student read
  state TEXT NOT NULL CHECK (state IN ('opened','read','checked')),
  data TEXT, updated_at TEXT NOT NULL, PRIMARY KEY (user_id, item_id));
CREATE TABLE assessment_attempts (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  item_id TEXT NOT NULL, item_revision_id TEXT NOT NULL,   -- versioned (content doc §11)
  response TEXT NOT NULL, outcome TEXT,       -- formative: 'correct'|'incorrect'|NULL; never a grade in v1
  at TEXT NOT NULL);
CREATE TABLE practice_state (                 -- Guided Practice (AeroLink); never read by project code
  user_id TEXT NOT NULL REFERENCES users(id), scope TEXT NOT NULL,   -- e.g. 'w01.practice'
  state TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (user_id, scope));
```

- **Practice reset** deletes the `practice_state` row, with an audit entry. Project code has no repository access to
  this table. The rule extends today's `src/project/isolation.test.ts`, which enforces that `copyFromPractice.ts` is the
  only project module that reads AeroLink data.
- **The practice → project template copy** stays explicit and confirmed (directive §11). It still runs client-side
  through `src/project/practice/copyFromPractice.ts`, which emits `create-artifact` operations with
  `provenance.kind='copied-from-practice'`. The server sees ordinary operations and stamps them `source='practice-copy'`.
- localStorage keys today: `mission-progress`, `wb-artefacts`, `workspace-model`, `quiz`, `completed`. These map to
  `practice_state` and `progress` only through the voluntary migration step in §7. They are never uploaded
  automatically.

## 5. Projects, approvals, submissions, feedback

### 5.1 Projects

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,                        -- = ProjectDoc.project.uid (kept from the browser when imported)
  team_id TEXT NOT NULL UNIQUE REFERENCES teams(id),   -- one project per team, all 14 weeks (directive §12)
  course_id TEXT NOT NULL,
  doc TEXT NOT NULL,                          -- canonical ProjectDoc (types.ts:199-211), schemaVersion 1
  doc_rev INTEGER NOT NULL,                   -- = doc.rev (increments per change set)
  version INTEGER NOT NULL,                   -- SERVER concurrency token: +1 on every accepted write (§6.1)
  schema_version INTEGER NOT NULL,
  created_at TEXT NOT NULL, created_by TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL);
CREATE TABLE project_changes (                -- the existing ChangeSet, server-stamped
  project_id TEXT NOT NULL REFERENCES projects(id),
  seq INTEGER NOT NULL,                       -- server order
  chg_id TEXT NOT NULL,                       -- 'CHG-000123' (issued by the server, §6.2)
  actor_user_id TEXT,                         -- NULL only for migrated history (self-declared 'by' kept in ops/by)
  by_initials TEXT NOT NULL, at TEXT NOT NULL,
  source TEXT NOT NULL,                       -- ChangeSource (types.ts:230) + server adds nothing new
  summary TEXT NOT NULL, rationale TEXT, ops TEXT NOT NULL, rev INTEGER NOT NULL, version INTEGER NOT NULL,
  client_change_id TEXT,                      -- idempotency key from the client (§6.3)
  PRIMARY KEY (project_id, seq), UNIQUE (project_id, chg_id), UNIQUE (project_id, client_change_id));
CREATE TABLE project_snapshots (              -- the existing Snapshot (types.ts:243)
  project_id TEXT NOT NULL REFERENCES projects(id), snp_id TEXT NOT NULL,
  kind TEXT NOT NULL,                         -- manual|milestone|pre-import|pre-restore|pre-migration|auto|submission|proposal
  label TEXT NOT NULL, rev INTEGER NOT NULL, at TEXT NOT NULL, created_by TEXT NOT NULL, doc TEXT NOT NULL,
  PRIMARY KEY (project_id, snp_id));
```

- **Additive type changes** (schema stays v1, the same discipline as the P1 additions noted in `types.ts:5-11`):
  - `ChangeSet.actor?: { userId: string; name: string }`;
  - `SnapshotKind` gains `'submission'` and `'proposal'`.

  The existing importer ignores unknown keys (`importProject.ts` normalisers), so older app builds still read exports.
- **Snapshot retention** reuses `store/revisions.ts` (`prunable`). `submission` and `proposal` snapshots are never
  pruned.
- **Storage choice.** Storing the whole document as one JSON value is deliberate. Today's projects are small: one
  team, roughly hundreds of artifacts by Week 14. Every pure function works on the whole document, and
  `validateProject` runs on it. Normalising artifacts into rows is a reversible later optimisation for PostgreSQL
  (backend doc §5) and is not needed for correctness.

### 5.2 Enterprise approval (instructor action; directive §12, §19 C)

```sql
CREATE TABLE approval_requests (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL CHECK (kind IN ('enterprise-proposal')),
  state TEXT NOT NULL CHECK (state IN ('pending','approved','revision-requested','withdrawn')),
  requested_by TEXT NOT NULL, requested_at TEXT NOT NULL,
  proposal_snapshot TEXT NOT NULL,            -- snp_id of a 'proposal' snapshot frozen at request time
  decided_by TEXT, decided_at TEXT, decision_comment TEXT,
  supersedes TEXT REFERENCES approval_requests(id));
```

- A member requests approval. The server freezes a `proposal` snapshot: ENT-001, MGO-*, team and charter at that
  moment.
- The instructor decides against **that snapshot**, not against a moving target, choosing `approved` or
  `revision-requested` with a comment.
- The server then writes a `system` change set (`source='review'`, actor = instructor) that sets
  `Milestone.approval = {decision: 'approved'|'revise', decidedOn}` and ENT-001 `attributes.approval`. The existing
  readers then work unchanged: `adapters/week1.ts:148-157`, `week1Status.ts` and the Week 1 readiness checks.
- Students cannot write those two paths (`SECURITY_ARCHITECTURE.md` §5.3).
- A resubmission creates a new request with `supersedes`. The current state is the latest non-withdrawn request.
- This replaces today's self-declared select (`workbench/week1/TeamView.tsx:347-355`, audit H4).

### 5.3 Submissions (immutable snapshot plus content references; directive §16)

```sql
CREATE TABLE submissions (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), team_id TEXT NOT NULL,
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 14),
  state TEXT NOT NULL CHECK (state IN ('submitted','approved','returned')),
  submitted_by TEXT NOT NULL, submitted_at TEXT NOT NULL,
  project_rev INTEGER NOT NULL, project_version INTEGER NOT NULL,
  snapshot TEXT NOT NULL,                     -- full ProjectDoc at submission (also stored as a 'submission' snapshot)
  snapshot_sha256 TEXT NOT NULL,              -- canonicalJson + SHA-256 (transfer/exportProject.ts:17-32)
  content_refs TEXT NOT NULL,                 -- [{itemId, revisionId}] lab instructions, rubric, assessment items in force
  validation_report TEXT NOT NULL,            -- automated checks at submission time (never a grade)
  supersedes TEXT REFERENCES submissions(id),
  decided_by TEXT, decided_at TEXT);
CREATE TRIGGER submissions_immutable BEFORE UPDATE OF snapshot, snapshot_sha256, content_refs, project_rev ON submissions
  BEGIN SELECT RAISE(ABORT, 'submission snapshot is immutable'); END;
CREATE TABLE feedback (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), submission_id TEXT REFERENCES submissions(id),
  artifact_uid TEXT,                          -- optional anchor: an Artifact.uid inside the referenced snapshot
  author_id TEXT NOT NULL,                    -- instructor
  body TEXT NOT NULL,                         -- plain text with the two-token inline markup
  created_at TEXT NOT NULL, edited_at TEXT, visible_to_team INTEGER NOT NULL DEFAULT 1);
```

- **The directive's state names, and where each lives:**

  | Directive state | Where it lives |
  |---|---|
  | DRAFT, READY FOR REVIEW | The team's own working state: `Milestone.state` and `notes` in the project document, set by students |
  | SUBMITTED | A `submissions` row (`state='submitted'`) |
  | APPROVED, RETURNED FOR REVISION | Set only by an instructor |

  A return keeps the row. The team edits the live project and submits again (`supersedes`).
- **Automated validation is stored as a report and is never a grade** (directive §16).
- **Interaction with LMS upload (F1, open):** submission can be in-app only, LMS only, or both. The default for the
  demo is both. The in-app snapshot is the evidence, and the LMS stays authoritative for grades.

## 6. Optimistic concurrency and conflicts

### 6.1 Why a separate server `version` is needed (finding from the code)

`ProjectStore.apply` **coalesces** keystroke edits into the previous change set and keeps `next.rev = doc.rev`
(`src/project/store/ProjectStore.ts`, the coalescing branch of `apply`). References to `ProjectStore.ts` in this document
are by symbol, not line: at 13:18 on 2026-10-21 a parallel session was editing that file (it adds `lockGraceMs` and a new
`store/lock.test.tsx`, apparently for the read-only reload defect), and the coalescing branch was still present after
that edit. The IndexedDB adapter then saves with a rev check
(`store/indexedDb.ts:75-93`). That is safe for one writer. With two writers it causes lost updates:

1. A coalesces at rev 5 and saves with stored rev 5.
2. B, who also last saw rev 5, saves and gets past a rev-only check.
3. B overwrites A's coalesced edits.

The server therefore keeps `projects.version`, which increases on **every** accepted write, and uses it as the
concurrency token (`ETag` / `baseVersion`). In HTTP mode, client-side coalescing is switched off, for the same reason
`locks` is already switched off for non-IndexedDB adapters (the `locks` default in the `ProjectStore` constructor: `adapter.kind === 'indexeddb'`). The 600 ms autosave debounce still
batches typing. Log readability comes from optional server-side coalescing (M8): consecutive changes by the same
author, to the same paths, within 60 s, are merged only while they are the latest rows.

### 6.2 Write protocol (server-authoritative operations)

- **Request:** `POST /api/v1/projects/:id/changes` with
  `{ baseVersion, changes: [{ clientChangeId, source, summary, rationale?, ops: Operation[] }] }`.
- **Server, in one SQLite transaction:**
  1. Authorize (member, active team) and enforce size limits (`SECURITY_ARCHITECTURE.md` §7).
  2. If `projects.version != baseVersion`, return `409 {code:'conflict', version, changesSince}` (§6.3).
  3. For each change, in order:
     - deny forbidden paths (`SECURITY_ARCHITECTURE.md` §5.3);
     - normalise every operation's payload as untrusted, reusing the `normArtifact` / `normRelationship` logic in
       `transfer/importProject.ts`;
     - issue `chg_id` from `doc.issued.CHG + 1`;
     - stamp with the user's initials, `actorUserId` and server time;
     - run `commitOps(doc, ops, ctx, summary)` (`model/commit.ts:26`). It derives side-effect operations (suspect
       links, review flags from `model/impact.ts`), checks every operation with `checkOp`, and either applies all or
       refuses all. **One refused operation refuses the whole request** with `422 {code:'integrity', message}`.
  4. Write the new `doc`, `doc_rev`, `version+1`, the change rows and the audit entry for sensitive sources.
- **Response:** `{ version, doc, changes }`: the authoritative document plus the stamped change sets.
- **Client contract change:** `StorageAdapter.saveProject` returns
  `Promise<void | { doc: ProjectDoc; changes: ChangeSet[]; version: number }>`, and `ProjectStore.write` adopts the
  returned document when present. IndexedDB and memory return `void`, as today. Every other store behaviour stays:
  snapshots, undo by inverse operations, import plans and the restore-as-new-revision rule.
- **Idempotency:** `clientChangeId` is unique per project. A retry after a network timeout gets the original result
  instead of a duplicate change.

### 6.3 Conflicts: what the student sees

On a `409` the client holds its unsent change sets (the outbox, §6.4) and runs an **automatic rebase**:

1. Fetch the changes since `baseVersion`.
2. Compute the touched set of the remote changes and of the local ones, as `(uid, field path)`, plus artifact
   create, retire and renumber.
3. **Disjoint:** the local operations are recomputed against the new document and resubmitted, from the
   `diffTeamRecord` output (`adapters/week1.ts`) or from the original builder. The before-values come from the new
   document, so `invertOps` stays correct. The student sees only a brief note in the save status: "Saved. Merged with
   a teammate's changes (2 items)".
4. **Overlapping field, or a referenced artifact retired or renumbered remotely:** the save status becomes
   **"Conflict requires review"**, one of the directive §15 states. A panel then lists each conflict:

   | Element | Content |
   |---|---|
   | Header | Artifact ID and field, e.g. "STK-004 · Interests" |
   | Left | "Your unsaved text" |
   | Right | "Saved by J.S. at 14:02" |
   | Actions | **Keep mine**: resubmits with before = their value, so the replacement is recorded. **Keep theirs**: drops the local operation. **Keep both**: for text, appends theirs to mine for editing; for created artifacts, renumbers mine via `nextId` |

   Nothing is silently overwritten, and the student's text stays visible and copyable until resolved.
5. An integrity refusal (`422`) reports the existing `checkOp` message, for example "STK-004 is already used in this
   project (I1)." The pending change stays in the outbox for the student to fix.

Remote updates arrive by **polling**, not live editing:

- The client checks `GET projects/:id` with `If-None-Match: <version>` every 15 s while visible, and on focus.
- With nothing pending, a newer version is applied immediately and a quiet notice appears ("Updated with J.S.'s
  changes"). With changes pending, the update waits for the next save's rebase.
- UI wording: "Shared team project, saved on the course server. Teammates' changes appear within about 15 seconds."
  The words "live" and "real-time" are never used (directive §6.5: no fake collaboration).

### 6.4 Interrupted saves (offline outbox)

- Unsent change sets persist in IndexedDB under a new `outbox` store, keyed by `[projectId, clientChangeId]`, in the
  existing database `sysml-studio-projects` (version bump 1 → 2 with an additive upgrade in `openDb`,
  `store/indexedDb.ts:26-40`).
- On reload, the store offers: "You have N unsaved changes from <time>. Save them now / Review / Discard (Export
  first)". Discard requires confirmation.
- This covers a closed tab, a crash, a network drop and an expired session (`SECURITY_ARCHITECTURE.md` §4.2).
- Save states map to the directive's labels:

  | Directive label | Condition |
  |---|---|
  | Saving | request in flight |
  | Saved | the server confirmed `version` |
  | Unsaved changes | outbox not empty |
  | Save failed | network or `5xx` after retry; Export is offered |
  | Conflict requires review | §6.3 |

## 7. Migration from browser storage to the server

Principle: **non-destructive and student-initiated. Nothing in a browser is ever uploaded automatically.** Browser
data is left in place after import, and the student may delete it later through an explicit action.

| Source | Path to the server | Rule |
|---|---|---|
| IndexedDB `sysml-studio-projects` project (P1 My Project) | "Import Project", in two ways: (a) **direct**, where the server-mode app reads the local IndexedDB project only after the student clicks "Bring my browser project to the team server", then shows the import plan; or (b) **file**, by uploading a `sysml-studio-project` v1 export | Runs the existing pipeline (`transfer/importProject.ts`: parse, identify, normalise, integrity, checksum, plan) **on the server**. The team has no project yet: create from the file with a `pre-import` snapshot. The team already has one: the existing merge plan (`pages/ImportFlow.tsx`) with per-item choices, applied as one `import` change set. The project UID is kept unless it collides |
| Teammates each holding their own browser copy | First member imports to create; the others **merge** with the plan | Conflicts are classified by the existing plan classes (new, identical, changed-theirs, conflict, id-collision, broken) and chosen per item. Never a silent last-writer-wins |
| `week1-model-inputs` v1–3 files, legacy `wb-artefacts['w1.team']` | Same pipeline (`analyzeImport` already accepts it, `importProject.ts:85-92`) | As today |
| Weeks 2–6 localStorage (`w2.record` … `w6.record`) | **Not migrated in M2.** They become importable when the P2 week adapters exist (`PROJECT_WORKSPACE_ARCHITECTURE.md` §7); until then students keep exporting week files (roadmap F5) | Stated in `KNOWN_LIMITATIONS.md` |
| `w8.import` | Not migrated; the Week 8 tool will read the server project (P3) | |
| Practice and progress keys (`mission-progress`, `wb-artefacts` practice part, `quiz`, `completed`) | Optional "Bring my practice progress", which maps to `practice_state` and `progress` | Low value; may be dropped |

**Never auto-migrated, and never migrated as authority:**

- **Self-declared approval.** ENT-001 `attributes.approval` and `Milestone.approval` arrive as `pending`. The original
  value is kept in the import change set's rationale ("self-declared 'approved' on 2026-10-25; requires instructor
  decision").
- **Self-declared editor initials** in history stay as recorded. They are shown as "recorded by (self-declared)" with
  `actor_user_id = NULL`, and are never relabelled as authenticated.
- **`Team.members` typed initials.** These are replaced by the server projection of real memberships. The typed list is
  kept in the import rationale.
- **`Milestone.exports[]`, `markedSubmittedAt`.** Kept as historical notes, never converted into `submissions` rows.
- **Faculty reviews in localStorage (`reviews`) and the `instructor` flag.** Never sent.
- **Unadapted AeroLink copies.** Imported with their provenance flag. They stay excluded from submissions, exactly as
  today (`pages/actions.ts:17,36`).

Every import writes an `import_records` row (§10). An export file can always be imported back into the offline edition
(D0), so the migration is reversible.

## 8. Content revisions (detail in `CONTENT_PUBLISHING_DESIGN.md`)

```sql
CREATE TABLE content_items (id TEXT PRIMARY KEY, kind TEXT NOT NULL, week INTEGER, parent_id TEXT,
  created_at TEXT NOT NULL, created_by TEXT NOT NULL, retired_at TEXT);
CREATE TABLE content_revisions (
  id TEXT PRIMARY KEY, item_id TEXT NOT NULL REFERENCES content_items(id), seq INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft','ready-for-review','published','superseded','archived')),
  body TEXT NOT NULL, body_sha256 TEXT NOT NULL, base_revision_id TEXT, restored_from TEXT,
  author_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  submitted_at TEXT, submitted_by TEXT, published_at TEXT, published_by TEXT, release_id TEXT,
  superseded_at TEXT, archived_at TEXT, archived_by TEXT, change_note TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL, UNIQUE (item_id, seq));
CREATE UNIQUE INDEX one_open_draft ON content_revisions(item_id) WHERE state IN ('draft','ready-for-review');
CREATE UNIQUE INDEX one_published ON content_revisions(item_id) WHERE state = 'published';
CREATE TABLE content_releases (id TEXT PRIMARY KEY, published_at TEXT NOT NULL, published_by TEXT NOT NULL, note TEXT NOT NULL);
CREATE TABLE content_release_items (release_id TEXT REFERENCES content_releases(id), item_id TEXT, revision_id TEXT,
  PRIMARY KEY (release_id, item_id));
CREATE TABLE faculty_content_revisions (      -- FACULTY store: never joined by student queries
  id TEXT PRIMARY KEY, item_id TEXT NOT NULL, content_revision_id TEXT NOT NULL REFERENCES content_revisions(id),
  body TEXT NOT NULL, body_sha256 TEXT NOT NULL, author_id TEXT NOT NULL, updated_at TEXT NOT NULL);
```

Published and superseded revision bodies are immutable (`BEFORE UPDATE OF body` trigger when `state <> 'draft'`).

## 9. Audit log

```sql
CREATE TABLE audit_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL,
  actor_user_id TEXT, actor_role TEXT, action TEXT NOT NULL,   -- e.g. 'auth.login.fail', 'content.publish', 'approval.decide'
  target_type TEXT, target_id TEXT, outcome TEXT NOT NULL CHECK (outcome IN ('ok','denied','error')),
  detail TEXT,                                -- JSON; never passwords, tokens, file contents or content bodies
  prev_hash TEXT, hash TEXT);                 -- optional tamper-evidence chain (SECURITY_ARCHITECTURE.md §11)
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT, 'append-only'); END;
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT, 'append-only'); END;
```

## 10. Import provenance (Excel and files; directive §13 step 15)

```sql
CREATE TABLE import_records (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), user_id TEXT NOT NULL,
  at TEXT NOT NULL, format TEXT NOT NULL,     -- 'xlsx' | 'sysml-studio-project' | 'week1-model-inputs' | 'browser-indexeddb'
  file_name TEXT, file_sha256 TEXT, file_size INTEGER, sheet TEXT,
  mapping TEXT,                               -- [{column, header, field, confidence, correctedByStudent}]
  rows_read INTEGER, rows_imported INTEGER, duplicates TEXT, warnings TEXT,
  created_ids TEXT NOT NULL,                  -- course IDs created/updated, e.g. ["STK-007","STK-008"]
  chg_id TEXT NOT NULL,                       -- the single 'import' change set (one transaction)
  pre_import_snapshot TEXT NOT NULL,
  raw_file_retained INTEGER NOT NULL DEFAULT 0);   -- FD-S11 default: not retained
```

Each imported artifact also carries the existing `Provenance` variant (`types.ts:45`):
`{ kind: 'imported', from: { format: 'xlsx', version: 1, file, sha256 }, at }`. The source row number goes in
`attributes.importRow`, so a student can trace STK-007 back to "Stakeholders!row 12". Rollback is the existing restore
of the `pre-import` snapshot as a new revision (`ProjectStore.restore`).

## 11. Week 1 → Week 2 → Week 8 continuity

No new continuity mechanism is needed. The design keeps the existing one intact on the server.

| Need | Field(s) that carry it | Rule |
|---|---|---|
| One project for 14 weeks | `projects.team_id UNIQUE`; `ProjectDoc.project.uid` | Never a project per week |
| Stable IDs across weeks | `Artifact.uid` (hidden), `Artifact.id` (course ID), `doc.issued` counters (`model/ids.ts`), `formerIds` | Never regenerated on edit. Retired IDs are never reused (I3). The server issues CHG numbers, not course IDs: course IDs are created in operations by the client from `nextId` and checked by `checkOp` I1–I3, so a collision becomes a `409` or `422` and a rebase renumbers |
| What belongs to which week | `Artifact.milestones: number[]`; `Milestone[14]` (`types.ts:142-153`); `ExpectedArtifact` from the lab briefs (`model/milestones.ts`) | Week 2 adds CONOPS, SCN, REQ-STK… to the same document; Week 1 items keep their IDs |
| Typed links that survive | `Relationship` with `from`/`to` = UIDs (`types.ts:85-105`) | Week 2 REQ-STK `derives-from` NEED-004 links by UID; Week 8 reads the same graph |
| Change impact | `ReviewState`, `impact.ts` suspect flags | Run server-side inside `commitOps` |
| Week 8 transformation | `modelElements`, `mappings` (`MappingStatus`, `sourceRevision`; M7 additive, optional: `pkg` = the package the team chose, `source` = `{id, title, projectRev}` of the Week 1 item when confirmed), `findings` in the same document | `sourceFromProject` (`adapters/week8.ts:16`) reads the server document directly. M7: the Week 8 lab tool reads the project too (`week8SourceFromProject`, explicit source choice) and writes one `upsert-mapping` per confirmed Week 1 ID through the normal change endpoint (`project.write`, `authorize()`); `normMapping` allow-lists the two new fields. MAP IDs are never renumbered; a later change, rename or removal of the Week 1 item is reported, never dropped (`learning-studio/docs/week1/M7_REPORT.md`) |
| What each submission saw | `submissions.snapshot`, `project_rev`, `content_refs` | Week 8 can show "approved Week 1 baseline (submission S-…)" next to the live project |
| Phase I package (Week 7) | `scope: 'phase1-package'` export variant (data model §10.1) | Generated from a `submission` snapshot |

## 12. Schema migrations

- `schema_migrations(version, applied_at)` holds numbered SQL migrations, applied in a transaction at startup after an
  automatic pre-migration backup (`SECURITY_ARCHITECTURE.md` §12).
- `ProjectDoc` schema upgrades remain **pure functions** (`migrateV1toV2` …, `PROJECT_WORKSPACE_ARCHITECTURE.md` §5.5).
  They run per project server-side, each after a `pre-migration` snapshot. A destructive migration of project data
  requires faculty approval (directive §23).
