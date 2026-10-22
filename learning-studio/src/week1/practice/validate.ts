// Leaf-value validation of the stored practice (review M5-02). normalizePractice (store.ts) repairs the shape; this
// module checks every stored value against the task content: unknown IDs (a concern, stakeholder, objective or draft a
// later case release renamed), values of the wrong type and duplicate need IDs are dropped, and each drop is named so
// the page can say what it removed. Never throws.
import { CONCERNS, STAKEHOLDERS } from '../../content/lectures/week01/aerolinkCase'
import { ROLES } from '../../workbench/week1/stakeholders'
import type { Compared, DraftJudgment, GP5, PracticeState, Stamped } from './store'
import * as T from './tasks'

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)

export function sanitizePractice(input: PracticeState): { state: PracticeState; dropped: string[] } {
  const dropped: string[] = []
  const drop = (what: string) => dropped.push(what)
  const stamp = (v: Stamped | undefined, allowed: string[], what: string): Stamped | undefined => {
    if (v === undefined) return undefined
    if (v && typeof v === 'object' && typeof v.value === 'string' && allowed.includes(v.value)) return { value: v.value, at: num(v.at) ?? 0 }
    drop(what)
    return undefined
  }
  const compared = <V extends string>(c: Compared<V>, ids: string[], values: readonly string[] | null, what: string): Compared<V> => {
    const clean = (m: Record<string, V> | undefined) => {
      const out: Record<string, V> = {}
      for (const [k, v] of Object.entries(m ?? {})) {
        if (!ids.includes(k) || typeof v !== 'string' || (v !== '' && values && !values.includes(v))) drop(`${what}: ${k}`)
        else if (v !== '') out[k] = v
      }
      return out
    }
    const answers = clean(c.answers)
    const checked = c.checked ? clean(c.checked) : undefined
    const ack: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(c.ack ?? {})) if (ids.includes(k) && v === true) ack[k] = true
    const at = num(c.checkedAt)
    return { answers, ack, ...(checked && at !== undefined ? { checked, checkedAt: at } : {}) }
  }
  const t = input.tasks
  const stkIds = STAKEHOLDERS.map((s) => s.id)
  const conIds = CONCERNS.map((c) => c.id)

  const g1 = t['gp-1']
  const gp1 = { prediction: stamp(g1.prediction, T.PREDICTION_OPTIONS.map((o) => o.id), 'GP-1 prediction'), identify: compared(g1.identify, T.GP1_ITEMS.map((i) => i.id), ['yes', 'no'], 'GP-1 candidate'), match: stamp(g1.match, T.MATCH_OPTIONS.map((o) => o.id), 'GP-1 comparison') }

  const g2 = t['gp-2']
  const extIds = T.GP2_EXTERNALS.map((e) => e.id)
  const exch = (m: Record<string, { text: string; direction?: string }> | undefined, what: string) => {
    const out: Record<string, { text: string; direction?: 'in' | 'out' | 'both' }> = {}
    for (const [k, v] of Object.entries(m ?? {})) {
      if (!extIds.includes(k) || !v || typeof v !== 'object') { drop(`${what}: ${k}`); continue }
      const d = v.direction
      if (d !== undefined && d !== 'in' && d !== 'out' && d !== 'both') drop(`${what} direction: ${k}`)
      out[k] = { text: str(v.text), ...(d === 'in' || d === 'out' || d === 'both' ? { direction: d } : {}) }
    }
    return out
  }
  const gp2 = {
    boundary: compared(g2.boundary, T.GP2_ITEMS.map((i) => i.id), T.BOUNDARY_CLASSES.map((c) => c.id), 'GP-2 element'),
    criterion: stamp(g2.criterion, T.CRITERION_OPTIONS.map((o) => o.id), 'GP-2 criterion'),
    exchanges: exch(g2.exchanges, 'GP-2 exchange'),
    ...(g2.exchangesChecked ? { exchangesChecked: exch(g2.exchangesChecked, 'GP-2 checked exchange'), exchangesCheckedAt: num(g2.exchangesCheckedAt) ?? 0 } : {}),
    exchangesAck: Object.fromEntries(Object.entries(g2.exchangesAck ?? {}).filter(([k, v]) => extIds.includes(k) && v === true)),
  }

  const g3 = t['gp-3']
  const roleIds = ROLES.map((r) => r.id) as string[]
  const fields: typeof g3.fields = {}
  for (const [k, v] of Object.entries(g3.fields ?? {})) {
    if (!T.GP3_ITEMS.some((i) => i.id === k) || !v || typeof v !== 'object') { drop(`GP-3 stakeholder: ${k}`); continue }
    fields[k] = {
      ...(v.role && roleIds.includes(v.role) ? { role: v.role } : {}),
      ...(v.side === 'internal' || v.side === 'external' ? { side: v.side } : {}),
      ...(v.approving === 'yes' || v.approving === 'no' ? { approving: v.approving } : {}),
    }
  }
  const row = g3.row
  const rowStk = T.GP3_ROW_CHOICES.some((c) => c.id === row.stk) ? row.stk : ''
  if (row.stk && !rowStk) drop(`GP-3 row stakeholder: ${str(row.stk) || 'unreadable'}`)
  const rating = (v: unknown) => (typeof v === 'string' && /^[1-5]?$/.test(v) ? v : '')
  const gp3 = {
    fields,
    classes: compared(g3.classes, T.GP3_ITEMS.map((i) => i.id), null, 'GP-3 classification'),
    row: { stk: rowStk, concern: str(row.concern), interest: rating(row.interest), interestReason: str(row.interestReason), influence: rating(row.influence), reason: str(row.reason) },
    ...(num(g3.rowCheckedAt) !== undefined ? { rowCheckedAt: num(g3.rowCheckedAt) } : {}),
  }
  // a classification answer must equal the fields it was built from
  for (const [k, v] of Object.entries(gp3.classes.answers)) if (v !== `${fields[k]?.role}|${fields[k]?.side}|${fields[k]?.approving}`) delete gp3.classes.answers[k]

  const g4 = t['gp-4']
  const concerns = (Array.isArray(g4.conflict?.concerns) ? g4.conflict.concerns : []).map((c, i) => {
    if (c === '' || c === undefined) return ''
    if (typeof c === 'string' && conIds.includes(c)) return c
    drop(`GP-4 concern ${i + 1}: ${str(c) || 'unreadable'}`)
    return ''
  })
  const pair = T.CONFLICT_PAIRS.some((p) => p.id === g4.conflict?.pair) ? g4.conflict.pair : undefined
  if (g4.conflict?.pair && !pair) drop(`GP-4 pair: ${str(g4.conflict.pair) || 'unreadable'}`)
  const gp4 = {
    rels: compared(g4.rels, T.GP4_ITEMS.map((i) => i.id), T.REL_TYPES, 'GP-4 relationship'),
    conflict: { ...(pair ? { pair } : {}), concerns, variable: str(g4.conflict?.variable) },
    ...(num(g4.conflictCheckedAt) !== undefined ? { conflictCheckedAt: num(g4.conflictCheckedAt) } : {}),
    generic: str(g4.generic),
    ...(num(g4.genericCheckedAt) !== undefined ? { genericCheckedAt: num(g4.genericCheckedAt) } : {}),
  }

  const g5 = t['gp-5']
  const draftIds = T.GP5_DRAFTS.map((d) => d.id)
  const flawIds = [...T.GP5_FLAWS.map((f) => f.id), 'ok'] as string[]
  const judgments = (m: Record<string, DraftJudgment> | undefined, what: string) => {
    const out: Record<string, DraftJudgment> = {}
    for (const [k, v] of Object.entries(m ?? {})) {
      if (!draftIds.includes(k) || !v || typeof v !== 'object') { drop(`${what}: ${k}`); continue }
      out[k] = Object.fromEntries(Object.entries(v).filter(([f, b]) => flawIds.includes(f) && b === true)) as DraftJudgment
    }
    return out
  }
  const need = (n: unknown): GP5['needs'][number] | null => {
    if (!n || typeof n !== 'object') return null
    const o = n as Record<string, unknown>
    if (typeof o.text !== 'string') return null
    return { id: str(o.id), at: num(o.at) ?? 0, name: str(o.name), text: o.text, conditions: str(o.conditions), rationale: str(o.rationale), traces: (Array.isArray(o.traces) ? o.traces : []).filter((x): x is string => typeof x === 'string' && stkIds.includes(x)), selfCheck: (o.selfCheck && typeof o.selfCheck === 'object' ? o.selfCheck : {}) as GP5['draft']['selfCheck'], justification: str(o.justification) }
  }
  const seen = new Set<string>()
  let seq = num(g5.pnSeq) ?? 0
  const needs: GP5['needs'] = []
  for (const raw of Array.isArray(g5.needs) ? g5.needs : []) {
    const n = need(raw)
    if (!n) { drop('GP-5 recorded need (unreadable)'); continue }
    const m = /^PN-(\d+)$/.exec(n.id)
    if (m) seq = Math.max(seq, Number(m[1]))
    needs.push(n)
  }
  // duplicate or missing IDs get a new, never-used number (review M5-12)
  for (const n of needs) {
    if (!/^PN-\d+$/.test(n.id) || seen.has(n.id)) n.id = `PN-${++seq}`
    seen.add(n.id)
  }
  const d = (g5.draft ?? {}) as Partial<GP5['draft']>
  const gp5 = {
    critique: judgments(g5.critique, 'GP-5 draft'),
    ...(g5.critiqueChecked && num(g5.critiqueCheckedAt) !== undefined ? { critiqueChecked: judgments(g5.critiqueChecked, 'GP-5 checked draft'), critiqueCheckedAt: num(g5.critiqueCheckedAt) } : {}),
    critiqueAck: Object.fromEntries(Object.entries(g5.critiqueAck ?? {}).filter(([k, v]) => draftIds.includes(k) && v === true)),
    draft: { name: str(d.name), text: str(d.text), conditions: str(d.conditions), rationale: str(d.rationale), traces: (Array.isArray(d.traces) ? d.traces : []).filter((x): x is string => typeof x === 'string' && stkIds.includes(x)), selfCheck: (d.selfCheck && typeof d.selfCheck === 'object' ? d.selfCheck : {}) as GP5['draft']['selfCheck'], justification: str(d.justification) },
    needs,
    pnSeq: seq,
  }

  const g6 = t['gp-6']
  const gapStk = g6.gap?.stakeholder && stkIds.includes(g6.gap.stakeholder) ? g6.gap.stakeholder : undefined
  if (g6.gap?.stakeholder && !gapStk) drop(`GP-6 stakeholder: ${str(g6.gap.stakeholder) || 'unreadable'}`)
  const gp6 = {
    links: compared(g6.links, T.GP6_ITEMS.map((i) => i.id), T.OBJECTIVE_OPTIONS.map((o) => o.id), 'GP-6 link'),
    gap: { ...(gapStk ? { stakeholder: gapStk } : {}), ...(g6.gap?.decision === 'add' || g6.gap?.decision === 'record' ? { decision: g6.gap.decision } : {}), reason: str(g6.gap?.reason) },
    ...(num(g6.gapCheckedAt) !== undefined ? { gapCheckedAt: num(g6.gapCheckedAt) } : {}),
  }

  return { state: { ...input, tasks: { 'gp-1': gp1, 'gp-2': gp2, 'gp-3': gp3, 'gp-4': gp4, 'gp-5': gp5, 'gp-6': gp6 } }, dropped }
}
