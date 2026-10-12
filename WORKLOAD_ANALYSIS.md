# Workload analysis — decision brief for faculty (FD-22, FD-02)

**Date:** 2026-10-11 · **Status:** decision needed · **Author:** course build (Claude), from the week authors' itemised estimates and the independent reviewers' checks.

## The problem in one sentence
Every week is budgeted to the syllabus §14 figure (≈ 9.6 h/week mean, 134 h total for 3 credits), but now that the weeks are fully written, honest estimates at the course's own reading-rate assumptions (≈ 15 pp/h SEBoK, ≈ 30 slides/h) exceed the budget in most weeks — most sharply for graduate students, because each week carries an individual graduate task on top of the team lab.

## Budget vs realistic estimate (hours per student)

| Week | Syllabus budget | Realistic estimate | Main reasons | Source |
|---|---|---|---|---|
| 1 | 8.0 | ≈ 8.5 | Memo time tight | W1 reviews |
| 2 | 8.5 | ≈ 9 | Graduate memo on two real enterprises | W2 caution |
| 3 | 10.0 | ≈ 11 | CP1 integration peak | W3 caution |
| 4 | 9.0 | ≈ 9.5 | R55 checklist memo | W4 caution |
| 5 | 9.0 | ≈ 10 | Lesson length; leading-indicator memo | W5 caution |
| 6 | 11.0 | ≈ 13.5 | R61 risk identification (48 pp) is now core; CP2; graduate risk-quantification annex | W6 caution, sign-off review |
| 7 | 9.0 | ≈ 10.3 | Exam prep; Monte Carlo memo (Part 2 moved to Week 8) | W7 caution |
| 8 | 10.5 | ≈ 11.5 (≈ 13.8 graduate) | CP3 assembly; coupling memo; Week 7 memo Part 2 | W8 caution |
| 9 | 9.0 | ≈ 12 | Tool installation and onboarding; KerML memo (R87, 16 pp) | W9 caution |
| 10–14 | 9.5 / 10.5 / 10 / 9 / 11 | not yet written | — | — |
| **1–9** | **84.0** | **≈ 95 (≈ 98 graduate)** | | |

Projected over 14 weeks at the same ratio: **≈ 150–155 h** against 134 h budgeted (≈ 11 h/week), i.e. about 3.6 credit-hour equivalents under the 34 CFR 600.2 basis.

## Options

| | Option | Effect | Academic cost |
|---|---|---|---|
| A | **Accept and re-credit:** run as 4 credits (FD-02 alternative) | Budget becomes ≈ 12 h/week; no content change | Programme/catalogue change; may not fit the degree plan |
| B | **Graduate tasks every other week** (7 instead of ~14), each worth more | Saves ≈ 0.8–1.2 h in the weeks without a task | Fewer, deeper graduate artefacts; RB-16 sampling unchanged |
| C | **Trim required reading to the pages the lessons depend on** (several weeks already use narrowed page ranges; extend this, move the rest to extension) | Saves ≈ 0.5–1 h/week in reading-heavy weeks (6, 8, 9) | Less breadth; must keep CLO coverage (re-run `clo_evidence.py`) |
| D | **Use the existing FD-22 trigger** (lab-plan minimum reductions, e.g. CP5 behaviour = action flow only, 2 threads) | Saves ≈ 1–2 h in Weeks 11–14 | Lower model minimums |
| E | **Move tool installation to a pre-course "Week 0" online task** | Saves ≈ 1.5–2 h in Week 9 | Requires students to have machines ready before term |

**Recommendation (for faculty decision):** B + C + E, with D held in reserve. This brings the realistic estimate to ≈ 140 h (≈ 10 h/week) without changing the credits or removing any learning outcome. It touches only assignment scheduling, reading lists and a pre-course task; the week modules would be revised in one pass, and the CLO evidence and Bloom scripts re-run.

## What happens if no decision is made
The modules stay as written, each with an honest caution giving its realistic total. The FD-22 time-log pilot (students log hours in Weeks 1–4) would produce the evidence in the first term. The submission would carry this brief so reviewers see the known overrun.
