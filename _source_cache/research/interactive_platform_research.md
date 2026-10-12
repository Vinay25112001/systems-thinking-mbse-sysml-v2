# Interactive Platform Research: Learning Studio Redesign

**Course:** Systems Thinking + MBSE with SysML v2 (AeroLink air-taxi case, 14 weeks)
**App:** `C:\Users\w451vxs\Documents\Course_Work\SysML\learning-studio` (React 19, TypeScript, Vite 8, Tailwind 4, `@xyflow/react` 12, Recharts 3; a static student build via `build:student`; the SysML v2 Pilot Implementation is already used **at authoring time** via `scripts/check_sysml.py`)
**Deadline:** 2026-12-01 (about 7 weeks from 2026-10-11)
**Researched:** 2026-10-11

## How verified each claim is

| Tag | Meaning |
|---|---|
| **[V]** | Verified: I read the primary page (repo README, official docs, or the paper/publisher page) during this session. |
| **[S]** | Secondary: taken from search-result summaries or secondary pages. The primary source was not opened, or it blocked fetching (PNAS, ASEE PEER, INCOSE and DTIC PDFs all returned 403/404). |
| **[I]** | Inferred: my own engineering judgement, or recall that I did not re-check. Treat these as hypotheses to confirm. |

---

## 1. Executive summary

1. **Don't embed a real SysML v2 tool. Copy the *shape* of one.** No mature open-source SysML v2 modeler runs fully in the browser offline. SysON needs Docker plus PostgreSQL [V]. The Pilot Implementation and the API Services need a JVM [V]. The most effective move in 7 weeks is to turn the app into an **"AeroLink Workbench"**: one persistent, professional tool layout that every week of the course runs inside.
   - The layout: model browser, then canvas/editor, then properties, then a problems panel, with the lesson docked as a "mission brief".
2. **Make the existing AeroLink model the single source of truth, so changes visibly propagate.** This is the Valispace pattern [S]: change battery specific energy and range, TPMs, requirement verification status, risk and trade-study ranking all update live. The app already has `src/sim/aerolink.ts` and `src/model/*`, so this is mostly wiring and UI, not new science [I].
3. **Turn 19,000 px of prose into worked, then faded, then independent tasks** with a validation panel that gives instant feedback.
   - Worked examples and fading: [S].
   - Retrieval practice: [S].
   - Active learning: 0.47 SD on exams, failure falls from 34% to 22% [V, via the PNAS commentary].
   - Simulation-based learning: g = 0.85 [S].
4. **Make SysML v2 text a live, two-way experience for a course subset.** Use a code editor with a browser-side parser: tree-sitter-sysml (MIT, March 2026, young) [V], or a hand-written subset parser. Sync it with a React Flow + elkjs diagram. Precompute full semantic validation with the Pilot Implementation at build time, which the toolchain already does.
5. **Use SysON only as an optional external capstone lab** (it runs in Docker locally). Don't try to iframe it.

---

## 2. Open-source SysML v2 / MBSE tooling

### 2.1 Comparison table

| Tool | License | Maturity / last activity | Runs in-browser and offline? | Embed effort into this React app | Fit for this course |
|---|---|---|---|---|---|
| **Eclipse SysON** (Obeo / CEA, on Sirius Web) | EPL-2.0 + LGPL-3.0 [V] | Very active. 8-week release cycle, 2026.9 is the latest [V]. ~1,660 commits [V]. Self-described "under active development and evolving rapidly"; suitable for "teaching, research, and industrial pilots" [V] | **No** for pure browser use: it needs a Spring Boot backend and PostgreSQL. **Yes** for a local offline machine via `docker compose up` on `localhost:8080` [V] | **High.** iframe embedding is undocumented [V], so it would need the same-origin/X-Frame headers checked [I]. Students would need Docker [I] | **Good as an external lab** (General View, Interconnection View, explorer, details panel, validation, textual import/export [V]). Poor as embedded content |
| **SysML v2 Pilot Implementation** (OMG SST) | EPL-2.0 [V] | Very active, ~4,900 commits; Eclipse 2025-12 / Java 21 [V] | **No**: it's Java (Xtext, Eclipse) plus a Jupyter kernel; PlantUML/GraphViz for diagrams [V] | Not embeddable in a browser. **Already used** offline as a build-time validator (`check_sysml.py`) | **Keep as the authoring-time oracle.** It can precompute validation and diagrams for every example and exercise |
| **SysML v2 Release repo** (examples, library, training slides) | EPL-2.0 for code and models; slides CC-BY-4.0 [V] | Updated through 2026 [V] | Static files | Trivial: vendor the example models and library | Content source. CC-BY slides can be adapted with attribution |
| **SysML v2 API & Services** | EPL-2.0 [V] | A "proof-of-concept pilot" [V]. Play/Scala, JDK 11, PostgreSQL [V] | No (a server) | High; no benefit for a single-user local app | **Not recommended** |
| **Sensmetry SysIDE (legacy, sysml-2ls)** | Apache-2.0 [V] | **Archived 2025-10-13**, deprecated in favour of the newer Syside Editor [V] | Ran on vscode.dev [V]; Langium-based [V] | Medium-high: a fork of an archived Langium grammar plus Monaco | **A grammar source to study** (Apache-2.0 means it can be reused). It's archived, so don't depend on it |
| **Syside Editor / Syside Modeler** (Sensmetry) | Free editor; Modeler is paid [S] | Active [S] | VS Code extension | Not embeddable | Optional "real-tool" exposure for advanced students |
| **tree-sitter-sysml** (Nomograph Labs) | MIT [V] | **New**: created 2026-03-10, v0.1.0, 192 commits [V]. ~2,400-line grammar covering "major" constructs [S] | **Probably yes** via `web-tree-sitter` (WASM) [I]. It ships Node bindings [V]; the WASM build is unverified | **Medium**: build the WASM, map the CST to the app's model | **Best browser-side parse option for syntax feedback**, if the course subset parses. Spike for 1 day before committing |
| **kebnf** (Rust crate) | see crate [S] | 2026 [S] | Tooling only | Generates ANTLR4 / tree-sitter grammars from the OMG KeBNF (all ~640 rules) [S] | A fallback for producing a full grammar; high effort |
| **Langium** (Eclipse, TypeFox) | MIT [S] | Mature (1.0 in 2022; active) [S] | **Yes**: the language server runs in a web worker with Monaco [S] | High: you'd write or port a SysML grammar (the legacy SysIDE grammar is a starting point) | Over-scope for 7 weeks |
| **Monaco Editor / CodeMirror 6** | MIT [I] | Mature [I] | Yes | Low | The editor surface for SysML text. CodeMirror 6 is lighter for a Vite app [I] |
| **React Flow (`@xyflow/react` 12)** | MIT [V] | 38.6k stars, very active [V] | Yes | **Already a dependency** | The canvas for SysML general/interconnection-style views, CLDs, trace graphs |
| **elkjs** | EPL-2.0 (the Eclipse Layout Kernel) [I] | Mature; used by Mermaid and React Flow examples [V] | Yes, with a Web Worker option [V] | Low | Automatic layout with **ports** [V], which interconnection views need |
| **PlantUML** | GPL/LGPL/MIT variants [I] | Mature | Needs Java or a server [I] | Medium | Only via the Pilot at build time (pre-rendered SVG) |
| **OpenMBEE** (MMS, View Editor, Flexo) | Apache-2.0 [S] | Active, NumFOCUS-sponsored [S] | No (server stack) | High | Not needed |
| **Gaphor** | Apache-2.0 [S] | Active; desktop Python/GTK, UML + **SysML 1.x** [S/I] | Desktop only | n/a | Not SysML v2; skip |
| **Capella / Sirius Web** | EPL [S] | Mature (Capella); Sirius Web active [S] | Capella is desktop; Sirius Web needs a server | High | A UI reference only (Arcadia layout) |
| **SysML v2 Lab** (sysmlv2lab.com) | "Open source" [S] | Online Jupyter on the pilot kernel [S] | Online only | Link-out | Handy zero-install demo link; depends on availability |
| **CATIA Magic / Cameo SysML v2 Community Edition** | Free, up to 500 elements [S] | Commercial | Desktop | n/a | Industry-realism exposure, optional |

### 2.2 Implications

- **[I]** No candidate gives in-browser, offline, embeddable, full-semantics SysML v2. So, inside the app:
  - **Syntax and structure feedback** comes from a browser parser over a deliberate course subset (part/port/connection/requirement/satisfy/verify/attribute/action/state). This is feasible.
  - **Semantic validation** is precomputed per exercise with the Pilot (already wired), plus hand-written rule checks in TypeScript that cover the course's learning objectives. Examples: "every requirement has a satisfy", "port types are conjugate", "units are consistent".
- **[I]** For "real tool" authenticity, give an optional SysON lab in Weeks 12–14 (Docker on the student's machine or a lab PC) and a Syside Editor/VS Code path. Don't make the course depend on either.

---

## 3. Interactive learning-platform patterns (mechanics and evidence)

| Pattern | Exemplars | The mechanic that drives engagement | Evidence | Apply here as |
|---|---|---|---|---|
| **Split pane: instructions plus a live tool** | Codecademy, Exercism, freeCodeCamp [I] | Short instruction, immediate action in a real environment, automated check, next step. Feedback loops last seconds, not days | Feedback and active practice: Freeman 2014 [V/S]. Retrieval and practice testing are "high utility" (Dunlosky 2013) [S] | **Mission-brief dock** next to the workbench. Each step is a checkable action on the AeroLink model |
| **Reactive documents / explorable explanations** | Bret Victor's *Explorable Explanations*; Nicky Case (LOOPY, *Parable of the Polygons*); Distill [V for Victor] | "The reader can play with the author's assumptions and analyses, and see the consequences" [V]. Victor also stresses "the author must guide the reader" [V] | Design rationale, not RCTs [I] | Inline "what-if" numbers in briefs (drag the battery Wh/kg, watch range and the margin update) |
| **Reactive notebooks** | Observable, Jupyter Book + Thebe/JupyterLite [I] | Cells recompute on dependency change, so you see change propagate | — | The workbench model store behaves like a reactive notebook: dependent values recompute |
| **Scenario / branching case with consequences** | SERC **Experience Accelerator** (DAU-sponsored; Stevens, Georgia Tech, Purdue, USC) [S] | The learner is the lead program SE on a new UAS program. They make decisions and trade-offs at key lifecycle points; system-dynamics models simulate the program; problems emerge and must be recovered [S]. Aims to "compress time" through experiential plus reflective learning [S] | Pilots evaluated; the primary PDFs were not retrievable this session (403/404) [S]. Treat as design inspiration | **Program Review cycles**: at Weeks 4, 7, 10 and 13, students make program decisions; the AeroLink sim advances; consequences surface (TPM breach, schedule slip) |
| **Serious games** | Experience Accelerator; MIT Beer Game for systems thinking [I] | Role, stakes, delayed feedback, debrief | Wouters et al. 2013: learning d = 0.29, retention d = 0.36, *not* more motivating (d = 0.26); works better when **supplemented with instruction, multiple sessions and groups** [S] | Keep game elements tied to instruction plus a debrief; don't expect "fun" alone to carry it |
| **Simulation-based labs / digital twin sandbox** | PhET, SageModeler [S] | Manipulate, observe, explain | Chernikova et al. 2020 (145 studies): **g = 0.85**. Scaffolding helps; low-prior-knowledge learners benefit from **examples**, high-prior-knowledge learners from **reflection** [S] | Sandbox mode of the workbench plus scaffolded missions |
| **Productive failure** | Kapur | Attempt a problem *before* instruction, then consolidate | Sinha & Kapur 2021 meta-analysis (53 studies, 166 comparisons) is positive, strongest with high-fidelity design [S]. Exact effect sizes not verified [I] | Each week opens with a 5-minute "try it cold" challenge on the model, then the worked example |
| **Gamified progress** | Brilliant, Duolingo [I] | Visible mastery, streaks, unlocks | Mixed; points for reading can undermine motivation [I] | A **model-maturity dashboard** (requirements covered, trace completeness, TPM margins) instead of XP. Progress means engineering quality |
| **Capstone dashboard + peer review** | Studio courses, design reviews [I] | Public artefacts, critique against rubric | — | Export model snapshot + review checklist; peer review in class (no server needed: file exchange) |

---

## 4. Pedagogy evidence (summary)

- **Active learning:** Freeman et al. 2014, *PNAS* 111(23):8410–8415. 225 studies; exam/concept-inventory performance **+0.47 SD**; failure rate **34% → 22%**. Lecture students were about 1.5× more likely to fail. The concept-inventory effect is 0.88. **[V]** for the numbers, via the PNAS commentary on PMC (PMC4060683), which restates the meta-analysis. **[S]** for the odds ratio of 1.95.
- **Worked and faded examples / cognitive load:** worked examples beat unguided problem solving for novices. Fading steps improves near transfer. The **expertise-reversal effect** means worked examples lose value as learners gain skill, so fade them **[S]** (Renkl; Sweller; MIT Open Learning summary). Implication: by Weeks 8–14, students who mastered Weeks 1–7 notions should get fewer full examples.
- **Retrieval and spacing:** Dunlosky et al. 2013 (*PSPI*) rate practice testing and distributed practice as **high utility**. Rereading, highlighting and summarising are **low**. **[S]** Implication: the current prose-heavy pages favour the low-utility strategies.
- **Simulation-based learning:** Chernikova et al. 2020, *RER* 90(4), **g = 0.85**, 145 studies; scaffolding moderates **[S]**.
- **Serious games:** Wouters et al. 2013, *J. Ed. Psych.* 105(2) **[S]** (numbers in §3).
- **MBSE education:**
  - Gregory & Steiner, ASEE 2024, "Leveraging Active Learning Techniques to Teach MBSE" (Univ. of Arizona, SysML v1 in a Magic tool): modeling assignments, discussion sessions, vendor resources, hybrid-class lessons **[S]**.
  - Recurring themes in the literature: abstract notation, steep tool learning curves, and **missing one concept cascades** into later failure. Practical application with contextual feedback is what works **[S]**.
  - Georgia Tech's MBSE syllabus uses live follow-along SysML v2 sessions **[S]**.
  - Implication **[I]**: a purpose-built, low-friction tool with in-context validation addresses exactly the "tool learning curve" barrier, and keeps the industrial tool for later.

---

## 5. Systems-thinking interactive tools

| Tool | License | Offline / embeddable | Notes / fit |
|---|---|---|---|
| **LOOPY** (Nicky Case) | **CC0-1.0, public domain** [V] | Static site, self-hostable [V]; can be vendored into `public/` and iframed same-origin [I] | Best "play" CLD tool; signal-propagation animation. Zero license friction. Good for Weeks 2–4 sandbox |
| **Insight Maker → `simulation` npm** (Scott Fortmann-Roe) | **AGPL** [V] | The library runs in browser ES modules; v9 [V] | Strong SD/agent engine. **AGPL obliges source release of the combined work if distributed**. Fine if the course app is open-source; otherwise avoid [I] |
| **Kumu** | Proprietary SaaS; public projects free, private $9/project/month [S] | iframe embed of public maps [S]; **not offline** | Use only as an optional link; violates the offline/local constraint |
| **SageModeler** (Concord Consortium) | Open source (exact license not confirmed) [S] | Web | K-12 oriented; reference only |
| **Own React Flow CLD/stock-flow** | your code | Fully offline | **Recommended**: the app already has `CausalLoopDiagram.tsx` and `DynamicsExplorer.tsx`. Add a ~100-line Euler/RK4 integrator to avoid AGPL [I] |

---

## 6. Professional UI references

### 6.1 Layout conventions of industrial tools

- **Cameo / CATIA Magic:**
  - Left **Model Browser** with Containment, Structure, Inheritance, Diagrams and Search tabs.
  - Central **Diagram Pane**.
  - A **Specification window** and properties for the selected element [S, No Magic docs].
- **SysON:** explorer, then diagram canvas, then **details panel**; plus form/table editors and **validation** [V].
- **Capella:** Project Explorer, diagram, Properties, Problems/Validation; Arcadia-phase activity explorer [I].
- **Valispace:** parameters linked by formulas, so changes **propagate** across the whole database. Requirements auto-verify against live values [S].
- **Jama:** requirements tables plus relationship/trace views, coverage, and impact analysis [I].
- **Ansys ModelCenter:** workflow graph of analyses with design-of-experiments / trade-study plots [I].

**Canonical workbench layout to emulate** [I]:
```
┌ Top bar: project ▸ AeroLink · week/mission · run/validate · save/export ┐
├ Model browser ┬──────── Canvas / Editor (tabs: Diagram | Text | Table | Matrix) ───────┬ Properties ┤
│ (tree,        │                                                                         │ (selected   │
│ search,       │                                                                         │  element    │
│ filters)      │                                                                         │  form)      │
├───────────────┴──── Bottom dock: Problems (validation) | Trace impact | Console/Sim ────┴ Mission ◂ │
└──────────────────────── Status bar: model health · TPM margins · mission progress ─────────────────┘
```
The lesson becomes a **collapsible right-hand "Mission brief" dock** with numbered steps, hints and checks. Long-form reading moves to an optional "Reference" drawer.

### 6.2 Design systems

| System | License | Strength | Fit |
|---|---|---|---|
| **Blueprint.js** (Palantir) | Apache-2.0 [V] | "Optimized for building complex, data-dense web interfaces for desktop applications"; "not a mobile-first UI toolkit" [V]. Packages: core (Tree, Tabs, Navbar, Callout), **table** (spreadsheet-like), select, icons [V] | **Best match for the workbench look.** Brings its own Sass CSS alongside Tailwind (some styling duplication) [I] |
| **Radix UI + shadcn/ui** | MIT [I] | Accessible primitives; copy-in components styled **with Tailwind**. Pairs with `react-resizable-panels` for the dock layout [I] | **Lowest integration friction** with the existing Tailwind 4 stack. Needs more own design work for density |
| **IBM Carbon** (`@carbon/react`) | Apache-2.0 [V] | UI Shell, DataTable, TreeView [V]; strong enterprise look | Heavier; its own styling system [I] |

**Recommendation [I]:** stay on Tailwind and add **Radix/shadcn primitives**, `react-resizable-panels` for the docks, and a dense, IBM-Plex/Inter-style "engineering" theme (dark and light). Borrow Blueprint's **density and tree/table conventions** visually. Adopt `@blueprintjs/table` only if a spreadsheet-grade traceability matrix is needed. A full design-system switch within 7 weeks is a risk.

---

## 7. Ranked recommendations (7-week plan)

Effort is in focused developer-days for one developer plus Claude, and assumes the existing model/sim code is reusable **[I]**. The total of the must-haves is about 25–30 days, which fits 7 weeks only if items 1–5 are done first and content conversion is prioritised.

| Rank | Recommendation | Why (evidence) | Effort | Risk |
|---|---|---|---|---|
| **1** | **AeroLink Workbench shell**: one persistent tool layout (browser / canvas-editor tabs / properties / problems / mission dock / status bar) used by every week; Radix+shadcn, resizable panels, dense pro theme | Emulates Cameo, SysON and Capella conventions [S/V]; removes "document" feel; reduces tool learning-curve barrier [S] | 6–8 d | Low |
| **2** | **Single reactive model store + change propagation**: unify `model/airtaxi.ts`, `model/engineering.ts` and `sim/aerolink.ts` behind one store. Edits recompute TPMs, requirement verification, risks and trade ranking; show an **impact highlight** (what changed and why) | Valispace pattern [S]; explorable "see the consequences" [V]; simulation g = 0.85 [S] | 4–6 d | Medium (state design) |
| **3** | **Mission-driven lessons (worked, then faded, then independent)** replacing prose. Each week = 1 cold-start challenge (productive failure), 1 worked mission, 1–2 faded missions, 1 independent mission, 3–5 retrieval questions. Prose moves to a Reference drawer. **Do Weeks 1, 8 and 12 first** as templates | Freeman [V]; worked/faded + expertise reversal [S]; Dunlosky [S]; Kapur [S] | 0.5–1 d/week of content = **7–14 d** | Medium (content volume) |
| **4** | **Problems / validation panel with rule checks** (TypeScript rules per learning objective; severity, "go to element", hint). Missions complete when rules pass | Immediate feedback is the engine of split-pane platforms [I]; MBSE students need contextual feedback [S] | 3–4 d | Low |
| **5** | **Traceability matrix + impact view** (requirements × design elements × verifications; click a cell to create/remove a trace; coverage %) | Core industry view (Jama, Cameo) [I]; directly drives Weeks 4–5 and 12 | 3 d | Low |
| **6** | **SysML v2 text ⇄ diagram for a course subset**: CodeMirror 6 editor; a parser (spike tree-sitter-sysml WASM for 1 day; else a hand-written recursive-descent subset parser); live sync to a React Flow + elkjs (ports) view and to the model browser. Full semantic results for each exercise precomputed with the Pilot via the existing `check_sysml.py` | Gives "using a real tool" for Weeks 8–14 without a server. tree-sitter-sysml is MIT [V] but young [V] | 8–10 d | **High**: time-box it; fallback is read-only pre-rendered pairs with editable attribute values |
| **7** | **Program Review decision cycles** (Weeks 4, 7, 10, 13): choose options, advance the sim, consequences appear in the dashboard; then a debrief | Experience Accelerator design [S]; serious games work best with instruction and debrief [S] | 4–5 d | Medium |
| **8** | **Systems-thinking sandbox**: extend the existing CLD/Dynamics components with stock-flow + own integrator. Vendor **LOOPY (CC0)** as a free-play tab | LOOPY CC0 [V]; avoid AGPL `simulation` [V] | 3–4 d | Low |
| **9** | **Model-maturity dashboard** as progress (coverage, margins, open problems, missions done) plus snapshot export for peer review / capstone submission | Progress tied to engineering quality, not reading [I] | 2–3 d | Low |
| **10** | **Optional external real-tool labs**: SysON via Docker (`docker compose up`, :8080) [V] and Syside Editor in VS Code, with guided import of the student's exported `.sysml` | Industry authenticity; SysON targets teaching [V] | 1–2 d (docs) | Low; depends on student Docker access |

**Not recommended** in this timeframe:
- Embedding SysON in an iframe.
- Running the SysML v2 API Services.
- Running the Pilot Jupyter kernel in-browser (the JVM can't run in JupyterLite) [I].
- Kumu (cloud, not offline).
- Bundling Insight Maker's AGPL engine, unless the app is published as AGPL.

**Suggested sequence [I]:**
- **Wk 1:** items 1 + 2 skeleton.
- **Wk 2:** item 4, and convert Week 1.
- **Wk 3:** item 5, and convert Weeks 2–4.
- **Wk 4:** item 6 spike, with a go/no-go on day 1, then build; convert Week 8.
- **Wk 5:** item 6 continued + item 7.
- **Wk 6:** items 8 and 9; convert the remaining weeks.
- **Wk 7:** polish, accessibility (axe already present), e2e tests, item 10 docs, freeze.

---

## 8. Open questions for the faculty owner

1. Can students install Docker (for the optional SysON lab), or is the app the only tool?
2. Will the app's source be published? This decides whether AGPL components are acceptable.
3. Which weeks matter most to showcase by 2026-12-01? This sets the content-conversion priority.
4. Is a JVM on student machines acceptable for an optional "validate with the reference implementation" button? A local sidecar is possible; it isn't needed for the core plan.

---

## 9. References

**SysML v2 / MBSE tools**
- Eclipse SysON repo: https://github.com/eclipse-syson/syson [V]
- SysON site / status: https://mbse-syson.org/ [V]
- SysON local install (2026.7): https://doc.mbse-syson.org/syson/v2026.7.0/installation-guide/how-tos/install/local_test.html [V]
- SysML v2 Pilot Implementation: https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation [V]
- SysML v2 Release: https://github.com/Systems-Modeling/SysML-v2-Release [V]
- SysML v2 API & Services: https://github.com/Systems-Modeling/SysML-v2-API-Services [V]
- Sensmetry sysml-2ls (archived): https://github.com/sensmetry/sysml-2ls [V]
- tree-sitter-sysml: https://gitlab.com/nomograph/tree-sitter-sysml [V]
- kebnf: https://docs.rs/crate/kebnf/0.2.0 [S]
- Langium in the browser: https://www.typefox.io/blog/langium-web-browser/ ; https://langium.org/ [S]
- SysML v2 tools overview (sim4edu): https://sim4edu.com/reading/kerml-sysml/tools-overview [V]
- SysML v2 Resources list: https://github.com/daltskin/SysML-v2-Resources [V]
- OpenMBEE: https://github.com/Open-MBEE ; https://numfocus.org/project/openmbee [S]
- Gaphor: https://gaphor.readthedocs.io [S]
- Capella: https://en.wikipedia.org/wiki/Capella_(engineering) [S]
- React Flow / xyflow: https://github.com/xyflow/xyflow [V]
- elkjs: https://github.com/kieler/elkjs [V]

**Systems thinking**
- LOOPY: https://github.com/ncase/loopy [V]
- Insight Maker (deprecated): https://github.com/scottfr/insightmaker [V]; simulation engine (AGPL): https://github.com/scottfr/simulation [V]
- Kumu pricing: https://www.kumu.io/pricing ; https://docs.kumu.io/frequently-asked-questions/what-pricing-plans-does-kumu-have [S]
- SageModeler: https://sagemodeler.concord.org/about/index.html [S]

**UI references and design systems**
- Blueprint: https://github.com/palantir/blueprint [V]
- Carbon: https://github.com/carbon-design-system/carbon [V]
- Cameo/MagicDraw model browser docs: https://docs.nomagic.com/MT/latest/magic-software-architect---magicdraw/working-with-model-elements-303994714.html [S]
- Valispace features: https://www.valispace.com/features2/ [S]

**Learning design and pedagogy**
- Bret Victor, Explorable Explanations: http://worrydream.com/ExplorableExplanations/ [V]
- Freeman et al. 2014, PNAS: https://www.pnas.org/doi/10.1073/pnas.1319030111 (403 to fetch); commentary with the numbers: https://pmc.ncbi.nlm.nih.gov/articles/PMC4060683 [V]
- Dunlosky et al. 2013 (APS release): https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html [S]
- Worked/faded examples: https://openlearning.mit.edu/mit-faculty/research-based-learning-findings/worked-and-faded-examples ; https://en.wikipedia.org/wiki/Worked-example_effect [S]
- Chernikova et al. 2020, RER: https://epub.ub.uni-muenchen.de/84298/1/0034654320933544.pdf [S]
- Wouters et al. 2013: https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/ [S]
- Sinha & Kapur 2021 (productive failure): https://www.weforum.org/stories/2021/09/students-who-productively-fail-learn-more/ (secondary) [S]
- SERC Experience Accelerator: https://sercuarc.org/wp-content/uploads/2018/08/09A_SSRR-2016_SEEA_WadeZhang.pdf ; https://dair.nps.edu/bitstream/123456789/1402/1/SYM-AM-12-131.pdf ; https://researchwith.stevens.edu/en/publications/simulation-based-decision-support-for-systems-engineering-experie/ [S]
- Gregory & Steiner, ASEE 2024: https://peer.asee.org/47735 (403 to fetch) [S]
- Georgia Tech MBSE syllabus: https://syllabus.gatech.edu/node/13131 [S]
- INCOSE IS2022 MBSE education presentation: https://www.incose.org/wp-content/uploads/legacy/presentation/IS2022-pdf/7.6.3.pdf [S]
