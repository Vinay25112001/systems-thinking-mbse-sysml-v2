// Regression tests for the Week 6 review (W6-F04, W6-F10; AUTHORING_GUIDE §7 rules 4 and 5).
// Each reviewer probe must now fail, and fail for the intended reason: the probe produces exactly the targeted
// message, and a minimally repaired version of the same statement passes. The reference register must still pass.
import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import { RISK_FORM_MESSAGES, checkEntry, checkIssue, entryFrom, issueLogText, nextIssueId, riskClauses, riskStatementProblems, type RegisterEntry } from './risk'
import { FINDING_MESSAGES, checkFinding } from './srr'
import week06 from '../../content/weeks/week06'

const risk = (text: string): RegisterEntry => ({
  kind: 'R',
  name: 'Probe',
  text,
  owner: 'Vertiport Safety Manager',
  affects: 'REQ-SYS-001',
  likelihood: 2,
  consequence: 4,
  handling: 'mitigate',
  treatment: 'Pad separation, suppression and responder drills at every hub.',
  trigger: 'Cell over-temperature alarm',
})

describe('risk statements: reviewer probes now fail for the right reason (W6-F04)', () => {
  it('embedded mitigation: the “if” is the absence of a treatment', () => {
    const probe = 'Condition: hub pads are crowded. If we do not install pad fire suppression, then a fire will spread on the pad.'
    expect(checkEntry(risk(probe)).errors).toEqual([RISK_FORM_MESSAGES.mitigationAsEvent])
    const repaired = 'Condition: hub pads are crowded. If a cell enters thermal runaway during charging, then a fire will spread on the pad.'
    expect(checkEntry(risk(repaired)).errors).toEqual([])
    // other phrasings of the same defect
    expect(riskStatementProblems('Condition: packs are charged at hubs. If the team fails to monitor cell temperature, then a pad fire injures passengers.')).toContain(RISK_FORM_MESSAGES.mitigationAsEvent)
    expect(riskStatementProblems('Condition: packs are charged at hubs. If charging continues without monitoring, then a pad fire injures passengers.')).toContain(RISK_FORM_MESSAGES.mitigationAsEvent)
  })

  it('vague risk: no specific event and no stated harm', () => {
    const probe = 'Because the team is busy, if anything goes wrong then the project could be late.'
    expect(checkEntry(risk(probe)).errors).toEqual([RISK_FORM_MESSAGES.vagueEvent, RISK_FORM_MESSAGES.vagueConsequence])
    const repaired = 'Because the team is busy, if the charger installation at hub 2 slips by more than 4 weeks, then the month-12 capacity milestone is missed.'
    expect(checkEntry(risk(repaired)).errors).toEqual([])
    // each half of the check fails on its own
    expect(riskStatementProblems('Because the team is busy, if anything goes wrong, then the hub 2 opening slips by 4 weeks.')).toEqual([RISK_FORM_MESSAGES.vagueEvent])
    expect(riskStatementProblems('Because the team is busy, if the charger delivery slips, then the project could be late.')).toEqual([RISK_FORM_MESSAGES.vagueConsequence])
  })

  it('issue written as a risk: the event has already happened', () => {
    const probe = 'Condition: two chargers at hub 3 overheated last week. If they overheated, then the pad was closed for a day.'
    expect(checkEntry(risk(probe)).errors).toEqual([RISK_FORM_MESSAGES.issue])
    // the condition may state a past fact; only the if/then must be uncertain and future
    const repaired = 'Condition: two chargers at hub 3 overheated last week. If the same fault affects the other hub chargers, then turnaround at the hubs exceeds 25 min.'
    expect(checkEntry(risk(repaired)).errors).toEqual([])
    expect(riskStatementProblems('Condition: chargers are new. If a charger trips again, then the pad was closed yesterday.')).toEqual([RISK_FORM_MESSAGES.issue])
  })

  it('splits the statement at the first if and the first then after it', () => {
    expect(riskClauses('Condition: A. If B happens, then C follows; if D then E.')).toEqual({ condition: 'Condition: A. ', ifClause: ' B happens, ', thenClause: ' C follows; if D then E.' })
    expect(riskClauses('No form here')).toEqual({ condition: '', ifClause: '', thenClause: '' })
  })
})

describe('reference register passes the tightened checks (AUTHORING_GUIDE §7 rule 4)', () => {
  const ref = referenceUpTo(6)
  const arou = ref.elements.filter((e) => e.status === 'active' && ['A', 'R', 'O', 'U'].includes(e.kind))

  it('every reference A/R/O/U entry (17 at review time; A-007 and A-008 added since) has no errors through checkEntry', () => {
    expect(arou.length).toBeGreaterThanOrEqual(17)
    for (const e of arou) {
      const affects = ref.links.find((l) => l.source === e.id && l.type === 'affects')?.target ?? ''
      expect(checkEntry(entryFrom(e, affects)).errors, e.id).toEqual([])
    }
  })

  it('every reference risk statement is free of the new content problems', () => {
    for (const e of arou.filter((x) => x.kind === 'R')) expect(riskStatementProblems(e.text ?? ''), e.id).toEqual([])
  })
})

describe('SRR findings: reviewer probes now fail for the right reason (W6-F04)', () => {
  it('opinion and vague change requests are flagged even with an ID, an action verb and ten words', () => {
    const p1 = { rating: 'partly' as const, text: 'REQ-SYS-003 is bad and we would rather add something different here please.' }
    expect(checkFinding(p1)).toEqual([FINDING_MESSAGES.opinion, FINDING_MESSAGES.vague])
    const p2 = { rating: 'partly' as const, text: 'TECH-002 is rated low; we would rate it differently in our own opinion overall.' }
    expect(checkFinding(p2)).toEqual([FINDING_MESSAGES.opinion])
    const p3 = { rating: 'partly' as const, text: 'We would have done R-001 differently; please change the whole approach to everything.' }
    expect(checkFinding(p3)).toEqual([FINDING_MESSAGES.opinion, FINDING_MESSAGES.vague])
  })

  it('repaired versions of the probes pass', () => {
    expect(checkFinding({ rating: 'partly', text: 'REQ-SYS-003 has no verification method; add analysis of the energy budget with end-of-life capacity.' })).toEqual([])
    expect(checkFinding({ rating: 'partly', text: 'TECH-002 is rated TRL 5 without a maturity risk; add one and link it to REQ-SYS-003.' })).toEqual([])
    expect(checkFinding({ rating: 'not-met', text: 'R-001 has no trigger; add a trigger such as charger queue time above 5 min.' })).toEqual([])
  })

  it('the q6-13 key finding passes; a plain “rather than” is not mistaken for an opinion', () => {
    expect(checkFinding({ rating: 'partly', text: 'S2 partly met: REQ-SYS-003 has no verification method. Add analysis of the energy budget with end-of-life capacity, and link it to TPM-003.' })).toEqual([])
    expect(checkFinding({ rating: 'partly', text: 'REQ-SYS-002 names analysis; change the method to test rather than analysis, because noise is measurable.' })).toEqual([])
  })
})

describe('issue log (W6-F10)', () => {
  const good = { title: 'Hub 2 charger trips', text: 'The hub 2 charger tripped three times during trial operations this week.', owner: 'Vertiport Infrastructure Manager', affects: 'REQ-STK-005', action: 'Root-cause analysis with the supplier by Friday', linkedRisk: 'R-009' }

  it('accepts a complete issue and lists it apart from the risks', () => {
    expect(checkIssue(good)).toEqual([])
    const text = issueLogText([{ ...good, id: nextIssueId([]) }])
    expect(text).toMatch(/^Issues \(probability 1\.00/)
    expect(text).toContain('ISS-001 Hub 2 charger trips')
    expect(text).toContain('Future consequence tracked as R-009')
  })

  it('mutation: a missing owner, action or link, or a malformed risk ID each fail', () => {
    expect(checkIssue({ ...good, owner: '' }).join(' ')).toMatch(/owner/)
    expect(checkIssue({ ...good, action: 'fix' }).join(' ')).toMatch(/action/)
    expect(checkIssue({ ...good, affects: '' }).join(' ')).toMatch(/element it affects/)
    expect(checkIssue({ ...good, linkedRisk: 'risk 9' }).join(' ')).toMatch(/R-nnn/)
  })
})

describe('quiz keys agree with the tools (q6-5, q6-13)', () => {
  const opt = (q: string, o: string) => week06.quiz.find((x) => x.id === q)!.options.find((x) => x.id === o)!
  const unquote = (t: string) => t.replace(/^“|”$/g, '')

  it('q6-5: the keyed statement passes the risk checks; the embedded-mitigation option is flagged for that reason', () => {
    expect(opt('q6-5', 'c').correct).toBe(true)
    expect(checkEntry(risk(unquote(opt('q6-5', 'c').text))).errors).toEqual([])
    expect(riskStatementProblems(unquote(opt('q6-5', 'b').text))).toContain(RISK_FORM_MESSAGES.mitigationAsEvent)
    expect(checkEntry(risk(unquote(opt('q6-5', 'd').text))).errors.join(' ')).toMatch(/condition–if–then/)
  })

  it('q6-13: only the keyed finding is actionable', () => {
    for (const o of ['a', 'b', 'c', 'd']) {
      const f = opt('q6-13', o)
      expect(checkFinding({ rating: 'partly', text: unquote(f.text) }).length === 0, o).toBe(f.correct)
    }
  })
})
