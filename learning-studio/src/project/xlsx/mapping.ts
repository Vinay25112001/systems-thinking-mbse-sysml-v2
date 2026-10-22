// Column mapping for the stakeholder import (directive §13 steps 6–9; spec §j.2). Deterministic heuristics first:
//   1 normalise headers; 2 synonym dictionary per field (exact → High); 3 significant-token overlap → Medium;
//   4 value pattern only → Low, offered as a suggestion and never pre-selected; 5 two columns for one field, or one
//   column for two fields → "Ambiguous: choose one", nothing selected; the student corrects every mapping (recorded).
// AI is only an optional provider interface (ai.ts), disabled: no data leaves the machine.
import { ROLES, STAGES } from '../../workbench/week1/stakeholders'

export type ImportField = 'name' | 'role' | 'stage' | 'side' | 'approving' | 'concerns' | 'interest' | 'interestReason' | 'influence' | 'influenceReason' | 'support' | 'notes'
export const IMPORT_FIELDS: ImportField[] = ['name', 'role', 'stage', 'side', 'approving', 'concerns', 'interest', 'interestReason', 'influence', 'influenceReason', 'support', 'notes']
export const FIELD_LABEL: Record<ImportField, string> = {
  name: 'Stakeholder name',
  role: 'Role group',
  stage: 'Life-cycle stage',
  side: 'Internal or external',
  approving: 'Approving authority',
  concerns: 'Concern(s)',
  interest: 'Level of interest (1–5)',
  interestReason: 'Reason for the interest',
  influence: 'Influence (1–5)',
  influenceReason: 'Reason for the influence',
  support: 'Support (1–4)',
  notes: 'Notes',
}
/** Required to import a row at all; required by the course (A25), flagged missing when absent; recommended. */
export const REQUIRED_FIELDS: ImportField[] = ['name']
export const COURSE_REQUIRED: ImportField[] = ['interest', 'interestReason']
export const RECOMMENDED_FIELDS: ImportField[] = ['role', 'concerns']

export type Confidence = 'high' | 'medium' | 'low' | 'none'
export const CONFIDENCE_LABEL: Record<Confidence, string> = { high: 'High', medium: 'Medium', low: 'Low', none: 'Not mapped' }

const SYNONYMS: Record<ImportField, string[]> = {
  name: ['stakeholder', 'stakeholder name', 'name', 'party', 'organisation', 'organization', 'group', 'who'],
  role: ['role', 'role group', 'category', 'class', 'classification', 'type of stakeholder', 'stakeholder type', 'stakeholder category'],
  stage: ['life cycle stage', 'lifecycle stage', 'stage', 'phase', 'life cycle phase'],
  side: ['internal external', 'internal or external', 'internal', 'external', 'side'],
  approving: ['approving authority', 'approver', 'approves', 'authority', 'approving'],
  concerns: ['concern', 'issue', 'worry', 'concern text'],
  interest: ['interest', 'interest level', 'interest rating', 'level of interest'],
  interestReason: ['interest reason', 'reason for interest', 'interest rationale', 'why interested', 'reason for the interest'],
  influence: ['influence', 'power', 'influence level', 'influence rating', 'level of influence'],
  influenceReason: ['influence reason', 'reason for influence', 'influence rationale', 'reason for the influence'],
  support: ['support', 'attitude', 'commitment', 'support level'],
  notes: ['note', 'comment', 'description', 'remark'],
}
/** Synonyms that point to a field only with medium confidence (they are ambiguous on their own). */
const MEDIUM_SYNONYMS: { header: string; fields: ImportField[]; why: string }[] = [
  { header: 'interest area', fields: ['concerns'], why: '“interest area” usually lists concerns, but “interest” is also the rating' },
  { header: 'reason', fields: ['interestReason', 'influenceReason'], why: 'a plain “reason” may explain the interest or the influence' },
  { header: 'rationale', fields: ['interestReason', 'influenceReason'], why: 'a plain “rationale” may explain the interest or the influence' },
  { header: 'justification', fields: ['interestReason', 'influenceReason'], why: 'a plain “justification” may explain the interest or the influence' },
  { header: 'why', fields: ['interestReason', 'influenceReason'], why: 'a plain “why” may explain the interest or the influence' },
]
const STOP = new Set(['the', 'of', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'level', 'stakeholder', 'rating', 'score', 'text', 'type'])

/** Lower-case, units and bracketed text removed, punctuation to spaces, collapsed, each word singular. */
export function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
    .join(' ')
}
const NORM_SYN: Record<ImportField, string[]> = Object.fromEntries(IMPORT_FIELDS.map((f) => [f, SYNONYMS[f].map(normalizeHeader)])) as Record<ImportField, string[]>
const tokens = (s: string) => s.split(' ').filter((t) => t && !STOP.has(t))

export type Candidate = { field: ImportField; confidence: Exclude<Confidence, 'none'>; reason: string; source: 'heuristic' | 'ai' }
export type ColumnMapping = {
  index: number
  header: string
  samples: string[]
  candidates: Candidate[]
  /** The field selected for import (null = will not be imported). */
  selected: ImportField | null
  confidence: Confidence
  reason: string
  /** Fields this column was ambiguous between, when nothing could be selected automatically. */
  ambiguous: ImportField[]
  correctedByStudent: boolean
}

// ------------------------------------------------------------------------------------------- value patterns
const ROLE_SYNONYMS: Record<string, string> = {
  user: 'user', users: 'user', 'end user': 'user', 'end users': 'user', operator: 'user', operators: 'user', 'user or operator': 'user',
  customer: 'customer', customers: 'customer', sponsor: 'customer', funder: 'customer', funders: 'customer', acquirer: 'customer', buyer: 'customer', client: 'customer', investor: 'customer', investors: 'customer', 'customer acquirer or funder': 'customer',
  authority: 'authority', regulator: 'authority', regulators: 'authority', 'approving authority': 'authority', 'regulatory authority': 'authority', 'approving or regulatory authority': 'authority', government: 'authority',
  supplier: 'supplier', suppliers: 'supplier', vendor: 'supplier', partner: 'supplier', 'enabling system owner': 'supplier', 'supplier or owner of an enabling or external system': 'supplier',
  maintainer: 'maintainer', maintainers: 'maintainer', maintenance: 'maintainer', support: 'maintainer', 'maintainer or support': 'maintainer',
  public: 'public', 'affected public': 'public', community: 'public', communities: 'public', residents: 'public', resident: 'public', neighbours: 'public', neighbors: 'public',
}
const STAGE_SYNONYMS: Record<string, (typeof STAGES)[number]> = {
  concept: 'Concept', 'concept stage': 'Concept',
  development: 'Development', design: 'Development',
  production: 'Production, integration, verification and validation', integration: 'Production, integration, verification and validation', 'verification and validation': 'Production, integration, verification and validation', 'production integration v v': 'Production, integration, verification and validation', 'production integration verification and validation': 'Production, integration, verification and validation',
  operation: 'Operation', operations: 'Operation', use: 'Operation', utilization: 'Operation', utilisation: 'Operation',
  'logistics and maintenance': 'Logistics and maintenance', maintenance: 'Logistics and maintenance', support: 'Logistics and maintenance', logistics: 'Logistics and maintenance',
  disposal: 'Disposal', retirement: 'Disposal',
}
const key = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export type Normalized = { value: string; ok: true } | { value: ''; ok: false; reason: string }
const bad = (raw: string, what: string): Normalized => ({ value: '', ok: false, reason: `“${raw}” is not a recognised ${what}; left empty for you to choose` })

/** Normalises an enumeration or rating value by the synonym tables. An unrecognised value is flagged and left empty,
 *  never guessed (spec §j.1 X4). An empty cell stays empty (ok). */
export function normalizeValue(field: ImportField, raw: string): Normalized {
  const v = raw.trim()
  if (!v) return { value: '', ok: true }
  const k = key(v)
  switch (field) {
    case 'role': {
      const byLabel = ROLES.find((r) => key(r.label) === k || r.id === k)
      const id = byLabel?.id ?? ROLE_SYNONYMS[k]
      return id ? { value: id, ok: true } : bad(v, 'role group')
    }
    case 'stage': {
      const exact = STAGES.find((s) => key(s) === k)
      const st = exact ?? STAGE_SYNONYMS[k]
      return st ? { value: st, ok: true } : bad(v, 'life-cycle stage')
    }
    case 'side': {
      if (/^(internal|int|inside|in)$/.test(k)) return { value: 'internal', ok: true }
      if (/^(external|ext|outside|out)$/.test(k)) return { value: 'external', ok: true }
      return bad(v, 'side (internal or external)')
    }
    case 'approving': {
      if (/^(yes|y|true|x|1|approving|approver)$/.test(k)) return { value: 'yes', ok: true }
      if (/^(no|n|false|0)$/.test(k)) return { value: 'no', ok: true }
      return bad(v, 'yes or no')
    }
    case 'interest':
    case 'influence': {
      const m = /^([1-5])(?:\.0+)?$/.exec(v)
      return m ? { value: m[1], ok: true } : bad(v, 'rating from 1 to 5')
    }
    case 'support': {
      const m = /^([1-4])(?:\.0+)?$/.exec(v)
      if (m) return { value: m[1], ok: true }
      const word: Record<string, string> = { awareness: '1', aware: '1', understanding: '2', 'buy in': '3', buyin: '3', commitment: '4', committed: '4' }
      return word[k] ? { value: word[k], ok: true } : bad(v, 'support level from 1 to 4')
    }
    default:
      return { value: v, ok: true }
  }
}

function patternField(values: string[]): Candidate | null {
  const vs = values.map((x) => x.trim()).filter(Boolean)
  if (vs.length < 2) return null
  const all = (re: RegExp) => vs.every((x) => re.test(x))
  if (all(/^[1-5](\.0+)?$/)) return { field: 'interest', confidence: 'low', reason: 'every value is a whole number from 1 to 5 (a rating: interest, influence or support?)', source: 'heuristic' }
  if (all(/^(yes|no|y|n|true|false)$/i)) return { field: 'approving', confidence: 'low', reason: 'every value is yes or no', source: 'heuristic' }
  if (all(/^(internal|external)$/i)) return { field: 'side', confidence: 'low', reason: 'every value is internal or external', source: 'heuristic' }
  if (vs.every((x) => normalizeValue('role', x).ok)) return { field: 'role', confidence: 'low', reason: 'the values match the role groups', source: 'heuristic' }
  return null
}

/** Proposes a mapping for every column of a header row and its data rows. */
export function proposeMapping(header: string[], dataRows: string[][]): ColumnMapping[] {
  const cols: ColumnMapping[] = header.map((h, index) => {
    const n = normalizeHeader(h)
    const values = dataRows.map((r) => r[index] ?? '')
    const samples = values.filter((x) => x.trim()).slice(0, 3)
    const candidates: Candidate[] = []
    if (n) {
      for (const f of IMPORT_FIELDS) if (NORM_SYN[f].includes(n)) candidates.push({ field: f, confidence: 'high', reason: `header “${h}” matches “${f === 'name' ? 'name' : FIELD_LABEL[f].toLowerCase()}”`, source: 'heuristic' })
      if (!candidates.length) {
        const med = MEDIUM_SYNONYMS.find((m) => normalizeHeader(m.header) === n)
        if (med) for (const f of med.fields) candidates.push({ field: f, confidence: 'medium', reason: med.why, source: 'heuristic' })
      }
      if (!candidates.length) {
        const ts = new Set(tokens(n))
        const scored = IMPORT_FIELDS.map((f) => ({ f, score: Math.max(0, ...NORM_SYN[f].map((s) => tokens(s).filter((t) => ts.has(t)).length)) })).filter((x) => x.score > 0)
        const best = Math.max(0, ...scored.map((x) => x.score))
        for (const x of scored.filter((y) => y.score === best)) candidates.push({ field: x.f, confidence: 'medium', reason: `header “${h}” shares the word${best > 1 ? 's' : ''} ${[...ts].filter((t) => NORM_SYN[x.f].some((s) => tokens(s).includes(t))).map((t) => `“${t}”`).join(', ')} with “${FIELD_LABEL[x.f].toLowerCase()}”`, source: 'heuristic' })
      }
    }
    if (!candidates.length) {
      const p = patternField(values)
      if (p) candidates.push(p)
    }
    return { index, header: h, samples, candidates, selected: null, confidence: 'none' as Confidence, reason: candidates.length ? '' : n ? `no field matches the header “${h}”` : 'the column has no header', ambiguous: [], correctedByStudent: false }
  })
  // plain "reason": resolved by the rating columns present (interest only → its reason; influence only → its reason)
  const has = (f: ImportField) => cols.some((c) => c.candidates.some((x) => x.field === f && x.confidence === 'high'))
  for (const c of cols) {
    const fs = c.candidates.map((x) => x.field)
    if (c.candidates.length === 2 && fs.includes('interestReason') && fs.includes('influenceReason')) {
      if (has('interest') && !has('influence')) c.candidates = c.candidates.filter((x) => x.field === 'interestReason').map((x) => ({ ...x, reason: `${x.reason}; the sheet rates interest only, so it explains the interest` }))
      else if (has('influence') && !has('interest')) c.candidates = c.candidates.filter((x) => x.field === 'influenceReason').map((x) => ({ ...x, reason: `${x.reason}; the sheet rates influence only, so it explains the influence` }))
    }
  }
  // selection: one field per column, one column per field, only high/medium; ties are ambiguous
  const rank: Record<string, number> = { high: 3, medium: 2, low: 1 }
  for (const c of cols) {
    const top = c.candidates.filter((x) => x.confidence !== 'low')
    if (top.length === 1) {
      c.selected = top[0].field
      c.confidence = top[0].confidence
      c.reason = top[0].reason
    } else if (top.length > 1) {
      c.ambiguous = top.map((x) => x.field)
      c.reason = `Ambiguous: choose one (${top.map((x) => FIELD_LABEL[x.field]).join(' or ')}). ${top[0].reason}`
    } else if (c.candidates.length) {
      c.confidence = 'none'
      c.reason = `Suggestion only (${CONFIDENCE_LABEL.low.toLowerCase()} confidence): ${c.candidates[0].reason}. Choose the field yourself.`
    }
  }
  for (const f of IMPORT_FIELDS) {
    const claim = cols.filter((c) => c.selected === f)
    if (claim.length < 2) continue
    const best = Math.max(...claim.map((c) => rank[c.confidence] ?? 0))
    const winners = claim.filter((c) => rank[c.confidence] === best)
    for (const c of claim) {
      if (winners.length === 1 && c === winners[0]) continue
      c.ambiguous = [f]
      c.reason = winners.length > 1 ? `Ambiguous: ${winners.length} columns match ${FIELD_LABEL[f]}; choose one.` : `Not selected: column “${winners[0].header}” matches ${FIELD_LABEL[f]} better.`
      c.selected = null
      c.confidence = 'none'
    }
  }
  return cols
}

/** The student's correction of one column (recorded; a field already taken by another column is released there). */
export function correctMapping(cols: ColumnMapping[], index: number, field: ImportField | null): ColumnMapping[] {
  return cols.map((c) => {
    if (c.index === index) return { ...c, selected: field, confidence: field ? 'high' : 'none', reason: field ? `chosen by you: ${FIELD_LABEL[field]}` : 'will not be imported (your choice)', ambiguous: [], correctedByStudent: true }
    if (field && c.selected === field) return { ...c, selected: null, confidence: 'none', reason: `released: you mapped column “${cols[index]?.header ?? ''}” to ${FIELD_LABEL[field]}`, correctedByStudent: true }
    return c
  })
}

export type MappingSummary = { missingRequired: ImportField[]; missingCourse: ImportField[]; missingRecommended: ImportField[]; ambiguous: ColumnMapping[]; unmapped: ColumnMapping[] }
export function mappingSummary(cols: ColumnMapping[]): MappingSummary {
  const mapped = new Set(cols.map((c) => c.selected).filter(Boolean))
  return {
    missingRequired: REQUIRED_FIELDS.filter((f) => !mapped.has(f)),
    missingCourse: COURSE_REQUIRED.filter((f) => !mapped.has(f)),
    missingRecommended: RECOMMENDED_FIELDS.filter((f) => !mapped.has(f)),
    ambiguous: cols.filter((c) => !c.selected && c.ambiguous.length),
    unmapped: cols.filter((c) => !c.selected),
  }
}

/** The sheet whose header row matches the most fields (ties: the first sheet), for the "Suggested" mark. */
export function suggestSheet(sheets: { name: string; rows: string[][] }[]): number {
  let best = 0
  let bestScore = -1
  sheets.forEach((s, i) => {
    const cols = proposeMapping(s.rows[0] ?? [], s.rows.slice(1, 11))
    const score = cols.filter((c) => c.selected).length * 2 + (cols.some((c) => c.selected === 'name') ? 5 : 0)
    if (score > bestScore) {
      best = i
      bestScore = score
    }
  })
  return best
}
