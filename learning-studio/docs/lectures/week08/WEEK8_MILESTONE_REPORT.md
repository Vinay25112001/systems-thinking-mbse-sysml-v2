# Week 8 milestone report: Import Systems Thinking Artifacts / Stakeholders

**Status.** Built 2026-10-19 on the Week 1 template (DECISION_LOG A19–A21). Independently reviewed the same day (REVISE, 2 major, 6 moderate, 9 minor) and revised: **the changes, the current checker results and the current gate results are in `WEEK8_REVIEW_DISPOSITIONS.md`, which supersedes sections 7–9 below where they differ** (those sections record the original build). Pending faculty approval. Not committed (the course lead commits).
**Scope.** The Phase II opener: an introduction to MBSE and the SysML v2 foundations and tool navigation (A21 decision 8), and the whiteboard subject: each team imports its own Week 7 Systems Thinking package and models its stakeholders and concerns. AeroLink is the instructor reference only (A21 decision 9).

## 1. Files

### New

| Area | Files |
|---|---|
| Lecture source (slides, notes, lesson) | `src/content/lectures/week08/session1.ts`, `session2.ts` |
| Week 8 case and rules | `src/content/lectures/week08/aerolinkCase.ts` (AeroLink import: source, generated model, matrix, findings, audit, the nine places of the 20-minute charge), `labBrief.ts` (mapping kinds, packages, relationship keywords, finding classes, audit questions, outputs, minimums, person-hours), `listings.ts` (every slide listing, excerpted from a checked file) |
| Tests | `src/content/lectures/week08/timing.test.ts` (validator, pacing, hygiene, register, workload, both directions); `src/content/quizWeek8.test.ts`; `src/workbench/week8/skeleton.test.ts`, `sysmlWeek08.test.ts`, `Week8LabTool.test.tsx`; `src/content/lab/week08Lab.test.ts` |
| Figures | `src/components/figures/LectureWeek8S1.tsx` (17 figures), `LectureWeek8S2.tsx` (10 figures), original SVGs; `LectureWeek8Code.tsx` (the code-listing figure, 16 listings) and `listingRows.ts` |
| Lab tool | `src/workbench/week8/skeleton.ts` (import, mapping, audit, generator), `generated.ts`, `state.ts`, `Week8LabTool.tsx`, `week8tool.css` |
| Lab instructions | `src/content/lab/week08Lab.ts`; generated `docs/lectures/week08/WEEK8_LAB_INSTRUCTIONS.md` |
| Assessment | `src/content/quizWeek8.ts` (Q8, 12 items) |
| Web module | `src/week8/` (route, nav, shell, app, Home, Examples, exampleParts, Lab, Assessment, Readiness, week8.css); `src/content/week8Path.ts` |
| SysML v2 | `sysml/lectures/week08/` (9 files + `week08-report.json`), `sysml/instructor/week08/exercise_microgrid_key.sysml` |
| Scripts | `scripts/build-week08-sysml.mjs` (writes the three generated SysML files) |
| End-to-end | `e2e/lectures-week8.spec.ts`, `e2e/week8-flow.spec.ts` |

### Edited (small, additive Week 8 blocks)

`src/App.tsx` (Week 8 routes, archive route `/archive/week/8`), `src/pages/Dashboard.tsx` (Week 8 path card, Available), `src/lectures/route.ts` (`WEEK_PAGES` adds 8), `src/lectures/Chrome.tsx` (Week 8 navigation), `src/content/lectures/index.ts` (both sessions registered), `src/components/figures/registry.ts` (delimited Week 8 block), `scripts/build-lab-md.mjs` (Week 8 entry), `scripts/build-lectures.mjs` (one line: `--week N` validates only that week, so one week’s export is not blocked by another week in progress), `playwright.lectures.config.ts` (Week 8 spec).

### Edited (AeroLink canonical data, the Week 8 reconciliation)

`src/model/reference/week01.ts` (ENT-001 named “AeroLink Urban Mobility” with the case’s enterprise text; EXT-001/002/004/006 named as systems), `src/model/reference/week02.ts` (CON-015 reworded as the case’s purchase-agreement concern), `sysml/reference/aerolink_v01..v04` (the same names in the docs, the external-system part definitions and usages renamed as systems, CON-015 reworded; all four re-checked: PASS, no message), `src/content/lectures/week01/aerolinkCanonical.test.ts` (allowlist: `name:ENT-001`, `name:EXT-001/002/004/006` and `name:CON-015` removed; `missing:STK-015` and `missing:CON-017` kept with an updated reason, see §8).

## 2. Sessions and slides

| | Session 1 | Session 2 |
|---|---|---|
| Subtitle | From documents to a model: MBSE and the SysML v2 language | Packages, the toolchain, the import, stakeholders and concerns |
| Slides | 25 (24 content + references) | 21 (20 content + references) |
| Minutes | 69 content + 6 buffer = 75 | 69 content (47 lecture + 22 lab launch) + 6 buffer = 75 |
| Sections | Framing; MBSE; model and view (notations); language architecture; definition and usage; attributes and the worked network; calibration | Retrieval; packages and names; tools; the import; stakeholders and concerns; audit and bridge; lab launch |

Session 1 earns the change of representation (one number in nine places), defines model, language, MBSE, model and view, shows the textual and graphical notation of one element, then the four-layer architecture, ownership, “everything with structure and behavior is a part”, definition and usage, part and attribute definitions, features and multiplicity, specialization, subsetting, redefinition, the `:>` reading rule, quantities with units, a worked configuration example and a predict-the-checker calibration. Session 2 covers packages, imports and visibility, names and short names (the ID rule), comments and documentation, the course toolchain and what the checker decides, the import as a mapping, the mapping matrix, the package skeleton, stakeholders and concerns as language elements, framing, the AeroLink context and stakeholder model, the audit, the Week 9 bridge and the lab launch (brief, 12 min of team work in the lab tool, the tool-proof checkpoint, the seven-day plan).

## 3. Faculty notes

Every content slide has teach, why, transition and timing notes, a figure walk where a figure is shown, misconceptions where useful, and instructor-only preparation in examples. Spoken notes (teach + worked solution + figure walk) run 40–130 words per planned minute on every lecture slide (timing.test.ts enforces both bounds); lab-launch slides carry minute-by-minute run-the-room notes. About 6,400 note words in Session 1 and 6,200 in Session 2 (spoken: about 4,300 each).

## 4. Examples

- The worked examples page (`#/week/8/examples`) shows the worked-example slides and their lesson sections: the vertiport network (definitions describe kinds, usages describe configurations), the mapping matrix and the skeleton, the context and stakeholder model, the audit; then the full AeroLink mapping matrix (30 kinds), the tool’s findings for AeroLink, and the generated AeroLink model file.
- The AeroLink model v0.1 (`sysml/lectures/week08/aerolink_context_stakeholders_v01.sysml`) is GENERATED from the corrected Week 1 case by the same generator the lab tool uses: ENT-001, the six external systems named as systems, 15 stakeholders with assessment metadata, 17 concerns with subject and stakeholder, 8 relationships as tagged dependencies, every later package with the IDs it will hold.

## 5. Laboratory

- Lab L8: model v0.1 of the team’s own enterprise: mapping matrix for the whole package, skeleton with purpose, Context and Stakeholders modeled, import audit, checker log. Inputs are the Team Record exports (Week 1 model inputs v1–v3, Week 2 model inputs v1) and the Week 7 package for the Weeks 3–6 kinds. Workload: about 8.0 person-hours for a team of four (2.0 h each); a team of three works to a stated reduced scope (6.0 person-hours, 2.0 h each), pending faculty approval.
- Lab tool (`#/week/8/lab/tool`): imports the files (refuses other files, AeroLink records, invalid JSON, wrong versions, duplicate or malformed IDs, with a message), builds the mapping matrix (counts entered by hand for kinds the exports do not carry), lists findings by class, answers the completeness and structure questions, previews the generated SysML v2, and exports `team-NN-model-v01.sysml`, `team-NN-mapping-matrix.md` and a shared workspace file. The only hard gate is a real defect: a relationship whose end is not a registered stakeholder is left out of the file (it would not resolve) and listed; everything else imports and is reported as a gap to disposition. Tested in both directions; the generator’s output for the fixture team record and for an adversarial “stress” record (quotes, backslash, comment terminator, reserved words, empty and duplicate names, a dangling relationship) both pass the checker.

## 6. Sources verified

Every citation is a verified register entry at pages inside its range (timing.test.ts checks it), and each claim below was read in the extracted source text (`_source_cache/*.txt`) before it was written.

| Claim | Citation |
|---|---|
| OMG definition of a model (“a selective representation…”); physical, mathematical, logical; many models per system | R33a p.290 |
| Abstract syntax, concrete syntax, semantics; tools check conformance to the rules | R33a pp.291–292 |
| INCOSE MBSE definition; models as primary controlled artifacts versus document-centric | R33a p.292 |
| Single source of truth | R28 p.370 |
| SysML (v1) as nine diagram types (caution: not v2) | R28 p.372 |
| Benefits (inconsistencies surface, fewer miscommunications, search) and the out-of-date cost | R28 p.373 |
| Hybrid approach: documents generated from the model | R28 p.374 |
| Authoritative sources of data and models | R27 p.56 |
| Define the model’s purpose first; model quality is not design quality | R33b pp.295–296 |
| A system model may comprise multiple views | R33c p.300 |
| SysML extends KerML; most SysML elements specialize KerML elements | R80 p.47 |
| No system/subsystem/component constructs: an entity with structure and behavior is a part; viewpoints and views | R80 p.48 |
| Element ID managed by the tool; name and short name; basic and unrestricted names; ownership deletion cascade | R80 pp.49–50 |
| Dependencies; extension by user-defined keywords | R80 pp.50–51 |
| Packages organize; qualified names | R80 pp.55–56 |
| Import forms; visibility always shown on imports | R80 pp.60–61 |
| Root-namespace imports must be private; definition and usage; features | R80 p.63 |
| Multiplicity; composite versus referential; specialization; subsetting | R80 p.64 |
| Redefinition replaces; configurations by subsetting a usage | R80 p.65 |
| Graphical and textual notation of a part definition | R80 p.66 |
| Definition declaration (`:>` = specializes); usage specializations (`:`, `:>`, `:>>`) | R80 p.72 |
| Multiplicity syntax; default 1..1 for owned usages | R80 p.73 |
| Attribute definitions; quantities with units: kind of unit in the definition, the unit with the value | R80 p.77 |
| Subject first; stakeholder parameters are part usages typed by part definitions | R83 p.166 |
| Concern declared like a requirement; frame; framed concern is a required constraint | R83 p.167 |
| Viewpoint definition frames stakeholder concerns; its subject is a view | R85 p.181 |
| Four-layer architecture (Root, Core, Kernel, Systems) | R70 sl.3–4; R90 sl.8 |
| Packages, imports, visibility, comments, documentation | R70 sl.5–8 |
| Part and attribute definitions; specialization; subsetting; redefinition; parts | R70 sl.9–12, 15–16 |
| Metadata definition, annotatedElement restriction, nested features bound, @ | R77 sl.108–109 |
| Stakeholder and concern definitions; viewpoint frames concerns | R77 sl.115–116 |
| A quantity is a usage of a quantity value; ISQ | R79 sl.164, 167 |
| SysML v2 key elements; API services; definition–usage reuse; element names | R90 sl.7, 9, 12, 22 |
| Course toolchain facts (checker release, one file per run, ERROR versus WARNING) | course facts: `docs/SYSML_TOOLCHAIN.md` (never cited to the specification) |
| The import method, the mapping, the package layout, the audit questions, the assessment metadata and relationship keywords | course conventions, labeled as such on the slides and in the lesson |

### Register entries needed (owner of `readings.py` to add; not cited until added)

| Source | Pages | Purpose |
|---|---|---|
| S06 (SysML v2.1 Beta 2, Part 1), 7.27 Metadata | PDF pp.188–194 | The `#keyword` prefix on a dependency (prefix metadata, user-defined keywords) is taught as the course and reference-model pattern accepted by the checker; with this entry the rule itself can be cited (now: R80 p.51 and R77 sl.108–109, 114 only) |
| SEBoK glossary “Model”, “Model-Based Systems Engineering (MBSE)”, “View”, “Viewpoint” | PDF pp.1567, 1569, 1677, 1678 | Optional: the outline proposed them; the lecture does without them (R33a, R80 p.48 and R85 p.181 carry the claims) |

## 7. Checker results

Course-designated checker: OMG SysML v2 Pilot Implementation, release 2026-08, kernel 0.62.0. One run at a time; report `sysml/lectures/week08/week08-report.json` (22 files: 16 PASS, 6 FAIL, 0 ERROR, every result as intended).

| File | Result |
|---|---|
| `lectures/week08/aerolink_context_stakeholders_v01.sysml` (generated) | PASS, no message |
| `lectures/week08/labtool_team07_model_v01.sysml` (generated, fixture team) | PASS, no message |
| `lectures/week08/labtool_stress_model_v01.sysml` (generated, adversarial record) | PASS, 2 warnings “Duplicate of other owned member name” (the two stakeholders deliberately given one name; the tool reports this as a gap) |
| `lectures/week08/deck_quotes_textual_notation.sysml`, `stakeholders_concerns_adapted.sysml`, `warmup_library_rooms.sysml`, `tool_proof_pass.sysml` | PASS, no message |
| `lectures/week08/invalid_tool_proof_unquoted_id.sysml` | FAIL as intended: line 9 “mismatched input '-' expecting '>'” |
| `lectures/week08/invalid_exercise_microgrid_seeded.sysml` | FAIL as intended: the import without visibility and the unquoted ID are reported; the attribute definition that owns a part is not (the teaching point) |
| `instructor/week08/exercise_microgrid_key.sysml` | PASS, no message |
| `week09/aerolink_def_usage.sysml`, `aerolink_l9_skeleton.sysml` (reused) | PASS, no message |
| `week09/predict_pc2_duplicate_short_name.sysml` | PASS with 2 warnings (as recorded on the slide) |
| `week09/predict_pc6_attribute_def_with_part.sysml` | PASS, no message (the semantic error the checker misses) |
| `week09/invalid_pc5_block_keyword.sysml`, `invalid_pc3_import_without_visibility.sysml`, `invalid_pc8_usage_subsets_a_definition.sysml`, `invalid_unquoted_short_name.sysml` | FAIL as intended |
| `reference/aerolink_v01..v04` (after the canonical-data reconciliation) | PASS, no message |

A PASS means the file parsed, every name resolved against the standard library and no validation rule fired. It is never presented as evidence that a model means what its team intends; the lecture, the lab tool and the audit say so explicitly. `sysmlWeek08.test.ts` checks that the generated files are current, that every file’s SHA-256 matches the report, that each status is the intended one, and that every slide listing is a verbatim excerpt of its file.

## 8. Outstanding deficiencies

1. **STK-015 and CON-017 are not in the shared reference baseline.** They are modeled in the Week 8 AeroLink model, but adding them to `src/model/reference/week02.ts` changes thread and impact counts asserted by the Week 12 and 13 activities (`src/activities/week12/*`, `week13/*`, and `src/content/weeks/week12.ts`), which this build may not edit. The allowlist keeps `missing:STK-015` and `missing:CON-017` with the fixing week set to Week 12 and the reason recorded. In `aerolinkCanonical.test.ts`, besides removing the fixed entries, the “covered ids” assertion was updated to match (it asserted the removed keys were present).
2. **Faculty decisions pending:** the Phase II tooling plan (*revised:* no Week 7 task exists; one checker installation per team in Week 8 from the student install guide, personal installation optional, lab machines as fallback, SysON optional; WEEK8_REVIEW_DISPOSITIONS.md FD-W8-1), the assessment-metadata and relationship-keyword pattern, the three-person reduced scope, formative grading of model v0.1, the proposed objectives W8.5 and W8.6, and the register entries in §6.
3. **The `#keyword dependency` pattern** is taught as a course convention without a citable rule until the S06 §7.27 register entry exists.
4. **Independent review** of the lecture, the figures, the quiz and the lab tool has not been run.
5. **The lab tool** keeps a team’s state in the browser only; teammates share it through the workspace file.

## 9. Gates (final runs, 2026-10-19)

| Gate | Result |
|---|---|
| `npm run lectures:pptx -- --week 8` | `exports/lectures/week08-session1.pptx` (25 slides), `week08-session2.pptx` (21), both notes files and `week08-lesson.md`; 43 figures rendered and spot-checked as PNGs |
| `npm run build` | passes |
| `npm run build:student` | passes; both Week 8 student decks have empty speaker notes and no Week 8 faculty-notes marker reaches the student bundle (the check reports one leaked marker, from `week03/session2.ts`, another agent’s work in progress) |
| `npx tsc -b` | clean |
| `npx oxlint src` | 0 errors (warnings only, none new of note) |
| `npx vitest run` | 1541 of 1545 pass. Every Week 8 test passes (timing and hygiene, quiz, lab tool, generator, SysML report and listings, lab module, reference and canonical-data tests). The 4 failures are not Week 8: the register-export test (the register is being edited by its owner), and three Week 7/11 UI tests that time out under full-suite load and pass in isolation |
| Playwright, lectures configuration (own server) | 17 of 17 pass, Weeks 1, 2 and 8: every Week 8 slide of both sessions with notes on, the handout and the reader scanned with axe in light and dark: no violations; 400 px stacked view without horizontal scroll |
| Playwright, main configuration | `e2e/week8-flow.spec.ts` 6 of 6 pass (one worker): dashboard card, the full walk, the lab tool (refuses a wrong file, imports Week 1 and Week 2 exports, previews, exports .sysml and .md), the archive, axe on every Week 8 page at 1440 and 400 px in light and dark. A parallel full-suite run against the shared 5173 dev server failed across all weeks, Week 1 included, while other agents were editing; it is an environment result, not a Week 8 one, and should be re-run on a quiet tree |

## 10. Risk to the December 1 submission

Week 8 is the largest Phase II week and now has a working generator, listings infrastructure and checker workflow that Weeks 9–13 can reuse (each later week adds kinds to the same generator and listings to the same validated-excerpt pattern). The main risks are faculty turnaround on the open decisions in §8 and the Week 12/13 rebuilds needed before STK-015 and CON-017 can join the shared reference. Neither blocks the submission; both are listed for the M4 Phase II milestone.
