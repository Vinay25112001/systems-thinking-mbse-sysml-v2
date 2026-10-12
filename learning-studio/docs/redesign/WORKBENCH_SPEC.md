# AeroLink Workbench — specification (v1, 2026-10-11)

Decision: DECISION_LOG A9–A14. Approved proposal: https://claude.ai/artifact/PJwErUZRMf9gwfBJEBGF3m.
Research: `../../_source_cache/research/interactive_platform_research.md`, `tool_integration_feasibility.md`.

The app stops being a long document with embedded widgets. Every week becomes a set of **missions** inside one
persistent, professional engineering workspace, the way Cameo, Capella or SysON are laid out. Students act on the
AeroLink model and see the consequences at once. The validated, reviewed content is kept; how it is delivered changes.

Standard: what a systems engineer with 30+ years in industry and a builder of interactive learning portals with
30+ years would ship. Dense, calm, precise, keyboard-friendly, accessible (WCAG 2.1 AA), both themes, offline.

## 1. Non-negotiables

1. **Content accuracy is unchanged.** Mission text is cut from the reviewed week content (`src/content/weeks/weekNN.ts`).
   No new factual or SysML claim enters without a register citation and a probe where relevant (AUTHORING_GUIDE §2, §7).
   Workload totals per week stay as reviewed (missions reorganise time, they do not add it).
2. **Static and offline.** No server, no CDN at runtime. Fonts and icons are bundled (npm packages).
3. **Nothing regresses.** All vitest suites, `weekChecks`, the student-build leak check (`npm run build:student`) and the
   e2e suite keep passing (update e2e selectors where the UI moved; do not delete coverage).
4. **Weeks convert one at a time.** A week opts in (`workbench: true` via its missions module). Unconverted weeks keep the
   current `WeekPage`. During the transition `/week/N/classic` shows the old page for faculty comparison.

## 2. Layout

```
┌ Top bar: AeroLink ▸ Week N ▸ Mission title · week switcher · Run checks · Export · theme · instructor ─────┐
├ Rail ┬ Model browser ┬──── Centre view (tabs registered by the week) ────┬ Properties / Mission brief ──┤
│ icons│ tree, search, │                                                   │ selected element form;       │
│      │ filter by kind│                                                   │ mission steps, hints, checks │
│      ├───────────────┴──── Bottom dock: Problems | Changes & impact | Console ┴──────────────────────────┤
└──────┴──────────── Status bar: model health · TPM margins (when present) · mission progress · saved ─────┘
```

- **Rail** (left, icon buttons with labels on hover/focus): Missions, Model, Reference, Assessments, Progress, Course map.
- **Model browser**: tree of the student's engineering model grouped by element kind (and, for Part I, the systems-thinking
  artefacts the week uses: stakeholders, loops, boundary items). Search, kind filter, status dots (ok/warn/error from the
  problems engine). Arrow keys navigate; Enter selects; selection is global.
- **Centre view**: tabs supplied by the week (e.g. Week 1: Dynamics, Causal loops, Boundary, Stakeholders; Part II later:
  Diagram, SysML v2 text, Trace matrix, Analysis). Existing activity components are mounted here, not rewritten.
- **Right column**: Properties of the selected element (editable through `Workspace.updateElement`, with provenance/owner via
  `ProvenanceOwnerFields`) and the **Mission brief** (current mission, numbered steps, hint on request, live check state,
  "Show worked step" for worked missions). Either can be collapsed.
- **Bottom dock**: **Problems** (from the rules engine; severity chip, message, element link → selects it, hint),
  **Changes & impact** (every model change with what it moved: problems added/cleared, coverage, margins), **Console**
  (checker records, exports).
- **Status bar**: model health (errors/warnings), TPM margins when the model has TPMs, mission progress, persisted state.
- **Reference drawer**: the full reviewed lesson (existing block renderers, citations intact), searchable, opened from the
  rail or from a mission step's "Read more" link that scrolls to the right block. Long prose lives here only.
- **Assessments panel**: recall quiz (existing quiz items), lab, assignment, rubric, graduate task, instructor notes
  (instructor mode only) — existing components.

Panels are resizable (`react-resizable-panels`), sizes persisted per viewer. Breakpoints: ≥ 1280 px full layout;
1024–1279 model browser collapses to the rail; < 1024 single column with a panel switcher; no horizontal page scroll at any width.

## 3. Architecture (`src/workbench/`)

| Module | Responsibility |
|---|---|
| `WorkbenchShell.tsx` | Layout, panel state, keyboard map (F6 cycles regions, Esc closes drawers, `?` shows shortcuts), routing into a week's missions |
| `selection.tsx` | Global selection context `{ selectedId, select(id), hovered }` |
| `changes.ts` / `ChangesProvider` | Wraps Workspace mutations; records `{ at, op, ids, before, after }`; computes **impact** by diffing derived metrics (problems, coverage, margins, thread counts) before/after; briefly highlights affected elements (no animation under reduced motion) |
| `problems.ts` | Rules engine. `Rule = { id, severity: 'error'|'warning'|'info', fromWeek, objective?, check(model, ctx) => Problem[] }`; `Problem = { ruleId, severity, elementId?, message, hint, cite? }`. Wraps `validateModel` (engineering.ts) and `stakeholderValidation.ts`; weeks add rules. Pure, unit-tested (each rule has a failing and a passing fixture) |
| `missions.ts` | Mission engine: progress store (`usePersistentState('mission-progress', …)`), step evaluation, completion |
| `signals.tsx` | `useMissionSignal(key, value)` — an activity publishes facts a mission checks (e.g. `w1-dynamics.lastRun`); minimal, optional props on existing activities, no rewrite |
| `views.ts` | Centre-view registry per week |
| `theme.css` | Design tokens (below) |

Mission schema (`src/content/missions/types.ts`):

```ts
type MissionKind = 'try' | 'worked' | 'guided' | 'own' | 'recall' | 'review'
type StepCheck = (ctx: MissionCtx) => { ok: boolean; detail?: string }   // ctx = { model, signals, answers }
type MissionStep = {
  id: string; instruction: string; hint?: string
  view?: string        // centre tab to open
  focus?: string       // element to select
  check?: StepCheck    // absent = student marks done (rubric-graded work)
  worked?: string      // explanation revealed in worked missions
  readMore?: string    // lesson block id in the Reference drawer
  cite?: Citation[]
}
type Mission = { id: string; week: number; kind: MissionKind; title: string; goal: string; minutes: number
                 objectives: string[]; steps: MissionStep[]; debrief?: string }
```

Missions live in `src/content/missions/weekNN.ts`, discovered by glob like weeks and activities. A content check
(added to `weekChecks` or a sibling test) asserts: objectives exist in `course.ts`, every `readMore` resolves, every
`view` is registered, mission minutes fit the reviewed workload line they draw from.

**Mission loop per week:** Try first (≈10 min, before explanation, prediction recorded) → Worked → Guided (fewer steps
shown, checks give hints) → Own (no scaffolding; machine checks where possible, otherwise rubric) → Recall (3–5 retrieval
items that need the model, drawn from the reviewed quiz) → Program review in Weeks 4, 7, 10, 13 (later).

## 4. Visual system

- Type: **IBM Plex Sans** (UI/body), **IBM Plex Sans Condensed** (panel and page headings), **IBM Plex Mono** (IDs, values,
  units, code). Bundled with `@fontsource/*`. Chrome text 13 px; reading drawer 15 px / 1.6, max 68 ch.
- Tokens (`theme.css`, mapped into Tailwind `@theme`): `bg`, `panel`, `sunk`, `line`, `fg`, `muted`, `accent` (instrument teal
  #0f6e8c light / #4fb3d4 dark), `accent-soft`, semantic `ok`, `warn`, `bad` (+ soft). Neutrals slightly blue-biased. Dark
  theme designed, not inverted. All pairs ≥ 4.5:1 for text.
- Components: panel header (mono uppercase 11 px label), tree, tabs, chip (status), button (default/primary/ghost),
  property row, toast, drawer. Use Radix primitives (MIT) for Tabs, Dialog/Drawer, Tooltip, DropdownMenu where they give
  correct keyboard/ARIA behaviour; icons from `lucide-react` (ISC).
- Restraint: borders over shadows; one accent; status shown by chip + colour + text (never colour alone).
- Motion: ≤ 150 ms state transitions; impact highlight pulse; nothing under `prefers-reduced-motion`.

## 5. Week 1 prototype (first conversion; gate: faculty review ≈ 2026-10-18)

Build the shell, problems engine, mission engine, selection, changes/impact, reference drawer and assessments panel,
then convert Week 1. Mission set, all text cut from reviewed `week01.ts`:

1. **Try first** — "Will adding aircraft reduce average passenger waiting time?" Student records a prediction, then runs the
   dynamics explorer; the prediction is compared with the run.
2. **Worked** — the binding-constraint worked example (`w1-worked-capacity`) walked step by step in the Dynamics view.
3. **Guided** — boundary classification (`w1-act-boundary`) with checks and hints; criterion named (model boundary vs control).
4. **Guided** — causal loops: build one reinforcing and one balancing loop; polarity/loop-type rule checks.
5. **Own** — Lab L1 parts (SoI sentence + rejected boundary, context with ≥ 6 EXT, two loops, one emergent behaviour
   explained causally, team charter) as tracked deliverables; machine checks where possible (counts, polarity), rubric otherwise.
6. **Recall** — Week 1 quiz items in the Assessments panel, after the missions.
Principles explorer stays available as a centre view and from the Reference drawer.

## 6. Later conversions (outline; each week gets its own brief)

Part I weeks reuse the shell with their tools (requirements editor + quality rules, trace matrix + impact, risk board,
trade table with sensitivity). Part II adds: architecture canvas (React Flow + elkjs), SysML v2 text view for a course
subset (spike first; fallback read-only text/diagram pairs with editable values), **Parametric Analysis panel** (eVTOL
Sizer engine pinned to one commit, outputs labelled "analysis-computed (teaching)", writes TPM estimates and VER-003
evidence; A10–A12), verification planner, digital-thread explorer. Program reviews in Weeks 4, 7, 10, 13.

## 7. Deviations (Week 1 prototype, 2026-10-11)

Recorded by the build of the shell and the Week 1 conversion. Each is either an interpretation the spec left open or
a change made for a stated reason; items marked **faculty** need a decision at the ≈ 2026-10-18 review.

1. **Mission schema extensions** (`src/content/missions/types.ts`). `Mission.workloadLine` names the reviewed workload
   line (matched by prefix) whose time the mission uses, so the content test can prove minutes fit inside reviewed
   time. `MissionStep.readMore` is required (the brief asks for one on every step). `MissionStep.input` (choice /
   number / text, optionally `lock`ed, with feedback revealed only after recording) and `MissionStep.rubric` were added.
   `MissionCtx` also carries `artefacts`, `boundary` and `quiz`; a `Signal` keeps a bounded `history`. A converted week
   exports a `WorkbenchWeek` (`views`, `missions`, `rules`, `describeSignal`).
2. **Changes & impact observes state, not function calls.** Instead of wrapping each `Workspace` mutator, the provider
   reduces everything the workbench shows to a snapshot (element signatures, problems, metrics, mission-step states)
   and diffs consecutive snapshots (`changes.ts`, pure, unit-tested). Reason: changes made by unmodified activities
   (boundary exercise, stakeholder editor) are captured without rewriting them. Typing into one element within 4 s is
   one change; creations are never merged with later edits.
3. **Dock placement.** The dock spans the model browser and the centre view; the right column (properties + mission
   brief) runs full height. The §2 sketch is ambiguous; this keeps the mission brief tall, as in the approved mock-up.
4. **Week UI registry.** Besides the view registry, `src/workbench/views.ts` holds `WEEK_UI[n]` (model-browser tree,
   properties form, impact entities/metrics, labels) so content modules never import React.
5. **Rules and severities.** Stakeholder-map acceptance checks (L2/CP1) apply from Week 2 (`fromWeek: 2`); in Week 1
   only their referential-integrity check runs. An incomplete student loop (missing polarity, unnamed variable) is a
   warning; a declared type that contradicts the polarities is an error. The EXT-exchange rule accepts either an
   `exchange` attribute or a statement, so the instructor reference (which states exchanges in `text`) passes every
   rule (tested, AUTHORING_GUIDE §7.4).
6. **Week 1 artefacts outside the engineering model.** Student causal loops (`LOOP-nnn`) and the L1 emergent-behaviour
   and charter records live in a persisted artefact store (`wb-artefacts`), because `engineering.ts` has no loop kind.
   ENT/EXT go into the shared Workspace model as before, with owner and provenance.
7. **Completeness thresholds (faculty).** The own-mission machine checks use workbench conventions that are not in the
   reviewed content: boundary statement ≥ 8 words and one sentence; rejected boundary ≥ 5 words; emergent-behaviour
   explanation ≥ 60 words naming ≥ 2 loops and reproduced in the explorer; charter text fields ≥ 5 words. They gate
   completeness only and are labelled as such; the reasoning is still read against RB-1.1 / RB-1.4.
8. **Mission minutes (faculty).** Try (10) + Worked (15) draw on "Graduate leverage-point memo and explorer analysis"
   (72 min); Guided boundary (15) + Guided loops (20) + Own L1 (100) on "L1 completion and team charter" (150 min);
   Recall (12) on "Readiness quiz Q1 / knowledge check" (12 min). Workload items and the 8 h total are unchanged.
9. **Archetype commit placed in the Try mission.** The explorer's predict-before-reveal (commit an archetype before
   the label) is step 4 of Try first, so it happens before the Worked mission; the worked text quoted there omits the
   sentence that names the archetype.
10. **Optional hooks on existing activities.** `DynamicsExplorer` and `BoundaryExercise` publish facts through
    `useMissionSignal` (a no-op outside the workbench) instead of new props; `CausalLoopDiagram` gained optional
    `selectedId`, `onSelectNode`, `height` and `collapseText` props. No activity was rewritten; classic behaviour is
    unchanged and its tests pass.
11. **Visual tokens.** `warn` is #8a5200 (light) instead of the mock-up's #b86b00, and `ok` #23683b, so status text on
    the soft fills reaches 4.5:1. The app-wide `brand` palette is remapped to the instrument teal and IBM Plex is the
    app-wide font, so classic pages and the Dashboard share the workbench's look (Dashboard not restructured).
12. **Fonts licence.** `@fontsource/ibm-plex-*` are OFL-1.1 (the font licence), not MIT/ISC/Apache; the spec names IBM
    Plex and OFL permits bundling. Code dependencies are MIT (react-resizable-panels, Radix) and ISC (lucide-react).
13. **Radix primitives used:** Tabs, Dialog (drawers and dialogs), Tooltip. The week switcher is a native `<select>`
    (no DropdownMenu needed).
14. **Breakpoints.** 1024–1279 px: the model browser is hidden and toggled from the rail (it opens as a resizable
    panel, not an overlay). < 1024 px: a panel switcher (View, Mission, Properties, Model, Problems). The rail's
    Progress button opens the existing `/progress` page.
15. **Reference drawer is non-modal** so students can read beside the model; Esc closes it. The Assessments panel is
    modal.
16. **Test notes.** The shell keyboard tests drive pointer input with `fireEvent` (jsdom has no layout, so the panel
    library's document-level pointer handling claims every pointer-down); the e2e suite covers real pointer input.
    The app-wide axe e2e loop's timeout was raised to 240 s (24 pages).
17. **Pre-review polish pass (2026-10-11): Practice-stage layout.** Following the owner's direction that the week
    becomes Overview → Learn → Practice (this workbench) → Check & submit, the mission brief is the primary guide and
    runs down the LEFT (14 px text, 18 px titles); the centre shows the view the current mission step needs as the
    emphasised tab ("current step"), with the other views in a quieter icon-only "Other views" tab list, and follows the
    mission when a step moves to another view; the model browser and properties share the right column. This
    supersedes items 3 and 14 for layout. The first-run orientation tour was not built (the Learn stage replaces it).
    F6 order: top bar, rail, mission brief, view, dock, model browser, properties, status bar.
18. **Dock.** Folded to its tab strip by default; a new problem opens it (150 px) on Problems; a new model edit while it
    is folded opens it on Changes & impact for 5 s and folds it again unless the viewer touches it. Panel sizes are
    saved only after the viewer resizes (`onlySaveAfterUserInteractions`); layouts use new ids (`wb2-*`), so sizes
    saved by the first prototype do not come back. **Properties** folds to its header (with a one-line "Nothing
    selected" hint) while nothing is selected and opens on selection.
19. **Medium width (1024–1279 px).** Brief and centre side by side; the model browser and properties open as an
    overlay drawer from the rail (Esc, outside click or the close button dismiss it; revealing an element opens it),
    so the centre never narrows. Below 1280 px the top bar drops the mission crumb and Export's label.
20. **Undo / redo.** Ctrl+Z / Ctrl+Shift+Z (and Ctrl+Y), plus top-bar buttons, step through the Changes & impact log.
    Only edits that touched the model or the week's artefacts are undoable (derived mission-step changes are not).
    An undo restores the engineering model (via `Workspace.replaceAll`, so issued IDs are never reused), the week's
    artefacts, the boundary classifications and the stakeholder map (positions kept), and is itself recorded as an
    "Undo of change n" entry; a new edit clears the redo history. Text fields keep the browser's own undo.
    AppState gained `replaceBoundary` and `restoreMap` for this.
21. **Activity styling in the workbench.** A `SurfaceContext` (`src/components/surface.tsx`) tells activities they are
    in a centre view. `DynamicsExplorer` (segmented scenario control, compact sliders with Plex Mono readouts, charts
    on the workbench tokens with lifted dark-theme series colours), `BoundaryExercise`, `PrinciplesExplorer`,
    `CausalLoopDiagram` (compressed layout, 14.5 px nodes, `fitView` minimum zoom 0.7, token colours) and the shared
    `Card`, `PageHeader`, `Button` and `Badge` take the workbench path there; the stakeholder editor gets a scoped
    density layer (`.wb-embed` in `polish.css`). Text and behaviour are unchanged; the classic page renders as before.
22. **Persistence.** The dynamics explorer restores committed archetype choices from the persisted mission signal
    (`useSignalValue`, no-op outside the workbench); re-publishing an unchanged signal value is ignored.
23. **Code splitting.** Routes, the workbench shell, each centre view, the Reference drawer, the Assessments panel and
    the course map are `React.lazy` chunks with designed skeletons. `/week/1` no longer loads the 14 weeks' content,
    the activity registry or the SysML sources until the Reference / Assessments / course map is opened.
24. **Settings.** Theme and instructor mode moved into a top-bar Settings disclosure (it holds form controls, so it is
    a disclosure, not a menu); an "Instructor mode" chip shows in the top bar while it is on.

