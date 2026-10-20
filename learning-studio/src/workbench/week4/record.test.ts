// Week 4 record: the import of the Week 3 export (good and bad files), every hard gate in both directions (a good entry
// passes; one mutation that a reviewer would reject fails exactly that gate), the advisories never block, the minimums
// for a team of four and three, the consistency checks, and the round trip of the versioned export.
import { describe, expect, it } from 'vitest'
import { LAB4_MINIMUMS, LAB4_MINIMUMS_THREE, REQUIRED_VIEW_KINDS } from '../../content/lectures/week04/labBrief'
import { WEEK3_JSON, week4Fixture } from './fixture'
import {
  EMPTY_RECORD, MODEL_INPUTS_FORMAT, MODEL_INPUTS_VERSION, allChecks, assessAi, assessAllocation, assessDecision, assessFunction, assessInfo, assessViewpoint, consistency, importWeek3File, importWeek4,
  lines, modelInputs, nextId, normalizeRecord, recordMarkdown, recordState, unallocatedSystemRequirements, withWeek3, type Week4Record,
} from './record'

const fx = () => week4Fixture()
const failing = (a: { gates: { id: string; ok: boolean }[] }) => a.gates.filter((g) => !g.ok).map((g) => g.id)
const mut = (fn: (r: Week4Record) => void) => {
  const r = fx()
  fn(r)
  return r
}

describe('Week 4 record: import of the Week 3 export', () => {
  it('accepts the team’s Week 3 export and seeds one viewpoint of each required kind', () => {
    const imp = importWeek3File(WEEK3_JSON)
    expect('snapshot' in imp).toBe(true)
    if (!('snapshot' in imp)) return
    expect(imp.snapshot.requirements.length).toBeGreaterThan(0)
    expect(imp.snapshot.decision.recommended).toBe('ALT-004')
    const r = withWeek3(EMPTY_RECORD, imp.snapshot)
    expect(r.viewpoints.map((v) => v.kind)).toEqual(REQUIRED_VIEW_KINDS)
  })
  it('refuses bad files with a message: not JSON, an earlier week, a Week 4 file, AeroLink', () => {
    expect(importWeek3File('not json')).toEqual({ error: 'This file is not valid JSON.' })
    expect(importWeek3File('{"format":"week2-model-inputs","version":1}')).toHaveProperty('error')
    expect((importWeek3File(JSON.stringify({ format: MODEL_INPUTS_FORMAT, version: 1 })) as { error: string }).error).toMatch(/Week 4 model-inputs/)
    const aero = JSON.parse(WEEK3_JSON)
    aero.week2.enterprise = 'AeroLink Urban Mobility'
    expect((importWeek3File(JSON.stringify(aero)) as { error: string }).error).toMatch(/AeroLink/)
  })
})

describe('Week 4 record: the fixture passes every check', () => {
  it('is ready, with every part complete and every consistency check passing', () => {
    const r = fx()
    const c = allChecks(r)
    for (const [k, v] of Object.entries(c)) expect(v.issues, k).toEqual([])
    expect(recordState(r)).toBe('ready')
    expect(consistency(r).every((x) => x.ok)).toBe(true)
  })
})

describe('Week 4 record: viewpoint gates, both directions', () => {
  const v = () => fx().viewpoints[0]
  it('a good viewpoint passes every gate', () => expect(failing(assessViewpoint(v(), fx()))).toEqual([]))
  it('each defect fails its own gate', () => {
    const r = fx()
    expect(failing(assessViewpoint({ ...v(), kind: '' }, r))).toEqual(['kind'])
    expect(failing(assessViewpoint({ ...v(), purpose: '' }, r))).toEqual(['purpose'])
    expect(failing(assessViewpoint({ ...v(), purpose: '   ' }, r))).toEqual(['purpose'])
    expect(failing(assessViewpoint({ ...v(), concerns: '' }, r))).toEqual(['stakeholders'])
    expect(failing(assessViewpoint({ ...v(), stakeholders: '' }, r))).toEqual(['stakeholders'])
    expect(failing(assessViewpoint({ ...v(), serves: 'NEED-001, NEED-099' }, r))).toEqual(['serves'])
    expect(failing(assessViewpoint({ ...v(), form: '' }, r))).toEqual(['form'])
  })
  it('gate sweep 2026-10-19: a two-word purpose question and a one-word form are accepted', () => {
    const r = fx()
    expect(failing(assessViewpoint({ ...v(), purpose: 'Who decides?' }, r))).toEqual([])
    expect(failing(assessViewpoint({ ...v(), purpose: 'Operations' }, r))).toEqual([])
    expect(failing(assessViewpoint({ ...v(), form: 'Table' }, r))).toEqual([])
  })
  it('review M2: valid short entries the lecture allows are accepted: a one-word concern, a concern ID, a four-word purpose question, no linked need (advisory only)', () => {
    const r = fx()
    expect(failing(assessViewpoint({ ...v(), concerns: 'Noise' }, r))).toEqual([])
    expect(failing(assessViewpoint({ ...v(), concerns: 'CON-003' }, r))).toEqual([])
    expect(failing(assessViewpoint({ ...v(), purpose: 'Who owns which element?' }, r))).toEqual([])
    const noLink = assessViewpoint({ ...v(), serves: '' }, r)
    expect(noLink.counts).toBe(true)
    expect(noLink.advisories.map((a) => a.id)).toEqual(['no-serves'])
    // a concern ID in the serves field is accepted too (Week 1 concerns are not in the Week 3 snapshot)
    expect(failing(assessViewpoint({ ...v(), serves: 'CON-003' }, r))).toEqual([])
  })
  it('a missing required kind blocks the part; an extra kind does not', () => {
    const r = mut((x) => (x.viewpoints = x.viewpoints.filter((y) => y.kind !== 'enterprise')))
    expect(allChecks(r).views.ok).toBe(false)
    expect(allChecks(r).views.issues.join(' ')).toMatch(/enterprise still missing/)
    const extra = mut((x) => x.viewpoints.push({ ...x.viewpoints[2], id: 'VP-006', kind: 'logical', name: 'Logical viewpoint' }))
    expect(allChecks(extra).views.ok).toBe(true)
  })
})

describe('Week 4 record: mission function (gate sweep 2026-10-19, confirmation N3)', () => {
  it('a two-word verb and object counts; one word is an advisory; empty fails', () => {
    expect(allChecks(mut((x) => (x.mission = 'Feed families'))).functions.ok).toBe(true)
    const one = allChecks(mut((x) => (x.mission = 'Feed'))).functions
    expect(one.ok).toBe(true)
    expect(one.notes?.some((n) => n.includes('mission function is one word'))).toBe(true)
    expect(allChecks(mut((x) => (x.mission = '  '))).functions.ok).toBe(false)
  })
})

describe('Week 4 record: function gates, both directions', () => {

  const f = () => fx().functions[0]
  it('good functions pass, including a one-word name (advisory only) and a planning function with a reason', () => {
    const r = fx()
    expect(failing(assessFunction(f(), r))).toEqual([])
    const oneWord = assessFunction({ ...f(), name: 'Refuel' }, r)
    expect(oneWord.counts).toBe(true)
    expect(oneWord.advisories.map((a) => a.id)).toContain('one-word')
    const planning = assessFunction({ ...f(), scenarios: '', planning: 'A planning function that runs each quarter on history.' }, r)
    expect(planning.counts).toBe(true)
    const thing = assessFunction({ ...f(), name: 'Run the routing software' }, r)
    expect(thing.counts).toBe(true)
    expect(thing.advisories.map((a) => a.id)).toContain('thing-name')
  })
  it('each defect fails its own gate', () => {
    const r = fx()
    expect(failing(assessFunction({ ...f(), name: 'Refrigerated vans' }, r))).toEqual(['name'])
    expect(failing(assessFunction({ ...f(), name: '' }, r))).toEqual(['name'])
    expect(failing(assessFunction({ ...f(), outputs: '' }, r))).toEqual(['io'])
    expect(failing(assessFunction({ ...f(), capabilities: '' }, r))).toEqual(['capability'])
    expect(failing(assessFunction({ ...f(), capabilities: 'CAP-099' }, r))).toEqual(['capability'])
    expect(failing(assessFunction({ ...f(), scenarios: '' }, r))).toEqual(['scenario'])
    expect(failing(assessFunction({ ...f(), scenarios: '', planning: 'planning' }, r))).toEqual(['scenario'])
    // review M2: a short planning reason is a reason
    expect(failing(assessFunction({ ...f(), scenarios: '', planning: 'Runs on quarterly history' }, r))).toEqual([])
    expect(failing(assessFunction({ ...f(), group: 'FG-099' }, r))).toEqual(['group'])
    expect(failing(assessFunction({ ...f(), requirements: 'REQ-SYS-099' }, r))).toEqual(['known'])
  })
  it('the function minimum is lower for a team of three', () => {
    const r = mut((x) => (x.functions = x.functions.slice(0, LAB4_MINIMUMS_THREE.functions)))
    expect(allChecks(r).functions.issues.join(' ')).toMatch(`At least ${LAB4_MINIMUMS.functions} functions`)
    r.threePersonTeam = true
    expect(allChecks(r).functions.issues.join(' ')).not.toMatch(/At least \d+ functions/)
  })
})

describe('Week 4 record: allocation and decision gates, both directions', () => {
  it('a good allocation passes; each defect fails its own gate', () => {
    const r = fx()
    const f = r.functions[0]
    expect(failing(assessAllocation(f, r))).toEqual([])
    expect(failing(assessAllocation({ ...f, log: 'LOG-099' }, r))).toEqual(['logical', 'consistent'])
    expect(failing(assessAllocation({ ...f, phy: 'PHY-099' }, r))).toEqual(['physical', 'consistent'])
    expect(failing(assessAllocation({ ...f, phy: 'PHY-002' }, r))).toEqual(['consistent'])
    expect(failing(assessAllocation({ ...f, criterion: '' }, r))).toEqual(['criterion'])
    expect(failing(assessAllocation({ ...f, why: 'flow' }, r))).toEqual(['criterion'])
    expect(failing(assessAllocation({ ...f, why: '' }, r))).toEqual(['criterion'])
    // gate sweep 2026-10-19: a two-word sentence is a justification
    expect(failing(assessAllocation({ ...f, why: 'Same voltage.' }, r))).toEqual([])
  })
  it('an unallocated system requirement blocks the part; allocating it to a physical element is accepted', () => {
    const r = mut((x) => (x.functions.find((y) => y.id === 'FN-007')!.requirements = ''))
    expect(unallocatedSystemRequirements(r)).toEqual(['REQ-SYS-003'])
    expect(allChecks(r).allocation.ok).toBe(false)
    r.physical.find((p) => p.id === 'PHY-002')!.requirements = 'REQ-SYS-003'
    expect(unallocatedSystemRequirements(r)).toEqual([])
  })
  it('a good decision passes; each defect fails its own gate', () => {
    const r = fx()
    const d = r.decisions[0]
    expect(failing(assessDecision(d, r))).toEqual([])
    expect(failing(assessDecision({ ...d, question: '' }, r))).toEqual(['question'])
    expect(failing(assessDecision({ ...d, alternatives: 'A\nIn a refrigerator at each pantry' }, r))).toEqual(['alternatives'])
    expect(failing(assessDecision({ ...d, chosen: 'Something else entirely' }, r))).toEqual(['chosen'])
    expect(failing(assessDecision({ ...d, rationale: ' ' }, r))).toEqual(['rationale'])
    expect(failing(assessDecision({ ...d, links: 'R-099' }, r))).toEqual(['links'])
  })
  it('review M2: a short valid question, a five-word rationale and the chosen alternative written with other capitals or a full stop are accepted', () => {
    const r = fx()
    const d = r.decisions[0]
    expect(failing(assessDecision({ ...d, question: 'Where should produce wait?' }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, rationale: 'No extra van runs needed.' }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, chosen: 'in a refrigerator at each pantry.' }, r))).toEqual([])
  })
  it('gate sweep 2026-10-19 (confirmation N3): a one-word question or rationale, list markers and a final "?" are accepted; a chosen option not listed still fails', () => {
    const r = fx()
    const d = r.decisions[0]
    expect(failing(assessDecision({ ...d, question: 'Fridges?' }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, rationale: 'Cheaper.' }, r))).toEqual([])
    const alts = lines(d.alternatives)
    expect(alts.length).toBeGreaterThanOrEqual(3)
    const chosen = d.chosen.trim()
    expect(failing(assessDecision({ ...d, alternatives: alts.map((a) => `- ${a}`).join('\n') }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, alternatives: alts.map((a, i) => `${i + 1}. ${a}`).join('\n') }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, alternatives: alts.map((a, i) => `${i + 1}) ${a}?`).join('\n') }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, alternatives: alts.map((a) => `• ${a}`).join('\n'), chosen: `${chosen}?` }, r))).toEqual([])
    expect(failing(assessDecision({ ...d, alternatives: alts.map((a) => `- ${a}`).join('\n'), chosen: 'Something else entirely' }, r))).toEqual(['chosen'])
    // three markers alone are not three alternatives
    expect(failing(assessDecision({ ...d, alternatives: '-\n-\n-' }, r))).toContain('alternatives')
  })
})

describe('Week 4 record: information and AI gates, both directions', () => {
  it('a good item passes; each defect fails its own gate; advisories never block', () => {
    const r = fx()
    const x = r.information[0]
    expect(failing(assessInfo(x, r))).toEqual([])
    expect(failing(assessInfo({ ...x, content: '' }, r))).toEqual(['name'])
    expect(failing(assessInfo({ ...x, information: '' }, r))).toEqual(['data-information'])
    expect(failing(assessInfo({ ...x, producers: 'PHY-099' }, r))).toEqual(['producer'])
    expect(failing(assessInfo({ ...x, producers: 'AI-099' }, r))).toEqual(['producer'])
    expect(failing(assessInfo({ ...x, consumers: 'PHY-099' }, r))).toEqual(['consumer'])
    expect(failing(assessInfo({ ...x, consumers: 'EXT-099' }, r))).toEqual(['consumer'])
    expect(failing(assessInfo({ ...x, consumers: 'LOG-001' }, r))).toEqual(['consumer'])
    expect(failing(assessInfo({ ...x, data: 'order lines', information: 'Order lines' }, r))).toEqual(['data-information'])
    expect(failing(assessInfo({ ...x, decision: '' }, r))).toEqual(['decision'])
    // gate sweep 2026-10-19: a one-word decision is a decision
    expect(failing(assessInfo({ ...x, decision: 'Restock' }, r))).toEqual([])
    expect(failing(assessInfo({ ...x, decisionRefs: '' }, r))).toEqual(['decision-ref'])
    const advisory = assessInfo({ ...x, route: '', content: 'Driver names and phone numbers for each shift.', sensitivity: '' }, r)
    expect(advisory.counts).toBe(true)
    expect(advisory.advisories.map((a) => a.id).sort()).toEqual(['no-route', 'personal'])
    expect(assessInfo(r.information.find((y) => y.id === 'INFO-005')!, r).advisories.map((a) => a.id)).toContain('same-element')
  })
  it('review M2: what the lecture allows is accepted: an external consumer, an AI producer (with the oversight advisory), short data and a two-word decision', () => {
    const r = fx()
    const x = r.information[0]
    // the fixture's own funders' portal as the consumer of a report to funders
    expect(failing(assessInfo({ ...x, consumers: 'EXT-001' }, r))).toEqual([])
    // an AI card's output is information someone uses: AI-001 as a producer, consumed by the warehouse
    const fromAi = assessInfo({ ...x, producers: 'AI-001', consumers: 'PHY-005' }, r)
    expect(fromAi.counts).toBe(true)
    expect(fromAi.advisories.map((a) => a.id)).toContain('ai-producer')
    // the route rule applies to the AI's host: AI-001 on PHY-001 feeding PHY-001 is an internal item
    expect(assessInfo({ ...x, producers: 'AI-001', consumers: 'PHY-001' }, r).advisories.map((a) => a.id)).toContain('same-element')
    expect(failing(assessInfo({ ...x, data: 'fault codes', information: 'no-go list', decision: 'Send van' }, r))).toEqual([])
    // and the part counts such items: the fixture's report to funders now lists the portal as a consumer
    expect(r.information.find((y) => y.id === 'INFO-003')!.consumers).toContain('EXT-001')
    expect(allChecks(r).information.ok).toBe(true)
  })
  it('a good AI card passes; each defect fails its own gate', () => {
    const r = fx()
    const a = r.ai[0]
    expect(failing(assessAi(a, r))).toEqual([])
    expect(failing(assessAi({ ...a, host: 'PHY-099' }, r))).toEqual(['host'])
    expect(failing(assessAi({ ...a, supports: '' }, r))).toEqual(['function'])
    expect(failing(assessAi({ ...a, inputs: 'INFO-099' }, r))).toEqual(['inputs'])
    expect(failing(assessAi({ ...a, outputs: '' }, r))).toEqual(['outputs'])
    expect(failing(assessAi({ ...a, oversight: 'none' }, r))).toEqual(['oversight'])
    expect(failing(assessAi({ ...a, oversight: 'N/A' }, r))).toEqual(['oversight'])
    expect(failing(assessAi({ ...a, failure: 'none' }, r))).toEqual(['failure'])
    // gate sweep 2026-10-19: a two-word oversight and failure count
    expect(failing(assessAi({ ...a, oversight: 'Manager approves', failure: 'False alarms' }, r))).toEqual([])

    expect(failing(assessAi({ ...a, failure: '' }, r))).toEqual(['failure'])
    // review M2: short valid entries count
    expect(failing(assessAi({ ...a, outputs: 'warnings', oversight: 'Manager decides; never silences', failure: 'Missed warning: spoiled stock' }, r))).toEqual([])
  })
})

describe('Week 4 record: IDs, export and teammate import', () => {
  it('never reuses a deleted ID', () => {
    const r = fx()
    r.functions = r.functions.filter((f) => f.id !== 'FN-010')
    expect(nextId(r, 'FN')).toBe('FN-011')
  })
  it('exports the versioned week4-model-inputs file and reads it back unchanged', () => {
    const r = fx()
    const out = modelInputs(r)
    expect(out.format).toBe('week4-model-inputs')
    expect(out.version).toBe(MODEL_INPUTS_VERSION)
    expect(out.status).toBe('ready')
    const back = importWeek4(JSON.stringify(out))
    expect('error' in back).toBe(false)
    expect(normalizeRecord(back).functions.map((f) => f.id)).toEqual(r.functions.map((f) => f.id))
    expect(recordState(back as Week4Record)).toBe('ready')
  })
  it('refuses a Week 3 file, a wrong version, malformed lists and bad IDs in the teammate import', () => {
    expect((importWeek4(WEEK3_JSON) as { error: string }).error).toMatch(/Week 3 model-inputs/)
    const out = modelInputs(fx())
    expect(importWeek4(JSON.stringify({ ...out, version: 2 }))).toHaveProperty('error')
    expect(importWeek4(JSON.stringify({ ...out, functions: 'x' }))).toHaveProperty('error')
    expect(importWeek4(JSON.stringify({ ...out, functions: [{ id: 'F1' }] }))).toHaveProperty('error')
  })
  it('the Markdown record names every part and the consistency checks', () => {
    const md = recordMarkdown(fx(), '2026-10-19')
    for (const h of ['## 15.', '## 16.', '## 17.', '## 18.', '## Consistency checks']) expect(md).toContain(h)
  })
})
