# SysML Learning Studio — local course application

Interactive learning environment for the integrated 14-week graduate course **Systems Thinking and MBSE with SysML v2**
(Weeks 1–7 Systems Thinking, Weeks 8–14 MBSE with SysML v2; continuous case *AeroLink Urban Mobility*, a fictional air-taxi enterprise).
Local only: nothing is deployed or uploaded. Course content is a draft pending faculty review.

## Start it (Windows 11, Node 24, npm 11)

```powershell
cd C:\Users\w451vxs\Documents\Course_Work\SysML\learning-studio
npm install        # first time only
npm run dev
```

Open **http://127.0.0.1:5173/**. The server binds to localhost on a fixed port; if 5173 is busy it stops with an error instead of switching port
(stop the other process, or run the production preview below).

Production build: `npm run build`, then `npm run preview` → **http://127.0.0.1:4173/**.

## Verify it

```powershell
npm run typecheck          # TypeScript (tsc -b)
npm test                   # Vitest: content definition-of-done, citations, model, simulation, components
npm run test:e2e           # Playwright in installed Chrome + axe WCAG 2 A/AA, light and dark
npm run content:sysml      # every SysML v2 listing through the OMG Pilot Implementation 2026-08 (needs ../tools, see docs/SYSML_TOOLCHAIN.md)
npm run content:sysml -- --selftest   # proves the validator accepts a valid file and rejects three broken ones
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (http://127.0.0.1:5173/) |
| `npm run build` / `npm run preview` | Production bundle in `dist/` / serve it at http://127.0.0.1:4173/ |
| `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run lint` | Checks (above); lint is oxlint |
| `npm run content:readings` | Regenerate `src/content/readings.generated.json` from the verified reading register |
| `npm run content:rubrics` | Regenerate `src/content/rubrics.generated.json` from `../ASSESSMENT_RUBRICS.md` |
| `npm run content:sysml` | Validate `sysml/**/*.sysml`; a full run writes `sysml/validation-report.json`, which the app uses to label listings |
| `npm run export:curriculum` | Write student and instructor editions of the curriculum (Markdown) to `../exports/curriculum/` |
| `python -I scripts/source_pages.py R13` | Print the verified pages of a reading (authors) |

## How the course is built

- **One module per week** (`src/content/weeks/weekNN.ts`, typed by `src/content/schema.ts`): lesson, worked examples, interactive activities,
  Air Taxi lab, assignment and deliverable template, knowledge check with explanations, rubric references, instructor notes, workload.
- **Definition of done is code**: `weekChecks` (structure, depth, citations, activity, lab, assignment + rubric, quiz coverage of every objective,
  session plans that add up, workload equal to the syllabus estimate, independent review). A week shows "Complete draft" only when all pass.
- **Shared engineering model** (`src/model/engineering.ts`): stable IDs, the course's ten relationship types, validation, requirement coverage,
  impact traversal and 11-link digital-thread detection; the student's model persists in the browser (`/workspace/model`); the instructor
  reference baseline is in `src/model/reference/`.
- **SysML v2 honesty**: a listing is labelled *accepted* only when the reference implementation's report has PASS for the exact text shown
  (SHA-256 match). Teaching tools that use course relationship names are labelled as teaching representations, not SysML models.
- **Sources**: every citation must be inside a verified reading range; rubrics and readings are generated from the project documents.
- Authors' standard: `docs/AUTHORING_GUIDE.md`.

## Layout

```
src/content     outline (course.ts), week modules (weeks/), schema, readings + rubrics (generated)
src/activities  interactive activities, registered by file name (*.activity.tsx)
src/model       engineering model, AeroLink case data, reference baseline (reference/)
src/sim         AeroLink teaching dynamics model (+ tests)
src/state       app state, workspace, progress, week status
src/pages       routed pages; src/components shared UI; src/export curriculum export
sysml/          SysML v2 listings (validated by scripts/check_sysml.py)
e2e/            Playwright tests; screenshots/ output
```

State is stored only in this browser (`localStorage`, key prefix `sysml-studio:v1:`); the app works if storage is blocked, but nothing persists.
Use the JSON export on the workspace pages to keep work.
