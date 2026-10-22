# Week 1 Milestone M4 part B: independent review

Date: 2026-10-21. The review was read-only and adversarial. It covers the 17 authored Learn sections (`learning-studio/src/week1/learn/authored.ts`, placed by `textbook.ts`), IF-6 (`StakeholderMap.tsx`, section 7.3), IF-7 (`ProgressiveTrace.tsx`, section 10.2) and the five new register entries (R39y, R39z, R110, R111, R112).
Method: every source quotation and every paraphrased sourced claim was re-checked against the page text in `_source_cache/*.txt`, using my own extractor (whitespace and soft hyphens normalised). Case-derived values were checked against `week01/aerolinkCase.ts` and `week02/aerolinkCase.ts`. The Learn model was rendered with the student text transform, and the section word counts were recomputed. I also ran `npx tsc -b`, `npx vitest run src/week1 src/content` and `npm run build:student`. Playwright was not run: the builder's 49 screenshots and `m4b-proof.json` were inspected instead, and the figure code was read.

## Verdict

**PASS WITH CONDITIONS.**

The source integrity of the quotations is good. All 21 source-attributed quotations are verbatim on the cited page. The five register entries went through the pipeline correctly, with the right titles and pages. AeroLink values are read from the case data. IF-7's MGO-004 step is correct. No SysML semantics are claimed. The student build and leak check pass.

The conditions before faculty sign-off are:

- **One major source claim is false.** Section 3.1 says "SEBoK gives no definition of its own" of systems thinking. In fact the SEBoK glossary defines it on p.1660, with three attributed definitions. This is the same class of error the builder found for mission and traceability.
- **Five moderate findings:**
  - repetition, and an order that runs ahead of the reader, in 4.3;
  - the interest-versus-concern convention in 7.2 contradicts the sources it quotes;
  - the "is affected by" definition is ambiguous, and IF-6 draws its arrow the opposite way to the other relationship types;
  - the stakeholder row of the 10.5 model-input table contradicts A25;
  - the closing paragraph of 10.5 repeats text and uses "become" wording that 9.2 warns against.

None of these needs new architecture. All are text or data edits, plus at most one new register entry (the Systems Thinking glossary).

## Checks run

| Check | Result |
|---|---|
| `npx tsc -b` | Clean, no output. |
| `npx vitest run src/week1 src/content` | **836 of 837 pass, 1 FAIL**: `src/content/missions/missions.test.ts:66`, "w1-m1-who: workload line 'Optional practice: AeroLink missions 1–4' … expected 1, got 0". The cause is outside M4b. `src/content/weeks/week01.ts` was modified at 20:16:30, after `M4B_REPORT.md` was written at 20:15:11. Its optional row now reads "Optional practice: Guided Practice on AeroLink, six tasks" (line 406), which looks like the M5 stream. The missions file still points at the old row name. This blocks integration, and the owner of week01.ts must reconcile it. |
| `npm run build:student` + leak check | **PASS**: 20 student surfaces and 30 Guided Practice surfaces, no banned string, faculty gap list empty. |
| Rendered Learn text, student transform | No R/S codes, no gap or placeholder text, no internal codes (M4b, G-numbers, §, A2x, IF-n). "Goal" survives only in quotations and in attributed SEBoK paraphrase: the 10.5 table renders "Mission and objectives (MGO)" and "the objective it serves". Section word counts equal the builder's table, and the total is 18,334. |
| Register | `readings.py:228-232` adds R39y, R39z, R110, R111 and R112 (level X, PENDING FACULTY CONFIRMATION, commented). `readings_verified.txt:146-150` reports "title found on first page (heading line)" for each, 149/150 overall, with R30 as the declared exception. `readings.generated.json` has 150 entries, and the five match on id, title and pages. I confirmed on each page that the entry heading line exists. Emergence, Mission and Purpose are each the second entry on their page, as the comment says. I did not re-run the verifier, because it writes `readings_verified.txt`. |

## Findings

Severity: **Major** means a false claim or a §20 gate failure. **Moderate** means it must be fixed before release. **Minor** means it should be fixed. **Info** means a note for faculty or the builder.

| # | Sev | Where | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| F1 | **Major** | `authored.ts:112` (3.1) | "SEBoK gives no definition of its own" of systems thinking is false. The SEBoK glossary has a **Systems Thinking (glossary)** entry with three definitions: (1) Checkland 1999, "An epistemology which, when applied to human activity is based on four basic ideas: emergence, hierarchy, communication, and control…"; (2) Senge 1990, "A process of discovery and diagnosis…"; (3) Senge 1990, "A discipline for examining wholes, interrelationships, and patterns…". The text treats other attributed SEBoK glossary entries (Purpose after Blockley and Godfrey, Emergence after Checkland) as SEBoK definitions, so by its own convention SEBoK does define the term. The IA's "No sourced definition" (WEEK1_TEXTBOOK_IA.md:100, 295) is also wrong. | SEBoK txt PDF p.1660 | Add a register entry, for example "Systems Thinking (glossary)" p.1660 (faculty approval needed), and quote at least the Checkland and the Senge (3) definitions. Reword to "SEBoK's article offers perspectives rather than one definition; its glossary records three attributed definitions". "No single agreed definition" stays true. |
| F2 | Moderate | `authored.ts:134` (4.3) vs `s1-lesson-boundary` block 5 (4.2) | Repeats existing text. 4.2 already says: "AeroLink's environments differ by stage: airspace, weather and grid in operation; factories in production; battery recycling in retirement. Each brings different stakeholders." 4.3 says it again: "other stages have other environments: factories during production, recycling at disposal, each with stakeholders of its own". This breaks §5 and §10.4 (no repeated explanation). The 4.3 title, "Operational environments across the life cycle", also promises a life-cycle treatment that the body does not give: the body covers the operation stage only. | rendered ch04-02 and ch04-03 | Delete the repeated sentence and point to 4.2. Retitle 4.3 "The operational environment", or add real content on other stages. |
| F3 | Moderate | `authored.ts:132-133`, `textbook.ts:182-183` | Order. 4.3 relies on "the immediate environment of section 4.4" and tabulates the six external systems before 4.4 introduces the four context layers and lists them. The reader meets the table before the concepts it depends on (§20 sequencing). | textbook order 4.2 → 4.3 → 4.4 | Swap 4.3 and 4.4. Content ids are stable, so only the display order changes. Alternatively, cut the forward dependency. |
| F4 | Moderate | `authored.ts:178` (7.2) | The convention "**interest** is how much a stakeholder has at stake … Interest is a magnitude, a concern is a content" contradicts the quotations in the same paragraph. In those sources interests are content: "the interests they represent" (MITRE p.234) and "a right, share, claim, or interest in a system" (15288). The ISO/IEC 26702 wording on the same glossary page, "interests in, or concerns relative to", also uses both as content. At graduate level the defensible distinction is between the *interest* (what is at stake for the stakeholder) and the *level of interest*, rated 1–5. | SEBoK p.1631 defs (1) and (3); MITRE p.234 | Define the **level of interest** (rated 1–5, with a reason) as the register field. Say that an interest is what is at stake, and that a concern is a specific topic to be addressed by the system of interest. Keep the "course convention" label. |
| F5 | Moderate | `authored.ts:185`, `StakeholderMap.tsx:26, 124` | The "is affected by" definition, "A experiences the consequences of what B decides or does; B influences A", has two clauses that can point opposite ways. Take REL-007, "City planning authority is affected by Communities (public consultation on siting)". Clause 2 holds: the communities influence the authority through consultation. Under clause 1, though, the communities are the ones who live with the authority's siting decisions. That defeats the stated aim that "two reviewers would classify the same relationship the same way". IF-6 then draws `affected-by` with the arrowhead from source to target, authority to communities, which reads visually as "the authority acts on the communities". For regulates, funds and supplies the arrow follows the direction of influence. No legend explains the arrowheads. | screenshot `m4b/if6-default-1440.png` (link 7); case `RELATIONSHIPS` REL-007 | Keep one clause ("B's decisions or actions influence A"). In IF-6, either reverse the marker for `affected-by` (arrow points toward the influenced party, consistent with the other types) or add a one-line legend: "arrow = direction of influence; no arrow = mutual". |
| F6 | Moderate | `authored.ts:247` renders `MODEL_INPUTS` (`src/content/learn/week01.ts`) | The 10.5 table's Stakeholders row reads "ID, name, classification, **influence**". A25 (3) makes **interest** required and influence optional, and the new 7.2 says the same: "interest with a short reason is required; influence and support are optional". M4b now shows this contradiction to students. The data is not M4b's, but M4b surfaced it. | DECISION_LOG.md:34 (A25); rendered ch10-05 | The data owner should correct the MODEL_INPUTS row to "ID, name, classification, interest (with reason); influence and support optional". It should also mention the ratings as Week 8 metadata, as `week08Lab.ts:111` does. |
| F7 | Moderate | `authored.ts:248` (10.5) | "Week 2 uses the same records first: needs **become** stakeholder requirements traced by need identifier …". This repeats `s2-l-bridge` ¶1 in the same section ("Requirements are then transformed from your needs and traced to them by NEED ID"). The word "become" also contradicts 9.2, "The transformation is analysis, not rewording". | rendered ch10-05 | Delete that clause, or say "needs are transformed into stakeholder requirements (REQ-STK) by analysis". Keep the new clauses about actors and the uncertainty register. |
| F8 | Minor | `authored.ts:228`; `ProgressiveTrace.tsx:42, 54` | "Objective **refines** mission" is not one of the §14 relations. The report flags only IF-7's "states the mission", not this row in the 10.2 table. "Refine" is also a SysML keyword (the refinement relationship), and it appears in the very section that says no SysML semantics are claimed. SEBoK's own verb is "elaborated" (R10 p.543, quoted in 5.4). | directive §14; SEBoK p.543 | Use "elaborates": "MGO-004 elaborates MGO-001". Label the row as an addition to the §14 list. |
| F9 | Minor | `authored.ts:111` (3.1) | Overstated. MITRE says systems thinking "is often used in problems in which cause and effect are not closely related in space or time…". The text says it "is most needed where…". | MITRE p.46 | Write "is often used where …". |
| F10 | Minor | `authored.ts:151` (5.3) | "No source in the course collection defines *assumption* … for this use". The qualifier saves the claim, but MITRE p.533 (life-cycle cost estimation) says: "Assumptions are statements that are used to limit the scope of the model. They are a 'given' as opposed to a 'fact.' They usually relate to a future occurrence and therefore contain uncertainty." That supports the course meaning and is not in the register. | MITRE txt PDF p.533 | Optionally cite it as supporting evidence, with a register addition, or leave the claim as is. Faculty choice. |
| F11 | Minor | `authored.ts:77` (1.4 table) | The row "Definitions, methods and quotations — **Real** — From the course collection" misleads. The same textbook labels several working definitions as course conventions: interest, assumption, unknown, the seven relationship types, the identifier rules and the suitability criteria. | rendered ch01-04 | Write "Sourced definitions and quotations: real, cited by page. Course conventions: labelled where they appear." |
| F12 | Minor | `authored.ts:100` (2.4), `:168` (5.4) | Small repetitions. 2.4's "The definition adopted in section 2.3 builds purpose into what a system is" restates 2.3's "It builds *purpose* into what a system is". 5.4 restates two points from the existing 5.3: R11 p.554 (the integrated set reflects the MGOs) and BMA outputs including the major stakeholders. | rendered ch02-03 and ch05-03 | Trim them to back-references. |
| F13 | Minor | `textbook.ts:199` | The "Assumptions and unknowns" subsection sits inside 5.3, whose title is "What Business or Mission Analysis hands over: problem, mission, objectives, stakeholders". The title does not signal the subsection, so a student scanning the contents will not find it. | — | Add "…, and what is not yet known" to the title, or mark the subsection as optional (see the workload section). |
| F14 | Minor (accessibility) | `ProgressiveTrace.tsx:167, 170`; `StakeholderMap.tsx:140` | IF-7: pressing **Step** at step 6, or **Show all**, disables the button that has focus (`disabled={step >= LAST}`), so keyboard focus falls back to `<body>`. This was inferred from the code, not observed in a browser. In IF-6's expanded dialog every node has `tabIndex=-1`, so the expanded view can be looked at but not used from the keyboard; the inline figure still works. At 1440 px in IF-7, the "supports" label touches the dashed "maps to" diagonal. | code; `m4b/if7-default-show-all-1440.png` | Move focus to "Start over", or to the status line, when a button disables itself. Optionally use `aria-disabled` instead of `disabled`. Nudge the label. |
| F15 | Minor | `authored.ts:58` (1.3), `:103` (2.4) | 1.3 uses "the wider system of interest" in chapter 1, before 4.4 defines it (§10.1: "do not assume prior knowledge"). 2.4 cites section 9.4 for "needs are written about the whole service rather than about a part", but the level discussion is in 9.5. | rendered ch09-04 and ch09-05 | Gloss the term in 1.3. Cite "sections 9.4–9.5". |
| F16 | Info | M4B_REPORT §2 | The report says "35 of 35" quotations were checked with the builder's scratch `quotes.py`, which is not in the repository. I count **21 source-attributed quotations** in `authored.ts`, plus 6 quotations of case data or worked examples. All 21 are verbatim on the cited page (table below), so the count of 35 cannot be reproduced. | `grep -o '“[^”]*”' authored.ts` | The builder should publish the list behind the 35, or correct the number. |
| F17 | Info | `content/weeks/week01.ts:387` | The faculty note still says 13,311 words and 8.1 h. The builder flagged this. It is also the file a concurrent writer changed after M4b (see Checks run). | — | Reconcile at integration. |
| F18 | Info | `authored.ts:101` | The Emergence quotation stops after the first of the definition's two sentences. It ends on a sentence boundary, so it is acceptable, and the Discussion is paraphrased correctly. | SEBoK p.1491 | None needed. |

### Things checked and found correct

- **Mission, goals and objectives handling (5.4).** The glossary meaning of mission (a system's top-level function) is set against BMA's enterprise usage. BMA's mission → goals → objectives levels are quoted exactly, and the course's single "objectives" level is stated, with the A25 note in 5.3. This is graduate-level work.
- **The undefined-term claims for problem statement, interest, unknown and the relationship types hold.** SEBoK's "Problem (glossary)", p.1594, is Conrow's risk-sense definition ("a concern that has a probability of occurrence equal to one…"), not a definition of a problem statement. A footnote saying so would pre-empt a sharp student. No glossary entry exists for Interest, Concern, Goal, Objective, Assumption or Unknown.
- **R13 p.565.** TBD is used "when a value is unknown" and TBR "when … confidence is low"; tracking shows maturity; "TBXs can lead to risk"; and the traceability relationship model is defined at the start of the project. Every paraphrase is exact.
- **R10 pp.543–545.** The mission statement and the "why"; the outputs, including traceability to the preferred solution classes (p.544); the four steps ending in stakeholder concurrence, with the coffee-maker example (p.545); and the success and measures questions (p.545). All exact.
- **The rest of the sourced paraphrases are exact:** R03 p.268 (Hitchins "key"; the open system), R03 p.271 ("reducing variety … less than the sum of the parts"), R02 pp.264–266, R50 p.45 (Senge and Bar-Yam attribution), R52 p.302, R11 p.554, R23a p.635 and R39y's Discussion.
- **FAA as real, AeroLink as fictional.** The A25 note comes first in 1.4. The table classes the FAA as "A real regulator, named for realism". AeroLink's numbers come from `CASE_FACTS` and `NOISE_AGREEMENT`, not retyped. Counts are computed: 15 stakeholders, role groups 3/3/1/2/5/1, 4 objectives, 5 scenarios, 6 external systems, interest 5 for four stakeholders, and only STK-011 without a need.
- **The split-needs claim in 10.1** (NEED-016 and NEED-017 as the second halves) matches `session2.ts:939` and the `aerolinkCase.ts:24` header.
- **The 4.3 cross-reference** "its operator is not in the register (section 6.3)" matches 6.3's text.
- **Week 2 and Week 8 links.** The IF-7 future link is real: REQ-STK-010 derives from NEED-010 (`week02/aerolinkCase.ts:356`). In the 10.5 mapping, stakeholders become part definitions plus stakeholder usages and concerns become concerns, consistent with `week08Lab.ts:110-111`. The only exception is the interest/influence row (F6).
- **No SysML semantics are claimed.** 10.2 says so explicitly, the IF-7 caption repeats it, and 10.5 calls the targets a "course working mapping".

## Verified quotation table (21 source-attributed quotations)

Each was matched against the page text after whitespace and soft-hyphen normalisation.

| # | Section | Quotation (opening) | Register, page | Verbatim? | Note |
|---|---|---|---|---|---|
| 1 | 2.4 | "A member of a set of elements that constitutes a system. A system element is a discrete part…" | R102 p.1643 | Yes | SEBoK attributes it to "(ISO/IEC 15288:2015)", with ISO/IEC/IEEE as the source. |
| 2 | 2.4 | "key" | R03 p.268 | Yes | "According to Hitchins, interaction between elements is the 'key' system concept". |
| 3 | 2.4 | "What the system is for, and why the different stakeholders are willing to participate…" | R110 p.1599 | Yes | Blockley and Godfrey 2000. |
| 4 | 2.4 | "The principle that whole entities exhibit properties which are meaningful only when attributed to the whole…" | R39y p.1491 | Yes | First of two sentences (F18). |
| 5 | 3.1 | "The ability and practice of examining the whole rather than focusing on isolated problems" | R50 p.45 | Yes | Attributed to Senge in MITRE. |
| 6 | 3.1 | "the act of taking into account the interactions and relationships of a system with its containing environment" | R50 p.45 | Yes | MITRE writes "Y. Bar Yam", without the hyphen. |
| 7 | 3.1 | "a framework for solving problems based on the premise that a component part…" | R50 p.46 | Yes | Soft hyphen in "com-ponent" in the PDF text. |
| 8 | 3.1 | "a discipline for seeing wholes" | R02 p.265 | Yes | |
| 9 | 3.1 | "a framework for seeing interrelationships rather than things" | R02 p.265 | Yes | |
| 10 | 3.1 | "the systems approach begins when first you see the world through the eyes of another" | R02 p.265 | Yes | Churchman. |
| 11 | 4.3 | "The environment in which systems are deployed. The problem or opportunity … exists in this environment." | R111 p.1580 | Yes | Created for SEBoK. |
| 12 | 5.3 | "the result of not having accurate or sufficient knowledge of a situation" | R39s p.1668 | Yes | |
| 13 | 5.3 | "To Be Determined" | R13 p.565 | Yes | Also occurs on p.478. |
| 14 | 5.3 | "To Be Resolved" | R13 p.565 | Yes | |
| 15 | 5.4 | "The mission of a system is the top-level function of the system; the one that synthesizes…" | R39z p.1565 | Yes | |
| 16 | 5.4 | "Goals are elaborated from the mission statement to communicate what must be achieved…" | R10 p.543 | Yes | |
| 17 | 5.4 | "Objectives are elaborated from the goals to provide more details…" | R10 p.543 | Yes | |
| 18 | 7.2 | "a right, share, claim, or interest in a system" | R39a p.1631 | Yes | Definition (1), ISO/IEC/IEEE 15288:2015. |
| 19 | 7.2 | "the interests they represent" | R63 p.234 | Yes | MITRE definition box. |
| 20 | 10.1 | "The degree to which a relationship can be established between two or more products…" | R112 p.1666 | Yes | The PDF ends with "another (IEEE 1233-1998 …)", so the closing period in the textbook is editorial. Fine. |
| 21 | 10.2 | "enables an understanding of which relationships will be established and managed via traceability throughout the development of the SoI" | R13 p.565 | Yes | |

The other six quotations come from case data or worked examples, not from sources: A-008 and U-001 (from `week02 DISCOVERIES`), the NEED-010 rationale, the two "weak proposal" utterances in 11.4, and "A *type* B". The UI state "approved — changes pending re-review" matches A26.

## Workload (A26): arithmetic and candidates for optional reading

**Arithmetic is verified.**

- The Learn row is 18,334 ÷ 150 wpm ÷ 60 = **2.037 h** (`Overview.tsx overviewTime`, unrounded).
- The other required rows total 6.6 h: class 2.5, readings 0.6 (9 pp at 15 pp/h), candidate enterprise 0.3, Team Record 2.5, quiz 0.2, graduate review 0.4, time log 0.1.
- Total: 6.6 + 2.037 = **8.637 h, shown as 8.6 h**. Before M4b it was 6.6 + 13,311/9,000 = 8.079 h, shown as 8.1 h (A26). The change is +0.558 h, about 33 min.
- New words, recomputed from `authored.ts`, number about 5,075 including tables, of which 1,363 are in tables. The rendered increase is 5,023. The IA estimate was about 3,400 words of prose.

**Words that would have to be moved to optional reading for each displayed total.** The other rows stay at 6.6 h, and the Learn row is words ÷ 9,000.

| Displayed total | Learn words must be below | Words to mark optional |
|---|---|---|
| 8.1 h (A26 as accepted) | 13,950 | ≥ 4,385 (nearly all of M4b) |
| 8.2 h | 14,850 | ≥ 3,485 |
| 8.3 h | 15,750 | ≥ 2,585 |
| 8.4 h | 16,650 | ≥ 1,685 |
| 8.5 h | 17,550 | ≥ 785 |

**How I would class each M4b section.** New words are counted with citation codes stripped. "Section total" is what the student reads in the section, reused text included.

| Section | New words | Section total | Class | Reason |
|---|---|---|---|---|
| 1.2 Course framing | 170 | 241 | Essential | Short; explains how the stages fit together. |
| 1.3 The case in one place | 412 | 492 | Essential | Directive §10.1 asks for this content explicitly. |
| 1.4 Real vs fictional | 425 (303 table) | 457 | Essential | §10.1 and A25. |
| 1.5 Adapting the methods | 79 | 143 | Essential | §10.1. |
| 2.4 Elements, purpose, emergence | 454 | 449 | Essential core | The **Emergence-discussion paragraph (~103)** is extension material. |
| 3.1 Systems thinking | 402 | 398 | Essential core | The **SEBoK perspectives paragraph (~102)** could be extension once F1 is fixed. |
| 4.3 Operational environment | 459 (213 table) | 457 | Essential definition | The **table (213)** could be optional; removing the F2 repetition saves ~25 words. |
| 4.5 Owners of constraints | 97 | 184 | Essential | Short. |
| 5.3 Assumptions and unknowns | 267 | 492 | **Optional candidate (267)** | A25 already makes recording them optional in Week 1. |
| 5.4 Mission ↔ stakeholders ↔ needs | 543 (123 table) | 539 | Essential | Directive coverage item 4. The table is the text equivalent of IF-4. |
| 7.2 Interest vs concern | 151 | 224 | Essential | |
| 7.3 Relationship types | 262 (154 table) | 428 | Essential | Students need the definitions to classify relationships. |
| 8.4 Plan intro | 52 | 169 | Essential | |
| 10.1 Identifiers | 161 | 196 | Essential | |
| 10.2 Typed relations | 403 (164 table) | 401 | Essential | §14. |
| 10.5 Model-input summary | 283 (197 table) | 460 | **Optional candidate (283)** | It duplicates the chapter "Used later" rail (`rail.ts`, the same `MODEL_INPUTS`) and My Project's Week 8 preview. Removing the F7 clause saves ~20 words. |
| 11.4 Choosing the enterprise | 455 (209 table) | 499 | Essential text | The **good/weak proposal table (209)** could be optional, but it has high teaching value. |

**Candidate packages.** Faculty decides; I do not.

- **Package A** (the clearest candidates): 5.3 subsection 267 + 10.5 summary 283 + 2.4 emergence paragraph 103 + 3.1 perspectives paragraph 102 = **~755 words**. Learn becomes ~17,580 words, total ≈ 8.55 h, which still displays as 8.6 h.
- **Package B**: A + the 4.3 table 213 = ~968 words. Total ≈ 8.53 h, displays **8.5 h**.
- **Package C**: B + the 11.4 proposal table 209 = ~1,177 words. Total ≈ 8.51 h, displays **8.5 h**.
- Getting back to **8.1 h** would mean moving almost all of M4b to optional, and §10 (coverage, "do not shorten artificially") argues against that.

Context for faculty: the two largest existing sections, 6.7 (1,144 words) and 9.7 (1,424 words), are worked-example walk-throughs. If optional reading is wanted, they are larger levers than the new prose. Another legitimate faculty option is to count tables at a scanning rate rather than 150 wpm.

## Faculty items

1. **F1:** approve a new register entry, Systems Thinking (glossary) p.1660, and the reworded 3.1. Also correct the IA's "no sourced definition" record.
2. **Register:** approve R39y, R39z, R110, R111 and R112 (they verify mechanically). Note the id series: the R39 glossary letters ran out, so the series jumped to R110.
3. **Workload:** A26 is reopened, 8.6 h against the accepted 8.1 h. Choose to accept 8.6 h, adopt package A, B or C (or another), or change the rate used for tables.
4. **Conventions to confirm:**
   - 7.2 interest versus level of interest (F4);
   - the 7.3 "is affected by" definition, and the IF-6 arrow semantics (F5);
   - "elaborates" instead of "refines" for objective → mission (F8);
   - the instructor-analysis columns in 4.3;
   - the fictional 11.4 proposals and the approval wording, which already match A26.
5. **The MODEL_INPUTS stakeholder row against A25 (F6).** The data owner should fix it.
6. **Order:** swap 4.3 and 4.4 (F3).
7. **Integration blocker outside M4b:** `missions.test.ts` fails because of a concurrent change to `content/weeks/week01.ts` (20:16). Its faculty note also still cites 13,311 words and 8.1 h.
8. The two-reviewer claim check under spec §d.10 rule 4 is still outstanding. This review can count as one of the two reviewers for the source claims.
