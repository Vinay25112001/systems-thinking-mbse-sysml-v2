// Week 11 activity 2 (B11.2, B11.3; pure): state-machine walker and analyser.
// The student fires events at a state machine typed in as a table (the reference AircraftOperatingStates is preloaded),
// sees which transitions are enabled under the current guard values, edits the table, and gets an analysis of the
// table. This is a TEACHING AID over a table: it does not parse or check SysML (only the course-designated checker
// does), and its guard language is deliberately tiny: a Boolean name, or `not` and a name.
// Sources of the criteria:
// - the initial state after entry is given by `first start then <state>` (S10 sl.48, changed 2026-03); in a
//   non-parallel state exactly one substate is active after entry (S06 p.146);
// - transitions fire on acceptance of a transfer and only when their guard is true (S10 sl.48, sl.53; S06 p.153);
// - transitions activate and deactivate states (S06 p.146): a state that no transition enters, and that is not the
//   initial state, can never be active;
// - the L11 minimum: an operating-state definition with at least 4 states and at least 5 transitions (lab plan Part B).
// The ConOps traces below are course teaching traces derived from SCN-002, SCN-003 and SCN-004 (reference baseline).

export type Transition = { id: string; from: string; trigger: string; guard?: string; to: string }
export type StateMachine = { name: string; states: string[]; initial: string[]; transitions: Transition[]; finals?: string[] }

export type Env = Record<string, boolean>

/** Evaluates the tiny guard language: '' (no guard) → true; 'x' → env.x; 'not x' → !env.x; anything else → undefined. */
export function guardValue(guard: string | undefined, env: Env): boolean | undefined {
  const g = (guard ?? '').trim()
  if (!g) return true
  const m = g.match(/^(not\s+)?([A-Za-z_][A-Za-z0-9_]*)$/)
  if (!m) return undefined
  const v = !!env[m[2]]
  return m[1] ? !v : v
}

export const guardNames = (m: StateMachine) => [...new Set(m.transitions.map((t) => (t.guard ?? '').trim().match(/([A-Za-z_][A-Za-z0-9_]*)$/)?.[1]).filter((x): x is string => !!x))]

export type FireResult = { next: string; transition: Transition } | { next: null; reason: string }

/** Fires `trigger` in state `current`. Several enabled transitions on one trigger make the result undetermined. */
export function fire(m: StateMachine, current: string, trigger: string, env: Env = {}): FireResult {
  const candidates = m.transitions.filter((t) => t.from === current && t.trigger === trigger)
  if (!candidates.length) return { next: null, reason: `No transition from ${current} accepts ${trigger}.` }
  const values = candidates.map((t) => guardValue(t.guard, env))
  if (values.some((v) => v === undefined)) return { next: null, reason: 'A guard is outside the walker’s guard language (a name, or not and a name); evaluate it by hand.' }
  const enabled = candidates.filter((_, i) => values[i])
  if (!enabled.length) return { next: null, reason: `${trigger} is accepted from ${current} only when ${candidates.map((t) => t.guard).join(' or ')}; the guard is false now.` }
  if (enabled.length > 1) return { next: null, reason: `Undetermined: ${enabled.map((t) => t.id).join(' and ')} are both enabled by ${trigger}.` }
  return { next: enabled[0].to, transition: enabled[0] }
}

/** Triggers accepted somewhere in the machine (the walker's event buttons). */
export const triggersOf = (m: StateMachine) => [...new Set(m.transitions.map((t) => t.trigger))]

export type StateFinding = { id: string; level: 'error' | 'advisory'; ok: boolean; message: string; source: string }

export function reachableStates(m: StateMachine): Set<string> {
  const seen = new Set(m.initial.filter((s) => m.states.includes(s)))
  const queue = [...seen]
  while (queue.length) {
    const s = queue.shift()!
    for (const t of m.transitions.filter((x) => x.from === s)) {
      if (m.states.includes(t.to) && !seen.has(t.to)) {
        seen.add(t.to)
        queue.push(t.to)
      }
    }
  }
  return seen
}

const complementary = (a?: string, b?: string) => {
  const x = (a ?? '').trim()
  const y = (b ?? '').trim()
  return !!x && !!y && (x === `not ${y}` || y === `not ${x}`)
}

export function analyseMachine(m: StateMachine): StateFinding[] {
  const f: StateFinding[] = []
  const add = (id: string, level: StateFinding['level'], ok: boolean, message: string, source: string) => f.push({ id, level, ok, message, source })
  const dupStates = m.states.filter((s, i) => m.states.indexOf(s) !== i)
  const dupIds = m.transitions.map((t) => t.id).filter((x, i, a) => a.indexOf(x) !== i)
  const undeclared = m.transitions.flatMap((t) => [t.from, t.to]).filter((s) => s !== 'done' && !m.states.includes(s))
  add('names', 'error', dupStates.length === 0 && dupIds.length === 0 && undeclared.length === 0,
    dupStates.length ? `Duplicate state names: ${[...new Set(dupStates)].join(', ')}.`
      : dupIds.length ? `Duplicate transition names: ${[...new Set(dupIds)].join(', ')}.`
        : undeclared.length ? `Transitions refer to undeclared states: ${[...new Set(undeclared)].join(', ')} (the checker would report an unresolved reference).`
          : 'Every transition connects declared states.',
    'S10 sl.48')
  const init = m.initial.filter((s) => m.states.includes(s))
  add('initial', 'error', init.length === 1 && m.initial.length === 1,
    init.length === 0 ? 'No initial state: add first start then <state>.' : m.initial.length > 1 ? `More than one initial state (${m.initial.join(', ')}): after entry exactly one substate of a non-parallel state is active.` : `Initial state: ${init[0]}.`,
    'S10 sl.48; S06 p.146')
  const reach = reachableStates(m)
  const unreachable = m.states.filter((s) => !reach.has(s))
  add('reachable', 'error', unreachable.length === 0, unreachable.length ? `Unreachable (no path of transitions from the initial state): ${unreachable.join(', ')}.` : 'Every state is reachable from the initial state.', 'S06 p.146')
  const finals = new Set(m.finals ?? [])
  const sinks = m.states.filter((s) => !finals.has(s) && !m.transitions.some((t) => t.from === s))
  add('exits', 'advisory', sinks.length === 0, sinks.length ? `No transition leaves ${sinks.join(', ')}: once entered, the machine stays there. Intended? If so, say so (or transition to done).` : 'Every state can be left.', 'S06 p.154 (done)')
  const conflicts: string[] = []
  m.transitions.forEach((a, i) => m.transitions.slice(i + 1).forEach((b) => {
    if (a.from === b.from && a.trigger === b.trigger && !complementary(a.guard, b.guard)) conflicts.push(`${a.id} / ${b.id}`)
  }))
  add('determinism', 'advisory', conflicts.length === 0, conflicts.length ? `Same source and trigger without complementary guards: ${conflicts.join('; ')}. Which one fires is not determined by the table.` : 'No two transitions compete for the same event in the same state.', 'S10 sl.53; S06 p.153')
  const ok = m.states.length >= 4 && m.transitions.length >= 5
  add('minimum', 'error', ok, `${m.states.length} states and ${m.transitions.length} transitions${ok ? ': meets' : ': below'} the L11 minimum of 4 and 5.`, 'Lab plan Part B, L11')
  return f
}

export type TraceStep = { trigger: string; env?: Env }
export type Trace = { id: string; label: string; source: string; steps: TraceStep[]; expectEnd: string }
export type TraceResult = { visited: string[]; end: string | null; stoppedAt: number | null; reason?: string; matches: boolean }

export function runTrace(m: StateMachine, trace: Trace): TraceResult {
  let current = m.initial[0] ?? ''
  const visited = [current]
  for (let i = 0; i < trace.steps.length; i++) {
    const r = fire(m, current, trace.steps[i].trigger, trace.steps[i].env ?? {})
    if (r.next === null) return { visited, end: null, stoppedAt: i, reason: r.reason, matches: false }
    current = r.next
    visited.push(current)
  }
  return { visited, end: current, stoppedAt: null, matches: current === trace.expectEnd }
}

// ---------------------------------------------------------------------------------------------------------------
// The reference machine (sysml/week11/aerolink_operating_states.sysml = reference v0.3 Behavior::AircraftOperatingStates)
const t = (id: string, from: string, trigger: string, to: string, guard?: string): Transition => ({ id, from, trigger, to, ...(guard ? { guard } : {}) })

export const REFERENCE_MACHINE: StateMachine = {
  name: 'AircraftOperatingStates',
  states: ['onPad', 'charging', 'dispatchReady', 'inFlight', 'outOfService'],
  initial: ['onPad'],
  transitions: [
    t('connectCharger', 'onPad', 'ChargerConnected', 'charging'),
    t('chargeComplete', 'charging', 'DispatchThresholdReached', 'dispatchReady'),
    t('dispatch', 'dispatchReady', 'DispatchRelease', 'inFlight', 'not noGoFaultOpen'),
    t('land', 'inFlight', 'LandedOnPad', 'onPad'),
    t('overTemperature', 'charging', 'CellOverTemperature', 'outOfService'),
    t('faultBeforeDispatch', 'dispatchReady', 'NoGoFaultReported', 'outOfService'),
    t('faultOnPad', 'onPad', 'NoGoFaultReported', 'outOfService'),
    t('returnToService', 'outOfService', 'ReturnedToService', 'onPad'),
  ],
}

/** The seeded review fragment's vertiport weather states (sysml/week11/aerolink_review_fragment_team_k.sysml). */
export const TEAM_K_MACHINE: StateMachine = {
  name: 'VertiportWeatherStates (Team K draft)',
  states: ['open', 'hold', 'closedForDay'],
  initial: ['open'],
  transitions: [
    t('open_hold', 'open', 'LimitForecast', 'hold'),
    t('hold_open', 'hold', 'ForecastClear', 'open'),
    t('closed_open', 'closedForDay', 'ForecastClear', 'open'),
  ],
}

/** Teaching traces derived from the ConOps (reference baseline SCN-002, SCN-003, SCN-004). */
export const TRACES: Trace[] = [
  { id: 'T1', label: 'Turnaround: charge, dispatch, fly, land', source: 'SCN-003 steps 1–6, SCN-002 steps 5–6', steps: [{ trigger: 'ChargerConnected' }, { trigger: 'DispatchThresholdReached' }, { trigger: 'DispatchRelease', env: { noGoFaultOpen: false } }, { trigger: 'LandedOnPad' }], expectEnd: 'onPad' },
  { id: 'T2', label: 'Cell over-temperature while charging', source: 'SCN-003 A3', steps: [{ trigger: 'ChargerConnected' }, { trigger: 'CellOverTemperature' }], expectEnd: 'outOfService' },
  { id: 'T3', label: 'No-go fault on the pad, repaired and returned', source: 'SCN-004 steps 1–6', steps: [{ trigger: 'NoGoFaultReported' }, { trigger: 'ReturnedToService' }], expectEnd: 'onPad' },
  { id: 'T4', label: 'No-go fault reported while the aircraft is charging', source: 'SCN-004 trigger (health monitoring reports a fault while the aircraft is in service)', steps: [{ trigger: 'ChargerConnected' }, { trigger: 'NoGoFaultReported' }], expectEnd: 'outOfService' },
]
