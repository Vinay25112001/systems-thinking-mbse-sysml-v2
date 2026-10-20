# AeroLink canonical data: plan and check

Status: adopted for the Week 1 final review (DECISION_LOG A21, item 6, "corrected AeroLink data propagated"). AeroLink
Urban Mobility is FICTIONAL; every value is a teaching value. Scope: the stakeholder, concern, need and mission-goal
layer, and the names that depend on it.

## 1. One source

`learning-studio/src/content/lectures/week01/aerolinkCase.ts` is the **course source** for:

| Data | Ids | Notes |
|---|---|---|
| Stakeholders | STK-001..015 | STK-015 *Passengers with reduced mobility* (a class) added in Week 1 |
| Concerns | CON-001..017 | CON-015 reworded (purchase agreement, the deliberate audit gap); CON-017 added |
| Needs | NEED-001..017 | the recommended form "The [stakeholders] need the air-taxi service to …"; NEED-003 carries both noise dimensions; NEED-012..017 added or split |
| Mission and goals | MGO-001..004, MGO-009 | as in the reference (`reference/week03.ts`), American spelling |
| Enterprise, system of interest, external systems | ENT-001, SOI-001 (proposed), EXT-001..006 | external systems named as systems; the organization behind each is a stakeholder |
| Need priority | `labBrief.ts NEED_PRIORITIES` | MITRE's categories (R65 p.325): mandatory, critical, desirable, optional |

Rules for later weeks:

1. A later week that shows a stakeholder, concern, need or goal **imports it from `aerolinkCase.ts`** (as the Week 2
   outline already does). It never retypes the text and never invents a STK, CON or NEED id.
2. The instructor reference baseline (`src/model/reference/weekNN.ts`) and the SysML reference files
   (`sysml/reference/aerolink_v01..v04`) keep their **pre-revision** values until the week that owns each layer rebuilds
   it. Each such difference is listed, with the week that fixes it, in the allowlist `PRE_REVISION` of the test below.
3. When a week fixes a layer, it updates the baseline (and the SysML files with it: `sysmlDrift.test.ts` checks that they
   agree) and **removes** the allowlist entry. The test fails if an entry no longer differs, so the list cannot go stale.
4. `docs/lectures/week01/AEROLINK_CASE_CHANGES.md` keeps the item-by-item history (§2), the original statements (§3) and
   the consequences (§5) this plan resolves.

## 2. Downstream ids that change, and the week that changes them

| Id(s) | Where | What changes | Fix in |
|---|---|---|---|
| NEED-001..011 (statement) | `reference/week03.ts` | replace the pre-revision wording with the case statement | Week 2 (requirements trace to the case statement) |
| NEED-003 (name) | `reference/week03.ts` | "Noise exposure within the local agreement" | Week 2 |
| NEED-008 (trace) | `reference/week03.ts` links | subject STK-015 via CON-017; STK-014/CON-013 contributing | Week 2 |
| NEED-012..017 | `reference/week03.ts` | add the needs; capabilities proposed in the Week 2 outline (siting, workload, risk evidence, fares) | Week 2 |
| CAP-007 | `reference/week03.ts` | "within both agreed limits" (level of each event and number of evening and early-morning events) | Week 2 |
| REQ-STK-002 | `reference/week04.ts` | per-event limit stays; add a requirement for the event cap (TBD, quantified with the city) | Week 2 |
| MGO-006 | `reference/week03.ts` | add an objective and measure for the event cap | Week 3 (**done**: `eventCap` attribute from `week03/aerolinkCase.ts` EVENT_CAP; allowlist entry removed) |
| MOE-003 | `reference/week05.ts` | measure the event cap as well as compliance with the level | Week 3 (**done**: reported in two parts, with MOE-007; allowlist entry removed) |
| TPM-002 | `reference/week05.ts` | decide whether the event cap needs its own TPM (aircraft LAmax alone covers the level) | Week 3 (**done**: no TPM for the cap; REQ-SYS-011 and MOP-010 cover it; allowlist entry removed) |
| STK-015, CON-017 | `reference/week02.ts`, `sysml/reference/aerolink_v01` | add the class and its concern; part def and concern in the model | Week 8 |
| CON-015 (name) | `reference/week02.ts`, SysML | "Fleet orders and delivery milestones" | Week 8 |
| ENT-001 (name) | `reference/week01.ts`, SysML | enterprise "AeroLink Urban Mobility"; system of interest SOI-001 "the AeroLink air-taxi service" | Week 8 |
| EXT-001, 002, 004, 006 (names) | `reference/week01.ts`, `reference/week08.ts` interface ends, SysML v01..v04 | named as systems (Controlled airspace (air traffic service), Electric grid, Aircraft and spares supply, Emergency response service) | Week 8 |

Not in scope: element-level noise measures of a single event (MOP-004 aircraft LAmax, REQ-SYS-002) legitimately bound
the level only. Need counts: adopting NEED-012..017 raises the reference needs from 11 to 17; DECISION_LOG W9 (NEED-011
as the one deliberately childless need) must be revisited by faculty when Week 2 adds their children.

## 3. The check

`learning-studio/src/content/lectures/week01/aerolinkCanonical.test.ts` (vitest) fails when:

- any later-week reference element or link (`src/model/reference/week02..`), any week module (`src/content/weeks/week02..`),
  any later-week lecture (`src/content/lectures/week02..`) or any SysML reference file cites a STK, CON or NEED id that is not in `aerolinkCase.ts` (REQ-STK ids are not read as
  stakeholders);
- a case id is missing from the reference baseline, a name or need statement differs, a reference need trace contradicts
  the case (a link to a non-source, or the subject not linked), a service-level noise element that claims NEED-003 (and
  MGO-006, TPM-002) lacks the event-cap dimension, or the ENT/EXT names differ;
- **unless** the difference is in `PRE_REVISION` with its fixing week; and also when a listed exception no longer differs.

Run: `npx vitest run src/content/lectures/week01/aerolinkCanonical.test.ts`.
