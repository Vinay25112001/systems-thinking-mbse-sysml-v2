// The Week 7 AeroLink case: every count, coverage figure, finding, thread hop and RID is computed from the Weeks 1–6 cases
// and holds; every ID it cites exists; the package rule is applied as the lesson states it; the case passes the package
// tool's own gates where the tool's rules apply to it. Each property is shown able to fail (negative directions).
import { describe, expect, it } from 'vitest'
import { NEEDS } from '../week01/aerolinkCase'
import { PARTIAL_COVERAGE, STK_DISPOSITIONS, STK_DISPOSITION_FORM } from '../week02/aerolinkCase'
import { DECISION } from '../week03/aerolinkCase'
import { FUNCTIONS, PHYSICAL } from '../week04/aerolinkCase'
import { INTERFACES } from '../week05/aerolinkCase'
import { BASELINE_REVIEW, INCREMENTS, KNOWN_UNKNOWNS } from '../week06/aerolinkCase'
import { said } from '../../../workbench/emptyAnswer'
import { assessFinding } from '../../../workbench/week7/record'
import {
  AUDIT, COVERAGE, DRIVING_QUESTION, EARLIER_OPEN_ITEMS, dropText, EXEC_SUMMARY, FINDINGS, KNOWN_IDS, PACKAGE_INDEX, PACKAGE_REQUIREMENTS, RIDS, RID_COUNTS, THREAD, THREAD_START, WEEK_OWNED_ITEMS, coverage, needCovered, phyConnected, stkFlowed, sysAllocated, threadFrom,
} from './aerolinkCase'
import { PACKAGE_SECTIONS, RID_DISPOSITIONS, SEVERITIES, reviewPlan } from './labBrief'

const ID = /\b(?:REQ-(?:STK|SYS)|NEED|STK|CON|MGO|SCN|CAP|MOE|MOP|TPM|TECH|R|O|A|U|FN|LOG|PHY|EXT|DEC|INFO|AI|CMP|IF|ICR|GAP|INC)-\d{3}\b/g

describe('Week 7 AeroLink case: the package index and coverage', () => {
  it('the index has one entry per package section, and the Weeks 1–6 sections carry counts', () => {
    expect(PACKAGE_INDEX.map((s) => s.section)).toEqual(PACKAGE_SECTIONS.map((s) => s.id))
    for (const s of PACKAGE_INDEX.filter((x) => x.week < 7)) expect(s.items.length, s.section).toBeGreaterThan(0)
    expect(PACKAGE_INDEX.find((s) => s.section === 'stakeholders')!.items.find((i) => i.kind.startsWith('needs'))!.count).toBe(NEEDS.length)
  })
  it('coverage is recomputed from the package rule and matches the case', () => {
    const needs = NEEDS.filter((n) => needCovered(n.id)).length
    expect(coverage('need-req').covered).toBe(needs)
    expect(coverage('arch-if').covered).toBe(PHYSICAL.filter((p) => phyConnected(p.id)).length)
    for (const c of COVERAGE) {
      expect(c.covered + c.uncovered.length, c.layer).toBe(c.total)
      expect(c.pct, c.layer).toBe(c.total ? Math.round((c.covered / c.total) * 100) : 100)
    }
  })
  it('the package rule reads every week: NEED-011, childless in Week 2, is covered by the Week 3 requirements', () => {
    expect(needCovered('NEED-011')).toBe(true)
    expect(PACKAGE_REQUIREMENTS.filter((r) => r.parents.includes('NEED-011')).every((r) => r.week === 3)).toBe(true)
  })
  it('a stakeholder requirement carried directly by a function counts as flowed down; an interface requirement counts as allocated', () => {
    const direct = FUNCTIONS.flatMap((f) => f.requirements).find((id) => id.startsWith('REQ-STK-'))!
    expect(stkFlowed(direct)).toBe(true)
    const ifReq = PACKAGE_REQUIREMENTS.find((r) => r.interface)!
    expect(sysAllocated(ifReq.id)).toBe(true)
    expect(INTERFACES.some((x) => x.id === ifReq.interface)).toBe(true)
  })
  it('negative direction: an unknown requirement is neither flowed nor allocated; a need no requirement names is not covered', () => {
    expect(stkFlowed('REQ-STK-999')).toBe(false)
    expect(sysAllocated('REQ-SYS-999')).toBe(false)
    expect(needCovered('NEED-999')).toBe(false)
  })
})

describe('Week 7 AeroLink case: the audit findings', () => {
  it('every finding has a disposition that would pass the package tool’s gates (reason said; owner said when deferred)', () => {
    for (const f of FINDINGS) {
      expect(['record', 'defer'], f.id).toContain(f.disposition)
      expect(said(f.reason), `${f.id} reason`).toBe(true)
      if (f.disposition === 'defer') expect(said(f.owner ?? ''), `${f.id} owner`).toBe(true)
    }
  })
  it('every uncovered item of the traceability layers is a finding, and every open item of the Week 6 review is carried', () => {
    const findingIds = new Set(FINDINGS.flatMap((f) => f.ids))
    for (const c of COVERAGE) for (const id of c.uncovered) expect(findingIds.has(id), `${c.layer} ${id}`).toBe(true)
    expect(AUDIT.openItems).toBe(BASELINE_REVIEW.reduce((a, r) => a + r.items.length, 0))
  })
  it('the stale dispositions are exactly the Week 2 open items a later week closed, plus the deliberately childless need', () => {
    const staleStk = Object.keys(STK_DISPOSITIONS).filter((id) => STK_DISPOSITION_FORM[id] === 'open' && stkFlowed(id))
    const stale = FINDINGS.filter((f) => f.kind === 'stale-disposition')
    expect(stale.length).toBe(staleStk.length + 1)
    expect(stale.map((f) => f.ids[0])).toEqual(['NEED-011', ...staleStk])
  })
  it('the counts are the findings’ own: recorded + deferred = all; carried counted', () => {
    expect(AUDIT.recorded + AUDIT.deferred).toBe(AUDIT.findings)
    expect(AUDIT.carried).toBe(FINDINGS.filter((f) => f.carried).length)
  })
  it('the partial coverage the audit cannot see is real: each such need has exactly one stakeholder requirement', () => {
    for (const need of AUDIT.partialStillOpen) expect(PACKAGE_REQUIREMENTS.filter((r) => r.level === 'stakeholder' && r.parents.includes(need)).length, need).toBe(1)
    expect(AUDIT.partialStillOpen.every((n) => PARTIAL_COVERAGE.some((p) => p.need === n))).toBe(true)
  })
})

describe('Week 7 AeroLink case: no earlier open item is silent (review M1)', () => {
  it('every open item any earlier week recorded is either closed by a later week (computed) or carried by an audit finding', () => {
    expect(EARLIER_OPEN_ITEMS.length).toBeGreaterThan(0)
    const silent = EARLIER_OPEN_ITEMS.filter((x) => !x.closedBy && !x.finding).map((x) => `${x.from}: ${x.id}`)
    expect(silent).toEqual([])
    for (const x of EARLIER_OPEN_ITEMS.filter((y) => y.finding)) expect(FINDINGS.find((f) => f.id === x.finding)!.disposition, x.id).toMatch(/record|defer/)
  })
  it('NEED-006 and NEED-008 (due in Week 5, dropped by Week 6) are deferred findings with owners and weeks; NEED-017 is accepted against its TBR', () => {
    for (const n of ['NEED-006', 'NEED-008']) {
      const f = FINDINGS.find((x) => x.kind === 'dropped-open-item' && x.ids[0] === n)!
      expect(f, n).toBeDefined()
      expect(f.disposition).toBe('defer')
      expect(said(f.owner ?? '')).toBe(true)
      expect(f.week).toBeGreaterThanOrEqual(8)
    }
    const g = FINDINGS.find((x) => x.kind === 'dropped-open-item' && x.ids[0] === 'NEED-017')!
    expect(g.disposition).toBe('record')
    expect(g.ids).toContain('U-006')
  })
  it('every case finding passes the package tool’s own gates (rationale with evidence, no completion claim; owner and week when deferred)', () => {
    for (const f of FINDINGS) {
      const a = assessFinding({ disposition: f.disposition, reason: f.reason, owner: f.owner ?? '', week: f.week ? String(f.week) : '' }, { kind: f.kind, has: (id) => KNOWN_IDS.has(id) })
      expect(a.gates.filter((g) => !g.ok).map((g) => `${g.id}: ${g.message}`), `${f.id} ${f.kind}`).toEqual([])
    }
  })
  it('negative direction: dropping the Week 2 partial-coverage findings leaves an open item silent', () => {
    const without = EARLIER_OPEN_ITEMS.map((x) => (FINDINGS.find((f) => f.id === x.finding)?.kind === 'dropped-open-item' ? { ...x, finding: undefined } : x))
    expect(without.some((x) => !x.closedBy && !x.finding)).toBe(true)
  })
  it('the executive summary and the readiness answer count the dropped open items', () => {
    expect(dropText()).toBe(`${AUDIT.droppedDeferred.length} deferred (${AUDIT.droppedDeferred.join(', ')}) and ${AUDIT.droppedViaUnknown.map((x) => `${x.need} carried through ${x.unknown}`).join(' and ')}`)
    expect(AUDIT.droppedDeferred).toEqual(['NEED-008', 'NEED-006'])
    expect(AUDIT.droppedViaUnknown).toEqual([{ need: 'NEED-017', unknown: 'U-006' }])
    expect(EXEC_SUMMARY.why.join(' ')).toContain(dropText())
    expect(DRIVING_QUESTION.reasons.join(' ')).toContain(dropText())
    expect(RIDS[0].finding).toMatch(/Week 6 dropped it/)
    expect(RIDS[0].response).not.toMatch(/could not see/)
  })
})

describe('Week 7 AeroLink case: the thread', () => {
  it(`the thread from ${THREAD_START} follows real links at every hop`, () => {
    const at = (i: number) => THREAD[i].id
    expect(at(0)).toBe(THREAD_START)
    const req = (id: string) => PACKAGE_REQUIREMENTS.find((r) => r.id === id)!
    const stk = THREAD.find((h) => h.id.startsWith('REQ-STK-'))!.id
    const sys = THREAD.find((h) => h.id.startsWith('REQ-SYS-'))!.id
    const fn = THREAD.find((h) => h.id.startsWith('FN-'))!.id
    const phy = THREAD.find((h) => h.id.startsWith('PHY-'))!.id
    const ifc = THREAD.find((h) => h.id.startsWith('IF-'))!.id
    expect(req(stk).parents).toContain(THREAD_START)
    expect(req(sys).parents).toContain(stk)
    expect(FUNCTIONS.find((f) => f.id === fn)!.requirements).toContain(sys)
    expect(FUNCTIONS.find((f) => f.id === fn)!.phy).toBe(phy)
    expect(INTERFACES.find((x) => x.id === ifc)!.ends).toContain(phy)
    const u = THREAD.find((h) => h.id.startsWith('U-'))!.id
    expect(KNOWN_UNKNOWNS.find((k) => k.id === u)!.gates).toBe(THREAD.find((h) => h.id.startsWith('INC-'))!.id)
    expect(DECISION.conditions.some((c) => c.includes(u))).toBe(true)
    expect(THREAD.at(-1)!.id).toBe(DECISION.id)
  })
  it('the thread reaches every layer: requirement, architecture, interface and roadmap', () => {
    const ids = THREAD.map((h) => h.id)
    for (const p of [/^REQ-STK-/, /^REQ-SYS-/, /^FN-/, /^PHY-/, /^IF-/, /^INC-/]) expect(ids.some((id) => p.test(id)), String(p)).toBe(true)
  })
  it('negative direction: a need with no requirement stops at the need (or its capability); an unknown need gives no thread', () => {
    expect(threadFrom('NEED-999')).toEqual([])
    const stopped = threadFrom('NEED-012')
    expect(stopped.some((h) => h.id.startsWith('FN-'))).toBe(false)
  })
})

describe('Week 7 AeroLink case: the executive summary, the readiness answer and the RIDs', () => {
  it('every ID the summary cites exists in the package; the residual risks carry R IDs; the next increment is after the baseline', () => {
    for (const id of EXEC_SUMMARY.evidence) expect(KNOWN_IDS.has(id), id).toBe(true)
    expect(EXEC_SUMMARY.residual.every((r) => /\bR-\d{3}\b/.test(r))).toBe(true)
    expect(INCREMENTS.find((x) => x.id === EXEC_SUMMARY.next)!.horizon).not.toBe('baseline')
  })
  it('the driving question’s answer is C, with a reason per option', () => {
    expect(DRIVING_QUESTION.answer).toBe('C')
    expect(DRIVING_QUESTION.reasons).toHaveLength(DRIVING_QUESTION.options.length)
  })
  it('the RIDs use every disposition, valid severities, and every ID they cite exists', () => {
    expect(new Set(RIDS.map((r) => r.disposition))).toEqual(new Set(RID_DISPOSITIONS.map((d) => d.id)))
    for (const r of RIDS) {
      expect(SEVERITIES.map((s) => s.id), r.id).toContain(r.severity)
      for (const id of [...r.location.matchAll(ID)].map((m) => m[0])) expect(KNOWN_IDS.has(id), `${r.id} ${id}`).toBe(true)
      if (r.disposition !== 'reject') expect(said(r.owner ?? ''), `${r.id} owner`).toBe(true)
      else expect(r.evidence.length, `${r.id} evidence`).toBeGreaterThan(0)
    }
    expect(RID_COUNTS.total).toBe(RIDS.length)
  })
  it('RID-004 is real: the open items it names are owned by a week in the Week 6 review', () => {
    expect(WEEK_OWNED_ITEMS.length).toBeGreaterThan(0)
    for (const f of WEEK_OWNED_ITEMS) expect(f.owner).toMatch(/^Week \d+$/)
  })
  it('the review plan fits five teams and four teams, and refuses a slot below the minimum', () => {
    expect(reviewPlan(5).fits).toBe(true)
    expect(reviewPlan(4).fits).toBe(true)
    expect(reviewPlan(6).fits).toBe(false)
    expect(reviewPlan(5).briefing + reviewPlan(5).questions).toBe(reviewPlan(5).slot)
  })
})
