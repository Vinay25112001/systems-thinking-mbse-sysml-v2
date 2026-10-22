# Week 10 independent review: Logical / Behavioral Modeling (Phase II, model v0.3), uncommitted package of 2026-10-22

Reviewer: independent adversarial reviewer (AI, Claude), not the author. Date: 2026-10-22. Read-only: no course, app or register file was edited; this report is the only file written. No git operation. (This file replaces the 2026-10-11 review of the earlier, old-outline Week 10 module, which is still in git history and was signed off in `week10_signoff.md`.)

**Scope.** Builder report `learning-studio/docs/lectures/week10/WEEK10_MILESTONE_REPORT.md`; `src/content/lectures/week10/*`; `src/week10/*`; `src/workbench/week10/*`; `src/content/{lab/week10Lab,quizWeek10,week10Assessment,week10Path}.ts`; `src/components/figures/{LectureWeek10*,lectureWeek10*,week10FigureKit*}`; `sysml/lectures/week10/*`, `sysml/instructor/week10/*`; `e2e/{week10-flow,lectures-week10}.spec.ts`; the Week 10 hunks in `App.tsx`, `lectures/index.ts`, `figures/registry.ts`, `build-lab-md.mjs`; R116 in `readings.py`; the C1 fix (`src/content/weeks/week10.ts:46`, `docs/authoring/week10_notes.md:143`). M7 files ignored. Bar: `week09_review.md` / `week09_confirmation.md`.

Paths are relative to `learning-studio/` unless they start with `_source_cache/`.

## Verdict: **REVISE** (blocker 0 · major 2 · moderate 2 · minor 13)

The package is careful and mostly right. Nearly every SysML v2 citation I checked is verbatim and on the cited page. The AeroLink v0.3 model is generated, not retyped, and its IDs continue correctly. The recorded checker evidence reproduces exactly. The tests, type check, axe and 400 px checks all pass.

Two major findings stop sign-off:
- **M1.** The course teaches that the checker catches a transition across parallel regions. It does not. The intended FAIL fails for a different reason (a parallel state may not *own* a transition), and my probe shows that a cross-region transition written inside a region passes with no message. This is the "check passes for the wrong reason" defect class.
- **M2.** The flow method and the generator always put the decision *after* the step an alternate branches from. The flagship worked example therefore lands the aircraft on the destination pad and *then* asks whether that pad is occupied. The limitation is known (milestone §11) but is not disclosed to students, and the exercise key does it the other way.

## Findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| M1 | **Major** | `src/content/lectures/week10/listings.ts:313` (label "transition across regions", what "A transition between two concurrent regions"); `session1.ts:690, 695` (checker slide: "The last is a rule of the specification: no transitions between the substates of a parallel state (R82 p.146)"), `:836` (lesson); `session2.ts:332, 341` ("2 · transition across regions … No, and caught"), `:349` ("the checker enforces the parallel-state rule (R73 sl.51)"); `sysml/lectures/week10/invalid_transition_parallel.sysml:1-2`; milestone §7 ("Recorded rejects: … a transition across parallel regions") | The recorded error, "A parallel state cannot have successions or transitions." (19:3), is an **ownership** rule: the transition is a member of the parallel state `aircraftStates`. My probes, run with the course checker (release 2026-08) under the lock:<br>**P2.** A transition owned by the parallel state between two states of the **same** region (`operational.onPad → operational.inFlight`) gets the identical error.<br>**P1a.** The same cross-region transition as the listing (`inFlight → aircraftStates.health.degraded`, trigger `FaultReported`), declared **inside the region `operational`**, gives **PASS with no message**.<br>So the error does not detect crossing, and the realistic way a student writes a crossing transition (inside a region) is accepted silently. Two further points:<br>- The specification constraint `validateStateUsageParallelSubactions` (8.3, PDF p.373, `2a_OMG_Systems_Modeling_Language.txt:17935`; outside the register's R82 range) restricts transitions to and from the parallel state's **direct** nested states. The p.146 prose is broader.<br>- So "the checker enforces the parallel-state rule" overclaims twice. | - Relabel the reject: "A transition written directly in a parallel state (even one within a single region)", with the recorded message.<br>- Add a silent-pass row: "a transition between regions, written inside one region" (my probe P1a, re-run and recorded in `week10-report.json` as a new `predict_*` file).<br>- Reveal card 2: "No. Caught only because of *where* it is written; written inside a region, it passes." Change "one rule is enforced, two are yours" to match.<br>- Update the s1 checker-slide sentence, the lesson, the file comment, the misconception count ("Five of the recorded passes", `session1.ts:701`) and milestone §7. |
| M2 | **Major** | Generator `src/workbench/week10/behavior.ts:919-925` (decide written after step k); method `session1.ts:633, 636` (worked solution step 3: "after a step with alternates, decide"), `:824` (lesson); `sysml/lectures/week10/aerolink_logical_behavior_v03.sysml:1019-1024`; tool help `src/workbench/week10/Week10LabTool.tsx:307`; `src/content/lab/week10Lab.ts:76`; milestone §11 | **What the AeroLink v0.3 file says.** `then action approachAndLand … /* 6. Pilot: Approaches and lands at the destination pad. */` is followed by `then decide afterApproachAndLand; if destinationPadOccupied then holdOrDivert;`. The model asserts that the aircraft lands on the pad, then finds that pad occupied, then holds or diverts. A3 has the same shape in a milder form: `acceptIntent` ("Accepts the flight intent") is followed by `if intentNotAccepted`.<br>**Why it matters.** The slide presents A1 as the correct mapping (`:633`). The review checklist's "each alternate is entered from its ConOps step" does not catch it.<br>**The exercise key does the opposite.** `sysml/instructor/week10/exercise_bike_share_key.sysml:31-38` puts A2's decision ("at step 4: the dock is full") *before* the docking step, which is right.<br>**Students are not told.** The builder lists the limitation in milestone §11 ("teams with an alternate that branches inside a step must rename or split the step by hand"), but no student text says so. The tool help, the lab method and the lab instructions only say "a decide after each step with alternates". | - Teach the rule as "the decision sits where the condition becomes known", which may be before the step completes.<br>- For AeroLink, split step 6 (approach; decide on pad occupancy; land) or rename it, then regenerate and re-run the checker.<br>- Give the tool a per-alternate choice, "branches before / after step k", or at least disclose the limitation in the tool help, the lab method and the worked example's "what the listing leaves open" note.<br>- Align the exercise rubric wording. |
| N1 | Moderate | `src/content/lectures/week10/labBrief.ts:93-102` (`LAB10_PERSON_HOURS_THREE`); `week10Path.ts:139`; scope text vs `week10Lab.ts:76`, `Week10LabTool.tsx:307`, `state.ts:230`, `behavior.ts:668` | **The hours are inconsistent with the stated scope.** Six of the eight three-person rows say scope "as for a team of four", yet their hours are cut by about 25 %:<br>- functions 1.6 → 1.2<br>- logical architecture 1.0 → 0.8<br>- use cases 0.6 → 0.5<br>- checker runs 0.8 → 0.6<br>- review 1.2 → 0.9<br>- integration 0.6 → 0.4<br>The same work at the team-of-four rates, with only the scenario (1.8) and the states (1.0) reduced, is **8.6 person-hours = 2.9 h each**. Recomputed total for a three-person student: 2.5 + 0.4 + 0.8 + 0.5 + 2.9 + 0.3 + 0.7 + 0.1 = **8.2 h**, over the 8.0 h budget. The report's 7.2 / 2.4 h is not supported by the stated scope.<br>**The scope instructions contradict each other.** The reduced scope ("the scenario with the fewest alternates that still has one") appears only in the workload text. The method, the tool help, the readiness detail and the audit message all tell every team "Choose the scenario with the most alternates". | - Either reduce the scope for real (for example, a subset of functions or of use cases), or record the honest 8.6 person-hours / 8.2 h and raise it as a faculty item.<br>- Make the tool and the lab text show the three-person scenario rule when `threePersonTeam` is set. |
| N2 | Moderate | AeroLink choices `src/content/lectures/week10/aerolinkCase.ts:62-80` → `aerolink_logical_behavior_v03.sysml:1166-1233`; audit `behavior.ts:519`; checklist row `labBrief.ts` `REVIEW_CHECKS.functions`; `session1.ts:246` | **The worked model shows the pitfall the course teaches.** The course teaches SEBoK's pitfall that the inputs and outputs are "integral parts of a function" (R20b p.594). The checklist row reads "Every function has its inputs and outputs". Yet the generated AeroLink v0.3 has **six functions with no output** (FN-002, FN-009, FN-013, FN-015, FN-016, FN-017) and FN-010 with no input. Week 4 gives every one of them outputs (`week04/aerolinkCase.ts:177-276`); FN-015 "Notify disrupted passengers", for example, produces no notice.<br>**The audit cannot see it.** It raises `fn-no-items` only when a function has **neither** inputs nor outputs. My probe on the fixture team: FN-008, FN-009 and FN-011 have no outputs and get no finding.<br>**The lecture's "finding" is never raised.** The lecture calls the missing FN-002 → FN-011 assignment item "a finding, not a drawing error", but no tool finding or AeroLink disposition records it. The tool's "Gaps list functions without items" is weaker than the checklist row it supports. | - Add disposable gaps `fn-no-output` and `fn-no-input`.<br>- Give the AeroLink functions their output items (for example, the aircraft assignment as INFO-012 after INFO-011), or disposition each one.<br>- Regenerate and re-run the checker. |
| m1 | Minor | `sysml/instructor/week10/exercise_bike_share_key.sysml:25-38` | The key's merge merges nothing. `else returnAtDock;` bypasses `merge returned`, so the merge has one incoming succession, and `returnAtDock` has two incoming successions: one from the decision, one from the merge. The course's own pattern routes `else` into the merge (`aerolink…v03.sysml:1014, 1022`), and KerML's MergePerformance exists for exactly this. | Write `else returned;`, then re-run the checker and record the result. |
| m2 | Minor | `aerolink_logical_behavior_v03.sysml:31-49` (Week 10 marker region nested inside the Week 9 region) | The Week 10 `metadata def <derivedFrom>` sits inside a Week 9 generated region. My probe: Week 9's `stripGenerated` applied to a v0.3 text drops the metadata def but leaves all 18 `#derivedFrom dependency` lines. A team that re-runs the Week 9 tool on v0.3 to fix a requirement gets unresolved names. | Insert the Week 10 header block outside the Week 9 region, or have the Week 9 reader refuse a v0.3 file. |
| m3 | Minor | `aerolink_logical_behavior_v03.sysml:484` (and every team's v0.3); `src/workbench/week9/requirements.ts:608, 663` | The v0.3 Requirements doc still says "Parent links to capabilities wait for Week 10, when the capabilities are modeled". Week 9 also promised that "its derivation is drawn in Week 10", but Week 10 rightly uses a `#derivedFrom` dependency instead. | Have the Week 10 generator rewrite or annotate that sentence ("written in Week 10 as #derivedFrom dependencies in Logical"). |
| m4 | Minor | `session1.ts:810` (lesson: "no successor is possible: the flow simply stops") | "Simply stops" goes beyond the sources. KerML 9.2.9 requires each DecisionPerformance to be the earlier occurrence of **exactly one** outgoing HappensBefore link (`1_Kernel_Modeling_Language.txt:16481-16486`). For an uncovered score the model therefore admits no valid continuation; it is not a defined stop. The slide's "no possible successor" is fine. | "…no successor is possible, so the model gives that case no valid continuation". |
| m5 | Minor | `src/content/quizWeek10.ts:33` (w10q-1 option b, cited R20b p.587); `session1.ts:181` | The phrase "as far as possible independent of implementation decisions" is on **p.592** (`Guide…txt:25048-25049`), not p.587. Separately, the slide's definition card "Logical architecture (SEBoK)" quotes what SEBoK gives as the **purpose** of logical architecture model development (p.587). The notes say this correctly. | Cite p.592 for that option. Retitle the card "Purpose of logical architecture (SEBoK)". |
| m6 | Minor | `behavior.ts:115-130` (`readWeek2For10`) | A Week 1 file in the Week 2 field returns "use “Import the Week 1 record” at the top of the tool". That is the shared Week 2 importer's message, and the Week 10 tool has no such control. A Week 3 file gets a generic "not a Week 2 file". | Add the explicit week-format refusal that `readWeek4For10` has. |
| m7 | Minor (inherited) | `behavior.ts:347-353` (`COMPLETION_CLAIM`) | A legitimate disposition is refused because it uses "closed" in a non-claim sense. My probe: "Closed site at night: no function". This is the Week 9 m6 class. | Match only claim forms ("is closed", "closed it"), or soften the message. |
| m8 | Minor (inherited, not a regression) | `src/components/figures/LectureWeek10Code.tsx:12-14` | Measured with Playwright at 1440 px: drawn figures are at least 14.5 px (lesson) and 16.6 px (examples). Listing code renders at 6.1 px on `/week/10/examples` and 8.8 px in the lesson, and line numbers go down to 5.2 px. Week 9's examples page measures identically (6.1 px), so this is covered by faculty item 7 (the code-listing exemption). | Faculty decision. Alternatively, cap the listing viewBox width or let wide listings scroll at a fixed 13 px. |
| m9 | Minor | `src/content/lectures/week10/labBrief.ts` `EXERCISE_MINUTES = 40`; `week10Assessment.ts` tasks 1–5 | 40 minutes covers a mapping table, a full action flow with a decision, a merge, done and an item flow (which needs typed in/out parameters), a state definition with at least 4 states, at least 5 transitions and a guard, a use case header, and three findings with fixes. The key alone is 60 lines. Week 9's reviewer raised the same concern at 45 minutes. | Set 60 minutes (total becomes 8.0 h), or trim the task-3 minimums. Record it as a faculty item. |
| m10 | Minor | `_source_cache/verification/readings.py` (R116 comment) | The comment says the 7.25 heading is "below the end of 7.24, inside R84's last page". In the text, p.177 starts with "7.25 Use Cases" and 7.24 ends on p.176. It is R84's register range (170–177) that runs one page into 7.25; that range predates this package. R116's range pp.177–181 and the contents listed (7.25.1 p.177, table pp.178–179, 7.25.2 p.179, 7.25.3 p.180, 7.26 from p.181) are **correct**. | Fix the comment. Optionally note R84's overrun. |
| m11 | Minor | `session2.ts:349`; `predict_two_initial_states.sysml:1-2`; quiz w10q-12 | "The model asks for two active substates after entry" is course reasoning. The spec says only that the initial state "is indicated by a succession from the entry action" (p.150). | Label it "course reasoning from p.146 and p.150", as the overlap paragraph already does. |
| m12 | Minor | C1: `src/content/weeks/week10.ts:46`; `docs/authoring/week10_notes.md:143` | **The fix is correct, minimal and consistent with Week 9 M1.** It quotes the p.167 binding `subject engine = vehicle.engine`, cites sl.90, and narrows the claim to independently typed, unbound subjects. `:57` and `sysml/week10/aerolink_requirement_def_usage.sysml:49-50` stay true for their one unbound, subject-less group, and no other "never satisfied as a whole" remains in `src`, `sysml` or `docs` outside the milestone's quotation.<br>Two nits:<br>- "is **therefore** a collection" now follows the satisfiable case, so it reads as a non sequitur.<br>- Notes row F12 lists "lesson, worked (a), listing doc" as narrowed, but only the lesson paragraph changed; the other two were already specific. | Drop "therefore". Reword F12 to "lesson narrowed; worked (a) and the listing doc concern one unbound group and stay". |
| m13 | Minor | `e2e/week10-flow.spec.ts:141-159`; `src/components/figures/week10FigureKit.ts:63`; `quizWeek10.ts` | - **400 px coverage.** The no-scroll check on the lab tool runs only right after import. The widest states (mapping table, states editor, allocation matrix) are never measured at 400 px.<br>- **The two-views figure** pairs Flight Operations only with "Aircraft", although two of its three functions (FN-003, FN-012) are realized at the ops center (PHY-004).<br>- **Weak quiz cues, within the Weeks 3–9 tolerance:** w10q-10's a/d are an opposite pair, and w10q-8's key echoes "regions". | Extend the 400 px test to a mapped scenario and a filled states editor. Caption the figure "…the principal physical element". |

## What I verified (evidence)

**Tests and build gates (re-run today)**
- `npx tsc -b`: **exit 0**.
- `npx vitest run src/week10 src/workbench/week10 src/content src/components/figures`: **54 files, 1,109 tests passed**.
- Playwright, under `_source_cache/.playwright.lock` ("w10-review", deleted after):
  - `week10-flow.spec.ts`: **6/6**. This covers axe light and dark at 1440 and 400 px with no sideways scroll, and the lab-tool refusals, import, short step name and exports.
  - `lectures-week10.spec.ts`: **4/4**. Axe found no violations on every slide with notes, the handout and the reader, light and dark; the 400 px stacked view has no scroll.
- Neither spec writes screenshots. `git status --short` is identical before and after; the 11 pre-modified screenshots are untouched.

**Checker (one run at a time, under `_source_cache/.sysml.lock` "w10-review", deleted after)**
- `python -I scripts/check_sysml.py sysml/lectures/week10 sysml/instructor/week10`, report to my scratchpad: 19 files, 15 PASS, 4 FAIL, 0 ERROR.
- All 18 files recorded in `week10-report.json` (2026-10-22T07:44Z) match on SHA-256, status and diagnostic count. The 19th file is the earlier Week 10 graduate key; it passes and is not part of this package.
- The 4 intended FAILs:
  - `invalid_decide_target_declared`: parse error at the branch, 11:4 "no viable alternative at input 'if'". Consistent with p.136 and sl.35. The corrected form passes (`GuardsCovered`, AeroLink).
  - `invalid_guard_before_trigger`: parse error at `transition` (10:3). The correct order passes (AeroLink :1079).
  - `invalid_perform_undeclared`: "Couldn't resolve reference … Must reference an action."
  - `invalid_transition_parallel`: fails for the **ownership** reason, not for crossing (**M1**).
- Probes (scratchpad; not added to the repo):

  | Probe | Result |
  |---|---|
  | P1a cross-region transition inside a region | PASS, silent |
  | P2 same-region transition owned by the parallel state | FAIL, same message |
  | P3 include with actors and no `subject` | FAIL "Subject must be first parameter." (confirms `session2.ts:411`) |
  | P4 use case with actor before subject | FAIL, same message |
  | P5 action with two incoming successions and no merge | PASS |

**SysML v2 content, checked against the cached texts**
- R82 p.117 action definition: verbatim.
- R82 p.118: control nodes (fork, join, decision, merge "any one"); binding vs flow; streaming vs succession flow; send and accept.
- R82 p.134: non-deterministic successions out of a decision.
- R82 p.135: `then` source is the nearest lexically previous occurrence.
- R82 p.136: else "false on all of an immediately preceding set"; the target must be a qualified name or feature chain; perform in a part makes the part the performer.
- R82 p.145: state definition quote; do after entry; exit.
- R82 p.146: parallel and one-active-substate rules; exhibit is referential, "typically … reflect conditions".
- R81 p.90: a part at any level of abstraction.
- R81 pp.110–111: allocation; precursor; related to perform and satisfy.
- R115 p.580: a Derivation must have RequirementUsages for all ends, which justifies `#derivedFrom` to capabilities.
- R80 pp.50–51: client and supplier.
- Training deck:
  - sl.30–41: flows, succession, then, conditional succession "target must be explicitly named", merge, decide, fork/join, perform.
  - sl.48–56: state definitions, the shorthand, parallel, entry/do/exit, guard and effect order, exhibit.
  - sl.100–101: actors are referential part usages; the subject must be declared first; the nested use-case subject is implicit and actors are bound explicitly; extend is not supported yet.
  - sl.106–107: logical perform plus logical-to-physical allocate; an allocation is not a dependency.
- SEBoK R20b pp.587, 588, 589, 590, 591, 592 and 594, and R20c p.596: every quoted phrase found on the cited page, except m5.
- R116 pp.177–181 (7.25): range and content correct. The p.177 use case definition quote is verbatim.
- Every specification mention says "SysML v2.1 Beta 2". "The standard" is never used.

**Course conventions labelled as such:** capability as action definition, `#derivedFrom`, LOG ID on usages, step subsetting (checker-resolved: `planFlight.flightReleaseAndPlan` resolves through `:> 'FN-003'`), perform for function → logical part, allocate for requirement → function.

**Continuity**
- v0.3 is generated by the lab tool's generator from `AEROLINK_W9_MODEL` and the Week 2 and Week 4 case modules (`aerolinkCase.ts:16-45, 133-140`). Only the modeling decisions are authored.
- IDs:
  - INFO-011 is new after INFO-010 (the highest anywhere in `src` and `sysml`; INFO-077 and INFO-099 appear only as test fixtures).
  - FN-015, FN-016 and FN-017 are Week 4 (proposed) functions, not new.
  - REQ-STK-018 and REQ-STK-019 are allocated to FN-015, closing `week09/aerolinkCase.ts:194-195` truthfully.
  - All capability parents Week 9 left waiting are written as `#derivedFrom` (25 from requirements, 21 from functions).
- REQ-SYS-013..015 stay unallocated with an owned disposition to Week 11.

**Lab tool**
- Week 9 field: refuses JSON, Markdown, v0.1, AeroLink, plain text and an empty file. Week 4 field: refuses the Week 2 file, a Week 3 format, AeroLink and non-JSON. Week 2 field: refuses the Week 4 file (see m6).
- Short valid input is accepted ("x", "Keep as is.", "Owner JS, Week 11", step name "go").
- Empty answers are refused via `saidSomething` / `isEmptyEveryWord`: "n/a", "none none", "tbd later", "ok", "yes" (review note), "n/a n/a" (AI statement).
- Readiness matches the brief minimums: 4 states, 5 transitions and 1 guard (3 and 4 for a team of three), 1 decision, 1 item flow, reachability, exhibitor, dispositions, checklist, AI statement, and current exports.
- The exports state that they are acceptance checks only, and the .sysml header states what a PASS does not show.
- The decision-placement limitation is **not** disclosed (M2).

**Pedagogy**
- **Quiz Q10.** Keys a/b/c/d three times each. Key length rank 1/2/3/4 three times each, recomputed. Stems unseen and not AeroLink. Answers are revealed only after an attempt (`Quiz.tsx`: radio disabled, explanation shown once `revealed`).
- **Objectives.** W10.1–W10.3 (course.ts) plus the proposed W10.4–W10.6 are covered by the quiz, the lab rows and exercise task 5. Proposed W10.4 overlaps W10.2's "main operating states".
- **Workload, recomputed from the data** (vitest probe of `week10Path.ts`):
  - class 2.5
  - readings 6 pp / 15 = 0.4
  - slides 23 / 30 = 0.8
  - lesson 4,591 words / 150 = 0.5
  - lab 9.6 / 4 = 2.4
  - quiz 0.3
  - exercise 40 / 60 = 0.7
  - log 0.1
  - Total **7.7 h**, confirmed.
  - Each session is 69 min plus a 6-minute buffer, 24 slides.
  - The team-of-three figure is not supported (N1).
- **Figures.**
  - Every drawn caption carries "Course illustration, not SysML v2 graphical notation." (tested).
  - The listing captions state the recorded status.
  - Drawn labels are at least 14.5 px at 1440.
- **Internal codes.** None in the student lesson paragraphs, the week page, the lab or the tool. Register codes appear only in quiz explanations ("R72 sl.38"), which is the Weeks 5–9 precedent.
- **Stale week numbers.** None in Week 10's own text (m3 is generated v0.2 text).
- The instructor key is excluded from the bundle (`src/lib/sysml.ts:5` glob).

## Faculty items (from this review)

1. M2: whether the method should let an alternate branch before its step completes (a generator change), or document a hand-split rule.
2. N1: accept 8.2 h for a three-person team, or define a real reduced scope.
3. m9: the exercise time (40 minutes vs 60 minutes).
4. m8: confirm the code-listing exemption (item 7 of the milestone).

## Required for sign-off

Fix M1 and M2, and either fix N1 and N2 or disposition them with the faculty. Any listing or key that changes (the AeroLink v0.3 file, a new P1a-style predict file, the bike-share key) needs one recorded checker run. A confirmation pass needs only:
- the relabelled calibration and reveal text, with the new silent-pass row;
- the regenerated AeroLink flow, or the disclosed limitation;
- the workload rows and the three-person tool text;
- the new output/input gaps;
- the updated `week10-report.json`.
