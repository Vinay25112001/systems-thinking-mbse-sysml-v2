# Backend Options and Recommendation (M0)

Status: **recommendation for approval; nothing is built or installed.** Written 2026-10-21 for directive §6.1, §6.6,
§18 M2/M3, §21 and §23. Companion documents (repository root): `SECURITY_ARCHITECTURE.md`,
`CONTENT_PUBLISHING_DESIGN.md`, `PROJECT_DATA_SCHEMA.md`. Paths are relative to `learning-studio/` unless stated
otherwise.

## 1. Constraints

| Constraint | Source | Consequence |
|---|---|---|
| Windows 11 Enterprise corporate laptop, no admin rights, SentinelOne EDR, no native compiler toolchain | observed environment (EDR blocks VM tooling on this laptop) | No `node-gyp` builds. Native addons only if prebuilt binaries download and load, which is not guaranteed behind the corporate proxy and EDR |
| Node **v24.18.0**, npm 11.16.0 already installed | audit `APPLICATION_STATE_REPORT.md` §4 | Built-ins are free: `node:http`, `node:sqlite`, `node:crypto` (scrypt, argon2), `fetch`, test runners |
| Licences MIT or Apache-2.0 only for new dependencies | task brief | Rules out BSD and MPL additions; prefer zero new runtime dependencies |
| Local demonstration first; portable; no cloud lock-in; no paid services; no public deployment | directive §6.1, §6.6, §23 | A self-contained process plus one data directory; a database swap through an interface |
| Reuse the canonical project model | directive §18 M2; `PROJECT_DATA_SCHEMA.md` | The server must run `src/project/model/**` (TypeScript, extensionless imports, `import.meta.env` in `src/lib/edition.ts`) |
| About 5.5 weeks to 2026-12-01, with 8 course weeks of content still to produce | audit C1 | Small surface, no framework learning curve, the fewest moving parts |

Probe results on this laptop (2026-10-21, scratchpad only, nothing installed):

- `require('node:sqlite')` loads and exports `DatabaseSync`, `StatementSync`, `Session`, `constants` and `backup`. The
  bundled SQLite is 3.53.1. **No ExperimentalWarning was printed.**
- `crypto.scrypt`, `crypto.argon2` and `crypto.timingSafeEqual` are all present. scrypt with N=2^17 takes 423 ms;
  argon2id with m=19 MiB, t=2 takes 40 ms.
- `process.features.typescript` is `'strip'`: type stripping is available.

## 2. Options

### Option A: `node:http` + `node:sqlite` (built-ins only)

- **HTTP:** a small in-house router of about 150 lines (method plus path-pattern table, matching the style of
  `src/lib/router.tsx` `matchRoute`) and middleware for session, CSRF, limits and headers. Static files of the built SPA
  are served from the same origin.
- **Database:** `node:sqlite` `DatabaseSync` in WAL mode with `busy_timeout=5000`. Synchronous calls are fine for one
  course's load.
- **Dependencies added: 0 runtime, 0 dev.**
- **Stability of `node:sqlite` (stated honestly):** it shipped behind `--experimental-sqlite` in v22.5 and was unflagged
  in v22.13/v23.4. From memory, the Node 24 documentation still marks it **Stability 1.x (experimental / active
  development or release candidate)**, not Stability 2. This could not be verified offline. On 24.18.0 the module loads
  without a flag and without a warning. The risk is API churn in a minor release, not data-format risk: the file is
  ordinary SQLite 3. Mitigations:
  - all access goes through the repository layer (§5);
  - the Node version is pinned for the demo (`engines` plus `.nvmrc` documentation, no automatic upgrade);
  - a contract test suite catches churn;
  - a fallback to `better-sqlite3` (Option B's database) is a contained swap, because its API is near-identical:
    `prepare().run/get/all`.
- **Licences:** Node.js (MIT); SQLite (public domain).

### Option B: Fastify + `better-sqlite3`

- **Fastify 5:** MIT; mature routing, schemas, hooks and cookie plugins.
- **better-sqlite3:** MIT, a native addon. It installs via prebuilt binaries downloaded from GitHub releases by
  `prebuild-install`. If the download is blocked (corporate proxy) or the binary is quarantined by EDR, it falls back to
  `node-gyp`, which needs Python and the Visual Studio Build Tools. **Neither is available without admin rights.**
  Prebuilt support for the exact Node 24 ABI must also be confirmed at install time.
- **Dependencies:** an estimated 50–90 transitive packages for the two together, plus `@fastify/cookie`,
  `@fastify/static` and a rate-limit plugin. This is not verified; run `npm ls --all | wc -l` before committing to it.
- **Pros:** battle-tested; faster to write validation-heavy routes.
- **Cons:** the install risk on this machine, the supply-chain surface, and a framework the course codebase does not
  otherwise use.

### Option C: `node:http` + JSON files with atomic writes

- One JSON file per project or record. A write goes to `tmp`, then `fsync`, then `rename`, behind a per-file
  in-process mutex.
- **0 dependencies.**
- **Cons:**
  - no multi-record transactions, but a submission must write the snapshot, the submission row and the audit entry
    atomically, and a publish must write a release and supersede revisions atomically;
  - no query capability for the instructor queues;
  - all integrity rules have to be hand-rolled;
  - **Windows rename semantics under EDR.** `rename` over a file that the scanner holds open fails with `EPERM`/`EBUSY`
    intermittently, which is a real risk on a SentinelOne laptop. The workaround is retry loops.
  - portability to PostgreSQL means a rewrite, not a swap.

### Comparison

| Criterion | A: http + node:sqlite | B: Fastify + better-sqlite3 | C: http + JSON files |
|---|---|---|---|
| Installable here without admin or compiler | **Yes (built-in)** | Uncertain (prebuilt download and EDR) | Yes |
| New runtime dependencies | **0** | ~50–90 (estimate) | 0 |
| Licences | MIT / public domain | MIT | MIT |
| Transactions across tables | Yes (SQLite) | Yes | **No** |
| Online backup | `backup()` built-in (confirmed present) | `.backup()` | File copy (torn-read risk) |
| API stability | `node:sqlite` experimental-status risk (mitigated, §2A) | Stable | Stable |
| Code to write | Router and middleware (~400 lines) | Less | Router plus transaction emulation (most) |
| Path to PostgreSQL | Repository swap (§5) | Repository swap | Rewrite |
| Fit with existing patterns | High: pure TS, no framework | Medium | Medium |

## 3. Recommendation: Option A

**`node:http` + `node:sqlite` + `node:crypto` (scrypt), written in TypeScript under `learning-studio/server/`, bundled by
the Vite already installed, behind an async repository interface.**

Rationale:

1. **Zero install risk** on this locked-down machine, and zero new supply chain.
2. **Real transactions,** which submissions, publishing and the project version check all need (`PROJECT_DATA_SCHEMA.md`
   §5, §6).
3. **Reuse of the tested pure model.** The server replays operations with `commitOps`/`checkOp` from
   `src/project/model/**` and imports files with `src/project/transfer/importProject.ts`. Vite already compiles that
   code. The same SSR loading pattern is used today by `scripts/build-lectures.mjs:401-409`.
4. **Portable.** One Node process plus one data directory. It runs on any host with Node 24, and PostgreSQL is reachable
   through the repository interface.
5. **The stability caveat is contained,** with a near-drop-in fallback (`better-sqlite3`) behind the same interface.

### 3.1 Why bundle with Vite (and not run TypeScript directly)

- Node 24's type stripping cannot run the shared code as-is:
  - `src/project/**` uses extensionless relative imports (`'./types'`), which Node's ESM resolver rejects;
  - `src/project/transfer/exportProject.ts` imports `src/lib/edition.ts`, which reads `import.meta.env`, a Vite-only
    feature.
- **Production:** `vite build --ssr server/main.ts --config vite.server.config.ts --outDir dist-server` produces one ESM
  bundle for Node. Node built-ins stay external, and **no new dependency is needed** (Vite 8.3.4 is installed).
- **Development:** `server/dev.mjs` creates a Vite server in middleware mode and `ssrLoadModule('/server/app.ts')` on
  each request, so edits apply without a restart. This is the `build-lectures.mjs` pattern again.

Two small refactors are needed before the server imports the shared code. They are flagged for M2 and are not
behaviour changes:

- `src/workbench/week1/team.ts:21` and `src/project/adapters/week1.ts:11` import `ownerProblem` from the **React
  component file** `src/components/ProvenanceOwnerFields.tsx`. Move `ownerProblem` to a pure module and re-export it
  from the component, so the server bundle does not pull in React.
- `IS_STUDENT_EDITION` in exports: the server sets `define: {'import.meta.env.VITE_EDITION': '"server"'}`, or the
  export stamps `edition: 'server'`. Exports must say which edition wrote them.

### 3.2 Layout

```
learning-studio/
  server/
    main.ts               # production entry: config, open DB, migrate, listen on 127.0.0.1:5174, serve dist/
    app.ts                # handle(req,res): headers, Host/Origin allow-list, body limits, router
    http/                 # router.ts, cookies.ts, csrf.ts, rateLimit.ts, errors.ts, static.ts
    identity/             # IdentityProvider port, localPassword.ts (scrypt), sessions.ts
    authz/                # authorize(ctx, action, resource), InstructorContext
    routes/               # auth, teams, projects, approvals, submissions, content, authoring, faculty, progress, admin
    services/             # project.ts (replay via src/project/model/commit), content.ts (assembleStudentView), ...
    repo/
      interfaces.ts       # async repository ports per store (PROJECT_DATA_SCHEMA.md §2)
      sqlite/             # node:sqlite implementation, migrations/*.sql, backup.ts
    cli/                  # create-admin, seed-demo, backup, restore, export, integrity, test-fixture
    *.test.ts             # Vitest, node environment
  vite.server.config.ts   # SSR build of server/main.ts (no react/tailwind plugins)
```

### 3.3 Running it

| Script (proposed) | Does |
|---|---|
| `npm run dev` | Unchanged Vite on 5173. With the proxy below, `/api` reaches the API server |
| `npm run server:dev` | `node server/dev.mjs` → API on `127.0.0.1:5174` (SSR-loaded TS) |
| `npm run server:build` | Vite SSR bundle → `dist-server/` |
| `npm run build:served` | SPA in "served" mode: student-edition stripping (`student-edition.ts`) plus `VITE_BACKEND=http` → `dist-served/`; `check-student-build.mjs` runs on it |
| `npm run server:start` | `node dist-server/main.js`: serves `dist-served/` and `/api` on one origin, 5174 (no CORS at all) |
| `npm run server:create-admin` / `server:seed-demo` / `server:backup` / `server:restore` / `server:export` | CLIs (`SECURITY_ARCHITECTURE.md` §4.7, §12) |

The Vite dev proxy is a one-line addition to `vite.config.ts`. The existing `server` block keeps its host, port,
`strictPort` and `warmup`:

```ts
server: {
  host: '127.0.0.1', port: 5173, strictPort: true, warmup: { clientFiles: ['./src/main.tsx'] },
  proxy: { '/api': { target: 'http://127.0.0.1:5174', changeOrigin: false } },
},
```

With `changeOrigin: false` the API sees `Host: 127.0.0.1:5173`. In `demo` mode, the server's Host and Origin
allow-lists therefore include `127.0.0.1:5173` and `localhost:5173` (`SECURITY_ARCHITECTURE.md` §4.3, §9).

**Cookies are not port-scoped.** A D1 session cookie for `127.0.0.1` is also sent to any other local server on that
host. This is acceptable for synthetic demo data. It is one more reason the cookie is `HttpOnly` and the token is stored
only as a hash, and D2 uses its own hostname.

## 4. Frontend service interfaces

One composition root, `src/services/index.ts`, picks implementations by build flag `VITE_BACKEND` (`none` for the
Pages/offline edition, `http` for the served edition). Components depend on the interfaces only.

```ts
// src/services/types.ts (design sketch)
import type { StorageAdapter } from '../project/store/adapter'
import type { ProjectDoc } from '../project/model/types'

export type Role = 'student' | 'instructor' | 'admin'
export type SessionInfo = {
  user: { id: string; displayName: string; initials: string }
  roles: Role[]; team: { id: string; label: string } | null
  csrfToken: string; expiresAt: string; mustChangePassword: boolean
}
export type ServiceError = { code: 'session-expired' | 'csrf' | 'forbidden' | 'not-found' | 'conflict' | 'integrity' | 'rate-limited' | 'network' | 'server'; message: string }

export interface AuthService {
  readonly mode: 'offline' | 'server'          // offline: always null session, UI says "Offline edition, no accounts"
  current(): Promise<SessionInfo | null>
  signIn(login: string, password: string): Promise<SessionInfo | ServiceError>
  signOut(): Promise<void>
  changePassword(current: string, next: string): Promise<void | ServiceError>
  subscribe(fn: (s: SessionInfo | null) => void): () => void
}

export type ReleaseInfo = { releaseId: string; publishedAt: string }
export interface ContentService {
  currentRelease(): Promise<ReleaseInfo>
  week(n: number): Promise<StudentWeekView>     // assembled student view (content doc §6–§7)
  item(id: string, revisionId?: string): Promise<ContentItemView>
  watchRelease(fn: (r: ReleaseInfo) => void): () => void   // focus / route / 5-min poll → "Show the update" banner
}
export interface AuthoringService {             // present only for instructors; the server re-checks every call
  history(itemId: string): Promise<RevisionMeta[]>
  openDraft(itemId: string): Promise<DraftView>
  saveDraft(revisionId: string, body: unknown, version: number): Promise<DraftView | ServiceError>
  markReady(revisionId: string): Promise<void | ServiceError>
  compare(a: string, b: string): Promise<RevisionDiff>
  preview(week: number, overrides: Record<string, string>): Promise<StudentWeekView>
  planPublish(revisionIds: string[]): Promise<PublishPlan>
  publish(planToken: string, note: string): Promise<ReleaseInfo | ServiceError>
  restore(itemId: string, fromRevisionId: string): Promise<DraftView>
  facultyBody(revisionId: string): Promise<unknown>
}

export interface ProjectService {
  myTeam(): Promise<TeamView | null>
  createTeam(label: string): Promise<TeamView | ServiceError>
  joinTeam(code: string): Promise<TeamView | ServiceError>
  createInvite(teamId: string): Promise<{ code: string; expiresAt: string }>
  /** The persistence adapter for the existing ProjectStore (src/project/store/ProjectStore.ts). */
  persistence(): PersistenceAdapter
  requestApproval(projectId: string): Promise<ApprovalView | ServiceError>
  approval(projectId: string): Promise<ApprovalView | null>
}
export interface SubmissionService {
  submit(projectId: string, week: number): Promise<SubmissionView | ServiceError>
  list(projectId: string): Promise<SubmissionView[]>
  get(id: string): Promise<SubmissionView & { snapshot: ProjectDoc }>
  feedback(projectId: string): Promise<FeedbackView[]>
}
export interface InstructorReviewService {      // instructor only
  pendingApprovals(): Promise<ApprovalView[]>
  decideApproval(id: string, decision: 'approved' | 'revision-requested', comment: string): Promise<void | ServiceError>
  submissions(filter: { week?: number; state?: string }): Promise<SubmissionView[]>
  decideSubmission(id: string, decision: 'approved' | 'returned', comment: string): Promise<void | ServiceError>
  addFeedback(target: { projectId: string; submissionId?: string; artifactUid?: string }, body: string): Promise<void>
}

/** The existing StorageAdapter contract (src/project/store/adapter.ts), extended additively. */
export type PersistenceAdapter = StorageAdapter   // kind: 'indexeddb' | 'memory' | 'http'
```

Implementations:

| Interface | Offline edition (`VITE_BACKEND=none`, Pages) | Served edition (`VITE_BACKEND=http`) |
|---|---|---|
| `AuthService` | `OfflineAuthService` (null session) | `HttpAuthService` |
| `ContentService` | `BundledContentService` (today's TS imports) or `StaticContentAdapter` (`public/content/release.json`) | `HttpContentService`, with the bundled adapter for un-migrated weeks (content doc §7.4) |
| `PersistenceAdapter` | **existing** `IndexedDbAdapter` / `MemoryAdapter` (`src/project/store/indexedDb.ts`, `memory.ts`), unchanged | new `HttpProjectAdapter` (`PROJECT_DATA_SCHEMA.md` §6.2) plus the IndexedDB `outbox` |
| Approvals, submissions, review | Not available; the UI explains that the offline edition has no instructor connection | HTTP |

Rules:

- **The served edition never falls back silently to browser-only project storage.** If the server is unreachable, the
  project shows "Save failed: the course server cannot be reached", keeps the outbox and offers Export. It does not
  open a separate local copy that would later diverge (directive §6.5: "separate browser-local copies are never
  presented as collaboration").
- `ProjectStore` stays the single client-side engine. In HTTP mode, the adapter turns off coalescing and Web Locks (the
  `locks` option already defaults off for non-IndexedDB adapters), and the store adopts the authoritative document
  returned by the server.
- The existing `ProjectProvider.chooseStore()` (`src/project/store/ProjectProvider.tsx:25-37`) becomes the place that
  asks the composition root for the adapter. Its `?storage=memory|fail` test switches are kept.

## 5. Repository interface, PostgreSQL later, backups

- **Async ports per store** (`server/repo/interfaces.ts`): `IdentityRepo`, `TeamRepo`, `ProjectRepo`,
  `SubmissionRepo`, `ProgressRepo`, `ContentRepo`, `FacultyRepo`, `AuditRepo`, plus `tx<T>(fn: (r: TxRepos) =>
  Promise<T>)`. The ports are async from day one, so a PostgreSQL implementation using `pg` (MIT) changes no service
  code.
- **SQLite transaction pitfall.** With one synchronous connection, an `await` inside a transaction lets another request
  interleave statements in the same transaction. The SQLite `tx()` therefore serialises transactions through an
  in-process async mutex and runs `BEGIN IMMEDIATE … COMMIT`. CPU-heavy or async work such as scrypt and file parsing
  happens **before** entering `tx()`.
- **Portable SQL.** Plain types (`TEXT`, `INTEGER`) and JSON stored as text (PostgreSQL: `jsonb`). Partial unique
  indexes exist in both databases. Triggers are rewritten per database in migrations. UUIDs are generated in the
  application.
- **PostgreSQL in D2** is a hosting decision (FD-S5). Normalising artifacts out of the project document is optional
  there (`PROJECT_DATA_SCHEMA.md` §5.1).
- **Backup formats:**
  1. a SQLite file copy taken by the built-in `backup()`;
  2. a logical export: the `sysml-studio-project` v1 JSON per project (the existing format from
     `src/project/transfer/exportProject.ts`, with a checksum), content releases and submissions as JSON;
  3. a `manifest.json` holding the SHA-256 of each file, the schema version and the app git SHA.

  Format 2 is also the migration path to any other host or database. Restore and the drill are in
  `SECURITY_ARCHITECTURE.md` §12.

## 6. Tests

| Layer | Tool | How |
|---|---|---|
| Shared model | Vitest (existing) | `src/project/model/model.test.ts`, `store/store.test.ts` and `transfer/transfer.test.ts` stay green; the server reuses this code |
| Server services and routes | Vitest 5, **node environment** | `vitest.config.ts` gains `test.projects`: `app` (jsdom, `src/**`, as today) and `server` (node, `server/**/*.test.ts`). Each test file opens a `:memory:` database (or a temporary directory for backup tests) and starts `app.handle` on an ephemeral port; requests use the built-in `fetch` |
| Authorization matrix | Vitest | Table-driven over `SECURITY_ARCHITECTURE.md` §5.2: every route × {anonymous, student, other-team student, member, instructor, admin} → expected status; 404 for hidden resources |
| Faculty leak | Vitest | The crawl test in `SECURITY_ARCHITECTURE.md` §6 item 5, proven to fail in the instructor direction |
| Concurrency | Vitest | Two clients, same `baseVersion`, overlapping and disjoint operations → one `409`, rebase outcome, no lost update (the coalescing hazard in `PROJECT_DATA_SCHEMA.md` §6.1 as a regression test) |
| Publish isolation | Vitest | Hashes of the projects, submissions and progress stores are equal before and after a publish |
| Two genuine sessions (directive §7, §19 A, C) | Playwright | New `playwright.server.config.ts`, separate from the existing configs, so it neither overwrites tracked screenshots nor reuses the 5173 server. `webServer` starts the API with `SLS_MODE=test` and a temporary data directory, plus the Vite dev server with the proxy. Accounts come from `node dist-server/cli.js test-fixture --json` (test mode only, prints throwaway credentials for that temporary database). **Two `browser.newContext()` instances** give separate cookie jars, so instructor and student are genuinely separate sessions: the instructor publishes; the student refreshes or gets the banner, sees the update, and the project is unchanged. Axe runs on login, editor and review pages, as in the existing specs |
| Restore drill | Vitest | Backup, restore into a temporary directory, compare project documents and submission hashes |

## 7. What is real and what is simulated after M2/M3

| Real (once built and tested) | Still simulated or absent |
|---|---|
| Accounts with hashed passwords, server sessions, server-side authorization, team membership, version-checked shared projects, instructor approval, immutable submissions, publish/history/restore, backups | **Institutional SSO** (an interface only); hosting (D1 laptop loopback only); live co-editing (polling every ~15 s, not real-time); email; LMS integration; TLS on D1; a university data-protection review |

## 8. Effort estimate (agent-days: one focused agent session including tests and docs)

### M2: reliable data foundation

| Work | Must | Should |
|---|---|---|
| Server skeleton: config, router, body limits, error model, headers, Host/Origin checks, static serving, health | 0.5 | |
| Repository layer (SQLite), migrations, backup/restore/integrity CLIs | 1.0 | |
| Auth: scrypt, sessions, CSRF, rate limit and lockout, routes, create-admin and seed-demo CLIs, minimal admin user management | 1.0 | |
| Teams: create, invite, join, leave; membership projection into `Team.members` | 0.5 | |
| Project API: create and import (server-side `analyzeImport`), changes with version check and server replay, forbidden paths, snapshots and restore, changes-since, export | 1.5 | |
| Frontend: composition root, sign-in, `HttpProjectAdapter`, `ProjectStore` adoption of the returned document, save states, polling, rebase and conflict panel | 1.5 | |
| IndexedDB outbox for interrupted saves | | 0.5 |
| Approvals, submissions, feedback APIs plus minimal UI (could move into the M6 window, where the directive places approval) | | 1.0 |
| Tests: authorization matrix, concurrency, two-session Playwright; doc updates | 1.0 | |
| **M2 total** | **7.0** | **+1.5** |

### M3: admin content management

| Work | Must | Should |
|---|---|---|
| Content and faculty tables, seed (SSR load, faculty split, IDs, BlockRef rewrite), seed-equivalence test | 1.25 | |
| Content API: release, week assembly, items, faculty routes, lifecycle, publish plan and confirm, restore, archive | 1.0 | |
| `ContentService` (HTTP, bundled, static adapters); update banner; readers switched to the service | 0.75 | |
| Authoring UI: item list, block editor (para, heading, bullets, definition, table, callout, steps, figure placement), draft autosave, validation panel, preview-as-student, publish dialog | 1.75 | |
| History, block-level compare, item restore | 0.5 | |
| Leak test, acceptance demonstration A as Playwright (two sessions) | 0.75 | |
| `build-lectures.mjs --from` (pptx and notes from the store) | 0.5 | |
| Word-level diff, release revert, add-reference, `content:snapshot` for Pages | | 1.25 |
| **M3 total** | **6.5** | **+1.25** |

**Must total: about 13.5 agent-days. This exceeds a single-stream 1.5–2-week target.** Ways to fit:

1. **Two streams after the M2 skeleton.** A server stream (repository, auth, project API, content API) and a frontend
   stream (services, adapter, conflict UI, editor) work on disjoint files. Directive §22 allows parallel agents only on
   independent file sets, so the shared model, routing, authentication and persistence are integrated sequentially.
   This takes about 8–9 working days of calendar time.
2. **A limited alternative for M3** (directive §21: tested and named as incomplete). Week 1 **slides and faculty notes
   stay TS-authored** until after 2026-12-01, which removes `--from` and the slide editor. Learn, lesson, overview, lab
   and assessment items move to the store. Each item still has exactly one authoritative source, but lesson Markdown
   must then be exported from the store. This saves about 1 day.
3. Move approvals and submissions to M6, saving 1 day, which is already "should".

The estimates assume M0/M1 approval of this design without major change and a stable working tree (audit H6). They
exclude faculty review time.

## 9. Decisions

### Need faculty (or university) approval

| ID | Decision |
|---|---|
| FD-B1 | **Adopt a local backend at all** for the Dec 1 demonstration. This reverses roadmap F10 (local-only), which A23 already directs, but the data-handling consequences need explicit sign-off |
| FD-S4 | No real student data on the D1 laptop demo; real use only after the university data-protection and IT review and an approved host (FD-S5) |
| FD-S1, FD-S3 | Account provisioning; team formation and size |
| FD-S2, FD-S6, FD-S8, FD-S9, FD-S10, FD-S11 | Public content in D2; instructor visibility of individual progress; private formative keys; retention; Pages keeps browser-only My Project; raw XLSX retention (`SECURITY_ARCHITECTURE.md` §16) |
| F1 (open) | In-app submission vs LMS upload as the graded artifact (`PROJECT_DATA_SCHEMA.md` §5.3) |
| FD-C1 … FD-C5 | Content cutover, second reviewer, regrading, student diff, unverified references (`CONTENT_PUBLISHING_DESIGN.md` §13) |
| Scope | Whether the M3 limited alternative (§8, item 2) is acceptable for Dec 1 |

### Reversible engineering choices (logged in DECISION_LOG as working conventions, no approval needed)

- `node:sqlite` vs `better-sqlite3`; `node:http` vs Fastify.
- Vite SSR bundling.
- Port 5174.
- scrypt parameters and the argon2id upgrade trigger.
- Session timeout values.
- Polling intervals (15 s project, 5 min content).
- The content ID format.
- The diff algorithm.
- Server-side change-set coalescing.
- The JSON project column vs normalised artifact rows.
- Backup retention numbers.
- Body-size and XLSX limits.
- The IndexedDB outbox.
- The CSP details.

## 10. External facts stated from memory (verify before relying on them)

| Claim | Where used | Status |
|---|---|---|
| `node:sqlite` stability index in the Node 24 docs is 1.x, not 2 | §2A | Not verified offline; observed only that 24.18.0 loads it without a flag or warning |
| `crypto.argon2` was added in v24.7.0 as experimental | `SECURITY_ARCHITECTURE.md` §4.1 | Presence verified; version and status not verified |
| OWASP scrypt minimum N=2^17, r=8, p=1; argon2id m=19 MiB, t=2, p=1 | §4.1 there | From memory |
| NIST SP 800-63B-4: at least 15 characters for single-factor passwords | §4.1 there | From memory |
| npm `xlsx@0.18.5` has unpatched advisories; newer SheetJS is CDN-only | §8 there | From memory; re-check at M6 |
| `better-sqlite3` prebuilt binaries cover the Node 24 ABI on win32-x64 | §2B | Not verified |
| Node 24 is an LTS line supported into 2028 | §2A | From memory |

Per the standing "research before engineering" rule, these are checked against primary sources before M2 starts. Any
that fails changes only reversible choices in §9.
