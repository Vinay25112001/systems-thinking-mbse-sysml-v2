// Lab L10, model v0.3: the full laboratory instructions, single source for the Week 10 Laboratory page and
// docs/lectures/week10/WEEK10_LAB_INSTRUCTIONS.md (labMarkdown(), written by `node scripts/build-lab-md.mjs 10`;
// week10Lab.test.ts fails when the file and this module differ). Mirrors src/content/lab/week09Lab.ts.
//
// Single sources: the mapping, the finding classes, the review checklist, outputs, minimums and person-hours come from
// src/content/lectures/week10/labBrief.ts (the module the lab tool, src/workbench/week10/*, checks against); the in-class
// minutes, readings, workload and deliverables from src/content/week10Path.ts; the rubric rows from the rubric register
// (getRubric); the checker installation from the Week 8 guide (reused, not copied: src/content/lab/week08Checker.ts).
// "Taught in" references are computed from the registered lectures by slide id.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the model is always
// of the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import { DELIVERABLES, EXTENSION_READINGS, LAB_PERSON_HOURS, LAB_TEAM_HOURS, PROPOSED_OBJECTIVES, REQUIRED_READINGS_CITES, S2_LAB, THREE_PERSON, WORKLOAD_ROWS } from '../week10Path'
import { LAB10_MINIMUMS as MIN, LAB10_OUTPUTS, REVIEW_CHECKS, W10_FINDING_CLASSES, W10_MAPPING } from '../lectures/week10/labBrief'
import { CHECKER_TITLE, OS_LABEL, STEPS, type OsKey } from './week08Checker'

const n = (text: string): NewText => ({ text, review: PENDING })
const W10 = WEEKS[9]

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L10: Model v0.3 of your enterprise: logical architecture and behavior in the model'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(10, session)
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
const modelDue = DELIVERABLES.find((d) => d.id === 'model')!
export const LAB_PURPOSE = n(
  'Model your team’s own logical architecture and behavior, never AeroLink, in the SysML v2 model your team extended in Week 9. Every Week 4 function becomes an action with the items it consumes and produces, performed by a logical element; every system requirement is allocated to the function that realizes it; one Week 2 scenario becomes an action flow with its decisions, its alternates and its item flows; every scenario becomes a use case; and the operating states of your principal element become a state definition that a part exhibits. Then review the behavior against your ConOps with the course checklist, give every finding a disposition, and run the model through the course-designated checker until it reports no errors. Model v0.3 is what Week 11 gives physical homes, ports and interfaces.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the chosen scenario mapped step by step in the lab tool (${S2_LAB.map} min, the instructor circulating), the instructor checkpoint (${S2_LAB.checkpoint} min) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${modelDue.due}; one team member uploads the three files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 11, Session 2' },
]

/** Inputs: the team's Week 9 model and Phase I exports, the teaching material, the readings and the tools. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your team’s Week 9 model v0.2 (.sysml), exported from the Week 9 lab tool, with its Logical and Behavior packages still present.') },
  { text: n('Your Week 4 model-inputs file (.json): the functions with their inputs, outputs, capabilities, scenarios and allocated requirements, the logical elements and the information items.') },
  { text: n('Your Week 2 model-inputs file (.json): the ConOps scenarios with their steps, actors and alternates, the capabilities, and the requirement parents.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink logical architecture, a scenario as an action flow, the aircraft’s operating states and the scenarios as use cases.'), to: '/week/10/examples' },
  { text: n('The required readings for the week.'), cites: REQUIRED_READINGS_CITES },
  { text: n('Further reading: the specification clauses behind the constructs.'), cites: EXTENSION_READINGS },
  { text: n('The lab tool, which reads your three files, lets you decide each function’s items and performer, map one scenario and define one set of operating states, writes model v0.3, computes the behavior audit and keeps the review checklist.'), to: '/week/10/lab/tool' },
  { text: n('The course checker your team installed in Week 8, from the Week 8 install guide.'), to: '/week/8/lab/checker' },
]

/** Objectives this lab practices (course.ts IDs; the proposed ones are pending faculty approval). */
export const LAB_OBJECTIVES = [...W10.objectives.map((o) => ({ id: o.id, text: o.text, proposed: false })), ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true }))]

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'Functions with their items', text: n('Each Week 4 function becomes an action usage with its ID as short name. Give it an in parameter for every item it consumes and an out parameter for every item it produces, using your information items; add an item where a flow has none (an information item takes the next ID; an energy or material item is named). A function with no input, or no output, or neither, needs a disposition saying why. A team of three gives items to the functions its chosen scenario uses; the others may wait for the final model.'), taught: [t1('w10s1-functions-io', 6, 'Functions and input–output flows'), t1('w10s1-action-def', 11, 'Action definitions, usages and parameters')].join('; ') },
  { title: 'Capabilities', text: n('Each capability becomes an action definition; each function, and each requirement Week 9 left tracing to a capability, gets a dependency to it, from the dependent element to the capability. A function that realizes no capability, or a capability no function realizes, needs a disposition.'), taught: t1('w10s1-capabilities', 9, 'Capabilities and functions in the model') },
  { title: 'Logical architecture and allocation', text: n('Each logical element becomes a part usage inside the logical architecture, performing the functions allocated to it; a Week 9 placeholder subject of the same name is reused, and any other placeholder is linked to the element it stands for. Each requirement allocated to a function in Week 4 is written as an allocation from the requirement to the function; an unallocated system requirement needs a disposition.'), taught: [t1('w10s1-parts-logical', 8, 'Logical decomposition with parts'), t1('w10s1-perform-allocate', 12, 'Perform and allocate')].join('; ') },
  { title: 'One scenario as an action flow', text: n(`Choose the scenario with the most alternates (a team of three: any scenario with at least one alternate) and fill the mapping table: for each step, the action’s name and the function it is an occurrence of (none for a step another party performs); for each alternate, its action, a guard naming its condition, and where the decision sits: where the condition becomes known, before the step it branches from (the alternate then replaces the step) or after it. The tool writes the successions, each decision with an else, a merge where an alternate rejoins and done where it ends, and an item flow wherever an earlier step’s function produces what a later step’s function consumes: at least ${MIN.decisions} decision and ${MIN.itemFlows} item flow. A decision can sit only before or after a whole step: if a condition becomes known in the middle of a step, split the step in your Week 2 record and import again.`), taught: [t1('w10s1-decide-merge', 16, 'Choices: decisions and merges'), t1('w10s1-worked-scn002', 20, 'Worked example II: a scenario as an action flow')].join('; ') },
  { title: 'Use cases', text: n('Every scenario becomes a use case with the enterprise as subject, an actor for each external party typed by your stakeholder or external-system definitions, and the success end state as objective. Type the actor IDs where the name match is wrong, or record why an actor is not modeled.'), taught: [t2('w10s2-use-cases', 12, 'Use cases: subject, actors, objective'), t2('w10s2-worked-usecases', 14, 'Worked example IV: five scenarios as use cases')].join('; ') },
  { title: 'Operating states', text: n(`Define the operating states of your principal element: at least ${MIN.states} states, ${MIN.transitions} transitions with a trigger each and ${MIN.guards} guard (a team of three: ${MIN.statesThree} states and ${MIN.transitionsThree} transitions), an initial state, entry or do functions where a state performs one, and the part that exhibits the states. Every state must be reachable from the initial state.`), taught: [t2('w10s2-state-def', 4, 'State definitions and the initial state'), t2('w10s2-worked-states', 9, 'Worked example III: the aircraft’s operating states')].join('; ') },
  { title: 'Behavior review', text: n(`Read the model against the ${REVIEW_CHECKS.length} checks of the course checklist and the cross-check of flow and states; record for each check whether the model meets it, with how you checked, or the finding and what you will do. Give every behavior finding a disposition: an open item with an owner and a week, or why no change is needed. A disposition cannot claim a fix: change the choice or the record and import again.`), taught: [t2('w10s2-cross-check', 15, 'Cross-checking the flow and the states'), t2('w10s2-checklist', 17, 'The behavior review checklist')].join('; ') },
  { title: 'Checker to zero errors', text: n('Run model v0.3 through the course-designated checker and correct it until the checker reports no errors; explain every warning in the log. A PASS shows the file parsed, every name resolved and no rule fired; it does not show that a flow follows the ConOps, that a guard means its condition, or that the states are complete.'), taught: [t1('w10s1-checker', 22, 'What the checker confirms, and what a reviewer must confirm'), t2('w10s2-common-errors', 16, 'Common errors in behavior models')].join('; ') },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Map the chosen scenario', when: `In class, Session 2 (${S2_LAB.map} min)`, who: 'Whole team', output: 'A started model', detail: n('Import the three files; choose the scenario with the most alternates (a team of three: any scenario with at least one); name each step, choose its function, write each alternate’s guard and place its decision before or after its step; read the mapping table.') },
  { step: 'Checkpoint fix', when: 'Day 1', who: 'Architecture', output: 'The mapping corrected', detail: n('Apply the instructor’s checkpoint note to the mapping before modeling the rest.') },
  { step: 'Functions and items', when: 'Days 1–2', who: 'Architecture', output: 'Logical package, part 1', detail: n('Inputs and outputs for every function, new items where needed, capabilities checked.') },
  { step: 'Performers and allocations', when: 'Day 2', who: 'Architecture', output: 'Logical package, part 2', detail: n('A performer for every function, the Week 9 placeholders linked, the requirement allocations read in the preview.') },
  { step: 'Scenario flow', when: 'Days 2–3', who: 'Requirements & Compliance drafts; Architecture reviews', output: 'Behavior package: flow', detail: n('Decisions, merges, ending alternates and item flows checked against the ConOps, node by node.') },
  { step: 'Operating states', when: 'Days 3–4', who: 'Verification & Validation', output: 'Behavior package: states', detail: n('States, transitions, guards, entry and do functions, the initial state and the exhibitor.') },
  { step: 'Use cases', when: 'Day 4', who: 'Requirements & Compliance', output: 'Behavior package: use cases', detail: n('Actors typed for every scenario; unmodeled actors dispositioned.') },
  { step: 'Checker runs', when: 'Day 5', who: 'AI & Data Management runs; owners fix', output: 'Checker log', detail: n('Iterate to zero errors; explain every warning.') },
  { step: 'Behavior review and audit', when: 'Day 6', who: 'Verification & Validation', output: 'Review checklist; dispositions', detail: n('Every check recorded with a note; the cross-check read; every finding dispositioned.') },
  { step: 'AI usage statement and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Integration review; export the model and the behavior review after the last change; upload the three files.') },
]

export const LAB_OUTPUT_FILES = LAB10_OUTPUTS.map((o) => ({ name: o.file, what: o.what }))

/** What model v0.3 and its behavior review must contain, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: 'Functions and items', evidence: n('Every function as an action usage with its in and out items; information items as item definitions; capabilities as action definitions with the dependencies to them.'), minimum: 'Every Week 4 function present once, with at least one item or a disposition', judged: 'RB-7.2; RB-8.3' },
  { heading: 'Logical architecture', evidence: n('One part usage per logical element, typed by its definition (a Week 9 placeholder reused or specialized), performing its functions; requirement allocations to functions.'), minimum: 'Every function performed by at least one logical element; every system requirement allocated or dispositioned', judged: 'RB-7.2; RB-8.3; RB-8.5' },
  { heading: 'Scenario flow', evidence: n('The chosen scenario inside its use case: steps subsetting their functions, decisions with guards and else, merges, ending alternates, item flows; the mapping table.'), minimum: `At least ${MIN.decisions} decision and ${MIN.itemFlows} item flow; every step and alternate of the scenario present`, judged: 'RB-8.5; RB-8.6' },
  { heading: 'Use cases', evidence: n('Every scenario as a use case with subject, actors and objective.'), minimum: 'Every Week 2 scenario present once', judged: 'RB-8.5; RB-8.6' },
  { heading: 'Operating states', evidence: n('One state definition with an initial state, transitions with triggers, at least one guard, entry or do functions, and a part that exhibits it; the transition table and the cross-check.'), minimum: `At least ${MIN.states} states, ${MIN.transitions} transitions and ${MIN.guards} guard (team of three: ${MIN.statesThree} and ${MIN.transitionsThree}); every state reachable`, judged: 'RB-8.5; RB-8.6' },
  { heading: 'Behavior review and audit', evidence: n('The review checklist with a result and a note for every check; a disposition for every finding that needs one.'), minimum: `All ${REVIEW_CHECKS.length} checks recorded; every finding dispositioned`, judged: 'RB-8.5' },
  { heading: 'Checker log', evidence: n('The final run of model v0.3, with every warning explained.'), minimum: 'Zero errors in the final run', judged: 'RB-8.1; RB-12.3' },
  { heading: 'AI usage statement', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested elements tagged.'), minimum: 'Present even if no AI tool was used', judged: 'RB-12.1–12.3' },
]

/** Rubric rows applied this week, read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-7', '7.2'],
  ['RB-8', '8.1'], ['RB-8', '8.2'], ['RB-8', '8.3'], ['RB-8', '8.5'], ['RB-8', '8.6'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this model is judged against. Grading is formative this week: written feedback on each row, returned before Week 11, Session 2; behavior is graded summatively in the Week 14 model unless the faculty decides otherwise. RB-8.5 is the core row this week: the flow and the states consistent with the ConOps, and the perform and exhibit links. RB-7.2 applies to the functions: derived from capabilities and scenarios, with no physical names in the logical view. RB-8.3 applies to definitions and usages of functions, items and logical parts. RB-8.6 applies to the minimums above. RB-12.1–12.3 apply to the AI usage statement. The parse-error gate of RB-8 applies: more than two errors cap 8.2–8.6 at level 2, with a 24-hour repair window.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const r = part && part.type === 'table' ? part.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = {
  format: n('Three files: team-NN-model-v03.sysml (model v0.3), team-NN-behavior-review.md (the scenario mapping table, the function table, the allocation matrix, the state transition table, the cross-check, the behavior audit with dispositions, the review checklist and the AI usage statement, exported from the lab tool after the last change), and team-NN-checker-log.txt (the final checker run).'),
  where: n(`One member uploads the three files to the ${modelDue.where} before Week 11, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 11, Session 2.'),
  aiUse: 'AI tools may help draft documentation, review the behavior or suggest SysML text; every AI-suggested element must pass the checker, be tagged AI-suggested-reviewed and be explained by its owner, and the AI usage statement says what the tool suggested and what you changed or rejected.',
}

export const LAB_TOOL = n(
  'The lab tool reads three files: your Week 9 model v0.2 (.sysml), your Week 4 model inputs and your Week 2 model inputs (.json). It refuses AeroLink files, files of another team, a Week 8 model and files whose packages are missing, each with the reason. For every function you enter the items it consumes and produces and choose its performer; you add functions and items where a scenario needs them, with IDs that continue after the highest your files have used and are never reused. You link the Week 9 placeholder subjects, map one scenario step by step, type the use-case actors and define one set of operating states. The tool writes model v0.3: it fills the Logical package (capabilities, items, functions, the logical architecture, requirement allocations) and the Behavior package (a use case for every scenario, the chosen scenario as an action flow, the state definition) and adds the exhibit to the part you choose. It computes the behavior audit and the cross-check, keeps the review checklist and shows a readiness list with the reason for every item still open. Only a real defect keeps an item out of the model (a reference to something that is not in your files would not resolve). Its checks are course acceptance checks: whether the model is valid is decided by the course-designated checker, and a checker PASS does not show that a flow follows the ConOps. A model v0.3 exported from the tool can be imported again; the tool replaces what it generated, so keep hand edits in a separate file until the last export. Everything is saved in your browser only: export after every working session, and share the workspace file with teammates.',
)

/** Running the checker on model v0.3: the Week 8 guide's own commands for your model, with the file name changed. */
export const CHECKER_RUN_INTRO = n(`Your team installed the course checker in Week 8 (${CHECKER_TITLE.toLowerCase()}, on the Week 8 Laboratory page). Save the exported model in the checker’s models folder and run it the same way as before, naming your file team-NN-model-v03.sysml. Run it after every change until it reports zero errors, and paste the final output into team-NN-checker-log.txt with a line explaining each warning.`)
const modelStep = STEPS.find((s) => s.id === 'model')!
export const CHECKER_RUN: { os: OsKey; label: string; commands: string[] }[] = (Object.keys(OS_LABEL) as OsKey[]).map((os) => ({ os, label: OS_LABEL[os], commands: (modelStep.commands?.[os] ?? []).map((c) => c.replace(/team-07-model-v01/g, 'team-07-model-v03')) }))

/** Workload: the lab's share of the week (rows of the week's workload table). */
const row = (id: string) => WORKLOAD_ROWS.find((r) => r.id === id)!
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: row('lab').activity, hours: row('lab').hours },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${row('lab').hours.toFixed(1)} h each. A team of three works to a reduced scope (${THREE_PERSON.tasks.filter((t) => t.scope !== 'as for a team of four').map((t) => `${t.task}: ${t.scope}`).join('; ')}): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week10/WEEK10_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 10 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week10Lab.ts` by `node scripts/build-lab-md.mjs 10`; the Laboratory page (`#/week/10/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 10 — ${W10.title}. AeroLink is the instructor’s FICTIONAL worked example; this model is of your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## The Week 10 mapping (course convention)', '')
  table(['Artifact', 'From', 'Becomes', 'Where'], W10_MAPPING.map((m) => [m.artifact, m.from, m.becomes, m.where]))
  L.push('## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Three files:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## The behavior review checklist (course convention)', '')
  table(['Check', 'What the tool shows'], REVIEW_CHECKS.map((c) => [c.text, c.tool]))
  L.push('## Behavior-audit finding classes (course convention)', '')
  table(['Class', 'Meaning'], W10_FINDING_CLASSES.map((c) => [c.label, c.meaning]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, ...r.slice(2, 6)]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Running the checker on model v0.3', '', CHECKER_RUN_INTRO.text, '')
  for (const r of CHECKER_RUN) L.push(`${r.label}:`, '', '```', ...r.commands, '```', '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
