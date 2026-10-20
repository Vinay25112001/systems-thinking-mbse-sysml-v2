// Week 2, Session 2: writing, checking and tracing requirements; measures; the AeroLink worked examples and the Lab L2
// launch. 75-minute session: 69 minutes of planned content (47 min lecture on 17 slides, 22 min laboratory launch on 4
// slides), the generated "References and credits" slide, and a 6-minute buffer (bufferMinutes). Single source for the
// slide viewer, the reader, the .pptx, the faculty-notes Markdown and the student handout (docs/lectures/PIPELINE.md).
// Governing direction: DECISION_LOG A20 and A21 (TPMs are taught in Week 3, A21 item 5).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week02/WEEK02_LECTURE_OUTLINE.md §3.
//
// Accuracy rules: every citation is a verified register entry at a page whose extracted text supports the claim beside
// it (checked in _source_cache/*.txt); quotations are short and marked; everything else is original explanation. Course
// conventions are labeled (the four requirement types, the minimum requirement record, the REQ-STK/REQ-SYS subject rule,
// the hard-gate/advisory split, the lab minimums, team decision rules). Source gaps are said aloud: INCOSE's Guide to
// Writing Requirements and Needs and Requirements Manual are cited by SEBoK but not held. AeroLink is FICTIONAL; the case
// data live in ./aerolinkCase.ts and the lab minimums in ./labBrief.ts, never retyped. Spoken notes stay at or below 130
// words per minute (./timing.test.ts). No note sentence is repeated in the public text (scripts/check-student-build.mjs).
import type { Block, Lecture, LessonSection } from '../types'
import { formatReference, lectureCredits, lectureReferences } from '../references'
import { need } from '../week01/aerolinkCase'
import {
  AUDIT_RULE, CRITIQUE, DELIBERATE_REQ_GAP, MOES, MOPS, PARTIAL_COVERAGE, REQUIREMENTS, STAKEHOLDER_REQUIREMENTS, STK_DISPOSITIONS, STK_DISPOSITION_FORM, SYSTEM_REQUIREMENTS, UNCERTAINTIES,
  childlessNeeds, childlessStakeholderRequirements, countByType, orphanRequirements, requirement,
} from './aerolinkCase'
import { AUDIT_DISPOSITIONS, CLINIC_CRITERIA, LAB2_MINIMUMS as MIN, LAB2_MINIMUMS_THREE as MIN3, LAB2_TEAM_HOURS, REQ_ADVISORIES, REQ_GATE_TEXT, REQ_HARD_GATES, REQ_RECORD_TEXT } from './labBrief'
import { WEEK2_SESSION1 } from './session1'

export const WEEK2_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const req = requirement
const N_STK = STAKEHOLDER_REQUIREMENTS.length
const N_SYS = SYSTEM_REQUIREMENTS.length
const N_REQ = REQUIREMENTS.length
const N_REF = REQUIREMENTS.filter((r) => r.provenance === 'reference').length
const CHILDLESS_STK = childlessStakeholderRequirements()
const unc = (id: string) => UNCERTAINTIES.find((u) => u.id === id)!
const moe = (id: string) => MOES.find((m) => m.id === id)!
const mop = (id: string) => MOPS.find((m) => m.id === id)!
/** Review M7: the three dispositions, as the lecture names them (labBrief.ts AUDIT_DISPOSITIONS). */
const DISP3 = AUDIT_DISPOSITIONS.map((d) => d.label.toLowerCase())
const DISP3_TEXT = `${DISP3[0]}, ${DISP3[1]}, or ${DISP3[2]}`
const STK_OPEN = CHILDLESS_STK.filter((id) => STK_DISPOSITION_FORM[id] === 'open')
const STK_NO_CHILD = CHILDLESS_STK.filter((id) => STK_DISPOSITION_FORM[id] === 'no-child')

// ------------------------------------------------------------------------------------------------ lesson tables from the case data
const critiqueTable: Block = {
  kind: 'table',
  caption: 'Six flawed drafts, the defect in each with the characteristic it violates, what finds it, and the reference rewrite (FICTIONAL case).',
  header: ['Draft', 'Defect (characteristic)', 'Found by', 'Rewrite'],
  rows: CRITIQUE.map((c) => [`${c.id}: “${c.draft}”`, `${c.defect} (${c.characteristic})`, c.catchBy, `${c.rewriteId}: ${req(c.rewriteId).statement}`]),
}
export const WEEK2_SESSION2: Lecture = {
  week: 2,
  session: 2,
  title: 'ConOps / Requirements',
  subtitle: 'Session 2: Writing, checking and tracing requirements; measures; Lab L2 launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ G. writing requirements (20 min)
    {
      id: 'w2s2-writing',
      title: 'Writing requirements',
      slides: [
        {
          id: 'w2s2-warmup',
          title: 'Warm-up: three questions on Session 1',
          purpose: 'Spaced retrieval of Session 1 (actors and environment, discoveries, capability links), with the answers held to the next slide.',
          minutes: 1,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-scn005-swimlane',
            caption: 'SCN-005 from Session 1, as a memory aid for the warm-up.',
            alt: 'The SCN-005 Weather Disruption swimlane from Session 1: lanes for the duty manager, the system, the pilot, the air traffic service and the passenger under a shaded weather band, with seven numbered steps and three alternate flows.',
          },
          body: [{ kind: 'bullets', items: ['**1** · Is the weather an actor in SCN-005?', '**2** · Name one thing writing SCN-005 exposed', '**3** · Which capability does SCN-003 exercise?'] }],
          sources: [],
          notes: {
            teach: ['Read the three questions, give forty seconds, and ask students to write one-word answers on a card before you move on. Do not reveal on this slide; questions and answers are kept apart so that everyone retrieves before seeing the answer.'],
            why: 'Retrieval at the start of a session strengthens what was learned last time and tells the instructor which idea needs a recap.',
            figure: 'Leave the swimlane up as context; point only at the weather band when reading question 1.',
            transition: 'Here are the answers.',
            timing: '1 min: 15 s read, 45 s write.',
          },
        },
        {
          id: 'w2s2-warmup-reveal',
          title: 'Warm-up: the answers',
          purpose: 'Reveal and justify the warm-up answers in one sentence each.',
          minutes: 1,
          layout: 'bullets',
          body: [
            {
              kind: 'bullets',
              items: [
                '**1** · No: it has no goal and cannot be asked for help; it is the environment',
                '**2** · NEED-011, assumption A-008, or unknown U-001 (TBD-01)',
                '**3** · CAP-003, fleet charging management',
              ],
            },
          ],
          sources: [R('R59', '453')],
          notes: {
            teach: [
              'Reveal each answer with its reason. One: actors are parties outside the system that interact with it, users, roles or other systems with goals or help to give (R59 p.453); weather triggers SCN-005 but is marked as the environment. Two: any of the three discoveries. Three: CAP-003; the scenario derives from the capability it exercises.',
              'If more than a third of the room missed question 1, spend twenty seconds of the buffer on it: actor placement is the first thing the scenario clinic checks today.',
            ],
            why: 'An immediate, reasoned reveal corrects errors before they are rehearsed in the lab.',
            transition: 'Today we write requirements, starting with what a single requirement is made of.',
            timing: '1 min: 20 s per answer.',
          },
        },
        {
          id: 'w2s2-anatomy',
          title: 'Anatomy of a requirement and its attributes',
          purpose: 'Give the parts of a well-formed requirement statement, the binding words, the attributes SEBoK recommends and the course minimum record.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-req-anatomy',
            caption: 'REQ-STK-001 dissected into its parts, with the attribute record that travels with it (FICTIONAL).',
            alt: 'The statement of REQ-STK-001 split into labeled segments: subject, The AeroLink service; shall; action, board; object, at least 90 % of passengers; condition, in each calendar month; criterion, within 15 min of their ride confirmation. Beside it an attribute card: ID REQ-STK-001; type performance; method analysis; criterion 90th-percentile confirmation-to-boarding time at most 15 min per calendar month; rationale, attraction halves at a 15 min wait (A-001); parents NEED-001 and CAP-001; owner Requirements & Compliance lead.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'An agreed obligation to perform a function or have a quality, within constraints',
                '“Shall” binds; “should” and “may” do not; “will” declares purpose',
                'Attributes: rationale, parent, verification criteria, owner, priority …',
                '**Course minimum record:** ID, name, statement, type, criterion or TBD, rationale, parent, method, owner',
              ],
            },
          ],
          sources: [R('R13', '558–559'), R('R54', '330')],
          notes: {
            teach: [
              'SEBoK quotes INCOSE’s Needs and Requirements Manual: a requirement statement is the result of a “formal transformation of one or more needs or parent requirements into an agreed-to obligation for an entity to perform some function or possess some quality within specified constraints with acceptable risk” (R13 p.558). The manual itself is not in our collection; we rely on SEBoK’s quotation.',
              'MITRE on the binding word: in specifications “shall” indicates a binding provision; use “should” or “may” for nonbinding provisions, and “will” for a declaration of purpose or the future tense (R54 p.330).',
              'SEBoK’s useful attributes: rationale, trace to source or parent, system verification success criteria, owner, category, status, criticality and priority. The rationale says why the requirement is needed, the assumptions made and the source of its numbers; defining the verification success criteria helps ensure the requirement is verifiable (R13 p.559).',
              `Give the course minimum record, a course convention the lab tool checks: ${REQ_RECORD_TEXT}. Walk REQ-STK-001 through it on the figure.`,
            ],
            why: 'Students need to see that a requirement is a structured record, not a sentence; every later check (quality, trace, verification) reads one of these fields.',
            figure: 'Read the statement left to right, segment by segment; then read the attribute card, stopping on the rationale (the source of the 15 minutes) and the parents (the trace).',
            examples: ['Ask: why the 90th percentile rather than the average? The rationale answers it: the passengers most likely to stop using the service are in the tail, and an average can hide them.'],
            misconceptions: [{ claim: 'The rationale restates the requirement in other words.', correction: 'It records why the requirement exists, its assumptions and where its numbers come from; a restatement adds nothing, and the lab tool rejects one.' }],
            transition: 'A record can be complete and the requirement still poor. What makes a requirement good?',
            timing: '3 min: 45 s definition, 30 s binding words, 1 min attributes, 45 s the record on the figure.',
          },
        },
        {
          id: 'w2s2-characteristics',
          title: 'Characteristics of good requirements',
          purpose: 'Give a sourced, layered checklist from the DoD and MITRE lists, separate individual from set characteristics, and name the source gap.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-characteristics',
            caption: 'The DoD and MITRE lists of good-requirement characteristics: what both name, and what only one does.',
            alt: 'Three columns. DoD only: necessary; clear and concise; complete; able to be validated; operationally effective and survivable. Both lists: unambiguous; traceable; measurable; verifiable or testable; consistent; feasible; singular (MITRE: specific and singular); unique (MITRE: uniquely identified). MITRE only: performance specified; design-free; uses shall. A side tab reads set-level: complete, consistent. The footer names the DoD Guidebook and the MITRE SEG.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['The DoD and MITRE lists share eight characteristics', 'Complete and consistent are judged on the set', 'Checking against them is requirement verification', 'INCOSE’s guide, which SEBoK cites, is not in our collection'],
            },
          ],
          sources: [R('R48b', '144'), R('R54', '329–330'), R('R13', '566')],
          notes: {
            teach: [
              'The DoD guidebook lists the attributes of good requirements: necessary; unique; unambiguous; clear and concise; complete; consistent; technically feasible; traceable; measurable; verifiable, for example testable; able to be validated; operationally effective and survivable; and singular (R48b p.144).',
              'MITRE’s list: traceable to a source and an authoritative person or document; unambiguous, tested from different stakeholders’ perspectives; specific and singular; measurable; performance specified; testable, specific and quantitative whenever possible; consistent with the other requirements; feasible; uniquely identified; design-free, describing what, not how; and using “shall” (R54 pp.329–330).',
              'Read the middle column of the figure: eight characteristics appear in both, under slightly different names. Some apply to one requirement on its own, singular, measurable, design-free; two can only be judged on the set, complete and consistent.',
              'Say where this sits: SEBoK calls the check of whether requirements are well formed “requirement verification”, and points to INCOSE’s Guide to Writing Requirements for the detailed rules (R13 p.566). That guide is not in our collection, so the course builds its checks on the DoD and MITRE lists. The lab tool turns some of them into hard gates and some into advisory warnings; slide 11 explains why.',
            ],
            why: 'A sourced checklist stops quality from being a matter of taste, and the overlap shows students which characteristics two independent authorities agree on.',
            figure: 'Start in the middle column, the agreed core; then the two sides. Point at the set-level tab: these two need the whole set in view.',
            examples: ['Ask for one characteristic a single requirement can never show: consistent. Two requirements can each be perfect and contradict each other.'],
            misconceptions: [{ claim: 'A requirement that passes every characteristic is the right requirement.', correction: 'Being well formed is requirement verification; whether it is the right requirement is requirement validation, a separate question (slide 14).' }],
            transition: 'Characteristics judge each requirement. Categories organize the set so that gaps show.',
            timing: '4 min: 1 min DoD, 1 min MITRE, 1 min the overlap and set level, 1 min requirement verification and the source gap.',
          },
        },
        {
          id: 'w2s2-categories',
          title: 'Types and categories: organizing a set so gaps show',
          purpose: 'Give SEBoK’s example categories and MITRE’s checklist kinds, and the course’s four types, so that a team can see what its set leaves out.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-types-grid',
            caption: `The ${N_REQ} AeroLink requirements by course type, reference and proposed, and SEBoK’s five categories read for the set (instructor’s reading).`,
            alt: `Horizontal bars by course type with counts split into reference and proposed: ${countByType(REQUIREMENTS).map((t) => `${t.type} ${t.n}`).join(', ')}. On the right, SEBoK’s five categories read for AeroLink: Function/Performance addressed; Fit/Operational addressed (interfaces, operating environment); Form none yet, dashed amber, a gap to discuss; Quality addressed (fleet availability); Compliance addressed (noise, land use).`,
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'SEBoK categories: function/performance, fit/operational, form, quality, compliance',
                'A complete set addresses every category',
                'MITRE: a function, a performance, a design constraint or an interface reference',
                '**Course types:** functional, performance, interface, constraint',
              ],
            },
          ],
          sources: [R('R13', '560'), R('R55', '368–369')],
          notes: {
            teach: [
              'SEBoK gives an example set of categories derived from the INCOSE manual: function and performance; fit and operational, including interfaces, human interaction and the induced and natural environments; form, the physical characteristics; quality, the “-ilities”; and compliance with standards and regulations. Organizations categorize differently, but for the set to be complete each category topic must be addressed (R13 p.560).',
              'MITRE’s system-level checklist: each requirement describes something relevant, a function the system must perform, performance a function must provide, a constraint on the design, or a reference such as an interface definition; and the set includes legal and regulatory constraints, environmental design requirements and all external interfaces (R55 pp.368–369).',
              'The course uses four types, a course convention used by the reference set and the deliverable specification: functional, performance, interface and constraint. The lab asks for at least three of the four. Use SEBoK’s categories as a second lens on the finished set.',
              'Read the figure’s right panel: the AeroLink set has nothing yet in form. Ask whether that is a gap or a reasoned choice at service level. Model answer: at this level it is reasonable, because physical characteristics of the aircraft and vertiports are derived after the Week 3 trade; it must still be recorded.',
            ],
            why: 'Categories make absences visible: a set with no interface requirement at all is almost certainly missing something, and only an organized view shows it.',
            figure: 'Left: four bars, each split reference and proposed. Right: the five categories, four addressed and one dashed. The dashed one is a question for the class, not an error.',
            misconceptions: [{ claim: 'The type of a requirement is a matter of opinion, so it does not matter.', correction: 'Borderline cases exist, but the type drives the verification method and exposes gaps in the set; it is recorded and defended.' }],
            transition: 'The commonest error at this level is not a missing category. It is designing inside the requirement.',
            timing: '3 min: 1 min SEBoK, 45 s MITRE, 30 s course types, 45 s the figure question.',
          },
        },
        {
          id: 'w2s2-level',
          title: 'Level, white space and derived requirements',
          purpose: 'Teach the right level of detail: leave white space for designers, avoid both extremes, and keep derived requirements traceable.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-zoom',
            caption: 'Three levels of the same turnaround: the service, the charging system, and the charger rating that is derived later (FICTIONAL).',
            alt: 'Three nested levels joined by zoom lines. The service level box: REQ-STK-005, dispatch-ready within 25 min of arrival. Inside it the charging-system box: REQ-SYS-001, charge from 20 % to the threshold within 20 min. Inside that a greyed dashed box: charger rating and count, derived later, after the Week 3 trade. A label reads white space left for the designer.',
          },
          body: [{ kind: 'bullets', items: ['Give designers what they must know; leave white space', 'Too high: the designer guesses; too low: the design is constrained', 'Derived requirements come from solution decisions: keep them traceable', 'Write at the level of the system of interest'] }],
          sources: [R('R55', '367'), R('R55', '371'), R('R48', '146'), R('R13', '558')],
          notes: {
            teach: [
              'MITRE’s rule of thumb: provide designers and test engineers with what they must know, but leave as much white space as possible for clever designers to explore design options (R55 p.367).',
              'The two failure modes, also MITRE: with too high a level of detail the designer has insufficient information and has to guess what was intended; too low a level of detail can artificially constrain the design and prevent innovative solutions, often because people want something they have already seen (R55 p.371).',
              'The DoD guidebook on derived requirements: during architecture design, derived requirements come from solution decisions, and it is essential to identify them and keep them traceable and part of the allocated requirements (R48 p.146). SEBoK’s level rule from Session 1 applies: write at the level where the system of interest sits (R13 p.558).',
              'Walk the zoom. At service level, a 25-minute turnaround. At charging-system level, a 20-minute charge. The charger’s power rating and the number of chargers are not requirements yet: they are derived after the Week 3 trade study compares alternatives, and then they trace to REQ-SYS-001.',
            ],
            why: 'Designing inside requirements is the commonest graduate-level error; it removes trade space before the trade study exists.',
            figure: 'Zoom in twice. At each level read the obligation; at the innermost, greyed box, stop: that box is empty on purpose until Week 3.',
            misconceptions: [{ claim: 'A more detailed requirement is always a better one.', correction: 'Detail beyond what the level needs constrains the design; MITRE names both too little and too much detail as failures.' }],
            transition: 'Word-level rules next: negatives, ranges, thresholds and the values nobody knows yet.',
            timing: '3 min: 45 s white space, 45 s the two failure modes, 45 s derived requirements, 45 s the zoom.',
          },
        },
        {
          id: 'w2s2-negatives-tbd',
          title: 'Negatives, ranges, thresholds and TBDs',
          purpose: 'Teach the word-level rules with their reasons, and TBD/TBR management, on a reference requirement that is itself a negative with a TBD.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-negative-tbd',
            caption: 'A negative stakeholder requirement with a TBD, the unknown that tracks it, and the positive system requirement that answers it (FICTIONAL).',
            alt: 'A card with REQ-STK-003, The AeroLink service shall not dispatch a flight when the forecast at its departure or arrival vertiport exceeds the approved aircraft weather limits (TBD-01), with shall not and TBD-01 outlined in amber. An arrow from TBD-01 leads to a card U-001, aircraft weather limits not published, owner Director of Flight Operations, close by the requirements baseline. A second card, REQ-SYS-004, The operations system shall place a dispatch hold on any vertiport whose forecast wind or gust within the next 30 min exceeds the aircraft limit (TBD-01), with its TBD-01 also linked to U-001. A caption line: a negative is hard to prove; the positive hold can be demonstrated.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Avoid “shall not”: a negative is hard to prove',
                'Avoid “maximize” and “minimize”; use ranges, not single points',
                'Threshold: must be met; objective: better has value up to it',
                'TBD: value unknown; TBR: known, low confidence; each with an owner',
              ],
            },
          ],
          sources: [R('R55', '370'), R('R13', '565')],
          notes: {
            teach: [
              'MITRE’s checklist, with its reasons (R55 p.370): avoid “shall not”, because it is very difficult to prove a negative. Avoid “maximize” and “minimize”, because they force an engineer to judge when the design is good enough and invite a legal argument. Avoid single-point values and use ranges, because a test at exactly the stated value, or one that meets the intent but not the number, causes disputes. Distinguish threshold values, which must be provided, from objective values, where better performance has value but not beyond the objective.',
              'SEBoK on unknowns (R13 p.565): when a value is unknown, write TBD in its place; when it is known but confidence is low, mark it TBR. Tracking these TBXs shows how mature the set is, and unresolved TBXs become risk. TBX management means identifying each, the work needed to close it, and its owner.',
              `Now apply both to a reference requirement: “${req('REQ-STK-003').statement}” Ask: is it verifiable? It is a negative, and it depends on an unknown. Its TBD-01 is tracked by U-001, owned by the ${unc('U-001').owner}. The system requirement REQ-SYS-004 answers the negative with something positive and demonstrable: the operations system places a dispatch hold. One defensible position: keep the stakeholder requirement as the regulator would say it, and verify it through the positive system requirement.`,
            ],
            why: 'Word rules without reasons become superstition; with reasons, students can judge the exceptions, as the reference set itself shows.',
            figure: 'Point at the two amber marks on REQ-STK-003; follow the TBD-01 arrow to U-001 and read its owner; then show REQ-SYS-004 pointing at the same unknown.',
            examples: ['A threshold and objective pair in MITRE’s style: “at least 300 trips per day, with a goal of 340” would make 300 the threshold and 340 the objective; AeroLink states only the threshold.'],
            misconceptions: [{ claim: 'A requirement with a TBD is not ready to be written down.', correction: 'Writing it with a tracked TBD is the right move: the obligation is recorded and the unknown has an owner and a date.' }],
            transition: 'Every requirement also needs a way to show it is met, decided now.',
            timing: '3 min: 1.25 min MITRE’s rules, 45 s TBX management, 1 min REQ-STK-003.',
          },
        },
        {
          id: 'w2s2-verification-method',
          title: 'A verification method for every requirement',
          purpose: 'Plan verification while writing: the four methods, the DoD and SEBoK names, certification, and why choosing the method disciplines the wording.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-methods',
            caption: 'Four verification methods, each with one AeroLink requirement, and certification as a fifth method (FICTIONAL).',
            alt: 'Four method cards with icons. Inspection: REQ-STK-007, a step-free route at every vertiport. Analysis: REQ-STK-004, capacity of at least 300 trips per day. Demonstration: REQ-STK-006, dispatch blocked with an open no-go fault. Test: REQ-SYS-001, charge time at most 20 min. A fifth dashed card: Certification, by an outside authority (SEBoK), for example airworthiness. A note: inspection is the DoD’s examination.',
          },
          body: [{ kind: 'bullets', items: ['Every requirement needs a verification method', 'Inspection, analysis, demonstration, test', 'Certification: a fifth method, by an outside authority', 'Define the success criteria while writing'] }],
          sources: [R('R55', '370'), R('R49', '149–150'), R('R16', '769'), R('R13', '566')],
          notes: {
            teach: [
              'MITRE: every requirement must have a verification method identified (R55 p.370). The DoD guidebook defines four: demonstration, where visual observation is the primary means and quantitative assurance is not required; examination, visual inspection of equipment and evaluation of drawings and design data; analysis, recognized analytic techniques including computer models; and test, under fully controlled and traceable conditions, producing data to evaluate quantitative characteristics (R49 pp.149–150).',
              'SEBoK records the INCOSE handbook’s four, inspection, analysis, demonstration and testing, plus certification as a fifth: verification against legal or industrial standards by an outside authority, airworthiness certification being the best known (R16 p.769). The course uses inspection, analysis, demonstration and test; inspection is the DoD’s examination.',
              'Why decide now: SEBoK says defining the verification success criteria and method when the requirement is written helps ensure it is worded properly and verifiable (R13 p.566). If you cannot say how you would show it is met, the wording is wrong.',
            ],
            why: 'Choosing the method at writing time is the cheapest quality check there is, and it sets up the verification cases of Week 12.',
            figure: 'One requirement per method: a route you look at, a capacity you calculate, an interlock you watch work, a charge time you measure. The dashed fifth card is the regulator’s method.',
            misconceptions: [{ claim: 'Test is always the strongest method, so use it everywhere.', correction: 'The method must fit the requirement: a step-free route is inspected; a capacity two years out can only be analyzed now.' }],
            transition: 'That is the method. Now the AeroLink requirements, worked.',
            timing: '2 min: 45 s DoD methods, 45 s SEBoK and certification, 30 s why now.',
          },
        },
      ],
    },
    // ============================================================================================ H. the AeroLink requirements, worked (11 min)
    {
      id: 'w2s2-worked',
      title: 'The AeroLink requirements, worked',
      slides: [
        {
          id: 'w2s2-worked-chains',
          title: 'Worked example IV: two chains and the reasoning in the rationale',
          purpose: 'Show rationale as engineering argument on two chains, one with a numeric budget and one with a tracked TBD.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w2s2-two-chains',
            caption: 'Two chains from need to system requirement. The rationale beside each arrow says why the requirement exists and where its value comes from (FICTIONAL).',
            alt: 'Two vertical chains. Left: NEED-001, CAP-001, REQ-STK-001, REQ-SYS-005, with call-outs: A-001, attraction halves at 15 min, beside REQ-STK-001; a negligible part of the 15 min budget, beside REQ-SYS-005. Right: NEED-010, CAP-010, REQ-STK-010, REQ-SYS-010, with call-outs: exceeding trips protection or incurs penalties, beside REQ-STK-010; enforced in the system, not by procedure, beside REQ-SYS-010. REQ-STK-010 and REQ-SYS-010 carry TBD-02 linked to a small U-002 card. Each requirement shows its verification method.',
          },
          body: [],
          sources: [R('R13', '559'), R('R13', '565')],
          notes: {
            teach: [
              `Chain one. NEED-001, a short and predictable wait, through CAP-001 to REQ-STK-001: “${req('REQ-STK-001').statement}” Its rationale gives the source of the number: ${req('REQ-STK-001').rationale}`,
              `Down one level: “${req('REQ-SYS-005').statement}” The rationale makes the 60 seconds an allocation from the 15-minute budget: ${req('REQ-SYS-005').rationale}`,
              `Chain two. NEED-010, the utility’s connection limit, through CAP-010 to REQ-STK-010, whose value is TBD-02 because the connection agreements are not signed (unknown U-002, owner the ${unc('U-002').owner}). Then REQ-SYS-010: “${req('REQ-SYS-010').statement}” Its rationale states a design-level argument without naming a design: ${req('REQ-SYS-010').rationale}`,
              'Point at the methods: analysis for a monthly percentile, test for a latency and for a power limit. SEBoK’s rationale attribute records why a requirement is needed, its assumptions and the source of its numbers (R13 p.559); a TBD with an owner is TBX management in practice (R13 p.565).',
            ],
            why: 'Students write rationales that restate the requirement; two worked chains show rationale as the argument that justifies a value and a level.',
            figure: 'Read each chain top to bottom, pausing at each call-out. On the right chain, follow the TBD-02 link to U-002.',
            misconceptions: [{ claim: 'A system requirement must have exactly one stakeholder requirement as its parent.', correction: 'REQ-SYS-005 has two parents, REQ-STK-001 and CAP-002, and REQ-SYS-003 derives from a capability directly, with the reason stated in its rationale.' }],
            transition: 'The next chain shows a Week 1 correction arriving in the requirements.',
            timing: '3 min: 1.25 min chain one, 1.25 min chain two, 30 s methods.',
          },
        },
        {
          id: 'w2s2-worked-noise',
          title: 'Worked example V: a Week 1 correction reaches the requirements',
          purpose: 'Show that the package is one connected body of work: the corrected noise need requires a second stakeholder requirement, which flows down to a system requirement and a measure pair.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-noise-split',
            caption: 'The corrected NEED-003 has two bounds; each needs its own requirements and measure. The second column is proposed (FICTIONAL).',
            alt: 'A NEED-003 card at the top splits into two bars: level of each event, 65 dBA at the pad edge; and number of events before 07:00 and after 20:00, the agreed cap. Under the first bar REQ-STK-002 leads to REQ-SYS-002, measured by MOE-003. Under the second bar REQ-STK-011 (proposed, TBD-03 linked to U-003) leads to REQ-SYS-011 (proposed), measured by MOE-007 (proposed). A ghost label reads the reference set had an empty box here.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Corrected NEED-003: the loudness of each event and the number of evening and early-morning events',
                'REQ-STK-002 covers loudness only',
                'Proposed REQ-STK-011: the event cap (TBD-03)',
                'It flows down: REQ-SYS-011, MOE-007, MOP-010',
              ],
            },
          ],
          sources: [R('R13', '558–559')],
          notes: {
            teach: [
              `Recall the Week 1 correction. NEED-003 now reads: “${need('NEED-003').statement}” Two bounds.`,
              `The reference stakeholder requirement covers one: “${req('REQ-STK-002').statement}” So does the aircraft requirement under it, and so does MOE-003, the noise compliance rate.`,
              `The case therefore proposes a second stakeholder requirement: “${req('REQ-STK-011').statement}” The cap is unknown, so it is TBD-03, tracked by U-003, owned by the ${unc('U-003').owner}. It flows down to the scheduling function, REQ-SYS-011, because scheduling is where the number of movements per pad and hour is decided, and to a measure pair, MOE-007 and MOP-010.`,
              'Discussion, one minute in pairs: is the event cap a requirement on the service, or simply a term of the noise agreement? Model answer: both. The agreement is the source; the requirement is the service’s obligation to honor it, written so it can be verified and traded. It is also the shared variable of the throughput conflict recorded in Week 1, so the Week 3 trade cannot run until it is a number.',
            ],
            why: 'Showing one correction propagate from need to capability to requirement to measure is the clearest argument for traceability, and it is the A21 requirement that corrected data flow through the package.',
            figure: 'Read the need, then split it: left column is the reference chain, right column the proposed one. Point at the ghost label: that empty box is what an untraced correction looks like.',
            examples: ['SEBoK: a detailed analysis of a single need statement may result in multiple requirements (R13 p.559). NEED-003 is the course’s cleanest example.'],
            misconceptions: [{ claim: 'One need maps to one requirement.', correction: 'A need with two bounds needs at least two requirements; NEED-003 is the example.' }],
            transition: 'Now the review skill: six flawed drafts.',
            timing: '3 min: 30 s the need, 45 s the reference chain, 45 s the proposed chain, 1 min the pair discussion.',
          },
        },
        {
          id: 'w2s2-worked-critique',
          title: 'Worked example VI: critique and rewrite',
          subtitle: 'Pairs diagnose two drafts each; then the reveal (FICTIONAL)',
          purpose: 'Practice requirement verification as a review skill on six flawed drafts, and show which defects a word-level check finds and which need engineering judgment, which is why the lab tool has hard gates and advisories.',
          minutes: 5,
          layout: 'figure',
          figure: {
            id: 'w2s2-critique-table',
            caption: 'Six flawed drafts, the defect in each with its source, what finds it, and the rewrite (FICTIONAL).',
            alt: `A table with columns Draft, Defect (characteristic), Caught by and Rewrite. ${CRITIQUE.map((c) => `${c.id}: ${c.draft} Defect: ${c.defect} Caught by ${c.catchBy}. Rewrite ${c.rewriteId}.`).join(' ')} The engineering-judgment rows are outlined.`,
          },
          body: [],
          sources: [R('R48b', '144'), R('R54', '329–330'), R('R55', '367'), R('R55', '370'), R('R13', '565–566')],
          notes: {
            teach: [
              'Show the six drafts without the defect column. Assign pairs two drafts each (F1–F2, F3–F4, F5–F6 round the room), two minutes: name the defect, the characteristic it violates, and a rewrite.',
              'Reveal row by row with the worked solution below, about twenty seconds each, taking one pair’s answer first.',
              `Draw the lesson for the lab tool. Word-level checks find F2, F4, F5 and F6: a modal verb, a vague word, “maximize”, a negative, a missing bound. F1 and F3 need engineering judgment: seeing that “safe” is many requirements, or that “two 350 kW chargers” fixes the design, is a reviewer’s call (requirement verification is a review activity, R13 p.566). That is why the tool treats only unmistakable defects as hard gates (${REQ_HARD_GATES.length} of them, among them exactly one “shall”, a parent that exists, a method and an owned TBD) and one word-level sign is itself a gate: a short list of words that can never define compliance, such as “maximize” or “unsafe”, blocks unless a bounded value or a TBD defines the word, so F4 and F5 would not count. The other word-level signs are advisories that never block: a good requirement can contain “not” or “and”.`,
            ],
            why: 'Diagnosing flawed drafts is the skill the graduate memo and the grader’s sample audit both use; and seeing what an automatic check cannot judge keeps students from trusting a green tick over their own review.',
            figure: 'Cover the right two columns, reveal them one row at a time. The outlined rows, F1 and F3, are the ones no word-level rule catches.',
            workedSolution: CRITIQUE.map((c) => `${c.id}: “${c.draft}” Defect: ${c.defect} Characteristic: ${c.characteristic} (${c.cite.reading} p.${c.cite.pages}). Found by: ${c.catchBy}. Rewrite, ${c.rewriteId}: “${req(c.rewriteId).statement}”`),
            misconceptions: [
              { claim: 'If the tool shows no hard-gate failure, the requirement is good.', correction: 'The gates catch unmistakable defects only; F1-type and F3-type problems pass them and need a reviewer.' },
              { claim: 'Every “and” makes a requirement compound.', correction: '“Including every charge” or “before 07:00 and after 20:00” qualify one obligation; that is why “and” is an advisory, not a gate.' },
            ],
            transition: 'Good requirements must also be traced, in both directions.',
            timing: '5 min: 2 min pairs, 2 min reveal, 1 min the lesson for the tool.',
          },
        },
      ],
    },
    // ============================================================================================ I. traceability and measures (14 min)
    {
      id: 'w2s2-trace',
      title: 'Traceability and measures',
      slides: [
        {
          id: 'w2s2-traceability',
          title: 'Bidirectional traceability: orphans and childless parents',
          purpose: 'Define the audit from the DoD guidebook and SEBoK: bottom-up and top-down trace, orphans and childless parents, the traceability matrix and change impact.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-orphan-childless',
            caption: 'A generic trace graph with one orphan requirement and one childless parent.',
            alt: 'Three rows of small boxes with trace arrows: needs N-1, N-2, N-3; stakeholder requirements S-1, S-2, S-3; system requirements Y-1 to Y-4. Y-4 has no upward arrow and is circled orphan (no source). N-3 has no downward arrow and is circled childless parent.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Bottom-up: every derived requirement traces to its source',
                'Bidirectional: no orphans below, no childless parents above',
                'The traceability matrix records decomposition, derivation, allocation and rationale',
                'Traceability supports the impact analysis of changes',
              ],
            },
          ],
          sources: [R('R45', '118–119'), R('R13', '565'), R('R14', '478')],
          notes: {
            teach: [
              'The DoD guidebook: requirements management provides bottom-up traceability from any derived lower-level requirement up to the applicable source. Bidirectional traceability ensures that approved changes create no “orphaned” lower-level requirements, and that higher-level requirements are flowed down so there are no “childless parent” higher-level requirements, each being ultimately addressed by lower-level requirements and system element designs (R45 p.118).',
              'The same source: the systems engineer maintains a requirements traceability matrix capturing every requirement, its decomposition or derivation and allocation history, and the rationale for all entries and changes (R45 p.119).',
              'SEBoK: traceability helps ensure the requirements trace to their needs and are correct and complete, and it is used to assess the impact of changes across the life cycle (R13 p.565). Its requirements-management article lists “needs and requirements not traced to a source” as one measure of the state of a set (R14 p.478).',
              'Name the word “ultimately”: a childless stakeholder requirement in Week 2 is not automatically a defect, because allocation continues in Weeks 4 and 5. What is a defect is a childless parent with no recorded disposition.',
              `State the course’s audit rule before the worked audit: ${AUDIT_RULE}`,
            ],
            why: 'Students need the audit vocabulary before they audit, and the word “ultimately” prevents them treating every open item as an error.',
            figure: 'Find the box with no arrow up: an orphan, a requirement nobody asked for. Find the box with no arrow down: a childless parent, a need nobody has met.',
            misconceptions: [{ claim: 'An orphan can be fixed by linking it to the nearest plausible parent.', correction: 'A false link hides the problem; either find the real source, or the requirement may not be needed.' }],
            transition: 'Now the audit on the instructor’s own baseline.',
            timing: '3 min: 1 min DoD trace, 30 s the matrix, 45 s SEBoK, 45 s “ultimately”.',
          },
        },
        {
          id: 'w2s2-worked-audit',
          title: 'Worked example VII: auditing the AeroLink trace',
          purpose: 'Apply the audit to the reference baseline: no orphans, one deliberate childless need with its reason, and childless stakeholder requirements each with a disposition.',
          minutes: 4,
          layout: 'figure',
          figure: {
            id: 'w2s2-trace-matrix',
            caption: `Needs by stakeholder requirements, and stakeholder requirements by the number of system requirements under them. NEED-011 is the one deliberate gap; childless stakeholder requirements carry their disposition, record why not: O, an open item, or R, no child needed. Proposed columns are marked †. FICTIONAL.`,
            alt: `An upper matrix with NEED-001 to NEED-017 as rows and REQ-STK-001 to REQ-STK-017 as columns, proposed columns 011 to 017 marked with a dagger; a filled cell marks each requirement’s parent need. ${STAKEHOLDER_REQUIREMENTS.map((r) => `${r.id.slice(-3)} under ${r.parents.filter((p) => p.startsWith('NEED')).join(' and ')}`).join('; ')}. The NEED-011 row is empty and highlighted amber, labeled deliberate gap (exposed by SCN-005). A lower strip shows, for each stakeholder requirement, the number of system requirements under it; the childless ones are marked ${CHILDLESS_STK.map((id) => `${id.slice(-3)} ${STK_DISPOSITION_FORM[id] === 'no-child' ? 'R' : 'O'}`).join(', ')}. A legend explains filled cells, the dagger, O and R.`,
          },
          body: [],
          sources: [R('R45', '118')],
          notes: {
            teach: [
              `Backward first: every one of the ${N_REQ} requirements has a parent that exists, so there are ${orphanRequirements().length === 0 ? 'no orphans' : 'orphans'}. Every one reaches a Week 1 need through its parents.`,
              `Forward from the needs: one childless need, ${childlessNeeds().join(', ')}. ${DELIBERATE_REQ_GAP.finding} ${DELIBERATE_REQ_GAP.why}`,
              `Ask the class for the wrong fix before you give it. ${DELIBERATE_REQ_GAP.wrongFix} The disposition: ${DELIBERATE_REQ_GAP.disposition}`,
              `Say the audit rule: a need is covered only by a stakeholder requirement that names it. That is why ${DELIBERATE_REQ_GAP.need} sits on its own capability: had it stayed on CAP-005, REQ-STK-003 would have reached it through the capability and hidden the gap.`,
              `Forward from the stakeholder requirements: ${CHILDLESS_STK.length} have no system requirement yet. Every finding gets one of three dispositions: ${DISP3_TEXT}. Here all are “record why not”, in two forms. Open items, marked O: ${STK_OPEN.join(', ')}, allocated in Weeks 3 to 5. No child needed, marked R, because they are verified at service level: ${STK_NO_CHILD.join(', ')}.`,
              `Partial coverage gets the same treatment: ${PARTIAL_COVERAGE.map((p) => `${p.by} covers ${p.covered} for ${p.need}, not ${p.missing}`).join('; ')}. Each is an open item.`,
            ],
            why: 'Auditing the instructor’s own baseline, with its gap left in view, models the honesty the rubric rewards and shows what a disposition looks like.',
            figure: 'Scan the upper matrix for an empty row: NEED-011, amber. Then the strip below: read the O and R letters, which are the dispositions.',
            misconceptions: [{ claim: 'A complete audit means every row and column has a mark.', correction: 'A complete audit means every empty row or column has a disposition; marks added to hide a gap make the audit worse.' }],
            transition: 'Auditing whether requirements are well formed and traced is one question. Whether they are the right requirements is another.',
            timing: '4 min: 30 s backward, 1.5 min the deliberate gap, the audit rule and the wrong fix, 1.5 min childless stakeholder requirements, 30 s partial coverage.',
          },
        },
        {
          id: 'w2s2-req-vv',
          title: 'Requirement verification versus requirement validation',
          purpose: 'Keep the two questions about requirements apart, and apart from system verification and validation, before Week 12.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-vv-grid',
            caption: 'Verification and validation applied to the requirements this week, and to the system in Week 12.',
            alt: 'A two-by-two grid. Rows: the requirements, the system. Columns: verification, validation. Top row, highlighted this week: are they well formed?; are they the right requirements, faithful to the needs and achievable? Bottom row, dimmed: Week 12, system verification; Week 12, system validation. A note reads SEBoK: requirement verification and validation are not system verification and validation.',
          },
          body: [{ kind: 'bullets', items: ['Requirement verification: are they well formed?', 'Requirement validation: are they the right ones, faithful to the needs and achievable?', 'Neither is system verification or validation', 'Methods: peer review; comparison with the characteristics and the needs'] }],
          sources: [R('R13', '566')],
          notes: {
            teach: [
              'SEBoK separates two assessments of requirements (R13 p.566). Requirement verification asks whether the requirements are well formed: whether each requirement and the set have the characteristics and follow the rules of the organization’s criteria. Requirement validation asks whether we have the right requirements: whether they clearly communicate the intent of the needs and parent requirements they were transformed from, and whether they are correct and achievable.',
              'SEBoK is explicit that these are not the same as system verification and system validation, which come in Week 12. Its methods for both are peer review and comparison of each requirement against the characteristics and the integrated set of needs.',
              'Map today: the critique and the hard gates were requirement verification; the noise correction and the deliberate gap were requirement validation, because they asked whether the set says what the needs need.',
            ],
            why: 'The four words are routinely confused; separating them now saves a week of confusion in Week 12.',
            figure: 'Top row is this week; bottom row waits for Week 12. Read across the top: well formed, then right.',
            misconceptions: [{ claim: 'Validating requirements means testing the system against them.', correction: 'That is system verification; requirement validation asks whether the requirements faithfully express the needs.' }],
            transition: 'Requirements say what the system must do. Measures say how we will know it is working.',
            timing: '2 min: 1 min the two questions, 30 s not system V&V, 30 s mapping today.',
          },
        },
        {
          id: 'w2s2-moe-mop',
          title: 'Measures of effectiveness and measures of performance',
          purpose: 'Define MOE, MOP and KPP from MITRE, place measures in SEBoK’s frame, and defer TPMs to Week 3 with the reason.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-measures-pyramid',
            caption: 'From objective to measure: MOEs in the users’ terms, MOPs in the system’s, with TPMs left for Week 3.',
            alt: 'A pyramid with levels from top to bottom: Objective (MGO); MOE, mission success in the users’ view; MOP, a system characteristic measured under specified conditions; TPM, greyed and dashed, Week 3. On the right an example: MGO-005, then MOE-001, then MOP-001 and MOP-002.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'MOE: mission success under stated conditions, from the users’ viewpoint',
                'MOP: a physical or functional characteristic, measured under stated conditions',
                'KPP: a stakeholder-defined, minimal and critical measure',
                'TPMs: Week 3, with technology and risk',
              ],
            },
          ],
          sources: [R('R54', '330–331'), R('R10', '544'), R('R15', '532')],
          notes: {
            teach: [
              'MITRE’s definitions (R54 pp.330–331). Measures of effectiveness are measures of mission success stated under specific environmental and operating conditions, from the users’ viewpoint; they relate to overall operational success criteria such as mission performance, safety, availability and security. Measures of performance characterize specific physical or functional characteristics of the system’s operation, measured under specified conditions; they differ from MOEs in that they are used to decide whether the system meets the performance requirements needed to satisfy the MOE. A key performance parameter is a stakeholder-defined measure of minimal and critical performance and acceptance.',
              'SEBoK places measures at the start of the life cycle: in business or mission analysis, measures are quantitative metrics used to validate the system of interest against the objectives, expressed as measures of effectiveness (R10 p.544). Its measurement article says technical measurement includes MOEs, MOPs and technical performance measures (R15 p.532).',
              'Say why TPMs wait for Week 3: they track a design parameter whose value is still uncertain as the design matures. Every reference TPM tracks a requirement made risky by a technology or a risk, so they are taught beside technology readiness and risk.',
            ],
            why: 'The MOE and MOP split is the bridge between what users value and what engineers measure; deferring TPMs keeps the densest week manageable and teaches them where they are used.',
            figure: 'Read top down: an objective, measured from the users’ side by an MOE, supported by MOPs on the system side. The greyed base is next week.',
            misconceptions: [{ claim: 'An MOE is just a more important MOP.', correction: 'The difference is viewpoint: an MOE is mission success as users see it; an MOP is a system characteristic that supports it.' }],
            transition: 'Here are the AeroLink measures, linked to what they measure.',
            timing: '3 min: 1.5 min MITRE, 45 s SEBoK, 45 s TPMs in Week 3.',
          },
        },
        {
          id: 'w2s2-worked-measures',
          title: 'Worked example VIII: the AeroLink measures',
          purpose: 'Show measure linkage and measurement rationale on the reference, including the measure pair the noise correction needs.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w2s2-measures-links',
            caption: 'How the AeroLink measures link objectives, needs and capabilities to requirements, with their data sources. Dashed items are proposed (FICTIONAL).',
            alt: 'Two clusters of linked boxes. First: MGO-005, NEED-001 and CAP-001 are measured by MOE-001 (booking and boarding timestamps); MOP-001 (scheduling event log) and MOP-002 (charger session records) measure MOE-001 and also REQ-SYS-005, REQ-SYS-001 and REQ-STK-005. Second: NEED-003 is measured by MOE-003 (per event, reference) and MOE-007 (event cap, proposed, dashed); MOP-004 measures MOE-003 and MOP-010 (proposed) measures MOE-007. Arrows are labeled measures.',
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              `${moe('MOE-001').id}: ${moe('MOE-001').text} Threshold ${moe('MOE-001').threshold} ${moe('MOE-001').unit}; data from ${moe('MOE-001').dataSource.toLowerCase()}. It measures NEED-001, CAP-001 and the objective MGO-005.`,
              `Two MOPs support it: ${mop('MOP-001').name.toLowerCase()} (${mop('MOP-001').threshold} ${mop('MOP-001').unit}) and ${mop('MOP-002').name.toLowerCase()} (${mop('MOP-002').threshold} ${mop('MOP-002').unit}). Each also measures a system requirement, REQ-SYS-005 and REQ-SYS-001: an MOP is where a requirement and an MOE meet.`,
              'The noise cluster repeats the correction. MOE-003, the noise compliance rate, measures only the per-event bound. The proposed MOE-007 measures the share of sensitive pad-hours within the cap, supported by the proposed MOP-010. Measurement rationale is part of the record: every measure names its data source and threshold.',
            ],
            why: 'A worked linkage graph shows students what “hierarchy and linkage” in the rubric means, and the data sources show that a measure nobody can collect is not a measure.',
            figure: 'Left cluster: up from the MOPs to the MOE and across to the requirements. Right cluster: the reference MOE solid, the proposed one dashed.',
            misconceptions: [{ claim: 'Every requirement needs its own MOE.', correction: 'MOEs measure mission success; MOPs connect to requirements. Several MOPs can serve one MOE.' }],
            transition: 'Where does all of this go next?',
            timing: '2 min: 45 s MOE-001, 45 s the MOPs, 30 s the noise cluster.',
          },
        },
      ],
    },
    // ============================================================================================ J. bridge (2 min)
    {
      id: 'w2s2-bridge-sec',
      title: 'Bridge',
      slides: [
        {
          id: 'w2s2-bridge',
          title: 'Where this goes: Weeks 3, 9, 10 and 12',
          purpose: 'Continuity: how each Week 2 artifact is used in Week 3 and modeled in Phase II.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w2s2-bridge',
            caption: 'This week’s artifacts and where each goes next. Phase II items are named only; no SysML syntax is taught this week.',
            alt: 'A left column of this week’s artifacts: scenarios, requirements, verification methods, measures, TBDs. Arrows lead to four boxes: Week 3, TBDs become unknowns and risks, TPMs attach to risky requirements, trade criteria come from MOEs; Week 9, requirement definitions and usages; Week 10, use cases and actions; Week 12, verification cases. The Week 9, 10 and 12 boxes are labeled SysML v2 (named only).',
          },
          body: [],
          sources: [R('R74', '86–91'), R('R76', '100–107'), R('R72', '30–47'), R('R75', '96–97')],
          notes: {
            teach: [
              'Week 3 first: the TBDs become unknowns and risks; technology readiness and TPMs attach to the risky requirements; and the trade study scores alternatives against criteria drawn from the MOEs.',
              'Then Phase II, named only. Week 9: needs and requirements become SysML v2 requirement definitions and usages (R74 pp.86–91). Week 10: the scenarios become use cases and actions (R76 pp.100–107; R72 pp.30–47). Week 12: each verification method becomes a verification case (R75 pp.96–97). The IDs you record this week are the keys that the Week 8 import uses.',
            ],
            why: 'Students take care with data they know will be reused; seeing the four destinations motivates exact IDs and parents.',
            figure: 'Follow each arrow from left to right; the three SysML boxes are destinations, not content for this week.',
            misconceptions: [{ claim: 'Phase II will rewrite the requirements from scratch in the tool.', correction: 'Phase II models this package; a requirement with a stable ID and parent becomes a model element with the same trace.' }],
            transition: 'Your team now starts its own Week 2 record.',
            timing: '2 min: 1 min Week 3, 1 min Phase II.',
          },
        },
      ],
    },
    // ============================================================================================ K. laboratory launch (22 min)
    {
      id: 'w2s2-lab',
      title: 'Laboratory launch',
      slides: [
        {
          id: 'w2s2-lab-brief',
          title: 'Lab L2: what you deliver, and by when',
          subtitle: 'Due before Week 3 Session 1, on the LMS; your own enterprise, never AeroLink',
          purpose: 'Give unambiguous instructions for the Week 2 additions to the Team Record: parts, minimums, files, deadline and the AI statement.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-record-parts',
            caption: 'The Week 2 additions to the Team Record and their minimums for a team of four (course convention).',
            alt: `Five boxes. Part 7 ConOps narrative. Part 8 scenarios: at least ${MIN.scenarios}, nominal, off-nominal and support, at least ${MIN.alternatesPerScenario} alternate each, both end states. Part 9 capabilities: at least ${MIN.capabilities}, with the needs by scenarios coverage. Part 10 requirements: at least ${MIN.requirements}, at least ${MIN.stakeholderRequirements} stakeholder and ${MIN.systemRequirements} system, at least ${MIN.types} types. Part 11 trace audit and measures: at least ${MIN.moes} MOEs and ${MIN.mops} MOPs. A small box: Parts 5–6 updated, needs from discoveries, AI statement. A panel: team-NN-week2-record.md plus team-NN-week2-model-inputs.json, one upload, before Week 3 Session 1.`,
          },
          body: [{ kind: 'bullets', items: ['Your own enterprise, never AeroLink', 'Import your Week 1 record; the lab tool extends it', 'Two files, one upload, before Week 3 Session 1', 'Formative; feedback before Week 3 Session 2'] }],
          sources: [],
          notes: {
            teach: [
              'Read the five parts and their minimums; every minimum is a course convention from the rubric and the deliverable specification. Stress three things: the record is about the team’s own enterprise; every requirement traces to one of the team’s Week 1 needs; and every need without a requirement, and every stakeholder requirement without a system requirement, carries a disposition.',
              `Explain the tool’s checks in one breath: ${REQ_HARD_GATES.length} hard gates (${REQ_GATE_TEXT}) decide whether a requirement counts; ${REQ_ADVISORIES.length} advisories flag likely defects but never block. A good requirement may show an advisory; read it, and fix or keep the wording with a reason.`,
              `Workload: about ${LAB2_TEAM_HOURS} person-hours out of class for a team of four, about ${(LAB2_TEAM_HOURS / 4).toFixed(1)} hours each, inside the 8-hour week. A team of three works to minimums reduced in proportion (${MIN3.scenarios} scenarios, ${MIN3.capabilities} capabilities, ${MIN3.requirements} requirements, ${MIN3.moes} MOEs and ${MIN3.mops} MOPs), pending faculty approval, so its load per person stays the same.`,
              'The AI usage statement is updated, and every AI-suggested scenario, requirement or measure is tagged as reviewed by the team.',
            ],
            why: 'Unambiguous minimums and checks prevent the most common lab failure, careful work on the wrong scope, and explaining the gates now stops teams fighting the tool.',
            figure: 'Read the five boxes left to right with their minimums, then the small box for the updated Week 1 parts, then the panel with the two files and the deadline.',
            examples: ['A complete Part 10 entry: REQ-STK-004 “The food-bank network shall deliver at least 95 % of scheduled pantry orders within their agreed two-hour window in each month”, type performance, method analysis, criterion, rationale with the source of 95 %, parent NEED-002 and CAP-001, owner.'],
            misconceptions: [{ claim: 'Ten requirements is the target.', correction: 'It is the minimum for completeness; quality is judged on a sample of ten drawn by the grader, and the package grows to 25–40 requirements by Week 7.' }],
            transition: 'The first step starts now: choose your scenarios and owners.',
            timing: '3 min: 1 min parts and traces, 1 min the checks, 30 s workload, 30 s AI statement.',
          },
        },
        {
          id: 'w2s2-lab-plan',
          title: 'Team work: choose scenarios and owners',
          subtitle: '8 minutes, in teams; the off-nominal skeleton is needed for the clinic',
          purpose: 'Run lab step 1 in class: merge the members’ skeletons, select at least three scenarios of the three kinds, assign owners, and prepare the off-nominal skeleton for the clinic.',
          minutes: 8,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-scenario-card',
            caption: 'The scenario template from Session 1: teams fill the header, trigger, primary actor and failure end state for the clinic.',
            alt: 'The annotated blank scenario card from Session 1: a header line for the scenario system of interest, then actors, trigger, preconditions, main flow, alternate flows, success end state and failure end state.',
          },
          body: [{ kind: 'bullets', items: ['Merge the members’ skeletons; choose at least three', 'One nominal, one off-nominal, one support', 'An owner for each scenario and each ID prefix', 'Write the off-nominal skeleton for the clinic'] }],
          sources: [R('R59', '453–454')],
          notes: {
            teach: [
              'Set a visible 8-minute timer. Teams lay out the members’ skeletons from the pre-work and choose at least three scenarios covering nominal, off-nominal and support (a team of three: at least two, nominal and off-nominal). Each scenario has one owner.',
              'Teams assign an owner to each Week 2 prefix (course convention): Architecture owns CAP and the ConOps narrative; Requirements & Compliance owns REQ-STK, REQ-SYS and the uncertainty register; AI & Data owns MOE and MOP; Verification & Validation reviews every scenario and runs the trace audit.',
              'In the last three minutes each team writes its off-nominal skeleton on the template: the scenario system of interest, the trigger, the primary actor and the failure end state. Circulate and ask each table the clinic’s first question early: is your primary actor outside your boundary?',
            ],
            why: 'Choosing scenarios and owners with the instructor in the room prevents a week of duplicated or missing work; preparing the clinic card makes the next nine minutes efficient.',
            figure: 'Point only at the header line and the trigger, primary actor and failure end-state fields: those four are what the clinic checks.',
            examples: ['A food-bank team’s three: nominal, a scheduled delivery day; off-nominal, a refrigerated van breaks down mid-route; support, onboarding a new volunteer driver.'],
            misconceptions: [{ claim: 'The off-nominal scenario can be an alternate flow of the nominal one.', correction: 'The minimum asks for a scenario whose main flow is the disruption, with its own trigger and end states; alternates are additional.' }],
            transition: 'Each team now brings its skeleton to the clinic.',
            timing: '8 min: 5 min selection and owners, 3 min the off-nominal skeleton.',
          },
        },
        {
          id: 'w2s2-lab-clinic',
          title: 'Instructor checkpoint: the scenario clinic',
          subtitle: 'About 80 seconds per team; up to five teams in class, the rest decided within 48 h',
          purpose: 'Catch boundary, trigger and end-state errors before requirements are written: each team presents its off-nominal skeleton and receives a decision.',
          minutes: 9,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s2-clinic-card',
            caption: 'The clinic card: three lines from the team, three checks and the instructor’s decision.',
            alt: `A form titled Scenario clinic, about 80 s per team, with three fill-in lines: 1 scenario system of interest; 2 off-nominal scenario, trigger and failure end state; 3 one actor outside the boundary. Below, a check box for each criterion: ${CLINIC_CRITERIA.join('; ')}. Then two decision boxes: proceed; revise (reason).`,
          },
          body: [{ kind: 'bullets', items: ['State your scenario system of interest', 'Read your off-nominal trigger and failure end state', 'Name one actor outside the boundary', 'Decision: proceed, or revise with the reason', 'More than five teams: card on the LMS, decided within 48 h'] }],
          sources: [R('R59', '453–455')],
          notes: {
            teach: [
              'Call teams in order; the Requirements & Compliance lead presents. About 80 seconds per team and 20 seconds for the decision: five teams take 8 min 20 s of the nine minutes. Teams beyond five post the card on the LMS and are decided within 48 hours, in a rotation so the same teams are not always last.',
              `Check three things, aloud: ${CLINIC_CRITERIA.join('; ')}. The first rests on MITRE’s rule that actors are outside the system (R59 p.453); the second on use cases running from a trigger event (R59 p.453); the third on failure scenarios that fall short of the goal (R59 p.454), which must still leave an observable, safe state.`,
              'Decide aloud: proceed, or revise with the reason. The team records the decision in the lab tool.',
            ],
            why: 'The commonest scenario errors, an actor inside the boundary, a trigger that is a state, a failure that is not observable, are cheap to fix now and expensive once requirements trace to them.',
            figure: 'The three lines come from the team; the three check boxes are the instructor’s; the decision closes the card.',
            examples: ['Revise: “System of interest: our delivery app. Actor: the routing engine.” The routing engine is part of the app, so it cannot be an actor. Proceed: “Trigger: the van’s refrigeration alarm sounds mid-route; failure end state: perishable items logged as discarded and the pantry notified.”'],
            misconceptions: [{ claim: 'A trigger such as “the van is broken” is fine.', correction: 'That is a state; the trigger is the event that starts the scenario, such as the alarm sounding.' }],
            transition: 'Close with the plan for the next seven days.',
            timing: '9 min: 1 min 40 s per team for five teams (80 s presentation, 20 s decision), 40 s spare.',
          },
        },
        {
          id: 'w2s2-lab-close',
          title: 'Close: the next seven days',
          subtitle: 'Quiz Q2 and the applied exercise open today. Log your hours.',
          purpose: 'Give a work plan and accountability: the out-of-class sequence with lead roles, the assessments and the time log.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w2s2-seven-days',
            caption: 'A suggested seven-day plan for Lab L2, with the lead role for each task (course convention).',
            alt: 'A timeline of days 1 to 7 with bars. Days 1–2: ConOps narrative and environment, Architecture. Days 1–3: scenarios, one owner each, reviewed by V&V. Day 3: discovery log and needs update, Requirements & Compliance. Days 3–4: capabilities and coverage matrix, Architecture. Days 4–5: requirements, each member writes at least 3 (at least 2 each in a team of three), Requirements & Compliance merges. Day 6: trace audit (V&V) and measures (AI & Data). Day 6: AI usage statement, AI & Data. Day 7: integration review, export and upload, V&V.',
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Walk the plan once; it is a suggestion, and the charter decides. Scenarios come before requirements because the requirements trace to what the scenarios find; the discovery log on day 3 updates the needs before requirements are written.',
              'Assessment: readiness quiz Q2 (12 items, 15 minutes, individual) and the individual applied exercise (about 35 minutes, an unseen case) open after this session; graduate students write the requirements-checklist memo instead of the exercise. Both are due before Week 3 Session 1. Remind students to log their hours.',
            ],
            why: 'A concrete plan with owners converts a long brief into daily actions and makes individual accountability visible.',
            figure: 'Read the bars left to right: scenarios overlap the narrative, requirements start only after the discovery log. Day 6 is the audit day.',
            misconceptions: [{ claim: 'Requirements can be written in parallel with the scenarios to save time.', correction: 'Then the needs exposed by the scenarios never reach the requirements; write the discovery log first.' }],
            transition: 'End of Week 2. Week 3 opens with your TBDs, which become unknowns and risks.',
            timing: '2 min: 1.5 min plan and assessment; 30 s questions.',
          },
        },
        {
          id: 'w2s2-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up; no commentary is needed. The list is generated from every citation in the session and the credits include SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on, and SEBoK’s license requires the attribution wherever its text is used.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],

  // ============================================================================================== student lesson
  studentLesson: [
    {
      id: 'w2s2-l-anatomy',
      title: 'What a requirement is made of',
      blocks: [
        {
          kind: 'para',
          text: 'SEBoK quotes INCOSE’s Needs and Requirements Manual for the definition: a requirement statement is a formal transformation of one or more needs or parent requirements into an agreed-to obligation for an entity to perform some function or possess some quality, within specified constraints, with acceptable risk. Two words carry the weight. *Agreed-to*: a requirement is negotiated with stakeholders, not declared. *Obligation*: it binds whoever builds the system. MITRE explains how specifications mark the binding: “shall” for a binding provision, “should” or “may” for a nonbinding one, and “will” for a declaration of purpose or the future tense.',
        },
        {
          kind: 'para',
          text: 'A requirement is a record, not a sentence. SEBoK lists the attributes worth keeping: rationale, trace to source or parent, system verification success criteria, owner, category, status, criticality and priority. The rationale explains why the requirement is needed, what was assumed and where its numbers came from, so that later analysis can question them. Defining the verification success criteria while writing helps ensure the requirement is well formed and verifiable.',
        },
        { kind: 'callout', tone: 'note', title: 'Course convention: the minimum requirement record', text: `${REQ_RECORD_TEXT}.` },
        { kind: 'figure', slide: 'w2s2-anatomy' },
        { kind: 'para', text: 'The worked figure dissects REQ-STK-001. Its subject is the whole service, its action is to board passengers, its criterion is fifteen minutes from confirmation for at least 90 % of passengers each month, and its record names the analysis method, the rationale (the assumption that attraction halves at a fifteen-minute wait) and the parents NEED-001 and CAP-001.' },
      ],
      sources: [R('R13', '558–559'), R('R54', '330')],
    },
    {
      id: 'w2s2-l-characteristics',
      title: 'Characteristics of good requirements',
      blocks: [
        {
          kind: 'para',
          text: 'Two independent sources in the collection list the characteristics of good requirements. The DoD guidebook names necessary, unique, unambiguous, clear and concise, complete, consistent, technically feasible, traceable, measurable, verifiable, able to be validated, operationally effective and survivable, and singular. MITRE names traceable, unambiguous, specific and singular, measurable, performance specified, testable, consistent, feasible, uniquely identified, design-free, and the use of “shall”. Eight characteristics appear on both lists under similar names; the rest are emphases of one source.',
        },
        { kind: 'figure', slide: 'w2s2-characteristics' },
        {
          kind: 'para',
          text: 'Some characteristics can be judged on one requirement alone: singular, measurable, design-free. Two can only be judged on the set: complete and consistent. Checking requirements against such characteristics is what SEBoK calls requirement verification. SEBoK points to INCOSE’s Guide to Writing Requirements for the detailed rules; that guide is not in the course collection, so the course’s checks rest on the DoD and MITRE lists.',
        },
      ],
      sources: [R('R48b', '144'), R('R54', '329–330'), R('R13', '566')],
    },
    {
      id: 'w2s2-l-categories-level',
      title: 'Organizing a set, and writing at the right level',
      blocks: [
        {
          kind: 'para',
          text: 'Categories turn a list into a set whose gaps can be seen. SEBoK’s example categories, derived from the INCOSE manual, are function and performance; fit and operational (interfaces, human interaction, the operating and natural environments); form (physical characteristics); quality (the “-ilities”); and compliance with standards and regulations. SEBoK’s test is strict: for the set to be complete, each category must be addressed. MITRE’s checklist asks that each requirement describe a function, the performance of a function, a design constraint or a reference such as an interface definition, and that the set include legal and regulatory constraints, environmental design requirements and all external interfaces.',
        },
        { kind: 'callout', tone: 'note', title: 'Course convention: four types', text: 'Functional, performance, interface and constraint. The lab asks for at least three of the four; SEBoK’s five categories are a second lens on the finished set.' },
        { kind: 'figure', slide: 'w2s2-categories' },
        {
          kind: 'para',
          text: 'The commonest error at this level is designing inside the requirement. MITRE’s rule of thumb is to give designers and test engineers what they must know and leave as much white space as possible for design. Too little detail leaves the designer guessing; too much artificially constrains the design, often because someone wants a feature they have already seen. The DoD guidebook adds that derived requirements come from solution decisions and must be identified and kept traceable. In AeroLink terms: the service requires a 25-minute turnaround and the charging system a 20-minute charge, but the charger rating and the number of chargers are derived only after the Week 3 trade study.',
        },
        { kind: 'figure', slide: 'w2s2-level' },
      ],
      sources: [R('R13', '560'), R('R55', '367–369'), R('R55', '371'), R('R48', '146')],
    },
    {
      id: 'w2s2-l-wording',
      title: 'Negatives, ranges, thresholds and values not yet known',
      blocks: [
        {
          kind: 'para',
          text: 'MITRE’s checklist gives word-level rules with reasons. Avoid “shall not”, because a negative is very difficult to prove. Avoid “maximize” and “minimize”, because they leave the engineer to judge when the design is good enough. Prefer ranges to single-point values (“a minimum of”, “within”, “between”), because a test at exactly the stated value invites dispute. Keep thresholds, which must be met, apart from objectives, where better performance has value up to the objective.',
        },
        {
          kind: 'para',
          text: 'Unknown values are normal at this stage. SEBoK recommends writing TBD (to be determined) where a value is unknown and TBR (to be resolved) beside a value known with low confidence, and tracking these TBXs: each needs the work to close it and an owner, because unresolved TBXs turn into risk. The AeroLink set carries four TBDs and two TBRs, each tracked by an unknown with an owner.',
        },
        { kind: 'para', text: 'The uncertainty register behind these placeholders, with each owner and how each closes, is in the catalogue on the worked-examples page.' },
        { kind: 'para', text: `The reference requirement REQ-STK-003 breaks the negative rule on purpose: “${req('REQ-STK-003').statement}” It is how the regulator’s need is naturally stated, and it is verified through a positive system requirement that can be demonstrated, REQ-SYS-004: “${req('REQ-SYS-004').statement}”` },
        { kind: 'figure', slide: 'w2s2-negatives-tbd' },
      ],
      sources: [R('R55', '370'), R('R13', '565')],
    },
    {
      id: 'w2s2-l-verification',
      title: 'A verification method for every requirement',
      blocks: [
        {
          kind: 'para',
          text: 'MITRE requires that every requirement have a verification method identified. The DoD guidebook defines four. Demonstration is performing operations where visual observation is the primary means of verification, used when quantitative assurance is not required. Examination is visual inspection of equipment and evaluation of drawings and design data. Analysis uses recognized analytic techniques, including computer models. Test produces data under fully controlled and traceable conditions to evaluate quantitative characteristics. SEBoK records the INCOSE handbook’s names (inspection, analysis, demonstration and testing) and adds certification as a fifth method: verification against legal or industrial standards by an outside authority, airworthiness certification being the best-known case.',
        },
        { kind: 'callout', tone: 'note', title: 'Course convention', text: 'The course uses inspection, analysis, demonstration and test; inspection is the DoD’s examination.' },
        { kind: 'figure', slide: 'w2s2-verification-method' },
        { kind: 'para', text: 'Choosing the method at writing time is a quality check in its own right. SEBoK notes that defining the verification criteria, strategy and method when the requirement is generated helps ensure it is worded properly and verifiable. If no method can show a requirement is met, the wording is wrong.' },
      ],
      sources: [R('R55', '370'), R('R49', '149–150'), R('R16', '769'), R('R13', '566')],
    },
    {
      id: 'w2s2-l-case-chains',
      title: 'Worked example: two chains and their rationale',
      blocks: [
        { kind: 'figure', slide: 'w2s2-worked-chains' },
        { kind: 'para', text: `**Chain one, a numeric budget.** NEED-001 (a short, predictable wait) and CAP-001 lead to REQ-STK-001: “${req('REQ-STK-001').statement}” Rationale: ${req('REQ-STK-001').rationale} One level down, REQ-SYS-005: “${req('REQ-SYS-005').statement}” Rationale: ${req('REQ-SYS-005').rationale}` },
        { kind: 'para', text: `**Chain two, a tracked TBD.** NEED-010 (the utility’s connection) and CAP-010 lead to REQ-STK-010: “${req('REQ-STK-010').statement}” The value waits for unknown U-002. REQ-SYS-010 allocates the obligation: “${req('REQ-SYS-010').statement}” Rationale: ${req('REQ-SYS-010').rationale}` },
        { kind: 'para', text: `The full reference set, ${N_STK} stakeholder and ${N_SYS} system requirements with their types, methods and parents, is in the requirements catalogue on the worked-examples page, for consultation as you write your own.` },
      ],
      sources: [R('R13', '559'), R('R13', '565')],
    },
    {
      id: 'w2s2-l-case-noise',
      title: 'Worked example: a Week 1 correction reaches the requirements',
      blocks: [
        { kind: 'para', text: `Week 1 corrected the residents’ need so that it bounds noise exposure, not only loudness: “${need('NEED-003').statement}” The reference requirement written before the correction covers one bound: “${req('REQ-STK-002').statement}”` },
        { kind: 'para', text: `The corrected case therefore adds a second stakeholder requirement, proposed for instructor confirmation: “${req('REQ-STK-011').statement}” Its rationale: ${req('REQ-STK-011').rationale} It flows down to the scheduling function, REQ-SYS-011, and to a measure pair, MOE-007 and MOP-010.` },
        { kind: 'figure', slide: 'w2s2-worked-noise' },
      ],
      sources: [R('R13', '559')],
    },
    {
      id: 'w2s2-l-case-critique',
      title: 'Worked example: critique and rewrite',
      blocks: [
        { kind: 'para', text: 'Each draft below breaks a characteristic from the DoD or MITRE lists. Name the defect and a rewrite before reading the table.' },
        critiqueTable,
        { kind: 'figure', slide: 'w2s2-worked-critique' },
        {
          kind: 'para',
          text: 'Four of the six defects are visible to a word-level check: a modal verb other than “shall”, a vague word, “maximize”, a negative, a value with no bound. Two need engineering judgment: seeing that “safe” hides many requirements, and that a charger count and rating fix the design. This is why the lab tool separates hard gates, defects any reviewer would reject on sight, from advisory warnings that can also appear in a good requirement, such as “not” or “and” in a qualifying clause. Words such as “quickly”, “unsafe” or “maximize” are the exception: they block unless a bounded value or a TBD defines them.',
        },
        { kind: 'callout', tone: 'key', title: 'The lab tool’s hard gates', text: `${REQ_GATE_TEXT}. Everything else it flags is advisory and never blocks.` },
      ],
      sources: [R('R48b', '144'), R('R54', '329–330'), R('R55', '367'), R('R55', '370'), R('R13', '566')],
    },
    {
      id: 'w2s2-l-traceability',
      title: 'Bidirectional traceability',
      blocks: [
        {
          kind: 'para',
          text: 'The DoD guidebook defines the audit. Requirements management keeps bottom-up traceability from any derived lower-level requirement to its source. Bidirectional traceability ensures that changes leave no orphaned lower-level requirements, and that higher-level requirements are flowed down so that there are no childless parents: each higher-level requirement is ultimately addressed by lower-level requirements and system element designs. The traceability matrix records each requirement’s decomposition or derivation, its allocation history and the rationale for every entry and change.',
        },
        { kind: 'figure', slide: 'w2s2-traceability' },
        {
          kind: 'para',
          text: 'SEBoK adds two uses: traceability helps ensure requirements trace to their needs and are correct and complete, and it supports the analysis of the impact of a change across the life cycle. Its requirements-management article counts needs and requirements not traced to a source among the measures of a set’s health. Read the DoD word “ultimately” carefully: a stakeholder requirement with no system requirement in Week 2 is an open item, not a defect, provided its disposition is recorded.',
        },
      ],
      sources: [R('R45', '118–119'), R('R13', '565'), R('R14', '478')],
    },
    {
      id: 'w2s2-l-case-audit',
      title: 'Worked example: auditing the AeroLink trace',
      blocks: [
        { kind: 'figure', slide: 'w2s2-worked-audit' },
        { kind: 'para', text: `Backward, every one of the ${N_REQ} requirements (${N_REF} from the reference, the rest proposed) has a parent that exists, and every one reaches a Week 1 need through its parents: there are no orphans. Forward from the needs, one need has no stakeholder requirement, and it is kept that way on purpose.` },
        { kind: 'callout', tone: 'caution', title: `The deliberate gap: ${DELIBERATE_REQ_GAP.need}`, text: `${DELIBERATE_REQ_GAP.finding} ${DELIBERATE_REQ_GAP.why}` },
        { kind: 'para', text: `The tempting fix is the wrong one. ${DELIBERATE_REQ_GAP.wrongFix} The recorded disposition: ${DELIBERATE_REQ_GAP.disposition}` },
        {
          kind: 'table',
          caption: 'Stakeholder requirements with no system requirement yet, and the disposition of each: record why not, as an open item or with no child needed (FICTIONAL).',
          header: ['Stakeholder requirement', 'Disposition'],
          rows: CHILDLESS_STK.map((id) => [`${id} ${req(id).name}`, STK_DISPOSITIONS[id]]),
        },
        { kind: 'para', text: AUDIT_RULE },
        { kind: 'para', text: `Every finding receives one of three dispositions: ${DISP3_TEXT}. Needs covered only in part are recorded the same way. A matrix made to look complete by adding marks is a worse audit than one that shows its gaps with their reasons.` },
        { kind: 'heading', text: 'Requirement verification and requirement validation' },
        {
          kind: 'para',
          text: 'SEBoK separates two questions about requirements. Requirement verification asks whether they are well formed, against the organization’s characteristics and rules. Requirement validation asks whether they are the right requirements: whether they clearly communicate the intent of the needs and parent requirements they came from, and whether they are correct and achievable. SEBoK stresses that neither is system verification or system validation, which come in Week 12; both are done by peer review and by comparison against the characteristics and the integrated set of needs. The critique was requirement verification; the noise correction and the deliberate gap were requirement validation.',
        },
        { kind: 'figure', slide: 'w2s2-req-vv' },
      ],
      sources: [R('R45', '118'), R('R13', '566')],
    },
    {
      id: 'w2s2-l-measures',
      title: 'Measures of effectiveness and performance',
      blocks: [
        {
          kind: 'para',
          text: 'MITRE defines the measures used to judge whether a system complies. Measures of effectiveness (MOEs) are measures of mission success stated under specific environmental and operating conditions, from the users’ viewpoint, such as mission performance, safety, availability and security. Measures of performance (MOPs) characterize specific physical or functional characteristics of the system’s operation, measured under specified conditions; they are used to decide whether the system meets the performance requirements needed to satisfy an MOE. A key performance parameter (KPP) is a stakeholder-defined measure of minimal and critical performance.',
        },
        {
          kind: 'para',
          text: 'SEBoK places measures at the start: business or mission analysis expresses the measures used to validate the system against its objectives as MOEs, and technical measurement includes MOEs, MOPs and technical performance measures (TPMs). TPMs track design parameters whose values are uncertain while the design matures; the course teaches them in Week 3, beside technology readiness and risk, where they are used.',
        },
        { kind: 'figure', slide: 'w2s2-moe-mop' },
      ],
      sources: [R('R54', '330–331'), R('R10', '544'), R('R15', '532')],
    },
    {
      id: 'w2s2-l-case-measures',
      title: 'Worked example: the AeroLink measures',
      blocks: [
        { kind: 'figure', slide: 'w2s2-worked-measures' },
        { kind: 'para', text: `MOE-001 measures the passenger’s wait as users experience it, the monthly 90th percentile from confirmation to boarding, from booking and boarding timestamps; it measures NEED-001, CAP-001 and the objective MGO-005. Two MOPs support it from the system side, aircraft assignment latency and charge time, and each also measures a system requirement (REQ-SYS-005 and REQ-SYS-001): a measure of performance is where a requirement and an MOE meet. The noise measures repeat the Week 1 correction: MOE-003 counts only the per-event bound, so the proposed MOE-007 and MOP-010 measure the evening and early-morning event cap.` },
        { kind: 'para', text: 'The catalogue on the worked-examples page lists every AeroLink MOE and MOP with its threshold, data source and links.' },
      ],
      sources: [],
    },
    {
      id: 'w2s2-l-bridge',
      title: 'Where the Week 2 work goes next',
      blocks: [
        { kind: 'para', text: 'Week 3 takes the TBDs and turns them into unknowns and risks, attaches technology readiness and technical performance measures to the risky requirements, and scores design alternatives against criteria drawn from the MOEs. In Phase II the same IDs become model elements: requirement definitions and usages in Week 9, use cases and actions built from the scenarios in Week 10, and verification cases built from the verification methods in Week 12. No SysML syntax is taught this week.' },
        { kind: 'figure', slide: 'w2s2-bridge' },
      ],
      sources: [R('R74', '86–91'), R('R76', '100–107'), R('R72', '30–47'), R('R75', '96–97')],
    },
    {
      id: 'w2s2-l-lab',
      title: 'Lab L2: ConOps and requirements for your enterprise',
      blocks: [
        { kind: 'para', text: 'The laboratory applies everything above to your team’s own approved enterprise, never to AeroLink. Import the Week 1 Team Record into the lab tool, which extends it with five parts: the ConOps narrative, the scenarios, the capabilities with the coverage check, the requirements, and the trace audit with the measures. The minimums for a team of four and the reduced minimums for a team of three are on the Laboratory page.' },
        { kind: 'figure', slide: 'w2s2-lab-brief' },
        { kind: 'figure', slide: 'w2s2-lab-clinic' },
        { kind: 'figure', slide: 'w2s2-lab-close' },
      ],
      sources: [],
    },
  ],
}

// ------------------------------------------------------------------------------------------------ the week's references and credits
function referencesSection(lectures: Lecture[]): LessonSection {
  return {
    id: 'w2s2-l-references',
    title: 'References and credits for Week 2',
    blocks: [
      { kind: 'para', text: 'Every source cited in Week 2, with the pages cited (generated from the citations).' },
      { kind: 'bullets', items: lectureReferences(lectures).map(formatReference) },
      { kind: 'heading', text: 'Credits and licenses' },
      { kind: 'bullets', items: lectureCredits(lectures) },
    ],
    sources: [],
  }
}
WEEK2_SESSION2.studentLesson.push(referencesSection([WEEK2_SESSION1, WEEK2_SESSION2]))
