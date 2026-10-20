# UI/UX Redesign Proposal — SysML Learning Studio

**Status:** Proposal for faculty review. No application code is changed by this document.
**Date:** 2026-10-19
**Brief:** Master Development Directive §3, §5, §7, §8, §9 (`docs/directives/2026-10-19_MASTER_DEVELOPMENT_DIRECTIVE.md`); DECISION_LOG A15, A20, A21, A22.
**Companion artifacts:**
- Static mockups: `docs/ux/mockups/` (open `docs/ux/mockups/index.html`)
- Mockup screenshots at 1440 px and 400 px, light and dark: `docs/ux/mockups/screens/`
- Proposed token sheet: `docs/ux/mockups/design-tokens.css`

---

## 1. Summary

The app's content is strong and the lecture-first architecture (A20/A21) is right. The UI around it has grown in four separate shells, one per build stream. The course has no home for the student's own enterprise. Practice and project work share the same chrome, and much of the text is too small for comfortable reading or projection. The redesign does not need a rewrite. It needs:

1. **One app shell** with a persistent global navigation: Dashboard · Course · Lecture Studio · Practice · **My Project** · MBSE Studio (from Week 8).
2. **One week template**: a single `WeekShell` with a seven-stage stepper. It replaces the six copied `WeekShell`/`WeekNav` pairs.
3. **A visible ownership system.** AeroLink content (instructor example, practice) and the student's own enterprise (My Project) each get a distinct accent, a labelled banner and an icon. Neither depends on colour alone.
4. **A projector-ready type scale.** The floor is 13 px for UI text and 18 px for reader body text, and slide figure labels must be at least 1/56 of the slide width.
5. **A shared editor kit** (table, inline form, checks panel, status chips, empty states, handoff panel) that every week's lab reuses.

The plan migrates one week at a time and never blocks lecture production (§10).

---

## 2. How the review was done

- Every main surface was screenshotted with Playwright against the running dev server (`http://127.0.0.1:5173`), at 1440 px and 400 px, in light and dark themes, with instructor mode both on and off. That is 124 captures in all.
- For key pages, the rendered text sizes and font families were measured from the DOM (computed `font-size` of every element that holds text), and so were the interactive target sizes.
- The source was read: `src/App.tsx`, `src/index.css`, `src/workbench/theme.css`, `src/flow/Chrome.tsx`, `src/lectures/Chrome.tsx`, `src/week{1,2,3,4,5,8}/WeekShell.tsx` and `WeekNav.tsx`, and the per-week tool CSS. Font sizes across all CSS and TSX were counted.
- Each surface was reviewed twice: once as a **student** (first visit, Week 2 mid-week, phone) and once as an **instructor** (projecting a lecture, reviewing team work).

**Evidence screenshots.** The 19 current-state captures cited in this proposal are kept in `docs/ux/evidence/` (D9 applied
2026-10-19). File names follow `<page>_<width>_<theme>.png`, for example `labtool-w1_1440_light.png`. The full set of 134
captures was taken in a temporary review scratchpad and is not kept.

---

## 3. Findings

Severity: **S1** blocks the directive or confuses students about whose work is whose. **S2** costs comprehension or confidence on every visit. **S3** is polish or consistency.

### F1 (S1). Four different app shells, two brand names, two names for one toggle

| Surface | Header | Brand text | Instructor toggle | Evidence |
|---|---|---|---|---|
| Dashboard, roadmap, progress, Weeks 6, 7, 9–14 (classic) | Left sidebar listing all 14 weeks | "Systems Thinking & MBSE with SysML v2 · Learning Studio · local prototype" | "Instructor review mode" | `dashboard_1440_light.png`, `week9-classic_1440_light.png` |
| Week pages 1–5, 8 | Top bar plus numbered tab row, monospace breadcrumb | "SysML Learning Studio" | "Instructor mode" | `week1_1440_light.png` |
| Lecture viewer and lesson | Third header ("← Week 1", kicker, title, four buttons, theme select), no brand | none | none (follows the global setting) | `lecture-w1s1_1440_light.png`, `lesson-w1_1440_light.png` |
| Lab tool and practice missions | Week top bar **plus** a page title bar **plus** the workbench top bar **plus** a progress bar: four stacked headers | "Practice workbench" | inherited | `labtool-w1_1440_light.png` |

A student moving Dashboard → Week 1 → Lecture → Lab passes through four visual systems in four clicks. Nothing persists across all of them: no global navigation, no save state, no "where am I in the course" marker. The sidebar that lists every week exists only on the dashboard and on the weeks that have not been rebuilt, so the weeks that *are* finished look less integrated than the ones that are not.

### F2 (S1). No home for the student's enterprise; continuity runs through file handoffs

There is no "My Project". Each week's lab tool keeps its own "Team Record", and the course carries data forward by having students **export JSON and re-import it in the next week**:
- Week 2 lab tool: "Import your Week 1 record… Week 1 model-inputs file (team-NN-week1-model-inputs.json)" (`labtool-w2_1440_light.png`).
- Week 8 lab tool: three native file pickers (Week 1 inputs, Week 2 inputs, a teammate's workspace) (`labtool-w8_1440_light.png`).

This works against §1 and §4 of the directive (one continuous project, Phase I feeding Phase II directly). The UI has no artifact library, no milestone view, no cross-week traceability view and no single save, export or history location.

### F3 (S1). Practice and the student's own project look the same, and in places they are mixed

- The **Week 1 lab tool**, where the team enters its *own* Team Record, is branded **"Practice workbench"** (`labtool-w1_1440_light.png`, top bar).
- Its model browser lists "Team Record (your enterprise)" directly above "AeroLink stakeholders (rehearsal)", "AeroLink needs (rehearsal)" and "Boundary candidates (rehearsal)" in the same tree and the same style. The AeroLink practice page shows the same mixed tree (`practice-w1_1440_light.png`).
- The only marker of AeroLink content is an amber "FICTIONAL case" callout. Amber is also the warning colour (`--wb-warn`), and the worked examples page shows the callout twice in a row (`examples-w1_1440_light.png`).
- The legacy stakeholder editor (`/workspace/stakeholders`) edits AeroLink data with an "Add stakeholder / Export / Import / Reset" toolbar that reads like the student's own editor. It is also labelled "Lab L2 / checkpoint CP1", which predates the current schedule (`stakeholder-editor_1440_light.png`).

Directive §5 requires the separation to be "visually obvious". Today a student must read the small print to tell the two apart.

### F4 (S2). Three different lab-tool paradigms

- Week 1: a three-pane IDE-style workbench (rail, mission brief, central view, model browser, problems and console drawer, status bar).
- Weeks 2–5: a long single-column form with "Part 7 · ConOps narrative"-style cards.
- Week 8: a plain form page with file pickers and a readiness list.

Status vocabulary and styling also differ: a monospace "○ not ready" pill (Week 2), an all-caps "INCOMPLETE" chip (Week 1), and "Readiness: ○ not ready" text (Week 8). Students relearn the tool every week, and nothing signals that these are views of one project.

### F5 (S2). Copy-and-adapt code is the root cause of the drift

- `src/week{1,2,3,4,5,8}/WeekShell.tsx` are six 26-line files that differ only in the week number and the component name. `WeekNav.tsx` is copied the same way.
- `Home.tsx` is copied six times (243–249 lines each). `workbench/week{2,3,4}/week{N}tool.css` are 211-line clones whose class prefixes differ (`.w2-`, `.w3-`, `.w4-`). Week 5's copy has already diverged (234 lines).
- Styles live in nine stylesheets with three token families (`--wb-*`, `--lf-*`, and Tailwind `slate-*` and `brand-*`), 52 distinct hex colours, and radii of 2, 3, 4, 6, 8 and 999 px with no clear rule.

Every fix today has to be made six times, so visual consistency decays with every new week.

### F6 (S2). Text is too small and too monospace for long sessions or projection

Measured on the rendered pages (text-bearing elements, 1440 px):

| Page | under 12 px | 12 px | 13 px | 14–15 px | 16 px and up |
|---|---|---|---|---|---|
| Week 1 lab tool | **84** | **138** | 32 | 18 | **2** |
| Course welcome | 20 | 16 | 21 | 18 | 27 |
| Week 1 overview | 20 | 23 | 28 | 57 | 30 |
| Progress page | 20 | 15 | 0 | 78 | 7 |

- The workbench base font is 13 px (`.wb-root { font: 13px/1.45 }` in `theme.css`). The codebase has 26 CSS declarations at 11–12 px, 75 Tailwind `text-[10px]`, `text-[11px]` and `text-[12px]` uses, and 291 `text-xs` uses.
- IBM Plex Mono is used for prose metadata, not only for IDs and code. Examples: the week breadcrumb, the "2 sessions · 48 slides · 69 or 70 min of content per 75-min session, lab included" lines on every week card, the model browser and status bar, and the eyebrows (`week1_1440_light.png`). Monospace prose reads slower and wraps badly.
- Tracked all-caps labels sit above almost every block ("WEEK 1 · OVERVIEW", "TEAM RECORD STEPS", "MODEL BROWSER", "PART 1 · TEAM CHARTER"). They add noise without adding information.

### F7 (S2). Lecture figures are hard to read when projected

- Figure SVGs set label sizes as small as 10–12.5 user units: 14 labels at 10, 13 at 11, 20 at 11.5, 30 at 12 and 21 at 12.5. Because a figure occupies only part of the slide, the box sub-labels on Week 1, Session 1, slide 3 render at roughly 11 px in the 1440 px viewer (`lecture-w1s1_1440_light.png`, "stakeholders, concerns, needs"). The stakeholder editor's node text renders at about 9 px.
- This matches the earlier faculty feedback that Week 1 labels were too small on a projector.
- Presentation mode itself is good: clean, dark, with no chrome apart from Exit (`lecture-present_1440_dark.png`). Keep it.

### F8 (S2). The next action is not obvious; hierarchy is flat

- **Dashboard.** The first screen shows a long description, a "Start here" card, and then each week's full seven-link list as underlined text links (103 interactive elements, `dashboard_1440_light_full.png`). It gives no sign of where the student is, what comes next, or what the team still owes.
- **Week overview.** The page opens with a grey bold "Subject:" run-on line, then two long paragraphs. The ordered week cards start below the fold at 900 px (`week1_1440_light.png`, `week5_1440_light.png`). The tab row shows sequence (1–6) but not completion.
- **Assessment.** A long policy paragraph (due dates, RB-16, 5%) precedes the quiz (`assessment-w1_1440_light.png`). That placement follows A20, but the paragraph should be a scannable summary.

### F9 (S2). Status, save and export are hard to see

- "Saved in this browser" appears only in the workbench footer. Export reminders are buried in body copy ("export after every working session") on several pages.
- Nothing shows course-level progress, and nothing shows team milestone readiness outside the individual lab pages.
- Directive §10 asks for "reliable local save, export/import and recovery first". The UI needs to make the save state and the last export permanently visible.

### F10 (S2). Phone layouts break

- **Dashboard at 400 px.** The "Start here" card squeezes its text into a one-word-wide column, roughly 30 lines long (`dashboard_400_light.png`).
- **Lecture viewer at 400 px.** Eight buttons and a select stack above the slide before any content appears (`lecture-w1s1_400_light.png`).
- **Lab tool at 400 px.** Three header bands use about 430 px of the 900 px viewport before the first field (`labtool-w1_400_light.png`).

### F11 (S3). Accessibility: good foundations, with gaps

Already in place and worth keeping: skip links, `:focus-visible` outlines, `prefers-reduced-motion` handling, token pairs documented at 4.5:1 or better, axe scans in both themes, and keyboard slide navigation.

Gaps:
- On the dashboard, 57 of 103 interactive elements are under 24 × 24 px. Most are inline text links, which WCAG 2.5.8 exempts, but the "Dismiss" control and the header checkbox are not.
- Native, unstyled file inputs (Week 2, Week 8).
- The disabled "Check answer" button and the placeholder text look faint and should be measured.
- Faculty notes render *below* the slide, so an instructor must scroll away from the slide to read them (`lecture-notes_1440_light.png`).
- The instructor toggle is a 13 px checkbox in every top bar.

### F12 (S3). Unbuilt weeks look like a different product

Weeks 6, 7 and 9–14 fall back to the classic sidebar page with "Provisional: being rebuilt" and dense objective tables (`week9-classic_1440_light.png`). Faculty should approve whether they render in the new week template with an honest "In preparation" empty state.

---

## 4. Design principles

1. **Teach first, then practise, then apply.** The order Overview → Lecture → Lesson → Worked example → Practice → Apply → Assessment is fixed and visible on every week page (A15, A20). No quiz or dense tool is ever a week's first screen.
2. **Ownership is always visible.** Every surface says whose data it shows: *Instructor example · AeroLink (fictional)* or *Your enterprise · {name}*. It uses a distinct accent, a labelled banner and an icon, and never relies on colour alone.
3. **One project, one place.** The student's work lives in My Project and nowhere else. Week labs are *views* of the project, not separate records.
4. **Show the next action.** Each landing surface leads with the single most useful next step and makes the team's open obligations visible.
5. **Readable at the back of the room.** Type sizes are set for 75-minute lectures, projection and long reading, not for density.
6. **Honest engineering states.** Checks find structural gaps. The instructor decides validity, and the UI says so. Nothing is shown as "valid" without evidence (§4).
7. **Quiet, professional, consistent.** Choose restraint over decoration: one accent per role, two elevation levels, motion only to confirm a user's action.

---

## 5. Information architecture

### 5.1 Global navigation (persistent app shell)

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ ◈ SysML      │ Breadcrumb ............................ ● Saved · Export │
│   Learning   ├──────────────────────────────────────────────────────────┤
│   Studio     │                                                          │
│ ⌂ Dashboard  │                  page content                            │
│ ▤ Course     │                                                          │
│ ▭ Lecture    │                                                          │
│   Studio     │                                                          │
│ ⚗ Practice   │                                                          │
│┌────────────┐│                                                          │
││▣ My Project││  ← always visible, own accent, shows enterprise name,    │
││ SkyMed …   ││    current milestone and progress                        │
││ ▬▬▭▭▭▭▭    ││                                                          │
│└────────────┘│                                                          │
│ ⬡ MBSE Studio│  ← Week 8 onward (locked with "W8" before; decision D4)  │
│ ─────────    │                                                          │
│ ▯ Sources    │                                                          │
│ Instructor ○ │                                                          │
│ Theme      ○ │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

| Destination | Purpose | Contains (current routes reused) |
|---|---|---|
| **Dashboard** | Where am I, what is next, what does my team owe | Next step, this week's stepper, My Project summary, due list, course map (replaces `/` and `/roadmap`) |
| **Course** | The 14 weeks and each week's flow | Week pages (`/week/:n`), detailed lesson (`/week/:n/lesson`), worked examples, assessment |
| **Lecture Studio** | Teaching and reviewing slides | Slide viewer, notes, presentation, handout, .pptx (`/week/:n/lecture/:s`) |
| **Practice** | AeroLink sandbox, by week | Practice missions (`/week/:n/examples/practice`), resettable, never writes to the project |
| **My Project** | The team's enterprise, persistent | Overview, Milestones, Artifacts (editors), Traceability, History, Export and import |
| **MBSE Studio** | Weeks 8–14 modelling of the same project | Week 8 baseline transformation, model views, checker (`/workspace/model` and Week 8 tool) |
| Secondary | Reference | Sources (`/sources`), toolchain (`/sysml`), and instructor review (`/instructor`, shown only in instructor mode) |

The shell keeps a header for the breadcrumb, the save state and **Export**. The rail collapses to icons in Lecture Studio and MBSE Studio to give the canvas width (mockups c and g). On phones it becomes a five-item bottom bar: Home · Course · Practice · My Project · MBSE.

### 5.2 Per-week flow (one template for all 14 weeks)

```
 ① Overview → ② Lecture → ③ Lesson → ④ Worked example → ⑤ Practice → ⑥ Apply → ⑦ Assessment
                                       └─ AeroLink ──────────────┘   └ My Project ┘
```

- **Overview.** The week's question, what you will produce (artifact chips linked into My Project), what it builds on (prior artifact IDs and counts), class and out-of-class time, readings.
- **Lecture and Lesson.** Unchanged content pipeline (A20). Lecture Studio opens in context.
- **Worked example and Practice.** Plum "Instructor example" identity.
- **Apply.** Opens the matching My Project editor with the week's lab instructions docked beside it. The lab *instructions* page stays on the week, but the lab *tool* is My Project.
- **Assessment.** Always last. It shows the quiz and the submission readiness drawn from My Project.

The stepper shows each stage's state (done, current, not started), its owner (example or project), and a one-line sub-label ("2 sessions", "AeroLink", "My Project").

**Change from today:** Practice becomes a visible stage instead of an "optional" sub-page of Worked examples, and "Laboratory" is renamed "Apply · My Project". Both need faculty approval (D1).

### 5.3 My Project structure

```
My Project
├─ Overview       title block (name, ENT ID, team, approval, SoI, baseline rev, last export),
│                 mission, boundary sketch, team roles, traceability health, save/export/history
├─ Milestones     W1–W14 track; per week: expected artifacts, status, open tasks, readiness
├─ Artifacts      library grouped by type and week; each opens its editor
│  ├─ Stakeholders · Needs · Context · ConOps · Scenarios · Capabilities · Requirements
│  ├─ Technology assessments · AROU / risk register · Trade studies
│  ├─ Architecture elements · Information flows · Components · Interfaces · Roadmap
│  └─ (Phase II) Model elements · Verification plans · Analysis results
├─ Traceability   STK → CON → NEED → CAP/REQ → … matrix and impact view
├─ History        revisions, rationale, restore
└─ Export/import  documented project file, readable report, validated import with conflict review
```

---

## 6. Design system ("Studio DS")

The token sheet is `docs/ux/mockups/design-tokens.css`. It **extends** the existing tokens rather than replacing them: neutrals and status colours keep the `--wb-*` values from `src/workbench/theme.css`, and the course accent keeps the teal `brand-600` from `src/index.css`. The migration exposes them under role names and retires the duplicates (`--lf-s1`/`--lf-s2`, raw `slate-*`).

### 6.1 Type

The families are unchanged. IBM Plex is already bundled offline through `@fontsource`, so the change adds no new dependency.

| Role | Family | Use |
|---|---|---|
| Display | IBM Plex Sans Condensed 600 | Page and section titles, slide titles |
| Body/UI | IBM Plex Sans 400/500/600 | Everything else |
| Mono | IBM Plex Mono 400/500 | **Only** IDs (`STK-009`), code and SysML text. Never metadata or eyebrows |

| Token | Size | Use | Today |
|---|---|---|---|
| `--t-caption` | 13 px | Floor for any UI text: captions, chip labels, table headers | 10–12 px common |
| `--t-small` | 14 px | Secondary UI, table cells, buttons | 12–13 px |
| `--t-ui` | 16 px | UI base, form fields | 13 px in workbench |
| `--t-read` | 18 px | Lesson and long-form reading, line height 1.6, measure ≤ 72ch | 16.5 px |
| `--t-h4` / `h3` / `h2` / `h1` | 20 / 24 / 30 / 38 px | Section hierarchy | varies |
| `--t-display` | 48 px | Week title only | about 34 px |

**Slide scale (relative to slide width W, so it holds in the viewer, presentation mode and the generated .pptx):**

| Element | Minimum | At 1600 px canvas | In 13.33 in .pptx |
|---|---|---|---|
| Slide title | W/27 | 59 px | ≈ 36 pt |
| Body bullet | W/40 | 40 px | ≈ 24 pt |
| **Figure label** | **W/56** | **≈ 28.6 px** | **≈ 17 pt** |
| Caption, source line | W/68 | 24 px | ≈ 14 pt |

The figure rule is a check the figure registry can run (`components/figures/registry.ts`). Every `<text>` in a registered figure, scaled by how much of the slide the figure occupies, must be at least W/56. Mockup c2 (`lecture-present.html`) is built to this rule.

**Density modes:**
- **Comfortable** (default; lesson, week pages).
- **Compact** (editors and tables; reader drops to 16 px, the floor stays 13 px).
- **Projector** (instructor toggle; the whole scale × 1.25, including figures).

### 6.2 Colour roles

Each role has a solid colour (text and icons, at least 4.5:1 on panels), a soft fill and an edge. Ratios below were computed with the WCAG formula.

| Role | Light | Dark | Meaning | Contrast (solid on panel) |
|---|---|---|---|---|
| Course (existing teal) | `#0f6e8c` | `#4fb3d4` | Navigation, lectures, primary actions | 5.8:1 (white text on it) |
| **My Project** (new indigo) | `#3d4ac4` | `#9aa4ff` | The student's own enterprise | 7.1:1 / 7.3:1 |
| **Instructor example** (new plum) | `#8a3a78` | `#e391cf` | AeroLink worked example and Practice | 7.1:1 / 7.4:1 |
| MBSE Studio (new) | `#155e52` | `#6fcfb9` | Model surfaces, Weeks 8–14 | 7.6:1 / 9.0:1 |
| ok, warn, bad (existing `--wb-*`) | `#23683b` `#8a5200` `#b3261e` | `#5cc27e` `#e8a33c` `#f07a70` | Status only, never ownership | 5.4–5.8:1 on their soft fills |

Rules:
- **Status colours never mark ownership.** The amber "FICTIONAL" callout is replaced by the plum example banner, which keeps "(fictional)" in its text.
- **Ownership is triple-coded.** It always uses a labelled banner or label ("Instructor example · AeroLink (fictional)" or "Your enterprise · SkyMed"), an icon (target or folder), and an accent. The example banner also carries a subtle diagonal hatch, so the two stay distinct in greyscale and for colour-blind users (mockups e and f).
- Neutrals and dark-mode values are taken from the existing `--wb-*` sets, which are designed rather than inverted.

### 6.3 Space, radii, elevation, motion

- **Space:** a 4-point scale (4, 8, 12, 16, 24, 32, 48, 64). Page gutter 32 px on desktop, 16 px on phone.
- **Radii by hierarchy:** chips 999 px · controls 6 px · cards 10 px · major surfaces 14 px. This replaces six ad-hoc values.
- **Elevation:** two levels. `e1` is a hairline plus a faint shadow for resting cards. `e2` is reserved for overlays and the handoff panel. No coloured shadows, no gradient washes.
- **Motion:** 120 to 180 ms with standard easing, used only to confirm a user action (open a drawer, save, expand). No entrance animations, no parallax, no animated counters. Everything is disabled under `prefers-reduced-motion`, which is already global in `index.css`.

### 6.4 Focus and states

- **Focus ring:** a 2 px panel-coloured gap plus a 2 px course ring (`--focus`), visible on every surface in both themes.
- **Every interactive element has five defined states:** hover, active, focus, disabled and selected. Disabled controls also carry a reason in a tooltip, because a faint button alone does not explain itself.
- **Errors:** red text with an icon under the field, plus `aria-invalid` and `aria-describedby` (mockup e). The field border also changes, so the cue is not colour-only.

---

## 7. Component inventory

"Reuse" names the existing component or file that each one grows from.

| Component | Spec | Reuse | Mockup |
|---|---|---|---|
| **AppShell** | Rail (expanded or compact), header (breadcrumb, save state, export), phone bottom bar, skip link, instructor and theme settings | `flow/Chrome.tsx` `TopBar` and `Settings`; `App.tsx` sidebar | all |
| **WeekShell** (single) | `WeekShell({ week })`: week header, facts, stage stepper; data from `content/course` | merges the six `week*/WeekShell.tsx` and `WeekNav.tsx` | b |
| **StageStepper** | Seven stages; done, current or todo; owner sub-label; scrolls horizontally on phones; `aria-current="step"` | `flow/Chrome.tsx` `StageBar` | a, b |
| **Slide viewer** | Slide, notes side panel (instructor), outline drawer, progress, timer, keyboard help; modes Slide / Slide + notes / Present | `lectures/LectureViewer.tsx`, `SlideFace.tsx` | c1 |
| **Presentation mode** | Full-bleed 16:9, a control strip that hides after 3 s idle, B to blank, Esc to exit | existing present mode | c2 |
| **Reader** | Single column ≤ 72ch, 18 px, sticky contents, figure frames, "Check your understanding" collapsed at section ends | `lectures/LessonReader.tsx` | — |
| **Ownership banner** | `Banner kind="project"\|"example"`: icon, bold label, one sentence, optional action | new; replaces the "FICTIONAL" callouts | e, f |
| **Artifact card** | Type, week, count, ID range, status chip, link to editor; empty and future variants | `components/ui.tsx` `Card`, `Badge` | d |
| **Status chip** | Complete · Draft (dashed) · Not started · Review (triangle) · Incomplete (cross) · Locked; icon plus word | `workbench/ui.tsx` `StateChip`, `SeverityChip` | d, e |
| **Data table** | Sticky header, row selection, keyboard row navigation, columns hidden on phones, ID column in mono | Week 2–5 tables; the legacy editor's "Table (keyboard-accessible)" view | e |
| **Inline editor form** | Two-column fields, hint and error slots, linked-records chips, Revert and Save | lab tool forms | e |
| **Checks panel** | Summary chips (errors, review, passing), readiness bar, items each with "why" and "go to" actions, an "instructor decides validity" footer | `workbench/problems.ts`, `PanelHeader` | e |
| **Milestone tracker** | 14 nodes in two phase groups; done, current, future, and the Week 8 key node; detail strip with readiness | new | d |
| **Title block** | The project's identity grid (ENT ID, team, approval, SoI, baseline revision, last export) | new | d |
| **Empty state** | States what belongs here, why, which method teaches it, and one primary action | new | d ("Requirements") |
| **Onboarding tip** | First-visit-only coach mark anchored to one control, dismissible, never modal, at most one per screen; "Show tips again" in settings | `workbench/ui.tsx` `Tip` | — |
| **Handoff panel** | From/to strip (AeroLink → your enterprise), "Now apply this engineering method to your own enterprise", three columns (what you create · what it builds on · how you know it is done), primary "Open {editor}", secondary "Start from a blank template" with a note on what the template copies and that the student confirms | new (§8 of the directive) | f |
| **Mapping view** | Two panes (source package and model baseline) with a gutter; five-status legend with shapes; summary bar; detail panel with source facts, "insufficient information" alert, generated text, honesty note, actions | Week 8 lab tool and checker | g |

**Week 8 mapping statuses (§9).** Each status pairs a shape with a colour and a word:

| Status | Shape | Colour |
|---|---|---|
| Not mapped | hollow circle | neutral |
| Mapping proposed | dashed circle | course teal |
| Mapped | filled circle with check | ok |
| Needs review | triangle with ! | warn |
| Invalid or incomplete | square with × | bad |

---

## 8. Accessibility (WCAG 2.2 AA)

| Criterion | Target | How it is checked |
|---|---|---|
| 1.4.3 / 1.4.11 contrast | Text ≥ 4.5:1, large text and UI parts ≥ 3:1, in both themes | Token contrast test (pairs listed in §6.2) plus the existing axe e2e scan |
| 1.4.1 use of colour | Ownership and status are never colour-only | Review checklist; every chip has an icon and a word |
| 1.4.4 / 1.4.10 resize and reflow | No loss at 200 % zoom; no horizontal scroll at 320 px | e2e at 320 px and 400 px on every route |
| 1.4.12 text spacing | Layout survives the WCAG spacing override | e2e style injection |
| 2.1.1 keyboard | Every action is reachable; slide keys; table row navigation; the stepper is a list of links | e2e keyboard paths below |
| 2.4.7 / 2.4.11 focus visible and not obscured | Ring on every control; the sticky header never covers the focused element (`scroll-padding-top`) | e2e |
| 2.5.8 target size | ≥ 24 × 24 px for non-inline controls; 40 px default | DOM scan in e2e |
| 3.3.1 / 3.3.3 errors | Field-level message with `aria-describedby` and a fix suggestion | Unit tests on editors |
| 4.1.3 status messages | Save state, check results and import results announced through `role="status"` | e2e |

**Keyboard paths that must pass:**
1. Dashboard → continue lecture → advance three slides → toggle notes → present → Esc.
2. Dashboard → My Project → Stakeholders → add a stakeholder → fix a check error → save.
3. Week page → Practice → finish → handoff → open the editor.
4. Week 8 → select an artifact in the left pane → read its detail → follow "Add the concern in My Project".

---

## 9. Responsive rules

| Width | Layout |
|---|---|
| ≥ 1280 px | Expanded rail (248 px); content up to 1320 px; editors two columns (table and checks); Lecture Studio uses the compact rail plus slide and notes side by side; the slide outline is a drawer below 1600 px |
| 1024–1279 px | Expanded rail; side panels drop below the main column |
| 600–1023 px | No rail; top bar plus five-item bottom bar; single column; the stepper scrolls horizontally with the current stage scrolled into view |
| < 600 px | 16 px gutters; tables hide secondary columns; action rows go full width; the lecture shows the slide, then a single row of controls, then the lesson text for that slide; the Week 8 panes stack (source above model) |

Check: no route produces horizontal page scroll at 320, 400, 768, 1024 or 1440 px. The mockups were measured at 1440 and 400 px with zero overflow.

---

## 10. Phased migration plan

Each phase ships on its own, reuses existing components, and touches week content files only as much as needed. Lecture production (slides, notes, lesson, pptx) is never blocked; content sources are untouched until P4. The phases line up with directive §11 priorities.

| Phase | Scope | Reuses | Unblocks | Size |
|---|---|---|---|---|
| **P0 Tokens** | Add role tokens to `index.css` (`--project-*`, `--example-*`, `--mbse-*`, type scale) as aliases of `--wb-*`. No visual change yet | `theme.css`, `index.css` | Everything | S |
| **P1 Shell consolidation** | One `WeekShell` and `WeekNav` driven by the week number (delete five copies); one `AppShell` used by the dashboard, the week pages, the lecture viewer and the workbench (four headers become one); global save state and Export in the header | `flow/Chrome.tsx`, `lectures/Chrome.tsx` | Consistency fixes become one-place fixes | M |
| **P2 My Project surface** | Rail entry, Overview (title block, milestones, artifact library), Export and import page. These sit on the canonical data model from `CANONICAL_ENGINEERING_DATA_MODEL.md` (separate workstream) | `components/ui.tsx` | Demo steps 3–7 | M |
| **P3 Ownership system** | `Banner` component; the plum example identity on worked examples, practice and the legacy AeroLink editor; rename the Week 1 lab tool from "Practice workbench" to "My Project · Team Record"; split the model browser so it never mixes AeroLink rehearsal data with team data | workbench shell | Directive §5 | S |
| **P4 Readability** | Type floor 13 px and reader 18 px; mono limited to IDs and code; remove the tracked all-caps eyebrows; add the figure-label rule test, then fix figures week by week (Week 1 first) as each week's .pptx is next regenerated | `lectures.css`, `flow.css`, figure registry | Projector feedback | M (spread across weeks) |
| **P5 Editor kit** | Data table, inline form, checks panel and status chips as shared components; port the Week 1 Team Record editors first, then Weeks 2–5 forms, one week per batch | Week 2–5 tool code, `problems.ts` | One lab paradigm | L (incremental) |
| **P6 Practice → Project handoff** | Handoff panel at the end of each practice mission; "Apply" stage deep-links to the My Project editor with the lab instructions docked | missions registry | Directive §8 | S per week |
| **P7 Week 8 mapping view** | Two-pane transformation with five statuses, reading the Phase I package from My Project instead of imported files | Week 8 tool and checker | Directive §9 | M |
| **P8 Dashboard and onboarding** | Next-step hero, stepper, My Project card, course map, due list; first-visit tips (one per screen); fix the 400 px "Start here" collapse | `pages/Dashboard.tsx` | Demo steps 1, 6 | S |
| **P9 Remaining weeks** | Weeks 6, 7 and 9–14 render in the new template with an honest "In preparation" state until their content lands | `WeekShell` | Directive P5 | S |

Ordering: P0 → P1 come first, as the directive asks ("shared WeekShell consolidation first"). P2, P3 and P8 can run in parallel with lecture batches. P4 and P5 proceed one week at a time, alongside each week's content milestone. A week is "migrated" when it passes the acceptance criteria below.

---

## 11. Acceptance criteria (measurable)

**Structure**
1. Exactly one `WeekShell` and one `WeekNav` component exist. `grep -l "function Week.*Shell" src/week*/` returns at most one file.
2. 100 % of routes render inside `AppShell`. An e2e test asserts the presence of `[data-testid=app-shell]` on every route in the router table.
3. My Project is reachable in one click from every route, and the next lecture is reachable in one click from the Dashboard.

**Ownership**
4. Every route that shows AeroLink data has `data-owner="example"` and a visible example banner. Every My Project route has `data-owner="project"`. An e2e test walks all routes.
5. No view lists AeroLink records and team records in the same tree or table. This is a unit test on the model browser groups.
6. Copying from Practice to a project requires a confirmation step and copies structure only. An e2e test confirms nothing changes before confirmation.

**Readability**
7. No rendered text element below 13 px in app UI, excluding slide canvases and decorative thumbnails. An e2e DOM scan of every route at 1440 px enforces this. Today the Week 1 lab tool has 222 such elements.
8. Lesson body is at least 18 px with a measure of 72ch or less.
9. Every registered lecture figure meets the W/56 label rule. A figure registry test enforces this, applied as each week's deck is regenerated.
10. IBM Plex Mono appears only on elements with `.id`, `code`, `pre` or SysML listings. An e2e font-family scan enforces this.

**Accessibility and responsive**
11. axe reports 0 serious or critical issues on all routes in both themes.
12. Zero horizontal overflow at 320 and 400 px on all routes.
13. Non-inline targets are at least 24 × 24 px.
14. The four keyboard paths in §8 pass as e2e tests.

**Status**
15. Save state is visible on every My Project and Practice screen. "Last export" is visible on the Dashboard and the My Project overview, with a warning after a threshold that faculty set (D8).
16. Each week page shows the completion state of all seven stages.

---

## 12. What not to do

- **No gamification.** No points, badges, streaks, confetti, levels or leaderboards. Progress shows engineering readiness, not reward.
- **No decorative animation.** No entrance fades on sections, no hover lifts on every card, no animated counters or backgrounds.
- **No quiz first.** Assessment is always the last stage. Check-your-understanding items stay collapsed at the end of reader sections (A20).
- **No dense tool as a week's first screen** (A15). The workbench and editors are reached through Apply or My Project.
- **No "valid" badge without evidence.** Checks report structural gaps. Model validity is decided by the course checker, and engineering adequacy by the instructor.
- **No claim of collaboration** the local build cannot deliver (§10). Say "Saved in this browser", never "Synced".
- **No new paid or remote dependencies.** The fonts are already bundled; the mockups load Google Fonts only for convenience.
- **No renaming of the governing schedule titles** (§2). Short labels in the course map need approval (D3).

---

## 13. Mockups

All mockups are static, self-contained HTML files in `docs/ux/mockups/`, each with the token sheet inlined. They load nothing external except Google Fonts (IBM Plex), and fall back to system fonts offline.

Project screens use a fictional student enterprise, **SkyMed Regional Delivery Network** (drone delivery of lab samples and blood products between hospitals and rural clinics). Instructor and practice screens use AeroLink. All content is illustrative: dates, counts, values and reading citations are placeholders, not course data.

| # | File | Shows | Screens |
|---|---|---|---|
| a | `dashboard.html` | Next-step hero, seven-stage stepper with resume card, course map (Week 8 key node), **My Project card** (approval, milestone checklist, artifact counts, export warning), due list | `screens/dashboard-{1440-light,1440-dark,400-light}.png` |
| b | `week-page.html` | Week header with facts, stage stepper, lecture session cards, ordered flow with ownership-coded rows, "What your team produces", "Builds on Week 1" | `screens/week-page-*.png` |
| c1 | `lecture-viewer.html` | Compact rail, slide + faculty notes side by side (say, ask, watch for, source), timer, next slide, keyboard help | `screens/lecture-viewer-*.png` |
| c2 | `lecture-present.html` | Presentation mode; slide built to the W/56 label rule | `screens/lecture-present-*.png` |
| d | `project-overview.html` | Title block, 14-week milestone tracker, artifact library (complete, draft, empty and locked states), boundary sketch, team roles, traceability health, save/export/history | `screens/project-overview-*.png` |
| e | `stakeholder-editor.html` | Project banner, method backlink to the lecture and lesson, register table, inline form with field errors, checks panel with "why" and "go to" actions | `screens/stakeholder-editor-*.png` |
| f | `practice-handoff.html` | Example banner, practice result, **handoff panel** "Now apply this engineering method to your own enterprise" | `screens/practice-handoff-*.png` |
| g | `week8-transformation.html` | Document, model element and relationship explainer; five-status summary; Phase I package to model baseline panes; detail showing where the document is insufficient, plus generated SysML v2 text with an honesty note | `screens/week8-transformation-*.png` |

---

## 14. Decisions needing faculty approval

| ID | Decision | Recommendation |
|---|---|---|
| D1 | Make **Practice** a visible stage and rename "Laboratory" to **"Apply · My Project"** (seven-stage stepper). Today Practice is optional under Worked examples | Approve. It matches §3B and §8 and keeps the stage order of A15 and A20 |
| D2 | **Role colours:** plum for the AeroLink instructor example and practice, indigo for My Project, green for MBSE Studio. This retires the amber "FICTIONAL" callout | Approve |
| D3 | **Short week labels** in compact views such as the course map and milestones ("ConOps, requirements"). The full whiteboard titles are always used on week pages | Approve short labels as display-only, or require full titles everywhere |
| D4 | **MBSE Studio before Week 8:** shown with a lock and "W8", or hidden until Week 8 | Show it locked, so students see the continuity |
| D5 | **Lab tool moves into My Project.** Lab *instructions* stay on the week page, and the editors live in My Project. Students stop exporting and importing JSON between weeks (export remains for submission and backup) | Approve. It depends on the canonical data model workstream |
| D6 | **Type scale increase** (13 px floor, 18 px reader, W/56 figure labels). This changes the look of approved Week 1 material and requires figure fixes when each deck is next regenerated | Approve, applied week by week without reopening Week 1 content approval |
| D7 | **Instructor mode:** a settings toggle in the rail with a persistent "Instructor mode" pill, plus a Projector density mode | Approve |
| D8 | **Export reminder threshold:** for example, warn when the last export is more than 2 days old or more than 20 edits ago | Faculty to set |
| D9 | Keep the **current-state evidence screenshots** in the repo (`docs/ux/evidence/`, about 15 images), or keep them out | Keep a curated set for the record |
| D10 | Weeks 6, 7 and 9–14 shown in the new template with an "In preparation" state, instead of the classic provisional page | Approve |
