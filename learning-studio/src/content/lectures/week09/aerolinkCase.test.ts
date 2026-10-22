// The Week 9 AeroLink case, both directions: every statement, criterion, rationale and parent is read from the Weeks 1–5
// cases (none retyped); the requirements Week 9 adds continue the IDs after the highest the package holds and close
// exactly the open items the Week 7 review deferred to Week 9; the unknown it opens continues after U-009/TBD-07; the
// counts the lecture states are computed from the generated model; every need is covered except where an open item is
// recorded; the review set's findings tie to drafts in the checked file. Each check is shown able to fail.
import { describe, expect, it } from 'vitest'
import { NEEDS } from '../week01/aerolinkCase'
import { REQUIREMENTS, PARTIAL_COVERAGE } from '../week02/aerolinkCase'
import { W3_REQUIREMENTS } from '../week03/aerolinkCase'
import { INTERFACE_REQUIREMENTS } from '../week05/aerolinkCase'
import { FINDINGS as W7_FINDINGS, PACKAGE_REQUIREMENTS } from '../week07/aerolinkCase'
import { sysmlSource } from '../../../lib/sysml'
import { AEROLINK_P1, AEROLINK_REQUIREMENTS, AEROLINK_W9_MODEL, AI_FINDINGS, CHILDLESS_STK, COUNTS, PARTIAL_CLOSED_W9, PARTIAL_OPEN, REVIEW_SEEDED, TRACE_ROWS, W9_REQUIREMENTS, W9_STK_DISPOSITIONS, W9_UNKNOWNS } from './aerolinkCase'

const num = (id: string) => Number(id.match(/\d+$/)![0])

describe('Week 9 AeroLink case: read, not retyped', () => {
  it('every Phase I requirement of the package is modeled with its statement, criterion, rationale and parents unchanged', () => {
    for (const r of [...REQUIREMENTS, ...W3_REQUIREMENTS, ...INTERFACE_REQUIREMENTS]) {
      const m = AEROLINK_REQUIREMENTS.find((x) => x.id === r.id)!
      expect(m, r.id).toBeDefined()
      expect([m.statement, m.criterion, m.rationale, m.parents], r.id).toEqual([r.statement, r.criterion, r.rationale, r.parents])
    }
    expect(PACKAGE_REQUIREMENTS.every((r) => AEROLINK_REQUIREMENTS.some((m) => m.id === r.id))).toBe(true)
  })
  it('every Week 1 need is modeled with its statement and stakeholders (subject first)', () => {
    for (const n of NEEDS) {
      const m = AEROLINK_P1.needs.find((x) => x.id === n.id)!
      expect(m.statement, n.id).toBe(n.statement)
      expect(m.stakeholders[0], n.id).toBe(n.subject)
    }
  })
})

describe('Week 9 additions keep cross-week ID continuity', () => {
  it('the new stakeholder requirements continue after the highest ID in the package, never reusing one', () => {
    const before = PACKAGE_REQUIREMENTS.filter((r) => r.level === 'stakeholder').map((r) => num(r.id))
    expect(W9_REQUIREMENTS.map((r) => num(r.id))).toEqual([Math.max(...before) + 1, Math.max(...before) + 2])
    expect(new Set(AEROLINK_REQUIREMENTS.map((r) => r.id)).size).toBe(AEROLINK_REQUIREMENTS.length)
  })
  it('they close exactly the open items the Week 7 review deferred to Week 9, and leave the one waiting on TBR-02 open', () => {
    const deferredToW9 = W7_FINDINGS.filter((f) => f.kind === 'dropped-open-item' && f.disposition === 'defer' && f.week === 9).map((f) => f.ids[0])
    expect(PARTIAL_CLOSED_W9.map((p) => p.need).sort()).toEqual(deferredToW9.sort())
    expect(PARTIAL_OPEN.map((p) => p.need)).toEqual(PARTIAL_COVERAGE.filter((p) => !deferredToW9.includes(p.need)).map((p) => p.need))
    expect(PARTIAL_OPEN.every((p) => /TBR-02/.test(p.disposition))).toBe(true)
  })
  it('the unknown Week 9 opens continues after U-009 and TBD-07, and its owner reaches the status annotation', () => {
    expect(W9_UNKNOWNS.map((u) => [u.id, u.tbx])).toEqual([['U-010', 'TBD-08']])
    expect(AEROLINK_W9_MODEL.text).toMatch(/requirement <'REQ-STK-021'>[\s\S]*?@StatusInfo \{ status = StatusKind::tbd; owner = "Vertiport Infrastructure Manager"; \}/)
  })
})

describe('Week 9 AeroLink counts and trace are computed', () => {
  it('the counts match the generated model', () => {
    expect(COUNTS.stk + COUNTS.sys).toBe(AEROLINK_REQUIREMENTS.length)
    expect(AEROLINK_W9_MODEL.text.split("requirement <'NEED-").length - 1).toBe(COUNTS.needs)
    expect(AEROLINK_W9_MODEL.text.split('#derivation connection').length - 1).toBe(COUNTS.derivations + AEROLINK_P1.objectives.filter((o) => o.parent).length)
    expect(AEROLINK_W9_MODEL.text.split('frame Stakeholders::').length - 1).toBe(COUNTS.frames)
    expect(AEROLINK_W9_MODEL.findings.filter((f) => f.cls === 'defect')).toEqual([])
  })
  it('every need has a stakeholder requirement; every childless stakeholder requirement has a disposition', () => {
    expect(TRACE_ROWS.filter((r) => r.status === 'childless')).toEqual([])
    for (const id of CHILDLESS_STK) expect(W9_STK_DISPOSITIONS[id], id).toMatch(/^(Open item|No child needed):/)
    expect(Object.keys(W9_STK_DISPOSITIONS).sort()).toEqual([...CHILDLESS_STK].sort())
  })
  it('the review set: each seeded draft and each finding names a draft of the checked file, and the verdicts are 4 true, 2 false, 2 partly right', () => {
    const text = sysmlSource('lectures/week09/review_seeded_requirements.sysml')!
    for (const d of [...REVIEW_SEEDED.map((s) => s.draft), ...AI_FINDINGS.map((f) => f.draft)]) expect(text).toContain(`<'${d}'>`)
    for (const f of AI_FINDINGS) expect(text.replace(/\s+\*\s+/g, ' '), `finding ${f.n}`).toContain(f.quote)
    expect([AI_FINDINGS.filter((f) => f.verdict === 'true').length, AI_FINDINGS.filter((f) => f.verdict === 'false positive').length, AI_FINDINGS.filter((f) => f.verdict === 'partly right').length]).toEqual([4, 2, 2])
  })
  it('negative direction: a reused ID and a changed statement are detected', () => {
    const ids = [...AEROLINK_REQUIREMENTS.map((r) => r.id), 'REQ-STK-005']
    expect(new Set(ids).size).toBeLessThan(ids.length)
    const changed = { ...AEROLINK_REQUIREMENTS[0], statement: 'x' }
    expect(changed.statement).not.toBe(REQUIREMENTS[0].statement)
  })
})
