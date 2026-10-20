# Week 5 review dispositions (review of 2026-10-19, package `7ab45a5`)

Input: `_source_cache/review/week05_review.md` (REVISE: blocker 0, major 2, moderate 6, minor 22). Fixes written
2026-10-19 in the working tree; **nothing is committed** (the course owner commits). Paths are relative to
`learning-studio/`. Every number quoted below is computed in `src/content/lectures/week05/aerolinkCase.ts`; the tests
named guard it in both directions. Status words: **Fixed** (changed and tested), **Fixed (partial)** (the defect is
removed; a stated remainder is accepted), **Dispositioned** (not changed, with the reason).

## Majors

| # | Status | What changed (file) | Evidence |
|---|---|---|---|
| **M1** radio datalink inside the trust boundary | **Fixed** | Fifth trust-boundary reason `'radio medium'`: "the medium is radio or another medium outsiders can reach" (MITRE R54 p.331, "radios connect subsystems via airwaves"); `RADIO_MEDIUM` pattern (radio, datalink, satellite, Wi-Fi, wireless, cellular, LTE, 3G/4G/5G); the datalink medium now reads "air-ground radio datalink (PHY-006)"; `RADIO_INTERFACES` and `LEASE_DEPENDENT` computed (`aerolinkCase.ts`). Counts recomputed from data everywhere: **14 crossing; possible: IF-012 only (leased ground network); none: IF-004**. IF-013 now authenticates the aircraft as sender. F6 rewritten (computed): the two radio interfaces are hidden external whoever owns the radios; the other five ground-network interfaces depend on leasing. Lesson (rule paragraph, AeroLink count paragraph with verb agreement computed), S1 hidden-external lesson, slide bullet and notes, S2 trust-boundary caption, alt, notes, figure walk, worked-security caption/alt/notes, Q10 `courseSource` (five tests). Figure `w5s2-trust-boundaries` redrawn with a radio example (5). Tool: `UNOWNED_MEDIUM` widened to radio, wireless, Wi-Fi/wifi, cellular, mobile, LTE, 3G/4G/5G, satellite, VPN, Bluetooth, API, web, online, SaaS, third-party, public, internet, cloud, network, link, leased; advisory text and the exposed-box label name radio. | `aerolinkCase.test.ts`: reasons for IF-002/IF-013 = `['radio medium']`, IF-012 not crossing, 14 crossing, `RADIO_INTERFACES`, `LEASE_DEPENDENT`; radio both directions (9 media cross, 5 wired/other media, including "radiography report courier", do not); IF-013 authenticates. `record.test.ts` "M1": advisory fires for 12 radio/network media unless ticked, not for 4 wired or paper media. |
| **M2** unstated word minimums | **Fixed** | `record.ts`: `MIN_PART_WORDS` 3 → 1 (protection or its reason, decision, external reason, standards); `MIN_TEXT_WORDS` 5 → 2 (degraded mode, change, responsibility of card and component, previously 3); `criterionOk`: two words, or one token with a number or a TBD ("2 min", "≤2min", "TBD (Ops)", "100%"). Every remaining threshold is stated in the gate `short` text in `labBrief.ts`, so the generated table in `WEEK5_LAB_INSTRUCTIONS.md` shows it, with a student-visible basis ("Fail safe" on the S2 slide face; "a power cable carries no data, and saying so is a complete answer" in the lesson; "the responsibility in one sentence"). The "prevented by construction" claim is corrected in `labBrief.ts` (header) and `WEEK5_MILESTONE_REPORT.md` (§5, §9). | `record.test.ts`: accept "Fail safe", "Hold all departures", "Fall back to radio", "Switch to manual procedure", "Power only", "TLS", "Mutual TLS", "Approved" (decider "ICWG"), "2 min", "TBD (Ops)", "Charges aircraft", "Raises alarms", "Watches freezers", "No arrangement yet", "Natural system: no exchange", "Add encryption to IF-006", "None apply"; reject empty fields, "Stop", "Freezers", "Fast", "Encrypt". Cross-week: `src/workbench/shortAnswers.test.ts` (Week 5 block). Gate rows in `../GATE_SWEEP_2026-10-19.md`. |

## Moderates

| # | Status | What changed | Evidence |
|---|---|---|---|
| **Mo1** IF-015 decision miscount | **Fixed** | `INTERFACE_DECISION.counts` = new interfaces `{direct 1, relay 1, manual 0}`; new `path` `{direct 1, relay 2}`; rationale states that the count does not decide and gives the real differences (second system and owner in the path, INFO-006 added to IF-014, store-and-forward duty). S1 lesson drops the R20c p.599 "the relay costs one more" argument; slide notes, caption, alt, bullet B and the answer figure cards ("1 new interface · path of 2") corrected. | `aerolinkCase.test.ts` "DEC-003 counts what the data say": both options give the same N² size; the old phrase is absent. |
| **Mo2** forecast coverage | **Fixed** | IF-011 constraint: "at least every 10 min, each covering at least the next 60 min"; degraded trigger: "the newest valid forecast no longer covers the next 30 min (it is more than 30 min old)". REQ-SYS-014 statement and criterion add the 60 min horizon; rationale restated as horizon − interval = 50 ≥ 30 min, two consecutive lost refreshes tolerated. | REQ-SYS-013..015 still pass the Week 2 gates (`aerolinkCase.test.ts`, real Week 2 record). |
| **Mo3** assessment | **Fixed** | New `docs/lectures/week05/WEEK5_APPLIED_EXERCISE_BRIEF.md` (Ridgeline Mountain Resort: elements, externals, seven exchanges incl. a radio safety link, two requirements, the change; marking notes per task, incl. the radio trust-boundary point and "short answers are complete"). Exercise moved off the ferry domain (quiz Q3/Q11 keep theirs, so no setting overlap). Four tasks with a minute split (6 + 10 + 13 + 6 = 35); four criteria (definitions and requirement merged) = 16 points. Graduate task gains two criteria (alternatives and flow set; crossings checked against interfaces) = 4 × 4 = 16 points, the same scale, stated on the page and in the lab text. | `Assessment.tsx`, `week05Lab.ts` `LAB_LEVELS`, `LAB_SUBMISSION.graduate`; `week05Lab.test.ts` green; e2e `week5-flow` checks both tables. |
| **Mo4** modularity figure geometry | **Fixed** | Geometry moved to `week5FigureKit.ts` `MODULARITY` with new node positions; `pointSegment` / `minLinkClearance` helpers. | `src/components/figures/week5FigureKit.test.ts`: every link clears every non-endpoint node by more than r + 8 in both panels; five crossing links; the pre-review layout fails the check (negative direction). Render-checked in the PNG. |
| **Mo5** degenerate grouping criterion | **Fixed** | Lesson paragraph, slide bullet and notes: one aggregate of everything scores zero and is no plan; compare groupings of similar size and weigh between-aggregate interfaces against the largest aggregate and the owners' delivery order. Counts unchanged. | `session2.ts` (lesson `w5-lesson-coupling`, slide `w5s2-integration`). |
| **Mo6** latency budget not taught; provisional no-go conflict | **Fixed** | Limits slide face: a bullet "Latency budget: 120 s = 30 + 30 + 30 s + 30 s margin; a hold precedes classification" (computed). The middle leg is now a **hold pending classification** ("a reported fault code on the no-go list marks the aircraft unavailable at once (a hold, not a classification)"), matching REQ-SYS-008's wording ("mark an aircraft unavailable") and keeping Week 4's rule that only certifying technicians classify; `LATENCY_BUDGET.holdNote` and `linkLossNote` explain it and the in-flight link-loss exception, shown in the lesson, the slide notes and the Examples caption. IF-013 degraded mode states that the 2 min cannot hold during link loss. | `timing.test.ts` (≤ 130 wpm on the limits slide after trimming the note). |

## Minors

| # | Status | Disposition |
|---|---|---|
| n1 | Fixed | "(course convention)" on both N² convention bullets (`session1.ts`). |
| n2 | Fixed | Slide face: "**Fail safe** (course default)". The optional R24 p.1207 "safe state" citation was not added: not re-verified in the page text this round. |
| n3 | Fixed | Lesson: "On κ and P the chosen platform is less coupled (the most partners of one element are equal)". |
| n4 | Fixed | IF-001: PHY-002 → PHY-001 "boarding passengers"; PHY-001 → PHY-002 "alighting passengers". |
| n5 | Fixed | Week 4 FN-010 outputs "pad incident records" (INFO-006), with no destination, so no Week 4 or Week 5 flow count changes (`week04/aerolinkCase.ts`; test "the FN-010 producer exists upstream"). Also closes Week 4 confirmation N1's first item. |
| n6 | Fixed | Lesson and S2 coupling notes explain 20 (Session 1, incl. external flows) vs X (function-to-function only). |
| n7 | Fixed | Worked-security alt text now promises what is drawn: reason, one protection example and the degraded mode per card, and the strip. |
| n8 | Fixed | Trust-boundary figure redrawn: examples 3, 4 and 5 each join two elements of one owner (so only the public-facing end, the public network, or radio can make them cross); the leased line has two ends. |
| n9 | Fixed | The change request is read and the pair question posed in the standards slide's transition, before advancing; the change-control notes take the answers first. |
| n10 | Fixed | The worked-security notes take the pair answers posed on the trust-boundary slide before advancing; "before revealing each card" removed. The slide question now names the charger data link (it said "maintenance link", which the worked answer never covered: found while fixing). |
| n11 | Fixed | Worked N² notes: count after the pairs place and check; "row and column". |
| n12 | Fixed | "the reference was checked for both" (S1 lesson) and "the reference was checked for it" (S2 notes). |
| n13 | Fixed | WBS sentence names outcomes ("the app design", "integration test results"). |
| n14 | Fixed | `labBrief.ts` basis strings: component name basis matches the glossary wording, "Layers, and five plus or minus two per level", the one-shall basis says where the rule is taught, the impact basis no longer cites R22 p.631 and says "candidate neighbor". `week05Lab.ts` fallback slide titles replaced by the real titles. |
| n15 | Fixed | `PART_RULES` gains `icwg`, `standards` and `unique-ids` with a basis each; standards relaxed to one word ("None apply" passes) with an advisory when "none" has no reason. |
| n16 | Fixed | Advisory `owner-spelling` when an owner differs from the end's card owner (never a gate). |
| n17 | Fixed | Advisory `no-internal-end` for an interface between two externals; it still counts (an outside path can matter to the audit). |
| n18 | Fixed | Importing a teammate's file asks for confirmation when the record holds work (`hasWork`); cancel keeps the record. e2e `week5-flow` accepts and asserts the dialog. |
| n19 | Fixed | Method and kind are trimmed and lower-cased on import ("Test" → "test"). |
| n20 | Fixed (partial) | Q5 offers "five"; Q12 gives the link count (14 → 8) and has a hedged wrong distractor; Q2 has a hedged wrong distractor. Not changed: Q4 per-position majority (varying the four parts would re-open the length rules; the item still needs the typing of item 3 and the external flag of item 4), Q10 distractors (under the five-reason rule any different-owner link crosses, so a non-crossing distractor must be same-owner), Q11 c (its stated reason is the content tested). All quiz rules stay green (`quizWeek5.test.ts`, 26). |
| n21 | Fixed | Q3 explanations rest on the lesson's "the work that delivers it"; Q7 b rests on the lesson's ICWG sentence (R57 p.414); Q12 c names "the concentration risk the lesson names" instead of "disaggregation". |
| n22 | Fixed | `WEEK5_MILESTONE_REPORT.md` status names `7ab45a5` and points here for the uncommitted fixes. |
| Figure legibility | Fixed (partial) | Worked-breakdown component boxes wrap at 19 characters on a wider box; the external corner mark no longer covers IF digits (cells reserve its width); integration pills take their interface kind's colours and the links stop at the pills (rows offset); IF-015 label moved clear of its arrowhead; change-control "reached" fill strengthened. Not changed: IF-005 label spacing next to IF-001 on the full-width change-control N² (column widths are proportional to the 15-element grid at the 12 pt minimum; see render notes below). |

## Render check

All changed figures were exported by `npm run lectures:pptx -- --week 5` and opened as PNGs in
`exports/lectures/.figure-cache/` (see the gate section of the final report for the list and what was seen).

## Gates

Recorded in the final report of the fix session (tsc, oxlint, vitest, vite build, student build, Playwright week1–5,
week8 flows and lectures-week5).
