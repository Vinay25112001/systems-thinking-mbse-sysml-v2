// Invariants of the corrected AeroLink case (aerolinkCase.ts). Each rule the case states is checked here, and each check
// is shown able to fail on a mutated copy, so a passing run means the rule holds.
import { describe, expect, it } from 'vitest'
import { INSTRUCTOR_EXAMPLE } from '../../../model/airtaxi'
import week02 from '../../../model/reference/week02'
import week03 from '../../../model/reference/week03'
import { CONCERNS, CONFLICT, DELIBERATE_GAP, ENTERPRISE, EXTERNAL_SYSTEMS, MISSION_GOALS, NEED_FORM, NEEDS, RELATIONSHIPS, STAKEHOLDERS, SYSTEM_OF_INTEREST, TABLE1_STAGES, coverageMatrix, methodCoverage, priorityCounts, unansweredConcerns, uncoveredStakeholders, type CaseNeed, type CaseStakeholder } from './aerolinkCase'

const registered = new Set(STAKEHOLDERS.map((s) => s.id))
const concernOwner = new Map(CONCERNS.map((c) => [c.id, c.stakeholder]))

/** Rule checks as pure functions, so the negative tests can run them on mutated copies. */
const approvingWithoutNeed = (stks: CaseStakeholder[], needs: CaseNeed[]) => stks.filter((s) => s.approving && !needs.some((n) => n.sources.some((x) => x.stakeholder === s.id))).map((s) => s.id)
const unregisteredSubjects = (needs: CaseNeed[]) => needs.filter((n) => !registered.has(n.subject) || n.sources.find((x) => x.role === 'subject')?.stakeholder !== n.subject).map((n) => n.id)
/** A concern a need answers must belong to a stakeholder listed as that need's source. */
const misattributed = (needs: CaseNeed[]) => needs.filter((n) => n.sources.some((x) => x.concern !== null && concernOwner.get(x.concern) !== x.stakeholder)).map((n) => n.id)
/** Every need is in SEBoK's form and names the system of interest (R11 p.555). */
const offForm = (needs: CaseNeed[]) => needs.filter((n) => !NEED_FORM.test(n.statement)).map((n) => n.id)
/** A statement whose outcome joins two separately negotiable needs with "and to" / "and need" is compound. */
const compound = (needs: CaseNeed[]) => needs.filter((n) => /\band (need|needs) (it|them|the)\b|, and need\b/.test(n.statement)).map((n) => n.id)
/** An external system named after an organization (the error the lecture teaches students to avoid). */
const ORG_WORDS = /\b(provider|manufacturer|utility|services|authority|operator|OEM)\b/i
const typo = (t: string) => t.replace(/[’']/g, "'")
const BRITISH = /\b(centre|neighbour|utilis|organis|colour|behaviour|favour|labour|modell|programme|licence|catalogue|analys(e|ing)\b)/i

describe('corrected AeroLink case', () => {
  it('has 15 stakeholders, 17 concerns, 8 relationships and 17 needs with unique IDs', () => {
    expect(STAKEHOLDERS).toHaveLength(15)
    expect(CONCERNS).toHaveLength(17)
    expect(RELATIONSHIPS).toHaveLength(8)
    expect(NEEDS).toHaveLength(17)
    for (const list of [STAKEHOLDERS, CONCERNS, RELATIONSHIPS, NEEDS]) expect(new Set(list.map((x) => x.id)).size).toBe(list.length)
  })
  it('classifies every stakeholder (role group, stage of main involvement, side, approving, prompts)', () => {
    for (const s of STAKEHOLDERS) {
      expect(s.roleGroup, s.id).toBeTruthy()
      expect(TABLE1_STAGES, s.id).toContain(s.stage)
      for (const p of s.promptedAt) expect(TABLE1_STAGES, s.id).toContain(p.stage)
      expect(['internal', 'external']).toContain(s.side)
      expect(typeof s.approving).toBe('boolean')
      expect(s.support).toBeGreaterThanOrEqual(1)
      expect(s.supportReason.length).toBeGreaterThan(10)
    }
  })
  it('communities are placed where siting happens (Concept), and only STK-015 is a proposed new entry', () => {
    expect(STAKEHOLDERS.find((s) => s.id === 'STK-004')!.stage).toBe('Concept')
    expect(STAKEHOLDERS.filter((s) => s.entry === 'proposed').map((s) => s.id)).toEqual(['STK-015'])
  })
  it('keeps interest, influence and the influence reason equal to the instructor reference', () => {
    for (const s of STAKEHOLDERS.filter((x) => x.entry === 'reference')) {
      const r = INSTRUCTOR_EXAMPLE.stakeholders.find((x) => x.id === s.id)!
      expect([s.interest, s.influence, s.influenceReason], s.id).toEqual([r.interest, r.influence, r.rationale])
    }
  })
  it('keeps the eight relationships of the reference exactly', () => {
    expect(RELATIONSHIPS.map(({ id, source, target, type, note }) => ({ id, source, target, type, note }))).toEqual(INSTRUCTOR_EXAMPLE.relationships)
  })
  it('keeps concern names and owners equal to the reference, except concerns marked corrected or proposed', () => {
    const refCons = week02.elements.filter((e) => e.kind === 'CON')
    expect(refCons).toHaveLength(16)
    for (const c of CONCERNS) {
      const r = refCons.find((e) => e.id === c.id)
      if (!r) expect(c.provenance, c.id).toBe('proposed')
      else if (c.provenance !== 'corrected') expect(c.name, c.id).toBe(r.name)
    }
    for (const l of week02.links.filter((k) => k.type === 'derives-from' && k.source.startsWith('CON-'))) expect(concernOwner.get(l.source), l.source).toBe(l.target)
  })
  it('marks every changed reference need as corrected and every new need as proposed', () => {
    const refNeeds = week03.elements.filter((e) => e.kind === 'NEED')
    for (const n of NEEDS) {
      const r = refNeeds.find((e) => e.id === n.id)
      if (!r) expect(n.provenance, n.id).toBe('proposed')
      else if (typo(n.statement) !== typo(r.text ?? '')) expect(n.provenance, n.id).toBe('corrected')
    }
  })
  it('writes every need in the recommended form, naming the system of interest, and none is compound', () => {
    expect(offForm(NEEDS)).toEqual([])
    expect(compound(NEEDS)).toEqual([])
    for (const n of NEEDS) expect(n.statement, n.id).toContain(SYSTEM_OF_INTEREST.short)
  })
  it('every approving authority has at least one need', () => {
    expect(STAKEHOLDERS.filter((s) => s.approving).map((s) => s.id)).toEqual(['STK-002', 'STK-013'])
    expect(approvingWithoutNeed(STAKEHOLDERS, NEEDS)).toEqual([])
  })
  it('every need has a registered stakeholder as its subject, answering a concern of that subject', () => {
    expect(unregisteredSubjects(NEEDS)).toEqual([])
    for (const n of NEEDS) expect(n.sources.find((s) => s.role === 'subject')!.concern, n.id).not.toBeNull()
  })
  it('every traced concern belongs to a listed source stakeholder (NEED-002 and NEED-008 attributed correctly)', () => {
    expect(misattributed(NEEDS)).toEqual([])
    expect(NEEDS.find((n) => n.id === 'NEED-002')!.sources.map((s) => s.stakeholder)).toEqual(['STK-002', 'STK-001'])
    expect(NEEDS.find((n) => n.id === 'NEED-008')!.sources.map((s) => s.stakeholder)).toEqual(['STK-015', 'STK-014'])
  })
  it('every need has a priority, a condition, a rationale and a trace to the mission or a goal', () => {
    const mgos = new Set(MISSION_GOALS.map((m) => m.id))
    for (const n of NEEDS) {
      expect(['mandatory', 'critical', 'desirable', 'optional']).toContain(n.priority)
      expect(n.condition.length, n.id).toBeGreaterThan(10)
      expect(n.rationale.length, n.id).toBeGreaterThan(10)
      expect(n.statement, n.id).not.toMatch(/\b(shall|must)\b/i)
      expect(mgos.has(n.mgo), n.id).toBe(true)
    }
    expect(priorityCounts()).toEqual({ mandatory: 7, critical: 5, desirable: 5, optional: 0 })
  })
  it('keeps exactly one deliberate coverage gap: STK-011, whose concern CON-015 no need answers', () => {
    expect(uncoveredStakeholders()).toEqual([DELIBERATE_GAP.stakeholder])
    expect(unansweredConcerns()).toEqual([DELIBERATE_GAP.concern])
    expect(coverageMatrix()).toHaveLength(15)
  })
  it('names external systems as systems; the stakeholder behind each is a registered owner', () => {
    for (const e of EXTERNAL_SYSTEMS) {
      expect(e.name, e.id).not.toMatch(ORG_WORDS)
      if (e.owner) expect(registered.has(e.owner), e.id).toBe(true)
    }
  })
  it('separates the system of interest from the enterprise', () => {
    expect(SYSTEM_OF_INTEREST.name).toBe('the AeroLink air-taxi service')
    expect(SYSTEM_OF_INTEREST.id).not.toBe(ENTERPRISE.id)
    expect(ENTERPRISE.name).not.toMatch(/service/i)
    expect(SYSTEM_OF_INTEREST.controlled).not.toContain('passenger demand')
  })
  it('derives the method coverage from the data: sweep 13, context 5, role class 11; two single-method stakeholders', () => {
    const m = methodCoverage()
    expect([m.filter((r) => r.m1).length, m.filter((r) => r.m2).length, m.filter((r) => r.m3).length]).toEqual([13, 5, 11])
    expect(m.filter((r) => [r.m1, r.m2, r.m3].filter(Boolean).length === 1).map((r) => r.stakeholder)).toEqual(['STK-012', 'STK-014'])
    expect(m.every((r) => r.m1 || r.m2 || r.m3)).toBe(true)
  })
  it('records the noise-versus-throughput conflict on REL-002 with a shared variable NEED-003 actually bounds', () => {
    expect(RELATIONSHIPS.find((r) => r.id === CONFLICT.relationship)!.type).toBe('conflicts-with')
    expect(CONFLICT.protocol.map((p) => p.step)).toEqual(['Record', 'Analyze', 'Negotiate', 'Escalate'])
    const n3 = NEEDS.find((n) => n.id === CONFLICT.needB)!
    expect(n3.statement).toMatch(/number of events in the evening and early morning/)
    expect(CONFLICT.sharedVariable).toMatch(/evening and early-morning/)
  })
  it('uses American spelling in every text field', () => {
    const texts = JSON.stringify({ STAKEHOLDERS, CONCERNS, NEEDS, CONFLICT, DELIBERATE_GAP, ENTERPRISE, SYSTEM_OF_INTEREST, EXTERNAL_SYSTEMS, MISSION_GOALS })
    expect(texts).not.toMatch(BRITISH)
  })
})

describe('the case rules can fail (negative direction)', () => {
  it('an approving authority without a need is caught', () => {
    expect(approvingWithoutNeed(STAKEHOLDERS, NEEDS.filter((n) => !['NEED-012', 'NEED-016'].includes(n.id)))).toEqual(['STK-013'])
  })
  it('an unregistered subject is caught', () => {
    const bad = structuredClone(NEEDS)
    bad[7].subject = 'STK-099'
    expect(unregisteredSubjects(bad)).toEqual(['NEED-008'])
  })
  it('a concern traced without its stakeholder is caught (the original NEED-002 defect)', () => {
    const bad = structuredClone(NEEDS)
    bad[1].sources = [{ stakeholder: 'STK-002', concern: 'CON-004', role: 'subject' }, { stakeholder: 'STK-002', concern: 'CON-002', role: 'contributing' }]
    expect(misattributed(bad)).toEqual(['NEED-002'])
  })
  it('a need in the old outcome form (no system of interest) is caught', () => {
    const bad = structuredClone(NEEDS)
    bad[9].statement = 'The electric utility needs the power drawn by each vertiport to stay within the agreed connection capacity at all times.'
    expect(offForm(bad)).toEqual(['NEED-010'])
  })
  it('a compound need (the original fare need) is caught', () => {
    const bad = structuredClone(NEEDS)
    bad[14].statement = 'Passengers need the air-taxi service to show them the full fare before they confirm a trip, and need it to be comparable with ride-hail.'
    expect(compound(bad)).toEqual(['NEED-015'])
  })
  it('an external system named after its organization is caught', () => {
    expect('Air navigation service provider').toMatch(ORG_WORDS)
    expect('Aircraft manufacturer (OEM)').toMatch(ORG_WORDS)
    expect('Emergency services').toMatch(ORG_WORDS)
  })
  it('British spelling is caught', () => {
    expect('operations centre').toMatch(BRITISH)
    expect('be a good neighbour').toMatch(BRITISH)
    expect('fleet utilisation').toMatch(BRITISH)
  })
})
