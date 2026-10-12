// Week 1 knowledge check (formative). Each option has its own explanation; every question cites a verified reading.
// Revised after the independent review (W1-F09, F10, F16, F17): 2 Understand, 4 Apply, 3 Analyse, 1 Evaluate.
// Model numbers quoted in items come from src/sim/aerolink.ts and are asserted in src/sim/aerolink.test.ts (FICTIONAL).
// Pending faculty review (DECISION_LOG A4).
import type { QuizQuestion } from './schema'

export type { QuizOption, QuizQuestion } from './schema'

export const WEEK1_QUIZ: QuizQuestion[] = [
  {
    id: 'q1-1', bloom: 'Understand', objective: 'B1.1',
    prompt: 'SEBoK uses the term "systemic resolution". What does it describe?',
    options: [
      { id: 'a', text: 'Observing a system by focusing its complex relationships around a chosen system boundary', correct: true, explanation: 'Correct. Observers allocate boundaries to suit their purpose; focusing relationships around a particular boundary is systemic resolution.' },
      { id: 'b', text: 'Decomposing a system until every element is fully specified', correct: false, explanation: 'That is analysis taken to its limit. Systemic resolution is about choosing the boundary, not reaching full detail.' },
      { id: 'c', text: 'Resolving conflicts between stakeholders before design starts', correct: false, explanation: 'Participants’ power and responsibility matter to boundary choice, but this is not what the term means.' },
      { id: 'd', text: 'The level of detail of a model diagram', correct: false, explanation: 'Diagram detail is a modelling choice; the term refers to how a system of interest is identified.' },
    ],
    cite: { reading: 'R02', pages: '264' },
  },
  {
    id: 'q1-2', bloom: 'Apply', objective: 'B1.4',
    prompt:
      'A competitor launches a cheaper airport shuttle, and AeroLink’s owners propose adding a late-night service. The aircraft developers say the change would compress maintenance windows. According to SEBoK’s life-cycle picture, what is the systems engineer’s contribution?',
    options: [
      { id: 'a', text: 'Approve the owners’ proposal, because users and owners decide what the system must do', correct: false, explanation: 'Users and owners propose changes, but SEBoK shows the proposal being negotiated with developers, not simply imposed.' },
      { id: 'b', text: 'Mediate the negotiation: analyse the relative costs and benefits of alternative change proposals and synthesise a solution both sides can accept', correct: true, explanation: 'Correct. SEBoK’s change example places systems engineers between owners/users and developers, analysing alternatives and synthesising mutually satisfactory solutions; the dependencies run both ways.' },
      { id: 'c', text: 'Reject the change, because requirements are frozen once development has started', correct: false, explanation: 'SEBoK treats changes during development and evolution as inevitable and negotiated, not frozen out.' },
      { id: 'd', text: 'Hand the decision to the developers, because they must implement it', correct: false, explanation: 'Developers implement changes, but the negotiation is mediated by systems engineers rather than settled by one side.' },
    ],
    cite: { reading: 'R01', pages: '54' },
  },
  {
    id: 'q1-3', bloom: 'Understand', objective: 'B1.1',
    prompt: 'Which description of “the AeroLink enterprise” is consistent with SEBoK’s definition of an enterprise?',
    options: [
      { id: 'a', text: 'AeroLink Urban Mobility, the legally registered company', correct: false, explanation: 'SEBoK warns that an enterprise is not equivalent to an organisation; equating the two is described as a frequent misuse of the term.' },
      { id: 'b', text: 'A purposeful combination of interdependent resources — people, processes, organisations such as AeroLink and its vertiport partners, technologies and funding — that interact with each other and with their environment to achieve business and operational goals', correct: true, explanation: 'Correct. This follows SEBoK’s key-term definition: interdependent resources interacting with each other and with their environment(s) to achieve business and operational goals.' },
      { id: 'c', text: 'The eVTOL fleet, because the aircraft are what passengers use', correct: false, explanation: 'The fleet is a product within the enterprise. An enterprise also includes people, processes, organisations and funding.' },
      { id: 'd', text: 'The information systems that connect AeroLink’s business functions', correct: false, explanation: 'SEBoK says the enterprise should be looked at as a system rather than merely as a collection of functions connected by information systems.' },
    ],
    cite: { reading: 'R07', pages: '815–816' },
  },
  {
    id: 'q1-4', bloom: 'Apply', objective: 'B1.2',
    prompt:
      'A team’s L1 loop reads: flights per day → (+) noise complaints → (+) community opposition → (−) permitted operating hours → (+) flights per day. Classify the loop and predict its behaviour.',
    options: [
      { id: 'a', text: 'Reinforcing: every link carries a polarity, so the loop amplifies change', correct: false, explanation: 'Having polarities on every link is required, but the type depends on the count of negative links, not on their presence.' },
      { id: 'b', text: 'Balancing: one negative link (an odd number), so growth in flights generates opposition that pulls flights back toward a level the community accepts', correct: true, explanation: 'Correct. An odd number of negative links gives a balancing loop — in cybernetic terms, negative feedback that maintains a state against a level.' },
      { id: 'c', text: 'Balancing, because it contains the word “opposition”', correct: false, explanation: 'The verdict is right but the reasoning is not: loop type follows from the signs of the links, not from the labels of the variables.' },
      { id: 'd', text: 'Reinforcing: three of the four links are positive', correct: false, explanation: 'Positive links never change the loop type. Only the parity of the negative links matters: one negative link makes the loop balancing.' },
    ],
    cite: { reading: 'R03', pages: '270' },
  },
  {
    id: 'q1-5', bloom: 'Analyse', objective: 'B1.2',
    prompt:
      'In the AeroLink diagram, adoption depends on riders (R1, +) and on the remaining potential riders (riders → potential riders (−) → adoption (+), loop B4). In the model, adoption = rate × riders × (1 − riders ÷ market) × attractiveness. Holding attractiveness (that is, the waiting time) constant, what happens to the net effect of one more rider on adoption through R1 and B4 as ridership grows?',
    options: [
      { id: 'a', text: 'It stays positive at every level of ridership, because the riders → adoption arrow is marked +', correct: false, explanation: 'The + on that arrow is a local effect with the potential market held constant. The saturation path B4 acts at the same time.' },
      { id: 'b', text: 'It is positive below half the market and negative above it, so word of mouth (R1) dominates early and market saturation (B4) dominates once more than half the market rides', correct: true, explanation: 'Correct. With attractiveness held constant, the net effect is proportional to 1 − 2 × riders ÷ market. This is the Limits to Growth pattern: a reinforcing process meets a balancing process as the limit is approached (in the explorer, “Chargers scale, 3-month delivery”).' },
      { id: 'c', text: 'It turns negative as soon as waits exceed tolerance', correct: false, explanation: 'Waits act through attractiveness (loops B1 and B2), which this question holds constant; with attractiveness fixed, the sign change depends on market penetration alone. In the full model that path matters too: when capacity is tight, one more rider raises the wait enough to lower adoption, so the net effect can be negative well below half the market (at the fixed-charger plateau, with 8.7 % of the market riding).' },
      { id: 'd', text: 'It is zero, because R1 and B4 cancel out', correct: false, explanation: 'They cancel only at exactly half the market. Above and below that point one loop dominates.' },
    ],
    cite: { reading: 'R05', pages: '283' },
  },
  {
    id: 'q1-6', bloom: 'Apply', objective: 'B1.2',
    prompt: 'AeroLink wants to know whether a new vertiport will reduce average passenger waiting time. Which system of interest is most appropriate for its context diagram?',
    options: [
      { id: 'a', text: 'The eVTOL aircraft', correct: false, explanation: 'Waiting time lies outside this boundary, so this SoI cannot answer the question.' },
      { id: 'b', text: 'The vertiport building', correct: false, explanation: 'Too narrow: waits depend on fleet, charging, dispatch and demand across the network.' },
      { id: 'c', text: 'The AeroLink service enterprise, including fleet, vertiports, charging, operations and demand', correct: true, explanation: 'Correct. It contains the demand–capacity–waiting feedback and remains analysable; wider systems become environment.' },
      { id: 'd', text: 'The entire national airspace system', correct: false, explanation: 'Too wide to analyse for this question; treat airspace as environment that constrains AeroLink.' },
    ],
    cite: { reading: 'R02', pages: '264' },
  },
  {
    id: 'q1-7', bloom: 'Analyse', objective: 'B1.3',
    prompt:
      'In the explorer’s “Fleet grows, charging does not” run, the fleet rises from 12 to 40 aircraft. Served trips rise by about 20 % with the first deliveries and then stop rising at about 7,800 a month, with waits near 20 minutes, even after every ordered aircraft has arrived. Which archetype best explains this, and where is the leverage?',
    options: [
      { id: 'a', text: 'Balancing Process with Delay; wait for the remaining deliveries', correct: false, explanation: 'The plateau persists after the supply line is empty (from month 22 no aircraft are on order), so delay is not what holds throughput down.' },
      { id: 'b', text: 'Limits to Growth; the leverage is the limit — turnaround charging capacity — not more of the growth effort', correct: true, explanation: 'Correct. Growth meets a balancing process as the charging limit is approached, and further aircraft give diminishing (here zero) returns. The explorer shows a fleet frozen at 15 aircraft reaching the same plateau.' },
      { id: 'c', text: 'Drift to Low Performance; restore the original service goal', correct: false, explanation: 'No goal is lowered in this run: the 15-minute tolerance and the 70 % utilisation target stay fixed.' },
      { id: 'd', text: 'Fixes that Fail; stop buying aircraft because the purchases made waits worse', correct: false, explanation: 'Fixes that Fail needs the fix’s unintended consequences to worsen the problem. The later aircraft do not worsen waits; they simply add no capacity.' },
    ],
    cite: { reading: 'R05', pages: '283–284' },
  },
  {
    id: 'q1-8', bloom: 'Evaluate', objective: 'B1.3',
    prompt:
      'With a 15-month delivery delay and orders that ignore aircraft already on order, the explorer shows about 161 aircraft owned or on order beyond need at month 60. Switching on “Orders count aircraft already on order” removes that surplus, but riders at month 60 fall from about 27,000 to about 5,000. Which judgement is best supported?',
    options: [
      { id: 'a', text: 'Counting the supply line is strictly better, because idle aircraft are pure waste', correct: false, explanation: 'It ignores the second measure: with a long delay and orders sized on current demand, the fleet now lags demand and riders are lost to long waits.' },
      { id: 'b', text: 'Counting the supply line cures the over-correction that the delay causes, but on its own it trades over-build for chronic under-capacity; judge it on both riders and surplus aircraft, and pair it with a change that shortens the delay', correct: true, explanation: 'Correct. Delay makes the correcting agent over-correct; removing the over-correction does not remove the delay. A sound evaluation weighs both measures and looks for a combined fix.' },
      { id: 'c', text: 'Ignore the supply line, because more riders always justify more aircraft', correct: false, explanation: 'A surplus of about 161 aircraft is a large idle capital cost; the trade-off must be argued, not assumed away.' },
      { id: 'd', text: 'The option cannot matter, because delays do not affect balancing loops', correct: false, explanation: 'Delay is exactly what makes a balancing loop over-correct, and the explorer shows the option changing both measures sharply.' },
    ],
    cite: { reading: 'R05', pages: '283' },
  },
  {
    id: 'q1-9', bloom: 'Apply', objective: 'B1.3',
    prompt:
      'Using the explorer’s FICTIONAL values (20 trips per aircraft per day; 6 turnaround chargers; 20 min of charging per trip; 16 operating hours a day; 30 days), what is AeroLink’s monthly capacity with 18 aircraft, and what would a 19th aircraft add?',
    options: [
      { id: 'a', text: '10,800 trips; a 19th aircraft adds 600 trips', correct: false, explanation: '18 × 20 × 30 = 10,800 is the fleet capacity only. Charging capacity is lower, so it sets the system capacity.' },
      { id: 'b', text: '8,640 trips; a 19th aircraft adds nothing, because charging limits capacity from the 15th aircraft', correct: true, explanation: 'Correct. Charging capacity = 6 × (16 × 60 ÷ 20) × 30 = 8,640 < 10,800, so charging binds; extra aircraft give no return, the extreme case of diminishing returns near a limit.' },
      { id: 'c', text: '19,440 trips, the sum of fleet and charging capacity', correct: false, explanation: 'Every trip needs both an aircraft and a charge, so capacity is the smaller of the two, not their sum.' },
      { id: 'd', text: '7,200 trips; a 19th aircraft adds 600 trips', correct: false, explanation: '7,200 is the capacity of the initial 12-aircraft fleet, not of 18 aircraft.' },
    ],
    cite: { reading: 'R05', pages: '283' },
  },
  {
    id: 'q1-10', bloom: 'Analyse', objective: 'B1.1',
    prompt:
      'Each AeroLink aircraft could fly 20 trips a day on its own, yet the 40-aircraft fleet in the “Fleet grows, charging does not” run delivers about 7,800 trips a month — about 6.5 trips per aircraft per day. Which statement uses SEBoK’s concepts correctly?',
    options: [
      { id: 'a', text: 'This is synergy (weak emergence): the whole is greater than the sum of the parts', correct: false, explanation: 'Synergy describes a whole greater than the sum of its parts. Here the whole delivers less.' },
      { id: 'b', text: 'This is reducing variety: the whole functions as less than the sum of its parts because the aircraft interact through shared chargers and through riders’ response to waiting', correct: true, explanation: 'Correct. SEBoK notes that besides synergy it is possible to get reducing variety, where the whole function is less than the sum of the parts. The shortfall exists only in the interactions.' },
      { id: 'c', text: 'It is not emergent, because the aircraft are individually under-performing', correct: false, explanation: 'Each aircraft could still fly 20 trips a day; the shortfall arises from coupling through chargers and demand, not from any single aircraft.' },
      { id: 'd', text: 'It is not emergent, because it can be calculated', correct: false, explanation: 'SEBoK relates system behaviour to combinations of element behaviours; being calculable from the interactions does not stop a behaviour belonging to the whole rather than to any part.' },
    ],
    cite: { reading: 'R03', pages: '271' },
  },
]
