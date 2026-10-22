// Week 5, Session 2 lecture: Components / Interfaces — managing interfaces (governance, the interface control working
// group, standards and service levels, change control), interface security and resilience (trust boundaries, protection,
// degraded modes; DECISION_LOG A21 item 6), the AeroLink audit, integration aggregates and the coupling count Week 4
// deferred, the limits of the method and what it feeds; then the Lab L5 launch. 75-minute session: 47 minutes of lecture
// and 22 minutes of laboratory launch on 18 slides plus the generated "References and credits" slide, and a 6-minute
// buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson
// (docs/lectures/PIPELINE.md).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week05/WEEK05_LECTURE_OUTLINE.md §3, with the
// security and resilience block added (A21 item 6) and the audit's answers kept off the audit slide (students find them
// first; Week 4 review Mo1).
//
// Accuracy rules followed: as in session1.ts. The trust-boundary rule, the degraded-mode column, the change-impact method
// and the coupling metric are course conventions, labeled as such; SEBoK supplies the vocabulary (R24 pp.1205–1207,
// R25 pp.1229–1234), DoD and MITRE the management practice (R47 pp.138–140, R57 pp.411–414, R46 p.127).
// AeroLink Urban Mobility is FICTIONAL; every number below is computed in ./aerolinkCase.ts.
import type { Lecture, LessonSection } from '../types'
import {
  CHANGE_REQUEST, COUNTS, LATENCY_BUDGET, COUPLING, EXTERNAL_DISPOSITIONS, FEEDS_FORWARD_W5, FINDINGS, GROUPINGS, HIDDEN_EXTERNAL, ICWG, INTERFACES, RADIO_INTERFACES, boundaryReasons, crossingText, groupingCounts, iface, uncoveredPairs,
} from './aerolinkCase'
import { LAB5_MINIMUMS as MIN, LAB5_MINIMUMS_THREE as MIN3 } from './labBrief'

export const WEEK5_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)
const f2 = (x: number) => x.toFixed(2)
const c16 = COUNTS.all
const if8 = iface('IF-008')
const if10 = iface('IF-010')
const if6 = iface('IF-006')
const reasons = (id: string) => list(boundaryReasons(iface(id)))
const [g1, g2] = GROUPINGS.map((g) => ({ g, n: groupingCounts(g) }))
const A = COUPLING.A
const B = COUPLING.B
const uncB = uncoveredPairs(B.pairs)
const notCrossing = INTERFACES.filter((x) => !COUNTS.crossing.includes(x.id)).map((x) => x.id)
const possible = notCrossing.filter((id) => HIDDEN_EXTERNAL.includes(id))
const none = notCrossing.filter((id) => !possible.includes(id))
const verb = (xs: string[], one: string, many: string) => (xs.length === 1 ? one : many)
const budget = LATENCY_BUDGET.legs.map((l) => l.seconds).join(' + ')
const finding = (id: string) => FINDINGS.find((f) => f.id === id)!

const crossText = (id: string) => crossingText(iface(id))

const LESSON: LessonSection[] = [
  {
    id: 'w5-lesson-governance',
    title: 'Managing interfaces: governance, the working group, standards and service levels',
    sources: [R('R47', '138'), R('R47', '139'), R('R47', '140'), R('R57', '412'), R('R57', '413'), R('R57', '414'), R('R20c', '596')],
    blocks: [
      { kind: 'para', text: 'A table of interface definitions is true on the day it is written. Interface management keeps it true while both sides change. The DoD guidebook describes the process as a framework to identify, define, manage and ensure compliance with internal and external interfaces, capturing every interface requirement and every change to it under the configuration management plan (R47 p.138). When the number and complexity of interfaces outgrow the effort spent on them, poor interface configuration control degrades performance, affordability, sustainability and maintainability, and the work is iterative: interfaces are defined and refined as knowledge of the system grows (R47 p.139).' },
      { kind: 'figure', slide: 'w5s2-why-manage' },
      { kind: 'heading', text: 'Governance and the interface control working group' },
      { kind: 'para', text: 'MITRE warns not to underestimate the need for governance: in the absence of governance, interface sprawl and variation degrade performance, maintainability and sustainability, and interface management is considerably harder in loosely coupled architectures (R57 p.412). An enterprise of several owners is loosely coupled by nature. The standard instrument is an **interface control working group**: a specialized integrated product team of technical representatives from the interfacing activities, whose sole purpose is to solve the interface issues that cannot be resolved through simple engineer-to-engineer interaction (R57 p.414). The DoD guidebook asks the program to establish one, and to keep an interface management plan that documents the internal and external interfaces, the preferred standards and the certifications and tests applicable to each (R47 p.140).' },
      { kind: 'para', text: `For AeroLink, the proposed working group seats every owner of an interface that joins two organizations. Computed from the interface table, that is ${ICWG.members.length} organizations: ${list(ICWG.members)}.` },
      { kind: 'figure', slide: 'w5s2-governance' },
      { kind: 'heading', text: 'Standards and service-level agreements' },
      { kind: 'para', text: 'MITRE’s practice is to adhere to standards, because standards-based interfaces minimize specialty development and favor reuse, and to establish service-level agreements that document the performance each interface offers and report against it; an agreement binds the provider as much as the user (R57 p.413). The DoD guidebook adds the forward-looking reason: interface specifications that follow consensus standards enable a modular open systems approach, and standardized interfaces facilitate future technology insertion and refresh (R47 p.139). SEBoK names interface standards as enablers of families of systems, technology insertion and interoperability (R20c p.596). An organizational interface is managed through its agreement: its parties, obligations, service level and review date. This is the bridge to Week 6, where every technology your roadmap inserts must plug into an interface.' },
      { kind: 'figure', slide: 'w5s2-standards' },
    ],
  },
  {
    id: 'w5-lesson-change',
    title: 'Change control: one change traced through the N²',
    sources: [R('R47', '138'), R('R47', '139'), R('R36', '498'), R('R36', '499'), R('R57', '414')],
    blocks: [
      { kind: 'para', text: 'Interface changes are configuration changes. Interface requirements and their changes are captured under the configuration management plan (R47 p.138), and key interfaces may be managed as separate configuration items (R47 p.139). SEBoK describes a configuration baseline as a formally approved snapshot that is the starting point for further changes (R36 p.498), and the functional baseline includes the interface characteristics (R36 p.499). MITRE adds a practice teams forget: plan to deprecate prior versions of an interface without stranding the users who depend on them (R57 p.414).' },
      { kind: 'para', text: 'The course method for finding a change’s impact uses the N²: a change to one interface touches its two ends, so every interface in those two rows and columns is a candidate, and engineering judgment narrows the candidates to the ones the change actually reaches.' },
      { kind: 'steps', items: [
        { label: 'Request', text: `${CHANGE_REQUEST.id}: ${CHANGE_REQUEST.change.toLowerCase()}, ${CHANGE_REQUEST.why}.` },
        { label: 'Neighbours', text: `${CHANGE_REQUEST.interface} joins the aircraft and the chargers; the interfaces in those rows and columns are ${list(CHANGE_REQUEST.neighbours)}.` },
        { label: 'Reach', text: CHANGE_REQUEST.reaches.map((r) => `${r.id}: ${r.why}`).join('; ') + '.' },
        { label: 'Decide', text: `The owners, ${list(CHANGE_REQUEST.owners)}, plus the utility through the grid reach: ${CHANGE_REQUEST.decision}` },
      ] },
      { kind: 'figure', slide: 'w5s2-change-control' },
    ],
  },
  {
    id: 'w5-lesson-security',
    title: 'Interface security: trust boundaries and protection',
    sources: [R('R25', '1229'), R('R25', '1231'), R('R25', '1234'), R('R54', '331'), R('R24', '1205'), R('R24', '1206'), R('R24', '1207')],
    blocks: [
      { kind: 'para', text: 'SEBoK’s systems security article explains why interfaces carry most of the exposure: most systems are part of a larger system of systems or enterprise, and adversity often comes through or from these connected systems (R25 p.1234). It defines the loss to guard against for data: data and information are protected from loss due to unauthorized alteration, exfiltration, infiltration and destruction (R25 p.1231). And a secure system enforces constraints based on rules that define the only authorized interactions (R25 p.1229). At an interface, the definition is that rule.' },
      { kind: 'para', text: 'The course turns this into a rule you can apply to every row, a course convention. An interface crosses a **trust boundary** when one end is external, its two ends have different owners, one end accepts public input, the medium between them is a public network, or the medium is radio or another medium outsiders can reach: MITRE’s hidden external interface over the airwaves (R54 p.331), whoever owns the radios. A wired network the enterprise may lease makes a possible crossing: the hidden external interface again. Every crossing interface states its protection, or the reason it needs none. A power cable carries no data, and saying so is a complete answer.' },
      { kind: 'figure', slide: 'w5s2-trust-boundaries' },
      { kind: 'para', text: 'SEBoK’s resilience taxonomy supplies the measures. Preserve integrity, remaining complete and unaltered, with examples such as tamper-proof logging and cryptographic signatures (R24 pp.1205–1206); constrain, limiting the propagation of damage, with fault containment and firewalls as examples (R24 p.1205). Among its architecture techniques: boundary enforcement; domain separation, isolating items with different protection needs; diversification, including diverse communication paths; defense in depth (R24 p.1206); least privilege, giving elements only the authorizations their functions need; and loose coupling (R24 p.1207). Placed on an interface they become concrete: authenticate the sender, check every message for alteration, separate the public front end from the safety function, let each sender write only what it owns, reject messages outside the agreed format, rate or age, and keep a local interlock that acts without the interface at all.' },
      { kind: 'figure', slide: 'w5s2-protection' },
    ],
  },
  {
    id: 'w5-lesson-degraded',
    title: 'Degraded modes, and the AeroLink interfaces read for security and resilience',
    sources: [R('R24', '1205'), R('R24', '1207'), R('R25', '1233')],
    blocks: [
      { kind: 'para', text: 'Protection lowers the chance of a bad or missing message; it does not remove it. SEBoK’s resilience objectives include degrading gracefully, moving to a desirable state after degradation so that partial function remains instead of total failure, and continuing to deliver required capability while and after being stressed, with fail-safe, backup and redundant capability as examples (R24 p.1205); fail soft prioritizes and gradually ends affected functions when failure is imminent (R24 p.1207). The security article frames the same aim as limiting loss: limiting its dispersion, the cascading of effects, and its duration, through recovery or delay (R25 p.1233).' },
      { kind: 'para', text: 'The course’s degraded-mode column asks, for every interface, what each side does when it fails. For safety data the strong default is fail safe: treat a missing status as the unsafe value, so a missing go or no-go status is read as no-go and a missing forecast as a hold. For other data, continue on the last valid value for a stated time, then stop and tell the users. Decide it at design time; at the moment of failure nobody has time to design.' },
      { kind: 'figure', slide: 'w5s2-degraded' },
      { kind: 'para', text: `On AeroLink, ${COUNTS.crossing.length} of the ${COUNTS.all.total} interfaces cross a trust boundary; ${list(possible)} ${verb(possible, 'crosses', 'cross')} only if a ground-network segment is leased; ${list(none)} ${verb(none, 'crosses', 'cross')} none. The two interfaces over the air-ground radio datalink cross whoever owns the radios, so both authenticate their messages. The booking link is the instructive case: both ends belong to AeroLink, yet it crosses, because the booking platform accepts public input. Its protection is the condition the Week 4 platform decision set: domain separation of the booking front end from dispatch, with every assignment message authenticated and integrity-checked.` },
      { kind: 'table', header: ['Interface', 'Crosses a trust boundary because', 'Main protection, or why none'], rows: INTERFACES.map((x) => [`${x.id} ${x.name}`, crossText(x.id), x.protection.length ? `${x.protection[0]}${x.protection.length > 1 ? ` (and ${x.protection.length - 1} more)` : ''}` : 'none needed: no data cross, or one owner on both sides']), caption: 'Security attributes of every AeroLink interface (FICTIONAL; proposed). The trust-boundary reasons are computed from the ends, owners and media; every degraded mode is in the full interface table on the worked-examples page.' },
      { kind: 'figure', slide: 'w5s2-worked-security' },
    ],
  },
  {
    id: 'w5-lesson-audit',
    title: 'Auditing the interface set',
    sources: [R('R22', '630'), R('R55', '369')],
    blocks: [
      { kind: 'para', text: 'An interface set is audited through four lenses. Coverage: is every crossing flow carried? Externals: does every external element have an interface or a recorded reason? Hidden paths: which interfaces run over a medium the enterprise may not own, and which exchanges have no interface at all? Verification: which interfaces have a verification case? The last lens rests on SEBoK’s integration checklist: every interface and interaction between implemented elements is verified (R22 p.630). The second rests on MITRE’s: all external interfaces are included (R55 p.369).' },
      { kind: 'figure', slide: 'w5s2-audit' },
      { kind: 'table', header: ['Finding', 'Where', 'What was found', 'Disposition', 'Owner'], rows: FINDINGS.map((f) => [f.id, f.where, f.finding, f.disposition, f.owner]), caption: 'Findings of the AeroLink interface audit (FICTIONAL).' },
      { kind: 'table', header: ['External element', 'Why it has no interface'], rows: Object.entries(EXTERNAL_DISPOSITIONS).map(([id, why]) => [id, why]), caption: 'External elements with no interface, each with its recorded reason.' },
      { kind: 'para', text: `Two findings deserve a second look. The charger risk from Week 3 says chargers are configured remotely, yet no information item or interface carries configuration to them: a security risk exposed a missing interface. And only ${COUNTS.verified.length} of ${COUNTS.all.total} interfaces have a verification case; each row therefore names a planned method, and Week 12 writes the cases.` },
    ],
  },
  {
    id: 'w5-lesson-coupling',
    title: 'Integration aggregates and the coupling count',
    sources: [R('R22', '630'), R('R22', '631'), R('R20c', '599')],
    blocks: [
      { kind: 'para', text: `SEBoK uses the coupling matrix for integration: group the implemented elements into aggregates so that the number of interfaces to verify between aggregates is minimized; when an element is added and an error appears, the matrix helps place the fault in the element, the aggregate or the interfaces (R22 p.631). Counted on AeroLink’s interfaces, grouping by owner leaves ${g1.n.between.length} internal interfaces between the aggregates; grouping the aircraft with the chargers first leaves ${g2.n.between.length}, because the energy interface and the charge handshake are verified inside the first aggregate. The ${g1.n.external} external interfaces are verified with their external parties, which needs their time and agreement. The count has a limit: one aggregate holding everything leaves zero interfaces between aggregates and teaches nothing about order. Compare groupings of similar size, and weigh the interfaces between aggregates against the size of the largest aggregate and the order in which the owners can deliver their elements.` },
      { kind: 'figure', slide: 'w5s2-integration' },
      { kind: 'heading', text: 'The coupling count Week 4 deferred' },
      { kind: 'para', text: `Week 4 chose one operations platform over distributed dispatch on qualitative grounds and left a quantitative test for this week. The test uses a course metric, labeled as such, because no source in the collection defines a numerical coupling measure; SEBoK supports only the aims of fewer interfaces and modularity (R20c p.599). Over the ${A.E} function-to-function information flows of the Week 4 functions, a flow crosses when its two functions sit on different physical elements; X counts them, κ = X ÷ E, and P counts the element pairs joined by at least one crossing flow. This X is smaller than the ${COUNTS.crossingFlows} crossing flows of Session 1 because it leaves out the flows to and from external elements: both counts are right, for different sets.` },
      { kind: 'table', header: ['Measure', 'One platform (chosen)', 'Distributed dispatch'], rows: [
        ['Flows E', String(A.E), String(B.E)],
        ['Crossing flows X', String(A.X), String(B.X)],
        ['κ = X ÷ E', f2(A.kappa), f2(B.kappa)],
        ['Element pairs P', String(A.P), String(B.P)],
        ['Most partners', `${A.Dmax} (${list(A.atMax)})`, `${B.Dmax} (${list(B.atMax)})`],
        ['Crossing pairs with no information interface', String(uncoveredPairs(A.pairs).length), String(uncB.length)],
      ], caption: 'The coupling count of the Week 4 decision’s two alternatives (course metric; FICTIONAL).' },
      { kind: 'figure', slide: 'w5s2-coupling' },
      { kind: 'para', text: 'On κ and P the chosen platform is less coupled (the most partners of one element are equal), a number that supports the Week 4 decision. Now the limits, which matter as much as the result. The count treats all flows alike, though the go or no-go status carries a safety interlock. The six vertiports are one element, hiding the site-to-site coordination distributed dispatch would need. The flow set was written for the chosen design. Most of all, the chosen design concentrates its partners at the operations center: that is concentration risk, located exactly where the platform-outage risk sits. SEBoK lists modularity and resilience as separate aims (R20c p.599); here they pull apart, and a reviewer should see both.' },
    ],
  },
  {
    id: 'w5-lesson-limits',
    title: 'Limits of the method, and what Week 5 feeds',
    sources: [R('R20c', '597'), R('R57', '413'), R('R71', '18')],
    blocks: [
      { kind: 'para', text: 'The N² shows that an interface exists, not that it performs: in Week 4 a path from maintenance to dispatch existed, yet nothing said whether status arrived within two minutes. This week allocated that time across the two hops.' },
      { kind: 'para', text: `The budget has one design decision in it. ${LATENCY_BUDGET.holdNote} ${LATENCY_BUDGET.linkLossNote}` },
      { kind: 'table', header: ['Leg', 'Where', 'Seconds'], rows: [...LATENCY_BUDGET.legs.map((l) => [l.leg, l.where, String(l.seconds)]), ['Margin', '—', String(LATENCY_BUDGET.margin)]], caption: `The ${LATENCY_BUDGET.limitS} s of REQ-SYS-008 allocated along the path (FICTIONAL; values proposed).` },
      { kind: 'para', text: 'The typing, the table columns and the trust-boundary rule are course conventions: SEBoK treats all of these as physical interfaces in the binding sense (R20c p.597), and MITRE asks for a consistent attribute set without prescribing one (R57 p.413). No interface control document template is held in the collection, so the table is a teaching form; in practice you will meet an organization’s own template. Human–system interfaces, how passengers and staff use the system, have no dedicated source here and are modeled as use cases in Week 10.' },
      { kind: 'para', text: 'What the week feeds is set out below. In Week 11 your components become part definitions and usages, the ends of each interface become ports, interfaces become interface definitions and connections, and what crosses becomes flows of items; the SysML v2 textual notation introduction covers these from its slide 18 (R71 sl.18), read in Week 11. Keep your IDs stable: they are the import keys.' },
      { kind: 'table', header: ['Artifact', 'Week', 'How it is used'], rows: FEEDS_FORWARD_W5.map((f) => [f.artifact, f.week, f.how]), caption: 'Where Week 5’s artifacts go.' },
      { kind: 'figure', slide: 'w5s2-feeds' },
    ],
  },
]

export const WEEK5_SESSION2: Lecture = {
  week: 5,
  session: 2,
  title: 'Components / Interfaces',
  subtitle: 'Session 2: Managing, protecting and integrating interfaces',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ F. managing (17 min)
    {
      id: 'w5s2-managing',
      title: 'Managing interfaces',
      slides: [
        {
          id: 'w5s2-warmup',
          title: 'Warm-up: three questions from Session 1',
          purpose: 'Retrieval of typing, the medium and the hidden external interface before new material.',
          minutes: 3,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['**1** · The pad-slot agreement between the vertiport operators and AeroLink: which kind, and what crosses it?', '**2** · Why does the communications network have no interface of its own on the N²?', '**3** · What turns an internal interface into a hidden external one?'] },
          ],
          sources: [R('R55', '369')],
          notes: {
            teach: [
              'Give ninety seconds to write answers alone, then reveal one at a time and ask for a show of hands on each.',
              'One: organizational; nothing crosses it, it records duties; the data between the same two parties travel on the information interface beside it. Two: the network is the medium of the information interfaces, not an end of any, so its row is empty for a good reason. Three: a medium the system does not own: two of our elements talking over someone else’s network have a hidden external interface (R55 p.369).',
            ],
            why: 'Retrieval at the start of a session strengthens recall of the last session and shows the instructor which idea needs a second pass before management builds on it.',
            transition: 'Defining interfaces is half the work. The other half is keeping them defined while everything around them changes.',
            timing: '3 min: 1.5 min write, 1.5 min reveal.',
          },
        },
        {
          id: 'w5s2-why-manage',
          title: 'Why interfaces are managed, not just defined',
          purpose: 'Ground interface management in the DoD process and MITRE’s use of interface attributes as constraints on change.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-why-manage',
            caption: 'Interface management as a loop: define, control, communicate, verify, and back to define as knowledge grows.',
            alt: 'A four-step loop drawn as a circle of arrows: define (interface specifications), control (changes under configuration management), communicate (to the owners of affected elements), verify (compliance and tests). An arrow returns from verify to define; the center of the loop reads iterative as design matures.',
          },
          body: [
            { kind: 'bullets', items: ['Identify, define, manage and ensure compliance of internal and external interfaces', 'Poor interface control degrades performance, affordability, sustainability, maintainability', 'Interface attributes act as constraints on design change', 'Iterative: refined as the design matures'] },
          ],
          sources: [R('R47', '138'), R('R47', '139'), R('R57', '411')],
          notes: {
            teach: [
              'The DoD guidebook: the interface management process provides a framework to identify, define, manage and ensure compliance with internal and external interfaces, and helps ensure that all interface requirements and their changes are captured under the program’s configuration management plan (R47 p.138).',
              'Why it matters: as complexity grows and the number of interfaces can no longer be managed effectively, poor interface configuration control degrades performance, affordability, sustainability and maintainability. Interface management is iterative: lower-level interfaces are defined and refined as knowledge of the system grows (R47 p.139).',
              'MITRE gives the purpose in one line: use the interface’s performance, functional and physical attributes as constraints on design changes, so that the interface stays usable by a growing and changing body of users (R57 p.411). Your table is not a description to file; it is the boundary every later change must respect.',
            ],
            why: 'Students who think the table is finished when it is written lose the point of Session 2: the table is what lets two owners change their own sides without breaking each other.',
            figure: 'Go round the loop once, naming the product of each step; then the return arrow: the loop runs again every time the design matures.',
            misconceptions: [{ claim: 'Once the interface is defined, the work is done.', correction: 'Definition is the first of four activities. Without control and communication, each side drifts and the definition stops being true (R47 pp.138–139).' }],
            transition: 'Who runs that loop when the two sides belong to different organizations?',
            timing: '3 min: 1 min DoD process, 1 min why, 1 min MITRE.',
          },
        },
        {
          id: 'w5s2-governance',
          title: 'Governance and the interface control working group',
          purpose: 'Explain why loosely coupled enterprises need more governance, and what an ICWG is and when to use one.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-governance',
            caption: `AeroLink’s proposed interface control working group: one seat for each owner of an interface that joins two organizations, ${ICWG.members.length} in all, with the number of cross-owner interfaces each seat shares. (FICTIONAL; proposed)`,
            alt: `A round table with ${ICWG.members.length} labeled seats: ${list(ICWG.members)}. Each seat shows how many of the ${ICWG.interfaces.length} cross-owner interfaces (${list(ICWG.interfaces)}) that organization shares.`,
          },
          body: [
            { kind: 'bullets', items: ['Loosely coupled architectures need more governance, not less', 'ICWG: technical representatives of the interfacing activities', 'Its purpose: interface issues engineer-to-engineer contact cannot resolve', 'The interface management plan lists interfaces, standards and tests'] },
          ],
          sources: [R('R57', '412'), R('R57', '414'), R('R47', '140')],
          notes: {
            teach: [
              'MITRE’s first rule of practice: don’t underestimate the need for governance. Complex systems have numerous interfaces of various types; without governance, interface sprawl and variation degrade performance, maintainability and sustainability, and interface management is considerably harder in loosely coupled architectures (R57 p.412). An enterprise of several owners is exactly that.',
              'The instrument is an interface control working group: a specialized integrated product team of cognizant technical representatives from the interfacing activities, whose sole purpose is to solve interface issues that cannot be resolved through simple engineer-to-engineer interaction (R57 p.414). The DoD guidebook says the program manager should establish one, as a forum to develop interface requirements and resolve issues on time, and that the interface management plan documents the internal and external interfaces, the preferred standards and the tests applicable to each (R47 p.140).',
              `AeroLink: the working group seats every owner of an interface that joins two organizations. Computed from the interface table, that is ${ICWG.members.length} organizations: ${list(ICWG.members)}.`,
            ],
            why: 'Students in enterprise teams own only part of their interfaces. Knowing that the other side has a seat, and when an issue goes to the group rather than to a phone call, is what makes their interface table enforceable.',
            figure: 'Go round the table, naming each seat and how many interfaces it shares. Point at the public agencies at the table: the air traffic service and the emergency services cannot be instructed, only agreed with.',
            misconceptions: [{ claim: 'An ICWG is a meeting for every interface question.', correction: 'Most issues are settled engineer to engineer. The group exists for the issues that cannot be (R57 p.414), and for the agreements that bind two owners.' }],
            transition: 'What the group agrees on is usually a standard and a service level.',
            timing: '4 min: 1 min governance, 1.5 min the ICWG, 1.5 min AeroLink’s seats.',
          },
        },
        {
          id: 'w5s2-standards',
          title: 'Standards and service-level agreements',
          purpose: 'Teach standards-based interfaces as the enabler of technology insertion, and service levels as the content of organizational interfaces.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-standards',
            caption: 'A standard interface lets today’s charger and a future one plug into the same socket; a service-level agreement says what each side may expect.',
            alt: 'A charger socket drawn as a standard outline, with two plugs approaching it: one labeled today’s charger, one labeled future charger, both matching the outline. Beside it, an agreement card with four fields: parties, obligations, service level, review date.',
          },
          body: [
            { kind: 'bullets', items: ['Standards-based interfaces support interoperability and reuse', 'Standard interfaces enable modular open systems and future technology insertion', 'Service-level agreements state the performance each side may expect', 'An organizational interface is managed by its agreement'] },
          ],
          sources: [R('R57', '413'), R('R47', '139'), R('R20c', '596')],
          notes: {
            teach: [
              'MITRE: always adhere to standards; standards-based interfaces minimize specialty development and improve the likelihood of reuse. And establish service-level agreements for interfaces: document the performance parameters of the interface, then report performance against them; an agreement binds the provider as much as the user (R57 p.413).',
              'The DoD guidebook connects standards to the future: interface specifications that comply with widely supported, consensus-based standards enable a modular open systems approach, and modular systems with standardized interfaces facilitate future technology insertion and refresh (R47 p.139). SEBoK adds that interface standards can be key enablers of families of systems, technology insertion and interoperability (R20c p.596).',
              'This is the bridge to Week 6. Your evolution roadmap inserts new technology; every insertion point is an interface, and a standard interface is what makes the insertion cheap. AeroLink’s charging connector is the example: its table row names a published connector standard, to be selected.',
            ],
            why: 'Teams treat standards as a compliance chore. Seeing them as what makes next year’s upgrade possible, and service levels as what makes an organizational interface checkable, motivates both columns.',
            figure: 'Two plugs, one socket outline: that is technology insertion. Then the agreement card: the four fields an organizational interface needs.',
            misconceptions: [{ claim: 'A custom interface optimized for today is better than a standard one.', correction: 'It may perform better today, but every future supplier must match it. Standard interfaces facilitate technology insertion and refresh (R47 p.139).' }],
            transition: 'Standards change too. Before you advance, read the change request aloud: raise the turnaround chargers’ power so that the dispatch threshold is reached in 15 min instead of 20. Pairs, one minute: which other interfaces could it affect? Then advance.',
            timing: '3 min: 1 min MITRE, 1 min DoD and SEBoK, 1 min the bridge.',
          },
        },
        {
          id: 'w5s2-change-control',
          title: 'Worked example I: one interface change, traced through the N²',
          purpose: 'Apply change control once: find the impact of a change from the N² row and column, then decide with the owners.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w5s2-change-control',
            caption: `Change ${CHANGE_REQUEST.id} to ${CHANGE_REQUEST.interface}: the rows and columns of its two ends show ${CHANGE_REQUEST.neighbours.length} neighbouring interfaces; two of them and one requirement are actually reached. (FICTIONAL; proposed)`,
            alt: `The AeroLink N² with the rows and columns of PHY-001 and PHY-003 shaded. The changed interface ${CHANGE_REQUEST.interface} is outlined. The neighbouring interfaces in the shaded rows and columns are marked: ${list(CHANGE_REQUEST.neighbours)}. The interfaces the change reaches are filled: ${list(CHANGE_REQUEST.reaches.filter((r) => r.id.startsWith('IF-')).map((r) => r.id))}; the other neighbours are outlined only. A legend at the lower left names the four marks.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Request', text: 'state the change to one interface' },
                { label: 'Neighbours', text: 'read the rows and columns of its two ends' },
                { label: 'Reach', text: 'judge which neighbours and requirements it affects' },
                { label: 'Decide', text: 'the owners decide; baseline the new version' },
              ],
            },
          ],
          sources: [R('R47', '138'), R('R47', '139'), R('R36', '498'), R('R36', '499'), R('R57', '414')],
          notes: {
            teach: [
              'Take the pairs’ answers to the question posed before you advanced, before pointing at the chart. Then show the method: the change touches two ends, so the candidates are every interface in those two rows and columns.',
              'Sources for the control step: interface requirements and their changes are captured under the configuration management plan (R47 p.138), and key interfaces can be managed as separate configuration items (R47 p.139). SEBoK: a configuration baseline is a formally approved snapshot that serves as the starting point for further changes (R36 p.498), and the functional baseline includes the interface characteristics (R36 p.499). MITRE: plan to deprecate prior versions without stranding their users (R57 p.414). The N² method of finding neighbours is the course’s.',
            ],
            workedSolution: [
              `Step 1, request. ${CHANGE_REQUEST.id}: ${CHANGE_REQUEST.change.toLowerCase()}, ${CHANGE_REQUEST.why}.`,
              `Step 2, neighbours. ${CHANGE_REQUEST.interface} joins the aircraft and the chargers. The interfaces in those two rows and columns are ${list(CHANGE_REQUEST.neighbours)}: computed from the chart, so none is forgotten.`,
              `Step 3, reach. ${CHANGE_REQUEST.reaches.map((r) => `${r.id}: ${r.why}`).join('; ')}. The others are unaffected: the pad interface, the flight-following datalink and the health link carry nothing that depends on charging power.`,
              `Step 4, decide. Two owners sit on ${CHANGE_REQUEST.interface}, ${list(CHANGE_REQUEST.owners)}, and the grid reach brings in the utility; so it goes to ${CHANGE_REQUEST.decider}. Decision: ${CHANGE_REQUEST.decision}`,
            ],
            why: 'Students see change control as a method, not a form: the N² gives a complete list of candidates, and engineering judgment narrows it to what the change reaches.',
            figure: 'Point at the shaded rows and columns of the two ends and the outlined interface, then at each neighbour: the two filled cells are the interfaces the change reaches; say why the three outlined only are not. The third item reached is a requirement, so it is in the notes, not on the chart. The legend at the lower left names the marks.',
            misconceptions: [{ claim: 'A change to an interface affects only its two ends.', correction: 'It can reach every interface of either end. Here a charger change reaches the grid connection, and through it the utility, who was not a party to the interface changed.' }],
            transition: 'Now the part of interfaces that adversaries care about: who can reach across them.',
            timing: '4 min: 1 min pair answers, 1 min the sources, 2 min the four steps.',
          },
        },
      ],
    },
    // ============================================================================================ G. security and resilience (14 min)
    {
      id: 'w5s2-security',
      title: 'Interface security and resilience',
      slides: [
        {
          id: 'w5s2-trust-boundaries',
          title: 'Interface security: trust boundaries',
          purpose: 'Ground interface security in SEBoK and state the course rule for when an interface crosses a trust boundary.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-trust-boundaries',
            caption: 'Five ways an interface crosses a trust boundary: an external end, ends with different owners, a public-facing end, a public network between the ends, or a radio medium anyone with a transmitter can reach. A leased wired network makes a possible crossing.',
            alt: 'A dashed enterprise boundary containing two shaded owner zones, owner 1 and owner 2. Five numbered interfaces: 1 from an element inside to one outside the boundary, labeled external end; 2 between the two owner zones, labeled different owners; 3 from an element marked public to an internal element, labeled public-facing end; 4 between two elements of owner 1 through a cloud labeled public network; 5 between two elements of owner 2 drawn as radio waves, labeled radio. A dotted line joins two elements of owner 2 through a cloud labeled leased network, marked possible. A key at the right repeats the five numbered reasons.',
          },
          body: [
            { kind: 'bullets', items: ['Adversity often comes through or from connected systems', 'Data are protected from unauthorized alteration, exfiltration, infiltration, destruction', '**Course rule**: a crossing needs protection, or a reason it needs none', 'Which of the grid connection, the booking link and the charger data link cross?'] },
          ],
          sources: [R('R25', '1234'), R('R25', '1231'), R('R25', '1229'), R('R54', '331')],
          notes: {
            teach: [
              'SEBoK’s systems security article: most systems are part of a larger system of systems or enterprise, and adversity often comes through or from these connected systems (R25 p.1234). Interfaces are where that happens. The same article defines what a loss of data means: data and information are protected from loss due to unauthorized alteration, exfiltration, infiltration and destruction (R25 p.1231). And a secure system enforces constraints based on rules defining the only authorized interactions (R25 p.1229): at an interface, that rule is the definition.',
              'The course rule, a course convention: an interface crosses a trust boundary when one end is external, its ends have different owners, one end accepts input from the public, the medium between them is a public network, or the medium is radio or another medium outsiders can reach. The fifth reason is MITRE’s own example of a hidden external interface: radios connect subsystems via the airwaves (R54 p.331), and anyone with a transmitter can reach the airwaves whoever owns the radios. A wired network the enterprise may lease makes a possible crossing, the hidden external interface of Session 1. Every crossing interface states its protection, or the reason it needs none: a power cable needs none against data attacks, and saying so is an answer.',
              'Leave the question on the slide for pairs: the grid connection, the booking link, the charger data link. Which cross, and why? Take their answers before you advance; the worked example on the next slide gives the model answers.',
            ],
            why: 'A rule students can apply to every row turns “think about security” into a column they cannot leave blank, and the reason-for-none option keeps it from becoming a ritual.',
            figure: 'Number by number: external end, different owners, public-facing end, public network, radio. Then the dotted line: possible, until you know who owns the network.',
            misconceptions: [{ claim: 'Internal interfaces are trusted, so they need no protection.', correction: 'An interface between two owners, or with one end open to the public, is a boundary even inside the enterprise. AeroLink’s booking platform faces the public; its link to dispatch is a trust boundary.' }],
            transition: 'What does protection at an interface look like?',
            timing: '4 min: 1.5 min SEBoK, 1.5 min the rule, 1 min the pair question.',
          },
        },
        {
          id: 'w5s2-protection',
          title: 'Protection at the interface: integrity, authentication, separation',
          purpose: 'Map SEBoK’s resilience techniques onto interface protection measures.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-protection',
            caption: 'Protection measures placed on one information interface: checks at the sending end, along the path and at the receiving end, and a local interlock that does not depend on the interface at all.',
            alt: 'Two element boxes joined by a message arrow. At the sending box: authenticate the sender, least privilege. On the arrow: integrity check, encryption for personal data. At the receiving box: boundary enforcement, reject malformed or out-of-date messages. Around the receiving box a dashed wall labeled domain separation, with a public front end outside it. Under the receiving box, a separate local interlock with no arrow to the interface.',
          },
          body: [
            { kind: 'bullets', items: ['**Authenticate** the sender; **integrity-check** every message', '**Domain separation**: isolate items with different protection needs', '**Least privilege**; **boundary enforcement** on format and rate', '**Defense in depth**: a local interlock that acts without the interface'] },
          ],
          sources: [R('R24', '1205'), R('R24', '1206'), R('R24', '1207')],
          notes: {
            teach: [
              'SEBoK’s resilience taxonomy supplies the vocabulary. Preserve integrity: remain complete and unaltered, with examples such as tamper-proof logging and cryptographic digital signatures (R24 pp.1205–1206). Constrain: limit damage propagation, with examples such as fault containment and firewalls (R24 p.1205).',
              'Its architecture techniques: boundary enforcement, implementing the limits that protect the system; domain separation, physically or logically isolating items with different protection needs; diversification, including diverse communications paths; defense in depth, several coordinated mechanisms (R24 p.1206). And least privilege, elements given only the authorizations their functions need; loose coupling, minimizing interdependency to limit the propagation of damage (R24 p.1207).',
              'Placed on an interface: authenticate the sender and check every message for alteration; separate the public front end from the safety function; let the sender write only what it owns; reject messages outside the agreed format, rate or age; and keep a local interlock that stops the hazard even if the interface is subverted.',
            ],
            why: 'Students know the words encryption and firewall. Seeing each measure placed at a specific point of an interface, with its name in the source, lets them write a protection cell that a reviewer can check.',
            figure: 'Sending end, path, receiving end, then the dashed wall and the public front end outside it, then the interlock with no arrow: the measure that still works when everything else has failed.',
            misconceptions: [{ claim: 'Encrypting the link makes the interface secure.', correction: 'Encryption protects confidentiality on the path. It does not prove who sent the message, stop a valid sender from writing what it should not, or limit damage if the sender is compromised.' }],
            transition: 'Protection lowers the chance of a bad message. Degraded modes decide what happens when the interface fails anyway.',
            timing: '3 min: 1 min integrity and constrain, 1 min the techniques, 1 min placed on the interface.',
          },
        },
        {
          id: 'w5s2-degraded',
          title: 'Degraded modes at interfaces: what each side does when it fails',
          purpose: 'Teach the degraded-mode column with fail-safe defaults, grounded in SEBoK resilience and loss limitation.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-degraded',
            caption: 'An interface failure over time: normal exchange, loss detected, the degraded mode each side enters, recovery. The degraded mode is decided at design time, not at the moment of failure.',
            alt: 'A timeline with four phases. Normal: messages flowing. Loss detected: a gap with a timer. Degraded mode: the receiving side treats the missing status as the unsafe value and the dependent function stops or switches to a manual procedure. Recovery: messages resume and the system returns to normal. A band beneath reads limit the duration and the spread of the loss.',
          },
          body: [
            { kind: 'bullets', items: ['Degrade gracefully: partial function instead of total failure', '**Fail safe** (course default): treat a missing status as the unsafe value', 'Continue on the last valid value for a stated time, then stop', 'Limit the duration and the spread of the loss'] },
          ],
          sources: [R('R24', '1205'), R('R24', '1207'), R('R25', '1233')],
          notes: {
            teach: [
              'SEBoK’s resilience objectives: degrade gracefully, transitioning to desirable states after degradation so that partial useful function remains instead of complete failure; continue, delivering required capability while and after being stressed, with examples such as fail-safe, backup and redundant capability (R24 p.1205). And fail soft: prioritizing and gradually terminating affected functions when failure is imminent (R24 p.1207).',
              'The security article frames the same goal as limiting loss: by limiting its dispersion, the propagation or cascading of effects, and its duration, through loss recovery or loss delay (R25 p.1233).',
              'At an interface this becomes one column, a course convention: for every interface, what each side does when it fails. The strongest default for safety data is fail safe: a missing go or no-go status is read as no-go; a missing forecast as a hold. For other data, continue on the last valid value for a stated time, then stop and tell the users. Decide it now: at the moment of failure nobody has time to design.',
            ],
            why: 'A degraded mode written at design time is a requirement someone can test. Left unwritten, the behavior on failure is whatever the software happens to do.',
            figure: 'Left to right through the four phases. Stop at degraded mode: the missing status becomes the unsafe value. Then the band underneath: duration and spread, SEBoK’s two limits.',
            misconceptions: [{ claim: 'If an interface fails, the receiving side should keep using the last value.', correction: 'For safety data that is the dangerous choice: a stale “go” releases a faulty aircraft. Fail safe reads a missing status as the unsafe one; the last value is acceptable only where it is safe, for a stated time.' }],
            transition: 'Now all three columns, on three AeroLink interfaces.',
            timing: '3 min: 1 min SEBoK resilience, 30 s loss limits, 1.5 min the column and fail safe.',
          },
        },
        {
          id: 'w5s2-worked-security',
          title: 'Worked example II: trust boundaries, protection and degraded modes on AeroLink',
          purpose: 'Answer the pair question: apply the rule, the protection and the degraded mode to three interfaces, then read the whole set.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w5s2-worked-security',
            caption: `Three AeroLink interfaces read for security and resilience. Across all ${c16.total}, ${COUNTS.crossing.length} cross a trust boundary, ${possible.length} ${verb(possible, 'crosses', 'cross')} only if the ground network is leased, and ${none.length} ${verb(none, 'crosses', 'cross')} none. (FICTIONAL; proposed)`,
            alt: `Three cards, each with three short sections: why it crosses, its protection in brief, and its degraded mode. IF-008 booking link: crosses because of a ${reasons('IF-008')}; one protection example, domain separation; degraded: confirmed trips still fly. IF-010 charger data: crosses because of ${reasons('IF-010')}; one protection example, authenticate every charger; degraded: a missing status is read as not charged. IF-006 grid connection: crosses because of ${reasons('IF-006')}; no data, so a reason instead of protection; degraded: charging stops. A strip beneath counts ${COUNTS.crossing.length} crossing, ${possible.length} possible, ${none.length} none.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Cross?', text: 'apply the five reasons to each interface' },
                { label: 'Protect', text: 'measures matched to what crosses' },
                { label: 'Degrade', text: 'what each side does on failure' },
                { label: 'Link', text: 'the risk each treatment answers' },
              ],
            },
          ],
          sources: [R('R25', '1234'), R('R24', '1206'), R('R24', '1205')],
          notes: {
            teach: [
              'The pairs answered the question on the previous slide before you advanced: the grid connection, the booking link, the charger data link. Now read the model answers card by card.',
              'Then read the whole set from the strip: how many interfaces cross, how many only possibly, and the one that does not.',
            ],
            workedSolution: [
              `IF-008, booking platform to operations center. Both ends are AeroLink’s, so the owner reason does not apply; it crosses because of a ${reasons('IF-008')}: the booking platform takes input from the public. Protection: ${if8.protection.join('; ')}. That is the condition of the Week 4 platform decision and the treatment of the intrusion risk R-009, now written into the interface. Degraded: ${if8.degraded}`,
              `IF-010, chargers to operations center. Crosses because of ${reasons('IF-010')}: the vertiport operators own the chargers. Protection: ${if10.protection.join('; ')}. Degraded: ${if10.degraded} Linked risk: R-010, altered charger commands.`,
              `IF-006, chargers to the grid. Crosses because of ${reasons('IF-006')}. No data cross, so the protection cell gives the reason: ${if6.noProtectionReason}. Degraded: ${if6.degraded}`,
              `The whole set: ${COUNTS.crossing.length} of ${c16.total} cross a trust boundary, ${list(RADIO_INTERFACES)} among them because the radio datalink can be reached by anyone with a transmitter; ${list(possible)} ${verb(possible, 'crosses', 'cross')} only if a ground-network segment is leased; ${list(none)}, an agreement between two departments of one owner, ${verb(none, 'crosses', 'cross')} none. Every interface carrying safety-related data names an integrity or authentication measure; the reference was checked for it.`,
            ],
            why: 'The class sees the three columns used together and sees that the answer to “what protection?” depends on what crosses: a power cable and a booking message get different, equally complete answers.',
            figure: 'Card by card: reason, protection, degraded mode. Then the strip with the three counts.',
            misconceptions: [{ claim: 'Every interface that crosses a boundary needs encryption.', correction: 'The grid connection crosses two boundaries and carries no data. Its complete answer is a reason, and a degraded mode.' }],
            transition: 'You now have a full method. Use it to audit what we built.',
            timing: '4 min: 1 min pair answers, 2.5 min the three cards, 30 s the set.',
          },
        },
      ],
    },
    // ============================================================================================ H. audit and integration (11 min)
    {
      id: 'w5s2-audit-integration',
      title: 'Auditing, integrating and comparing',
      slides: [
        {
          id: 'w5s2-audit',
          title: 'Auditing the interface set: four lenses',
          purpose: 'Pairs audit AeroLink’s set with four lenses before the instructor gives the findings.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-audit',
            caption: 'The four audit lenses applied to the interface set: coverage, externals, hidden paths, verification. Find the gaps before the findings are read out.',
            alt: 'The AeroLink interface N² with four labeled lenses drawn over it as magnifying glasses: coverage (is every crossing flow carried?), externals (does every external element have an interface or a reason?), hidden paths (which interfaces run over a medium we may not own, and which exchanges have no interface at all?), verification (which interfaces have a verification case?). No findings are marked.',
          },
          body: [
            { kind: 'bullets', items: ['**Coverage**: is every crossing flow carried?', '**Externals**: an interface or a reason for each?', '**Hidden paths**: media we may not own; exchanges with no interface', '**Verification**: which interfaces have a case?'] },
          ],
          sources: [R('R22', '630'), R('R55', '369')],
          notes: {
            teach: [
              'Pairs, two minutes, with the interface table handout: one lens each, then swap. Ask for one finding per lens, then read the model answers.',
              `Coverage: every crossing flow is carried now; the one that was not, the incident records, closed in Session 1. Externals: ${Object.keys(EXTERNAL_DISPOSITIONS).length} externals still have no interface, each with a recorded reason; the spares supply now has an organizational interface under the purchase agreement. Hidden paths: ${HIDDEN_EXTERNAL.length} interfaces run over the communications network, whose ownership is open (${finding('F6').disposition}); and the charger risk says chargers are configured remotely, yet no interface carries configuration (${finding('F5').disposition}).`,
              `Verification: only ${COUNTS.verified.length} of ${c16.total} interfaces have a verification case, ${list(COUNTS.verified)}. SEBoK says every interface and interaction between implemented elements is verified (R22 p.630); each row therefore names a planned method, and the cases come in Week 12. One more, for discussion: passengers learn of disruptions through the booking app, a human–system interface the set does not list (${finding('F8').disposition})`,
            ],
            why: 'Auditing their own method’s output is what turns students from table-fillers into reviewers. The configuration-path finding shows that a security risk can expose a missing interface.',
            figure: 'Point at each lens in turn and read its question. Nothing is marked: the class marks the findings.',
            misconceptions: [{ claim: 'A table with every column filled is a complete interface set.', correction: 'Completeness is about what is missing: flows with no interface, externals with no answer, paths nobody owns. The table cannot show those; the audit lenses can.' }],
            transition: 'Integration uses the same chart to decide the order in which interfaces are verified.',
            timing: '4 min: 2 min pairs, 2 min model answers.',
          },
        },
        {
          id: 'w5s2-integration',
          title: 'Integration: aggregates from the N²',
          purpose: 'Show how the N² groups elements into integration aggregates and what that implies for verification order.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-integration',
            caption: `Two groupings of AeroLink’s eight physical elements into integration aggregates. By owner, ${g1.n.between.length} internal interfaces lie between aggregates; aircraft and charging first, ${g2.n.between.length}. The ${g1.n.external} external interfaces are verified with their external parties. (FICTIONAL)`,
            alt: `Two panels. Left, ${g1.g.name}: aggregates ${g1.g.aggregates.map((a) => a.join(', ')).join(' and ')}, with the between-aggregate interfaces ${list(g1.n.between)} drawn across the gap. Right, ${g2.g.name}: aggregates ${g2.g.aggregates.map((a) => a.join(', ')).join(' and ')}, with ${list(g2.n.between)} across the gap.`,
          },
          body: [
            { kind: 'bullets', items: ['Group elements so that fewer interfaces lie between aggregates', 'Verify inside each aggregate, then the interfaces between them; compare groupings of similar size', 'No element or interface forgotten; every one verified', 'External interfaces: with the external party'] },
          ],
          sources: [R('R22', '630'), R('R22', '631')],
          notes: {
            teach: [
              'SEBoK: reorganize the coupling matrix to group the implemented elements into aggregates, minimizing the number of interfaces to be verified between aggregates; and when verifying between aggregates, the matrix helps locate faults: a fault found when an element is added belongs to that element, the aggregate or the interfaces (R22 p.631). Its checklist adds that no system element or physical interface set out in the design is forgotten, and every interface and interaction is verified (R22 p.630).',
              `On AeroLink, two candidate groupings, counted from the interface set. By owner: ${g1.n.between.length} internal interfaces between the aggregates. Aircraft and charging first: ${g2.n.between.length}. The second wins on SEBoK’s criterion, because the energy interface and the charge handshake are verified inside the first aggregate, before anything else depends on them. The ${g1.n.external} external interfaces are verified with the external parties, which needs their time and their agreement: plan it early.`,
              'Integration implication of the hub: whatever the grouping, the operations center touches most interfaces, so it is integrated early or simulated, or every other aggregate waits for it.',
              'Say the limit of the criterion: one aggregate holding everything leaves zero interfaces between aggregates and is no plan at all. Compare groupings of similar size, and weigh the interfaces between aggregates against the size of the largest aggregate and the order in which the owners can deliver.',
            ],
            why: 'Students see that the N² is not only a design check but the plan for integration and verification, which is where Week 12 picks it up.',
            figure: 'Left panel: count the crossings with the class. Right panel: count again. Then point at the externals, verified apart.',
            misconceptions: [{ claim: 'Integration order is a scheduling decision only.', correction: 'It is an engineering one: grouping by the N² decides how many interfaces must be verified at once, and how easily a fault can be located (R22 p.631).' }],
            transition: 'Last analysis: Week 4 chose one operations platform. Can the N² now put a number on that choice?',
            timing: '3 min: 1 min SEBoK, 1.5 min the two groupings and the size limit, 30 s the hub.',
          },
        },
        {
          id: 'w5s2-coupling',
          title: 'Worked example III: the coupling count Week 4 deferred',
          purpose: 'Compute the course coupling metric for the Week 4 decision’s two alternatives and state what it cannot see.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w5s2-coupling',
            caption: `Two allocations of the same ${A.E} function flows. One platform (chosen): ${A.X} cross, κ = ${f2(A.kappa)}, ${A.P} element pairs. Distributed dispatch: ${B.X} cross, κ = ${f2(B.kappa)}, ${B.P} pairs. Course metric. (FICTIONAL)`,
            alt: `Two side-by-side panels. Left, one operations platform: X = ${A.X} of ${A.E}, κ = ${f2(A.kappa)}, P = ${A.P}, most partners ${A.Dmax} at ${list(A.atMax)}. Right, distributed dispatch at the vertiports: X = ${B.X} of ${B.E}, κ = ${f2(B.kappa)}, P = ${B.P}, most partners ${B.Dmax} at ${list(B.atMax)}; ${uncB.length} of its pairs marked as having no information interface.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Define', text: 'E flows; X crossing; κ = X ÷ E; P pairs' },
                { label: 'Compute', text: 'each alternative on the same flows' },
                { label: 'Compare', text: 'and check crossings against interfaces' },
                { label: 'Limit', text: 'say what the count cannot see' },
              ],
            },
          ],
          sources: [R('R20c', '599'), R('R22', '631')],
          notes: {
            teach: [
              'The metric is the course’s, and say so first: no source in the collection defines a numerical coupling measure. SEBoK supports only the aim of fewer interfaces and modularity (R20c p.599) and the use of the coupling matrix in integration (R22 p.631).',
              `Two crossing counts are on the record and both are right: Session 1 counted ${COUNTS.crossingFlows} crossing flows, including the flows to and from external elements; this count uses only the flows from one Week 4 function to another, so it is smaller. Define before computing: E is the number of function-to-function information flows; a flow crosses when its two functions sit on different physical elements; X is the number that cross; κ is X divided by E; P is the number of element pairs joined by at least one crossing flow, each of which needs an interface.`,
            ],
            workedSolution: [
              `Step 1, define. The flows are the ${A.E} function-to-function information inputs of the Week 4 functions. Alternative A is the Week 4 allocation, one platform; alternative B moves matching and dispatch to the vertiports, the option the Week 4 decision rejected.`,
              `Step 2, compute. A: ${A.X} of ${A.E} cross, κ = ${f2(A.kappa)}, ${A.P} pairs, the most partners ${A.Dmax} at ${list(A.atMax)}. B: ${B.X} cross, κ = ${f2(B.kappa)}, ${B.P} pairs, the most partners ${B.Dmax} at ${list(B.atMax)}.`,
              `Step 3, compare. On κ and P, A is less coupled: a number that supports the Week 4 decision. Checked against the interface set, every crossing pair of A has an information interface; ${uncB.length} of B’s pairs have none (${list(uncB)}), so B would need its own interface design before a fair comparison.`,
              'Step 4, limit. The count treats every flow alike, but the go or no-go status carries a safety interlock; the six vertiports are one element, hiding the site-to-site traffic distributed dispatch would need; and the flow set was written for the chosen design. Most of all, A concentrates its partners at the operations center, exactly where the outage risk sits: SEBoK lists modularity and resilience as separate aims (R20c p.599), and here they pull apart.',
            ],
            why: 'Students see a qualitative decision tested with a defined number, and see the number’s blind spots named, which is what the graduate task asks of them.',
            figure: 'Left panel, then right: X, κ, P, and the most-partnered element. Point at B’s marked pairs: crossings with no interface yet.',
            misconceptions: [{ claim: 'The lower κ is the better architecture.', correction: 'It is the less coupled one by this count. Whether it is better depends on what the count cannot see: criticality, aggregation and concentration risk.' }],
            transition: 'Before the lab, the limits of the whole method.',
            timing: '4 min: 1 min definitions, 1 min compute, 1 min compare, 1 min limits.',
          },
        },
      ],
    },
    // ============================================================================================ I. limits and bridge (5 min)
    {
      id: 'w5s2-bridge',
      title: 'Limits and what Week 5 feeds',
      slides: [
        {
          id: 'w5s2-limits',
          title: 'What the method cannot tell you',
          purpose: 'State the limits of the N², the typing, the table and the security rule honestly.',
          minutes: 2,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['The N² shows that an interface exists, not that it performs', `Latency budget: ${LATENCY_BUDGET.limitS} s = ${budget} s + ${LATENCY_BUDGET.margin} s margin; a hold precedes classification`, 'The typing, the columns and the trust-boundary rule are course conventions', 'No interface control document template is held: the table is a teaching form', 'People: passengers and staff need human–system interfaces, modeled later'] },
          ],
          sources: [R('R20c', '597'), R('R57', '413')],
          notes: {
            teach: [
              'Four limits, said plainly. First, the N² shows existence, not quality: in Week 4 an interface existed between maintenance and dispatch, yet nothing said whether status arrived within two minutes; that took a latency budget, which this week added across the two hops.',
              `The budget on the slide: fault report, hold, status to dispatch, ${budget} s, ${LATENCY_BUDGET.margin} s margin. A technician cannot classify within 30 s, so a no-go-list fault code marks the aircraft unavailable at once; that hold classifies nothing, and the technician still classifies and alone returns it to go. In a radio-link loss the 2 min cannot hold.`,
              'Second, the typing, the table columns and the trust-boundary rule are course conventions: SEBoK treats all these as physical interfaces in the binding sense (R20c p.597), and MITRE asks for a consistent attribute set without giving one (R57 p.413). Third, the collection holds no interface control document template, so the table is a teaching form; in industry you will meet an organization’s template. Fourth, human–system interfaces, how passengers and staff use the system, have no dedicated source here; Week 10 models them as use cases.',
            ],
            why: 'Naming the limits keeps students from presenting a course convention as a standard, and from treating a full N² as proof that the interfaces work.',
            misconceptions: [{ claim: 'A complete N² and table prove the interfaces will work.', correction: 'They prove the interfaces are identified and defined. Performance, timing and behavior under failure need budgets, requirements and verification.' }],
            transition: 'Where this week’s work goes next.',
            timing: '2 min: 40 s the latency budget and its hold, then about 20 s for each other limit.',
          },
        },
        {
          id: 'w5s2-feeds',
          title: 'Where this goes: Weeks 6, 7, 11 and 12',
          purpose: 'Bridge to the roadmap, the Phase I package and the Phase II physical model.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-feeds',
            caption: 'Week 5’s artifacts and the weeks that use them: insertion points for the roadmap, a package section, the physical model in SysML v2, verification, and an optional analysis in Week 13.',
            alt: `A central box labeled Week 5 components and interfaces with arrows to ${FEEDS_FORWARD_W5.length} boxes: ${FEEDS_FORWARD_W5.map((f) => `${f.week}, ${f.artifact.toLowerCase()}: ${f.how}`).join('; ')}.`,
          },
          body: [
            { kind: 'bullets', items: ['**Week 6**: insertion points are interfaces; standards make them cheap', '**Week 7**: components and interfaces join the engineering package', '**Week 11**: components become parts, ends become ports, interfaces become connections', '**Week 12**: verification cases for every interface'] },
          ],
          sources: [R('R71', '18'), R('R47', '140')],
          notes: {
            teach: [
              'Week 6, the evolution roadmap: every technology you insert must plug into an interface, so your standards column and your change request become the roadmap’s insertion points. Week 7 integrates this week into the Systems Thinking Engineering Package.',
              'Week 11 models this artifact in SysML v2. Components become part definitions and usages; the ends of an interface become ports; interfaces become interface definitions and connections between ports; what crosses becomes flows of items. The SysML v2 textual notation introduction covers connections, ports, interfaces and flows from its slide 18 (R71 sl.18); you will read it in Week 11, not now. Keep your IDs stable: they are the import keys.',
              'Week 12 turns the verification column into verification cases. The DoD guidebook’s list of what interface requirements serve, integration, maintenance and upgrades, and risk management, is the plan of the rest of the course (R47 p.140).',
            ],
            why: 'Students who know their IDs and columns will be imported into a model keep them stable and exact, and see why the degraded-mode and verification cells matter later.',
            figure: 'From the center outward, one arrow at a time, reading the artifact and the week that uses it.',
            misconceptions: [{ claim: 'Phase II starts again from scratch in a modeling tool.', correction: 'Phase II imports this week’s components and interfaces by their IDs; mistakes in the table become mistakes in the model.' }],
            transition: 'Now your team’s turn: the first N² of your own enterprise.',
            timing: '3 min: 1 min Weeks 6 and 7, 1.5 min Week 11, 30 s Week 12.',
          },
        },
      ],
    },
    // ============================================================================================ J. lab launch (22 min)
    {
      id: 'w5s2-lab',
      title: 'Laboratory launch: Lab L5',
      slides: [
        {
          id: 'w5s2-lab-brief',
          title: 'Lab L5: components, the N² and interface definitions for your enterprise',
          purpose: 'Brief the deliverables, minimums and due point.',
          minutes: 3,
          layout: 'two-column',
          body: [
            { kind: 'bullets', items: [`At least ${MIN.components} components with responsibility cards`, `An N² and at least ${MIN.interfaces} interface definitions, every column`, `At least ${MIN.requirements} interface requirements; one change request`, 'Protection and degraded mode for every interface'] },
          ],
          aside: [
            { kind: 'bullets', items: [`Team of three: ${MIN3.components} components, ${MIN3.interfaces} interfaces, ${MIN3.requirements} requirements`, 'Due before Week 6, Session 1', 'Your own enterprise', 'The tool imports your Week 4 record'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Walk the four deliverables and the minimums. Say that the minimums are the completeness check, not the target: a good record has every interface the crossing-flow check finds, not eight.',
              'Point at the lab tool: it imports the Week 4 record, builds the N² as interfaces are added, computes the degrees and the crossing-flow check, and shows each interface’s hard gates and advisories. Advisories never block; only defects do.',
            ],
            why: 'A clear brief before the team work prevents the most common lost hour: teams building a list of connections instead of definitions.',
            transition: 'Start now: the first N² from your Week 4 physical view.',
            timing: '3 min: 2 min the deliverables, 1 min the tool.',
          },
        },
        {
          id: 'w5s2-lab-n2',
          title: 'Team work: your first N²',
          purpose: 'Teams place their elements and externals on the diagonal and fill the cells from the pre-work, typing each interface.',
          minutes: 12,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s2-lab-n2',
            caption: 'A blank N² template with a 12-minute timer: physical elements, then externals, on the diagonal; one interface ID per cell with its kind.',
            alt: 'An empty upper-triangle grid of ten by ten with the diagonal cells shaded and labeled element 1 to element 10, a legend for the kinds P, I and O and an external marker, and a timer icon reading 12 min.',
          },
          body: [
            { kind: 'bullets', items: ['Diagonal: your Week 4 physical elements, then your externals', 'Fill each cell from the pre-work; type it P, I or O', 'Check the crossing flows from your Week 4 information view', 'Count the degrees; check the sum'] },
          ],
          sources: [R('R22', '630')],
          notes: {
            teach: [
              'Teams work from the members’ pre-work lists. Circulate and check three things at every table: every interface has two ends; agreements are typed organizational and carry no data; every external element on the diagonal has an interface or a reason.',
              'At eight minutes, ask each team to run the crossing-flow check against two items of its Week 4 information view. At eleven minutes, ask for the degree sum.',
            ],
            why: 'The first N² is where most typing errors and one-ended interfaces appear; catching them in the room saves a week of rework.',
            figure: 'The empty grid is the template teams copy: diagonal first, then cells, then the degree column.',
            transition: 'Two teams read their degrees aloud.',
            timing: '12 min: 8 min fill and type, 3 min crossing check, 1 min degree sum.',
          },
        },
        {
          id: 'w5s2-lab-check',
          title: 'Instructor check: degrees and one external',
          purpose: 'Check two teams’ degree sums and one external interface each, publicly and quickly.',
          minutes: 5,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['Two teams: read the degree of each element and the sum', 'The room checks: is the sum twice the number of interfaces?', 'Each team names one external interface and its owner'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Two teams read their degrees; the room adds them and checks the sum against twice the count. If it fails, find the one-ended interface together.',
              'Each of the two teams names one external interface and who owns the far side. Teams not checked post a photo of their grid on the LMS; they are answered within 48 hours.',
            ],
            why: 'A public, arithmetic check is fast, fair and memorable, and naming the far-side owner rehearses the most often missing column.',
            transition: 'The seven-day plan.',
            timing: '5 min: 2 min each team, 1 min for the others.',
          },
        },
        {
          id: 'w5s2-lab-close',
          title: 'Close: the seven days ahead',
          purpose: 'Give the procedure, the quiz and the time log.',
          minutes: 2,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['Days 1–2: breakdown and cards; days 2–4: N², table, security columns', 'Days 4–5: interface requirements; day 5: management notes and the change request', 'Day 6: audit and AI usage statement; day 7: export and upload', 'Quiz Q5 opens today; log your hours'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the seven-day plan; each member owns at least two interface rows. Export both files from the lab tool after the last change; one member uploads them before Week 6, Session 1.',
              'Readiness quiz Q5 opens today: individual, formative, about fifteen minutes. Log your hours so that the workload estimate can be checked.',
            ],
            why: 'A dated plan with owners turns the brief into work that starts tomorrow, not the night before.',
            transition: 'End of Session 2.',
            timing: '2 min: 1 min the plan, 1 min quiz and log.',
          },
        },
        {
          id: 'w5s2-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Point students to the full references; every slide footer cites a register entry and page.'],
            why: 'Every claim in the session is traceable to a verified source page.',
            transition: 'End of Session 2.',
            timing: '0 min (reference slide).',
          },
        },
      ],
    },
  ],
  studentLesson: LESSON,
}
