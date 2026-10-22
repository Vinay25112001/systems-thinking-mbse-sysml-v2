// Week 6, Session 1 lecture: Evolution Roadmap — from capability gaps to a technology plan. Architecture includes the
// principles of its evolution; capability trajectories, gaps and excesses over near-, mid- and far-term horizons; from gaps
// to a portfolio of changes and an enterprise plan; as-is and to-be; development approaches and evolutionary acquisition;
// lessons for planning increments; deferral and off-ramps; technology planning and the contents of a technology plan;
// what maturity evidence can and cannot tell; the AeroLink technology table (exercise, then reveal); known unknowns; and a
// think-pair-share that Session 2 answers. 75-minute session: 69 minutes of planned content on 22 slides plus the
// generated "References and credits" slide, and a 6-minute buffer (bufferMinutes). Single source for the slide viewer, the
// faculty notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach
// first, explain in depth, demonstrate, then assign), A21 (the Week 1 architecture is the template; item 6, security and
// resilience integrated into Week 6) and A22 (one continuous engineering journey).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week06/WEEK06_LECTURE_OUTLINE.md §2.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. R105 (MITRE Technology Planning), R106 (Evolutionary Acquisition),
//     R107 (Implementation, O&M, and Transition), R108 (SEBoK Development Approach Concepts) and R109 (Architectures
//     Federation) were added to the register for this week, pending faculty confirmation. R60 is cited only at pp.523–526.
//   - Source gaps are named where they bite: no held source gives a roadmap template, lanes or a horizon rule for a given
//     enterprise; TRLs come only through SEBoK's table; integration and system readiness levels are named without a scale.
//     The roadmap anatomy, the known-unknowns record fields and AeroLink's horizon lengths are course conventions.
//   - AeroLink Urban Mobility is FICTIONAL. Weeks 1–5 data are imported read-only; Week 6 data come from ./aerolinkCase.ts.
//     Counts and capacities on the slides and in the notes are computed there, not typed here.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay between 40 and 130 words per minute (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { REQUIRED_CAPACITY, TRADE_RULES } from '../week03/aerolinkCase'
import { AEROLINK_HORIZONS, BASELINE, COUNTS, DRIVING_QUESTION, FASTER_CHARGE, FLEET_STEP, GAPS, KNOWN_UNKNOWNS, UTILIZATION_LIMIT, YEAR2, increment, techPlan } from './aerolinkCase'
import { LAB6_MINIMUMS as MIN, MATURE_TRL } from './labBrief'

export const WEEK6_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const C = COUNTS
const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const t1 = techPlan('TECH-001')
const t2 = techPlan('TECH-002')
const t3 = techPlan('TECH-003')
const t4 = techPlan('TECH-004')
const t5 = techPlan('TECH-005')
const near = AEROLINK_HORIZONS[0]
const mid = AEROLINK_HORIZONS[1]
const far = AEROLINK_HORIZONS[2]
const u9 = KNOWN_UNKNOWNS.find((x) => x.id === 'U-009')!
const u4 = KNOWN_UNKNOWNS.find((x) => x.id === 'U-004')!
const inc1 = increment('INC-001')
const inc3 = increment('INC-003')
const pct = (x: number) => `${Math.round(x * 100)} %`

export const WEEK6_SESSION1: Lecture = {
  week: 6,
  session: 1,
  title: 'Evolution Roadmap',
  subtitle: 'Session 1: From capability gaps to a technology plan',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (6 min)
    {
      id: 'w6s1-framing',
      title: 'Framing: after the Year-2 decision',
      slides: [
        {
          id: 'w6s1-title',
          title: 'Evolution Roadmap',
          subtitle: 'Session 1: From capability gaps to a technology plan',
          purpose: 'Orient students to the scheduled subject, the two sessions and what the week adds to the Team Record.',
          minutes: 1,
          layout: 'title',
          body: [
            {
              kind: 'bullets',
              items: ['Today: capability gaps over three horizons, increments, the technology plan', 'Session 2: transition, the AeroLink roadmap and the Lab L6 launch', 'Your Team Record grows: roadmap, technology plan, known unknowns, baseline review'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject as the schedule gives it: Evolution Roadmap. Promise: by the end of today you can state where your enterprise falls short over three horizons, explain how change is delivered in increments, build a technology plan from your Week 3 assessment, and say what a TRL cannot tell you.',
              'Each team extends its Week 5 Team Record for its own enterprise. Weeks 1 to 5 described the enterprise as it enters service; Week 6 asks how it changes afterward and closes the content weeks before Week 7 integrates the package. AeroLink stays the worked example.',
            ],
            why: 'Naming the parts of the record at the start tells students which ideas they must use within seven days, and placing Week 6 just before the Phase I review tells them their roadmap will be read as part of the package.',
            examples: [
              'Instructor preparation (not for students): bring the Week 3 trade decision and the Week 5 interface table on one handout; students need them on slide 6 and in Session 2. Decide before class whether you accept the AeroLink horizons and Increments 1 to 3 as proposed (they are marked proposed in the case).',
              'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten slide 8 or slide 16; never shorten the gap slide (6) or the technology exercise and its reveal (18 and 19).',
            ],
            misconceptions: [{ claim: 'A roadmap is a calendar of features with dates.', correction: 'A roadmap is a plan of changes, each tied to a gap it closes and to the evidence that starts it. Dates follow from triggers; they do not replace them.' }],
            transition: 'First, the question the whole week answers.',
            timing: '1 min: 30 s subject and promise, 30 s the record parts.',
          },
        },
        {
          id: 'w6s1-driving-question',
          title: 'The driving question: after the Year-2 decision, what comes next?',
          purpose: 'Create a need to know before any explanation: the order of change depends on evidence, not preference.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-driving-question',
            caption: 'After the Year-2 decision the board sees three branches and asks which comes first. (FICTIONAL)',
            alt: 'A road runs from the left, labeled Year 2: 16 aircraft, four hubs. At a fork with a question mark it splits into three branches to the right, labeled autonomy, more capacity and integrated ticketing.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Scenario (FICTIONAL)', text: 'Week 3 decided AeroLink’s Year-2 plan: four more aircraft and a fourth hub. The board asks what comes next.' },
            { kind: 'bullets', items: ['A: autonomous operations first', 'B: more capacity first', 'C: integrated ticketing first', 'D: none of the three first'] },
          ],
          sources: [],
          notes: {
            teach: [
              `Read the scenario. The Week 3 decision is committed: AeroLink is already carrying it out, ${YEAR2.addedAircraft} more aircraft and a fourth hub, ${YEAR2.capacity} trips a day by month ${YEAR2.month}. The board now asks a different kind of question: ${DRIVING_QUESTION.question.charAt(0).toLowerCase()}${DRIVING_QUESTION.question.slice(1)}`,
              'Ask for a show of hands, or a poll on the LMS, for A, B, C or D. Give thirty seconds to think and thirty to vote. Write the counts on the board and keep them; we return to them in Session 2.',
              'Ask two students who chose different answers for their reason in one sentence. Expect preferences: autonomy is exciting, capacity is safe, ticketing pleases customers. Do not resolve it. Say: by the end of Session 2 we will answer from AeroLink’s evidence, and the answer will be one most of you did not choose for the reason it is right.',
            ],
            why: 'A prediction made before instruction creates a need to know, and the spread of votes exposes the habit this week corrects: ordering change by preference instead of by gaps, maturity and triggers.',
            figure: 'Point at the road from the left, labeled with the Year-2 configuration, then at the fork and its question mark, then at each branch in turn. Nothing on the drawing says which branch is right; that is the point.',
            examples: ['A hospital analogue: after a new wing opens, the board asks whether to add robotic surgery, more beds or an integrated patient portal next. Each has champions; the order should come from the gaps, the maturity of each technology and what each depends on.'],
            misconceptions: [{ claim: 'The most advanced technology should come first, or the enterprise falls behind.', correction: 'MITRE’s lesson is “no technology before its time”: emerging technology is used when it is mature. An immature technology scheduled first puts the whole roadmap on its least certain item.' }],
            transition: 'Before the answer, where this week sits in the package.',
            timing: '3 min: 30 s scenario, 1 min vote, 1.5 min two reasons aloud.',
          },
        },
        {
          id: 'w6s1-where',
          title: 'Where Week 6 sits: the roadmap reads every earlier artifact',
          purpose: 'Show that a roadmap consumes the Weeks 1–5 package and feeds Weeks 7, 13 and 14.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-where',
            caption: 'Weeks 1 to 5 say why, what and where; the roadmap adds when and in what order, and feeds Weeks 7, 13 and 14.',
            alt: 'Five input boxes on the left, one per earlier week: Week 1 needs, Week 2 requirements, Week 3 readiness, Week 4 architecture, Week 5 interfaces. Arrows converge on a central box, Week 6 roadmap. Three arrows leave it to the right: Week 7 package, Week 13 analysis, Week 14 model change.',
          },
          body: [
            { kind: 'bullets', items: ['Weeks 1–2: why change, for whom', 'Week 3: what is ready, what was decided', 'Weeks 4–5: where change lands', 'Week 6 adds when, and in what order', 'Out: Week 7 package, Week 13 analysis, Week 14 model change'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Walk the inputs. The needs and objectives of Weeks 1 and 2 say why the enterprise must change and for whom. The readiness assessment, the risk register and the trade decision of Week 3 say what is ready and what has been decided. The architecture and the interfaces of Weeks 4 and 5 say where a change lands and what it must plug into. The roadmap adds two things none of them has: when, and in what order.',
              'Then the outputs. Week 7 puts the roadmap into the Systems Thinking Engineering Package, so every earlier ID it cites must still resolve. Week 13 may reuse the roadmap’s triggers as analysis cases. Week 14 takes one increment and models it as a change to your SysML v2 model, assessing its impact from the model rather than by hand.',
            ],
            why: 'Students who see that the roadmap reads every earlier artifact keep their IDs stable and cite them, which is what lets Week 7 integrate the package and Week 14 model a change.',
            figure: 'Read the five inputs top to bottom, each with its week; then the central roadmap box; then the three outputs to the right. Say which output each later week reads.',
            misconceptions: [{ claim: 'The roadmap is a separate strategy document that the engineering package does not need.', correction: 'The roadmap cites the package’s own IDs: gaps from Week 1–2 needs, technologies from the Week 3 assessment, elements and interfaces from Weeks 4–5. Without them it is a wish list.' }],
            transition: 'Start where Week 4 left a word for us: evolution.',
            timing: '2 min: 1 min inputs, 1 min outputs.',
          },
        },
      ],
    },
    // ============================================================================================ B. capability evolution (18 min)
    {
      id: 'w6s1-capability',
      title: 'Capability evolution over time',
      slides: [
        {
          id: 'w6s1-architecture-evolution',
          title: 'Architecture includes the principles of its evolution',
          purpose: 'Anchor the week in the definition of architecture the class used in Week 4.',
          minutes: 2,
          layout: 'definition',
          body: [
            { kind: 'definition', term: 'Architecture', text: 'Fundamental concepts or properties of a system in its environment embodied in its elements, relationships, and in the principles of its design and evolution', source: R('R39t', '1445') },
            { kind: 'bullets', items: ['Evolution is part of the architecture, not an appendix', 'Week 4 described the architecture; Week 6 plans its evolution'] },
          ],
          sources: [R('R39t', '1445'), R('R109', '131')],
          notes: {
            teach: [
              'Return to the Week 4 definition, the ISO/IEC/IEEE 15288 wording that SEBoK’s glossary records first (R39t p.1445). Last time we underlined elements and relationships. Today underline the last words: the principles of its design and evolution. How a system will change is part of what its architecture is.',
              'MITRE’s architecture-federation article says the same of enterprises: architecture relates to the structure of components, their relationships to each other and to the environment, and the principles guiding the design and evolution of the entity they describe (R109 p.131). An architecture that cannot say how it will evolve has left out part of its own definition.',
              'So the roadmap is not an appendix that strategy staff write after engineering is done. It is the architecture work that decides which elements are added, changed or dropped, in which order, and under which rules.',
            ],
            why: 'Students who treat the roadmap as separate from the architecture produce plans that ignore the interfaces and decisions of Weeks 4 and 5; the definition makes the link non-negotiable.',
            misconceptions: [{ claim: 'Evolution belongs to project management, not to systems engineering.', correction: 'The definition puts the principles of evolution inside the architecture. Scheduling is management; deciding what changes, where and on what evidence is engineering.' }],
            transition: 'If architecture evolves, what is it evolving toward? SEBoK’s answer is capability.',
            timing: '2 min: 1 min the definition, 1 min the consequence.',
          },
        },
        {
          id: 'w6s1-capability-trajectory',
          title: 'Three kinds of capability, and the baseline trajectory',
          purpose: 'Locate the roadmap in enterprise capability management: moving the enterprise off its baseline trajectory.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-trajectory',
            caption: 'The baseline trajectory is where current plans lead; capability management vectors the enterprise toward a better one.',
            alt: 'A chart with time running right from now through near, mid and far, and capability rising upward. A dashed line labeled baseline trajectory rises slowly. A solid line above it, labeled desired trajectory, rises faster. A curved arrow from the dashed line to the solid line is labeled vectoring.',
          },
          body: [
            { kind: 'bullets', items: ['Three kinds: organizational, system and operational capability', 'The baseline: current capability plus what is already planned', 'Capability management vectors the enterprise toward its goals', 'within its resources and other limits'] },
          ],
          sources: [R('R12', '860')],
          notes: {
            teach: [
              'SEBoK’s Enterprise Capability Management article starts with a distinction. There are three kinds of capability: organizational capability, system capability and operational capability (R12 p.860). Organizational capability is what the organization can do, managed as a business. System capability is what a system can do, managed by the technical management processes. Operational capability, what the enterprise can deliver in operation, is the subject of the article and of our roadmap.',
              'Then the key idea. The enterprise has a current and planned operational capability, its baseline, based on its past activities and its current plans for change. The purpose of capability management is to make it possible to vector the enterprise away from that baseline trajectory toward a more desirable position, where it better meets its strategic goals and objectives, given its resource constraints and other limitations (R12 p.860).',
              `For AeroLink the baseline trajectory is not flat: it already includes the Week 3 decision. Without any further change the network reaches ${YEAR2.capacity} trips a day by month ${YEAR2.month} and stays there. The question for the roadmap is where that line falls short of, or runs above, what the stakeholders need.`,
            ],
            why: 'The trajectory picture changes the question from “what should we add?” to “where will our current plan leave us short?”, which is the question a gap analysis answers.',
            figure: 'Trace the dashed baseline trajectory from now to the far term, then the desired trajectory above it. Point at the curved arrow: vectoring is the roadmap’s job. Stress that the baseline already includes planned changes.',
            examples: ['A city bus network’s baseline trajectory includes the vehicles already ordered; its desired trajectory might add bus lanes and a new route. The roadmap is about the distance between the two lines.'],
            misconceptions: [{ claim: 'The baseline is only what exists today.', correction: 'SEBoK’s baseline is current and planned capability. Changes already decided, like AeroLink’s Week 3 decision, are part of the baseline trajectory the roadmap starts from.' }],
            transition: 'The distance between the lines, measured, is a capability gap.',
            timing: '3 min: 1 min three kinds, 1.5 min baseline and vectoring, 30 s AeroLink.',
          },
        },
        {
          id: 'w6s1-gaps',
          title: 'Operational needs, capability gaps and excesses over horizons',
          purpose: 'Teach the gap analysis: desired versus baseline capability, gaps and excesses, mapped into time buckets.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-gap-chart',
            caption: 'AeroLink’s desired levels and baseline trajectory in three horizons; compare the near-term levels before reading on. (FICTIONAL)',
            alt: `Three columns, near term, mid term and far term. In the near column two bars labeled ${REQUIRED_CAPACITY} (desired) and ${YEAR2.capacity} (baseline at month ${YEAR2.month}); the difference between them is not labeled. In the mid column two boxes: desired, service in a grid outage; baseline, none. In the far column: desired, remote supervision; baseline, pilot aboard.`,
          },
          body: [
            { kind: 'bullets', items: ['Desired levels come from the needs', 'Compare the desired capability with the baseline', 'The comparison finds gaps and excesses', 'Gap: baseline below desired; excess: baseline above it', 'Map them to near-, mid- and far-term buckets', 'Choose bucket lengths that fit how fast your enterprise changes'] },
          ],
          sources: [R('R12', '861'), R('R12', '862')],
          notes: {
            teach: [
              'SEBoK separates two kinds of need. An operational need is something desirable in direct support of the enterprise’s end-user activities; an enterprise need supports its internal activities and the enabling assets that let the mission be accomplished (R12 p.861). Your Week 1 needs are mostly operational; enterprise needs show up as investors’ and partners’ concerns.',
              'Capabilities exist to meet mission and enterprise needs. There is a baseline capability, the capability developed so far plus any already planned, and the desired levels, based on the needs assessment, are compared with it to find the capability gaps; the same comparison finds points of excess capability. Gaps should be filled and excesses eliminated (R12 p.862).',
              'Then time. The projected gaps and excesses are mapped into future timeframes to see the timing and intensity of change. Near-, mid- and far-term buckets are typical: for long-lasting capabilities about five, ten and twenty years; for fast-changing ones, like consumer products, shorter, for example one, two and three years (R12 p.862). The bucket lengths are your choice, and you must say why.',
              `Now the figure. Ask the class to compare the near-term levels before you say anything. The objective MGO-007 asks for ${REQUIRED_CAPACITY} trips a day by month ${YEAR2.month}: planning demand of ${TRADE_RULES.demand} at no more than ${UTILIZATION_LIMIT * 100} percent utilization. Measure against the baseline trajectory, not today’s snapshot: with the committed Year-2 step, ${YEAR2.aircraft} aircraft give ${YEAR2.capacity}, fleet-limited. There is no near-term capacity gap; the trajectory runs ${C.capacityExcess} above the desired level. Measured from the entry snapshot of ${BASELINE.capacity}, you would find a ${C.snapshotGap}-trip gap and plan the Year-2 decision a second time.`,
              `So the near-term capacity is an excess: capability above the desired level, a candidate for divestment, not an order to divest. Here it is kept with a reason: the Week 3 box offered ${FLEET_STEP.options.map((o) => `+${o.added}`).join(', ')} aircraft, and the headroom carries demand to ${YEAR2.supports} trips a day before the next capacity step. The second excess: all ${C.idleChargers} chargers stand idle ${C.idleHours} hours a night, which an opportunity can sell. Do not count slack on a limit that does not bind: the chargers could deliver ${YEAR2.chargerLimit} charges in the day against the fleet’s ${YEAR2.capacity}, and that slack is what keeps the chargers from binding.`,
              `AeroLink’s horizons, proposed for the instructor to confirm: near term ${near.length}, mid term ${mid.length}, far term ${far.length}. Short buckets, because AeroLink is a young service on a fast-moving technology.`,
            ],
            why: 'The gap analysis is what makes a roadmap answerable to stakeholders: every increment must later point at a gap, and a gap must point at a need. Measuring against the trajectory stops a roadmap from re-planning what is already decided.',
            figure: `Point at the near column: desired ${REQUIRED_CAPACITY}, baseline ${YEAR2.capacity}; the difference is not printed, so ask: gap or excess? Then the mid column, a resilience gap with no number yet, and the far column, a gap in how flights are operated.`,
            workedSolution: [
              `Near: desired ${REQUIRED_CAPACITY} trips/day (MGO-007), trajectory ${YEAR2.capacity} at month ${YEAR2.month}: an excess of ${C.capacityExcess}, kept as headroom (not a gap of ${C.snapshotGap}).`,
              `Excess: ${C.idleChargers} chargers idle ${C.idleHours} h a night. Not an excess: the charger slack of ${C.chargerSlack}.`,
              `Mid: service through a grid outage, against none (R-011); far: remote supervision against a pilot aboard. ${C.gaps} gaps and ${C.excesses} excesses.`,
            ],
            misconceptions: [
              { claim: 'A gap analysis lists the features we would like to add.', correction: 'A gap is a shortfall against a desired level that comes from a need. A feature with no need behind it is not a gap; it is the first common error of roadmaps.' },
              { claim: 'Spare room on any limit is an excess.', correction: 'An excess is the baseline above the desired level. Slack on a limit that does not bind keeps that limit from binding; removing it creates a gap.' },
              { claim: 'Time buckets are always five, ten and twenty years.', correction: 'SEBoK gives those for long-lasting capabilities and one, two and three years for fast-changing ones. The team chooses and justifies its bucket lengths.' },
            ],
            transition: 'A gap tells us where we must go. How does a gap become a change?',
            timing: '4 min: 1 min needs, 1 min gaps and excesses, 1 min buckets, 1 min the AeroLink figure.',
          },
        },
        {
          id: 'w6s1-gaps-to-changes',
          title: 'From gaps to changes: architecture, opportunities, portfolio',
          purpose: 'Show how a gap becomes a candidate change, and why changes are assessed together.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-portfolio',
            caption: 'A gap becomes candidate changes to the architecture; the candidates depend on each other, so they are judged as a portfolio.',
            alt: 'On the left a box labeled gap. Arrows lead to three cards in the middle, labeled add, change and drop. On the right the cards sit inside a portfolio box, joined by dependency lines to each other and to boxes labeled operations and partners.',
          },
          body: [
            { kind: 'bullets', items: ['Architecture shows where elements are added, dropped or changed', 'Each change has benefits, costs and risks', 'Opportunities depend on each other, on operations and on partners', 'So assess them as a portfolio, each with a business case'] },
          ],
          sources: [R('R12', '862')],
          notes: {
            teach: [
              'SEBoK continues with enterprise architecture analysis. A baseline architecture is characterized to understand what the enterprise has and where its current plans lead; the needs and gaps are then used to determine where in the architecture elements need to be added, dropped or changed. Each modification brings potential benefits to stakeholders, with costs and risks for introducing it (R12 p.862).',
              'Opportunities for improvement usually require investment, and some are divestments: selling assets, reducing capacity, cancelling projects. Each can be assessed on its own merits, but usually they have dependencies and interfaces with other opportunities, with current activities and operations, and with partners, so they may need to be assessed as a portfolio, and typically each needs a business case (R12 p.862).',
              'For AeroLink: the Year-2 capacity shortfall became the Week 3 trade, which compared alternatives with a business case; its decision is committed, so it now sits in the baseline trajectory. The idle overnight charger hours meet opportunity O-002, leasing to ground fleets, which depends on the hub chargers existing first. Integrated ticketing depends on a partner, the transport authority. Those dependencies are why the order of change matters.',
            ],
            why: 'Students tend to judge each change alone; the portfolio view makes them see that a change can depend on another change, on operations continuing, or on a partner’s agreement.',
            figure: 'Follow the gap to the three kinds of change, add, change and drop, then into the portfolio box. Point at the dependency lines between cards and out to operations and partners: each line is a reason one change waits for another.',
            misconceptions: [{ claim: 'Changes should be ranked by benefit and done in that order.', correction: 'Benefit alone ignores dependencies: a high-benefit change that depends on a partner’s agreement cannot go first, however valuable it is.' }],
            transition: 'Assessed changes go into a plan. What does SEBoK say the plan holds?',
            timing: '3 min: 1 min architecture changes, 1 min portfolio, 1 min AeroLink.',
          },
        },
        {
          id: 'w6s1-improvement-plan',
          title: 'The enterprise plan and managing change',
          purpose: 'Give the roadmap its professional form: a long-horizon plan with monitored targets, and change managed without harming operations.',
          minutes: 3,
          layout: 'two-column',
          body: [
            { kind: 'callout', tone: 'key', title: 'The enterprise plan', text: 'Opportunities laid out over a long horizon, aligned with strategic goals; each planned change has a performance target that is monitored, and the plan is adjusted as needed.' },
          ],
          aside: [
            { kind: 'bullets', items: ['Seven lenses for change:', 'strategic objectives, stakeholders', 'processes, performance metrics', 'current state alignment', 'resources, maturity assessment'] },
          ],
          sources: [R('R12', '863')],
          notes: {
            teach: [
              'The results of the opportunity assessment are compiled into an enterprise plan that considers system capabilities, organizational capabilities, funding constraints, legal commitments, partner arrangements, intellectual property, and personnel development and retention. The plan usually goes out to a long horizon, typically more than a decade, and must align with the enterprise’s strategic goals and leadership priorities (R12 p.863).',
              'Two words matter for your lab. First, targets: the planned changes should have associated performance targets, and those metrics are monitored to ensure that progress is being made and the intended improvements are being implemented; the plan is adjusted for unforeseen circumstances (R12 p.863). That is the origin of the trigger each increment carries.',
              'Second, care: changes to enterprise capability should be managed so that current operations are not adversely affected where possible, and the enterprise stays viable in the long term. SEBoK lists seven lenses to facilitate change management: strategic objectives, stakeholders, processes, performance metrics, current state alignment, resources and maturity assessment (R12 p.863). Read the list on the right; the last lens, maturity assessment, is where Week 3 returns today.',
            ],
            why: 'The plan’s monitored targets explain why every increment needs a measurable trigger, and the instruction not to harm current operations is the seed of Session 2’s transition discussion.',
            misconceptions: [{ claim: 'Once a roadmap is approved, it should be followed as written.', correction: 'SEBoK says the plan is adjusted as necessary for unforeseen circumstances and outcomes. A roadmap that is never revised has stopped being monitored.' }],
            transition: 'A plan needs a start and an end. MITRE calls them as is and to be.',
            timing: '3 min: 1 min the plan, 1 min targets, 1 min the seven lenses.',
          },
        },
        {
          id: 'w6s1-as-is-to-be',
          title: 'As is, to be, and the roadmap between them',
          purpose: 'Introduce the canonical roadmap structure: two snapshots and an investment path between them.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-as-is-to-be',
            caption: 'Two snapshots and a path of increments between them; other paths are possible, and views help compare them.',
            alt: 'On the left a small box labeled as is; on the right a larger box labeled to be. Between them a staircase of three steps labeled Inc 1, Inc 2 and Inc 3. A thinner dashed staircase below is labeled another path.',
          },
          body: [
            { kind: 'bullets', items: ['Enterprise architecture: a snapshot of the current environment and of the target', 'plus an investment roadmap from “as is” to “to be”', 'As-is and to-be views show migration paths', 'Architectures help assess different evolutionary paths'] },
          ],
          sources: [R('R109', '131'), R('R109', '132'), R('R62', '345')],
          notes: {
            teach: [
              'MITRE gives the enterprise-architecture picture in one sentence: an enterprise architecture consists of snapshots of the current operational and technological environment and of the target environment, and a capital investment roadmap for transitioning from the “as is” to the “to be” environment; it acts as a roadmap for the way ahead (R109 pp.131–132). The snapshots consist of views, each for a group of stakeholders.',
              'MITRE’s architecture-frameworks article adds the use: architectures can help assess today’s alternatives and different evolutionary paths to the future, and views of the “as is” and “to be” architectures help stakeholders understand potential migration paths and transitions (R62 p.345).',
              'For your roadmap this means three things. Start from an honest as-is, your Weeks 4 and 5 views, and carry forward what is already decided. Describe the to-be in each horizon as an end state, not a list of purchases. And remember there is more than one path between them: the dashed staircase on the figure is a real alternative, and the roadmap is the path you chose with reasons.',
            ],
            why: 'The as-is and to-be framing gives students a structure to fill and reminds them that their Week 4 views are the starting snapshot, not something to redraw.',
            figure: 'Point at the as-is sketch, then the to-be sketch, then walk up the staircase of three increments. Then point at the dashed staircase below: another path, which views help compare.',
            misconceptions: [{ claim: 'The to-be architecture is the last increment’s purchase list.', correction: 'The to-be is a target environment described in views, an end state. Purchases are means; the end state is what stakeholders will get.' }],
            transition: 'A gap tells us where to go. Increments are how we get there without stopping the service.',
            timing: '3 min: 1 min MITRE’s definition, 1 min evolutionary paths, 1 min what it means for the lab.',
          },
        },
      ],
    },
    // ============================================================================================ C. increments (15 min)
    {
      id: 'w6s1-increments',
      title: 'Delivering change in increments',
      slides: [
        {
          id: 'w6s1-development-approaches',
          title: 'Development approaches: sequential, incremental, evolutionary',
          purpose: 'Give the sourced vocabulary, and the limit that the adjectives describe development, not the enterprise roadmap.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-approaches',
            caption: 'Three development approaches under a bracket “development stage only”; the enterprise roadmap runs above them, through operation.',
            alt: 'Three small strips side by side. Sequential: one long block. Incremental: blocks of growing size in a row. Evolutionary: a chain of loops. A bracket under all three reads development stage only. Above them a long arrow reads enterprise roadmap, through operation.',
          },
          body: [
            { kind: 'bullets', items: ['Sequential, incremental and evolutionary; the groups overlap', 'Grouped by how well requirements are known and what increments are for', 'The adjectives apply to the development stage only', 'For each increment, say which development approach fits'] },
          ],
          sources: [R('R108', '391'), R('R108', '392'), R('R108', '393')],
          notes: {
            teach: [
              'SEBoK describes a variety of development approaches, several with combinations of features including sequential, incremental and evolutionary; the boundaries between these groups are not clear-cut and there can be overlaps. The classification rests on how well the requirements of the system of interest are known, whether there are increments, and what those increments are used for (R108 p.391).',
              'In brief. Sequential approaches perform the development tasks in a specific order with some iteration; they fit manageable projects in familiar domains where risk is manageable (R108 p.392). Incremental approaches develop a sequence of increments of increasing capability, the last meeting all requirements; their benefits are a focus on technical risk and the possibility to introduce emerging technologies. Evolutionary approaches start with a limited set of requirements, and each cycle provides stakeholder value and increases understanding of the problem (R108 p.393).',
              'Now the caution, which most texts skip. SEBoK notes that “waterfall”, “incremental” and “evolutionary” almost always sit next to “development”, and that these adjectives apply only to the development stage, not to the life cycle as a whole (R108 p.391). Your enterprise roadmap evolves an operating enterprise; each increment on it may still be developed sequentially, incrementally or evolutionarily. So for each increment, say which development approach fits, and why.',
            ],
            why: 'Students conflate an evolving enterprise with an evolutionary development approach; separating the two lets them choose a development approach per increment with a reason.',
            figure: 'Read the three strips left to right, then the bracket beneath them: development stage only. Then point above, at the long arrow that runs through operation: that is the enterprise roadmap, a different thing.',
            examples: [`AeroLink: the committed Year-2 step is developed sequentially (requirements known, technology assumed mature); Increment 1 incrementally, one hub first to retire the integration unknown; Increment 3 evolutionarily, because its final functionality cannot be defined now.`],
            misconceptions: [{ claim: 'An evolving enterprise must use an evolutionary development approach.', correction: 'SEBoK applies the adjectives to the development stage only. An evolving enterprise can develop one increment sequentially and another evolutionarily.' }],
            transition: 'Evolutionary acquisition gives a practitioner’s model of how increments are defined.',
            timing: '4 min: 1 min classification, 1.5 min the three approaches, 1.5 min the caution.',
          },
        },
        {
          id: 'w6s1-evolutionary-acquisition',
          title: 'Evolutionary acquisition: two ways to define increments',
          purpose: 'A practitioner’s model of increment planning: fixed end state versus emerging end state.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-two-approaches',
            caption: 'Above, the end state is known and maturing technology fills it; below, the end state emerges with each increment.',
            alt: 'Two timelines, each with three numbered increments. The upper one ends in a solid box labeled end state defined. The lower one ends in a dashed cloud labeled end state emerges.',
          },
          body: [
            { kind: 'bullets', items: ['Deliver capability in increments, planning for future improvement', 'Insert new technology when it is sufficiently mature', 'Approach 1: end state known; maturing technology sets each increment', 'Approach 2: end state unknown; technology matched with evolving needs'] },
          ],
          sources: [R('R106', '582'), R('R106', '583')],
          notes: {
            teach: [
              'MITRE defines evolutionary acquisition as an acquisition strategy structured to deliver capability in increments, recognizing up front the need for future capability improvements. Its objective is to balance needs and available capability with resources and to put capability into users’ hands quickly; success depends on phased definition of needs and requirements and on maturing technologies (R106 p.582).',
              'It allows insertion of new technologies when they become sufficiently matured, and capabilities over time (R106 p.583). Then the key distinction: there are two approaches. In the first, the ultimate functionality is defined at the beginning, and the content of each deployable increment is determined by the maturation of key technologies. In the second, the ultimate functionality cannot be defined at the beginning, and each increment is defined by maturing technologies matched with evolving user needs (R106 p.583).',
              'Apply it. AeroLink’s capacity path is the first kind: the end state, enough trips for demand, is known, and maturing charger technology sets each step. Its autonomy path is the second kind: nobody can define today what remotely supervised operation will look like in year eight, so each step is set by what the technology and the operators’ needs allow at the time.',
            ],
            why: 'The two approaches give students a test for their own increments: is my end state defined, or will it emerge? The answer decides how much detail a far-term increment can honestly carry.',
            figure: 'Upper timeline: point at the solid end-state box and the increments filling toward it. Lower timeline: point at the cloud and how it sharpens at each increment. Ask: which of your enterprise’s paths is a cloud?',
            misconceptions: [{ claim: 'A good roadmap defines every increment in detail from the start.', correction: 'MITRE warns against believing all increments can be defined accurately in advance; in the second approach the end state itself emerges.' }],
            transition: 'MITRE also records lessons learned. Five of them are rules you can apply.',
            timing: '4 min: 1 min definition, 1.5 min the two approaches, 1.5 min AeroLink.',
          },
        },
        {
          id: 'w6s1-increment-lessons',
          title: 'Five lessons for planning increments',
          purpose: 'Turn the evolutionary acquisition model into rules of practice, each illustrated on AeroLink.',
          minutes: 4,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Lesson', 'On AeroLink'],
              rows: [
                ['Architecture first', 'Every increment builds on the platform (DEC-002)'],
                ['Expect change', 'Increments 1 to 3 are revised each review'],
                ['Users drive content', 'Operator workload sets the autonomy limit'],
                ['No technology before its time', `Autonomy waits for TRL ${MATURE_TRL} evidence`],
                ['Parallel developments', 'Increments 1 and 2 run in parallel under configuration management'],
              ],
              caption: 'Lessons from MITRE’s evolutionary acquisition article.',
            },
          ],
          sources: [R('R106', '583'), R('R106', '584'), R('R106', '585')],
          notes: {
            teach: [
              'Architecture is key: MITRE calls this the most important lesson. To implement evolutionary acquisition, the architecture of the system must be developed first, and the first delivered increment should include the target system architecture from which later increments build (R106 pp.583–584). For AeroLink, the operations platform with its hot standby, decision DEC-002, is that base: every increment, autonomy included, plugs into it.',
              'Manage expectations: do not believe you can define the content of all increments accurately in advance; change is a normal part of the evolutionary process, not requirements creep (R106 p.584). Understand the users: user requirements should drive the content and priority of increments, as long as users understand the end state (R106 p.584). AeroLink’s operators’ workload, need NEED-013, sets the limit the autonomy increment must respect.',
              `No technology before its time: the principle is to take advantage of emerging technology when it is mature (R106 p.584). Autonomy waits for TRL ${MATURE_TRL} evidence. Think parallel developments: increments often develop in parallel, controlled with configuration management, with time to reintegrate a single “gold” baseline before fielding (R106 pp.584–585).`,
            ],
            why: 'Students remember rules with examples; each AeroLink illustration shows the rule changing a real planning decision.',
            misconceptions: [{ claim: 'Running increments in parallel is always a planning failure.', correction: 'MITRE says parallel development is challenging but should not be avoided; configuration management controls the baselines and a gold baseline is reintegrated before fielding.' }],
            transition: 'The fourth lesson has a risk-management counterpart in the DoD guidebook: deferral and off-ramps.',
            timing: '4 min: about 45 s per lesson, 15 s summary.',
          },
        },
        {
          id: 'w6s1-off-ramps',
          title: 'Deferral and off-ramps as risk control',
          purpose: 'Link increments back to Week 3 risk handling: deferring capability and planning a mature fallback.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-off-ramp',
            caption: 'The planned path relies on a maturing technology; the off-ramp uses mature technology and rejoins the roadmap.',
            alt: 'A timeline from left to right labeled planned technology. At a junction a dashed path branches below, labeled off-ramp: mature technology, and rejoins the timeline further right.',
          },
          body: [
            { kind: 'bullets', items: ['Defer capability to a follow-on increment', 'Limit the number of critical technologies', 'Off-ramp: a contingency to use mature technology', 'Course rule: an increment that inserts an immature technology needs an off-ramp'] },
          ],
          sources: [R('R46', '126')],
          notes: {
            teach: [
              'Return to the Week 3 risk register. After a risk analysis, a program accepts, avoids, transfers or controls a risk. Among the DoD guidebook’s examples of top-level mitigation activities are three that are roadmap decisions: deferring capability to a follow-on increment, limiting the number of critical technologies, and identifying off-ramps, that is, a contingency plan to use mature technology in case a technology is not developed successfully to meet critical performance or schedule (R46 p.126).',
              'Turn that into a rule for your lab, a course convention rather than a DoD requirement, because the guidebook lists off-ramps as an example mitigation: an increment that inserts an immature technology needs an off-ramp. The off-ramp is not a vague “or else”; it names the mature alternative and what the roadmap does with it. If every technology in an increment is mature, an off-ramp is good practice but not required.',
              `On AeroLink: Increment 3 inserts detect-and-avoid at an assumed TRL ${t3.trl}; its off-ramp is ${inc3.offRamp.charAt(0).toLowerCase()}${inc3.offRamp.slice(1)} Increment 1 inserts a qualified storage product, yet keeps an off-ramp for a different reason, an integration unknown (${inc1.trigger[0].match(/U-\d{3}/)![0]}): keep the staggered-recharge contingency of R-011. The committed Year-2 step has one too, from its decision record: if the utility refuses the spoke, a new hub vertiport instead.`,
            ],
            why: 'The off-ramp turns an exciting but immature technology from a single point of failure in the roadmap into a planned option.',
            figure: 'Follow the planned path, stop at the junction, then trace the dashed off-ramp below and where it rejoins. Ask: what is the mature technology on the off-ramp for autonomy? The piloted operation we already have.',
            misconceptions: [{ claim: 'An off-ramp means the increment has failed.', correction: 'An off-ramp is planned in advance so that a technology that does not mature delays a capability without stopping the roadmap. Taking it is a decision, not a failure.' }],
            transition: 'Increments need content, and the content comes from a technology plan resting on maturity evidence.',
            timing: '3 min: 1 min the DoD list, 1 min the lab rule, 1 min AeroLink.',
          },
        },
      ],
    },
    // ============================================================================================ D. technology plan (20 min)
    {
      id: 'w6s1-technology',
      title: 'The technology plan and maturity evidence',
      slides: [
        {
          id: 'w6s1-technology-planning',
          title: 'What technology planning is',
          purpose: 'Define the central method of the week and its relation to gaps and evaluations.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-planning-loop',
            caption: 'Mission objectives and gaps drive the technology plan; technology evaluations inform it.',
            alt: 'Three boxes. On the left, objectives and gaps, with an arrow labeled drives pointing to the box below, technology plan. On the right, technology evaluations, with an arrow labeled informs pointing to the same box.',
          },
          body: [
            { kind: 'definition', term: 'Technology planning', text: 'The process of planning the technical evolution of a program or system to achieve its future vision or end-state', source: R('R105', '528') },
            { kind: 'bullets', items: ['Needs and gaps drive the technology needs', 'Technology evaluations inform the plan', 'The plan is the roadmap for closing the gaps'] },
          ],
          sources: [R('R105', '528'), R('R105', '529')],
          notes: {
            teach: [
              'MITRE’s definition: technology planning is the process of planning the technical evolution of a program or system to achieve its future vision or end-state (R105 p.528). It may include desired customer outcomes, technology forecasting and schedule projections, technology maturation requirements and planning, and technology insertion points; the goal is a defined technical end-state enabled by technology insertion over time (R105 p.528).',
              'The plan sits between two domains. Business or mission needs and gaps drive the technology needs; technology evaluations inform the planning activity; and the resulting technology plan serves as the roadmap for satisfying the gaps over time to achieve the end-state (R105 p.529). Notice the direction: needs first, technology second. A technology plan that starts from a technology catalogue has the arrows backwards.',
              'Your Week 3 readiness assessment is the technology evaluation in that picture, and your Week 1 and 2 needs with today’s gaps are the drivers.',
            ],
            why: 'The definition and the two arrows tell students where each of their earlier artifacts enters the plan, and that the gaps lead.',
            figure: 'Point at the left box, mission objectives and gaps, and its arrow labeled drives; then the right box, technology evaluations, and its arrow labeled informs; both meet at the technology plan in the middle.',
            misconceptions: [{ claim: 'Technology planning means choosing the newest technologies.', correction: 'MITRE has needs and gaps drive the technology needs. Evaluations inform the plan; they do not set its goal.' }],
            transition: 'What does a technology plan contain? MITRE gives a minimum.',
            timing: '3 min: 1 min definition, 1.5 min drives and informs, 30 s the course link.',
          },
        },
        {
          id: 'w6s1-plan-contents',
          title: 'The contents of a technology plan',
          purpose: 'Give students the checklist they apply in the lab, with the categories and the immaturity rule.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-plan-columns',
            caption: 'Three columns for every technology brought to bear, and a fourth for its insertion point.',
            alt: 'A table outline with three columns, available now, in development and not yet existing, and a fourth column, insertion point. Each row has a dot in one category column and an arrow to a diamond labeled INC.',
          },
          body: [
            { kind: 'bullets', items: ['A plan lists every technology brought to bear', 'Is each available now, in development, or not yet existing?', 'Those in development are listed with their maturity levels', 'Insertion point: the increment that brings it in', 'Immature technologies carry a risk and a mitigation'] },
          ],
          sources: [R('R105', '529'), R('R105', '530')],
          notes: {
            teach: [
              'A technology plan defines a desired technical end-state. Because that end-state may not be achievable with current technology, MITRE says it is important to determine which technologies are available now, which are in development, including their maturity levels, and which do not yet exist (R105 p.529). That three-way split is the first column set of your lab table.',
              'Technologies requiring further investment and maturation should be assessed in the planning process; appropriate risk should be assigned to technologies assessed as immature, with mitigation plans; and technologies in research and development for over five years should be assessed for their maturation trend (R105 p.530). In the lab: immature technologies carry a risk and a mitigation, or the row is incomplete.',
              'Then the minimum: at a minimum the plan should identify all technology being brought to bear, the maturation and trend of applicable technologies, the insertion points, the required investments and the dependencies (R105 p.530). The plan should be a “living” document, the basis of an ongoing dialog between the customer and the developers (R105 p.529). For each row the insertion point is the increment that brings it in, or a stated reason it is not inserted.',
            ],
            why: 'This is the checklist the lab tool applies to every technology row, so students who learn it here know what their rows need before they open the tool.',
            figure: 'Read the three column heads, available now, in development, not yet existing, then the fourth column, insertion point, and the arrow from a row to an increment marker. Say: every row ends in an increment or a reason.',
            misconceptions: [{ claim: 'A technology that does not exist yet does not belong in the plan.', correction: 'MITRE puts it in the plan precisely so that requirements that are not achievable, or too costly, are seen early and an investment decision can be made.' }],
            transition: 'How is the plan formed? MITRE lists the practice steps.',
            timing: '4 min: 1.5 min the three categories, 1 min immaturity, 1.5 min the minimum contents.',
          },
        },
        {
          id: 'w6s1-practice-steps',
          title: 'Forming the roadmap: the practice steps',
          purpose: 'Show the procedure, backward from the end state, with measurable feedback and periodic review.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-backward-plan',
            caption: 'Define the end state within the horizon, then plan backward to today, with feedback points to measure progress.',
            alt: 'A long arrow pointing left, from a box labeled end state, year 5–10, back to a box labeled today. Along it four numbered markers, counted back from the end state: 1 core technologies, 2 feedback measures, 3 insertion points, 4 review.',
          },
          body: [
            { kind: 'bullets', items: ['Define results within a horizon, usually 5–10 years, then work back', 'Core technologies first; assess their maturation risk', 'Set a quantifiable feedback system', 'Form the roadmap: phasing, insertion points, investments', 'Review it annually or at an agreed period'] },
          ],
          sources: [R('R105', '530'), R('R105', '531')],
          notes: {
            teach: [
              'MITRE lists the activities of developing and implementing a technology plan (R105 pp.530–531). Evaluate the environment: what is changing that must be taken into account or can be exploited, and where industry is headed. Define desired results: where the organization wants to be within a planning horizon, usually 5–10 years; envision the future as if it were today, then work back to the present.',
              'Identify the core technologies needed for the vision and focus on those first; assess their maturation risks and focus investment and mitigation there. Identify the remaining technologies, but do not become enamored with technology for its own sake. Establish a quantifiable feedback system to measure progress, with measures of success, and adjust the plan accordingly. Assess the current state of the organization implementing the plan: resources, processes, skills.',
              'Then develop tactical plans with measurable goals and form the roadmap: the phasing, insertion points, associated investments, work packages, and the sequence of activities. Assess life-cycle costs; communicate the plan in the users’ operational terms; implement and monitor it; and review it annually or at another agreed period (R105 pp.530–531). In your lab, the feedback system becomes the triggers, and the review becomes the Week 7 baseline review.',
            ],
            why: 'Planning backward from an end state stops a roadmap from being an extrapolation of this year’s projects, and the feedback system is what makes triggers measurable.',
            figure: 'Start at the right, the end state, then follow the arrow back toward today and read the four markers: core technologies, feedback measures, insertion points, review.',
            misconceptions: [{ claim: 'A roadmap is planned forward, one year at a time.', correction: 'MITRE’s practice defines the desired results first and works back to the present; forward planning tends to extend current projects rather than reach an end state.' }],
            transition: 'Every step leans on maturity evidence. What can a TRL tell us, and what can it not?',
            timing: '4 min: 1 min environment and results, 1.5 min core technologies and feedback, 1.5 min forming and review.',
          },
        },
        {
          id: 'w6s1-maturity-limits',
          title: 'What maturity evidence can and cannot tell you',
          purpose: 'Connect the Week 3 readiness assessment to insertion decisions honestly, with the limits of TRL.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-trl-ladder',
            caption: 'TRL climbs from laboratory to operation; it does not rate how well a technology fits the architecture absorbing it.',
            alt: `A ladder of nine rungs numbered 1 to 9, grouped as laboratory (1 to 4), relevant environment (5 and 6) and operational (7 to 9). A line at rung ${MATURE_TRL} is labeled DoD threshold practice. Beside the ladder, a separate gauge labeled architecture fit is marked not rated by TRL.`,
          },
          body: [
            { kind: 'bullets', items: ['TRL rates development and testing, from lab to operation', 'Agree what “relevant environment” means', 'TRL does not rate fit with the architecture', 'Integration and system readiness are separate measures', 'Every TRL rests on evidence or a labeled assumption'] },
          ],
          sources: [R('R60', '525'), R('R60', '526'), R('R16', '767'), R('R16', '768')],
          notes: {
            teach: [
              'Recall Week 3. The TRL scale rates a technology by the development completed, prototyping and testing across a range of environments, from the laboratory to operationally relevant. MITRE insists that stakeholders reach a common, detailed understanding of terms like “relevant environment”, interpreted in the context of the system under development (R60 p.525). The nine levels you used came from SEBoK’s table after Mankins (R16 p.767).',
              'Now the limits that matter for a roadmap. One factor the TRL scale does not address is how well the technology fits into the architecture and system structure of the program absorbing it; that is an integral part of the systems engineering job and critical to the technology transition (R60 p.525). SEBoK adds that integration readiness levels address interface maturity, and system readiness levels combine individual TRLs with their integration points (R16 p.768). Neither scale is in our collection, so we name them and do not invent one.',
              `And a practice line: DoD programs assess threshold capabilities for maturity, and those met with immature technology, a TRL below six, are not considered threshold (R60 p.526). The course uses ${MATURE_TRL} as the line below which an insertion needs an off-ramp. Every TRL in your record rests on evidence or a labeled assumption, as in Week 3; AeroLink’s all rest on assumptions, because the course holds no supplier data.`,
            ],
            why: 'A TRL is the most common number on a technology roadmap and the most over-trusted; the limits stop students from treating a high TRL as proof that an insertion will work.',
            figure: `Climb the ladder from 1 to 9 and read the three bands. Point at the line at ${MATURE_TRL}, the DoD threshold practice. Then point at the separate gauge, architecture fit: the ladder says nothing about it.`,
            misconceptions: [{ claim: 'A technology at TRL 8 can be inserted anywhere.', correction: 'TRL rates the technology, not its fit with the architecture absorbing it (MITRE). A qualified product can still fail to integrate with your chargers, grid connection or interfaces.' }],
            transition: 'Now apply all of this to AeroLink, and you do it first.',
            timing: '4 min: 1 min what TRL rates, 2 min what it does not, 1 min the threshold and the evidence rule.',
          },
        },
        {
          id: 'w6s1-technology-exercise',
          title: 'Your turn: classify AeroLink’s technology candidates',
          purpose: 'Retrieval and application before the reveal: students place each candidate in the plan.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-technology-exercise',
            caption: 'Five candidates with their status, TRL and insertion point left blank for you to fill. (FICTIONAL)',
            alt: 'A table with four columns, candidate, status, TRL and insertion, and five rows: high-power charging, battery cells, detect-and-avoid, on-site storage and 15-min charger. The status, TRL and insertion columns are blank in every row.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Pairs, 90 seconds', text: 'Use the Week 3 TRLs from your handout.' },
            { kind: 'bullets', items: ['For each: available now, in development, or not yet existing?', 'Which increment, if any, inserts it?'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Give pairs ninety seconds. They have the Week 3 readiness table on the handout: high-power charging at an assumed TRL 6, battery cells at 5, detect-and-avoid at 4. Two candidates are new: on-site energy storage at the hubs, the evaluation Week 3 promised for the grid-outage risk, and the faster charger of the Week 5 change request.',
              'Ask for each row: which category, and which increment would insert it, if any? Collect one answer per row aloud without judging. Expect two errors: the faster charger placed in the near term because it is “an upgrade”, and storage marked mature without a word about integration. Do not correct yet; the next slide does.',
            ],
            why: 'Students who commit to a placement before seeing the instructor’s table notice their own reasoning errors, which is what makes the reveal stick.',
            figure: 'Point at the five rows and the three blank columns. Nothing is filled in on purpose.',
            misconceptions: [{ claim: 'An upgrade of a technology we already use can always go in the next increment.', correction: 'An upgrade still needs maturity evidence, a way to insert it and an operational reason now. The reveal shows one that fails the third test.' }],
            transition: 'Now the instructor’s table, row by row.',
            timing: '2 min: 90 s pairs, 30 s answers aloud.',
          },
        },
        {
          id: 'w6s1-technology-table',
          title: 'Worked example: AeroLink’s technology plan',
          purpose: 'Reveal and justify the AeroLink technology table: category, TRL basis, insertion point or reason.',
          minutes: 3,
          layout: 'worked-example',
          figure: {
            id: 'w6s1-technology-table',
            caption: 'AeroLink’s technology plan: status, assumed TRL and insertion point for each candidate. (FICTIONAL; TRLs are assumptions)',
            alt: `A table with the columns technology, status, TRL and insertion point. High-power charging: available now, ${t1.trl} assumed, Year-2 step (baseline). Battery cells: in development, ${t2.trl} assumed, in service (baseline). Detect-and-avoid: in development, ${t3.trl} assumed, Increment 3. On-site storage: available now, ${t4.trl} assumed, Increment 1. 15-min charger: does not yet exist, none, not inserted.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Charging', text: `Available, TRL ${t1.trl} assumed: the committed Year-2 step` },
                { label: 'Cells', text: `TRL ${t2.trl}, already in service: risk tracked` },
                { label: 'Autonomy', text: `TRL ${t3.trl}: Increment 3, with an off-ramp` },
                { label: 'Storage', text: 'Product mature, integration unproven: Increment 1' },
                { label: '15-min charger', text: 'No evidence; adds no trips now: not inserted' },
              ],
            },
          ],
          sources: [R('R105', '529'), R('R105', '530'), R('R60', '525')],
          notes: {
            teach: [
              'Walk the table row by row and compare with the pairs’ answers. Each row needs a category, a maturity level with its basis, and an insertion point or a reason it is not inserted, the three things the plan contents slide asked for.',
              'Two rows teach most. Storage is a qualified product, but TRL rates the product, not its fit with the high-power chargers and the grid connection; that integration is an unknown the increment must close first. The faster charger fails a different test: even if it existed, it would buy nothing now.',
            ],
            workedSolution: [
              `${t1.name} (${t1.id}): available now, TRL ${t1.trl} resting on assumption ${t1.basis.split(':')[0]}; inserted by the committed Year-2 step inside the baseline trajectory (${t1.insertion}), whose condition is the supplier test report that would turn the assumption into evidence. Risk ${t1.risk}.`,
              `${t2.name} (${t2.id}): TRL ${t2.trl}, below ${MATURE_TRL}, yet already in service at the baseline; that is why Week 3 carries the maturity risk ${t2.risk}. The roadmap does not insert it again; pack replacement follows the measured fade.`,
              `${t3.name} (${t3.id}): in development at TRL ${t3.trl}; insertion point ${t3.insertion}, entered only on TRL ${MATURE_TRL} evidence, with the off-ramp “stay piloted”. Risk ${t3.risk}.`,
              `${t4.name} (${t4.id}, proposed): available, TRL ${t4.trl} on the proposed assumption A-009; insertion point ${t4.insertion}. ${Cap(t4.insertability.why)}; the unknown U-009 gates the increment.`,
              `${t5.name} (${t5.id}, proposed): no evidence held, so treated as not yet existing; not inserted, because it ${t5.notInserted}. The network is ${FASTER_CHARGE.binding}-limited, so the charge time sets turnaround margin, not trips.`,
            ],
            why: 'The reveal shows each rule of the plan applied to real rows, so students see a mature product fail on integration and an available upgrade fail on timing before they meet the same choices in their own table.',
            figure: 'Read each row left to right: name, status, assumed TRL, insertion point. Point at the storage row’s TRL and say “product, not integration”, then at the last row’s “not inserted”.',
            misconceptions: [{ claim: 'Every technology in the plan must be scheduled into an increment.', correction: 'The plan can record a reason not to insert. A technology that adds nothing while another limit binds stays on the watch list until the limit moves.' }],
            transition: 'Some of what gates these increments is not a technology at all, but information we do not have yet.',
            timing: '3 min: about 35 s per row.',
          },
        },
      ],
    },
    // ============================================================================================ E. known unknowns (7 min)
    {
      id: 'w6s1-unknowns',
      title: 'Known unknowns',
      slides: [
        {
          id: 'w6s1-known-unknowns',
          title: 'Known unknowns: a managed input to the roadmap',
          purpose: 'Make what we do not know a managed input: TBD and TBR, TBX management, and the course record fields.',
          minutes: 4,
          layout: 'figure',
          figure: {
            id: 'w6s1-unknowns-record',
            caption: 'Two AeroLink known unknowns in the course record, each gating an increment. (FICTIONAL)',
            alt: `A record with five columns: unknown, impact, information needed, mitigation and gates. Row one: ${u9.id} storage fit (${u9.tbx}); outage service not assured; a one-hub demonstration; keep staggered recharge; Increment 1. Row two: ${u4.id} flights per operator; autonomy cannot be scheduled; a workload analysis; collect the evidence first; Increment 3.`,
          },
          body: [
            { kind: 'bullets', items: ['A TBD has no value yet; a TBR has a value held with low confidence', 'TBX management names the work, the owner and the closure', 'Each known unknown: impact, information needed and mitigation', 'Each record names the increment it gates'] },
          ],
          sources: [R('R13', '565')],
          notes: {
            teach: [
              'SEBoK’s requirements article gives the vocabulary. When a value is unknown, a requirement carries “To Be Determined”, a TBD, in place of the value; when a value is set but confidence is low, it carries “To Be Resolved”, a TBR; together they are TBXs. Tracking TBXs shows the maturity of the requirement set, and TBXs can lead to risk if they are not addressed before significant design work (R13 p.565).',
              'TBX management identifies the TBXs, establishes the work needed to resolve each, identifies the owner of that work, and iterates until the placeholders can be removed (R13 p.565). The course’s known-unknowns record, a convention, adds three fields that make an unknown usable in a roadmap: its impact if it comes out badly, the information needed to close it, and the mitigation while it stays open; and it names the increment it gates.',
              `On AeroLink, two rows. ${u9.id}, ${u9.name.charAt(0).toLowerCase()}${u9.name.slice(1)} (${u9.tbx}): if it comes out badly, ${u9.impact}; the information needed is ${u9.need}; meanwhile ${u9.mitigation}. It gates Increment 1. ${u4.id}, ${u4.name.toLowerCase()} (${u4.tbx}): ${u4.impact}; it gates Increment 3, and Increment 2 collects the evidence. AeroLink’s record has ${KNOWN_UNKNOWNS.length} entries; your team needs at least ${MIN.unknowns}.`,
            ],
            why: 'Unknowns hidden in prose silently delay increments; recorded with an owner and the increment they gate, they become part of the plan’s critical path and can be closed on purpose.',
            figure: 'Read the column heads left to right, then each row across, ending at the gates column. Point at the two increment numbers: the unknowns are what those increments wait for.',
            misconceptions: [{ claim: 'Unknowns should be left out of a roadmap until they are resolved.', correction: 'SEBoK tracks TBXs precisely because unresolved ones lead to risk. Recording them with their impact and owner is how they get resolved before the increment needs them.' }],
            transition: 'Now practise placing changes on the horizons, with the evidence or unknown that sets each.',
            timing: '4 min: 1 min TBD and TBR, 1 min TBX management, 2 min the AeroLink record.',
          },
        },
        {
          id: 'w6s1-think-pair',
          title: 'Think, pair, share: place six AeroLink changes on the horizons',
          purpose: 'Retrieval and application before Session 2, whose worked roadmap answers it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s1-horizon-board',
            caption: 'Three horizon lanes and six change cards, not yet placed: Session 2 places them with reasons. (FICTIONAL)',
            alt: 'Three empty lanes labeled near term, mid term and far term across the top. Below, six unplaced cards: on-site storage, integrated ticketing, charger leasing, predictive maintenance, demand re-forecast and autonomy.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Pairs, two minutes', text: 'Place each card, then name what sets it.' },
            { kind: 'bullets', items: ['Place six AeroLink changes on near, mid or far', 'For each, name the evidence or the unknown that sets it'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Pairs place six cards on near, mid or far: on-site storage at the hubs, integrated ticketing, overnight charger leasing, predictive maintenance used for planning, the quarterly demand re-forecast, and autonomous operations. Each placement must name the evidence or the unknown that sets it, not a preference.',
              'Take two or three placements aloud, especially any disagreement about ticketing or autonomy. Do not give the answer: Session 2 builds AeroLink’s roadmap and places all six. Say: bring your placements; we will see whose reasons hold.',
              'While pairs work, listen for the reasons, not the lanes. A good reason names a gap and its horizon, a maturity level, a partner’s agreement or an unknown with its owner; a weak reason is a preference or a date. If a pair is stuck, ask which card depends on another card: the charger leasing needs the chargers, and autonomy needs evidence that only operation can produce.',
            ],
            why: 'Placing changes with a stated reason rehearses the core move of the lab, and leaving the answer to Session 2 gives the worked example a question to answer.',
            figure: 'Point at the three empty lanes, then the six cards waiting below. None is placed on purpose.',
            misconceptions: [{ claim: 'The re-forecast is not a change, so it does not belong on a roadmap.', correction: 'A recurring piece of evidence can be the trigger that moves an increment; Session 2 shows the re-forecast starting a capacity step.' }],
            transition: 'To close, one minute on your own enterprise.',
            timing: '3 min: 2 min pairs, 1 min placements aloud.',
          },
        },
      ],
    },
    // ============================================================================================ exit (3 min)
    {
      id: 'w6s1-close',
      title: 'Exit',
      slides: [
        {
          id: 'w6s1-exit',
          title: 'Exit: one change you would not make yet; preparation for Session 2',
          purpose: 'Retrieval of the session and preparation for the roadmap work of Session 2.',
          minutes: 3,
          layout: 'two-column',
          body: [{ kind: 'callout', tone: 'key', title: 'One-minute paper', text: 'Name one change to your enterprise you would not make in the near term, and the evidence that would change your mind.' }],
          aside: [{ kind: 'bullets', items: ['Before Session 2 (about 20 min):', 'Each member brings one candidate change', 'with its gap, and the maturity or unknown that sets its timing'] }],
          sources: [],
          notes: {
            teach: [
              'Run the one-minute paper: one change to the team’s own enterprise that you would not make in the near term, and the evidence that would change your mind. Collect the cards, or a photo on the LMS; read three aloud at the start of Session 2.',
              'Set the preparation: each member brings one candidate change for the team’s enterprise, the gap it would close, and the technology maturity or the unknown that decides when it could happen. About twenty minutes. It is the raw material for the lab start in Session 2.',
            ],
            why: 'The paper shows the instructor whether “evidence, not preference” landed, and the candidate changes give every team member something to contribute to the in-class lab start.',
            transition: 'End of Session 1; references follow.',
            timing: '3 min: 2 min the paper, 1 min the preparation.',
          },
        },
        {
          id: 'w6s1-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while students write. The list is generated from every citation in the session and includes SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the exit.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w6-lesson-why',
      title: 'Why this week: from what is to what comes next',
      sources: [R('R39t', '1445'), R('R109', '131'), R('R12', '860')],
      blocks: [
        { kind: 'para', text: 'Weeks 1 to 5 described your enterprise as it enters service: why it exists and whom it serves, what it must do, which option it chose, how it is organized and what passes between its parts. Week 6 asks the question every operating enterprise faces next: how will it change, in what order, and on what evidence? The answer is an **enterprise evolution roadmap**: increments of change with the technology they insert and the way the service keeps running while it changes, together with the unknowns that gate them. It closes the content weeks of Phase I; Week 7 integrates all six weeks into the Systems Thinking Engineering Package.' },
        { kind: 'para', text: 'Evolution is not an afterthought. The definition of architecture used in Week 4 speaks of fundamental concepts or properties of a system embodied in its elements, relationships, and in the principles of its design and evolution (R39t p.1445). MITRE says the same of enterprise architecture: it relates to the structure of components, their relationships, and the principles guiding the design and evolution of the entity they describe (R109 p.131). Planning evolution is architecture work.' },
        { kind: 'figure', slide: 'w6s1-driving-question' },
        { kind: 'para', text: 'The driving question of the week comes from AeroLink’s board. The Year-2 decision is made; should the next step be autonomous operations, more capacity or integrated ticketing, and in what order? Keep your own answer in mind. Session 2 answers it from the evidence, and the answer depends less on which change is most attractive than on which gap it closes, how mature its technology is, and what it waits for.' },
        { kind: 'figure', slide: 'w6s1-where' },
      ],
    },
    {
      id: 'w6-lesson-gaps',
      title: 'Capability evolution: gaps and excesses over horizons',
      sources: [R('R12', '860'), R('R12', '861'), R('R12', '862')],
      blocks: [
        { kind: 'para', text: `SEBoK distinguishes three kinds of capability: organizational, system and operational (R12 p.860). The roadmap is about operational capability, what the enterprise can deliver in operation. The enterprise has a current and planned **baseline** capability; capability management aims to “vector” the enterprise away from this baseline trajectory toward a position that better meets its strategic goals, within its resource constraints and other limits (R12 p.860). The baseline includes changes already decided: for AeroLink the Week 3 decision is part of it, so the trajectory reaches ${YEAR2.capacity} trips a day by month ${YEAR2.month}.` },
        { kind: 'figure', slide: 'w6s1-capability-trajectory' },
        { kind: 'para', text: 'Stakeholders have **operational needs**, expressions of something desirable in direct support of the enterprise’s end-user activities, and the enterprise has **enterprise needs**, which support its internal activities and the enabling assets that let the mission be accomplished (R12 p.861). Capabilities exist to meet these needs. The desired levels of capability, based on the needs assessment, are compared with the baseline to determine the **capability gaps**; the same comparison finds points of **excess capability**. Gaps should be filled and excesses eliminated (R12 p.862).' },
        { kind: 'para', text: 'The projected gaps and excesses are mapped into future timeframes to see the relative timing and intensity of change. Near-, mid- and far-term buckets are typical; for long-lasting capabilities they might be five, ten and twenty years out, and for fast-changing ones, such as consumer products, shorter, for example one, two and three years (R12 p.862). Choose bucket lengths that fit how fast your enterprise changes, and say why.' },
        { kind: 'figure', slide: 'w6s1-gaps' },
        {
          kind: 'table',
          header: ['Entry', 'Horizon', 'Capability', 'Desired', 'Baseline trajectory', 'From'],
          rows: GAPS.map((g) => [`${g.id} (${g.kind}${g.size ? `: ${g.size}` : ''})`, AEROLINK_HORIZONS.find((h) => h.id === g.horizon)!.label, g.capability, g.desired, g.baseline, g.sources.join(', ')]),
          caption: `AeroLink’s gaps and excesses against the baseline trajectory (FICTIONAL; GAP-001 rests on the Week 2 objective, the others are proposed). Horizons: near ${near.length}, mid ${mid.length}, far ${far.length} (proposed).`,
        },
        { kind: 'para', text: `Measure against the trajectory, not the snapshot. ${REQUIRED_CAPACITY} trips a day are needed by month ${YEAR2.month} and the trajectory gives ${YEAR2.capacity} trips a day: no near-term gap, but an **excess** of ${C.capacityExcess}, capability above the desired level. An excess is a candidate for divestment; this one is kept, because +${FLEET_STEP.smallest.added} aircraft was the smallest Week 3 fleet step that meets ${REQUIRED_CAPACITY}. Against the entry snapshot (${BASELINE.capacity}) the row would wrongly show a gap of ${C.snapshotGap}. Slack on a limit that does not bind is not an excess: the chargers’ ${YEAR2.chargerLimit} daily charges against the fleet’s ${YEAR2.capacity} trips keep them from binding.` },
      ],
    },
    {
      id: 'w6-lesson-portfolio',
      title: 'From gaps to a plan of changes',
      sources: [R('R12', '862'), R('R12', '863'), R('R109', '131'), R('R109', '132'), R('R62', '345')],
      blocks: [
        { kind: 'para', text: 'Enterprise architecture analysis turns gaps into candidate changes. A baseline architecture shows what the enterprise has and where current plans lead; the needs and gaps show where elements must be **added, dropped or changed**; each modification brings benefits to some stakeholders, along with costs and risks (R12 p.862). The opportunities that result usually require investment, and some are divestments. They can be assessed one by one, but they usually have dependencies with each other, with current operations and with partners, so they are assessed as a **portfolio**, typically each with a business case (R12 p.862).' },
        { kind: 'figure', slide: 'w6s1-gaps-to-changes' },
        { kind: 'para', text: 'The assessed opportunities are laid out in an **enterprise plan**, which usually goes out to a long horizon, typically more than a decade, and must align with strategic goals and leadership priorities. The planned changes carry performance targets that are monitored, and the plan is adjusted for unforeseen circumstances. Changes should be managed so that current operations are not adversely affected where possible; SEBoK lists seven lenses for change management: strategic objectives, stakeholders, processes, performance metrics, current state alignment, resources and maturity assessment (R12 p.863).' },
        { kind: 'para', text: 'MITRE gives the structure in one sentence: an enterprise architecture consists of snapshots of the current environment and of the target environment, and a capital investment roadmap for moving from the “as is” to the “to be” (R109 pp.131–132). Views of “as is” and “to be” architectures help stakeholders understand migration paths and transitions, and architectures can be used to assess different evolutionary paths (R62 p.345). Your Week 4 and Week 5 views are the as-is snapshot; the roadmap describes the to-be in each horizon and the path you chose between them.' },
        { kind: 'figure', slide: 'w6s1-as-is-to-be' },
      ],
    },
    {
      id: 'w6-lesson-increments',
      title: 'Delivering change in increments',
      sources: [R('R108', '391'), R('R108', '392'), R('R108', '393'), R('R106', '582'), R('R106', '583'), R('R106', '584'), R('R106', '585'), R('R46', '126')],
      blocks: [
        { kind: 'para', text: 'SEBoK describes a variety of **development approaches** with combinations of features, including sequential, incremental and evolutionary; the groups overlap, and the classification rests on how well the requirements are known, whether there are increments, and what they are used for (R108 p.391). Sequential approaches fit manageable projects in familiar domains (R108 p.392). Incremental approaches develop increments of increasing capability, the last meeting all requirements, with a focus on technical risk and room for emerging technologies; evolutionary approaches start from a limited set of requirements, each cycle adding stakeholder value and understanding (R108 p.393).' },
        { kind: 'callout', tone: 'caution', title: 'A limit worth knowing', text: 'SEBoK notes that these adjectives apply only to the development stage, not to the life cycle as a whole (R108 p.391). Your roadmap evolves an operating enterprise; each increment on it may still be developed sequentially, incrementally or evolutionarily. For each increment, say which development approach fits, and why.' },
        { kind: 'figure', slide: 'w6s1-development-approaches' },
        { kind: 'para', text: 'MITRE’s **evolutionary acquisition** is a strategy structured to deliver capability in increments, recognizing up front the need for future improvements (R106 p.582). It allows new technologies to be inserted when they become sufficiently mature. There are two approaches: in the first the ultimate functionality is defined at the start and maturing technologies set the content of each increment; in the second it cannot be defined at the start, and each increment is set by maturing technologies matched with evolving user needs (R106 p.583).' },
        { kind: 'figure', slide: 'w6s1-evolutionary-acquisition' },
        { kind: 'para', text: 'MITRE’s lessons learned give five planning rules (R106 pp.583–585). **Architecture is key**: develop the architecture first; the first increment should include the target architecture later increments build on. **Manage expectations**: do not believe you can define every increment accurately in advance; change is normal. **Understand the users**: user requirements drive the content and priority of increments, provided users understand the end state. **No technology before its time**: use emerging technology when it is mature. **Think parallel developments**: control parallel increments with configuration management and reintegrate a single baseline before fielding.' },
        { kind: 'slide-ref', slide: 'w6s1-increment-lessons', text: 'The five lessons with an AeroLink illustration each' },
        { kind: 'para', text: 'The DoD guidebook adds the risk-control view. Among its examples of top-level mitigation activities are deferring capability to a follow-on increment, limiting the number of critical technologies, and identifying **off-ramps**: a contingency plan to use mature technology in case a technology is not developed successfully (R46 p.126). The course turns this into a rule, a course convention rather than a DoD requirement: an increment that inserts an immature technology needs an off-ramp; elsewhere one is good practice.' },
        { kind: 'figure', slide: 'w6s1-off-ramps' },
      ],
    },
    {
      id: 'w6-lesson-technology',
      title: 'The technology plan, and what maturity evidence can tell',
      sources: [R('R105', '528'), R('R105', '529'), R('R105', '530'), R('R105', '531'), R('R60', '525'), R('R60', '526'), R('R16', '767'), R('R16', '768')],
      blocks: [
        { kind: 'definition', term: 'Technology planning', text: 'The process of planning the technical evolution of a program or system to achieve its future vision or end-state', source: R('R105', '528') },
        { kind: 'para', text: 'Technology planning may include desired outcomes, technology forecasting and schedule projections, maturation requirements and insertion points; its goal is a defined technical end-state enabled by technology insertion over time (R105 p.528). Business or mission needs and gaps **drive** the technology needs, technology evaluations **inform** the planning, and the resulting plan serves as the roadmap for satisfying the gaps over time (R105 p.529). The plan is a “living” document (R105 p.529).' },
        { kind: 'figure', slide: 'w6s1-technology-planning' },
        { kind: 'para', text: 'A plan determines which technologies are **available now**, which are **in development**, with their maturity levels, and which **do not yet exist** (R105 p.529). Technologies requiring further investment and maturation are assessed; appropriate risk is assigned to immature technologies, with mitigation plans (R105 p.530). At a minimum the plan identifies every technology brought to bear, the maturation and trend of each, the **insertion points**, the required investments and the dependencies (R105 p.530). In the course record each technology ends in an insertion point, the increment that brings it in, or in a stated reason it is not inserted.' },
        { kind: 'figure', slide: 'w6s1-plan-contents' },
        { kind: 'para', text: 'MITRE’s practice forms the roadmap backward from an end state: define the desired results within a planning horizon, usually 5–10 years, then work back to the present; identify the core technologies first and assess their maturation risk; establish a quantifiable feedback system to measure progress; assess the current state of the organization; develop tactical plans; form the roadmap from the phasing, insertion points, investments and sequence of activities; assess life-cycle costs; communicate the plan in the users’ terms; implement it; and review it annually or at an agreed period (R105 pp.530–531).' },
        { kind: 'figure', slide: 'w6s1-practice-steps' },
        { kind: 'heading', text: 'What a TRL can and cannot tell you' },
        { kind: 'para', text: 'The TRL scale rates a technology by the development completed, prototyping and testing across environments from the laboratory to operationally relevant, and stakeholders need a common, detailed understanding of terms such as “relevant environment” (R60 p.525). One factor it does not address is how well the technology fits the architecture and system structure absorbing it, which is a systems engineering task critical to the technology transition (R60 p.525). Integration readiness levels address interface maturity and system readiness levels combine TRLs with integration points (R16 p.768); neither scale is in the course collection. DoD programs do not treat threshold capabilities met with immature technology, a TRL below six, as threshold (R60 p.526). Every TRL rests on evidence or a labeled assumption, as in Week 3; the TRL wording is SEBoK’s table (R16 p.767).' },
        { kind: 'figure', slide: 'w6s1-maturity-limits' },
        { kind: 'heading', text: 'AeroLink’s technology plan, worked' },
        { kind: 'figure', slide: 'w6s1-technology-table' },
        {
          kind: 'table',
          header: ['Technology', 'Status', 'TRL and basis', 'Insertion point', 'Maturity · insertability · timing'],
          rows: [t1, t2, t3, t4, t5].map((t) => [`${t.id} ${t.name}`, t.status === 'available' ? 'available now' : t.status === 'in-development' ? 'in development' : 'does not yet exist', t.trl === null ? `none: ${t.basis}` : `TRL ${t.trl}: ${t.basis}`, t.insertion ? (t.insertion === 'INC-000' ? (t.committed ? 'the committed Year-2 step (INC-000)' : 'in service at the baseline') : t.insertion) : `not inserted: ${t.notInserted}`, `${t.maturity.ok ? 'yes' : 'no'} (${t.maturity.why}) · ${t.insertability.ok ? 'yes' : 'no'} (${t.insertability.why}) · ${t.timing.ok ? 'yes' : 'no'} (${t.timing.why})`]),
          caption: 'The AeroLink technology plan (FICTIONAL; every TRL is an assumption, because the course holds no supplier or test data; TECH-004 and TECH-005 are proposed).',
        },
        { kind: 'para', text: `Read the last column with the insertion rule of Session 2 in mind: a technology is ready to insert only when its maturity, the ability to insert it, and the operational timing all hold. Only high-power charging passes all three now. Storage is a mature product whose fit with the chargers is unproven; detect-and-avoid is immature; and the faster charger would buy no trips, because on the baseline trajectory the network is ${FASTER_CHARGE.binding}-limited.` },
      ],
    },
    {
      id: 'w6-lesson-unknowns',
      title: 'Known unknowns',
      sources: [R('R13', '565')],
      blocks: [
        { kind: 'para', text: 'When a value is unknown, a requirement carries a “To Be Determined” (TBD) in its place; when a value is set but held with low confidence, a “To Be Resolved” (TBR); together these are TBXs. Tracking them shows how mature a requirement set is, and TBXs can lead to risk if they are not addressed before significant design work. TBX management identifies them, establishes the work needed to resolve each, identifies the owner of that work, and iterates until the placeholders can be removed (R13 p.565).' },
        { kind: 'para', text: 'The course record for a **known unknown**, a convention, makes an unknown usable in a roadmap. Each entry states what is unknown, its **impact** if it comes out badly, the **information needed** to close it, the **mitigation** while it stays open, its **owner**, and the **increment it gates**. The last field turns the record into part of the roadmap: an increment whose gating unknown is still open cannot start.' },
        { kind: 'figure', slide: 'w6s1-known-unknowns' },
        {
          kind: 'table',
          header: ['Unknown', 'Impact', 'Information needed', 'Mitigation', 'Owner', 'Gates'],
          rows: KNOWN_UNKNOWNS.map((x) => [`${x.id} ${x.name}${x.tbx ? ` (${x.tbx})` : ''}`, x.impact, x.need, x.mitigation, x.owner, x.gates]),
          caption: `AeroLink’s known unknowns (FICTIONAL; U-008 and U-009 are proposed). ${Cap(numberWord(KNOWN_UNKNOWNS.filter((x) => x.gates === 'INC-003').length))} of them gate the autonomy increment.`,
        },
        { kind: 'slide-ref', slide: 'w6s1-think-pair', text: 'Before Session 2: place six AeroLink changes on the horizons, with the evidence or unknown that sets each' },
        { kind: 'para', text: `A last observation on AeroLink: if a hub closes, the network keeps ${pct(BASELINE.retainedAfterHubLoss)} of its capacity at entry, the committed Year-2 step raises that to ${pct(YEAR2.retainedAfterHubLoss)}, and neither protects against a regional grid outage. The resilience gap in the mid term exists because one unknown, the integration of on-site storage, is still open.` },
      ],
    },
  ],
}
