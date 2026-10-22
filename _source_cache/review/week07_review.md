# Week 7 independent review: Final Presentation (Phase I package and design review)

Reviewer: independent adversarial review (senior SE professor, instructional designer, QA). Not the author.
Date: 2026-10-21. Read-only: this file is the only file written. No git operations, generators or installs. Probes were
run from the session scratchpad, which imports the real modules read-only.

Scope: the uncommitted Week 7 set: `src/week7/*`, `src/content/lectures/week07/*`, `src/content/lab/week07Lab*.ts`,
`src/content/week7Path.ts`, `src/workbench/week7/*`, the Week 7 figures, `docs/lectures/week07/*`, and the `week07` blocks
in shared files. Paths are relative to `learning-studio/` unless they start with `_source_cache/`.

## Verdict: **REVISE**

The package is well built. Every number in the AeroLink case is computed, not typed. The citations I checked hold. Tests,
`tsc` and the student build are green. The design review content (prepare, conduct, complete; entry and exit criteria;
roles and independence; RIDs and dispositions labeled as course conventions) is sound at graduate level. Three defects
block sign-off, and each one sits in a defect class Week 7 itself exists to teach:

1. **M1. The worked package drops recorded open items while saying every gap has a disposition.** Week 2 recorded three
   partial-coverage open items. Two of them, NEED-006 and NEED-008, were due in Week 5 and never done. Week 6 silently
   dropped all three. The Week 7 audit carries none of them. RID-001 recovers NEED-008 only, and says "the audit could not
   see it". NEED-006 vanishes from the package. Meanwhile the executive summary and the readiness answer say every gap
   carries a disposition.
2. **M2. The tool accepts a "fixed" claim, although it tells students it never does.** A `record` disposition with the
   reason "Fixed", "Withdrawn" or "Resolved" passes every gate. The fixture reaches "review closed" by recording two stale
   Week 2 dispositions as "Withdrawn", which is an untestable completion claim.
3. **M3. An ID collision is reported as a harmless rename, and the course tools create the collision.** The Week 4 tool
   numbers externals from EXT-001 without seeing Week 1's EXT IDs, so every team gets a collision. The Week 6 tool does
   the same with O IDs. The package tool files both under "One ID, two names", labels the index with the wrong names, and
   the fixture closes them with the false reason "Same element, shortened name".

## Gates run (2026-10-21)

| Gate | Result |
|---|---|
| `npx vitest run` on src/week7, src/workbench/week7, src/content/lectures/week07, src/content/lab/week07Lab.test.ts, src/components/figures/week7FigureKit.test.ts, src/workbench/shortAnswers.test.ts, src/content/content.test.ts | **10 files, 830 / 830 pass** |
| `npx tsc -b` | clean, exit 0. No in-flight failures from the M4b or M5 streams were present at run time |
| `npm run build:student` (includes `check-student-build.mjs`) | **PASS**: Week 7 student decks have 22 and 13 notes slides, all empty; 14 of 16 decks shipped (all but Week 1); 0 of 2,879 faculty-notes markers; every .pptx link resolves |
| Leak check, Week 7 chunks (`Week7App-*.js`, `lectures-*.js`) | no `P7-`, `outline §`, `new-pending-review`, `DECISION_LOG` or `_source_cache`. The register IDs (R06c and others) appear as reading keys and inline "(R06c p.388)" citations, the same convention Week 6 used and its review accepted |
| Playwright | not run (as instructed) |
| Probes (scratchpad, read-only imports) | the AeroLink case values; the fixture audit (9 findings); the gate behaviour for "Fixed", "Withdrawn", a week as owner and a two-word rejection; partial packages; the RID round trip; the workload |

## Source spot-check (page text read through `scripts/source_pages.py`)

All of these match: R06c p.386 (definition; independent stakeholders), p.387 (prepare; entry and exit criteria confirmed
before the review; roles coordinated beforehand; information items made available ahead), p.388 (analysis from different
perspectives; "too close / too far"; complete once the exit criteria are met; not held before the entry criteria are met);
R36 pp.498–499 (formally approved snapshot; consistent and immutable; FBL/ABL/PBL; digital artifacts); R40 p.69 (SRR
assessment), p.70 (SRR "should not begin until … prior technical reviews are complete and their action items closed");
R44 p.111 (percentage completion as entrance criteria); R45 pp.118–119 (orphan and childless parent; the RTM keeps the
allocation history and the rationale); R13 p.565 (impact of change; TBX owner), p.566 (requirement validation).

R06c says nothing about RIDs or accept/defer/reject. The slides and lesson correctly label both as course conventions
(session2.ts:17–18, :199, :225, :374, :377). Neither pending reading, P7-1 (SFR) nor P7-2 (R40 p.73, "the Chair
determines completion"), is cited anywhere in student or faculty text; they appear only in comments (session1.ts:19–20).
One paraphrase stretches its source: see m4.

## AeroLink spot-check against the Weeks 1–6 data

Consistent with Week 6's baseline trajectory, including the committed Year-2 decision. YEAR2 gives ALT-004, 16 aircraft
(+4), 2 upgraded chargers, 4 hubs and 320 trips/day at month 24, against REQUIRED_CAPACITY 300. FLEET_STEP offers +0/+4/+6
with +4 the smallest step, and supports = 256. The executive summary (aerolinkCase.ts:212–226), RID-003 (:279) and GAP-001
(week06 :120–126) agree. The 11-hop thread NEED-010 → … → U-002 → INC-000 → DEC-001 resolves. Coverage is 17/17, 16/19,
15/15, 7/8 and 3/3. There are 27 findings (12 recorded, 15 deferred, 5 stale Week 2 dispositions) and 265 IDs. RID-002
matches the Week 6 re-dating "before the Week 7 review" (week06 :492). RID-004's three week-owned items (Week 4 F5 → Week 10;
Week 5 F7 → Week 12; F8 → Week 10) match the data. The defect in the case is what it leaves out (M1), not any number it
shows.

## Findings

| ID | Severity | File:line | Evidence | Fix |
|---|---|---|---|---|
| M1 | **Major** | `content/lectures/week07/aerolinkCase.ts:146`, `:160`, `:216`, `:243`, `:262`; `session2.ts:379` | `AUDIT.partialStillOpen` computes **["NEED-008", "NEED-006", "NEED-017"]** (probe) but feeds nothing. Week 2 `PARTIAL_COVERAGE` (week02 :443–447) records each as an *open item* with a due week: NEED-008 and NEED-006 in Week 5, NEED-017 via TBR-02. Weeks 3–6 never mention NEED-006's responder access (grep), and Week 6 `BASELINE_REVIEW` (week06 :496–520) carries only unknowns, TRL assumptions and findings, so all three were dropped. The audit's open-item findings come only from `BASELINE_REVIEW` (:146). The case nonetheless says "every gap in the package carries a disposition: 12 recorded, 15 deferred" (:216) and "every one of the 27 findings has a disposition" (:243). RID-001 says "The audit could not see it" (:262; session2 :379). That is true of the structural parent-link rule, but the package's own Week 2 record holds the item and its due date, and a package-level consistency audit is exactly where a commitment lost between Week 2 and Week 6 should be caught. NEED-006 disappears from the package. This is the same class as the Week 6 review's M1: the central worked example contradicts its own rule ("one enterprise, one meaning"; "none silent"). | Add a finding kind for an earlier week's open item that is overdue or no longer carried, computed from `PARTIAL_COVERAGE` against later weeks (NEED-006 and NEED-008 as deferred findings with owners; NEED-017 recorded against U-006/TBR-02). Recompute the counts. Reword RID-001: the reviewer finds that Week 2's open item was due in Week 5 and was dropped by Week 6, and that the parent link hides it from a structural audit. Add a negative test that fails when a `PARTIAL_COVERAGE` need is neither a finding nor closed. |
| M2 | **Major** | `workbench/week7/record.ts:536–544`; `content/lab/week07Lab.ts:244`; `workbench/week7/Week7LabTool.tsx:258`; `workbench/week7/fixture.ts:37` | Probe: `assessFinding({disposition:'record', reason:'Fixed'})` gives counts = **true**, and so do "Fixed in Week 4", "Withdrawn" and "Resolved". Students read "The tool never accepts the word ‘fixed’" (week07Lab :244) and "There is no ‘fixed’ choice" (tool :258). The fixture records both `stale-disposition` findings as "Withdrawn" (fixture :37) and reaches `review-closed`, although the Week 2 export still holds the dispositions. If they had been withdrawn, the finding would be gone. The milestone report's "no untestable ‘fixed’ claim" (§2.3, §8) holds only for the dropdown. The 5-test mutation probe on `said()` does not cover this path. | For kinds a re-export resolves (`stale`, `dangling`, `stale-disposition`, `renamed`, `not-ready`), a reason claiming completion (/\b(fixed\|withdrawn\|resolved\|corrected\|done\|closed)\b/i) fails the reason gate with the visible message "still found in your exports: re-export the corrected week; a fix cannot be recorded". Change the fixture's reason for those kinds to a true one (for example "Kept for history: the Week 2 text is superseded by REQ-STK-…"), or re-export the fixture's Week 2 without them. Add a test in both directions. |
| M3 | **Major** | `workbench/week7/record.ts:377`, `:470–477`; `workbench/week7/fixture.ts:35`; `content/lab/week07Lab.ts:129`, `:198` (T1); upstream `workbench/week4/record.ts:108`, `workbench/week6/record.ts:241–249` | Fixture probe: `renamed:EXT`: EXT-001 is "Grocery store donors" in Week 1 and "County funders’ reporting portal" in Weeks 4–6; EXT-002 is "County health department" in Week 1 and "Stripe" later; EXT-003 to EXT-005 likewise. `renamed:O`: O-001 is "Grocery chain sensor donation" in Week 3 and "Spare pantry refrigerators lent to new partners" in Week 6. These are **different things sharing an ID**, not renames. Cause: Week 4 issues EXT from 0 (`EMPTY_ISSUED.EXT = 0`) and its Week 3 snapshot chain carries no Week 1 externals, so **every team that follows the instructions collides**. Week 6's `floorIds` floors TECH, U, A and R but not O (its `Week3Extra` has no opportunities), so new opportunities reuse Week 3's numbers. The index is "first definer wins" (:377), so every later EXT is shown under Week 1's name in findings, the thread and the exported index and relationships that Week 8 is meant to read. One finding per prefix (:476–477) takes one disposition for all of them, and the fixture's "Same element, shortened name" is false and accepted. T1's top level ("no … renamed finding left that a re-export would fix") and procedure step 2 ("re-export every week that a … renamed finding points at") promise a remedy that does not exist for a collision. | Split the kind in two. **renamed** (same ID, same thing, wording drifted) stays advisory-like with record allowed. **collision** (the same ID defined by two weeks' own records) is a gate that a recorded reason cannot pass. Its message tells the team to renumber in the later week's tool, or accepts a defer with an owner and a carry-forward to Week 8. Key collisions per ID, not per prefix. In the index, keep both definitions (`EXT-001@W1`, `EXT-001@W4`) instead of first-wins. Report both upstream bugs to the Week 4 and Week 6 owners (EXT and O numbering should continue from the earlier weeks' IDs). Correct the fixture reason, T1 and step 2. |
| m1 | Minor | `workbench/week7/record.ts:386–389`; `workbench/week3/record.ts:145` | The tool reads requirements only from Week 2 and Week 5. AeroLink's headline stale finding F-01 rests on Week 3 writing REQ-STK-018/019 for NEED-011 (aerolinkCase :122–123). A team that follows the worked example and writes requirements in Week 3 (as "derived requirements" in the trade, free text) gets the opposite from the tool: NEED-011 is still childless, the Week 2 disposition is carried, and the stale disposition is missed. | Either parse IDs from Week 3 `trade.derived` (`REQ-… traces to NEED-…`) into the requirement set, or tell students on the slide and in the lab that requirements added after Week 2 must go into the Week 2 record and be re-exported. In that case the AeroLink narrative should say the same. |
| m2 | Minor | `workbench/week7/record.ts:488`, `:509`, `:541` | Carried dispositions are pre-filled as `record` without an owner, even when the earlier text is a deferral to a week that has passed. Fixture: NEED-003 "Deferred: … planned for Week 3" and NEED-008 "revisited in Week 3" pass as carried. A deferral's owner of "Week 10" passes (probe), although RID-004 teaches that "a week closes nothing" and T1 drops a level for it. The only signal is the generic "carried" advisory. | Add an advisory (never a block) when a carried reason names a week before 7 ("names Week 3, which has passed: say what happened") and when an owner is only a week ("a week is a date, not an owner"). |
| m3 | Minor | `workbench/week7/record.ts:490–496`, `:505–508`; `Week7LabTool.tsx:284–306` | Partial packages show spurious findings with no caveat. With Weeks 2–6 and no Week 1, the probe gives 15 findings, among them 6 `orphan` ("parent NEED-… does not exist") and `increment-unresolved:INC-004`, all caused by the missing file. The Part 29 gate is correctly blocked by `sources.ok`, but the list invites students to disposition noise, and those dispositions persist under stable keys. | Above the findings, while any week is missing: "Provisional: Week N not loaded; findings that depend on it are hidden". Suppress `orphan` and `childless-need` without Week 1, and `childless-stk` without Week 4, as is already done for `unallocated` and `cap-no-function`. |
| m4 | Minor | `content/lectures/week07/session1.ts:462` | R40 p.70 requires prior reviews' "action items closed". The notes restate our equivalent as "every open item you named there enters the package as a deferred finding with its owner". That is a tailoring, not an equivalent. AeroLink then enters the review with an item due *before* this review still open (PHY-006, RID-002), which the cited rule would treat as an unmet entry criterion. | Say it as tailoring: "DoD requires prior action items closed; Phase I open items are designed to carry into Phase II, so we require them dispositioned and owned. An item that was due before this review is the exception the chair checks at entry". RID-002 then becomes an entry-criterion finding, a better teaching point. |
| m5 | Minor | `content/lectures/week07/session2.ts:320`, `:325`, `:391` | The slide face says "Week 8 imports the closed package". The Week 8 tool still imports the Week 1 and Week 2 exports (milestone report §10.2). A student-visible claim of tool behaviour that does not exist. | Say "Week 8 starts from the closed package (its import is being built)" until the adapter exists, or gate the bullet on the adapter. |
| m6 | Minor | `content/week7Path.ts:127`, `:143–155` | Arithmetic reproduced: 2.5 + 0.7 + 0.5 + 1.9 (7.4 ÷ 4) + 1.0 + 0.3 + 0.2 + 0.1 = **7.2**; graduate 7.9; three-person team 6.8 person-hours (1.6 and 0.8 × 0.75), 2.3 each, 7.6. Unrounded: 7.14, 7.84 and 7.55. **Uncovered case: a graduate student on a three-person team: 7.6 + 0.7 = 8.3 h (unrounded 8.25) > 8.0.** | State the combined case and either reduce the memo for three-person graduate teams or take it to faculty with F8. |
| m7 | Minor | `content/lab/week07Lab.ts:214–222` vs `workbench/week7/record.ts:40`; `aerolinkCase.ts:248` | The RID form numbers findings "RID-1, RID-2" per reviewer; the tool's IDs are RID-001 per package; so do the case's. The form's "Criterion or source" and "Proposed fix" have no field in the tool's Rid (the AeroLink `CaseRid` has `criterion`). The criterion, which the lecture says makes a RID checkable (session2 :199–201), is lost when the owning team enters the RID. | Add `criterion` (and optionally `fix`) to Rid, and a gate requiring the criterion. The form says "the owning team numbers RIDs RID-001…". |
| m8 | Minor | `workbench/week7/record.ts:15`, `:759–784`, `:821–824` | "IDs issued (RID) are never reused" fails across a teammate share. `packageJson` omits `issued`, so after RID-002 is deleted and the package exported and imported, `nextRid` returns **RID-002** (probe; locally RID-003). | Export and import `issued`. |
| m9 | Minor | `workbench/week7/record.ts:509` vs `aerolinkCase.ts:146` | The tool makes one open-item finding per Week 6 review *row* (one disposition, one owner for every item in it). The case makes one per *item* (15), and RID-004 turns on per-item owners. Students see a different granularity from the worked example, and cannot give each item its own owner. | One finding per ID in `row.items` (fall back to the row when it holds no ID). |
| n1 | Note | `workbench/week7/record.ts:629` | A rejection passes with any two words ("Disagree strongly" passes; probe). The `reject-no-id` advisory flags it, and the gate table says a phrase is enough, so this is consistent with the stated rule. | Optional: make the advisory text say a reason is not evidence. |
| n2 | Note | `docs/lectures/week07/WEEK07_LECTURE_OUTLINE.md:3–9` | The outline was edited (revision banner), but the milestone report's file table does not list it. | List it. |

Checked and found correct: the six importers are each week's own (record.ts:148–183). Wrong format, Markdown, a list, text
versions, a Week 7 package in the weekly slot, AeroLink and a week stored in the wrong slot are all refused with
actionable messages (:136–143, :186, :363). The package format is versioned (`week7-package` v1) and documented. A
teammate import confirms before replacing work. Empty answers are rejected through the shared `emptyAnswer.ts`, and
short valid answers ("Duplicate", "TL", "R-002") are accepted. Gate reasons are student-visible. Routing, aliases and the
archive follow the Week 6 pattern. The no-quiz rationale is stated on the page (assessmentParts.ts:8–10). The old Exam 1
assumption is surfaced, not changed (`instructor/exams/exam1.ts:9` "week: 7"; Assessment page EXAM_NOTE). Every rubric
criterion (6 team, 2 individual, 4 graduate) has four distinct level descriptors (week07Lab.ts:198–211).

## Faculty items

- **FI-1 RIDs before the meeting (departure from the outline's Plan A).** It is sound on the source: SEBoK's participants
  analyse independently and then meet (R06c p.388), with the information made available ahead (p.387). Pedagogically it
  is the better design, because a meeting spent finding defects is wasted. Its cost is the calendar. Procedure steps 2–5
  put the audit, the summary, the briefing build and the upload "Day 1 after Session 1 / 24 h before Session 2". The peer
  team then has the remaining time to read another package and write at least two RIDs each. On a Tue/Thu cadence that is
  about 24 h each way. Also, the entry criterion "each reviewer has submitted at least two RIDs" makes one team's entry
  depend on another team's diligence. Recommend: release the Part 28 audit at the end of Week 6 (the exports exist then),
  and treat a missing peer RID set as the reviewer's I2 score, not the owner's entry criterion.
- **FI-2 Slot length.** Five teams get 4 min of briefing and 4 min of questions. "Every member presents" means about 1 min
  each, and a peer team holding at least 8 RIDs gets about 30 s per RID. The meeting can only sample RIDs. Say so: the
  chair picks the 2–3 major RIDs to discuss and the rest are answered in writing within the 3 days. Six or more teams
  remains a faculty decision.
- **FI-3 Exam placement:** `exam1.ts` still says week 7. This is a grading-policy decision, correctly left unchanged.
- **FI-4 No readiness quiz:** agree. The review, the I1/I2 individual criteria and the graduate memo assess the week.
- **FI-5 Three-person teams:** 7.6 h, and 8.3 h for a graduate student (m6).
- **FI-6 Proposed AeroLink content:** the PHY-006 disposition, the decisions needed and the four RIDs. Decide M1's fix
  (which overdue Week 2 items enter the audit) together with RID-001's wording.
- **FI-7 Upstream ID numbering:** the Week 4 EXT and Week 6 O issuing (M3) is a Weeks 4/6 tool change. It needs its owner
  and a re-export of the fixtures.
- **FI-8 Register:** P7-1 and P7-2 are staged and not cited. Confirmed.

## Recommended order of revision

M2 (small, mechanical, tests both ways) → M3 (split the kind and fix the index; file the upstream items) → M1 (case finding
plus counts; the decks and lab markdown regenerate) → m1–m9. Then re-run the Week 7 vitest set, `tsc -b`,
`build:student`, and the two e2e specs, since the fixture's dispositions change.
