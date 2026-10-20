# Week 1 learning design: blueprint (v1, 2026-10-12; rebuilt 2026-10-18, see §10)

> **2026-10-18:** Week 1 was rebuilt for the whiteboard subject *Team Formation / Needs / Identifying Stakeholders*. §10 describes the rebuilt week and governs wherever §§1–9 (the systems-thinking design) differ.

**Status.** Proposal, now implemented as a prototype for faculty review (2026-10-12): `/welcome`, and `/week/1` as the four-stage flow (`src/flow/`, `src/content/learn/`, `src/components/figures/`); the old page stays at `/week/1/classic`. Every new text item carries `review: 'new-pending-review'`. The open faculty decisions are in §8; they are **not** decided by the build. Deviations from this blueprint, on the lead's instruction or found during the build:
- **D1 not applied.** Readings stay as reviewed (R01, R02, R04, R50 at 1 h; extension R03, R05 unchanged) and every reviewed workload row is kept, so the total stays 8.0 h. Only the online-instruction row is relabelled to say the Learn stage realistically takes ≈ 1.0 h against its 0.3 h budget; a caution states the realistic week total, ≈ 8.7 h. Each Learn section has a "Read more" to the exact reading pages that deepen it (opens `/sources/:id/:pages`).
- C6 asks when charging becomes "the resource that limits capacity" (the reviewed table's term), not "the binding resource", since binding also depends on demand.
- The Bridge to Week 2 closes the Check & submit stage (§6 order); the Learn summary ends with the step into Practice.
- Section-check options are shown in a fixed per-section rotation, so the keyed answer is not always first.
- The control-hierarchy, L3 synthesis and L7 figures draw only what the reviewed text states (the two wider systems in L3 overlap rather than nest).
- **Revised after the flow review of 2026-10-12** (`_source_cache/review/week01_flow_review.md`, REVISE, W1F-F01 to W1F-F28). The following changed: checks C1, C2, C4, C5 and C7; Figures 1, 4a, 5, 6, 7a and 7b and the opener figure; the L6 section order; the L7 enterprise text; the check-retry logic; and the workload statement. Where §§2–6 below still show the original items, §9 **Review dispositions** governs.

**Framework.** The framework comes from `../../../_source_cache/research/teaching_methods_research.md` §2:
- **backward design** for alignment;
- **Gagné's nine events** for the order of the week;
- **Merrill's demonstrate-then-apply** cycle inside each topic;
- **Mayer's principles** for each visual;
- **retrieval practice** for the checks.

**Weekly flow.** The flow is the one already decided: Overview → Learn (short sections, each ending in a check) → Practice → Check & submit.

**Accuracy (AUTHORING_GUIDE §2).**
- Explanations reuse the reviewed paragraphs of `src/content/week1.ts` and `src/content/weeks/week01.ts`, referenced by block id and paragraph index rather than copied.
- Text marked **NEW** below is plain-language bridging or a new check question. It is instructor-authored, carries no new factual claims, and needs review.
- Every AeroLink number is **FICTIONAL** and comes from the reviewed text or from `src/sim/aerolink.ts`.
- One new derived number (in L6) needs a test assertion before it ships.

---

## 1. Backward design: the alignment for Week 1 (stages 1 and 2)

| Objective (course.ts) | In plain words: "By the end of this week you can…" | Bloom | SOLO target | Learn | Practice (missions) | Assessment |
|---|---|---|---|---|---|---|
| B1.1 Define system, SoI, boundary, environment, emergence, enterprise | …explain these six terms and use them correctly about AeroLink | Understand | multistructural → relational | L1, L2, L3, L4, L7 | m3 boundary | Q1 q1-1, q1-3, q1-10; L1 RB-1.1 |
| B1.2 Construct a context diagram and two causal loops | …draw a context diagram and one reinforcing plus one balancing loop, and prove each loop's type | Apply | relational | L2, L5 | m3, m4, m5 (soi, context, loops) | Q1 q1-4, q1-5, q1-6; L1 RB-1.1 |
| B1.3 Explain one emergent behaviour causally | …explain *why* AeroLink's ridership levels off (or its fleet over-builds) from the loop structure, not from any one part | Analyse | relational (memo: extended abstract) | L4, L5, L6 | m1, m2, m5 (emergent) | Q1 q1-7, q1-8, q1-9; L1 and memo RB-1.4 |
| B1.4 Describe what SE contributes across a life cycle | …describe how a systems engineer mediates change between owners and developers over the life cycle | Understand | relational | L7 | (memo §5) | Q1 q1-2 |
| Graduate | …identify and defend a leverage point with explorer evidence | Evaluate | extended abstract | L6, L7 | m1, m2 | memo (RB-1.4, RB-16, RB-12) |

---

## 2. Word and time budget

| Section | Words (maximum) | Student time |
|---|---|---|
| 0 Course welcome (once, course-level page) | 450 | 5 min |
| 1 Week opener | 350 | 4 min (+1 min prediction) |
| L1 What a system is | 350 | 5 min |
| L2 System of interest, boundary and context | 550 | 8 min |
| L3 Two ways to handle complexity | 550 | 8 min |
| L4 Emergence and hierarchy | 450 | 6 min |
| L5 Feedback loops and polarity | 500 | 8 min |
| L6 Binding constraints, archetypes and leverage | 800 (was 650; W1F-F06, F07) | 12 min (was 10) |
| L7 What SE contributes, and what the enterprise is | 700 (was 550; W1F-F05, F09) | 8 min (was 7) |
| 3 Summary | 200 | 3 min |
| 4/5/6 Practice, assessment and bridge headers | 400 | 2 min |
| **Total** | **≤ 5,000** | **≈ 1 h** (reading at about 180 words a minute, plus 7 checks and the figures) |

The word limits count student-facing prose only. Figure labels, key-term lists and check options are not counted. Anything above a limit moves to **"Go deeper"**, which is the existing Reference drawer and keeps the reviewed blocks intact.

**Workload: the total stays at 8.0 h.** The reviewed workload counts only 0.3 h for "online direct instruction", so a 1 h lesson does not fit unless 0.7 h is moved from other lines. Decision D1 in §8 sets out the options. The recommended reallocation is:

| Line (week01.ts `workload`) | Reviewed | Proposed |
|---|---|---|
| In-class sessions (2 × 75 min) | 2.5 | 2.5 |
| Online direct instruction | 0.3 | **1.0** |
| Readings R01, R02, R04, R50 | 1.0 | **0.5**: read the cited pages at the point of each Learn section; the rest becomes reference |
| Readiness quiz Q1 | 0.2 | 0.2 |
| L1 completion and charter | 2.5 | **2.3**: missions m3 and m4 are done individually during Learn and Practice |
| Graduate memo and explorer | 1.2 | 1.2 |
| Notebook, time log, AI statement | 0.3 | 0.3 |
| **Total** | **8.0** | **8.0** |

---

## 3. Section 0: Course welcome ("where this subject starts")

Shown once, before Week 1, on a new course-level page `/welcome`. Week 1's Overview links to it, and so does the Dashboard until a student dismisses it. The page has five blocks, each with at most about 90 words:

1. **What this subject is.**
   - Systems thinking: seeing a problem as interacting parts, boundaries and feedback.
   - Systems engineering: the R01 p.52 quote that is already reviewed, reused from `w1-se.quote`.
   - MBSE: an engineering model, not a stack of documents, becomes the shared source of truth.
   - **Accuracy:** the MBSE sentence is NEW. Before it ships it needs a citation from the Week 9 readings (R28; the lead must confirm the pages), or it must be labelled instructor framing.
2. **Why engineers need it.** One paragraph built on syllabus §1, "Academic purpose": explain *why* the model is structured as it is, *what evidence* supports each decision, and *what would change* if an assumption failed. This is the course's own framing (marked [REC]), so it is labelled as such.
3. **The AeroLink case.** A FICTIONAL urban air-taxi operator.
   - Teams carry one enterprise from an ambiguous problem to a SysML v2 model.
   - Link to the Case study workspace and the Data Sheet.
   - Visual: the existing case hero or Data Sheet card (`pages/CaseStudy.tsx`). No new numbers.
4. **The 14-week map.** Visual: a horizontal two-part timeline built from `PARTS` and `WEEKS[].title` in `course.ts`.
   - Part I, Weeks 1–7, is Systems Thinking and SE. Part II, Weeks 8–14, is MBSE with SysML v2.
   - Checkpoints CP1–CP5 are pinned at Weeks 3, 6, 8, 11 and 14. Exams sit at Weeks 7 and 13.
   - Week 1 is highlighted.
   - Reuse `workbench/shell/CourseMapDialog.tsx` as a static, embedded rendering.
   - Text alternative: an ordered list of the weeks.
5. **How a week works.** A four-step strip: Overview → Learn → Practice → Check & submit. One line each, plus the two live sessions: concept studio and lab (syllabus §9). It also says that checks are ungraded, and that the quiz, lab and memo are where the feedback that counts comes from.

---

## 4. Section 1: Week 1 opener (Overview screen)

Gagné events 1–3; BOPPPS Bridge-in, Objectives and Pre-assessment.

1. **Hook** (NEW framing; 60 words). The traffic-jam picture from `w1-intuition` para 1, condensed, followed by the driving question `WEEK1_INTRO.question`.
   - Visual: a static illustration of a jam with one car magnified and the caption "the jam is not in here".
   - New static SVG with alt text.
2. **Prediction (pre-assessment).** The four options of `tryFirstPrediction` from `missions/week01.ts`.
   - The prediction is recorded under the **same answer key** that mission `w1-m1-try`, step `predict`, already uses, so the mission finds it already done (decision D3).
   - It is locked and has no penalty.
3. **What you will learn.** Seven Learn titles (L1–L7), each with a one-line teaser and a time estimate.
4. **What you will be able to do.** The plain-words column of §1 with the Bloom level as a chip.
   - The objective IDs B1.1–B1.4 sit in small mono text.
   - The graduate expectation is listed last.
5. **How you will be assessed.**
   - Section checks (ungraded).
   - Readiness quiz Q1 (10 items, formative).
   - L1 team record (RB-1.1, RB-1.4, formative).
   - Individual leverage-point memo (RB-1.4; filed as review-notebook entry 1 under RB-16, 5 %; RB-12 for the AI statement).
   - Wording comes from `week01.assignment.weight` and `rubricScope`.
6. **Time plan.** The proposed workload table (§2) as a checklist, and the due date "before the first session of Week 2".
7. **Connect to prior knowledge** (Gagné 3; NEW; 40 words). "You already reason about systems: a commute, a supply chain, a project team. This week gives those intuitions names and rules."

---

## 5. Section 2: Learn sections (Gagné 4–7; Merrill demonstration)

Every section uses the same template, implemented once:
- the **question** it answers (one line);
- a **plain explanation** (reused paragraphs plus NEW bridges);
- **one figure** (Mayer: labels on the figure, only the elements in play highlighted, alt text and a text equivalent);
- a **worked example** where listed;
- **key terms** (term, then a one-line definition in context; these feed the glossary);
- a **check** (one item with per-option feedback; it may be answered before reading, which protects expert learners);
- **source** chips (`Citations`);
- **"Go deeper"**, linking to the full reviewed block in the Reference drawer.

Sections are ordered so that prerequisites come first: you need *system*, then *boundary*, then *interaction*, then *loop*, then *constraint*, then *who controls it*.

### L1 What a system is (B1.1; Understand)
- **Question:** what makes something a system, and why is AeroLink an *open* one?
- **Explanation:**
  - `w1-emergence` para 1: wholeness, interaction as the key concept, open system.
  - `w1-emergence` para 2: state, state variables, event.
  - NEW bridge (40 words): AeroLink's state variables in the explorer are riders, fleet, chargers and wait. These are names only, taken from `LOOP_NODES`.
- **Figure F1 ("open system")**: static SVG.
  - A rounded boundary labelled "AeroLink service enterprise". Inside it: fleet, chargers, operations centre, demand.
  - Outside it: EXT-001 Air navigation service provider, EXT-002 Electric utility grid, EXT-003 Weather, EXT-004 Aircraft manufacturer, EXT-005 Public transport network, EXT-006 Emergency services. These come from `src/model/reference/week01.ts`.
  - Arrows cross the boundary. Short labels (power, data, passengers, approvals) are taken from L1 step 2.
  - A small "state" gauge shows riders, fleet and wait.
  - Component: new `figures/OpenSystemFigure.tsx`. Its data comes from the reference model, so it is not hard-coded.
- **Key terms:** system, element, boundary, environment, open system, state, event.
- **Check C1 (NEW; Understand; SOLO multistructural).** "In SEBoK's sense, what makes AeroLink an *open* system?"
  - (a) ✓ It is defined both by the interactions among its elements inside the boundary and by its interactions with systems in its environment.
  - (b) Its design documents are public.
  - (c) It has no fixed boundary.
  - (d) It has many elements.
  - Feedback is paraphrased from `w1-emergence` para 1.
- **Source:** R03 pp.268–271.

### L2 System of interest, boundary and context (B1.1, B1.2; Understand → Apply)
- **Question:** who decides where the system stops, and how do you know the boundary is right?
- **Explanation:**
  - `w1-soi` paras 1–2: observers draw boundaries, systemic resolution, context.
  - `w1-soi` para 3: the ethics of boundaries, shown as a call-out.
- **Worked example:** `w1-worked`, three candidate SoIs, shown as a step-through. Merrill's demonstration happens here.
- **Figure F2 ("three boundaries")**: interactive, three nested boundaries on one drawing.
  - (A) aircraft; (B) flight operations (fleet, dispatch, schedule); (C) service enterprise (adds vertiports and charging, operations centre, demand).
  - A three-position toggle highlights one boundary at a time and shows the matching bullet from `w1-worked`.
  - A "waiting time" token visibly lies **outside** A, **partly** inside B (its charging cause is outside), and **inside** C.
  - Synthesis ring: the urban transport and airspace systems are drawn as environment (bullet 4).
  - Component: new `figures/BoundaryLayers.tsx`. It must work with the keyboard; the toggle is a radio group.
- **Key terms:** system of interest (SoI), systemic resolution, system context, reductionism vs holism.
- **Check C2 (NEW; Apply; SOLO relational).** "For the driving question a team picks SoI = flight operations (fleet, dispatch, schedule). What is the main risk?"
  - (a) ✓ Charging and pad capacity are treated as fixed environment, so the answer will be optimistic if they are the real constraint.
  - (b) Waiting time lies wholly outside the boundary.
  - (c) The boundary is too wide to analyse.
  - (d) There is no risk; fleet size is the decision variable.
  - Feedback comes from `w1-worked` bullets 1–3. This deliberately differs from quiz q1-6.
- **Source:** R02 p.264; R50 pp.46–47.

### L3 Two ways to handle complexity: holism and separation of concerns, analysis and synthesis (B1.1; Understand)
- **Question:** if you can never consider everything, how do engineers proceed?
- **Explanation:**
  - `w1-paradox` paras 1–3: the paradox, encapsulation, and the duality of holism and separation of concerns.
  - `w1-analysis-synthesis` paras 1–2.
  - NEW bridge (30 words): "Analysis tells you how AeroLink works; synthesis tells you why it is what it is."
- **Figure F3 ("down and up")**: static two-panel SVG, with the panels placed side by side (spatial contiguity).
  - Left, **analysis**: a tree from "AeroLink service enterprise" down to fleet, chargers and operations centre.
  - Right, **synthesis**: AeroLink drawn *inside* "urban transport system" and "shared airspace system", following the `w1-worked` synthesis bullet.
  - Arrows are labelled "how does it work?" and "why is it what it is?".
  - Below the figure, the existing **Principles explorer** (`PrinciplesView` / `PrinciplesExplorer`) shows the eight principles collapsed, with Holism and Separation of concerns expanded (signalling).
- **Key terms:** systems-thinking paradox, encapsulation, separation of concerns, holism, analysis, synthesis, view.
- **Check C3 (NEW; Understand; SOLO relational).** "Engineer A decomposes AeroLink into fleet, chargers and operations centre and explains each. Engineer B asks which larger system AeroLink serves and explains its design from that role. Which is right?"
  - (a) ✓ A is doing analysis and B synthesis; both are needed.
  - (b) Only A is doing systems engineering.
  - (c) Both are doing analysis at different levels of detail.
  - (d) B's approach replaces A's once the boundary is fixed.
- **Source:** R02 p.266; R04 pp.273–275; R50 pp.46–47.

### L4 Emergence and hierarchy (B1.1, B1.3; Understand → Analyse)
- **Question:** why can the whole do more, or *less*, than its parts?
- **Explanation:**
  - `w1-intuition` para 2: waiting time is not a property of any element.
  - `w1-emergence` para 3: synergy vs reducing variety; the 40-aircraft example.
  - `w1-emergence` para 4: hierarchy and control hierarchy.
- **Figure F4a ("less than the sum")**: static two-bar comparison.
  - Bar 1: 40 aircraft × 20 trips/day × 30 days, which is about 24,000 trips a month if each aircraft flew alone. (This equals the reviewed table row "40 → 24,000 fleet capacity".)
  - Bar 2: about 7,800 trips a month delivered (`w1-emergence` para 3).
  - Annotation: "≈ 6.5 trips per aircraft per day: the shortfall exists only in the interactions (shared chargers, riders' response to waiting)".
  - Follow the dataviz skill. Values are labelled FICTIONAL.
- **Figure F4b ("control hierarchy")**: three stacked boxes, airspace authority → operations centre → dispatch, with arrows labelled "constrains" and "controls". The labels come from `w1-emergence` para 4.
- **Key terms:** emergence, synergy (weak emergence), reducing variety, hierarchy, encapsulation, control hierarchy.
- **Check C4 (NEW; Understand; SOLO unistructural → relational).** "Which AeroLink element owns average passenger waiting time?"
  - (a) ✓ None: it emerges from how demand, fleet, charging and turnaround interact.
  - (b) The aircraft.
  - (c) The chargers.
  - (d) The operations centre, because it dispatches.
  - Feedback comes from `w1-intuition` para 2 and the Holism principle (R04 p.274).
- **Source:** R03 pp.268–271.

### L5 Feedback loops and polarity (B1.2; Apply)
- **Question:** how do you read a causal-loop diagram, and how do you tell a reinforcing loop from a balancing one?
- **Explanation:**
  - `w1-feedback` para 1: negative and positive feedback, which are balancing and reinforcing loops.
  - `w1-feedback` para 5: polarity is local, with all other inputs held constant; links can be conditional.
  - NEW rule box (35 words, drawn from misconception 5 in `week01.ts`): "Count the negative links. Even (including zero) → reinforcing. Odd → balancing. The variable names never decide it."
- **Worked example (NEW layout, reviewed data):** loop **B1, waiting deters adoption**. The links and polarities come from `causalLoops.ts` `LOOP_LINKS`:
  - riders →(+) trip demand →(+) utilisation →(+) waiting time →(−) attractiveness →(+) adoption →(+) riders.
  - One negative link, so the loop is balancing.
  - Shown as a step-through that highlights each link in turn.
- **Figure F5:** the existing **`CausalLoopDiagram`**. The selection highlights only R1 and B1 (`selectedId`), with the text equivalent collapsed (`collapseText`). The other loops are dimmed (signalling). This needs an optional `highlightLoops` prop, which is a small addition and not a rewrite.
- **Key terms:** causal link, polarity, reinforcing loop (R), balancing loop (B), conditional link, dominant loop.
- **Check C5 (NEW; Apply; SOLO relational).** "Loop B2: riders →(+) demand →(+) utilisation →(+) wait →(−) attractiveness →(−) churn →(−) riders. Classify it."
  - (a) ✓ Balancing: three negative links, an odd number.
  - (b) Reinforcing: three negatives "cancel out".
  - (c) Reinforcing: most links are positive.
  - (d) Balancing, because churn is bad.
  - The polarities come from `LOOP_LINKS`, and B2 is listed as Balancing in `causalLoops.ts`.
- **Source:** R03 p.270.

### L6 Binding constraints, archetypes and leverage (B1.3; Apply → Analyse)
- **Question:** why does adding aircraft stop helping, and why does ridership level off *below* the ceiling?
- **Explanation:**
  - `w1-feedback` para 2: three archetypes.
  - `w1-feedback` para 3: what the explorer's model contains, condensed to its loop list.
  - `w1-feedback` para 4: what the model does and does not contain.
- **Worked example:** `w1-worked-capacity` paras 1–5 and its table, presented as faded steps.
  - (1) Fleet capacity, shown worked.
  - (2) Charging capacity, shown worked.
  - (3) Crossover fleet: the student enters 14.4 and gets feedback.
  - (4) Plateau explanation, shown worked.
  - (5) The two generalisable lessons.
  - Steps 1–5 mirror mission m2, so Learn shows the reasoning and m2 makes the student do it in the explorer. They must not duplicate each other. The Learn version is read-only, with one input.
- **Figure F6 ("capacity crossover")**: new static chart.
  - x-axis: aircraft from 10 to 40. Fleet capacity rises by 600 trips per aircraft, starting at 7,200 with 12 aircraft. Charging capacity is flat at 8,640.
  - The crossover at 14.4 aircraft is marked. A dashed line at about 7,788 is labelled "plateau (churn loop)".
  - The data are the five table rows in `w1-worked-capacity`, plus the line equations already stated in para 2.
  - Underneath, a "Run it" button opens the Dynamics view with the scenario "Fleet grows, charging does not". This links to Practice; there is no inline explorer, which keeps the section coherent.
- **Key terms:** binding constraint, capacity (the smaller of fleet and charging capacity), crossover, plateau, Limits to Growth, Balancing Process with Delay, leverage point.
- **Check C6 (NEW; Apply; SOLO relational).** "Policy (c) in the explorer raises the initial chargers from 6 to 12, with the other parameters unchanged. From which aircraft does charging become the binding resource?"
  - (a) ✓ The 29th: 12 × 48 × 30 = 17,280 trips per month, and 17,280 ÷ 600 = 28.8.
  - (b) The 15th.
  - (c) The 25th.
  - (d) Never.
  - **These are derived FICTIONAL numbers.** Before shipping, add a pure arithmetic assertion next to the existing capacity tests in `aerolink.test.ts` (D5).
- **Source:** R05 pp.283–284.

### L7 What SE contributes, and what the enterprise is (B1.4, B1.1; Understand)
- **Question:** what does a systems engineer actually add, and to whose system?
- **Explanation:**
  - `w1-se` paras 1–2 and the quote.
  - `w1-lifecycle` paras 1–3: from a sequential to a concurrent definition; three phases and three agents; the change-mediation example.
  - `w1-lifecycle` paras 4–5: the enterprise is not the organisation.
  - `w1-application` paras 1–2: leverage far from the symptom; control, influence, and influence without control.
- **Figure F7a ("life cycle and agents")**: static SVG.
  - Three phase columns: system definition; initial operational capability development; system evolution and retirement.
  - Three agent lanes: external bodies (users, owners, external systems); systems engineers; developers.
  - Two-way arrows "change proposals ⇄ counter-proposals" run through the SE lane. All labels come from `w1-lifecycle` paras 2–3.
- **Figure F7b ("control, influence, beyond")**: three concentric rings, labelled from R50 p.48 as paraphrased in `w1-lifecycle` para 4.
  - It is pre-filled **only** with placements the reviewed text states: the operations centre controls dispatch (control); the airspace authority constrains the operations centre (outside AeroLink's control).
  - The middle ring is left empty, with the prompt "you decide in your memo §5". That keeps out unreviewed claims, and the memo is where students make the argument.
- **Key terms:** engineered system, life cycle, enterprise (vs organisation), mediation, control / influence / influenced-by.
- **Check C7 (NEW; Understand; SOLO relational).** "A colleague says SE means writing the requirements, then designing, then testing, in that order. How does SEBoK's revised view differ?"
  - (a) ✓ It emphasises holistic, concurrent work (understanding needs, exploring opportunities, requirements, synthesis, verification, validation, evolution) across the whole life cycle, from concept to disposal.
  - (b) It reverses the order, testing first.
  - (c) It limits SE to the design phase.
  - (d) It is the same, but with more documentation.
  - Feedback comes from `w1-lifecycle` para 1. This deliberately differs from quiz q1-2, which is about change mediation.
- **Source:** R01 pp.51–54; R07 p.815; R50 p.48; R05 p.283.

---

## 6. Sections 3–6

### 3. Summary and consolidation (Gagné 9; BOPPPS Summary; 200 words)
- **Figure F8 ("Week 1 concept map")**: static SVG with a nested-list text alternative.
  - **The chain:** system → SoI and boundary (context: EXT-001…006) → elements interact → feedback loops (R/B, polarity rule) → emergent behaviour (plateau below the ceiling; reducing variety) → binding constraint and archetype → leverage point → who controls it (the enterprise is wider than the company) → SE mediates change across the life cycle.
  - **Side nodes** "holism ⇄ separation of concerns" and "analysis ⇄ synthesis" attach to the SoI node.
  - Each node links back to its Learn section.
- **Three-sentence recap** (NEW): one sentence each on structure, behaviour, and judgement.
- **Self-rating:** "Which of the four objectives can you now do?" Four checkboxes, stored per viewer and used only to recommend which section to revisit.

### 4. Practice (Gagné 6–7; faded worked examples)
Use the existing workbench missions from `src/content/missions/week01.ts` unchanged. The Practice screen lists them with time estimates and the objective each one serves:

| Order | Mission | Kind | Min | Objective | Prerequisite Learn |
|---|---|---|---|---|---|
| 1 | `w1-m1-try`: will more aircraft cut waiting? (prediction already recorded in the opener) | try | 10 | B1.3 | L5, L6 |
| 2 | `w1-m2-worked`: where is the binding constraint? | worked | 15 | B1.3 | L6 |
| 3 | `w1-m3-boundary`: a boundary fit for the question | guided | per module | B1.1, B1.2 | L2 |
| 4 | `w1-m4-loops`: one reinforcing and one balancing loop | guided | per module | B1.2 | L5 |
| 5 | `w1-m5-l1`: Lab L1 record (team; Session 2) | own | 75 (in class) | B1.1–B1.3 | all |

Each mission step's `readMore` already resolves to a reviewed block. Point it to the matching **Learn section** instead, with a fallback to the block. Principles explorer and Stakeholders stay available as views.

### 5. Assessment (Gagné 8)
- **Recall: Readiness quiz Q1.** This is `w1-m6-recall` / `WEEK1_QUIZ`, ten items: B1.1 → q1-1, q1-3, q1-10; B1.2 → q1-4, q1-5, q1-6; B1.3 → q1-7, q1-8, q1-9; B1.4 → q1-2. Shown after Practice, with per-option feedback, formative.
- **L1 team record:** RB-1.1 and the causal-argument clause of RB-1.4.
- **Individual leverage-point memo:** RB-1.4, then filed as review-notebook entry 1 (RB-16, 5 %), plus the RB-12 AI statement. The six-heading template comes from `week01.assignment.template`.
- **"Check & submit" screen:** shows per-objective status, using section checks plus quiz items tagged by objective, and links each weak objective back to its Learn section. Section checks never count towards a grade.

### 6. Bridge to Week 2 (Gagné 9; spacing; 100 words, NEW)
- **Continuity:** "Your ENT-001 and EXT list become the context for the Week 2 stakeholder map. Each EXT that is an organisation reappears as a stakeholder." This sentence comes from `lab.continuity`.
- **Forward question:** "Who controls your leverage point?" This comes from `w1-application`.
- **Spacing:** the Week 2 opener re-asks C2 and C5, a spaced retrieval of two Week 1 checks. This needs a matching entry in the Week 2 blueprint.

---

## 7. Implementation notes (for the developer)

1. **Data shape.** Add `src/content/learn/week01.ts`, exporting `LearnSection[]`:
   ```ts
   type LearnSection = {
     id: string; title: string; question: string; objectives: string[]; bloom: Bloom; solo: string; maxWords: number
     body: ({ ref: { block: string; para: number } } | { text: string; provenance: 'instructor-authored'; review: 'pending' })[]
     figure: { component: string; props?: Record<string, unknown>; alt: string; textEquivalent: string }
     worked?: { block: string; fadedSteps?: number[] }
     keyTerms: { term: string; def: string }[]
     check: QuizQuestion   // reuse schema type; every NEW item carries review: 'pending'
     cite: Citation[]; goDeeper: string[]   // block ids
   }
   ```
   `ref` resolves at build time from `WEEK1_BLOCKS` and the extra blocks in `weeks/week01.ts`, the way the missions already cut text with `sentences(...)`. Reviewed text is never duplicated.
2. **New components.** All go under `src/components/figures/`: `OpenSystemFigure`, `BoundaryLayers`, `DownAndUp`, `LessThanSum`, `ControlHierarchy`, `CapacityCrossover`, `LifeCycleAgents`, `ControlRings`, `ConceptMap`, `CourseTimeline`.
   - All are static SVG or React. They use theme tokens, work in both themes, meet WCAG 2.1 AA, and respect reduced motion.
   - Each has a text equivalent, and each takes its data from the content or reference model.
3. **Reused components.** `CausalLoopDiagram` (adds an optional `highlightLoops`), `PrinciplesView`, `CourseMapDialog` content, `Quiz` (for single checks), `Citations`, and the Reference drawer.
4. **Content tests.** Add these to `content.test.ts` or a sibling test:
   - each section stays within `maxWords`, and the total is ≤ 5,000;
   - every section has a figure with non-empty `alt` and `textEquivalent`;
   - every section has exactly one check and at least one citation inside the register range;
   - every `ref` resolves;
   - every objective B1.1–B1.4 is covered by at least one section and at least one assessment item (the alignment table in §1, asserted);
   - the workload total equals 8.0.
5. **Out of scope.** No change to mission logic, the quiz items, the lab, the memo, or the dynamics model. The only exceptions are the extra assertion D5 and the shared prediction key D3.

---

## 8. Decisions the faculty owner must make

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Where the extra 0.7 h for a 1 h lesson comes from, within the 8.0 h total | (a) the reallocation in §2: readings 1.0 → 0.5, L1 out of class 2.5 → 2.3; (b) keep the reviewed lines and cap the lesson at about 1,800 words (0.3 h), with the rest under "Go deeper"; (c) let the total exceed 8 h (not allowed by the brief) | (a) |
| D2 | Audience level | The syllabus (§2) targets upper-division undergraduates with a graduate extension; this brief says graduate | Confirm graduate. If confirmed, the graduate task becomes core and checks stay at Apply/Analyse |
| D3 | Prediction placement | In the opener, sharing mission m1's key, versus first step of Practice | Opener (pre-assessment before explanation; 1 minute) |
| D4 | Approve the 7 NEW check questions (C1–C7) and the NEW bridging text | — | Independent review pass, as for W1-F / W1-R |
| D5 | The derived numbers in C6 (17,280; 28.8 → 29th aircraft) | Approve and add a test assertion, or swap in a non-numeric check | Approve and assert |
| D6 | The MBSE definition on the welcome page | Cite from the Week 9 readings (the lead confirms the pages) or label it instructor framing | Cite |
| D7 | Delivery mode | Fully online versus hybrid (syllabus: two 75-min sessions plus about 30 min online) | Keep hybrid. The Learn sections become the pre-class lesson, and Session 1's "formal concepts" segment becomes discussion of check results |

---

## 9. Review dispositions (flow review of 2026-10-12, W1F-F01 to W1F-F28)

Every finding is fixed as the review specified unless its row says otherwise. Evidence is the test or file named in each row.

Source pages re-read for this pass with `python -I scripts/source_pages.py`:
- R50 p.48
- R03 pp.270–271
- R01 p.54
- R07 p.815
- R02 p.264
- R04 p.275
- R50 pp.46–47

Syllabus §2 was read for the welcome prerequisites.

| ID | Disposition | Evidence |
|---|---|---|
| F01 | **Fixed.** C1, C2, C4 and C7 are now new AeroLink cases:<br>• C1: is the operations centre alone open or closed, and why?<br>• C2: a fourth boundary (the charging network), and what it can answer.<br>• C4: on-time departures, a different emergent property.<br>• C7: a late-redesign scenario on the revised definition. It is not about mediation, because quiz q1-2 already tests that.<br>Keyed options are within 30 % of the mean distractor length.<br>Labels:<br>• C1: Understand / multistructural. Classifying is an Understand process in the revised taxonomy.<br>• C2: Apply / relational. The student applies the worked example's boundary test to a new boundary.<br>• C4 and C7: Understand / relational. | `week01.test.ts`:<br>• No keyed option shares 8 or more consecutive words with its section's prose, captions, alt text, text equivalents or key terms. The old C1 key fails this test.<br>• A length-cue test, which the old C7 options fail. |
| F02 | **Fixed.** C5 now asks about "loop X", which the model does not contain. Loop X is flights → noise complaints → community acceptance → permitted operating hours: the chain from the instructor notes, with polarities added. The prompt names no loop type. Figure 5 now shows only R1 and B1. Option d is now a wrong type with a wrong reason ("Neither"). The prompt asks for the type and the reason. | C5 test:<br>• the prompt has no R/B labels or loop-type words;<br>• it contains exactly one (−);<br>• no distractor starts with "Balancing";<br>• Figure 5's text does not mention B2, churn or noise. |
| F03 | **Fixed.** Figure 6 hides the crossover marker and its label until the student answers the faded step. Until then, the alt text and text equivalent use `preReveal` versions without the crossover.<br>**15 was decided deliberately.** The prompt now asks where the capacities are *equal*, so 14.4 (± 0.05) is correct. An answer of 15 gets a "Close" message that explains the difference, but it is not marked correct.<br>Mission m2 is out of scope and still accepts 15. Its question asks when charging "takes over", where 15 is defensible. | L6 test: neither 14.4 nor "15th" appears before the answer.<br>e2e: `crossover-marker` is absent, then present.<br>Screenshots `figure-l6-1.png` and `figure-l6-1-revealed.png`. |
| F04 | **Fixed.** A third series replaces the constant plateau line: trips served at month 60 with the fleet held at each size. It is `SERVED_FROZEN`, computed from `simulate`. | Test:<br>• each plotted value is ≤ min(fleet, charging) capacity;<br>• the values at 10, 12, 13, 14 and 15 aircraft equal the reviewer's 5,416, 6,495, 7,034, 7,572 and 7,788;<br>• a mutation check confirms the old constant line exceeded capacity at 12 aircraft. |
| F05 | **Fixed.** L7 now uses the whole of `w1-lifecycle` ¶3, including "What, then, is an enterprise?" and the definition. The key term gives the fuller definition. L7 `maxWords` is now 700 and its time 8 min. | L7 test. |
| F06 | **Fixed.** `w1-feedback` ¶3 sentences 0–2 are added as the callout "What the explorer's model does not contain". | L6 test. |
| F07 | **Fixed.**<br>• A new shown step uses `w1-worked-capacity` ¶1 sentences 2–4: demand binds first, then the fleet.<br>• The plateau step now uses the whole of ¶3: the wait and attractiveness formulas, and adoption = churn.<br>• The "lessons" step adds the Limits to Growth sentence. | L6 mechanism test. |
| F08 | **Fixed.** The ring and the key use MITRE's own wording: "influences me; I neither control nor influence it".<br>The airspace authority is removed from the outer ring. The reviewed text says only that providers are "mostly outside AeroLink's control", which does not settle whether AeroLink influences them. Both outer rings are now left for students to argue in memo §5.<br>The key term now refers to the environment. | Figure 7b test; `figure-l7-2.png`. |
| F09 | **Fixed.** A bridge in L7 ("Note the two uses of the word…") and the Figure 1 caption explain the difference: "service enterprise" is the name of the Week 1 system of interest, and SEBoK's enterprise is wider. | L7 test. |
| F10 | **Fixed by rewording.** The bridge now says Week 2 is not yet built and asks students to re-answer C2 and C5 themselves. The "Spacing" item in §6 above is superseded. | Bridge test. |
| F11 | **Partly fixed.**<br>(1) Fixed. The caution itemises the time and states ≈ 9.2 h ("about 9 h"). The Overview shows the same note under the time plan. The reviewed rows are unchanged. The items are:<br>• Learn: 63 min;<br>• m1 + m2: 25 min, on top of the memo row;<br>• m3 + m4: 35 min, inside the team row.<br>(2) Not changed: m2. Mission logic is out of scope (§7.5), and m2's steps are pinned by `src/workbench/missions.test.ts`, which belongs to another stream. Instead, the Practice plan labels m2 steps 2–4 as a recall of L6 and steps 5–6 as the new explorer work. Making m2 explorer-only is left to the faculty owner.<br>(3) Fixed. A new floor test checks each section's minutes against reading at 180 wpm, plus 1 min per figure, 1 per check and 2 per worked example. The minutes therefore no longer only check against each other. | Workload tests: the computed total is 9.2 h, and the caution and the row label match it. |
| F12 | **Fixed.** "Only" is removed, and the caption uses the reviewed causal wording. A third bar, the charging ceiling of 8,640, separates the two couplings. The first bar now says "charging ignored". | `figure-l4-1.png`. |
| F13 | **Fixed.**<br>• The first attempt is kept as `firstCorrect`, and objective status uses it.<br>• After a first wrong answer, only that option's feedback is shown.<br>• The key is revealed after a correct answer or a second wrong one, and no further retry is offered. | `flow.test.tsx`: two retry tests, including one showing that a correct retry stays "review". |
| F14 | **Fixed.** L5 shows a static diagram with only R1 and B1:<br>• R1 is solid teal;<br>• B1 is dashed orange;<br>• the shared link is in ink.<br>Polarities come from `LOOP_LINKS`. The full React Flow diagram stays in Practice. | `figure-l5-1.png`. |
| F15 | **Fixed.** The rule callout is titled "(course convention)" and says that the readings do not state the rule. R03 p.270, re-read, gives only negative and positive feedback. | Convention test. |
| F16 | **Fixed.** L4 now opens with `w1-intuition` ¶0. | L4 body. |
| F17 | **Fixed.** "In short" now reads as the review suggested. | `week01.ts`. |
| F18 | **Fixed.** The L6 question and "In short" now say "served trips". | Test: no "ridership" in either. |
| F19 | **Fixed.** Now reads "Complex systems form hierarchies; socio-technical ones form control hierarchies" (R03 p.271, re-read). | `week01.ts`. |
| F20 | **Fixed.** The feedback for C3 option b uses MITRE's point that systems thinking combines both perspectives in a single view (R50 p.46, re-read). | `week01.ts`. |
| F21 | **Fixed.** Mediation is now drawn only in the development and evolution phases. The definition column is marked "not in the change example" (R01 p.54, re-read). The alt text matches the drawn labels. | Figure 7a test; `figure-l7-1.png`. |
| F22 | **Fixed.**<br>• Three internal links: demand → operations centre → fleet → chargers.<br>• A one-way inward arrow for weather.<br>• Narrower boxes, giving the exchange labels about 90 px of clear space.<br>• A "Scroll sideways" hint at ≤ 640 px. The figure scrolls inside its frame, never the page. | `figure-l1-1.png`, `l1-400-*.png`. |
| F23 | **Fixed.** The welcome page has a new sub-block, "Where it starts, and what you need", labelled as course framing from syllabus §2. It says that:<br>• the course starts before notation;<br>• SysML is read from Week 5 and modelled from Week 9;<br>• no prior SE, SysML, MBSE or programming is assumed;<br>• students need college algebra, introductory probability and spreadsheet use.<br>The SE sentence is now labelled as course framing. | `welcome.ts`, `welcome-*.png`. |
| F24 | **Fixed.** L4 and C4 are labelled Understand. "View" is moved to the L3 principles panel. The "Elements interact" node now points to L1. | Bloom and concept-map tests. |
| F25 | **Fixed.** The Figure 6 caption and chart labels interpolate `TRIPS_PER_AIRCRAFT_MONTH`, `CHARGE_CAP_6` and `P.chargers`. | `week01.ts`, `EngineeringFigures.tsx`. |
| F26 | **Fixed.** Each C6 distractor matches a likely error:<br>• the 15th: the answer for 6 chargers;<br>• the 28th: 28.8 rounded down;<br>• the 30th: computed with 50 charges a day (`C6_WRONG_50`). | C6 test. |
| F27 | **Fixed.** The archetypes paragraph now comes after the worked example (`afterWorked`). | L6 test. |
| F28 | **Fixed.** Two lanes of cars, bumper to bumper, with brake lights. | `figure-overview-jam.png`. |

### Sign-off pass dispositions (`week01_flow_signoff.md`, N1 to N6)

| ID | Disposition | Evidence |
|---|---|---|
| N1 | **Fixed.** C5 now uses a different loop X: maintenance backlog →(−) aircraft available →(−) flying hours per available aircraft →(+) wear on each aircraft →(+) maintenance backlog. The model has no maintenance variable, so the explorer does not contain it. It is neither quiz q1-4's loop nor the noise loop that the instructor notes leave for teams to find for L1. It has **two** negative links, so the key ("Reinforcing: … an even count") differs from q1-4's. The distractors are "Balancing" from the first link only, "Balancing" because it contains negative links (the listed misconception), and "Neither". This supersedes the F02 loop. | `week01.test.ts`:<br>• C5 test: exactly two (−); no distractor starts with "Reinforcing"; no maintenance node in `LOOP_NODES`.<br>• No check prompt or keyed option shares 8 or more consecutive words with any quiz prompt or option.<br>• No check loop shares more than one variable with a quiz loop or with the instructor-notes loop; the old noise loop fails this (mutation test).<br>• No check reuses a quoted scenario name from a quiz prompt. |
| N2 | **Fixed.** C2 and C4 now mix wording: each has at least one qualified distractor ("likely", "probably", "tends to", "little of use") and at least one absolute one. The C2 key now says "Only …" and the C4 key says "every part". | Test: a keyed option without absolute words is never the only such option; C2 and C4 mix both kinds; the old C4 options fail this. |
| N3 | **Fixed.** C5 is re-labelled multistructural. | C5 test. |
| N4 | **Not done in this pass.** The label is in `src/components/figures/SystemFigures.tsx`, which is outside this fix's scope. | n/a |
| N5 | **Fixed.** The Figure 6 caption now says "The crossover is marked only after the worked step below has been answered", which is true in both states. | `week01.ts`. |
| N6 | **Fixed.** The m2 Practice-plan note now says that L6 asks where the capacities are equal, and m2 asks when charging takes over, so the first whole aircraft past the crossover is accepted there as well. It gives no number, so the note cannot give away the L6 answer. | `PRACTICE_PREREQ['w1-m2-worked']`. |

---

## 10. Rebuild for the whiteboard subject (2026-10-18) — supersedes §§1–9 where they differ

**Why.** The authoritative schedule (`COURSE_SCHEDULE.md`, DECISION_LOG A19) makes Week 1 "Team Formation / Needs / Identifying Stakeholders". The independent review of the faculty-feedback pass (`_source_cache/review/week01_feedback_review.md`, REVISE, F01–F17) also found AeroLink still assigned as the team subject. Week 1 was rebuilt as the design template. Everything new carries `review: 'new-pending-review'`; `weeks/week01.ts` is marked `self-checked` until an independent review.

**Kept, but no longer used in Week 1** (may return in a later week; no code deleted): the causal-loop diagram, the loop builder and loop rules, the dynamics explorer, the capacity, emergence, control-ring and life-cycle figures (`SystemFigures.tsx`, `EngineeringFigures.tsx`; their derived numbers moved to `learn/dynamicsNumbers.ts`), the principles explorer, the L1 record view, the views `dynamics`, `loops`, `l1`, `principles` (still registered in `views.ts`), and the reviewed blocks `w1-paradox`, `w1-analysis-synthesis`, `w1-feedback`, `w1-application` and `w1-emergence`/`w1-lifecycle` text. The old Week 1 module is not served as `#/draft/1` (it was rebuilt in place; `REBUILT_IN_PLACE` in `content/weeks/index.ts`); its text is in commit 9dec1e7.

**Re-used, adapted:** `w1-se`, `w1-soi`, `w1-worked` and the boundary exercise (old Week 1); `w2-stakeholders` and the reference register STK-001…014 with CON items (old Week 2); `w3-needs`, `w3-worked-needs`, the need-statement criteria, the critique items and the generic-concern screen (old Week 3).

### Outline

| Stage | Content |
|---|---|
| Overview | What the week teaches and why (R11 p.552); the week's path figure; **Meet AeroLink** (before any question, F12); the week's question and the locked prediction; sections; plain-words objectives with American Bloom labels; assessment; realistic time plan |
| L1 Forming your team | Lead roles, charter, decision rules, communication norms, owned ID prefixes (course convention, labeled; no reading cited) · worked charter · Figure: roles → prefixes · C1 |
| L2 System, system of interest and enterprise | R38 (with SEBoK's "expanded version" caveat, F05), R39b, R07 p.815; course criteria for a team enterprise (AeroLink excluded) · Figure: three scopes · C2 |
| L3 Boundary and context | `w1-soi` ¶0–2, worked three-SoI example (`w1-worked`) · Figure: AeroLink context (no dynamics panel) · C3 |
| L4 Identifying stakeholders | R39a p.1631 definition (quoted), R11 p.552–553 (why, where to look, approving authorities), R63 p.234–235 · worked: context → stakeholders (14 vs 3) · Figure: three sources · C4 |
| L5 Classifying stakeholders and concerns | Register (R11 p.553), four course classifications, specific concerns (RB-1.3), influence with a reason (R63 p.236), conflicts · worked: six register rows · Figure: a register row · C5 |
| L6 Stakeholder needs | R39a p.1632 (quoted), R11 p.549–553 (perspective, validation basis, integrated set, elicitation) · worked: concern → need → Week 2 requirement · Figure: chain · C6 |
| L7 Writing well-formed needs | R11 p.554–555, R53 p.296, the six criteria · worked: four AeroLink rewrites · Figure: anatomy of NEED-003 · C7 |
| Practice | m1 Try first: who is missing? (predict, sort 14 candidates, compare) · m2 Guided: an AeroLink boundary · m3 Guided: classify AeroLink's stakeholders and write a register row · m4 Guided: diagnose drafts and write two AeroLink needs · m5 Own: the team's Week 1 Team Record (charter, proposal, context, register, needs, export) · m6 Recall |
| Check & submit | Objective status · quiz Q1 (new items) · Team Record spec (evidence, minimums, format, LMS route, RB-1.1/1.2/1.3/2.2/2.5) with a live readiness check · model-inputs map (SysML v2 seeds) · graduate needs review · bridge |

Every section ends with **"Now apply it to your team's enterprise"**, naming the part of the Team enterprise view it feeds. Every mission step is checked by the computer (no "mark done"), and each check has a passing and a failing test (`src/workbench/missions.test.ts`, `src/workbench/week1/team.test.ts`).

### Workload, per student (lecture-first path, 2026-10-19; sign-off review Mo4 — supersedes the 8.9 h table and FD-29)

One workload story for this section, the Session 2 lab-brief notes (S2-18), the Laboratory page and its Markdown, and the
week page: all of them read `src/content/week1Path.ts` (`WORKLOAD`, `TEAM_RECORD_PERSON_HOURS`, `THREE_PERSON`) and
`weeks/week01.ts` `workload`; `learn/week01.test.ts` and `lectures/week01/labBrief.test.ts` assert that they agree.

| Row (counted) | h | Basis |
|---|---|---|
| In-class sessions (Session 1 lecture; Session 2 lecture and the 22-min Lab L1 launch) | 2.5 | 2 × 75 min |
| Detailed lesson, both sessions (incl. the AeroLink worked examples) | 1.4 | lesson word count at 150 words a minute |
| Readings R11 pp.549–555, R63 pp.234–235 | 0.6 | 9 pp at 15 pp/h |
| Candidate enterprise for the Session 2 pitch | 0.3 | one per member |
| Team Record out of class, per student | 2.5 | 10 person-hours for a team of four (below) |
| Readiness quiz Q1 | 0.2 | 12 min |
| Graduate needs review | 0.4 | four needs, ≤ 250 words |
| Time log (FD-22) | 0.1 | |
| **Total** | **8.0** | **the 8 h syllabus estimate exactly** |
| Optional practice (AeroLink missions 1–4), not counted | 1.1 | 11 + 15 + 22 + 18 min |

**Team Record, team of four (10.0 person-hours, 2.5 h each):** proposal with problem statement, mission and goals,
system of interest and parts inside the boundary 0.5; context 1.0; stakeholder sweep and merge 2.0; register and
relationships 2.5; needs 2.5; self-check, coverage audit and AI statement 1.0; integration review and export 0.5. The
S2-18 notes said 2.4 h (9.5 person-hours without the proposal write-up); they now say 2.5 h.

**Three-person team (flagged for faculty decision).** The lab tool applies the needs minimum the lecture proposes for
three-person teams, six needs from four stakeholders (pending faculty approval). That shrinks the needs task to about
1.9 person-hours, so the team carries about 9.4 person-hours, **about 3.1 h each, and its week is about 8.6 h, 0.6 h
over the 8 h budget.** Staying within 8 h would need about 7.5 person-hours (for example, also reducing the register
minimum to six stakeholders, still about 8.1 h); the faculty decides whether to accept 8.6 h or cut further.

The definition-of-done workload check passes for Week 1 (8.0 h); FD-29 (the 8.9 h trim proposal) is superseded.

### Review dispositions (F01–F17)

| ID | Disposition |
|---|---|
| F01 | Lab, assignment, template, rubric scope, `w1-lab`, the classic page and the student export now describe the team's own enterprise; test forbids AeroLink-subject phrases in them |
| F02 | Graduate expectation is the needs review; no explorer evidence anywhere |
| F03 | m5 is the team's own record; its steps are checked, its export is checked |
| F04 | Workload rebuilt (table above) |
| F05 | Definition, key term and quote note carry "an expanded version of the standard's" |
| F06 | The loop field and `parseLoopChain` are removed; no loop validation remains in Week 1 |
| F07 | Seeds include `actor`, "documentation (`doc`)", `item def` with what flows, `port def` with direction, `concern`, `stakeholder`, `requirement def` with short name and `frame`. The old "question" field is superseded: the proposal's purpose seeds `doc` |
| F08 | Seeds cite only Phase II slides (R70, R71, R74, R76, R77), labeled "Phase II reading"; no R81/R83 |
| F09 | New objectives in American English; Quiz badges use `bloomLabel` for Week 1 (flow, workbench, classic); spelling test scans course.ts Week 1 and the new files |
| F10 | Quiz keys a3 b2 c3 d2; no key is the longest or shortest option (ties included) in any check or quiz item; tested |
| F11 | No figure question leaks a key; checks and quiz items share no 8-word run and no case; every quiz item's deciding phrase is asserted in its section |
| F12 | Overview order: what/why → path → Meet AeroLink → question and prediction |
| F13 | Mission tiles show a distinct short title that breaks only between words, progress under it; e2e checks 1440 and 400 px |
| F14 | "Open the workbench" under the lede; the regions sketch scales; the plan becomes cards ≤ 640 px; region names give their tabs |
| F15 | e2e walks every mission to "Practice complete" (screenshots at 1440 and 400 px) |
| F16 | Readiness computed by the same checks as the Team enterprise view (stale export fails); LMS assignment named |
| F17 | Welcome: "Week 1 uses this four-stage layout; later weeks will follow it"; "memo section 5" gone |

### Review dispositions (rebuild review of commit 0f3ebcb, `_source_cache/review/week01_rebuild_review.md`, F01–F17)

| ID | Disposition |
|---|---|
| F01 | **Superseded by the sign-off revision (2026-10-19, M1; confirmation N1):** the structure gate now requires the taught form “The [stakeholders] need the [system] to …”, with the system named by “the”, “our”, “its”, “a”, “an” or its proper name; the “&lt;subject&gt; need(s) &lt;object&gt;” gate described below is retired. Original disposition: new `src/workbench/week1/needQuality.ts` replaces the Week 3 lexical checker in Week 1. **Hard gates** (objective structure only): “&lt;subject&gt; need(s) &lt;object&gt;” with ≥ 2 content words in the object; the subject is a stakeholder in the register (or a subgroup of one; every “need” in the sentence is tried as the verb) and is not the team’s own enterprise or a generic “the system / the network”; the need ID is unique. **Record fields**: trace to register STK IDs, rationale ≥ 5 words, short name, and (team record) priority and CON links held by a source stakeholder. **Advisory warnings**: vague terms (“good”, “when possible”, “as soon as possible”, …), requirement words (shall, must, should, has to, will provide…), design and solution words, run only on the text after the subject (so “Elevator inspectors”, “hospital wings”, “using a wheelchair” are never flagged), a missing condition word (broad cues: within, on weekends, in winter storms, after each, between 22:00 and 06:00, for an hour after…), and a subject that is not a traced stakeholder. **Self-check**: the six L7 criteria are confirmed per need as a checklist, each item saying what the tool checked; editing the statement clears the confirmation. A need counts only with gates passed, fields complete, all six confirmed and every warning rewritten or justified (≥ 5 words). Every example in the review is a unit test in the right direction (`needQuality.test.ts`, `team.test.ts`), including eight copies of “Stakeholder n need good service when possible” failing part 5. L5 and L7 apply text, the Team enterprise view and the mission-4 writer say exactly what the tool checks and what the student judges. The mission-4 critique key is now authored (`CRITIQUE_KEY`), not computed by a screen; a test shows it agrees with the Week 3 screen on the six drafts. |
| F02 | Three record states (`recordState`): **ready** = all five parts + AI usage statement + current export + decision “approved” with a real calendar date not in the future; **submitted for approval** = complete and exported but pending, labeled in the view, on Check & submit and in both exports, never shown as ready; **not ready** otherwise. “Revise”, “2099-99-99”, “2026-02-30” and future dates fail. The AI usage statement is part 6 of the Team enterprise view (≥ 12 words), a mission-5 step, a readiness row and section 6 of the Markdown export. Generic concerns and vague needs never count toward the minimums. Default decision recorded for faculty as FD-28: Week 1 may be submitted with approval pending (labeled); approval is required before the Week 2 submission. (Sign-off confirmation N4: now worded “six parts, five engineering outputs plus the AI usage statement”.) “Five parts plus the AI usage statement” was used in the Overview figure caption, the assessed-work line, TEAM_RECORD, the deliverable block, the lab and the assignment. |
| F03 | Concern check = not generic (Week 2 heuristic, now also stripping “overall”, “in general”, “unhappy”, “financial”, “returns”) AND at least one concrete detail (a number or time, a condition, a place, an affected group, or a consequence). The four review examples fail; the fixture, the AeroLink reference rows and the C5 key pass (tests in both directions). L5’s apply text now says the check catches only the most generic phrasings and cannot judge truth or importance. |
| F04 | `importModelInputs` validates every list and entry with messages naming the field (“context” must be a list; “stakeholders” item 1 is null; needs item 1 sources; a concern of a missing stakeholder), refuses wrong-form and duplicate IDs (EXT, STK, CON, NEED, PRT), never throws; the view wraps the read in try/catch. `checkContextPart`, `checkRegister` (STK and CON) and the need uniqueness gate flag duplicate IDs in the record. Version 1 files still import. |
| F05 | Abbreviation-aware sentence count (U.S., e.g., a.m., Dr., initials); every lead role held by a different member; each of ENT, EXT, STK, CON, NEED owned by exactly one member; prefixes outside the course ID scheme (e.g. ZZ) rejected; prefix lines read case-insensitively; AeroLink rejected in the name, domain, system of interest and inside elements, but a contrast in the purpose is allowed. Near copies remain the instructor’s checkpoint call. |
| F06 | Prediction options are neutral and similar in length (“Yes, the three are enough” / “No: add more users or customers” / “No: add other kinds of party” / “I cannot tell yet”); the generative part is the sort in step 2, before any explanation. “Meet AeroLink” no longer lists the external organizations above the prediction (L3 does). |
| F07 | The `w1-worked` block is overridden (pending review) without “This is the resolution the Week 1 explorer uses”. `#/draft/1` shows a “rebuilt in place” page with no old objectives and no explorer-and-memo task; the student export omits `draft-week01.md` and its index link; the instructor export prefixes the old objective IDs `old-B1.x` and drops the old lab and graduate task. |
| F08 | Workbench brand “Practice workbench”; breadcrumb root “Studio · your team’s enterprise” on the own mission, “AeroLink worked example” on rehearsals; classic header “Learning Studio · local prototype”; AeroLink workspace nav grouped as “AeroLink worked example (instructor’s case)”. RB-1.1 Beginning now reads “equal to a single product” (ASSESSMENT_RUBRICS.md, regenerated); rubric cells render **bold** instead of literal asterisks; the rubric note says AROU and CAP → NEED are not in scope in Week 1. |
| F09 | w1q-1 and w1q-5 carry `courseSource` (course convention, L1 and L2) instead of borrowed R11/R07 citations (QuizQuestion.cite is optional; every item must have one or the other, tested); c5 has no reading citation (rendered as course convention; feedback names RB-1.3); key term “Concern” is a course working definition noting SEBoK gives none; the “shall” misconception cites R11 pp.549, 555; the actor seed says “in a use case”. R77 sl.115 is not cited in Week 1 (outside the register). |
| F10 | **Superseded by the sign-off revision (2026-10-19, Mo4):** the workload table above now totals 8.0 h on the lecture-first path. Original disposition: per student, candidate-enterprise preparation budgeted, honest total 8.9 h (0.9 h over), trim proposed to faculty (FD-29), not applied. |
| F11 | Need priority (high, medium, low) and need → concern links (CON IDs, held by a source stakeholder) are required record fields; a stakeholder holds one or more concerns, each with its own CON ID; elements inside the boundary are rows with PRT IDs. JSON model inputs version 2 carries priority, concerns, self-check, warnings kept, justification, inside IDs, the AI statement and the record status; the Markdown carries the same. The first record shape is upgraded on load. |
| F12 | The system of interest is “the AeroLink air-taxi service” in L2/L3 text, figures, the boundary exercise, the context recorder default and mission 2; L2 and the proposal form add “your proposal names the enterprise and, inside it, the system of interest your team will engineer”. Residual: the Phase II reference model element ENT-001 and the SysML reference files keep “AeroLink Urban Mobility service enterprise” until Week 8 is rebuilt. |
| F13 | Check & submit: tables become cards at ≤ 640 px (`.lf-cards`), captions sit outside the tables, the rubric rows, the model-inputs map and the graduate review details are collapsible; e2e asserts no clipped table, cell or caption at 400 px and a page under 14,000 px collapsed. |
| F14 | After “Check”, each identify or classify row that differs from the key must be re-answered or acknowledged (“I have read why”) before the step completes; the first-check score is kept. Tested in both directions (unit and e2e). |
| F15 | Regions drawing: “2. Guided”; a stacked narrow variant replaces the wide drawing at ≤ 600 px (labels ≥ 11 px, tested). “1 more step appears”. Mission goals are no longer line-clamped (M5 goal shortened). Model-browser dots are neutral for “incomplete”, “not recorded” and short counts. The stepper marks Check done only after the student has opened it. The duplicate “Practice complete” banner in the brief is removed. |
| F16 | `aria-label="Color theme"`; the curriculum export’s lab table header reads “Artifact”. |
| F17 | w1q-2 is now a transfer item (choosing the system of interest for an emergency-department waiting-time question; key b, keeping the a3 b2 c3 d2 balance; key neither longest nor shortest; answerable from “small enough to analyze” in L2/L3). OPENER.how says “a worked example introduced below”. |

### Register additions awaiting faculty confirmation

R39a SEBoK glossary "Stakeholder" (PDF pp.1631–1632; includes "Stakeholder Needs and Requirements") and R39b "System-of-Interest" (p.1652), added to `_source_cache/verification/readings.py`, verified by `verify_readings.py` (title found on first page; 92/93), exported with `npm run content:readings`.

### Open decisions

1. Reading of RB-1.2 "all S04 classes" for a team's own enterprise (course role groups; at least one approving authority and one non-customer stakeholder).
2. Minimums (course conventions, single source `src/content/lectures/week01/labBrief.ts`, as the S2-18 lab brief states them): ≥ 3 parts inside the boundary (PRT), ≥ 6 context items, ≥ 8 stakeholders, ≥ 3 relationships with ≥ 1 conflict (REL, required as the lecture sets it), ≥ 8 needs from ≥ 5 stakeholders, each traced to its concern and to the mission or a goal.
3. Whether the graduate needs review applies to all students (D2: audience level).
4. Whether instructor approval must be recorded as "approved" before Week 2, or "pending" is enough at submission. **Default implemented (FD-28):** Week 1 may be submitted with the proposal “submitted for approval”, labeled and never shown as ready; approval is required before the Week 2 submission.
5. Exam bank items in `src/instructor/exams/exam1.ts` still test the old Week 1 objectives (causal loops); exam placement is an open faculty decision.
6. Week 1 workload: 8.0 h for a team of four (FD-29 superseded by the lecture-first path). Three-person teams: about 8.6 h with the reduced needs minimum (six needs from four stakeholders, implemented pending approval); accept, or cut further (see the workload subsection above).
7. The concern detail cues and the need warning lexicons are instructor-authored screens; confirm that warnings may be kept with a written justification (the default) rather than blocking.
