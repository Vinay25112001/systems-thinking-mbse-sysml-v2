# Week 4 authoring notes

Module: `src/content/weeks/week04.ts` · activities: `src/activities/week04.activity.tsx` + `src/activities/week04/` · status: `self-checked` (independent review still required). No SysML listings this week, so there is no `sysml/week04/` run.

## Pages actually read (via `python -I scripts/source_pages.py <ID>`, full verified range)

| Reading | Pages read | Used for |
|---|---|---|
| R13 SEBoK *System Requirements Definition* | 557–567 | Process purpose and the "exercise in engineering" quote (p.557); INCOSE NRM definition, needs (black box) vs requirements (white box), "more than changing the subject", analyses (p.558); one need → several requirements, attributes, rationale, success criteria (p.559); Table 1 categories (p.560); requirement tree (p.561); allocation, child requirements, budgeting (p.562); interface requirements, three steps (p.563); model form (p.564); TBD/TBR/TBX management (p.565); verification planning, requirement verification vs validation (p.566); artefacts (p.567) |
| R48 DoD SE Guidebook §4.2.1–4.2.3 | 141–147 | Stakeholder Requirements Definition: purpose and failure costs (p.141), activities and analysis for specificity … feasibility (p.142), JCIDS documents (p.142); Requirements Analysis (p.142–143), poorly written requirements as risk (p.143); **good-requirement attributes list (p.144)**; derived requirements come from solution decisions (p.146) |
| R54 MITRE *Analyzing and Defining Requirements* | 328–332 | Characteristics of good requirements (p.329–330), the meanings of shall/should/may/will (p.330), MOE/MOP/KPP (p.330–331, not used), interface requirements and hidden external interfaces (p.331) |
| R55 MITRE *Develop System-Level Technical Requirements* (extension) | 365–374 | Selective "shall" (p.367); white space (p.367); user language and the radar example (p.367–368); **Table 1 checklist (p.368–370)**: four kinds of requirement (p.368), shall legally binding (p.369), avoid "shall not", maximize/minimize, use ranges, threshold vs objective (p.370), every requirement has a method, expanded test criteria (p.370); tracing (p.371); level of detail and the cost of requirements (p.371–372); arguments about requirements (p.372–373) |
| R49 DoD *Verification Process* (not a Week 4 reading; in references) | 149–150 | Definitions of the four verification methods: demonstration, examination (= inspection), analysis, test |

Every citation lies inside these ranges. `weeks.test.ts` enforces this.

## Design decisions

- **Levels.** NEED → REQ-STK → REQ-SYS is a course convention. It combines R13's needs vs requirements with R48's split between stakeholder requirements and requirements analysis. Neither source uses exactly these three labels. The module says so (w4-levels, last paragraph; cautions) and stresses that levels are relative to the SoI (R13 p.558, p.562).
- **Types.** functional / performance / interface / constraint come from R55 p.368 ("a function …, performance a function must provide, a constraint on the design, or a reference such as to an interface definition"). That is the scheme RB-3.5 and the reference baseline use. SEBoK's Table 1 categories (R13 p.560) are taught as a complementary completeness check. The classifier shows both.
- **"S12 p.144"** in the plan and rubric is R48 p.144 (DoD "attributes" of good requirements). The module notes the double meaning of "attribute" (R48 list vs R13 data attributes).
- **Verification methods** are cited to R49 p.149–150, a verified register reading but not one of this week's. It is listed in `references`. If the lead prefers to cite only the week's readings, R55 p.370 alone supports "every requirement must have a method" but does not define the methods.
- **Quality lab heuristics** (`quality.ts`): 15 checks, each with the characteristic it stands for and page citations. These parts are instructor-authored and labelled as heuristics in the UI banner: the vague-term list, the number+unit pattern, the bound-phrase pattern, the solution-phrase pattern, the restatement ratio (≥ 0.7 counts as a restatement) and the parent-level rule. Status semantics:
  - `fail` blocks recording;
  - `advisory` asks for a decision;
  - `na` means the check does not apply.
  A vague term next to a measurable value is an advisory, not a fail (RB-3.1 wording). A performance requirement with no value is a fail, while other types get an advisory.
- **TBX rule.** Any TBD/TBR needs an existing U-/A- item or a new Unknown with an owner. `buildBatch` creates the REQ, its derives-from links and the U with its affects link in one `apply` call, so the change is atomic.
- **Critique set** (`critique.ts`, F1–F6). Each example lists the heuristic checks it must raise and the findings only a reviewer can make. The tests assert both, so the worked-example claim "the tool catches X but misses Y" cannot drift. F3 deliberately passes the measurable check.
- **Classifier texts are read from the reference baseline** (`refText`), and the keys are tested against the reference `type` attribute.
- **Trace checker** reuses the same heuristics on workspace elements (`draftOf`), adds set checks (size 15–20, type balance, orphans, childless NEED/CAP, duplicates) and an RB-3 rehearsal. The rehearsal uses a seeded sample (mulberry32) and the rubric's percentage bands, with criteria 3.1–3.4 approximated by the checks. It is labelled as a proxy.
- **Mutation tests.** Every check is shown failing (or raising an advisory) and passing. The reference set of 20 has no failing check and the 6 rewrites have no advisory. Mutated references produce an orphan, a duplicate, an inverted trace, a missing type and an unlinked TBD. Component tests drive record-with-parent and record-with-new-Unknown through `apply`.

## Open issues / requests to the lead

1. **Reference REQ-STK-003 uses "shall not"**, which R55 p.370 advises against. The module keeps it and uses it as a graduate discussion point: the prohibition is verified over a finite set of demonstrated cases, and REQ-SYS-004 is the positive restatement. The heuristic gives it an advisory, not a fail. If the lead prefers a clean reference, a possible rewrite is: "The AeroLink service shall dispatch a flight only when the forecast at its departure and arrival vertiports is within the approved aircraft weather limits (TBD-01)." That change would be in `src/model/reference/week04.ts`, which I did not edit.
2. **Shared test timeout.** In a full parallel `npx vitest run`, many component tests in other weeks (week02, week03, week06, week07, components.test.tsx) hit the default 5 s timeout. Mine did too until I set `{ timeout: 30000 }` on the Week 4 component `describe`. Suggest a project-wide `testTimeout` (e.g. 30000) in `vitest.config.ts`.
3. **Test cleanup.** `src/test/setup.ts` does not register `cleanup()` (vitest `globals` is off, so RTL's auto-cleanup does not run). Week 4 calls `afterEach(cleanup)` itself. Suggest adding it to the setup file.
4. **No register request.** Every page needed is in R13/R48/R54/R55/R49.

## Verification runs (final)

- `npx tsc -b`: exit 2, because of **one error in another author's file**: `src/activities/week07/trade.test.ts(255,16): TS6133 'a' is declared but never read`. There are no errors in Week 4 files.
- `npx oxlint src`: exit 0; no Week 4 warnings.
- `npx vitest run` (full): 327 tests. 326 pass and 1 fails (`week07/activities.test.tsx` simulator test). In addition, `src/activities/week05/zz_wc.test.ts` (another author's temporary file) fails to load. All Week 4 tests pass: `src/activities/week04/*` has 34 logic + 5 component tests, and `weeks.test.ts` → Week 4 passes all 5 checks.
- Lesson word count: 5,122 (`lessonWordCount`); quiz: 13 items, 12 at Apply or above; workload 9.0 h.

## Not verified / limits

- All AeroLink numbers are FICTIONAL (Data Sheet and reference baseline). The 360 trips/day "goal" in w4-advanced and the 350 kW, 7 min and 8 min values in examples are new FICTIONAL teaching values, labelled in the text.
- The heuristics are English-only and pattern-based. Expect false positives (e.g. "high" in a legitimate phrase) and false negatives (missing start events). The UI and the module say this.

## Revision after the independent review (2026-10-11, `_source_cache/review/week04_review.md`)

Pages re-read: R54 p.329 ("All requirements must be testable…"), R55 p.368–370 (checklist, "must" not binding, ranges, expanded test criteria), R13 p.563 (interface requirement as a form of functional requirement), R13 p.565–566.

### Disposition

| ID | Sev. | Disposition |
|---|---|---|
| F01 | major | Fixed. `quality.ts`: (a) a vague word is softened only by a bounded **measurement** (unit + bound) or a TBX — counts such as "4 passengers" no longer qualify; (b) method fit is now a **fail** when the method is demonstration/inspection and the requirement is performance, or the statement (outside a condition clause) or criterion has a quantitative value — independent of the type label; (c) a missing or vague success criterion is a **fail** for every type; "highest", "lowest", "possible", "as needed", "support(s)", "handle(s)", "facilitate(s)" added to the vague list. RB-3.2 proxy now includes `criterion` and `method-fit`. Regression tests: each reviewer probe, plus a reference mutation showing the trace checker's clean count and RB-3.2 proxy drop. Lab wording: "refuses a requirement with a failing check; passing is necessary, not sufficient". All 20 reference requirements still have no failing check and the six rewrites still raise no advisory. |
| F02 | major | Fixed in the reference: REQ-SYS-005 statement now "…to at least 99 % of confirmed ride requests within 60 s of confirmation"; criterion "…for at least 99 % of at least 200 requests in a replayed peak-hour request profile" (consistent with VER-005). Worked example (a) uses the corrected pair as a lesson on statement/criterion consistency (R55 p.370). F2 rewrite, q4-4b, q4-7 updated; test asserts agreement. |
| F03 | major | Fixed: memo is notebook entry 4, always read (RB-16 note, W7), formative on RB-3.5 with level descriptors in `rubricScope`. |
| F04 | major | Fixed with caution: memo narrowed to six checklist items (four named + two chosen) and R55 p.367–372; 1.3 h; L4 out-of-class 2.6 h, online 0.7 h, notebook 0.15 h; total 9.0 h. Caution: full checklist ≈ 2 h; report overrun under FD-22. |
| F05 | major | Fixed: quality lab renders `ProvenanceOwnerFields`, requires owner initials, passes owner/provenance through `buildBatch(d, po)` to the REQ and any new Unknown; new Unknown requires resolution work and a need-by date (TBX check fails without them); owner/provenance shown in the lab table and the trace checker. |
| F06 | minor | Fixed: "worst planned arrival state"; diverted arrivals below 20 % named as uncovered (lesson, REQ-SYS-001 rationale, answer key). No new requirement added (set size and SysML link constraints). |
| F07 | minor | Fixed: R54 p.329 quoted and reconciled ("testable" = verifiable by some method); w4-attributes re-tagged `mixed`; misconception 3 updated. |
| F08 | minor | Fixed: w4-application explains "must" across Weeks 3–4; Week 3 need-studio message aligned. |
| F09 | minor | Fixed: q4-9 (ML engine from Vendor-Y), q4-10 (ANSP intent, 5 min single point), q4-11 (OEM fault-record interface), q4-12 (curtailment response allocated from REQ-STK-010) are fresh cases; q4-3 → Apply, q4-5 → Understand. 11 of 13 items at Apply or above. Session 1 what-if changed to 6 min so q4-3 is not rehearsed verbatim. |
| F10 | minor | Mitigated: lesson states it is self-sufficient for the methods; caution asks the lead to add R49 p.149–150 to the readings (course.ts). |
| F11 | minor | Fixed: design-free also flags equipment with a count or rating ("two 350 kW … chargers"), "equipped with", brand/vendor words; F3 reviewer-only note documents a plain-words variant that still passes (test-asserted). |
| F12 | minor | Fixed: every TBX token must be owned; an A- item may own only a TBR; a linked item whose `tbd` attribute names another TBX does not count; all tokens recorded (`tbd: 'TBD-02, TBR-01'`). |
| F13 | minor | Fixed: "consistent with" SEBoK (instructor's split); types "adapted from" R55 with the reference-not-type caveat; q4-10 no longer claims R55 discusses start events. |
| F14 | minor | Fixed in REQ-SYS-008 rationale: ≥ 5 min from assignment to release (FICTIONAL) and the REQ-STK-006 interlock reads open fault reports directly. |
| F15 | minor | Fixed as teaching points: answer key states the reference has no utility or weather-data interface requirement and a performance-heavy mix; REQ-SYS-003 rationale now justifies the direct CAP-004 derivation. |
| F16 | minor | Fixed: "AROU v1 from CP1". |
| F17 | minor | `npx tsc -b` exit 0 at the end of this revision. |

### Exact reference changes (`src/model/reference/week04.ts`) — for the SysML model

- REQ-SYS-005 **text**: "The scheduling function shall assign a dispatch-ready aircraft to each confirmed ride request within 60 s of confirmation." → "The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation."
- REQ-SYS-005 **criterion**: "Confirmation-to-assignment <= 60 s for 99 % of requests" → "Confirmation-to-assignment <= 60 s for at least 99 % of at least 200 requests in a replayed peak-hour request profile".
- REQ-SYS-001 **rationale**: now begins "The worst planned arrival state is the 20 % reserve that every flight plan protects (REQ-SYS-003)…" and adds the uncovered below-reserve case.
- REQ-SYS-003 **rationale**: adds the justification for deriving directly from CAP-004.
- REQ-SYS-008 **rationale**: replaced (≥ 5 min assignment-to-release, FICTIONAL; interlock reads fault reports directly).
- No ID, element or link added, removed or retargeted.

### Requests to the lead

1. Regenerate/patch the REQ-SYS-005 statement (and the rationales above, if the SysML docs carry them) in `sysml/reference/*.sysml`.
2. `src/activities/week05/trace.ts:120` holds a copy of the old REQ-SYS-005 sentence (as an exercise element with ID REQ-SYS-004); align it if it is meant to mirror the reference.
3. Consider adding R49 p.149–150 to Week 4 readings in `course.ts` (F10).
