# Week 11 independent review: Physical / Interfaces (model v0.4), uncommitted package of 2026-10-22

**Reviewer.** Independent adversarial reviewer (AI, Claude), not the author. Date: 2026-10-22.

**Mode.** Read-only. No git operation. This file replaces the earlier review of the old-outline Week 11 module, which is still in git history at `b97695c`. I wrote this file, plus probes and logs in my session scratchpad (outside the repo). One accidental repo write is disclosed under "What I verified".

**Scope.**
- Builder report `learning-studio/docs/lectures/week11/WEEK11_MILESTONE_REPORT.md`.
- `src/week11`, `src/workbench/week11`, `src/content/lectures/week11`, `src/content/{lab/week11Lab*,quizWeek11*,week11Assessment,week11Path}.ts`.
- Figures `LectureWeek11*`, `lectureWeek11*Figures.ts`, `week11FigureKit*`.
- `sysml/lectures/week11`, `sysml/instructor/week11`, `scripts/build-week11-sysml.mjs`.
- `e2e/{week11-flow,lectures-week11}.spec.ts`, and the Week 11 hunks in the shared files.

**Ignored.** Week 12 files (R117/R118), and the parked `src/content/weeks/week11.ts` and `src/activities/week11/*`.

**Bar.** `week09_review.md`, `week10_review.md`, `week10_confirmation.md`.

Paths are relative to `learning-studio/` unless they start with `_source_cache/`.

## Verdict: **REVISE** (blocker 0 · major 1 · moderate 3 · minor 9)

The package is careful and close to sign-off:
- The SysML v2 content matches the cited pages almost everywhere.
- The AeroLink v0.4 model is generated, not retyped, and stripping the Week 11 regions gives v0.3 back byte for byte (tested).
- IDs continue correctly, and the deferred items are closed truthfully.
- The recorded checker evidence reproduces exactly.
- Axe and the 400 px checks pass, and the workload arithmetic is right.

**One finding repeats Week 10's M1 defect class.** One of the five intended FAILs fails for a reason other than the one the course gives, and the cited sources contradict the stated reason (M1).

**Three moderate findings are in the lab tool:**
- A satisfy claim whose own design value violates the requirement is accepted and counted toward readiness (N1).
- The Week 10 duplicate-key defect class recurs (N2).
- The requirement-allocation editor silently loses a row (N3).

## Findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| M1 | **Major** | `src/content/lectures/week11/session1.ts:492` (misconception); `listings.ts:303` (calibration label "~ inside quotes"); `sysml/lectures/week11/invalid_conjugate_in_quotes.sysml:1,8` | **What the course says.** The correction reads: "It goes outside: ~’Oxygen port’. Inside the quotes it is part of a name nobody declared."<br>**The cited sources say otherwise.** R81 p.95, cited on this slide (`2a_OMG…txt`, PAGE 95, lines 18–30), says every port definition implicitly declares a conjugated port definition named `P::'~P'`, and that "quotes do have to be used to represent the actual name of the conjugated port definition". R71 sl.21, also cited, gives `'~FuelPort'` as that name. The slide's own notes (`:486`) say `P::’~P’`.<br>**Probe P9 (checker, under the lock).** `port fromManifold : 'Oxygen port'::'~Oxygen port';` gives **PASS** with no message.<br>**So the intended FAIL fails for a different reason.** The message is "Couldn't resolve reference to Type ''~Oxygen port''": the name is declared, but inside `'Oxygen port'`, so it does not resolve unqualified. A tilde inside quotes is not wrong in itself.<br>Minor point in the same correction: the code is written with typographic quotes (`~’Oxygen port’`), which do not parse if a student copies them. | Reword the correction: "Inside quotes, '~Oxygen port' is the conjugate's actual name, declared inside 'Oxygen port'. Unqualified it does not resolve; ~'Oxygen port' is the shorthand." Use ASCII quotes in code.<br>Relabel the calibration row "an unqualified '~P' name in quotes". Add P9 as a recorded PASS (predict) file.<br>Re-run the checker and update `week11-report.json`, the checker slide text and milestone §7. |
| N1 | Moderate | `src/workbench/week11/physical.ts:997-1020` (no limit check); `state.ts:191`; `Week11LabTool.tsx:377` | **Probe (vite-node, fixture team).** The satisfy claim REQ-SYS-003 by PHY-002 is given `cargoTemperature = 25 ['°C']` against the requirement's `<= maxCargoTemperature`. The tool:<br>- raises no finding;<br>- writes `attribute :>> cargoTemperature = 25 ['°C'];`;<br>- counts the claim as valid, so readiness turns green.<br>The checker also passes it silently (probe P7: 5.0 against `>= 7.0`, PASS).<br>**Why it matters.** The lesson says "the model is consistent only if the design value really meets the limit" (`session2.ts:725`), and objective W11.6 asks students to judge exactly this. The tool's help never says it does not compare the value with the limit. | Parse the `require constraint` operator and limit (the Week 9 generator wrote them) and raise a `satisfy-value-violates` gap when the comparison fails. At least disclose in the tool help that the value is not compared with the limit. |
| N2 | Moderate | `physical.ts:790` (code `flow-item-missing-${nameKey(row.item)}` keyed by interface ID only); `physical.ts:409` (`findingKey`); `Week11LabTool.tsx:464`; `e2e/week11-flow.spec.ts:155-178` | **Probe (Playwright, 400 px).** Clicking "add crossing" twice on IF-001 logs React "Encountered two children with the same key, `defect:flow-item-missing-empty:IF-001`" 7 times. Unit probe: the same unknown item set in both directions gives `defect:flow-item-missing-unknownthing:IF-003`.<br>**This is the Week 10 C1 defect class.** The brief asks for "finding codes unique per row".<br>**The axe test still does not track console errors.** That was C1's second recommendation, and it is why the suites stay green. | Include the row index in the code (or deduplicate by item and direction). Add `trackErrors` to the axe test and assert it stays empty. |
| N3 | Moderate | `Week11LabTool.tsx:357` (requirement field rewrites the record key), `:370` (new key `REQ-${length+1}`) | `reqParts` is a record keyed by the requirement ID the student is typing. **Probe (Playwright):**<br>1. Add two allocation rows.<br>2. Enter PHY-002 in row 1 and PHY-005 in row 2.<br>3. Type REQ-STK-001 into both requirement fields.<br>Result: **one row remains, holding PHY-005**. PHY-002 is lost, with no message.<br>The same happens after "remove, then add" while a placeholder key `REQ-n` is still in use. | Store the rows as an array of `{req, els}`, as the claims are. Report a duplicate requirement as a finding, not by merging. |
| m1 | Minor (shared, pre-existing) | `src/pages/InstructorReview.tsx:24` (synthetic item `w${c.week}-lab`), `:121` (`<tr key={i.id}>`); block IDs `src/content/weeks/week09.ts:234`, `week10.ts:201`, `week11.ts:211`, `week12.ts:232`, `week13.ts:229` | **This is the source of the reported `w9-lab` … `w13-lab` duplicate-key warning.** Weeks 9–13 have a lesson block of kind `lab` with ID `wN-lab`. `reviewableItems()` lists every block (`:23`) and then adds a synthetic lab item with the same ID (`:24`).<br>**It is more than console noise.** Both rows share `reviews[id]`, so approving one also approves the other. Not Week 11 code. | Give the synthetic item a distinct ID (for example `w${week}-lab-summary`) or skip it when a block already has that ID. Keep the old IDs for stored decisions through a migration. |
| m2 | Minor | `src/content/lectures/week11/labBrief.ts:103`; `week11Path.ts:142`; `session2.ts:569` | The three-person "integration review" row drops from 0.6 to 0.4 h with the scope "one integration pass by the whole team". Nothing gives a team of four more than one pass, so this is "same scope, fewer hours" (the Week 10 N1 class). Recomputed honestly, the team carries 7.9 person-hours, and 7.9 / 3 = 2.6 h each, so **the 7.7 h total is unchanged**. | Restore 0.6 h (7.9 person-hours; still 2.6 h each and 7.7 h in total), or state a real reduction. |
| m3 | Minor (faculty item) | `sysml/instructor/week11/exercise_water_kiosk_key.sysml` (108 non-comment lines); `labBrief.ts` `EXERCISE_MINUTES = 50` | The key is almost twice the Week 10 key (68 lines) that the Week 10 reviewer judged tight at 40 min. Part of it is the corrected task-4 draft, which students do not have to write. Tasks 1, 2 and 5 still need 6 part definitions with usages, a port definition with an interface, an allocation, a satisfy and two allocations. | Confirm 50 min with the faculty, or drop the usages from task 1. |
| m4 | Minor | Calibration `listings.ts:298-308`; lesson `session1.ts:797-799` | Further silent passes I recorded that the course does not show:<br>- **P3.** An interface typed by a definition whose end B is `~OxygenPort`, connecting a port typed by plain `OxygenPort`: **PASS**. Students may think the definition's conjugate end protects the usage.<br>- **P4.** An untyped interface between ports of unrelated definitions (Oxygen out, Water in): **PASS**.<br>- **P6.** A flow from an Oxygen item to a Water item: **PASS**. | Add P3 (the most instructive) to the calibration table, or name it in the review checklist row on conjugation. |
| m5 | Minor | `physical.ts:247-262` (`parseModel`) | Probe: model v0.3 with the root package's closing brace removed is **accepted**. Only the top-level packages are checked for closure. The generated v0.4 inherits the defect and then fails the checker. | Also check that the root package closes. Refuse with the existing "not closed" message. |
| m6 | Minor | `src/workbench/week5/fixture.ts:38-42, 48-54` (committed in `7ab45a5`); used by `e2e/week11-flow.spec.ts:21` | **Answer to the brief's question: yes, the defect is real, and it lives in the committed Week 5 test fixture.** Its externals EXT-001 to EXT-005 predate the Week 7 M3/N1 export fix, so they reuse IDs that the fixture team's model gives to its Week 1 externals.<br>**Who it affects.** It is not student-facing: the fixture is used only by tests and by the Week 6/7 fixtures. Week 11 handles it correctly. `generated.ts:21-45` re-IDs a corrected copy after the highest Week 1 ID, and keeps the uncorrected form for the stress model, where every collision is reported and nothing is renumbered.<br>**Side effect on the e2e.** `week11-flow` imports the uncorrected fixture, so the "happy path" e2e runs with 4 `ext-collision` and 4 `end-collision` defects and never exercises a clean import. | Correct the Week 5 fixture's external IDs at their source (a Week 5 change, so ask first). Or have the Week 11 e2e use `FIXTURE_WEEK5_JSON`. |
| m7 | Minor (authoring doc) | `docs/lectures/week11/WEEK11_LECTURE_OUTLINE.md:527-533, 557` | The outline still says the lab is 2.8 h for about 11 person-hours, the exercise is 40 min, and teams of three carry 3.7 h. This is the Week 10 C2 class. | Mark it as superseded, or update it. |
| m8 | Minor (test text) | `src/content/lab/week11Lab.test.ts:25` | The failure message says "run `node scripts/build-lab-md.mjs 10`" for Week 11, a stale week number. | Change it to `11`. |
| m9 | Minor (inherited, faculty item 6) | `src/components/figures/LectureWeek11Code.tsx` | Measured at 1440 px (Playwright probe):<br>- Drawn figure labels are at least **16.6 px** on the examples page and **24.2 px** in the lesson, with none under 13 px.<br>- Listing code goes down to **5.2 px** (examples) and **7.6 px** (lesson), the same as in Weeks 9–10. | Faculty decision (the exemption), as in Weeks 9–10. |

## What I verified (evidence)

**Gates (re-run today)**
- **`npx tsc -b`: exit 2, but the errors are not Week 11's.** All 4 errors are in Week 12 / other-agent files: `src/components/figures/zz_s2probe.test.ts` (3 unused imports) and `src/workbench/week12/verification.test.ts` (`node:crypto` types). No Week 11 file has a type error.
- **`npx vitest run src/week11 src/workbench/week11 src/content src/components/figures`: 59 files, 1,218 passed, 1 failed.** The failure is the register-count test (R117/R118 from Week 12), which was expected and is not counted.
- **Playwright, under `_source_cache/.playwright.lock` ("w11-review", deleted after):**
  - `week11-flow.spec.ts`: **6/6**. This covers axe light and dark at 1440 and 400 px with the lab tool filled, and no sideways scroll.
  - `lectures-week11.spec.ts`: **4/4**. Axe found no violations on any slide, the handout or the reader, light and dark; the 400 px stacked view has no scroll.
- **My probe spec** (scratchpad config, separate port 5191; no repo file):
  - the font measurement in m9;
  - no sideways scroll at 400 px with blank crossing rows added (scrollWidth 400);
  - the reproduction of N2 and N3;
  - no console error on the Week 11 walk pages.
- **Git status.**
  - The 11 pre-modified screenshots are untouched; no screenshot changed, so none needed restoring.
  - Before and after differ only by new Week 12 files from the other agent.
  - I removed my two failed-run folders from the git-ignored `test-results/`.
- **Disclosure: one accidental repo write.** `node scripts/build-lab-md.mjs 11 --stdout` ignored the flag and rewrote `docs/lectures/week11/WEEK11_LAB_INSTRUCTIONS.md`. The generator is deterministic, and the source-equality test (`week11Lab.test.ts`) passed both before (in the full run) and after (7/7). The content is therefore byte-identical and only the file's modification time changed.

**Checker (under `_source_cache/.sysml.lock` "w11-review", deleted after; report written to my scratchpad)**
- **Recorded files.** All 17 Week 11 files match `week11-report.json` (2026-10-22T09:45Z) on status and diagnostics: 12 PASS, 5 FAIL, 0 ERROR. The 18th file in `sysml/instructor/week11` (`aerolink_grad_key_intent_interaction.sysml`, the earlier package) passes.
- **The five intended FAILs, and whether each fails for the reason it teaches:**
  - `invalid_port_undirected_item`: "Owned usages of a port definition (other than ports) must be referential." **Right reason.** The course teaches this precisely ("the rule is about being referential", `session1.ts:658`). Probe P1, `ref item` with no direction, PASSes, which is consistent with that teaching.
  - `invalid_interface_part_ends`: "An interface definition end must be a port." **Right reason** (R81 p.106).
  - `invalid_interface_connects_parts`: "A port must be typed by port definitions." **Right reason.** Probe P2, an *untyped* interface between parts, fails the same way, so the label holds generally.
  - `invalid_qualified_not_dot`: "Must be an accessible feature (use dot notation for nesting)". **Right reason.**
  - `invalid_conjugate_in_quotes`: unresolved name. **The taught reason is false** (M1, probe P9).
- **Probes:**

  | Probe | Result |
  |---|---|
  | P1 port item `ref`, no direction | PASS |
  | P2 untyped interface between parts | FAIL, "A port must be typed by port definitions." |
  | P3 interface definition with a `~` end connected to a non-conjugated port | PASS (m4) |
  | P4 untyped interface between unrelated port definitions | PASS (m4) |
  | P5 interface definition ends with no `port` keyword, typed by parts | FAIL, port typing |
  | P6 flow between items of different types | PASS (m4) |
  | P7 satisfy whose design value violates the constraint | PASS (N1) |
  | P8 nested allocation between unrelated actions | PASS (expected) |
  | P9 `'Oxygen port'::'~Oxygen port'` | PASS (M1) |

**SysML v2 content against the cached texts**
- **R81 p.93.** Matching features ("conforming definitions and either both have no direction or they have conjugate directions"), transfers from out to in, and conjugated usages: verbatim.
- **R81 p.95.** "must be referential (non-composite)"; the conjugated definition `P::'~P'`; quotes for the actual name (M1).
- **R81 p.106.** The ends of an interface definition and of an interface usage are ports.
- **R83 p.162.** The satisfy definition ("asserts that a requirement is satisfied when a given feature is bound to the subject parameter") is on p.162 (`2a…txt:8461`). p.168: the subject must be bound to a satisfying feature.
- **R71 slides:**
  - sl.20: directed features are always referential; ports are compatible when their features match with inverse directions.
  - sl.21: the conjugate is named `'~FuelPort'`.
  - sl.22: an interface usage connects two compatible ports.
  - sl.24: a binding asserts equivalence and is not a transfer.
  - sl.26–27: a flow transfers from an output to an input.
- **R76 sl.106–107.** The AeroLink v0.4 allocation follows the deck pattern exactly: logical perform, physical perform, then `allocate L to P { allocate L.f to P.x.f; }`. An allocation is not a dependency.
- **R13 p.563.** The interface requirement definition is verbatim. **R20c p.596**: the definition of a physical architecture model is verbatim. **R57 p.411**: interface management.
- **The constructs in the model.**
  - Ports carry directed items, and end B uses `~`.
  - Flows are written in the interface definitions.
  - The organizational interfaces are connections, labelled as a course convention.
  - Physical part definitions specialize the Week 9 placeholders.
  - Logical parts are realized by allocation, not specialization.
  - `perform` is used for functions, `allocate` for logical → physical and requirement → interface/function, and `satisfy` with a basis.
  All of these are correct and labelled.

**Continuity**
- **v0.4 is generated.** `aerolinkCase.ts` builds it from `AEROLINK_W10_MODEL` and the Week 1, 3, 4 and 5 case modules through the lab tool's generator. Only the decisions are authored. `aerolinkCase.test.ts:51-52` proves the byte-for-byte strip back to v0.3.
- **IDs.**
  - INFO-017 and INFO-018 appear nowhere in Weeks 1–10. The Week 10 maximum is INFO-016; INFO-099 is a test fixture only.
  - EXT-007 is the Week 4 "Weather information service" (`week04/aerolinkCase.ts:434`), reused with the same meaning, so it is not a collision.
  - `aerolinkCase.test.ts:61` checks that no issued ID appears in v0.3.
- **Deferred items, closed truthfully.**
  - REQ-SYS-013 → IF-003 and FN-012, REQ-SYS-014 → IF-011 and FN-004, REQ-SYS-015 → IF-015 and FN-016. Each matches the Week 10 disposition (`week10/aerolinkCase.ts:210-212`).
  - REQ-STK-020 → PHY-001 and CMP-005, matching the Week 9 promise "cabin and step-free route".
  - REQ-STK-021 stays open, as Week 9 conditioned it on TBD-08.
  - Their subjects stay at the Week 9 placeholders. This is disclosed: the course convention applies only to interface requirements that Week 9 did not model (`session2.ts:314`).
- **PHY-004/LOG-004.** The difference is shown, not hidden: on the examples page (`Examples.tsx:102-104`), on the s1 slide (`session1.ts:372`) and in the lesson (`:756`). The model allocates only where a function is performed.

**Lab tool**
- **Refusals (vite-node probe).** The tool refuses:
  - AeroLink v0.3, AeroLink v0.4 and an AeroLink Week 5 file;
  - v0.2, JSON, Markdown, plain text and an empty file;
  - a Week 4, Week 6 or format-less file, a list, null, and text that is not JSON.
- **Wrong-team check.** A renamed AeroLink model is accepted, which is expected: the team mismatch is caught by the enterprise check.
- **Malformed input.** An unclosed root package is accepted (m5).
- **Empty versus short.**
  - Accepted: "x", "Keep as is.", "Owner JS, Week 12", "Closed site at night: no function", "Will be fixed by AK in Week 12".
  - Refused: "n/a", "none", "tbd later", "none none", "ok", "later" and "Fixed.".
  - The basis, the review notes and the AI statement behave the same way.
- **Readiness against the brief.** The checks are 2 satisfy claims (1 for a team of three; probe: a three-person team with 1 claim gets no `satisfy-minimum`, a four-person team does), at least one interface with a flow, no defects, confirmed directions and functions, dispositions, the checklist, the AI statement, and current exports. They match `LAB11_MINIMUMS` and the lab text. N1 is the gap.
- **The three-person scope** is real for satisfy and enforced. The integration row is not a real reduction (m2).
- **Placements are not hard-coded.** No PHY, FN, IF, LOG, CMP or EXT literal appears in `physical.ts`, `state.ts` or the tool. The function-placement select defaults to the Week 4 placement and is changeable.
- **The exports are truthful.** The .md and the tool both state "acceptance checks only… a PASS does not show that connected ports match, that a flow runs the right way, or that a satisfy claim is true".
- **Finding keys** are unique on the fixture, but not per row (N2).

**Pedagogy**
- **Session timing.** Each session is 69 min plus a 6 min buffer. Session 2 is 47 min of teaching plus 22 min of lab, identical to Weeks 9 and 10 (their `timing.test.ts:81-82`) and to the outline.
- **Workload, recomputed by hand:**
  - class 2.5;
  - readings 7 pp / 15 = 0.5 (R20c 3 + R81 1 + 1 + R57 2);
  - slides 13 / 30 = 0.4 (R71 sl.18–29 is 12 slides, R76 1);
  - lesson 4,805 words / 150 = 0.5;
  - lab 8.4 / 4 = 2.1 (1.0 + 0.6 + 2.2 + 1.0 + 1.0 + 0.8 + 1.2 + 0.6);
  - quiz 0.3;
  - exercise 50 / 60 = 0.8;
  - log 0.1.
  
  The total is **7.2 h**, confirmed. For a team of three: 7.7 / 3 = 2.6, total **7.7 h**, confirmed (but see m2).
- **Objectives.** The quiz tags are W11.1 ×2, W11.2 ×3, W11.3 ×2, W11.4 ×3 and W11.5 ×2. W11.6 (graduate) is task 5 of the exercise, and every exercise task maps to a rubric row. w11q-1, a SEBoK definition item, is tagged W11.1 ("Model … as physical parts"), which is a loose fit.
- **Quiz Q11.**
  - Keys: a/b/c/d three times each.
  - Key length ranks 1/2/3/4: three times each, with no run.
  - Stems are unseen and not AeroLink.
  - Answers are shown only after an attempt (the shared `Quiz.tsx`).
  - w11q-9's key is the longest by 12 characters, within the Weeks 3–10 tolerance.
- **Figures.**
  - Drawn captions carry "Course illustration, not SysML v2 graphical notation."
  - Listing captions give the recorded status.
  - Labels are at least 16.6 px expanded (m9 for the code).
- **Internal codes.** None in the student text, apart from the precedented rubric rows (RB-…), register citations in the quiz explanations, and "pending faculty approval" labels.
- **Week numbers.** No stale week numbers in the student text (m8 is a test message).

## Required for sign-off

Fix M1, and fix or disposition N1–N3 with the faculty. A confirmation pass needs:
- the reworded misconception and calibration label;
- the P9-style predict file;
- one recorded checker run with an updated `week11-report.json`;
- the satisfy limit check, or its disclosure;
- per-row finding codes and `trackErrors` in the axe test;
- the requirement-allocation editor stored as an array.

The minor findings can be fixed on the next touch. m1 is shared code that predates Week 11.
