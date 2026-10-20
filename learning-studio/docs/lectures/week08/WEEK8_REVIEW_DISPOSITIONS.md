# Week 8 review dispositions

Review: `_source_cache/review/week08_review.md` (2026-10-19, verdict REVISE: 0 blocker, 2 major, 6 moderate, 9 minor).
Fixes made on 2026-10-19 against commit 4616406. Nothing committed. Status values: **fixed**, **fixed in part**, **deferred** (with the reason).
A checker PASS is reported below only as what it is: the file parsed, every name resolved and no validation rule fired. It is never offered as evidence that a model says what it should; the direction and fidelity claims below rest on tests that read the model text, and on the specification.

## Summary

| # | Status | One line |
|---|---|---|
| M1 | fixed | One direction rule course-wide: `from` = the dependent element (client), `to` = what it depends on (supplier), R80 pp.50–51. Generator, AeroLink model, fixture, stress file and the instructor reference model (`#affects`, `#flowsTo`) corrected; rule on the slide with its source; tests per relationship type. |
| M2 | fixed | Student install-and-run guide at `#/week/8/lab/checker` (also a section of the lab instructions), Windows/macOS/Linux, run end to end on Windows; live demo slide in Session 1; installation is a team task inside the lab hours; personal install optional; workload 8.0 h; every "Week 7 pre-Phase-II" claim removed. Faculty decision item FD-W8-1. |
| m1 | fixed | ref part answered in instance terms; model deletion kept apart (R80 pp.49, 64). |
| m2 | fixed | Package is Kernel (R70 sl.4; KerML 7.4.14 named in the notes, register entry requested); Q3 key and distractors rewritten. |
| m3 | fixed | Writing check (2 min, pairs) added; redefinition and the worked network marked as previews practised in Week 9; classification cut to two tokens; four slides shortened. |
| m4 | fixed | Fidelity kept for every team; a team of three audits fidelity on a sample (every stakeholder and five concerns). |
| m5 | fixed | Task 5 gives both recorded outputs (seeded; defects 1–2 fixed → PASS), so the answer is unambiguous; key rationale corrected; task 3 drops the metadata definition; 45 min. |
| m6 | fixed | Generator name plan: register names can no longer hide a package or a definition; each adaptation is a `name-shadow` gap; probe names PASS. |
| n1–n9 | fixed (n8: mitigated) | See the minor table. |

## Major

### M1: fixed

**Convention (stated once, `labBrief.ts` `REL_KEYWORDS`, `dependencyEnds`).** `dependency from A to B`: A is the client and depends on B, the supplier; "a change to a supplier element may result in a change to a client element" (R80 p.50; example `dependency Use from 'Application Layer' to 'Service Layer'`, p.51). Every course keyword names the client's relation to the supplier and reads "from-element keyword to-element".

| Week 1 type | Keyword | from | to |
|---|---|---|---|
| regulates, funds, supplies | `#regulatedBy`, `#fundedBy`, `#suppliedBy` | register target (the dependent) | register source |
| affected-by | `#affectedBy` | register source | register target |
| partners-with, coordinates-with, conflicts-with | `#partnersWith`, `#coordinatesWith`, `#conflictsWith` | register order kept; symmetric, the direction carries no meaning (said in each metadata definition's doc) | |

- **Generator** (`skeleton.ts`): ends from `dependencyEnds`; each metadata definition's doc says which end is the client (or that the type is symmetric); a reversed relationship's doc keeps the register sentence ("Register: STK-002 regulates STK-011; modeled from the dependent: STK-011 is regulated by STK-002."); the file header states the rule.
- **AeroLink model** (regenerated): `#regulatedBy … REL-001 from 'STK-011' to 'STK-002'`, `#suppliedBy … REL-003 from 'STK-005' to 'STK-010'`, `#fundedBy … REL-004 from 'STK-011' to 'STK-003'`; REL-007 `#affectedBy` unchanged. Fixture and stress files regenerated the same way.
- **Reference model** (`sysml/reference/aerolink_v01..v04`): the review found the generator's inversion; the same audit of the reference found two more inverted tags. `#affects` (13 in v0.4) and `#flowsTo` (7) are rewritten from the dependent as `#affectedBy … from Y to X` and `#receivesFrom … from Y to X` (names `'X affects Y'` kept, so text search still finds each baseline link); metadata definitions renamed and documented; header and README §3.3 state the rule (README §10 third batch). derives-from, refines, satisfies, measures and mitigates already ran from the dependent and are unchanged.
- **Slide** `w8s2-worked-stakeholders`: a "Direction rule" callout on the face with the source (SysML v2.1 Beta 2, Part 1, 7.3; the slide's sources list R80 pp.50–51); teach notes explain it with REL-001 and the symmetric types, and an example note says why it matters for the Week 12–13 impact traversal. **Lesson** paragraph rewritten the same way. **Lab method** step "Stakeholder relationships" and the Stakeholders-package evidence state it; the applied-exercise rubric note accepts either direction for the symmetric conflict only. **Outline** carries a revision note.
- **Tests.** `skeleton.test.ts` "dependency direction …": for each of the seven Week 1 types, the generated `from`/`to`, the keyword, `dependencyEnds`, and the metadata definition's wording; the AeroLink lines; no `#regulates/#funds/#supplies` left. `sysmlMapping.test.ts` "every course dependency runs from the dependent element …": every dependency in v0.1–v0.4 checked against its link type (all seven types seen), the inverted tags absent; "negative direction": an inverted `#affectedBy` is not accepted as the link. The 381-link realisation test now requires the corrected direction.

### M2: fixed (faculty decision item FD-W8-1)

**Decision recorded for faculty confirmation (FD-W8-1).** Per DECISION_LOG A13 (the in-app workbench is the required environment; real tools optional) and A21 decision 8 (SysML v2 foundations and tool navigation in Week 8), resolved inside Week 8:
1. The in-app lab tool is the required environment for writing model v0.1.
2. Validity is decided by the course checker, which cannot run in the browser, so **each team** needs one working installation by Session 2: the team's checker owner (normally the AI & Data Management lead) installs it from the guide. This is a team task of 0.9 person-hour inside the lab hours.
3. A personal installation is optional (about 1 h, not counted). The tool proof may be run on any working installation (own, team's, lab machine).
4. The lab machines are the fallback. **Faculty/IT must confirm that lab machines with the checker exist**; the course materials assume it, as the original package did.
5. The checker kit (course script, launcher, tool-proof files) is distributed from the app page itself (download buttons fed from the repository files, so no copy can drift).
There is no Week 7 task; none was created (Week 7 is another owner's scope).

**What was built.**
- `src/content/lab/week08Checker.ts` (single source) → page `src/week8/Checker.tsx` at `#/week/8/lab/checker` (Laboratory tab highlighted; alias `/week/8/checker`), linked from the week page (Lab entry "Install the checker"), the Laboratory page (top button and a section), the Session 1 exit slide, the demo slide and the lesson; and the section "Install and run the course checker" of `WEEK8_LAB_INSTRUCTIONS.md` (via `labMarkdown`).
- Content: who must install and why; what the checker is and what a PASS means; prerequisites (Python 3.9+, ~500 MB, no admin, terminal; its own portable JDK); the folder layout `check_sysml.py` expects (tools two levels above the script, so no environment variable is needed); six steps with commands for Windows (PowerShell, `curl.exe`, `Get-FileHash`, Python `zipfile`), macOS (Contents/Home move, `shasum`) and Linux (`sha256sum`); published SHA-256 for the Windows JDK and kernel (as in `SYSML_TOOLCHAIN.md` provenance) and for the four macOS/Linux JDK archives (read from the publisher's `.sha256.txt` files, 2026-10-19); a verification step (the two tool-proof files, expected PASS then FAIL at 9:12); the recorded output, formatted from `week08-report.json` exactly as `print_results` prints it; how to read each line; 11 troubleshooting entries; the fallback; an honest test note.
- **Tested end to end on Windows 11 (2026-10-19)** in a fresh folder on a short drive (subst over the scratchpad): both downloads, both checksums matched, unpack, `java -version` 21.0.12.1, launcher compile, and the tool proof: `PASS (expected PASS: OK)`, `FAIL (expected FAIL: OK)` with `ERROR 9:12 mismatched input '-' expecting '>'`, exit 0. The first attempt, on a long path, exposed a real failure mode: Python's unzip stopped part-way on a Windows path over 260 characters, **and the checker still started and reported PASS on the part-unpacked library**. The guide's unpack command therefore prints the entry count, the step note and a troubleshooting row say a Traceback means the library is incomplete and must be redone at a short path. macOS and Linux commands were not run (no machine); all download URLs were checked to resolve, and the guide says they are untested.
- **Session 1 live demonstration** `w8s1-checker-demo` (3 min, after predict-the-checker): the command, the PASS line, the FAIL line and one diagnostic read aloud, the install guide; new figure `w8s1-checker-run` (terminal with callouts, text from the report). Notes give a fallback if the laptop cannot run it.
- **Workload honest at 8.0 h** (team of four): proof row 0.3 → 0.2 (run only); lab team hours stay 8.0 with a new row "course checker installation by the checker owner" 0.9 and "checker runs" 0.7, paid for by matrix 1.5 → 1.2 (the tool fills the rows), skeleton 1.0 → 0.7 (generated), Context 0.8 → 0.6, Stakeholders 2.0 → 1.9; exercise 0.6 → 0.8 (m5). Lesson stays 0.8 h (7,558 words; words were trimmed to keep it there). Total 8.0 h; graduate 8.0 h (memo 0.8 replaces exercise 0.8). Team of three: 6.0 person-hours, 2.0 each; tasks "as for a team of four" now carry the same hours as for four.
- **"Week 7 pre-Phase-II" removed everywhere**: `week8Path.ts` workload row and summary, `session1.ts` notes, generated lab instructions, outline (§5.7, §11 item 1 superseded), milestone report §8 item 2. `week08Checker.test.ts` asserts the guide and lab instructions contain no such claim (and that the check can fail). The deliverables table adds "One working course-checker installation for the team"; the lab procedure starts with "Checker installation" (between the sessions).

## Moderate

### m1: fixed
`session2.ts` teach line and lesson: "a context does not create or destroy the system: if a context instance ends, the system goes on (referential, R80 p.64). In the model, Physical owns soi whether or not this usage is ref; deleting the context element deletes only what the context owns (R80 p.49)." A new misconception row ("ref protects an element from deletion") corrects the confusion. Slide and lesson sources now R80 pp.48–49.

### m2: fixed
Four-layers slide bullets ("Root … elements, namespaces, imports"; "Kernel … the package lives here"), teach notes (Root list per R70 sl.4; the package listed under Kernel on sl.4; KerML 7.4.14 named in the instructor notes; a note on the deck's own "(e.g., packaging)" caption on sl.3), figure words (Kernel shows "package") and alt text, lesson ("A namespace (Root) … A package (Kernel) …"). Q3: key "Root: elements, relationships, namespaces, imports" with a corrected explanation; distractor b is now "Kernel: classes, behaviors, packages"; every option lists several items (n6); cite narrowed to R70 sl.4. KerML 7.4.14 is not cited as a register entry (register change requested below).

### m3: fixed (no restructuring)
- New slide `w8s1-write-check` (2 min, pairs, on paper): a bakery with two to four ovens (composite) and a supplier (ref), capacity typed Natural. Model answer checked: `sysml/lectures/week08/writing_check_bakery.sysml` PASS, no message.
- Redefinition (3 → 2 min) and the worked network marked "preview: practised in Week 9" on the slide/notes; the network's classification step cut to two tokens (the lesson keeps all five for self-study).
- Notation, benefits-and-costs and units shortened 3 → 2 min (notes stay ≤ 130 wpm). Session 1: 70 min of content on 26 slides + 5 min buffer (the template's 5–7 range); Session 2 unchanged (69 + 6).

### m4: fixed
`LAB8_PERSON_HOURS_THREE` audit row: "all four questions; fidelity checked on a sample: every stakeholder and five concerns; every gap dispositioned" (0.7 h); the 0.3 h saved elsewhere (matrix 0.8, skeleton 0.5, Stakeholders 1.1 with ratings in doc, integration 0.4). Lab parts table and week-page summary say fidelity is audited by every team.

### m5: fixed
- Assessment page task 5: (a) find, explain and fix; (b) read the recorded output of the seeded fragment and separate direct errors from cascades; (c) read the recorded output of the same fragment with defects 1 and 2 fixed and defect 3 kept (new file `exercise_microgrid_defects12_fixed.sysml`, PASS, no message) and explain why nothing is reported. Both outputs are rendered from the report, so no student needs a local install for the exercise.
- Key (`sysml/instructor/week08/exercise_microgrid_key.sysml`): defect 1 rationale is now "visibility is always shown on an import (R70 sl.6; R80 p.61); the import is owned by package CampusMicrogrid, so the root-namespace rule does not apply"; a line-by-line reading of all nine seeded errors (which come from which defect); task 3 full credit for a plain dependency with a comment; time split.
- Task 3 no longer asks for a metadata definition; the brief is 45 min (`EXERCISE_MINUTES`, single source for the page, the week row, the deliverables and the Session 2 close notes).

### m6: fixed
`namePlan()` in `skeleton.ts`: generated usage names never equal a definition name they refer to in the same scope (ext and inside elements, the system-of-interest reference); the `context` and `soi` usages are renamed when a register name takes them; a stakeholder or concern named "Context", or an enterprise or external system named "Physical", makes the generator qualify that reference from the root package; the concern's stakeholder parameters never repeat `enterprise`. Each adaptation is a `name-shadow` gap finding with an explanation. The probe showed the problem was wider than the review's P1: any single lower-case word as an external-system or inside-element name (e.g. "weather", "warehouse", "soi") failed. Checker re-run on eight probe files (scratchpad, current generator): 8 PASS, no message (before the fix: 7 FAIL). The stress file now carries "Context", "context", "Physical", "weather", "soi" and "warehouse" and still PASSes (with its two intended duplicate-name warnings). Test `skeleton.test.ts` "name shadowing …" (and no usage is typed by its own name in any generated file).

## Minor

| # | Status | Disposition |
|---|---|---|
| n1 | fixed | `Evolution` (filled in Week 14) added to `MODEL_PACKAGES` and the generator; skeleton and mapping figures redrawn for 11 packages; slide/lesson text "present in the skeleton". |
| n2 | fixed | Listings carry a `credit` display string ("Quoted from the SysML v2 textual-notation training deck (Release 2026-08, CC BY 4.0), slide 9." / "Adapted from … slide 115, with one spelling of the stakeholder name."); the figure draws it as is. |
| n3 | fixed | Generated comments read "SysML v2 textual-notation training deck, slides 108-109"; test: no S0x/S10/Rnn code in any generated file. Week 8 student pages and the lab instructions grep clean. |
| n4 | fixed | Slide face: "Owned part usage without subsetting or redefinition: 1..1 by default". |
| n5 | fixed | Subsetting notes cite p.64 (constrains) and p.65 (additional feature), sources R80 pp.64–65; R80 p.77 removed from the imports lesson sources. |
| n6 | fixed | Throwaways replaced by plausible misreadings (Q1d one language per model; Q2d complete-and-checked so the design is adequate; Q4d "icu and maternity are specializations of Ward"; Q12d "model it now as a part definition"); Q7c "Every Vehicle now has six wheels"; Q3 options all multi-item; two absolute qualifiers softened. Key balance and length-rank tests still pass. |
| n7 | fixed | `no-concerns` gap names its cause: Week 2 snapshot, or a Week 1 file without concerns (tested). |
| n8 | mitigated | Explicit 20 s wait (and network idle) for the lazy archive page; 15 s waits on the viewer counter. Contention itself is outside Week 8. |
| n9 | fixed | Figure maps moved to `lectureWeek8Figures.ts`; the S1/S2 files export components only: 0 Week 8 oxlint warnings (was 50). `registry.ts`: one import line changed (re-read before editing). |

## Checker results (course-designated checker, release 2026-08, kernel 0.62.0; one run at a time, no other java process)

Report `sysml/lectures/week08/week08-report.json` (2026-10-19T18:24:44Z): **24 files, 18 PASS, 6 FAIL, 0 ERROR; every result as intended** (files named `invalid_*` fail by design).
- Week 8: AeroLink model, team fixture, writing-check answer, defects-1–2-fixed exercise file, deck quotes, adapted concerns, warm-up, tool-proof pass, instructor key: PASS, no message. Stress model: PASS, 2 "Duplicate of other owned member name" warnings (intended). Tool-proof fail: FAIL 9:12 / 9:18. Seeded exercise: FAIL, the same nine errors as recorded by the reviewer.
- Reused Week 9 files: unchanged results. Reference v0.1–v0.4 (after the M1 rewrite): PASS, no message.
- Probe run (scratchpad, not in the repo): 8 shadow-name files, 8 PASS.
- Kit run (scratchpad, Windows end to end): tool proof PASS / FAIL as above.
None of these PASS results is evidence of meaning; the M1 direction is asserted by text tests against the specification's rule, not by the checker (which accepts either direction).

## Register changes requested (not applied: `readings.py` is owned by the Week 4 agent)

1. **KerML 1.1 Beta 2, clause 7.4.14 Packages** (S05, `1_Kernel_Modeling_Language.txt`; R87 covers 7.3 only): add a reading so the Kernel placement of the package construct can be cited beside R70 sl.4. Until then it is named only in faculty notes, uncited.
2. **S06 §7.27 Metadata** (pending since the original build): still needed for the `#keyword` dependency pattern.
No register entry was used outside its verified range; R80 p.49 (new citation on `w8s2-worked-context`) is inside R80 pp.47–77.

## Changes affecting other weeks

- **Reference model** (`sysml/reference/*`, Week 8 owns): `#affects`/`#flowsTo` → `#affectedBy`/`#receivesFrom`, ends reversed. Week 9 and 10 activity tests, the drift check (`sysmlDrift.test.ts`), `sysmlMapping.test.ts` and `aerolinkCanonical.test.ts` pass. `docs/lectures/week14/WEEK14_LECTURE_OUTLINE.md` (not edited, other owner) proposes "`#affects` dependencies to the elements it changes": under the course rule these must be written `#affectedBy … from <changed element> to <increment>`. Week 12–13 impact traversal ("from what changes to what is affected") now follows dependencies from supplier to client consistently.
- The canonical `sysml/validation-report.json` (full run only) was not regenerated; it already held the 2026-10-11 hashes of the reference files and no test reads them from it.
- `src/components/figures/registry.ts`: Week 8 import line only.

## Gates (2026-10-19)

| Gate | Result |
|---|---|
| `npm run lectures:pptx -- --week 8` | session 1: 27 slides; session 2: 21; notes and lesson written; new/changed figures (checker run, exit ticket, four layers, mapping arrows, package skeleton) inspected as PNGs |
| `npm run lab:md` (week 8) | `WEEK8_LAB_INSTRUCTIONS.md` regenerated (includes the install guide) |
| `npx tsc -b` | exit 0 (no Week 4 errors at the time of the run) |
| `npx oxlint src` | 0 errors; 0 Week 8 warnings |
| `npx vitest run` | 1641 / 1643 pass. The 2 failures are 30 s timeouts in `week07/activities.test.tsx` and `week11/activities.test.tsx` under load (not Week 8; Week 11 is another agent's work in progress). Week 8, reference, lab, quiz, Week 9/10 activity subsets: all pass. |
| `npx vite build` | passes (chunk-size warning only) |
| `npm run build:student` + `check-student-build.mjs` | PASS; Week 8 student decks 27 and 21 notes slides, all empty; no faculty-note marker, no instructor-key text in the student JS |
| Playwright `lectures-week8` (own server 5198, workers=1, under the lock) | 4/4 pass (counts updated to 27 slides / 27 notes pages); axe light and dark: no violations |
| Playwright `week8-flow` (5173, workers=1, under the lock) | 7/7 pass, including the new install-guide test and the checker page in the axe sweep (1440 and 400 px, light and dark) |

## Confirmation review (`_source_cache/review/week08_confirmation.md`, verdict NOT YET): dispositions, 2026-10-19

| Finding | Disposition | Where |
|---|---|---|
| **N1** (moderate). Task 5(b) fragment and recorded output used different line numbers | **Fixed.** The Assessment page now shows the whole seeded file as the checker read it: header comment kept, tabs kept, with a gutter of the file's own line numbers (the gutter is not selected when copying). The caption says the line is the margin number counted from the file's first line, and that a tab counts as one column. Every diagnostic now lands on its token: 5:2 `import`, 5:21 `::`, 8:15 `-002>`, 8:21 `'Student residents'`, 18:1 `}`, 11:24 `Boolean`, 11:3 `attribute islanded`, 16:27 `'STK-002'`, 16:3 `stakeholder residents`. The instructor key already used file numbering and agrees. New tests: each line:column of the recorded output falls on a displayed line equal to that file line, the columns are kept on the page, the cited token is at that column, and defect lines 5 and 8 are the displayed defect lines. The key cites exactly the recorded pairs. Negative tests catch the old stripped and widened display, an unnumbered listing, a moved diagnostic and a new one. | `listings.ts` (`firstLine`, `exercise-seeded`), `Assessment.tsx`, `week8.css`, `sysmlWeek08.test.ts` |
| **N2** (minor). The tool-proof figure numbered the defect line 5; the notes and guide said 9 | **Fixed.** The figure shows the file from its package line (line 4) with the file's line numbers (`firstLine`, drawn by `rowsOf`), so the unquoted ID is on figure line 9. The caption says the numbers are the file's. The faculty note now says line 9, column 12. The recorded text reads "line 9, column 12". This is covered by the same alignment test. | `listings.ts`, `listingRows.ts`, `session2.ts` |
| **N3** (minor). The metadata clause was called pending | **Fixed.** R69 (S06 7.27, verified pp.188–194) is cited for the `#keyword` pattern on `w8s2-worked-stakeholders` and in the lesson. The page is **p.193**: 7.27.4 User-Defined Keywords is on p.193, not pp.190–191 as the review suggested; this was checked with `source_pages.py R69`. "will add to the reading list" and "not in the register yet" are gone. Register request 2 above is obsolete. | `session2.ts` (header, notes, slide and lesson sources, lesson paragraph) |
| **N4** (minor). An internal source code was in a student download | **Fixed.** `invalid_tool_proof_unquoted_id.sysml` now cites "SysML v2.1 Beta 2, Part 1, pp.49-50", reflowed so that line 9 stays line 9. The S10 codes in the headers of `deck_quotes_textual_notation.sysml` and `stakeholders_concerns_adapted.sysml` are also removed, because those files ship in the student bundle. New test: no file under `sysml/lectures/week08` and no `.sysml` download of the checker page matches the internal-code pattern; a negative test shows the pattern catches the review's examples and ignores IDs and versions. The checker was re-run and the report regenerated. | three `.sysml` files, `week08-report.json`, `sysmlWeek08.test.ts` |
| **N5** (minor). Some name collisions were outside the name plan | **Fixed.** `namePlan` now writes a register name that clashes in its namespace as "<name> (<ID>)" and reports each rename as a `name-shadow` gap. The clashes covered: an external named like the enterprise's ID or name or an external ID (its own included); an inside element named "System of interest" or like an inside ID; a stakeholder named like another element's ID in the Stakeholders package; a concern named like an ID or a stakeholder name. A stakeholder parameter never takes a feature name every concern inherits (`CONCERN_INHERITED`, read from the 2026-08 library chain ConcernCheck → … → Occurrence), so "Stakeholders" gives `stakeholders2`, with a finding. New checked file `labtool_collision_model_v01.sysml` (generated, `collisionRecord`): **PASS, no message**. Tests: renamed text, distinct names, parameters, findings, concern renames, and the negative direction (the fixture is unchanged and reports nothing). | `skeleton.ts`, `generated.ts`, `skeleton.test.ts`, `sysmlWeek08.test.ts`, `build-week08-sysml.mjs` |
| **N6** (nit). Q10 length cue | **Fixed.** The key now reads "Through Fleet only, since its import is public" (46 characters). d now reads "Through neither package, as imported members are not passed on" (63). The key is still the shortest (rank 4), so the 3/3/3/3 rank balance and the length tests hold, but it is no longer an outlier (distractors 57–63). | `quizWeek8.ts` |
| **N7** (nit). Wording | **Fixed.** The lab method now reads "“A regulates/funds/supplies B” becomes #regulatedBy/#fundedBy/#suppliedBy (in that order) from B to A". The `labBrief.ts` comment example is now REL-007 (the planning authority is affected by the communities). | `week08Lab.ts`, `labBrief.ts`, `WEEK8_LAB_INSTRUCTIONS.md` |
| **N8** (nit). Non-ASCII letters dropped from basic names | **Fixed.** `basicName` now transliterates Latin diacritics and ligatures: "Ångström météo" gives `angstromMeteo`, and ß/æ/ø/ł and similar are folded. Other letters (東京) are left out, and that case is reported as a `name-shadow` gap; the quoted name keeps the register spelling. | `skeleton.ts` |
| **N9** (nit). Unpack entry count not stated | **Fixed.** The unpack one-liner now prints "<files> files in <entries> entries unpacked". The step note states the expected file count, **99**: the 95 standard-library files, the jar, `kernel.json`, `install.py` and `LICENSE`. That count comes from `tools/sysml-pilot-2026-08/PROVENANCE.txt` and the unpacked kit, which holds 99 files. It is stated as a file count because whether the zip lists folder entries is not known without downloading it. The changed print expression was run on a local test zip, not on the real download. | `week08Checker.ts`, test |
| Later-week outlines contradicting the direction rule | **Fixed** (doc text only). Week 14 :163 is now one `#affectedBy dependency … from <changed element> to <increment>` per changed element. Week 14 :287 is now `#affectedBy` from PHY-001 and from CAP-004 to TECH-003, as in `aerolink_v04_full.sysml` :1673 and :1680. Week 13 :708 is now `#affectedBy` from the affected element to the DEC, and `#mitigates` from the mitigation. Week 12 :512 now lists `#affectedBy` and `#receivesFrom`, each written from the dependent. The stale Week 8 outline row (file name, defect kinds) is also corrected. | `WEEK12/13/14_LECTURE_OUTLINE.md`, `WEEK08_LECTURE_OUTLINE.md` |

### Checker run (2026-10-19, one run, no other checker process)

`python -I scripts/check_sysml.py sysml/lectures/week08 sysml/instructor/week08 <the 8 reused week09 files> <4 reference files> --report sysml/lectures/week08/week08-report.json`: **25 files: 19 PASS, 6 FAIL (all six `invalid_*`, as expected), 0 ERROR.**
- The seeded exercise and the tool-proof fail file give the same diagnostics as before.
- `labtool_collision_model_v01.sysml`: PASS, no message.
- The stress file keeps its two intended duplicate-name warnings.

### Gates

| Gate | Result |
|---|---|
| `npm run lectures:pptx -- --week 8` | session 1: 27 slides; session 2: 21; notes and lesson written |
| `node scripts/build-lab-md.mjs 8` | `WEEK8_LAB_INSTRUCTIONS.md` regenerated |
| `npx tsc -b` | exit 2. The only error is in `LectureWeek5S1.tsx` (Week 5 work in progress, another agent). No Week 8 error. |
| `npx oxlint src` | exit 0; no Week 8 warning |
| `npx vitest run` | 1870 / 1874 pass. Out-of-scope failures: Week 5 figures not registered (`lectures.test.ts`, Week 5 work in progress), and 30 s timeouts in `week07`/`week11` `activities.test.tsx` under load. Week 8 subset: all pass. |
| `npx vite build` | passes (chunk-size warning only) |
| Student build + `check-student-build.mjs` | PASS. No `S06`/`S10` header code and no instructor-key text in `dist-student/assets`. |
| Playwright `week8-flow` (5173, workers=1, under the lock) | 7/7, including both axe sweeps |
| Playwright `lectures-week8` (own server 5198, workers=1, under the lock) | 4/4; axe light and dark: no violations |

## Gate sweep 2026-10-19 (cross-week “tool rejects valid short answers”)

Found as Week 2 M1, Week 4 M2/N3 and Week 5 M2; swept across every team lab tool. A length or form gate stays only when a
student-visible sentence makes the short entry a real defect and the threshold is shown to the student. Full
before/after table, justification and the gates examined and kept: `docs/lectures/GATE_SWEEP_2026-10-19.md`. Shared
test: `src/workbench/shortAnswers.test.ts`. Record and gate signatures and the export format are unchanged.

| Gate | Before | After | Why |
|---|---|---|---|
| Package count (`skeleton.ts` `countOf`) | digits only | leading whole number, or “none”/“zero” = 0 | “12 items”, “none” left the readiness item open. |
| Purpose paragraph ≥ 15 words | — | kept | Stated in the lab step “Purpose first” and the readiness label. |
