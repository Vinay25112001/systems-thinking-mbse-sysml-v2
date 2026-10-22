// Week 9, Session 2 lecture: Needs / Requirements — quality, the AeroLink worked model, AI-assisted review and the
// Lab L9 launch. Retrieval (three declarations), requirement verification and requirement validation, what the model
// makes visible and what a reviewer must decide; four worked examples from AeroLink model v0.2 (a stakeholder
// requirement in full, a TBD limit, "in still air" as gate or reference condition, a derivation chain); the trace matrix
// read from the model; common errors; predict the checker; AI findings as candidates to disposition; the mapping from the
// team's package to the model; the bridge to Weeks 10-13; and 22 minutes of laboratory launch.
// 75-minute session: 69 minutes (47 lecture + 22 lab launch) on 19 slides plus the generated references slide, and a
// 6-minute buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson.
//
// Review status: new-pending-review. Written 2026-10-21 from docs/lectures/week09/WEEK09_LECTURE_OUTLINE.md §3. The
// outline's audit case (NEED-011 childless) is replaced by the closed package's real open items: Week 2's partial
// coverage (NEED-006, NEED-008, NEED-017), the childless stakeholder requirements and the capability-only parent of
// REQ-SYS-003, all computed in ./aerolinkCase.ts. The predict item is split into predict and reveal so that no result is
// on the slide students vote from.
//
// Accuracy rules: as Session 1. R13 p.566 (requirement verification and validation; verification planning in the
// requirement's attributes); R48b p.144 (attributes of good requirements); R83, R74, R115, R114 as in Session 1. The AI
// review method is a course method (outline §9 gap 3), labeled as such; the review set and its findings are FICTIONAL,
// proposed, instructor to confirm.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { AI_FINDINGS, CAP_ONLY, CHAIN, CHILDLESS_STK, COUNTS, PARTIAL_ALL, PARTIAL_CLOSED_W9, PARTIAL_OPEN, REVIEW_SEEDED, TRACE_FRAGMENT, needOf, reqOf } from './aerolinkCase'
import { LAB9_MINIMUMS, LAB9_OUTPUTS, LAB9_PERSON_HOURS, LAB9_TEAM_HOURS, LAB9_TEAM_HOURS_THREE, EXERCISE_MINUTES, SEVEN_DAY_PLAN } from './labBrief'
import { listing, listingText } from './listings'

export const WEEK9_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (course file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}
const NEED = needOf(CHAIN.need)
const STK5 = reqOf(CHAIN.stk)
const SYS1 = reqOf(CHAIN.sys)
const STK1 = reqOf('REQ-STK-001')
const SYS7 = reqOf('REQ-SYS-007')
const SYS10 = reqOf('REQ-SYS-010')
const B = CHAIN.budget
const partialIds = PARTIAL_OPEN.map((p) => p.need)
const closedW9 = PARTIAL_CLOSED_W9.map((p) => p.closedBy)
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)
const outputFiles = LAB9_OUTPUTS.map((o) => o.file)
const EACH_FOUR = Math.round((LAB9_TEAM_HOURS / 4) * 10) / 10
const EACH_THREE = Math.round((LAB9_TEAM_HOURS_THREE / 3) * 10) / 10
const pUnq = listing('predict-unquoted')
const pRev = listing('predict-reversed')
const pSat = listing('predict-satisfy')
const TRUE_FINDINGS = AI_FINDINGS.filter((f) => f.verdict === 'true').length
const FALSE_POS = AI_FINDINGS.filter((f) => f.verdict === 'false positive').length
const PARTLY = AI_FINDINGS.filter((f) => f.verdict === 'partly right').length

export const WEEK9_SESSION2: Lecture = {
  week: 9,
  session: 2,
  title: 'Needs / Requirements',
  subtitle: 'Session 2: Quality, worked examples, AI-assisted review and the lab launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ E. retrieval and quality (9 min)
    {
      id: 'w9s2-quality',
      title: 'Retrieval and requirement quality',
      slides: [
        {
          id: 'w9s2-warmup',
          title: 'Warm-up: three declarations',
          purpose: 'Retrieval of Session 1 on an unseen context: three requirements with the same text, all accepted by the checker; pairs decide which one says something checkable and what is wrong with the other two.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-listing-warmup',
            caption: 'Three requirements about a library’s book-return kiosk, with the same statement. Pairs: which one is right, and what is wrong with the other two? (FICTIONAL)',
            alt: listingAlt('warmup'),
          },
          body: [{ kind: 'bullets', items: ['Same statement, three models', 'Which one is right?', 'What is wrong with the other two?'] }],
          sources: [],
          notes: {
            teach: [
              'Show the three declarations. All three carry the same statement: the kiosk shall scan a returned book within 3 seconds. The context is new on purpose, a library’s book-return kiosk, so that students apply the rules rather than remember AeroLink.',
              'Pairs have ninety seconds: which declaration is right, and what exactly is wrong with each of the other two? Ask them to name the rule they use, in Session 1 words: subject, required constraint, feature of the subject.',
              'Do not reveal anything yet; the next slide does. Walk the room and listen for the word “subject”.',
            ],
            why: 'Retrieval at the start of the session consolidates the Session 1 construct, and an unseen context tests transfer rather than recall.',
            figure: 'Point at each declaration in turn without comment; read the shared statement once.',
            transition: 'Reveal.',
            timing: '2 min: 30 s read, 90 s pairs.',
          },
        },
        {
          id: 'w9s2-reveal',
          title: 'Reveal: subject and constraint decide',
          purpose: 'Confirm the rules on the warm-up: a doc-only requirement gives nothing to evaluate; a subject that is not the element the statement is about reads the wrong feature; only the third is right. All three pass the checker.',
          minutes: 1,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['K-1: doc only. Nothing to evaluate', 'K-2: subject is the whole library service; the constraint reads its opening hours, not the kiosk’s scan time', 'K-3: right. The kiosk’s scan time at most 3 s'] },
            { kind: 'callout', tone: 'key', text: 'All three pass the checker.' },
          ],
          sources: [R('R83', '161–162')],
          notes: {
            teach: [
              'K-1 has only a doc comment: it is still a constraint, but there is nothing for the model to evaluate. K-2 has a subject and a constraint, but the subject is the whole library service, and the constraint compares the service’s opening hours with the limit: nothing at the kiosk level is constrained, and nothing about scanning. K-3 is right: the subject is the kiosk, and the constraint reads the kiosk’s scan time (R83 pp.161–162).',
              'All three pass the checker. The checker resolves names; it cannot tell that K-2 constrains the wrong element.',
            ],
            why: 'The reveal ties the warm-up to the two rules students apply most in the lab, subject and constraint, and repeats that validity is not meaning.',
            transition: 'Judging a requirement has two sides. SEBoK names them.',
            timing: '1 min: about 20 s per declaration.',
          },
        },
        {
          id: 'w9s2-req-vv',
          title: 'Requirement verification and requirement validation',
          purpose: 'Introduce the two quality questions applied to requirements themselves, and separate them from system verification and validation.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-two-questions',
            caption: 'Two questions about one requirement: is it well formed, and is it the right requirement, true to the need it came from? Course illustration, not SysML v2 graphical notation.',
            alt: `A strong card in the center, ${STK5.id}. On each side a magnifying glass: the left one labeled well formed?, the right one labeled right intent?. An arrow runs from the right glass up to a tag, ${NEED.id}, the need the requirement came from.`,
          },
          body: [
            { kind: 'bullets', items: ['Requirement verification: well formed? (the organization’s characteristics and rules)', 'Requirement validation: the right requirements? (the intent of the needs and parents)', 'Not system verification and validation (Week 12)', 'Methods: peer review; comparison with characteristics and with the needs'] },
          ],
          sources: [R('R13', '566')],
          notes: {
            teach: [
              'SEBoK says requirements should be assessed to gauge whether they are well formed and whether they meet the intent of the needs from which they were transformed, and it names the two questions (R13 p.566).',
              'Requirement verification asks: are the requirements well formed, that is, do the individual requirements and the set have the characteristics and follow the rules in the organization’s criteria? Requirement validation asks: do we have the right requirements, that is, do they clearly communicate the intent of the needs, parent requirements and other sources they were transformed from? (R13 p.566)',
              'SEBoK warns that these are not the same as system verification and system validation, which Week 12 models. The methods include peer review and comparing each requirement against a set of characteristics and against the integrated set of needs (R13 p.566). The rest of this session applies both questions to modeled requirements.',
            ],
            why: 'Students need names for the two judgments they will make on every requirement in the lab, and they must not confuse either with verifying the system.',
            figure: 'Point at the left glass and read its question, then the right glass and follow its arrow back to the need.',
            misconceptions: [{ claim: 'Requirement verification means testing the system against the requirement.', correction: 'It means checking that the requirement itself is well formed; testing the system is system verification, Week 12.' }],
            transition: 'Which of these can the model help with, and which only a reviewer can judge?',
            timing: '3 min: 1 min the two questions, 1 min the definitions, 1 min not system V&V and methods.',
          },
        },
        {
          id: 'w9s2-model-vs-reviewer',
          title: 'What the model makes visible, and what a reviewer must decide',
          purpose: 'Separate tool checks from engineering judgement on the DoD characteristics of good requirements, and connect verification planning to the requirement’s attributes.',
          minutes: 3,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Characteristic', 'The model makes visible', 'A reviewer decides'],
              rows: [
                ['Traceable', 'a derivation to a parent', 'is it the right parent?'],
                ['Verifiable', 'a constraint, a method', 'can the criterion be tested?'],
                ['Unambiguous', 'nothing', 'does every reader read it alike?'],
                ['Right limit, right subject', 'nothing', 'always'],
              ],
              caption: 'From the DoD list of attributes of good requirements',
            },
          ],
          sources: [R('R48b', '144'), R('R13', '566')],
          notes: {
            teach: [
              'The DoD guidebook lists the attributes of good requirements, among them necessary, unique, unambiguous, complete, consistent, traceable, measurable, verifiable and singular (R48b p.144). Read the table row by row.',
              'Traceable: the model shows a derivation or a dependency to a parent, and the lab tool lists every requirement that has none; but only a reviewer can say whether it is the right parent. Verifiable: the model shows a required constraint and a verification method, and SEBoK says that defining the verification criterion and method when the requirement is written helps make it verifiable, and that this information can be captured in the requirement’s attributes (R13 p.566); but only a reviewer can say whether the criterion can actually be tested.',
              'Unambiguous, and the right limit on the right subject: the model makes nothing visible. Those are review questions, and they are where AI-assisted review, later in the session, earns its place.',
            ],
            why: 'Knowing where the model stops helping tells students where to spend their review time; it also prepares the AI method, which targets exactly the right-hand column.',
            misconceptions: [{ claim: 'A requirement with a constraint and a method is verifiable.', correction: 'The model shows that a criterion is recorded; whether it can be tested is a reviewer’s judgment.' }],
            transition: 'Now four worked examples from the AeroLink model, each with one decision you will make for your own requirements.',
            timing: '3 min: 30 s the list, 1.5 min traceable and verifiable, 1 min the empty rows.',
          },
        },
      ],
    },
    // ============================================================================================ F. AeroLink worked model (26 min)
    {
      id: 'w9s2-worked',
      title: 'The AeroLink worked model, continued from Weeks 1 and 2',
      slides: [
        {
          id: 'w9s2-worked-stk',
          title: 'Worked example III: anatomy of a stakeholder requirement',
          purpose: 'One complete stakeholder requirement from AeroLink model v0.2, each line traced to the Week 1 or Week 2 artifact it came from.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-listing-worked-stk',
            caption: `${STK1.id} in AeroLink model v0.2, generated from its Week 2 row: statement, subject, limit, required constraint, attributes and rationale (the doc is shortened on the slide). Checked: PASS. (FICTIONAL)`,
            alt: listingAlt('worked-stk'),
          },
          body: [
            { kind: 'bullets', items: ['ID and statement: the Week 2 row, word for word', 'Subject: the enterprise (course convention)', 'Limit and required constraint: the Week 2 criterion', 'Attributes and rationale: the Week 2 columns', 'Parent: a derivation from the Week 1 need'] },
          ],
          sources: [R('R83', '161'), R('R83', '165'), R('R114', '555'), R('R84', '175')],
          notes: {
            teach: [
              `Read ${STK1.id} line by line. The short name is its Week 2 ID and the declared name its Week 2 name. The doc is the Week 2 statement, word for word: ${STK1.statement} The subject is the enterprise, the course convention for stakeholder requirements.`,
              `The limit comes from the Week 2 criterion, “${STK1.criterion}”: an attribute of type duration bound to 15 minutes. The required constraint compares a feature of the enterprise, passengerWaitP90, with that limit; the generator added the feature to the enterprise definition in the Context package, so that the constraint reads something the enterprise has (R83 pp.161, 165).`,
              `Then the two annotations: RequirementAttributes with the level, the type, the method as a verification method kind and the criterion text, and Rationale with the Week 2 rationale (R114 p.555; R84 p.175). Finally, outside the requirement, a derivation connection from ${STK1.parents[0]}, its Week 1 need, makes the trace; its Week 2 parent capability, ${STK1.parents[1]}, waits for Week 10, when capabilities are modeled.`,
              `Ask students to annotate a printout: draw the derivation to ${STK1.parents[0]} and the frame from ${STK1.parents[0]} to CON-001, and mark which line of the Week 2 row each model line came from.`,
            ],
            why: 'One requirement traced line by line to its Phase I sources shows that the model is the package in another form, and gives students the template they will check their own generated requirements against.',
            figure: 'Follow the callouts top to bottom, naming the Week 2 column for each line.',
            misconceptions: [{ claim: 'The feature passengerWaitP90 is a measure the requirement invents.', correction: 'It is a feature of the subject the constraint reads; Week 12 measures it, and Week 9 only names it.' }],
            transition: 'Some limits are not known yet. Model a TBD honestly.',
            timing: '4 min: 1 min ID, doc, subject; 1.5 min limit and constraint; 1 min annotations and trace; 30 s the annotation task.',
          },
        },
        {
          id: 'w9s2-worked-tbd',
          title: 'Worked example IV: a limit that is still to be decided',
          purpose: 'Model a TBD honestly: the constraint stays, the status records the open value and its owner, and an unbound limit claims little until it is bound to the configured value.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-listing-tbd',
            caption: `${SYS10.id} written two ways: the limit left unbound, as in model v0.2, and the limit bound to the value configured in the chargers. Both PASS the checker; only the second says what is meant. (FICTIONAL)`,
            alt: listingAlt('tbd'),
          },
          body: [
            { kind: 'bullets', items: ['The constraint stays; StatusInfo records tbd and the owner', 'Unbound limit: reads as “some limit exists”', 'Bound to the configured value: reads as intended', 'A TBD is a recorded status with an owner, never a missing constraint'] },
          ],
          sources: [R('R114', '556–557'), R('R83', '168')],
          notes: {
            teach: [
              `${SYS10.id}: ${SYS10.statement} The connection limit is TBD-02, owned by the Vertiport Infrastructure Manager, because the utility has not yet agreed it. Model v0.2 keeps the required constraint, leaves the limit attribute without a value, and annotates the requirement with StatusInfo, status tbd, and the owner (R114 pp.556–557). ${numberWord(COUNTS.tbd)} AeroLink requirements carry a TBD and ${numberWord(COUNTS.tbr)} a TBR, which the model records as status tbc, to be confirmed.`,
              'The trap, which is course reasoning from the semantics: a constraint over an unbound feature does not mean “for every possible limit”. It constrains the feature to values that make the constraint true, and a large enough limit always does. So a later satisfy of the unbound version would claim very little (R83 p.168).',
              'The fix: bind the limit to the value configured in the subject, the chargers’ configured connection limit. Then the requirement says “the combined power stays within the configured limit”, which is what the Week 2 statement means, and the TBD becomes the question of what value is configured.',
              'Rule: a TBD is a recorded status with an owner and a closure event, never a missing constraint. The lab tool keeps the constraint for every TBD requirement and asks for the owner if your Week 2 register has none.',
            ],
            why: 'TBDs are where teams most often drop the constraint or invent a number; seeing both versions pass the checker shows why the difference has to be judged, not checked.',
            figure: 'Compare line 4 with line 13: the same attribute, without a value and bound to the configured limit. Read each callout.',
            misconceptions: [{ claim: 'A requirement with a TBD should have no constraint until the value is known.', correction: 'Keep the constraint and record the status and owner; the open value is a fact about the requirement, not a reason to drop it.' }],
            transition: 'A condition in the text can be a gate on when a requirement applies, or part of what it measures. Decide which.',
            timing: '4 min: 1 min the TBD as modeled, 1 min the trap, 1.5 min the fix, 30 s the rule.',
          },
        },
        {
          id: 'w9s2-worked-assume',
          title: 'Worked example V: “in still air”: gate or reference condition?',
          purpose: 'The graduate-level decision about assumptions: model REQ-SYS-007’s condition as a gate and see what it claims, then as a reference condition kept with the quantity, which the course recommends here.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-listing-still-air',
            caption: `${SYS7.id} read two ways: “in still air” as an assumption about the weather (a gate), and as part of the quantity measured (a reference condition). Both PASS the checker. The 0.5 m/s still-air tolerance is a teaching value. (FICTIONAL)`,
            alt: listingAlt('still-air'),
          },
          body: [
            { kind: 'bullets', items: ['Gate: weather as an actor; assume still air; require the block time', 'The block time is one still-air design value: in wind, the gate only switches the requirement off', 'Reference reading: the condition names the quantity; verification corrects to still air', 'Use an assumption when the condition bounds applicability'] },
          ],
          sources: [R('R83', '162'), R('R83', '165')],
          notes: {
            teach: [
              `${SYS7.id}: ${SYS7.statement} The gate reading models the weather as an actor, an entity external to the subject but necessary for the requirement (R83 p.162), assumes still air, wind speed at most 0.5 metres per second, a fictional tolerance, and requires the block time to be at most 16 minutes. The effective constraint is “if still air, then within the block time” (R83 p.165).`,
              'The problem: the design-trip block time is one still-air design value of the aircraft; it does not vary with tomorrow’s wind. In any wind above the tolerance the assumption is false, so the requirement is vacuously satisfied. The gate adds nothing, and it invites a reader to think the requirement says something about windy days.',
              'The reference-condition reading keeps the condition with the quantity: the feature is named stillAirDesignTripBlockTime, the doc states the condition, and verification corrects measured block times to still air before comparing them. Model v0.2 of AeroLink uses this reading. It is a course choice: the specification gives the semantics, not the choice.',
              'The rule to take away: use an assumption when the condition bounds where the requirement applies and the required quantity depends on what the condition constrains, for example a braking distance in poor conditions; otherwise keep the condition in the quantity.',
            ],
            why: 'This is the decision graduate students are assessed on: reading what an implication actually claims, and choosing the model that says what the requirement means.',
            figure: 'Point at the actor and the assume line in the first version, then at the single constraint over the still-air feature in the second; ask which one says anything in a 10 m/s wind.',
            misconceptions: [{ claim: 'Writing a condition as an assumption makes the requirement more precise.', correction: 'An assumption switches the requirement off where it is false; if the quantity does not depend on the condition, the gate only removes coverage.' }],
            transition: 'Now connect needs and requirements with their derivations, end to end.',
            timing: '4 min: 1 min the gate, 1 min the problem, 1.5 min the reference reading, 30 s the rule.',
          },
        },
        {
          id: 'w9s2-worked-chain',
          title: 'Worked example VI: a full derivation chain',
          purpose: 'Read a need-to-system-requirement chain with the derivation semantics, and see where the turnaround arithmetic lives: in the rationale, not in the derivation.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-chain',
            caption: `${NEED.id} → ${STK5.id} → ${SYS1.id} in AeroLink model v0.2: two derivation connections, and the arithmetic that justifies them in the rationale. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `Three boxes stacked top to bottom: ${NEED.id}; ${STK5.id} ≤ ${B.total} min; ${SYS1.id} ≤ ${B.charge} min (drawn strong). Two arrows labeled derivation join them, from the upper box to the lower. Beside them a note titled rationale: ${B.total} = ${B.charge} + ${B.padWork}; charge + pad work; text, not math.`,
          },
          body: [
            { kind: 'bullets', items: [`${NEED.id} → ${STK5.id} → ${SYS1.id}`, 'Each: any subject satisfying the parent should satisfy the child', `The arithmetic, ${B.total} = ${B.charge} + ${B.padWork} min, is in the rationale`, 'The derivation asserts the relation; it computes nothing'] },
          ],
          sources: [R('R115', '580–581')],
          notes: {
            teach: [
              `Read the chain top to bottom. ${NEED.id}: ${NEED.statement} ${STK5.id} is derived from it: pad arrival to dispatch-ready within ${B.total} minutes. ${SYS1.id} is derived from ${STK5.id}: the chargers charge to the dispatch threshold within ${B.charge} minutes.`,
              `Read each derivation with its semantics: any subject that satisfies the original requirement should, in itself or through other things related to it, satisfy each derived requirement (R115 p.580). If the service meets the ${B.total}-minute turnaround through its chargers, the chargers meet ${B.charge} minutes, because the budget is ${B.charge} minutes of charging plus ${B.padWork} minutes of rotor stop, safety check and connection, with boarding overlapping the charge. Whenever the original is satisfied, the derived ones must be (R115 p.581).`,
              'Where does that arithmetic live? In the rationale annotations of the two requirements, from Week 2. The derivation connection asserts the relation; it does not compute anything. If the charge time changes, the rationale and the limit must change by hand, and the trace tells you which requirements to look at.',
            ],
            why: 'Students see the whole thread on real requirements and learn that derivation records an engineering judgment whose justification must be written down elsewhere.',
            figure: `Point at each connector and say “original” at its upper end, “derive” at its lower end; then read the rationale note and stress that it is text, not computation.`,
            misconceptions: [{ claim: 'The model checks that the 20-minute charge fits the 25-minute turnaround.', correction: 'The derivation only asserts the relation; the arithmetic is in the rationale, and no checker evaluates it.' }],
            transition: 'With every derivation in the model, a trace matrix can be read from it.',
            timing: '3 min: 1 min the chain, 1.5 min the semantics and the budget, 30 s where the arithmetic lives.',
          },
        },
        {
          id: 'w9s2-trace-matrix',
          title: 'The trace matrix, read from the model',
          purpose: 'Use the model to find gaps: the needs-to-requirements matrix is computed from the derivations, and the open items it cannot see come from the Phase I record.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-trace-fragment',
            caption: 'A fragment of the AeroLink trace matrix, computed from the derivations in model v0.2, with the Week 2 open items the derivations cannot show. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A table with columns need, STK, SYS, status. ${TRACE_FRAGMENT.map((r) => `${r.need}: ${r.stk}; ${r.sys}; ${r.status}`).join('. ')}. A dash means none yet; +1 means one more.`,
          },
          body: [
            { kind: 'bullets', items: [`Every one of the ${COUNTS.needs} needs has a stakeholder requirement`, `Week 2 left ${numberWord(PARTIAL_ALL.length)} partly covered; Week 9 writes ${listOf(closedW9)}`, `${numberWord(partialIds.length)} still open: ${listOf(partialIds)}`, `${numberWord(CHILDLESS_STK.length)} stakeholder requirements have no system requirement yet`, 'Each gap gets a disposition, never a borrowed link'] },
          ],
          sources: [],
          notes: {
            teach: [
              `The matrix is not typed: the lab tool reads it from the derivation connections in the model. For AeroLink every one of the ${COUNTS.needs} needs has at least one stakeholder requirement derived from it; NEED-011, the gap of the Week 2 audit, was closed in Week 3 by REQ-STK-018 and REQ-STK-019.`,
              `But a derivation shows only that a link exists. Week 2 recorded ${numberWord(PARTIAL_ALL.length)} needs covered only in part, and the Week 7 package review found that no later week had done them: it deferred two to this week. So the AeroLink model v0.2 writes them: ${PARTIAL_CLOSED_W9.map((p) => `${p.closedBy} for ${p.need}, the part ${p.by} left out (${p.missing})`).join('; ')}. Their IDs continue after the highest in the package, REQ-STK-019, and the open time of the second becomes a new owned unknown. The third, ${PARTIAL_OPEN.map((p) => `${p.need} (${p.missing})`).join('; ')}, waits for the fare ratio TBR-02; the model shows it as covered, and only the open item carried from the record says otherwise, so the trace matrix lists it beside the row.`,
              `Two more kinds of finding. ${numberWord(CHILDLESS_STK.length)} stakeholder requirements have no system requirement yet (${CHILDLESS_STK.join(', ')}); each carries a disposition, an open item with a week or “no child needed” with the reason. And ${CAP_ONLY.join(', ')} traces only to a capability, so its derivation waits for Week 10.`,
              'The disposition is an engineering decision. The wrong fix is to link an existing requirement that does not oblige anyone to meet the missing part: the matrix looks complete and the gap is hidden.',
            ],
            why: 'Students learn that the model finds structural gaps mechanically, and that the gaps it cannot see are carried by the record, the lesson of the Week 7 review.',
            figure: 'Read the rows: the chain need fully traced, NEED-011 closed in Week 3, the two needs whose missing part Week 9 writes, and the one still partly covered, with its open-item flag.',
            misconceptions: [{ claim: 'A full trace matrix means every need is met.', correction: 'A derivation shows a link exists; a need can still be only partly covered, which only the recorded open item shows.' }],
            transition: 'A checklist for your own modeled requirements: the common errors.',
            timing: '3 min: 1 min computed coverage, 1 min the partial coverage and what Week 9 writes, 1 min the other findings and the wrong fix.',
          },
        },
        {
          id: 'w9s2-common-errors',
          title: 'Common errors in modeled requirements',
          purpose: 'A checklist students can apply to their own model: seven errors and what to write instead.',
          minutes: 4,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Error', 'Instead'],
              rows: [
                ['Enterprise subject on a system requirement', 'Element the shall is about'],
                ['Doc only', 'Constraint, or recorded TBD'],
                ['Definition where a usage was meant', 'Usage carries the ID'],
                ['satisfy between requirements', 'Derivation'],
                ['Unquoted hyphenated ID', 'Quoted short name'],
                ['Mixed-subject group satisfied', 'Satisfy its members'],
                ['Every concern framed', 'Only answered concerns'],
              ],
            },
          ],
          sources: [R('R83', '161–162'), R('R83', '165'), R('R83', '168'), R('R74', '90')],
          notes: {
            teach: [
              'One: the enterprise as subject of a system requirement; the subject is too large to satisfy at element level (R83 p.161). Two: a doc-only requirement, the lowest level of requirement semantics in the rubric. Three: a requirement definition where a usage was meant; the ID then names a template, not a requirement, and nothing is required of anything until a usage exists (R83 p.165).',
              'Four: satisfy between two requirements; use a derivation, because satisfy binds a design element to the subject (R83 p.168). Five: an unquoted hyphenated ID; the checker rejects it. Six: a group whose members keep different subjects treated as if one element could satisfy it (R74 sl.90). Seven: framing every concern of a stakeholder instead of the concerns the need answers (R83 p.162).',
              'Ask students to run the list over the exit card they wrote after Session 1: which of the seven, if any, does it show? Take two answers, and for each ask what the corrected line would be. The commonest answer in practice is error one: the system requirement was written with the enterprise as subject because that is the subject of the stakeholder requirement above it. The fix is to ask what the shall is about and to name that element, even as a placeholder.',
              'Point out which of the seven the lab tool reports for you: a doc-only requirement, a system requirement without an element subject, and a requirement without a parent appear in its trace audit; the others are yours to find in review.',
            ],
            why: 'A short, named checklist turns the session’s rules into a review tool students apply before the instructor does.',
            misconceptions: [{ claim: 'The checker would catch these.', correction: 'Only error five is rejected; error four draws a warning; the other five pass without a message.' }],
            transition: 'Test the checker rule once more: predict three results.',
            timing: '4 min: 1.5 min errors one to three, 1.5 min four to seven, 1 min the exit-card check.',
          },
        },
        {
          id: 'w9s2-predict',
          title: 'Predict the checker',
          purpose: 'Practise the PASS-is-not-meaning rule: three listings, students predict PASS, PASS with a warning, or FAIL before the reveal on the next slide.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-predict-cards',
            caption: 'Three listings to judge before the reveal: predict PASS, PASS with a warning, or FAIL, and say whether each says what it means. Course illustration, not SysML v2 graphical notation.',
            alt: `Three panels stacked, numbered 1 to 3, each showing code. Panel 1: ${listing('predict-unquoted').lines[0].trim()} Panel 2: ${listing('predict-reversed').lines.filter((l) => l.trim().startsWith('end')).map((l) => l.trim()).join(' / ')} Panel 3: ${listing('predict-satisfy').lines[0].trim()} Under them: each: PASS, warning or FAIL?`,
          },
          body: [{ kind: 'bullets', items: ['1 · an ID without quotes', '2 · a derivation with its ends swapped', '3 · satisfy written between two requirements', 'For each: PASS, PASS with a warning, or FAIL?'] }],
          sources: [],
          notes: {
            teach: [
              'Show the three cards. For each, students write a prediction, PASS, PASS with a warning, or FAIL, and a second answer: does the listing say what its author meant?',
              'Card 1 writes a course ID as a short name without quotes. Card 2 is a derivation connection whose original end is the system requirement and whose derived end is the stakeholder requirement. Card 3 writes satisfy with the system requirement as the requirement and the stakeholder requirement as the satisfier.',
              'Give a minute of silent prediction, then a minute in pairs. Collect the counts for each card on the board. Do not reveal: the next slide does.',
            ],
            why: 'Predicting before seeing the result makes the reveal memorable, and asking about meaning separately from validity rehearses the rule students most need in the lab.',
            figure: 'Point at each card and its empty vote boxes; read the one-line description of each.',
            transition: 'Reveal the recorded results.',
            timing: '3 min: 1 min silent prediction, 1 min pairs, 1 min counts on the board.',
          },
        },
        {
          id: 'w9s2-predict-reveal',
          title: 'Reveal: all three are wrong; only the syntax error is rejected',
          purpose: 'Reveal the recorded results of the three predict listings and debrief: all three are wrong, and only the syntax error is rejected.',
          minutes: 1,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Listing', 'Recorded result', 'Says what it means?'],
              rows: [
                ['1 · unquoted ID', 'FAIL', 'No, and caught'],
                ['2 · swapped derivation', 'PASS, no message', 'No, not caught'],
                ['3 · satisfy between requirements', 'PASS, one warning', 'No, only a type warning'],
              ],
            },
          ],
          sources: [R('R115', '580'), R('R83', '168')],
          notes: {
            teach: [
              `Card 1: ${pUnq.recorded}. Card 2: ${pRev.recorded}; the checker cannot know which requirement is the parent, because direction is meaning (R115 p.580). Card 3: ${pSat.recorded}; a requirement is not a design element, and satisfy binds the satisfier to the subject (R83 p.168).`,
              'Debrief in one sentence: all three are wrong; the syntax error is rejected, the two semantic errors pass, and one of them draws only a type warning.',
            ],
            why: 'The reveal confirms with recorded results that the checker catches syntax, not meaning.',
            transition: 'Reviewers are scarce. AI tools can propose findings quickly; the engineering is in deciding which are real.',
            timing: '1 min: 20 s per card.',
          },
        },
      ],
    },
    // ============================================================================================ G. AI-assisted review and the lab mapping (12 min)
    {
      id: 'w9s2-ai',
      title: 'AI-assisted requirements quality assessment',
      slides: [
        {
          id: 'w9s2-ai-method',
          title: 'The method: AI findings are candidates to disposition',
          purpose: 'Teach a defensible way to use AI on requirements: export the text, ask for findings in four named categories tied to IDs and quotes, decide each with a reason, re-run the checker and re-read changed requirements against their needs.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-ai-funnel',
            caption: 'The course method for AI-assisted review: findings in, a decision and a reason for each, a change with an ID, then the checker and an intent re-read. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, joined by arrows: findings: an ID and a quote; triage: decide, with a reason; change: in the record; check: checker, then the need.',
          },
          body: [
            { kind: 'bullets', items: ['Export the requirements and their needs', 'Ask for findings in four categories, each with an ID and a quote', 'Decide each: accept or reject, with a reason', 'Change, re-run the checker, re-read against the need'] },
            { kind: 'callout', tone: 'caution', title: 'Course method', text: 'The AI sees only the text: “missing information” is a prompt, not a fact.' },
          ],
          sources: [R('R13', '566')],
          notes: {
            teach: [
              `The lab asks your team to use an AI tool to find ambiguity, duplication, conflicts and missing information in your requirements. The method is a course method, built on SEBoK’s requirement verification and validation (R13 p.566); no source in the course collection prescribes one.`,
              'Step one: export the requirement text, statement, subject, constraint and metadata, with the needs each derives from; the lab tool’s trace-matrix file holds them. Step two: ask for findings in the four named categories, each tied to a requirement ID and a quoted phrase, so that every finding can be checked against the text. Step three: decide each finding, accept or reject, with a reason; for an accepted one, record the change you made and where. Step four: change the Phase I record or the model, re-run the checker, and re-read every changed requirement against its need: that last step is requirement validation.',
              'Read the caution. The AI sees only the text; it cannot see intent that is not written down. Its “missing information” findings are prompts to check, not facts. Every AI-suggested change is tagged and reviewed by its owner, and the AI usage statement says what the tool suggested and what you kept.',
              `Minimum, a course proposal pending faculty approval: at least ${LAB9_MINIMUMS.aiFindings} findings dispositioned for a team of four, ${LAB9_MINIMUMS.aiFindingsThree} for a team of three.`,
            ],
            why: 'AI review is fast and often wrong; a method that ties every finding to a quote and demands a reasoned decision keeps the engineering judgment with the team.',
            figure: 'Walk the four lanes left to right, naming what enters and leaves each; point at the reason box in lane 2 as the graded part.',
            misconceptions: [{ claim: 'An AI finding that sounds plausible should be accepted.', correction: 'Every finding is a candidate: it is accepted only with a reason the team can defend against the text and the need.' }],
            transition: 'See the method on a seeded AeroLink set.',
            timing: '4 min: 30 s the task, 2 min the four steps, 1 min the caution, 30 s the minimum.',
          },
        },
        {
          id: 'w9s2-ai-demo',
          title: 'Demonstrated on AeroLink: a seeded review set',
          purpose: 'Show triage on a known set: six AeroLink-style drafts with four seeded defects, and an AI-style list of eight findings that the class triages live.',
          minutes: 3,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['#', 'Draft', 'Category', 'Quoted phrase'],
              rows: AI_FINDINGS.map((f) => [String(f.n), f.draft, f.category, `“${f.quote}”`]),
            },
          ],
          sources: [],
          notes: {
            teach: [
              `The six drafts, in the course file of the review set, are written in AeroLink’s style; ${numberWord(REVIEW_SEEDED.length)} of them carry a seeded defect, one of each category: ${REVIEW_SEEDED.map((s) => `${s.draft}, ${s.category}: ${s.defect}`).join('; ')}. All six pass the checker, which is the point: the defects are in what the requirements say.`,
              `The AI-style list has eight findings: ${numberWord(TRUE_FINDINGS)} true, ${numberWord(FALSE_POS)} false positives and ${numberWord(PARTLY)} partly right. Triage three live: finding 3, finding 5 and finding 7. Ask the class to accept or reject each, with a reason that cites the text or another requirement.`,
              `Instructor key for the three: ${[3, 5, 7].map((n) => { const f = AI_FINDINGS.find((x) => x.n === n)!; return `finding ${n} is ${f.verdict}, ${f.disposition}: ${f.reason}` }).join(' ')}`,
              'The lesson: the false positives are as instructive as the true ones. Rejecting finding 7 needs the turnaround arithmetic; rejecting finding 5 needs a clear idea of what duplication is.',
            ],
            why: 'Triage on a set whose answers are known lets students practise the judgment, including saying no to a confident tool, before they face their own requirements.',
            misconceptions: [{ claim: 'A finding on a requirement with a seeded defect must be true.', correction: 'Finding 7 is about a seeded draft and is still a false positive: judge each finding against the text, not against its target.' }],
            transition: 'Now map your own package into the model.',
            timing: '3 min: 30 s the set, 2 min three findings live, 30 s the lesson.',
          },
        },
        {
          id: 'w9s2-mapping',
          title: 'Mapping your package into the model: the lab tool',
          purpose: 'Prepare the lab: the artifact-to-model mapping for this week, the decision students make per requirement, and the lab tool’s four steps.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-tool-steps',
            caption: 'The Week 9 lab tool in four steps: import three files, decide each requirement, read the trace audit, preview and export. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, joined by arrows: 1 · import three files; 2 · decide each requirement; 3 · read the trace audit; 4 · preview and export.',
          },
          body: [
            { kind: 'bullets', items: ['Needs → Needs: subject the enterprise, stakeholder, frame', 'Requirements → Requirements: subject, constraint, metadata', 'Parents → derivations; capabilities wait for Week 10', 'Per system requirement: decide the subject now (a placeholder if needed)'] },
          ],
          sources: [],
          notes: {
            teach: [
              'The mapping for this week, a course convention: each need becomes a requirement usage in Needs with the enterprise as subject, its stakeholders as parameters and a frame for each concern it answers; each requirement becomes a usage in Requirements with a subject, a required constraint where you formalize one, and its attributes, rationale and TBD status as metadata; each parent link to a need or requirement becomes a derivation connection; a parent link to a capability is recorded in the trace matrix and modeled in Week 10.',
              'The decision you make per requirement: for a stakeholder requirement, the measured feature of the enterprise, the comparison and the limit; for a system requirement, first the subject. If the element is not yet in your model, name a placeholder part definition in the Physical or Logical package; Weeks 10 and 11 complete it.',
              'Walk the tool’s four steps. Import your Week 8 model file and your Week 1 and Week 2 exports; AeroLink files and files from another team are refused with a reason. Decide each requirement. Read the trace audit and write a disposition for each trace finding. Preview model v0.2 and export it with the trace matrix. Everything stays in your browser: export after every working session and share the workspace file with teammates.',
            ],
            why: 'Knowing the mapping and the tool before the team work starts lets the 12 minutes go to decisions, not to finding buttons.',
            figure: 'Point at the four panels in order; in panel 2, point at the subject field and say that is the decision to make first.',
            misconceptions: [{ claim: 'The tool decides the subjects and constraints.', correction: 'The tool writes what you decide; it reports what is missing, but every subject, feature and limit is the team’s choice.' }],
            transition: 'Where do your requirements go after this week?',
            timing: '3 min: 1 min mapping, 1 min the decision, 1 min the tool.',
          },
        },
        {
          id: 'w9s2-bridge',
          title: 'Bridge: where requirements go next',
          purpose: 'Show the thread ahead: functions in Week 10, design elements and satisfy in Week 11, verification cases and verify in Week 12, analysis in Week 13.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-bridge',
            caption: 'The requirements modeled this week are what Weeks 10 to 13 connect to: functions, design elements, verification cases and analyses. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, joined by arrows: Week 10: functions; Week 11: satisfy; Week 12: verify; Week 13: analysis.',
          },
          body: [{ kind: 'bullets', items: ['Week 10: functions and capabilities; the capability parents linked', 'Week 11: physical elements; the first defensible satisfy claims', 'Week 12: verification cases that verify requirements', 'Week 13: analysis cases that evaluate constraints'] }],
          sources: [],
          notes: {
            teach: [
              'Week 10 models functions and capabilities; the capability parents your requirements carry, pending this week, are linked then, and the placeholder subjects in Logical become logical elements. Week 11 models the physical elements and interfaces, and writes the first satisfy claims, which can be defended because design elements now have values. Week 12 models verification cases that verify your requirements, and the measures. Week 13 models analysis cases that evaluate constraints.',
              'Every one of those weeks reads the requirements you model this week. A requirement without a subject or a constraint now is a requirement nobody can satisfy or verify later.',
            ],
            why: 'Seeing the whole thread ahead explains why the lab insists on subjects and constraints now, not later.',
            figure: 'Point at each step as you name its week, ending at Week 13.',
            transition: 'Now your team models its own needs and requirements.',
            timing: '2 min: 1.5 min the four weeks, 30 s why it matters now.',
          },
        },
      ],
    },
    // ============================================================================================ H. laboratory launch (22 min)
    {
      id: 'w9s2-lab',
      title: 'Laboratory launch',
      slides: [
        {
          id: 'w9s2-lab-brief',
          title: 'Lab L9: model v0.2 of your enterprise',
          subtitle: 'Due before Week 10, Session 1, on the LMS; your own enterprise, never AeroLink',
          purpose: 'Give unambiguous instructions for model v0.2: the three files, what each contains, the minimums, the deadline, the workload and the AI statement.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-deliverables',
            caption: 'Lab L9 deliverables: three files, one upload (course convention). Course illustration, not SysML v2 graphical notation.',
            alt: `Four bars stacked top to bottom: ${LAB9_OUTPUTS.map((o) => o.file).join('; ')}; one upload, before Week 10.`,
          },
          body: [{ kind: 'bullets', items: ['Your own enterprise, never AeroLink', `Three files: ${outputFiles.join(', ')}`, 'Zero checker errors; every warning explained', 'Formative feedback before Week 10, Session 2'] }],
          sources: [],
          notes: {
            teach: [
              `Read the three files. First, ${outputFiles[0]}: your Week 8 model with the Needs and Requirements packages modeled, the derivations, the placeholder subjects and the metadata. Second, ${outputFiles[1]}: the needs-to-requirements trace matrix, the requirements mapping table, the trace audit with a disposition for every finding, the partly covered needs (open items), the trace-audit note, and the AI review log. Third, ${outputFiles[2]}: the final checker run of model v0.2, with zero errors and every warning explained.`,
              `Minimums, a course proposal pending faculty approval: every Week 1 need and every Week 2 requirement in the model; every system requirement with an element subject and a required constraint or a recorded TBD with an owner; every requirement with a parent relationship or a disposition; at least one shared requirement definition used by at least ${LAB9_MINIMUMS.sharedUsages} requirements, or a one-line reason why none shares a form; at least ${LAB9_MINIMUMS.aiFindings} AI findings dispositioned.`,
              `Workload: about ${LAB9_TEAM_HOURS} person-hours out of class for a team of four, about ${EACH_FOUR} hours each; a team of three works to a reduced scope, about ${LAB9_TEAM_HOURS_THREE} person-hours, the same ${EACH_THREE} hours each, pending faculty approval.`,
              'The AI usage statement goes in the trace-matrix file. Any AI-suggested SysML must pass the checker and be explained by its owner, and the lab tool’s generated text counts as a tool output you review, not as your work until you have checked it against your Phase I record.',
            ],
            why: 'Unambiguous deliverables and minimums prevent careful work on the wrong thing, and stating the load per person makes the team-size rule visible.',
            figure: 'Read the three cards left to right, then the strip with the deadline.',
            examples: ['Rubric rows applied this week (instructor only): RB-8.1, 8.2, 8.4 (the core row), 8.6; RB-3.1 to 3.4 on a sample of ten modeled requirements and RB-3.6 for the AI review log; RB-9.1 (upward trace) and 9.4 (trace audit); RB-12.1 to 12.3. Formative this week; a faculty decision may make the Week 11 model the first graded baseline.', `Person-hours by task (team of four): ${LAB9_PERSON_HOURS.map((t) => `${t.task} ${t.hours}`).join('; ')}.`],
            misconceptions: [{ claim: 'The generated model can be submitted as it comes out of the tool.', correction: 'It is a draft built from your decisions; only the team can check the subjects, limits and frames against its record and the needs.' }],
            transition: 'Start now: one requirement chain, end to end.',
            timing: '3 min: 1 min the files, 1 min minimums, 1 min workload and AI.',
          },
        },
        {
          id: 'w9s2-lab-chain',
          title: 'Team work: model one chain end to end',
          subtitle: '12 minutes, in teams, in the Week 9 lab tool',
          purpose: 'Run the first lab steps in class with the instructor circulating: import the three files, then model one need, the stakeholder requirement derived from it and one system requirement derived from that, and preview the result.',
          minutes: 12,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s2-lab-chain',
            caption: 'In class: one need, its stakeholder requirement and one system requirement, with subject, constraint and both derivations, previewed in the lab tool. Course illustration, not SysML v2 graphical notation.',
            alt: 'Three cards stacked, joined by two arrows: need, stakeholder, frame; stakeholder req., enterprise subject; system requirement, element subject (drawn strong). Beside them three tags: 3 min import, 5 min, 4 min.',
          },
          body: [{ kind: 'bullets', items: ['Import your Week 8 model and your Week 1 and Week 2 exports', 'Pick one need with a stakeholder requirement and a system requirement under it', 'Formalize both requirements: subject, feature, comparison, limit', 'Preview: find your two derivations in the text'] }],
          sources: [],
          notes: {
            teach: [
              'Set a visible 12-minute timer. One laptop per team drives the lab tool; another member holds the Week 2 record open to check the tool against it.',
              'Minutes 0 to 3: import. Each team imports its Week 8 model file and its Week 1 and Week 2 model-inputs files. Check that every team sees its own enterprise name and the counts it expects. If a file is refused, read the message with the team: the usual causes are the AeroLink example file, the Markdown record instead of the JSON file, or a Week 8 model whose Needs or Requirements package was deleted.',
              'Minutes 3 to 8: the stakeholder requirement. Each team picks one need that has a stakeholder requirement and a system requirement under it, ideally the one on someone’s exit card. Enter the measured feature of the enterprise, the comparison and the limit with its unit. Ask each table: what quantity does this requirement constrain, and could it be measured?',
              'Minutes 8 to 12: the system requirement. Choose its subject first, an existing part definition or a named placeholder; then the feature, comparison and limit. Preview model v0.2 and find the two derivation connections of the chain in the text. Common errors to catch: the enterprise as subject of the system requirement; a feature named like the limit; a limit typed in the wrong unit.',
            ],
            why: 'Starting the decisions with the instructor in the room prevents a week spent formalizing requirements against the wrong subject.',
            figure: 'Point at the three cards in order as the timer passes each phase.',
            examples: ['A typical first mistake: a system requirement on the delivery vans with the enterprise as subject because it is the default; the tool reports it as a gap until a subject is chosen.'],
            misconceptions: [{ claim: 'Every requirement needs a new placeholder subject.', correction: 'Use an existing part definition when one fits; a placeholder only when the element is not yet in the model.' }],
            transition: 'Checkpoint: show the instructor your chain.',
            timing: '12 min: 3 import, 5 stakeholder requirement, 4 system requirement and preview.',
          },
        },
        {
          id: 'w9s2-lab-checkpoint',
          title: 'Instructor checkpoint',
          subtitle: 'Per team: the system requirement’s subject, its constraint, one derivation',
          purpose: 'Catch the common errors early: each team shows its system requirement’s subject, its required constraint and one derivation connection in the preview.',
          minutes: 5,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['Show: the system requirement’s subject', 'Show: its required constraint, read aloud', 'Show: one derivation: which end is the parent?', 'Note one fix to make before day 2'] }],
          sources: [],
          notes: {
            teach: [
              'Visit each team for about a minute. Ask to see the system requirement’s subject and why that element; its required constraint, read aloud as a sentence; and one derivation connection, with the question: which end is the parent?',
              'Typical findings: the enterprise as subject of a system requirement; a requirement left as doc only because the limit is a TBD, when the constraint should stay with a recorded status; a derivation read the wrong way round; an unquoted ID typed by hand in the preview text.',
              'Each team leaves with one fix noted for day 2. A team whose import failed books a slot with the teaching assistant before day 2; the Week 8 model must be importable before anything else can proceed.',
            ],
            why: 'A one-minute check per team catches the errors that would otherwise repeat across every requirement of the team’s model.',
            transition: 'Close with the next seven days.',
            timing: '5 min: about a minute per team, run while teams continue.',
          },
        },
        {
          id: 'w9s2-lab-close',
          title: 'Close: the next seven days',
          subtitle: 'Quiz Q9 and the applied exercise open today. Log your hours.',
          purpose: 'Give the out-of-class plan with lead roles, the assessments and the time log.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w9s2-seven-days',
            caption: 'A suggested seven-day plan for Lab L9, with the lead role for each task (course convention). Course illustration, not SysML v2 graphical notation.',
            alt: `A plan of days 1 to 7, one bar per task across the days it takes: ${SEVEN_DAY_PLAN.map((p) => `${p.task}, day${p.from === p.to ? ` ${p.from}` : `s ${p.from} to ${p.to}`}`).join('; ')}.`,
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Walk the plan once; it is a suggestion, and the team charter decides. The needs come first because every requirement derives from one; the AI review comes after the requirements are formalized, so it reviews the model you will submit; the checker and the trace audit come last, because the review often changes requirements.',
              `Assessment: readiness quiz Q9, individual, about 15 minutes, and the individual applied exercise on an unseen case, about ${EXERCISE_MINUTES} minutes; graduate students answer its fifth task on assumptions. Everything is due before Week 10, Session 1. Log your hours: the workload estimate is tested against them.`,
            ],
            why: 'A concrete plan with owners turns the brief into daily actions and makes individual accountability visible.',
            figure: 'Read the bars left to right; point at day 5, the AI review, before day 6, the final checker run and audit.',
            misconceptions: [{ claim: 'The AI review can be done first, on the Week 2 text.', correction: 'Review the modeled requirements: the subjects and constraints you choose this week are part of what is reviewed.' }],
            transition: 'End of Week 9. Week 10 models the functions and behavior your requirements are allocated to.',
            timing: '2 min: 1.5 min plan and assessment, 30 s questions.',
          },
        },
        {
          id: 'w9s2-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up; no commentary is needed. The list is generated from every citation in the session, with the training deck’s license statement and SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on, and the sources’ licenses require the attribution.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],
  // ============================================================================================ student lesson
  studentLesson: [
    {
      id: 'w9s2-l-quality',
      title: 'Judging modeled requirements: verification and validation of requirements',
      blocks: [
        { kind: 'para', text: 'Session 2 starts with three requirements about a library’s book-return kiosk, all carrying the same statement: the kiosk shall scan a returned book within 3 seconds. The first has only a doc comment: it is still a constraint, but the model has nothing to evaluate. The second has a subject and a constraint, but the subject is the whole library service and the constraint compares the service’s opening hours with the limit, so nothing at the kiosk is constrained and nothing about scanning. The third is right: the kiosk is the subject, and the constraint reads the kiosk’s scan time. All three pass the checker.' },
        { kind: 'figure', slide: 'w9s2-warmup' },
        { kind: 'para', text: 'Judging a requirement has two sides, and SEBoK names them. Requirement verification asks whether the requirements are well formed: whether the individual requirements and the set have the characteristics and follow the rules defined in the organization’s criteria for well-formed requirements. Requirement validation asks whether these are the right requirements: whether they clearly communicate the intent of the needs, parent requirements and other sources they were transformed from. SEBoK stresses that neither is the same as system verification and system validation, which Week 12 models. The methods include peer review and comparing each requirement against a set of characteristics and against the integrated set of needs.' },
        { kind: 'figure', slide: 'w9s2-req-vv' },
        { kind: 'para', text: 'The model helps with some characteristics and not with others. The DoD guidebook lists the attributes of good requirements, among them necessary, unique, unambiguous, complete, consistent, traceable, measurable, verifiable and singular. A model makes traceability visible, because every requirement has a derivation or a dependency to a parent or it does not, and the lab tool lists the ones that do not. It makes part of verifiability visible: a required constraint and a recorded method. SEBoK adds that defining the verification criterion and method when the requirement is written helps make it verifiable, and that this information can be captured in the requirement’s attributes. But only a reviewer can say whether the parent is the right one, whether the criterion can be tested, whether every reader reads the text alike, and whether the limit and the subject are right.' },
      ],
      sources: [R('R83', '161–162'), R('R13', '566'), R('R48b', '144')],
    },
    {
      id: 'w9s2-l-worked',
      title: 'The AeroLink worked model: four decisions',
      blocks: [
        { kind: 'para', text: `AeroLink model v0.2 is generated from the closed Phase I package: ${COUNTS.stk} stakeholder requirements and ${COUNTS.sys} system requirements, including the ${numberWord(COUNTS.weekAdded.w3)} stakeholder requirements Week 3 wrote for the disrupted-trip need, the ${numberWord(COUNTS.weekAdded.w5)} interface requirements Week 5 wrote, and the ${numberWord(COUNTS.weekAdded.w9)} stakeholder requirements Week 9 writes for the open items the Week 7 review deferred to this week. Each requirement is generated from its Phase I row and the instructor’s modeling decision: the subject, the measured feature, the comparison and the limit. Nothing is retyped.` },
        { kind: 'heading', text: 'A stakeholder requirement in full' },
        { kind: 'para', text: `${STK1.id} has its Week 2 ID as short name and its Week 2 name as declared name. Its doc is the Week 2 statement, word for word: ${STK1.statement} Its subject is the enterprise. Its limit comes from the Week 2 criterion: an attribute of type duration, bound to 15 minutes. Its required constraint compares a feature of the enterprise, the 90th-percentile wait, with that limit; the generator adds the feature to the enterprise definition so that the constraint reads something the enterprise has. Then come two annotations: the requirement attributes (level, type, method, criterion) and the rationale. Outside the requirement, a derivation connection from its Week 1 need makes the trace; its parent capability waits for Week 10.` },
        { kind: 'figure', slide: 'w9s2-worked-stk' },
        { kind: 'heading', text: 'A limit that is still to be decided' },
        { kind: 'para', text: `${SYS10.id} limits the combined power of all chargers at a vertiport to the configured connection limit, which is TBD-02 because the utility has not agreed it. Model v0.2 keeps the required constraint, leaves the limit without a value and annotates the requirement with a status of tbd and the owner from the Week 2 register. That records the open value honestly. But a constraint over an unbound feature does not mean “for every possible limit”; it constrains the feature to values that make the constraint true, and a large enough limit always does. This is reasoning from the semantics, not a sentence of the source. The fix is to bind the limit to the value configured in the subject, the chargers’ configured connection limit: then the requirement says what the Week 2 statement means, and the TBD becomes the question of what value is configured.` },
        { kind: 'figure', slide: 'w9s2-worked-tbd' },
        { kind: 'para', text: 'The rule: a TBD is a recorded status with an owner and a closure event, never a missing constraint. A TBR, a value known with low confidence, is recorded as tbc, to be confirmed, with the value bound.' },
        { kind: 'heading', text: '“In still air”: gate or reference condition?' },
        { kind: 'para', text: `${SYS7.id} asks the aircraft to complete a 25 km trip within 16 minutes block time in still air. One reading treats the condition as a gate: the weather becomes an actor, an assumption requires the wind speed to be at most a small tolerance, and the required constraint bounds the block time. The effective constraint is then “if still air, then within the block time”. But the design-trip block time is one still-air design value of the aircraft; it does not change with tomorrow’s wind. In any wind above the tolerance the assumption is false and the requirement is vacuously satisfied, so the gate adds nothing and suggests a claim about windy days that the requirement does not make.` },
        { kind: 'figure', slide: 'w9s2-worked-assume' },
        { kind: 'para', text: 'The reference-condition reading keeps the condition with the quantity: the feature is named for the still-air block time, the doc states the condition, and verification corrects measured times to still air before comparing them. Model v0.2 uses this reading; the choice is the course’s, since the specification gives the semantics and not the choice. Use an assumption when the condition bounds where the requirement applies and the required quantity depends on what the condition constrains, as a braking distance depends on road conditions; otherwise keep the condition in the quantity.' },
        { kind: 'heading', text: 'A derivation chain' },
        { kind: 'para', text: `${NEED.id}, pads not limited by turnaround, has ${STK5.id} derived from it: pad arrival to dispatch-ready within ${B.total} minutes. ${SYS1.id} is derived from ${STK5.id}: the chargers charge to the dispatch threshold within ${B.charge} minutes. Read each derivation with its library semantics: any subject that satisfies the original requirement should, in itself or through things related to it, satisfy each derived requirement, and whenever the original is satisfied the derived ones must be too. The service meets the turnaround through its chargers, and the budget is ${B.charge} minutes of charging plus ${B.padWork} minutes of pad work, with boarding overlapping the charge. That arithmetic is in the rationale of the requirements, from Week 2; the derivation asserts the relation and computes nothing.` },
        { kind: 'figure', slide: 'w9s2-worked-chain' },
      ],
      sources: [R('R83', '161–162'), R('R83', '165'), R('R83', '168'), R('R114', '555–557'), R('R84', '175'), R('R115', '580–581')],
    },
    {
      id: 'w9s2-l-trace',
      title: 'The trace matrix and the trace audit',
      blocks: [
        { kind: 'para', text: `Because every derivation is in the model, the trace matrix can be read from it instead of typed. The lab tool computes it: one row per need, with its stakeholders, the concerns it frames, the stakeholder requirements derived from it and the system requirements derived from those, and a grid of needs against stakeholder requirements. For AeroLink every one of the ${COUNTS.needs} needs has at least one stakeholder requirement; the need that the Week 2 audit found uncovered, NEED-011, was covered in Week 3 by REQ-STK-018 and REQ-STK-019.` },
        { kind: 'figure', slide: 'w9s2-trace-matrix' },
        { kind: 'para', text: `A derivation shows that a link exists, not that the need is fully met. Week 2 recorded ${numberWord(PARTIAL_ALL.length)} needs covered only in part, each with an open item, and the Week 7 package review found that no later week had done them; it deferred two to this week, owned by the Requirements and Compliance lead. AeroLink model v0.2 therefore writes them: ${PARTIAL_CLOSED_W9.map((p) => `${p.closedBy} for ${p.need}, the part ${p.by} left out (${p.missing})`).join('; ')}. Their IDs continue after the highest ID in the package, REQ-STK-019, because an ID is never reused; the unknown clearing time of the second gets the next unknown ID and the next TBD number. The third item, ${PARTIAL_OPEN.map((p) => `${p.need} (${p.missing})`).join('; ')}, waits for the fare ratio TBR-02. The model shows that need as covered; only the open item carried from the Phase I record says otherwise, so the trace matrix lists it beside the row. An audit that reads the model alone would lose such items, which is the defect the Week 7 review found when a package dropped them.` },
        { kind: 'para', text: `The audit also lists stakeholder requirements with no system requirement yet, ${numberWord(CHILDLESS_STK.length)} in AeroLink (${CHILDLESS_STK.join(', ')}), each with a disposition: an open item with an owner and a week, or no child needed with the reason. And it lists requirements whose only parent is a capability, such as ${CAP_ONLY.join(', ')}, whose derivation is drawn in Week 10 when capabilities are modeled. The disposition of every finding is an engineering decision. The wrong fix is to link an existing requirement that does not oblige anyone to meet the missing part: the matrix then looks complete and the gap is hidden.` },
      ],
      sources: [R('R115', '580')],
    },
    {
      id: 'w9s2-l-errors',
      title: 'Common errors, and what the checker sees of them',
      blocks: [
        { kind: 'para', text: 'Seven errors recur in modeled requirements. The enterprise as the subject of a system requirement: no design element can be shown to satisfy a requirement on the whole enterprise, so choose the element the shall is about. A doc-only requirement: the lowest level of requirement semantics; write a required constraint, or keep the constraint and record a TBD. A requirement definition where a usage was meant: the ID then names a template, and nothing is required of anything until a usage exists. A satisfy between two requirements: satisfy binds a design element to the subject; between requirements, use a derivation. An unquoted hyphenated ID: write the ID as a quoted short name. A group whose members keep different subjects treated as if one element could satisfy it: satisfy its members instead. And framing every concern of a stakeholder instead of only the concerns the need answers.' },
        { kind: 'figure', slide: 'w9s2-predict' },
        { kind: 'para', text: `Of the seven, the checker rejects only the unquoted ID. The three predict listings make the point with recorded results. A course ID without quotes: ${pUnq.recorded}. A derivation whose ends are swapped: ${pRev.recorded}; the checker cannot know which requirement is the parent, because direction is meaning. A satisfy written between two requirements: ${pSat.recorded}. Two of the three are semantically wrong, and only one is rejected.` },
      ],
      sources: [R('R83', '161–162'), R('R83', '165'), R('R83', '168'), R('R74', '90'), R('R115', '580')],
    },
    {
      id: 'w9s2-l-ai',
      title: 'AI-assisted review: findings are candidates',
      blocks: [
        { kind: 'para', text: 'The lab asks your team to use an AI tool to find ambiguity, duplication, conflicts and missing information in its requirements. No source in the course collection prescribes a method for this, so the course gives one, built on requirement verification and validation. First, export the requirement text, with its statement, subject, constraint and metadata, and the needs each requirement derives from. Second, ask for findings in the four named categories, each tied to a requirement ID and a quoted phrase, so that every finding can be checked against the text. Third, decide each finding, accept or reject, with a reason; for an accepted finding, record the change and where it was made. Fourth, make the change in the Phase I record or the model, re-run the checker, and re-read every changed requirement against its need.' },
        { kind: 'figure', slide: 'w9s2-ai-method' },
        { kind: 'para', text: 'The AI sees only the text. It cannot see intent that is not written down, so a “missing information” finding is a prompt to check, not a fact. Every AI-suggested change is tagged and reviewed by its owner, and the AI usage statement says what the tool suggested and what the team kept or rejected.' },
        { kind: 'para', text: `The demonstration set has six drafts written in AeroLink’s style, ${numberWord(REVIEW_SEEDED.length)} of them with a seeded defect, one in each category, and an AI-style list of eight findings: ${numberWord(TRUE_FINDINGS)} true, ${numberWord(FALSE_POS)} false positives and ${numberWord(PARTLY)} partly right. Try them before you open the instructor’s dispositions on the worked-examples page: for each finding, decide whether to accept it and write the reason you would defend. The false positives teach as much as the true findings: rejecting a claimed conflict between a 20-minute charge and a 25-minute turnaround needs the turnaround arithmetic, and rejecting a claimed duplication needs a clear idea of what duplication is.` },
      ],
      sources: [R('R13', '566')],
    },
    {
      id: 'w9s2-l-lab',
      title: 'From your package to model v0.2',
      blocks: [
        { kind: 'para', text: 'The mapping for this week is a course convention. Each need becomes a requirement usage in the Needs package with the enterprise as subject, its stakeholders as parameters typed by your Week 8 part definitions, and a frame for each concern it answers. Each requirement becomes a usage in the Requirements package with its ID as short name, its statement as doc, a subject, a required constraint where you formalize one, and its attributes, rationale and TBD status as metadata. Each parent link to a need or a requirement becomes a derivation connection; a link to a capability is recorded in the trace matrix and modeled in Week 10.' },
        { kind: 'figure', slide: 'w9s2-mapping' },
        { kind: 'para', text: 'The decision you make for each requirement is the one this week taught. For a stakeholder requirement, name the measured feature of the enterprise, the comparison and the limit with its unit. For a system requirement, choose the subject first: an existing part definition of your model, or a placeholder part definition in the Physical or Logical package that Weeks 10 and 11 complete. Mark two or more requirements of the same form to share one requirement definition.' },
        { kind: 'para', text: 'Where do the requirements go next? Week 10 models functions and capabilities and links the capability parents. Week 11 models physical elements and interfaces and writes the first satisfy claims. Week 12 models verification cases that verify your requirements, and the measures. Week 13 models analysis cases that evaluate constraints. Each of them reads the requirements you model this week, so a requirement without a subject or a constraint now is one nobody can satisfy or verify later.' },
        { kind: 'figure', slide: 'w9s2-bridge' },
      ],
      sources: [],
    },
  ],
}
