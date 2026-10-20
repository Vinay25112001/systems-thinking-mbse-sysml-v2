// Lab L2, the Week 2 Team Record: the full laboratory instructions, single source for the Week 2 Laboratory page and
// docs/lectures/week02/WEEK2_LAB_INSTRUCTIONS.md (labMarkdown(), written by `npm run lab:md`; week02Lab.test.ts fails
// when the file and this module differ). Mirrors src/content/lab/week01Lab.ts.
//
// Single sources: the minimums, scenario kinds, requirement types, methods, hard gates and advisories come from
// src/content/lectures/week02/labBrief.ts (the same module the lab tool, src/workbench/week2/record.ts, checks against);
// the in-class minutes, readings, workload and deliverables from src/content/week2Path.ts; the rubric rows from the
// rubric register (getRubric). "Taught in" references are computed from the registered lectures by slide id, with a
// fallback string while a lecture is being written.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the record is
// always about the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import { DELIVERABLES, EXTENSION_READINGS, LAB_PERSON_HOURS, LAB_TEAM_HOURS, PROPOSED_OBJECTIVES, REQUIRED_READINGS_CITES, S2_LAB, THREE_PERSON, WORKLOAD_ROWS } from '../week2Path'
import {
  AUDIT_DISPOSITION_TEXT, LAB2_MINIMUMS as MIN, LAB2_MINIMUMS_THREE as MIN3, REQUIRED_KINDS, REQUIRED_KINDS_THREE, REQ_ADVISORIES, REQ_HARD_GATES, REQ_RECORD_TEXT, REQ_TYPES, SCENARIO_FIELDS, SCENARIO_KINDS, VER_METHODS, WEEK2_PARTS,
} from '../lectures/week02/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W2 = WEEKS[1]

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L2: ConOps and requirements for your enterprise'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id; the fallback is used only while the
 *  lecture is not registered or the slide id is missing. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(2, session)
  if (l) {
    const slides = allSlides(l)
    const i = slides.findIndex((s) => s.id === slideId)
    if (i >= 0) return `Session ${session}, slide ${i + 1} ‘${slides[i].title}’`
  }
  return `Session ${session}, slide ${fallback.slide} ‘${fallback.title}’`
}
const t1 = (id: string, slide: number, title: string) => taughtIn(1, id, { slide, title })
const t2 = (id: string, slide: number, title: string) => taughtIn(2, id, { slide, title })

// ------------------------------------------------------------------------------------------- the lab at a glance
const recordDue = DELIVERABLES.find((d) => d.id === 'record')!
export const LAB_PURPOSE = n(
  'Apply the Week 2 method to your team’s own enterprise, never to AeroLink: write the concept of operations, put the needs into operation with scenarios that include the off-nominal case, record what the scenarios expose, derive capabilities, write stakeholder and system requirements that pass the course quality gate, audit the trace in both directions and define the first measures. The result extends your Week 1 Team Record with Parts 7–11; its requirements, scenarios and measures are the inputs of the Week 3 trade study and, in Phase II, become requirement definitions, use cases and verification cases in your SysML v2 model.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the plan (${S2_LAB.plan} min: scenario list, owners, off-nominal skeleton), the scenario clinic (${S2_LAB.clinic} min, up to ${S2_LAB.clinicTeams} teams; the others post their scenario list on the LMS and are answered within 48 hours) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${recordDue.due}; one team member uploads both files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 3, Session 2' },
]

/** Inputs: the Week 1 record as returned, the teaching material, the readings and the tool. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your Week 1 Team Record as returned with feedback: the approved enterprise and its system of interest, the context, the stakeholder register, and the needs with their priority and the goal each serves. Correct it first where the feedback asks.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink weather scenario and what it exposed, the coverage matrix, the capability tree, the requirement chains, the critique, the trace audit and the measures.'), to: '/week/2/examples' },
  { text: n('The required readings for the week.'), cites: REQUIRED_READINGS_CITES },
  { text: n('Further reading on writing requirements (not required this week; the basis of the graduate memo).'), cites: EXTENSION_READINGS },
  { text: n('The lab tool, which imports your Week 1 record, checks every part as you go, shares the record between teammates and exports it.'), to: '/week/2/lab/tool' },
]

/** Objectives this lab practices (course.ts IDs; W2.6 and W2.7 are proposed, pending faculty approval). */
export const LAB_OBJECTIVES = [
  ...['W2.1', 'W2.3', 'W2.4', 'W2.5'].map((id) => ({ id, text: W2.objectives.find((x) => x.id === id)!.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.filter((o) => o.id === 'W2.6' || o.id === 'W2.7').map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const kinds = (ids: readonly string[]) => ids.map((id) => SCENARIO_KINDS.find((k) => k.id === id)!.label.toLowerCase()).join(', ')
const types = REQ_TYPES.map((t) => t.label.toLowerCase()).join(', ')
const methods = VER_METHODS.map((m) => m.label.toLowerCase()).join(', ')
const gates = REQ_HARD_GATES.map((g) => g.short).join('; ')
const advisories = REQ_ADVISORIES.map((g) => g.short).join('; ')

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'ConOps narrative', text: n('Describe the existing situation the users want to change, the justification for the change and its restrictions, and the proposed system in the users’ language; record the operational environment (label and value), the user interactions and the operational constraints. State the scenario system of interest in one sentence: what is inside it decides who is an actor outside it.'), taught: [t1('w2s1-conops-what', 5, 'What a ConOps is, and why it comes before requirements'), t1('w2s1-conops-contents', 7, 'What every ConOps must contain'), t1('w2s1-writing-well', 8, 'Writing it well: the user’s language, environment, constraints'), t1('w2s1-aerolink-conops', 9, 'The AeroLink ConOps at a glance')].join('; ') },
  { title: 'Scenarios on the course template', text: n(`Write each scenario on the course template (${SCENARIO_FIELDS.map((f) => f.label.toLowerCase()).join(', ')}) against the stated scenario system of interest: exactly one primary actor, outside it; a trigger that is an event; at least ${MIN.mainSteps} numbered steps, each with its actor; at least ${MIN.alternatesPerScenario} alternate flow that branches from a step and rejoins a later step or ends; and both a success and an observable failure end state. Review each scenario with MITRE’s questions before it is final.`), taught: [t1('w2s1-use-cases', 10, 'Use cases, actors and threads'), t1('w2s1-scenario-anatomy', 11, 'Anatomy of a scenario: the course template'), t1('w2s1-scenario-coverage', 12, 'Which scenarios? Coverage and the off-nominal case'), t1('w2s1-scenario-review', 13, 'Reviewing a scenario'), t1('w2s1-worked-scn005', 14, 'Worked example I')].join('; ') },
  { title: 'Discovery log', text: n('For every need, assumption or unknown a scenario exposes, log where it appeared (trigger, step or alternate) and send it on: a new need into the needs set (Part 5 revised), an assumption or an unknown into the uncertainty register, each with an owner. An unknown carries a numbered TBD or TBR token that requirements can cite.'), taught: t1('w2s1-worked-discoveries', 15, 'Worked example II') },
  { title: 'Coverage check', text: n('Build the needs × scenarios matrix: mark the scenarios (and steps) that exercise each need, and record a reason for every need no scenario exercises.'), taught: t1('w2s1-worked-coverage', 16, 'Worked example III') },
  { title: 'Capabilities', text: n('Derive capabilities from the needs: each says what the enterprise must be able to do, traces to at least one need, may refine a broader capability, and is linked to the scenarios that exercise it. Note the needs no capability covers yet.'), taught: [t1('w2s1-capability-def', 17, 'What a capability is'), t1('w2s1-capability-tree', 18, 'The AeroLink capability tree'), t1('w2s1-capability-gaps', 19, 'What the tree does not yet cover')].join('; ') },
  { title: 'Requirements on the course record', text: n(`Write stakeholder requirements from needs and capabilities, and system requirements from stakeholder requirements and capabilities, each with the course record (${REQ_RECORD_TEXT}). Every requirement must pass the hard gates: ${gates}. The advisories (${advisories}) are signs of a likely defect that a good requirement can also show: rewrite or keep each one knowingly. Cover at least ${MIN.types} of the four types (${types}); every requirement names a method (${methods}).`), taught: [t1('w2s1-two-levels', 20, 'Two levels: stakeholder and system requirements'), t1('w2s1-one-chain', 21, 'One chain, end to end: NEED-004 to REQ-SYS-001'), t2('w2s2-anatomy', 3, 'Anatomy of a requirement and its attributes'), t2('w2s2-characteristics', 4, 'Characteristics of good requirements'), t2('w2s2-categories', 5, 'Types and categories: organizing a set so gaps show'), t2('w2s2-level', 6, 'Level, white space and derived requirements'), t2('w2s2-negatives-tbd', 7, 'Negatives, ranges, thresholds and TBDs'), t2('w2s2-verification-method', 8, 'A verification method for every requirement'), t2('w2s2-worked-chains', 9, 'Worked example IV'), t2('w2s2-worked-noise', 10, 'Worked example V'), t2('w2s2-worked-critique', 11, 'Worked example VI')].join('; ') },
  { title: 'Trace audit, forward and backward', text: n(`Trace forward from every need to a stakeholder requirement and from every stakeholder requirement to a system requirement, and backward from every requirement to a parent that exists. A need counts as covered only when a stakeholder requirement names it as a parent; a trace through a shared capability does not cover it. List the orphans and fix them; give every childless need and childless stakeholder requirement, and every need a requirement covers only in part, one disposition: ${AUDIT_DISPOSITION_TEXT}. Never link a requirement that does not carry the need only to make the matrix look complete.`), taught: [t2('w2s2-traceability', 12, 'Bidirectional traceability: orphans and childless parents'), t2('w2s2-worked-audit', 13, 'Worked example VII')].join('; ') },
  { title: 'Measures', text: n('Define measures of effectiveness (each measures a need, a capability or the mission or a goal) and measures of performance (each supports a measure of effectiveness and measures a requirement), each with a definition, a unit, a threshold and its data source.'), taught: [t2('w2s2-moe-mop', 15, 'Measures of effectiveness and measures of performance'), t2('w2s2-worked-measures', 16, 'Worked example VIII')].join('; ') },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Scenario selection, owners, off-nominal skeleton', when: `In class, Session 2 (${S2_LAB.plan} min)`, who: 'Whole team', output: 'Scenario list', detail: n(`Compare the candidate scenarios the members brought; choose at least ${MIN.scenarios} (a three-person team: at least ${MIN3.scenarios}) covering the ${kinds(REQUIRED_KINDS)} kinds (a three-person team: ${kinds(REQUIRED_KINDS_THREE)}; support recommended); give each scenario one owner; sketch the off-nominal scenario’s trigger, primary actor and failure end state.`) },
  { step: 'Scenario clinic decision', when: `In class, Session 2 (${S2_LAB.clinic} min, up to ${S2_LAB.clinicTeams} teams)`, who: 'Requirements & Compliance lead presents', output: 'Proceed or revise', detail: n('Present the scenario list and the off-nominal skeleton. The instructor checks that the named actor is outside the scenario system of interest, that the trigger is an event and that the failure end state is observable, and decides proceed or revise; record the decision in the lab tool. Teams not seen in class post the list on the LMS and are answered within 48 hours.') },
  { step: 'ConOps narrative and environment', when: 'Days 1–2', who: 'Architecture', output: 'Part 7', detail: n('The existing situation, justification and restrictions, the proposed system, the operational environment, the user interactions and constraints, and the scenario system of interest stated in one sentence.') },
  { step: 'Scenarios and review', when: 'Days 1–3', who: 'Each scenario has one owner; Verification & Validation reviews', output: 'Part 8', detail: n(`At least ${MIN.scenarios} scenarios (a three-person team: ${MIN3.scenarios}), each on the course template and reviewed against MITRE’s questions; the lab tool checks each one as you type.`) },
  { step: 'Discovery log and needs update', when: 'Day 3', who: 'Requirements & Compliance', output: 'Part 5 revised, uncertainty entries', detail: n('Log what each scenario exposed; add new needs to the needs set with their goal, and the assumptions and unknowns to the uncertainty register, each with an owner (an unknown with its TBD or TBR token).') },
  { step: 'Capabilities and coverage matrix', when: 'Days 3–4', who: 'Architecture', output: 'Part 9', detail: n(`At least ${MIN.capabilities} capabilities (a three-person team: ${MIN3.capabilities}), each derived from needs and linked to scenarios; the needs × scenarios matrix with a reason for every need no scenario exercises.`) },
  { step: 'Requirements', when: 'Days 4–5', who: `Each member writes at least ${Math.ceil(MIN.requirements / 4)} (a three-person team: ${Math.ceil(MIN3.requirements / 3)} each); Requirements & Compliance merges`, output: 'Part 10', detail: n(`At least ${MIN.requirements} requirements that pass every hard gate, at least ${MIN.stakeholderRequirements} stakeholder and ${MIN.systemRequirements} system requirements, covering at least ${MIN.types} types (a three-person team: ${MIN3.requirements}, with ${MIN3.stakeholderRequirements} stakeholder and ${MIN3.systemRequirements} system requirements).`) },
  { step: 'Trace audit and measures', when: 'Day 6', who: 'Verification & Validation (audit); AI & Data Management (measures)', output: 'Part 11', detail: n(`The audit in both directions with a disposition for every childless item; at least ${MIN.moes} MOEs and ${MIN.mops} MOPs (a three-person team: ${MIN3.moes} and ${MIN3.mops}).`) },
  { step: 'AI usage statement', when: 'Day 6', who: 'AI & Data Management', output: 'Part 6 updated', detail: n('Tool, purpose, prompts, what you accepted or rejected and why; tag every AI-suggested scenario, requirement or measure AI-suggested-reviewed. The statement is required even if no AI tool was used.') },
  { step: 'Integration review, export and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Review the whole record for consistency, export the Markdown record and the JSON model inputs from the lab tool after the last change, and upload both files.') },
]

export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week2-record.md', what: 'Parts 7–11 and the updated Parts 5–6 as headed Markdown, ready to read' },
  { name: 'team-NN-week2-model-inputs.json', what: 'The same data with IDs, links, the check results and the SysML v2 element each item will seed (Phase II)' },
]

const both = (four: string, three: string) => `team of 4: ${four}; team of 3: ${three}`
/** The parts the Week 2 work adds to the Team Record, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: '5. Stakeholder needs (revised)', evidence: n('The needs the scenarios exposed, each numbered after the Week 1 needs, with its statement, the goal it serves and the discovery-log entry that exposed it.'), minimum: 'Every added need complete and logged (no minimum number)', judged: 'RB-2.4 (what the scenarios exposed); RB-2.5' },
  { heading: '6. AI usage statement (updated)', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested items tagged.'), minimum: 'At least 12 words; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  { heading: `${WEEK2_PARTS[0].n}. ${WEEK2_PARTS[0].title}`, evidence: n('Existing situation, justification and restrictions, the proposed system, the operational environment, user interactions, operational constraints and the scenario system of interest.'), minimum: 'Every component written; at least 3 environment entries; the scenario system of interest stated', judged: 'RB-2.4' },
  { heading: `${WEEK2_PARTS[1].n}. ${WEEK2_PARTS[1].title}`, evidence: n('Scenarios on the course template with one owner each, the clinic decision, the discovery log and the uncertainty register.'), minimum: both(`${MIN.scenarios} scenarios (${kinds(REQUIRED_KINDS)})`, `${MIN3.scenarios} scenarios (${kinds(REQUIRED_KINDS_THREE)})`) + `; each with at least ${MIN.mainSteps} steps, ${MIN.alternatesPerScenario} alternate flow, success and failure end states`, judged: 'RB-2.4; RB-2.5 (uncertainty register)' },
  { heading: `${WEEK2_PARTS[2].n}. ${WEEK2_PARTS[2].title}`, evidence: n('Capabilities derived from needs and linked to scenarios; the needs × scenarios matrix with a reason for every need not exercised.'), minimum: both(`${MIN.capabilities} capabilities`, `${MIN3.capabilities} capabilities`) + '; every need exercised or given a reason', judged: 'RB-2.3 (at most 3 this week); RB-2.5' },
  { heading: `${WEEK2_PARTS[3].n}. ${WEEK2_PARTS[3].title}`, evidence: n('Stakeholder and system requirements on the course record, each passing every hard gate, with the advisories rewritten or kept knowingly.'), minimum: both(`${MIN.requirements} requirements (${MIN.stakeholderRequirements} stakeholder, ${MIN.systemRequirements} system)`, `${MIN3.requirements} requirements (${MIN3.stakeholderRequirements} stakeholder, ${MIN3.systemRequirements} system)`) + `; at least ${MIN.types} types; only requirements that pass every hard gate count`, judged: 'RB-3.1–3.5 (sample of 10)' },
  { heading: `${WEEK2_PARTS[4].n}. ${WEEK2_PARTS[4].title}`, evidence: n('Orphans listed and fixed; every childless need and stakeholder requirement with a disposition; MOEs and MOPs with definition, unit, threshold, data source and links.'), minimum: 'No orphans; every childless item dispositioned; ' + both(`${MIN.moes} MOEs and ${MIN.mops} MOPs`, `${MIN3.moes} MOEs and ${MIN3.mops} MOPs`), judged: 'RB-3.4, RB-3.6 (the team’s own audit); RB-4.1–4.3 (MOE and MOP only)' },
]

/** Rubric rows applied this week, read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-2', '2.3'], ['RB-2', '2.4'], ['RB-2', '2.5'],
  ['RB-3', '3.1'], ['RB-3', '3.2'], ['RB-3', '3.3'], ['RB-3', '3.4'], ['RB-3', '3.5'], ['RB-3', '3.6'],
  ['RB-4', '4.1'], ['RB-4', '4.2'], ['RB-4', '4.3'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this record is judged against. RB-2.3 (capability analysis) is scored at most 3 this week: the horizon gap analysis it asks for at level 4 is deferred to Week 6. RB-3 is sample-based: the grader draws 10 requirements and scores 3.1–3.4 on the share that meets each condition; a set of fewer than 10 is scored in full. No peer audit runs this week, so RB-3.6 applies to the team’s own trace audit and its dispositions. RB-4.1–4.3 apply to the MOEs and MOPs only; the criteria for technical performance measures apply from Week 3. RB-12.1–12.3 apply to the AI usage statement.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const r = part && part.type === 'table' ? part.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}
/** Leveled rows (4 to 1) and the per-requirement condition rows of the sample-based audit (RB-3). */
export const isLeveled = (id: string) => id !== 'RB-3'

export const LAB_SUBMISSION = {
  format: n('Export two files from the lab tool after the last change: team-NN-week2-record.md (Parts 7–11 and the updated Parts 5–6 as headed Markdown) and team-NN-week2-model-inputs.json (the same data with IDs, links, check results and the SysML v2 element each item will seed). Both state the record’s status.'),
  where: n(`One member uploads both files to the ${recordDue.where} before Week 3, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 3, Session 2. The requirements are audited on a sample of 10.'),
  aiUse: 'AI tools may help draft scenarios, requirements and measures; tag each AI-suggested item AI-suggested-reviewed and say in the AI usage statement what the tool suggested and what you changed or rejected.',
}

export const LAB_TOOL = n(
  `The lab tool imports your team’s Week 1 model-inputs file (or the Week 1 record saved in the same browser) and adds Parts 7–11. Each part shows its checks as you type, the same checks the instructor applies first. For every requirement it lists the hard gates (${gates}), each marked pass or fails, and the advisories, labeled advisory, which never stop a requirement counting. Only requirements that pass every hard gate count toward the minimums. One member can enter the record and export the JSON file; teammates import it to continue the same record. Everything is saved in your browser only, so export after every working session.`,
)

/** Workload: the lab's share of the week (rows of the week's workload table). */
const row = (id: string) => WORKLOAD_ROWS.find((r) => r.id === id)!
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: row('candidate').activity, hours: row('candidate').hours },
  { activity: row('lab').activity, hours: row('lab').hours },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${row('lab').hours.toFixed(1)} h each. A team of three works to the reduced minimums (${MIN3.scenarios} scenarios, ${MIN3.capabilities} capabilities, ${MIN3.requirements} requirements, ${MIN3.moes} MOEs and ${MIN3.mops} MOPs): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week02/WEEK2_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 2 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week02Lab.ts` by `npm run lab:md`; the Laboratory page (`#/week/2/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 2 — ${W2.title}. AeroLink is the instructor’s FICTIONAL worked example; this record is about your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Two files, exported from the lab tool after the last change:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The Week 2 work adds five parts to the Team Record and updates two. The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  const label = (rb: string, r: string[]) => `${rb}.${r[0].split('.')[1]} ${r[1]}`
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.filter(([rb]) => isLeveled(rb)).map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [label(rb, r), ...r.slice(2, 6)]
  }))
  table(['Criterion (sample-based audit)', 'Condition checked'], LAB_RUBRIC_ROWS.filter(([rb]) => !isLeveled(rb)).map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [label(rb, r), r[2]]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
