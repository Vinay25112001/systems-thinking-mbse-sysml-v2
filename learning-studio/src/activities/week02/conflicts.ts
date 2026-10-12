// Week 2 — stakeholder-conflict matrix and support-gap logic (pure).
// A conflict is DERIVED, not asserted: two stakeholders conflict on a decision variable when one wants it raised and
// the other wants it lowered. Conflicts are ranked by CONFLICT WEIGHT = influence(a) × influence(b), using the influence
// ratings of the instructor reference stakeholders STK-001..014 (src/model/airtaxi.ts, FICTIONAL calibration values).
// "Conflict weight" is deliberately NOT called salience: in stakeholder theory salience is Mitchell, Agle and Wood's
// (1997) power–legitimacy–urgency construct, which this course measure does not implement.
// SCOPE: nine of the fourteen reference stakeholders (MATRIX_STAKEHOLDERS). Every conclusion drawn from the matrix
// (counts, rankings, "hub" claims) holds only for this selection and these five variables.
// The variables, the direction key and the weight rule are INSTRUCTOR-AUTHORED teaching devices.
// The support-gap part follows R63 p.236–237: stakeholder maps show influence and level of support (awareness →
// understanding → buy-in → commitment); "high influencers must be committed advocates". The rule mapping influence to
// a required level below commitment is a COURSE CONVENTION, not a claim of the source.
import { INSTRUCTOR_EXAMPLE, type Stakeholder } from '../../model/airtaxi'

export type Direction = 'up' | 'down' | 'none'
export const DIRECTION_LABEL: Record<Direction, string> = { up: 'Wants more (↑)', down: 'Wants less (↓)', none: 'No direct stake (–)' }

export const VARIABLES: { id: string; name: string; baseline: string }[] = [
  { id: 'V1', name: 'Daily operating hours', baseline: '16 h/day (Data Sheet, FICTIONAL)' },
  { id: 'V2', name: 'Departures per pad per hour', baseline: '6 per pad-hour (new FICTIONAL value; not on the Data Sheet)' },
  { id: 'V3', name: 'Chargers per vertiport (sets the peak power drawn)', baseline: '2 chargers per vertiport (Data Sheet, FICTIONAL)' },
  { id: 'V4', name: 'Ticket price', baseline: 'Not yet set' },
  { id: 'V5', name: 'Vertiport sites in residential districts', baseline: '2 of 6 (FICTIONAL)' },
]

/**
 * The nine reference stakeholders used in the matrix (a subset of STK-001..014), including the influence-5 ANSP
 * (STK-007), whose capacity limits gate schedule density. Left out, and why (instructor judgement):
 * STK-002 FAA — its concern sets safety limits on every variable rather than a preferred direction;
 * STK-009 maintenance, STK-011 OEM, STK-012 insurers, STK-014 accessibility advocates — their reference concerns bear
 * mainly on variables not in the matrix. Conclusions are conditional on this selection.
 */
export const MATRIX_STAKEHOLDERS = ['STK-001', 'STK-003', 'STK-004', 'STK-005', 'STK-006', 'STK-007', 'STK-008', 'STK-010', 'STK-013']
export const EXCLUDED_STAKEHOLDERS: { id: string; why: string }[] = [
  { id: 'STK-002', why: 'sets safety limits on every variable rather than wanting one moved' },
  { id: 'STK-009', why: 'turnaround pressure bears on maintenance time, not on these variables directly' },
  { id: 'STK-011', why: 'fleet orders and certification are not among the five variables' },
  { id: 'STK-012', why: 'quantified risk is not among the five variables' },
  { id: 'STK-014', why: 'boarding access is not among the five variables' },
]

const REF = new Map(INSTRUCTOR_EXAMPLE.stakeholders.map((s) => [s.id, s]))
export function refStakeholder(id: string): Stakeholder {
  const s = REF.get(id)
  if (!s) throw new Error(`Unknown reference stakeholder ${id}`)
  return s
}

export type Matrix = Record<string, Record<string, Direction | undefined>>
const cellKey = (stk: string, v: string) => `${stk}|${v}`

/** Instructor key: only non-'none' cells are listed, with the reason (tied to the reference concern text). */
export const KEY_CELLS: Record<string, { dir: Direction; why: string }> = {
  [cellKey('STK-001', 'V1')]: { dir: 'up', why: 'Longer hours mean trips are available when passengers need them.' },
  [cellKey('STK-003', 'V1')]: { dir: 'up', why: 'More hours spread fixed costs over more revenue trips.' },
  [cellKey('STK-004', 'V1')]: { dir: 'down', why: 'Early-morning and late-night flights are the noise events residents object to most.' },
  [cellKey('STK-005', 'V1')]: { dir: 'up', why: 'Pad throughput is their concern; more hours means more throughput.' },
  [cellKey('STK-008', 'V1')]: { dir: 'down', why: 'Longer operating days press on duty time and workload.' },
  [cellKey('STK-001', 'V2')]: { dir: 'up', why: 'More departures shorten waiting time.' },
  [cellKey('STK-003', 'V2')]: { dir: 'up', why: 'Throughput is the scaling path investors are funding.' },
  [cellKey('STK-004', 'V2')]: { dir: 'down', why: 'Each departure is a noise event at the pad edge.' },
  [cellKey('STK-005', 'V2')]: { dir: 'up', why: 'Pad throughput is their stated concern.' },
  [cellKey('STK-006', 'V2')]: { dir: 'down', why: 'Dense pad schedules reduce access for incident response.' },
  [cellKey('STK-007', 'V2')]: { dir: 'down', why: 'More departures per pad-hour mean more air-taxi traffic to integrate and separate; its rationale says capacity limits schedule density.' },
  [cellKey('STK-008', 'V2')]: { dir: 'down', why: 'Tighter turnarounds raise pilot workload.' },
  [cellKey('STK-001', 'V3')]: { dir: 'up', why: 'More chargers shorten turnaround and waiting.' },
  [cellKey('STK-005', 'V3')]: { dir: 'up', why: 'Charging capacity is part of their throughput concern.' },
  [cellKey('STK-010', 'V3')]: { dir: 'down', why: 'Peak-load management and connection cost are the utility’s concern.' },
  [cellKey('STK-001', 'V4')]: { dir: 'down', why: 'Affordable trips are part of the passenger concern.' },
  [cellKey('STK-003', 'V4')]: { dir: 'up', why: 'Return on capital depends on yield per trip.' },
  [cellKey('STK-004', 'V4')]: { dir: 'down', why: 'Equitable access near vertiports is part of the community concern.' },
  [cellKey('STK-001', 'V5')]: { dir: 'up', why: 'Sites near homes make door-to-door trips possible.' },
  [cellKey('STK-003', 'V5')]: { dir: 'up', why: 'Residential catchments are where demand is.' },
  [cellKey('STK-004', 'V5')]: { dir: 'down', why: 'Noise, privacy and visual impact fall on residents.' },
  [cellKey('STK-005', 'V5')]: { dir: 'up', why: 'More sites, more throughput and revenue for operators.' },
  [cellKey('STK-013', 'V5')]: { dir: 'down', why: 'Zoning and land-use control: residential siting is where planning approval is hardest.' },
}

export function keyDirection(stk: string, v: string): Direction {
  return KEY_CELLS[cellKey(stk, v)]?.dir ?? 'none'
}
export function keyWhy(stk: string, v: string): string {
  return KEY_CELLS[cellKey(stk, v)]?.why ?? 'No direct stake in this variable in the reference analysis.'
}
export function keyMatrix(): Matrix {
  return Object.fromEntries(MATRIX_STAKEHOLDERS.map((s) => [s, Object.fromEntries(VARIABLES.map((v) => [v.id, keyDirection(s, v.id)]))]))
}

export type Conflict = { variable: string; up: string; down: string; weight: number }

/** Every (raiser, lowerer) pair on each variable, ranked by conflict weight (influence × influence), then by IDs for stability. */
export function findConflicts(m: Matrix, influence: (id: string) => number = (id) => refStakeholder(id).influence): Conflict[] {
  const out: Conflict[] = []
  for (const v of VARIABLES) {
    const ups = MATRIX_STAKEHOLDERS.filter((s) => m[s]?.[v.id] === 'up')
    const downs = MATRIX_STAKEHOLDERS.filter((s) => m[s]?.[v.id] === 'down')
    for (const u of ups) for (const d of downs) out.push({ variable: v.id, up: u, down: d, weight: influence(u) * influence(d) })
  }
  return out.sort((a, b) => b.weight - a.weight || a.variable.localeCompare(b.variable) || a.up.localeCompare(b.up) || a.down.localeCompare(b.down))
}

export type PairSummary = { a: string; b: string; variables: string[]; totalWeight: number }

/** Groups conflicts by unordered stakeholder pair: a pair that conflicts on many variables signals a structural conflict. */
export function conflictsByPair(cs: Conflict[]): PairSummary[] {
  const m = new Map<string, PairSummary>()
  for (const c of cs) {
    const [a, b] = [c.up, c.down].sort()
    const k = `${a}|${b}`
    const p = m.get(k) ?? { a, b, variables: [], totalWeight: 0 }
    p.variables.push(c.variable)
    p.totalWeight += c.weight
    m.set(k, p)
  }
  return [...m.values()].sort((x, y) => y.totalWeight - x.totalWeight || x.a.localeCompare(y.a) || x.b.localeCompare(y.b))
}

export const conflictId = (c: Pick<Conflict, 'variable' | 'up' | 'down'>) => `${c.variable}:${c.up}>${c.down}`

export type MatrixComparison = { agree: number; answered: number; total: number; missed: Conflict[]; extra: Conflict[] }

/** Compares a student matrix with the key: cell agreement and the conflicts the student missed or added. */
export function compareWithKey(student: Matrix): MatrixComparison {
  let agree = 0
  let answered = 0
  for (const s of MATRIX_STAKEHOLDERS)
    for (const v of VARIABLES) {
      const d = student[s]?.[v.id]
      if (d === undefined) continue
      answered++
      if (d === keyDirection(s, v.id)) agree++
    }
  const mine = new Set(findConflicts(student).map(conflictId))
  const key = findConflicts(keyMatrix())
  const keyIds = new Set(key.map(conflictId))
  return {
    agree,
    answered,
    total: MATRIX_STAKEHOLDERS.length * VARIABLES.length,
    missed: key.filter((c) => !mine.has(conflictId(c))),
    extra: findConflicts(student).filter((c) => !keyIds.has(conflictId(c))),
  }
}

// ---- Support gap (R63 p.236–237) -------------------------------------------------------------------------------------

export type SupportLevel = 1 | 2 | 3 | 4
export const SUPPORT_LABEL: Record<SupportLevel, string> = { 1: 'Awareness', 2: 'Understanding', 3: 'Buy-in', 4: 'Commitment' }

/** Course convention built on R63 p.237 ("high influencers must be committed advocates"): influence ≥ 4 → commitment; 3 → buy-in; ≤ 2 → understanding. */
export function requiredSupport(influence: number): SupportLevel {
  if (influence >= 4) return 4
  if (influence === 3) return 3
  return 2
}

export type SupportGap = { id: string; influence: number; current: SupportLevel; required: SupportLevel; gap: number; priority: number }

/** Gap = required − current (never negative); priority = influence × gap, so high influencers far from commitment rank first. */
export function supportGaps(current: Record<string, SupportLevel | undefined>, influence: (id: string) => number = (id) => refStakeholder(id).influence): SupportGap[] {
  return Object.entries(current)
    .filter((e): e is [string, SupportLevel] => e[1] !== undefined)
    .map(([id, cur]) => {
      const inf = influence(id)
      const req = requiredSupport(inf)
      const gap = Math.max(0, req - cur)
      return { id, influence: inf, current: cur, required: req, gap, priority: inf * gap }
    })
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
}
