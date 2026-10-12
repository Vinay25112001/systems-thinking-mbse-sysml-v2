# Instructor reference AeroLink baseline: notes

Files: `src/model/reference/week02.ts` (extended), `week03.ts`, `week04.ts`, `week05.ts`, `week06.ts`, `week07.ts`, `week08.ts`, `week12.ts`; tests in `reference.detail.test.ts`.
Every number is FICTIONAL. Each file lists its fictional values in a comment block at the top.

## 1. Counts at Week 14 (`referenceUpTo(14)`)

| Kind | n | Kind | n | Kind | n |
|---|---|---|---|---|---|
| ENT | 1 | REQ | 20 (10 STK, 10 SYS) | CRIT | 4 |
| EXT | 6 | MOE | 6 | DEC | 2 |
| STK | 14 | MOP | 9 | FN | 14 |
| CON | 16 | TPM | 3 | LOG | 7 (6 official + LOG-007) |
| MGO | 9 (mission, 4 goals, 4 objectives) | TECH | 3 | PHY | 8 (6 official + PHY-007, PHY-008) |
| NEED | 11 | A / R / O / U | 8 / 8 / 2 / 2 (20 AROU) | IF | 14 (9 + IF-010..014) |
| CAP | 10 (3 decomposed) | ALT | 4 | INFO | 5 |
| SCN | 5 | VER | 11 | AI | 2 |

There are 204 elements and 381 links. `validateModel` reports no errors and no warnings for any week. `orphansAndChildless` reports no orphans; the only childless parent is NEED-011 (see §5). All 10 REQ-SYS are satisfied, allocated to a function and verified. 1 of the 10 REQ-STK is verified directly (REQ-STK-007, by inspection). The other stakeholder requirements are left for validation against the MOEs, which is deliberate (RB-10.1).

The Week 2 AROU v0 has A-001, A-002, A-007, R-001, O-001 and U-001. A-008 is the Week 3 AROU v1 entry exposed by SCN-005. U-002 was added in Week 4, when TBD-02 appeared. A-003 to A-005, R-002 to R-008 and O-002 were added in Week 6, and A-006 in Week 7. (A-007 and A-008 took the next free IDs on 2026-10-11, after A-003..A-006 existed, so the A-numbers do not follow the week order.)

**Changes of 2026-10-11 (structural review items; IDs never reused):**
- W2-F04: every stakeholder has a concern of its own. CON-012 Community noise now derives from STK-004 only; new CON-015 Fleet delivery and certification progress (STK-011) and CON-016 Land use and zoning of vertiport sites (STK-013). Test: `l2Coverage(referenceUpTo(2)).missingConcern` is empty.
- W3-F02: new goal MGO-009 "Every flight within approved limits" (derives from MGO-001 and CON-004); MGO-008 now derives from MGO-009 only (the links MGO-008 → MGO-001 and MGO-008 → CON-004 were removed). Every reference MGO passes the MGO recorder.
- W3-F18: NEED-011 "Prompt notice and a way onward when a trip is disrupted" (STK-001, CON-001; conditions and rationale recorded), met by CAP-005 (`CAP-005 derives-from NEED-011`), so SCN-005 → CAP-005 → NEED-011 as for the other scenario–need chains; A-008 "Public-transport fallback is available during weather holds" affects SCN-005.
- Charger-occupancy convention: A-007 (see §3). It affects CON-006 (Week 2) and CAP-003 (Week 3).
- Week 6 (lead request): R-004 consequence 3 → 4 (likelihood 3; Week 6 rates it C4, still a moderate cell); TECH-001 records R-005 as `relatedRisk`, not `maturityRisk` (TRL 6 needs no maturity risk; R-005 is an external grid dependency).
- Week 5 / Week 7 (lead request): MOE-005 keeps its name; its text now ends "(course cost measure, handled explicitly per RB-6.2)" (ID and links unchanged); ALT-001 carries `baseline: true`; DEC-001 `wouldChangeIf` now says that at 192 trips/day or less MGO-007's 80 % rule would re-derive REQ-STK-004 as 240 trips/day, which the baseline already provides.

**Changes of 2026-10-11, second batch (Week 8 review F07, F23 and its reference observations; `docs/authoring/week08_notes.md` "Reference changes proposed"; IDs never reused, no existing ID changes meaning).** Counts: +5 IF (199 → 204 elements); +13 links (368 → 381: 13 FN derives-from SCN; `AI-001 allocated-to PHY-004` is replaced by `AI-001 allocated-to PHY-005`). The new links are appended at the end of `week08.ts`, so the earlier `LNK-08-…` IDs are unchanged.
1. **IF-012 Maintenance <-> operations centre data** (information, PHY-005 ↔ PHY-004; carries INFO-003 go / no-go and maintenance status, and the relayed charge-session records). It carries the Week 8 flows F10 (go / no-go) and F18 (availability) and INFO-003 from the facility, so the REQ-STK-006 / REQ-SYS-008 interlock no longer rides on a procedure. **IF-004 is unchanged** and stays the organisational work-order handover.
2. **IF-010 Charger <-> operations centre data** (information, PHY-003 ↔ PHY-004; INFO-003 charge-session records, charge-complete status = F11).
3. **Fault reports PHY-001 → PHY-005: decision = a direct information interface, IF-013 Aircraft <-> maintenance health data link** (PHY-001 ↔ PHY-005; carries INFO-002 health and fault reports = F17). A relay over IF-002 and IF-012 was possible, but it would make the no-go path depend on the dispatch platform, the R-007 single point of failure; the direct link keeps the 2-min flag (REQ-SYS-008) independent of it. INFO-002's text now includes "health and fault reports" (its consumer text says PHY-005 receives them), because those reports are what crosses to maintenance.
4. **INFO-001 boarding timestamps PHY-002 → PHY-004: decision = a direct information interface, IF-014 Vertiport <-> operations centre data** (PHY-002 ↔ PHY-004). No information path existed for a relay (PHY-002 has no information interface to PHY-007). **IF-009 is unchanged** and stays the organisational pad-slot agreement; it carries no information.
5. **IF-011 Weather service <-> operations centre** (information, EXT-003 ↔ PHY-004; INFO-004). External, so it sits in `Context::aeroLinkContext` in the SysML model, where the weather item flow already was.
6. **AI-001: decision = re-allocate, not split.** `AI-001 allocated-to PHY-005`, where FN-008 (which it performs) and the certifying technicians of its human-oversight statement are. No new function is needed, so the FN count (14) and every FN-based number in Weeks 8–14 stay as they are. Its input from PHY-003 (charge-session records) reaches the facility by a **recorded relay** PHY-003 > PHY-004 > PHY-005 over IF-010 and IF-012, held in INFO-003's new `relay` attribute (the course's form of a recorded relay; checked hop by hop by `reference.detail.test.ts`).
7. **DEC-002** now reads "Host scheduling and dispatch on one operations platform …" (booking dropped). FN-001 stays on PHY-007, which DEC-002 never decided; the booking platform reaches the operations platform over IF-008.
8. **FN derives-from SCN** (13 links; rationale "Exercised in this scenario (R20b p.594)"): FN-001, FN-002 → SCN-001; FN-003, FN-005, FN-011, FN-012, FN-014 → SCN-002; FN-006, FN-007, FN-010 → SCN-003 (FN-010 through alternate flow A3, cell over-temperature); FN-008, FN-009 → SCN-004; FN-004 → SCN-005. One deviation from the Week 8 notes' list: **FN-011 → SCN-002, not SCN-001**, because SCN-001 ends when the boarding pass is issued, while release for flight happens in SCN-002 (after ANSP acceptance, step 3/A3, before take-off, step 5). **FN-013 Forecast demand has no SCN link: it is a planning function** (hourly forecasts for scheduling, the Year-2 re-forecast for DEC-001), and no operational scenario exercises it. The Week 8 `fn-scenario` advisory therefore flags FN-013 only, explained here and in the Week 8 lesson. A future "capacity review" planning scenario would be the place to exercise it (lead decision).
9. **Open items.** PHY-006 Communications Infrastructure: **no interface, by decision**. It is the medium of the information interfaces IF-002, IF-010, IF-012, IF-013 and IF-014, not an end of any of them; its text now says so, and the Week 8 `phy-isolated` advisory is explained (splitting each interface through PHY-006 would double the interface count without adding an exchange). **IF-002 carries INFO-002 only** (it listed INFO-003 without a PHY-001 → INFO-003 flow; the SysML model already carried INFO-002 only).
10. **Coverage rule now tested on the reference** (`reference.detail.test.ts`, "every information flow between placed elements …"): every INFO producer → consumer pair between PHY/EXT elements, with an AI placed at the PHY it is allocated to, is joined by an information-typed IF or by a recorded relay whose every hop is; no organisational IF lists an INFO, energy, power or data in `carries`; every INFO an IF lists flows between its ends (or is a hop of a recorded relay). Mutations (removing IF-013, IF-011, IF-012 or IF-010; retyping IF-014) are each detected.
11. **Drift check committed** as `src/model/reference/sysmlDrift.test.ts` (Vitest, so `npx vitest run src/model` runs it). It found one older drift beyond this batch: AI-002's `failureMode` in the SysML files still said "underinvestment archetype"; the files now carry the baseline wording.

## 2. Complete 11-link threads (`completeThreads`)

There are 26 complete threads from 10 stakeholders (STK-001, 002, 003, 004, 005, 006, 007, 009, 010, 014; STK-014's threads run through the same capability as STK-001's).

**Recommended for demonstration.** Each comes from a different stakeholder, and the test asserts all five:

1. STK-005 > NEED-004 > CAP-003 > REQ-SYS-001 > FN-006 > LOG-002 > PHY-003 > INFO-003 > VER-001 > MOP-002 > R-001 (charging)
2. STK-004 > NEED-003 > CAP-007 > REQ-SYS-002 > FN-005 > LOG-001 > PHY-001 > INFO-002 > VER-002 > MOP-004 > R-003 (noise)
3. STK-002 > NEED-002 > CAP-004 > REQ-SYS-003 > FN-003 > LOG-001 > PHY-001 > INFO-002 > VER-003 > MOP-005 > R-002 (energy reserve)
4. STK-009 > NEED-007 > CAP-006 > REQ-SYS-008 > FN-008 > LOG-003 > PHY-005 > INFO-003 > VER-008 > MOP-007 > R-002 (no-go fault)
5. STK-001 > NEED-001 > CAP-002 > REQ-SYS-005 > FN-002 > LOG-005 > PHY-004 > INFO-001 > VER-005 > MOP-001 > R-007 (ride assignment)

**Other complete threads:**
- STK-001/014 > NEED-001/008 > CAP-001 > REQ-STK-007 > FN-014 > LOG-007 > PHY-002 > INFO-001 > VER-011 > MOE-001 > R-008
- STK-001/014 > … > CAP-001 > REQ-SYS-005 > …
- STK-002 > NEED-002 > CAP-005 > REQ-SYS-004 > FN-004 > LOG-006 > PHY-004 > INFO-001 > VER-004 > MOE-004 > R-004
- STK-001 > NEED-011 > CAP-005 > REQ-SYS-004 > … (the same tail; new on 2026-10-11). It is complete because threads walk NEED → CAP → REQ, although no requirement derives from NEED-011 itself (§5).
- STK-002 > NEED-002 > CAP-006 > REQ-SYS-008 > …
- STK-003 > NEED-005 > CAP-008 > REQ-SYS-006 (FN-009, LOG-002, PHY-003 or PHY-004, VER-006, MOP-006, R-001 or R-007)
- STK-003 > NEED-005 > CAP-008 > REQ-SYS-007 (FN-005, LOG-001, VER-007, MOP-003)
- STK-005 or STK-010 > NEED-004 or NEED-010 > CAP-010 > REQ-SYS-010 > FN-007 > LOG-002 > PHY-003 > INFO-003 > VER-010 > MOP-009 > R-005
- STK-006 > NEED-006 > CAP-009 > REQ-SYS-009 > FN-010 > LOG-007 > PHY-002 > INFO-001 > VER-009 > MOP-008 > R-008
- STK-007 > NEED-009 > CAP-004 > REQ-SYS-003 > …
- PHY-004 variants of threads 1–3

**Caution for live demonstration.** `threadsFrom` takes the *first* INFO linked to the PHY. For PHY-004 (Operations Center) that is INFO-001 (Passenger Information), whichever function the thread follows. This is correct for thread 5 but semantically weak for, say, the weather thread. The fire thread via PHY-002 also lands on INFO-001 (boarding timestamps). The five recommended threads avoid this weakness. A thread that picked the most relevant INFO would need a change to `engineering.ts` (lead decision).

## 3. Design decisions

- **Trip.** A trip is one revenue flight for one booking (a party of 1–4). This matches the Week 1 dynamics model, which compares rider trips directly with aircraft trips.
- **Cycle arithmetic.** 20 trips per aircraft per day (dynamics default) = 960 min / 43 min × 90 % availability = 20.1. The 43-min cycle is:
  - 16 min block time (REQ-SYS-007): 25 km at 150 km/h = 10 min cruise, plus 6 min of terminal phases;
  - 25 min hub turnaround (REQ-STK-005): 5 min of rotor stop, safety check and connection plus 20 min of charging (REQ-SYS-001), deplaning and boarding overlapping the charge (Week 4); two pads per turnaround charger, so the charger is busy 20 min per turnaround (A-007, the course convention; see the next bullet);
  - 2 min positioning.

  90 % availability is REQ-SYS-006. Each charger gives 48 charges per day (16 h × 60 / 20 min), as in the dynamics model.
- **Charger occupancy (course-wide convention, DECISION_LOG W8, A-007).** A turnaround charger is occupied 20 min per turnaround, so it gives 48 charges per 16 h day. Week 1 (dynamics model, `chargeMinutesPerTrip` 20), Week 3 (gap analysis) and Week 7 (trade study, capacity = min(aircraft × 20, chargers × 48)) all use it. 25 min per charge (charger held for the whole turnaround) is the Week 3 sensitivity case.
  - Week 3 gap analysis (desired 200 / 300 / 400 charges/day in years 1–3; 6 turnaround chargers): convention 288 charges/day → +88 / −12 (−4 %, a probable gap against an upper bound; 1 charger) / −112 (3 chargers); sensitivity 230 → +30 / −70 (2 chargers) / −170 (5 chargers). Under the convention the fleet (240 trips/day) binds first in year 1; in the sensitivity case charging does. Under either reading charging is short by year 2.
  - Aligned 2026-10-11: A-007 now states the Week 4 composition (5 min pad work + 20 min charge, boarding overlapping the charge) and reaches 20 min charger occupancy through two pads per turnaround charger, so the REQ-STK-005 rationale, SCN-003 and the Week 4 lesson are consistent with it.
- **Capacity objective.** Year-2 planning demand is 240 trips/day (A-006). At no more than 80 % utilisation this needs 300 trips/day of capacity (MGO-007, REQ-STK-004). At 80 % utilisation the dynamics wait approximation gives 10 min, under the 15-min tolerance (A-001). REQ-STK-001 uses the 90th-percentile wait ≤ 15 min.
- **Weather and grid TBDs.** REQ-STK-003 and REQ-SYS-004 carry TBD-01, with U-001 linked. REQ-STK-010 and REQ-SYS-010 carry TBD-02, with U-002 linked. These are the reference's examples of a correct TBD.
- **Trade study (S04 Lab 11, "additional aircraft vs additional vertiports").**
  - Model: additive value, linear value functions, swing weights from points 100/75/40/35, giving weights 0.40/0.30/0.16/0.14.
  - Criteria: CRIT-001 wait (from MOE-001), CRIT-002 capital (MOE-005), CRIT-003 capacity kept after losing a hub (MOE-006), CRIT-004 noise exposure (MOE-003).
  - Scores: **ALT-004 0.670 (winner; buy 4 aircraft and convert a spoke into a fourth hub)**, ALT-002 0.489, ALT-003 0.458, ALT-001 0.452.
  - Rank reversal: if the **cost weight rises above 0.478** (base 0.30), ALT-001 (baseline) ranks first. If the wait weight falls below 0.226 (base 0.40), ALT-003 ranks first.
  - Only ALT-004 meets REQ-STK-004. Teaching point: buying aircraft alone turns charging into the bottleneck (the Week 1 charging limit, R-001), and adding a vertiport alone leaves the network fleet-limited.
  - The test recomputes the scores, both reversal points and the capacities. Sensitivity method: change one weight and rescale the others in proportion.
- **CRIT-001 uses the dynamics wait formula as a proxy.** The Week 1 model gives one "typical" wait; MOE-001 and REQ-STK-001 are 90th-percentile measures. CRIT-001's text says it is a proxy.
- **DEC-002** (one operations platform with hot standby for scheduling and dispatch) records the Week 8 architecture decision (RB-7.4) and mitigates R-007. Booking (FN-001) is on PHY-007 and is outside the decision.
- **Interface coverage (Week 8 course rule).** Every information flow between two elements crosses an information-typed IF or a recorded relay (`relay` attribute on the INFO, "PHY-a > PHY-b > PHY-c over IF-x and IF-y: …"); an organisational IF (IF-004, IF-009) records an agreement and carries no flow. Two element pairs therefore have two interfaces each: PHY-004–PHY-005 (IF-004 organisational, IF-012 information) and PHY-002–PHY-004 (IF-009 organisational, IF-014 information).
- **Extras beyond the official S04 lists.**
  - LOG-007 Vertiport Operations: no official logical element performs fire detection or boarding.
  - PHY-007 Passenger booking platform and PHY-008 Pad fire detection and alarm system.
  - The official PHY-003 "Charging Systems" is kept as one element for all 12 chargers.
- **Allocation is consistent.** Every FN is allocated to a PHY, and that PHY is always one of the PHYs its performing LOG — and, since 2026-10-11, its performing AI — is allocated to (tested).
- **Matching the lab-plan C.2 example IDs.** Where the examples did not conflict with official names, the reference uses them: CON-012 Community noise, CAP-003 Fleet charging management, TECH-002 Battery cell technology, FN-011 Dispatch aircraft, IF-005 Aircraft ↔ charger power, AI-002 Demand forecasting. The task listed the three technologies in a different order, so the TECH order follows C.2: TECH-001 High-power charging, TECH-002 Battery, TECH-003 Detect-and-avoid.
- **Allowed links only.** Nothing needed a link outside LINK_RULES. CRIT→MOE uses derives-from. ALT has no outgoing link type, so DEC-001 `affects` ALT-004. Interface ends are held in `attributes.ends`, because no link type joins IF to PHY.
- **Provenance.** `official-S04` is used for the official names (LOG/PHY/SCN/INFO; STK-001..006 come from the existing week02 mapping). `instructor-fictional` is used for any element whose statement depends on a fictional number: most REQs with numeric thresholds, MGO objectives, TPMs, ALTs, TECH TRLs, A-001/002/003–007 and MOE-005. Everything else is `instructor-reference`.

## 4. Reconciliations

- **Chargers: Data Sheet (6 vertiports × 2 = 12) vs dynamics model (6).** This is made explicit as **A-002**: 3 of the 6 vertiports are hubs with 2 high-power turnaround chargers each (6 in total). The 3 spokes have 6 standard chargers for overnight and opportunity top-up.
  - The dynamics model's 6 chargers is therefore the turnaround pool, not the installed count.
  - Tests assert PHY-003 installed = 12 = Data Sheet, and highPowerAtHubs = 6 = `DEFAULT_PARAMS.chargers`.
- **Fleet.** 12 aircraft (Data Sheet, dynamics) is the baseline. 16 is the planned count once DEC-001 is implemented (PHY-001 `baselineCount` / `plannedCount`). Week 13 impact analyses should start from the baseline.
- **Lab plan L3 vs S04 Lab 7 scenario IDs.** The L3 row lists SCN-001..003 as nominal, weather and charging/maintenance. The reference follows the official S04 Lab 7 list instead: SCN-002 nominal transport, SCN-003 charging, SCN-004 maintenance, SCN-005 weather. The CP1 "3 scenarios" requirement is therefore met by SCN-002, SCN-005 and SCN-003/004. The lab plan C.2 example "SCN-002 Weather disruption" conflicts with S04 and should be corrected by the lead, along with "LOG-004 Scheduling" (officially LOG-005) and "INFO-003 Weather data" (officially INFO-004).
- **Week 1 EXT numbering.** In week01.ts EXT-003 is Weather; in lab plan C.2, EXT-003 is the ANSP. The reference follows week01.ts (EXT-001 = ANSP, EXT-003 = Weather).

## 5. Uncertain or for the lead

- **NEED-011 has no requirement.** It was discovered in Week 3 (SCN-005) and is met by CAP-005, but none of the 20 requirements derives from it, so it is the reference's only childless parent (`reference.detail.test.ts` and the Week 5 trace test pin exactly this). Closing it needs a disruption-notice REQ-STK (with a satisfier by Week 8), which changes the 20-requirement set that the Week 4 and Week 5 lessons count; the Week 5 lesson text ("no childless needs or capabilities", worked example (b) and the answer key) is out of date until the lead decides.
- TRLs (TECH-001 = 6, TECH-002 = 5, TECH-003 = 4) rest only on labelled assumptions A-003..A-005. The TRL scale wording is taken from S11 p.767 (R16, read). No supplier evidence exists in the sources.
- Risk statements use the course's condition–if–then convention. The 5×5 scale definitions are not restated in the elements.
- Verdict wording (pass / fail / inconclusive / error) follows RB-10.3. It is not claimed to come from a SysML source page.
- Interfaces are typed physical / information / organisational. Interfaces to EXT elements (IF-003, IF-006, IF-007, IF-011) are "external" in RB-7.3's sense, but are typed by what they carry.
- FN-013 has no scenario (planning function) and PHY-006 has no interface (the medium); both are recorded decisions, and each leaves one explained Week 8 advisory. A planning scenario for FN-013 is a lead decision.
- The 1.6 peaking factor, the unit costs (aircraft USD 3.0 M, charger upgrade USD 0.4 M, new hub vertiport USD 6.0 M) and the 50–100 % resilience scale are new fictional values, introduced only in week07.ts.

## 6. Key IDs for authors of other weeks

- **Week 3 examples:** NEED-001 (wait), NEED-003 (noise), CAP-003 / CAP-010 (charging decomposition), SCN-005 (weather, with alternates) and what it discovers (NEED-011, A-008); MGO-009 / MGO-008 (goal before objective); A-007 (charger occupancy in the gap analysis).
- **Week 4/5 examples:** REQ-STK-001 → REQ-SYS-005 (wait), REQ-STK-005 → REQ-SYS-001 (charge), REQ-SYS-004 (TBD-01 / U-001 pattern). TPM-001 (charge 18/20 min, margin 2), TPM-002 (noise 63.5/65 dBA), TPM-003 (reserve 23/20 %).
- **Week 6:** R-001 (charging limit, links Week 1), R-003 (noise, mitigated by VER-002), R-008 (thermal runaway), R-006 (the "accept" example), R-004 (the "transfer" example).
- **Week 7:** DEC-001, ALT-001..004, CRIT-001..004; reversal at cost weight 0.478.
- **Week 8:** FN-006 Charge aircraft → LOG-002 → PHY-003, IF-005 (aircraft–charger power), INFO-003, AI-001 / AI-002, DEC-002. Interface N²: 14 IF (3 physical, 9 information, 2 organisational), PHY-004 degree 9, PHY-006 degree 0, 12 of 66 pairs. Corrections after the Week 8 review: IF-010..014, AI-001 on PHY-005, the INFO-003 relay, FN → SCN links (the lesson teaches the first version's gaps as review findings).
- **Week 12:** VER-001 (test), VER-003 (analysis), VER-004 (demonstration, inconclusive until U-001 closes), VER-011 (inspection).
- **Week 13 impact starting points (S04 Lab 13):**
  - "battery range decreases" → TECH-002 / R-002 / REQ-SYS-003 / TPM-003;
  - "demand doubles" → A-006 / MGO-007 / REQ-STK-004 / DEC-001;
  - "regulations change" → U-001 / REQ-STK-003.
