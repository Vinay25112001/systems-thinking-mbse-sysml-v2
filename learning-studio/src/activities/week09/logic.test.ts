import { describe, expect, it } from 'vitest'
import { reportEntry, sha256Hex, sysmlSource } from '../../lib/sysml'
import { ELEMENT_KINDS, type Element } from '../../model/engineering'
import { referenceUpTo } from '../../model/reference'
import { findToken } from '../week05/reading'
import { buildMapping, declaredNameFor, isBasicName, KIND_MAPPING, mappingMarkdown, nameForm, referenceProblems, referenceSegments, shortNameFor, shortNameProblem, summarise, unescapeName } from './mapping'
import { OUTCOMES, PREDICT_ITEMS, outcomeOf, recordedResult, scorePredictions, type Outcome, type Recorded } from './predict'
import { ASSERTIONS, ROLES, SEMANTICS_FILE, TARGETS, roleFromContext, scoreAnswers, segmentLine } from './semantics'

const lines = (sysmlSource(SEMANTICS_FILE) ?? '').split(/\r?\n/)

describe('Week 9 semantics classifier (B9.2)', () => {
  it('the listing exists and every target token occurs as a whole word on its stated line', () => {
    expect(lines.length).toBeGreaterThan(45)
    for (const t of TARGETS) expect(findToken(lines[t.line - 1] ?? '', t.token), `${t.id} ${t.token} @${t.line}`).toBeGreaterThanOrEqual(0)
  })

  it('the key agrees with the keyword or symbol in front of each token', () => {
    for (const t of TARGETS) expect(roleFromContext(lines[t.line - 1], t.token), t.id).toBe(t.answer)
  })

  it('mutation: “:>” reads as specialization after a definition and as subsetting after a usage', () => {
    expect(roleFromContext('part def HubVertiport :> Vertiport {', 'Vertiport')).toBe('general')
    expect(roleFromContext('part baselineNetwork :> vertiportNetwork {', 'vertiportNetwork')).toBe('subsetted')
    expect(roleFromContext('part redefines hubs[4];', 'hubs')).toBe('redefined')
    expect(roleFromContext('part hubs : HubVertiport[3] subsets sites;', 'sites')).toBe('subsetted')
    // a key entry flipped to the other role would be caught by the agreement test above
    const flipped = TARGETS.map((t) => (t.id === 's14' ? { ...t, answer: 'general' as const } : t))
    expect(flipped.some((t) => roleFromContext(lines[t.line - 1], t.token) !== t.answer)).toBe(true)
  })

  it('every role is used and every explanation cites a source', () => {
    for (const r of ROLES) expect(TARGETS.some((t) => t.answer === r.id), r.id).toBe(true)
    for (const t of [...TARGETS, ...ASSERTIONS]) expect(t.explanation, t.id).toMatch(/S10 sl\.|S06 p\.|KerML p\.|R87 p\./)
    expect(ASSERTIONS.filter((a) => a.answer === 'false').length).toBeGreaterThanOrEqual(2)
  })

  it('segments a line in reading order and scores; mutation: one wrong answer lowers the score', () => {
    const segs = segmentLine(lines[28], TARGETS.filter((t) => t.line === 29)).filter((s) => s.target)
    expect(segs.map((s) => s.target!.id)).toEqual(['s9', 's10'])
    const right = Object.fromEntries(TARGETS.map((t) => [t.id, t.answer]))
    expect(scoreAnswers(right, TARGETS).correct).toBe(TARGETS.length)
    expect(scoreAnswers({ ...right, s8: 'redefined' as const }, TARGETS).correct).toBe(TARGETS.length - 1)
  })
})

describe('Week 9 package mapper (B9.4)', () => {
  it('basic names and the quoting rule (S06 p.49–50)', () => {
    expect(isBasicName('aeroLink')).toBe(true)
    expect(isBasicName('_x1')).toBe(true)
    expect(isBasicName('PHY-001')).toBe(false)
    expect(isBasicName('1stHub')).toBe(false)
    expect(isBasicName('part')).toBe(false)
    expect(shortNameFor('PHY-001')).toBe("<'PHY-001'>")
    expect(nameForm('Vertiport Operators')).toBe("'Vertiport Operators'")
    expect(nameForm("Operator's console")).toBe("'Operator\\'s console'")
  })

  it('short-name check accepts the correct form and rejects realistic wrong forms', () => {
    expect(shortNameProblem('PHY-001', "<'PHY-001'>")).toBeNull()
    expect(shortNameProblem('PHY-001', '<PHY-001>')).toMatch(/must be quoted/)
    expect(shortNameProblem('PHY-001', '<"PHY-001">')).toMatch(/single quotes/)
    expect(shortNameProblem('PHY-001', "<' PHY-001'>")).toMatch(/not the course ID/)
    expect(shortNameProblem('PHY-001', "<'PHY-01'>")).toMatch(/not the course ID/)
    expect(shortNameProblem('PHY-001', "<'phy-001'>")).toMatch(/not the course ID/)
    expect(shortNameProblem('PHY-001', "'PHY-001'")).toMatch(/between < and >/)
    expect(shortNameProblem('REQ-SYS-001', "<'REQ-SYS-001'>")).toBeNull()
  })

  it('short-name check agrees with the checker probes of 2026-10-11 on escapes, spaces and empty names', () => {
    // FAIL in the checker (lexer: "mismatched character '-'"): an invalid escape must not be accepted.
    expect(shortNameProblem('PHY-003', "<'PHY\\-003'>")).toMatch(/not an escape sequence/)
    // PASS in the checker: whitespace inside the brackets is legal, so the check must not reject it.
    expect(shortNameProblem('PHY-003', "< 'PHY-003' >")).toBeNull()
    expect(shortNameProblem('PHY-003', "<'PHY-003' >")).toBeNull()
    // PASS in the checker but a different name: a valid escape changes the name, so it is not the course ID.
    expect(shortNameProblem('PHY-003', "<'PHY\\'003'>")).toMatch(/not the course ID/)
    expect(shortNameProblem('PHY-003', "<''>")).toMatch(/at least one character/)
    expect(unescapeName("Operator\\'s")).toEqual({ value: "Operator's" })
    expect(unescapeName('a\\qb').badEscape).toBe('q')
  })

  it('reference check: quoted ID segments pass, unquoted ID segments fail (the error of predict item pc1)', () => {
    expect(referenceSegments("Physical::aeroLink.'PHY-003'")).toEqual(['Physical', 'aeroLink', "'PHY-003'"])
    expect(referenceProblems("Physical::aeroLink.'PHY-003'")).toEqual([])
    expect(referenceProblems("'AeroLink L9 Model'::Physical::aeroLink")).toEqual([])
    expect(referenceProblems('Physical::aeroLink.PHY-003')[0]).toMatch(/PHY-003/)
    expect(referenceProblems("Requirements::'REQ-SYS-001")[0]).toMatch(/Unbalanced/)
    expect(referenceProblems('Stakeholders::STK-005').length).toBe(1)
  })

  it('reference check: mutation — an empty quoted segment, a reserved word and a bad escape are rejected (all FAIL in the checker)', () => {
    expect(referenceProblems("aeroLink.''")[0]).toMatch(/is not a name/)
    expect(referenceProblems('aeroLink.part')[0]).toMatch(/reserved word/)
    expect(referenceProblems("aeroLink.'PHY\\-003'")[0]).toMatch(/not an escape sequence/)
    // legal forms stay legal: spaces around the separator (checker PASS) and an escaped apostrophe
    expect(referenceProblems("aeroLink . 'PHY-003'")).toEqual([])
    expect(referenceProblems("Stakeholders::'Operator\\'s duty-time limits'")).toEqual([])
  })

  it('declared-name proposal follows the reference convention per kind (camelCase usage, PascalCase definition, quoted descriptive name)', () => {
    expect(declaredNameFor('Charging Systems', KIND_MAPPING.PHY)).toBe('chargingSystems')
    expect(declaredNameFor('Vertiport Operators', KIND_MAPPING.STK)).toBe("'Vertiport Operators'")
    expect(declaredNameFor('AeroLink enterprise', KIND_MAPPING.ENT)).toBe('AeroLinkEnterprise')
    expect(declaredNameFor('Flight operations', KIND_MAPPING.LOG)).toBe('flightOperations')
    expect(declaredNameFor('Aircraft Charging', KIND_MAPPING.SCN)).toBe("'Aircraft Charging'")
    expect(declaredNameFor('2nd hub', KIND_MAPPING.PHY)).toBe('_2ndHub')
    const rows = buildMapping(referenceUpTo(8).elements)
    // the reference skeleton declares part <'PHY-003'> chargingSystems and requirement <'NEED-004'> 'Pads not limited by turnaround'
    expect(rows.find((r) => r.id === 'PHY-003')!.declaredName).toBe('chargingSystems')
    expect(rows.find((r) => r.id === 'NEED-004')!.declaredName).toBe("'Pads not limited by turnaround'")
  })

  it('reference passes its own checks: every short name in the reference skeleton has exactly the form the mapper proposes', () => {
    const ref = sysmlSource('reference/aerolink_v01_skeleton.sysml') ?? ''
    const found = [...ref.matchAll(/<('[^']+'|[A-Za-z_]\w*)>/g)].map((m) => m[0])
    expect(found.length).toBeGreaterThan(60)
    for (const sn of found) {
      const id = sn.slice(1, -1).replace(/^'|'$/g, '')
      if (/^[A-Z]+(-[A-Z]+)?-\d{3}$/.test(id)) expect(shortNameProblem(id, sn), sn).toBeNull()
    }
  })

  it('reference baseline to Week 8 maps with no ID problems; only kinds without an L9 package are flagged', () => {
    const rows = buildMapping(referenceUpTo(8).elements)
    const s = summarise(rows)
    expect(s.elements).toBeGreaterThan(100)
    for (const r of rows.filter((x) => x.pkg)) expect(r.problems, r.id).toEqual([])
    expect(new Set(s.unmapped)).toEqual(new Set(rows.filter((r) => KIND_MAPPING[r.kind].pkg === null).map((r) => r.kind)))
    expect(s.unmapped).toContain('DEC')
    expect(s.unmapped).toContain('MOP')
    expect(rows.find((r) => r.id === 'PHY-003')).toMatchObject({ pkg: 'Physical', shortName: "<'PHY-003'>" })
  })

  it('mutation: a malformed ID, an undecided kind, and a move without a reason are each flagged', () => {
    const el = (id: string, kind: Element['kind']): Element => ({ id, kind, name: id, provenance: 'team-derived', status: 'active' })
    const rows = buildMapping([el('PHY-1', 'PHY'), el('TECH-001', 'TECH'), el('CAP-001', 'CAP')], { CAP: { pkg: 'Logical' } })
    expect(rows.find((r) => r.id === 'PHY-1')!.problems[0]).toMatch(/ID scheme/)
    expect(rows.find((r) => r.id === 'TECH-001')!.problems[0]).toMatch(/No L9 package/)
    expect(rows.find((r) => r.id === 'CAP-001')!.problems[0]).toMatch(/record the reason/)
    const fixed = buildMapping([el('CAP-001', 'CAP')], { CAP: { pkg: 'Logical', reason: 'Capabilities are realised as logical behaviour in our architecture.' } })
    expect(fixed[0].problems).toEqual([])
    // an added package must be named, and the name reaches the table
    const unnamed = buildMapping([el('TECH-001', 'TECH')], { TECH: { pkg: 'Other', reason: 'Technology options are analysed with the trade study.' } })
    expect(unnamed[0].problems[0]).toMatch(/Name the package/)
    const named = { TECH: { pkg: 'Other' as const, reason: 'Technology options are analysed with the trade study.', otherName: 'Analysis' } }
    const rowsNamed = buildMapping([el('TECH-001', 'TECH')], named)
    expect(rowsNamed[0].problems).toEqual([])
    expect(mappingMarkdown(rowsNamed, named)).toMatch(/\| TECH-001 \| TECH \| — \| Other: Analysis \|[\s\S]*TECH → Other: Analysis: Technology options/)
  })

  it('every element kind has a proposal, and the Markdown table says it is not a SysML model', () => {
    for (const k of ELEMENT_KINDS) expect(KIND_MAPPING[k].construct.length, k).toBeGreaterThan(5)
    const md = mappingMarkdown(buildMapping(referenceUpTo(3).elements))
    expect(md).toMatch(/NOT a SysML model/)
    expect(md).toMatch(/\| NEED-004 \| NEED \| — \| Needs \|/)
  })
})

describe('Week 9 predict the checker (B9.2, B9.3)', () => {
  it('every item listing exists and has a recorded result for exactly its current text; the key matches the record', async () => {
    for (const it of PREDICT_ITEMS) {
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

  it('the items cover every outcome class', () => {
    for (const o of OUTCOMES) expect(PREDICT_ITEMS.some((i) => i.answer === o.id), o.id).toBe(true)
  })

  it('outcome classification from diagnostics; mutation: a changed text is reported stale, a missing record is not guessed', () => {
    expect(outcomeOf({ status: 'PASS', diagnostics: [] })).toBe('pass-clean')
    expect(outcomeOf({ status: 'PASS', diagnostics: [{ severity: 'WARNING', message: 'x' }] })).toBe('pass-warning')
    expect(outcomeOf({ status: 'FAIL', diagnostics: [{ severity: 'ERROR', message: "mismatched input '-' expecting '>'" }] })).toBe('fail-syntax')
    expect(outcomeOf({ status: 'FAIL', diagnostics: [{ severity: 'ERROR', message: "Couldn't resolve reference to Feature 'V'." }] })).toBe('fail-resolution')
    expect(outcomeOf({ status: 'FAIL', diagnostics: [{ severity: 'ERROR', message: 'An occurrence, item or part must be typed by occurrence definitions.' }] })).toBe('fail-rule')
    const entry = { file: 'x', sha256: 'abc', status: 'PASS' as const, diagnostics: [] }
    expect(recordedResult(entry, { state: 'done', sha256: 'def' }).state).toBe('stale')
    expect(recordedResult(undefined, { state: 'done', sha256: 'abc' }).state).toBe('missing')
    expect(recordedResult(entry, { state: 'done', sha256: 'abc' }).state).toBe('recorded')
  })

  it('fails closed: no verdict while the hash is pending or when it cannot be computed', () => {
    const entry = { file: 'x', sha256: 'abc', status: 'FAIL' as const, diagnostics: [{ severity: 'ERROR', message: 'no viable alternative' }] }
    expect(recordedResult(entry, { state: 'pending' })).toEqual({ state: 'pending' })
    expect(recordedResult(entry, { state: 'unavailable' })).toEqual({ state: 'unverifiable' })
  })

  it('scores revealed, recorded predictions with partial credit for PASS/FAIL', () => {
    const all = Object.fromEntries(PREDICT_ITEMS.map((i) => [i.id, i.answer]))
    const allRevealed = Object.fromEntries(PREDICT_ITEMS.map((i) => [i.id, true]))
    const rec = (o: Outcome): Recorded => ({ state: 'recorded', status: o.startsWith('pass') ? 'PASS' : 'FAIL', outcome: o, diagnostics: [] })
    const allRecorded = Object.fromEntries(PREDICT_ITEMS.map((i) => [i.id, rec(i.answer)]))
    expect(scorePredictions(all, allRevealed, allRecorded)).toEqual({ predicted: 8, scored: 8, correct: 8, passFailCorrect: 8 })
    expect(scorePredictions({ pc1: 'fail-resolution', pc2: 'pass-clean', pc6: 'fail-rule' }, allRevealed, allRecorded)).toEqual({ predicted: 3, scored: 3, correct: 0, passFailCorrect: 2 })
  })

  it('review S9-N1: only revealed items with a SHA-matched record are scored, against the RECORDED outcome', () => {
    const all = Object.fromEntries(PREDICT_ITEMS.map((i) => [i.id, i.answer]))
    const rec = (o: Outcome): Recorded => ({ state: 'recorded', status: o.startsWith('pass') ? 'PASS' : 'FAIL', outcome: o, diagnostics: [] })
    const allRecorded = Object.fromEntries(PREDICT_ITEMS.map((i) => [i.id, rec(i.answer)]))
    // Every prediction equals the key, none revealed: nothing is scored, so the score cannot leak the key.
    expect(scorePredictions(all, {}, allRecorded)).toEqual({ predicted: 8, scored: 0, correct: 0, passFailCorrect: 0 })
    // Revealed, but the record is stale, missing, pending or unverifiable: not scored (the activity shows nothing either).
    for (const r of [{ state: 'stale' }, { state: 'missing' }, { state: 'pending' }, { state: 'unverifiable' }, undefined] as (Recorded | undefined)[]) {
      expect(scorePredictions({ pc1: 'fail-syntax' }, { pc1: true }, { pc1: r })).toMatchObject({ scored: 0, correct: 0 })
    }
    // Scored against the record, not the hard-coded key: a record that disagrees with the key decides.
    expect(scorePredictions({ pc1: 'fail-syntax' }, { pc1: true }, { pc1: rec('pass-clean') })).toEqual({ predicted: 1, scored: 1, correct: 0, passFailCorrect: 0 })
  })
})
