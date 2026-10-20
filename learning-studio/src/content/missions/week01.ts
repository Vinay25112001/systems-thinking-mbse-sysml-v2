// Week 1 missions, rebuilt 2026-10-18 for "Team Formation / Needs / Identifying Stakeholders" (COURSE_SCHEDULE.md;
// DECISION_LOG A16). Missions 1–4 rehearse each method on AeroLink, the instructor's worked example; mission 5 is the
// team's own enterprise (the Week 1 Team Record); mission 6 is the readiness quiz. Every step is checked by the computer
// (review F15: no step can be clicked done). Step briefs, goals and debriefs are new text ('new-pending-review'); the
// boundary steps reuse the reviewed boundary activity and key (weeks/week01.ts, week1.ts). Checks are pure functions in
// src/workbench/week1/stakeholders.ts and team.ts; src/workbench/missions.test.ts tests each in both directions.
// The causal-loop, dynamics-explorer and leverage missions are no longer part of Week 1 (their code is kept; see
// docs/redesign/WEEK1_LEARNING_DESIGN.md §10).
import type { Mission, MissionCtx, StepBrief, WorkbenchWeek } from './types'
import type { Rule } from '../../workbench/problems'
import { NEED_FORM } from '../lectures/week01/labBrief'
import week01 from '../weeks/week01'
import { BOUNDARY_ITEMS, BOUNDARY_QUESTION, WEEK1_INTRO } from '../week1'
import { WEEK1_QUIZ } from '../quizWeek1'
import { SIG_BOUNDARY, type BoundaryCheckSignal } from '../../workbench/week1/logic'
import { CANDIDATE_COUNT_WORD, CANDIDATES, CLASSIFY_ROWS, checkClassified, checkCritique, checkIdentified, checkRegisterRow, checkTwoNeeds, classifiedCount, needsArtefact, stakeholderArtefact } from '../../workbench/week1/stakeholders'
import { checkAiStatement, checkCharterPart, checkContextPart, checkExported, checkNeedsPart, checkProposal, checkRegister, concernIssue, proposalNamesAeroLink, sourcesOf, teamArtefact } from '../../workbench/week1/team'

const PENDING = 'new-pending-review' as const
const boundaryActivity = week01.activities.find((a) => a.id === 'w1-act-boundary')!
const boundaryWhy = (id: string) => BOUNDARY_ITEMS.find((b) => b.id === id)!.why
/** R11 p.552, as taught in L4 (w1-stakeholders ¶1): the debrief of the try-first mission. */
const WHY_ALL = week01.blocks.find((b) => b.id === 'w1-stakeholders')!.paragraphs[1]

/** Plain step statements (faculty feedback 2026-10-18): task, expected input, what "done" looks like. */
const b = (task: string, input: string, done: string): StepBrief => ({ task, input, done, review: PENDING })
const answered = (ctx: MissionCtx, key: string) => ctx.answers[key]

// ------------------------------------------------------------------------------------------- 1 try first
/** Review F06: neutral options of similar length, none using the lesson's vocabulary; the generative part (naming the
 *  parties you think are missing) is done in step 2, by sorting the candidates before any explanation is shown. */
export const PREDICTION_OPTIONS = [
  { id: 'enough', text: 'Yes, the three are enough' },
  { id: 'users', text: 'No: add more users or customers' },
  { id: 'missing', text: 'No: add other kinds of party' },
  { id: 'unsure', text: 'I cannot tell yet' },
]

const tryFirst: Mission = {
  id: 'w1-m1-who',
  week: 1,
  kind: 'try',
  title: 'Try first: who is missing?',
  short: 'Who is missing?',
  goal: `Predict whether three stakeholders are enough for AeroLink’s new vertiport, then find out by sorting ${CANDIDATE_COUNT_WORD} candidates.`,
  goalReview: PENDING,
  minutes: 11,
  objectives: ['B1.4'],
  workloadLine: 'Optional practice: AeroLink missions 1–4',
  steps: [
    {
      id: 'predict',
      brief: b('Predict, before any explanation, whether the three-stakeholder list is enough.', 'Choose one of the four answers and press Record. The answer then locks.', 'Your prediction is recorded. If you recorded it on the Overview, this step is already done.'),
      instruction: `Before any explanation, commit to a prediction. ${WEEK1_INTRO.question}`,
      hint: 'There is no penalty for a wrong prediction. It is locked once recorded and compared with what you find in step 2.',
      view: 'stakeholders',
      readMore: 'w1-stakeholders',
      input: { key: 'prediction', type: 'choice', label: 'Your prediction', lock: true, options: PREDICTION_OPTIONS },
      check: (ctx) => (answered(ctx, 'prediction') ? { ok: true, detail: 'Prediction recorded and locked.' } : { ok: false, detail: 'Choose and record a prediction.' }),
    },
    {
      id: 'identify',
      brief: b(`Sort the ${CANDIDATE_COUNT_WORD} candidates for the new vertiport’s register.`, 'In the Stakeholders view, part 1, mark each candidate “stakeholder” or “not a stakeholder”, then press Check. For any that differ from the key, read the explanation and tick “I have read why”, or change your answer.', `All ${CANDIDATES.length} are checked, and every difference from the key has been read.`),
      instruction: `In the Stakeholders view, part 1, decide for each of the ${CANDIDATE_COUNT_WORD} candidates whether it is a stakeholder of AeroLink’s new vertiport. A stakeholder is an individual, group or organization, or a class of them, with an interest in the system or affected by it (Session 1).`,
      hint: 'Ask of each candidate: is it a person, group or organization, and does it have an interest in the vertiport or is it affected by it?',
      view: 'stakeholders',
      focus: 'stk:identify',
      readMore: 'w1-stakeholders',
      check: (ctx) => {
        if (!answered(ctx, 'prediction')) return { ok: false, detail: 'Record your prediction first (step 1).' }
        return checkIdentified(stakeholderArtefact(ctx.artefacts))
      },
    },
    {
      id: 'compare',
      brief: b('Compare what you found with your prediction.', 'Choose matched, partly or contradicted and press Record.', 'Your comparison is recorded; the feedback that appears explains why the list matters.'),
      instruction: 'Compare your prediction with the stakeholders you identified. How many of them are not passengers, investors or the manufacturer, and which of them could approve or block the vertiport?',
      view: 'stakeholders',
      readMore: 'w1-worked-stakeholders',
      input: {
        key: 'match',
        type: 'choice',
        label: 'Did what you found match your prediction?',
        options: [
          { id: 'matched', text: 'It matched' },
          { id: 'partly', text: 'Partly' },
          { id: 'contradicted', text: 'It contradicted my prediction' },
        ],
        feedback: { '*': `${WHY_ALL} The candidates you marked include approving authorities (the FAA, the city planning authority) and affected people (residents near the vertiport) that the three-stakeholder list leaves out.` },
      },
      check: (ctx) => {
        const p = answered(ctx, 'prediction')
        const m = answered(ctx, 'match')
        if (!checkIdentified(stakeholderArtefact(ctx.artefacts)).ok) return { ok: false, detail: 'Finish step 2 first.' }
        if (!m) return { ok: false, detail: 'Record your comparison.' }
        return p && m.at >= p.at ? { ok: true, detail: 'Comparison recorded.' } : { ok: false, detail: 'Record the comparison after the prediction.' }
      },
    },
  ],
  debrief: 'A list built from the people who pay, use and build misses the approving authorities and the affected public. L4’s three sources find them; mission 3 classifies them.',
}

// ------------------------------------------------------------------------------------------- 2 guided: boundary
const boundary: Mission = {
  id: 'w1-m2-boundary',
  week: 1,
  kind: 'guided',
  title: 'Guided: an AeroLink boundary fit for its question',
  short: 'Boundary',
  goal: boundaryActivity.purpose,
  minutes: 15,
  objectives: ['B1.2', 'B1.3'],
  workloadLine: 'Optional practice: AeroLink missions 1–4',
  steps: [
    {
      id: 'classify',
      brief: b(`Sort each candidate element for the question “${BOUNDARY_QUESTION}”`, `In the Boundary & context view, mark each of the ${BOUNDARY_ITEMS.length} elements as inside, environment or irrelevant.`, `All ${BOUNDARY_ITEMS.length} elements are classified.`),
      instruction: `${boundaryActivity.instructions[0]} Question: “${BOUNDARY_QUESTION}” System of interest: the AeroLink air-taxi service.`,
      hint: 'Inside: what the question’s causes run through. Environment: what influences AeroLink but is not designed or controlled by it. Irrelevant: no plausible causal path to the question.',
      view: 'boundary',
      focus: 'boundary:b1',
      readMore: 'w1-soi',
      check: (ctx) => {
        const n = BOUNDARY_ITEMS.filter((i) => ctx.boundary[i.id]).length
        return n === BOUNDARY_ITEMS.length ? { ok: true, detail: `All ${n} classified.` } : { ok: false, detail: `${n} of ${BOUNDARY_ITEMS.length} classified.` }
      },
    },
    {
      id: 'check',
      brief: b('Check your classification against the instructor key.', 'Press “Check classification” in the Boundary & context view, then read the explanation for any element that differs.', 'The check has run with every element classified. A difference from the key is allowed when you can argue it.'),
      instruction: boundaryActivity.instructions[1],
      hint: 'The key is instructor-authored and debatable by design: a well-argued different boundary can be valid.',
      view: 'boundary',
      readMore: 'w1-worked',
      check: (ctx) => {
        const s = ctx.signals[SIG_BOUNDARY]?.value as BoundaryCheckSignal | undefined
        if (!s) return { ok: false, detail: 'Press “Check classification” in the Boundary & context view.' }
        if (s.answered < s.total) return { ok: false, detail: 'Classify every element, then check again.' }
        return { ok: true, detail: `${s.score} of ${s.total} match the instructor key.` }
      },
    },
    {
      id: 'criterion',
      brief: b('Name the criterion that puts passenger demand inside the boundary.', 'Choose one of the three criteria and press Record.', 'The model-boundary criterion is recorded.'),
      instruction: 'Name the criterion. Passenger demand is inside the boundary (in the wider system of interest, where the case draws the air-taxi service) and the electric grid is in the environment, yet AeroLink controls neither. Which criterion puts demand inside?',
      hint: 'Ask what the question is about: does demand respond to waiting time?',
      view: 'boundary',
      focus: 'boundary:b4',
      readMore: 'w1-soi',
      input: {
        key: 'criterion',
        type: 'choice',
        label: 'Criterion',
        options: [
          { id: 'control', text: 'Control: AeroLink controls passenger demand' },
          { id: 'model', text: 'Model boundary: demand is endogenous to the feedback under study' },
          { id: 'relevance', text: 'Relevance: the grid has no causal path to waiting time' },
        ],
        feedback: {
          control: 'Not quite. AeroLink does not control passengers any more than it controls the grid, so a control criterion would put demand outside.',
          model: boundaryWhy('b4'),
          relevance: `Not quite. The grid: “${boundaryWhy('b5')}” It has a causal path; it is environment because of the control criterion.`,
        },
      },
      check: (ctx) => {
        const a = answered(ctx, 'criterion')
        if (!a) return { ok: false, detail: 'Choose a criterion.' }
        return a.value === 'model' ? { ok: true, detail: 'Model-boundary criterion named.' } : { ok: false, detail: 'Read the feedback and choose again.' }
      },
    },
  ],
  debrief: 'A boundary is fit for a question, not true in general. Your team’s proposal states its own system of interest and boundary (mission 5, part 2).',
}

// ------------------------------------------------------------------------------------------- 3 guided: stakeholders
const stakeholders: Mission = {
  id: 'w1-m3-stakeholders',
  week: 1,
  kind: 'guided',
  title: 'Guided: classify AeroLink’s stakeholders',
  short: 'Stakeholders',
  goal: 'Classify six reference stakeholders as the course register does, then write one register row with a concern someone else could check.',
  goalReview: PENDING,
  minutes: 22,
  objectives: ['B1.4'],
  workloadLine: 'Optional practice: AeroLink missions 1–4',
  steps: [
    {
      id: 'classify',
      brief: b('Classify six AeroLink stakeholders.', 'In the Stakeholders view, part 2, choose a role, internal or external, and approving authority (yes or no) for each of the six.', 'All six are fully classified.'),
      instruction: 'In the Stakeholders view, part 2, classify each of the six stakeholders: its role group, whether it is internal or external to AeroLink Urban Mobility, and whether it is an approving authority (L5).',
      hint: 'Internal means inside the organization that runs the system (AeroLink Urban Mobility). An approving authority formally certifies, qualifies or approves the system for use.',
      view: 'stakeholders',
      focus: 'stk:classify',
      readMore: 'w1-register',
      check: (ctx) => {
        const n = classifiedCount(stakeholderArtefact(ctx.artefacts))
        return n === CLASSIFY_ROWS.length ? { ok: true, detail: `All ${n} classified.` } : { ok: false, detail: `${n} of ${CLASSIFY_ROWS.length} stakeholders fully classified (role, internal or external, approving authority).` }
      },
    },
    {
      id: 'check',
      brief: b('Check the classification against the instructor key.', 'Press “Check classification” in part 2 and read the explanation for each row. For a row that differs from the key, tick “I have read why” or change your answer.', 'The check has run with every row classified, and every difference from the key has been read.'),
      instruction: 'Check your classification and read the explanation for every row, including the ones you got right.',
      hint: 'A difference is worth arguing in class when the case description allows it; the key explains its reading.',
      view: 'stakeholders',
      readMore: 'w1-worked-register',
      check: (ctx) => checkClassified(stakeholderArtefact(ctx.artefacts)),
    },
    {
      id: 'row',
      brief: b('Write one register row with a specific concern.', 'In part 3, choose a stakeholder, write its concern (what, for whom, where or when, with at least one concrete detail), rate influence 1–5 and give the reason; press Record the row.', 'The row is recorded: the concern passed the specificity screen and the rating has a reason. The screen cannot judge whether the concern is true or important.'),
      instruction: 'In the Stakeholders view, part 3, write one register row for a stakeholder you have not classified yet: a concern someone else could check, an influence rating from 1 to 5, and the reason for the rating.',
      hint: '“Insurers: safety” is generic. Say what exactly worries them, for whom, and where or when it bites.',
      view: 'stakeholders',
      focus: 'stk:row',
      readMore: 'w1-register',
      rubric: 'RB-1.3 (concerns, influence)',
      check: (ctx) => checkRegisterRow(stakeholderArtefact(ctx.artefacts)),
    },
  ],
  debrief: 'Your team’s register (mission 5, part 4) uses the same classifications and the same concern screen.',
}

// ------------------------------------------------------------------------------------------- 4 guided: needs
const needs: Mission = {
  id: 'w1-m4-needs',
  week: 1,
  kind: 'guided',
  title: 'Guided: write AeroLink needs that pass the checks',
  short: 'Needs',
  goal: 'Diagnose six draft needs, then write two AeroLink need statements, from two different stakeholders, and confirm each against the six checks of the course gate.',
  goalReview: PENDING,
  minutes: 18,
  objectives: ['B1.5'],
  workloadLine: 'Optional practice: AeroLink missions 1–4',
  steps: [
    {
      id: 'diagnose',
      brief: b('Diagnose six draft “needs”.', 'In the Needs view, part 1, tick every flaw you see in each draft (none if a draft is acceptable), then press Check.', 'The check has run; the key and the reference rewrite are shown for each draft.'),
      instruction: `In the Needs view, part 1, tick the flaws in each draft: written as a requirement, names a solution, no stakeholder, no condition. Some drafts may be acceptable. The reference rewrites are the case’s needs, in the form “${NEED_FORM}”.`,
      hint: 'The key is the instructor’s reading of each draft against the course gate taught in Session 2; argue any disagreement from the six checks.',
      view: 'needs',
      focus: 'needs:diagnose',
      readMore: 'w1-writing-needs',
      check: (ctx) => checkCritique(needsArtefact(ctx.artefacts)),
    },
    {
      id: 'write',
      brief: b('Write two AeroLink needs and confirm the six checks.', `In part 2, write the statement (recommended form: “${NEED_FORM}”), the condition, rationale and short name, and choose the stakeholder it comes from. Fix what the tool marks “Fix”, rewrite or justify each warning, tick the six checks in the self-check, and press Record. Do it twice, for two stakeholders.`, 'Two recorded needs, from two different stakeholders, pass the tool’s checks and are confirmed against the six checks.'),
      instruction: 'In the Needs view, part 2, write two need statements for AeroLink’s new vertiport, each traced to a different stakeholder of the case register. The tool checks the form, the subject, the trace and the rationale, and only warns about the rest; the six checks are yours to confirm.',
      hint: `Recommended form: “${NEED_FORM}”, for example “The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity.” No “shall”, no design, a condition (when, where, under what operating conditions) and a rationale of at least five words. A tool “pass” does not make a need good.`,
      view: 'needs',
      focus: 'needs:write',
      readMore: 'w1-worked-needs',
      rubric: 'RB-2.2 (need statements)',
      check: (ctx) => checkTwoNeeds(needsArtefact(ctx.artefacts)),
    },
  ],
  debrief: 'Your team’s needs (mission 5, part 5) get the same checks, warnings and self-check.',
}

// ------------------------------------------------------------------------------------------- 5 own: Team Record
const team: Mission = {
  id: 'w1-m5-team',
  week: 1,
  kind: 'own',
  title: 'Own: your team’s Week 1 Team Record',
  short: 'Team Record',
  goal: 'Your team’s own enterprise, not AeroLink: seven steps, the six parts of the record (part 6 is the AI usage statement), each checked as you go, then the export. Teammates import the exported file.',
  goalReview: PENDING,
  minutes: 150,
  objectives: ['B1.1', 'B1.3', 'B1.4', 'B1.5'],
  workloadLine: 'Team Record out of class',
  steps: [
    { id: 'charter', brief: b('Part 1: the team charter.', 'In the Team enterprise view, part 1: initials for each lead role, decision rules, communication norms, and one line of owned prefixes per member.', 'The charter check passes.'), instruction: week01.lab.steps[0].detail, view: 'team', focus: 'team:charter', readMore: 'w1-team', check: (ctx) => checkCharterPart(teamArtefact(ctx.artefacts).charter) },
    { id: 'proposal', brief: b('Part 2: the enterprise proposal.', 'Name, domain, the problem statement and the mission (MGO-001), one sentence each, any goals (MGO-002 …), the system of interest (one sentence), at least three elements inside its boundary (PRT), why it suits a 14-week project, and the instructor’s decision: approved with its date, or submitted for approval.', 'The proposal check passes (an AeroLink proposal is rejected). A proposal only submitted for approval passes, labeled; approval is required before the Week 2 submission.'), instruction: week01.lab.steps[1].detail, view: 'team', focus: 'team:proposal', readMore: 'w1-system', rubric: 'RB-1.1', check: (ctx) => checkProposal(teamArtefact(ctx.artefacts).proposal) },
    { id: 'context', brief: b('Part 3: the context.', 'At least six external systems or actors, each with its kind, what crosses the boundary and the direction.', 'The context check passes.'), instruction: week01.lab.steps[2].detail, view: 'team', focus: 'team:context', readMore: 'w1-soi', rubric: 'RB-1.1', check: (ctx) => checkContextPart(teamArtefact(ctx.artefacts)) },
    { id: 'register', brief: b('Part 4: the stakeholder register.', 'At least eight stakeholders, each classified, with one or more specific concerns (each with its CON ID) and an influence rating with a reason; at least three relationships as REL rows (from, to, type, note), at least one of them a conflict.', 'The register check passes.'), instruction: week01.lab.steps[3].detail, view: 'team', focus: 'team:register', readMore: 'w1-register', rubric: 'RB-1.2, RB-1.3', check: (ctx) => checkRegister(teamArtefact(ctx.artefacts)) },
    { id: 'needs', brief: b('Part 5: the initial needs.', `At least eight needs that count, each stated as a need (recommended form: “${NEED_FORM}”): a stakeholder in your register in need, its source, the concern it answers, the mission or goal it serves (MGO), a priority (mandatory, critical, desirable or optional) and a rationale; the six checks confirmed; every warning rewritten or justified. At least five stakeholders covered, including an approving authority.`, 'The needs check passes.'), instruction: week01.lab.steps[4].detail, view: 'team', focus: 'team:needs', readMore: 'w1-writing-needs', rubric: 'RB-2.2, RB-2.5', check: (ctx) => checkNeedsPart(teamArtefact(ctx.artefacts)) },
    { id: 'ai', brief: b('Part 6: the AI usage statement.', 'In part 6, the tool, purpose, prompts, what you accepted or rejected and why; or that no AI tool was used.', 'The statement is recorded (at least twelve words).'), instruction: 'Write the team’s AI usage statement in part 6 of the Team enterprise view. It is exported with the record.', view: 'team', focus: 'team:ai', readMore: 'w1-deliverable', rubric: 'RB-12.1–12.3', check: (ctx) => checkAiStatement(teamArtefact(ctx.artefacts)) },
    { id: 'export', brief: b('After the six parts: export the Team Record.', 'Press “Export Team Record (.md)” and “Export model inputs (.json)” at the top of the Team enterprise view.', 'Both files are exported after the last change; one member uploads both to the “Week 1 Team Record” assignment on the LMS (Laboratory page, Submission). A record whose proposal is not yet approved is exported labeled “submitted for approval”.'), instruction: 'Export the record as Markdown and the model inputs as JSON, and upload both files to the Week 1 Team Record assignment.', view: 'team', focus: 'team:export', readMore: 'w1-deliverable', check: (ctx) => checkExported(teamArtefact(ctx.artefacts)) },
  ],
  debrief: 'Your Team Record is ready to upload. Week 2 writes requirements traced to these needs; Week 8 imports the register and needs into your SysML v2 model.',
}

// ------------------------------------------------------------------------------------------- 6 recall
const recall: Mission = {
  id: 'w1-m6-recall',
  week: 1,
  kind: 'recall',
  title: 'Recall: Week 1 knowledge check',
  short: 'Quiz',
  goal: 'Formative. Every option has an explanation; each question cites its source. Do it after the other missions.',
  minutes: 12,
  objectives: ['B1.1', 'B1.2', 'B1.3', 'B1.4', 'B1.5'],
  workloadLine: 'Readiness quiz Q1',
  steps: [
    {
      id: 'answer',
      brief: b('Answer the Week 1 knowledge check.', `Open Assessments → Recall and answer all ${WEEK1_QUIZ.length} questions.`, 'Every question has an answer.'),
      instruction: 'Open Assessments → Recall and answer every question.',
      readMore: 'w1-outcomes',
      check: (ctx) => {
        const n = WEEK1_QUIZ.filter((q) => ctx.quiz[q.id]).length
        return n === WEEK1_QUIZ.length ? { ok: true, detail: `All ${n} answered.` } : { ok: false, detail: `${n} of ${WEEK1_QUIZ.length} answered.` }
      },
    },
    {
      id: 'review',
      brief: b('Review what you missed.', 'For each question you missed, read the explanation and the source it cites, then try again.', 'Every question is answered correctly.'),
      instruction: 'For each question you missed, read the explanation, revisit the source it cites, and try again.',
      hint: 'Formative, not graded. Retries are allowed.',
      readMore: 'w1-outcomes',
      check: (ctx) => {
        const n = WEEK1_QUIZ.filter((q) => ctx.quiz[q.id]?.correct).length
        return n === WEEK1_QUIZ.length ? { ok: true, detail: 'Every question answered correctly.' } : { ok: false, detail: `${n} of ${WEEK1_QUIZ.length} correct so far.` }
      },
    },
  ],
}

// ------------------------------------------------------------------------------------------- Week 1 rules
const teamRule = (id: string, severity: Rule['severity'], title: string, objective: string, find: (artefacts: Record<string, unknown>) => { elementId: string; message: string; hint: string }[]): Rule => ({
  id,
  severity,
  fromWeek: 1,
  objective,
  title,
  check: (_m, ctx) => find(ctx.artefacts).map((p) => ({ ruleId: id, severity, ...p })),
})

const rules: Rule[] = [
  {
    id: 'w1-ent-boundary',
    severity: 'warning',
    fromWeek: 1,
    objective: 'B1.3',
    title: 'The system of interest has a boundary statement',
    check: (m) =>
      m.elements
        .filter((e) => e.kind === 'ENT' && e.status === 'active' && !(e.text ?? '').trim())
        .map((e) => ({ ruleId: 'w1-ent-boundary', severity: 'warning' as const, elementId: e.id, message: `${e.id} has no boundary statement`, hint: 'State the system of interest in one sentence (L3).' })),
  },
  {
    id: 'w1-ext-exchange',
    severity: 'warning',
    fromWeek: 1,
    objective: 'B1.3',
    title: 'Every external system has a labeled exchange',
    check: (m) =>
      m.elements
        .filter((e) => e.kind === 'EXT' && e.status === 'active' && !String(e.attributes?.exchange ?? '').trim() && !(e.text ?? '').trim())
        .map((e) => ({ ruleId: 'w1-ext-exchange', severity: 'warning' as const, elementId: e.id, message: `${e.id} has no labeled exchange`, hint: 'Label each exchange: what crosses the boundary (people, materials, energy, information, approvals).' })),
  },
  {
    id: 'w1-boundary-open',
    severity: 'info',
    fromWeek: 1,
    objective: 'B1.2',
    title: 'Boundary candidates are classified',
    check: (_m, ctx) => {
      const open = BOUNDARY_ITEMS.filter((i) => !ctx.boundary[i.id])
      if (!open.length || open.length === BOUNDARY_ITEMS.length) return []
      return [{ ruleId: 'w1-boundary-open', severity: 'info' as const, elementId: `boundary:${open[0].id}`, message: `${open.length} of ${BOUNDARY_ITEMS.length} boundary candidates are not classified yet`, hint: boundaryActivity.instructions[0] }]
    },
  },
  teamRule('w1-team-aerolink', 'error', 'The team enterprise is the team’s own, not AeroLink', 'B1.3', (a) => {
    const p = teamArtefact(a).proposal
    return proposalNamesAeroLink(p) ? [{ elementId: 'team:proposal', message: 'The enterprise proposal names AeroLink', hint: 'AeroLink is the instructor’s worked example. Propose your team’s own enterprise, in any domain.' }] : []
  }),
  teamRule('w1-team-concern', 'warning', 'Every stakeholder in the team register has a specific concern', 'B1.4', (a) =>
    teamArtefact(a)
      .stakeholders.filter((s) => s.concerns.some((c) => c.text.trim() && concernIssue(c, s.name)))
      .map((s) => ({ elementId: `team:${s.id}`, message: `${s.id} has a generic concern`, hint: 'Say what, for whom, and where or when it bites, with at least one concrete detail; “wants safety” scores at the developing level of RB-1.3.' })),
  ),
  teamRule('w1-team-trace', 'warning', 'Every need traces to a stakeholder in the team register', 'B1.5', (a) => {
    const r = teamArtefact(a)
    const ids = new Set(r.stakeholders.map((s) => s.id))
    return r.needs
      .filter((n) => n.text.trim() && (sourcesOf(n).length === 0 || sourcesOf(n).some((x) => !ids.has(x))))
      .map((n) => ({ elementId: `team:${n.id}`, message: `${n.id} ${sourcesOf(n).length ? `traces to ${sourcesOf(n).filter((x) => !ids.has(x)).join(', ')}, which is not in the register` : 'has no source stakeholder'}`, hint: 'Each need records the stakeholder it came from, with a trace to the register (R11 p.553).' }))
  }),
  teamRule('w1-team-authority', 'info', 'The team register names an approving authority', 'B1.4', (a) => {
    const r = teamArtefact(a)
    return r.stakeholders.length >= 3 && !r.stakeholders.some((s) => s.approving === 'yes') ? [{ elementId: 'team:register', message: 'No stakeholder is marked as an approving authority', hint: 'Who certifies, qualifies or approves your system for use? It cannot be assumed to be the customer alone (R11 p.553).' }] : []
  }),
]

// ------------------------------------------------------------------------------------------- console lines
function describeSignal(key: string, value: unknown): string | null {
  if (key === SIG_BOUNDARY) {
    const s = value as BoundaryCheckSignal
    return `Boundary check: ${s.score} of ${s.total} match the instructor key (${s.answered} classified)`
  }
  return null
}

const week: WorkbenchWeek = {
  week: 1,
  views: ['stakeholders', 'boundary', 'needs', 'team'],
  missions: [tryFirst, boundary, stakeholders, needs, team, recall],
  rules,
  describeSignal,
}

export default week
