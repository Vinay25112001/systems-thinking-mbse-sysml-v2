# Week 7 package format: `week7-package`, version 1

Status: new-pending-review (2026-10-21). Written by the Lab L7 package tool (`learning-studio/src/workbench/week7/record.ts`,
`packageJson`), read back by the same tool (`importPackage`, teammate share). **Week 8 does not read this file yet**: this
document fixes the format so that a later Week 8 adapter can consume it without changing it. Nothing in Week 8 was changed.

The package is the team's Phase I baseline: one JSON object that carries the six weekly exports **verbatim** plus everything
Week 7 computed and wrote about them. Paths below are relative to `learning-studio/`.

## 1. Top level

| Field | Type | Meaning |
|---|---|---|
| `format` | `"week7-package"` | fixed |
| `version` | number `1` | a version written as text is refused |
| `team` | string | the team code, from the first export that names one |
| `enterprise` | string | the enterprise name, from the first export that names one |
| `state` | `"not-ready"` \| `"ready-for-review"` \| `"review-closed"` | entry criteria met = ready for review (Parts 28–31 and the AI summary complete); exit criteria met = review closed (also every RID dispositioned, at least one recorded) |
| `sources` | object | `week1` … `week6`: each the **original parsed JSON object** of that week's model-inputs file, unchanged (`week1-model-inputs` v1–3, `week2-model-inputs` v1, … `week6-model-inputs` v1). Absent weeks are omitted |
| `index` | array | every artifact ID in the package: `{ id, name, prefix, week }`, where `week` is the week that DEFINES it (first definer wins) |
| `relationships` | array | typed traces `{ from, type, to }` (section 3) |
| `coverage` | array | one row per trace layer (section 4) |
| `findings` | array | every audit finding with its disposition (section 5) |
| `summary` | object | `recommendation`, `evidence`, `conditions`, `residual`, `decisions`, `next` (strings, trimmed) |
| `lessons` | string[] | one lesson per entry |
| `prep` | object | `owners` (section id → owner), `decision` (`"TRADE"` = the Week 3 trade decision, or a Week 4 `DEC-nnn`), `thread` (section 6) or `null` |
| `rids` | array | review findings received: `{ id: "RID-nnn", from, location, finding, severity: "major"\|"minor"\|"", disposition: "accept"\|"defer"\|"reject"\|"", response, owner }` |
| `aiStatement` | string | the package AI usage summary |
| `checks` | object | per part (`sources`, `audit`, `summary`, `prep`, `rids`, `ai`): `{ ok, issues }` (issue count) |

## 2. How a consumer should read the sources

Each `sources.weekN` object is exactly what the week's lab tool exported, so a consumer passes `JSON.stringify(sources.weekN)`
to that week's own importer (`importModelInputs` for Week 1, `importWeekN` for Weeks 2–6). In particular the current
Week 8 importer (`src/workbench/week8/skeleton.ts importFile`) accepts `sources.week1` and `sources.week2` unchanged. The
Week 7 tool does the same when it reads a teammate's package back. AeroLink records are refused at every step.

## 3. Relationship types

| `type` | from → to | Read from |
|---|---|---|
| `traces to` | requirement → parent (NEED, CAP, REQ); GAP → source ID | Week 2 and Week 5 requirement parents; Week 6 gap sources |
| `serves` | CAP → NEED; INC → served ID | Week 2 capability needs; Week 6 increment serves |
| `satisfies` | FN or PHY → requirement | Week 4 function and physical-element requirements |
| `delivers` | FN → CAP; INC → TECH | Week 4 function capabilities; Week 6 technology insertion |
| `allocated to` | FN → PHY | Week 4 allocation |
| `part of` | CMP → PHY | Week 5 component parent |
| `hosted by` | AI → host element | Week 4 AI card host |
| `connects` | IF → end (PHY, CMP, EXT, AI) | Week 5 interface ends |
| `carried by` | requirement → IF | Week 5 interface requirements and a Week 5 requirement's interface |
| `precedes` | INC → INC | Week 6 dependencies |
| `affects` | U → INC | Week 6 unknown gates |

## 4. Coverage layers (`src/content/lectures/week07/labBrief.ts COVERAGE_LAYERS`)

`{ id, label, covered, total, pct, uncovered[] }`, one per layer:

- `need-req`: a need is covered when a stakeholder requirement names it as a parent;
- `stk-sys`: a stakeholder requirement is covered when a system requirement refines it, or a function, a physical element
  or an interface carries it directly;
- `sys-arch`: a system requirement is covered when a function, a physical element or an interface carries it (a Week 5
  requirement naming an existing interface counts);
- `arch-if`: a physical element is covered when it, one of its components, or an AI capability it hosts is an end of an
  interface;
- `roadmap`: an increment after the baseline is covered when every ID it serves exists in the package.

## 5. Findings

`{ key, kind, ids, text, disposition, reason, owner, carried }`. `key` is stable (kind plus the IDs or weeks it concerns,
for example `childless-need:NEED-004`, `stale:6:2:REQ-SYS`, `open-item:4`), so a disposition survives re-imports. `kind` is
one of `labBrief.ts FINDING_KINDS`: consistency (`enterprise`, `not-ready`, `stale`, `dangling`, `renamed`,
`stale-disposition`), traceability (`childless-need`, `orphan`, `childless-stk`, `unallocated`, `cap-no-function`,
`phy-no-interface`, `ext-no-interface`, `increment-unresolved`) and the Week 6 hand-over (`open-item`). `disposition` is
`"record"` or `"defer"` (or `""` when the package is not ready); there is no "fixed": a fixed finding is no longer in the
list. `carried` is true when the disposition is the one an earlier week recorded (Week 2 audit dispositions, the Week 6
review owner) and the team kept it. A Week 8 adapter should read the `defer` findings and the `defer` RIDs as the first
open items of the model.

## 6. Thread

`{ need, hops: [{ layer, ids[] }], reachesSys, reachesArch, reachesInterface, reachesRoadmap }`: the layers are Need,
Capability, Stakeholder requirement, System requirement, Architecture (functions and elements), Interface, Roadmap (gaps and
increments), each listing every ID the package's links reach from the need at that layer.

## 7. Compatibility rules

- Fields are only ever added; a consumer ignores fields it does not know.
- A change of meaning of an existing field increments `version`.
- The tool refuses a package whose `version` is not 1, or is written as text, and any file about AeroLink.

## Revision 2026-10-21 (independent review M1–M3, m7–m9): fields added, version unchanged

All additions are optional on read, so files written before the revision still import (`version` stays `1`).

- `findings[].week`: number 8–14 or `null`, the Phase II week a deferred finding closes in (required by the tool for a
  deferral). `findings[].status`: `"accepted"` (disposition `record`), `"open"` (disposition `defer`) or `""`.
  The stored disposition ids stay `record` and `defer`; the tool labels them “accept, with rationale and evidence” and
  “defer to a later week, with an owner”. A correction is never stored: it is a re-imported week whose finding is gone.
- `findings[].kind` gains `collision` (two weeks' own records define one ID for different elements; identity rule:
  names equal ignoring case and punctuation, or one contains the other whole) and `dropped-open-item` (an earlier week's
  recorded open item whose gap is still open and that no later week carried). `renamed` now means wording drift of the
  same element only, keyed `renamed:<later week>:<prefix>`; collisions are keyed per ID, `collision:<ID>`.
  Open items from the Week 6 review are keyed per item ID, `open-item:<week>:<ID>`.
- `index[]`: a collided ID appears once per defining week, each row with `collision: true` (never first-definer-wins).
- `rids[].criterion`: the criterion or source the RID breaks.
- `issued`: `{ RID: number }`, the highest RID number ever issued, so a teammate never reuses a deleted RID number.
- Week 4 exports gain `week1Externals` (the Week 1 context EXT IDs, when the optional Week 1 file was loaded) so new
  externals continue after them; Week 6's `week3` extra gains `opportunities`. Older Week 4 and Week 6 files without
  these fields import unchanged; collisions they contain are flagged by Week 7, never renumbered.
