// Week 11 activity 3 (B11.4; pure): review item discrepancy (RID) writer.
// RB-17 scores RIDs on correctness (a real defect, with location (ID) and the violated criterion or source, 17.1),
// significance (severity assigned sensibly; at least 2 RIDs on semantics or traceability, 17.2) and actionability (a
// concrete fix, 17.3). The Week 12 review asks for at least 5 RIDs; the L11 practice round on Team K asks for 3. The screens below are HEURISTICS that catch
// the common ways a RID falls short of those criteria; they cannot judge whether the defect is real (17.1) — the
// instructor does. The RID ID format, the severity scale and the categories are COURSE CONVENTIONS (Week 11 lesson),
// not taken from a source.
import { ownerProblem } from '../../components/ProvenanceOwnerFields'
import { READINGS } from '../../content/readings'
import { RUBRICS } from '../../content/rubrics'
import { loadJSON } from '../../lib/storage'
import type { ElementProvenance } from '../../model/engineering'

export type Severity = 'major' | 'minor' | 'editorial'
export type Category = 'validity' | 'semantics' | 'traceability' | 'completeness' | 'conventions'

export const SEVERITIES: { id: Severity; label: string; meaning: string }[] = [
  { id: 'major', label: 'Major', meaning: 'The model is wrong or inconsistent with its sources, misses a checkpoint minimum, or breaks a thread. Must be fixed by the CP5 submission.' },
  { id: 'minor', label: 'Minor', meaning: 'The model is valid and consistent, but incomplete or weak where a later checkpoint depends on it.' },
  { id: 'editorial', label: 'Editorial', meaning: 'Naming, layout or documentation; no change of meaning.' },
]
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'validity', label: 'Validity (checker error or warning)' },
  { id: 'semantics', label: 'Semantics (what the model asserts)' },
  { id: 'traceability', label: 'Traceability (links, IDs, threads)' },
  { id: 'completeness', label: 'Completeness (minimums, ConOps coverage)' },
  { id: 'conventions', label: 'Conventions (names, packages, docs)' },
]

export type Rid = {
  id: string
  location: string
  criterion: string
  category: Category | ''
  severity: Severity | ''
  discrepancy: string
  fix: string
  owner?: string
  provenance?: ElementProvenance
}

export const blankRid = (id = ''): Rid => ({ id, location: '', criterion: '', category: '', severity: '', discrepancy: '', fix: '' })

const COURSE_ID = /\b(?:ENT|EXT|STK|CON|NEED|MGO|CAP|SCN|REQ-STK|REQ-SYS|MOE|MOP|TPM|TECH|ALT|CRIT|DEC|FN|LOG|PHY|IF|INFO|AI|VER|[AROU])-\d{3}\b/
const QUALIFIED = /[A-Za-z_'][\w' -]*::[\w']/
const DOTTED = /\b[a-z]\w*\.(?:[a-z]\w*|'[^']+')/
const CAMEL = /\b[a-z]+[A-Z][A-Za-z0-9]*\b/
// UpperCamel element names (ForecastClear, VertiportWeatherStates); a few product and method names are not elements.
const UPPER_CAMEL = /\b[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+\b/g
const NOT_ELEMENTS = new Set(['AeroLink', 'SysML', 'ConOps', 'OnOff', 'PowerPoint', 'GitHub', 'JavaScript', 'TypeScript'])
const QUOTED = /'[^']{2,}'|`[^`]{2,}`/
const STEP = /\b(?:step|steps)\s+\d+\b|\bA\d+\b/i
const LINE = /\b(?:line|lines)\s+\d+\b|\bl\.\s?\d+\b/i
// A construct word followed by a plain lowercase name: "state hold", "transitions open_hold", "action liftHold".
const CONSTRUCT_NAME = /\b(?:state|action|transition|decision|decide|merge|fork|join|node|part|port|attribute|item|accept|perform|exhibit)s?\s+([a-z_][A-Za-z0-9_]*)\b/gi
const NOT_NAMES = new Set(['machine', 'machines', 'model', 'models', 'diagram', 'definition', 'definitions', 'def', 'package', 'flow', 'flows', 'usage', 'usages', 'view', 'is', 'are', 'was', 'were', 'be', 'the', 'a', 'an', 'of', 'in', 'on', 'and', 'or', 'that', 'which', 'with', 'to', 'for', 'from', 'has', 'have', 'it', 'its', 'this', 'these', 'those', 'needs', 'need', 'should', 'could', 'can', 'must', 'does', 'do', 'not', 'no', 'name', 'names', 'here', 'there', 'as', 'at', 'by'])
const upperCamelElement = (s: string) => [...s.matchAll(UPPER_CAMEL)].some((m) => !NOT_ELEMENTS.has(m[0]))
const constructName = (s: string) => [...s.matchAll(CONSTRUCT_NAME)].some((m) => !NOT_NAMES.has(m[1].toLowerCase()))
/**
 * Something a reader can find: a course ID, a qualified or dotted name, a SysML-style name (lowerCamel or UpperCamel),
 * a quoted name, a construct word with a name ("state hold"), a step, an alternate flow or a line.
 */
export const hasSpecific = (s: string) => [COURSE_ID, QUALIFIED, DOTTED, CAMEL, QUOTED, STEP, LINE].some((r) => r.test(s)) || upperCamelElement(s) || constructName(s)

// Criteria that exist. RB criteria come from the course rubrics; page and slide numbers must lie in a registered reading.
const RUBRIC_CRITERIA = new Set(RUBRICS.flatMap((r) => r.parts.flatMap((p) => (p.type === 'table' ? p.rows.map((row) => (row[0] ?? '').trim()).filter((x) => /^\d{1,2}\.\d$/.test(x)).map((x) => `RB-${x}`) : []))))
const pageInRegister = (src: string, page: number) => {
  const s = src.toUpperCase()
  const rs = /^S\d{2}$/.test(s) ? READINGS.filter((r) => r.source === s) : READINGS.filter((r) => r.id.toUpperCase() === s)
  return rs.some((r) => page >= r.firstPage && page <= r.lastPage)
}
const RB_REF = /\bRB-(\d{1,2})\.(\d)\b/g
const PAGE_REF = /\b(S\d{2}|R\d{2}[a-c]?)\s*,?\s*(?:pp?\.|pages?|sl\.|slides?)\s?(\d+)/gi
const OTHER_CRITERION = [
  /\bSCN-\d{3}\b.*(?:\bsteps?\s+\d+|\bA\d+\b|\bmain flow\b|\btrigger\b|\bend state\b)/i,
  /\bREQ-(?:STK|SYS)-\d{3}\b/,
  /\bC\.2 rule \d\b/i,
  /\bL1[01] (?:minimum|task \d)\b/i,
]
export type CriterionCheck = { ok: boolean; problem?: string }
/** A named criterion that exists: a rubric criterion of the course rubrics, a registered page or slide, a ConOps item, a requirement or a lab rule. */
export function checkCriterion(crit: string): CriterionCheck {
  const rbs = [...crit.matchAll(RB_REF)].map((m) => `RB-${m[1]}.${m[2]}`)
  const badRb = rbs.filter((x) => !RUBRIC_CRITERIA.has(x))
  if (badRb.length) return { ok: false, problem: `${badRb.join(', ')} is not a criterion of the course rubrics; check the rubric (e.g. RB-8.5, RB-17.2).` }
  const pages = [...crit.matchAll(PAGE_REF)].map((m) => ({ src: m[1], page: Number(m[2]) }))
  const badPages = pages.filter((x) => !pageInRegister(x.src, x.page))
  if (badPages.length) return { ok: false, problem: `${badPages.map((x) => `${x.src} ${x.page}`).join(', ')}: no reading in the course register holds that page or slide; check the number.` }
  const ok = rbs.length > 0 || pages.length > 0 || OTHER_CRITERION.some((x) => x.test(crit))
  return ok ? { ok } : { ok, problem: 'Name the criterion or source the model violates: a rubric criterion (RB-8.5, not just RB-8), a page or slide (S06 p.146, S10 sl.38, S10 slide 54), a ConOps item (SCN-005 A2), a requirement ID, or a lab rule (C.2 rule 1, L11 minimum). “Best practice” is not a criterion.' }
}

// A discrepancy must say, in one clause, WHAT is wrong (a defect cue) and WHERE (a specific element). "not" counts only
// when it does not hedge ("not fully", "not complete" are vague).
const DEFECT_CUE = /\b(?:no|never|none|nothing|missing|without|cannot|can't|unreachable|contradicts?|inconsistent|duplicates?|twice|neither|overlap\w*|dead end|stalls?|lacks?|absent|reversed|swapped|instead of|unlinked|untyped|unbound|below|fewer than|more than one|exceeds?)\b|\bnot\b(?!\s+(?:fully|very|quite|completely|entirely|complete|aligned|clear|good|great|ideal|enough|optimal))/i
const CLAUSES = /[.;:!?](?:\s+|$)|\s+(?:but|so|whereas|because)\s+/i
const VAGUE = /\b(?:could|can|should|might) be (?:improved|better|clearer|more \w+)|\bneeds? (?:more )?(?:improvement|detail|work|attention)\b|\bnot (?:very )?(?:good|great|clear|ideal)\b|\bseems? (?:off|odd|wrong)\b|\b(?:some|several|various) issues\b|\bnot (?:fully|completely|entirely)\b|\bincomplete\b|\bnot complete\b|\bdoes(?:n't| not) (?:fully )?(?:reflect|capture|represent|match|align with)\b|\b(?:proper|properly|appropriate|appropriately|accordingly|as needed|as required)\b|\bworks? as (?:intended|expected)\b|\bmore (?:complete|detailed|robust)\b/i
const FIX_VERB = /\b(add|remove|delete|replace|rename|retype|move|split|merge|bind|redefine|insert|change|connect|declare|reorder|swap|route|retarget|type|subset|exhibit|perform|model|link|guard|set|give|make|import)\b/i
// The construct the fix changes (plurals accepted), or a code fragment (a semicolon or :>).
const CONSTRUCT = /\b(transitions?|states?|successions?|decide|decisions?|merges?|forks?|joins?|else|guards?|accepts?|send|exhibits?|performs?|actions?|flows?|ports?|interfaces?|satisfy|allocat\w*|entry|exit|attributes?|doc|short names?|subsets?|redefin\w*|items?|use cases?|include|actors?|subject|imports?|triggers?)\b|:>|;/i

export type RidCheck = { field: keyof Rid | 'set'; ok: boolean; message: string }

export function checkRid(r: Rid): RidCheck[] {
  const c: RidCheck[] = []
  const add = (field: RidCheck['field'], ok: boolean, message: string) => c.push({ field, ok, message })
  add('id', /^RID-[A-Z0-9]{1,6}-\d{2}$/.test(r.id.trim()), /^RID-[A-Z0-9]{1,6}-\d{2}$/.test(r.id.trim()) ? 'ID in the course form.' : 'Use the course form RID-<reviewing team>-<nn>, e.g. RID-T3-01.')
  const loc = r.location.trim()
  add('location', hasSpecific(loc), hasSpecific(loc) ? 'Location names an element the owner can find.' : 'Name the element: its ID (e.g. SCN-005) or qualified name (e.g. Behavior::VertiportWeatherStates), and a line if useful. “The state machine” or “the behaviour package” cannot be found in a large model.')
  const crit = checkCriterion(r.criterion.trim())
  add('criterion', crit.ok, crit.ok ? 'Names a criterion or source that exists.' : crit.problem!)
  add('category', r.category !== '', r.category ? 'Category set.' : 'Choose a category (RB-17.2 counts semantics and traceability RIDs).')
  add('severity', r.severity !== '', r.severity ? 'Severity set.' : 'Choose a severity (course scale: major, minor, editorial).')
  const d = r.discrepancy.trim()
  const words = d.split(/\s+/).filter(Boolean).length
  const concrete = d.split(CLAUSES).some((cl) => DEFECT_CUE.test(cl) && hasSpecific(cl))
  const dOk = words >= 8 && concrete
  add('discrepancy', dOk,
    words < 8 ? 'State the discrepancy in a full sentence: what the model says and what it should say.'
      : dOk ? 'States a specific discrepancy.'
        : VAGUE.test(d) ? 'This says the model is incomplete or could be better, not what is wrong. State what is there and what is missing, unreachable or contradictory, naming the element.'
          : !hasSpecific(d) ? 'Point at the specific element, step, alternate flow or line where the discrepancy is.'
            : 'In the same sentence as the element, say what is wrong (missing, contradicts, unreachable, never, no transition enters …), not only what the model contains.')
  const x = r.fix.trim()
  const fOk = FIX_VERB.test(x) && CONSTRUCT.test(x) && hasSpecific(x) && !VAGUE.test(x)
  add('fix', fOk,
    !FIX_VERB.test(x) ? 'Propose a concrete change (add, remove, replace, retarget, …), not “fix it” or “update accordingly”.'
      : !CONSTRUCT.test(x) ? 'Say which modelling construct changes (transition, decide/else, exhibit, perform, succession, …).'
        : !hasSpecific(x) ? 'Name the elements involved, so the owner can make the change without guessing.'
          : VAGUE.test(x) ? 'Make the fix specific: say what the element becomes, not “proper”, “accordingly” or “more detail”.'
            : 'A concrete, checkable fix.')
  if (r.category === 'conventions' && r.severity === 'major') add('severity', false, 'A conventions finding rated major: RB-17.2 asks for sensible severities; naming and layout are usually editorial unless they break an ID or a reference.')
  if (r.category === 'validity' && r.severity !== '' && r.severity !== 'major') add('severity', false, 'A checker error blocks CP4 acceptance (RB-8.1): rate it major. (A warning that is explained may be minor.)')
  return c
}

export const ridOk = (r: Rid) => checkRid(r).every((x) => x.ok)

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Set screens. `min` is the count the context asks for: 3 for the practice round on Team K, 5 for the Week 12 review. */
export function checkRidSet(rids: Rid[], min = 5): RidCheck[] {
  const c: RidCheck[] = []
  const ids = rids.map((r) => r.id.trim())
  const dup = ids.filter((x, i) => x && ids.indexOf(x) !== i)
  c.push({ field: 'set', ok: rids.length >= min, message: `${rids.length} RID(s): this set asks for at least ${min}.` })
  const sig = rids.filter((r) => r.category === 'semantics' || r.category === 'traceability').length
  c.push({ field: 'set', ok: sig >= 2, message: `${sig} on semantics or traceability: RB-17.2 level 4 asks for at least 2.` })
  c.push({ field: 'set', ok: dup.length === 0, message: dup.length ? `Duplicate RID IDs: ${[...new Set(dup)].join(', ')}.` : 'RID IDs are unique.' })
  const pairs = rids.map((r) => `${norm(r.location)}|${norm(r.criterion)}`)
  const twins = pairs.filter((p, i) => pairs.indexOf(p) !== i)
  const texts = rids.map((r) => norm(r.discrepancy))
  const sameText = texts.filter((t, i) => t && texts.indexOf(t) !== i)
  c.push({ field: 'set', ok: twins.length === 0 && sameText.length === 0, message: twins.length ? 'Two RIDs share a location and a criterion: merge them or make each specific.' : sameText.length ? 'Two RIDs state the same discrepancy: one finding is one RID.' : 'No two RIDs repeat a finding.' })
  const unowned = rids.filter((r) => ownerProblem(r.owner ?? '') !== null).map((r) => r.id || '(no ID)')
  c.push({ field: 'set', ok: unowned.length === 0, message: unowned.length ? `RIDs without the writer’s initials: ${unowned.join(', ')}.` : 'Every RID records its writer.' })
  const incomplete = rids.filter((r) => !ridOk(r)).map((r) => r.id || '(no ID)')
  c.push({ field: 'set', ok: incomplete.length === 0, message: incomplete.length ? `RIDs with open screen messages: ${incomplete.join(', ')}.` : 'Every RID passes the screens.' })
  return c
}

/** The practice round on Team K's fragment (L11 Session 2): three RIDs, the number the lab's practice round produces. */
export const PRACTICE_TARGET = 3

/**
 * Distinct findings: RIDs that pass every screen and record a writer, counted once per location+criterion and once per
 * discrepancy text. Saving one RID several times under new IDs therefore counts once.
 */
export function distinctFindings(rids: Rid[]): Rid[] {
  const seen = new Set<string>()
  const out: Rid[] = []
  for (const r of rids) {
    if (!ridOk(r) || ownerProblem(r.owner ?? '') !== null) continue
    const k1 = `loc:${norm(r.location)}|${norm(r.criterion)}`
    const k2 = `txt:${norm(r.discrepancy)}`
    if (seen.has(k1) || seen.has(k2)) continue
    seen.add(k1)
    seen.add(k2)
    out.push(r)
  }
  return out
}

/** Gate for the instructor's RIDs and for the tools' results on Team K's draft: your own distinct findings first. */
export function practiceUnlock(rids: Rid[]): { ok: boolean; count: number; message: string } {
  const count = distinctFindings(rids).length
  const ok = count >= PRACTICE_TARGET
  return { ok, count, message: ok ? `${count} distinct practice RIDs: the tools’ results on Team K’s draft and the instructor’s RIDs are open.` : `${count} of ${PRACTICE_TARGET} distinct practice RIDs (each passing the screens, with its own location, criterion and discrepancy). Write your own findings from the listing first; the tools’ results on Team K’s draft and the instructor’s RIDs open at ${PRACTICE_TARGET}.` }
}

/** Storage keys: the practice round and the Week 12 peer review are separate lists with separate exports (W11-F22). */
export const PRACTICE_STORE = 'w11-rids-practice'
export const REVIEW_STORE = 'w11-rids-week12'
export const LEGACY_STORE = 'w11-rids'
/** Team K's flow lives in its own store, so loading it never touches the student's own SCN-005 draft (W11-F12). */
export const TEAM_K_FLOW_STORE = 'w11-flow-teamk'
/** The practice RIDs as saved by the RID writer (read by the coverage tool and the walker for the gate). */
export const practiceRids = (): Rid[] => loadJSON<Rid[]>(PRACTICE_STORE, loadJSON<Rid[]>(LEGACY_STORE, []))

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
export function ridMarkdown(rids: Rid[]): string {
  return [
    '| RID | Location | Criterion / source | Category | Severity | Discrepancy | Proposed fix | Writer | Provenance |',
    '|---|---|---|---|---|---|---|---|---|',
    ...rids.map((r) => `| ${cell(r.id)} | ${cell(r.location)} | ${cell(r.criterion)} | ${r.category} | ${r.severity} | ${cell(r.discrepancy)} | ${cell(r.fix)} | ${cell(r.owner ?? '')} | ${r.provenance ?? ''} |`),
  ].join('\n')
}

/**
 * Instructor model RIDs on the seeded fragment sysml/week11/aerolink_review_fragment_team_k.sysml (answer key).
 * They must pass the screens (AUTHORING_GUIDE §7 rule 4). Line numbers refer to that file.
 */
export const MODEL_RIDS: Rid[] = [
  { id: 'RID-IN-01', location: "Behavior::'SCN-005' lines 29-30 (declareHold, flagVertiport)", criterion: 'SCN-005 main flow steps 1-2; RB-8.5', category: 'semantics', severity: 'major', discrepancy: 'declareHold (step 2) comes before flagVertiport (step 1): the ConOps order of steps 1-2 is reversed, so the hold is declared before AeroLink has flagged V3.', fix: 'Swap the two actions: first start; then flagVertiport; then declareHold; then decide holdScope.', owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-02', location: "Behavior::'SCN-005' lines 34-35 (suspendNetwork then notifyPassengers)", criterion: 'SCN-005 A2 (Scenario ends); RB-8.5', category: 'semantics', severity: 'major', discrepancy: 'A2 ends the scenario, but suspendNetwork rejoins the main flow at notifyPassengers (step 5) and so reaches passengersRespond and liftHold; the A2 steps to land airborne flights and offer public transport (EXT-005) are missing.', fix: 'Replace the succession suspendNetwork then notifyPassengers with then action landAtNearestOpen; then action offerPublicTransport; then done;', owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-03', location: "Behavior::'SCN-005' lines 37-40 (decide alternateCheck, divertNearest)", criterion: 'SCN-005 A1 (rejoin at step 5); S10 sl.38', category: 'semantics', severity: 'major', discrepancy: 'divertNearest has no outgoing succession, so A1 never rejoins at step 5 and the flow stalls; alternateCheck has no else, and both guards can be true or both false, so the priority-landing branch of A1 is missing.', fix: 'Add then notifyPassengers after divertNearest; make the guards exclusive (if alternateOpen then acceptRevisedIntents; if (not alternateOpen) and alternateWithinReserve then divertNearest;) and add else declarePriorityLanding; with action declarePriorityLanding; then notifyPassengers;', owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-04', location: "Logical::logicalArchitecture.'LOG-001' line 18; Behavior::'SCN-005'.acceptRevisedIntents", criterion: 'RB-8.5 (linked to structure); reference perform LOG-001 → FN-012', category: 'traceability', severity: 'major', discrepancy: 'acceptRevisedIntents subsets FN-012, but no logical part performs FN-012: LOG-001 has no perform, so the step is not linked to any performer.', fix: "Add perform Logical::'FN-012'; to the part 'LOG-001' flightOperations.", owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-05', location: 'Behavior::VertiportWeatherStates lines 54-57 (state hold, state closedForDay)', criterion: 'S06 p.146 (transitions activate states); SCN-005 A3', category: 'semantics', severity: 'major', discrepancy: 'No transition enters closedForDay and it is not the initial state, so it can never be active and the A3 case (hold longer than 2 h) is not modelled; the one transition out of closedForDay (line 57, accept ForecastClear then open) contradicts its doc, which says bookings are cancelled for the rest of the day.', fix: 'Add private import SI::*; to the package; add accept after 2 [h] then closedForDay; directly after line 55, so that its source is hold (a relative time trigger); replace line 57 with accept OperatingDayStart then open; and declare attribute def OperatingDayStart; next to ForecastClear.', owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-06', location: "Behavior::vertiportWeatherStates line 59; Physical::aeroLink.'PHY-002' line 63", criterion: 'L11 minimum (every state usage exhibited by a part); RB-8.5; S10 sl.56', category: 'traceability', severity: 'major', discrepancy: 'The state usage vertiportWeatherStates is not exhibited by any part, so the model does not say which element has these states; PHY-002 vertiports has no exhibit, which is below the L11 minimum and breaks the thread from the states to an element.', fix: "Add exhibit Behavior::vertiportWeatherStates; inside part <'PHY-002'> vertiports.", owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-07', location: "Behavior::'SCN-005' line 45 (liftHold; no node for A3)", criterion: 'SCN-005 A3 (Scenario ends); RB-8.5', category: 'completeness', severity: 'major', discrepancy: 'The flow has no branch for A3 (the hold lasts longer than 2 h): passengersRespond always leads to liftHold, so there is no path that cancels the remaining bookings to V3, and the ConOps alternate is missing.', fix: 'Insert decide holdDuration after passengersRespond with if holdOverTwoHours then cancelRemainingBookings; else liftHold; declare attribute holdOverTwoHours : Boolean; and add action cancelRemainingBookings; then done;', owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-08', location: 'Behavior::VertiportWeatherStates lines 50-58', criterion: 'L11 minimum (≥ 4 states and ≥ 5 transitions)', category: 'completeness', severity: 'major', discrepancy: 'VertiportWeatherStates, the only state definition in Team K’s draft, has 3 states and 3 transitions, below the L11 minimum of 4 states and 5 transitions; the aircraft operating-state definition the L11 task asks for is missing.', fix: 'Add the aircraft operating-state definition the L11 task asks for (≥ 4 states, ≥ 5 named transitions, exhibited by the aircraft part), and add the transitions of RID-IN-05 and RID-IN-09 to VertiportWeatherStates (4 states, 6 transitions).', owner: 'IN', provenance: 'team-derived' },
  { id: 'RID-IN-09', location: 'Behavior::VertiportWeatherStates line 55 (accept ForecastClear then open, source hold)', criterion: 'SCN-005 step 7', category: 'semantics', severity: 'major', discrepancy: 'State hold returns to open as soon as ForecastClear is accepted, without the 30 min back inside limits that step 7 requires before the hold is lifted, so V3 can reopen up to 30 min early.', fix: 'Replace line 55 with accept ForecastClear then clearing; add state clearing; followed by accept after 30 [min] then open; and accept LimitForecast then hold; (this needs the SI import of RID-IN-05).', owner: 'IN', provenance: 'team-derived' },
]

/** Model RIDs whose symptom the Week 11 tools also report on Team K's draft (W11-F14); the rest are found only by reading. */
export const TOOL_VISIBLE_RIDS = ['RID-IN-01', 'RID-IN-02', 'RID-IN-03', 'RID-IN-05', 'RID-IN-07', 'RID-IN-08']
