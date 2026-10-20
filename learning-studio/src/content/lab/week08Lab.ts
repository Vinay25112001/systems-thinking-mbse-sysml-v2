// Lab L8, model v0.1: the full laboratory instructions, single source for the Week 8 Laboratory page and
// docs/lectures/week08/WEEK8_LAB_INSTRUCTIONS.md (labMarkdown(), written by `npm run lab:md`; week08Lab.test.ts fails
// when the file and this module differ). Mirrors src/content/lab/week02Lab.ts.
//
// Single sources: the mapping kinds, finding classes, audit questions, outputs, minimums and person-hours come from
// src/content/lectures/week08/labBrief.ts (the same module the lab tool, src/workbench/week8/*, checks against); the
// in-class minutes, readings, workload and deliverables from src/content/week8Path.ts; the rubric rows from the rubric
// register (getRubric). "Taught in" references are computed from the registered lectures by slide id, with a fallback
// string while a lecture is being written.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the model is always
// of the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import { DELIVERABLES, EXTENSION_READINGS, LAB_PERSON_HOURS, LAB_TEAM_HOURS, PROPOSED_OBJECTIVES, REQUIRED_READINGS_CITES, S2_LAB, THREE_PERSON, WORKLOAD_ROWS } from '../week8Path'
import { AUDIT_QUESTIONS, FINDING_CLASSES, LAB8_MINIMUMS as MIN, LAB8_OUTPUTS, MAPPING_KINDS, MODEL_PACKAGES, REL_KEYWORDS } from '../lectures/week08/labBrief'
import { checkerMarkdown } from './week08Checker'

const n = (text: string): NewText => ({ text, review: PENDING })
const W8 = WEEKS[7]

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L8: Model v0.1 of your enterprise: import the package, model stakeholders and concerns'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id; the fallback is used only while the
 *  lecture is not registered or the slide id is missing. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(8, session)
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
  'Import your team’s own Systems Thinking package into its first SysML v2 model, never AeroLink: state who the model is for, map every artifact of the package to a place in the model, create the package skeleton that the next six weeks will fill, and model the context, the stakeholders, their concerns and the stakeholder relationships from your Week 1 register. Then audit what the import kept and lost, and run the model through the course-designated checker until it reports no errors. Model v0.1 is the base of every Phase II lab: the needs and requirements you model in Week 9 will frame the concerns you model now.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the mapping-matrix draft (${S2_LAB.matrix} min, the instructor circulating), the toolchain checkpoint (${S2_LAB.proof} min: every member shows the tool proof) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${modelDue.due}; one team member uploads the three files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 9, Session 2' },
]

/** Inputs: the Phase I exports, the Week 7 package, the teaching material, the readings and the tool. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your Week 1 Team Record model-inputs file (.json, version 1, 2 or 3), exported from the Week 1 lab tool after the instructor’s feedback was applied: the enterprise, the system of interest and what is inside it, the context, the stakeholder register with concerns and relationships, the mission, goals and needs.') },
  { text: n('Your Week 2 model-inputs file (.json), if your team has it: it adds the scenario, capability, requirement and measure IDs to the mapping.') },
  { text: n('Your Systems Thinking Engineering Package from Week 7, for the artifacts of Weeks 3 to 6 that no app export carries yet (technologies, risks, the trade study, functions, components, interfaces, the roadmap): count their IDs by kind.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink mapping matrix, model skeleton, context, stakeholders and concerns, and the import audit.'), to: '/week/8/examples' },
  { text: n('The required readings for the week.'), cites: REQUIRED_READINGS_CITES },
  { text: n('Further reading (not required this week; KerML 7.3 is the basis of the graduate memo).'), cites: EXTENSION_READINGS },
  { text: n('The lab tool, which imports your exports, builds the mapping matrix and the import findings, and generates your model skeleton for you to review, extend and check.'), to: '/week/8/lab/tool' },
  { text: n('The course checker, installed once per team from the install guide (a personal installation is optional), with the two tool-proof files.'), to: '/week/8/lab/checker' },
]

/** Objectives this lab practices (course.ts IDs; W8.5 and W8.6 are proposed, pending faculty approval). */
export const LAB_OBJECTIVES = [
  ...W8.objectives.map((o) => ({ id: o.id, text: o.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const pkgs = MODEL_PACKAGES.map((p) => p.name).join(', ')
const audit = AUDIT_QUESTIONS.map((q) => q.label.toLowerCase()).join(', ')

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'Purpose first', text: n(`Write one paragraph in the root package’s documentation: who uses the model, and for which decisions (at least ${MIN.purposeWords} words). The purpose is what the model will be judged against; a valid model with no purpose cannot be judged.`), taught: t1('w8s1-model-quality', 8, 'Model quality is not design quality') },
  { title: 'Mapping matrix', text: n(`For every ID kind in your package (${MAPPING_KINDS.length} kinds in the course mapping), record the model package, the SysML v2 construct and the week that models it; mark the kinds modeled now and the kinds mapped for later. Give a reason for every choice that is not obvious, and choose a home for any kind the mapping does not cover. The choice is yours; the reason is graded.`), taught: [t2('w8s2-import-mapping', 8, 'The import is a mapping, not a copy'), t2('w8s2-matrix', 9, 'The artifact-to-model mapping matrix')].join('; ') },
  { title: 'Package skeleton', text: n(`Create the packages of the course structure (${pkgs}), with private imports and a documentation line on every package that is still empty saying which week fills it. Every Phase I ID is a quoted short name, so the same ID names the item in the document and in the model.`), taught: [t2('w8s2-packages', 2, 'Packages, namespaces and qualified names'), t2('w8s2-imports', 3, 'Imports and visibility'), t2('w8s2-names', 4, 'Names and short names: carrying the Phase I IDs'), t2('w8s2-comments-doc', 5, 'Comments, documentation and notes'), t2('w8s2-skeleton', 10, 'The model’s package structure')].join('; ') },
  { title: 'Context', text: n('Model the enterprise as a part definition, and the context as a part that references the system of interest and holds every external system as a part usage with its ID. The elements inside the boundary of the system of interest become its part usages.'), taught: [t1('w8s1-def-usage', 14, 'The definition–usage pattern'), t2('w8s2-worked-context', 13, 'AeroLink worked example I: the context')].join('; ') },
  { title: 'Stakeholders and concerns', text: n('Model every stakeholder as a part definition and every concern as a concern whose subject is declared first, followed by its stakeholder parameters typed by those part definitions. Carry the register ratings and reasons as assessment metadata, or keep them in documentation and say why.'), taught: [t2('w8s2-stakeholder-concern', 11, 'Stakeholders and concerns in SysML v2'), t2('w8s2-worked-stakeholders', 14, 'AeroLink worked example II: stakeholders and concerns')].join('; ') },
  { title: 'Stakeholder relationships', text: n(`Model each relationship of the register as a dependency tagged with the keyword of its type, written from the dependent stakeholder (the client, after from) to the stakeholder it depends on (the supplier, after to): a change to the supplier may require a change to the client. So “A ${Object.values(REL_KEYWORDS).filter((k) => k.direction === 'reversed').map((k) => k.verb).join('/')} B” becomes ${Object.values(REL_KEYWORDS).filter((k) => k.direction === 'reversed').map((k) => `#${k.keyword}`).join('/')} (in that order) from B to A; “A is affected by B” stays from A to B; the symmetric types (${Object.values(REL_KEYWORDS).filter((k) => k.direction === 'symmetric').map((k) => `#${k.keyword}`).join(', ')}) keep the register’s order. At least ${MIN.relationships}, at least ${MIN.conflicts} of them a conflict (a team of three: the conflict relationships only).`), taught: t2('w8s2-worked-stakeholders', 14, 'AeroLink worked example II: stakeholders and concerns') },
  { title: 'Import audit', text: n(`Answer the four audit questions (${audit}) for your model, and give every gap, unmapped kind and defect a disposition: what you will do about it, and why. Differences between the register and the model are recorded, not fixed silently.`), taught: t2('w8s2-worked-audit', 15, 'Worked example III: auditing the import') },
  { title: 'Checker to zero errors', text: n('Install the course checker once per team from the install guide, run the tool proof first (the pass file and the fail file), then run model v0.1 through the course-designated checker and correct it until the checker reports no errors; explain every warning in the log. A PASS shows the file parsed, every name resolved and no rule fired; it does not show that the model says what your register says, which is why the audit comes before it.'), taught: [t1('w8s1-predict-checker', 24, 'Predict the checker'), t1('w8s1-checker-demo', 25, 'Live demonstration: running the course checker'), t2('w8s2-toolchain', 6, 'The course toolchain'), t2('w8s2-checker-decides', 7, 'What the checker decides, and what it cannot')].join('; ') },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Checker installation', when: 'Between Session 1 and Session 2', who: 'The checker owner (normally AI & Data Management); others optional', output: 'One working installation', detail: n('Follow the install guide on the Laboratory page: Java, the SysML v2 pilot implementation, the course script, then the tool proof. About an hour the first time. A team that cannot get it working tells the instructor before Session 2, and a lab machine is arranged.') },
  { step: 'Tool proof', when: 'Before Session 2; shown at the checkpoint', who: 'Every member', output: 'Two outputs for the checker log', detail: n('Run the checker on the pass file and on the fail file, on any working installation: the team’s, a lab machine, or your own. Keep both outputs: the first shows the toolchain runs, the second that it can fail.') },
  { step: 'Mapping matrix draft', when: `In class, Session 2 (${S2_LAB.matrix} min)`, who: 'Architecture leads; whole team', output: 'Matrix draft', detail: n('Import the Week 1 file (and the Week 2 file) into the lab tool; list every ID kind of the package; assign package, construct and week; count the Weeks 3–6 kinds from the Week 7 package; note the choices that need a reason.') },
  { step: 'Purpose and skeleton', when: 'Days 1–2', who: 'Each member writes at least one package’s documentation', output: 'Skeleton with purpose', detail: n('Write the purpose; review the generated skeleton package by package; correct anything the import got wrong in the record and import again.') },
  { step: 'Context package', when: 'Day 3', who: 'Architecture', output: 'Context modeled', detail: n('The enterprise, the system of interest and its inside elements, every external system with its ID and what crosses the boundary in documentation.') },
  { step: 'Stakeholders package', when: 'Days 3–4', who: 'Requirements & Compliance (stakeholders, concerns); Architecture (relationships)', output: 'Stakeholders modeled', detail: n('Every stakeholder, concern and relationship of the register, with the assessment, checked against the register line by line.') },
  { step: 'Import audit', when: 'Day 5', who: 'Verification & Validation', output: 'Audit with dispositions', detail: n('The four questions answered; a disposition for every gap, unmapped kind and defect.') },
  { step: 'Checker to zero errors', when: 'Day 6', who: 'AI & Data Management runs; the element owners fix', output: 'Final checker log', detail: n('Iterate until the checker reports no errors; explain every warning in the log.') },
  { step: 'AI usage statement', when: 'Day 6', who: 'AI & Data Management', output: 'Statement', detail: n('Tool, purpose, prompts, what you accepted or rejected and why. Any AI-suggested SysML must pass the checker and be explained by its owner. The statement is required even if no AI tool was used.') },
  { step: 'Integration review and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Review model, matrix and log for consistency; export the model and the matrix from the lab tool after the last change; upload the three files.') },
]

export const LAB_OUTPUT_FILES = LAB8_OUTPUTS.map((o) => ({ name: o.file, what: o.what }))

/** What model v0.1 must contain, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: 'Purpose and package skeleton', evidence: n('The root package’s purpose; every course package present; every empty package says which week fills it; private imports; quoted short-name IDs.'), minimum: `Purpose of at least ${MIN.purposeWords} words; all ${MODEL_PACKAGES.length} packages`, judged: 'RB-8.2' },
  { heading: 'Mapping matrix', evidence: n('Every ID kind of the package with package, construct, week and status; a reason for every non-obvious choice; a home for every unmapped kind.'), minimum: 'Every kind of the package mapped or counted (0 where the package has none)', judged: 'Completeness check (not scored)' },
  { heading: 'Context package', evidence: n('The enterprise as a part definition; the context part with the system of interest referenced and every external system as a part usage.'), minimum: 'Every external system of the register present once', judged: 'RB-8.3; RB-8.6' },
  { heading: 'Stakeholders package', evidence: n('Every stakeholder as a part definition; every concern with its subject and stakeholders; the relationships as tagged dependencies, each written from the dependent stakeholder; the register ratings as metadata or documentation.'), minimum: `Every stakeholder and concern of the register present once; at least ${MIN.relationships} relationships, ${MIN.conflicts} conflict (team of three: the conflicts only)`, judged: 'RB-8.3; RB-8.6; RB-1.3; RB-1.4' },
  { heading: 'Import audit', evidence: n(`The four questions answered, fidelity included (a team of three checks fidelity on a sample: every stakeholder and five concerns); findings by class (${FINDING_CLASSES.map((c) => c.label.toLowerCase()).join('; ')}) with a disposition each.`), minimum: 'Every gap, unmapped kind and defect dispositioned', judged: 'RB-9.4 (partial)' },
  { heading: 'Checker log', evidence: n('The tool proof (pass file, fail file) and the final run of model v0.1, with every warning explained.'), minimum: 'Zero errors in the final run', judged: 'RB-8.1; RB-12.3' },
  { heading: 'AI usage statement', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested elements tagged.'), minimum: 'Present even if no AI tool was used', judged: 'RB-12.1–12.3' },
]

/** Rubric rows applied this week, read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-8', '8.1'], ['RB-8', '8.2'], ['RB-8', '8.3'], ['RB-8', '8.6'],
  ['RB-1', '1.3'], ['RB-1', '1.4'],
  ['RB-9', '9.4'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this model is judged against. Grading is formative this week: written feedback on each row, returned before Week 9, Session 2; the model rows are scored summatively at a later model checkpoint. RB-8.1 asks for zero errors (level 3) and warnings explained (level 4). RB-8.3 applies to definition and usage for stakeholders, the enterprise, the external systems and the context part, and to referential versus composite parts; ports, interfaces and units follow in Week 11. RB-8.6 applies to the Context and Stakeholders packages only. RB-8.4 (requirements) and RB-8.5 (behavior) are not applied this week. RB-1.3 and RB-1.4 are carried from Week 1 as fidelity checks of the concerns and relationships; RB-9.4 applies to the import audit. RB-12.1–12.3 apply to the AI usage statement.',
)
/** Every row applied this week is a leveled row (no sample-based audit as in Week 2's RB-3). */
export const isLeveled = (id: string) => id.startsWith('RB-')
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const r = part && part.type === 'table' ? part.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = {
  format: n('Three files: team-NN-model-v01.sysml (model v0.1), team-NN-mapping-matrix.md (the mapping matrix and the import audit with dispositions, exported from the lab tool after the last change), and team-NN-checker-log.txt (the tool proof and the final checker run).'),
  where: n(`One member uploads the three files to the ${modelDue.where} before Week 9, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 9, Session 2.'),
  aiUse: 'AI tools may help draft documentation or SysML text; every AI-suggested element must pass the checker, be tagged AI-suggested-reviewed and be explained by its owner, and the AI usage statement says what the tool suggested and what you changed or rejected.',
}

export const LAB_TOOL = n(
  'The lab tool imports your Week 1 model-inputs file (versions 1, 2 and 3) and, optionally, your Week 2 model-inputs file. It builds the mapping matrix, where you enter the counts of the Weeks 3–6 kinds and your reasons; lists the import findings by class, each with a field for its disposition; answers the completeness and structure questions of the audit from the record; and generates the model skeleton: the purpose, the Context and Stakeholders packages modeled, every later package with the week that fills it. Only a real defect keeps an item out of the model (a relationship whose end is not a registered stakeholder would not resolve); everything else imports and is reported. The tool’s checks are course acceptance checks: whether the model is valid is decided by the course-designated checker, and a checker PASS does not show that the model says what your register says. One member can export the workspace for teammates to continue. Everything is saved in your browser only, so export after every working session.',
)

/** Workload: the lab's share of the week (rows of the week's workload table). */
const row = (id: string) => WORKLOAD_ROWS.find((r) => r.id === id)!
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: row('proof').activity, hours: row('proof').hours },
  { activity: row('lab').activity, hours: row('lab').hours },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${row('lab').hours.toFixed(1)} h each. A team of three works to a reduced scope (${THREE_PERSON.tasks.filter((t) => t.scope !== 'as for a team of four').map((t) => `${t.task}: ${t.scope}`).join('; ')}): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week08/WEEK8_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 8 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week08Lab.ts` by `npm run lab:md`; the Laboratory page (`#/week/8/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 8 — ${W8.title}. AeroLink is the instructor’s FICTIONAL worked example; this model is of your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## The course mapping (course convention)', '')
  table(['Prefix', 'Artifact (Phase I week)', 'Package', 'Construct', 'Modeled in'], MAPPING_KINDS.map((k) => [k.prefix, `${k.artifact} (${k.phaseWeek})`, k.pkg, k.construct, `Week ${k.modeledIn}`]))
  L.push('## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Three files:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, ...r.slice(2, 6)]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push(...checkerMarkdown())
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
