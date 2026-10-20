# Updated Implementation Roadmap (My Project workspace, P1–P5)

**Status:** plan, written 2026-10-19 (Monday) under DECISION_LOG A22. Supersedes the application parts of
`IMPLEMENTATION_ROADMAP.md` for the workspace; lecture milestones stay as in `COURSE_PRODUCTION_PLAN.md` (M1–M6).
Deadline **2026-12-01**. Design inputs: `PROJECT_WORKSPACE_ARCHITECTURE.md` (architecture), `CANONICAL_ENGINEERING_DATA_MODEL.md`
(data model), `CROSS_PHASE_TRACEABILITY_PLAN.md` (trace plan), `UI_UX_REDESIGN_PROPOSAL.md` (visual system; written
separately). Paths are relative to `learning-studio/`.

**Effort unit:** engineer-days (ed) of focused implementation including tests. Calendar dates assume about 1.5 ed per
working day of app capacity (one engineer plus agent assistance), separate from lecture production capacity. Estimates
are planning figures, not commitments; each increment is reviewed before the next starts.

**Process rules:** local git only, never pushed; the faculty owner commits; reversible technical decisions are made by
the engineer and logged; academic-scope and data/security decisions go to faculty (§7). No test is reported as passed
unless it was run.

---

## 1. Timeline at a glance

| Dates (2026) | App workstream (this plan) | Lecture workstream (`COURSE_PRODUCTION_PLAN.md`) |
|---|---|---|
| Oct 20 – Oct 30 | **P1** minimal My Project (demo checkpoint **Oct 26**: create project, Week 1 lab writes to it, save, overview, export) | M1 Week 1 package (to Oct 25); M2 template approved (Oct 26–28) |
| Oct 31 – Nov 11 | **P2** milestones, Weeks 2–5 editors on the project, Practice → Project handoffs, Phase I package export | M3 Phase I: Weeks 6 and 7 packages (Oct 29 – Nov 8), Weeks 2–5 fixes from reviews |
| Nov 2 – Nov 22 (slices) | **P4** visual system and UX applied in slices (per `UI_UX_REDESIGN_PROPOSAL.md`), never blocking lectures | — |
| Nov 9 – Nov 19 | **P3** Week 8 baseline transformation on the project, mapping statuses, traceability and impact explorer | M4 Phase II: Weeks 9–13 packages with checker runs (Nov 9–22) |
| Nov 16 – Nov 26 | **P5** Weeks 6, 7, 9–14 milestones and editors (as their lecture packages land), continuity tests | M4 Week 14 |
| Nov 23 – Nov 27 | Integration, full e2e + axe, student build check, bug fixes; **feature freeze Nov 27** | M5 integration and QA |
| Nov 28 – Nov 30 | Submission build, exports, known-limitations update | M6 submission package |
| Dec 1 | Submission | Submission |

How the two workstreams avoid collisions (file ownership):

| Area | Owner |
|---|---|
| `src/content/lectures/**`, `src/week{N}/Examples.tsx`, `docs/lectures/**`, `sysml/**`, `public/lectures/**` | Lecture workstream |
| `src/project/**` (new), `src/workbench/week{1..5,8}/*LabTool.tsx` and `TeamView.tsx` (hook swap only), `src/App.tsx` routing, `src/week{N}/WeekShell.tsx` (one nav link) | App workstream |
| `labBrief.ts` files | Lecture workstream; the app reads them and never edits them |
| Old-outline draft modules with uncommitted edits (`src/activities/week11/*`, `week12/*`, `src/content/weeks/week09/11/12.ts`) | Their current workstream; the app does not touch them |

---

## 2. P1 — Project architecture, canonical schema, My Project, Week 1 handoff, export/import (Oct 20 – Oct 30)

### 2.1 Increments

| Inc. | Scope | Files (create / modify) | Depends | Effort |
|---|---|---|---|---|
| P1.1 | Canonical types, ID scheme, vocabulary, integrity, projection | create `src/project/model/{types,ids,vocabulary,integrity,projection}.ts` + `*.test.ts` | — | 1.5 ed |
| P1.2 | Storage adapter (IndexedDB + memory), `ProjectProvider` (apply ops, autosave, change sets, coalescing, snapshots, save status, tab lock, quota) | create `src/project/store/{adapter,indexedDb,memory,revisions}.ts`, `ProjectProvider.tsx`, tests; modify `src/state/Providers.tsx` (add provider) | P1.1 | 2.0 ed |
| P1.3 | Week 1 adapter: `fromTeamRecord`, `toTeamRecord`, `diffTeamRecord`; legacy detection of `wb-artefacts['w1.team']` and `week1-model-inputs` v1–3 | create `src/project/adapters/{week1,legacy}.ts` + tests | P1.1 | 1.5 ed |
| P1.4 | Routes and pages: overview, milestone strip, artifact library (Week 1 types), artifact page, history; nav entries | create `src/project/pages/{ProjectApp,Overview,MilestoneStrip,Library,ArtifactPage,History}.tsx`, `src/project/route.ts`; modify `src/App.tsx`, `src/week{1,2,3,4,5,8}/WeekShell.tsx` | P1.2 | 2.0 ed |
| P1.5 | Export (+ checksum), import pipeline (plan, three modes, pre-import snapshot), Markdown report | create `src/project/transfer/{exportProject,importProject,report}.ts`, `src/project/pages/Transfer.tsx` + tests | P1.2, P1.3 | 1.5 ed |
| P1.6 | Week 1 lab tool writes to the project (`useTeamRecord`); workbench export no longer contains team data; Practice → My Project handoff panel for Week 1 with explicit copy | create `src/project/adapters/useTeamRecord.ts`, `src/project/practice/{Handoff.tsx,handoffs.ts,copyFromPractice.ts}`; modify `src/workbench/week1/TeamView.tsx` (l.161–183), `src/workbench/WorkbenchShell.tsx` (l.188), `src/week1/Examples.tsx` (append panel; coordinate with lecture workstream), `src/week1/Workbench.tsx` | P1.3, P1.4 | 1.5 ed |
| P1.7 | Week 8 preview (read-only): `sourceFromProject` + existing generator, left/right view with proposed statuses | create `src/project/adapters/week8.ts`, `src/project/pages/ModelPreview.tsx` + test | P1.3 | 1.0 ed |
| P1.8 | End-to-end demo flow, axe, keyboard, student build check | create `e2e/project.spec.ts`; modify `scripts/check-student-build.mjs` (project markers, §2.3 P1-T14) | all | 1.0 ed |
| | **Total** | | | **12 ed** |

Demo checkpoint Oct 26: P1.1–P1.4 and the TeamView part of P1.6. Remaining increments by Oct 30.

### 2.2 P1 build spec

**Routes** (`src/project/route.ts`, matched in `App.tsx` before the week routes, rendered lazily in its own shell):

| Path | Page |
|---|---|
| `#/project` | Overview (or the create screen when no project exists) |
| `#/project/milestones/:week` | Milestone detail (P1: Week 1 full; others: expected artifacts list and "opens in week N") |
| `#/project/artifacts` and `#/project/artifacts/:type` | Library; P1 types: ENT, MGO, PRT, EXT, STK, CON, NEED, plus relationships (REL, LNK) |
| `#/project/artifact/:id` | Artifact page (by course ID) |
| `#/project/history` | Change log and versions |
| `#/project/transfer` | Export, import, project switcher |
| `#/project/model` | Week 8 preview (read-only in P1) |

**Navigation.** `NAV` in `App.tsx` gains `{ to: '/project', label: 'My Project' }` directly after Dashboard, outside
any week section. Each lecture-first `WeekShell` (`src/week{1..5,8}/WeekShell.tsx`) shows a persistent "My Project"
link beside the week sub-navigation (placement and style: `UI_UX_REDESIGN_PROPOSAL.md`). Project pages show the team's
enterprise name in the header; practice pages show "Practice: AeroLink (instructor example)".

**Create screen** (no project in the store):
- Fields: team label ("Team 07"), your initials (2–4 letters, `ownerProblem`), enterprise working name (optional).
- Actions: **Create an empty project**; **Create from the Week 1 Team Record found in this browser** (shown only if
  `wb-artefacts['w1.team']` normalizes to a record with a name or any row; shows its counts first); **Import a project or
  Week 1 file**.
- Copy states plainly: "Your project is saved in this browser only. Export it after every working session; the export is
  the copy you keep and submit."

**Overview** (`Overview.tsx`): enterprise name, domain, problem statement, mission (MGO-001), goals, SOI statement with
PRT count and EXT count; team members (initials) with roles from the charter; approval status exactly as recorded
(`approvalOf(proposal)`: approved with date / submitted for approval / not recorded / revise); milestone strip; open
review flags count; save status; last export time; buttons: Open Week 1 lab tool, Export project, Save version. Empty
fields show what to write and where ("Mission: one sentence, written in the Week 1 lab tool, Part 2"), never AeroLink
text.

**Milestone strip** (`MilestoneStrip.tsx`): 14 cells grouped Phase I / Phase II, each with week number, whiteboard
title (`WEEKS` in `src/content/course.ts`) and state. P1 computes Week 1 from the projected Team Record:
`not-started` (no Week 1 artifacts), `in-progress`, `checks-passing` (`partsComplete`), `exported` (an export at the
current rev), with the Week 1 `pending-approval` label when `approvalOf` ≠ approved, exactly as `recordState`. Weeks 2–14
show `not-started` or "record found in this browser (not yet in your project)" when `w{N}.record` exists (import is P2).
Keyboard: the strip is a list of links; state is given in text, never color alone.

**Library and artifact page.** The library table per type: ID, title, validation (passing/failing with the first
failing gate), review flag, provenance badge (own / imported / copied from practice), last revised (initials, date).
The artifact page shows fields read-only, relationships in and out (type as a sentence, other end, rationale, status),
its revision history, and actions: **Edit in the Week 1 lab tool** (deep link to the part), **Mark reviewed**
(rationale required, clears a needs-review flag), **Retire** (reason required; the ID stays taken). In P1 all content
editing goes through the Week 1 lab tool so there is one editor and one set of checks.

**Save and autosave.** As architecture §5.3: operations through `ProjectProvider.apply`, debounce 600 ms, flush on
hide/route change, one transaction per save (`ProjectDoc` + `ChangeSet`). Save status component in the project header
and in the Week 1 lab tool frame: "Saved 14:02" / "Saving…" / "Not saved: <reason> — Export now".

**Revision log** (`History.tsx`): list of change sets (time, initials marked "self-declared", source, summary,
expandable field diffs with before/after); versions list (manual, milestone, pre-import, auto) with **Restore as current**
(confirmation, `pre-restore` snapshot, restore recorded as a new change set) and **Export this version**.

**Export / import** (`Transfer.tsx`):
- Export project (`sysml-studio-project` v1, data model §10.1), Export readable report (.md), Export Week 1 legacy files
  (`teamMarkdown`, `teamModelInputs` v3 from `toTeamRecord`). Each export records a `SubmissionExport` on Milestone 1
  and a `milestone` snapshot.
- Import: file picker → validation report (errors with paths, warnings, checksum result) → plan table (new / identical /
  changed / conflict / ID collision / broken, data model §10.3) → choose **Open as separate project**, **Merge**
  (per-item choice for conflicts and collisions), or **Replace** (type the project title to confirm) → apply with a
  `pre-import` snapshot. Accepts `sysml-studio-project` v1 and `week1-model-inputs` v1–3 in P1.

**Week 1 lab tool writes to the project** (`useTeamRecord.ts`):

```ts
export function useTeamRecord(): readonly [TeamRecord, (patch: Partial<TeamRecord>) => void, 'project' | 'legacy'] {
  const project = useProjectOptional()                 // null when no project exists or the provider is absent
  const wb = useWorkbench()
  if (!project) return [teamArtefact(wb.state.artefacts), legacySet(wb), 'legacy'] as const
  const rec = useMemo(() => toTeamRecord(project.doc), [project.doc])
  const set = useCallback((patch: Partial<TeamRecord>) => {
    const after = normalizeTeam({ ...rec, ...patch })
    project.apply(diffTeamRecord(project.doc, rec, after), { source: 'editor', summary: summarize(rec, after) })
  }, [project, rec])
  return [rec, set, 'project'] as const
}
```

- `TeamView` replaces `teamArtefact(wb.state.artefacts)` and the three `wb.setArtefact(TEAM_KEY, …)` calls with the
  hook; export timestamps go to Milestone 1 instead of the record. Nothing else in `TeamView` or `team.ts` changes.
- In legacy mode (no project) the tool shows a banner: "Not linked to a project. Create your project to keep this work
  with the rest of the course" with the create-from-this-record action.
- IDs are issued by `diffTeamRecord` from the project counters (`nextId` of the project), not the record's `issued`.
- The Team Record JSON import button in `TeamView` routes to the project import pipeline (validation report, plan,
  confirmation) instead of replacing the record.
- The workbench's undo (Ctrl+Z) in the lab tool: in project mode, undo/redo of Team Record edits uses the project's
  inverse operations (one change set back); the workbench `Doc` no longer contains the team record.

**Workbench export fix.** `WorkbenchShell.tsx` l.188 exports artefacts without the `w1.team` key; label unchanged
("Practice workbench export").

**Practice → My Project handoff panel, Week 1** (`Handoff.tsx`, data in `handoffs.ts` built from
`src/content/lectures/week01/labBrief.ts`): shown at the end of `#/week/1/examples`, in the practice workbench when every
practice mission is complete (via `PracticeLinks.completeText` area), and at the top of `#/week/1/lab`. Content:

1. "Now apply this engineering method to your own enterprise."
2. What to create: charter, enterprise proposal (ENT, MGO, PRT), context (≥ 6 EXT), stakeholder register (≥ 8 STK in
   ≥ 3 role groups, concerns), relationships (≥ 3, ≥ 1 conflict), needs (≥ 8 from ≥ 5 stakeholders; 6 from 4 for a
   three-person team) — numbers read from `LAB_MINIMUMS` / `LAB_MINIMUMS_THREE`, never retyped.
3. Prior artifacts needed: none (Week 1 starts the project).
4. How to create and edit: "Open the Week 1 lab tool" (deep link) and where each item appears in My Project.
5. How it connects: needs trace to stakeholders, concerns and the mission or a goal; these become the Week 8 model
   (link to `#/project/model`).
6. How completion is determined: the part checks of the lab tool (listed by name) and the instructor's approval.
7. Evidence to submit: the Week 1 Markdown record and model inputs, exported from My Project, uploaded to the LMS.
8. Optional: **Copy from practice…** (stakeholders only in P1): select AeroLink practice stakeholders → confirmation
   dialog listing them with the warning text (architecture §6) → copied as new STK IDs with provenance
   `copied-from-practice`, badge, not counted toward minimums until edited and marked adapted (pending faculty decision
   F4; if F4 says no copying of AeroLink content, the button is removed and the panel stays).

**Week 8 preview** (`ModelPreview.tsx`): left, the project's Week 1 artifacts grouped by `MAPPING_KINDS` row (ENT, PRT,
EXT, STK, CON, REL, MGO, NEED) with IDs and titles; right, the target package and construct for each row and the
generated SysML v2 skeleton text (`generateSysml(sourceFromProject(doc))`, read-only, labeled "generated text, not yet
checked"); per-artifact status computed as Mapping proposed / Invalid or incomplete (from `auditFindings`) / Not mapped;
a banner: "Preview. In Week 8 you confirm each mapping and run the course checker." No status is stored in P1.

### 2.3 P1 acceptance tests (directive §12)

| ID | Test | Level |
|---|---|---|
| P1-T1 | Project creation: empty project; from the stored Week 1 record; from a `week1-model-inputs` v1, v2, v3 file (fixtures) | unit + e2e |
| P1-T2 | Persistence: create, edit, reload the page → same content and rev; IndexedDB adapter and memory adapter pass the same contract suite | unit + e2e |
| P1-T3 | Saving/editing: an edit in the Week 1 lab tool appears in the library and overview; a change set with the self-declared initials is in History | e2e |
| P1-T4 | Stable IDs: delete (retire) STK-003, add a stakeholder → STK-00(n+1), never STK-003; export/import keeps every ID and uid | unit |
| P1-T5 | Valid relationships: every disallowed pair in the vocabulary is refused with its sentence message; every allowed pair accepted (generated from the table) | unit |
| P1-T6 | Referential integrity: relationship to a missing uid refused; retiring an artifact turns its relationships suspect, removes none | unit |
| P1-T7 | Round trip: `toTeamRecord(fromTeamRecord(teamFixture))` deep-equals `normalizeTeam(teamFixture)` (export stamps excluded); all `team.test.ts` part checks give the same results on the projected record | unit |
| P1-T8 | Export and reimport: export → import as separate project → export again → equal except `exportedAt` and integrity; checksum mismatch after a hand edit is reported, not ignored | unit |
| P1-T9 | Overwrite protection: Replace requires the typed title; a `pre-import` snapshot exists after every merge/replace; restoring it returns the previous state; no import path writes without the plan step | unit + e2e |
| P1-T10 | Practice vs project isolation: practice edits (stakeholder editor, workbench missions, reset) leave the project document byte-identical; a new project contains no AeroLink names or reference IDs; the workbench export contains no `w1.team`; `src/project/**` import-boundary test | unit + e2e |
| P1-T11 | Copy from practice: nothing is copied without the confirmation; copied items carry provenance and new IDs; they do not count toward minimums until adapted | unit + e2e |
| P1-T12 | Week 1 data available in the Week 8 preview: the stakeholders and needs created in the e2e flow appear on the left and in the generated text (T-C3 subset) | e2e |
| P1-T13 | Storage failure: with the memory fallback forced, the banner shows and export still works; a forced write failure shows "Not saved" | unit + e2e |
| P1-T14 | Student build separation: `npm run build:student` passes; the project pages are present in both builds; no faculty-note marker in `dist-student/` | build script |
| P1-T15 | Accessibility and keyboard: axe on `#/project`, library, artifact page, history, transfer, preview in light and dark (0 violations); the demo flow completes with keyboard only | e2e |
| P1-T16 | Demo flow (directive §13): Week 1 lecture → AeroLink practice → My Project → create enterprise → save stakeholders and needs → milestone progress → export and restore → Week 8 preview | e2e |

Existing gates must stay green: `npm run typecheck`, `npm test`, `npm run build`, `npm run build:student`,
`npm run test:e2e`.

---

## 3. P2 — Milestones, weekly editors, Practice → Project, Phase I package export (Oct 31 – Nov 11)

| Inc. | Scope | Files | Depends | Effort |
|---|---|---|---|---|
| P2.1 | Week 2 adapter + `useWeekRecord(2)`; Week 2 lab tool in project mode (snapshot fields projected; import step replaced) | create `src/project/adapters/week2.ts`; modify `src/workbench/week2/Week2LabTool.tsx` (state/save pair, import handlers) | P1 | 2.0 ed |
| P2.2 | Week 3 adapter (TRD creation, A/U merge with Week 2) | `adapters/week3.ts`; modify `Week3LabTool.tsx` | P2.1 | 2.0 ed |
| P2.3 | Week 4 adapter (EXT collision rule, DEC, INFO flows, VP frames) | `adapters/week4.ts`; modify `Week4LabTool.tsx` | P2.2 | 2.0 ed |
| P2.4 | Week 5 adapter (CMP, IF connects/carries, REQ-SYS continuation, ICR) | `adapters/week5.ts`; modify `Week5LabTool.tsx` | P2.3 | 2.0 ed |
| P2.5 | Legacy import of `week2..5-model-inputs` and stored `w{N}.record` with plan/collisions | extend `adapters/legacy.ts`, `transfer/importProject.ts` | P2.1–P2.4 | 1.0 ed |
| P2.6 | Milestone detail pages Weeks 1–7 (expected artifacts from each `labBrief.ts`, outstanding gates, readiness, export for submission, mark submitted) | `pages/Milestones.tsx`, `model/milestones.ts` | P2.1–P2.4 | 1.5 ed |
| P2.7 | Handoff panels Weeks 2–5 (data-driven) on Examples and Lab pages | extend `practice/handoffs.ts`; modify `src/week{2..5}/Examples.tsx`, `Lab.tsx` (coordinate) | P2.6 | 1.0 ed |
| P2.8 | Generic artifact editors for the library (form per type from `vocabulary.ts` attribute specs; relationship editor with allowed-pair picker and rationale) | `pages/ArtifactEditor.tsx`, `pages/RelationshipEditor.tsx` | P1 | 2.0 ed |
| P2.9 | Phase I package: `PKG-001` manifest + milestone snapshot + export (`scope: "phase1-package"`) + combined Markdown package | `transfer/package.ts` | P2.6 | 1.0 ed |
| P2.10 | History compare (two versions, per-artifact diff) | `pages/History.tsx` | P1 | 0.5 ed |
| | **Total** | | | **15 ed** |

Acceptance (in addition to keeping P1 tests green):

- P2-T1 Round trip per week: `toWeekNRecord(fromWeekNRecord(fixture))` equals the normalized fixture; every
  `record.test.ts` check gives the same result on the projected record (fixtures: create one passing fixture per week
  for the food-bank team, continuing `teamFixture.ts`).
- P2-T2 Cross-week continuity (T-C8): edit a Week 1 need in the project → Week 2 tool shows it with no import; edit a
  Week 2 requirement → Weeks 4–5 snapshot fields show it.
- P2-T3 ID collisions: Week 4 `EXT-001` with a different name than Week 1 `EXT-001` is renumbered in the plan, with
  references rewritten; same name merges.
- P2-T4 Free-text parsing: unresolved tokens kept in `unresolvedRefs` with a validation issue, never dropped.
- P2-T5 Phase I package export contains exactly the Phase I artifacts and relationships and reimports cleanly.
- P2-T6 Handoff panels: each lists prerequisites that exist in the project and links to the right editor (e2e Week 2).
- P2-T7 Accessibility/keyboard on the new pages.

---

## 4. P3 — Week 8 baseline transformation, MBSE mapping, traceability and impact (Nov 9 – Nov 19)

| Inc. | Scope | Files | Depends | Effort |
|---|---|---|---|---|
| P3.1 | `sourceFromProject` with Weeks 2–7 kinds (replaces `ManualRow`), model elements recorded from generator output | extend `adapters/week8.ts`; small additive change in `src/workbench/week8/skeleton.ts` (return declared IDs) | P2 | 1.5 ed |
| P3.2 | Mapping store and status derivation (trace plan §4.4); confirm/reject/custom rule; findings with dispositions | `model/mapping.ts`, `pages/ModelTransform.tsx` | P3.1 | 2.0 ed |
| P3.3 | Week 8 lab tool in project mode (opens the transformation view; legacy file path kept) | modify `src/workbench/week8/Week8LabTool.tsx` | P3.2 | 1.0 ed |
| P3.4 | Insufficiency findings (trace plan §4.3) | `model/insufficiency.ts` | P3.1 | 1.0 ed |
| P3.5 | Change impact (`impact.ts`), review queue, suspect links, clear with rationale | `model/impact.ts`, `pages/Trace.tsx` | P1 | 1.5 ed |
| P3.6 | Trace explorer: matrix by journey step, orphans/childless, digital threads over the projection | `pages/Trace.tsx` | P3.5 | 1.5 ed |
| P3.7 | Checker acceptance recording (team records an accepted run; conformance labels) | `pages/ModelTransform.tsx` | P3.2 | 0.5 ed |
| | **Total** | | | **9 ed** |

Acceptance: T-C1 to T-C7, T-C9 to T-C12 (trace plan §7); P3-T1 the generated `.sysml` from the AeroLink case through
the project path matches the checked file `sysml/lectures/week08/` (existing staleness test still passes); P3-T2 no
status becomes Mapped without `confirmedBy`; P3-T3 a Week 1 edit after confirmation turns its mapping Needs review.

---

## 5. P4 — Visual system and UX (Nov 2 – Nov 22, in slices)

Defined by `UI_UX_REDESIGN_PROPOSAL.md`. This plan only fixes the constraints: applied in slices (tokens and type
scale → navigation and project shell → project pages → week shells → lecture reader/slide mode → onboarding and
tooltips), each slice with axe light/dark and keyboard checks and screenshot review; lecture content files are not
edited for styling; no slice may land in the week a lecture package is under faculty review for the same pages.
Effort: to be estimated in the proposal; this plan reserves **8 ed**.

---

## 6. P5 — Extend to all 14 weeks; continuity and content integration (Nov 16 – Nov 26)

| Inc. | Scope | Effort |
|---|---|---|
| P5.1 | Week 6 (INC roadmap editor: table + delivers/precedes) and Week 7 (baseline review: PKG, RID log) milestones, once their lecture packages define lab minimums | 2.0 ed |
| P5.2 | Weeks 9–13: milestone definitions from their lab briefs; per-week views over mappings (requirements with derivation/satisfy plan; FN/LOG/SCN behavior mapping; PHY/IF ports; VER/EVD; ANL) as tables plus generated text where the Week 8 generator pattern extends | 4.0 ed |
| P5.3 | Week 14: integrated review page (continuity from PKG-001 baseline to the model, open flags, mapping coverage) and final export | 1.0 ed |
| P5.4 | Full continuity e2e (one fictional team, Weeks 1 → 14 seeded fixtures), performance check with a large project (≥ 600 artifacts, ≥ 1500 relationships) | 1.5 ed |
| | **Total** | **8.5 ed** |

Acceptance: realistic end-to-end student workflow across weeks (directive §12), cross-week continuity, accessibility
and keyboard on every new page, student build check.

---

## 7. Decisions needing faculty approval

Academic scope:

| ID | Decision | Default the plan assumes until decided |
|---|---|---|
| F1 | The graded artifact remains the files uploaded to the LMS (exported from My Project); the in-browser project is the working copy, not the submission | Yes |
| F2 | Self-declared editor initials are acceptable as the "who changed what" record for individual accountability (W7 convention), knowing they are not authenticated | Yes, labeled self-declared |
| F3 | The instructor's enterprise approval stays a team-recorded decision and date (as in the Week 1 tool), confirmed by the instructor outside the app | Yes |
| F4 | Copying AeroLink practice items into a project is allowed as templates, flagged, and not counted until adapted (stakeholders only in P1) | Allowed with flag; remove if faculty object |
| F5 | Teams may keep using the per-week JSON files during the transition (both paths supported until Nov 27) | Yes |
| F6 | New course ID prefixes and Week 8 mapping rules: TRD (trade study), EVD, PKG, ANL, RID, and rules for CONOPS, CMP, VP, FG, AI, I, ICR (trace plan §4.2); "covers" as a course-only trace | Proposed; implemented as `unmapped` until approved |
| F9 | How much in-app SysML authoring Weeks 9–13 require (generated text and mapping tables in-app vs. modeling in the external pilot tooling) | Mapping tables + generated text in-app; editing in external tooling |

Data and security:

| ID | Decision | Default |
|---|---|---|
| F7 | Store member initials only (no full names) in projects and exports, given files are emailed/uploaded and no data-protection review has been done | Initials only; optional display name hidden behind a warning |
| F8 | Hide instructor review mode in the student build (reviews stored in a student's browser carry no authority) | Proposed, not implemented without approval |
| F10 | Local-only storage for this term; a shared backend (SSO, access control, conflict resolution, data-protection review) is documented as future work and not built | Yes |

Reversible technical decisions taken by the engineer (logged, no approval needed): IndexedDB with in-house adapter and
memory fallback; optional `fake-indexeddb` dev dependency (free); multiple projects per browser; Web Locks single-writer
tabs; snapshot retention numbers; checksum algorithm; route names.

---

## 8. Risks and what drops first

| Risk | Likelihood | Effect | Mitigation |
|---|---|---|---|
| Lecture production for Weeks 6–14 absorbs the shared reviewers | High | P2/P5 slip | File-ownership split (§1); app increments reviewed by tests, not faculty, except decisions F1–F10 |
| Adapter edge cases in Weeks 3–5 (collisions, free text) | Medium | P2 slips | Fixture per week first; plan step shows every change before it applies |
| IndexedDB differences across browsers / private mode | Medium | Data loss perception | Memory fallback with banner; export everywhere; contract tests in Chromium e2e (and Firefox if available) |
| Students already mid-way in Weeks 2–5 with files only | High | Re-entry complaints | Legacy import in P1 (Week 1) and P2 (Weeks 2–5); old per-week paths keep working until Nov 27 |
| Phase II lab minimums not yet defined (Weeks 9–14 outlines only) | High | P5 cannot define milestones | P5 consumes lab briefs as they land; generic milestone "expected artifacts" placeholder labeled provisional |
| UI redesign churn conflicts with project pages | Medium | Rework | Project pages built on existing tokens first; P4 slices restyle, not restructure |
| Uncommitted old-outline edits (W9/W11/W12) merged late | Low | Merge noise | App does not touch those files |

**Drop order if late** (first dropped first): (1) P5.2 per-week Phase II views beyond mapping tables; (2) P2.10 history
compare; (3) multiple-project switcher UI (keep "open as separate project" via import only); (4) P2.8 generic editors
(lab tools remain the editors); (5) copy-from-practice (handoff panel stays); (6) P4 later slices (onboarding, motion).
**Never dropped:** reliable save, snapshots, export/import with validation and no silent overwrite, practice/project
isolation, Week 1 → Week 8 continuity, the directive §12 tests, accessibility and the student-build check.

---

## 9. Tracking

Each increment ends with: files changed, tests added and their run results (counts from the actual run), known gaps,
and any decision logged in `DECISION_LOG.md` (working conventions for technical choices; A-entries only for faculty
decisions). `KNOWN_LIMITATIONS.md` gains the local-storage and attribution limits from architecture §11 at P1 close.
