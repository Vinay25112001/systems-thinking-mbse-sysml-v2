// Week 11 activity 1 (B11.1, B11.3; pure): ConOps-to-action-flow coverage checker.
// The student maps the steps and alternate flows of a ConOps scenario (Week 3 format) onto the nodes and successions of
// an action flow, and the checker reports what the mapping does and does not establish. This is a TEACHING AID over a
// graph the student types in: it does not read or check SysML, and only the course-designated checker decides validity.
// Sources of the criteria:
// - a succession asserts that the first action completes before the second begins (S10 sl.31); `start`/`done` are the
//   start and end of the containing action (S10 sl.37–38; S06 p.134);
// - a decision node chooses exactly one successor and is typically followed by conditional successions, the last of
//   which may be `else` (S10 sl.38); `else` is taken when all preceding guards are false (S06 p.136); without guards the
//   choice is not determined by the model (S06 p.134);
// - a merge waits for exactly one predecessor, a fork enables all successors, a join waits for all predecessors
//   (S10 sl.37, sl.40);
// - behaviour consistent with the scenarios (RB-8.5) and the L11 minimum of at least one decision (lab plan Part B).
// The branch/rejoin/end rules for alternate flows apply the Week 3 scenario format ("A n (step k)", "Rejoin at step n",
// "Scenario ends"). What the checks do NOT establish: that a guard is the right condition, that an alternate's own steps
// are all present (e.g. SCN-005 A2's three actions), that node names mean what the ConOps step says, or anything about
// SysML validity.
import type { Element, EngineeringModel } from '../../model/engineering'
import { SYSTEM_ACTOR, draftFromScenario } from '../week03/scenarios'

export type StepRef = string // 'M1'..'Mn' main-flow steps, 'A1'.. alternate flows

export type ScenarioSpec = {
  id: string
  name: string
  main: { ref: string; n: number; actor: string; text: string }[]
  alternates: { ref: string; atStep: number; condition: string; steps: string; outcome: 'rejoin' | 'end'; rejoinAt?: number }[]
}

/** Builds the step list of a recorded scenario (Week 3 attribute format), keeping the alternate-flow numbers. */
export function scenarioSpec(e: Element, m: EngineeringModel): ScenarioSpec {
  const d = draftFromScenario(e, m)
  const alternates = [...String(e.attributes?.alternateFlows ?? '').matchAll(/A(\d+) \(step (\d+)\): (.*?) - (.*?)(?: Rejoin at step (\d+)\.| Scenario ends\.)(?= A\d+ \(step|$)/g)].map((x) => ({
    ref: `A${x[1]}`,
    atStep: Number(x[2]),
    condition: x[3],
    steps: x[4],
    outcome: x[5] ? ('rejoin' as const) : ('end' as const),
    ...(x[5] ? { rejoinAt: Number(x[5]) } : {}),
  }))
  return { id: e.id, name: e.name, main: d.steps.map((s, i) => ({ ref: `M${i + 1}`, n: i + 1, actor: s.actor, text: s.action })), alternates }
}

export type NodeKind = 'action' | 'decide' | 'merge' | 'fork' | 'join'
export const NODE_KINDS: { id: NodeKind; label: string }[] = [
  { id: 'action', label: 'action' },
  { id: 'decide', label: 'decide' },
  { id: 'merge', label: 'merge' },
  { id: 'fork', label: 'fork' },
  { id: 'join', label: 'join' },
]
export type FlowNode = { id: string; kind: NodeKind; covers: StepRef[]; fn?: string }
/** A succession `first from then to`, optionally guarded (`if guard`), or the `else` branch of a decision. */
export type FlowEdge = { from: string; to: string; guard?: string }
export type FlowModel = { nodes: FlowNode[]; edges: FlowEdge[] }

export const START = 'start'
export const DONE = 'done'

export type FlowFinding = { id: string; level: 'error' | 'advisory'; ok: boolean; message: string; source: string }

const isGuarded = (e: FlowEdge) => !!e.guard && e.guard.trim().length > 0
const isElse = (e: FlowEdge) => (e.guard ?? '').trim() === 'else'
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

function successors(f: FlowModel): Map<string, FlowEdge[]> {
  const out = new Map<string, FlowEdge[]>()
  for (const e of f.edges) out.set(e.from, [...(out.get(e.from) ?? []), e])
  return out
}

/** Nodes reachable from `from` (inclusive), optionally only along unguarded edges, optionally not expanding `stopAt`. */
export function reachable(f: FlowModel, from: string[], opts: { unguardedOnly?: boolean; stopAt?: (id: string) => boolean } = {}): Set<string> {
  const out = successors(f)
  const seen = new Set<string>(from)
  const queue = [...from]
  while (queue.length) {
    const n = queue.shift()!
    if (opts.stopAt?.(n) && !from.includes(n)) continue
    for (const e of out.get(n) ?? []) {
      if (opts.unguardedOnly && isGuarded(e)) continue
      if (!seen.has(e.to)) {
        seen.add(e.to)
        queue.push(e.to)
      }
    }
  }
  return seen
}

const coverersOf = (f: FlowModel, ref: StepRef) => f.nodes.filter((n) => n.covers.includes(ref)).map((n) => n.id)
const mainIndex = (ref: string) => (/^M(\d+)$/.test(ref) ? Number(ref.slice(1)) : NaN)

/** The checks, in display order. Errors block "consistent with the ConOps"; advisories ask the modeller to decide. */
export function checkFlow(spec: ScenarioSpec, f: FlowModel): FlowFinding[] {
  const ids = f.nodes.map((n) => n.id)
  const idSet = new Set(ids)
  const findings: FlowFinding[] = []
  const add = (id: string, level: FlowFinding['level'], ok: boolean, message: string, source: string) => findings.push({ id, level, ok, message, source })

  // 1. Well-formed graph
  const badIds = ids.filter((x, i) => !IDENT.test(x) || x === START || x === DONE || ids.indexOf(x) !== i)
  const dangling = f.edges.filter((e) => !(idSet.has(e.from) || e.from === START) || !(idSet.has(e.to) || e.to === DONE))
  const fromDone = f.edges.filter((e) => e.from === DONE || e.to === START)
  add('graph', 'error', badIds.length === 0 && dangling.length === 0 && fromDone.length === 0 && f.edges.some((e) => e.from === START) && f.edges.some((e) => e.to === DONE),
    badIds.length ? `Node names must be unique SysML names and not start/done: ${[...new Set(badIds)].join(', ')}.`
      : dangling.length ? `Successions refer to undeclared nodes: ${dangling.map((e) => `${e.from} → ${e.to}`).join('; ')} (the checker would report an unresolved reference).`
        : fromDone.length ? 'A succession cannot leave done or enter start.'
          : !f.edges.some((e) => e.from === START) ? 'Nothing follows start: add “first start; then …”.'
            : !f.edges.some((e) => e.to === DONE) ? 'No succession reaches done: the flow never ends.'
              : 'Every succession connects declared nodes, from start to done.',
    'S10 sl.31, sl.37–38')

  // 2–3. Coverage of the ConOps
  const uncoveredMain = spec.main.filter((s) => coverersOf(f, s.ref).length === 0).map((s) => s.ref)
  add('main-covered', 'error', uncoveredMain.length === 0, uncoveredMain.length ? `Main-flow steps with no node: ${uncoveredMain.map((r) => r.replace('M', 'step ')).join(', ')}.` : `All ${spec.main.length} main-flow steps are represented.`, `${spec.id} main flow; RB-8.5`)
  const uncoveredAlt = spec.alternates.filter((a) => coverersOf(f, a.ref).length === 0).map((a) => a.ref)
  add('alt-covered', 'error', uncoveredAlt.length === 0, uncoveredAlt.length ? `Alternate flows with no node: ${uncoveredAlt.join(', ')}.` : `All ${spec.alternates.length} alternate flows are represented.`, `${spec.id} alternate flows; RB-8.5`)

  // 4–5. Reachability and termination
  const fromStart = reachable(f, [START])
  const unreachable = ids.filter((x) => !fromStart.has(x))
  add('reachable', 'error', unreachable.length === 0, unreachable.length ? `Not reachable from start: ${unreachable.join(', ')}.` : 'Every node is reachable from start.', 'S10 sl.31, sl.37')
  const deadEnds = ids.filter((x) => fromStart.has(x) && !reachable(f, [x]).has(DONE))
  add('terminates', 'error', deadEnds.length === 0, deadEnds.length ? `No path to done from: ${deadEnds.join(', ')} (a dead end or a loop with no exit).` : 'Every node has a path to done.', 'S10 sl.38 (done)')

  // 6–10. Control nodes
  const out = successors(f)
  const incoming = (x: string) => f.edges.filter((e) => e.to === x).length
  const badDecide: string[] = []
  const unguardedDecide: string[] = []
  const noElse: string[] = []
  for (const n of f.nodes.filter((x) => x.kind === 'decide')) {
    const es = out.get(n.id) ?? []
    if (es.length < 2 || es.filter(isElse).length > 1) badDecide.push(n.id)
    else if (es.some((e) => !isGuarded(e))) unguardedDecide.push(n.id)
    else if (!es.some(isElse)) noElse.push(n.id)
  }
  add('decide-branches', 'error', badDecide.length === 0 && unguardedDecide.length === 0,
    badDecide.length ? `A decision needs at least two branches and at most one else: ${badDecide.join(', ')}.`
      : unguardedDecide.length ? `Unguarded branch out of a decision: ${unguardedDecide.join(', ')}. The model then does not say which branch is taken; give every branch a guard or else.`
        : 'Every decision has two or more guarded branches.',
    'S10 sl.38; S06 p.134, p.136')
  add('decide-else', 'advisory', noElse.length === 0, noElse.length ? `No else branch on: ${noElse.join(', ')}. Unless the guards cover every case, the flow has no successor when all are false — show the guards are exhaustive or add else.` : 'Every decision ends with else, or has none to check.', 'S06 p.136')
  const ambiguous = f.nodes.filter((n) => (n.kind === 'action' || n.kind === 'merge') && (out.get(n.id) ?? []).length > 1).map((n) => n.id)
  add('branch-node', 'advisory', ambiguous.length === 0, ambiguous.length ? `Several successions leave ${ambiguous.join(', ')} without a decide or fork: say whether one branch (decide) or all branches (fork) follow.` : 'Branching happens only at decide and fork nodes.', 'S10 sl.38, sl.40')
  const thinMerge = f.nodes.filter((n) => n.kind === 'merge' && incoming(n.id) < 2).map((n) => n.id)
  add('merge-in', 'advisory', thinMerge.length === 0, thinMerge.length ? `Merge with fewer than two incoming successions: ${thinMerge.join(', ')}.` : 'Every merge joins two or more paths.', 'S10 sl.37')
  const badForkJoin = f.nodes.filter((n) => (n.kind === 'fork' && (out.get(n.id) ?? []).length < 2) || (n.kind === 'join' && incoming(n.id) < 2)).map((n) => n.id)
  add('fork-join', 'error', badForkJoin.length === 0, badForkJoin.length ? `A fork needs two or more successors and a join two or more predecessors: ${badForkJoin.join(', ')}.` : 'Forks and joins are well formed (or absent).', 'S10 sl.40')

  // 11. Main-flow order, on the MAIN PATH only: nodes that realise an alternate flow are not used, so a main step that
  // can be reached only through an alternate (e.g. a normal landing that goes straight to done, leaving step 7 to the
  // divert branch) is reported.
  const altNode = (x: string) => f.nodes.find((n) => n.id === x)?.covers.some((c) => /^A\d+$/.test(c)) ?? false
  const mainOnly: FlowModel = { nodes: f.nodes.filter((n) => !altNode(n.id)), edges: f.edges.filter((e) => !altNode(e.from) && !altNode(e.to)) }
  const orderBreaks: string[] = []
  for (let i = 1; i < spec.main.length; i++) {
    const a = coverersOf(mainOnly, `M${i}`)
    const b = new Set(coverersOf(mainOnly, `M${i + 1}`))
    if (a.length && b.size && !a.some((x) => [...reachable(mainOnly, [x])].some((y) => y !== x && b.has(y)))) orderBreaks.push(`step ${i + 1} cannot follow step ${i} on the main path`)
  }
  add('main-order', 'error', orderBreaks.length === 0, orderBreaks.length ? `The flow does not follow the ConOps order: ${orderBreaks.join('; ')}.` : 'On the main path (alternate-flow nodes left out), each main-flow step can follow the one before it.', `${spec.id} main flow`)

  // 12. Alternate flows are conditional
  // An alternate branches from a step: it must not follow that step (or start) along unguarded successions only.
  const unconditional = spec.alternates.filter((a) => {
    const plain = reachable(f, [START, ...coverersOf(f, `M${a.atStep}`)], { unguardedOnly: true })
    return coverersOf(f, a.ref).some((x) => plain.has(x))
  }).map((a) => a.ref)
  add('alt-guarded', 'error', unconditional.length === 0, unconditional.length ? `Follows its branching step without any guard, so it always happens: ${unconditional.join(', ')}.` : 'Every alternate flow is reached only through a guarded branch.', 'S10 sl.35–38')

  // 13. Where each alternate BRANCHES: every succession into the alternate from outside it must leave a node that is
  // the branching step itself (a decision that realises M{atStep}, like intentCheck) or a node reached after that step
  // and before any later main step — never a node that start reaches without passing the branching step.
  const nodeOf = (x: string) => f.nodes.find((n) => n.id === x)
  const coversMain = (x: string, pred: (k: number) => boolean) => nodeOf(x)?.covers.some((c) => pred(mainIndex(c))) ?? false
  const originProblems: string[] = []
  for (const a of spec.alternates) {
    const nodes = new Set(coverersOf(f, a.ref))
    if (!nodes.size) continue
    const atStep = coverersOf(f, `M${a.atStep}`)
    const isAtStep = (x: string) => atStep.includes(x)
    const afterStep = reachable(f, atStep, { stopAt: (x) => !isAtStep(x) && coversMain(x, (k) => k > a.atStep) })
    const beforeStep = reachable(f, [START], { stopAt: isAtStep })
    const entries = f.edges.filter((e) => nodes.has(e.to) && !nodes.has(e.from))
    const wrong = [...new Set(entries.map((e) => e.from).filter((u) => !isAtStep(u) && (!afterStep.has(u) || beforeStep.has(u) || coversMain(u, (k) => k > a.atStep))))]
    if (wrong.length) originProblems.push(`${a.ref} should branch at step ${a.atStep} but is entered from ${wrong.join(', ')}`)
  }
  add('alt-origin', 'error', originProblems.length === 0, originProblems.length ? `${originProblems.join('; ')}.` : 'Every alternate flow branches at the step the ConOps names.', `${spec.id} alternate flows (“A n (step k)”)`)

  // 14. How each alternate ENDS: an “ends” alternate reaches done and no later main step; a “rejoin at n” alternate's
  // first main-flow node on every path must realise step n — except a path that loops back to its own branching step
  // (a retry, like holding and approaching again), provided at least one path rejoins at step n directly.
  const outcomeProblems: string[] = []
  for (const a of spec.alternates) {
    const nodes = coverersOf(f, a.ref)
    if (!nodes.length) continue
    if (a.outcome === 'end') {
      const r = reachable(f, nodes)
      const later = f.nodes.filter((n) => r.has(n.id) && n.covers.some((c) => mainIndex(c) > a.atStep)).map((n) => n.id)
      if (later.length) outcomeProblems.push(`${a.ref} ends the scenario but leads on to ${later.join(', ')}`)
      else if (!r.has(DONE)) outcomeProblems.push(`${a.ref} ends the scenario but never reaches done`)
    } else {
      const target = a.rejoinAt!
      const isMain = (x: string) => !nodes.includes(x) && coversMain(x, (k) => !Number.isNaN(k))
      const r = reachable(f, nodes, { stopAt: isMain })
      const firstMain = [...r].filter(isMain)
      const rejoins = firstMain.filter((x) => coversMain(x, (k) => k === target))
      const retries = firstMain.filter((x) => !rejoins.includes(x) && coversMain(x, (k) => k === a.atStep))
      const wrong = firstMain.filter((x) => !rejoins.includes(x) && !retries.includes(x))
      const steps = (xs: string[]) => [...new Set(xs.flatMap((x) => nodeOf(x)!.covers.filter((c) => /^M\d+$/.test(c)).map((c) => c.slice(1))))].join(', ')
      if (wrong.length) outcomeProblems.push(`${a.ref} should rejoin at step ${target} but rejoins at step ${steps(wrong)} (${wrong.join(', ')})`)
      else if (r.has(DONE)) outcomeProblems.push(`${a.ref} should rejoin at step ${target} but ${rejoins.length || retries.length ? 'one path ends' : 'it ends'} at done`)
      else if (!rejoins.length) outcomeProblems.push(`${a.ref} should rejoin at step ${target} but never reaches it${retries.length ? ` (it only returns to step ${a.atStep})` : ''}`)
    }
  }
  add('alt-outcome', 'error', outcomeProblems.length === 0, outcomeProblems.length ? `${outcomeProblems.join('; ')}.` : 'Every alternate flow ends, or rejoins at the step the ConOps names.', `${spec.id} alternate flows`)

  // 15. Link to structure (advisory): steps the system of interest performs should be performances of a function.
  const sysSteps = spec.main.filter((s) => s.actor === SYSTEM_ACTOR)
  const unlinked = sysSteps.filter((s) => !f.nodes.some((n) => n.covers.includes(s.ref) && /^FN-\d{3}$/.test((n.fn ?? '').trim()))).map((s) => `step ${s.n}`)
  add('fn-link', 'advisory', unlinked.length === 0, unlinked.length ? `System-of-interest steps not linked to a function (FN): ${unlinked.join(', ')}. Subset the FN action (action x :> Logical::'FN-nnn'), or record why no function exists — that may be a gap in the architecture.` : 'Every system-of-interest step subsets a function.', 'RB-8.5 (linked to structure)')

  // 16. Lab minimum
  const decisions = f.nodes.filter((n) => n.kind === 'decide').length
  add('minimum', 'error', decisions >= 1, decisions >= 1 ? `${decisions} decision node(s): meets the L11 minimum of one.` : 'L11 asks for at least one decision.', 'Lab plan Part B, L11')
  return findings
}

export const flowErrors = (fs: FlowFinding[]) => fs.filter((x) => x.level === 'error' && !x.ok)

/** Markdown table of the mapping (ConOps step → flow nodes), for the L11 deliverable. */
export function mappingMarkdown(spec: ScenarioSpec, f: FlowModel): string {
  const rows = [
    ...spec.main.map((s) => `| Step ${s.n} | ${s.actor} | ${s.text} | ${coverersOf(f, s.ref).join(', ') || '—'} |`),
    ...spec.alternates.map((a) => `| ${a.ref} (step ${a.atStep}) | — | ${a.condition}: ${a.steps} ${a.outcome === 'end' ? '(ends)' : `(rejoins at step ${a.rejoinAt})`} | ${coverersOf(f, a.ref).join(', ') || '—'} |`),
  ]
  return [`${spec.id} ${spec.name}: ConOps-to-flow mapping`, '', '| ConOps item | Actor | Text | Flow nodes |', '|---|---|---|---|', ...rows].join('\n')
}

// ---------------------------------------------------------------------------------------------------------------
// Worked flows. SCN-002 is the instructor reference flow (sysml/week11/aerolink_scn002_action_flow.sysml, from the
// reference model v0.3); it must pass every error-level check (AUTHORING_GUIDE §7 rule 4). TEAM_K_SCN005 encodes the
// seeded review fragment (sysml/week11/aerolink_review_fragment_team_k.sysml), which the checker accepts but which
// has defects a reviewer must find.

const n = (id: string, kind: NodeKind, covers: StepRef[] = [], fn?: string): FlowNode => ({ id, kind, covers, ...(fn ? { fn } : {}) })
const e = (from: string, to: string, guard?: string): FlowEdge => ({ from, to, ...(guard ? { guard } : {}) })

export const REFERENCE_SCN002_FLOW: FlowModel = {
  nodes: [
    n('planFlight', 'action', ['M1'], 'FN-003'),
    n('fileFlightIntent', 'action', ['M2'], 'FN-012'),
    n('intentCheck', 'decide', ['M3']),
    n('holdAndRefile', 'action', ['A3']),
    n('boardPassengers', 'action', ['M4'], 'FN-014'),
    n('partyCheck', 'decide'),
    n('departWithRemainingParty', 'action', ['A2']),
    n('departureReady', 'merge'),
    n('takeOff', 'action', ['M5']),
    n('cruise', 'action', ['M5'], 'FN-005'),
    n('approachAgain', 'merge'),
    n('approach', 'action', ['M6']),
    n('padCheck', 'decide'),
    n('holdForPad', 'action', ['A1']),
    n('divertToAlternate', 'action', ['A1']),
    n('landAtDestination', 'action', ['M6']),
    n('arrived', 'merge'),
    n('deplanePassengers', 'action', ['M7']),
    n('handOverToCharging', 'action', ['M7']),
  ],
  edges: [
    e(START, 'planFlight'), e('planFlight', 'fileFlightIntent'), e('fileFlightIntent', 'intentCheck'),
    e('intentCheck', 'boardPassengers', 'flightIntentAccepted'), e('intentCheck', 'holdAndRefile', 'else'), e('holdAndRefile', DONE),
    e('boardPassengers', 'partyCheck'), e('partyCheck', 'departureReady', 'allPassengersPresent'), e('partyCheck', 'departWithRemainingParty', 'else'),
    e('departWithRemainingParty', 'departureReady'), e('departureReady', 'takeOff'), e('takeOff', 'cruise'), e('cruise', 'approachAgain'),
    e('approachAgain', 'approach'), e('approach', 'padCheck'),
    e('padCheck', 'landAtDestination', 'destinationPadFree'), e('padCheck', 'holdForPad', '(not destinationPadFree) and holdWithinReserve'), e('padCheck', 'divertToAlternate', 'else'),
    e('holdForPad', 'approachAgain'), e('divertToAlternate', 'arrived'), e('landAtDestination', 'arrived'),
    e('arrived', 'deplanePassengers'), e('deplanePassengers', 'handOverToCharging'), e('handOverToCharging', DONE),
  ],
}

export const TEAM_K_SCN005_FLOW: FlowModel = {
  nodes: [
    n('declareHold', 'action', ['M2']),
    n('flagVertiport', 'action', ['M1'], 'FN-004'),
    n('holdScope', 'decide'),
    n('suspendNetwork', 'action', ['A2']),
    n('divertFlights', 'action', ['M3']),
    n('alternateCheck', 'decide'),
    n('divertNearest', 'action', ['A1']),
    n('acceptRevisedIntents', 'action', ['M4'], 'FN-012'),
    n('notifyPassengers', 'action', ['M5']),
    n('passengersRespond', 'action', ['M6']),
    n('liftHold', 'action', ['M7']),
  ],
  edges: [
    e(START, 'declareHold'), e('declareHold', 'flagVertiport'), e('flagVertiport', 'holdScope'),
    e('holdScope', 'suspendNetwork', 'regionWide'), e('holdScope', 'divertFlights', 'else'), e('suspendNetwork', 'notifyPassengers'),
    e('divertFlights', 'alternateCheck'), e('alternateCheck', 'acceptRevisedIntents', 'alternateOpen'), e('alternateCheck', 'divertNearest', 'alternateWithinReserve'),
    e('acceptRevisedIntents', 'notifyPassengers'), e('notifyPassengers', 'passengersRespond'), e('passengersRespond', 'liftHold'), e('liftHold', DONE),
  ],
}

/**
 * L11 starter (sysml/week11/aerolink_l11_starter_scn001.sysml): the six SCN-001 main steps in succession, already
 * mapped, so class time goes into the decisions, alternates and merges. It deliberately fails alt-covered and minimum.
 */
export const SCN001_SKELETON_FLOW: FlowModel = {
  nodes: [
    n('enterRequest', 'action', ['M1']),
    n('checkWeatherAndCapacity', 'action', ['M2']),
    n('quoteFare', 'action', ['M3']),
    n('confirmBooking', 'action', ['M4']),
    n('assignAircraft', 'action', ['M5']),
    n('issueBoardingPass', 'action', ['M6']),
  ],
  edges: [
    e(START, 'enterRequest'), e('enterRequest', 'checkWeatherAndCapacity'), e('checkWeatherAndCapacity', 'quoteFare'),
    e('quoteFare', 'confirmBooking'), e('confirmBooking', 'assignAircraft'), e('assignAircraft', 'issueBoardingPass'), e('issueBoardingPass', DONE),
  ],
}

export const EMPTY_FLOW: FlowModel = { nodes: [], edges: [{ from: START, to: DONE }] }
export const isEmptyFlow = (f: FlowModel) => f.nodes.length === 0
