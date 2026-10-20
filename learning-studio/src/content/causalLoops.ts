// Causal-loop structure of the AeroLink teaching model (src/sim/aerolink.ts).
// Polarities are LOCAL (ceteris-paribus) effects read from the model's equations: each link's sign is the sign of the
// partial effect of the cause on the effect with every other input held constant. src/sim/aerolink.test.ts checks EVERY
// link below against the model function that implements it (review W1-R06), including the conditions.
// Three consequences students must not miss:
//   - Adoption = w · R · (1 − R/M) · A. With attractiveness A held constant, the contact effect riders → adoption (+,
//     loop R1) and the saturation path riders → potential riders (−) → adoption (+, loop B4) together give the net
//     effect 1 − 2R/M, which is positive only below half the market (R < 15,000 riders with the default 30,000-rider
//     market). Riders also lower A through waiting (B1), so in the full model the net effect can be negative earlier.
//   - Ordering: utilisation above the target is a GATE (util → orders); the order SIZE grows with demand and falls with
//     the fleet and, under the supply-line policy, with aircraft already on order. The demand → orders link closes
//     further reinforcing loops (e.g. riders → demand → orders → fleet → capacity → utilisation → waiting → churn →
//     riders) that act only while the fleet limits capacity; they are not listed separately.
//   - Capacity = min(fleet capacity, charging capacity). Fleet → capacity is + only while the fleet is the limiting
//     resource (fewer than 15 aircraft with 6 chargers); chargers → capacity is + only while charging limits.
// Links marked with a condition exist only under the stated policy or operating range.
export type LoopLink = { from: string; to: string; polarity: '+' | '−'; delay?: boolean; condition?: string }

export const LOOP_NODES: { id: string; label: string; x: number; y: number }[] = [
  // laid out along the loops: R1/B4 on the left, B1/B2 across the middle, B3/B5–B7 on the right
  { id: 'potential', label: 'Potential riders (market − riders)', x: -240, y: -160 },
  { id: 'adoption', label: 'Word-of-mouth adoption', x: -380, y: 40 },
  { id: 'riders', label: 'Riders', x: -100, y: 40 },
  { id: 'demand', label: 'Trip demand', x: 160, y: 40 },
  { id: 'util', label: 'Utilization', x: 420, y: 40 },
  { id: 'orderRate', label: 'New aircraft orders', x: 640, y: -140 },
  { id: 'orders', label: 'Aircraft on order (supply line)', x: 900, y: 40 },
  { id: 'churn', label: 'Churn', x: -240, y: 260 },
  { id: 'attract', label: 'Service attractiveness', x: 40, y: 260 },
  { id: 'wait', label: 'Waiting time', x: 320, y: 260 },
  { id: 'capacity', label: 'Capacity', x: 580, y: 260 },
  { id: 'fleet', label: 'Fleet', x: 900, y: 260 },
  { id: 'chargers', label: 'Chargers', x: 740, y: 440 },
]

export const LOOP_LINKS: LoopLink[] = [
  { from: 'riders', to: 'adoption', polarity: '+' },
  { from: 'adoption', to: 'riders', polarity: '+' },
  { from: 'riders', to: 'potential', polarity: '−' },
  { from: 'potential', to: 'adoption', polarity: '+' },
  { from: 'riders', to: 'demand', polarity: '+' },
  { from: 'demand', to: 'util', polarity: '+' },
  { from: 'capacity', to: 'util', polarity: '−' },
  { from: 'util', to: 'wait', polarity: '+' },
  { from: 'wait', to: 'attract', polarity: '−' },
  { from: 'attract', to: 'adoption', polarity: '+' },
  { from: 'attract', to: 'churn', polarity: '−' },
  { from: 'churn', to: 'riders', polarity: '−' },
  { from: 'util', to: 'orderRate', polarity: '+', condition: 'a gate: orders are placed only while utilization is above the target; it does not set the order size' },
  { from: 'demand', to: 'orderRate', polarity: '+', condition: 'sets the order size (aircraft demand needs at the target utilization, minus the fleet) while orders are being placed' },
  { from: 'orderRate', to: 'orders', polarity: '+' },
  { from: 'orders', to: 'fleet', polarity: '+', delay: true },
  { from: 'fleet', to: 'orderRate', polarity: '−' },
  { from: 'orders', to: 'orderRate', polarity: '−', condition: 'only when orders count aircraft already on order (supply-line policy)' },
  { from: 'fleet', to: 'capacity', polarity: '+', condition: 'only while the fleet is the limiting resource (fewer than 15 aircraft with 6 chargers)' },
  { from: 'chargers', to: 'capacity', polarity: '+', condition: 'only while charging is the limiting resource' },
  { from: 'fleet', to: 'chargers', polarity: '+', condition: 'only when chargers scale with the fleet' },
]

export type Loop = { id: string; name: string; kind: 'Reinforcing' | 'Balancing'; path: string[]; condition?: string }

/** A loop is reinforcing if it has an even number of negative links, balancing if odd. */
export function loopKind(path: string[], links: LoopLink[] = LOOP_LINKS): 'Reinforcing' | 'Balancing' {
  let negatives = 0
  for (let i = 0; i < path.length; i++) {
    const from = path[i]
    const to = path[(i + 1) % path.length]
    const link = links.find((l) => l.from === from && l.to === to)
    if (!link) throw new Error(`No link ${from} → ${to}`)
    if (link.polarity === '−') negatives++
  }
  return negatives % 2 === 0 ? 'Reinforcing' : 'Balancing'
}

type RawLoop = Omit<Loop, 'kind'>

/** The demand–capacity loops of the milestone-1 diagram (R1, B1–B3). */
const CORE_LOOPS: RawLoop[] = [
  { id: 'R1', name: 'Word of mouth', path: ['riders', 'adoption'] },
  { id: 'B1', name: 'Waiting deters adoption', path: ['riders', 'demand', 'util', 'wait', 'attract', 'adoption'] },
  { id: 'B2', name: 'Waiting drives churn', path: ['riders', 'demand', 'util', 'wait', 'attract', 'churn'] },
  { id: 'B3', name: 'Fleet expansion (with delay)', path: ['util', 'orderRate', 'orders', 'fleet', 'capacity'], condition: 'acts only while the fleet limits capacity' },
]

/** Loops added after the Week 1 review (W1-F05, W1-F06): market saturation, the ordering rule and the policy options. */
const MORE_LOOPS: RawLoop[] = [
  { id: 'B4', name: 'Market saturation', path: ['riders', 'potential', 'adoption'] },
  { id: 'B5', name: 'Deliveries close the fleet gap (with delay)', path: ['orderRate', 'orders', 'fleet'] },
  { id: 'B6', name: 'Supply-line correction', path: ['orderRate', 'orders'], condition: 'policy option: orders count aircraft already on order' },
  { id: 'B7', name: 'Charging expands with the fleet', path: ['util', 'orderRate', 'orders', 'fleet', 'chargers', 'capacity'], condition: 'policy option: chargers scale with the fleet' },
]

const classify = (l: RawLoop): Loop => ({ ...l, kind: loopKind(l.path) })
export const LOOPS: Loop[] = CORE_LOOPS.map(classify)
/** Every loop in the diagram (the core loops plus B4–B7). The diagram and its text equivalent render this list. */
export const ALL_LOOPS: Loop[] = [...CORE_LOOPS, ...MORE_LOOPS].map(classify)
