# December 1 Critical Path: Week 1 Reconstruction and Platform (A23), with the remaining course weeks

**Dates and assumptions.**
- Status as of 2026-10-21. The deadline is **Tuesday 2026-12-01**, which leaves 29 working days from Thursday 2026-10-22, counting weekdays only.
- Estimates are in *agent-days*: one focused build stream including its own tests, then an independent review, then fixes and confirmation.
- The process allows at most 3 concurrent streams on independent file sets. Shared models, routing, authentication and persistence are integrated sequentially, as the directive requires (§22).

## 1. Work items and estimates

| ID | Item | Class | Estimate | Depends on | Source of estimate |
|---|---|---|---|---|---|
| M0 | Baseline, reuse map, architecture, P0 save defect | Security / data blocker | in progress (finishes 10-22) | — | — |
| M1 | Faculty-reviewable design spec (homepage, Week 1 nav, textbook IA, practice / project / admin / team / Excel flows, acceptance matrix) | Academic review blocker | 2 | M0 | IA, reuse map and field-guidance sources already exist (`docs/week1/`) |
| M2 | Local backend: accounts, sessions, teams, authorization, server persistence, concurrency, backups | Reusable infrastructure + security blocker | ~7 | M0 | `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md` |
| M3 | Content publishing: drafts, preview, publish, history, restore, student consumption | Reusable infrastructure | ~6.5 (full) / ~3 (limited) | M2 auth | same |
| M4 | Homepage + Week 1 overview + Learn digital textbook + gap content + nav change + student-build hardening | Mandatory Week 1 | ~5 | M1 (content work can start after M1) | reuse map: 13,493 words of lesson are reusable; work is re-sequencing plus gaps |
| M5 | Guided Practice (practice store split, reset, feedback) | Mandatory Week 1 | ~3 | M1 | missions m1–m4 adapted |
| M6 | My Project canvas + field guidance + instructor approval + Excel import | Mandatory Week 1 (approval needs M2) | ~6 | M2 (approval, team), M1 | — |
| M7 | Week 1 → Week 8 continuity (Week 8 tool reads the project) | Affects later weeks | ~1.5 | M6 | `sourceFromProject` already exists |
| M8 | Final academic + software validation, faculty sign-off package | Review blocker | ~3 | M4–M7 | — |
| **Subtotal: Week 1 + platform** | | | **~35 agent-days (full M3)** | | |
| W6 | Finish Week 6 (draft exists on the WIP branch): route, review, confirm | Remaining course content | ~2.5 | none (independent files) | prior weeks: about 2–3 days each including review |
| W7 | Week 7 Phase I review / presentation week + Systems Thinking Engineering Package | Remaining course content | ~2.5 | Week 7 package export needs M6 data | — |
| W9–W14 | Six Phase II weeks (lecture, lesson, examples, lab, assessment) | Remaining course content | ~15–18 | Week 8 pattern; W9+ tools ideally read the project | about 2.5–3 per week |
| **Subtotal: remaining weeks** | | | **~20–23 agent-days** | | |

## 2. Feasibility

- **Total:** about 55–58 agent-days of work.
- **Capacity:** 29 working days × up to 3 streams gives about 87 stream-days in theory. Sequential integration constraints and review/confirmation cycles bring the realistic usable figure to about 55–65.
- **Margin:** the plan is feasible only if the remaining-weeks production runs **in parallel from now on**, as one of the three streams. It is not feasible if Weeks 6–14 wait until the Week 1 template is complete and faculty-approved. The margin is thin either way.

## 3. Recommended schedule (subject to the faculty decision in §4)

| Window | Stream 1 (platform, sequential) | Stream 2 (Week 1 teaching / UI) | Stream 3 (course content) |
|---|---|---|---|
| 10-22 → 10-23 | M0 close (P0 fix verified, commit) | M1 design spec | Week 6 finish + review (if approved) |
| 10-26 → 11-03 | M2 backend + authorization + persistence | M4 Learn textbook + homepage (content, then layout) | Week 6 confirm → Week 7 |
| 11-04 → 11-10 | M3 publishing (limited or full) | M5 Guided Practice → M6 canvas UI | Week 9, Week 10 |
| 11-11 → 11-17 | M6 approval + Excel import → M7 | M6 field guidance | Week 11, Week 12 |
| 11-18 → 11-24 | M8 Week 1 validation; Week 1 faculty sign-off | Apply the Week 1 template shell to Weeks 2–5 and 8 (nav only) | Week 13, Week 14 |
| 11-25 → 12-01 | Buffer, regression, student build, submission package | Buffer | Buffer |

## 4. Decisions that change the critical path (faculty)

1. **Parallel course-content production.**
   - **Context:** the proposal says only Week 1 is authorized for *instructional redesign*. Weeks 6, 7 and 9–14 do not exist yet, so building them is new production, not redesign.
   - **Recommendation:** approve Stream 3 now. Otherwise Weeks 6–14 cannot be delivered at full depth by 12-01.
2. **M3 scope.**
   - **Full:** a structured block editor for Week 1.
   - **Limited:** the publishing workflow works end to end for Week 1 course introduction and lesson sections, while slides and notes remain code-authored until after 12-01.
   - **Recommendation:** start limited, extend if time allows. Demo A works in both versions.
3. **Real students on the local backend.**
   - **Default:** no. Real students wait for a university data-protection review and an approved host.
   - **Demo accounts:** used only for the Dec 1 demonstration.
4. **Excel parser dependency.** A maintained, permissively licensed `.xlsx` reader is needed, which means a new npm dependency. **Decide at M6:** licence and maintenance check first, no paid service.

## 5. Optional / deferred (after 12-01 unless time allows)

- Full block editor for slides and faculty notes.
- AI-assisted spreadsheet interpretation (an interface only, disabled by default).
- Institutional SSO; PostgreSQL; production hosting; real-time co-editing.
- Applying the new Learn/Practice/Project template to Weeks 2–5 and 8 beyond navigation, plus Weeks 2–6 project adapters (the P2 backlog).
