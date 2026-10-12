// Problems rules engine (WORKBENCH_SPEC §3). Pure: rules read the student's model and the week's artefacts and return
// problems; the dock, the model-browser status dots, the status bar and the impact diff all read the same list.
// Core rules wrap the existing validators (engineering.ts validateModel, stakeholderValidation.ts) so no check is
// duplicated; weeks add their own rules through their missions module (src/content/missions/weekNN.ts).
import type { Citation } from '../content/readings'
import { validateModel, type EngineeringModel, type Issue } from '../model/engineering'
import { validateStakeholderMap } from '../model/stakeholderValidation'
import type { Relationship, Stakeholder } from '../model/airtaxi'
import { ownerProblem } from '../components/ProvenanceOwnerFields'

export type Severity = 'error' | 'warning' | 'info'

export type Problem = {
  ruleId: string
  severity: Severity
  /** Model-browser element the problem is about (selecting the problem selects it). */
  elementId?: string
  message: string
  hint: string
  cite?: Citation
}

export type RuleCtx = {
  week: number
  /** Week artefacts that are not engineering elements (e.g. Week 1 student causal loops), keyed `wNN.name`. */
  artefacts: Record<string, unknown>
  /** Boundary-exercise classifications (AppState). */
  boundary: Record<string, string>
  stakeholders: Stakeholder[]
  relationships: Relationship[]
}

export type Rule = {
  id: string
  /** The most severe problem the rule can raise. */
  severity: Severity
  /** First week in which the rule applies. */
  fromWeek: number
  objective?: string
  title: string
  check: (model: EngineeringModel, ctx: RuleCtx) => Problem[]
}

export const SEVERITY_ORDER: Record<Severity, number> = { error: 0, warning: 1, info: 2 }
export const SEVERITY_LABEL: Record<Severity, string> = { error: 'Error', warning: 'Warning', info: 'Info' }

const ISSUE_HINT: Record<string, string> = {
  'duplicate-id': 'Every element ID is unique and never reused (lab plan §C.2). Retire the duplicate and create a new element.',
  'bad-id': 'IDs follow PREFIX-nnn (REQ-STK-nnn / REQ-SYS-nnn for requirements).',
  'retired-no-reason': 'Record why the element was retired so the history stays auditable.',
  'duplicate-link': 'Link IDs are unique; remove the duplicate link.',
  'dangling-link': 'A link must connect two existing elements. Remove it or restore the missing element.',
  'link-not-allowed': 'Only the ten course relationship types between the allowed kinds are valid (engineering.ts LINK_RULES).',
  'self-link': 'An element cannot be related to itself.',
  'link-to-retired': 'Links to retired elements should be removed or re-pointed to the replacement element.',
}

function issueElement(model: EngineeringModel, i: Issue): string | undefined {
  return i.ids.find((id) => model.elements.some((e) => e.id === id)) ?? i.ids[0]
}

/** validateModel (engineering.ts): IDs, link rules and referential integrity. */
export const modelIntegrityRule: Rule = {
  id: 'model-integrity',
  severity: 'error',
  fromWeek: 1,
  title: 'Model integrity (IDs, allowed links, references)',
  check: (model) =>
    validateModel(model).map((i) => ({
      ruleId: 'model-integrity',
      severity: i.severity,
      elementId: issueElement(model, i),
      message: i.message,
      hint: ISSUE_HINT[i.code] ?? 'See the model integrity rules in engineering.ts.',
    })),
}

/** Stakeholder-map referential integrity applies from Week 1 (the map is open early). */
export const stakeholderIntegrityRule: Rule = {
  id: 'stakeholder-integrity',
  severity: 'error',
  fromWeek: 1,
  title: 'Stakeholder relationships refer to existing stakeholders',
  check: (_m, ctx) =>
    validateStakeholderMap(ctx.stakeholders, ctx.relationships)
      .filter((c) => c.id === 'integrity' && !c.passed)
      .map((c) => ({ ruleId: 'stakeholder-integrity', severity: 'error' as const, message: `${c.label}: ${c.detail}`, hint: 'Delete the dangling relationship in the stakeholder editor.' })),
}

/** The L2 / CP1 acceptance checks (stakeholderValidation.ts) become warnings once Week 2 starts. */
export const stakeholderMapRule: Rule = {
  id: 'stakeholder-map',
  severity: 'warning',
  fromWeek: 2,
  objective: 'B2.2',
  title: 'Stakeholder ecosystem map acceptance checks (Lab L2 / CP1)',
  check: (_m, ctx) =>
    validateStakeholderMap(ctx.stakeholders, ctx.relationships)
      .filter((c) => c.id !== 'integrity' && !c.passed)
      .map((c) => ({ ruleId: 'stakeholder-map', severity: 'warning' as const, message: `${c.label} — ${c.detail}`, hint: `Acceptance criterion from ${c.source}.` })),
}

const STUDENT_PROVENANCE = new Set(['team-derived', 'team-assumption', 'AI-suggested-reviewed', 'cited'])

/** AUTHORING_GUIDE §7.1: every element a student records carries owner initials (individual accountability). */
export const ownerRule: Rule = {
  id: 'owner-initials',
  severity: 'warning',
  fromWeek: 1,
  title: 'Student-recorded elements name an owner',
  check: (model) =>
    model.elements
      .filter((e) => e.status === 'active' && e.kind !== 'STK' && STUDENT_PROVENANCE.has(e.provenance) && ownerProblem(e.owner ?? ''))
      .map((e) => ({
        ruleId: 'owner-initials',
        severity: 'warning' as const,
        elementId: e.id,
        message: `${e.id} has no owner initials`,
        hint: 'Enter the owner’s initials (2–4 letters) in Properties. Every recorded element names its owner (syllabus §12).',
      })),
}

export const CORE_RULES: Rule[] = [modelIntegrityRule, stakeholderIntegrityRule, stakeholderMapRule, ownerRule]

/** Runs every rule that applies to `ctx.week`; problems are sorted by severity, then element. */
export function runRules(rules: Rule[], model: EngineeringModel, ctx: RuleCtx): Problem[] {
  return rules
    .filter((r) => r.fromWeek <= ctx.week)
    .flatMap((r) => r.check(model, ctx))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || (a.elementId ?? '').localeCompare(b.elementId ?? ''))
}

/** Worst severity per element, for the status dots in the model browser. */
export function worstByElement(problems: Problem[]): Record<string, Severity> {
  const out: Record<string, Severity> = {}
  for (const p of problems) {
    if (!p.elementId) continue
    const cur = out[p.elementId]
    if (!cur || SEVERITY_ORDER[p.severity] < SEVERITY_ORDER[cur]) out[p.elementId] = p.severity
  }
  return out
}

export function countBySeverity(problems: Problem[]): Record<Severity, number> {
  return {
    error: problems.filter((p) => p.severity === 'error').length,
    warning: problems.filter((p) => p.severity === 'warning').length,
    info: problems.filter((p) => p.severity === 'info').length,
  }
}

/** Stable identity of a problem, used by the impact diff. */
export const problemKey = (p: Problem) => `${p.ruleId}|${p.elementId ?? ''}|${p.message}`
