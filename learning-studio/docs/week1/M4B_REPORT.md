# Week 1 reconstruction, Milestone M4 part B: report

Date 2026-10-21. Scope: the 17 faculty-only gap placeholders of the Week 1 Learn textbook and the two remaining MUST
interactive figures IF-6 and IF-7 (directive §10, §14, §20; spec §d.9, §d.10; DECISION_LOG A23–A26). Nothing is committed.
Review status of all new prose: **new-pending-review** (the two-reviewer claim check of spec §d.10 rule 4 is outstanding).

## 1. What changed

| Area | Change |
|---|---|
| New prose | `src/week1/learn/authored.ts`: the 17 gap sections in the content block format, placed by reference from `textbook.ts` (`N(...)`, origin `authored.ts (M4b, <gap>)`). AeroLink facts are read from `week01/aerolinkCase.ts` (and, for the scenarios and the Week 2 discoveries, `week02/aerolinkCase.ts`; for 10.5, `MODEL_INPUTS`); counts and tables are computed. |
| Gap list | `gaps.ts` is empty (`GAPS_SOURCE = {}`); the mechanism stays. Every section has text, so the student edition shows all 58 sections and its numbers equal the canonical ones. |
| IF-6 | `StakeholderMap.tsx` in 7.3. |
| IF-7 | `ProgressiveTrace.tsx` in 10.2. The static figure `w1s2-trace-lanes` moved from 10.2 to 10.5 (Week 2/Week 8 lanes belong with "Toward Week 2 and Week 8"; it is still placed exactly once). |
| Shared figure parts | `ifigShared.tsx` (Expand dialog, readable-width frame, label wrap), `figures.css` (scoped `.w1l-*`; studio.css untouched). |
| References back matter | Now lists the readings cited by the new prose as well as the lessons' (`model.ts learnAsLecture()`, merged by the existing `lectureReferences`). |
| Register | 5 SEBoK glossary entries added through the pipeline (§3). |
| Shared files (minimal, delimited) | `src/content/content.test.ts` (readings count 145 → 150, commented); `scripts/check-student-build.mjs` (`week1-m4b` block: the gap-marker minimum applies only while the gap list is non-empty); `src/week1/week1.test.tsx` (workload pin, §5); `LearnReader.tsx`, `model.ts`, `textbook.ts` (interactive id `IF-1 | IF-6 | IF-7`). |

## 2. Gaps filled

Words = words the student now reads in the section (reused + new, tables included), from the rendered model. Citations are
PDF pages of the verified register. Every quotation was checked verbatim against the cited page in `_source_cache`
(scratchpad `quotes.py`: 35 of 35 found).

| Section | Gap | Words | Sources (PDF page) | Course-convention labels |
|---|---|---|---|---|
| 1.2 | course framing | 241 | — | course framing (no claim) |
| 1.3 | G10-partial, the case in one place | 492 | case data only: ENT-001, problem, MGO-001…009, SOI-001, SCN-001…005 (week02 `SCENARIOS`), EXT-001…006, 15 stakeholders by role group (computed) | all values fictional |
| 1.4 | G10 real vs fictional | 457 | case data; A25 FAA note kept first | table of 11 fact kinds; "teaching assumption" defined |
| 1.5 | adapting the methods | 143 | — | course framing |
| 2.4 | G2 primer | 449 | System element, SEBoK glossary p.1643 (R102); Concepts of Systems Thinking pp.268, 271 (R03); **Purpose** glossary p.1599 (R110, new); **Emergence** glossary p.1491 (R39y, new); System glossary p.1637 (R38) | — |
| 3.1 | G1 systems thinking | 398 | MITRE Systems Thinking pp.45 (two definitions, Senge / Bar-Yam), 46 (R50); SEBoK What is Systems Thinking? pp.264, 265, 266 (R02) | course's practical use stated as such; common-error callout |
| 4.3 | G8 operational environment | 457 | **Operational Environment** glossary p.1580 (R111, new); MITRE ConOps p.302 (R52); case EXT data | kind and constrained need = instructor's analysis (labelled) |
| 4.5 | owners of constraints | 184 | case data (EXT owners, `WIDER_SOI_OWNERS`) | "owner of a constraint" = course term |
| 5.3 | G9 assumptions and unknowns | 492 | Uncertainty glossary p.1668 (R39s); System Requirements Definition p.565 TBD/TBR (R13); A-008, U-001 from week02 `DISCOVERIES` | assumption and unknown definitions = course conventions (no source defines them); optional in Week 1 (A25) |
| 5.4 | G4/G5 mission ↔ stakeholders ↔ needs | 539 | **Mission** glossary p.1565 (R39z, new); BMA pp.543, 544–545 (R10); Stakeholder Needs Definition p.554 (R11) | course rule on untraced needs; needs-by-objective table (IF-4's text equivalent) computed |
| 7.2 | G7a interest vs concern | 224 | Stakeholder glossary p.1631 (R39a); MITRE p.234 (R63) | interest vs concern = course convention; interest required, influence/support optional (A25) |
| 7.3 | G7b seven relationship types | 428 | none exists: said so | all 7 definitions = course convention; then IF-6 |
| 8.4 | plan intro | 169 | (the existing plan table, instructor's reasoning) | instructor's reasoning |
| 10.1 | G6a identifiers | 196 | **Traceability** glossary p.1666 (R112, new); System Verification p.635 (R23a) | identifier rules = course conventions |
| 10.2 | G6b typed relations | 401 | System Requirements Definition p.565 (R13); BMA p.544 (R10) | the §14 relations = course conventions for engineering traceability, "no SysML semantics" stated; then IF-7 |
| 10.5 | model-input summary | 460 | `MODEL_INPUTS` rows (course working mapping) | course working mapping; links to My Project's Week 8 preview (CNT-13) |
| 11.4 | G3 choosing the enterprise | 499 | spec §f.2 states, A26 re-review fields | criteria = course convention with no source; worked good/weak proposals fictional |

Learn now totals **18,334 words** (was 13,311): about 5,000 new words including tables (IA estimate ≈3,400 prose). Not padded,
not cut; the excess over the estimate is mostly the data tables (1.4, 4.3, 5.4, 7.3, 10.2, 10.5, 11.4).

## 3. Register (pipeline only)

`_source_cache/verification/readings.py` (appended, original line endings kept) → `python -I verification/verify_readings.py`
(149/150 title-verified; R30 the declared exception) → `npm run content:readings` (150 entries). Added, each verified as an
entry heading line, approval **pending faculty confirmation**: R39y Emergence (p.1491), R39z Mission (p.1565), R110 Purpose
(p.1599), R111 Operational Environment (p.1580), R112 Traceability (p.1666).

**Contradictory evidence vs. the IA / gap notes (faculty to note):** the IA recorded "no definition" of *mission* and of
*traceability* in the collection and "emergence only in the INCOSE Fellows wording". The SEBoK glossary does define all
three. The text uses them, and handles mission carefully: the glossary meaning is a system's top-level function, while BMA
(R10 p.543) uses the enterprise sense the course needs. *Problem statement*, *assumption*, *unknown*, *interest* and the
relationship types remain undefined in the collection and are labelled course conventions.

## 4. Figures

| | IF-6 Stakeholder ecosystem map (7.3) | IF-7 Progressive trace (10.2) |
|---|---|---|
| Data | `STAKEHOLDERS`, `CONCERNS`, `RELATIONSHIPS`, `ROLE_GROUP_SHORT`, `REL_TYPES` | NEED-010's record: subject source STK-010/CON-011, objective MGO-004 → MGO-001, ENT-001 |
| Interaction | 15 nodes in 6 role groups (3 columns); 7 type chips (native checkboxes); REL-002 conflict highlighted by default; arrow keys / Home / End move between nodes (roving tabindex), Enter or Space selects; a native select as a second route; side list of concerns and relationships in words ("A — type — B"); numbered link badges keyed to a visible list | "Start over", "Step", "Show all"; **Show all is the default**; never autoplays; each step says the relation in §14 words with the course-convention label; dashed Week 2 / Week 8 links "future: not yet created" |
| Live region | "Showing n of 8 relationships. Conflict highlighted: REL-002. Selected …" | "Step k of 7. …" / "All 7 steps shown. …" |
| Text equivalent | relationship table + stakeholders with none (details; printed) | ordered list of the 7 steps (details; printed) |
| Motion | none under reduced motion; 150 ms opacity otherwise | reduced motion: Step reveals instantly; otherwise 150 ms fade of the new step |
| Labels | 16 units: inline 13.2 px at 1440; expanded 29.5 px (1440), 13.0 px (390) | 16 units: inline 13.2 px; expanded 29.5 / 13.0 px |
| Phones (<600 px) | drawing replaced by chips, select, side list and list; Expand shows the drawing at readable width | stacked ordered list of the steps shown; Expand shows the drawing |

Deviation (accuracy): the spec's outline ENT-001 → MGO-001 → STK-010 → CON-011 → NEED-010 skips the objective level;
NEED-010 serves MGO-004, so the walk includes "MGO-004 refines MGO-001". The ENT-001 → MGO-001 relation ("states the
mission") is not in the §14 list; it is labelled a course convention (the proposal records one mission).

## 5. Workload (A26) — superseded by §8 (8.5 h)

Computed from data: Learn 18,334 words at 150 wpm = 2.04 h (was 1.48 h); **required total 8.6 h** (A26 accepted 8.1 h;
A21 target 8.0 h). Nothing was cut. `week1.test.tsx` now pins the computed 8.6 h with a comment referencing A26;
`WEEK1_WORKLOAD_ACCEPTED` (8.1 h) is left as the recorded decision. **Faculty: A26 is reopened.** The faculty note in
`content/weeks/week01.ts` still cites 13,311 words / 8.1 h (not mine to edit; flagged).

## 6. Checks

- `npx tsc -b`: clean.
- Vitest `src/week1 src/content src/lectures src/pages`: 48 files, 845/845 (new `learn/m4b.test.tsx`, 14 tests: citations verified and in range, definitions quoted, conventions labelled, no SysML claim, "goal" only in quotations, tables equal the data, references list the new readings, figure placement, IF-6/IF-7 keyboard, live region, filters, Show-all default, text equivalents; `learn.test.tsx` numbering and gap tests updated).
- `npm run build:student` + leak check: **PASS** (58 student sections, 198 footnotes, no R/S codes, no placeholder; placeholder markers still probed present in `dist/`; 20 student surfaces scanned clean).
- Playwright (lock "m4b", taken and released; Chrome, fresh context per shot, reduced motion) against http://127.0.0.1:5173/: 49 screenshots in `SysML-audit-screenshots-2026-10-21/m4b/` (every filled section at 1440 and 390; IF-6 default / keyboard-selected / filtered / expanded; IF-7 show-all / step 3 / expanded, each at 1440 and 390) + `m4b-proof.json`: 0 horizontal overflow, axe WCAG 2.2 AA clean on both figures and on chapters 1, 5, 7, 10, 11 at both widths, no page errors. A separate student-mode preview was not needed (the instructor edition now has no gap boxes; the leak check renders the student edition).
- Repo e2e: not run (week1-flow.spec.ts covers Learn progress and checks, not the new sections; run it at integration).

## 8. Review dispositions (M4b fix, 2026-10-21)

Review: `_source_cache/review/week1_m4b_review.md` (PASS WITH CONDITIONS). Nothing is committed. Where this section
changes §2–§6 (3.1 sources, 4.3/4.4 order, workload), this section applies.

| ID | Disposition | What changed |
|---|---|---|
| F1 Major | Fixed | Register R113 "Systems Thinking (glossary)", PDF p.1660, added through the pipeline (verifier 150/151; export 151; count test updated with a comment; approval pending faculty). 3.1 now quotes the Checkland and Senge (3) definitions verbatim and paraphrases the entry's discussion; "SEBoK gives no definition" is gone; SEBoK's article perspectives are kept as extension reading. IA records corrected (`docs/week1/WEEK1_TEXTBOOK_IA.md`: systems thinking, emergence, mission, traceability rows). |
| F2 | Fixed | The repeated stage-environments sentence is removed; the section points to 4.2. Retitled "The operational environment" (id `ch04-03` unchanged). |
| F3 | Fixed | Display order swapped: `ch04-04` Four layers shows as 4.3, `ch04-03` as 4.4 (ids stable; test asserts the swap). Cross-references updated (1.3 → 4.3 for the layers and 4.4 for the environment). |
| F4 | Fixed | 7.2: an **interest** is what is at stake (content, as the quoted sources use it); a concern is a specific topic for the system to address; the register's **level of interest** (1–5, with reason) is the rating. Still labelled course convention. |
| F5 | Fixed | "Is affected by" = "B's decisions or actions influence A." IF-6 draws its arrowhead at A (`markerStart`), and a legend says arrows show the direction of influence and plain lines are mutual. Test asserts the marker. |
| F6 | Fixed in Learn; data owner informed | 10.5 renders the stakeholder row as "ID, name, classification, level of interest with a reason (required); influence and support (optional)". `MODEL_INPUTS` itself (`content/learn/week01.ts`, not M4b's) still says "classification, influence": **for the data owner**. |
| F7 | Fixed | 10.5 closing paragraph no longer says needs "become" requirements (and no longer repeats the bridge paragraph). |
| F8 | Fixed | "Objective **elaborates** mission (a course addition, after SEBoK's 'elaborated')" in the 10.2 table and in IF-7; no "refines" remains. |
| F9 | Fixed | "often used where …" (MITRE p.46 wording). |
| F10 | Left (faculty choice) | MITRE p.533 not added; the 5.3 claim keeps its "for this use" qualifier. |
| F11 | Fixed | 1.4 row reads "Sourced definitions, methods and quotations — Real … Course conventions are labelled as such where they appear." |
| F12 | Fixed | 2.4 purpose sentence and 5.4's restatements trimmed to back-references to 2.3 and 5.3. |
| F13 | Addressed | The 5.3 subsection is now an "Extension reading (optional, not counted)" box with its own heading, visible in the section; the title is unchanged (the A25 "objectives" test keys on it). |
| F14 | Fixed | IF-7 moves focus to "Start over" when "Step"/"Show all" disable themselves; IF-6's expanded drawing is keyboard-operable (roving tabindex in the dialog too). |
| F15 | Fixed | 1.3 glosses "wider system of interest" with a pointer to 4.3; 2.4 cites sections 9.4–9.5. |
| F16 | Corrected | The check covers **23 source-attributed quotations** (the review's 21 plus the two new R113 quotations), all verbatim on the cited page, plus 17 checks of paraphrase anchors (40 checks, 0 missing). The 6 other quotations are case data or worked examples. |
| F17 | Open (not M4b's file) | `content/weeks/week01.ts` faculty note still cites 13,311 words / 8.1 h. |
| F18 | None needed | — |
| missions.test | Passes now | `src/content/missions/missions.test.ts` passes in the final run (the M5 stream reconciled the practice row). No Learn-related row needed changing. |

**Extension reading (faculty decision 2026-10-21, "mark some sections optional").** Review packages A–C applied as
blocks labelled "Extension reading (optional, not counted)" in both editions; content kept, ids and numbering unchanged:
A = 5.3 assumptions and unknowns, 10.5 model-input summary, 2.4 "two aspects of emergence" paragraph, 3.1 SEBoK-article
perspectives paragraph; B = the 4.4 (id `ch04-03`) environment table with its lead sentence; C = the 11.4 good/weak proposal
table with its follow-up paragraph. One deviation: in 2.4 the AeroLink waiting-time example of emergence stays required
(only the discussion sentences moved to the extension), because it is the section's worked example. Nothing else was made
optional. Mechanism: `Part.optional` → `RBlock.optional` → grouped box in `LearnReader`; `words.ts learnWords()` counts
required words only (`learnWordsAll`, `learnWordsOptional` for audit).

**Workload after the fix (computed).** Learn 18,521 words in all; **required 17,309** (1,212 in extension reading) =
1.923 h; other rows 6.6 h; **total 8.52 h, shown 8.5 h** (A26 accepted 8.1 h; A21 target 8.0 h). `week1.test.tsx` pins the
computed 8.5 h with a comment citing A26 and the 2026-10-21 decision. The Overview's "Learn: about N words" now states the
required words.

**Checks (fix).** `npx tsc -b` clean; Vitest `src/week1 src/content`: 46 files, 856/856 (incl. new disposition tests in
`learn/m4b.test.tsx`); `npm run build:student` + leak check PASS (58 sections, 199 footnotes, 20 surfaces clean); quotation
check 40/40. Spot screenshots (lock "m4b", released) in `SysML-audit-screenshots-2026-10-21/m4b/fix/`: 3.1, 5.3 extension
box, 4.4, IF-6 legend at 1440 (and 3.1, 5.3 at 390); axe clean, no overflow; the ch04 nav reads 4.1 … 4.3 Four layers, 4.4
The operational environment.

## 7. Open faculty items

1. Claim check: the M4b review counts as one reviewer for the source claims; a second is outstanding (§d.10 rule 4).
2. Approve register additions R39y, R39z, R110, R111, R112, R113.
3. Workload 8.5 h (after extension reading, §8) vs A26's 8.1 h.
4. IF-7 walk includes MGO-004 and the course-convention "states the mission" relation (§4).
5. 4.4's (id `ch04-03`, extension table) "kind" and "need it constrains" columns and 7.3's seven type definitions are instructor analysis / course conventions to confirm.
6. 11.4 worked proposals (fictional hospital-logistics enterprise) and the approval wording (re-review fields per A26).
7. Placement: the elicitation plan table stays in 8.4; the static trace-lanes figure moved to 10.5.
8. MODEL_INPUTS stakeholder row (data owner, F6) and the `weeks/week01.ts` faculty note (F17).
