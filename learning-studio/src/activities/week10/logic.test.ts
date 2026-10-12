import { describe, expect, it } from 'vitest'
import type { Element } from '../../model/engineering'
import { referenceUpTo } from '../../model/reference'
import { reportEntry, sha256Hex, sysmlSource } from '../../lib/sysml'
import { OUTCOMES, PREDICT_ITEMS_10, outcomeOf, recordedResult, scorePredictions10, type Outcome, type Recorded } from './predict'
import { REFERENCE_ROWS, referenceTranslation } from './referenceTranslations'
import { CASES, RELATIONS, scoreRelations } from './relations'
import { checkTranslation, declaredNameProblem, expectedSubjectTypes, limitDirection, parseBoundValue, quantitiesIn, splitComparison, valueAgainstType, type Translation } from './translator'

const reqs = referenceUpTo(8).elements.filter((e) => e.kind === 'REQ')
const req = (id: string) => reqs.find((r) => r.id === id) as Element
const ref = (id: string): Translation => referenceTranslation(id, req(id).name, req(id).text ?? '')
const failing = (id: string, t: Translation) => checkTranslation(req(id), t).filter((c) => c.ok === false).map((c) => c.id)

describe('Week 10 translator (B10.1)', () => {
  it('rule 4: every reference requirement, as realised in the validated v0.2 model, passes every check (no failures)', () => {
    expect(reqs).toHaveLength(20)
    for (const r of reqs) expect(failing(r.id, ref(r.id)), r.id).toEqual([])
  })

  it('the reference table matches the validated v0.2 model text (subject, constraint, parameter and statement)', () => {
    const v02 = sysmlSource('reference/aerolink_v02_req_structure.sysml')!
    expect(v02).toBeDefined()
    for (const [id, row] of Object.entries(REFERENCE_ROWS)) {
      const start = v02.indexOf(`requirement <'${id}'>`)
      expect(start, id).toBeGreaterThan(0)
      const block = v02.slice(start, v02.indexOf('\n\t\t}', start))
      expect(block, id).toContain(`subject ${row.subject};`)
      expect(block, id).toContain(`require constraint { ${row.constraint} }`)
      if (row.param) expect(block, id).toContain(`attribute ${row.param[0]} : ${row.param[1]}${row.param[2] ? ` = ${row.param[2]}` : ''}`)
      expect(block.replace(/\s+/g, ' '), id).toContain((req(id).text ?? '').replace(/\s+/g, ' '))
    }
  })

  it('advisories on the reference are the cases the tool cannot judge, not failures', () => {
    const adv = (id: string) => checkTranslation(req(id), ref(id)).filter((c) => c.ok === null).map((c) => c.id)
    expect(adv('REQ-SYS-010')).toEqual(['value']) // TBD-02 left unbound
    expect(adv('REQ-SYS-004')).toEqual(['constraint']) // Boolean feature of the subject
    expect(adv('REQ-STK-007')).toEqual(['value']) // 6 is not written in “every vertiport”
    expect(adv('REQ-SYS-001')).toEqual([])
  })

  // Rule 5: realistic bad input, long enough to pass any length rule, each failing for the stated reason.
  it('subject: REQ-SYS-002 with the vertiports as subject fails plausibility (the noise “shall” is about the aircraft)', () => {
    const t = { ...ref('REQ-SYS-002'), subjectName: 'vertiports', subjectType: 'Physical::VertiportNetwork', constraint: 'vertiports.padEdgeNoise <= noiseLimit' }
    expect(failing('REQ-SYS-002', t)).toEqual(['subject-plausible'])
  })

  it('subject: REQ-SYS-001 with the aircraft as subject fails plausibility', () => {
    const t = { ...ref('REQ-SYS-001'), subjectName: 'aircraft', subjectType: 'EVTOLAircraft', constraint: 'aircraft.chargeTimeToDispatch <= maxChargeTime' }
    expect(failing('REQ-SYS-001', t)).toEqual(['subject-plausible'])
  })

  it('subject level (course convention): a REQ-SYS about the enterprise and a REQ-STK about a system element both fail', () => {
    const sys = { ...ref('REQ-SYS-005'), subjectName: 'enterprise', subjectType: 'Context::AeroLinkEnterprise', constraint: 'enterprise.assignmentLatencyP99 <= maxAssignmentLatency' }
    expect(failing('REQ-SYS-005', sys)).toContain('subject-level')
    const stk = { ...ref('REQ-STK-001'), subjectName: 'scheduling', subjectType: 'Scheduling', constraint: 'scheduling.passengerWaitP90 <= maxWaitP90' }
    expect(failing('REQ-STK-001', stk)).toContain('subject-level')
  })

  it('value: 22 [min] against a statement that says 20 min fails; 0.25 against “20 %” fails; an unbound non-TBD value fails', () => {
    expect(failing('REQ-SYS-001', { ...ref('REQ-SYS-001'), paramValue: '22 [min]' })).toEqual(['value'])
    expect(failing('REQ-SYS-003', { ...ref('REQ-SYS-003'), paramValue: '0.25' })).toEqual(['value'])
    expect(failing('REQ-SYS-005', { ...ref('REQ-SYS-005'), paramValue: '' })).toEqual(['value'])
    expect(failing('REQ-SYS-001', { ...ref('REQ-SYS-001'), paramValue: 'twenty minutes' })).toEqual(['value'])
  })

  it('constraint: written around another element, comparing two features, compound, or missing — each fails', () => {
    const base = ref('REQ-SYS-001')
    expect(failing('REQ-SYS-001', { ...base, constraint: "aeroLink.'PHY-003'.chargeTimeToDispatch <= maxChargeTime" })).toEqual(['constraint'])
    expect(failing('REQ-SYS-001', { ...base, constraint: 'chargingSystem.chargeTimeToDispatch <= chargingSystem.estimatedChargeTime' })).toEqual(['constraint'])
    expect(failing('REQ-SYS-001', { ...base, constraint: 'chargingSystem.chargeTimeToDispatch <= maxChargeTime and chargingSystem.chargeTimeToDispatch >= 0 [min]' })).toEqual(['constraint'])
    expect(failing('REQ-SYS-001', { ...base, constraint: '' })).toEqual(['constraint'])
  })

  it('review W10-F02: a literal limit in the constraint is checked against the statement and against the bound parameter', () => {
    const base = ref('REQ-SYS-001')
    const noParam = { ...base, paramName: '', paramType: '', paramValue: '' }
    // The literal form is legal (q10-1) and passes when the literal is the statement's value.
    expect(failing('REQ-SYS-001', { ...noParam, constraint: 'chargingSystem.chargeTimeToDispatch <= 20 [min]' })).toEqual([])
    // 25 min written straight into the constraint, no parameter: used to pass every check.
    expect(failing('REQ-SYS-001', { ...noParam, constraint: 'chargingSystem.chargeTimeToDispatch <= 25 [min]' })).toEqual(['limit-value'])
    // Parameter bound to 20 min, but the constraint compares with a literal 25 min: used to pass every check.
    expect(failing('REQ-SYS-001', { ...base, constraint: 'chargingSystem.chargeTimeToDispatch <= 25 [min]' })).toEqual(['limit-value'])
    // A fraction literal against “at least 90 %”.
    expect(failing('REQ-SYS-006', { ...ref('REQ-SYS-006'), paramName: '', paramValue: '', constraint: 'fleet.fleetAvailability >= 0.80' })).toEqual(['limit-value'])
  })

  it('review W10-F03: a reversed inequality fails the direction check, with the subject on either side', () => {
    // “within 20 min” written as >=: used to be reported as “A required constraint that can be evaluated ✓”.
    expect(failing('REQ-SYS-001', { ...ref('REQ-SYS-001'), constraint: 'chargingSystem.chargeTimeToDispatch >= maxChargeTime' })).toEqual(['direction'])
    // “at least 90 %” written as <=.
    expect(failing('REQ-SYS-006', { ...ref('REQ-SYS-006'), constraint: 'fleet.fleetAvailability <= minAvailability' })).toEqual(['direction'])
    // “at least 20 %” with the subject on the right and the inequality reversed (minLandingEnergyFraction >= feature).
    expect(failing('REQ-SYS-003', { ...ref('REQ-SYS-003'), constraint: 'minLandingEnergyFraction >= flightPlanning.plannedLandingEnergyFraction' })).toEqual(['direction'])
    // The same, written correctly with the subject on the right, passes.
    expect(failing('REQ-SYS-003', { ...ref('REQ-SYS-003'), constraint: 'minLandingEnergyFraction <= flightPlanning.plannedLandingEnergyFraction' })).toEqual([])
    // “no more than 65 dBA” as an equality is not a limit.
    expect(failing('REQ-SYS-002', { ...ref('REQ-SYS-002'), constraint: 'aircraft.padEdgeNoise == noiseLimit' })).toEqual(['direction'])
    // A literal limit reversed.
    expect(failing('REQ-SYS-005', { ...ref('REQ-SYS-005'), paramName: '', paramValue: '', constraint: 'scheduling.assignmentLatencyP99 >= 60 [s]' })).toEqual(['direction'])
    // A strict < for “within” is an advisory (boundary), not a pass and not a failure.
    const strict = checkTranslation(req('REQ-SYS-001'), { ...ref('REQ-SYS-001'), constraint: 'chargingSystem.chargeTimeToDispatch < maxChargeTime' })
    expect(strict.find((c) => c.id === 'direction')!.ok).toBeNull()
  })

  it('review W10-F03: a value of the right number in a wrong unit, or of another kind, fails (not an advisory)', () => {
    expect(failing('REQ-SYS-001', { ...ref('REQ-SYS-001'), paramValue: '20 [s]' })).toEqual(['value'])
    expect(failing('REQ-SYS-009', { ...ref('REQ-SYS-009'), paramValue: '30 [min]' })).toEqual(['value'])
    expect(failing('REQ-SYS-007', { ...ref('REQ-SYS-007'), paramValue: '16 [kW]' })).toEqual(['value'])
    // A conversion is not an error: 1200 s is 20 min.
    expect(failing('REQ-SYS-001', { ...ref('REQ-SYS-001'), paramValue: '1200 [s]' })).toEqual([])
    // The reference passes the direction check on every requirement whose statement shows a direction.
    for (const r of reqs) {
      const d = checkTranslation(r, ref(r.id)).find((c) => c.id === 'direction')
      if (d) expect(d.ok, r.id).toBe(true)
    }
    expect(reqs.filter((r) => checkTranslation(r, ref(r.id)).some((c) => c.id === 'direction')).map((r) => r.id).sort()).toEqual(['REQ-STK-001', 'REQ-STK-002', 'REQ-STK-004', 'REQ-STK-005', 'REQ-STK-008', 'REQ-SYS-001', 'REQ-SYS-002', 'REQ-SYS-003', 'REQ-SYS-005', 'REQ-SYS-006', 'REQ-SYS-007', 'REQ-SYS-008', 'REQ-SYS-009'])
  })

  it('review S10-N1: negated limit phrases are read the right way round (good input passes, the reversed form fails)', () => {
    // “shall not take more than 20 min” is an upper limit: <= passes, >= fails.
    const upper = { ...req('REQ-SYS-001'), text: 'The charging system shall not take more than 20 min to charge an aircraft from the 20 % reserve to the dispatch threshold.' }
    const t1 = { ...ref('REQ-SYS-001'), docText: upper.text }
    expect(checkTranslation(upper, t1).filter((c) => c.ok === false).map((c) => c.id)).toEqual([])
    expect(checkTranslation(upper, t1).find((c) => c.id === 'direction')!.ok).toBe(true)
    expect(checkTranslation(upper, { ...t1, constraint: 'chargingSystem.chargeTimeToDispatch >= maxChargeTime' }).filter((c) => c.ok === false).map((c) => c.id)).toEqual(['direction'])
    // “shall not be less than 90 %” is a lower limit: >= passes, <= fails.
    const lower = { ...req('REQ-SYS-006'), text: 'The fleet availability shall not be less than 90 % of scheduled aircraft-hours in each calendar month.' }
    const t2 = { ...ref('REQ-SYS-006'), docText: lower.text }
    expect(checkTranslation(lower, t2).find((c) => c.id === 'direction')!.ok).toBe(true)
    expect(checkTranslation(lower, { ...t2, constraint: 'fleet.fleetAvailability <= minAvailability' }).filter((c) => c.ok === false).map((c) => c.id)).toEqual(['direction'])
    // “never … above” and a phrase that already carries its own negation (“not exceed”) are not inverted twice.
    expect(limitDirection('The aircraft shall never be above 65 dBA at the pad edge.', '65 [dB]')).toBe('upper')
    expect(limitDirection('The aircraft shall not exceed 65 dBA at the pad edge.', '65 [dB]')).toBe('upper')
    expect(limitDirection('The fleet shall achieve no less than 90 % availability.', '0.90')).toBe('lower')
  })

  it('review S10-N2: the bound value must fit the declared type', () => {
    // “90” for “at least 90 %”: the course writes fractions (0.90).
    expect(failing('REQ-SYS-006', { ...ref('REQ-SYS-006'), paramValue: '90' })).toEqual(['value'])
    // 0.20 bound to a DurationValue: the statement contains “20 %”, but a duration needs a unit.
    expect(failing('REQ-SYS-001', { ...ref('REQ-SYS-001'), paramValue: '0.20' })).toEqual(['value'])
    // A unit on a plain Real.
    expect(failing('REQ-SYS-006', { ...ref('REQ-SYS-006'), paramValue: '0.90 [min]' })).toContain('value')
    // Good input: a Real fraction, a Natural count and a converted duration still pass.
    expect(valueAgainstType('at least 90 %', 'Real', '0.90')).toBeNull()
    expect(valueAgainstType('every vertiport', 'Natural', '6')).toBeNull()
    expect(valueAgainstType('within 20 min', 'ISQ::DurationValue', '1200 [s]')).toBeNull()
  })

  it('review S10-N2: a nested feature chain of the subject is a feature of the subject; another element’s chain is not', () => {
    const base = ref('REQ-SYS-001')
    expect(failing('REQ-SYS-001', { ...base, constraint: 'chargingSystem.charger.chargeTimeToDispatch <= maxChargeTime' })).toEqual([])
    expect(failing('REQ-SYS-001', { ...base, constraint: "chargingSystem.'PHY-003'.chargeTimeToDispatch <= maxChargeTime" })).toEqual([])
    expect(failing('REQ-SYS-001', { ...base, constraint: 'aircraft.chargingSystem.chargeTimeToDispatch <= maxChargeTime' })).toEqual(['constraint'])
  })

  it('names and doc: unquoted ID, unquoted multi-word name, two “shall”s each fail', () => {
    const base = ref('REQ-SYS-001')
    expect(failing('REQ-SYS-001', { ...base, shortName: '<REQ-SYS-001>' })).toEqual(['short-name'])
    expect(failing('REQ-SYS-001', { ...base, declaredName: 'Charge to dispatch threshold in 20 min' })).toEqual(['declared-name'])
    expect(failing('REQ-SYS-001', { ...base, docText: base.docText + ' The charger shall also log every session.' })).toEqual(['doc'])
  })

  it('a paraphrased doc text is an advisory, not a pass', () => {
    const c = checkTranslation(req('REQ-SYS-001'), { ...ref('REQ-SYS-001'), docText: 'The charging system shall recharge an aircraft to the dispatch threshold in at most 20 min.' })
    expect(c.find((x) => x.id === 'doc')!.ok).toBeNull()
  })

  it('helpers: subject phrases, quantities, bound values and comparisons', () => {
    expect(expectedSubjectTypes('The eVTOL aircraft shall produce no more than 65 dBA')).toEqual(['EVTOLAircraft'])
    expect(expectedSubjectTypes('The landing gear shall retract within 8 s')).toBeNull()
    expect(quantitiesIn('at least 90 % of … within 15 min; 65 dBA; 25 km; 60 s')).toEqual([
      { value: 90, unit: '%' }, { value: 15, unit: 'min' }, { value: 65, unit: 'dB' }, { value: 25, unit: 'km' }, { value: 60, unit: 's' },
    ])
    expect(parseBoundValue('20 [min]')).toEqual({ value: 20, unit: 'min' })
    expect(parseBoundValue('0.90')).toEqual({ value: 0.9, unit: null })
    expect(splitComparison('a.b <= c')).toEqual({ left: 'a.b', op: '<=', right: 'c' })
    expect(declaredNameProblem('"Fleet availability"')).toMatch(/single quotes/)
    expect(declaredNameProblem('fleetAvailability')).toBeNull()
  })
})

describe('Week 10 relation classifier (B10.3)', () => {
  it('every case has a valid key and an explanation with a source; every relation is the key at least once', () => {
    const ids = RELATIONS.map((r) => r.id)
    for (const c of CASES) {
      expect(ids, c.id).toContain(c.answer)
      expect(c.explanation, c.id).toMatch(/S06 p\.|S10 sl\.|README|C\.2|course convention/)
    }
    for (const r of ids) expect(CASES.some((c) => c.answer === r), r).toBe(true)
  })

  it('scores answers; mutation: one wrong answer is counted wrong', () => {
    const all = Object.fromEntries(CASES.map((c) => [c.id, c.answer]))
    expect(scoreRelations(all)).toMatchObject({ answered: 10, correct: 10 })
    const one = { ...all, c9: 'satisfy' as const }
    const s = scoreRelations(one)
    expect(s.correct).toBe(9)
    expect(s.perItem.c9).toBe(false)
    expect(scoreRelations({}).perItem.c1).toBeNull()
  })
})

describe('Week 10 predict the checker (B10.2, B10.3)', () => {
  it('every item listing exists and has a recorded result for exactly its current text; the key matches the record', async () => {
    for (const it of PREDICT_ITEMS_10) {
      const text = sysmlSource(it.file)
      expect(text, it.file).toBeDefined()
      const entry = reportEntry(it.file)
      expect(entry, `${it.file} missing from validation-report.json: run npm run content:sysml`).toBeDefined()
      const rec = recordedResult(entry, { state: 'done', sha256: await sha256Hex(text!) })
      expect(rec.state, it.file).toBe('recorded')
      if (rec.state === 'recorded') expect(rec.outcome, it.id).toBe(it.answer)
      expect(it.file.split('/').pop()!.startsWith('invalid_'), it.file).toBe(it.answer.startsWith('fail'))
    }
  })

  it('the items cover every outcome class, and their header comments do not give the answer away', () => {
    for (const o of OUTCOMES) expect(PREDICT_ITEMS_10.some((i) => i.answer === o.id), o.id).toBe(true)
    for (const it of PREDICT_ITEMS_10) expect(sysmlSource(it.file)!.split('\n')[0], it.id).toMatch(/^\/\/ Week 10 predict-the-checker item pc\d\. Predict the outcome/)
  })

  it('classification and scoring; mutation: a changed text is stale and a missing record is not guessed', () => {
    expect(outcomeOf({ status: 'FAIL', diagnostics: [{ severity: 'ERROR', message: 'Cannot override a binding feature value' }] })).toBe('fail-rule')
    const all = Object.fromEntries(PREDICT_ITEMS_10.map((i) => [i.id, i.answer]))
    const allRevealed = Object.fromEntries(PREDICT_ITEMS_10.map((i) => [i.id, true]))
    const rec = (o: Outcome): Recorded => ({ state: 'recorded', status: o.startsWith('pass') ? 'PASS' : 'FAIL', outcome: o, diagnostics: [] })
    const allRecorded = Object.fromEntries(PREDICT_ITEMS_10.map((i) => [i.id, rec(i.answer)]))
    expect(scorePredictions10(all, allRevealed, allRecorded)).toEqual({ predicted: 9, scored: 9, correct: 9, passFailCorrect: 9 })
    expect(scorePredictions10({ pc1: 'fail-rule', pc2: 'pass-warning' }, allRevealed, allRecorded)).toEqual({ predicted: 2, scored: 2, correct: 0, passFailCorrect: 1 })
    const entry = { file: 'x', sha256: 'abc', status: 'PASS' as const, diagnostics: [] }
    expect(recordedResult(entry, { state: 'done', sha256: 'def' }).state).toBe('stale')
    expect(recordedResult(undefined, { state: 'done', sha256: 'abc' }).state).toBe('missing')
    expect(recordedResult(entry, { state: 'pending' }).state).toBe('pending')
    expect(recordedResult(entry, { state: 'unavailable' }).state).toBe('unverifiable')
    expect(recordedResult(entry, { state: 'done', sha256: 'abc' }).state).toBe('recorded')
  })

  it('review W10-F01: only revealed items with a SHA-matched record are scored, against the RECORDED outcome', () => {
    const all = Object.fromEntries(PREDICT_ITEMS_10.map((i) => [i.id, i.answer]))
    const rec = (o: Outcome): Recorded => ({ state: 'recorded', status: o.startsWith('pass') ? 'PASS' : 'FAIL', outcome: o, diagnostics: [] })
    const allRecorded = Object.fromEntries(PREDICT_ITEMS_10.map((i) => [i.id, rec(i.answer)]))
    // Every prediction equals the key, none revealed: nothing is scored, so the score cannot leak the key.
    expect(scorePredictions10(all, {}, allRecorded)).toEqual({ predicted: 9, scored: 0, correct: 0, passFailCorrect: 0 })
    // Revealed, but the record is stale, missing, pending or unverifiable: not scored (the activity shows nothing either).
    for (const r of [{ state: 'stale' }, { state: 'missing' }, { state: 'pending' }, { state: 'unverifiable' }, undefined] as (Recorded | undefined)[]) {
      expect(scorePredictions10({ pc1: 'pass-clean' }, { pc1: true }, { pc1: r })).toMatchObject({ scored: 0, correct: 0 })
    }
    // Scored against the record, not the hard-coded key: a record that disagrees with the key decides.
    expect(scorePredictions10({ pc1: 'pass-clean' }, { pc1: true }, { pc1: rec('fail-rule') })).toEqual({ predicted: 1, scored: 1, correct: 0, passFailCorrect: 0 })
  })
})
