# M2 backend report: the local course server

Date: 2026-10-21. Milestone 2 (Reliable Data Foundation) of the Week 1 reconstruction, DECISION_LOG A23/A24.
Controlling designs: `SECURITY_ARCHITECTURE.md`, `PROJECT_DATA_SCHEMA.md`, `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md`
(repository root). Status: **built and tested in the working tree; not committed.**

## 1. What is real and what is not

| Real (built, tested) | Not built / simulated |
|---|---|
| `node:http` + `node:sqlite` + `node:crypto` server, zero new dependencies | Production bundle (`server:build`) and served SPA (`build:served`): the server runs through Vite's SSR loader |
| Accounts with scrypt hashes (N=2^17, r=8, p=1), server-side sessions (token stored as SHA-256), HttpOnly SameSite=Strict cookie | Institutional SSO (identity port only), email, password reset by email, roster CSV import |
| CSRF: SameSite + synchronizer token (`X-SLS-CSRF`) + Origin/Referer check; JSON-only mutations; Host allow-list | TLS (D1 is loopback HTTP; `Secure` cookie only with `SLS_COOKIE_SECURE=true` / institutional mode) |
| Idle and absolute expiry, rotation on sign-in and password change, logout, temporary-password gate | Rotation on role/membership change (authorization is re-read from the database on every request instead) |
| Rate limits and lockout (pair delay/lock, IP limit, account lock with admin unlock, per-session limit) | A shared limiter store for several processes (D2) |
| Roles admin / instructor / student, one `authorize()` choke point, 404 for hidden resources, instructors read-only on projects | TA role (FD-S7) |
| Teams: instructor creation and assignment, join codes (hashed, expiring, use-limited), membership history, member list projected into the project | Student-formed teams (FD-S3 default) — only instructor-assigned + join code in M2 |
| Server-held canonical projects: replay through `applyOps`/`checkOp`, server-owned fields, server stamps, version counter, 409 with changes since, idempotent retries, one transaction per write | Server-side change-set coalescing (M8), the per-field conflict panel; the outbox is in sessionStorage (per tab), not IndexedDB |
| Snapshots, restore as a new revision, export (`sysml-studio-project` v1, `edition: server`), import of an exported/Week 1 file into a team account | Merge-import with a per-item plan on the server (the browser's plan UI is still local-only) |
| Enterprise approval: request → frozen proposal snapshot → instructor approve / request revision with comment (+ faculty-only note in its own faculty table) → mirrored into the document; bound to the approved content (changed after approval → re-review with a diff) | Submissions, feedback, content publishing, progress (M3/M6) |
| Backups (online SQLite copy + per-project JSON + manifest), restore with integrity check, pre-migration and pre-restore copies | Scheduled daily backups and retention pruning |
| Frontend: HTTP adapter, mode selection, sign-in/account page, account indicator, approval panel, instructor review page, honest storage banners | Final styling (M4); conflict panel UI; "bring my browser project" button (students use Import) |

## 2. How to run

```
cd learning-studio
npm run server:seed        # once: demo instructor + 3 students + 2 teams; RANDOM passwords printed once
npm run server             # API on http://127.0.0.1:5174/api/v1 (data: %LOCALAPPDATA%\SysMLStudio\data)
npm run dev                # Vite on 5173; /api is proxied to 5174
# or both together:
npm run dev:all
```

Open `http://127.0.0.1:5173/#/signin`. Signed in, My Project uses the course server; signed out or with no server, My
Project stays in IndexedDB with the banner "Saved in this browser only". Signing in or out reloads the page (the store is
chosen once per page; browser data is never uploaded automatically).

The static student build (`npm run build:student`, `.env.student` has `VITE_BACKEND=none`) contains no server code path:
no `/api/v1` string, no CSRF header name (checked by grep on 2026-10-21), and `check-student-build.mjs` passes.

Configuration (`server/.env.example`, `server/config.ts`): `SLS_MODE` (`demo`|`test`|`institutional`), `SLS_DATA_DIR`,
`SLS_HOST`/`SLS_PORT`, `SLS_ORIGINS`, `SLS_COOKIE_SECURE`. Flags `--data-dir`, `--port`, `--host` override them.

**Deviation from the brief (written reason):** the brief suggested `learning-studio/.data/` as the default data
directory. `SECURITY_ARCHITECTURE.md` §10 requires the data directory to be outside the repository and outside synced
folders, and the server refuses such paths. The default is therefore `%LOCALAPPDATA%\SysMLStudio\data`; `.data/` is
gitignored as the second guard the design asks for.

## 3. Seeding, accounts, backup, restore

- **Seed** (`npm run server:seed`): only with `SLS_MODE=demo` (default) and an empty database. Creates `instructor.demo`,
  `student.a`, `student.b` (Demo Team 1), `student.c` (Demo Team 2), all `demo=1`, fictional names. Passwords are
  `crypto.randomBytes` base32, printed once, stored only as hashes. Never paste them into commits, reports or
  screenshots. Two teams (the brief said one) so cross-team isolation can be demonstrated.
- **First admin**: `npm run server:create-admin -- --login <l> --name "<n>" --initials XX` (admin + instructor,
  temporary password, change forced at first sign-in).
- **Accounts via the API**: an instructor creates student accounts (`POST /api/v1/users`), an admin any role; the
  temporary password is returned once and must be changed at first sign-in.
- **Backup** (`npm run server:backup`, server may run): `SLS_DATA_DIR/backups/sls-YYYYMMDD-HHMMSS/` with `sls.db`
  (node:sqlite `backup()`), `projects/<team>-<id>.json` (`sysml-studio-project` v1, importable by the offline edition)
  and `manifest.json` (SHA-256 per file, schema version).
- **Restore runbook**:
  1. Stop the server (`Ctrl+C`; the restore refuses while `server.pid` names a live process).
  2. `npm run server:restore -- <backup folder or .db file>`. It refuses the live database as its source and a folder
     without `manifest.json`; copies the source to a staging file and checks the manifest checksum, SQLite
     `integrity_check` and the migrations (on a throwaway copy, so a backup from a newer server is refused before
     anything changes); then keeps the current database as `backups/pre-restore-*.db`, replaces it, runs migrations,
     and reports `PRAGMA integrity_check` and `validateProject` for every project (exit code 2 on errors).
  3. Start the server. `npm run server:integrity` repeats the check at any time.
  The restore drill is automated (`server/test/storage.test.ts`).

## 4. Endpoints and authorization (`server/routes.ts`)

S = any student, M = active member of the owning team, I = instructor, A = admin. Hidden resources answer 404.
Every route except `health` and `auth/login` needs a session; every POST/DELETE needs JSON, an allowed Origin and the
CSRF header (login: Origin only).

| Endpoint (`/api/v1/…`) | S | M | I | A | Notes |
|---|---|---|---|---|---|
| `GET health` | public | | | | `{ok:true}` only |
| `POST auth/login` | public | | | | rate limits; rotation; generic 401 |
| `POST auth/logout`, `GET auth/session`, `POST auth/password` | own | own | own | own | reachable during the temporary-password gate |
| `GET users`, `POST users`, `POST users/:id/reset-password` | 404 | 404 | ✔ (students only for create/reset) | ✔ | no hashes or counters serialised |
| `POST users/:id/unlock`, `GET audit` | 404 | 404 | 404 | ✔ | |
| `GET teams` | own team | own team | all | own (none) | |
| `POST teams` | 404 | 404 | ✔ | 404 | |
| `POST teams/join` | ✔ (code) | | 403 | 403 | one answer for unknown/expired/used codes |
| `GET teams/:id` | 404 | ✔ | ✔ | 404 | |
| `POST teams/:id/members`, `DELETE teams/:id/members/:uid`, `POST teams/:id/invites` | 404 | 404 | ✔ | 404 | membership re-projected into the project |
| `POST teams/:id/project` (mode `doc` or `import`) | 404 | ✔ | 403 | 404 | one project per team; import pipeline on the server; approval reset |
| `GET projects/:id` (ETag / 304), `…/changes?since=`, `…/snapshots`, `…/snapshots/:snp`, `…/export` | 404 | ✔ | ✔ read | 404 | instructor exports are audit-logged |
| `POST projects/:id/changes` | 404 | ✔ | 403 | 404 | version check (409), replay + `checkOp` (422), server-owned fields |
| `POST projects/:id/snapshots`, `DELETE …/snapshots/:snp` | 404 | ✔ | 403 | 404 | proposal/submission versions cannot be deleted; a supplied doc is validated; milestone/pre-import requests are stored as `manual`; quota |
| `GET projects/:id/approval` | 404 | ✔ (student view) | ✔ (with private note, diff) | 404 | |
| `POST projects/:id/approval-requests` | 404 | ✔ | 403 | 404 | freezes a `proposal` snapshot; also allowed in `approved-changes-pending` |
| `GET approvals?state=`, `POST approvals/:id/decision` | 404 | 404 | ✔ | 404 | decision mirrored by a `review` change set; a re-review of a changed proposal must carry `currentHash` (409 if stale) |

Body limits: 256 KB default, 1 MB for changes and snapshots, 5 MB for project creation/import, 8–16 KB for small forms.
Errors are `{code, message}` only.

## 5. Data and concurrency rules worth knowing

- The project document is the existing `ProjectDoc` (schema v1), stored whole. Additive type changes: `ChangeSet.actor?`
  and `SnapshotKind` `'proposal' | 'submission'`; `StorageAdapter.kind` gains `'http'`, `saveProject` may return the
  authoritative document (`SaveResult`), optional `vetOps` / `poll`.
- Server-owned fields (`src/project/model/serverRules.ts`, shared by server and browser): enterprise approval (ENT
  `attributes.approval`, Milestone `approval`) is refused for members; `Team.members` edits are dropped (projected from
  memberships); project identity cannot change; created items get the server stamp.
- Member change sets (review M1, M2; `server/services/memberOps.ts`): the server recomputes every `before` value from
  the stored document, derives the side-effect operations itself (`deriveOps`) and appends those the browser did not
  send (a relationship or review target the browser already handled is not derived twice), applies everything through
  `applyOps`/`checkOp`, then runs `validateProject` on the result and refuses (422, with the problems) any write that
  adds an integrity error or a new I8 problem. This now follows `PROJECT_DATA_SCHEMA.md` §6.2 step 3; the earlier
  written deviation is withdrawn. Server-written change sets use `commitOps`.
- Enterprise approval is bound to the approved content (review H1; `server/services/approvalBinding.ts`,
  `src/project/model/approvalBinding.ts`). States: `pending` → `approved` | `revision-requested`; `approved` →
  `approved-changes-pending` on a material edit (and back to `approved` when the content is exactly the approved one
  again). The material field list is ONE constant, `APPROVAL_MATERIAL_FIELDS` (faculty to confirm, FD item below).
- `version` increases on every accepted write. A stale `baseVersion` is a 409 carrying the change sets since. The
  browser re-sends automatically when those changes touch other fields ("Saved. Merged with …"); on overlap the save
  status is "Conflict requires review" and nothing is overwritten. In HTTP mode coalescing is off.
- Save status: Saving… / Saved hh:mm (only after the server confirmed) / Unsaved changes / Save failed / Conflict
  requires review.
- Sessions: student 2 h idle / 12 h absolute; instructor and admin 30 min / 8 h.

## 6. Tests (run 2026-10-21, after the review fixes)

| Check | Result |
|---|---|
| `npx vitest run -c vitest.server.config.ts` | 10 files, **243 passed** (auth/sessions/CSRF/rate limit 22, authorization matrix 144, leak 3, projects 17, approvals 5, storage 8, browser store against the server 11, review fixes: integrity 8, approval binding 11, hardening 14) |
| `npx vitest run src/project` | 8 files, **63 passed** (adds the material-content model and the unload guard) |
| `npx playwright test -c playwright.server.config.ts` | 1 passed (two-session spec; run under `_source_cache/.playwright.lock` = `m2fix`, lock removed; no screenshots) |
| `npx tsc -b` | clean (whole project) at the final run |
| `npm run build:student` (tsc, `vite build --mode student`, `check-student-build.mjs`) | PASS; no `/api/v1`, CSRF header name or outbox key in `dist-student` |

Mutation checks, M2 build (each a temporary edit, restored): removing the team-membership condition in `authorize()`
fails 14 matrix tests; removing the version check fails the 409 test; adding the private note to the student view fails
the leak test; disabling overlap detection in the HTTP adapter fails the conflict test; removing the approval screen
fails 2 tests; removing the CSRF comparison fails the CSRF test.

Mutation checks, review fixes: **38 of 38 guards killed** (a scripted run removes one guard at a time, runs the
owning test file, restores the file byte for byte). Guards: server-side derivation, post-write validation, server
before values (M1, M2); approval transition, back-to-approved, decision-time binding, stale re-review hash, request in
the changed state, browser warning (H1); snapshot validation, server-only kinds, count/byte quota, per-version size
(M3); auth error kind, outbox stash, outbox recovery, unload guard (M4); note out of the student view, migration of
old notes (M5); per-session and per-account password-change limits, scrypt bound, sign-in priority, queue limit (M6);
safe uid, MAP/MEL ID rules, allow-list (L1); team label, course block (L2); malformed and duplicate cookies (L4);
generic lock text, timed lock (L5); idle sweep, limiter prune (L6); live-database guard, manifest required, migration
probe (L7).

## 6a. Review dispositions (`_source_cache/review/m2_backend_security_review.md`, verdict REVISE targeted)

| ID | Disposition | What changed | Evidence |
|---|---|---|---|
| H1 | **Fixed** (material list = faculty decision, default applied) | Approval stores the SHA-256 of the proposal snapshot's material content (`approval_requests.approved_hash`). A material edit after approval is accepted; in the same transaction the server moves the request to `approved-changes-pending` (history kept, `changed_at`), mirrors `changed-since-approval` into ENT-001/Milestone 1 (Week 1 readers then say "not approved") and audits it. Back to the exact approved content → `approved`. An approval given while the team kept editing lands in the changed state at once. The instructor review page lists "Approved, then changed" with a field diff against the approved snapshot and re-approves the current content (frozen as a new proposal snapshot, new request superseding the old) or requests a revision; the decision carries `currentHash` (409 if stale). The team may send a new request in that state. The browser asks "This changes your approved proposal; it will need instructor re-review" before the first material edit (cancel = nothing changes). The list is ONE constant: `APPROVAL_MATERIAL_FIELDS` (`src/project/model/approvalBinding.ts`). | `server/test/approvalBinding.test.ts` (11), `client.test.ts` H1 test, `src/project/model/approvalBinding.test.ts` (4) |
| M1 | **Fixed** | Server derives side effects (`deriveOps`) and appends what the client omitted (deduplicated), then validates the result: a new integrity error or new I8 problem → 422 with the issues. The written deviation from §6.2 step 3 is withdrawn. | `integrity.test.ts`: the reviewer's retire-without-suspect probe (regression), no double recording, re-activation of a link to a retired artifact refused |
| M2 | **Fixed** | Every `before` (fields, set-review, upsert) is recomputed from the stored document, walking the operations in order. | `integrity.test.ts` (forged before on project, artifact, review, repeated field; undo uses the real value) |
| M3 | **Fixed** | A supplied snapshot document goes through the import pipeline (shape, normalisation, integrity) and keeps the server-owned fields; `rev` from the server; `milestone`/`pre-import` from a browser are stored as `manual`, `proposal`/`submission` refused; per-project quota (`SNAPSHOT_QUOTA`: 200 versions, 50 MB, 1 MB each) prunes automatic/pre-restore versions first, then refuses (413); the list shows who stored each version (initials). | `hardening.test.ts` M3 (4) |
| M4 | **Fixed** | 401 is a distinct `auth` save failure (no retry with a dead session); unsaved change sets + client ids + base version + document go to a per-account, per-project outbox in the tab's sessionStorage; on open they are re-sent with the version check (merge or conflict); `beforeunload` warns while edits are unconfirmed (server mode, or a failed/conflicting save); a sign-in dialog in place (same account only) then saves without a reload. | `client.test.ts` M4 (3), `src/project/store/unloadGuard.test.tsx` |
| M5 | **Fixed** | Migration 2 rebuilds `approval_requests` without `private_note` and moves existing notes to `approval_faculty_notes` (faculty store), reachable only through `r.faculty.*(InstructorContext, …)`; only `instructorView` reads it. Leak crawl extended through every approval state and to error bodies. | `leak.test.ts` (3, extended), `hardening.test.ts` M5 (2) |
| M6 | **Fixed** | Password change: 5 attempts per session per 15 min, 10 wrong current passwords per account per hour (generic 429, audited). scrypt runs behind a semaphore (2 at once, sign-in before password change/admin work, queue of 64 then 503 "busy"). | `hardening.test.ts` M6 (4) |
| L1 | **Fixed** | Mappings/model elements normalised to allow-listed fields, safe uid (no `__proto__`/`constructor`…), `MAP-`/`MEL-` ID shape (no counter inflation), I1/I3 for new items, no renumbering by edit. | `integrity.test.ts` L1 (2) |
| L2 | **Fixed** | `team.label` and `project.course.*` member edits are stripped (not refused: the Week 1 tool writes them with the charter). | `integrity.test.ts` L2 |
| L3 | **Documented** (accepted for D1) | Instructor reset is audited and signs the student out; D2/SSO: admin-only or student-confirmed. | `KNOWN_LIMITATIONS.md` |
| L4 | **Fixed** | Malformed percent-encoding skips that cookie pair; two session cookies → 401. | `hardening.test.ts` L4 |
| L5 | **Fixed** | Locked account answers the generic "Too many attempts; try again in N minutes"; the account lock is timed (1 h), admin unlock still available. | `auth.test.ts` (2) |
| L6 | **Fixed** | `sweep()` at start and hourly: expired, idle-expired and revoked sessions deleted; rate-limiter maps pruned. | `hardening.test.ts` L6 |
| L7 | **Fixed** | Restore refuses the live database as source and a folder without a manifest; stages the copy, verifies checksum and integrity, runs migrations on a throwaway copy before anything is replaced. | `hardening.test.ts` L7 (2) |
| L8 | **Documented** (deviation kept) | Authorization is recomputed per request, so a membership change takes effect at once; rotation would add nothing. | `KNOWN_LIMITATIONS.md` |
| L9 | **Documented** (accepted) | Code, not data; no API path in the student build. | `KNOWN_LIMITATIONS.md` |

**Confirmation review** (`_source_cache/review/m2_backend_confirmation.md`: H1, M1–M6 and L-items verified; N1–N6 new):

| ID | Disposition | What changed | Evidence |
|---|---|---|---|
| N1 | **Fixed** | After replaying a member change set the server compares an order-independent approval fingerprint (decision on every ENT and on Milestone 1; missing = none) with the stored one and refuses any difference (422 with the approval message). Approval changes only through the instructor endpoints; a new enterprise starts with no decision. | `approvalBinding.test.ts` N1: the reviewer's exact sequence (project without ENT; create ENT-001 + "approve" it in one change set) → 422, nothing stored, no approval; nested path refused; plain creation allowed |
| N2 | **Fixed** | The per-account password-change lock applies only to sessions created before it started: a stolen session cannot lock the owner out of a password change from a fresh sign-in (which needs the password); the per-session limit still applies. | `hardening.test.ts` N2 |
| N3 | **Fixed** | Version labels: one line, letters/digits/space/common punctuation, at most 120 characters; a label that reads like a server label (approv*, submi*, milestone, instructor, graded, official) is stored as "Student-saved version: …"; the stored document's inner `rev` is the server's. | `hardening.test.ts` N3 |
| N4 | **Fixed** | Explicit sign-out removes the account's `sls-outbox:v1:<user>:*` entries from the tab; the account page asks first when there are any. (A refused different-account sign-in keeps the original account's outbox, so its owner can still sign in and save.) | `client.test.ts` N4 |
| N5 | **Fixed** | A partly received request (outbox replay after a lost response) continues after the received sets when they are its first ones and nothing was saved after them; any other mix is a 409 conflict (keep as version and reload), never the old 400 that failed forever. | `hardening.test.ts` N5 |
| N6 | **Documented** (info) | A member's own `set-review` for a target suppresses the derived flag for it; reachable legitimately via "Mark reviewed", so not a bypass. | `KNOWN_LIMITATIONS.md` |

Mutation check of the new guards: **6 of 6 killed** (N1 fingerprint, N2 fresh-session scope, N3 sanitising, N3 inner rev, N4 sign-out clearing, N5 resume). After the fixes: server tests 10 files **248 passed**; `src/project` 8 files 63 passed; `tsc -b` clean except the other agent's temporary `src/week1/learn/dump*.tmp.test.tsx` files.

**Needs a faculty decision (new FD item, default applied):** which proposal fields are material to an approval
(`APPROVAL_MATERIAL_FIELDS`: enterprise name, description, problem statement; mission and objectives; inside parts;
outside parts with kind, crossing and direction). Domain, suitability and system of interest are NOT material by default.

## 7. Limits and open items

- Faculty decisions still open: FD-B1 (adopt a local backend at all), FD-S4 (synthetic data only until the university
  review), FD-S1/FD-S3 (provisioning, team formation), and whether instructors may export student projects (logged now).
- The Week 1 lab tool keeps its self-declared approval select; in server mode a change to it is refused with a message.
  Removing or relabelling it belongs to M6.
- The conflict recovery keeps the student's unsaved edits as a History version; a per-field Keep mine / Keep theirs
  panel (`PROJECT_DATA_SCHEMA.md` §6.3) is still to build. The outbox (§6.4) exists in the tab's sessionStorage.
- `?poll=off` disables the 15-second poll (test switch, like `?storage=`).
- CSP is sent on API responses; whether the SPA works under it when served by this server is verified only when
  `build:served` exists.
- See `KNOWN_LIMITATIONS.md`, section "Course server backend (M2)".
