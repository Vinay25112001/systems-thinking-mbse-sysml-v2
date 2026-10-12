# Week 11 authoring notes — SysML v2 behaviour; L11; CP4; RID review kick-off

Status: self-checked, 2026-10-11, revised the same day against the independent review `_source_cache/review/week11_review.md` (REVISE major, 23 findings; commit reviewed `ead8f33`). Pending re-review and faculty review.

## Files
- `src/content/weeks/week11.ts`: 14 blocks (4,663 counted lesson words, `lessonWordCount`); 15 quiz items (Apply 7, Analyse 3, Evaluate 5; keys a 4 · b 4 · c 4 · d 3); lab L11; assignment CP4; workload 10.5 h (graduate figure).
- `src/activities/week11.activity.tsx` registers `w11-flow-coverage`, `w11-state-walker` and `w11-rid-writer`.
- Pure logic:
  - `flow.ts`: ConOps-to-flow checks, the worked SCN-002 flow, Team K's SCN-005 draft and the L11 SCN-001 skeleton;
  - `states.ts`: walker and analysis;
  - `rids.ts`: RID screens, set screens, the practice gate, the stores and the model RIDs.
- Tests: `logic.test.ts` (40), `activities.test.tsx` (8), `quiz.test.ts` (4); `listing.testutil.ts` is a test-only reader of the listings (not imported by any component).
- Listings:
  - `sysml/week11/aerolink_scn002_action_flow.sysml` (PASS)
  - `aerolink_operating_states.sysml` (PASS)
  - `aerolink_review_fragment_team_k.sysml` (PASS; seeded defects; unchanged, so every RID line number still holds)
  - `aerolink_l11_starter_scn001.sysml` (new; PASS; the six SCN-001 steps in succession, no decisions)
  - `invalid_decide_target_declared.sysml` (FAIL as intended: `10:4 no viable alternative at input 'if'`)
  - instructor key `sysml/instructor/week11/aerolink_grad_key_intent_interaction.sysml` (revised; PASS)

## Pages read (via scripts/source_pages.py; all re-read for the revision on 2026-10-11)
- R72 sl.30–47 (all). The lesson depends on sl.30–41 and 45–46; sl.42–44 (terminate, assignment) and 47 (opaque actions) are not used, so the workload line narrows the reading to those 14 slides.
- R73 sl.48–56 (all). The lesson uses sl.48–54 and 56; sl.55 (local clocks) is not used.
- R76 sl.100–101.
- R82 (S06) p.134–140 and p.145–154. Key sentences: p.134 “(non-deterministically)” for unguarded decision successions; p.136 `else`; p.138 receiver of a send via a port “determined by interface connections having the port usage as their source”; p.139–140 change, absolute and relative time triggers; p.146 transitions activate/deactivate states, effect after the source is deactivated and before the target is activated, “exactly one of the substates shall be active”; p.152 guard after the accepter; p.153 OnOff4 prints `if` before `accept`; p.153–154 firing order.
- R06c p.386–388; R41 p.76–77 (allocated baseline also documents “the verification required”).
- S10 sl.59–64 were read earlier for probing only. DECISION_LOG A14 registers them as a Week 11 extension; registration is still pending, so they are not cited and no graded work depends on them.

## Probe results (release 2026-08, kernel 0.62.0, scratch files, 2026-10-11, one JVM at a time)

The original table held 41 probe IDs, not the 42 the first commit message claimed: p38 was never recorded, and p08 and p36 share a row.

| Probe | Construct | Result |
|---|---|---|
| p01 | `entry; then off;` (S06 Beta 2 initial form) | PASS |
| p02 | `first start then off;` (S10 current form) | PASS |
| p03 | Decision branch declaring its target (`if g then action a2;`) | FAIL syntax: `no viable alternative at input 'if'` |
| p04 | Transition between concurrent regions of a parallel state | FAIL: `A parallel state cannot have successions or transitions.` |
| p05 | Unreachable state | PASS silent |
| p06 | Overlapping decision guards | PASS silent |
| p07 | Accept of an undeclared signal | FAIL: `Couldn't resolve reference to Type 'Launch'` |
| p08 / p36 | `exhibit` of an action or FN | FAIL: `Must reference a state.` |
| p09 | `perform` of a state usage | PASS silent |
| p10 | Guard naming an undeclared attribute | FAIL resolution |
| p11 | Two entry actions | FAIL: `A state may have at most one entry action.` |
| p12 | `accept after 30 [min]` | PASS |
| p13 | Transition to `done` | PASS |
| p14 | Merge with a single incoming succession | PASS silent |
| p15 | Item flow between actions | PASS |
| p16 | `occurrence def` with event occurrences and messages (S10 sl.60 form) | PASS |
| p17 | send/accept via ports plus an interface | PASS |
| p18 | Conditional succession after an action | PASS |
| p19 | Effect `do send` on a transition | PASS |
| p20 | Transition to a state of another state def | FAIL: `Must be an accessible feature` |
| p21 | `include use case` with actor bound | PASS |
| p22 | fork/join | PASS |
| p23 | decide without else, non-exhaustive | PASS silent |
| p24 | Succession to an undeclared action | FAIL: `Couldn't resolve reference to Feature` |
| p25 | State def with no initial state | PASS silent |
| p26 | Two initial successions | PASS silent |
| p27 | exhibit in a part def | PASS |
| p28 | Guard typed `Real` | PASS silent |
| p29 | `accept … if … do … then` | PASS |
| p30 | `if … accept … do … then` (S06 p.153 OnOff4 order) | FAIL syntax |
| p31 | q11-1 key (merge + decide + else loop) | PASS |
| p32 | include without actor binding | PASS silent |
| p33 | Dead-end action in a flow | PASS silent |
| p34 | exit, effect, entry and do together | PASS |
| p35 | perform FN-007 in PHY-003 plus exhibit in PHY-002 (q11-7) | PASS |
| p37 | `accept when health.degraded.isActive` | FAIL (`isActive` not resolved; `A when expression must be Boolean`). Not taught. |
| p39 | Same signal accepted in both parallel regions | PASS — not taught as semantics (W11-F13): a PASS shows only that the text parses and resolves |
| p40 | `accept when` on a shared attribute set by an `entry assign` | PASS (q11-6 key) |
| p41 | `entry action initial; then off;` (S06 p.150) | PASS |
| p42 | old q11-14 key (`actor :>> passenger = 'SCN-001'::passengers`) | PASS |
| p43 | Team K's fragment with all nine model-RID fixes applied | PASS, 0 messages |
| p44 | RID-IN-05 fix without `private import SI::*;` | FAIL: `57:20 Couldn't resolve reference to Element 'h'`; `57:11 An after expression must be a DurationValue` (as the reviewer's r11) |
| p45 | RID-IN-05 fix exactly as written (SI import; `accept after 2 [h] then closedForDay;` after line 55; line 57 replaced by `accept OperatingDayStart then open;`; `attribute def OperatingDayStart;`) | PASS, 0 messages |
| p47 | q11-8 key: A2 offer-or-decline, then done | PASS |
| p48 | q11-14 listing as shown (passenger of the included use case not bound) | PASS silent |
| p49 | q11-14 listing with `actor :>> passenger = 'SCN-001'::passengers;` | PASS |
| p52 | q11-3 listing (succession flow, then-shorthand, an unordered action) | PASS |
| key | revised graduate key (`new Physical::IntentDecision(true)`, `then done` after both end actions, return connection sourced at the ANSP port) | PASS, 0 messages |
| starter | `aerolink_l11_starter_scn001.sysml` | PASS, 0 messages |

p43–p52 ran in one partial run: `check_sysml.py <scratch>/probes <key> <starter> --report <scratch>/probe-report.json`; 9 files, 8 PASS, 1 FAIL (p44, as expected). No java process was running before the run.

## Review findings and what was done

| ID | Fix | Evidence |
|---|---|---|
| F01 | Keys rebalanced to a 4 · b 4 · c 4 · d 3. The correct option is now the longest in 4 of 15 items (chance level), and nowhere more than 1.3× the distractor mean. Justifications moved into the explanations, and distractors were given comparable detail. A shuffle in `Quiz.tsx` is a shared change and is left to the lead. | `quiz.test.ts`: “key letters are spread”; “correct option is the longest in at most 4” |
| F02 | q11-8 key: “A2 ends … must reach done, not quoteFare”. The explanation says an accepted alternative is a new request, not a rejoin. The L11 model answer was reworded to match, and is encoded in the test file. | `logic.test.ts`: “the L11 model answer for SCN-001 passes”; “W11-F02: the old q11-8 key … fails alt-outcome”; probe p47 |
| F03 | `flow.ts`: (a) `alt-outcome` — on every path, the first main node an alternate meets must realise the rejoin step. A loop back to the alternate's own branching step is accepted as a retry only if another path rejoins correctly; this keeps the reference hold loop and rejects P1. A path that ends at done is an error. (b) A new `alt-origin` error: every succession into an alternate must leave its branching step's node, or a node reached after that step and before any later main step. (c) `main-order` runs on the main path, with alternate-flow nodes left out. The lesson (`w11-checker` paragraph 3), the activity purpose and the tool footer now say exactly what is and is not checked. | `logic.test.ts` mutations P1, “rejoining at a LATER step”, P2, “branching AFTER a later main step”, P5, “rejoin alternate that goes to done”; the reference still passes every check |
| F04 | The RID review stays in Week 12, days 1–3 (when it is due). Week 11 says so to students (deliverable, artefacts, cautions). The workload line for Week 12 is given below, for the lead to apply. | Report and this file |
| F05 | Screens: plurals are accepted; UpperCamel names (with a stoplist), and “construct word + name” (e.g. “state hold”), count as specific; “slide/sl./page/p.” are accepted; RB-x.y must exist in `rubrics.generated.json`, and S/R pages must lie inside a registered reading. A discrepancy needs a defect cue and a specific element in the same clause. Hedges (“not fully”, “incomplete”) are not cues. “proper/accordingly” fixes are vague. | `logic.test.ts`: “reviewer's vague RIDs … now flagged (R1, R16, R13, R4)” and “naturally written good RIDs pass” (5 RIDs), plus the earlier vague-input tests |
| F06 | IN-06 and IN-07 are now major, with the reason in the RID text. New RID-IN-08 (completeness, major): 3 states and 3 transitions, and no aircraft state definition. | `logic.test.ts` “W11-F06” |
| F07 | RID-IN-05 now covers lines 54–57. Its fix adds the SI import and `accept after 2 [h] then closedForDay;`, and *replaces* line 57 with a next-day trigger. The lesson's worked RID was rewritten to match, and says why the import matters. | Probes p44 FAIL / p45 PASS / p43 PASS; `logic.test.ts` “applying the RID-IN-05 and RID-IN-09 fixes … clears the walker's errors” |
| F08 | q11-15 rewritten as a new derivation case (port send; source `do` interrupted) and relabelled Apply. q11-3 and q11-14 are now diagnoses of unseen listings (Apply). q11-2 is a new interval case: overlap or gap must be computed. For q11-6, the advanced block no longer gives the fix. The lesson sentence “A plain flow, by contrast …” was removed. | `quiz.test.ts`: “no correct option repeats an 8-word run of the lesson”; Bloom test (Apply 7, Analyse 3, Evaluate 5) |
| F09 | The CP4 weight, instructions, template sections 1, 6 and 7 and `rubricScope` tell students that RB-8.5 is formative only and graded at CP5 (A14). RB-8 at CP4 is scored on 8.1–8.4 and 8.6, against the §11 scope. Behaviour goes in a separate file, so its messages do not count toward 8.1. Default renormalisation: proportional, flagged for faculty confirmation. | `week11.ts` assignment |
| F10 | New starter listing and a matching SCN-001 skeleton in the coverage tool. Each lab step says what is finished in class (decisions mapped; states walked) and what moves out of class (the SysML). Session 1 now has worked flow 20 min and states 20 min. | Starter PASS; `logic.test.ts` “L11 skeleton fails only …” and “the L11 starter skeleton” consistency |
| F11 | Workload re-planned, still summing to 10.5 h. Readings narrowed to 24 slides (0.8 h). Lesson plus out-of-class activity work 1.4 h: the SCN-005 draft and the 3 practice RIDs are done in class, and the activity asks for 3, not 5. Graduate view 1.25 h, reusing CP4 ports, with S06 narrowed to p.137–138 and ½ page. Notebook 0.25 h. Realistic totals are in the cautions: graduate 10.5 h, others 9.25 h, a team with carried-over errors ≈ 11.5–12 h. | `weeks.test.ts` workload check |
| F12 | Team K's flow is kept in its own store (`w11-flow-teamk`), behind a “My draft / Team K's draft” switch. Clearing, or loading a worked flow or skeleton over a non-empty draft, needs a second click. | `activities.test.tsx` “W11-F12” |
| F13 | The advanced block no longer uses PASS as evidence. The q11-6 key is now the change trigger on a shared attribute (S10 sl.54; S06 p.139, p.150). The “one signal in both regions” form is the distractor, and its explanation says a PASS is not semantic evidence. Misconception 3 was extended. | q11-6; probes p39 and p40 |
| F14 | Team K's coverage findings and walker analysis are hidden until 3 *distinct* practice RIDs exist (`practiceUnlock`): each must pass the screens and have its own location+criterion and discrepancy. The key is gated the same way. RID-IN-09 (hold lifted without the 30 min of step 7) is tool-invisible, so 3 of the 9 model RIDs need reading, and the revealed key marks which. | `logic.test.ts` “W11-F14 …”; `activities.test.tsx` “Team K's findings stay hidden …” and “key stays closed for one RID saved five times” |
| F15 | (a) “chosen non-deterministically (S06 p.134)”. (b) and (c) are marked as instructor reasoning in the `mixed` advanced block. (b) now rests on sl.35 (“if the guard is false, succession is not possible”) and sl.38. | `w11-actions`, `w11-advanced` |
| F16 | q11-10 and q11-12 explanations and misconception 5 name RB-17 and the course RID convention. R06c is kept only for “pre-established criteria / identify actions”. | `week11.ts` |
| F17 | The caution was corrected: q11-5 and q11-15 rely on lesson statements of S06 p.146 and p.153–154, and cite R82. `w11-states` says the lesson is the course's statement of the firing order. | `week11.ts` |
| F18 | Key: `new Physical::IntentDecision(true)` (S10 sl.45 constructor notation); `then done;` after both end actions; a comment, plus a return connection sourced at the ANSP port, on S06 p.138's connection-direction wording. Template example changed to “the SCN-004 trigger, the health report over IF-013”. | Key PASS, 0 messages |
| F19 | q11-11 item (4) is now a lower-case title in a doc comment (editorial). q11-12 key and explanation now include `else declarePriorityLanding`. | `week11.ts` |
| F20 | sr-only text added on walker traces, RID list items, RID-set results and the writer-initials message. Coverage checkboxes have `aria-label="<node> realises <item>"`. The facilitation note now lists what is labelled. | `activities.test.tsx` uses `getByLabelText('planFlight realises M1')` |
| F21 | Probe count corrected (above). “Seven defects of the kinds …” is now “at least nine defects” with the right kinds. FN subsetting is no longer called a link to structure. “Exactly the CP4 scope” is now “close to … the allocated baseline also documents the verification required”. | `week11.ts` |
| F22 | Practice and Week 12 RIDs are separate lists (`w11-rids-practice`, `w11-rids-week12`) with separate exports; the legacy `w11-rids` store is read once as practice. Missing-CP4 rule added: review team k+2. The bundle issue is reported to the lead (below). | `activities.test.tsx` “W11-F22” |
| F23 | Edge-, guard- and node-kind consistency tests compare the worked flow, Team K's flow, the skeleton and both machines with their listings. A mutation of fragment line 39 or 57 makes them fail. Gating, overwrite and good-RID tests were added (above). | `logic.test.ts` “encodings match the listings …” |

Declined: nothing. One adjustment to the reviewer's F03(a): a strict “first main node must cover the rejoin step” rule would reject the reference A1 hold loop (holdForPad → approach, step 6). The rule therefore accepts a loop back to the alternate's own branching step as a retry, but only if another path out of the same alternate rejoins correctly. P1 (A2's only path returns to step 4) is still an error. Separately, F06's IN-08 is framed carefully, because the L11 minimum is set for the aircraft states: the RID says Team K's only state definition is below the minimum and the aircraft state definition is missing.

## Requests for the lead (shared files; not edited here)
1. **Week 12 workload line (W11-F04).** Add to `week12.ts` workload: `{ activity: 'RIDs on the assigned team’s CP4 model (Week 12 days 1–3): read the model and its checker log, write and screen ≥ 5 RIDs in the RID writer’s Week 12 list (individual share of the team set)', hours: 1.5 }`. Rebalance Week 12 to its 10 h, or record the realistic total (≈ 11.5 h graduate) in the Week 12 workload caution.
2. **Bundle (W11-F22, course-wide).** `instructorNotes`, including the quiz-key line, and `MODEL_RIDS` ship in the student bundle; `check-student-build.mjs` strips only the exam banks. Note that the L11 SCN-001 model answer is kept in the test file, not the bundle.
3. **Quiz shuffle (W11-F01, optional).** A seeded per-student option shuffle in `src/components/Quiz.tsx` would remove letter cues course-wide.
4. **Register.** Complete the S10 sl.59–64 Week 11 extension entry (A14). Until then the module mentions them only as “extension, registration pending”.
5. **Reference batch (lead-owned).** The fault states (T4), the FN-011 dispatch step (q11-13) and the IF-003 acceptance item (graduate key) are still taught as reviewer findings; `sysml/reference/*` and `src/model/reference/*` were not edited.
6. **Faculty decision.** Confirm the CP4 renormalisation of RB-8.5's 15 points (A14 says to confirm with faculty). The module's default is proportional redistribution over 8.1–8.4 and 8.6.
7. **Optional.** A review-record store, or a RID element kind, in `engineering.ts`, so that RIDs and their CP5 dispositions link to model IDs.

## Verification (2026-10-11, after the revision)
- Full `npm run content:sysml` (no java process before the run): 50 files, 33 PASS / 17 FAIL, 0 ERROR, 0 mismatches; every Week 11 file met its expected outcome. Canonical report timestamp 2026-10-12T01:32:16Z.
- `npx tsc -b`: clean (exit 0).
- `npx vitest run src/lib`: 1 file, 4/4 passed (after the full run).
- `npx vitest run src/activities/week11 src/content src/lib`: 7 files, 153/153 passed.
- `npx oxlint src`: exit 0; no Week 11 findings.
