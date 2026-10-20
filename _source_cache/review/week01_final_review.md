# Week 1 final review (faculty conditional approval, DECISION_LOG A21)

Date 2026-10-19. Scope: exactly the six faculty concerns listed in A21. No open-ended cosmetic revision was made. Nothing is
committed. `readings.py` and the evidence tables were not edited.

## 1. Need-priority terminology: DONE

**Decision: MITRE's four categories, mandatory / critical / desirable / optional.** This is the vocabulary the lecture
already cited, and the source text supports it. R65 p.325 says "There may be differences of opinion about which ones are
mandatory, critical, desirable, or optional. It is up to the SE to define each priority …". The same page uses
"high, medium, or low" only as example values for a *different* attribute, business value. So high/medium/low has no
source basis as a priority scale. MITRE wrote this for requirements; the course applies it to needs, and that is labeled
as a course convention.

What was applied:

- **Single source.** `labBrief.ts` now holds `NEED_PRIORITIES`, `NEED_PRIORITY_LABEL`, `NEED_PRIORITY_DEFINITION` and `LEGACY_PRIORITY`. `aerolinkCase.ts` re-exports them as `PRIORITY_LABEL` and `PRIORITY_DEFINITION`. The tool (`team.ts`: `Priority`, `PRIORITIES`, `PRIORITY_LABEL`, `readPriority`) reads the same values.
- **Tool and exports.** TeamView now shows a "Priority (MITRE category)" select, with each definition as a tooltip. The missing-priority message names the four categories. The Markdown export prints the label; the JSON export carries the category.
- **Old data still loads.** Stored records and old exports that use high/medium/low load through `readPriority`: high → critical, medium → desirable, low → optional. "Mandatory" is never inferred, because only an authority, an agreement or safety can impose it. This was tested by importing a version-3 file that has legacy values.
- **Fixture.** `teamFixture.ts` now uses all four categories.
- **Text.** Updated in the lab (`week01Lab.ts`, and the regenerated `WEEK1_LAB_INSTRUCTIONS.md`), the Team Record parts and template (`learn/week01.ts`), the week page (`weeks/week01.ts`), the missions, and the lecture (s2-conflict notes, a new misconception "Priority is high, medium or low", the lesson's conflict section, s2-lab-brief).
- **Quiz.** No quiz item uses a priority scale. A test now guards that.
- **Agreement test.** `labBrief.test.ts` has a new block, "need priority: one vocabulary …". It checks labBrief = case = tool, the case needs, the slide and lesson naming all four categories with R65 p.325, and the fixture, Markdown and JSON exports. It checks that legacy imports map, that the lab and Team Record have no high/medium/low, and the quiz. It includes a negative-direction check.

## 2. Valid need statements accepted regardless of pattern: DONE

**Source basis.** R11 p.555 says: "It is recommended that need statements use a different format from requirements, such as:
'The stakeholders need the system to' (INCOSE GtWR 2023)". The format is a recommendation, given as an example. The
hard rule on that page is no "shall".

**Gate redesign** (`needQuality.ts`). A need is now rejected only for a real defect. Each gate has its own id:

| Gate | Rejects |
|---|---|
| `structure` | empty / not a sentence (fewer than 4 words); no outcome or capability (in other phrasings, the outcome is counted up to the condition, without the stakeholder or system names) |
| `subject` | no registered stakeholder identifiable as the party in need (the subject before "need(s)"; in passive / "so that" / "There is a need for …" phrasings, a registered stakeholder named in the statement); the team's own enterprise or SoI as the party in need |
| `requirement` | "shall" anywhere (other requirement words stay warnings) |
| `solution` | the thing asked for IS a named solution ("need a mobile app", "need drones", "a need for a new tracking platform") |
| `unique` | duplicate ID |

- **Advice.** A valid need that is not in the recommended form passes with a `form` note. The note recommends "The [stakeholders] need the [system] to …" and says why: it keeps the outside view and names the system the need is validated against. Advice never blocks and needs no justification. It is shown as "Note:" in both need views.
- **System-name check moved to advice.** "[system] is not your system of interest" was a warning; it is now a `system` note. "Need the power drawn at each vertiport to stay within …" parses like the form but states an outcome. Under the old rule, a missions test failure was passing for the wrong reason (an unjustified 'system' warning, not a real defect).
- **Lexicon.** Added "controller"/"device" with a "smart" prefix to the design list, so the lecture's own draft ("smart grid controller") is caught.
- **Critique exercise.** The flaw "Not in the need form" was relabeled "Not a valid need (rejected, not just phrased differently)". It is now keyed by *any hard gate*, not by pattern. The c1–c5 keys are unchanged: each has a real defect. c6 stays acceptable.
- **Tests in both directions** (`needQuality.test.ts`):
  - 9 valid alternatives are accepted with advice only and count without justification, including the faculty's example "Hospital dispatchers need blood units delivered within 30 minutes of a request", "<stakeholder> needs …", passive, "is needed by", "so that", and "There is a need for … to reach hospitals".
  - The recommended form passes with no advice.
  - The pre-A21 rejections are pinned as regressions.
  - Defective needs are rejected *by the gate that names the defect*: not a sentence; no outcome ("Hospitals need MedFly within 30 minutes"); no stakeholder; unregistered party; SoI as party; "shall" in any phrasing; solution as the need. A design word inside an outcome stays a warning.
  - Also updated: `team.test.ts`, `missions.test.ts` (the outcome-form fail case was replaced by a real defect, a solution), `learn/week01.test.ts`, and e2e `workbench.spec.ts`.
- **Teaching text.**
  - s2-well-formed: the slide face says "recommended … another phrasing passes". The notes now cite R11 "such as" and explain why the course recommends the form. A new misconception was added.
  - The lesson's Layer 1 says "The form is a recommendation, not a gate", with the faculty's example.
  - Updated elsewhere: the minimum-gate callout, the gate label (now "stated as a need, not a requirement"), SELF_CHECK, TeamView help, the lab, the Team Record, the week page, the missions, and Examples.tsx.
  - "SEBoK form" was changed to "the recommended form" throughout.
- **Quiz.** w1q-10 was reworded: no option is wrong merely for pattern. Option (b) is wrong because "shall" makes it a requirement. The key is still validated against the tool.

## 3. Source check: DONE (claim table in §7)

Two independent read-only passes, one per session, opened every cited page in `_source_cache/` (register
`readings.generated.json`):

- Session 1: no NOT SUPPORTED claims, no UNCHECKABLE claims, 16 PARTLY. All 16 were fixed.
- Session 2, `aerolinkCase.ts` and `needQuality.ts`: 1 NOT SUPPORTED and about 30 PARTLY. All were fixed except two minor rows, noted in the table.
- Every quotation matches its source word for word. Every page is inside its register range.

## 4. Why each method: DONE

- New single source `src/content/lectures/week01/methods.ts`. It covers seven methods: enterprise proposal; problem, mission and goals; team charter; stakeholder identification; classification and salience; needs elicitation; need statements. Each has a sourced "why", a "feeds" column (course design: Week 2 ConOps, scenarios and requirements; Week 8 model inputs), and one sentence a professor can say aloud.
- **On a slide.** New slide **s2-why-methods** (S2 slide 18, 2 min) with a new figure, `w1s2-methods-why` (registered in the Week 1 block of `registry.ts`).
- **On each method's slide.** The faculty notes now contain the same sentence through `sayWhy()`. The slides are s1-course-architecture, s1-bma-feeds-snd, s1-team-charter, s1-lifecycle-sweep, s1-classifying, s2-elicitation and s2-well-formed. Their timing strings were updated.
- **In the lesson.** New section "Why each method, and what it feeds" (S2), plus a pointer paragraph in the S1 lesson.
- **Timing.** s2-worked-steps went from 6 to 5 min (it still meets the at-least-5 rule), and the S2 buffer went from 6 to 5. The session is 70 + 5 = 75.
- **Test.** In `labBrief.test.ts`: every method's slide notes contain its sentence, the lesson table has seven rows, and each sentence names Week 2 or Week 8.
- **Lesson size.** Lesson words are kept within the stated workload (about 13,400 words, 1.4 h). The week total is unchanged at 8.0 h or less.

## 5. Live teachability, readability and timing: DONE, with one residual risk

**Timing.** S1 is 69 min + 6 min buffer = 75. S2 is 70 min + 5 min buffer = 75. Every slide's spoken notes are at most 130 wpm (`timing.test.ts`). Every slide has a transition, every figure is explained in `notes.figure` (validator), and the new teach lines are covered by the density test.

**Rendering.** Both decks were rendered to PNG with PowerPoint (COM export), and every text box was probed for overflow (text bound height against box height):

- **Title slide overflow (fixed).** On S1 slide 1, the two-line 44 pt title overflowed its 1.3 in box into the subtitle. The title box in `scripts/build-lectures.mjs` is now y 1.8, h 1.6, and the kicker and subtitle moved with it. After the fix: no overflow on any slide of either deck.
- **Clipping (fixed).** The new methods figure clipped its right column. The columns were re-split and the labels shortened.
- **Body text.** Bullets are 20 pt (sub-bullets 17), steps 19, definitions 22, tables 16, captions and sources 10.5–11. On these decks no column is shrunk to the 72 % floor (visual check).

**Figure label size on projection.** Measured from each figure's SVG font sizes and its placement box:

| Range | Figures |
|---|---|
| min ≥ 11 pt | life-cycle, need-vs-requirement, elicitation-matrix, seven-days, methods-why (median 13.2) |
| 9–11 pt (most) | split-layout figures (860 or 700 units wide on about 7 in) |
| below 9 pt | w1s1-lifecycle-sweep 7.8 pt; w1s2-need-anatomy 8.3 pt; w1s2-draft-to-need 8.6 pt; w1s2-influence-support, integrated-set, adjudication, weak-register 8.7–8.8 pt (min) |

- **Fixed.** The sweep matrix, the 6-minute core slide, was re-set: wider viewBox, rows 28→31, labels 15→18 units. Its labels are now about 9.3 pt (estimated).
- **Residual risk, not fixed.** The other figure labels of 8–11 pt are readable on a classroom projector from the front half of the room but small at the back. The full fix is to redraw the split-layout figures at a larger type scale, or to give figures more width, which affects about 30 figures and the Week 2 template. That is outside "no open-ended cosmetic revision", so it is left as a recommendation for faculty. In class, the web viewer's figure view can be used to zoom.

## 6. AeroLink propagation: DONE

- **Plan:** `learning-studio/docs/lectures/AEROLINK_CANONICAL_DATA.md`. `aerolinkCase.ts` is the course source for STK, CON, NEED and MGO. It covers rules for later weeks, a table of the downstream ids that change with the week that changes each, and the scope of the check.
- **Check:** `learning-studio/src/content/lectures/week01/aerolinkCanonical.test.ts` (vitest). It fails when any of these cites a STK, CON or NEED id not in the case: a later-week reference element or link, a week module, a later-week lecture, or a SysML reference file (REQ-STK ids are not misread). It also fails when a name, need statement, need trace, noise dimension or ENT/EXT name differs, unless the difference is in `PRE_REVISION` with its fixing week. It fails as well if a listed exception no longer differs, so the list cannot go stale.
- **Allowlist (30 entries):**

| Exception | Fix in |
|---|---|
| STK-015, CON-017 missing; CON-015 name | Week 8 |
| NEED-001..011 statements; NEED-003 name; NEED-008 trace; NEED-012..017 missing; CAP-007 and REQ-STK-002 lacking the event-cap dimension | Week 2 |
| MGO-006, MOE-003, TPM-002 | Week 3 |
| ENT-001 and EXT-001/002/004/006 names (reference week01, week08 interface ends, SysML v01..v04) | Week 8 |

- Later-week content was not rewritten.

## 7. Claim table

Verdict key: SUPPORTED / PARTLY / NOT SUPPORTED / UNCHECKABLE (source not held). No claim was UNCHECKABLE.

### Session 1: rows that were not SUPPORTED (all fixed)

| Slide / section | Claim | Citation | Verdict | Fix applied |
|---|---|---|---|---|
| s1-lesson-system | 15 principles "developed by the Systems Engineering Principles Action Team" | R91 p.130 | PARTLY (full name on p.127, outside the range) | "developed by INCOSE's SEPAT" |
| s1-lesson-boundary | systemic resolution "is an ongoing process of attention and adaptation" | R02 p.264 | PARTLY (SEBoK says this of systems thinking) | reworded to "systems thinking requires an ongoing process …" |
| s1-team-charter (notes), s1-lesson-teams | SEBoK notes groups progress "recursively and iteratively" | R97 p.995 | PARTLY (SEBoK reports Forsyth) | "others (Forsyth) have observed …" |
| s1-approving-authorities (notes), lesson | "in regulated domains there are usually several" | R11 p.553 | PARTLY (overstated) | "there can be approving authorities both inside and outside …, especially for highly regulated systems" (quiz w1q-6 explanation aligned) |
| s1-approving-authorities (misconception) | "the customer … is the approving authority" corrected by "cannot be assumed" | R11 p.553 | PARTLY | claim reworded to "the *only* approving authority" |
| s1-team-roles-paths, lesson | three-person merge rule "from the syllabus" | course | PARTLY (convention presented as sourced) | "(instructor's rule)" / "(instructor's rule, not in the syllabus)" |
| s1-lesson-teams, s1-team-roles-paths | "SEBoK justifies the threshold by the 7 ± 2 rule" | R96 p.988 | PARTLY (logic reversed) | "SEBoK grounds this advice in …" / "SEBoK invokes the 'well-known' 7 ± 2 rule" |
| s1-team-ipt, lesson | "on a large program, an IPT owns each SBS element" | R96 pp.987–988 | PARTLY | "in a product-centered organization …" |
| s1-lesson-lifecycle | "The mapping is direct" | R11 p.552 | PARTLY (instructor's mapping) | "In the instructor's mapping …" |
| s1-answer (notes) | "the sweep is the most thorough, as SEBoK predicts" | R11 p.552 | PARTLY | "the sweep finds the most, consistent with … 'a thorough source'"; transition and purpose wording aligned |
| s1-classifying (misconception) | "low-influence stakeholders still hold needs" | R11 p.552 | PARTLY | "SEBoK requires all relevant stakeholders to be identified and included" |
| s1-se-purpose, definitions table | 15288 definition "as the glossary records it" | R38 p.1637 | PARTLY (SEBoK's expanded version) | "in the expanded form …" / "as expanded by SEBoK" |
| s1-soi-enabling (slide) | enabling system "need not contribute to operation" | R39c p.1493 | PARTLY | "need not contribute directly to its function in operation" |
| s1-15288-processes, lesson | "the 2023 edition is not in the collection" | uncited | PARTLY (fragments are quoted at R39a p.1632) | "SEBoK quotes only fragments of it (R39a p.1632)" |

### Session 1: SUPPORTED rows (grouped)

- **s1-se-purpose.** R01 p.51 (SE definition; "successful systems"); R38 p.1637 (definition; recognized definition; elements); R91 p.130 (15 principles; consensus; principles 1, 2 and 7).
- **s1-soi-enabling.** R39b p.1652 (both SoI definitions; may include enabling systems); R39c p.1493 (paraphrase; examples).
- **s1-enterprise.** R39d p.1497 (definition; preferred); R07 pp.815–816 ("a frequent misuse"; extended enterprise; "sidestream").
- **s1-three-scopes.** R50 pp.46–47 (synthesis; UAV example); R02 p.264.
- **s1-context-structure.** R39i p.1639 (boundary); R92 pp.326–327 (four layers; "what can be changed …"; NSoI and WSoI).
- **s1-boundary-decision.** R02 p.264 (Churchman); R50 p.48 (four questions).
- **s1-life-cycle-stages.** R39f p.1550; R06b p.384 (stages; gates; Concept goals; concurrency); R11 p.552 (Table 1 names).
- **s1-15288-processes.** R98 pp.1001–1002 (14 processes); R94 p.540 ("Both why and what …"); R11 pp.549, 551; R48a p.141.
- **s1-bma-feeds-snd.** R10 pp.543–546 (purpose; outputs; ranked register; conflicts; coffee maker; iteration); R11 pp.549, 552, 554.
- **s1-team-ipt.** R39k p.1662; R99 p.52 (IPT definition; single IPT; cyber IPT); R96 p.988 (SEIT, AIT).
- **s1-team-roles-paths.** R96 pp.986, 988–989 (organizing options; N(N−1)/2; thresholds; staffing example).
- **s1-team-charter.** R96 pp.986, 989–990 (charter quote; cohesion indicators; teamicide); R97 p.995 (norms; Tuckman).
- **s1-stakeholder-definitions.** R39a p.1631 (four definitions).
- **s1-why-stakeholders-first.** R11 p.552 ("primary source …"; failed validation); R98 p.1001 ("unwilling"; access, language, disability); R53 p.297.
- **s1-lifecycle-sweep.** R11 p.552 ("a thorough source"; Table 1 rows).
- **s1-context-and-roles.** R92 p.326; R11 p.552; R65 p.322; R63 p.235; R99 pp.51–52.
- **s1-classifying.** R11 p.553; R10 p.545; R63 pp.234, 236–237 ("High influencers must be committed advocates").
- **s1-answer.** R11 p.552; R65 p.322; R63 p.235.
- **s1-exit-ticket.** R11 pp.549–555.
- **Lesson sections.** As for their slides, plus: R01 p.51 (engineered system); R92 p.326 ("single most important principle"); R07 p.815 ("purposeful combination"); R04 p.274; R39e p.1501; R39j p.1641; R97 p.994; R95 p.761; R96 p.989 ("What are we missing?"); R63 p.234.

### Session 2, case and tool: rows that were not SUPPORTED

| Slide / section | Claim | Citation | Verdict | Fix applied |
|---|---|---|---|---|
| s2-lab-pitch (notes) | "if there is truly none, the enterprise may be too small" | R11 p.553 | **NOT SUPPORTED** | labeled "course heuristic; SEBoK requires approving authorities to be identified, R11 p.553" |
| s2-well-formed (notes, slide, figure), lesson Layer 1, aerolinkCase header, needQuality header and SELF_CHECK | SEBoK "recommends the distinct format" / the form presented as SEBoK's rule; "records each need with ID …" | R11 p.555 | PARTLY (SEBoK's format is an example, "such as"; the fields are Table 2's columns) | reworded throughout: a format different from requirements, "such as" …; recommended by the course, not required (concern 2) |
| needQuality SELF_CHECK 'attributed' | cite R11 p.555 | R11 p.555 | PARTLY | cite changed to pp.553, 555 |
| needQuality SELF_CHECK 'traced' | trace to a concern as SEBoK's | R11 p.553 | PARTLY | "(course convention, extending SEBoK's trace to the stakeholder register)" |
| s2-well-formed (notes) | "primarily tested on the set" | R11 p.554 | PARTLY | "SEBoK applies correctness, completeness and consistency to individual needs too" |
| s2-well-formed (notes, misconception), lesson | "MITRE asks for quantifiable metrics" | R53 p.296 | PARTLY ("Consider"; "defined and quantified" is on p.295) | "must be defined and quantified (p.295) … consider quantifiable metrics (p.296)" |
| s2-anatomy (notes, misconception), lesson | the level rule stated for "statements" or needs | R13 p.558 | PARTLY (the rule is for requirements) | "SEBoK requires requirements to suit the level …; the course applies the same logic to needs" |
| s2-transformation (slide, notes), lesson | "needs-to-requirements matrix" | R13 p.558 | PARTLY (source: "needs to transformation matrix") | SEBoK's term used |
| s2-l-integrated-set | scope sentence cited at p.555 | R11 p.555 | PARTLY (scope is on p.551) | "(R11 pp.551, 555)" |
| s2-l-concerns | "SEBoK recommends recording stakeholders in a register" | R11 p.553 | PARTLY (described as "an approach"; re-evaluation is the recommendation) | reworded |
| s2-needs-vs-reqs (example) | stakeholder requirement "not a substitute for understanding the need" | R11 p.551 | PARTLY | "an additional input to the analysis …; understanding the need behind it is the engineer's job (course emphasis)" |
| s2-warmup (notes) | the city approves sites, cited to R11 | R11 p.553 | PARTLY (case fact) | "which in the case approves vertiport sites, an approving authority in SEBoK's sense" |
| s2-warmup (notes, misconception), s2-l-errors row 2 | "systems are not stakeholders", cited to R39a | R39a p.1631 | PARTLY (inference) | "the definitions name individuals, teams and organizations" / "(inferred from the definitions)" |
| s2-warmup (slide Q3) | MITRE's map moves a kind "first" | R63 pp.236–237 | PARTLY | "Which stakeholders does MITRE's map say must be moved …" |
| s2-warmup-reveal (misconception) | "low support usually means low awareness …; for regulators evidence" | R63 pp.235–237 | PARTLY | split into MITRE's scale and response (pp.235–237) plus "the course adds" for regulators |
| s2-errors (misconception) | each error "leads to missing needs or failed validation" | R11 p.552 | PARTLY | "leaving out a stakeholder, for example, often results in …" |
| s2-lab-charter (misconception) | "rules matter under deadline pressure (R96 p.986)" | R96 p.986 | PARTLY | "(course convention; SEBoK says the team should have a charter, R96 p.986)" |
| s2-conflict (misconception) | "Keep both" attributed to MITRE and SEBoK | R65 p.325; R11 p.551 | PARTLY | "Keep both (course rule); MITRE: … reach agreement; set consistent" |
| s2-l-elicitation | "unstated political or economic motives" | R53 p.296 | PARTLY | "a preference driven by unstated or unrecognized aspects of the need, such as political or economic ones" |
| s2-concerns-def (misconception), s2-l-concerns | "our collection's only definition is SysML v2's" | R77 p.115 | PARTLY (the 2a spec also defines ConcernDefinition) | "the definitions in our collection come from SysML v2 …; the specification models a concern as a kind of requirement" |
| s2-worked-needs (notes), s2-l-case-needs | needs traced to MGO "(R11 p.554)" | R11 p.554 | PARTLY (explicit MGO trace on p.556) | "(R11 pp.554, 556)"; slide and lesson sources extended to 556 (inside R11's range 549–556) |
| s2-l-lab | cites R96 p.986 with no charter claim in the text | R96 p.986 | harmless | not changed |

### Session 2: SUPPORTED rows (grouped)

- **s2-warmup.** R11 p.553; R63 pp.236–237.
- **s2-warmup-reveal.** R63 p.237 (quote exact; scale p.236).
- **s2-concerns-def.** R39a p.1631; R04 p.275; R77 p.115 (quote exact).
- **s2-register.** R11 p.553; R63 p.234.
- **s2-needs-vs-reqs.** R11 p.549; R13 p.558 (coffee-maker pair); R39a p.1632; R39l p.1652; R11 p.551.
- **s2-integrated-set.** R11 pp.549–552, 554–555.
- **s2-transformation.** R13 pp.557–559 ("changing the subject of the need statement", exact).
- **s2-why-keep.** R11 pp.551, 555; R23a p.634; R13 p.566; R48a p.141.
- **s2-well-formed.** No "shall" (R11 p.555); six attributes (R53 p.296); set test (R11 p.551); requirement characteristics (R23a p.635).
- **s2-anatomy.** Table 2 features (R11 p.555).
- **s2-elicitation.** R11 p.553; R65 p.324; R63 pp.235–236.
- **s2-real-need.** R11 pp.553–554; R65 p.322; R53 p.296 (exact).
- **s2-conflict.** R10 p.546; R11 p.551; R65 p.325 (four categories, define, inappropriate, agreement, adjudication, escalation); R48a p.142.
- **s2-errors.** R11 pp.549, 551–553; R13 p.558; R53 p.296.
- **s2-worked-steps and s2-worked-audit.** R11 pp.551–555; R53 pp.296–297.
- **s2-lab-charter and s2-lab-pitch.** R96 p.986; R11 p.553 ("cannot be assumed … 'customer'").
- **Bridge.** R39g p.1579; R52 p.298; R77 pp.115–116.
- **aerolinkCase.ts.** Role groups and Table 1 prompts (R11 p.552); support scale (R63); role classes (R65 p.322; R63 p.235; R99 p.51); R92 p.327.
- **New s2-why-methods / methods.ts.** Each "why" paraphrases R11 p.552 (missed stakeholder), R11 p.553 (rationale reveals the real need), R11 p.554 (needs reflect MGOs), R11 pp.551, 555 (validation reference), R96 p.986 (charter) and R63 pp.236–237 (high influencers). The "feeds" column is labeled course design.

## 8. Register changes requested

None required. Every citation is inside its verified range.

Optional: R91 (SEBoK Principles) is registered 130–130, and the full name "Systems Engineering Principles Action Team" is on p.127, where the article begins. The lesson now says "INCOSE's SEPAT" and needs no change. Extend R91 to 127–130 only if you want the full name restored.

## 9. Gates (final run)

| Gate | Result |
|---|---|
| `npm run lectures:pptx` | OK. Week 1 S1 has 25 slides, S2 has 23; the Week 2 decks of the other stream were also written |
| `npm run lab:md` | OK, `WEEK1_LAB_INSTRUCTIONS.md` regenerated |
| `npm run build` | OK |
| `npm run build:student` | PASS |
| `npx tsc -b` | 0 errors |
| `npx oxlint src` | 0 errors (warnings only, pre-existing) |
| `npx vitest run` | 1247 passed, 5 failed: week03, week07 and week08 activity tests (timeouts under full parallel load; 29/29 pass when run alone) and the other stream's week11 RID writer. All Week 1, lecture, workbench and content tests pass |
| `npx playwright test` | 45 passed, 1 skipped. The Week 1 needs-writer test was updated for A21 and passes. Two failures in the full run (model workspace, lecture viewer week-nav) passed on rerun; they came from load and HMR while the other stream was editing |
| `npx playwright test -c playwright.lectures.config.ts` | 9 passed (axe in both themes on every slide of both decks) |

Screenshots changed outside week1-flow, week1-workbench, lectures and week1-demo were restored (5 root PNGs). The five
`screenshots/workbench/*` files were already modified by the other stream before this review and were left as they are;
the e2e run may have rewritten them.
