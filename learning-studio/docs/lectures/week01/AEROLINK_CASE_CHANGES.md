# AeroLink case data: lecture version versus the workbench and reference data

**Status.** new-pending-review. Written 2026-10-19 with the Week 1 lecture; revised the same day after the independent
review of the lecture (`_source_cache/review/week01_lecture_review.md`, findings F02–F06, F10, F11, F13, F15, F31;
dispositions in `REVIEW_DISPOSITIONS.md`).
**Purpose.** A reconciliation list. The corrected AeroLink case used by both Week 1 lecture sessions, their figures, the
lesson and the worked-examples page lives in one module, `src/content/lectures/week01/aerolinkCase.ts`. The workbench
and model reference data (`src/workbench/**`, `src/model/airtaxi.ts`, `src/model/reference/week01–03.ts`) were **not**
changed. Every difference between the two is listed below so that whoever owns the reference data can adopt, adapt or
reject each change. The **original reference statements are recorded in §3** so nothing is lost.
**Marking.** "Proposed, instructor to confirm" marks every value added beyond the existing data. AeroLink is FICTIONAL.
**Checks.** `src/content/lectures/week01/aerolinkCase.test.ts` proves the rules hold (and can fail): every need in
SEBoK form naming the system of interest, no compound need, every subject a registered stakeholder answering its own
concern, every need traced to the mission or a goal, external systems named as systems, exactly one deliberate gap,
and the method coverage derived from the data. It also checks that interest, influence, influence reasons, concern names
and owners (except the marked CON-015 and CON-017) and the eight relationships still equal the reference.

## 1. The deliberate gap (kept on purpose)

| Item | Value | Why it is kept |
|---|---|---|
| Stakeholder without a need | **STK-011 Aircraft manufacturer (OEM)** | Its only concern, CON-015, is now worded as a purely contractual matter: AeroLink’s aircraft orders, delivery slots and payment milestones under the purchase agreement. Those are obligations of the enterprise’s contracts, not something the air-taxi service does when it operates. The audit (Session 2, slide 17; lesson “auditing the set”) teaches that such a gap is defensible only when its reason is recorded. |
| The counter-argument (now a teaching point) | “The manufacturer also wants fleet operating data.” | That would be a **new** concern, not CON-015. If the enterprise agrees to share operating data, the team adds the concern and a need on the service, and the gap closes for a recorded reason (`DELIBERATE_GAP.debate`). |
| Concern without a need | CON-015 (the same gap seen from the concern side) | Every other concern (CON-001..014, 016, 017) is answered by at least one need. |

This is a stakeholder-level gap for Week 1. It is separate from DECISION_LOG W9 (NEED-011 is the reference's one
deliberately childless need, a requirement-level gap taught in Week 5), which this module does not touch.

## 2. Differences, item by item

| # | Item | Workbench / reference data (file) | Lecture case (`aerolinkCase.ts`) | Kind | Reason |
|---|---|---|---|---|---|
| 1 | Enterprise | ENT-001 "AeroLink Urban Mobility service enterprise", text "Fleet, vertiports and chargers, operations centre and passenger demand, bounded for the question of passenger waiting time" (`reference/week01.ts`) | ENT-001 "AeroLink Urban Mobility": the company and its partners (vertiport operators, utility, manufacturer, investors) sharing one mission; insurers, public transport, emergency response and the authorities in the extended enterprise | Corrected | The old entry conflated the enterprise with the system of interest; "centre" is British spelling; insurers neither share the mission nor fund the service (F31) |
| 2 | System of interest | None (merged into ENT-001) | **SOI-001** "the AeroLink air-taxi service": AeroLink controls the fleet, operations center, and booking and dispatch (narrower SoI); SOI-001 is drawn at the **wider** SoI, adding the operators’ pads and chargers and passenger demand (R92 p.327) | Proposed (ID and entry) | The SoI must be distinct from the enterprise, and the scope that claims control must not contain what AeroLink does not control (F06). New ID prefix SOI (faculty decision) |
| 3 | External system names | EXT-001 "Air navigation service provider", EXT-002 "Electric utility grid", EXT-004 "Aircraft manufacturer (OEM)", EXT-006 "Emergency services" (`reference/week01.ts`) | EXT-001 "Controlled airspace (air traffic service)", EXT-002 "Electric grid", EXT-004 "Aircraft and spares supply", EXT-006 "Emergency response service"; the stakeholder behind each is a separate `owner` field | Corrected | External systems were named after the organizations behind them, contradicting the rule the lecture teaches (F03). One label everywhere |
| 4 | External-system owners | Not recorded | EXT-001 → STK-007; EXT-002 → STK-010; EXT-004 → STK-011; EXT-006 → STK-006; EXT-003 none (natural system); EXT-005 operator not registered | Proposed | Context-based identification method; lesson context table |
| 5 | Stakeholder display names | "Vertiport Operators", "Emergency Responders" (`airtaxi.ts`) | "Vertiport operators", "Emergency responders" | Corrected (style) | Sentence case |
| 6 | **STK-015 Passengers with reduced mobility** | None | A registered **class** of stakeholders (ISO/IEC 26702 admits classes, R39a p.1631): user group, external, not approving; interest 5, influence 2, support awareness, with reasons | Proposed (new entry) | NEED-008 needs a subject that holds the concern; the advocates raised it on the class’s behalf (F10) |
| 7 | **CON-017** | None | "Travel with one’s own mobility aid", held by STK-015 | Proposed | The class’s own concern, answered by NEED-008 |
| 8 | CON-015 wording | "Fleet delivery and certification progress": orders, operating data and certification milestones | "Fleet orders and delivery milestones": orders, delivery slots and payment milestones under the purchase agreement | Corrected | The old wording made the gap contestable (operating data is something the service could provide) and muddled whose certification program was meant (F13) |
| 9 | CON-016 text | "The City planning authority is concerned …" | "The city planning authority is concerned …" | Corrected (style) | Capitalization |
| 10 | Role groups | `category` with eight values (`airtaxi.ts`) | `roleGroup` with the six course role groups of the workbench | Re-expressed | The lecture teaches the six course groups |
| 11 | Classification of STK-002, 004, 005, 008, 009, 010 | Instructor key (`CLASSIFY_ROWS`) | Same role group, side and approving status | Unchanged | — |
| 12 | Classification of STK-001, 003, 006, 007, 011, 013, 014 | Not keyed (STK-013 approving per `CANDIDATES` k13) | As before: proposed role group, side and approving status (STK-007 an authority that does **not** approve; STK-013 approves sites) | Proposed | Full register |
| 13 | Classification of STK-012 Insurers | Not keyed | **Supplier** (of insurance); previously "customer, acquirer or funder" in the lecture case | Proposed (changed) | Insurers neither buy nor fund the service (F31) |
| 14 | Register stage field | None | **Stage of main involvement** (one meaning in both sessions): Concept 002, 003, **004**, 013, 014; Development 011; Operation 001, 005, 006, 007, 008, 010, 012, 015; Logistics and maintenance 009 | Proposed (all 15) | The field used to mean "stage first found" in one session and "stage of main involvement" in the other (F05). Communities move to Concept, where siting happens |
| 15 | Table 1 prompts per stakeholder (`promptedAt`) | None | The SEBoK Table 1 stage prompts that surface each stakeholder (R11 p.552), e.g. Communities: Concept "public"; utility, ANSP, responders: Concept "owners of external systems"; technicians: Logistics and maintenance "service technicians"; insurers and advocates: none | Proposed (instructor’s reading) | The sweep figure now places each stakeholder under the stage whose prompt surfaces it (F05) |
| 16 | Role class per stakeholder (`roleClass`) | None | The MITRE role or DoD list entry each stakeholder clearly matches (R65 p.322; R63 p.235; R99 pp.51–52), or none | Proposed (instructor’s analysis) | The method-coverage table is generated from the data: sweep 13, context 5, role class 11 of 15 |
| 17 | Level of support per stakeholder | None | MITRE's scale (R63 pp.236–237): Awareness 004, 012, 013, 014, 015; Understanding 001, 002, 006, 007, 010; Buy-in 005, 008, 009; Commitment 003, 011; each with a reason | Proposed (all 15) | Influence × support map |
| 18 | Interest, influence, influence reason (STK-001..014) | `INSTRUCTOR_EXAMPLE` | Identical | Unchanged (tested) | — |
| 19 | REL-001..008 | `INSTRUCTOR_EXAMPLE.relationships` | Identical; “A is affected by B” documented as “B influences A” | Unchanged (tested) | REL-007’s arrow in the figure now runs from STK-004 to STK-013 (F26) |
| 20 | Relationship wording | `RELATIONSHIP_LABEL['conflicts-with']` = "has conflicting concerns with" | Verb "conflicts with" (display only) | Display | Shorter label for slides |
| 21 | **Need statement form** | Outcome form, no system named (e.g. "The electric utility needs the power drawn by each vertiport to stay within …") | **SEBoK form** (R11 p.555): "The [stakeholders] need **the air-taxi service** to …" for all 17 needs; the reference wording is kept in §3 | Corrected (all reference needs) | The lecture teaches SEBoK’s form and its worked solution claimed the needs passed it; they did not (F04) |
| 22 | NEED-002 trace | Parents STK-002, CON-004, CON-002 | Subject STK-002 via CON-004; **contributing source STK-001 via CON-002** | Corrected | CON-002 belongs to STK-001 |
| 23 | NEED-003 content | Noise "within the limit agreed with the city … at all operating hours" (a per-event level) | Noise **exposure** within the agreed limits on **the loudness of each event and the number of events in the evening and early morning** | Corrected | As written, NEED-003 did not trade against throughput: more departures do not raise a per-event level. Exposure carries CON-012’s “how often and at what hours”, so the conflict shares a real variable (F02) |
| 24 | NEED-004 condition | "At peak hours, at every hub vertiport." | "At every vertiport during peak hours." | Corrected | "Hub" is never defined in the Data Sheet (F32) |
| 25 | NEED-005 statement | Rationale clause inside the statement ("so that capital is neither short …") | Clause moved to the rationale | Corrected | Singular statement |
| 26 | NEED-008 statement and trace | "Passengers who use wheelchairs need …"; parents STK-014, CON-013 | "**Passengers with reduced mobility** need the air-taxi service to let them board, travel and alight without being lifted or separated from their mobility aid." Subject STK-015 via CON-017; contributing STK-014 via CON-013 | Corrected | The subject is a registered class holding its own concern (F10) |
| 27 | NEED-011 | One statement: notice and a way onward | Kept as **one end-to-end need** (notice without a way onward strands the passenger), reworded into SEBoK form; the end-to-end reason is in its rationale | Corrected (wording) | Not split, because DECISION_LOG W9 uses NEED-011’s identity in Week 5; the end-to-end versus compound distinction is taught explicitly (F11) |
| 28 | NEED-012 | None | "The city planning authority needs the air-taxi service to operate only from vertiport sites that conform to the zoning and land-use plan." Mandatory | Proposed | Approving authority with no need; split from the earlier compound draft (F11) |
| 29 | NEED-013 | None | "Pilots and remote operators need the air-taxi service to keep their workload manageable throughout every duty period." Critical | Proposed | Coverage |
| 30 | NEED-014 | None | "Insurers need the air-taxi service to make its operational risk measurable from evidence recorded on every flight." Desirable | Proposed | Coverage |
| 31 | NEED-015 | None | "Passengers need the air-taxi service to show them the full fare before they confirm a trip." Desirable | Proposed | CON-003; split from the earlier compound draft, which also asked for a “comparable” fare (ambiguous) (F11) |
| 32 | **NEED-016** | None | "The city planning authority needs the air-taxi service to operate only from vertiport sites that connect with the public transport network." Critical | Proposed | The second half of the earlier compound NEED-012 (F11) |
| 33 | **NEED-017** | None | "Passengers need the air-taxi service to offer fares that are competitive with ride-hail and public transport for the same journey." Desirable | Proposed | The second half of the earlier compound NEED-015; names public transport, which CON-003 names (F11) |
| 34 | MGO trace per need (`mgo`) | Needs do not trace to MGOs | Every need traces to MGO-001 (mission) or a goal (MGO-002, 003, 004, 009) | Proposed | SEBoK: the integrated set reflects the MGOs (R11 p.554) (F15) |
| 35 | Problem statement | None | "Cross-town trips in the region take 45–70 minutes by road at peak hours, and no service offers a quick, predictable alternative for trips of 15–40 km." | Proposed | A BMA output for the worked case; teams now write one too (F15) |
| 36 | Noise agreement | DATA_SHEET: 65 dBA pad-edge limit | 65 dBA per take-off or landing at the pad edge (Data Sheet), **plus** noise-sensitive hours (before 07:00, after 20:00 on a 06:00–22:00 day) and a cap on take-offs and landings per pad in those hours, quantified in Week 2 | Proposed | Needed for the coherent conflict (item 23) |
| 37 | Priority per need | No priority attribute | MITRE's categories (R65 p.325) applied to needs (course convention). Mandatory: 002, 003, 006, 007, 009, 010, 012. Critical: 001, 004, 008, 013, 016. Desirable: 005, 011, 014, 015, 017. Optional: none | Proposed (all 17) | — |
| 38 | Need rationales | Parenthetical traces, e.g. "(CON-001, A-001)" | Traces removed (the trace is a field); NEED-011 keeps "(exposed by scenario SCN-005)" | Display | Avoid duplicating the trace |
| 39 | Conflict adjudication | REL-002 recorded only | `CONFLICT`: NEED-001 and NEED-004 against NEED-003; shared variable **take-offs and landings per pad in the evening and early-morning hours**; four-step protocol (record, analyze in the Week 3 trade inside both limits, negotiate, escalate) | Proposed (course convention after R65 p.325) | Coherent conflict (F02) |
| 40 | Second tension | Not recorded | NEED-005 against NEED-010; not yet a REL entry | Proposed | Audit teaching point |
| 41 | Elicitation plan | None | Technique choices for STK-004, 002, 009, 001, 010 | Proposed | — |

## 3. Original reference need statements (kept for reconciliation)

From `src/model/reference/week03.ts` (unchanged there):

| ID | Reference statement | Reference parents |
|---|---|---|
| NEED-001 | Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours. | STK-001, CON-001 |
| NEED-002 | The FAA needs assurance that every flight is conducted within the approved airworthiness, energy and weather limits, including when weather changes during the day. | STK-002, CON-004, CON-002 |
| NEED-003 | Communities near vertiports need take-off and landing noise kept within the limit agreed with the city, at every pad, at all operating hours. | STK-004, CON-012 |
| NEED-004 | Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit. | STK-005, CON-006 |
| NEED-005 | Investors need service capacity to grow in step with demand so that capital is neither short when demand arrives nor idle when it does not. | STK-003, CON-005 |
| NEED-006 | Emergency responders need early warning of, and safe access to, a battery fire at a vertiport. | STK-006, CON-007 |
| NEED-007 | Maintenance technicians need the condition of each aircraft to be known before it is released for a flight, regardless of schedule pressure. | STK-009, CON-010 |
| NEED-008 | Passengers who use wheelchairs need to board, travel and alight without being lifted or separated from their mobility aid. | STK-014, CON-013 |
| NEED-009 | The air navigation service provider needs each flight's intended route and time known before the aircraft enters controlled airspace. | STK-007, CON-008 |
| NEED-010 | The electric utility needs the power drawn by each vertiport to stay within the agreed connection capacity at all times. | STK-010, CON-011 |
| NEED-011 | Passengers need prompt notice whenever their trip is held, diverted or cancelled, and a usable alternative way to complete their journey. | STK-001, CON-001 |

The first lecture version (2026-10-19, before the review) also carried two compound proposed needs, now split:
NEED-012 "… to conform to the zoning and land-use plan and to connect with public transport" (now NEED-012 and
NEED-016) and NEED-015 "… to know the full fare before they confirm a trip, and need it to be comparable with what the
same journey costs by ride-hail" (now NEED-015 and NEED-017).

## 4. Reference-data spelling still to fix (outside this module)

- `reference/week01.ts` ENT-001: "operations centre".
- `reference/week02.ts` R-001 and the O-001 link rationale: "utilisation".
- `reference/week03.ts` MGO-003 "Goal: be a good neighbour" (the case module writes "Be a good neighbor"); MGO-007 "utilisation"; the SCN actor list "Operations centre duty manager".

## 5. Consequences to check before adopting the changes

1. **Need counts (DECISION_LOG W9 and later weeks).** Adopting NEED-012..017 raises the reference needs from 11 to 17.
   Weeks 3–5 count needs, capabilities and requirements, and W9 keeps NEED-011 as the one deliberately childless need for
   the Week 5 trace audit. Six new needs without child requirements would add six childless needs to that audit unless
   requirements (and capabilities) are added for them. Faculty decision.
2. **Noise downstream.** CAP-007 ("pad-edge noise stays within the local agreement") and MGO-006 ("zero events above
   65 dBA") cover the per-event level only. If NEED-003’s exposure wording is adopted, Week 3 should add an objective
   and measure for the evening and early-morning event cap.
3. **Stakeholder count.** STK-015 raises the register from 14 to 15; pages that say "fourteen stakeholders" (for example
   the Week 1 worked-examples page intro) and `INSTRUCTOR_EXAMPLE` need the class added if it is adopted.
4. **ID scheme.** SOI-001 introduces a new prefix; `TEAM_RECORD` and `MODEL_INPUTS` currently use ENT-001 for both the
   enterprise and the system of interest. CON-017 and STK-015 are new IDs.
5. **External-system names.** The workbench context tools still show the organization names for EXT-001, 002, 004, 006.
6. **Workbench checks.** `CLASSIFY_ROWS` would gain nine rows (including STK-015); the Team Record's needs part already
   requires a priority and a registered subject; it does not yet require the SEBoK form or an MGO trace.
7. **Week 8 import.** Stakeholders, concerns and the support attribute feed the Phase II model; the support levels are
   proposed values and should be confirmed before they are modeled.
