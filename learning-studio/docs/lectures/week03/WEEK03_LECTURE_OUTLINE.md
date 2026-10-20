# Week 3 Lecture Outline: Technology Assessment / Risk Management / Trade Study

**Status.** Draft outline for faculty review (COURSE_PRODUCTION_PLAN M2). Written 2026-10-19. Not yet independently reviewed. Nothing here changes `src/`.
**Governing documents.** DECISION_LOG A19 and A20; `COURSE_SCHEDULE.md` (Week 3 subject, exact; reuse map: old Week 6 TRL, uncertainty, risk, AROU; old Week 7 trade studies); `COURSE_PRODUCTION_PLAN.md`; the Week 1 template and `../week01/REVIEW_DISPOSITIONS.md`; the Week 2 outline (`../week02/WEEK02_LECTURE_OUTLINE.md`), which this week builds on.
**Format.** Two sessions of 75 minutes, each 69 minutes of planned content plus a recorded 6-minute buffer, plus a generated "References and credits" slide (0 min).
- Session 1 (all lecture): 23 slides, 69 min. Technology readiness, risk and the uncertainty register, technical performance measures.
- Session 2: 14 lecture slides (47 min) on the trade study, and 4 laboratory-launch slides (22 min).
- Total: 41 content slides plus 2 references slides.

## 0. Conventions used in this outline

- **Citations.** `R18 p.466` = verified register entry, PDF page. `P3-1 p.1610` = proposed register addition (§9), page text checked for this outline. Every cited page was opened in `_source_cache/*.txt`; a citation supports only the claim beside it. Where the claim rests on a figure whose content is not in the extracted text, the outline says so and asks for a PDF check.
- **Register range warnings used here.** R61 (MITRE pp.626–647) spans three articles (Risk Identification 626–633; Risk Impact Assessment and Prioritization 634–640; Risk Mitigation Planning, Implementation, and Progress Monitoring 641–647); this outline cites R61 pages with the article named. R60 (MITRE pp.523–531) spans Assessing Technical Maturity (523–527) and Technology Planning (528–531); this week cites only 523–526. Both are register corrections (§9).
- **Course convention** labels content the collection does not supply (the AROU register as one instrument, the 5×5 scale anchors, the capacity formula, the swing points).
- **AeroLink** is FICTIONAL. Data from `src/model/reference/week02.ts` (A-001, A-002, A-007, R-001, O-001, U-001), `week03.ts` (A-008), `week04.ts` (requirements, U-002), `week05.ts` (MOE, MOP, TPM-001..003), `week06.ts` (TECH-001..003, A-003..A-005, R-002..R-008, O-002), `week07.ts` (A-006, CRIT-001..004, ALT-001..004, DEC-001) and the Week 1 case module (needs, CONFLICT). Nothing is retyped from memory; new values are **(proposed, instructor to confirm)**.
- **Week 1 lessons applied:** 69 + 6 min; notes ≤ 130 wpm; definitions verified; conventions labeled; needs in SEBoK form; slide faces carry short citations and no internal IDs (no RB-, FD-, S01–S04, DECISION_LOG, P-numbers, objective IDs).

## 1. Learning objectives (graduate level)

IDs W3.1–W3.4 kept from `course.ts`; W3.5 and W3.6 proposed.

| ID | Objective | Bloom | Taught in |
|---|---|---|---|
| W3.1 | Assess the readiness of the enterprise's enabling technologies on the TRL scale, with cited evidence or an explicitly labeled assumption, and identify the lowest critical TRL and its maturity risk | Evaluate | S1.5–S1.9 |
| W3.2 | Write risks in condition–if–then form, rate them on defined likelihood and consequence scales, select and justify a handling option with owner and trigger, and maintain the risk register | Evaluate | S1.10–S1.16 |
| W3.3 | Structure a trade study: decision statement, at least three genuinely different alternatives including the baseline, and criteria traced to measures of effectiveness | Analyze (was Apply) | S2.2–S2.4, S2.7–S2.8 |
| W3.4 | Elicit swing weights, compute additive value, test sensitivity to the weights, and recommend a decision with conditions, residual risk and what would change it | Evaluate | S2.5–S2.6, S2.9–S2.11 |
| **W3.5 (new)** | Distinguish assumptions, risks, opportunities, unknowns and issues, and link each register entry to the requirements, capabilities and scenarios it affects | Analyze | S1.4, S1.17 |
| **W3.6 (new)** | Define a technical performance measure for a risky requirement with threshold, objective, current estimate, contingency and margin, and interpret its trend | Apply | S1.18–S1.21 |
| Graduate | Propagate score uncertainty through the team's trade study by Monte Carlo and state whether the recommendation is robust (R18 p.471) | Evaluate | Graduate task (§6.3) |

## 2. Session 1: Technology readiness, risk and uncertainty (69 min + 6 buffer)

**Design rationale.** The Week 2 package left TBDs, assumptions and ambitious numbers. Session 1 teaches the three instruments that make that uncertainty explicit and manageable: readiness assessment for the technologies the requirements depend on, the risk register, and technical performance measures that track risky requirements over time. Session 2 then uses all three in a trade study.

### Section A: Framing (8 min)

#### S1.1 Week 3 at a glance (1 min)
- **Purpose.** Orient.
- **Content.** Subject exactly as scheduled: *Technology Assessment / Risk Management / Trade Study*. Session 1: readiness, risk, TPM. Session 2: the trade study and the lab launch. Outputs: technology readiness assessment; risk register (within the uncertainty register); TPMs; trade study with a justified decision.
- **Figure.** The package band with three new boxes: "Readiness assessment" → "Risk and uncertainty register" → "Trade study and decision".
- **Sources.** COURSE_SCHEDULE.md. Course convention.

#### S1.2 Driving question: should AeroLink buy six more aircraft? (3 min)
- **Purpose.** A concrete decision that needs all three instruments.
- **Content.** Waits are forecast to grow as demand reaches the Year-2 planning level of 240 trips/day (A-006). The board proposes six more aircraft (18 in total). Vote: (A) yes, more aircraft means shorter waits; (B) only with more charging; (C) build a seventh vertiport instead; (D) cannot tell yet. Answer in Session 2 (S2.12).
- **Figure.** Six aircraft silhouettes lined up at two busy chargers, a question mark over the queue.
- **Sources.** ALT-002 and A-006 from `reference/week07.ts` (FICTIONAL).

#### S1.3 Three technical management processes, one subject: uncertainty (2 min)
- **Purpose.** Locate the week and define risk from the source.
- **Content.** SEBoK records two internationally accepted risk concepts: the effect of uncertainty on objectives (which may be negative or positive), and the combination of the probability of harm and its severity; the first is tied to objectives, the second to harm (R17 p.481). Risk management, decision management and technical assessment are management processes that feed one another: decision management evaluates alternatives for selecting and treating risks; measurement provides indicators for risk analysis (R17 p.485). SEBoK glossary, uncertainty: the result of not having accurate or sufficient knowledge of a situation (**P3-3 p.1668**).
- **Figure.** Three overlapping circles (technical assessment, risk management, decision management) with "uncertainty" in the center and one AeroLink artifact in each lobe (TECH-001, R-001, DEC-001).
- **Sources.** R17 pp.481, 485; **P3-3 p.1668**.

#### S1.4 Five kinds of entry: assumption, risk, opportunity, unknown, issue (2 min)
- **Purpose.** Separate concepts students conflate (W3.5).
- **Content.**
  - **Risk**: a measure of the potential inability to achieve objectives within cost, schedule and technical constraints, with likelihood and consequence; probability greater than zero and less than one, consequence greater than zero, time frame in the future (**P3-1 p.1610**, after DAU and Conrow).
  - **Issue**: an unwanted event that has occurred or is certain to occur (probability one); issue management mitigates consequences, not likelihood (R46 p.127).
  - **Opportunity**: SEBoK glossary, an outcome better than expected (**P3-2 p.1582**); in risk management, the duality of risk (R17 p.484).
  - **Assumption** and **unknown**: an assumption is a statement taken as true for planning that must be validated; an unknown is information not yet available (course definitions; SEBoK's TBD/TBR placeholders are the requirement-level form of an unknown, R13 p.565).
  - **Course convention.** One AROU register (assumptions, risks, opportunities, unknowns), with issues kept separately.
- **Figure.** A probability axis from 0 to 1: unknowns and assumptions at the knowledge end, risks and opportunities strictly between 0 and 1 (negative and positive consequence), issues at exactly 1.
- **Sources.** **P3-1 p.1610; P3-2 p.1582**; R46 p.127; R17 p.484; R13 p.565. Course convention (assumption and unknown definitions; register form).

**Transition A → B.** "Much of AeroLink's uncertainty sits in three technologies. How mature are they?"

### Section B: Technology readiness (16 min)

#### S1.5 What a readiness assessment is for (3 min)
- **Purpose.** Purpose before scale.
- **Content.** SEBoK: technology readiness assessments are tools to qualify technology development and help make investment decisions so that technology reaches the end user in a timely way; TRLs summarize the degree of maturity, on NASA's nine-level scale from basic principles (TRL 1) to "flight proven" through mission operations (TRL 9) (R16 p.766). DoD: a TRA is a systematic, metrics-based assessment of the maturity of, and the risk associated with, critical technologies, conducted with an independent team of experts (R44 p.112).
- **Figure.** A staircase of nine steps grouped into "laboratory" (1–4), "relevant environment" (5–6), "operational" (7–9), with the environment words highlighted.
- **Sources.** R16 p.766; R44 p.112.

#### S1.6 The scale and what it does not tell you (3 min)
- **Purpose.** Read the scale exactly; know its limits.
- **Content.** Key definitions from SEBoK Table 1 (Mankins 1995): TRL 4 component validation in laboratory environment; TRL 5 component validation in relevant environment; TRL 6 prototype demonstration in a relevant environment; TRL 7 prototype demonstration in an operational environment (R16 p.767). Limits: TRLs do not assess programmatic influence, criticality and priority, or producibility; manufacturing readiness levels extend the idea (R16 p.767). Integration readiness levels address interface maturity, and system readiness levels combine TRLs with integration points (R16 p.768).
- **Figure.** The TRL staircase with two side rails: "can it be produced affordably? (MRL)" and "does it integrate? (IRL → SRL)".
- **Sources.** R16 pp.767–768. The full NASA or DoD TRL definitions are not in the collection beyond SEBoK's table (source gap).

#### S1.7 Maturity in practice: hype, the s-curve and shared meanings (3 min)
- **Purpose.** Graduate-level judgment about readiness claims.
- **Content.** MITRE: hype cycles can draw investment to unsuitable technologies; assess maturity objectively before committing significant funds (R60 pp.524–525). Technology maturity follows an s-curve (new, improving, mature, aging); TRL is the most accepted way to assess the upward slope; stakeholders must share a detailed understanding of terms such as "relevant environment"; TRL does not address how well the technology fits the architecture that absorbs it (R60 p.525). DoD programs treat threshold capabilities met with immature technology (TRL below six) as not "threshold" (R60 p.526).
- **Figure.** An s-curve with four labeled regions and a dashed hype curve above its early part; an annotation "TRL measures this slope".
- **Sources.** R60 pp.524–526.

#### S1.8 Evidence or labeled assumption (2 min)
- **Purpose.** The course rule that keeps readiness claims honest.
- **Content.** A TRL claim cites evidence (a test report, a demonstration) or is recorded as an assumption with an owner and a validation action. Students will rarely have supplier data, so most of their TRLs will be assumptions: that is acceptable if labeled. The definition words ("relevant environment") must be interpreted for the system at hand (R60 p.525). **Course convention** (the rubric's maturity criterion).
- **Figure.** Two TRL cards for the same technology: one with a "report" icon and citation, one with an "A-nnn" tag, owner and validation action; a red card with neither is struck through.
- **Sources.** R60 p.525. Course convention.

#### S1.9 Worked example I: AeroLink's three enabling technologies (5 min)
- **Purpose.** The full method once; students propose each TRL before the reveal.
- **Content.** TECH-001 high-power charging (TRL 6, A-003: prototype demonstrated at an operating vertiport, to be confirmed by the supplier test report); TECH-002 battery cells (TRL 5, A-004: pack-level cycling assumed); TECH-003 detect-and-avoid and autonomy enablers (TRL 4, A-005: laboratory only). Benefits and limitations for each. **Lowest critical TRL:** TECH-002 at 5 is critical (the 25 km trip with a 20 % reserve depends on it); TECH-003 at 4 is not critical for the baseline, because the baseline is piloted (R-006 accepted). Every TRL rests on an assumption because the course holds no supplier evidence; say so.
- **Figure.** A three-row assessment table (technology, TRL, basis, benefit, limitation, critical?) with the lowest critical TRL boxed.
- **Sources.** R16 p.767; R60 pp.525–526. Data from `reference/week06.ts` (FICTIONAL).

**Transition B → C.** "An immature technology is a source of risk. How do we write, rate and treat risks?"

### Section C: Risk management (24 min)

#### S1.10 The risk process (2 min)
- **Purpose.** The activities and what each produces.
- **Content.** SEBoK: planning, identification, analysis, treatment, monitoring (R17 p.482). DoD Table 4-3: planning, identification ("What can go wrong?"; risk statements in an if–then construct), analysis (likelihood and consequence ratings; register), mitigation (accept, avoid, transfer or control), monitoring (R46 pp.124–125).
- **Figure.** A five-step loop with the question each step answers and its product.
- **Sources.** R17 p.482; R46 pp.124–125.

#### S1.11 Writing a risk (3 min)
- **Purpose.** The statement form.
- **Content.** SEBoK: use structured descriptions, an if–then format, or a condition that leads to a potential consequence (R17 p.483). DoD: a risk statement has the potential event and its consequences, and, if known, the contributing cause (R46 p.125). MITRE's condition–if–then construct: the condition is what is known today (the root cause); the "if" is the probabilistic risk event; the "then" is the set of consequences (R61, Risk Identification, pp.630–631). Do not put the mitigation into the risk statement (R61, Risk Identification, p.633).
- **Figure.** R-002 typeset in three colored parts (condition / if / then), with a struck-out fourth clause "so we will sample-test packs" labeled "mitigation does not belong here".
- **Sources.** R17 p.483; R46 p.125; R61 pp.630–631, 633.

#### S1.12 Rating risks: scales, matrix and their limits (3 min)
- **Purpose.** Rate consistently and know what an ordinal matrix cannot say.
- **Content.** Risk analysis estimates likelihood and consequence and converts them into a level; there is no best approach; matrices, simulations and probabilistic assessments are used for technical risk (R17 p.483). DoD: consequence is measured as deviation against the program's performance, schedule or cost baseline, with criteria tailored to the program; approved risks go into a register and a reporting matrix (R46 pp.125–126). MITRE: subjective probability assessment is common; document the rationale for each rating and tailor the criteria to the decision (R61, Risk Impact Assessment, pp.635, 637). SEBoK good practice: understand the limitations of risk analysis tools; challenge results (R17 p.486).
  - **Course convention.** A 5 × 5 matrix with written anchors for each likelihood and consequence level (reused from the reviewed old Week 6 module); ordinal cells are ranked, never multiplied as if they were probabilities.
- **Figure.** The 5 × 5 grid with the AeroLink risks plotted by ID (R-001 3×4, R-002 3×4, R-003 2×5, R-004 3×4, R-005 2×4, R-006 3×2, R-007 2×4, R-008 2×5), and a side note "R-003 and R-008 (2×5) versus R-002 (3×4): which is worse? The matrix alone cannot say."
- **Sources.** R17 pp.483, 486; R46 pp.125–126 (the matrix layout is DoD Figure 4-9, an image; check the band colors against the PDF); R61 pp.635, 637. Ratings from `reference/week02.ts` and `week06.ts`. Course convention (anchors).

#### S1.13 Handling options (3 min)
- **Purpose.** Choose deliberately among the options.
- **Content.** SEBoK: assumption, avoidance, control (mitigation) and transfer; all four should be evaluated and the best chosen; hybrid and contingent strategies are possible; buying information (prototypes, modeling) can clarify the choice (R17 p.484). DoD: accept (and monitor), avoid, transfer or control; examples include risk-reduction prototyping, deferring capability to a follow-on increment, and off-ramps to mature technology (R46 p.126). MITRE adds watch/monitor (R61, Risk Mitigation, p.642). Pitfall: automatically selecting mitigation rather than evaluating all four (R17 p.485).
  - **Course convention.** The register records one of avoid, mitigate, transfer, accept, with owner, treatment and trigger.
- **Figure.** Four doors (avoid, control, transfer, accept) with one AeroLink risk behind each: R-005 avoid (select hub sites only with confirmed capacity), R-008 mitigate, R-004 transfer (performance guarantee in the purchase contract), R-006 accept.
- **Sources.** R17 pp.484–485; R46 p.126; R61 p.642. Data from `reference/week06.ts`.

#### S1.14 Monitoring and triggers (2 min)
- **Purpose.** A risk register is a living instrument.
- **Content.** Risk monitoring evaluates the effectiveness of treatment; approaches include earned value, program metrics and technical performance measures (R17 p.484). DoD: track mitigation against burn-down plans and through associated TPMs (R46 p.127). Pitfall "sea of green": the plan's activities look on track while the risk itself is unchanged (R17 p.485).
- **Figure.** A burn-down sketch for R-002: risk level over time with planned and actual lines, and the trigger "TPM-003 margin below 1 percentage point" marked.
- **Sources.** R17 pp.484–485; R46 p.127. R-002 trigger from `reference/week06.ts`.

#### S1.15 Worked example II: writing, rating and treating R-008 and R-004 (5 min)
- **Purpose.** The whole method on two different kinds of risk.
- **Content.**
  - R-008 battery thermal runaway during charging: condition (high-power charging on hub pads next to passengers); if (a cell enters thermal runaway); then (fire spreads, injuries, vertiport closed). Rating 2 × 5. Mitigate: cell-temperature monitoring stops charging (SCN-003 A3), pad fire detection alerts responders within 60 s (REQ-STK-008, REQ-SYS-009), separation and suppression. Trigger: cell over-temperature alarm.
  - R-004 weather limits lower than planned: condition (limits unpublished, U-001); if (approved limits are lower); then (holds exceed 5 % of operating hours and capacity falls below REQ-STK-004). Rating 3 × 4. Transfer: a performance guarantee in the aircraft purchase contract.
  - Discussion: transfer changes who pays, not what passengers experience; the consequence rating does not change.
- **Figure.** Two register rows expanded into cards with the condition–if–then parts colored and arrows to the requirements each threatens.
- **Sources.** R61 pp.630–631; R17 p.484; R46 p.126. Data from `reference/week06.ts`, `week04.ts`, `week03.ts`.

#### S1.16 Pitfalls and good practices (3 min)
- **Purpose.** Consolidate by contrast.
- **Content.** SEBoK pitfalls: process over-reliance, lack of continuity, tool over-reliance, lack of vigilance, automatic mitigation selection, sea of green, band-aid treatment (R17 pp.485–486). Good practices: top down and bottom up, early planning, know the limits of analysis, robust treatment that reduces both probability and consequence, structured monitoring, keep the register updated (R17 p.486).
- **Figure.** Two-column table "pitfall → good practice" with a small icon per row.
- **Sources.** R17 pp.485–486.

#### S1.17 Worked example III: the AeroLink uncertainty register, linked (3 min)
- **Purpose.** Show the register as part of the package, not a separate list (W3.5).
- **Content.** Assumptions A-001 (15 min wait tolerance), A-002 (3 hubs, 6 turnaround chargers), A-003..A-005 (TRL bases), A-006 (240 trips/day), A-007 (20 min charger occupancy, 48 charges per charger per day), A-008 (public-transport fallback); risks R-001..R-008; opportunities O-001 (integrated ticketing), O-002 (overnight charger leasing); unknowns U-001 (weather limits, TBD-01), U-002 (grid connection limit, TBD-02). Every entry `affects` named requirements, capabilities or scenarios (for example R-001 → CAP-003, REQ-STK-001, REQ-STK-004).
- **Figure.** A network: register entries on the left, Week 2 artifacts on the right, "affects" links between them; U-001 and U-002 linked to the TBDs in REQ-STK-003 and REQ-STK-010.
- **Sources.** R13 p.565 (TBX tracking). Data from `reference/week02.ts`–`week07.ts`. Course convention (register structure).

**Transition C → D.** "Some risks threaten a number in a requirement. We track those numbers over time."

### Section D: Technical performance measures (10 min)

#### S1.18 From MOE and MOP to TPM (3 min)
- **Purpose.** Complete the measures hierarchy begun in Week 2.
- **Content.** Technical measurement includes MOEs, MOPs and TPMs, planned early and performed with increasing fidelity (R15 p.532). DoD: TPMs are measures collected over time to see trends and forecast progress to plan; early in the life cycle they may be estimated from assumptions, modeling and simulation, and demonstrated data replace estimates later; TPMs provide leading indicators of performance deficiencies or system risk (R44 p.113). A good TPM is quantifiable, collected at routine intervals, has a planned profile with thresholds, and is relevant to a program risk or decision (R44 p.116).
- **Figure.** The Week 2 pyramid with the TPM level now filled: TPM-001 under MOP-002 under MOE-001.
- **Sources.** R15 p.532; R44 pp.113, 116.

#### S1.19 Current estimate, contingency, worst case and margin (3 min)
- **Purpose.** Exact vocabulary.
- **Content.** DoD: contingency is an allotted value for uncertainties such as measurement error and immaturity, used to adjust the current best estimate (CBE) to a worst-case estimate (WCE); contingency typically decreases as the system matures; margin is the growth that can be accommodated while staying within the threshold, threshold minus WCE, and is trade space for the program manager (R44 p.117).
- **Figure.** A vertical bar for a lower-is-better TPM: CBE, plus a contingency band to WCE, then margin up to the threshold, with the objective drawn below the CBE.
- **Sources.** R44 p.117.

#### S1.20 Worked example IV: AeroLink's three TPMs, and a contingency question (4 min)
- **Purpose.** Apply and critique.
- **Content.** TPM-001 charge time (threshold 20 min, objective 15, current estimate 18, margin 2; basis: supplier charge-curve analysis); TPM-002 pad-edge noise (65 dBA threshold, objective 62, estimate 63.5, margin 1.5; prediction only); TPM-003 landing energy on the design trip (higher is better: threshold 20 %, objective 25 %, estimate 23 %, margin 3 points). **The reference margins equal threshold minus the current estimate, which treats contingency as zero.** DoD defines margin against the worst-case estimate (R44 p.117). Ask: TPM-002 rests on prediction only; what contingency would you hold, and what margin is left? (For example, a 1 dBA contingency leaves 0.5 dBA, **proposed, instructor to confirm**.)
- **Figure.** Three margin bars side by side, each with a dashed contingency band to be filled in by students.
- **Sources.** R44 p.117. Data from `reference/week05.ts` (FICTIONAL estimates).

### Section E: Connecting the instruments, and exit (11 min)

#### S1.21 One chain through all three instruments (4 min)
- **Purpose.** Show the package's digital thread in documents.
- **Content.** TECH-002 (TRL 5, A-004) → R-002 capacity fade under fast charging (3 × 4, mitigate) → TPM-003 landing energy (margin 3 points; trigger below 1 point) → REQ-SYS-003 planned landing reserve ≥ 20 % → NEED-002 assurance of flight within safety limits. A change in any link propagates: if cycle tests show 15 % fade, the TPM estimate falls, the risk likelihood rises, and the requirement may become infeasible on the design trip.
- **Figure.** A horizontal chain of five linked cards with the propagation path drawn as a red dashed arrow.
- **Sources.** Data from `reference/week06.ts`, `week05.ts`, `week04.ts`, `aerolinkCase.ts`. Instructor synthesis.

#### S1.22 What Session 2 needs from today (2 min)
- **Purpose.** Hand-off.
- **Content.** A trade study scores alternatives against criteria traced to MOEs; risk and readiness are part of the scoring or of the recommendation's conditions (SEBoK: identify uncertainty and assess risks for each decision, R18 p.464).
- **Figure.** A trade-study frame with "risk" and "maturity" sockets highlighted.
- **Sources.** R18 p.464.

#### S1.23 Exit: retrieval and preparation (5 min)
- **Purpose.** Retrieval; pre-work.
- **Content.** One-minute paper: "Rewrite this worry as a condition–if–then risk: 'the new app might be late'." Before Session 2 (about 25 min per student): each member lists two technologies the team's enterprise depends on with a first TRL guess and its basis, and one decision the team will soon face; read R18 pp.465–466 and 469.
- **Figure.** None (text slide with the LMS link).
- **Sources.** Course convention.

**Session 1 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| A Framing | S1.1–S1.4 | 8 | 8 |
| B Technology readiness | S1.5–S1.9 | 16 | 24 |
| C Risk management | S1.10–S1.17 | 24 | 48 |
| D TPM | S1.18–S1.20 | 10 | 58 |
| E Connecting and exit | S1.21–S1.23 | 11 | **69** |
| Buffer | | 6 | 75 |

## 3. Session 2: The trade study and the lab launch (69 min + 6 buffer)

### Split decision: 47 min lecture, 22 min laboratory launch
The trade study is the week's decision instrument and is taught in full on AeroLink before teams frame their own (A20). The in-room lab part is the instructor's approval of each team's decision statement and alternatives, which gates the whole trade study: a team that frames a strawman set of alternatives wastes the week.

### Section F: Decision management and the trade study (18 min)

#### S2.1 Retrieval warm-up (2 min)
- **Purpose.** Spaced retrieval.
- **Content.** Three cards: (1) Is "weather limits not yet published" a risk, an unknown or an issue? (2) Which handling option did R-004 use, and what did it not change? (3) Margin is threshold minus what? Reveal on the next click.
- **Figure.** Three blank cards.
- **Sources.** R46 p.127; R44 p.117.

#### S2.2 What decision management is for (3 min)
- **Purpose.** Purpose and process.
- **Content.** The purpose of decision management is to provide a structured, analytical framework for identifying, characterizing and evaluating alternatives and selecting the most beneficial course of action (15288 via SEBoK); the trade study is the method most commonly used (R18 p.463). Best practices: sound decision-analysis mathematics, one master decision model refined through the life cycle, value-focused thinking, uncertainty and risk for each decision (R18 p.464). DoD's decision-analysis steps, from identifying the problem and the assumptions through criteria and weights, alternatives, synthesis, sensitivity and a recommendation; the decision maker keeps full responsibility (R43 p.110).
- **Figure.** A ten-step ring adapted as an original drawing from the DoD step list (not SEBoK's Figure 1), with the course's lab steps mapped onto it.
- **Sources.** R18 pp.463–464; R43 p.110.

#### S2.3 Framing the decision, objectives and measures (3 min)
- **Purpose.** A trade is only as good as its frame.
- **Content.** Describe the baseline, boundaries and interfaces; state a decision problem in terms of the life cycle (R18 p.465). Develop objectives and measures with stakeholders; test the fundamental objectives for being essential, controllable, complete, non-redundant, concise, specific and understandable; each measure must be unambiguous, comprehensive, direct, operational and understandable (R18 p.465). **Course rule:** criteria trace to MOEs from Week 2; cost and risk are handled explicitly (rubric criterion for criteria).
- **Figure.** An objectives hierarchy for AeroLink (decision at the top; four objectives below, each with its measure and the MOE it traces to).
- **Sources.** R18 p.465. Course convention (MOE trace).

#### S2.4 Value functions (3 min)
- **Purpose.** From measure space to value space.
- **Content.** The value function transforms a measure into value; the walk-away point maps to 0, the stretch goal to the top of the value scale; the rationale for each curve's shape is documented (R18 pp.465–466).
- **Figure.** Two linear value functions from the case (wait: 1 at 5 min, 0 at 60 min; capacity retained: 0 at 50 %, 1 at 100 %), with walk-away and stretch labeled; a faint concave curve as "other shapes exist".
- **Sources.** R18 pp.465–466. Value functions from `reference/week07.ts`.

#### S2.5 Swing weights (4 min)
- **Purpose.** The most misunderstood step.
- **Content.** In multiple-objective decision analysis the weights depend on the importance of the measure **and** its range from walk-away to stretch; the swing-weight matrix places each measure by importance and by the gap between current and desired capability; the top cell gets an unnormalized weight of 100; others are assessed against it; weights are normalized to sum to one (R18 p.466; matrix figure on p.467). Importance weights without ranges are a different and weaker thing.
- **Think-pair-share (1 min).** If the cost range were USD 0–5 M instead of 0–20 M, should its weight go up or down?
- **Figure.** A swing walk-through: four bars from worst to best for each criterion, ranked; the points 100 / 75 / 40 / 35 normalized to 0.40 / 0.30 / 0.16 / 0.14.
- **Sources.** R18 pp.466–467. Swing points from `reference/week07.ts`. Note: the swing-weight text is on p.466; p.467 carries the figure (the rubric cites p.467).

#### S2.6 Alternatives and the additive value model (3 min)
- **Purpose.** Generate good alternatives; compute value.
- **Content.** An alternative generation table (morphological box) helps span the decision space (R18 p.467). Scores are captured with source and rationale; the score matrix can include an ideal alternative as a value-focused-thinking tool (R18 p.468). Scores become values through the value functions; the additive value model sums weighted values (R18 p.469). **PDF check:** the equation on p.469 is an image and is not in the extracted text; the course form v(a) = Σ wᵢ vᵢ(xᵢ(a)) must be checked against the PDF before the slide is finalized.
- **Figure.** A small morphological box for AeroLink capacity (fleet: +0/+4/+6; hubs: 3/4 by upgrade/4 by new site), with the six listed alternatives traced as paths and the three remaining paths marked with the screen each fails (review M1, 2026-10-19).
- **Sources.** R18 pp.467–469.

### Section G: The AeroLink Year-2 capacity trade, worked (19 min)

#### S2.7 Worked example I: framing the decision (5 min)
- **Purpose.** A complete frame before any number.
- **Content.**
  - Decision: how should AeroLink provide the Year-2 capacity objective (MGO-007; REQ-STK-004: at least 300 trips/day by month 24)?
  - Demand A-006: 240 trips/day, assumed independent of the alternative.
  - Capacity rule (course convention, A-007): capacity = min(aircraft × 20, turnaround chargers × 48).
  - Alternatives: ALT-001 baseline (12 aircraft, 6 turnaround chargers: 240 trips/day, fleet-limited); ALT-002 aircraft only (18: 288, charger-limited); ALT-003 vertiport only (12 aircraft, 8 chargers, 7 sites: 240, fleet-limited); ALT-004 balanced (16 aircraft, one spoke upgraded to a hub: 320, meets REQ-STK-004).
  - Ask students to compute two capacities before the reveal.
- **Figure.** A 2 × 2 "fleet limit vs charger limit" chart with each alternative plotted as a point and the 300 trips/day line drawn.
- **Sources.** Data from `reference/week07.ts`, `week02.ts`, `week04.ts` (FICTIONAL).

#### S2.8 Worked example II: criteria, value functions and weights (3 min)
- **Purpose.** Criteria traced to MOEs.
- **Content.** CRIT-001 wait at Year-2 demand (MOE-001; v = 1 at 5 min, 0 at 60 min; weight 0.40); CRIT-002 capital cost (MOE-005; 1 at USD 0 M, 0 at 20 M; 0.30); CRIT-003 capacity retained after loss of a hub (MOE-006; 0 at 50 %, 1 at 100 %; 0.16); CRIT-004 community noise exposure, peak-hour movements at the busiest vertiport (MOE-003; 1 at 5, 0 at 10 movements/h; 0.14). Each swing rationale is stated (for example, the wait swing decides whether passengers stay, A-001).
  - Note the Week 1 conflict: CRIT-004 is the trade's handle on NEED-003's event-count bound; the per-event bound is already a requirement (REQ-STK-002).
- **Figure.** A four-row criteria table with MOE trace, value function sketch and weight.
- **Sources.** R18 pp.465–466. Data from `reference/week07.ts`, `week05.ts`; CONFLICT from `aerolinkCase.ts`.

#### S2.9 Worked example III: scores and computation (4 min)
- **Purpose.** Reproducible arithmetic.
- **Content.** Score matrix (wait, cost, retained capacity, movements/h): ALT-001 66.7 min, 0, 80 %, 8; ALT-002 12, 18, 66.7 %, 8; ALT-003 66.7, 6, 100 %, 6.86; ALT-004 8, 12.8, 90 %, 8. Values and totals: ALT-004 0.670, ALT-002 0.489, ALT-003 0.458, ALT-001 0.452. Work ALT-004 on the slide: 0.40 × 0.945 + 0.30 × 0.36 + 0.16 × 0.80 + 0.14 × 0.40 = 0.670.
- **Figure.** A value component chart: stacked bars of weighted value per criterion for each alternative (original drawing in the style SEBoK describes, R18 p.470).
- **Sources.** R18 pp.469–470. Scores and totals from `reference/week07.ts` (recomputed in `reference.detail.test.ts`).

#### S2.10 Worked example IV: sensitivity and rank reversal (4 min)
- **Purpose.** Test the result before believing it.
- **Content.** Sensitivity analysis includes line diagrams, tornado diagrams and Monte Carlo simulation; a line diagram shows sensitivity to the swing-weight judgment (R18 p.472). Vary one weight and rescale the others in proportion: *Revised after review M1 (2026-10-19):* the sensitivity is computed among the alternatives that pass every screen (ALT-004, ALT-005, ALT-006). The top rank changes when the cost weight falls below 0.150 or the noise weight rises above 0.284 (ALT-005 ranks first), or the wait weight rises above 0.848 (ALT-006); resilience never reverses it. The unscreened 0.478 → ALT-001 reversal is shown once as the mistake the screens prevent.
- **Figure.** A line diagram: total value of each alternative against the cost weight from 0 to 1, with the crossing at 0.150 (ALT-005) marked and the base weight drawn as a vertical line.
- **Sources.** R18 p.472. Reversal points from `reference/week07.ts`.

#### S2.11 Worked example V: the recommendation, with conditions (3 min)
- **Purpose.** What a defensible decision record contains.
- **Content.** DEC-001: recommend ALT-004, first (0.670) of the three alternatives that pass every screen (ALT-005 0.624, ALT-006 0.563); *revised after review M1*. Conditions: the capital weight stays above about 0.15 and the noise weight below about 0.28; demand near 240 trips/day (A-006); the spoke-site grid connection supports two high-power chargers (U-002, R-005). Residual risk: R-001 reduced but not removed; R-005 at the converted hub; R-002 rises with more fast-charge cycles. Would change if: forecast demand falls to 192 trips/day or less; capital weight below 0.150 or noise weight above 0.284 (ALT-005); wait weight above 0.848 (ALT-006); TBD-02 rules out the spoke conversion (ALT-005 becomes the recommendation). SEBoK: communicate the key trade-offs, uncertainties and risks, and present recommendations as an actionable task list (R18 pp.472–473); DoD: sound recommendations and action plans are the principal output (R43 p.110).
- **Figure.** A one-page decision record with five labeled boxes: decision, recommendation, conditions, residual risk, would change if.
- **Sources.** R18 pp.472–473; R43 p.110. DEC-001 from `reference/week07.ts`.

### Section H: Answer, pitfalls and bridge (10 min)

#### S2.12 Answering the driving question (3 min)
- **Purpose.** Close the loop from S1.2.
- **Content.** Answer (B). Six more aircraft alone (ALT-002) move the bottleneck to charging: capacity rises only to 288 trips/day and R-001 (charging lags fleet growth) is realized. The balanced alternative adds four aircraft and charging together. The technology readiness of TECH-001 (TRL 6, assumed) and the unknown grid limit (U-002) are conditions on the decision, not footnotes.
- **Figure.** The S1.2 queue picture redrawn for ALT-004: four aircraft added and a third charger pair at the converted hub.
- **Sources.** Data from `reference/week07.ts`, `week02.ts`, `week06.ts`.

#### S2.13 Bias and value-focused thinking (3 min)
- **Purpose.** Graduate caution.
- **Content.** Mining the results can reveal ways to improve alternatives: from alternative-focused to value-focused thinking (R18 p.472). Cognitive biases (confirmation bias is the best known) can seriously distort decisions; self-mitigation by the decision maker is generally not feasible (R18 p.473). Course practice: the person who proposed an alternative does not score it alone.
- **Figure.** Two thought bubbles: "which option wins?" versus "what would an ideal option look like, and can we get closer?".
- **Sources.** R18 pp.472–473. Course convention (scoring practice).

#### S2.14 What the decision changes in the package, and where it goes (4 min)
- **Purpose.** Continuity.
- **Content.** DEC-001 becomes the Week 4 architecture's starting point (16 aircraft, four hubs) and generates derived requirements (charger rating at the converted hub, after the trade; R48 p.146). The risks link to requirements and architecture (Week 4–5). Phase II: Week 12 models risks and assumptions with metadata linked to requirements (R78 p.147 risk metadata, named only); Week 13 redoes this trade as analysis cases with the TPMs as constraints (R75 pp.92–95, named only).
- **Figure.** DEC-001 card with three outgoing arrows: "Week 4 architecture", "derived requirements", "Weeks 12–13 model".
- **Sources.** R48 p.146. COURSE_SCHEDULE.md rule 6. Phase II readings named only.

### Section I: Laboratory launch (22 min)

#### S2.15 Lab L3 brief (3 min)
- **Purpose.** Unambiguous instructions.
- **Content.** Week 3 additions to the Team Record (§5.5), minimums, due before Week 4 Session 1, rubric criteria in plain words, AI usage statement. The team's own enterprise, never AeroLink.
- **Figure.** Checklist with minimums and owners.
- **Sources.** Course convention.

#### S2.16 Team work: choose the decision and the technologies (8 min)
- **Purpose.** In-class framing.
- **Content.** From the members' pre-work, the team selects: three enabling technologies to assess; one decision for the trade study that matters to a Week 1 stakeholder and traces to a Week 2 requirement or objective; a draft decision statement and at least three genuinely different alternatives including the baseline (status quo).
- **Figure.** Timer; decision-statement template "How should [enterprise] [achieve objective X] given [constraint]?".
- **Sources.** R18 p.465 (decision problem statement). Course convention.

#### S2.17 Instructor checkpoint: decision and alternatives (9 min)
- **Purpose.** Approve the frame.
- **Content.** Each team (about 90 s, up to five teams; others on the LMS within 48 h) reads its decision statement and alternatives and names the MOE behind its most important criterion. The instructor checks: is the baseline included; are the alternatives genuinely different (not strawmen); does the decision trace to a requirement or objective? Decision: approve, approve with conditions, or revise with a reason.
- **Figure.** Checkpoint card with three check boxes.
- **Sources.** Course convention (rubric criterion for framing and alternatives).

#### S2.18 Close: the next seven days (2 min)
- **Purpose.** Work plan.
- **Content.** Out-of-class sequence (§5.4); quiz and applied exercise open after this session; log hours.
- **Figure.** Seven-day timeline.
- **Sources.** Course convention.

**Session 2 running total**

| Section | Slides | Minutes | Cumulative |
|---|---|---|---|
| F Decision management | S2.1–S2.6 | 18 | 18 |
| G AeroLink trade, worked | S2.7–S2.11 | 19 | 37 |
| H Answer, pitfalls, bridge | S2.12–S2.14 | 10 | 47 |
| *Lecture subtotal* | *14 slides* | *47* | |
| I Lab launch | S2.15–S2.18 | 22 | **69** |
| Buffer | | 6 | 75 |

## 4. AeroLink worked example (continuity from Weeks 1–2)

All values FICTIONAL.

### 4.1 What Week 3 inherits
From Week 1: needs (NEED-002, NEED-003 exposure, NEED-004, NEED-005, NEED-010) and the REL-002 conflict with its adjudication protocol, whose "Analyze" step names this week's trade (`aerolinkCase.ts`, CONFLICT). From Week 2: REQ-STK-004 (300 trips/day by month 24), REQ-SYS-001/003/010, the TBDs (TBD-01/U-001, TBD-02/U-002), MOE-001/003/005/006 and MOP-002/004/005.

### 4.2 Technology readiness (`reference/week06.ts`)

| ID | Technology | TRL | Basis | Critical for the baseline? |
|---|---|---|---|---|
| TECH-001 | High-power charging | 6 | A-003 (assumed; supplier test report to confirm) | Yes (25 min turnaround) |
| TECH-002 | Battery cell technology | 5 | A-004 (assumed; cycle-test data to confirm) | Yes (lowest critical TRL) |
| TECH-003 | Detect-and-avoid and autonomy enablers | 4 | A-005 (laboratory only) | No (baseline is piloted; R-006 accepted) |

### 4.3 Risk register (`reference/week02.ts`, `week06.ts`)

| ID | Risk (short) | L × C | Handling | Owner | Trigger |
|---|---|---|---|---|---|
| R-001 | Charging capacity lags fleet growth | 3 × 4 | Mitigate (tie aircraft orders to a charging check; DEC-001) | Network Planning Manager | Charger queue > 5 min on 3 consecutive days |
| R-002 | Battery capacity fade under fast charging | 3 × 4 | Mitigate | Fleet Engineering Lead | TPM-003 margin < 1 point |
| R-003 | Pad-edge noise above the agreed limit | 2 × 5 | Mitigate | Community Relations Manager | Any movement > 64 dBA |
| R-004 | Weather limits lower than planned | 3 × 4 | Transfer | Director of Flight Operations | OEM draft limits below planning values |
| R-005 | Grid connection below hub demand | 2 × 4 | Avoid | Vertiport Infrastructure Manager | Utility response |
| R-006 | Detect-and-avoid not mature for autonomy | 3 × 2 | Accept | Director of Flight Operations | TRL review at evolution planning |
| R-007 | Dispatch platform outage | 2 × 4 | Mitigate (hot standby, DEC-002) | Head of Operations Technology | Platform health alarm |
| R-008 | Battery thermal runaway during charging | 2 × 5 | Mitigate | Vertiport Safety Manager | Cell over-temperature alarm |

### 4.4 TPMs (`reference/week05.ts`) and trade study (`reference/week07.ts`)
TPM-001..003 as in S1.20; CRIT-001..004, ALT-001..004 and DEC-001 as in S2.7–S2.11.

### 4.5 Reference-data notes for the instructor
1. **Old week numbers inside the data.** A-002, A-007 and U-002 say "before the Week 7 trade study" and U-001 "before CP2 requirements baseline (Week 6)"; TECH-003, A-005 and R-006 refer to "Week 14 evolution". Under the current schedule these are Week 3, Week 2 and Week 6. The slides use the current week numbers; the data should be updated by the app-source owner.
2. **Margins.** TPM margins in the reference are threshold minus current estimate (zero contingency); see S1.20.
3. **Noise.** R-003, TPM-002 and MOE-003 address the per-event level only; after the Week 1 correction, NEED-003 also bounds evening and early-morning event counts, which CRIT-004 touches only as peak-hour movements. A TPM or measure for the event count may be needed **(proposed, instructor to confirm)**.
4. **British spelling** in reference text ("utilisation", "centre") is Americanized on the slides.

## 5. Laboratory outline: Lab L3, readiness, risk and a trade study for the team's enterprise

### 5.1 Inputs
- The Week 1–2 Team Record with feedback: needs, ConOps scenarios, capabilities, requirements with TBDs, MOE and MOP, the AROU entries from scenarios.
- The approved decision statement and alternatives from S2.17.
- Readings (essential): R16 pp.766–768; R17 pp.481–484; R46 pp.124–126; R18 pp.465–469, 471–472. Extension: R60 pp.524–526; R61 pp.630–633; R44 pp.113, 116–117; R43 pp.109–110.

### 5.2 Objectives
W3.1–W3.6 applied to the team's own enterprise.

### 5.3 Method
1. **Readiness**: three enabling technologies, each with description, benefits, limitations, enterprise impact, TRL with evidence or a labeled assumption, critical or not, maturity risk (S1.5–S1.9).
2. **Risks**: at least six, in condition–if–then form, rated on the course scales with a written rationale, each with handling option, owner, treatment, trigger and `affects` links to requirements, capabilities or scenarios (S1.10–S1.16).
3. **Register**: AROU entries updated (each kind distinct); issues listed separately (S1.4, S1.17).
4. **TPMs**: at least two, attached to the riskiest requirements, with threshold, objective, current estimate, contingency, margin and basis (S1.18–S1.20).
5. **Trade study**: decision statement; ≥ 3 genuinely different alternatives incl. baseline; criteria traced to MOEs, with cost and risk handled explicitly; value functions; swing weights with ranges and rationale; additive computation in a reproducible workbook; sensitivity on the top weights with the reversal point; recommendation with conditions, residual risk and what would change it (Session 2).
6. **Package update**: derived requirements from the decision, if any, traced to the decision record.

### 5.4 Procedure

| Step | When | Who (lead role) | Output |
|---|---|---|---|
| 1. Decision, alternatives, technology list | In class, S2.16 | Whole team | Draft frame |
| 2. Checkpoint decision | In class, S2.17 | Architecture lead presents | Approved frame |
| 3. Readiness assessment | Day 1–2 | AI & Data (one technology per member where possible) | Part 12 |
| 4. Risk identification workshop (each member brings two risks) and rating | Day 2–3 | V&V | Part 13 |
| 5. AROU update and links | Day 3 | Requirements & Compliance | Part 13 |
| 6. TPMs | Day 3–4 | V&V | Part 11 updated |
| 7. Criteria, value functions, swing weights | Day 4 | Architecture | Part 14 |
| 8. Scores, computation, sensitivity | Day 5 | AI & Data | Part 14 workbook |
| 9. Recommendation and derived requirements; AI usage statement | Day 6 | Whole team; AI & Data (statement) | Part 14, Part 6 |
| 10. Integration review, export, upload | Day 7 | V&V | Submission |

### 5.5 Outputs
`team-NN-week3-record.md`, `team-NN-week3-trade-workbook.xlsx` (or .csv) and `team-NN-week3-model-inputs.json`:
- Part 12 technology readiness (TECH); Part 13 risk and uncertainty register (A, R, O, U; issues separate); Part 11 TPMs added; Part 14 trade study and decision record (CRIT, ALT, DEC).
- **Minimums (course convention, team of 4):** 3 technologies; 6 risks; ≥ 1 opportunity; every TBD from Week 2 linked to an unknown; 2 TPMs; 3 alternatives incl. baseline; 3–5 criteria; one sensitivity analysis with the reversal point. Team of 3: 2 technologies, 5 risks, otherwise the same.
- The JSON gains TECH, A/R/O/U, TPM, CRIT, ALT, DEC entries with links (export-format change for the app-source owner).

### 5.6 Rubric rows (from ASSESSMENT_RUBRICS.md)

| Row | Criterion | Applied this week |
|---|---|---|
| RB-5.1 | Technology description and impacts | Yes |
| RB-5.2 | Maturity assessment | Yes: TRL per the scale definitions, cited evidence or labeled assumption, maturity risk |
| RB-5.3 | Risk statements and rating | Yes: condition–if–then; defined scales; issues separated from risks |
| RB-5.4 | Treatment and AROU | Yes |
| RB-5.5 | Linkage | Yes, to REQ, CAP and SCN (architecture links added in Weeks 4–5) |
| RB-4.1–4.3 | Measures | The TPM part: classification, link to risky requirements, measurement rationale |
| RB-6.1–6.6 | Trade study | Yes, in full |
| RB-12.1–12.3 | AI usage statement | Yes (the course deliverable specification asks for AI-generated insights and critique in the technology assessment) |

**Grading mode.** Formative unless faculty decide otherwise; feedback before Week 4 Session 2.

### 5.7 Realistic per-student workload (budget about 8 h)

| Activity | Hours per student | Basis |
|---|---|---|
| Class sessions | 2.5 | Timetable |
| Readings: R16 pp.766–768 (3), R17 pp.481–484 (4), R46 pp.124–126 (3), R18 pp.465–469, 471–472 (7); 17 pp | 1.1 | Register page counts |
| Lecture handout and worked examples | 0.4 | About 4,000 words |
| Pre-work for Session 2 (S1.23) | 0.4 | Two technologies and one decision per member |
| Lab L3 out of class: student share of steps 3–10 | 2.5 | About 10 person-hours per team of 4: readiness 1.5; risks 2.0; register and links 1.0; TPMs 1.0; trade study 4.0; integration and AI statement 0.5. Team of 3 at the reduced minimums: about 2.5 h each (7.6 person-hours) |
| Quiz Q3 | 0.3 | 12 items |
| Individual applied exercise (graduate: the Monte Carlo memo instead, 0.9 h) | 0.6 | §6.2 |
| Time log | 0.1 | |
| **Total** | **7.9** (graduate 8.2) | Within the budget for undergraduates; graduate slightly over unless the exercise is waived for them (as proposed) |

## 6. Assessment outline (separate from the lecture)

### 6.1 Quiz Q3 (individual, 15 min, closed book, 12 items; unseen contexts)

| # | Objective | Bloom | Item focus | Key rests on |
|---|---|---|---|---|
| 1 | W3.1 | Understand | A water-purification membrane validated as a component in a pilot plant: which TRL? | R16 p.767 |
| 2 | W3.1 | Analyze | Why can a TRL 7 component still be a risk in a new architecture? | R60 p.525; R16 p.768 |
| 3 | W3.5 | Analyze | Classify four statements from a hospital project as risk, issue, assumption or unknown | P3-1 p.1610; R46 p.127 |
| 4 | W3.2 | Apply | Which statement is in condition–if–then form and contains no mitigation? | R61 pp.630–631, 633 |
| 5 | W3.2 | Evaluate | A team always chooses "mitigate": which pitfall, and what should it do? | R17 pp.484–485 |
| 6 | W3.2 | Understand | Which handling option reassigns accountability to another party? | R61 p.642; R46 p.126 |
| 7 | W3.6 | Apply | Given CBE, contingency and threshold for a mass TPM, compute the margin | R44 p.117 |
| 8 | W3.3 | Analyze | Which criterion set double-counts? (cost and "affordability") | R18 p.465 |
| 9 | W3.4 | Understand | Why does a swing weight depend on the measure's range? | R18 p.466 |
| 10 (SA) | W3.4 | Apply | Compute the additive value of one alternative from given values and weights | R18 p.469 |
| 11 (SA) | W3.4 | Analyze | From a given line diagram, state the reversal point and what it means for the decision | R18 p.472 |
| 12 (SA) | W3.4 | Evaluate | A recommendation lacks conditions: write two conditions and one "would change if" | R18 pp.472–473; R43 p.110 |

Scoring: items 1–9 one point; 10–12 two points; total 15.

### 6.2 Individual applied exercise (about 35 min, open book, unseen case)
- **Case brief** (FICTIONAL): a municipal electric-bus depot choosing between overnight depot charging, on-route fast chargers, and a mixed option; three technologies with supplier claims of different quality; a short list of worries from interviews.
- **Tasks.** (1) Assign TRLs with basis, flag the lowest critical one (W3.1). (2) Turn three worries into condition–if–then risks, rate them and choose handling (W3.2). (3) Separate one issue and one unknown from the worries (W3.5). (4) Given criteria, ranges and a swing ranking, compute the weights and the leading alternative's value (W3.4). (5) State one condition under which the recommendation would change (W3.4).
- **Rubric** (4 levels, 20 points): readiness; risk statements and ratings; classification; computation; recommendation.

### 6.3 Graduate task (always read; replaces the applied exercise)
Monte Carlo on uncertain scores for the team's trade study: give lower, nominal and upper scores for the two most uncertain measures, run at least 1,000 trials, report the probability that the recommended alternative ranks first, and say whether the recommendation stands (R18 p.471; course.ts graduate task).

## 7. Continuity link to Phase II

| Week 3 artifact | Modeled in | How (named only) |
|---|---|---|
| Risks, assumptions, opportunities, unknowns with `affects` links | **Week 12** Digital Thread / V&V (rule 6: Week 12 ↔ Weeks 2 and 3) | Risk metadata attached to model elements; impact chains through the thread (R78 p.147; R86, instructor reference) |
| Trade study (criteria, alternatives, value model, sensitivity), TPMs | **Week 13** Trade Study / Analysis (rule 6: Week 13 ↔ Week 3) | Analysis cases and constraints; the trade redone in the model (R75 pp.92–95) |
| DEC-001 and its conditions | Week 4 architecture (Phase I), then Week 11 physical model | Starting configuration of the architecture |

## 8. Source gaps
1. **TRL definitions** beyond SEBoK's one-line table (R16 p.767): NASA's and DoD's full definitions and the DoD TRA Guidance (cited by DoD, R44 p.113) are not in the collection; IRL and SRL scales are named (R16 p.768) but not given.
2. **Risk scales.** No source in the collection gives likelihood and consequence anchors for a 5 × 5 matrix in text; DoD's reporting matrix is an image (R46 p.126). The course anchors are a course convention.
3. **DoD Risk, Issue, and Opportunity Management Guide** (cited by DoD, R46 p.125) is not in the collection.
4. **AROU** as a single register is a course construct; the sources treat assumptions (DoD R43 p.110 "identifying, recording and tracking assumptions"), risks, issues and opportunities separately.
5. **Decision analysis.** The additive value equation (R18 p.469) and the swing-weight matrix (R18 p.467) are images; Parnell et al. and Keeney (cited by SEBoK) are not in the collection.
6. **Assumption and unknown definitions** are course definitions; SEBoK's glossary has none in the pages checked.

## 9. Register additions needed

| Proposed ID | Source, PDF pages | Title | Used on | Verification note |
|---|---|---|---|---|
| P3-1 | SEBoK p.1610 | Risk (glossary) | S1.4; quiz 3 | Second entry on the page (running header "Rhumb Line (glossary)"); two definitions (DAU/Conrow; Willis et al.) |
| P3-2 | SEBoK p.1582 | Opportunity (glossary) | S1.4 | Entry heading on the page; two definitions; discussion on the lack of a unique specification |
| P3-3 | SEBoK p.1668 | Uncertainty (glossary) | S1.3 | First entry under "U"; one definition (ISO/IEC 24765) |
| R61 split (correction) | MITRE pp.626–633 / 634–640 / 641–647 | Risk Identification / Risk Impact Assessment and Prioritization / Risk Mitigation Planning, Implementation, and Progress Monitoring | S1.11–S1.13 | Each article begins with its own "Definition:" block on pp.626, 634, 641; keep R61 as umbrella or split into R61a/b/c |
| R60 narrowing (correction) | MITRE pp.523–526 (refs p.527) | Assessing Technical Maturity | S1.7 | pp.528–531 are a separate article, Technology Planning, proposed as a new entry by the Week 6 outline (P6-1) |

**Rubric source note.** ASSESSMENT_RUBRICS RB-6.3 cites "S11 p.467" for swing weights; the text is on p.466 and the figure on p.467. Proposed essential readings for `course.ts`: R16 pp.766–768; R17 pp.481–484; R46 pp.124–126; R18 pp.465–469, 471–472.

## 10. Open items for faculty
1. Approve the Session 2 split (47 min trade-study lecture, 22 min framing checkpoint).
2. Accept W3.5 and W3.6, and raise W3.3 to Analyze; confirm TPM moves here from Week 2.
3. The course 5 × 5 anchors (reused from the old Week 6 module) as the course scale.
4. Update the reference data's old week numbers (§4.5 item 1) and decide on a contingency value for the TPMs (S1.20).
5. Whether the team's trade study must address the same kind of decision as AeroLink (capacity) or any approved enterprise decision (the course lab document allows "another approved enterprise decision").
6. Lab minimums for teams of 3; the graduate Monte Carlo memo replacing the applied exercise.
7. Approve register additions P3-1 to P3-3 and the R61 and R60 corrections.
