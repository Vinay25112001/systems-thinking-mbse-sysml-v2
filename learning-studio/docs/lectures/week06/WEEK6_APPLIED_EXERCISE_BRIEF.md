# Week 6 individual applied exercise: the case brief (Lakeside City Bike-Share)

> Instructor copy of the brief released on the LMS for the Week 6 individual applied exercise (about 36 minutes, open
> book, the first 5 minutes for reading this brief). Written 2026-10-21 on the Week 5 pattern (review finding Mo3: a brief
> with marking notes, four tasks that fit the time, and one scale for the exercise and the graduate task); revised the
> same day after the Week 6 review and its confirmation (Mo1/N1: no capacity excess, dock headroom is slack, Mo3 objectives W6.4 and W6.6 assessed, Mo4
> reading time, n10 one unit and aligned descriptors). Review status: pending faculty review. The case is
> FICTIONAL and is not AeroLink; no Week 6 quiz item uses a bike-share setting (`src/week6/assessmentParts.test.ts`
> asserts it). The four tasks and the level descriptors are on the Assessment page (`src/week6/assessmentParts.ts`); this
> file holds the case the students work on, then the marking notes for the instructor.

## The case (give this part to students)

**Lakeside City Bike-Share** is a fictional public bike-share run by Lakeside Mobility, a non-profit contracted by the
city. It enters its third year of service with docked pedal bikes. The city council wants the service to reach the hill
district east of the river, where pedal bikes are little used, and to carry more trips as a new tram line opens.

### The service today (the baseline)

| Item | Value |
|---|---|
| Fleet | 600 pedal bikes |
| Stations | 50 stations with 20 docks each (1,000 docks) |
| Trips per bike per day | 4 on average (0.8 at the six hill-district stations) |
| Dock turnover the rebalancing vans can sustain | 3 trips per dock per day |
| Rebalancing | 4 vans moving bikes between stations, 06:00–22:00 |
| Software | The rider app (unlock, payment), the dock controllers at each station, the operations dashboard |
| Power | Each station draws a small supply for its dock controllers from the city street-lighting circuit |

Capacity is the smaller of the fleet limit (bikes × trips per bike) and the dock limit (docks × turnover).

### Needs and objectives

| ID | Statement |
|---|---|
| LC-N1 | Riders need a bike within a 5-minute walk at 90 % of peak-hour requests (city contract). |
| LC-N2 | The city needs the hill district served at the same trip rate per bike as the flat districts by the end of year 5. |
| LC-OBJ | Carry 2,800 trips a day by the tram opening (month 18 from now), and 3,600 a day by the end of year 4 (city forecast). |

### Technologies and evidence

| Technology | Status and evidence |
|---|---|
| Electric bikes (e-bikes) | Commercial products in service in many cities; the supplier's fleet data are available. |
| Battery swapping (vans carry charged packs and swap them at the stations) | In field trials in one other city for nine months; no winter data. The supplier rates it TRL 5. |
| Charging docks (e-bikes charge while docked) | A commercial product; needs a dedicated power connection at each station, which the street-lighting circuit cannot supply. |

### Open questions the operator has listed

1. The electricity tariff the utility will charge for dedicated station connections is not published; the utility will
   quote it only for a signed connection request.
2. Whether the city will permit battery storage (a charging room for swap packs) at the rebalancing depot.
3. How often a swapped pack fails in cold weather.

### Security and resilience notes from the operator

- E-bikes and swap packs are networked: the app unlocks a bike and reports its battery level; the swap van's handheld
  scanner logs every pack.
- A street-lighting circuit fault already takes a station's docks offline for hours, about twice a month.


## Marking notes (instructor only; do not release)

These notes describe what a 4 (Exemplary) answer contains and the most common errors. The criteria and descriptors are on
the Assessment page; score each criterion 1–4 (16 points in all, the same scale as the graduate sensitivity memo).

**Reading (5 min).** The brief is unseen; the first five minutes are for reading it, before Task 1.

**Task 1, criterion "Baseline and gaps" (about 7 min).**
- Baseline arithmetic: fleet limit 600 × 4 = 2,400 trips a day; dock limit 1,000 × 3 = 3,000; capacity **2,400, fleet-
  limited**. A 4 states the binding limit. A student who quotes 3,000 has taken the dock limit and missed the "smaller of
  the two" rule: at most 2 on this criterion.
- Near-term gap: 2,800 − 2,400 = **400 trips a day by month 18** (LC-OBJ). Mid-term gap: 3,600 − 2,400 = 1,200 by the
  end of year 4, or the hill-district gap from LC-N2 (six stations at 0.8 trips per bike against 4 per bike elsewhere).
  Either second gap is a 4 if both levels and the horizon are given and the source ID is named.
- **Lakeside has no capacity excess; Task 1 is answered with two gaps** (the lecture's rule, as for AeroLink's chargers:
  an excess is the baseline above the desired level, and slack on a limit that does not bind is not an excess at any
  reference level). The docks are the limit that does not bind (the fleet binds at 2,400), so the dock headroom, whether
  stated as **3,000 − 2,800 = 200** against the month-18 objective or as 3,000 − 2,400 = 600 against today's trips, is
  slack: removing it would make the docks bind. An answer that calls dock headroom (200 or 600) an excess scores **at
  most 2** on this criterion, as the level-2 descriptor says. By the end of year 4 (desired 3,600) the docks fall 600
  short and become a gap. A good answer notices that more bikes, not more docks, close the near-term gap.
- Horizons: any lengths with a reason (a fast-changing urban service suits short buckets, for example 18 months, years
  2–4 and years 5–8). Horizons with no lengths, or gaps written as features ("add e-bikes"), score 2.

**Task 2, criterion "Increments" (about 13 min; assesses proposed objectives W6.4 and W6.6).**
- A typical 4, the full increment: Increment 1 (near) adds pedal bikes, or e-bikes on charging docks at the flat
  stations, to close the 400-trip gap; triggered by the tram opening date being confirmed or by the quarterly trip count
  passing a stated line; it depends on the baseline (the fleet software and the depot).
- **Development approach with a reason (W6.4).** Sequential fits an increment of commercial products with known
  requirements in a familiar domain; incremental fits a station-by-station rollout that retires risk early; evolutionary
  fits the hill-district service, whose end state depends on winter evidence. Any approach with a reason drawn from the
  brief is a 4; an approach with no reason caps this element at 3.
- **A risk that exists only during the transition (W6.6).** For example: while a station's docks are replaced by
  charging docks, the station is offline and riders near it find no bike; or, during the rollout, a mixed pedal and
  e-bike fleet breaks the rebalancing plan. A risk that outlasts the transition (battery fade, the tariff, theft) is an
  operating risk, not a transition risk: at most 3.
- **Off-ramp required** wherever an increment inserts battery swapping (TRL 5): charging docks at the hill stations, or
  staying with pedal bikes there. No off-ramp for the immature technology caps the criterion at 2.
- The second increment needs only its content, its trigger and its off-ramp: typically e-bikes for the hill district with
  battery swapping, **triggered by winter field data showing the stated pack-failure rate or better**, with an off-ramp.
- A trigger that is a date ("start in year 3") is the common error: a date is a schedule, not evidence (Session 2, the
  anatomy slide). One date-only trigger is a 3.
- Transition: the bikes must stay available while stations change. Station by station, or one district first while the
  others run as before. "Cutover" alone is a complete answer if the student says what is cut over; do not mark down for
  brevity.
- Security and resilience change: e-bikes add networked unlock and battery reporting (a new path for adversity through
  the app); swap packs add a logged supply chain; charging docks add a dedicated power connection, which **removes** the
  street-lighting dependency (a resilience gain worth naming). "None, because nothing networked is added" is a complete
  answer for a pedal-bike increment.

**Task 3, criterion "Known unknowns" (about 5 min).**
- The three open questions are the candidates. A 4 records one in full, with impact, information needed, mitigation,
  owner and gated increment, and names a second with the increment it gates. Example: "Station connection tariff:
  impact, the charging-dock option may cost more than swapping; information needed, the utility's quote; mitigation,
  sign one connection request for a pilot station; owner, operations director; gates the increment that installs
  charging docks."
- **The tariff unknown must gate the charging-dock increment** (or the off-ramp that uses charging docks): a student who
  attaches it to the battery-swap increment has the dependency backwards and scores 2 on this criterion.
- "TBD" or "n/a" as an owner or a mitigation is not an answer; an unknown with no owner scores 2.

**Task 4, criterion "Insertion justified" (about 6 min).**
- Maturity: battery swapping is TRL 5 on the supplier's own rating, nine months of trials and no winter data, so it is
  immature for a near-term insertion.
- Insertability: it needs the depot charging room (open question 2) and a pack standard the e-bikes accept; the vans
  exist.
- Timing: the hill-district gap is mid-term (LC-N2, year 5), so there is time to gather winter data before inserting it.
- A 4 also says what a TRL cannot tell: TRL 5 rates the swap technology, not its fit with Lakeside's depot, vans and
  winter (SEBoK's limits of TRL, Session 1). A justification that rests on the TRL alone ("TRL 5, so mid term") scores 2.

**Timing check.** Reading and the four tasks are sized at 5 + 7 + 13 + 5 + 6 = 36 minutes, inside the 0.6 h workload row;
the student page shows the same split (`EXERCISE_READING_MINUTES` and `EXERCISE_TASKS` in
`src/week6/assessmentParts.ts`, tested).
