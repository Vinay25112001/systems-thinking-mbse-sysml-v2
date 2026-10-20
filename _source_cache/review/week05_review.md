# Week 5 independent review: Components / Interfaces (package at commit 7ab45a5)

Reviewer: independent review (PhD systems engineering + senior web QA), not the author. Date: 2026-10-19.
This file replaces the 2026-10-11 review of the superseded Week 5 draft ("Requirement quality, traceability and
measures"), which is preserved in git history (`85da1bb`).

**Scope.** `src/content/lectures/week05/*`, `src/components/figures/LectureWeek5*.tsx`, `week5FigureKit.ts`,
`lectureWeek5Figures.ts`, `src/content/{week5Path,quizWeek5}.ts`, `src/content/lab/week05Lab.ts`,
`docs/lectures/week05/*`, `src/workbench/week5/*`, `src/week5/*`, `exports/lectures/week05-*` (both decks unzipped and
20 slide PNGs opened one by one).
**Checked against.** DECISION_LOG A20/A21 (item 6: security and resilience in Week 5); COURSE_PRODUCTION_PLAN.md
definition of done A–I; `WEEK5_MILESTONE_REPORT.md` incl. its gate-justification table; the Week 2, 3, 4 and 8
reviews and confirmations in this folder (recurring defect classes listed in §6).
**Method.** Case values recomputed in a scratch script outside the repo (jiti, importing the case read-only); 34
citations opened in `_source_cache` page text; all 368 R-page references in Week 5 sources range-checked by script;
throwaway lab-tool probe of about 110 cases (`src/workbench/week5/zz_review_probe.test.ts`, deleted after the run;
`git status` clean); Playwright under the `_source_cache/.playwright.lock` protocol (lock created as
`week05-reviewer`, deleted after). No source file was edited and nothing was committed. Paths below are relative to
`learning-studio/` unless they start with `_source_cache/`.

## Verdict: **REVISE**

**Blocker 0 · Major 2 · Moderate 6 · Minor 22.**

The package is strong. The lecture is deep and teachable. Every number is computed from the case, and every
citation is in range. The case imports Weeks 1–4 instead of copying them. The N² arithmetic, the crossing-flow
check, the ICWG count and the latency arithmetic are all correct. IF-015 genuinely closes the INFO-006 route gap:
removing it uncovers exactly the pad-incident flow. The new requirements pass Week 2's own gates. The web gates are
green.

Two defects stop sign-off:
- **M1.** The trust-boundary and hidden-external rule classifies the air-ground radio datalink as safe unless a
  segment is leased. That contradicts the MITRE sentence (R54 p.331, "radios connect subsystems via airwaves") that
  the same lecture quotes.
- **M2.** The lab tool repeats the Week 2 M1 / Week 4 M2 defect class. Unstated word-count minimums reject answers
  the lecture itself calls complete ("Fail safe", "Power only", "Approved"), although the milestone report says this
  class is "prevented by construction".

Both have small, mechanical fixes.

### What holds up (checked, with evidence)
- **Case recomputed independently.**
  - Received set: 14 interfaces = 3 physical, 9 information, 2 organizational; 4 external (IF-003, 006, 007, 011).
  - Degrees: PHY-004 9, PHY-001 4, PHY-006 0. Sum 28 = 2 × 14. 12 of 105 pairs joined. 4 empty rows.
  - After this week: 16 interfaces, sum 32. PHY-004 has degree 10.
  - 20 crossing flows, 20 covered. Removing IF-015 uncovers exactly `FN-016: pad incident records`.
  - Trust boundaries: 12 crossing / 3 possible / 1 none (as the rule is written; see M1).
  - ICWG: 7 organizations over 11 cross-owner interfaces. Seat counts 9, 8, 1, 1, 1, 1, 1 sum to 22 = 2 × 11.
  - Coupling: A has X = 14 of 23 (κ 0.61), P 6, Dmax 5; B has X = 20 (κ 0.87), P 10, Dmax 5, and 4 pairs with no
    information interface.
  - Integration groupings: 6 vs 4 between aggregates, 5 external.
  - Latency budget: 30 + 30 + 30 = 90 s of 120 s, margin 30 s.
  - ICR-001 neighbours: IF-001, 002, 006, 010, 013.

  All match the slides, the lesson, the Examples page and the figures.
- **Imports, not copies.** `aerolinkCase.ts:25–30` imports Weeks 1–4. Ends and types are read through
  `W4(...)` (`:117–121`). Information-interface carries and directions are computed hop by hop from the Week 4
  routes (`carriesOf`, `:249–263`).
- **REQ-SYS-013..015** pass the Week 2 `assessRequirement` gates in a genuine test (`aerolinkCase.test.ts:216–235`,
  using the real Week 2 record and gates, not a stub). Each names its interface, and that interface lists it.
- **Citations.** 368 R-page references; 0 out of range; 0 unknown IDs. 34 spot-checked (table in §4). Both real
  quotations are verbatim (R13 p.563, R101 p.1467). R100–R104 headings exist on the cited pages.
- **The Week 3 overstatement class is not repeated.** Defense in depth is its own entry on R24 p.1206.
- **N² convention.** The claim that no held source states a row/column rule is true. N-squared appears only at SEBoK
  pp.623, 630–631. The course's "row produces, column consumes" matches the usual outputs-on-rows convention and is
  labeled a course convention in the lesson and the notes (but not on the slide face: n1).
- **Timing.** Both sessions are 69 min of content plus a 6 min buffer = 75. Spoken notes run at most 92 wpm on any
  slide (lab-launch slides are 6–27 wpm by design), never above 130. Worked slides meet their minimums. Lab launch is 22 min.
- **Exercises precede reveals:**
  - driving question (S1 sl.2), answered on sl.17;
  - table row (sl.18), answered on sl.19;
  - degrees (sl.14), revealed on sl.15;
  - trust-boundary pair question (S2 sl.6), answered on sl.9;
  - audit findings in the notes only.

  Exceptions are n9 and n10.
- **Downstream links.** The feeds slide and lesson name Weeks 6, 7, 11 and 12 concretely (`session2.ts:586`,
  `:591–593`). Limits are stated honestly (`session2.ts:560`, `:565–566`).

---

## 1. Findings

Severity: **Major** = must fix before sign-off; **Moderate** = should fix before teaching; **minor** = author's
discretion or quick fix.

### M1 (Major). The radio datalink is classified as inside the trust boundary unless "leased", contradicting R54 p.331 as quoted in the same lecture

**What happens.**
- The lecture quotes MITRE (`session1.ts:121`): hidden external interfaces appear when internal communications use
  an external medium "such as radio, a satellite relay or an outside network". The source text agrees
  (`_source_cache/se_guide_book_interactive.txt:15654–15657`, R54 p.331: "radios connect subsystems via airwaves").
- The case puts the air-ground datalink inside PHY-006 (`aerolinkCase.ts:123`, `datalink = 'air-ground datalink
  (PHY-006)'`). The trust-boundary rule (`:279–293`, course convention) has four reasons, and none of them covers
  radio.
- IF-002 (release and plan to the aircraft) and IF-013 (health data) are therefore listed as crossing "possibly:
  only if a network segment is leased" (`session2.ts:44`, `:100`, `:433`; figure strip "12 crossing · 3 possible ·
  1 none", `s2/image-9-1`).
- The hidden-external finding F6 (`aerolinkCase.ts:548`) makes the issue depend only on ownership.
- The tool's hidden-external advisory regex misses "Wi-Fi", LTE/4G, VPN and API media (probe; `record.ts:39`).
- IF-002 is the interface whose own protection cell says "a forged release is a flight hazard" (`:138`). IF-013
  names only an integrity check, with no authentication (`:210`).

**Failure scenario.**
- A student applies the cited source and asks why an RF link "anyone with a transmitter can reach" crosses no trust
  boundary. The reference has no answer.
- A team whose enterprise uses Wi-Fi or a cellular link of its own gets neither a crossing nor the advisory, so
  the tool never prompts for protection.

This is the A21 item 6 content the week exists to teach.

**Fix.**
- Add a fifth reason to `boundaryReasons`: "the medium is radio or another medium outsiders can reach", per R54
  p.331. Alternatively, classify every interface over the datalink as a hidden external interface on R54 alone.
- Recompute the counts. They become 14 crossing; possible: IF-012 only; none: IF-004.
- Add authentication to IF-013.
- Update the slide, lesson, figure and F6 text (all computed, so the update is mechanical).
- Widen the tool's hidden-external pattern to radio, Wi-Fi, cellular, satellite, VPN and the internet.
- Add both-direction tests.

### M2 (Major). Unstated word-count gates reject entries the lecture calls complete: the Week 2 M1 / Week 4 M2 class again

**What happens.** The probe rejected the following valid entries (each a hard gate, so the entry does not count):

| Gate (code) | Threshold | Valid input rejected | Lecture says |
|---|---|---|---|
| protection or reason (`record.ts:402`, `MIN_PART_WORDS` `:34`) | ≥ 3 words, **not stated** in `labBrief.ts:139` | "Power only", "TLS", "Mutual TLS" | "A power cable carries no data, and saying so is a complete answer" (`session2.ts:86`) |
| degraded mode (`:404`, `MIN_TEXT_WORDS` `:35`) | ≥ 5 words, **not stated** (`labBrief.ts:140`) | "Fail safe", "Hold all departures", "Fall back to radio", "Switch to manual procedure" | slide face: "**Fail safe**: treat a missing status as the unsafe value" (`session2.ts:385`) |
| CR decision (`:546`) | ≥ 3 words, **not stated** (`labBrief.ts:163`) | "Approved" (decider "ICWG") | "the owners decide" (`session2.ts:287`) |
| external reason (`:637`) | ≥ 5 words, **not stated** | "No arrangement yet", "Natural system: no exchange" | the reference's own dispositions say exactly this, in more words (`aerolinkCase.ts:536–537`) |
| change text (`:540`) | ≥ 5 words | "Add encryption to IF-006" | — |
| responsibility (`:345`, `:358`) | ≥ 3 words | "Charges aircraft", "Raises alarms" | "the responsibility in one sentence" (`session1.ts:99`) |
| criterion (`:523`) | ≥ 3 words | "2 min", "TBD (Ops)" | "≤ 2 min" passes, so a typographic symbol decides |

`labBrief.ts:12–15` and the milestone report (`WEEK5_MILESTONE_REPORT.md:165`, §9 at `:253`) claim that "no gate
tests a name's form, its length beyond one word". That holds for names only.

**Failure scenario.**
- A team copies "Fail safe" from the slide into its degraded-mode cell, and the interface stops counting toward
  the minimum of 8.
- A change request recorded as "Approved" by the ICWG fails Part 22.

This is exactly what Week 2 M1 and Week 4 M2 (both majors) were about, and Week 5 claims to have designed against it.

**Fix.**
- Require ≥ 1 word for protection/reason, decision and external reason.
- Require ≥ 2 words (or 1 word plus an advisory) for degraded mode, change, responsibility and criterion.
- Count a value with a unit ("2 min") as a criterion.
- State any remaining threshold in the gate text so that the generated table shows it.
- Add the rejected inputs above as accept-direction tests in `record.test.ts`.
- Correct the "by construction" claim in `labBrief.ts` and the report.

### Mo1 (Moderate). The IF-015 decision is justified on a miscount: the relay adds one new interface, the same as the direct option

**What happens.**
- Alternative B is "a new interface from the fire detection system to the vertiport systems, then on over IF-014"
  (`aerolinkCase.ts:396`). That is one new interface, so both options end with 15.
- The rationale says "The relay adds an interface" (`:400`), and `counts: { direct: 1, relay: 2 }` (`:401`).
- The slide notes say "the relay costs one more interface than the direct path" and tie this to SEBoK's aim of
  fewer physical interfaces (R20c p.599; `session1.ts:143`, `:715`).
- The answer figure compares "1 new interface" with "2 interfaces" (`s1/image-17-1`, `session1.ts:704–708`).

This is the Week 4 M1 class: a decision whose stated reason does not match the data.

**Failure scenario.** A student counts the N² after each option, gets 15 both times, and the cited SEBoK
justification collapses in front of the class.

**Fix.**
- State the real differences: the relay puts a second system (and a second owner's availability) in the path,
  adds INFO-006 to IF-014's items, and needs the vertiport systems to forward records.
- Keep R20c p.599 only for the path argument, or drop it.
- Change `counts` to new interfaces (1 / 1 / 0) and the card text to "1 new interface · path of 2".

### Mo2 (Moderate). The REQ-SYS-014 rationale and the IF-011 degraded mode get the forecast time coverage wrong

**What happens.**
- IF-011 delivers "a forecast … at least every 10 min, valid for the next 30 min" (`aerolinkCase.ts:196`).
  REQ-SYS-004 needs the forecast "within the next 30 min".
- The rationale claims that a 10 min refresh "keeps that window covered with two spare refreshes if one is lost"
  (`:427`, shown on the Examples page `src/week5/Examples.tsx:201`).
- In fact a 30 min forecast received 10 min ago covers only 20 min ahead, so the 30 min look-ahead is fully covered
  only at the instant of receipt, and there is no spare at all.
- The degraded mode holds only when the forecast is "older than its 30 min window" (`:199`), by which point it
  covers 0 min ahead.

**Failure scenario.** A sharp student works the timeline. The worked interface requirement and the fail-safe rule
are then both shown to be inconsistent with the requirement they refine.

**Fix.**
- Set the forecast horizon to at least 30 + 10 min plus a margin (for example 60 min).
- Restate the rationale as horizon − interval ≥ 30 min.
- Make the degraded trigger "the newest valid forecast no longer covers the next 30 min".

### Mo3 (Moderate). Assessment: no applied-exercise brief, a graduate scale that does not map, and a 35-minute task that is overfull (the Week 4 Mo5 / N6 classes again)

**What happens.**
- The ferry case is "released on the LMS" (`src/week5/Assessment.tsx:77`), but no `WEEK5_APPLIED_EXERCISE_BRIEF.md`
  exists. Week 4 has one; it was the Mo5 fix. There are no elements, exchanges, requirements or marking notes, so
  graders cannot mark consistently.
- The exercise is scored as 5 × 4 = 20 points (`:85`). The graduate replacement has 2 criteria = 8 points
  (`week05Lab.ts:280–281`), with no mapping. This is Week 4 N6 again.
- Five tasks in about 35 min is overfull: 5–7 components with a sub-breakdown, an N² with degrees, two full
  definitions with security columns, an interface requirement and a change trace.
- Quiz items Q3 and Q11 use ferry contexts, the same domain as the exercise.

**Fix.**
- Write the brief with marking notes.
- State the 8 → 20 mapping, or add a third graduate criterion and scale it.
- Cut the exercise to four tasks or extend it to 50 min.
- Move Q3/Q11 to another domain.

### Mo4 (Moderate). The modularity figure cannot be counted as its walk instructs

**What happens.**
- The walk says to count "the five heavy ones crossing the module boundary aloud" (`session1.ts:851`).
- In the right panel of `s1/image-21-1`, the heavy B–F link passes through node D (`LectureWeek5S1.tsx:911–917`).
  It reads as B–D plus a heavy D–F drawn over the thin inside link, so a class counts six.
- In the left panel, A–B runs through F and D–E grazes F.

The milestone report (`:247`) says the modularity link count was fixed. The caption was fixed, but the geometry
still misleads.

**Fix.** Move the nodes so that no link passes within radius + 8 px of a node it does not join. Add a
point-to-segment distance test to the figure tests.

### Mo5 (Moderate). The integration grouping teaches a degenerate criterion without its limit

**What happens.**
- "The second wins on SEBoK's criterion" (`session2.ts:495`). G2 is a 2 + 6 split (`aerolinkCase.ts:494–503`).
- Minimizing between-aggregate interfaces with no balance constraint is trivially won by lopsided groupings: one
  aggregate of everything gives 0.
- The lesson and notes never say that aggregate size and integration order matter too.

**Failure scenario.** Teams "optimize" their own grouping into one giant aggregate and cite the lecture.

**Fix.** Add one sentence: compare groupings of similar size, and weigh the interfaces between aggregates against
the size of the largest aggregate and the order in which owners can deliver. Keep the computed counts.

### Mo6 (Moderate). The latency budget, a Week 4 hand-over, is taught on no slide, and its key design decision is unexplained

**What happens.**
- The 120 s budget appears only in the lesson table (`session2.ts:144`), the Examples page and the limits-slide
  notes (`:565`), which are stripped from the student build.
- Leg 2 introduces "automatic provisional no-go on any fault code in the no-go list, before a technician classifies
  it" (`aerolinkCase.ts:449`). That is a real architectural change: Week 4 says "only [certifying technicians] may
  classify a fault" (`week04/aerolinkCase.ts:219–220`), and CMP-014 "classify every fault" (`aerolinkCase.ts:82`).
- The budget meets REQ-SYS-008 only because of this automation, and nothing says so or why.
- The IF-013 degraded mode (download on arrival, `:211`) also means the 2 min cannot hold during link loss. That is
  acceptable, but should be stated.

**Fix.**
- Give the budget a slide-face table, or a bullet on the limits slide.
- Add one sentence: technician classification cannot meet a 30 s leg, so an automatic, conservative provisional
  no-go is proposed; the technician still classifies and alone returns the aircraft to "go".
- Note the in-flight link-loss exception.

### Minor findings

| # | Finding (file:line) | Failure scenario | Fix |
|---|---|---|---|
| n1 | The N² conventions are unlabeled on the slide face: the bullets "written once above the diagonal" and "the row produces, the column consumes" sit under R22 pp.630–631 (`session1.ts:579`, `:583`). The label is only in the stripped notes (`:589`) and the lesson (`:131`). | A slide-viewer student cites the row rule as SEBoK's. | Add "(course convention)" to the bullet or caption. |
| n2 | The slide face cites SEBoK R24 p.1205 for the course's own definition of "fail safe" (`session2.ts:385`). SEBoK only lists fail-safe as an example under *continue*. | Overstatement, Week 3 class. | Label it "course default"; optionally add R24 p.1207 "safe state". |
| n3 | The lesson says "On every count the chosen platform is less coupled" (`session2.ts:135`), but "Most partners" is 5 vs 5 in its own table (`:131`). The slide correctly says "On κ and P" (`:536`). | The lesson contradicts its table. | "On κ and P". |
| n4 | IF-001 flows list "boarding and alighting passengers" PHY-002 → PHY-001 and also "alighting passengers" PHY-001 → PHY-002 (`aerolinkCase.ts:130`). Alighting is listed in both directions. | The Examples direction column is wrong. | PHY-002 → PHY-001 "boarding passengers"; PHY-001 → PHY-002 "alighting passengers". |
| n5 | Week 4 N1 is still unresolved and now load-bearing. FN-010's only output is the alarm to EXT-006 (`week04/aerolinkCase.ts:229–232`), yet FN-016's "pad incident records" names FN-010 as source (`:267–268`), and IF-015 carries them. | "Which function at the fire alarm produces incident records?" has no answer in the case. | In the Week 4 source (Week 5 imports it): add the output "pad incident record → PHY-004 (INFO-006)" to FN-010. |
| n6 | Two crossing-flow counts appear without explanation: 20 (`session1.ts:680`, including external routes) and "14 of 23" (S2 sl.12, function-to-function only). | Students think one number is wrong. | One sentence on S2 sl.12. |
| n7 | The worked-security alt text lists every protection measure and IF-006's enforcement point, while the cards draw counts and one example each (`session2.ts:410`, `s2/image-9-1`). | Alt text promises more than is drawn (Week 4 Mo1 class). | Shorten the alt text, or draw the measures. |
| n8 | Trust-boundary figure example 4 ("public network") joins the same pair as example 3, whose ends also have different owners. The leased-network line has only one end (`s2/image-6-1`). | The figure does not isolate reason 4. | Draw example 4 between two same-owner internal elements through the cloud, and give the leased line two ends. |
| n9 | Change-control exercise: "ask pairs, in one minute, which other interfaces could be affected" (`session2.ts:294`) is asked while the figure already shows the neighbours and the filled "reached" cells (`:276–279`). | The answer is on screen during the exercise. | Pose it on S2 sl.4 before advancing (as done for the worked N²), or split the figure. |
| n10 | "Take answers … before revealing each card" (`session2.ts:426`), but all three cards are on one static figure. | No per-card reveal is possible in the deck. | Say "before advancing", posing the question on sl.6–8. |
| n11 | Worked N² timing contradiction. The notes say to count degrees "before you advance" (`session1.ts:625`); the timing puts the count after advancing (`:637`). The notes also call the nine IDs "the operations center row" (`:629`), but four sit in the column of the upper-triangle layout. | The instructor follows one sentence and contradicts the other. | Align them; say "row and column". |
| n12 | The student lesson says "the case test checks both" (`session1.ts:96`). | Internal test tooling leaks into student text. | "The reference was checked so that …". |
| n13 | The WBS example contradicts its own sentence: "“design the app” … belong[s] in a WBS" (`session1.ts:84`) straight after "outcomes, not actions". | Students learn action-named WBS elements. | "the app design", "integration test results". |
| n14 | Lab gate basis labels: "Layers and the breakdown" matches no slide (`labBrief.ts:122`). The one-shall basis cites a section that never states the rule (`:152`). The `name` basis adds "and assigned" to the glossary (`:121`). The `impact` basis says the N² row and column "show every neighbor the change can reach (after R22 p.631)" (`:162`), but R22 p.631 is about fault location, and the lesson calls them candidates (`session2.ts:70`). The fallback titles in `week05Lab.ts:37–66` are stale. | A student following the reference finds nothing there. | Correct the strings, or resolve them by slide id. |
| n15 | Hard checks are missing from the 26-gate table: ICWG ≥ 2 organizations (`record.ts:674`), standards ≥ 3 words (`:675`; "None apply" fails), reused requirement ID (`:652–653`), duplicate IDs. | A block with no published basis. | Add them to `PART_RULES` with a basis, or make them advisories. |
| n16 | Owners are compared as text with only case and spacing normalized (`record.ts:145`, `:372`). | "Ops" vs "Operations" creates a false trust-boundary crossing. | Pick owners from the card owners, or add an advisory. |
| n17 | An interface between two external elements is accepted and counts (`record.ts:379–385`). | A team meets the minimums without touching its own system. | Gate or advise: at least one end inside the system of interest. |
| n18 | Importing a teammate's file replaces the record without confirmation (`Week5LabTool.tsx:171–176`). | Silent overwrite (A22). | Confirm when the record is not empty. |
| n19 | A capitalized method ("Test") in an imported file is silently dropped (`record.ts:199`). | The requirement fails its method gate after import. | Lower-case before validating. |
| n20 | Quiz residual cues (every mechanical rule passes; recomputed in §5). The hedged key in Q2 and Q12 is the only non-absolute option. The Q4 per-position majority yields the key. Q5 omits the likeliest wrong answer ("five"). Q10 distractors are all same-owner links. Q11 c is wrong only through its stated reason. Q12's key needs a current link count the stem does not give. | "Pick the moderate option" scores 2/12. | Add hedged wrong distractors; vary Q4 parts; offer "five"; give the link count in the Q12 stem. |
| n21 | Some quiz explanations rely on unseen content: Q7b "simplest approach", Q12c "disaggregation", Q3's program-office clause of R104 p.104. | Answerable only by elimination. | Add the clause to the lesson, or reword the explanations. |
| n22 | Stale status text (Week 4 N4 class): `WEEK5_MILESTONE_REPORT.md:4` says "Nothing is committed"; the package is commit `7ab45a5`. | — | Update. |

Figure legibility (cosmetic; folded under n7–n8, fix at discretion; seen in the PNGs):
- Text overflows three worked-breakdown boxes ("High-power turnaround chargers", "Flight management and health
  monitoring", "Planning and evidence services").
- The external corner mark covers the last digit of IF-003, IF-006, IF-007 and IF-011 (`s1/image-14-1`).
- On the change-control chart, the IF-005 label touches IF-001, and the "reached" fill is close to the physical
  fill (`s2/image-5-1`).
- On the integration figure, all pills use the physical style, and the line strikes through every label
  (`s2/image-11-1`).
- The IF-015 label collides with its arrowhead (`s1/image-17-1`).

## 2. Item-by-item against the brief

1. **Depth, teachability, why/downstream, limits, timing.**
   - Graduate-level depth. Every slide has teach / why / walk / misconception / transition / timing, and the worked
     slides carry full solutions.
   - The why is explicit on every slide. Downstream links to Weeks 6, 11 and 12 are concrete. Limits are on S2 sl.13.
   - Timing is ≤ 75 min, and spoken notes run ≤ 92 wpm (≤ 130 required).
   - Exercises precede reveals except n9 and n10.
   - Session 1 is dense (21 content slides in 69 min), but its wpm is low. If anything slips, the notes say what to
     cut (`session1.ts:222`).
2. **Technical correctness.**
   - Component hierarchy, the 15288 element kinds, SBS vs WBS (except n13), logical vs physical, interface definition
     and the three-step interface requirement are all correct and sourced.
   - The N² construction and reading conventions are sound, the output-row convention is standard, and the source
     gap is honestly stated (except n1).
   - ICD content is a labeled course convention. Change control rests on DoD/SEBoK/MITRE, and the impact method is
     labeled as the course's.
   - Security and resilience are well sourced (R24/R25 exact), except M1 (the radio medium) and n2.
3. **AeroLink.**
   - Consistent with Weeks 1–4 by import. The 14 interfaces on the N² are right.
   - IF-015 closes the INFO-006 route gap genuinely (removal test). Its decision rationale is miscounted (Mo1), and
     the producing function is missing upstream (n5).
   - IF-016 closes the EXT-004 row with a sound organizational interface.
   - REQ-SYS-013..015 pass the Week 2 gates. The latency arithmetic is right but under-explained (Mo6). The coupling
     counts are right (lesson wording n3).
   - Figures were checked against captions, alt text and walks in 20 PNGs (Mo4, n7, n8, legibility).
4. **Lab tool.** See §3. Real defects are rejected. Imports work both ways and the export is versioned. The tool
   rejects valid input through unstated word minimums (M2).
5. **Quiz.**
   - Keys are balanced 3/3/3/3 with no run of three. Key length ranks are 3 each. No key is a 1.4× / 0.7× outlier.
     The farthest-length option is the key 0/12. No grammar, article or absolute cues.
   - All items are answerable from student-visible text. Contexts are unseen and not AeroLink.
   - Residual soft cues: n20, n21.
6. **Web.** No review codes, DECISION_LOG, "new-pending-review" or raw internal status in student pages or the tool
   (only "pending faculty approval", as in earlier weeks). The student build check passes. Playwright is green (§7).
   n12 is a leaked tooling phrase.

## 3. Gate-table audit (26 hard gates, 8 advisories; `labBrief.ts:120–181`, enforced in `record.ts`)

The student build strips only slide `notes` and `purpose` (`student-edition.ts:19–41`). Slide bodies, captions,
alt text and the lesson are student-visible.

| Gate | Code | Student-visible basis | Judgment |
|---|---|---|---|
| Component name (one word) | record.ts:354 | s1 lesson :71 | Justified |
| Component parent | :355–356 | s1 :75; slide :334 | Justified (label n14) |
| Component kind | :357 | s1 :71 | Justified |
| Component responsibility ≥ 3 words | :358 | s1 :99 "in one sentence" | **Weak**: threshold not taught (M2) |
| Card responsibility ≥ 3 words | :345 | s1 :99 | **Weak** (M2) |
| Card owner | :347 | s1 :99; slide :458 | Justified |
| Interface ends | :379–385 | s1 :108; R100 / R20c | Justified (ext–ext gap n17) |
| Interface kind | :391 | s1 :110 (labeled convention) | Justified |
| What crosses | :392 | s1 :175 (R13 p.563) | Justified |
| Direction (not organizational) | :394–396 | s1 :154; slide :745 | Justified (course convention) |
| Medium | :397 | s1 :122 | Justified |
| Owner per side | :399 | s1 :99; s2 :56 | Justified |
| Protection or reason (≥ 3 words) | :402 | s2 :86; slide :329 | Rule justified; **threshold unstated and contradicts the lecture** (M2) |
| Degraded mode (≥ 5 words) | :404 | s2 :98; slide :385 | Rule justified; **threshold unstated; the slide's own "Fail safe" fails** (M2) |
| One "shall" | :519 | Week 2 rule | Justified; the cited Week 5 section never states it (n14) |
| Names its interface | :521 | s1 :175 | Justified |
| Criterion ≥ 3 words | :523 | Week 2 rule | **Weak**: "2 min" fails (M2) |
| Method | :525 | Week 2 rule | Justified |
| Parent exists | :526–530 | Week 2 rule | Justified |
| CR names an interface | :538 | s2 :70; slide :287 | Justified |
| CR change ≥ 5 words | :540 | s2 :70 | **Weak** (M2) |
| CR impact from N² | :542–545 | s2 :70 | Justified (basis wording n14) |
| CR decision (≥ 3 words) and decider | :546 | slide :287 "the owners decide" | Decider justified; **decision threshold unstated** (M2) |
| Part: externals (reason ≥ 5 words) | :637 | s1 :138 (R55 p.369) | Rule justified; **threshold unstated** (M2) |
| Part: crossing flows / relays | :490–513, :638 | s1 :141 (R22 p.630) | Justified; hop order checked |
| Part: ≥ 1 security-linked interface | :551–557, :687 | slide S2 sl.9 step "Link" | Adequate (always satisfiable from the Week 3 register) |

The eight advisories are correctly non-blocking, and each reason given is valid. The `hidden-external` pattern is too
narrow (M1).

**Probe, accept direction (correct):**
- organizational interface with no direction; two-way direction as text
- media "Wi-Fi" and "SFTP over internet"; owner "Ops" (case and spacing normalized)
- Unicode names; one-word "what crosses"
- component ends; AI-001 resolved to its host; lower-case IDs on import
- "SHALL", "shall not"; lower-case parent and impact IDs; a stakeholder requirement as impact; "ICWG" as decider
- two-hop relay; reasons "none: same owner, private cable" and "No data cross"
- the fixture reaches "ready"

**Probe, reject direction (correct):**
- same ends; AI end at its own host; unknown or hostless ends
- missing kind, what-crosses, direction (physical and information), medium or owner
- crossing with no protection and no reason; no degraded mode
- two shalls or none; unknown interface; no method; unknown parent
- change request with an unknown interface, no or unknown impact, or no decision or decider
- removed relay or relay in the wrong order
- external with no interface and no reason; no security-linked interface

**Imports:**
- The Week 4 importer accepts `week4-model-inputs` v1. It refuses `{}`, `[]`, a string, `null`, wrong format,
  version 2, version "1", missing version, a Week 3 file, a Week 5 file, AeroLink (any case), no physical elements
  and invalid JSON, each with an actionable message.
- The Week 5 importer refuses a Week 4 file, `{}`, `[]`, version 2, version "1", interfaces given as an object, a
  bad ID, and AeroLink.
- The export carries `format: week5-model-inputs`, `version: 1`, and round-trips to "ready".

**Probe, wrong outcomes:** all are listed in M2. Plus "None apply" for standards (n15) and owner text mismatch
(n16).

## 4. Citation spot-check (34 opened; full range check 368 / 368 in range)

| # | Where | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | s1:60 | IM defines, controls, communicates; design through operations | R57 p.410 | exact paraphrase |
| 2 | s1:60 | Uses of documented interface requirements | R47 p.140 | supported |
| 3 | s1:71 | System element (15288) definition and kinds | R102 p.1643 | exact |
| 4 | s1:71 | "one of the parts that make up a system"; complexity and specialist disciplines | R101 p.1467 | verbatim |
| 5 | s1:75 | Layers; five plus or minus two a guideline | R20c p.597 | exact |
| 6 | s1:84 | SBS (IEEE 1220 wording) | R103 p.1640 | exact |
| 7 | s1:84 | WBS product-oriented, non-overlapping, dictionary, outcomes | R104 p.104 | supported (example n13) |
| 8 | s1:86 | Logical vs physical configuration items | R19 p.571 | supported |
| 9 | s1:86 | Physical architecture: elements, physical interfaces, externals | R20c p.597 | supported |
| 10 | s1:99 | Roles, responsibilities, funding, scheduling | R47 p.139 | exact |
| 11 | s1:108 | Shared boundary between two functional units | R100 p.1541 | exact |
| 12 | s1:108 | Binds two elements; protocols, procedures, documents | R20c p.597 | exact |
| 13 | s1:108 | Functional and physical connections at boundaries; many types | R57 p.411 | exact |
| 14 | s1:110 | All three course kinds are physical in SEBoK's sense | R20c p.597 | supported inference, labeled |
| 15 | s1:121 | Hidden externals via radio, satellite, outside network | R54 p.331 | exact (the case contradicts it: M1) |
| 16 | s1:121, :138 | All external interfaces included; hidden external | R55 p.369 | exact |
| 17 | s1:131 | N-squared after Grady; aggregates and order | R22 p.630 | exact |
| 18 | s1:131 | Reorganize coupling matrix; locate faults | R22 p.631 | exact |
| 19 | s1:131, :589 | No held source states the N² conventions | grep of all sources | accurate |
| 20 | s1:141 | Every interface and interaction verified | R22 p.630 | exact |
| 21 | s1:143, :178 | Aims: fewer interfaces, modularity, resilience | R20c p.599 | supported (applied wrongly: Mo1) |
| 22 | s1:178 | Modularity practice; focus on interfaces | R20c p.603 | exact |
| 23 | s1:152 | One consistent attribute framework incl. use; early | R57 p.413 | exact |
| 24 | s1:152 | Outputs incl. ICDs | R57 p.411 | exact |
| 25 | s1:175 | Interface requirement; three steps; ICD 123 quote | R13 p.563 | verbatim ("write last" a gloss) |
| 26 | labBrief:154 | Criterion or TBD with owner | R13 p.565 | supported |
| 27 | s2:53 | Identify / define / manage / ensure compliance; CM plan; iterative | R47 pp.138–139 | supported |
| 28 | s2:56 | Governance; loosely coupled harder; ICWG sole purpose; IM plan | R57 pp.412, 414; R47 p.140 | exact |
| 29 | s2:60 | Standards, SLAs; MOSA, insertion; enablers | R57 p.413; R47 p.139; R20c p.596 | exact |
| 30 | s2:69 | Baseline snapshot; functional baseline incl. interfaces; deprecate prior versions | R36 pp.498–499; R57 p.414 | exact |
| 31 | s2:85 | Only authorized interactions; alteration…destruction; adversity via connected systems | R25 pp.1229, 1231, 1234 | exact, each on the cited page |
| 32 | s2:88 | Preserve integrity; constrain; boundary enforcement; domain separation; diversification; defense in depth; least privilege; loose coupling | R24 pp.1205–1207 | exact |
| 33 | s2:97, :385 | Degrade gracefully; continue (fail-safe example); fail soft; loss dispersion and duration | R24 pp.1205, 1207; R25 p.1233 | supported (slide-face gloss n2) |
| 34 | s2:146 | Parts, ports, interfaces, flows from slide 18 | R71 sl.18 | supported |

R100–R104 (`_source_cache/verification/readings.py:200–204`; `readings_verified.txt:136–140`): the heading line is
present on each cited page. The titles, source files and single-page ranges are sound.

## 5. Quiz mechanics (recomputed independently)

| Check | Result |
|---|---|
| Keys | a c b d a b d c b a d c: 3 each, no run of three |
| Key length rank (1 = longest) | 2 4 1 3 4 2 1 3 4 1 2 3: three of each |
| Key length vs mean of the others | 0.82–1.25: no 1.4× / 0.7× outlier |
| Farthest-length option is the key | 0 / 12 |
| Stem-word overlap | the key never has the most overlap |
| Grammar, article, absolute, "all of the above" cues | none |
| Answerable from student-visible text | 12 / 12 (three only by elimination: n21) |
| Contexts | unseen, none AeroLink; Q3 and Q11 share the exercise's ferry domain (Mo3) |

## 6. Recurring defect classes (Weeks 2, 3, 4, 8): repeated or not

| Class (origin) | Week 5 |
|---|---|
| Tool rejects valid input by form or length (W2 M1, W4 M2, W4 N3) | **Repeated**: M2 |
| Gap closure fails the course's own gates (W3 M2) | Not repeated: REQ-SYS-013..015 pass Week 2 gates (genuine test) |
| Decision justified on the wrong data (W4 M1) | **Repeated in small form**: Mo1 |
| Figure / alt text / walk disagree (W4 Mo1, N7) | **Partly repeated**: Mo4, n7, n8, legibility |
| Gate basis only in stripped speaker notes (W4 N2) | Not repeated for the rules; the thresholds have no basis at all (M2) |
| Quiz length / position cues (W3 m3, W4 Mo6, N5) | Not repeated; soft cues remain (n20) |
| Source overstated (W3 note 2) | Not repeated for defense in depth; n2 (fail safe) is minor |
| Direction / convention stated against the source (W8 M1) | N² convention correct; **the medium rule contradicts the cited source**: M1 |
| Grading scales not comparable; missing exercise brief (W4 N6, Mo5) | **Repeated**: Mo3 |
| Stale status text (W4 N4) | **Repeated**: n22 |
| Unresolved upstream data (W4 N1) | Carried over and now load-bearing: n5 |

## 7. Gates (run 2026-10-19 from `learning-studio/`; shared working tree with other agents' uncommitted Week 9/11/12 edits)

| Gate | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npx oxlint src` | exit 0; warnings only, all pre-existing `only-export-components` in Week 3/4 figure files; **none in Week 5 files** |
| `npx vitest run` (full, parallel) | 1826 / 1829. The 3 failures are `src/activities/week07` (2) and `week11` (1): a 30 s timeout, plus a cascade under load. Rerun alone: **104 / 104 pass**. Week 5 subset (case, timing, quiz, lab, record, tool DOM, exampleParts, `lectures.test.ts`, `content.test.ts`): **193 / 193** |
| `npx vite build` | ✓ (chunk-size warning only) |
| Student build (`vite build --mode student --outDir dist-student` + `scripts/check-student-build.mjs`) | **PASS**. The Week 5 instructor decks keep 23 / 19 notes slides (47,477 / 36,332 chars); the student decks are stripped |
| Playwright `e2e/week5-flow.spec.ts` (workers = 1, lock `week05-reviewer`) | **6 / 6** (dashboard, walk, lab-tool import and export, archive, axe light and dark at 1440 and 400 px) |
| Playwright `e2e/lectures-week5.spec.ts` (lectures config, port 5198) | **4 / 4** (viewer, axe every slide with notes light and dark: no violations; 400 px no horizontal scroll) |

The dev server on 5173 was left running. The lock was created before the runs and deleted after them.

## 8. Required for sign-off

1. **M1.** Add the radio / outsider-reachable medium to the trust-boundary and hidden-external rule. Recompute the
   counts, add authentication to IF-013, and widen the tool's advisory. Add tests.
2. **M2.** Drop or relax the word-count minimums. State any that remain in the gate text. Add accept-direction tests
   for "Fail safe", "Power only", "Approved", "2 min", "Charges aircraft" and "No arrangement yet". Correct the "by
   construction" claim.
3. **Mo1–Mo6.** Fix as described. Mo1, Mo2, Mo5 and Mo6 are text or data changes; Mo3 needs one brief and one
   mapping; Mo4 is one figure plus a geometry test.
4. **Minors** at the author's discretion. n1, n3, n4, n5, n12, n13 and n22 are one-line fixes.
