// The Week 1 need-quality assessment, tested in both directions with every example from review F01 of commit 0f3ebcb
// (_source_cache/review/week01_rebuild_review.md). Good needs pass the gates with no warning; bad needs fail a gate or
// raise a warning that stops them counting until it is rewritten or justified. A "pass" here is never a quality verdict:
// the six checks are the team's to confirm (SELF_CHECK), which a later block tests. Faculty final review (DECISION_LOG
// A21, provisional decision 2): a need is rejected only for a real defect (not a sentence, no outcome, no identifiable
// registered stakeholder, "shall", the thing asked for is a solution, a duplicate ID); a valid need in another phrasing
// passes with advice recommending the form "The [stakeholders] need the [system] to …" (last two blocks).
import { describe, expect, it } from 'vitest'
import { NEED_GATE } from '../../content/lectures/week01/labBrief'
import { assessNeed, CRITERION_IDS, notCountingReasons, SELF_CHECK, splitNeed, splitTaught, type NeedContext, type NeedInput, type SelfCheck } from './needQuality'

const REG: NeedContext = {
  stakeholders: [
    { id: 'STK-001', name: 'Passengers' },
    { id: 'STK-002', name: 'Elevator inspectors' },
    { id: 'STK-003', name: 'Software maintainers' },
    { id: 'STK-004', name: 'Passengers using a wheelchair' },
    { id: 'STK-005', name: 'Patients in all hospital wings' },
    { id: 'STK-006', name: 'Security officers' },
    { id: 'STK-007', name: 'Users' },
    { id: 'STK-008', name: 'Riders' },
    { id: 'STK-009', name: 'Nurses' },
    { id: 'STK-010', name: 'Donors' },
    { id: 'STK-011', name: 'Residents near the depot' },
    { id: 'STK-012', name: 'Volunteer drivers' },
  ],
  soiNames: ['Riverside Food Bank Network'],
  systemNames: ['Riverside Food Bank Network', 'The network’s collection, warehousing and delivery service'],
}
const ALL: SelfCheck = Object.fromEntries(CRITERION_IDS.map((id) => [id, true]))
const need = (text: string, sources: string[], conditions = ''): NeedInput => ({ name: 'n', text, conditions, rationale: 'the stakeholder told us why in an interview', sources })
const assess = (text: string, sources: string[], conditions = '') => assessNeed(need(text, sources, conditions), REG)
const failedGates = (a: ReturnType<typeof assess>) => a.gates.filter((g) => !g.ok).map((g) => g.id)
const warningIds = (a: ReturnType<typeof assess>) => a.warnings.map((w) => w.id)

describe('good needs pass the gates with no warning (F01: no false rejections)', () => {
  const GOOD: [string, string[], string?][] = [
    ['Donors need the network to send a receipt for every gift within a week of giving.', ['STK-010']],
    ['Volunteer drivers need the delivery service to keep the loading dock open on weekends.', ['STK-012']],
    ['Riders need the service to let them reach the nearest stop safely in winter storms.', ['STK-008']],
    ['Donors need the network to confirm how their food was used after each donation.', ['STK-010']],
    ['Residents near the depot need the delivery service to keep engine noise below the limit agreed with the city.', ['STK-011'], 'between 22:00 and 06:00'],
    // SEBoK's own taught form (R11 p.555)
    ['The users need the system to keep coffee warm for an hour after brewing.', ['STK-007']],
    // stakeholder names that contain design or ordinary words are never read as solutions
    ['Elevator inspectors need the service to give them access to every machine room during the annual inspection.', ['STK-002']],
    ['Software maintainers need the system to tell them which release is running at each site whenever a fault is reported.', ['STK-003']],
    ['Passengers using a wheelchair need the service to offer step-free boarding at every stop.', ['STK-004']],
    ['Patients in all hospital wings need the service to bring a nurse to the bedside within five minutes of a call.', ['STK-005']],
    ['Security officers need the system to let them screen every bag before it is loaded.', ['STK-006']],
    // a subject that contains the word "needs"
    ['Passengers with special needs need the service to offer step-free boarding at every stop.', ['STK-001']],
    // "our" and a named system of interest
    ['Nurses need our delivery service to bring each patient’s medicines to the ward before every morning round.', ['STK-009']],
  ]
  for (const [text, sources, cond] of GOOD) {
    it(text, () => {
      const a = assess(text, sources, cond)
      expect(failedGates(a), text).toEqual([])
      expect(a.completeness.filter((c) => !c.ok), text).toEqual([])
      expect(a.warnings.map((w) => w.message), text).toEqual([])
      expect(notCountingReasons(a, ALL, ''), text).toEqual([])
    })
  }
})

describe('bad needs fail a gate or raise a warning (F01: no false acceptances)', () => {
  it('“Passengers need the service to give good service when possible.” passes the structure but warns: vague', () => {
    const a = assess('Passengers need the service to give good service when possible.', ['STK-001'])
    expect(failedGates(a)).toEqual([])
    expect(warningIds(a)).toContain('vague')
    expect(notCountingReasons(a, ALL, '').join(' ')).toMatch(/warning/)
  })
  it('“X need y when” fails the structure gate (no real object) and the subject gate', () => {
    const a = assessNeed({ name: 'x', text: 'X need y when', conditions: '', rationale: 'a b c d e', sources: ['STK-001'] }, REG)
    expect(failedGates(a)).toEqual(expect.arrayContaining(['structure', 'subject']))
  })
  it('the team’s own enterprise named as the party in need fails the subject gate', () => {
    const a = assess('Riverside Food Bank Network needs the service to find more volunteers at every shift.', ['STK-012'])
    expect(failedGates(a)).toContain('subject')
    expect(a.gates.find((g) => g.id === 'subject')!.message).toMatch(/own enterprise or system of interest/)
  })
  it('generic system subjects fail the subject gate', () => {
    for (const t of ['The system needs the network to alert drivers at every shift.', 'The network needs the service to add vans at peak hours.']) expect(failedGates(assess(t, ['STK-012'])), t).toContain('subject')
  })
  it('a subject that is not in the register fails the subject gate', () => {
    expect(failedGates(assess('Shoppers need the network to keep fresh produce until closing time.', ['STK-001']))).toContain('subject')
  })
  it('solutions are warned about: an application, electric buses, barcode scanners', () => {
    for (const [t, s] of [
      ['Passengers need the service to provide a mobile application to book a ride at any hour.', 'STK-001'],
      ['Riders need the service to run electric buses at all hours.', 'STK-008'],
      ['Nurses need the system to supply barcode scanners whenever preparing a dose.', 'STK-009'],
      ['Donors need the network to offer an online system for scheduling pickups on weekends.', 'STK-010'],
    ] as const) {
      const a = assess(t, [s])
      expect(failedGates(a), t).toEqual([])
      expect(warningIds(a), t).toContain('solution')
    }
  })
  it('requirement wording is warned about; “shall” and a missing stakeholder fail their gates', () => {
    expect(warningIds(assess('Donors need the network to send receipts, which it should do within a week.', ['STK-010']))).toContain('requirement')
    expect(failedGates(assess('The pantry shall keep fresh produce until closing time.', ['STK-001']))).toEqual(expect.arrayContaining(['requirement', 'subject']))
    expect(failedGates(assess('There is a need for faster delivery at every shift.', ['STK-012']))).toContain('subject')
  })
  it('no condition word is warned about', () => {
    expect(warningIds(assess('Donors need the network to send a receipt for their gift.', ['STK-010']))).toContain('condition')
  })
  it('a statement about one stakeholder traced to another is warned about', () => {
    expect(warningIds(assess('Riders need the service to give them a seat on every trip at peak hours.', ['STK-001']))).toContain('subject-trace')
  })
  it('an untraced need, an unknown source, a thin rationale and a duplicate ID do not count', () => {
    const ok = need('Riders need the service to give them a seat on every trip at peak hours.', ['STK-008'])
    expect(assessNeed({ ...ok, sources: [] }, REG).completeness.find((c) => c.id === 'traced')!.ok).toBe(false)
    expect(assessNeed({ ...ok, sources: ['STK-099'] }, REG).completeness.find((c) => c.id === 'traced')!.message).toMatch(/STK-099 is not in the register/)
    expect(assessNeed({ ...ok, rationale: '' }, REG).completeness.find((c) => c.id === 'rationale')!.ok).toBe(false)
    // gate sweep 2026-10-19: a short rationale is a rationale
    expect(assessNeed({ ...ok, rationale: 'Legal requirement' }, REG).completeness.find((c) => c.id === 'rationale')!.ok).toBe(true)

    expect(assessNeed({ ...ok, id: 'NEED-001' }, { ...REG, otherIds: ['NEED-001'] }).gates.find((g) => g.id === 'unique')!.ok).toBe(false)
    expect(assessNeed({ ...ok, id: 'NEED-002' }, { ...REG, otherIds: ['NEED-001'] }).gates.find((g) => g.id === 'unique')!.ok).toBe(true)
  })
})

describe('the self-check and the justification decide whether a need counts', () => {
  const good = assess('Riders need the service to give them a seat on every trip at peak hours.', ['STK-008'])
  const warned = assess('Passengers need the service to give good service when possible.', ['STK-001'])
  it('a need with no warnings counts only when all six checks are confirmed', () => {
    expect(notCountingReasons(good, ALL, '')).toEqual([])
    expect(notCountingReasons(good, { ...ALL, condition: false }, '')).toEqual(['Confirm each of the six checks in the self-check.'])
    expect(notCountingReasons(good, undefined, '')).toHaveLength(1)
  })
  it('a warning stops a need counting until it is justified in at least five words', () => {
    expect(notCountingReasons(warned, ALL, 'fine')).toHaveLength(1)
    expect(notCountingReasons(warned, ALL, 'the operator contract defines good service precisely')).toEqual([])
  })
  it('a failed gate cannot be justified away', () => {
    const bad = assess('Riverside Food Bank Network needs the service to find more volunteers at every shift.', ['STK-012'])
    expect(notCountingReasons(bad, ALL, 'we really think this is a fine need')).not.toEqual([])
  })
  it('the subject split tries every “need” in the sentence', () => {
    expect(splitNeed('Passengers with special needs need step-free boarding.', REG.stakeholders)!.subject).toBe('Passengers with special needs')
    expect(splitNeed('No verb here.', REG.stakeholders)).toBeUndefined()
  })
})

describe('the recommended need form: its parts are found, and the self-check is the lecture’s gate', () => {
  it('the parts are found: subject, [system] and “what”', () => {
    const a = assess('Volunteer drivers need the delivery service to keep the loading dock open on weekends.', ['STK-012'])
    expect(a.form).toBe('taught')
    expect(a.subject).toBe('Volunteer drivers')
    expect(a.system).toBe('delivery service')
    expect(a.object).toBe('keep the loading dock open on weekends.')
    expect(a.advice).toEqual([])
    expect(splitTaught('the air-taxi service to let them board within a short time')).toEqual({ system: 'air-taxi service', what: 'let them board within a short time' })
    expect(splitTaught('fresh produce until closing time')).toBeUndefined()
  })
  it('the lecture’s AeroLink worked need passes; a [system] that is not the system of interest gets advice, not a warning (A21)', () => {
    const ctx: NeedContext = { stakeholders: [{ id: 'STK-010', name: 'Electric utility' }], soiNames: ['AeroLink Urban Mobility'], systemNames: ['AeroLink air-taxi service'] }
    const ok = assessNeed({ name: 'n', text: 'The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity.', conditions: 'At all times, including when several arriving aircraft charge together.', rationale: 'Exceeding the agreed connection trips protection or incurs penalty tariffs.', sources: ['STK-010'] }, ctx)
    expect(ok.gates.filter((g) => !g.ok)).toEqual([])
    expect(ok.warnings).toEqual([])
    expect(ok.advice).toEqual([])
    const other = assessNeed({ name: 'n', text: 'The electric utility needs the city council to approve a bigger connection before each summer.', conditions: '', rationale: 'the utility told us why in an interview', sources: ['STK-010'] }, ctx)
    expect(other.gates.filter((g) => !g.ok)).toEqual([])
    expect(other.warnings).toEqual([])
    expect(other.advice.map((x) => x.id)).toEqual(['system'])
  })
  it('the self-check is the lecture’s six-check gate, in its order (labBrief.ts NEED_GATE)', () => {
    expect(SELF_CHECK.map((c) => c.id)).toEqual(NEED_GATE.map((g) => g.id))
    expect(SELF_CHECK.map((c) => c.gate)).toEqual(NEED_GATE.map((g) => g.short))
    expect(SELF_CHECK.find((c) => c.id === 'traced')!.label).toMatch(/concern/)
    expect(SELF_CHECK.find((c) => c.id === 'form')!.label).toMatch(/Recommended form/)
  })
  it('splitTaught: proper names and registered names are system phrases; lower-case outcomes and a bare “to” are not', () => {
    expect(splitTaught('MedFly to deliver blood units within the hour')).toEqual({ system: 'MedFly', what: 'deliver blood units within the hour' })
    expect(splitTaught('a courier service to collect samples')).toEqual({ system: 'courier service', what: 'collect samples' })
    expect(splitTaught('medfly to deliver blood units', ['MedFly'])).toEqual({ system: 'medfly', what: 'deliver blood units' })
    expect(splitTaught('medfly to deliver blood units')).toBeUndefined()
    expect(splitTaught('blood units to arrive within the hour', ['MedFly'])).toBeUndefined()
    expect(splitTaught('to deliver blood units to the wards', ['MedFly'])).toBeUndefined()
  })
})

// Faculty final review (A21): accept technically valid needs regardless of sentence pattern; reject real defects only.
// Both directions are tested, and each rejection is pinned to the gate that should catch it, so a statement cannot be
// rejected "for the wrong reason" (e.g. a valid passive phrasing failing the structure gate).
describe('A21: valid needs in other phrasings are accepted, with advice only', () => {
  const MED: NeedContext = {
    stakeholders: [
      { id: 'STK-001', name: 'Hospitals' },
      { id: 'STK-002', name: 'Blood bank' },
      { id: 'STK-003', name: 'Hospital dispatchers' },
    ],
    soiNames: ['MedFly'],
    systemNames: ['MedFly', 'MedFly blood and medicine courier service'],
  }
  const med = (text: string, sources = ['STK-001']) => assessNeed({ name: 'n', text, conditions: '', rationale: 'the transfusion lead told us why in an interview', sources }, MED)
  const failed = (a: ReturnType<typeof med>) => a.gates.filter((g) => !g.ok).map((g) => g.id)
  const VALID: [string, string[]][] = [
    // the faculty's example: no system named
    ['Hospital dispatchers need blood units delivered within 30 minutes of a request.', ['STK-003']],
    ['Hospitals need blood units delivered within 30 minutes of a request.', ['STK-001']],
    ['Hospitals need to receive blood units within 30 minutes of a request, at any hour.', ['STK-001']],
    ['Hospitals need blood units to arrive within 30 minutes of a request.', ['STK-001']],
    // "<stakeholder> needs …"
    ['The blood bank needs unused units returned before they expire, at the end of each shift.', ['STK-002']],
    // passive
    ['Blood units are delivered to hospitals within 30 minutes of each request.', ['STK-001']],
    ['Delivery of blood units within 30 minutes of a request is needed by hospitals.', ['STK-001']],
    // "so that"
    ['Blood units reach the ward within 30 minutes of a request, so that hospitals can start a transfusion before the patient deteriorates.', ['STK-001']],
    // "There is a need for …" naming the beneficiary
    ['There is a need for blood units to reach hospitals within 30 minutes of every request.', ['STK-001']],
  ]
  for (const [t, src] of VALID) {
    it(t, () => {
      const a = med(t, src)
      expect(failed(a), t).toEqual([])
      expect(a.form, t).toBe('other')
      expect(a.advice.map((x) => x.id), t).toEqual(['form'])
      expect(a.advice[0].message, t).toContain('The [stakeholders] need the [system] to')
      expect(a.warnings.map((w) => w.message), t).toEqual([])
      // advice never blocks: with the six checks confirmed the need counts, with no justification
      expect(notCountingReasons(a, ALL, ''), t).toEqual([])
    })
  }
  it('the recommended form still passes, with no advice; proper names, “a” and “an” are system phrases', () => {
    for (const t of [
      'Hospitals need MedFly to deliver blood units within 30 minutes of a request, at any hour.',
      'The hospitals need MedFly to deliver blood units within 30 minutes of a request, at any hour.',
      'Hospitals need medfly to deliver blood units within 30 minutes of a request, at any hour.',
      'Hospitals need MedFly’s courier service to return unused blood units to the bank before the end of each shift.',
      'Hospitals need a courier service to return unused blood units to the bank before the end of each shift.',
      'Hospitals need an on-call courier service to collect samples from each ward within an hour of a call.',
    ]) {
      const a = med(t)
      expect(failed(a), t).toEqual([])
      expect(a.form, t).toBe('taught')
      expect(a.advice, t).toEqual([])
      expect(a.warnings.map((w) => w.message), t).toEqual([])
      expect(notCountingReasons(a, ALL, ''), t).toEqual([])
    }
    const r = assess('Donors need Riverside to send a receipt for every gift within a week of giving.', ['STK-010'])
    expect(failedGates(r)).toEqual([])
    expect(r.system).toBe('Riverside')
  })
  it('the outcome forms that the pre-A21 gate rejected now pass the gates (regression of the old M1 rejection)', () => {
    for (const [t, s] of [
      ['Donors need a receipt for every gift within a week of giving.', 'STK-010'],
      ['Volunteer drivers need the loading dock open on weekends.', 'STK-012'],
      ['Donors need to receive a receipt within a week of giving.', 'STK-010'],
    ] as const) {
      const a = assess(t, [s])
      expect(failedGates(a), t).toEqual([])
      expect(a.advice.map((x) => x.id), t).toEqual(['form'])
    }
  })
})

describe('A21: genuinely defective needs are still rejected, by the gate that names the defect', () => {
  const MED: NeedContext = { stakeholders: [{ id: 'STK-001', name: 'Hospitals' }], soiNames: ['MedFly'], systemNames: ['MedFly', 'MedFly blood and medicine courier service'] }
  const med = (text: string) => assessNeed({ name: 'n', text, conditions: '', rationale: 'the transfusion lead told us why in an interview', sources: ['STK-001'] }, MED)
  const failed = (a: ReturnType<typeof med>) => a.gates.filter((g) => !g.ok).map((g) => g.id)
  it('empty or not a sentence: the structure gate', () => {
    for (const t of ['', 'Fast delivery.', 'Hospitals: speed.']) expect(failed(med(t)), JSON.stringify(t)).toContain('structure')
  })
  it('no outcome or capability: the structure gate, and only it', () => {
    for (const t of ['Hospitals need MedFly within 30 minutes of a request.', 'Hospitals need the service whenever a request arrives.', 'Donors need the network to it.']) {
      const a = t.startsWith('Donors') ? assess(t, ['STK-010']) : med(t)
      expect(a.gates.filter((g) => !g.ok).map((g) => g.id), t).toEqual(['structure'])
      expect(a.advice, t).toEqual([])
    }
  })
  it('no identifiable stakeholder: the subject gate', () => {
    for (const t of ['Blood units are delivered within 30 minutes of each request.', 'There is a need for faster delivery at every shift.', 'Faster delivery is needed within 30 minutes of every request.']) {
      const a = med(t)
      expect(failed(a), t).toEqual(['subject'])
      expect(a.gates.find((g) => g.id === 'subject')!.message, t).toMatch(/No stakeholder from your register is named/)
    }
    // a named party that is not in the register, and the system of interest as the party in need
    expect(failed(med('Surgeons need MedFly to deliver blood units within 30 minutes of a request.'))).toEqual(['subject'])
    expect(failed(med('MedFly needs the hospitals to book every delivery before noon.'))).toEqual(['subject'])
  })
  it('a requirement (“shall”): the requirement gate, in any phrasing', () => {
    for (const t of ['MedFly shall deliver blood units to hospitals within 30 minutes of a request.', 'Hospitals need MedFly to deliver blood units, which it shall do within 30 minutes of a request.']) {
      const a = med(t)
      expect(failed(a), t).toEqual(['requirement'])
      expect(notCountingReasons(a, ALL, 'we really think this is a fine need'), t).not.toEqual([])
    }
  })
  it('a solution as the thing needed: the solution gate; a design word inside an outcome stays a warning', () => {
    for (const t of ['Hospitals need a mobile app to order blood units at any hour.', 'Hospitals need drones for blood deliveries at night.', 'There is a need for a new tracking platform at every hospital.']) {
      const a = med(t)
      expect(failed(a), t).toContain('solution')
      expect(notCountingReasons(a, ALL, 'we really think this is a fine need'), t).not.toEqual([])
    }
    const warned = med('Hospitals need MedFly to track each blood unit with barcode scanners at every handover.')
    expect(failed(warned)).toEqual([])
    expect(warned.warnings.map((w) => w.id)).toContain('solution')
  })
  it('the lecture’s interview draft (S2 worked example) is rejected for its real defect: no stakeholder', () => {
    const ctx: NeedContext = { stakeholders: [{ id: 'STK-010', name: 'Electric utility' }], soiNames: ['AeroLink Urban Mobility'], systemNames: ['AeroLink air-taxi service'] }
    const a = assessNeed({ name: 'n', text: 'There is a need for a smart grid controller that must cap charging.', conditions: '', rationale: 'the utility told us why in an interview', sources: ['STK-010'] }, ctx)
    expect(a.gates.filter((g) => !g.ok).map((g) => g.id)).toContain('subject')
    expect(a.warnings.map((w) => w.id)).toContain('requirement')
  })
})
