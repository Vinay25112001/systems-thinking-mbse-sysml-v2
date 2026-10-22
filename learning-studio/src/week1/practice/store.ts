// Guided Practice state (M5, spec §e.4 GP-21…GP-23, change-impact X8). The practice has ONE browser key of its own,
// `w1.practice` (stored as `sysml-studio:v1:w1.practice`), and nothing else: it never reads or writes the team record
// (`wb-artefacts['w1.team']`), the project (IndexedDB or the course server) or any other workbench key. A reset deletes
// only this key (or one task inside it).
//
// Migration (non-destructive, once): before M5 the AeroLink missions kept their answers inside the shared workbench keys
// (`wb-artefacts['w1.stakeholders' | 'w1.needs']`, beside the team record; `mission-progress['w1-m1…m4']`; the AppState
// key `boundary`). The first load with no `w1.practice` copies those answers forward into `w1.practice` and records where
// they came from. The legacy keys are only READ: they are never changed or deleted, so the team record and anything else
// stored beside it stay byte-identical (data-compatibility checklist item 5; store.test.ts proves it).
import { loadJSON, removeKey, saveJSON, STORAGE_PREFIX } from '../../lib/storage'
import type { BoundaryClass } from '../../content/week1'
import type { RelationshipType } from '../../content/lectures/week01/aerolinkCase'
import type { Classification, NeedDraft, W1CritiqueAnswer } from '../../workbench/week1/stakeholders'

export const PRACTICE_STORAGE_KEY = 'w1.practice'
/** Keys the practice may never write (the isolation tests assert them byte-identical). */
export const PROTECTED_KEYS = ['wb-artefacts', 'mission-progress', 'mission-signals', 'boundary', 'w1-team-before-project', 'wb-ui'] as const

export type Stamped = { value: string; at: number }
/** A step whose items are compared with the instructor's reading: the answers, the answers as they stood at the last
 *  "Check", and the items whose explanation the student has read (spec §e.3). */
export type Compared<V extends string = string> = { answers: Record<string, V>; checked?: Record<string, V>; checkedAt?: number; ack: Record<string, boolean> }
export const EMPTY_COMPARED: Compared = { answers: {}, ack: {} }

export type ExchangeDirection = 'in' | 'out' | 'both'
export type GP1 = { prediction?: Stamped; identify: Compared<'yes' | 'no'>; match?: Stamped }
export type Exchange = { text: string; direction?: ExchangeDirection }
/** `exchangesChecked`: the exchanges as they stood at the last Check (the reading is about those, review M5-17). */
export type GP2 = { boundary: Compared<BoundaryClass>; criterion?: Stamped; exchanges: Record<string, Exchange>; exchangesChecked?: Record<string, Exchange>; exchangesCheckedAt?: number; exchangesAck: Record<string, boolean> }
/** `fields` holds the three choices per stakeholder as the student makes them; `classes` compares one item per
 *  stakeholder, its answer `role|side|approving` (empty until all three are chosen). */
/** The practice register row (A25-3, review M5-16): interest is required with a short reason; influence is optional. */
export type PracticeRow = { stk: string; concern: string; interest: string; interestReason: string; influence: string; reason: string }
export type GP3 = { fields: Record<string, Classification>; classes: Compared; row: PracticeRow; rowCheckedAt?: number }
export type GP4 = { rels: Compared<RelationshipType>; conflict: { pair?: string; concerns: string[]; variable: string }; conflictCheckedAt?: number; generic: string; genericCheckedAt?: number }
/** `ok`: the student judged the draft acceptable as written (review M5-05: an untouched draft is not a judgment). */
export type DraftJudgment = W1CritiqueAnswer & { ok?: boolean }
/** `pnSeq`: the last practice-need number used, so an ID is never reused after a revision (review M5-12). */
export type GP5 = { critique: Record<string, DraftJudgment>; critiqueChecked?: Record<string, DraftJudgment>; critiqueCheckedAt?: number; critiqueAck: Record<string, boolean>; draft: NeedDraft; needs: (NeedDraft & { id: string; at: number })[]; pnSeq?: number }
export type GP6 = { links: Compared; gap: { stakeholder?: string; decision?: 'add' | 'record'; reason: string }; gapCheckedAt?: number }

export type PracticeTasks = { 'gp-1': GP1; 'gp-2': GP2; 'gp-3': GP3; 'gp-4': GP4; 'gp-5': GP5; 'gp-6': GP6 }
export type TaskId = keyof PracticeTasks
export const TASK_IDS: TaskId[] = ['gp-1', 'gp-2', 'gp-3', 'gp-4', 'gp-5', 'gp-6']

export type PracticeState = {
  v: 1
  tasks: PracticeTasks
  /** When the answers of the earlier practice missions were copied forward, and from which keys (read only). */
  migrated?: { at: string; from: string[] }
  /** Write counter: a tab writes only over the version it last read (review M5-07, no silent overwrite). */
  rev?: number
  /** Set on load only (never stored): the stored practice could not be read; the raw text was kept under `backupKey`. */
  recovered?: { backupKey: string; at: string }
}
/** Where an unreadable practice value is kept before the practice starts again (M5 confirmation N-3). */
export const PRACTICE_BACKUP_KEY = 'w1.practice.unreadable'

const cmp = <V extends string>(): Compared<V> => ({ answers: {}, ack: {} })
export const EMPTY_TASKS = (): PracticeTasks => ({
  'gp-1': { identify: cmp() },
  'gp-2': { boundary: cmp(), exchanges: {}, exchangesAck: {} },
  'gp-3': { fields: {}, classes: cmp(), row: { stk: '', concern: '', interest: '', interestReason: '', influence: '', reason: '' } },
  'gp-4': { rels: cmp(), conflict: { concerns: [], variable: '' }, generic: '' },
  'gp-5': { critique: {}, critiqueAck: {}, draft: { name: '', text: '', conditions: '', rationale: '', traces: [], selfCheck: {}, justification: '' }, needs: [] },
  'gp-6': { links: cmp(), gap: { reason: '' } },
})
export const emptyPractice = (): PracticeState => ({ v: 1, tasks: EMPTY_TASKS() })

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})
const mergeCompared = <V extends string>(v: unknown): Compared<V> => {
  const o = obj(v)
  return { answers: { ...(obj(o.answers) as Record<string, V>) }, ...(o.checked ? { checked: { ...(obj(o.checked) as Record<string, V>) } } : {}), ...(typeof o.checkedAt === 'number' ? { checkedAt: o.checkedAt } : {}), ack: { ...(obj(o.ack) as Record<string, boolean>) } }
}

/** A stored value read defensively: anything missing or malformed falls back to the empty task (never throws). */
export function normalizePractice(raw: unknown): PracticeState {
  const o = obj(raw)
  const t = obj(o.tasks)
  const e = EMPTY_TASKS()
  const g = (id: TaskId) => obj(t[id])
  const s1 = g('gp-1'), s2 = g('gp-2'), s3 = g('gp-3'), s4 = g('gp-4'), s5 = g('gp-5'), s6 = g('gp-6')
  const tasks: PracticeTasks = {
    'gp-1': { ...e['gp-1'], ...s1, identify: mergeCompared(s1.identify) },
    'gp-2': { ...e['gp-2'], ...s2, boundary: mergeCompared(s2.boundary), exchanges: { ...(obj(s2.exchanges) as GP2['exchanges']) }, exchangesAck: { ...(obj(s2.exchangesAck) as Record<string, boolean>) } },
    'gp-3': { ...e['gp-3'], ...s3, fields: { ...(obj(s3.fields) as Record<string, Classification>) }, classes: mergeCompared(s3.classes), row: { ...e['gp-3'].row, ...(obj(s3.row) as Partial<PracticeRow>) } },
    'gp-4': { ...e['gp-4'], ...s4, rels: mergeCompared(s4.rels), conflict: { ...e['gp-4'].conflict, ...(obj(s4.conflict) as Partial<GP4['conflict']>), concerns: Array.isArray(obj(s4.conflict).concerns) ? (obj(s4.conflict).concerns as string[]) : [] }, generic: typeof s4.generic === 'string' ? s4.generic : '' },
    'gp-5': { ...e['gp-5'], ...s5, critique: { ...(obj(s5.critique) as GP5['critique']) }, critiqueAck: { ...(obj(s5.critiqueAck) as Record<string, boolean>) }, draft: { ...e['gp-5'].draft, ...(obj(s5.draft) as Partial<NeedDraft>) }, needs: Array.isArray(s5.needs) ? (s5.needs as GP5['needs']) : [] },
    'gp-6': { ...e['gp-6'], ...s6, links: mergeCompared(s6.links), gap: { ...e['gp-6'].gap, ...(obj(s6.gap) as Partial<GP6['gap']>) } },
  }
  return { v: 1, tasks, ...(o.migrated ? { migrated: o.migrated as PracticeState['migrated'] } : {}), ...(typeof o.rev === 'number' ? { rev: o.rev } : {}) }
}

// ------------------------------------------------------------------------------------------------ migration (read only)
type LegacyAnswer = { value?: unknown; at?: unknown }
const stamped = (a: unknown): Stamped | undefined => {
  const x = obj(a) as LegacyAnswer
  return typeof x.value === 'string' ? { value: x.value, at: typeof x.at === 'number' ? x.at : 0 } : undefined
}
const BOUNDARY_IDS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9']

/** The practice answers found in the earlier shared keys, mapped into the new tasks. Pure: the caller passes what it
 *  read. Returns null when nothing practice-related was stored there. */
export function migrateLegacy(src: { artefacts?: unknown; progress?: unknown; boundary?: unknown }): { state: PracticeState; from: string[] } | null {
  const art = obj(src.artefacts)
  const prog = obj(src.progress)
  const st = emptyPractice()
  const from: string[] = []
  const stk = obj(art['w1.stakeholders'])
  if (Object.keys(stk).length) {
    from.push("wb-artefacts['w1.stakeholders']")
    const identified = obj(stk.identified) as Record<string, 'yes' | 'no'>
    st.tasks['gp-1'].identify = { answers: { ...identified }, ack: { ...(obj(stk.identifiedAck) as Record<string, boolean>) }, ...(typeof stk.identifiedCheckedAt === 'number' ? { checkedAt: stk.identifiedCheckedAt, checked: { ...identified } } : {}) }
    const fields = obj(stk.classes) as Record<string, Classification>
    const answers: Record<string, string> = {}
    for (const [id, c] of Object.entries(fields)) if (c?.role && c.side && c.approving) answers[id] = `${c.role}|${c.side}|${c.approving}`
    const ack: Record<string, boolean> = { ...(obj(stk.classesAck) as Record<string, boolean>) }
    st.tasks['gp-3'].fields = JSON.parse(JSON.stringify(fields))
    st.tasks['gp-3'].classes = { answers, ack, ...(typeof stk.classesCheckedAt === 'number' ? { checkedAt: stk.classesCheckedAt, checked: { ...answers } } : {}) }
    st.tasks['gp-3'].row = { ...st.tasks['gp-3'].row, ...(obj(stk.row) as Partial<PracticeRow>) }
    if (typeof stk.rowRecordedAt === 'number') st.tasks['gp-3'].rowCheckedAt = stk.rowRecordedAt
  }
  const needs = obj(art['w1.needs'])
  if (Object.keys(needs).length) {
    from.push("wb-artefacts['w1.needs']")
    const critique = obj(needs.critique) as GP5['critique']
    st.tasks['gp-5'] = { ...st.tasks['gp-5'], critique: { ...critique }, draft: { ...st.tasks['gp-5'].draft, ...(obj(needs.draft) as Partial<NeedDraft>) }, needs: Array.isArray(needs.needs) ? (needs.needs as GP5['needs']) : [], ...(typeof needs.critiqueCheckedAt === 'number' ? { critiqueCheckedAt: needs.critiqueCheckedAt, critiqueChecked: { ...critique } } : {}) }
  }
  const m1 = obj(obj(prog['w1-m1-who']).answers)
  const m2 = obj(obj(prog['w1-m2-boundary']).answers)
  if (stamped(m1.prediction) || stamped(m1.match)) {
    from.push("mission-progress['w1-m1-who']")
    st.tasks['gp-1'].prediction = stamped(m1.prediction)
    st.tasks['gp-1'].match = stamped(m1.match)
  }
  if (stamped(m2.criterion)) {
    from.push("mission-progress['w1-m2-boundary']")
    st.tasks['gp-2'].criterion = stamped(m2.criterion)
  }
  const b = obj(src.boundary)
  const answers: Record<string, BoundaryClass> = {}
  for (const id of BOUNDARY_IDS) if (b[id] === 'inside' || b[id] === 'environment' || b[id] === 'irrelevant') answers[id] = b[id] as BoundaryClass
  if (Object.keys(answers).length) {
    from.push('boundary (b1–b9)')
    st.tasks['gp-2'].boundary = { answers, ack: {} }
  }
  return from.length ? { state: st, from } : null
}

// ------------------------------------------------------------------------------------------------ load, save, reset
/** Reads the practice. With no `w1.practice` yet, copies the earlier practice answers forward once (read only). */
export function loadPractice(now = () => new Date().toISOString()): PracticeState {
  // review M5-20: a stored but unreadable value is not "no practice yet": it never triggers the migration again
  const raw = storedRaw()
  if (raw !== null) {
    const stored = loadJSON<unknown>(PRACTICE_STORAGE_KEY, null)
    if (stored !== null) return normalizePractice(stored)
    // unreadable: keep the raw text under its own key first, then start again (never re-run the migration)
    const at = now()
    saveJSON(PRACTICE_BACKUP_KEY, { savedAt: at, raw })
    const fresh: PracticeState = { ...emptyPractice(), migrated: { at, from: [] } }
    savePractice(fresh)
    return { ...fresh, recovered: { backupKey: PRACTICE_BACKUP_KEY, at } }
  }
  const m = migrateLegacy({ artefacts: loadJSON<unknown>('wb-artefacts', {}), progress: loadJSON<unknown>('mission-progress', {}), boundary: loadJSON<unknown>('boundary', {}) })
  if (!m) return emptyPractice()
  const state: PracticeState = { ...m.state, migrated: { at: now(), from: m.from } }
  savePractice(state)
  return state
}

export const savePractice = (s: PracticeState): boolean => {
  const { recovered: _r, ...stored } = s
  void _r
  return saveJSON(PRACTICE_STORAGE_KEY, stored)
}

/** The raw stored text of the practice key (null when absent or storage is unavailable). */
export function storedRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + PRACTICE_STORAGE_KEY)
  } catch {
    return null
  }
}
/** The write counter of the stored practice (0 when absent or unreadable). */
export function storedRev(): number {
  try {
    const v = JSON.parse(storedRaw() ?? 'null') as { rev?: unknown } | null
    return typeof v?.rev === 'number' ? v.rev : 0
  } catch {
    return 0
  }
}
/** Saves only over the version this tab last read (review M5-07). Returns 'stale' when another tab wrote meanwhile:
 *  nothing is written, and the page offers to load the latest answers instead of overwriting them silently. */
export function savePracticeGuarded(next: PracticeState, readRev: number): 'saved' | 'stale' | 'failed' {
  if (storedRev() !== readRev) return 'stale'
  return savePractice({ ...next, rev: readRev + 1 }) ? 'saved' : 'failed'
}

/** Clears one task (spec GP-22). Only `w1.practice` is written. */
export function resetTask(s: PracticeState, id: TaskId): PracticeState {
  return { ...s, tasks: { ...s.tasks, [id]: EMPTY_TASKS()[id] } }
}

/** "Reset all practice": deletes the practice key itself. The migration does not run again (a marker stays), so the
 *  earlier answers do not come back. */
export function resetAllPractice(): PracticeState {
  const rev = storedRev()
  removeKey(PRACTICE_STORAGE_KEY)
  const fresh: PracticeState = { ...emptyPractice(), migrated: { at: new Date().toISOString(), from: [] }, rev: rev + 1 }
  savePractice(fresh)
  return fresh
}
