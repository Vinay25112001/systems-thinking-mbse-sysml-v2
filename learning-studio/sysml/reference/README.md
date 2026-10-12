# AeroLink instructor reference model (SysML v2)

This is the instructor reference SysML v2 model of the fictional AeroLink Urban Mobility air-taxi enterprise. It is the critical-path artefact for Weeks 9–14, the practical model exam (RB-14) and checkpoints CP4 and CP5.

The model content comes from the instructor reference baseline in `src/model/reference/week01.ts` to `week12.ts`; see `docs/authoring/reference_model_notes.md`. The model adds no new numbers. **Every value is FICTIONAL.**

All four files are accepted by the course-designated checker: the OMG SysML v2 Pilot Implementation, release 2026-08, kernel 0.62.0. They pass with **zero errors and zero warnings**; the output is at the end of this file.

## 1. Files

Each file is self-contained, because the checker validates every file on its own (`docs/SYSML_TOOLCHAIN.md`). So each version repeats the earlier content and then adds its own layer; it does not import the earlier file.

| File | Level | Contains (in addition to the previous file) | Lines | IDs declared |
|---|---|---|---|---|
| `aerolink_v01_skeleton.sysml` | L9 skeleton | <ul><li>The L9 package structure.</li><li>ENT and EXT in the context part.</li><li>14 STK as part defs; 16 CON as concerns with `stakeholder` declarations.</li><li>9 MGO and 11 NEED as requirements, with `stakeholder` and `frame`. MGO `doc` carries level, measure, target, unit and horizon; NEED `doc` carries conditions and rationale.</li><li>10 CAP as action defs; 5 SCN as use cases with actors (kind, trigger, actors, preconditions, flows in `doc`; success and failure end states in the objective).</li><li>8 PHY part defs and usages with ISQ/SI-typed attributes.</li><li>Derivations, refinements and dependencies among these elements.</li></ul> | 492 | 80 |
| `aerolink_v02_req_structure.sysml` | L10 / CP4 | <ul><li>All 20 requirements (10 REQ-STK, 10 REQ-SYS). Each has a subject, its ID as short name, `doc` text and a `require constraint`. The weather and grid TBDs have a constraint but no value.</li><li>Requirement attributes and rationale as metadata; `@StatusInfo` with `tbd` for the TBD-01 and TBD-02 requirements.</li><li>Two requirement groups.</li><li>Logical architecture: 7 LOG, 2 AI and 14 FN, with `perform`.</li><li>11 port defs, 14 interface defs and 14 IF interface usages (`connect`); 5 INFO item defs with 7 item flows.</li><li>10 `satisfy` (one per REQ-SYS) and 41 `allocation`s (FN→PHY, LOG→PHY, REQ→FN, AI→PHY).</li><li>27 `#derivation` connections and dependencies for every parent link.</li></ul> | 1086 | 142 |
| `aerolink_v03_behavior.sysml` | L11 | <ul><li>SCN-002 Passenger Transport Mission as an action flow, numbered as its main flow: 3 decisions (ANSP acceptance, party check, pad check), 3 merges, and 4 steps that subset FN usages.</li><li>`AircraftOperatingStates`: 5 states, 8 transitions with `accept` triggers and one guard.</li><li>`do` and `entry` performances of FN-005, FN-006 and FN-008.</li><li>`exhibit` by PHY-001; `perform` of SCN-002 by the system of interest.</li></ul> | 1155 | 142 |
| `aerolink_v04_full.sysml` | L12 / CP5 | <ul><li>11 verification cases. Each has `@VerificationMethod`, a subject, an objective with `verify`, recorded-result attributes and a computed `verdict`.</li><li>6 MOE (`#moe`) and 9 MOP (`#mop`) attributes; 3 TPM.</li><li>3 TECH with TRL.</li><li>20 AROU items as named metadata. Risks specialise `RiskMetadata::Risk`.</li><li>ALT, CRIT and DEC-001 as a `TradeStudies::TradeStudy` analysis; DEC-002.</li><li>All 381 baseline links realised.</li></ul> | 1680 | 204 (= the whole baseline) |

Element counts in v0.4, by kind: ENT 1, EXT 6, STK 14, CON 16, MGO 9, NEED 11, CAP 10, SCN 5, REQ 20, MOE 6, MOP 9, TPM 3, TECH 3, A 8, R 8, O 2, U 2, ALT 4, CRIT 4, DEC 2, FN 14, LOG 7, PHY 8, IF 14, INFO 5, AI 2, VER 11. These are exactly the counts in reference_model_notes.md §1.

Relationship counts in v0.4:

| Relationship | Count |
|---|---|
| `satisfy` | 10 |
| `allocation` | 41 |
| `#derivation` connections | 27 |
| `#derivesFrom` dependencies | 70 |
| `#refinement` dependencies | 3 |
| `#satisfies` dependencies | 5 |
| `#flowsTo` dependencies | 7 |
| `#measures` dependencies | 41 |
| `#mitigates` dependencies | 12 |
| `#affects` dependencies | 13 |
| `stakeholder` declarations | 27 |
| `frame` | 20 |
| actors | 5 |
| `perform` (LOG/AI → FN) | 16 |
| item flows | 7 |
| `verify` | 11 |
| AROU metadata annotations | 20 |

`src/model/reference/sysmlMapping.test.ts` guards the correspondence between these files and the baseline:

- every REQ ID is a short name in v0.2 and v0.4, and every REQ-SYS has a `satisfy`;
- every `satisfy` is backed by a baseline `satisfies` link;
- v0.4 declares each of the 204 baseline IDs exactly once;
- every VER is a verification case with an objective, a `verify` and a verdict;
- all 381 baseline links are realised in v0.4, in the forms of §3;
- v0.1–v0.3 realise exactly the links whose ends exist at their level;
- the five demonstration threads are complete hop by hop;
- mutation assertions show that a removed ID, `satisfy`, `verify` or dependency is detected.

`src/model/reference/sysmlDrift.test.ts` is the drift check (added 2026-10-11; it replaces the one-off script used for the first batch of changes). For every baseline element, in every file that declares it, it checks that the declaration carries the element's name and text, the free-text attributes (rationale, criterion, scenario flows, AROU treatment, …), for an IF its type, `Carries:` list and the two ends of its `connect`, for an INFO its producer, consumer, decision and recorded relay, and for an AI the four `@AIEnabledCapability` values. Typographic characters are compared in their ASCII spelling. Mutation assertions show that each kind of drift is detected.

If you change a file, re-run the checker and both tests.

Validate from `learning-studio/`:

```bash
npm run content:sysml -- sysml/reference
npx vitest run src/model/reference/sysmlMapping.test.ts src/model/reference/sysmlDrift.test.ts
```

## 2. Package structure (L9)

Root package: `'AeroLink Reference Model'`.

| Package | Holds |
|---|---|
| `Context` | `'ENT-001'` (`AeroLinkEnterprise`, which also owns the MOE attributes); the EXT part defs; the context part `aeroLinkContext`. That part contains `ref part systemOfInterest :> Physical::aeroLink`, the six EXT usages, the external interfaces IF-003, IF-006, IF-007 and IF-011, and the weather item flow (carried by IF-011). |
| `Stakeholders` | STK part defs, CON concerns |
| `Needs` | MGO and NEED requirements, CAP action defs |
| `Requirements` | REQ-STK, REQ-SYS and the two groups `stakeholderRequirements` and `systemRequirements` |
| `Logical` | FN action usages, LOG part defs, `logicalArchitecture` (LOG and AI parts) |
| `Physical` | INFO and other item defs, port defs, interface defs, PHY part defs, and `aeroLink` (the system of interest: PHY parts, internal interfaces, item flows) |
| `Behavior` | SCN use cases; from v0.3 the SCN-002 flow and `AircraftOperatingStates` |
| `Verification` | VER verification cases (v0.4) |
| `AROU` | A, R, O and U metadata (v0.4) |
| `Measures` | TPMs (v0.4) |
| `Analysis` | TECH, ALT, CRIT, DEC (v0.4) |
| `Traceability` | Course links realised as separate relationships, grouped by link type. Each is named `'<source> <link type> <target>'`. |

`Measures`, `Analysis` and `Traceability` are additions to the nine L9 packages.

## 3. Modelling decisions

### 3.1 IDs and names (C.2 rule 3)

Every course ID is a short name written as a quoted unrestricted name, for example `requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min'` (S06 p.49–50, p.165). The official name, quoted where it is not a basic name, is the declared name. References use the short name, for example `Requirements::'REQ-SYS-001'` and `Physical::aeroLink.'PHY-003'`. The checker resolves short names in qualified names and feature chains; mutations confirm this (§6).

Where the ID sits:

- **On the usage** for elements that are positions in a structure: EXT, LOG, AI, PHY and IF. For example, `part <'PHY-001'> aircraft : EVTOLAircraft[12]`.
- **On the definition** for types: ENT, STK, CAP, INFO, TECH and CRIT.
- **On the usage** for requirements, scenarios, functions, verification cases and analyses.

### 3.2 Element kinds

| Kind | Realisation | Why |
|---|---|---|
| ENT | `part def <'ENT-001'> AeroLinkEnterprise`. It is the subject type of every REQ-STK, NEED, MGO and CON, and the owner of the MOE attributes. | C.2 "top-level package / part" |
| EXT | `part <'EXT-n'>` in `Context::aeroLinkContext`, typed by a part def | C.2 "part or actor". Use cases use the def as the actor type. |
| STK | `part def <'STK-n'>`, used as the `stakeholder` type in concerns and needs and as the actor type in use cases | C.2 "part def + stakeholder usage"; S10 p.115 |
| CON | `concern` with `subject` and `stakeholder` | S10 p.115 |
| MGO, NEED | `requirement` with subject enterprise, `stakeholder` and `frame`. MGO objectives carry their target values; the `doc` gives the level and, for objectives, the measure (MOE), target, unit and horizon. A NEED `doc` gives its conditions and rationale. | C.2 |
| CAP | `action def` | C.2 leaves the choice to the team. A capability is an ability to perform, and FNs derive from it. |
| SCN | `use case` with subject, actors and objective (success and failure end states). The full text (kind, official S04 ID, trigger, actors with the primary marked, preconditions, main and alternate flows) is in `doc`. The `actor` usages realise the baseline `performs` links only, so they are not the full actor list. | C.2 |
| REQ | `requirement` usage with subject, `doc` statement, `require constraint`, `@RequirementAttributes` (level, type, method as `VerificationMethodKind`, criterion), `@Rationale` and, for TBD-01 and TBD-02, `@StatusInfo { status = StatusKind::tbd; }` | S10 p.86–91; S06 p.165; library `ModelingMetadata` |
| FN | `action <'FN-n'>` in `Logical`. LOG and AI perform it; the SCN-002 steps subset it. | C.2 "action def / logical part"; usages, so that `perform` and `allocate` can reference them |
| LOG, AI | parts of `Logical::logicalArchitecture`. AI also carries `@AIEnabledCapability` (inputs, outputs, human oversight, failure mode). | C.2 |
| PHY | parts of `Physical::aeroLink` with ISQ/SI-typed attributes and ports | C.2; L9 |
| IF | `interface <'IF-n'> : <InterfaceDef> connect a.port to b.port`. The type (physical, information, organisational) and what it carries are in `doc`. | C.2; S10 p.22 |
| INFO | `item def <'INFO-n'>` carried by ports. Producer, consumer and decision supported are in `doc`. | C.2 |
| VER | `verification <'VER-n'>` with `@VerificationMethod { kind = ... }`, subject, `objective { verify ... }`, recorded-result attributes and `return verdict : VerdictKind = ...` (`PassIf`, `inconclusive`) | S10 p.96–99; library `VerificationCases` |
| MOE, MOP | `#moe` / `#mop attribute` (library `ParametersOfInterestMetadata`). MOEs are owned by the enterprise. Each MOP is owned by the definition whose value it measures, and it is the same attribute the requirement constraint tests: for example, REQ-SYS-001 constrains `ChargingSystems::'MOP-002' chargeTimeToDispatch`. | C.2 (S10 sl.149) |
| TPM | `attribute <'TPM-n'>` with `threshold`, `objectiveValue`, `currentEstimate`, `margin` and `@TechnicalPerformanceMeasure { basis }` | No library TPM metadata exists |
| TECH | `part def <'TECH-n'>` with `trl` and `trlMeaning` | C.2 |
| A, R, O, U | Named metadata annotations, `metadata <'R-001'> '…' : CourseRisk about …`. `CourseRisk :> RiskMetadata::Risk`: `totalRisk = new RiskLevel(probability = likelihood/5, impact = consequence/5)`, plus `likelihood`, `consequence`, `owner`, `handling`, `treatment` and `trigger`. A, O and U use local metadata defs. | C.2 "metadata (Risk) or dependency"; S06 9.3.3 |
| ALT | `part <'ALT-n'> : CapacityAlternative` with the four raw criterion scores | S10 p.95 |
| CRIT | `calc def <'CRIT-n'>`: the linear value function, clamped. The weight is in `doc` and on DEC-001. | S10 p.95 |
| DEC | DEC-001 is `analysis : TradeStudy` with subject `('ALT-001', …, 'ALT-004')`, `MaximizeObjective`, and an evaluation function equal to the weighted sum of the CRIT value functions (weights 0.40/0.30/0.16/0.14), plus `@Rationale`. DEC-002 is an `analysis` record with `@Rationale`. | S10 p.95; library `TradeStudies` |

### 3.3 Course relationship types (C.2 rules 2 and 4)

Only `satisfy`, `verify`, `allocate` and `dependency` are SysML keywords. The other course link types use the library where it has a matching concept. Where it does not, they use a `dependency` tagged with a local semantic metadata def. Every tag is declared at the root: `#derivesFrom`, `#affects`, `#mitigates`, `#measures`, `#flowsTo` and `#satisfies`. Each one restricts `annotatedElement` to `SysML::Dependency`. Every such relationship is named `'<source> <link type> <target>'`, so an audit can find any link by text search.

| Course link (n in baseline) | Realisation |
|---|---|
| derives-from (144) | <ul><li>**CON→STK and NEED→STK** (27): `stakeholder name : 'STK-n';` in the concern or need.</li><li>**NEED→CON and MGO→CON** (20): `frame Stakeholders::'CON-n';`. A requirement framing a concern is S10's form for "addresses the concern".</li><li>**Requirement→requirement** (MGO→MGO, REQ-STK→NEED, REQ-SYS→REQ-STK; 27): library `#derivation connection '…' { end #original ::> parent; end #derive ::> child; }` (S06 p.651; `RequirementDerivation`).</li><li>**All other pairs** (CAP→NEED, SCN→CAP, REQ→CAP, FN→CAP, FN→SCN, TPM→MOP, CRIT→MOE; 70): `#derivesFrom dependency '…' from child to parent;`.</li></ul> |
| refines (3) | `#refinement dependency` (library `ModelingMetadata::Refinement`; client = the refining CAP) |
| satisfies (15) | <ul><li>`satisfy Requirements::'REQ-SYS-n' by <conforming design element>;`: 10, one per REQ-SYS, by the PHY or LOG element typed by the requirement's subject definition.</li><li>The 5 links whose satisfier does not conform to the subject (IF-005, IF-006, IF-007, IF-003; PHY-002 for REQ-STK-007) use `#satisfies dependency`. See §4.</li></ul> |
| allocated-to (41) | `allocation '…' allocate <source> to <target>;` (FN→PHY, LOG→PHY, REQ→FN, AI→PHY) |
| performs (21) | <ul><li>LOG/AI→FN (16): `perform Logical::'FN-n';` in the performer.</li><li>STK/EXT→SCN (5): `actor` in the use case.</li></ul> |
| flows-to (18) | <ul><li>Item flows `flow 'PHY-a flows-to INFO-n flows-to PHY-b' of 'INFO-n' from a.port.item to b.port.item;`. There are 7 flows; each realises the producer and consumer links, 11 links in all.</li><li>Links without a port-to-port flow (to or from AI, DEC, or LOG-002; PHY-007→INFO-005; 7) use `#flowsTo dependency`.</li></ul> |
| verifies (11) | `verify Requirements::'…';` in the verification-case objective |
| measures (41) | `#measures dependency` from the `#moe`/`#mop` attribute (or TPM) to the measured element |
| mitigates (12) | `#mitigates dependency` from the mitigating element to the AROU risk metadata (`AROU::'R-n'`) |
| affects (75) | <ul><li>From an AROU item (62): the item's metadata is **about** the affected elements.</li><li>From TECH, DEC or EXT (13): `#affects dependency`.</li></ul> |

**`satisfy` semantics.** A `satisfy` *asserts* that the design satisfies the requirement (S06 p.168). The 10 `satisfy` usages record the baseline's design claim. For REQ-SYS-001, -002 and -003 the bound values are the TPM current estimates: 18 min, 63.5 dB, 0.23. The other satisfiers leave the measured value unbound until verification.

REQ-SYS-004 and REQ-SYS-010 are asserted while their limits are still TBD (U-001, U-002). The matching VER-004 and VER-010 therefore return `inconclusive` (`approvedLimitSet = false`, `limitAgreed = false`). This is the baseline's intended teaching point.

## 4. The five demonstration threads (reference_model_notes.md §2), hop by hop in v0.4

Each hop is the SysML relationship you follow:

| Hop | How to follow it |
|---|---|
| STK > NEED | `stakeholder` in the NEED |
| NEED > CAP | `#derivesFrom` |
| CAP > REQ | `#derivation` and/or `#derivesFrom` |
| REQ > FN | `allocation` |
| FN > LOG | `perform` in the LOG |
| LOG > PHY | `allocation` |
| PHY > INFO | item flow |
| REQ > VER | `verify` |
| REQ > MOP | `#measures` |
| R | AROU metadata `about`, or `#mitigates` |

`sysmlMapping.test.ts` asserts each of these hops.

1. **STK-005 > NEED-004 > CAP-003 > REQ-SYS-001 > FN-006 > LOG-002 > PHY-003 > INFO-003 > VER-001 > MOP-002 > R-001**
   `stakeholder` STK-005 in NEED-004; `#derivesFrom 'CAP-003 derives-from NEED-004'`; `#derivation 'REQ-SYS-001 derives-from REQ-STK-005'` + `#derivesFrom dependency 'REQ-STK-005 derives-from CAP-003'`; `allocation 'REQ-SYS-001 allocated-to FN-006'`; `perform Logical::'FN-006'` in LOG-002; `allocation 'LOG-002 allocated-to PHY-003'`; item flow `'PHY-003 flows-to INFO-003'...`; `verify Requirements::'REQ-SYS-001'` in VER-001; `#measures 'MOP-002 measures REQ-SYS-001'`; `R-001` metadata `about` `CAP-003`.
2. **STK-004 > NEED-003 > CAP-007 > REQ-SYS-002 > FN-005 > LOG-001 > PHY-001 > INFO-002 > VER-002 > MOP-004 > R-003**
   `stakeholder` STK-004 in NEED-003; `#derivesFrom 'CAP-007 derives-from NEED-003'`; `#derivation 'REQ-SYS-002 derives-from REQ-STK-002'` + `#derivesFrom dependency 'REQ-STK-002 derives-from CAP-007'`; `allocation 'REQ-SYS-002 allocated-to FN-005'`; `perform Logical::'FN-005'` in LOG-001; `allocation 'LOG-001 allocated-to PHY-001'`; item flow `'PHY-001 flows-to INFO-002'...`; `verify Requirements::'REQ-SYS-002'` in VER-002; `#measures 'MOP-004 measures REQ-SYS-002'`; `R-003` metadata `about` `REQ-SYS-002`.
3. **STK-002 > NEED-002 > CAP-004 > REQ-SYS-003 > FN-003 > LOG-001 > PHY-001 > INFO-002 > VER-003 > MOP-005 > R-002**
   `stakeholder` STK-002 in NEED-002; `#derivesFrom 'CAP-004 derives-from NEED-002'`; `#derivesFrom dependency 'REQ-SYS-003 derives-from CAP-004'`; `allocation 'REQ-SYS-003 allocated-to FN-003'`; `perform Logical::'FN-003'` in LOG-001; `allocation 'LOG-001 allocated-to PHY-001'`; item flow `'PHY-001 flows-to INFO-002'...`; `verify Requirements::'REQ-SYS-003'` in VER-003; `#measures 'MOP-005 measures REQ-SYS-003'`; `R-002` metadata `about` `REQ-SYS-003`.
4. **STK-009 > NEED-007 > CAP-006 > REQ-SYS-008 > FN-008 > LOG-003 > PHY-005 > INFO-003 > VER-008 > MOP-007 > R-002**
   `stakeholder` STK-009 in NEED-007; `#derivesFrom 'CAP-006 derives-from NEED-007'`; `#derivation 'REQ-SYS-008 derives-from REQ-STK-006'` + `#derivesFrom dependency 'REQ-STK-006 derives-from CAP-006'`; `allocation 'REQ-SYS-008 allocated-to FN-008'`; `perform Logical::'FN-008'` in LOG-003; `allocation 'LOG-003 allocated-to PHY-005'`; item flow `'PHY-005 flows-to INFO-003'...`; `verify Requirements::'REQ-SYS-008'` in VER-008; `#measures 'MOP-007 measures REQ-SYS-008'`; `R-002` metadata `about` `CAP-006`.
5. **STK-001 > NEED-001 > CAP-002 > REQ-SYS-005 > FN-002 > LOG-005 > PHY-004 > INFO-001 > VER-005 > MOP-001 > R-007**
   `stakeholder` STK-001 in NEED-001; `#derivesFrom 'CAP-002 derives-from NEED-001'`; `#derivesFrom dependency 'REQ-SYS-005 derives-from CAP-002'`; `allocation 'REQ-SYS-005 allocated-to FN-002'`; `perform Logical::'FN-002'` in LOG-005; `allocation 'LOG-005 allocated-to PHY-004'`; item flow `'INFO-001 flows-to PHY-004'...`; `verify Requirements::'REQ-SYS-005'` in VER-005; `#measures 'MOP-001 measures REQ-SYS-005'`; `R-007` metadata `about` `REQ-SYS-005`.

## 5. What could not be expressed, and why

- **No native risk, assumption, opportunity or unknown element.**
  - The library `RiskMetadata::Risk` holds only probability and impact levels in 0..1. The course 5×5 ratings are therefore mapped to probability = L/5 and impact = C/5, and owner, handling, treatment and trigger are local extension attributes of `CourseRisk`.
  - AROU items are named metadata annotations. They can be referenced (as `mitigates` targets), but they are annotations, not structural elements.
- **No standard relationship for measures, affects, mitigates or flows-to without ports.** `ParametersOfInterestMetadata` marks attributes as MOE or MOP but does not say *what* they measure, so these links are tagged dependencies. Dependencies carry no semantics the checker can evaluate; they are traceability only.
- **`satisfy` by an interface, or by PHY-002 for REQ-STK-007.** `satisfy … by x` binds x to the requirement subject. An interface usage, or PHY-002 against the enterprise subject, does not conform, and the checker warns "Bound features should have conforming types" (seen in probing). These 5 baseline links are therefore `#satisfies` dependencies. Each REQ-SYS still has exactly one asserting `satisfy`.
- **Organisational interfaces.** IF-004 and IF-009 are modelled as interfaces that carry work orders and pad-slot allocations. SysML has no organisational kind of interface.
- **Units with no ISQ quantity.**
  - dB(A) LAmax uses `SoundPressureLevelValue` in `[dB]`. A-weighting and LAmax are in `doc` only, because ISO 80000 forbids decorating unit symbols.
  - Percentages are `Real` fractions 0..1.
  - trips/day, USD M and movements/h are `Real` with the unit in `doc`.
  - The trade-study raw scores and value functions use `Real`.
- **Nothing is evaluated.** The checker does not evaluate constraints, verdicts or the trade study (`docs/SYSML_TOOLCHAIN.md`, Limitations). The expected selection, ALT-004 at 0.670 (ALT-002 0.489, ALT-003 0.458, ALT-001 0.452), is recorded in DEC-001's `@Rationale`. It was recomputed from the modelled value functions while this model was built.
- **The `error` verdict.** It means "procedure not executed as planned", so it is recorded by the test conductor and not computed. VER-001, -002, -003, -005 and -006 compare the recorded result with the requirement attribute (for example `Requirements::'REQ-SYS-001'.maxChargeTime`). The others use the counts and limits of their success criteria as literals (for example VER-007's 16 and 17 min, VER-004's 20 of 20 holds).
- **TBD values** (TBD-01 weather limits, TBD-02 grid limit) are declared but deliberately left without a value.
- **Provenance, owner and link IDs** (`LNK-…`) from the app model are not carried. They could be added as metadata if the lead wants them.
- **Single-file validation.** Each version repeats the earlier content instead of importing it, because the checker validates files in isolation.
- **SCN choice.** L11 in the lab plan names SCN-001 for the action flow. The task allowed SCN-002 (or SCN-001), and SCN-002 (the nominal mission, S04 Lab 7) is the scenario with the richer alternate flows. SCN-001 is a use case without a flow.

## 6. Checks run while building

- Every construct was first checked in probe files.
- 20 single-change mutations of v0.4 were each rejected by the checker. They covered:
  - a `satisfy` target;
  - a derivation end;
  - an allocation end;
  - a `verify`;
  - a metadata `about` target;
  - a `mitigates` target;
  - a flow item type;
  - a `perform`;
  - a state `do` action;
  - a CRIT call in the trade study;
  - a `stakeholder` type;
  - a `frame`;
  - a constraint feature;
  - a `measures` source;
  - an actor type;
  - an `exhibit`;
  - a decision target;
  - a unit;
  - an interface end;
  - a verdict reference.
- This confirms that short-name references are really resolved.

## 7. Baseline gaps and inconsistencies (noted, not changed)

1. *Resolved 2026-10-11.* IF-002 used to list "INFO-002, INFO-003" although the baseline has no `PHY-001 flows-to INFO-003` link. The baseline's IF-002 now carries INFO-002 only (INFO-002 includes the health and fault reports), as the model always did. INFO-003 reaches PHY-004 from PHY-005 over IF-012 and from PHY-003 over IF-010.
2. **reference_model_notes.md §2, "Caution for live demonstration"**, says `threadsFrom` takes the *first* INFO linked to a PHY. `engineering.ts` now prefers the INFO related to the thread's FN or LOG, or the INFO that feeds a decision, so the caution is out of date.
3. **Subject mismatches in VER-011 and REQ-STK-007.**
   - VER-011's subject is "PHY-002 with PHY-001 cabin door", but it verifies REQ-STK-007, whose subject is the enterprise. The verification case therefore uses the enterprise subject, and the PHY-002 focus is in `doc`.
   - For the same reason, `PHY-002 satisfies REQ-STK-007` is a `#satisfies` dependency (see §5).
4. **REQ-SYS-003** has no REQ-STK parent; it derives only from CAP-004. This is allowed by LINK_RULES, but it is the only REQ-SYS without a stakeholder requirement parent.
5. **INFO-005 Financial Data** has a logical producer (LOG-002) and a decision consumer (DEC-001), so it has no port-to-port flow.
6. **MOE-005 and MOE-006** have no threshold. **MOP-009**'s threshold is the string `TBD-02`.
7. **Shared work file.** The checker shares the work file `tools/_work/filelist.txt` between concurrent runs. One run during this build reported another author's files; a re-run fixed it. A per-run temporary file list would remove the race; this is a toolchain note for the lead. (The checker now writes `filelist-<pid>.txt`; `sysml/partial-report.json` is still shared, so read results from the console.)
8. **NEED-011 has no requirement child.** NEED-011 (from SCN-005, Week 3) is met by CAP-005, but none of the 20 requirements derives from it, so `orphansAndChildless` reports it as the only childless need. A disruption-notice REQ-STK (and its design satisfier by Week 8) is a lead decision.
9. **Turnaround composition.** A-007 (the course convention): 25 min turnaround = 5 min pad work + 20 min charge with boarding overlapping the charge, consistent with the REQ-STK-005 rationale, SCN-003 and the Week 4 lesson; two pads per turnaround charger keep the charger busy only 20 min per turnaround (48 charges/day).

## 8. Key qualified names for Week 9–14 authors

| Topic | Qualified names |
|---|---|
| System of interest | `Physical::aeroLink` (typed by `Context::AeroLinkEnterprise` = `Context::'ENT-001'`); context `Context::aeroLinkContext` |
| PHY | `Physical::aeroLink.'PHY-001'` (aircraft[12]) … `.'PHY-008'`; types `Physical::EVTOLAircraft`, `ChargingSystems`, `OperationsCenter`, `MaintenanceFacility`, `VertiportNetwork`, `CommunicationsInfrastructure`, `PassengerBookingPlatform`, `PadFireDetectionSystem` |
| LOG, AI | `Logical::logicalArchitecture.'LOG-001'` … `.'LOG-007'`, `.'AI-001'`, `.'AI-002'`; types `Logical::FlightOperations`, `FleetManagement`, `MaintenanceManagement`, `CustomerServices`, `Scheduling`, `DecisionSupport`, `VertiportOperations` |
| FN | `Logical::'FN-001'` … `Logical::'FN-014'` |
| Requirements | `Requirements::'REQ-STK-001'` … `'REQ-SYS-010'`; groups `Requirements::stakeholderRequirements`, `Requirements::systemRequirements` |
| Interfaces | Internal: `Physical::aeroLink.'IF-001'`, `'IF-002'`, `'IF-004'`, `'IF-005'`, `'IF-008'`, `'IF-009'`, `'IF-010'`, `'IF-012'`, `'IF-013'`, `'IF-014'`. External: `Context::aeroLinkContext.'IF-003'`, `'IF-006'`, `'IF-007'`, `'IF-011'`. Port defs `Physical::ChargingPort`, `FlightDataPort`, `PassengerInfoPort`, `MaintenanceDataPort`, … |
| Behaviour | `Behavior::'SCN-002'` (action flow); `Behavior::AircraftOperatingStates`, `Behavior::aircraftOperatingStates` |
| Verification | `Verification::'VER-001'` … `'VER-011'`. Week 12 examples: VER-001 (test), VER-003 (analysis), VER-004 (demonstration, inconclusive until U-001 closes), VER-011 (inspection). |
| Measures | `Context::AeroLinkEnterprise::'MOE-001'` (`passengerWaitP90`); `Physical::ChargingSystems::'MOP-002'` (`chargeTimeToDispatch`); `Measures::'TPM-001'` … `'TPM-003'` |
| Risk / TBD | `AROU::'R-001'` … `'R-008'`, `AROU::'U-001'` (TBD-01), `AROU::'U-002'` (TBD-02), `AROU::'A-006'` (demand), `AROU::'A-007'` (charger occupancy: 20 min per turnaround, 48 charges per charger per day), `AROU::'A-008'` (public-transport fallback, SCN-005) |
| Trade study | `Analysis::'DEC-001'` (`TradeStudy` over `Analysis::'ALT-001'`…`'ALT-004'`, value functions `Analysis::'CRIT-001'`…`'CRIT-004'`) |

**Week 13 impact starting points** (reference_model_notes.md §6), each followed by name search in v0.4:

| Change | Start at | Then follow |
|---|---|---|
| Battery range decreases | `Analysis::'TECH-002'` | `AROU::'R-002'` (about REQ-SYS-003, TECH-002, TPM-003, CAP-006, PHY-001) |
| Demand doubles | `AROU::'A-006'` (about DEC-001, CRIT-001) | `Needs::'MGO-007'`, `Requirements::'REQ-STK-004'`, `Analysis::'DEC-001'` |
| Regulations change | `AROU::'U-001'` (about CON-004, SCN-005, CAP-005, REQ-STK-003, REQ-SYS-004) | `Requirements::'REQ-STK-003'`, `'REQ-SYS-004'` |

## 9. ID → qualified name (all 204 baseline elements)

- The "From" column gives the first version that declares the element.
- "demo" marks an element on one of the five demonstration threads.
- Usage names follow `=` (PHY, MOE and MOP).

| ID | Name | Qualified name (short name) | Construct | From | Thread |
|---|---|---|---|---|---|
| ENT-001 | AeroLink Urban Mobility service enterprise | `Context::'ENT-001'` | part def | v0.1 |  |
| EXT-001 | Air navigation service provider | `Context::aeroLinkContext::'EXT-001'` | part (in aeroLinkContext; type AirNavigationServiceProvider) | v0.1 |  |
| EXT-002 | Electric utility grid | `Context::aeroLinkContext::'EXT-002'` | part (in aeroLinkContext; type ElectricUtilityGrid) | v0.1 |  |
| EXT-003 | Weather | `Context::aeroLinkContext::'EXT-003'` | part (in aeroLinkContext; type WeatherSystem) | v0.1 |  |
| EXT-004 | Aircraft manufacturer (OEM) | `Context::aeroLinkContext::'EXT-004'` | part (in aeroLinkContext; type AircraftManufacturer) | v0.1 |  |
| EXT-005 | Public transport network | `Context::aeroLinkContext::'EXT-005'` | part (in aeroLinkContext; type PublicTransportNetwork) | v0.1 |  |
| EXT-006 | Emergency services | `Context::aeroLinkContext::'EXT-006'` | part (in aeroLinkContext; type EmergencyServices) | v0.1 |  |
| STK-001 | Passengers | `Stakeholders::'STK-001'` | part def (actor/stakeholder type) | v0.1 | demo |
| STK-002 | FAA | `Stakeholders::'STK-002'` | part def (actor/stakeholder type) | v0.1 | demo |
| STK-003 | Investors | `Stakeholders::'STK-003'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-004 | Communities | `Stakeholders::'STK-004'` | part def (actor/stakeholder type) | v0.1 | demo |
| STK-005 | Vertiport Operators | `Stakeholders::'STK-005'` | part def (actor/stakeholder type) | v0.1 | demo |
| STK-006 | Emergency Responders | `Stakeholders::'STK-006'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-007 | Air navigation service provider | `Stakeholders::'STK-007'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-008 | Pilots / remote operators | `Stakeholders::'STK-008'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-009 | Maintenance technicians | `Stakeholders::'STK-009'` | part def (actor/stakeholder type) | v0.1 | demo |
| STK-010 | Electric utility | `Stakeholders::'STK-010'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-011 | Aircraft manufacturer (OEM) | `Stakeholders::'STK-011'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-012 | Insurers | `Stakeholders::'STK-012'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-013 | City planning authority | `Stakeholders::'STK-013'` | part def (actor/stakeholder type) | v0.1 |  |
| STK-014 | Accessibility advocates | `Stakeholders::'STK-014'` | part def (actor/stakeholder type) | v0.1 |  |
| CON-001 | Predictable waiting time | `Stakeholders::'CON-001'` | concern | v0.1 |  |
| CON-002 | Personal safety in flight | `Stakeholders::'CON-002'` | concern | v0.1 |  |
| CON-003 | Affordable fare | `Stakeholders::'CON-003'` | concern | v0.1 |  |
| CON-004 | Airworthiness and operational safety | `Stakeholders::'CON-004'` | concern | v0.1 |  |
| CON-005 | Return on capital and path to scale | `Stakeholders::'CON-005'` | concern | v0.1 |  |
| CON-006 | Pad throughput and charging capacity | `Stakeholders::'CON-006'` | concern | v0.1 |  |
| CON-007 | Battery-fire response at vertiports | `Stakeholders::'CON-007'` | concern | v0.1 |  |
| CON-008 | Airspace integration | `Stakeholders::'CON-008'` | concern | v0.1 |  |
| CON-009 | Operator workload and automation trust | `Stakeholders::'CON-009'` | concern | v0.1 |  |
| CON-010 | Turnaround pressure on maintenance | `Stakeholders::'CON-010'` | concern | v0.1 |  |
| CON-011 | Peak grid load | `Stakeholders::'CON-011'` | concern | v0.1 |  |
| CON-012 | Community noise | `Stakeholders::'CON-012'` | concern | v0.1 |  |
| CON-013 | Step-free boarding access | `Stakeholders::'CON-013'` | concern | v0.1 |  |
| CON-014 | Quantifiable operational risk | `Stakeholders::'CON-014'` | concern | v0.1 |  |
| CON-015 | Fleet delivery and certification progress | `Stakeholders::'CON-015'` | concern | v0.1 |  |
| CON-016 | Land use and zoning of vertiport sites | `Stakeholders::'CON-016'` | concern | v0.1 |  |
| MGO-001 | Mission: safe, quiet on-demand urban air trips | `Needs::'MGO-001'` | requirement | v0.1 |  |
| MGO-002 | Goal: short, predictable waits | `Needs::'MGO-002'` | requirement | v0.1 |  |
| MGO-003 | Goal: be a good neighbour | `Needs::'MGO-003'` | requirement | v0.1 |  |
| MGO-004 | Goal: grow capacity in step with demand | `Needs::'MGO-004'` | requirement | v0.1 |  |
| MGO-005 | Objective: 90 % boarded within 15 min | `Needs::'MGO-005'` | requirement | v0.1 |  |
| MGO-006 | Objective: no pad-edge noise exceedance | `Needs::'MGO-006'` | requirement | v0.1 |  |
| MGO-007 | Objective: Year-2 capacity with headroom | `Needs::'MGO-007'` | requirement | v0.1 |  |
| MGO-008 | Objective: zero dispatches outside limits | `Needs::'MGO-008'` | requirement | v0.1 |  |
| MGO-009 | Goal: every flight within approved limits | `Needs::'MGO-009'` | requirement | v0.1 |  |
| NEED-001 | Short, predictable wait to board | `Needs::'NEED-001'` | requirement | v0.1 | demo |
| NEED-002 | Assurance of flight within safety limits | `Needs::'NEED-002'` | requirement | v0.1 | demo |
| NEED-003 | Noise kept within the local agreement | `Needs::'NEED-003'` | requirement | v0.1 | demo |
| NEED-004 | Pads not limited by turnaround | `Needs::'NEED-004'` | requirement | v0.1 | demo |
| NEED-005 | Capacity that grows with demand | `Needs::'NEED-005'` | requirement | v0.1 |  |
| NEED-006 | Early warning and access for a vertiport fire | `Needs::'NEED-006'` | requirement | v0.1 |  |
| NEED-007 | Known aircraft condition before release | `Needs::'NEED-007'` | requirement | v0.1 | demo |
| NEED-008 | Unassisted step-free travel | `Needs::'NEED-008'` | requirement | v0.1 |  |
| NEED-009 | Flight intent known to the ANSP | `Needs::'NEED-009'` | requirement | v0.1 |  |
| NEED-010 | Charging load within the grid connection | `Needs::'NEED-010'` | requirement | v0.1 |  |
| NEED-011 | Prompt notice and a way onward when a trip is disrupted | `Needs::'NEED-011'` | requirement | v0.1 |  |
| CAP-001 | On-demand passenger transport | `Needs::'CAP-001'` | action def | v0.1 |  |
| CAP-002 | Ride booking and dispatch | `Needs::'CAP-002'` | action def | v0.1 | demo |
| CAP-003 | Fleet charging management | `Needs::'CAP-003'` | action def | v0.1 | demo |
| CAP-004 | Flight operations within safety limits | `Needs::'CAP-004'` | action def | v0.1 | demo |
| CAP-005 | Weather-aware operations | `Needs::'CAP-005'` | action def | v0.1 |  |
| CAP-006 | Fleet health management | `Needs::'CAP-006'` | action def | v0.1 | demo |
| CAP-007 | Noise-managed vertiport operations | `Needs::'CAP-007'` | action def | v0.1 | demo |
| CAP-008 | Capacity planning | `Needs::'CAP-008'` | action def | v0.1 |  |
| CAP-009 | Incident response support | `Needs::'CAP-009'` | action def | v0.1 |  |
| CAP-010 | Charging power control | `Needs::'CAP-010'` | action def | v0.1 |  |
| SCN-001 | Passenger Ride Request | `Behavior::'SCN-001'` | use case | v0.1 |  |
| SCN-002 | Passenger Transport Mission | `Behavior::'SCN-002'` | use case | v0.1 |  |
| SCN-003 | Aircraft Charging | `Behavior::'SCN-003'` | use case | v0.1 |  |
| SCN-004 | Maintenance Event | `Behavior::'SCN-004'` | use case | v0.1 |  |
| SCN-005 | Weather Disruption | `Behavior::'SCN-005'` | use case | v0.1 |  |
| REQ-STK-001 | Passenger wait to board | `Requirements::'REQ-STK-001'` | requirement | v0.2 |  |
| REQ-STK-002 | Pad-edge noise limit | `Requirements::'REQ-STK-002'` | requirement | v0.2 |  |
| REQ-STK-003 | No dispatch outside weather limits | `Requirements::'REQ-STK-003'` | requirement | v0.2 |  |
| REQ-STK-004 | Network capacity by month 24 | `Requirements::'REQ-STK-004'` | requirement | v0.2 |  |
| REQ-STK-005 | Hub turnaround time | `Requirements::'REQ-STK-005'` | requirement | v0.2 |  |
| REQ-STK-006 | No dispatch with an open no-go fault | `Requirements::'REQ-STK-006'` | requirement | v0.2 |  |
| REQ-STK-007 | Step-free boarding | `Requirements::'REQ-STK-007'` | requirement | v0.2 |  |
| REQ-STK-008 | Responder alert time | `Requirements::'REQ-STK-008'` | requirement | v0.2 |  |
| REQ-STK-009 | Flight intent to the ANSP | `Requirements::'REQ-STK-009'` | requirement | v0.2 |  |
| REQ-STK-010 | Vertiport power within the grid connection | `Requirements::'REQ-STK-010'` | requirement | v0.2 |  |
| REQ-SYS-001 | Charge to dispatch threshold in 20 min | `Requirements::'REQ-SYS-001'` | requirement | v0.2 | demo |
| REQ-SYS-002 | Aircraft pad-edge noise | `Requirements::'REQ-SYS-002'` | requirement | v0.2 | demo |
| REQ-SYS-003 | Planned landing energy reserve | `Requirements::'REQ-SYS-003'` | requirement | v0.2 | demo |
| REQ-SYS-004 | Weather dispatch hold | `Requirements::'REQ-SYS-004'` | requirement | v0.2 |  |
| REQ-SYS-005 | Aircraft assignment time | `Requirements::'REQ-SYS-005'` | requirement | v0.2 | demo |
| REQ-SYS-006 | Fleet availability | `Requirements::'REQ-SYS-006'` | requirement | v0.2 |  |
| REQ-SYS-007 | Block time for the design trip | `Requirements::'REQ-SYS-007'` | requirement | v0.2 |  |
| REQ-SYS-008 | No-go fault flag time | `Requirements::'REQ-SYS-008'` | requirement | v0.2 | demo |
| REQ-SYS-009 | Fire alarm transmission | `Requirements::'REQ-SYS-009'` | requirement | v0.2 |  |
| REQ-SYS-010 | Vertiport charging power limit | `Requirements::'REQ-SYS-010'` | requirement | v0.2 |  |
| LOG-001 | Flight Operations | `Logical::logicalArchitecture::'LOG-001'` | part (type FlightOperations) | v0.2 | demo |
| LOG-002 | Fleet Management | `Logical::logicalArchitecture::'LOG-002'` | part (type FleetManagement) | v0.2 | demo |
| LOG-003 | Maintenance Management | `Logical::logicalArchitecture::'LOG-003'` | part (type MaintenanceManagement) | v0.2 | demo |
| LOG-004 | Customer Services | `Logical::logicalArchitecture::'LOG-004'` | part (type CustomerServices) | v0.2 |  |
| LOG-005 | Scheduling | `Logical::logicalArchitecture::'LOG-005'` | part (type Scheduling) | v0.2 | demo |
| LOG-006 | Decision Support | `Logical::logicalArchitecture::'LOG-006'` | part (type DecisionSupport) | v0.2 |  |
| LOG-007 | Vertiport Operations | `Logical::logicalArchitecture::'LOG-007'` | part (type VertiportOperations) | v0.2 |  |
| FN-001 | Accept ride request | `Logical::'FN-001'` | action | v0.2 |  |
| FN-002 | Match request to aircraft | `Logical::'FN-002'` | action | v0.2 | demo |
| FN-003 | Plan flight | `Logical::'FN-003'` | action | v0.2 | demo |
| FN-004 | Assess dispatch weather | `Logical::'FN-004'` | action | v0.2 |  |
| FN-005 | Fly passenger trip | `Logical::'FN-005'` | action | v0.2 | demo |
| FN-006 | Charge aircraft | `Logical::'FN-006'` | action | v0.2 | demo |
| FN-007 | Control vertiport charging power | `Logical::'FN-007'` | action | v0.2 |  |
| FN-008 | Assess aircraft health | `Logical::'FN-008'` | action | v0.2 | demo |
| FN-009 | Manage fleet availability | `Logical::'FN-009'` | action | v0.2 |  |
| FN-010 | Detect and report pad fire | `Logical::'FN-010'` | action | v0.2 |  |
| FN-011 | Dispatch aircraft | `Logical::'FN-011'` | action | v0.2 |  |
| FN-012 | Coordinate flight intent | `Logical::'FN-012'` | action | v0.2 |  |
| FN-013 | Forecast demand | `Logical::'FN-013'` | action | v0.2 |  |
| FN-014 | Board and alight passengers | `Logical::'FN-014'` | action | v0.2 |  |
| AI-001 | Predictive maintenance | `Logical::logicalArchitecture::'AI-001'` | part (type AICapability) + @AIEnabledCapability | v0.2 |  |
| AI-002 | Demand forecasting | `Logical::logicalArchitecture::'AI-002'` | part (type AICapability) + @AIEnabledCapability | v0.2 |  |
| PHY-001 | eVTOL Aircraft | `Physical::aeroLink::'PHY-001'` = `Physical::aeroLink.aircraft` | part (type EVTOLAircraft) | v0.1 | demo |
| PHY-002 | Vertiports | `Physical::aeroLink::'PHY-002'` = `Physical::aeroLink.vertiports` | part (type VertiportNetwork) | v0.1 |  |
| PHY-003 | Charging Systems | `Physical::aeroLink::'PHY-003'` = `Physical::aeroLink.chargingSystems` | part (type ChargingSystems) | v0.1 | demo |
| PHY-004 | Operations Center | `Physical::aeroLink::'PHY-004'` = `Physical::aeroLink.operationsCenter` | part (type OperationsCenter) | v0.1 | demo |
| PHY-005 | Maintenance Facility | `Physical::aeroLink::'PHY-005'` = `Physical::aeroLink.maintenanceFacility` | part (type MaintenanceFacility) | v0.1 | demo |
| PHY-006 | Communications Infrastructure | `Physical::aeroLink::'PHY-006'` = `Physical::aeroLink.communications` | part (type CommunicationsInfrastructure) | v0.1 |  |
| PHY-007 | Passenger booking platform | `Physical::aeroLink::'PHY-007'` = `Physical::aeroLink.bookingPlatform` | part (type PassengerBookingPlatform) | v0.1 |  |
| PHY-008 | Pad fire detection and alarm system | `Physical::aeroLink::'PHY-008'` = `Physical::aeroLink.padFireDetection` | part (type PadFireDetectionSystem) | v0.1 |  |
| IF-001 | Aircraft <-> pad | `Physical::aeroLink::'IF-001'` | interface (connect) | v0.2 |  |
| IF-002 | Aircraft <-> operations centre datalink | `Physical::aeroLink::'IF-002'` | interface (connect) | v0.2 |  |
| IF-003 | Operations centre <-> ANSP | `Context::aeroLinkContext::'IF-003'` | interface (connect) | v0.2 |  |
| IF-004 | Operations <-> maintenance work-order handover | `Physical::aeroLink::'IF-004'` | interface (connect) | v0.2 |  |
| IF-005 | Aircraft <-> charger power | `Physical::aeroLink::'IF-005'` | interface (connect) | v0.2 |  |
| IF-006 | Charger <-> utility grid | `Context::aeroLinkContext::'IF-006'` | interface (connect) | v0.2 |  |
| IF-007 | Fire alarm <-> emergency services | `Context::aeroLinkContext::'IF-007'` | interface (connect) | v0.2 |  |
| IF-008 | Booking platform <-> operations centre | `Physical::aeroLink::'IF-008'` | interface (connect) | v0.2 |  |
| IF-009 | Vertiport operator <-> AeroLink pad-slot agreement | `Physical::aeroLink::'IF-009'` | interface (connect) | v0.2 |  |
| IF-010 | Charger <-> operations centre data | `Physical::aeroLink::'IF-010'` | interface (connect; def ChargeSessionDataLink) | v0.2 |  |
| IF-011 | Weather service <-> operations centre | `Context::aeroLinkContext::'IF-011'` | interface (connect; def WeatherDataLink) | v0.2 |  |
| IF-012 | Maintenance <-> operations centre data | `Physical::aeroLink::'IF-012'` | interface (connect; def MaintenanceDataLink) | v0.2 |  |
| IF-013 | Aircraft <-> maintenance health data link | `Physical::aeroLink::'IF-013'` | interface (connect; def AircraftHealthDataLink) | v0.2 |  |
| IF-014 | Vertiport <-> operations centre data | `Physical::aeroLink::'IF-014'` | interface (connect; def VertiportDataLink) | v0.2 |  |
| INFO-001 | Passenger Information | `Physical::'INFO-001'` | item def | v0.2 | demo |
| INFO-002 | Flight Data | `Physical::'INFO-002'` | item def | v0.2 | demo |
| INFO-003 | Maintenance Data | `Physical::'INFO-003'` | item def | v0.2 | demo |
| INFO-004 | Weather Data | `Physical::'INFO-004'` | item def | v0.2 |  |
| INFO-005 | Financial Data | `Physical::'INFO-005'` | item def | v0.2 |  |
| VER-001 | Turnaround charge-time test | `Verification::'VER-001'` | verification + @VerificationMethod | v0.4 | demo |
| VER-002 | Pad-edge noise measurement | `Verification::'VER-002'` | verification + @VerificationMethod | v0.4 | demo |
| VER-003 | Landing energy reserve analysis | `Verification::'VER-003'` | verification + @VerificationMethod | v0.4 | demo |
| VER-004 | Weather dispatch-hold demonstration | `Verification::'VER-004'` | verification + @VerificationMethod | v0.4 |  |
| VER-005 | Aircraft assignment latency test | `Verification::'VER-005'` | verification + @VerificationMethod | v0.4 | demo |
| VER-006 | Fleet availability analysis | `Verification::'VER-006'` | verification + @VerificationMethod | v0.4 |  |
| VER-007 | Design-trip block-time flight test | `Verification::'VER-007'` | verification + @VerificationMethod | v0.4 |  |
| VER-008 | No-go fault flag test | `Verification::'VER-008'` | verification + @VerificationMethod | v0.4 | demo |
| VER-009 | Fire alarm transmission test | `Verification::'VER-009'` | verification + @VerificationMethod | v0.4 |  |
| VER-010 | Vertiport power-limit test | `Verification::'VER-010'` | verification + @VerificationMethod | v0.4 |  |
| VER-011 | Step-free boarding inspection | `Verification::'VER-011'` | verification + @VerificationMethod | v0.4 |  |
| MOE-001 | Passenger wait (90th percentile) | `Context::AeroLinkEnterprise::'MOE-001'` = `passengerWaitP90` | #moe attribute | v0.4 |  |
| MOE-002 | Daily trips served | `Context::AeroLinkEnterprise::'MOE-002'` = `dailyTripsServed` | #moe attribute | v0.4 |  |
| MOE-003 | Noise compliance rate | `Context::AeroLinkEnterprise::'MOE-003'` = `noiseComplianceRate` | #moe attribute | v0.4 |  |
| MOE-004 | Dispatches outside approved limits | `Context::AeroLinkEnterprise::'MOE-004'` = `dispatchesOutsideLimits` | #moe attribute | v0.4 |  |
| MOE-005 | Capital to meet the Year-2 capacity objective | `Context::AeroLinkEnterprise::'MOE-005'` = `capitalForYear2Capacity` | #moe attribute | v0.4 |  |
| MOE-006 | Capacity retained after loss of one hub | `Context::AeroLinkEnterprise::'MOE-006'` = `capacityRetainedAfterHubLoss` | #moe attribute | v0.4 |  |
| MOP-001 | Aircraft assignment latency | `Logical::Scheduling::'MOP-001'` = `assignmentLatencyP99` | #mop attribute | v0.4 | demo |
| MOP-002 | Charge time to dispatch threshold | `Physical::ChargingSystems::'MOP-002'` = `chargeTimeToDispatch` | #mop attribute | v0.4 | demo |
| MOP-003 | Block time for the 25 km design trip | `Physical::EVTOLAircraft::'MOP-003'` = `designTripBlockTime` | #mop attribute | v0.4 |  |
| MOP-004 | Pad-edge noise level | `Physical::EVTOLAircraft::'MOP-004'` = `padEdgeNoise` | #mop attribute | v0.4 | demo |
| MOP-005 | Landing energy remaining | `Logical::FlightOperations::'MOP-005'` = `plannedLandingEnergyFraction` | #mop attribute | v0.4 | demo |
| MOP-006 | Fleet availability | `Logical::FleetManagement::'MOP-006'` = `fleetAvailability` | #mop attribute | v0.4 |  |
| MOP-007 | No-go fault flag latency | `Logical::MaintenanceManagement::'MOP-007'` = `noGoFlagLatency` | #mop attribute | v0.4 | demo |
| MOP-008 | Fire alarm transmission latency | `Physical::PadFireDetectionSystem::'MOP-008'` = `alarmTransmissionTime` | #mop attribute | v0.4 |  |
| MOP-009 | Peak vertiport charging power | `Physical::ChargingSystems::'MOP-009'` = `peakVertiportChargingPower` | #mop attribute | v0.4 |  |
| TPM-001 | Charge time to dispatch threshold | `Measures::'TPM-001'` | attribute + @TechnicalPerformanceMeasure | v0.4 |  |
| TPM-002 | Pad-edge noise | `Measures::'TPM-002'` | attribute + @TechnicalPerformanceMeasure | v0.4 |  |
| TPM-003 | Landing energy reserve on the design trip | `Measures::'TPM-003'` | attribute + @TechnicalPerformanceMeasure | v0.4 |  |
| TECH-001 | High-power charging | `Analysis::'TECH-001'` | part def | v0.4 |  |
| TECH-002 | Battery cell technology | `Analysis::'TECH-002'` | part def | v0.4 |  |
| TECH-003 | Detect-and-avoid and autonomy enablers | `Analysis::'TECH-003'` | part def | v0.4 |  |
| A-001 | Passenger wait tolerance is 15 min | `AROU::'A-001'` | metadata : AssumptionItem | v0.4 |  |
| A-002 | Turnaround charging is concentrated at 3 hub vertiports | `AROU::'A-002'` | metadata : AssumptionItem | v0.4 |  |
| A-003 | High-power charger maturity is TRL 6 | `AROU::'A-003'` | metadata : AssumptionItem | v0.4 |  |
| A-004 | Battery cell maturity is TRL 5 | `AROU::'A-004'` | metadata : AssumptionItem | v0.4 |  |
| A-005 | Detect-and-avoid maturity is TRL 4 | `AROU::'A-005'` | metadata : AssumptionItem | v0.4 |  |
| A-006 | Year-2 planning demand is 240 trips/day | `AROU::'A-006'` | metadata : AssumptionItem | v0.4 |  |
| A-007 | A turnaround charger is occupied 20 min per turnaround | `AROU::'A-007'` | metadata : AssumptionItem | v0.4 |  |
| A-008 | Public-transport fallback is available during weather holds | `AROU::'A-008'` | metadata : AssumptionItem | v0.4 |  |
| R-001 | Charging capacity lags fleet growth | `AROU::'R-001'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 | demo |
| R-002 | Battery capacity fade under fast charging | `AROU::'R-002'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 | demo |
| R-003 | Pad-edge noise above the agreed limit | `AROU::'R-003'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 | demo |
| R-004 | Weather limits lower than planned | `AROU::'R-004'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 |  |
| R-005 | Grid connection below hub charging demand | `AROU::'R-005'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 |  |
| R-006 | Detect-and-avoid not mature for autonomy | `AROU::'R-006'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 |  |
| R-007 | Dispatch platform outage | `AROU::'R-007'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 | demo |
| R-008 | Battery thermal runaway during charging | `AROU::'R-008'` | metadata : CourseRisk (:> RiskMetadata::Risk) | v0.4 |  |
| O-001 | Integrated public-transport ticketing | `AROU::'O-001'` | metadata : OpportunityItem | v0.4 |  |
| O-002 | Overnight charger capacity for ground fleets | `AROU::'O-002'` | metadata : OpportunityItem | v0.4 |  |
| U-001 | Aircraft weather limits not yet published | `AROU::'U-001'` | metadata : UnknownItem | v0.4 |  |
| U-002 | Vertiport grid connection limit not agreed | `AROU::'U-002'` | metadata : UnknownItem | v0.4 |  |
| ALT-001 | Baseline: no added capacity | `Analysis::'ALT-001'` | part : CapacityAlternative | v0.4 |  |
| ALT-002 | Additional aircraft only | `Analysis::'ALT-002'` | part : CapacityAlternative | v0.4 |  |
| ALT-003 | Additional vertiport only | `Analysis::'ALT-003'` | part : CapacityAlternative | v0.4 |  |
| ALT-004 | Balanced: aircraft plus hub charging | `Analysis::'ALT-004'` | part : CapacityAlternative | v0.4 |  |
| CRIT-001 | Wait at Year-2 demand | `Analysis::'CRIT-001'` | calc def (value function) | v0.4 |  |
| CRIT-002 | Capital cost | `Analysis::'CRIT-002'` | calc def (value function) | v0.4 |  |
| CRIT-003 | Capacity retained after loss of a hub | `Analysis::'CRIT-003'` | calc def (value function) | v0.4 |  |
| CRIT-004 | Community noise exposure | `Analysis::'CRIT-004'` | calc def (value function) | v0.4 |  |
| DEC-001 | Year-2 capacity: add aircraft with hub charging | `Analysis::'DEC-001'` | analysis | v0.4 |  |
| DEC-002 | One operations platform with hot standby | `Analysis::'DEC-002'` | analysis | v0.4 |  |

## 10. Validator output (pasted)

The files were brought to the 2026-10-11 baseline by hand-applied, data-driven patches (the original generator was not kept). Changes: CON-015 and CON-016, CON-012 to STK-004 only (W2-F04); goal MGO-009 with MGO-008 re-parented under it (W3-F02); NEED-011, `CAP-005 derives-from NEED-011`, A-008 (W3-F18); A-007 (charger-occupancy convention); MGO, NEED and SCN `doc` texts from the new attributes; the SCN-002 action flow renumbered with the ANSP-acceptance decision (A3); REQ-SYS-005 statement and criterion; REQ-SYS-001, -003 and -008 rationales; R-001 text; R-004 consequence 4; TECH-001 related risk R-005; DEC-001 "would change if" wording; ALT-001 marked as the baseline alternative; MOE-005 text marks it as a course cost measure. Six single-change mutations of the new content (a derivation end, an `about` target, a `stakeholder` type, a `frame`, a decision target, a `#derivesFrom` end) were each rejected by the checker.

**Second batch, 2026-10-11 (Week 8 review, F07/F23 and the reference observations; IDs never reused).** Five information interfaces, each an `interface` usage on a new interface def connecting the ports that the existing item flows use (two new ports where the old port already ended another interface): IF-010 charger ↔ operations centre (`ChargeSessionDataLink`, new port `OperationsCenter::chargeSessionIn`; the PHY-003 → INFO-003 flow now ends there), IF-011 weather service ↔ operations centre (`WeatherDataLink`, in `Context::aeroLinkContext`, carrying the existing weather item flow), IF-012 maintenance ↔ operations centre data (`MaintenanceDataLink`; IF-004 stays the organisational handover), IF-013 aircraft ↔ maintenance health data link (`AircraftHealthDataLink`, new port `EVTOLAircraft::healthDataOut`; the PHY-001 → INFO-002 → PHY-005 flow now starts there) and IF-014 vertiport ↔ operations centre data (`VertiportDataLink`; IF-009 stays the pad-slot agreement). IF-002's `Carries:` is INFO-002 only (§7.1). `allocation 'AI-001 allocated-to PHY-005'` replaces the PHY-004 allocation. 13 `#derivesFrom` dependencies FN → SCN (FN-013 has none: a planning function). Doc texts: PHY-006 (the medium of IF-002, IF-010, IF-012, IF-013 and IF-014), INFO-002 (health and fault reports), INFO-003 (recorded relay), DEC-002 (no longer names booking). The new drift check also found one older drift, AI-002's failure mode ("underinvestment archetype" against the baseline's "charging-limit (Limits to Growth) problem"); the files now carry the baseline wording. Three single-change mutations of the new content (an IF-013 port, an IF-011 port, an FN → SCN target) were each rejected by the checker ("Couldn't resolve reference …").

Run from `learning-studio/` on 2026-10-11 (second batch):

```
$ npm run content:sysml -- sysml/reference --report <scratch>/ref-report.json
OMG SysML v2 Pilot Implementation (SysMLInteractive, Jupyter kernel jar) release 2026-08 (kernel 0.62.0), Java 21.0.12.1+1-LTS, library load 4.2 s
PASS  (expected PASS: OK)  sysml/reference/aerolink_v01_skeleton.sysml
PASS  (expected PASS: OK)  sysml/reference/aerolink_v02_req_structure.sysml
PASS  (expected PASS: OK)  sysml/reference/aerolink_v03_behavior.sysml
PASS  (expected PASS: OK)  sysml/reference/aerolink_v04_full.sysml

4 file(s): 4 PASS, 0 FAIL, 0 ERROR.
```

No diagnostics (no warnings) on any of the four files. A full `npm run content:sysml` (all 23 course listings) then regenerated the canonical `sysml/validation-report.json` (2026-10-11T23:33:03Z): 14 PASS, 9 FAIL (all intended), 0 ERROR, every file matching its expectation, with the same four reference hashes. SHA-256 of the validated files (equal to the hashes the checker recorded):

```
0c26bffc6bd1a7cfc0fb3d006baf78972db4694fef7b88d44a4a3dfda76e013e *aerolink_v01_skeleton.sysml
e802203e19d226cc62d997d8ae7255ebd651e1cabfa7728b4a7304d8aa84b589 *aerolink_v02_req_structure.sysml
a0e371b1fe11ff16753e1971176a3b388ebece9b74377ef00395ae251ec87248 *aerolink_v03_behavior.sysml
c3f78cdc9fe3f8c445946fb782cb9b61e2ac7319c3e21de5007872dddb56c2bb *aerolink_v04_full.sysml
```
