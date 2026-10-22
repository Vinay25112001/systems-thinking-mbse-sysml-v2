// Guided Practice feedback logic (M5, spec §e.3 GP-20). Pure functions, no React. Three kinds of feedback, never mixed:
//
//   structural check   a rule the course states that a machine can verify. Says "Passes the course check" or "Does not
//                      pass yet: <rule in words>". Never "correct".
//   compared reading   judgment items (stakeholder or not, inside or environment, relationship type, objective link).
//                      Each item "Agrees with the instructor's reading" or "Differs from the instructor's reading", with
//                      the instructor's reasoning. No score, no percentage, no "wrong".
//   reasoned reveal    predictions and reflections: the explanation, shown after the answer is recorded. No grading.
//
// Completion = every step attempted, and every differing item either changed or acknowledged ("I have read why").
// Completion never depends on agreeing with the instructor's reading.
import type { Compared } from './store'

export type FeedbackKind = 'structural' | 'compared' | 'reveal'

export type CompareItem = { id: string; key: string }
export type CompareRow = {
  id: string
  /** The answer at the last check (what the feedback is about). */
  checked?: string
  /** The current answer. */
  answer?: string
  agrees: boolean
  /** The answer changed after the last check: the feedback shown is about the earlier answer. */
  changed: boolean
  acknowledged: boolean
  /** Agrees, or differs and the explanation was read. */
  resolved: boolean
}
export type CompareResult = {
  rows: CompareRow[]
  answered: number
  total: number
  /** "Check" has run with every item answered. */
  checked: boolean
  /** Some answer changed after the last check. */
  stale: boolean
  agree: number
  differ: number
  /** Differing items whose explanation is not yet read. */
  open: number
  complete: boolean
  touched: boolean
}

/** Compares a step's answers with the instructor's reading, item by item. `agrees` may be overridden when an item's
 *  agreement is not plain equality (e.g. a classification row of three fields). */
export function compareStep(items: CompareItem[], c: Compared, agrees: (item: CompareItem, answer: string | undefined) => boolean = (i, a) => a === i.key): CompareResult {
  const answered = items.filter((i) => !!c.answers[i.id]).length
  const checked = !!c.checkedAt && !!c.checked && items.every((i) => !!c.checked![i.id])
  const rows = items.map((i) => {
    const snap = c.checked?.[i.id]
    const ag = checked ? agrees(i, snap) : false
    const acknowledged = !!c.ack[i.id]
    return { id: i.id, checked: snap, answer: c.answers[i.id], agrees: ag, changed: checked && snap !== c.answers[i.id], acknowledged, resolved: ag || acknowledged }
  })
  const stale = rows.some((r) => r.changed)
  const agree = checked ? rows.filter((r) => r.agrees).length : 0
  const differ = checked ? rows.length - agree : 0
  const open = checked ? rows.filter((r) => !r.resolved).length : 0
  return { rows, answered, total: items.length, checked, stale, agree, differ, open, complete: checked && !stale && open === 0, touched: answered > 0 || !!c.checkedAt }
}

/** Runs "Check" (or "Check again"): snapshots the current answers. Acknowledgements of items whose answer changed are
 *  cleared, so a new difference is read again. */
export function runCheck<V extends string>(c: Compared<V>, now = Date.now()): Compared<V> {
  const ack: Record<string, boolean> = {}
  for (const [id, v] of Object.entries(c.ack)) if (v && c.checked?.[id] === c.answers[id]) ack[id] = true
  return { ...c, checked: { ...c.answers }, checkedAt: now, ack }
}

export function setAnswer<V extends string>(c: Compared<V>, id: string, value: V): Compared<V> {
  return { ...c, answers: { ...c.answers, [id]: value } }
}

export function setAck<V extends string>(c: Compared<V>, id: string, value: boolean): Compared<V> {
  return { ...c, ack: { ...c.ack, [id]: value } }
}

/** The summary line of a compared step: counts only, never a score or a percentage. */
export function compareSummary(r: Pick<CompareResult, 'agree' | 'differ' | 'open'>): string {
  const base = `${r.agree} agree · ${r.differ} differ`
  if (!r.differ) return `${base}. Read the reasoning for each.`
  return r.open ? `${base} · read why for each (${r.open} still to read or change)` : `${base} · every difference has been read`
}

export type StructuralResult = { ok: boolean; issues: string[] }
export const structural = (issues: string[]): StructuralResult => ({ ok: issues.length === 0, issues })
/** The words a structural check uses. Never "correct", "valid" or "right". */
export const structuralLine = (r: StructuralResult): string => (r.ok ? 'Passes the course check' : `Does not pass yet: ${r.issues[0]}`)

export type StepState = 'not-started' | 'in-progress' | 'attempted'
export type TaskState = StepState
export const STATE_WORD: Record<StepState, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', attempted: 'Attempted' }

export const stepState = (touched: boolean, complete: boolean): StepState => (complete ? 'attempted' : touched ? 'in-progress' : 'not-started')
export function taskState(steps: { touched: boolean; complete: boolean }[]): TaskState {
  if (steps.every((s) => s.complete)) return 'attempted'
  return steps.some((s) => s.touched || s.complete) ? 'in-progress' : 'not-started'
}

/** Words that would present judgment as objective scoring (spec §e.3 "Never"). feedback.test.ts scans every rendered
 *  judgment feedback string for them. */
export const SCORING_WORDS = /\b(correct(ly)?|incorrect|wrong|right answer|score[ds]?|percent|%|\d+\s*(of|\/)\s*\d+\s*(agree|match|correct)|grade[ds]?|points?)\b/i
