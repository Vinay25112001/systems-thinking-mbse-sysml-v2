// Week 1 — complete module. Lesson blocks, principles, boundary key and quiz live in ../week1.ts and ../quizWeek1.ts;
// this file adds the remaining sections of the definition of done. Revised after the independent review of
// 2026-10-09 (_source_cache/review/week01_review.md, findings W1-F01 to W1-F25) and after the re-review of 2026-10-11
// (week01_rereview.md, W1-R01 to W1-R07; see docs/authoring/week01_notes.md).
// Pending faculty review (DECISION_LOG A4). All AeroLink numbers are FICTIONAL; every statement about the dynamics
// model is asserted in src/sim/aerolink.test.ts.
import type { LessonBlock, WeekContent } from '../schema'
import { WEEK1_BLOCKS, WEEK1_INTRO } from '../week1'
import { WEEK1_QUIZ } from '../quizWeek1'

const byId = Object.fromEntries(WEEK1_BLOCKS.map((b) => [b.id, b]))

const emergence: LessonBlock = {
  id: 'w1-emergence',
  kind: 'concept',
  title: 'Wholeness, state, emergence and hierarchy',
  paragraphs: [
    'SEBoK’s Concepts of Systems Thinking starts from wholeness: a system is a set of elements with enough cohesion to form a bounded whole, and — following Hitchins — interaction between elements is the key system concept. An open system is defined both by the interactions among its elements inside the boundary and by its interactions with other systems in its environment. Applying this to AeroLink, every question in this course concerns an open system.',
    'The state of a system is the set of its attributes at a given time, monitored through state variables; an event is a change in the environment that can change that state. SEBoK notes that state variables are generally continuous but can be modelled using a finite state model, or state machine. Applying this to the course, you will meet the idea again in Week 11, when aircraft operating states are modelled in SysML v2.',
    'Emergence is the behaviour that arises from combinations of element behaviours across a system hierarchy. SEBoK uses “synergy”, or weak emergence, for the familiar idea that the whole is greater than the sum of the parts, but notes that the opposite is also possible: reducing variety, in which the whole function is less than the sum of the parts. Applying this to AeroLink, the second case matters as much as the first. In the dynamics explorer, 40 aircraft that could each fly 20 trips a day deliver about 7,800 trips a month — about 6.5 trips per aircraft per day — because they are coupled through six shared turnaround chargers and through riders’ response to waiting.',
    'Complex systems tend to form hierarchies, in which strongly cohesive elements group together into structures that reduce complexity and increase robustness (Simon). Encapsulation hides a subsystem’s internals behind a boundary. Socio-technical systems form control hierarchies, in which systems at a higher level have some ownership of control over those at lower levels. Applying this to AeroLink, the operations centre controls dispatch, while the airspace authority constrains the operations centre.',
  ],
  citations: [{ reading: 'R03', pages: '268–271' }],
  provenance: 'mixed',
}

const lifecycle: LessonBlock = {
  id: 'w1-lifecycle',
  kind: 'concept',
  title: 'What systems engineering contributes across the life cycle — and what an enterprise is',
  paragraphs: [
    'SEBoK records that traditional definitions of SE emphasised sequential performance of SE activities — “documenting requirements, then proceeding with design synthesis …” (INCOSE 2012, as quoted in SEBoK). Its own revised definition instead focuses on holistically and concurrently understanding stakeholder needs, exploring opportunities, documenting requirements, and synthesising, verifying, validating and evolving solutions, while considering the complete problem from system concept exploration through system disposal.',
    'SEBoK frames SE inside a project life cycle with three primary phases — system definition, initial operational capability development, and system evolution and retirement — and three kinds of agent: systems engineers, system developers, and external bodies (users, owners and external systems). The engineered system itself may be a product, a service and/or an enterprise. Applying this to AeroLink: the aircraft are products, passenger transport is a service, and AeroLink as a whole is an enterprise.',
    'The clearest picture of what SE contributes is SEBoK’s change example. Users and owners propose changes, for instance in response to competitive threats or to independently evolving external systems; developers must implement them; systems engineers mediate, analysing the relative costs and benefits of alternative change proposals and synthesising mutually satisfactory solutions. Proposals and counter-proposals flow both ways, so the dependencies are two-way. Applying this to the course, the impact analysis you perform on the AeroLink model in Week 13 is a tool for exactly this mediation.',
    'What, then, is an enterprise? SEBoK’s Enterprise Systems Engineering knowledge area defines it as a purposeful combination (for example, a network) of interdependent resources — people, processes, organisations, supporting technologies and funding — that interact with each other to coordinate functions, share information, allocate funding, create workflows and make decisions, and with their environment to achieve business and operational goals (Rebovich and White 2011, as quoted in SEBoK). SEBoK stresses that an enterprise is not the same as an organisation: it includes the organisations that take part, but also people, knowledge, processes, policies, facilities and other assets, and it may have several owners directing its resources. MITRE’s first systems-thinking question is “What is my enterprise?”, followed by which elements I control, which I influence, and which influence me without my controlling or influencing them.',
    'Applying this to AeroLink, the enterprise is wider than AeroLink Urban Mobility the company. It includes the vertiport operators, the electric utility’s grid connections, the operations centre’s procedures, the manufacturers’ delivery commitments and the funding that together deliver the service. That is why many of the levers you will find in the dynamics explorer belong to someone other than AeroLink.',
  ],
  citations: [{ reading: 'R01', pages: '53–54' }, { reading: 'R07', pages: '815' }, { reading: 'R50', pages: '48' }],
  provenance: 'mixed',
}

const capacity: LessonBlock = {
  id: 'w1-worked-capacity',
  kind: 'worked-example',
  title: 'Worked example: where is the binding constraint, and why does throughput level off below it?',
  paragraphs: [
    'Before trusting any simulation, an engineer should be able to predict its main behaviour by hand. The explorer uses these FICTIONAL default parameters: 12 aircraft, each able to fly 20 trips per day; 6 turnaround chargers; 20 minutes of charging per trip; 16 operating hours per day; 30 days per month. Why 6 chargers, when the Data Sheet lists 6 vertiports × 2 chargers = 12? The course’s instructor assumption A-002 (FICTIONAL, recorded in the Week 2 AROU register) is that turnaround charging is concentrated at the 3 hub vertiports, so the effective turnaround pool is 3 × 2 = 6 chargers; the 6 chargers at the spoke vertiports are standard units for overnight and opportunity top-up.',
    'Fleet capacity is 12 × 20 × 30 = 7,200 trips per month. Charging capacity is 6 chargers × (16 × 60 ÷ 20) charges per charger per day × 30 = 6 × 48 × 30 = 8,640 trips per month. Capacity is the smaller of the two, but which constraint binds depends on demand as well. At launch only 900 trips a month are demanded (300 riders × 3), so utilisation is 0.125: demand binds, and extra aircraft would add almost nothing. As word of mouth grows ridership, demand approaches the 7,200-trip fleet capacity (in the explorer, from about month 9), waits pass riders’ tolerance, and the fleet becomes the binding constraint. Buying aircraft now helps most, which is why the policy “order aircraft when utilisation is high” looks right at first. (The 15-minute boundary is a convention: just below it, waits already cost riders, so more capacity helped somewhat before this point too.) Once the fleet reaches 15 aircraft, charging binds.',
    'Setting the two capacities equal gives the crossover fleet: 8,640 ÷ (20 × 30) = 14.4 aircraft. Charging limits capacity from the 15th aircraft, whose arrival still adds 240 trips (from 8,400 to 8,640); from the 16th aircraft onward, each extra aircraft adds nothing. In the “Fleet grows, charging does not” scenario management nevertheless ends up with 40 aircraft, so about 25 of them add no usable capacity; the explorer’s surplus-aircraft indicator counts them (their monetary cost is outside the model). Meanwhile the market (30,000 potential riders × 3 trips) could demand 90,000 trips per month, more than ten times the charging ceiling, so the market is not what stops growth.',
    'The hand calculation predicts the ceiling, not the plateau. The explorer levels off at about 7,788 trips a month, 90 % of 8,640, and never reaches the ceiling. The reason is the churn loop. In this model the wait is 2 ÷ (1 − utilisation) minutes, so it rises steeply as utilisation approaches 1, and attractiveness is 1 ÷ (1 + (wait ÷ 15)²), which halves when the wait reaches riders’ 15-minute tolerance. Ridership stops growing where adoption equals churn: 0.3 × (1 − 0.087) × A = 0.15 × (1 − A), where 0.087 is the riders’ share of the market. That gives an attractiveness of A ≈ 0.35, a wait of about 20 minutes and a utilisation of about 0.90 — the explorer’s values. Demand never exceeds capacity, so no trip goes unserved. Riders are held down not by rationing but by the waits that capacity pressure creates.',
    'Two lessons generalise. First, a system’s capacity is set by its binding constraint, and the constraint moves as you relieve it: demand, then fleet, then charging. SEBoK’s Limits to Growth archetype describes the result: a reinforcing growth process encounters a balancing process as the limit is approached, and continuing efforts produce diminishing returns as one approaches the limits. Here the returns diminish before the hard limit is reached, because the balancing loop (waiting drives churn) strengthens as utilisation rises. Second, a simple hand check verifies the model itself: if the simulation had shown more than 8,640 trips served with six chargers, the model would be wrong. You will apply the same discipline to SysML analysis results in Week 13.',
  ],
  table: {
    caption: 'Monthly capacity by fleet size with 6 turnaround chargers (FICTIONAL parameters from the dynamics explorer). Whether this capacity binds also depends on demand.',
    header: ['Aircraft', 'Fleet capacity (trips/month)', 'Charging capacity (trips/month)', 'Capacity (smaller of the two)', 'Resource that limits capacity'],
    rows: [
      ['12', '7,200', '8,640', '7,200', 'Fleet'],
      ['14', '8,400', '8,640', '8,400', 'Fleet'],
      ['15', '9,000', '8,640', '8,640', 'Charging'],
      ['16', '9,600', '8,640', '8,640', 'Charging'],
      ['40', '24,000', '8,640', '8,640', 'Charging'],
    ],
  },
  citations: [{ reading: 'R05', pages: '283' }],
  provenance: 'mixed',
}

const order = ['w1-outcomes', 'w1-intuition', 'w1-se', 'w1-soi', 'w1-paradox', 'w1-emergence', 'w1-analysis-synthesis', 'w1-lifecycle', 'w1-worked', 'w1-worked-capacity', 'w1-feedback', 'w1-application', 'w1-lab']
const extra: Record<string, LessonBlock> = { 'w1-emergence': emergence, 'w1-lifecycle': lifecycle, 'w1-worked-capacity': capacity }

const week01: WeekContent = {
  week: 1,
  drivingQuestion: WEEK1_INTRO.question,
  blocks: order.map((id) => byId[id] ?? extra[id]),
  activities: [
    {
      id: 'w1-act-principles',
      title: 'Principles explorer',
      component: 'principles-explorer',
      purpose: 'Connect eight systems principles from the SEBoK principles table to concrete AeroLink situations.',
      instructions: ['Read each principle.', 'Predict how it applies to AeroLink before revealing the instructor’s application.', 'Note one principle you would challenge and why (exit ticket).'],
      objectives: ['B1.1'],
      inBlock: 'w1-paradox',
    },
    {
      id: 'w1-act-dynamics',
      title: 'Causal loops and the AeroLink dynamics explorer',
      component: 'aerolink-dynamics',
      purpose: 'See emergent behaviour (a plateau below the charging ceiling; fleet over-build) arise from loop structure, and evaluate a leverage point on two measures.',
      instructions: [
        'Trace each loop in the causal-loop diagram and confirm its polarity by counting negative links. Note which links are conditional. Holding waiting time constant, find the range of ridership in which the net effect of riders on adoption is positive; then say why waiting (B1) can make the full-model effect negative earlier.',
        'Run the three scenarios. For each, commit to an archetype before revealing the instructor’s label, and use the observations and the data table to name the binding constraint (demand, fleet or charging) at month 12 and at month 60.',
        'Starting from “Fleet grows, charging does not”, compare three single policy changes: (a) chargers scale with the fleet; (b) orders count aircraft already on order; (c) initial chargers raised from 6 to 12. For each, record riders and the wait at month 60, and surplus aircraft-months and charger-months over the 60 months (both are in the observations); then set Months simulated to 120 and record them again. Which change, or combination, would you put to AeroLink’s capital committee, and does your answer depend on the horizon? The surplus measure counts idle aircraft only and the model prices neither aircraft nor chargers, so state the relative cost your recommendation assumes.',
      ],
      objectives: ['B1.2', 'B1.3'],
      inBlock: 'w1-feedback',
    },
    {
      id: 'w1-act-boundary',
      title: 'Boundary classification exercise',
      component: 'boundary-exercise',
      purpose: 'Practise drawing a boundary that is fit for a stated question.',
      instructions: ['Classify each candidate element as inside the boundary, environment or irrelevant to the question.', 'Check your answers and read the explanation for any you got wrong.'],
      objectives: ['B1.1', 'B1.2'],
      inBlock: 'w1-lab',
    },
  ],
  lab: {
    id: 'L1',
    title: 'Context and causal loops; team charter',
    setting: 'team',
    durationMinutes: 75,
    objectives: ['B1.1', 'B1.2', 'B1.3'],
    inputs: ['AeroLink case brief (Case study workspace)', 'AeroLink Data Sheet (FICTIONAL values)', 'Dynamics explorer'],
    steps: [
      { title: 'Choose the system of interest', detail: 'State the SoI for the question “Will adding aircraft reduce average passenger waiting time?” in one sentence, and record at least one boundary you rejected and why.' },
      { title: 'Context diagram', detail: 'Draw the SoI and at least 6 external systems or actors, numbered from EXT-001 (e.g. EXT-001 Air navigation service provider, EXT-002 Electric utility, as in the instructor reference). Label each exchange (power, data, passengers, approvals).' },
      { title: 'Two causal loops', detail: 'Draw one reinforcing and one balancing loop for AeroLink. Every arrow has a polarity; the loop type follows from the count of negative links.' },
      { title: 'Explain one emergent behaviour', detail: 'Use the dynamics explorer to reproduce one plateau or one over-build. Explain it causally so that it cannot be attributed to any single element.' },
      { title: 'Team charter', detail: 'Assign the four course roles — Requirements & Compliance, Architecture, AI & Data Management, Verification & Validation (in a 3-person team, AI & Data Management merges with Architecture; FD-24) — agree decision rules and communication norms, and record each member’s owned element prefixes for the term.' },
    ],
    artefacts: [
      { idPrefix: 'ENT', description: 'System of interest and boundary statement', minimum: 'ENT-001 with a one-sentence boundary' },
      { idPrefix: 'EXT', description: 'External systems and actors on the context diagram', minimum: '≥ 6 EXT items (EXT-001 …), each with a labelled exchange' },
      { idPrefix: 'Loop', description: 'Causal-loop diagram', minimum: '1 reinforcing + 1 balancing loop with polarities' },
      { idPrefix: 'Charter', description: 'Team charter', minimum: 'Roles, decision rules, owners' },
    ],
    continuity: 'ENT-001 and the EXT list become the context for the Week 2 stakeholder map (each EXT that is an organisation reappears as a stakeholder) and, in Week 9, the top-level package and context parts of the SysML v2 model.',
    tools: [
      { label: 'Air Taxi Enterprise workspace', to: '/workspace/aerolink' },
      { label: 'Stakeholder ecosystem editor (Week 2, open early)', to: '/workspace/stakeholders' },
    ],
  },
  assignment: {
    id: 'W1-A',
    title: 'L1 record and graduate leverage-point memo',
    mode: 'individual',
    due: 'Before the first session of Week 2',
    weight:
      'Mixed submission: the L1 record is a team deliverable and the memo is individual. Both are formative. The memo is always read and given feedback on RB-1.4 (B-CLO1); it is then filed as review-notebook entry 1 (RB-16, 5 %), where it may also be one of the sampled entries.',
    instructions: [
      'Team: submit the L1 record (boundary statement, context diagram, two loops, emergent-behaviour explanation, charter).',
      'Individual: write a one-page memo identifying one leverage point in the AeroLink dynamics model. The instructor reads every memo and gives formative feedback against RB-1.4 (the causal argument).',
      'Support every claim in the memo with evidence from the explorer: scenario, parameter change, and before/after values of riders at month 60, surplus aircraft-months and charger-months over the same run length. Surplus aircraft-months count idle aircraft only; charger-months show the charging investment that measure leaves out.',
      'Name the stakeholder who controls the leverage point and say whether AeroLink controls it, influences it, or is influenced by it without controlling or influencing it (R50 p.48).',
      'Log your hours for the week in the review notebook (workload pilot, FD-22).',
    ],
    template: [
      { heading: '1. Question and system of interest', guidance: 'Restate the question and the SoI boundary you used. One sentence each.' },
      { heading: '2. Observed behaviour', guidance: 'Describe the behaviour (plateau below the ceiling, over-build, market-limited growth) with the explorer values that show it, and name the binding constraint at the months you cite.' },
      { heading: '3. Causal explanation', guidance: 'Explain the behaviour from loop structure: which loop dominates, where the delay or limit is. Name the archetype (R05 p.283–284) and say whether the model’s structure actually contains it. This section is assessed against RB-1.4: at least one feedback or emergent effect explained with a causal argument.' },
      { heading: '4. Leverage point and evidence', guidance: 'One change (or combination), with before/after values of riders at month 60, surplus aircraft-months and charger-months over the same run, and why it is high leverage rather than a symptom fix. State the trade-off and the relative cost of aircraft and chargers you assume, since the model prices neither.' },
      { heading: '5. Who controls it', guidance: 'Owner of the leverage point; controls / influences / influenced by it without control or influence (R50 p.48); one implication for Week 2 stakeholder analysis.' },
      { heading: '6. AI usage statement', guidance: 'Tool, purpose, prompts, what you accepted or rejected and why (RB-12.1–12.2).' },
    ],
    rubrics: ['RB-1', 'RB-16', 'RB-12'],
    rubricScope:
      'Formative throughout. L1 record (team): RB-1.1 boundary and context, and the causal-argument clause of RB-1.4 (≥ 1 feedback or emergent effect explained with a causal argument; stakeholder relationships are not expected until Week 2). Graduate memo (individual): always read and scored on the same RB-1.4 causal-argument clause (B-CLO1); it also becomes review-notebook entry 1 under RB-16. AI usage statement: RB-12.1–12.2, plus RB-12.3 for any AI-suggested EXT items (tagged AI-suggested-reviewed).',
    aiUse: 'AI tools may be used to brainstorm external systems and to critique a draft memo. Every AI-suggested element must be tagged AI-suggested-reviewed, and the AI usage statement must say what was rejected.',
    objectives: ['B1.1', 'B1.2', 'B1.3', 'B1.4'],
  },
  quiz: WEEK1_QUIZ,
  instructorNotes: {
    sessions: [
      {
        title: 'Session 1 — concept studio',
        minutes: 75,
        segments: [
          { label: 'Analogy: the traffic jam', minutes: 10, notes: 'Ask where the jam “is”. Push until students say it is in the interactions, then pose the AeroLink driving question.' },
          { label: 'Formal concepts', minutes: 20, notes: 'SE definition (R01), SoI and systemic resolution (R02), principles table (R04), emergence and hierarchy (R03), enterprise (R07 p.815).' },
          { label: 'Worked example: three systems of interest', minutes: 15, notes: 'Walk the three boundaries; ask which one can answer the question and why.' },
          { label: 'Active practice: find a loop in vertiport charging', minutes: 25, notes: 'Pairs draw a loop involving charger queue, turnaround time and dispatch; two pairs present; class checks polarity.' },
          { label: 'Exit ticket', minutes: 5, notes: 'One principle you would challenge, and why.' },
        ],
      },
      {
        title: 'Session 2 — Lab L1',
        minutes: 75,
        segments: [
          { label: 'Brief', minutes: 5, notes: 'Lab steps and acceptance criteria; remind teams that the boundary must fit the question.' },
          { label: 'Team work: boundary, context, loops', minutes: 35, notes: 'Circulate; challenge any team whose SoI is “the aircraft”.' },
          { label: 'Instructor checkpoint', minutes: 10, notes: 'Each team states its boundary in one sentence and names one loop with its polarity.' },
          { label: 'Team work: emergent behaviour and charter', minutes: 20, notes: 'Teams use the explorer; the charter is finished outside class if needed.' },
          { label: 'Lab record', minutes: 5, notes: 'Upload the L1 record; note open questions for Week 2.' },
        ],
      },
    ],
    misconceptions: [
      { claim: '“The system is the aircraft.”', correction: 'The system of interest is chosen for a question. Waiting time is not a property of the aircraft, so an aircraft-only boundary cannot answer the driving question.', cite: { reading: 'R02', pages: '264' } },
      { claim: '“Emergence means the whole is the sum of the parts.”', correction: 'Emergent behaviour arises from interactions; SEBoK also notes reducing variety, where the whole function is less than the sum of the parts (e.g. 40 aircraft delivering about 6.5 trips per aircraft per day because they share six turnaround chargers).', cite: { reading: 'R03', pages: '271' } },
      { claim: '“More capacity always reduces waiting.”', correction: 'Only capacity at the binding constraint helps. In “Fleet grows, charging does not” the fleet grows from 12 to 40 aircraft: served trips rise about 20 % as the first deliveries take the fleet to 15, then level off at about 7,800 a month (90 % of the 8,640 charging ceiling) with waits near 20 minutes. A fleet frozen at 15 aircraft reaches the same plateau.', cite: { reading: 'R05', pages: '283' } },
      { claim: '“A plateau means demand exceeds capacity.”', correction: 'In the explorer, demand never exceeds capacity and no trip goes unserved. The plateau is where churn, driven by waits above tolerance, balances word-of-mouth adoption; it sits below the ceiling because waits grow steeply as utilisation approaches 1.' },
      { claim: '“A loop with a negative link is a balancing loop.”', correction: 'Loop type is determined by the number of negative links: an even number (including zero) gives a reinforcing loop, an odd number a balancing loop. Each link’s polarity is also local: with waiting time held constant, the net effect of riders on adoption reverses once riders exceed half the market.' },
    ],
    facilitation: [
      'Keep the driving question visible for both sessions; every boundary argument should be tested against it.',
      'Do not let teams copy the explorer’s loops verbatim for L1 — require at least one loop the explorer does not contain (e.g. noise complaints → community acceptance → permitted operating hours).',
      'The explorer hides each scenario’s archetype label until the student commits a choice; do not reveal the labels in class before teams have committed.',
      'Graduate students: expect the memo to distinguish symptom fixes (more aircraft) from structural changes (scaling chargers with the fleet; counting the supply line), and to report riders, surplus aircraft-months and charger-months. Step 3 has more than one defensible answer: over 60 months scaling chargers wins on riders and (narrowly) on surplus aircraft-months but multiplies charger-months about ninefold, and over 120 months its surplus aircraft-months are twice the baseline’s; counting the supply line cuts idle aircraft at no charging cost but leaves riders where they were; the two together grow more slowly but end with almost no idle aircraft. The answer turns on the horizon and on the relative cost of chargers, which the model does not price, so mark the argument, not the choice. In “Long procurement delay”, counting the supply line removes the over-build but, with orders sized on current demand, slows growth sharply; strong memos propose a combination, such as a shorter delivery delay. If they propose a demand forecast, they should say that the explorer cannot test it.',
      'Accessibility: the causal-loop diagram has a text equivalent listing every link (with its conditions) and every loop. The explorer has a data table (every month, or every 3, 6 or 12 months), and its chart series differ by line pattern as well as colour. The archetype choice is a labelled select. Point screen-reader users to the table.',
    ],
    answerKey: [
      'Boundary exercise key: inside — fleet, chargers, dispatch/scheduling, demand and word of mouth; environment — grid, airspace/ANSP, weather, manufacturer lead time; irrelevant — cabin colour scheme. Discussion point: demand is inside because it is endogenous to the feedback under study (a model-boundary criterion), whereas the grid is outside because AeroLink does not design or control it (a control criterion). Passengers are not controlled by AeroLink either; ask graduate students to name the criterion they use.',
      'Acceptable SoI for the driving question: the AeroLink service enterprise (fleet, vertiports and chargers, operations centre, demand). Aircraft-only or flight-operations-only boundaries should be rejected with the reasons in the worked example.',
      'Explorer evidence. The model is deterministic, and each statement below is asserted in src/sim/aerolink.test.ts together with a counterfactual run that the assertion rejects. “Fleet grows, charging does not”: demand binds to month 8 and the fleet binds in months 9–14; month 15 is briefly demand-limited as deliveries arrive; charging binds from month 16. The fleet grows from 12 to 40; served trips level off at 7,788 a month (90 % of the 8,640 ceiling) with a wait of about 20.3 min, and riders reach 8.7 % of the market. A fleet frozen at 15 reaches the same plateau, and demand never exceeds capacity. “Long procurement delay”: at month 60 utilisation is 0.49, with 278 aircraft and 78 more on order, about 161 aircraft owned or on order beyond need; after the pipeline empties the fleet settles at 356, about 1.7 × need. “Chargers scale, 3-month delivery”: riders reach 92.5 % of the market at month 60, waits are within tolerance from month 28, operation is demand-limited at the end, about 14 aircraft are surplus (449 surplus aircraft-months), and the charging pool grows from 6 to 106 chargers.',
      'Archetype key (R05 p.283; the explorer gives the same feedback): “Fleet grows, charging does not” = Limits to Growth, the charging limit (quiz q1-7); “Long procurement delay” = Balancing Process with Delay (q1-8); “Chargers scale, 3-month delivery” = Limits to Growth, the market limit: word of mouth R1 meeting market saturation B4 (q1-5). Students should name which limit is met. The explorer marks three choices as partly fitting: Balancing Process with Delay for the first scenario (the delay explains the 40 aircraft, not the plateau) and for the third (about 14 surplus aircraft); Limits to Growth for the second (riders approach the market limit, but the run isolates the over-build). Growth and Underinvestment and the Attractiveness Principle are acceptable only as argued interpretations that acknowledge the missing link: the model’s charging investment is a fixed policy switch, so stalled growth cannot rationalise further underinvestment.',
      'Step 3 key (runs from “Fleet grows, charging does not”; all values test-pinned). Baseline at 60 months: 2,596 riders, wait 20.3 min, 1,135 surplus aircraft-months, 366 charger-months, 40 aircraft. (a) Chargers scale with the fleet: 28,776 riders, wait 4.2 min, 1,079 surplus aircraft-months, 3,366 charger-months (138 chargers and 276 aircraft at month 60). Over 60 months (a) edges the baseline on surplus aircraft-months as well as riders, so on those two measures it is not a trade-off; the cost it adds is chargers, about nine times the charger-months, which the surplus measure does not count. But the 60-month total flatters (a): the baseline idles about 25 aircraft from month 22, while (a), after the launch months every run shares, carries almost none until month 45 and then about 70 (the month-60 snapshot, 25.6 → 70.5). Over 120 months (a) has 5,284 surplus aircraft-months against the baseline’s 2,671. (b) Count the supply line: riders and wait unchanged (2,596; 20.3 min), surplus aircraft-months 1,135 → 235 (40 → 19 aircraft), no extra chargers. It removes the over-build but not the limit. (c) 12 initial chargers: 5,163 riders, wait 19.3 min, 679 surplus aircraft-months, 732 charger-months. Only (a) brings the month-60 wait below tolerance. Combination (a) + (b): at 60 months 11,107 riders, wait 16.9 min (fleet-limited), 49 surplus aircraft-months, 892 charger-months; at 120 months 26,714 riders (against 28,831 for (a)), wait 6.8 min, still 49 surplus aircraft-months, and 4,984 charger-months (against 11,646). Defensible recommendations: (a) if growth by month 60 is what matters and chargers are cheap relative to the riders gained; (a) + (b) as the capital-efficient path that accepts slower early growth. (b) alone does not answer the question. The strongest memos say which horizon and which measure they would show the committee, and why the snapshot and the 60-month total disagree. Weak answers: “buy more aircraft” without addressing charging; calling (a) a trade-off on 60-month surplus aircraft-months; or calling it free without mentioning chargers or the horizon. Separately, in “Long procurement delay” counting the supply line cuts the surplus including aircraft on order from about 161 to 0 at month 60, and over 120 months surplus aircraft-months fall from about 9,060 to about 49 (the launch fleet’s idle months, common to every run); but riders at month 60 fall from 27,261 to 5,033, a trade-off, not a free fix.',
      'Emergent behaviour that qualifies: the plateau below the charging ceiling (no single element sets it: it is the coupling of fleet, chargers, waits and rider churn) or the fleet over-build (it arises from the delay plus the ordering rule, not from any component).',
    ],
    cautions: [
      'The dynamics model is instructor-authored and FICTIONAL; present it as a teaching model, never as a forecast.',
      'The 6 turnaround chargers rest on instructor assumption A-002 (3 hub vertiports × 2 chargers of the Data Sheet’s 6 × 2); say so if students compute 12 chargers from the Data Sheet.',
      'SEBoK page numbers in citations are PDF page indices (DECISION_LOG W1); printed page numbers in the PDF differ.',
      'Workload (new, pending review; itemised after review W1F-F11): (1) the book-style Learn stage (Overview 5 min, seven sections 55 min, summary 3 min = 63 min, ≈ 1.05 h) against the 0.3 h the reviewed online-instruction row budgets: +0.75 h. (2) Practice missions m1 (10 min) and m2 (15 min), 25 min ≈ 0.4 h, are explorer work tagged to the 1.2 h memo row, but that row already holds 0.4 h of extension reading and the writing of a graduate memo, so they are counted on top: +0.4 h. (3) Missions m3 (15 min) and m4 (20 min) are individual preparation for the team L1 record and stay inside its 2.5 h row; m6 (12 min) is the quiz row. With every reviewed row unchanged, the realistic Week 1 total is 8.0 + 0.75 + 0.4 ≈ 9.2 h (about 9 h), not 8.0 h. These are the author’s minute estimates; the time log (FD-22) should test them. Faculty decision D1 (WEEK1_LEARNING_DESIGN §8) is open: the reading cut proposed there was not applied.',
    ],
  },
  workload: [
    { activity: 'In-class sessions (2 × 75 min)', hours: 2.5 },
    // The book-style Learn stage takes ≈ 1 h of realistic study (Overview 5 min, seven sections 52 min, summary 3 min).
    // On the lead's instruction (2026-10-12) the reviewed rows and the 8.0 h total are kept: readings are NOT cut and no
    // row is shrunk to compensate. Only this row's label changes, stating the gap; see cautions for the realistic total.
    { activity: 'Online direct instruction (budgeted 0.3 h as reviewed; the book-style Learn stage realistically takes ≈ 1.0 h; with missions m1–m2 the realistic week is ≈ 9.2 h, itemised under the time plan)', hours: 0.3, review: 'new-pending-review' },

    { activity: 'Readings R01, R02, R04, R50 (16 pp at ≈ 15 pp/h)', hours: 1 },
    { activity: 'Readiness quiz Q1 / knowledge check', hours: 0.2 },
    { activity: 'L1 completion and team charter (team share, out of class)', hours: 2.5 },
    { activity: 'Graduate leverage-point memo and explorer analysis, including the extension reading R03 pp.268–271 and R05 pp.283–284 (6 pp ≈ 0.4 h)', hours: 1.2 },
    { activity: 'Review notebook entry, time log and AI statement', hours: 0.3 },
  ],
  references: [{ reading: 'R03' }, { reading: 'R05' }, { reading: 'R07' }],
  review: {
    status: 'independently-reviewed',
    reviewer: 'Independent AI reviewer (Claude): review, re-review and sign-off passes',
    date: '2026-10-11',
    report: '_source_cache/review/week01_signoff.md',
    openIssues: [],
  },
}

export default week01
