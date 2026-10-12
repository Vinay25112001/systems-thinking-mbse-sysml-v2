// Week 5 peer-audit logic (pure). Students flag which attributes of a good requirement each peer requirement
// violates. The attribute list is the DoD SE Guidebook list (§4.2.2, R48 p.144); the extra signals come from MITRE
// (ambiguous "may"/"will", R56 p.389) and the orphan definition (R45 p.118). The key is instructor-authored.
// Requirement texts are a FICTIONAL peer-team extract ("Team Kestrel", see trace.ts PEER_SAMPLE). Kestrel's
// requirements carry their own 9xx IDs so that they never collide with instructor-reference IDs (§7 rule 8); where a
// revision points at the reference, it says so.

export const ATTRIBUTES = [
  'Necessary', 'Unique', 'Unambiguous', 'Clear and concise', 'Complete', 'Consistent', 'Technically feasible',
  'Traceable', 'Measurable/quantifiable', 'Verifiable', 'Able to be validated', 'Operationally effective and survivable', 'Singular',
] as const
export type Attribute = (typeof ATTRIBUTES)[number]

export type AuditItem = {
  id: string
  reqId: string
  text: string
  /** Context the auditor is given (parent links, TBD status). */
  context: string
  /** Attributes the key says are violated (empty = a sound requirement). */
  key: Attribute[]
  finding: string
  revision: string
}

export const AUDIT_ITEMS: AuditItem[] = [
  {
    id: 'a1', reqId: 'REQ-SYS-903', text: 'The booking app shall be user-friendly and should load quickly.',
    context: 'No parent link in the team’s trace table.',
    key: ['Unambiguous', 'Measurable/quantifiable', 'Verifiable', 'Singular', 'Traceable'],
    finding: '“User-friendly” and “quickly” have no measurable criterion, so no test can pass or fail it; “shall … and should …” packs two statements of different force into one; with no parent it is an orphan (R45 p.118).',
    revision: 'Replace with: “The booking app shall display the confirmed pick-up time within 5 s of the passenger confirming a ride, for 95 % of confirmations in a calendar month.” (5 s and 95 % FICTIONAL) — derived from REQ-STK-901 and CAP-002; usability goes to a separate, measurable requirement or is dropped.',
  },
  {
    id: 'a2', reqId: 'REQ-SYS-905', text: 'The aircraft shall have a carbon-fibre airframe.',
    context: 'No parent link in the team’s trace table.',
    key: ['Necessary', 'Traceable'],
    finding: 'It prescribes a solution and no need, capability or higher requirement motivates it: an orphan that is not shown to be necessary. It is verifiable by inspection, so “unverifiable” would be the wrong finding.',
    revision: 'Delete, or ask what need lies behind it. If it is mass (and so landing energy), write the mass or energy performance requirement, derive it from CAP-004 — which has no requirement in Kestrel’s set — and record carbon fibre as a design decision.',
  },
  {
    id: 'a3', reqId: 'REQ-STK-903', text: 'The AeroLink service will turn aircraft around quickly at hubs, and the charging system shall charge aircraft in 20 min.',
    context: 'Parents NEED-004 and CAP-003. REQ-SYS-901 derives from it.',
    key: ['Unambiguous', 'Measurable/quantifiable', 'Singular', 'Consistent'],
    finding: '“Will” is ambiguous force (R56 p.389) and “quickly” is not measurable; two subjects and two statements in one; it is also inconsistent with its own child REQ-SYS-901, which states the 20 min charge from the 20 % reserve while this one gives no start state.',
    revision: 'Split: “The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad.” and leave the charge time to REQ-SYS-901. (This is the instructor reference’s REQ-STK-005.)',
  },
  {
    id: 'a4', reqId: 'REQ-SYS-908', text: 'The charging system shall limit the combined power of all chargers at a vertiport to the configured connection limit (TBD-02 kW).',
    context: 'Parent REQ-STK-908 (Kestrel’s grid-connection requirement; not in the trace extract). TBD-02 is the case’s grid-connection value, tracked in the case AROU as unknown U-002 with an owner and a need-by date.',
    key: [],
    finding: 'Sound. A TBD tied to an AROU entry with an owner is an accepted way to defer a value; flagging it as “incomplete” would be a false finding.',
    revision: 'No change; keep U-002 on the review action list until the utility agreement fixes the value.',
  },
  {
    id: 'a5', reqId: 'REQ-SYS-906', text: 'The fleet shall achieve high availability.',
    context: 'Parent REQ-STK-904 (Kestrel’s network-capacity requirement; not in the trace extract).',
    key: ['Unambiguous', 'Measurable/quantifiable', 'Verifiable'],
    finding: '“High” has no value or measurement period, so it cannot be verified or measured by a MOP.',
    revision: '“The fleet shall achieve an availability of at least 90 % of scheduled aircraft-hours in each calendar month.” (the text of the instructor reference’s REQ-SYS-006; FICTIONAL value)',
  },
  {
    id: 'a6', reqId: 'REQ-SYS-907', text: 'The eVTOL aircraft shall complete a 25 km trip within 16 min block time and shall land with at least 20 % of usable energy remaining.',
    context: 'Parent REQ-STK-904 (Kestrel’s network-capacity requirement; not in the trace extract).',
    key: ['Singular'],
    finding: 'Two “shall” statements in one requirement. Both halves are measurable and verifiable; they need separate IDs, parents and verification methods (the reserve belongs under CAP-004, not capacity).',
    revision: 'Keep the block-time half as REQ-SYS-907; move the reserve to a new requirement of its own derived from CAP-004 (in the instructor reference this is REQ-SYS-003, planned landing energy reserve).',
  },
]

export type AuditScore = { hits: Attribute[]; missed: Attribute[]; extra: Attribute[]; exact: boolean }

export function scoreAuditItem(selected: Attribute[], key: Attribute[]): AuditScore {
  const s = new Set(selected)
  const k = new Set(key)
  const hits = ATTRIBUTES.filter((a) => s.has(a) && k.has(a))
  const missed = ATTRIBUTES.filter((a) => k.has(a) && !s.has(a))
  const extra = ATTRIBUTES.filter((a) => s.has(a) && !k.has(a))
  return { hits, missed, extra, exact: missed.length === 0 && extra.length === 0 }
}

/**
 * Simple lint signals an auditor can check mechanically (course heuristics, not a source list). They are ADVISORY and
 * can be false signals; the UI says so. A requirement whose criterion is the presence of a named material or feature
 * ("shall have a carbon-fibre airframe", "shall be fitted with …") is verifiable by inspection, so the "no number"
 * signal is replaced by a pointer to necessity and traceability instead of nudging the auditor towards a false
 * "not verifiable" finding. The inspection path is never taken when a vague term is present.
 */
export function lintSignals(text: string): string[] {
  const out: string[] = []
  const shalls = (text.match(/\bshall\b/gi) ?? []).length
  if (shalls === 0) out.push('No “shall”: the statement has no binding force.')
  if (shalls > 1) out.push(`${shalls} “shall” statements: probably not singular.`)
  if (/\b(will|may|should)\b/i.test(text)) out.push('Contains “will”, “may” or “should”: ambiguous force (R56 p.389).')
  const vague = text.match(/\b(user-friendly|quickly|high|adequate|fast|easy|sufficient|appropriate|intuitive|robust|reliable|efficient|flexible|seamless|comfortable|quiet|safe|convenient|suitable|modern|acceptable)\b/gi)
  if (vague) out.push(`Vague term(s) without a criterion: ${[...new Set(vague.map((v) => v.toLowerCase()))].join(', ')}.`)
  if (!/\d/.test(text) && !/TBD/.test(text)) {
    const presence = !vague && /\bshall (have|be (made of|fitted with|equipped with|marked with))\b/i.test(text)
    out.push(
      presence
        ? 'No number, but the criterion is the presence of a named material or feature, which inspection can verify: check whether it is necessary and traceable rather than calling it unverifiable.'
        : 'No number or TBD: check that a measurable criterion exists.',
    )
  }
  return out
}
