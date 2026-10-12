// Week 9 activity 3 (B9.2, B9.3, pure): "predict the checker". Eight short listings were run through the
// course-designated checker (OMG SysML v2 Pilot Implementation release 2026-08) by `npm run content:sysml`; the
// result is recorded in sysml/validation-report.json. The student predicts the outcome class before revealing the
// RECORDED result. Nothing here simulates the checker: the outcome shown is the recorded one, and only once the
// SHA-256 of the text on screen has been computed and matches the record. While the hash is being computed, or if
// this browser cannot compute it, no result is shown. The key below is tested against the recorded report.
import type { ValidationEntry } from '../../lib/sysml'

export type Outcome = 'pass-clean' | 'pass-warning' | 'fail-syntax' | 'fail-resolution' | 'fail-rule'

export const OUTCOMES: { id: Outcome; label: string; hint: string }[] = [
  { id: 'pass-clean', label: 'PASS, no messages', hint: 'Parses, every name resolves, no validation rule fires.' },
  { id: 'pass-warning', label: 'PASS with a warning', hint: 'Accepted, but the tool reports a WARNING (warnings do not fail a file).' },
  { id: 'fail-syntax', label: 'FAIL: syntax (does not parse)', hint: 'The text is not in the grammar, e.g. “no viable alternative”, “mismatched input”.' },
  { id: 'fail-resolution', label: 'FAIL: a name does not resolve', hint: '“Couldn’t resolve reference to …”: the text parses but a referenced element is not found where it is looked up.' },
  { id: 'fail-rule', label: 'FAIL: a validation rule', hint: 'Parses and resolves, but breaks a rule of the language implemented by the tool, e.g. on typing.' },
]

export type PredictItem = { id: string; file: string; title: string; answer: Outcome; explanation: string }

export const PREDICT_ITEMS: PredictItem[] = [
  {
    id: 'pc1', file: 'week09/invalid_pc1_unquoted_reference.sysml', title: 'Referring to a part by its ID', answer: 'fail-syntax',
    explanation: 'The declaration <\'PHY-003\'> is right, but the reference aeroLink.PHY-003 is not: “PHY-003” is not a basic name, so it must be written in quotes wherever it is used, aeroLink.\'PHY-003\' (S06 p.49–50). The parser stops at the “-”; the second message (PHY not resolved) follows from the first. Fix the first error first.',
  },
  {
    id: 'pc2', file: 'week09/predict_pc2_duplicate_short_name.sysml', title: 'Two parts with the same ID', answer: 'pass-warning',
    explanation: 'Both PHY-004 declarations are accepted, with a WARNING on each: “Duplicate of other owned member name”. The file PASSES, yet C.2 rule 1 (IDs are never reused) is broken and any reference to \'PHY-004\' is now ambiguous. RB-8.1 level 4 asks for zero warnings or warnings explained: this one cannot be explained away, it must be fixed.',
  },
  {
    id: 'pc3', file: 'week09/invalid_pc3_import_without_visibility.sysml', title: 'Imports without public or private', answer: 'fail-syntax',
    explanation: 'In the release 2026-08 notation the visibility of an import must be shown explicitly (S10 sl.6; S06 p.61), and the pilot grammar rejects “import ISQ::*;” at the keyword. Every later message (SpeedValue, km and h not resolved; attribute not typed) is a consequence: without the imports nothing from ISQ or SI is visible. Use private import unless re-export is required (S10 sl.6).',
  },
  {
    id: 'pc4', file: 'week09/predict_pc4_conflicting_multiplicity.sysml', title: 'ALT-004 as a variant of the baseline', answer: 'pass-warning',
    explanation: 'alt004Network subsets baselineNetwork, inherits hubs[3] and redefines it as hubs[4]. The tool warns “Subsetting/redefining feature should not have larger multiplicity upper bound” and PASSES the file. Two different defects hide behind that one warning. The redefinition widens the upper bound, which KerML’s rule forbids (a redefining multiplicity may only allow cardinalities consistent with the redefined one, KerML p.62): that is what the warning reports, and it reports the same for 2..4 redefined as 2..6, which networks with two to four hubs still satisfy. Here, in addition, the ranges do not overlap: redefinition requires the same values, so no network can have exactly 3 and exactly 4 hubs, and the model is unsatisfiable. Model the two configurations as siblings, as aerolink_def_usage.sysml does.',
  },
  {
    id: 'pc5', file: 'week09/invalid_pc5_block_keyword.sysml', title: 'SysML v1 vocabulary', answer: 'fail-syntax',
    explanation: '“block” is SysML v1 vocabulary; in SysML v2 a structural element is a part (part def / part, S06 p.48; S10 sl.9). The pilot grammar does not know “block” as a kind keyword, so the parse fails at the name that follows it.',
  },
  {
    id: 'pc6', file: 'week09/predict_pc6_attribute_def_with_part.sysml', title: 'A part inside an attribute definition', answer: 'pass-clean',
    explanation: 'The recorded run reports no message at all, yet S10 sl.9 says an attribute definition may not have composite features and S06 p.77 says the nested features of an attribute definition must be referential; a part usage is composite by default (S10 sl.9). The course does not know whether the tool treats this part as implicitly referential or simply does not check the rule. Either way, PASS does not make it good modelling: a status value should not own a charger.',
  },
  {
    id: 'pc7', file: 'week09/invalid_pc7_part_typed_by_attribute_def.sysml', title: 'A part typed by an attribute definition', answer: 'fail-rule',
    explanation: 'The text parses and ReadinessAssessment resolves, but the tool’s typing rule fires: “An occurrence, item or part must be typed by occurrence definitions.” A readiness assessment is data, so it is an attribute usage (attribute readiness : ReadinessAssessment), not a part.',
  },
  {
    id: 'pc8', file: 'week09/invalid_pc8_usage_subsets_a_definition.sysml', title: '“:>” after a usage', answer: 'fail-resolution',
    explanation: 'After a usage, “:>” means subsets, and a usage can only subset another feature (S06 p.72; KerML p.61). Vertiport is a definition, so the tool reports “Couldn’t resolve reference to Feature ‘Vertiport’”. To say that hubs are vertiports, type the usage (hubs : HubVertiport) and specialize the definition (HubVertiport :> Vertiport).',
  },
]

const SYNTAX = /no viable alternative|mismatched input|extraneous input|missing .* at|token recognition error/i
const RESOLUTION = /Couldn't resolve reference|Couldn’t resolve reference/i

type Diag = { severity?: string; message?: string }

/** Classifies a RECORDED validation entry. A FAIL is classified by its first ERROR, which is where the reader starts. */
export function outcomeOf(entry: Pick<ValidationEntry, 'status' | 'diagnostics'>): Outcome {
  const diags = (entry.diagnostics ?? []) as Diag[]
  if (entry.status === 'PASS') return diags.some((d) => d.severity === 'WARNING') ? 'pass-warning' : 'pass-clean'
  const first = diags.find((d) => d.severity === 'ERROR')
  const msg = first?.message ?? ''
  if (SYNTAX.test(msg)) return 'fail-syntax'
  if (RESOLUTION.test(msg)) return 'fail-resolution'
  return 'fail-rule'
}

/** The SHA-256 of the text on screen: still being computed, computed, or impossible to compute in this browser. */
export type HashState = { state: 'pending' } | { state: 'done'; sha256: string } | { state: 'unavailable' }

export type Recorded =
  | { state: 'recorded'; status: 'PASS' | 'FAIL'; outcome: Outcome; diagnostics: Diag[] }
  | { state: 'missing' }
  | { state: 'stale' }
  | { state: 'pending' }
  | { state: 'unverifiable' }

/**
 * What may be shown for an item: the recorded result only once the hash of the displayed text is known and matches.
 * Fails closed: a hash still being computed shows nothing yet, and a hash that cannot be computed (e.g. no
 * crypto.subtle outside a secure context) shows "cannot verify", never the record.
 */
export function recordedResult(entry: ValidationEntry | undefined, hash: HashState): Recorded {
  if (!entry) return { state: 'missing' }
  if (hash.state === 'pending') return { state: 'pending' }
  if (hash.state === 'unavailable') return { state: 'unverifiable' }
  if (entry.sha256 !== hash.sha256) return { state: 'stale' }
  return { state: 'recorded', status: entry.status, outcome: outcomeOf(entry), diagnostics: (entry.diagnostics ?? []) as Diag[] }
}

export type PredictScore = { predicted: number; scored: number; correct: number; passFailCorrect: number }

/**
 * Scores predictions; a prediction that gets PASS/FAIL right but the class wrong earns partial credit. Only items that
 * are REVEALED and whose result is RECORDED for exactly the text on screen (SHA-256 matched) are scored, and they are
 * scored against the recorded outcome, never against the hard-coded key. Scoring an unrevealed item would leak the
 * key: a student could try each option in turn and watch the count change (review S9-N1, the W10-F01 class). An item
 * whose record is missing, stale, pending or unverifiable is not scored, because the activity shows nothing for it.
 */
export function scorePredictions(
  predictions: Record<string, Outcome | undefined>,
  revealed: Record<string, boolean | undefined>,
  recorded: Record<string, Recorded | undefined>,
  items: PredictItem[] = PREDICT_ITEMS,
): PredictScore {
  let predicted = 0
  let scored = 0
  let correct = 0
  let passFailCorrect = 0
  for (const it of items) {
    const p = predictions[it.id]
    if (!p) continue
    predicted += 1
    const rec = recorded[it.id]
    if (!revealed[it.id] || rec?.state !== 'recorded') continue
    scored += 1
    if (p === rec.outcome) correct += 1
    if (p.startsWith('pass') === rec.outcome.startsWith('pass')) passFailCorrect += 1
  }
  return { predicted, scored, correct, passFailCorrect }
}
