// The generated Week 11 SysML files (scripts/build-week11-sysml.mjs writes them; sysmlWeek11.test.ts checks they are
// current and that the checker accepted them). Kept apart from physical.ts so the app bundle never needs the Week 5 and
// Week 10 fixtures. Each file is produced exactly as the lab tool produces a team's file: the inputs go through the same
// readers (the Week 10 model text and the Week 5 JSON text) and the same generator.
// Review status: new-pending-review.
import { AEROLINK_W11_MODEL, AEROLINK_W11_MODEL_FILE } from '../../content/lectures/week11/aerolinkCase'
import { week5Fixture } from '../week5/fixture'
import { modelInputs as week5Inputs, type Week5Record } from '../week5/record'
import { collision10, fixture10, stress10 } from '../week10/generated'
import { EMPTY_CHOICES, generateModel, nextInfoId, parseModel, physFromWeek5, readWeek10, readWeek5For11, type W11Choices, type W11Phys } from './physical'

const DATE = '2026-10-22'

/** The physical source from a Week 5 JSON text, read exactly as the tool reads a team's file. */
export function physOf(week5Json: string): W11Phys {
  const r = readWeek5For11(week5Json)
  if ('error' in r) throw new Error(r.error)
  return physFromWeek5(r.record)
}

// ---------------------------------------------------------------------------------------------- the fixture team
/** The Riverside team's Week 5 record as the current tools produce it (FICTIONAL). The committed Week 5 fixture was built
 *  before the Week 4 export carried the Week 1 externals (Week 7 review M3/N1), so its externals reuse EXT-001..005,
 *  which the team's Week 8 model gives to its six Week 1 externals. With the current tools the Week 4 export carries the
 *  six Week 1 externals and every Week 4 and Week 5 external continues after them: that is the record built here, in
 *  Week 5's own data shape, before it is exported and read like any team's file. The uncorrected record is kept for the
 *  stress file, where the Week 11 tool must report each collision and never renumber. */
export function week5Fixture11(): Week5Record {
  const r = structuredClone(week5Fixture())
  const model = parseModel(fixture10().model.text)
  if ('error' in model) throw new Error(model.error)
  const week1 = model.model.externals.map((x) => ({ id: x.id, name: x.def }))
  const next = new Map<string, string>()
  let n = Math.max(...week1.map((x) => Number(x.id.slice(4))))
  for (const x of [...(r.week4?.externals ?? []), ...r.externals]) next.set(x.id, `EXT-${String(++n).padStart(3, '0')}`)
  const re = (s: string) => s.replace(/\bEXT-\d{3}\b/g, (id) => next.get(id) ?? id)
  r.week4 = { ...r.week4!, week1Externals: week1, externals: r.week4!.externals.map((x) => ({ ...x, id: re(x.id) })), information: r.week4!.information.map((x) => ({ ...x, producers: x.producers.map(re), consumers: x.consumers.map(re) })) }
  r.externals = r.externals.map((x) => ({ ...x, id: re(x.id) }))
  r.externalReasons = Object.fromEntries(Object.entries(r.externalReasons).map(([k, v]) => [re(k), v]))
  r.interfaces = r.interfaces.map((x) => ({ ...x, endA: re(x.endA), endB: re(x.endB), direction: re(x.direction) }))
  r.issued = { ...r.issued, EXT: n }
  return r
}
export const FIXTURE_WEEK5_JSON = JSON.stringify(week5Inputs(week5Fixture11()))
/** The information-item IDs the fixture team's new items take: the next ones after the highest its Week 5 file and its
 *  model v0.3 hold, as the tool issues them. */
const fixtureInfo = (() => {
  const m = parseModel(fixture10().model.text)
  if ('error' in m) throw new Error(m.error)
  const first = Number(nextInfoId(physOf(FIXTURE_WEEK5_JSON), m.model, 0).slice(5))
  return (k: number) => `INFO-${String(first + k).padStart(3, '0')}`
})()
export const FIXTURE11_FILE = 'lectures/week11/labtool_team07_model_v04.sysml'
/** The Riverside team's choices (FICTIONAL): what a team enters in the lab tool. One Week 8 part definition (the donation
 *  intake desk) has no Week 4 physical element and keeps a disposition; the function added in Week 10 is placed on the
 *  warehouse; the physical crossings become items; two satisfy claims, one by an interface. */
export const FIXTURE11_CHOICES: W11Choices = {
  ...EMPTY_CHOICES,
  placeholders: { 'Warehouse and cold storage': 'PHY-005', 'Delivery vans and volunteer drivers': 'PHY-002', 'Volunteer scheduling office': 'PHY-004' },
  fnPhy: { 'FN-011': 'PHY-005' },
  flows: {
    'IF-003': [{ item: 'INFO-003', dir: 'AtoB' }],
    'IF-005': [{ item: 'Chilled produce crates', dir: 'AtoB' }],
    'IF-006': [{ item: fixtureInfo(0), dir: 'AtoB' }],
    'IF-007': [{ item: fixtureInfo(1), dir: 'BtoA' }],
    'IF-008': [{ item: 'Riders and bags', dir: 'AtoB' }, { item: 'Riders and bags', dir: 'BtoA' }],
    'IF-009': [{ item: fixtureInfo(2), dir: 'AtoB' }, { item: fixtureInfo(2), dir: 'BtoA' }],
  },
  newItems: [
    { id: fixtureInfo(0), name: 'Freezer failure warnings', kind: 'information' },
    { id: fixtureInfo(1), name: 'Donation receipts', kind: 'information' },
    { id: fixtureInfo(2), name: 'Shortfall notice drafts', kind: 'information' },
    { id: '', name: 'Chilled produce crates', kind: 'material' },
    { id: '', name: 'Riders and bags', kind: 'material' },
  ],
  reqFns: { 'REQ-SYS-005': 'FN-006', 'REQ-SYS-006': 'FN-010', 'REQ-SYS-007': 'FN-004' },
  reqParts: [],
  satisfy: [
    { req: 'REQ-SYS-003', by: 'PHY-002', attribute: 'cargoTemperature', value: "4 ['°C']", basis: 'Refrigeration unit data sheet: holds 4 °C with the doors shut at 35 °C ambient; our logger readings from June average 4.2 °C.' },
    { req: 'REQ-SYS-007', by: 'IF-009', attribute: '', value: '', basis: 'The request builder sends only the order shortfall lines, never the client list; checked in a code walkthrough by AK.' },
  ],
}
export function fixture11() {
  const w10 = readWeek10(fixture10().model.text)
  if ('error' in w10) throw new Error(w10.error)
  const phys = physOf(FIXTURE_WEEK5_JSON)
  return { w10: w10.model, phys, model: generateModel(w10.model, phys, FIXTURE11_CHOICES, { date: DATE }) }
}

// ---------------------------------------------------------------------------------------------- the adversarial team
export const STRESS11_FILE = 'lectures/week11/labtool_stress_model_v04.sysml'
/** An adversarial but importable set: the Week 10 stress model (names with quotes, reserved words and package names), the
 *  uncorrected Week 5 record (its externals reuse IDs the model gives to other externals; one requirement ID names a
 *  different requirement in the model), a physical element and an interface named like packages, a component whose
 *  parent does not exist, an interface with an end that does not exist, two interfaces with the same name, a crossing
 *  that names no item, a new item with a taken ID, a function placed on a missing element, a requirement allocated to a
 *  missing function, satisfy claims by a part of the wrong type and with an unreadable value, quotes and comment
 *  terminators in the texts; and the generated file imported and generated again (idempotence). The file must still
 *  pass the checker. */
export function stressSources(): { phys: W11Phys; choices: W11Choices } {
  const p = structuredClone(physOf(JSON.stringify(week5Inputs(week5Fixture()))))
  p.physical[0].name = 'Logical'
  p.physical[1].text = 'Vans */ with "quotes" and \\ backslashes.'
  p.components.push({ id: 'CMP-099', name: 'Orphan', parent: 'PHY-099', kind: 'hardware', responsibility: '', functions: [] })
  p.components[0].name = 'state'
  p.interfaces[1].name = 'Requirements'
  p.interfaces[2].name = p.interfaces[3].name
  p.interfaces.push({ ...p.interfaces[0], id: 'IF-099', name: 'Ghost link', endA: 'PHY-004', endB: 'PHY-098' })
  p.requirements.push({ id: 'REQ-SYS-001', name: 'A different requirement', statement: 'Collides with the model.', interface: 'IF-001', criterion: '', method: 'test', parents: [], rationale: '' })
  return {
    phys: p,
    choices: {
      ...EMPTY_CHOICES,
      placeholders: { 'Delivery vans and volunteer drivers': 'PHY-002', 'Nowhere part': 'PHY-001' },
      fnPhy: { 'FN-011': 'PHY-077' },
      flows: { 'IF-005': [{ item: 'Nothing like this', dir: 'AtoB' }, { item: 'Loaded van', dir: 'BtoA' }] },
      newItems: [{ id: 'INFO-001', name: 'Taken ID item', kind: 'information' }, { id: '', name: 'action', kind: 'material' }],
      reqFns: { 'REQ-SYS-005': 'FN-099, FN-006' },
      reqParts: [{ row: 1, req: 'REQ-STK-001', els: 'PHY-003, PHY-088' }, { row: 2, req: 'REQ-STK-999', els: 'PHY-001' }],
      satisfy: [
        { req: 'REQ-SYS-003', by: 'PHY-001', attribute: 'cargoTemperature', value: '4', basis: 'Wrong part on purpose.' },
        { req: 'REQ-SYS-003', by: 'PHY-002', attribute: 'cargoTemperature', value: 'cold', basis: 'An unreadable value.' },
        { req: 'REQ-SYS-099', by: 'PHY-002', attribute: '', value: '', basis: 'No such requirement.' },
      ],
    },
  }
}
export function stress11() {
  const s = stressSources()
  const w10 = readWeek10(stress10().model.text)
  if ('error' in w10) throw new Error(w10.error)
  const first = generateModel(w10.model, s.phys, s.choices, { date: DATE })
  // import the generated file again and generate once more: nothing may be duplicated
  const again = readWeek10(first.text)
  if ('error' in again) throw new Error(again.error)
  return { w10: w10.model, ...s, first, model: generateModel(again.model, s.phys, s.choices, { date: DATE }) }
}
/** The Week 10 collision model (names equal to IDs and to inherited features) with the fixture choices. */
export function collision11() {
  const w10 = readWeek10(collision10().text)
  if ('error' in w10) throw new Error(w10.error)
  return generateModel(w10.model, physOf(FIXTURE_WEEK5_JSON), FIXTURE11_CHOICES, { date: DATE })
}
export const COLLISION11_FILE = 'lectures/week11/labtool_collision_model_v04.sysml'

/** The fixture team's corrected Week 5 export for the Week 11 e2e (the Playwright loader cannot load this module, so the
 *  build script writes it; sysmlWeek11.test.ts checks it is current). Path relative to the app root. */
export const E2E_WEEK5_FILE = 'e2e/fixtures/week11-team07-week5-inputs.json'
export function GENERATED11_FILES(): { file: string; text: string }[] {
  return [
    { file: AEROLINK_W11_MODEL_FILE, text: AEROLINK_W11_MODEL.text },
    { file: FIXTURE11_FILE, text: fixture11().model.text },
    { file: STRESS11_FILE, text: stress11().model.text },
    { file: COLLISION11_FILE, text: collision11().text },
  ]
}
