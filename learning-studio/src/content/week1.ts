// Week 1 lesson content. Every block declares its provenance and, where it draws on a source, verified citations
// (page ranges inside the verified reading register). Source text is PARAPHRASED; short quotations are marked.
// All blocks start as "pending faculty review" (DECISION_LOG A4).
import type { Citation } from './readings'

import type { LessonBlock } from './schema'

export type Principle = { name: string; statement: string; aerolink: string; cite: Citation }

export const WEEK1_INTRO = {
  title: 'Week 1 — Systems, systems thinking and the engineered enterprise',
  question:
    'AeroLink Urban Mobility plans to add aircraft to cut passenger waiting times. Will it work? By the end of this week you should be able to argue the answer from the structure of the system, not from intuition.',
}

export const WEEK1_BLOCKS: LessonBlock[] = [
  {
    id: 'w1-outcomes',
    kind: 'outcomes',
    title: 'Learning outcomes for this week',
    paragraphs: [
      'This week contributes to course outcome B-CLO1: analyse a socio-technical enterprise using systems-thinking principles and life-cycle concepts. Graduate students are expected to complete the advanced analysis and the archetype memo, not only the foundations.',
    ],
    bullets: [
      'B1.1 (Understand) Define system, system of interest, boundary, environment, emergence and enterprise.',
      'B1.2 (Apply) Construct a context diagram and two causal loops for AeroLink.',
      'B1.3 (Analyse) Explain one emergent behaviour of AeroLink causally.',
      'B1.4 (Understand) Describe what systems engineering contributes across a life cycle.',
      'Graduate expectation: identify and defend a leverage point using the dynamics explorer and the system archetypes.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
  {
    id: 'w1-intuition',
    kind: 'intuition',
    title: 'Intuition: a traffic jam is not inside any car',
    paragraphs: [
      'Inspect any single car in a traffic jam and you will not find the jam. The jam exists only in the interactions between cars, drivers, road geometry and timing. Every driver behaves reasonably; the outcome is still one nobody chose.',
      'Air-taxi service behaves the same way. Waiting time is not a property of an aircraft, a charger or a vertiport. It emerges from how demand, fleet, charging and turnaround interact. That is why "buy more aircraft" may or may not shorten waits — and why this course starts with the whole before the parts.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
  {
    id: 'w1-se',
    kind: 'concept',
    title: 'What systems engineering is for',
    paragraphs: [
      'SEBoK describes systems engineering as a transdisciplinary approach for realising successful systems — systems that satisfy the needs of customers, users and other stakeholders. Its province is the engineered system: a technical or socio-technical system that is the subject of a life cycle, designed or adapted to operate in an anticipated environment for intended purposes under constraints.',
      'Two consequences matter immediately. First, the engineered system context includes the other engineered, social and natural systems the system interacts with, so the scope of analysis is wider than the product. Second, systems engineering has boundaries of its own: manufacturing, funding and general management sit in its environment rather than inside it, which is why SE cannot by itself guarantee success.',
    ],
    quote: {
      text: 'A transdisciplinary and integrative approach to enable the successful realization, use, and retirement of engineered systems, using systems principles and concepts, and scientific, technological, and management methods.',
      cite: { reading: 'R01', pages: '52', note: 'INCOSE Fellows definition, as quoted in SEBoK' },
    },
    citations: [{ reading: 'R01', pages: '51–53' }],
    provenance: 'source-paraphrase',
  },
  {
    id: 'w1-soi',
    kind: 'concept',
    title: 'System of interest, boundary and systemic resolution',
    paragraphs: [
      'Observers draw boundaries. When we name a system we choose which elements belong together for our purpose, so several systems of interest (SoIs) can be identified in the same situation. SEBoK calls this way of focusing complex relationships around a chosen boundary systemic resolution, and stresses that boundary choice is an ongoing act of attention, not a one-off decision.',
      'A system context records the SoI and its important relationships: the systems it works with directly and those that influence it. Defining a context balances reductionism (focus on a part) with holism (keep the whole in view); SEBoK places that balance at the heart of a systems approach.',
      'Boundary choice is also ethical and political. SEBoK notes that Churchman and other critical systems thinkers treat the relative power and responsibility of the participants in a system intervention as key factors in defining problem boundaries. Applying this to AeroLink, the communities and regulators affected by vertiport operations have a legitimate stake in where the boundary of an AeroLink study is drawn.',
    ],
    citations: [{ reading: 'R02', pages: '264' }],
    provenance: 'mixed',
  },
  {
    id: 'w1-paradox',
    kind: 'concept',
    title: 'The systems-thinking paradox — and how engineers proceed anyway',
    paragraphs: [
      'To understand a system fully you would need to consider all of its relationships, inside and outside the boundary, in every future situation. That is impossible, which SEBoK calls the systems-thinking paradox.',
      'Engineering proceeds by hiding detail deliberately (encapsulation, separation of concerns) while checking the impact of changes on enough of the surrounding system to stay within acceptable commercial and social risk. How much knowledge is "enough" can be partly codified in rules and processes, but SEBoK is explicit that it ultimately rests on the skill and judgement of the people doing the work.',
      'Holism and separation of concerns look contradictory but are dual ways of handling complexity: one keeps the whole in view, the other divides the problem into manageable concerns. Both are needed; relying on either alone gives insufficient understanding.',
    ],
    citations: [{ reading: 'R02', pages: '266' }, { reading: 'R04', pages: '273–275' }],
    provenance: 'source-paraphrase',
  },
  {
    id: 'w1-analysis-synthesis',
    kind: 'concept',
    title: 'Analysis and synthesis',
    paragraphs: [
      'MITRE distinguishes two complementary modes of thought. Analysis decomposes an entity into components, explains each, and aggregates them — it answers "how does the system work?" and reveals internal structure. Synthesis identifies the larger whole the system is part of, explains that whole, and then identifies the system’s role in it — it answers "why is it what it is?".',
      'MITRE’s worked example is an unmanned aerial vehicle: analysis decomposes it into platform, sensors and communications; synthesis places it inside a situational-awareness system of systems and explains its design from that mission. Combining both views lets an engineer ask "what if?" questions across the enterprise — for example, whether a subsystem performance change matters at mission level.',
    ],
    citations: [{ reading: 'R50', pages: '46–47' }],
    provenance: 'source-paraphrase',
  },
  {
    id: 'w1-worked',
    kind: 'worked-example',
    title: 'Worked example: three candidate systems of interest for AeroLink',
    paragraphs: [
      'Question: "Will adding aircraft reduce average passenger waiting time?" Consider three boundaries and what each can and cannot answer.',
    ],
    bullets: [
      'SoI = the aircraft. Analysis reveals turnaround, seats and range, but waiting time is outside the boundary: this SoI cannot answer the question.',
      'SoI = flight operations (fleet, dispatch, schedule). Fleet size and utilisation are inside, but charging and vertiport pad capacity are treated as fixed environment — the answer will be optimistic if those are the real constraint.',
      'SoI = the AeroLink service enterprise (fleet, vertiports, charging, operations centre, demand). Large enough to contain the feedback between demand, capacity and waiting; small enough to analyse. This is the resolution the Week 1 explorer uses.',
      'Synthesis check: AeroLink itself sits inside an urban transport system and an airspace system shared with others. Those wider systems become environment — they influence AeroLink (airspace access, grid power, public acceptance) but are not designed by it.',
    ],
    citations: [{ reading: 'R02', pages: '264' }, { reading: 'R50', pages: '46–47' }],
    provenance: 'mixed',
  },
  {
    id: 'w1-feedback',
    kind: 'advanced',
    title: 'Advanced analysis: feedback, archetypes and emergent behaviour',
    paragraphs: [
      'Cybernetics distinguishes negative feedback, which maintains a state against a set level, from positive feedback, which drives growth or contraction to new levels (SEBoK Concepts of Systems Thinking). In system-dynamics language these are balancing and reinforcing loops.',
      'The system-dynamics community catalogues recurring structures as system archetypes. SEBoK groups them with antipatterns because they describe behaviour in organisations that is used repeatedly but unsuccessfully to solve recurring problems. Three entries are directly relevant to AeroLink. Limits to Growth: a reinforcing process of growth encounters a balancing process as the limit is approached, and continuing efforts produce diminishing returns. Balancing Process with Delay: delay in the response to corrective action causes the correcting agent to over-correct or to give up. Growth and Underinvestment: where capacity investments could overcome the limits but are not made, growth stalls, which then rationalises further underinvestment.',
      'The explorer below is an instructor-authored stock-and-flow model of AeroLink. Riders recruit riders (reinforcing loop R1) while the remaining potential market shrinks (balancing loop B4, market saturation); long waits deter adoption and drive churn (B1, B2); management orders aircraft when utilisation exceeds a target, sizing orders on current demand and by default ignoring aircraft already on order, a classic decision error (B3, B5); charging may or may not scale with the fleet (B7), and orders may optionally count the supply line (B6). All parameter values are FICTIONAL. Every behaviour this lesson claims about the model is asserted by an automated test that also runs a counterfactual the assertion must reject, so the behaviours are properties of the model, not illustrations drawn by hand.',
      'Matching archetypes to the model needs care. Its structure reproduces Limits to Growth twice, with different limits — the charging limit when chargers stay fixed, and the market limit (word of mouth R1 meeting market saturation B4) when chargers scale with the fleet — and Balancing Process with Delay (long delivery delay). It does not contain Growth and Underinvestment: charger investment is a policy switch that you set, so stalled growth never feeds back into the charging decision, and the model cannot show growth stalling and thereby rationalising further underinvestment. Whether AeroLink’s real capital committee would close that loop is a question to argue in the memo. So is a second reading, the Attractiveness Principle (R05 p.284): faced with several limiting factors, the ordering rule considers aircraft on their own rather than the interdependence between aircraft and charging.',
      'Two features of the diagram reward close reading. First, each arrow’s polarity is a local effect, with every other input held constant. Adoption depends on riders multiplied by the remaining potential market, so, with attractiveness (the waiting time) held constant, the net effect of one more rider on adoption is positive only while riders are fewer than half the potential market (15,000 riders here); above that, market saturation (B4) dominates word of mouth (R1). In the full model more riders also lengthen waits (B1), so when capacity is tight the net effect can turn negative much earlier. Second, capacity is the smaller of fleet capacity and charging capacity, so the fleet → capacity link operates only while the fleet is the limiting resource. A loop can therefore be active in one operating range and absent in another, which is how the dominant loop shifts during a run.',
    ],
    citations: [{ reading: 'R03', pages: '270' }, { reading: 'R05', pages: '283–284' }],
    provenance: 'mixed',
  },
  {
    id: 'w1-application',
    kind: 'application',
    title: 'Aerospace and industry application',
    paragraphs: [
      'Leverage is rarely where the symptom appears. SEBoK notes Forrester’s observation that high-leverage changes are often far removed in time and place from the problem and are frequently pushed in the wrong direction. For an air-taxi operator the symptom (waiting) appears at the passenger interface, while the leverage may sit in charging infrastructure, grid connections or procurement policy — elements owned by different stakeholders.',
      'This is why the Week 2 stakeholder ecosystem map matters: the elements that control AeroLink’s limits (vertiport operators, electric utilities, aircraft manufacturers, airspace providers) are mostly outside AeroLink’s control. MITRE’s guidance asks the engineer to separate what they control, what they influence, and what influences them but is beyond influence.',
    ],
    citations: [{ reading: 'R05', pages: '283' }, { reading: 'R50', pages: '48' }],
    provenance: 'mixed',
  },
  {
    id: 'w1-lab',
    kind: 'lab',
    title: 'Lab L1 — context and causal loops',
    paragraphs: [
      'In teams, following the five L1 steps: (1) choose and justify a system of interest for the driving question, recording at least one boundary you rejected; (2) draw a context diagram with at least six external systems or actors (EXT-001, EXT-002, …), using the boundary exercise below to classify candidate elements as inside the boundary, environment, or irrelevant; (3) draw one reinforcing and one balancing loop with a polarity on every arrow; (4) use the explorer to reproduce one plateau or one over-build and explain it causally, so that it cannot be attributed to any single element; (5) agree a team charter that assigns the four course roles (Requirements & Compliance, Architecture, AI & Data Management, and Verification & Validation; in a 3-person team, AI & Data Management merges with Architecture), decision rules, and each member’s owned ID prefixes. The stakeholder ecosystem editor (Week 2 lab) is already available for teams who finish early.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
]

export const PRINCIPLES: Principle[] = [
  { name: 'Boundary', statement: 'A boundary separates the system from the external world, concentrating interactions inside while allowing exchange with external systems.', aerolink: 'Is the electric grid inside AeroLink’s boundary? Usually not — but its connection capacity is a key exchange.', cite: { reading: 'R04', pages: '274' } },
  { name: 'Holism', statement: 'A system should be considered as a single entity, a whole, not just as a set of parts.', aerolink: 'Waiting time is a whole-system property; no single element owns it.', cite: { reading: 'R04', pages: '274' } },
  { name: 'Interaction', statement: 'Properties, capabilities and behaviour derive from the parts, their interactions, and interactions with other systems.', aerolink: 'Throughput depends on aircraft × chargers × pads interacting, not on any one of them.', cite: { reading: 'R04', pages: '274' } },
  { name: 'Relations', statement: 'A system is characterised by its relations; feedback is a type of relation, and the set of relations defines the network.', aerolink: 'The rider-recruits-rider loop is a relation, not a component.', cite: { reading: 'R04', pages: '275' } },
  { name: 'Separation of concerns', statement: 'A larger problem is more effectively solved when decomposed into smaller problems or concerns.', aerolink: 'Charging, scheduling and pad operations can be studied separately — if one concern remains the whole.', cite: { reading: 'R04', pages: '275' } },
  { name: 'View', statement: 'Multiple views, each based on a system aspect or concern, are essential to understand a complex system.', aerolink: 'Passengers, regulators and investors each need a different view of the same enterprise.', cite: { reading: 'R04', pages: '275' } },
  { name: 'Equifinality', statement: 'In open systems the same final state may be reached from different initial conditions and in different ways.', aerolink: 'Shorter waits can come from more aircraft, faster charging or better scheduling.', cite: { reading: 'R04', pages: '274' } },
  { name: 'Parsimony', statement: 'Choose the simplest explanation, the one with the fewest assumptions — in design, operations and requirements.', aerolink: 'Explain the plateau with the simplest loop structure that reproduces it.', cite: { reading: 'R04', pages: '275' } },
]

/** L1 boundary exercise: classify candidate elements for the question in WEEK1_INTRO (instructor-authored key). */
export type BoundaryClass = 'inside' | 'environment' | 'irrelevant'
export const BOUNDARY_ITEMS: { id: string; name: string; answer: BoundaryClass; why: string }[] = [
  { id: 'b1', name: 'AeroLink aircraft fleet', answer: 'inside', why: 'Fleet size is the decision variable under study.' },
  { id: 'b2', name: 'Vertiport chargers', answer: 'inside', why: 'Charging capacity limits throughput; it must be inside to test the claim.' },
  { id: 'b3', name: 'Dispatch and scheduling (operations centre)', answer: 'inside', why: 'Turns fleet and chargers into served trips.' },
  { id: 'b4', name: 'Passenger demand and rider word-of-mouth', answer: 'inside', why: 'Inside the analysis boundary because it is endogenous to the feedback under study: demand responds to waiting time, which is the point of the question. Note the criterion: AeroLink does not control passengers any more than it controls the grid, so this is a model-boundary (endogenous variable) argument, not a control argument.' },
  { id: 'b5', name: 'Electric grid', answer: 'environment', why: 'Influences charging capacity but is not designed or controlled by AeroLink.' },
  { id: 'b6', name: 'Airspace managed by the air navigation service provider', answer: 'environment', why: 'Constrains schedule density; outside AeroLink’s control.' },
  { id: 'b7', name: 'Weather', answer: 'environment', why: 'Natural system that affects operations; not designed by AeroLink.' },
  { id: 'b8', name: 'Aircraft cabin interior colour scheme', answer: 'irrelevant', why: 'No plausible causal path to waiting time for this question.' },
  { id: 'b9', name: 'Aircraft manufacturer delivery lead time', answer: 'environment', why: 'Sets the procurement delay — a key influence that AeroLink cannot set.' },
]
