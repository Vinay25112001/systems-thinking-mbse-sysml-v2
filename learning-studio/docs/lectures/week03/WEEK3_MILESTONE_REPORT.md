# Week 3 milestone report: Technology Assessment / Risk Management / Trade Study

**Date.** 2026-10-19. **Status.** Built to the Week 1 template (DECISION_LOG A21), following the Week 2 package. Every item is new and pending independent and faculty review. Nothing has been committed.
**Governing documents.** DECISION_LOG A19, A20 and A21 (item 5: TPMs in Week 3; item 6: security and resilience in Weeks 3, 5 and 6); `COURSE_SCHEDULE.md`; `COURSE_PRODUCTION_PLAN.md`; `docs/lectures/week03/WEEK03_LECTURE_OUTLINE.md`.

## 1. Files

| Area | File |
|---|---|
| Lab brief (minimums, scales, matrix, gates, arithmetic, person-hours) | `src/content/lectures/week03/labBrief.ts` |
| Case data (single source) | `src/content/lectures/week03/aerolinkCase.ts`, `aerolinkCase.test.ts` |
| Lectures | `src/content/lectures/week03/session1.ts`, `session2.ts`, `timing.test.ts`; registered in a delimited block of `src/content/lectures/index.ts` |
| Figures (38, original) | `src/components/figures/LectureWeek3S1.tsx` (22), `LectureWeek3S2.tsx` (16), `LectureWeek3Parts.tsx` (helpers); delimited `--- week03 ---` block in `registry.ts` |
| Week page text, workload | `src/content/week3Path.ts` |
| Assessment | `src/content/quizWeek3.ts`, `quizWeek3.test.ts` |
| Lab instructions (single source) | `src/content/lab/week03Lab.ts`, `week03Lab.test.ts`; generated `docs/lectures/week03/WEEK3_LAB_INSTRUCTIONS.md` |
| Lab tool | `src/workbench/week3/record.ts`, `Week3LabTool.tsx`, `week3tool.css`, `fixture.ts`, `record.test.ts`, `Week3LabTool.test.tsx` |
| Web pages | `src/week3/route.ts`, `WeekNav.tsx`, `WeekShell.tsx`, `Week3App.tsx`, `Home.tsx`, `Examples.tsx`, `exampleParts.ts`, `Lab.tsx`, `Assessment.tsx`, `Readiness.tsx` |
| E2E | `e2e/week3-flow.spec.ts`, `e2e/lectures-week3.spec.ts` |
| Exports | `exports/lectures/week03-session1.pptx`, `week03-session2.pptx`, `week03-session1-notes.md`, `week03-session2-notes.md`, `week03-lesson.md` (copies in `public/lectures/`) |
| Register | `_source_cache/verification/readings.py` (R39q–R39s, R61a–c), `readings_verified.txt`, `src/content/readings.generated.json` |

**Shared changes (additive).** `src/App.tsx` (Week 3 routes, `/archive/week/3`, workbench and title exclusions, delimited blocks); `src/pages/Dashboard.tsx` (Week 3 card, “Available (pending review)”); `src/lectures/Chrome.tsx`, `src/lectures/route.ts` (Week 3 navigation, back links); `scripts/build-lab-md.mjs` (writes the Week 3 instructions; Week 1 output unchanged); `playwright.lectures.config.ts` (adds `lectures-week3.spec.ts`); `e2e/app.spec.ts` (Week 3 branch in the every-week test); `src/content/content.test.ts` (register 119 → 125); `src/content/lectures/index.ts`; `src/components/figures/registry.ts`.

**Canonical-data fixes (minimal).** `src/model/reference/week03.ts` (MGO-006) and `week05.ts` (MOE-003, TPM-002): one `eventCap` attribute each; `src/content/lectures/week01/aerolinkCanonical.test.ts`: the three Week 3 `PRE_REVISION` entries removed and the covered-ids test updated (file re-read immediately before the edit; other entries untouched); `docs/lectures/AEROLINK_CANONICAL_DATA.md` rows marked done. No other Week 1, Week 2 or Week 8 file was edited. The full `npm run lab:md` regenerated `docs/lectures/week02/WEEK2_LAB_INSTRUCTIONS.md` from the committed Week 2 fixes (the Week 2 lab test requires the Markdown to match its source).

## 2. Sessions and slides

| Session | Slides | Content | Buffer | Lecture / lab |
|---|---|---|---|---|
| 1 Readiness, risk and the measures that track it | 24 + references | 69 min | 6 min | all lecture |
| 2 The trade study, worked in full, and the Lab L3 launch | 20 + references | 69 min | 6 min | 47 min lecture, 22 min lab launch (brief 3, team framing 8, checkpoint 9, close 2) |

Structure follows the outline (sections A–E and F–I) with these changes:
- **Security and resilience** (A21 item 6): a Session 1 slide places them in the risk process (resilience definition and avoid/withstand/recover, R24 pp.1203–1204, 1208; security as freedom from loss of assets, asset classes, adversity includes faults, R25 pp.1229, 1231); three proposed risks (intrusion into the operations platform, altered charger commands, regional grid outage); the worked risk is the security risk with a safety consequence. In Session 2 resilience is a weighted criterion (capacity retained after losing a hub, a SEBoK resilience metric, R24 p.1209) and security enters as two must-meet screens (R25 p.1229 “minimum stakeholder expectations”; walk-away points, R18 pp.465–466).
- **Limits of the methods** made explicit: a TRL limits slide (producibility, integration, criticality, off-the-shelf beyond design limits, R16 pp.767–768; architecture fit, R60 p.525); a worked slide on ordinal risk scales (equal products in different cells; R-002 3×4=12 outranking R-008 2×5=10; course ranking rule; a cardinal expected-loss calculation where consequence is measurable); a weighted-sum pitfalls slide (min–max normalization rank reversal computed on the case, compensation, double counting, range-free weights).
- **TPMs** (A21 item 5): hierarchy, CBE/contingency/WCE/margin (R44 p.117), the three AeroLink TPMs with proposed contingencies and planned profiles, the event-cap decision, and one chain TECH-002 → R-002 → TPM-003 → REQ-SYS-003 → NEED-002 with a hypothetical month-6 reading that fires the risk trigger.
- Session 2 warm-up split into question and reveal (Week 1 lesson); worked examples numbered I–IV (Session 1) and I–V (Session 2).

## 3. Faculty notes

Every slide carries teach, why, figure walk (where a figure exists), transition, timing and misconceptions; worked slides carry the full worked solution with every number computed in `aerolinkCase.ts` (template strings, not typed). Spoken notes stay at or below 130 words per minute on every slide and at or above 40 on lecture slides (tested). Notes give the source page for every claim, label course conventions and instructor reasoning as such (the consequence anchors, the ranking rule, the ordinal-arithmetic argument, the contingency values), and flag instructor decisions (slides 12, 15 and 21 of Session 1).

## 4. Engineering examples (AeroLink, FICTIONAL)

- **Readiness:** TECH-001..003 (TRL 6/5/4, each on a labeled assumption with owner and validation), criticality judged from the requirements each affects, what each TRL hides; lowest critical TRL TECH-002 at 5 with maturity risk R-002 (tested).
- **Register:** 8 assumptions (A-001..A-008), 11 risks (R-001..R-008 reference, **R-009..R-011 proposed security/resilience**), 2 opportunities, 6 unknowns imported from Week 2 (TBD-01..04, TBR-01..02), plus U-007 (TBD-05); issue log I-001 (the Week 2 deliberate gap seen as an issue, closed this week by proposed REQ-STK-018 → NEED-011 via CAP-015 with an owned TBD, as the Week 2 disposition asks). Every risk condition–if–then, rated with reasons, owned, triggered, linked to existing requirements/capabilities/scenarios (tested); ranking by cell level then consequence; security risks name the asset classes, resilience entries the avoid/withstand/recover objectives.
- **Risk arithmetic:** ordinal-product demonstration and an R-004 expected-loss calculation (300 × 3 % = 9 trips/day; 3.6–5.4 expected at likelihood band 40–60 %), recomputed in tests.
- **TPMs:** TPM-001..003 with proposed contingencies: WCE 19.0 / 64.5 / 21.5, margins 1.0 min / 0.5 dBA / 1.5 points against the reference’s zero-contingency margins 2 / 1.5 / 3 (the correction is taught); planned profiles at five reviews; fade model (trip energy 0.693; 12 % fade → 21.3 %, margin 0.3 < 1-point trigger; 15 % fade → 18.5 %, below threshold).
- **Event cap (Week 3 canonical fixes):** MGO-006 and MOE-003 carry the evening and early-morning event cap; TPM-002 records the decision that the cap gets no aircraft TPM (REQ-SYS-011 enforces it, MOP-010 tracks it). Written as `eventCap` attributes in `src/model/reference/week03.ts` and `week05.ts` (attribute only, so the SysML drift check is unaffected), equal to `EVENT_CAP` in the case (tested); the three entries were removed from the `PRE_REVISION` allowlist of `week01/aerolinkCanonical.test.ts` (minimal edit, file re-read immediately before) and the covered-ids test now asserts they are absent.
- **Trade study:** decision traced to MGO-007/REQ-STK-004; capacity rule and four alternatives (240/288/240/320; only ALT-004 meets 300); four criteria traced to MOE-001/005/006/003, linear value functions with walk-away and stretch, swing points 100/75/40/35 → 0.40/0.30/0.16/0.14; two security screens; totals 0.670 / 0.488 / 0.458 / 0.452; one-at-a-time reversal points for every criterion (cost ↑ 0.478 → baseline; wait ↓ 0.226 → new vertiport; resilience ↑ 0.592 → new vertiport; noise ↑ 0.554), solved in closed form; min–max normalization demonstration (ALT-001 and ALT-002 swap when ALT-003 is removed); decision record with conditions (incl. the security screen), residual risk and would-change-if. All numbers recomputed from first principles in `aerolinkCase.test.ts` and checked against the instructor reference (scores, weights, totals, reversal points).

## 5. Laboratory

- Instructions: purpose, inputs (the team’s Week 2 record and export), objectives, method with “taught in” slide references (validated against the registered lectures), ten-step procedure, Parts 11–14, evidence and minimums for teams of four and three, rubric rows read from the register (RB-5.1–5.5, RB-4.1–4.3, RB-6.1–6.6, RB-12.1–12.3), submission, workload. Page and Markdown come from one module; a test fails if they differ.
- Tool (`#/week/3/lab/tool`): imports the team’s `week2-model-inputs` v1 export with Week 2’s own importer (refuses Week 1 files, Week 3 files, AeroLink records, empty or broken files, each with a message); carries the Week 2 TBD/TBR register in as unknowns; builds the readiness assessment (SEBoK TRL wording shown), the register (condition/if/then parts, ratings with reasons, cell level, category incl. security and resilience, handling/owner/treatment/trigger, links; opportunities; issue log), TPMs (computed worst case and margin, planned profile) and the trade study (criteria traced to imported MOEs, walk-away/stretch, swing points → weights, scores, values, totals, ranking, must-meet screens, reversal points for every criterion, recommendation with conditions, residual risk and would-change-if); AI usage statement; Markdown and versioned JSON export (`week3-model-inputs` v1, computed values and gate results per entry); teammate import with validation; three-person toggle.
- **Hard gates only for real defects** (labBrief TECH/RISK/TPM/TRADE gates); advisories never block (negative margin, no cost criterion, dominant weight, double counting, no security/resilience lens, fragile ranking). Tests show every gate failing alone on an otherwise good entry, and good entries with advisories still counted, including known false positives (a past fact in a risk’s condition; a “then” with no number that names the harmed asset). The tool reproduces the AeroLink TPM margins, trade totals and the 0.478 reversal point (tested). Fixture: the fictional Riverside Food Bank team continued from the Week 2 fixture, so Week 2 → Week 3 import is tested end to end.
- 95 unit tests in the lab modules (82 tool, 13 instructions).

## 6. Assessment

Quiz Q3: 12 items on unseen non-AeroLink cases (water treatment, hospital, e-bus depot and others): readiness, entry kinds, risk statements, handling, ordinal-matrix misuse, a security/resilience item, a TPM margin computation, swing weights, a weighted-sum computation, normalization rank reversal, sensitivity, a recommendation. Keys a–d three each; key length rank 1–4 three times each, no run of three, no ties (tested, with negative tests); every item names its slide and lesson section, the deciding phrase is in that section, quoted slide numbers match, and keys/prompts share no 8-word run with the lesson/slides. Applied exercise (e-bus depot) and the graduate Monte Carlo memo are specified on the Assessment page.

## 7. Sources verified (claim table)

Every page was opened in `_source_cache/*.txt` (two image-only items were read on the PDF page, marked †) and supports the claim.

| Claim (as taught) | Source |
|---|---|
| Two risk concepts (effect of uncertainty on objectives; probability and severity of harm); risk as a measure of potential inability to achieve objectives | R17 p.481 |
| Risk process activities; positive effects called opportunities; threat–vulnerability–consequence for catastrophic risk | R17 p.482 |
| Structured if–then and condition–consequence statements; analysis converts likelihood and consequence to a level; no best approach; prioritization by level and the pair of max values | R17 p.483 |
| Four treatment options, evaluate all four, hybrid/contingent, buy information; monitoring via TPMs; opportunity duality | R17 p.484 |
| Measurement provides indicators for risk analysis; decision management evaluates alternatives that treat risks; pitfalls (lack of continuity, automatic mitigation, sea of green) | R17 p.485 |
| Band-aid pitfall; good practices (limits of analysis, robust treatment, structured monitoring, update register) | R17 p.486 |
| Uncertainty definition (ISO/IEC 24765) | R39s p.1668 (new) |
| Risk bounds 0 < P < 1, consequence > 0, future; threat/vulnerability/consequence definition | R39q p.1610 (new) |
| Opportunity: outcome better than expected; issue P = 1 | R39r p.1582 (new) |
| Issues: occurred or certain; issue management treats consequence | R46 p.127 |
| TBD/TBR tracking | R13 p.565 |
| TRA purpose (investment decisions); TRL metric; nine NASA levels | R16 p.766 |
| TRL table (Mankins 1995); TRLs do not assess programmatic influence, criticality, aging, producibility; MRL | R16 p.767 |
| IRL and SRL; COTS TRL changes beyond design limits | R16 p.768 |
| TRA systematic, metrics-based, critical technologies, independent SMEs | R44 p.112 |
| TPMs collected over time, estimated early, leading indicators | R44 p.113 |
| Core TPM categories include cybersecurity and program protection | R44 p.114 |
| Four attributes of a good TPM; planned value at each review | R44 p.116 |
| Contingency, CBE, WCE, margin = threshold − WCE, margin as trade space | R44 p.117 |
| MOE, MOP, TPM in technical measurement | R15 p.532 |
| Hype cycle; assess maturity before committing funds | R60 pp.524–525 |
| s-curve; TRL measures the upward slope; shared meaning of “relevant environment”; architecture fit not addressed | R60 p.525 |
| DoD: threshold capability with TRL < 6 not considered threshold | R60 p.526 |
| Risk process activities, questions and products (Table 4-3); if–then statements; register | R46 pp.124–125 |
| Risk statement elements; consequence as deviation from baseline, tailored; register and reporting matrix | R46 p.125 |
| † Likelihood levels and bands; Low/Moderate/High cell layout (Figure 4-9, image read on the PDF page) | R46 p.126 |
| Accept/avoid/transfer/control; mitigation examples (prototyping, deferral, off-ramps) | R46 p.126 |
| Burn-down and TPMs for monitoring mitigation | R46 p.127 |
| Condition–if–then construct | R61a pp.630–631 (new split entry) |
| Do not include the mitigation in the risk statement | R61a p.633 |
| Subjective probability; tailor criteria; document rationale; qualitative matrix vs quantitative cardinal techniques | R61b pp.635, 637 (new split entry) |
| Handling options incl. watch; transfer definition | R61c p.642 (new split entry) |
| Transfer a double-edged sword | R61c p.644 |
| Resilience definition (RSWG) | R24 p.1203 |
| Adversity; avoid, withstand, recover | R24 p.1204 |
| Defense in depth as a resilience technique | R24 p.1206 |
| Alternatives must be evaluated under adversity; risk management planned for resilience risks | R24 p.1208 |
| Resilience metrics (duration of recovery; performance before and after disruption) | R24 p.1209 |
| Security definition; ASARP while meeting minimum stakeholder expectations | R25 p.1229 |
| Adversity includes faults; asset classes (Table 1) | R25 p.1231 |
| Loss language; trustworthiness | R25 p.1232 |
| Decision management purpose (15288); trade study most common | R18 p.463 |
| Best practices: decision-analysis mathematics, master model, value-focused thinking, uncertainty and risk per decision | R18 p.464 |
| Decision problem statement; objective and measure properties; value function, walk-away | R18 p.465 |
| Stretch goal; document value-function shape; swing weights depend on importance and range; normalized | R18 p.466 |
| Swing-weight matrix figure; morphological box | R18 p.467 |
| Scoring sheets with rationale; ideal alternative | R18 p.468 |
| † Additive value model v(x) = Σ wᵢvᵢ(xᵢ), Σ wᵢ = 1 (equation image read on the PDF page) | R18 p.469 |
| Value component chart | R18 p.470 |
| Monte Carlo on lower/nominal/upper scores | R18 p.471 |
| Sensitivity: line diagrams for swing-weight judgment; value-focused thinking; communicate trade-offs | R18 p.472 |
| Actionable task list; cognitive bias, confirmation bias, self-mitigation not feasible | R18 p.473 |
| Independent review; premortem | R18 p.474 |
| Decision-analysis steps; decision maker’s responsibility; recommendations and action plans principal output | R43 p.110 |
| Derived requirements come from solution decisions | R48 p.146 |
| Phase II destinations (named only): risk metadata; trade-off study analysis case; TradeStudies library | R78 p.147; R75 p.95; R78 p.152 |

**Course conventions (labeled as such, no source claimed):** assumption and unknown definitions; one register with issues apart; the evidence-or-assumption rule; the consequence anchors; the ranking rule (level, then consequence, then likelihood); the TRL 6 line for maturity risks (motivated by R60 p.526); the higher-is-better sign convention for margin; contingency values and planned profiles; the capacity rule and other trade-study rules (from the Week 1 model); the security screens as must-meet; the lab minimums and person-hours; hard gates versus advisories. **Instructor reasoning (labeled):** why products of ordinal ratings mislead; the min–max normalization demonstration.

**Held-source gaps (stated in the notes):** full NASA/DoD TRL definitions and the DoD TRA Guidance; the DoD Risk, Issue, and Opportunity Management Guide; any source in the collection arguing the ordinal-arithmetic point directly (e.g. the risk-matrix critique literature); Parnell et al. and Keeney (cited by SEBoK for decision analysis); NIST SP 800-160 (cited by SEBoK for resilience).

**Register additions** (via `readings.py` → `verify_readings.py` → `npm run content:readings`; all six title-verified as entry headings), **pending faculty confirmation:** R39q Risk (glossary) p.1610; R39r Opportunity (glossary) p.1582; R39s Uncertainty (glossary) p.1668; R61a Risk Identification pp.626–633; R61b Risk Impact Assessment and Prioritization pp.634–640; R61c Risk Mitigation Planning, Implementation, and Progress Monitoring pp.641–647 (R61 kept as the umbrella entry). Register: 125 entries, 124 title-verified (R30 the declared exception, unchanged).

## 8. Workload (A21 item 4)

Team of four: **7.8 h per student** against the 8.0 h budget (class 2.5; readings 12 pp 0.8; lesson 5,854 words 0.7; pre-work 0.3; lab 10.0 person-hours ÷ 4 = 2.5; quiz 0.3; applied exercise 0.6; log 0.1); graduate 8.0 h (memo 0.8 replaces the exercise). Team of three at reduced minimums (2 technologies, 4 risks, 1 TPM, 3 criteria): 7.6 person-hours, 2.5 h each (tested within 0.1 h).

## 9. Tests and gates (final run)

`npx tsc -b`: clean. `npx oxlint src`: 0 errors (warnings only, `only-export-components`, as in Weeks 2 and 8). `npx vitest run`: 1,519 tests, 1,516 passed; the 3 failures are Week 7 and Week 11 activity tests that fail under full-suite load and pass in isolation (20/20), the flake recorded in the Week 2 report. Week 3 suites: case 26, timing 16, quiz 11, lab 95, plus the shared lecture validator and the canonical-data test. `npm run lectures:pptx`, `npm run lab:md`, `npm run build`, `npm run build:student` (PASS; Week 3 student decks have empty notes; one notes sentence repeated in the lesson was reworded so the leak check passes). Playwright (lock taken and released, one config at a time): lectures config 21/21 including `lectures-week3.spec.ts` 4/4 (axe light and dark on every slide with notes, handout, reader; 400 px) — two viewer tests (Weeks 2 and 3) timed out on a cold server in the parallel run and passed on a serial re-run; default config: `week3-flow.spec.ts` all pass (every Week 3 page, axe light/dark at 1440 and 400 px, good and bad Week 2 import, versioned export); `app.spec.ts` 15/16 — the failure is the every-week test at **Week 8** (it expects the rebuild notice; Week 8’s new page has no branch), not Week 3.

## 10. Outstanding deficiencies

1. Independent review not yet run; every item is `new-pending-review`.
2. Faculty decisions: consequence anchors; ranking rule; the three proposed security/resilience risks and ratings; TPM contingencies and planned profiles; security screens (must-meet) and the resilience reading of CRIT-003; the event-cap decision; REQ-STK-018/U-007/TBD-05 closing the Week 2 NEED-011 gap (proposed); register entries R39q–R39s, R61a–c; W3.5/W3.6 and W3.3 at Analyze; the Session 2 split; three-person minimums.
3. The reference baseline still has old week numbers in some texts (“Week 7 trade study”, “Week 14 evolution”); the case uses current numbers, but the reference text was not edited (the SysML drift check binds it to SysML files owned by Week 8).
4. The canonical-data check matches the event-cap dimension by keyword and cannot tell a recorded decision from a restatement; `aerolinkCase.test.ts` requires the attribute to equal the case text exactly.
5. `course.ts` Week 3 objectives and readings are unchanged; the week page uses `week3Path.ts`.
6. `e2e/app.spec.ts` every-week test fails at Week 8 (another agent’s week). The default-config run rewrote `screenshots/*.png` (not `screenshots/workbench/*`).
7. `week3-flow` checks the workload total’s range, not its exact value: `week3Path.ts` cannot be imported into Node outside Vite (the unit test checks the exact value).
8. Rubric register text (RB-5.1 “specific to AeroLink”, British spellings in RB-5.2/6.4) is quoted as registered; the lab page tells students to apply RB-5.1 to their own enterprise.

## 11. Dec 1 risk

Week 3 took about one working day with parallel production (lab tool, web pages and quiz, and figures delegated; lectures, case, register and integration central). At that rate Weeks 4–6 and 9–13 remain feasible before 1 December: **moderate risk**. Binding constraints: faculty turnaround on proposed values (Week 3 adds about a dozen), the independent review per week, concurrent edits to shared files and upstream data during a build (handled by re-reading and recomputing rather than copying), and full-suite flakiness under load. Recommend batching faculty confirmations for Weeks 2 and 3 together.
