// Week 1 book-style flow: Learn sections L1–L7, the opener, the summary, the practice plan and the bridge
// (docs/redesign/WEEK1_LEARNING_DESIGN.md). Explanations are REFERENCES into the reviewed Week 1 text (resolve.ts cuts
// them; nothing reviewed is retyped). Every item written for this flow — questions, "in short" lines, bridges, check
// questions and their feedback, key-term definitions, figure captions — carries `review: 'new-pending-review'`
// (search for that string to find them all) and makes no factual claim beyond the reviewed Week 1 content or a
// register citation. AeroLink numbers are FICTIONAL and are computed from src/sim/aerolink.ts, never retyped;
// src/content/learn/week01.test.ts and src/sim/aerolink.test.ts assert the derived ones.
import { ALL_LOOPS, LOOP_LINKS, LOOP_NODES } from '../causalLoops'
import { DAYS, DEFAULT_PARAMS, chargingCapacityOf, fleetCapacityOf, runScenario, simulate } from '../../sim/aerolink'
import week01 from '../weeks/week01'
import week1Missions from '../missions/week01'
import { PENDING, type LearnSection, type NewText } from './types'


const n = (text: string): NewText => ({ text, review: PENDING })
const fmt = (x: number) => Math.round(x).toLocaleString('en-US')
const ordinal = (k: number) => `${k}${k % 100 >= 11 && k % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[k % 10] ?? 'th'}`

// ------------------------------------------------------------------------------------------- derived FICTIONAL numbers
const P = DEFAULT_PARAMS
/** Trips one aircraft can fly in a month (20 × 30 = 600). */
export const TRIPS_PER_AIRCRAFT_MONTH = P.tripsPerAircraftPerDay * DAYS
/** Charges per charger per day (16 × 60 ÷ 20 = 48). */
export const CHARGES_PER_CHARGER_DAY = (P.operatingHoursPerDay * 60) / P.chargeMinutesPerTrip
export const FLEET_CAP_12 = fleetCapacityOf(P, P.initialFleet) // 7,200
export const CHARGE_CAP_6 = chargingCapacityOf(P, P.chargers) // 8,640
export const CROSSOVER_6 = CHARGE_CAP_6 / TRIPS_PER_AIRCRAFT_MONTH // 14.4
/** Check C6 (design D5): policy (c), 12 initial chargers. */
export const C6_CHARGERS = 12
export const C6_CHARGE_CAP = chargingCapacityOf(P, C6_CHARGERS) // 17,280
export const C6_CROSSOVER = C6_CHARGE_CAP / TRIPS_PER_AIRCRAFT_MONTH // 28.8
export const C6_FIRST_CHARGING_LIMITED = Math.ceil(C6_CROSSOVER) // 29
/** Figure F4a: 40 aircraft flying alone vs what the coupled system delivers ("Fleet grows, charging does not"). */
const UNDER = runScenario('underinvestment')
export const F4_FLEET = UNDER.at(-1)!.fleet // 40
export const F4_ALONE = fleetCapacityOf(P, F4_FLEET) // 24,000
export const F4_DELIVERED = UNDER.at(-1)!.served // ≈ 7,788
export const F4_PER_AIRCRAFT_DAY = F4_DELIVERED / F4_FLEET / DAYS // ≈ 6.5
export const PLATEAU = F4_DELIVERED
/** Figure 6, third series (review W1F-F04): trips served at month 60 with the fleet held at each size from 10 to 40
 *  aircraft (default parameters, no fleet expansion). Below the crossover the fleet caps it; from 15 aircraft it is the
 *  churn-loop plateau. Computed from the model, never drawn by hand. */
export const FIGURE6_FLEETS = Array.from({ length: 31 }, (_, i) => 10 + i)
export const SERVED_FROZEN: { fleet: number; served: number }[] = FIGURE6_FLEETS.map((fleet) => ({ fleet, served: simulate({ ...P, initialFleet: fleet, expandFleet: false }).at(-1)!.served }))
/** Check C6, distractor: the crossover if one used 50 charges per charger per day instead of 16 × 60 ÷ 20 = 48. */
export const C6_WRONG_50 = Math.ceil((C6_CHARGERS * 50 * DAYS) / TRIPS_PER_AIRCRAFT_MONTH) // 30

// ------------------------------------------------------------------------------------------- loop helpers (C5, L5 worked)
const nodeLabel = (id: string) => LOOP_NODES.find((x) => x.id === id)!.label
const pol = (from: string, to: string) => LOOP_LINKS.find((l) => l.from === from && l.to === to)!.polarity
/** "riders →(+) trip demand →(+) …" built from LOOP_LINKS, so the check can never disagree with the diagram. */
export function loopChain(path: string[]): string {
  return path.map((id, i) => `${nodeLabel(id).toLowerCase()} →(${pol(id, path[(i + 1) % path.length])})`).join(' ') + ` ${nodeLabel(path[0]).toLowerCase()}`
}
export const negativesIn = (path: string[]) => path.filter((id, i) => pol(id, path[(i + 1) % path.length]) === '−').length
const R1_PATH = ALL_LOOPS.find((l) => l.id === 'R1')!.path
const B1_PATH = ALL_LOOPS.find((l) => l.id === 'B1')!.path
/** Check C5 (review W1F-F02, sign-off N1): a loop the explorer does NOT contain (the model has no maintenance), so neither
 *  Figure 5 nor any loop list on the page can give the answer. It is deliberately not the instructor-notes L1 example
 *  (the noise loop, which teams must find for themselves) and not quiz q1-4; it has an EVEN count, so its key differs
 *  from q1-4's too. */
export const C5_LOOP = 'maintenance backlog →(−) aircraft available →(−) flying hours per available aircraft →(+) wear on each aircraft →(+) maintenance backlog'

// ------------------------------------------------------------------------------------------- the seven Learn sections
export const LEARN_SECTIONS: LearnSection[] = [
  {
    id: 'l1',
    code: 'L1',
    title: 'What a system is',
    question: n('What makes something a system, and why is AeroLink an open one?'),
    inShort: n('A system is a bounded whole whose elements interact. AeroLink is open because it also interacts with systems outside its boundary.'),
    teaser: n('Wholeness, interaction, open systems, state and events.'),
    objectives: ['B1.1'],
    bloom: 'Understand',
    solo: 'multistructural',
    minutes: 5,
    maxWords: 350,
    body: [
      { ref: { block: 'w1-emergence', para: 0 } },
      { ref: { block: 'w1-emergence', para: 1 } },
      {
        text: 'In this week’s dynamics explorer you follow AeroLink’s state through a few named variables, among them Riders, Fleet, Chargers and Waiting time. The names come from the model’s causal-loop diagram: L5 shows part of it, and Practice shows it all.',
        provenance: 'instructor-authored',
        review: PENDING,
      },
    ],
    figures: [
      {
        id: 'open-system',
        title: 'AeroLink as an open system',
        caption: n('Elements interact inside the boundary; exchanges cross it. The six external systems are the instructor reference context (EXT-001 to EXT-006). “Service enterprise” is this week’s name for the system of interest; L7 shows that SEBoK’s enterprise is wider.'),
        alt: 'A rounded boundary labelled AeroLink service enterprise contains passenger demand, the operations centre, the fleet, and vertiports and chargers, joined by arrows: demand to the operations centre, the operations centre to the fleet, the fleet to the chargers. Six external systems sit outside it, each joined to the boundary by a labelled exchange; the weather arrow points one way, into the boundary. A small panel shows three state variables.',
        textEquivalent: 'Inside the boundary: passenger demand; operations centre; fleet; vertiports and chargers. Inside links: demand goes to the operations centre, which dispatches the fleet, which uses the chargers. Outside, with the exchange that crosses the boundary: EXT-001 Air navigation service provider (airspace access); EXT-002 Electric utility grid (power); EXT-003 Weather (constrains operations; one way, inward); EXT-004 Aircraft manufacturer (aircraft, delivery lead time); EXT-005 Public transport network (passengers); EXT-006 Emergency services (incident response). State at month 0 of the explorer’s default run (FICTIONAL): riders, fleet and waiting time.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'System', def: 'A set of elements with enough cohesion to form a bounded whole.' },
        { term: 'Element', def: 'A part of a system; interaction between elements is the key system concept.' },
        { term: 'Boundary', def: 'Separates the system from the external world, concentrating interactions inside while allowing exchange with external systems.' },
        { term: 'Environment', def: 'The other systems, outside the boundary, that the system interacts with.' },
        { term: 'Open system', def: 'Defined by the interactions inside its boundary and by its interactions with systems in its environment.' },
        { term: 'State', def: 'The set of a system’s attributes at a given time, monitored through state variables.' },
        { term: 'Event', def: 'A change in the environment that can change the system’s state.' },
      ],
    },
    check: {
      id: 'c1',
      bloom: 'Understand',
      solo: 'multistructural',
      objective: 'B1.1',
      prompt: 'An analyst studies only AeroLink’s operations centre for one morning. Its dispatch rules stay fixed, but weather reports, airspace slot changes and new bookings keep arriving from outside, and each can change which aircraft fly next. In SEBoK’s sense, is this system of interest open or closed, and why?',
      options: [
        { id: 'a', text: 'Open: what arrives across its boundary from other systems can change its state.', correct: true, feedback: 'Yes. Weather, airspace and bookings are systems in its environment; exchanges with them change the centre’s state (an event, in SEBoK’s terms). An open system is defined by those outside interactions as well as by the ones inside its boundary.' },
        { id: 'b', text: 'Closed: its own dispatch rules are fixed, so nothing outside can change it.', correct: false, feedback: 'No. Fixed rules do not stop outside events from changing the state: a weather report or a new booking changes which aircraft fly, even with the same rules.' },
        { id: 'c', text: 'Open: it has many interacting parts, such as dispatchers, aircraft and schedules.', correct: false, feedback: 'Right label, wrong reason. Interaction among the parts makes it a system; what makes it open is its interaction with systems outside its boundary.' },
        { id: 'd', text: 'Neither: openness applies only to a whole enterprise, not to one of its parts.', correct: false, feedback: 'No. Any system of interest, including one part of AeroLink, is open if it interacts with systems in its environment.' },
      ],
      cite: { reading: 'R03', pages: '268–271' },
      review: PENDING,
    },
    cite: [{ reading: 'R03', pages: '268–271' }, { reading: 'R04', pages: '274' }],
    readMore: [{ reading: 'R03', pages: '268–269' }],
    goDeeper: ['w1-emergence'],
  },
  {
    id: 'l2',
    code: 'L2',
    title: 'System of interest, boundary and context',
    question: n('Who decides where the system stops, and how do you know the boundary is right?'),
    inShort: n('The observer chooses the boundary for a purpose. A boundary is fit for purpose when it contains the causes behind your question yet stays small enough to analyse, and you revisit it as you learn.'),
    teaser: n('Systems of interest, systemic resolution, context, and three candidate boundaries for AeroLink.'),
    objectives: ['B1.1', 'B1.2'],
    bloom: 'Apply',
    solo: 'relational',
    minutes: 8,
    maxWords: 550,
    body: [
      { ref: { block: 'w1-soi', para: 0 } },
      { ref: { block: 'w1-soi', para: 1 } },
      { ref: { block: 'w1-soi', para: 2 }, callout: 'Boundaries are also ethical' },
    ],
    worked: { kind: 'bullets', title: 'Worked example: three candidate systems of interest', intro: { block: 'w1-worked', para: 0 }, block: 'w1-worked', bullets: [0, 1, 2, 3] },
    figures: [
      {
        id: 'boundary-layers',
        title: 'Three boundaries on one drawing',
        caption: n('Choose a boundary to see what it contains and what it can answer. Waiting time is outside A, has its charging cause outside B, and lies inside C.'),
        alt: 'Three nested rounded boundaries: A the aircraft, B flight operations, C the AeroLink service enterprise. A token for waiting time sits outside A, overlaps the edge of B and lies inside C. The urban transport and airspace systems are drawn outside C as environment.',
        textEquivalent: 'A, the aircraft: turnaround, seats and range are inside; waiting time is outside, so this boundary cannot answer the question. B, flight operations (fleet, dispatch, schedule): fleet size and utilisation are inside; charging and vertiport pad capacity are treated as fixed environment. C, the AeroLink service enterprise (adds vertiports and charging, operations centre, demand): contains the feedback between demand, capacity and waiting. Outside C: the urban transport system and the shared airspace system, which influence AeroLink but are not designed by it.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'System of interest (SoI)', def: 'The system an observer chooses to study, for a purpose; several can be identified in the same situation.' },
        { term: 'Systemic resolution', def: 'Focusing complex relationships around a chosen boundary; an ongoing act of attention, not a one-off decision.' },
        { term: 'System context', def: 'The SoI and its important relationships: the systems it works with directly and those that influence it.' },
        { term: 'Reductionism and holism', def: 'Focusing on a part versus keeping the whole in view; defining a context balances the two.' },
      ],
    },
    check: {
      id: 'c2',
      bloom: 'Apply',
      solo: 'relational',
      objective: 'B1.2',
      prompt: 'A fourth team draws its boundary around the charging network alone: the turnaround chargers, their schedule and their grid connection. For the driving question (will adding aircraft reduce average waiting time?), what can this boundary tell them?',
      options: [
        { id: 'a', text: 'Only how many trips charging can support; demand and fleet, which decide waits, lie outside it.', correct: true, feedback: 'Yes. Test it against the question as the worked example does: charging capacity is inside, but the fleet, demand and the waiting they produce are environment, so this boundary can bound the answer without giving it.' },
        { id: 'b', text: 'The full answer, because charging is likely to become AeroLink’s constraint as the fleet grows.', correct: false, feedback: 'No. Charging may become the constraint, but whether it binds depends on the fleet and on demand, which this boundary leaves outside, and waits come from demand meeting capacity.' },
        { id: 'c', text: 'Little of use, since waiting is a passenger experience rather than a technical quantity.', correct: false, feedback: 'No. Waiting time lies inside the service-enterprise boundary of the worked example, and even this narrow boundary tells you a real limit on trips.' },
        { id: 'd', text: 'Whether more aircraft cut waits, because every aircraft must visit a charger after each trip.', correct: false, feedback: 'No. Aircraft use the chargers, but how many aircraft fly, and how much demand they meet, lies outside this boundary, so it cannot say what more aircraft would do to waits.' },
      ],
      cite: { reading: 'R02', pages: '264' },
      review: PENDING,
    },
    cite: [{ reading: 'R02', pages: '264' }, { reading: 'R50', pages: '46–47' }],
    readMore: [{ reading: 'R02', pages: '264' }],
    goDeeper: ['w1-soi', 'w1-worked'],
  },
  {
    id: 'l3',
    code: 'L3',
    title: 'Two ways to handle complexity',
    question: n('If you can never consider everything, how do engineers proceed?'),
    inShort: n('Engineers hide detail on purpose and still keep the whole in view: separation of concerns with holism, analysis with synthesis.'),
    teaser: n('The systems-thinking paradox; holism and separation of concerns; analysis and synthesis.'),
    objectives: ['B1.1'],
    bloom: 'Understand',
    solo: 'relational',
    minutes: 8,
    maxWords: 550,
    body: [
      { ref: { block: 'w1-paradox', para: 0 } },
      { ref: { block: 'w1-paradox', para: 1 } },
      { ref: { block: 'w1-paradox', para: 2 } },
      { ref: { block: 'w1-analysis-synthesis', para: 0 } },
      { ref: { block: 'w1-analysis-synthesis', para: 1 } },
      { text: 'For AeroLink, analysis tells you how the service enterprise works; synthesis tells you why it is what it is.', provenance: 'instructor-authored', review: PENDING },
    ],
    figures: [
      {
        id: 'down-and-up',
        title: 'Analysis looks down, synthesis looks up',
        caption: n('Two modes of thought side by side. Analysis decomposes AeroLink into its parts; synthesis places AeroLink inside the larger systems it serves.'),
        alt: 'Two panels. Left, analysis: a tree from AeroLink service enterprise down to fleet, chargers and operations centre, labelled how does it work. Right, synthesis: AeroLink drawn inside the urban transport system and the shared airspace system, labelled why is it what it is.',
        textEquivalent: 'Analysis (how does it work?): AeroLink service enterprise decomposes into fleet, chargers and operations centre, each explained and then aggregated. Synthesis (why is it what it is?): AeroLink sits inside an urban transport system and an airspace system shared with others; its role in those wider systems explains its design.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Systems-thinking paradox', def: 'Full understanding would need every relationship in every future situation, which is impossible.' },
        { term: 'Encapsulation', def: 'Hiding a subsystem’s internals behind a boundary.' },
        { term: 'Separation of concerns', def: 'Dividing a larger problem into smaller, more manageable concerns.' },
        { term: 'Holism', def: 'Considering a system as a single whole, not just as a set of parts.' },
        { term: 'Analysis', def: 'Decompose, explain each part, aggregate: answers “how does the system work?”.' },
        { term: 'Synthesis', def: 'Identify the larger whole, explain it, then the system’s role in it: answers “why is it what it is?”.' },
      ],
    },
    check: {
      id: 'c3',
      bloom: 'Understand',
      solo: 'relational',
      objective: 'B1.1',
      prompt: 'Engineer A decomposes AeroLink into fleet, chargers and operations centre and explains each. Engineer B asks which larger system AeroLink serves and explains its design from that role. Which statement is right?',
      options: [
        { id: 'a', text: 'A is doing analysis and B synthesis; both are needed.', correct: true, feedback: 'Yes. Decomposing and explaining each part is analysis; explaining the system from its role in a larger whole is synthesis. MITRE treats them as complementary.' },
        { id: 'b', text: 'Only A is doing systems engineering.', correct: false, feedback: 'No. MITRE treats analysis and synthesis as complementary: systems thinking combines both perspectives in a single view.' },
        { id: 'c', text: 'Both are doing analysis at different levels of detail.', correct: false, feedback: 'No. B is not decomposing at all: B looks outward to the whole AeroLink is part of, which is synthesis.' },
        { id: 'd', text: 'B’s approach replaces A’s once the boundary is fixed.', correct: false, feedback: 'No. The two modes are complementary; combining them is what lets an engineer ask “what if?” questions across the enterprise.' },
      ],
      cite: { reading: 'R50', pages: '46–47' },
      review: PENDING,
    },
    cite: [{ reading: 'R02', pages: '266' }, { reading: 'R04', pages: '273–275' }, { reading: 'R50', pages: '46–47' }],
    readMore: [{ reading: 'R02', pages: '266' }, { reading: 'R04', pages: '273–275' }, { reading: 'R50', pages: '46–47' }],
    goDeeper: ['w1-paradox', 'w1-analysis-synthesis'],
  },
  {
    id: 'l4',
    code: 'L4',
    title: 'Emergence and hierarchy',
    question: n('Why can the whole do more, or less, than its parts?'),
    inShort: n('Behaviour emerges from interactions, so the whole can be greater or less than the sum of its parts. Complex systems form hierarchies; socio-technical ones form control hierarchies.'),
    teaser: n('Emergence, synergy and reducing variety, hierarchy and control hierarchy.'),
    objectives: ['B1.1', 'B1.3'],
    bloom: 'Understand',
    solo: 'relational',
    minutes: 6,
    maxWords: 450,
    body: [
      { ref: { block: 'w1-intuition', para: 0 } },
      { ref: { block: 'w1-intuition', para: 1 } },
      { ref: { block: 'w1-emergence', para: 2 } },
      { ref: { block: 'w1-emergence', para: 3 } },
    ],
    figures: [
      {
        id: 'less-than-sum',
        title: 'Less than the sum of the parts',
        caption: n(`FICTIONAL values from the dynamics explorer (“Fleet grows, charging does not”, month 60). The aircraft deliver less than their sum because they are coupled through ${P.chargers} shared chargers and riders’ response to waiting; the middle bar separates the two causes.`),
        alt: `Three horizontal bars. The first, ${fmt(F4_ALONE)} trips a month, is the fleet capacity of ${F4_FLEET} aircraft with charging ignored. The second, ${fmt(CHARGE_CAP_6)}, is the ceiling set by ${P.chargers} shared chargers. The third, about ${fmt(F4_DELIVERED)} trips a month, is what the coupled system delivers once riders respond to waiting: about ${F4_PER_AIRCRAFT_DAY.toFixed(1)} trips per aircraft per day.`,
        textEquivalent: `Fleet capacity with charging ignored: ${F4_FLEET} aircraft × ${P.tripsPerAircraftPerDay} trips a day × ${DAYS} days = ${fmt(F4_ALONE)} trips a month. Ceiling with ${P.chargers} shared chargers: ${fmt(CHARGE_CAP_6)} trips a month (the coupling through shared chargers removes most of the gap). Delivered by the coupled system at month 60: about ${fmt(F4_DELIVERED)} trips a month, about ${F4_PER_AIRCRAFT_DAY.toFixed(1)} trips per aircraft per day (riders’ response to waiting removes the rest).`,
        review: PENDING,
      },
      {
        id: 'control-hierarchy',
        title: 'A control hierarchy',
        caption: n('Higher levels have some ownership of control over lower ones. Labels from the reviewed AeroLink example.'),
        alt: 'Three stacked boxes: airspace authority at the top, operations centre in the middle, dispatch at the bottom. The arrow from the airspace authority to the operations centre is labelled constrains; the arrow from the operations centre to dispatch is labelled controls.',
        textEquivalent: 'Airspace authority constrains the operations centre; the operations centre controls dispatch.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Emergence', def: 'Behaviour that arises from combinations of element behaviours across a system hierarchy.' },
        { term: 'Synergy (weak emergence)', def: 'The whole is greater than the sum of the parts.' },
        { term: 'Reducing variety', def: 'The whole function is less than the sum of the parts.' },
        { term: 'Hierarchy', def: 'Strongly cohesive elements grouped into structures that reduce complexity and increase robustness.' },
        { term: 'Control hierarchy', def: 'Systems at a higher level have some ownership of control over those at lower levels.' },
      ],
    },
    check: {
      id: 'c4',
      bloom: 'Understand',
      solo: 'relational',
      objective: 'B1.1',
      prompt: 'After AeroLink’s fleet grows, its share of on-time departures falls, yet every aircraft, charger and dispatcher still meets its own specification when tested alone. Which explanation fits?',
      options: [
        { id: 'a', text: 'Punctuality comes from how the parts interact, so it can fall even when every part passes its test.', correct: true, feedback: 'Yes. On-time departure is a whole-system property, like waiting time: it emerges from the interactions (more aircraft queuing for the same chargers, for instance), so testing parts one at a time cannot find it (Holism, R04 p.274).' },
        { id: 'b', text: 'One of the parts is probably failing its specification in service, and the tests miss it.', correct: false, feedback: 'No. That assumes the whole can fail only if a part fails. Emergent behaviour, including reducing variety, can appear with every part in specification.' },
        { id: 'c', text: 'The operations centre controls dispatch, so its rules alone must explain the drop.', correct: false, feedback: 'No. Being higher in the control hierarchy is not ownership of an emergent property; the drop arises from the interactions across the system.' },
        { id: 'd', text: 'Adding parts tends to make a whole perform better, so the punctuality data are likely wrong.', correct: false, feedback: 'No. SEBoK notes the opposite case too: reducing variety, where the whole function is less than the sum of the parts.' },
      ],

      cite: { reading: 'R04', pages: '274' },
      review: PENDING,
    },
    cite: [{ reading: 'R03', pages: '268–271' }],
    readMore: [{ reading: 'R03', pages: '271' }],
    goDeeper: ['w1-intuition', 'w1-emergence'],
  },
  {
    id: 'l5',
    code: 'L5',
    title: 'Feedback loops and polarity',
    question: n('How do you read a causal-loop diagram, and how do you tell a reinforcing loop from a balancing one?'),
    inShort: n('Every arrow has a polarity; count the negative links around a loop. Even means reinforcing, odd means balancing.'),
    teaser: n('Reinforcing and balancing feedback, link polarity, and the counting rule.'),
    objectives: ['B1.2'],
    bloom: 'Apply',
    solo: 'relational',
    minutes: 8,
    maxWords: 500,
    body: [
      { ref: { block: 'w1-feedback', para: 0 } },
      { ref: { block: 'w1-feedback', para: 4 } },
      {
        text: 'Count the negative links around the loop. An even number, including zero, means a reinforcing loop; an odd number means a balancing loop. The variable names never decide it. This is standard system-dynamics practice, used here as a course convention: the readings distinguish negative from positive feedback but do not state the rule.',
        provenance: 'instructor-authored',
        review: PENDING,
        callout: 'The counting rule (course convention)',
      },
    ],
    worked: { kind: 'loop', title: 'Worked example: loop B1, waiting deters adoption', loop: 'B1', intro: n('Step through the loop one link at a time and keep a count of the negative links.') },
    figures: [
      {
        id: 'loop-pair',
        title: 'Two loops from the AeroLink model: R1 and B1',
        caption: n('Only loops R1 and B1 are drawn. Solid teal arrows belong to R1 only, dashed orange arrows to B1 only; the arrow from adoption to riders closes both loops. The full diagram, with every loop, is in Practice.'),
        alt: 'A causal-loop diagram with six variables. A small loop marked R1 joins riders and word-of-mouth adoption. A larger loop marked B1 runs from riders through trip demand, utilisation, waiting time and service attractiveness to adoption and back to riders. Every arrow carries a plus or minus polarity label; only the arrow from waiting time to service attractiveness is minus.',
        textEquivalent: `R1 (reinforcing, no negative links): ${loopChain(R1_PATH)}. B1 (balancing, one negative link): ${loopChain(B1_PATH)}. The link from word-of-mouth adoption to riders belongs to both loops.`,
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Causal link', def: 'An arrow from a cause to an effect.' },
        { term: 'Polarity', def: 'The local effect of a change in the cause, everything else held constant: + same direction, − opposite direction.' },
        { term: 'Reinforcing loop (R)', def: 'Positive feedback: drives growth or contraction to new levels; an even number of negative links.' },
        { term: 'Balancing loop (B)', def: 'Negative feedback: maintains a state against a set level; an odd number of negative links.' },
        { term: 'Conditional link', def: 'A link that operates only in one operating range or under one policy.' },
        { term: 'Dominant loop', def: 'The loop that drives behaviour in a given operating range; it can shift during a run.' },
      ],
    },
    check: {
      id: 'c5',
      bloom: 'Apply',
      solo: 'multistructural',
      objective: 'B1.2',
      prompt: `A team proposes a loop that the explorer does not contain. Call it loop X: ${C5_LOOP}. Classify loop X and give the reason.`,
      options: [
        { id: 'a', text: 'Reinforcing: it has two negative links, and an even count means reinforcing.', correct: true, feedback: 'Yes. Backlog → aircraft available and aircraft available → flying hours per available aircraft are both negative: two, an even number, so loop X is reinforcing. A growing backlog feeds itself, a vicious circle (the counting rule is a course convention; see the box above).' },
        { id: 'b', text: 'Balancing: a growing backlog takes aircraft out of service, which limits flying.', correct: false, feedback: 'No. Follow the whole loop, not the first link: fewer aircraft available means each remaining aircraft flies more hours, wears faster and adds to the backlog. Two negative links: reinforcing.' },
        { id: 'c', text: 'Balancing: it contains negative links, and a negative link opposes the change.', correct: false, feedback: 'No. A negative link reverses the direction of change locally, but the loop type depends on whether the count of negative links is even or odd. Here there are two, an even number, so loop X is reinforcing.' },
        { id: 'd', text: 'Neither: a loop that mixes positive and negative links has no type.', correct: false, feedback: 'No. Most loops mix polarities. Every closed loop is either reinforcing or balancing, decided by whether its count of negative links is even or odd.' },
      ],
      cite: { reading: 'R03', pages: '270' },
      review: PENDING,
    },
    cite: [{ reading: 'R03', pages: '270' }],
    readMore: [{ reading: 'R03', pages: '270' }],
    goDeeper: ['w1-feedback'],
  },
  {
    id: 'l6',
    code: 'L6',
    title: 'Binding constraints, archetypes and leverage',
    question: n('Why does adding aircraft stop helping, and why do served trips level off below the ceiling?'),
    inShort: n('Capacity is set by the binding constraint, which moves as you relieve it; the churn loop holds served trips below the charging ceiling.'),
    teaser: n('Capacity by hand, the crossover fleet, the plateau, and three system archetypes.'),
    objectives: ['B1.3'],
    bloom: 'Analyse',
    solo: 'relational',
    minutes: 12,
    maxWords: 800,
    body: [],
    worked: {
      kind: 'faded',
      title: 'Worked example: where is the binding constraint?',
      setup: { block: 'w1-worked-capacity', para: 0, sentences: [0, 1] },
      steps: [
        { kind: 'shown', title: 'Fleet capacity', body: [{ block: 'w1-worked-capacity', para: 1, sentences: [0, 0] }] },
        { kind: 'shown', title: 'Charging capacity', body: [{ block: 'w1-worked-capacity', para: 1, sentences: [1, 1] }] },
        { kind: 'shown', title: 'Which constraint binds: demand first, then the fleet', body: [{ block: 'w1-worked-capacity', para: 1, sentences: [2, 4] }] },
        {
          kind: 'input',
          title: 'Crossover fleet',
          prompt: 'Your turn: set the two capacities equal. At what fleet size are they equal? (It need not be a whole number.)',
          answer: CROSSOVER_6,
          tolerance: 0.05,
          near: { value: Math.ceil(CROSSOVER_6), feedback: `Close. From the ${ordinal(Math.ceil(CROSSOVER_6))} aircraft charging limits capacity, but the two capacities are equal at a fleet that is not a whole number; the worked line is below.` },
          body: [{ block: 'w1-worked-capacity', para: 2, sentences: [0, 1] }],
        },
        { kind: 'shown', title: 'Why the plateau sits below the ceiling', body: [{ block: 'w1-worked-capacity', para: 3 }] },
        { kind: 'shown', title: 'Two lessons that generalise', body: [{ block: 'w1-worked-capacity', para: 4, sentences: [1, 2] }, { block: 'w1-worked-capacity', para: 4, sentences: [4, 4] }] },
      ],
    },
    afterWorked: [
      { ref: { block: 'w1-feedback', para: 1 } },
      { ref: { block: 'w1-feedback', para: 3, sentences: [0, 2] }, callout: 'What the explorer’s model does not contain' },
    ],
    figures: [
      {
        id: 'capacity-crossover',
        title: 'Capacity crossover',
        caption: n(`FICTIONAL default parameters. Fleet capacity rises ${TRIPS_PER_AIRCRAFT_MONTH} trips a month per aircraft; charging capacity stays at ${fmt(CHARGE_CAP_6)} with ${P.chargers} chargers. The third line is what the model serves at month 60 with the fleet held at each size: it never exceeds capacity and levels off below the ceiling. The crossover is marked only after the worked step below has been answered.`),
        alt: `Line chart of monthly trips against fleet size from 10 to 40 aircraft. Fleet capacity rises in a straight line from ${fmt(fleetCapacityOf(P, 10))} to ${fmt(fleetCapacityOf(P, 40))} trips. Charging capacity is flat at ${fmt(CHARGE_CAP_6)}. The lines cross at ${CROSSOVER_6.toFixed(1)} aircraft. Trips served at month 60, with the fleet held at each size, rise from about ${fmt(SERVED_FROZEN[0].served)} at 10 aircraft and level off at about ${fmt(PLATEAU)} from ${Math.ceil(CROSSOVER_6)} aircraft (the churn-loop plateau).`,
        textEquivalent: `Fleet capacity = aircraft × ${TRIPS_PER_AIRCRAFT_MONTH} trips a month (12 aircraft: ${fmt(FLEET_CAP_12)}; 14: ${fmt(fleetCapacityOf(P, 14))}; 15: ${fmt(fleetCapacityOf(P, 15))}; 40: ${fmt(fleetCapacityOf(P, 40))}). Charging capacity with ${P.chargers} chargers = ${fmt(CHARGE_CAP_6)} at every fleet size. Crossover at ${CROSSOVER_6.toFixed(1)} aircraft. Trips served at month 60 with the fleet held at that size: ${[10, 12, 13, 14, 15, 40].map((f) => `${f} aircraft ${fmt(SERVED_FROZEN.find((x) => x.fleet === f)!.served)}`).join('; ')} (the plateau, about ${fmt(PLATEAU)}, from ${Math.ceil(CROSSOVER_6)} aircraft on).`,
        preReveal: {
          alt: `Line chart of monthly trips against fleet size from 10 to 40 aircraft. Fleet capacity rises in a straight line from ${fmt(fleetCapacityOf(P, 10))} to ${fmt(fleetCapacityOf(P, 40))} trips. Charging capacity is flat at ${fmt(CHARGE_CAP_6)}. Trips served at month 60, with the fleet held at each size, rise from about ${fmt(SERVED_FROZEN[0].served)} at 10 aircraft and then level off at about ${fmt(PLATEAU)} (the churn-loop plateau). The crossover is shown after you answer the worked step.`,
          textEquivalent: `Fleet capacity = aircraft × ${TRIPS_PER_AIRCRAFT_MONTH} trips a month (10 aircraft: ${fmt(fleetCapacityOf(P, 10))}; 40: ${fmt(fleetCapacityOf(P, 40))}). Charging capacity with ${P.chargers} chargers = ${fmt(CHARGE_CAP_6)} at every fleet size. Trips served at month 60 with the fleet held at that size rise from about ${fmt(SERVED_FROZEN[0].served)} at 10 aircraft to a plateau of about ${fmt(PLATEAU)}. The crossover and the served values near it are given after you answer the worked step.`,
        },
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Binding constraint', def: 'The resource or factor that currently limits throughput: demand, fleet or charging.' },
        { term: 'Capacity', def: 'The smaller of fleet capacity and charging capacity.' },
        { term: 'Crossover', def: 'The fleet size at which the two capacities are equal.' },
        { term: 'Plateau', def: 'Where served trips level off, below the ceiling, because churn balances adoption.' },
        { term: 'Limits to Growth', def: 'A reinforcing growth process meets a balancing process as a limit is approached.' },
        { term: 'Balancing Process with Delay', def: 'A delayed response to corrective action makes the corrector over-correct or give up.' },
        { term: 'Leverage point', def: 'A change with large effect; often far from the symptom in time and place.' },
      ],
    },
    check: {
      id: 'c6',
      bloom: 'Apply',
      solo: 'relational',
      objective: 'B1.3',
      prompt: `Policy (c) in the explorer raises the initial chargers from ${P.chargers} to ${C6_CHARGERS}, with the other parameters unchanged. From which aircraft does charging become the resource that limits capacity?`,
      options: [
        { id: 'a', text: `The ${ordinal(C6_FIRST_CHARGING_LIMITED)}.`, correct: true, feedback: `Yes. ${C6_CHARGERS} × ${CHARGES_PER_CHARGER_DAY} × ${DAYS} = ${fmt(C6_CHARGE_CAP)} trips per month, and ${fmt(C6_CHARGE_CAP)} ÷ ${TRIPS_PER_AIRCRAFT_MONTH} = ${C6_CROSSOVER.toFixed(1)}, so charging limits capacity from the ${ordinal(C6_FIRST_CHARGING_LIMITED)} aircraft.` },
        { id: 'b', text: `The ${ordinal(Math.ceil(CROSSOVER_6))}.`, correct: false, feedback: `No. That is the answer for ${P.chargers} chargers. Doubling the chargers doubles the charging capacity, so the crossover moves too.` },
        { id: 'c', text: `The ${ordinal(Math.floor(C6_CROSSOVER))}.`, correct: false, feedback: `No. ${C6_CROSSOVER.toFixed(1)} is not a whole aircraft, and rounding it down goes the wrong way: ${Math.floor(C6_CROSSOVER)} aircraft give ${fmt(fleetCapacityOf(P, Math.floor(C6_CROSSOVER)))} trips, still below ${fmt(C6_CHARGE_CAP)}, so the fleet still limits capacity there.` },
        { id: 'd', text: `The ${ordinal(C6_WRONG_50)}.`, correct: false, feedback: `No. That uses 50 charges per charger per day. Each charger manages ${P.operatingHoursPerDay} × 60 ÷ ${P.chargeMinutesPerTrip} = ${CHARGES_PER_CHARGER_DAY} charges a day.` },
      ],
      cite: { reading: 'R05', pages: '283' },
      review: PENDING,
    },
    cite: [{ reading: 'R05', pages: '283–284' }],
    readMore: [{ reading: 'R05', pages: '283–284' }],
    goDeeper: ['w1-worked-capacity', 'w1-feedback'],
  },
  {
    id: 'l7',
    code: 'L7',
    title: 'What SE contributes, and what the enterprise is',
    question: n('What does a systems engineer actually add, and to whose system?'),
    inShort: n('Systems engineers mediate change between owners and developers across the life cycle, inside an enterprise wider than any one company.'),
    teaser: n('The engineered system, the life cycle and its agents, change mediation, and the enterprise.'),
    objectives: ['B1.4', 'B1.1'],
    bloom: 'Understand',
    solo: 'relational',
    minutes: 8,
    maxWords: 700,
    body: [
      { ref: { block: 'w1-se', para: 0 } },
      { ref: { block: 'w1-lifecycle', para: 0 } },
      { ref: { block: 'w1-lifecycle', para: 1 } },
      { ref: { block: 'w1-lifecycle', para: 2, sentences: [0, 2] } },
      { ref: { block: 'w1-lifecycle', para: 3 } },
      { ref: { block: 'w1-lifecycle', para: 4 } },
      {
        text: 'Note the two uses of the word. In L1 and L2 the system of interest is named the AeroLink service enterprise, and the electric grid and the aircraft manufacturer sit outside its boundary. SEBoK’s enterprise is wider: it also takes in resources AeroLink does not own, such as those grid connections and delivery commitments.',
        provenance: 'instructor-authored',
        review: PENDING,
      },
      { ref: { block: 'w1-application', para: 0, sentences: [0, 1] } },
    ],
    figures: [
      {
        id: 'life-cycle-agents',
        title: 'Life cycle and agents',
        caption: n('Three phases and three kinds of agent. SEBoK’s change example covers changes that arise during development and evolution, so mediation is drawn in those two phases only: systems engineers sit between external bodies and developers, and proposals and counter-proposals flow both ways.'),
        alt: 'A grid with three phase columns: system definition; initial operational capability development; system evolution and retirement. Three agent lanes: external bodies (users, owners, external systems); systems engineers; developers. In the second and third columns, two-headed arrows run from external bodies through the systems-engineer lane to developers, labelled mediate change. The first column has no arrows.',
        textEquivalent: 'Phases: system definition; initial operational capability development; system evolution and retirement. Agents: external bodies (users, owners and external systems); systems engineers; system developers. In development and in evolution, users and owners propose changes, developers must implement them, and systems engineers mediate; two-headed arrows labelled mediate change show that proposals and counter-proposals flow both ways. SEBoK’s change example does not cover the system-definition phase, so no arrow is drawn there.',
        review: PENDING,
      },
      {
        id: 'control-rings',
        title: 'Control, influence, and beyond',
        caption: n('MITRE’s three questions as rings. Only the placement the reviewed text states is filled in: dispatch, which the operations centre controls. The reviewed text says vertiport operators, utilities, manufacturers and airspace providers are mostly outside AeroLink’s control; whether AeroLink influences each one is yours to argue in memo section 5.'),
        alt: 'Three concentric rings. Inner ring, what I control: dispatch, controlled by the operations centre. Middle ring, what I influence: empty, marked you decide in memo section 5. Outer ring, elements of my environment that I neither control nor influence but which influence me: empty, also marked you decide in memo section 5.',
        textEquivalent: 'What I control: dispatch (the operations centre controls dispatch). What I influence: left for you to argue in memo section 5. Elements of my environment that I neither control nor influence but which influence me: also left for you to argue. The reviewed text says the elements that control AeroLink’s limits (vertiport operators, electric utilities, aircraft manufacturers, airspace providers) are mostly outside AeroLink’s control.',
        review: PENDING,
      },
    ],
    keyTerms: {
      review: PENDING,
      items: [
        { term: 'Engineered system', def: 'A technical or socio-technical system that is the subject of a life cycle, designed for intended purposes under constraints.' },
        { term: 'Life cycle', def: 'System definition; initial operational capability development; system evolution and retirement.' },
        { term: 'Enterprise', def: 'A purposeful combination (for example, a network) of interdependent resources that interact with each other and with their environment to achieve business and operational goals; not the same as an organisation.' },
        { term: 'Mediation', def: 'Analysing the costs and benefits of alternative change proposals and synthesising mutually satisfactory solutions.' },
        { term: 'Control / influence / influenced by', def: 'MITRE’s questions after “What is my enterprise?”: which of its elements I control, which I influence, and which elements of my environment influence me although I neither control nor influence them.' },
      ],
    },
    check: {
      id: 'c7',
      bloom: 'Understand',
      solo: 'relational',
      objective: 'B1.4',
      prompt: 'An AeroLink team freezes the requirements for a new vertiport, designs it, and only at the very end asks how the site will be maintained and eventually decommissioned. The maintenance answer forces a late redesign. Under SEBoK’s revised definition of SE, what should the systems engineer have done differently?',
      options: [
        { id: 'a', text: 'Worked on needs, design, verification and later-life concerns together from the start.', correct: true, feedback: 'Yes. SEBoK’s revised definition replaces sequential steps with holistic, concurrent work that considers the complete problem, from concept exploration through disposal, so maintenance and decommissioning shape the design early.' },
        { id: 'b', text: 'Frozen the requirements even earlier, so the late change could be refused.', correct: false, feedback: 'No. Freezing harder is still the sequential view SEBoK moves away from; the maintenance need would still surface late.' },
        { id: 'c', text: 'Added a separate test phase after design, to catch such problems before delivery.', correct: false, feedback: 'No. A later test phase finds the problem later still. The revised definition brings life-cycle concerns forward and works on them concurrently.' },
        { id: 'd', text: 'Left maintenance and disposal to the operators, since SE ends at delivery.', correct: false, feedback: 'No. SEBoK’s revised definition spans the complete problem through system disposal, so later-life concerns are part of SE.' },
      ],
      cite: { reading: 'R01', pages: '53' },
      review: PENDING,
    },
    cite: [{ reading: 'R01', pages: '51–54' }, { reading: 'R07', pages: '815' }, { reading: 'R50', pages: '48' }, { reading: 'R05', pages: '283' }],
    readMore: [{ reading: 'R01', pages: '52–54' }, { reading: 'R07', pages: '815' }, { reading: 'R50', pages: '48' }],
    goDeeper: ['w1-se', 'w1-lifecycle', 'w1-application'],
  },
]

export const learnSection = (id: string) => LEARN_SECTIONS.find((s) => s.id === id)

/** Mission readMore blocks → the Learn section that teaches them (design §4: Read more points to Learn first). */
export const BLOCK_TO_SECTION: Record<string, string> = {
  'w1-intuition': 'l4',
  'w1-emergence': 'l1',
  'w1-soi': 'l2',
  'w1-worked': 'l2',
  'w1-paradox': 'l3',
  'w1-analysis-synthesis': 'l3',
  'w1-feedback': 'l5',
  'w1-worked-capacity': 'l6',
  'w1-se': 'l7',
  'w1-lifecycle': 'l7',
  'w1-application': 'l7',
}

// ------------------------------------------------------------------------------------------- opener (Overview stage)
export const OPENER = {
  hook: [{ block: 'w1-intuition', para: 0, sentences: [0, 1] as [number, number] }],
  hookFigure: {
    id: 'jam',
    title: 'Where is the jam?',
    caption: n('Magnify any one car and the jam is not in there.'),
    alt: 'Two lanes of cars, bumper to bumper, with brake lights on. One car is magnified in a circle labelled: the jam is not in here.',
    textEquivalent: 'Two lanes of cars queued bumper to bumper in a traffic jam, brake lights on; a magnifying circle around one car carries the label “the jam is not in here”.',

    review: PENDING,
  },
  priorKnowledge: n('You already reason about systems: a commute, a supply chain, a project team. This week gives those intuitions names and rules.'),
  /** Plain-words objectives (design §1); the objective text itself stays in course.ts. */
  canDo: [
    { id: 'B1.1', bloom: 'Understand', text: n('Explain system, system of interest, boundary, environment, emergence and enterprise, and use them correctly about AeroLink.') },
    { id: 'B1.2', bloom: 'Apply', text: n('Draw a context diagram and one reinforcing plus one balancing loop, and prove each loop’s type.') },
    { id: 'B1.3', bloom: 'Analyse', text: n('Explain why AeroLink’s ridership levels off, or its fleet over-builds, from the loop structure rather than from any one part.') },
    { id: 'B1.4', bloom: 'Understand', text: n('Describe how a systems engineer mediates change between owners and developers over the life cycle.') },
    { id: 'Graduate', bloom: 'Evaluate', text: n('Identify a leverage point and defend it with evidence from the dynamics explorer.') },
  ],
  assessed: [
    n('Section checks in Learn: one question per section, ungraded, with feedback on every option.'),
    n('Readiness quiz Q1: ten questions, formative.'),
  ],
  review: PENDING,
}

// ------------------------------------------------------------------------------------------- summary and bridge
export const SUMMARY = {
  recap: [
    n('Structure: a system is a bounded set of interacting elements, and the boundary you choose decides which questions you can answer.'),
    n('Behaviour: feedback loops among those elements produce emergent behaviour, such as AeroLink’s plateau below the charging ceiling, that no single element owns.'),
    n('Judgement: act on the binding constraint and look for leverage, which may belong to others in the enterprise; systems engineers mediate such change across the life cycle.'),
  ],
  selfRating: n('Which of the four objectives can you now do? Your answers stay in this browser and only suggest which section to revisit.'),
  conceptMap: {
    id: 'concept-map',
    title: 'Week 1 concept map',
    caption: n('Each node links back to the section that teaches it.'),
    alt: 'A chain of concepts from system to systems engineering mediating change, with two side nodes attached to system of interest and boundary.',
    textEquivalent: 'System → system of interest and boundary (context: EXT-001 to EXT-006) → elements interact → feedback loops (R/B, polarity rule) → emergent behaviour (plateau below the ceiling; reducing variety) → binding constraint and archetype → leverage point → who controls it (the enterprise is wider than the company) → SE mediates change across the life cycle. Side nodes on system of interest: holism ⇄ separation of concerns; analysis ⇄ synthesis.',
    review: PENDING,
  },
}

export const CONCEPT_CHAIN: { label: string; section: string }[] = [
  { label: 'System', section: 'l1' },
  { label: 'SoI and boundary', section: 'l2' },
  { label: 'Elements interact', section: 'l1' },
  { label: 'Feedback loops', section: 'l5' },
  { label: 'Emergent behaviour', section: 'l4' },
  { label: 'Binding constraint, archetype', section: 'l6' },
  { label: 'Leverage point', section: 'l6' },
  { label: 'Who controls it', section: 'l7' },
  { label: 'SE mediates change', section: 'l7' },
]

export const BRIDGE = {
  forwardQuestion: n('Who controls your leverage point? Week 2 starts from that question.'),
  spacing: n('Week 2 is not yet built in this app. Before its first session, answer checks C2 (boundaries) and C5 (loop polarity) again from memory: spaced retrieval of the two ideas Week 2 builds on.'),
  review: PENDING,
}

/** Realistic workload, itemised (review W1F-F11). Every minute comes from the section and mission data; the reviewed
 *  workload rows are not changed. The Overview shows this under the time plan; weeks/week01.ts cautions state it too. */
const missionMinutes = (id: string) => week1Missions.missions.find((m) => m.id === id)!.minutes
export const WORKLOAD = (() => {
  const learnMinutes = LEARN_SECTIONS.reduce((a, s) => a + s.minutes, 0) + 5 + 3 // + Overview 5, summary 3
  const onTopMinutes = missionMinutes('w1-m1-try') + missionMinutes('w1-m2-worked')
  const inTeamRowMinutes = missionMinutes('w1-m3-boundary') + missionMinutes('w1-m4-loops')
  const reviewedTotal = week01.workload.reduce((a, w) => a + w.hours, 0)
  const onlineRow = week01.workload.find((w) => w.activity.startsWith('Online direct instruction'))!.hours
  const realistic = Math.round((reviewedTotal - onlineRow + learnMinutes / 60 + onTopMinutes / 60) * 10) / 10
  return { learnMinutes, onTopMinutes, inTeamRowMinutes, reviewedTotal, realistic }
})()
export const WORKLOAD_NOTE = n(
  `Realistic estimate (author’s minutes; faculty decision D1 is open): the Learn stage takes about ${WORKLOAD.learnMinutes} min against the 0.3 h budgeted above. Practice missions m1 and m2 (${WORKLOAD.onTopMinutes} min) come on top of the memo row, which already holds the extension reading and the writing; m3 and m4 (${WORKLOAD.inTeamRowMinutes} min) are individual preparation inside the team L1 row. Realistic week: about ${WORKLOAD.realistic} h, not ${WORKLOAD.reviewedTotal.toFixed(1)} h.`,
)

/** Practice plan (design §4): order, prerequisite Learn sections per mission (missions themselves are unchanged). */
export const PRACTICE_PREREQ: Record<string, { learn: string[]; note?: NewText }> = {
  'w1-m1-try': { learn: ['l5', 'l6'], note: n('Your prediction from the Overview is already recorded here.') },
  'w1-m2-worked': { learn: ['l6'], note: n('Steps 2 to 4 repeat the L6 hand calculation as a quick recall; the new work is steps 5 and 6, reading the plateau and the order of constraints in the explorer. L6 asks where the two capacities are equal; m2 asks when charging takes over, so there the first whole aircraft past the crossover is accepted as well.') },

  'w1-m3-boundary': { learn: ['l2'] },
  'w1-m4-loops': { learn: ['l5'] },
  'w1-m5-l1': { learn: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'], note: n('Team lab, in Session 2.') },
  'w1-m6-recall': { learn: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'], note: n('The same quiz as Check & submit; answer it there or here.') },
}
