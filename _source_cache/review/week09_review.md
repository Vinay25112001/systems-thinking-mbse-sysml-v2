# Week 9 independent review: MBSE foundations and the SysML v2 language (L9, CP3 defence)

Reviewer: independent adversarial reviewer (AI), 2026-10-11. No course or app file was edited.

**Under review:**
- `learning-studio/src/content/weeks/week09.ts`
- `src/activities/week09.activity.tsx` and `src/activities/week09/*`
- `sysml/week09/*.sysml` (11 files)
- `docs/authoring/week09_notes.md`

**Checked against:**
- the course plans: `course.ts`, AUTHORING_GUIDE §7, ASSESSMENT_RUBRICS (RB-6, RB-7, RB-8, RB-16), LABORATORY_AND_CAPSTONE_PLAN (C.2, C.4, C.5, Part B L9), WEEKLY_INSTRUCTIONAL_PLAN Week 9;
- the toolchain records: SYSML_TOOLCHAIN.md, PROVENANCE.txt, the bundled `kernel/install.py` and `kernel/sysml/kernel.json`;
- the reference model: `sysml/reference/README.md` and `aerolink_v01_skeleton.sysml`, plus the reference data in `src/model/reference/week02–08.ts`;
- the sources, read via `scripts/source_pages.py`: R28, R33a–c, R43, R70, R79, R80, R83, R87, R90.

**Tests run:**
- `npx vitest run src/activities/week09 src/content`: 4 files, **89/89 pass**.
- `npx tsc -b`: **clean**. The week08 scratch file named in notes open issue 5 no longer exists, so that issue is stale.
- One run of the course checker on 27 scratch copies and probes, with `--report` written to the scratchpad. No other `java` process was running before or during the run.

## Verdict

**Revise before sign-off.** The checker records are honest: all 11 Week 9 results reproduce byte-for-byte, and every recorded message matches. The model-versus-view arithmetic is right, the citations are mostly accurate, and the install steps match the real 2026-08 release.

Two High findings, though, sit at the centre of the graduate KerML content:

1. **The hub/spoke example is wrong (W9-F01).** The worked example's main teaching point is "the listing does not say a site can't be both a hub and a spoke". That claim is false by entailment from the listing itself. The advanced block's AeroLink illustration ("a spoke with two high-power chargers") describes something the listing makes impossible.
2. **The proposed fixes do not exist in SysML (W9-F02).** The lesson recommends disjoining, unioning and KerML "sufficient" (`all`) types. The SysML v2 notation, as the course checker accepts it, rejects all three as syntax errors.

There are also nine Medium findings. They cover:
- an over-strong claim about widening redefinitions;
- a model answer that breaks the lesson's own "bind estimates in usages" rule and cannot express ALT-004;
- a fail-open hash gate in the predict activity;
- S06 being required and quizzed but not registered as a Week 9 reading;
- workload;
- lesson text that answers four of the eight predict items in advance;
- tool-onboarding omissions;
- the L9 skeleton's description and coverage not matching the lab step.

## Findings

| ID | Severity | Location | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| W9-F01 | **High** | Commentary on worked example (b), ¶2 ("Nothing says that a site cannot be both a hub and a spoke … 3 + 3 = 6 is a coincidence"). Assertion a5 explanation (`semantics.ts`). Graduate memo (d) and its answer-key line (d). Advanced ¶1 ("a spoke that happens to have two high-power chargers is not thereby a hub"). | **The listing does entail that no site is both a hub and a spoke.** The derivation runs as follows. **(1)** `ratedPower` (l.12) is owned by a definition with no subsetting, so it is exactly 1..1 (S06 p.73). **(2)** HighPowerCharger binds it to 350 kW (l.15) and StandardCharger to 150 kW (l.18), so nothing can be both: the two are disjoint by entailment. **(3)** At a SpokeVertiport every charger is a StandardCharger (l.29, redefinition, KerML p.62). **(4)** At a HubVertiport the two turnaround chargers are HighPowerChargers *and* among its chargers (l.26, KerML p.61). **(5)** So anything that is both a hub and a spoke needs a charger with 350 kW = 150 kW, which is impossible. **(6)** Since the hubs and spokes values are then disjoint, and baselineNetwork redefines sites[6], hubs[3] and spokes[3], hubs ∪ spokes = sites in the baseline (likewise 6 = 4 + 2 in ALT-004). The "coincidence" is a consequence. **(7)** The advanced block's example is impossible under the same listing: a spoke cannot have high-power chargers at all. The lesson's own a4 says every charger at a spoke is a StandardCharger. The memo prompt (d) and model answer then ask students to "fix" a gap that does not exist in the configurations. | Listing lines 11–18, 26, 29, 42–44, 48–50. Sources: S06 p.73 (default 1..1), R87 p.61–62 (subsetting, and redefinition with the same values), R87 p.52 (abstract types). | Rewrite ¶2, a5 and the memo prompt. One honest option: "the listing never *states* disjointness; it is only *entailed* by the instructor's charger ratings. Delete the ratedPower bindings and it is no longer entailed." That is a better graduate exercise (stated versus entailed). Alternatively, remove the bindings from the listing so the original claim becomes true. Replace the advanced example with "a Vertiport (not declared a hub) that has two high-power chargers". |
| W9-F02 | **High** | Commentary ¶2 ("KerML provides disjoining and unioning … A reviewer should ask for them"). Memo (d) ("propose the KerML/SysML construct … e.g. disjoining or unioning, R87 p.55–57"). Answer key (d). Advanced ¶1 and q9-14 ("only declaring the type sufficient (the keyword all)"). | **These constructs are not available in the SysML v2 textual notation that the course checker accepts.** All three are rejected as syntax errors: `disjoint hubs from spokes;` inside a part def; `part def SpokeVertiport :> Vertiport disjoint from HubVertiport;`; and `part def AnyVertiport unions HubVertiport, SpokeVertiport;`. `part def all DispatchReadyAircraft` is also a syntax error. The facilitation note anticipates "honest reports of rejection", which shows the author suspected this but did not probe it. Telling reviewers to "ask for" constructs that the language (as implemented) lacks is a false modelling rule, the same defect class as Week 8. q9-14 is keyed in KerML terms and is acceptable as KerML, but the lesson never says SysML definitions cannot be declared sufficient. | Probes p06, p07, p15 and p08 below: each FAILs with "no viable alternative at input …". | State it explicitly: "KerML has these; the SysML v2 notation (pilot 2026-08) does not expose them on definitions and usages." Name the SysML alternatives (an asserted constraint over the features, with the caveat that the checker does not evaluate constraints; a doc convention; or variation/variant, S06 p.65) and probe whichever is taught. Reword memo (d) so a correct answer is possible. |
| W9-F03 | Medium | Advanced ¶2 ("A redefinition that widens a multiplicity … describes something no instance can satisfy"). Misconception 5 reasoning. File name `predict_pc4_redefinition_widens_multiplicity`. pc4 title and explanation. | **Widening is not unsatisfiable.** Redefinition requires equal values, so the effective constraint is the *intersection* of the two multiplicities. [2..4] redefined as [2..6] is satisfied by any instance with 2–4 values. KerML forbids widening as a *well-formedness* rule ("must only allow cardinalities consistent with", p.62). That is a different claim from unsatisfiability. pc4 (exactly 3 redefined as exactly 4) is unsatisfiable because the ranges are *disjoint*, not because the upper bound grew. The checker gives the same warning for the satisfiable widening case. | R87 p.62. Probe p04 ([2..4]→[2..6]): PASS with "Subsetting/redefining feature should not have larger multiplicity upper bound", the same message as pc4. | Separate the two claims: "ill-formed under KerML p.62 (widening)" versus "unsatisfiable (disjoint ranges, e.g. 3 vs 4)". Rename pc4 to "conflicting multiplicity". |
| W9-F04 | Medium | `aerolink_l9_skeleton.sysml` l.60–73 (model answer). Worked (c) ¶3. Answer key "L9 model answer". Reference `aerolink_v01_skeleton.sysml` (lead-owned). | **The model answer breaks the lesson's own rule and cannot express DEC-001.** The lesson says AeroLink-specific values are bound in usages, not in definitions, and q9-8 keys option (c), a binding in the part def, as wrong. Yet the skeleton binds AeroLink configuration in definitions: VertiportNetwork `sites = 6`, `hubs = 3`, `spokes = 3`; ChargingSystems `installed = 12`, `highPowerAtHubs = 6`; EVTOLAircraft `seats = 4`, `cruiseSpeed = 150 [km/h]`. With `hubs = 3` in the definition, ALT-004's four hubs cannot be expressed as a configuration without editing the definition. That is exactly the pattern worked (b) teaches against ("neither changes the definitions"). The week also shows two incompatible models of PHY-002's VertiportNetwork (Natural attributes in (c), part features in (b)) with no comment. | Skeleton lines 61–62, 66–68, 72–73. Lesson w9-worked-skeleton ¶3; q9-8 option c explanation; w9-worked-semantics ¶3. | Move the configuration bindings into the `aeroLink` usages (or say explicitly why design-invariant constants may sit in definitions). Add one sentence reconciling the two VertiportNetwork models. Report this to the lead, who owns the reference skeleton. |
| W9-F05 | Medium | `predict.ts` `recordedResult`; `PredictChecker.tsx` (`sha[item.file] ?? null`) | **The hash gate fails open.** `recordedResult(entry, null)` returns `state: 'recorded'`, and the component passes `null` until `sha256Hex` resolves. If `crypto.subtle` is unavailable (an insecure context, e.g. the app served over http on a LAN IP), the hash never resolves and the record is always shown unverified. This contradicts "only when the recorded SHA-256 matches the text on screen", which appears in the lesson, the instructions and the notes. The shared `SysmlListingView` waits for the hash; this activity does not. No test covers the `null` case. | Code inspection: `if (displayedSha !== null && entry.sha256 !== displayedSha) return stale`. Tests only use non-null hashes. | Return a `pending` state for `null` (and `unverifiable` if hashing throws). Add a test that a `null` hash shows no verdict. |
| W9-F06 | Medium | `course.ts` Week 9 readings (R28, R33a–c, R70, R90; extension R87). Workload row "Required S06 extracts". Quiz items. | **Reading register gap (same class as W8-F09).** S06 (R80) p.47–50, 55–56, 63–65, 72–73 and 77 is called "required" and carries most of the language rules. Six quiz items depend on it (q9-2, q9-6, q9-8, q9-10, q9-11, q9-15). It is not in the `course.ts` Week 9 readings or the weekly plan ("16 pp + 35 slides"). R79 (S10 sl.167–168) is likewise only in `references`. q9-5 is not marked "Graduate" but depends on R87 p.62, which is an extension reading. | `course.ts` l.171–172; WEEKLY_INSTRUCTIONAL_PLAN Week 9 readings table. | Register the S06 page subsets as Week 9 readings (and update the plan's page count), or re-anchor the quiz items on R70/R90. Mark q9-5 as graduate or re-cite it to S10 sl.12 plus the lesson. |
| W9-F07 | Medium | `workload`; caution 8; notes open issue 2 | **The workload is understated even by the author's own estimate.** The lesson blocks run to ≈ 7,000 words (my count of the block strings). Rule 3's rate (≈ 4–5k words per hour) puts that at ≈ 1.5 h before the three activities. The budget gives 0.7 h for lesson plus activities, and the caution's "≈ 12 h realistic" leaves this line out. A realistic total is ≈ 13 h against the 9 h syllabus figure. Separately, the lab step "In class: model purpose and views" has no time in the Session 2 run-sheet (5 + 35 + 10 + 20 + 5). | Rule 3; `instructorNotes.sessions[1]`. | Correct the caution to ≈ 13 h, trim the lesson (e.g. the application block), and give the purpose and views step 5 minutes or move it out of class. |
| W9-F08 | Medium | w9-language ¶5; w9-worked-mapping ¶3; w9-relationships ¶4; commentary ¶2 (all shown before the predict activity) | **Lesson text answers predict items before the activity (same class as W8-F20).** w9-language ¶5 says that `block` and `value` were "rejected as syntax errors" (pc5). The mapping block explains the unquoted-ID parse error and its cascade (pc1). w9-relationships says the activity "shows what the tool does when a model widens one", and the commentary describes the pc4 variant (pc4). Four of the eight predictions are spoiled. | Block order in `week09.ts`; `inBlock: 'w9-checker'`. | Move the predict activity before w9-language, or cut the outcomes from the earlier text ("you will test this in the activity"). |
| W9-F09 | Medium | L9 lesson block; lab step 1; facilitation checklist; caution 1 | **The tool onboarding is accurate but incomplete for managed machines.** I fetched the release files (2026-10-11). README.adoc matches the lesson: Java 21+, Miniconda, "Add Anaconda to my PATH", `install.bat` / `chmod +x ./install.sh && ./install.sh`, then `jupyter lab`. `install.bat`, however, also does three things the lesson and checklist never mention: **(a)** it runs `conda install "jupyter-sysml-kernel=0.62.0" python=3.* jupyterlab=4.* graphviz=2.* nodejs -c conda-forge -y` into the **active (base) environment**; **(b)** it runs `jupyter labextension install @systems-modeling/jupyterlab-sysml@0.62.0`, which needs the **npm registry**; **(c)** it runs a separate `install/jupyter/install.py`. A failure in any of these aborts the script (`|| goto:error`). Nor do they offer a fallback when conda or npm is blocked, even though the course itself validates with the portable JDK and jar (SYSML_TOOLCHAIN). The kernel name `sysml` and "the jar is in the kernelspec folder" are **correct**: the conda-forge `jupyter-sysml-kernel` 0.62.0 recipe sources the same zip and runs `python ./install.py … --sys-prefix`, i.e. the bundled `install.py`. That evidence is not in PROVENANCE, though, and neither is the README fetch. | Fetched: SysML-v2-Release/2026-08 `install/jupyter/README.adoc` and `install.bat`; conda-forge `jupyter-sysml-kernel-feedstock` recipe. PROVENANCE §1 (records only that `install.bat` pins 0.62.0). | Add to the checklist: conda-forge and npm reachability, the base-environment change (or a named env), disk space, and an extension-failure fallback. Offer a documented fallback route (instructor-run headless checks, or a prepared lab image). Record the README, `install.bat` and feedstock evidence in PROVENANCE. |
| W9-F10 | Medium | Worked (c) ¶1–3; skeleton header comment; lab step "PHY definitions and usages"; lab artefact "one mapped element per other L9 kind" | **The skeleton's description and coverage do not match the lab step.** The lesson says "Stakeholders, Needs and Behavior each hold one mapped element (STK-005, CON-006, NEED-004, CAP-003, SCN-003)", but they hold 2, 2 and 1. The header claims "one mapped element of each Part I kind that has a package at L9", but MGO (Needs), REQ, FN/LOG/AI (Logical), IF/INFO (Physical), VER and A/R/O/U have none. The lab step requires "one element of each other Part I kind that has an L9 package (as in worked example c)", which the example does not show. That requirement is also beyond the lab-plan L9 minimum (packages, mapping table, ≥ 6 PHY). | Skeleton l.30–125; lab plan Part B L9. | Either add one MGO example and narrow the lab requirement to "STK, CON, NEED/MGO, CAP, SCN", or label it as beyond the L9 minimum. Fix the "each hold one" sentence. |
| W9-F11 | Low | Worked (c) ¶3 ("because the library has no A-weighted unit symbol (sysml/reference/README.md §5)") | **Misattributed reason.** README §5 says A-weighting and LAmax go in `doc` "because ISO 80000 forbids decorating unit symbols". | README l.185 | Quote the README's reason. |
| W9-F12 | Low | Advanced ¶4 ("The rule of thumb the course grades under RB-8.3 is: …") | **Overclaim.** RB-8.3 says "Definition/usage used correctly; specialization, subsetting and redefinition used purposefully". It contains no such rule. | ASSESSMENT_RUBRICS RB-8.3 | Label it as instructor guidance, not the graded criterion. |
| W9-F13 | Low | Mapper `buildMapping` (`declaredName: nameForm(e.name)`); "Other" option | **The mapper's "Declared name" column contradicts the worked convention.** For PHY-003 it proposes `'Charging Systems'` as the usage name, while the lesson and reference use `chargingSystems : ChargingSystems`. Choosing "Other (a package you add)" records no package name, so the Markdown table just says "Other". | `mapping.ts`; lesson table row PHY | Propose a camelCase usage name or a PascalCase definition name according to `idOn`. Add a free-text package name for "Other". |
| W9-F14 | Low | `shortNameProblem`, `referenceProblems` (rule 5) | **The checks have realistic false accepts and false rejects.** `<'PHY\-003'>` is accepted (the backslash is stripped), but the checker rejects it ("mismatched character '-'"). `< 'PHY-003' >` (legal whitespace) is rejected with "must be the course ID exactly". `referenceProblems` accepts an empty `''` segment and reserved words as segments. | Probe p16; code | Validate escapes against KerML's escape set, trim inside the brackets, and reject `''`. |
| W9-F15 | Low | `SemanticsClassifier.tsx` token buttons; `<pre>` in both activities | **Accessibility gaps.** After "Check", the ✓/✗ is visible text inside the button, but the button's `aria-label` overrides it, so screen-reader users get no per-token result in the listing. The scrollable `<pre>` blocks are not focusable (the shared `SysmlListingView` uses `tabIndex={0}`), so keyboard users cannot scroll long lines. The facilitation note claims full keyboard and non-colour access. | Code inspection | Append the result to the `aria-label`; add `tabIndex={0}` to the `<pre>` blocks. |
| W9-F16 | Low | Defence ¶2; answer key "CP3 defence, strong" | **The model answer understates residual risk.** It names R-001 only. Reference DEC-001's residual risk is "R-001 reduced but not removed; R-005 at the converted hub; R-002 rises with more cycles on high-power chargers". RB-6.6 level 4 asks for residual risk. | `src/model/reference/week07.ts` DEC-001 `residualRisk` | Add R-005 and R-002. |
| W9-F17 | Low | w9-language ¶1; ¶4 / worked (c) ¶2 | **Loose paraphrases.** **(a)** R70 sl.4 does not list "feature typing" for Core (it lists specialization, conjugation, type featuring, feature chaining …), and ISQ/SI are not named on sl.3–4. **(b)** S06 p.77 lists String, Boolean, Integer, Rational, Real and Complex. It does not mention Natural or say that counts "take no unit". | R70 sl.3–4; S06 p.77 | Tighten the wording, or add R90 sl.17 for the library names. |
| W9-F18 | Low | `week09_notes.md` open issue 5; `review.openIssues: []`; caution 10 | **Stale or inconsistent records.** `npx tsc -b` is now clean and the week08 scratch file is gone. `openIssues` is empty although the notes list four live issues (S06 p.197 registration, workload, report regeneration, PROVENANCE). Caution 10 calls R83 "a Week 10 reading", but `course.ts` lists it as a Week 10 *extension*. The notes' probe row "Redefinition with a lower bound" should read "lowering the lower bound". | `tsc` run; `course.ts` l.185 | Update the notes and `openIssues`. |
| W9-F19 | Low | q9-3; misconception 6 | **Rule 6 borderline.** q9-3's keyed answer restates w9-mbse ¶5 (language check versus model quality versus design quality, the chair) almost directly. | Lesson ¶5 | Recast with a new artefact, e.g. a model that is valid but purpose-free. |

## Citation fidelity

| Claim (location) | Cite | Verdict | Evidence |
|---|---|---|---|
| Model definitions; many models per SoI (w9-mbse ¶1) | R33a p.290 | OK | Five definitions, selective representation with mapping, "many different models may be required" |
| Abstract and concrete syntax, semantics; a tool checks conformance (¶1) | R33a p.291–292 | OK | Modeling Language / Modeling Tools sections |
| INCOSE MBSE definition; models are primary artefacts (¶2) | R33a p.292 | OK | Quoted INCOSE 2007 |
| Single source of truth; SysML (¶2) | R28 p.370 | OK | "centralized repository … 'single source of truth'" |
| Model property list; formality and abstraction matter most (¶2) | R28 p.370–371 | OK | "most frequently discussed … greatest impact" |
| Criteria: strict language compliance; functional and structural architecture at minimum | R28 p.371 | OK | Items 3 and 6 |
| Three benefits; "if implemented appropriately"; updates are a minimum | R28 p.373 | OK | Benefits and Digital Transformation sections |
| Documents generated as static representations; digital twin | R28 p.374 | OK | MBSE vs DBSE; Digital Twins |
| SysML is graphical with nine diagram types (labelled as v1) | R28 p.372 | OK | Verbatim content; correctly flagged |
| A system model may comprise multiple views | R33c p.300 | OK | System Models paragraph |
| Viewpoint and view definitions | S06 p.48 | OK | Bullet on viewpoints and views |
| Graphical, tabular and textual notation; API; new metamodel; formal semantics | R90 sl.7, sl.9 | OK | |
| Quote "The quality of a model should not be confused …"; the chair | R33b p.296 | OK, verbatim | |
| Hybrid descriptive and analytical model | R33c p.299–300 | OK | |
| Language layers | R70 sl.3–4; R90 sl.8 | OK, minor | See W9-F17 |
| SysML directly uses KerML; most elements specialize KerML | S06 p.47 | OK | |
| Packages, imports, quoting, qualified names | R70 sl.5; R90 sl.17, sl.21 | OK | |
| Private/public visibility; import visibility must be explicit; prefer private | R70 sl.6 | OK | Slide callout "Visibility must be shown explicitly …" |
| Element ID; name and short name in `< >`; "a user or tool selected id" | S06 p.49; R90 sl.22 | OK | Quote verbatim from sl.22 |
| Basic versus unrestricted names; escapes for `'` and `\` | S06 p.49–50 | OK | |
| Definition classifies; usage defined by ≥ 1 definition or the implicit library one | S06 p.63 | OK | |
| A feature relates instances (the mass example) | S06 p.63 | OK | |
| Package-level usage is a generic feature | S06 p.64 | OK | "implicit feature of … Anything" |
| Part def exists in space and time; attribute def has no composite features; attribute usage referential | R70 sl.9; S06 p.77 | OK | |
| No system/subsystem/assembly/component constructs | S06 p.48 | OK | |
| Specialization; multiple generalizations; `:>` = specializes | R70 sl.10; S06 p.64, p.72 | OK | |
| Abstract → instances of a concrete specialization | R70 sl.10; S06 p.72 | OK | "concrete" comes from S06 p.72 |
| Specialization extent ⊆ general extent | R87 p.53 | OK | §7.3.2.3 |
| Subsetting definition; truck wheels | R70 sl.11; S06 p.64 | OK | |
| Redefinition replaces in context; DieselFuel | S06 p.65 | OK | |
| Redefine name, type or multiplicity; `:>>`; `redefines cyl[4]` shorthand | R70 sl.12 | OK | |
| Usages redefine "to any level of nesting"; defined-by is generalization | R70 sl.15 | OK | |
| `smallVehicle :> vehicle`; composite structure entirely on parts | R70 sl.16 | OK | |
| Binding through redefinition | R70 sl.13 | OK, mild | The slide shows binding by redefinition; it does not say this is "how" binding is done |
| Three owned specializations of a usage | S06 p.72 | OK | |
| Default 1..1 conditions; a package-level usage is not 1..1 | S06 p.73 | OK | |
| Subsetting reuse leaves the original unchanged | S06 p.65 | OK | vehicle1 / vehicle2 |
| Disjoining and unioning "for exactly these statements" | R87 p.55–57 | **OVERCLAIM in a SysML context** | The KerML text is accurate, but the constructs are not in the SysML notation the checker accepts (W9-F02), and the premise is wrong (W9-F01) |
| Redefinition: same values; multiplicity consistent | R87 p.62 | OK, but the derived claim about widening is an **OVERCLAIM** | W9-F03 |
| Necessary vs sufficient; Car; `all` | R87 p.52–53 | OK (KerML); **misapplied** to the AeroLink spoke example (W9-F01); `all` not usable in SysML (W9-F02) | |
| Subsetting on each instance separately; restricts type and multiplicity | R87 p.61 | OK | |
| A redefined feature is not inherited; name resolution starts in supertypes | R87 p.63 | OK | |
| Quantity kind on the type, unit on the value | S06 p.77 | OK | "only the kind of unit … specific unit … with an actual quantity value" |
| Counts and flags take no unit | S06 p.77 | **OVERCLAIM (minor)** | W9-F17 |
| Quantity value, ISQ/SI, short names like `<kg>` | R79 sl.167–168 | Not re-read in detail | In range; plausible |
| Requirement short name = requirement ID | S06 p.165 (R83) | OK | Week 10 extension (W9-F18) |
| Ownership deletion; definitions and usages are namespaces (q9-11) | S06 p.55–56 | OK | |
| Import visibility explicit (pc3) | S06 p.61 | OK | "always shown explicitly" |
| Decision analysis steps; DM accountability | R43 p.109–110 | OK | |
| Model purposes; aircraft example | R33b p.295–296 | OK | |
| Integration; semantic interoperability; standards | R33c p.301–302 | OK | |
| Informal vs formal; scope of MBSE (q9-1) | R33c p.298 | OK | |
| dB(A) reason | README §5 | **WRONG REASON** | W9-F11 |
| RB-8.3 "rule of thumb the course grades" | RB-8.3 | **OVERCLAIM** | W9-F12 |

## Checker probes (re-run 2026-10-11, release 2026-08, kernel 0.62.0, one JVM, scratch copies)

| Probe | Lesson or key says | Observed | Agrees? |
|---|---|---|---|
| All 11 `sysml/week09` files | Recorded report | Identical status and messages (line:col and text) | Yes; hashes match the report |
| pc1 unquoted reference | FAIL syntax | `no viable alternative at input '-'` then `Couldn't resolve … 'PHY'` | Yes |
| pc2 duplicate short name | PASS + warning | 2 × "Duplicate of other owned member name" | Yes |
| pc3 import without visibility | FAIL syntax; "8 errors, 3 warnings" | 8 ERROR, 3 WARNING, first is `mismatched input 'import'` | Yes |
| pc4 3→4 in a subsetting chain | PASS + warning | "Subsetting/redefining feature should not have larger multiplicity upper bound" | Yes |
| pc5 `block` | FAIL syntax | `no viable alternative at input 'EVTOLAircraft'` | Yes |
| pc6 attribute def owning a part | PASS silent | No messages | Yes |
| pc7 part typed by an attribute def | FAIL rule | Rule error, plus an extra WARNING "Duplicate of inherited member name 'self'" (not mentioned; harmless) | Yes |
| pc8 usage `:>` a definition | FAIL resolution | `Couldn't resolve reference to Feature 'Vertiport'` | Yes |
| invalid_unquoted_short_name | FAIL 15:12 `mismatched input '-' expecting '>'` | Same | Yes |
| p01 `value cruiseSpeed` | FAIL syntax (lesson) | FAIL `no viable alternative` | Yes |
| p02 redefine Charger[*] as unrelated Pack[2] | PASS silent (advanced) | PASS, no message | Yes |
| p03 lowering the lower bound | WARNING "Redefining feature should not have smaller multiplicity lower bound" | Exact text | Yes |
| p04 widening only, [2..4]→[2..6] | (lesson: "unsatisfiable") | PASS + same warning as pc4 | The checker agrees with KerML well-formedness; **the lesson's unsatisfiability claim is wrong** (W9-F03) |
| p05 `350 [kW*h]` bound to a PowerValue | Silent (lesson, citing Week 6) | PASS, no message | Yes |
| p06 `disjoint hubs from spokes;` in a part def | Recommended by the lesson | **FAIL syntax** | No (W9-F02) |
| p07 `part def … disjoint from …` | Recommended | **FAIL syntax** | No |
| p15 `part def … unions …` | Recommended | **FAIL syntax** | No |
| p08 `part def all …` | Implied by "declared sufficient" | **FAIL syntax** | No |
| p09 q9-10 key (escaped apostrophe) + q9-4 fragment | Valid | PASS | Yes |
| p10 q9-5 rotors 6→8 | Contradictory | PASS + upper-bound warning | Yes (the checker only warns, consistent with the lesson's message) |
| p11 q9-15 key + quoted reference | Valid | PASS | Yes |
| p12 q9-9 `public import` re-export | Visible to the importer | PASS (SpeedValue resolves via AeroLinkUnits) | Yes |
| p13 q9-7 | Valid | PASS | Yes |
| p14 q9-8 option d (part typed by DurationValue) | Wrong | FAIL rule | Yes |
| p16 `<'PHY\-003'>` | Mapper accepts | **FAIL lexer** | No (W9-F14) |

**Notes' probe table:** every row I re-ran matches. I did not re-run "missing SI import", "mass bound to [km]" or "def-over-def widening".

## Technical checks

- **Model-versus-view arithmetic is correct against the reference formulas** (week03 cycle, week07 capacity):
  - cycle 16 + 29 + 2 = 47 min;
  - 960 / 47 × 0.90 = 18.38 trips per aircraft;
  - 16 × 18.38 = 294.1 trips/day;
  - charger side 8 × 40 = 320;
  - min = 294 < 300.
  
  With a 24-min charge, ALT-002 (min(331, 240) = 240) and ALT-003 (min(221, 320) = 221) also fail, so "the trade study must be reopened" is right. The baseline cases are also correct: 16 × 20 = 320 and 8 × 48 = 384. A-007, REQ-STK-005 (20 + 5), REQ-SYS-001, MOP-002/TPM-001 (18 min estimate) and TECH-001's "sets the 25 min turnaround" all match the reference text.
- **Defence reference numbers match DEC-001:** 0.670 / 0.489, 0.478, 0.226, 192 trips/day, TBD-02. DEC-002's alternatives and rationale match `week08.ts`. The only gap is residual risk (W9-F16).
- **The L9 skeleton covers the lab-plan minimums:** nine packages in plan order, ≥ 6 PHY (8), typed attributes with SI units, short-name IDs, zero errors. Beyond that, see W9-F04 and W9-F10.
- **Mapping table vs C.2:** consistent. C.2 says FN → "action def / logical part", while the reference and mapper use action usages; that is acceptable and follows the reference.

## Activities

**Classifier.** The 15-token key and 6 assertions match the answer key. The agreement test is meaningful: flipping s14 fails it. a5's explanation is wrong (W9-F01).

**Mapper.**
- Read-only; the reference preview writes nothing.
- The reference skeleton's short names pass its own check (rule 4).
- Moving a kind without a reason is flagged.
- Gaps are listed in W9-F13 and W9-F14.

**Predict.**
- The key equals the recorded class, and the test checks this.
- File names are hidden until reveal.
- It shows only recorded diagnostics, except for the fail-open hash gate (W9-F05).

**Tests.** Each test can fail (there are mutation checks for the classifier key, the stale/missing record and scoring), and the reference items pass their own checks.

## Quiz, assessment, continuity

**Quiz.**
- There are 15 items covering B9.1–B9.5, with sensible Bloom levels.
- Every keyed answer I could probe behaves as claimed (p09–p14).
- The rule 6 issue is borderline only (W9-F19).
- q9-14 is correct as KerML, but see W9-F02.

**Rubric scope.** These items are correct:
- RB-8.1–8.2 formative for L9, summative RB-8 at CP4 (10 %; RB-8 is 0.75 of CP4 in the matrix);
- CP3 9 % (RB-6 45 · RB-7 45 · RB-12 10), with RB-6.6 and RB-7.4 informed by the defence (matrix rows 128–132);
- the graduate memo is always read (RB-16 note), with formative feedback on RB-8.3 and informing RB-16.1. That satisfies rule 2.

**Continuity.**
- With Week 8: the statements of CP3 timing, mapping and IDs agree.
- With Week 10: `week10.ts` does not exist yet. The promises made here (REQ with subject, ports and interfaces, allocations in v0.2) match lab-plan L10.

## Verified correct (selection)

- **Install steps.** The prerequisites and install commands match the 2026-08 `install/jupyter` README and `install.bat` (fetched). The kernel name `sysml` and the jar location are correct, via the conda-forge recipe running the bundled `install.py`.
- **Checker description.** The lesson's description of the checker (release, kernel 0.62.0, Java 21, parse + resolution + validation, ERROR fails and WARNING does not) matches SYSML_TOOLCHAIN.
- **Checker behaviour claims.** All the lesson's specific claims about checker behaviour reproduce: the lower-bound warning text, the unrelated-type redefinition passing silently, the energy-unit-to-power binding passing silently, block and value as syntax errors, pc3's 8 + 3 messages, and invalid_unquoted_short_name at 15:12.
- **Workload sum.** The rows sum to exactly 9.0 h, and the session timings sum to 75 + 75 minutes.
- **Fictional IDs.** CON-017, A-109 and DEC-102 do not collide with the reference.
- **Reference IDs.** The reference IDs used (EXT-001/002, STK-005, CON-006, NEED-004, CAP-003, SCN-003, PHY-001…008, FN-006/007 → PHY-003) match the reference names and allocations.
- **Build and tests.** `vitest` 89/89 and `tsc -b` are clean.
