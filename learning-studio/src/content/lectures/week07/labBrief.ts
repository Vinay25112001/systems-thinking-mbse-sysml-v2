// Week 7 lab brief: the single source of the Lab L7 package sections, the finding kinds of the consistency and trace audit,
// the coverage layers, the disposition vocabularies (audit findings and review RIDs), the hard gates and advisories with the
// student-visible phrase each rests on, the parts, the review timing plan and the person-hours. Read by the Week 7 lectures
// (session1.ts, session2.ts), the AeroLink case (aerolinkCase.ts), the lab instructions (src/content/lab/week07Lab.ts), the
// package tool (src/workbench/week7/*) and their tests. Pure data, no imports, so both the content and the workbench layers
// may depend on it.
//
// Review status: new-pending-review. The package structure, the audit layers, the finding kinds, the disposition
// vocabularies, the entry and exit criteria, the review timing and the person-hours are COURSE CONVENTIONS (no held source
// defines a "Systems Thinking Engineering Package"), pending faculty approval. DECISION_LOG A21 decision 7: Week 7 is an
// engineering review and presentation week.
//
// Gates are designed against the recurring defect classes of Weeks 2, 4, 5 and 6:
//   - every HARD GATE names, in `taught`, the slide and the exact phrase a STUDENT can read on its face (body, aside, caption
//     or alt text; faculty notes do not count, the student build strips them); src/content/lab/week07Lab.test.ts asserts it;
//   - a free-text gate asks only that the answer is written and says something: one word is complete where the lecture calls
//     a word complete ("Duplicate", "TL", "Approved", "R-005"); an answer that says nothing ("n/a", "none", "?", "-", "later",
//     "TBD"; the shared src/workbench/emptyAnswer.ts) never counts where an answer is required (EMPTY_ANSWER_RULE);
//   - no gate tests a name's form or length; anything that only signals a likely defect is an ADVISORY, shown, never blocking;
//   - no "fixed" claim the tool cannot test (Week 7 review M2): a finding is closed by correcting the week's record in its
//     own lab tool and importing the new export, after which the audit no longer finds it. The only dispositions a team can
//     type are the two the tool can hold to account: accept with a rationale AND an evidence reference, or defer to a named
//     later week with an owner. A reason that only claims completion ("Fixed", "Resolved", "Withdrawn", "Done") fails,
//     because the finding it answers is still in the exports; a collision (two elements sharing an ID, review M3) cannot be
//     accepted at all.
// src/workbench/week7/record.test.ts asserts the short valid answers both ways.
//
// Sources checked for this file (page text in _source_cache/*.txt):
//   - a configuration baseline is a formally approved snapshot that serves as the reference point for later change; its
//     content can include digital artifacts such as models, databases and files (SEBoK R36 pp.498–499);
//   - bidirectional traceability: no "orphaned" lower-level requirements, no "childless parent" higher-level ones (DoD R45
//     p.118); the RTM records decomposition, allocation history and rationale (R45 p.119);
//   - technical reviews: independent, knowledgeable stakeholders, pre-established criteria; prepare, conduct, complete;
//     entry and exit criteria defined beforehand and entry confirmed; information items made available in advance and
//     assessed for consistency and completeness; reviewers close to the project and far enough removed (SEBoK R06c
//     pp.386–388);
//   - an SRR does not begin until its criteria are met and prior reviews' action items are closed (DoD R40 p.70);
//   - percentage completion of documents can be an entrance criterion, and the review's output is an objective assessment
//     of progress, maturity and risk (DoD R44 p.111);
//   - a requirements baseline includes the requirements that could not be met (MITRE R56 p.389).

/** The empty-answer rule as the student reads it (Laboratory page, lab instructions, package tool). */
export const EMPTY_ANSWER_RULE =
  'A one-word answer counts wherever the lecture calls a word complete (“Duplicate”, “TL”, “R-005”), but an answer that says nothing (“n/a”, “none”, “?”, “-”, “later”, “TBD”) never counts where an answer is required: it records no reason, names no owner and answers no reviewer.'

// ---------------------------------------------------------------------------------------------------- package
/** The weeks whose exports the package is built from, with the export format each lab tool writes. */
export const SOURCE_WEEKS = [
  { week: 1, format: 'week1-model-inputs', file: 'team-NN-model-inputs.json (Week 1, version 3)', title: 'Team charter, stakeholders and needs' },
  { week: 2, format: 'week2-model-inputs', file: 'team-NN-week2-model-inputs.json', title: 'ConOps, scenarios, capabilities and requirements' },
  { week: 3, format: 'week3-model-inputs', file: 'team-NN-week3-model-inputs.json', title: 'Technology readiness, risks, TPMs and the trade study' },
  { week: 4, format: 'week4-model-inputs', file: 'team-NN-week4-model-inputs.json', title: 'Architecture and information view' },
  { week: 5, format: 'week5-model-inputs', file: 'team-NN-week5-model-inputs.json', title: 'Components and interfaces' },
  { week: 6, format: 'week6-model-inputs', file: 'team-NN-week6-model-inputs.json', title: 'Evolution roadmap' },
] as const
export type SourceWeek = (typeof SOURCE_WEEKS)[number]['week']

/** The package format the tool writes, and its version (documented in docs/lectures/week07/WEEK7_PACKAGE_FORMAT.md). */
export const PACKAGE_FORMAT = 'week7-package'
export const PACKAGE_VERSION = 1

/** The sections of the Systems Thinking Engineering Package, in order (course convention). Each has an owner in the review
 *  preparation; `week` is the week whose export supplies it (7 = written this week). */
export const PACKAGE_SECTIONS = [
  { id: 'summary', n: 1, title: 'Executive summary', week: 7 },
  { id: 'enterprise', n: 2, title: 'Enterprise, problem and mission', week: 1 },
  { id: 'stakeholders', n: 3, title: 'Stakeholders and needs', week: 1 },
  { id: 'requirements', n: 4, title: 'ConOps, scenarios and requirements', week: 2 },
  { id: 'trade', n: 5, title: 'Technology, risk and the trade study', week: 3 },
  { id: 'architecture', n: 6, title: 'Architecture and information view', week: 4 },
  { id: 'interfaces', n: 7, title: 'Components and interfaces', week: 5 },
  { id: 'roadmap', n: 8, title: 'Evolution roadmap', week: 6 },
  { id: 'audit', n: 9, title: 'Consistency and trace audit', week: 7 },
  { id: 'lessons', n: 10, title: 'Open items and lessons learned', week: 7 },
  { id: 'ai', n: 11, title: 'AI usage summary', week: 7 },
] as const
export type SectionId = (typeof PACKAGE_SECTIONS)[number]['id']

// ---------------------------------------------------------------------------------------------------- the audit
/** The trace layers the audit reads, from needs to the roadmap (course convention after DoD R45 p.118 and SEBoK R13 p.565).
 *  `parent` and `child` say what counts as covered in each direction. */
export const COVERAGE_LAYERS = [
  { id: 'need-req', label: 'Needs → stakeholder requirements', from: 'NEED', rule: 'a need is covered when a stakeholder requirement names it as a parent' },
  { id: 'stk-sys', label: 'Stakeholder → system requirements', from: 'REQ-STK', rule: 'a stakeholder requirement is covered when a system requirement refines it or a function or physical element carries it directly' },
  { id: 'sys-arch', label: 'System requirements → architecture', from: 'REQ-SYS', rule: 'a system requirement is covered when a function, a physical element or an interface carries it' },
  { id: 'arch-if', label: 'Architecture → interfaces', from: 'PHY', rule: 'a physical element is covered when it, or one of its components, is an end of an interface' },
  { id: 'roadmap', label: 'Roadmap → package', from: 'INC', rule: 'an increment after the baseline is covered when every ID it serves exists in the package' },
] as const
export type LayerId = (typeof COVERAGE_LAYERS)[number]['id']

/** The kinds of finding the audit computes. `group` places it in the lecture's two checks (consistency, traceability) or the
 *  Week 6 hand-over; `basis` is the student-facing reason it is a finding. */
export const FINDING_KINDS = [
  { id: 'enterprise', group: 'consistency', label: 'Two enterprises', basis: 'The files name different enterprises or teams: a package is one enterprise.' },
  { id: 'not-ready', group: 'consistency', label: 'Week not ready', basis: 'The week’s own lab tool judged its record not ready when it was exported: say what is still open, or finish it and export again.' },
  { id: 'stale', group: 'consistency', label: 'Stale export', basis: 'A later week was built from an older export: it does not carry IDs the earlier week now defines.' },
  { id: 'dangling', group: 'consistency', label: 'ID no longer defined', basis: 'A later week carries IDs that the week which owns them no longer defines (deleted or renumbered).' },
  { id: 'renamed', group: 'consistency', label: 'Wording drifted', basis: 'A later week carries an older wording of an element the owning week has since renamed (the same element: the identity rule holds); re-export the later week.' },
  { id: 'collision', group: 'consistency', label: 'ID collision', basis: 'Two weeks each define this ID for a different element (the identity rule fails): one ID, one meaning is broken. Renumber it in the later week’s own tool and re-export; until then it can only be deferred with an owner.' },
  { id: 'stale-disposition', group: 'consistency', label: 'Disposition no longer true', basis: 'An earlier week recorded a gap that a later week has closed: the recorded disposition is now false and must be withdrawn.' },
  { id: 'childless-need', group: 'traceability', label: 'Childless need', basis: 'No stakeholder requirement names this need as a parent (a childless parent).' },
  { id: 'orphan', group: 'traceability', label: 'Orphan requirement', basis: 'This requirement has no parent, or a parent that does not exist in the package (an orphan).' },
  { id: 'childless-stk', group: 'traceability', label: 'Stakeholder requirement not flowed down', basis: 'No system requirement refines it and no function or element carries it.' },
  { id: 'unallocated', group: 'traceability', label: 'System requirement not allocated', basis: 'No function, physical element or interface carries this system requirement.' },
  { id: 'cap-no-function', group: 'traceability', label: 'Capability without a function', basis: 'No function delivers this capability.' },
  { id: 'phy-no-interface', group: 'traceability', label: 'Element without an interface', basis: 'Neither this physical element nor any of its components is an end of an interface.' },
  { id: 'ext-no-interface', group: 'traceability', label: 'External without an interface', basis: 'This external element has no interface and no recorded reason for having none.' },
  { id: 'increment-unresolved', group: 'traceability', label: 'Increment serves an unknown ID', basis: 'The increment serves an ID that does not exist in the package.' },
  { id: 'open-item', group: 'hand-over', label: 'Open item from the baseline review', basis: 'Your Week 6 baseline review named this open item: the package carries it with its owner.' },
  { id: 'dropped-open-item', group: 'hand-over', label: 'Open item dropped', basis: 'An earlier week recorded this as an open item to close later; the gap is still there and no later week carried it. The package carries it again, with an owner and a week.' },
] as const
export type FindingKind = (typeof FINDING_KINDS)[number]['id']
export const findingKind = (id: string) => FINDING_KINDS.find((k) => k.id === id)

/** What a team may type for a finding (Week 7 review M2). The stored ids stay 'record' and 'defer' (format v1 readable).
 *  "Fix" is not typed: a corrected finding is one the audit no longer finds after the week's record is corrected and its
 *  export imported again (the third way out, shown in the tool and the lecture; no claim the tool cannot test). */
export type DispositionId = 'record' | 'defer'
export const DISPOSITIONS: { id: DispositionId; label: string; means: string }[] = [
  { id: 'record', label: 'Accept, with rationale and evidence', means: 'the gap stays in the package on purpose: the rationale says why it is acceptable and cites the evidence (an ID in the package, or the week whose record holds it)' },
  { id: 'defer', label: 'Defer to a later week, with an owner', means: 'the gap is real and open (status: open); it is carried forward with the week it closes in and who closes it' },
]
/** The third way out, never typed: correct the week in its own tool, export it again and import the new file. */
export const CORRECTED_AND_REIMPORTED = 'Corrected and re-imported: correct the week in its own lab tool, export it again and import the new file; the finding disappears, which is the only proof of a correction.'
/** A reason that only claims the gap is closed (review M2): never a rationale while the finding is still found. */
export const COMPLETION_CLAIM = /\b(fixed|resolved|withdrawn|withdraw|corrected|done|closed|completed?|addressed|handled|removed|deleted)\b/i
/** Deferral phrasing (review N2): a rationale that names a Phase II week (8–14) for the closure is a plan, not a claim
 *  (“To be closed in Week 10”, “Will be addressed in Week 9”). */
export const PHASE2_WEEK = /\bweek\s*(?:8|9|1[0-4])\b/i
/** A bare closure claim: a completion word with no Phase II week planned for it (“Fixed”, “Resolved in Week 4”). */
export const isCompletionClaim = (s: string) => COMPLETION_CLAIM.test(s) && !PHASE2_WEEK.test(s)
/** The evidence an accepted finding's rationale must cite: an ID of the package (checked against the index) or the week
 *  whose record holds the evidence. */
export const WEEK_REF = /\bweek\s*[1-7]\b/i
/** The weeks a deferred finding may close in (Phase II). */
export const DEFER_WEEKS = [8, 9, 10, 11, 12, 13, 14] as const
/** The identity rule (review M3), shown to students: two definitions of one ID are the same element when their names
 *  match after case and punctuation are ignored, or one name contains the other whole (a shortened name); otherwise they
 *  are two elements sharing an ID, a collision. */
export const IDENTITY_RULE = 'Same ID, same element only if the names match (ignoring case and punctuation) or one name contains the other whole; otherwise two elements share the ID: a collision, which no rationale can accept.'
export const sameElement = (a: string, b: string) => {
  const n = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  const x = n(a)
  const y = n(b)
  return !!x && !!y && (x === y || ` ${x} `.includes(` ${y} `) || ` ${y} `.includes(` ${x} `))
}
export const dispositionLabel = (d: string) => DISPOSITIONS.find((x) => x.id === d)?.label ?? d

/** RID severities and dispositions (course convention for the review; the RID form on the Assessment page). */
export type SeverityId = 'major' | 'minor'
export const SEVERITIES: { id: SeverityId; label: string; means: string }[] = [
  { id: 'major', label: 'Major', means: 'it would carry a defect into the Week 8 model, or it changes a decision, a requirement or a trace' },
  { id: 'minor', label: 'Minor', means: 'wording, presentation or a local inconsistency that changes no decision and no trace' },
]
export type RidDispositionId = 'accept' | 'defer' | 'reject'
export const RID_DISPOSITIONS: { id: RidDispositionId; label: string; means: string }[] = [
  { id: 'accept', label: 'Accept', means: 'the finding is right; the response says what changes, and an owner makes the change' },
  { id: 'defer', label: 'Defer', means: 'the finding is right but closes later; the response says when, and an owner carries it' },
  { id: 'reject', label: 'Reject', means: 'the finding is not a defect; the response gives the evidence (an ID, a recorded decision, a computation)' },
]
export const ridDispositionLabel = (d: string) => RID_DISPOSITIONS.find((x) => x.id === d)?.label ?? d

// ---------------------------------------------------------------------------------------------------- gates
/** Where a student can read the sentence that makes a gate failure a real defect: a slide of a Week 7 session (body,
 *  aside, caption or alt text) and the exact phrase. */
export type Taught = { session: 1 | 2; slide: string; phrase: string }
export type GateRow = { id: string; short: string; basis: string; taught?: Taught }

export const SOURCE_GATES = [
  { id: 'all-weeks', short: 'all six weekly exports loaded (Weeks 1 to 6)', basis: 'The package integrates the Weeks 1–6 work (course schedule); a package missing a week cannot be audited across it, and Week 8 starts from the whole package.', taught: { session: 1, slide: 'w7s1-package-contents', phrase: 'Built from all six weekly exports' } },
  { id: 'one-enterprise', short: 'the same enterprise in every file', basis: 'The package is one enterprise’s baseline: a snapshot that later change starts from (SEBoK R36 p.498). Files about two enterprises cannot be one baseline.', taught: { session: 1, slide: 'w7s1-ids', phrase: 'One enterprise, one ID, one meaning' } },
] as const satisfies readonly GateRow[]

export const SOURCE_ADVISORIES = [
  { id: 'team-code', short: 'the team code differs between files: check that every file is your team’s latest export', basis: 'Advisory: a team code can be left blank in one tool; the enterprise name is the gate.' },
  { id: 'old-version', short: 'the Week 1 file is version 1 or 2: it still imports, but export it again from the current Week 1 tool so the package carries objectives and relationships', basis: 'Advisory: earlier Week 1 versions import, with fewer fields.' },
] as const satisfies readonly GateRow[]

export const FINDING_GATES = [
  { id: 'disposition', short: 'a disposition: accept with rationale, or defer to a later week (to correct it, fix the week’s record and import its new export); a collision cannot be accepted', basis: 'Bidirectional traceability means no orphan and no childless parent (DoD R45 p.118); a gap the package keeps must be a decision, not a silence, and a baseline includes what could not be met (MITRE R56 p.389). Two elements sharing an ID break one ID, one meaning, so no rationale accepts them.', taught: { session: 1, slide: 'w7s1-audit-metrics', phrase: 'Every finding: accept with rationale, or defer' } },
  { id: 'reason', short: 'the rationale (a short one is enough: “Duplicate of REQ-STK-004”); “n/a” is not a rationale, and neither is “Fixed”, “Resolved” or “Withdrawn” while the finding is still found; a plan that names a Phase II week (“To be closed in Week 10”) is a rationale', basis: 'The RTM records the rationale for every entry and change (DoD R45 p.119); a disposition without its rationale cannot be reviewed, and a claim that the gap is closed is false while the audit still finds it in your exports.', taught: { session: 1, slide: 'w7s1-audit-metrics', phrase: 'A claim of “fixed” is not a rationale' } },
  { id: 'evidence', short: 'for an accepted finding: the evidence the rationale rests on, an ID in the package or the week whose record holds it (“Week 2 record”)', basis: 'The RTM keeps the rationale with its allocation history (DoD R45 p.119); a reviewer can check an accepted gap only against cited evidence.', taught: { session: 1, slide: 'w7s1-audit-metrics', phrase: 'Accept: a rationale with its evidence' } },
  { id: 'owner', short: 'for a deferred finding: who closes it (a role or initials; “TBD” is not an owner)', basis: 'TBX management identifies the owner of the work to close an open issue (SEBoK R13 p.565); a deferred gap with no owner is closed by no one.', taught: { session: 1, slide: 'w7s1-audit-metrics', phrase: 'Defer: name who closes it, and the week' } },
  { id: 'week', short: 'for a deferred finding: the week it closes in (Week 8 to 14)', basis: 'TBX management establishes the work and its closure (SEBoK R13 p.565); an open item with no date is not planned.', taught: { session: 1, slide: 'w7s1-audit-metrics', phrase: 'Defer: name who closes it, and the week' } },
] as const satisfies readonly GateRow[]

export const FINDING_ADVISORIES = [
  { id: 'carried', short: 'this disposition was carried from an earlier week’s record: read it again and keep it only if it is still true', basis: 'Advisory: carrying a recorded reason forward is valid; only the team knows whether it still holds.' },
  { id: 'past-week', short: 'the rationale names a week that has passed: say what happened then', basis: 'Advisory: a carried reason such as “planned for Week 3” may still be true history; the team says what became of it.' },
  { id: 'week-owner', short: 'the owner is only a week: a week is a date, not an owner; name a person or role', basis: 'Advisory: “Week 10” passes the owner gate as written text, but it closes nothing; the rubric marks it down.' },
] as const satisfies readonly GateRow[]

export const SUMMARY_GATES = [
  { id: 'recommendation', short: 'the recommendation: what you ask the reviewer to approve (one sentence)', basis: 'Present recommendations as a clearly worded, actionable task list (SEBoK R18 p.473); the decision maker decides on what is asked.', taught: { session: 1, slide: 'w7s1-exec-summary', phrase: 'Recommendation: what you ask the decision maker to approve' } },
  { id: 'evidence', short: 'the evidence: at least one ID that exists in the package', basis: 'Decision analysis turns a decision into a traceable, defendable plan (DoD R43 p.109); a claim with no ID behind it cannot be traced.', taught: { session: 1, slide: 'w7s1-exec-summary', phrase: 'Why: the evidence, cited by ID' } },
  { id: 'conditions', short: 'the conditions: what must stay true for the recommendation to hold', basis: 'Sensitivities are analyzed before the recommendation (DoD R43 p.110); the conditions are what the sensitivity found.', taught: { session: 1, slide: 'w7s1-exec-summary', phrase: 'Conditions: what must stay true' } },
  { id: 'residual', short: 'the residual risk: at least one R ID that exists in the package', basis: 'A review balances technical maturity and its associated risks, and documents the risks identified (SEBoK R06c p.387).', taught: { session: 1, slide: 'w7s1-exec-summary', phrase: 'Residual risk: what remains, by R ID' } },
  { id: 'decisions', short: 'the decisions you need from the reviewer', basis: 'Reviews support decision gates (SEBoK R06c p.386); the summary says which decisions the review is asked to make.', taught: { session: 1, slide: 'w7s1-exec-summary', phrase: 'Decisions needed from the reviewer' } },
  { id: 'next', short: 'the next roadmap increment: an INC ID after the baseline', basis: 'The package hands Phase II a plan of change, not only a snapshot: the next increment says what changes first (course convention, from your Week 6 roadmap).', taught: { session: 1, slide: 'w7s1-exec-summary', phrase: 'Next: the roadmap increment that comes next' } },
] as const satisfies readonly GateRow[]

export const PREP_GATES = [
  { id: 'owners', short: 'every package section has an owner (initials are enough)', basis: 'Roles and responsibilities are coordinated before the review (SEBoK R06c p.387); in the course review every member answers for the sections they own.', taught: { session: 1, slide: 'w7s1-roles', phrase: 'Every member presents and answers for the sections they own' } },
  { id: 'decision', short: 'the key decision you defend: your Week 3 trade decision or a Week 4 DEC', basis: 'The review asks for at least one key decision with its alternatives, criteria and sensitivity (course entry criterion).', taught: { session: 1, slide: 'w7s1-entry-exit', phrase: 'One key decision, with its alternatives' } },
  { id: 'thread', short: 'the thread you walk: a need whose trace reaches a system requirement and an architecture element', basis: 'Traceability shows that requirements trace to their needs and are allocated to elements of the architecture (SEBoK R13 p.565); a thread that stops before the architecture shows nothing the design does.', taught: { session: 1, slide: 'w7s1-thread-example', phrase: 'Walk one thread from a need to the architecture' } },
] as const satisfies readonly GateRow[]

export const PREP_ADVISORIES = [
  { id: 'thread-interface', short: 'the thread stops before an interface: choose a need whose element has an interface, or say why', basis: 'Advisory: a thread through an element with no interface is still a thread; the interface makes it a better demonstration.' },
  { id: 'thread-roadmap', short: 'no roadmap increment, gap or unknown touches the thread: the walk ends at the architecture', basis: 'Advisory: not every need is touched by the roadmap.' },
] as const satisfies readonly GateRow[]

export const RID_GATES = [
  { id: 'location', short: 'where: an ID in the package or the title of a package section', basis: 'Participants analyze the information items against pre-established criteria (SEBoK R06c p.388); a finding with no location cannot be checked or fixed.', taught: { session: 2, slide: 'w7s2-rids', phrase: 'Where: the ID or section it concerns' } },
  { id: 'finding', short: 'what is wrong (one sentence)', basis: 'A review applies pre-established criteria (SEBoK R06c p.386); the finding says what is not met.', taught: { session: 2, slide: 'w7s2-rids', phrase: 'What: what is wrong, against which criterion' } },
  { id: 'criterion', short: 'the criterion or source it breaks (a rule, a review criterion or a cited source)', basis: 'Participants analyze against pre-established criteria (SEBoK R06c p.388); the criterion is what makes a finding checkable.', taught: { session: 2, slide: 'w7s2-rids', phrase: 'What: what is wrong, against which criterion' } },
  { id: 'severity', short: 'severity: major or minor', basis: 'The owning team plans its work by severity; a major finding blocks the Week 8 import or changes a decision (course convention).', taught: { session: 2, slide: 'w7s2-rids', phrase: 'Severity: major or minor' } },
  { id: 'disposition', short: 'a disposition: accept, defer or reject', basis: 'Once the exit criteria are met, results are communicated and the actions implemented (SEBoK R06c p.388); every RID needs a decision.', taught: { session: 2, slide: 'w7s2-dispositions', phrase: 'Accept, defer or reject, each with a response' } },
  { id: 'response', short: 'the response: what changes, or when; for a rejection, its evidence (an ID, or a reason in a phrase: “Out of scope”; a bare word such as “No” is not evidence)', basis: 'A disposition is communicated to the reviewer (SEBoK R06c p.388); a reject without evidence is a refusal, not a disposition.', taught: { session: 2, slide: 'w7s2-dispositions', phrase: 'Reject only with evidence: an ID, a decision, a computation' } },
  { id: 'owner', short: 'for an accepted or deferred RID: who makes the change (initials are enough)', basis: 'Identified actions are implemented (SEBoK R06c p.388); an action with no owner is not implemented.', taught: { session: 2, slide: 'w7s2-dispositions', phrase: 'An accepted or deferred RID has an owner' } },
] as const satisfies readonly GateRow[]

export const RID_ADVISORIES = [
  { id: 'reject-no-id', short: 'a rejection that cites no ID: point the reviewer to the record, decision or computation that answers the finding', basis: 'Advisory: some rejections rest on a stated scope, which carries no ID.' },
] as const satisfies readonly GateRow[]

export type SourceGateId = (typeof SOURCE_GATES)[number]['id']
export type SourceAdvisoryId = (typeof SOURCE_ADVISORIES)[number]['id']
export type FindingGateId = (typeof FINDING_GATES)[number]['id']
export type FindingAdvisoryId = (typeof FINDING_ADVISORIES)[number]['id']
export type SummaryGateId = (typeof SUMMARY_GATES)[number]['id']
export type PrepGateId = (typeof PREP_GATES)[number]['id']
export type PrepAdvisoryId = (typeof PREP_ADVISORIES)[number]['id']
export type RidGateId = (typeof RID_GATES)[number]['id']
export type RidAdvisoryId = (typeof RID_ADVISORIES)[number]['id']

/** Part-level rules: gates make a part incomplete (each with its student-visible basis); advisories never block. */
export const PART_RULES = [
  { id: 'all-dispositioned', kind: 'gate', short: 'every finding has a disposition that passes its gates (none silent)', basis: 'Entry criteria are defined beforehand and their completion confirmed before the review is held (SEBoK R06c p.387); an SRR does not begin until prior action items are closed (DoD R40 p.70).', taught: { session: 1, slide: 'w7s1-entry-exit', phrase: 'Entry: every finding dispositioned, none silent' } },
  { id: 'lessons', kind: 'gate', short: 'at least one lesson learned, written', basis: 'The package closes Phase I with what the team would do differently (course package contents).', taught: { session: 1, slide: 'w7s1-package-contents', phrase: 'lessons learned' } },
  { id: 'ai', kind: 'gate', short: 'the AI usage summary for the package: at least 12 words, present even if no AI tool was used', basis: 'Every course record carries an AI usage statement (course rule since Week 1); the package summarizes it.', taught: { session: 1, slide: 'w7s1-package-contents', phrase: 'an AI usage summary' } },
  { id: 'all-rids', kind: 'gate', short: 'after the review: every RID received has a disposition that passes its gates', basis: 'Once the exit criteria have been met, the results are communicated and the actions implemented (SEBoK R06c p.388).', taught: { session: 1, slide: 'w7s1-entry-exit', phrase: 'Exit: every RID dispositioned, with a response' } },
  { id: 'no-rids', kind: 'advisory', short: 'no RIDs recorded yet: after Session 2, enter every RID your reviewers raised', basis: 'Advisory: the review section is completed after the review; before it, the package can be ready for review without RIDs.' },
  { id: 'coverage-low', kind: 'advisory', short: 'a coverage layer below 80 %: every gap is dispositioned, but say in the executive summary why so much is open', basis: 'Advisory: low coverage is legitimate in an early baseline when every gap is dispositioned; the reviewer will ask why.' },
] as const

// ---------------------------------------------------------------------------------------------------- parts and states
/** The parts the Week 7 work adds to the Team Record (Week 6 added Parts 23–27). */
export const WEEK7_PARTS = [
  { n: 28, id: 'sources', title: 'Package sources and index' },
  { n: 29, id: 'audit', title: 'Consistency and trace audit, with dispositions' },
  { n: 30, id: 'summary', title: 'Executive summary and lessons learned' },
  { n: 31, id: 'prep', title: 'Design review preparation' },
  { n: 32, id: 'rids', title: 'Review findings (RIDs) and dispositions' },
] as const
export type Week7PartId = (typeof WEEK7_PARTS)[number]['id']

/** The package's readiness states: ready for review (entry criteria met) and review closed (exit criteria met). */
export const STATES = [
  { id: 'not-ready', label: 'not ready for review' },
  { id: 'ready-for-review', label: 'ready for review: the entry criteria are met' },
  { id: 'review-closed', label: 'review closed: every RID dispositioned' },
] as const
export type PackageState = (typeof STATES)[number]['id']

/** The ID prefixes Week 7 adds, the canonical artifact type each maps to (CANONICAL_ENGINEERING_DATA_MODEL.md, proposed),
 *  and the lead role that owns it (course convention). */
export const WEEK7_PREFIXES = [
  { prefix: 'F', type: 'audit finding (computed by the tool from the six exports; proposed nested row of the package, no canonical artifact type yet)', owner: 'Verification & Validation' },
  { prefix: 'RID', type: 'review item discrepancy raised by a reviewer, with its disposition (proposed artifact type; the deferred ones are carried into Week 8 as open items)', owner: 'Each section owner' },
] as const

// ---------------------------------------------------------------------------------------------------- the review
/** The course's entry and exit criteria for the Phase I design review (course convention after SEBoK R06c pp.387–388:
 *  criteria defined beforehand, entry confirmed before the review, results communicated and actions implemented once the
 *  exit criteria are met). The package tool's states check the first three entry criteria and the exit criteria. */
export const ENTRY_CRITERIA = [
  'Package index and readiness report submitted at least 24 h before Session 2, built from all six weekly exports',
  'Every finding dispositioned, none silent: recorded with its reason, or deferred with its owner',
  'Executive summary, section owners, the key decision and the thread prepared',
  'Each reviewer has read the assigned sections and submitted at least two RIDs before Session 2',
] as const
export const EXIT_CRITERIA = [
  'Every RID dispositioned (accept, defer or reject) with a response, within 3 days of Session 2',
  'Every accepted or deferred RID owned; deferred ones carried as open items into Week 8',
  'The closed package exported again and uploaded',
] as const

/** The Session 2 review block (minutes) and the slot rule (course convention): the meeting opens and closes in 2 minutes
 *  each, and the rest is shared equally by the teams; a slot shorter than MIN_SLOT is a faculty decision. */
export const REVIEW_TEAM_MINUTES = 40
export const MIN_SLOT = 8
/** The timing plan for n teams: slot length, briefing and question minutes. Briefing is 60 % of the slot rounded down; the
 *  rest is the reviewers' questions on the RIDs. `fits` is false when a slot would fall below MIN_SLOT. */
export function reviewPlan(teams: number) {
  const slot = teams > 0 ? Math.floor(REVIEW_TEAM_MINUTES / teams) : 0
  const briefing = Math.floor(slot * 0.6)
  return { teams, slot, briefing, questions: slot - briefing, fits: teams > 0 && slot >= MIN_SLOT }
}

// ---------------------------------------------------------------------------------------------------- workload
/** Lab L7 out of class in person-hours for a team of four (course estimate, to be checked against logged hours). `scales`
 *  says whether a task grows with the size of the team's record ('items': a team of three works to reduced minimums all
 *  term, so its package is about three quarters the size) or not ('fixed'). Every method step has a row. */
export const LAB7_PERSON_HOURS: { id: string; task: string; hours: number; scales: 'items' | 'fixed' }[] = [
  { id: 'sources', task: 'load the six exports, re-export any stale week and read the package index', hours: 1.0, scales: 'fixed' },
  { id: 'audit', task: 'read every finding and disposition it, with the reason and, if deferred, the owner', hours: 1.6, scales: 'items' },
  { id: 'summary', task: 'executive summary and lessons learned', hours: 1.0, scales: 'fixed' },
  { id: 'prep', task: 'the design review briefing: slides, the key decision, the thread, one rehearsal', hours: 2.6, scales: 'fixed' },
  { id: 'rids', task: 'disposition the RIDs received and close the review', hours: 0.8, scales: 'items' },
  { id: 'integration', task: 'AI usage summary, export and upload', hours: 0.4, scales: 'fixed' },
]
export const LAB7_TEAM_HOURS = Math.round(LAB7_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10
/** The size ratio of a three-person team's record (its minimums were reduced in proportion all term; A21 item 4). */
export const THREE_PERSON_ITEM_RATIO = 0.75
