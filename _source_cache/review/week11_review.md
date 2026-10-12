# Week 11 independent review — SysML v2 behaviour; L11 (formative) + RID kick-off; CP4 SysML Model Baseline

Reviewer: independent adversarial reviewer (AI, Claude), 2026-10-11. No course or app file was edited. Probe files, probe reports and scratch tests live only in the reviewer's scratchpad.
Commit reviewed: `ead8f33`.
Scope:
- `src/content/weeks/week11.ts`
- `src/activities/week11.activity.tsx` and `src/activities/week11/*` (flow.ts, states.ts, rids.ts, the three components, two test files)
- `sysml/week11/*.sysml` and `sysml/instructor/week11/*`
- `docs/authoring/week11_notes.md`

Read against:
- `course.ts` (B11.1–B11.4; R72, R73, R76 sl.100–101; extension R82)
- AUTHORING_GUIDE §7 rules 1–8
- RB-8, RB-17, RB-12 and the RB-16 note
- lab plan Part B L11 and B.5
- the weekly plan for Week 11
- syllabus §11, §12 and §14
- the reference model `aerolink_v03_behavior.sysml` and its README §7
- the Week 10 and Week 12 modules

## Verdict

**REVISE (major). Not ready for sign-off.** The SysML core is accurate, and the author's probe record held up:
- All 14 of my re-run probes matched the notes.
- Every listing PASSes or FAILs as declared.
- The S06 OnOff4 clause-order claim is verified.
- The three reference-model gaps are real and are taught honestly.

The defects below block sign-off:

1. **The quiz key is heavily biased.** The key is b on 12 of 15 items and a on the other 3; c and d are never correct. The correct option is also the longest in 14 of 15. The app does not shuffle options (W11-F01).
2. **The keyed answer to q11-8 contradicts its own premise and the ConOps.** The course's own coverage checker rejects that keyed fix (W11-F02).
3. **The flow-coverage checker passes three realistic bad mappings.** These are a wrong rejoin step, a wrong branch step, and a main step skipped on the main path. The lesson nonetheless says the tool checks "whether each alternate ends or rejoins where the ConOps says" (W11-F03).
4. **The RID review is budgeted in neither Week 11 nor Week 12**, although it is 15 % of CP4 (W11-F04).
5. **The RID screens pass vague RIDs and reject well-written ones** (W11-F05).
6. **The model RIDs are inconsistent.** Their severities contradict the course's own scale, and the worked "actionable" RID's fix fails the checker as written (W11-F06, W11-F07).

**Runs:**

| Run | Result |
|---|---|
| `npx vitest run src/activities/week11 src/content src/lib` | 5 files, **117/117 pass**. The notes record 111; the extra tests come from later content tests. |
| `npx tsc -b` | **clean** (exit 0) |
| Instructor key excluded from the bundle | Yes: the glob in `src/lib/sysml.ts` line 5, and the test "nothing under sysml/instructor/ is bundled into the app" passes. |
| SysML validator | One run only. `tasklist` showed no java process before the run. Report written to scratch with `--report`. 19 files: the 14 probes, the 4 Week 11 listings and the instructor key. |

## Findings

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W11-F01 | **High** | `week11.ts` quiz; `src/components/Quiz.tsx` | **The answer letters and option lengths give the answers away.** The keys are a, b, b, a, b, b, a, b, b, b, b, b, b, b, b: 12 b and 3 a, with c and d never correct. The correct option is also the longest in 14 of 15 items, often 2–5× the length of the others; for example q11-3 is [40, **278**, 47, 66] characters and q11-11 is [36, **243**, 81, 58]. `Quiz.tsx` renders `q.options` in authored order, with no shuffle. A test-wise student who picks "b" or "the longest" scores 80–93 % without reading the items. This is the same defect class as W10-F09. | My option-length script over `week11.ts`. Quiz.tsx lines 12–47. | Rebalance the keys to about 4/4/4/3. Cut every correct option to the length of its distractors: move the justification into the explanation, and give distractors comparable detail. Optionally add a seeded per-student shuffle in `Quiz.tsx` (a lead-owned shared change). |
| W11-F02 | **High** | q11-8 option b (key) | **The keyed answer contradicts the item's premise and the ConOps.** The prompt quotes SCN-001 A2: "…or decline with the reason recorded; scenario ends", and option a is marked wrong because "this one ends the scenario". Yet the keyed fix says that if the passenger accepts the alternative, the flow should "rejoin with the new destination". That *is* a rejoin. When I typed that keyed flow into the course's own coverage tool, it fails with `alt-outcome: A2 ends the scenario but leads on to quoteFare, confirmBooking, assignAircraft, issuePass`. It also contradicts the L11 model answer ("A2: offer alternative or decline, then done"). | ConOps SCN-001 A2 `outcome: 'end'`. Scratch probe P7. | Key: "A2 ends the scenario. After the offer (or the decline with the reason recorded) the flow goes to done. An accepted alternative is a new request, not a rejoin." Then re-check the explanation. |
| W11-F03 | **High** | `flow.ts` `checkFlow` (main-order, alt-guarded, alt-outcome); lesson `w11-checker` paragraph 3; lab step 2 "Map it in the coverage tool until every error clears" | **The checker accepts realistic bad mappings, and the lesson overclaims what it checks (rule 5).** Three probes on the worked SCN-002 flow:<br>• **P1.** A2 rejoins at step 4 (re-board) instead of step 5. Zero errors; only the advisory `merge-in`. `alt-outcome` checks only that the target is reached without passing a later step, so an early rejoin is accepted.<br>• **P2.** The A3 branch is moved to just after step 1, before the intent is even filed. **Zero findings of any kind.** No check verifies that an alternate branches at its `atStep`.<br>• **P5.** The normal landing goes straight to done, so step 7 is skipped on the main path. Zero errors; only the advisory `merge-in`. `main-order` accepts *any* path from step 6 to step 7, including one through the A1 divert branch.<br>The lesson says the tool checks "ConOps coverage and order, and whether each alternate ends or rejoins where the ConOps says". The lab tells teams to iterate until every error clears, so students will read zero errors as correct. | Scratch probes P1, P2 and P5 run against `checkFlow` and the reference ConOps. | (a) `alt-outcome`: the first main-step node reached from the alternate must cover exactly `M{rejoinAt}`. (b) Add an `alt-origin` error: the decision whose guarded edge leads into the alternate must be reachable from the `M{atStep}` coverers, and not from start without passing them. (c) Run `main-order` on the main path only, excluding nodes that cover any `A*`. Add P1, P2 and P5 as mutation tests. Until then, say in the lesson what the tool does not check. |
| W11-F04 | **High** | `week11.ts` workload and cautions; `week12.ts` workload (lines 594–602) | **The graded RID review falls between the two weeks.** The Week 11 cautions say the RID review (≈ 1.5 h per student) "must be budgeted" in Week 12. The Week 12 workload has lines for dispositioning RIDs and fixing accepted RIDs, but **none for writing RIDs on the peer model**. The lab plan puts the review inside L11 "Out 4", but Week 11 spends those 4 h on the L11 behaviour (2 h) and CP4 finalisation (2 h). A deliverable worth 15 % of CP4 is therefore not budgeted anywhere, against rule 3. | Lab plan L11 row ("Out 4"; task 5). The `week12.ts` workload items. | Add "RIDs on the assigned team's CP4 model (≈ 1.5 h)" to the Week 12 workload, and rebalance it or record the realistic total in the Week 12 cautions. Alternatively, keep it in Week 11 and say the week runs ≈ 12 h. Tell the Week 12 author either way. |
| W11-F05 | Medium | `rids.ts` `hasSpecific`, `DEFECT_CUE`, `CONSTRUCT`, `CRITERION`; `logic.test.ts` rule-5 tests | **The screens pass realistic vague RIDs and reject good ones.**<br>*Vague RIDs that pass:*<br>• the discrepancy "The state machine in Behavior::VertiportWeatherStates does not fully reflect the ConOps and is incomplete." (R1)<br>• "…is not complete and is not fully aligned with SCN-005." (R16)<br>• the fix "Make closedForDay a proper state." (R13)<br>• the criterion "RB-9.9 and S06 p.999", neither of which exists (R4)<br>`DEFECT_CUE` matches any "no", "not", "but", "only" or "after". `CONSTRUCT` matches "state", "if", "do" and "then".<br>*Good RIDs rejected:*<br>• "Add two transitions: hold to closedForDay on after 2 [h]; …" (R9): `\btransition\b` misses the plural.<br>• Discrepancies that name Team K's own elements in UpperCamel or as plain state names, e.g. "State hold is never left … ForecastClear …" (R3, R11, R15). `CAMEL` requires a lowercase first letter, so `LimitForecast`, `ForecastClear` and `VertiportWeatherStates` written without a qualifier are not "specific".<br>• "S10 slide 54" (R12).<br>The tests check rejection of vague inputs only. None checks that a naturally written good RID is accepted. | Scratch probes R1–R17 through `checkRid`. | Accept plurals (`transitions?`, `states?`, …). Treat UpperCamel identifiers, and lowercase identifiers that appear in the fragment, as specific. Accept "slide/sl." and "page/p.". Validate RB-x.y against the real rubric list. For DEFECT_CUE, require a negation **plus** an element name in the same clause. Add a test set of five naturally written good RIDs that must pass, as well as more vague ones that must fail. |
| W11-F06 | Medium | `MODEL_RIDS` (`rids.ts`), answerKey item 3 | **The model RIDs contradict the course's severity scale, which RB-17.2 grades.**<br>• RID-IN-07 (A3 missing from the flow entirely) is rated **minor**. But IN-02 (A2 *steps* missing) is major, q11-10 teaches that a missing ConOps step is not minor, and the coverage tool reports a missing alternate as an *error* (`alt-covered`).<br>• RID-IN-06 (state usage exhibited by no part) is rated **minor**, although this week's L11 artefact minimum is "every state usage exhibited by a part" and the scale defines major as "below a checkpoint minimum … or breaking a thread".<br>• No model RID covers Team K's 3 states and 3 transitions, which is below the L11 minimum of 4 and 5 and is reported by the walker as an *error* (`minimum`).<br>The answer key says "accept other severities with a reason", but students calibrate on the revealed key. | `rids.ts` lines 297–298; the lab artefact minimum in `week11.ts`; `states.ts` `minimum` check. | Rate IN-07 major (semantics or completeness) and IN-06 major (traceability), or justify each against the scale in the RID text. Add RID-IN-08 for the L11 minimum (completeness, major). |
| W11-F07 | Medium | `w11-worked-rids` (RID-IN-05), `MODEL_RIDS[4]` | **The lesson's worked "actionable" RID cannot be applied as written.** (a) Its fix, "a transition from hold to closedForDay that accepts after 2 [h]", fails the checker in Team K's file, which imports only `ScalarValues`: `Couldn't resolve reference to Element 'h'` and `An after expression must be a DurationValue` (probe r11). It passes once `private import SI::*;` is added (r12). (b) It says "add a transition out of closedForDay", but one already exists (line 57, `accept ForecastClear then open;`), and that existing transition is what contradicts the state's doc ("cancelled for the rest of the day"). The lesson holds this RID up as one the owner "could make without asking you a question". | Probes r11 (FAIL) and r12 (PASS). Fragment lines 50–58. | Fix: "add `private import SI::*;`; add `accept after 2 [h] then closedForDay;` after state hold; **replace** line 57 with a transition on a next-day trigger, e.g. `accept at …`". |
| W11-F08 | Medium | q11-2, q11-3, q11-6, q11-14, q11-15; Bloom labels | **Rule 6: several items are answered by lesson sentences, and two Bloom labels are inflated.**<br>• q11-15 is the firing order stated almost verbatim in `w11-states` ("do interrupted, then its exit action, the effect and the target's entry action … then the target's do action"), but it is labelled Analyse.<br>• q11-14: "subject … bound implicitly …, while actors must be bound explicitly" (`w11-actions`), labelled Apply.<br>• q11-3: "A plain flow … says what is transferred, not that one action completes first."<br>• q11-2: the advanced block gives both the overlap and the all-false conclusions.<br>• q11-6: the advanced block gives the parallel-region fix.<br>The notes' rule-6 claim only concerns hiding probe results, not content. | Lesson text against the quiz items. | Rewrite q11-15 so students must derive the order for a case the lesson does not state, e.g. a transition whose effect sends to a port and whose source has a `do` that is interrupted, and ask which observable comes first. Turn q11-14 and q11-3 into diagnosis of an unseen listing. Relabel q11-15 Understand and q11-14 Remember/Understand, or rewrite them. |
| W11-F09 | Medium | assignment `rubricScope` and weight; cautions; RB-8.6 | **Students are not told how CP4 is scored in the week it is due.** RB-8.5 (15 points) is "an open faculty decision, see the cautions", and the cautions are instructor-only. RB-8.6 points to "pathway minimums (lab plan C.5)", which include behaviour ("1 modelled as behaviour"), while the CP4 template uses the syllabus §11 scope. The formative behaviour also sits in the graded file, so a warning in it lowers RB-8.1 level 4 ("zero errors and zero warnings, or warnings explained"). | ASSESSMENT_RUBRICS RB-8. Syllabus §11 line 325. | Propose a default now (e.g. renormalise RB-8 over 8.1–8.4 and 8.6, and measure 8.6 against the §11 CP4 scope). State in the student-facing weight that behaviour warnings and errors do not count toward 8.1 if the behaviour is in a separate file. Flag the default for faculty confirmation. |
| W11-F10 | Medium | lab steps 2–4 (15 + 15 + 10 min); Session 1 "States and links" (15 min) | **The 45-minute in-class lab is not feasible as specified.** In 15 min teams must model SCN-001 (6 steps, three alternates: A1 rejoins at step 3, A2 ends, A3 rejoins at step 5, so realistically three decisions and two merges) **and** type it into the coverage tool node by node, ticking coverage boxes and adding each succession through dropdowns (≈ 12 nodes and ≈ 18 edges), "until every error clears". In another 15 min they must build a state definition with ≥ 4 states, ≥ 5 named transitions, a guard and do/entry links, and walk two traces. Then perform/exhibit, a checker run and fixes in 10 min. States get only 15 min of instruction in Session 1. | Lab plan L11; my count for the model answer. | Say explicitly what must be finished in class (e.g. the flow skeleton and the state list) and what moves into the 2 h out of class. Or provide a starter file. Give states 20 min in Session 1 by trimming the worked flow to 20 min. |
| W11-F11 | Medium | workload lines 3 and 7 | **Two items are under-budgeted (rule 3).** (a) The graduate interaction view is ≈ 1 h *including* re-reading S06 p.137–141 (5 dense spec pages ≈ 20 min at 15 pp/h) and R72 sl.45–46, modelling ports, a conjugated interface and two performed actions, a checker run and fixes, ½–1 page, and a RID. Realistically 1.5–2 h. (b) "Online lesson (≈ 4,000 words) and the three activities" is 1.3 h. By my count the lesson is ≈ 4,330 words including tables, ≈ 1 h by the rule-3 guide. That leaves ≈ 18 min for drafting SCN-005 in the coverage tool, walking two machines, and writing ≥ 5 RIDs (the activity's own instruction). | AUTHORING_GUIDE §7 rule 3. My word count of `blocks`. | Record realistic totals in the cautions (graduate ≈ 1.75 h; lesson and activities ≈ 1.8 h), or trim: for example, the graduate task reuses the key's port definitions, and the activity asks for 3 RIDs because the lab already produces 3. |
| W11-F12 | Medium | `FlowCoverage.tsx` lines 26–27 and 50 | **"Load Team K's draft" erases the student's own SCN-005 draft.** Both are stored under `flows['ref:SCN-005']`, with no confirmation. Activity instruction 2 and the Session 1 plan both say: draft SCN-005 yourself, *then* load Team K's draft and compare. After loading, the student's draft is gone. "Clear this flow" has the same problem. | Code reading: `setFlow(TEAM_K_SCN005_FLOW)` writes to the same key. | Store Team K's draft under its own key (e.g. `teamK:SCN-005`) with a separate view, or ask for confirmation before overwriting. Add a test. |
| W11-F13 | Medium | `w11-advanced` paragraph 1 (end); q11-6 key and explanation; misconception logic | **A checker PASS is used as evidence for semantics.** The advanced block and q11-6 recommend coordinating parallel regions "by a signal that both accept", and justify it with "both forms passed the course probes". A PASS shows the text parses and resolves (p39; my r14 also PASSes). It does not show that one incoming transfer triggers accepters in two concurrent regions, and no register page says so (S06 p.139 and p.146 speak of *an* accepter accepting a transfer). The module's own central message is that a PASS is not semantic evidence. | My probe r14 (PASS). S06 p.139–140 and p.146. | Teach the change trigger on a shared attribute (S10 sl.54; S06 p.139 `when`) as the cited option. Present "one signal accepted in both regions" as plausible but not established by the course sources, or drop it from the q11-6 key. |
| W11-F14 | Medium/Low | Activity design; `RidWriter.tsx` line 112 | **The tools find most of the defects for the student, and the key is unlocked by count alone.** The coverage tool and the walker name 5 of the 7 seeded defects outright (main-order → IN-01; alt-outcome → IN-02 and IN-03; alt-covered A3 → IN-07; unreachable closedForDay → IN-05). The Evaluate-level B11.4 practice therefore mostly turns tool messages into RID form. The key unlocks after any 5 saved RIDs, e.g. one RID saved five times with different IDs (the duplicate screen does not block the reveal). No test covers the gating. | `checkFlow` and `analyseMachine` output on Team K. RidWriter code. | Hide the Team K tool results until the student has saved 3 RIDs, or seed 2–3 defects the tools cannot see (e.g. a wrong guard, a wrong FN subset). Gate the reveal on `checkRidSet` having no duplicate location or criterion. Test the gating. |
| W11-F15 | Low | `w11-actions` paragraph 2; `w11-advanced` paragraph 2 | **Three citation overclaims.** (a) "Successions out of a decision without guards leave the choice to the model's semantics" (S06 p.134). The source says the successor is chosen "(non-deterministically)". (b) "If all can be false and there is no else, the model does not say what happens next (S06 p.134, p.136)". Neither page says this; p.136 only defines `else`. (c) "Two transitions from one state on one trigger need complementary guards (sl.53)". Sl.53 says only that a guard must be true for the transition to fire. | Source pages quoted in the citation table. | (a) Say "chosen non-deterministically (S06 p.134)". Mark (b) and (c) as instructor reasoning in the `mixed` block. |
| W11-F16 | Low | q11-10, q11-12, misconception 5 (cite R06c p.388) | **The cited page does not support the claim.** SEBoK p.388 says nothing about RID fields or actionability. These items rest on the course RID convention and RB-17. | R06c p.388 text. | Keep the R06c cite only for "pre-established criteria / identify actions", and name RB-17 and the course convention in the explanations. |
| W11-F17 | Low | cautions, last bullet | **The quiz depends on the extension reading, contrary to the caution.** The caution says the quiz does not depend on R82, but the q11-15 key (exit before effect) is only in S06 p.153–154, since S10 sl.53 gives only effect-before-entry. The q11-5 key ("exactly one substate active") is only in S06 p.146. | S10 sl.52–53. S06 p.146 and p.153. | Correct the caution, or make the lesson explicitly the source of the order. |
| W11-F18 | Low | Graduate key; template section 8 | **Four weaknesses in the graduate key and template.** (a) `send new Physical::IntentDecision()` leaves `accepted` unset, so the guard `awaitDecision.decision.accepted` reads an unset value. (b) S06 p.138: the receiver of a send via a port is "determined by interface connections having the port usage as their source". The key's only connection has `intentOut` as its source, so by that wording the route of the decision sent via `ansp.intentIn` is not asserted. The key should at least discuss this. (c) `clearForBoarding` and `holdAndRefile` have no successor, the "dead end" pattern the lesson tells reviewers to flag. (d) The template example "SCN-004 step 2 over IF-013" does not fit: step 2 is AeroLink's internal flagging, while IF-013 carries the health report that *triggers* the scenario. | Key lines 22–28 and 39–40. S06 p.138. ConOps SCN-004. | (a) `send new IntentDecision(true)` or a parameterised decision. (b) Add a sentence on connection direction. (c) Add `then done;`, or say why none is needed. (d) Change the example to "SCN-004 trigger over IF-013". |
| W11-F19 | Low | q11-11, q11-12 | **Two keys are debatable or incomplete.** q11-11: RID (4), short names whose case differs from the CP2 IDs, breaks ID-based threads, which the course treats as traceability (B-CLO5; the scale's "breaking a thread"). So "only one RID on semantics or traceability" is arguable. q11-12: the keyed fix models A1 without its priority-landing branch, which RID-IN-03 itself calls a defect. | ConOps SCN-005 A1. RID-IN-03. | Make (4) clearly cosmetic (e.g. doc-comment capitalisation). Add `else declarePriorityLanding` to the q11-12 key. |
| W11-F20 | Low | `StateWalker.tsx` traces; `RidWriter.tsx` lines 94 and 102; `FlowCoverage.tsx` line 80 | **Accessibility gaps, contrary to the facilitation note.** The trace results, the RID list and the RID-set results use `aria-hidden` ✓/✗ with no `sr-only` status text, although the facilitation note says "results use ✓/✗/! with screen-reader text". The coverage checkboxes are labelled only "M1"…"A3" in every row, with no node name. | Code reading. | Add `sr-only` Pass/Problem text. Use `aria-label={`${x.id} realises ${r}`}`. |
| W11-F21 | Low | `week11_notes.md`; `w11-worked-rids` paragraph 1; `w11-links`; `w11-rids` | **Accuracy slips.**<br>• "42 probes" (commit message), but the table holds 41 IDs: p38 is missing and p08/p36 share a row.<br>• "Seven defects of the kinds in the right-hand column of the checker table and in the advanced block": order reversal, the A2 rejoin, the missing perform and exhibit, and the missing A3 are none of those kinds.<br>• FN subsetting is called "the first link from behaviour to structure". FN-nnn are actions (behaviour); perform is the link to structure.<br>• "exactly the CP4 scope": R41's allocated baseline also requires documented verification requirements, which are not in CP4. | Notes table. R41 p.77. | Correct the wording. |
| W11-F22 | Low | `RidWriter.tsx` (`w11-rids` store); facilitation (logistics) | **Logistics gaps.** The practice RIDs on Team K and the Week 12 peer-review RIDs share one stored list and one Markdown export, so the practice RIDs leak into the submission unless removed. The rotation has no rule for a reviewer whose target team's CP4 is late or missing. Separately (course-wide, lead-owned): `instructorNotes`, including the quiz key line, and `MODEL_RIDS` ship in the student bundle; `check-student-build.mjs` strips only exam banks. | Code reading. | Add a "practice / Week 12" switch with separate stores. Add a missing-CP4 rule (e.g. review team k+2). Report the bundle issue to the lead. |
| W11-F23 | Low | `logic.test.ts` | **Weak tests.** (a) `TEAM_K_SCN005_FLOW` and `TEAM_K_MACHINE` are never checked against the fragment listing (only the RID line numbers are), so the encodings can drift from the file silently. (b) The SCN-002 consistency test checks node *names* only, not edges or guards. (c) No test covers reveal gating, the overwrite bug, or acceptance of good RIDs. | Code reading. A mutation such as changing fragment line 39's guard leaves every test green. | Add edge- and guard-level consistency tests for both seeded encodings and the reference flow. Add the missing tests listed in F05, F12 and F14. |

## Citation fidelity

| Claim (location) | Cite | Verdict | Evidence |
|---|---|---|---|
| Action def, parameters, usage, flow transfers items (w11-actions) | R72 sl.30 | OK | "Directed features … are considered to be action parameters"; "A flow can be used to transfer items between actions." |
| Succession: first completes before second begins | sl.31 | OK | Verbatim sense. |
| Succession flow: finish producing before consuming | sl.32 | OK | Verbatim sense. |
| `then` = succession from the lexically previous action | sl.33 | OK | The slide's example has a `flow` between `focus` and `then action shoot`, and the source is still `focus`. This also confirms that the SCN-002 listing's `flow … ; then action fileFlightIntent` pattern is the slide's own. |
| Action usage decomposed into actions | sl.34 | OK | — |
| Conditional succession; target must be named, not declared in place | sl.35–36 | OK (interpretive) | sl.35 says "target action must be explicitly named (no shorthand)". S06 p.136 states the declared-in-place ban explicitly and would be the stronger cite. |
| decide chooses exactly one; else; merge waits for exactly one; start/done | sl.37–38 | OK | — |
| loop/if as a structured alternative | sl.39 | OK | — |
| fork enables all; join waits for all | sl.40 | OK | — |
| perform identifies the owner as performer | sl.41 | OK | — |
| send/accept; via port; target determined by connection | sl.45–46 | OK | — |
| else when guards of the immediately preceding conditional successions are all false | S06 p.136 | OK | — |
| Unguarded decision successions leave the choice "to the model's semantics" | S06 p.134 | OVERCLAIM (wording) | Source: "chosen (non-deterministically)" (F15). |
| Overlapping guards / all-false without else: "model does not say" | S06 p.134, p.136 | OVERCLAIM | Neither page says this (F15). |
| perform inside an action acts like a call | S06 p.136 | OK | "acts like a referential 'call'". |
| Default sending context inside a perform action is the perform action | S06 p.138 | OK | Verbatim sense. |
| Use case: subject, actors as referential part usages, objective | R76 sl.100 | OK | — |
| Include; subject bound implicitly, actors explicitly; no extend; subject first | sl.101 | OK | The slide says "nested use case". |
| State def like a UML state machine; transitions fire on acceptance | R73 sl.48 | OK | — |
| `first start then` replaced `entry` in 2026-03 | sl.48–50 | OK | "Last changed: 2026-03 (changed 'entry' to 'first start')". |
| Full transition form `… accept … if … do … then` | sl.48–49 | OK (partial) | Accept form on sl.48. The if/do order is on sl.53, which is cited elsewhere. |
| Guard must be true; effect before entry to target | sl.53 | OK | — |
| Change, absolute and relative time triggers | sl.54 | OK | — |
| entry/do/exit; states have parameters | sl.52 | OK | — |
| Parallel: no transitions between concurrent states | sl.51 | OK | — |
| exhibit; parameters bound as for action; not composite | sl.56 | OK | — |
| Two same-trigger transitions need complementary guards | sl.53 | OVERCLAIM | Not on the slide (F15). |
| Spec still uses `entry; then off;` | S06 p.150–151 | OK | OnOff1, p.151. |
| State def is a kind of action def | S06 p.145 | OK | — |
| Non-parallel: exactly one substate active after entry; transitions activate/deactivate | S06 p.146 | OK | — |
| Guard after the accepter (p.152); OnOff4 prints `if` before `accept` (p.153) | S06 p.152–153 | **VERIFIED** | p.152: "after the accepter (if any)". p.153 OnOff4: `first off if isEnabled accept TurnOn …`. The checker rejects that order (my r01). |
| Firing order: do interrupted, exit, effect, entry, do | S06 p.153–154 | OK | Items 1–5. |
| Item def TurnOn as trigger | S06 p.151–152 | OK | — |
| Conditional initial successions (q11-5) | S06 p.150 | OK | `if not initial.isStarting then off; …` |
| Technical reviews: pre-established criteria, entry/exit criteria, models, perspectives, actions | R06c p.386–388 | OK | — |
| Schedule-, event- and evidence-based reviews and their risks; team composition | R06c p.387–388 | OK | — |
| RID actionability (q11-10, q11-12, misconception 5) | R06c p.388 | OVERCLAIM (weak fit) | F16. |
| PDR establishes the allocated baseline; functional and interface requirements decomposed; internal interfaces documented | R41 p.76–77 | OK | "exactly the CP4 scope" is a slight overreach (F21). |
| "does not evaluate guards … does not judge whether behaviour matches the ConOps" | SYSML_TOOLCHAIN Limitations | OK (paraphrase broadened) | The doc says it does not check whether content is meaningful or correct. Note that the checker *does* type-check `when` (p37) and `after` (r11) expressions, but not `if` guards (r05). |

## Probe table (release 2026-08, kernel 0.62.0; one JVM; scratch files; report in the reviewer's scratchpad)

"MISMATCH" in the tool output only reflects the scratch file names (not `invalid_*`). Every result matches the author's notes.

| My probe | Author's ID | Construct | Result | Matches notes / lesson / key? |
|---|---|---|---|---|
| r01 | p30 | `transition … first off if isEnabled accept TurnOn then on;` (OnOff4 order) | FAIL: `no viable alternative at input 'transition'` … `'if'` | Yes. Supports q11-4 b and the caution. |
| r02 | p29, q11-4 a | `accept CellOverTemperature if connected do send new FireAlarm() to opsCentre then outOfService` | PASS | Yes. |
| r03 | p01 | `entry; then off;` | PASS | Yes (lesson: both forms accepted). |
| r04 | p26 | Two `first start then …` in a non-parallel state | PASS, silent | Yes (q11-5). |
| r05 | p28 | Guard typed `Real` | PASS, silent | Yes (q11-9). |
| r06 | p04 | Transition between parallel regions | FAIL: `A parallel state cannot have successions or transitions.` | Yes (q11-6). |
| r07 | p05, p25 | Unreachable state; state def with no initial state | PASS, silent | Yes (checker table). |
| r08 | p32 | include without actor binding | PASS, silent | Yes (q11-14). |
| r09 | p08 | `exhibit` of an action | FAIL: `Must reference a state.` | Yes (checker table, q11-7 b). |
| r10 | p06, p23, p33, p14 | Overlapping guards, no else, dead-end action, merge with one incoming succession | PASS, silent | Yes (checker table, q11-2). |
| r11 | — (new) | RID-IN-05 fix `accept after 2 [h]` with only ScalarValues imported | **FAIL**: `Couldn't resolve reference to Element 'h'`; `An after expression must be a DurationValue` | **No.** The worked RID's fix is not applicable as written (F07). |
| r12 | — (new) | Same with `private import SI::*;` | PASS | Shows the fix works once SI is imported. |
| r13 | p03, q11-1 b | Decision branches declaring their targets | FAIL: `no viable alternative at input 'if'` | Yes. |
| r14 | p39 | Same signal accepted in both parallel regions | PASS | Yes, but a PASS is not semantic evidence (F13). |
| listings | — | `aerolink_scn002_action_flow`, `aerolink_operating_states`, `aerolink_review_fragment_team_k` | PASS | Yes. |
| listing | — | `invalid_decide_target_declared` | FAIL at 10:4 `no viable alternative at input 'if'` | Yes (lesson quotes it correctly). |
| key | — | `instructor/week11/aerolink_grad_key_intent_interaction` | PASS | Yes. |

Activity-logic probes (scratch vitest against the module's pure functions):

| Probe | Input | Result |
|---|---|---|
| P1 | SCN-002, A2 rejoins at step 4 | No errors (advisory `merge-in` only) |
| P2 | SCN-002, A3 branches after step 1 | No findings at all |
| P3 | Identical guards on both branches | Advisory only (`decide-else`) |
| P5 | Normal landing goes straight to done, skipping step 7 | No errors (advisory only) |
| P6 | fork instead of decide for A2 | `alt-guarded` error (correct) |
| P7 | q11-8 keyed fix | `alt-outcome` **error** |
| S1 | Walker: guards `a` and `not  a` (two spaces) | Determinism advisory (harmless false positive) |
| RID screens | R1, R4, R13, R16 | Vague inputs **pass** |
| RID screens | R3, R9, R11, R12, R15 | Good inputs **rejected** |

## Verified correct

- **Listings and probes.** Every Week 11 listing and the instructor key PASS or FAIL as declared. 14 re-run probes reproduce the notes' records.
- **The S06 clause-order inconsistency** (p.152 text against the p.153 OnOff4 example) is real, and the 2026-08 checker rejects guard-before-accept. The caution and the q11-4 b explanation are accurate.
- **The initial-state forms** are taught correctly: current `first start then` (S10 sl.48–54, 2026-03), with the Beta 2 `entry; then` form also accepted.
- **The transition firing order** (S06 p.153–154) is correct in the lesson and in q11-15.
- **The three reference-model gaps are real and are taught as reviewer findings without editing the reference.** I confirmed each in `aerolink_v03_behavior.sysml` and `v02`:
  - `NoGoFaultReported` is accepted only in `onPad` and `dispatchReady`, and nothing sets `noGoFaultOpen`;
  - FN-011 derives from SCN-002 and is performed by LOG-005, but no step of the SCN-002 flow subsets it;
  - `FlightIntentPort { out item intent }`, while IF-003's doc says "Carries: route, departure time, acceptance".
- **The Team K fragment's seeded defects are real.** The cited line numbers (29–30, 34–35, 37–40, 18, 56, 59, 63) match the file. LOG-001 performs FN-012 in the reference, as RID-IN-04 says. The main flaw is the severities and IN-05's fix (F06, F07).
- **The walker.** Reachability, sink, initial-state and competing-transition checks are correct on the reference and on Team K. T1–T3 pass; T4 genuinely exposes the fault-while-charging gap.
- **Session timings.** Session minutes sum to 75 + 75. Lab steps are 5 + 15 + 15 + 10 + 30 = 45 + 30, as in syllabus §7.
- **Workload** items sum exactly to 10.5.
- **CP4 weights** (RB-8 75 · RB-17 15 · RB-12 10, 10 %) match syllabus §12.
- **The CP4 template** covers syllabus §11 scope and B.5 evidence, including the RID set given.
- **The late-RID fallback** matches lab plan L11.
- **Rule 1:** the RID writer records owner initials and provenance, and offers AI-suggested-reviewed.
- **Rule 2:** the graduate task is "always read", scored formatively on RB-8.5, and informs RB-16.1.
- **Rule 4:** the reference flow, the reference machine and the model RIDs pass the module's own checks, and this is tested.
- **The quiz meets the structural rules:** an explanation for every option, every objective assessed, and a Bloom distribution of Apply 6 / Analyse 4 / Evaluate 5 as stated.
- **The instructor key listing is excluded** from the bundle (tested). `tsc` is clean, and 117/117 tests pass.
- **Every SCN, FN, LOG, PHY and IF fact quoted in the lesson** matches the reference baseline. These include SCN-001, SCN-003 and SCN-004 steps and alternates, FN-006 and FN-005 performers and allocations, and IF-010.
