// Week 4 — Requirements engineering. Complete module (definition of done: docs/AUTHORING_GUIDE.md). Source text is
// PARAPHRASED and page-cited inside the verified register ranges; blocks that add instructor reasoning are marked
// 'mixed' and say where the source ends. All AeroLink numbers are FICTIONAL (Data Sheet, src/model/airtaxi.ts, and the
// Week 4 reference baseline, src/model/reference/week04.ts). Authoring notes, pages read and open issues:
// docs/authoring/week04_notes.md. Pending independent review and faculty review (DECISION_LOG A4).
import type { LessonBlock, QuizQuestion, WeekContent } from '../schema'
import { FLAWED } from '../../activities/week04/critique'

const blocks: LessonBlock[] = [
  {
    id: 'w4-outcomes',
    kind: 'outcomes',
    title: 'Learning outcomes for this week',
    paragraphs: [
      'This week contributes to course outcome B-CLO2. In Week 3 you wrote solution-free need statements and capabilities for AeroLink. This week turns them into binding, verifiable requirements at two levels. Each requirement gets a rationale, a parent and a verification method, and is classified by type. The L4 set you write is the requirements baseline that the peer audit (Week 5), the SRR-style review (CP2, Week 6), the SysML v2 model (Weeks 9–11) and the verification plan (Week 12) all build on.',
    ],
    bullets: [
      'B4.1 (Understand) Distinguish needs, stakeholder requirements and system requirements.',
      'B4.2 (Create) Write well-formed requirements with rationale, parent and verification method.',
      'B4.3 (Analyse) Classify requirements by type.',
      'Graduate expectation: apply the MITRE system-level requirements checklist (R55 p.368–370) to your team’s set and argue each finding from the checklist item it rests on.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
  {
    id: 'w4-intuition',
    kind: 'intuition',
    title: 'Intuition: a contract clause you can, or cannot, dispute',
    paragraphs: [
      'Suppose you hire a builder to “renovate the kitchen to a high standard, quickly”. When the work is finished you think it is poor and late, and the builder thinks it is excellent and on time. Neither of you can prove the other wrong, because the clause gives no test that both of you would accept. Now suppose the clause says “wall cabinets shall be level to within 2 mm over 1 m, and the work shall be complete within 15 working days of the start date”. You may still argue, but the argument ends when someone fetches a spirit level and a calendar.',
      'A requirement is that kind of clause. It is an agreed obligation that a designer must meet and a verifier must be able to check. Two failures matter. The clause can be unverifiable, like “quiet” or “quickly”. Or the clause can dictate the solution, like “install brand-X cabinets”, which removes choices without saying what the owner actually needs. AeroLink’s communities need noise kept within the local agreement. “The aircraft shall be quiet” turns that need into an argument. “The eVTOL aircraft shall produce no more than 65 dBA LAmax at the pad edge” turns it into a measurement (65 dBA is a FICTIONAL Data Sheet value). This week is about writing the second kind of clause, and about knowing why each word is there.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
  {
    id: 'w4-levels',
    kind: 'concept',
    title: 'Needs, stakeholder requirements and system requirements',
    paragraphs: [
      'SEBoK describes System Requirements Definition as the process that transforms the stakeholder view of desired capabilities into a technical, developer view of how the system of interest (SoI) can achieve them. Its outputs are the basis of architecture and design and of integration and verification, and they are also a means of communication within the project team (R13 p.557). Needs express the stakeholders’ perspective, an external “black box” view of what they need the SoI to do. Requirements express the developer’s perspective, an internal “white box” view of what the SoI must do to meet those needs (R13 p.558). SEBoK’s coffee-maker pair shows the change of voice. The user needs the coffee maker to stop heating once the selected temperature is reached. The coffee maker shall stop the heating function once the selected brew temperature has been achieved.',
      'The change is not grammatical. SEBoK insists that generating a requirement is more than changing the subject of the need statement. It is an analysis of what the system must do to achieve what is needed, using functional, interface, data-flow and performance analysis or a needs-to-requirements transformation matrix. One need may therefore produce several requirements, including measurable performance criteria (R13 p.558–559). SEBoK quotes the INCOSE Needs and Requirements Manual definition. A requirement statement is the result of a formal transformation of one or more needs or parent requirements into an agreed obligation for an entity to perform a function or possess a quality, within specified constraints and with acceptable risk (R13 p.558). Each part of that definition does work. “Transformation” implies a parent to trace to. “Agreed” implies stakeholders. “Obligation for an entity” implies a named subject and a binding verb. “Within constraints with acceptable risk” implies conditions and limits.',
      'The DoD Systems Engineering Guidebook splits the same territory into two processes. Stakeholder Requirements Definition translates stakeholder capability needs into a set of technical requirements, from the acquisition perspective. The Guidebook warns that doing this incompletely leads to requirements creep, rework from misunderstood user needs, unexpected contract modifications, cost growth and schedule slip (R48 p.141). Its activities include defining constraints and the operational environment, and analysing requirements for specificity, completeness, consistency, measurability, testability and feasibility (R48 p.142). Requirements Analysis then decomposes end-user needs, usually stated in operational terms, into clear, achievable and verifiable requirements. It derives and allocates them down to system elements and supplies the rationale for each decomposition. The three processes are applied recursively at each level of the specification (R48 p.141–143).',
      'Course convention (applying the sources to L4). A NEED is the stakeholder’s statement from Week 3 and contains no “shall”. A stakeholder requirement (REQ-STK) is a binding obligation on the AeroLink service as a whole; it corresponds to the DoD’s stakeholder requirements. A system requirement (REQ-SYS) is an obligation on an element of the service, such as the aircraft, the charging system or the scheduling function, produced by requirements analysis and allocation. These levels are relative, not absolute. SEBoK notes that the SoI can sit at any level of an architecture, and that design-input requirements are defined iteratively and recursively as the system is decomposed (R13 p.558). Allocation then creates child requirements beneath a parent (R13 p.562). If AeroLink’s aircraft supplier were the developer, REQ-SYS-002 would be one of its stakeholder requirements.',
    ],
    quote: { text: 'Defining requirements is not only an exercise in writing it is also an exercise in engineering.', cite: { reading: 'R13', pages: '557' } },
    citations: [{ reading: 'R13', pages: '557–559' }, { reading: 'R13', pages: '562' }, { reading: 'R48', pages: '141–143' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-wellformed',
    kind: 'concept',
    title: 'What makes a requirement well formed',
    paragraphs: [
      'The DoD Guidebook gives a list of attributes of good requirements. A good requirement is necessary, unique, unambiguous, clear and concise, complete, consistent, technically feasible (achievable, obtainable), traceable, measurable (quantifiable), verifiable (for example testable), able to be validated, operationally effective and survivable, and singular. Using these attributes early, it says, reduces development time and raises the quality of the final system (R48 p.144). The preceding page explains why this matters. Poorly written requirements cause schedule, cost or performance problems and so increase programme risk (R48 p.143). The course audit in Week 5 uses this list as its checklist.',
      'MITRE’s list overlaps but explains several items in more operational terms (R54 p.329–330). Traceable: every requirement traces to a source such as a system-level requirement, which in turn traces to an operational need and to an authoritative person or document, and every requirement carries a unique identifier. Unambiguous: test the wording from the perspective of different stakeholders to see whether it can be read in more than one way. Specific and singular: each requirement is one atomic thought. Testable: specific, unambiguous and quantitative whenever possible, with vague, general statements avoided. Consistent: no requirement conflicts with another, which can only be checked across the set. Design-free: a requirement reflects “what” the system shall accomplish, and the design reflects “how”. Uses “shall”: in a specification “shall” marks a binding provision, “should” and “may” mark non-binding ones, and “will” declares purpose or future tense.',
      'Some of these characteristics belong to a single statement: singular, unambiguous, measurable, verifiable, design-free. Others belong only to the set: complete, consistent, unique. That split is the instructor’s; it is consistent with SEBoK, which asks whether individual requirements and sets of requirements have the characteristics the organisation defines (R13 p.566), but SEBoK does not assign the characteristics to either. This has a practical consequence for this week’s tools. A text heuristic can count the word “shall” or find “quickly”. It cannot decide whether a requirement is necessary, or whether two requirements conflict. One further subtlety: MITRE also observes that selective use of “shall”, with “should” to show preference, can help where needs will evolve, and that exhaustive use of “shall” can be constricting and costly (R55 p.367). The course rule for L4 is one “shall” per binding requirement. Record preferences and goals separately, and label them as such.',
    ],
    citations: [{ reading: 'R48', pages: '143–144' }, { reading: 'R54', pages: '329–330' }, { reading: 'R13', pages: '566' }, { reading: 'R55', pages: '367' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-attributes',
    kind: 'concept',
    title: 'Rationale, parent and verification method',
    paragraphs: [
      'SEBoK recommends recording attributes with each requirement: rationale, trace to source or parent, system verification success criteria, owner, category, status, criticality and priority (R13 p.559). The rationale says why the requirement is needed, which assumptions were made, where its numbers came from and which design studies support it. That information is what later decomposition needs, and it lets anyone find the source of a value. Writing the verification success criterion helps ensure the requirement is well formed and verifiable, and it feeds the verification plan (R13 p.559). SEBoK calls early planning of verification a best practice. Defining the success criteria, strategy and method when the requirement is written helps ensure that the statement is worded properly and is within the scope of the project plans. It also shows that the requirement has the characteristic “verifiable” (R13 p.566).',
      'The verification method is one of four. The DoD Guidebook defines them as follows (R49 p.149–150). Demonstration is operating the system with visual observation as the primary means of verification; it is used when quantitative assurance is not required. Examination, which the course calls inspection, is the visual inspection of equipment and the evaluation of drawings and design data, used for characteristics such as physical properties, materials, marking and workmanship. Analysis uses recognised analytic techniques, including computer models, to interpret or explain behaviour or performance. Test is an activity under fully controlled and traceable conditions whose data are used to evaluate quantitative characteristics. MITRE’s requirements article states that “all requirements must be testable to demonstrate that the end product satisfies the requirements”, and explains testable as specific, unambiguous and quantitative whenever possible (R54 p.329). Read with the method definitions, “testable” there means verifiable by some objective means; it does not mean that the Test method must be used. MITRE’s checklist adds two rules. Every requirement must have a verification method identified. If a requirement cannot easily be verified by direct inspection, measurement or a one-time demonstration, add an expanded test-criteria description: the number of trials, the statistical criteria and the test conditions (R55 p.370). “Every requirement needs a test” is therefore wrong (the instructor’s reading of the two sources together). Every requirement needs a method that can produce the evidence it requires, and must be worded so that some method can. This block gives everything the quiz needs about the four methods; R49 itself is optional reading.',
      'The parent is the other half of traceability. MITRE describes tracing as two-way. You cross-reference the source requirement that a system-level requirement is based on, and you reverse-reference which system requirements implement each source requirement. Tracing this way ensures that every requirement has a user basis and that every user requirement is carried into development. MITRE also advises recording the assumptions, constraints and analyses behind derived requirements (R55 p.371). Finally, SEBoK separates two kinds of check on the requirements themselves. Requirement verification asks whether the requirements are well formed. Requirement validation asks whether they are the right requirements, that is, whether they communicate the intent of their parent needs clearly, correctly and achievably. Neither is the same as verifying or validating the built system (R13 p.566).',
    ],
    citations: [{ reading: 'R13', pages: '559' }, { reading: 'R13', pages: '566' }, { reading: 'R49', pages: '149–150' }, { reading: 'R54', pages: '329' }, { reading: 'R55', pages: '370–371' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-types',
    kind: 'concept',
    title: 'Requirement types, categories and interface requirements',
    paragraphs: [
      'The course classifies requirements into four types, adapted from MITRE’s system-level checklist. Each system requirement should describe something relevant: a function the system must perform, the performance a function must provide, a constraint on the design, or a reference such as to an interface definition (R55 p.368). MITRE’s fourth item is a reference, not a type; the course turns it into an interface type. In practice: functional means what the entity must do; performance means how well, how much or how fast; interface means an interaction across a boundary with another system; constraint means a limit imposed on every acceptable solution, often from outside the project. RB-3.5 asks for a set that is balanced across the four types.',
      'SEBoK offers a second, complementary scheme, taken from the INCOSE Needs and Requirements Manual (R13 p.560, Table 1). Function/Performance covers the primary functions and how well they are performed. Fit/Operational covers enabling functions and interactions with the macro system, including human–system interaction, the induced and natural environments, safety, security, power, maintenance and disposal. Form covers physical characteristics. Quality covers the “-ilities”, such as reliability, availability and maintainability. Compliance covers conformance with standards and regulations. SEBoK says that organisations categorise differently, but that every category topic must be addressed for a set to be complete. The two schemes answer different questions. The course type tells you what kind of obligation a requirement is and so what kind of verification evidence it needs. The SEBoK category tells you whether the set has a gap. A requirement such as fleet availability of at least 90 % is a performance requirement in the course scheme and a Quality requirement in SEBoK’s.',
      'SEBoK calls an interface requirement a specific form of functional requirement, one that deals with an interaction of a system across an interface boundary with another system. It describes writing one as a three-step process: identify the interface boundaries and the interactions across them; define what crosses each boundary and the media involved; then write the requirement, often by reference to an interface control document (R13 p.563). MITRE asks for special attention to interface requirements and warns about hidden external interfaces. These arise when internal subsystems communicate through a medium that is not part of the system, such as radio or an external network (R54 p.331; R55 p.369). Type can also change with level. For the AeroLink service the 65 dBA limit is a constraint imposed by the city agreement. Allocated to the aircraft, the noise source, the same number becomes a performance requirement on that element. SEBoK calls this kind of allocation budgeting: a system-level value is divided among lower-level elements, and the budgeted requirements then depend on each other, so a change to one forces a change to another (R13 p.562).',
    ],
    citations: [{ reading: 'R55', pages: '368–369' }, { reading: 'R13', pages: '560' }, { reading: 'R13', pages: '562–563' }, { reading: 'R54', pages: '331' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-worked-chain',
    kind: 'worked-example',
    title: 'Worked example (a): two AeroLink chains, from need to system requirement',
    paragraphs: [
      'Chain 1, charging. NEED-004 (vertiport operators, STK-005) says that arriving aircraft must be ready to depart again quickly enough that pad turnaround does not become the throughput limit. That is a need. It has no “shall”, no number and no subject other than the operators’ expectation. The analysis step asks what “quickly enough” means. A pad’s departures per hour are set by how long an aircraft occupies it. The Data Sheet gives 20 min to charge to the dispatch threshold. Rotor stop, the safety check, and connecting and disconnecting the charger add 5 min, while deplaning and boarding overlap the charge (FICTIONAL values). The result is REQ-STK-005, a stakeholder requirement on the service: return an arriving aircraft to dispatch-ready status within 25 min of its arrival on the pad. It is a performance requirement, verified by test.',
      'The turnaround is then allocated. Only the charging system can deliver the 20 min share, and it must do so from the worst planned arrival state, which is the 20 % energy reserve that every flight plan protects (REQ-SYS-003). “Planned” matters: the reserve exists to be spent on a hold or a diversion (SCN-002 A1, SCN-005 A1), so a diverted aircraft can land below 20 %, outside REQ-SYS-001. The reference leaves that case to an extended turnaround that no requirement yet states — a gap worth a graduate argument. This gives REQ-SYS-001: the charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min. This is budgeting in SEBoK’s sense (R13 p.562): 25 min = 20 min charge + 5 min handling. The dependency is real. If a new safety check made handling 7 min (a FICTIONAL what-if), either the charge budget would fall to 18 min or REQ-STK-005 would have to be renegotiated with the vertiport operators. The rationale records the arithmetic so that the next engineer can redo it.',
      'Chain 2, waiting. NEED-001 (passengers, STK-001) asks for a short and predictable wait to board. REQ-STK-001 makes “short and predictable” measurable. At least 90 % of passengers in each calendar month shall board within 15 min of confirming their ride. The 15 min comes from assumption A-001 (attraction to the service halves at a 15 min wait), and the 90th percentile protects the passengers most likely to leave the service, not just the average one. Its method is analysis, not test. A monthly percentile over live operations cannot be produced under fully controlled conditions before service begins, so it is estimated with models and confirmed from operational data (R49 p.149–150). REQ-SYS-005 then allocates one slice of the 15 min budget to the scheduling function: assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation. That is 6.7 % of the budget, so the rest of the wait is set by aircraft and charger availability, which other requirements address. Its criterion (≤ 60 s for at least 99 % of at least 200 requests in a replayed peak-hour profile) is quantitative, so the method is test. An earlier draft said “to each confirmed ride request” while its criterion accepted 99 %: a scheduler that missed 1 % would have passed verification while violating the statement — exactly the later disagreement MITRE’s expanded test criteria exist to prevent (R55 p.370). Statement and criterion must say the same thing; check the pair, not each half.',
    ],
    table: {
      caption: 'The two chains in the reference baseline (src/model/reference/week04.ts; all values FICTIONAL)',
      header: ['ID', 'Level', 'Statement (abridged)', 'Type', 'Parent', 'Method', 'Rationale (abridged)'],
      rows: [
        ['NEED-004', 'Need', 'Operators need arriving aircraft ready to depart quickly enough that turnaround is not the throughput limit', '—', 'STK-005, CON-006', '—', '—'],
        ['REQ-STK-005', 'Stakeholder', 'The AeroLink service shall return an arriving aircraft to dispatch-ready status within 25 min of pad arrival', 'Performance', 'NEED-004, CAP-003', 'Test', '20 min charge + 5 min handling; turnaround sets pad throughput'],
        ['REQ-SYS-001', 'System', 'The charging system shall charge from ≥ 20 % reserve to the dispatch threshold within 20 min', 'Performance', 'REQ-STK-005', 'Test', 'Worst planned arrival state is the 20 % reserve; keeps the 25 min turnaround achievable (diverted arrivals below 20 % are not covered)'],
        ['NEED-001', 'Need', 'Passengers need a short and predictable wait to board after confirming a ride', '—', 'STK-001, CON-001', '—', '—'],
        ['REQ-STK-001', 'Stakeholder', 'The AeroLink service shall board ≥ 90 % of passengers each month within 15 min of confirmation', 'Performance', 'NEED-001, CAP-001', 'Analysis', 'Attraction halves at 15 min (A-001); the 90th percentile protects likely churners'],
        ['REQ-SYS-005', 'System', 'The scheduling function shall assign a dispatch-ready aircraft to ≥ 99 % of confirmed requests within 60 s of confirmation', 'Performance', 'REQ-STK-001, CAP-002', 'Test', 'Assignment must be a negligible slice (6.7 %) of the 15 min budget'],
      ],
    },
    citations: [{ reading: 'R13', pages: '558–559' }, { reading: 'R13', pages: '562' }, { reading: 'R49', pages: '149–150' }, { reading: 'R55', pages: '370' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-worked-critique',
    kind: 'worked-example',
    title: 'Worked example (b): critique and rewrite six flawed requirements',
    paragraphs: [
      'Each draft below was written by a well-meaning team. Treat it as a reviewer would. Name each defect and the quality characteristic it violates, cite the page, and then rewrite. The rewrites are the reference requirements. Two lessons come out of the set. First, most defects are of a few kinds: more than one obligation, words that cannot be measured, a solution stated as a requirement, a negative, a single-point value, and an unknown hidden behind an adjective. Second, the quality lab’s heuristics flag the word-level defects in all six drafts: the extra “shall”, “should”, “quickly”, “maximize”, “shall not”, “using” and the single-point value. They miss the ones that need engineering judgement: “safe” must be decomposed into hazards (F1); the subject names an implementation (F2); a number can dictate design rather than performance (F3); and a time needs a start event (F6). That is why requirement verification is a review activity and not a script (R13 p.566).',
      'Read F3 carefully, because it is the most instructive. “The charging system shall charge each aircraft using two 350 kW DC fast chargers per hub pad” (a FICTIONAL rating) contains a number and a unit, so it looks measurable. But the number constrains the design: it fixes the charger type, rating and count. It never says what the stakeholder needs, which is a turnaround short enough for the pad. MITRE’s advice is to give designers what they must know and to leave as much white space as possible for them to explore options (R55 p.367). A charger specification may well appear later, as a derived requirement that comes from a solution decision. The DoD Guidebook expects such derived requirements to be identified and kept traceable (R48 p.146). It does not belong at system level, before any trade study.',
    ],
    table: {
      caption: 'Critique and rewrite (instructor key). F-numbers match the examples loadable in the quality lab.',
      header: ['#', 'Flawed draft', 'Findings (characteristic, source)', 'Rewrite (reference)'],
      rows: FLAWED.map((f) => [
        f.id,
        f.flawed,
        f.findings.map((x) => `${x.flaw} [${x.characteristic}; ${x.cite.reading} p.${x.cite.pages}]`).join(' ') + (f.reviewOnly ? ` Reviewer-only finding: ${f.reviewOnly}` : ''),
        `${f.rewriteId}: ${f.rewrite}`,
      ]),
    },
    citations: [{ reading: 'R48', pages: '144' }, { reading: 'R54', pages: '329–330' }, { reading: 'R55', pages: '367' }, { reading: 'R55', pages: '370' }, { reading: 'R13', pages: '565–566' }, { reading: 'R48', pages: '146' }, { reading: 'R49', pages: '149' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-worked-tbd',
    kind: 'worked-example',
    title: 'Worked example (c): handling a TBD through an AROU item',
    paragraphs: [
      'The operations system must hold departures when the weather is beyond the aircraft limits. In the fictional case the OEM has not yet published the crosswind, gust and visibility limits. The team has three options. It could invent a number, which is unfounded and will silently become the baseline. It could write “unsafe weather”, which is unverifiable (F5). Or it could record the unknown. SEBoK describes the third option (R13 p.565). When a value is unknown, put a “To Be Determined” (TBD) placeholder in the statement. When a value is known but confidence in it is low, for example because feasibility has not been assessed, mark it “To Be Resolved” (TBR). Together these are TBXs. Tracking them shows how mature the requirement set is. TBXs can become risks if they are not closed before significant design work. TBX management means identifying each TBX, defining the work needed to close it, naming an owner, and working systematically until the placeholders can be removed.',
      'The reference requirement is REQ-SYS-004: the operations system shall place a dispatch hold on any vertiport whose forecast wind or gust within the next 30 min exceeds the aircraft limit (TBD-01). The TBD is not left floating. Unknown U-001, recorded in the Week 2 AROU v0, owns it. Its owner is the Director of Flight Operations, its resolution is to obtain the limits from the OEM flight-manual draft, and its need-by date is the CP2 requirements baseline in Week 6. U-001 is linked by “affects” to both REQ-STK-003 and REQ-SYS-004, so when the value arrives the trace shows every statement that must change. The requirement still has a full set of attributes: the type is functional; the method is demonstration (inject a forecast above the limit and observe the hold); the criterion is “hold placed for every injected forecast above TBD-01”. A TBD leaves a parameter open. It does not leave the verification undefined.',
      'Week 4 adds a second case. The utility has not confirmed the grid connection capacity at each vertiport, so REQ-STK-010 and REQ-SYS-010 carry TBD-02. A new Unknown, U-002, is created with them. Its owner is the Vertiport Infrastructure Manager, its resolution is a signed connection agreement for each vertiport, and it is needed before the Week 7 trade study. The quality lab does the same thing atomically: a requirement containing a TBD or TBR cannot be recorded until every token is owned — by the existing Unknown that records it, by an Assumption only for a TBR (a doubted value), or by a new Unknown created with an owner, the resolution work and a need-by date. Two FICTIONAL indicators show the maturity of the reference set. Four of its 20 requirements carry a TBX (20 %), and each TBX has an owner and a need-by date. A graduate-level refinement follows from SEBoK’s definitions. If your team doubted that the 20 min charge of REQ-SYS-001 is feasible, the right marking would be “20 min (TBR)”, with an assumption recording the doubt. Deleting the number would be wrong, because a TBR keeps the best current value visible while flagging that it may change.',
    ],
    table: {
      caption: 'TBX register in the reference baseline (values FICTIONAL)',
      header: ['TBX', 'Requirements', 'AROU item', 'Owner', 'Resolution', 'Need by'],
      rows: [
        ['TBD-01', 'REQ-STK-003, REQ-SYS-004', 'U-001 Aircraft weather limits not yet published', 'Director of Flight Operations', 'Limits from the OEM flight-manual draft', 'CP2 requirements baseline (Week 6)'],
        ['TBD-02', 'REQ-STK-010, REQ-SYS-010', 'U-002 Vertiport grid connection limit not agreed', 'Vertiport Infrastructure Manager', 'Connection agreement with the utility for each vertiport', 'Before the Week 7 trade study'],
      ],
    },
    citations: [{ reading: 'R13', pages: '565' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-advanced',
    kind: 'advanced',
    title: 'Advanced analysis: the right level of detail, negatives, and arguments about words',
    paragraphs: [
      'The hardest judgement in requirements work is not grammar but level of detail. MITRE puts it this way: give enough detail to implement the right system, but not so much that designers are restricted unnecessarily. With too little detail the designer has to guess; MITRE’s example is a car specification that forgets cargo space and is met by a car with too little of it. With too much detail the design is artificially constrained, often because someone has seen a feature they like and wants it written in (R55 p.371–372). The costs are concrete. Every system requirement has to be documented, allocated, tracked and formally tested, contractors will bid that work, and detailed requirements become a permanent part of the top-level requirements for all future upgrades until someone explicitly changes them (R55 p.372). Applied to AeroLink: “two 350 kW chargers per pad” (F3) would bind every future charging upgrade, while “charge to the dispatch threshold within 20 min” leaves the charger technology to the Week 7 trade study.',
      'User language hides engineering work. MITRE’s radar example, “detect airborne objects out to a range of 100 miles”, looks complete. A radar engineer immediately asks: detect what, and how well? No sensor can guarantee detection 100 % of the time, so the systems engineer must derive further requirements or verification criteria: the smallest object size, and the probability of detecting a given object within range (R55 p.368). REQ-STK-001 shows the same move. “Board within 15 min” becomes a statistic (the 90th percentile), a population (passengers each calendar month) and a starting event (ride confirmation). Without all three a verifier cannot say whether the requirement passed.',
      'Two cautions concern the reference set itself. First, MITRE advises avoiding “shall not”, because a negative is very difficult to prove (R55 p.370). Yet REQ-STK-003 says that the service “shall not dispatch a flight” beyond the weather limits. The instructor’s position is that at stakeholder level the regulator’s concern really is a prohibition. It is verified only over a finite, stated set of demonstrated cases, and its child, REQ-SYS-004, restates it positively as a hold that can be observed. Graduate students should decide whether they agree and rewrite REQ-STK-003 if they do not. Second, MITRE asks that single-point values be replaced by ranges (“minimum of”, “within”, “up to and including”), and that objective or goal values be clearly separated from threshold values (R55 p.370). For example, “at least 300 trips per day, with a goal of 360” keeps the binding threshold and makes the aspiration visible without making it binding (the 360 is FICTIONAL).',
      'Finally, expect arguments. MITRE lists the recurring disputes: what a word means, whether a requirement should be included, whether it specifies too much or too little, and whether it directs design. It traces their sources to helpful experience, fear of how someone else will interpret the requirement, a preferred competing technical approach, or insistence on a particular feature. Resolving them takes negotiation, technical expertise and an understanding of the root cause of the other person’s concern; clear and consistent wording is the starting point (R55 p.372–373). This is why each L4 requirement has an owner and a rationale. In the Week 5 audit the owner must defend the requirement with reasons, not with taste.',
    ],
    citations: [{ reading: 'R55', pages: '368' }, { reading: 'R55', pages: '370–373' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-application',
    kind: 'application',
    title: 'Aerospace and industry application',
    paragraphs: [
      'In US defence acquisition the authoritative sources for stakeholder requirements are documents produced through the Joint Capabilities Integration and Development System, such as the initial capabilities document and the capability development document (R48 p.142). The requirements that come out of requirements analysis become contracting language and the system performance specification, and they are revisited at technical reviews and audits throughout the life cycle (R48 p.142). MITRE notes that in a contract “shall” is legally enforceable, whereas “will”, “may”, “should” and “must” can show intent but are not binding (R55 p.369). For a team writing requirements for an operator like AeroLink, that is a reminder that every “shall” is a promise someone will be held to. It also settles the word “must” across the two weeks: in Week 3 it was kept out of need statements because it signals an intent to oblige; here it is kept out of requirements because it does not bind. Needs use “need”, binding requirements use “shall”, and “must” belongs in neither.',
      'Requirements are also increasingly held as model elements rather than paragraphs. SEBoK notes that models help with completeness (functions, inputs, sources, outputs and destinations), with communication, with capturing dependencies on needs, architecture and tests, and with quantitative analysis and simulation. In MBSE a requirement is a model element that carries a well-formed textual statement and can be shown in a diagram or a table (R13 p.564). SEBoK also lists the artefacts of this process: well-formed requirements, a requirement tree, traceability, defined interactions across boundaries, performance budgets and initial verification plans (R13 p.567). The L4 set produces each of these for AeroLink. In Week 10 the same requirements become SysML v2 requirement elements whose short names are their IDs (course plan, lab §C.2), so careful IDs, parents and attributes now save rework then.',
    ],
    citations: [{ reading: 'R48', pages: '142' }, { reading: 'R55', pages: '369' }, { reading: 'R13', pages: '564' }, { reading: 'R13', pages: '567' }],
    provenance: 'mixed',
  },
  {
    id: 'w4-lab',
    kind: 'lab',
    title: 'Lab L4: requirements writing studio',
    paragraphs: [
      'In teams, starting from your CP1 needs and capabilities, write 15–20 requirements at two levels: stakeholder requirements derived from NEED and CAP items, and system requirements derived from them. Give each one rationale, a verification method, a parent and a type. Use the quality lab below to draft and record each requirement in your workspace, with its owner and provenance. The lab refuses a requirement with a failing check, but passing every check is necessary, not sufficient: a heuristic cannot judge necessity, feasibility or correctness, so each requirement still needs a team review. Then audit the whole set with the trace checker and draw an RB-3 sample to rehearse the grader’s audit. Every TBD or TBR must be tied to an AROU item with an owner.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
  {
    id: 'w4-deliverable',
    kind: 'deliverable',
    title: 'Deliverable and assessment',
    paragraphs: [
      'Team: the L4 requirements table (exported from the workspace) is scored formatively now with RB-3.1–3.5, on a random sample of 10, and summatively at CP2 in Week 6. Individual: readiness quiz Q4, review-notebook entry 4 with a time log and AI statement, and the graduate checklist memo applying R55 p.368–370 to the team set.',
    ],
    citations: [],
    provenance: 'instructor-authored',
  },
]

const quiz: QuizQuestion[] = [
  {
    id: 'q4-1', bloom: 'Understand', objective: 'B4.1',
    prompt: 'According to SEBoK, what distinguishes a need from a requirement?',
    options: [
      { id: 'a', text: 'A need expresses the stakeholder’s external, black-box view of what they need the SoI to do; a requirement expresses the developer’s internal, white-box view of what the SoI must do to meet it', correct: true, explanation: 'Correct. This is SEBoK’s contrast (R13 p.558), illustrated by the coffee-maker pair.' },
      { id: 'b', text: 'A need is informal and a requirement is the same statement rewritten with “shall”', correct: false, explanation: 'SEBoK says that generating a requirement is more than changing the subject of the need. It is an analysis of what the system must do.' },
      { id: 'c', text: 'Needs are written by engineers and requirements by stakeholders', correct: false, explanation: 'It is the other way round. Needs carry the stakeholder perspective, and requirements carry the technical, developer perspective.' },
      { id: 'd', text: 'Needs are always quantitative and requirements are always qualitative', correct: false, explanation: 'Requirements carry the measurable criteria. A need such as “a short and predictable wait” is legitimately qualitative.' },
    ],
    cite: { reading: 'R13', pages: '558' },
  },
  {
    id: 'q4-2', bloom: 'Apply', objective: 'B4.1',
    prompt: 'A team converts NEED-004 (“Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit”) into: “The AeroLink service shall make arriving aircraft ready to depart again quickly enough that turnaround does not limit throughput.” What is the main problem?',
    options: [
      { id: 'a', text: 'Nothing: it has a subject, one “shall” and a parent', correct: false, explanation: 'Form is not enough. The statement has no criterion a verifier could check.' },
      { id: 'b', text: 'Only the subject has changed. The analysis that turns “quickly enough” into a measurable obligation (turnaround ≤ 25 min from pad arrival, from charge time plus handling) is missing', correct: true, explanation: 'Correct. SEBoK says a requirement is more than the need with a new subject; analysis must produce measurable performance criteria (R13 p.558–559).' },
      { id: 'c', text: 'Stakeholder requirements must never mention the AeroLink service', correct: false, explanation: 'At stakeholder level the subject is the service as a whole; that part is right.' },
      { id: 'd', text: 'It should be written as a need, because operators are stakeholders', correct: false, explanation: 'The need already exists. The task is to transform it into a binding obligation.' },
    ],
    cite: { reading: 'R13', pages: '558–559' },
  },
  {
    id: 'q4-3', bloom: 'Apply', objective: 'B4.1',
    prompt: 'REQ-STK-005 gives a 25 min hub turnaround: 20 min charge (REQ-SYS-001) + 5 min handling. A new safety check raises handling to 8 min (FICTIONAL). Which consequence follows from SEBoK’s account of allocation and budgeting?',
    options: [
      { id: 'a', text: 'None: REQ-SYS-001 is a separate requirement and is unaffected', correct: false, explanation: 'Budgeted requirements depend on each other. A change in one forces a change in another (R13 p.562).' },
      { id: 'b', text: 'Either the charge budget must fall to 17 min (a new REQ-SYS-001 value, with feasibility to be checked) or REQ-STK-005 must be renegotiated with the vertiport operators', correct: true, explanation: 'Correct. The 25 min is a system-level budget divided among elements; 25 − 8 = 17 min is left for charging.' },
      { id: 'c', text: 'The handling time should be deleted from the rationale so the numbers still add up', correct: false, explanation: 'The rationale records the source of the numbers precisely so that this change can be traced (R13 p.559).' },
      { id: 'd', text: 'REQ-SYS-001 becomes a stakeholder requirement', correct: false, explanation: 'Its level does not change. It is still the charging system’s allocated share.' },
    ],
    cite: { reading: 'R13', pages: '562' },
  },
  {
    id: 'q4-4', bloom: 'Apply', objective: 'B4.2',
    prompt: 'Which is the best rewrite of “The booking app should respond quickly to ride requests”?',
    options: [
      { id: 'a', text: 'The booking app shall respond quickly and reliably to ride requests', correct: false, explanation: '“Shall” is now binding, but “quickly” and “reliably” are still vague, and the subject still names an implementation.' },
      { id: 'b', text: 'The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation', correct: true, explanation: 'Correct. It is binding, singular and measurable with a start event and a stated share of requests, and it is design-free because it names the function rather than the app (R54 p.329–330).' },
      { id: 'c', text: 'The booking app should respond within 60 s', correct: false, explanation: '“Should” is non-binding in a specification (R54 p.330), and “respond” does not say what must happen.' },
      { id: 'd', text: 'The system shall use a cloud database so that responses are fast', correct: false, explanation: 'This dictates a solution and keeps the vague term “fast”.' },
    ],
    cite: { reading: 'R54', pages: '329–330' },
  },
  {
    id: 'q4-5', bloom: 'Understand', objective: 'B4.2',
    prompt: '“The aircraft shall be quiet and shall be safe to operate near homes.” Which characteristics from the DoD list of attributes of good requirements does it violate most directly?',
    options: [
      { id: 'a', text: 'Singular, because there are two obligations; and unambiguous and measurable, because “quiet” and “safe” have no criterion', correct: true, explanation: 'Correct. Both defects appear in the R48 p.144 list. The rewrite splits the statement and gives the noise obligation a value (REQ-SYS-002).' },
      { id: 'b', text: 'Traceable only', correct: false, explanation: 'A parent could easily be found (NEED-003). The defects are in the statement itself.' },
      { id: 'c', text: 'Technically feasible only', correct: false, explanation: 'Feasibility cannot even be judged until the statement says how quiet.' },
      { id: 'd', text: 'None: safety and quietness are important to the community', correct: false, explanation: 'Importance is not well-formedness. “Safe” is a goal that must be decomposed into specific requirements.' },
    ],
    cite: { reading: 'R48', pages: '144' },
  },
  {
    id: 'q4-6', bloom: 'Apply', objective: 'B4.2',
    prompt: 'REQ-STK-001 requires at least 90 % of passengers each calendar month to board within 15 min of confirmation. Which verification method fits best before service begins?',
    options: [
      { id: 'a', text: 'Test, because every performance requirement must be tested', correct: false, explanation: 'A monthly percentile over live operations cannot be produced under fully controlled, traceable conditions before service. The method must fit the evidence (R49 p.150).' },
      { id: 'b', text: 'Analysis: use recognised analytic techniques, such as a queueing or simulation model, to estimate the percentile, and confirm it later from operational data', correct: true, explanation: 'Correct. Analysis interprets or explains performance with analytic techniques including computer models (R49 p.149). The reference uses analysis for REQ-STK-001.' },
      { id: 'c', text: 'Inspection of the booking app screens', correct: false, explanation: 'Inspection checks physical characteristics and design data, not a performance statistic.' },
      { id: 'd', text: 'Demonstration of one ride', correct: false, explanation: 'Demonstration is for cases where quantitative assurance is not required (R49 p.149); a single ride says nothing about a monthly percentile.' },
    ],
    cite: { reading: 'R49', pages: '149–150' },
  },
  {
    id: 'q4-7', bloom: 'Evaluate', objective: 'B4.2',
    prompt: 'Which rationale for REQ-SYS-005 (“The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation”) is best?',
    options: [
      { id: 'a', text: 'The scheduling function must assign an aircraft to nearly every confirmed request within 60 s', correct: false, explanation: 'This restates the requirement. A rationale must say why it is needed (RB-3.3; R13 p.559).' },
      { id: 'b', text: 'Passengers like fast service', correct: false, explanation: 'Vague, and it gives no source for the 60 s.' },
      { id: 'c', text: 'Assignment must be a negligible part (about 7 %) of the 15 min wait budget of REQ-STK-001, so that the remaining time is set by aircraft and charger availability', correct: true, explanation: 'Correct. It explains why the requirement exists, where the number comes from and which parent budget it protects (R13 p.559).' },
      { id: 'd', text: 'Required by the customer', correct: false, explanation: 'It names an authority but no reason, assumption or source of value.' },
    ],
    cite: { reading: 'R13', pages: '559' },
  },
  {
    id: 'q4-8', bloom: 'Apply', objective: 'B4.2',
    prompt: 'The aircraft weather limits needed for REQ-SYS-004 are not yet published by the OEM. What does SEBoK’s guidance on unknowns imply the team should do?',
    options: [
      { id: 'a', text: 'Use a plausible number now and correct it later', correct: false, explanation: 'An invented value silently becomes the baseline and hides the open issue.' },
      { id: 'b', text: 'Write “in unsafe weather” until the limits are known', correct: false, explanation: '“Unsafe” is unverifiable and hides the fact that a value is missing.' },
      { id: 'c', text: 'Put a TBD in the statement and manage it: record the work needed to close it and an owner (here U-001, owned by the Director of Flight Operations, needed by CP2), and close it systematically', correct: true, explanation: 'Correct. This is TBX management (R13 p.565). The course ties every TBX to an AROU item.' },
      { id: 'd', text: 'Mark the value TBR, because it is unknown', correct: false, explanation: 'TBR is for a value that is known but held with low confidence. An unknown value is TBD (R13 p.565).' },
    ],
    cite: { reading: 'R13', pages: '565' },
  },
  {
    id: 'q4-9', bloom: 'Apply', objective: 'B4.2',
    prompt: '“The maintenance management function shall diagnose reported faults using a machine-learning engine supplied by Vendor-Y.” A teammate says it is fine because it has a subject and exactly one “shall”. Which response is best?',
    options: [
      { id: 'a', text: 'Agree: subject, one “shall” and a named supplier make it precise', correct: false, explanation: 'Form is not enough. Precision about the means is not precision about the need; the statement fixes the design.' },
      { id: 'b', text: 'It is not design-free. It states how (a machine-learning engine from one vendor) instead of what the stakeholder needs — for example, every reported fault classified go or no-go within a stated time — and it removes the designer’s white space before any trade study', correct: true, explanation: 'Correct. A requirement reflects what, the design how (R54 p.330); give designers what they must know and leave white space (R55 p.367).' },
      { id: 'c', text: 'Change “shall” to “should” so that it is only a preference', correct: false, explanation: 'This keeps the solution in the requirement and makes it non-binding as well.' },
      { id: 'd', text: 'Add “or equivalent” after “Vendor-Y”', correct: false, explanation: 'The decision is still at the wrong level, and “equivalent” is undefined, so verification would become an argument.' },
    ],
    cite: { reading: 'R54', pages: '330' },
  },
  {
    id: 'q4-10', bloom: 'Apply', objective: 'B4.2',
    prompt: '“The operations system shall send each flight intent to the ANSP 5 min before take-off.” (FICTIONAL value.) Which revision best follows MITRE’s checklist?',
    options: [
      { id: 'a', text: '… no later than 5 min before take-off', correct: true, explanation: 'Correct. A bound replaces the single point, so an intent sent 7 min early is compliant and one sent 3 min before is not (R55 p.370: use ranges such as “minimum of”, “maximum of”, “within”).' },
      { id: 'b', text: '… exactly 5 min before take-off', correct: false, explanation: 'A single-point value invites dispute when a test result differs slightly from it (R55 p.370).' },
      { id: 'c', text: '… as early as possible before take-off', correct: false, explanation: 'Unmeasurable, like “minimize” and “maximize” (R55 p.370).' },
      { id: 'd', text: '… 5 min before take-off, verified by inspection', correct: false, explanation: 'The single point remains, and inspection of drawings cannot measure when a message was sent.' },
    ],
    cite: { reading: 'R55', pages: '370' },
  },
  {
    id: 'q4-11', bloom: 'Analyse', objective: 'B4.3',
    prompt: 'How should this requirement be typed, and why? “The maintenance management function shall send each aircraft’s fault records to the aircraft manufacturer (EXT-004) in the format defined in the maintenance-data interface control document.”',
    options: [
      { id: 'a', text: 'Constraint, because the format is imposed from outside', correct: false, explanation: 'The format is defined by reference to the interface definition, but the obligation is the exchange with an external system; that is what verification will check.' },
      { id: 'b', text: 'Interface: the obligation is an exchange across the boundary with an external system, written by reference to an interface definition; SEBoK treats an interface requirement as a specific form of functional requirement', correct: true, explanation: 'Correct. This follows R13 p.563 and the reference item of R55 p.368; the course types boundary exchanges as interface requirements to keep them visible (R54 p.331).' },
      { id: 'c', text: 'Performance, because the records must be complete', correct: false, explanation: 'Nothing in the statement says how well, how much or how fast; completeness here is set by the interface definition.' },
      { id: 'd', text: 'Not a requirement, because the manufacturer is not part of AeroLink', correct: false, explanation: 'Interactions with external systems are exactly what interface requirements capture.' },
    ],
    cite: { reading: 'R13', pages: '563' },
  },
  {
    id: 'q4-12', bloom: 'Analyse', objective: 'B4.3',
    prompt: 'REQ-STK-010 (keep charging power within the connection agreed with the utility) is a constraint. A team allocates it as: “The charging system shall reduce total charger power to the curtailed level within 2 s of a curtailment signal from the utility” (FICTIONAL). How should the allocated requirement be typed?',
    options: [
      { id: 'a', text: 'Constraint, because its parent is a constraint', correct: false, explanation: 'Type describes the obligation on the entity that carries it, not the type of its parent; allocation can change it.' },
      { id: 'b', text: 'Performance: it obliges the charging system to respond within a time, so how fast is what verification measures; the utility’s signal may also deserve its own interface requirement', correct: true, explanation: 'Correct. In MITRE’s terms (R55 p.368) the parent is a constraint on the design and the child is the performance a function must provide; the exchange with the utility is a separate interface concern.' },
      { id: 'c', text: 'Interface only, because the utility is named', correct: false, explanation: 'The signal does cross a boundary, but the obligation stated here is the 2 s response, not the content or format of the exchange.' },
      { id: 'd', text: 'Functional, because reducing power is a function', correct: false, explanation: 'The function is implied, but the statement’s obligation, and the evidence a verifier must produce, is the 2 s; a number with a bound on a function’s response is performance.' },
    ],
    cite: { reading: 'R55', pages: '368' },
  },
  {
    id: 'q4-13', bloom: 'Evaluate', objective: 'B4.3',
    prompt: 'A team’s L4 set has 16 requirements: 13 functional, 3 performance, no interface and no constraint requirements. Which judgement is best supported?',
    options: [
      { id: 'a', text: 'Fine: functional requirements are the most important, so a set dominated by them is complete', correct: false, explanation: 'SEBoK says each category topic must be addressed for a set to be complete (R13 p.560).' },
      { id: 'b', text: 'The set is probably incomplete. Nothing covers interactions with the ANSP, utility or emergency services, nor externally imposed limits such as noise and grid capacity, so the team should check its context and scenarios for missing interface and constraint requirements', correct: true, explanation: 'Correct. Imbalance is a symptom of a gap. SEBoK’s categories (Fit/Operational, Compliance) and MITRE’s focus on external interfaces (R54 p.331) point to what is missing.' },
      { id: 'c', text: 'Reclassify three functional requirements as interface requirements to balance the counts', correct: false, explanation: 'Relabelling hides the gap rather than closing it.' },
      { id: 'd', text: 'Delete functional requirements until the types are equal', correct: false, explanation: 'Balance is a check on coverage, not a quota.' },
    ],
    cite: { reading: 'R13', pages: '560' },
  },
]

const week04: WeekContent = {
  week: 4,
  drivingQuestion:
    'Communities want AeroLink to be quiet, passengers want short waits, and the regulator wants every flight within limits. How do these needs become binding, verifiable obligations on the right part of the system, each with a reason, a parent and a way to prove it has been met, without writing the design into the requirement?',
  blocks,
  activities: [
    {
      id: 'w4-act-quality',
      title: 'Requirements quality lab',
      component: 'w04-quality-lab',
      purpose: 'Draft or repair a requirement, see which quality characteristics its wording and attributes satisfy (each check cites its source), and record it, with its parent links and any TBX Unknown, in your AeroLink workspace.',
      instructions: [
        'Load F1–F6 one at a time. Predict which checks will fail before you look, then repair each example until no check fails.',
        'For each advisory, decide whether it applies, and write the reason in your team’s notes.',
        'Write your own L4 requirements here, each with a success criterion (L4 requires one for every requirement), its owner’s initials and its provenance. A requirement with a failing check cannot be recorded; one with a TBD/TBR must name the AROU item that owns it, or create a new Unknown with an owner, resolution work and a need-by date.',
        'Remember the banner: the heuristics test words and attributes, not engineering truth. Every requirement still needs a team review.',
      ],
      objectives: ['B4.2'],
      inBlock: 'w4-worked-critique',
    },
    {
      id: 'w4-act-classify',
      title: 'Requirement level and type classifier',
      component: 'w04-type-classifier',
      purpose: 'Classify twelve AeroLink statements by level (need, stakeholder requirement, system requirement) and by type, then compare with the key and its reasoning, including SEBoK’s category for each.',
      instructions: [
        'Decide level and type for every statement before you check.',
        'Where your answer is marked “defensible”, write the argument for it in one sentence.',
        'Note the pairs that show type changing with level (REQ-STK-002 / REQ-SYS-002).',
      ],
      objectives: ['B4.1', 'B4.3'],
      inBlock: 'w4-types',
    },
    {
      id: 'w4-act-trace',
      title: 'Parent-trace and set checker with an RB-3 rehearsal',
      component: 'w04-trace-checker',
      purpose: 'Audit your recorded set for orphans, inverted traces, missing types, duplicates and failing checks, and rehearse the grader’s RB-3 audit on a random sample of 10.',
      instructions: [
        'Run the checker on the instructor reference first, to calibrate: all 20 should pass.',
        'Switch to your workspace. Fix every orphan and every failing check; explain each remaining advisory.',
        'Draw a sample with a seed of your choice and record the proxy levels in your lab record. The grader draws a different sample.',
      ],
      objectives: ['B4.2', 'B4.3'],
      inBlock: 'w4-lab',
    },
  ],
  lab: {
    id: 'L4',
    title: 'Requirements writing studio',
    setting: 'team',
    durationMinutes: 75,
    objectives: ['B4.1', 'B4.2', 'B4.3'],
    inputs: [
      'CP1 record: NEED, CAP, MGO and SCN items with their STK/CON parents (Week 3)',
      'AROU v1 from CP1 (U-, A- items available for TBX links)',
      'AeroLink Data Sheet (FICTIONAL values)',
      'Requirements quality lab, classifier and trace checker (this week)',
    ],
    steps: [
      { title: 'Stakeholder requirements from needs', detail: 'For each NEED, decide what the AeroLink service must do or be. Analyse; do not just change the subject (R13 p.558). Write REQ-STK items, usually 6–10, each derived from at least one NEED or CAP.' },
      { title: 'System requirements', detail: 'Allocate each REQ-STK to the elements that implement it, and write REQ-SYS items that derive from it. Where a value is divided between elements, write the budget arithmetic in the rationale (R13 p.562). Total set: 15–20 REQ.' },
      { title: 'Rationale, method, criterion and parent', detail: 'For each requirement give a rationale that says why and where the number comes from (R13 p.559), a verification method that fits the evidence (R49 p.149–150), a success criterion that agrees with the statement, its parent and its owner. Record each requirement through the quality lab with the owner’s initials and provenance (AI-suggested-reviewed where it applies); resolve every failing check and decide on every advisory.' },
      { title: 'TBX handling', detail: 'Any value you do not know is TBD; any value you doubt is TBR (R13 p.565). Link each one to an existing U-/A- item, or create a new Unknown with an owner, the resolution work and a need-by date.' },
      { title: 'Type classification and balance', detail: 'Type every requirement functional, performance, interface or constraint (R55 p.368). Check the set against SEBoK’s categories (R13 p.560) for gaps, especially external interfaces and externally imposed constraints.' },
      { title: 'Self-audit and record', detail: 'Run the trace checker until there are no orphans, no failing checks and all four types are present. Draw an RB-3 sample and record the proxy levels. Export the requirements table and add it to the L4 record with your advisory decisions.' },
    ],
    artefacts: [
      { idPrefix: 'REQ-STK', description: 'Stakeholder requirements on the AeroLink service, each derived from NEED/CAP', minimum: '≥ 6, each with type, rationale, method, criterion and parent' },
      { idPrefix: 'REQ-SYS', description: 'System requirements on AeroLink elements, each derived from a REQ-STK (or a CAP, with justification)', minimum: '≥ 8; set total 15–20 REQ' },
      { idPrefix: 'U / A', description: 'AROU items that own each TBD/TBR', minimum: 'One per distinct TBX, with owner and need-by date' },
    ],
    continuity:
      'The L4 set is the input to the Week 5 peer audit (RB-3.6 audit responses, S12 p.144 checklist) and to the MOE → MOP → TPM hierarchy, whose MOPs must each link to a REQ. It is baselined at CP2 (Week 6, SRR-style review). It becomes SysML v2 requirement elements with short-name IDs in Week 10, with satisfy links from design elements. It is verified through VER items in Week 12. TBX items are tracked in the AROU register until closed (U-001 by CP2, U-002 before the Week 7 trade study).',
    tools: [
      { label: 'AeroLink model workspace (export, import, reference baseline)', to: '/workspace/model' },
      { label: 'Air Taxi Enterprise workspace (case brief and Data Sheet)', to: '/workspace/aerolink' },
    ],
  },
  assignment: {
    id: 'W4-A',
    title: 'L4 requirements set (team) and graduate checklist memo (individual)',
    mode: 'team',
    due: 'Before the first session of Week 5',
    weight: 'L4 set (team): formative RB-3 now, summative at CP2 (10 %, RB-3 40 %) · graduate memo (individual): review-notebook entry 4 (RB-16, 5 %), always read, formative on RB-3.5',
    instructions: [
      'Team: submit the L4 requirements table (15–20 REQ, exported from the workspace) with the trace-checker summary, your RB-3 sample rehearsal and a list of advisory decisions (accepted or rejected, with a reason).',
      'The grader draws 10 requirements at random and scores RB-3.1–3.4 as the percentage of the sample that meets each condition; RB-3.5 is judged on the whole set. This week the score is formative.',
      'Individual (graduate): apply six items of the MITRE system-level requirements checklist (R55 p.368–370) to your team’s set — the four below plus two of your choice: traceable to user requirements; all external interfaces included; performance statements quantifiable and verifiable (including “shall not” and single-point values); verification approaches complete and appropriate. For each item give a verdict (met / partly / not met), the requirement IDs that are evidence, and one proposed change. Choose at least one item where you disagree with your team, and argue it. The memo is review-notebook entry 4 and is always read.',
      'Individual: log your hours for the week in the review notebook (workload pilot, FD-22) with an AI usage statement.',
    ],
    template: [
      { heading: '1. Requirements table', guidance: 'ID, level, statement, type, method, success criterion, rationale, parent(s), owner, TBX and AROU link. One “shall” per requirement; 15–20 rows.' },
      { heading: '2. Two traced chains', guidance: 'Two NEED → REQ-STK → REQ-SYS chains written out with the analysis between levels, including any budget arithmetic (as in worked example (a)).' },
      { heading: '3. TBX register', guidance: 'Every TBD/TBR: requirement IDs, the AROU item, owner, resolution work and need-by date (R13 p.565).' },
      { heading: '4. Set audit', guidance: 'Trace-checker summary (orphans, types, duplicates), the RB-3 sample rehearsal with its seed, and the advisory decisions with reasons.' },
      { heading: '5. Graduate checklist memo (individual)', guidance: 'One row for each of the six R55 Table 1 items you apply (p.368–370; the four named in the instructions plus two of your choice): verdict, evidence IDs, proposed change. Then one paragraph on the item you disagree with your team about, argued from the checklist text with its page.' },
      { heading: '6. AI usage statement', guidance: 'Tool, purpose, prompts, what you accepted or rejected and why (RB-12). Requirements suggested by AI are recorded in the quality lab with the provenance AI-suggested-reviewed and the initials of the team member who owns them.' },
    ],
    rubrics: ['RB-3', 'RB-16', 'RB-12'],
    rubricScope: 'L4 set (team): RB-3.1–3.5, formative, on a random sample of 10 (RB-3.6 begins with the Week 5 audit responses). Graduate memo (individual): a required review-notebook entry under RB-16, always read and not sampled (RB-16 graduate-task note, DECISION_LOG W7); scored formatively on RB-3.5 (set quality) as the memo applies it — 4: six checklist items each with a correct verdict, evidence IDs and a workable change, and the disagreement argued from the checklist text with its page; 3: all items covered but evidence or changes thin; 2: items listed without evidence IDs; 1: missing. The set of graduate tasks informs RB-16.1. AI statement: RB-12.1–12.3, including RB-12.3 for every AI-suggested requirement (provenance AI-suggested-reviewed in the quality lab).',
    aiUse: 'AI tools may be used to critique draft requirements and to suggest missing ones. Every AI suggestion that is kept is tagged AI-suggested-reviewed, owned by a named member, and passed through the quality lab and a team review. AI must not invent AeroLink values: any number must come from the Data Sheet, the reference baseline or a labelled assumption.',
    objectives: ['B4.1', 'B4.2', 'B4.3'],
  },
  quiz,
  instructorNotes: {
    sessions: [
      {
        title: 'Session 1: concept studio',
        minutes: 75,
        segments: [
          { label: 'Analogy: a disputable and an indisputable contract clause', minutes: 10, notes: 'Read both kitchen clauses aloud. Ask what each party would bring to an argument about each one. Pose the driving question.' },
          { label: 'Formal concepts', minutes: 20, notes: 'Needs vs requirements (R13 p.558) and the INCOSE definition; DoD stakeholder requirements vs requirements analysis (R48 p.141–143); good-requirement attributes (R48 p.144); four verification methods (R49 p.149–150); types (R55 p.368) vs SEBoK categories (R13 p.560).' },
          { label: 'Worked example: NEED-004 → REQ-STK-005 → REQ-SYS-001', minutes: 15, notes: 'Do the budget on the board: 25 = 20 + 5. Then ask what happens if handling becomes 6 min (q4-3 uses a different value). Show REQ-SYS-004 with TBD-01 and U-001 in the model workspace.' },
          { label: 'Active practice: requirement smells', minutes: 25, notes: 'Pairs load F1–F6 in the quality lab and predict the failing checks first (10). Then they run the classifier (10). Debrief (5): which defects did the tool miss, and why? (F1 “safe”, F2 the app, F3 the number, F6 the start event.)' },
          { label: 'Exit ticket', minutes: 5, notes: 'Rewrite “The vertiport shall be safe for passengers” as one well-formed requirement, or explain why it must first be split.' },
        ],
      },
      {
        title: 'Session 2: Lab L4',
        minutes: 75,
        segments: [
          { label: 'Brief', minutes: 5, notes: 'L4 acceptance rule; RB-3 sample audit (10 at random); the TBX rule; the AI tagging rule.' },
          { label: 'Team work: stakeholder and system requirements', minutes: 35, notes: 'Teams draft REQ-STK from their CP1 needs, then allocate to REQ-SYS. Circulate and challenge any requirement that just changes the subject of a need.' },
          { label: 'Instructor checkpoint', minutes: 10, notes: 'Each team shows one chain with its budget arithmetic and one TBX with its AROU owner. Check that methods fit the evidence (no performance requirement verified by demonstration without a criterion).' },
          { label: 'Team work: types, set audit', minutes: 20, notes: 'Run the trace checker; close orphans and failing checks; look for missing interface and constraint requirements against the context diagram (Week 1) and scenarios (Week 3).' },
          { label: 'Lab record', minutes: 5, notes: 'Export the requirements table, draw an RB-3 sample, and list open advisories with decisions.' },
        ],
      },
    ],
    misconceptions: [
      { claim: '“A requirement is a design decision.”', correction: 'A requirement states what the system must accomplish; the design states how (R54 p.330). It is an engineering decision about what the SoI must do or be (R13 p.557), but naming the charger, the app or the material removes the designer’s white space (R55 p.367). Design choices come back later as derived requirements, traced to the decision that created them (R48 p.146).', cite: { reading: 'R54', pages: '330' } },
      { claim: '“‘Safe’ is a requirement.”', correction: '“Safe” is a goal that cannot be verified as written. It is unambiguous only once it is decomposed into specific, measurable obligations, such as the energy reserve (REQ-SYS-003), weather holds (REQ-SYS-004), fault interlocks (REQ-STK-006) and fire alerting (REQ-STK-008). Vague, general statements are to be avoided (R54 p.329).', cite: { reading: 'R54', pages: '329' } },
      { claim: '“Every requirement needs a test.”', correction: 'MITRE does say “all requirements must be testable” (R54 p.329), but it explains testable as specific, unambiguous and quantitative where possible — verifiable by some means, not verified by the Test method. Every requirement needs a verification method (R55 p.370), chosen from inspection (examination), analysis, demonstration and test according to the evidence needed. Demonstration fits when quantitative assurance is not required, and test when quantitative characteristics must be evaluated under controlled conditions (R49 p.149–150). REQ-STK-007 (step-free boarding) is verified by inspection, and REQ-STK-001 (a monthly percentile) by analysis.', cite: { reading: 'R49', pages: '149–150' } },
      { claim: '“If the quality checker passes it, it is a good requirement.”', correction: 'The checks are heuristics on words and attributes. Necessity, feasibility, correctness and consistency are judged by people, through requirement verification and validation (R13 p.566). F3 (the 350 kW chargers) passes the measurable check while still dictating the design.', cite: { reading: 'R13', pages: '566' } },
      { claim: '“A stakeholder requirement is just the need with ‘shall’.”', correction: 'Generating a requirement is more than changing the subject of a need. It is an analysis that usually produces measurable criteria, and sometimes several requirements from one need (R13 p.558–559).', cite: { reading: 'R13', pages: '558–559' } },
    ],
    facilitation: [
      'Keep the levels relative. Ask “which entity is obliged?” for every requirement. If it is the AeroLink service, it is REQ-STK; if it is an element, it is REQ-SYS. Then show that the aircraft supplier would see REQ-SYS-002 as its own stakeholder requirement.',
      'The two type schemes are both legitimate. Use the course types for the type attribute and RB-3.5 balance, and SEBoK’s categories as a completeness check. Do not let students argue that one is “right”.',
      'Accept defensible alternatives in the classifier when the argument is sound (for example, interface vs performance for REQ-SYS-009). The key is a calibration device.',
      'Model TBX discipline. When a team cannot find a number, praise the TBD and ask for its AROU owner and need-by date, rather than letting the team invent a value.',
      'Graduate students: the R55 memo is notebook entry 4 and is always read (RB-16 note). Score it formatively on RB-3.5 with the descriptors in the rubric scope; expect checklist items cited closely enough to be checkable (with the page) and at least one reasoned disagreement with the team.',
      'Ownership: the quality lab records each requirement’s owner initials and provenance and shows them in the trace checker; challenge any AI-suggested requirement that is not tagged AI-suggested-reviewed (RB-12.3).',
      'Accessibility: all three activities are keyboard-operable with visible labels; each check result is given as text (“Pass”, “Fail”, “Review”, “Not applicable”) as well as by colour; every table has a caption.',
    ],
    answerKey: [
      'Classifier key: NEED-004, NEED-001 → need (not typed). REQ-STK-005 performance; REQ-SYS-001 performance; REQ-STK-002 constraint (performance defensible); REQ-SYS-002 performance (constraint defensible); REQ-STK-009 interface (functional defensible); REQ-SYS-009 interface (performance defensible); REQ-SYS-004 functional; REQ-STK-006 functional; REQ-SYS-010 constraint (functional defensible); REQ-SYS-006 performance (SEBoK category: Quality).',
      'Critique key (worked example (b)). F1 → split; singular + unambiguous/measurable → REQ-SYS-002, and “safe” is decomposed. F2 → binding word, testable, method fit; subject names an implementation → REQ-SYS-005. F3 → design-free; the method does not verify the need → REQ-SYS-001. F4 → “maximize”, measurable → REQ-SYS-006. F5 → “shall not”, a hidden unknown → REQ-SYS-004 with TBD-01/U-001. F6 → single point, missing start event → REQ-SYS-009. The quality lab raises the listed heuristic checks for each draft (asserted by unit tests).',
      'Quality lab model answers: a recordable F-repair must have no failing check — including a success criterion, which is now required for every requirement. Once the rewrite text, a rationale, a parent, a success criterion and a fitting method are entered (and, for F5, the U-001 link for TBD-01), the six rewrites raise no advisories; F5’s rewrite is stated positively as a hold. The reference REQ-STK-003 keeps one advisory (“shall not”), which is discussed in the advanced block.',
      'L4 model answer: the reference set REQ-STK-001..010 and REQ-SYS-001..010 (load the reference up to Week 4 in the model workspace, or view it in the trace checker). It has 20 requirements, no orphans, all four types, no failing checks and four TBX requirements owned by U-001 and U-002. Strong team sets show budget arithmetic in rationales, methods matched to evidence, criteria that agree with their statements, and interface requirements for the ANSP, emergency services and utility. Weak sets restate needs with “shall”, verify everything by test, or have no interface or constraint requirements. Be candid with students that the reference itself falls short of this guidance in three places, deliberately left as teaching points: it has no interface requirement for the utility (REQ-STK-010 and REQ-SYS-010 are typed constraint) or for the weather-data source that REQ-SYS-004 depends on; its type mix (11 performance, 3 functional, 2 interface, 4 constraint) is performance-heavy; and diverted arrivals below the 20 % reserve have no turnaround requirement. REQ-SYS-003’s direct derivation from CAP-004 is justified in its rationale.',
      'RB-3 formative scoring: draw 10 at random; 3.1–3.4 as % of sample meeting each condition (≥ 90 % → 4; 75–89 → 3; 50–74 → 2; < 50 → 1); 3.5 on the whole set. The trace checker’s proxy uses the heuristic checks (3.1: subject, single shall, vague; 3.2: measurable, TBX, method; 3.3: rationale; 3.4: parent, parent level). Graders must still judge the conditions themselves, for example whether a requirement is solution-independent at its level, or whether a rationale is true.',
      'Graduate R55 memo, strong answer: it walks the six chosen checklist items. It flags at least these against a typical set: “shall not” (REQ-STK-003); single-point values; missing environmental requirements (rain, temperature at vertiports); missing regulatory constraints (the set names weather and noise but no certification-basis requirement); and whether all external interfaces are present (ANSP, utility, emergency services, weather source, public transport). It also proposes thresholds with goals for capacity. A weak answer lists the checklist items without IDs as evidence.',
      'Quiz key: q4-1 a; q4-2 b; q4-3 b; q4-4 b; q4-5 a; q4-6 b; q4-7 c; q4-8 c; q4-9 b; q4-10 a; q4-11 b; q4-12 b; q4-13 b.',
    ],
    cautions: [
      'R55 p.370 advises avoiding “shall not”, but the reference REQ-STK-003 uses it. This is kept deliberately and discussed in w4-advanced; the lead may prefer to rewrite the reference (see docs/authoring/week04_notes.md).',
      'R48 p.144 calls its list the “attributes” of good requirements; the course (and the Week 5 plan) calls them quality characteristics. SEBoK uses “attribute” for data recorded with a requirement (rationale, owner, …; R13 p.559). Point out the two meanings of the word.',
      'R49 (DoD Verification Process, p.149–150) is cited for the four verification methods. It is a verified register reading, but not one of this week’s readings; the w4-attributes block paraphrases everything the quiz uses, so the module is self-sufficient (recommended to the lead: add R49 p.149–150, about 1.5 pp, to the Week 4 readings). q4-10 and q4-12 cite R55, an extension reading, for points the lesson also teaches. DoD calls the fourth method “examination”; the course and RB-3.2 say “inspection”.',
      'Workload: the 9 h syllabus total holds only with the graduate memo narrowed to six checklist items and R55 p.367–372 (≈ 6 pp), at 1.3 h. The full checklist against 15–20 requirements is closer to 2 h; if FD-22 time logs show the memo above about 1.5 h, report the overrun rather than shrinking other items.',
      'Quality-lab heuristics after the independent review (W4-F01): a missing or vague success criterion fails for every type; a count of things (“4 passengers”) no longer bounds a vague word; demonstration or inspection fails when the statement or criterion has a quantitative value outside a condition clause. These remain word-level heuristics: passing them is necessary, not sufficient.',
      'The course type scheme (functional / performance / interface / constraint) is the R55 p.368 checklist item; SEBoK Table 1 uses different categories (R13 p.560). The mapping in the classifier is instructor-authored.',
      'The NEED → REQ-STK → REQ-SYS layering is a course convention combining R13 (needs vs requirements) and R48 (stakeholder requirements vs requirements analysis); neither source uses exactly these three labels.',
      'R55 (MITRE SEG) refers to the cancelled MIL-STD-490A and to 2008–2010 DoD documents; treat its checklist as practice guidance, not current policy.',
      'The quality-lab heuristics (vague-term list, unit pattern, restatement ratio, parent-level rule) are instructor-authored operationalisations of the cited characteristics, labelled as heuristics in the UI.',
      'SEBoK page numbers in citations are PDF page indices (DECISION_LOG W1); printed page numbers differ (for R13 the printed number is 13 lower, e.g. PDF p.565 = printed p.552).',
    ],
  },
  workload: [
    { activity: 'In-class sessions (2 × 75 min)', hours: 2.5 },
    { activity: 'Online direct instruction and the three interactive activities (the F1–F6 practice is done in Session 1)', hours: 0.7 },
    { activity: 'Readings R13, R48, R54 (≈ 23 pp at ≈ 15 pp/h)', hours: 1.5 },
    { activity: 'Readiness quiz Q4 / knowledge check', hours: 0.25 },
    { activity: 'L4 completion: requirements set and self-audit (team share, out of class)', hours: 2.6 },
    { activity: 'Graduate R55 memo (notebook entry 4): R55 p.367–372 (≈ 0.4 h), six checklist items against the team set and one argued disagreement (≈ 0.9 h)', hours: 1.3 },
    { activity: 'Review notebook time log and AI statement', hours: 0.15 },
  ],
  references: [{ reading: 'R55', pages: '365–374' }, { reading: 'R49', pages: '149–150' }],
  review: {
    status: 'independently-reviewed',
    reviewer: 'Independent AI reviewer (Claude): review and sign-off passes',
    date: '2026-10-11',
    report: '_source_cache/review/week04_signoff.md',
    openIssues: [],
  },
}

export default week04
