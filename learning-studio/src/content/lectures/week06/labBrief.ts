// Week 6 lab brief: the single source of the Lab L6 minimums, the horizons, the technology status categories, the
// development approaches, the hard gates and advisories, the parts and the person-hours. Read by the Week 6 lectures
// (session1.ts, session2.ts), the AeroLink case (aerolinkCase.ts), the lab instructions (src/content/lab/week06Lab.ts), the
// lab tool (src/workbench/week6/*) and their tests. Pure data, no imports, so both the content and the workbench layers may
// depend on it.
//
// Review status: new-pending-review. Minimums, the roadmap lanes, the record fields and the person-hours are course
// conventions, pending faculty approval; the three-person minimums follow DECISION_LOG A21 provisional decision 4
// (workload proportional to team size).
//
// Gates are designed against the recurring defect of Weeks 2, 4 and 5 (a tool that rejects valid input for its form):
//   - every HARD GATE names, in `taught`, the slide (or lesson section) and the exact phrase a STUDENT can read there that
//     makes a failure a real defect. Faculty notes do not count (they are stripped from the student build); labBrief.test
//     in src/content/lab/week06Lab.test.ts asserts that each phrase occurs in the student-visible text of that slide or of
//     that session's lesson;
//   - every free-text gate asks for the shortest answer the lecture calls complete, and says so in its own text: one word
//     where a word is an answer ("Cutover", "None", "Approved"), an ID where an ID is the answer ("U-002", "A-003");
//   - no gate tests a name's form, its length beyond one word, its capitalization or its vocabulary; one-word names, proper
//     nouns and IDs are valid; anything that is only a sign of a likely defect is an ADVISORY, shown and never blocking;
//   - against the opposite defect (over-relaxation, Week 5 confirmation N1): an answer that says nothing ("n/a", "none",
//     "?", "-", "later", "TBD"; the shared src/workbench/emptyAnswer.ts) never counts where an answer is required, and
//     EMPTY_ANSWER_RULE says so to the student; the only exceptions are the ones a gate text names ("None" for the security
//     and resilience change, "TBD" for a capability level).
// src/workbench/week6/record.test.ts asserts the short valid answers both ways.
//
// Sources checked for this file (page text in _source_cache/*.txt):
//   - capability gaps and excesses against needs; near-, mid- and far-term buckets (SEBoK R12 p.862);
//   - a technology plan: what is available now, in development (with maturity levels) or does not yet exist; immature
//     technologies get a risk and a mitigation plan; at a minimum the technologies, maturation trend, insertion points,
//     investments and dependencies (MITRE R105 pp.529–530);
//   - off-ramps: a contingency plan to use mature technology if a technology is not developed successfully (DoD R46 p.126);
//   - TBX management names the work, the owner and the closure (SEBoK R13 p.565);
//   - transition is a process: plan, implement, operate and maintain (MITRE R107 p.448);
//   - security cannot be added by retrofit (SEBoK R25 p.1231); resilience means avoid, withstand, recover (R24 p.1203).

/** The empty-answer rule as the student reads it (Laboratory page, lab instructions, lab tool). */
export const EMPTY_ANSWER_RULE =
  'A one-word answer counts wherever the lecture calls a word complete, but an answer that says nothing (“n/a”, “none”, “?”, “-”, “later”, “TBD”) never counts where an answer is required: it names no owner, no trigger and no mitigation. The two exceptions are stated in their gates: “None” is a complete security and resilience change, and “TBD” or “none” is a valid capability level, as long as the other level of the same gap is stated.'

// ---------------------------------------------------------------------------------------------------- minimums
/** Lab L6 minimums for a team of four (course convention, Session 2 lab brief). Increments count the baseline. */
export const LAB6_MINIMUMS = {
  gaps: 4,
  technologies: 3,
  /** Increments, the baseline (increment 0) included. */
  increments: 4,
  unknowns: 4,
  /** New or changed AROU items (risks, opportunities, assumptions) linked to an increment. */
  arou: 1,
} as const

/** A three-person team: per-item minimums reduced in proportion (A21 provisional decision 4, pending confirmation). The
 *  out-of-class load per person stays within 0.1 h of a team of four (week6Path.ts THREE_PERSON computes it; tested). */
export const LAB6_MINIMUMS_THREE = {
  gaps: 3,
  technologies: 2,
  increments: 3,
  unknowns: 3,
  arou: 1,
} as const
export type Lab6Minimums = { [K in keyof typeof LAB6_MINIMUMS]: number }

/** Lab L6 out of class in person-hours for a team of four (course estimate, outline §5.7, to be checked against logged
 *  hours). `scales` says which minimum the task grows with ('increments' scales with the non-baseline increments). Every
 *  method step has a row. */
export const LAB6_PERSON_HOURS: { id: string; task: string; hours: number; scales: 'gaps' | 'technologies' | 'increments' | 'unknowns' | 'fixed' }[] = [
  { id: 'gaps', task: 'baseline and capability gaps over three horizons', hours: 1.2, scales: 'gaps' },
  { id: 'technology', task: 'technology plan from the Week 3 readiness assessment, with insertion points', hours: 1.4, scales: 'technologies' },
  { id: 'increments', task: 'increments: content, trigger, dependencies, off-ramp, approach, transition, security and resilience', hours: 3.0, scales: 'increments' },
  { id: 'unknowns', task: 'known unknowns and the AROU update, transition risks included', hours: 1.4, scales: 'unknowns' },
  { id: 'impact', task: 'impact list of one increment across the Weeks 1–5 IDs', hours: 0.9, scales: 'fixed' },
  { id: 'review', task: 'Phase I baseline review, one row per week, for Week 7', hours: 0.9, scales: 'fixed' },
  // 0.8 → 0.6 (Week 6 confirmation N4): the lab tool's Markdown export already generates the roadmap grid's text
  // equivalent (record.ts roadmapGrid in recordMarkdown), so the team draws the graphic but no longer writes its text by hand.
  { id: 'integration', task: 'roadmap graphic (its text equivalent is generated by the tool), AI usage statement and integration', hours: 0.6, scales: 'fixed' },
]
export const LAB6_TEAM_HOURS = Math.round(LAB6_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10

// ---------------------------------------------------------------------------------------------------- vocabulary
export type HorizonId = 'near' | 'mid' | 'far'
/** The three planning horizons (SEBoK's near-, mid- and far-term time buckets, R12 p.862). Each team states its own
 *  bucket lengths; AeroLink's are in aerolinkCase.ts. */
export const HORIZONS: { id: HorizonId; label: string }[] = [
  { id: 'near', label: 'Near term' },
  { id: 'mid', label: 'Mid term' },
  { id: 'far', label: 'Far term' },
]
export const horizonLabel = (h: string) => HORIZONS.find((x) => x.id === h)?.label ?? h

export type TechStatus = 'available' | 'in-development' | 'not-existing'
/** MITRE's three questions of a technology plan (R105 p.529): available now, in development with its maturity level, or
 *  not yet existing. */
export const TECH_STATUSES: { id: TechStatus; label: string }[] = [
  { id: 'available', label: 'Available now' },
  { id: 'in-development', label: 'In development' },
  { id: 'not-existing', label: 'Does not yet exist' },
]
export const techStatusLabel = (s: string) => TECH_STATUSES.find((x) => x.id === s)?.label ?? s

export type ApproachId = 'sequential' | 'incremental' | 'evolutionary' | 'agile'
/** Development approaches (SEBoK R108 pp.391–393). They describe how one increment is DEVELOPED, not the roadmap. */
export const APPROACHES: { id: ApproachId; label: string; when: string }[] = [
  { id: 'sequential', label: 'Sequential', when: 'requirements well known, familiar domain, manageable risk' },
  { id: 'incremental', label: 'Incremental', when: 'a sequence of increments of growing capability; room for emerging technology' },
  { id: 'evolutionary', label: 'Evolutionary', when: 'start from a limited set of requirements; each cycle adds value and understanding' },
  { id: 'agile', label: 'Agile', when: 'iterative and incremental delivery, often combined with the others' },
]
export const approachLabel = (a: string) => APPROACHES.find((x) => x.id === a)?.label ?? a

export type ArouKind = 'risk' | 'opportunity' | 'assumption'
export const AROU_KINDS: { id: ArouKind; label: string }[] = [
  { id: 'risk', label: 'Risk' },
  { id: 'opportunity', label: 'Opportunity' },
  { id: 'assumption', label: 'Assumption' },
]
/** Risk categories, as in the Week 3 register (week03/labBrief.ts RISK_CATEGORIES), repeated here so that this module
 *  keeps no imports. */
export const RISK_CATEGORIES = ['technology', 'performance', 'schedule-cost', 'external', 'safety', 'security', 'resilience'] as const
export const SECURITY_OR_RESILIENCE = /security|resilience/i

/** The maturity TRL at and above which a technology counts as mature enough for a near-term insertion in the course rule
 *  (DoD practice quoted by MITRE: threshold capabilities met with TRL below 6 are not treated as threshold, R60 p.526). */
export const MATURE_TRL = 6

/** The four lanes of the course roadmap (course convention; no held source gives a roadmap template). */
export const LANES = ['Capability', 'Technology', 'Architecture and interfaces', 'Operations and people'] as const

// ---------------------------------------------------------------------------------------------------- gates
/** Where a student can read the sentence that makes a gate failure a real defect: a slide id of a Week 6 session (body,
 *  aside, caption or alt text) or that session's lesson, and the exact phrase. */
export type Taught = { session: 1 | 2; slide: string; phrase: string }
/** A gate or advisory row. `basis` explains the gate (with its source); `taught` locates the student-visible phrase.
 *  Advisories carry no `taught`: they never block. The gate-justification table is generated from these rows. */
export type GateRow = { id: string; short: string; basis: string; taught?: Taught }

export const PART_ORDER = ['gaps', 'technology', 'increments', 'unknowns', 'review'] as const

export const GAP_GATES = [
  { id: 'statement', short: 'what is short or in excess (one word is enough: “Capacity”)', basis: 'A gap is the difference between a desired and a baseline capability (SEBoK R12 p.862); an unnamed gap cannot be served by an increment.', taught: { session: 1, slide: 'w6s1-gaps', phrase: 'Compare the desired capability with the baseline' } },
  { id: 'levels', short: 'the desired level and the baseline level (a number, a word or “TBD” each; at least one of the two stated, not both “TBD” or “none”)', basis: 'The desired levels of capability are compared with the baseline to find the gaps (SEBoK R12 p.862): a gap with no levels, or with neither level stated, states no comparison.', taught: { session: 1, slide: 'w6s1-gaps', phrase: 'Compare the desired capability with the baseline' } },
  { id: 'kind', short: 'gap or excess (a gap: baseline below the desired level; an excess: baseline above it)', basis: 'The comparison determines both capability gaps and points of excess capability (SEBoK R12 p.862); the two lead to different changes (add, or divest). Slack on a limit that does not bind is not an excess.', taught: { session: 1, slide: 'w6s1-gaps', phrase: 'Gap: baseline below desired; excess: baseline above it' } },
  { id: 'horizon', short: 'its horizon: near, mid or far term', basis: 'Projected gaps are mapped into future time buckets, near-, mid- and far-term (SEBoK R12 p.862).', taught: { session: 1, slide: 'w6s1-gaps', phrase: 'near-, mid- and far-term' } },
  { id: 'source', short: 'the need, objective, capability or requirement behind it: an ID in the record', basis: 'Desired levels come from the needs assessment (SEBoK R12 p.862); a gap that traces to no need is a feature wish (the first common error).', taught: { session: 1, slide: 'w6s1-gaps', phrase: 'Desired levels come from the needs' } },
] as const satisfies readonly GateRow[]

export const TECH_GATES = [
  { id: 'name', short: 'its name (one word is enough)', basis: 'A technology plan identifies all technology brought to bear (MITRE R105 p.530); an unnamed row cannot be planned.', taught: { session: 1, slide: 'w6s1-plan-contents', phrase: 'every technology brought to bear' } },
  { id: 'status', short: 'its status: available now, in development, or does not yet exist', basis: 'A plan determines which technologies are available now, which are in development and which do not yet exist (MITRE R105 p.529).', taught: { session: 1, slide: 'w6s1-plan-contents', phrase: 'available now, in development, or not yet existing' } },
  { id: 'trl', short: 'a TRL from 1 to 9 (not needed when it does not yet exist)', basis: 'Technologies in development are listed with their maturity levels (MITRE R105 p.529); TRL wording as in Week 3 (SEBoK R16 p.767).', taught: { session: 1, slide: 'w6s1-plan-contents', phrase: 'with their maturity levels' } },
  { id: 'basis', short: 'the evidence or the labeled assumption behind the TRL (an ID is enough: “A-003”; “TBD” is not a basis)', basis: 'Week 3 rule kept: a TRL rests on cited evidence or an explicitly labeled assumption; the TRL is a claim to be checked (SEBoK R16 pp.767–768).', taught: { session: 1, slide: 'w6s1-maturity-limits', phrase: 'Every TRL rests on evidence or a labeled assumption' } },
  { id: 'insertion', short: 'its insertion point: the increment that brings it in, or the reason it is not inserted (one word is enough)', basis: 'At a minimum a technology plan identifies insertion points (MITRE R105 p.530); a technology with neither an increment nor a reason is unplanned.', taught: { session: 1, slide: 'w6s1-plan-contents', phrase: 'Insertion point: the increment that brings it in' } },
  { id: 'risk', short: 'if it is immature (below TRL 6, in development or not yet existing): a risk ID or a mitigation (one word is enough)', basis: 'Appropriate risk should be assigned to technologies assessed as immature, with mitigation plans (MITRE R105 p.530).', taught: { session: 1, slide: 'w6s1-plan-contents', phrase: 'Immature technologies carry a risk and a mitigation' } },
] as const satisfies readonly GateRow[]

export const TECH_ADVISORIES = [
  { id: 'near-immature', short: 'inserted in a near-term increment below TRL 6: “no technology before its time”; give the evidence that makes the timing safe, or move it', basis: 'Advisory: a near-term increment can carry a technology still maturing when an off-ramp exists, so the timing is a judgment the team defends.' },
  { id: 'trl-changed', short: 'the TRL differs from your Week 3 readiness assessment: say what new evidence changed it', basis: 'Advisory: maturity can change between Week 3 and Week 6 with new evidence; only the team knows whether it did.' },
  { id: 'not-in-week3', short: 'this TECH ID is not in the Week 3 record you loaded: check the ID, or it is a new technology', basis: 'Advisory: a new technology is valid in Week 6; the tool only flags it so that a typing slip is caught.' },
] as const satisfies readonly GateRow[]

/** Gates for the baseline increment (increment 0): its "as is" content only. */
export const BASELINE_GATES = [
  { id: 'content', short: 'the “as is” baseline in a few words, plus any change already decided (the baseline trajectory; one word is enough)', basis: 'Every roadmap starts from an honest “as is”; an enterprise architecture holds snapshots of the current and target environments (MITRE R109 pp.131–132), and SEBoK’s baseline includes capability already planned (R12 p.860), so a committed change is not planned again as an increment.', taught: { session: 2, slide: 'w6s2-baseline', phrase: 'Every roadmap starts from an honest “as is”' } },
] as const satisfies readonly GateRow[]

export const INCREMENT_GATES = [
  { id: 'name', short: 'its name (one word is enough)', basis: 'An increment is a unit of planned change; an unnamed increment cannot be referenced by a trigger, an unknown or a dependency.', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Each increment: content, entry trigger, dependencies, off-ramp, transition' } },
  { id: 'horizon', short: 'its horizon: near, mid or far term', basis: 'The roadmap lays increments out over the near-, mid- and far-term horizons (SEBoK R12 p.862; course roadmap anatomy).', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Horizons: near, mid and far, each with an end state' } },
  { id: 'content', short: 'its content: what changes (one word is enough)', basis: 'Each opportunity represents an element added, dropped or changed (SEBoK R12 p.862); an increment with no content changes nothing.', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Each increment: content, entry trigger, dependencies, off-ramp, transition' } },
  { id: 'serves', short: 'the gap, need or objective it serves: a GAP, NEED, MGO, CAP or REQ ID in the record', basis: 'The roadmap is for satisfying the gaps over time (MITRE R105 p.529); a timeline of features with no gap behind it is the first common error.', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'linked to the gap, need or objective it serves' } },
  { id: 'trigger', short: 'its entry trigger: the evidence or event that starts it (one word is enough; a number or an ID is advised; “later” is not a trigger)', basis: 'Planned changes carry targets that are monitored (SEBoK R12 p.863) and progress is measured by a feedback system (MITRE R105 p.530): an increment with no trigger has nothing that says when to start.', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Each increment: content, entry trigger, dependencies, off-ramp, transition' } },
  { id: 'approach', short: 'its development approach: sequential, incremental, evolutionary or agile', basis: 'Development approaches apply to the development stage (SEBoK R108 p.391); each increment is developed by one of them, chosen for how well its requirements are known.', taught: { session: 1, slide: 'w6s1-development-approaches', phrase: 'For each increment, say which development approach fits' } },
  { id: 'transition', short: 'its transition approach: how the service keeps operating while it changes (one word is enough: “Cutover”)', basis: 'Transition is a process planned early (MITRE R107 p.448); in an enterprise the largest challenge is changing while the system remains operational (SEBoK R26 p.683).', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Each increment: content, entry trigger, dependencies, off-ramp, transition' } },
  { id: 'off-ramp', short: 'if it inserts an immature technology (below TRL 6, in development or not yet existing): its off-ramp (one word is enough: “Stay piloted”)', basis: 'A course convention built on the DoD guidebook, which lists off-ramps, a contingency plan to use mature technology if a technology is not developed successfully, among example mitigations for selected technologies (DoD R46 p.126); the course makes one required where an increment inserts an immature technology.', taught: { session: 1, slide: 'w6s1-off-ramps', phrase: 'Course rule: an increment that inserts an immature technology needs an off-ramp' } },
  { id: 'security', short: 'its security and resilience change (one word is enough: “None”, with a reason advised)', basis: 'Security cannot be made by retrofit (SEBoK R25 p.1231) and resilience is considered throughout the life cycle (R24 p.1208): each increment states what it changes in both.', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'For each increment, state its security and resilience change' } },
  { id: 'dependencies', short: 'dependencies, if any, name other increments in the record, in the same or an earlier horizon, with no cycle (none is fine)', basis: 'Opportunities have dependencies with each other and with current operations (SEBoK R12 p.862); a roadmap is an order (course roadmap convention), so a dependency on an increment that does not exist, on a later horizon, or round a cycle has no first step.', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Dependencies point back in time: a cycle has no first step' } },
] as const satisfies readonly GateRow[]

export const INCREMENT_ADVISORIES = [
  { id: 'trigger-vague', short: 'the trigger has no number, ID, comparison or event a reviewer could observe: make it measurable where you can', basis: 'Advisory: some triggers are decisions by a named authority (“the authority approves”), which are observable without a number.' },
  { id: 'security-none', short: '“None” for security and resilience with no reason: say why nothing changes (for example “no new interface”)', basis: 'Advisory: an increment can genuinely change no interface and no adversity, so the tool asks for the reason instead of blocking.' },
  { id: 'off-ramp-mature', short: 'no off-ramp: fine when every technology it inserts is mature; otherwise consider one', basis: 'Advisory: off-ramps are required only for immature technology (the hard gate); elsewhere they are good practice.' },
  { id: 'no-risk', short: 'no risk linked: an increment usually changes at least one risk', basis: 'Advisory: an increment that only removes work may genuinely link no risk.' },
] as const satisfies readonly GateRow[]

/** Advisories on a known unknown (review n3): gating the baseline is valid only while the baseline still holds a committed
 *  change to be made (AeroLink's Year-2 step), so the tool asks instead of blocking. */
export const UNKNOWN_ADVISORIES = [
  { id: 'gates-baseline', short: 'it gates the baseline: fine when the baseline still holds a committed change to be made; otherwise name the later increment it gates', basis: 'Advisory: the baseline trajectory can include a decided change not yet carried out, which an unknown can still gate (Session 1, the baseline trajectory).' },
] as const satisfies readonly GateRow[]

export const UNKNOWN_GATES = [
  { id: 'name', short: 'what is unknown (one word is enough)', basis: 'A known unknown is a parameter whose value is not yet known (a TBD) or held with low confidence (a TBR) (SEBoK R13 p.565).', taught: { session: 1, slide: 'w6s1-known-unknowns', phrase: 'impact, information needed and mitigation' } },
  { id: 'impact', short: 'its impact if it comes out badly (one word is enough)', basis: 'TBXs can lead to risk if not addressed (SEBoK R13 p.565); the course record states the impact so the increment it gates can be judged.', taught: { session: 1, slide: 'w6s1-known-unknowns', phrase: 'impact, information needed and mitigation' } },
  { id: 'need', short: 'the information needed to close it (one word is enough)', basis: 'TBX management establishes the work needed to resolve the issue (SEBoK R13 p.565).', taught: { session: 1, slide: 'w6s1-known-unknowns', phrase: 'impact, information needed and mitigation' } },
  { id: 'mitigation', short: 'the mitigation while it stays open (one word is enough; “none” is not a mitigation)', basis: 'The course record pairs each unknown with a mitigation, as a risk carries a treatment (course convention, Session 1).', taught: { session: 1, slide: 'w6s1-known-unknowns', phrase: 'impact, information needed and mitigation' } },
  { id: 'owner', short: 'its owner (a role or a person; one word is enough; “TBD” or “?” is not an owner)', basis: 'TBX management identifies the owner of the work (SEBoK R13 p.565).', taught: { session: 1, slide: 'w6s1-known-unknowns', phrase: 'names the work, the owner and the closure' } },
  { id: 'gates', short: 'the increment it gates: an increment in the record', basis: 'The course record names the increment each unknown gates, so that the roadmap shows what waits for which information (course convention, Session 1).', taught: { session: 1, slide: 'w6s1-known-unknowns', phrase: 'names the increment it gates' } },
] as const satisfies readonly GateRow[]

export const AROU_GATES = [
  { id: 'statement', short: 'what it says (one word is enough)', basis: 'Each AROU item is distinct and actionable (Week 3 rule); an empty item cannot be acted on.', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'Link each new risk to the increment that creates it' } },
  { id: 'category', short: 'for a risk: its category (as in the Week 3 register)', basis: 'The Week 3 register categorizes every risk; the security and resilience categories are how the week’s security and resilience rule is checked.', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'Link each new risk to the increment that creates it' } },
  { id: 'owner', short: 'its owner (one word is enough)', basis: 'Week 3 rule kept: every AROU item has an owner.', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'Link each new risk to the increment that creates it' } },
  { id: 'increment', short: 'the increment it belongs to: an increment in the record', basis: 'A Week 6 AROU item exists because of a planned change; linking it to its increment is what the update is for.', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'Link each new risk to the increment that creates it' } },
] as const satisfies readonly GateRow[]

/** Advisories on an AROU item (review n3). */
export const AROU_ADVISORIES = [
  { id: 'belongs-baseline', short: 'it belongs to the baseline: fine for a committed change still to be made; a transition risk counts only on a later increment', basis: 'Advisory: Week 6 AROU items exist because of planned change; the baseline can hold a committed change still in transition, so the tool asks instead of blocking.' },
] as const satisfies readonly GateRow[]

export const IMPACT_GATES = [
  { id: 'increment', short: 'one increment after the baseline', basis: 'An increment changes earlier artifacts; the impact list is drawn for one planned change (Session 2, worked example).', taught: { session: 2, slide: 'w6s2-impact', phrase: 'List the IDs an increment changes, from every earlier week' } },
  { id: 'ids', short: 'at least one affected ID that exists in your imported record', basis: 'Traceability is used to assess the impact of a change across the life cycle (SEBoK R13 p.565); IDs that resolve are what make the list checkable.', taught: { session: 2, slide: 'w6s2-impact', phrase: 'List the IDs an increment changes, from every earlier week' } },
] as const satisfies readonly GateRow[]

export const REVIEW_GATES = [
  { id: 'status', short: 'ready, or open items', basis: 'Week 7 integrates Weeks 1–6 into one package; each week’s part enters it either ready or with its open items stated.', taught: { session: 2, slide: 'w6s2-baseline-review', phrase: 'For each week, state ready or name each open item and its owner' } },
  { id: 'items', short: 'if open items: the items and who closes them (one word each is enough)', basis: 'An open item with no owner is not closed by anyone (TBX management names the owner, SEBoK R13 p.565).', taught: { session: 2, slide: 'w6s2-baseline-review', phrase: 'For each week, state ready or name each open item and its owner' } },
] as const satisfies readonly GateRow[]

export type GapGateId = (typeof GAP_GATES)[number]['id']
export type TechGateId = (typeof TECH_GATES)[number]['id']
export type TechAdvisoryId = (typeof TECH_ADVISORIES)[number]['id']
export type BaselineGateId = (typeof BASELINE_GATES)[number]['id']
export type IncrementGateId = (typeof INCREMENT_GATES)[number]['id']
export type IncrementAdvisoryId = (typeof INCREMENT_ADVISORIES)[number]['id']
export type UnknownGateId = (typeof UNKNOWN_GATES)[number]['id']
export type UnknownAdvisoryId = (typeof UNKNOWN_ADVISORIES)[number]['id']
export type ArouGateId = (typeof AROU_GATES)[number]['id']
export type ArouAdvisoryId = (typeof AROU_ADVISORIES)[number]['id']
export type ImpactGateId = (typeof IMPACT_GATES)[number]['id']
export type ReviewGateId = (typeof REVIEW_GATES)[number]['id']

/** Part-level checks that make a part incomplete (each a real defect, with its student-visible basis) and part-level
 *  advisories. */
export const PART_RULES = [
  { id: 'horizons', kind: 'gate', short: 'the three horizons each have a stated length (a word or a range is enough: “2 years”)', basis: 'Bucket lengths depend on how fast the capability changes: five, ten and twenty years for long-lasting capabilities, one, two and three for fast-changing ones (SEBoK R12 p.862); a horizon with no length cannot place a gap.', taught: { session: 1, slide: 'w6s1-gaps', phrase: 'Choose bucket lengths that fit how fast your enterprise changes' } },
  { id: 'baseline', kind: 'gate', short: 'exactly one baseline increment (increment 0)', basis: 'Every roadmap starts from one honest “as is” (MITRE R109 pp.131–132: snapshots of the current and the target environment).', taught: { session: 2, slide: 'w6s2-baseline', phrase: 'Every roadmap starts from an honest “as is”' } },
  { id: 'beyond-near', kind: 'gate', short: 'at least one increment beyond the near term', basis: 'A roadmap shows near-, mid- and far-term states; a plan that stops at the near term is a project plan, not a roadmap.', taught: { session: 2, slide: 'w6s2-anatomy', phrase: 'Horizons: near, mid and far, each with an end state' } },
  { id: 'insertion', kind: 'gate', short: 'at least one technology inserted by an increment', basis: 'The roadmap is formed from the phasing and insertion points of the technology plan (MITRE R105 p.530).', taught: { session: 1, slide: 'w6s1-plan-contents', phrase: 'Insertion point: the increment that brings it in' } },
  { id: 'security-link', kind: 'gate', short: 'at least one security or resilience risk linked to an increment (from your register or new)', basis: 'Security and resilience are integrated into Week 6: adversity occurs throughout the life cycle (SEBoK R25 p.1231).', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'at least one security or resilience risk' } },
  { id: 'transition-risk', kind: 'gate', short: 'at least one transition risk: a risk that exists only while an increment is being made', basis: 'Disruption of ongoing operations is a serious risk and the transition between configurations must be carefully planned (SEBoK R26 p.683).', taught: { session: 2, slide: 'w6s2-security-resilience', phrase: 'A transition risk exists only while the change is being made' } },
  { id: 'unique-ids', kind: 'gate', short: 'every ID once', basis: 'IDs are the import keys of Weeks 7, 13 and 14 (Session 2 lesson); a duplicated ID breaks every trace that uses it.', taught: { session: 2, slide: 'w6s2-baseline-review', phrase: 'IDs are the keys Week 7 imports' } },
  { id: 'horizon-empty', kind: 'advisory', short: 'a horizon with no increment: say why nothing changes there, or add one', basis: 'Advisory: a mature enterprise may plan nothing in one horizon on purpose.' },
  { id: 'no-excess', kind: 'advisory', short: 'no excess recorded: look for idle capacity as well as gaps', basis: 'Advisory: an enterprise may genuinely have no excess capability.' },
  { id: 'no-week3', kind: 'advisory', short: 'your Week 3 record is not loaded: the tool cannot compare TRLs with your readiness assessment or continue your TECH and U numbering', basis: 'Advisory: the Week 5 export does not carry the Week 3 technology table, and the Week 3 file is optional.' },
] as const

// ---------------------------------------------------------------------------------------------------- parts
/** The parts the Week 6 work adds to the Team Record (outline §5.5; Week 5 added Parts 19–22). */
export const WEEK6_PARTS = [
  { n: 23, id: 'gaps', title: 'Baseline and capability gaps over three horizons' },
  { n: 24, id: 'technology', title: 'Technology plan and insertion points' },
  { n: 25, id: 'increments', title: 'Increments, triggers and transition' },
  { n: 26, id: 'unknowns', title: 'Known unknowns, AROU update, security and resilience' },
  { n: 27, id: 'review', title: 'Impact of one increment and the Phase I baseline review' },
] as const

/** The ID prefixes Week 6 adds to the record, the canonical artifact type each maps to (CANONICAL_ENGINEERING_DATA_MODEL.md
 *  §2.1 and §5), and the lead role that owns it (course convention). GAP is a proposed nested row (no artifact type yet). */
export const WEEK6_PREFIXES = [
  { prefix: 'INC', type: 'INC (roadmap increment; INC precedes INC; INC delivers CAP/REQ/PHY/CMP/FN/TECH)', owner: 'Architecture' },
  { prefix: 'TECH', type: 'TECH (technology assessed; insertion is the INC delivers TECH relationship)', owner: 'AI & Data Management (Architecture in a team of three)' },
  { prefix: 'U', type: 'U (unknown; U affects INC)', owner: 'Verification & Validation' },
  { prefix: 'R / O / A', type: 'R, O, A (AROU; R affects INC)', owner: 'Verification & Validation' },
  { prefix: 'GAP', type: 'nested gap rows of the roadmap (proposed prefix; no canonical artifact type yet)', owner: 'Requirements & Compliance' },
] as const

/** Weeks whose parts the Phase I baseline review covers (Week 6 itself is reviewed in Week 7). */
export const REVIEW_WEEKS = [1, 2, 3, 4, 5] as const
