# Converting a week to the AeroLink Workbench

The template for Weeks 2–14, written after converting Week 1 (2026-10-11). Read `WORKBENCH_SPEC.md` first, including
§7 Deviations. Week 1 is the worked exemplar: `src/content/missions/week01.ts` (data, checks, rules) and
`src/workbench/week1/` (views, tree, properties, pure logic).

A converted week opens at `/week/N` in the workbench; `/week/N/classic` keeps the reviewed WeekPage. Nothing in the
week's reviewed content (`src/content/weeks/weekNN.ts` and the files it composes) changes.

## 1. Files you create (and the only shared files you touch)

| File | Content |
|---|---|
| `src/content/missions/weekNN.ts` | `export default` a `WorkbenchWeek`: `week`, `views` (tab order), `missions`, `rules`, `describeSignal`. Discovered by glob; creating it converts the week. |
| `src/workbench/weekN/logic.ts` | Pure functions: artefact types, analysis, every check the missions and rules use. No React. |
| `src/workbench/weekN/*.tsx` | New tools the week needs (recorders, builders) and its centre views. Mount existing activity components; do not rewrite them. |
| `src/workbench/weekN/tree.ts` | `tree(state)`, `homeView(id)`, `entities(state)`, `metrics(state)`, `labelOf(id)` for the model browser and the impact diff. |
| `src/workbench/weekN/Properties.tsx` | Properties form for week-specific artefacts (return `null` for engineering elements; the shell's generic form handles them). |
| `src/workbench/views.ts` (shared, append only) | Register each new view in `VIEW_REGISTRY`, add `WEEK_UI[N]`, map the week's activity components in `ACTIVITY_VIEW`. |

Tests: `src/workbench/weekN/*.test.ts(x)` for the logic, plus the week's cases in the shared test tables (§5).

## 2. Extract the missions from the reviewed week

Work from `weekNN.ts`, never from memory. For each mission write down the source sentence or field it is cut from.

1. **Driving question and Try first (≈ 10 min).** The week's driving question becomes a prediction the student records
   before any explanation (`input` with `lock: true`), followed by a run or action in the week's tool, then a
   comparison step whose `detail` shows the prediction beside the computed result and whose `feedback` (revealed only
   after recording) quotes the worked example. Check order with timestamps (`answer.at` < `signal.at`).
2. **Worked.** The week's `worked-example` block, one step per paragraph or calculation. `worked` holds the quoted
   sentence(s); a light check (a number, a choice) keeps the student active. Compute expected numbers from the model
   (`src/sim`, `src/model/reference`) — never retype them.
3. **Guided (one or two).** The week's activities (`ActivitySpec.instructions`) become steps; checks give hints, not
   answers. Guided missions show only the steps reached so far.
4. **Own.** The lab (`LabSpec.steps`) becomes the deliverables tracker. Use `labStep(i)` (title + detail, verbatim) as
   the instruction. Machine-check what is countable (IDs, counts, links, polarity, owner/provenance); everything else is
   a manual step or names its rubric (`rubric: 'RB-x.y'`).
5. **Recall.** The week's reviewed quiz in Assessments → Recall, after the other missions. Do not write new items.
6. **Program review** (Weeks 4, 7, 10, 13): a decision with consequences and a debrief — brief it separately.

Rules for text: import reviewed strings (`week.lab.steps[i].detail`, `activity.purpose`, block paragraphs, scenario
`setup`) instead of retyping. When you must condense, keep the meaning and the citation of the block it came from, and
never add a factual, numerical or SysML claim (AUTHORING_GUIDE §2, §7). Every step has `readMore` = the lesson block id
that explains it.

Split reviewed prose with the sentence splitter in `week01.ts` (it does not break on "14.4"); then print every
mission's text in a scratch test and read it before you commit to it — Week 1's first draft cut "14.4 aircraft" in
half.

## 3. Minutes and objectives

- Every mission names `workloadLine`, the prefix of one `WeekContent.workload[].activity`. The minutes of all missions
  drawing on a line must not exceed that line's hours × 60, and the week total stays at `WORKLOAD_TARGET`. Missions
  reorganise reviewed time; they never add time. Record the allocation in the spec's Deviations for faculty review.
- `objectives` are IDs from `course.ts` for this week; every week objective is practised by at least one mission.

## 4. Writing checks

- A check is a pure function `(ctx) => { ok, detail }`. Put the logic in `weekN/logic.ts` and call it from the mission;
  the same function feeds the L-record tracker and any rule.
- `detail` says what is still missing in the student's terms ("4 of 6 complete (2 without owner initials)"). It is
  visible while the step is current and, in short form, after it is done.
- **Do not leak keys.** A check may say *that* something is wrong only where the reviewed activity already reveals it
  (e.g. the boundary key appears only after "Check classification"). Problems rules must never encode an answer key the
  activity hides. Predictions are locked once recorded.
- Activities publish facts with `useMissionSignal(key, value)` (no-op outside the workbench). Publish only after a
  student action (Week 1 uses a run counter so a repeated run is a new signal). Name keys `wN-tool.fact`.
- Completeness thresholds (word counts, minimum counts) that are not in the reviewed content are workbench
  conventions: label them as completeness checks, list them in Deviations, and never present them as grading criteria.
- Owner and provenance on every recorder (`ProvenanceOwnerFields`, `ownerProblem`) — AUTHORING_GUIDE §7.1.

## 5. Tests you must add (all are required before the week is called converted)

1. **Content checks** run automatically for every converted week (`src/content/missions/missions.test.ts`): objectives
   exist, every objective practised, every `readMore` resolves, every view registered and listed, ids and input keys
   unique, mission-loop order, minutes inside workload lines, total unchanged, worked steps explained, one recall.
2. **Problems** (`src/workbench/problems.test.ts` pattern): add a failing and a passing fixture for each new rule to the
   `FIXTURES` table; the coverage test fails if a rule has none. Add a test that the instructor reference up to this
   week raises no problem (§7.4) — if it does, the rule or the reference is wrong; report which.
3. **Mission checks** (`src/workbench/missions.test.ts` pattern): one passing context and at least one *realistic*
   failing context per checked step (wrong order, off-by-one number, wrong polarity, one item short). The coverage test
   fails if a checked step has no case.
4. **Mutation evidence**: mutate at least three core lines (a rule, an order check, a computation), run the suite, record
   which tests fail, restore, and confirm the file is byte-identical. Week 1: parity flip → 8 failures; dropping the
   prediction-before-run comparison → 1; impact diff never clearing problems → 3.
5. **View/UI**: a Testing Library test for any new keyboard behaviour; an e2e test that completes one guided step and
   one problems → selection round trip in the new views; add the views to the axe and screenshot loops in
   `e2e/workbench.spec.ts` (light and dark, 1440×900 and 1024×768).
6. **Classic page**: keep its e2e coverage by pointing the old tests at `/week/N/classic`.

## 6. Pitfalls hit in Week 1

- **Panel ids become test ids.** `react-resizable-panels` sets `data-testid` to the Panel `id`; a Panel called `dock`
  collided with the Dock's own test id. Shell panels are prefixed `wbp-`.
- **Absolutely positioned descendants can grow the document.** sr-only labels and chart tooltips whose containing block
  was the page made `document` taller than the viewport, and `scrollIntoView` then shifted the whole workbench. The
  shell is `position: relative; overflow: clip` and every scroll container is `position: relative`.
- **Component classes must sit in `@layer components`.** Unlayered CSS beats Tailwind utilities, so `.wb-input`
  silently overrode `pl-6`. Keep new workbench classes in the layer in `theme.css`.
- **Collapsed done steps hid the debrief.** Feedback and the check detail stay visible after a step is done.
- **Coalescing hid problems.** Merging a creation with the edit that followed erased the problem the creation raised;
  only updates are merged.
- **jsdom and the panel library.** jsdom has no layout, so the library treats every pointer-down as a separator drag;
  drive shell tests with `fireEvent` and keep real pointer input for e2e. Radix tabs activate on `mousedown`.
- **Accessible names of selects inside labels include the selected option.** Give selects in builders an explicit
  `aria-label`, and give "Record" buttons a name that includes the input label (several are on screen at once).
- **Views stay mounted once visited** (forceMount + `data-[state=inactive]:hidden`) so activity state (the explorer's
  committed archetypes) survives tab switches; each view scrolls on its own.
- **Other agents edit other weeks concurrently.** A syntax error in someone else's in-progress file stops `tsc -b`
  reporting anything else; type-check your files with a temporary config that excludes theirs, delete it afterwards, and
  never edit their files. Stale dev servers on 5173 serve old modules: start one fresh server, and kill it when done.
- **Fonts change layout.** IBM Plex Mono is wider than the old system mono; a listing in another week overflowed and
  became an unfocusable scroll region (axe `scrollable-region-focusable`). Scrollable `<pre>` needs `tabIndex={0}`.

## 7. Definition of converted

`npx tsc -b`, `npx oxlint src` (no new warnings in your files), the full `npx vitest run`, `npm run build`,
`npm run build:student` (leak check), and the e2e suite (including axe with zero violations on `/week/N` in both
themes) all pass; screenshots of every centre view are in `screenshots/workbench/`; Deviations are recorded; the
classic page still renders.
