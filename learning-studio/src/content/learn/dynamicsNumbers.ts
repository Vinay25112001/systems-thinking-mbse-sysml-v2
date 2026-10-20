// Derived FICTIONAL numbers from the AeroLink dynamics model (src/sim/aerolink.ts), moved here unchanged from the
// earlier Week 1 Learn module when Week 1 was rebuilt around team formation, stakeholders and needs (2026-10-18).
// They feed the retained dynamics figures (LessThanSum, CapacityCrossover) in src/components/figures, which Week 1 no
// longer shows but which may return in a later week (docs/redesign/WEEK1_LEARNING_DESIGN.md §10). Never retyped:
// every value is computed from the model, and src/sim/aerolink.test.ts asserts the model behaviors behind them.
import { DAYS, DEFAULT_PARAMS, chargingCapacityOf, fleetCapacityOf, runScenario, simulate } from '../../sim/aerolink'

const P = DEFAULT_PARAMS
/** Trips one aircraft can fly in a month (20 × 30 = 600). */
export const TRIPS_PER_AIRCRAFT_MONTH = P.tripsPerAircraftPerDay * DAYS
/** Charges per charger per day (16 × 60 ÷ 20 = 48). */
export const CHARGES_PER_CHARGER_DAY = (P.operatingHoursPerDay * 60) / P.chargeMinutesPerTrip
export const FLEET_CAP_12 = fleetCapacityOf(P, P.initialFleet) // 7,200
export const CHARGE_CAP_6 = chargingCapacityOf(P, P.chargers) // 8,640
export const CROSSOVER_6 = CHARGE_CAP_6 / TRIPS_PER_AIRCRAFT_MONTH // 14.4
/** 40 aircraft flying alone vs what the coupled system delivers ("Fleet grows, charging does not"). */
const UNDER = runScenario('underinvestment')
export const F4_FLEET = UNDER.at(-1)!.fleet // 40
export const F4_ALONE = fleetCapacityOf(P, F4_FLEET) // 24,000
export const F4_DELIVERED = UNDER.at(-1)!.served // ≈ 7,788
export const F4_PER_AIRCRAFT_DAY = F4_DELIVERED / F4_FLEET / DAYS // ≈ 6.5
export const PLATEAU = F4_DELIVERED
/** Trips served at month 60 with the fleet held at each size from 10 to 40 aircraft (default parameters). */
export const FIGURE6_FLEETS = Array.from({ length: 31 }, (_, i) => 10 + i)
export const SERVED_FROZEN: { fleet: number; served: number }[] = FIGURE6_FLEETS.map((fleet) => ({ fleet, served: simulate({ ...P, initialFleet: fleet, expandFleet: false }).at(-1)!.served }))
