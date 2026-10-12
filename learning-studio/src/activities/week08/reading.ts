// Week 8 SysML micro-lab 3 (pure). Students classify marked elements of the validated listing
// sysml/week08/aerolink_charge_requirement.sysml and then state what its satisfy asserts. Every target names the exact
// line and token, and a test checks that the token occurs on that line, so the key cannot drift from the listing.
// Explanations paraphrase S10 sl.86-91 (R74) and S06 7.21.2 and 7.21.4, p.165-168 (R83).

export type RoleClass = 'requirement' | 'id' | 'subject' | 'parameter' | 'constraint' | 'satisfy' | 'satisfier' | 'design-value'

export const ROLES: { id: RoleClass; label: string; hint: string }[] = [
  { id: 'requirement', label: 'Requirement usage', hint: 'Declared with the keyword requirement: a kind of constraint usage whose doc text is the informal statement.' },
  { id: 'id', label: 'Short name (course ID)', hint: 'The name in angle brackets. For a requirement it is also its requirement ID (S06 p.165).' },
  { id: 'subject', label: 'Subject', hint: 'The first parameter of a requirement: the thing the requirement is about.' },
  { id: 'parameter', label: 'Requirement parameter', hint: 'An attribute of the requirement, here bound to the required value.' },
  { id: 'constraint', label: 'Required constraint', hint: 'The Boolean expression that must be true (require constraint).' },
  { id: 'satisfy', label: 'Satisfy relationship', hint: 'The keyword that asserts the requirement is satisfied by a feature.' },
  { id: 'satisfier', label: 'Satisfying feature', hint: 'The feature after by: it is bound to the requirement’s subject.' },
  { id: 'design-value', label: 'Design value', hint: 'A value given to a feature of the design, here a current estimate.' },
]

export type ReadingTarget = { id: string; line: number; token: string; answer: RoleClass; explanation: string }

export const LISTING_FILE = 'week08/aerolink_charge_requirement.sysml'

export const TARGETS: ReadingTarget[] = [
  { id: 't1', line: 16, token: '18', answer: 'design-value', explanation: 'The design’s current estimate of the charge time (TPM-001, FICTIONAL), bound with :>> on PHY-003. It is a claim about the design, not test evidence.' },
  { id: 't2', line: 20, token: 'requirement', answer: 'requirement', explanation: 'A requirement usage: a kind of constraint usage. Its doc comment is the informal “shall” statement (S06 p.165; S10 sl.86, 89).' },
  { id: 't3', line: 20, token: "'REQ-SYS-001'", answer: 'id', explanation: 'A short name. When a requirement has a short name, it is also considered its requirement ID (S06 p.165), which is how the course carries its IDs into the model.' },
  { id: 't4', line: 23, token: 'chargingSystem', answer: 'subject', explanation: 'The subject parameter, typed by ChargingSystems: a requirement is always about some subject, and features of the subject can be used in it (S10 sl.87; S06 p.166).' },
  { id: 't5', line: 24, token: 'maxChargeTime', answer: 'parameter', explanation: 'An attribute of the requirement bound to 20 [min]. Requirements often bind their parameters to specific values (S10 sl.89).' },
  { id: 't6', line: 25, token: 'require', answer: 'constraint', explanation: 'The required constraint: chargingSystem.chargeTimeToDispatch <= maxChargeTime. If all assumed constraints are true (there are none here), the required constraints must be true (S06 p.165).' },
  { id: 't7', line: 28, token: 'satisfy', answer: 'satisfy', explanation: 'A satisfy requirement usage is a kind of assert constraint usage: it asserts that the requirement is satisfied when its subject is bound to the satisfying feature (S06 p.168).' },
  { id: 't8', line: 28, token: "'PHY-003'", answer: 'satisfier', explanation: 'The satisfying feature, given after by. Its value is bound to the subject chargingSystem, so the constraint reads chargeTimeToDispatch of PHY-003 (S06 p.168; S10 sl.91).' },
  { id: 't9', line: 15, token: "'PHY-003'", answer: 'id', explanation: 'The short name of the part usage chargingSystems: the course ID of the physical element, used by the satisfy on line 28.' },
]

export type ReadingResult = { answered: number; correct: number; perTarget: Record<string, boolean | null> }

export function scoreReading(answers: Record<string, RoleClass | undefined>, targets: ReadingTarget[] = TARGETS): ReadingResult {
  const perTarget: Record<string, boolean | null> = {}
  let answered = 0
  let correct = 0
  for (const t of targets) {
    const a = answers[t.id]
    if (!a) {
      perTarget[t.id] = null
      continue
    }
    answered += 1
    perTarget[t.id] = a === t.answer
    if (a === t.answer) correct += 1
  }
  return { answered, correct, perTarget }
}

/** Index of `token` in `text` where identifier characters do not continue on either side, or -1. */
export function findToken(text: string, token: string): number {
  const isId = (c: string | undefined) => !!c && /[A-Za-z0-9_]/.test(c)
  let from = 0
  for (;;) {
    const i = text.indexOf(token, from)
    if (i < 0) return -1
    if (!isId(text[i - 1]) && !isId(text[i + token.length])) return i
    from = i + 1
  }
}

/** Splits one listing line into plain text and target tokens (first occurrence of each). */
export function segmentLine(text: string, lineTargets: ReadingTarget[]): { text: string; target?: ReadingTarget }[] {
  const found = lineTargets
    .map((t) => ({ t, at: findToken(text, t.token) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
  const out: { text: string; target?: ReadingTarget }[] = []
  let pos = 0
  for (const { t, at } of found) {
    if (at < pos) continue
    if (at > pos) out.push({ text: text.slice(pos, at) })
    out.push({ text: t.token, target: t })
    pos = at + t.token.length
  }
  if (pos < text.length) out.push({ text: text.slice(pos) })
  return out
}

// What does the satisfy assert? (B8.5) One correct option; each explanation is shown after checking.
export const ASSERTION_OPTIONS: { id: string; text: string; correct: boolean; why: string }[] = [
  { id: 'a', text: 'That PHY-003 has passed the REQ-SYS-001 charge-time test.', correct: false, why: 'Nothing in the listing records a test. Evidence comes from a verification case (VER-001, Week 12); satisfy records the design claim that verification must then confirm.' },
  { id: 'b', text: 'That REQ-SYS-001 holds — its required constraint is true — when its subject is bound to aeroLink.PHY-003; the model is claiming this, and the claim still needs evidence.', correct: true, why: 'A satisfy requirement usage is a kind of assert constraint usage that is satisfied when its subject is bound to the satisfying feature (S06 p.168). The checker does not evaluate the constraint, so the claim is only as good as the verification behind it.' },
  { id: 'c', text: 'That the team intends PHY-003 to meet REQ-SYS-001 eventually (a goal, not a claim).', correct: false, why: 'satisfy is an assertion, not a wish (S06 p.168). An intention would be a requirement allocated to the element, or a TPM with a target.' },
  { id: 'd', text: 'That REQ-SYS-001 is allocated to PHY-003.', correct: false, why: 'Allocation is a different relationship (allocate, see listing 2). In the reference, REQ-SYS-001 is allocated to the function FN-006, and PHY-003 satisfies it.' },
]
