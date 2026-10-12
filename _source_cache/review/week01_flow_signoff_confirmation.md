# Week 1 learning flow: sign-off confirmation

**Reviewer:** Independent AI reviewer (Claude), confirmation pass
**Date:** 2026-10-12
**Commit:** `1b7ba96` (learning-studio)
**Scope:** This pass re-checks C5, C2, C4 and the new tests, as `week01_flow_signoff.md` asked. It also confirms the dispositions in `docs/redesign/WEEK1_LEARNING_DESIGN.md` §9 (N1–N6).
**Compared against:** `src/content/quizWeek1.ts` and the instructor notes and lab in `src/content/weeks/week01.ts`.

No app files were changed. The single mutation was reverted: `git diff --stat` on the file is empty and the file is byte-identical to the original. Other streams' unrelated uncommitted changes (weeks 9, 11, 12) were already in the tree and were left alone.

## Verdict: **SIGN-OFF**

The blocker N1 is resolved, and so is N2. N4 is still open, but it is a **minor** issue and does not block sign-off.

## Test runs

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npx vitest run src/content/learn src/flow src/content` | 5 files, **145/145 passed** (this set excludes `src/sim`, so the count is not comparable with the earlier 157) |
| **Mutation:** C5_LOOP set back to a noise/opposition/permitted-hours loop with two (−) links, so the C5 parity test still passes | `src/content/learn`: **3 failed / 34 passed**. The failures were the 8-word quiz overlap test, the shared-loop-variable test (vs q1-4 and the instructor notes) and the old-loop guard. Reverted, diff empty. |

The new tests catch the N1 defect class independently of the C5 parity test.

## Disposition check

| ID | Sev. | Status | Evidence |
|---|---|---|---|
| N1 | Major | **RESOLVED** | **Loop:** backlog →(−) available →(−) flying hours per available aircraft →(+) wear →(+) backlog.<br>**Polarities are defensible.** More backlog means fewer aircraft available. Fewer available aircraft means more hours on each, with the flying task held fixed; option b's feedback states this. More hours means more wear, and more wear means more backlog.<br>**Key is correct:** two (−) links, an even count, so the loop is reinforcing. No distractor starts with "Reinforcing".<br>**No overlap.** The loop shares no variable with q1-4, with the noise loop in the instructor notes (`week01.ts:197`) or with the charger-queue practice loop (`:172`), and no 8-word run with any quiz text. The key ("Reinforcing … even") differs from q1-4's key ("Balancing … odd").<br>**No false model claim.** The loop is framed as "A team proposes a loop that the explorer does not contain". `LOOP_NODES` has no maintenance, backlog, wear or availability node, and a test checks this. |
| N2 | Mod. | **RESOLVED** | **C2:** the key carries "Only"; b ("likely") and c ("Little of use") are qualified; d ("every … must") is absolute.<br>**C4:** the key carries "every part"; b ("probably") and d ("tends to … likely") are qualified; c ("alone must") is absolute.<br>**C1:** distractor c has no absolute word, so the key is not the only plain option.<br>The guard test passes, and its own control test fails the old C4 options. |
| N3 | Minor | **RESOLVED** | C5 is now `solo: 'multistructural'`, and a test checks it. |
| N4 | Minor | **OPEN, minor (not a blocker)** | This is the Figure 5 label collision in `SystemFigures.tsx`. It is cosmetic: the legend, alt text and text equivalent carry the shared link. Fix it in the next figure pass. |
| N5 | Minor | **RESOLVED** | The caption now reads "marked only after the worked step below has been answered", which is true in both states. |
| N6 | Minor | **RESOLVED** | The m2 Practice-plan note explains "equal" versus "takes over" without giving a number. |

## Observation (not a finding)

C5's second link holds only if the flying task stays fixed when aircraft are withdrawn. That assumption is explained in option b's feedback but not in the prompt. Polarities that depend on conditions like this are normal in causal-loop diagrams, and L5 already teaches that polarity is local, so this is acceptable as written.
