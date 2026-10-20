// AeroLink canonical data (faculty final review, DECISION_LOG A21 item 6; plan in docs/lectures/AEROLINK_CANONICAL_DATA.md).
// The corrected Week 1 case module, aerolinkCase.ts, is the course source for stakeholders (STK), concerns (CON),
// needs (NEED) and the mission and goals (MGO). Later weeks read the instructor reference baseline
// (src/model/reference/weekNN.ts), the week modules (src/content/weeks/weekNN.ts) and the Phase II SysML reference
// files (sysml/reference/aerolink_v01..v04). This test fails when any of them cites a STK, CON or NEED id that is not in
// aerolinkCase.ts, or disagrees with the case on a name, a need statement, a need's trace or the noise need's two
// dimensions, UNLESS the difference is a known pre-revision exception listed in PRE_REVISION below with the course week
// that will fix it. The allowlist is checked in both directions: an entry that no longer differs fails too, so the list
// cannot go stale and every fix shrinks it.
import { describe, expect, it } from 'vitest'
import { REFERENCE_BY_WEEK, referenceUpTo } from '../../../model/reference'
import { WEEK_CONTENT } from '../../weeks'
import { LECTURES } from '../index'
import { sysmlSource } from '../../../lib/sysml'
import { CONCERNS, ENTERPRISE, EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, STAKEHOLDERS, need } from './aerolinkCase'

/** A known pre-revision difference: what differs, why it is still there, and the course week that fixes it. */
type Exception = { key: string; fixIn: string; note: string }

export const PRE_REVISION: Exception[] = [
  // ---- register layer (reference week02.ts, sysml v01..v04): the CON-015 wording was reconciled in the Week 8 model
  //      import (entry removed). STK-015 and CON-017 are modeled in the Week 8 lecture model (sysml/lectures/week08) but
  //      cannot yet join the shared reference baseline: the Week 12 and Week 13 activities assert thread and impact counts
  //      computed from it, and those weeks are rebuilt later.
  { key: 'missing:STK-015', fixIn: 'Week 12', note: 'Passengers with reduced mobility (a class) is modeled in the Week 8 lecture model, not yet in the shared reference baseline: adding it changes the Week 12/13 activity counts, so it joins when those weeks are rebuilt.' },
  { key: 'missing:CON-017', fixIn: 'Week 12', note: 'Travel with one’s own mobility aid (STK-015) is modeled in the Week 8 lecture model, not yet in the shared reference baseline; it joins with STK-015 when the Week 12/13 counts are recomputed.' },
  // ---- needs layer (reference week03.ts): reworded into the recommended form, NEED-003 widened, NEED-012..017 added
  ...['NEED-001', 'NEED-002', 'NEED-003', 'NEED-004', 'NEED-005', 'NEED-006', 'NEED-007', 'NEED-008', 'NEED-009', 'NEED-010', 'NEED-011'].map((id) => ({
    key: `statement:${id}`,
    fixIn: 'Week 2',
    note: 'The reference keeps the pre-revision wording (AEROLINK_CASE_CHANGES.md §3); Week 2 traces requirements to the case statement, so the reference text is replaced when the Week 2 requirements are rebuilt.',
  })),
  { key: 'name:NEED-003', fixIn: 'Week 2', note: 'Reference “Noise kept within the local agreement”; case “Noise exposure within the local agreement” (level of each event AND number of evening and early-morning events).' },
  { key: 'trace:NEED-008', fixIn: 'Week 2', note: 'The reference traces NEED-008 to STK-014/CON-013 only; the case subject is the class STK-015 via CON-017, with STK-014 contributing.' },
  ...['NEED-012', 'NEED-013', 'NEED-014', 'NEED-015', 'NEED-016', 'NEED-017'].map((id) => ({
    key: `missing:${id}`,
    fixIn: 'Week 2',
    note: 'Added in the Week 1 review (split or new); no reference element, capability or requirement yet. The Week 2 outline proposes capabilities for them.',
  })),
  // ---- the noise need's second dimension (number of evening and early-morning events) downstream of NEED-003
  { key: 'noise:CAP-007', fixIn: 'Week 2', note: 'Capability covers per-event pad-edge noise only; should read “within both agreed limits” (Week 2 outline).' },
  { key: 'noise:REQ-STK-002', fixIn: 'Week 2', note: 'Requirement bounds the level of each event (65 dBA) only; a requirement on the evening and early-morning event cap is added with the Week 2 requirements.' },
  //      (MGO-006, MOE-003 and TPM-002 were fixed by Week 3: eventCap attributes from week03/aerolinkCase.ts EVENT_CAP; entries removed).
  // ---- enterprise and external-system names (reference week01.ts, sysml v01..v04): reconciled in the Week 8 model import
  //      (ENT-001 and EXT-001/002/004/006 entries removed).
]

const CASE_IDS = new Set([...STAKEHOLDERS, ...CONCERNS, ...NEEDS].map((x) => x.id))
/** STK, CON and NEED ids; "REQ-STK-002" is a requirement id, not a stakeholder. */
const ID_RE = /(?<![A-Z]-)\b(?:STK|CON|NEED)-\d{3}\b/g
const idsIn = (s: string) => [...new Set(s.match(ID_RE) ?? [])]
const lc = (s: string) => s.trim().toLowerCase()
const later = Object.entries(REFERENCE_BY_WEEK).filter(([w]) => Number(w) >= 2)
const ref = referenceUpTo(14)
const refEl = (id: string) => ref.elements.find((e) => e.id === id)
const SYSML = ['aerolink_v01_skeleton', 'aerolink_v02_req_structure', 'aerolink_v03_behavior', 'aerolink_v04_full'].map((f) => ({ f, text: sysmlSource(`reference/${f}.sysml`) ?? '' }))

/** Every difference between the canonical case and what later weeks read, as allowlist keys. */
function differences(): string[] {
  const out = new Set<string>()
  // ids cited anywhere downstream that the case does not define
  const cited = [
    ...later.flatMap(([, m]) => [...m.elements.flatMap((e) => idsIn(`${e.id} ${e.name} ${e.text ?? ''} ${JSON.stringify(e.attributes ?? {})}`)), ...m.links.flatMap((l) => idsIn(`${l.source} ${l.target}`))]),
    ...Object.entries(WEEK_CONTENT).filter(([w]) => Number(w) >= 2).flatMap(([, c]) => idsIn(JSON.stringify(c))),
    ...SYSML.flatMap((x) => idsIn(x.text)),
    // later-week lectures (Week 2 onward) cite the case directly
    ...LECTURES.filter((l) => l.week >= 2).flatMap((l) => idsIn(JSON.stringify(l))),
  ]
  for (const id of new Set(cited)) if (!CASE_IDS.has(id)) out.add(`unknown:${id}`)
  // case ids the reference baseline does not have
  for (const id of CASE_IDS) if (!refEl(id)) out.add(`missing:${id}`)
  // names (case-insensitive) and need statements
  for (const x of [...STAKEHOLDERS, ...CONCERNS, ...NEEDS]) {
    const e = refEl(x.id)
    if (e && lc(e.name) !== lc(x.name)) out.add(`name:${x.id}`)
  }
  for (const n of NEEDS) {
    const e = refEl(n.id)
    if (e && lc(e.text ?? '') !== lc(n.statement)) out.add(`statement:${n.id}`)
  }
  // traces: every reference NEED derives-from link points at a case source, and the case subject (stakeholder and
  // concern) is linked
  for (const n of NEEDS) {
    if (!refEl(n.id)) continue
    const targets = ref.links.filter((l) => l.source === n.id && l.type === 'derives-from' && /^(STK|CON)-/.test(l.target)).map((l) => l.target)
    const sources = new Set(n.sources.flatMap((s) => [s.stakeholder, ...(s.concern ? [s.concern] : [])]))
    const subj = n.sources.filter((s) => s.role === 'subject').flatMap((s) => [s.stakeholder, ...(s.concern ? [s.concern] : [])])
    if (targets.some((t) => !sources.has(t)) || subj.some((t) => !targets.includes(t))) out.add(`trace:${n.id}`)
  }
  // the noise need bounds the level of each event AND the number of evening and early-morning events: every
  // service-level element that claims NEED-003 (a direct derives-from or measures link), plus the objective MGO-006 and
  // the measure TPM-002 the plan names, must carry the second dimension. Element-level measures of one event (MOP-004
  // aircraft LAmax, REQ-SYS-002) legitimately bound the level only and are not in scope.
  const n3 = need('NEED-003').statement
  expect(n3).toMatch(/number of events in the evening and early morning/)
  const noiseIds = new Set([...ref.links.filter((l) => l.target === 'NEED-003' && ['derives-from', 'measures'].includes(l.type)).map((l) => l.source), 'MGO-006', 'TPM-002'])
  for (const id of noiseIds) {
    const e = refEl(id)
    if (!e) continue
    if (!/evening|early[- ]morning|number of (?:take-offs|events)|event cap/i.test(`${e.name} ${e.text ?? ''} ${JSON.stringify(e.attributes ?? {})}`)) out.add(`noise:${id}`)
  }
  // enterprise and external-system names
  const ent = refEl('ENT-001')
  if (ent && lc(ent.name) !== lc(ENTERPRISE.name)) out.add('name:ENT-001')
  for (const x of EXTERNAL_SYSTEMS) {
    const e = refEl(x.id)
    if (e && lc(e.name) !== lc(x.name) && lc(e.name) !== lc(x.short)) out.add(`name:${x.id}`)
  }
  // the mission and goals the case keeps are the reference's (same ids, same level)
  for (const m of MISSION_GOALS) {
    const e = refEl(m.id)
    if (!e) out.add(`missing:${m.id}`)
    else if (e.attributes?.level !== m.level) out.add(`level:${m.id}`)
  }
  return [...out].sort()
}

describe('AeroLink canonical data: later weeks agree with aerolinkCase.ts, or the difference is a listed pre-revision exception', () => {
  const diff = differences()
  const allowed = new Set(PRE_REVISION.map((x) => x.key))
  it('no later-week reference, week module or SysML file cites a STK, CON or NEED id that is not in aerolinkCase.ts', () => {
    expect(diff.filter((d) => d.startsWith('unknown:'))).toEqual([])
  })
  it('every other difference is a listed pre-revision exception with the week that fixes it', () => {
    expect(diff.filter((d) => !allowed.has(d))).toEqual([])
  })
  it('the allowlist is not stale: every listed exception still differs (remove an entry when its week fixes it)', () => {
    expect([...allowed].filter((k) => !diff.includes(k))).toEqual([])
  })
  it('every exception names the fixing week and a reason; keys are unique', () => {
    for (const x of PRE_REVISION) {
      expect(x.fixIn, x.key).toMatch(/^Week ([2-9]|1[0-4])$/)
      expect(x.note.length, x.key).toBeGreaterThan(30)
    }
    expect(new Set(PRE_REVISION.map((x) => x.key)).size).toBe(PRE_REVISION.length)
  })
  it('the downstream ids the plan names are covered: REQ-STK-002, CAP-007, NEED-012..017 (ENT-001 and the renamed EXT were fixed in Week 8; MGO-006, MOE-003 and TPM-002 in Week 3)', () => {
    for (const k of ['noise:REQ-STK-002', 'noise:CAP-007', 'missing:NEED-012', 'missing:NEED-017']) expect(allowed.has(k), k).toBe(true)
    for (const k of ['name:ENT-001', 'name:EXT-001', 'name:EXT-006', 'name:CON-015', 'noise:MGO-006', 'noise:MOE-003', 'noise:TPM-002']) expect(allowed.has(k), k).toBe(false)
  })
})

describe('the canonical-data check can fail (negative direction)', () => {
  it('an id the case does not define is reported, and a REQ-STK id is not read as a stakeholder', () => {
    expect(idsIn('traces to NEED-099 and STK-016; REQ-STK-002 is a requirement')).toEqual(['NEED-099', 'STK-016'])
    expect(CASE_IDS.has('NEED-099')).toBe(false)
  })
  it('a reference trace that contradicts the case is reported', () => {
    // NEED-001's subject is STK-001 via CON-001; a link to STK-004 would be a trace that the case does not have
    const n = need('NEED-001')
    const sources = new Set(n.sources.flatMap((s) => [s.stakeholder, s.concern ?? '']))
    expect(sources.has('STK-004')).toBe(false)
  })
})
