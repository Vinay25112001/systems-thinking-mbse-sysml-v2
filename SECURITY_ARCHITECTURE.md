# Security Architecture (M0, Week 1 reconstruction)

Status: **design, not built.** Written 2026-10-21 for Milestone 0 of the master implementation directive
(`docs/directives/2026-10-21_MASTER_IMPLEMENTATION_DIRECTIVE_WEEK1.md` §6, §7, §13, §15, §22; DECISION_LOG A23).
Companion documents: `CONTENT_PUBLISHING_DESIGN.md`, `PROJECT_DATA_SCHEMA.md`,
`docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md`. Code paths are relative to `learning-studio/` unless stated otherwise.

Ground truth today (audit 2026-10-21, `docs/audits/current-state-2026-10-21/APPLICATION_STATE_REPORT.md` §8, §11):

- The app is a static SPA. It makes no `fetch` call, has no server, no accounts and no cookies. All state lives in
  IndexedDB (`src/project/store/indexedDb.ts`) or prefixed localStorage (`src/lib/storage.ts`).
- "Instructor mode" is a localStorage boolean (`src/state/AppState.tsx:73`) that any viewer can tick, including in the
  student build. It is **not** authorization. The audit lists it as H3.
- The student edition removes faculty notes and exam banks **at build time**:
  - `student-edition.ts` strips `notes` and `purpose` by TS AST;
  - `src/instructor/index.ts` empties the exam glob;
  - `scripts/check-student-build.mjs` proves both, in both directions.

  The default build still carries every faculty note. The Week 1 quiz keys (`correct`, `explanation` in
  `src/content/quizWeek1.ts`) ship in both builds.
- No source file uses `innerHTML` or `dangerouslySetInnerHTML` (grep of `src/`, 2026-10-21). All text renders through
  React escaping. This property is worth keeping as a hard rule (§9).

Nothing below may be described to faculty or students as working until it is built and its tests pass (directive §24:
"never falsely claim secure accounts … when it is only simulated").

---

## 1. Deployment contexts

| Context | What it is | Data allowed | Network |
|---|---|---|---|
| **D0 Static edition** (GitHub Pages snapshot, `dist-student/`) | Today's app. Public, read-only course preview plus browser-only My Project | Course content only. Student work stays in the visitor's own browser | Public HTTPS (GitHub) |
| **D1 Local demonstration** | A Node server on the faculty laptop, plus the SPA from the same origin | **Synthetic accounts and data only** | Binds `127.0.0.1` only; plain HTTP on loopback |
| **D2 Institutional host** (future, not decided) | Same server on university-approved infrastructure | Real student records, only after the university data-protection review (§13) | TLS required; SSO preferred (§4.6) |

The code is the same in D1 and D2. The difference is configuration (`SLS_MODE=demo|institutional`, §10). D2 is designed
for but **not** deployed. Directive §6.6 forbids public deployment and cloud registration without approval.

---

## 2. Assets

| # | Asset | Why it matters | Store (`PROJECT_DATA_SCHEMA.md`) |
|---|---|---|---|
| A1 | Team project documents, change logs, snapshots | Student work for all 14 weeks; loss is the top risk (directive §15) | projects |
| A2 | Submissions, feedback, approvals, decisions | Education records once real students exist (FERPA, §13) | submissions |
| A3 | Credentials and sessions | Account takeover leads to every other asset | identity |
| A4 | Faculty-only material: notes, worked solutions, answer keys, unpublished drafts, exam banks | Academic integrity | faculty, content (drafts) |
| A5 | Published course content | Students must see exactly what the instructor published | content |
| A6 | Per-student progress, practice state, assessment attempts | Personal learning data, kept separate | progress |
| A7 | Audit log and backups | Accountability and recovery; backups hold A1–A6 | audit, backup files |

## 3. Trust boundaries

```
 [Browser: SPA bundle]  --(B1: HTTP on one origin; cookie + CSRF header)-->  [Node server: /api/v1]
        |                                                                         |
   untrusted input:                                                     (B2: repository interface)
   every request body,                                                            |
   XLSX/JSON files (B3)                                                  [SQLite file in SLS_DATA_DIR]
                                                                                  |
                                                                       (B4: backup files, OS account)
```

- **B1:** the SPA is untrusted. Hiding a button, the `IS_STUDENT_EDITION` flag or a role switch in the UI never grants
  or denies access. The server decides every protected operation (directive §6.2).
- **B2:** only the server's repository layer touches the database. No other process writes it.
- **B3:** uploaded files are hostile until parsed within limits (§8).
- **B4:** anyone with the OS account can read the data directory and its backups. That is acceptable for D1 with
  synthetic data. D2 needs host-level controls (§11).

## 4. Authentication

### 4.1 Password hashing (local accounts)

| Option | Native build? | Status in Node 24.18.0 (probed on this laptop 2026-10-21) | Verdict |
|---|---|---|---|
| `crypto.scrypt` (built-in) | No | Stable API. N=2^17, r=8, p=1 measured **423 ms** per hash | **Use now** |
| `crypto.argon2` (built-in) | No | Present (`typeof crypto.argon2 === 'function'`). argon2id with m=19 MiB, t=2, p=1 measured **40 ms**. From memory, not verified offline: added in v24.7.0 and marked Experimental | Planned upgrade, not v1 |
| `argon2` npm package | Native addon (prebuilds, node-gyp fallback) | Needs prebuilt binaries or a compiler. This corporate laptop has no admin rights and no compiler | Reject |
| `bcrypt` / `bcryptjs` | Native, or slow pure JS | bcrypt truncates input at 72 bytes | Reject |

Decision (reversible engineering choice):

- **scrypt with N=2^17, r=8, p=1, a 16-byte random salt and a 64-byte key.** These are the OWASP Password Storage Cheat
  Sheet minimum, stated from memory; verify before citing. `maxmem` must be set to at least 256 MiB, because Node's
  32 MiB default rejects N=2^17.
- The hash is stored as a self-describing string, `scrypt$v=1$N=131072,r=8,p=1$<salt b64>$<hash b64>`.
- Verification uses `crypto.timingSafeEqual`.
- The async `crypto.scrypt` runs on the libuv thread pool, so the event loop is not blocked.
- **Upgrade path:** when `crypto.argon2` is marked stable, a successful login rehashes with argon2id. The parameters
  are in the stored string, so no schema change is needed.
- An unknown user still runs one scrypt against a fixed dummy hash, so response time does not reveal which accounts
  exist.

Password policy:

- **D1:** at least 12 characters, no composition rules, rejected if it appears on a small bundled common-password list
  or contains the user's own name or email.
- **D2:** at least 15 characters. From memory, NIST SP 800-63B-4 requires 15 for single-factor passwords; verify the
  published text before citing. D2 should use SSO anyway (§4.6).
- No forced periodic rotation.

### 4.2 Sessions

- **Server-side sessions.** The cookie holds an opaque 256-bit random token (`crypto.randomBytes(32)`, base64url). The
  database stores only `SHA-256(token)`, so a leaked database or backup does not yield live sessions. No signing secret
  is needed, which means one fewer secret to manage.
- **Cookie, D1:** `sls_session=<token>; HttpOnly; SameSite=Strict; Path=/`. There is no `Secure` attribute, because D1
  is plain HTTP on loopback.
- **Cookie, D2:** `__Host-sls_session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/`.
- `SameSite=Strict` costs nothing here. The SPA is served from the same origin, and only same-origin `fetch` calls
  carry the cookie.
- **Expiry:**

  | Role | Idle timeout | Absolute lifetime |
  |---|---|---|
  | Student | 2 h | 12 h |
  | Instructor and admin | 30 min | 8 h |

  The values are configurable. `last_seen_at` is written at most once a minute per session to limit writes.
- **Rotation:** a new token is issued on login, on any role or membership change of the user, and on password change.
  A password change or admin reset revokes every other session of that user. Logout deletes the row and clears the
  cookie.
- **Expired session while editing:** the API returns `401 {code:'session-expired'}`. The SPA keeps the unsaved change
  sets in memory and in the offline outbox (`PROJECT_DATA_SCHEMA.md` §6.4), shows "Signed out: sign in to save your
  changes", and resubmits them after sign-in. The save status never says "Saved" (directive §15).

### 4.3 CSRF

Three layers protect every state-changing request (`POST`, `PUT`, `PATCH`, `DELETE`):

1. `SameSite=Strict` cookie.
2. **Synchronizer token.** `GET /api/v1/auth/session` returns a per-session `csrfToken`, and the server stores its
   hash. The SPA sends it as `X-SLS-CSRF` on every mutation. A missing or mismatched token gets `403 {code:'csrf'}`.
3. **Origin check.** `Origin`, or `Referer` when `Origin` is absent, must equal the configured origin:
   `http://127.0.0.1:5174` in D1, and `http://127.0.0.1:5173` when going through the Vite dev proxy.

In addition, mutations accept only `Content-Type: application/json`, or `multipart/form-data` on the single import
upload route. Form-encoded bodies, which a cross-site HTML form can send, are refused.

### 4.4 Rate limiting and lockout

The limiter is in-process, so it suits a single process. D2 with several processes needs a shared store, which is
noted as a D2 item.

| Key | Rule |
|---|---|
| (account, client IP) | After 5 failures, each further attempt is delayed exponentially (1 s, 2 s, 4 s … capped at 60 s). After 10 failures in 15 min, the pair is locked for 15 min |
| Account, across all IPs | After 50 failures per hour, the account requires an admin unlock. This stops spraying without letting one client lock out a classmate quickly |
| Client IP | At most 30 login attempts per minute |
| All authenticated routes | 600 requests per minute per session, then `429` |

Lockouts and unlocks go to the audit log. The UI shows "Too many attempts; try again in N minutes" and never says
whether the account exists.

### 4.5 Account lifecycle

- **Provisioning (recommended default; faculty decision FD-S1):**
  - the instructor or admin creates student accounts, singly or from a roster CSV of display name and email;
  - each new account gets a one-time temporary password, or in D2 an SSO identity;
  - `must_change_password` is set until the student changes it;
  - there is **no open self-registration**.
- **Disable, not delete:** a disabled user cannot sign in, and their history stays attributed. Deletion at end of term
  follows the retention decision (§13).
- **Password reset:** an admin or instructor issues a new temporary password, shown once. There is no email reset in
  D1, because the laptop has no mail service.

### 4.6 Identity interface (SSO-ready, not SSO)

Local passwords are one implementation of an identity port:

```ts
// server/identity/IdentityProvider.ts (design)
export type ExternalIdentity = { provider: string; subject: string; email?: string; displayName?: string }
export interface IdentityProvider {
  readonly id: string                         // 'local' | 'oidc:<issuer>' | 'saml:<entityId>'
  begin?(req: Request): Promise<Response>     // redirect-based providers (OIDC/SAML)
  complete(req: Request): Promise<ExternalIdentity>   // local: verifies username+password
}
```

- Users link to identities through `identities(provider, subject)` (`PROJECT_DATA_SCHEMA.md` §3).
- **Roles and team membership stay in the application database.** They are never trusted from the IdP, unless faculty
  and university IT approve a group mapping.
- Replacing local passwords with the university IdP (OIDC or SAML) therefore adds a provider and a login route. The
  rest of the system does not change.
- **No institutional SSO is claimed or built.** The university IdP's registration process, attribute release and
  approval are unknown.

### 4.7 Demo accounts (D1 only)

- **No credentials exist in the repository.** No seeded passwords, no `.env` with passwords, no fixtures with reusable
  logins.
- **`npm run server:seed-demo`** runs only when every one of these holds; otherwise it refuses with a message:
  - `SLS_MODE=demo`;
  - the database is empty, or is flagged `demo=1` in `server_meta`.

  It creates 1 instructor, 4 students and 2 teams with clearly fictional names. It generates each password with
  `crypto.randomBytes(15)` in base32, prints all of them **once** to the terminal, and stores only hashes. Every
  account carries `demo=1`.
- **`npm run server:create-admin`** creates the first admin and prints a random temporary password once, with
  `must_change_password=1`.
- **Startup guard:** in `SLS_MODE=institutional` the server refuses to start while any `demo=1` account exists.
- **Automated tests** never use demo accounts. They create throwaway accounts in a temporary database through a
  test-only fixture, which runs only with `SLS_MODE=test` and a temporary data directory, and is never reachable over
  HTTP (`docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md` §6).
- Printed passwords must never be pasted into commits, `PROJECT_STATUS.md`, test reports or screenshots. The
  Playwright specs take no screenshots of login forms with values.

## 5. Authorization

### 5.1 Model

- **Roles** (per course, in `user_roles`):
  - `student`;
  - `instructor`: content authoring and publishing, and review of all teams' work;
  - `admin`: users, backups, configuration and the audit log.

  One person may hold `admin` and `instructor` together, as the faculty owner will. A TA role is **not** built; it
  would be a reduced `instructor` (FD-S7).
- **Team membership** is active `team_memberships` rows. A student acts on a project only through an active membership
  of the team that owns it.
- **One choke point.** Every route declares its rule. A single `authorize(ctx, action, resource)` function evaluates
  it before the handler runs. The repository functions for faculty material take an `InstructorContext`, a type that
  only `authorize` can construct, so a student code path cannot call them by accident: it does not compile.
- **Hidden resources get `404`, not `403`.** A student asking for another team's project, submission or feedback
  receives `404 {code:'not-found'}`, so team IDs cannot be enumerated.
- **Mass-assignment guard.** Every write handler copies allow-listed fields into a fresh object. Request bodies are
  never spread into rows.

### 5.2 Resource-level matrix

S = student, M = student who is an active member of the owning team, I = instructor, A = admin. "own" = the caller's own
record. Every row requires an authenticated session except `health` and `auth/login`.

| Endpoint class (`/api/v1/…`) | S | M | I | A | Server-side check |
|---|---|---|---|---|---|
| `GET health` | public | | | | Returns `{ok:true}` only; no version or config |
| `POST auth/login`, `auth/logout`; `GET auth/session`; `POST auth/password` | own | own | own | own | Rate limits (§4.4); rotation (§4.2) |
| `GET content/release`, `content/weeks/:n`, `content/items/:id` (published only) | ✔ | ✔ | ✔ | ✔ | Built from the student-visible store only (§6). FD-S2 decides whether this is public in D2 |
| `GET content/items/:id/revisions/:rev` (historical student view) | only revisions referenced by own attempts or own team's submissions | same | ✔ | — | Reference check against `assessment_attempts` / `submissions.content_refs` |
| `authoring/*`: drafts, ready, return, compare, preview, publish (`releases`), restore, archive, reorder | ✘ | ✘ | ✔ | ✘ (unless also I) | Lifecycle rules (`CONTENT_PUBLISHING_DESIGN.md` §4); publish needs a confirmation token (§4.4 there) |
| `faculty/*`: notes, worked solutions, answer keys, rubric scoring notes, exam banks | ✘ | ✘ | ✔ | ✘ | Separate tables and repository (§6) |
| `POST assessments/items/:id/attempts`; `GET me/attempts` | own | own | read all | — | The key and feedback are returned only in the attempt response (§6.3) |
| `GET/PUT me/progress`; `GET/PUT/DELETE me/practice/:scope` | own | own | own; aggregate read only if FD-S6 allows | — | `user_id = session.user_id`, always taken from the session, never from the body |
| `POST teams` | ✔ if FD-S3 allows self-formed teams | | ✔ | | The creator becomes the first member; team-size cap |
| `POST teams/:id/invites`; `POST teams/join` | | ✔ (invite) / ✔ (join with code) | ✔ | | Code hashed, expiring, use-limited; join refused when the cap is reached or the student is already in a team |
| `DELETE teams/:id/members/:uid` | self-leave only | | ✔ | | The last member cannot leave a team that has a submission; the instructor handles it |
| `POST teams/:id/project` (create or import) | | ✔ | | | One project per team; import runs the shared plan pipeline (§8, schema doc §7) |
| `GET projects/:id`, `…/changes`, `…/snapshots`, `…/export` | | ✔ | ✔ (read) | | Membership or instructor |
| `POST projects/:id/changes`, `…/snapshots`, `…/restore`, `…/imports` | | ✔ | ✘ | ✘ | Version check; server-side replay of operations; forbidden paths (§5.3) |
| `POST projects/:id/approval-requests` | | ✔ | | | Freezes a proposal snapshot |
| `GET approvals`; `POST approvals/:id/decision` | | | ✔ | | Instructor only; the decision is mirrored into the project by a `system` change set (schema doc §5.2) |
| `POST projects/:id/submissions` | | ✔ | | | Immutable snapshot plus content references (schema doc §5.3) |
| `GET projects/:id/submissions`, `submissions/:id` | | ✔ | ✔ | | |
| `POST submissions/:id/decision`; `POST …/feedback` | | | ✔ | | The instructor cannot edit the snapshot or the project, only decide and comment |
| `GET course`; `PATCH course/settings` (deadlines, department label) | read | read | ✔ | ✔ | Audit-logged |
| `admin/users`, `admin/backups`, `admin/audit`, `admin/restore` | | | | ✔ | Destructive actions need typed confirmation and an audit entry |

Instructors **read** student projects but never write them. Feedback, decisions and approvals are separate records
(directive §6.3: "publishing must never overwrite student project data").

### 5.3 Server-owned fields inside the project document

The canonical document (`src/project/model/types.ts`) holds a few fields that a student must not be able to set,
because today they are self-declared (audit H4):

| Field | Today | Server rule |
|---|---|---|
| `Milestone.approval` (`types.ts:147`) | Student picks it in `workbench/week1/TeamView.tsx:347-355` | Rejected in student change sets. Written only by the server's `system` change set after an instructor decision |
| `ENT-001 attributes.approval` (`adapters/week1.ts:148-157`) | Same | Same; the Week 1 projection keeps reading it, so the existing lab tool works unchanged |
| `Stamp.by`, `ChangeSet.by`, `ChangeSet.at` | Self-declared initials and client clock | Overwritten by the server: the user's team initials plus `actorUserId`, and server time |
| `Team.members` | Initials typed in the charter (`adapters/week1.ts:133-141`) | Projected from `team_memberships` by the server; student edits to the list are rejected |
| `Milestone.exports[].contentState='ready'`, `markedSubmittedAt` | Student-set | Kept as the student's own notes. Authoritative submission state lives in `submissions` (schema doc §5.3) |

Enforcement happens on the server, which replays every submitted operation through the shared pure model:
`commitOps` (`src/project/model/commit.ts`), whose integrity checks `checkOp` (`model/integrity.ts`) refuse invalid
operations, plus a server-side path deny-list. Design in `PROJECT_DATA_SCHEMA.md` §6.

## 6. Faculty-only material: never sent to students

1. **Structural separation, not field filtering.**
   - Faculty fields live in their own tables (`faculty_content_revisions`, schema doc §8): lecture `notes` and
     `purpose` (`src/content/lectures/types.ts:43-73`), worked solutions, answer keys, rubric scoring notes and exam
     banks.
   - The student assembly function reads only student-visible tables, so no code path builds a mixed object and then
     deletes keys from it.
   - Instructor preview runs the **same** student assembly function (`CONTENT_PUBLISHING_DESIGN.md` §6), so preview
     equals the real student payload.
2. **The bundle carries no faculty data in served mode.** D1 and D2 serve a bundle built in `--mode student` style:
   - lecture notes are stripped by the existing `student-edition.ts`;
   - exam banks are globbed out (`src/instructor/index.ts`);
   - faculty content reaches instructors only through `/api/v1/faculty/*`.

   `check-student-build.mjs` keeps running on that bundle. Instructor **UI code**, such as the editor, may ship in the
   bundle: code is not secret, data is.
3. **Answer keys.**
   - Graded items: `correct`, explanations and worked solutions are stored server-side only.
   - `POST assessments/items/:id/attempts` returns the feedback for the submitted response, after it is recorded.
   - Whether Week 1's formative explanations count as "private answer keys" is FD-S8. The default treats them as
     private, which costs one API call per check.
4. **Drafts.** Unpublished revisions are readable only through `authoring/*` (instructor).
5. **Leak test (M3 gate),** the server-side analogue of `check-student-build.mjs`:
   - a Vitest suite seeds marker strings into every faculty field and into a draft;
   - it signs in as a student and crawls every `GET` route in the route table, with valid IDs from the seed;
   - it asserts no marker appears in any response;
   - it then proves the check can fail by finding every marker through the instructor routes.

## 7. Input validation

- **Body size limits,** enforced while streaming, before parsing:

  | Route | Limit |
  |---|---|
  | Default JSON | 256 KB |
  | `projects/:id/changes` | 1 MB |
  | Content drafts | 512 KB |
  | File import | 5 MB |

  A body over its limit gets `413`.
- **Schema validation at the boundary.** Hand-written normalizers in the existing style (`normArtifact` in
  `src/project/transfer/importProject.ts`): they never throw, report problems with paths and coerce nothing silently.
  Unknown fields are dropped. Strings get length caps (titles 300, statements 4,000, notes 20,000 characters) and are
  NFC-normalized, and control characters other than `\n` and `\t` are rejected.
- **IDs:** UUIDs are checked by regex, and course IDs by `ID_RE` (`src/project/model/ids.ts`). SQL always uses
  prepared statements with bound parameters; no string concatenation.
- **Content blocks** are validated against the block union (`CONTENT_PUBLISHING_DESIGN.md` §8). There is no raw HTML
  anywhere, and the inline markup is limited to `**bold**` and `*emphasis*`, which the existing renderer already
  enforces. URLs must be internal hash routes, or `https:` links on an allow-list held in course settings.
- **Errors:** the body is always `{code, message}` with a human-readable message. There are no stack traces, no SQL and
  no file paths. Raw status codes are never shown to students (directive §17).

## 8. Untrusted files: XLSX and JSON imports

Directive §13 requires a maintained, appropriately licensed `.xlsx` library. Library choice is an M6 decision, and the
choice needs a licence and CVE check at that time:

- **Avoid the npm `xlsx@0.18.5` package.** It is the last SheetJS release on the npm registry. From memory, it carries
  published prototype-pollution and ReDoS advisories, and newer SheetJS builds are distributed only from the vendor's
  CDN.
- **Candidates:** `read-excel-file` (MIT, read-only, small) and `exceljs` (MIT, larger). Both must be checked at M6
  for maintenance, licence and dependencies.

Rules, whichever library is chosen:

1. **Parse in the browser,** in a Web Worker, for the mapping and preview steps (§13 steps 1–12). The raw file never
   leaves the student's machine unless FD-S11 decides it should be retained. The server receives only the approved,
   mapped records plus provenance: file name, SHA-256, size, sheet, row numbers and the mapping. The server
   **re-validates** every record as untrusted input, exactly like any other change set.
2. **Resource limits,** checked before and during parsing:

   | Limit | Value |
   |---|---|
   | File size | 5 MB |
   | Total uncompressed size (ZIP-bomb guard, from the ZIP central directory) | 50 MB |
   | Sheets | 50 |
   | Rows read | 2,000 |
   | Columns | 50 |
   | Characters per cell | 4,000 |
   | Wall-clock time in the worker | 10 s, then the worker is terminated |

   Malformed files fail with a message and change nothing.
3. **No formula evaluation.** Only stored cell values are read. A cell holding a formula is flagged "formula: the
   cached value was used and needs checking", and the formula text is never executed. Macros (`.xlsm`) are refused by
   extension and by content type. External links are ignored.
4. **No silent import:** the mapping review, explicit approval and one transaction come from directive §13. The commit
   is one `import` change set, after a `pre-import` snapshot, through the existing store path
   (`ProjectStore.importMerge` in `src/project/store/ProjectStore.ts`).
5. **Formula injection on export.** Every CSV or XLSX the app writes (registers, reports) prefixes a `'` to any cell
   that begins with `=`, `+`, `-`, `@`, tab or carriage return, so the exported value cannot be read as a formula. A
   unit test covers each trigger character.
6. **JSON project files** keep the existing pipeline (`src/project/transfer/importProject.ts`). It never throws,
   recomputes validation, verifies the checksum and builds a plan. The pipeline runs **on the server** for
   server-mode imports (schema doc §7), with the same size limits.

## 9. Browser-side hardening (served SPA)

- **Response headers on every response:**
  - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`. Verify in M2 that Tailwind and React inline `style` props work under this policy. React sets styles through the CSSOM, which CSP does not block. If a figure needs `style-src-attr 'unsafe-inline'`, record that in `DECISION_LOG.md`.
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`, and `Cache-Control: no-store` on `/api`.
  - `Strict-Transport-Security` in D2 only.
- **Hard rule:** no `innerHTML`, `dangerouslySetInnerHTML`, `eval` or `new Function` in `src/` or `server/`. A lint or
  grep test fails the build if one appears.
- **Host header allow-list** (`127.0.0.1:<port>`, `localhost:<port>`) on the D1 server. This blocks DNS-rebinding
  attacks, where a malicious website points its hostname at 127.0.0.1 and drives the local API from the faculty
  browser.

## 10. Secrets and configuration

| Variable | Default | Notes |
|---|---|---|
| `SLS_MODE` | `demo` | `demo`, `test` or `institutional`; controls the seeding and startup guards (§4.7) |
| `SLS_DATA_DIR` | `%LOCALAPPDATA%\SysMLStudio\data` (Windows) | **Outside the repository and outside any OneDrive- or SharePoint-synced folder.** Syncing a live SQLite file corrupts it, and syncing student records to a cloud account is an external transfer (directive §23). The server refuses to start if the path contains `OneDrive` or lies inside the git worktree |
| `SLS_HOST` / `SLS_PORT` | `127.0.0.1` / `5174` | D1 refuses a non-loopback host unless `SLS_MODE=institutional` |
| `SLS_ORIGIN` | `http://127.0.0.1:5174` | CSRF Origin check (§4.3) |
| `SLS_COOKIE_SECURE` | `false` (D1) / forced `true` (D2) | |
| `SLS_DEPARTMENT_LABEL` | empty | Directive §8: the sponsoring department is not verified, so it stays configurable and is shown only when set |

- **There are no cryptographic secrets in v1:** sessions are opaque tokens and passwords are salted hashes. A future
  backup encryption key (D2) or OIDC client secret is supplied by the environment or a file outside the repository.
- `.env.local` is already git-ignored by `learning-studio/.gitignore` (`*.local`). The repository commits only
  `server/.env.example`, with no values.
- The data directory must never be inside `learning-studio/`. As a second guard, `.data/` is added to `.gitignore`.

## 11. Logging and audit trail

- **Operational log:** stdout, one JSON line per request with time, method, route **pattern** (not the full URL),
  status, duration and an anonymized user ID. It never contains bodies, passwords, tokens, cookies, CSRF tokens or file
  contents.
- **Audit log:** the `audit_log` table (schema doc §9), append-only for the application. There is no update or delete
  route, and the repository exposes only `append` and `list`. It records:
  - sign-in, failure, lockout and unlock;
  - role changes;
  - account create and disable;
  - team membership changes;
  - every publish, restore and archive;
  - approval decisions, submission decisions and feedback;
  - project restore and replace-import;
  - backup, restore, export by an instructor, and settings changes.

  Optional, in M8 at the earliest: each row stores `hash = SHA-256(prev_hash || canonical row)`, making it
  tamper-evident against casual edits. It does not stop an attacker with file access.
- **Project-level attribution:** server-stamped change sets (§5.3) replace self-declared initials. This supersedes
  roadmap decision F2 for server mode. In D0 offline mode, initials remain labelled "recorded by (self-declared)".

## 12. Backups and restore

- **Online snapshots** use `node:sqlite`'s `backup()` function. Its presence was confirmed in the 24.18.0 exports on
  2026-10-21. Output goes to `SLS_DATA_DIR/backups/sls-YYYYMMDD-HHMMSS.db`:
  - daily on the first write of a day;
  - before every schema migration;
  - before every admin restore;
  - on demand (`POST admin/backups`).

  Retention: 14 daily, 8 weekly, and every pre-migration and pre-restore backup (pruning is listed in the audit log).
- **Logical export:** `npm run server:export` writes per-project `sysml-studio-project` v1 JSON files, in the existing
  format from `src/project/transfer/exportProject.ts`, plus content releases and submissions as JSON. This keeps data
  portable to another host or another database (`docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md` §5).
- **Restore runbook:**
  1. Stop the server.
  2. Copy the current database to `pre-restore-*.db`.
  3. Replace the database with the chosen backup.
  4. Start the server; migrations run if needed.
  5. Run `GET admin/integrity`: SQLite `PRAGMA integrity_check`, plus `validateProject` from
     `src/project/model/integrity.ts` on every project.

  The restore is audit-logged.
- **Restore drill:** an automated test restores a backup into a temporary directory and compares project documents and
  submission hashes.
- **Student-level recovery** does not need an admin: project snapshots, history and restore-as-new-revision come from
  the existing store design (`ProjectStore.restore`), and "Export Project" stays available
  at all times.
- **D2:** off-host, encrypted backups owned by university IT. This is not designed here.

## 13. Data protection

- **FERPA-relevant records.** Once real students use D2, the institution maintains these, and they are likely to be
  education records:
  - submissions;
  - instructor feedback;
  - approvals and decisions;
  - authenticated contribution logs;
  - per-student progress.

  The faculty owner is not the right person to decide classification, retention or hosting alone. **A university
  data-protection and IT-security review is required before any real student account exists.** The design does not
  name a specific WSU policy, because none was verified.
- **D1 holds synthetic data only.** No real student names, emails, work or grades go on the laptop demo, and none go
  into the repository, test fixtures or screenshots.
- **Minimization:**
  - display name plus email only (email is optional in D1);
  - team initials for in-project attribution, consistent with roadmap F7;
  - no IP addresses stored beyond the in-memory rate-limit window;
  - raw XLSX files not retained by default (FD-S11).
- **Student rights:** "Export Project" and "Download Engineering Report" always work, and a per-student export of
  personal data (progress, attempts, contributions) is planned for D2.
- **Retention:** a term-end decision is needed (FD-S9): archive teams read-only, then purge after N months. There is no
  automatic deletion in v1.
- **AI:** no student data goes to any AI service (directive §13). The optional AI provider interface stays disabled
  until an approved service exists.
- **Accessibility** of the login and account pages follows the same axe gate as the rest of the app.

## 14. The static GitHub Pages edition (D0): what it can and cannot do

**Recommendation:** Pages stays a **public, read-only course preview and offline mode, with no accounts.**

| It can | It cannot (do not claim) |
|---|---|
| Show published course content, compiled from the latest content release snapshot at build time (`CONTENT_PUBLISHING_DESIGN.md` §7.3) | Authenticate anyone or enforce any role: everything in the bundle is public |
| Run Guided Practice and the browser-only My Project, where IndexedDB is labelled "Stored in this browser only. Export to keep a copy" | Store, share or protect student records: there is no server and no team sharing |
| Export and import project files | Collect submissions, feedback or approvals |
| | Hide anything: faculty notes, answer keys and drafts must simply not be in the build (the existing student build and leak check) |

The Pages build must contain no API URL, no demo credentials and no instructor UI that implies authority. The H3
instructor toggle is removed, or shown only with the label "UI preview, no authority" (FD-S10). The Pages edition is
**not secure for student records**, and its landing text should say so in one sentence.

## 15. Threat table (STRIDE-lite)

| STRIDE | Threat | Context | Mitigation | Residual |
|---|---|---|---|---|
| S | Password guessing or credential stuffing | D1/D2 | scrypt (§4.1), rate limits and lockout (§4.4), no account enumeration | Weak passwords; D2 should use SSO |
| S | Session theft through XSS | D1/D2 | HttpOnly cookie, CSP, no innerHTML (§9) | Malicious browser extensions are out of scope |
| S | A role "switch" in the UI | D0/D1 | Roles come from the server session only; the H3 toggle carries no authority (§5.1, §14) | — |
| T | A student forges an approval or edits another team's project | D1/D2 | Server-side replay of operations, forbidden paths, membership check (§5.2, §5.3) | — |
| T | Lost update between teammates | D1/D2 | Version check and rebase/conflict flow (schema doc §6) | Students must still resolve real conflicts |
| T | Submission altered after the fact | D1/D2 | Immutable rows plus SHA-256 of the snapshot (schema doc §5.3) | An admin with file access (audit hash chain is optional) |
| T | DNS rebinding against the loopback server | D1 | Host allow-list, Origin check (§9, §4.3) | — |
| R | "I didn't make that change" | D1/D2 | Server-stamped change sets plus the audit log (§11) | A shared account; one person per account is policy |
| I | Faculty notes, keys or drafts reach a student | all | Structural separation, the bundle built in student mode, the leak crawl test (§6) | Human error in content (for example a key typed into a student field); preview shows it |
| I | Cross-team read (IDOR) | D1/D2 | Membership check, 404 (§5.1) | — |
| I | Laptop theft exposes the database or backups | D1 | Synthetic data only; OS disk encryption assumed (verify the BitLocker status with IT) | — |
| D | Huge upload, ZIP bomb or pathological XLSX | D1/D2 | Limits (§7, §8), worker timeout | — |
| D | Lockout abuse against a classmate | D1/D2 | Per (account, IP) keying; admin unlock (§4.4) | — |
| E | Mass assignment of `roles` through a profile update | D1/D2 | Allow-listed fields (§5.1) | — |
| E | Faculty repository called from a student path | D1/D2 | `InstructorContext` type gate plus the leak test (§5.1, §6) | — |

## 16. Faculty and university decisions on security (summary)

| ID | Decision | Default until decided |
|---|---|---|
| FD-S1 | Account provisioning: instructor-created accounts or roster import (recommended), or self-registration with a course code | Instructor-created |
| FD-S2 | Is published content public (anonymous preview) or sign-in only in D2? | Sign-in only on the server; Pages stays the public preview |
| FD-S3 | Teams: student-formed with join codes, or instructor-assigned; maximum size | Student-formed, instructor can adjust; maximum 5 |
| FD-S4 | Will any real student use the local backend before the university review? | **No.** D1 is a demonstration with synthetic data |
| FD-S5 | Hosting target and operator for D2 | Open (directive §6.6) |
| FD-S6 | May instructors see individual progress and attempt data, or aggregates only? | Aggregates only |
| FD-S7 | TA role needed? | No |
| FD-S8 | Are Week 1 formative quiz explanations private answer keys? | Treated as private (served after the attempt) |
| FD-S9 | Retention and deletion at the end of term | Archive read-only; no automatic deletion |
| FD-S10 | Static Pages edition: keep the browser-only My Project for students? | Keep, labelled browser-only |
| FD-S11 | Retain raw uploaded XLSX files? | No: keep the hash and provenance only |

Roadmap decisions superseded for server mode by A23: **F2** (self-declared initials become server-stamped identity),
**F3** (approval becomes an in-app instructor action) and **F10** (local-only storage becomes a local backend for
demonstration). **F1**, the LMS file as the graded artifact, remains open and interacts with submissions
(`PROJECT_DATA_SCHEMA.md` §5.3).
