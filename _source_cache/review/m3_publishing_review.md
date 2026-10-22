# M3 content publishing: independent security and functional review

Date: 2026-10-21. Reviewer: independent agent. The review was read-only and adversarial. Scope: Milestone 3 (limited
content publishing, DECISION_LOG A24) as described in `learning-studio/docs/server/M3_PUBLISHING_REPORT.md`. The M3 code
is uncommitted in the working tree. M6 and Week 9 files are out of scope.

Paths below are relative to `learning-studio/` unless stated otherwise.

## Verdict: SIGN-OFF WITH MINORS

- **Authorization is sound.** Every authoring route returns 404 to students and to admin-only accounts, and 401 to
  anonymous callers. Every write enforces JSON, Origin and CSRF.
- **Plan tokens hold.** Each token is bound to one instructor and to the exact draft and published versions. Tokens
  expire after 10 minutes and cannot be replayed.
- **Publishing is atomic and isolated.** Publish, restore and withdraw are atomic. They leave all 19 non-content tables
  byte-identical.
- **Triggers protect bodies and history.** Revision bodies are immutable at the database level, and history rows are
  never deleted.
- **The static student build is offline-only.** It contains no reference to `/api` and no authoring chunk.
- **XSS is not reachable.** React escapes all text, and `src/` contains no `dangerouslySetInnerHTML`.

There are no Critical or High findings. One Medium finding concerns academic attribution. The Low findings are
defence-in-depth items.

## Findings

| ID | Sev | Where | Scenario | Fix |
|---|---|---|---|---|
| M1 | Medium | `src/publishing/validate.ts:82-84` (citation check, warning only) | An instructor deletes the inline citation that follows a verbatim seed quotation, for example `“a transdisciplinary approach …” (R.. p..)`. The quotation check passes. The result is `errors=[]` with only the warning `citation-removed` (probe `q.probe.ts`). Mark-ready, plan and publish all go through, so students then read a source quotation with no attribution. Directive §5 says "never alter definitions, principles or attributions". | Raise an **error** when a paragraph keeps a seed quotation but loses a citation that the seed paragraph carried. Keep the warning for a removed citation in a paragraph without quotations. Alternatively, treat the quotation together with its citation as one read-only span. |
| L1 | Low | `server/repo/content.ts:41-55` (triggers) | The triggers freeze only `body`/`body_sha256` and the state graph. Direct SQL was able to change these fields: `change_note`, `author_id`, `published_by`, `published_at` and `seq` on published or superseded rows; `content_releases.note`/`published_by` (there is no UPDATE trigger on releases); and `content_items.retired_at`/`seed_sha256`. `setState(id,'published','published',{changeNote})` would also pass, because `content_state_rules` fires only when the state changes. No current caller does this. Design §2.2 says revisions are immutable once they leave DRAFT. | Add `BEFORE UPDATE ON content_revisions WHEN OLD.state IN ('published','superseded','archived')`. It should allow only the state column plus `superseded_at`/`archived_*` during a permitted transition. Add `content_releases_no_update`. Make `setState` refuse `from === to`. |
| L2 | Low | `src/publishing/validate.ts:119,125`; `src/publishing/seed.ts:17-18` | **Id reissue:** any `bNNN` id that is not in the seed is accepted as "added by an earlier revision". The server does not check that the id exists in the base or current revision. Probe: new paragraph `b006` was published, removed and published, and then the client re-sent `b006` with different text. The server accepted it without error. This breaks the design §3 rule "never reissued". **Large ids:** a client-sent `b9999` is accepted, so the next new paragraph becomes `b10000`. That id fails `BLOCK_ID`/`blockNo` (3–4 digits), and the next save rejects it with "Unknown block id b10000" and drops the paragraph from the stored draft. | Accept a non-seed `bNNN` only if it is present in the open draft or in the published (base) revision. Reject any number above `maxBlockNo`. Widen the regex, or cap the numbers at 9999. |
| L3 | Low | `src/publishing/validate.ts:27,53` (`CONTROL` = C0 only) | Zero-width, bidi and format characters pass (U+200B–200F, U+202A–202E, U+2066–2069, U+FEFF), and so do homoglyphs. Probe: `R\u200B11 p.552` raises neither the citation error nor `leak:register-code`, so students would see a register code. `\u202E` reverses the displayed text, which can make text read differently in the compare view than in review. Cyrillic `Р11` also passes. Input is instructor-only, so this is low risk. | Refuse `\p{Cf}` (and U+00AD) in `checkText`. Run the leak scan on NFKC-normalised text with format characters stripped. |
| L4 | Low / Info | `src/publishing/validate.ts:28-29` | `[this](https://evil.example/phish)` and bare `https://` URLs pass validation. There is no link renderer, so students see literal bracket syntax. This is not exploitable: probes with `<img onerror>`, `<script>`, `</p><svg onload>`, `javascript:` (bare, Markdown and entity-encoded) and `data:text` were all refused. Full-width `＜img＞` passes but is harmless, because React escapes it. | Optionally add a warning for `](`, and decide whether https URLs belong in prose at all. |
| I1 | Info | `server/services/content.ts:277-295` | A withdrawal (archive) changes the student view through a release without a plan token or plan-stale check. It needs CSRF, a reason of at least 3 characters, and the UI confirmation. Design §4.4 and SECURITY §5.2 require the token for publish only, so this is acceptable. | No action, or reuse the plan token for withdrawal later. |

### Decision item (not a defect)

- **D1.** `authoring/*` returns 404 to an admin who does not hold the instructor role
  (`server/authz/policy.ts:96-97`, `contentRoutes.ts:17-21`). Directive §6.3 names an "INSTRUCTOR/ADMIN" experience.
  `SECURITY_ARCHITECTURE.md` §5.2 (authoring row: "✘ (unless also I)") controls, and the builder's behaviour is
  consistent with it. `create-admin` grants admin + instructor, so the faculty owner is unaffected. Faculty should
  confirm this, and it should be recorded in DECISION_LOG.

## Verified items (commands and results)

All probes ran in the scratch area on a random high port (49372 in the final run). They used a file-backed SQLite
database in a temporary data dir under `…\scratchpad\m3review\data-*`, with the default data dir never used. The data
dir was deleted afterwards and the in-process server was closed. No seeded password was written to any file.

- **Server suite:** `npx vitest run --config vitest.server.config.ts` → 14 files, **363 passed**.
- **Publishing tests:** `npx vitest run src/publishing` → **11 passed**.
- **M3-touched frontend areas:** `npx vitest run src/week1 src/pages src/flow src/publishing src/authoring` → 14 files,
  **144 passed**.
- **Type check:** `npx tsc -p tsconfig.app.json --noEmit` and `-p tsconfig.server.json --noEmit` (buildinfo redirected
  to scratch) → **both clean**. The M6 breakage the builder reported is no longer present.
- **Student build:** `npx vite build --mode student --outDir <scratch>/dist-student`. A grep of the output found zero
  hits for each of: `/api`, `/api/v1`, `X-SLS-CSRF`, `/content/weeks`, `publish-plan`, `Updated content available`,
  `contentPoll` and `Review and publish`. The output contains no AuthoringApp or ItemEditor chunk.
  - Only two inert strings remain: the router predicate `/authoring` and the default label of `EditContentLink`. The
    component returns null when `OFF`.
  - The `docs/authoring/...` strings in the weeks bundle are older Week 2/4 material, not M3.
- **Authorization matrix** (`m3.probe.ts`): 15 authoring routes were tested, covering items, item, revision, releases,
  both previews, draft, ready, return, delete, restore, archive, publish-plan, releases and an unknown item. Each
  returned student **404**, admin-only **404** and anonymous **401**.
- **CSRF and Origin** on instructor writes: no CSRF header → 403; wrong header → 403; foreign Origin → 403; form-encoded
  body → 415; release or delete without CSRF → 403. No draft was created by any of these requests.
- **Plan token:**
  - another instructor using the token → 409 `plan-stale`;
  - draft edited after the plan → 409;
  - 10 min 1 s later (controlled clock) → 409;
  - missing note → 400;
  - publish → 201 REL-0002;
  - replay of the same token → 409.
- **IDOR:** another item's revision id used under this item, for both view and restore → **404 / 404**.
- **Concurrency:**
  - a second instructor saving with version null or a stale version → 409, and the message names the editor and the
    time;
  - two parallel first-saves on the same item → `200, 409` (mutex plus unique index; no 500).
- **Isolation:** a student team project was created, then the probe ran save, publish, restore + publish and a refused
  archive. All 19 non-content tables were byte-identical before and after (projects, snapshots, changes, submissions,
  approvals, faculty notes, users, teams and others). The only difference was the audit-log autoincrement in
  `sqlite_sequence`.
- **Drafts stay out of student routes:** after a draft save, the marker text was absent from `content/weeks/1`,
  `content/course` and `content/release`. `If-None-Match` returned **304**, so the published ETag did not move.
  Authoring responses carry the default `Cache-Control: no-store`.
- **Triggers:**
  - blocked: UPDATE of the body of a published row; DELETE of a published or superseded row; superseded → published;
    DELETE of a release; UPDATE of release items;
  - allowed: metadata updates (see L1).
  - The repo functions `updateDraft` and `deleteOpenDraft` on a published row → `false`.
- **Restart and seed idempotency:** after the store was closed and reopened (new app, new seed WeakMap), the release
  stayed REL-0003, the published revision kept the same id, there were still 60 items for 60 seeds, and still 3
  releases. The published edits were not overwritten.
- **Content safety:**
  - refused with the rule `markup`: `<img onerror>`, `<script>`, `[x](javascript:…)`, bare `javascript:`,
    `java&#115;cript:`, `http://`, `data:text`, `</p><svg onload>`;
  - refused with 400 at the JSON boundary: control characters and NUL;
  - refused by the leak rules: bare `R11`, "Faculty note", "pending faculty", `RB-1.2`, "goal";
  - refused by the citation rule `citation-range`: an out-of-range page;
  - removed by the wording layer: the slide pointer "(see slide 4)".
  - Publish with errors → plan `errors=1`, release **422**.
- **Read-only blocks are enforced on the server:**
  - a tampered definition, title and injected heading → 3 `read-only` errors; the stored draft keeps the seed
    definition and title and has no heading;
  - course introduction: a tampered quote is restored to the seed; markup, an inline citation and the faculty
    placeholder are refused;
  - department label `<b>` → refused with `markup` and `department-chars`.
- **Quotation verbatim:** changing one word inside a seed quotation → `quotation-changed` error.
- **Not re-run:** Playwright Demo A (the builder reports 2 passed). No lock was taken.

Probe sources are in the scratch area (`C:\Users\w451vxs\AppData\Local\Temp\claude\C--Users-w451vxs\d2f69355-808b-4b69-b891-131c6cae6c93\scratchpad\m3review\`):
`m3.probe.ts`, `q.probe.ts` and `probe.config.mjs`. The run log is `probe-log.txt` in the same folder.
