// AeroLink service dynamics: an instructor-authored teaching model (Week 1, advanced analysis).
// Structure follows the feedback concepts and archetypes in SEBoK (R03 p.270: negative/positive feedback;
// R05 p.283: Limits to Growth, Balancing Process with Delay). ALL PARAMETER VALUES ARE FICTIONAL.
// This is not a forecast of any real operation.
//
// Final parameter set (Week 1 review fixes, 2026-10-09; DEFAULT_PARAMS below, unchanged from milestone 1 apart
// from the new `countSupplyLine` policy switch, which defaults to off):
//   market 30,000 riders; 300 initial riders; word of mouth 0.3/month; churn 0.15/month at worst service;
//   3 trips per rider per month; 12 aircraft x 20 trips/day; 6 turnaround chargers x 20 min/charge, 16 h/day;
//   30 days/month; order when utilisation > 0.7; 6-month procurement delay; 15-min wait tolerance.
// The 6 chargers are the effective turnaround-charging pool of the Data Sheet network (instructor assumption A-002 in
// src/model/reference/week02.ts: of 6 vertiports x 2 chargers, the 3 hub vertiports carry turnaround charging).
//
// Behaviour the course claims about this model is asserted in aerolink.test.ts, each with a counterfactual run that
// would make the assertion fail if the claimed mechanism were absent.

export type SimParams = {
  months: number
  marketSize: number // potential regular riders
  initialRiders: number
  wordOfMouth: number // per month, reinforcing adoption rate
  churnRate: number // per month at worst service
  tripsPerRiderPerMonth: number
  initialFleet: number
  tripsPerAircraftPerDay: number
  chargers: number
  chargeMinutesPerTrip: number
  operatingHoursPerDay: number
  expandFleet: boolean // management adds aircraft when utilisation is high
  targetUtilisation: number // 0..1
  procurementDelayMonths: number
  investInCharging: boolean // add chargers in proportion to fleet growth
  /** Ordering policy option: new orders are reduced by aircraft already on order (the supply line). */
  countSupplyLine: boolean
  waitToleranceMin: number // wait at which attractiveness halves
}

export const DEFAULT_PARAMS: SimParams = {
  months: 60,
  marketSize: 30000,
  initialRiders: 300,
  wordOfMouth: 0.3,
  churnRate: 0.15,
  tripsPerRiderPerMonth: 3,
  initialFleet: 12,
  tripsPerAircraftPerDay: 20,
  chargers: 6,
  chargeMinutesPerTrip: 20,
  operatingHoursPerDay: 16,
  expandFleet: true,
  targetUtilisation: 0.7,
  procurementDelayMonths: 6,
  investInCharging: false,
  countSupplyLine: false,
  waitToleranceMin: 15,
}

/**
 * Operating regime in a month.
 * - 'demand': the average wait is within riders' tolerance (15 min) and every trip demanded is served. The boundary is
 *   a convention set at riders' tolerance, not the point where capacity stops mattering: at the tolerance
 *   attractiveness is still only 0.5, so up to utilisation of about 0.87 waiting still drives material churn and more
 *   capacity would still raise ridership (review W1-R05). Far below it (at launch, utilisation 0.125) extra capacity
 *   adds almost nothing.
 * - 'fleet' / 'charging': waits exceed tolerance, so churn is holding ridership down; the named resource is the one
 *   that sets capacity (the binding constraint). Relieving the other resource adds nothing.
 */
export type Regime = 'demand' | 'fleet' | 'charging'

export type SimPoint = {
  month: number
  riders: number
  demand: number // trips requested
  served: number
  fleet: number
  chargers: number
  /** Aircraft ordered but not yet delivered (the supply line). */
  onOrder: number
  fleetCapacity: number
  chargingCapacity: number
  capacity: number
  /** The resource that sets capacity this month (always defined, even when demand is well below capacity). */
  limitingResource: 'fleet' | 'charging'
  /** Binding constraint on ridership (see Regime). */
  bottleneck: Regime
  utilisation: number
  fleetUtilisation: number
  chargingUtilisation: number
  waitMin: number
  attractiveness: number
  /** Aircraft that add no usable capacity: fleet minus the aircraft the operator's own rule says current demand
   *  needs (at the target utilisation), and never more than the charging pool can turn around. */
  excessAircraft: number
  /** Aircraft owned or on order beyond that need: capital already committed to capacity that demand does not use. */
  committedExcess: number
  /** Aircraft ordered at the end of this month; they are delivered `procurementDelayMonths + 1` months later. */
  ordered: number
}

export const DAYS = 30
export const BASE_WAIT_MIN = 2

export function fleetCapacityOf(p: SimParams, fleet: number): number {
  return fleet * p.tripsPerAircraftPerDay * DAYS
}

export function chargingCapacityOf(p: SimParams, chargers: number): number {
  return chargers * ((p.operatingHoursPerDay * 60) / p.chargeMinutesPerTrip) * DAYS
}

/** Queue-like waiting time: 2 min at zero load, rising sharply as utilisation approaches 1 (capped for display). */
export function waitAt(utilisation: number): number {
  return Math.min(240, BASE_WAIT_MIN / Math.max(0.03, 1 - Math.min(utilisation, 0.97)) + Math.max(0, utilisation - 1) * 120)
}

// The model's equations, one function per causal link group, so that src/sim/aerolink.test.ts can check every
// causal-loop polarity in src/content/causalLoops.ts against the equation that implements it (review W1-R06).

/** Trips requested per month. */
export function tripDemand(p: SimParams, riders: number): number {
  return riders * p.tripsPerRiderPerMonth
}

/** Remaining potential riders: the part of the market not yet riding. */
export function potentialRiders(p: SimParams, riders: number): number {
  return p.marketSize - riders
}

/** Word-of-mouth adoption from its three factors: contacts (riders) x remaining potential share x attractiveness. */
export function adoptionFrom(p: SimParams, riders: number, potential: number, attractiveness: number): number {
  return p.wordOfMouth * riders * (potential / p.marketSize) * attractiveness
}

/**
 * Word-of-mouth adoption per month: contacts (riders) x remaining potential (1 - riders/market) x attractiveness.
 * Holding the other factors constant, riders -> adoption is + (R1) and potential -> adoption is + (B4). With
 * attractiveness held constant, the NET effect of one more rider on adoption, d/dR [R (1 - R/M)] = 1 - 2R/M, is
 * positive only below half the market (R < M/2). Riders also act on attractiveness through waiting (B1), so in the
 * full model the net effect can be negative well below half the market when capacity is tight (review W1-R03).
 */
export function adoptionRate(p: SimParams, riders: number, attractiveness: number): number {
  return adoptionFrom(p, riders, potentialRiders(p, riders), attractiveness)
}

/** Riders lost per month: proportional to riders and to the unattractiveness of the service (loop B2). */
export function churnOf(p: SimParams, riders: number, attractiveness: number): number {
  return p.churnRate * riders * (1 - attractiveness)
}

/** Riders next month (the stock): plus adoption, minus churn, bounded by 0 and the market. */
export function nextRiders(p: SimParams, riders: number, adoption: number, churn: number): number {
  return Math.max(0, Math.min(p.marketSize, riders + adoption - churn))
}

/** Capacity in trips per month: every trip needs an aircraft and a charge, so the smaller capacity binds. */
export function capacityOf(p: SimParams, fleet: number, chargers: number): number {
  return Math.min(fleetCapacityOf(p, fleet), chargingCapacityOf(p, chargers))
}

export function utilisationOf(demand: number, capacity: number): number {
  return capacity > 0 ? demand / capacity : 1
}

/**
 * Management's ordering rule. Utilisation above the target is a GATE (no order otherwise); the order SIZE is the
 * number of aircraft current demand needs at the target utilisation, minus the fleet, minus (only with
 * `countSupplyLine`) the aircraft already on order. Orders are sized on aircraft only: charging is ignored. Ignoring
 * the supply line is a common decision error that, combined with the delay, produces over-build.
 */
export function orderSize(p: SimParams, demand: number, utilisation: number, fleet: number, onOrder: number): number {
  if (!p.expandFleet || utilisation <= p.targetUtilisation) return 0
  const needed = demand / (p.tripsPerAircraftPerDay * DAYS * p.targetUtilisation)
  const inPipeline = p.countSupplyLine ? onOrder : 0
  return Math.ceil(Math.max(0, needed - fleet - inPipeline))
}

/** Chargers after a delivery: with `investInCharging` they keep the launch ratio to the fleet (never fewer). */
export function chargersFor(p: SimParams, fleet: number, chargers: number): number {
  return p.investInCharging ? Math.max(chargers, Math.round(fleet * (p.chargers / p.initialFleet))) : chargers
}

/** Attractiveness of the service to riders: 1 at zero wait, 0.5 when the wait equals riders' tolerance. */
export function attractivenessAt(waitMin: number, waitToleranceMin: number): number {
  return 1 / (1 + (waitMin / waitToleranceMin) ** 2)
}

export function simulate(p: SimParams): SimPoint[] {
  let riders = p.initialRiders
  let fleet = p.initialFleet
  let chargers = p.chargers
  const aircraftTripsPerMonth = p.tripsPerAircraftPerDay * DAYS
  const pipeline: number[] = Array(Math.max(0, Math.round(p.procurementDelayMonths)) + 1).fill(0)
  const out: SimPoint[] = []

  for (let month = 0; month <= p.months; month++) {
    // deliveries arrive (the fleet-expansion balancing loop acts only after the procurement delay)
    const delivered = pipeline.shift() ?? 0
    pipeline.push(0)
    if (delivered > 0) {
      fleet += delivered
      chargers = chargersFor(p, fleet, chargers)
    }

    const demand = tripDemand(p, riders)
    const fleetCap = fleetCapacityOf(p, fleet)
    const chargeCap = chargingCapacityOf(p, chargers)
    const capacity = capacityOf(p, fleet, chargers)
    const limitingResource = chargeCap < fleetCap ? 'charging' : 'fleet'
    const utilisation = utilisationOf(demand, capacity)
    const served = Math.min(demand, capacity)
    const waitMin = waitAt(utilisation)
    const attractiveness = attractivenessAt(waitMin, p.waitToleranceMin)
    const bottleneck: Regime = waitMin > p.waitToleranceMin ? limitingResource : 'demand'
    const neededAtTarget = demand / (aircraftTripsPerMonth * p.targetUtilisation)
    const chargingFleetEquivalent = chargeCap / aircraftTripsPerMonth
    const usefulFleet = Math.min(neededAtTarget, chargingFleetEquivalent)
    const excessAircraft = Math.max(0, fleet - usefulFleet)
    const onOrder = pipeline.reduce((a, b) => a + b, 0)
    const committedExcess = Math.max(0, fleet + onOrder - usefulFleet)
    // management policy (orderSize): ordering is gated on utilisation and sized on demand, fleet and (optionally) the supply line
    const ordered = orderSize(p, demand, utilisation, fleet, onOrder)

    out.push({
      month, riders, demand, served, fleet, chargers, onOrder,
      fleetCapacity: fleetCap, chargingCapacity: chargeCap, capacity, limitingResource, bottleneck,
      utilisation, fleetUtilisation: fleetCap > 0 ? served / fleetCap : 1, chargingUtilisation: chargeCap > 0 ? served / chargeCap : 1,
      waitMin, attractiveness, excessAircraft, committedExcess, ordered,
    })

    // reinforcing loop R1: riders recruit riders (word of mouth), scaled by service attractiveness;
    // balancing loop B4: the remaining potential market (1 - riders/market) shrinks as riders grow
    const adoption = adoptionRate(p, riders, attractiveness)
    // balancing loop B2: poor service drives churn
    const churn = churnOf(p, riders, attractiveness)
    riders = nextRiders(p, riders, adoption, churn)

    pipeline[pipeline.length - 1] += ordered
  }
  return out
}

/** Aircraft-months of excess capacity over a run (sum of `excessAircraft`): the idle cost of over-building aircraft.
 *  It counts AIRCRAFT only and puts no value on chargers; see `chargerMonths` (review W1-R02). */
export function excessAircraftMonths(run: SimPoint[]): number {
  return run.reduce((a, p) => a + p.excessAircraft, 0)
}

/** Charger-months over a run (chargers in service, summed over the months): the charging investment that
 *  `excessAircraftMonths` does not count. The model prices neither, so comparing the two needs a relative cost. */
export function chargerMonths(run: SimPoint[]): number {
  return run.reduce((a, p) => a + p.chargers, 0)
}

/** `setup` states the policies only (shown before students commit to an archetype); `description` states the behaviour
 *  and is revealed with the archetype label. Every behavioural statement in `description` is asserted in aerolink.test.ts. */
export type Scenario = { id: string; name: string; archetype: string; setup: string; description: string; params: Partial<SimParams> }

export const SCENARIOS: Scenario[] = [
  {
    id: 'underinvestment',
    name: 'Fleet grows, charging does not',
    archetype: 'Limits to Growth: the charging limit (R05 p.283)',
    setup: 'Management orders aircraft when utilisation is above 70 % (6-month delivery); the 6 turnaround chargers stay fixed.',
    description:
      'Aircraft are ordered when utilisation is high, but the 6 turnaround chargers stay fixed. Served trips level off at about 90 % of the 8,640-trip charging ceiling: as utilisation approaches the ceiling, waits pass riders’ 15-minute tolerance and churn balances word of mouth. Aircraft beyond the 15th add no capacity.',
    params: { expandFleet: true, investInCharging: false, countSupplyLine: false, procurementDelayMonths: 6 },
  },
  {
    id: 'delay',
    name: 'Long procurement delay',
    archetype: 'Balancing Process with Delay (R05 p.283)',
    setup: 'Chargers are added in proportion to the fleet; aircraft arrive 15 months after ordering; orders ignore aircraft already on order.',
    description:
      'Charging scales with the fleet, but aircraft arrive 15 months after ordering. Orders keep being placed while earlier ones are in transit, so the fleet over-builds: by month 60 roughly half the capacity is idle, and aircraft are still arriving.',
    params: { expandFleet: true, investInCharging: true, countSupplyLine: false, procurementDelayMonths: 15 },
  },
  {
    id: 'balanced',
    name: 'Chargers scale, 3-month delivery',
    archetype: 'Limits to Growth: the market limit (word of mouth R1 meets market saturation B4; R05 p.283)',
    setup: 'Chargers are added in proportion to the fleet; aircraft arrive 3 months after ordering; orders ignore aircraft already on order.',
    description:
      'Charging scales with the fleet and aircraft arrive 3 months after ordering. Riders reach about 92 % of the market by month 60: the limit growth meets is now the market (saturation), not capacity. Waits exceed tolerance only in short spells while deliveries catch up (none after month 27). This is not free: about 14 aircraft are surplus at month 60 (449 surplus aircraft-months over the run), and the charging pool grows from 6 to 106 chargers. With a 6-month delay instead, riders rise slightly but surplus aircraft-months more than double.',
    params: { expandFleet: true, investInCharging: true, countSupplyLine: false, procurementDelayMonths: 3 },
  },
]

export function runScenario(id: string, base: SimParams = DEFAULT_PARAMS): SimPoint[] {
  const s = SCENARIOS.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown scenario ${id}`)
  return simulate({ ...base, ...s.params })
}
