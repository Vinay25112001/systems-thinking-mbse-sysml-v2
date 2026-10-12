// Week 12 activity 4 (B12.5; pure): RID disposition log.
// Every RID received on CP4 needs a disposition before CP5 (lab plan B.6 entry criterion 2). The disposition FORM -
// accept / accept with modification / reject / defer, a reason, the change made (fix reference) and the closure
// evidence - is a COURSE CONVENTION, informed by RB-17 read from the owner's side (RB-11.6 'peer findings
// dispositioned' scores the dispositions at CP5): a rejection must show that the RID
// names no real defect or misreads the criterion (17.1), and an acceptance must point at the concrete change (17.3).
// The screens are heuristics on form; they cannot judge whether a decision is right.
import type { ElementProvenance } from '../../model/engineering'

export type Decision = 'accept' | 'accept-modified' | 'reject' | 'defer'
export type ReceivedSeverity = 'major' | 'minor' | 'editorial'

export const DECISIONS: { id: Decision; label: string; meaning: string }[] = [
  { id: 'accept', label: 'Accept', meaning: 'The RID is valid; the proposed fix (or an equivalent) is made.' },
  { id: 'accept-modified', label: 'Accept with modification', meaning: 'The defect is real, but the fix differs from the one proposed; say why.' },
  { id: 'reject', label: 'Reject', meaning: 'The RID does not name a real defect, or misreads the criterion; cite what shows it.' },
  { id: 'defer', label: 'Defer', meaning: 'Valid, but fixed later: name the checkpoint, the owner and where the open item is tracked.' },
]

export type Disposition = {
  rid: string
  severity: ReceivedSeverity | ''
  summary: string
  decision: Decision | ''
  reason: string
  change: string
  evidence: string
  owner?: string
  provenance?: ElementProvenance
}

export const blankDisposition = (): Disposition => ({ rid: '', severity: '', summary: '', decision: '', reason: '', change: '', evidence: '' })

export type DispCheck = { field: keyof Disposition | 'set'; ok: boolean; message: string }

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const ELEMENT = /\b(?:ENT|EXT|STK|CON|NEED|MGO|CAP|SCN|REQ-STK|REQ-SYS|MOE|MOP|TPM|TECH|ALT|CRIT|DEC|FN|LOG|PHY|IF|INFO|AI|VER|[AROU])-\d{3}\b|[A-Za-z_'][\w' -]*::[\w']|\bline\s+\d+\b/i
// Verbs of a change to the model, in the past tense or as an imperative. "Recorded" and "wrote" are not here: writing
// the RID down is not a change to the model.
const CHANGE_VERB = /\b(?:add(?:ed)?|remov(?:e|ed)|delet(?:e|ed)|replac(?:e|ed)|renam(?:e|ed)|retyp(?:e|ed)|mov(?:e|ed)|split|merg(?:e|ed)|bound|bind|redefin(?:e|ed)|insert(?:ed)?|chang(?:e|ed)|connect(?:ed)?|declar(?:e|ed)|swap(?:ped)?|retarget(?:ed)?|link(?:ed)?|reallocat(?:e|ed)|allocat(?:e|ed)|correct(?:ed)?|fix(?:ed)?)\b/i
// A promise or a condition, not a fact: an accepted RID is closed by what has been done (lesson worked example e).
const FUTURE = /\b(?:will|shall|going to|to be (?:done|added|fixed|changed|run)|pending|planned|plan to|later|next week|afterwards|once|when (?:we|time)|if (?:time|possible|needed)|tbd|to do|todo)\b/i
const NOT_A_CHANGE = /\b(?:recorded|noted|logged|acknowledged|filed)\b[^.]*\b(?:RID|finding|comment|log)\b/i
// Closure evidence is a result that someone else can look up: a checker result, a count, an ID, a line, a commit, a verdict.
const EVIDENCE = /\b\d+\s+(?:errors?|warnings?)\b|\b(?:zero|no) errors\b|\b\d+\s+of\s+\d+\b|\b\d+(?:\.\d+)?\s*%|\bLNK-\d+\b|\bline\s+\d+\b|\bcommit\s+[0-9a-f]{6,}\b|\bverdict\b[^.]{0,20}\b(?:pass|fail|inconclusive|error)\b|\b(?:PASS|FAIL)\b/
const CRITERION = /\bRB-\d{1,2}\.\d\b|\bS(?:02|05|06|10|11|12|13)\s+(?:p|sl)\.\s?\d+|\bR\d{2}[a-c]?\s+(?:p|sl)\.\s?\d+|\bC\.[2-5]\b|\bB\.[56]\b|\bL1[0-3] (?:minimum|task \d)\b|\bDECISION_LOG\b/i
const CONFIRMED = /\b(?:confirmed|agreed)\b[^.]{0,60}\b(?:instructor|reviewer)\b|\b(?:instructor|reviewer)\b[^.]{0,60}\b(?:confirmed|agreed)\b/i
const TARGET = /\bCP5\b|\bWeek 1[234]\b/i
const CONDITIONAL = /\bif\b|\bunless\b|\botherwise\b|\bwhen (?:we|time)\b|\bafter (?:CP5|the course|the term)\b/i
const TRACKED = /\b[AROU]-\d{3}\b|@Issue|@StatusInfo|\bgap table\b|\bopen items?\b/i
const RID_FORM = /^RID-[A-Z0-9]{1,6}-\d{2}$/

export function checkDisposition(d: Disposition): DispCheck[] {
  const c: DispCheck[] = []
  const add = (field: DispCheck['field'], ok: boolean, message: string) => c.push({ field, ok, message })
  add('rid', RID_FORM.test(d.rid.trim()), RID_FORM.test(d.rid.trim()) ? 'RID ID as received.' : 'Copy the RID ID exactly as received (course form RID-<reviewing team>-<nn>).')
  add('severity', d.severity !== '', d.severity ? 'Severity as received.' : 'Record the severity the reviewer gave (major, minor, editorial).')
  add('summary', words(d.summary) >= 5, words(d.summary) >= 5 ? 'Summary recorded.' : 'Summarise the RID in a sentence so the log can be read without the RID set.')
  if (!d.decision) { add('decision', false, 'Choose a disposition: accept, accept with modification, reject or defer.'); return c }
  add('decision', true, `Disposition: ${d.decision}.`)
  switch (d.decision) {
    case 'accept':
    case 'accept-modified': {
      const changeOk = ELEMENT.test(d.change) && CHANGE_VERB.test(d.change) && !FUTURE.test(d.change) && !NOT_A_CHANGE.test(d.change)
      const changeMsg = FUTURE.test(d.change)
        ? 'The change is a promise (“will”, “pending”, “later” …). An accepted RID is closed by a change already made; if the fix is still to come, defer the RID with a checkpoint, an owner and a tracking item.'
        : NOT_A_CHANGE.test(d.change)
          ? 'Recording the RID is not a change to the model: name the element you changed and what you did to it.'
          : 'Name the element changed (ID, qualified name or line) and what you did (added, removed, retargeted …), so the reviewer can find the fix (RB-17.3 read from the owner’s side).'
      add('change', changeOk, changeOk ? 'The change names the element and what was done.' : changeMsg)
      const evidenceOk = EVIDENCE.test(d.evidence) && !FUTURE.test(d.evidence)
      add('evidence', evidenceOk, evidenceOk ? 'Closure evidence given.' : FUTURE.test(d.evidence)
        ? 'The evidence is a promise (“will run”, “pending” …). Run the check first, then record its result.'
        : 'Give the result that shows the fix is in: the checker run after the change with its error and warning counts, the new audit number (n of N), the link ID, the line, the commit or the verdict. “See the log” cannot be checked.')
      if (d.decision === 'accept-modified') add('reason', words(d.reason) >= 6, words(d.reason) >= 6 ? 'Reason for the different fix given.' : 'Say why your fix differs from the one proposed.')
      break
    }
    case 'reject': {
      const ok = words(d.reason) >= 8 && CRITERION.test(d.reason)
      add('reason', ok, ok ? 'The rejection cites what shows the RID is not a defect.' : 'A rejection must show that the RID names no real defect or misreads its criterion: cite the rubric criterion (RB-x.y), the source page, or the lab rule that supports you (RB-17.1), in a full sentence. Naming the element is not a criterion.')
      if (d.severity === 'major') add('reason', CONFIRMED.test(d.reason), CONFIRMED.test(d.reason) ? 'Rejection of a major RID confirmed with the reviewer or instructor.' : 'Rejecting a major RID: get the reviewer or the instructor to confirm it, and say so (“confirmed with the instructor on day 4”). Telling them is not a confirmation, and a wrong rejection leaves a model defect open at CP5.')
      break
    }
    case 'defer': {
      add('reason', words(d.reason) >= 6, words(d.reason) >= 6 ? 'Reason for deferring given.' : 'Say why the fix waits.')
      const target = TARGET.test(d.change) && !CONDITIONAL.test(d.change)
      add('change', target, target ? 'Target checkpoint named.' : CONDITIONAL.test(d.change)
        ? 'A deferral names a firm checkpoint: no “if”, “otherwise” or “after the course”. Say what will be changed and by when.'
        : 'Name when it will be fixed (Week 12–14, at the latest by the CP5 submission): every CP4 RID must be dispositioned before the CP5 review (lab plan B.6).')
      add('evidence', TRACKED.test(d.evidence), TRACKED.test(d.evidence) ? 'The open item is tracked.' : 'Say where the open item is tracked: an @Issue / @StatusInfo in the model, the gap table, or an AROU item.')
      if (d.severity === 'major') {
        const ok = /\bby (?:the )?CP5(?: submission)?\b|\bWeek 1[234]\b/i.test(d.change) && !/\bafter\b|\botherwise\b|\bif\b|\bunless\b|\bWeek 1[5-9]\b|\bnext (?:term|course|release)\b/i.test(d.change)
        add('change', ok, ok ? 'A major RID fixed by the CP5 submission.' : 'A major RID is fixed by the CP5 submission (course severity scale, Week 11): write “by the CP5 submission” or the week, with no “after”, “if” or “otherwise”.')
      }
      break
    }
  }
  return c
}
export const dispositionOk = (d: Disposition) => checkDisposition(d).every((x) => x.ok)

export function checkLog(ds: Disposition[], received: number): DispCheck[] {
  const ids = ds.map((d) => d.rid.trim())
  const dup = ids.filter((x, i) => x && ids.indexOf(x) !== i)
  const unowned = ds.filter((d) => !/^[A-Za-z]{2,4}$/.test((d.owner ?? '').trim())).map((d) => d.rid || '(no ID)')
  const open = ds.filter((d) => !dispositionOk(d)).map((d) => d.rid || '(no ID)')
  return [
    { field: 'set', ok: received > 0 && ds.length >= received, message: received > 0 ? `${ds.length} of ${received} RIDs received have a disposition (B.6: every CP4 RID has one).` : 'Enter how many RIDs your team received.' },
    { field: 'set', ok: dup.length === 0, message: dup.length ? `Duplicate dispositions: ${[...new Set(dup)].join(', ')}.` : 'One disposition per RID.' },
    { field: 'set', ok: unowned.length === 0, message: unowned.length ? `Dispositions without the owner’s initials: ${unowned.join(', ')}.` : 'Every disposition records its owner.' },
    { field: 'set', ok: open.length === 0, message: open.length ? `Dispositions with open screen messages: ${open.join(', ')}.` : 'Every disposition passes the screens.' },
  ]
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
export function dispositionMarkdown(ds: Disposition[]): string {
  return [
    '| RID | Severity | Summary | Disposition | Reason | Change (fix reference) | Closure evidence | Owner | Provenance |',
    '|---|---|---|---|---|---|---|---|---|',
    ...ds.map((d) => `| ${cell(d.rid)} | ${d.severity} | ${cell(d.summary)} | ${d.decision} | ${cell(d.reason)} | ${cell(d.change)} | ${cell(d.evidence)} | ${cell(d.owner ?? '')} | ${d.provenance ?? ''} |`),
  ].join('\n')
}

/**
 * Model dispositions (answer key and lesson worked example (e)): Team Kestrel's log for five RIDs it received from
 * Team T4 on its CP4 model. FICTIONAL. They must pass the screens (AUTHORING_GUIDE §7 rule 4).
 */
export const MODEL_DISPOSITIONS: Disposition[] = [
  { rid: 'RID-T4-01', severity: 'major', summary: "satisfy 'REQ-SYS-001' by PHY-003 is asserted although PHY-003 binds chargeTimeToDispatch = 24 [min], above the 20 min limit.", decision: 'accept', reason: 'The model asserted a claim its own value contradicts.', change: "Removed satisfy 'REQ-SYS-001' by aeroLink.'PHY-003' (Traceability line 61); added @Issue \"SATISFY GAP …\" and @StatusInfo open in Requirements::'REQ-SYS-001'; gap-table row G-03 (owner MK).", evidence: 'Checker run after the change: 0 errors, 0 warnings. Audit: REQ-SYS satisfied 9 of 10; R-001 updated.', owner: 'MK', provenance: 'team-derived' },
  { rid: 'RID-T4-02', severity: 'major', summary: 'REQ-STK-004 has no verification case; the reviewer reads RB-9.2 as requiring every requirement to be verified.', decision: 'reject', reason: 'RB-9.2 counts REQ-SYS only (satisfy and a verification method for 100 % of REQ-SYS), so the RID misreads its criterion. REQ-STK-004 records analysis as its method, and two requirements derived from it are verified (REQ-SYS-006 by VER-006, REQ-SYS-007 by VER-007); confirmed with the instructor on day 4.', change: 'No model change.', evidence: 'V&V table row REQ-STK-004: analysis (capacity model), children REQ-SYS-006 and 007 verified; audit: REQ-STK verified directly or through a child 9 of 10.', owner: 'AL', provenance: 'team-derived' },
  { rid: 'RID-T4-03', severity: 'minor', summary: "IF-010 connects the operations-centre port to the charger end: the connect line's ends are in the reverse order of AircraftChargerData's ends.", decision: 'accept-modified', reason: 'The same reversal was also found in IF-013, so both connect lines were corrected, not only IF-010.', change: "Swapped the connect ends in Physical::aeroLink.'IF-010' (line 88) and Physical::aeroLink.'IF-013' (line 97).", evidence: 'Checker run: 0 errors; both lines re-read against their interface definitions (diff attached).', owner: 'JS', provenance: 'team-derived' },
  { rid: 'RID-T4-04', severity: 'minor', summary: 'SCN-005 alternate flow A3 (hold longer than 2 h) has no branch in the action flow.', decision: 'defer', reason: 'Behaviour is formative at CP4; the team adds the A3 branch when it finalises the behaviour, before the CP5 submission.', change: "Add decide holdDuration in Behavior::'SCN-005' before liftHold, by the CP5 submission (Week 14), owner RP.", evidence: "Tracked as @Issue and @StatusInfo open in Behavior::'SCN-005'.", owner: 'RP', provenance: 'team-derived' },
  { rid: 'RID-T4-05', severity: 'editorial', summary: 'Package names Logical_Arch and Physical_Arch use underscores, unlike the course package names.', decision: 'accept', reason: 'Conventions finding; no change of meaning.', change: 'Renamed Logical_Arch to Logical and Physical_Arch to Physical, and every qualified name that used them (from line 12).', evidence: 'Checker run after the rename: 0 errors, 0 warnings.', owner: 'MK', provenance: 'team-derived' },
]
