# Week 1 authoring notes

Module: `src/content/weeks/week01.ts` (+ `week1.ts`, `quizWeek1.ts`, `causalLoops.ts`), model `src/sim/aerolink.ts`, explorer `src/components/DynamicsExplorer.tsx`, diagram `src/components/CausalLoopDiagram.tsx`. Status: `self-checked` (independent review still required).

This file records the second fix pass (2026-10-11), made in response to `_source_cache/review/week01_rereview.md` (W1-R01 to W1-R08). The first fix pass responded to `week01_review.md` (W1-F01 to W1-F25). Every model number quoted below and in the course text is pinned in `src/sim/aerolink.test.ts`.

## Disposition of the re-review

| ID | Sev. | Disposition | What changed |
|---|---|---|---|
| W1-R01 | major | Fixed | The invented choice "Reinforcing growth limited by the market" was removed. The six choices are now all R05 pp.283–284 archetypes. Feedback is per scenario and per choice: *match*, *partly fits* (with a reason) or *does not match*. **Limits to Growth matches two runs, with different limits**: the charging limit (fixed chargers, q1-7) and the market limit (R1 meets B4, q1-5). The scenario label is now "Limits to Growth: the market limit…", and answerKey[3] and `w1-feedback` ¶4 agree with it. Cross-check against R05 and the quiz below. |
| W1-R02 | major | Fixed | The measure was re-decided (see below). The explorer now shows charger-months alongside surplus aircraft-months, labelled "counts aircraft only". Step 3 compares three named single changes and asks for a 60- and a 120-month reading. It has several defensible answers: the choice turns on the horizon and on the relative cost of chargers, which the model does not price. The memo instruction, template §4, facilitation note and answer key were rewritten to match, with every number recomputed and test-pinned. |
| W1-R03 | minor | Fixed | The q1-5 stem now holds attractiveness (the waiting time) constant. The b and c explanations were corrected: c now states the full-model effect, which is negative well below half the market when capacity is tight. Activity step 1, `w1-feedback` ¶5, misconception 5, the diagram caption, the `causalLoops.ts` header and the `adoptionRate` doc are aligned. A test pins the full-model derivative (< −1 per rider at the fixed-charger plateau; < −0.5 at 2,000 riders with a 12-min wait; positive with A held fixed; positive again with ample capacity). |
| W1-R04 | minor | Fixed (student-facing part only) | `week03.ts` (about line 135) now reads "the Week 1 Limits-to-Growth (charging limit) structure". The reference files (`model/reference/week02.ts`, `week08.ts`, `reference_model_notes.md`) and R-001's "90th-percentile" wording are with the lead. |
| W1-R05 | minor | Fixed | The label is now "demand (waits within tolerance)", with no "spare capacity". Worked example ¶2 says "buying aircraft now helps most" and notes that the 15-min boundary is a convention, below which waits already cost riders. Launch now says "almost nothing". The `Regime` doc in `aerolink.ts` was rewritten. A test asserts A = 0.5 at the tolerance, A < 0.65 at month 8 (a demand-regime month), and that one extra aircraft raises riders by month 9. |
| W1-R06 | minor | Fixed | Added `demand → orders (+)`, which sets the order size. `util → orders` is now labelled as the gate. The model was refactored, with no change in behaviour (all pinned numbers unchanged), into one exported function per link group: `tripDemand`, `potentialRiders`, `adoptionFrom`, `churnOf`, `nextRiders`, `capacityOf`, `utilisationOf`, `orderSize`, `chargersFor`. `SimPoint.ordered` was added. The polarity test now checks **every** link (21 of 21) against the function that implements it, including the conditions (supply line, limiting resource, chargers scale) and the delivery delay (`fleet[m] − fleet[m−1] = ordered[m − delay − 1]`). It also fails if a link is added without a check. The `demand → orders` link closes reinforcing loops through fleet, capacity, waits and churn. These are stated in the header and the caption but not listed as loops, because `content.test.ts` (outside this pass's files) pins the loop set R1, B1–B7. |
| W1-R07 | minor | Fixed | See "Mutation record" below. |
| W1-R08 | minor | Not in scope | Owned by the lead: lab plan rows, RB-1.4 clause descriptors, FD/OPEN_QUESTION. |
| F05 (residue) | major→minor | Closed | It was closed by W1-R06 above. |
| F06 (partial) | major | Closed | It was closed by W1-R02 above. The key no longer frames (a) as a trade-off on the measure students are told to report. |

## R01: archetype answers checked against R05 p.283 and the quiz

R05 p.283 defines the two archetypes used here. Limits to Growth: "A reinforcing process of accelerating growth (or expansion) will encounter a balancing process as the limit of that system is approached…". Balancing Process with Delay: "Delay in the response of a system to corrective action causes the correcting agent to either over-correct or to give up…". Growth and Underinvestment and the Attractiveness Principle are on p.284.

| Scenario | Match | Partly fits (shown with a reason) | Agrees with |
|---|---|---|---|
| Fleet grows, charging does not | Limits to Growth (charging limit; churn balances word of mouth) | Balancing Process with Delay (the delay plus the ignored supply line explain the 40 aircraft, which is 19 with either removed, but not the plateau, which persists after onOrder = 0 from m24); Growth and Underinvestment and the Attractiveness Principle (arguable interpretations, not structure) | q1-7 key (b) and option a explanation; `w1-feedback` ¶4 |
| Long procurement delay | Balancing Process with Delay | Limits to Growth (riders reach 91 % of the market, but the run isolates the over-build) | q1-8 |
| Chargers scale, 3-month delivery | Limits to Growth (market limit: R1 meets B4) | Balancing Process with Delay (14 surplus aircraft at m60) | q1-5 key (b) explanation |

## R02: the measure, and why

- **Decision.** Surplus aircraft-months alone is not a capital measure. It counts idle *aircraft* only, and the main capital in leverage (a) goes on chargers. A single 60-month total also depends on the horizon. Students therefore report riders and wait at month 60, plus **both** surplus aircraft-months and charger-months over the run. They repeat the reading at 120 months.
- **Pricing.** The model prices neither aircraft nor chargers. The task asks students to state the relative cost they assume, rather than inventing one.
- **Charger-months.** `chargerMonths(run)` is the sum of chargers in service each month, months 0 to N inclusive (so 6 × 61 = 366 at baseline).

| Run (from "Fleet grows, charging does not") | Riders m60 | Wait m60 | Fleet / chargers m60 | Surplus a/c-months (60) | Charger-months (60) | Surplus a/c-months (120) | Charger-months (120) | Riders m120 |
|---|---|---|---|---|---|---|---|---|
| Baseline | 2,596 | 20.3 | 40 / 6 | 1,135 | 366 | 2,671 | 726 | 2,596 |
| (a) chargers scale | 28,776 | 4.2 | 276 / 138 | 1,079 | 3,366 | 5,284 | 11,646 | 28,831 |
| (b) count supply line | 2,596 | 20.3 | 19 / 6 | 235 | 366 | 511 | 726 | 2,596 |
| (c) 12 initial chargers | 5,163 | 19.3 | 45 / 12 | 679 | 732 | 1,651 | 1,452 | 5,163 |
| (a) + (b) | 11,107 | 16.9 (fleet) | 63 / 32 | 49 | 892 | 49 | 4,984 | 26,714 |

The 120-month values for (b) and (c), and the baseline's 120-month charger-months and riders, were computed in this pass. Only the values the course text quotes are pinned.

The surplus snapshot at month 60 is 25.6 for the baseline and 70.5 for (a). The baseline idles about 25.6 aircraft from month 22. Apart from launch months 0–7, which every run shares, (a) has fewer than 1 surplus aircraft until month 45 and more than 25 from month 46. So the 60-month total (1,079 < 1,135) flatters (a), and at 120 months the order reverses (5,284 vs 2,671). The scenario text for the 3-month run quotes 449 surplus aircraft-months, 106 chargers, and "more than double" for the 6-month variant (1,079 / 449 = 2.4).

## Mutation record (W1-R07)

The first fix pass claimed mutation runs M1–M10, including "M10 undetectable by design". **Those runs were never written down.** Their diffs and results cannot be recovered, so they are not cited as evidence anywhere. This record replaces them. It covers the mechanisms the first pass's claims depended on, plus the changes made in this pass. The originally requested IDs map as follows:

- M1 (plateau mechanism: churn)
- M2 (charging limit)
- M5 (pipeline length)
- M8 (loop polarity)

**The equivalent mutant is M15, not M10.** It is named and justified below.

**Procedure.** `C:\Users\w451vxs\AppData\Local\Temp\claude\scratch\mutate.py`, a session scratch script that is not in the repository, ran these steps for each mutation:

1. Copy the target file to a backup.
2. Replace exactly one occurrence of the original text.
3. Run the command below.
4. Read the failing test names from the JSON report.
5. Restore the file from the backup.
6. Verify that the restored file's SHA-256 equals the pre-mutation hash and that `git diff --stat -- <file>` is unchanged.

The Week 1 files carry this pass's uncommitted edits, so "unchanged" means identical to the pre-mutation working copy, not an empty diff.

Command (from `learning-studio/`), identical for every mutation:

```
npx vitest run src/sim/aerolink.test.ts src/content/content.test.ts src/components/components.test.tsx --reporter=json --outputFile=<scratch>/<ID>.json
```

Baseline before mutating: 33 tests, all passing.

**M7 (gate removed) is killed only by the unit-level partial-effect test, and that is expected.** Whenever the order-size formula is positive (demand ÷ fleet capacity > target), utilisation (demand ÷ min(fleet, charging capacity)) is already above the target. The gate is therefore behaviourally redundant in every run. The diagram still shows it because it is the stated management rule.

**M15 is equivalent by design.** It changes the utilisation reported when capacity is 0. Capacity cannot be 0 in any reachable configuration: the explorer's sliders allow at least 2 chargers, and the fleet never falls below the initial 12. No behavioural test can distinguish it, so it is accepted as a surviving mutant.

### M1: churn removed (plateau mechanism)

- File: `src/sim/aerolink.ts`
- Mutation: replace `return p.churnRate * riders * (1 - attractiveness)` with `return 0 * p.churnRate * riders * (1 - attractiveness)`
- Failing tests (11 of 33):
  - dynamics explorer hides the archetype label until a choice is committed, and offers a data table equivalent
  - AeroLink teaching dynamics model in all three scenarios demand never exceeds capacity: there is never unmet demand, so churn — not rationing — limits riders
  - AeroLink teaching dynamics model Limits to Growth: with 6 fixed chargers, served trips level off at ≈ 90 % of the 8,640 ceiling, with waits above tolerance
  - AeroLink teaching dynamics model the plateau is where churn balances word of mouth (analytic prediction within 0.005 utilisation)
  - AeroLink teaching dynamics model aircraft beyond the 15th add no capacity: a fleet frozen at 15 gives the same tail throughput as the 40 bought
  - AeroLink teaching dynamics model scaling chargers with the fleet turns the charging limit into market-limited growth (and over-building is not free)
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
  - AeroLink teaching dynamics model the "demand" regime is a convention at riders’ tolerance: just inside it, waits still cost riders (review W1-R05)
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
  - causal-loop diagram matches the model equations q1-5 holds attractiveness constant: through waiting (B1) the full-model net rider effect is negative well below half the market
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M2: capacity ignores charging (no charging limit)

- File: `src/sim/aerolink.ts`
- Mutation: replace `return Math.min(fleetCapacityOf(p, fleet), chargingCapacityOf(p, chargers))` with `return fleetCapacityOf(p, fleet) + 0 * chargingCapacityOf(p, chargers)`
- Failing tests (11 of 33):
  - dynamics explorer hides the archetype label until a choice is committed, and offers a data table equivalent
  - AeroLink teaching dynamics model Limits to Growth: with 6 fixed chargers, served trips level off at ≈ 90 % of the 8,640 ceiling, with waits above tolerance
  - AeroLink teaching dynamics model the plateau is where churn balances word of mouth (analytic prediction within 0.005 utilisation)
  - AeroLink teaching dynamics model aircraft beyond the 15th add no capacity: a fleet frozen at 15 gives the same tail throughput as the 40 bought
  - AeroLink teaching dynamics model the binding constraint moves: demand binds first, then the fleet, then (from 15 aircraft) charging
  - AeroLink teaching dynamics model scaling chargers with the fleet turns the charging limit into market-limited growth (and over-building is not free)
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
  - AeroLink teaching dynamics model matches the Week 1 hand calculation: charging limits capacity from the 15th aircraft (ceiling 8,640 trips/month)
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
  - causal-loop diagram matches the model equations q1-5 holds attractiveness constant: through waiting (B1) the full-model net rider effect is negative well below half the market
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M3: binary regime indicator (bottleneck = limitingResource)

- File: `src/sim/aerolink.ts`
- Mutation: replace `const bottleneck: Regime = waitMin > p.waitToleranceMin ? limitingResource : 'demand'` with `const bottleneck: Regime = limitingResource`
- Failing tests (5 of 33):
  - dynamics explorer archetype feedback agrees with R05 and the quiz key: Limits to Growth matches the market-limited run (review W1-R01)
  - AeroLink teaching dynamics model the binding constraint moves: demand binds first, then the fleet, then (from 15 aircraft) charging
  - AeroLink teaching dynamics model scaling chargers with the fleet turns the charging limit into market-limited growth (and over-building is not free)
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model the "demand" regime is a convention at riders’ tolerance: just inside it, waits still cost riders (review W1-R05)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M4: supply-line switch disconnected

- File: `src/sim/aerolink.ts`
- Mutation: replace `const inPipeline = p.countSupplyLine ? onOrder : 0` with `const inPipeline = 0`
- Failing tests (5 of 33):
  - AeroLink teaching dynamics model Balancing Process with Delay: a 15-month delay over-builds; the fleet is still rising at month 60 and settles far above need
  - AeroLink teaching dynamics model supply-line ordering removes the over-build but, with a 15-month delay, slows growth: a trade-off, not a free fix
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M5: pipeline length delay instead of delay + 1

- File: `src/sim/aerolink.ts`
- Mutation: replace `Array(Math.max(0, Math.round(p.procurementDelayMonths)) + 1).fill(0)` with `Array(Math.max(1, Math.round(p.procurementDelayMonths))).fill(0)`
- Failing tests (5 of 33):
  - dynamics explorer hides the archetype label until a choice is committed, and offers a data table equivalent
  - AeroLink teaching dynamics model aircraft beyond the 15th add no capacity: a fleet frozen at 15 gives the same tail throughput as the 40 bought
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M6: chargers always scale (investInCharging ignored)

- File: `src/sim/aerolink.ts`
- Mutation: replace `return p.investInCharging ? Math.max` with `return true ? Math.max`
- Failing tests (10 of 33):
  - dynamics explorer hides the archetype label until a choice is committed, and offers a data table equivalent
  - AeroLink teaching dynamics model Limits to Growth: with 6 fixed chargers, served trips level off at ≈ 90 % of the 8,640 ceiling, with waits above tolerance
  - AeroLink teaching dynamics model the plateau is where churn balances word of mouth (analytic prediction within 0.005 utilisation)
  - AeroLink teaching dynamics model aircraft beyond the 15th add no capacity: a fleet frozen at 15 gives the same tail throughput as the 40 bought
  - AeroLink teaching dynamics model the binding constraint moves: demand binds first, then the fleet, then (from 15 aircraft) charging
  - AeroLink teaching dynamics model scaling chargers with the fleet turns the charging limit into market-limited growth (and over-building is not free)
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
  - causal-loop diagram matches the model equations q1-5 holds attractiveness constant: through waiting (B1) the full-model net rider effect is negative well below half the market
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M7: ordering gate removed (orders at any utilisation)

- File: `src/sim/aerolink.ts`
- Mutation: replace `if (!p.expandFleet || utilisation <= p.targetUtilisation) return 0` with `if (!p.expandFleet) return 0`
- Failing tests (1 of 33):
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M8: attract -> churn polarity flipped to +

- File: `src/content/causalLoops.ts`
- Mutation: replace `{ from: 'attract', to: 'churn', polarity: '−' }` with `{ from: 'attract', to: 'churn', polarity: '+' }`
- Failing tests (4 of 33):
  - causal-loop polarity classifies loops from link polarities (even negatives = reinforcing)
  - causal-loop polarity the full loop set shown in the diagram (R1, B1–B7) classifies as reinforcing only for R1
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
  - causal-loop diagram matches the model equations classifies every loop by counting negative links (and the market-saturation loop is balancing)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 13 insertions(+), 6 deletions(-)): **yes**

### M9: double flip on B2: attract -> churn AND churn -> riders both +, loop kinds unchanged

- File: `src/content/causalLoops.ts`
- Mutation: replace `{ from: 'attract', to: 'churn', polarity: '−' }, ⏎   { from: 'churn', to: 'riders', polarity: '−' },` with `{ from: 'attract', to: 'churn', polarity: '+' }, ⏎   { from: 'churn', to: 'riders', polarity: '+' },`
- Failing tests (1 of 33):
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 13 insertions(+), 6 deletions(-)): **yes**

### M10: demand -> orders link deleted

- File: `src/content/causalLoops.ts`
- Mutation: replace `{ from: 'demand', to: 'orderRate', polarity: '+', condition: 'sets the order size (aircraft demand needs at the target utilisation, minus the fleet) while orders are being placed' }, ⏎` with `(nothing: line deleted)`
- Failing tests (1 of 33):
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 13 insertions(+), 6 deletions(-)): **yes**

### M11: adoption ignores remaining potential (no B4)

- File: `src/sim/aerolink.ts`
- Mutation: replace `return p.wordOfMouth * riders * (potential / p.marketSize) * attractiveness` with `return p.wordOfMouth * riders * (0 * potential / p.marketSize + 1) * attractiveness`
- Failing tests (10 of 33):
  - dynamics explorer hides the archetype label until a choice is committed, and offers a data table equivalent
  - AeroLink teaching dynamics model Limits to Growth: with 6 fixed chargers, served trips level off at ≈ 90 % of the 8,640 ceiling, with waits above tolerance
  - AeroLink teaching dynamics model aircraft beyond the 15th add no capacity: a fleet frozen at 15 gives the same tail throughput as the 40 bought
  - AeroLink teaching dynamics model Balancing Process with Delay: a 15-month delay over-builds; the fleet is still rising at month 60 and settles far above need
  - AeroLink teaching dynamics model scaling chargers with the fleet turns the charging limit into market-limited growth (and over-building is not free)
  - AeroLink teaching dynamics model pins every number the Week 1 text quotes (lesson, scenario text, quiz, misconceptions, answer key)
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
  - AeroLink teaching dynamics model the "demand" regime is a convention at riders’ tolerance: just inside it, waits still cost riders (review W1-R05)
  - causal-loop diagram matches the model equations EVERY link polarity agrees with the sign of the model’s partial effect (and every link has a check)
  - causal-loop diagram matches the model equations the net riders → adoption effect is positive only below half the market (the stated operating range of R1 dominance)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M12: charger-months skip month 0

- File: `src/sim/aerolink.ts`
- Mutation: replace `return run.reduce((a, p) => a + p.chargers, 0)` with `return run.slice(1).reduce((a, p) => a + p.chargers, 0)`
- Failing tests (2 of 33):
  - dynamics explorer hides the archetype label until a choice is committed, and offers a data table equivalent
  - AeroLink teaching dynamics model pins the step 3 / memo key: riders, wait, surplus aircraft-months and charger-months at 60 and 120 months (review W1-R02)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**

### M13: market-limited run: Limits to Growth downgraded to partial

- File: `src/components/DynamicsExplorer.tsx`
- Mutation: replace `'Limits to Growth': { verdict: 'match', note: 'Word of mouth (R1)` with `'Limits to Growth': { verdict: 'partial', note: 'Word of mouth (R1)`
- Failing tests (1 of 33):
  - dynamics explorer archetype feedback agrees with R05 and the quiz key: Limits to Growth matches the market-limited run (review W1-R01)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 43 insertions(+), 15 deletions(-)): **yes**

### M14: demand regime label restores 'spare capacity'

- File: `src/components/DynamicsExplorer.tsx`
- Mutation: replace `demand: 'demand (waits within tolerance)',` with `demand: 'demand (waits within tolerance; spare capacity)',`
- Failing tests (1 of 33):
  - dynamics explorer archetype feedback agrees with R05 and the quiz key: Limits to Growth matches the market-limited run (review W1-R01)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 43 insertions(+), 15 deletions(-)): **yes**

### M15: EQUIVALENT (expected to survive): zero-capacity fallback utilisation 1 -> 0

- File: `src/sim/aerolink.ts`
- Mutation: replace `return capacity > 0 ? demand / capacity : 1` with `return capacity > 0 ? demand / capacity : 0`
- Failing tests (0 of 33):
  - none (survived)
- Reverted: file restored from backup; SHA-256 identical to the pre-mutation file and `git diff --stat` for the file unchanged (1 file changed, 88 insertions(+), 26 deletions(-)): **yes**
