# Week 2 review dispositions

Review: `_source_cache/review/week02_review.md` (2026-10-19, verdict REVISE: 0 blocker, 2 major, 8 moderate, 13 minor).
Fixes made on 2026-10-19 against commit 8d0a0b1. Nothing committed. The status values are **fixed**, **fixed in part**
and **deferred**, and every deferral gives its reason.

## Major

| # | Status | What changed | Evidence (test) |
|---|---|---|---|
| M1 | fixed | `record.ts` gets a new function, `subjectAccepted(subject, names)`. A subject of two or more words passes as before. A one-word subject passes when it is a proper name (capitalized, and not a pronoun, determiner or quantifier) or when it is the team's enterprise or scenario-SoI name in any case. Pronouns (it, this, they, we, you …), determiners and empty subjects still fail. The fix stays in Week 2: the shared `subjectOf` in `activities/week04/quality.ts` is unchanged, so Week 4 is not affected. | `record.test.ts` "review M1": "MedFly shall …", "Dispatch shall …", a named subject after a condition clause and a lower-case SoI name all count. "It/They shall …", "…, it shall …", lower-case "system shall …" and the bare determiners fail. |
| M2 | fixed | (a) The trace is fixed. NEED-011 leaves CAP-005, which now traces NEED-002 only (`provenance: 'corrected'`). It moves to a new proposed CAP-015, Disruption notice and re-accommodation, which SCN-005 exercises. No requirement reaches NEED-011 by any path. The reference reading is kept as `CAP005_REFERENCE_NEEDS`. (b) The audit rule is now explicit (`AUDIT_RULE`): a need counts as covered only when a stakeholder requirement names it as a parent. It is stated on S2.12 (notes), on S2.13 (notes), in the lesson and in lab method step 7. (c) The reason is rewritten to agree with the TBD slide. Nothing stops the requirement being written now, with an owned TBD for the notice time and A-008 in its rationale. The reference leaves it unwritten so that the audit has a real gap to find. The disposition: record why not, open item, write it in Week 3. The capability-gaps figure and slide show the CAP-005 correction and CAP-015. The worked-examples "Try it yourself" panel no longer waits on A-008. It now uses a numbered TBR-03 on a new unknown U-007, and its gate claims are tested. | `aerolinkCase.test.ts` "M2": no requirement's `needsOfRequirement` contains NEED-011. The negative direction is also tested: putting NEED-011 back on CAP-005 makes REQ-STK-003 reach it. `record.test.ts`: both illustration requirements pass every gate with no advisory, and without U-007 the TBR fails `tbx-owned`. |

## Moderate

| # | Status | What changed |
|---|---|---|
| M3 | fixed | A badge now means "exercised by" and agrees with `NEED_COVERAGE`. SCN-002 adds CAP-007 (step 5, noise). SCN-003 adds CAP-010 (step 2) and CAP-009 (alternate A3). SCN-005 adds CAP-015. The S1 notes are now computed from the data: "SCN-002 touches the most needs (5)", and the only reference capability without a badge is CAP-008, which matches the planning need NEED-005. The tree's alt text and figure walk are generated too. Test: the "most needs" scenario, the unbadged list, and that every badge is backed by a coverage row. |
| M4 | fixed | A tenth hard gate, `unmeasurable`, is added in `labBrief.ts` (`REQ_HARD_GATES`, `UNMEASURABLE_TERMS`). It covers easy to use, user-friendly, quick(ly), fast, rapid(ly), adequate(ly), as appropriate, as possible, safe(ly), unsafe, quiet(ly), and maximize/minimize/optimize. These fail when the statement has neither a bounded value nor a TBD/TBR. All other vague words stay advisory. Tested in both directions: F4, F5, "easy to use" and "respond quickly" now fail, and only this gate fails. These still count: "quickly … within 5 s", "shall not … (TBD-01)" with an owner, the fare display "including every charge", "support", and "before 07:00 and after 20:00". The single-mutation table includes the new gate. The S2 critique note and the lesson paragraph now say that this one word-level sign blocks. The AeroLink standard and the food-bank fixture still pass every gate. |
| M5 | fixed | "SEBoK form" becomes "the recommended form" in session1 (caption, alt text, lesson), in `LectureWeek2S1.tsx` and in `Assessment.tsx`. None is left in Week 2 student text. The internal outline doc is not student text and is left unchanged. |
| M6 | fixed | U-001 now closes "before the Week 7 package baseline". U-002 now closes "before the Week 3 trade study". MOE-005 now reads "unit costs in the Week 3 trade study". `course.ts` (Week 2 entry only): "Measures: MOE, MOP and TPM" becomes "Measures of effectiveness and performance (MOE, MOP)". The Week 3 topics belong to the Week 3 agent and were not edited. Test: no "Week 7 trade study" and no "requirements baseline (Week 6)" in the case. |
| M7 | fixed | There is now one vocabulary, taken from the lecture, in `labBrief.ts` `AUDIT_DISPOSITIONS`: write the requirement; link the real parent; record why not. "Record why not" takes one of two forms (`RECORD_WHY_NOT_FORMS`): an open item (O), or no child needed (R). The lecture notes and lesson, the S2.13 figure legend, lab method step 7, the tool's Part 11 help, field labels and issue messages, and the case's `STK_DISPOSITIONS` all use it. A new `STK_DISPOSITION_FORM` replaces the old regex on "recorded reason". "Covered elsewhere" is gone, and the lab adds "never link a requirement that does not carry the need". Test: no "covered elsewhere" or "recorded reason" in the case dispositions. |
| M8 | fixed | REQ-STK-007 is widened to the corrected NEED-008 class ("a passenger with reduced mobility"). A new `PARTIAL_COVERAGE` lists NEED-008 (mobility aid), NEED-006 (responder access) and NEED-017 (public transport), each with an open-item disposition. The audit notes say so, the lesson says partial coverage is recorded the same way, and the catalogue on the worked-examples page has the table (it sits outside the lesson to keep the workload within 8.0 h). Test: each partial-coverage row names a real child of the need. |
| M9 | fixed | The slide stays at 6 min, so the session totals are unchanged. Students now propose four fields (boundary, primary actor, trigger, one alternate) and the rest is revealed. The subtitle, purpose, teach notes and timing split (1.5 + 1.5 + 1 + 1.5 + 0.5 = 6) are updated. `timing.test.ts` still requires at least 5 min, and the spoken density stays at or below 130 wpm (tested). |
| M10 | fixed | Proposed MOE-008, Responder alerts on time (NEED-006, CAP-009), now carries MOP-008. Proposed MOE-009, Grid connection compliance (NEED-010, CAP-010), now carries MOP-009 (which also links REQ-STK-010). MOE-006 now measures NEED-005 and CAP-008 instead of NEED-001 and CAP-005. Test: every MOP's MOE measures a need that its own requirement reaches. One documented exception is kept: MOP-002 (charge time) supports MOE-001 (wait) through the turnaround, a reference link the review did not flag. The negative direction is tested too: MOP-008 on MOE-004 is caught. |

## Minor

| # | Status | Disposition |
|---|---|---|
| N11 | fixed | The S1.3 note warns that R98 p.1001 is a table in SEBoK's diversity, equity and inclusion article, used here for the process order only. |
| N12 | fixed | "TBD-1" now gets the message "Number the TBD-1 with two digits (for example TBD-01)", and a TBR keeps its own stem (tested). |
| N13 | fixed | Lab procedure: "Each member writes at least ⌈10/4⌉ = 3 (a three-person team: ⌈6/3⌉ = 2 each)", computed from the minimums. The seven-day figure and its alt text say the same. |
| N14 | deferred | The reviewer marked this optional. A name-in-SoI-sentence advisory would also fire when the SoI sentence lists an actor as outside the system, which is the very case the sentence is meant to state. The check stays with the instructor at the clinic. |
| N15 | fixed | `DISCOVERIES[0].text = need('NEED-011').statement` (tested). |
| N16 | fixed in part | w2q-9 is relabeled (library: needs A–C, R1–R2, D1–D3, with need B childless) and no longer reuses the S2.12 labels. The w2q-3 key now has "and", and "at weekends" becomes "on weekends". w2q-7 (b) becomes "accept all fare-policy payment methods", with an R55 p.367 explanation. w2q-12 is reworded as a judgment between four proposals; it stays tagged Evaluate, because retagging it would leave only three Bloom levels against the test's four. Not changed: the "Analyse" spelling. It is the shared `Bloom` type value in `course.ts`, used by every week, so it is a template-level rename. Key distribution still a/b/c/d 3/3/3/3, length ranks 3/3/3/3 with no run of three (tested). |
| N17 | fixed | REQ-SYS-004 now reads "forecast wind, gust or visibility … outside the aircraft limits (TBD-01)", and its criterion reads "outside". |
| N18 | fixed | ConOps fleet: "12 eVTOL aircraft at opening … growth to about 15 aircraft for 300 trips/day by month 24 sized in the Week 3 trade study". The arithmetic is tested: 12 × 20 = 240 < 300 and 15 × 20 = 300. |
| N19 | deferred | The "[S01/S02]" and "S12 p.144" text comes from the shared rubric register (not a Week 2 file), and Week 1 has it too. The reviewer asked for a template-level fix. |
| N20 | fixed | `Assessment.tsx` now has four-level descriptors for the five applied-exercise criteria and for three memo criteria (checklist coverage, evidence, fixes). The memo scope is narrowed to six checklist items, so the 0.8 h estimate holds. |
| N21 | deferred | The lesson is at the 8.0 h budget (7,636 words, so 0.8 h; about 13 words of headroom). A consolidated "why each method" table would push the week over budget. Proposed for the Week 3 batch as a faculty-notes slide or a Home-page panel, which do not count toward the lesson load. |
| N22 | fixed | Clinic: about 80 s per team plus 20 s for the decision, so 5 × 100 s = 8 min 20 s inside the 9 min slot. Updated in the subtitle, alt text, notes, timing and figure. |
| N23 | fixed | The S1.3 misconception now cites "(R13 p.561)", and R13 p.561 is added to the slide sources. |

## Changes affecting Week 3

Week 3 imports `week02/aerolinkCase.ts` read-only. All existing exported names are kept; additions only.

- **CAP-005.needs** is now `['NEED-002']` (was NEED-002, NEED-011), with `provenance: 'corrected'`. NEED-011 is on the new **CAP-015** (proposed).
- **SCN-005.capabilities** is now `['CAP-005', 'CAP-015']`. **SCN-002** adds CAP-007. **SCN-003** adds CAP-010 and CAP-009.
- **`DELIBERATE_REQ_GAP` text changed.** `finding` names CAP-015 and "no requirement reaches it by any trace path". `why` and `disposition` are rewritten (disposition: "Record why not, open item: write it in Week 3 with an owned TBD for the notice time, traced to NEED-011 and CAP-015"). Week 3's I-001 interpolates `finding`. If Week 3 writes the NEED-011 requirement, it closes this open item.
- **U-001 closeBy** is now "… before the Week 7 package baseline". **U-002 closeBy** is now "… before the Week 3 trade study".
- **MOE-005 dataSource** is now "unit costs in the Week 3 trade study". **MOE-006 measures** is now `['NEED-005', 'CAP-008']`, `provenance: 'corrected'` (Week 3 CRIT-003 uses MOE-006).
- **New MOE-008** (responder alerts) and **MOE-009** (grid connection compliance). **MOP-008** now measures MOE-008 (was MOE-004). **MOP-009** now measures MOE-009 and REQ-STK-010 (was MOE-002).
- **REQ-STK-007** statement is widened to "a passenger with reduced mobility". **REQ-SYS-004** statement and criterion now cover visibility ("outside the aircraft limits (TBD-01)").
- **STK_DISPOSITIONS** strings now start "Open item:" or "No child needed:". New exports: `AUDIT_RULE`, `CAP005_REFERENCE_NEEDS`, `STK_DISPOSITION_FORM`, `PARTIAL_COVERAGE`. The ConOps fleet value now says "12 … at opening … about 15 … in the Week 3 trade study".
- `labBrief.ts` (Week 2) gets a tenth hard gate, `unmeasurable`, and `AUDIT_DISPOSITIONS`, `RECORD_WHY_NOT_FORMS`, `AUDIT_DISPOSITION_TEXT` and `UNMEASURABLE_TERMS`.
- No register change is needed: every new citation (R13 p.561, R55 p.367) is in an existing range. `readings.py` was not touched.

## Gates (2026-10-19, from `learning-studio/`)

- `npx tsc -b`: exit 0. The Week 8 `skeleton.ts` error the review reported is gone at this time.
- `npx oxlint src`: exit 0, with 0 errors and 73 warnings, none in Week 2 files.
- `npx vitest run`: 1,516 of 1,519 passed, with all Week 2 suites green. Three tests time out at 30 s: two in `activities/week07`, one in `activities/week11`. Re-run alone, two still time out: Week 7 (untouched, and it imports no Week 2 file) and Week 11 (being edited by another agent). This is environmental load, not a Week 2 failure.
- `npx vite build`: exit 0.
- `npm run build:student`: tsc and the student vite build pass. `check-student-build.mjs` reports one leaked marker, "Security enters as two must-meet screens", from `week03/session2.ts` (the Week 3 agent's in-progress file). There is no Week 2 leak, and the Week 2 student decks have empty notes (24 and 22 slides).
- `npm run lectures:pptx` and `npm run lab:md`: regenerated. Both scripts rewrite every week's outputs, including the Week 3 and Week 8 exports and lab files, from their current sources.
- Playwright: `e2e/week2-flow.spec.ts` (default config, shared 5173 server) passed 6 of 6, including axe in light and dark at 1440 and 400 px. `-c playwright.lectures.config.ts e2e/lectures-week2.spec.ts` passed 4 of 4, with axe reporting no violations. The lock was held as week02-agent and then deleted. Neither spec writes tracked screenshots.

## Gate sweep 2026-10-19 (cross-week “tool rejects valid short answers”)

Found as Week 2 M1, Week 4 M2/N3 and Week 5 M2; swept across every team lab tool. A length or form gate stays only when a
student-visible sentence makes the short entry a real defect and the threshold is shown to the student. Full
before/after table, justification and the gates examined and kept: `docs/lectures/GATE_SWEEP_2026-10-19.md`. Shared
test: `src/workbench/shortAnswers.test.ts`. Record and gate signatures and the export format are unchanged.

| Gate | Before | After | Why |
|---|---|---|---|
| Requirement criterion | ≥ 3 words | written; trivial/vague still fail | “2 min”, “Every delivery”. |
| Requirement rationale | ≥ 6 words | written, not empty answer; restatement check kept | “Food must be kept cold.” |
| Scenario name | ≥ 2 words | written | “Blackout”. |
| Scenario trigger, success, failure | ≥ 3 words | written, not an empty answer | “Power fails”, “Fail safe”; “None” failure still fails. |
| Scenario preconditions | ≥ 3 words | written (“None” valid) | “Shop open”. |
| Alternate condition / response | ≥ 2 words | written, not an empty answer | “Rain” / “Reroute”. |
| ConOps SoI, existing, justification, proposed | ≥ 8 / 8 / 8 / 16 words | one sentence ≥ 3 words each (stated) | Statements, not lengths. |
| Discovery text, clinic reason, coverage reason | ≥ 5 / 3 / 5 words | written, not an empty answer | “Missing cold chain”. |
| Register name; closed by / validated by | ≥ 2; ≥ 3 words | written; not “later” | “Week 6”, “Ask clinic”. |
| Added need statement | ≥ 8 words | ≥ 3 words (stated) | Aligned with Week 1. |
| Capability statement; MOE/MOP definition, source | ≥ 5; ≥ 5, ≥ 2 words | written | “Deliver meals”, “Logs”. |
| Audit disposition | ≥ 5 words | written, not “later” | “Open: AB, Week 6”. |
