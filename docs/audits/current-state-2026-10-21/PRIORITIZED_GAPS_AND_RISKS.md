# Prioritized Gaps and Risks — current state 2026-10-21

Read-only discovery audit. This document consolidates the findings of the nine companion documents in this folder. Each item cites the document that holds the evidence.
Baseline: HEAD `8b9637d` on `master`, plus an uncommitted working tree from stopped agents. "(wt)" marks things that exist only uncommitted.
Deadline: **2026-12-01**, which is about 5.7 weeks of calendar time from the audit date.

Severity scale:
- **Critical:** blocks a credible course delivery or risks loss of student work or grades.
- **High:** a major directive requirement is unmet, or students will be misled.
- **Medium:** quality, consistency or integrity issue that a reviewer would flag.
- **Low:** polish or hygiene.

---

## 1. Critical

| # | Gap / risk | Evidence | Consequence | Direction (not a fix) |
|---|---|---|---|---|
| C1 | **Phase II is largely unbuilt.** Weeks 9–14 are OUTLINE ONLY; only Week 8 is taught. Week 7 is OUTLINE ONLY. Week 6 is OUTLINE ONLY at HEAD (DRAFT in wt). | `FULL_14_WEEK_CONTENT_MATRIX.md` §1; `App.tsx:159`, `lectures/route.ts:35` (`WEEK_PAGES = {1,2,3,4,5,8}`) | 8 of 14 weeks have no taught content. At the pace observed so far (one week takes about 1–2 days of build plus review and confirmation), the remaining 8 weeks consume most of the remaining calendar | Decide scope and sequencing with faculty now: W6 → W7 → W9 → W10 → W11 → W12 → W13 → W14. Consider lighter templates for the presentation weeks 7 and 14 |
| C2 | **Student work outside Week 1 is not in the project.** Weeks 2–6 records live in separate localStorage keys (`w2.record` … `w6.record`). They are absent from the project export, history and impact analysis. | `PRACTICE_PROJECT_MBSE_DATA_FLOW.md` §2 row 5; `PROJECT_WORKSPACE_STATUS.md` | Clearing browser data, or switching machines, silently loses Weeks 2–6 work unless the student exported each week's file. This contradicts directive A22 §4 and §3C.6 | P2 adapters for Weeks 2–5 (and 6) onto the canonical project, reusing the `useTeamRecord` adapter pattern |
| C3 | **The project can turn read-only after a reload and silently drop edits.** Five of five single-tab reloads in the audit browser ended read-only. The Week 1 lab page offers no "Take over editing", inputs stay enabled, and refused edits are discarded. | `UI_UX_SCREEN_AUDIT.md` F1; `project/store/ProjectStore.ts:107-127` (`ifAvailable`, 4 × 250 ms retries, then permanent read-only); `adapters/useTeamRecord.ts:171` | A student types, sees no error, and loses the work. Reproduced only in Playwright's headless shell; **not yet confirmed in desktop Chrome/Edge**. Root cause not established (possibly the previous page or a duplicate store instance still holds the lock) | Confirm in a real browser first. Then wait for the lock rather than giving up, surface "Take over editing" on every page that edits, and disable inputs while read-only |

## 2. High

| # | Gap / risk | Evidence | Consequence |
|---|---|---|---|
| H1 | **Week 1 work reaches the Week 8 lab tool only by manual file export and import.** The My Project Week 8 *preview* reads the project directly, but the graded Week 8 tool cannot. Weeks 3–6 outputs are not consumed by Week 8 at all. | `PRACTICE_PROJECT_MBSE_DATA_FLOW.md` §4, §2 row 6; `workbench/week8/skeleton.ts:169-180`; `project/adapters/week8.ts:16` | The headline continuity requirement (A22 §1, §9) is only partly met. The Week 8 transformation (left package / right model with five statuses) exists only as a read-only preview, and mappings are never stored |
| H2 | **No Systems Thinking Engineering Package (Week 7)**: there is no assembly, no export, and no Week 7 rubric. | `FULL_14_WEEK_CONTENT_MATRIX.md` W7; `ACADEMIC_ALIGNMENT_REVIEW.md` | The Phase I → Phase II hand-off artifact the whole design depends on does not exist |
| H3 | **The instructor toggle is available in the student build.** `build:student` compiles out slide notes and exam banks, but anyone can tick instructor mode; the leak check does not test it. The dev server is the instructor edition. | `APPLICATION_STATE_REPORT.md` (flags); `FEATURE_AND_TEST_INVENTORY.md`; `WEEK_1_DEEP_AUDIT.md` L-1 | Students may see faculty-review text, pending decisions and instructor framing. Deploying the default build to students would expose faculty notes. (Relates to faculty decision F7) |
| H4 | **Enterprise approval is self-declared**, and there is no instructor review capability anywhere. | `WEEK_1_DEEP_AUDIT.md` LB-1 (`team.ts:280-317`); `PROJECT_WORKSPACE_STATUS.md` | Faculty decision 3 ("enterprise approval before Week 2") cannot be enforced in the app. This needs a backend, or an out-of-band process documented for students |
| H5 | **Archived old-outline modules are linked from current week pages.** Weeks 6, 7 and 9–14 outline pages link `#/draft/<old>` modules and quizzes built for the earlier outline. | `ACADEMIC_ALIGNMENT_REVIEW.md`; `NAVIGATION_AND_ROUTE_MAP.md` §1 (`WeekPage.tsx:198-288`) | Students may study and self-test against superseded objectives |
| H6 | **Uncommitted working tree is entangled.** 50 modified tracked files and 22 untracked files exist. Modified tracked files import untracked ones (`workbench/emptyAnswer.ts`, `activities/week11/usePracticeUnlock.ts`, Week 6 entries in `lectures/index.ts` and `figures/registry.ts`). `content.test.ts` fails (145 vs 140 readings) because of the uncommitted Week 6 work. | `APPLICATION_STATE_REPORT.md`; `FEATURE_AND_TEST_INVENTORY.md` | A partial commit breaks the build. The dev server and every test result in this audit describe an unreviewed state, not HEAD |
| H7 | **Week status signals contradict each other and expose internal status.** Week 1 shows "In development". Week 6 shows "Available (pending review)" on the dashboard but "Provisional" on its page. The Roadmap labels built Weeks 2–5 and 8 "Provisional". The Welcome page says "later weeks will follow". | `UI_UX_SCREEN_AUDIT.md`; `ACADEMIC_ALIGNMENT_REVIEW.md`; `WEEK_1_DEEP_AUDIT.md` W-1 | Students cannot tell what is ready to study; reviewers see an unfinished product |

## 3. Medium

| # | Gap / risk | Evidence |
|---|---|---|
| M1 | Lab gates check completeness, not quality: one-word justifications pass, and the six need-quality checks are student-ticked. (Over-correction after the "valid input rejected" sweep.) The W5 "none/n/a/?" moderate is still open at HEAD; the fix is uncommitted. | `WEEK_1_DEEP_AUDIT.md` LB-2; `FULL_14_WEEK_CONTENT_MATRIX.md` W5 |
| M2 | The graded Week 1 lab tool is titled "Practice workbench" and lists AeroLink rehearsal groups beside the team record. It shows two save indicators. Practice and project are not visually distinct inside the tool. | `UI_UX_SCREEN_AUDIT.md` |
| M3 | Four different page layouts (classic shell, lecture-first week shell, lecture viewer, My Project shell). Instructor toggles are named inconsistently ("Instructor review mode" vs "Instructor mode" vs none). The top-level workbench route and `flow/WeekFlow.tsx` are unreachable dead code. | `UI_UX_SCREEN_AUDIT.md`; `NAVIGATION_AND_ROUTE_MAP.md` §8 |
| M4 | My Project has no editors of its own: all editing happens through the Week 1 lab tool. Overview hint text reads like student-entered data. | `PROJECT_WORKSPACE_STATUS.md`; `UI_UX_SCREEN_AUDIT.md` |
| M5 | Internal source codes and register codes are visible to students ("all S04 classes", "S12 p.144", "[S01/S02]", R-codes in prose). | `WEEK_1_DEEP_AUDIT.md` LB-3, LS-1 |
| M6 | Two AeroLink data sources still diverge: 21 `fixIn: 'Week 2'` allowlist entries remain after Week 2 sign-off. | `WEEK_1_DEEP_AUDIT.md` A-1 (`aerolinkCanonical.test.ts:20-46`) |
| M7 | Copying AeroLink stakeholders into the project is enabled before faculty decision F4. The copies are flagged and excluded from submissions, but the switch is on. | `PRACTICE_PROJECT_MBSE_DATA_FLOW.md` §2 row 3 (`copyFromPractice.ts:301`) |
| M8 | Mobile: page headers fill about 60% of the lab screen and the project tabs are cut off. The Week 1 lesson is a single ~71,000 px page. The lab tool needs 22+ Tab presses to reach its first field. (axe: 0 violations on 25 states.) | `UI_UX_SCREEN_AUDIT.md` |
| M9 | Interactive practice exists only for Week 1. Weeks 2–5 and 8 have paper exercises inside worked examples but no Practice Canvas, so A22 §3B is met for one week. | `FULL_14_WEEK_CONTENT_MATRIX.md` §1 |
| M10 | The e2e "every week" test fails at Week 8 (stale test). Historical status documents (`PROJECT_STATUS.md`, `TEST_REPORT.md`) quote counts that are no longer current. | `FEATURE_AND_TEST_INVENTORY.md` |
| M11 | Pending faculty decisions are shown to students (B1.6/B1.7 proposed, RB-1.4 scoring, the three-person minimum). | `WEEK_1_DEEP_AUDIT.md` O-1/LB-4 |

## 4. Low

| # | Item | Evidence |
|---|---|---|
| L1 | The Week 3 Session 2 and Week 5 decks are older than their source. Decks are gitignored, so freshness must be re-checked after every source change. | `FULL_14_WEEK_CONTENT_MATRIX.md` |
| L2 | Hard-coded slide numbers in the Week 1 quiz explanations and the site-guide mini-figure ("slide 3 of 28"). | `WEEK_1_DEEP_AUDIT.md` W-3, AS-1 |
| L3 | No reset for the optional Week 1 practice. | `WEEK_1_DEEP_AUDIT.md` P-1 |
| L4 | Week 7/11 activity tests time out under full-suite load (they pass alone). | `FEATURE_AND_TEST_INVENTORY.md` |
| L5 | `ProjectLegacyMirror` writes the shared `wb-artefacts['w1.team']` key (scheduled for removal in P2). | `PRACTICE_PROJECT_MBSE_DATA_FLOW.md` §3 |

---

## 5. Highest-priority improvements (recommended order)

1. **Stabilise the tree.** Decide on the three interrupted streams (Week 6 draft, Week 5 fixes, P1 review). Commit coherent units or discard them, so that HEAD equals what is tested and served (H6).
2. **Confirm and fix the read-only reload defect** in desktop Chrome/Edge before any student uses My Project (C3).
3. **Bring Weeks 2–6 records into the canonical project** through adapters, so one export preserves all Phase I work (C2).
4. **Connect the Week 8 lab tool to My Project** (`sourceFromProject` exists) and persist Week 8 mappings, so the Week 8 baseline transformation is the real workflow, not a preview (H1).
5. **Build the Week 7 Systems Thinking Engineering Package** assembly, export and presentation rubric (H2).
6. **Production plan for Weeks 6, 7 and 9–14**, agreed with faculty, including which SysML authoring depth is feasible by 2026-12-01 (C1; faculty decision F8).
7. **Student-build hardening:** hide the instructor toggle and pending-decision text, remove internal codes, and unify status labels; extend the leak check to cover these (H3, H7, M5, M11).
8. **Remove the old-outline links** from current week pages, or label them clearly as archive (H5).
9. **Separate practice from project visually inside the Week 1 tool**, and rename "Practice workbench" for the graded tool (M2, M4).
10. **Restore gate quality** without re-introducing false rejections: minimal meaningful-content checks with student-visible justification (M1).

## 6. Decisions that belong to faculty (not autonomous)

- Scope of Phase II SysML authoring in Weeks 9–13 versus the time remaining (F8).
- Enterprise approval: in-app self-declaration vs out-of-band instructor sign-off (F3, H4).
- Whether copying AeroLink stakeholders is allowed (F4, M7).
- Hiding instructor mode in the student build (F7, H3).
- Whether lab machines exist for the course SysML checker (FD-W8-1).
- Weeks 7 and 14 presentation rubric and grading weight.
