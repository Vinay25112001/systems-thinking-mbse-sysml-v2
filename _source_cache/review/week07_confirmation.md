# Week 7 confirmation review: the fixes for week07_review.md (REVISE)

Reviewer: independent, adversarial, read-only. Date: 2026-10-21. This file is the only file written. No git write
operations, installs or generators were run. Probes ran from the session scratchpad through a throwaway vitest config
that imports the real modules read-only. Paths are relative to `learning-studio/` unless they start with `_source_cache/`.
Dispositions checked: `docs/lectures/week07/WEEK7_MILESTONE_REPORT.md` §13.

## Verdict: **REVISE (short cycle)**

The three original majors are fixed in their mechanics. A completion claim no longer passes. A collision is a separate
kind that cannot be accepted. The dropped Week 2 open items are back in the case. The probes below confirm all three.
Four new defects block sign-off. Each is small, but two of them repeat the exact classes the original review raised:

1. **N1 (Major). The root cause of M3 is only partly fixed.** The Week 5 tool also issues EXT IDs, and it still ignores
   Week 1. In the Riverside fixture, 4 of the 5 collisions (EXT-002 to EXT-005) come from Week 5, not Week 4.
2. **N2 (Major). The M2 gate now refuses valid deferrals**, such as "To be closed in Week 10 by the ops lead" or "Will be
   addressed in the Week 9 model". This is the recurring "valid input rejected" class.
3. **N3 (Major, blocks the commit). Line endings.** `week4/record.ts` and `week4/record.test.ts`, both in signed-off
   Week 4, were converted from CRLF to LF. That churns the whole file in each (1,459 and 588 diff lines, against 43 and
   34 real ones). `week6/record.test.ts` now mixes line endings.
4. **N4 (Major, small fix). The M1 fix states a false count.** The executive summary says "17 deferred …, 3 of them Week 2
   open items that Week 6 had dropped". Only 2 of the 17 are deferred: NEED-017 is accepted. NEED-017 also was not
   dropped, because Week 6's baseline review carries U-006, its TBR-02 unknown.

## Gates run (2026-10-21, 21:30 to 21:40)

| Gate | Result |
|---|---|
| `npx vitest run` src/week7, src/workbench/week7, src/content/lectures/week07, src/content/lab/week07Lab.test.ts, src/components/figures/week7FigureKit.test.ts, **src/workbench/week4, week5, week6, week8**, src/workbench/shortAnswers.test.ts, src/content/content.test.ts | **19 files, 1,064 / 1,064 pass** |
| `npx tsc -b` | exit 0, no errors. No failures from other streams (M6/M3) were present at run time |
| `npm run build:student` (includes `check-student-build.mjs`) | **PASS.** Week 7 student decks: 22 and 13 notes slides, all empty ("blanked the speaker notes of 22 / 13 slides"). 0 of 2,880 faculty-notes markers. 14 of 16 decks shipped (all but Week 1). All 56 .pptx links resolve |
| Leak check, `dist-student/assets/Week7App-*.js` and `lectures-*.js` | 0 hits for `P7-`, `outline §`, `new-pending-review`, `DECISION_LOG`, `_source_cache` |
| Deck freshness | `public/lectures/week07-session{1,2}.pptx` (21:22:58) are newer than every Week 7 source (latest 21:21:17). The lab MD (21:28) is newer than `week07Lab.ts` |
| Playwright | not run (as instructed) |

## Per-finding confirmation

| ID | Claimed | Confirmed? | Evidence |
|---|---|---|---|
| M1 dropped open items | Fixed | **Yes in substance; N4 remains** | `aerolinkCase.ts:146` `PARTIAL_OPEN`. The probe gives F-13 NEED-008 and F-14 NEED-006 as `dropped-open-item`, deferred to the Requirements & Compliance lead in Week 9, and F-15 NEED-017 as accepted against U-006. `EARLIER_OPEN_ITEMS` (`:178–187`) lists all 3 partial items, 7 Week 2 open items, the deliberate gap and the 15 baseline-review items, each closed or tied to a finding. `aerolinkCase.test.ts:82–110` checks that none is silent and has a negative direction. The tool adds the kind `dropped-open-item` (`record.ts:514–531`), pre-filled as a deferral. The Riverside fixture gives `dropped-open-item:NEED-003` and `:NEED-008`. RID-001 (`:296–303`) is reworded truthfully. **But the count sentence is false: see N4.** |
| M2 completion claims | Fixed | **Yes, with an over-reach (N2) and synonym gaps (n5)** | `labBrief.ts:126` `COMPLETION_CLAIM`; `record.ts:587–590`. Refused: "Fixed", "fixed.", "FIXED!", "Resolved", "Done", "withdrawn — duplicate", "Withdrawn", "Fixed in Week 4", "Corrected in the Week 4 record", "Complete", and a defer with "Fixed". Accepted: "Duplicate of REQ-STK-004", "Kept for history; superseded by REQ-STK-018 (Week 3)", "Accepted: no child needed, see the Week 2 record", and "Deferred" with owner RM and week 9. Refused correctly: a defer with no week, with week 7, with no owner, or with owner "TBD". Owner "Week 10" is accepted with the `week-owner` advisory. The disposition set is only `record \| defer` (`labBrief.ts:118`). An imported `"fixed"` normalizes to `''` (`record.ts:216`) and fails. Correction happens only by re-import (`CORRECTED_AND_REIMPORTED`, `labBrief.ts:124`). The review's probe (stale recorded as "Withdrawn") now gives **not-ready**. A bare "Duplicate" now fails on the new evidence gate: that is intended, and the lab gate text shows "Duplicate of REQ-STK-004" as the example |
| M3 collision as rename | Fixed at source and in Week 7 | **Week 7: yes. Upstream: only partly (N1)** | Constructed cases on the Riverside chain. (A) Week 4/5 externals renumbered after Week 1's EXT-006: **no** collision or renamed finding. (B) Week 4 re-adds Week 1's EXT-001 under its own ID with the same name: none. (C) "Grocery store donors (county)", where one name contains the other: none (same element). (D) "Grocery partners", a reworded same element without containment: **collision** (by the stated identity rule; see n6). (E) "Stripe payments": **collision**. A collision with `record` fails the disposition gate; a defer with an owner and a week passes. Accepting the fixture's collisions gives not-ready. Collisions are keyed per ID (`record.ts:503`). The JSON index keeps both rows (`EXT-001@W1 Grocery store donors \| EXT-001@W4 County funders’ reporting portal …`, `:837`). T1, step 2 and the fixture reason are corrected (`week07Lab.ts:118`, `:129`, `:199`; `fixture.ts:35`) |
| M3 upstream, Week 4 | EXT continues after Week 1 | **Yes, for Week 4** | `week4/record.ts:222–229`, `:283–304`. Fixture: `nextId EXT` goes from EXT-002 to **EXT-007** after the Week 1 file. An empty record goes from EXT-001 to EXT-007. Add then delete gives EXT-008 (never reused). The round trip keeps `week1Externals`. The old colliding Week 4 file imports unchanged (EXT-001, `week1Externals` 0), and so does a file without the key. A Week 2 file is refused. Week 5 (`importWeek4File`) and Week 7 (`loadSource`) read the new export |
| M3 upstream, Week 6 | O floored on Week 3 | **Yes** | `week6/record.ts:249`, `:356`. Without Week 3 the next O is O-001; with Week 3 it is **O-002**. The fixture opportunity is O-002. Week 6 exports with and without `week3.opportunities` both import, and Week 7 reads them |
| M3 old files | Import and are flagged | **Yes** | The Riverside Week 4/5 exports still carry EXT-001..005. Week 7 flags `collision:EXT-001` to `:EXT-005`, and the fixture defers them (TL, Week 8). Nothing is renumbered silently |
| m1 | Fixed by instruction | **Partly** | `week07Lab.ts:117` says "a requirement written in another week belongs in your Week 2 record, exported again". The AeroLink case still writes REQ-STK-018/019 in Week 3 (F-01) without saying so (n9) |
| m2 | Fixed | **Yes** | Earlier-week deferrals pre-fill as `defer` (`record.ts:516–520`). The `past-week` advisory (`:605–606`) and the `week-owner` advisory (probe) both fire |
| m3 | Fixed | **Yes** | Findings are withheld by `all(...)` (`record.ts:525–541`). "Provisional: Week N not loaded" appears at `Week7LabTool.tsx:262` |
| m4 | Fixed | **Yes** | `session1.ts:464` presents it as tailoring of R40 p.70, and says the chair checks items due before the review |
| m5 | Fixed | **Mostly** | `session2.ts:325` reads "Week 8 starts from the closed package (its import … is still being built)". The student-visible Lab page and `WEEK7_LAB_INSTRUCTIONS.md:108` still say "Week 8 reads the deferred ones as open items" (`labBrief.ts:265`) (n8) |
| m6 | Faculty item | **Yes, stated** | Recomputed: rows 2.5 + 0.7 + 0.6 (5,167 words) + 1.9 (7.4 ÷ 4) + 1.0 + 0.3 + 0.2 + 0.1 = **7.3**. Graduate **8.0**. Team of three: 6.8 person-hours, 2.3 h each, **7.7**. Graduate on a team of three: **8.4 > 8.0**. `WORKLOAD_SUMMARY` says "above the budget: a faculty decision" (`week7Path.ts:171`). Milestone §10.3 still says 7.6 h (stale) |
| m7 | Fixed | **Yes** | `Rid.criterion` exists and is gated (`record.ts:42`, `:698`). The RID form explains the RID-001 numbering (`week07Lab.ts:215`) |
| m8 | Fixed | **Yes** | Delete RID-002, share and import: `nextRid` gives **RID-003** (`record.ts:850`, `:893`) |
| m9 | Fixed | **Yes** | One finding per item ID (`record.ts:546–553`): `open-item:2:U-001` and `open-item:4:IF-008` in the fixture |
| n1 / n2 | n1 left; n2 fixed | Yes | The outline banner is listed in §13 |
| App.tsx LF | Restored | **Yes** | HEAD 0 CR / 563 lines; working tree 0 CR / 601 lines. `--stat` and `--ignore-cr-at-eol --stat` agree (44) |

## AeroLink recomputation (from the Weeks 1–6 modules, probe)

Coverage: 17/17; 16/19 (REQ-STK-013, 014, 017); 15/15; 7/8 (PHY-006); 3/3. 265 IDs. **30 findings: 13 accepted and 17
deferred.** The breakdown: 5 stale dispositions, 3 childless-stk, 1 cap-no-function, 1 phy-no-interface,
2 ext-no-interface, 3 dropped-open-item (2 deferred, 1 accepted) and 15 open-items. 21 are carried. Every case finding
passes the tool's own gates, checked with `assessFinding` against `KNOWN_IDS`. RID-003 rests on 320 vs 300 and
`supports` = 256 at 80 % utilization: consistent with Week 6. RID-004 lists Week 4 F5, Week 5 F7 and F8 with week
owners: consistent. The milestone report's §3 is right ("17 deferred … NEED-006 and NEED-008 …; NEED-017 is accepted").
The case text is not (N4).

## New findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| N1 | **Major** | `workbench/week5/record.ts:260` (`floorIds` EXT = own + `week4.externals` only); `week4/record.ts:685` exports `week1Externals`, but the Week 5 snapshot drops it | Probe, Week 4 with the Week 1 file loaded, then Week 5. **No own externals: Week 5 `nextId EXT` = EXT-001.** Only Week 1's EXT-002 re-added: **EXT-003**, which collides with Week 1's "Partner pantries". Own EXT-007: EXT-008 (fine). In the Riverside fixture the collisions on EXT-002..005 (Stripe, Passengers, OpenAI API, City bus service) are **Week 5's own externals**. The disposition "Fixed at source" covers Week 4 and Week 6 only, so a team following the instructions can still collide in Week 5 | Week 5 snapshot keeps `week4.week1Externals` (additive, optional), and `floorIds('EXT')` includes them. Add one test in each direction to `week5/record.test.ts`. Signed-off week: a minimal change with its owner (faculty item FI-C) |
| N2 | **Major** | `labBrief.ts:126`; `record.ts:587–590`; `record.test.ts:161` asserts "Addressed in Week 5" refused | Refused, and each is a valid **deferral** rationale: "To be closed in Week 10 by the ops lead", "Will be addressed in the Week 9 model", "Handled with the Week 11 physical model", "Not done yet: the second requirement is written in Week 9". Refused as an acceptance: "Removed from scope by DEC-002". Each gets "claims the gap is closed …", which is untrue for the sentence. The course lists "valid input rejected" as a defect class (milestone §8) | Apply the claim test only to a past-tense claim that is not negated and not future-tense (for example, skip it when the match follows `to be\|will be\|not\|yet\|until`), or apply it only to `record`. Add the four deferrals above as accepted cases to the `shortAnswers.test.ts` Week 7 block |
| N3 | **Major (commit blocker)** | `week4/record.ts`, `week4/record.test.ts`, `week6/record.test.ts` | HEAD has CR 713/713 and 278/278. The working tree has **0/746 and 0/310** (whole-file conversion in signed-off Week 4). `week6/record.test.ts` has CR 323/343: the 20 added lines are LF in a CRLF file. `git diff --numstat` gives 746/713 and 310/278, against `--ignore-cr-at-eol` 38/5 and 33/1 | Restore CRLF in both Week 4 files and make the new Week 6 test lines CRLF. Re-check that the two numstats agree. (Other streams have their own EOL churn, not Week 7's: `activities/week11/{FlowCoverage.tsx, StateWalker.tsx, logic.test.ts}`, `workbench/week1/team.test.ts`; `docs/authoring/week11_notes.md` is mixed) |
| N4 | **Major (small fix)** | `aerolinkCase.ts:255` (EXEC_SUMMARY.why), `:282` (readiness answer), `:171` (F-15 text); `session1.ts:379` (bullet "3 Week 2 open items dropped by Week 6, carried again"), `:384` (notes: "3 open items … were due in Week 5 … dropped by my own Week 6 review; the audit carries them again with owners and weeks"); `aerolinkCase.test.ts:112` asserts the sentence | The probe renders "17 deferred with owners and weeks, 3 of them Week 2 open items that Week 6 had dropped". Only F-13 and F-14 are deferred. F-15 (NEED-017) is accepted, has no owner or week, was not due in Week 5 (it waits on TBR-02), and was not dropped, because `BASELINE_REVIEW` (Week 2 row) carries U-006, the TBR-02 unknown. F-15's own text says "no later week carried it", while its reason says "U-006 carries it". This is the same class as the original M1: the central example contradicts its own record | Count the deferred dropped items separately (2) and word NEED-017 as "carried through U-006 (Week 6), accepted against it". Fix F-15's text, the slide bullet, the notes and the readiness reason. Make the test assert the corrected count |
| n5 | Minor | `labBrief.ts:126` | Accepted, though each claims a fix without proof: "Fix applied (Week 4 record)", "Sorted in Week 4", "Updated in the Week 4 record", "Re-exported Week 4", "No longer an issue, see REQ-STK-004". A word list cannot be complete | For kinds a re-export resolves (`stale`, `dangling`, `renamed`, `not-ready`, `stale-disposition`), add `fix\|fixes\|updated\|re-?exported\|sorted\|no longer` to the claim test, or add an advisory |
| n6 | Minor | `record.ts:503`; `session1.ts:247` | A reworded same element without containment ("Grocery store donors" vs "Grocery partners") is a collision under the stated rule. The finding then asserts "names two different elements … Renumber it", which is the wrong remedy for the same element | Message: "… if it is the same element, give it the same name in the later week and export again; otherwise renumber it" |
| n7 | Minor | `record.ts:511`, `:539` | The stale-disposition finding tells students to "withdraw the Week 2 disposition", which is the word the reason gate now refuses | "remove it from your Week 2 record and export again, or accept it as history with its evidence" |
| n8 | Minor | `labBrief.ts:265` (Lab page via `LAB_PREFIXES`, `week7/Lab.tsx:251`); `WEEK7_LAB_INSTRUCTIONS.md:108` | m5 residual: the student-visible text says "Week 8 reads the deferred ones as open items" | Same wording as `session2.ts:325` |
| n9 | Minor | `aerolinkCase.ts:43–50`, F-01 | m1 residual: the worked example writes REQ-STK-018/019 in Week 3, against the new lab rule. A team copying it gets a different tool result | One sentence in the case or the lesson: AeroLink's Week 3 requirements would go into the Week 2 record for the tool |
| n10 | Minor | `week4/Week4LabTool.tsx:350`; Week 6 Week 3 file | Both upstream fixes depend on an **optional** file. Nothing warns a team that adds an external (Week 4) or an opportunity (Week 6) without loading it | An advisory when an EXT or O ID is issued while the earlier file is not loaded |
| n11 | Note | `record.ts:377` comment "first definer wins" (now keeps `others`); milestone §10.3 "7.6 h" (now 7.7); §13 "35 files, 1,335" (this run used a different set) | Stale text | Update |

## Faculty items

- **FI-A Workload:** a graduate student on a team of three is at 8.4 h (unrounded about 8.3) against 8.0. It is stated
  on the week page and is a faculty decision. Milestone §10.3 should read 7.7 h.
- **FI-B Upstream ownership (M3):** the Week 4 and Week 6 changes are minimal, additive and tested (week4 4 tests, week6
  3 tests; the signed-off suites pass). Faculty or the Week 4/6 owner should approve the change to signed-off code.
- **FI-C Week 5 EXT numbering (N1):** a third signed-off tool needs the same minimal change. It needs its owner's
  approval.
- Carried over and unchanged: FI-1 RIDs before the meeting (Plan A departure); FI-2 the slot length samples RIDs;
  FI-3 Exam 1 still says Week 7; FI-4 no quiz; FI-6 proposed AeroLink content (now including F-13 to F-15 and RID-001's
  "a second deferral is refused"); FI-8 P7-1 and P7-2 staged, not cited.

## Recommended order

N3 (restore line endings; trivial, and it blocks any commit) → N4 (wording and count, then regenerate the decks and the
lab MD) → N2 (scope the claim test, with tests both ways) → N1 (Week 5 floor, with the owner's approval) → n5 to n11.
Then re-run the vitest set above, `tsc -b`, `build:student`, `lectures:pptx -- --week 7`, `build-lab-md 7`, and the two
e2e specs.
