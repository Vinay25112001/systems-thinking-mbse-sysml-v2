// Week 12 pure logic: thread explorer, trace audit, verification planner, RID disposition log.
// Reference items must pass their own checks (AUTHORING_GUIDE §7 rule 4); every check is shown to fail on a realistic
// bad input (rule 5) and the audit numbers move under mutation.
import { describe, expect, it } from 'vitest'
import { completeThreads, type EngineeringModel } from '../../model/engineering'
import { referenceUpTo } from '../../model/reference'
import { audit, auditMarkdown, dispositionProblem, gapKey, predictionOk } from './audit'
import { MODEL_DISPOSITIONS, checkDisposition, checkLog, dispositionOk, type Disposition } from './dispositions'
import { blankPlan, checkPlan, planBatch, planErrors, planFromElement, satisfiersOf, type VerPlan } from './planner'
import { describeThreads, hopsOf, summarise, threadsMarkdown } from './thread'

const ref = referenceUpTo(14)
const byId = (m: EngineeringModel, id: string) => m.elements.find((e) => e.id === id)
const without = (m: EngineeringModel, pred: (l: EngineeringModel['links'][number]) => boolean): EngineeringModel => ({ elements: m.elements, links: m.links.filter((l) => !pred(l)) })
const THREAD_1 = 'STK-005>NEED-004>CAP-003>REQ-SYS-001>FN-006>LOG-002>PHY-003>INFO-003>VER-001>MOP-002>R-001'

describe('digital-thread explorer', () => {
  it('lists every thread of STK-005 with the step reached and names the missing link', () => {
    const rows = describeThreads(ref, 'STK-005')
    expect(rows.some((r) => r.complete && r.ids.join('>') === THREAD_1)).toBe(true)
    const stk = rows.find((r) => r.ids[3] === 'REQ-STK-005')!
    expect(stk.reached).toBe(4)
    expect(stk.missingStep).toBe(5)
    expect(stk.missing).toMatch(/not allocated to a function/)
  })

  it('a stakeholder with no need stops at step 1', () => {
    const [r] = describeThreads(ref, 'STK-008')
    expect(r).toMatchObject({ reached: 1, complete: false, missingStep: 2 })
    expect(r.missing).toMatch(/No NEED derives from this stakeholder/)
  })

  it('explains each hop of demonstration thread 1, including the non-consecutive steps 8–11', () => {
    const hops = hopsOf(ref, THREAD_1.split('>'))
    expect(hops).toHaveLength(11)
    expect(hops.every((h) => h.step === 1 || h.links.length > 0)).toBe(true)
    expect(hops[3].links.map((l) => `${l.source} ${l.type} ${l.target}`)).toEqual(['REQ-SYS-001 derives-from REQ-STK-005', 'REQ-STK-005 derives-from CAP-003'])
    expect(`${hops[8].links[0].source} ${hops[8].links[0].type} ${hops[8].links[0].target}`).toBe('VER-001 verifies REQ-SYS-001')
    expect(`${hops[9].links[0].source} ${hops[9].links[0].type} ${hops[9].links[0].target}`).toBe('MOP-002 measures REQ-SYS-001')
    expect(`${hops[10].links[0].source} ${hops[10].links[0].type} ${hops[10].links[0].target}`).toBe('R-001 affects CAP-003')
  })

  it('mutation: removing the verifies link stops thread 1 at step 8 and the explorer names the VER link', () => {
    const m = without(ref, (l) => l.source === 'VER-001' && l.type === 'verifies')
    const row = describeThreads(m, 'STK-005').find((r) => r.ids.slice(0, 8).join('>') === THREAD_1.split('>').slice(0, 8).join('>'))!
    expect(row.complete).toBe(false)
    expect(row.reached).toBe(8)
    expect(row.missing).toMatch(/VER verifies REQ/)
    expect(completeThreads(m).length).toBeLessThan(completeThreads(ref).length)
  })

  it('summarises the reference: 26 complete threads; four stakeholders have no thread beyond step 1', () => {
    const s = summarise(ref)
    expect(s.reduce((a, x) => a + x.complete, 0)).toBe(26)
    expect(s.filter((x) => x.best === 1).map((x) => x.stakeholder)).toEqual(['STK-008', 'STK-011', 'STK-012', 'STK-013'])
    expect(threadsMarkdown(ref, 'STK-005')).toMatch(/\| 4 \| STK-005 > NEED-004 > CAP-003 > REQ-STK-005 \| step 5/)
  })
})

describe('trace audit', () => {
  it('reproduces the reference numbers stated in the lesson', () => {
    const a = audit(ref)
    expect(a).toMatchObject({
      elements: 204, links: 381,
      parent: { all: { n: 20, of: 20 } },
      satisfied: { all: { n: 12, of: 20 }, stk: { n: 2, of: 10 }, sys: { n: 10, of: 10 } },
      verified: { all: { n: 11, of: 20 }, stk: { n: 1, of: 10 }, sys: { n: 10, of: 10 } },
      upwardToNeedOrCap: { n: 20, of: 20 }, needToStakeholder: { n: 11, of: 11 }, sysSatisfiedWithMethod: { n: 10, of: 10 },
      orphans: [], childless: ['NEED-011'], completeThreads: 26, threadStakeholders: 10,
      stkVerifiedOrThroughChild: { n: 9, of: 10 },
    })
    // NEED-011 is the deliberate childless need (DECISION_LOG W9); REQ-STK-009 records demonstration but has no VER
    // and no child requirement, so it has no verification evidence by any course rule (lesson worked example d).
    expect(a.gaps.map(gapKey)).toEqual(['childless:NEED-011', 'unverified-stk:REQ-STK-009'])
    expect(a.requirements.find((r) => r.id === 'REQ-STK-005')).toMatchObject({ children: ['REQ-SYS-001'], verifiedBy: [] })
    expect(a.digest).toMatch(/^[0-9a-f]{8}$/)
  })

  it('mutation: a REQ-STK with a parent but no child, satisfier or VER is a childless parent (R45 p.118) and unverified', () => {
    const m: EngineeringModel = {
      elements: [...ref.elements, { id: 'REQ-STK-099', kind: 'REQ', name: 'Disruption notice', text: 'The service shall notify affected passengers of a disruption.', provenance: 'team-derived', status: 'active', attributes: { method: 'demonstration' } }],
      links: [...ref.links, { id: 'LNK-T99', source: 'REQ-STK-099', type: 'derives-from', target: 'NEED-011' }],
    } as EngineeringModel
    const gaps = audit(m).gaps.map(gapKey)
    expect(gaps).toContain('childless-stk:REQ-STK-099')
    expect(gaps).toContain('unverified-stk:REQ-STK-099')
    expect(gaps).not.toContain('childless:NEED-011')
    // Removing VER-001 leaves REQ-STK-005 with no verified child.
    expect(audit(without(ref, (l) => l.source === 'VER-001')).gaps.map(gapKey)).toContain('unverified-stk:REQ-STK-005')
  })

  it('counts active elements only, and the digest moves when the model does', () => {
    const retired: EngineeringModel = { links: ref.links, elements: ref.elements.map((e) => (e.id === 'PHY-008' ? { ...e, status: 'retired' as const } : e)) }
    const a = audit(ref)
    const b = audit(retired)
    expect(b.elements).toBe(a.elements - 1)
    expect(b.links).toBeLessThan(a.links)
    expect(b.digest).not.toBe(a.digest)
    expect(audit(ref).digest).toBe(a.digest)
  })

  it('mutation: an orphan, an unverified and an unsatisfied REQ-SYS and a missing method are each detected', () => {
    const orphan = audit(without(ref, (l) => l.source === 'REQ-SYS-003' && l.type === 'derives-from'))
    expect(orphan.orphans).toEqual(['REQ-SYS-003'])
    expect(orphan.upwardToNeedOrCap).toEqual({ n: 19, of: 20 })
    const unver = audit(without(ref, (l) => l.source === 'VER-001'))
    expect(unver.gaps.map(gapKey)).toContain('unverified-sys:REQ-SYS-001')
    // REQ-SYS-001 is satisfied by PHY-003 and (as a contribution) IF-005: removing only one link keeps it satisfied.
    expect(audit(without(ref, (l) => l.source === 'PHY-003' && l.type === 'satisfies' && l.target === 'REQ-SYS-001')).satisfied.sys.n).toBe(10)
    expect(audit(without(ref, (l) => l.type === 'satisfies' && l.target === 'REQ-SYS-001')).gaps.map(gapKey)).toContain('unsatisfied-sys:REQ-SYS-001')
    const noMethod: EngineeringModel = { links: ref.links, elements: ref.elements.map((e) => (e.id === 'REQ-SYS-002' ? { ...e, attributes: { ...e.attributes, method: '' } } : e)) }
    expect(audit(noMethod).sysSatisfiedWithMethod).toEqual({ n: 9, of: 10 })
  })

  it('the export carries the numbers, the counting rules and a disposition per gap', () => {
    const a = audit(ref)
    const md = auditMarkdown(a, 'reference', { 'childless:NEED-011': 'Deliberate reference gap (DECISION_LOG W9); a disruption-notice REQ-STK is a lead decision.' }, '2026-10-11T12:00:00Z')
    expect(md).toMatch(/\| Satisfied \| 12 of 20 \(60 %\) \| 2 of 10 \(20 %\) \| 10 of 10 \(100 %\) \|/)
    expect(md).toMatch(new RegExp(`Model: 204 active elements, 381 links between them; digest ${a.digest} .*generated 2026-10-11T12:00:00Z`))
    expect(md).toMatch(/\| REQ-STK-005 \| NEED-004, CAP-003 \| yes \| REQ-SYS-001 \| — \| — \|/)
    expect(md).toMatch(/\| REQ-SYS-001 \| REQ-STK-005 \| yes \| — \| PHY-003, IF-005 \| VER-001 \|/)
    expect(md).toMatch(/\| NEED-011 \| Childless parent.*\| Deliberate reference gap/)
    expect(md).toMatch(/Counting rules/)
    expect(auditMarkdown(a, 'reference')).toMatch(/\(none recorded\)/)
  })

  it('a disposition must be a sentence with an action or a reason, and an owner or a tracking item', () => {
    expect(dispositionProblem('ok')).not.toBeNull()
    expect(dispositionProblem('TBD, will look at this later on')).not.toBeNull()
    expect(dispositionProblem('We will look into this gap at some point')).not.toBeNull()
    expect(dispositionProblem('Write a disruption-notice requirement for this need soon.')).toMatch(/owner/)
    expect(dispositionProblem('Deliberate reference gap kept for teaching; recorded in DECISION_LOG W9 by the lead.')).toBeNull()
    expect(dispositionProblem('Write REQ-STK-011 for disruption notice from NEED-011 (owner AL, by CP5).')).toBeNull()
  })
})

describe('verification planner', () => {
  const vers = ref.elements.filter((e) => e.kind === 'VER')
  const ctx = (id: string) => ({ satisfiers: satisfiersOf(ref, id) })
  it('every reference VER passes every check with no warning (rule 4)', () => {
    expect(vers).toHaveLength(11)
    for (const v of vers) {
      const p = planFromElement(v)
      const bad = checkPlan(p, byId(ref, p.target), ctx(p.target)).filter((c) => c.severity !== 'ok')
      expect(bad.map((c) => `${v.id} ${c.field}: ${c.message}`)).toEqual([])
    }
  })

  const base = planFromElement(byId(ref, 'VER-001')!)
  const v2 = planFromElement(byId(ref, 'VER-002')!)
  const v4 = planFromElement(byId(ref, 'VER-004')!)
  const v8 = planFromElement(byId(ref, 'VER-008')!)
  const req = (id: string) => byId(ref, id)
  const errs = (p: VerPlan, id = p.target) => planErrors(p, req(id), ctx(id)).map((c) => `${c.field}: ${c.message}`).join('\n')
  const warns = (p: VerPlan, id = p.target) => checkPlan(p, req(id), ctx(id)).filter((c) => c.severity === 'warning').map((c) => `${c.field}: ${c.message}`).join('\n')

  it('flags an untestable criterion (judgement word, hedge without a number, circular, or without number and comparison)', () => {
    expect(errs({ ...base, successCriterion: 'The charger charges the aircraft quickly enough for the turnaround in normal operation.' })).toMatch(/Untestable criterion: “quickly” is not measurable on its own/)
    expect(errs({ ...base, successCriterion: 'All 30 test charges at the hub show that REQ-SYS-001 is satisfied.' })).toMatch(/restates that the requirement is met/)
    expect(errs({ ...base, successCriterion: 'The charge time is recorded for each charge and reviewed by the team.' })).toMatch(/no number.*no comparison/)
    // B5: a count and "all" do not rescue a judgement.
    expect(errs({ ...base, successCriterion: 'All 30 charge tests performed well at the hub' })).toMatch(/“well” is a judgement/)
  })

  it('accepts good criteria that carry a number and a comparison (G1, G3, G4, G5, G7)', () => {
    expect(errs({ ...v4, successCriterion: 'A hold is correctly placed for all 20 injected exceedances and for none of 20 in-limit forecasts' })).toBe('')
    expect(errs({ ...base, successCriterion: `${base.successCriterion}, which complies with REQ-SYS-001` })).toBe('')
    expect(errs({ ...v2, successCriterion: `${v2.successCriterion}, with background noise at least 10 dB below each event` })).toBe('')
    expect(errs({ ...base, successCriterion: 'All 30 charges from 20 % state of charge reach the dispatch threshold in <= 1200 s' })).toBe('')
    expect(errs({ ...v8, successCriterion: 'All 20 injected no-go faults reliably set the aircraft unavailable in <= 2 min and the dispatch interlock blocks release' })).toBe('')
    // "as well as" is not the judgement word "well".
    expect(errs({ ...v8, successCriterion: 'All 20 injected no-go faults set the aircraft unavailable in <= 2 min as well as blocking release' })).toBe('')
  })

  it('flags a limit that differs from the requirement, including an allowance on top of it (B3)', () => {
    expect(errs({ ...base, successCriterion: 'All 30 charges from 20 % reach the dispatch threshold in <= 22 min' })).toMatch(/limit \(22 min\) is not the requirement’s \(20 min\)/)
    expect(errs({ ...base, successCriterion: 'All 30 charges reach the dispatch threshold in <= 22 min (requirement 20 min, 2 min allowance)' })).toMatch(/limit \(22 min\) is not the requirement’s/)
  })

  it('flags method/requirement mismatches on realistic plans', () => {
    // A datasheet "inspection" of a charge time: a performance quantity cannot be inspected.
    expect(errs({ ...base, method: 'inspection', successCriterion: 'Supplier datasheet gives a rated charge time from 20 % of <= 20 min' })).toMatch(/Inspection checks properties determined by observation/)
    // A "demonstration" of a latency percentile: a warning that asks which case applies, citing both sources.
    const v5 = planFromElement(byId(ref, 'VER-005')!)
    const demo = { ...v5, method: 'demonstration' as const, successCriterion: 'Demonstrate that 99 % of 200 replayed requests are assigned within 60 s' }
    expect(errs(demo)).toBe('')
    expect(warns(demo)).toMatch(/quantitative assurance is not required \(R49 p\.149\).*statistical terms.*\(R23a p\.639\)/)
    // Analysis instead of the recorded test: a warning, not an error.
    expect(warns({ ...base, method: 'analysis' })).toMatch(/records test/)
    // A test of a monthly availability requirement.
    const v6 = planFromElement(byId(ref, 'VER-006')!)
    expect(warns({ ...v6, method: 'test' })).toMatch(/long period/)
  })

  it('G2: a demonstration of a requirement stated in statistical terms (MTTR) is not blocked (R23a p.639)', () => {
    const mttr = { id: 'REQ-SYS-901', kind: 'REQ', name: 'Mean time to repair', text: 'The maintenance function shall return an aircraft with a no-go fault to service with a mean time to repair of at most 2 h.', provenance: 'team-derived', status: 'active', attributes: { method: 'demonstration', criterion: 'Mean time to repair <= 2 h over 10 demonstrated repairs', type: 'performance' } } as unknown as Parameters<typeof checkPlan>[1]
    const p: VerPlan = { target: 'REQ-SYS-901', method: 'demonstration', objective: 'Demonstrate that technicians restore aircraft with no-go faults within the mean repair time.', subject: 'LOG-003 with PHY-005', level: 'system', environment: 'Hub maintenance bay, day shift, standard tools', successCriterion: 'Mean time to repair <= 2 h over 10 demonstrated repairs', pass: 'mean of 10 repairs <= 2 h', fail: 'mean of 10 repairs > 2 h', inconclusive: 'fewer than 10 repairs demonstrated' }
    const checks = checkPlan(p, mttr)
    expect(checks.filter((c) => c.severity === 'error')).toEqual([])
    expect(checks.some((c) => c.severity === 'warning' && /mean time to repair \(R23a p\.639\)/.test(c.message))).toBe(true)
    // REQ-SYS-004's own 30 min forecast window quoted in a demonstration criterion: a warning, never a block.
    expect(errs({ ...v4, successCriterion: 'Holds placed for all 20 injected forecasts above TBD-01 within the next 30 min window and for none of 20 in-limit forecasts' })).toBe('')
  })

  it('flags verdict logic that cannot be decided: missing, inconclusive = fail, or a TBD ignored', () => {
    expect(errs({ ...base, inconclusive: '' })).toMatch(/inconclusive: State the inconclusive condition/)
    expect(errs({ ...base, inconclusive: 'any charge > 20.0 min', fail: 'any charge > 20.0 min' })).toMatch(/must not be the same condition as fail/)
    expect(errs({ ...v4, inconclusive: 'fewer than 20 injected forecasts were run' })).toMatch(/REQ-SYS-004 still carries TBD-01 \(U-001\)/)
  })

  it('flags pass and fail conditions that are not complementary on the requirement limit (B2, B4, B6)', () => {
    // B2: 20–25 min would get no verdict.
    expect(errs({ ...base, fail: 'any charge > 25 min' })).toMatch(/fail threshold \(25 min\) is not the requirement’s limit \(20 min\)/)
    // B6: the comparison reversed in the pass condition.
    expect(errs({ ...base, pass: 'all 30 charges >= 20.0 min' })).toMatch(/pass condition compares the wrong way/)
    // B4: the inconclusive condition paraphrases the fail condition.
    expect(errs({ ...base, fail: 'any charge exceeds 20 min', inconclusive: 'the measured charge time is over 20 min' })).toMatch(/must not be the same condition as fail/)
    // A judgement in the pass condition.
    expect(errs({ ...base, pass: 'all 30 charges went well' })).toMatch(/pass condition uses “well”/)
  })

  it('subjects: an element ID is required; ENT- is allowed for a stakeholder requirement (G6); a non-satisfier is questioned (B1)', () => {
    expect(errs({ ...base, subject: 'the hub charger' })).toMatch(/Name the element under verification by its ID/)
    expect(errs({ ...base, environment: 'hub' })).toMatch(/realistic conditions/)
    expect(planErrors(blankPlan('REQ-SYS-099'), undefined).some((c) => c.field === 'target')).toBe(true)
    const g6: VerPlan = { target: 'REQ-STK-004', method: 'analysis', objective: 'Show by capacity analysis that the six-vertiport network serves the required daily trips by month 24.', subject: 'ENT-001 network of six vertiports', level: 'system', environment: 'Week 1 dynamics model, month-24 fleet and charger plan', successCriterion: 'Modelled capacity >= 300 trips/day in each of 1000 simulated days', pass: 'all 1000 days at least 300 trips', fail: 'any simulated day below 300 trips', inconclusive: 'model not yet calibrated against VER-006 availability data' }
    expect(errs(g6)).toBe('')
    expect(warns(g6)).toBe('')
    // B1: VER-001 aimed at the fire-detection element; the checker would accept it silently.
    expect(errs({ ...base, subject: 'PHY-008 fire detection' })).toBe('')
    expect(warns({ ...base, subject: 'PHY-008 fire detection' })).toMatch(/None of the elements that satisfy REQ-SYS-001 \(PHY-003, IF-005\) is named/)
  })

  it('builds one VER with owner, provenance and the verifies link', () => {
    const b = planBatch(base, 'Charge-time test, hub 2', { owner: 'jd', provenance: 'AI-suggested-reviewed' })
    expect(b.elements[0]).toMatchObject({ kind: 'VER', owner: 'JD', provenance: 'AI-suggested-reviewed' })
    expect(String(b.elements[0].attributes.verdictLogic)).toMatch(/^pass: .*; fail: .*; inconclusive: .*; error: /)
    expect(b.links).toEqual([{ source: 'ver', type: 'verifies', target: 'REQ-SYS-001' }])
  })
})

describe('trace audit predictions', () => {
  it('accepts only a percentage from 0 to 100', () => {
    expect(predictionOk('60')).toBe(true)
    expect(predictionOk('55.5 %')).toBe(true)
    expect(predictionOk('')).toBe(false)
    expect(predictionOk('about half')).toBe(false)
    expect(predictionOk('120')).toBe(false)
  })
})

describe('RID disposition log', () => {
  it('the model dispositions pass the screens (rule 4)', () => {
    for (const d of MODEL_DISPOSITIONS) expect(checkDisposition(d).filter((c) => !c.ok).map((c) => `${d.rid} ${c.field}: ${c.message}`)).toEqual([])
    expect(checkLog(MODEL_DISPOSITIONS, 5).every((c) => c.ok)).toBe(true)
  })

  const accept = MODEL_DISPOSITIONS[0]
  const failing = (d: Disposition) => checkDisposition(d).filter((c) => !c.ok)
  it('an acceptance without a findable change or closure evidence is flagged', () => {
    const d: Disposition = { ...accept, change: 'Fixed as suggested by the reviewing team, thank you.', evidence: 'Done and looks fine now.' }
    expect(failing(d).map((c) => c.field)).toEqual(['change', 'evidence'])
  })

  it('an acceptance closed by a promise, a pending check or a pointer is flagged (D1, D2, D7)', () => {
    const d1: Disposition = { ...accept, change: 'Will change REQ-SYS-001 next week.', evidence: 'Will run the checker afterwards.' }
    expect(failing(d1).map((c) => c.field)).toEqual(['change', 'evidence'])
    expect(failing(d1)[0].message).toMatch(/promise/)
    expect(failing({ ...accept, evidence: 'Audit pending.' }).map((c) => c.field)).toEqual(['evidence'])
    const d7: Disposition = { ...accept, change: 'Recorded the RID against REQ-SYS-001.', evidence: 'See the log.' }
    expect(failing(d7).map((c) => c.message).join(' ')).toMatch(/Recording the RID is not a change.*“See the log” cannot be checked/)
  })

  it('a rejection without a cited criterion, or of a major RID without confirmation, is flagged (D3)', () => {
    const d: Disposition = { ...MODEL_DISPOSITIONS[1], reason: 'We disagree with this finding because it is not important for our model at this stage.' }
    expect(dispositionOk(d)).toBe(false)
    const unconfirmed: Disposition = { ...MODEL_DISPOSITIONS[1], reason: 'RB-9.2 counts REQ-SYS only, and two requirements derived from REQ-STK-004 are verified (VER-006, VER-007).' }
    expect(failing(unconfirmed).some((c) => /get the reviewer or the instructor to confirm it/.test(c.message))).toBe(true)
    // D3: a bare requirement ID is not a criterion, and telling the instructor is not a confirmation.
    const d3: Disposition = { ...MODEL_DISPOSITIONS[1], reason: 'We disagree with this RID on REQ-STK-004 and the instructor was told about it.' }
    expect(failing(d3).map((c) => c.message).join(' ')).toMatch(/Naming the element is not a criterion.*Telling them is not a confirmation/)
  })

  it('a deferral needs a firm checkpoint and a tracked open item; a major RID is fixed by the CP5 submission (D4)', () => {
    const d: Disposition = { ...MODEL_DISPOSITIONS[3], change: 'We will add the branch when we have more time.', evidence: 'Noted in our meeting minutes.' }
    expect(failing(d).map((c) => c.field)).toEqual(['change', 'evidence'])
    const late: Disposition = { ...MODEL_DISPOSITIONS[3], severity: 'major', change: 'Add the A3 branch after CP5 in the next release.' }
    expect(failing(late).some((c) => /fixed by the CP5 submission/.test(c.message))).toBe(true)
    const d4: Disposition = { ...MODEL_DISPOSITIONS[3], severity: 'major', change: "Add decide holdDuration in Behavior::'SCN-005' by CP5 if time allows, otherwise after the course." }
    expect(failing(d4).map((c) => c.field)).toEqual(['change', 'change'])
    const ok: Disposition = { ...MODEL_DISPOSITIONS[3], severity: 'major' }
    expect(failing(ok)).toEqual([])
  })

  it('the log is incomplete until every received RID has an owned disposition', () => {
    expect(checkLog(MODEL_DISPOSITIONS.slice(0, 3), 5)[0].ok).toBe(false)
    expect(checkLog([{ ...accept, owner: '' }], 1).some((c) => !c.ok && /without the owner/.test(c.message))).toBe(true)
  })
})
