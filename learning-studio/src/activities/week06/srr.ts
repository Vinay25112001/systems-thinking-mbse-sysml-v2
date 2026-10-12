// Week 6 — SRR-style review checklist logic (pure). The nine criteria are a course adaptation of the DoD SRR purpose,
// systems-engineer responsibilities and Table 3-2 criteria (R40 p.69–72) to the CP2 Requirements Baseline. The
// actionable-finding rule and the readiness recommendation are course conventions (lab plan L6: "review findings are
// actionable"); the three recommendations echo the gate options of Week 2 (R06b p.385).

export type SrrCriterion = { id: string; title: string; adapted: string; cp2Evidence: string; cite: string }

export const SRR_CRITERIA: SrrCriterion[] = [
  { id: 'S1', title: 'Requirements clear, measurable and testable', adapted: 'System requirements are clearly stated, measurable and testable (R40 p.69) and sufficiently detailed to enable functional definition (p.71).', cp2Evidence: '15–20 REQ, each one “shall”, a measurable criterion or a TBD with its U item.', cite: 'R40 p.69, p.71' },
  { id: 'S2', title: 'Verification method for every requirement', adapted: 'Verification methods are identified for all system requirements (p.70); draft verification methodologies defined for each requirement (p.72).', cp2Evidence: 'Method column complete and appropriate (inspection, analysis, demonstration, test).', cite: 'R40 p.70, p.72' },
  { id: 'S3', title: 'Bidirectional traceability', adapted: 'Requirements are traceable in both directions (p.70) and bidirectional traceability is documented (p.71).', cp2Evidence: 'Trace table: every REQ has a parent; every NEED/CAP has at least one child.', cite: 'R40 p.70–71' },
  { id: 'S4', title: 'Requirements achievable given technology maturation', adapted: 'Requirements are consistent with technology maturation plans (p.69) and can be met given those plans (p.71); key technology elements identified, readiness assessed and maturation plans developed (p.72).', cp2Evidence: 'TRL for 3 TECH with evidence or a labelled assumption; maturity risk for any critical TECH below TRL 6.', cite: 'R40 p.69, p.71–72' },
  { id: 'S5', title: 'Technical risks identified, analysed and treated', adapted: 'Risk items associated with the requirements are identified and analysed, and mitigation plans are in place (p.70–71).', cp2Evidence: 'AROU v2: ≥ 8 entries, ≥ 4 risks rated 5×5, each owned and treated.', cite: 'R40 p.70–71' },
  { id: 'S6', title: 'Interdependent systems and external interfaces', adapted: 'The maturity of interdependent systems is considered (p.69); external and SoS interfaces and interdependencies are documented (p.70–71).', cp2Evidence: 'Requirements or U items covering the utility, the ANSP and vertiport operators (e.g. REQ-STK-009, REQ-STK-010, U-002).', cite: 'R40 p.69–71' },
  { id: 'S7', title: 'Certifying agencies and certification requirements', adapted: 'Certifying agencies are identified and certification requirements are understood (p.72).', cp2Evidence: 'The regulator (STK-002) and the requirements or assumptions that depend on approval are named.', cite: 'R40 p.72' },
  { id: 'S8', title: 'Measures and trade space', adapted: 'The specification has stakeholder concurrence, with requirements conservative enough to allow design trade space (p.71).', cp2Evidence: '≥ 3 MOE, ≥ 5 MOP, ≥ 2 TPM with threshold and margin; the TPMs track the risky requirements.', cite: 'R40 p.71' },
  { id: 'S9', title: 'Hazards reviewed and mitigations allocated', adapted: 'System safety and health hazards have been reviewed and mitigating courses of action allocated within the overall system design (p.72).', cp2Evidence: 'Safety risks (e.g. thermal runaway, R-008) with the hazard stated, and the requirements that mitigate them linked (e.g. REQ-STK-008, REQ-SYS-009).', cite: 'R40 p.72' },
]

export type Rating = 'met' | 'partly' | 'not-met'
export const RATING_LABEL: Record<Rating, string> = { met: 'Met', partly: 'Partly met', 'not-met': 'Not met' }

export type Finding = { rating?: Rating; text: string }
export type Review = { reviewer: string; reviewed: string; findings: Record<string, Finding> }

const ID = /\b(REQ-(STK|SYS)-\d{3}|(NEED|CAP|SCN|MOE|MOP|TPM|TECH|A|R|O|U|CON|STK)-\d{3})\b/
const ACTION = /\b(add|revise|rewrite|replace|define|link|trace|provide|record|remove|split|state|quantify|rate|assign|justify|confirm|cite|derive|merge|change|lower|raise)\b/i
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
// Added after the Week 6 review (W6-F04): an ID plus an action verb is not enough. Preference and opinion are not
// findings (findings test the baseline against agreed criteria), and a requested change must say what to change.
const OPINION = /\b(we would|we[’']d|i would|in (our|my) (own )?opinion|(we|i) (feel|think|believe|prefer)|personally|(would|should) have done)\b/i
const VAGUE_CHANGE = /\b(something( else| different)?|anything|everything|the whole (approach|thing|package|baseline)|more work|do better|make it better|fix it|stuff)\b/i

export const FINDING_MESSAGES = {
  opinion: 'This reads as a preference or opinion (“we would …”, “in our opinion”). State the defect against the criterion and the evidence you checked.',
  vague: 'The requested change is not specific (“something”, “everything”, “the whole approach”). Say exactly what to add or change, and where.',
} as const

/** A finding is actionable when it names the artefact (by ID), states a defect, and asks for a specific change. */
export function checkFinding(f: Finding): string[] {
  const issues: string[] = []
  if (!f.rating) issues.push('Rate the criterion.')
  if (f.rating && f.rating !== 'met') {
    if (!ID.test(f.text)) issues.push('Name the artefact concerned by its ID (e.g. REQ-SYS-003, TECH-002, R-004).')
    if (!ACTION.test(f.text)) issues.push('Ask for a specific change (add, revise, link, quantify, …).')
    if (words(f.text) < 10) issues.push('Say what is wrong and why, in at least ten words.')
    if (OPINION.test(f.text)) issues.push(FINDING_MESSAGES.opinion)
    if (VAGUE_CHANGE.test(f.text)) issues.push(FINDING_MESSAGES.vague)
  }
  if (f.rating === 'met' && words(f.text) < 4) issues.push('Even a “met” rating needs the evidence you checked (an ID or a count).')
  return issues
}

export type Recommendation = { outcome: 'proceed' | 'proceed-with-actions' | 'not-ready' | 'incomplete'; text: string }

export function recommend(r: Review): Recommendation {
  const fs = SRR_CRITERIA.map((c) => r.findings[c.id] ?? { text: '' })
  if (fs.some((f) => checkFinding(f).length > 0)) return { outcome: 'incomplete', text: 'Review incomplete: every criterion needs a rating and an actionable finding.' }
  const notMet = SRR_CRITERIA.filter((c) => r.findings[c.id]?.rating === 'not-met').map((c) => c.id)
  const partly = SRR_CRITERIA.filter((c) => r.findings[c.id]?.rating === 'partly').map((c) => c.id)
  if (notMet.length) return { outcome: 'not-ready', text: `Not ready: continue this stage and close ${notMet.join(', ')} before the baseline is accepted.` }
  if (partly.length) return { outcome: 'proceed-with-actions', text: `Proceed with actions: the baseline is accepted on condition that ${partly.join(', ')} are closed by an agreed date.` }
  return { outcome: 'proceed', text: 'Proceed: the baseline meets every adapted SRR criterion.' }
}

/** Plain-text review record for the CP2 package (given and received). */
export function reviewRecord(r: Review): string {
  const lines = [`SRR-style review record — reviewer: ${r.reviewer || '?'}; baseline reviewed: ${r.reviewed || '?'}`]
  for (const c of SRR_CRITERIA) {
    const f = r.findings[c.id]
    lines.push(`${c.id} ${c.title}: ${f?.rating ? RATING_LABEL[f.rating] : 'not rated'} — ${f?.text.trim() || '(no finding)'}`)
  }
  lines.push(`Recommendation: ${recommend(r).text}`)
  return lines.join('\n')
}
