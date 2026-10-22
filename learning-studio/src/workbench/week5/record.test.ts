// Week 5 record: the import of the Week 4 export (good and bad files, each refusal with its own message), every hard gate
// in both directions (a good entry passes; one mutation a reviewer would reject fails exactly that gate), every advisory
// appearing and not appearing (advisories never block), the unusual-but-valid inputs earlier tools wrongly rejected, the
// part rules both ways, the N² and degrees, the crossing-flow check with relays, the minimums for a team of four and
// three, IDs never reused, and the round trip of the versioned export.
import { describe, expect, it } from 'vitest'
import { LAB5_MINIMUMS, LAB5_MINIMUMS_THREE, TABLE_COLUMNS } from '../../content/lectures/week05/labBrief'
import { WEEK2_JSON } from '../week3/fixture'
import { WEEK3_JSON, week4Fixture } from '../week4/fixture'
import { modelInputs as week4ModelInputs } from '../week4/record'
import { WEEK4_JSON, week5Fixture } from './fixture'
import {
  EMPTY_INTERFACE, EMPTY_RECORD, MODEL_INPUTS_VERSION, allChecks, allExternals, assessCard, cardOwnerOf, hasWork, assessChange, assessComponent, assessInterface, boundaryReasons, componentCount, countedInterfaces, crossingPairs, importWeek4File,
  importWeek5, modelInputs, n2Cell, n2Of, neighboursOf, nextId, normalizeRecord, pairKey, recordMarkdown, recordState, relayPath, riskLinks, withWeek4, assessRequirement, criterionOk, partSaid, type Interface, type Week5Record,
} from './record'

const fx = () => week5Fixture()
const failing = (a: { gates: { id: string; ok: boolean }[] }) => a.gates.filter((g) => !g.ok).map((g) => g.id)
const advs = (a: { advisories: { id: string }[] }) => a.advisories.map((x) => x.id)
const mut = (fn: (r: Week5Record) => void) => {
  const r = fx()
  fn(r)
  return r
}
const iface = (r: Week5Record, id: string) => r.interfaces.find((x) => x.id === id)!
const err = (x: unknown) => (x as { error: string }).error

describe('Week 5 record: import of the Week 4 export', () => {
  it('accepts the team’s Week 4 export, keeps the snapshot and seeds one card per physical element', () => {
    const imp = importWeek4File(WEEK4_JSON)
    expect('snapshot' in imp).toBe(true)
    if (!('snapshot' in imp)) return
    const s = imp.snapshot
    expect(s.physical.map((p) => p.id)).toEqual(['PHY-001', 'PHY-002', 'PHY-003', 'PHY-004', 'PHY-005'])
    expect(s.information.find((x) => x.id === 'INFO-003')!.consumers).toEqual(['PHY-004', 'EXT-001'])
    expect(s.ai[0]).toMatchObject({ id: 'AI-001', host: 'PHY-001' })
    expect(s.risks.find((x) => x.id === 'R-002')!.category).toBe('security')
    expect(s.week4Status).toBe('ready')
    expect(s.sourceVersion).toBe(1)
    const r = withWeek4(EMPTY_RECORD, s)
    expect(r.cards.map((c) => c.phy)).toEqual(s.physical.map((p) => p.id))
    // EXT and REQ-SYS numbering continue the imported record
    expect(nextId(r, 'EXT')).toBe('EXT-002')
    expect(nextId(r, 'REQ')).toBe('REQ-SYS-005')
    expect(nextId(r, 'IF')).toBe('IF-001')
  })
  it('refuses every wrong file with its own actionable message and never throws', () => {
    const out = JSON.parse(WEEK4_JSON)
    const cases: [string, RegExp][] = [
      ['not json', /not valid JSON/],
      ['{}', /no “format”/],
      ['[]', /a list/],
      [JSON.stringify({ ...out, format: 'something-else' }), /not a Week 4 model-inputs file/],
      [JSON.stringify({ ...out, version: '1' }), /version as text/],
      [JSON.stringify({ ...out, version: 2 }), /version 2/],
      ['{"format":"week1-model-inputs","version":1}', /Week 1 model-inputs/],
      [WEEK2_JSON, /Week 2 model-inputs/],
      [WEEK3_JSON, /Week 3 model-inputs/],
      [JSON.stringify(modelInputs(fx())), /Week 5 model-inputs file: use “Import a teammate’s Week 5/],
      [JSON.stringify({ ...out, week3: { ...out.week3, enterprise: 'AeroLink Urban Mobility' } }), /AeroLink/],
      [JSON.stringify({ ...out, physical: [] }), /no physical elements/],
      [JSON.stringify({ ...out, week3: null }), /no Week 3 snapshot/],
    ]
    const messages = new Set<string>()
    for (const [text, re] of cases) {
      let res: ReturnType<typeof importWeek4File> | undefined
      expect(() => (res = importWeek4File(text))).not.toThrow()
      expect(err(res), text.slice(0, 40)).toMatch(re)
      messages.add(err(res))
    }
    expect(messages.size).toBe(cases.length)
  })
})

describe('Week 5 record: the fixture passes every check', () => {
  it('is ready, with every part complete', () => {
    const r = fx()
    for (const [k, v] of Object.entries(allChecks(r))) expect(v.issues, k).toEqual([])
    expect(recordState(r)).toBe('ready')
  })
  it('holds the unusual-but-valid inputs: a one-word component, Stripe, Passengers, OpenAI API, AI-001 as an end, ID-only text', () => {
    const r = fx()
    expect(assessComponent(r.components[0], r).counts).toBe(true)
    expect(r.components[0].name).toBe('Hub')
    for (const id of ['IF-006', 'IF-007', 'IF-008', 'IF-009', 'IF-001']) expect(failing(assessInterface(iface(r, id), r)), id).toEqual([])
    expect(iface(r, 'IF-006').endA).toBe('AI-001')
    expect(iface(r, 'IF-001').crosses).toBe('INFO-001')
  })
})

describe('Week 5 record: Part 19 gates, both directions', () => {
  it('a good card passes; each defect fails its own gate; a one-word owner is accepted', () => {
    const c = fx().cards[0]
    expect(failing(assessCard(c))).toEqual([])
    expect(failing(assessCard({ ...c, responsibility: 'Freezers' }))).toEqual(['responsibility'])
    expect(failing(assessCard({ ...c, responsibility: '' }))).toEqual(['responsibility'])
    // review M2: a verb and its object is a complete responsibility
    for (const responsibility of ['Watches freezers', 'Charges aircraft', 'Raises alarms']) expect(failing(assessCard({ ...c, responsibility }))).toEqual([])
    expect(failing(assessCard({ ...c, owner: ' ' }))).toEqual(['owner'])
    expect(failing(assessCard({ ...c, owner: 'Stripe' }))).toEqual([])
  })
  it('a good component passes; each defect fails its own gate', () => {
    const r = fx()
    const c = r.components[1]
    expect(failing(assessComponent(c, r))).toEqual([])
    expect(failing(assessComponent({ ...c, name: '' }, r))).toEqual(['name'])
    expect(failing(assessComponent({ ...c, parent: 'PHY-099' }, r))).toEqual(['parent'])
    expect(failing(assessComponent({ ...c, parent: 'CMP-001' }, r))).toEqual(['parent'])
    expect(failing(assessComponent({ ...c, kind: '' }, r))).toEqual(['kind'])
    expect(failing(assessComponent({ ...c, responsibility: ' ' }, r))).toEqual(['responsibility'])
    expect(failing(assessComponent({ ...c, responsibility: 'Freezers' }, r))).toEqual(['responsibility'])
    expect(failing(assessComponent({ ...c, responsibility: 'Measure freezers' }, r))).toEqual([])
    // a name of any form: one word, a proper noun, an ID-like name
    for (const name of ['Hub', 'Stripe', 'GPT-4o service', 'CMP']) expect(failing(assessComponent({ ...c, name }, r))).toEqual([])
  })
  it('the count is physical elements with a passing card plus passing components, against the minimum for 4 and 3', () => {
    const r = mut((x) => {
      x.components = []
      x.cards = x.cards.map((c, i) => (i === 0 ? { ...c, owner: '' } : c))
    })
    expect(componentCount(r).total).toBe(4)
    expect(allChecks(r).breakdown.issues.join(' ')).toMatch(`At least ${LAB5_MINIMUMS.components} components`)
    r.cards[0].owner = 'Riverside Food Bank'
    expect(componentCount(r).total).toBe(5)
    expect(allChecks(r).breakdown.ok).toBe(true)
    const three = mut((x) => {
      x.components = []
      x.cards = x.cards.slice(0, LAB5_MINIMUMS_THREE.components)
    })
    expect(allChecks(three).breakdown.issues.join(' ')).toMatch(/At least 5 components/)
    three.threePersonTeam = true
    expect(allChecks(three).breakdown.issues.join(' ')).not.toMatch(/At least \d+ components/)
  })
  it('span and single-child advisories appear and do not block; they vanish when the breakdown is in range', () => {
    const one = mut((x) => (x.components = x.components.filter((c) => c.id !== 'CMP-002')))
    expect(allChecks(one).breakdown.ok).toBe(true)
    expect(allChecks(one).breakdown.notes!.join(' ')).toMatch(/PHY-001: advisory, a physical element broken into a single component/)
    const two = fx()
    expect(allChecks(two).breakdown.notes!.join(' ')).toMatch(/PHY-001: advisory, 2 components under it/)
    const ok = mut((x) => {
      x.components.push({ ...x.components[1], id: 'CMP-005', name: 'Spare sensors' }, { ...x.components[2], id: 'CMP-006', name: 'Driver app backend' })
    })
    const notes = allChecks(ok).breakdown.notes!.join(' ')
    expect(notes).not.toMatch(/PHY-001: advisory/)
    expect(notes).not.toMatch(/PHY-004: advisory/)
    expect(notes).not.toMatch(/level-1 elements/)
    const big = mut((x) => (x.week4!.physical = [...x.week4!.physical, ...['PHY-006', 'PHY-007', 'PHY-008'].map((id) => ({ id, name: id, text: '' }))]))
    expect(allChecks(big).breakdown.notes!.join(' ')).toMatch(/8 level-1 elements/)
  })
})

describe('Week 5 record: interface gates, both directions', () => {
  const good = () => iface(fx(), 'IF-002')
  it('a good interface passes', () => expect(failing(assessInterface(good(), fx()))).toEqual([]))
  it('each defect fails exactly its own gate', () => {
    const r = fx()
    const x = good()
    const cases: [Partial<Interface>, string][] = [
      [{ endB: '' }, 'ends'],
      [{ endB: 'PHY-099' }, 'ends'],
      [{ endB: 'FN-001' }, 'ends'],
      [{ endB: 'PHY-002' }, 'ends'],
      [{ kind: '' }, 'kind'],
      [{ crosses: '  ' }, 'crosses'],
      [{ direction: '' }, 'direction'],
      [{ medium: '' }, 'medium'],
      [{ ownerB: '' }, 'owners'],
      [{ protection: ' ', noProtectionReason: '' }, 'protection'],
      [{ degraded: 'Stop' }, 'degraded'],
      [{ degraded: '' }, 'degraded'],
    ]
    for (const [p, gate] of cases) expect(failing(assessInterface({ ...x, ...p }, r)), JSON.stringify(p)).toEqual([gate])
  })
  it('an AI capability end stands at its host: AI-001 to its own host PHY-001 is one end, to PHY-004 is valid', () => {
    const r = fx()
    const x = iface(r, 'IF-006')
    expect(failing(assessInterface({ ...x, endB: 'PHY-001' }, r))).toEqual(['ends'])
    expect(failing(assessInterface(x, r))).toEqual([])
    expect(n2Cell(n2Of(r), 'PHY-001', 'PHY-004')).toContain('IF-006')
    expect(failing(assessInterface({ ...x, endA: 'AI-099' }, r))).toEqual(['ends'])
  })
  it('direction is not needed for an organizational interface, and any wording is accepted (never parsed)', () => {
    const r = fx()
    expect(failing(assessInterface({ ...iface(r, 'IF-010'), direction: '' }, r))).toEqual([])
    for (const direction of ['both ways', 'to the dock', 'PHY-004 to PHY-005', 'in']) expect(failing(assessInterface({ ...good(), direction }, r))).toEqual([])
  })
  it('protection is required only across a trust boundary; a reason for none is accepted instead', () => {
    const r = fx()
    // IF-001: same owner, internal ends, nothing ticked: no boundary, no protection needed
    const inside = iface(r, 'IF-001')
    expect(boundaryReasons(inside, r)).toEqual([])
    expect(failing(assessInterface({ ...inside, protection: '' }, r))).toEqual([])
    // each reason alone makes the boundary cross
    expect(boundaryReasons({ ...inside, exposed: true }, r)).toEqual(['public input or unowned medium'])
    expect(failing(assessInterface({ ...inside, exposed: true }, r))).toEqual(['protection'])
    expect(boundaryReasons({ ...inside, ownerB: 'Partner pantries' }, r)).toEqual(['different owners'])
    expect(failing(assessInterface({ ...inside, ownerB: 'Partner pantries' }, r))).toEqual(['protection'])
    expect(boundaryReasons({ ...inside, endB: 'EXT-001' }, r)).toEqual(['external end'])
    expect(failing(assessInterface({ ...inside, endB: 'EXT-001' }, r))).toEqual(['protection'])
    // owners compared case-insensitively and trimmed
    expect(boundaryReasons({ ...inside, ownerB: '  riverside food BANK ' }, r)).toEqual([])
    // a reason for no protection of three words passes
    expect(failing(assessInterface({ ...inside, exposed: true, noProtectionReason: 'no data crosses' }, r))).toEqual([])
    expect(failing(assessInterface({ ...inside, exposed: true, protection: 'authenticate every sender' }, r))).toEqual([])
  })
  it('people, proper nouns and external AI services are valid ends and owners', () => {
    const r = fx()
    const x = good()
    for (const endB of ['EXT-002', 'EXT-003', 'EXT-004', 'CMP-001', 'AI-001']) expect(failing(assessInterface({ ...x, endB, protection: 'authenticate each sender' }, r)), endB).toEqual([])
    expect(failing(assessInterface({ ...x, ownerA: 'Stripe', ownerB: 'OpenAI' }, r))).toEqual([])
  })
})

describe('Week 5 record: interface advisories appear and do not appear, and never block', () => {
  const r = fx()
  const base: Interface = { ...iface(r, 'IF-001') }
  it('a clean interface has none', () => expect(advs(assessInterface(base, r))).toEqual([]))
  it('org-carries-data', () => {
    const a = assessInterface({ ...iface(r, 'IF-010'), crosses: 'INFO-001 delivery days', constraint: 'x', verification: 'x' }, r)
    expect(advs(a)).toEqual(['org-carries-data'])
    expect(a.counts).toBe(true)
    expect(advs(assessInterface({ ...base, crosses: 'INFO-001' }, r))).not.toContain('org-carries-data')
  })
  it('no-constraint', () => {
    const a = assessInterface({ ...base, constraint: '', requirements: '' }, r)
    expect(advs(a)).toEqual(['no-constraint'])
    expect(a.counts).toBe(true)
    expect(advs(assessInterface({ ...base, constraint: '', requirements: 'REQ-SYS-001' }, r))).toEqual([])
  })
  it('no-verification', () => {
    const a = assessInterface({ ...base, verification: '' }, r)
    expect(advs(a)).toEqual(['no-verification'])
    expect(a.counts).toBe(true)
  })
  it('hidden-external: a network medium without the box ticked; none once ticked', () => {
    const a = assessInterface({ ...base, medium: 'building wifi' }, r)
    expect(advs(a)).toEqual(['hidden-external'])
    expect(a.counts).toBe(true)
    expect(advs(assessInterface({ ...base, medium: 'building wifi', exposed: true, protection: 'WPA3 with staff accounts' }, r))).toEqual([])
    expect(advs(assessInterface({ ...base, medium: 'printed sheet' }, r))).toEqual([])
  })
  it('same-owner-external', () => {
    const a = assessInterface({ ...base, endB: 'EXT-001', protection: 'county account with two factors' }, r)
    expect(advs(a)).toEqual(['same-owner-external'])
    expect(a.counts).toBe(true)
    expect(advs(assessInterface({ ...base, endB: 'EXT-001', ownerB: 'County', protection: 'county account with two factors' }, r))).toEqual([])
  })
})

describe('Week 5 record: Part 20 rules, both directions', () => {
  it('the N² is symmetric over the physical and external elements; the degree sum is twice the interfaces', () => {
    const r = fx()
    const n = n2Of(r)
    expect(n.elements).toEqual(['PHY-001', 'PHY-002', 'PHY-003', 'PHY-004', 'PHY-005', 'EXT-001', 'EXT-002', 'EXT-003', 'EXT-004', 'EXT-005'])
    expect(n2Cell(n, 'PHY-002', 'PHY-004')).toEqual(['IF-002'])
    expect(n2Cell(n, 'PHY-004', 'PHY-002')).toEqual(['IF-002'])
    expect(n.degreeSum).toBe(2 * countedInterfaces(r).length)
    expect(n.degrees['EXT-005']).toBe(0)
    expect(n.counts).toMatchObject({ physical: 2, information: 7, organizational: 1 })
    // two components of one parent: an internal interface, on the diagonal, still counted twice in the degree sum
    const inner = mut((x) => x.interfaces.push({ ...iface(x, 'IF-001'), id: 'IF-011', endA: 'CMP-001', endB: 'CMP-002' }))
    const n2 = n2Of(inner)
    expect(n2Cell(n2, 'PHY-001', 'PHY-001')).toEqual(['IF-011'])
    expect(n2.degreeSum).toBe(2 * countedInterfaces(inner).length)
  })
  it('the interface minimum, for a team of four and three', () => {
    const r = mut((x) => (x.interfaces = x.interfaces.filter((y) => !['IF-004', 'IF-005', 'IF-010'].includes(y.id))))
    expect(allChecks(r).interfaces.issues.join(' ')).toMatch(`At least ${LAB5_MINIMUMS.interfaces} interfaces`)
    r.threePersonTeam = true
    expect(allChecks(r).interfaces.issues.join(' ')).not.toMatch(/At least \d+ interfaces/)
  })
  it('externals rule: an external with no interface needs a reason (a short one is enough, review M2)', () => {
    const r = mut((x) => (x.externalReasons = {}))
    expect(allChecks(r).interfaces.issues.join(' ')).toMatch(/EXT-005 City bus service: every external element/)
    r.externalReasons['EXT-005'] = '  '
    expect(allChecks(r).interfaces.ok).toBe(false)
    for (const reason of ['No arrangement yet', 'No exchange yet', 'Natural system: no exchange', 'None needed: no exchange']) {
      r.externalReasons['EXT-005'] = reason
      expect(allChecks(r).interfaces.ok, reason).toBe(true)
    }
    // confirmation review N1: an empty answer is not a reason
    for (const reason of ['?', 'n/a', '-', 'none', 'None.', 'later']) {
      r.externalReasons['EXT-005'] = reason
      expect(allChecks(r).interfaces.ok, reason).toBe(false)
    }
    // an interface that does not count does not satisfy the rule
    const bad = mut((x) => (iface(x, 'IF-007').degraded = ''))
    expect(allChecks(bad).interfaces.issues.join(' ')).toMatch(/EXT-002 Stripe: every external element/)
  })
  it('crossing check: catches an uncovered pair, accepts a valid relay, rejects a broken one', () => {
    const r = fx()
    expect(crossingPairs(r).every((p) => p.status === 'direct' || p.status === 'relay')).toBe(true)
    const key = pairKey('INFO-003', 'PHY-002', 'EXT-001')
    const missing = mut((x) => (x.relays = {}))
    expect(crossingPairs(missing).find((p) => p.key === key)!.status).toBe('missing')
    expect(allChecks(missing).interfaces.issues.join(' ')).toMatch(/INFO-003 PHY-002 → EXT-001: rides no information interface/)
    const broken = mut((x) => (x.relays[key] = 'IF-003, IF-002'))
    expect(crossingPairs(broken).find((p) => p.key === key)!.status).toBe('broken')
    expect(allChecks(broken).interfaces.ok).toBe(false)
    expect(relayPath(r, 'PHY-002', 'EXT-001', 'IF-002')).toEqual({ ok: false, message: 'the relay ends at PHY-004, not at EXT-001' })
    expect(relayPath(r, 'PHY-002', 'EXT-001', 'IF-099').message).toMatch(/not an interface/)
    expect(relayPath(r, 'PHY-002', 'EXT-001', 'IF-005, IF-003').message).toMatch(/not an information interface/)
    expect(relayPath(r, 'PHY-002', 'EXT-001', 'IF-002, IF-003').ok).toBe(true)
    // a direct information interface removes the need for the relay
    const direct = mut((x) => {
      x.relays = {}
      x.interfaces.push({ ...iface(x, 'IF-002'), id: 'IF-011', endB: 'EXT-001', ownerB: 'County' })
    })
    expect(crossingPairs(direct).find((p) => p.key === key)!.status).toBe('direct')
    // a physical interface between the elements does not carry information
    const phys = mut((x) => (iface(x, 'IF-004').kind = 'physical'))
    expect(crossingPairs(phys).find((p) => p.info === 'INFO-004')!.status).toBe('missing')
    // an AI producer or consumer is placed at its host: INFO-002 (PHY-001 → AI-001 on PHY-001) is internal
    expect(crossingPairs(r).some((p) => p.info === 'INFO-002')).toBe(false)
  })
  it('kinds advisory: a software-only enterprise with no physical interface still reaches ready', () => {
    const r = mut((x) => {
      x.interfaces = x.interfaces.filter((y) => y.kind !== 'physical')
      x.externalReasons['EXT-003'] = 'Clients now travel on their own; no ride-along.'
    })
    expect(r.interfaces.some((y) => y.kind === 'physical')).toBe(false)
    expect(allChecks(r).interfaces.notes!.join(' ')).toMatch(/Advisory: no physical interface/)
    expect(recordState(r)).toBe('ready')
    expect(allChecks(fx()).interfaces.notes!.join(' ')).not.toMatch(/Advisory: no \w+ interface/)
  })
})

describe('Week 5 record: Part 21 gates, both directions', () => {
  const q = () => fx().requirements[0]
  it('a good requirement passes; each defect fails its own gate', () => {
    const r = fx()
    expect(failing(assessRequirement(q(), r))).toEqual([])
    expect(failing(assessRequirement({ ...q(), statement: 'The gateway delivers warnings.' }, r))).toEqual(['one-shall'])
    expect(failing(assessRequirement({ ...q(), statement: 'The gateway shall send and shall log each warning.' }, r))).toEqual(['one-shall'])
    expect(failing(assessRequirement({ ...q(), interface: 'IF-099' }, r))).toEqual(['interface'])
    expect(failing(assessRequirement({ ...q(), criterion: '' }, r))).toEqual(['criterion'])
    expect(failing(assessRequirement({ ...q(), criterion: 'Fast' }, r))).toEqual(['criterion'])
    // review M2: a value with a unit, or an owned TBD, is a criterion however short
    for (const criterion of ['2 min', '≤2min', '≤ 2 min', 'TBD (Ops)', '100%']) expect(failing(assessRequirement({ ...q(), criterion }, r)), criterion).toEqual([])
    expect(failing(assessRequirement({ ...q(), method: '' }, r))).toEqual(['method'])
    expect(failing(assessRequirement({ ...q(), parents: '' }, r))).toEqual(['parent'])
    expect(failing(assessRequirement({ ...q(), parents: 'REQ-STK-099' }, r))).toEqual(['parent'])
  })
  it('“shall not” is one shall; a need, a capability or an earlier Week 5 requirement is a valid parent; a later one is not', () => {
    const r = fx()
    expect(failing(assessRequirement(r.requirements[2], r))).toEqual([])
    expect(failing(assessRequirement({ ...q(), parents: 'CAP-003' }, r))).toEqual([])
    expect(failing(assessRequirement({ ...r.requirements[2], parents: 'REQ-SYS-005' }, r))).toEqual([])
    expect(failing(assessRequirement({ ...q(), parents: 'REQ-SYS-007' }, r))).toEqual(['parent'])
  })
  it('IDs start after the highest imported REQ-SYS and are never reused; the minimum for 4 and 3', () => {
    const r = fx()
    expect(nextId(r, 'REQ')).toBe('REQ-SYS-008')
    r.requirements = r.requirements.filter((x) => x.id !== 'REQ-SYS-007')
    expect(nextId(r, 'REQ')).toBe('REQ-SYS-008')
    const reused = mut((x) => (x.requirements[0].id = 'REQ-SYS-001'))
    expect(allChecks(reused).requirements.issues.join(' ')).toMatch(/REQ-SYS-001 already exists/)
    const few = mut((x) => (x.requirements = x.requirements.slice(0, LAB5_MINIMUMS_THREE.requirements)))
    expect(allChecks(few).requirements.issues.join(' ')).toMatch(`At least ${LAB5_MINIMUMS.requirements} interface requirements`)
    few.threePersonTeam = true
    expect(allChecks(few).requirements.ok).toBe(true)
  })
})

describe('Week 5 record: Part 22 gates and rules, both directions', () => {
  it('a good change request passes; each defect fails its own gate', () => {
    const r = fx()
    const x = r.changes[0]
    expect(failing(assessChange(x, r))).toEqual([])
    expect(failing(assessChange({ ...x, interface: 'IF-099' }, r))).toEqual(['interface'])
    expect(failing(assessChange({ ...x, change: 'Encrypt' }, r))).toEqual(['change'])
    expect(failing(assessChange({ ...x, change: 'Add encryption to IF-006' }, r))).toEqual([])
    expect(failing(assessChange({ ...x, impact: '' }, r))).toEqual(['impact'])
    expect(failing(assessChange({ ...x, impact: 'IF-099' }, r))).toEqual(['impact'])
    expect(failing(assessChange({ ...x, impact: 'FN-006 only' }, r))).toEqual(['impact'])
    expect(failing(assessChange({ ...x, decision: ' ' }, r))).toEqual(['decision'])
    expect(failing(assessChange({ ...x, decision: 'Approved', decider: 'ICWG' }, r))).toEqual([])
    expect(failing(assessChange({ ...x, decider: '' }, r))).toEqual(['decision'])
    // a function named alongside an existing element is not a defect; a one-word decider is enough
    expect(failing(assessChange({ ...x, impact: 'FN-006, IF-002', decider: 'ICWG' }, r))).toEqual([])
  })
  it('the N² neighbours of the changed interface are suggested', () => {
    const r = fx()
    expect(neighboursOf(r, 'IF-006')).toEqual(['IF-001', 'IF-002', 'IF-003', 'IF-007', 'IF-009'])
  })
  it('ICWG needs two organizations; standards one word (a bare “none” gets an advisory); the change-request minimum', () => {
    expect(allChecks(mut((x) => (x.icwg = 'Riverside Food Bank'))).management.ok).toBe(false)
    expect(allChecks(mut((x) => (x.standards = ''))).management.ok).toBe(false)
    const none = allChecks(mut((x) => (x.standards = 'none')))
    expect(none.management.ok).toBe(true)
    expect(none.management.notes?.join(' ')).toMatch(/“none” with no reason/)
    expect(allChecks(mut((x) => (x.standards = 'None apply'))).management.ok).toBe(true)
    expect(allChecks(mut((x) => (x.standards = 'none apply here'))).management.ok).toBe(true)
    expect(allChecks(mut((x) => (x.changes = []))).management.issues.join(' ')).toMatch(/At least 1 change request/)
  })
  it('risk links: two interfaces linked to register risks, one security or resilience', () => {
    const r = fx()
    expect(riskLinks(r)).toMatchObject({ linked: ['IF-002', 'IF-006'], securityOrResilience: ['R-002', 'R-003'] })
    const one = mut((x) => (iface(x, 'IF-002').risks = ''))
    expect(allChecks(one).management.issues.join(' ')).toMatch(/At least 2 interfaces linked to a risk/)
    const noSec = mut((x) => (iface(x, 'IF-006').risks = 'R-004'))
    expect(allChecks(noSec).management.issues.join(' ')).toMatch(/security or resilience risk/)
    const unknown = mut((x) => (iface(x, 'IF-006').risks = 'R-099'))
    expect(riskLinks(unknown).linked).toEqual(['IF-002'])
    expect(allChecks(unknown).management.notes!.join(' ')).toMatch(/IF-006: R-099/)
  })
})

describe('Week 5 record: IDs, export and teammate import', () => {
  it('never reuses a deleted ID', () => {
    const r = fx()
    r.interfaces = r.interfaces.filter((x) => x.id !== 'IF-010')
    expect(nextId(r, 'IF')).toBe('IF-011')
    r.externals = r.externals.filter((x) => x.id !== 'EXT-005')
    expect(nextId(r, 'EXT')).toBe('EXT-006')
    expect(nextId(normalizeRecord({ ...r, interfaces: [] }), 'IF')).toBe('IF-011')
  })
  it('normalizeRecord never throws on junk', () => {
    for (const v of [null, undefined, 3, 'x', [], { interfaces: 'x', week4: 5, relays: [1], externalReasons: 'x', issued: null }]) expect(() => normalizeRecord(v)).not.toThrow()
    expect(recordState(normalizeRecord(null))).toBe('not-ready')
  })
  it('exports the versioned week5-model-inputs file with seeds and reads it back ready', () => {
    const r = fx()
    const out = modelInputs(r)
    expect(out).toMatchObject({ format: 'week5-model-inputs', version: MODEL_INPUTS_VERSION, status: 'ready' })
    expect(out.seeds.interface[0]).toMatch(/interface def with ends as ports/)
    expect(out.n2.degreeSum).toBe(20)
    const back = importWeek5(JSON.stringify(out))
    expect('error' in back).toBe(false)
    const b = back as Week5Record
    expect(b.interfaces.map((x) => x.id)).toEqual(r.interfaces.map((x) => x.id))
    expect(b.relays).toEqual(r.relays)
    expect(recordState(b)).toBe('ready')
    expect(modelInputs(b)).toEqual(out)
  })
  it('refuses wrong files in the teammate import, each with its own message, never throwing', () => {
    const out = modelInputs(fx())
    const cases: [string, RegExp][] = [
      ['nope', /not valid JSON/],
      ['{}', /no “format”/],
      ['[]', /holds a list/],
      [JSON.stringify({ ...out, format: 'x' }), /not a Week 5 model-inputs file/],
      [JSON.stringify({ ...out, version: '1' }), /version as text/],
      [JSON.stringify({ ...out, version: 3 }), /version 3/],
      [WEEK4_JSON, /Week 4 model-inputs file: use “Start from your Week 4/],
      [WEEK3_JSON, /Week 3 model-inputs/],
      [WEEK2_JSON, /Week 2 model-inputs/],
      ['{"format":"week1-model-inputs"}', /Week 1 model-inputs/],
      [JSON.stringify({ ...out, week4: { ...out.week4, enterprise: 'Aero-Link Hub' } }), /AeroLink/],
      [JSON.stringify({ ...out, interfaces: 'x' }), /“interfaces” must be a list/],
      [JSON.stringify({ ...out, interfaces: [3] }), /item 1 is number/],
      [JSON.stringify({ ...out, interfaces: [{ ...out.interfaces[0], id: 'IF-1' }] }), /Unexpected IF IDs/],
      [JSON.stringify({ ...out, interfaces: [out.interfaces[0], out.interfaces[0]] }), /Duplicate ID IF-001/],
    ]
    const msgs = new Set<string>()
    for (const [text, re] of cases) {
      let res: ReturnType<typeof importWeek5> | undefined
      expect(() => (res = importWeek5(text))).not.toThrow()
      expect(err(res), text.slice(0, 40)).toMatch(re)
      msgs.add(err(res))
    }
    expect(msgs.size).toBe(cases.length)
  })
  it('the Markdown record has every part, the N² table, the interface table with every column, degrees and crossing results; it round-trips the status', () => {
    const md = recordMarkdown(fx(), '2026-10-19')
    for (const h of ['## 6.', '## 19.', '## 20.', '## 21.', '## 22.', '### N² chart', '### Crossing-flow check', '## Part checks']) expect(md).toContain(h)
    for (const c of TABLE_COLUMNS) expect(md).toContain(c)
    expect(md).toContain('Degree sum 20 = 2 × 10 interfaces')
    expect(md).toContain('pass: INFO-003 Delivery records, PHY-002 → EXT-001: relayed over IF-002 → IF-003')
    expect(md).toContain('complete: every part passes its checks')
    expect(recordMarkdown(mut((x) => (x.relays = {})))).toContain('not ready')
  })
  it('the Week 4 importer of this tool and the Week 5 teammate importer refuse each other’s files', () => {
    expect(err(importWeek4File(JSON.stringify(modelInputs(fx()))))).toMatch(/Week 5/)
    expect(err(importWeek5(JSON.stringify(week4ModelInputs(week4Fixture()))))).toMatch(/Week 4/)
  })
  it('an empty interface fails every gate it can and the defaults are blank', () => {
    const r = fx()
    expect(failing(assessInterface(EMPTY_INTERFACE('IF-099'), r))).toEqual(['ends', 'kind', 'crosses', 'direction', 'medium', 'owners', 'degraded'])
  })
})

describe('Week 5 record: review 2026-10-19 (M1 radio advisory, M2 short answers, n16, n17, n19), both directions', () => {
  it('M2: the short answers the lecture calls complete are accepted on an interface that crosses a boundary', () => {
    const r = fx()
    const x = { ...iface(r, 'IF-007') }
    for (const protection of ['TLS', 'Mutual TLS', 'Power only']) expect(failing(assessInterface({ ...x, protection, noProtectionReason: '' }, r)), protection).toEqual([])
    expect(failing(assessInterface({ ...x, protection: '', noProtectionReason: 'Power only' }, r))).toEqual([])
    for (const degraded of ['Fail safe', 'Hold all departures', 'Fall back to radio', 'Switch to manual procedure']) expect(failing(assessInterface({ ...x, degraded }, r)), degraded).toEqual([])
  })
  it('N1 (confirmation): an empty answer is neither a protection, a reason for none nor a decision', () => {
    const r = fx()
    const x = { ...iface(r, 'IF-007') }
    const EMPTY = ['none', 'None', 'n/a', 'N/A', '-', '?', 'later', 'TBD']
    for (const v of EMPTY) {
      expect(failing(assessInterface({ ...x, protection: v, noProtectionReason: '' }, r)), `protection ${v}`).toEqual(['protection'])
      expect(failing(assessInterface({ ...x, protection: '', noProtectionReason: v }, r)), `reason ${v}`).toEqual(['protection'])
      expect(failing(assessInterface({ ...x, protection: v, noProtectionReason: v }, r)), `both ${v}`).toEqual(['protection'])
    }
    // "none" in Protection with a real reason beside it counts: the reason is the answer
    expect(failing(assessInterface({ ...x, protection: 'none', noProtectionReason: 'Power only' }, r))).toEqual([])
    // an interface that crosses no boundary still needs nothing
    const inside = { ...iface(r, 'IF-001') }
    expect(failing(assessInterface({ ...inside, protection: 'none', noProtectionReason: '' }, r))).toEqual([])
    const c = { ...r.changes[0], decider: 'ICWG' }
    for (const decision of ['n/a', '?', '-', 'none']) expect(failing(assessChange({ ...c, decision }, r)), decision).toEqual(['decision'])
    for (const decision of ['Approved', 'Rejected', 'Deferred to Q3']) expect(failing(assessChange({ ...c, decision }, r)), decision).toEqual([])
    expect(failing(assessInterface({ ...x, degraded: 'see above' }, r))).toEqual(['degraded'])
    expect(failing(assessChange({ ...c, change: 'see above' }, r))).toEqual(['change'])
  })
  it('N2 (confirmation): the criterion follows the lecture rule: a value with its unit, or a TBD with an owner', () => {
    const r = fx()
    const q = r.requirements[0]
    for (const criterion of ['2 min', '≤2min', '100%', 'TBD (Ops)', 'TBD: Ops lead', 'TBD-1 (County)', 'TBR (Ops)', 'within five working days', 'Every warning received', q.criterion])
      expect(failing(assessRequirement({ ...q, criterion }, r)), criterion).toEqual([])
    for (const criterion of ['TBD', 'TBD later', 'TBD (later)', 'TBD ()', 'TBD-1', 'TBR', 'within TBD min', '1', '42', 'Very fast', 'Fast', 'none', 'n/a', '-', 'works', 'as specified'])
      expect(failing(assessRequirement({ ...q, criterion }, r)), criterion).toEqual(['criterion'])
  })
  it('N2: criterionOk agrees with the requirement gate', () => {
    expect(criterionOk('2 min')).toBe(true)
    expect(criterionOk('TBD (Ops)')).toBe(true)
    expect(criterionOk('TBD')).toBe(false)
    expect(criterionOk('1')).toBe(false)
  })
  it('N1: partSaid is the one short-answer test for protection, reason, decision and external reason', () => {
    for (const v of ['TLS', 'Approved', 'No data']) expect(partSaid(v), v).toBe(true)
    for (const v of ['', ' ', 'none', 'n/a', '-', '?']) expect(partSaid(v), v).toBe(false)
  })
  it('M1: the hidden-external advisory fires for radio, Wi-Fi, cellular, satellite, VPN and the internet unless the box is ticked; not for a cable', () => {
    const r = fx()
    const x = { ...iface(r, 'IF-004') }
    const advs = (medium: string, exposed = false) => assessInterface({ ...x, medium, exposed }, r).advisories.map((a) => a.id)
    for (const medium of ['VHF radio', 'site Wi-Fi', 'wifi', 'cellular modem', 'LTE', '4G router', 'satellite relay', 'VPN tunnel', 'public internet', 'web API', 'Bluetooth beacon', 'wireless mesh'])
      expect(advs(medium), medium).toContain('hidden-external')
    expect(advs('site Wi-Fi', true)).not.toContain('hidden-external')
    for (const medium of ['charging cable', 'paper form', 'the agreed procedure (a document)', 'hand delivery']) expect(advs(medium), medium).not.toContain('hidden-external')
  })
  it('n16: an owner spelled differently from the end’s card gets an advisory, never a gate', () => {
    const r = fx()
    const x = { ...iface(r, 'IF-004') }
    const cardA = cardOwnerOf(r, x.endA)
    expect(assessInterface({ ...x, ownerA: cardA }, r).advisories.map((a) => a.id)).not.toContain('owner-spelling')
    const a = assessInterface({ ...x, ownerA: `${cardA} dept` }, r)
    expect(a.advisories.map((y) => y.id)).toContain('owner-spelling')
  })
  it('n17: an interface between two external elements gets an advisory and still counts', () => {
    const r = fx()
    const exts = allExternals(r).map((e) => e.id)
    const x = { ...iface(r, 'IF-003'), endA: exts[0], endB: exts[1] }
    const a = assessInterface(x, r)
    expect(a.advisories.map((y) => y.id)).toContain('no-internal-end')
    expect(failing(a)).toEqual([])
  })
  it('n19: a capitalized method or kind in an imported file is read, not dropped', () => {
    const text = JSON.stringify({ ...modelInputs(fx()), requirements: [{ ...fx().requirements[0], method: 'Test' }], interfaces: fx().interfaces.map((y, i) => (i === 0 ? { ...y, kind: 'Information' } : y)) })
    const back = importWeek5(text)
    if ('error' in back) throw new Error(back.error)
    expect(back.requirements[0].method).toBe('test')
    expect(back.interfaces[0].kind).toBe('information')
  })
  it('n18: hasWork says when an import would replace work', () => {
    expect(hasWork(EMPTY_RECORD)).toBe(false)
    expect(hasWork(fx())).toBe(true)
  })
})

// Week 7 review N1: the Week 5 tool numbered new externals after Week 4's only, so it reused Week 1's context EXT IDs.
// New externals now continue after the highest EXT ID in every imported earlier week (Week 4's, and the Week 1 range the
// Week 4 file carries); an older Week 4 file without that range imports unchanged.
describe('Week 5 record: external IDs continue after every earlier week (Week 7 review N1)', () => {
  it('with the Week 1 range in the Week 4 file, the next EXT follows it', async () => {
    const { importWeek4File, withWeek4, nextId, EMPTY_RECORD } = await import('./record')
    const w4 = { ...week4ModelInputs(week4Fixture()), week1Externals: [{ id: 'EXT-006', name: 'Electric utility' }, { id: 'EXT-009', name: 'Food safety inspector' }] }
    const x = importWeek4File(JSON.stringify(w4))
    if ('error' in x) throw new Error(x.error)
    expect(nextId(withWeek4(EMPTY_RECORD, x.snapshot), 'EXT')).toBe('EXT-010')
  })
  it('negative direction: without the range (an older Week 4 file) the floor is only Week 4’s externals', async () => {
    const { importWeek4File, withWeek4, nextId, EMPTY_RECORD } = await import('./record')
    const x = importWeek4File(WEEK4_JSON)
    if ('error' in x) throw new Error(x.error)
    expect(x.snapshot.week1Externals).toEqual([])
    const max = Math.max(...x.snapshot.externals.map((e) => Number(e.id.slice(4))), 0)
    expect(nextId(withWeek4(EMPTY_RECORD, x.snapshot), 'EXT')).toBe(`EXT-${String(max + 1).padStart(3, '0')}`)
  })
})
