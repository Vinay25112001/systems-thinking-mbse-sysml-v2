// Week 1 lab brief: the single source of the Team Record minimums, the need form and the course need gate, read by the
// Session 2 lecture (lab-brief slide, figures, notes), the lab instructions (src/content/lab/week01Lab.ts), the lab tool
// (src/workbench/week1/team.ts, needQuality.ts) and their consistency test (labBrief.test.ts). Sign-off review
// 2026-10-19 (M1, M2, M3, Mo1): the lecture is the authoritative teaching source; the tool and the lab read it from here.
// Pure data, no imports, so that both the content and the workbench layers may depend on it.

/** The recommended need form (S2-09). SEBoK recommends that needs use a format different from requirements, "such as"
 *  "The stakeholders need the system to" (R11 p.555): an example, not the only valid form. Faculty final review
 *  (DECISION_LOG A21, provisional decision 2): the course teaches and recommends this form; a valid need in another
 *  phrasing is accepted, with advice (needQuality.ts). */
export const NEED_FORM = 'The [stakeholders] need the [system] to …'

/** The course gate: six minimum checks every need in the Team Record must pass (S2-09, course convention). The order and
 *  the short labels are the lecture's; the tool's self-check (needQuality.ts SELF_CHECK) uses the same IDs and labels. */
export const NEED_GATE = [
  { id: 'form', short: 'stated as a need, not a requirement' },
  { id: 'solution-free', short: 'no design' },
  { id: 'attributed', short: 'attributed to a registered stakeholder' },
  { id: 'traced', short: 'traced to its concern' },
  { id: 'condition', short: 'a condition' },
  { id: 'rationale', short: 'a rationale' },
] as const
export type NeedGateId = (typeof NEED_GATE)[number]['id']
/** The gate as one sentence, exactly as the lecture states it. */
export const NEED_GATE_TEXT = NEED_GATE.map((g) => g.short).join('; ')

/** Need priority: MITRE's categories (R65 p.325: "mandatory, critical, desirable, or optional"; "It is up to the SE to
 *  define each priority"), written there for requirements and applied to needs as a course convention. MITRE's
 *  "high, medium, or low" on the same page is an example scale for a different attribute, business value, so it is not
 *  used for priority. One vocabulary for the lecture, the AeroLink case, the lab tool, its exports, the lab and the quiz
 *  (faculty final review, A21 item 1). The definitions are the course's. */
export const NEED_PRIORITIES = ['mandatory', 'critical', 'desirable', 'optional'] as const
export type NeedPriority = (typeof NEED_PRIORITIES)[number]
export const NEED_PRIORITY_LABEL: Record<NeedPriority, string> = { mandatory: 'Mandatory', critical: 'Critical', desirable: 'Desirable', optional: 'Optional' }
export const NEED_PRIORITY_DEFINITION: Record<NeedPriority, string> = {
  mandatory: 'Imposed by an approving authority, an agreement or safety: the service may not operate without it.',
  critical: 'The mission fails or is badly degraded without it; it is traded only with the sponsor’s agreement.',
  desirable: 'Adds clear value; it can be reduced or deferred under budget or schedule pressure.',
  optional: 'A nice-to-have that stakeholders can live without; the first to go.',
}
/** Records made before A21 used high / medium / low. They still load, mapped to the nearest category; "mandatory" is
 *  never inferred, because only an approving authority, an agreement or safety can impose it. */
export const LEGACY_PRIORITY: Record<string, NeedPriority> = { high: 'critical', medium: 'desirable', low: 'optional' }

/** What a PRT ID names (M2): one meaning everywhere, chosen for the Week 8 SysML v2 import, where each PRT seeds a part
 *  usage owned by the system-of-interest's part definition. */
export const PRT_MEANING = 'an element inside the boundary of the system of interest'
export const PRT_SHORT = 'part inside the system-of-interest boundary'

/** Team Record minimums (S2-18, course convention). Three-person teams: the needs minimum the lecture proposes for
 *  them (six needs from four stakeholders), pending faculty approval (WEEK1_LEARNING_DESIGN.md §10). */
export const LAB_MINIMUMS = {
  inside: 3,
  context: 6,
  stakeholders: 8,
  roleGroups: 3,
  relationships: 3,
  conflicts: 1,
  needs: 8,
  needSources: 5,
} as const
export const LAB_MINIMUMS_THREE = { needs: 6, needSources: 4 } as const

/** The ID prefixes the Week 1 charter assigns to owners (S1 charter figure: R&C owns STK, CON, NEED; Architecture owns
 *  ENT, PRT, EXT and usually REL). MGO (the mission and goals) is recorded in Part 2 under the ENT owner. */
export const WEEK1_PREFIXES = ['ENT', 'PRT', 'EXT', 'STK', 'CON', 'NEED', 'REL'] as const

/** Relationship types between stakeholders (the AeroLink register's seven kinds, aerolinkCase.ts RELATIONSHIP_VERB). */
export const REL_TYPES = ['regulates', 'funds', 'supplies', 'affected-by', 'partners-with', 'coordinates-with', 'conflicts-with'] as const
export type RelType = (typeof REL_TYPES)[number]
export const REL_VERB: Record<RelType, string> = {
  regulates: 'regulates',
  funds: 'funds',
  supplies: 'supplies',
  'affected-by': 'is affected by',
  'partners-with': 'partners with',
  'coordinates-with': 'coordinates with',
  'conflicts-with': 'conflicts with',
}
