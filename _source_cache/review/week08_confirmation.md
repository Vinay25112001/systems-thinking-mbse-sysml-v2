# Week 8 confirmation review: Import ST Artifacts / Stakeholders, after fix commit 19ae781

- **Reviewer:** independent confirmation reviewer (MBSE/SysML v2 and web QA; not the author). **Date:** 2026-10-19.
- **Inputs:** the review `_source_cache/review/week08_review.md` (REVISE: 2 major, 6 moderate, 9 minor) and the dispositions `learning-studio/docs/lectures/week08/WEEK8_REVIEW_DISPOSITIONS.md`.
- **What I changed:** I edited no source file and committed nothing. I wrote three throwaway probe tests in `src/workbench/week8/` (`zz_confirm_probe*.test.ts`), ran them and deleted them; `git status` shows no trace of them. Their outputs are in the scratchpad (`…/scratchpad/w8probe/`), outside the repo.
- **Checker run:** I confirmed that no java or `check_sysml` process was running, then ran the course checker once, on six probe files only, with the report written to the scratchpad.
- **Playwright:** run under `_source_cache/.playwright.lock`. I created the lock as "week08-confirmation-reviewer" after the previous holder released it, and deleted it afterwards.
- **Tree state:** every Week 8 file is clean at HEAD 19ae781. The modified files in the tree belong to the concurrent Week 4, 9, 11 and 12 work.

## Verdict: **NOT YET** (one moderate fix needed; no blocker, no major)

**Majors.** Both majors are closed.
- **M1, dependency direction.** It is correct against R80 pp.50–51. It is applied consistently in the generator, the AeroLink model, the fixture, the stress file and all four reference files: 330 dependencies, every one in the course direction. Slide, notes, lesson and lab method agree, and tests fail when a dependency is inverted.
- **M2, checker guide.** It is accurate against `check_sysml.py` and `SYSML_TOOLCHAIN.md`. It is honest that macOS and Linux are untested, and it handles the long-path hazard.

**Moderates and minors.**
- m1–m4 and m6 are closed. n1–n9 are closed, with n8 mitigated.
- **m5 is PARTIAL.** The fix made reading the recorded checker output the core of assessed task 5(b). But the fragment students see on the Assessment page has its three header comment lines stripped and its tabs widened to four spaces. The recorded output, however, uses the file's own line and column numbers, and the page says they "count from its first line". Every line reference is off by three:
  - `ERROR 5:2` (defect 1, the import) points at the displayed line 5, `part def <STK-002>` (defect 2);
  - the displayed `8:15` and `11:x` land on the wrong lines;
  - `16:x` and `18:1` point past the end of the 15-line fragment.

  This brings back the failure the review gave for m5: graders working from the key, which uses the file's lines, will disagree with students working from the page (N1).

New findings: **blocker 0 · major 0 · moderate 1 · minor 4 · nit 4.**

## Per-finding table

| Finding | Status | Evidence (file:line) | Judgement |
|---|---|---|---|
| **M1** dependency direction inverted | **CLOSED** | Rule stated once: `labBrief.ts:86-112` (`REL_KEYWORDS`, `dependencyEnds`). Generator: `skeleton.ts:18`, `:466`, `:540-541`. AeroLink: `aerolink_context_stakeholders_v01.sysml:7` (header rule), `:217` `#regulatedBy … from 'STK-011' to 'STK-002'`, `:223` `#suppliedBy … from 'STK-005' to 'STK-010'`, `:226` `#fundedBy … from 'STK-011' to 'STK-003'`, `:235` `#affectedBy … from 'STK-013' to 'STK-004'`. Fixture `labtool_team07_model_v01.sysml:127` and stress `labtool_stress_model_v01.sysml:122` give REL-002 from STK-005 to STK-002. Reference: `aerolink_v04_full.sysml:37-44` (renamed definitions with doc), `:1605-1611` (`#receivesFrom`), `:1668-1680` (`#affectedBy`). Slide callout `session2.ts:535`, notes `:542`, `:547`, lesson `:878`. Lab method `week08Lab.ts:85`. Key `exercise_microgrid_key.sysml:17-18`. Assessment `Assessment.tsx:42`. | Sound. Details below. |
| **M2** no install procedure; Week 7 phantom task | **CLOSED** (FD-W8-1 pending faculty) | `week08Checker.ts` (single source); page `src/week8/Checker.tsx:6-124`; lab instructions via `checkerMarkdown()`. "pre-Phase-II" and "installed in Week 7" grep clean over `src/`, `docs/` and `exports/`, and asserted by `week08Checker.test.ts` (last test, shown able to fail). Demo slide `session1.ts:826-829`. Workload: `labBrief.ts:160-169` (install 0.9 h inside the lab hours), `week8Path.ts:130-146`, total 8.0 h (recomputed below). | Sound. Details below. |
| m1 ref part conflated with deletion | **CLOSED** | `session2.ts:507` (instance terms, R80 p.64; ownership R80 p.49), misconception row `:513`, lesson `:873` | Correct semantics |
| m2 package placed in Root | **CLOSED** | Bullets `session1.ts:414`, notes `:421-422`, lesson `:949`, Q3 `quizWeek8.ts:36-46` (key d "Root: elements, relationships, namespaces, imports"; b "Kernel: classes, behaviors, packages"). R70 sl.4 re-read: Package is listed under Kernel. | Correct. KerML 7.4.14 is named in the faculty notes only, never as a citation (see §5). |
| m3 Session 1 over-dense | **CLOSED** | Writing check `session1.ts:689` (2 min, pairs); redefinition marked as a preview `:634`; worked network cut to two tokens `:779`, `:785`; four slides at 2 min. Model answer `writing_check_bakery.sysml`: PASS recorded. | Sound |
| m4 three-person team drops fidelity | **CLOSED** | `labBrief.ts:182` "fidelity checked on a sample: every stakeholder and five concerns" | Sound |
| m5 task 5 ambiguous; key misapplies a rule | **PARTIAL** | Fixed: `Assessment.tsx:45` gives tasks (a), (b) and (c); the defects-1–2-fixed file and its output `:56-58`; key rationale `exercise_microgrid_key.sysml:2-4` (visibility, not the root rule); line-by-line reading `:11-14`; `EXERCISE_MINUTES = 45` `labBrief.ts:189`; task 3 drops the metadata definition (`Assessment.tsx:42`). **Not fixed:** the displayed fragment and the recorded output use different line and column numbering (N1). | The disposition text is accurate; N1 is a new defect that the fix introduced. |
| m6 name shadowing gives a failing file | **CLOSED** for the reviewed cases | `namePlan()` `skeleton.ts:242-286`; findings `:361`; test `skeleton.test.ts:223-252`. Probe (§4): every reviewed case (Context, context, Physical, weather, soi, warehouse, systemOfInterest, enterprise named Context or Physical, padded names, NBSP, reserved word, unicode) PASSes with no error and is reported as `name-shadow`. | Sound. Residual collisions of other kinds are N5 (minor; the files still PASS). |
| n1 Evolution package missing | CLOSED | `labBrief.ts:83`; `aerolink_context_stakeholders_v01.sysml:268`; fixture `:169`; stress `:165` | ✓ |
| n2 listing credit renders badly | CLOSED | `listings.ts:25-26`, `:76`, `:129`, `:191`, `:210`; drawn as is, `LectureWeek8Code.tsx:61-63` | ✓ |
| n3 source codes in generated files | CLOSED for generated files | `grep` shows no `S0x/S10/Rnn` code in the three generated `.sysml` files or in my probe outputs. A hand-written student download still carries one (N4). | ✓ (see N4) |
| n4 default multiplicity on the slide face | CLOSED | `session1.ts:560` "Owned part usage without subsetting or redefinition: 1..1 by default" | ✓ |
| n5 page slips | CLOSED | Subsetting sources R80 pp.64–65 (`session1.ts:617`). The imports lesson sources are now R70 5–6 and R80 60–61, 63; the remaining R80 p.77 is on the attribute-related lesson section (`session2.ts:820`), where it belongs. | ✓ |
| n6 quiz cueing | CLOSED | Recomputed: keys a/b/c/d = 3/3/3/3; length ranks 3/3/3/3; key uniquely longest in 3 items and uniquely shortest in 3; the four throwaways replaced; Q7c is now "Every Vehicle now has six wheels". | ✓ (residual cue is nit N6) |
| n7 no-concerns message | CLOSED | `skeleton.ts:349-358`: the message branches on the source | ✓ |
| n8 Playwright flakiness | MITIGATED | `week8-flow.spec.ts:140-142` (network idle, 20 s), `lectures-week8.spec.ts:29`, `:33`, `:76` (15 s). Contention persists on the shared 5173 server (see gates). | Acceptable |
| n9 oxlint warnings | CLOSED | Figure maps in `lectureWeek8Figures.ts`; no Week 8 file in the 31 oxlint warnings | ✓ |

## 1. M1 in detail

**Specification.** R80 p.50, opened in `_source_cache/2a_OMG_Systems_Modeling_Language.txt` via `scripts/source_pages.py R80 50 51`:
- "A dependency is a kind of relationship between any number of client (source) and supplier (target) elements. This implies that a change to a supplier element may result in a change to a client element."
- p.51 adds that "the client elements … following the keyword from … the supplier elements after the keyword to", with the example `dependency Use from 'Application Layer' to 'Service Layer'`.

So `from` is the dependent element. The course rule matches.

**Library cross-check.** `#refinement` runs from the refining element to the refined one. This agrees with the spec's `Refinement` metadata ("the source elements … provide a more precise … representation than the target elements", 2a text line 26299), so the unchanged refines direction is right.

The other unchanged types are also consistent with "from = dependent":
- satisfies runs from the design element to the requirement;
- measures runs from the measure to what it measures;
- mitigates runs from the mitigation to the risk.

**Coverage.** I matched every `dependency` line of v0.1–v0.4 against the test's regex in Python:

| File | Dependency lines | Matched by the test regex |
|---|---|---|
| v0.1 | 25 | 25 |
| v0.2 | 77 | 77 |
| v0.3 | 77 | 77 |
| v0.4 | 151 | 151 |

Because the regex sees every line, `sysmlMapping.test.ts:236-255` checks the direction of every reference dependency, not just a sample. The Week 8 generated files contain 8, 3 and 4 tagged dependencies plus one untyped one. Their direction is asserted per type.

**Tests fail on inversion.**
- `skeleton.test.ts:192-222` hard-codes the expected client per type (`expected` map, line 194). Flipping any `direction` in `REL_KEYWORDS`, or swapping `dependencyEnds`, breaks line 208 or 209.
- `sysmlMapping.test.ts:257-267` applies the realisation check to an inverted `#affectedBy` line and requires "not found".
- `:247` forbids the old tags.

**Untyped relationship.** `dependency <'REL-005'> from 'STK-003' to 'STK-006'` (stress `:128`) keeps the register order. A `rel-type` gap tells the team to state the direction in its audit note. This is acceptable.

**Later-week files that now contradict the rule.** None of them is a Week 8 file and none was edited; they are listed for their owners.

| File:line | What it says | Required under the rule |
|---|---|---|
| `docs/lectures/week14/WEEK14_LECTURE_OUTLINE.md:163` | "`#affects` dependencies to the elements it changes" | `#affectedBy dependency … from <changed element> to <increment>` |
| `docs/lectures/week14/WEEK14_LECTURE_OUTLINE.md:287` | "`#affects` dependencies from TECH-003 to PHY-001 and CAP-004" | Inverted. Must be `#affectedBy … from PHY-001 to TECH-003` (and CAP-004), as already in `aerolink_v04_full.sysml:1673`, `:1680` |
| `docs/lectures/week13/WEEK13_LECTURE_OUTLINE.md:708` | recommendation → `#affects`/`#mitigates` | Rename the tag to `#affectedBy`, written from the affected element |
| `docs/lectures/week12/WEEK12_LECTURE_OUTLINE.md:512` | lists `#affects` among the course link types | Rename to `#affectedBy` (and add `#receivesFrom`) |

Other later-week material is consistent with the rule:
- **Week 12–13 traversal code.** `src/activities/week12/thread.ts` and `week13/impact.ts` work on the abstract Phase I link list, not on SysML text. Their semantics (affects: the target is affected; flows-to: the consumer depends; `impact.ts:190`) agree with the rule, so no change is needed.
- **Week 9 outline.** `docs/lectures/week09/WEEK09_LECTURE_OUTLINE.md:241` ("client elements require supplier elements") is consistent.
- **Remaining "affects" mentions.** No other file in `src/`, `docs/`, `sysml/` or `exports/` uses `#affects`, `#flowsTo`, `#regulates`, `#funds` or `#supplies`. Mentions in Weeks 2–7 are Phase I register link names, not SysML dependencies.

## 2. M2 in detail

Every claim below was checked against `scripts/check_sysml.py` and `docs/SYSML_TOOLCHAIN.md`.

**Folder layout.** `SCRIPTS_DIR` is `checker/scripts`, `STUDIO_DIR` is `checker`, `PROJECT_DIR` is `sysml-checker`, so `TOOLS_DIR` is `sysml-checker/tools` (`check_sysml.py:37-50`). This is the guide's layout. The jar path `tools/sysml-pilot-2026-08/kernel/sysml/jupyter-sysml-kernel-0.62.0-all.jar` matches `KERNEL_JAR` and the provenance file.

**Output format.**
- Paths print relative to `STUDIO_DIR`, so `models/…` is exactly what the guide shows (`rel()`, `:176-180`).
- `--report` exists (`:236`).
- The `invalid_` naming sets the expectation (`:263`).
- Running with no paths targets `checker/sysml`, which the kit does not have, and the guide warns about this.
- The messages quoted in troubleshooting are the script's own strings: `:78`, `:99`, `:115`, `:167`.
- The recorded proof output is generated from `week08-report.json` in the `print_results` format, and the test pins that format.

**Checksums.** The Windows JDK (`f9d6e191…8b4e`) and the kernel (`5a015ed3…3cb2`) equal `SYSML_TOOLCHAIN.md:67`, `:72` and `tools/sysml-pilot-2026-08/PROVENANCE.txt`. I could not verify the four macOS/Linux JDK checksums: I was told not to download, and they are not in the repository's provenance. The source says they were read from the publisher's `.sha256.txt` files.

**Commands.**
- PowerShell: `curl.exe`; `Get-FileHash` (uppercase, matched by `.toUpperCase()`); a Python `zipfile` one-liner whose double/single quoting survives PowerShell.
- macOS: moves `Contents/Home`.
- Linux: `sha256sum`.
- macOS and Linux use `tar`, which keeps the JDK execute bits. The kernel unpacked with Python `zipfile` needs read access only.

**Honesty about testing.** `TESTED_NOTE` and the source header both say macOS and Linux were not run.

**Long-path hazard.** The longest kernel entry is 130 characters below `tools/`, so a normal `$HOME` stays far under 260. The guide prints the entry count. The step note and a troubleshooting row say that a Traceback means an incomplete library that must be redone at a short path. `tool_missing()` checks only `Kernel Libraries`, so the guide's warning is the real safeguard (see nit N9).

**Workload 8.0 h.** Recomputed:

| Row | Hours |
|---|---|
| class | 2.5 |
| readings | 0.9 |
| slides | 0.4 |
| lesson | 0.8 |
| proof | 0.2 |
| lab | 2.0 |
| quiz | 0.3 |
| exercise | 0.8 |
| log | 0.1 |
| **Total** | **8.0** |

The 0.9 h install is carried by the team inside the lab's 8.0 person-hours, so it is about 1 h for the checker owner. That is honest for the tested Windows path. On an untested macOS or Linux machine it is optimistic, and the guide sends that case to a lab machine.

**Decision items.** FD-W8-1 (one installation per team; lab machines as the fallback) still needs faculty confirmation. So does the existence of lab machines with the checker. Both are declared.

## 3. New findings

**N1 (moderate). In assessed task 5(b), the recorded checker output does not line up with the fragment shown to students.**

*Evidence.*
- `Assessment.tsx:106` shows `listing('exercise-seeded').lines`.
- `listings.ts:65` (`withoutComments`) drops the three `//` header lines of `invalid_exercise_microgrid_seeded.sysml`.
- `tidy` replaces each tab with four spaces.
- The output block (`Assessment.tsx:52-53`) is the checker's report for the whole file. Its caption (`:51`) reads "line numbers count from its first line".

I printed the displayed listing. It has 15 lines: `import` is line 2 and `part def <STK-002>` is line 5. The output reads:
- `5:2`/`5:21` (the import);
- `8:15`/`8:21` (STK-002);
- `11:3`/`11:24`;
- `16:3`/`16:27`;
- `18:1`.

Columns are also shifted (a tab counts as one column).

*Failure scenario.* A student maps `5:2` to the displayed line 5 (defect 2), `8:15` to the `islanded` attribute and `11:x` to the concern. The lines 16 and 18 that the output names do not exist on the page. The instructor key (`exercise_microgrid_key.sysml:11-14`) uses the file's numbering. So graders and students disagree on exactly the cascade analysis that m5 was meant to make unambiguous.

The same mismatch, less important, appears on slide `w8s2-lab-proof` (N2).

*Fix.*
- Show the fragment as the file is, with its comment lines and tabs (or render displayed line numbers equal to file line numbers, keeping column positions).
- Or re-base the output, and correct the caption.
- Add a test that every diagnostic line number in the output falls on a displayed line with the cited token.

**N2 (minor). The tool-proof listing figure numbers the defect line 5, while everything else says line 9.**
- The figure on `w8s2-lab-proof` (`session2.ts:705`) numbers the stripped listing from 1, so the unquoted `<EXT-001>` is on figure line 5.
- The notes (`:718`, via `listing('tool-proof-fail').recorded`) and the guide say "line 9, column 12".
- The downloaded file itself does fail at 9:12, so the students' own runs are consistent.
- Fix: number the figure with file line numbers, or say "line 9 of the file".

**N3 (minor). The metadata clause is already in the register (R69), but Week 8 still calls it pending.**
- `readings.generated.json` has **R69 = S06 "7.27 Metadata", pp.188–194**, verified. Its text includes 7.27.4 User-Defined Keywords: "a user-defined keyword is the … name (or short name) of a metadata definition … preceded by the symbol #. Such a keyword can be used in package, dependency, definition and usage declarations."
- Week 8 still says the clause "is not in the register yet": `session2.ts:17-19`; faculty notes `:542` ("its metadata rules are in a clause we will add to the reading list").
- The dispositions' register request 2 is therefore obsolete.
- Fix: cite R69 (pp.190–191) for the `#keyword` pattern on `w8s2-worked-stakeholders` and in the lesson, and drop the "will add" sentence.
- KerML 7.4.14 is still not in the register: R87 covers S05 pp.51–66 (7.3) only. It is correctly named in faculty notes only (`session1.ts:422`), never as a citation.

**N4 (minor). An internal source code is still in a file students download.**
- `invalid_tool_proof_unquoted_id.sysml:2` reads "(S06 pp.49-50)".
- The file is offered as a download on the checker page (`week08Checker.ts`, `DOWNLOADS`).
- It ships in `dist-student/assets/sysml-*.js` (grep-confirmed).
- Two other hand-written headers carry S10 (`deck_quotes_textual_notation.sysml:2`, `stakeholders_concerns_adapted.sysml:2`), but listings strip comments, so students never see those.
- This is the same class as review n3. Fix: write "SysML v2.1 Beta 2, Part 1, pp.49–50". Because the file is checksummed in `sysmlWeek08.test.ts`, the report and hash must be regenerated.

**N5 (minor). Some name collisions are outside the name plan. They still PASS, with warnings the tool does not predict.**

Checker run on the probe files (`…/w8probe/confirm-report.json`): all 6 PASS. The cases the plan misses:
- **A name equal to another element's ID** (stakeholder STK-001 named "STK-003"; external system EXT-001 named "ENT-001"). This gives 4 × "Duplicate of other owned member name". `Context::'ENT-001'` and `'STK-003'` now each match two members, so the concern subject, the concern's stakeholder and REL ends may resolve to the wrong element. There is no finding.
- **An inside element named "System of interest".** Two `part def 'System of interest'` and an ambiguous `soi` type; duplicate warnings, no finding.
- **A stakeholder named "Stakeholders".** The parameter becomes `stakeholder stakeholders`, which gives "Duplicate of inherited member name 'stakeholders' from RequirementCheck". The same would happen for any name whose camel case equals an inherited requirement feature.

*Failure scenario.* Rare. But the tool promises that the warnings are predicted, and in the ID-as-name case the model can quietly point at the wrong element.

*Fix.* Extend `namePlan` with a per-package collision check (names against short names and against definition names), and add the inherited RequirementCheck feature names to the parameter `taken` set. Report each case as `name-shadow`.

**Nits.**
- **N6.** Q10's key, "Through Fleet only", has 18 characters against 35–58 for the distractors: an odd-one-out by length. Absolute qualifiers are still mostly in distractors (Q2a "always", Q4c "only once", Q7d "cannot … once", Q12a "entirely").
- **N7.** Wording.
  - `week08Lab.ts:85` reads "'A regulates B' becomes #regulatedBy, #fundedBy, #suppliedBy from B to A". As written it seems to map one verb to three keywords. Suggest "'A regulates/funds/supplies B' becomes #regulatedBy/#fundedBy/#suppliedBy from B to A".
  - The code comment at `labBrief.ts:95` gives the example "communities are affected by operators". REL-007 is the planning authority affected by communities.
- **N8.** `basicName` drops non-ASCII letters, so "Ångström météo" becomes `ngstrMMTO`. The result is valid, but folding diacritics (Å→A) would keep usage names readable.
- **N9.** The unpack step prints the entry count but never says what it should be: about 100 for the kernel zip (95 library files plus the jar, `kernel.json`, `install.py`, LICENSE and folders). A short unpack without a Traceback could not be recognised. Adding "expect about N entries" costs one line.

## 4. m6 probe (generator), details

The probe test generated six files from the team fixture, with mutations. Checker: release 2026-08, kernel 0.62.0, Java 21.0.12.1, one run, nothing else running.

| Probe | Names | Generated text (inspected) | Checker |
|---|---|---|---|
| p1 | stakeholder "Context"; external systems "context", "Physical", "weather"; inside elements "soi", "warehouse" | Root-qualified `'…Model'::Context::'ENT-001'` and `…::Physical::soi2`; `part context2`; `context3 : 'context'`; `weather2 : 'weather'`; `soi2`, `soi3`, `warehouse2`; 8 `name-shadow` findings | PASS, no message |
| p2 | "context ", "weather " (trailing space), " soi", "warehouse" + NBSP | The import normalises them; the same renames and findings as p1 | PASS, no message |
| p3 | "Context" + NBSP (stakeholder), " Physical" (external) | Root-qualified references; 2 findings | PASS, no message |
| p4 | stakeholder named "STK-003", external named "ENT-001" | Duplicate members; no finding | PASS, 4 duplicate warnings (N5) |
| p5 | enterprise "Physical"; stakeholder "Stakeholders"; external "dependency" (reserved); external "Ångström météo 東京 🚀"; inside "System of interest" | `dependency_`; unicode kept in the quoted name; Physical root-qualified with a finding | PASS, 3 warnings (N5) |
| p6 | enterprise "Context"; external "systemOfInterest"; inside "soi", "soi2" | `systemOfInterest2`/`3`, `soi3`, `soi4`, `soi22`; findings | PASS, no message |

The reserved word, unicode, padded names and every reviewed shadow case produce correct, resolvable text and a finding. The residual cases are N5.

## 5. Session 1 timing, quiz, hygiene and citations

**Timing.** Session 1 has 27 slides (26 content slides plus references): 70 min plus a 5 min buffer, 75 in all. Spoken notes run from 46 to 106 wpm; the highest is `w8s1-exit`, 106, under the 130 limit. The live demo `w8s1-checker-demo` runs at 84 wpm over 3 min. Session 2 has 21 slides, 69 + 6 min, at most 96 wpm. `timing.test.ts` enforces all of this and passes.

**Quiz.** 12 items. Keys are 3/3/3/3, length ranks 3/3/3/3, and the key is uniquely longest in 3 items and uniquely shortest in 3. The residual cue is N6.

**Internal IDs and source codes.** None on slide faces or in the lesson (`timing.test.ts` INTERNAL regex). None in the generated `.sysml` (the three repository files and my six probe outputs; grep for `S0x|S10|Rnn`). One remains in a hand-written download (N4).

**Citations.** I collected every citation of both sessions:
- Session 1: R27, R28, R33a, R33b, R33c, R70, R79, R80, R85, R90.
- Session 2: R28, R33b, R70, R77, R80, R83, R85, R90.

All are in `readings.generated.json`, inside their verified ranges, and the test checks this.

**Pending register entries.**
- **KerML 7.4.14** is not cited anywhere; it is named in a faculty note only.
- **S06 §7.27** is not cited either, but it is covered by the existing R69 (S06 pp.188–194, including 7.27.4 User-Defined Keywords). It should now be cited (N3).

## 6. Gates (run from `learning-studio/`, 2026-10-19 14:57–15:15)

| Gate | Result |
|---|---|
| `npx tsc -b` | exit 2. The only error is in `src/content/lectures/week04/zz_probe.test.ts` (`node:fs` types), another agent's throwaway Week 4 probe. No Week 8 error. |
| `npx oxlint src` | exit 0; 31 warnings, none in a Week 8 file |
| `npx vitest run` | 1650 / 1654 pass. Failures, all out of scope: `week04Lab.test.ts` ×2 (Week 4 fix in progress: lab markdown not regenerated; three-person rounding) and 30 s timeouts in `week07/activities.test.tsx` and `week11/activities.test.tsx` under load. Week 8 subset (`lectures/week08`, `quizWeek8`, `workbench/week8`, `lab/week08*`, `model/reference`, `lectures/week01`, `activities/week09`, `activities/week10`, `src/week8`): **21 files, 317/317 pass**. |
| `npx vite build` | passes (chunk-size warning only) |
| Student build (`vite build --mode student --outDir dist-student` + `check-student-build.mjs`) | **PASS**. Week 8 student decks: 27 and 21 notes slides, all empty. The instructor key text ("INSTRUCTOR KEY", the root-namespace rationale) is absent from `dist-student/assets/*.js`. |
| Playwright `lectures-week8` (own server 5198, workers=1, under the lock) | **4/4**; axe light and dark: no violations |
| Playwright `week8-flow` (5173, workers=1, under the lock) | First run 6/7. "axe … dark" timed out in `page.goto` (`fresh()`, `week8-flow.spec.ts:32`) on the shared dev server. Immediate re-run: **7/7**, including the install-guide test and both axe sweeps. Contention, as n8. |

## Required for sign-off

1. **N1.** Make the displayed task-5 fragment and the recorded output share line and column numbering, correct the caption, and add a test that fails on an offset.

Recommended in the same pass (not blocking):
- N2–N4: the figure line numbers, citing R69, and the S06 code in the download.
- N5: the generator collision check.
- Tell the Week 12–14 owners about the four outline lines listed in §1.

---

## Final recheck (after commit 3b60280), 2026-10-19

**Verdict: SIGN-OFF.** All of N1–N9 are closed. Nothing moderate or higher is open. Three new nits are listed below; none blocks.

| # | Status | Evidence |
|---|---|---|
| N1 (moderate) | **CLOSED** | `listings.ts:264-273`: `exercise-seeded` is now the whole file, untouched (`trimEnd(src(...).split('\n'))`, header and tabs kept), with `firstLine: 1`. `Assessment.tsx:48-58` draws each line with a `wk-ln` gutter of `firstLine + i` (`week8.css:24-33`, `user-select: none`). The caption at `:59` gives file numbering and says a tab counts as one column. I checked all 9 recorded diagnostics (`week08-report.json`) against the file by hand: 5:2 `import`, 5:21 `::`, 8:15 `-` of `STK-002`, 8:21 `'Student residents'`, 11:3 `attribute`, 11:24 `Boolean`, 16:3 `stakeholder`, 16:27 `'STK-002'` and 18:1 `}` each land on the token they name. The instructor key (`exercise_microgrid_key.sysml:2,5,11-14`) cites exactly these pairs in file numbering. Tests (`sysmlWeek08.test.ts`, `citationProblem` + CITED) check each line:column against the displayed line, the file's columns, the token and the defect lines, and also check the key↔report set equality. The negative cases fail as they should for a header-stripped display, tab-widened lines, a missing `firstLine`, a moved diagnostic and an extra diagnostic. These are genuine. Weakness: the test checks the `LISTINGS` data, not the rendered DOM. `Assessment.tsx` renders `seeded().lines` and `firstLine` directly, so the risk is low. |
| N2 | **CLOSED** | `listings.ts:281-289`: `firstLine = lineOf(...'package ')` (4) and `rowsOf` uses `l.firstLine` (`listingRows.ts:13`), so `<EXT-001>` is figure line 9. The caption and faculty note were updated (`session2.ts:707,725`), and the recorded text reads "line 9, column 12". This is covered by CITED `tool-proof-fail`. |
| N3 | **CLOSED** | R69 p.193 is cited on `w8s2-worked-stakeholders` and in the lesson (`session2.ts:538,882`). The "will add" and "not in the register yet" text is gone (header `:17-20`, notes `:543`). The page correction from p.190–191 to p.193 is noted in the dispositions. |
| N4 | **CLOSED** | `invalid_tool_proof_unquoted_id.sysml:2-3` now reads "SysML v2.1 Beta 2, Part 1, pp.49-50", and the defect is still on line 9 (report 9:12, 9:18). S10 was removed from the other two headers. A new test, with a negative case, covers `sysml/lectures/week08` and the checker-page downloads. |
| N5 | **CLOSED** | `skeleton.ts` `namePlan.clashFree` writes "<name> (<ID>)" and adds a `name-shadow` finding. `CONCERN_INHERITED` excludes the inherited feature names from parameters. The generated `labtool_collision_model_v01.sysml` names are sensible: `'STK-003 (STK-001)'`, `'ENT-001 (EXT-001)'`, `'Riverside Food Bank Network (EXT-003)'`, `'System of interest (PRT-001)'` (declared once besides the soi definition), `stakeholders2` and `result2`. `week08-report.json` records that file as **PASS, `diagnostics: []`**, as expected. |
| N6 | **CLOSED** | Q10 key is 46 characters against 57–63 for the distractors (`quizWeek8.ts`). The length-rank tests pass. |
| N7 | **CLOSED** | `week08Lab.ts:85` now reads "A regulates/funds/supplies B … #regulatedBy/#fundedBy/#suppliedBy (in that order)", and the regenerated markdown matches. The `labBrief.ts` example is now REL-007. |
| N8 | **CLOSED** | `foldLatin` gives `angstromMeteo` and `strasseOresundLodz`. Dropped non-Latin letters are reported. |
| N9 | **CLOSED** | `week08Checker.ts`: the unpack step prints the file and entry counts, and the note states 99 files (`KERNEL_FILES`). Caveat (from the fixer): the expression was run on a local test zip, not on the real download. |

**New nits (non-blocking)**
- **F1.** `Assessment.tsx:45,60,63` still say "fragment" for (b), (c) and the aria-labels, while the task now says "The file below". Also, the caption's "(the comment header is line 1)" would be clearer as "lines 1–3 are the comment header".
- **F2.** The seeded file's header, now shown to students (line 3), names the path `sysml/instructor/week08/`. It is harmless, since the key is not bundled, but it is an internal path on a student page.
- **F3.** In the collision model, usage and parameter names derived from an ID-like register name read oddly: `eNT001`, `eXT003`, `pRT003`, and `stakeholder sTK003 : 'STK-001'`, a parameter that echoes another stakeholder's ID. The file is valid and the case is reported as a finding; this is cosmetic only.

**Gates (this recheck)**
- `npx vitest run src/workbench/week8 src/content/lab/week08 src/content/lectures/week08 src/content/quizWeek8`: 7 files, **137/137** pass.
- `npx vite build`: passes (chunk-size warning only).
- Playwright was not re-run: the fixer reports 7/7 and 4/4, and nothing seen in this recheck called for a re-run.
- The checker was not run. Its results come from the committed `week08-report.json` (2026-10-19T15:32, 25 files: 19 PASS / 6 FAIL as expected).
