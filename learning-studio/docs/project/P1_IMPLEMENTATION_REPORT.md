# P1 implementation report — minimal functional My Project workspace

Written 2026-10-19 under DECISION_LOG A22 (master development directive, `docs/directives/2026-10-19_MASTER_DEVELOPMENT_DIRECTIVE.md`).
Built to the P1 build spec in `UPDATED_IMPLEMENTATION_ROADMAP.md` §2, with `PROJECT_WORKSPACE_ARCHITECTURE.md`,
`CANONICAL_ENGINEERING_DATA_MODEL.md`, `CROSS_PHASE_TRACEABILITY_PLAN.md` and the visual direction of
`UI_UX_REDESIGN_PROPOSAL.md` / `docs/ux/mockups/` (repository root). Nothing was committed; the faculty owner commits.
Paths are relative to `learning-studio/`.

## 1. What was built, against the spec

| Increment | Spec | Built | Where |
|---|---|---|---|
| P1.1 | Canonical types, ID scheme, vocabulary, integrity, projection | Done. Schema v1 types; `PREFIX-nnn` IDs from project-wide counters that never decrease, hidden UUIDs; the full §6.1 relationship vocabulary (15 trace + 3 structure + 7 stakeholder types) with allowed pairs and impact direction; integrity rules I1–I13 (refuse on operation, report on load/import); projection onto `src/model/engineering.ts`; change impact (direction-aware, 3 hops, never deletes, never marks valid) | `src/project/model/{types,ids,vocabulary,integrity,ops,commit,impact,projection,create,milestones}.ts` |
| P1.2 | Storage adapter, provider, autosave, change sets, coalescing, snapshots, save status, tab lock, quota | Done. In-house IndexedDB adapter (`sysml-studio-projects` v1: meta, projects, changes, snapshots; one transaction per save with the rev check inside it) and memory adapter behind one contract; `ProjectStore` (React-independent) with 600 ms debounced autosave, flush on hide/pagehide/route change, keystroke coalescing (same fields, same editor, 60 s), undo by inverse operations, snapshots manual / milestone / pre-import / pre-restore / daily auto with retention 10/10/14, save failure with one retry then "Not saved: … — Export now", quota estimate and `persist()` request, Web Locks single writer with "Take over editing", BroadcastChannel refresh of read-only tabs | `src/project/store/*` |
| P1.3 | Week 1 adapter, legacy detection | Done. `toTeamRecord`, `diffTeamRecord`, `fromTeamRecord` (with ID repair for stored records), legacy detection of `wb-artefacts['w1.team']` | `src/project/adapters/{week1,week1Status,legacy}.ts` |
| P1.4 | Routes and pages | Done: `#/project` (create screen or overview), `/milestones[/:week]`, `/artifacts[/:type]`, `/artifact/:id`, `/history`, `/transfer`, `/model`; "My Project" in the global sidebar right after Dashboard and in every lecture-first top bar (Weeks 1–5, 8, lecture viewer, handout, reader, welcome) | `src/project/route.ts`, `src/project/pages/*`, `src/project/nav/MyProjectLink.tsx`; `src/App.tsx`, `src/flow/Chrome.tsx`, `src/lectures/Chrome.tsx` |
| P1.5 | Export + checksum, import pipeline (plan, three modes, pre-import snapshot), Markdown report | Done | `src/project/transfer/{exportProject,importProject,report}.ts`, `src/project/pages/{Transfer,ImportFlow}.tsx` |
| P1.6 | Week 1 lab tool on the project, workbench export without team data, handoff panel, explicit copy | Done | `src/project/adapters/{useTeamRecord.ts,TeamProject.tsx}`, `src/project/practice/*`; `src/workbench/week1/TeamView.tsx`, `src/workbench/WorkbenchShell.tsx`, `src/week1/{Examples,Lab,Workbench}.tsx` |
| P1.7 | Week 8 preview | Done (read-only, nothing stored, never Mapped) | `src/project/adapters/week8.ts`, `src/project/pages/ModelPreview.tsx` |
| P1.8 | E2E, axe, keyboard, student build check | Done | `e2e/project.spec.ts`, `scripts/check-student-build.mjs` |

### Screens (what a student sees)

- **Create screen**: team label, initials (2–4 letters, validated with `ownerProblem`), optional enterprise name; *Create an
  empty project*; *Create from the Week 1 Team Record found in this browser* (counts shown first; only when one exists);
  *Import a project or Week 1 file* (validation report shown before anything is created). The copy states the project
  is saved in this browser only and the export is the copy kept and submitted.
- **Overview**: the indigo title block (name, ENT-001, team and member count, approval exactly as recorded, revision, SoI
  with PRT/EXT counts, artifacts and review count, current milestone, last export), problem / mission / goals,
  milestone strip (14 linked cells, Phase I / Phase II, state in words), current-milestone panel with *Open the Week 1
  lab tool*, system boundary, team roles by initials, artifact cards (Week 1 types + an "upcoming" Week 2 card), save /
  export / *Save version* / recent changes. Empty fields say what to write and where; no AeroLink text anywhere.
- **Milestones**: all 14 weeks; Week 1 in full (expected artifacts with counts, the seven part checks as outstanding
  tasks, readiness exactly as `recordState`, Week 1 file export, "I uploaded the files to the LMS", exports recorded);
  Weeks 2–14 as upcoming with their expected artifacts (minimums read from the Week 2–5 lab briefs; Weeks 6, 7, 9–14
  marked provisional) and the Phase I week each Phase II week models.
- **Artifact library**: type cards; per type a table of ID, title, course checks (passing / failing with the first
  failing gate, computed by `team.ts`), review flag, provenance badge (own / imported / copied from practice), last
  revised (self-declared initials, date); search, show retired; REL and LNK relationship tables.
- **Artifact page**: fields read-only, relationships in and out as sentences with status, revision history, and *Edit in
  the Week 1 lab tool*, *Mark reviewed* (rationale required), *Retire* (reason required, ID stays taken), *Restore*,
  *Mark adapted* (copied practice items, only after their text was changed).
- **History**: every change set (time, initials marked "self-declared", source, summary, rationale, expandable field
  diffs with before → after); versions with *Restore as current* (confirmation + rationale, pre-restore snapshot, new
  change set) and *Export this version*; the self-declared editor (changeable), persistence and quota.
- **Export and import**: project JSON, readable report, Week 1 legacy files; import with the validation report → plan
  table (classes and per-item choices) → *Open as separate project* / *Merge* (disabled until every conflict has a
  choice) / *Replace* (type the project title); project switcher.
- **Week 8 preview**: left the Phase I package grouped by the MAPPING_KINDS rows (ENT, PRT, EXT, STK, CON, REL, MGO, NEED),
  right the target package/construct table and the generated SysML v2 text (labelled "not yet checked"), a status per
  artifact with the five statuses (each its own shape, colour and word), the "document / model element / traceable
  relationship" explainer, a detail panel with the reason, the generated lines and the audit findings.
- **Week 1 lab tool**: an indigo "Your enterprise · <name>" banner (linked, save status, *Undo last change*, *Open My
  Project*); without a project, "Not linked to a project" with *Create my project from this record*.
- **Practice → My Project handoff** at the end of `#/week/1/examples` (full) and at the top of `#/week/1/lab` (compact);
  the practice workbench (`#/week/1/examples/practice`) carries the plum hatched "Practice: AeroLink (instructor example,
  fictional)" banner, and its completion message now says "Now apply this engineering method to your own enterprise."

### Ownership identity and styling

All project styling is in one isolated sheet, `src/project/pages/project.css`, scoped to `.pj-scope` with `--pj-*`
tokens taken from `docs/ux/mockups/design-tokens.css`: indigo `#3d4ac4` (dark `#9aa4ff`) for My Project, plum `#8a3a78`
(dark `#e391cf`) with a hatched banner for AeroLink/practice, green for model surfaces, `--wb-*` neutrals and status
colours. Ownership is triple-coded (labelled banner, folder/target icon, accent); status colours are never used for
ownership; the minimum UI text size is 13 px. Faculty approval of the colours (D2) is pending: they are tokens, changed
in that one file. No existing page was restyled.

## 2. How the Week 1 handoff works

- `useTeamRecord()` (`src/project/adapters/useTeamRecord.ts`) is the lab tool's single read/write path. Project mode:
  the record is `toTeamRecord(doc)`; every `set(patch)` becomes `diffTeamRecord` operations applied as one change set
  (IDs are issued from the project counters because the projected record's `issued` equals the project's); export
  stamps go to Milestone 1 as a `SubmissionExport` with a `milestone` snapshot. Legacy mode (no project): unchanged
  behaviour on the workbench artefact.
- `TeamView` changes are limited to the hook swap, the export-stamp calls, the import routing and the banner; no check in
  `team.ts`, `needQuality.ts` or `stakeholders.ts` was touched.
- Free-text traces (need sources, concerns, goal) are kept as typed AND parsed into relationships (NEED derives-from
  STK/CON/MGO) with `sourcesOf` / `concernsOf`; unresolved tokens are kept in `unresolvedRefs`.
- **Import (audited silent overwrite fixed)**: project mode → the project import pipeline in a dialog (report, plan,
  explicit choice). Legacy mode → an empty record imports at once (nothing to overwrite, so the existing
  week1-flow walk-through is unchanged); a record with content is replaced only after a confirmation showing both, and
  the previous record is kept (`w1.team.previous`; Ctrl+Z also restores it).
- **Practice stays separate**: the project lives in IndexedDB; practice stays in localStorage. The workbench export no
  longer contains `w1.team`. Nothing writes practice data into the project except *Copy from practice*, which lists
  exactly what will be copied, warns, and needs a second confirmation; copies get new IDs, provenance
  `copied-from-practice` (AeroLink ID recorded) and a badge, and do not count toward the Week 1 minimums, the Week 1
  milestone, the legacy submission exports or the Week 8 generated text until adapted.

## 3. Deviations from the spec (and why)

1. **Legacy mirror of the Week 1 record.** While a project exists, `src/state/ProjectLegacyMirror.tsx` writes the
   projected record into `wb-artefacts['w1.team']`, and `WorkbenchProvider` overlays the projection on its in-memory
   artefacts. Reason: other readers still read that key (lab readiness panel `flow/CheckSubmit.RecordReadiness`, the
   Week 2 tool's "use the Week 1 record saved in this browser", the Week 1 missions, problems and tree). The mirror is a
   derived copy; the project never reads it back. The record found there before the first mirror is kept once under
   `w1-team-before-project` and offered under Export and import. To remove in P2 when those readers read the project.
   The spec said "the workbench `Doc` no longer contains the team record": the record is excluded from the workbench's
   undo snapshot instead, and project undo (banner button and Ctrl+Z outside text fields) handles it.
2. **Drafts of stakeholder relationships.** A REL row with a missing end or type is stored as a relationship with
   `draft: true` holding the typed text (integrity I4 applies once both ends resolve). Additive field.
3. **Additive schema fields**: `Team.prefixesText` (charter prefix lines as typed), `Milestone.contentUpdatedAt` (the
   Week 1 export check compares stamps with it, as `checkExported` compares with `updatedAt`), `Relationship.draft`;
   the export file adds `rev`. Validation snapshots in the export use the project's last change time as `checkedAt`
   so identical content exports identically.
4. **Replace / restore are recorded as one change set without operations** (the replaced content is the pre-import or
   pre-restore snapshot); counters never decrease, so no ID can be reused.
5. **Undo of a creation retires the item** (there is no delete operation, I13), so the ID stays taken.
6. **Change impact in P1** (roadmap P3.5 scope, brought forward because the directive's tests ask for it): applied
   automatically on material edits. "Material" excludes filling in a blank field (judged on the coalesced change set),
   so first authoring does not flood the review queue.
7. **Week 2–5 lab tools are not on the project yet** (P2); the mirror keeps the Week 2 "use the saved Week 1 record"
   button working.
8. The create-from-file path shows the validation report and needs a confirmation; with no current project there is
   nothing to plan against.

## 4. Tests run (real results)

Unit (Vitest, run 2026-10-19): `npx vitest run src/project` → **5 files, 43 tests passed**.

| Directive §12 / roadmap test | Where | Result |
|---|---|---|
| P1-T1 project creation (empty; from stored record; from week1-model-inputs v1, v2, v3) | `store.test.ts`, `week1.test.ts`, `transfer.test.ts`; e2e create flows | pass |
| P1-T2 persistence (create, edit, new store on the same storage → same content and rev; contract suite on memory AND IndexedDB via fake-indexeddb) | `store.test.ts` | pass |
| P1-T3 saving/editing (lab tool edit → library, overview, history with self-declared initials) | e2e demo | pass |
| P1-T4 stable IDs (retire STK-003 → next is STK-00(n+1); no reuse; export/import keeps IDs and uids) | `week1.test.ts`, `model.test.ts`, `transfer.test.ts` | pass |
| P1-T5 valid relationships (every allowed pair accepted, every disallowed pair refused with its sentence, generated from the table: >300 accepted, >10 000 refused) | `model.test.ts` | pass |
| P1-T6 referential integrity (missing uid, self, duplicate refused; retiring turns links suspect, removes none) | `model.test.ts`, `week1.test.ts` | pass |
| P1-T7 round trip `toTeamRecord(fromTeamRecord(fixture))` = `normalizeTeam(fixture)`; every part check equal | `week1.test.ts` | pass |
| P1-T8 / T-C11 export → import as separate → export equal apart from exportedAt/integrity; checksum mismatch reported | `transfer.test.ts` | pass |
| P1-T9 overwrite protection (plan classes; conflicts need a choice; Replace needs the typed title; pre-import snapshot restores) | `transfer.test.ts`, `store.test.ts`, e2e | pass |
| P1-T10 practice vs project isolation (no AeroLink content in a new project; import boundary of `src/project/**`; workbench export without `w1.team` by construction) | `isolation.test.ts` | pass |
| P1-T11 copy from practice (confirmation, new IDs, provenance, not counted until adapted) | `isolation.test.ts`, e2e | pass |
| P1-T12 Week 1 data in the Week 8 preview (T-C1 `sourceFromProject` = `sourceFromTeam`; T-C2 identical generated text; statuses, never Mapped) | `isolation.test.ts`, e2e demo step 8 | pass |
| Need/requirement change flags downstream links "needs review" (direction-aware; parent not flagged; clearing needs a rationale) | `model.test.ts` | pass |
| P1-T13 storage failure (memory fallback banner + export works; failing disk → "Not saved") | `store.test.ts`, e2e | pass |
| P1-T14 student build separation (project present in both builds, no faculty markers in `dist-student/`) | `npm run build:student` | PASS |
| P1-T15 accessibility and keyboard (axe WCAG 2.1 A/AA on create, overview, milestones, Week 1 and Week 9 milestone, library, artifact page, history, transfer, Week 8 preview, the two handoff pages; light and dark; 1440 and 400 px; no horizontal scroll; keyboard create + tab order) | e2e | pass (0 violations) |
| P1-T16 directive §13 demo flow | e2e demo | pass |
| Second-tab read-only lock and take-over | e2e | pass |

End-to-end (Playwright, Chrome, workers=1): see §6 "Gates" for the final run counts.

## 5. Known limits

- Browser storage only (faculty decision F10): clearing site data, another browser or computer means an empty store;
  the export is the durable copy, and the UI says so on the create screen, overview, save-status tooltip and History.
- Attribution is self-declared initials, can be wrong or misused; labelled "self-declared" everywhere.
- The checksum detects corruption and hand edits, not deliberate tampering.
- Merging two teammates' projects is by file and plan, not live collaboration; without history in the file, every
  differing item is a conflict for the student to decide.
- Weeks 2–14 are shown as upcoming only; their lab tools join in P2/P5. Generic artifact editors (P2.8) are not built:
  all content editing goes through the Week 1 lab tool.
- After a page is restored from the back/forward cache the writer lock may be with another tab; the page then shows
  read-only with *Take over editing*.
- The Week 8 preview stores no mapping and never shows Mapped (P3 adds confirmation).
- `src/content/content.test.ts` "readings export matches the register (140 entries)" fails in the full run because the
  readings register now has 145 entries from the Week 6 lecture workstream (not touched by this work).

## 6. Gates (run at the end of P1)

See the final message of this increment for the exact counts; recorded here:

- `npx tsc -b`: exit 0.
- `npx oxlint src`: 0 errors (39 warnings, all `only-export-components` / one `purity` false positive in an event handler; none new errors).
- `npx vitest run`: 104 files, 2222 passed, 1 failed (the readings-count test of another workstream, above).
- `npm run build`: built. `npm run build:student`: student build check PASS, My Project present in both builds (4 of 4 markers).
- Playwright: listed in §7.

## 7. Playwright results

Final run 2026-10-19, `npx playwright test e2e/project.spec.ts e2e/week1-flow.spec.ts e2e/app.spec.ts --workers=1`
(Chrome, dev server on 5173, `_source_cache/.playwright.lock` protocol): **31 tests, 30 passed, 1 failed (8.1 min)**.

- `e2e/project.spec.ts`: **11 of 11 passed** — the demo workflow, overwrite protection, lab-tool import routing (project
  and legacy), copy from practice, storage fallback and failure, second-tab lock, keyboard, and axe on every new page in
  light and dark at 1440 and 400 px (0 violations, no horizontal scroll).
- `e2e/week1-flow.spec.ts`: **10 of 10 passed** (the legacy-mode lab tool import, readiness and exports unchanged).
- `e2e/app.spec.ts`: 9 of 10 passed. Failing: "every week, the roadmap and the reference pages render without errors"
  at Week 8, which expects the old rebuild notice but Week 8 opens on its lecture-first page; the test has no Week 8
  branch at HEAD (pre-existing, not caused by this work; the fix is one `if (n === 8)` branch like Weeks 2–5, left to the
  owning workstream).

Screenshots of the demo and of every page in both themes are in `screenshots/project-demo/` (numbered demo frames
`01-…png` to `18-…png`, `axe-*` page captures), with the animated walk-through `screenshots/project-demo/project-demo.gif`.

## 8. Faculty decisions F1–F10 as implemented (defaults, pending approval)

| ID | Default implemented | Where to change |
|---|---|---|
| F1 | The graded artifact is the LMS upload; the project is the working copy. Milestone 1 says so; "I uploaded the files" is the student's own note | `pages/Milestones.tsx` |
| F2 | Self-declared initials are recorded on every change set and labelled "self-declared"; a non-member's initials are accepted with an advisory | `store/ProjectStore.ts`, `pages/History.tsx` |
| F3 | Enterprise approval stays the team's recorded decision and date (Week 1 Part 2), shown "as recorded by the team" | `pages/Overview.tsx` |
| F4 | Copying AeroLink practice stakeholders allowed as templates, flagged, not counted until adapted; the panel shows "Pending faculty decision F4" | `practice/copyFromPractice.ts` `COPY_FROM_PRACTICE_ENABLED` (false removes the button; the panel stays) |
| F5 | The per-week JSON files keep working: Week 1 legacy exports from My Project and the lab tool; week1-model-inputs v1–3 import | `pages/actions.ts`, `transfer/importProject.ts` |
| F6 | New prefixes (TRD, EVD, PKG, ANL, RID) exist in the type registry; kinds without a Week 8 rule show "Not mapped" | `model/vocabulary.ts`, `adapters/week8.ts` |
| F7 | Initials only: no full-name field anywhere (`Member.displayName` exists in the schema but is never asked for) | `pages/CreateProject.tsx` |
| F8 | Instructor review mode not changed (not implemented without approval) | — |
| F9 | Week 8 preview = mapping table + generated text in the app; editing in external tooling | `pages/ModelPreview.tsx` |
| F10 | Local-only storage; no share/invite/sync wording; backend documented as future work in the architecture | `store/*` |

## 9. Dependency added

- `fake-indexeddb` 6.2.6 (Apache-2.0, free), **devDependency only**: lets the same storage-adapter contract suite run
  against IndexedDB in Vitest (jsdom has no IndexedDB). Not in any shipped bundle. The production adapter is in-house.

## 10. Files

New: `src/project/**` (model, store, adapters, transfer, pages, practice, nav, route, tests), `src/state/ProjectLegacyMirror.tsx`,
`e2e/project.spec.ts`, `docs/project/P1_IMPLEMENTATION_REPORT.md`, `screenshots/project-demo/*`.
Modified (additive): `src/App.tsx` (route, sidebar entry), `src/state/Providers.tsx` (provider, mirror), `src/flow/Chrome.tsx`
and `src/lectures/Chrome.tsx` (My Project link), `src/workbench/WorkbenchProvider.tsx` (projection overlay),
`src/workbench/WorkbenchShell.tsx` (practice export without `w1.team`), `src/workbench/week1/TeamView.tsx` (hook swap,
import routing, banner), `src/week1/{Examples,Lab,Workbench}.tsx` (handoff panel, practice banner, completion text),
`scripts/check-student-build.mjs` (project markers), `package.json` / `package-lock.json` (fake-indexeddb).
