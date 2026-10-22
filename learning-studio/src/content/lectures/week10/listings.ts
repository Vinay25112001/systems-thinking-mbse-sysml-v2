// Week 10 SysML v2 listings: every listing a slide or the lesson shows is an excerpt of a file under sysml/ that the
// course-designated checker has validated (sysml/lectures/week10/week10-report.json). sysmlWeek10.test.ts checks that
// each listing below is an ordered, verbatim excerpt of its file (a long documentation comment may be shortened with
// "…") and that the status stated here is the status the checker recorded for the whole file. Listings are drawn as
// figures (src/components/figures/LectureWeek10Code.tsx), so the same text reaches the slide viewer, the reader and the
// .pptx; the figure's alt text carries the listing text.
//
// A checker PASS means the file parsed, every name resolved and no validation rule fired. It never shows that a flow
// follows the ConOps or that a guard means its condition (see the guard-gap, warm-up and predict listings).
// Review status: new-pending-review.
import { sysmlSource } from '../../../lib/sysml'
import { AEROLINK_W10_MODEL_FILE } from './aerolinkCase'

export type Mark = { line: number; label: string }
export type Listing = {
  id: string
  /** The validated file the excerpt comes from (path under sysml/). */
  file: string
  /** The status the checker recorded for the whole file. */
  status: 'PASS' | 'PASS with warnings' | 'FAIL'
  /** What the checker said, as recorded (predict items and the calibration table). */
  recorded?: string
  lines: string[]
  /** Callouts drawn beside a line (1-based line of `lines`). */
  marks?: Mark[]
  /** The credit line drawn under the listing, exactly as students read it. */
  credit?: string
}

const src = (file: string): string => {
  const t = sysmlSource(file)
  if (t === undefined) throw new Error(`listing source missing: sysml/${file}`)
  return t.replace(/\r/g, '')
}
// A documentation line shortened to about `max` characters, keeping its first words and closing with "… */".
function shortDoc(line: string, max: number): string {
  if (!max || line.length <= max || !line.includes('doc /*') || !line.includes('*/')) return line
  const head = line.slice(0, line.indexOf('doc /*') + 7)
  const body = line.slice(head.length, line.lastIndexOf('*/')).trim()
  const tail = line.slice(line.lastIndexOf('*/') + 2)
  const room = Math.max(12, max - head.length - 6 - tail.length)
  let cut = body.slice(0, room)
  if (cut.length < body.length) cut = cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)
  return `${head}${cut} … */${tail}`
}
/** Removes the common leading tabs, widens tabs to four spaces and shortens long documentation lines. */
function tidy(block: string, maxDoc: number): string[] {
  const lines = block.split('\n')
  const lead = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\t*/)![0].length))
  return lines.map((l) => shortDoc(l.slice(lead).replace(/\t/g, '    '), maxDoc))
}
/** The block that starts on the line containing `start` and ends at its matching closing brace (or its semicolon). */
function block(file: string, start: string): string {
  const t = src(file)
  const at = t.indexOf(start)
  if (at < 0) throw new Error(`no "${start}" in ${file}`)
  const s = t.lastIndexOf('\n', at) + 1
  const brace = t.indexOf('{', at)
  const semi = t.indexOf(';', at)
  if (brace < 0 || (semi >= 0 && semi < brace)) return t.slice(s, semi + 1)
  let depth = 0
  for (let i = brace; i < t.length; i++) {
    if (t[i] === '{') depth++
    else if (t[i] === '}' && --depth === 0) return t.slice(s, i + 1)
  }
  throw new Error(`unbalanced block at "${start}" in ${file}`)
}
const blocks = (file: string, starts: string[], maxDoc = 76) => starts.flatMap((s, i) => [...(i ? [''] : []), ...tidy(block(file, s), maxDoc)])
/** The lines from the first line containing `from` (searching after `after`, if given) to the first later line containing
 *  `to`, inclusive. */
function range(file: string, from: string, to: string, maxDoc = 76, after?: string): string[] {
  const ls = src(file).split('\n')
  const base = after ? ls.findIndex((l) => l.includes(after)) : 0
  const a = ls.findIndex((l, i) => i >= base && l.includes(from))
  const b = ls.findIndex((l, i) => i > a && l.includes(to))
  if (a < 0 || b < 0) throw new Error(`no range "${from}" … "${to}" in ${file}`)
  return tidy(ls.slice(a, b + 1).join('\n'), maxDoc)
}
/** Single lines, each the first line (after the previous pick) that contains the given text. */
function pick(file: string, texts: string[], maxDoc = 76): string[] {
  const ls = src(file).split('\n')
  let at = 0
  const out: string[] = []
  for (const t of texts) {
    const i = ls.findIndex((l, k) => k >= at && l.includes(t))
    if (i < 0) throw new Error(`no line "${t}" in ${file}`)
    out.push(ls[i])
    at = i + 1
  }
  return tidy(out.join('\n'), maxDoc)
}
const drop = (lines: string[], re: RegExp) => lines.filter((l) => !re.test(l))
const W10 = (f: string) => `lectures/week10/${f}`
const AERO = AEROLINK_W10_MODEL_FILE

export const LISTINGS: Record<string, () => Listing> = {
  // ---------------------------------------------------------------- Session 1
  'guard-gap': () => ({
    id: 'guard-gap',
    file: W10('driving_question_guard_gap.sysml'),
    status: 'PASS',
    lines: range(W10('driving_question_guard_gap.sysml'), 'action def PatientTransferDispatch', 'action dispatchCritical;'),
  }),
  'guard-covered': () => ({
    id: 'guard-covered',
    file: W10('driving_question_guard_gap.sysml'),
    status: 'PASS',
    lines: range(W10('driving_question_guard_gap.sysml'), 'then decide triage;', 'else scheduleRoutine;', 76, 'package GuardsCovered'),
    marks: [{ line: 4, label: 'else: every remaining score' }],
  }),
  'logical-parts': () => ({
    id: 'logical-parts',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["part def 'Scheduling' {", 'doc /* Placeholder subject of REQ-SYS-005, REQ-SYS-011'], 64), '    …', '}', '', ...pick(AERO, ["part def 'Decision Support'"], 70), '', ...range(AERO, 'part logicalArchitecture {', "part <'LOG-001'>"), '    …'],
    marks: [
      { line: 1, label: 'a Week 9 placeholder, reused' },
      { line: 6, label: 'a new logical part definition' },
      { line: 8, label: 'the architecture: one part usage' },
      { line: 10, label: 'usage: LOG ID, name, its definition' },
    ],
  }),
  capability: () => ({
    id: 'capability',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["action def <'CAP-003'>"], 84), '', ...tidy(block(AERO, "action <'FN-006'>"), 64), '', ...pick(AERO, ["#derivedFrom dependency 'FN-006 derived from CAP-003'", "#derivedFrom dependency 'REQ-SYS-003 derived from CAP-004'"])],
    marks: [
      { line: 1, label: 'capability: an action definition' },
      { line: 3, label: 'function: an action usage' },
      { line: 10, label: 'function → capability (course keyword)' },
      { line: 11, label: 'the link Week 9 left waiting' },
    ],
  }),
  'function-io': () => ({
    id: 'function-io',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["item def <'INFO-008'>"], 60), '', ...tidy(block(AERO, "action <'FN-003'>"), 64)],
    marks: [
      { line: 1, label: 'an information item: an item definition' },
      { line: 3, label: 'the function, its ID as short name' },
      { line: 5, label: 'in: an item it consumes' },
      { line: 7, label: 'out: an item it produces' },
    ],
  }),
  'allocate-perform': () => ({
    id: 'allocate-perform',
    file: W10('allocate_versus_perform.sysml'),
    status: 'PASS',
    lines: blocks(W10('allocate_versus_perform.sysml'), ['package Logical']),
    marks: [
      { line: 5, label: 'perform: the part is the performer' },
      { line: 7, label: 'allocate: responsibility, as a mapping' },
    ],
  }),
  'worked-logical': () => ({
    id: 'worked-logical',
    file: AERO,
    status: 'PASS',
    lines: [...tidy(block(AERO, "part <'LOG-005'>"), 76), '', ...pick(AERO, ["allocate Requirements::'REQ-SYS-005' to 'FN-002';", "allocate Requirements::'REQ-SYS-011' to 'FN-002';", "allocate Requirements::'REQ-STK-006' to 'FN-011';"])],
    marks: [
      { line: 1, label: 'LOG-005, typed by the Week 9 placeholder' },
      { line: 2, label: 'the functions allocated to it' },
      { line: 7, label: 'requirement → function' },
    ],
  }),
  'fork-join': () => ({
    id: 'fork-join',
    file: W10('fork_join_turnaround.sysml'),
    status: 'PASS',
    lines: drop(blocks(W10('fork_join_turnaround.sysml'), ['action def Turnaround'], 60), /^\s*doc \/\*/),
    marks: [
      { line: 4, label: 'fork: both successors start' },
      { line: 11, label: 'join: waits for both' },
    ],
  }),
  'scn002-a': () => ({
    id: 'scn002-a',
    file: AERO,
    status: 'PASS',
    lines: range(AERO, 'attribute destinationPadOccupied : Boolean;', 'then rejoinTakeOffAndCruise;', 64),
    marks: [
      { line: 1, label: 'guards: conditions the ConOps names' },
      { line: 5, label: 'a step subsets its function' },
      { line: 7, label: 'before step 3: the condition is known first' },
      { line: 9, label: 'else: the step itself' },
      { line: 11, label: 'A3 ends the scenario' },
      { line: 14, label: 'after step 4: decide' },
    ],
  }),
  'scn002-b': () => ({
    id: 'scn002-b',
    file: AERO,
    status: 'PASS',
    lines: range(AERO, 'merge rejoinTakeOffAndCruise;', 'then done;', 64, 'action departWithRemainingParty'),
    marks: [
      { line: 1, label: 'A2 rejoins here: a merge' },
      { line: 3, label: 'before landing: is the pad free?' },
      { line: 7, label: 'A1 rejoins at step 7' },
    ],
  }),
  'item-flows': () => ({
    id: 'item-flows',
    file: AERO,
    status: 'PASS',
    lines: pick(AERO, ['flow planFlight.flightReleaseAndPlan to fileFlightIntent.flightReleaseAndPlan;', 'flow boardParty.passengerPartyOut to takeOffAndCruise.passengerPartyIn;', 'flow takeOffAndCruise.passengerPartyOut to approachAndLand.passengerPartyIn;', 'flow approachAndLand.passengerPartyOut to deplane.passengerPartyIn;']),
    marks: [
      { line: 1, label: 'the plan, from FN-003 to FN-012' },
      { line: 2, label: 'the party, through the flight' },
    ],
  }),
  'predict-target': () => ({
    id: 'predict-target',
    file: W10('invalid_decide_target_declared.sysml'),
    status: 'FAIL',
    recorded: 'FAIL: line 11, “no viable alternative at input ‘if’”',
    lines: range(W10('invalid_decide_target_declared.sysml'), 'then decide intentCheck;', 'then done;'),
  }),
  // ---------------------------------------------------------------- Session 2
  warmup: () => ({
    id: 'warmup',
    file: W10('warmup_three_branches.sysml'),
    status: 'PASS',
    lines: [...range(W10('warmup_three_branches.sysml'), 'then fork;', 'then connectCharger;'), '', ...range(W10('warmup_three_branches.sysml'), 'then decide;', 'if chargerFree then connectCharger;'), '', ...range(W10('warmup_three_branches.sysml'), 'then merge waitForCharger;', 'then waitForCharger;')],
  }),
  'state-def': () => ({
    id: 'state-def',
    file: AERO,
    status: 'PASS',
    lines: drop(tidy(block(AERO, 'state def AircraftOperatingStates'), 70), /^\s*doc \/\*/),
    marks: [
      { line: 2, label: 'a guard condition' },
      { line: 3, label: 'the initial state' },
      { line: 5, label: 'do: performed while in the state' },
      { line: 8, label: 'entry: performed on entry' },
      { line: 11, label: 'trigger, guard, target' },
    ],
  }),
  exhibit: () => ({
    id: 'exhibit',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ['state aircraftOperatingStates : AircraftOperatingStates;']), '', ...drop(tidy(block(AERO, "part def 'Aircraft' {"), 64), /generated by the Week/)],
    marks: [
      { line: 1, label: 'a state usage of the definition' },
      { line: 3, label: 'the Week 9 placeholder (Physical)' },
      { line: 7, label: 'exhibit: this part is in these states' },
    ],
  }),
  'use-case': () => ({
    id: 'use-case',
    file: AERO,
    status: 'PASS',
    lines: tidy(block(AERO, "use case <'SCN-001'>"), 70),
    marks: [
      { line: 3, label: 'subject first: the enterprise' },
      { line: 4, label: 'an actor, typed by a Week 8 part def' },
      { line: 5, label: 'objective: the success end state' },
    ],
  }),
  include: () => ({
    id: 'include',
    file: W10('turnaround_include.sysml'),
    status: 'PASS',
    lines: range(W10('turnaround_include.sysml'), "use case 'operate turnaround cycle'", 'then done;', 64),
    marks: [
      { line: 7, label: 'include: performs the included use case' },
      { line: 8, label: 'the subject declared first' },
      { line: 9, label: 'actors bound explicitly' },
    ],
  }),
  'predict-two-initial': () => ({
    id: 'predict-two-initial',
    file: W10('predict_two_initial_states.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message',
    lines: blocks(W10('predict_two_initial_states.sysml'), ['state def DoorStates']),
  }),
  'predict-parallel': () => ({
    id: 'predict-parallel',
    file: W10('predict_cross_region_inside.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message',
    lines: blocks(W10('predict_cross_region_inside.sysml'), ['state aircraftStates : AircraftStates parallel'], 60),
  }),
  'parallel-owned': () => ({
    id: 'parallel-owned',
    file: W10('invalid_transition_parallel.sysml'),
    status: 'FAIL',
    recorded: 'FAIL: line 20, “A parallel state cannot have successions or transitions.”',
    lines: pick(W10('invalid_transition_parallel.sysml'), ['state aircraftStates : AircraftStates parallel {', 'transition takeOff first operational.onPad']),
  }),
  'predict-unreachable': () => ({
    id: 'predict-unreachable',
    file: W10('predict_unreachable_state.sysml'),
    status: 'PASS',
    recorded: 'PASS, no message',
    lines: blocks(W10('predict_unreachable_state.sysml'), ['state def PumpStates']),
  }),
}

export const listing = (id: string): Listing => {
  const f = LISTINGS[id]
  if (!f) throw new Error(`unknown listing ${id}`)
  return f()
}
/** The listing as one line of text (for alt text): lines joined with " / ". */
export const listingText = (id: string) =>
  listing(id)
    .lines.map((l) => l.trim())
    .filter(Boolean)
    .join(' / ')

/** The calibration table of Session 1 (what the checker rejects and what it accepts silently), each row a checked file
 *  and the diagnostic the checker recorded for it (week10-report.json; sysmlWeek10.test.ts checks every row). */
export const CALIBRATION: { file: string; label: string; what: string; result: 'FAIL' | 'PASS' | 'PASS with warnings'; recorded: string }[] = [
  { file: W10('invalid_decide_target_declared.sysml'), label: 'branch target declared', what: 'A decision branch that declares its target action in place', result: 'FAIL', recorded: "no viable alternative at input 'if'" },
  { file: W10('invalid_guard_before_trigger.sysml'), label: 'guard before trigger', what: 'A transition with its guard written before its trigger', result: 'FAIL', recorded: "no viable alternative at input 'transition'" },
  { file: W10('invalid_perform_undeclared.sysml'), label: 'perform: no such action', what: 'A part that performs an action nobody declared', result: 'FAIL', recorded: "Couldn't resolve reference to Feature 'matchRequestToAircraft'." },
  { file: W10('invalid_transition_parallel.sysml'), label: 'transition owned by a parallel state', what: 'A transition written directly in a parallel state, even one within a single region', result: 'FAIL', recorded: 'A parallel state cannot have successions or transitions.' },
  { file: W10('driving_question_guard_gap.sysml'), label: 'guards with a gap, no else', what: 'A decision whose guards leave a value uncovered and that has no else', result: 'PASS', recorded: 'no message' },
  { file: W10('warmup_three_branches.sysml'), label: 'fork for a choice', what: 'A fork where the scenario has a choice (and guards that can both hold)', result: 'PASS', recorded: 'no message' },
  { file: W10('predict_no_initial_state.sysml'), label: 'no initial state', what: 'A state definition that names no initial state', result: 'PASS', recorded: 'no message' },
  { file: W10('predict_two_initial_states.sysml'), label: 'two initial states', what: 'A state definition with two initial states', result: 'PASS', recorded: 'no message' },
  { file: W10('predict_unreachable_state.sysml'), label: 'unreachable state', what: 'A state that no transition enters', result: 'PASS', recorded: 'no message' },
  { file: W10('predict_cross_region_inside.sysml'), label: 'crossing regions, inside a region', what: 'A transition between two concurrent regions, written inside one region', result: 'PASS', recorded: 'no message' },
]
