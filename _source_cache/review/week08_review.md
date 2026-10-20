# Week 8 independent review: Import Systems Thinking Artifacts / Stakeholders (A21 package, commit 0567304)

Reviewer: independent academic and technical reviewer (not the author). Date: 2026-10-19.

**Standard applied**
- DECISION_LOG A20 and A21, including decision 8 (SysML v2 foundations and tool navigation in Week 8) and decision 9 (AeroLink is the instructor reference only).
- DECISION_LOG W4: the SysML v2 texts are cited as 2.1 Beta 2.
- COURSE_PRODUCTION_PLAN.md, definition of done, items A–I.
- The signed-off Week 2 template (`week02_review.md`, `week02_confirmation.md`).

**Scope**
- Lecture source: `src/content/lectures/week08/*` (session1, session2, aerolinkCase, labBrief, listings, timing.test).
- Figures: `LectureWeek8S1.tsx`, `LectureWeek8S2.tsx`, `LectureWeek8Code.tsx`, `listingRows.ts`.
- Week page, quiz and lab: `week8Path.ts`, `quizWeek8.ts`, `lab/week08Lab.ts`, `docs/lectures/week08/*`.
- Lab tool and web module: `src/workbench/week8/*`, `src/week8/*`.
- SysML: `sysml/lectures/week08/*`, `sysml/instructor/week08/*`, `scripts/build-week08-sysml.mjs`.
- Exports: `exports/lectures/week08-*`, `dist-student/lectures/week08-*`.

**What I did, and what I did not do**
- I edited no source file and committed nothing.
- I wrote one throwaway probe test (`src/workbench/week8/zz_review_probe.test.ts`), ran it and deleted it. The SysML files it generated are in my scratchpad only.
- I re-ran the course checker only after confirming that no java process was running. I ran it once on `sysml/lectures/week08` and `sysml/instructor/week08`, and once on the probe outputs. Both reports were written to my scratchpad, not to `sysml/`.
- I ran Playwright under `_source_cache/.playwright.lock` (created as "week08-reviewer" and deleted afterwards) with one worker.
- This file replaces the review of the earlier pre-A21 Week 8 (2026-10-11), which is kept in git history at 3c15012.

## Verdict: **REVISE**

This is an ambitious, carefully sourced package.

**SysML v2 rules: almost entirely correct.** I opened 38 language-rule claims against the cited pages (table below). Their accuracy is the best of any Phase II draft I have seen:
- definition and usage;
- composite versus referential;
- multiplicity and its defaults;
- the two readings of `:>`, with the example `item x : A, B :> f :>> g`;
- redefinition replacing a feature, versus subsetting adding one;
- quantity kinds versus units;
- the import forms and the rule that root imports must be private;
- the short-name lexical rule;
- concerns declared like requirements, the subject coming first, stakeholders as part usages, frame making a subrequirement;
- viewpoints framing concerns.

Every one of these matches the Beta 2 text.

**Checker presentation is right.** A PASS is never presented as proof of meaning. The predict-the-checker slide and the applied exercise make the opposite point with recorded evidence.

**Checker evidence holds up.** My re-run reproduces every recorded result: 8 PASS and 2 FAIL as intended, with identical diagnostics. `sysmlWeek08.test.ts` confirms that the listings are verbatim excerpts of the validated files.

**Notes support live teaching.** The faculty notes are complete enough for another instructor: teach, why, figure walk, misconceptions, transitions, minute splits, and a minute-by-minute lab run sheet.

**The lab tool works in both directions.** It imports the Week 1 v1–v3 and Week 2 exports and refuses bad files with actionable messages. Its escaping is sound: quotes, backslash, `*/`, tabs, CJK, emoji and reserved words all produce a checker PASS.

Two findings are major. Both are of the kind this course says it guards against: a model that passes the checker but asserts the wrong thing, and a lab that cannot start as specified.

- **M1.** Stakeholder relationships are written as dependencies that point the wrong way. SysML v2 reads `dependency from A to B` as "A depends on B". The generator writes "regulates", "supplies" and "funds" with the actor as client. The result inverts the stated semantics in the AeroLink reference model, in the team fixture and in every team's generated model.
- **M2.** The checker installation the week depends on does not exist. The materials say the checker "is installed in the Week 7 pre-Phase-II task", but no such task exists anywhere in the course. Students get no install or run instructions, yet the tool proof is due between Session 1 and Session 2.

Counts: **blocker 0 · major 2 · moderate 6 · minor 9**.

---

## Findings

### Major

**M1 (major). Relationship dependencies invert the SysML v2 meaning of client and supplier for the directed relationship types.**

*Evidence*
- The specification defines a dependency between client (source) and supplier (target) elements, and reads it so that "a change to a supplier element may result in a change to a client element". Its example is an upper layer that depends on a lower layer (R80 pp.50–51, opened).
- The textual form is `dependency … from <clients> to <suppliers>` (R80 p.51).
- The generator maps the Week 1 `source` to `from` and `target` to `to` for every type. It documents each keyword as "the client <verb> the supplier":
  - `skeleton.ts:379`, `skeleton.ts:448`;
  - `labBrief.ts:88–96`.
- Resulting lines in the checked AeroLink model (`aerolink_context_stakeholders_v01.sysml`):
  - `#regulates dependency <'REL-001'> from 'STK-002' to 'STK-011'` (line 216). FAA is the client, so the model says FAA depends on the OEM.
  - `#supplies … from 'STK-010' to 'STK-005'` (line 222). The utility depends on the vertiport operators.
  - `#funds … from 'STK-003' to 'STK-011'` (line 225). The investors depend on the OEM.
- In each case the engineering dependency runs the other way. The OEM depends on its regulator, the operators on their power supplier, the OEM on its funder.
- `#affectedBy … from 'STK-013' to 'STK-004'` (line 234) happens to be consistent with the specification. So the same model uses two opposite conventions.
- The team fixture's `REL-002` (health department "regulates" warehouse staff) is generated the same way.
- The reference baseline itself uses the specification's direction elsewhere: `#derivesFrom dependency … from Needs::'CAP-003' to Needs::'NEED-004'` (`aerolink_v01_skeleton.sysml:467`). The derived element is the client, as it should be.
- The lecture never tells students what `from` and `to` mean semantically. It says only "a relationship between client and supplier elements" (`session2.ts:536`, lesson `:872`).

*Failure scenario*
- Week 9 onward adds `#derivesFrom`-style dependencies using the specification's direction. Week 12 and 13 traces and impact queries follow dependencies "from what changes to what is affected".
- A query such as "what is affected if the OEM changes?" then returns the FAA and the investors, and misses the real dependents.
- Every team inherits the inverted pattern from the generated draft.
- The checker cannot detect it. That is exactly the "PASS is not meaning" lesson the week teaches, here failed by the course's own reference model.

*Fix (pick one convention, state it on the slide, apply it everywhere)*
- (a) Keep the client-depends-on-supplier semantics and phrase each keyword as the dependent's relation to the supplier: `regulatedBy`, `suppliedBy`, `fundedBy`, `affectedBy`. Emit `from <target> to <source>` for the three active-voice Week 1 types. Docs read "the client is regulated by the supplier".
- (b) Or keep the active verbs and swap the ends in the generator for those three types.
- The symmetric types (conflicts, coordinates, partners) need a sentence saying their direction carries no meaning.
- Add one teach sentence to `w8s2-worked-stakeholders` with the R80 p.50 citation: "`from` is the dependent element".
- Regenerate the three files and add a test that asserts the direction for one active-voice type.

**M2 (major). The checker installation and run procedure that Week 8 relies on does not exist, and A21 decision 8 ("tool navigation") is covered by assertion rather than instruction.**

*Evidence*
- Student-facing text says the checker "is installed in the Week 7 pre-Phase-II task":
  - `WEEK8_LAB_INSTRUCTIONS.md:151`;
  - `week8Path.ts` workload row `proof`;
  - `session1.ts:95` (notes).
- `grep -ri "pre-Phase-II"` over `src/` and `docs/` finds the phrase only in Week 8 files. No Week 7 page, lab or path contains an installation task.
- The only installation procedure is the developer document `docs/SYSML_TOOLCHAIN.md`. It uses curl, SHA-256 checks and Git Bash, and is not linked from any student page.
- No slide, lesson block or lab step shows how to run the checker (command, input file, where the PASS/FAIL line and the `severity line:column message` diagnostics appear). The toolchain slide (`session2.ts:248–279`) names the tool and its role only.
- The tool proof is due **before Session 2** (`session1.ts:810–816`), budgeted at 0.3 h.
- The week page's own note says "if the checker was not installed in Week 7, add about 1 h". Since no Week 7 task exists, that hour applies to every student. That puts the week at 8.9 h against the 8.0 h budget (`week8Path.ts:142`; `WORKLOAD_TOTAL` = 7.9).

*Failure scenario*
- Students leave Session 1 told to run two files before Session 2, with no instructions and no tool.
- They arrive without proofs. The 5-minute checkpoint (`w8s2-lab-proof`) turns into installation support for the whole class.
- Teams then lose their first out-of-class days.
- The milestone report lists the Phase II tooling plan as a pending faculty decision (§8.2). The student materials, however, present it as already done.

*Fix*
- Add a student-facing "Install and run the course checker" page, linked from the Week 8 page, the lab instructions and the exit slide. It should cover:
  - the prerequisites;
  - the steps;
  - the exact command on one file;
  - an annotated sample output (PASS line, an ERROR line with line:column, a WARNING line);
  - the lab-machine fallback.
- Either create the Week 7 task (another agent's scope; coordinate) or reword every "installed in Week 7" to "installed using the Week 8 install page before Session 2".
- Add 1 h to the workload row unless a real Week 7 task carries it.
- Add a 2–3 minute live demonstration to Session 1 or Session 2 that runs the checker on the pass file and the fail file and reads one diagnostic aloud. Session 1 has a 6-minute buffer. Without this, decision 8 (tool navigation) is not met in class.

### Moderate

**m1. The "why is the system of interest a ref part" answer conflates model ownership deletion with referential instance semantics.**

*Evidence*
- `session2.ts:505` reads: "Because the context only refers to it; Physical owns it, and deleting the context must not delete the system."
- The lesson (`session2.ts:867`) reads: "The context only refers to the system of interest, so deleting the context does not delete the system."
- `ref` versus composite is instance-level semantics: when a containing *instance* is destroyed, its composite parts are destroyed (R80 p.64).
- Deleting a *model element* follows ownership (R80 p.49). The usage `systemOfInterest` is owned by `context` whether or not it is `ref`, and deleting `context` deletes that usage.
- `Physical::soi` is never deleted by deleting `context`, even if the feature were composite.

*Failure scenario.* Session 1 taught both ideas on adjacent slides: ownership cascade on `w8s1-ownership`, composite versus referential on `w8s1-part-attribute`. Students now learn they are the same thing, and will use `ref` to "protect" model elements from deletion.

*Fix.* Answer in instance terms: "a context does not create or destroy the system; if a context instance ends, the system goes on (referential, R80 p.64). In the model, Physical owns `soi` either way." Apply the same wording in the lesson.

**m2. "Packages are Root-layer constructs" contradicts the cited deck slide and KerML.**

*Evidence*
- `session1.ts:419` says "Packages and imports … are Root". The lesson (`:893–894`) says "Two Root-layer constructs … A namespace … A package …".
- Quiz Q3's key includes "packaging" (`quizWeek8.ts:44`).
- The cited deck slide 4 (R70 sl.4, opened) lists **Package under Kernel**. Root holds Element, Comment, Documentation, Namespace, Relationship, Annotation, Membership, Import, Dependency.
- KerML puts Packages in the Kernel clause (7.4.14: "namespaces used to group elements, without any instance-level semantics").
- Only deck slide 3's caption says "(e.g., packaging)". The source contradicts itself, and the lecture picked the informal side.

*Failure scenario.* A graduate student checks the claim against KerML 7.4.14 (the graduate memo points them to KerML) and finds the lecture wrong. Q3's key is then contestable.

*Fix*
- Say "namespaces and imports are Root; the package construct is defined in Kernel but, like Root elements, carries no instance-level semantics".
- Cite R70 sl.4. KerML 7.4.14 can be cited if a register entry is added; R87 covers only 7.3.
- Change Q3's key text to "Root: elements, relationships, namespaces, imports".

**m3. Session 1 is over-dense for students new to SysML v2, and much of its rule content is not used in Lab L8.**

*Evidence*
- Slides 14–22 introduce about 15 distinct language rules in 27 minutes, at 2–3 minutes each: definition/usage, usage ≠ instance, part versus attribute definition, composite versus referential, features, multiplicity notation and defaults, specialization, abstract, subsetting, redefinition (three forms), the two meanings of `:>`, quantity kinds versus units, and package-level usages as configurations.
- No student writes a line of SysML in Session 1 ("we read listings together, we do not type yet", `session1.ts:90`).
- Lab L8 and the applied exercise use part definitions, concerns, `ref part :>` and dependencies. They use no redefinition, no abstract definitions, no configurations and no quantities.
- The worked network (`w8s1-worked-network`) asks for silent reading, three analysis steps and five token classifications on a 20-line listing in 4 minutes. That is not realistic with a novice class.

*Failure scenario.* A SysML-fluent instructor can deliver it; most students will retain definition/usage and the `:>` rule and little else. The detail they will need in Weeks 9–11 is taught three weeks before use and not practised.

*Fix (no restructuring required)*
- Mark the worked network and the redefinition depth as "preview: practised in Week 9/11". Cut the classification step to two tokens.
- Use the freed 3–4 minutes plus the buffer for a pair activity: write one `part def` and one `concern` with subject and stakeholder.
- Or move the M2 checker demonstration into that slot.

**m4. The three-person reduced scope drops the fidelity question from the audit, the one judgment the week exists to teach.**

*Evidence*
- In `labBrief.ts:160` and the lab instructions, the three-person audit is "completeness and structure questions; gaps listed".
- Completeness and structure are the two questions the *tool* answers mechanically (`session2.ts:579`; `labBrief.ts:111`).
- Fidelity ("does each concern's documentation say what the register says?", `labBrief.ts:115`) is what the lecture, the predict slide and objective W8.6 build towards.

*Failure scenario.* A three-person team's audit is the tool's own output. Its graded evidence of meaning-checking is nil, and RB-9.4 "in part" cannot be assessed for it.

*Fix.* Keep fidelity for all teams, on a sample (for example every stakeholder plus five concerns). Take the 0.3 h saving from the matrix reasons or the relationships instead.

**m5. In the applied exercise, task 5 ("say which ones the checker reports") is ambiguous because of cascade errors, and the key misstates one rule.**

*Evidence (re-run reproduces the recorded diagnostics)*
- The seeded file (`invalid_exercise_microgrid_seeded.sysml`) reports nine errors.
- Two of them sit at line 11, *inside* the attribute definition that carries defect 3: "Couldn't resolve reference to Type 'Boolean'" and "An attribute must be typed by attribute definitions".
- Line 16 also fails ("Couldn't resolve 'STK-002'").
- All three are consequences of defects 1 and 2: the import failed to parse and the short name failed to parse.
- A student can reasonably answer "the checker flagged GridStatus", that is, defect 3.
- The key (`exercise_microgrid_key.sysml:2–3`) justifies defect 1 with "an import owned by a root namespace must be private (S06 p.63)". The import at line 5 is owned by `package CampusMicrogrid`, not by a root namespace, so that rule does not apply. The applicable rule is "visibility must be shown on imports" (R70 sl.6; R80 p.61).
- Tasks 1–5 (skeleton, five stakeholders, six concerns, a keyword-tagged dependency with its metadata definition, an eight-row mapping with reasons, three-defect analysis) are budgeted at 35 min. That is optimistic for a first hand-written model.

*Failure scenario.* Graders disagree on task 5, and the key teaches a misapplied rule.

*Fix*
- Add to the brief: "fix defects 1 and 2, re-run, and report what remains". The answer is then PASS with no message, which isolates defect 3, the intended point.
- Correct the key's defect-1 rationale.
- Budget about 50 minutes, or drop task 3's metadata definition (allow a plain `dependency` with a comment).

**m6. The generator emits a failing file, with no finding, for some unusual but valid names (name shadowing).**

*Evidence (probe, checker run on the outputs)*
- **P1** (stakeholder named "Context"; external system named "context") → **FAIL, 9 errors**:
  - `Context::'ENT-001'` inside the Stakeholders package resolves `Context` to the stakeholder part definition, not the package. Every concern subject fails ("Couldn't resolve reference to Type 'Context::'ENT-001''").
  - `part <'EXT-001'> context : 'context'` inside `part context` fails with "must be typed by occurrence definitions".
  - The tool's findings list nothing for either.
- The same mechanism applies to an external system defined as "Physical" (it shadows `Physical::soi`).
- Everything else in P1–P4 passed:
  - quotes, backslash, `*/` and `/*`, tabs, CJK, `Ångström`, emoji;
  - the reserved word "part" (emitted as `part_`);
  - a blank stakeholder name;
  - 60 stakeholders with all seven relationship types;
  - a record with no context, relationships, inside elements, purpose or enterprise name;
  - duplicate names (PASS with the warnings the tool predicts).
- The reserved-word list matches S06 8.2.2.1.2 exactly.

*Failure scenario.* Rare, but the tool promises that only a real defect blocks a file. A team that hits this sees nine checker errors pointing at lines it did not write, with no finding to explain them.

*Fix.* Either:
- emit root-anchored references (qualify through the root package name);
- or add a `name-shadow` gap finding when a stakeholder or external-system name equals `Context`, `Physical`, `Stakeholders` or the context usage name.

Add both cases to `skeleton.test.ts` and the stress file.

### Minor

**n1. The Evolution package is promised but absent.**
- INC (roadmap increments) maps to package `Evolution` (`labBrief.ts:62`; `session2.ts:366, 827`).
- `MODEL_PACKAGES` (`labBrief.ts:72–82`), the generated skeleton and the mapping figure have no such package.
- This contradicts "every later package present with the week that fills it".
- Fix: add `Evolution` (filled in Week 14) to `MODEL_PACKAGES` and the generator, or say that INC's package is created in Week 14.

**n2. The listing attribution renders badly on slide faces.**
- `LectureWeek8Code.tsx:63` strips `^S10 (` and a trailing `)`.
- Four listings render "Quoted from textual-notation training deck, Release 2026-08, CC BY 4.0), slide 9" with a stray ")".
- The concern listing renders "Quoted from adapted from S10 (textual-notation …), slide 115 (one spelling of the stakeholder name". That text has a doubled verb, the internal code S10 and an unbalanced parenthesis.
- Fix: store a display string per listing.

**n3. Internal source codes reach students.**
- Generated model comments read "(S10 slides 108-109)" and "(S10 slide 108)" (`skeleton.ts:364, 375`).
- They reach every team's exported file and the AeroLink model shown on the Examples page.
- This is the same class of leak as Week 2's N19.
- Fix: write "SysML v2 textual-notation training deck, slides 108–109".

**n4. The slide face overstates the default multiplicity.**
- The bullet "Default for an owned part usage: 1..1" (`session1.ts:557`) omits "without explicit subsetting or redefinition". The notes (`:563`) and R80 p.73 state that condition.
- A subsetting usage without a multiplicity inherits the subsetted one; it does not take 1..1.
- Fix: put the condition on the slide.

**n5. Page slips.**
- The subsetting slide cites R80 p.64 for "a subsetting usage is an additional feature" (`session1.ts:614, 617`). The sentence is on p.65.
- The imports lesson lists R80 p.77, which is Attributes, among its sources (`session2.ts:799`).
- Fix: correct the pages.

**n6. Quiz cueing is weak but present.**
- Keys are balanced (a/b/c/d = 3/3/3/3) and length ranks are balanced (3/3/3/3).
- The key is the unique longest option in 3/12 items and the unique shortest in 3/12. Odd-one-out-by-length picks the key in about 3/12, so the length cue is acceptable.
- Remaining cues:
  - Several distractors are throwaways (Q1d, Q2d, Q4d "Ward is a usage of icu", Q12d), leaving effectively three options.
  - Absolute qualifiers ("always", "only", "exactly", "Nothing … until", "entirely") appear in distractors far more often than in keys.
  - Q3's key is the only option listing four items.
  - Q7 option c ("Some vehicles may now have six wheels") is literally true, since Vehicle already allowed 4..6.
- Fix:
  - replace the throwaways with plausible misreadings (for example Q4d "icu and maternity are specializations of Ward");
  - reword Q7c ("Every Vehicle now has six wheels");
  - even out the qualifiers.
- All items are answerable from the lecture, and all use unseen contexts.

**n7. A gap message misattributes its cause.**
- `skeleton.ts:271` says "(a Week 2 file holds only stakeholder IDs and names)".
- It also fires for a Week 1 file that simply has no concerns (probe P3).
- Fix: branch the message on the source.

**n8. Playwright flakiness under load.**
- First run: three Week 8 tests failed (`lectures-week8` viewer counter; axe light; `week8-flow` archive banner not found in 5 s).
- An isolated re-run under the lock passed all three.
- Final result: lectures-week8 4/4, week8-flow 6/6, axe "no violations".
- Likely contention with concurrent agents. Fix: give the archive test an explicit wait for the lazy page.

**n9. oxlint warnings.**
- Five `only-export-components` warnings in `LectureWeek8S1.tsx` (lines 668–812).
- Not errors; consistent with other weeks.

---

## What was checked and passed (no finding)

- **A, slides.**
  - Session 1: 24 content slides, 69 min plus a 6 min buffer.
  - Session 2: 20 content slides, 47 min lecture plus 22 min lab launch, plus a 6 min buffer.
  - Both sum exactly; I summed every `minutes` field.
  - Every slide has a purpose.
  - Slide cross-references are correct: "slides 6 and 7" (`:123`) and "slide 20" (`:815`).
  - Student `.pptx` (`dist-student/lectures/week08-session{1,2}.pptx`): 25 and 21 notes pages, 0 characters of notes. The faculty `.pptx` has 47,926 characters of notes.
  - A distinctive teach sentence and the instructor key text are absent from `dist-student/assets/*.js`.
- **B, faculty notes.** Every slide carries teach, why, transition, a timing split and a figure walk, with misconceptions where useful. The lab slides have minute-by-minute run sheets. `timing.test.ts` enforces 40–130 spoken words per minute. Weeks 9–14 downstream use is explicit (`session1.ts:152`, `:918`; `session2.ts:899`).
- **C, lesson.** The lesson is generated from the same source and its content matches the slides.
- **D, AeroLink, matched against the corrected Week 1 case** (`week01/aerolinkCase.ts`):
  - all 15 stakeholders and 17 concerns, each with its holder;
  - the 6 external systems named as systems;
  - the 8 relationships with their sources, targets and types;
  - the nine-places values: Data Sheet 20 min, REQ-STK-005 25 min, A-007 48 per 16 h day, DEC-001 chargers × 48, matching the reference data.
  - The STK-015/CON-017 deferral is declared in four places: the milestone report §8.1, the audit slide (`session2.ts:581`), the canonical-test allowlist and the AeroLink audit table. The reason (Week 12/13 counts outside this build's scope) is acceptable.
- **E/F, lab.**
  - Inputs, method, procedure, outputs, rubric rows, submission and AI rule are all present.
  - The tool refuses broken JSON, other formats, versions outside 1–3 or 1, AeroLink records, duplicate and malformed IDs, and non-list shapes, each with a message (existing tests plus my reading of `importFile`/`readWeek2`).
  - The only hard gate is a dangling relationship, which is left out and listed. Gaps never block export.
- **Workload.**
  - 2.0 h per person: 8.0 person-hours for four, 6.0 for three by reduced scope.
  - This is plausible because the generator drafts the Context and Stakeholders packages, so the work is review and correction. Students checking every generated line against the register is realistic in 2 h for 8–15 stakeholders.
  - The total of 7.9 h is plausible only once M2 is fixed and the m5 exercise time is corrected. As shipped it is about 8.9–9.1 h.
- **G, quiz.** 12 items, unseen contexts, each mapped to a slide and lesson section. Keys checked against the sources: Q4 R80 p.63; Q5 p.72; Q6 R70 sl.11; Q7 p.65; Q9 pp.49–50; Q10 R70 sl.6; Q11 R83 p.166.
- **H, register.** The citations I opened are all inside their verified ranges. The pending S06 §7.27 entry for the `#keyword` pattern is declared, and the pattern is labeled as a course convention.
- **I, web.**
  - Gates are below.
  - Faculty notes, rubric notes and the instructor key are not shipped to students.
  - Rubric row IDs (RB-8.x) are student-facing by design, as in Week 2.
- **Checker presentation.**
  - "A PASS means the file parsed, every name resolved and no rule fired" appears on the slide face (`session1.ts:781`), in the lesson, in every generated file header and on the assessment page.
  - Card 3 (an attribute definition owning a part: PASS) and the deck's own typo (instructor note, `session2.ts:445`, confirmed at R77 sl.115) are handled honestly.

---

## SysML rule spot-check (pages opened in `_source_cache` via `scripts/source_pages.py`)

| # | Claim as taught (file:line) | Cite | Verdict |
|---|---|---|---|
| 1 | SysML extends KerML; most SysML elements specialize KerML elements; SysML uses elements/relationships, dependencies, annotations, namespaces/packages, specialization directly (s1:417, 420) | R80 p.47 | Supported |
| 2 | Viewpoint = information of interest to stakeholders; view = query + rendering intended to satisfy a viewpoint (s1:344) | R80 p.48 | Supported |
| 3 | Viewpoint definition is a kind of requirement definition framing stakeholder concerns; view definition is a kind of part definition; viewpoint's subject is a view (s1:345; s2:472) | R85 p.181 | Supported |
| 4 | No system/subsystem/assembly/component constructs; an entity with structure and behavior is a part (s1:472) | R80 p.48 | Supported |
| 5 | Elements, some are relationships; deleting an element cascades through its owned subtree (s1:446) | R80 pp.48–49 | Supported |
| 6 | Element ID unchanging, tool-managed, not writable in the notation; name and/or short name instead (s1:447; s2:198) | R80 p.49; R90 sl.22 | Supported |
| 7 | Short name before name, in `< >` (s2:198) | R80 p.49 | Supported |
| 8 | Basic name: letter/underscore then letters/digits/underscore; otherwise unrestricted, single-quoted; quote and backslash escaped (s2:199; skeleton.ts:182) | R80 pp.49–50 | Supported |
| 9 | Four layers; Root = syntax without model-level semantics (element, comment, namespace, relationship, import, dependency); Core = type, classifier, feature, multiplicity, formal logic; Kernel = class, data type, behavior, function, connector, metadata; Systems = SysML (s1:406, 418) | R70 sl.3–4 | Supported |
| 10 | "Packages and imports … are Root"; Q3 key "packaging" (s1:419, 893–894; quiz:44) | R70 sl.4; KerML 7.4.14 | **Not supported** (Package is Kernel), see m2 |
| 11 | Definition classifies; usage is a usage of a definition in a context; always defined by ≥1 definition, implicitly `Part` for a part usage (s1:506) | R80 p.63 | Supported |
| 12 | The pattern's range: attributes … concerns, cases, views (s1:507) | R80 p.63 | Supported |
| 13 | One definition used in different contexts or several times in one (s1:507; Q4) | R90 sl.12 | Supported |
| 14 | Part definition: systems/parts existing in space and time; attribute definition: attributive data; part usage composite, ref part referential (s1:534–535) | R70 sl.9 | Supported |
| 15 | Attribute definition may not have composite features; attribute usages always referential (s1:535, 788) | R70 sl.9; R80 pp.64, 77 | Supported |
| 16 | Composite: integral, destroyed with container; referential: simple reference; wheels versus road (s1:536) | R80 p.64 | Supported |
| 17 | Owned usages are features; a feature relates instances of the featuring definition to values (s1:562) | R80 p.63 | Supported |
| 18 | Package-level usage is a generic feature, specializable in context (s1:562) | R80 p.64 | Supported |
| 19 | `[12]` exactly; `[4..8]`; `*` unbounded; lone `*` = 0..* (s1:563) | R80 pp.64, 73 | Supported |
| 20 | Default 1..1 for an owned part usage without explicit subsetting/redefinition (s1:563) | R70 sl.12; R80 p.73 | Supported in notes; slide face incomplete (n4) |
| 21 | Specialized definition classifies a subset; `:>` = specializes; multiple generalizations inherit all features (s1:590) | R70 sl.10; R80 p.64 | Supported |
| 22 | Abstract: instances must be instances of a concrete specialization (s1:591) | R80 p.72 | Supported |
| 23 | Subsetting: values of one feature a subset of another's, in any common context (s1:617) | R70 sl.11 | Supported |
| 24 | Subsetting usage may constrain definition and multiplicity; is an additional feature (s1:617) | R80 pp.64–65 | Supported (page slip, n5) |
| 25 | Redefinition is a kind of subsetting that replaces the redefined usage; diesel fuel example (s1:645) | R80 p.65 | Supported |
| 26 | `:>>` = redefines; new name/type; same-name shorthand `part redefines cyl[4]` (s1:646) | R70 sl.12 | Supported |
| 27 | Usages inherit and redefine at any depth of nesting (s1:646) | R70 sl.15 | Supported |
| 28 | Subsetting a usage is like specializing a definition; original unchanged; each subsetting usage a design configuration (s1:751) | R80 p.65 | Supported |
| 29 | Definition: `specializes`/`:>`. Usage: `defined by`/`:`, `subsets`/`:>`, `redefines`/`:>>`; `item x : A, B :> f :>> g` (s1:674) | R80 p.72 | Supported |
| 30 | Attribute definition = set of data values; only the kind of unit with the definition, the unit with the value; conversion (s1:709) | R80 p.77 | Supported |
| 31 | A quantity is a usage of a quantity value; ISQ quantity kinds (s1:710) | R79 sl.164, 167 | Supported |
| 32 | Package = namespace for members, container for owned members; spaces quoted; qualified name with `::` (s2:133) | R70 sl.5; R80 p.56 ("solely") | Supported |
| 33 | Definitions and usages are namespaces too (s2:134) | R70 sl.9 | Supported |
| 34 | Import forms: membership, `::*`, `::**` recursive (s2:164) | R80 p.60 | Supported |
| 35 | Import visibility always explicit; public re-exports, private not; private unless re-export needed (s2:165; Q10) | R80 p.61; R70 sl.6 | Supported |
| 36 | An import owned by a root namespace must be private (s2:166) | R80 p.63 | Supported (misapplied in the instructor key, m5) |
| 37 | Comment `/* */` is in the model, annotates the owning namespace by default; note `//` is not in the model; doc is owned by the documented element (s2:230) | R70 sl.7–8 | Supported |
| 38 | Stakeholder and concern definitions; stakeholders allowed on any requirement; subject first, omittable only without other parameters (s2:438–440) | R77 sl.115 | Supported |
| 39 | Concern declared exactly like a requirement with keyword `concern`; concerns modeled as required constraints with stakeholder parameters (s2:439) | R83 p.167 | Supported |
| 40 | Subject declared with `subject`, before any other parameter; actor/stakeholder parameters are part usages defined by part definitions (s2:440; Q11) | R83 p.166 | Supported |
| 41 | Framed concern is a subrequirement, hence automatically a required constraint (s2:471) | R83 p.167 | Supported |
| 42 | Viewpoint frames concerns; any requirement may frame concerns (s2:472) | R77 sl.116 | Supported |
| 43 | Metadata definition, annotation; `@` = `metadata`; nested features must be bound in the annotation; restrict with `:> annotatedElement` (s2:535; model:11–46) | R77 sl.108–109 | Supported |
| 44 | Dependency between client and supplier; `dependency … from … to`; extendable by user-defined keywords (s2:536) | R80 pp.50–51 | Supported as stated, **but the generated direction contradicts the client/supplier meaning on p.50** (M1) |
| 45 | `ref` part means "deleting the context must not delete the system" (s2:505, 867) | R80 pp.49, 64 | **Conflated** (ownership versus instance semantics), see m1 |
| 46 | Representative notation: `«part def» PartDef1` and `part def PartDef1;` (s1:380) | R80 p.66 | Supported |

Also opened (SEBoK and other non-SysML claims), all supported:
- R33a p.290 (OMG model definition, mapping);
- R33a pp.291–292 (abstract/concrete syntax, semantics, tool conformance, the grammar analogy, MBSE primary artifacts);
- R33b p.296 (model quality versus design quality, the chair);
- R33c p.300 (multiple views);
- R28 p.372 (nine diagram types: v1 caution);
- R28 p.373 (inconsistencies surface; out-of-date model; regular updates a minimum requirement);
- R27 p.56 (authoritative sources);
- R90 sl.7, 9 (key elements, API).

---

## Checker evidence

- **Recorded report.** `sysml/lectures/week08/week08-report.json` covers 22 files: 16 PASS, 6 FAIL, 0 ERROR. Every status matches the intended one in `listings.ts` and in the milestone report §7.
- **Independent re-run.** No java process was active. Command: `python -I scripts/check_sysml.py sysml/lectures/week08 sysml/instructor/week08 --report <scratchpad>`. Release 2026-08, kernel 0.62.0, Java 21.0.12.1. Result: **10 files: 8 PASS, 2 FAIL, 0 ERROR**, all "expected OK". The diagnostics are identical to the recorded ones:
  - stress model: two "Duplicate of other owned member name" warnings;
  - `invalid_tool_proof_unquoted_id`: 9:12 "mismatched input '-' expecting '>'";
  - seeded exercise: the nine errors discussed in m5.
- **Verbatim listings.** Confirmed by `sysmlWeek08.test.ts` (SHA-256 per file, status per file, every listing a verbatim excerpt; passes). The `listings.ts` extraction functions slice the files and never retype.
- **Probe outputs (scratchpad only).** P2 (60 stakeholders), P3 (empty optional parts) and P4 (duplicate names) PASS. P1 FAIL for the shadowing reasons in m6 only.

---

## Gate results (run from `learning-studio/`, 2026-10-19 13:08–13:45)

| Gate | Result |
|---|---|
| `npx tsc -b` | **exit 2**. Every error is in `src/content/lectures/week04/timing.test.ts` (missing `./session2`, `../../week4Path`), the concurrent Week 4 agent's work in progress. No Week 8 error. |
| `npx oxlint src` | exit 0. Warnings only (n9). |
| `npx vitest run` | 1542/1545 pass. Failures: `week04/timing.test.ts` (does not compile, Week 4 WIP) and Week 7/Week 11 activity tests timing out under load (not Week 8). Week 8 subset (13 files: lectures/week08, quizWeek8, workbench/week8, week08Lab, aerolinkCanonical, model/reference): **189/189 pass**. |
| `npx vite build` | passes (chunk-size warning only). |
| Playwright `lectures-week8.spec.ts` (own server 5198, workers=1) | 2/4 on the first run. The 2 failures passed in an isolated re-run, so **4/4**; axe "no violations" (n8). |
| Playwright `week8-flow.spec.ts` (5173, workers=1) | 5/6 on the first run. The archive-banner test passed on re-run, so **6/6** (n8). |
| Student build | `dist-student` Week 8 decks have empty notes. No Week 8 faculty-note text or instructor key text in the student JS. |

---

## Required for sign-off

1. **M1.** Fix the dependency direction convention, state `from` = dependent on the slide (R80 p.50), regenerate the three files, and add a direction test.
2. **M2.** Add a student-facing install-and-run page and an in-class checker demonstration. Remove the reference to the non-existent Week 7 task, or create the task in coordination with its owner. Correct the workload.
3. **m1–m6.** Fix as described. m1 and m2 are wording changes. m4 and m5 are lab and assessment text changes. m6 is one generator guard plus tests.
4. **Minors.** n1–n9 at the author's discretion; n2, n3 and n5 are quick fixes.
