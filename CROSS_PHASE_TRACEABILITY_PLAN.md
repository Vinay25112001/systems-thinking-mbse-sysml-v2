# Cross-Phase Traceability Plan

**Status:** design, ready to implement. Written 2026-10-19 under DECISION_LOG A22 and directive §4, §6 and §9.
Schema references are to `CANONICAL_ENGINEERING_DATA_MODEL.md` ("data model"); storage and module layout to
`PROJECT_WORKSPACE_ARCHITECTURE.md` ("architecture"). Paths are relative to `learning-studio/`.

**Citation convention** (as in the lectures): `R80 pp.50–51` = verified reading-register entry R80, PDF pages of the
SysML v2.1 Beta 2 (Release 2026-07) language specification (source S06; DECISION_LOG W4: cited as the Beta 2 text, never
as the final standard). Citations marked **(W8)** are used in the signed-off Week 8 lecture
(`src/content/lectures/week08/*.ts`, `labBrief.ts`). Citations marked **(outline)** come from the Week 9–13 lecture
outlines in `docs/lectures/weekNN/` and the checker-accepted reference model notes (`sysml/reference/README.md`); they
must be re-confirmed by those weeks' authors when the lectures are written.

---

## 1. The instructional trace journey

```
Stakeholder ─▶ Need ─▶ Capability ─▶ Requirement ─▶ Behavior ─▶ Logical ─▶ Physical ─▶ Interface ─▶ Verification evidence
 STK, CON      NEED,MGO   CAP          REQ-STK,       SCN, FN      LOG, AI     PHY, CMP    IF, INFO      VER, EVD
 (W1)          (W1)       (W2)         REQ-SYS (W2)   (W2, W4)     (W4)        (W4, W5)    (W4, W5)      (W2 plan, W12)
                                         ▲                                                      
       Risk / decision / trade links:  A, U, R, O, I, TECH, TPM (W2–W3) · TRD, ALT, CRIT, DEC (W3–W4) · INC (W6)
```

This is an **instructional** journey: each arrow is a course trace stored as a typed relationship (data model §6), not
a claim that SysML v2 has one relationship called "trace" or that every hop has the same semantics. Section 3 says,
hop by hop, which hops become native SysML v2 relationships in Phase II and which stay course-level traces.

Hop by hop, with the stored relationship (direction `from type to`):

| Hop | Stored as | Created in | Existing checker |
|---|---|---|---|
| Stakeholder → concern | CON derives-from STK | W1 Part 4 | `checkRegister` (team.ts) |
| Concern/stakeholder → need | NEED derives-from CON, NEED derives-from STK | W1 Part 5 | `needStatus` (team.ts) |
| Mission/goal → need | NEED derives-from MGO | W1 Part 5 | `needStatus` (goal trace) |
| Need → capability | CAP derives-from NEED | W2 | week2 `record.ts` capability checks |
| Need/capability → requirement | REQ-STK derives-from NEED/CAP; REQ-SYS derives-from REQ-STK | W2 | `assessRequirement`, trace audit |
| Scenario coverage | SCN covers NEED, SCN covers CAP | W2 | coverage checks |
| Requirement → behavior | REQ allocated-to FN; FN derives-from SCN/CAP | W4 | week4 function checks |
| Behavior → logical | LOG performs FN | W4 | week4 |
| Logical → physical | LOG allocated-to PHY; FN allocated-to PHY; PHY contains CMP | W4, W5 | week4, week5 |
| Physical → interface | IF connects PHY/CMP/EXT; IF carries INFO; PHY flows-to INFO flows-to PHY | W4, W5 | week5 N², crossing-flow check |
| Requirement → design claim | PHY/LOG/IF satisfies REQ | W4, W5 | week4/5 |
| Requirement → verification | VER verifies REQ (W2 method/criterion become the plan) | W2 plan, W12 case | week2 method fit; W12 TBD |
| Verification → evidence | EVD evidences VER | W12 | TBD |
| Measures | MOE/MOP/TPM measures X; TPM derives-from MOP | W2, W3 | week2/3 |
| Risk and uncertainty | R/A/U/O/I affects X; X mitigates R | W2, W3 | week3 risk checks |
| Trade and decision | TRD derives-from REQ/MGO; CRIT derives-from MOE; DEC derives-from TRD; DEC affects X | W3, W4 | week3 trade arithmetic |
| Evolution | INC delivers X; INC precedes INC | W6 | TBD |

The existing 11-step digital thread of `threadsFrom` (`src/model/engineering.ts`: STK → NEED → CAP → REQ → FN → LOG
→ PHY → INFO → VER → MOE/MOP → R) runs unchanged over `projection.ts`, so the Week 12 thread audit works on the team's
project the way it already works on AeroLink.

---

## 2. Relationship vocabulary per week

What each week's editor lets the team create (all others are visible, read-only or editable from the week that owns
them). Types and allowed pairs: data model §6.1.

| Week | Relationship types created | Typical pairs |
|---|---|---|
| 1 | derives-from; contains; stakeholder types (regulates, funds, supplies, affected-by, partners-with, coordinates-with, conflicts-with) | CON→STK, NEED→STK, NEED→CON, NEED→MGO, MGO→MGO, ENT→PRT, STK→STK |
| 2 | derives-from, refines, covers, measures, affects (U) | CAP→NEED, CAP→CAP, REQ-STK→NEED/CAP, REQ-SYS→REQ-STK, SCN→NEED, SCN→CAP, MOE/MOP→X, U→REQ |
| 3 | affects, mitigates, measures, derives-from, contains | R/A/U/O/I/TECH→X, X→R, TPM→REQ, TPM→MOP, TRD→ALT/CRIT, TRD→REQ, CRIT→MOE |
| 4 | derives-from, allocated-to, performs, satisfies, flows-to, frames, contains, affects (DEC) | FN→CAP/SCN, REQ→FN, LOG→FN, LOG/FN→PHY, PHY→REQ, PHY↔INFO, VP→CON, FG→FN, DEC→X |
| 5 | contains, performs, connects, carries, satisfies, affects (R, ICR), derives-from | PHY→CMP, CMP→FN, IF→ends, IF→INFO, IF→REQ, R→IF, ICR→IF, REQ-SYS→parents |
| 6 | delivers, precedes, affects | INC→X, INC→INC, TECH→X |
| 7 | (none new; baseline review and RIDs: RID affects X) | |
| 8 | model mappings (artifact → model element), finding dispositions; no new trace types | |
| 9 | requirement relationships confirmed as model relationships (derivation, satisfy assertions planned) | REQ-SYS→REQ-STK, NEED→CON |
| 10 | performs, allocated-to (behavioral), derives-from (FN→SCN refined into actions) | LOG→FN, FN→PHY |
| 11 | connects, carries, flows-to, allocated-to | IF ends, INFO flows |
| 12 | verifies, evidences, measures | VER→REQ, EVD→VER |
| 13 | affects (ANL), derives-from (ANL→TRD/REQ/TPM) | ANL→DEC |
| 14 | RID affects X; viewpoints frame concerns (VP→CON) | |

---

## 3. From Phase I artifacts to SysML v2 (Weeks 8–14)

### 3.1 Course conventions kept

- **IDs become short names.** Every Phase I course ID is written as the element's short name, e.g.
  `part def <'STK-004'> …`; "an element can be given a name and a short name, declared in that order, with the short
  name between angle brackets" (R80 p.49, W8). The register wording stays the declared name.
- **One dependency direction.** `dependency from A to B` makes A the client and B the supplier; "a change to a supplier
  element may result in a change to a client element" (R80 pp.50–51, W8). Every course dependency runs from the
  dependent element to the element it depends on, and its keyword names the client's relation
  (`REL_KEYWORDS`, `dependencyEnds` in `src/content/lectures/week08/labBrief.ts`; e.g. "the FAA regulates the operator"
  is written `#regulatedBy dependency from operator to FAA`).
- **No system keyword.** SysML v2 has no `system`, `subsystem` or `component` construct; anything with structure and
  behavior is a part (R80 p.48, W8). The enterprise and the system of interest are parts.
- **Stakeholders and concerns.** A concern is declared like a requirement with the keyword `concern` (R83 p.167, W8);
  stakeholder parameters, like actor parameters, are part usages and must be defined by part definitions (R83 p.166,
  W8), so every STK becomes a `part def` and every concern names its stakeholders with `stakeholder` declarations.
  A requirement can `frame` a concern, which makes the concern a required constraint of the framing requirement
  (R83 p.167, W8); a viewpoint definition is a kind of requirement definition that frames stakeholder concerns
  (R85 p.181, W8).
- **Package structure** of the team model: `MODEL_PACKAGES` in `week08/labBrief.ts` (Context, Stakeholders, Needs,
  Requirements, Behavior, Logical, Physical, Verification, Analysis, AROU, Evolution), with the week that fills each.

### 3.2 Element mapping (artifact type → construct)

From `MAPPING_KINDS` (`week08/labBrief.ts`, a **course convention**: the sources give constructs, not a migration
method) and the reference realisation (`sysml/reference/README.md` §3.2):

| Artifact | Package | SysML v2 construct | Modeled in |
|---|---|---|---|
| ENT | Context | part def (the enterprise) | W8 |
| PRT | Physical | part usage owned by the system-of-interest part | W8 |
| EXT | Context | part usage in the context part | W8 |
| STK | Stakeholders | part def (type of stakeholder parameters) | W8 |
| CON | Stakeholders | concern with subject and stakeholder parameters | W8 |
| REL | Stakeholders | dependency tagged with a relationship keyword | W8 |
| MGO, NEED | Needs | requirement with a subject (NEED: stakeholder parameters, framing its concerns). Course working mapping: SysML v2 has no separate "need" element | W9 |
| REQ-STK, REQ-SYS | Requirements | requirement usage with subject, `doc` statement, required constraint, short name = ID | W9 |
| CAP | Needs | action def | W10 |
| SCN | Behavior | use case with actors | W10 |
| FN | Logical | action usage | W10 |
| LOG | Logical | part def and part usage | W10 |
| PHY | Physical | part def and part usage | W11 |
| INFO | Physical | item def | W11 |
| IF | Physical (external interfaces in Context) | interface usage connecting ports | W11 |
| VER | Verification | verification case | W12 |
| MOE, MOP, TPM | owned by what they measure | attribute (TPM with estimates over time) | W12 |
| TECH | Analysis | part def with a readiness attribute | W13 |
| ALT, CRIT, DEC | Analysis | part usage (configuration); calculation; analysis case result with rationale | W13 |
| A, U, R, O | AROU | metadata annotation | W13 |
| INC | Evolution | to be decided with the instructor | W14 |

### 3.3 Relationship mapping: native SysML vs course-level

Only `satisfy`, `verify`, `allocate` and `dependency` are SysML keywords among the reference model's link
realisations; the other course link types use a library concept where one matches, otherwise a `dependency` tagged with
a local metadata definition (`sysml/reference/README.md` §3.3). The project must label each relationship accordingly in
the UI ("SysML relationship" vs "course trace realised as a tagged dependency") and never call a course trace a SysML
relationship.

| Course relationship | Phase II realisation | Kind | Source |
|---|---|---|---|
| CON derives-from STK; NEED derives-from STK | `stakeholder` declaration in the concern/need | **Native** (stakeholder parameter) | R83 p.166 (W8) |
| NEED/MGO derives-from CON | `frame` of the concern in the requirement | **Native** (frame) | R83 p.167 (W8) |
| REQ derives-from REQ/NEED; MGO derives-from MGO | `#derivation` connection (library `RequirementDerivation`) | **Library** concept | reference README §3.3 (outline) |
| refines | `#refinement` dependency (library `ModelingMetadata::Refinement`) | **Library** metadata on a dependency | reference README §3.3 (outline) |
| X satisfies REQ (satisfier conforms to the subject) | `satisfy Requirements::'REQ-SYS-n' by <element>;` — *asserts* the requirement is satisfied when its subject is bound to the satisfier | **Native** | R83 p.168 (outline); conformance R83 p.161 (outline) |
| X satisfies REQ (satisfier does not conform) | `#satisfies` dependency | **Course** (tagged dependency) | reference README §3.3, §4 |
| allocated-to | `allocate <source> to <target>` | **Native** | R81 pp.111–112 (outline) |
| VER verifies REQ | `verify` in the verification-case objective | **Native** | R84 pp.173, 176 (outline) |
| LOG/AI performs FN | `perform` in the performer | **Native** | reference README §3.3 (page to confirm, W10 author) |
| STK/EXT performs SCN | `actor` in the use case | **Native** | reference README §3.3 (page to confirm) |
| flows-to (port-to-port) | item `flow … of INFO from a.port to b.port` | **Native** | reference README §3.3 (page to confirm, W11 author) |
| flows-to (no port path) | `#receivesFrom` dependency (consumer → producer) | **Course** | reference README §3.3 |
| measures | `#measures` dependency from the `#moe`/`#mop` attribute | **Course** (library `ParametersOfInterestMetadata` tags the attribute; the link is course) | reference README §3.2–3.3 |
| mitigates | `#mitigates` dependency to the AROU risk metadata | **Course** | reference README §3.3 |
| affects (from A/R/O/U) | the AROU metadata is `about` the affected elements | **Native** annotation (metadata about) | reference README §3.3 |
| affects (from TECH/DEC/EXT) | `#affectedBy` dependency (affected → cause) | **Course** | reference README §3.3 |
| stakeholder relationship types | `#regulatedBy`, `#fundedBy`, … dependency per `REL_KEYWORDS` | **Course** keyword on a native dependency | R80 pp.50–51 (W8), `week08/labBrief.ts` |
| contains (PHY→CMP, ENT→PRT) | composite part usage nesting | **Native** (ownership) | R80 p.49, p.64 (W8) |
| connects / carries | `interface … connect a.port to b.port`; carried items typed on ports | **Native** | reference README §3.2 (page to confirm, W11 author) |
| covers (SCN→NEED/CAP) | no SysML construct; recorded as a `doc` line or a course-tagged dependency | **Course only** | (new; decide with W10 author) |
| delivers / precedes (INC) | undecided (MAPPING_KINDS INC: "to be decided with the instructor") | **Undecided** | — |
| evidences (EVD→VER) | verification-case result values / verdict | Native result values; the link itself is course | R84 (outline) |

Teaching rule (directive §3.D): conceptual teaching diagrams in the app are labeled "course diagram"; only text accepted
by the course-designated checker (OMG SysML v2 Pilot Implementation, `npm run content:sysml`) is labeled "checker
accepted", and acceptance is never described as proof that the model says what the register says (Week 8 lab tool
wording, `src/workbench/week8/state.ts` header).

---

## 4. Week 8 baseline transformation

### 4.1 Workflow

The Week 8 lab tool (`#/week/8/lab/tool`) opens the project transformation view `#/project/model` in project mode. It
reuses the Week 8 pipeline end to end; only the source changes from files to the project.

1. **Freeze the Phase I baseline.** If no Week 7 package exists, the team is asked to save one: a `PKG-001` manifest
   and a `milestone` snapshot (data model §5). The transformation always works against a named baseline, so later
   Phase I edits show as "changed since baseline".
2. **Build the source.** `sourceFromProject(project)` (architecture §4, `adapters/week8.ts`) produces the
   `ImportSource` that `skeleton.ts` already consumes, now with the Week 2–7 kinds filled from artifacts instead of the
   hand counts (`ManualRow`).
3. **Propose mappings.** For each active artifact, look up its rule in `MAPPING_KINDS`; create a `ModelMapping` with
   status `mapping-proposed` when a rule exists, `not-mapped` when none exists (unmapped kind, §4.2).
4. **Audit.** Run `auditFindings(src)` (defect / gap / unmapped / info) plus project-level insufficiency checks (§4.3).
   Attach findings to mappings.
5. **Generate.** `generateSysml(src)` writes `team-NN-model-v01.sysml` (Context, Stakeholders, SOI part; every later
   package present with the week that fills it). Model elements (`ModelElement`) are recorded for every declared ID
   with `conformance: 'generated-text-unchecked'`.
6. **Check.** The team runs the file through the course checker (`#/week/8/lab/checker` instructions; `npm run
   content:sysml` for staff). When the team records an accepted check, elements in that file move to
   `conformance: 'checker-accepted'` with the date. The app does not run the Java checker in the browser.
7. **Confirm.** The team confirms each Week 8 mapping (ENT, PRT, EXT, STK, CON, REL) individually or per type after
   reviewing the left/right pair; confirmation sets `mapped` with `confirmedBy` and the artifact's revision.
8. **Disposition.** Every gap and unmapped finding needs a recorded disposition (`Finding.disposition`), as today.
9. **Export.** Mapping matrix Markdown (existing), the `.sysml` file, and the project export.

Screen layout (detail in `UI_UX_REDESIGN_PROPOSAL.md`): **left** = Phase I package grouped by MAPPING_KINDS row and
Phase I week, each artifact with ID, title, validation and review state; **right** = model package tree with
constructs and short names; a **status column** between them with the five statuses; a findings panel filtered to the
selection. Selecting an item highlights its counterpart on the other side.

Teaching points carried by the screen (directive §9): an engineering **document** item (the register row), a **model
element** (the declared construct with its short name) and a **traceable relationship** (the stored or modeled link)
are shown as three different things; a row can be mapped while its relationships are still unmodeled.

### 4.2 Unmapped kinds (proposed course rules, instructor review needed)

| Prefix | Proposed package / construct | Week |
|---|---|---|
| CONOPS | Behavior: `doc` of the package or a top-level use case's `doc` | 10 |
| CMP | Physical: part usage nested in its PHY part | 11 |
| VP | Views: viewpoint def framing its concerns (R85 p.181, W8) | 14 |
| FG | Logical: action def grouping its FN actions (or package) | 10 |
| AI | Logical: part with `@AIEnabledCapability` metadata (as the reference) | 10 |
| I, ICR | AROU: metadata annotation (issue, change request) | 13 |
| TRD | Analysis: trade-study analysis case (library `TradeStudies`) | 13 |
| EVD, ANL, PKG, RID | Verification results; Analysis results; not modeled (manifest); not modeled (review record) | 12–14 |

### 4.3 Insufficiency findings (document information not sufficient for formal modeling)

Existing (`skeleton.ts` `auditFindings`): relationship end not a registered stakeholder (defect); enterprise unnamed;
SOI not stated; stakeholder with no concern; concern with no stakeholder; name shadowing; unmapped kinds. Added per type
from the project, all classed `gap` unless they would make the generated text fail the checker (then `defect`):

| Code | Condition | Why it blocks formal modeling |
|---|---|---|
| req-no-subject | REQ whose subject (the SOI or a PHY/LOG) cannot be determined | A requirement usage needs a subject; a satisfier must conform to its definition (R83 p.161, outline) |
| req-no-value | performance REQ without a value or TBD/TBR | No required constraint can be written |
| scn-no-actor | SCN without actors tied to a STK or EXT | Use-case actors must be typed by part defs |
| if-ends | IF without both ends | An interface connects two ports |
| fn-unallocated | FN with no performer and no allocation | Logical/physical allocation cannot be modeled |
| measure-no-unit | MOE/MOP/TPM without unit or threshold | Attribute type and constraint undefined |
| ver-no-method | REQ without a verification method | Week 12 verification case cannot be planned |
| copied-unadapted | artifact copied from AeroLink practice, not adapted | Practice content must not enter the team model |
| suspect-link | relationship in `suspect` state | Its meaning is unconfirmed |

### 4.4 Mapping status derivation

| Status | Set when | Cleared when |
|---|---|---|
| Not mapped | No rule for the type, or the team rejected the proposed rule | A rule is chosen (custom, with reason) |
| Mapping proposed | A rule exists and no blocking finding applies | The team confirms (→ Mapped) |
| Mapped | A person confirmed it (`confirmedBy`) and no blocking finding applies | The artifact is revised after confirmation (→ Needs review) or a defect appears (→ Invalid or incomplete) |
| Needs review | The artifact's `revision` > `sourceRevision`, or a relationship it depends on turned `suspect` | A person reconfirms or remaps (rationale recorded) |
| Invalid or incomplete | A `defect` finding applies, or a `gap` finding of the insufficiency list without a disposition | The record is fixed, or the gap is dispositioned (gap only) |

The tool never sets Mapped on its own and never treats checker acceptance as Mapped.

---

## 5. Change impact

### 5.1 Material change

A change set is material for impact when it changes, on an artifact: `title`, `description`, any attribute other than
presentation-only ones (`owner`, `aiAssisted`, attribute order), `status` (retire/restore), a renumbering; or on a
relationship: creation, retirement, type, ends. Typo fixes are material too (the tool cannot judge meaning); the review
flag is cheap to clear.

### 5.2 Algorithm (`src/project/model/impact.ts`)

```ts
type Flag = { target: string /* uid */; kind: 'artifact' | 'relationship'; cause: ReviewCause }

function impactOf(doc: ProjectDoc, changedUid: string, change: ChangeSet, maxDepth = 3): Flag[] {
  const flags: Flag[] = []
  const seen = new Set([changedUid])
  let frontier: { uid: string; path: string[] }[] = [{ uid: changedUid, path: [] }]
  for (let d = 1; d <= maxDepth && frontier.length; d++) {
    const next: typeof frontier = []
    for (const { uid, path } of frontier) {
      for (const rel of activeOrSuspectRelationshipsTouching(doc, uid)) {
        const dir = VOCABULARY[rel.type].impact           // '→from' | '→to' | 'both' | 'none'
        const other = rel.from === uid ? rel.to : rel.from
        const propagates =
          dir === 'both' ||
          (dir === '→from' && rel.to === uid) ||           // a supplier changed: flag the dependent
          (dir === '→to' && rel.from === uid)
        if (!propagates) continue
        if (d === 1) flags.push({ target: rel.uid, kind: 'relationship', cause: causeOf(change, changedUid, [...path, rel.id]) })
        if (!seen.has(other)) {
          seen.add(other)
          flags.push({ target: other, kind: 'artifact', cause: causeOf(change, changedUid, [...path, rel.id]) })
          // structural 'contains' and 'both' links propagate one hop only, to avoid flooding
          if (rel.category !== 'structure') next.push({ uid: other, path: [...path, rel.id] })
        }
      }
    }
    frontier = next
  }
  // mappings of every flagged artifact (and of the changed one, if mapped) → needs-review
  return flags
}
```

Applying the flags (one `system` change set, linked to the triggering change):

- Each flagged artifact: `review` becomes `needs-review` (causes accumulate; an artifact already in review gets the
  new cause added).
- Each directly involved relationship: status `suspect` if it was `active`.
- Each `ModelMapping` of a flagged or changed artifact in status `mapped`: `needs-review`.
- Retiring an artifact flags exactly as a material change, and its relationships become `suspect` (integrity I8, I13).

Rules (directive §4):

- **Never auto-delete.** No impact step removes or retires anything.
- **Never auto-valid.** No step sets `reviewed`, `mapped` or `passing` without a person (validation `passing` is
  recomputed from the course checks, which state what passes, not that the engineering is right).
- **Preserve history.** Flags are operations with `before` values in the change log.
- Clearing: on the artifact or relationship, "Reviewed: still holds" requires a rationale and records the causes it
  cleared; editing the flagged item also offers to clear with "Updated in response".
- Depth: default 3 hops (the `impactSet` default), adjustable in the impact explorer (`#/project/trace`), which shows
  each flagged item with its path, so the method is visible (as the Week 13 impact teaching requires).

### 5.3 Worked example (what the tests reproduce)

A team edits `REQ-STK-002`'s statement. Impact: `REQ-SYS-004 derives-from REQ-STK-002` (→from) flags REQ-SYS-004 and
the link; `VER-002 verifies REQ-STK-002` flags VER-002; `PHY-003 satisfies REQ-STK-002` (both) flags PHY-003; at depth
2, `REQ-SYS-004`'s own dependents (`VER-004`, `FN-006` via allocated-to) are flagged; the parent `NEED-003`
(REQ-STK-002 derives-from NEED-003, →from) is **not** flagged, because a child's change does not invalidate its parent.
If REQ-STK-002 is mapped (Week 9), its mapping becomes Needs review.

---

## 6. Continuity across weeks

- **No re-entry.** Weeks 2–5 tools read earlier-week artifacts from the project by projection (architecture §8); Week 8
  reads the project (§4.1). The JSON-file chain remains only for legacy and LMS submission.
- **Every Phase II week names its Phase I source** (COURSE_SCHEDULE.md rule 6): the milestone page for Weeks 8–14
  lists the Phase I artifacts it models (Week 8 ↔ Week 1, Week 9 ↔ Week 2, Week 10 ↔ Weeks 2 and 4, Week 11 ↔ Week 5,
  Week 12 ↔ Weeks 2 and 3, Week 13 ↔ Week 3, Week 14 ↔ Weeks 6 and 7) with their mapping status.
- **Baseline diff.** After Week 7, any change to a Phase I artifact shows "changed since Phase I baseline (PKG-001)"
  with the diff, so the Week 14 defence can show continuity and justified divergence.

---

## 7. Tests that prove continuity

Unit tests run in Vitest with the memory adapter; end-to-end tests in Playwright with IndexedDB. A test is reported
passed only after it has been run (directive §12).

| ID | Test | Level | Proves |
|---|---|---|---|
| T-C1 | Import `teamFixture` (food bank) via `fromTeamRecord`; `sourceFromProject` yields the same `ImportSource` as `sourceFromTeam(teamFixture)` | unit | W1 data reaches the Week 8 pipeline unchanged |
| T-C2 | Generated `.sysml` from the project equals the generator output from the fixture file path (byte-identical) | unit | No drift between file path and project path |
| T-C3 | Create project in the UI, add 2 stakeholders, 1 concern, 1 need; open `#/project/model`; the same IDs appear on the left with Mapping proposed and in the generated text on the right | e2e | Directive demo step 8; W1 data visible in W8 |
| T-C4 | Edit a stakeholder name after confirming its mapping; mapping turns Needs review; the generated text shows the new name | unit + e2e | Change propagates to the model view |
| T-C5 | Change `REQ-STK` statement in a seeded project; REQ-SYS child, VER and satisfier flagged; parent NEED not flagged; links suspect; mapping Needs review | unit | Requirement change affects model traceability, direction-aware |
| T-C6 | Retire a NEED; no relationship removed; all its relationships suspect; dependents flagged | unit | Never auto-delete |
| T-C7 | No code path sets `mapped`/`reviewed` without a `confirmedBy`/rationale (property test over random op sequences) | unit | Never auto-valid |
| T-C8 | Edit a Week 1 need in My Project; the Week 2 tool (project mode) shows the new wording in its Week 1 snapshot fields without any import | e2e (P2) | Cross-week continuity, no re-entry |
| T-C9 | `threadsFrom` over `projection(project)` for a seeded complete thread returns `complete: true`; removing the VER link drops it to step 8 | unit | Digital thread runs on team data |
| T-C10 | `projection(project)` passes `validateModel` with zero errors for every fixture | unit | The projection stays inside the AeroLink vocabulary |
| T-C11 | Export → import (as separate project) → export: identical documents apart from `exportedAt` and integrity | unit | Stable IDs and relationships survive transfer |
| T-C12 | Every relationship type in the vocabulary has a Phase II realisation row (§3.3) labeled native / library / course / undecided | unit (data) | No unlabeled SysML claims |
