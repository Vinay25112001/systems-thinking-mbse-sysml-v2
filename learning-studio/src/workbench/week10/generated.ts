// The generated Week 10 SysML files (scripts/build-week10-sysml.mjs writes them; sysmlWeek10.test.ts checks they are
// current and that the checker accepted them). Kept apart from behavior.ts so the app bundle never needs the Week 2,
// Week 4 and Week 9 fixtures. Each file is produced exactly as the lab tool produces a team's file: the inputs go through
// the same readers (the Week 9 model text and the Week 2 and Week 4 JSON texts) and the same generator.
// Review status: new-pending-review.
import { AEROLINK_W10_MODEL, AEROLINK_W10_MODEL_FILE } from '../../content/lectures/week10/aerolinkCase'
import { week2Fixture } from '../week2/fixture'
import { modelInputs as week2Inputs } from '../week2/record'
import { week4Fixture } from '../week4/fixture'
import { modelInputs as week4Inputs } from '../week4/record'
import { collision9, fixture9, stress9 } from '../week9/generated'
import { EMPTY_CHOICES, EMPTY_MACHINE, archFromWeek4, generateModel, opsFromWeek2, readWeek2For10, readWeek4For10, readWeek9, type W10Arch, type W10Choices, type W10Ops } from './behavior'

const DATE = '2026-10-22'

export const FIXTURE_WEEK4_JSON = JSON.stringify(week4Inputs(week4Fixture()))
export const FIXTURE_WEEK2_JSON = JSON.stringify(week2Inputs(week2Fixture()))

/** Architecture and ConOps sources from the Week 4 and Week 2 JSON texts, read exactly as the tool reads a team's files. */
export function sourcesOf(week4Json: string, week2Json: string): { arch: W10Arch; ops: W10Ops } {
  const a = readWeek4For10(week4Json)
  const b = readWeek2For10(week2Json)
  if ('error' in a) throw new Error(a.error)
  if ('error' in b) throw new Error(b.error)
  return { arch: archFromWeek4(a.record), ops: opsFromWeek2(b.record) }
}

// ---------------------------------------------------------------------------------------------- the fixture team
export const FIXTURE10_FILE = 'lectures/week10/labtool_team07_model_v03.sysml'
/** The Riverside team's choices (FICTIONAL): what a team enters in the lab tool. The freezer scenario has a loop (an
 *  alternate that rejoins at its own step) and an ending alternate; the freezer states are exhibited by a logical element. */
export const FIXTURE10_CHOICES: W10Choices = {
  ...EMPTY_CHOICES,
  fn: {
    'FN-001': { inputs: 'INFO-001, INFO-005', outputs: 'Delivery route', performer: '' },
    'FN-002': { inputs: 'INFO-001, Delivery route', outputs: 'Loaded van', performer: '' },
    'FN-003': { inputs: 'Loaded van, Delivery route', outputs: 'INFO-003', performer: '' },
    'FN-005': { inputs: '', outputs: 'INFO-002', performer: '' },
    'FN-006': { inputs: 'INFO-002', outputs: 'INFO-006', performer: '' },
    'FN-007': { inputs: 'Loaded van', outputs: 'INFO-004', performer: '' },
    'FN-008': { inputs: 'Loaded van', outputs: '', performer: '' },
    'FN-009': { inputs: 'INFO-004', outputs: '', performer: '' },
    'FN-011': { inputs: 'INFO-006', outputs: '', performer: '' },
  },
  newFns: [{ id: 'FN-011', name: 'Move stock to the backup freezer', text: 'Move the stock of a failed freezer into the backup freezer and log its temperatures.', performer: 'LOG-004', capability: 'CAP-003' }],
  newItems: [
    { id: 'INFO-006', name: 'Alarm call', kind: 'information' },
    { id: '', name: 'Delivery route', kind: 'information' },
    { id: '', name: 'Loaded van', kind: 'material' },
  ],
  placeholders: { 'Temperature monitoring': 'LOG-004', 'Routing tool': 'LOG-001', 'Reporting function': 'LOG-003' },
  scenario: 'SCN-002',
  steps: {
    '1': { name: 'detectTemperatureRise', fn: 'FN-005' },
    '2': { name: 'sendAlarm', fn: 'FN-006' },
    '3': { name: 'acknowledgeAndTravel', fn: '' },
    '4': { name: 'moveStock', fn: 'FN-011' },
  },
  alts: { A1: { name: 'escalateToManager', guard: 'noAcknowledgementIn15Min' }, A2: { name: 'recordDistrictOutage', guard: 'districtPowerCut' } },
  actors: { 'SCN-002': 'STK-005, EXT-006' },
  machine: {
    ...EMPTY_MACHINE,
    name: 'Freezer states',
    usage: 'freezerStates',
    doc: 'Operating states of the walk-in freezer (SCN-002)',
    exhibitor: 'LOG-004',
    initial: 'cold',
    states: [
      { name: 'cold', entry: '', do: 'FN-005', doc: 'Holding stock below the alarm limit.' },
      { name: 'alarmRaised', entry: 'FN-006', do: '', doc: '' },
      { name: 'stockInBackup', entry: 'FN-011', do: '', doc: 'Stock moved to the backup freezer.' },
      { name: 'quarantine', entry: '', do: '', doc: 'Warm stock labeled and held back from distribution.' },
    ],
    transitions: [
      { from: 'cold', trigger: 'TemperatureAboveLimit', guard: '', to: 'alarmRaised' },
      { from: 'alarmRaised', trigger: 'TemperatureRestored', guard: '', to: 'cold' },
      { from: 'alarmRaised', trigger: 'StaffArrived', guard: 'backupFreezerAvailable', to: 'stockInBackup' },
      { from: 'alarmRaised', trigger: 'StaffArrived', guard: 'not backupFreezerAvailable', to: 'quarantine' },
      { from: 'stockInBackup', trigger: 'FreezerRepaired', guard: '', to: 'cold' },
      { from: 'quarantine', trigger: 'FreezerRepaired', guard: '', to: 'cold' },
    ],
  },
}
export function fixture10() {
  const w9 = readWeek9(fixture9().model.text)
  if ('error' in w9) throw new Error(w9.error)
  const { arch, ops } = sourcesOf(FIXTURE_WEEK4_JSON, FIXTURE_WEEK2_JSON)
  return { w9: w9.model, arch, ops, model: generateModel(w9.model, arch, ops, FIXTURE10_CHOICES, { date: DATE }) }
}

// ---------------------------------------------------------------------------------------------- the adversarial team
export const STRESS10_FILE = 'lectures/week10/labtool_stress_model_v03.sysml'
/** An adversarial but importable set: the Week 9 stress model (names with quotes, reserved words and package names),
 *  functions and items named like packages, keywords and each other, a function whose performer, capability and
 *  allocated requirement do not exist, an item ID that does not exist, a scenario named like a package with steps whose
 *  text is a keyword, guards that are keywords or unreadable, a rejoin step the scenario lacks, states named with
 *  keywords and spaces, a transition to a missing state, an unreachable state, an exhibitor that does not exist, quotes
 *  and comment terminators in the texts; and the generated file imported and generated again (idempotence). The file
 *  must still pass the checker. */
export function stressSources(): { arch: W10Arch; ops: W10Ops; choices: W10Choices } {
  const { arch, ops } = sourcesOf(FIXTURE_WEEK4_JSON, FIXTURE_WEEK2_JSON)
  const a = structuredClone(arch)
  a.functions[0].name = 'Logical'
  a.functions[1].name = a.functions[2].name
  a.functions[2].log = 'LOG-099'
  a.functions[3].capabilities = ['CAP-099']
  a.functions[3].requirements = ['REQ-SYS-099', 'REQ-SYS-001']
  a.functions[4].name = 'state'
  a.logical[0].name = 'Behavior'
  a.logical[1].name = 'Route planning */ "quoted"'
  a.information[0].name = 'action'
  a.information[1].name = a.information[2].name
  const o = structuredClone(ops)
  o.scenarios[1].name = 'Requirements'
  o.scenarios[1].steps[0].text = 'then'
  o.scenarios[1].steps[1].text = 'Sends the "alarm" */ to staff \\ now.'
  o.scenarios[1].alternates.push({ id: 'A3', fromStep: 2, condition: 'if', response: 'decide', outcome: { rejoin: 9 } })
  o.capabilities[0].name = 'Logical'
  return {
    arch: a,
    ops: o,
    choices: {
      ...FIXTURE10_CHOICES,
      fn: { ...FIXTURE10_CHOICES.fn, 'FN-002': { inputs: 'INFO-077, INFO-001', outputs: 'Loaded van', performer: '' } },
      steps: { ...FIXTURE10_CHOICES.steps, '1': { name: 'merge', fn: 'FN-005' }, '2': { name: 'merge', fn: 'FN-099' } },
      alts: { A1: { name: 'done', guard: 'start' }, A2: { name: '', guard: 'x > 3' } },
      actors: {},
      machine: {
        ...FIXTURE10_CHOICES.machine,
        name: 'state def',
        exhibitor: 'Nowhere',
        states: [...FIXTURE10_CHOICES.machine.states, { name: 'transition', entry: 'FN-099', do: '', doc: 'An unreachable state */ with a terminator.' }, { name: 'cold', entry: '', do: '', doc: '' }],
        transitions: [...FIXTURE10_CHOICES.machine.transitions, { from: 'cold', trigger: 'accept', guard: 'if', to: 'missing' }, { from: 'cold', trigger: '', guard: '', to: 'quarantine' }],
      },
    },
  }
}
export function stress10() {
  const s = stressSources()
  const w9 = readWeek9(stress9().model.text)
  if ('error' in w9) throw new Error(w9.error)
  const first = generateModel(w9.model, s.arch, s.ops, s.choices, { date: DATE })
  // import the generated file again and generate once more: nothing may be duplicated
  const again = readWeek9(first.text)
  if ('error' in again) throw new Error(again.error)
  return { w9: w9.model, ...s, first, model: generateModel(again.model, s.arch, s.ops, s.choices, { date: DATE }) }
}
/** The Week 9 collision model (names equal to IDs and to inherited features) with the fixture choices. */
export function collision10() {
  const w9 = readWeek9(collision9().text)
  if ('error' in w9) throw new Error(w9.error)
  const { arch, ops } = sourcesOf(FIXTURE_WEEK4_JSON, FIXTURE_WEEK2_JSON)
  return generateModel(w9.model, arch, ops, FIXTURE10_CHOICES, { date: DATE })
}
export const COLLISION10_FILE = 'lectures/week10/labtool_collision_model_v03.sysml'

export function GENERATED10_FILES(): { file: string; text: string }[] {
  return [
    { file: AEROLINK_W10_MODEL_FILE, text: AEROLINK_W10_MODEL.text },
    { file: FIXTURE10_FILE, text: fixture10().model.text },
    { file: STRESS10_FILE, text: stress10().model.text },
    { file: COLLISION10_FILE, text: collision10().text },
  ]
}
