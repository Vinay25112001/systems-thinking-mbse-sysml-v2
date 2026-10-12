# Week 1 learning flow: independent review

**Reviewer:** independent adversarial reviewer (systems engineering and instructional design)
**Date:** 2026-10-12
**Commit:** `60126c6` (learning-studio)
**Scope:**
- Every `review: 'new-pending-review'` item in `src/content/learn/week01.ts` and `src/content/learn/welcome.ts`.
- The relabelled workload row and the ≈ 8.7 h caution in `src/content/weeks/week01.ts`.
- The figures in `src/components/figures/*`.
- The flow logic in `src/flow/*`.
- The screenshots in `screenshots/week1-flow/`.

**Method:**
- Every Learn section was resolved to the exact prose a student sees. I used a scratch vitest outside the repo that calls `sectionProse()`, so sentence cuts were checked as rendered.
- Every cited and "Read more" page was read with `python -I scripts/source_pages.py`.
- Derived numbers were recomputed from `src/sim/aerolink.ts`, including extra frozen-fleet runs.
- Screenshots were read as a first-time graduate student would see them.

No app or course files were edited.

## Verdict: **REVISE**

The flow's structure is sound:
- The welcome leads to an Overview with a locked prediction.
- Learn has seven sections, each with a figure and a check, and the check gates "mark as read".
- Practice stays locked until all seven sections are read.
- Every derived FICTIONAL number reproduces and is tested.

Six defects block approval:
- Four of the seven checks can be answered by copying text shown just above them.
- The C5 key is leaked twice on the same page.
- The L6 figure gives away the faded-example answer, and it draws an impossible plateau.
- L7 never states the enterprise definition that objective B1.1 requires.
- L6 introduces Growth and Underinvestment without the reviewed caveat that the model does not contain it.

Severity counts: **6 major, 9 moderate, 13 minor.**

Test run: `npx vitest run src/content/learn src/flow src/sim src/content` gave **6 files, 139/139 passed**:

| Test file | Tests |
|---|---|
| content.test | 10 |
| learn/week01.test | 14 |
| missions | 11 |
| weeks | 82 |
| flow | 3 |
| sim/aerolink | 19 |

## Findings

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W1F-F01 | **Major** | Checks C1, C2, C4, C7 (`learn/week01.ts`) | The keyed option is a near-verbatim copy of text on the same screen, and it is also by far the longest option. A student can answer by matching text rather than by understanding. This breaks AUTHORING_GUIDE §7.6 and the retrieval-practice rationale in the design (generative recall, not recognition). The Bloom/SOLO labels are inflated as a result: C2 "Apply/relational" is recognition, and C4 "relational" is unistructural recall. | **C1:** option a copies `w1-emergence` ¶0 and the "Open system" key term, which sits directly above the check. a = 27 words; b–d = 3–6 words (visible in `l1-400-light.png`).<br>**C2:** a copies `w1-worked` bullet 2 from the worked example just above the check.<br>**C4:** a copies `w1-intuition` ¶1 sentence 3, which is the first paragraph of L4.<br>**C7:** a copies the `w1-lifecycle` ¶0 activity list (≈ 30 words vs 5–9 for the distractors). | Recast each check as a new case in which the student has to use the concept. Examples:<br>• C1: classify a described system as open or closed and give the reason.<br>• C2: give a fourth candidate boundary and ask what it can answer.<br>• C4: use a different emergent property, such as on-time departures or vertiport noise.<br>• C7: describe a change scenario and ask what the systems engineer does.<br>Equalise option lengths to within ≈ 30 %. Re-label Bloom/SOLO honestly. |
| W1F-F02 | **Major** | Check C5, Figure 5 | The answer to C5 is given away twice. (1) The prompt calls the loop "Loop B2", and the key terms on the same page define "Balancing loop (B)". (2) Figure 5's text equivalent, on the same page, lists "B2 Balancing — Waiting drives churn". The item is also ambiguous: option d ("Balancing, because churn is bad") gives the correct classification but is keyed wrong, although the prompt only asks to "Classify it". | `CausalLoopDiagram.tsx:123` renders `{l.id} {l.kind}`. `week01.ts:342` builds the prompt as `Loop B2: …`. | Use a neutral name ("Loop X") or a loop that is not in the diagram, such as the noise → community acceptance → operating-hours loop from the instructor notes. Make d a wrong classification with a wrong reason, or change the prompt to "Classify it and give the reason". |
| W1F-F03 | **Major** | L6 Figure 6 vs the faded worked example | Figure 6 is drawn above the "Your turn" input and labels "crossover 14.4 aircraft · from the 15th aircraft", so the faded step has nothing left to compute. `FadedInput` also accepts 15 (`v === Math.ceil(answer)`). | `Learn.tsx:395` (figures) renders before `<WorkedView>` (l.424). See `figure-l6-1.png` and `l6-1440x900-light.png`. | Show Figure 6 after the input step, or hide the crossover marker and its label until the student has entered an answer. Decide deliberately whether 15 is an acceptable answer to "at what fleet size do the capacities become equal". |
| W1F-F04 | **Major** | Figure 6 plateau line (`EngineeringFigures.tsx:47`) | The dashed "plateau ≈ 7,788" line is drawn across the full fleet range of 10–40 aircraft. At 10–12 aircraft it sits above fleet capacity (6,000–7,200), so the chart implies more trips served than capacity allows. The plateau is the month-60 equilibrium for fleets of 15 or more, not a constant. | Frozen fleets run with `aerolink.ts` defaults, month 60 (my run):<br>• 10 aircraft: 5,416 served (capacity 6,000)<br>• 12 aircraft: 6,495 (7,200)<br>• 13 aircraft: 7,034 (7,800)<br>• 14 aircraft: 7,572 (8,400)<br>• 15 aircraft: 7,788 (8,640) | Draw the plateau only from 15 aircraft, or plot equilibrium served trips against fleet size as a third series computed from `simulate`. Add a test that the plateau never exceeds min(fleet, charging) capacity at any plotted x. |
| W1F-F05 | **Major** | L7 body: `w1-lifecycle` ¶3, sentences [2,3] | The cut drops "What, then, is an enterprise?" and SEBoK's definition sentence. The student reads "SEBoK stresses that an enterprise is not the same as an organisation" without ever being told what an enterprise is. Yet the section title is "…what the enterprise is", B1.1 requires students to "Define … enterprise", and the blueprint §5 L7 specified the full paragraphs. | Resolved L7 prose (scratch dump): the only enterprise text is sentences 2–3, plus the one-line key term. | Use sentences [0,3] (+≈ 75 words; L7 is at 492 of 550 words, so raise `maxWords` or trim the `w1-application` cut). |
| W1F-F06 | **Major** | L6 body (`w1-feedback` ¶1 only) | L6 presents Growth and Underinvestment as "directly relevant to AeroLink" but leaves out the reviewed caveat in ¶3: the model "does not contain Growth and Underinvestment". Without it, students are likely to label the scenario Growth and Underinvestment. The scenario is literally `'underinvestment'` in code, and mission m1 asks students to commit to an archetype. The blueprint listed ¶¶2–4. This reopens a misconception that earlier reviews closed. | `week01.ts:368`; `w1-feedback` ¶3; blueprint §5 L6 "Explanation". | Add ¶3 sentences 0–2. They are reviewed text, ≈ 75 words, and fit within the 650-word cap (L6 is at 445). |
| W1F-F07 | Moderate | L6 worked example, steps 4–5 and setup | The causal mechanism is cut out. Step 4 reads "The reason is the churn loop. Demand never exceeds capacity…", but the wait and attractiveness relations and the adoption = churn equilibrium (¶3 sentences 3–5) are removed. The demand-binding phase (¶1 sentences 3–8) is also removed, although step 5 then states "demand, then fleet, then charging". This matters for B1.3, an Analyse objective. | Scratch dump of the L6 prose. | Restore ¶3 sentences 3–5, at least in condensed form, and ¶1 sentences 3–4. |
| W1F-F08 | Moderate | Figure 7b (`ControlRings`), L7 key term | MITRE's third category is misstated. R50 p.48 reads "elements of my environment that I do not control **or influence** but which influence me". The ring label reads "Influences AeroLink, beyond its control", and the key reads "what influences me?". The reviewed `w1-application` text says "beyond influence". Placing the airspace authority in this ring is therefore a new claim, although the caption says "only the placements the reviewed text states". The key term also says the questions are about "elements of your enterprise", but the third question is about the environment. | Source page R50 p.48 (read). | Use MITRE's exact wording on the ring and the key. Either leave the outer ring empty for students as well, or cite the reviewed sentence about providers being "mostly outside AeroLink's control" and label the placement as instructor judgement. Fix the key-term wording. |
| W1F-F09 | Moderate | Figure 1 vs L7 | The two sections contradict each other. Figure 1 puts the electric utility grid and the aircraft manufacturer outside the boundary of the "AeroLink service enterprise". L7 says the enterprise includes "the electric utility's grid connections … the manufacturers' delivery commitments". A careful graduate student will ask which is right. | Resolved L7 prose; `figure-l1-1.png`. | Add one bridging sentence in L7 or the Figure 1 caption: the Week 1 system of interest is *named* "service enterprise", while SEBoK's enterprise is wider and includes resources AeroLink does not own. |
| W1F-F10 | Moderate | `BRIDGE.spacing` | The bridge promises that "the Week 2 opener asks two Week 1 checks again (C2 and C5)". No Week 2 flow exists, and the blueprint §6 says this "needs a matching entry in the Week 2 blueprint". | grep across `src/`: no implementation. | Remove the sentence or mark it as planned until Week 2 implements it. |
| W1F-F11 | Moderate | Workload caution (≈ 8.7 h) | The 8.7 h figure is honestly flagged, but it is a lower bound. (1) Practice missions m1–m4 (10 + 15 + 15 + 20 = 60 min) are not itemised anywhere; "explorer work is counted with the memo" pushes m1 and m2 into a 1.2 h row that already contains 0.4 h of reading, leaving ≈ 0.4 h to write a graduate memo. (2) m2 repeats the L6 worked example, which the blueprint said "must not duplicate". (3) The test "the time plan is realistic" only sums the author's own minute estimates, so it is circular. The minute estimates themselves (≈ 2,489 words, 9 figures, 41 key terms, 7 checks and a worked input in ≈ 60 min) are plausible. | `missions/week01.ts` minutes; workload rows; `week01.test.ts` time-plan test. | State "≈ 8.7–9.2 h" or itemise m1–m4 in the caution. Make m2 the explorer-only part (no repeated arithmetic) or drop it. |
| W1F-F12 | Moderate | Figure 4a label and caption | Overclaim. The figure says "the shortfall exists **only** in the interactions". Most of the gap (24,000 → 8,640) comes from the capacity of six chargers. The reviewed text says "because they are coupled through…", with no "only". "If each flew alone" also ignores that each aircraft needs charging. | `SystemFigures.tsx:258`; `week01.ts:250`. | Use "because they are coupled through six shared chargers and riders' response to waiting". Consider a third bar for the charging ceiling (8,640) so the two causes are visible separately. |
| W1F-F13 | Moderate | `SectionCheckView`, `state.tsx`, `CheckSubmit` | After a wrong answer, the correct option is highlighted with its feedback. "Try again" then re-asks the same item in the same order, and `resetCheck` deletes the first attempt. As a result, "secure" status in Check & submit can be earned after the answer has been revealed. | `Learn.tsx:118,142–153`; `state.tsx` `resetCheck`. | Keep first-attempt correctness for objective status. On a wrong answer, show only the chosen option's feedback and reveal the key after a second attempt. |
| W1F-F14 | Moderate | Figure 5 (L5) visual | This is a first exposure to a causal-loop diagram, and it is visually tangled. Edge labels overlap ("+ (conditional)(conditional)"), "condition" is truncated near Capacity, and edges cross. R1 and B1 share one highlight colour, so a student cannot tell which arrows belong to which loop (Mayer: coherence, signalling). | `figure-l5-1.png`. | In L5, show a simplified static diagram with only the R1 and B1 nodes, using distinct colour plus line pattern per loop. Keep the full interactive diagram in Practice. |
| W1F-F15 | Minor | L5 counting rule, C5 cite | The parity rule is correct, but no register source states it. R03 p.270 only distinguishes negative from positive feedback (read). The check's "R03 p.270" cite implies source support. The earlier review (week01_review row 36) accepted the rule only as uncited. | R03 p.270. | Label it "course convention (standard system-dynamics practice)" or request a register entry. |
| W1F-F16 | Minor | L4 first paragraph | L4 opens with "Air-taxi service behaves the same way", which refers back to the jam paragraph. That paragraph appears only in the Overview, so the reference dangles. | Scratch dump of the L4 prose. | Prefix with `w1-intuition` ¶0, or add a one-line bridge. |
| W1F-F17 | Minor | L2 "In short" | "A boundary is right when the question can be answered inside it" reduces SEBoK's position (an ongoing process of attention; relevant elements that form a whole; "small enough to analyse") to a single test. It also clashes with the "Boundaries are also ethical" callout. | R02 p.264. | Use: "…is fit for purpose when it contains the causes behind your question yet stays small enough to analyse, and you revisit it as you learn." |
| W1F-F18 | Minor | L6 question and "In short" | "Ridership levels off below the charging ceiling" is a category error: the ceiling is measured in trips per month, not riders. | `week01.ts:360–361`. | Say "served trips". |
| W1F-F19 | Minor | L4 "In short" | "Hierarchies organise who controls whom" merges hierarchy (which reduces complexity and increases robustness) with *control* hierarchy (a feature of socio-technical systems). | R03 p.271. | "…complex systems form hierarchies; socio-technical ones form control hierarchies." |
| W1F-F20 | Minor | C3 option b feedback | "Relying on one mode alone gives insufficient understanding" is SEBoK's statement about holism and separation of concerns (R04 p.275). Here it is applied to MITRE's analysis and synthesis, which merges the two sources' terms (§7.7). | R04 p.275; R50 p.46. | Use MITRE's own point: both perspectives combined "in a single view". |
| W1F-F21 | Minor | Figure 7a | (1) "Mediate change" is drawn in all three phases, but the SEBoK example covers "changes that arise during system development and evolution" (R01 p.54). (2) The alt text says the arrows are labelled "change proposals and counter-proposals"; on the figure they are labelled "mediate change". | `figure-l7-1.png`; R01 p.54. | Limit mediation to development and evolution, or caption it as an extrapolation. Make the alt text match the drawn labels. |
| W1F-F22 | Minor | Figure 1 | The caption says "elements interact", but the four inner elements have no links between them. Weather is drawn with a two-headed exchange. Exchange labels collide with the boundary line. At 400 px the figure is clipped (`l1-400-light.png`). | Screenshots. | Draw 2–3 internal links (demand → fleet use → charging). Use a one-way arrow for weather. Add label padding. |
| W1F-F23 | Minor | Welcome | The page says what the subject is, but not where it starts. It never states assumed prior knowledge, such as whether SysML or MBSE experience is expected, or why the course starts from systems thinking before notation. "Systems engineering is the discipline that puts that habit to work" is new framing but carries no course-framing label. | `welcome.ts` "what". | Add two sentences labelled as course framing on the entry point and prerequisites, and label the SE sentence. |
| W1F-F24 | Minor | Bloom/SOLO and key-term alignment | L4 is labelled "Analyse", but its content and check are Understand level. The L3 key term "View" is not taught in the L3 prose. In the concept map, "Elements interact" points to L4, but L1 teaches it. | `week01.ts`. | Re-label L4 and its check. Move "View" to the principles panel. Point the concept-map node to L1. |
| W1F-F25 | Minor | Figure 6 text | The caption ("600", "8,640") and the chart labels ("600 per aircraft", "6 chargers") are typed in by hand. The file header promises numbers "computed … never retyped", and no test covers them. | `week01.ts:385`; `EngineeringFigures.tsx:54,59`. | Interpolate `TRIPS_PER_AIRCRAFT_MONTH`, `CHARGE_CAP_6` and `P.chargers`. |
| W1F-F26 | Minor | C6 distractors | "The 25th" matches no plausible error. | n/a | Use error-based distractors, such as "the 28th" (truncating 28.8) and "the 30th" (computing with 50 charges per day). |
| W1F-F27 | Minor | L6 order | The archetypes paragraph comes before the concrete capacity case, and the figure, worked example and check never use it (Merrill: demonstrate, then generalise). | `l6-1440x900-light.png`. | Move the archetypes after the worked example, next to "Two lessons generalise", which already cites Limits to Growth. |
| W1F-F28 | Minor | Opener Figure "Where is the jam?" | The cars are evenly spaced, with gaps about one car-length wide, so the drawing does not read as a jam. | `overview-1440x900-light.png`. | Close the gaps (bumper to bumper) and add brake lights or queue cues. |

## Verified correct

**Derived FICTIONAL numbers** (recomputed and tested):

| Item | Computation | Result |
|---|---|---|
| C6 | 12 × 48 × 30 = 17,280; 17,280 ÷ 600 = 28.8 | 29th aircraft; the model is fleet-limited at 28 and charging-limited at 29 (test) |
| F4a | 40 × 20 × 30 = 24,000 | month-60 served = 7,787.7 → "≈ 7,788"; 7,787.7 ÷ 40 ÷ 30 = 6.49 → "≈ 6.5" |
| F4a, my run | n/a | wait 20.3 min, utilisation 0.901, riders 2,596 (8.7 % of the market) |
| F6 crossover | 8,640 ÷ 600 = 14.4 | 15th aircraft (test) |
| Figure 1 state panel | month 0 | 300 riders, 12 aircraft, wait 2.29 min ("2.3") |

**C5 loop:** the loop chain is built from `LOOP_LINKS`. B2 has 3 negative links (wait → attractiveness, attractiveness → churn, churn → riders), so it is balancing. This is tested, with an R1 mutation.

**Key position:** after the per-section rotation the keys fall at D, A, B, C, D, A, B for C1–C7, so position gives no cue.

**Gating** (as specified):
- "Mark as read" stays disabled until the check is answered.
- Practice shows the Locked screen until all seven sections are read (instructor mode bypasses).
- The stage bar shows a lock icon.
- The opener prediction is recorded once and locked under mission m1's key.

**"Read more" mappings** (every page read and confirmed):

| Reading and pages | Content confirmed |
|---|---|
| R03 pp.268–269 | wholeness, open system, state, event, state variables |
| R02 p.264 | system of interest, systemic resolution, Churchman, system context |
| R02 p.266 | the systems-thinking paradox, encapsulation and separation of concerns, skill and judgement |
| R04 pp.273–275 | separation of concerns, the principles table, the holism and separation-of-concerns duality |
| R50 pp.46–47 | analysis and synthesis, the UAV example |
| R03 p.271 | synergy, reducing variety, Simon hierarchy, control hierarchy |
| R03 p.270 | negative and positive feedback |
| R05 pp.283–284 | Limits to Growth, Balancing Process with Delay, Growth and Underinvestment, leverage far from the problem, Attractiveness Principle |
| R01 pp.52–54 | INCOSE definition, sequential vs revised definition, phases, agents, change mediation |
| R07 p.815 | enterprise definition, enterprise vs organisation |
| R50 p.48 | MITRE's four questions |
| R28 p.370 (welcome) | MBSE paradigm, document-based contrast, "single source of truth"; the paraphrase is faithful |

Every citation is inside its register range (test).

**Accuracy of new text:** key-term definitions match their sources, except where findings F08 and F19 say otherwise. Checked terms: system, element, boundary (R04 p.274), state and event (R03 p.269), separation of concerns, holism, analysis and synthesis, emergence, synergy and reducing variety, control hierarchy, polarity, the archetypes (R05), enterprise (R07), mediation (R01 p.54), engineered system.

**Sound checks:** C3 (an analysis/synthesis scenario) and C6 (a near-transfer calculation) are genuine understanding checks. The C7 cite, R01 p.53, is correct.

**Welcome facts:** five checkpoints (CP1–CP5 in W3, W6, W8, W11, W14) and two exams (W7, W13) match `course.ts`. 75-minute studio and lab sessions match the course framing.

**Overview** covers all the opener elements:
- the hook, the driving question and prior knowledge;
- the locked prediction;
- "What you will learn" (L1–L7 with minutes);
- "By the end of the week you will be able to", with Bloom levels;
- assessment, including the lab record, memo weight and rubric scope;
- the time plan.

**Workload arithmetic:**
- The reviewed rows are unchanged and sum to 8.0 h.
- Only the online-instruction row is relabelled.
- The caution's 8.0 − 0.3 + 1.0 = 8.7 is correct.
- Faculty decision D1 is honestly reported as open.

**Word budgets:** Learn prose totals 2,489 words, and every section is under its `maxWords`.
