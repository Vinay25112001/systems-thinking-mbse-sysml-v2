# Week 1 Implementation Baseline (Milestone 0)

Recorded 2026-10-21 before any Week 1 reconstruction work (DECISION_LOG A23). The controlling specification is
`docs/directives/2026-10-21_MASTER_IMPLEMENTATION_DIRECTIVE_WEEK1.md` together with `docs/directives/2026-10-21_WEEK1_REDESIGN_PROPOSAL.md`.
The evidence for the application's state is in `docs/audits/current-state-2026-10-21/` (same day, read-only audit). This file
records the **git baseline**, which was re-checked live for this document rather than copied from the audit.

## 1. Git state (re-verified 2026-10-21 13:00)

| Item | Value |
|---|---|
| Branch | `master` (local only, no remote; public snapshot repo `Course_Work/SysML-public` is separate and updated only on request) |
| HEAD | `8b9637d`, "P1 My Project workspace (A22)…" (2026-10-19) |
| Baseline tag | **`baseline/2026-10-21-pre-week1`** → `8b9637d` |
| WIP snapshot branch | **`wip/2026-10-19-interrupted-snapshot`** → `f1f6e0e`: one commit on top of HEAD holding every uncommitted and untracked file (97 files). It was built through a temporary index; the working tree and the real index were not touched |
| Outside-repo backup | `C:\Users\w451vxs\Documents\Course_Work\SysML-backups\2026-10-21-pre-week1\`. It holds `HEAD.txt`, `status.txt`, `tracked-changes.patch` (binary diff, 5.9 MB), `untracked-list.txt` and `untracked-files.tar` |
| Working tree | 39 modified tracked files outside screenshots, 11 modified tracked screenshots, and 18 untracked entries. Total 68 `git status` lines |

## 2. What is complete (committed at HEAD and tested)

The full status for each week is in `docs/audits/current-state-2026-10-21/FULL_14_WEEK_CONTENT_MATRIX.md`.

**Week 1 (the subject of this phase):**
- lecture sessions 1 and 2 (25 and 23 slides) with faculty notes;
- the student lesson (21 sections), the AeroLink case and worked examples;
- optional practice (missions 1–4);
- the Lab L1 Team Record tool and quiz Q1;
- pptx exports. These are gitignored generated artifacts, so they must be regenerated from source after any change.

**Other weeks:** Weeks 2, 3, 4, 5 and 8 lecture packages and lab tools are internally signed off. Week 5 has one moderate issue open at HEAD.

**My Project P1 (Week 1 only), in `src/project/**`:**
- the canonical model, IDs and integrity rules;
- the change log, undo and snapshots;
- the IndexedDB store and the tab lock;
- export and import v1 with a merge plan;
- the Week 8 preview.

**Build split:** the student build strips faculty notes and exam banks, and its leak check passes. It does **not** hide the instructor toggle.

## 3. What is incomplete and uncommitted (from the three agent streams stopped 2026-10-19)

None of this has been verified, and all of it is preserved on the WIP snapshot branch and in the outside backup.

| Stream | Files | State | Relation to Week 1 |
|---|---|---|---|
| (a) Week 6 build | Untracked: `src/content/lectures/week06/`, `components/figures/LectureWeek6*.tsx`, `lectureWeek6Figures.ts`, `week6FigureKit*.ts`, `content/lab/week06Lab*.ts`, `content/quizWeek6*.ts`, `content/week6Path.ts`, `workbench/week6/`, `docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md`. Modified: `content/lectures/index.ts`, `components/figures/registry.ts` (week06 blocks), `content/readings.generated.json`, `_source_cache/verification/readings.py`, `readings_verified.txt` | Lectures wired in. Lab, quiz and record are not routed and have not been reviewed. `content.test.ts` fails 145 vs 140 because of R105–R109 | None directly. **Shared files** `lectures/index.ts` and `figures/registry.ts` are also likely Week 1 touch points, so commit with explicit hunks or paths only |
| (b) Week 5 confirmation fixes + shared `emptyAnswer` | Untracked `src/workbench/emptyAnswer.ts`. Modified: `workbench/week1/team.ts`, `week2/record.ts`, `week3/record.ts`, `week5/record.ts`, `week5/record.test.ts`, `shortAnswers.test.ts`, `content/lectures/week05/*`, `week5/Examples.tsx`, `workbench/week8/skeleton.ts`, Week 5 docs, `scripts/build-lab-md.mjs` | Unverified. Fixes the W5 "none/n-a/?" moderate issue and shares one empty-answer rule across weeks | **Direct:** `workbench/week1/team.ts` (the Week 1 lab gates) imports the untracked `emptyAnswer.ts` |
| (c) P1 independent review | No files (stopped before writing its report) | Not done | My Project is the base of the new canvas; the review becomes part of M2 |
| Old-outline partials W9/W11/W12 (older, from 2026-10-11) | Modified: `content/weeks/week09/11/12.ts`, `activities/week11/*`, `activities/week12/*`, `docs/authoring/week09/11/12_notes.md`. Untracked: `activities/week11/usePracticeUnlock.ts` | Archive modules of the earlier outline; standing rule is to leave them untouched | None |
| Regenerated screenshots | 11 tracked PNGs under `screenshots/` and `learning-studio/screenshots/` | Side effect of earlier e2e runs | None |
| Audit and directive documents (this phase) | `docs/audits/`, `docs/directives/2026-10-21_*`, `DECISION_LOG.md` (A23), this file and its siblings | New | Documentation |
| `Week1_Review_Pack_2026-10-21.zip` | Repo root, untracked | The user's review pack | **Never commit** (large binary; copy of audit material) |

## 4. Dependencies between modified tracked files and untracked files

These make a partial commit unsafe:

| Modified tracked file | Depends on untracked file |
|---|---|
| `src/workbench/week1/team.ts`, `week2/record.ts`, `week3/record.ts`, `week5/record.ts`, `shortAnswers.test.ts`, `content/lectures/week05/labBrief.ts` | `src/workbench/emptyAnswer.ts` |
| `src/activities/week11/{FlowCoverage,RidWriter,StateWalker}.tsx`, `activities.test.tsx` | `src/activities/week11/usePracticeUnlock.ts` |
| `src/content/lectures/index.ts` | `src/content/lectures/week06/session1.ts`, `session2.ts` |
| `src/components/figures/registry.ts` | `src/components/figures/lectureWeek6Figures.ts` (and the Week 6 figure components) |

## 5. Student-data compatibility risks (browser storage today)

| Store | Key or database | Risk if the Week 1 rebuild changes it |
|---|---|---|
| My Project | IndexedDB `sysml-studio-projects` v1 (`src/project/store/indexedDb.ts`) | Schema changes need a forward migration. Projects must never be wiped; existing exports (`sysml-studio-project` v1) must still import |
| Legacy Week 1 record | localStorage `sysml-studio:v1:wb-artefacts['w1.team']`, backup `w1-team-before-project` | The mirror is written by `state/ProjectLegacyMirror.tsx` and read by Week 2's "use saved Week 1 record". Removing it breaks Week 2 until Week 2 reads the project |
| Weeks 2–6 records | `w2.record` … `w6.record` | Outside the project. Untouched by Week 1 work, but a server move must offer an import path, never auto-delete |
| Week 1 export files | `week1-model-inputs` v1–v3 | Read by the Week 2, Week 8 and project importers. Keep the readers backward compatible |
| Practice | `wb-artefacts`, `mission-progress`, `mission-signals`, `wb-ui`, `workspace-model`, `stakeholder-map` | Shares the `wb-artefacts` key with the team record (audit risk). Separating them needs a careful migration |
| Quiz / progress | `quiz`, `w1-flow-v2`, `welcome-seen` | Low risk |

The coming server backend (M2) will **not** auto-migrate browser data. Students bring their work over by exporting the project file
and importing it into their account. Browser stores stay readable as an offline mode. Details are in `PROJECT_DATA_SCHEMA.md` (M0 deliverable).

## 6. Rules for this phase (from A23 and the standing rules)

- No destructive git commands (reset --hard, clean, checkout of others' files, stash drop) without explicit approval.
- Commit only related, validated changes, by explicit path. Never sweep in WIP from streams (a), (b) or the old-outline partials.
- Never commit the review ZIP, student records, credentials, demo passwords or `_source_cache/notes/`.
- Never push the local repo. The public snapshot is updated only when the user asks.
- Earlier test claims are not evidence. Every milestone re-runs its checks on the tree it commits.

## 7. Milestone 0 close (2026-10-21)

| Commit | Content |
|---|---|
| `d24f379` | P0 save defect fixed (root cause: orphan store from the React StrictMode double effect held the Web Lock; dev only, prod was unaffected on reload; refused edits were silent in all modes). Report `learning-studio/docs/project/P0_SAVE_DEFECT_REPORT.md` |
| `9643455` | Stream (b) verified and committed as its own unit: shared `emptyAnswer.ts`, W5 N1–N9. Closes the W5 moderate. The Week 6 line in `scripts/build-lab-md.mjs` was left unstaged with stream (a) |
| next commit + tag `week1/m0` | M0 documents (directives, A23, baseline, impact matrix, recovery plan, security/publishing/schema/backend architecture, Week 1 reuse map, content responsibility matrix, textbook IA, field-guidance sources, critical path, discovery audit) |

What is still uncommitted after M0: stream (a) Week 6 (parked, plus its `index.ts`, `registry.ts`, `readings*` and `build-lab-md.mjs` edits), the old-outline W9/W11/W12 partials, 11 regenerated screenshots and the review ZIP (never commit). All of it is preserved on `wip/2026-10-19-interrupted-snapshot`.
