# Independent review: commit d085935 (faculty feedback: welcome + Week 1)

Reviewer: independent (systems-engineering and course-design lens). Date: 2026-10-18. Read-only: no source edited, nothing committed.
Scope: `git show d085935`, every `new-pending-review` item and the code it touches; source text in `_source_cache/*.txt`; dev server run once (port 5179, stopped afterwards); Playwright screenshots at 1440x900 and 400 px.

## Verdict: REVISE

Most of the faculty comments are met. The welcome page is a single column; AeroLink is introduced as the reference case, with its ConOps; the L1 definition is properly sourced; key terms show their sources; the workbench has an orientation page; and the L1 team record is about the team's own enterprise. The SEBoK p.1637 citation and the SysML v2 slide and spec pages say what the commit claims they say. Three things block sign-off:
- **A16 is applied only to the new surfaces.** The reviewed assignment, lab and objective text still assigns AeroLink as the subject of the memo and the lab. That text still reaches students through the classic page, the curriculum export, the workbench "Full instruction" text and the Graduate objective (F01–F03).
- **The workload claim no longer holds.** The 100-minute AeroLink rehearsal (m5) now sits on top of the team's own-enterprise record, so the stated 9.2 h is understated (F04).
- **The model-inputs form's loop checker rejects good input.** Its parser turns away entries that are correct but typed slightly differently (F06).

## Findings

**F01 · major · src/content/weeks/week01.ts:136–155, 114–119 (assignment and lab).** The text still assigns AeroLink as the team's subject:
- Assignment: "write a one-page memo identifying one leverage point in the AeroLink dynamics model"; "say whether AeroLink controls it"; the six-heading template describes the old memo.
- Lab inputs: "AeroLink case brief (Case study workspace)", "AeroLink Data Sheet". The welcome page says the Case Brief and Data Sheet were removed.
- Lab steps: "Draw one reinforcing and one balancing loop for AeroLink"; "Use the dynamics explorer to reproduce one plateau".

Where students see it:
- `#/week/1/classic` (src/pages/WeekPage.tsx:331), which is linked from the top bar as "Classic page".
- The student edition of the curriculum export (src/export/curriculum.ts:84).
- InstructorReview.
- The rubric scope in the Overview's "Rubric scope" panel.

So a student finds two contradictory W1-A assignments.

Fix: rewrite `assignment.instructions`, `template` and `title` to match L1_RECORD and MODEL_INPUTS (team enterprise; the memo becomes the structured inputs plus justification). Re-point `lab.inputs` and `lab.steps` at the team's enterprise, with AeroLink as rehearsal. Or retire `/week/1/classic` and exclude Week 1 from the export. Then grep `AeroLink dynamics model|for AeroLink|case brief|Data Sheet` again.

**F02 · major · src/content/learn/week01.ts:587 (OPENER.canDo, Graduate) and weeks/week01.ts:89–93, 199.** Faculty item 16 moved the memo to the team's own enterprise. The Graduate objective still reads "Identify a leverage point and defend it with evidence from the dynamics explorer", and the facilitation notes expect explorer runs. There is no explorer for a team's own enterprise, and the new form asks for no explorer evidence.

Fix: change the Graduate objective to "…defend it from your enterprise's loop structure", or state that explorer evidence applies only to an optional AeroLink comparison. Align the facilitation note.

**F03 · moderate · src/content/missions/week01.ts:407–410 (m5 `submit`).** The step brief says the graded record is the team's own. But the "Full instruction" is the reviewed session note: "Upload the L1 record; note open questions for Week 2. Export the record…". A student can read that as uploading the AeroLink rehearsal. The m5 goal also says "the causal argument is read against the rubric", which implies the rehearsal is assessed.

Fix: use new instruction text for m5 `submit`, for example "Export the rehearsal for your own reference; do not upload it". Drop "read against the rubric" from the m5 goal, or say "self-check against the rubric".

**F04 · major · learn/week01.ts:632–646 (WORKLOAD) and weeks/week01.ts:214, 222.** The realistic total counts m1 and m2 on top of the budget and treats m3 and m4 as inside the 2.5 h team L1 row. m5 (100 min, missions/week01.ts:389) is not mentioned at all. Under A16, m3, m4 and m5 are individual AeroLink rehearsal: 135 of the 150 minutes in a row that must now also hold the team's real record (proposal and approval, context, loops, emergent behavior, charter). "Practice complete" requires m5.

Realistic: 8.0 + 0.8 (Learn) + 0.4 (m1, m2) + about 1.7 (m5) + about 0.6 (m3, m4) ≈ 11.5 h. The stated figure is 9.2 h.

The 1.2 h memo row also still describes "explorer analysis". The new form has 10 structured fields plus a 300-word justification about a new enterprise.

Fix: either make m5 optional or shorten it (for example 30 min, with only steps soi, context and loops), or count it explicitly. Recompute WORKLOAD from all six missions, update the caution and the workload-row label, and relabel the memo row to "Week 1 model inputs and justification".

**F05 · moderate · src/content/learn/week01.ts:83, 85, 111 (L1 definition, R38).** Verified: SEBoK PDF p.1637 gives definition (2), "combination of interacting elements organized to achieve one or more stated purposes (ISO/IEC/IEEE 2015)". It calls it "the recognized definition for systems engineers" and restricts it to engineered systems "created with a purpose which provides value to one or more beneficiaries". The von Bertalanffy definition and the INCOSE Fellows 2019 definition are also on p.1637.

Omission: the same source note says "The second definition is an expanded version of the ISO/IEC/IEEE version." The page presents the quote as the 15288:2015 wording ("ISO/IEC/IEEE 15288:2015, as given in SEBoK's glossary"), which overstates what SEBoK says.

Smaller point: the glossary entry runs to p.1638, but R38 is registered as 1637–1637. That is acceptable because nothing is cited from p.1638.

Fix: say "SEBoK attributes this definition to ISO/IEC/IEEE 15288:2015, noting that its wording is an expanded version of the standard's", and use the same wording in the key term and the quote note.

**F06 · major · learn/week01.ts:848–859 (parseLoopChain) and CheckSubmit.tsx:205–223.** Tested in both directions; reproduced in the browser (Playwright, 1440 px).

Rejects good input with "does not parse yet":
- `riders →(+) word of mouth →(+) riders: R` (no space before the colon)
- `… : r` (lower-case type letter)
- `riders -> … ` (ASCII arrows, which is what a keyboard produces)
- `→ (–)` (en dash, which word processors substitute automatically)

Accepts bad input: `a →(+) a →(+) a : R` (a repeated variable) is reported as "0 negative links, so reinforcing, as declared". The workbench's own rule flags `repeated-variable`, so the two checkers disagree.

An undeclared or unknown tag (`: X`) is reported as "does not parse" instead of "declare R or B".

Fix: accept `->` and `→`, any of `- – −`, `\s*:\s*[RrBb]`; reject repeated interior variables; give a specific message for each failure. Add these cases to modelInputs.test.ts as accept and reject pairs.

**F07 · moderate · learn/week01.ts:795–843 (MODEL_INPUTS seeds).** Checked against R70 sl.8, 9, 17, 20, 22, 27, 86–87, 92 and the OMG SysML v2.1 Beta 2 PDF p.90 and p.162.

Correct mappings:
- part def for the system of interest
- part usages for the inside elements
- external entities as parts in a context (p.90: "external entity that may directly or indirectly interact with the system")
- item def for what flows
- port def with directed in/out features
- interface def (a connection def whose ends are ports) and flow
- requirement def with subject and `require constraint`
- analysis case with objective
- attribute
- stakeholder parameter and concern def

Points to fix:
- (a) The actor concept is missing. Owners of a lever who sit outside the system of interest (the utility, the regulator) are, per p.162, an *actor* parameter: "a role played by an entity external to the subject … necessary for the satisfaction of the requirement". A stakeholder parameter is the entity with concerns. Map `leverOwner` to "actor parameter (if external and needed to satisfy it) and/or stakeholder parameter (if it holds a concern)". Mention `actor` in use cases for people in the `outside` list.
- (b) Write "documentation (`doc`)" rather than "doc comment"; the slide's term is "documentation comment".
- (c) The "Item kind" column has no guidance. Say "item (discrete) or continuous, e.g. power, data, passengers" so it actually seeds `item def`.
- (d) The form never asks for the team's question, which L1 part 2 requires and the SoI depends on. Add a "Question" field. It seeds the requirement or analysis objective, or at least documentation.

**F08 · moderate · CheckSubmit.tsx:192–196, learn/week01.ts:798–837 (register scope).** The Week 1 form cites R70, R71, R74 and R75 (Week 5+ SysML readings) and R81 and R83, which are level `I` (instructor reference: the 2.1 Beta 2 spec). Students see "R83 · OMG SysML v2.1 Beta 2, Part 1 … p.162" in a Week 1 form. That breaks the "cite only the week's register" rule and points students to an instructor-only text.

Fix: either drop the citations from the student view, showing the element names only with "taught in Week 9", or cite only R70–R76 slides and label them "read from Week 5". Remove R81 and R83 from the student view.

**F09 · moderate · src/content/course.ts:49 and src/components/Quiz.tsx:17 (American spelling).** Two British spellings are still shown to students on Check & submit:
- The objective table (CheckSubmit.tsx:54) shows "B1.3 Explain one emergent **behaviour** of AeroLink causally".
- The quiz badge renders `q.bloom` raw, so three items show "**Analyse**". `bloomLabel` is used only in the Overview.

spelling.test.ts misses both. It does not scan course.ts objectives or Quiz.tsx, and it whitelists 'Analyse' on the assumption that it is always passed through bloomLabel. Its curly-quote exclusion also skips any non-verbatim text in “…” (scenario names, for example).

Lesser instance: the workbench JSON export key "artefacts" (WorkbenchShell.tsx:187).

Fix: display the American text of the B1.3 objective in the flow, or override it; use `bloomLabel` in Quiz.tsx; add course.ts Week 1 objectives and the Quiz badge to the scan.

**F10 · moderate · src/content/quizWeek1.ts (whole file; touched in this commit).**
- Longest-option cue: in **10 of 10** items the key is the longest option, often 2 to 4 times the length of the others (q1-3: 258 characters against 55–66; q1-8: 233 against 70–81).
- Letter bias: the key is "b" in 7 of 10 items, and the Quiz component does not rotate options.
- Overlap: q1-3's key repeats almost word for word the L7 key-term definition of enterprise.

The section checks are fine: the display rotation puts keys at D, A, B, C, D, A, B. They still show a mild length cue: the key is longest in c2 (tied), c4 and c7.

Fix: trim the keys to the distractors' length and move the qualifying clauses into the explanations. Rotate quiz options as Learn.tsx:92 does, or author the keys across a–d.

**F11 · moderate · learn/week01.ts:162–163 (Figure 2 question).** Figure 2 now has a question, as faculty asked. But (a) the caption printed directly under it answers it ("Waiting time is outside A, has its charging cause outside B, and lies inside C"), and (b) it is quiz q1-6 in another form (which SoI answers the waiting-time question). The figure therefore gives away a quiz key, and the question costs the student no thought.

Fix: keep the question and move the answer sentence into the interactive reveal, so it shows only after a boundary is chosen. Then rewrite q1-6 to use a different question (for example, charging cost per trip) so it tests transfer.

**F12 · moderate · src/flow/Overview.tsx:64–97 (Overview order).** The question ("AeroLink Urban Mobility plans to add aircraft…") and the locked prediction both come before "Meet AeroLink". A first-time student predicts about a company the page has not yet introduced. The intro sentence and the question also both say "by the end of the week you … argue the answer".

Fix: put a two-sentence AeroLink identity line (what it is, the decision it faces) above the question, or move "Meet AeroLink" above the prediction. Remove the duplicated "by the end of the week" sentence.

**F13 · moderate · workbench mission list (MissionBrief, seen in the 1440x900 and 400 px screenshots).** The mission tiles truncate to "Try first:…", "Guided: …", "Guided: …", "Own: La…" at 1440 px, and to "Try fi…", "Guid…", "Own:…" at 400 px. The two Guided missions cannot be told apart, so "mission sections easy to find" is only partly met.

Fix: show a one-to-three-word short title per mission ("Predict", "Capacity", "Boundary", "Loops", "L1 rehearsal", "Quiz") on two lines, or use a vertical list.

**F14 · minor · src/flow/Practice.tsx and the orientation page at 400 px (screenshot `orient-400`).**
- The page is about 4,200 px tall. The "Open the workbench" button is only at the very bottom.
- The regions sketch needs sideways scrolling.
- The plan table's "Builds on" column is clipped.
- The region list says "left", "right" and "bottom", but at narrow widths these regions are the tabs Mission, View, Model, Properties and Problems.

Fix: add an "Open the workbench" button under the lede. At less than 640 px, render the plan as cards and name the tabs in each region item.

**F15 · minor · finished state.** The PracticeBar and MissionBrief completion states exist, but they are verified only with mocked evaluations (practice.test.tsx). No end-to-end test or screenshot reaches "Practice complete". A step the student marks done (m5 `submit`) carries no check, so anyone can click it done.

Fix: add a Playwright run that seeds mission progress to 6 of 6 and captures the bar, at 1440 px and 400 px.

**F16 · minor · src/flow/CheckSubmit.tsx:298, 338; learn/week01.ts:841.** The grading text says "the structured fields are checked for completeness before it is read", but the form only counts non-empty fields:
- A table row with no direction counts as filled.
- An unparseable loop counts as filled.
- More than 300 words only turns the counter amber.

The submission route is also vague ("submit the exported file as your course directs"), while the L1 record names the LMS.

Fix: compute completeness the way the instructor will (every row has a direction, at least one parsed R loop and one parsed B loop, a justification of 300 words or fewer) and show "ready to submit" or a list of what is missing. Name the LMS assignment.

**F17 · minor · src/content/learn/welcome.ts:69 and learn/week01.ts:507–509.** The welcome page says "every week on this site works the same way" with four stages, but only Week 1 uses this flow; BRIDGE says Week 2 is not built. The L7 figure caption and its text equivalent still say "yours to argue in **memo section 5**". The new form has no numbered sections.

Fix: say "Week 1 uses this four-stage layout; later weeks will follow it as they are converted", and change "memo section 5" to "the 'Who controls it' field of your model inputs".

## Faculty comments: satisfied?

| Comment | Status |
|---|---|
| Welcome single column; AeroLink as reference case, team enterprises; Case Brief and Data Sheet removed; §5 "How to use this site"; map unchanged | Met on the page, with the F17 wording issue. Contradicted by the classic page and the export (F01). |
| Overview: a clear question | Met; ordering issue (F12). |
| L1 definition with a cited reference | Met; attribution nuance (F05). |
| Sources for key terms | Met. "course" is used honestly for the system-dynamics terms. |
| American spelling | Partly met (F09). |
| AeroLink and its ConOps in the Overview, with how the course uses it | Met (MEET_AEROLINK; the Data Sheet values are read, not retyped). |
| Figure 2 has a question | Met in form; it leaks its answer (F11). |
| Workbench: no blank page | Met (prefetch, labeled placeholder, error boundary; no page errors seen). |
| Workbench: orientation, step clarity, finished state, findable missions | Orientation and step briefs (task, what you enter, done when) are clear. Partial on findability (F13) and narrow screens (F14). The finished state exists but is not exercised end to end (F15). |
| L1 team record about the team's own enterprise | Met on Check & submit (six parts, minimums, format, where, grading, template). Undercut by F01 and F03. |
| Model-inputs form | Built with correct core SysML v2 mappings. Defects in F06, F07, F08 and F16. |

## Counts

Blocker 0 · Major 4 (F01, F02, F04, F06) · Moderate 9 (F03, F05, F07, F08, F09, F10, F11, F12, F13) · Minor 4 (F14, F15, F16, F17).
