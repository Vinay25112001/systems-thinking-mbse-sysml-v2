# Canonical Engineering Data Model

**Status:** design, ready to implement as `learning-studio/src/project/model/*.ts`. Written 2026-10-19 under DECISION_LOG
A22 and directive §4. Schema version **1**.

The model is independent of any screen. Lab tools, the artifact library, the Week 8 transformation and every export
read and write it through pure functions. It is a **superset** of the AeroLink model in
`learning-studio/src/model/engineering.ts`: every element kind and every `LINK_RULES` combination that is valid there
stays valid here, so the existing impact, thread and validation functions can run over a projection of a project.

Single-source rule: enumerations already defined in a lecture lab brief (scenario kinds, requirement types,
verification methods, risk categories, handling options, view kinds, interface kinds, need priorities, relationship
types) are **imported** from `src/content/lectures/weekNN/labBrief.ts`, never retyped.

Paths are relative to `learning-studio/`.

---

## 1. Principles

1. One project document per team enterprise; everything a team produces in Weeks 1–14 is an `Artifact`, a
   `Relationship`, a `ModelElement`/`ModelMapping`, or a field of `Project`, `Team` or `Milestone`.
2. Every artifact has a **course ID** (human-readable, stable, never reused) and an internal **uid** (UUID) that
   survives renumbering, so merges can tell "the same artifact edited twice" from "two artifacts that got the same ID".
3. Every cross-artifact reference is a `Relationship` with a type from a closed vocabulary, allowed source/target types,
   rationale and status. Nested rows inside one artifact (scenario steps, ConOps environment rows, trade scores, TPM
   profile points) are attributes; ID references inside nested rows are **attribute references**, checked for
   integrity but not part of the trace graph.
4. Nothing is deleted. Artifacts are retired with a reason (tombstone keeps the ID). Relationships are retired, never
   removed silently. Restores and imports add revisions.
5. Validity is never asserted by the tool. The tool reports which course checks pass (`validation`) and which items
   need human review after a change (`review`); only a person clears a review flag, with a rationale.

---

## 2. Identifiers

### 2.1 Course ID scheme

Form: `PREFIX-nnn` (three digits, zero-padded; four digits allowed after 999), with the two-part prefixes `REQ-STK` and
`REQ-SYS`. Regex per prefix in `src/project/model/ids.ts`:

```ts
export const ID_RE = (prefix: string) => new RegExp(`^${prefix.replace('-', '\\-')}-\\d{3,4}$`)
```

| Prefix | Artifact type | Introduced | Prefix | Artifact type | Introduced |
|---|---|---|---|---|---|
| ENT | Enterprise (exactly one: ENT-001) | W1 | TECH | Technology assessed | W3 |
| PRT | Element inside the SOI boundary | W1 | A | Assumption | W2 |
| EXT | External system or actor (context) | W1 | R | Risk | W3 |
| STK | Stakeholder | W1 | O | Opportunity | W3 |
| CON | Stakeholder concern | W1 | U | Unknown (TBD/TBR) | W2 |
| MGO | Mission (MGO-001) and goals/objectives | W1 | I | Issue (issue log) | W3 |
| NEED | Stakeholder need | W1 | TPM | Technical performance measure | W3 |
| CONOPS | Concept of operations (one: CONOPS-001) | W2 | TRD | Trade study (new prefix, §4) | W3 |
| SCN | Operational scenario | W2 | ALT | Trade alternative | W3 |
| CAP | Capability | W2 | CRIT | Trade criterion | W3 |
| REQ-STK | Stakeholder requirement | W2 | DEC | Decision record | W3–W4 |
| REQ-SYS | System requirement (incl. W5 interface requirements) | W2, W5 | VP | Viewpoint | W4 |
| MOE | Measure of effectiveness | W2 | FG | Function group | W4 |
| MOP | Measure of performance | W2 | FN | Function | W4 |
| VER | Verification plan / case | W2 (method), W12 (case) | LOG | Logical element | W4 |
| EVD | Verification evidence / result (new) | W12 | PHY | Physical element | W4 |
| INC | Roadmap increment | W6 | INFO | Information item | W4 |
| PKG | Phase I package / baseline record (new) | W7 | AI | AI-enabled capability card | W4 |
| ANL | Analysis result (new) | W13 | CMP | Component | W5 |
| RID | Review item (design review finding, new) | W7, W14 | IF | Interface | W5 |
| | | | ICR | Interface change request | W5 |

Non-artifact identifiers:

| Prefix | Entity | Notes |
|---|---|---|
| REL | Stakeholder relationship (Week 1 Part 4 rows) | Kept as a separate series because students, the Week 1 record and the Week 8 mapping count REL rows |
| LNK | Trace relationship (every other relationship) | Same series as `Workspace.tsx` uses for AeroLink |
| MEL | Model element (Phase II) | |
| MAP | Model mapping | |
| CHG | Change set | Six digits, per project |
| SNP | Snapshot | |

### 2.2 Uniqueness and issuance

- A course ID is unique within a project across all artifact types (the prefix guarantees this).
- `Project.issued[prefix]` holds the highest number ever issued; `nextId(prefix) = max(issued[prefix], max present) + 1`.
  Counters never decrease; retiring an artifact keeps its ID taken forever. This generalizes the per-record `issued`
  maps of `team.ts` and `week{2..5}/record.ts`.
- `MGO-001` is reserved for the mission (as in `team.ts` `MISSION_ID`); goals start at `MGO-002`.
- `ENT-001` and `CONOPS-001` are singletons.
- Imported IDs keep their numbers unless they collide (§10.4); a renumbered artifact records `formerIds` and every
  reference is rewritten in the same operation.
- `uid` is `crypto.randomUUID()` at creation (fallback: time + random), never shown in the UI, carried in exports.

---

## 3. Project document

```ts
// src/project/model/types.ts
export const SCHEMA_VERSION = 1

export type ProjectDoc = {
  schemaVersion: 1
  project: Project
  team: Team
  artifacts: Record<string, Artifact>          // keyed by uid
  relationships: Record<string, Relationship>  // keyed by uid
  milestones: Milestone[]                      // weeks 1..14, always 14 entries
  modelElements: Record<string, ModelElement>  // keyed by uid (Phase II)
  mappings: Record<string, ModelMapping>       // keyed by uid
  findings: Finding[]                          // transformation/audit findings with dispositions
  issued: Record<string, number>               // per prefix, incl. REL, LNK, MEL, MAP, CHG, SNP
  rev: number                                  // increments on every saved change set
}

export type Project = {
  uid: string
  title: string                 // defaults to the enterprise name; editable
  createdAt: string             // ISO 8601
  updatedAt: string
  createdWith: { app: 'sysml-learning-studio'; version: string }
  course: { term?: string; section?: string; teamLabel?: string }   // teamLabel = "Team 07" as used in file names
  /** Week 8+: the model purpose statement (was W8State.purpose). */
  model: { purpose: string; rootPackage?: string; options: { assessment: boolean; relationships: 'all' | 'conflicts' } }
}
```

### 3.1 Enterprise

The enterprise is the singleton artifact `ENT-001` (§4), not a separate entity, so it can be traced, revised and mapped
like any other artifact. Overview fields (name, domain, problem, suitability, SOI statement, approval) are its
attributes.

### 3.2 Team, members, roles

```ts
export type Team = {
  label: string                         // "Team 07" (was TeamRecord.team)
  threePersonTeam: boolean              // reduced minimums (A21 provisional decision 4)
  members: Member[]
  roles: Record<CourseRole, string>     // role → member initials; CourseRole from src/workbench/week1/logic.ts COURSE_ROLES
  decisionRules: string
  norms: string
  prefixOwnership: Record<string, string>   // prefix → member initials (one owner per prefix; parsed from charter "JS: STK, CON")
  charterUpdatedAt?: string
}
export type Member = {
  initials: string        // 2–4 letters, validated with ownerProblem (src/components/ProvenanceOwnerFields.tsx)
  displayName?: string    // optional; default policy: initials only (faculty decision F7, data protection)
  active: boolean         // a member who leaves stays in history
}
```

The charter is a team property, not an artifact, because it is not traced; its revisions are still in the change log.

---

## 4. Artifact

```ts
export type Artifact = {
  uid: string
  id: string                          // course ID, e.g. 'NEED-004'
  type: ArtifactType                  // = the prefix
  title: string                       // the item's name ("Pad throughput")
  description: string                 // the statement text (need statement, requirement statement, risk statement, ...)
  attributes: Record<string, AttrValue>   // typed per type (§5); values FICTIONAL/team-owned
  status: 'active' | 'retired'
  retired?: { at: string; reason: string; by: string }
  provenance: Provenance
  rationale?: string                  // why the item exists or reads as it does
  source?: string                     // free text: interview, document, standard, citation
  validation: ValidationSnapshot      // derived; recomputed on load and on change; stored for export
  review: ReviewState
  milestones: number[]                // week numbers this item belongs to (created in, revised for)
  owner?: string                      // member initials responsible (W7 convention)
  aiAssisted: boolean                 // AI-suggested, reviewed by the team (W7 / RB-12.3 tag)
  unresolvedRefs: string[]            // typed IDs that did not resolve (kept, never dropped)
  formerIds: string[]                 // IDs this artifact had before a renumbering
  created: Stamp
  revised: Stamp
  revision: number                    // per-artifact counter, +1 per change set touching it
}
export type AttrValue = string | number | boolean | null | AttrValue[] | { [k: string]: AttrValue }
export type Stamp = { at: string; by: string; change: string }   // by = self-declared initials; change = CHG id

export type Provenance =
  | { kind: 'own' }
  | { kind: 'copied-from-practice'; copiedFrom: { case: 'AeroLink'; id: string }; at: string; adapted: boolean }
  | { kind: 'imported'; from: { format: string; version: number | string; file?: string; sha256?: string }; at: string }
  | { kind: 'ai-suggested-reviewed' }       // also expressible as own + aiAssisted; kept for legacy STUDENT_PROVENANCE values

export type ValidationSnapshot = {
  state: 'unchecked' | 'failing' | 'passing'   // passing = the course checks for this type pass; never "valid"
  gates: { id: string; ok: boolean; message: string }[]
  advisories: { id: string; message: string }[]
  checkedAt: string
  checker: string                              // e.g. 'week1/team.ts needStatus'
}
export type ReviewState =
  | { state: 'none' }
  | { state: 'needs-review'; since: string; causes: ReviewCause[] }
  | { state: 'reviewed'; at: string; by: string; rationale: string; clearedCauses: ReviewCause[] }
export type ReviewCause = { change: string; changedId: string; path: string[]; summary: string }   // path = LNK ids
```

Validation is computed by the existing week checks through the projection adapters (e.g. a NEED's gates come from
`needStatus(n, r).assessment` in `team.ts`; a REQ-STK's from `assessRequirement` in `week2/record.ts`). Types with no
existing checker are `unchecked` until one is written.

---

## 5. Artifact types (Weeks 1–14)

Each type is registered in `src/project/model/vocabulary.ts`:

```ts
export type ArtifactTypeInfo = {
  prefix: ArtifactType; label: string; phaseWeek: number
  library: LibraryGroup          // directive §3.C.3 grouping
  attributes: AttrSpec[]         // name, kind, required, enum source
  singleton?: boolean
  sysml?: string                 // target construct, from week08/labBrief.ts MAPPING_KINDS where defined
}
```

Library groups (directive §3.C.3): stakeholders · needs · capabilities · ConOps and scenarios · requirements ·
technology assessments · AROU and risk registers · trade studies · architecture elements · information flows ·
components · interfaces · roadmaps · model elements · verification plans · analysis results · traceability.

| Type | Group | Key attributes (beyond title/description) | References that become relationships |
|---|---|---|---|
| ENT | stakeholders/overview | `domain`, `problem`, `suitability` (why it fits 14 weeks), `soi` (statement), `approval: { decision: ''\|'pending'\|'approved'\|'revise', decidedOn }` | ENT contains PRT |
| PRT | architecture | — | contained by ENT |
| EXT | stakeholders/context | `kind: 'system'\|'actor'`, `crosses`, `direction: 'in'\|'out'\|'both'`, `noInterfaceReason` (W5) | — |
| STK | stakeholders | `role` (ROLES, `week1/stakeholders.ts`), `stage` (STAGES), `side: internal\|external`, `approving: boolean\|null`, `influence: 1–5\|null`, `influenceReason`, `interest`/`support` (optional) | — |
| CON | stakeholders | — (text in description) | CON derives-from STK |
| MGO | needs | `level: 'mission'\|'goal'\|'objective'`, `target`, `unit`, `horizon` (objectives, W2) | MGO derives-from MGO (goal → mission), MGO derives-from CON |
| NEED | needs | `conditions`, `priority` (NEED_PRIORITIES, `week01/labBrief.ts`), `selfCheck: Record<CriterionId, boolean>`, `justification`, `addedIn: 1\|2` | NEED derives-from STK, NEED derives-from CON, NEED derives-from MGO |
| CONOPS | ConOps | `soiName`, `soi`, `existing`, `justification`, `restrictions[]`, `proposed`, `environment: {id,label,value}[]` (ENV rows), `interactions[]`, `constraints[]` | — |
| SCN | ConOps | `kind` (SCENARIO_KINDS), `actors: {id,name,primary,environment,represents?}[]` (ACT rows; `represents` = STK/EXT id, attribute reference), `trigger`, `preconditions`, `steps: {actor,action}[]`, `alternates[]`, `success`, `failure`, `clinic`, `discoveries: {id,where,kind,ref,text}[]` (D rows; `ref` = attribute reference) | SCN covers NEED (coverage rows, with `steps`), SCN covers CAP |
| CAP | capabilities | — | CAP derives-from NEED, CAP refines CAP |
| REQ-STK, REQ-SYS | requirements | `reqType` (REQ_TYPES), `method` (VER_METHODS), `criterion`, `reviewer`, `tbx[]` (TBD/TBR tokens), `childlessDisposition`, `interface` (W5 interface requirements) | REQ derives-from NEED/CAP/REQ-STK; U affects REQ; IF satisfies REQ (W5) |
| MOE, MOP | requirements/measures | `definition`, `unit`, `threshold`, `thresholdSource` | MOE/MOP measures X; MOP measures MOE |
| VER | verification plans | `method`, `level`, `procedure`, `successCriteria`, `environment`, `status: planned\|ready\|executed` | VER verifies REQ/NEED/MOP/TPM |
| EVD | verification plans | `result: pass\|fail\|inconclusive`, `date`, `measured`, `artifactRef` (file or link text) | EVD evidences VER |
| TECH | technology assessments | `does`, `benefits`, `limitations`, `trl: 1–9`, `basisKind: evidence\|assumption`, `evidence`, `critical`, `criticalWhy` | A affects TECH (TRL claim), R affects TECH (maturity risk), TECH affects REQ/CAP |
| A | AROU | `validation`, `fromWeek: 2\|3` | A affects X |
| U | AROU | `tbx`, `closeBy`, `validation` | U affects X |
| R | AROU | `category` (RISK_CATEGORIES), `condition`, `ifEvent`, `then`, `likelihood 1–5`, `consequence 1–5`, `likelihoodWhy`, `consequenceWhy`, `handling` (HANDLING), `treatment`, `trigger` | R affects X; X mitigates R |
| O | AROU | `action` | O affects X |
| I | AROU | `action` | I affects X |
| TPM | requirements/measures | `unit`, `sense` (Sense), `threshold`, `objective`, `cbe`, `contingency`, `basis`, `profile: {label,month,cbe,contingency}[]` | TPM derives-from MOP, TPM measures REQ, R affects TPM |
| TRD | trade studies | `question` (decision), `scores: Record<ALT, Record<CRIT, string>>`, `screens: {id,name,test,results}[]` (SCREEN rows), `sensitivityNote`, `recommended` (ALT id, attribute reference), `conditions[]`, `residualRisk`, `wouldChangeIf`, `derived[]` | TRD contains ALT, TRD contains CRIT, TRD derives-from REQ/MGO (W3 `trace`), DEC derives-from TRD |
| ALT | trade studies | `baseline: boolean` | contained by TRD |
| CRIT | trade studies | `unit`, `walkAway`, `stretch`, `swingPoints`, `weight` (derived) | CRIT derives-from MOE |
| DEC | trade studies / architecture | `question`, `alternatives`, `chosen`, `rationale` | DEC derives-from TRD/REQ; DEC affects X; DEC mitigates R |
| VP | architecture | `kind` (VIEW_KINDS), `purpose`, `serves`, `form` | VP frames CON, VP derives-from STK |
| FG | architecture | — | FG contains FN |
| FN | architecture | `inputs[]`, `outputs[]`, `planning` (reason a function has no scenario), `criterion` (allocation criterion id), `why`, `human` | FN derives-from CAP, FN derives-from SCN, REQ allocated-to FN, LOG performs FN, FN allocated-to PHY |
| LOG | architecture | — | LOG allocated-to PHY, LOG performs FN |
| PHY | architecture/components | `responsibility`, `cardOwner` (W5 Card) | PHY satisfies REQ, PHY contains CMP |
| INFO | information flows | `content`, `data`, `information`, `route`, `sensitivity` | PHY/LOG/FN flows-to INFO, INFO flows-to PHY/LOG/FN/DEC |
| AI | architecture | `inputs`, `outputs`, `oversight`, `failure`, `dataQuality` | AI allocated-to PHY (host), AI performs FN (supports) |
| CMP | components | `kind` (COMPONENT kinds, `week05/labBrief.ts`), `responsibility` | PHY contains CMP, CMP performs FN |
| IF | interfaces | `kind` (INTERFACE_KINDS), `direction` (free text, never parsed), `medium`, `constraint`, `ownerA`, `ownerB`, `verification`, `protection`, `noProtectionReason`, `degraded`, `standard`, `exposed`, `relays` | IF connects (×2, role endA/endB), IF carries INFO, IF satisfies REQ, R affects IF |
| ICR | interfaces | `change`, `impact`, `decision`, `decider` | ICR affects IF |
| INC | roadmaps | `order`, `window` (date or term), `entryCriteria`, `exitCriteria`, `transition` | INC delivers CAP/REQ/PHY/CMP/FN/TECH, INC precedes INC |
| PKG | (Week 7) | `baselineDate`, `contents` (derived list of artifact IDs + revision numbers), `presentationRef` | — (a PKG is a frozen manifest; it references a snapshot id) |
| ANL | analysis results | `kind: trade\|sensitivity\|impact\|parametric`, `inputs`, `result`, `conclusion` | ANL derives-from TRD/REQ/TPM, ANL affects DEC |
| RID | (Weeks 7, 14) | `reviewer`, `severity`, `disposition`, `closedAt` | RID affects X |

Notes:

- **TRD is a new prefix.** The Week 3 tool stores one trade study without an ID (`Week3Record.trade`) and no DEC. The
  adapter creates `TRD-001` for it and raises an info finding asking the team to record its decision as a DEC (the
  Week 8 mapping expects DEC for Week 3; `week08/labBrief.ts`). Instructor review needed (roadmap decision F6).
- **EVD, PKG, ANL, RID are new prefixes** for Week 7 and Weeks 12–14 artifacts that no tool issues yet. They are
  proposals for the Phase II lecture authors to confirm or rename before P5.
- **ACT, ENV, D, SCREEN rows stay nested** (schema v1). Promoting them to artifacts later is a schema v2 migration.
- Week 4 `Viewpoint.stakeholders` / `.concerns` / `.serves`, Week 4 `Decision.links`, Week 3 `Technology.affects` and
  every other ID-bearing text field are parsed into relationships on import (§11), with unresolved tokens kept.

---

## 6. Relationship

```ts
export type Relationship = {
  uid: string
  id: string                    // 'REL-nnn' (category 'stakeholder') or 'LNK-nnn' (category 'trace' | 'structure')
  category: 'trace' | 'structure' | 'stakeholder'
  type: RelationshipType
  from: string                  // artifact uid  (stored by uid; exported with both uid and course id)
  to: string                    // artifact uid
  role?: 'endA' | 'endB'        // IF connects only
  rationale?: string
  note?: string                 // REL rows: the register note
  attributes?: Record<string, AttrValue>   // e.g. covers: { steps: '2–4' }
  status: 'active' | 'suspect' | 'retired'  // suspect = an end changed or was retired; needs review
  retired?: { at: string; reason: string; by: string }
  provenance: Provenance
  created: Stamp
  revised: Stamp
}
```

### 6.1 Vocabulary

`from type to` reads as a sentence. "Impact" says whose change flags what (used by the change-impact algorithm,
`CROSS_PHASE_TRACEABILITY_PLAN.md` §5): **→from** = a change to `to` flags `from` (the dependent); **→to** = a change to
`from` flags `to`; **both**.

Trace category (the ten course types of `LINK_RULES`, extended where noted with *):

| Type | Allowed `from` | Allowed `to` | Impact |
|---|---|---|---|
| derives-from | CON, NEED, MGO, CAP, REQ-STK, REQ-SYS, SCN, CRIT, FN, TPM, *DEC, *VP, *ANL | STK, CON, NEED, MGO, CAP, REQ-STK, REQ-SYS, SCN, MOE, MOP, *TRD, *TPM | →from |
| refines | REQ-STK, REQ-SYS, SCN, NEED, CAP, FN | REQ-STK, REQ-SYS, SCN, NEED, CAP, FN | →from |
| satisfies | FN, LOG, PHY, IF, INFO, AI, CAP, SCN, *CMP | REQ-STK, REQ-SYS | both |
| allocated-to | REQ-STK, REQ-SYS, FN, LOG, CAP, AI | FN, LOG, PHY, AI, *CMP | both |
| verifies | VER | REQ-STK, REQ-SYS, NEED, MOP, TPM | →from |
| measures | MOE, MOP, TPM | MGO, NEED, CAP, REQ-STK, REQ-SYS, PHY, LOG, FN, MOE, MOP, CRIT, *CMP | →from |
| mitigates | REQ-STK, REQ-SYS, FN, PHY, LOG, DEC, VER, TECH, AI, *CMP, *IF | R | both |
| affects | A, R, O, U, TECH, DEC, EXT, *I, *ICR, *ANL, *RID | any artifact type | →to |
| performs | LOG, PHY, EXT, STK, AI, *CMP | FN, SCN, CAP | both |
| flows-to | PHY, LOG, EXT, INFO, FN, AI, *CMP | PHY, LOG, EXT, INFO, FN, AI, DEC, *CMP | both |
| *covers | SCN | NEED, CAP | →from |
| *frames | VP | CON | →from |
| *evidences | EVD | VER | →from |
| *delivers | INC | CAP, REQ-STK, REQ-SYS, PHY, CMP, FN, TECH | →from |
| *precedes | INC | INC | →to |

Structure category:

| Type | Allowed `from` | Allowed `to` | Impact |
|---|---|---|---|
| contains | ENT, PHY, FG, TRD | PRT, CMP, FN, ALT, CRIT | both (one hop) |
| connects | IF | PHY, CMP, EXT, LOG, PRT | →from (an end changes → the IF needs review); exactly one `endA` and one `endB` per IF |
| carries | IF | INFO | both |

Stakeholder category (Week 1 Part 4; `REL_TYPES` in `src/content/lectures/week01/labBrief.ts`, direction semantics in
`REL_KEYWORDS`, `week08/labBrief.ts`): `regulates`, `funds`, `supplies`, `affected-by`, `partners-with`,
`coordinates-with`, `conflicts-with`. From STK to STK only. Impact: none (shown as related, never flagged).

Mapping to the AeroLink model: `projection.ts` turns a project into an `EngineeringModel` by keeping the ten original
types and the element kinds `engineering.ts` knows; extension types and kinds are dropped from that projection only, so
`impactSet`, `requirementCoverage` and `threadsFrom` can be reused as they are.

---

## 7. Integrity rules

Enforced by `integrity.ts` on every operation (refuse) and on load and import (report):

| Code | Rule | On violation |
|---|---|---|
| I1 unique-id | Course IDs unique among artifacts; relationship IDs unique | Refuse; on import → collision handling (§10.4) |
| I2 id-form | ID matches its prefix regex; prefix equals `type` | Refuse |
| I3 no-reuse | A new ID number > `issued[prefix]` | Refuse |
| I4 ends-exist | `from` and `to` are existing artifact uids | Refuse; on import → broken reference listed, relationship not created |
| I5 allowed-pair | (`from.type`, `type`, `to.type`) allowed by §6.1 | Refuse with the sentence form ("CON satisfies REQ-SYS is not an allowed relationship") |
| I6 no-self | `from ≠ to` | Refuse |
| I7 no-duplicate | No two active relationships with the same `from`, `type`, `to` (and `role` for connects) | Refuse (no-op) |
| I8 retired-ends | A relationship to a retired artifact becomes `suspect`, never removed | Automatic status change + review cause |
| I9 singletons | Exactly one ENT-001; at most one CONOPS | Refuse |
| I10 mission | MGO-001 exists when ENT exists and has `level: 'mission'` | Validation issue |
| I11 if-ends | Each active IF has one `endA` and one `endB` connects | Validation issue (not a refusal: drafts are allowed) |
| I12 attr-refs | Attribute references (ACT `represents`, D `ref`, TRD `recommended`, scores/screens keys) resolve | Validation issue; kept |
| I13 no-silent-delete | Retiring an artifact never retires its relationships automatically; they turn `suspect` | Enforced by the operation set (there is no delete op) |
| I14 practice-content | An artifact with `provenance.kind = 'copied-from-practice'` and `adapted = false` does not count toward milestone minimums | Milestone computation |

---

## 8. Revision and change log

```ts
export type ChangeSet = {
  id: string                        // 'CHG-000123'
  at: string
  by: string                        // self-declared initials; '' if not set (shown as "not recorded")
  source: 'editor' | 'import' | 'practice-copy' | 'migration' | 'restore' | 'review' | 'system'
  summary: string                   // generated ("Edited NEED-004 statement"), editable
  rationale?: string                // optional; required for retire, review clearance, restore, replace-import
  ops: Operation[]
  rev: number                       // ProjectDoc.rev after this change
}
export type Operation =
  | { op: 'create-artifact'; artifact: Artifact }
  | { op: 'update-artifact'; uid: string; fields: FieldChange[] }
  | { op: 'retire-artifact'; uid: string; reason: string }
  | { op: 'restore-artifact'; uid: string }
  | { op: 'renumber-artifact'; uid: string; from: string; to: string }
  | { op: 'create-relationship'; relationship: Relationship }
  | { op: 'update-relationship'; uid: string; fields: FieldChange[] }
  | { op: 'retire-relationship'; uid: string; reason: string }
  | { op: 'set-review'; uid: string; kind: 'artifact' | 'relationship'; before: ReviewState; after: ReviewState }
  | { op: 'update-team'; fields: FieldChange[] }
  | { op: 'update-project'; fields: FieldChange[] }
  | { op: 'update-milestone'; week: number; fields: FieldChange[] }
  | { op: 'upsert-mapping'; mapping: ModelMapping; before?: ModelMapping }
  | { op: 'upsert-model-element'; element: ModelElement; before?: ModelElement }
export type FieldChange = { path: string; before: AttrValue | undefined; after: AttrValue | undefined }
```

Every operation carries its `before` values, so any change set can be shown as a diff, inverted (undo) or, in a future
backend, replayed. Per-artifact history = change sets whose ops touch that uid.

Snapshots: `{ id: 'SNP-nnn', at, kind: 'manual'|'milestone'|'pre-import'|'pre-restore'|'pre-migration'|'auto', label, rev, doc }`
(policy in `PROJECT_WORKSPACE_ARCHITECTURE.md` §5.4).

---

## 9. Milestones, submissions, model mapping

### 9.1 Milestone and submission

```ts
export type Milestone = {
  week: number                          // 1..14
  title: string                         // from src/content/course.ts WEEKS (whiteboard title)
  expected: ExpectedArtifact[]          // from the week's labBrief minimums
  state: 'not-started' | 'in-progress' | 'checks-passing' | 'exported' | 'marked-submitted'
  approval?: { decision: 'pending'|'approved'|'revise'; decidedOn: string }   // Week 1 proposal approval mirrors ENT-001
  aiStatement: string                   // per-week AI usage statement (was TeamRecord.aiStatement, WeekNRecord.aiStatement)
  notes: Record<string, string>         // e.g. Week 8 audit answers (W8State.notes), Week 5 ICWG text (icwg, standards)
  exports: SubmissionExport[]
  markedSubmittedAt?: string            // student's own note that the LMS upload was done (the app cannot see the LMS)
}
export type ExpectedArtifact = { type: ArtifactType; min: number; minThreePerson?: number; rule?: string }
export type SubmissionExport = {
  at: string; by: string
  files: { name: string; format: string; version: number | string; sha256?: string }[]
  rev: number                           // project rev exported
  snapshot: string                      // SNP id written at export
  contentState: 'not-ready' | 'pending-approval' | 'ready'
}
```

State rules: `checks-passing` when every expected artifact minimum is met by active, non-practice-unadapted artifacts
whose validation is `passing`, and the week's part checks pass (Week 1: `partsComplete` on the projected Team Record).
`exported` when an export exists with `rev` equal to the current project rev for that week's artifacts. Week 1
`ready` additionally needs the recorded approval, exactly as `recordState` in `team.ts`.

### 9.2 Model elements and mappings (Week 8 onward)

```ts
export type ModelElement = {
  uid: string
  id: string                     // 'MEL-nnn'
  package: string                // MODEL_PACKAGES name (week08/labBrief.ts), e.g. 'Stakeholders'
  construct: string              // 'part def', 'concern', 'requirement', 'use case', ...
  name: string                   // declared name
  shortName?: string             // the Phase I course ID, as <'STK-004'>
  qualifiedName?: string         // e.g. "Stakeholders::'STK-004'"
  textRef?: { file: string; line?: number }   // where it appears in the generated/exported .sysml
  conformance: 'teaching-diagram' | 'generated-text-unchecked' | 'checker-accepted'
  checkedAt?: string             // when the course checker accepted the file containing it
}
export type MappingStatus = 'not-mapped' | 'mapping-proposed' | 'mapped' | 'needs-review' | 'invalid-or-incomplete'
export const MAPPING_STATUS_LABEL: Record<MappingStatus, string> = {
  'not-mapped': 'Not mapped', 'mapping-proposed': 'Mapping proposed', mapped: 'Mapped',
  'needs-review': 'Needs review', 'invalid-or-incomplete': 'Invalid or incomplete',
}
export type ModelMapping = {
  uid: string
  id: string                     // 'MAP-nnn'
  artifact: string               // artifact uid
  elements: string[]             // ModelElement uids (one artifact may map to a def and a usage)
  rule: string                   // MAPPING_KINDS prefix rule used, or 'custom'
  status: MappingStatus
  statusReason: string           // human-readable why
  findings: string[]             // Finding keys that apply
  confirmedBy?: Stamp            // a person confirmed the mapping (required for 'mapped')
  sourceRevision: number         // artifact.revision at confirmation; a newer revision → 'needs-review'
  week: number                   // Phase II week that models it (MAPPING_KINDS.modeledIn)
}
export type Finding = {
  key: string                    // stable: `${code}:${artifactId}`
  cls: 'defect' | 'gap' | 'unmapped' | 'info'     // FINDING_CLASSES, week08/labBrief.ts
  code: string; artifactId: string; text: string
  disposition?: string           // team's recorded disposition (was W8State.dispositions)
  dispositionBy?: Stamp
}
```

Status derivation is specified in `CROSS_PHASE_TRACEABILITY_PLAN.md` §6.2.

---

## 10. Export format and import validation

### 10.1 Whole-project export (`sysml-studio-project`, version 1)

File name: `team-<label>-project-<YYYY-MM-DD>.json`. UTF-8, 2-space indented, keys in the order below.

```jsonc
{
  "format": "sysml-studio-project",       // fixed; import refuses anything else (legacy formats go to adapters)
  "schemaVersion": 1,                      // integer; newer than supported → refuse with "update the app"; older → migrate
  "exportedAt": "2026-10-24T18:03:11Z",
  "exportedBy": "JS",                      // self-declared initials ("" if not set)
  "app": { "name": "sysml-learning-studio", "version": "0.0.0+<git short sha if available>", "edition": "student" },
  "scope": "full",                         // "full" | "phase1-package" (Week 7 package: no Phase II entities)
  "includesHistory": true,                 // change sets included or not (snapshots never are)
  "project":  { /* Project */ },
  "team":     { /* Team */ },
  "artifacts":     [ /* Artifact[], sorted by type order then id */ ],
  "relationships": [ /* Relationship[] + "fromId"/"toId" course IDs for readability, sorted by id */ ],
  "milestones":    [ /* Milestone[14] */ ],
  "modelElements": [ /* ModelElement[] */ ],
  "mappings":      [ /* ModelMapping[] + "artifactId" */ ],
  "findings":      [ /* Finding[] */ ],
  "issued":        { "STK": 9, "NEED": 14, "LNK": 61, "...": 0 },
  "changes":       [ /* ChangeSet[] when includesHistory */ ],
  "integrity": {
    "algorithm": "SHA-256",
    "canonicalization": "JSON of the file without the integrity member, keys sorted recursively, no whitespace",
    "value": "9f2c…"                       // omitted when crypto.subtle is unavailable; import then warns
  }
}
```

Field notes:

- Relationships and mappings are exported with both uids (authoritative) and course IDs (`fromId`, `toId`,
  `artifactId`; informative, rechecked on import).
- `validation` snapshots are exported for readers but **recomputed on import**; imported values are never trusted.
- The checksum detects corruption and accidental hand edits only (no secret); a mismatch is a warning with the choice
  to continue, never a silent acceptance.

### 10.2 Other exports (unchanged formats, generated from the project)

`week1-model-inputs` v3 + Week 1 Markdown (via `toTeamRecord` → `teamModelInputs`, `teamMarkdown`);
`week2-…week5-model-inputs` v1 + Markdown (P2); Week 8 mapping matrix Markdown and `team-NN-model-v01.sysml` (via
`sourceFromProject` → existing generator); a readable whole-project Markdown report (`transfer/report.ts`: overview,
artifacts by type with relationships in and out, open review flags, mapping status, change summary).

### 10.3 Import pipeline

1. **Parse** JSON (error: "This file is not valid JSON.").
2. **Identify**: `format` = `sysml-studio-project` → this pipeline; `week1-model-inputs`, `week2..5-model-inputs`,
   `week8-import` → legacy adapters; anything else → refuse naming the formats accepted.
3. **Shape-check and normalize** (never throws; every problem becomes a message with a path, like
   `importModelInputs`).
4. **Integrity check** of the incoming document alone (§7): duplicate IDs, malformed IDs, broken references, disallowed
   pairs. Errors that make an item unusable exclude that item and are listed; the rest stays importable.
5. **Checksum** verify (warn on mismatch or absence).
6. **Plan** against the current project: classify each incoming artifact and relationship:

| Class | Test | Default action |
|---|---|---|
| new | uid and course ID not in project | create |
| identical | same uid, same content | skip |
| changed-theirs | same uid; differs; local unchanged since the common revision | take theirs (proposed) |
| conflict | same uid; both sides changed since the common revision (or no common revision known) | **student must choose** per item: keep mine / take theirs / keep both (theirs renumbered) |
| id-collision | different uid, same course ID | keep both, theirs renumbered (proposed), or treat as same if names match exactly (offered) |
| only-local | in project, not in file | keep (never deleted by import) |
| broken | references an artifact neither side has | not created; listed |

7. **Choose mode**, shown with the plan's counts:
   - **Open as a separate project** (always available, changes nothing in the current project);
   - **Merge into my project** (applies the plan with the student's per-item choices);
   - **Replace my project** (requires typing the project title to confirm; writes a `pre-import` snapshot first; the
     replaced state remains restorable from History).
8. **Apply** as one change set with `source: 'import'`, provenance `imported` on created items, a `pre-import`
   snapshot before any change, and a summary report kept in History.

Never: silent overwrite, silent deletion, silent renumbering, silent acceptance of a checksum mismatch.

### 10.4 ID collision handling

Renumbering assigns `nextId(prefix)`, records the old ID in `formerIds`, rewrites every incoming relationship and
attribute reference that used it, and lists "EXT-001 (Weather station, from Week 4) became EXT-007" in the plan before
confirmation.

---

## 11. Mapping existing week records to the schema

`→` = becomes. Relationship lines use `from type to`. Fields not listed are carried as attributes of the same name.

### 11.1 Week 1 `TeamRecord` (`src/workbench/week1/team.ts`; JSON `week1-model-inputs` v3)

| Record field | Canonical |
|---|---|
| `team` | `Team.label` |
| `charter.threePersonTeam`, `roles`, `decisionRules`, `norms` | `Team.*`; members = distinct role initials |
| `charter.prefixes` ("JS: STK, CON") | `Team.prefixOwnership` (parsed with `prefixLines`); the raw text is regenerated on projection |
| `proposal.name`, `domain`, `problem`, `why`, `soi` | ENT-001 `title`, `attributes.domain/problem/suitability/soi` |
| `proposal.purpose` | MGO-001 (`level: 'mission'`), description |
| `proposal.goals[]` {id, text} | MGO-nnn (`level: 'goal'`); MGO-nnn derives-from MGO-001 |
| `proposal.inside[]` {id, name} | PRT-nnn; ENT-001 contains PRT-nnn |
| `proposal.decision`, `decidedOn` | ENT-001 `attributes.approval`; mirrored on Milestone 1 `approval` |
| `context[]` {id, name, kind, crosses, direction} | EXT-nnn |
| `stakeholders[]` {id, name, role, stage, side, approving, influence, reason} | STK-nnn (`approving` 'yes'/'no' → boolean; `influence` text → number) |
| `stakeholders[].concerns[]` {id, text} | CON-nnn; CON derives-from STK (owner stakeholder) |
| `relationships[]` {id, from, to, type, note} | Relationship REL-nnn, category `stakeholder`, `type`, `note`; ends resolved by STK ID |
| `needs[]` {id, name, text, conditions, rationale, priority, selfCheck, justification} | NEED-nnn (`rationale` → `rationale`) |
| `needs[].sources` ("STK-001, STK-004") | NEED derives-from STK per ID (`sourcesOf`) |
| `needs[].concerns` ("CON-002") | NEED derives-from CON per ID (`concernsOf`) |
| `needs[].goal` ("MGO-003") | NEED derives-from MGO |
| `aiStatement` | Milestone 1 `aiStatement` |
| `issued` | merged into `ProjectDoc.issued` (max per prefix) |
| `updatedAt`, `exportedMdAt`, `exportedJsonAt` | Milestone 1 `exports[]` and project timestamps |

### 11.2 Week 2 `Week2Record` (`week2/record.ts`; `week2-model-inputs` v1)

| Record field | Canonical |
|---|---|
| `week1` (Week1Snapshot) | Not stored; used only if the project has no Week 1 data, else compared and differences listed |
| `threePersonTeam` | `Team.threePersonTeam` (conflict with Week 1 value → listed) |
| `conops` | CONOPS-001 (`restrictions`, `interactions`, `constraints` split into lists; `environment` ENV rows nested) |
| `scenarios[]` | SCN-nnn; actors (ACT), steps, alternates, clinic nested; `owner` → `owner` |
| `discoveries[]` | nested in the SCN named by `scenario` (`D` rows); `ref` attribute reference |
| `uncertainties[]` (U-/A-) | U-nnn / A-nnn (`fromWeek: 2`) |
| `needsAdded[]` | NEED-nnn (`addedIn: 2`) |
| `coverage[]` {need, scenarios[{scenario, steps}], reason} | SCN covers NEED (attribute `steps`); `reason` (no scenario) → NEED attribute `coverageReason` |
| `capabilities[]` {needs, refines, scenarios} | CAP-nnn; CAP derives-from NEED; CAP refines CAP; SCN covers CAP |
| `requirements[]` {type, method, criterion, rationale, parents, tbx, owner, reviewer, ai} | REQ-STK/REQ-SYS (`type` → `reqType`; `ai` → `aiAssisted`); REQ derives-from each parent ID; U affects REQ per `tbx` ID |
| `dispositions` {id → text} | `childlessDisposition` on the NEED / REQ-STK |
| `moes[]`, `mops[]` {measures, unit, threshold, source} | MOE/MOP; measures each ID in `measures`; `source` → `thresholdSource` |
| `aiStatement`, export stamps | Milestone 2 |

### 11.3 Week 3 `Week3Record` (`week3/record.ts`; `week3-model-inputs` v1)

| Record field | Canonical |
|---|---|
| `technologies[]` | TECH-nnn; `assumption` (A id) → A affects TECH; `maturityRisk` (R id) → R affects TECH; `affects` → TECH affects REQ/CAP |
| `assumptions[]`, `unknowns[]` (`fromWeek2`) | A / U; same IDs as Week 2 merge into one artifact (fields updated, change recorded) |
| `risks[]` | R-nnn; `affects` → R affects X |
| `opportunities[]`, `issues[]` | O-nnn, I-nnn |
| `tpms[]` {measures, derivesFrom, relatedRisk, profile} | TPM-nnn; TPM measures X; TPM derives-from MOP; R affects TPM |
| `trade` | TRD-001; `alternatives` → ALT (TRD contains ALT); `criteria` → CRIT (TRD contains CRIT; `moe` → CRIT derives-from MOE); `scores`, `screens`, `recommended`, `sensitivityNote`, `conditions`, `residualRisk`, `wouldChangeIf`, `derived` → TRD attributes; `trace` → TRD derives-from REQ/MGO; info finding "record the trade decision as a DEC" |
| `aiStatement`, stamps | Milestone 3 |

### 11.4 Week 4 `Week4Record` (`week4/record.ts`; `week4-model-inputs` v1)

| Record field | Canonical |
|---|---|
| `mission` | compared with MGO-001; difference listed |
| `viewpoints[]` | VP-nnn; `concerns` → VP frames CON; `stakeholders` → VP derives-from STK |
| `groups[]` | FG-nnn; FG contains FN (from `functions[].group`) |
| `functions[]` | FN-nnn; `capabilities` → FN derives-from CAP; `scenarios` → FN derives-from SCN; `requirements` → REQ allocated-to FN; `log` → LOG performs FN; `phy` → FN allocated-to PHY |
| `logical[]` {phys} | LOG-nnn; LOG allocated-to PHY |
| `physical[]` {requirements} | PHY-nnn; PHY satisfies REQ |
| `externals[]` | EXT (collision rule §10.4 against Week 1 context) |
| `decisions[]` {links} | DEC-nnn; `links` → DEC affects X (or DEC derives-from REQ/TRD when the target is REQ/TRD) |
| `information[]` {producers, consumers, decision, decisionRefs} | INFO-nnn; producer flows-to INFO; INFO flows-to consumer; INFO flows-to DEC |
| `ai[]` {host, supports} | AI-nnn; AI allocated-to PHY; AI performs FN |
| `aiStatement`, stamps | Milestone 4 |

### 11.5 Week 5 `Week5Record` (`week5/record.ts`; `week5-model-inputs` v1)

| Record field | Canonical |
|---|---|
| `cards[]` {phy, responsibility, owner} | PHY attributes `responsibility`, `cardOwner` |
| `components[]` {parent, kind, responsibility, functions, ai} | CMP-nnn; PHY contains CMP; CMP performs FN |
| `externals[]`, `externalReasons` | EXT (+ `noInterfaceReason`) |
| `interfaces[]` | IF-nnn; `endA`/`endB` → IF connects (role); `crosses` INFO IDs → IF carries INFO (other words stay in attribute `crossesText`); `requirements` → IF satisfies REQ; `risks` → R affects IF |
| `relays` | IF attribute `relays` on the relaying IFs; pair keys kept as text |
| `requirements[]` {interface, criterion, method, parents} | REQ-SYS-nnn (continuing the project counter); `interface` attribute; REQ derives-from parents; IF satisfies REQ |
| `icwg`, `standards` | Milestone 5 `notes` |
| `changes[]` | ICR-nnn; ICR affects IF |
| `aiStatement`, stamps | Milestone 5 |

### 11.6 Week 8 `W8State` (`week8/state.ts`; `week8-import` v1)

| Record field | Canonical |
|---|---|
| `week1`, `week2`, `snapshot`, `week1Origin` | Not stored; the project is the source (`sourceFromProject`) |
| `purpose` | `Project.model.purpose` |
| `manual[]` (hand counts for Weeks 3–7 kinds) | Obsolete in project mode: counts come from artifacts. Kept only for legacy display |
| `dispositions` {findingKey → text} | `Finding.disposition` |
| `notes` (audit answers) | Milestone 8 `notes` |
| `assessment`, `relationships` | `Project.model.options` |
| export stamps | Milestone 8 `exports` |

### 11.7 Mapping to the Week 8 kinds

`MAPPING_KINDS` (`src/content/lectures/week08/labBrief.ts`) has rules for ENT, PRT, EXT, STK, CON, REL, MGO, NEED, SCN,
CAP, REQ-STK, REQ-SYS, MOE, MOP, VER, TPM, TECH, A, U, R, O, ALT, CRIT, DEC, FN, LOG, INFO, PHY, IF, INC. Prefixes the
Phase I tools issue with **no rule today**: CONOPS, CMP, VP, FG, AI, I, ICR, TRD (and EVD, PKG, ANL, RID later). In the
transformation they appear as `unmapped` findings until the course adds rules (proposed rules in
`CROSS_PHASE_TRACEABILITY_PLAN.md` §4.2; instructor review needed).
