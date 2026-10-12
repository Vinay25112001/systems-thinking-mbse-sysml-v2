# Week 1 learning flow: sign-off review

**Reviewer:** Independent AI reviewer (Claude), sign-off pass
**Date:** 2026-10-12
**Commit:** `230a3c9` (learning-studio)
**Inputs:**
- The first review, `week01_flow_review.md` (W1F-F01 to F28).
- The dispositions in `docs/redesign/WEEK1_LEARNING_DESIGN.md` §9.
- The material in `src/content/learn/*`, `src/components/figures/*`, `src/flow/*`, `src/pages/Welcome.tsx` and the `src/content/weeks/week01.ts` workload row and caution.
- 32 screenshots in `screenshots/week1-flow/`.
- The standards in `AUTHORING_GUIDE` §2 and §7.

**Method:**
- I resolved every Learn section to the exact prose a student sees. A scratch vitest outside the repo called `sectionProse()` and dumped the prose, checks, alt text and text equivalents.
- I read the source pages with `python -I scripts/source_pages.py` (R01 p.53, R50 p.48, R04 p.274, R03 pp.268–269).
- I compared the new checks against the readiness quiz (`quizWeek1.ts`) and the missions.
- I read the screenshots as a first-time student would.

No app or course files were changed. The one mutation was reverted, and `git diff --stat` for that file is empty.

## Verdict: **NOT SIGNED OFF**

All 28 findings are resolved; F11's residual (m2 unchanged) is accepted below. The fixes are good work:
- The checks now present new cases.
- Figure 6 is honest and reveals the crossover only after the answer.
- L7 defines the enterprise.

One **new major** finding blocks sign-off:
- **N1.** The F02 fix made C5 a near-duplicate of readiness-quiz item q1-4, which the student meets later in the same week. This breaks AUTHORING_GUIDE §7.6.

The fix is small: one check item. After that fix, I expect to sign off without another full pass. N2 (moderate) should be fixed in the same edit.

## Test runs

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0, no errors |
| `npx vitest run src/content/learn src/flow src/sim src/content` | 6 files, **157/157 passed** (was 139 at the first review) |

**Mutation:**
- **Change.** In `src/content/learn/week01.ts`, I replaced the C1 key with a copy of `w1-emergence` ¶0: "Open: it is defined by the interactions among its elements inside the boundary and by its interactions with other systems."
- **Result.** `npx vitest run src/content/learn` gave **2 failed / 28 passed**:
  - "no keyed option shares a run of 8 or more words…" reported *c1 shares 16 consecutive words*;
  - "no length cue…" also failed.
- **Revert.** I reverted with `git checkout -- src/content/learn/week01.ts`. `git diff --stat` on the file is empty, and the file is byte-identical to the pre-mutation copy.

The overlap and length guards therefore catch the F01 defect class.

## Disposition table (W1F-F01 to F28)

| ID | Sev. | Status | Evidence (re-checked) |
|---|---|---|---|
| F01 | Major | **RESOLVED** | **C1–C7 are all new cases.**<br>• Longest shared run between key and section text is < 8 words (test, mutation-proven).<br>• Key and mean distractor lengths (chars):<br>&nbsp;&nbsp;– C1: 79 vs 78<br>&nbsp;&nbsp;– C2: 103 vs 89<br>&nbsp;&nbsp;– C4: 95 vs 82<br>&nbsp;&nbsp;– C7: 86 vs 76<br>**Labels are mostly honest:**<br>• C1 Understand/multistructural fits (classify).<br>• C2 Apply fits (the boundary test is used on a new boundary).<br>• C4 and C7 Understand fit.<br>A residual option-wording cue is raised separately as N2. |
| F02 | Major | **RESOLVED** as specified | **Loop X is not in the model or the figure.**<br>• The prompt has no R/B labels.<br>• Option d is now a wrong type with a wrong reason.<br>• `figure-l5-1.png` shows only R1 and B1.<br>• Polarities check out: one (−), so balancing.<br>The *new* loop, however, duplicates a quiz item (see N1). |
| F03 | Major | **RESOLVED** | **Code:** `Learn.tsx:411` passes `revealed={state.worked[s.id] !== undefined}`, and `CapacityCrossover` draws the marker only when revealed. `preReveal` alt text and text equivalent contain no 14.4 or 15th.<br>**Screenshots:** `figure-l6-1.png` has no marker; `figure-l6-1-revealed.png` shows "crossover 14.4 aircraft".<br>**Answer logic:** 14.4 ± 0.05 is correct, and 15 gets "Close". This is a deliberate, sound choice.<br>**Hover tooltip:** shows integers only, which brackets 14–15 but does not give 14.4. Acceptable. |
| F04 | Major | **RESOLVED** | **`SERVED_FROZEN` is computed from `simulate`.**<br>• Test: each point is ≤ min(fleet, charging) capacity.<br>• The values at 10, 12, 13, 14 and 15 aircraft equal 5,416 / 6,495 / 7,034 / 7,572 / 7,788.<br>**Screenshot:** the line sits under fleet capacity at 10–14 aircraft and is flat from 15. |
| F05 | Major | **RESOLVED** | L7 prose now includes "What, then, is an enterprise?" and the Rebovich and White definition. The key term is the full definition. Matches R07 p.815 (the first review read that page). |
| F06 | Major | **RESOLVED** | The callout "What the explorer’s model does not contain" carries ¶3 s0–2. It renders after the worked example. |
| F07 | Mod. | **RESOLVED** | The steps now include "demand binds", the wait formula 2 ÷ (1 − u), attractiveness, and adoption = churn (test). |
| F08 | Mod. | **RESOLVED** | **Wording now matches the source.** The ring reads "Influences me; I neither control nor influence it", which matches R50 p.48 ("do not control or influence but which influence me"; re-read).<br>**Placement:** the airspace authority is removed, and both outer rings are left to students.<br>**Text:** the key term names the environment, and the caption cites the reviewed `week1.ts:131` text. |
| F09 | Mod. | **RESOLVED** | The L7 bridge ("Note the two uses of the word…") and the Figure 1 caption. Consistent with `figure-l1-1.png`. |
| F10 | Mod. | **RESOLVED** | The bridge says Week 2 is not yet built and asks for self-spaced retrieval. |
| F11 | Mod. | **RESOLVED** (part 2 accepted as left) | **(1) The caution itemises the time.**<br>• Learn: 63 min.<br>• m1 + m2: 25 min, on top of the memo row.<br>• m3 + m4: 35 min, inside the team row.<br>• Total: 8.0 + 0.75 + 0.4 = 9.15 → "≈ 9.2 h". This agrees across the caution, the row label and the Overview note (test).<br>**(3) The floor test is independent of the author's minutes.** It uses 180 wpm + 1 min per figure, check and so on.<br>**(2) m2 is unchanged and labelled as recall.** See the F11 judgement below. |
| F12 | Mod. | **RESOLVED** | "Only" is removed. A third bar (8,640) is added, and "charging ignored" is labelled (`figure-l4-1.png`). |
| F13 | Mod. | **RESOLVED** | `revealKey = correct ∨ attempts ≥ 2`. `firstCorrect` is kept in `state.tsx:46`. Two `flow.test.tsx` tests cover it, including one where a correct retry stays "review". |
| F14 | Mod. | **RESOLVED** | Static R1/B1 figure: solid teal for R1, dashed orange for B1, ink for the shared link, and a legend. A small label collision remains (N4). |
| F15 | Minor | **RESOLVED** | The callout is titled "(course convention)" and says the readings do not state the rule. |
| F16 | Minor | **RESOLVED** | L4 opens with `w1-intuition` ¶0, the jam paragraph. |
| F17 | Minor | **RESOLVED** | "In short" uses the suggested text. |
| F18 | Minor | **RESOLVED** | Both the L6 question and "In short" say "served trips". |
| F19 | Minor | **RESOLVED** | The text matches R03 p.271. |
| F20 | Minor | **RESOLVED** | C3 option b's feedback now uses MITRE's "single view". |
| F21 | Minor | **RESOLVED** | No arrows in system definition; that phase is marked "not in the change example" (`figure-l7-1.png`). The alt text matches the drawn labels. |
| F22 | Minor | **RESOLVED** | Three internal links, a one-way weather arrow, and label clearance. At 400 px the figure scrolls inside its frame with a hint (`l1-400-light.png`). |
| F23 | Minor | **RESOLVED** | "Where it starts, and what you need" is labelled as course framing (`welcome-1440x900-light.png`). |
| F24 | Minor | **RESOLVED** | L4 and C4 are Understand. "View" is in the L3 principles panel. The "Elements interact" node points to L1 (test). |
| F25 | Minor | **RESOLVED** | The caption and chart labels interpolate `TRIPS_PER_AIRCRAFT_MONTH`, `CHARGE_CAP_6` and `P.chargers`. |
| F26 | Minor | **RESOLVED** | C6 distractors are error-based: the 15th, the 28th, and the 30th (`C6_WRONG_50` = 30; tested). The 28th's feedback arithmetic is correct: 16,800 < 17,280. |
| F27 | Minor | **RESOLVED** | The archetypes paragraph is in `afterWorked`, which renders after `<WorkedView>`. |
| F28 | Minor | **RESOLVED** | Cars are bumper to bumper with brake lights (`figure-overview-jam.png`). |

## Re-check of new and changed items

**Checks:**

| Check | Correct key | Copy or length cue | Bloom/SOLO | Verdict |
|---|---|---|---|---|
| C1 | Yes (R03 p.269: an open system interacts with systems in its environment; an event changes state) | None; c is a good "right label, wrong reason" distractor | Honest | OK; see N2 for "nothing" and "only" |
| C2 | Yes | Key is the longest option and the only hedged one | Honest | See N2 |
| C3 | Yes (unchanged) | None | OK | OK |
| C4 | Yes (emergence, R04 p.274) | All three distractors carry "must", "only" or "alone"; the key carries "can" | Honest | See N2 |
| C5 | Yes (one negative link, so balancing) | No cue on the page | SOLO "relational" is generous for a counting rule (N3) | **Duplicates quiz q1-4 (N1)** |
| C6 | Yes (29th; model-verified by test) | None (all 9 characters) | OK | OK |
| C7 | Yes (R01 p.53 revised definition, re-read: "holistically and concurrently … through system disposal") | None | OK | OK |

**Figures:** every plotted or quoted number traces to `aerolink.ts`. I checked:
- Figure 4a: 24,000; 8,640; ≈ 7,788; ≈ 6.5.
- Figure 6: all three series and the crossover at 14.4.
- Figure 1's state panel.

Every figure has a title, a caption, alt text and a text equivalent. The ring and life-cycle labels match R50 p.48 and R01 p.54.

**Citations:** every new cite is inside its register range (test). The ones I re-read support the claims made:
- R01 p.53 (C7)
- R50 p.48 (Figure 7b)
- R04 p.274 (C4)
- R03 pp.268–269 (C1)

## New findings

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| **N1** | **Major** | C5 (`learn/week01.ts:357`) vs readiness quiz q1-4 (`quizWeek1.ts:45–55`) | C5 is the same item as quiz q1-4, which the student meets later in Check & submit and in mission m6. This breaks AUTHORING_GUIDE §7.6, the same defect class as F01, now moved to the quiz.<br>**Effects:**<br>• The quiz item is pre-answered: Learn shows the C5 key and feedback first.<br>• Objective B1.2's "secure" status counts the same item twice. `CheckSubmit.tsx:23–24` combines C5's first attempt with q1-4.<br>• The noise loop is the instructor-notes example of a loop teams must find themselves for the L1 record (`weeks/week01.ts:197`). Lab L1 is the graded team lab, so giving the example away weakens that requirement. | **Same loop:** flights → noise complaints → community acceptance/opposition → permitted operating hours → flights, with one negative link.<br>**Same key:** "Balancing: one negative link (an odd number)".<br>**Near-same distractor:**<br>• q1-4 d: "Reinforcing: three of the four links are positive"<br>• C5 c: "Reinforcing: three of its four links are positive…" | Give C5 a different loop that is also absent from the explorer and from the quiz. Examples:<br>• maintenance backlog → aircraft availability → utilisation → backlog;<br>• or a loop with an *even* count, so the key varies from q1-4.<br>Keep the F02 guards.<br>Add a test: no section-check prompt shares ≥ 8 words with any `WEEK1_QUIZ` prompt, and no key shares ≥ 6 words with a quiz option. |
| N2 | Moderate | C2, C4 (and C1 partly) | **Test-wise cue from absolute words** (Haladyna, Downing and Rodriguez 2002, guideline "avoid specific determiners"). Absolute words such as "must", "only", "every" and "nothing" appear in every distractor of C4 and C2, while the key is the only qualified option. A test-wise student can eliminate down to the key without understanding.<br>The 8-word and length tests cannot detect this. | **C4:**<br>• b "must be failing"<br>• c "rules alone must"<br>• d "can only … must be wrong"<br>• key "can fall"<br>**C2:**<br>• b "at every fleet size"<br>• c "Nothing useful … any"<br>• d "every aircraft must"<br>• key "not whether"<br>**C1:** b "nothing outside", d "only". | Remove the determiners from the distractors, or put a qualified or absolute phrasing on both sides. For C4, make at least one distractor a plausible non-absolute misconception, for example "the extra aircraft each fly fewer trips, so the per-aircraft data hide the cause". |
| N3 | Minor | C5 label | SOLO "relational" is generous. The key applies a single counting rule, so it is unistructural or multistructural. Option b's feedback shows the relational reasoning, but the key does not need it. | `week01.ts:355` | Re-label as multistructural, or ask for the behaviour as well as the type (q1-4 does this). |
| N4 | Minor | Figure 5 | The label "shared by R1 and B1" is crossed by the dashed B1 arrow from service attractiveness to adoption. | `figure-l5-1.png` | Move the label below the shared arrow, or give it a background halo. |
| N5 | Minor | Figure 6 caption | After the reveal, the caption still says "The crossover is marked once you have entered your answer below". | `figure-l6-1-revealed.png` | Use the preReveal caption variant, or drop the sentence when revealed. |
| N6 | Minor | L6 vs mission m2 | L6 marks 15 only as "Close", but m2 accepts 15. The F03 disposition records this, and it is defensible ("takes over" versus "equal"). A student may still read it as inconsistent. | Design §9 F03 | One clause in the m2 Practice-plan note: "here the question is when charging takes over, so the answer is the first whole aircraft". |
| (obs.) | n/a | Quiz q1-10 vs L4 ¶ `w1-emergence` ¶2 | **Pre-existing, outside this flow's new text.** The q1-10 prompt mirrors the reviewed L4 paragraph (40 aircraft, about 7,800 trips, about 6.5 per aircraft per day, reducing variety). It predates this flow and was not in the first review's scope. | `quizWeek1.ts:118` | Note for the quiz owner. Not counted here. |

## F11 m2 decision: **acceptable, not a blocker**

I accept leaving m2 unchanged and labelling it as recall, for four reasons:
- **The repeat is disclosed.** The Practice plan states it plainly: "Steps 2 to 4 repeat the L6 hand calculation as a quick recall; the new work is steps 5 and 6" (`practice-plan-1440x900-light.png`).
- **Its time is counted.** The 15 minutes are inside the itemised ≈ 9.2 h.
- **The repeat has some value.** A second retrieval of the calculation in the explorer context, where the student sees the binding constraint move, is defensible practice, though massed practice is weaker than spaced.
- **Changing it is outside the flow's scope.** m2 is pinned by another stream's `missions.test.ts`.

Making m2 explorer-only should stay on the faculty owner's list.

## First-time graduate student judgement

- **Start.** Clear:
  - The welcome says what the subject is, why it matters, where it starts (systems thinking before notation; SysML read from Week 5 and modelled from Week 9) and what is assumed (algebra, probability, spreadsheets; no SE or SysML).
  - It also shows a 14-week map with "You start here".
- **What you will learn and be able to do.** Clear. The Overview has the driving question, a locked prediction, "What you will learn" (L1–L7 with minutes), and "By the end of the week you will be able to" with Bloom levels, assessment and a time plan with the honest 9.2 h note.
- **Each topic.**
  - L1–L4 and L7 read well and are understandable. L7's bridge removes the enterprise confusion.
  - L5's ¶4 on local polarity and saturation is dense for a first exposure to causal-loop diagrams. It is reviewed text, and the R1/B1 figure and the step-through carry the idea.
  - L6, at 759 words with formulas, is the hardest section. The faded steps (demand → fleet → your crossover → plateau) make it followable, and the honest Figure 6 helps.
- **Pacing.** I would not get lost. I would notice, though, that the readiness quiz asks the noise-loop question I had just answered in L5 (N1).

## Conditions for sign-off

1. **Required:** fix N1 and add the check-versus-quiz overlap test.
2. **Recommended in the same edit:** fix N2.
3. **Optional:** N3–N6.

A re-check limited to C5, C2, C4 and the new test is enough. No full re-review is needed.
