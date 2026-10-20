// Week 3, Session 2 lecture: Technology Assessment / Risk Management / Trade Study — decision management and the trade
// study, worked in full on the AeroLink Year-2 capacity decision (criteria traced to MOEs, value functions, swing weights,
// additive value, sensitivity and rank reversal, the weighted-sum pitfalls, the decision record), then the Lab L3 launch.
// 75-minute session: 69 minutes of planned content on 20 slides (47 min lecture, 22 min laboratory launch) plus the
// generated "References and credits" slide, and a 6-minute buffer. Single source for the slide viewer, the faculty
// notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20, A21.
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week03/WEEK03_LECTURE_OUTLINE.md §3, with a
// slide on the weighted-sum pitfalls (normalization, compensation, double counting) and security and resilience in the
// criteria (A21 item 6).
//
// Accuracy rules: as in session1.ts. The additive value equation and the swing-weight matrix in SEBoK are images; the
// equation was read on the PDF page (R18 p.469). Every number on a slide is computed in ./aerolinkCase.ts and recomputed
// in ./aerolinkCase.test.ts. AeroLink is FICTIONAL.
import type { Lecture } from '../types'
import {
  ALTERNATIVES, CRITERIA, DECISION, FEASIBLE, FEEDS_FORWARD, MINMAX_DEMO, MORPH_PATHS, RANKING, REQUIRED_CAPACITY, SCORES, SCREENED_OUT, SCREENS, SENSITIVITY, TOTALS,
  UNSCREENED_SENSITIVITY, VALUES, WEIGHTS, alternative, capacityOfAlt, marginOf, technology, tpm,
} from './aerolinkCase'
import { CHECKPOINT_CRITERIA, LAB3_MINIMUMS as MIN, LAB3_MINIMUMS_THREE as MIN3, LAB3_TEAM_HOURS } from './labBrief'

export const WEEK3_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const f2 = (x: number) => x.toFixed(2)
const f3 = (x: number) => x.toFixed(3)
const f1 = (x: number) => x.toFixed(1)
const sens = (id: string) => SENSITIVITY.find((x) => x.criterion === id)!
const name = (id: string) => alternative(id).name
const cap = (id: string) => capacityOfAlt(alternative(id))
const v = (a: string, i: number) => VALUES[a][i]
const sc = (a: string, i: number) => SCORES[a][i]
const [c1, , c3] = CRITERIA
const W = WEIGHTS
const rest = (a: string, k: number) => W.reduce((s, w, i) => (i === k ? s : s + w * v(a, i)), 0)
const costDown = sens('CRIT-002').down!
const noiseUp = sens('CRIT-004').up!
const waitUp = sens('CRIT-001').up!
const unscreenedCost = UNSCREENED_SENSITIVITY.find((x) => x.criterion === 'CRIT-002')!.up!
const mm = MINMAX_DEMO
const [mmA, mmB] = MINMAX_DEMO.pair
const lc = (id: string) => name(id).toLowerCase()
/** Morphological-box paths that are not listed alternatives, each with the screen it fails. */
const unlisted = MORPH_PATHS.filter((p) => !p.alt)
const failText = (p: (typeof MORPH_PATHS)[number]) => (p.fails.includes('capacity') ? `${p.capacity} trips a day` : `USD ${f1(p.cost)} M, past the 20 M walk-away`)
const feasibleNames = FEASIBLE.map(lc).join(', ')
const outNames = SCREENED_OUT.map(lc).join(', ')

export const WEEK3_SESSION2: Lecture = {
  week: 3,
  session: 2,
  title: 'Technology Assessment / Risk Management / Trade Study',
  subtitle: 'Session 2: The trade study, worked in full, and the Lab L3 launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ F. decision management (18 min)
    {
      id: 'w3s2-decision',
      title: 'Decision management and the trade study',
      slides: [
        {
          id: 'w3s2-warmup',
          title: 'Warm-up: three retrieval cards',
          purpose: 'Spaced retrieval of three Session 1 ideas before new material.',
          minutes: 2,
          layout: 'bullets',
          body: [
            {
              kind: 'bullets',
              items: ['**1** · “Weather limits not yet published”: a risk, an unknown or an issue?', '**2** · Weather limits were handled by transfer. What did transfer *not* change?', '**3** · Margin is the threshold minus what?'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Show the three cards. Everyone writes three short answers in ninety seconds, without notes. Then pairs compare for thirty seconds. Do not reveal yet; the next slide does.',
            ],
            why: 'Retrieval after a gap strengthens memory more than rereading, and these three cards are the ideas students most often get wrong in the lab: issue versus unknown, the limits of transfer, and margin against the worst case.',
            transition: 'Here are the answers.',
            timing: '2 min: 1.5 min write, 30 s compare.',
          },
        },
        {
          id: 'w3s2-warmup-reveal',
          title: 'Warm-up: the answers',
          purpose: 'Reveal and correct the three retrieval answers.',
          minutes: 1,
          layout: 'bullets',
          body: [
            {
              kind: 'bullets',
              items: ['**1** · An unknown: information not yet available (a TBD in the requirement)', '**2** · The consequence for passengers: transfer moves the cost', '**3** · The worst-case estimate: current estimate plus contingency'],
            },
          ],
          sources: [R('R46', '127'), R('R61c', '644'), R('R44', '117')],
          notes: {
            teach: [
              'Card one: an unknown. It is missing information, recorded as a TBD in the weather requirement; it is not an event with a probability, and it has not happened, so it is not an issue (R46 p.127). The risk is the separate statement that the limits, once published, may be lower than planned.',
              'Card two: the consequence for passengers. Transfer reassigns accountability and creates a dependency (R61c p.644); the held trip is still held. Card three: the worst-case estimate, current estimate plus contingency (R44 p.117).',
            ],
            why: 'Immediate correction of retrieval errors prevents them from being rehearsed into the lab.',
            transition: 'Now the decision process itself.',
            timing: '1 min: 20 s per card.',
          },
        },
        {
          id: 'w3s2-decision-management',
          title: 'What decision management is for',
          purpose: 'State the purpose of decision management, its best practices, and the DoD decision-analysis steps.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-decision-ring',
            caption: 'The decision-analysis steps as a ring, an original drawing from the DoD step list, with the Lab L3 steps mapped onto it.',
            alt: 'A ring of eleven arrow segments: identify the problem; review requirements and assumptions; frame the decision; choose methods and tools; develop criteria and weights; record assumptions; define alternatives; assess alternatives; synthesize results; analyze sensitivities; brief and recommend. Filled nodes mark the steps the lab uses, each with a Lab line under its label: decision statement, alternatives, criteria and weights, scores, sensitivity, recommendation. In the center: the decision maker keeps full responsibility.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['A structured framework to evaluate alternatives and select the most beneficial course', 'The trade study is the method most commonly used', 'One master decision model; value-focused thinking; uncertainty and risk', 'The decision maker keeps full responsibility'],
            },
          ],
          sources: [R('R18', '463'), R('R18', '464'), R('R43', '110')],
          notes: {
            teach: [
              'SEBoK quotes ISO/IEC/IEEE 15288: the purpose of decision management is to provide a structured, analytical framework for objectively identifying, characterizing and evaluating a set of alternatives for a decision at any point in the life cycle and select the most beneficial course of action. The method systems engineers use most is the trade study (R18 p.463).',
              'Its best practices: sound decision-analysis mathematics; one master decision model, refined and reused through the life cycle; value-focused thinking to create better alternatives; and identifying uncertainty and assessing risks for each decision (R18 p.464). The last is Tuesday’s hand-off.',
              'The DoD guidebook gives the steps, which the ring draws: identify the problem, review requirements and assumptions, frame the decision, choose methods, develop criteria and weights with rationale, record and track assumptions, define alternatives, assess them, synthesize, analyze sensitivities, and brief a recommendation with an action plan. It adds that the decision maker has full responsibility, authority and accountability for the decision (R43 p.110).',
            ],
            why: 'Students tend to see a trade study as a scoring spreadsheet. The purpose and steps show that framing, assumptions and sensitivity are as much the study as the arithmetic, and that the analyst recommends while someone else decides.',
            figure: 'Go round the ring once, reading each step briefly, then point at the inner labels: every lab step sits on the ring. End on the center: the analyst recommends; the decision maker decides.',
            misconceptions: [{ claim: 'The trade study makes the decision.', correction: 'It informs the decision. The decision maker keeps full responsibility; the study’s output is a recommendation with its conditions.' }],
            transition: 'A trade is only as good as its frame. First, the decision statement and the objectives.',
            timing: '3 min: 1 min purpose, 1 min best practices, 1 min the steps.',
          },
        },
        {
          id: 'w3s2-framing',
          title: 'Framing the decision, objectives and measures',
          purpose: 'Write the decision statement; test objectives and measures against SEBoK’s properties; trace criteria to MOEs.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-objectives-hierarchy',
            caption: 'AeroLink’s objectives hierarchy: the decision at the top, four objectives, each with its measure and the MOE it traces to.',
            alt: `A tree. Root: provide the Year-2 capacity objective. Four branches: ${CRITERIA.map((c) => `${c.name} measured in ${c.unit}, traced to ${c.moe}`).join('; ')}. A note under the tree reads cost and risk handled explicitly.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['State the decision in life-cycle terms', 'Objectives: essential, controllable, complete, non-redundant', 'Measures: unambiguous, comprehensive, direct, operational', 'Course rule: every criterion traces to an MOE'],
            },
          ],
          sources: [R('R18', '465')],
          notes: {
            teach: [
              'SEBoK: describe the system baseline, boundaries and interfaces, and identify a decision problem statement that defines the decision in terms of the system life cycle (R18 p.465). For AeroLink: how should AeroLink provide the Year-2 capacity objective, at least 300 trips a day by month 24?',
              'Develop objectives with stakeholders and test them: each fundamental objective essential and controllable; the set complete, non-redundant, concise, specific and understandable. Each measure must be unambiguous, comprehensive, direct, operational and understandable (R18 p.465). Non-redundant is the property that prevents double counting, which returns on the pitfalls slide.',
              'Course rule: each criterion traces to an MOE from your Week 2 record, so the trade measures what stakeholders value, and cost and risk are handled explicitly, as criteria, screens or conditions.',
            ],
            why: 'Students who skip framing produce criteria that are design features or that overlap. Tracing each criterion to an MOE ties the decision back to the needs.',
            figure: 'Read the root, then each branch: objective, measure, unit, MOE. Point at the note: cost and risk do not get lost.',
            misconceptions: [{ claim: 'Criteria can be anything the team thinks matters.', correction: 'Criteria are measures of stakeholder objectives; tracing them to MOEs keeps them so, and testing the set for redundancy prevents double counting.' }],
            transition: 'Measures come in different units. To add them we move from measure space to value space.',
            timing: '3 min: 1 min statement, 1.5 min properties, 30 s course rule.',
          },
        },
        {
          id: 'w3s2-value-functions',
          title: 'Value functions: from measure space to value space',
          purpose: 'Define the value function, its walk-away and stretch anchors, and the need to document its shape.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-value-functions',
            caption: 'Two linear value functions from the AeroLink case, with walk-away (value 0) and stretch goal (value 1). Other shapes exist and must be justified.',
            alt: `Two small charts. Left: value of wait, 1 at ${c1.stretch} minutes falling linearly to 0 at ${c1.walkAway} minutes and staying 0 beyond, walk-away and stretch labeled. Right: value of capacity retained after loss of a hub, 0 at ${c3.walkAway} % rising linearly to 1 at ${c3.stretch} %. A faint concave curve on the right is labeled other shapes exist.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['A value function maps a measure to value', '**Walk-away** point → value 0', '**Stretch** goal → value 1 (or 100)', 'Document why the curve has its shape'],
            },
          ],
          sources: [R('R18', '465'), R('R18', '466')],
          notes: {
            teach: [
              'SEBoK: a defining feature of multi-objective decision analysis is the transformation from measure space to value space, performed by a value function that shows returns to scale over the measure range (R18 p.465).',
              'The walk-away point is the measure score at which, however well an alternative does elsewhere, the decision maker walks away; it maps to 0. The stretch goal is the score beyond which there is no additional value; it maps to the top of the value scale. The rationale for the shape of each value function should be documented for traceability and defensibility (R18 pp.465–466).',
              `AeroLink uses linear functions: wait is worth 1 at ${c1.stretch} minutes and 0 at ${c1.walkAway} minutes or more; capacity retained after losing a hub is worth 0 at ${c3.walkAway} % and 1 at ${c3.stretch} %. Linear is the simplest defensible choice when no one has argued for diminishing returns; say so in the record.`,
            ],
            why: 'Value functions are what make minutes, dollars and percentages addable. Fixed anchors, rather than the best and worst alternatives in the set, also protect the study from a rank-reversal trap shown later.',
            figure: 'Left chart: trace from the stretch point at the top left down to the walk-away point, and note the value stays 0 beyond it. Right chart: rising, the reverse direction. Point at the faint concave curve as the alternative that would need a written argument.',
            misconceptions: [{ claim: 'Value is the same as the raw score scaled to 0–1 across the alternatives.', correction: 'Value is anchored to the walk-away and stretch points the stakeholders set, not to whichever alternatives happen to be in the study.' }],
            transition: 'Now the step most often done wrong: the weights.',
            timing: '3 min: 1 min definition, 1 min anchors, 1 min the case.',
          },
        },
        {
          id: 'w3s2-swing-weights',
          title: 'Swing weights: importance and range',
          purpose: 'Elicit swing weights, normalize them, and show why weights depend on the range of each measure.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-swing-weights',
            caption: `Swing weights for the AeroLink trade: each bar is the swing from walk-away to stretch; ranked swings get points, normalized to sum to one.`,
            alt: `Four horizontal bars, ranked from top: ${CRITERIA.map((c, i) => `${c.name}, swing ${c.walkAway} to ${c.stretch} ${c.unit}, ${c.swingPoints} points, weight ${f2(W[i])}`).join('; ')}. A sum line reads 250 points, weights sum to 1.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Weights depend on importance **and** range', 'The top swing gets 100; assess the others against it', 'Normalize: weight = points ÷ total', `AeroLink: 100, 75, 40, 35 → ${W.map(f2).join(', ')}`],
            },
          ],
          sources: [R('R18', '466'), R('R18', '467')],
          notes: {
            teach: [
              'SEBoK: the mathematics of multiple-objective decision analysis requires that the weights depend on the importance of the measure and on its range, from walk-away to stretch goal. A swing-weight matrix places each measure by importance and by the gap between current and desired capability; the top cell gets an unnormalized weight of 100; the others are assessed against it; the weights are then normalized to sum to one (R18 p.466). The matrix is SEBoK’s Figure 4 on the next page (R18 p.467).',
              'The question to ask stakeholders is not “how important is cost?” but “how much is it worth to move cost from its walk-away to its stretch value, compared with moving wait from 60 minutes to 5?” For AeroLink, the wait swing was ranked first, 100 points; capital second, 75; capacity retained after a hub loss, 40; noise exposure, 35.',
              `Normalize: 100 + 75 + 40 + 35 = 250, so the weights are 100 ÷ 250 = ${f2(W[0])}, 75 ÷ 250 = ${f2(W[1])}, 40 ÷ 250 = ${f2(W[2])} and 35 ÷ 250 = ${f2(W[3])}.`,
              'Think-pair-share, one minute: if the capital range were USD 0 to 5 million instead of 0 to 20, should its weight go up or down? Take two answers.',
            ],
            why: 'Importance weights without ranges are the most common error in student trade studies, and they make the result depend on how wide a range someone happened to choose.',
            figure: 'Read the bars top down: each bar is a swing, labeled with its range and its points. The sum line shows the normalization.',
            examples: ['Answer to the think-pair-share: down. A swing of 5 million is worth less than a swing of 20 million, so the same importance yields a smaller weight. If the weight did not change with the range, the value scale would be inconsistent.'],
            misconceptions: [{ claim: 'Weights express how important each criterion is in general.', correction: 'Swing weights express the value of moving each measure across its stated range. Change the range and the weight must change.' }],
            transition: 'With weights and values we can generate alternatives and compute.',
            timing: '4 min: 1.5 min the source, 1 min the AeroLink swings, 30 s normalization, 1 min think-pair-share.',
          },
        },
        {
          id: 'w3s2-additive-model',
          title: 'Alternatives and the additive value model',
          purpose: 'Generate genuinely different alternatives with a morphological box, and state the additive value model.',
          minutes: 2,
          layout: 'equation',
          figure: {
            id: 'w3s2-morph-box',
            caption: 'A morphological box for AeroLink capacity: each alternative is one path through the choices. Nine paths; six are listed alternatives, and the other three fail a screen straight from the box.',
            alt: `A grid with two rows of choices. Fleet: keep 12, add 4, add 6. Hubs: keep 3, upgrade a spoke to a fourth hub, build a seventh vertiport as a fourth hub. Six colored paths cross the grid, one per listed alternative: ${ALTERNATIVES.map((a) => lc(a.id)).join('; ')}. A note lists the three unlisted paths and why each fails: ${unlisted.map((p) => `${p.fleet.toLowerCase()} with ${p.hubs.toLowerCase()}, ${failText(p)}`).join('; ')}.`,
          },
          body: [
            { kind: 'equation', display: 'v(x) = Σ wᵢ · vᵢ(xᵢ),   Σ wᵢ = 1', speech: 'The value of an alternative equals the sum over measures of the weight times the single-measure value of its score, with the weights summing to one.', where: [{ symbol: 'xᵢ', meaning: 'the alternative’s score on measure i' }, { symbol: 'vᵢ', meaning: 'the value function of measure i' }, { symbol: 'wᵢ', meaning: 'the swing weight of measure i' }] },
          ],
          sources: [R('R18', '467'), R('R18', '468'), R('R18', '469')],
          notes: {
            teach: [
              'SEBoK suggests an alternative generation table, a morphological box, to span the decision space (R18 p.467). Scores are captured on scoring sheets that document their source and rationale, and the score matrix can include an ideal alternative as a value-focused thinking tool (R18 p.468).',
              'Then the model. SEBoK transforms scores into values with the value functions and computes each alternative’s value with the additive value model: v of x is the sum of the weight times the single-measure value, with the weights summing to one (R18 p.469). In the guidebook the equation is an image; it was checked on the PDF page.',
            ],
            why: 'A morphological box prevents strawman alternatives by forcing the team to vary each choice, and the equation is the one line every later number on the slides comes from.',
            figure: `Point at the two rows of choices: three times three is nine paths. Trace the six colored paths, the listed alternatives, including the baseline that changes nothing. Then the note: the other three fail a screen from the box alone, ${unlisted.map((p) => `${p.fleet.toLowerCase()} with ${p.hubs.toLowerCase()} at ${failText(p)}`).join('; ')}. Every path is either scored or ruled out for a stated reason.`,
            misconceptions: [{ claim: 'Three alternatives means the preferred design and two weak ones.', correction: 'Alternatives should span the decision space. A box makes the team vary each choice, and the baseline is always one of them.' }],
            transition: 'Now the whole trade on AeroLink, starting with the frame.',
            timing: '2 min: 1 min alternatives, 1 min the model.',
          },
        },
      ],
    },
    // ============================================================================================ G. the AeroLink trade, worked (21 min)
    {
      id: 'w3s2-worked',
      title: 'The AeroLink Year-2 capacity trade, worked',
      slides: [
        {
          id: 'w3s2-worked-frame',
          title: 'Worked example I: the frame and the capacities',
          purpose: 'A complete frame before any score: decision, demand assumption, capacity rule and six alternatives.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w3s2-capacity-chart',
            caption: 'Each alternative plotted by its fleet limit (aircraft × 20) and charger limit (chargers × 48). Capacity is the lower of the two. (FICTIONAL)',
            alt: `A chart with fleet limit in trips per day on the horizontal axis and charger limit on the vertical axis. A diagonal line marks where the two limits are equal. A dashed line marks the required 300 trips per day. Six points: ${ALTERNATIVES.map((a) => `${a.name}, fleet ${a.aircraft * 20}, chargers ${a.chargers * 48}, capacity ${cap(a.id)}`).join('; ')}. Three points lie above 300 on both limits: ${feasibleNames}.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Decide', text: 'how to provide 300 trips/day by month 24' },
                { label: 'Assume', text: 'demand 240 trips/day for every alternative' },
                { label: 'Rule', text: 'capacity = min(aircraft × 20, chargers × 48)' },
                { label: 'Compute', text: 'six alternatives, including the baseline' },
              ],
            },
          ],
          sources: [R('R18', '465'), R('R43', '110')],
          notes: {
            teach: [
              'Read the frame, then give pairs one minute to compute the capacity of two alternatives with the rule on the slide before you reveal.',
            ],
            workedSolution: [
              'Decision: how should AeroLink provide the Year-2 capacity objective, at least 300 trips a day by month 24? It traces to the objective and to the stakeholder requirement on network capacity.',
              'Assumption A-006: Year-2 demand is 240 trips a day, the same for every alternative. Recording it is one of the DoD steps (R43 p.110), and it becomes a condition of the recommendation.',
              'Capacity rule, a course convention from the Week 1 dynamics model: each aircraft flies 20 trips a day; each turnaround charger gives 48 charges a day (960 minutes ÷ 20 minutes); capacity is the lower of the two.',
              `${name('ALT-001')}: 12 aircraft give 240, 6 chargers give 288; capacity ${cap('ALT-001')}, fleet-limited. ${name('ALT-002')}: 18 aircraft give 360, 6 chargers 288; capacity ${cap('ALT-002')}, now charger-limited. ${name('ALT-003')}: 12 aircraft 240, 8 chargers 384; capacity ${cap('ALT-003')}, still fleet-limited. ${name('ALT-004')} and ${lc('ALT-005')}: 16 aircraft 320, 8 chargers 384; capacity ${cap('ALT-004')}. ${name('ALT-006')}: 18 aircraft 360, 8 chargers 384; capacity ${cap('ALT-006')}.`,
              `Three alternatives meet ${REQUIRED_CAPACITY} trips a day and three do not. That already answers part of the driving question, before any weight: aircraft alone move the bottleneck to the chargers, and a vertiport alone leaves too few aircraft.`,
            ],
            why: 'Computing capacity before scoring shows students that a trade often contains a hard requirement check, and that the frame alone can eliminate an intuitive answer.',
            figure: 'Orient the axes and the diagonal where the two limits are equal. Each point’s capacity is the smaller coordinate. Then the dashed 300 line: three points clear it on both axes, three do not.',
            misconceptions: [{ claim: 'The alternative with the most aircraft has the most capacity.', correction: 'Capacity is the minimum of the fleet and charger limits. Eighteen aircraft on six chargers deliver 288, less than sixteen on eight.' }],
            transition: 'Next, the criteria, their value functions and weights, and how security and resilience enter.',
            timing: '4 min: 1 min pairs compute, 2 min reveal of six, 1 min the requirement check.',
          },
        },
        {
          id: 'w3s2-worked-criteria',
          title: 'Worked example II: criteria, screens and weights',
          purpose: 'Show criteria traced to MOEs with anchors and weights; the capacity requirement and the walk-away points as screens; resilience as a weighted criterion; security as must-meet screens.',
          minutes: 3,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Criterion', 'MOE', 'Walk-away → stretch', 'Weight'],
              rows: CRITERIA.map((c, i) => [c.name, c.moe, `${c.walkAway} → ${c.stretch} ${c.unit}`, f2(W[i])]),
            },
            { kind: 'callout', tone: 'key', title: 'Screens, before any weight', text: `Capacity ≥ ${REQUIRED_CAPACITY} trips/day; inside every walk-away; charger control authenticated; no new unauthenticated interface.` },
          ],
          sources: [R('R18', '465'), R('R18', '466'), R('R24', '1208'), R('R24', '1209'), R('R25', '1229')],
          notes: {
            teach: [
              `Read the four criteria with their MOE traces and weights. Then the screens, applied before any weight. A screen is a walk-away point applied before the arithmetic (R18 pp.465–466). Two come from the frame: the capacity requirement of ${REQUIRED_CAPACITY} trips a day, and the walk-away points themselves. ${outNames.replace(/^./, (x) => x.toUpperCase())} fail them, the baseline and the new vertiport on both, with a wait of ${f1(sc('ALT-001', 0))} minutes past the 60-minute walk-away. The frame eliminated three alternatives before any weight.`,
              `The resilience criterion is weighted: capacity retained after losing a hub compares performance after a disruption with before it, a common resilience metric (R24 p.1209), and alternatives must be evaluated on delivering required capability under adversity (R24 p.1208).`,
              'Security enters as two more screens: every added or upgraded charger accepts only signed configurations and has a local temperature interlock; and no alternative adds an unauthenticated interface to dispatch or charging control. SEBoK asks for a system as secure as reasonably practical while meeting minimum stakeholder expectations (R25 p.1229): a minimum expectation is a threshold, not something to trade against waiting time. The three remaining alternatives pass; the two that convert a spoke only if its chargers are replaced rather than retrofitted, a condition. Noise exposure is the trade’s handle on how often residents are disturbed; the evening cap is checked on the schedule. The screens are proposed additions for the instructor to confirm.',
            ],
            why: 'Students need to see that security and resilience can enter a trade in different ways, and that the choice depends on whether the stakeholders will accept less of it in exchange for more of something else.',
            misconceptions: [{ claim: 'Every concern should be a weighted criterion.', correction: 'A weighted criterion can be traded away. Minimum expectations, such as authenticated control of a safety-related charger, belong in a must-meet screen.' }],
            transition: 'Now the scores, the values and the totals.',
            timing: '3 min: 30 s criteria, 1 min the frame screens, 30 s resilience, 1 min security and noise.',
          },
        },
        {
          id: 'w3s2-worked-scores',
          title: 'Worked example III: scores, values and totals',
          purpose: 'Reproducible arithmetic: score, value and weighted sum for each alternative, one worked in full.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w3s2-value-components',
            caption: 'Value component chart: each bar is an alternative’s total value, split into the weighted value from each criterion. (FICTIONAL)',
            alt: `Three stacked horizontal bars, one per alternative that passed the screens. ${RANKING.map((a) => `${name(a)}: total ${f3(TOTALS[a])}, wait ${f3(W[0] * v(a, 0))}, cost ${f3(W[1] * v(a, 1))}, retained capacity ${f3(W[2] * v(a, 2))}, noise ${f3(W[3] * v(a, 3))}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'table',
              header: ['Alternative', 'Wait', 'Cost', 'Kept', 'Noise', 'Total'],
              rows: RANKING.map((id) => [name(id).split(':')[0], f1(sc(id, 0)), f1(sc(id, 1)), f1(sc(id, 2)), f1(sc(id, 3)), f3(TOTALS[id])]),
            },
            { kind: 'steps', items: [{ label: 'Value', text: 'each score through its function' }, { label: 'Sum', text: 'weight × value' }] },
          ],
          sources: [R('R18', '469'), R('R18', '470')],
          notes: {
            teach: [
              'Show the score matrix. Ask the room to compute the balanced alternative’s wait value, (60 − 8) ÷ 55, before you work it.',
            ],
            workedSolution: [
              `Scores come from the case rules. Wait uses the Week 1 approximation, w = 2 ÷ (1 − u) for utilization u = demand ÷ capacity, capped at 0.97, plus a queue penalty above full load: the balanced alternative at u = 0.75 gives 2 ÷ 0.25 = ${f1(sc('ALT-004', 0))} minutes. Cost: aircraft USD 3.0 M each, a charger upgrade 0.4 M, a new hub 6.0 M; the balanced alternative is 4 × 3.0 + 2 × 0.4 = ${f1(sc('ALT-004', 1))} M. Capacity kept after losing one hub of 2 chargers: min(320, 6 × 48 = 288) ÷ 320 = ${f1(sc('ALT-004', 2))} %. Peak movements: 240 trips × 2 ÷ 16 h ÷ 6 sites × 1.6 = ${f1(sc('ALT-004', 3))} per hour.`,
              `Values for the balanced alternative: wait (60 − 8) ÷ (60 − 5) = ${f3(v('ALT-004', 0))}; cost (20 − 12.8) ÷ 20 = ${f3(v('ALT-004', 1))}; capacity kept (90 − 50) ÷ (100 − 50) = ${f3(v('ALT-004', 2))}; noise (10 − 8) ÷ (10 − 5) = ${f3(v('ALT-004', 3))}.`,
              `Weighted sum: ${f2(W[0])} × ${f3(v('ALT-004', 0))} + ${f2(W[1])} × ${f3(v('ALT-004', 1))} + ${f2(W[2])} × ${f3(v('ALT-004', 2))} + ${f2(W[3])} × ${f3(v('ALT-004', 3))} = ${f3(W[0] * v('ALT-004', 0))} + ${f3(W[1] * v('ALT-004', 1))} + ${f3(W[2] * v('ALT-004', 2))} + ${f3(W[3] * v('ALT-004', 3))} = ${f3(TOTALS['ALT-004'])}.`,
              `The others: ${RANKING.slice(1).map((a) => `${lc(a)} ${f3(TOTALS[a])}`).join('; ')}. The baseline is not in the table: its ${f1(sc('ALT-001', 0))}-minute wait is beyond the walk-away, so it was screened out. Scored instead, with its wait clamped at 0, its zero cost would have bought back a wait the decision maker had already rejected.`,
            ],
            why: 'Working one total by hand makes every later number checkable, and leaving the screened-out alternatives off the table shows why a walk-away score is not just a zero.',
            figure: 'Read one bar segment by segment: wait gives the three similar amounts, and cost separates the balanced alternative from the other two. SEBoK describes this chart as the value component chart (R18 p.470).',
            misconceptions: [{ claim: 'A score worse than the walk-away point just earns a value of 0.', correction: 'The walk-away point means the decision maker walks away whatever else the alternative scores. Screen it out; clamping it to 0 and adding lets other criteria buy it back.' }],
            transition: 'Before believing the ranking, test how much it depends on the weights.',
            timing: '4 min: 1 min students compute, 1 min scores, 1.5 min values and sum, 30 s the others.',
          },
        },
        {
          id: 'w3s2-worked-sensitivity',
          title: 'Worked example IV: sensitivity and rank reversal',
          purpose: 'Vary one weight at a time, rescaling the others, and find where the top rank changes.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w3s2-line-diagram',
            caption: `Line diagram: each feasible alternative’s total value as the cost weight varies from 0 to 1, the others rescaled in proportion. The leader changes at ${f3(costDown.w)}. (FICTIONAL)`,
            alt: `A chart with cost weight from 0 to 1 on the horizontal axis and total value on the vertical axis. Three straight lines, one per alternative that passed the screens. The balanced alternative’s line is highest at the base weight of 0.30, marked by a vertical line. To the left, as the cost weight falls, the line of ${lc(costDown.to)} crosses it at ${f3(costDown.w)}, marked with a circle.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Vary', text: 'one weight; rescale the others to keep Σw = 1' },
                { label: 'Solve', text: 'where two totals are equal' },
                { label: 'Report', text: `cost ↓ ${f3(costDown.w)}; noise ↑ ${f3(noiseUp.w)}; wait ↑ ${f3(waitUp.w)}; resilience: none` },
              ],
            },
          ],
          sources: [R('R18', '471'), R('R18', '472')],
          notes: {
            teach: [
              'SEBoK: decision analysis uses many forms of sensitivity analysis, including line diagrams, tornado diagrams and Monte Carlo simulation; a line diagram shows the sensitivity to the swing-weight judgment (R18 p.472). Monte Carlo on uncertain scores, using lower, nominal and upper bounds from the experts, shows which uncertainties matter most (R18 p.471); that is the graduate task this week.',
            ],
            workedSolution: [
              `Method: set the cost weight to w and multiply each other weight by (1 − w) ÷ (1 − 0.30), so the weights still sum to one. Each total is then a straight line in w: total = w × cost value + (1 − w) ÷ 0.70 × (the weighted sum of the other three values).`,
              `Only the three alternatives that passed the screens take part. For the balanced alternative the other three criteria contribute ${f3(rest('ALT-004', 1))}, and its cost value is ${f3(v('ALT-004', 1))}. For ${lc(costDown.to)} they contribute ${f3(rest(costDown.to, 1))}, and its cost value is ${f3(v(costDown.to, 1))}. Set the lines equal: ${f3(v('ALT-004', 1))}w + ${f3(rest('ALT-004', 1) / 0.7)}(1 − w) = ${f3(v(costDown.to, 1))}w + ${f3(rest(costDown.to, 1) / 0.7)}(1 − w). Solving gives w = ${f3(costDown.w)}.`,
              `So ${lc(costDown.to)} ranks first only if capital falls below ${f3(costDown.w)} from 0.30, or noise rises above ${f3(noiseUp.w)} from 0.14: the new site spreads movements over seven vertiports. ${name(waitUp.to)} wins only above a wait weight of ${f3(waitUp.w)}; no resilience weight changes the leader.`,
              `Interpretation: robust, with two weights to watch, capital and noise. Contrast the unscreened analysis over the four original alternatives: it finds the baseline winning above a capital weight of ${f3(unscreenedCost.w)}. That is no condition: the decision maker has already walked away from the baseline.`,
            ],
            why: 'A ranking with no sensitivity analysis is an opinion with decimals. Finding the reversal point tells the decision maker exactly which judgment the recommendation rests on.',
            figure: 'Point at the vertical line at the base weight: the balanced line is on top. Follow it left to the crossing circle, where the new-hub line overtakes it. Right of the circle the recommendation stands.',
            misconceptions: [
              { claim: 'If the winner scores highest, sensitivity analysis is optional.', correction: 'Sensitivity is how you learn whether the winner depends on one contestable weight. SEBoK lists it as part of analyzing risk and uncertainty.' },
              { claim: 'Any crossing on the line diagram is a reversal to report.', correction: 'Only crossings with alternatives that pass every screen count. A crossing with a screened-out alternative is not a choice anyone could make.' },
            ],
            transition: 'The arithmetic itself has traps. Three of them.',
            timing: '4 min: 30 s sources, 1 min method, 1.5 min the solve, 1 min interpretation.',
          },
        },
        {
          id: 'w3s2-weighted-sum-pitfalls',
          title: 'Weighted-sum pitfalls: normalization, compensation, double counting',
          purpose: 'Demonstrate the three weighted-sum pitfalls with AeroLink numbers and the guard against each.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-normalization-trap',
            caption: 'With values scaled to the best and worst alternative in the set, removing one alternative reverses the other two. Fixed anchors do not. (FICTIONAL)',
            alt: `Two small bar charts. Left, min–max scaling over the three feasible alternatives: ${FEASIBLE.map((a) => `${lc(a)} ${f3(mm.all[a])}`).join(', ')}. Right, the same scaling with the balanced alternative removed: ${lc(mmA)} ${f3(mm.without[mmA])}, ${lc(mmB)} ${f3(mm.without[mmB])}. Highlighted rows, rank numbers and a banner show the two swapping places.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Normalization**: anchor values to walk-away and stretch, not to the set', '**Compensation**: a high score can hide a fatal one; screen first', '**Double counting**: one MOE, one criterion', 'Range-free “importance” weights break the scale'],
            },
          ],
          sources: [R('R18', '465'), R('R18', '466')],
          notes: {
            teach: [
              `Normalization. Some spreadsheets scale each measure from the worst to the best alternative in the set. Do that for AeroLink’s three feasible alternatives and ${lc(mmB)} scores ${f3(mm.all[mmB])} against ${f3(mm.all[mmA])} for ${lc(mmA)}. Now suppose the utility rules out converting the spoke, so the balanced alternative drops out: rescaled over the two left, ${lc(mmA)} scores ${f3(mm.without[mmA])} against ${f3(mm.without[mmB])}. The fallback choice flipped although neither alternative changed. Fixed walk-away and stretch anchors (R18 pp.465–466) give ${f3(TOTALS[mmA])} against ${f3(TOTALS[mmB])} in both sets. The arithmetic is the instructor’s demonstration; the anchors are SEBoK’s.`,
              'Compensation. A weighted sum lets a high score on one criterion buy back a poor one on another. That is fine within the walk-away points, but not past one: the baseline’s zero cost would have bought back a wait the decision maker had rejected. That is why walk-away points and security are screens here (R18 pp.465–466).',
              'Double counting. Two criteria that measure the same thing, cost and affordability, give that concern two weights. SEBoK’s test that the set of objectives be non-redundant (R18 p.465) catches it; the course check is one MOE, one criterion. And weights set by importance without ranges violate the swing-weight requirement from earlier (R18 p.466).',
            ],
            why: 'Students will build trade spreadsheets for years. Seeing a rank reversal produced by scaling alone, with real numbers, is the clearest argument for fixed anchors, screens and a redundancy check.',
            figure: 'Compare the two charts: in the left, one order of the highlighted pair; in the right, with the balanced alternative removed, the order flips. Nothing about either alternative changed.',
            misconceptions: [{ claim: 'Scaling each measure from the best to the worst alternative is neutral.', correction: 'It makes every value depend on which alternatives are in the set, so adding or removing one can reverse the others. Anchor values to stakeholder walk-away and stretch points.' }],
            transition: 'Now the output that matters: the decision record.',
            timing: '3 min: 1.5 min normalization worked, 45 s compensation, 45 s double counting and ranges.',
          },
        },
        {
          id: 'w3s2-worked-decision',
          title: 'Worked example V: the recommendation, with conditions',
          purpose: 'Show what a defensible decision record contains: recommendation, conditions, residual risk and what would change it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-decision-record',
            caption: 'A one-page decision record: decision, recommendation, conditions, residual risk and what would change it. (FICTIONAL)',
            alt: `A page with five labeled boxes, the box text shortened on the drawing. Decision: ${DECISION.decision} Recommendation: ${name(DECISION.recommended)}, ${cap(DECISION.recommended)} trips per day, value ${f3(TOTALS[DECISION.recommended])}. Conditions: ${DECISION.conditions.join('; ')}. Residual risk: ${DECISION.residualRisk.join('; ')}. Would change if: ${DECISION.wouldChangeIf.join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`**Recommend** the balanced alternative: ${cap('ALT-004')} ≥ ${REQUIRED_CAPACITY} trips/day`, '**Conditions**: capital and noise weights, demand, grid connection, charger security', '**Residual risk**: charging lag, grid, battery fade, charger security', '**Would change if**: demand, weights or grid change'],
            },
          ],
          sources: [R('R18', '472'), R('R18', '473'), R('R43', '110')],
          notes: {
            teach: [
              `Read the record. ${DECISION.why}`,
              `Conditions: ${DECISION.conditions.join('; ')}. Residual risk: ${DECISION.residualRisk.join('; ')}. Would change if: ${DECISION.wouldChangeIf.join('; ')}.`,
              'SEBoK asks the team to identify the key trade-offs and the important uncertainties and risks (R18 p.472), and to present the recommendation as a clearly worded, actionable task list, with a report for traceability (R18 p.473). The DoD guidebook calls sound recommendations and action plans the principal output of decision analysis (R43 p.110).',
            ],
            why: 'A recommendation without conditions cannot be revisited when the world changes. The would-change-if list turns the sensitivity analysis into instructions for the decision maker.',
            figure: 'Read the five boxes top to bottom. Point at how each condition comes from somewhere earlier: the reversal point, the demand assumption, the grid unknown, the security screen.',
            misconceptions: [{ claim: 'A good recommendation is unconditional.', correction: 'A good recommendation states the conditions under which it holds and what would reverse it; those come straight from the assumptions and the sensitivity analysis.' }],
            transition: 'So, back to Tuesday’s question.',
            timing: '3 min: 1 min recommendation, 1.5 min conditions and residual risk, 30 s sources.',
          },
        },
      ],
    },
    // ============================================================================================ H. answer, bias, bridge (8 min)
    {
      id: 'w3s2-close-lecture',
      title: 'The answer, bias, and where the decision goes',
      slides: [
        {
          id: 'w3s2-answer',
          title: 'Answering the driving question',
          purpose: 'Close the loop from Session 1: why six more aircraft alone is the wrong answer.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-answer',
            caption: 'The Session 1 queue redrawn for the balanced alternative: four aircraft added and a fourth hub’s chargers. (FICTIONAL)',
            alt: 'The queue picture from Session 1 redrawn. Sixteen aircraft, the four new ones drawn dashed at the converted hub, now spread across four hubs with two chargers each; the queue in front of the chargers is gone. A tag on the converted hub reads conditions: grid connection confirmed, chargers to the signed-configuration specification.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**B**: only with more charging', `Six aircraft alone: ${cap('ALT-002')} trips/day, charger-limited`, `Four aircraft and a fourth hub: ${cap('ALT-004')} trips/day`, 'Charger maturity and grid capacity are conditions'],
            },
          ],
          sources: [R('R18', '464')],
          notes: {
            teach: [
              `Return to the vote. The answer is B. Six more aircraft alone raise capacity only to ${cap('ALT-002')} trips a day: the fleet limit rises to 360, but six chargers deliver 288, so the bottleneck moves to charging, which is exactly the charging-lag risk in the register. A seventh vertiport alone leaves twelve aircraft and 240 trips. Four aircraft with a fourth hub give ${cap('ALT-004')}; six aircraft with a fourth hub would give 360, more than the requirement needs, at a higher cost.`,
              `And D, cannot tell yet, deserves credit for honesty: the answer rests on conditions. The charging technology is at TRL ${technology('TECH-001').trl} on an assumption, the grid connection is unknown, and the recommendation holds while capital keeps a weight above about ${f2(costDown.w)} and noise below about ${f2(noiseUp.w)}. That is the point of the week: readiness and risk are conditions on the decision, not footnotes, as SEBoK’s best practice of assessing uncertainty and risk for each decision asks (R18 p.464).`,
            ],
            why: 'Closing the driving question shows that the answer needed all three instruments from Session 1 and the full trade study from today.',
            figure: 'Compare with Tuesday’s picture: the queue is gone because chargers grew with the fleet. Read the tag on the converted hub: two conditions, both from the register.',
            misconceptions: [{ claim: 'The trade study proved that the balanced alternative is best.', correction: 'It showed the balanced alternative is preferred under the stated weights, assumptions and screens, and how far those can move before the preference changes.' }],
            transition: 'One last caution about the people doing the scoring.',
            timing: '3 min: 1.5 min the answer, 1.5 min conditions and the credit for D.',
          },
        },
        {
          id: 'w3s2-bias',
          title: 'Cognitive bias and value-focused thinking',
          purpose: 'Graduate caution: bias distorts scoring; mitigation needs others; mine results for better alternatives.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-bias',
            caption: 'Two ways to read a finished trade: which option won, or what would an ideal option look like and can we get closer?',
            alt: 'Two thought bubbles over a trade table. The left bubble reads which option wins? The right bubble reads what would the ideal look like, and can we design closer to it? A small note below lists confirmation bias, independent review and premortem.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Mine results to improve alternatives: value-focused thinking', 'Confirmation bias distorts decisions; self-mitigation rarely works', 'Mitigate with independent review and a premortem', 'Course practice: nobody scores their own alternative alone'],
            },
          ],
          sources: [R('R18', '472'), R('R18', '473'), R('R18', '474')],
          notes: {
            teach: [
              'SEBoK: mining the results can reveal ways to modify design choices to claim untapped value or reduce risk; using those findings to create new alternatives moves the process from alternative-focused to value-focused thinking (R18 p.472). The ideal row in the score matrix is the tool for this.',
              'SEBoK also warns that cognitive bias can seriously distort decisions; confirmation bias, interpreting evidence as confirming what one already believes, is the best known, and self-mitigation by the decision maker is generally not feasible (R18 p.473). It lists independent review and the premortem, where trusted experts argue the case against the decision, among the mitigations (R18 p.474). Course practice: the person who proposed an alternative does not score it alone.',
            ],
            why: 'Teams score their favorite alternative generously without noticing. Naming the bias and a concrete practice gives them a guard they can apply this week.',
            figure: 'Contrast the two bubbles. The left one ends the study; the right one starts a better alternative. Point at the note: the bias and two mitigations.',
            misconceptions: [{ claim: 'Being aware of bias is enough to avoid it.', correction: 'SEBoK reports general agreement that self-mitigation is not feasible for most biases; it takes other people, such as an independent reviewer or a premortem.' }],
            transition: 'Finally, where this decision goes next in the course.',
            timing: '2 min: 1 min value-focused thinking, 1 min bias and mitigation.',
          },
        },
        {
          id: 'w3s2-feeds-forward',
          title: 'Why these methods: what they feed in Weeks 4–6, 12 and 13',
          purpose: 'Make the continuity explicit: what each Week 3 artifact feeds in Phase I and Phase II.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-feeds-forward',
            caption: 'The decision record and the register flow into the architecture, the interfaces and the roadmap, then into the model’s digital thread and analysis cases.',
            alt: `A decision card in the center with arrows outward, box text shortened on the drawing: ${FEEDS_FORWARD.map((f) => `${f.week}: ${f.artifact}, ${f.how}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Decision, derived requirements → Weeks 4–5 architecture and interfaces', 'Security and resilience risks → Weeks 5–6 interfaces and roadmap', 'Register and TPMs → Week 12 digital thread and V&V', 'Trade study → Week 13 analysis cases'],
            },
          ],
          sources: [R('R48', '146'), R('R78', '147'), R('R75', '95'), R('R78', '152')],
          notes: {
            teach: [
              'Each method this week exists because something later depends on it. The decision record is the starting configuration of the Week 4 architecture, sixteen aircraft and four hubs. Decisions generate derived requirements, as the DoD guidebook notes for architecture decisions (R48 p.146): here, the charger rating and the signed-configuration rule at the converted hub, which Week 5 writes into interface definitions. The security and resilience risks return in Week 5, where interfaces need authentication, and Week 6, where on-site storage and autonomy go on the evolution roadmap.',
              'In Phase II, Week 12 models the register: SysML v2 has a standard risk metadata library that annotates model elements with probability and impact (R78 p.147), and the TPMs become evidence on the digital thread that verification closes. Week 13 redoes this trade study in the model: an analysis case binds the alternatives and an evaluation function (R75 p.95), using the TradeStudies library (R78 p.152), with the TPM thresholds as constraints. Those readings are named now and taught then.',
            ],
            why: 'Students work harder on artifacts they know will be reused. Naming the consumers of each artifact also explains the record format: links, owners and computed values are what later weeks need.',
            figure: 'Follow each arrow from the decision card and read its week and what it carries.',
            misconceptions: [{ claim: 'The trade study is finished when the recommendation is written.', correction: 'It is the first version of one master decision model (R18 p.464) that the architecture and, in Week 13, the SysML model refine.' }],
            transition: 'Now your team’s trade study. The lab launch.',
            timing: '3 min: 1.5 min Phase I, 1.5 min Phase II.',
          },
        },
      ],
    },
    // ============================================================================================ I. lab launch (22 min)
    {
      id: 'w3s2-lab',
      title: 'Laboratory launch: Lab L3',
      slides: [
        {
          id: 'w3s2-lab-brief',
          title: 'Lab L3 brief: readiness, risk, TPMs and a trade study',
          purpose: 'Unambiguous instructions: the four record parts, minimums, due date and the rubric in plain words.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-lab-checklist',
            caption: 'Lab L3 at a glance: the four parts added to the Team Record and their minimums for a team of four.',
            alt: `A checklist with four sections. Readiness: ${MIN.technologies} technologies, each with a TRL and its basis. Register: ${MIN.risks} risks including at least ${MIN.securityRisks} security and ${MIN.resilienceRisks} resilience risk, ${MIN.opportunities} opportunity, every Week 2 TBD linked to an unknown, issues separate. TPMs: ${MIN.tpms}, with contingency, margin and a planned profile. Trade study: ${MIN.alternatives} alternatives including the baseline, ${MIN.criteria} criteria traced to MOEs, swing weights, sensitivity with the reversal point, a recommendation with conditions.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`${MIN.technologies} technologies; ${MIN.risks} risks (≥ 1 security, ≥ 1 resilience)`, `${MIN.tpms} TPMs; ${MIN.alternatives} alternatives incl. baseline; ${MIN.criteria} criteria`, `Team of three: ${MIN3.technologies}, ${MIN3.risks}, ${MIN3.tpms}, ${MIN3.alternatives}, ${MIN3.criteria}`, 'Your enterprise, never AeroLink; due before Week 4'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              `Walk the four parts. Readiness: at least ${MIN.technologies} technologies your requirements depend on, each with a TRL from the scale, evidence or a labeled assumption, critical or not, and a maturity risk when a critical one is below TRL 6. Register: at least ${MIN.risks} risks in condition–if–then form, of which at least one security and one resilience risk, each rated with reasons and handled with an owner, a treatment and a trigger; at least ${MIN.opportunities} opportunity; every TBD and TBR from Week 2 linked to an unknown; issues kept apart.`,
              `TPMs: at least ${MIN.tpms}, on your riskiest requirements, with threshold, objective, current estimate, contingency, margin and a planned value at two or more future reviews. Trade study: a decision statement traced to a requirement or objective; at least ${MIN.alternatives} genuinely different alternatives including the baseline; ${MIN.criteria} criteria traced to MOEs, with walk-away and stretch points and swing weights with reasons; the computation; the reversal point of the heaviest weight; a recommendation with conditions, residual risk and what would change it.`,
              `A team of three works to reduced minimums, in proportion to team size: ${MIN3.technologies} technologies, ${MIN3.risks} risks, ${MIN3.tpms} TPM, ${MIN3.criteria} criteria. The lab tool imports your Week 2 export and computes the margins, weights, totals and reversal points for you; its hard gates block only real defects. About ${LAB3_TEAM_HOURS} person-hours for a team of four. Due before Week 4, Session 1, with the AI usage statement.`,
            ],
            why: 'Clear minimums and the tool’s role remove the two commonest questions, “how many?” and “do we have to compute this by hand?”, and leave the team’s time for judgment.',
            figure: 'Read the four sections of the checklist with their numbers.',
            misconceptions: [{ claim: 'The tool decides whether our work is right.', correction: 'The tool catches defects any reviewer would reject and does the arithmetic. Whether your criteria, ratings and alternatives are sound is judged in the review and the rubric.' }],
            transition: 'Now choose your decision and your technologies.',
            timing: '3 min: 1 min readiness and register, 1 min TPMs and trade, 1 min team of three, tool and due date.',
          },
        },
        {
          id: 'w3s2-lab-plan',
          title: 'Team work: choose the decision and the technologies',
          purpose: 'In-class framing from the members’ pre-work.',
          minutes: 8,
          layout: 'two-column',
          body: [
            { kind: 'callout', tone: 'key', title: 'Decision statement', text: 'How should [enterprise] [achieve objective X] given [constraint]?' },
          ],
          aside: [
            {
              kind: 'bullets',
              items: ['Choose the technologies to assess', 'Choose one decision that matters to a stakeholder', 'Draft three genuinely different alternatives, including the baseline', 'Name the MOE behind your most important criterion'],
            },
          ],
          sources: [R('R18', '465')],
          notes: {
            teach: [
              'Teams work from the members’ pre-work. In eight minutes they choose the technologies they will assess; one decision for the trade study that matters to a Week 1 stakeholder and traces to a Week 2 requirement or objective; a draft decision statement in the template; and at least three genuinely different alternatives, including the baseline, the status quo. SEBoK’s advice is to state the decision problem in terms of the system life cycle (R18 p.465).',
              'Circulate. Push back on two things: a decision that is really a design detail, and alternatives that are the favorite plus two strawmen. Ask: which choice row of a morphological box does each alternative vary?',
            ],
            why: 'The frame gates the whole trade study. Choosing it in the room, with the instructor circulating, prevents a week of work on a strawman set.',
            transition: 'Now the checkpoint: each team reads its frame.',
            timing: '8 min: team work; circulate and give a two-minute warning.',
          },
        },
        {
          id: 'w3s2-lab-checkpoint',
          title: 'Instructor checkpoint: decision and alternatives',
          purpose: 'Approve each team’s frame against three criteria.',
          minutes: 9,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-checkpoint-card',
            caption: 'The checkpoint card: three checks and three possible decisions.',
            alt: `A card with three check boxes: ${CHECKPOINT_CRITERIA.join('; ')}. Below, three outcomes: approve, approve with conditions, revise with a reason.`,
          },
          body: [
            { kind: 'bullets', items: CHECKPOINT_CRITERIA.map((c) => c.charAt(0).toUpperCase() + c.slice(1)) },
            { kind: 'callout', tone: 'note', text: 'Approve, approve with conditions, or revise with a reason.' },
          ],
          sources: [],
          notes: {
            teach: [
              'Each team, about ninety seconds, up to five teams in the room, reads its decision statement and alternatives and names the MOE behind its most important criterion. Other teams post on the LMS within 48 hours and receive the same check in writing.',
              'Apply the three checks aloud so all teams learn from each: the baseline is included; the alternatives are genuinely different, not strawmen; the decision traces to a requirement or objective in the record. Decide: approve, approve with conditions, or revise with a reason. Record the decision in the lab tool or on the LMS.',
            ],
            why: 'Public checking teaches the criteria to every team at once, and an approved frame lets each team spend the week on analysis rather than rework.',
            figure: 'Point at the three boxes as you apply them to each team.',
            transition: 'Last, the plan for the next seven days.',
            timing: '9 min: about 90 s per team for up to five teams, 1.5 min written-route instructions.',
          },
        },
        {
          id: 'w3s2-lab-close',
          title: 'Close: the next seven days',
          purpose: 'Work plan out of class and the assessment.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s2-seven-days',
            caption: 'A seven-day plan for Lab L3, with the lead role for each step.',
            alt: 'A timeline of seven days. Days 1 and 2: readiness assessment, one technology per member. Days 2 and 3: risk workshop, each member brings two risks including security and resilience. Day 3: register links and TPMs. Day 4: criteria, value functions and weights. Day 5: scores, computation and sensitivity. Day 6: recommendation, derived requirements and the AI usage statement. Day 7: integration review and upload.',
          },
          body: [
            { kind: 'bullets', items: ['Days 1–3: readiness, risk workshop, register, TPMs', 'Days 4–6: criteria, weights, scores, sensitivity, recommendation', 'Day 7: integration review and upload', 'Quiz Q3 and the applied exercise open now'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Walk the seven days. The risk workshop works best when each member brings two risks written in condition–if–then form, at least one about security or resilience. The trade study takes the most time; start the criteria and weights by day 4 so that sensitivity is not squeezed. Readiness quiz Q3 and the individual applied exercise open now; graduate students do the Monte Carlo memo instead of the exercise. Log your hours.',
            ],
            why: 'A day-by-day plan with owners prevents the last-day trade study, which is where sensitivity analysis usually gets cut.',
            figure: 'Read the timeline left to right with the owner of each step.',
            transition: 'End of the week’s lectures; references follow.',
            timing: '2 min: the timeline and the assessment.',
          },
        },
        {
          id: 'w3s2-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up. The list is generated from every citation in the session and includes SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w3-lesson-decision',
      title: 'Decision management and the frame of a trade study',
      sources: [R('R18', '463'), R('R18', '464'), R('R18', '465'), R('R43', '110')],
      blocks: [
        { kind: 'para', text: 'SEBoK, quoting ISO/IEC/IEEE 15288, gives the purpose of decision management as providing a structured, analytical framework for objectively identifying, characterizing and evaluating a set of alternatives and selecting the most beneficial course of action; the method systems engineers use most is the **trade study** (R18 p.463). Its best practices are sound decision-analysis mathematics, one master decision model refined through the life cycle, value-focused thinking to create better alternatives, and identifying uncertainty and assessing risks for each decision (R18 p.464).' },
        { kind: 'para', text: 'The DoD guidebook lists the steps: identify the problem; review requirements and assumptions; frame the decision in terms of objectives; choose methods and tools; develop criteria, weights and their rationale; identify, record and track assumptions; define the alternatives; assess them against the criteria; synthesize; analyze sensitivities; and brief a recommendation with an action plan. The decision maker keeps full responsibility, authority and accountability for the decision; sound recommendations and action plans are the principal output (R43 p.110).' },
        { kind: 'figure', slide: 'w3s2-decision-management' },
        { kind: 'heading', text: 'Framing, objectives and measures' },
        { kind: 'para', text: 'Start with a decision problem statement that defines the decision in terms of the system life cycle, after describing the baseline, boundaries and interfaces (R18 p.465). Develop the objectives with stakeholders and test them: each fundamental objective essential and controllable; the set complete, non-redundant, concise, specific and understandable. Each measure must be unambiguous, comprehensive, direct, operational and understandable (R18 p.465). The course adds one rule: every criterion traces to an MOE in your Week 2 record, so the trade measures what stakeholders value, and cost and risk are handled explicitly.' },
        { kind: 'figure', slide: 'w3s2-framing' },
      ],
    },
    {
      id: 'w3-lesson-value-weights',
      title: 'Value functions, swing weights and the additive model',
      sources: [R('R18', '465'), R('R18', '466'), R('R18', '467'), R('R18', '468'), R('R18', '469')],
      blocks: [
        { kind: 'para', text: 'Measures come in minutes, dollars and percentages, so they cannot be added directly. Multi-objective decision analysis transforms each measure into value with a **value function** (R18 p.465). The **walk-away point** is the score at which the decision maker would reject the alternative however well it did elsewhere; it maps to 0. The **stretch goal** is the score beyond which there is no extra value; it maps to the top of the value scale. The shape of each curve, linear or otherwise, should be justified in writing (R18 pp.465–466).' },
        { kind: 'figure', slide: 'w3s2-value-functions' },
        { kind: 'para', text: 'Weights are where most trade studies go wrong. SEBoK states that the weights must depend on the importance of a measure **and** on its range from walk-away to stretch. In the swing-weight method the most valuable swing gets an unnormalized weight of 100, every other swing is assessed against it, and the points are normalized to sum to one (R18 p.466; the swing-weight matrix is SEBoK’s Figure 4, p.467). The question to ask is not “how important is cost?” but “how much is moving cost from its walk-away to its stretch value worth, compared with the most valuable swing?” If the range of a measure narrows, its swing is worth less and its weight must fall.' },
        { kind: 'table', header: ['Criterion', 'Swing (walk-away → stretch)', 'Points', 'Weight'], rows: CRITERIA.map((c, i) => [c.name, `${c.walkAway} → ${c.stretch} ${c.unit}`, String(c.swingPoints), `${c.swingPoints} ÷ 250 = ${f2(W[i])}`]), caption: 'AeroLink swing weights (FICTIONAL).' },
        { kind: 'figure', slide: 'w3s2-swing-weights' },
        { kind: 'para', text: 'Alternatives should span the decision space; an alternative generation table, or morphological box, helps (R18 p.467). Each score is recorded with its source and rationale, and an ideal row can be added as a value-focused thinking tool (R18 p.468). Scores become values through the value functions, and each alternative’s value is the weighted sum (R18 p.469):' },
        { kind: 'equation', display: 'v(x) = Σ wᵢ · vᵢ(xᵢ),   Σ wᵢ = 1', speech: 'The value of an alternative is the sum over measures of weight times single-measure value, with the weights summing to one.' },
        { kind: 'figure', slide: 'w3s2-additive-model' },
      ],
    },
    {
      id: 'w3-lesson-aerolink-trade',
      title: 'The AeroLink Year-2 capacity trade, worked',
      sources: [R('R18', '469'), R('R18', '470'), R('R24', '1208'), R('R24', '1209'), R('R25', '1229')],
      blocks: [
        { kind: 'para', text: `The decision: how should AeroLink provide its Year-2 capacity objective, at least ${REQUIRED_CAPACITY} trips a day by month 24? Demand is assumed to be 240 trips a day for every alternative. Capacity is the lower of two limits: aircraft × 20 trips a day, and turnaround chargers × 48 charges a day. The morphological box (three fleet choices by three hub choices) gives nine paths; six are listed as alternatives, and the other three fail a screen from the box alone (${unlisted.map((p) => `${p.fleet.toLowerCase()} with ${p.hubs.toLowerCase()}: ${failText(p)}`).join('; ')}). ${ALTERNATIVES.map((a) => `${a.name}: ${a.aircraft} aircraft and ${a.chargers} chargers, capacity ${cap(a.id)}`).join('. ')}. Adding aircraft alone moves the bottleneck from the fleet to the chargers; a vertiport alone leaves too few aircraft.` },
        { kind: 'figure', slide: 'w3s2-worked-frame' },
        { kind: 'para', text: `Four criteria trace to MOEs: ${CRITERIA.map((c, i) => `${c.name.toLowerCase()} (${c.moe}, weight ${f2(W[i])})`).join('; ')}. Before any weight, every alternative is checked against the screens, which are walk-away points applied before the arithmetic (R18 pp.465–466). Two come from the frame: the capacity requirement, and the walk-away point of every criterion. ${outNames.replace(/^./, (x) => x.toUpperCase())} fail them: the frame eliminates three alternatives before any weight is set. Two design choices make security and resilience explicit. Resilience is a weighted criterion: capacity retained after losing a hub compares performance after a disruption with performance before it, one of SEBoK’s common resilience metrics (R24 p.1209), and SEBoK asks that alternatives be evaluated on their ability to deliver required capability under adversity (R24 p.1208). Security is handled differently: two screens that every alternative must pass before any scoring, because SEBoK frames security as meeting minimum stakeholder expectations while being as secure as reasonably practical (R25 p.1229); a minimum expectation is not traded against waiting time. ${SCREENS.filter((s) => s.id === 'SCREEN-1' || s.id === 'SCREEN-2').map((s) => `${s.name}: ${s.test}`).join(' ')} The three remaining alternatives pass; the two that convert a spoke only if its chargers are replaced rather than retrofitted.` },
        { kind: 'table', header: ['Alternative', 'Capacity (trips/day)', 'Wait (min)', 'Cost (USD M)', 'Screens'], rows: ALTERNATIVES.map((a) => [a.name, String(cap(a.id)), f1(sc(a.id, 0)), f1(sc(a.id, 1)), SCREENS.filter((s) => !s.results[a.id].pass).map((s) => s.name.toLowerCase()).join('; ') || 'all passed']), caption: 'The screens (FICTIONAL): an alternative that fails one is not ranked.' },
        { kind: 'table', header: ['Alternative', 'Wait (min)', 'Cost (USD M)', 'Capacity kept (%)', 'Peak movements/h', 'Total value'], rows: RANKING.map((id) => [name(id), f1(sc(id, 0)), f1(sc(id, 1)), f1(sc(id, 2)), f1(sc(id, 3)), f3(TOTALS[id])]), caption: 'Scores and totals of the alternatives that pass every screen (FICTIONAL), computed from the case rules.' },
        { kind: 'para', text: `The balanced alternative worked in full. Values: wait (60 − 8) ÷ (60 − 5) = ${f3(v('ALT-004', 0))}; cost (20 − 12.8) ÷ 20 = ${f3(v('ALT-004', 1))}; capacity kept (90 − 50) ÷ 50 = ${f3(v('ALT-004', 2))}; noise (10 − 8) ÷ 5 = ${f3(v('ALT-004', 3))}. Total: ${f2(W[0])} × ${f3(v('ALT-004', 0))} + ${f2(W[1])} × ${f3(v('ALT-004', 1))} + ${f2(W[2])} × ${f3(v('ALT-004', 2))} + ${f2(W[3])} × ${f3(v('ALT-004', 3))} = ${f3(TOTALS['ALT-004'])}. The baseline is not ranked: its ${f1(sc('ALT-001', 0))}-minute wait lies beyond the 60-minute walk-away point, so it was screened out rather than scored with a wait value clamped at 0, which would have let its zero cost buy the wait back. The value component chart, which SEBoK describes (R18 p.470), shows each total split by criterion.` },
        { kind: 'figure', slide: 'w3s2-worked-scores' },
      ],
    },
    {
      id: 'w3-lesson-sensitivity',
      title: 'Sensitivity and rank reversal',
      sources: [R('R18', '471'), R('R18', '472')],
      blocks: [
        { kind: 'para', text: 'Decision analysis uses line diagrams, tornado diagrams and Monte Carlo simulation, among others; a line diagram shows the sensitivity to the swing-weight judgment (R18 p.472). Monte Carlo simulation over lower, nominal and upper scores shows which uncertainties have most effect on the decision (R18 p.471).' },
        { kind: 'para', text: `The one-at-a-time method: set one weight to w and rescale the others in proportion so that they still sum to one. Each alternative’s total becomes a straight line in w, and the top rank changes where two lines cross. Only alternatives that pass every screen take part. For the cost weight (base 0.30), the balanced alternative’s other three criteria contribute ${f3(rest('ALT-004', 1))} and those of ${lc(costDown.to)} ${f3(rest(costDown.to, 1))}; with cost values ${f3(v('ALT-004', 1))} and ${f3(v(costDown.to, 1))}, the lines ${f3(v('ALT-004', 1))}w + ${f3(rest('ALT-004', 1) / 0.7)}(1 − w) and ${f3(v(costDown.to, 1))}w + ${f3(rest(costDown.to, 1) / 0.7)}(1 − w) cross at w = ${f3(costDown.w)}.` },
        { kind: 'figure', slide: 'w3s2-worked-sensitivity' },
        { kind: 'para', text: `So ${lc(costDown.to)} ranks first only if capital is weighted below ${f3(costDown.w)} or noise above ${f3(noiseUp.w)} (base 0.14); ${lc(waitUp.to)} ranks first only if the wait weight rises above ${f3(waitUp.w)} (base 0.40); and no resilience weight changes the leader. The recommendation is robust, with capital and noise the two weights to watch. Run the same analysis over the original four alternatives without the screens and the baseline appears to win above a capital weight of ${f3(unscreenedCost.w)}; that is no condition at all, because the decision maker has already walked away from the baseline. A reversal counts only when it leads to an alternative that passes every screen.` },
      ],
    },
    {
      id: 'w3-lesson-pitfalls',
      title: 'Weighted-sum pitfalls',
      sources: [R('R18', '465'), R('R18', '466')],
      blocks: [
        { kind: 'para', text: `**Normalization.** If each measure is scaled from the worst to the best alternative in the set instead of to fixed walk-away and stretch anchors, every value depends on which alternatives are present. For AeroLink’s three feasible alternatives, ${lc(mmB)} scores ${f3(mm.all[mmB])} and ${lc(mmA)} ${f3(mm.all[mmA])}; if the spoke conversion is ruled out and the balanced alternative drops, ${lc(mmA)} scores ${f3(mm.without[mmA])} against ${f3(mm.without[mmB])}. The fallback choice reversed although neither alternative changed. Anchors set by stakeholders (R18 pp.465–466) do not move when the set changes: they give ${f3(TOTALS[mmA])} against ${f3(TOTALS[mmB])} either way. The demonstration is the instructor’s arithmetic.` },
        { kind: 'figure', slide: 'w3s2-weighted-sum-pitfalls' },
        { kind: 'para', text: '**Compensation.** A weighted sum lets a strong score on one criterion buy back a weak one on another. Within the walk-away points that is the intended behavior; past a walk-away point, or for a minimum expectation, it is not, which is why requirements, walk-away points and minimum expectations, such as authenticated control of a safety-related charger, belong in screens. **Double counting.** Two criteria that measure the same concern, such as cost and affordability, give it two weights; SEBoK’s test that the objectives be non-redundant catches this (R18 p.465), and the course check is one MOE, one criterion. **Importance without range.** Weights assigned by general importance ignore the range dependence SEBoK requires (R18 p.466).' },
      ],
    },
    {
      id: 'w3-lesson-recommendation',
      title: 'The recommendation, the driving question, and bias',
      sources: [R('R18', '464'), R('R18', '472'), R('R18', '473'), R('R18', '474'), R('R43', '110')],
      blocks: [
        { kind: 'para', text: `A defensible decision record states the decision, the recommendation, its conditions, the residual risk and what would change it. SEBoK asks the team to communicate the key trade-offs, uncertainties and risks (R18 p.472) and to present the recommendation as a clearly worded, actionable task list with a report for traceability (R18 p.473). AeroLink’s record: ${DECISION.why} Conditions: ${DECISION.conditions.join('; ')}. Residual risk: ${DECISION.residualRisk.join('; ')}. Would change if: ${DECISION.wouldChangeIf.join('; ')}.` },
        { kind: 'figure', slide: 'w3s2-worked-decision' },
        { kind: 'para', text: `The driving question, whether to buy six more aircraft, is answered by the frame and the trade together: six aircraft alone raise capacity only to ${cap('ALT-002')} trips a day because six chargers become the limit, realizing the charging-lag risk; four aircraft with a fourth hub give ${cap('ALT-004')}. The answer is conditional on the charging technology (TRL ${technology('TECH-001').trl}, on an assumption), the unknown grid connection and the capital and noise weights, which is SEBoK’s point about assessing uncertainty and risk for each decision (R18 p.464). The landing-energy TPM, with a margin of ${f1(marginOf(tpm('TPM-003')))} points, is worth watching too: more aircraft mean more fast-charge cycles.` },
        { kind: 'figure', slide: 'w3s2-answer' },
        { kind: 'para', text: 'Finally, the people. Mining the results for ways to improve alternatives moves a team from alternative-focused to value-focused thinking (R18 p.472). Cognitive bias, confirmation bias above all, can seriously distort decisions, and self-mitigation is generally not feasible (R18 p.473); independent review and the premortem are among the mitigations SEBoK lists (R18 p.474). Course practice: the person who proposed an alternative does not score it alone.' },
      ],
    },
    {
      id: 'w3-lesson-forward',
      title: 'What these methods feed',
      sources: [R('R48', '146'), R('R78', '147'), R('R75', '95'), R('R78', '152'), R('R18', '464')],
      blocks: [
        { kind: 'para', text: `Each Week 3 artifact has a later consumer. ${FEEDS_FORWARD.map((f) => `${f.artifact}: ${f.week}, ${f.how}`).join('. ')}. Decisions generate derived requirements (R48 p.146). In Phase II, SysML v2’s risk metadata library annotates model elements with probability and impact (R78 p.147), and a trade study becomes an analysis case that binds the alternatives to an evaluation function (R75 p.95) using the TradeStudies library (R78 p.152). The trade you build this week is the first version of the master decision model SEBoK recommends refining through the life cycle (R18 p.464).` },
        { kind: 'figure', slide: 'w3s2-feeds-forward' },
      ],
    },
    {
      id: 'w3-lesson-apply',
      title: 'Applying the methods to your own enterprise',
      sources: [R('R16', '767'), R('R61a', '630'), R('R44', '117'), R('R18', '466'), R('R18', '472')],
      blocks: [
        { kind: 'para', text: 'Your team does not model AeroLink; it repeats the method on its own enterprise, starting from the Week 2 record. A practical order, matching the lab tool, is the following.' },
        {
          kind: 'steps',
          items: [
            { label: 'Readiness', text: 'List the technologies your requirements depend on. For each, pick the TRL whose wording fits what has actually been shown, and where (R16 p.767); cite the evidence or record an assumption with an owner and a validation action. Mark which are critical, and give each critical technology below TRL 6 a maturity risk.' },
            { label: 'Risks', text: 'In a short workshop each member brings two risks in condition–if–then form (R61a p.630), at least one about security or resilience. Rate each on the course scales with a written reason, compare the handling options before choosing one, name an owner, a treatment and an observable trigger, and link each risk to the requirements, capabilities or scenarios it threatens.' },
            { label: 'Register', text: 'Carry your Week 2 TBDs and TBRs in as unknowns, add assumptions and at least one opportunity, and move anything that has already happened to the issue log.' },
            { label: 'TPMs', text: 'Pick the requirements whose numbers are both uncertain and tied to a risk. Record threshold, objective, current estimate and a contingency with its reason; the tool computes worst case and margin (R44 p.117). Give planned values at future reviews.' },
            { label: 'Trade study', text: 'Write the decision statement, at least three genuinely different alternatives including the baseline, criteria traced to your MOEs with walk-away and stretch points, swing points with a reason for each (R18 p.466), and scores with their sources. Decide which requirements and minimum expectations, often security, are screens rather than criteria, and screen out any alternative that misses one or lies beyond a walk-away point before you rank.' },
            { label: 'Decide', text: 'Read the reversal points the tool computes for each weight among the alternatives that pass the screens (R18 p.472). If the leader changes within a plausible range of a weight, say so; if not, say why the recommendation is robust. Write the conditions, the residual risk and what would change the decision, and any derived requirements the decision creates.' },
          ],
        },
        { kind: 'para', text: 'Three checks before you submit. Can a teammate who did not write a risk tell, from the statement alone, what would have to happen for it to occur? Does every margin use the worst case rather than the current estimate? Would your recommendation survive the removal of an alternative nobody chose? If the answer to any is no, the method has been followed in form but not in substance.' },
      ],
    },
  ],
}

