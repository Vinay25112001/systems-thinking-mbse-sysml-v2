# Week 1 Learn: digital textbook information architecture

Prepared 2026-10-21 for directive §10 (Learn: a comprehensive digital textbook), §10.1 (AeroLink introduced early), §10.2 (reading layout),
§10.3 (interactivity only where it teaches), §14 (traceability) and §20 (academic quality gate). Nothing here changes a definition or an
attribution. Every definition below is the one the existing source already quotes, at the page it cites. Paths are relative to
`learning-studio/`. Line numbers are from the 2026-10-21 working tree.

**Existing text measured:** 13,493 words in 21 lesson sections plus 474 words of generated references (`session1.ts:1157-1452`,
`session2.ts:881-1126`; counted with the app's `wordCount`/`blockText`). Reusable text off the student path: `MEET_AEROLINK`
(`learn/week01.ts:618-634`, ≈300 words), the systems-thinking blocks (`week1.ts:85-106`, ≈420 words), `PRINCIPLES` (`week1.ts:161-170`, ≈330 words)
and `w1-intuition` (`week1.ts:46-56`, ≈150 words).

**Estimated finished Learn:** ≈13,900 reused words (some lesson text moves to My Project or is merged) plus ≈2,900 new words, about **16,800
words** (≈1.9 h at the app's 150 wpm, `week1Path.ts LESSON_WPM`). Per §10 that is neither cut short artificially nor inflated. The new words go only
into the gaps listed in §6.

---

## 1. Sequence and rationale

### 1.1 Mapping of the ten required topics (§10) to chapters

| §10 topic | Chapter | Main reused source |
|---|---|---|
| (§10.1) AeroLink introduced early | **1** Week 1 in context, and the AeroLink case | `s1-lesson-why`, `MEET_AEROLINK`, `aerolinkCase.ts` |
| 1 Engineered systems | **2** Engineered systems | `s1-lesson-system`, `s1-lesson-soi` ¶1–2, `w1-intuition` |
| 2 Systems thinking and enterprise systems | **3** Systems thinking and the enterprise | `week1.ts` w1-paradox, w1-analysis-synthesis, PRINCIPLES; `s1-lesson-soi` ¶3–4 |
| 3 Boundaries and operational environments | **4** Boundaries, context and operational environments | `s1-lesson-boundary` |
| 4 Mission ↔ stakeholders ↔ needs | **5** From mission to stakeholders to needs | `s1-lesson-lifecycle` + new 5.4 |
| 5 Stakeholder identification and classification | **6** Identifying and classifying stakeholders | `s1-lesson-stakeholders`, `s1-lesson-classifying`, `s2-l-case-register` |
| 6 Concerns, interests and relationships | **7** Concerns, interests and relationships | `s2-l-concerns`, case concern and relationship tables |
| 7 Needs elicitation | **8** Eliciting needs | `s2-l-elicitation`, `ELICITATION_PLAN` |
| 8 Needs vs requirements vs proposed solutions | **9** Needs, requirements and proposed solutions | `s2-l-needs-reqs`, `s2-l-integrated-set`, `s2-l-well-formed`, `s2-l-conflict`, `s2-l-case-needs`, `s2-l-errors` |
| 9 Engineering context and traceability foundations | **10** Traceability foundations and the road to Week 8 | `s2-l-case-audit`, `s2-l-why-methods`, `s2-l-bridge`, `MODEL_INPUTS` |
| 10 Team formation and enterprise selection | **11** Forming the team and choosing the enterprise | `s1-lesson-teams`, criteria in `s1-lesson-why` ¶3, `learn/week01.ts:111` |

### 1.2 Why this order

1. **Concrete before abstract, then dependency order.** A reader with no prior systems-engineering knowledge (the stated prerequisite,
   `welcome.ts:29`) meets the case (ch. 1) before the definitions, so that every definition can be applied at once. The concepts then follow
   their dependencies: a *system* (2) → thinking about systems and the *enterprise* around them (3) → where the system ends (4) → what the
   enterprise is for and why stakeholders follow from it (5) → who the stakeholders are (6) → what they care about and how they relate (7)
   → how needs are obtained (8) → what a need is and is not (9) → how all of it is kept connected for later weeks (10).
2. **The team chapter comes last but is read early.** §10 lists team formation tenth, and conceptually choosing an enterprise depends on
   chapters 2–7 (the criteria mention boundaries, external exchanges and stakeholders whose needs differ, `session1.ts:1174`). Teams pitch
   in Session 2, however (`week1Path.ts:46-48`). The Overview therefore gives a **reading plan**: chapters 1–6 and 11 before Session 2,
   chapters 7–10 before writing needs. Chapter 11 has no dependency on 7–10.
3. **The case lesson sections are split by concept.** Today the AeroLink material sits in three sections at the end of the lesson and is shown a second time on the
   Examples page. Each piece moves into the chapter whose method it demonstrates (§10: "an AeroLink worked example" for each major concept).
4. **The lab section leaves Learn.** `s2-l-lab` is procedure, not theory. It moves to My Project, and 11.5 keeps a three-sentence pointer.

### 1.3 Stable content ids

Proposed scheme: `w1-ch<NN>-<nn>` for sections (e.g. `w1-ch06-03`) and `w1-ch<NN>` for chapters. Ids never change when text changes (§5,
§12.4); revisions are versioned in metadata. Each new section records `legacy` ids so that the existing links keep resolving
(`quizWeek1.ts lecture.section`, `week1/route.ts:25-33 LEARN_TO_LESSON`, `exampleParts.ts`, `learn/week01.test.ts:232`).

---

## 2. Chapter-by-chapter architecture

Column key: **Reuse** = existing source (file, section id, paragraph or line). **Defs** = definitions and their verified register entries
(⚠ = no verified source; see §5). **Figures** = existing figure ids to reuse. **Interactive** = proposed only where it teaches (§10.3), always
with a text equivalent. **AeroLink** = the worked example. **Errors** = misconceptions, from the faculty notes (`notes.misconceptions`,
file:line) or the lesson's errors table, quoted into Learn; the notes stay faculty-side. **Later** = the future artifact the section feeds.
**Check** = a selective knowledge check placed *after* the instruction. **Words** = reused + new (estimate).

### Chapter 1. Week 1 in context, and the AeroLink case (`w1-ch01`)

| Id | Section | Reuse | Defs | Figures | AeroLink | Later | Words |
|---|---|---|---|---|---|---|---|
| w1-ch01-01 | Why Week 1 matters | `s1-lesson-why` ¶1 (`session1.ts:1164`) and the ID-continuity half of ¶2 (`:1169`); ¶4 (`:1179`) | — | `week-path` (exists; has a text equivalent in `learn/week01.ts:518-525`, which needs the L-codes removed) | — | Week 1 Team Record → Week 2, Week 8 | 230 + 60 |
| w1-ch01-02 | How this textbook and the week fit together | — | — | — | — | — | 0 + 150 (new: Learn → Practice → My Project → Review; the reading plan, §1.2) |
| w1-ch01-03 | Meet AeroLink: the enterprise, its problem and its mission | `MEET_AEROLINK.what`, `.conops`, `.use` (`learn/week01.ts:619-631`); `s1-lesson-why` ¶3 (`session1.ts:1174`, without the team-criteria sentences, which move to 11.4); `PROBLEM_STATEMENT` (`aerolinkCase.ts:270`); `MISSION_GOALS` (`:262-268`); `ENTERPRISE` (`:56-61`) | Enterprise, system of interest: defined in ch. 2–3 and forward-linked here | `w1s1-aerolink-network`, `w1s1-vertiport-scene` | The whole case in outline: type of enterprise (service enterprise with partners), problem, mission MGO-001, operating concept (SCN-001…005), operational environment (airspace, weather, grid, the city), stakeholder overview (15, by role group), boundary in one sentence | Every chapter's worked example; Guided Practice dataset | 420 + 250 |
| w1-ch01-04 | What is real and what is a teaching assumption | Provenance data in `aerolinkCase.ts` (`provenance`, `PROPOSED_NOTE`); notes `session1.ts:237` ("Real aerospace analogue, described generically") | — | — | Table built from §3 below | — | 0 + 200 |
| w1-ch01-05 | How the course uses AeroLink, and how you adapt the methods | `MEET_AEROLINK.use` (`:631`); `welcome.ts:45-46` | — | `w1s1-two-phases` | "AeroLink, or a near copy of it, is not available to teams" (`session1.ts:1174`) | Team's own enterprise | 120 + 80 |

- **Errors:** "Week 1 is administrative" (`session1.ts:117`); "The Data Sheet values are realistic estimates we should defend" (`session1.ts:241`); "We can use AeroLink as our enterprise and adapt the reference data" (`session2.ts:773`); "Phase II starts over in a modeling tool" (`session1.ts:201`).
- **Check:** none (orientation chapter).

### Chapter 2. Engineered systems (`w1-ch02`) — topic 1

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch02-01 | Why engineers need a shared idea of "system" | `w1-intuition` (`week1.ts:46-56`, bus depot, then AeroLink) | — | — | — | Vertiport neighbours who never ride | 150 + 0 |
| w1-ch02-02 | What systems engineering is for | `s1-lesson-system` ¶1–2 (`session1.ts:1190-1194`) | Systems engineering, success (R01 p.51); principles 1, 2, 7 (R91 p.130) | — | — | — | 150 + 0 |
| w1-ch02-03 | Three definitions of system | ¶3–4 + `definitionsTable` (`session1.ts:51-60`, `:1199-1204`) | System ×3 (R38 p.1637) | — | — | "A service such as the AeroLink air-taxi service is therefore a system in the full sense" (`:1204`) | 240 + 0 |
| w1-ch02-04 | Elements, interactions, purpose and emergence: a primer | — | Emergence: only the INCOSE Fellows wording in R38 p.1637; no further source quoted ⚠ | `LessThanSum`, `OpenSystemFigure` (`SystemFigures.tsx:274`, `:74`) | Optional: an open-system figure with a toggle for exchanges (text equivalent: a list of inputs, outputs, elements) | Aircraft, chargers and dispatch interact to make waiting time | 0 + 300 (gap G2) |
| w1-ch02-05 | An engineered system lives in a context | ¶5 + `contextTypesTable` (`session1.ts:62-73`, `:1209`) | Engineered system (R01 p.51); four context types (R92 p.326) | — | — | Product = aircraft; service = air-taxi service (the SoI); enterprise; SoS (`session1.ts:68-71`) | 170 + 0 |
| w1-ch02-06 | System of interest and enabling systems | `s1-lesson-soi` ¶1–2 (`session1.ts:1221-1226`) | System of interest (R39b p.1652); enabling system (R39c p.1493, paraphrased) | `w1s1-soi-enabling` | — | The maintenance facility, training system and charger test rig (`:1226`) | 170 + 0 |

- **Errors:** "A system is a physical product" (`session1.ts:287`); "Systems engineering is about technical integration; stakeholders are a management topic" (`:283`); "An external system is the same as an enabling system" (`:333`).
- **Later:** SoI → Week 8 `part def` (`MODEL_INPUTS` row `soi`, `learn/week01.ts:780`).
- **Check:** quiz **w1q-3** (SoI definitions, `quizWeek1.ts:44-53`) after 2.6.

### Chapter 3. Systems thinking and the enterprise (`w1-ch03`) — topic 2

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch03-01 | What systems thinking is | `welcome.ts:18` (course framing, unsourced) | ⚠ No definition of systems thinking is quoted anywhere in the app. Candidates in the register: R02 "What is Systems Thinking?" pp.264–266; R50 MITRE "Systems Thinking" pp.45–49. These need claim-level extraction from `_source_cache` before use | — | — | — | 0 + 250 (gap G1) **Corrected 2026-10-21 (M4b):** the SEBoK glossary does define systems thinking, "Systems Thinking (glossary)", PDF p.1660 (R113; Checkland 1999, Senge 1990 twice); Learn 3.1 quotes it (M4b review F1). |
| w1-ch03-02 | The paradox, and how engineers proceed anyway | `w1-paradox` (`week1.ts:85-95`) | R02 p.266; R04 pp.273–275 | — | — | — | 180 + 0 |
| w1-ch03-03 | Principles of systems thinking | `PRINCIPLES` (`week1.ts:161-170`: boundary, holism, interaction, relations, separation of concerns, view, equifinality, parsimony; each with an AeroLink line) | R04 pp.274–275 | `PrinciplesView.tsx` (workbench, retired) as a base | **Principle explorer**: choose a principle, see its AeroLink illustration highlighted on the network figure. Text equivalent: the eight-row table | Each principle's `aerolink` field | 330 + 50 |
| w1-ch03-04 | Analysis and synthesis | `w1-analysis-synthesis` (`week1.ts:97-106`) | R50 pp.46–47 | — | — | MITRE's UAV example. Add an AeroLink synthesis sentence from `w1-worked` bullet 4 (`week1.ts:118`) | 140 + 40 |
| w1-ch03-05 | The enterprise is not the organization | `s1-lesson-soi` ¶3–4 (`session1.ts:1231-1236`) | Enterprise (R39d p.1497, preferred); enterprise description and "frequent misuse" (R07 p.815); extended enterprise (R07 p.816) | `w1s1-enterprise-nesting` | — | ENT-001 with partners; insurers in the extended enterprise; SOI-001 spans organizations | 250 + 0 |

- **Errors:** "The enterprise is the company" (`session1.ts:379`); "The enterprise and the system of interest are the same thing at different sizes" (`:383`).
- **Later:** ENT-001 → the Week 8 root package/context (`ModelPreview.tsx` mapping rows); enterprise approval (§12).
- **Check:** **c2** (enterprise versus organization, `learn/week01.ts:138-150`) after 3.5.
- **Note:** `w1-feedback` and `w1-application` (`week1.ts:124-147`) stay off the student path. They depend on a retired explorer.

### Chapter 4. Boundaries, context and operational environments (`w1-ch04`) — topic 3

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch04-01 | A boundary is chosen for a question | `s1-lesson-boundary` ¶1 (`session1.ts:1247`) | R02 p.264 (observer-allocated boundaries) | `w1s1-three-scopes` | **Boundary explorer**: switch between the three candidate boundaries (aircraft / flight operations / air-taxi service) for "Will adding aircraft reduce average passenger waiting time?" (`week1.ts BOUNDARY_QUESTION`); the causal links that cross each boundary are shown. Text equivalent: a three-row table "boundary / can it answer / why", from `w1-worked` (`week1.ts:113-118`, corrected bullet 3) | The three scopes | 190 + 0 |
| w1-ch04-02 | Boundary, environment, context: the vocabulary | ¶2–3 (`:1253`, `:1265`) | System boundary (R39i p.1639); boundary principle (R04 p.274); environment ×2 (R39e p.1501); system context (R39j p.1641); systemic resolution (R02 p.264) | `w1s1-boundary-anatomy` | — | Environments by stage: airspace, weather and grid in operation; factories; battery recycling (`:1265`) | 270 + 0 |
| w1-ch04-03 | Operational environments across the life cycle | — | Environment, second definition (R39e p.1501) | `w1s1-boundary-anatomy` | — | AeroLink's operational environment set out properly: airspace (EXT-001), weather (EXT-003, one-way), grid (EXT-002), urban setting, public transport (EXT-005) | 0 + 200 (gap G8) |
| w1-ch04-04 | Four layers of a context | ¶4–5 (`:1270-1275`) | Narrower/wider SoI, immediate/wider environment (R92 pp.326–327) | `w1s1-context-layers` | — | Narrower = fleet, operations center, booking; wider adds pads and chargers, demand; six EXT (`:1275`) | 240 + 0 |
| w1-ch04-05 | A boundary is a decision: control, influence and power | ¶6 (`:1279`) | R02 p.264 (Churchman); MITRE's four questions (R50 p.48) | `w1s1-control-influence`; `ControlRings` (`EngineeringFigures.tsx:160`) | **Control/influence rings**: place AeroLink elements in control / influence / influences-us rings; the owner stakeholder is revealed. Text equivalent: three lists | Vertiport operators and utility own constraints | 90 + 60 |

- **Errors:** "The biggest boundary is the safest" (`session1.ts:430`); "If we do not control something, it is outside the system of interest" (`:468`); "An external system and the organization that runs it are the same thing" (`:472`); "A boundary is an objective fact about the system" (`:511`).
- **Later:** PRT → Week 8 part usages; EXT → part usage in a context or actor; "crosses" → item def and port direction (`learn/week01.ts:782-784`). Week 2 ConOps uses the context.
- **Check:** **w1q-2** (hospital ED boundary) after 4.1; **w1q-4** (bike-share context) or **c3** after 4.5. Place one; the other goes to Review readiness.

### Chapter 5. From mission to stakeholders to needs (`w1-ch05`) — topic 4

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch05-01 | Life cycle and its stages | `s1-lesson-lifecycle` ¶1–2 (`session1.ts:1291-1296`) | Life cycle (R39f p.1550); six stages (R06b p.384); Table 1 stage names (R11 p.552) | `w1s1-life-cycle` | — | — | 190 + 0 |
| w1-ch05-02 | The ISO/IEC/IEEE 15288 process frame | ¶3–4 (`:1301-1306`) | 14 technical processes (R98 pp.1001–1002); Concept Definition, "why and what before how" (R94 p.540); naming (R11 pp.549, 551; R48a p.141). The 2023 edition is not in the collection (stated at `:1306`) | `w1s1-process-strip` | — | — | 250 + 0 |
| w1-ch05-03 | What Business or Mission Analysis hands over: problem, mission, goals, stakeholders | ¶5–6 (`:1311-1316`) | BMA purpose and outputs (R10 pp.543–546). ⚠ No formal definition of *mission*, *goal*, *objective* or *problem statement* | `w1s1-bma-snd` | — | Problem statement; MGO-001 and goals MGO-002/003/004/009 | 170 + 0 |
| w1-ch05-04 | Mission ↔ stakeholders ↔ needs: how they constrain each other | — (scattered: `session1.ts:1316`; needs trace to MGO, `aerolinkCase.ts` `mgo` field) | ⚠ as above; integrated set reflects mission, goals, measures (R11 p.554) | — | **Mission–need–stakeholder map**: select an MGO to see the AeroLink needs that serve it and the stakeholders behind them, or select a stakeholder to see its needs and goals. Text equivalent: the needs table grouped by MGO | 17 needs by MGO; STK-011 with none (deliberate gap) | 0 + 300 (gap G4/G5) |

- **Errors:** "The life cycle is a waterfall" (`session1.ts:553`); "15288 tells us exactly what to do in Week 1" (`:588`); "Stakeholder identification starts after the mission is fixed and never revisits it" (`:636`).
- **Later:** MGO → Week 2/3 objectives and measures (`learn/week01.ts:781`); every NEED traces to an MGO.
- **Check:** none from the existing bank (B1.6 is a proposed objective). A new item could be written later; flagged, not proposed for Dec 1.

### Chapter 6. Identifying and classifying stakeholders (`w1-ch06`) — topic 5

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch06-01 | Who counts as a stakeholder | `s1-lesson-stakeholders` ¶1–2 (`session1.ts:1365-1370`) | Stakeholder ×4 (R39a p.1631: 15288:2015, 29148 draft, 26702, Freeman) | `w1s1-stakeholder-scope` | — | "Passengers with reduced mobility" as a class; weather vs utility | 210 + 0 |
| w1-ch06-02 | Why find them all, and early | ¶3 (`:1374`) | R11 p.552; R98 p.1001; R53 p.297 | `w1s1-why-stakeholders-first`, `w1s1-missing-stakeholder` | — | The driving question (`week1.ts:16-20`) | 110 + 0 |
| w1-ch06-03 | Three identification methods | Method 1–3 paragraphs (`:1380-1395`) | Life-cycle sweep (R11 p.552); role classes (R65 p.322; R63 p.235; R99 pp.51–52); snowballing (R63 p.235) | `w1s1-lifecycle-sweep`, `w1s1-context-roles` | — | Sweep finds most at Concept; context finds owners of EXT; role class finds insurers and advocates | 400 + 0 |
| w1-ch06-04 | Approving authorities | ¶ (`:1401`) | R11 p.553 | `w1s1-approving-authorities` (`w1s1-approval-gates`) | — | FAA, city planning authority; ANSP an open classification | 120 + 0 |
| w1-ch06-05 | Classifying stakeholders: the register | `s1-lesson-classifying` ¶1–2 (`:1413-1417`) **merged with** `s2-l-concerns` "The register as an instrument" (`session2.ts:893`) | Register (R11 p.553); ranking (R10 p.545); stakeholder management (R63 p.234); course role groups (course convention, labelled) | `w1s1-classifying` (`w1s1-influence-maps`) | — | — | 330 + 0 (merge removes ≈120 duplicated words) |
| w1-ch06-06 | Checking the list: which method finds whom | ¶ "Answering the driving question" + coverage rules + `coverageTable` (`session1.ts:1423-1428`, `:41-48`) | Course counting rules (labelled) | `w1s1-answer` (`w1s1-method-venn`) | **Method coverage explorer**: toggle M1/M2/M3 and see which of the 15 stakeholders each method finds; the single-method finds are highlighted. Text equivalent: `coverageTable` | Answer C; single-method stakeholders | 350 + 0 |
| w1-ch06-07 | Worked example: the AeroLink context and register | `s2-l-case-register`: FICTIONAL callout, `caseContext`, `contextTable`, `registerTable`, `ratingsTable` (`session2.ts:1010-1016`) | — | `w1s2-register` (`w1s2-relationship-map`) | — | Full register STK-001…015 | 1,100 + 0 |

- **Errors:** "Stakeholders are the people who use, buy or build the system" (`session1.ts:154`); "Everything in the context diagram is a stakeholder" (`:833`); "Stakeholders who oppose the project should be left out of the register" (`:872`); "The sweep starts where the system operates" (`:910`); "The customer who signs the contract is the only approving authority" (`:990`); "A stakeholder with low influence can be dropped" (`:1026`); "The power/interest grid is a standard SE tool from the readings" (`:1030`); "One good method is enough if applied carefully" (`:1077`).
- **Later:** STK → Week 8 `part def` used as a stakeholder (`learn/week01.ts:785`). The register is re-evaluated periodically (R11 p.553), and Week 8 imports it.
- **Check:** **c4** (who is not a stakeholder, `learn/week01.ts:265`) after 6.1; **w1q-6** (approving authority) after 6.4; **w1q-7**/**w1q-8** go to Review readiness.

### Chapter 7. Concerns, interests and relationships (`w1-ch07`) — topic 6

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch07-01 | Concerns: the hinge between stakeholders and needs | `s2-l-concerns` ¶1–4 + ¶"A concern is not yet a need" (`session2.ts:886-891`) | Concern (SysML v2, R77 p.115); 26702 wording (R39a p.1631); SEBoK gives no definition (R04 p.275). 42010 is not in the collection, so the working meaning is a labelled course convention | `w1s2-concerns-def` (`w1s2-concern-ladder`) | — | "Communities: noise" vs CON-012 | 330 + 0 |
| w1-ch07-02 | Interest, influence and support | `s2-l-concerns` ¶ "Two maps" (`session2.ts:894`); `ratingsTable` explanation (`:1017`) | MITRE influence × support and "high influencers must be committed advocates" (R63 pp.236–237); the interest × influence plot is a course convention. ⚠ No definition of *interest* as distinct from *concern* | `w1s2-warmup-reveal` (`w1s2-influence-support`) | — | Seven high-influence stakeholders below commitment (`:1017`) | 180 + 120 (gap G7) |
| w1-ch07-03 | Relationships between stakeholders, and recording conflict | ¶ relationships (`session2.ts:896`); `relationshipTable` (`:1020`); conflict-recording rule from `s2-l-conflict` ¶2 (`:970`) | Relationship types: course convention (`labBrief.ts:69`). ⚠ None of the seven types is defined for students | `w1s2-register` (`w1s2-relationship-map`) | **Stakeholder ecosystem map**: filter by relationship type; REL-002 (conflict) highlighted; selecting a node lists its concerns. Text equivalent: the relationship table | REL-001…008; REL-002 noise vs throughput | 260 + 200 |
| w1-ch07-04 | Worked example: AeroLink's concerns | `concernTable` (`session2.ts:1018`) | — | — | — | CON-001…017 | 450 + 0 |

- **Errors:** "The electric grid is a stakeholder because AeroLink depends on it" (`session2.ts:162`); "Low support means the stakeholder is an opponent to be overcome" (`:188`); "A concern and a need are the same thing in different words" (`:227`); "SEBoK gives a formal definition of concern" (`:228`); "A conflict between stakeholders is a problem to remove from the record" (`:258`).
- **Later:** CON → Week 8 `concern` with subject and stakeholder; REL → connection or dependency, settled in Week 8 (`learn/week01.ts:786-787`). Conflicts feed the Week 3 trade study (`CONFLICT.protocol`, `aerolinkCase.ts:348-353`).
- **Check:** **c5** (specific concern, `learn/week01.ts:325`) after 7.1.

### Chapter 8. Eliciting needs (`w1-ch08`) — topic 7

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch08-01 | Elicitation as a method choice | `s2-l-elicitation` ¶1–2 + `elicitationTable` (`session2.ts:953-956`) | Elicitation is described (R11 p.553; R65 p.324), not defined: a description, not a glossary definition | `w1s2-elicitation` (`w1s2-elicitation-matrix`) | — | — | 420 + 0 |
| w1-ch08-02 | Interviews and surrogates | ¶ (`:957`) | R63 pp.235–236; R53 p.296 | — | — | — | 80 + 0 |
| w1-ch08-03 | What to ask, and finding the real need | ¶¶ (`:959-961`) | R11 p.553 ("providing rationale often reveals the real need"); R65 p.322; R53 p.296 | `w1s2-real-need` (`w1s2-why-ladder`) | — | Sound barriers → rest not disrupted → NEED-003 | 240 + 0 |
| w1-ch08-04 | Worked example: an elicitation plan for AeroLink | `ELICITATION_PLAN` (`aerolinkCase.ts:375-381`), not yet rendered in the lesson | Course convention (instructor reasoning) | — | — | Five stakeholders, technique and reason | 120 + 60 |

- **Errors:** "The dot ratings are from the literature" (`session2.ts:499`); "The agreed limit is the residents’ need" (`:526`).
- **Later:** rationale field of every NEED; Week 2 scenarios expose missed needs (NEED-011 example, `session2.ts:1083`).
- **Check:** **w1q-9** (rationale reveals the real need, `quizWeek1.ts:116-125`) after 8.3.

### Chapter 9. Needs, requirements and proposed solutions (`w1-ch09`) — topic 8

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch09-01 | Two perspectives: need and requirement | `s2-l-needs-reqs` ¶1–3 (`session2.ts:904-907`) | Needs vs requirements (R11 p.549; R13 p.558, black box vs white box, coffee maker); stakeholder needs (R39a p.1632, quoting 15288:2023, which is not in the collection); system requirement (R39l p.1652); stakeholder requirements (R39a p.1632; R11 p.551) | `w1s2-needs-vs-reqs` (`w1s2-need-vs-requirement`) | — | — | 300 + 0 |
| w1-ch09-02 | The transformation is analysis, not rewording | ¶4–5 (`:909-911`) | R13 pp.557–559 | `w1s2-transformation` (`w1s2-one-need-many`) | — | NEED-010 → several possible requirements | 220 + 0 |
| w1-ch09-03 | The integrated set of needs, and why it is kept | `s2-l-integrated-set` (`:919-924`) | Integrated set (R11 pp.549–552, 554–555); verification against requirements (R23a p.634); requirement verification vs validation (R13 p.566); cost of skimping (R48a p.141) | `w1s2-integrated-set`, `w1s2-why-keep` (`w1s2-validation-v`) | — | Noise agreement as a constraint; battery fire → NEED-006; weather scenario → NEED-011 | 410 + 0 |
| w1-ch09-04 | Well-formed needs: three layers of quality, and the course gate | `s2-l-well-formed` ¶1–5 + callouts (`:933-941`) | Statement form (R11 p.555); MITRE's six attributes (R53 pp.295–297); set test (R11 p.551, 554); singular (R23a p.635); INCOSE NRM not in collection (stated, `:941`) | `w1s2-well-formed` (`w1s2-need-attributes`) | — | Utility need in the recommended form; NEED-012/016 split | 650 + 0 |
| w1-ch09-05 | Proposed solutions, design words and the level problem | ¶6–7 (`:943-945`); errors row "A solution masquerading as a need" | R11 p.555 (coffee-maker colours); R13 p.558 (level); R53 p.296 | `w1s2-anatomy` (`w1s2-need-anatomy`) | — | NEED-003 anatomy | 250 + 0 |
| w1-ch09-06 | Conflict, priority and adjudication | `s2-l-conflict` (`:969-978`) + `priorityTable` | R10 p.546; R11 pp.551–553; R65 p.325 (categories; course definitions, `labBrief.ts:35-40`); R48a p.142 | `w1s2-conflict` (`w1s2-adjudication`) | — | REL-002: NEED-001/004 vs NEED-003; `SECOND_TENSION` | 710 + 0 |
| w1-ch09-07 | Worked example: from concern to need in six steps, and the reference set | `s2-l-case-needs` (`:1029-1046`) | Procedure is the instructor's, on R11 pp.553–555 and R53 p.296 | `w1s2-worked-steps` (`w1s2-draft-to-need`), `w1s2-worked-needs` (`w1s2-needs-catalog`) | — | CON-011 → NEED-010; NEED-001…017 | 1,430 + 0 |
| w1-ch09-08 | Common errors and their corrections | `s2-l-errors` table (`:987-1001`) | Basis column as footnotes (no R-codes in the cell text) | `w1s2-errors` (`w1s2-weak-register`) | — | — | 200 + 0 |

- **Errors (in addition to 9.8):** "Requirement = need + ‘shall’" (`session2.ts:363`); "‘Stakeholder requirement’ and ‘stakeholder need’ mean the same thing" (`:297`); "Consistent means no stakeholder disagrees" (`:330`); "Verification and validation are two names for testing" (`:395`); "If a need clears the six course checks, it is well formed" (`:436`); "Needs are qualitative; numbers belong only in requirements" (`:437`); "A need not written ‘The [stakeholders] need the [system] to …’ is invalid" (`:438`); "Any word that sounds technical makes a need solution-laden" (`:471`); "When two needs conflict, keep the higher-priority one and delete the other" (`:558`); "Priority is high, medium or low" (`:560`); "Every need should be mandatory to be safe" (`:677`).
- **Later:** NEED → Week 2 requirements traced by NEED id (R13 pp.557–559); Week 8/9 `requirement def` with `frame` of concerns (course working mapping, `learn/week01.ts:788`).
- **Check:** **c6** (need vs requirement, `learn/week01.ts:400`) after 9.2; **c7** (requirement disguised as need, `:468`) or **w1q-10** after 9.5. Place one; the other goes to Review readiness.

### Chapter 10. Traceability foundations and the road to Week 8 (`w1-ch10`) — topic 9

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch10-01 | Identifiers are engineering data | `s1-lesson-why` ¶2 second half (`session1.ts:1169`); `s2-l-bridge` ¶2 last sentence (`session2.ts:1084`) | ⚠ No sourced definition of *traceability* or *trace*. The only nearby source is "traceable" among requirement characteristics (R23a p.635, cited at `session2.ts:431`) | — | — | — | 120 + 150 (gap G6) |
| w1-ch10-02 | The Week 1 trace chain: enterprise → mission → stakeholder → concern → need | — (fields exist: NEED `sources`, `concerns`, `goal`; relations listed in §14) | ⚠ as above. The §14 relations ("stakeholder has concern", "concern motivates need", "need supports objective", "stakeholder influences stakeholder", "conflicting concerns", "artifact has documented rationale") are course conventions; label them, with no SysML semantics claimed | `w1s2-trace-lanes` | **Progressive trace**: step through ENT-001 → MGO-001 → STK-010 → CON-011 → NEED-010, then the dashed Week 2 REQ and Week 8 concern. No animation by default; under reduced motion the steps appear at once. Text equivalent: the existing alt (`session2.ts:1090`) as an ordered list | STK-010 → CON-011 → NEED-010 | 0 + 300 |
| w1-ch10-03 | Auditing the set: coverage and conflict | `s2-l-case-audit` (`session2.ts:1054-1060`) | R11 pp.551–552; R53 p.297 | `w1s2-worked-audit` (`w1s2-coverage-matrix`) | — | `DELIBERATE_GAP` STK-011; second tension | 480 + 0 |
| w1-ch10-04 | Why each method, and what it feeds | `s2-l-why-methods` (`:1068-1071`), table from `methods.ts` | Per row (R11, R96, R63) | `w1s2-why-methods` (`w1s2-methods-why`) | — | — | 180 + 0 |
| w1-ch10-05 | Toward Week 2 and Week 8 | `s2-l-bridge` (`:1083-1084`); `MODEL_INPUTS` rows, summarised (`learn/week01.ts:776-790`) | Operational concept (R39g p.1579); ConOps (R52 p.298); SysML v2 stakeholder and concern (R77 pp.115–116) | `w1s2-trace-lanes` | — | NEED-011 found by a scenario | 185 + 150 |

- **Errors:** "A complete audit means every stakeholder has a need" (`session2.ts:709`); "The coverage matrix proves the needs are good" (`:710`); "Week 1 artifacts are graded once and then forgotten" (`:738`); "The audit can be done the night before the deadline" (`:857`).
- **Later:** this chapter *is* the "later use" map. My Project's Week 8 preview (`project/pages/ModelPreview.tsx`) is the live counterpart and is linked, not duplicated.
- **Check:** none new. Review & Submit runs the audit on the team's own data.

### Chapter 11. Forming the team and choosing the enterprise (`w1-ch11`) — topic 10

| Id | Section | Reuse | Defs | Figures | Interactive | AeroLink | Words |
|---|---|---|---|---|---|---|---|
| w1-ch11-01 | What makes a team, and what an IPT is | `s1-lesson-teams` ¶1–3 + definition block (`session1.ts:1327-1332`) | Team (R39k p.1662, paraphrased); SE team (R97 p.994); IPT (R99 p.52); IPT practice (R95 p.761; R96 pp.987–988) | `w1s1-team-ipt` (`w1s1-ipt-structure`) | — | — | 260 + 0 |
| w1-ch11-02 | Roles and communication paths | ¶ roles + equation + ¶ paths (`:1338-1343`) | Organizing by specialization or subsystem (R96 p.986); P = N(N − 1)/2 (R96 p.988, after Brooks); "What are we missing?" (R96 p.989); the four lead roles are a course convention from the syllabus | `w1s1-team-roles-paths` (`w1s1-comm-paths`) | — | — | 250 + 0 |
| w1-ch11-03 | The charter, norms and how teams develop | ¶¶ charter (`:1349-1354`) | Charter (R96 p.986); norms (R97 p.995); Tuckman and Forsyth (R97 p.995); cohesion indicators (R96 p.990); decision rules and prefix ownership are course conventions | `w1s1-team-charter` (`w1s1-charter-tuckman`) | — | Example charter (fictional team JS/AK/RM/TL, `learn/week01.ts:34-43`). Fix "AK owns ENT and EXT" so that it includes PRT and REL per `labBrief.ts:64-66` | 190 + 60 |
| w1-ch11-04 | Choosing your team's enterprise | Criteria from `s1-lesson-why` ¶3 (`session1.ts:1174`) and `learn/week01.ts:111` | ⚠ Suitability criteria are a course convention with no source. Label them as such | `w1s2-lab-pitch` (`w1s2-pitch-card`) | — | Why AeroLink itself is not available | 120 + 350 (gap G3: a worked good and weak proposal, scope of enterprise vs SoI, what instructor approval means and its three states, §12) |
| w1-ch11-05 | What you will produce this week | `s2-l-lab` ¶1 (`session2.ts:1100`), shortened; the rest moves to My Project | — | `w1s2-lab-brief` (`w1s2-record-parts`) | — | — | 80 + 40 |

- **Errors:** "An IPT is a team of systems engineers" (`session1.ts:687`); "Adding people speeds the work in proportion" (`:740`); "Conflict means the team is failing" (`:786`); "The candidate enterprise must be final by Session 2" (`:1129`); "Our team gets on well, so we do not need decision rules" (`session2.ts:801`).
- **Later:** the charter's prefix owners → contribution tracking (§6.5); enterprise approval → My Project state pending / approved / revision requested (§12).
- **Check:** **c1** (missing decision rule, `learn/week01.ts:65`) after 11.3; **w1q-5** (best enterprise proposal) after 11.4; **w1q-1** goes to Review readiness.

### Back matter

| Id | Section | Reuse | Words |
|---|---|---|---|
| w1-refs | References and credits | `referencesSection` (`session2.ts:1113-1126`), rendered without register ids in the visible text | 474 |
| w1-glossary | Glossary | `keyTerms` from `learn/week01.ts` l1–l7 (≈30 terms with sources), reconciled with the lesson's definitions (fix "ENT (system of interest)") | ≈900 (reused) |
| w1-summary | Week 1 in one page; concept map | `SUMMARY.recap`, `ConceptMap` (`EngineeringFigures.tsx:221`), remapped to `w1-ch*` ids | ≈150 |

**Knowledge-check budget:** 12 checks inside Learn (c1, c2, c4, c5, c6, w1q-2, w1q-3, w1q-5, w1q-6, w1q-9, plus one of c3/w1q-4 and one of
c7/w1q-10), spread over 9 of the 11 chapters. At most one or two per chapter, each after the instruction (proposal §5: "selective knowledge checks after instruction, not in place
of it"). The remaining items (w1q-1, w1q-7, w1q-8, and the unplaced one of each pair) form the Review & Submit readiness quiz. Every check keeps
its reasoned explanation. The hard-coded slide numbers in explanations (`quizWeek1.ts`, 11 occurrences) become Learn section links.

---

## 3. AeroLink introduced early (§10.1): what is real and what is a teaching assumption

All AeroLink values come from `aerolinkCase.ts`. The case header states "Every number, name, rating and statement here is a teaching value,
not a real-world claim" (`:10-11`). Audit of how each kind of fact is presented to students today:

| Fact | Source | Shown to students as | Status / required action |
|---|---|---|---|
| The company AeroLink Urban Mobility and its partners | `ENTERPRISE` `:56-61` | "a fictional company" (`session1.ts:1174`), "FICTIONAL" (`welcome.ts:45`) | ✓ labelled |
| Air taxis (eVTOL), vertiports, urban air mobility | slide notes `session1.ts:237` | Only in faculty notes: "urban air mobility concepts propose short electric flights between purpose-built landing sites … No real program’s data is used" | **Add to 1.4**: the *class* of system is real and emerging; the operator, its numbers and its region are invented |
| 12 aircraft × 4 seats; 6 vertiports × 2 chargers; 16 h day; 25 km at 150 km/h; 20 min charge | `CASE_FACTS` `:79-87` | "teaching value" (`session1.ts:1174`); "(all FICTIONAL)" in a figure caption (`:217`) | ✓ labelled. Note the second source `DATA_SHEET` (`src/model/airtaxi.ts`) feeds `MEET_AEROLINK`; read from one source only |
| 06:00–22:00 clock times | `CASE_FACTS` `:82` | "(06:00–22:00, proposed clock times)" | ⚠ The internal state "proposed" is visible. Render as "teaching assumption" |
| 65 dBA pad-edge limit per event | `NOISE_AGREEMENT.perEvent` `:92` | "(local agreement)". In `s2-l-integrated-set` (`session2.ts:921`) it is stated as "the noise agreement (65 dBA at the pad edge …)" **with no fictional label in that section** | ⚠ Label it at first use in each chapter, or carry a persistent case badge in the context panel |
| Noise-sensitive hours and the event cap | `NOISE_AGREEMENT` `:93-94` | "(proposed)" | ⚠ as for the clock times |
| Problem statement "45–70 minutes by road at peak hours … 15–40 km" | `PROBLEM_STATEMENT` `:270` | The raw string ends "(FICTIONAL, proposed)" | ⚠ Mixed label: keep "fictional", drop "proposed" from the student text |
| Mission and goals MGO-001…009 | `MISSION_GOALS` `:262-268` | Inside the FICTIONAL case section | ✓ |
| Real authorities **FAA** (STK-002) and an air navigation service provider | `STAKEHOLDERS` `:169,174`; CON-004 "The FAA is concerned that…" (`:213`) | "(fictional roles, no real regulatory facts)" (`session1.ts:1401`), yet "the FAA approves the aircraft and the operation" reads as a real-world claim | ⚠ **Faculty decision** (audit A-2): (a) keep FAA, with an explicit note that a real regulator is named, its role is simplified, and nothing describes actual FAA requirements; or (b) use a generic "national aviation authority". Do not change it without approval (§5: accuracy over convenience) |
| Interest, influence and support ratings | `STAKEHOLDERS`; support "proposed" | "FICTIONAL" callout in the case section (`session2.ts:1010`); "proposed values" (`:1017`) | ✓ labelled. Avoid "proposed" in student text |
| Need priorities | `NEEDS[].priorityProvenance: 'proposed'` | "(mandatory, proposed)" (`session2.ts:1039`) | ⚠ as above |
| SOI-001 identifier | `SYSTEM_OF_INTEREST.idProvenance: 'proposed'` | "(proposed ID)" in the case context | ⚠ as above |
| Elicitation plan | `ELICITATION_PLAN` `:375` | Not rendered | Label it "instructor's reasoning" when rendered (8.4) |

**Content the §10.1 brief requires that is missing today:** a single place that states, in order, the enterprise type, problem, mission,
operational environment, stakeholders (overview), boundaries and the high-level operating concept (the material is spread across
`session1.ts:1174`, `MEET_AEROLINK`, `s2-l-case-register` and the figures); the real/fictional table above; and how students adapt the methods (one
paragraph exists, `MEET_AEROLINK.use`). Section 1.3–1.5 assemble these from the existing data.

---

## 4. Proposed interactive figures (only where they teach, §10.3)

| Id | Section | Teaches | Base | Text equivalent | Motion |
|---|---|---|---|---|---|
| IF-1 Boundary explorer | 4.1 | A boundary is fit for a question | `ThreeScopesFigure`, `BoundaryLayers` (`SystemFigures.tsx:161`), `BOUNDARY_ITEMS` | Three-row table (boundary / answers? / why) | None needed; state change only |
| IF-2 Control/influence rings | 4.5 | Control vs influence vs influences-us; owners of constraints | `ControlInfluenceFigure`, `ControlRings` | Three lists with owner stakeholders | None |
| IF-3 Principle explorer | 3.3 | Eight principles seen on one system | `PRINCIPLES`, `AerolinkNetworkFigure` | Eight-row table | Highlight only |
| IF-4 Mission–need–stakeholder map | 5.4 | Needs serve goals; stakeholders hold them; gaps are visible | `NEEDS`, `MISSION_GOALS`, `coverageMatrix()` | Needs grouped by MGO, with subject and sources | None |
| IF-5 Method coverage explorer | 6.6 | Methods are complementary; single-method finds need a second look | `MethodVennFigure`, `methodCoverage()` | `coverageTable` (exists) | None |
| IF-6 Stakeholder ecosystem map | 7.3 | Relationships and conflict; relationship types | `RelationshipMapFigure`, `RELATIONSHIPS` | Relationship table (exists) | Optional fade, respects `prefers-reduced-motion` |
| IF-7 Progressive trace | 10.2 | The ID chain and its later use | `TraceLanesFigure` | Ordered list (from the existing alt) | Step-through on demand; never autoplay |

Not proposed: classification drills, scoring and drag games. These belong to Guided Practice (§11), which already has them (missions 1–4).

---

## 5. Definitions: verified sources present, and gaps

All register entries cited below resolve with `verified: true` in `src/content/readings.generated.json` (checked 2026-10-21). "Verified" means
the title was found on the first page. The claim-level check was done by the reviewers (`_source_cache/review/week01_final_review.md`).

| Required term | Definition in the app | Register entry | Status |
|---|---|---|---|
| Systems engineering / success | `session1.ts:1190` | R01 p.51 (also p.52 quote, `week1.ts:66`) | ✓ |
| System (three definitions) | `session1.ts:1199` + table | R38 p.1637 | ✓ |
| Engineered system | `session1.ts:1209` | R01 p.51 | ✓ |
| Emergence | INCOSE Fellows wording inside R38 | R38 p.1637 | Partial ⚠ (no separate treatment) **Corrected 2026-10-21 (M4b):** the SEBoK glossary has its own entry, "Emergence (glossary)", PDF p.1491 (R39y), quoted in Learn 2.4. |
| **Systems thinking** | `welcome.ts:18` "course framing" | R02 pp.264–266, R50 pp.45–49 exist in the register, **not quoted** | ⚠ **No sourced definition** **Corrected 2026-10-21 (M4b):** defined in the SEBoK glossary, PDF p.1660 (R113), quoted in Learn 3.1. |
| Systems-thinking principles | `week1.ts:161-170` | R04 pp.273–275 | ✓ (off path today) |
| System of interest | `session1.ts:1221` | R39b p.1652 | ✓ |
| Enabling system | `session1.ts:1221` (paraphrase) | R39c p.1493 | ✓ |
| Enterprise / extended enterprise | `session1.ts:1231` | R39d p.1497; R07 pp.815–816 | ✓ |
| System boundary | `session1.ts:1253` | R39i p.1639 | ✓ |
| Environment / operational environment | `session1.ts:1253` | R39e p.1501 | ✓ |
| System context, four layers | `session1.ts:1253`, `:1270` | R39j p.1641; R92 pp.326–327 | ✓ |
| Life cycle, stages | `session1.ts:1291` | R39f p.1550; R06b p.384 | ✓ |
| **Mission, goal, objective, problem statement** | Only as BMA outputs, `session1.ts:1311` | R10 pp.543–544 (purpose and outputs) | ⚠ **No definition** (and the tool says "goals" where §12 says "objectives") **Corrected 2026-10-21 (M4b):** the SEBoK glossary defines mission at system level, PDF p.1565 (R39z); goals and objectives are described (not defined) in BMA p.543; problem statement remains undefined. |
| Stakeholder | `session1.ts:1365` | R39a p.1631 | ✓ |
| Approving authority | `session1.ts:1401` | R11 p.553 | ✓ (description) |
| Stakeholder register | `session1.ts:1413` | R11 p.553; R10 p.545 | ✓ |
| **Interest** (as distinct from concern) | Rating only | R63 p.234 mentions the interests groups represent | ⚠ **No definition** |
| Concern | `session2.ts:888` | R77 p.115 (SysML v2) | ✓ (42010 not in collection, stated) |
| **Relationship types** (regulates, funds, supplies, affected-by, partners-with, coordinates-with, conflicts-with) | `labBrief.ts:69-79` (verbs only) | — | ⚠ **No definition** (course convention) |
| Elicitation | `session2.ts:953` | R11 p.553; R65 p.324 | Description, not a definition |
| Stakeholder needs | `session2.ts:907` | R39a p.1632 (quoting 15288:2023) | ✓ (edition caveat stated) |
| System requirement | `session2.ts:907` | R39l p.1652 | ✓ |
| Integrated set of needs | `session2.ts:919` | R11 pp.549, 551 | ✓ |
| Verification / validation | `session2.ts:924` | R23a p.634; R13 p.566 | ✓ |
| Need priority categories | `labBrief.ts:35-40` | R65 p.325 (categories; definitions are the course's) | ✓ (labelled) |
| **Traceability / trace** | — | R23a p.635 lists "traceable" for requirements only | ⚠ **No definition** **Corrected 2026-10-21 (M4b):** defined in the SEBoK glossary, "Traceability (glossary)", PDF p.1666 (R112), quoted in Learn 10.1. |
| Team, SE team, IPT, charter, norms | `session1.ts:1327-1349` | R39k p.1662; R97 pp.994–995; R99 p.52; R96 p.986 | ✓ |
| **Enterprise suitability criteria** | `session1.ts:1174` | — | ⚠ Course convention (labelled as such in the source) |
| **Assumption, unknown** | — (Week 2 vocabulary, `project/model/vocabulary.ts:32-33`) | — | ⚠ **Absent from Week 1** |
| **Actor** (external actor, as opposed to external system) | Only in the dormant keyTerm "External system or actor (EXT)" (`learn/week01.ts:192`, source 'course'); not in the lesson | — | ⚠ **No sourced definition** (course convention, off the student path) |

---

## 6. Gap list (coverage thin or missing)

| # | Gap | Evidence | Proposed fill | New words |
|---|---|---|---|---|
| G1 | **Systems thinking is not taught on the Week 1 path** (§10 topic 2). No current lecture covers it (grep for "holism", "systems-thinking paradox" and "analysis and synthesis" across `lectures/*/` finds nothing) | `week1.ts:10-14` ("no longer part of Week 1") | Ch. 3 from `w1-paradox`, `w1-analysis-synthesis`, `PRINCIPLES`, plus a sourced definition (R02/R50, pending extraction) | 300 |
| G2 | **Introduction to engineered systems is thin for students with no prior knowledge**: definitions start at once, with no primer on elements, interactions, purpose, emergence or socio-technical systems | `s1-lesson-system` opens with the SEBoK definition | 2.1 (`w1-intuition`) + new 2.4 primer | 300 |
| G3 | **Team formation and enterprise selection**: the team theory is good (694 words), but enterprise selection is one paragraph and a callout. There is no worked example of a good or weak proposal, no guidance on scoping the enterprise vs the SoI for one's own team, and no explanation of the approval states | `session1.ts:1174`; `learn/week01.ts:111` | 11.4 | 350 |
| G4 | **Mission, goals, objectives and problem statement are undefined**; the tool says "goals" while §12 says "objectives" | `session1.ts:1311`; `team.ts` `Proposal.goals`; directive §12 | 5.3 note + 5.4; a faculty decision on the term | 150 |
| G5 | **Mission ↔ stakeholders ↔ needs as a relationship** (§10 topic 4) has no section or figure of its own | Scattered: `:1316`, the `mgo` field | 5.4 + IF-4 | 150 |
| G6 | **Traceability foundations**: no definition, and no explanation of the §14 typed relations; today's REL types cover stakeholder–stakeholder only | `labBrief.ts:69`; `team.ts` NEED fields | 10.1–10.2 + IF-7 | 450 |
| G7 | **Interests vs concerns, and the relationship types**, are undefined | `labBrief.ts:69-79`; rating-only interest | 7.2–7.3 | 320 |
| G8 | **Operational environment** gets a single sentence for AeroLink | `session1.ts:1265` | 4.3 | 200 |
| G9 | **Assumptions and unknowns**, required as Week 1 data by §12, have no Learn text and no Week 1 field | `project/model/vocabulary.ts:32-33` (Week 2) | Faculty decision: a short subsection in 5.3, or defer to Week 2 | 0–150 |
| G10 | **AeroLink real-vs-fictional statement** is not in one place | §3 above | 1.4 | 200 |
| G11 | **Text equivalents for the 39 lesson figures** are missing (alt text only) | `Blocks.tsx:159-169` | Add `textEquivalent`, starting from each `alt` | (not prose) |
| G12 | AI usage statement: no explanation | `week01Lab.ts` only | Belongs in My Project guidance, not Learn | — |
| Known source gaps (already stated in the lesson) | 15288:2023 only via SEBoK fragments (`session1.ts:1306`); ISO/IEC/IEEE 42010 (`session2.ts:889`); INCOSE NRM/GtWR (`session2.ts:941`); power/interest grid (`session1.ts:1417`) | — | Keep the statements as they are | — |

---

## Layout

### L.1 Root cause of the unused right-hand space

The reader is a two-track grid whose second track takes **all** remaining width, while the article inside it is capped at a reading measure and
**pinned to the start of that track**. Nothing occupies the space after the article.

| Rule | File:line | Effect |
|---|---|---|
| `.lec-reader-wrap { display:grid; grid-template-columns: minmax(200px, 260px) minmax(0, 1fr); gap: 40px; padding: 28px 24px 64px; }` | `src/lectures/lectures.css:611-616` | Two tracks only (TOC + content). The wrapper has **no `max-width`** and no centring, so the `1fr` track grows with the viewport |
| `.lec-root { --lec-measure: 70ch; … font: 16px/1.6 var(--wb-body) }` | `lectures.css:24-30` | Measure set to 70ch, which is good for prose |
| `.lec-reader { min-width:0; max-width: var(--lec-measure); font-size: 17px; }` | `lectures.css:640-645` | The article is capped at 70ch of 17 px IBM Plex Sans (`workbench/theme.css:26`), about 700–720 px. **No `margin-inline:auto` / `justify-self`**, so it hugs the left edge of the `1fr` track |
| `.lec-lesson-sec > p, > div, > ol, > ul, > figure { margin: 0 0 16px }` | `lectures.css:665-671` | Tables and figures are children of the 70ch article, so wide content (the 8-column register, `s2-l-case-register`; coverage matrices; 16:9 figures) is squeezed to the same measure and **cannot use the free space** |
| `@media (max-width:900px) { .lec-reader-wrap { grid-template-columns: minmax(0,1fr) } .lec-toc { position: static } }` | `lectures.css:747-755` | On tablets the 22-item TOC becomes a block **above** the first paragraph |
| `<main className="lec-reader">` holds all 22 sections in one page | `LessonReader.tsx:121-139` | One scroll of 71,286 px at 1440 and 99,162 px on mobile (UI audit F9); no progress indicator |

Approximate geometry at 1440 px: 24 px padding + 260 px TOC + 40 px gap leaves a `1fr` track of ≈1,092 px; the article uses ≈710 px; **≈380 px
stay empty on the right** (≈860 px at 1920 px). The lesson also renders in the lecture chrome (`lectures/Chrome.tsx`), not the week shell, so
the Week 1 navigation changes on entering it (UI audit F3).

### L.2 Proposed reading grid

Design goals: a comfortable measure (65–75ch), every pixel of width given a job, no stretched paragraphs (proposal §5), one product feel with the
other stages (§17), and keyboard and reduced-motion support.

**Desktop (≥ 1200 px): three tracks inside a centred container**

```
| chapter nav 240px | main column 68ch (≈680–720px) | context rail 300–340px |
   sticky                 prose, figures, checks           sticky
container max-width ≈ 1,360px, margin-inline auto; column gap 40–48px
wide figures and tables: "breakout" across main + rail (grid-column: main / rail-end)
```

| Element | Behaviour |
|---|---|
| Chapter navigation (left, sticky) | Chapters 1–11 with their sections nested under the current chapter only; the current section is marked (`aria-current="location"`); a read or unread tick per section (student progress store, §7, never only `localStorage`) |
| Main column | Body at 17–18 px, measure 68ch; `h2` for chapters, `h3` for sections, ids = content ids; previous/next chapter at the foot. One chapter per route (`/week/1/learn/:chapter[/:section]`) to end the 71,000 px scroll |
| Context rail (right, sticky, scrolls independently) | Three stacked cards that follow the section in view: **Definitions here** (glossary terms used in the section, each with its source); **AeroLink at a glance** (the case facts needed for the current example, with a persistent "fictional teaching case" badge); **Used later** (the Week 2 / Week 8 artifact this section feeds, from `MODEL_INPUTS`) and **Practise this** (a link to the matching Guided Practice task) |
| Source footnotes | Inline superscript markers, never R-codes in prose. On desktop the note text appears as a side-note in the rail aligned with the marker; a full list sits at the section end (with backlinks); the register id stays only in the link target |
| Figures | Figure number, caption, "Show text description" (`<details>` holding the text equivalent), and "Expand" opening a full-viewport dialog (focus-trapped, `Esc` closes). Wide figures and tables break out across main + rail |
| Knowledge checks | A distinct, quiet block after the instruction, collapsed by default, labelled "Check your understanding (optional)". Never between a definition and its explanation |
| Progress | A thin reading-progress bar under the week bar (chapter scope) plus "Chapter n of 11" in the nav. Resume position is offered on return |

**Tablet (768–1199 px): main column + drawers**

| Element | Behaviour |
|---|---|
| Container | One centred main column at 68ch, side padding 24–32 px |
| Chapter navigation | A "Contents" button in a sticky chapter header opens a left drawer; the current chapter title and progress bar stay visible |
| Context rail | A "Reference" button opens a right slide-over with the same three cards. Key definitions also appear as inline "Definition" boxes at first use, which removes any dependency on the panel |
| Footnotes | At the section end, with backlinks; the marker opens a popover on tap |
| Figures and tables | Full main-column width; Expand to full screen; wide tables scroll inside their own container with a sticky first column |

**Mobile (< 768 px): single column**

| Element | Behaviour |
|---|---|
| Container | 16 px side gutters, 17 px body, line height 1.6; no horizontal page scroll (the current app already passes this, UI audit F8) |
| Header | Compact sticky bar: chapter title, progress bar, "Contents" (bottom sheet) and "Reference" (bottom sheet). The week bar collapses to a select (UI audit F8) |
| Figures | Tap to expand; the text description sits directly below in `<details>` |
| Tables | The register-type tables offer "View as list" (one card per row) as well as horizontal scroll |
| Checks and footnotes | As on tablet |

**Cross-cutting**
- The reader sits **inside the Week 1 shell** (`week1/WeekShell.tsx`), not the lecture chrome, so the five-stage navigation is constant.
- Tokens come from the existing `lec-light` / workbench theme, keeping the ≥4.5:1 contrast the axe scans check (`lectures.css:1-3`).
- Motion: interactive figures change state without animation by default; any transition is ≤200 ms and disabled under
  `prefers-reduced-motion: reduce`.
- Print: keep the current print rules (`lectures.css` print block) and print the text equivalents.
- Implementation note for later milestones (not done here): the change is confined to `lectures.css:610-718`, `LessonReader.tsx` and a new
  context-rail component, but the same CSS serves the Weeks 2–6 and 8 lessons. Scope it under a Week 1 class first, or accept the change for all weeks
  after review.
