import { describe, expect, it } from 'vitest'
import { citationInRange } from '../../content/readings'
import { referenceUpTo } from '../../model/reference'
import type { EngineeringModel } from '../../model/engineering'
import { FLAWED, draftFromFlawed } from './critique'
import { ITEMS, gradeItem, refText, scoreAll } from './classify'
import {
  EMPTY_DRAFT, buildBatch, checkRequirement, countShall, hasMeasurableValue, parentLevelFinding, restatementRatio, subjectOf, summarise, vagueTermsIn,
  type CheckId, type CheckStatus, type Draft,
} from './quality'
import { auditSet, drawSample, draftOf, rb3Level, rb3SelfAudit } from './trace'

/** A draft that passes every check: REQ-STK-005 → REQ-SYS-001 from the reference, with its attributes. */
const good: Draft = {
  level: 'SYS',
  name: 'Charge to dispatch threshold in 20 min',
  text: 'The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min.',
  type: 'performance',
  method: 'test',
  criterion: 'Charge time from 20 % reserve to dispatch threshold <= 20 min',
  rationale: 'The worst planned arrival state is the 20 % reserve; meeting 20 min from that state keeps the 25 min hub turnaround of REQ-STK-005 achievable.',
  parents: ['REQ-STK-005'],
  arou: [],
}
const status = (d: Draft, id: CheckId): CheckStatus => checkRequirement(d).find((c) => c.id === id)!.status

describe('quality heuristics: the baseline passes', () => {
  it('a well-formed reference requirement passes every check (no fail, no advisory except n/a)', () => {
    const r = checkRequirement(good)
    expect(r.filter((c) => c.status === 'fail' || c.status === 'advisory').map((c) => c.id)).toEqual([])
    expect(summarise(r).recordable).toBe(true)
  })

  it('every check cites only verified pages, and every check has a characteristic', () => {
    for (const c of checkRequirement(good)) {
      expect(c.cite.length, c.id).toBeGreaterThan(0)
      for (const cit of c.cite) expect(citationInRange(cit), `${c.id} ${cit.reading} ${cit.pages}`).toBe(true)
      expect(c.characteristic.length).toBeGreaterThan(10)
    }
  })

  it('all 20 reference requirements have no failing check (the instructor set meets its own rules)', () => {
    const a = auditSet(referenceUpTo(4))
    expect(a.total).toBe(20)
    expect(a.reqs.filter((r) => r.fails.length).map((r) => `${r.id}: ${r.fails.join(',')}`)).toEqual([])
    expect(a.clean).toBe(20)
    expect(a.sizeOk).toBe(true)
    expect(a.missingTypes).toEqual([])
    expect(a.duplicates).toEqual([])
    expect(a.orphans).toEqual([])
  })

  it('the reference REQ-STK-003 is flagged only as advisory for “shall not” (a deliberate teaching tension, R55 p.370)', () => {
    const m = referenceUpTo(4)
    const r = auditSet(m).reqs.find((x) => x.id === 'REQ-STK-003')!
    expect(r.fails).toEqual([])
    expect(r.advisories).toContain('negative')
    // its TBD is covered by U-001 through an affects link
    expect(draftOf(m.elements.find((e) => e.id === 'REQ-STK-003')!, m).arou).toEqual(['U-001'])
  })
})

describe('quality heuristics: mutation tests (each check can fail and can pass)', () => {
  it('subject', () => {
    expect(status({ ...good, text: 'Shall charge an aircraft within 20 min.' }, 'subject')).toBe('fail')
    expect(subjectOf('If the container is missing, the Coffee Maker shall prohibit brewing.')).toBe('the Coffee Maker')
  })
  it('single shall: zero and two both fail', () => {
    expect(status({ ...good, text: good.text.replace('shall', 'will') }, 'single-shall')).toBe('fail')
    expect(status({ ...good, text: `${good.text} It shall also log the session.` }, 'single-shall')).toBe('fail')
    expect(countShall('Shall we? The X shall Y.')).toBe(2)
  })
  it('binding: should / may / will are advisories', () => {
    expect(status({ ...good, text: 'The charging system should charge an aircraft within 20 min.' }, 'binding')).toBe('advisory')
    expect(status(good, 'binding')).toBe('pass')
  })
  it('vague: fails without a value, advisory with one, ignores hyphenated compounds', () => {
    expect(status({ ...good, text: 'The charging system shall charge aircraft quickly.' }, 'vague')).toBe('fail')
    expect(status({ ...good, text: 'The charging system shall charge aircraft quickly, within 20 min.' }, 'vague')).toBe('advisory')
    expect(vagueTermsIn('a high-power charger below the limit')).toEqual([])
    expect(vagueTermsIn('a safe and user-friendly app')).toEqual(['safe', 'user-friendly'])
  })
  it('measurable: performance without a value fails; a TBD counts; a functional requirement is advisory', () => {
    expect(status({ ...good, text: 'The charging system shall charge an aircraft to the dispatch threshold.' }, 'measurable')).toBe('fail')
    expect(status({ ...good, text: 'The charging system shall charge an aircraft within TBD-03 min.' }, 'measurable')).toBe('pass')
    expect(status({ ...good, type: 'functional', text: 'The service shall confirm there is no open no-go fault before each dispatch.' }, 'measurable')).toBe('advisory')
    expect(hasMeasurableValue('at least 300 trips per day')).toBe(true)
    expect(hasMeasurableValue('by month 24')).toBe(false)
  })
  it('range: a one-point value is an advisory', () => {
    expect(status({ ...good, text: 'The system shall send the alarm in 30 s.' }, 'range')).toBe('advisory')
    expect(status({ ...good, text: 'The system shall send the alarm within 30 s of detection.' }, 'range')).toBe('pass')
  })
  it('negative and design-free', () => {
    expect(status({ ...good, text: 'The system shall not dispatch within 20 min of a fault.' }, 'negative')).toBe('advisory')
    expect(status({ ...good, text: 'The charging system shall charge using two 350 kW chargers within 20 min.' }, 'design-free')).toBe('advisory')
    expect(status(good, 'design-free')).toBe('pass')
  })
  it('TBX: a TBD with no AROU item fails; an existing U item or a complete new Unknown passes', () => {
    const tbd = { ...good, text: 'The charging system shall limit vertiport power to at most TBD-02 kW.' }
    const nu = { name: 'Grid limit', text: 'Utility has not confirmed connection capacity', owner: 'Infrastructure Manager', resolution: 'Signed connection agreement per vertiport', needBy: 'Week 7 trade study' }
    expect(status(tbd, 'tbx')).toBe('fail')
    expect(status({ ...tbd, arou: ['U-002'] }, 'tbx')).toBe('pass')
    expect(status({ ...tbd, arou: ['R-001'] }, 'tbx')).toBe('fail') // a risk does not record an unknown value
    expect(status({ ...tbd, newUnknown: { ...nu, owner: '' } }, 'tbx')).toBe('fail')
    expect(status({ ...tbd, newUnknown: { ...nu, resolution: '' } }, 'tbx')).toBe('fail') // W4-F05: resolution work required
    expect(status({ ...tbd, newUnknown: { ...nu, needBy: ' ' } }, 'tbx')).toBe('fail') // W4-F05: need-by date required
    expect(status({ ...tbd, newUnknown: nu }, 'tbx')).toBe('pass')
    expect(status(good, 'tbx')).toBe('na')
  })
  it('TBX (W4-F12): the linked item must own this TBX; an Assumption may own only a TBR; every token is checked', () => {
    const tbd = { ...good, text: 'The charging system shall limit vertiport power to at most TBD-02 kW.' }
    expect(status({ ...tbd, arou: ['U-001'], arouTbd: { 'U-001': 'TBD-01' } }, 'tbx')).toBe('fail') // wrong Unknown
    expect(status({ ...tbd, arou: ['U-002'], arouTbd: { 'U-002': 'TBD-02' } }, 'tbx')).toBe('pass')
    expect(status({ ...tbd, arou: ['A-002'] }, 'tbx')).toBe('fail') // an assumption is not an unknown value
    const tbr = { ...good, text: 'The charging system shall charge an aircraft to the dispatch threshold within 20 min (TBR-01).' }
    expect(status({ ...tbr, arou: ['A-007'] }, 'tbx')).toBe('pass')
    const both = { ...good, text: 'The charging system shall limit power to TBD-02 kW within 20 min (TBR-01).' }
    expect(status({ ...both, arou: ['U-002'], arouTbd: { 'U-002': 'TBD-02' } }, 'tbx')).toBe('fail') // TBR-01 unowned
    expect(status({ ...both, arou: ['U-002', 'A-007'], arouTbd: { 'U-002': 'TBD-02' } }, 'tbx')).toBe('pass')
    expect(buildBatch({ ...both, arou: ['U-002', 'A-007'] }).elements![0].attributes!.tbd).toBe('TBD-02, TBR-01')
  })
  it('method and method fit', () => {
    expect(status({ ...good, method: undefined }, 'method')).toBe('fail')
    expect(status({ ...good, method: 'demonstration' }, 'method-fit')).toBe('fail')
    expect(status({ ...good, method: 'inspection', type: 'constraint' }, 'method-fit')).toBe('fail') // "within 20 min" needs quantitative evidence
    expect(status({ ...good, text: 'The vertiport shall provide a step-free route from terminal to cabin at every pad.', method: 'inspection', type: 'constraint', criterion: 'Step-free route at all 6 vertiports' }, 'method-fit')).toBe('pass')
  })
  it('criterion: missing or vague fails for every type; one without a threshold or population is an advisory', () => {
    expect(status({ ...good, criterion: '' }, 'criterion')).toBe('fail')
    expect(status({ ...good, type: 'functional', criterion: '' }, 'criterion')).toBe('fail')
    expect(status({ ...good, type: 'constraint', criterion: '' }, 'criterion')).toBe('fail')
    expect(status({ ...good, criterion: 'Availability as high as possible' }, 'criterion')).toBe('fail')
    expect(status({ ...good, criterion: 'Charging works in the trials' }, 'criterion')).toBe('advisory')
    expect(status({ ...good, criterion: 'Hold placed for every injected forecast above TBD-01' }, 'criterion')).toBe('pass')
  })
  it('rationale: too short or a restatement fails', () => {
    expect(status({ ...good, rationale: 'Needed.' }, 'rationale')).toBe('fail')
    const restated = 'The charging system must charge an aircraft from the 20 % reserve to the dispatch threshold within 20 min.'
    expect(restatementRatio(good.text, restated)).toBeGreaterThanOrEqual(0.7)
    expect(status({ ...good, rationale: restated }, 'rationale')).toBe('fail')
  })
  it('parent and parent level', () => {
    expect(status({ ...good, parents: [] }, 'parent')).toBe('fail')
    expect(parentLevelFinding('STK', ['REQ-SYS-001']).status).toBe('fail')
    expect(parentLevelFinding('STK', ['NEED-004', 'CAP-003']).status).toBe('pass')
    expect(parentLevelFinding('SYS', ['NEED-004']).status).toBe('advisory')
    expect(parentLevelFinding('SYS', ['REQ-STK-005']).status).toBe('pass')
  })
})

// W4-F01 regression probes: plausibly worded, unverifiable requirements that used to be recorded with no failing check.
describe('quality lab: unverifiable requirements are no longer recordable (W4-F01)', () => {
  const base: Draft = { ...good, criterion: '', parents: ['REQ-STK-005'] }
  const fails = (d: Draft) => checkRequirement(d).filter((c) => c.status === 'fail').map((c) => c.id)
  it('(a) a count of things does not bound a vague word', () => {
    const d = { ...base, text: 'The aircraft shall be safe and quiet for 4 passengers.', type: 'performance' as const, method: 'test' as const, criterion: 'Safe and quiet in every flight with 4 passengers' }
    expect(fails(d)).toEqual(expect.arrayContaining(['vague', 'criterion']))
    expect(summarise(checkRequirement(d)).recordable).toBe(false)
    // a measured, bounded value still softens a vague word to an advisory
    expect(status({ ...base, text: 'The charging system shall charge aircraft quickly, within 20 min.' }, 'vague')).toBe('advisory')
  })
  it('(b) re-typing as functional or constraint no longer switches the checks off', () => {
    const support = { ...base, text: 'The system shall support the operations.', type: 'functional' as const, method: 'inspection' as const }
    expect(fails(support)).toEqual(expect.arrayContaining(['vague', 'criterion']))
    const retyped = { ...base, text: 'The scheduling function shall assign an aircraft within 60 s of confirmation.', type: 'functional' as const, method: 'demonstration' as const, criterion: 'Aircraft assigned in every demonstrated request' }
    expect(fails(retyped)).toEqual(['method-fit'])
    expect(fails({ ...retyped, type: 'constraint' })).toEqual(['method-fit'])
    expect(fails({ ...retyped, method: 'test' })).toEqual([])
    // a value inside a condition clause describes the situation, so demonstration can still fit (reference REQ-SYS-004)
    expect(status({ ...retyped, text: 'The operations system shall place a dispatch hold on any vertiport whose forecast wind within the next 30 min exceeds the limit (TBD-01).', arou: ['U-001'] }, 'method-fit')).toBe('pass')
  })
  it('(c) superlatives and a missing criterion fail', () => {
    const d = { ...base, text: 'The fleet shall achieve the highest availability possible.', type: 'functional' as const, method: 'analysis' as const }
    expect(fails(d)).toEqual(expect.arrayContaining(['vague', 'criterion']))
    expect(fails({ ...d, criterion: 'Availability as high as possible' })).toEqual(expect.arrayContaining(['vague', 'criterion']))
  })
  it('the trace checker no longer counts them as clean, and the RB-3.2 proxy drops (mutation of the reference)', () => {
    const m = referenceUpTo(4)
    const bad = m.elements.map((e) => (e.id === 'REQ-SYS-006' ? { ...e, text: 'The fleet shall achieve the highest availability possible.', attributes: { ...e.attributes, type: 'functional', criterion: '' } } : e))
    const a = auditSet({ ...m, elements: bad })
    expect(a.clean).toBe(19)
    const r = a.reqs.find((x) => x.id === 'REQ-SYS-006')!
    expect(r.fails).toEqual(expect.arrayContaining(['vague', 'criterion']))
    const sample = drawSample(a.reqs.map((x) => x.id), 3, 20)
    expect(rb3SelfAudit(a.reqs, sample).find((x) => x.id === '3.2')!.met).toBe(19)
  })
  it('design-free catches equipment named with a count, a rating or a brand (W4-F11), and says what it cannot see', () => {
    expect(status({ ...base, text: 'The charging system shall provide two 350 kW DC fast chargers per hub pad.' }, 'design-free')).toBe('advisory')
    expect(status({ ...base, text: 'The vertiport shall be equipped with a Brand-X fire suppression system.' }, 'design-free')).toBe('advisory')
    // the limit stated in the F3 reviewer-only note: a design written in plain words passes
    expect(status({ ...base, text: 'The charging system shall have enough charging hardware at each hub for a 350 kW draw.' }, 'design-free')).toBe('pass')
  })
})

describe('critique examples', () => {
  it('the heuristics raise every check the worked example says they raise', () => {
    for (const f of FLAWED) {
      const raised = checkRequirement(draftFromFlawed(f)).filter((c) => c.status === 'fail' || c.status === 'advisory').map((c) => c.id)
      for (const h of f.heuristics) expect(raised, `${f.id} ${h}`).toContain(h)
      for (const fd of f.findings) expect(citationInRange(fd.cite), `${f.id}`).toBe(true)
    }
  })
  it('F3 shows the limit of heuristics: the design-dictating number passes the measurable check', () => {
    const f3 = FLAWED.find((f) => f.id === 'F3')!
    expect(status(draftFromFlawed(f3), 'measurable')).toBe('pass')
  })
  it('REQ-SYS-005 statement and criterion agree on the share of requests (W4-F02)', () => {
    const e = referenceUpTo(4).elements.find((x) => x.id === 'REQ-SYS-005')!
    expect(e.text).toContain('at least 99 % of confirmed ride requests')
    expect(String(e.attributes!.criterion)).toContain('at least 99 %')
    expect(e.text).not.toMatch(/\beach confirmed\b/)
  })
  it('each rewrite is the reference text and passes the statement-level checks', () => {
    const m = referenceUpTo(4)
    for (const f of FLAWED) {
      const ref = m.elements.find((e) => e.id === f.rewriteId)!
      expect(ref.text, f.id).toBe(f.rewrite)
      const audit = auditSet(m).reqs.find((r) => r.id === f.rewriteId)!
      expect(audit.fails, f.id).toEqual([])
      // with the reference attributes and links, a rewrite raises no advisory either (instructor answer key claim)
      expect(audit.advisories, f.id).toEqual([])
    }
  })
})

describe('workspace batch', () => {
  it('builds one REQ with derives-from links, and a new Unknown with an affects link for a TBD', () => {
    const b = buildBatch(
      { ...good, text: 'The charging system shall limit vertiport power to at most TBD-02 kW.', newUnknown: { name: 'Grid limit', text: 'Utility has not confirmed connection capacity', owner: 'Infrastructure Manager', resolution: 'Signed connection agreement', needBy: 'Week 7' } },
      { owner: 'jd', provenance: 'AI-suggested-reviewed' },
    )
    expect(b.elements!.map((e) => [e.key, e.kind])).toEqual([['req', 'REQ'], ['u', 'U']])
    expect(b.elements!.map((e) => [e.owner, e.provenance])).toEqual([['JD', 'AI-suggested-reviewed'], ['JD', 'AI-suggested-reviewed']])
    expect(b.elements![1].attributes).toEqual({ owner: 'Infrastructure Manager', resolution: 'Signed connection agreement', needBy: 'Week 7', tbd: 'TBD-02' })
    expect(b.elements![0].reqLevel).toBe('SYS')
    expect(b.elements![0].attributes).toMatchObject({ level: 'system', type: 'performance', method: 'test', tbd: 'TBD-02' })
    expect(b.links).toEqual([
      { source: 'req', type: 'derives-from', target: 'REQ-STK-005', rationale: 'Recorded in Lab L4' },
      { source: 'u', type: 'affects', target: 'req', rationale: 'TBD-02' },
    ])
  })
  it('uses an existing AROU item instead of creating one, and adds no AROU link without a TBD', () => {
    const b = buildBatch({ ...good, text: 'The charging system shall limit power to TBD-02 kW.', arou: ['U-002'], newUnknown: { name: 'x', text: 'y y y y y', owner: 'z' } })
    expect(b.elements).toHaveLength(1)
    expect(b.links!.some((l) => l.source === 'U-002')).toBe(true)
    expect(buildBatch({ ...good, arou: ['U-002'] }).links!.some((l) => l.source === 'U-002')).toBe(false)
  })
  it('the empty draft is not recordable', () => {
    expect(summarise(checkRequirement(EMPTY_DRAFT)).recordable).toBe(false)
  })
})

describe('type and level classifier', () => {
  it('every item text comes from the reference baseline and its key matches the reference type', () => {
    const m = referenceUpTo(4)
    for (const i of ITEMS) {
      expect(i.text, i.id).toBe(refText(i.id))
      expect(i.text.length, i.id).toBeGreaterThan(20)
      const e = m.elements.find((x) => x.id === i.id)!
      if (e.kind === 'REQ') {
        expect(i.type, i.id).toBe(e.attributes!.type)
        expect(i.level, i.id).toBe(e.id.startsWith('REQ-STK') ? 'stakeholder' : 'system')
      } else expect(i.level).toBe('need')
    }
  })
  it('covers all three levels and all four types', () => {
    expect(new Set(ITEMS.map((i) => i.level)).size).toBe(3)
    for (const t of ['functional', 'performance', 'interface', 'constraint']) expect(ITEMS.some((i) => i.type === t)).toBe(true)
  })
  it('grades correct, defensible and incorrect answers (mutation: a wrong level makes a right type incorrect)', () => {
    const i = ITEMS.find((x) => x.id === 'REQ-SYS-009')!
    expect(gradeItem(i, { level: 'system', type: 'interface' }).overall).toBe('correct')
    expect(gradeItem(i, { level: 'system', type: 'performance' }).overall).toBe('defensible')
    expect(gradeItem(i, { level: 'system', type: 'constraint' }).overall).toBe('incorrect')
    expect(gradeItem(i, { level: 'stakeholder', type: 'interface' }).overall).toBe('incorrect')
    expect(gradeItem(i, { level: 'system' }).overall).toBe('unanswered')
    const all = Object.fromEntries(ITEMS.map((x) => [x.id, { level: x.level, type: x.type }]))
    expect(scoreAll(all)).toMatchObject({ answered: ITEMS.length, correct: ITEMS.length, incorrect: 0 })
  })
})

describe('set audit and RB-3 sample', () => {
  it('detects orphans, duplicates, an inverted trace and a missing type (mutations of the reference)', () => {
    const m = referenceUpTo(4)
    const base = auditSet(m)
    expect(base.orphans).toEqual([])
    // remove every parent link of REQ-SYS-001 → orphan + failing parent check
    const noParent: EngineeringModel = { ...m, links: m.links.filter((l) => !(l.source === 'REQ-SYS-001' && l.type === 'derives-from')) }
    const a1 = auditSet(noParent)
    expect(a1.orphans).toContain('REQ-SYS-001')
    expect(a1.reqs.find((r) => r.id === 'REQ-SYS-001')!.fails).toContain('parent')
    // duplicate text
    const dup: EngineeringModel = { ...m, elements: m.elements.map((e) => (e.id === 'REQ-SYS-002' ? { ...e, text: m.elements.find((x) => x.id === 'REQ-SYS-001')!.text } : e)) }
    expect(auditSet(dup).duplicates).toEqual([['REQ-SYS-001', 'REQ-SYS-002']])
    // inverted trace: a stakeholder requirement derived from a system requirement
    const inv: EngineeringModel = { ...m, links: [...m.links, { id: 'LNK-X', source: 'REQ-STK-001', type: 'derives-from', target: 'REQ-SYS-005' }] }
    expect(auditSet(inv).reqs.find((r) => r.id === 'REQ-STK-001')!.fails).toContain('parent-level')
    // drop the interface requirements → interface missing
    const noIf: EngineeringModel = { ...m, elements: m.elements.map((e) => (e.attributes?.type === 'interface' ? { ...e, attributes: { ...e.attributes, type: 'functional' } } : e)) }
    expect(auditSet(noIf).missingTypes).toEqual(['interface'])
    // TBD whose Unknown link is removed → tbx fails
    const noU: EngineeringModel = { ...m, links: m.links.filter((l) => !(l.source === 'U-002' && l.target === 'REQ-SYS-010')) }
    expect(auditSet(noU).reqs.find((r) => r.id === 'REQ-SYS-010')!.fails).toContain('tbx')
  })
  it('draws a reproducible sample of distinct IDs independent of input order', () => {
    const ids = Array.from({ length: 18 }, (_, i) => `REQ-SYS-${String(i + 1).padStart(3, '0')}`)
    const s = drawSample(ids, 42)
    expect(s).toHaveLength(10)
    expect(new Set(s).size).toBe(10)
    expect(drawSample([...ids].reverse(), 42)).toEqual(s)
    expect(drawSample(ids, 43)).not.toEqual(s)
    expect(drawSample(ids.slice(0, 4), 1)).toHaveLength(4)
  })
  it('RB-3 bands and a self-audit that drops when a sampled requirement loses its rationale', () => {
    expect([rb3Level(90), rb3Level(89), rb3Level(75), rb3Level(74), rb3Level(50), rb3Level(49)]).toEqual([4, 3, 3, 2, 2, 1])
    const m = referenceUpTo(4)
    const ids = m.elements.filter((e) => e.kind === 'REQ').map((e) => e.id)
    const sample = drawSample(ids, 7)
    expect(rb3SelfAudit(auditSet(m).reqs, sample).every((r) => r.pct === 100 && r.level === 4)).toBe(true)
    const broken: EngineeringModel = { ...m, elements: m.elements.map((e) => (sample.slice(0, 2).includes(e.id) ? { ...e, attributes: { ...e.attributes, rationale: '' } } : e)) }
    const r33 = rb3SelfAudit(auditSet(broken).reqs, sample).find((r) => r.id === '3.3')!
    expect(r33).toMatchObject({ met: 8, of: 10, pct: 80, level: 3 })
  })
})
