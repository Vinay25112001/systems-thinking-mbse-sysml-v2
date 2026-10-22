// Week 6, Session 2 lecture: Evolution Roadmap — transition while operating (transition as a process, the flexible
// technology roadmap rule, modernizing a service enterprise in operation, changing without breaking), security and
// resilience as the enterprise evolves (DECISION_LOG A21 item 6), the AeroLink roadmap worked in full (anatomy, the
// baseline trajectory with the committed Year-2 step and its computed transition order, Increments 1 to 3, triggers and
// dependencies with the answer to the driving question, the impact of the autonomy increment), the roadmap as a decision instrument and its limits,
// the Phase I baseline review that prepares Week 7, and the Lab L6 launch. 75-minute session: 47 minutes of lecture and
// 22 minutes of laboratory launch on 18 slides plus the generated "References and credits" slide, and a 6-minute buffer.
// Single source for the slide viewer, the faculty notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week06/WEEK06_LECTURE_OUTLINE.md §3.
//
// Accuracy rules followed: as in session1.ts. Two scope notes are said aloud where they bite: SEBoK's modernization
// article describes upgrades of fielded systems, applied here to an operating service enterprise; and no held source
// gives a roadmap template, lanes or the "transition risk" category, which are course conventions. AeroLink is
// FICTIONAL; every capacity, threshold, step and count is computed in ./aerolinkCase.ts.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { REQUIRED_CAPACITY, TRADE_RULES } from '../week03/aerolinkCase'
import {
  AEROLINK_HORIZONS, AROU_UPDATE, BASELINE, BASELINE_REVIEW, COUNTS, DRIVING_QUESTION, FEEDS_FORWARD_W6, HANDOVERS_TO_W6, IMPACT_CANDIDATE_IDS, IMPACT_JUDGED, YEAR2, YEAR2_TRANSITION, INC2_STEP, INCREMENTS,
  SECURITY_RESILIENCE_LINKS, TRANSITION_RISKS, UTILIZATION_LIMIT, impactByWeek, increment,
} from './aerolinkCase'
import { LAB6_MINIMUMS as MIN, LAB6_MINIMUMS_THREE as MIN3, LAB6_TEAM_HOURS, LANES, MATURE_TRL, approachLabel } from './labBrief'

export const WEEK6_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const C = COUNTS
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const i0 = increment('INC-000')
const i1 = increment('INC-001')
const i2 = increment('INC-002')
const i3 = increment('INC-003')
const near = AEROLINK_HORIZONS[0]
const mid = AEROLINK_HORIZONS[1]
const far = AEROLINK_HORIZONS[2]
const reached = IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id]?.reached)
const byWeek = impactByWeek(reached)
const pct = (x: number) => `${Math.round(x * 100)} %`
const tr = TRANSITION_RISKS()
const sr = SECURITY_RESILIENCE_LINKS()
const r012 = AROU_UPDATE.find((a) => a.id === 'R-012')!
const openWeeks = BASELINE_REVIEW.filter((r) => r.items.length)

export const WEEK6_SESSION2: Lecture = {
  week: 6,
  session: 2,
  title: 'Evolution Roadmap',
  subtitle: 'Session 2: Transition, the AeroLink roadmap and the lab launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ F. transition (20 min)
    {
      id: 'w6s2-transition',
      title: 'Transition while the service operates',
      slides: [
        {
          id: 'w6s2-warmup',
          title: 'Warm-up: three questions from Session 1',
          purpose: 'Spaced retrieval of Session 1 before new material.',
          minutes: 2,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['1. What does a TRL not tell you?', '2. Name the two ways to define increments', '3. What is an off-ramp, and when does an increment need one?'] }],
          sources: [R('R60', '525'), R('R106', '583'), R('R46', '126')],
          notes: {
            teach: [
              'Read the three questions; give a minute for each student to write answers, then take answers aloud. Expected answers: a TRL does not rate how well the technology fits the architecture absorbing it (R60 p.525); increments are defined either toward an end state known at the start, or by maturing technology matched with evolving needs when the end state cannot be defined (R106 p.583); an off-ramp is a contingency to use mature technology if a technology does not mature, needed when an increment inserts an immature technology (R46 p.126).',
              'Read three of the one-minute papers from Session 1 aloud: changes students would not make yet, and the evidence that would change their minds.',
            ],
            why: 'Retrieval at the start of a session strengthens memory and shows the instructor which Session 1 idea needs repair before the worked roadmap uses it.',
            transition: 'All three ideas meet in one problem: changing a system while it runs.',
            timing: '2 min: 1 min writing, 1 min answers and two papers.',
          },
        },
        {
          id: 'w6s2-transition-process',
          title: 'Transition is a process, not a date',
          purpose: 'Define transition and its scope, and the strategies for moving between configurations.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-transition-bar',
            caption: 'Transition is planned, implemented and lived with; technology insertion recurs during operation.',
            alt: 'An arrow labeled a process over time runs above a bar of three segments: plan, implement, operate and maintain. Below the third segment, three markers point into it, labeled insert technology.',
          },
          body: [{ kind: 'bullets', items: ['Transition: from development to fielding and sustainment', 'A process over time: plan, implement, operate and maintain', 'Plan it early; design for insertion during operation', 'Strategies: simultaneous operation, cutover, retirement'] }],
          sources: [R('R107', '447'), R('R107', '448')],
          notes: {
            teach: [
              'MITRE defines transition as the point at which a system moves from development to the manufacturing, fielding and sustainment phase (R107 p.447). Its systems engineers are expected to develop transition strategies for delivering and deploying systems, including simultaneous system operation, cutover, and retirement or disposal of systems being decommissioned (R107 p.447).',
              'Then the lesson: view transition as a process. Although it is common to think of it as a point in time, transition is a set of activities over time: planning for transition, implementation, and operations and maintenance, in sequence. It should not be deferred until the product is ready to be fielded, or failure is more likely; and deciding how to insert technology improvements during operations and maintenance, often several times, needs to be addressed in the initial design (R107 p.448).',
              'For your roadmap that means each increment carries its own transition approach, written when the increment is planned, not when it is ready. Name the strategy: run old and new together, cut over at a moment, or retire the old after the new is proven.',
            ],
            why: 'Students plan what an increment delivers and forget how the enterprise gets from one configuration to the next; making transition a field of every increment fixes that by construction.',
            figure: 'Read the three segments left to right, then point at the repeated insert-technology markers inside the last one: insertion is something the operating enterprise does again and again.',
            misconceptions: [{ claim: 'Transition is a go-live date at the end of the project.', correction: 'MITRE calls it a process with planning, implementation and operation, begun early; a date is only the moment one strategy, cutover, takes effect.' }],
            transition: 'If insertion recurs, when is the right moment? MITRE gives a three-part rule.',
            timing: '3 min: 1 min definition and strategies, 1.5 min the process lesson, 30 s for the lab.',
          },
        },
        {
          id: 'w6s2-insertion-rule',
          title: 'A flexible technology roadmap: when to insert',
          purpose: 'The insertion rule students apply: maturity, insertability and operational timing together.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-three-circles',
            caption: 'An insertion point is where maturity, the ability to insert and operational timing all hold.',
            alt: 'Three overlapping circles labeled maturity, ability to insert and operational timing. Their common center is labeled insertion point.',
          },
          body: [{ kind: 'bullets', items: ['Plan when, how and why to insert improvements after deployment', 'Balance maturity, the ability to insert, and operational timing', 'Open, standard interfaces make later insertion easier'] }],
          sources: [R('R107', '449'), R('R47', '139')],
          notes: {
            teach: [
              'MITRE’s lesson is to have a flexible technology roadmap: understand and plan when, how and why technology improvements should be inserted into the system after deployment; understand technology readiness assessments; and develop a roadmap that balances technology maturity, the ability to insert the technology into the system, for example from a manufacturing or retrofit perspective, and when it is operationally appropriate to make the upgrade (R107 p.449).',
              'The second circle connects to Week 5. The DoD guidebook says modular, open systems with standardized interfaces facilitate innovation and competition in future technology insertion and refresh (R47 p.139). Your interface standards column is the ability-to-insert circle: an interface that is defined and controlled can be upgraded on one side.',
              `Apply it to Session 1’s table. High-power charging sits in all three circles now. The faster charger of the change request fails the third: on the baseline trajectory the network is fleet-limited, ${YEAR2.aircraft} aircraft at ${TRADE_RULES.tripsPerAircraft} trips, ${YEAR2.fleetLimit} trips a day, below the charger limit of ${YEAR2.chargerLimit}, so a faster charge adds no trips. Mature and insertable, but not yet operationally appropriate.`,
            ],
            why: 'One maturity number cannot decide an insertion; the three circles give students a rule they can apply and defend for every row of their technology plan.',
            figure: 'Name each circle, then point at the center where all three overlap: only there is an insertion point. Ask which circle the faster charger misses.',
            misconceptions: [{ claim: 'Once a technology is mature, it should be inserted at the next opportunity.', correction: 'MITRE balances maturity with the ability to insert and with operational timing; a mature upgrade that buys nothing yet can wait.' }],
            transition: 'Timing is hardest for a service that cannot stop. SEBoK’s modernization article is about exactly that.',
            timing: '3 min: 1 min the rule, 1 min open interfaces, 1 min the faster charger.',
          },
        },
        {
          id: 'w6s2-operating-change',
          title: 'Modernizing a service or an enterprise while it operates',
          purpose: 'Why evolving a service enterprise is hard: compatibility, phasing and the risk of disruption.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-running-service',
            caption: 'A service changed while it runs: one part is replaced at a time, and the old and the new must work together.',
            alt: 'A train of four carriages moving right. The third carriage is drawn dashed, being replaced by a new carriage lowered from above. A label reads phase-based change, backward compatible.',
          },
          body: [{ kind: 'bullets', items: ['Reasons include obsolescence and new uses', 'A service must stay backward compatible during the change', 'Large services change in phases, area by area', 'The largest challenge: changing while the system operates'] }],
          sources: [R('R26', '681'), R('R26', '682'), R('R26', '683')],
          notes: {
            teach: [
              'SEBoK’s Capability Updates, Upgrades and Modernization article lists reasons for modernization, among them components becoming obsolete, including the lack of spare parts, and new uses that need capabilities not built into the original system (R26 p.681). It also stresses understanding the intended usage of the product or service, documented as a concept of operations, before changing it (R26 p.681): your Week 2 ConOps is an input to every increment.',
              'For service systems it adds three points. Modernization may require regulatory changes to allow new technologies; it requires backward compatibility to the previously provided service during the period of change; and because services span large areas, it generally needs a phase-based change and implementation strategy (R26 p.682).',
              'For enterprises, the location and conditions of the work matter, and the largest challenge is implementing the changes while the system remains operational. Disruption of ongoing operations is a serious risk, and for some systems the transition between the old and new configuration is particularly important and must be carefully planned (R26 p.683). AeroLink is all of these: regulated, spread over six sites, and selling trips every day.',
            ],
            why: 'The modernization article turns “keep the service running” from a slogan into three engineering obligations: compatibility, phasing and a planned transition.',
            figure: 'Point at the moving train, then at the dashed carriage being replaced from above while the others keep rolling; read the label, phase-based change, backward compatible.',
            examples: ['A regional rail operator replacing signaling: it changes one line section at a time, keeps the old and new systems interoperable at the boundary, and runs services throughout.'],
            misconceptions: [{ claim: 'The safest way to change a service is to stop it, change everything, and restart.', correction: 'For an operating enterprise, disruption is itself the serious risk SEBoK names; phased, backward-compatible change keeps the service delivering while it changes.' }],
            transition: 'How do we change one part without breaking the rest? Three engineering disciplines.',
            timing: '4 min: 1 min reasons and ConOps, 1.5 min service systems, 1.5 min enterprises and AeroLink.',
          },
        },
        {
          id: 'w6s2-change-without-breaking',
          title: 'Changing without breaking: the Vee entry point, compatibility, regression',
          purpose: 'Engineering discipline for upgrades, and how concurrent changes are managed.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-vee-entry',
            caption: 'A modification enters the Vee at its own level; a lower-level change flows upward through its parent requirements.',
            alt: 'A Vee with three entry points marked on its left arm, labeled A system, B subsystem and C component. An arrow beside the arm points upward from C toward A, labeled flow requirements to parents.',
          },
          body: [{ kind: 'bullets', items: ['A change enters the Vee at its own level', 'Lower-level changes flow up through parent requirements', 'A component change should keep form, fit, function and interface', 'Regression test what was not changed', 'Concurrent changes: a block, or continuous integration'] }],
          sources: [R('R26', '682'), R('R26', '683'), R('R26', '684')],
          notes: {
            teach: [
              'SEBoK’s Vee for modifications: if a modification starts at a lower level of the system hierarchy, the Vee is entered at that level; the figure shows three entry points, and the Vee may be entered many times in a system’s life (R26 p.683). A change at a subsystem or component level that meets the system requirements still changes lower-level requirements and design, and changes introduced at those lower points require flowing the requirements upward through their parent requirements to the system level (R26 pp.683–684).',
              'A change at the lowest level, typically obsolete parts, should be compatible in form, fit, function and interface, so that no higher-level requirement is affected; if one is, it must be identified and worked out with the customer and stakeholders at once (R26 p.684). After the change, regression testing on the parts not modified confirms that the upgrade did not affect existing functions, aided by a requirements verification traceability matrix (R26 p.682).',
              'When several modifications run at once there are two methods: the “block” method, where a group of changes is deployed together at a specific time, and continuous integration, which runs alongside it (R26 p.684). AeroLink uses both: Increment 1’s hub hardware goes in as blocks, Increment 2’s platform software by continuous integration.',
            ],
            why: 'Students who know where a change enters the Vee can say which earlier requirements and tests an increment touches, which is exactly the impact list the lab asks for.',
            figure: 'Point at entry A, then B, then C on the left side of the Vee, and follow the upward arrow from B and C: flow the requirements to their parents. A change that enters low still answers to the top.',
            misconceptions: [{ claim: 'A component swap that keeps the same interface needs no testing beyond the new component.', correction: 'SEBoK asks for regression testing of the parts not modified, because an upgrade can affect existing functions in ways the interface does not show.' }],
            transition: 'One kind of change is never optional in an evolving enterprise: what it does to security and resilience.',
            timing: '4 min: 1.5 min the Vee, 1.5 min compatibility and regression, 1 min concurrent changes.',
          },
        },
        {
          id: 'w6s2-security-resilience',
          title: 'Security and resilience as the enterprise evolves',
          purpose: 'Integrate security and resilience into every increment, with transition risks named (A21 item 6).',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-sr-evolution',
            caption: 'Each AeroLink increment changes security and resilience; the change is planned with the increment, not after it. (FICTIONAL)',
            alt: 'Three columns headed Increment 1, Increment 2 and Increment 3, in two rows. Security row: signed storage commands; new link, authenticated; datalink flies the aircraft. Resilience row: service in a grid outage; written fallback; safe landing without link.',
          },
          body: [{ kind: 'bullets', items: ['For each increment, state its security and resilience change', 'Security cannot be added by retrofit', 'Link each new risk to the increment that creates it', 'Your roadmap links at least one security or resilience risk', 'A transition risk exists only while the change is being made'] }],
          sources: [R('R25', '1231'), R('R25', '1234'), R('R24', '1203'), R('R24', '1205'), R('R24', '1208')],
          notes: {
            teach: [
              'SEBoK’s security article is blunt: adversity, the conditions that can cause a loss of assets, occurs throughout the system life cycle, so every systems engineering activity has security considerations; and, quoting Anderson, unless security is engineered into a system from its inception there is little chance it can be made secure by retrofit (R25 p.1231). Most systems sit in larger enterprises, and adversity often comes through or from those connected systems (R25 p.1234). Every new interface an increment adds is a new path for adversity.',
              'Resilience is the ability to provide required capability when facing adversity, by avoiding, withstanding and recovering (R24 p.1203). Among its means are “adapt”, delivering capability in changing situations, and “evolve”, adapting over time (R24 p.1205). Resilience should be considered throughout the life cycle (R24 p.1208). So for each increment, state its security and resilience change.',
              `On AeroLink. Increment 1 adds storage whose control accepts only signed commands, and the storage changes the grid-outage risk from accept to mitigate. Increment 2 adds an external interface to the journey planner, authenticated and separated from dispatch, and a written public-transport fallback. Increment 3 turns the radio datalink into part of flight control: a forged or lost link becomes a flight hazard.`,
              `Two record rules follow. Link each new risk to the increment that creates it; AeroLink links ${sr.length} security or resilience risks (${sr.join(', ')}). And name transition risks, a course term: a risk that exists only while the change is being made. AeroLink records ${numberWord(tr.length)} (${tr.join(', ')}); ${r012.id} is the risk that a hub being equipped is still out of turnaround service when the day starts, which leaves the network at ${YEAR2.oneHubOut} trips a day.`,
            ],
            why: 'Security and resilience bolted on after the roadmap is drawn are exactly the retrofit SEBoK warns against; a field on every increment makes them part of the plan.',
            figure: 'Read the three columns left to right, the security line first, then the resilience line. Point at Increment 3’s datalink: the same interface, a different consequence.',
            misconceptions: [
              { claim: 'Security is reviewed once the roadmap is approved.', correction: 'SEBoK says security engineered in from inception, not by retrofit; each increment states its security change when it is planned.' },
              { claim: 'Resilience is the same as redundancy.', correction: 'Redundancy is one technique. SEBoK’s resilience objectives are avoid, withstand and recover, and its means include adapting and evolving over time.' },
            ],
            transition: 'Now the method end to end, on AeroLink.',
            timing: '4 min: 1 min security, 1 min resilience, 1 min AeroLink, 1 min the two record rules.',
          },
        },
      ],
    },
    // ============================================================================================ G. AeroLink worked example (27 min)
    {
      id: 'w6s2-worked',
      title: 'The AeroLink roadmap, worked',
      slides: [
        {
          id: 'w6s2-anatomy',
          title: 'Anatomy of a roadmap',
          purpose: 'Fix the product’s form before the worked example: horizons, lanes and the fields of an increment.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-roadmap-grid',
            caption: 'The course roadmap: three horizon columns, four lanes, and increment bars that start at a trigger.',
            alt: 'An empty grid with three columns, near term, mid term and far term, and four rows, capability, technology, architecture and interfaces, operations and people. One empty dashed bar spans three rows of the mid-term column, with a diamond at its top corner labeled trigger.',
          },
          body: [{ kind: 'bullets', items: ['Horizons: near, mid and far, each with an end state', 'Lanes: capability, technology, architecture and interfaces, operations and people', 'Each increment: content, entry trigger, dependencies, off-ramp, transition', 'Each increment linked to the gap, need or objective it serves', 'Dependencies point back in time: a cycle has no first step'] }],
          sources: [R('R12', '862'), R('R12', '863'), R('R105', '530')],
          notes: {
            teach: [
              'Fix the form before we fill it. No held source gives a roadmap template, so the course uses its own convention, built on SEBoK’s time buckets and plan (R12 pp.862–863) and MITRE’s roadmap contents (R105 p.530).',
              `Horizons: near, mid and far, each with an end state, the to-be you described in Session 1. Lanes: ${LANES.join(', ').toLowerCase()}. A change usually spans several lanes; an increment bar that stays in the technology lane alone is a purchase, not a change to the enterprise.`,
              'Each increment carries its content, its entry trigger, its dependencies, its off-ramp where it inserts an immature technology, its development approach and its transition approach, its security and resilience change, and its links: to the gap, need or objective it serves, and to the risks and unknowns that gate it. The lab tool checks exactly these fields.',
            ],
            why: 'A shared form lets students read the worked example as a filled template and makes their own roadmaps comparable in review.',
            figure: 'Read the three horizon columns, then the four lanes. Point at the empty bar spanning lanes, and at the diamond at its start: every increment starts at a trigger, not at a date.',
            misconceptions: [{ claim: 'The lanes should each have their own separate plan.', correction: 'One increment usually spans several lanes; the grid shows how a technology change lands in capability, architecture and operations at once.' }],
            transition: 'Every roadmap starts from an honest as-is.',
            timing: '3 min: 1 min horizons and lanes, 2 min the increment fields.',
          },
        },
        {
          id: 'w6s2-baseline',
          title: 'Worked example I: Increment 0, the baseline trajectory',
          purpose: 'Establish AeroLink’s as-is with computed capacity and the limit that binds, and the committed step that completes its baseline trajectory.',
          minutes: 3,
          layout: 'worked-example',
          figure: {
            id: 'w6s2-baseline',
            caption: `AeroLink’s as-is at entry into service and, in the near column, the committed Year-2 step: together, the baseline trajectory. (FICTIONAL)`,
            alt: `A grid with the lanes capability, technology, architecture and operations, and the columns as is, near, mid and far. The as-is column: ${BASELINE.capacity}/day, fleet-limited; ${BASELINE.turnaroundChargers} chargers, ${BASELINE.chargerLimit}/day; 1 platform + standby; ${BASELINE.aircraft} aircraft, piloted. The near column, the committed step: ${YEAR2.capacity}/day; ${YEAR2.turnaroundChargers} chargers; platform unchanged; ${YEAR2.aircraft} aircraft. The mid and far columns are empty.`,
          },
          body: [{
            kind: 'steps',
            items: [
              { label: 'As is', text: 'Every roadmap starts from an honest “as is”' },
              { label: 'Fleet', text: `${BASELINE.aircraft} × ${TRADE_RULES.tripsPerAircraft} = ${BASELINE.fleetLimit} trips/day` },
              { label: 'Chargers', text: `${BASELINE.turnaroundChargers} × ${TRADE_RULES.chargesPerCharger} = ${BASELINE.chargerLimit} charges/day` },
              { label: 'Trajectory', text: `${BASELINE.capacity} at entry; ${YEAR2.capacity} by month ${YEAR2.month}, committed` },
            ],
          }],
          sources: [R('R109', '131'), R('R109', '132'), R('R12', '860')],
          notes: {
            teach: [
              'Every roadmap starts from an honest “as is”: MITRE’s first snapshot is the current environment (R109 pp.131–132). Read AeroLink’s from the Week 1 data sheet and the Week 3 baseline alternative: what exists at entry into service.',
              `Then add what is already decided. For SEBoK the baseline covers capability developed so far and capability already planned (R12 p.860), so the committed Week 3 step belongs to the baseline trajectory, not to a new increment: ${YEAR2.capacity} trips a day by month ${YEAR2.month}. Before you advance, pose the question for that step: with four aircraft to add and one spoke to convert into a hub, which should come first, and why does the order matter? Give thirty seconds; collect two answers.`,
            ],
            workedSolution: [
              `Assets: ${BASELINE.aircraft} four-seat aircraft; ${BASELINE.sites} vertiports, ${BASELINE.hubs} of them hubs with ${TRADE_RULES.chargersPerHub} turnaround chargers each (assumption A-002); a ${TRADE_RULES.operatingHours}-hour operating day; piloted operations; one operations platform with a hot standby (${BASELINE.platformDecision}).`,
              `Fleet limit: ${BASELINE.aircraft} aircraft × ${TRADE_RULES.tripsPerAircraft} trips = ${BASELINE.fleetLimit} trips/day. Charger limit: ${BASELINE.turnaroundChargers} turnaround chargers × ${TRADE_RULES.chargesPerCharger} charges = ${BASELINE.chargerLimit} charges/day.`,
              `Capacity is the smaller: ${BASELINE.capacity} trips/day at entry, fleet-limited. The committed step takes the trajectory to ${YEAR2.capacity} by month ${YEAR2.month}, ${C.capacityExcess} above the ${REQUIRED_CAPACITY} the Year-2 objective needs.`,
              `Resilience: losing one hub leaves ${pct(BASELINE.retainedAfterHubLoss)} of capacity at entry and ${pct(YEAR2.retainedAfterHubLoss)} once the fourth hub is in; a regional grid outage suspends the service (R-011, accepted).`,
            ],
            why: 'Computing the as-is, and naming the limit that binds, is what lets every later increment be checked by arithmetic rather than asserted; carrying the committed step into the baseline stops the roadmap from planning it twice.',
            figure: 'Point at the as-is column, read the capacity and the charger limit beside it, and say which one binds. Then the near column: the committed step, already decided. The mid and far columns are empty on purpose: they are the roadmap’s work.',
            misconceptions: [{ claim: 'The baseline is only what exists on the first day.', correction: 'The as-is snapshot is where the baseline starts. Changes already decided belong to the baseline trajectory, so the roadmap does not plan them again; their transition is still planned, which is the next slide.' }],
            transition: 'Now the committed step’s order question.',
            timing: '3 min: 30 s the honest as-is, 1.5 min the computation, 30 s the committed step, 30 s the question posed.',
          },
        },
        {
          id: 'w6s2-increment-1',
          title: 'Worked example II: the committed Year-2 step and its transition order',
          purpose: 'The decided step inside the baseline: its conditions, off-ramp, and a transition order computed from the trade rules.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w6s2-increment-1',
            caption: `The committed step, hub first, then aircraft: capacity climbs ${TRADE_RULES.tripsPerAircraft} trips per aircraft and reaches ${REQUIRED_CAPACITY} with aircraft ${YEAR2_TRANSITION.needed}; aircraft first would stall at ${YEAR2_TRANSITION.aircraftFirst}. (FICTIONAL)`,
            alt: `Left: two condition diamonds, labeled A-003 test report and U-002 utility. Right: a step chart of trips per day against aircraft in service after the hub conversion: ${YEAR2_TRANSITION.steps.map((x) => `${x.aircraft} aircraft ${x.capacity}`).join(', ')}, with a solid line labeled ${REQUIRED_CAPACITY} needed and a dashed line labeled aircraft first: ${YEAR2_TRANSITION.aircraftFirst}.`,
          },
          body: [{
            kind: 'steps',
            items: [
              { label: 'Content', text: `+${YEAR2.addedAircraft} aircraft; a fourth hub (committed)` },
              { label: 'Conditions', text: 'charger test report (A-003); utility agreement (U-002)' },
              { label: 'Off-ramp', text: 'refused spoke: a new hub vertiport' },
              { label: 'Transition', text: `hub first; ${REQUIRED_CAPACITY} with aircraft ${YEAR2_TRANSITION.needed}` },
            ],
          }],
          sources: [R('R26', '682'), R('R46', '126'), R('R108', '392')],
          notes: {
            teach: [
              'Take the order answers from the last slide. Then reveal: the hub first. The reason is a computation, not a preference, and the figure shows it.',
              'The committed step is the Week 3 decision DEC-001. It sits in the baseline trajectory, so it is not one of this roadmap’s increments; but its transition is still ahead, and a roadmap plans every transition still to come. Its content, conditions and off-ramp come from the decision record; only the transition order is new this week.',
            ],
            workedSolution: [
              `Content: ${i0.content[1]}; it serves ${i0.serves.join(', ')}.`,
              `Conditions, from DEC-001: ${i0.trigger.join('; ').replace('the committed step’s conditions: ', '')}. Development approach: ${approachLabel(i0.approach ?? '').toLowerCase()}, because ${i0.approachWhy}. Off-ramp, from the DEC-001 record: ${i0.offRamp}`,
              `Transition order. Aircraft first: ${YEAR2.aircraft} aircraft on ${BASELINE.turnaroundChargers} chargers give min(${YEAR2.aircraft} × ${TRADE_RULES.tripsPerAircraft}, ${BASELINE.turnaroundChargers} × ${TRADE_RULES.chargesPerCharger}) = ${YEAR2_TRANSITION.aircraftFirst}, ${YEAR2_TRANSITION.aircraftFirstBinding}-limited and short of ${REQUIRED_CAPACITY}. Hub first: ${BASELINE.aircraft} aircraft on ${YEAR2.turnaroundChargers} chargers give ${YEAR2_TRANSITION.hubFirst}, still fleet-limited, then each aircraft adds ${TRADE_RULES.tripsPerAircraft}: ${YEAR2_TRANSITION.steps.map((s) => s.capacity).join(', ')}.`,
              `The objective is met when ${TRADE_RULES.tripsPerAircraft}n ≥ ${REQUIRED_CAPACITY}, n = ${YEAR2_TRANSITION.needed} aircraft: the ${['', 'first', 'second', 'third', 'fourth'][YEAR2_TRANSITION.addedForRequired]} of the ${YEAR2_TRANSITION.added} added. Phase-based and backward compatible, as a service must be (R26 p.682).`,
              `The wrong order is Week 3’s risk R-001, charging capacity lags fleet growth; its treatment, tie every aircraft order to a charging-capacity check, is the hub-first order. Security: the two high-power chargers are replaced to the signed-configuration specification (R-010).`,
            ],
            why: 'The transition order is the place where a decided change can still fail; computing it from the same rules as the trade study shows students that transition is engineering, not logistics.',
            figure: `Point at the two condition diamonds on the left. Then follow the step chart: ${YEAR2_TRANSITION.hubFirst} with the hub converted and ${BASELINE.aircraft} aircraft, up ${TRADE_RULES.tripsPerAircraft} per aircraft, crossing the ${REQUIRED_CAPACITY} line at aircraft ${YEAR2_TRANSITION.needed}. Then the dashed line at ${YEAR2_TRANSITION.aircraftFirst}: the ceiling if the aircraft had come first.`,
            misconceptions: [{ claim: 'Once a change is decided, the roadmap has nothing more to say about it.', correction: `The decision fixes what changes, not the order. Aircraft first would leave the network charger-limited at ${YEAR2_TRANSITION.aircraftFirst}, the risk R-001 that Week 3 already treats.` }],
            transition: 'Increments 1 to 3 are the roadmap’s own changes, and less certain; the roadmap must show that honestly.',
            timing: '4 min: 30 s the reveal, 1 min content and conditions, 30 s off-ramp, 1.5 min the transition computation, 30 s R-001.',
          },
        },
        {
          id: 'w6s2-increments-2-3',
          title: 'Worked example III: Increments 1 to 3, toward resilience and autonomy',
          purpose: 'Two mid-term increments and a far-term one, gated by an integration unknown, by demand and partners, and by immature technology.',
          minutes: 5,
          layout: 'worked-example',
          figure: {
            id: 'w6s2-increments-2-3',
            caption: `Increments 1 and 2 start on their triggers in the mid term; Increment 3 stays dashed until detect-and-avoid reaches TRL ${MATURE_TRL}, with an off-ramp to stay piloted. (FICTIONAL; proposed)`,
            alt: `Two columns, mid term and far term. In the mid term two solid bars. Increment 1, storage and leasing, with a trigger diamond labeled storage demo. Increment 2, data, workload, ticketing and capacity, with a trigger diamond labeled re-forecast > ${INC2_STEP.trigger}. In the far term a dashed bar, Increment 3, with a trigger diamond labeled TRL ${MATURE_TRL} + certification, and a dashed arrow below it labeled off-ramp: stay piloted.`,
          },
          body: [{
            kind: 'steps',
            items: [
              { label: 'Increment 1', text: 'storage at the hubs, one first; overnight leasing' },
              { label: 'Increment 2', text: `data, workload evidence, ticketing; capacity above ${INC2_STEP.trigger}/day` },
              { label: 'Increment 3', text: `remote operation at TRL ${MATURE_TRL}+, with certification` },
              { label: 'Approaches', text: 'incremental, incremental, evolutionary' },
            ],
          }],
          sources: [R('R106', '583'), R('R106', '584'), R('R108', '393'), R('R46', '126')],
          notes: {
            teach: [
              `Say first what is proposed: the horizons and Increments 1 to 3 are instructor proposals for the faculty to confirm. Their structure is the lesson; their details may change, which MITRE says is normal (R106 p.584).`,
              'Increment 1 makes the hubs withstand a grid outage; Increment 2 prepares the evidence and integrates; Increment 3 is the autonomy the board asked about, and the roadmap prepares for it without scheduling it.',
            ],
            workedSolution: [
              `Increment 1, ${lc(i1.name)} (${mid.label.toLowerCase()}, ${mid.length}): ${i1.content.join('; ')}; it serves ${i1.serves.join(', ')}. Triggers: ${i1.trigger.join('; ')}. Approach: ${approachLabel(i1.approach ?? '').toLowerCase()}, ${i1.approachWhy}. Transition: ${lc(i1.transition)}`,
              `Increment 2, ${lc(i2.name)} (${mid.label.toLowerCase()}): ${i2.content.join('; ')}. Triggers: ${i2.trigger.join('; ')}. The capacity threshold is computed: the trajectory gives ${YEAR2.capacity}, which at ${UTILIZATION_LIMIT * 100} percent utilization supports ${INC2_STEP.trigger} trips a day; the step to ${INC2_STEP.aircraft} aircraft gives ${INC2_STEP.capacity} (${INC2_STEP.binding}-limited) and supports ${INC2_STEP.supports}.`,
              `Increment 3, ${lc(i3.name)} (${far.label.toLowerCase()}, ${far.length}): ${i3.content.join('; ')}. Triggers: ${i3.trigger.join('; ')}. Dependencies: ${i3.dependencies.join(', ')}, because the architecture comes first and Increment 2 supplies the evidence.`,
              `Development approach: ${approachLabel(i3.approach ?? '').toLowerCase()}: ${i3.approachWhy} (R106 p.583). Off-ramp: ${lc(i3.offRamp)} (R46 p.126).`,
            ],
            why: 'Mid- and far-term increments show the honest form of an uncertain plan: triggers instead of dates, an integration unknown named, and an off-ramp for the immature technology.',
            figure: `Point at the two solid bars in the mid term and their diamonds, the storage demonstration and the capacity step at ${INC2_STEP.trigger}. Then the dashed Increment 3 bar: dashed means not yet committed; its diamond is TRL ${MATURE_TRL} evidence and a certification basis. Follow the off-ramp arrow beneath it: stay piloted.`,
            misconceptions: [{ claim: 'A far-term increment should have a delivery date like the near-term one.', correction: 'Its content and timing depend on evidence that does not exist yet; a trigger with an off-ramp is the honest form, and the dashed bar shows it.' }],
            transition: 'Put the baseline trajectory and the three increments together, with their triggers and dependencies, and answer the board.',
            timing: '5 min: 30 s what is proposed, 1.5 min Increment 1, 1.5 min Increment 2, 1.5 min Increment 3.',
          },
        },
        {
          id: 'w6s2-triggers-answer',
          title: 'Worked example IV: triggers, dependencies, and the answer to the board',
          purpose: 'Assemble the roadmap and close the driving question from evidence.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-full-roadmap',
            caption: 'AeroLink’s roadmap: the baseline trajectory and three increments, each starting at its trigger, with the dependencies drawn. (FICTIONAL; Increments 1 to 3 proposed)',
            alt: 'Four columns, as is, near, mid and far. Increment 0, the baseline trajectory, spans the as-is and near columns. Increments 1 and 2 sit in the mid column, each starting at a trigger diamond; Increment 3 sits in the far column, dashed, starting at a trigger diamond. Arrows run from Increment 0 to Increment 1, from Increment 0 to Increment 2, and from Increment 2 to Increment 3.',
          },
          body: [{ kind: 'bullets', items: ['Triggers: a demonstration, demand above a computed line, TRL evidence', 'Dependencies point back in time; autonomy needs Increment 2’s evidence', 'The board’s answer: none of the three first; resilience first', 'Autonomy is prepared for, not scheduled'] }],
          sources: [R('R106', '584'), R('R105', '530')],
          notes: {
            teach: [
              `The triggers that move AeroLink’s increments are all observable: the one-hub storage demonstration for Increment 1; operating data, the quarterly re-forecast crossing ${INC2_STEP.trigger} trips a day and the authority’s agreement for Increment 2; TRL ${MATURE_TRL} evidence, a certification basis and the closed workload limit for Increment 3. That is MITRE’s quantifiable feedback system turned into start conditions (R105 p.530).`,
              'Dependencies: every increment builds on the baseline trajectory and its platform (DEC-002), MITRE’s architecture first; Increments 1 and 2 run in parallel; Increment 3 depends on Increment 2’s workload evidence and operating data. A dependency always points to an earlier or same-horizon increment: a roadmap is an order, and a cycle has no first step.',
              `Now the board. Show the vote from Session 1. The answer is ${DRIVING_QUESTION.answer}, none of the three first. ${DRIVING_QUESTION.reasons.join(' ')} So the order is ${DRIVING_QUESTION.order}. No technology before its time (R106 p.584).`,
              'Then the think-pair-share cards: nothing new goes near, because the near term is the committed step; on-site storage and charger leasing go mid as Increment 1, after a demonstration that can run in the near term; predictive maintenance and ticketing go mid in Increment 2, each with its own trigger; the demand re-forecast is the trigger of the capacity step; autonomy goes far, dashed.',
            ],
            why: 'Assembling the whole roadmap shows that its order falls out of gaps, maturity and dependencies, which answers the driving question in a way students can repeat for their own enterprise.',
            figure: 'Follow the arrows from Increment 0 to Increments 1 and 2, then from 2 to 3, stopping at each trigger diamond. Point at the dashed far bar: prepared for, not scheduled.',
            misconceptions: [{ claim: 'Putting resilience first means the roadmap has given up on capacity and autonomy.', correction: 'Both stay on the roadmap with triggers: capacity waits for demand above a computed line, autonomy for maturity and a certification basis. Waiting is not abandoning.' }],
            transition: 'Before advancing: in pairs, list which earlier IDs Increment 3 changes. One minute.',
            timing: '4 min: 1 min triggers, 1 min dependencies, 1.5 min the answer and the vote, 30 s the cards; then pose the impact question.',
          },
        },
        {
          id: 'w6s2-impact',
          title: 'Worked example V: an increment’s impact across the package',
          purpose: 'Show that an increment changes earlier artifacts, found by links and judged by the engineer.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-impact-tree',
            caption: `Increment 3 fans out to the earlier IDs it changes, grouped by week: ${C.reached} of the ${C.candidates} candidates the links found. (FICTIONAL)`,
            alt: `A tree from a root labeled Increment 3 to five branches, one per earlier week, each with its count of changed IDs: ${byWeek.map((w) => `Week ${w.week}, ${w.ids.length}`).join('; ')}.`,
          },
          body: [{ kind: 'bullets', items: ['List the IDs an increment changes, from every earlier week', 'Links propose candidates; you judge which are reached', `AeroLink: ${C.reached} of ${C.candidates} candidates reached`, 'The list is the checklist for the Week 14 model change'] }],
          sources: [R('R13', '565'), R('R106', '583')],
          notes: {
            teach: [
              'Take the pairs’ lists first. Then the method: SEBoK says traceability is used to assess the impact of a change across the life cycle (R13 p.565). Start from what the increment inserts or changes, here the autonomy technology, the operators’ role and the aircraft, and follow the links of your record one step: the capability the technology affects, the needs behind it, the functions serving it, the requirements allocated to them, the interfaces at the aircraft, and the risks on all of these.',
              `For Increment 3 the links propose ${C.candidates} candidates. Then judge each, as you judged neighbors in the Week 5 change request: ${C.reached} are reached, for example ${reached.slice(0, 4).join(', ')}; the rest are not, for example the pad-edge noise requirement, which depends on the aircraft and procedures, not on who supervises. Every candidate gets a judgment with a reason.`,
              'The reached list is the input to Week 14: there you model this increment as a change to your SysML v2 model and check the impact from the model itself. MITRE’s architecture-first lesson applies again: the changes land on the architecture you already have (R106 p.583).',
            ],
            why: 'An impact list found by links and then judged is reproducible and defensible; one written from memory misses the requirements and interfaces that a reviewer will find.',
            figure: 'Read the root, Increment 3, then each branch with its week and count. Say which week carries most changes and why: the operators and their needs.',
            misconceptions: [{ claim: 'Every ID a link reaches is affected by the change.', correction: 'Links only propose candidates; the engineer judges which the change actually reaches, with a reason, as in the Week 5 change request.' }],
            transition: 'What can the whole roadmap decide, and what can it not?',
            timing: '3 min: 1 min the method, 1.5 min candidates and judgment, 30 s Week 14.',
          },
        },
        {
          id: 'w6s2-limits',
          title: 'The roadmap as a decision instrument, and its limits',
          purpose: 'State what a roadmap decides and what it cannot, so students present theirs honestly in Week 7.',
          minutes: 3,
          layout: 'two-column',
          body: [{ kind: 'bullets', items: ['Use it to decide:', 'what to start, and on what evidence', 'what waits, and for which unknown', 'what would change the plan'] }],
          aside: [{ kind: 'bullets', items: ['It cannot:', 'predict demand or technology progress', 'prove maturity or architecture fit', 'stay right without review'] }],
          sources: [R('R105', '529'), R('R105', '531'), R('R106', '584'), R('R12', '863')],
          notes: {
            teach: [
              'A roadmap is a decision instrument. Used well, it decides what to start and on what evidence, what waits and for which unknown, and what would change the plan; every one of those is a field of your increments and unknowns.',
              'It has limits. It cannot predict demand or technology progress: MITRE warns not to believe the content of all increments can be defined accurately in advance (R106 p.584), which is why triggers replace dates. It cannot prove maturity or fit: TRLs are claims with limits, as Session 1 showed. And it does not stay right on its own: MITRE calls the technology plan a living document (R105 p.529), to be reviewed annually or at another agreed period (R105 p.531), and SEBoK adjusts the plan for unforeseen outcomes (R12 p.863).',
              'The common errors are the limits ignored: a timeline of features with no gap behind it; a technology scheduled because it is exciting; a TRL treated as proof of fit; increments with no trigger; no off-ramp for an immature technology; transition left to the end; forgetting that the service must keep operating; unknowns hidden; security added later. The lesson lists each with its correction.',
            ],
            why: 'Students who know the limits of their roadmap present it in Week 7 as a set of decisions under uncertainty, which is what reviewers test, rather than as a forecast they will be asked to defend.',
            misconceptions: [{ claim: 'A good roadmap is one that turns out to be right.', correction: 'A good roadmap makes its decisions on stated evidence and says what would change them; when a trigger fires differently, revising it is the roadmap working.' }],
            transition: 'Last, the roadmap prepares Week 7.',
            timing: '3 min: 1 min decisions, 1 min limits, 1 min common errors.',
          },
        },
        {
          id: 'w6s2-baseline-review',
          title: 'Preparing the Phase I baseline for Week 7, and what comes after',
          purpose: 'Prepare the Week 7 package: a review of open items per week, and the hand-on to Weeks 13 and 14.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-forward',
            caption: 'The roadmap and the baseline review enter the Week 7 package; triggers feed Week 13 and one increment becomes the Week 14 model change.',
            alt: 'Three boxes left to right joined by arrows: Week 7 package and review, Week 13 analysis cases, Week 14 model change. Above the first box, a list labeled open items with owners.',
          },
          body: [{ kind: 'bullets', items: ['For each week, state ready or name each open item and its owner', 'IDs are the keys Week 7 imports', 'Week 13 may reuse your triggers as analysis cases', 'Week 14 models one increment as a change'] }],
          sources: [R('R105', '531'), R('R13', '565')],
          notes: {
            teach: [
              `Week 7 integrates Weeks 1 to 6 into the Systems Thinking Engineering Package and reviews it. Prepare now: for each week, state ready or name each open item and its owner. AeroLink’s review finds ${C.openItems} open items in ${numberWord(openWeeks.length)} weeks, among them the TBDs still open from Week 2, the assumptions behind the Week 3 TRLs, and two Week 5 findings; each has an owner, as TBX management requires (R13 p.565). The review is the first of MITRE’s periodic reviews of the plan (R105 p.531).`,
              'IDs are the keys Week 7 imports: keep every ID stable. Week 13 may reuse your triggers as analysis cases, what if demand passes the line, what if the TRL review slips; and Week 14 models one of your increments as a change to your SysML v2 model, with your impact list as its checklist.',
            ],
            why: 'A baseline review done in Week 6 turns Week 7 into a check of known open items rather than a discovery of forgotten ones.',
            figure: 'Point at the open-items list above Week 7, then follow the arrows to Week 13 and Week 14.',
            misconceptions: [{ claim: 'A package is ready for review only when nothing is open.', correction: 'Every real package carries open items; it is ready when each is named, owned and dated, so the reviewers can judge it.' }],
            transition: 'Now your own roadmap: the Lab L6 launch.',
            timing: '2 min: 1 min the review, 1 min the hand-on.',
          },
        },
      ],
    },
    // ============================================================================================ H. lab launch (22 min)
    {
      id: 'w6s2-lab',
      title: 'Laboratory launch: Lab L6',
      slides: [
        {
          id: 'w6s2-lab-brief',
          title: 'Lab L6 brief: your enterprise evolution roadmap',
          purpose: 'Unambiguous instructions: the five record parts, minimums, due date and the tool’s role.',
          minutes: 3,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: [`${MIN.gaps} gaps over three horizons; ${MIN.technologies} technologies with insertion points`, `${MIN.increments} increments counting the baseline; ${MIN.unknowns} known unknowns`, 'An impact list for one increment; a baseline review for Week 7', `Team of three: ${MIN3.gaps} gaps, ${MIN3.technologies} technologies, ${MIN3.increments} increments, ${MIN3.unknowns} unknowns`, 'Your enterprise, never AeroLink; due before Week 7'] }],
          sources: [],
          notes: {
            teach: [
              `Walk the five parts. Part 23: the baseline and at least ${MIN.gaps} gaps or excesses, each with its horizon, levels and the need behind it, and your three bucket lengths. Part 24: at least ${MIN.technologies} technologies from your Week 3 assessment, each with its status, TRL and basis, and an insertion point or a reason. Part 25: at least ${MIN.increments} increments counting the baseline, each with content, trigger, dependencies, off-ramp where needed, approach, transition and its security and resilience change.`,
              `Part 26: at least ${MIN.unknowns} known unknowns, each gating an increment, and the AROU update with at least one transition risk and one security or resilience risk linked. Part 27: the impact list of one increment and the Phase I baseline review, one row per week. A team of three works to reduced minimums. About ${LAB6_TEAM_HOURS} person-hours for a team of four. The lab tool imports your Week 5 export, and optionally your Week 3 export so it can compare TRLs; its hard gates block only real defects, and a one-word answer is accepted wherever the lecture calls it complete. Due before Week 7, Session 1, with the AI usage statement and a roadmap graphic with its text equivalent.`,
            ],
            why: 'Clear minimums and the tool’s role remove the commonest questions, how many and what will be checked, and leave the team’s time for judgment.',
            transition: 'Now start: your baseline and your top three gaps.',
            timing: '3 min: 1 min Parts 23–25, 1 min Parts 26–27, 1 min team of three, tool and due date.',
          },
        },
        {
          id: 'w6s2-lab-baseline',
          title: 'Team work: baseline and gaps',
          purpose: 'In-class start where feedback prevents the commonest error: gaps with no need behind them.',
          minutes: 10,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-lab-worksheet',
            caption: 'The in-class worksheet: the as-is in five lines, then three gaps with a horizon and the need behind each.',
            alt: 'A worksheet with two parts. Top: five lines headed as is. Bottom: three rows headed gap, horizon and need, each with blank cells.',
          },
          body: [{ kind: 'bullets', items: ['Write your as-is in five lines', 'List your top three gaps, each with a horizon', 'Name the need, objective or requirement behind each', 'Choose your bucket lengths, and say why'] }],
          sources: [R('R12', '862')],
          notes: {
            teach: [
              'Teams work from their Week 5 records and the candidate changes members brought. First five minutes: the as-is in five lines, from your Week 4 and Week 5 views. Next five minutes: the top three gaps, each with a horizon and the need, objective or requirement behind it, and your bucket lengths with a reason (R12 p.862).',
              'Circulate. Look for gaps that are features (“add an app”), gaps with no need behind them, and bucket lengths copied from AeroLink. Correct them at the table.',
            ],
            why: 'The first gap list is where teams most need feedback; doing it in the room prevents a week of increments built on wishes.',
            figure: 'Point at the two parts of the worksheet: the as-is on top, the three gaps below with their horizon and need columns.',
            transition: 'Now the check: each team states its first increment.',
            timing: '10 min: 5 min as-is, 5 min gaps; give a two-minute warning.',
          },
        },
        {
          id: 'w6s2-lab-check',
          title: 'Instructor check: the first increment and its trigger',
          purpose: 'Public feedback on the commonest early error: an increment with no measurable trigger.',
          minutes: 7,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['State your first increment after the baseline', 'Its entry trigger: what evidence starts it?', 'The unknown that gates it, and who closes it'] }],
          sources: [],
          notes: {
            teach: [
              'Each team states its first increment, its trigger and the unknown that gates it, in about sixty to eighty seconds. Apply the questions aloud so every team learns from each: is the trigger evidence someone could observe, a number, an agreement, a test result, or only a date or a wish? Is the gating unknown recorded with an owner? Teams not heard post their three lines on the LMS and get the same check in writing within 48 hours.',
            ],
            why: 'Public checking teaches the criteria to every team at once and catches the date-instead-of-trigger defect before it spreads through a roadmap.',
            transition: 'Last, the plan for the next seven days.',
            timing: '7 min: about 70 s per team for up to five teams, 1 min written-route instructions.',
          },
        },
        {
          id: 'w6s2-lab-close',
          title: 'Close: the next seven days',
          purpose: 'Work plan out of class and the assessment.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w6s2-seven-days',
            caption: 'A seven-day plan for Lab L6; the notes name the lead role for each step.',
            alt: 'Four rows of days: days 1–3, gaps, technology plan; days 3–5, increments, unknowns, AROU; days 5–6, impact, review, graphic; day 7, integrate and upload.',
          },
          body: [{ kind: 'bullets', items: ['Days 1–3: gaps and the technology plan', 'Days 3–5: increments, unknowns, AROU update', 'Days 5–6: impact list, baseline review, graphic', 'Day 7: integration and upload; quiz Q6 opens'] }],
          sources: [],
          notes: {
            teach: [
              'Walk the seven days. The Requirements and Compliance lead completes the gaps; the AI and Data Management lead, or Architecture in a team of three, builds the technology plan from the Week 3 assessment; Architecture leads the increments; Verification and Validation owns the unknowns, the AROU update and the baseline review; each member traces the IDs they own for the impact list. Readiness quiz Q6 and the individual applied exercise open now; graduate students do the roadmap sensitivity memo instead of the exercise. Log your hours.',
            ],
            why: 'A day-by-day plan with owners prevents the last-day roadmap, which is where triggers and transitions usually go missing.',
            figure: 'Read the timeline left to right with the owner of each step.',
            transition: 'End of the week’s lectures; references follow.',
            timing: '2 min: the timeline and the assessment.',
          },
        },
        {
          id: 'w6s2-references',
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
      id: 'w6-lesson-transition',
      title: 'Transition while the service operates',
      sources: [R('R107', '447'), R('R107', '448'), R('R107', '449'), R('R47', '139'), R('R26', '681'), R('R26', '682'), R('R26', '683'), R('R26', '684')],
      blocks: [
        { kind: 'para', text: 'MITRE defines **transition** as the point at which a system moves from development to the manufacturing, fielding and sustainment phase, and expects transition strategies that include simultaneous system operation, cutover, and retirement of systems being decommissioned (R107 p.447). Its first lesson is that transition is a process over time, not a point: planning for transition, implementation, and operations and maintenance, in sequence. Planning should begin early, and how technology improvements will be inserted during operations and maintenance, often several times, needs to be addressed in the initial design (R107 p.448).' },
        { kind: 'figure', slide: 'w6s2-transition-process' },
        { kind: 'para', text: 'MITRE’s rule for a **flexible technology roadmap**: plan when, how and why improvements are inserted after deployment, and balance technology maturity, the ability to insert the technology into the system, and when the upgrade is operationally appropriate (R107 p.449). The ability to insert depends on the interfaces: the DoD guidebook notes that modular, open systems with standardized interfaces facilitate future technology insertion and refresh (R47 p.139). Your Week 5 interface standards are where insertion becomes cheap.' },
        { kind: 'figure', slide: 'w6s2-insertion-rule' },
        { kind: 'para', text: 'SEBoK’s modernization article explains why changing a service enterprise is hard. Reasons for modernization include obsolescence and new uses that need capabilities not built in, and changes should start from the documented intended usage, the concept of operations (R26 p.681). Service system modernization may need regulatory change, requires backward compatibility with the service provided during the period of change, and generally needs a phase-based strategy across large areas (R26 p.682). For enterprises the largest challenge is implementing changes while the system remains operational: disruption is a serious risk, and the transition between old and new configurations must be carefully planned (R26 p.683).' },
        { kind: 'figure', slide: 'w6s2-operating-change' },
        { kind: 'para', text: 'Three disciplines keep a change from breaking what works. A modification initiated at a lower level of the system hierarchy enters the Vee at that level, and changes at lower levels flow upward through their parent requirements (R26 pp.683–684). A change at the lowest level should be compatible in form, fit, function and interface so that no higher-level requirement is affected (R26 p.684). Regression testing of the parts not modified, aided by a requirements verification traceability matrix, confirms that existing functions still work (R26 p.682). When several modifications run at once, SEBoK names the “block” method, changes deployed together, and continuous integration alongside it (R26 p.684).' },
        { kind: 'figure', slide: 'w6s2-change-without-breaking' },
      ],
    },
    {
      id: 'w6-lesson-security',
      title: 'Security and resilience as the enterprise evolves',
      sources: [R('R25', '1231'), R('R25', '1234'), R('R24', '1203'), R('R24', '1205'), R('R24', '1208'), R('R24', '1209'), R('R24', '1210')],
      blocks: [
        { kind: 'para', text: 'Adversity, the conditions that can cause a loss of assets, occurs throughout the system life cycle, so every systems engineering activity has security considerations; and unless security is engineered into a system from its inception, there is little chance it can be made secure by retrofit (R25 p.1231). Most systems are part of larger systems of systems or enterprises, and adversity often comes through or from those connected systems (R25 p.1234). For a roadmap this means each increment states its security change when it is planned: every new interface, especially an external one, is a new path for adversity.' },
        { kind: 'para', text: 'Resilience is the ability to provide required capability when facing adversity, by avoiding, withstanding and recovering from it (R24 p.1203). Two of SEBoK’s means objectives describe evolution directly: **adapt**, being or becoming able to deliver required capability in changing situations, and **evolve**, adapting over time; **degrade gracefully** describes what an element should do when it fails (R24 p.1205). Resilience should be considered throughout the life cycle (R24 p.1208); common metrics include performance retained after a disruption and the time to recover (R24 p.1209); and affordable resilience weighs risks over time against opportunities in future environments (R24 p.1210).' },
        { kind: 'figure', slide: 'w6s2-security-resilience' },
        {
          kind: 'table',
          header: ['Increment', 'Security change', 'Resilience change', 'Risks linked'],
          rows: INCREMENTS.map((x) => [`${x.id} ${x.name}`, x.security, x.resilience, x.risks.join(', ')]),
          caption: 'Security and resilience across AeroLink’s increments (FICTIONAL; Increments 1 to 3 proposed).',
        },
        { kind: 'para', text: `Two record rules follow. Link each new risk to the increment that creates it, and make sure the roadmap carries at least one security or resilience risk; AeroLink links ${sr.join(', ')}. And name **transition risks**, a course term: risks that exist only while a change is being made. AeroLink records ${tr.map((id) => `${id} (${AROU_UPDATE.find((a) => a.id === id)!.name.toLowerCase()})`).join(' and ')}. A transition risk closes when the transition ends, so it is easy to forget and easy to recognize once named.` },
      ],
    },
    {
      id: 'w6-lesson-aerolink',
      title: 'The AeroLink roadmap, worked',
      sources: [R('R109', '131'), R('R109', '132'), R('R12', '862'), R('R105', '530'), R('R106', '583'), R('R106', '584'), R('R46', '126')],
      blocks: [
        { kind: 'para', text: `The course roadmap, a convention, has three horizons, each with an end state; four lanes (${LANES.join(', ').toLowerCase()}); and increments, each with its content, entry trigger, dependencies, off-ramp, development approach, transition approach and security and resilience change, linked to the gap, need or objective it serves and to the unknowns and risks that gate it. AeroLink’s horizons (proposed): near ${near.length}, ending in ${near.endState}; mid ${mid.length}, ${mid.endState}; far ${far.length}, ${far.endState}.` },
        { kind: 'figure', slide: 'w6s2-anatomy' },
        { kind: 'heading', text: 'Increment 0: the baseline trajectory' },
        { kind: 'para', text: `Every roadmap starts from an honest “as is”, MITRE’s snapshot of the current environment (R109 pp.131–132). AeroLink enters service with ${BASELINE.aircraft} aircraft and ${BASELINE.sites} vertiports, ${BASELINE.hubs} of them hubs with ${TRADE_RULES.chargersPerHub} turnaround chargers each, piloted, on one platform with a hot standby. Its fleet limit is ${BASELINE.aircraft} × ${TRADE_RULES.tripsPerAircraft} = ${BASELINE.fleetLimit} trips a day and its charger limit ${BASELINE.turnaroundChargers} × ${TRADE_RULES.chargesPerCharger} = ${BASELINE.chargerLimit}, so capacity is ${BASELINE.capacity}, fleet-limited. SEBoK counts planned capability in the baseline (R12 p.860), so the committed Week 3 step belongs to it, giving ${YEAR2.capacity} trips a day by month ${YEAR2.month}. Its transition is still ahead, so the roadmap plans it. If the aircraft came first, ${YEAR2.aircraft} aircraft on ${BASELINE.turnaroundChargers} chargers would give ${YEAR2_TRANSITION.aircraftFirst} trips a day, charger-limited and short of ${REQUIRED_CAPACITY}. Converting the hub first raises the charger limit to ${YEAR2_TRANSITION.chargerLimitAfter} while capacity stays ${YEAR2_TRANSITION.hubFirst}; then each aircraft adds ${TRADE_RULES.tripsPerAircraft}, and ${REQUIRED_CAPACITY} is reached with aircraft ${YEAR2_TRANSITION.needed}.` },
        { kind: 'figure', slide: 'w6s2-increment-1' },
        { kind: 'heading', text: 'Increments 1 to 3: resilience, integration, then autonomy' },
        { kind: 'para', text: `Increment 1 (proposed), ${lc(i1.name)}, puts storage at the hubs once ${lc(i1.trigger[0])}, one hub first: an incremental development that retires the integration unknown early. With one hub out the network would be charger-limited at ${YEAR2.oneHubOut} trips a day, so each hub is equipped overnight; R-012 is the risk that exists only while that work runs. Increment 2 (proposed), ${lc(i2.name)}, runs in parallel; its capacity step waits until ${lc(i2.trigger[1])}. Increment 3 (proposed), ${lc(i3.name)}, starts only on ${i3.trigger.join(', ')}; its off-ramp is “${lc(i3.offRamp.split(':')[0])}”, the DoD guidebook’s contingency of mature technology (R46 p.126). Its final functionality cannot be defined now, so it is developed evolutionarily (R106 p.583).` },
        { kind: 'figure', slide: 'w6s2-increments-2-3' },
        {
          kind: 'table',
          header: ['Increment', 'Horizon', 'Serves', 'Entry trigger', 'Off-ramp', 'Approach', 'Transition'],
          rows: INCREMENTS.map((x) => (x.horizon === 'baseline' ? [`${x.id} ${x.name}`, 'baseline', x.serves.join(', '), 'committed (DEC-001)', 'see the decision record', approachLabel(x.approach ?? ''), 'hub first, then aircraft'] : [`${x.id} ${x.name}`, AEROLINK_HORIZONS.find((h) => h.id === x.horizon)!.label, x.serves.join(', '), x.trigger.join('; ') || '—', x.offRamp || '—', x.approach ? approachLabel(x.approach) : '—', x.transition || '—'])),
          caption: 'AeroLink’s increments (FICTIONAL; Increment 0 holds the committed Week 3 decision; Increments 1 to 3 and the horizons are proposed).',
        },
        { kind: 'heading', text: 'The driving question, answered' },
        { kind: 'para', text: `After the Year-2 decision, should the next step be autonomy, more capacity or ticketing? None of the three comes first. ${DRIVING_QUESTION.reasons.join(' ')} The order is therefore ${DRIVING_QUESTION.order}. The triggers are observable, which is MITRE’s quantifiable feedback system (R105 p.530), and nothing is scheduled before its time (R106 p.584).` },
        { kind: 'figure', slide: 'w6s2-triggers-answer' },
        { kind: 'para', text: `What Weeks 2 to 5 handed to Week 6, and what happened to each: ${HANDOVERS_TO_W6.map((h) => `${h.from}: ${h.status}. ${h.disposition}`).join(' ')}` },
      ],
    },
    {
      id: 'w6-lesson-impact',
      title: 'An increment’s impact across the package',
      sources: [R('R13', '565'), R('R106', '583')],
      blocks: [
        { kind: 'para', text: 'Traceability is used to assess the impact of a change across the life cycle (R13 p.565). For an increment, start from what it inserts or changes and follow the links of your record one step: from a technology to the capabilities it affects and its maturity risk; from a stakeholder to their concerns and needs; from the capabilities to the functions serving them, the requirements allocated to those functions and the physical elements performing them; from the elements to their interfaces; and from all of these to the risks that affect them. The links propose candidates; the engineer judges which the change reaches, with a reason, exactly as in the Week 5 change request.' },
        { kind: 'figure', slide: 'w6s2-impact' },
        {
          kind: 'table',
          header: ['Week', 'Reached by Increment 3', 'Candidates not reached'],
          rows: [1, 2, 3, 4, 5].map((w) => [`Week ${w}`, IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id]?.reached && impactByWeek([id])[w - 1].ids.length).join(', ') || '—', IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id] && !IMPACT_JUDGED[id].reached && impactByWeek([id])[w - 1].ids.length).map((id) => `${id}: ${IMPACT_JUDGED[id].why}`).join('; ') || '—']),
          caption: `The impact of AeroLink’s Increment 3 (FICTIONAL): ${C.reached} of the ${C.candidates} candidates found by the links are reached; the reason for each reached ID is in the worked-examples reference catalogue.`,
        },
        { kind: 'para', text: 'The reached list is the checklist for Week 14, where one increment is modeled as a change to the team’s SysML v2 model and its impact assessed from the model. The changes land on the architecture you already have, which is why MITRE puts architecture first (R106 p.583).' },
      ],
    },
    {
      id: 'w6-lesson-limits',
      title: 'The roadmap as a decision instrument: uses, limits and common errors',
      sources: [R('R105', '529'), R('R105', '530'), R('R105', '531'), R('R106', '584'), R('R12', '862'), R('R12', '863'), R('R60', '525'), R('R46', '126'), R('R107', '448'), R('R26', '683'), R('R13', '565'), R('R25', '1231')],
      blocks: [
        { kind: 'para', text: 'A roadmap decides what to start and on what evidence, what waits and for which unknown, and what would change the plan. It cannot predict demand or technology progress; MITRE warns that the content of all increments cannot be defined accurately in advance (R106 p.584), which is why triggers replace dates. It cannot prove maturity or fit, because TRLs are claims with limits. And it does not stay right on its own: the technology plan is a living document (R105 p.529), reviewed annually or at an agreed period (R105 p.531), and the enterprise plan is adjusted for unforeseen outcomes (R12 p.863).' },
        { kind: 'slide-ref', slide: 'w6s2-limits', text: 'What a roadmap decides, and what it cannot' },
        {
          kind: 'table',
          header: ['Common error', 'Correction'],
          rows: [
            ['A timeline of features with no gap behind it', 'Tie every increment to a gap, and every gap to a need (R12 p.862)'],
            ['A technology scheduled because it is exciting', 'No technology before its time (R106 p.584); immature technology carries a risk and a mitigation (R105 p.530)'],
            ['A TRL treated as proof of architecture fit', 'TRL does not rate fit with the architecture absorbing it (R60 p.525)'],
            ['Increments with no trigger', 'A quantifiable feedback system: observable entry triggers (R105 p.530)'],
            ['No off-ramp for an immature technology', 'Name the mature contingency (R46 p.126)'],
            ['Transition left until the end', 'Plan transition early, as a process (R107 p.448)'],
            ['Forgetting that the service must keep operating', 'Phase-based, backward-compatible change (R26 p.683)'],
            ['Unknowns hidden instead of recorded', 'Record each with its owner and the increment it gates (R13 p.565)'],
            ['Security added after the roadmap is drawn', 'State each increment’s security change when it is planned (R25 p.1231)'],
          ],
          caption: 'Common errors in roadmaps and their corrections.',
        },
      ],
    },
    {
      id: 'w6-lesson-baseline',
      title: 'Preparing the Phase I baseline for Week 7, and what comes after',
      sources: [R('R13', '565'), R('R105', '531')],
      blocks: [
        { kind: 'para', text: `Week 7 integrates Weeks 1 to 6 into the Systems Thinking Engineering Package and reviews it. Prepare the baseline now: for each week, state ready or name each open item and its owner, as TBX management asks (R13 p.565). It is the first of the periodic reviews MITRE expects of a plan (R105 p.531). AeroLink’s review finds ${C.openItems} open items, none of them hidden: each is named, owned and carried.` },
        {
          kind: 'table',
          header: ['Week', 'Part', 'Status', 'Open items and owners'],
          rows: BASELINE_REVIEW.map((r) => [`Week ${r.week}`, r.part, r.status, r.items.map((x) => `${x.id}: ${x.text} (owner: ${x.owner})`).join('; ') || '—']),
          caption: 'AeroLink’s Phase I baseline review (FICTIONAL), computed from the open unknowns and findings of Weeks 2–5.',
        },
        { kind: 'figure', slide: 'w6s2-baseline-review' },
        { kind: 'para', text: `IDs are the keys Week 7 imports: keep them stable. ${FEEDS_FORWARD_W6.map((f) => `${f.week} takes ${lc(f.artifact)}: ${f.how}`).join('. ')}.` },
      ],
    },
    {
      id: 'w6-lesson-apply',
      title: 'Applying the method to your own enterprise',
      sources: [R('R12', '862'), R('R105', '529'), R('R105', '530'), R('R107', '449'), R('R46', '126'), R('R13', '565'), R('R25', '1231')],
      blocks: [
        { kind: 'para', text: 'Your team does not plan AeroLink’s future; it repeats the method on its own enterprise, starting from its Week 5 record. A practical order, matching the lab tool:' },
        {
          kind: 'steps',
          items: [
            { label: 'Baseline and gaps', text: 'Write the as-is from your Week 4–5 views; compare desired and baseline capability for each need and objective; record gaps and excesses on near, mid and far horizons whose lengths you justify (R12 p.862).' },
            { label: 'Technology plan', text: 'From your Week 3 assessment, classify each technology as available now, in development or not yet existing, with its TRL and basis; give each an insertion point or a reason; give immature ones a risk and a mitigation (R105 pp.529–530).' },
            { label: 'Increments', text: 'For each increment state its content, the gap it serves, an observable entry trigger, dependencies, the development approach, the transition approach, its security and resilience change, and an off-ramp if it inserts an immature technology (R46 p.126). Insert only where maturity, insertability and timing all hold (R107 p.449).' },
            { label: 'Unknowns and AROU', text: 'Record each known unknown with impact, information needed, mitigation, owner and the increment it gates (R13 p.565); link new risks to their increments, including a transition risk and a security or resilience risk (R25 p.1231).' },
            { label: 'Impact and review', text: 'Trace one increment’s impact across your Weeks 1–5 IDs, judging each candidate; then review the baseline for Week 7, week by week.' },
          ],
        },
        { kind: 'para', text: 'Three questions before you submit. Could a reviewer tell, from each increment alone, which gap it closes and what starts it? Does every immature technology have both a risk and an off-ramp? Could the service keep running through every transition you planned? If not, the method has been followed in form but not in substance.' },
      ],
    },
  ],
}
