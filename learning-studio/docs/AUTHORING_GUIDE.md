# Authoring guide — one complete course week

This guide is the standard for every week module of the 14-week graduate course *Systems Thinking and MBSE with SysML v2* (Wright State University; continuous AeroLink Urban Mobility case, fictional). Week 1 (`src/content/weeks/week01.ts` + `src/content/week1.ts` + `src/content/quizWeek1.ts`) is the worked exemplar. Read it first.

## 1. What "complete" means

A week is complete only when **all** of these are present and correct (the mechanical part is enforced by `src/content/schema.ts → weekChecks` and `src/content/weeks/weeks.test.ts`):

1. Measurable objectives — already fixed in `src/content/course.ts` (from `WEEKLY_INSTRUCTIONAL_PLAN.md` Part B). Do not change them; if one is wrong, report it.
2. Essential verified readings — already in `course.ts`. Cite only register readings (`npm run` nothing; use `python -I scripts/source_pages.py --list`).
3. Complete instructional explanation — lesson blocks: outcomes, intuition, ≥ 2 formal concepts, ≥ 1 worked example, advanced analysis, application; ≥ 1,800 words of real explanation (graduate level, not padding).
4. Graduate-level engineering worked examples on AeroLink, with numbers where the topic is quantitative (show the calculation; numbers are FICTIONAL and labelled so).
5. ≥ 1 interactive activity (a registered React component, §5).
6. An Air Taxi Enterprise lab (`LabSpec`) consistent with `LABORATORY_AND_CAPSTONE_PLAN.md` Part B for that week: steps, artefacts with stable ID prefixes, continuity to later weeks, app tools.
7. A student assignment with a deliverable template (`AssignmentSpec`, ≥ 3 headings with guidance) and rubric IDs from `ASSESSMENT_RUBRICS.md` (RB-1 … RB-17), with the scope that applies this week.
8. A knowledge check: ≥ 10 questions, exactly one correct option each, an explanation for **every** option, each question citing a verified reading and naming one of this week's objectives; every objective assessed; ≥ 2 Bloom levels, mostly Apply and above for a graduate course.
9. Instructor notes: two 75-minute session plans whose segments add up (default pattern in `WEEKLY_INSTRUCTIONAL_PLAN.md` Part B), ≥ 2 misconceptions with corrections (use the plan's "Misconceptions targeted"), facilitation notes, an answer key / model answers for the lab, assignment and activity, and source cautions.
10. Estimated workload itemised so it sums **exactly** to the syllabus §14 figure (`WORKLOAD_TARGET` in `schema.ts`).
11. Source references.
12. Independent review (done by a separate reviewer, not by you). Leave `review: { status: 'self-checked', openIssues: [] }` when you finish, or `'draft'` with open issues listed if something is unresolved.

## 2. Accuracy rules (non-negotiable)

- **Read the source pages before you write about them.** `python -I scripts/source_pages.py R13` prints the verified range of a reading; `... R13 560 562` a sub-range. Code comments and earlier docs are leads, not evidence.
- **Paraphrase and cite.** A block whose provenance is `source-paraphrase` or `mixed` must carry citations with page ranges inside the reading's verified range. Quotations: short, exact, marked with `quote`, page-cited.
- **Never claim more than the source says.** If you add your own engineering reasoning, mark the block `mixed` and make the boundary clear in the text ("The source states …; applying this to AeroLink …").
- If you need a page that is not inside any register reading, do **not** cite it. Put the request (source, pages, why) in your notes file; the lead adds register entries through the verification script.
- **AeroLink numbers are FICTIONAL.** Use the Data Sheet values in `src/model/airtaxi.ts` (`DATA_SHEET`) and the dynamics defaults in `src/sim/aerolink.ts` where they apply; any new number is labelled FICTIONAL. No real FAA/NASA/OEM figures — there are no such sources in the collection.
- **SysML v2:** the collection's texts are SysML **2.1 Beta 2** / KerML 1.1 Beta 2 and the pilot release 2026-08 training material (S10). Say "SysML v2" or cite the specific text; never call it the final standard. Every SysML listing is a file under `sysml/weekNN/` and must be run through `npm run content:sysml -- sysml/weekNN` (the OMG pilot implementation 2026-08). A conformant listing must PASS; an intentionally invalid teaching listing must be named `invalid_*.sysml` (and declared `intent: 'intentionally-invalid'`) and must FAIL. Partial runs write `sysml/partial-report.json`; the lead regenerates the canonical `sysml/validation-report.json` with a full run. Only the tool decides "validated".
- Known traps: a `satisfy` usage **asserts** the requirement is satisfied (S06 p.168), it is not a wish; requirement groups are valid v2; MITRE p.286 reverses V&V (use only as an exercise); SEBoK page numbers are PDF page indices.
- Do not misrepresent a conceptual exercise as a conformant SysML model. Tools that use the course's own relationship names (derives-from, refines, …) are *teaching* representations; say so.

## 3. Files you own (create only these)

| File | Content |
|---|---|
| `src/content/weeks/weekNN.ts` | `export default` a `WeekContent` (types in `src/content/schema.ts`). Discovered automatically. |
| `src/activities/weekNN.activity.tsx` | `export const ACTIVITIES = { 'key': Component, … }`. Discovered automatically. Keys must be unique course-wide; prefix them with `wNN-`. |
| `src/activities/weekNN/*.ts(x)` | Helpers and **pure logic** for your activities, with tests `*.test.ts(x)` next to them. Put calculations (scores, checks, matrices) in pure functions and test them, including at least one mutation-style test that proves a check can fail. |
| `sysml/weekNN/*.sysml` | SysML listings referenced from lesson blocks (`sysml: [{ file: 'weekNN/x.sysml', … }]`). |
| `docs/authoring/weekNN_notes.md` | Your notes: pages actually read, design decisions, open issues, register requests, anything you could not verify. |

Do **not** edit any other file. If a shared component, type or rule needs to change, describe the change in your notes and in your report; the lead makes shared edits. Do not commit.

## 4. Shared building blocks

- `src/components/ui.tsx` — `Card`, `Button`, `Badge`, `CitationText`, `ProgressBar`, …; `src/pages/WeekPage.tsx` exports `DataTable`.
- `src/state/Workspace.tsx` — `useWorkspace()`: the student's persisted AeroLink engineering model (`src/model/engineering.ts`): `addElement`, `updateElement`, `retireElement`, `addLink`, `removeLink`, `loadReference(week)`. Activities that build artefacts (needs, requirements, risks, functions, …) should write them here with the stable ID scheme so later weeks can use them. Stakeholders are created only in the stakeholder editor.
- `src/model/engineering.ts` — element kinds, allowed link rules, `validateModel`, `requirementCoverage`, `orphansAndChildless`, `impactSet`, `threadsFrom`, `completeThreads`.
- `src/model/reference/` — the instructor reference AeroLink baseline, by week. Use its IDs in worked examples so the case is continuous.
- `src/lib/usePersistentState.ts` — per-browser persistence for activity state (use a key prefixed `wNN-`).
- Styling: Tailwind classes as in existing components; support dark mode (`dark:` variants); never encode meaning by colour alone; every chart or diagram needs a text/table equivalent; all controls keyboard-operable with visible labels.

## 5. Interactive activities

An activity must make the student *do the engineering*: decide, compute, classify, construct, and get specific feedback — not just reveal text. Good patterns: a calculator whose result the student must interpret; a builder that checks the student's artefact against explicit criteria (citing the source of each criterion); a classifier with explanations; a matrix tool (trace, N², allocation) with computed coverage. Each activity's logic is unit-tested.

## 6. Verification before you finish

From `learning-studio/`:
```
npx tsc -b
npx vitest run
npx oxlint src
npm run content:sysml -- sysml/weekNN     (if you added listings)
```
All must pass (oxlint warnings about `only-export-components` in `*.activity.tsx` are acceptable). Report exact results; never claim a run you did not make.

## 7. Rules added from independent reviews (apply to every week)

These defect classes were found in more than one week. Check your module against each before you finish.

1. **Recorders record owner and provenance.** Every activity that writes elements to the workspace renders `ProvenanceOwnerFields` (`src/components/ProvenanceOwnerFields.tsx`), requires valid owner initials (`ownerProblem`), and passes `{ owner, provenance }` into `apply()`. Students must be able to tag an element `AI-suggested-reviewed`.
2. **Graduate tasks are always read.** State in `assignment.rubricScope` which criterion the graduate task is scored on (RB-16 note, DECISION_LOG W7); never rely on RB-16 random sampling alone.
3. **Workload is realistic, not just summed.** For Weeks 10–14, *design to fit the syllabus figure at realistic rates* (see `WORKLOAD_ANALYSIS.md`): cite narrowed page ranges for what the lesson depends on, keep the graduate task to ≈ 1 h including its reading, keep the online lesson to what ≈ 1 h of study covers (≈ 4,000–5,000 words plus activities), and reuse tool set-up done in Week 9. Only if the topic genuinely cannot fit, record the realistic total in `cautions`. Reading at ≈ 15 pp/h (SEBoK density) or ≈ 30 slides/h, plus writing time for every deliverable. If the syllabus total forces an item below a realistic time, say so in `cautions` instead of shrinking it silently.
4. **Reference examples must pass your own checks.** If an activity checks student work, run the reference baseline items through the same checks in a test; if they fail, the reference or the check is wrong — report which (the lead owns the reference).
5. **Heuristic checks must fail on realistic bad input, not just trivial input.** Test each check with a plausible bad example that is long enough to pass length rules.
6. **Quiz items must not be answered verbatim by the lesson or an activity shown earlier.** Rephrase into a new case.
7. **Don't merge a source's levels or terms** (e.g. SEBoK objectives vs measures, criteria vs characteristics). If the course adopts its own convention, label it as the course's.
8. **IDs:** use reference IDs for reference items; any example that differs from the reference uses a new, non-colliding ID.
