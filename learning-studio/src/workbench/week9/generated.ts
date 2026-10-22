// The generated Week 9 SysML files (scripts/build-week09-sysml.mjs writes them; sysmlWeek09.test.ts checks they are
// current and that the checker accepted them). Kept apart from requirements.ts so the app bundle never needs the Week 1
// and Week 2 fixtures. Each file is produced exactly as the lab tool produces a team's file: the inputs go through the
// same readers (JSON text and the Week 8 model text) and the same generator.
// Review status: new-pending-review.
import { AEROLINK_W9_MODEL, AEROLINK_W9_MODEL_FILE } from '../../content/lectures/week09/aerolinkCase'
import { teamModelInputs, type TeamRecord } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { week2Fixture } from '../week2/fixture'
import { modelInputs } from '../week2/record'
import { collisionModel, fixtureModel, stressRecord } from '../week8/generated'
import { generateSysml, importFile } from '../week8/skeleton'
import { EMPTY_CHOICE, generateModel, phase1FromWeek1, phase1FromWeek2, readWeek1, readWeek2For9, readWeek8, type Choice, type NeedChoice, type W9Phase1 } from './requirements'

const DATE = '2026-10-21'

/** Phase I source from the Week 1 and Week 2 JSON texts, read exactly as the tool reads a team's files. */
export function phase1Of(week1Json: string, week2Json: string): W9Phase1 {
  const w1 = readWeek1(week1Json)
  const w2 = readWeek2For9(week2Json)
  if ('error' in w1) throw new Error(w1.error)
  if ('error' in w2) throw new Error(w2.error)
  const a = phase1FromWeek1(w1.record)
  const b = phase1FromWeek2(w2.record)
  return { ...a, needs: [...a.needs, ...b.needsAdded], requirements: b.requirements, dispositions: b.dispositions }
}

// ---------------------------------------------------------------------------------------------- the fixture team
export const FIXTURE9_FILE = 'lectures/week09/labtool_team07_model_v02.sysml'
export const FIXTURE_WEEK1_JSON = JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19'))
export const FIXTURE_WEEK2_JSON = JSON.stringify(modelInputs(week2Fixture()))
/** The Riverside team's choices (FICTIONAL): what a team enters in the lab tool for its ten requirements. */
const c = (x: Partial<Choice>): Choice => ({ ...EMPTY_CHOICE, ...x })
export const FIXTURE_CHOICES: Record<string, Choice> = {
  'REQ-STK-001': c({ feature: 'daysWithProduceUntilClosingPercent', quantity: 'percent', op: '>=', value: '90' }),
  'REQ-STK-002': c({ feature: 'maxFoodTemperature', quantity: 'temperature', unit: '°C', op: '<=', value: '5' }),
  'REQ-STK-003': c({ feature: 'shortOrdersWithoutNotice', quantity: 'count', op: '==', value: '0' }),
  'REQ-STK-004': c({ feature: 'freezerAlarmTime', quantity: 'duration', unit: 'min', op: '<=', value: '5' }),
  'REQ-STK-005': c({ feature: 'shiftDurationP95', quantity: 'duration', unit: 'h', op: '<=', value: '2' }),
  'REQ-STK-006': c({ feature: 'quartersWithoutDistrictTable', quantity: 'count', op: '==', value: '0' }),
  'REQ-SYS-001': c({ subject: 'new', newName: 'Temperature monitoring', newPkg: 'Logical', feature: 'sampleInterval', quantity: 'duration', unit: 's', op: '<=', value: '60', form: 'shared' }),
  'REQ-SYS-002': c({ subject: 'new', newName: 'Routing tool', newPkg: 'Logical', feature: 'plannedRouteDuration', quantity: 'duration', unit: 'h', op: '<=', value: '2', form: 'shared', assume: 'The route is planned for one driver on a two-hour shift.' }),
  'REQ-SYS-003': c({ subject: 'def:Delivery vans and volunteer drivers', feature: 'cargoTemperature', quantity: 'temperature', unit: '°C', op: '<=', value: '5' }),
  'REQ-SYS-004': c({ subject: 'new', newName: 'Reporting function', newPkg: 'Logical', feature: 'districtsMissingFromExport', quantity: 'count', op: '==', value: '0' }),
}
export const FIXTURE_NEED_CHOICES: Record<string, NeedChoice> = {}
export function fixture9() {
  const w8 = readWeek8(fixtureModel().model.text)
  if ('error' in w8) throw new Error(w8.error)
  const p1 = phase1Of(FIXTURE_WEEK1_JSON, FIXTURE_WEEK2_JSON)
  return { w8: w8.model, p1, model: generateModel(w8.model, p1, FIXTURE_CHOICES, FIXTURE_NEED_CHOICES, { date: DATE }) }
}

// ---------------------------------------------------------------------------------------------- the adversarial team
export const STRESS9_FILE = 'lectures/week09/labtool_stress_model_v02.sysml'
/** An adversarial but importable set: the Week 8 stress record's model (names with quotes, reserved words, shadowing
 *  names), needs and requirements named like packages and like each other, a need whose stakeholder and concern are not
 *  in the model, a requirement whose parent does not exist, a requirement whose only parent is a capability, a doc-only
 *  requirement, a TBD with no owner, an unbound limit, a negative temperature, quotes and comment terminators in the
 *  statements, and the generated file imported and generated again (idempotence). The generated file must still pass. */
export function stressInputs(): { w1: TeamRecord; w2Json: string; choices: Record<string, Choice> } {
  const t = structuredClone(TEAM_FIXTURE)
  t.needs[0].name = 'Requirements'
  t.needs[1].name = 'Stakeholders'
  t.needs[2].name = 'Produce until closing'
  t.needs[3].sources = 'STK-004, STK-099'
  t.needs[3].concerns = 'CON-004, CON-099'
  t.needs[4].text = 'Warehouse staff need the "network" to warn them */ within minutes \\ at any hour.'
  const r = week2Fixture()
  r.requirements[0].name = 'Needs'
  r.requirements[1].name = r.requirements[2].name
  r.requirements[3].parents = 'NEED-005, NEED-077'
  r.requirements[4].parents = 'CAP-004'
  r.requirements[5].statement = 'The network shall provide the delivered weight per district (TBD-07) to each funder every quarter; "quoted" */ text.'
  return {
    w1: t,
    w2Json: JSON.stringify(modelInputs(r)),
    choices: {
      ...FIXTURE_CHOICES,
      'REQ-STK-006': c({ feature: 'result', quantity: 'count', op: '<=', value: '' }),
      'REQ-SYS-003': c({ subject: 'new', newName: 'Freezer', newPkg: 'Physical', feature: 'minTemperature', quantity: 'temperature', unit: '°C', op: '>=', value: '-18' }),
      'REQ-SYS-004': c({ subject: '' }),
    },
  }
}
export function stress9() {
  const s = stressInputs()
  const r = importFile(JSON.stringify(teamModelInputs(stressRecord(), '2026-10-19')))
  if ('error' in r || r.kind !== 'week1') throw new Error('the Week 8 stress record must import')
  const w8text = generateSysml(r.source, { purpose: 'Stress probe of the Week 9 generator; FICTIONAL.', date: '2026-10-19' }).text
  const w8 = readWeek8(w8text)
  if ('error' in w8) throw new Error(w8.error)
  const p1 = phase1Of(JSON.stringify(teamModelInputs(s.w1, '2026-10-19')), s.w2Json)
  const first = generateModel(w8.model, p1, s.choices, {}, { date: DATE })
  // import the generated file again and generate once more: nothing may be duplicated
  const again = readWeek8(first.text)
  if ('error' in again) throw new Error(again.error)
  return { w8: w8.model, p1, first, model: generateModel(again.model, p1, s.choices, {}, { date: DATE }) }
}
/** The Week 8 collision model (names equal to IDs and to inherited features) with the fixture needs and requirements. */
export function collision9() {
  const w8 = readWeek8(collisionModel().model.text)
  if ('error' in w8) throw new Error(w8.error)
  const p1 = phase1Of(FIXTURE_WEEK1_JSON, FIXTURE_WEEK2_JSON)
  return generateModel(w8.model, p1, FIXTURE_CHOICES, {}, { date: DATE })
}
export const COLLISION9_FILE = 'lectures/week09/labtool_collision_model_v02.sysml'

export function GENERATED9_FILES(): { file: string; text: string }[] {
  return [
    { file: AEROLINK_W9_MODEL_FILE, text: AEROLINK_W9_MODEL.text },
    { file: FIXTURE9_FILE, text: fixture9().model.text },
    { file: STRESS9_FILE, text: stress9().model.text },
    { file: COLLISION9_FILE, text: collision9().text },
  ]
}
