import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import type { EngineeringModel } from '../../model/engineering'
import { validateModel } from '../../model/engineering'
import { sysmlSource } from '../../lib/sysml'
import week05 from '../../content/weeks/week05'
import { ATTRIBUTES, AUDIT_ITEMS, lintSignals, scoreAuditItem } from './audit'
import { TPMS, TPM_HISTORY, assessHistory, assessPoint, marginOf, worstCase, type TpmSpec } from './measures'
import { CLASSES, LISTING_FILE, TARGETS, findToken, scoreReading, segmentLine } from './reading'
import { PEER_SAMPLE, childrenOf, comparePrediction, traceRows, traceSummary } from './trace'

describe('trace (B5.2)', () => {
  it('peer sample: the numbers quoted in worked example (b)', () => {
    const s = traceSummary(PEER_SAMPLE)
    expect(s.requirements).toBe(8)
    expect(s.withParent).toBe(6)
    expect(s.parentCoverage).toBeCloseTo(0.75)
    expect(s.orphans).toEqual(['REQ-SYS-903', 'REQ-SYS-905'])
    expect(s.childlessNeedsCaps).toEqual(['CAP-002', 'CAP-004', 'NEED-002'])
    expect(s.childlessStakeholderReqs).toEqual([])
    expect(s.parentsChecked).toBe(9)
    expect(validateModel(PEER_SAMPLE).filter((i) => i.severity === 'error')).toEqual([])
  })

  it('forward and backward traces agree (bidirectional)', () => {
    const rows = traceRows(PEER_SAMPLE)
    for (const r of rows) for (const p of r.parents) expect(childrenOf(PEER_SAMPLE, p)).toContain(r.id)
    expect(rows.find((r) => r.id === 'REQ-STK-903')!.children).toEqual(['REQ-SYS-901'])
    expect(childrenOf(PEER_SAMPLE, 'NEED-001')).toEqual(['REQ-STK-901'])
  })

  it('rule 8: the peer sample and the audit items never reuse a reference ID with a different meaning', () => {
    const ref = referenceUpTo(14).elements
    const refIds = new Set(ref.map((e) => e.id))
    for (const e of PEER_SAMPLE.elements) {
      if (e.kind === 'REQ') expect(refIds.has(e.id), `${e.id} collides with a reference ID`).toBe(false)
      // NEED/CAP are the reference's own elements: same ID must mean the same name
      else expect(e.name, e.id).toBe(ref.find((r) => r.id === e.id)!.name)
    }
    for (const a of AUDIT_ITEMS) expect(refIds.has(a.reqId), `${a.reqId} collides with a reference ID`).toBe(false)
    // the audit reuses the trace extract's IDs with the same texts
    for (const a of AUDIT_ITEMS) {
      const p = PEER_SAMPLE.elements.find((e) => e.id === a.reqId)
      if (p) expect(p.text).toBe(a.text)
    }
  })

  it('reference at Week 5: no orphans; one childless need (NEED-011, discovered in Week 3); two stakeholder requirements without a lower-level child', () => {
    const s = traceSummary(referenceUpTo(5))
    expect(s.requirements).toBe(20)
    expect(s.orphans).toEqual([])
    // NEED-011 (from SCN-005) has no requirement in the 20-requirement set yet: an open item recorded in
    // docs/authoring/reference_model_notes.md, not a missing link.
    expect(s.childlessNeedsCaps).toEqual(['NEED-011'])
    expect(s.childlessStakeholderReqs).toEqual(['REQ-STK-007', 'REQ-STK-009'])
    // resolved in Week 8 by design elements (PHY-002, IF-003 satisfy them), as the lesson says
    expect(traceSummary(referenceUpTo(8)).childlessStakeholderReqs).toEqual([])
  })

  it('mutation: removing one parent link creates exactly one orphan; retiring a child makes its parent childless', () => {
    const cut: EngineeringModel = { ...PEER_SAMPLE, links: PEER_SAMPLE.links.filter((l) => !(l.source === 'REQ-SYS-901')) }
    expect(traceSummary(cut).orphans).toEqual(['REQ-SYS-901', 'REQ-SYS-903', 'REQ-SYS-905'])
    const retired: EngineeringModel = { ...PEER_SAMPLE, elements: PEER_SAMPLE.elements.map((e) => (e.id === 'REQ-STK-901' ? { ...e, status: 'retired', retiredReason: 'test' } : e)) }
    const s = traceSummary(retired)
    expect(s.childlessNeedsCaps).toContain('NEED-001')
    expect(s.childlessNeedsCaps).toContain('CAP-001')
    expect(s.orphans).not.toContain('REQ-STK-901')
    // check 1 (R45): cutting REQ-SYS-902's link makes REQ-STK-902 childless
    const noChild: EngineeringModel = { ...PEER_SAMPLE, links: PEER_SAMPLE.links.filter((l) => l.source !== 'REQ-SYS-902') }
    expect(traceSummary(noChild).childlessStakeholderReqs).toEqual(['REQ-STK-902'])
  })

  it('empty model gives zero coverage, not NaN', () => {
    expect(traceSummary({ elements: [], links: [] }).parentCoverage).toBe(0)
  })

  it('prediction feedback separates correct, missed and wrong', () => {
    expect(comparePrediction(['REQ-SYS-903', 'REQ-STK-901'], ['REQ-SYS-903', 'REQ-SYS-905'])).toEqual({ correct: ['REQ-SYS-903'], missed: ['REQ-SYS-905'], wrong: ['REQ-STK-901'], exact: false })
    expect(comparePrediction(['b', 'a'], ['a', 'b']).exact).toBe(true)
  })
})

describe('measures (B5.3)', () => {
  const spec = (id: string) => TPMS.find((t) => t.id === id)!
  const latest = (id: string) => assessHistory(spec(id), TPM_HISTORY[id]).at(-1)!

  it('margin sign convention: positive is good for both senses', () => {
    expect(marginOf('lower-is-better', 20, 18)).toBe(2)
    expect(marginOf('higher-is-better', 20, 23)).toBe(3)
    expect(marginOf('lower-is-better', 65, 66)).toBe(-1)
    expect(worstCase('lower-is-better', 18, 0.6)).toBe(18.6)
    expect(worstCase('higher-is-better', 23, 1.5)).toBe(21.5)
  })

  it('CBE margins equal the instructor reference attributes (week05.ts)', () => {
    const ref = referenceUpTo(5).elements
    for (const t of TPMS) {
      const r = ref.find((e) => e.id === t.id)!
      const a = latest(t.id)
      expect(a.cbe).toBe(r.attributes!.currentEstimate)
      expect(a.marginCbe).toBe(r.attributes!.margin)
      expect(t.threshold).toBe(r.attributes!.threshold)
      expect(t.objective).toBe(r.attributes!.objective)
      expect(t.sense).toBe(r.attributes!.sense)
    }
  })

  it('worked example (c): month-9 WCE margins and statuses', () => {
    expect(latest('TPM-001')).toMatchObject({ wce: 18.6, marginWce: 1.4, status: 'on-track' })
    expect(latest('TPM-002')).toMatchObject({ wce: 64.5, marginWce: 0.5, projectedMargin: 0.2, status: 'at-risk', rule: 'R3' })
    expect(latest('TPM-003')).toMatchObject({ wce: 21.5, marginWce: 1.5, projectedMargin: 1.1, status: 'on-track' })
    const h1 = assessHistory(spec('TPM-001'), TPM_HISTORY['TPM-001'])
    expect(h1.map((a) => a.status)).toEqual(['at-risk', 'at-risk', 'at-risk', 'on-track'])
    expect(h1.map((a) => a.marginWce)).toEqual([0, 0.5, 0.9, 1.4])
    expect(assessHistory(spec('TPM-002'), TPM_HISTORY['TPM-002']).map((a) => a.marginWce)).toEqual([1, 0.9, 0.8, 0.5])
    for (const t of TPMS) expect(latest(t.id).objectiveMet).toBe(false)
  })

  it('contingency falls only as the basis matures (R44 p.117); TPM-001 month 9 is an end-item test', () => {
    for (const t of TPMS) {
      const h = TPM_HISTORY[t.id]
      for (let i = 1; i < h.length; i++) expect(h[i].contingency, `${t.id} month ${h[i].month}`).toBeLessThanOrEqual(h[i - 1].contingency)
    }
    const h1 = TPM_HISTORY['TPM-001']
    expect(h1.find((p) => p.month === 6)!.basis).toMatch(/surrogate/)
    expect(h1.find((p) => p.month === 9)!.basis).toMatch(/end item/)
  })

  it('advanced block: with 0.5 dBA contingency TPM-002 margin is 1.0 and the R3 projection 1.2 (the lesson says the same)', () => {
    const h = TPM_HISTORY['TPM-002']
    const a = assessPoint(spec('TPM-002'), { ...h[3], contingency: 0.5 }, h[2])
    expect(a).toMatchObject({ wce: 64, marginWce: 1, projectedMargin: 1.2, status: 'on-track', rule: null })
    const adv = week05.blocks.find((b) => b.id === 'w5-advanced')!.paragraphs.join(' ')
    expect(adv).toContain('WCE margin would be 1.0 dBA')
    expect(adv).toContain('projection 1.2 dBA')
    expect(adv).not.toMatch(/0\.7 dBA/)
  })

  it('quiz arithmetic: q5-8 (hover power) and q5-9 (range margin series) are new cases computed by the same rules', () => {
    // q5-8: lower is better, threshold 220 kW, CBE 205 kW, contingency 9 kW (surrogate rotor-rig test)
    expect(marginOf('lower-is-better', 220, worstCase('lower-is-better', 205, 9))).toBe(6)
    expect(marginOf('lower-is-better', 220, 205)).toBe(15)
    const q8 = week05.quiz.find((q) => q.id === 'q5-8')!
    expect(q8.options.find((o) => o.correct)!.text).toMatch(/^6 kW/)
    // q5-9: higher is better, threshold 50 km, floor 2 km, WCE margins 6.0, 5.0, 4.0, 3.5 -> projection 3.0, on track
    const r: TpmSpec = { id: 'Q', name: 'range', unit: 'km', sense: 'higher-is-better', threshold: 50, objective: 60, alertFloor: 2, tracks: '-', mop: '-' }
    const series = [6, 5, 4, 3.5].map((m, i) => ({ month: i * 3, cbe: 50 + m + 1, contingency: 1, basis: '' }))
    const hist = assessHistory(r, series)
    expect(hist.map((x) => x.marginWce)).toEqual([6, 5, 4, 3.5])
    expect(hist.at(-1)).toMatchObject({ projectedMargin: 3, status: 'on-track' })
    const q9 = week05.quiz.find((q) => q.id === 'q5-9')!
    expect(q9.options.find((o) => o.correct)!.text).toMatch(/3\.0 km/)
  })

  it('rules fire in order and at their boundaries (mutation-style)', () => {
    const s: TpmSpec = { id: 'T', name: 't', unit: 'u', sense: 'lower-is-better', threshold: 10, objective: 8, alertFloor: 1, tracks: 'R', mop: 'M' }
    const p = (cbe: number, contingency = 0) => ({ month: 1, cbe, contingency, basis: '' })
    expect(assessPoint(s, p(10.1)).status).toBe('breach')
    expect(assessPoint(s, p(10)).status).toBe('at-risk') // margin 0 is not a breach (R1 is strict)
    expect(assessPoint(s, p(9)).status).toBe('on-track') // margin exactly at the floor is not at risk (R2 is strict)
    expect(assessPoint(s, p(8.5, 0.6)).rule).toBe('R2') // contingency is applied: WCE 9.1, margin 0.9
    expect(assessPoint(s, p(8.5)).status).toBe('on-track')
    expect(assessPoint(s, p(8, 0), { month: 0, cbe: 6, contingency: 0, basis: '' })).toMatchObject({ projectedMargin: 0, rule: 'R3' })
    // breach outranks the trend rule
    expect(assessPoint(s, p(11), { month: 0, cbe: 6, contingency: 0, basis: '' }).rule).toBe('R1')
    // higher-is-better uses the opposite direction for both margin and contingency
    const h: TpmSpec = { ...s, sense: 'higher-is-better', threshold: 20, objective: 25 }
    expect(assessPoint(h, p(21.5, 1)).status).toBe('at-risk')
    expect(assessPoint(h, p(19.5)).status).toBe('breach')
  })
})

describe('peer audit (B5.1)', () => {
  it('keys use only the DoD attribute list and every item has a finding and a revision', () => {
    for (const a of AUDIT_ITEMS) {
      for (const k of a.key) expect(ATTRIBUTES).toContain(k)
      expect(a.finding.length).toBeGreaterThan(40)
      expect(a.revision.length).toBeGreaterThan(20)
    }
    expect(AUDIT_ITEMS.some((a) => a.key.length === 0)).toBe(true)
  })

  it('scores hits, misses and false findings', () => {
    const s = scoreAuditItem(['Singular', 'Complete'], ['Singular', 'Verifiable'])
    expect(s).toEqual({ hits: ['Singular'], missed: ['Verifiable'], extra: ['Complete'], exact: false })
    expect(scoreAuditItem([], []).exact).toBe(true)
    expect(scoreAuditItem(['Complete'], []).exact).toBe(false)
  })

  it('lint signals detect the defects in the sample and stay quiet on a sound requirement', () => {
    const t = (id: string) => AUDIT_ITEMS.find((a) => a.id === id)!.text
    expect(lintSignals(t('a1')).join(' ')).toMatch(/user-friendly, quickly/)
    expect(lintSignals(t('a3')).join(' ')).toMatch(/will/)
    expect(lintSignals(t('a6')).join(' ')).toMatch(/2 “shall”/)
    expect(lintSignals(t('a4'))).toEqual([])
    expect(lintSignals('The system will be fast')).toHaveLength(4)
  })

  it('lint does not push the inspection-verifiable item (a2) towards a false "not verifiable" finding, but still fires on realistic bad input', () => {
    const t = (id: string) => AUDIT_ITEMS.find((a) => a.id === id)!.text
    const a2 = lintSignals(t('a2')).join(' ')
    expect(a2).not.toMatch(/No number or TBD/)
    expect(a2).toMatch(/inspection/)
    // plausible bad requirements of the same shape ("shall have ...") with a vague quality are still flagged
    for (const bad of ['The booking platform shall have an intuitive interface for every passenger at every vertiport.', 'The aircraft shall have a comfortable and quiet cabin for passengers on every trip.']) {
      const out = lintSignals(bad).join(' ')
      expect(out, bad).toMatch(/No number or TBD/)
      expect(out, bad).toMatch(/Vague term/)
      expect(out, bad).not.toMatch(/inspection/)
    }
    expect(lintSignals(t('a5')).join(' ')).toMatch(/No number or TBD/)
  })
})

describe('SysML reading (B5.4)', () => {
  const lines = (sysmlSource(LISTING_FILE) ?? '').split(/\r?\n/)

  it('the listing exists and every target token occurs on its stated line', () => {
    expect(lines.length).toBeGreaterThan(40)
    for (const t of TARGETS) expect(findToken(lines[t.line - 1], t.token), `${t.id} ${t.token} @${t.line}`).toBeGreaterThanOrEqual(0)
  })

  it('every class is used and target IDs are unique', () => {
    for (const c of CLASSES) expect(TARGETS.some((t) => t.answer === c.id)).toBe(true)
    expect(new Set(TARGETS.map((t) => t.id)).size).toBe(TARGETS.length)
  })

  it('key is consistent with the syntax of each target line', () => {
    for (const t of TARGETS) {
      const l = lines[t.line - 1]
      if (t.answer === 'definition') expect(l).toMatch(new RegExp(`\\b(part|attribute) def ${t.token}\\b`))
      if (t.answer === 'part-usage') expect(l).toMatch(/^\s*part (redefines )?\w/)
      if (t.answer === 'attribute-usage') expect(l).toMatch(/^\s*attribute (redefines )?\w/)
      if (t.answer === 'type') expect(l).toContain(`: ${t.token}`)
      if (t.answer === 'unit') expect(l).toContain(`[${t.token}]`)
    }
  })

  it('scores answers; a wrong class is counted as answered but not correct', () => {
    const r = scoreReading({ t1: 'definition', t2: 'type' })
    expect(r).toMatchObject({ answered: 2, correct: 1 })
    expect(r.perTarget.t3).toBeNull()
  })

  it('whole-word token search and line segmentation', () => {
    expect(findToken('part redefines battery {', 'battery')).toBe(15)
    expect(findToken('part def Batteryx', 'Battery')).toBe(-1)
    const seg = segmentLine('\tattribute usableEnergy : EnergyValue;', TARGETS.filter((t) => t.line === 13))
    expect(seg.map((s) => s.text).join('')).toBe('\tattribute usableEnergy : EnergyValue;')
    expect(seg.filter((s) => s.target).map((s) => s.target!.id)).toEqual(['t2', 't3'])
  })
})
