// A small set-based-design tradespace for the Week 7 graduate comparison (R35 = SEBoK "Set-Based Design").
// Design factors: fleet size and number of hub vertiports (2 turnaround chargers per hub). Every number is a
// FICTIONAL teaching value taken from the Week 7 reference layer: 20 trips per aircraft per day, 48 charges per
// turnaround charger per day, USD 3.0 M per added aircraft, USD 0.8 M per spoke converted to a hub (two
// high-power charger upgrades at USD 0.4 M). Baseline: 12 aircraft, 3 hubs.

export type DesignPoint = { aircraft: number; hubs: number; capacity: number; feasible: boolean; capital: number; retainedPct: number }

export const FLEET_OPTIONS = [12, 14, 16, 18, 20]
export const HUB_OPTIONS = [3, 4, 5]
export const REQUIRED_CAPACITY = 300 // REQ-STK-004 (240 trips/day at no more than 80 % utilisation)

export function designPoint(aircraft: number, hubs: number): DesignPoint {
  const cap = (a: number, h: number) => Math.min(a * 20, h * 2 * 48)
  const capacity = cap(aircraft, hubs)
  const capital = Math.round(((aircraft - 12) * 3.0 + (hubs - 3) * 0.8) * 10) / 10
  return { aircraft, hubs, capacity, feasible: capacity >= REQUIRED_CAPACITY, capital, retainedPct: Math.round((1000 * cap(aircraft, hubs - 1)) / capacity) / 10 }
}

export function tradespace(): DesignPoint[] {
  return HUB_OPTIONS.flatMap((h) => FLEET_OPTIONS.map((a) => designPoint(a, h)))
}

/** Feasible points not dominated on (capital ↓, capacity ↑, retained capacity ↑). */
export function nonDominated(points: DesignPoint[]): DesignPoint[] {
  const f = points.filter((p) => p.feasible)
  const dominates = (a: DesignPoint, b: DesignPoint) =>
    a.capital <= b.capital && a.capacity >= b.capacity && a.retainedPct >= b.retainedPct && (a.capital < b.capital || a.capacity > b.capacity || a.retainedPct > b.retainedPct)
  return f.filter((p) => !f.some((q) => q !== p && dominates(q, p)))
}
