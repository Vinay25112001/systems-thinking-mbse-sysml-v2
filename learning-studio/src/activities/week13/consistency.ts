// Week 13 model-consistency logic (pure). A student edits a fragment table (one row per value-bearing feature of a model
// element) and the checks below find the inconsistencies a reviewer looks for. Each check also records what the
// course-designated checker (OMG SysML v2 Pilot Implementation release 2026-08) did with the same defect in the course
// probes of 2026-10-11 (docs/authoring/week13_notes.md), so the student sees "parses" and "consistent" side by side.
//
// The checks are a COURSE TEACHING TOOL (instructor-authored), not a SysML validator: they read the table, not a .sysml
// file, and they catch common defects, not every inconsistency.
import { kindOfId, type EngineeringModel } from '../../model/engineering'

export type QuantityKind = 'duration' | 'power' | 'energy' | 'sound' | 'fraction' | 'none'
export type Role = 'limit' | 'threshold' | 'estimate' | 'margin' | 'criterion' | 'design value' | 'other'
export type Bound = 'max' | 'min' | ''

export type FragmentRow = {
  /** Element ID (course short name), e.g. REQ-SYS-001. */
  id: string
  /** Element name; two rows with the same ID and different names are two elements sharing an ID. */
  name: string
  feature: string
  role: Role
  kind: QuantityKind
  value: string
  unit: string
  /** For limit/threshold/criterion rows: is the value a maximum (≤) or a minimum (≥)? */
  bound: Bound
  /** ID this row's element refers to: the requirement a TPM measures, a VER verifies or a design value satisfies. */
  refersTo: string
  /** Text that states the value (doc comment, requirement statement or criterion), if any. */
  doc: string
}

type UnitDef = { kind: QuantityKind; factor: number }
const UNITS: Record<string, UnitDef> = {
  s: { kind: 'duration', factor: 1 }, min: { kind: 'duration', factor: 60 }, h: { kind: 'duration', factor: 3600 },
  w: { kind: 'power', factor: 1 }, kw: { kind: 'power', factor: 1e3 }, mw: { kind: 'power', factor: 1e6 },
  j: { kind: 'energy', factor: 1 }, kj: { kind: 'energy', factor: 1e3 }, mj: { kind: 'energy', factor: 1e6 }, wh: { kind: 'energy', factor: 3600 }, kwh: { kind: 'energy', factor: 3.6e6 },
  db: { kind: 'sound', factor: 1 }, dba: { kind: 'sound', factor: 1 },
  '%': { kind: 'fraction', factor: 0.01 }, fraction: { kind: 'fraction', factor: 1 }, '1': { kind: 'fraction', factor: 1 },
}
/** Normalises unit spellings: "kW * h", "kW⋅h", "kW h" -> "kwh"; "dB(A)" -> "dba"; "[min]" -> "min". */
export function normUnit(u: string): string {
  return u.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/[\s*·⋅]+/g, '').replace(/[()]/g, '')
}
export const unitDef = (u: string): UnitDef | undefined => UNITS[normUnit(u)]
/** The quantity kind a row's unit gives (a fraction may be written without a unit). */
const rowKind = (r: Pick<FragmentRow, 'unit' | 'kind'>): QuantityKind | undefined => unitDef(r.unit)?.kind ?? (r.unit.trim() === '' && r.kind === 'fraction' ? 'fraction' : undefined)

const num = (v: string): number | null => {
  const t = v.trim()
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  return Number(t)
}
/** Value in SI base terms (s, W, J, dB, fraction), or null if the value or unit is unusable. */
export function toBase(value: string, unit: string): number | null {
  const n = num(value)
  const d = unitDef(unit)
  if (n === null) return null
  if (!d) return unit.trim() === '' ? n : null
  return n * d.factor
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))

export type Finding = { check: string; severity: 'error' | 'warning'; rows: number[]; message: string; checker: string }

export const CHECKS: { id: string; label: string; checker: string }[] = [
  { id: 'dangling', label: 'Reference to an ID that is not in the model', checker: 'Reported: FAIL “Couldn’t resolve reference …” (probe c05; listing invalid_dangling_requirement_id).' },
  { id: 'duplicate-id', label: 'Two elements share one ID', checker: 'WARNING “Duplicate of other owned member name” only when both are in the same package; silent when they sit in different packages (probes c06, c13).' },
  { id: 'unit-kind', label: 'Unit of the wrong kind for the declared quantity', checker: 'Silent: a value written with a unit of another kind (e.g. 400 [kW * h] for a PowerValue) passes with no message (probes c03, a03).' },
  { id: 'no-unit', label: 'Dimensional quantity written without a unit', checker: 'WARNING “Bound features should have conforming types” (probe c04).' },
  { id: 'doc-value', label: 'Stated value (doc, name or criterion text) differs from the modelled value', checker: 'Silent: doc text is a comment; the checker does not compare it with values (probe c12).' },
  { id: 'threshold-limit', label: 'TPM threshold differs from the limit of the requirement it measures', checker: 'Silent: nothing links the two numbers (probe c12).' },
  { id: 'criterion-limit', label: 'Verification criterion differs from the limit of the requirement it verifies', checker: 'Silent (Week 12 probe pb05/pr03 class; probe c12 here).' },
  { id: 'stale-margin', label: 'Stored margin does not equal limit − estimate', checker: 'Silent: a stored number is not recomputed; an expression would keep it current (probe c08).' },
  { id: 'satisfy-violated', label: 'Design value violates a requirement it is said to satisfy', checker: 'Silent: a satisfy is an assertion and the checker evaluates no constraint (probes a11, c07).' },
]
const checkerFor = (id: string) => CHECKS.find((c) => c.id === id)!.checker

/** Number + unit mentions in free text, e.g. "within 20 min", "5 min of pad work", "<= 65 dBA". */
export function mentions(text: string): { value: number; unit: string }[] {
  const out: { value: number; unit: string }[] = []
  const re = /(-?\d+(?:\.\d+)?)\s*\[?\s*(kW\s*[*·⋅]?\s*h|kWh|Wh|MJ|kJ|kW|MW|W|dBA|dB\(A\)|dB|min|s|h|%)(?![A-Za-z])/g
  for (const m of text.matchAll(re)) out.push({ value: Number(m[1]), unit: m[2] })
  return out
}

/** All findings for a fragment table. `knownIds` adds IDs that exist elsewhere in the model (references to them are fine). */
export function checkFragment(rows: FragmentRow[], knownIds: string[] = []): Finding[] {
  const f: Finding[] = []
  const ids = new Set([...rows.map((r) => r.id.trim()).filter(Boolean), ...knownIds])
  const add = (check: string, severity: Finding['severity'], idx: number[], message: string) => f.push({ check, severity, rows: idx, message, checker: checkerFor(check) })

  // duplicate IDs: same ID, different element names
  const names = new Map<string, Map<string, number[]>>()
  rows.forEach((r, i) => {
    const id = r.id.trim()
    if (!id) return
    const byName = names.get(id) ?? new Map<string, number[]>()
    const n = r.name.trim().toLowerCase()
    byName.set(n, [...(byName.get(n) ?? []), i])
    names.set(id, byName)
  })
  const duplicated = new Set<string>()
  for (const [id, byName] of names) if (byName.size > 1) {
    duplicated.add(id)
    add('duplicate-id', 'error', [...byName.values()].flat(), `${id} is used by ${byName.size} different elements (${[...byName.keys()].map((n) => `“${n}”`).join(', ')}). Every reference to ${id} is now ambiguous; issue a new ID (IDs are never reused).`)
  }

  rows.forEach((r, i) => {
    const ref = r.refersTo.trim()
    if (ref && !ids.has(ref)) add('dangling', 'error', [i], `${r.id} ${r.feature} refers to ${ref}, which is not in the model.`)
    if (ref && duplicated.has(ref)) add('duplicate-id', 'warning', [i], `${r.id} ${r.feature} refers to ${ref}, which two elements share: which one is meant?`)
    if (r.kind === 'none' || r.value.trim() === '') return
    const d = unitDef(r.unit)
    if (r.unit.trim() === '' && r.kind !== 'fraction') add('no-unit', 'error', [i], `${r.id} ${r.feature} = ${r.value} has no unit, but it is a ${r.kind} quantity.`)
    else if (r.unit.trim() !== '' && (!d || d.kind !== r.kind)) add('unit-kind', 'error', [i], `${r.id} ${r.feature} is a ${r.kind} quantity but is written in “${r.unit}”${d ? `, a unit of ${d.kind}` : ', an unknown unit'}.`)
    // doc / name text that states a value of the same kind
    const v = toBase(r.value, r.unit)
    if (v !== null && d && d.kind === r.kind) {
      const same = (m: { value: number; unit: string }) => unitDef(m.unit)?.kind === r.kind
      const eq = (m: { value: number; unit: string }) => close(m.value * unitDef(m.unit)!.factor, v)
      if (r.role === 'limit' || r.role === 'criterion') {
        const p = primaryMention(r.doc, r.kind)
        if (p && !eq(p)) add('doc-value', 'error', [i], `${r.id} ${r.feature} = ${r.value} ${r.unit}, but its statement says ${p.value} ${p.unit}.`)
        const n = mentions(r.name).filter(same).pop()
        if (n && !eq(n)) add('doc-value', 'error', [i], `${r.id} ${r.feature} = ${r.value} ${r.unit}, but the element’s name says ${n.value} ${n.unit}.`)
      } else {
        const ms = mentions(r.doc).filter(same)
        if (ms.length && !ms.some(eq)) add('doc-value', 'error', [i], `${r.id} ${r.feature} = ${r.value} ${r.unit}, but its text says ${ms.map((m) => `${m.value} ${m.unit}`).join(' / ')}.`)
      }
    }
  })

  // cross-row checks against the requirement a row refers to
  const limitOf = (req: string) => rows.map((r, i) => ({ r, i })).find(({ r }) => r.id.trim() === req && r.role === 'limit' && toBase(r.value, r.unit) !== null && rowKind(r) === r.kind)
  rows.forEach((r, i) => {
    const ref = r.refersTo.trim()
    if (!ref) return
    const lim = limitOf(ref)
    if (!lim) return
    const lv = toBase(lim.r.value, lim.r.unit)!
    const v = toBase(r.value, r.unit)
    if (v === null || rowKind(r) !== lim.r.kind || r.kind !== lim.r.kind) return
    if (r.role === 'threshold' && !close(v, lv)) add('threshold-limit', 'error', [i, lim.i], `${r.id} threshold ${r.value} ${r.unit} differs from ${ref}’s limit ${lim.r.value} ${lim.r.unit}.`)
    if (r.role === 'criterion' && !close(v, lv)) add('criterion-limit', 'error', [i, lim.i], `${r.id} criterion ${r.value} ${r.unit} differs from ${ref}’s limit ${lim.r.value} ${lim.r.unit}: a pass on this criterion does not show the requirement is met.`)
    if (r.role === 'design value' && lim.r.bound) {
      const bad = lim.r.bound === 'max' ? v > lv + 1e-12 : v < lv - 1e-12
      if (bad) add('satisfy-violated', 'error', [i, lim.i], `${r.id} ${r.feature} = ${r.value} ${r.unit} violates ${ref} (${lim.r.bound === 'max' ? '≤' : '≥'} ${lim.r.value} ${lim.r.unit}), which it is said to satisfy.`)
    }
  })

  // stale margins: margin row vs (limit of the measured requirement, else the TPM's own threshold) and its estimate
  const byElement = new Map<string, { r: FragmentRow; i: number }[]>()
  rows.forEach((r, i) => byElement.set(r.id.trim(), [...(byElement.get(r.id.trim()) ?? []), { r, i }]))
  for (const [id, group] of byElement) {
    const m = group.find((g) => g.r.role === 'margin')
    const est = group.find((g) => g.r.role === 'estimate')
    const thr = group.find((g) => g.r.role === 'threshold')
    if (!m || !est || !thr) continue
    const ref = thr.r.refersTo.trim()
    const lim = ref ? limitOf(ref) : undefined
    const basis = lim ?? thr
    const bound = (lim?.r.bound || thr.r.bound) as Bound
    const [mv, ev, tv] = [toBase(m.r.value, m.r.unit), toBase(est.r.value, est.r.unit), toBase(basis.r.value, basis.r.unit)]
    if (mv === null || ev === null || tv === null || !bound) continue
    const expected = bound === 'max' ? tv - ev : ev - tv
    if (!close(mv, expected)) {
      const unit = m.r.unit
      const exp = Math.round((expected / (unitDef(unit)?.factor ?? 1)) * 1e6) / 1e6
      add('stale-margin', 'error', [m.i, est.i, basis.i], `${id} margin ${m.r.value} ${unit} should be ${exp} ${unit} (${lim ? `${ref}’s limit` : 'its threshold'} ${basis.r.value} ${basis.r.unit} against the estimate ${est.r.value} ${est.r.unit}).`)
    }
  }
  return f
}

// For a limit or criterion statement the primary number is the one after "within / no more than / at least / <= / >=";
// otherwise the last mention of the row's quantity kind.
const CUE = /(within|no more than|at most|at least|not exceed|<=|>=|≤|≥)\s*(-?\d+(?:\.\d+)?)\s*\[?\s*(kW\s*[*·⋅]?\s*h|kWh|Wh|MJ|kJ|kW|MW|W|dBA|dB\(A\)|dB|min|s|h|%)(?![A-Za-z])/i
export function primaryMention(text: string, kind: QuantityKind): { value: number; unit: string } | undefined {
  const cue = text.match(CUE)
  if (cue && unitDef(cue[3])?.kind === kind) return { value: Number(cue[2]), unit: cue[3] }
  return mentions(text).filter((m) => unitDef(m.unit)?.kind === kind).pop()
}

// ------------------------------------------------------------------------------------------------
// Reference rows (AUTHORING_GUIDE §7 rule 4): every reference TPM with the limit of the requirement it measures (read
// from the requirement's recorded criterion), its threshold, estimate and margin, and the criterion of each VER of that
// requirement. The reference must pass these checks.

export function referenceFragment(m: EngineeringModel): FragmentRow[] {
  const live = new Map(m.elements.filter((e) => e.status === 'active').map((e) => [e.id, e] as const))
  const L = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  const out: FragmentRow[] = []
  for (const t of [...live.values()].filter((e) => e.kind === 'TPM').sort((a, b) => a.id.localeCompare(b.id))) {
    const unit = String(t.attributes?.unit ?? '')
    const kind = unitDef(unit)?.kind ?? 'none'
    const bound: Bound = t.attributes?.sense === 'higher-is-better' ? 'min' : 'max'
    const reqId = L.find((l) => l.source === t.id && l.type === 'measures' && kindOfId(l.target) === 'REQ')?.target
    const req = reqId ? live.get(reqId) : undefined
    if (req) {
      const pm = primaryMention(String(req.attributes?.criterion ?? ''), kind)
      if (pm) out.push(row({ id: req.id, name: req.name, feature: 'limit (recorded criterion)', role: 'limit', kind, value: String(pm.value), unit: pm.unit, bound, doc: req.text ?? '' }))
    }
    out.push(row({ id: t.id, name: t.name, feature: 'threshold', role: 'threshold', kind, value: String(t.attributes?.threshold), unit, bound, refersTo: reqId ?? '' }))
    out.push(row({ id: t.id, name: t.name, feature: 'currentEstimate', role: 'estimate', kind, value: String(t.attributes?.currentEstimate), unit }))
    out.push(row({ id: t.id, name: t.name, feature: 'margin', role: 'margin', kind, value: String(t.attributes?.margin), unit }))
    for (const v of L.filter((l) => l.type === 'verifies' && l.target === reqId).map((l) => live.get(l.source)!).sort((a, b) => a.id.localeCompare(b.id))) {
      const crit = String(v.attributes?.successCriterion ?? '')
      const pm = primaryMention(crit, kind)
      if (pm) out.push(row({ id: v.id, name: v.name, feature: 'success criterion', role: 'criterion', kind, value: String(pm.value), unit: pm.unit, bound, refersTo: reqId ?? '', doc: crit }))
    }
  }
  return out
}

// ------------------------------------------------------------------------------------------------
// The seeded fragment (the same defects as sysml/week13/aerolink_consistency_seeded.sysml) and its corrected version.

const row = (p: Partial<FragmentRow> & Pick<FragmentRow, 'id' | 'name' | 'feature' | 'role' | 'kind'>): FragmentRow => ({ value: '', unit: '', bound: '', refersTo: '', doc: '', ...p })

export const SEEDED_FRAGMENT: FragmentRow[] = [
  row({ id: 'PHY-003', name: 'Charging Systems', feature: 'ratedPower', role: 'design value', kind: 'power', value: '400', unit: 'kW * h' }),
  row({ id: 'PHY-003', name: 'Charging Systems', feature: 'chargeTimeToDispatch (MOP-002)', role: 'design value', kind: 'duration', value: '18', unit: 'min', refersTo: 'REQ-SYS-001' }),
  row({ id: 'REQ-STK-005', name: 'Hub turnaround time', feature: 'maxTurnaround', role: 'limit', kind: 'duration', value: '25', unit: 'min', bound: 'max', doc: 'The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad.' }),
  row({ id: 'REQ-STK-005', name: 'Hub turnaround time', feature: 'padWorkTime', role: 'other', kind: 'duration', value: '5', unit: 's', doc: '5 min of pad work plus the charge' }),
  row({ id: 'REQ-SYS-001', name: 'Charge to dispatch threshold in 20 min', feature: 'maxChargeTime', role: 'limit', kind: 'duration', value: '18', unit: 'min', bound: 'max', doc: 'The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min.' }),
  row({ id: 'REQ-SYS-001', name: 'Charger connection within 2 min', feature: '(new requirement, same ID)', role: 'other', kind: 'none' }),
  row({ id: 'TPM-001', name: 'Charge time to dispatch threshold', feature: 'threshold', role: 'threshold', kind: 'duration', value: '20', unit: 'min', bound: 'max', refersTo: 'REQ-SYS-001' }),
  row({ id: 'TPM-001', name: 'Charge time to dispatch threshold', feature: 'currentEstimate', role: 'estimate', kind: 'duration', value: '18', unit: 'min' }),
  row({ id: 'TPM-001', name: 'Charge time to dispatch threshold', feature: 'margin', role: 'margin', kind: 'duration', value: '2', unit: 'min' }),
]

/** One consistent repair (the reviewer's fix): new ID for the added requirement, units and statements aligned, TPM re-baselined. */
export const CORRECTED_FRAGMENT: FragmentRow[] = [
  { ...SEEDED_FRAGMENT[0], unit: 'kW' },
  SEEDED_FRAGMENT[1],
  SEEDED_FRAGMENT[2],
  { ...SEEDED_FRAGMENT[3], unit: 'min' },
  { ...SEEDED_FRAGMENT[4], name: 'Charge to dispatch threshold in 18 min', doc: 'The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 18 min.' },
  { ...SEEDED_FRAGMENT[5], id: 'REQ-SYS-012' },
  { ...SEEDED_FRAGMENT[6], value: '18' },
  SEEDED_FRAGMENT[7],
  { ...SEEDED_FRAGMENT[8], value: '0' },
]

export function findingsMarkdown(rows: FragmentRow[], findings: Finding[]): string {
  return [
    '# Consistency review of the fragment table (course teaching tool, Week 13)',
    '',
    '| # | ID | Name | Feature | Role | Value | Unit | Refers to |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map((r, i) => `| ${i + 1} | ${r.id} | ${r.name} | ${r.feature} | ${r.role}${r.bound ? ` (${r.bound})` : ''} | ${r.value} | ${r.unit} | ${r.refersTo} |`),
    '',
    findings.length ? '| Check | Severity | Rows | Finding | What the checker did with this defect (release 2026-08 probes) |' : 'No findings from these checks. That does not prove the fragment is consistent: the checks catch common defects only.',
    ...(findings.length ? ['|---|---|---|---|---|', ...findings.map((x) => `| ${x.check} | ${x.severity} | ${x.rows.map((r) => r + 1).join(', ')} | ${x.message} | ${x.checker} |`)] : []),
  ].join('\n')
}
