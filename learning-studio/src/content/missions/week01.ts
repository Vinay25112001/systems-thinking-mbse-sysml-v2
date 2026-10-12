// Week 1 missions (WORKBENCH_SPEC §5). Every instruction, hint, worked step and debrief is cut or condensed from the
// reviewed Week 1 content — src/content/weeks/week01.ts, src/content/week1.ts (blocks, boundary key) and
// src/sim/aerolink.ts (scenario setups) — and is imported from there wherever the wording is used verbatim.
// Numbers are computed from the teaching model, never retyped. No new factual claim is introduced.
// Mission minutes reuse the reviewed workload lines (`workloadLine`); they reorganise time, they do not add it.
import type { Mission, MissionCtx, WorkbenchWeek } from './types'
import type { Rule } from '../../workbench/problems'
import week01 from '../weeks/week01'
import { BOUNDARY_ITEMS, WEEK1_BLOCKS, WEEK1_INTRO } from '../week1'
import { WEEK1_QUIZ } from '../quizWeek1'
import { ALL_LOOPS, LOOP_LINKS } from '../causalLoops'
import { DEFAULT_PARAMS, SCENARIOS, chargingCapacityOf, fleetCapacityOf, runScenario } from '../../sim/aerolink'
import {
  SIG_ARCHETYPE, SIG_BOUNDARY, SIG_RUN, analyseLoop, checkCharter, checkContext, checkEmergent, checkSoi, checkTwoLoops,
  isRunSummary, l1Artefact, loopIsSound, loopsArtefact, soundLoopsOfType, type BoundaryCheckSignal, type RunSummary,
} from '../../workbench/week1/logic'

// ------------------------------------------------------------------------------------------- reviewed text, by source
const lab = week01.lab
const labStep = (i: number) => `${lab.steps[i].title}. ${lab.steps[i].detail}`
const boundaryActivity = week01.activities.find((a) => a.id === 'w1-act-boundary')!
const capacity = week01.blocks.find((b) => b.id === 'w1-worked-capacity')!.paragraphs
/** Splits reviewed prose into sentences (a full stop inside a number such as 14.4 does not end a sentence). */
const sentences = (p: string) => p.split(/(?<=[.!?])\s+(?=[A-Z“"(])/).map((x) => x.trim())
const underinvestment = SCENARIOS.find((s) => s.id === 'underinvestment')!
const boundaryWhy = (id: string) => BOUNDARY_ITEMS.find((b) => b.id === id)!.why
const misconception = (start: string) => week01.instructorNotes.misconceptions.find((m) => m.claim.startsWith(start))!.correction
const QUESTION = WEEK1_INTRO.question.split('?')[0] + '?' // "AeroLink Urban Mobility plans to add aircraft … Will it work?"
const LOOP_RULE = misconception('“A loop with a negative link').split('. ')[0] + '.'
const FACILITATION_LOOP = week01.instructorNotes.facilitation.find((f) => f.includes('at least one loop the explorer does not contain'))!

// ------------------------------------------------------------------------------------------- check helpers
const answered = (ctx: MissionCtx, key: string) => ctx.answers[key]
const runs = (ctx: MissionCtx): (RunSummary & { at: number })[] => {
  const s = ctx.signals[SIG_RUN]
  if (!s) return []
  const all = [...(s.history ?? []), { value: s.value, at: s.at }]
  return all.filter((x) => isRunSummary(x.value)).map((x) => ({ ...(x.value as RunSummary), at: x.at }))
}
const num = (v: string | undefined) => (v === undefined || v.trim() === '' ? NaN : Number(v.replace(/[,\s]/g, '')))
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

const FLEET_CAP = fleetCapacityOf(DEFAULT_PARAMS, DEFAULT_PARAMS.initialFleet) // 7,200
const CHARGE_CAP = chargingCapacityOf(DEFAULT_PARAMS, DEFAULT_PARAMS.chargers) // 8,640
const CROSSOVER = CHARGE_CAP / (DEFAULT_PARAMS.tripsPerAircraftPerDay * 30) // 14.4
const PLATEAU = runScenario('underinvestment').at(-1)!.served // 7,788
const B2 = ALL_LOOPS.find((l) => l.id === 'B2')!
const B2_NEGATIVES = B2.path.filter((from, i) => LOOP_LINKS.find((k) => k.from === from && k.to === B2.path[(i + 1) % B2.path.length])?.polarity === '−').length

function numberCheck(key: string, expected: number, tol: number, label: string) {
  return (ctx: MissionCtx) => {
    const a = answered(ctx, key)
    if (!a) return { ok: false, detail: `Record your ${label}.` }
    const v = num(a.value)
    if (Number.isNaN(v)) return { ok: false, detail: 'Enter a number.' }
    return Math.abs(v - expected) <= tol ? { ok: true, detail: `${fmt(v) === fmt(expected) ? fmt(v) : v} — correct.` } : { ok: false, detail: `${a.value} is not right yet; open the hint or the worked step.` }
  }
}

// ------------------------------------------------------------------------------------------- missions
const tryFirstPrediction = [
  { id: 'yes', text: 'Yes — every aircraft added keeps cutting the wait' },
  { id: 'partly', text: 'Only up to a point — then extra aircraft stop helping' },
  { id: 'no', text: 'No — adding aircraft does not change the wait' },
  { id: 'unsure', text: 'I cannot tell without more information' },
]
const REGIME: Record<string, string> = { demand: 'demand (waits within tolerance)', fleet: 'fleet capacity', charging: 'charging capacity' }

const tryFirst: Mission = {
  id: 'w1-m1-try',
  week: 1,
  kind: 'try',
  title: 'Try first: will more aircraft cut waiting?',
  goal: WEEK1_INTRO.question,
  minutes: 10,
  objectives: ['B1.3'],
  workloadLine: 'Graduate leverage-point memo and explorer analysis',
  steps: [
    {
      id: 'predict',
      instruction: `Before any explanation, commit to a prediction. ${QUESTION}`,
      hint: 'There is no penalty for a wrong prediction. It is locked once recorded and compared with the run in step 3.',
      view: 'dynamics',
      readMore: 'w1-intuition',
      input: {
        key: 'prediction',
        type: 'choice',
        label: 'Your prediction',
        lock: true,
        options: tryFirstPrediction,
      },
      check: (ctx) => (answered(ctx, 'prediction') ? { ok: true, detail: 'Prediction recorded and locked.' } : { ok: false, detail: 'Choose and record a prediction.' }),
    },
    {
      id: 'run',
      instruction: `In the Dynamics view, run the scenario “${underinvestment.name}”. ${underinvestment.setup}`,
      hint: 'The scenario buttons are at the top of the Dynamics view. A run made before your prediction does not count.',
      view: 'dynamics',
      readMore: 'w1-feedback',
      check: (ctx) => {
        const p = answered(ctx, 'prediction')
        if (!p) return { ok: false, detail: 'Record your prediction first (step 1).' }
        const after = runs(ctx).filter((r) => r.scenario === 'underinvestment' && r.at >= p.at)
        return after.length ? { ok: true, detail: 'Run recorded after your prediction.' } : { ok: false, detail: `Not run since your prediction. Select “${underinvestment.name}”.` }
      },
    },
    {
      id: 'compare',
      instruction: 'Compare your prediction with the run. In the computed observations at month 60, how many aircraft does the fleet reach, where do served trips level off, and how does the average wait compare with riders’ 15-minute tolerance?',
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      input: {
        key: 'match',
        type: 'choice',
        label: 'Did the run match your prediction?',
        options: [
          { id: 'matched', text: 'It matched' },
          { id: 'partly', text: 'Partly' },
          { id: 'contradicted', text: 'It contradicted my prediction' },
        ],
        feedback: { '*': `${sentences(capacity[2])[1]} ${sentences(capacity[3])[1]} ${sentences(capacity[3]).at(-1)}` },
      },
      check: (ctx) => {
        const p = answered(ctx, 'prediction')
        const m = answered(ctx, 'match')
        const r = runs(ctx).filter((x) => x.scenario === 'underinvestment').at(-1)
        const predicted = tryFirstPrediction.find((o) => o.id === p?.value)?.text
        const side = r
          ? `You predicted: “${predicted ?? '—'}”. The run: fleet ${r.startFleet} → ${r.end.fleet} aircraft; served ${fmt(r.end.served)} of ${fmt(r.end.capacity)} trips a month (charging ceiling ${fmt(r.end.chargingCapacity)}); wait ${r.end.waitMin.toFixed(1)} min against a 15-minute tolerance; binding constraint: ${REGIME[r.end.bottleneck]}.`
          : 'Run the scenario first (step 2).'
        if (!m) return { ok: false, detail: side }
        return p && m.at >= p.at ? { ok: true, detail: side } : { ok: false, detail: 'Record the comparison after the prediction.' }
      },
    },
    {
      id: 'archetype',
      instruction: 'In the scenario panel, commit to an archetype for this run before revealing the instructor’s label.',
      hint: 'The label stays hidden until you choose. Choose from the structure you saw, not from the names.',
      view: 'dynamics',
      readMore: 'w1-feedback',
      check: (ctx) => {
        const v = ctx.signals[SIG_ARCHETYPE]?.value as Record<string, string> | undefined
        return v?.underinvestment ? { ok: true, detail: `Committed “${v.underinvestment}” before the reveal.` } : { ok: false, detail: 'Commit an archetype for this run, then reveal the label.' }
      },
    },
  ],
  debrief: misconception('“More capacity always reduces waiting').split('. ')[0] + '. The rest of the week explains why.',
}

const worked: Mission = {
  id: 'w1-m2-worked',
  week: 1,
  kind: 'worked',
  title: 'Worked: where is the binding constraint?',
  goal: sentences(capacity[0])[0],
  minutes: 15,
  objectives: ['B1.3'],
  workloadLine: 'Graduate leverage-point memo and explorer analysis',
  steps: [
    {
      id: 'setup',
      instruction: `Select “${underinvestment.name}” in the Dynamics view. ${sentences(capacity[0])[1]}`,
      worked: sentences(capacity[0]).slice(2).join(' '),
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      check: (ctx) => (runs(ctx).some((r) => r.scenario === 'underinvestment') ? { ok: true, detail: 'Scenario loaded.' } : { ok: false, detail: `Select “${underinvestment.name}”.` }),
    },
    {
      id: 'fleet-capacity',
      instruction: 'Compute the fleet capacity in trips per month.',
      hint: 'aircraft × trips per aircraft per day × days per month',
      worked: sentences(capacity[1])[0],
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      input: { key: 'fleetCap', type: 'number', label: 'Fleet capacity (trips/month)' },
      check: numberCheck('fleetCap', FLEET_CAP, 0.5, 'fleet capacity'),
    },
    {
      id: 'charging-capacity',
      instruction: 'Compute the charging capacity in trips per month.',
      hint: 'chargers × charges per charger per day (operating minutes ÷ minutes per charge) × days per month',
      worked: sentences(capacity[1])[1],
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      input: { key: 'chargeCap', type: 'number', label: 'Charging capacity (trips/month)' },
      check: numberCheck('chargeCap', CHARGE_CAP, 0.5, 'charging capacity'),
    },
    {
      id: 'crossover',
      instruction: 'Set the two capacities equal. At what fleet size does charging take over from the fleet as the resource that limits capacity?',
      hint: 'charging capacity ÷ (trips per aircraft per day × days per month)',
      worked: sentences(capacity[2]).slice(0, 2).join(' '),
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      input: { key: 'crossover', type: 'number', label: 'Crossover fleet (aircraft)' },
      check: (ctx) => {
        const v = num(answered(ctx, 'crossover')?.value)
        if (Number.isNaN(v)) return { ok: false, detail: 'Record the crossover fleet.' }
        return Math.abs(v - CROSSOVER) <= 0.05 || v === Math.ceil(CROSSOVER) ? { ok: true, detail: `${v} — correct (charging limits capacity from the ${Math.ceil(CROSSOVER)}th aircraft).` } : { ok: false, detail: `${v} is not right yet.` }
      },
    },
    {
      id: 'plateau',
      instruction: 'Check the hand calculation against the explorer. The hand calculation predicts the ceiling; at how many trips a month does the explorer level off at month 60?',
      hint: 'Read “Trips served” in the computed observations, or the last row of the data table.',
      worked: capacity[3],
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      input: { key: 'plateau', type: 'number', label: 'Trips served at month 60' },
      check: numberCheck('plateau', PLATEAU, 1, 'reading of trips served'),
    },
    {
      id: 'lesson',
      instruction: 'As ridership grows in this scenario, in what order does the binding constraint move?',
      worked: sentences(capacity[4]).filter((x) => /^(First|Second),/.test(x)).join(' '),
      view: 'dynamics',
      readMore: 'w1-worked-capacity',
      input: {
        key: 'sequence',
        type: 'choice',
        label: 'Order of the binding constraint',
        options: [
          { id: 'fdc', text: 'fleet → demand → charging' },
          { id: 'dfc', text: 'demand → fleet → charging' },
          { id: 'dcf', text: 'demand → charging → fleet' },
          { id: 'cfd', text: 'charging → fleet → demand' },
        ],
      },
      check: (ctx) => {
        const a = answered(ctx, 'sequence')
        if (!a) return { ok: false, detail: 'Choose an order.' }
        return a.value === 'dfc' ? { ok: true, detail: 'Correct.' } : { ok: false, detail: 'Not that order; reveal the worked step.' }
      },
    },
  ],
}

const boundary: Mission = {
  id: 'w1-m3-boundary',
  week: 1,
  kind: 'guided',
  title: 'Guided: a boundary fit for the question',
  goal: boundaryActivity.purpose,
  minutes: 15,
  objectives: ['B1.1', 'B1.2'],
  workloadLine: 'L1 completion and team charter',
  steps: [
    {
      id: 'classify',
      instruction: `${boundaryActivity.instructions[0]} Question: “${WEEK1_BLOCKS.find((b) => b.id === 'w1-worked')!.paragraphs[0].match(/"([^"]+)"/)![1]}” System of interest: the AeroLink service enterprise.`,
      hint: 'Inside: what the feedback under study runs through. Environment: what influences AeroLink but is not designed or controlled by it. Irrelevant: no plausible causal path to waiting time for this question.',
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
      instruction: boundaryActivity.instructions[1],
      hint: 'The key is instructor-authored and debatable by design: a well-argued different boundary can be valid. Record your reasoning in the L1 lab record.',
      view: 'boundary',
      readMore: 'w1-worked',
      check: (ctx) => {
        const s = ctx.signals[SIG_BOUNDARY]?.value as BoundaryCheckSignal | undefined
        if (!s) return { ok: false, detail: 'Press “Check classification” in the Boundary view.' }
        if (s.answered < s.total) return { ok: false, detail: 'Classify every element, then check again.' }
        return { ok: true, detail: `${s.score} of ${s.total} match the instructor key.` }
      },
    },
    {
      id: 'criterion',
      instruction: 'Name the criterion. Passenger demand is inside the boundary and the electric grid is in the environment, yet AeroLink controls neither. Which criterion puts demand inside?',
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
}

const loops: Mission = {
  id: 'w1-m4-loops',
  week: 1,
  kind: 'guided',
  title: 'Guided: one reinforcing and one balancing loop',
  goal: lab.steps[2].detail,
  minutes: 20,
  objectives: ['B1.2'],
  workloadLine: 'L1 completion and team charter',
  steps: [
    {
      id: 'count',
      instruction: `Trace loop B2, “${B2.name}”, in the causal-loop diagram and confirm its polarity by counting negative links.`,
      hint: LOOP_RULE,
      view: 'loops',
      focus: 'loop:B2',
      readMore: 'w1-feedback',
      input: { key: 'b2neg', type: 'number', label: 'Negative links in B2' },
      check: numberCheck('b2neg', B2_NEGATIVES, 0, 'count'),
    },
    {
      id: 'reinforcing',
      instruction: 'In the Loop builder, build a reinforcing loop for AeroLink: choose its variables, give every arrow a polarity, declare the loop type and record the owner.',
      hint: `${LOOP_RULE} If Problems reports a type mismatch, recount the negative links.`,
      view: 'loops',
      readMore: 'w1-feedback',
      check: (ctx) => {
        const n = soundLoopsOfType(loopsArtefact(ctx.artefacts).loops, 'Reinforcing').length
        return n ? { ok: true, detail: `${n} reinforcing loop${n > 1 ? 's' : ''} pass the checks.` } : { ok: false, detail: 'No reinforcing loop passes the checks yet (see Problems).' }
      },
    },
    {
      id: 'balancing',
      instruction: 'Build a balancing loop in the same way.',
      hint: LOOP_RULE,
      view: 'loops',
      readMore: 'w1-feedback',
      check: (ctx) => {
        const n = soundLoopsOfType(loopsArtefact(ctx.artefacts).loops, 'Balancing').length
        return n ? { ok: true, detail: `${n} balancing loop${n > 1 ? 's' : ''} pass the checks.` } : { ok: false, detail: 'No balancing loop passes the checks yet (see Problems).' }
      },
    },
    {
      id: 'beyond',
      instruction: `Make ${FACILITATION_LOOP.match(/require (at least one loop[^)]*\))/)![1]}.`,
      hint: 'Type your own variable names in the Loop builder. A link between your own variables is your causal claim: be ready to justify it.',
      view: 'loops',
      readMore: 'w1-lab',
      check: (ctx) => {
        const ok = loopsArtefact(ctx.artefacts).loops.some((l) => loopIsSound(l) && analyseLoop(l).beyondExplorer)
        return ok ? { ok: true, detail: 'At least one sound loop goes beyond the explorer’s structure.' } : { ok: false, detail: 'Every sound loop so far copies the explorer’s structure.' }
      },
    },
  ],
}

const own: Mission = {
  id: 'w1-m5-l1',
  week: 1,
  kind: 'own',
  title: `Own: Lab ${lab.id} record`,
  goal: `${week01.assignment.instructions[0]} No scaffolding: completeness is machine-checked where possible; the causal argument is read against the rubric.`,
  minutes: 100,
  objectives: lab.objectives,
  workloadLine: 'L1 completion and team charter',
  steps: [
    { id: 'soi', instruction: labStep(0), view: 'boundary', focus: 'ENT-001', readMore: 'w1-worked', rubric: 'RB-1.1', check: (ctx) => checkSoi(ctx.model) },
    { id: 'context', instruction: labStep(1), view: 'boundary', readMore: 'w1-soi', rubric: 'RB-1.1', check: (ctx) => checkContext(ctx.model) },
    { id: 'loops', instruction: labStep(2), view: 'loops', readMore: 'w1-feedback', check: (ctx) => checkTwoLoops(loopsArtefact(ctx.artefacts).loops) },
    {
      id: 'emergent',
      instruction: labStep(3),
      view: 'l1',
      readMore: 'w1-emergence',
      rubric: 'RB-1.4 (causal-argument clause)',
      check: (ctx) => checkEmergent(l1Artefact(ctx.artefacts), loopsArtefact(ctx.artefacts).loops, runs(ctx)),
    },
    { id: 'charter', instruction: labStep(4), view: 'l1', readMore: 'w1-lab', check: (ctx) => checkCharter(l1Artefact(ctx.artefacts)) },
    {
      id: 'submit',
      instruction: `${week01.instructorNotes.sessions[1].segments.at(-1)!.notes} Export the record from the L1 record view.`,
      view: 'l1',
      readMore: 'w1-lab',
    },
  ],
}

const recall: Mission = {
  id: 'w1-m6-recall',
  week: 1,
  kind: 'recall',
  title: 'Recall: Week 1 knowledge check',
  goal: 'Formative. Every option has an explanation; each question cites its source. Do it after the other missions.',
  minutes: 12,
  objectives: ['B1.1', 'B1.2', 'B1.3', 'B1.4'],
  workloadLine: 'Readiness quiz Q1 / knowledge check',
  steps: [
    {
      id: 'answer',
      instruction: 'Open Assessments → Recall and answer every question.',
      readMore: 'w1-outcomes',
      check: (ctx) => {
        const n = WEEK1_QUIZ.filter((q) => ctx.quiz[q.id]).length
        return n === WEEK1_QUIZ.length ? { ok: true, detail: `All ${n} answered.` } : { ok: false, detail: `${n} of ${WEEK1_QUIZ.length} answered.` }
      },
    },
    {
      id: 'review',
      instruction: 'For each question you missed, read the explanation, revisit the source it cites, and try again.',
      hint: 'Formative — not graded. Retries are allowed.',
      readMore: 'w1-outcomes',
      check: (ctx) => {
        const n = WEEK1_QUIZ.filter((q) => ctx.quiz[q.id]?.correct).length
        return n === WEEK1_QUIZ.length ? { ok: true, detail: 'Every question answered correctly.' } : { ok: false, detail: `${n} of ${WEEK1_QUIZ.length} correct so far.` }
      },
    },
  ],
}

// ------------------------------------------------------------------------------------------- Week 1 rules
const STRUCTURE = new Set(['too-short', 'blank-variable', 'repeated-variable', 'missing-polarity'])
const loopRule = (id: string, severity: Rule['severity'], codes: string[], hint: string, title: string, objective = 'B1.2'): Rule => ({
  id,
  severity,
  fromWeek: 1,
  objective,
  title,
  check: (_m, ctx) =>
    loopsArtefact(ctx.artefacts).loops.flatMap((l) =>
      analyseLoop(l)
        .issues.filter((i) => codes.includes(i.code))
        .map((i) => ({ ruleId: id, severity, elementId: l.id, message: i.message, hint })),
    ),
})

const rules: Rule[] = [
  loopRule('w1-loop-structure', 'warning', [...STRUCTURE], 'A loop closes back on its first variable; every arrow needs a polarity (+ same direction, − opposite direction).', 'Student loops are closed and every link has a polarity'),
  loopRule('w1-loop-type', 'error', ['type-mismatch'], LOOP_RULE, 'Declared loop type matches the count of negative links'),
  loopRule('w1-loop-undeclared', 'info', ['undeclared'], 'Declare the loop type once every arrow has a polarity.', 'Every student loop declares its type'),
  loopRule('w1-loop-explorer', 'warning', ['contradicts-explorer'], 'Each arrow shows the local effect of a change in the cause with everything else held constant. Compare the link with the causal-loop diagram.', 'Links between explorer variables agree with the explorer’s polarities'),
  loopRule('w1-loop-new-link', 'info', ['not-in-explorer'], 'Fine if it is your own causal claim; justify it in the L1 record.', 'Links the explorer’s model does not contain are flagged for justification'),
  loopRule('w1-loop-owner', 'warning', ['owner'], 'Enter the owner’s initials (2–4 letters) in the Loop builder or Properties.', 'Student loops name an owner'),
  {
    id: 'w1-ent-boundary',
    severity: 'warning',
    fromWeek: 1,
    objective: 'B1.2',
    title: 'The system of interest has a boundary statement',
    check: (m) =>
      m.elements
        .filter((e) => e.kind === 'ENT' && e.status === 'active' && !(e.text ?? '').trim())
        .map((e) => ({ ruleId: 'w1-ent-boundary', severity: 'warning' as const, elementId: e.id, message: `${e.id} has no boundary statement`, hint: lab.artefacts[0].minimum })),
  },
  {
    id: 'w1-ext-exchange',
    severity: 'warning',
    fromWeek: 1,
    objective: 'B1.2',
    title: 'Every external system has a labelled exchange',
    check: (m) =>
      m.elements
        .filter((e) => e.kind === 'EXT' && e.status === 'active' && !String(e.attributes?.exchange ?? '').trim() && !(e.text ?? '').trim())
        .map((e) => ({ ruleId: 'w1-ext-exchange', severity: 'warning' as const, elementId: e.id, message: `${e.id} has no labelled exchange`, hint: 'Label each exchange (power, data, passengers, approvals).' })),
  },
  {
    id: 'w1-boundary-open',
    severity: 'info',
    fromWeek: 1,
    objective: 'B1.1',
    title: 'Boundary candidates are classified',
    check: (_m, ctx) => {
      const open = BOUNDARY_ITEMS.filter((i) => !ctx.boundary[i.id])
      if (!open.length || open.length === BOUNDARY_ITEMS.length) return []
      return [{ ruleId: 'w1-boundary-open', severity: 'info' as const, elementId: `boundary:${open[0].id}`, message: `${open.length} of ${BOUNDARY_ITEMS.length} boundary candidates are not classified yet`, hint: boundaryActivity.instructions[0] }]
    },
  },
]

// ------------------------------------------------------------------------------------------- console lines
function describeSignal(key: string, value: unknown): string | null {
  if (key === SIG_RUN && isRunSummary(value)) {
    const name = SCENARIOS.find((s) => s.id === value.scenario)?.name ?? 'custom settings'
    const e = value.end
    return `Dynamics run · ${name} · month ${e.month}: riders ${fmt(e.riders)}, served ${fmt(e.served)} of ${fmt(e.capacity)}, wait ${e.waitMin.toFixed(1)} min, binding constraint ${REGIME[e.bottleneck]}, fleet ${e.fleet}`
  }
  if (key === SIG_BOUNDARY) {
    const s = value as BoundaryCheckSignal
    return `Boundary check: ${s.score} of ${s.total} match the instructor key (${s.answered} classified)`
  }
  if (key === SIG_ARCHETYPE) {
    const v = value as Record<string, string>
    return `Archetype committed: ${Object.entries(v).map(([k, g]) => `${SCENARIOS.find((s) => s.id === k)?.name ?? k} → ${g}`).join('; ')}`
  }
  return null
}

const week: WorkbenchWeek = {
  week: 1,
  views: ['dynamics', 'loops', 'boundary', 'l1', 'principles', 'stakeholders'],
  missions: [tryFirst, worked, boundary, loops, own, recall],
  rules,
  describeSignal,
}

export default week
