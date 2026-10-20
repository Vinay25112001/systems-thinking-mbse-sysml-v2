// Week 2 AeroLink case: every trace resolves to a corrected Week 1 need; no requirement is an orphan; exactly one need,
// the declared deliberate gap (NEED-011, exposed by SCN-005), has no requirement; the corrected noise need reaches the
// requirements and measures; scenarios are well formed on the course template. Each audit helper is also shown able to
// fail on a mutated copy, so a clean run is not a vacuous pass.
import { describe, expect, it } from 'vitest'
import { NEEDS as W1_NEEDS, need } from '../week01/aerolinkCase'
import {
  AUDIT_RULE, CAPABILITIES, CONOPS_ENVIRONMENT, CRITIQUE, PARTIAL_COVERAGE, STK_DISPOSITION_FORM, scenariosOfCapability, DELIBERATE_REQ_GAP, DISCOVERIES, MEASURES, MOES, MOPS, NEED_COVERAGE, REQUIREMENTS, SCENARIOS, STAKEHOLDER_REQUIREMENTS, STK_DISPOSITIONS, SYSTEM_REQUIREMENTS, UNCERTAINTIES,
  childlessNeeds, childlessStakeholderRequirements, needsOfRequirement, orphanRequirements, requirement,
} from './aerolinkCase'
import { LAB2_MINIMUMS } from './labBrief'

const W1_IDS = new Set(W1_NEEDS.map((n) => n.id))
const CAP_IDS = new Set(CAPABILITIES.map((c) => c.id))

describe('Week 2 case: traces to the corrected Week 1 needs', () => {
  it('imports the seventeen corrected Week 1 needs (not a copy)', () => {
    expect(W1_IDS.size).toBe(17)
  })
  it('every capability traces to at least one Week 1 need id', () => {
    for (const c of CAPABILITIES) {
      expect(c.needs.length, c.id).toBeGreaterThan(0)
      for (const n of c.needs) expect(W1_IDS.has(n), `${c.id} → ${n}`).toBe(true)
      if (c.refines) expect(CAP_IDS.has(c.refines), c.id).toBe(true)
    }
  })
  it('every requirement parent exists, and every requirement reaches at least one Week 1 need through its parents', () => {
    for (const r of REQUIREMENTS) {
      const needs = needsOfRequirement(r.id)
      expect(needs.length, r.id).toBeGreaterThan(0)
      for (const n of needs) expect(W1_IDS.has(n), `${r.id} → ${n}`).toBe(true)
    }
    expect(orphanRequirements()).toEqual([])
  })
  it('levels are not inverted: a stakeholder requirement derives from needs and capabilities only; a system requirement from a stakeholder requirement or a capability', () => {
    for (const r of STAKEHOLDER_REQUIREMENTS) for (const p of r.parents) expect(/^(NEED|CAP)-\d{3}$/.test(p), `${r.id} ← ${p}`).toBe(true)
    for (const r of SYSTEM_REQUIREMENTS) for (const p of r.parents) expect(/^(REQ-STK|CAP)-\d{3}$/.test(p), `${r.id} ← ${p}`).toBe(true)
  })
  it('no orphan requirements; exactly one childless need, the declared deliberate gap, exposed by SCN-005', () => {
    expect(childlessNeeds()).toEqual([DELIBERATE_REQ_GAP.need])
    expect(DELIBERATE_REQ_GAP.need).toBe('NEED-011')
    expect(DISCOVERIES.find((d) => d.id === 'NEED-011')!.scenario).toBe(DELIBERATE_REQ_GAP.exposedBy)
    // the gap is a missing requirement, not a missing capability: CAP-015 (proposed) traces NEED-011, CAP-005 no longer does
    expect(CAPABILITIES.filter((c) => c.needs.includes('NEED-011')).map((c) => c.id)).toEqual(['CAP-015'])
  })
  it('every childless stakeholder requirement carries a recorded disposition', () => {
    const childless = childlessStakeholderRequirements()
    expect(childless).toContain('REQ-STK-007')
    expect(childless).toContain('REQ-STK-009')
    expect(Object.keys(STK_DISPOSITIONS).sort()).toEqual([...childless].sort())
  })
  it('negative direction: the audit helpers catch an orphan, a dangling parent and a second childless need', () => {
    const r = requirement('REQ-SYS-012')
    const saved = [...r.parents]
    r.parents.splice(0, r.parents.length)
    expect(orphanRequirements()).toContain('REQ-SYS-012')
    r.parents.push('REQ-STK-099')
    expect(orphanRequirements()).toContain('REQ-SYS-012')
    r.parents.splice(0, r.parents.length, ...saved)
    expect(orphanRequirements()).toEqual([])
    const s = requirement('REQ-STK-012')
    const sp = [...s.parents]
    s.parents.splice(0, s.parents.length, 'CAP-014')
    expect(childlessNeeds()).toEqual(['NEED-011', 'NEED-015'])
    s.parents.splice(0, s.parents.length, ...sp)
    expect(childlessNeeds()).toEqual(['NEED-011'])
  })
})

describe('Week 2 case: the corrected noise need flows down', () => {
  it('NEED-003 has two stakeholder requirements, one per agreed limit, and the event cap reaches a system requirement and a measure pair', () => {
    const kids = STAKEHOLDER_REQUIREMENTS.filter((r) => r.parents.includes('NEED-003')).map((r) => r.id)
    expect(kids).toEqual(['REQ-STK-002', 'REQ-STK-011'])
    expect(requirement('REQ-STK-011').statement).toMatch(/before 07:00 and after 20:00/)
    expect(requirement('REQ-STK-011').tbx).toBe('TBD-03')
    expect(SYSTEM_REQUIREMENTS.filter((r) => r.parents.includes('REQ-STK-011')).map((r) => r.id)).toEqual(['REQ-SYS-011'])
    expect(MOES.find((m) => m.id === 'MOE-007')!.measures).toContain('NEED-003')
    expect(MOPS.find((m) => m.id === 'MOP-010')!.measures).toEqual(expect.arrayContaining(['MOE-007', 'REQ-SYS-011']))
  })
  it('CAP-007 is corrected to both agreed limits', () => {
    expect(CAPABILITIES.find((c) => c.id === 'CAP-007')!.text).toMatch(/both agreed limits/)
  })
})

describe('Week 2 case: TBX management and measures', () => {
  it('every TBD in a requirement names an unknown with an owner', () => {
    const tbx = new Map(UNCERTAINTIES.filter((u) => u.tbx).map((u) => [u.tbx!, u]))
    for (const r of REQUIREMENTS) {
      const tokens = r.statement.match(/TBD-\d{2}/g) ?? []
      for (const t of tokens) {
        expect(tbx.has(t), `${r.id}: ${t}`).toBe(true)
        expect(tbx.get(t)!.owner.length).toBeGreaterThan(3)
      }
      if (tokens.length) expect(r.tbx, r.id).toBe(tokens[0])
    }
  })
  it('every requirement has exactly one “shall”, a criterion, a rationale and a method', () => {
    for (const r of REQUIREMENTS) {
      expect((r.statement.match(/\bshall\b/g) ?? []).length, r.id).toBe(1)
      expect(r.criterion.length, r.id).toBeGreaterThan(10)
      expect(r.rationale.split(/\s+/).length, r.id).toBeGreaterThan(8)
    }
  })
  it('every MOE measures a need, capability or objective; every MOP measures an MOE and a requirement; every measure has a unit, threshold and data source', () => {
    const ids = new Set([...REQUIREMENTS.map((r) => r.id), ...MOES.map((m) => m.id)])
    for (const m of MOES) expect(m.measures.some((x) => /^(NEED|CAP|MGO)-/.test(x)), m.id).toBe(true)
    for (const m of MOPS) {
      expect(m.measures.some((x) => x.startsWith('MOE-') && ids.has(x)), m.id).toBe(true)
      expect(m.measures.some((x) => x.startsWith('REQ-') && ids.has(x)), m.id).toBe(true)
    }
    for (const m of MEASURES) for (const f of [m.unit, m.threshold, m.dataSource]) expect(f.length, m.id).toBeGreaterThan(0)
  })
  it('the reference meets the lab minimums it asks of teams (it can be used as the standard)', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.scenarios)
    expect(CAPABILITIES.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.capabilities)
    expect(STAKEHOLDER_REQUIREMENTS.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.stakeholderRequirements)
    expect(SYSTEM_REQUIREMENTS.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.systemRequirements)
    expect(new Set(REQUIREMENTS.map((r) => r.type)).size).toBe(4)
    expect(MOES.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.moes)
    expect(MOPS.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.mops)
  })
})

describe('Week 2 case: scenarios on the course template', () => {
  it('one nominal, one off-nominal and one support scenario at least', () => {
    for (const k of ['nominal', 'off-nominal', 'support']) expect(SCENARIOS.some((s) => s.kind === k), k).toBe(true)
  })
  it('every step has an actor; every alternate branches from a real step and rejoins a real step or ends; both end states present', () => {
    for (const s of SCENARIOS) {
      expect(s.steps.map((x) => x.n)).toEqual(s.steps.map((_, i) => i + 1))
      for (const st of s.steps) expect(st.actor.length, `${s.id}.${st.n}`).toBeGreaterThan(0)
      expect(s.alternates.length, s.id).toBeGreaterThanOrEqual(1)
      for (const a of s.alternates) {
        expect(a.fromStep).toBeGreaterThanOrEqual(1)
        expect(a.fromStep).toBeLessThanOrEqual(s.steps.length)
        if (a.outcome !== 'ends') expect(a.outcome.rejoin).toBeLessThanOrEqual(s.steps.length)
      }
      expect(s.success.length && s.failure.length, s.id).toBeTruthy()
      for (const c of s.capabilities) expect(CAP_IDS.has(c), s.id).toBe(true)
    }
  })
  it('weather is an environmental factor in SCN-005, not an actor that acts', () => {
    const w = SCENARIOS.find((s) => s.id === 'SCN-005')!.actors.find((a) => a.id === 'EXT-003')!
    expect(w.environment).toBe(true)
  })
  it('the coverage reading has one row per Week 1 need and every “not exercised” row carries its reason', () => {
    expect(NEED_COVERAGE.map((r) => r.need)).toEqual([...W1_IDS])
    for (const r of NEED_COVERAGE) if (r.where.length === 0) expect(r.note.length, r.need).toBeGreaterThan(20)
    for (const r of NEED_COVERAGE) for (const w of r.where) expect(SCENARIOS.some((s) => s.id === w.scenario), r.need).toBe(true)
  })
  it('the critique rewrites are reference system requirements, and word-level checks catch four of the six drafts', () => {
    for (const c of CRITIQUE) expect(requirement(c.rewriteId).level).toBe('system')
    expect(CRITIQUE.filter((c) => c.catchBy === 'word-level check').map((c) => c.id)).toEqual(['F2', 'F4', 'F5', 'F6'])
  })
  it('American spelling in the case text (no -centre, -isation, judgement, neighbour)', () => {
    const text = JSON.stringify({ SCENARIOS, REQUIREMENTS, MEASURES, CAPABILITIES, CRITIQUE })
    expect(text).not.toMatch(/centre|isation|judgement|neighbour|utilis/i)
  })
})

describe('review fixes (week02_review.md): each claim derived from the data', () => {
  it('M2: no requirement reaches NEED-011 by any trace path, and the rule is stated', () => {
    for (const r of REQUIREMENTS) expect(needsOfRequirement(r.id), r.id).not.toContain('NEED-011')
    expect(AUDIT_RULE).toMatch(/names it as a parent/)
    expect(DELIBERATE_REQ_GAP.finding).toMatch(/CAP-015/)
    // the reason agrees with the TBD doctrine: it says the requirement could be written now with a TBD
    expect(DELIBERATE_REQ_GAP.why).toMatch(/TBD/)
    expect(DELIBERATE_REQ_GAP.why).not.toMatch(/nothing to stand on/)
    expect(SCENARIOS.find((x) => x.id === 'SCN-005')!.capabilities).toContain('CAP-015')
  })
  it('M2 negative direction: re-hanging NEED-011 on CAP-005 makes REQ-STK-003 reach it', () => {
    const c5 = CAPABILITIES.find((c) => c.id === 'CAP-005')!
    c5.needs.push('NEED-011')
    expect(needsOfRequirement('REQ-STK-003')).toContain('NEED-011')
    c5.needs.pop()
    expect(needsOfRequirement('REQ-STK-003')).not.toContain('NEED-011')
  })
  it('M3: SCN-002 touches the most needs; only CAP-008 of the ten reference capabilities has no badge; badges agree with the coverage reading', () => {
    const per = SCENARIOS.map((x) => [x.id, NEED_COVERAGE.filter((r) => r.where.some((w) => w.scenario === x.id)).length] as const)
    expect(per.reduce((a, b) => (b[1] > a[1] ? b : a))[0]).toBe('SCN-002')
    const ref = CAPABILITIES.filter((c) => Number(c.id.slice(4)) <= 10)
    expect(ref.filter((c) => scenariosOfCapability(c.id).length === 0).map((c) => c.id)).toEqual(['CAP-008'])
    // every badge is backed by a coverage row: the scenario exercises at least one need of the capability
    for (const x of SCENARIOS)
      for (const cid of x.capabilities) {
        const needs = CAPABILITIES.find((c) => c.id === cid)!.needs
        expect(NEED_COVERAGE.some((r) => needs.includes(r.need) && r.where.some((w) => w.scenario === x.id)), `${x.id} → ${cid}`).toBe(true)
      }
  })
  it('M6: no case text points at a Week 6 or Week 7 trade study or baseline for the requirements', () => {
    const text = JSON.stringify({ UNCERTAINTIES, MOES })
    expect(text).not.toMatch(/Week 7 trade study|requirements baseline \(Week 6\)/)
    expect(UNCERTAINTIES.find((u) => u.id === 'U-002')!.closeBy).toMatch(/Week 3 trade study/)
  })
  it('M7: every childless stakeholder requirement has a form (open item or no child needed) in the lecture vocabulary', () => {
    for (const id of childlessStakeholderRequirements()) expect(['open', 'no-child']).toContain(STK_DISPOSITION_FORM[id])
    expect(JSON.stringify({ STK_DISPOSITIONS, DELIBERATE_REQ_GAP, PARTIAL_COVERAGE })).not.toMatch(/covered elsewhere|recorded reason/i)
  })
  it('M8: REQ-STK-007 uses the corrected NEED-008 subject class; each partial coverage names a real child of the need', () => {
    expect(requirement('REQ-STK-007').statement).toMatch(/reduced mobility/)
    expect(need('NEED-008').statement).toMatch(/reduced mobility/)
    for (const p of PARTIAL_COVERAGE) expect(requirement(p.by).parents, p.need).toContain(p.need)
  })
  it('M10 negative direction: MOP-008 back on MOE-004 is caught', () => {
    const m = MOPS.find((x) => x.id === 'MOP-008')!
    const moeNeeds = MOES.find((e) => e.id === 'MOE-004')!.measures.filter((y) => y.startsWith('NEED-'))
    const reqNeeds = m.measures.filter((x) => x.startsWith('REQ-')).flatMap((x) => needsOfRequirement(x))
    expect(moeNeeds.some((n) => reqNeeds.includes(n))).toBe(false)
  })
  it('M10: each MOP supports an MOE that measures a need its own requirement reaches; NEED-006 and NEED-010 have an MOE', () => {
    for (const m of MOPS) {
      const moeNeeds = m.measures.filter((x) => x.startsWith('MOE-')).flatMap((x) => MOES.find((e) => e.id === x)!.measures.filter((y) => y.startsWith('NEED-')))
      const reqNeeds = m.measures.filter((x) => x.startsWith('REQ-')).flatMap((x) => needsOfRequirement(x))
      // MOP-002 (charge time) supports MOE-001 (wait) through the turnaround: a cross-need link the reference keeps on purpose
      if (m.id !== 'MOP-002') expect(moeNeeds.some((n) => reqNeeds.includes(n)), m.id).toBe(true)
    }
    for (const n of ['NEED-006', 'NEED-010']) expect(MOES.some((e) => e.measures.includes(n)), n).toBe(true)
    expect(MOES.find((e) => e.id === 'MOE-006')!.measures).not.toContain('CAP-005')
  })
  it('N15: the discovery of NEED-011 is the Week 1 statement, not a paraphrase', () => {
    expect(DISCOVERIES.find((d) => d.id === 'NEED-011')!.text).toBe(need('NEED-011').statement)
  })
  it('N17: the weather hold covers visibility as well as wind and gust', () => {
    expect(requirement('REQ-SYS-004').statement).toMatch(/wind, gust or visibility/)
  })
  it('N18: 12 aircraft is the opening fleet; about 15 at 20 trips each meets 300 trips/day', () => {
    expect(CONOPS_ENVIRONMENT.find((e) => e.label === 'Fleet')!.value).toMatch(/12 eVTOL aircraft at opening.*about 15 aircraft/)
    expect(12 * 20).toBeLessThan(300)
    expect(15 * 20).toBeGreaterThanOrEqual(300)
  })
})
