// Week 10 activity 3 (B10.2, B10.3, pure): predict the checker on ports, interfaces, satisfy and allocate. Nine
// short listings in sysml/week10/ were run through the course-designated checker (OMG SysML v2 Pilot Implementation
// release 2026-08) by `npm run content:sysml`; the results are recorded in sysml/validation-report.json. The student
// predicts the outcome class before revealing the RECORDED result. Nothing here simulates the checker: a result is
// shown only once the SHA-256 of the text on screen has been computed and matches the record; while the hash is being
// computed, or if this browser cannot compute it, nothing is shown (fail closed). The outcome classes and this
// fail-closed design follow Week 9's activity (kept as a separate copy so that the two weeks can be revised
// independently). The key is tested against the recorded report.
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

export const PREDICT_ITEMS_10: PredictItem[] = [
  {
    id: 'pc1', file: 'week10/predict_pc1_interface_two_outputs.sysml', title: 'An interface between two ports of the same type', answer: 'pass-clean',
    explanation: 'Both ends of ChargerLink are ChargingPort, so both ports offer energy as an output and neither accepts it: the ports are not compatible, because compatible ports have directed features that match with inverse directions (S10 sl.20), which is what the conjugate ~ChargingPort provides (sl.21). The recorded run reports nothing. The release 2026-08 checker does not check port compatibility: you must.',
  },
  {
    id: 'pc2', file: 'week10/predict_pc2_interface_wrong_port.sysml', title: 'IF-005 connected to the aircraft’s pad port', answer: 'pass-clean',
    explanation: 'The interface’s aircraftSide end is typed ~ChargingPort, but it is connected to padPort, an AircraftPadPort. An interface usage connects two compatible ports (S10 sl.22), and these are not even of the right definition. The recorded run reports nothing: the checker did not compare the connected ports with the interface definition’s end types. Review every connect line against its interface def.',
  },
  {
    id: 'pc3', file: 'week10/invalid_pc3_interface_connects_parts.sysml', title: 'An interface that connects two parts', answer: 'fail-rule',
    explanation: 'An interface definition is a connection definition whose ends are ports (S10 sl.22). Connecting the parts PHY-003 and PHY-001 makes each end a part where a port is required, and the checker’s typing rule fires on both: “A port must be typed by port definitions.” Connect the ports: \'PHY-003\'.chargerOutlet to \'PHY-001\'.chargeInlet.',
  },
  {
    id: 'pc4', file: 'week10/predict_pc4_satisfy_by_port.sysml', title: 'Satisfy by the charger’s outlet port', answer: 'pass-warning',
    explanation: 'satisfy binds the requirement’s subject (a ChargingSystems) to the satisfying feature (S06 p.168). A port is not a charging system, so the checker warns “Bound features should have conforming types” and still PASSES the file. RB-8.1 asks for warnings explained, and this one cannot be: satisfy by PHY-003, the element whose definition is the subject’s.',
  },
  {
    id: 'pc5', file: 'week10/invalid_pc5_satisfy_relaxes_limit.sysml', title: 'A satisfy that relaxes the limit', answer: 'fail-rule',
    explanation: 'The requirement binds maxChargeTime = 20 [min]; the satisfy body tries to bind it again to 25 [min], so that a 24 min charger “satisfies” it. A feature value is a binding, not an initial or default value (S10 sl.25), and the checker refuses: “Cannot override a binding feature value.” This is one of the few satisfy misuses the tool catches. It does not evaluate constraints: without the relaxing line, a satisfy by a charger whose bound value exceeds the limit passes with no message (course probe with 22 min, as Week 8 recorded).',
  },
  {
    id: 'pc6', file: 'week10/invalid_pc6_satisfy_reversed.sysml', title: 'satisfy written the wrong way round', answer: 'fail-rule',
    explanation: 'After satisfy comes the requirement, after by the satisfying feature (S06 p.168; S10 sl.91). Here PHY-003 is in the requirement position, and the checker reports three rule errors: “Must reference a requirement.”, “Must reference a constraint.” and “A requirement must be typed by one requirement definition.” (their order varies between runs). Read every satisfy aloud: “REQ is satisfied by design element”.',
  },
  {
    id: 'pc7', file: 'week10/predict_pc7_allocation_ends_reversed.sysml', title: 'An allocation against its definition’s ends', answer: 'pass-clean',
    explanation: 'LogicalToPhysical has a logical end and a physical end, and S10 sl.107 says an allocation usage must allocate features that conform to the types of the ends of its allocation definition. This allocation puts the physical PHY-003 in the logical position and LOG-002 in the physical one. The recorded run reports nothing: the release 2026-08 checker does not enforce that rule here. The course’s FN/LOG → PHY direction is yours to check.',
  },
  {
    id: 'pc8', file: 'week10/invalid_pc8_allocate_by.sysml', title: 'allocate … by …', answer: 'fail-syntax',
    explanation: 'allocate takes “to”, not “by” (S10 sl.106): the parser stops with “mismatched input ‘by’ expecting ‘to’”, and the later messages follow from it. by belongs to satisfy. Fix the first error first.',
  },
  {
    id: 'pc9', file: 'week10/invalid_pc9_satisfy_requirement_def.sysml', title: 'Satisfy the requirement definition', answer: 'fail-resolution',
    explanation: 'satisfy is a requirement usage whose subject is bound to the satisfier, and the short form identifies the satisfied requirement by a qualified name or feature chain (S06 p.168): a feature, not a definition. ChargeTimeRequirement is a definition, so the name does not resolve as a Feature and the checker adds “Must reference a requirement.” Satisfy the usage REQ-SYS-001, the requirement with the bound 20 min.',
  },
]

const SYNTAX = /no viable alternative|mismatched input|extraneous input|missing .* at|token recognition error/i
const RESOLUTION = /Couldn't resolve reference|Couldn’t resolve reference/i

export type Diag = { severity?: string; line?: number; column?: number; message?: string }

/** Classifies a RECORDED validation entry. A FAIL is classified by its first ERROR, which is where the reader starts. */
export function outcomeOf(entry: Pick<ValidationEntry, 'status' | 'diagnostics'>): Outcome {
  const diags = (entry.diagnostics ?? []) as Diag[]
  if (entry.status === 'PASS') return diags.some((d) => d.severity === 'WARNING') ? 'pass-warning' : 'pass-clean'
  const msg = diags.find((d) => d.severity === 'ERROR')?.message ?? ''
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

/** What may be shown for an item: the recorded result only once the hash of the displayed text is known and matches. */
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
 * key: a student could try each option in turn and watch the count change (review W10-F01). An item whose record is
 * missing, stale, pending or unverifiable is not scored, because the activity shows nothing for it either.
 */
export function scorePredictions10(
  predictions: Record<string, Outcome | undefined>,
  revealed: Record<string, boolean | undefined>,
  recorded: Record<string, Recorded | undefined>,
  items: PredictItem[] = PREDICT_ITEMS_10,
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
