# Week 8 sign-off pass: Architecture viewpoints, decomposition, interfaces and information (CP3; micro-lab 3)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

No course or app file was edited. One mutation was applied and reverted (see "Mutation spot check"). After the revert, `git diff --stat` in `learning-studio/` shows only the 12 screenshot PNGs that were already modified before this pass.

## Verdict: **SIGN-OFF**

All 26 findings of the first review are resolved, or rejected with evidence that holds (F26). The post-fix reference batch (IF-010..014, AI-001 on PHY-005, DEC-002 text, FN → SCN links, PHY-006 rationale) is reflected correctly in the lesson, answer key, tools and tests.

Both sets of numbers recompute exactly by hand:
- **Current reference:** 14 interfaces, degree sum 28, 12 of 66 pairs, κ 10/19 and 16/19, typed gaps none in A and 4 of 8 in B.
- **First version:** 9 interfaces, PHY-004 degree 5, 9 of 55 pairs, 3 gaps in A and 7 in B, 5 tracer advisories.

The lesson labels the first-version numbers, with one exception: a stale "five interfaces" in the application block (S01, minor).

The checker statements reproduce. There are no new critical or major findings. Five minor findings follow; none blocks.

## Runs

From `learning-studio/`:
- `npx tsc -b`: **exit 0**, no output.
- `npx vitest run src/activities/week08 src/content src/model`: **10 files, 207 tests, all passed** (Week 8 alone: 58 tests = 47 logic + 11 activities, matching the notes).
- SysML probes. Before the run, `tasklist | grep -i java` returned nothing. One checker invocation ran all four scratch files, with `--report` going to the scratchpad (`.../scratchpad/w8probes/signoff-report.json`), against the pilot implementation, release 2026-08 (kernel 0.62.0):

| Probe | Content (scratch file, not a course listing) | Author's record | This pass |
|---|---|---|---|
| P5 | subject `aircraft : EVTOLAircraft`; constraint on `aeroLink.'PHY-003'.chargeTimeToDispatch`; `satisfy … by aeroLink.'PHY-001'` | PASS, no diagnostic | **PASS, no diagnostic** |
| P6 | subject `aircraft`; `EVTOLAircraft` also declares `chargeTimeToDispatch` | PASS, no diagnostic | **PASS, no diagnostic** |
| P7 | listing 1 with `satisfy 'REQ-SYS-001' by aeroLink.'PHY-001'` | PASS + WARNING 17:27 | **PASS + `WARNING 17:27 Bound features should have conforming types`** |
| P10 | REQ-SYS-002 (subject aircraft) `satisfy … by aeroLink.'PHY-002'` (a VertiportNetwork that declares `padEdgeNoise`) | PASS + WARNING 15:27 | **PASS + `WARNING 15:27 Bound features should have conforming types`** |

These confirm the lesson's claims in `w8-sysml-commentary` ¶3, the claims in q8-13, misconception 5 and the caution on checker behaviour:
- the checker resolves names, but does not enforce the choice of subject or satisfier (P5, P6);
- a satisfy by an element of the wrong type is a warning only (P7, P10).

The `sysml/week08` listings have not changed since the first review (`git log`: last commit `0b6fb77`), so the first review's PASS/PASS/FAIL results stand.

## Disposition of the first review's findings

| ID | Sev. | Status | Evidence (this pass) |
|---|---|---|---|
| F01 | High | **RESOLVED** | The false rule is gone. Commentary ¶2 says the error is name resolution only and that S10 sl.87 is a permission, and cites `maxChargeTime`/`massReqd`. q8-14 b is rekeyed, and the false rule is distractor c with an explanation. Misconception 5 is added. R74 sl.87 re-read ("Features of the subject can be used in the requirement definition"). |
| F02 | High | **RESOLVED** | Commentary ¶3 states what the checker does not catch: P6, P5 and P7 with their outcomes. All three reproduced in this pass. It also links RB-8.1 ("warnings explained"). |
| F03 | High | **RESOLVED** | `N2Coupling.tsx` "My workspace" mode uses `flowsFromModel` / `allocationFromModel` and the student's own PHY and typed IF list. **Probed on a student-style model** with its own IDs (FN-101..106, PHY-101..106, EXT-101, IF-101..106, flows recorded in the editor's `<kind>: <item> [owner · provenance]` form, plus an FN → INFO → FN chain). Seven flows were read; A came from the recorded allocation. κ A = 6/7 = 0.857 and B = 7/7 = 1.0. The type-aware gaps reported the organisational-only pair (IF-103) and missing interfaces, and the physical IF-101 correctly carried the energy flow. Memo budget: 0.4 h budgeted, ≈ 1.2 h realistic, disclosed. |
| F04 | Medium | **RESOLVED** | `pairsWithoutInterface` and `traceInformation` are type-aware. The rule is stated in the lesson, the cautions and the template (B5). Recounted by hand (below). |
| F05 | Medium | **RESOLVED (residual leaks → S03)** | Every reviewer string is now flagged for the stated reason (tests are matched on the message). The lesson says "screens". New realistic variants still pass; see S03 (minor, honestly labelled). |
| F06 | Medium | **RESOLVED** | q8-11 is a new case: PHY-008 → PHY-002 with a fictional organisational IF-120. It applies the coverage rule and is not answered verbatim. q8-13 is the P10 case (applied, not recalled). |
| F07 | Medium | **RESOLVED** | Taught as a finding in worked (b) ¶4, its table row, the advanced fourth limit and worked (d). The reference is corrected (IF-012, IF-013), and the IF-012 and IF-013 texts match the lesson. |
| F08 | Medium | **RESOLVED** | The budget sums to 10.5 h. The realistic total is 2.5 + 2.1 + 0.2 + 1.4 + 0.3 + 3.5 + 1.5 + 1.2 + 1.1 = 13.8 h (11.5 h without the two graduate items), which matches `WORKLOAD_ANALYSIS.md` row 8. Each compressed line says it is compressed. Lesson word count re-run: `lessonWordCount` = 8,386 (≈ 55 min). |
| F09 | Medium | **RESOLVED** | `course.ts` l.155 now lists R74 sl.86–91 and R83 p.168 as Week 8 micro-lab extracts. This makes caution 2 stale (S02). |
| F10 | Medium | **RESOLVED** | The design aim is cited to R20c p.599 and p.603 (re-read: "Reduction in the number of physical interfaces"; "minimum of physical interfaces with outside"). R22 is presented as the integration analogue. q8-8 b cites R20c p.599. |
| F11 | Medium | **RESOLVED** | P is defined as an upper bound on the direct interfaces needed (direct or recorded relay), consistently in the lesson, the tool text and the `n2.ts` comment. |
| F12 | Medium | **RESOLVED** | The ¶ "A tree is not a derivation" matches the reference links (FN-005 → CAP-001/007; FN-011 → CAP-002/004). |
| F13 | Medium | **RESOLVED** | R20b p.594 re-read: "static decomposition should be established only when scenarios have been created"; "Constitute scenarios of functions … before constituting a decomposition tree". The lesson, the lab step, template B2, the editor (SCN) and the `fn-scenario` advisory are in place. In the reference, 13 FN → SCN links exist and FN-013 has none (explained). |
| F14 | Medium | **RESOLVED** | q8-5 is keyed to "direct allocation on technologies" (R20c p.602, re-read). |
| F15 | Low | **RESOLVED** | "ICT" is kept. The extension to other interface types is labelled as instructor extension. |
| F16 | Low | **RESOLVED** | The "response time" reading is labelled as the course's. The FN-006 argument is the seconds-scale loop. Proximity is attributed to the R20c p.599 candidate aims (re-read). |
| F17 | Low | **RESOLVED** | Misconception 3 cites R20c p.597, with R57 p.411 in the text. |
| F18 | Low | **RESOLVED** | Caution 1 now calls the R22 and R20c pages required extracts (but see S02 for caution 2). |
| F19 | Low | **RESOLVED** | Alt 1 / Alt 2. |
| F20 | Low | **RESOLVED** | Commentary is in `w8-sysml-commentary` after the activity, and `w8-sysml` ends with "do the micro-lab first". |
| F21 | Low | **RESOLVED** | `SatisfyReading.tsx` has two textareas, persisted per browser. The notebook entry "Micro-lab 3" appears in the lab step, the assignment and the answer key. |
| F22 | Low | **RESOLVED** | d5 is a raw log export. d3 explains GEIA-STD-927B. The Bloom levels are relabelled. |
| F23 | Low | **RESOLVED** | `alloc-consistent` covers AI performers. Mutation spot check (below) confirms it is tested. AI-001 is on PHY-005, and DEC-002 no longer names booking. |
| F24 | Low | **RESOLVED** | A fifth limit is present (the flow set favours A; DEC-002's rationale is not what κ measures). |
| F25 | Low | **RESOLVED** | R57 p.411 is removed from worked (c). The remaining R20c p.599 block citation ties only loosely to the counting text; acceptable. |
| F26 | Low | **REJECTION UPHELD** | The listing's doc text is verbatim `week04.ts` l.74 and `aerolink_v02_req_structure.sysml` l.418. The reviewer compared it with the verification criterion string. |
| §7 r.2 note | — | **RESOLVED** | `rubricScope` names RB-16.1 as primary and RB-7.3 for the N² content. |

## Numbers re-verified (by hand from `reference/week08.ts` and `n2.ts`, then against the tests)

**Current reference (IF-001..014)**
- Types: physical IF-001, 005, 006 (3); information IF-002, 003, 007, 008, 010–014 (9); organisational IF-004, 009 (2). Total 14. External: IF-003, 006, 007, 011 (4).
- Degrees: PHY-004 9, PHY-001 4, PHY-002 3, PHY-003 3, PHY-005 3, PHY-007 1, PHY-008 1, EXT-001/002/003/006 1 each, PHY-006 0. **Sum 28 = 2 × 14.**
- Two pairs are joined twice (PHY-004–005 by IF-004 + IF-012; PHY-002–004 by IF-009 + IF-014). That gives **12 pairs of 12·11/2 = 66 (18.2 %)**. PHY-004 takes part in 9 of 14 interfaces (64 %). Four of the five added IFs end at PHY-004.
- **A (reference allocation):**
  - crossing flows F01, F02, F10–F15, F17, F18, so X = 10 and **κ = 10/19 = 0.526**;
  - P = 7, D_max = 4 (PHY-001, PHY-004);
  - typed gaps: **none** (F10/F18 over IF-012, F11 over IF-010, F17 over IF-013; F13/F14 material over physical IF-001; F15 energy over physical IF-005).
- **B (FN-002 and FN-011 on PHY-002):**
  - internal flows F06, F16, F19, so X = 16 and **κ = 16/19 = 0.842**;
  - P = 8, D_max = 5 (PHY-002);
  - typed gaps: **4 of 8** pairs: PHY-001–002 (F12, only physical IF-001), PHY-002–003 (F11), PHY-002–005 (F10), PHY-002–007 (F01, F02). PHY-002–004 is now carried by IF-014.
- Moving only FN-011 or only FN-002 back gives X = 14 (0.737).
- Tracer: no advisories. All five decisions pass the choice screen, and each cites an ID.

**First version (IF-001..009; pinned by `draftIfs` in `logic.test.ts`)**
- 9 IF (3/4/2), PHY-004 degree 5, 11 nodes, so 9/55 = 16.4 %.
- A gaps: 3 (PHY-001–005 F17 with no IF; PHY-003–004 F11 with no IF; PHY-004–005 F10/F18 over organisational IF-004 only).
- B gaps: 7 of 8 (adds PHY-002–004 over organisational IF-009, and PHY-001–005 and PHY-004–005).
- Tracer: 5 advisories, exactly as worked (d) ¶2 and the answer key list them.
- **Labelling:** every first-version figure in worked (b), (c), (d), the advanced block and its table, the answer key and the session notes is labelled "first version" / "IF-001..009" / "before the review", with one exception: S01.

## New findings

No critical or major findings.

| ID | Sev. | Location | Finding | Evidence | Suggested fix |
|---|---|---|---|---|---|
| W8-S01 | Minor | `w8-application` ¶3 (week08.ts l.252) | **Stale, unlabelled first-version number.** "AeroLink's PHY-004 hub, with five interfaces" is the first-version degree. The current reference has 9, which worked (c), its table, the answer key and the session notes all state. No test pins this sentence. | `logic.test.ts` degree PHY-004 = 9; `draftIfs` degree = 5 | "…PHY-004 hub, which takes part in 9 of the 14 interfaces, …" |
| W8-S02 | Minor | Caution 2; `week08_notes.md` "Requests to the lead" 1; q8-12 cite; `w8-sysml` citations | **Stale caution (the F18 class again).** Caution 2 says R74/R83 are listed by `course.ts` for Week 10 and that a request is pending. `course.ts` l.155 now lists R74 sl.86–91 and R83 p.168 under Week 8. Also, q8-12 cites R83 p.166–168 and the `w8-sysml` block cites R83 p.165–166, while the assigned extract is p.168 only. The pages are inside R83's verified range and the lesson paraphrases what is needed, so this is citation hygiene only. | `course.ts` l.155 | Rewrite caution 2 as "assigned as a Week 8 micro-lab extract (`course.ts`)" and close notes request 1. Either widen the extract to p.165–168 (+0.05 h) or keep the citations and say the lesson paraphrases p.165–166. |
| W8-S03 | Minor | `architecture.ts` `functionNameProblem`, `ANCHOR_ID`; `infoflow.ts` `CHOICE` | **§7 rule 5 residual: the screens pass some realistic bad input.** The reviewer's F05 strings are all caught now. These new variants pass (probed with the module's own functions in a scratch script). **Names:** "Vertiport handles passengers" (singular of PHY name "Vertiports"; the prefix match is exact), "Charging station charges aircraft", "Maintenance crew inspects aircraft" (the performer role is not the first word), "Booking backend confirms rides", "AeroLink dispatches aircraft". **Justification:** "We chose PHY-004 because it is the most reliable place for things in general." passes, because "reliab" counts as a criterion and `ANCHOR_ID` accepts PHY/LOG IDs, that is, the allocation target itself. The lesson says the ID should be the REQ, IF or INFO the criterion rests on. **Decision:** "Used to release monthly reports to the board" passes on the verb "release". The lesson and facilitation notes honestly call these screens that a reviewer backs up, so this is minor. | Scratch probe `w8heur.ts` output | Match PHY names ignoring a trailing "s". Also test the second word against the performer list, and add station / backend / back end / the enterprise name. Exclude PHY/LOG from `ANCHOR_ID`, or require at least one REQ/IF/INFO/SCN/DEC ID. Require "release" to take an aircraft / hold / flight object. Add the strings above as tests. |
| W8-S04 | Minor | Tracer instruction ("for each '!' … record the relay path"); lab step "Information flows"; `ArchitectureEditor.tsx` | **The relay path is taught but has no recording route in the tools.** The editor has no relay field. Neither `traceInformation` nor `pairsWithoutInterface` reads a recorded relay, so a student who resolves an advisory by a relay keeps the "!". The reference's relay sits in an INFO `relay` attribute that only `reference.detail.test.ts` checks. Worked (d) ¶2 hints at this ("the tracer checks element-to-element pairs only"), but the instructions read as if recording a relay clears the advisory. | `grep relay src/activities/week08/ArchitectureEditor.tsx`: no match; `infoflow.ts` l.60–70 | Add one sentence to the activity instruction and the lab step: "A relayed pair keeps its '!' in the tracer; record the route (hops and IFs) in the INFO's description so the reviewer can check it." Or add a relay field and honour it in both checks. |
| W8-S05 | Minor (wording) | Worked (b) ¶5; answer key line 1 | **"The first version raised two more [advisories]" is true only under today's checks.** `fn-scenario` and the AI-performer branch of `alloc-consistent` were added in the fix pass. Under its own checks the first version raised only PHY-006. | First review §7 rule 4 note; `logic.test.ts` mutations | "Run against the first version, today's checks raise two more …" |

Not a module finding: `exports/curriculum/{student,instructor}/week08.md` (generated 19:16, before the reference batch) still carry the first-version numbers. DECISION_LOG says the exports are regenerated at M6; regenerate them then.

## AUTHORING_GUIDE §7 rules (this pass)

| Rule | Status | Note |
|---|---|---|
| 1 Owner and provenance recorded | Met | Unchanged since the first review. FLOW links carry `[owner · provenance]` in the rationale (verified in `ArchitectureEditor.tsx` l.121). |
| 2 Graduate task always read | Met | RB-16.1 is primary, RB-7.3 covers the N² content. The tool works on a student's own model (probe above). |
| 3 Realistic workload | Met (overrun disclosed) | The 13.8 / 11.5 h against 10.5 h is stated in the cautions and in `WORKLOAD_ANALYSIS.md`. Options are given to the lead. |
| 4 Reference passes its own checks | Met | Required and minimum checks pass. There are two explained advisories (PHY-006 the medium; FN-013 planning). The tracer and the typed gaps for A are clean, and the coverage rule is tested hop by hop on the reference. |
| 5 Heuristics fail on realistic bad input | Largely met | The reviewer's strings fail for the stated reasons, but residual leaks remain (S03). |
| 6 Quiz not answered verbatim | Met | q8-11 and q8-13 are new applied cases. |
| 7 Source levels and terms not merged | Met | Course conventions are labelled. R22 and R20c, and MITRE ICT, are attributed correctly. |
| 8 IDs | Met | Fictional IDs do not collide: IF-110 (test), IF-120 (q8-11), INFO-101..105 (peer sample), FN/PHY-1xx (my probe only). |

## Sources re-read this pass (`python -I scripts/source_pages.py`)
- R20b p.594: the static-decomposition pitfall and the "Constitute Scenarios of Functions" practice.
- R20c p.599: candidate-architecture aims (fewer physical interfaces, proximity, modularity, resilience).
- R20c p.602–603: direct allocation on technologies; modularity; focus on interfaces.
- R74 (S10) sl.87: subject features are a permission; a requirement is always about some subject.
- R83 (S06) p.168: satisfy is a kind of assert constraint usage that binds the subject to the satisfying feature; negated (`not satisfy`) form.

The citations added in the reference batch are all reference or risk IDs, or re-uses of pages already verified (R20b p.594, R20c p.599, R22 p.631). No new source page entered the lesson.

## Mutation spot check
- **Mutation:** in `architecture.ts`, `performerPhys` was built from LOG elements only (the AI performers were dropped, reverting the W8-F23 fix).
- **Run:** `npx vitest run src/activities/week08` gave 1 failed and 57 passed. The failing test was "mutation: hosting AI-001 on PHY-004 again (the first version) fails alloc-consistent for FN-008 — for the AI performer, not for LOG-003".
- **Revert:** `git checkout -- src/activities/week08/architecture.ts`. Afterwards `git diff --stat` showed the same 12 pre-existing screenshot changes only.

## What was verified
- **Every original finding:** checked against the current `week08.ts`, the activities, `reference/week08.ts`, `course.ts` and the notes. The notes' disposition table was verified rather than trusted. One stale item in the notes was found (request 1; S02).
- **Every number in worked (b)–(d), the advanced block and its table, the answer key, the session notes and the q8-6/q8-8 arithmetic:** recomputed by hand, and the current and first-version figures cross-checked against `logic.test.ts`.
- **Checker behaviour:** four probes re-run (P5, P6, P7, P10), all identical to the record.
- **Graduate memo path:** works end to end on a workspace model with the student's own IDs, flows and typed interfaces.
- **Reference batch consistency:**
  - IF-010..014 texts and ends match the lesson's tables and paragraphs;
  - PHY-006 rationale (the medium of IF-002/010/012/013/014) matches worked (c) ¶3;
  - AI-001 is on PHY-005, and INFO-003 carries the `relay` attribute;
  - DEC-002 text matches the advanced block ¶1;
  - the FN → SCN links match worked (b) ¶2;
  - `reference.detail.test.ts` and `sysmlDrift.test.ts` pass.
- **Planning:** budget sum 10.5 h; `WORKLOAD_ANALYSIS.md` row 8 matches; DECISION_LOG W7 (graduate tasks always read) is applied.

Reviewer: Independent AI reviewer (Claude), sign-off pass. 2026-10-11.
