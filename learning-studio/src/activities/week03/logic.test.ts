import { describe, expect, it } from 'vitest'
import { citationInRange } from '../../content/readings'
import { kindOfId, type EngineeringModel } from '../../model/engineering'
import { referenceUpTo } from '../../model/reference'
import { CRITERIA, CRITIQUE_ITEMS, attributedSubject, checkNeed, diagnose, hasConditionCue, requirementWords, scoreCritique, soiSubject, solutionTerms, type Flaw, type NeedDraft } from './needs'
import { WORKED_GAP, capabilityCoverage, chargesPerCharger, checkCapability, gapAnalysis, gapCell, l3CapabilityChecks } from './capabilities'
import { blankMgo, checkMgo, mgoAttributes, mgoDraftOf, type MgoDraft } from './mgo'
import { WORKED_SCN005, checkScenario, draftFromScenario, kindOf, scenarioCoverage, toScenarioAttributes, type ScenarioDraft } from './scenarios'

const ref = referenceUpTo(3)
const failing = (rs: { id: string; ok: boolean }[]) => rs.filter((r) => !r.ok).map((r) => r.id)

// ------------------------------------------------------------------------------------------------
describe('need-statement criteria (R11 p.553–555, R53 p.296)', () => {
  const good: NeedDraft = {
    name: 'Short, predictable wait',
    text: 'Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours.',
    conditions: '',
    rationale: 'Wait and its predictability decide whether riders return (CON-001).',
    traces: ['STK-001', 'CON-001'],
  }

  it('a well-formed need passes every criterion', () => {
    expect(failing(checkNeed(good))).toEqual([])
  })

  it('each criterion can fail on its own (mutation tests)', () => {
    expect(failing(checkNeed({ ...good, text: 'Passengers shall board within a short time after confirming a ride, throughout operating hours.' }))).toEqual(['not-requirement', 'attributed'])
    expect(failing(checkNeed({ ...good, text: good.text.replace('need to board', 'need a mobile app to board') }))).toEqual(['solution-free'])
    expect(failing(checkNeed({ ...good, text: 'There is a need to board within a short and predictable time, throughout operating hours.' }))).toEqual(['attributed'])
    expect(failing(checkNeed({ ...good, traces: [] }))).toEqual(['traced'])
    expect(failing(checkNeed({ ...good, traces: ['NEED-002'] }))).toEqual(['traced'])
    expect(failing(checkNeed({ ...good, text: 'Passengers need a short and predictable wait to board.' }))).toEqual(['condition'])
    expect(failing(checkNeed({ ...good, rationale: 'Riders.' }))).toEqual(['rationale'])
    expect(failing(checkNeed({ ...good, name: ' ' }))).toEqual(['rationale'])
  })

  it('a condition can be given in the conditions field, but only as a real condition', () => {
    const d = { ...good, text: 'Passengers need a short and predictable wait to board.' }
    expect(failing(checkNeed({ ...d, conditions: 'throughout the 16 h operating day' }))).toEqual([])
    expect(failing(checkNeed({ ...d, conditions: 'always' }))).toEqual(['condition'])
    // W3-F04(b): three arbitrary words used to pass
    expect(failing(checkNeed({ ...d, conditions: 'not really applicable to this need' }))).toEqual(['condition'])
  })

  it('the conditions field is screened for solutions and requirement words too', () => {
    expect(failing(checkNeed({ ...good, conditions: 'using an app at peak hours' }))).toEqual(['solution-free'])
    expect(failing(checkNeed({ ...good, conditions: 'the service must run at peak hours' }))).toEqual(['not-requirement'])
  })

  // W3-F04 regression probes: plausible, long-enough bad needs that used to pass every criterion.
  it('rejects the system of interest as the needing party (a)', () => {
    const d = { ...good, text: 'The system needs to dispatch aircraft quickly to waiting passengers at peak hours.' }
    expect(failing(checkNeed(d))).toEqual(['attributed'])
    expect(soiSubject(d.text)).toBe(true)
    expect(failing(checkNeed({ ...good, text: 'AeroLink needs to keep passenger waits short and predictable at all operating hours.' }))).toEqual(['attributed'])
    expect(failing(checkNeed({ ...good, text: 'The booking app needs to confirm rides for passengers throughout operating hours.' }))).toContain('attributed')
    // a stakeholder whose name contains a SoI word is still a stakeholder
    expect(attributedSubject('Vertiport operators need arriving aircraft …')).toBe('Vertiport operators')
    expect(attributedSubject('Passengers who use wheelchairs need to board …')).toBe('Passengers who use wheelchairs')
  })

  it('a bare temporal word is not a condition (c)', () => {
    expect(failing(checkNeed({ ...good, text: 'Passengers need to board the aircraft soon after confirming a ride.' }))).toEqual(['condition'])
    expect(hasConditionCue('board before departure if possible')).toBe(false)
    expect(hasConditionCue('under adverse weather')).toBe(true)
  })

  it('catches solutions the first lexicon missed (d)', () => {
    const probes = [
      'Passengers need helipads on every rooftop so they can board close to home, at all hours.',
      'Communities need a curfew on night flights from every vertiport, at all operating hours.',
      'Passengers need autonomous aircraft so that fares stay low, throughout operating hours.',
      'Investors need a bigger fleet of 30 aircraft by year 2, throughout the growth phase.',
    ]
    for (const t of probes) expect(failing(checkNeed({ ...good, text: t })), t).toEqual(['solution-free'])
    expect(failing(checkNeed({ ...good, text: 'AeroLink needs a curfew on night flights to keep neighbours content at night.' }))).toEqual(['solution-free', 'attributed'])
  })

  it('the lexical screens detect what they claim and leave plain wording alone', () => {
    expect(requirementWords('The system shall and must be required to')).toEqual(['shall', 'must'])
    expect(solutionTerms('a fast-charger and a radar').map((s) => s.term)).toEqual(['sensor or surveillance equipment', 'charging or energy hardware'])
    expect(solutionTerms('mobility aid')).toEqual([])
    expect(solutionTerms('without being lifted')).toEqual([])
    expect(solutionTerms('arriving aircraft at every pad')).toEqual([])
    expect(attributedSubject('It is necessary that passengers need …')).toBeUndefined()
    expect(attributedSubject('The FAA needs assurance')).toBe('The FAA')
    expect(hasConditionCue('takes under 10 minutes')).toBe(false)
  })

  it('every reference need passes all six criteria with its own conditions, rationale and trace links (rule 4)', () => {
    const needs = ref.elements.filter((e) => e.kind === 'NEED')
    expect(needs).toHaveLength(11)
    for (const n of needs) {
      const d: NeedDraft = {
        name: n.name,
        text: n.text!,
        conditions: String(n.attributes?.conditions ?? ''),
        rationale: String(n.attributes?.rationale ?? ''),
        traces: ref.links.filter((l) => l.source === n.id && l.type === 'derives-from').map((l) => l.target),
      }
      expect(failing(checkNeed(d)), n.id).toEqual([])
    }
    // mutation: without its explicit condition, NEED-004 (and NEED-006, NEED-008) leave the condition implicit
    const n4 = needs.find((n) => n.id === 'NEED-004')!
    expect(failing(checkNeed({ name: n4.name, text: n4.text!, conditions: '', rationale: String(n4.attributes?.rationale), traces: ['STK-005'] }))).toEqual(['condition'])
    expect(needs.filter((n) => !hasConditionCue(n.text!)).map((n) => n.id)).toEqual(['NEED-004', 'NEED-006', 'NEED-008', 'NEED-009'])
  })

  it('criterion citations lie inside verified ranges', () => {
    for (const c of CRITERIA) expect(citationInRange(c.cite), c.id).toBe(true)
  })
})

describe('critique exercise', () => {
  // Expected flaws stated independently of the implementation.
  const expected: Record<string, Flaw[]> = {
    c1: ['requirement', 'solution', 'unattributed', 'no-condition'],
    c2: ['solution', 'no-condition'],
    c3: ['solution'],
    c4: ['solution', 'no-condition'],
    c5: ['requirement', 'solution', 'unattributed'],
    c6: [],
  }
  it('diagnoses each "before" statement as the key states', () => {
    for (const it of CRITIQUE_ITEMS) expect(diagnose(it.before), it.id).toEqual(expected[it.id])
  })
  it('every "after" rewrite is flaw-free', () => {
    for (const it of CRITIQUE_ITEMS) expect(diagnose(it.after), it.id).toEqual([])
  })
  it('scores exact matches only; an unticked set is right only for the flawless statement', () => {
    const perfect = Object.fromEntries(CRITIQUE_ITEMS.map((it) => [it.id, Object.fromEntries(expected[it.id].map((f) => [f, true]))]))
    expect(scoreCritique(perfect).correct).toBe(6)
    expect(scoreCritique({}).correct).toBe(1)
    const over = { ...perfect, c3: { solution: true, 'no-condition': true } }
    const r = scoreCritique(over)
    expect(r.correct).toBe(5)
    expect(r.rows.find((x) => x.id === 'c3')!.extra).toEqual(['no-condition'])
  })
})

// ------------------------------------------------------------------------------------------------
describe('capability tree and coverage', () => {
  it('the reference baseline passes every L3 capability check', () => {
    const c = capabilityCoverage(ref)
    expect(c.caps).toHaveLength(10)
    expect(c.decomposed.sort()).toEqual(['CAP-001', 'CAP-003', 'CAP-004'])
    expect(failing(l3CapabilityChecks(c))).toEqual([])
    expect(c.roots.map((r) => r.id)).not.toContain('CAP-010')
    expect(c.roots.find((r) => r.id === 'CAP-003')!.children.map((x) => x.id)).toEqual(['CAP-010'])
  })

  const without = (m: EngineeringModel, pred: (l: EngineeringModel['links'][number]) => boolean): EngineeringModel => ({ ...m, links: m.links.filter((l) => !pred(l)) })

  it('flags an untraced capability and the need it leaves uncovered (mutation)', () => {
    const m = without(ref, (l) => l.source === 'CAP-009' && l.type === 'derives-from')
    const c = capabilityCoverage(m)
    expect(c.untracedCaps).toEqual(['CAP-009'])
    expect(c.uncoveredNeeds).toEqual(['NEED-006'])
    expect(failing(l3CapabilityChecks(c))).toEqual(['cap-traced', 'need-covered'])
  })

  it('fails the decomposition check when fewer than two parents have constituents (mutation)', () => {
    const m = without(ref, (l) => l.type === 'refines' && (l.source === 'CAP-002' || l.source === 'CAP-005'))
    expect(failing(l3CapabilityChecks(capabilityCoverage(m)))).toEqual(['cap-decomposed'])
  })

  it('fails the count check below five capabilities and detects a refines cycle (mutation)', () => {
    const few: EngineeringModel = { elements: ref.elements.filter((e) => e.kind !== 'CAP' || ['CAP-001', 'CAP-002'].includes(e.id)), links: ref.links }
    expect(failing(l3CapabilityChecks(capabilityCoverage(few)))).toContain('cap-count')
    const cyc: EngineeringModel = { ...ref, links: [...ref.links, { id: 'LNK-X', source: 'CAP-003', type: 'refines', target: 'CAP-010' }] }
    const c = capabilityCoverage(cyc)
    expect(c.cycles.sort()).toEqual(['CAP-003', 'CAP-010'])
    expect(failing(l3CapabilityChecks(c))).toEqual(['no-cycles'])
  })

  it('flags single-constituent decompositions as advisories only', () => {
    expect(capabilityCoverage(ref).singleChild.sort()).toEqual(['CAP-001', 'CAP-003', 'CAP-004'])
  })

  it('capability drafts need a name, an ability statement and a need; design terms are advisory', () => {
    const ok = { name: 'Charging power control', text: 'Schedule and limit charging power within each grid connection.', needs: ['NEED-010'], parent: 'CAP-003' }
    expect(checkCapability(ok)).toEqual({ errors: [], advisories: [] })
    expect(checkCapability({ ...ok, needs: [] }).errors).toHaveLength(1)
    expect(checkCapability({ ...ok, text: 'The system shall limit charging power at each vertiport.' }).errors).toHaveLength(1)
    const adv = checkCapability({ ...ok, text: 'Limit charging power at each vertiport using an AI optimiser.' })
    expect(adv.errors).toEqual([])
    expect(adv.advisories).toHaveLength(1)
  })
})

describe('capability-gap analysis (R12 p.862)', () => {
  it('charger occupancy: the 20 min convention (A-007) gives 48 charges a day, the 25 min sensitivity 38.4 (FICTIONAL 16 h day)', () => {
    expect(chargesPerCharger(20)).toBe(48)
    expect(chargesPerCharger(25)).toBeCloseTo(38.4, 9)
    expect(6 * chargesPerCharger(20)).toBe(288)
    expect(Math.floor(6 * chargesPerCharger(25))).toBe(230)
    // chargers needed to close the year-2 and year-3 gaps under the convention, then under the sensitivity case
    expect(Math.ceil((300 - 288) / chargesPerCharger(20))).toBe(1)
    expect(Math.ceil((400 - 288) / chargesPerCharger(20))).toBe(3)
    expect(Math.ceil((300 - 230) / chargesPerCharger(25))).toBe(2)
    expect(Math.ceil((400 - 230) / chargesPerCharger(25))).toBe(5)
  })

  it('the convention matches the reference assumption A-007 (5 min pad work + 20 min charging = the 25 min turnaround; the charger serves two pads)', () => {
    const a = ref.elements.find((e) => e.id === 'A-007')!
    expect(a.attributes).toMatchObject({ occupancyMin: 20, turnaroundMin: 25, padWorkMin: 5, padsPerTurnaroundCharger: 2, chargesPerChargerPerDay: chargesPerCharger(20) })
    expect(WORKED_GAP[1].capability).toContain('A-007')
    expect(WORKED_GAP[1].baseline.mid).toBe(6 * (a.attributes!.chargesPerChargerPerDay as number))
  })

  it('reproduces the worked example (FICTIONAL numbers)', () => {
    const [fleet, charging20, charging25] = gapAnalysis(WORKED_GAP)
    expect(fleet.cells.map((c) => [c.status, c.delta])).toEqual([['excess', 40], ['gap', -60], ['gap', -160]])
    expect(fleet.firstGap).toBe('mid')
    expect(charging20.cells.map((c) => [c.status, c.delta])).toEqual([['excess', 88], ['probable-gap', -12], ['gap', -112]])
    expect(charging20).toMatchObject({ firstGap: 'mid', firstGapProbable: true })
    expect(charging25.cells.map((c) => [c.status, c.delta])).toEqual([['excess', 30], ['gap', -70], ['gap', -170]])
    expect(charging25).toMatchObject({ firstGap: 'mid', firstGapProbable: false })
  })

  it('the assumption test: under either occupancy reading charging is short by year 2 (robust conclusion)', () => {
    for (const r of gapAnalysis(WORKED_GAP).slice(1)) expect(r.firstGap).toBe('mid')
  })

  it('the upper-bound flag is what turns the in-band shortfall into a probable gap (mutation)', () => {
    const noFlag = WORKED_GAP.map((r) => ({ ...r, upperBound: false }))
    expect(gapAnalysis(noFlag)[1].cells[1].status).toBe('balanced')
    expect(gapAnalysis(noFlag)[1].firstGap).toBe('far')
    // the sensitivity row's year-2 shortfall lies outside the band, so the flag does not change it
    expect(gapAnalysis(noFlag)[2].cells[1].status).toBe('gap')
    // an excess inside the band stays balanced even for an upper bound
    expect(gapCell('near', 305, 300, 0.05, true).status).toBe('balanced')
    // zero tolerance: a plain gap
    expect(gapAnalysis(WORKED_GAP, 0)[1].cells[1].status).toBe('gap')
  })

  it('a missing or non-positive value makes the cell incomplete, not a gap', () => {
    expect(gapCell('near', undefined, 100).status).toBe('incomplete')
    expect(gapCell('near', 100, 0).status).toBe('incomplete')
    expect(gapCell('near', Number.NaN, 100).status).toBe('incomplete')
  })
})

// ------------------------------------------------------------------------------------------------
describe('scenario checks (L3 acceptance; R59 p.453–455)', () => {
  it('the SCN-005 worked example passes every check', () => {
    expect(failing(checkScenario(WORKED_SCN005))).toEqual([])
  })

  const d = WORKED_SCN005
  const cases: [string, ScenarioDraft, string][] = [
    ['no trigger', { ...d, trigger: ' ' }, 'trigger'],
    ['no preconditions', { ...d, preconditions: '' }, 'preconditions'],
    ['primary actor not among the actors', { ...d, primaryActor: 'Air traffic controller' }, 'actors'],
    ['primary actor is an environmental factor', { ...d, primaryActor: 'EXT-003' }, 'actors'],
    ['one actor only', { ...d, actorIds: [], environment: [], otherActors: 'Operations centre duty manager', steps: d.steps.map((s) => ({ ...s, actor: 'Operations centre duty manager' })) }, 'actors'],
    ['a step without an actor', { ...d, steps: d.steps.map((s, i) => (i === 2 ? { ...s, actor: '' } : s)) }, 'step-actors'],
    ['a step by someone not in the actor list', { ...d, steps: d.steps.map((s, i) => (i === 2 ? { ...s, actor: 'Mayor' } : s)) }, 'step-actors'],
    ['a step performed by the weather (an environmental factor)', { ...d, steps: d.steps.map((s, i) => (i === 0 ? { ...s, actor: 'EXT-003' } : s)) }, 'step-actors'],
    ['no alternate flow', { ...d, alternates: [] }, 'alternates'],
    ['alternate branches from a step that does not exist', { ...d, alternates: [{ ...d.alternates[0], atStep: 99 }] }, 'alternates'],
    ['alternate rejoins nowhere', { ...d, alternates: [{ ...d.alternates[0], rejoinAt: 0 }] }, 'alternates'],
    ['alternate without a condition', { ...d, alternates: [{ ...d.alternates[0], condition: '' }] }, 'alternates'],
    ['no failure end state', { ...d, failureEnd: '' }, 'end-states'],
    ['UI detail in a step', { ...d, steps: d.steps.map((s, i) => (i === 4 ? { ...s, action: 'Clicks the rebook button for each passenger.' } : s)) }, 'no-ui'],
    ['not traced to a capability', { ...d, capabilities: [] }, 'traced'],
    ['no type', { ...d, kind: '' }, 'name'],
  ]
  for (const [label, draft, id] of cases) {
    it(`fails exactly “${id}” when: ${label} (mutation)`, () => {
      expect(failing(checkScenario(draft))).toEqual([id])
    })
  }

  it('fewer than three steps fails the step check', () => {
    expect(failing(checkScenario({ ...d, steps: d.steps.slice(0, 2), alternates: [] }))).toEqual(['steps', 'alternates'])
  })

  it('citations of scenario checks lie inside verified ranges', () => {
    for (const f of checkScenario(d)) if (f.cite) expect(citationInRange(f.cite), f.id).toBe(true)
  })
})

describe('reference scenarios pass the builder’s own checks (W3-F03; rule 4)', () => {
  const scns = ref.elements.filter((e) => e.kind === 'SCN')

  it('every reference scenario, parsed back into a draft, passes all ten checks', () => {
    expect(scns).toHaveLength(5)
    for (const s of scns) expect(failing(checkScenario(draftFromScenario(s, ref))), s.id).toEqual([])
  })

  it('the parse is faithful: steps, alternates, primary actor and end states are recovered', () => {
    const s5 = draftFromScenario(scns.find((s) => s.id === 'SCN-005')!, ref)
    expect(s5.steps).toHaveLength(7)
    expect(s5.alternates.map((a) => [a.atStep, a.outcome, a.rejoinAt])).toEqual([[3, 'rejoin', 5], [2, 'end', undefined], [7, 'end', undefined]])
    expect(s5.primaryActor).toBe('Operations centre duty manager')
    expect(s5.environment).toEqual(['EXT-003'])
    expect(s5.capabilities).toEqual(['CAP-005'])
    expect(s5.failureEnd).toMatch(/^Service at V3 suspended/)
  })

  it('worked example (c) is the reference SCN-005, attribute for attribute', () => {
    const r5 = scns.find((s) => s.id === 'SCN-005')!
    const w = toScenarioAttributes(WORKED_SCN005)
    for (const [k, v] of Object.entries(w)) expect(r5.attributes?.[k], k).toBe(v)
  })

  it('the check discriminates on the reference: removing a trigger or a failure end fails it (mutation)', () => {
    const s2 = scns.find((s) => s.id === 'SCN-002')!
    const noTrigger = { ...s2, attributes: { ...s2.attributes, trigger: '' } }
    expect(failing(checkScenario(draftFromScenario(noTrigger, ref)))).toEqual(['trigger'])
    const successOnly = { ...s2, attributes: { ...s2.attributes, endState: 'Passengers delivered; flight data logged.' } }
    expect(failing(checkScenario(draftFromScenario(successOnly, ref)))).toEqual(['end-states'])
    const noPrimary = { ...s2, attributes: { ...s2.attributes, actors: 'STK-001; STK-008; EXT-001; STK-005' } }
    expect(failing(checkScenario(draftFromScenario(noPrimary, ref)))).toEqual(['actors'])
  })

  it('environmental actors in the reference are linked by affects, never performs', () => {
    expect(ref.links.some((l) => l.source === 'EXT-003' && l.type === 'performs')).toBe(false)
    expect(ref.links.some((l) => l.source === 'EXT-003' && l.type === 'affects' && l.target === 'SCN-005')).toBe(true)
  })
})

describe('scenario coverage', () => {
  it('the reference SCN-001..005 cover nominal, weather and charging/maintenance, all complete', () => {
    const c = scenarioCoverage(ref)
    expect(c).toMatchObject({ count: 5, nominal: true, weather: true, chargingOrMaintenance: true, incomplete: [], ok: true })
    expect(ref.elements.filter((e) => e.kind === 'SCN').map(kindOf)).toEqual(['nominal', 'nominal', 'charging', 'maintenance', 'weather'])
  })

  it('missing the weather scenario, or a blank part, fails coverage (mutation)', () => {
    const noWeather: EngineeringModel = { ...ref, elements: ref.elements.filter((e) => e.id !== 'SCN-005') }
    expect(scenarioCoverage(noWeather)).toMatchObject({ weather: false, ok: false })
    const blank: EngineeringModel = { ...ref, elements: ref.elements.map((e) => (e.id === 'SCN-003' ? { ...e, attributes: { ...e.attributes, trigger: '' } } : e)) }
    expect(scenarioCoverage(blank)).toMatchObject({ incomplete: ['SCN-003'], ok: false })
  })

  it('a recorded draft carries all six parts and its declared type', () => {
    const attrs = toScenarioAttributes(WORKED_SCN005)
    const el = { id: 'SCN-006', kind: 'SCN' as const, name: 'Storm at V3', attributes: attrs, provenance: 'team-derived' as const, status: 'active' as const }
    expect(kindOf(el)).toBe('weather')
    const m: EngineeringModel = { elements: [el], links: [] }
    expect(scenarioCoverage(m).incomplete).toEqual([])
    expect(attrs.mainFlow).toMatch(/^1\. AeroLink \(system of interest\): /)
    expect(attrs.alternateFlows).toContain('A1 (step 3)')
    expect(attrs.alternateFlows).toContain('Rejoin at step 5.')
    expect(attrs.actors).toContain('EXT-003 (environment)')
  })
})

// ------------------------------------------------------------------------------------------------
describe('MGO checks (R10 p.543–546; course convention for RB-2.1)', () => {
  const objective: MgoDraft = {
    ...blankMgo(),
    level: 'objective',
    name: '90 % boarded within 15 min',
    text: 'From month 6 onward, at least 90 % of passengers in each calendar month board within 15 min of confirming their ride.',
    parent: 'MGO-002',
    concerns: ['CON-001'],
    measure: '90th-percentile wait',
    target: '15',
    unit: 'min',
    horizon: 'each month from month 6',
  }
  it('a complete objective passes', () => {
    expect(failing(checkMgo(objective, 'goal'))).toEqual([])
    expect(mgoAttributes(objective)).toEqual({ level: 'objective', measure: '90th-percentile wait', target: 15, unit: 'min', horizon: 'each month from month 6' })
  })
  it('each objective check can fail on its own (mutation tests)', () => {
    expect(failing(checkMgo(objective, 'mission'))).toEqual(['parent'])
    expect(failing(checkMgo(objective, undefined))).toEqual(['parent'])
    expect(failing(checkMgo({ ...objective, target: 'soon' }, 'goal'))).toEqual(['measure'])
    expect(failing(checkMgo({ ...objective, unit: '' }, 'goal'))).toEqual(['measure'])
    expect(failing(checkMgo({ ...objective, measure: 'minimise waiting' }, 'goal'))).toEqual(['measure'])
    expect(failing(checkMgo({ ...objective, horizon: '' }, 'goal'))).toEqual(['horizon'])
    expect(failing(checkMgo({ ...objective, text: objective.text + ' Give an excellent experience.' }, 'goal'))).toEqual(['vague'])
    expect(failing(checkMgo({ ...objective, concerns: [] }, 'goal'))).toEqual(['traced'])
    expect(failing(checkMgo({ ...objective, text: 'Short waits.' }, 'goal'))).toEqual(['basic'])
  })
  it('an objective may answer its concern through its goal (inherited trace)', () => {
    expect(failing(checkMgo({ ...objective, concerns: [] }, 'goal', ['CON-001']))).toEqual([])
    expect(failing(checkMgo({ ...objective, concerns: [] }, 'goal', ['MGO-001']))).toEqual(['traced'])
  })
  it('a qualitative objective statement in SEBoK’s form is accepted when its measure carries the number', () => {
    const qualitative = { ...objective, text: 'Passengers receive an aircraft soon after they confirm, and the quoted wait holds.' }
    expect(failing(checkMgo(qualitative, 'goal'))).toEqual([])
  })
  it('a goal needs a mission parent but no measure; a mission needs a concern but no parent', () => {
    const goal: MgoDraft = { ...blankMgo(), level: 'goal', name: 'Short waits', text: 'Passengers board soon after they confirm a ride.' }
    expect(failing(checkMgo(goal, 'mission'))).toEqual([])
    expect(failing(checkMgo(goal, 'goal'))).toEqual(['parent'])
    const mission: MgoDraft = { ...blankMgo(), level: 'mission', name: 'Mission', text: 'Provide safe, quiet on-demand air trips across the region.', concerns: ['CON-001'] }
    expect(failing(checkMgo(mission))).toEqual([])
    expect(failing(checkMgo({ ...mission, concerns: [] }))).toEqual(['traced'])
  })

  // W3-F02: the old test passed on a hand-made draft. These rebuild each reference MGO from the model itself.
  it('every reference MGO, rebuilt from the model, passes the recorder checks (MGO-008 is elaborated from the goal MGO-009)', () => {
    const ids = ref.elements.filter((e) => e.kind === 'MGO').map((e) => e.id)
    expect(ids).toEqual(['MGO-001', 'MGO-002', 'MGO-003', 'MGO-004', 'MGO-005', 'MGO-006', 'MGO-007', 'MGO-008', 'MGO-009'])
    const result = Object.fromEntries(ids.map((id) => {
      const { draft, parentLevel, inherited } = mgoDraftOf(ref, id)
      return [id, failing(checkMgo(draft, parentLevel, inherited))]
    }))
    expect(result).toEqual({ 'MGO-001': [], 'MGO-002': [], 'MGO-003': [], 'MGO-004': [], 'MGO-005': [], 'MGO-006': [], 'MGO-007': [], 'MGO-008': [], 'MGO-009': [] })
    // MGO-008 answers CON-004 through its goal, not directly (W3-F02)
    expect(mgoDraftOf(ref, 'MGO-008')).toMatchObject({ parentLevel: 'goal', inherited: ['CON-004'], draft: { parent: 'MGO-009', concerns: [] } })
  })
  it('the MGO-008 fix discriminates: re-attaching it to the mission brings back the parent failure (mutation)', () => {
    const m: EngineeringModel = { ...ref, links: ref.links.map((l) => (l.source === 'MGO-008' && l.target === 'MGO-009' ? { ...l, target: 'MGO-001' } : l)) }
    const d = mgoDraftOf(m, 'MGO-008')
    expect(failing(checkMgo(d.draft, d.parentLevel, d.inherited))).toEqual(['parent'])
  })
  it('the reference check discriminates: dropping a goal’s concern link or an objective’s horizon fails it (mutation)', () => {
    const m: EngineeringModel = { ...ref, links: ref.links.filter((l) => !(l.source === 'MGO-002' && kindOfId(l.target) === 'CON')) }
    const a = mgoDraftOf(m, 'MGO-005')
    expect(failing(checkMgo(a.draft, a.parentLevel, a.inherited))).toEqual(['traced'])
    const noHorizon: EngineeringModel = { ...ref, elements: ref.elements.map((e) => (e.id === 'MGO-006' ? { ...e, attributes: { ...e.attributes, horizon: '' } } : e)) }
    const b = mgoDraftOf(noHorizon, 'MGO-006')
    expect(failing(checkMgo(b.draft, b.parentLevel, b.inherited))).toEqual(['horizon'])
  })
})
