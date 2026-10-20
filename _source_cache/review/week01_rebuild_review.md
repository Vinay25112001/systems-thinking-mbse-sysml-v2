# Independent review: commit 0f3ebcb (Week 1 rebuilt to "Team Formation / Needs / Identifying Stakeholders")

Reviewer: independent (systems engineering and interactive-course lens). Date: 2026-10-18. Read-only: no source was edited and nothing was committed.

Scope:
- Every `new-pending-review` item, and `src/content/weeks/week01.ts`.
- Every citation, checked against `_source_cache/*.txt` (SEBoK v2.14, the MITRE SEG 2014, and Seidewitz's *Intro to the SysML v2 Language: Textual Notation* 2026-08).
- The checkers, exercised in both directions with a temporary vitest probe (deleted afterwards).
- One dev server (127.0.0.1:5173, killed afterwards) with Playwright at 1440x900 and 400 px. The screenshots and text dumps are in `C:\Users\w451vxs\AppData\Local\Temp\claude\C--Users-w451vxs\d2f69355-808b-4b69-b891-131c6cae6c93\scratchpad\shots2`.

## Verdict: REVISE

The rebuild is substantial and mostly sound.

**Faculty requirements met:**
- The Overview says what and why.
- "Meet AeroLink" comes before the question and the prediction.
- All seven Learn sections run AeroLink first, then "apply to your own enterprise".
- Definitions of system, system of interest, stakeholder and stakeholder needs are quoted verbatim from the SEBoK glossary and cited correctly.
- Read-then-check is kept, and so is the readiness quiz.
- The workbench opens on a guided orientation, not a blank page.
- Every mission step shows Task / You enter / Done when.
- Check & submit states the evidence, minimum and rubric row for each Team Record part.
- The memo is gone; it is replaced by the model-inputs export.

**Verified correct:**

| Item | Pages | Result |
|---|---|---|
| R39a | PDF p.1631 | Stakeholder (glossary), definitions (1)–(4) |
| R39a | PDF p.1632 | Stakeholder Needs and Requirements (1a): the quote is verbatim |
| R39b | PDF p.1652 | System-of-Interest (glossary), both definitions; the attribution is correct |
| R38 | p.1637 | Correct, including the "expanded version" caveat (prior F05 is fixed) |
| R07 | p.815 | Enterprise, and enterprise vs organization: correct |
| R11 | pp.549–555 | Every paraphrase checks out: perspectives, integrated set, nomenclature, stakeholder list, Table 1, approving authorities, register, elicitation, rationale, MBSE trace, the "shall" rule and form, the coffee-maker examples |
| R63 | pp.234–236 | Correct |
| R53 | p.296 | Correct |

**Also verified:**
- The SysML v2 mappings are correct against slides 8, 9, 17, 20, 86–87, 100, 115 and 116: part def plus stakeholder parameter, concern with subject/stakeholder, requirement def with short name, doc, subject and stakeholder parameter, frame, item def, port def with directed features, documentation.
- Quiz key letters are a3 b2 c3 d2. In no item is the key the longest or the shortest option (computed).
- Learn checks display their keys at D, A, B, C, D, A, B.
- No check duplicates a quiz item, and every check and quiz item is answerable from the Learn text.
- No page overflows sideways at 400 px, and there are no console errors.

**What blocks sign-off is the gate on the assessed deliverable:**
- The need-quality checker rejects legitimate needs and accepts garbage (F01).
- "Ready to submit" can be reached with no instructor decision, no AI statement, generic concerns and vague needs (F02).
- Ten moderate issues need fixing in the same pass.

## Findings

**F01 · major · `src/activities/week03/needs.ts:34–64, 105–113` (used by `workbench/week1/stakeholders.ts:164` and `team.ts:188`).** The six-criteria checker gates mission 4, Team Record part 5 and "ready to submit". I exercised it with crafted inputs.

It rejects good input:
- The condition check fails on legitimate conditions: "within a week of giving", "on weekends", "in winter storms", "after each donation", and conditions field "between 22:00 and 06:00". It also fails SEBoK's own taught form, "The users need the system to keep coffee warm for an hour after brewing".
- The solution check scans the stakeholder name too: "Elevator inspectors need…" and "Software maintainers need…" are flagged.
- It flags ordinary words: "Passengers **using a** wheelchair need step-free boarding at every stop", "Patients in all hospital **wings**…", "Security officers need to **screen** every bag…".

It accepts bad input (all six criteria pass):
- "Passengers need good service when possible."
- "X need y when" (rationale "a b c d e").
- "Passengers need a mobile **application**…" (only `app` is matched).
- "Riders need electric buses at all hours."
- "Nurses need barcode scanners whenever preparing a dose."
- "Riverside Food Bank Network needs more volunteers at every shift." This is the team's own system of interest named as the party in need.

Eight copies of "Stakeholder n need good service when possible" complete part 5.

Fix:
- Run the solution and requirement screens on the text after the attributed subject.
- Add condition cues: `within <duration>`, `on <day/weekends>`, `in <season/weather>`, `between <time> and <time>`, `after/before each|every`, `per`, `for each`.
- Add `application`, `system` as an object noun, and `should|has to|have to|will provide`.
- Reject the proposal's own name or SoI as the subject.
- Require a minimum content length after the subject.
- Add every case above to `team.test.ts` as accept/reject pairs.

**F02 · major · `src/workbench/week1/team.ts:121–122`; `learn/week01.ts:666, 670, 673`; `flow/CheckSubmit.tsx:128–132`.** The Team Record's stated evidence and the "ready to submit" gate disagree.
- `checkProposal` passes with decision **pending** and no date ("Proposal complete; take it to the instructor"). It also passes with **revise**, and with the date 2099-99-99. Yet TEAM_RECORD says "decision recorded" and "The proposal must already carry the instructor's decision".
- Part 6, the AI usage statement, is a required part, but the readiness checklist does not include it. "Ready to submit" shows without it (UX pass, finding 6).
- With F01 and F03, a record with eight generic concerns and eight vague needs reaches `partsComplete = true` (probe).

Fix:
- Make the export step and "ready" require `decision === 'approved'` and a valid past date.
- Add the AI statement as a field or explicit tick in the Team enterprise view and the checklist.
- Say "five parts plus the AI usage statement" consistently. The Overview figure says "five parts".

**F03 · moderate · `src/workbench/week1/stakeholders.ts:74–83` and `activities/week02/register.ts:31–60`; overclaim at `learn/week01.ts:341`.** The concern screen treats any word outside its lists as specific. All of these pass as specific: "They are concerned about overall safety and costs", "Residents are unhappy about noise and safety", "Insurers want a safe and reliable service in general", "Investors worry about financial performance and returns". A register of eight such concerns passes part 4. The L5 apply text promises "Its check rejects generic concerns such as 'wants safety'". The facilitation note admits the screen is lexical, but students are not told.

Fix:
- Require at least one specificity marker: a number or time, a place, an affected subgroup, or an outcome verb and object.
- Or downgrade the screen to a warning plus the instructor's judgement.
- Reword L5's apply text to say the check catches only the most generic phrasings.

**F04 · moderate · `src/workbench/week1/team.ts:303–325`; `TeamView.tsx:77`; `team.ts:164–185`.** `importModelInputs` throws when an array field has the wrong shape:
- `context: {}` throws "(d.context ?? []).map is not a function".
- `inside` as a string throws.
- `sources` as a string throws.
- `stakeholders: [null]` throws.

The async handler does not catch, so the student gets no message. The import also accepts eight stakeholders all with ID STK-001, and `checkRegister` passes duplicate IDs. That breaks the stable-ID rule the week teaches. The AeroLink rejection does survive import (part 2 fails afterwards).

Fix:
- Wrap the import in try/catch with a clear message, and coerce non-arrays to `[]`.
- Reject duplicate IDs both on import and in `checkRegister`/`checkContextPart`/`checkNeedsPart`.

**F05 · minor · `team.ts:79, 87, 90–107`.** Other validator edges:
- The single-sentence check splits on "U.S." and "e.g.", so it rejects good SoI statements.
- One person can hold all four roles with the prefix "JS: XX", and that passes.
- Nonsense prefixes ("ZZ") pass. Nobody has to own the Week 1 prefixes ENT/EXT/STK/CON/NEED.
- Lowercase prefixes ("JS: stk") are rejected.
- `isAeroLink` rejects a contrast such as "Unlike AeroLink, we…" in the purpose. It misses AeroLink in the domain and inside fields, and it misses near copies ("SkyHop Urban Air Mobility"). The instructor gate covers the near copies.

Fix:
- Use a sentence splitter that ignores abbreviations.
- Require distinct members for a team of three or more, and require each of ENT, EXT, STK, CON and NEED to be owned.
- Make the prefix match case-insensitive.

**F06 · moderate · `src/content/missions/week01.ts:29–34` (shown on the Overview prediction).** The prediction leaks its key:
- The only elaborated option uses the lesson's own vocabulary: "No: it misses people who approve, block or are affected by it".
- The others are strawmen.
- "Meet AeroLink", directly above, lists the external organizations AeroLink depends on.

Fix: use neutral options ("Yes" / "No: add more users or customers" / "No: add other kinds of party" / "Cannot tell"). Better, make it generative: "Name up to three parties the list is missing", and compare in mission 1.

**F07 · moderate · `src/content/week1.ts:117` (kept block w1-worked, shown in L3 worked bullets 0–3 at `learn/week01.ts:173`); `exports/curriculum/student/week01.md:105`; `exports/curriculum/student/draft-week01.md`.**
- Students read "This is the resolution the Week 1 explorer uses". The Week 1 explorer no longer exists.
- The student archive page (route `#/draft/1`, and the export) still shows the old graduate task: "use the AeroLink dynamics explorer to identify a leverage point and defend it in a one-page memo". It also reuses the IDs B1.1–B1.4 with different meanings, and B1.3 says "behaviour".

Fix:
- Show bullet 2 without its last sentence. The block was reviewed, so use a `sentences` cut or a pending-review override.
- Exclude draft-week01 from the student edition, or prefix its objective IDs (for example old-B1.x).

**F08 · moderate · `src/App.tsx:42, 69, 198`; `src/content/rubrics.generated.json:53` (RB-1.1); the RB-2.5 and RB-1.3 cells as rendered on Check & submit.** AeroLink framing is left in the shell and the rubric:
- The workbench header reads "AeroLink Workbench", with breadcrumb "AeroLink › … › Own: your team's Week 1 Team Record", directly above "Your team's own enterprise, not AeroLink".
- The classic page brands itself "Air Taxi Enterprise Learning Studio", with a nav item "AeroLink engineering model".
- RB-1.1 Beginning: 'Boundary … equal to "the aircraft"'. This is AeroLink-specific, applied to the team's enterprise.
- RB-2.5 shows "AROU" and "CAP → NEED", which Week 1 never introduces.
- RB-1.3 renders literal `**with rationale**`.

Fix:
- Use "Practice workbench", or the team's enterprise name in mission 5.
- Use neutral brand text.
- Change RB-1.1 to "a single product".
- Add a Week 1 note that AROU and CAP are not yet in scope.
- Strip or render the Markdown.

**F09 · moderate · citations that do not support their claim.**
- `quizWeek1.ts:21`: w1q-1 (owned ID prefixes) cites R11 p.553. That page says nothing about prefixes, and the note admits the point is a course convention.
- `quizWeek1.ts:65`: w1q-5 (the course's proposal criteria) cites R07 p.815.
- `learn/week01.ts:335`: c5 (a checkable concern) cites R11 p.553. Concern specificity is the course rubric, RB-1.3.
- `learn/week01.ts:317`: the key term "Concern" is sourced to R39a p.1631, but the glossary only says "concerns relative to a system" and gives no definition. The definition is R77 sl.115: "a specific topic that one or more stakeholders desire to be addressed".
- `weeks/week01.ts:352`: the misconception about avoiding "shall" cites R11 p.549. The "shall" rule is on p.555.
- `learn/week01.ts:766`: the actor seed says "in a use case or requirement", but R76 sl.100 supports use cases only.

Fix: mark the convention items `source: 'course'` / cite RB-1.3, use p.555, and drop "or requirement". Optionally cite R77 sl.115 (labeled as a Phase II reading) for "Concern".

**F10 · moderate · `weeks/week01.ts:376–385`, `learn/week01.ts:581–591`, `missions/week01.ts:269`.** 8.0 h is not yet credible as a claim:
- "Team Record out of class (mission 5, team share) 2 h" does not say whether that is per student or team wall-clock time.
- The out-of-class work is substantial: finish a register of eight or more rows (Session 2 gives it 30 minutes, shared with the context), write eight or more needs, write the AI statement, and coordinate by JSON import.
- With F01's false rejections, students will iterate against the checker.
- Session 1 sends teams away to "bring two candidate enterprises to Session 2" (`weeks/week01.ts:334`). That work is not budgeted.
- The total lands exactly on the 8 h budget.

Fix:
- State "per student".
- Add a 0.3–0.5 h row for preparing the candidate enterprises.
- Either raise the Team Record share to about 2.5–3 h (and say the week runs at about 8.5–9 h), or cut a minimum (for example six needs from four stakeholders).
- Keep the FD-22 time log and revisit after the pilot.

**F11 · moderate · `learn/week01.ts:760–772`, `team.ts:285–300`.** The model-inputs export is missing engineering data the lessons say to capture:
- **Need priority.** L6 teaches "ask for rationale and priority" (R11 p.553), but there is no field for it.
- **NEED → CON link.** The export seeds `frame` but records no concern per need. The link is only inferable because the course forces exactly one concern per stakeholder (CON-nnn = STK-nnn). That also contradicts "one or more stakeholders" in a concern (R77 sl.115).
- **IDs for inside elements.** They have none, so the part usages have no stable IDs.

The Phase II slides cited in the map lie outside the Week 1 register. They are labeled "Phase II reading (Week 8 on)", which is acceptable per prior F08.

Fix:
- Add `priority` (and optionally `concerns: CON-…`) to NeedRow and the JSON.
- Allow several concerns per stakeholder, with their own CON IDs.
- Give inside elements IDs (for example PRT-nnn), or say they are named only.

**F12 · moderate · `weeks/week01.ts:40`; `learn/week01.ts:119–122`; `week1.ts:117`.** The terminology is muddled where precision matters most:
- L2 teaches that the enterprise is wider than the system of interest, yet the system of interest is named "the AeroLink **service enterprise**".
- The figure "Three scopes" then contrasts the "service enterprise" (SoI) with "the AeroLink enterprise in SEBoK's sense".
- Students also write an "enterprise proposal" containing an SoI.

Expect confusion between SoI and enterprise at the Session 2 checkpoint.

Fix: rename the SoI "the AeroLink air-taxi service", and add one sentence: "your proposal names the enterprise and, inside it, the system of interest your team will engineer".

**F13 · moderate · `flow/CheckSubmit.tsx:37, 89, 163, 233` (`lf-table-wrap`), at 400 px.**
- Three tables scroll sideways inside their wrappers (452/366, 576/366, 491/366), with no cue that they scroll.
- The rubric caption is clipped mid-word ("judged agains…").
- The JUDGED BY column shows only "RE".
- The page is 16,568 px tall.

Screenshots: `shots2/crop-check400-1.png`, `-2.png`, `10-check-empty-w400-full.png`.

Fix:
- Move the captions out of the scroll wrapper.
- Below 600 px, render the hand-in and rubric rows as cards, as the practice plan already does.
- Collapse the rubric, the model-inputs map and the graduate review into `<details>`.

**F14 · minor · `workbench/week1/stakeholders.ts:123–135`, `missions/week01.ts:113–137`.** The identify and classify steps complete with any answers: marking all 14 candidates wrong, or classifying 0 of 18 correctly, still completes the mission and counts toward "Practice complete". This is formative, but it is weak evidence for the readiness signal.

Fix: require a second pass on the mismatched rows (re-answer, or acknowledge each explanation) before the step turns green.

**F15 · minor · UX details from the Playwright pass.**
- `SiteGuide.tsx:112` labels mission 2 "2. Worked"; the plan and the brief say "Guided". The diagram's labels are about 5 px at 400 px.
- `MissionBrief.tsx:276`: "1 more step appear" should be "appears".
- Mission summaries are line-clamped mid-word. The M5 summary is cut exactly where it explains the teammate import.
- The model browser shows green dots beside "incomplete".
- The stepper marks "Check" done before the student opens it.
- The "Practice complete" banner appears twice at 1440 px.

Fix: correct each of these as listed.

**F16 · minor · American English.**
- `src/App.tsx:114`: `aria-label="Colour theme"` is read aloud by screen readers.
- `src/export/curriculum.ts:141`: the student export's lab table header reads "Artefact".
- `learn/week01.ts` and the `artefacts` keys are internal, so they are acceptable.

Fix: use "Color theme" and "Artifact".

**F17 · minor · graduate pitch and ordering.**
- w1q-2 (whether SEBoK's wording of 15288 is "expanded") tests citation trivia, not engineering judgement. Replace it with a transfer item, for example choosing the SoI for a given question in a new domain.
- The Overview's third paragraph (`OPENER.how`, `learn/week01.ts:514`) names AeroLink before "Meet AeroLink". It is glossed as "the instructor's worked example", so this is acceptable. Better: "a worked example introduced below".

## Faculty requirements

| Requirement | Status |
|---|---|
| Overview explains what and why | Met |
| AeroLink introduced before use, incl. predictions | Met (F17 nit); the prediction leaks its key (F06) |
| Each lesson: AeroLink example, then own enterprise | Met: every section has a worked AeroLink example and an `apply` paragraph |
| Sourced definitions of system, stakeholder and need; key terms sourced | Met and verified; some convention items carry borrowed citations (F09) |
| American English | Visible Week 1 text is clean; F16 residue |
| Read-then-check; readiness quiz | Met |
| Guided studio introduction, no blank page | Met (F15 diagram nits) |
| Exact tasks and completion criteria; Mission Brief findable | Met in the brief. The completion gates are unreliable (F01, F02, F14) |
| Team Record states its evidence | Stated; not enforced (F02) |
| Memo replaced by needs and SysML v2 engineering data | Met; data gaps (F11) |
| Graduate-appropriate, no unrelated workload | Loops and the explorer are removed. Workload claim (F10) |

## Counts

Blocker 0 · Major 2 (F01, F02) · Moderate 10 (F03, F04, F06, F07, F08, F09, F10, F11, F12, F13) · Minor 5 (F05, F14, F15, F16, F17).
