# Week 7 sign-off confirmation: W7-S01 (trade-study save re-tagging)

Reviewer: Independent AI reviewer (Claude), sign-off pass. Date: 2026-10-11.

**Scope:** a narrow check that the blocker W7-S01 from `_source_cache/review/week07_signoff.md` is fixed. It covers:
- `src/activities/week07/save.ts` (the `changes()` gate)
- the advice text in `TradeStudySimulator.tsx`
- the regression test "save keeps provenance and ownership of unchanged elements (W7-S01)" in `trade.test.ts`
- whether the minors W7-S02 and W7-S04 remain

The lead's commit is `1067a4e`. No course or app file was left modified. One mutation and one temporary probe test were applied and then removed; afterwards `git diff --stat src/activities/week07` was empty.

## Verdict: **NOT SIGNED OFF**

**What the fix gets right.** It fixes W7-S01 for alternatives and for plain re-saves:
- An unchanged re-save produces zero updates.
- A load-from-workspace round trip produces zero updates.
- Adding or editing one ALT re-tags only that ALT.
- Issued IDs are remapped correctly after the first save.

**What remains (W7-C01, major).** The same defect survives for criteria. `changes()` compares the CRIT attribute `weight`, which is the *normalised* weight and therefore depends on every criterion's swing points. As a result:
- Editing any one swing weight re-tags **every** CRIT.
- Adding a criterion re-tags every CRIT and every ALT.

So the in-app advice "only the items you changed take the tag" is false for criteria. A later team-derived weight tweak erases the AI-suggested-reviewed tag on an AI-suggested criterion, which is the RB-12.3 failure that W7-S01 described. The fix is small (see below).

## Tool runs (from `learning-studio/`)

| Command | Result |
|---|---|
| `npx tsc -b` | clean (exit 0) |
| `npx vitest run src/activities/week05 src/activities/week07 src/content src/lib` | 7 files, 141 tests passed |

## W7-S01: what was checked

**Code** (`save.ts` l.19–56)
- `planSave` pushes an update only when `changes()` reports a difference in name, text or attributes. The comparison is key-order independent through `stable()`.
- Created elements get `{owner, provenance}`.
- The post-save loop in `TradeStudySimulator.tsx` (l.88) patches only `attributes` (remapped score keys and `baseline`). It does not touch owner or provenance, so it cannot re-tag.
- `updateElement` is a plain merge (`Workspace.tsx` l.73).

**Scenarios** (pure probe on `referenceStudy()`; model built from the first save's creates, as in the lead's test)

| # | Scenario | Result | Judgement |
|---|---|---|---|
| T | Lead's test: save team/AB, then edit one ALT description and save AI/CD | only that ALT updated | ✓ |
| P3 | Saved model → JSON round trip → `studyFromModel` → re-save as AI/ZZ with no edits | 0 updates, 0 creates, 0 issues | ✓. A persistence round trip does not create false changes. |
| P4 | Add one AI-suggested ALT, save AI/CD | creates the new ALT only, 0 updates | ✓. This is the advised workflow for alternatives. |
| — | IDs renamed after the first save | `renameStudy` and the post-save score remap keep the study and the stored attributes aligned (P3) | ✓ |
| — | A changed element saved by a different student | takes the new owner and tag | Acceptable and disclosed: the help text says the tag is "recorded on every CRIT and ALT this save creates or changes". The record shows the last editor of the content, not the original author. |
| — | DEC | `recordDecision` always *creates* a DEC with the current owner and tag; it never updates an earlier DEC | ✓ for W7-S01. Side note: repeated clicks create duplicate DECs. |
| **P2** | Change one criterion's swing points, save AI/CD | **updates CRIT-001, -002, -003 and -004** | ✗. Three criteria the student did not touch are re-tagged and re-owned. |
| **P1** | Add one AI-suggested criterion (with a score on each ALT), save AI/CD | **creates the new criterion, and updates all 4 CRITs and all 4 ALTs** | ✗ for the CRITs (spurious; normalised weights shifted). Arguable for the ALTs, which did gain a score. |

**Regression test spot-check**
- Mutation: in `save.ts`, both `if (changes(...))` guards were removed, so every existing element is always updated.
- `npx vitest run src/activities/week07` gave **1 failed / 45 passed**. The failure was "a second save tags only the changed items …".
- Restored from a byte copy; the diff is empty. **The test bites for the scenario it covers.** It has no case for weight edits or added criteria.

**Advice text** (`TradeStudySimulator.tsx` l.139)
- Accurate for alternatives.
- **Inaccurate for criteria.** It says to "edit only the AI-suggested alternatives or criteria … — only the items you changed take the tag". By P1 and P2 that is not what happens for criteria.
- The rest is accurate. The tag is recorded on created or changed items and on the DEC, and the save requires one baseline and MOE traces.

## New findings

| ID | Sev. | Location | Finding | Evidence | Recommended fix |
|---|---|---|---|---|---|
| **W7-C01** | **major (blocker; residual of W7-S01)** | `save.ts` `changes()` with `critAttributes` (`reference.ts` l.113–125, `weight` = the normalised weight rounded to 3 dp); help text l.139 | **Criteria are still re-tagged when the student did not change them.** `weight` is derived from *all* criteria's swing points, so any swing-point edit, or any added or removed criterion, changes the stored attributes of every CRIT. The gate then re-tags and re-owns all of them. Concretely: save 1 is team/AB; save 2 adds an AI-suggested criterion as AI/CD; save 3 is team/AB and tunes one weight, which is routine in swing weighting. After save 3 the AI-suggested criterion is team-derived/AB, so the AI tag RB-12.3 grades is erased. The help text promises the opposite. | Probes P1 and P2 above, run with the actual `planSave`. | (1) In `changes()` for CRIT, compare the inputs (`swingPoints`, best, worst, mid, unit, rationale, name, text) and exclude the derived `weight`. Keep writing `weight` for the changed rows, and update the `weight` attribute alone (no owner or provenance) on unchanged CRITs, as the post-save loop already does for ALT scores. (2) Help text: add that adding a criterion means scoring every alternative on it, so every ALT takes the tag of that save. Alternatively, write new-criterion scores as an attributes-only patch. (3) Test: P2 (one weight edit leaves the other CRITs' owner and tag intact), plus the three-save sequence above. |
| W7-C02 | minor | `save.ts` ALT `fields.attributes = {...scores, baseline}`; `studyFromModel` | **Saving over workspace elements that carry extra attributes strips them and re-tags them.** If the workspace holds reference ALTs (attributes such as `aircraft`, `turnaroundChargers` and `capacityTripsPerDay`, plus `'CRIT-00n'` scores), then "Load ALT/CRIT from my workspace" followed by a save with no edits counts as a change. The patch replaces the attributes wholesale, dropping the non-score attributes. Every ALT is re-tagged with the student's owner, and every reference CRIT's text is replaced by the generated text. Students' own simulator-created elements round-trip cleanly (P3), so the impact is limited to reference-seeded workspaces. | `studyFromModel` keeps only criterion scores (`reference.ts` l.43–55); reference `week07.ts` l.43–48. | Merge the existing non-score attributes into `fields.attributes` before the comparison and the patch. |

## Status of the earlier Week 7 minors

| ID | Status | Evidence |
|---|---|---|
| W7-S02 (exam C3 near-verbatim q6-10) | **REMAINS** | `exam1.ts` l.23 still has "Hub chargers idle overnight could be leased to ground fleets" (q6-10 (1): "…idle about 8 h a night; if leased to municipal fleets…"). It also still has "If the battery fades more than 10 % before pack replacement, then the reserve cannot be held…" (q6-10 (4), nearly word for word). The weather-limits unknown still echoes U-001. |
| W7-S04 (q7-10 "TRL 6, so a maturity risk stays") | **REMAINS** | `week07.ts` l.328 option (b): "S2’s firmware is at TRL 6 on its supplier’s evidence, so a maturity risk stays in the register." |

## What is needed for sign-off

1. Fix W7-C01: exclude the derived `weight` from the CRIT change test, correct the help text for added criteria, and add the P2 and three-save test.
2. Re-run `npx vitest run src/activities/week07`.

W7-C02, W7-S02 and W7-S04 can follow in the normal cycle.

---
Independent AI reviewer (Claude), sign-off pass, 2026-10-11.
