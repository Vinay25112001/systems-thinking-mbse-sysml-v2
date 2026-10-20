# Week 3 independent review: Technology Assessment / Risk Management / Trade Study (A21 template package, commit 6026e01)

Reviewer: independent academic and technical reviewer (not the author). Date: 2026-10-19.

**Standard applied:**
- DECISION_LOG A20 and A21, including item 4 (workload in proportion to team size), item 5 (TPMs in Week 3) and item 6 (security and resilience).
- COURSE_PRODUCTION_PLAN.md definition of done, items A–I.
- Week 2 as the signed-off comparison: `week02_review.md`, `week02_confirmation.md` and `src/content/lectures/week02/*`.
- The milestone report, `docs/lectures/week03/WEEK3_MILESTONE_REPORT.md`.

**Scope:**
- `src/content/lectures/week03/*`
- `LectureWeek3{S1,S2,Parts}.tsx`
- `week3Path.ts` and `quizWeek3.ts`
- `lab/week03Lab.ts` and `WEEK3_LAB_INSTRUCTIONS.md`
- `src/workbench/week3/*` and `src/week3/*`
- `exports/lectures/week03-*`
- the uncommitted shared wiring (`App.tsx`, `registry.ts`, `lectures/index.ts`, `Chrome.tsx`, `Dashboard.tsx`)

**What I did and did not change:**
- I edited no source file and committed nothing.
- I wrote one throwaway probe test, `src/workbench/week3/zz_probe_review.test.ts`, ran it, and deleted it. `git status` shows no trace of it.
- Playwright ran under the `_source_cache/.playwright.lock` protocol. I waited twice for the Week 8 agent's lock and deleted my own lock after each run.
- This file replaces the 2026-10-11 review of the earlier, pre-A21 Week 3 (mission analysis / ConOps). That review is still in git history.

## Verdict: **REVISE**

This is a strong, teachable package, and in places it goes beyond the Week 2 template:

- Every slide carries teach, why, figure walk, misconceptions, transition and a timing split. The worked slides carry full solutions whose numbers are computed in one module, not typed.
- The limits of each method are taught explicitly:
  - TRL limits (R16 pp.767–768; R60 p.525);
  - the ordinal-matrix trap, plus a legitimate cardinal expected-loss calculation;
  - the weighted-sum pitfalls, with a real rank reversal under min–max scaling.
- Security and resilience appear three ways, all soundly sourced to SEBoK R24/R25: in the risk process, as must-meet screens, and as a weighted resilience criterion.
- The TPM section corrects the reference's zero-contingency margins against DoD R44 p.117.
- Every number I recomputed independently matches (table below).
- Citation fidelity is very high: 53 claims were checked against the opened pages (50 supported, 3 partial), the DoD Figure 4-9 bands and all 25 cells were checked on the rendered PDF page, and no citation falls outside the register.
- All four gates pass. The student build strips every note.

Two findings are major and must be fixed before faculty review. Both concern the logic of the two central worked artifacts, not their arithmetic:

- **M1.** The trade study's sensitivity analysis and decision conditions point to alternatives that the lecture's own rules eliminate. Three of the four alternatives fail the stakeholder capacity requirement, and two exceed the wait walk-away point that SEBoK defines as "walk away regardless". Meanwhile, the morphological box on the slide before contains feasible alternatives the trade never scores.
- **M2.** REQ-STK-018 is the requirement that closes the Week 2 deliberate gap, the payoff of Week 2's audit teaching. It contains two "shall"s, so Week 2's own hard gate rejects it.

Counts: **blocker 0 · major 2 · moderate 6 · minor 12**.

## Findings

### Major

**M1 (major). The trade study keeps eliminated alternatives in play, so its sensitivity analysis and decision conditions are hollow.**

*Evidence:*
- Capacities: ALT-001 240, ALT-002 288, ALT-003 240, ALT-004 320. REQ-STK-004 requires at least 300 (`week02/aerolinkCase.ts:350`; `session2.ts:290`, "Only … meets 300").
- Waits: ALT-001 and ALT-003 come out at 66.7 min against the 60 min walk-away (`aerolinkCase.ts:464`). They are scored with a clamped value of 0 (`session2.ts:354`).
- The lecture defines the walk-away point as the score at which "however well an alternative does elsewhere, the decision maker walks away" (`session2.ts:181`, `:714`). SEBoK R18 pp.465–466 says the same: "regardless of how well an alternative performs in other measures, the decision maker will walk away from the alternative". The lecture also teaches that "a screen is a walk-away point applied before the arithmetic" (`session2.ts:317`).
- Yet every reversal point leads to a walked-away, under-capacity alternative:
  - cost up at 0.478 → ALT-001;
  - wait down at 0.226 → ALT-003;
  - resilience up at 0.592 → ALT-003;
  - noise up at 0.554 → ALT-003.
- `DECISION.conditions` lists "the board weights capital below about 0.48", and `wouldChangeIf` lists "the baseline ranks first" and "the new vertiport ranks first" (`aerolinkCase.ts:552`, `:560-561`; `session2.ts:392`, `:492`).
- `session2.ts:393` concedes that "the first two amount to abandoning the capacity objective", but still presents them as conditions. It does not mention the walk-away at all, and it is silent on the resilience and noise reversals.
- The morphological box (`session2.ts:233`, 3 × 3 choices) contains two feasible paths that are never scored:
  - 4 aircraft + new vertiport: capacity 320, cost 18.0, total **0.624**;
  - 6 aircraft + upgraded spoke: capacity 360, cost 18.8, total 0.563.
- So the worked trade compares one feasible alternative with three infeasible ones. Those three are strawmen by the course's own checkpoint (`labBrief.ts:301`, "genuinely different, not strawmen") and by its claim that the box "prevents strawman alternatives" (`session2.ts:244`).

*Failure scenario:*
- A sharp student or faculty reviewer asks: "If the walk-away means walk away, how can the baseline ever win at a capital weight of 0.48?" The instructor has no answer that is consistent with the slides.
- Students then copy the pattern. They score infeasible alternatives, clamp them to 0, and report reversal points to options nobody could choose. The tool will not catch this (see m5).
- The centrepiece of Session 2 teaches "screen first" and then fails to do it.

*Fix (keeps every computed number already verified):*
- Make REQ-STK-004 (at least 300 trips/day) and the walk-away points explicit must-meet screens, alongside the two security screens.
- Show ALT-001–003 failing them. This is a good teaching moment in its own right: "the frame eliminated three alternatives before any weight".
- Add the feasible alternative from the box, "4 aircraft + new vertiport" (16 aircraft, 8 chargers, 7 sites), as ALT-005. ALT-004 still wins, 0.670 against 0.624.
- Redo the sensitivity analysis among feasible alternatives. My recomputation, others rescaled in proportion, ALT-002/004/005/006 feasible set:
  - cost: reversal **down** at 0.150 → ALT-005;
  - noise: reversal **up** at 0.284 → ALT-005;
  - wait: reversal up at 0.848 → ALT-006 (the 6-aircraft + upgraded-spoke path) if that path is added;
  - resilience: no reversal.
- These are meaningful, decision-relevant conditions. The noise-weight condition links directly to the NEED-003 event-cap thread.
- Replace the condition "capital weight below 0.48" with the real reversal conditions.
- Alternatively, if the faculty prefer to keep four alternatives, state plainly on slides 10–11 that reversals to screened-out alternatives mean "no feasible reversal: the recommendation is robust to weights". Then delete the capital-weight condition.
- Either way, add a test asserting that every `SENSITIVITY` target passes all screens.

**M2 (major). REQ-STK-018, which closes the Week 2 deliberate gap, fails Week 2's own one-"shall" hard gate.**

*Evidence:*
- `aerolinkCase.ts:285`: "The AeroLink service **shall** notify each passenger … within TBD-05 min … , and **shall** offer that passenger a way onward."
- Week 2 teaches singularity (R48b p.144; `week02/session2.ts:169`).
- Week 2 enforces "exactly one 'shall'" as a hard gate (`week02/labBrief.ts:110`). Its tool rejects with "2 'shall's: two obligations in one statement. Split it into 2 requirements" (`workbench/week2/record.ts:452`).
- Week 2's own bad-requirement example has exactly this defect: "Two obligations in one statement" (`week02/aerolinkCase.ts:453`).
- `aerolinkCase.test.ts` checks only that the parents resolve. It does not run the Week 2 requirement gates on `W3_REQUIREMENTS`.

*Failure scenario:* The instructor shows the closure of I-001 as the model answer to the Week 2 audit. A student who ran the Week 2 tool on it gets a hard rejection. The course contradicts itself on the exact item Week 2 built its audit lesson around. NEED-011's "one end-to-end outcome" argument (`week01/aerolinkCase.ts:316`) justifies one *need*, not one compound *requirement*.

*Fix:*
- Split it into REQ-STK-018 (notify within TBD-05 min of the disruption decision; demonstration) and REQ-STK-019 (offer a way onward to the destination; demonstration, resting on A-008). Both trace to NEED-011 and CAP-015, and both are owned through U-007.
- Update I-001 and the Session 1 register text.
- Add a test that runs the Week 2 requirement gates (`workbench/week2/record.ts`) on every `W3_REQUIREMENTS` entry.

### Moderate

**m1 (moderate). The TECH-001 TRL 6 basis describes the operational environment, which reads as TRL 7.**

*Evidence:*
- The basis is "demonstrated a prototype at an operating vertiport (a relevant environment)" (`aerolinkCase.ts:70`, `:113`; `session1.ts:353`).
- An operating vertiport *is* the operational environment for a vertiport charger. A prototype demonstrated there is "Prototype demonstration in an operational environment", which is TRL 7 in SEBoK Table 1 (R16 p.767; `labBrief.ts:78`).
- The quiz's own explanation (`quizWeek3.ts`, w3q-1 option b) says that TRL 7 means a prototype in the operational environment.
- The TPM-001 basis says the prototype was "at another site" (`aerolinkCase.ts:347`). That is a defensible "relevant, not operational" argument (another operator's grid and duty cycle), but the text never makes it.

*Failure scenario:* This is exactly the "relevant environment" dispute the lecture warns about (R60 p.525). A student challenges the instructor's own worked example with the slide's own table.

*Fix:* Reword the basis to "a prototype demonstrated on a test pad that reproduces hub charging conditions" or "at another operator's vertiport, whose grid connection and duty cycle differ from AeroLink's hubs (so relevant, not operational)". Say why in the worked solution.

**m2 (moderate). Week 2 items that were promised to Week 3 are left undispositioned, and their close-by dates are now stale.**

*Evidence:*
- Week 2 states that REQ-STK-011's event cap "must be a number before the Week 3 trade can be run" (`week02/aerolinkCase.ts:358`).
- The Week 2 close-by fields say:
  - U-002 "before the Week 3 trade study";
  - U-003 "before the Week 3 trade study closes";
  - U-004 "a workload analysis … in the Week 3 trade study";
  - U-006 "relate fare to demand in the Week 3 trade study" (`week02/aerolinkCase.ts:317-321`).
- Week 3 imports them unchanged (`aerolinkCase.ts:121`) and shows those close-by texts on the student Examples page (`week3/Examples.tsx:95`).
- It closes none of them, re-dates none of them, and does not explain why the trade can run with TBD-03 open (`aerolinkCase.ts:473` simply calls the cap "a constraint checked on the schedule").

*Failure scenario:* The register the week holds up as a "living instrument" (Session 1, slide 17, against the "lack of continuity" pitfall) shows four items past their stated close-by points. A careful student notices and the exemplar teaches the pitfall.

*Fix:*
- Give each a Week 3 disposition. For example:
  - U-002 stays open and becomes a decision condition and R-005 (already so: say it);
  - U-003 stays open, and the trade proceeds because peak movements are screened against the cap once agreed (re-date to Week 4);
  - U-004 and U-006 are re-dated with a reason.
- Add a `status`/`w3Disposition` field and show it on the Examples page.

**m3 (moderate). Quiz options carry a length-outlier cue that the rank-balance test does not catch.**

*Evidence:*
- In 6 of the 12 items the key is the clear length outlier, longest or shortest by at least 40 % over the next option:
  - w3q-2: 50 chars against 88–110;
  - w3q-3: 103 against 25–30;
  - w3q-6: "15 kg", 5 against 31–60;
  - w3q-7: 119 against 45–51;
  - w3q-10: 18 against 58–76;
  - w3q-11: 51 against 4–17.
- In no item is an outlier option a distractor.
- "Pick the outlier, else guess" therefore scores about 62 %, against 25 % for chance.
- The rank-balance test (`quizWeek3.test.ts`) checks the rank distribution, not the magnitude.
- The keys are balanced a–d 3/3/3/3. The items are answerable from the lecture, every slide citation resolves, and all cases are unseen and non-AeroLink.

*Fix:*
- Even out the lengths in those six items. For example, give w3q-6 and w3q-10 explanatory keys like their distractors, and trim the keys of w3q-3, w3q-7 and w3q-11.
- Add a test that no key is longer than 1.4 × the longest distractor or shorter than 0.7 × the shortest distractor.

**m4 (moderate). R-011's consequence rating does not match the course's own anchors, and a teaching point depends on it.**

*Evidence:*
- The C5 anchor is "Injury, loss of a major asset **or of the service**" (`labBrief.ts:103`).
- R-011 suspends the service network-wide for more than 2 h, yet it is rated C4 because "no safety consequence" (`aerolinkCase.ts:254`). The anchor does not require a safety consequence.
- R-009 is rated C5 partly for "loss of the whole service" (`aerolinkCase.ts:231`).
- At C5, R-011 sits at L1 × C5, which is Moderate, not Low. The Session 1 prompt "which of the three is in the Low cell? The grid outage" (`session1.ts:567`) depends on C4.

*Fix:* Either sharpen the anchors (C5 = "permanent loss of service or of a major asset"; C4 = "service suspended or impaired, recoverable"), or re-rate R-011 and adjust the prompt. Then add a test that each rating's reason names its anchor.

**m5 (moderate). The lab tool does not enforce the screen and walk-away rules the lab teaches.** Most of this was found in the probe.

*Evidence:*
- The probe rejected 30 of the 34 injected defects, each with a clear message. The gaps:
  - **(a)** An alternative whose score lies beyond a walk-away point is scored, clamped to 0 and can be recommended. There is no gate or advisory (`record.ts:612-618`), although lab step 9 tells teams to check for "compensation hiding a walk-away score" (`week03Lab.ts:178`). This is the M1 pattern, unguarded.
  - **(b)** A TPM whose worst case breaches its threshold, with no related risk, reaches "ready". Both checks are advisories only (`record.ts`, assessTpm `c.adv('breach')` and `c.adv('no-risk')`), yet lab step 10 says "a TPM breach is a risk" (`WEEK3_LAB_INSTRUCTIONS.md:61`).
  - **(c)** Recommending the third-ranked alternative gives no prompt for a reason.
  - **(d)** A sensitivity note with a wrong reversal number (0.90 against the computed 0.467) passes, because the note is only word-counted.

*Fix:*
- (a) Hard gate: the recommended alternative is at or better than every walk-away. Advisory: name any scored alternative beyond a walk-away and suggest a screen.
- (b) Hard gate: negative margin requires a linked risk or issue.
- (c) and (d) Advisories: one for a recommendation that is not top-ranked, and one when the note contains no number within ±0.02 of a computed reversal point.

**m6 (moderate). The ordinal-scale critique is the instructor's reasoning with no source.**

*Evidence:* The brief asks for limitations "taught with sources". `session1.ts:495` and `:954` state honestly that no held source argues the ordinal-arithmetic point. The argument is correct, but it is the one limitation taught without a citation, and it carries a faculty-facing claim about industry practice.

*Fix:* Register Cox, L.A. (2008), "What's wrong with risk matrices?", *Risk Analysis* 28(2):497–512, and cite it on slide 13 and in the lesson. Otherwise, have the faculty explicitly accept the declared gap in the decision register. Adding NIST SP 800-160 Vol. 2 for the resilience techniques would also broaden security sourcing beyond SEBoK alone. This is optional.

### Minor

1. **Page range incomplete.** `session1.ts:495` and `:954` cite R61b p.637 for "qualitative matrices vs quantitative cardinal techniques". The qualitative half is on p.636. Cite pp.636–637.
2. **Wording overstates SEBoK.** `session1.ts:604` and `:969` call defense in depth "one of the resilience techniques SEBoK lists". SEBoK lists *coordinated defense*, "such as via the defense-in-depth strategy" (R24 p.1206). Reword accordingly.
3. **Gloss not marked.** "A pair rather than a product" (`session1.ts:495`, `:954`) goes beyond R17 p.483, which says nothing about products. Label it as the instructor's reading.
4. **Misleading register title.** R78 is titled "Standard View Definitions", but cited slides 147 and 152 are the RiskMetadata and TradeStudies library slides, so the reference drawer misleads. Retitle or split the entry. This is a register issue, not Week 3 content.
5. **Pre-work time mismatch.** The notes set pre-work at "about twenty-five minutes per student" (`session1.ts:869`), but the workload row says 0.3 h (`week3Path.ts:155`). Align them (0.4 h, or "about 20 minutes").
6. **Charge count in R-008.** R-008's likelihood reason says "about 300 high-power charges a day" (`aerolinkCase.ts:221`). The baseline delivers at most 288, against demand of 240. Say "about 240 today, more with the recommended fleet".
7. **Loose traces.** CRIT-004 measures peak movements per hour but traces to MOE-003, the noise-compliance share (`aerolinkCase.ts:471`; `week02/aerolinkCase.ts:466`). REQ-STK-004 says "across the six-vertiport network", which ALT-003's seventh vertiport contradicts (`week02/aerolinkCase.ts:350`). Note both in the criterion lens or the alternative text.
8. **Double rounding.** The month-6 reserve is exactly 21.25 %, but it is rounded twice to 21.3 (`aerolinkCase.ts:385`), giving a worst case of 20.3 and a margin of 0.3 where the exact values are 20.25 and 0.25. The conclusion is unchanged. Show 21.25 or round once.
9. **Stale outline figure.** `docs/lectures/week03/WEEK03_LECTURE_OUTLINE.md:449` still says a team of three spends "about 3.1 h each"; the code, the lab instructions and the milestone report say 2.5 h.
10. **Workload has no slack.** The graduate total is exactly 8.0 h, at budget. The lesson reading rate of 150 wpm is optimistic for a math-heavy lesson of 5,854 words. Week 2 makes the same assumption, so I raise it only as a note: the time-log data should be checked after Week 3 runs.
11. **Flaky tests.**
    - Playwright: `lectures-week3.spec.ts:19` (viewer counter and navigation) failed in the parallel run and passed alone in 11 s.
    - Vitest: the full-suite load failures are in `activities/week03` (the legacy pre-A21 module, which passes in isolation), week07, week08 and week11.
    - None are in the Week 3 package. Record the flake, as Week 2 did.
12. **Trade-study security depends on optional screens.** Removing every screen still yields "ready", because the specification makes screens conditional on "where a minimum expectation applies". The register gates still require a security risk and a resilience risk, so A21 item 6 is met. But if the faculty want security in every trade, the advisory 'resilience' should be promoted to a gate.

## Math recomputation table

I recomputed everything independently in Python from the stated rules (scratch script outside the repo). I scanned the reversal points on a 10⁻⁵ grid and also solved them in closed form.

| Quantity | Package value | Independent result | OK |
|---|---|---|---|
| Ordinal demo: 1×5 and 5×1 | 5 / 5; cells Moderate and Low | 5, 5; L1C5 = Moderate, L5C1 = Low (DoD layout) | ✓ |
| R-002 3×4 vs R-008 2×5 | 12 vs 10; both Moderate; course rule ranks R-008 first | same | ✓ |
| R-004 expected loss | 300 × (0.08 − 0.05) = 9; 3.6–5.4 (mid 4.5) at the L3 band 40–60 % | 9.0; 3.6 / 4.5 / 5.4 | ✓ |
| TPM-001 WCE / margin | 18 + 1.0 = 19.0 / 1.0 min (reference 2) | same | ✓ |
| TPM-002 | 63.5 + 1.0 = 64.5 / 0.5 dBA (reference 1.5) | same | ✓ |
| TPM-003 (higher is better) | 23 − 1.5 = 21.5 / 1.5 pts (reference 3) | same | ✓ |
| TPM-003 planned profile, worst case | 21.5, 22.0, 22.2, 22.5, 22.5 | same | ✓ |
| Fade model trip energy T | 0.9 × 0.77 = 0.693 | 0.693 | ✓ |
| 12 % fade reserve / worst case / margin | 21.3 / 20.3 / 0.3 (< 1 trigger) | 21.25 / 20.25 / 0.25 (minor 8) | ✓ (rounding) |
| 15 % fade reserve | 18.5 % | 18.47 % | ✓ |
| Chain likelihood 3 → 4 | L4C4 = High | High | ✓ |
| Capacities ALT-001..004 | 240 / 288 / 240 / 320 | same | ✓ |
| Waits | 66.7 / 12.0 / 66.7 / 8.0 min | same | ✓ |
| Costs | 0 / 18 / 6 / 12.8 USD M | same | ✓ |
| Retained after losing a hub | 80 / 66.7 / 100 / 90 % | same | ✓ |
| Peak movements per hour | 8.0 / 8.0 / 6.86 / 8.0 | same | ✓ |
| Swing weights | 100/75/40/35 → 0.40/0.30/0.16/0.14 | same | ✓ |
| ALT-004 values | 0.945 / 0.360 / 0.800 / 0.400 | 0.9455 / 0.36 / 0.8 / 0.4 | ✓ |
| Totals | 0.452 / 0.488 / 0.458 / **0.670** | 0.4520 / 0.4884 / 0.4580 / 0.6702 | ✓ |
| Reversal, cost up | 0.478 → ALT-001 | 0.47797 → ALT-001 | ✓ (but see M1) |
| Reversal, wait down | 0.226 → ALT-003 | 0.22638 → ALT-003 (ALT-001 crosses later, at 0.220) | ✓ (M1) |
| Reversal, resilience up | 0.592 → ALT-003 | 0.59242 → ALT-003 | ✓ (M1) |
| Reversal, noise up | 0.554 → ALT-003 | 0.55402 → ALT-003 | ✓ (M1) |
| Min–max, all four | ALT-002 0.373 > ALT-001 0.364 (ALT-003 0.500, ALT-004 0.599) | 0.3727 / 0.3640 / 0.5000 / 0.5987 | ✓ |
| Min–max, ALT-003 removed | ALT-001 0.531 > ALT-002 0.513 (swap) | 0.5314 / 0.5127; ALT-004 0.7867 | ✓ |
| Demand threshold in "would change if" | 192 = 0.8 × 240 | ✓ | ✓ |
| Omitted alternative: 4 aircraft + new vertiport | not in package | capacity 320; cost 18.0; total 0.624 | M1 |
| Omitted alternative: 6 aircraft + upgraded spoke | not in package | capacity 360; cost 18.8; total 0.563 | M1 |
| Lab fixture (Riverside) weights / totals / reversals | tool output | 0.40/0.28/0.18/0.14; 0.495/0.548/0.493/0.670; CRIT-002 up 0.4667 → ALT-001 | ✓ |
| Workload (four people) | 2.5 + 0.8 + 0.7 + 0.3 + 2.5 + 0.3 + 0.6 + 0.1 = 7.8 h; lab 10.0 person-hours | same | ✓ |
| Workload (three people) | 7.6 person-hours → 2.5 h each | 7.583 → 2.53 | ✓ |
| Quiz w3q-6 / w3q-11 | 15 kg / 0.72 | same | ✓ |

TRL wording (`labBrief.ts:72-80`) matches SEBoK Table 1 (Mankins 1995, R16 p.767) word for word. The full NASA and DoD definitions are not held, and the package says so (`session1.ts:262`).

## Citation spot-check table

All 20 cited IDs are in `readings.generated.json`, marked verified, and every cited page lies inside its entry's range. Text was read from `_source_cache/*.txt` (`=== PAGE n ===` markers):

- SEBoK: `Guide_to_the_Systems_Engineering_Body_of_Knowledge_v2_14.txt`
- DoD: `Systems_Engineering_Guidebook.txt`
- MITRE: `se_guide_book_interactive.txt`

Rows marked † cover several pages. 53 claims were checked: 50 supported, 3 partial, none unsupported.

| # | Claim | Repo | Source | Verdict |
|---|---|---|---|---|
| 1 | The second risk definition is used in safety engineering | session1.ts:151 | R17 p.481 | SUPPORTED |
| 2 | Uncertainty definition | session1.ts:152 | R39s p.1668 | SUPPORTED |
| 3 | Measurement gives indicators; decision management evaluates treatments | session1.ts:153 | R17 p.485 | SUPPORTED |
| 4 | Positive effects are called opportunities | session1.ts:157 | R17 p.482 | SUPPORTED |
| 5 | Risk has 0 < P < 1, C > 0, a future time frame | session1.ts:182 | R39q p.1610 | SUPPORTED |
| 6 | Issue = probability one | session1.ts:182 | R46 p.127 | SUPPORTED |
| 7 | Opportunity = outcome better than expected | session1.ts:183 | R39r p.1582 | SUPPORTED |
| 8 | TBD/TBR tracking | session1.ts:667 | R13 p.565 | SUPPORTED |
| 9 | TRAs support investment decisions | session1.ts:223 | R16 p.766 | SUPPORTED |
| 10 | Nine levels, TRL 9 flight proven | session1.ts:224 | R16 p.766 | SUPPORTED |
| 11 | TRA systematic, metrics-based, independent SMEs | session1.ts:225 | R44 p.112 | SUPPORTED |
| 12 | TRL 1–9 wording | labBrief.ts:72-80 | R16 p.767 | SUPPORTED, word for word |
| 13 | TRLs omit affordability, hence MRLs | session1.ts:257 | R16 p.767 | SUPPORTED |
| 14 | IRLs and SRLs | session1.ts:257 | R16 p.768 | SUPPORTED |
| 15 | COTS TRL changes beyond design limits | session1.ts:258; quiz q2 | R16 p.768 | SUPPORTED |
| 16 | Hype cycle | session1.ts:288 | R60 p.524 | SUPPORTED |
| 17 | Architecture fit not addressed; "relevant environment" must be shared | session1.ts:289 | R60 p.525 | SUPPORTED |
| 18 | TRL below 6 is not "threshold" | session1.ts:361 | R60 p.526 | SUPPORTED |
| 19 | Five risk activities | session1.ts:397 | R17 p.482 | SUPPORTED |
| 20 | DoD activities; treatment = handling = mitigation | session1.ts:398 | R46 pp.124–125 | SUPPORTED |
| 21 | If–then structure | session1.ts:427 | R17 p.483 | SUPPORTED |
| 22 | Event + consequence + cause if known | session1.ts:427 | R46 p.125 | SUPPORTED |
| 23 | No mitigation in the statement (XYZ example) | session1.ts:429 | R61a p.633 | SUPPORTED |
| 24 | Condition–if–then as best practice | session1.ts:428 | R61a pp.630–631 | SUPPORTED |
| 25 | No best analysis approach | session1.ts:457 | R17 p.483 | SUPPORTED |
| 26 | Consequence as deviation against a tailored baseline | session1.ts:458 | R46 p.125 | SUPPORTED |
| 27 | Likelihood bands L1–L5 | labBrief.ts:89-95 | R46 p.126 (Fig. 4-9 image) | SUPPORTED (rendered PDF page) |
| 28 | 5×5 cell layout | labBrief.ts:107-113 | R46 p.126 (image) | SUPPORTED (all 25 cells) |
| 29 | Prioritize by the pair of maxima "rather than a product" | session1.ts:495 | R17 p.483 | PARTIAL (minor 3) |
| 30 | Limits of risk tools; challenge results | session1.ts:495 | R17 p.486 | SUPPORTED |
| 31 | Qualitative matrix vs quantitative cardinal techniques | session1.ts:495 | R61b p.637 | PARTIAL: also p.636 (minor 1) |
| 32 | Hybrid strategies; buy information | session1.ts:530 | R17 p.484 | SUPPORTED |
| 33 | Accept, avoid, transfer, control; off-ramps | session1.ts:530 | R46 p.126 | SUPPORTED |
| 34 | Automatic mitigation pitfall | session1.ts:532; quiz q5 | R17 p.485 | SUPPORTED |
| 35 | Transfer reassigns accountability; double-edged | session1.ts:531 | R61c pp.642, 644 | SUPPORTED |
| 36 | Handling-option matrix | labBrief.ts:16 | R61c p.642 | SUPPORTED |
| 37 | Resilience definition | session1.ts:561 | R24 p.1203 | SUPPORTED |
| 38 | Avoid / withstand / recover | session1.ts:561; quiz q7 | R24 p.1204 | SUPPORTED |
| 39 | Defense in depth as a listed technique | session1.ts:604 | R24 p.1206 | PARTIAL (minor 2) |
| 40 | Alternatives evaluated under adversity; risk management for resilience | session1.ts:561, 841; session2.ts:316 | R24 p.1208 | SUPPORTED |
| 41 | Resilience metrics (performance before and after; recovery time) | session2.ts:316; aerolinkCase.ts:470 | R24 p.1209 | SUPPORTED |
| 42 | Security definition; ASARP and minimum expectations (basis of the screens) | session1.ts:562; session2.ts:317 | R25 p.1229 | SUPPORTED |
| 43 | Asset classes; adversity includes faults and missing requirements | session1.ts:562; aerolinkCase.ts:246 | R25 p.1231 | SUPPORTED |
| 44 | Needs expressed as loss | aerolinkCase.ts:234 | R25 p.1232 | SUPPORTED |
| 45 | Threat / vulnerability / consequence | session1.ts:562 | R39q p.1610 | SUPPORTED |
| 46 | MOE / MOP / TPM | session1.ts:704 | R15 p.532 | SUPPORTED |
| 47 | TPMs are leading indicators | session1.ts:705, 804 | R44 p.113 | SUPPORTED |
| 48 | Good-TPM attributes; a planned value at each review | session1.ts:706, 772 | R44 p.116 | SUPPORTED |
| 49 | Core TPM categories include cybersecurity | session1.ts:990 | R44 p.114 | SUPPORTED |
| 50 | Contingency, CBE → WCE; margin = threshold − WCE | session1.ts:733-734; labBrief.ts:177-181; quiz q6 | R44 p.117 | SUPPORTED |
| 51† | Trade study most common; master model; risk per decision | session2.ts:118-119, 492 | R18 pp.463–464 | SUPPORTED |
| 52† | Measure properties; walk-away and stretch; non-redundant; swing 100 normalized; range dependence; Fig. 4; morphological box; scoring sheets; additive model; value component chart; Monte Carlo; line diagrams; task list; bias; premortem | session2.ts:149-522 | R18 pp.465–474 | SUPPORTED (walk-away text re-read by me at p.465–466) |
| 53† | Decision-maker accountability; recommendations are the principal output; derived requirements; RiskMetadata, TradeStudies, analysis case | session2.ts:120, 455, 551 | R43 p.110; R48 p.146; R78 pp.147/152; R75 p.95 | SUPPORTED (R78 title, minor 4) |

## AeroLink consistency (item 4)

**Consistent with Week 1 and Week 2:**
- Week 1 needs and Week 2 requirements, capabilities, scenarios, objectives, MOEs, MOPs and unknowns are imported read-only, not retyped (`aerolinkCase.ts:31-34`).
- `KNOWN_IDS` makes every trace resolvable, and the tests check this.
- The chain TECH-002 → R-002 → TPM-003 → REQ-SYS-003 → NEED-002 resolves to the corrected NEED-002, "Assurance of flight within safety limits".
- The event-cap correction flows from NEED-003 to MGO-006, MOE-003 and TPM-002, with the decision recorded.
- The DELIBERATE_REQ_GAP is consistent with the b16b4ea fix (CAP-015, SCN-005, owned TBD). Week 3 follows Week 2's disposition ("write it in Week 3 with an owned TBD", `week02/aerolinkCase.ts:422`), and I-001 is correctly framed as an issue (P = 1), not a risk.

**Inconsistent:**
- The closing requirement breaks Week 2's singularity gate (M2).
- Four Week 2 close-by commitments are left stale (m2).

## Web, laboratory and gates (items 5 and 7)

**Laboratory tool:**
- The fixture record is accepted. 30 of 34 injected defects are rejected with specific messages, covering weights, anchors, baseline, strawman, missing scores, screens, risk form and ratings, issue-as-risk, mitigation-in-statement, the security and resilience minimums, TRL range, the maturity-risk gate, TPM objective side, duplicate IDs, and broken traces to REQ, MOE, decision and TPM parents. The four gaps are under m5.
- Week 2 import (`week2-model-inputs` v1): the good file is accepted. Version 2, version "1" as a string, wrong or missing format, Week 1 and Week 3 files, AeroLink, truncated JSON, empty input and a bare array are each rejected with their own message.
- Export is `{format: 'week3-model-inputs', version: 1}`, versioned, and round-trips identically. Teammate import rejects a wrong version, wrong format, malformed JSON and bad IDs.
- Workload (7.8 h for four, 2.5 h each for three) is plausible but lean: about 20 minutes per risk, and about 4 person-hours for the whole trade study.

**Leaks:** No A21, DECISION_LOG, TODO or source-cache strings appear in student text. R-codes are the public reading IDs, rendered as citations exactly as in Week 2. Faculty notes, purposes and in-note register cites are stripped from the student build.

**Gates:**

| Gate | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx oxlint src` | PASS (0 errors). Warnings are only-export-components only; Week 3 has 3, as in Weeks 2 and 8. |
| `npx vitest run` | 1511 passed / 8 failed. None of the failures are in the Week 3 package: legacy `activities/week03` (2, passes in isolation), week07 (3), week08 (2), week11 (1), timeouts under load from concurrent agents. Week 3 suites (case, timing, quiz, lab) all pass. |
| `npx vite build` | PASS (chunk-size warning only) |
| Student build + `scripts/check-student-build.mjs` | PASS. 1748 note markers in `dist/`, 0 in student JS. Week 3 student decks have empty notes. Hand-picked Week 3 note phrases are absent from `dist-student/`. |
| Playwright `week3-flow.spec.ts` (shared 5173 server) | 6/6 PASS, including axe light and dark at 1440 and 400 px, Week 2 import good and bad, and versioned export |
| Playwright `lectures-week3.spec.ts` | 3/4 in the parallel run, 4/4 on rerun. The viewer test at line 19 is flaky under load (minor 11). Axe light and dark show no violations. |

Exports `exports/lectures/week03-*` (two .pptx, two notes files, the lesson) are newer than their sources, and spot-checked numbers match.

## Definition of done, A–I

| Item | Status |
|---|---|
| A. Slides sized to 2 × 75 min | Met: 69 + 6 buffer per session; 47 lecture + 22 lab launch in Session 2. Dense but teachable. |
| B. Faculty notes with timing | Met: at most 130 wpm, tested; every slide has a timing split. |
| C. Long-form lesson from the same source | Met |
| D. AeroLink case worked in full | Revise: M1, M2, m1, m2, m4 |
| E/F. Laboratory: feasible and gradable | Revise: m5. Feasibility is otherwise sound. |
| G. Assessment | Revise: m3 |
| H. Register and page-level citations | Met: m6 and minors 1–4 are improvements, not defects. |
| I. Web gates | Met: Week 3 is green; flakes are recorded. |

**Re-review scope after fixes:**
- M1 and M2 with their new tests;
- m1–m6;
- a rerun of the case, quiz and lab suites, the exports, and `week3-flow` / `lectures-week3`.
