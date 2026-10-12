// Every behavioural claim the Week 1 course text makes about the AeroLink teaching model is asserted here. Each claim
// is paired with a counterfactual run (a different policy or parameter) that the same assertion must REJECT, so no
// check is true by construction. Comments name the course text that depends on each test.
import { describe, expect, it } from 'vitest'
import { ALL_LOOPS, LOOP_LINKS, LOOPS, loopKind } from '../content/causalLoops'
import {
  DEFAULT_PARAMS,
  SCENARIOS,
  adoptionFrom,
  adoptionRate,
  attractivenessAt,
  capacityOf,
  chargerMonths,
  chargersFor,
  chargingCapacityOf,
  fleetCapacityOf,
  churnOf,
  excessAircraftMonths,
  nextRiders,
  orderSize,
  potentialRiders,
  runScenario,
  simulate,
  tripDemand,
  utilisationOf,
  waitAt,
  type SimParams,
  type SimPoint,
} from './aerolink'

const last = <T,>(a: T[], n: number) => a.slice(a.length - n)
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const run = (o: Partial<SimParams>) => simulate({ ...DEFAULT_PARAMS, ...o })
const UNDERINVESTMENT: Partial<SimParams> = { expandFleet: true, investInCharging: false, countSupplyLine: false, procurementDelayMonths: 6 }
const DELAY: Partial<SimParams> = { expandFleet: true, investInCharging: true, countSupplyLine: false, procurementDelayMonths: 15 }
const CHARGE_CAP = chargingCapacityOf(DEFAULT_PARAMS, DEFAULT_PARAMS.chargers) // 8,640 trips/month
const tailServedRatio = (r: SimPoint[]) => mean(last(r, 18).map((p) => p.served)) / mean(last(r, 18).map((p) => p.chargingCapacity))

/** Claim: with fixed chargers, throughput levels off just BELOW the charging ceiling (85–95 %), with waits above tolerance. */
const levelsOffBelowCeiling = (r: SimPoint[]) => {
  const ratio = tailServedRatio(r)
  return ratio > 0.85 && ratio < 0.95 && mean(last(r, 18).map((p) => p.waitMin)) > DEFAULT_PARAMS.waitToleranceMin
}

/** Claim: churn balances word of mouth at the plateau. Setting adoption = churn gives the equilibrium attractiveness
 *  A* = c / (w (1 − R/M) + c), hence the wait and utilisation at which the plateau sits (worked example, ¶4). */
function predictedPlateauUtilisation(p: SimParams, ridersShare: number): number {
  const a = p.churnRate / (p.wordOfMouth * (1 - ridersShare) + p.churnRate)
  const wait = p.waitToleranceMin * Math.sqrt(1 / a - 1)
  return 1 - 2 / wait
}

/** Claim (delay scenario): the fleet over-builds — aircraft owned or on order far exceed what demand needs. */
const overBuilds = (r: SimPoint[]) => r[r.length - 1].committedExcess > 100 && r[r.length - 1].utilisation < 0.6

describe('AeroLink teaching dynamics model', () => {
  it('is deterministic and conserves trips (served ≤ demand and ≤ capacity)', () => {
    const a = simulate(DEFAULT_PARAMS)
    expect(a).toEqual(simulate(DEFAULT_PARAMS))
    for (const p of a) {
      expect(p.served).toBeLessThanOrEqual(p.demand + 1e-9)
      expect(p.served).toBeLessThanOrEqual(p.capacity + 1e-9)
      expect(p.riders).toBeGreaterThanOrEqual(0)
      expect(p.riders).toBeLessThanOrEqual(DEFAULT_PARAMS.marketSize)
    }
  })

  it('in all three scenarios demand never exceeds capacity: there is never unmet demand, so churn — not rationing — limits riders', () => {
    for (const id of ['underinvestment', 'delay', 'balanced']) for (const p of runScenario(id)) expect(p.demand).toBeLessThan(p.capacity)
    // counterfactual: with no churn, nothing stops demand passing the ceiling, and trips go unserved
    expect(run({ ...UNDERINVESTMENT, churnRate: 0 }).some((p) => p.demand > p.capacity)).toBe(true)
  })

  it('Limits to Growth: with 6 fixed chargers, served trips level off at ≈ 90 % of the 8,640 ceiling, with waits above tolerance', () => {
    const r = runScenario('underinvestment')
    expect(CHARGE_CAP).toBe(8640)
    expect(levelsOffBelowCeiling(r)).toBe(true)
    expect(Math.round(r[60].served)).toBe(7788)
    expect(r[60].waitMin).toBeGreaterThan(20)
    expect(last(r, 18).every((p) => p.bottleneck === 'charging')).toBe(true)
    expect(r[60].riders / DEFAULT_PARAMS.marketSize).toBeLessThan(0.1)
    // counterfactuals the same check must reject: no churn (served reaches the ceiling itself) and chargers that scale
    expect(levelsOffBelowCeiling(run({ ...UNDERINVESTMENT, churnRate: 0 }))).toBe(false)
    expect(levelsOffBelowCeiling(run({ ...UNDERINVESTMENT, investInCharging: true }))).toBe(false)
    // and the plateau is set by charging: doubling the chargers raises it ≈ 2x
    const doubled = run({ ...UNDERINVESTMENT, chargers: 12 })
    expect(mean(last(doubled, 18).map((p) => p.served)) / mean(last(r, 18).map((p) => p.served))).toBeGreaterThan(1.9)
  })

  it('the plateau is where churn balances word of mouth (analytic prediction within 0.005 utilisation)', () => {
    const r = runScenario('underinvestment')
    const end = r[r.length - 1]
    const predicted = predictedPlateauUtilisation(DEFAULT_PARAMS, end.riders / DEFAULT_PARAMS.marketSize)
    expect(Math.abs(end.utilisation - predicted)).toBeLessThan(0.005)
    expect(predicted).toBeGreaterThan(0.89)
    expect(predicted).toBeLessThan(0.91)
    // counterfactual: halving churn moves both the prediction and the simulated plateau; the old prediction no longer fits
    const lowChurn = run({ ...UNDERINVESTMENT, churnRate: 0.075 })
    expect(Math.abs(lowChurn[60].utilisation - predicted)).toBeGreaterThan(0.01)
    expect(Math.abs(lowChurn[60].utilisation - predictedPlateauUtilisation({ ...DEFAULT_PARAMS, churnRate: 0.075 }, lowChurn[60].riders / DEFAULT_PARAMS.marketSize))).toBeLessThan(0.005)
  })

  it('aircraft beyond the 15th add no capacity: a fleet frozen at 15 gives the same tail throughput as the 40 bought', () => {
    const r = runScenario('underinvestment')
    expect(r[60].fleet).toBe(40)
    const tail = (x: SimPoint[]) => mean(last(x, 18).map((p) => p.served))
    const frozen15 = run({ ...UNDERINVESTMENT, initialFleet: 15, expandFleet: false })
    expect(Math.abs(tail(r) - tail(frozen15)) / tail(r)).toBeLessThan(0.005)
    // below the crossover the fleet does matter: frozen at 12, throughput is ≈ 17 % lower (so the check is not vacuous)
    const frozen12 = run({ ...UNDERINVESTMENT, expandFleet: false })
    expect(tail(frozen12) / tail(r)).toBeLessThan(0.86)
    // counterfactual: if chargers scale with the fleet, the 40-aircraft fleet is NOT equivalent to 15 aircraft
    const scaled = run({ ...UNDERINVESTMENT, investInCharging: true })
    expect(tail(scaled) / tail(frozen15)).toBeGreaterThan(2)
    // the 25 surplus aircraft show up in the over-build indicator
    expect(r[60].excessAircraft).toBeGreaterThan(25)
  })

  it('the binding constraint moves: demand binds first, then the fleet, then (from 15 aircraft) charging', () => {
    const r = runScenario('underinvestment')
    expect(r[0].bottleneck).toBe('demand')
    expect(r[0].utilisation).toBeLessThan(0.2)
    const firstFleet = r.findIndex((p) => p.bottleneck === 'fleet')
    const firstCharging = r.findIndex((p) => p.bottleneck === 'charging')
    expect(firstFleet).toBeGreaterThan(0)
    expect(firstCharging).toBeGreaterThan(firstFleet)
    expect(r[firstCharging].fleet).toBeGreaterThanOrEqual(15)
    expect(r.slice(firstCharging).every((p) => p.bottleneck === 'charging')).toBe(true)
    // the indicator reports demand-limited operation honestly: delay and short-delivery scenarios end with idle capacity
    expect(runScenario('delay')[60].bottleneck).toBe('demand')
    expect(runScenario('balanced')[60].bottleneck).toBe('demand')
    // counterfactual: when chargers scale with the fleet the charging regime never appears
    expect(run({ ...UNDERINVESTMENT, investInCharging: true }).some((p) => p.bottleneck === 'charging')).toBe(false)
  })

  it('Balancing Process with Delay: a 15-month delay over-builds; the fleet is still rising at month 60 and settles far above need', () => {
    const slow = runScenario('delay')
    const fast = runScenario('balanced')
    expect(overBuilds(slow)).toBe(true)
    expect(slow[60].onOrder).toBeGreaterThan(0)
    expect(slow[60].committedExcess).toBeGreaterThan(5 * fast[60].committedExcess)
    // measured after the pipeline empties (120 months), not at the 60-month truncation (review W1-F23)
    const long = simulate({ ...DEFAULT_PARAMS, ...DELAY, months: 120 })
    const end = long[120]
    expect(end.onOrder).toBe(0)
    expect(end.fleet / (end.demand / (DEFAULT_PARAMS.tripsPerAircraftPerDay * 30 * DEFAULT_PARAMS.targetUtilisation))).toBeGreaterThan(1.5)
    // counterfactuals the same check must reject: short delay, and the supply-line ordering policy
    expect(overBuilds(fast)).toBe(false)
    expect(overBuilds(run({ ...DELAY, countSupplyLine: true }))).toBe(false)
  })

  it('supply-line ordering removes the over-build but, with a 15-month delay, slows growth: a trade-off, not a free fix', () => {
    const base = simulate({ ...DEFAULT_PARAMS, ...DELAY, months: 120 })
    const sl = simulate({ ...DEFAULT_PARAMS, ...DELAY, countSupplyLine: true, months: 120 })
    expect(sl[60].committedExcess).toBeLessThan(10)
    expect(excessAircraftMonths(sl)).toBeLessThan(100) // only the launch fleet's idle months (shared by every run)
    expect(excessAircraftMonths(base)).toBeGreaterThan(5000)
    expect(sl[60].riders).toBeLessThan(0.5 * base[60].riders)
    // counterfactual: switching the policy off restores the over-build (the option is wired to the ordering rule)
    expect(excessAircraftMonths(simulate({ ...DEFAULT_PARAMS, ...DELAY, countSupplyLine: false, months: 120 }))).toBeGreaterThan(5000)
  })

  it('scaling chargers with the fleet turns the charging limit into market-limited growth (and over-building is not free)', () => {
    const r = runScenario('balanced')
    expect(r[60].riders).toBeGreaterThan(0.85 * DEFAULT_PARAMS.marketSize)
    expect(mean(last(r, 12).map((p) => p.waitMin))).toBeLessThan(DEFAULT_PARAMS.waitToleranceMin)
    expect(r.slice(28).every((p) => p.waitMin <= DEFAULT_PARAMS.waitToleranceMin)).toBe(true)
    expect(last(r, 12).every((p) => p.bottleneck === 'demand')).toBe(true)
    // market-limited: a market twice as large gives many more riders at month 60; the same doubling under fixed chargers does not
    const bigMarket = run({ expandFleet: true, investInCharging: true, procurementDelayMonths: 3, marketSize: 60000 })
    expect(bigMarket[60].riders / r[60].riders).toBeGreaterThan(1.5)
    const bigMarketFixed = run({ ...UNDERINVESTMENT, marketSize: 60000 })
    expect(bigMarketFixed[60].riders / runScenario('underinvestment')[60].riders).toBeLessThan(1.1)
    // over-building wins riders only at a price: underinvestment + chargers scale (6-month delay) beats the 3-month
    // scenario on riders but commits far more idle aircraft
    const sixMonth = run({ ...UNDERINVESTMENT, investInCharging: true })
    expect(sixMonth[60].riders).toBeGreaterThan(r[60].riders)
    expect(sixMonth[60].committedExcess).toBeGreaterThan(3 * r[60].committedExcess)
  })

  it('pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)', () => {
    const u = runScenario('underinvestment')
    // regime sequence quoted in the answer key: demand to m8, fleet m9–14, demand at m15, charging from m16
    expect(u.map((p) => p.bottleneck[0]).join('')).toBe('d'.repeat(9) + 'f'.repeat(6) + 'd' + 'c'.repeat(45))
    expect(u[60].waitMin).toBeCloseTo(20.3, 1)
    expect(Math.round((1000 * u[60].riders) / DEFAULT_PARAMS.marketSize) / 10).toBe(8.7)
    expect(Math.round(u[60].riders)).toBe(2596)
    expect(u[24].onOrder).toBe(0)
    expect(u[60].served / u[60].fleet / 30).toBeCloseTo(6.5, 1) // trips per aircraft per day (reducing variety)
    const fleetLimited = mean(u.slice(9, 15).map((p) => p.served))
    expect(u[60].served / fleetLimited).toBeGreaterThan(1.15) // "rise about 20 % as the first deliveries arrive"
    expect(u[60].served / fleetLimited).toBeLessThan(1.25)
    const d = runScenario('delay')
    expect([Math.round(100 * d[60].utilisation), d[60].fleet, d[60].onOrder, Math.round(d[60].committedExcess), Math.round(d[60].riders)]).toEqual([49, 278, 78, 161, 27261])
    const d120 = simulate({ ...DEFAULT_PARAMS, ...DELAY, months: 120 })
    expect(d120[120].fleet).toBe(356)
    expect(d120[120].fleet / (d120[120].demand / 420)).toBeCloseTo(1.7, 1)
    expect(Math.round(excessAircraftMonths(d120) / 10) * 10).toBe(9060)
    const dsl = run({ ...DELAY, countSupplyLine: true })
    expect([Math.round(dsl[60].committedExcess), Math.round(dsl[60].riders)]).toEqual([0, 5033])
    expect(Math.round(excessAircraftMonths(simulate({ ...DEFAULT_PARAMS, ...DELAY, countSupplyLine: true, months: 120 })))).toBe(49)
    const b = runScenario('balanced')
    expect(Math.round((1000 * b[60].riders) / DEFAULT_PARAMS.marketSize) / 10).toBe(92.5)
    expect(Math.round(b[60].committedExcess)).toBe(14)
    expect(b[27].waitMin).toBeGreaterThan(DEFAULT_PARAMS.waitToleranceMin) // "none after month 27"
    const six = run({ ...UNDERINVESTMENT, investInCharging: true })
    expect([Math.round(six[60].riders), Number(six[60].waitMin.toFixed(1)), Math.round(six[60].committedExcess)]).toEqual([28776, 4.2, 70])
  })

  it('pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)', () => {
    const at = (o: Partial<SimParams>, months: number) => {
      const r = simulate({ ...DEFAULT_PARAMS, ...UNDERINVESTMENT, ...o, months })
      const e = r[months]
      return [Math.round(e.riders), Number(e.waitMin.toFixed(1)), e.fleet, e.chargers, Math.round(excessAircraftMonths(r)), chargerMonths(r)]
    }
    // [riders, wait, fleet, chargers, surplus aircraft-months, charger-months]
    expect(at({}, 60)).toEqual([2596, 20.3, 40, 6, 1135, 366])
    expect(at({ investInCharging: true }, 60)).toEqual([28776, 4.2, 276, 138, 1079, 3366]) // (a)
    expect(at({ countSupplyLine: true }, 60)).toEqual([2596, 20.3, 19, 6, 235, 366]) // (b)
    expect(at({ chargers: 12 }, 60)).toEqual([5163, 19.3, 45, 12, 679, 732]) // (c)
    expect(at({ investInCharging: true, countSupplyLine: true }, 60)).toEqual([11107, 16.9, 63, 32, 49, 892]) // (a) + (b)
    expect(at({}, 120)[4]).toBe(2671)
    expect(at({ investInCharging: true }, 120)).toEqual([28831, 4.2, 276, 138, 5284, 11646])
    expect(at({ investInCharging: true, countSupplyLine: true }, 120)).toEqual([26714, 6.8, 189, 95, 49, 4984])
    // "only (a) brings the month-60 wait below tolerance" (of a, b, c and a + b)
    expect(at({ investInCharging: true, countSupplyLine: true }, 60)[1]).toBeGreaterThan(DEFAULT_PARAMS.waitToleranceMin)
    expect(simulate({ ...DEFAULT_PARAMS, ...UNDERINVESTMENT, investInCharging: true, countSupplyLine: true })[60].bottleneck).toBe('fleet')
    // the 60-month total flatters (a): baseline idles ≈ 25.6 aircraft from month 22; (a) has < 1 surplus from month 8 until month 45
    const base = runScenario('underinvestment')
    const a = run({ ...UNDERINVESTMENT, investInCharging: true })
    expect(base.slice(22).every((p) => Math.abs(p.excessAircraft - 25.6) < 0.05)).toBe(true)
    expect(base[21].excessAircraft).toBeLessThan(25)
    expect(a.slice(8, 45).every((p) => p.excessAircraft < 1)).toBe(true) // after the launch months (0–7) every run shares
    expect(a[46].excessAircraft).toBeGreaterThan(25)
    expect([base[60].excessAircraft.toFixed(1), a[60].excessAircraft.toFixed(1)]).toEqual(['25.6', '70.5'])
    // charger-months roughly ninefold
    expect(3366 / 366).toBeGreaterThan(9)
    // the scenario text: 3-month delivery has 449 surplus aircraft-months and 106 chargers; the 6-month variant more than doubles it
    const b3 = runScenario('balanced')
    expect([Math.round(excessAircraftMonths(b3)), b3[60].chargers]).toEqual([449, 106])
    expect(excessAircraftMonths(a) / excessAircraftMonths(b3)).toBeGreaterThan(2)
    expect(a[60].riders).toBeGreaterThan(b3[60].riders)
    // the explorer's archetype feedback: delay + ignored supply line explain the 40 aircraft (19 with either removed);
    // the delay scenario's riders approach the market limit (≈ 91 %)
    expect([run({ ...UNDERINVESTMENT, procurementDelayMonths: 0 })[60].fleet, run({ ...UNDERINVESTMENT, countSupplyLine: true })[60].fleet]).toEqual([19, 19])
    expect(Math.round((100 * runScenario('delay')[60].riders) / DEFAULT_PARAMS.marketSize)).toBe(91)
  })

  it('the "demand" regime is a convention at riders’ tolerance: just inside it, waits still cost riders (review W1-R05)', () => {
    const u = runScenario('underinvestment')
    expect(attractivenessAt(DEFAULT_PARAMS.waitToleranceMin, DEFAULT_PARAMS.waitToleranceMin)).toBe(0.5)
    expect(u[8].bottleneck).toBe('demand')
    expect(u[8].attractiveness).toBeLessThan(0.65)
    expect(u[0].attractiveness).toBeGreaterThan(0.97) // at launch extra capacity adds almost nothing
    // one more aircraft from month 0 raises riders at month 8 (capacity still mattered inside the demand regime)
    const plus = run({ ...UNDERINVESTMENT, initialFleet: 13, expandFleet: false })
    const frozen = run({ ...UNDERINVESTMENT, expandFleet: false })
    expect(plus[9].riders).toBeGreaterThan(frozen[9].riders * 1.01)
  })

  it('the scenario labels name the archetype the quiz keys use (Limits to Growth twice, with different limits)', () => {
    const label = Object.fromEntries(SCENARIOS.map((s) => [s.id, s.archetype]))
    expect(label.underinvestment).toMatch(/^Limits to Growth: the charging limit/)
    expect(label.delay).toMatch(/^Balancing Process with Delay/)
    expect(label.balanced).toMatch(/^Limits to Growth: the market limit/)
  })

  it('matches the Week 1 hand calculation: charging limits capacity from the 15th aircraft (ceiling 8,640 trips/month)', () => {
    const at = (fleet: number) => simulate({ ...DEFAULT_PARAMS, initialFleet: fleet, chargers: 6, expandFleet: false, investInCharging: false, months: 0 })[0]
    expect(at(12).capacity).toBe(7200)
    expect(at(14).capacity).toBe(8400)
    expect(at(14).limitingResource).toBe('fleet')
    expect(at(15).limitingResource).toBe('charging')
    expect(at(15).capacity).toBe(8640)
    expect(at(24).capacity).toBe(8640)
  })

  it('Learn check C6 (design D5): with 12 initial chargers, 12 × 48 × 30 = 17,280 and 17,280 ÷ 600 = 28.8, so charging limits capacity from the 29th aircraft', () => {
    expect(chargingCapacityOf(DEFAULT_PARAMS, 12)).toBe(17280)
    expect(chargingCapacityOf(DEFAULT_PARAMS, 12) / fleetCapacityOf(DEFAULT_PARAMS, 1)).toBeCloseTo(28.8, 10)
    const at = (fleet: number) => simulate({ ...DEFAULT_PARAMS, initialFleet: fleet, chargers: 12, expandFleet: false, investInCharging: false, months: 0 })[0]
    expect(at(28).limitingResource).toBe('fleet')
    expect(at(28).capacity).toBe(16800)
    expect(at(29).limitingResource).toBe('charging')
    expect(at(29).capacity).toBe(17280)
  })
})

describe('causal-loop diagram matches the model equations', () => {
  const sign = (x: number) => (x > 0 ? '+' : x < 0 ? '−' : '0')
  const link = (from: string, to: string) => LOOP_LINKS.find((l) => l.from === from && l.to === to)!
  const P = DEFAULT_PARAMS
  const on = (o: Partial<SimParams>) => ({ ...P, ...o })

  /** For EVERY link: the sign of the partial effect computed from the model function that implements it (other inputs
   *  held constant), evaluated inside the link's stated operating range or policy (review W1-R06). */
  const PARTIAL_EFFECT: Record<string, () => string> = {
    'riders>adoption': () => sign(adoptionFrom(P, 5001, 20000, 0.8) - adoptionFrom(P, 5000, 20000, 0.8)), // potential held constant
    'adoption>riders': () => sign(nextRiders(P, 5000, 101, 50) - nextRiders(P, 5000, 100, 50)),
    'riders>potential': () => sign(potentialRiders(P, 5001) - potentialRiders(P, 5000)),
    'potential>adoption': () => sign(adoptionFrom(P, 5000, 20001, 0.8) - adoptionFrom(P, 5000, 20000, 0.8)),
    'riders>demand': () => sign(tripDemand(P, 5001) - tripDemand(P, 5000)),
    'demand>util': () => sign(utilisationOf(6001, 8000) - utilisationOf(6000, 8000)),
    'capacity>util': () => sign(utilisationOf(6000, 8001) - utilisationOf(6000, 8000)),
    'util>wait': () => sign(waitAt(0.8) - waitAt(0.7)),
    'wait>attract': () => sign(attractivenessAt(20, 15) - attractivenessAt(10, 15)),
    'attract>adoption': () => sign(adoptionRate(P, 5000, 0.8) - adoptionRate(P, 5000, 0.4)),
    'attract>churn': () => sign(churnOf(P, 5000, 0.8) - churnOf(P, 5000, 0.4)),
    'churn>riders': () => sign(nextRiders(P, 5000, 100, 51) - nextRiders(P, 5000, 100, 50)),
    // the gate: no order at or below the target utilisation, an order above it (same demand, fleet and supply line)
    'util>orderRate': () => sign(orderSize(P, 9000, 0.75, 12, 0) - orderSize(P, 9000, 0.7, 12, 0)),
    'demand>orderRate': () => sign(orderSize(P, 12000, 0.9, 12, 0) - orderSize(P, 9000, 0.9, 12, 0)),
    'orderRate>orders': () => {
      // the supply line accumulates orders: on-order next month = on-order now + ordered − delivered
      const r = simulate(on(UNDERINVESTMENT))
      for (let m = 1; m < r.length; m++) expect(r[m].onOrder).toBe(r[m - 1].onOrder + r[m - 1].ordered - (r[m].fleet - r[m - 1].fleet))
      return r.some((p) => p.ordered > 0) ? '+' : '0'
    },
    'orders>fleet': () => {
      // each order arrives procurementDelayMonths + 1 months after it is placed (the delayed link)
      const r = simulate(on(UNDERINVESTMENT))
      const lag = P.procurementDelayMonths + 1
      for (let m = lag; m < r.length; m++) expect(r[m].fleet - r[m - 1].fleet).toBe(r[m - lag].ordered)
      return r.some((p) => p.ordered > 0) && r[60].fleet > r[0].fleet ? '+' : '0'
    },
    'fleet>orderRate': () => sign(orderSize(P, 12000, 0.9, 13, 0) - orderSize(P, 12000, 0.9, 12, 0)),
    'orders>orderRate': () => {
      // condition: only under the supply-line policy; without it, aircraft on order do not change the order size
      expect(orderSize(P, 12000, 0.9, 12, 10) - orderSize(P, 12000, 0.9, 12, 0)).toBe(0)
      const sl = on({ countSupplyLine: true })
      return sign(orderSize(sl, 12000, 0.9, 12, 10) - orderSize(sl, 12000, 0.9, 12, 0))
    },
    'fleet>capacity': () => {
      expect(capacityOf(P, 21, 6) - capacityOf(P, 20, 6)).toBe(0) // condition: no effect once charging limits
      return sign(capacityOf(P, 13, 6) - capacityOf(P, 12, 6))
    },
    'chargers>capacity': () => {
      expect(capacityOf(P, 12, 12) - capacityOf(P, 12, 11)).toBe(0) // condition: no effect while the fleet limits
      return sign(capacityOf(P, 40, 7) - capacityOf(P, 40, 6))
    },
    'fleet>chargers': () => {
      expect(chargersFor(on({ investInCharging: false }), 40, 6)).toBe(6) // condition: only when chargers scale
      return sign(chargersFor(on({ investInCharging: true }), 40, 6) - chargersFor(on({ investInCharging: true }), 20, 6))
    },
  }

  it('EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)', () => {
    expect(LOOP_LINKS.map((l) => `${l.from}>${l.to}`).sort()).toEqual(Object.keys(PARTIAL_EFFECT).sort())
    for (const l of LOOP_LINKS) expect(`${l.from}>${l.to} ${PARTIAL_EFFECT[`${l.from}>${l.to}`]()}`).toBe(`${l.from}>${l.to} ${l.polarity}`)
    // the delayed link is the delivery link, and only that one
    expect(LOOP_LINKS.filter((l) => l.delay).map((l) => `${l.from}>${l.to}`)).toEqual(['orders>fleet'])
    // utilisation only gates orders: above the target, a higher utilisation with the same demand orders the same amount
    expect(orderSize(P, 9000, 0.95, 12, 0)).toBe(orderSize(P, 9000, 0.75, 12, 0))
    expect(link('util', 'orderRate').condition).toMatch(/gate/)
    // the demand → orders link closes a reinforcing loop through fleet, capacity, waits and churn (not listed separately)
    expect(loopKind(['riders', 'demand', 'orderRate', 'orders', 'fleet', 'capacity', 'util', 'wait', 'attract', 'churn'])).toBe('Reinforcing')
  })

  it('q1-5 holds attractiveness constant: through waiting (B1) the full-model net rider effect is negative well below half the market', () => {
    const A = (r: number, cap: number) => attractivenessAt(waitAt(tripDemand(P, r) / cap), P.waitToleranceMin)
    const full = (r: number, cap: number) => adoptionRate(P, r + 1, A(r + 1, cap)) - adoptionRate(P, r, A(r, cap))
    const heldA = (r: number, cap: number) => adoptionRate(P, r + 1, A(r, cap)) - adoptionRate(P, r, A(r, cap))
    const u = runScenario('underinvestment')
    const plateau = u[60].riders // 8.7 % of the market, capacity 8,640
    expect(heldA(plateau, 8640)).toBeGreaterThan(0)
    expect(full(plateau, 8640)).toBeLessThan(-1)
    expect(full(2000, 7200)).toBeLessThan(-0.5) // already at a 12-min wait (within tolerance)
    // counterfactual: with ample capacity the B1 path is negligible and the full effect is positive again
    expect(full(plateau, 86400)).toBeGreaterThan(0)
  })

  it('the net riders → adoption effect is positive only below half the market (the stated operating range of R1 dominance)', () => {
    const net = (r: number) => adoptionRate(DEFAULT_PARAMS, r + 1, 0.8) - adoptionRate(DEFAULT_PARAMS, r, 0.8)
    expect(net(5000)).toBeGreaterThan(0)
    expect(net(14000)).toBeGreaterThan(0)
    expect(net(16000)).toBeLessThan(0)
    expect(net(25000)).toBeLessThan(0)
  })

  it('classifies every loop by counting negative links (and the market-saturation loop is balancing)', () => {
    const byId = Object.fromEntries(ALL_LOOPS.map((l) => [l.id, l.kind]))
    expect(byId).toEqual({ R1: 'Reinforcing', B1: 'Balancing', B2: 'Balancing', B3: 'Balancing', B4: 'Balancing', B5: 'Balancing', B6: 'Balancing', B7: 'Balancing' })
    expect(LOOPS.map((l) => l.id)).toEqual(['R1', 'B1', 'B2', 'B3'])
    // mutation: flipping one link's sign flips the kind of every loop that uses it
    expect(loopKind(['riders', 'potential', 'adoption'], [...LOOP_LINKS.filter((l) => !(l.from === 'riders' && l.to === 'potential')), { from: 'riders', to: 'potential', polarity: '+' }])).toBe('Reinforcing')
  })
})
