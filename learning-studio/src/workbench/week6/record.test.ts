// Week 6 record: the Riverside fixture passes every check (with short answers the lecture calls complete), and every check
// is shown able to fail by a mutation. Import refuses earlier-week, Week 6 and AeroLink files with a message; export
// round-trips; IDs are never reused; the canonical artifact types and relationships are projected for the adapters.
import { describe, expect, it } from 'vitest'
import { WEEK3_JSON, WEEK5_JSON, week6Fixture } from './fixture'
import {
  EMPTY_RECORD, allChecks, assessArou, assessGap, assessImpact, assessIncrement, assessReviewRow, assessTech, assessUnknown, hasWork, impactCandidates, importWeek3File, importWeek5File, importWeek6, modelInputs, nextId,
  normalizeRecord, recordMarkdown, recordState, relationships, roadmapGrid, securityLinks, transitionRisks, withWeek5, type Week6Record,
} from './record'
import { LAB6_MINIMUMS, LAB6_MINIMUMS_THREE } from '../../content/lectures/week06/labBrief'

const fx = () => week6Fixture()
const mut = (f: (r: Week6Record) => void) => {
  const r = structuredClone(fx())
  f(r)
  return normalizeRecord(r)
}
const inc = (r: Week6Record, id: string) => r.increments.find((x) => x.id === id)!
const failedGates = (a: { gates: { id: string; ok: boolean }[] }) => a.gates.filter((g) => !g.ok).map((g) => g.id)

describe('Week 6 record: the fixture', () => {
  it('passes every part check and is ready', () => {
    const c = allChecks(fx())
    for (const [k, v] of Object.entries(c)) expect(v.issues, k).toEqual([])
    expect(recordState(fx())).toBe('ready')
  })
  it('accepts short answers the lecture calls complete', () => {
    const r = mut((x) => {
      inc(x, 'INC-003').transition = 'Cutover'
      inc(x, 'INC-003').offRamp = 'Refrigeration'
      inc(x, 'INC-003').security = 'None'
      inc(x, 'INC-003').content = 'Plates'
      inc(x, 'INC-002').trigger = 'Approved'
      x.unknowns[0].owner = 'TL'
      x.unknowns[0].impact = 'Delay'
      x.unknowns[0].mitigation = 'Fallback'
      x.unknowns[0].need = 'Data'
      x.technologies[2].basis = 'A-003'
      x.technologies[3].notInserted = 'Cost'
      x.gaps[0].desired = '2 min'
      x.gaps[0].capability = 'Alarms'
      x.arou[0].owner = 'Stripe'
      x.review[1].items = 'U-001'
      x.review[1].owner = 'TL'
    })
    expect(allChecks(r).increments.issues).toEqual([])
    expect(allChecks(r).unknowns.issues).toEqual([])
    expect(allChecks(r).technology.issues).toEqual([])
    expect(allChecks(r).gaps.issues).toEqual([])
    expect(allChecks(r).review.issues).toEqual([])
    // a one-word "None" draws only an advisory; "Approved" is an event word, so no vague-trigger advisory
    const a = assessIncrement(inc(r, 'INC-003'), r)
    expect(a.counts).toBe(true)
    expect(a.advisories.map((x) => x.id)).toContain('security-none')
    expect(assessIncrement(inc(r, 'INC-002'), r).advisories.map((x) => x.id)).not.toContain('trigger-vague')
  })
  it('an answer that says nothing does not count (Week 5 confirmation N1): “n/a”, “?”, “later”, “TBD”, “none”', () => {
    for (const v of ['n/a', '?', 'later', 'TBD', '-']) {
      const r = mut((x) => {
        inc(x, 'INC-003').trigger = v
        inc(x, 'INC-003').offRamp = v
        inc(x, 'INC-003').transition = v
        x.unknowns[0].owner = v
        x.unknowns[0].mitigation = v
        x.technologies[2].basis = v
      })
      expect(failedGates(assessIncrement(inc(r, 'INC-003'), r)), v).toEqual(['trigger', 'transition', 'off-ramp'])
      expect(failedGates(assessUnknown(r.unknowns[0], r)), v).toEqual(['mitigation', 'owner'])
      expect(failedGates(assessTech(r.technologies[2], r)), v).toEqual(['basis'])
      expect(recordState(r), v).toBe('not-ready')
    }
    // the stated exceptions: "None" is a complete security change; "TBD" and "none" are valid levels, one level each
    // (both at once state no comparison: review n2, tested below)
    const ok = mut((x) => {
      inc(x, 'INC-003').security = 'None'
      x.gaps[0].baseline = 'none'
      x.gaps[0].desired = '2 min'
    })
    expect(assessIncrement(inc(ok, 'INC-003'), ok).counts).toBe(true)
    expect(assessGap(ok.gaps[0], ok).counts).toBe(true)
    const bad = mut((x) => { inc(x, 'INC-003').security = 'n/a' })
    expect(failedGates(assessIncrement(inc(bad, 'INC-003'), bad))).toEqual(['security'])
    expect(assessIncrement(inc(bad, 'INC-003'), bad).gates.find((g) => g.id === 'security')!.message).toMatch(/says nothing/)
  })
  it('a decision trigger with no number is an advisory, never a gate', () => {
    const r = fx()
    const a = assessIncrement(inc(r, 'INC-004'), r)
    expect(a.counts).toBe(true)
    expect(a.advisories.map((x) => x.id)).toContain('trigger-vague')
  })
  it('accepts an MGO trace without the Week 3 file and says it is unchecked', () => {
    const r = mut((x) => { x.week3 = null })
    expect(assessGap(r.gaps[2], r).counts).toBe(true)
    expect(allChecks(r).gaps.notes!.join(' ')).toMatch(/MGO-003 accepted/)
    expect(allChecks(r).import.notes!.join(' ')).toMatch(/Advisory/)
  })
})

describe('Week 6 record: every hard gate can fail', () => {
  it('gaps: statement, levels, kind, horizon, source (unknown ID and none)', () => {
    const r = fx()
    const g = r.gaps[0]
    expect(failedGates(assessGap({ ...g, capability: '' }, r))).toEqual(['statement'])
    expect(failedGates(assessGap({ ...g, baseline: '' }, r))).toEqual(['levels'])
    expect(failedGates(assessGap({ ...g, kind: '' }, r))).toEqual(['kind'])
    expect(failedGates(assessGap({ ...g, horizon: '' }, r))).toEqual(['horizon'])
    expect(failedGates(assessGap({ ...g, sources: 'NEED-099' }, r))).toEqual(['source'])
    expect(failedGates(assessGap({ ...g, sources: 'the users' }, r))).toEqual(['source'])
  })
  it('technologies: name, status, TRL, basis, insertion, risk when immature', () => {
    const r = fx()
    const t = r.technologies[2]
    expect(failedGates(assessTech({ ...t, name: '' }, r))).toEqual(['name'])
    expect(failedGates(assessTech({ ...t, status: '' }, r))).toEqual(['status'])
    expect(failedGates(assessTech({ ...t, trl: 0 }, r))).toEqual(['trl'])
    expect(failedGates(assessTech({ ...t, basis: '' }, r))).toEqual(['basis'])
    expect(failedGates(assessTech({ ...t, insertion: 'INC-099' }, r))).toEqual(['insertion'])
    expect(failedGates(assessTech({ ...t, insertion: '', notInserted: '' }, r))).toEqual(['insertion'])
    expect(failedGates(assessTech({ ...t, risk: '' }, r))).toEqual(['risk'])
    // a technology that does not yet exist needs no TRL; a mature one needs no risk
    expect(assessTech({ ...t, status: 'not-existing', trl: 0, basis: '' }, r).counts).toBe(true)
    expect(assessTech({ ...r.technologies[0], risk: '' }, r).counts).toBe(true)
  })
  it('technology advisories: near-term immature insertion and a TRL changed since Week 3', () => {
    const r = mut((x) => { inc(x, 'INC-003').horizon = 'near'; x.technologies[0].trl = 7 })
    expect(assessTech(r.technologies[2], r).advisories.map((x) => x.id)).toContain('near-immature')
    expect(assessTech(r.technologies[0], r).advisories.map((x) => x.id)).toContain('trl-changed')
    expect(assessTech(r.technologies[0], r).counts).toBe(true)
  })
  it('increments: every field, the off-ramp only when it inserts immature technology, dependencies in the record', () => {
    const r = fx()
    const x = inc(r, 'INC-003')
    for (const [field, gate] of [['name', 'name'], ['horizon', 'horizon'], ['content', 'content'], ['serves', 'serves'], ['trigger', 'trigger'], ['approach', 'approach'], ['transition', 'transition'], ['offRamp', 'off-ramp'], ['security', 'security']] as const)
      expect(failedGates(assessIncrement({ ...x, [field]: '' }, r)), field).toEqual([gate])
    expect(failedGates(assessIncrement({ ...x, dependencies: 'INC-099' }, r))).toEqual(['dependencies'])
    expect(failedGates(assessIncrement({ ...x, dependencies: 'INC-003' }, r))).toEqual(['dependencies'])
    expect(failedGates(assessIncrement({ ...x, serves: 'GAP-099' }, r))).toEqual(['serves'])
    expect(assessIncrement({ ...inc(r, 'INC-004'), offRamp: '' }, r).counts).toBe(true)
  })
  it('dependencies (review Mo2): a cycle and a dependency on a later horizon fail; earlier, same-horizon and short valid inputs pass', () => {
    // a cycle INC-002 → INC-003 → INC-002 (INC-003 already depends on INC-002)
    const cyc = mut((x) => { inc(x, 'INC-002').dependencies = 'INC-003' })
    expect(failedGates(assessIncrement(inc(cyc, 'INC-003'), cyc))).toEqual(['dependencies'])
    expect(assessIncrement(inc(cyc, 'INC-003'), cyc).gates.find((g) => g.id === 'dependencies')!.message).toMatch(/cycle \(INC-003 → INC-002 → INC-003\).*no first step/)
    // INC-002 (near) now depends on INC-003 (mid): a later horizon, and the same edge closes the cycle
    expect(assessIncrement(inc(cyc, 'INC-002'), cyc).gates.find((g) => g.id === 'dependencies')!.message).toMatch(/later horizon/)
    // a near increment depending on the far one, with no cycle
    const later = mut((x) => { inc(x, 'INC-002').dependencies = 'INC-004'; inc(x, 'INC-004').dependencies = '' })
    expect(failedGates(assessIncrement(inc(later, 'INC-002'), later))).toEqual(['dependencies'])
    // valid: on the baseline, on an earlier horizon, on the same horizon, none at all, and a bare ID in lower case
    const r = fx()
    const base = r.increments.find((x) => x.baseline)!.id
    expect(assessIncrement({ ...inc(r, 'INC-003'), dependencies: base }, r).counts).toBe(true)
    expect(assessIncrement({ ...inc(r, 'INC-003'), dependencies: 'inc-002' }, r).counts).toBe(true)
    expect(assessIncrement({ ...inc(r, 'INC-003'), dependencies: '' }, r).counts).toBe(true)
    const same = mut((x) => { inc(x, 'INC-004').horizon = 'mid'; inc(x, 'INC-004').dependencies = 'INC-003' })
    expect(assessIncrement(inc(same, 'INC-004'), same).counts).toBe(true)
    // a failing dependency is not exported as a "precedes" relation
    expect(relationships(cyc).filter((x) => x.type === 'precedes' && ((x.from === 'INC-003' && x.to === 'INC-002') || (x.from === 'INC-002' && x.to === 'INC-003')))).toEqual([])
    expect(relationships(fx())).toContainEqual({ from: 'INC-002', type: 'precedes', to: 'INC-003' })
  })
  it('names say something (review n1): “?”, “n/a” and “-” fail for technology and increment names; a one-word name passes', () => {
    const r = fx()
    for (const v of ['?', 'n/a', '-']) {
      expect(failedGates(assessTech({ ...r.technologies[0], name: v }, r)), v).toEqual(['name'])
      expect(failedGates(assessIncrement({ ...inc(r, 'INC-003'), name: v }, r)), v).toEqual(['name'])
    }
    expect(assessTech({ ...r.technologies[0], name: 'Sensors' }, r).counts).toBe(true)
    expect(assessIncrement({ ...inc(r, 'INC-003'), name: 'Plates' }, r).counts).toBe(true)
  })
  it('levels (review n2): “TBD” and “none” are valid levels, but not both at once', () => {
    const r = fx()
    const g = r.gaps[0]
    expect(failedGates(assessGap({ ...g, desired: 'TBD', baseline: 'none' }, r))).toEqual(['levels'])
    expect(assessGap({ ...g, desired: 'TBD', baseline: 'none' }, r).gates.find((x) => x.id === 'levels')!.message).toMatch(/at least one/)
    expect(assessGap({ ...g, desired: '2 min', baseline: 'none' }, r).counts).toBe(true)
    expect(assessGap({ ...g, desired: 'TBD', baseline: '6 h' }, r).counts).toBe(true)
  })
  it('gating or belonging to the baseline is an advisory, never a gate (review n3)', () => {
    const r = fx()
    const base = r.increments.find((x) => x.baseline)!.id
    const u = assessUnknown({ ...r.unknowns[0], gates: base }, r)
    expect(u.counts).toBe(true)
    expect(u.advisories.map((x) => x.id)).toEqual(['gates-baseline'])
    const a = assessArou({ ...r.arou[0], increment: base }, r)
    expect(a.counts).toBe(true)
    expect(a.advisories.map((x) => x.id)).toEqual(['belongs-baseline'])
    expect(assessUnknown(r.unknowns[0], r).advisories).toEqual([])
  })
  it('unknowns and AROU items', () => {
    const r = fx()
    const u = r.unknowns[0]
    for (const f of ['name', 'impact', 'need', 'mitigation', 'owner'] as const) expect(failedGates(assessUnknown({ ...u, [f]: '' }, r)), f).toEqual([f])
    expect(failedGates(assessUnknown({ ...u, gates: 'INC-099' }, r))).toEqual(['gates'])
    const a = r.arou[0]
    expect(failedGates(assessArou({ ...a, kind: '' }, r))).toEqual(['statement'])
    expect(failedGates(assessArou({ ...a, category: '' }, r))).toEqual(['category'])
    expect(failedGates(assessArou({ ...a, owner: '' }, r))).toEqual(['owner'])
    expect(failedGates(assessArou({ ...a, increment: '' }, r))).toEqual(['increment'])
    expect(assessArou({ ...r.arou[2], category: '' }, r).counts).toBe(true)
  })
  it('impact and review rows', () => {
    expect(failedGates(assessImpact(mut((x) => { x.impact.increment = 'INC-001' })))).toEqual(['increment'])
    expect(failedGates(assessImpact(mut((x) => { x.impact.reached = 'the alarm path' })))).toEqual(['ids'])
    expect(failedGates(assessReviewRow({ week: 2, status: '', items: '', owner: '' }))).toEqual(['status'])
    expect(failedGates(assessReviewRow({ week: 2, status: 'open', items: 'U-001', owner: '' }))).toEqual(['items'])
    expect(assessReviewRow({ week: 1, status: 'ready', items: '', owner: '' }).counts).toBe(true)
  })
})

describe('Week 6 record: part rules', () => {
  it('horizons, the baseline, beyond-near, insertion, the security link, the transition risk and unique IDs each fail', () => {
    expect(allChecks(mut((x) => { x.horizons.mid = '' })).gaps.ok).toBe(false)
    expect(allChecks(mut((x) => { x.increments[0].baseline = false })).increments.ok).toBe(false)
    expect(allChecks(mut((x) => { x.increments.forEach((i) => { if (!i.baseline) i.horizon = 'near' }) })).increments.issues.join(' ')).toMatch(/beyond the near term|mid or far/i)
    expect(allChecks(mut((x) => { x.technologies.forEach((t) => { t.insertion = t.insertion === 'INC-001' ? 'INC-001' : ''; if (!t.insertion) t.notInserted = 'Cost' }) })).technology.ok).toBe(false)
    const noSec = mut((x) => { x.increments.forEach((i) => { i.risks = i.risks.replace(/R-00[23]/g, '') }); x.arou = x.arou.filter((a) => a.category !== 'security') })
    expect(securityLinks(noSec)).toEqual([])
    expect(allChecks(noSec).unknowns.ok).toBe(false)
    const noTr = mut((x) => { x.arou.forEach((a) => { a.transition = false }) })
    expect(transitionRisks(noTr)).toEqual([])
    expect(allChecks(noTr).unknowns.ok).toBe(false)
    expect(allChecks(mut((x) => { x.unknowns[1].id = 'R-007' })).unknowns.ok).toBe(false)
  })
  it('minimums: a team of four needs more than a team of three; only entries passing every gate count', () => {
    const four = mut((x) => { x.gaps = x.gaps.slice(0, LAB6_MINIMUMS_THREE.gaps) })
    expect(allChecks(four).gaps.ok).toBe(LAB6_MINIMUMS_THREE.gaps >= LAB6_MINIMUMS.gaps)
    const three = mut((x) => { x.gaps = x.gaps.slice(0, LAB6_MINIMUMS_THREE.gaps); x.threePersonTeam = true })
    expect(allChecks(three).gaps.ok).toBe(true)
    const bad = mut((x) => { x.gaps.forEach((g) => { g.horizon = '' }) })
    expect(allChecks(bad).gaps.issues.join(' ')).toMatch(/0 so far/)
  })
  it('an entry about AeroLink is refused as a defect', () => {
    expect(allChecks(mut((x) => { x.gaps[0].capability = 'AeroLink vertiport throughput' })).gaps.ok).toBe(false)
  })
})

describe('Week 6 record: imports', () => {
  it('reads the Week 5 file with Week 5’s importer and seeds the baseline increment', () => {
    const s = importWeek5File(WEEK5_JSON)
    expect('snapshot' in s).toBe(true)
    if (!('snapshot' in s)) return
    const r = withWeek5(EMPTY_RECORD, s.snapshot)
    expect(r.increments).toHaveLength(1)
    expect(r.increments[0]).toMatchObject({ id: 'INC-001', baseline: true })
    expect(nextId(r, 'R')).toBe('R-007')
  })
  it('refuses the Week 3, Week 4, Week 6, non-JSON, format-less and AeroLink files with a message', () => {
    expect(importWeek5File(WEEK3_JSON)).toMatchObject({ error: expect.stringMatching(/Week 3/) })
    expect(importWeek5File(JSON.stringify({ format: 'week4-model-inputs', version: 1 }))).toMatchObject({ error: expect.stringMatching(/Week 4/) })
    expect(importWeek5File(JSON.stringify(modelInputs(fx())))).toMatchObject({ error: expect.stringMatching(/Week 6/) })
    expect(importWeek5File('not json')).toMatchObject({ error: expect.stringMatching(/not valid JSON/) })
    expect(importWeek5File('{}')).toMatchObject({ error: expect.stringMatching(/no “format”/) })
    expect(importWeek5File(WEEK5_JSON.replace(/Riverside Food Bank Network/g, 'AeroLink Regional'))).toMatchObject({ error: expect.stringMatching(/AeroLink/) })
    expect(importWeek3File(WEEK5_JSON)).toMatchObject({ error: expect.stringMatching(/Week 5/) })
    expect('extra' in importWeek3File(WEEK3_JSON)).toBe(true)
  })
  it('the optional Week 3 file continues the TECH, U and A numbering', () => {
    const r = fx()
    expect(nextId(r, 'TECH')).toBe('TECH-006')
    expect(nextId(r, 'U')).toBe('U-006')
    expect(nextId(r, 'INC')).toBe('INC-005')
  })
  it('a deleted ID is never reused', () => {
    const r = mut((x) => { x.gaps = x.gaps.slice(0, 4) })
    expect(nextId(normalizeRecord({ ...r, issued: { ...r.issued, GAP: 5 } }), 'GAP')).toBe('GAP-006')
  })
})

describe('Week 6 record: export and teammate share', () => {
  it('JSON round-trips through importWeek6, with format and version', () => {
    const m = modelInputs(fx())
    expect(m).toMatchObject({ format: 'week6-model-inputs', version: 1, status: 'ready' })
    const back = importWeek6(JSON.stringify(m))
    expect('error' in back).toBe(false)
    if ('error' in back) return
    expect(recordState(back)).toBe('ready')
    expect(back.increments.map((x) => x.id)).toEqual(fx().increments.map((x) => x.id))
  })
  it('names the canonical artifact types and projects INC precedes INC, INC delivers TECH, U and R affects INC', () => {
    const m = modelInputs(fx())
    expect(m.increments[0].artifactType).toBe('INC')
    expect(m.technologies[0].artifactType).toBe('TECH')
    expect(m.unknowns[0].artifactType).toBe('U')
    expect(m.arou[0].artifactType).toBe('R')
    expect(m.gaps[0].artifactType).toMatch(/^GAP \(proposed/)
    const rel = relationships(fx())
    expect(rel).toContainEqual({ from: 'INC-002', type: 'precedes', to: 'INC-003' })
    expect(rel).toContainEqual({ from: 'INC-003', type: 'delivers', to: 'TECH-003' })
    expect(rel).toContainEqual({ from: 'U-002', type: 'affects', to: 'INC-003' })
    expect(rel).toContainEqual({ from: 'R-007', type: 'affects', to: 'INC-003' })
  })
  it('refuses the Week 5 file, a wrong version, a text version, bad IDs, duplicates and AeroLink', () => {
    expect(importWeek6(WEEK5_JSON)).toMatchObject({ error: expect.stringMatching(/Week 5/) })
    const m = modelInputs(fx())
    expect(importWeek6(JSON.stringify({ ...m, version: 2 }))).toMatchObject({ error: expect.stringMatching(/version 2/) })
    expect(importWeek6(JSON.stringify({ ...m, version: '1' }))).toMatchObject({ error: expect.stringMatching(/as text/) })
    expect(importWeek6(JSON.stringify({ ...m, gaps: [{ ...m.gaps[0], id: 'G1' }] }))).toMatchObject({ error: expect.stringMatching(/GAP IDs/) })
    expect(importWeek6(JSON.stringify({ ...m, gaps: [m.gaps[0], m.gaps[0]] }))).toMatchObject({ error: expect.stringMatching(/Duplicate/) })
    expect(importWeek6(JSON.stringify({ ...m, gaps: 'x' }))).toMatchObject({ error: expect.stringMatching(/must be a list/) })
    expect(importWeek6(JSON.stringify({ ...m, week5: { ...m.week5, enterprise: 'AeroLink' } }))).toMatchObject({ error: expect.stringMatching(/AeroLink/) })
  })
  it('hasWork guards a teammate import; the empty record has none', () => {
    expect(hasWork(EMPTY_RECORD)).toBe(false)
    expect(hasWork(fx())).toBe(true)
  })
  it('the Markdown carries every part and the roadmap grid as its text equivalent', () => {
    const md = recordMarkdown(fx(), '2026-10-19')
    for (const h of ['## 23.', '## 24.', '## 25.', '## 26.', '## 27.', '### Roadmap grid', '### Phase I baseline review']) expect(md).toContain(h)
    expect(md).toMatch(/INC-003 Cold plates, starts when Summer field test[^|]*inserts TECH-003[^|]*\(immature technology: dashed\)/)
    expect(roadmapGrid(fx()).map((c) => c.increments.length)).toEqual([1, 1, 1, 1])
  })
  it('impact candidates come from the record’s links, never from memory', () => {
    const c = impactCandidates(fx(), 'INC-002')
    expect(c).toEqual(expect.arrayContaining(['IF-006', 'PHY-001', 'FN-005', 'FN-006', 'CMP-001', 'CMP-002', 'AI-001']))
    expect(c).not.toContain('PHY-003')
    expect(impactCandidates(fx(), 'INC-099')).toEqual([])
  })
  it('normalize never throws on junk', () => {
    for (const j of [null, 1, 'x', [], { gaps: 'x', increments: [1, null], review: {} }]) expect(() => normalizeRecord(j)).not.toThrow()
    expect(normalizeRecord(null).review).toHaveLength(5)
  })
})

// Week 7 review M3: Week 6 floored TECH, U, A and R on the imported files but not O, so a new opportunity reused a Week 3
// O ID for a different item. O IDs now continue after the Week 3 opportunities; existing records import unchanged.
describe('Week 6 record: opportunity IDs continue after Week 3 (Week 7 review M3)', () => {
  it('with the Week 3 file loaded, the next O ID follows the Week 3 opportunities', () => {
    const w3 = importWeek3File(WEEK3_JSON)
    if ('error' in w3) throw new Error(w3.error)
    expect(w3.extra.opportunities.map((o) => o.id)).toEqual(['O-001'])
    const r = { ...fx(), arou: fx().arou.filter((a) => !a.id.startsWith('O-')), issued: { ...fx().issued, O: 0 } }
    expect(nextId(normalizeRecord(r), 'O')).toBe('O-002')
  })
  it('negative direction: without the Week 3 data the floor is only the record’s own O IDs', () => {
    const r = normalizeRecord({ ...fx(), week3: null, arou: [], issued: { O: 0 } })
    expect(nextId(r, 'O')).toBe('O-001')
  })
  it('an older Week 3 extra without opportunities still normalizes (format readable)', () => {
    const r = normalizeRecord({ ...fx(), week3: { ...fx().week3, opportunities: undefined } })
    expect(r.week3!.opportunities).toEqual([])
  })
})
