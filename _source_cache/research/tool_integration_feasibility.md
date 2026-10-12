# Feasibility study: MBSE Studio + eVTOL Sizer in the SysML course

*Written 2026-10-11. Systems-integration review. No code was edited, built, installed or run in any of the three codebases. I used git only to read (log/status).*

**Evidence legend.** **[V]** = verified: I read it at the cited file:line. **[I]** = inferred from what I read; not executed. **[U]** = unverified: it needs a run that this review was not allowed to do.

Repositories and heads at the time of review:

| Tool | Path | Head | State |
|---|---|---|---|
| MBSE Studio | `C:\Users\w451vxs\MBSE_OpenSource` | `9eef6a4` on master | clean. Only remote is a local bare backup (`C:/Users/w451vxs/Backups/mbse-studio.git`) **[V]** `git remote -v` |
| eVTOL Sizer | `C:\work\eVTOLSizer` | `208a574` on `shared-auth` | clean. Phase-2 forensic audit in progress, `src/` held read-only by that audit **[V]** eVTOL PARK |
| Learning Studio | `...\SysML\learning-studio` | `952c2a2` | Week 9/10 modules in progress **[V]** `git log` |

---

## 0. Verdict in one paragraph

**The integration the owner wants is technically feasible. A working prototype of it already exists, but in the wrong tool for this course and this date.** MBSE Studio already ships an "external analysis" protocol and an eVTOL Sizer adapter. With them a SysML 1.7 block's value properties drive the sizer's `runSizing`. Results come back into the model with the engine's name, the time of the run and a digest of the engine's sources, and trade, Monte Carlo and mission runs can be checked against requirements (`docs/EXTERNAL_ANALYSIS.md:14-50, 185-241`; `integrations/evtolsizer/adapter.mjs`). However, MBSE Studio is alpha software with **zero users other than its author** (`README.md:105`). Its installer has never actually been installed (`INSTALL.md:55-66`). It has no public distribution channel, and it is SysML **1.7**, while the course teaches SysML **v2** (it can read v2 but not write it, `README.md:85-91`). It is therefore **not a safe dependency for graduate students by November or December 2026.**

**Recommended path:** put a "Parametric analysis" panel inside the Learning Studio. It runs the eVTOL Sizer's *own* engine, as a pinned dependency rather than a port, entirely in the browser. It writes TPM current estimates, with provenance, into the AeroLink course model. It also exports and imports one JSON interface contract (section 4), so the same exchange later works with the hosted sizer, the `evtol-size` CLI and MBSE Studio's adapter. Treat the MBSE Studio link as an instructor demonstration this term, and as a candidate for a later semester once that tool has outside users and an installer that has really been installed.

---

## 1. Architecture of each tool

### 1.1 eVTOL Sizer

| Aspect | Finding | Evidence |
|---|---|---|
| Language / runtime | JavaScript ES modules. React 18 + Vite web app. The same engine runs in Node ≥ 20 | **[V]** `package.json` (`"type":"module"`, `engines.node >=20`, deps react 18 / recharts only) |
| Launch | Hosted web app at evtolsizer.live, deployed from `main`. Local: `npm run dev` (Vite) | **[V]** `README.md:11`, `DEPLOY.md:1-6` |
| Engine entry | `export function runSizing(p)` in `src/engine.js:4113`. It returns one large flat result object (`src/engine.js:3702` ff.). The web app imports it directly (`src/App.jsx:13`) | **[V]** |
| Engine portability | `src/engine.js`, `src/engine/*.js` (54 files, ~19.4 k lines with engine.js) and `src/lib/*.js` contain **no `node:` imports and no `require`**. The engine is isomorphic, so it can run in any browser bundle | **[V]** grep, no hits; **[I]** that it bundles cleanly into another Vite app |
| Public API | `src/api.js`: `size(inputs)`, `sizeMany`, `designRecord`, `reopen`, `engineVersion`, `DEFAULT_PARAMS`, `CONFIGURATIONS`, `INPUTS`/`OUTPUTS`/`provenanceOf`, `assessDomain`, `API_VERSION = 1`. `size()` returns `{inputs, result, error, converged, warnings, warningCounts, domain}` | **[V]** `src/api.js:32, 58-73, 99-104`; `docs/API.md` |
| api.js is Node-only | It imports `node:fs` and `node:child_process` to stamp the git commit (`src/api.js:17-18, 38-48`). A browser host must call the same pipeline itself: `resolveInputs` → `engineInputs` → `runSizing` → `resultWarnings` | **[V]** `src/api.js:59-63`; `src/lib/designfile.js:102,109`; `src/lib/warnings.js:44` |
| CLI | `bin/evtol-size.mjs`: a JSON file, an array of cases or stdin in; a summary or `--json` lines out; `--reopen`; `--version`. Exit 0 = converged with no error-severity warning, 1 = otherwise, 2 = usage error | **[V]** `bin/evtol-size.mjs:1-13, 46-83` |
| File formats | **Design record** `.evtol.json`: `{format:"evtol-sizer-design", formatVersion:1, name, savedAt, engine (build stamp), inputs (resolved over DEFAULT_PARAMS), customAirfoil, inputHash, outputs (fingerprint)}`. The web UI exports it (`App.jsx:991`) and imports it (`App.jsx:1328`). Other exports: CSV results (`App.jsx:569`), CPACS XML (`:960`), OpenVSP `.param` (`:971`), traceability CSV of every engine check with its citations (`:976`, `src/export/traceability.js`) | **[V]** `src/lib/designfile.js:41-42, 170-185` |
| Inputs | Over 100 UI inputs, all defaulted in `DEFAULT_PARAMS` (`src/lib/defaults.js:24` ff.). The core ones: `payload` kg, `range` km (**mission range excluding reserve** at API level), `vCruise` m/s, `cruiseAlt` m, `hoverHeight` m, `reserveMinutes` / `reserveBasis` / `reserveDistanceKm`, `nSeats`, `configType` (six layouts), `nPropHover`, `propDiam` m, `LD`, `AR`, `sedCell` Wh/kg, `etaBat`, `socMin`, `weightModel`, `powertrain` (battery / turboelectric) | **[V]** `defaults.js:82, 258, 310`; `provenance.js:26-30`; `docs/API.md` exports table |
| Outputs (headline) | `MTOW`, `Wempty`, `Wbat` kg; `Etot`, `PackkWh`, `PackUsablekWh` kWh; `Phov`, `Pcr`, `Pcl` kW; `tto`/`tcl`/`tcr`/`tdc`/`tld` s; `bWing`, `Swing` m / m²; `LDact`; `DL_lbft2`; `dBA_100m`, `dBA_150m`, `dist_65dBA`; `Vstall`; `missionRange`, `totalRange`, `reserveDistKm` km; `feasible`, `checks[]` (≈41 named design checks `{label, ok, val, kind}`) | **[V]** `src/engine.js:3702-3725`; `src/lib/provenance.js:131` ff. |
| Units | SI-dominant in the result (kg, kW, kWh, m, s, m/s), with a few imperial keys named as such (`DL_lbft2`). Units are carried by **key-name convention and documentation**, not as data in the result. `src/lib/units.js` is a display-conversion table | **[V]** `src/lib/units.js:1-40`; profile.js header ("all in kW at the DC bus") |
| Provenance per output | Every input and output is registered as validated / sourced / calibrated / derived / unverified, with its source text. For example MTOW validated (`provenance.js:166`), Etot validated (`:192`), PackkWh validated (`:169`), dBA_100m validated (`:263`), dist_65dBA sourced (`:268`), feasible and checks unverified (`:275-276`) | **[V]** |
| Mission evaluator | `src/engine/profile.js`: `evaluateProfile(result, segments, opts)` flies an arbitrary segment list (hover, climb, cruise, loiter, divert, descent, ground) against an **already-sized** aircraft and does **not** resize. It returns `totalEnergyKWh`, `totalMinutes`, `totalDistanceKm`, `packUsableKWh`, `marginKWh`, `marginPct`, `feasible`, `ranDryAt` | **[V]** `profile.js:1-54, 98-100, 207-215` |
| Scripting / plugin | No plugin mechanism. Scripting goes through the Node API or the CLI, from any language (a Python example is in `docs/API.md`). URL query params `?design=`/`?session=` load shared designs (Supabase-backed) | **[V]** `docs/API.md`; `App.jsx:474-475` |
| Headless | Yes, through the Node API and the CLI | **[V]** |
| Licence | Apache-2.0 | **[V]** `LICENSE`, `package.json` |

### 1.2 MBSE Studio

| Aspect | Finding | Evidence |
|---|---|---|
| Language / runtime | Python ≥ 3.11 desktop application on PySide6 (Qt, LGPLv3, dynamically linked). Version 0.9.0, "Development Status :: 3 - Alpha" | **[V]** `pyproject.toml:7,16,30`; `docs/LICENSING.md:85,93` |
| Launch | `python run.py` from source, or the `mbse-studio` GUI script. A PyInstaller tree exists in `dist/MBSE Studio/MBSE Studio.exe`. A WiX MSI is built per-machine and needs elevation | **[V]** `pyproject.toml:46`; `INSTALL.md:9-60` |
| Build prerequisite | The metamodel is generated from OMG machine-readable files, which "may not be redistributed". Each developer fetches them (`tools/harvest_omg.py --minimal`, 2.4 MB) before building | **[V]** `README.md:36-58`; `INSTALL.md:13-18` |
| Data model | Generated UML 2.5 / SysML 1.7 metamodel (242 UML metaclasses, 56 SysML stereotypes). It can store blocks, parts, value properties with units (`units.set_typed_value` writes `Property::defaultValue`, which persists), requirements with tagged values and satisfy/verify/derive/refine links, constraint blocks with binding connectors that solve, state machines and activities that execute (fUML/PSSM) | **[V]** `README.md:46-80`; `docs/EXTERNAL_ANALYSIS.md:74-80`; `examples/evtol/FINDINGS.md:21-55` |
| File format | XMI 2.5.1, with layout in a tool extension. An independent implementation (pyecore/pyuml2) reads its files. ReqIF import/export modules exist (`core/reqif.py`, `core/reqif_import.py`), and CSV/XLSX table import | **[V]** `README.md:73-74`; `docs/INTEROPERABILITY.md:27-40`; `src/mbse/core/` listing |
| SysML v2 status | It **reads, resolves and validates** v2/KerML text: 346 of 346 OMG corpus files, and `mbse validate model.sysml` gives text/JSON/SARIF output. It has a **one-way v1 → v2 textual export** driven by the OMG's 792 mapping rules, with unmapped elements written as comments. It has **no v2 editor, no v2 diagrams and no v2 writer from a v2 model**. Implied elements (binding connectors, type featurings) are not built, and the library cold start takes seconds to a minute | **[V]** `README.md:78, 85-91`; `src/mbse/core/v2export.py:11-46`; `docs/ROADMAP.md:46, 243-252` |
| CLI (headless) | `mbse validate / method / simulate / trade / size / mission / uncertainty / render / document / viewer / tables / import-table / conformance` | **[V]** `src/mbse/cli.py:852-1024` |
| Scripting hooks | Python API (`mbse.core.analysis`, `trade`, `montecarlo`). Optional MCP server (`mbse.ai.mcp_server`) so that external AI clients can drive a model. Single-file read-only web viewer export | **[V]** `docs/EXTERNAL_ANALYSIS.md:107-125`; `pyproject.toml` `ai` extra; `src/mbse/ai/mcp_server.py:70` |
| **Analysis plug-in mechanism** | `core/external.py`: one long-lived child process that speaks **newline-delimited JSON over stdio**. A handshake announces the inputs, outputs and named calls, then the session runs one answer per `id`. A model profile declares the engine: «ExternalAnalysis» (tool, adapter, project, timeout) on the context block, and «AnalysisInput» / «AnalysisOutput» (`key`) on value properties | **[V]** `src/mbse/core/external.py:11-55`; `docs/EXTERNAL_ANALYSIS.md:53-72` |
| Licence | Apache-2.0, plus LGPL Qt | **[V]** `pyproject.toml:13`; `README.md:6` |
| Activity | Under active, holder-gated refactoring (PI-002 milestones). The suite has 5,087 tests and takes 40-100 min. 20 commits are local-only. Note that `README.md:19` still says "1073 tests", which is stale | **[V]** MBSE PARK; `README.md:19` |

### 1.3 Learning Studio (host of the student experience)

| Aspect | Finding | Evidence |
|---|---|---|
| Stack | React 19 + TypeScript + Vite 8, Tailwind, @xyflow/react, recharts. Static build, with a separate student build `dist-student` | **[V]** `package.json` |
| Engineering model | `EngineeringModel = {elements, links}`. `Element = {id, kind, name, text?, attributes?: Record<string, string\|number\|boolean>, provenance, status, cite?}`. 27 kinds including REQ, MOE, MOP, TPM, PHY, VER. 10 link types including `measures`, `verifies`, `satisfies` | **[V]** `src/model/engineering.ts:7-65, 71-82` |
| Provenance vocabulary | `'official-S04' \| 'instructor-fictional' \| 'instructor-reference' \| 'team-assumption' \| 'team-derived' \| 'AI-suggested-reviewed' \| 'cited'`. It has **no value for "computed by an analysis tool"**, so one would need to be added | **[V]** `engineering.ts:44` |
| Persistence / exchange | localStorage workspace (`src/state/Workspace.tsx`, `src/lib/storage.ts`). JSON export in format `sysml-studio/aerolink-model@1` and JSON import with validation (`src/pages/ModelWorkspacePage.tsx:39-52, 102`) | **[V]** |
| Precedent for an in-app analysis | `src/sim/aerolink.ts`, a fleet/charging system-dynamics model already embedded in the app | **[V]** `src/sim/aerolink.ts:17-141` |
| SysML v2 | Listings under `sysml/`, validated offline by the OMG Pilot Implementation 2026-08 (JVM) through `scripts/check_sysml.py`. The app shows a "validated" badge only on a SHA-256 match (`src/lib/sysml.ts:1-35`). TPMs are written as typed attributes with `threshold` / `objectiveValue` / `currentEstimate` / `margin` (`sysml/week05/aerolink_tpm.sysml:11-29`) | **[V]** |
| Course tool decision | FD-08 (designate the SysML v2 tool, and approve a local evaluation of at least 2 candidates at least 8 weeks before term) is **open** | **[V]** `FACULTY_DECISION_REGISTER.md:28` |

**AeroLink facts that matter for sizing** (all FICTIONAL teaching values) **[V]**:
- The aircraft is PHY-001: "Four-seat electric vertical take-off and landing aircraft", `seats: 4, cruiseKmh: 150`, 12 → 16 aircraft (`week08.ts:66`).
- The design trip is 25 km, with a 20 % usable-energy reserve at landing and a 16 min block time (`week03.ts:6-9`).
- REQ-SYS-002 is pad-edge noise ≤ 65 dBA LAmax (`week04.ts:77-80`). REQ-SYS-003 is a planned landing energy of at least 20 % of usable (`:81-84`). REQ-SYS-007 is a 25 km trip within 16 min block time (`:98-101`).
- The TPMs are TPM-001 charge time (threshold 20 / objective 15 / estimate 18 min), TPM-002 pad-edge noise (65 / 62 / 63.5 dBA) and TPM-003 landing energy reserve (20 / 25 / 23 %) (`week05.ts:56-61`).
- VER-003 is a landing-energy-reserve *analysis* (`week12.ts:30`). VER-007 is a block-time *test* (`week12.ts:46`).
- **Important:** AeroLink's system of interest is the *operator enterprise* (ENT-001). The aircraft is one physical element of it, so sizing is a subsystem analysis that feeds enterprise TPMs.

### 1.4 The integration that already exists (key finding)

`MBSE_OpenSource/integrations/evtolsizer/adapter.mjs` (338 lines, last changed 2026-09-10) **[V]**:
- `node adapter.mjs <sizer checkout> [--baseline base.json]` loads `src/engine.js` from the checkout, so the sizer is not vendored (`:19-26, 103-112`). It optionally loads `src/engine/profile.js` for `mission` / `mission.default` calls (`:117-124`).
- It flattens nested results to `group.key` and exposes each engine check as `check.<label>` = 1/0 (`:159-195`). It reports a SHA-256 digest of the engine sources (`:85-101`).
- MBSE Studio side: `mbse size --record` writes outputs (never inputs) into the block's value properties with the tags `lastRun`, `lastEngine` and `lastDigest`. `--pin` and `--strict` detect an engine change (`docs/EXTERNAL_ANALYSIS.md:185-241`; `src/mbse/core/analysis.py:70-76, 398-478`).
- Measured by the author: 11-116 ms per run, and a 200-sample Monte Carlo in 1.0 s (`docs/EXTERNAL_ANALYSIS.md:170-181`).
- Opt-in integration tests are skipped unless `MBSE_EVTOLSIZER` is set (`tests/test_evtolsizer_integration.py:13-48`). **[U]** Whether they pass against sizer HEAD `208a574` is untested. I did not run them, by instruction.

Defects and drift I found by reading:
1. **The handshake gives no input list against the current sizer [I].** The adapter looks for `DEFAULT_PARAMS` (and similar names) on the **engine module** (`adapter.mjs:140-144`). `src/engine.js` exports no such name (grep **[V]**). `DEFAULT_PARAMS` lives in `src/lib/defaults.js:24`. Without `--baseline`, every unvalued property is treated as an output, and the engine raises on missing required inputs.
2. **It bypasses the sizer's public API [V].** It calls `runSizing` directly (`adapter.mjs:277`) instead of `api.size()`. So (a) `range` means total range *including* reserve, which differs from the app and API convention (`docs/API.md` exports table; `provenance.js:316`), and (b) the sizer's warnings and validation-domain placard are not returned. The NASA-STD-7009B [M&S 32] disclosure that `api.js:12-14` insists on is lost.
3. The eVTOL example model (`examples/evtol/build_model.py`) does not apply «ExternalAnalysis», so it is a *static* import of `design_point.json` (dated 2026-08-28, older defaults: range 190, nPropHover 6). It is not a live binding **[V]** grep, no hits.

---

## 2. Maturity and risk for student use (target ~Nov 2026, hard date Dec 1)

| Risk | MBSE Studio | eVTOL Sizer | Learning Studio |
|---|---|---|---|
| Users / field exposure | **Zero outside the author** (`README.md:105`). The scripted outside evaluation (`docs/EVALUATION.md`) has not been run | Public site, but self-assessed only: "Not independently reviewed" (`README.md`). 148 open audit findings in Phase 2 (eVTOL PARK) | The course app itself; already the student surface |
| Install burden on student laptops | **High.** From source: Python 3.11 + pip + OMG harvest + metamodel generation. Or a per-machine MSI that needs admin, has **never been really installed** (`INSTALL.md:55-66`) and is Windows-only. The live sizer link adds **Node ≥ 20 + a sizer clone + `npm install`** | **None** for the web app. CLI: Node ≥ 20 + clone + `npm install` (`docs/API.md` Install) | None: static web app |
| Distribution | No public remote, only a local backup bare repo **[V]**. A build or release is gated by its owner (MBSE memory rule: never build or install unasked) | GitHub + evtolsizer.live | Static hosting (owner's choice) |
| Stability | Active deep refactor (PI-002 B3 → B5 still to come) with a large green suite. UI changes week to week **[V]** PARK | Engine outputs change between 0.x releases (`docs/API.md` "results may change"). Audit-driven changes are pending, and `src/` is frozen until the audit closes | Stable; owned by the course |
| Language fit | **SysML 1.7.** The course teaches v2 and its graded instruments target a v2 checker (FD-08) | n/a | v2 listings + a teaching JSON model |
| Accessibility (FD-20) | Accessible names exist, but "No screen reader has been used with it" (`README.md:75`) | Not assessed here | WCAG work is in progress (axe tests in devDeps) |
| Licensing | Apache-2.0 + LGPL Qt: fine for a course. OMG source files cannot be redistributed, but the generated metamodel is claimed as the project's own work product (`docs/LICENSING.md:43`) **[I]**; that needs a legal sanity check before bundling for students | Apache-2.0: fine; embedding requires keeping the NOTICE | n/a |
| Model credibility | n/a | Known ~27 % MTOW over-prediction against Archer (`src/lib/defaults.js:75-77`). Every output carries its V&V status, which is good for teaching | — |

**Conclusion:** MBSE Studio as a *required* student tool by December is **high risk / not recommended**. As an *instructor-run demo* of model-driven analysis, it is **medium risk**, with an effort of about 1-2 days to fix adapter defects 1-2 and build an AeroLink block (this needs the MBSE owner's authorisation). The eVTOL Sizer engine is **low risk as an embedded computation**, provided the course pins a commit and shows the warnings and domain status.

---

## 3. Integration options, ranked

Effort is engineering days for one competent developer **[I]**. "Change to X" means the minimal change that tool would need.

| Rank | Option | Data flow / mechanism | Effort | Risk | Change to Learning Studio | Change to eVTOL Sizer | Change to MBSE Studio |
|---|---|---|---|---|---|---|---|
| **1** | **(e) Embedded "Parametric analysis" panel in the Learning Studio, running the sizer's own engine** | TPM thresholds, REQ values and PHY-001 attributes → contract `parameters` → in-browser `runSizing` + `evaluateProfile` → contract `results` → TPM `currentEstimate` + a VER evidence record in the course model | 4-7 d | Low | New panel, a mapping table, a provenance value `analysis-computed` (`engineering.ts:44`), and a dependency on the sizer **pinned to a commit** (npm git dependency or a Vite alias). Tests | **None required**: the host imports `engine.js`, `lib/designfile.js`, `lib/warnings.js` and `engine/profile.js` (internal paths, safe only because the commit is pinned). **Nice to have later:** a browser-safe `exports["./core"]` entry with `size()` minus the Node stamp (`api.js:38-48`) | None |
| **2** | **(a) File-based exchange with the shared JSON contract** | Learning Studio exports `aerolink-sizing-request@1` → student runs `evtol-size req.json --json` *or* the hosted app → results JSON → Learning Studio imports it and updates the TPMs | 2-4 d (shares code with rank 1) | Low | Export/import of the contract (it already has a JSON import pattern, `ModelWorkspacePage.tsx:39-52`) | Ideally a tiny wrapper script that reads and writes the contract. The CLI's `--json` output already carries inputs, warnings, domain and result (`bin/evtol-size.mjs:73-74`). The web app reads and writes `.evtol.json` but not the contract (it would need an import mapping) | None |
| **3** | **(d-variant) The existing MBSE Studio ⇄ sizer stdio NDJSON link** | SysML 1.7 block value properties → adapter → `runSizing` → `mbse size --record` → properties + provenance tags; requirement verdicts by trade/MC | 1-2 d for an instructor demo; weeks for student roll-out | Medium (demo) / High (students) | Optional: import the contract emitted by a small exporter | None | Fix the adapter to call `api.size()` (range semantics, warnings, domain) and to read `DEFAULT_PARAMS` from `src/lib/defaults.js` or `api.js`. An AeroLink example block. A contract exporter. **Needs the MBSE owner's authorisation** |
| 4 | (b) SysML v2 textual exchange | A fixed `package AeroLinkSizing` template whose attributes (`payload = 362.9 [kg];` …) are read and written by a small template parser; the result is validated by the course's Pilot checker | 3-5 d | Medium: a free-form v2 parser is out of reach, so a constrained template is mandatory; a template drifts from what students write | Template generator, and a "validated" badge through the existing checker (`scripts/check_sysml.py`) | Wrapper to read and write the template | MBSE Studio can **read** the file (`mbse validate model.sysml`) but cannot write v2 back (`README.md:85-91`) |
| 5 | (d) Local HTTP/WebSocket bridge | Learning Studio (browser) ⇄ `localhost` Node service wrapping `api.size()` | 2-3 d | Medium: every student must run a local server; CORS; ports on managed laptops | fetch client | New Node service (outside `src/`) | None |
| 6 | (c) SysML v2 API & Services (REST) hub | Tools push and pull elements/commits on a shared API server (the spec defines a REST/HTTP PSM and an OSLC 3.0 PSM, `_source_cache/3_Systems_Modeling_API_and_Services.txt:248-256`) | 3-6 weeks | High: needs a JVM + database server (pilot implementation); **none of the three tools speaks the API**; hosting and IT approval | API client + element mapping | API client | API client (none exists) |
| 7 | (f) FMI/FMU co-simulation | Wrap the sizer as an FMU | Weeks | High and a poor fit: the sizer is a **design-closure fixed point**, not a time-stepping dynamic model. MBSE Studio lists FMI as not done (`docs/ROADMAP.md:233-242`) | — | FMU wrapper (C/JS bridge) | FMI master (none) |
| 8 | (g) OSLC | Lifecycle links (requirement ↔ analysis result) as OSLC resources | Weeks to months | High: no OSLC provider or consumer in any tool; enterprise ALM scale | — | — | — |

### Why rank 1 beats a "port of the core equations"

A hand port of the sizing equations into TypeScript would be a **fork**: it would be wrong the first time the audited sizer changes. MBSE Studio's author rejected vendoring for the same reason (`adapter.mjs:21-26`). Importing the engine at a **pinned commit** gives identical numbers to the public sizer, the per-output V&V status, the warnings and the domain placard, with no install on student machines. The digest idea from MBSE Studio (`adapter.mjs:85-101`) carries over: the panel records the commit and digest with every estimate.

### Pedagogical fit of rank 1

- Week 5 TPMs get a real "current estimate from analysis" instead of an instructor-set number (`week05.ts:7`).
- Week 7 trade alternatives can include an aircraft configuration (`configType`, which covers six layouts).
- Week 12 VER-003 ("Landing energy reserve analysis", method = analysis) gets a reproducible evidence record with a verdict.
- Week 13 impact analysis: change REQ-SYS-007 or the payload and watch the TPMs move.
- The SysML v2 side stays in the course's v2 listings; the panel can *emit* the TPM block as a v2 snippet like `aerolink_tpm.sysml` for students to validate.

---

## 4. Proposed interface contract (JSON Schema sketch)

Design rules:
1. Every number carries a **unit** as a string, in the sizer's own units, so no conversion happens inside the exchange.
2. Every element carries **provenance**: its source element ID, or the engine commit and digest.
3. Results carry the sizer's **V&V status**, **warnings** and **domain** (the [M&S 32] obligation, `api.js:12-14`).
4. The mapping to course IDs is explicit data, not code.

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:wsu:sysml-course:aerolink-sizing@1",
  "type": "object",
  "required": ["format", "request"],
  "properties": {
    "format": { "const": "aerolink-sizing@1" },
    "request": {
      "type": "object",
      "required": ["id", "createdAt", "subject", "parameters"],
      "properties": {
        "id":        { "type": "string" },                 // e.g. "RUN-2026-11-03-team4-001"
        "createdAt": { "type": "string", "format": "date-time" },
        "subject":   { "type": "string", "pattern": "^PHY-\\d{3}$" },   // "PHY-001"
        "parameters": {
          "type": "object",
          "additionalProperties": { "$ref": "#/$defs/quantity" }
          // keys = sizer input names (src/lib/defaults.js); the engine supplies the rest
        },
        "mission": {                                       // the trip to fly AFTER sizing (profile.js)
          "type": "array",
          "items": {
            "type": "object",
            "required": ["kind"],
            "properties": {
              "kind":       { "enum": ["hover","climb","cruise","loiter","divert","descent","ground"] },
              "seconds":    { "type": "number" },
              "distanceKm": { "type": "number" },
              "speedMS":    { "type": "number" },
              "headwindMS": { "type": "number" },
              "label":      { "type": "string" }
            }
          }
        }
      }
    },
    "response": {
      "type": "object",
      "required": ["requestId", "engine", "converged", "results", "warnings", "domain"],
      "properties": {
        "requestId": { "type": "string" },
        "engine": {
          "type": "object",
          "required": ["name", "version", "commit", "digest", "api"],
          "properties": {
            "name": { "const": "eVTOL Sizer" }, "version": { "type": "string" },
            "commit": { "type": "string" }, "digest": { "type": "string" },
            "api": { "type": "integer" }, "runtime": { "enum": ["browser","node-cli","mbse-adapter","web-app"] }
          }
        },
        "converged": { "type": "boolean" },
        "results": { "type": "object", "additionalProperties": { "$ref": "#/$defs/result" } },
        "mission":  { "type": "object", "additionalProperties": { "$ref": "#/$defs/result" } },
        "checks":   { "type": "array", "items": { "type": "object",
                      "properties": { "label": {"type":"string"}, "ok": {"type":"boolean"},
                                      "kind": {"type":["string","null"]} } } },
        "warnings": { "type": "array", "items": { "type": "object",
                      "properties": { "cat": {"type":"string"}, "severity": {"enum":["error","warning","info"]},
                                      "text": {"type":"string"} } } },
        "domain":   { "type": "object", "properties": { "insideValidation": {"type":"boolean"} } }
      }
    },
    "writeBack": {                                         // what the host is to do with the answer
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target", "attribute", "from"],
        "properties": {
          "target":    { "type": "string" },               // "TPM-003", "VER-003"
          "attribute": { "type": "string" },               // "currentEstimate", "verdict"
          "from":      { "type": "string" },               // "mission.landingReservePct"
          "transform": { "type": "string" }                // named, auditable transform; never free code
        }
      }
    }
  },
  "$defs": {
    "quantity": {
      "type": "object", "required": ["value", "unit"],
      "properties": {
        "value": { "type": ["number","string","boolean","null"] },
        "unit":  { "type": "string" },                     // "kg","km","m/s","m","min","-","Wh/kg"
        "source": { "type": "string" },                    // course ID: "PHY-001.seats", "REQ-SYS-007"
        "provenance": { "enum": ["instructor-fictional","instructor-reference","team-assumption",
                                 "team-derived","cited","sizer-default"] },
        "note": { "type": "string" }
      }
    },
    "result": {
      "type": "object", "required": ["value", "unit", "status"],
      "properties": {
        "value":  { "type": ["number","boolean","null"] },
        "unit":   { "type": "string" },
        "status": { "enum": ["validated","sourced","calibrated","derived","unverified","host-derived"] },
        "engineKey": { "type": "string" }                  // e.g. "MTOW", "PackUsablekWh"
      }
    }
  }
}
```

### 4.1 Parameter mapping: course model → sizer (request)

| Sizer input | Unit | Value | Source in the course model | Status of the mapping |
|---|---|---|---|---|
| `nSeats` | – | 4 | PHY-001 `seats` (`week08.ts:66`) | **[V]** direct |
| `payload` | kg | 362.9 = 4 × 90.718 | PHY-001 `seats` × sizer `OCCUPANT_MASS_KG` (`src/engine/cabin.js:69`) | **[I]** a team assumption (baggage excluded) that should be stated in the model |
| `vCruise` | m/s | 41.67 | PHY-001 `cruiseKmh: 150` ÷ 3.6 | **[V]** value; **[U]** whether winged layouts converge or trigger stall/domain warnings at 41.7 m/s (default 67 m/s) |
| `range` | km | 25 (excluding reserve) | Data Sheet design trip; REQ-SYS-007 (`week04.ts:99`) | **[V]** value; API convention: mission range excluding reserve |
| `reserveBasis` / `reserveMinutes` | – / min | "time" / 20 (sizer default) | **Mismatch:** AeroLink defines the reserve as 20 % of usable *energy* (REQ-SYS-003), not time | **[I]** Owner decision. Recommended: keep the sizer's regulatory reserve for *sizing* and check the 20 % energy figure *after* sizing with the profile (TPM-003 row below) |
| `configType` | enum | team choice (e.g. `multicopter`, `liftcruise`) | Week 7 ALT element | **[I]** a natural trade variable |
| `sedCell` | Wh/kg | 300 (default) | TECH-002 battery technology element (`week06.ts:27`) | **[I]** |
| everything else | – | sizer `DEFAULT_PARAMS` | `provenance: "sizer-default"` | **[V]** defaults exist |

### 4.2 Result mapping: sizer → course model (response and write-back)

| Course element | Attribute written | Sizer source | Unit | Transform | Status of the mapping |
|---|---|---|---|---|---|
| **TPM-003** Landing energy reserve (`week05.ts:60`) | `currentEstimate` | `evaluateProfile` over the 25 km trip: hover `tto`, climb, cruise 25 km, descent, hover `tld` | % | `100 × (packUsableKWh − totalEnergyKWh) / packUsableKWh` (`profile.js:207-213`, `reserveFraction` 0) | **[I]** strong: a direct physical meaning. Optionally use end-of-life capacity (VER-003 "end-of-life battery capacity", `week12.ts:30-33`) by derating `sedCell` |
| **VER-003** Landing energy reserve analysis | `verdict`, `evidence` | as above, plus `converged`, `domain.insideValidation`, `warnings` | – | pass if ≥ 20 % and converged; **inconclusive** if outside the validated domain (this matches VER-003's own inconclusive rule, "energy model not validated") | **[I]** |
| **MOP-003 / REQ-SYS-007** Block time | `currentEstimate` (a new TPM would be needed, since none tracks block time today) | `mission.totalMinutes` + ground/taxi allowance | min | sum of segment minutes + stated terminal allowance | **[I]** VER-007 is a *test*, so analysis is only a prediction, not verification |
| **TPM-002** Pad-edge noise (`week05.ts:58`) | `currentEstimate` *or* a compliance flag | `dBA_100m` (validated, `provenance.js:263`), `dist_65dBA` (sourced, `:268`) | dBA / m | Either "compliant if `dist_65dBA` ≤ pad-edge distance" (the pad-edge distance is a new team assumption), or report `dBA_100m` | **[I]** weak to moderate: hover-only prediction; pad-edge distance undefined in AeroLink |
| **TPM-001** Charge time (`week05.ts:56`) | `currentEstimate` | **Not computed by the sizer** (grep **[V]**). Host-side: `(E_dispatch − 0.2 · PackUsablekWh) / P_charger` using `PackUsablekWh` and `maxCRate` | min | status `host-derived`; charger power from PHY-003 | **[I]** keep it out of the sizer contract's validated set |
| New aircraft TPMs (suggested: TPM-004 MTOW, TPM-005 battery mass, TPM-006 hover power) | `currentEstimate` | `MTOW`, `Wbat`, `Phov` | kg, kg, kW | identity | **[V]** outputs exist and are "validated" (`provenance.js:166, 290, 170`) |
| PHY-001 | `attributes.mtowKg`, `packKWh`, `wingSpanM` … | `MTOW`, `PackkWh`, `bWing` | kg, kWh, m | identity, `provenance: "analysis-computed"` (new value) | **[I]** |

Write-back rule: **never overwrite an input or a threshold**, only `currentEstimate`, `margin` (recomputed with the course's own rule, `week05.ts:54`) and evidence fields. Store the engine commit and digest with every write. This is the same rule MBSE Studio applies (`docs/EXTERNAL_ANALYSIS.md:208-211`).

---

## 5. Staged plan

**By Dec 1 2026 (about 7 weeks)**
1. *(Week 0, needs the owner's decision)* Choose rank 1 + 2, pick the sizer commit to pin, and decide the reserve convention (4.1).
2. Learning Studio: add the `analysis-computed` provenance value, a contract type and a pure mapper (`src/model/sizing.ts`) with unit tests against a recorded engine answer (2 d).
3. Learning Studio: build the Parametric analysis panel on the existing `sim/` precedent. It pins the sizer through an npm git dependency, runs the size and profile calls, shows warnings and the domain placard prominently, and writes TPM-003 (+ block-time, MTOW, Wbat, Phov) estimates and a VER-003 evidence record (3-4 d).
4. Contract export/import (rank 2) so a student can cross-check against `evtol-size --json` or the hosted app (1-2 d).
5. Optional instructor demo of MBSE Studio driving the sizer on an AeroLink-like block. This is *only* if the MBSE owner authorises the two adapter fixes; students do not install it.

**Spring 2027 (later semester)**
- Emit the analysed TPM block as a SysML v2 snippet (rank 4, one direction) validated by the course checker.
- Add a browser-safe `core` export to the sizer once its audit unfreezes `src/`, and switch the panel off internal paths.
- Re-evaluate MBSE Studio for students *if* it has (a) outside users per its `docs/EVALUATION.md`, (b) a really installed, ideally per-user, installer, and (c) a contract importer and exporter. Its SysML 1.7 basis still mismatches a v2 course unless a v2 writer lands (`docs/ROADMAP.md:243-252`).

**Not recommended for this course at any stage:** FMI (wrong model type), OSLC, and a SysML v2 API server (IT/hosting cost far exceeds the teaching value until a course tool speaks the API).

---

## 6. Decisions the owner must make

1. **Host of the student experience:** the Learning Studio panel (recommended) vs. MBSE Studio (not ready by Dec 1).
2. **Sizer version policy:** pin one commit for the term (recommended), and accept that its 0.x results and open audit findings are part of what students see, with the warnings shown.
3. **Reserve convention:** size with the sizer's 20-min regulatory reserve and check AeroLink's 20 % energy reserve after sizing (recommended), *or* redefine the course requirement.
4. **Teaching-value boundary:** AeroLink's values are FICTIONAL. Sizer outputs will make the TPMs look "real". Decide whether to label them `analysis-computed (teaching)` and keep the instructor-set baseline alongside.
5. **TPM set:** keep TPM-001..003 only, or add aircraft TPMs (MTOW, battery mass, hover power, block time). Also decide whether TPM-002 needs a defined pad-edge distance.
6. **Coordination with the two other work streams:** any change to the sizer (`src/` frozen by its audit) or to MBSE Studio (holder-gated, per-commit authorisation) needs that holder's approval. Rank 1 needs **neither**.
7. **FD-08 and FD-20 interplay:** if MBSE Studio is ever considered as a student tool, it must go through the same FD-08 evaluation and FD-20 accessibility protocol as any other candidate.

---

## 7. What was not verified

- No code was executed. Run times, convergence at AeroLink's inputs (41.7 m/s cruise, 25 km, 362.9 kg) and the current pass/fail of `tests/test_evtolsizer_integration.py` against sizer `208a574` are all **[U]**.
- Whether the sizer engine bundles cleanly under Vite 8 / TS 6 in the Learning Studio is **[I]** (it has no Node imports, and the sizer's own Vite build already bundles it for the browser).
- I did not obtain a legal opinion on whether a student-distributed MBSE Studio build carrying the generated metamodel is allowed.
