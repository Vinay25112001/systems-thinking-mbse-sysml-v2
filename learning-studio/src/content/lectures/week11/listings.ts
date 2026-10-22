// Week 11 SysML v2 listings: every listing a slide or the lesson shows is an excerpt of a file under sysml/ that the
// course-designated checker has validated (sysml/lectures/week11/week11-report.json). sysmlWeek11.test.ts checks that
// each listing below is an ordered, verbatim excerpt of its file (a long documentation comment may be shortened with
// "…") and that the status stated here is the status the checker recorded for the whole file. Listings are drawn as
// figures (src/components/figures/LectureWeek11Code.tsx), so the same text reaches the slide viewer, the reader and the
// .pptx; the figure's alt text carries the listing text.
//
// A checker PASS means the file parsed, every name resolved and no validation rule fired. It never shows that two
// connected ports match, that a flow runs the right way or that a satisfy claim is true (see the driving question, the
// warm-up and the predict listings).
// Review status: new-pending-review.
import { sysmlSource } from '../../../lib/sysml'
import { AEROLINK_W11_MODEL_FILE, FIRST_NEW_INFO } from './aerolinkCase'

export type Mark = { line: number; label: string }
export type Listing = {
  id: string
  /** The validated file the excerpt comes from (path under sysml/). */
  file: string
  /** The status the checker recorded for the whole file. */
  status: 'PASS' | 'PASS with warnings' | 'FAIL'
  /** What the checker said, as recorded (predict items and the calibration table). */
  recorded?: string
  lines: string[]
  /** Callouts drawn beside a line (1-based line of `lines`). */
  marks?: Mark[]
  /** The credit line drawn under the listing, exactly as students read it. */
  credit?: string
}

const src = (file: string): string => {
  const t = sysmlSource(file)
  if (t === undefined) throw new Error(`listing source missing: sysml/${file}`)
  return t.replace(/\r/g, '')
}
// A documentation line shortened to about `max` characters, keeping its first words and closing with "… */".
function shortDoc(line: string, max: number): string {
  if (!max || line.length <= max || !line.includes('doc /*') || !line.includes('*/')) return line
  const head = line.slice(0, line.indexOf('doc /*') + 7)
  const body = line.slice(head.length, line.lastIndexOf('*/')).trim()
  const tail = line.slice(line.lastIndexOf('*/') + 2)
  const room = Math.max(12, max - head.length - 6 - tail.length)
  let cut = body.slice(0, room)
  if (cut.length < body.length) cut = cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)
  return `${head}${cut} … */${tail}`
}
/** Removes the common leading tabs, widens tabs to four spaces and shortens long documentation lines. */
function tidy(block: string, maxDoc: number): string[] {
  const lines = block.split('\n')
  const lead = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\t*/)![0].length))
  return lines.map((l) => shortDoc(l.slice(lead).replace(/\t/g, '    '), maxDoc))
}
/** The block that starts on the line containing `start` and ends at its matching closing brace (or its semicolon). */
function block(file: string, start: string): string {
  const t = src(file)
  const at = t.indexOf(start)
  if (at < 0) throw new Error(`no "${start}" in ${file}`)
  const s = t.lastIndexOf('\n', at) + 1
  const brace = t.indexOf('{', at)
  const semi = t.indexOf(';', at)
  if (brace < 0 || (semi >= 0 && semi < brace)) return t.slice(s, semi + 1)
  let depth = 0
  for (let i = brace; i < t.length; i++) {
    if (t[i] === '{') depth++
    else if (t[i] === '}' && --depth === 0) return t.slice(s, i + 1)
  }
  throw new Error(`unbalanced block at "${start}" in ${file}`)
}
const blocks = (file: string, starts: string[], maxDoc = 76) => starts.flatMap((s, i) => [...(i ? [''] : []), ...tidy(block(file, s), maxDoc)])
/** The lines from the first line containing `from` (searching after `after`, if given) to the first later line containing
 *  `to`, inclusive. */
function range(file: string, from: string, to: string, maxDoc = 76, after?: string): string[] {
  const ls = src(file).split('\n')
  const base = after ? ls.findIndex((l) => l.includes(after)) : 0
  const a = ls.findIndex((l, i) => i >= base && l.includes(from))
  const b = ls.findIndex((l, i) => i > a && l.includes(to))
  if (a < 0 || b < 0) throw new Error(`no range "${from}" … "${to}" in ${file}`)
  return tidy(ls.slice(a, b + 1).join('\n'), maxDoc)
}
/** Single lines, each the first line (after the previous pick) that contains the given text. */
function pick(file: string, texts: string[], maxDoc = 76): string[] {
  const ls = src(file).split('\n')
  let at = 0
  const out: string[] = []
  for (const t of texts) {
    const i = ls.findIndex((l, k) => k >= at && l.includes(t))
    if (i < 0) throw new Error(`no line "${t}" in ${file}`)
    out.push(ls[i])
    at = i + 1
  }
  return tidy(out.join('\n'), maxDoc)
}
const drop = (lines: string[], re: RegExp) => lines.filter((l) => !re.test(l))
const W11 = (f: string) => `lectures/week11/${f}`
const AERO = AEROLINK_W11_MODEL_FILE
const NEXT = (k: number) => `INFO-${String(Number(FIRST_NEW_INFO.slice(5)) + k).padStart(3, '0')}`

export const LISTINGS: Record<string, () => Listing> = {
  // ---------------------------------------------------------------- Session 1
  'two-ports': () => ({
    id: 'two-ports',
    file: W11('driving_question_two_ports.sysml'),
    status: 'PASS',
    lines: range(W11('driving_question_two_ports.sysml'), 'port def OxygenPort {', 'interface line : OxygenLine connect', 76, 'package OxygenSupplyTwoPorts'),
  }),
  'two-ports-card': () => ({
    id: 'two-ports-card',
    file: W11('driving_question_two_ports.sysml'),
    status: 'PASS',
    lines: pick(W11('driving_question_two_ports.sysml'), ['port def OxygenPort {', 'out item oxygen : Oxygen;', '}', 'interface def OxygenLine {', 'end port supply : OxygenPort;', 'end port outlet : OxygenPort;', 'flow supply.oxygen to outlet.oxygen;', '}', 'port toWard : OxygenPort;', 'port fromManifold : OxygenPort;', 'interface line : OxygenLine connect']).map((l) => l.replace(/^ {4}(port to|port from)/, '$1')),
  }),
  'two-ports-conjugated': () => ({
    id: 'two-ports-conjugated',
    file: W11('driving_question_two_ports.sysml'),
    status: 'PASS',
    lines: range(W11('driving_question_two_ports.sysml'), 'interface def OxygenLine {', 'port fromManifold : ~OxygenPort;', 76, 'package OxygenSupplyConjugated'),
    marks: [
      { line: 3, label: 'end B: the conjugate' },
      { line: 10, label: 'the outlet’s port: ~OxygenPort' },
    ],
  }),
  'physical-parts': () => ({
    id: 'physical-parts',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["part def 'eVTOL Aircraft' :> 'Aircraft'", "part def 'Airframe and rotors'"], 70), '', ...pick(AERO, ['part physicalArchitecture {', "part <'PHY-001'> eVTOLAircraft : 'eVTOL Aircraft' {", "part <'CMP-001'> airframeAndRotors", "part <'CMP-002'> batteryPackAndBatteryManagement", "part <'CMP-003'> flightManagementAndHealthMonitoring"]), '        …', '    }', '    …'],
    marks: [
      { line: 1, label: 'specializes the Week 9 placeholder' },
      { line: 2, label: 'a Week 5 component: a part definition' },
      { line: 5, label: 'the element: PHY ID on the usage' },
      { line: 6, label: 'components nested in their parent' },
    ],
  }),
  'perform-physical': () => ({
    id: 'perform-physical',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["part <'PHY-003'> chargingSystems : 'Charging Systems' {"]), '    …', ...pick(AERO, ["perform Logical::'FN-006';", "perform Logical::'FN-007';"], 76).map((l) => `    ${l}`), '}'],
    marks: [{ line: 3, label: 'perform: this part is the performer' }],
  }),
  'allocate-l2p': () => ({
    id: 'allocate-l2p',
    file: AERO,
    status: 'PASS',
    lines: [...range(AERO, 'allocate Logical::logicalArchitecture.flightOperations to physicalArchitecture.operationsCenter {', '}'), ...range(AERO, 'allocate Logical::logicalArchitecture.flightOperations to physicalArchitecture.eVTOLAircraft {', '}')],
    marks: [
      { line: 1, label: 'logical part → physical part' },
      { line: 2, label: 'nested: function → function' },
      { line: 5, label: 'the same element, a second home' },
    ],
  }),
  'port-def': () => ({
    id: 'port-def',
    file: AERO,
    status: 'PASS',
    lines: tidy(block(AERO, "port def 'Aircraft to charger power and handshake port' {"), 76),
    marks: [
      { line: 3, label: 'in: energy into the aircraft' },
      { line: 4, label: `out: ${NEXT(0)}, a new item` },
    ],
  }),
  'worked-ports': () => ({
    id: 'worked-ports',
    file: AERO,
    status: 'PASS',
    lines: [
      ...pick(AERO, ["part <'PHY-001'> eVTOLAircraft : 'eVTOL Aircraft' {", "port toChargingSystems : 'Aircraft to charger power and handshake port';"]),
      '    …',
      '}',
      ...pick(AERO, ["part <'PHY-003'> chargingSystems : 'Charging Systems' {", "port toEVTOLAircraft : ~'Aircraft to charger power and handshake port';"]),
      '    …',
      '}',
    ],
    marks: [
      { line: 2, label: 'end A: the port definition' },
      { line: 6, label: 'end B: its conjugate' },
    ],
  }),
  externals: () => ({
    id: 'externals',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["part <'EXT-007'> weatherInformationService : 'Weather information service';"]), '', ...tidy(block(AERO, 'ref part weatherInformationService :> Context::context.weatherInformationService {'), 76)],
    marks: [
      { line: 1, label: 'added to the context (Week 4 external)' },
      { line: 3, label: 'ref part: the context’s external' },
    ],
  }),
  'predict-undirected': () => ({
    id: 'predict-undirected',
    file: W11('invalid_port_undirected_item.sysml'),
    status: 'FAIL',
    recorded: 'FAIL: line 5, “Owned usages of a port definition (other than ports) must be referential.”',
    lines: range(W11('invalid_port_undirected_item.sysml'), 'item def Oxygen;', 'port toWard : OxygenPort;'),
  }),
  // ---------------------------------------------------------------- Session 2
  warmup: () => ({
    id: 'warmup',
    file: W11('warmup_three_drafts.sysml'),
    status: 'PASS',
    lines: [
      ...pick(W11('warmup_three_drafts.sysml'), ['package DraftOneFlow', 'flow pumpSide.coolant to engineSide.coolant;']),
      '',
      ...pick(W11('warmup_three_drafts.sysml'), ['package DraftTwoReversed', 'flow engineSide.coolant to pumpSide.coolant;']),
      '',
      ...pick(W11('warmup_three_drafts.sysml'), ['package DraftThreeBinding', 'bind pump.coolantOut = engineBlock.coolantIn;']),
    ],
  }),
  'interface-def': () => ({
    id: 'interface-def',
    file: AERO,
    status: 'PASS',
    lines: drop(tidy(block(AERO, "interface def 'Aircraft to charger power and handshake' {"), 70), /^\s*doc \/\*/),
    marks: [
      { line: 2, label: 'end A: the port definition' },
      { line: 3, label: 'end B: its conjugate' },
      { line: 4, label: 'a flow per crossing, out → in' },
    ],
  }),
  'interface-usage': () => ({
    id: 'interface-usage',
    file: AERO,
    status: 'PASS',
    lines: [
      ...pick(AERO, ["interface <'IF-003'> operationsCenterToAirTrafficService", "connection <'IF-004'> operationsToMaintenanceWorkOrderHandover"], 64),
      '    …',
      '}',
      ...pick(AERO, ["interface <'IF-005'> aircraftToChargerPowerAndHandshake"], 64),
    ],
    marks: [
      { line: 1, label: 'information interface: two ports' },
      { line: 2, label: 'organizational: a connection, no ports' },
      { line: 5, label: 'IF ID on the usage' },
    ],
  }),
  binding: () => ({
    id: 'binding',
    file: W11('binding_delegation.sysml'),
    status: 'PASS',
    lines: blocks(W11('binding_delegation.sysml'), ['part def Regulator {', 'part def Manifold {']),
    marks: [{ line: 8, label: 'bind: equal values, nothing moves' }],
  }),
  'interface-requirement': () => ({
    id: 'interface-requirement',
    file: W11('interface_requirement_added.sysml'),
    status: 'PASS',
    lines: range(W11('interface_requirement_added.sysml'), "requirement <'REQ-SYS-121'>", "allocate 'REQ-SYS-121' to 'FN-031';", 70),
    marks: [
      { line: 3, label: 'subject: the interface definition' },
      { line: 5, label: 'allocate to the interface usage' },
      { line: 6, label: 'and to the function' },
    ],
  }),
  'req-allocation': () => ({
    id: 'req-allocation',
    file: AERO,
    status: 'PASS',
    lines: range(AERO, "allocate Requirements::'REQ-SYS-013' to physicalArchitecture", "allocate Requirements::'REQ-SYS-015' to Logical::'FN-016';"),
    marks: [
      { line: 1, label: 'to the interface (IF-003)' },
      { line: 2, label: 'to the function Week 10 named' },
    ],
  }),
  satisfy: () => ({
    id: 'satisfy',
    file: AERO,
    status: 'PASS',
    lines: [...pick(AERO, ["part <'PHY-003'> chargingSystems : 'Charging Systems' {", 'attribute :>> chargeTimeToDispatch ='], 70), '    …', '}', '', ...pick(AERO, ["satisfy Requirements::'REQ-SYS-001' by physicalArchitecture.chargingSystems"], 72)],
    marks: [
      { line: 2, label: 'the design value (current estimate)' },
      { line: 6, label: 'satisfy: the claim, with its basis' },
    ],
  }),
  'predict-satisfy': () => ({
    id: 'predict-satisfy',
    file: W11('predict_satisfy_wrong_subject.sysml'),
    status: 'PASS with warnings',
    recorded: 'PASS with one warning: line 23, “Bound features should have conforming types”',
    lines: pick(W11('predict_satisfy_wrong_subject.sysml'), ["requirement def <'REQ-SYS-101'> DeliveryPressure {", 'subject compressor : Compressor;', 'require constraint { compressor.deliveryPressureBar >= 7.0 }', '}', 'part workshopAir {', 'part compressor : Compressor {', 'part tank : StorageTank;', '}', 'requirement deliveryPressure : DeliveryPressure;', 'satisfy deliveryPressure by workshopAir.tank;']),
  }),
}

export const listing = (id: string): Listing => {
  const f = LISTINGS[id]
  if (!f) throw new Error(`unknown listing ${id}`)
  return f()
}
/** The listing as one line of text (for alt text): lines joined with " / ". */
export const listingText = (id: string) =>
  listing(id)
    .lines.map((l) => l.trim())
    .filter(Boolean)
    .join(' / ')

/** The calibration table (what the checker rejects and what it accepts silently, or with only a warning), each row a
 *  checked file and the diagnostic the checker recorded for it (week11-report.json; sysmlWeek11.test.ts checks every
 *  row). Each label names what the error is about, not a broader rule it does not test. */
export const CALIBRATION: { file: string; label: string; what: string; result: 'FAIL' | 'PASS' | 'PASS with warnings'; recorded: string; session: 1 | 2 }[] = [
  { file: W11('invalid_port_undirected_item.sysml'), label: 'composite port item', what: 'A port definition with an item that has no direction and no ref (so it is composite)', result: 'FAIL', recorded: 'Owned usages of a port definition (other than ports) must be referential.', session: 1 },
  { file: W11('invalid_interface_part_ends.sysml'), label: 'part ends on interface', what: 'An interface definition whose two ends are parts, not ports', result: 'FAIL', recorded: 'An interface definition end must be a port.', session: 1 },
  { file: W11('invalid_interface_connects_parts.sysml'), label: 'interface joins parts', what: 'An interface usage that connects two parts instead of their ports', result: 'FAIL', recorded: 'A port must be typed by port definitions.', session: 1 },
  { file: W11('invalid_qualified_not_dot.sysml'), label: ':: instead of dots', what: 'A connection that names nested ports with :: instead of dot notation', result: 'FAIL', recorded: 'Must be an accessible feature (use dot notation for nesting)', session: 1 },
  { file: W11('invalid_conjugate_unqualified.sysml'), label: "unqualified '~P' name", what: "The conjugate’s actual name, '~Oxygen port', used unqualified although it is declared inside 'Oxygen port'", result: 'FAIL', recorded: "Couldn't resolve reference to Type ''~Oxygen port''.", session: 1 },
  { file: W11('driving_question_two_ports.sysml'), label: 'same port type twice', what: 'Two ports of the same definition connected, so both offer the item and neither takes it', result: 'PASS', recorded: 'no message', session: 1 },
  { file: W11('predict_flow_wrong_direction.sysml'), label: 'flow against ports', what: 'A flow from an in item to an out item, against both ports’ directions', result: 'PASS', recorded: 'no message', session: 1 },
  { file: W11('warmup_three_drafts.sysml'), label: 'binding for a transfer', what: 'A binding between an out item and an in item where the item should move (and a reversed flow)', result: 'PASS', recorded: 'no message', session: 2 },
  { file: W11('predict_conjugate_end_unprotected.sysml'), label: '~ end, plain port', what: 'An interface definition whose second end is the conjugate, connecting a port typed by the plain port definition', result: 'PASS', recorded: 'no message', session: 2 },
  { file: W11('predict_satisfy_wrong_subject.sysml'), label: 'satisfy, wrong part', what: 'A satisfy claim whose satisfying part is not of the requirement’s subject type', result: 'PASS with warnings', recorded: 'Bound features should have conforming types', session: 2 },
]

/** The correct companion of the unqualified-name row: the conjugate typed by its qualified actual name and by the
 *  shorthand, both accepted with no message (week11-report.json; sysmlWeek11.test.ts checks it). */
export const CONJUGATE_NAME_PASS = {
  file: W11('conjugate_qualified_name.sysml'),
  qualified: "port fromManifold : 'Oxygen port'::'~Oxygen port';",
  shorthand: "port fromManifold : ~'Oxygen port';",
  result: 'PASS' as const,
  recorded: 'no message',
}
