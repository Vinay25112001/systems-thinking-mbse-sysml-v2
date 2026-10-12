# Critical-path task board

**Updated:** 2026-10-11 night — **M2 met early: Part I (Weeks 1–7) complete drafts** · **Next milestone:** M1, Oct 13 · **Submission:** Dec 1, 2026
Status words: DONE (tested, evidence linked) · IN PROGRESS · BLOCKED · TODO. "Complete draft" for a week means every definition-of-done check passes in the app, including independent review; faculty review is separate (DECISION_LOG A4).

## Week status

| Week | Part | Status | Evidence |
|---|---|---|---|
| 1 | ST | **Complete draft** | `_source_cache/review/week01_signoff.md` |
| 2 | ST | **Complete draft** | `week02_signoff.md` (blocker fixed by lead as specified) |
| 3 | ST | **Complete draft** | `week03_signoff.md` |
| 4 | ST | **Complete draft** | `week04_signoff.md` |
| 5 | ST | **Complete draft** | `week05_signoff.md` |
| 6 | ST | **Complete draft** | `week06_signoff.md` |
| 7 | ST | **Complete draft** | `week07_signoff_confirmation.md` (blockers fixed by lead as specified) |
| 8 | MBSE | **Complete draft** | `week08_signoff.md` |
| 9 | MBSE | Author running | — |
| 10–14 | MBSE | TODO (SysML reference model v0.1–v0.4 validated) | — |

## Release polish list (minor findings from sign-off reviews; non-blocking, to clear before M5)
- W2: generic-concern screen accepts "Safety is the most important concern for everyone." / "Passengers want safe, reliable and affordable trips." (S02); notes stale (S03).
- W3: q3-5 option a uses "NEED-011" for a different need (S01); R12 now essential but caution 3 and workload line treat it as extension (S02); "(boarding on the charger)" sensitivity wording (S03); notes stale (S04); need studio passes "reservation system", "live tracking", "map view", "noise insulation"; MGO recorder accepts "where feasible"/"n/a"/"eventually" (S05).
- W4: R49 now essential but lesson says "optional", caution stale, missing from workload line, still in references (S01); lab records a criterion contradicting its statement without warning (S02); notes stale (S03).
- W6: new risk checks block some legitimate risks ("If the supplier fails to provide…", "will have been eroded") and near-variants of bad input still pass (S01); cautions say R-004 C3 / R61 extension — now stale (S02); "Natural" not in S06 p.77 list.
- W7: C1(b) "operating demonstration vertiport" wording (exam C3 and q7-10 fixed). Saving over reference criteria replaces their text (C02, minor).
- W5: audit lint suggests inspection for vague wording outside its list (S01, latent); notes stale (S02); reference TPM-001 basis text vs end-item test (S03).
- W8: stale caution 2 / notes request 1 (R74/R83 now readings); q8-12 and w8-sysml cite R83 pages beyond the assigned p.168 extract (S02); screens pass "Vertiport handles passengers", ID-as-target justifications, "Used to release monthly reports" (S03); relay path cannot be recorded in the editor or read by the checks (S04); "two more advisories" wording (S05).
- W1: RB-1.4 causal-argument clause has no level descriptors of its own (R08).
- SysML README §10 hashes for v04 out of date after later re-validations (canonical hashes are in `sysml/validation-report.json`).

## Workload decisions for faculty (FD-22)
- Realistic estimates exceed the syllabus figures: W5 ≈ 10 h (9), W6 ≈ 13.5 h (11), W7 ≈ 10.3 h (9), W8 ≈ 11.6 h (10.5) after the Week 7 memo Part 2 moved into Week 8. Each module records this as a caution.

## Done and tested
- Source audit, curriculum package, verification scripts (re-run 2026-10-09: readings 89/90 with declared R30 exception; consistency NO PROBLEMS; CLO sums checked; 57 objectives).
- Local git repository (no remote).
- Week content schema + definition-of-done checks + tests; generic week renderer; rubric export (17 rubrics).
- Course structure Weeks 1–7 ST / 8–14 MBSE (A7), test-enforced.
- Shared engineering model with mutation tests; workspace store with atomic batch API (tests); model workspace page (`/workspace/model`) with e2e.
- **Instructor reference AeroLink baseline** (Weeks 1–12 layers): 0 validation errors at every week; 25 complete 11-link threads from 10 stakeholders; 5 demonstration threads asserted; trade study (ALT-004 wins 0.670; reversal at cost weight 0.478) recomputed in tests with mutation cases.
- SysML v2 reference validator (OMG Pilot 2026-08) with self-test; expected-fail naming rule.
- Curriculum export (student + instructor Markdown) from the content modules.
- Lab plan example IDs aligned with official S04 lists.

## In progress
- Week 1 fixes; Week 2 independent review; Weeks 3–7 authoring; **instructor reference SysML v2 model** (v0.1 skeleton → v0.4 full, each validated) — critical path for Weeks 9–14.

## Blockers
- None blocking.

## Remaining academic content
- Weeks 3–14 modules; Exam 1 item bank and key (Week 7); Exam 2 practical (RB-14) model variants and seeded-defect keys; CP1–CP5 instruments; instructor reference SysML model; instructor guide; round-3 academic review.

## Remaining application features
- Week activities: ConOps/scenario builder (3), requirements quality lab (4), trace matrix + MOE/MOP/TPM (5), TRL + 5×5 risk + AROU register (6), trade-study simulator with sensitivity/rank reversal/Monte Carlo (7), architecture editor + allocation + N² (8), SysML v2 reading/writing exercises with validated listings (9–11), verification planner + digital-thread explorer (12), impact analysis (13), views + capstone review (14).
- Course progression; workspace views per artefact type; curriculum export; instructor review across all weeks; code-splitting.

## Outstanding technical validations
- Every SysML listing through the pilot implementation; the instructor reference SysML model.
- Reference baseline: ≥ 5 complete threads; trade-study reversal point recomputed in tests.
- Cross-browser e2e (Edge + Chrome); axe on every new page.

## Deadline risks

| Risk | Likelihood | Impact | Handling |
|---|---|---|---|
| SysML reference model takes longer than planned (Weeks 9–14 depend on it) | Medium | High | Start it as soon as the Week 8 architecture layer exists; build incrementally, validated per package |
| Content accuracy defects found late | Medium | High | Independent review per week as it lands, not only in November |
| Faculty decisions (FD-xx) change assessment weights or scope | Low–Medium | Medium | Instruments generated from the rubric document; re-export rather than re-type |
| Workload above 10 h/week | Medium | Medium | FD-22 trigger documented; pilot data needed from real students (not available before submission) |
| Single-browser storage loses student work | Low | Medium | JSON export/import on every workspace tool |

## Decisions escalated to the user (material)
- **A7 (made, flag for confirmation):** Week 8 (architecture viewpoints) moved into Part II to meet the directive's 1–7 / 8–14 split; no topics moved.
- **FD-27:** formal SysML 2.0 documents are not in the collection; the course cites 2.1 Beta 2 and validates against the 2026-08 pilot (which implements those Beta 2 texts).
- **FD-17** attainment rule; **FD-02** credits (3 assumed).
