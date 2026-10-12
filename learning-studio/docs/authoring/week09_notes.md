# Week 9 authoring notes — MBSE foundations and the SysML v2 language (L9; CP3 defences)

Author: AI author (Claude), 2026-10-11; revised the same day after the independent review
(`_source_cache/review/week09_review.md`, W9-F01..F19). Status: `self-checked`, pending re-review and faculty review
(DECISION_LOG A4).

## Files

- `src/content/weeks/week09.ts`: 16 lesson blocks (≈ 4,750 words by `lessonWordCount`, down from ≈ 6,600), 3 activities, lab L9, assignment L9 + CP3 defence, 15 quiz items, instructor notes, workload summing to 9 h.
- `src/activities/week09.activity.tsx`: keys `w09-semantics-classifier`, `w09-package-mapper`, `w09-predict-checker`.
- `src/activities/week09/`: logic `semantics.ts`, `mapping.ts`, `predict.ts`; components `SemanticsClassifier.tsx`, `PackageMapper.tsx`, `PredictChecker.tsx`; tests `logic.test.ts`, `activities.test.tsx`.
- `sysml/week09/`:
  - `aerolink_def_usage.sysml` (PASS, no messages; unchanged by the revision, so the classifier's line numbers hold);
  - `aerolink_network_stated.sysml` (new; PASS, no messages): asserted constraints stating disjointness and coverage of hubs and spokes;
  - `aerolink_l9_skeleton.sysml` (PASS, no messages): revised — values bound in usages, MGO-004 added, header corrected;
  - `invalid_unquoted_short_name.sysml` (FAIL as intended, 15:12);
  - predict items `invalid_pc1/3/5/7/8_*` (FAIL) and `predict_pc2/pc4/pc6_*` (PASS; pc2 and pc4 with warnings). pc4 was renamed from `predict_pc4_redefinition_widens_multiplicity.sysml` to `predict_pc4_conflicting_multiplicity.sysml` (W9-F03).
- `sysml/instructor/week09/memo_d_model_answer.sysml` (new, instructor only, not bundled; PASS): model answer to memo part (d).

## Pages read (via `python -I scripts/source_pages.py`)

R28 p.370–374; R33a p.290–292; R33b p.295–297; R33c p.298–302; R70 sl.1–17; R90 sl.5–22; R87 p.51–66 (re-read p.52–57, 61–63 for the revision); R80 p.47–77 (re-read p.49–50, 63–65, 73, 77); R79 sl.163–168; R43 p.109–110; R83 p.165. Outside the register, read but not cited in the lesson: S06 p.576 (library `CausationConnections`, `isEmpty(intersection(causes, effects))`).

## Tool installation sources (W9-F09)

Fetched 2026-10-11 over HTTPS into the session scratchpad (not kept in the repo):

| File | URL | Bytes | SHA-256 |
|---|---|---|---|
| README.adoc | https://raw.githubusercontent.com/Systems-Modeling/SysML-v2-Release/2026-08/install/jupyter/README.adoc | 3008 | beb8741a1d3591b897c94b70d9acc455054c4396c74fd43e93053211615e224f |
| install.bat | https://raw.githubusercontent.com/Systems-Modeling/SysML-v2-Release/2026-08/install/jupyter/install.bat | 2204 | b5185215f382580c9b8edec745a0e644b18de6c42cc49d7965d96a965f1f14cc |
| install.sh | https://raw.githubusercontent.com/Systems-Modeling/SysML-v2-Release/2026-08/install/jupyter/install.sh | 2022 | dbbb926d43a8ad576b02c2abe80cb3fc997d36ff49e80fb98a328e8e8160738a |
| meta.yaml (conda-forge) | https://raw.githubusercontent.com/conda-forge/jupyter-sysml-kernel-feedstock/main/recipe/meta.yaml | 1342 | 5c9f485cac7b292aa76de924016ae476922cdc0e5fba63ab6b768bdda63d4d5b |

What they establish:
- README: Java 21+, Miniconda + Python 3 ("Add Anaconda to my PATH" on Windows); `install.bat` / `chmod +x ./install.sh && ./install.sh`; `jupyter lab`.
- install.bat / install.sh: `SYSML_VERSION="0.62.0"`; step 3 `conda install "jupyter-sysml-kernel=0.62.0" python=3.* jupyterlab=4.* graphviz=2.* nodejs -c conda-forge -y` into the **active** environment; step 4 `jupyter labextension install "@systems-modeling/jupyterlab-sysml@0.62.0"` (npm registry); step 5 `python install.py` (the release's own script in install/jupyter); every step aborts the script on failure (`|| goto:error` in install.bat, `set -e` in install.sh).
- meta.yaml (feedstock `main` at fetch time): version 0.62.0, calver 2026-08, source = the same `jupyter-sysml-kernel-0.62.0.zip` with **sha256 5a015ed3…3cb2, identical to PROVENANCE §1**; build `python ./install.py --api-base-path=http://sysml2.intercax.com:9000 --sys-prefix`; run requirement `openjdk >=17`. This is why the kernel is named `sysml` and the jar sits in the kernelspec folder.
- Not verified by the course: running install.bat/install.sh; whether the kernel works if only the extension step fails.

## Checker probes

Original probes (2026-10-11, first authoring pass): unquoted short name, unquoted reference, import without visibility, `block`, `value`, `:>` usage→definition, part typed by attribute def, missing SI import → FAIL; widening multiplicity (usage over usage, def over def), lowering the lower bound, duplicate short name → PASS + WARNING; mass bound to `[km]`, attribute def owning a part, redefinition by an unrelated part def → PASS silent.

Revision probes (2026-10-11, one JVM, `--report` to the scratchpad, no other java process running):

| Probe | Result | Used for |
|---|---|---|
| `disjoint hubs from spokes;` in a part def | FAIL `no viable alternative at input 'hubs'` | F02 |
| `part def SpokeKind :> Vertiport disjoint from HubVertiport;` | FAIL `no viable alternative at input 'disjoint'` | F02 |
| `part def AnyVertiport unions HubVertiport, SpokeVertiport;` | FAIL `no viable alternative at input 'unions'` | F02 |
| `part def all FastHub :> HubVertiport;` | FAIL `no viable alternative at input 'all'` | F02, q9-14 |
| usage `… subsets sites disjoint from hubs;` | FAIL `no viable alternative at input 'disjoint'` | F02 |
| `disjoining disjoint HubVertiport from SpokeVertiport;` | FAIL `no viable alternative at input 'disjoint'` | F02 |
| asserted constraints `isEmpty(intersection(hubs, spokes))`, `includesOnly(sites, union(hubs, spokes))` | PASS, no messages | F02 (taught) |
| same with misspelt `spoke` | FAIL `Couldn't resolve reference to Element 'spoke'` | names are resolved |
| asserted constraint `size(hubs) > size(sites)` (false) | PASS, no messages | constraints not evaluated |
| `part def HubAndSpoke :> HubVertiport, SpokeVertiport;` + usage | PASS, no messages | F01: checker misses the entailment |
| `part def DualRatedCharger :> HighPowerCharger, StandardCharger;` | PASS + WARNING `Duplicate of inherited member name 'ratedPower'` | F01 |
| `[2..4]` redefined `[2..6]` (widening only) | PASS + WARNING `…should not have larger multiplicity upper bound` | F03 |
| `[3..4]` redefined `[1..2]` | PASS + WARNING `Redefining feature should not have smaller multiplicity lower bound` | F03 |
| `<'PHY\-003'>` | FAIL `mismatched character '-' expecting set null` | F14 |
| `< 'PHY-003' >`, `<'PHY-003' >`, `<'PHY\'003'>`, `<'PHY\t003'>` | PASS | F14 |
| reference `aeroLink.''` | FAIL `Couldn't resolve reference to Feature ''''` | F14 |
| reference `aeroLink.part` | FAIL syntax | F14 |
| reference `aeroLink . 'PHY-003'` | PASS | F14 |
| reference skeleton with the proposed change (below) | PASS, no messages | F04 |

Grammar evidence: `SysML.xtext` inside the 0.62.0 jar (SHA-256 7d9142742c454f5810fe4db61a089abef5e0b8d61ad8bf552631d9136b04f298): `DefinitionDeclaration : Identification? SubclassificationPart?`; `FeatureSpecialization : Typings | Subsettings | References | Crosses | Redefinitions`; the only `'all'` is in `import`. `KerMLExpressions.xtext`: `UNRESTRICTED_NAME : '\'' ('\\' ('b'|'t'|'n'|'f'|'r'|'"'|"'"|'\\') | !('\\'|'\''))* '\''` — the escape set the mapper now uses.

## Design decisions (revision)

- **F01.** The listing is unchanged; the teaching point is rewritten to what the listing entails ("stated versus entailed"). Disjointness of hubs and spokes is entailed by lines 15, 18, 26 and 29; coverage holds in the two configurations by counting, not in the definition. a5 now asks about coverage in the definition (not guaranteed). Part 2 asks "guaranteed by the listing" rather than "asserted". The advanced example now says that a site with two high-power chargers is not thereby one of the network's hubs (true: `hubs` states a necessary condition).
- **F02.** KerML disjoining/unioning/`all` are taught as KerML; the SysML alternative taught and validated is the asserted constraint (library pattern). Memo (d) reworded so a correct answer exists.
- **F03.** Ill-formed (widening; KerML p.62 rule) vs unsatisfiable (non-overlapping ranges) separated in pc4's explanation, the advanced block, misconception 5 and the memo/key.
- **F04.** Skeleton: definitions declare, usages bind. Kind-defining values (the charger ratings) may sit in a definition; the lesson says why. A sentence reconciles the two PHY-002 models.
- **F05.** `recordedResult` takes a `HashState`; pending → no verdict; hashing failure → "cannot verify". Hash function injectable for tests.
- **F07.** Lesson trimmed; Session 2 gets 5 min for purpose and views; workload rows realistic except L9 out-of-class (remainder 0.2 h), realistic totals in cautions.
- **F08.** The checker block and predict activity moved before the worked examples; earlier text no longer states probe outcomes.
- **F13/F14.** Declared-name proposal per kind (`nameStyle`); "Other" placement takes a package name; short-name and reference checks follow the probes.

## Open issues / requests to the lead

1. **Reference skeleton (F04).** Proposed exact change to `sysml/reference/aerolink_v01_skeleton.sysml` (validated as a scratch copy: PASS, no messages): remove the `= …` bindings from the definition attributes at l.39–40 (`operatingDay`, `vertiportCount`), 315–316, 321–323, 328–331, 337–339 (move the `// DEC-002` comment with the value), 342–343, 346, 351, 355; add to `part aeroLink` (after its doc, l.359) `attribute :>> operatingDay = 16 [h]; attribute :>> vertiportCount = 6;`, and inside the PHY usages: PHY-001 `seats = 4; cruiseSpeed = 150 [km/h];` PHY-002 `sites = 6; hubs = 3; spokes = 3;` PHY-003 `installed = 12; highPowerAtHubs = 6; standardAtSpokes = 6; chargesPerChargerPerDay = 48;` PHY-004 `sites = 1; hotStandby = true; // DEC-002` `operatingDay = 16 [h];` PHY-005 `sites = 1; batteryWorkshop = true;` PHY-006 `media = "datalink + ground network";` PHY-007 `maxPartySize = 4;` PHY-008 `padsCovered = "all";` (each as `attribute :>> name = value;`). The same definitions recur in v0.2–v0.4 (e.g. v0.2 l.49, 707–708, 743, 748) and need the same change. Re-run `sysmlDrift.test.ts`, `sysmlMapping.test.ts` and a full `content:sysml` afterwards.
2. **PROVENANCE (F09).** Append to `tools/sysml-pilot-2026-08/PROVENANCE.txt` the section given in the revision report (README.adoc, install.bat, install.sh and the conda-forge recipe, with the URLs and SHA-256 values above).
3. **Workload (F07, S9-N4/N5).** Superseded by DECISION_LOG A14: option E adopted (installation moves to a pre-course Week 0 task) and option B applied (graduate memo optional this week). Realistic ≈ 9.3 h for every student, ≈ 10.8 h for a graduate student who submits the memo. **Request:** create the Week 0 task (none exists in the app yet) and confirm the option B alternation (Week 11 still carries a required task).
4. **S06 p.197** (reserved words) is outside the register; the block/value claim rests on S06 p.48 and the probes.
5. The earlier notes' issues 3 (concurrent run), 4 (Button className) and 5 (week08 scratch file; `tsc -b` now clean) are closed. The canonical report was regenerated by a full run at the end of this revision.

## Sign-off fix pass (2026-10-11; `_source_cache/review/week09_signoff.md`, S9-N1..N7)

| Finding | Fix | Evidence |
|---|---|---|
| S9-N1 (High) key leak in the score line | `scorePredictions(predictions, revealed, recorded)` ported from Week 10's `scorePredictions10`: only revealed items with a SHA-matched record are scored, against `rec.outcome`; the component hashes every revealed listing; score line "N predicted; M revealed with a verified record; of those …" | New tests: logic "review S9-N1 …" and two component tests (trying every option before reveal never moves the score; a stale record is not scored). Mutation (old behaviour restored: no reveal/record filter, compare with `item.answer`): 3 tests fail; restored, 31/31. |
| S9-N3 "matches" vs key | Compares with `rec.outcome`; text "Your prediction matches the recorded result" | Component test asserts the new text. |
| S9-N2 (High) quiz all "b", length cue | Keys a4 · b4 · c4 · d3; keyed options cut to distractor length, justification moved into explanations; distractors given their own reasons | `src/activities/week09/quiz.test.ts` (key spread 3–4 each; correct longest ≤ 4/15 and < 1.3 × distractor mean; no 8-word lesson run; Bloom Apply 7 · Analyse 5 · Evaluate 3). Now longest 3/15, max ratio 1.14. Against the HEAD quiz the test fails 2 of 4. |
| S9-N4 option E | L9 block, lab step 1, facilitation, workload row and caution now treat installation as the pre-course Week 0 task; faculty open issue replaced by a lead request to create that task | DECISION_LOG A14. |
| S9-N5 memo budget | Memo optional this week under option B, budget ≈ 1.5 h when submitted (stated in cautions); assignment, template §7, rubricScope, deliverable, answer key and outcomes say "optional" | Justification: Week 9 carries the CP3 defence, first model and tool check; Weeks 8 and 10 carry required graduate tasks. KerML stays assessed through q9-5, q9-14. |
| S9-N6 R79 | Removed: worked (c) now cites S06 p.77 (library specifies quantity kinds and units) and R90 sl.17 (ISQ and SI among the standard libraries); R79 dropped from citations and references | Re-read S06 p.77, R90 sl.17. |
| S9-N7 q9-5/q9-14 | q9-5: new case, subsetting with a larger multiplicity than the (redefined) subsetted feature, unsatisfiable (R87 p.61–62; uniqueness default S06 p.73). q9-14: new case, two sibling bindings of one single-valued feature entail disjointness; distractors test sufficiency, coverage and sibling redefinition | Re-read R87 p.52–53, 61–63; S06 p.73. No checker claim is made for either case. |

Workload rows: 2.5 + 2.3 + 0.8 + 1.5 + 0.3 + 0.2 + 0.2 + 1.2 = 9.0 h (the definition-of-done check requires the syllabus figure); L9 out of class is realistically 1.5 h, so ≈ 9.3 h, stated in the caution. Lesson 4,825 words. No listing changed, so no checker run was needed.
