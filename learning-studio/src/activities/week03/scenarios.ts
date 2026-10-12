// Week 3 — ConOps scenario builder logic (pure).
// Acceptance rules: L3 (LABORATORY_AND_CAPSTONE_PLAN.md Part B) asks for three scenarios (nominal, weather,
// charging/maintenance), each with actors, preconditions, steps, alternate flows and an end state, and "each scenario
// has ≥ 1 alternate flow"; RB-2.4 level 2 is "nominal only, or steps without actors".
// Source basis: a use case is a goal-oriented set of interactions between external actors and the system; a primary
// actor has the goal; the interaction is a sequence of simple steps; scenarios run from a trigger event to the goal
// (success) or fall short of it (failure) (R59 p.453–454). Use cases specify intent, not user-interface or
// implementation detail (R59 p.454), and UI detail in use-case text is a listed pitfall (R59 p.455).
// A ConOps includes scenarios of use in the user's environment, including internal and external factors (R52 p.301).
// System of interest for scenarios (course convention, stated in the lesson): AeroLink's operational system — aircraft,
// booking, scheduling and dispatch systems and operations-support tools. People, including operations-centre staff, are
// users outside it, so they can be actors (R59 p.453). A natural factor such as weather (EXT-003) does not act: it is
// recorded as an environment item, which the builder links with "affects" instead of "performs".
import type { Citation } from '../../content/readings'
import type { Element, EngineeringModel } from '../../model/engineering'

export const SYSTEM_ACTOR = 'AeroLink (system of interest)'

export const SCENARIO_KINDS = [
  { id: 'nominal', label: 'Nominal' },
  { id: 'weather', label: 'Weather disruption' },
  { id: 'charging', label: 'Charging' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'other', label: 'Other' },
] as const
export type ScenarioKind = (typeof SCENARIO_KINDS)[number]['id']

/** Official S04 Lab 7 scenario names and IDs (lab plan C.2). */
export const OFFICIAL_SCENARIOS: { id: string; name: string; kind: ScenarioKind }[] = [
  { id: 'SCN-001', name: 'Passenger Ride Request', kind: 'nominal' },
  { id: 'SCN-002', name: 'Passenger Transport Mission', kind: 'nominal' },
  { id: 'SCN-003', name: 'Aircraft Charging', kind: 'charging' },
  { id: 'SCN-004', name: 'Maintenance Event', kind: 'maintenance' },
  { id: 'SCN-005', name: 'Weather Disruption', kind: 'weather' },
]

export type Step = { actor: string; action: string }
export type AltFlow = { atStep: number; condition: string; steps: string; outcome: 'rejoin' | 'end'; rejoinAt?: number }
export type ScenarioDraft = {
  official: string
  name: string
  kind: ScenarioKind | ''
  /** Actors chosen from the model (STK/EXT IDs) and free-text actors. */
  actorIds: string[]
  /** Model actors that are environmental factors (e.g. EXT-003 Weather): listed, linked by "affects", never a step actor. */
  environment?: string[]
  otherActors: string
  primaryActor: string
  trigger: string
  preconditions: string
  steps: Step[]
  alternates: AltFlow[]
  successEnd: string
  failureEnd: string
  capabilities: string[]
}

export const emptyScenario = (): ScenarioDraft => ({
  official: '', name: '', kind: '', actorIds: [], environment: [], otherActors: '', primaryActor: '', trigger: '', preconditions: '',
  steps: [{ actor: '', action: '' }], alternates: [], successEnd: '', failureEnd: '', capabilities: [],
})

export const splitList = (s: string) => s.split(/[;,]/).map((x) => x.trim()).filter(Boolean)
export const actorsOf = (d: ScenarioDraft) => [...d.actorIds, ...splitList(d.otherActors)]
/** Actors that can perform steps: every actor except environmental factors. */
export const performersOf = (d: ScenarioDraft) => actorsOf(d).filter((a) => !(d.environment ?? []).includes(a))
/** Suggest the environment flag for model actors that are natural factors (instructor heuristic; the student decides). */
export const looksEnvironmental = (name: string, text = '') => /\b(weather|wind|natural|climate|environment)\b/i.test(`${name} ${text}`)

/** User-interface and implementation terms that do not belong in operational scenario steps (R59 p.454–455). */
const UI_TERMS = /\b(clicks?|taps?|swipes?|buttons?|screens?|drop-?downs?|menus?|pop-?ups?|log ?in|web ?page|page|database|sql|api|server|json)\b/i

export type Finding = { id: string; ok: boolean; message: string; cite?: Citation }

export function checkScenario(d: ScenarioDraft): Finding[] {
  const actors = actorsOf(d)
  const performers = performersOf(d)
  const allowed = new Set([...performers, SYSTEM_ACTOR])
  const steps = d.steps.filter((s) => s.action.trim() || s.actor.trim())
  const stepsWithoutActor = steps.map((s, i) => (!s.actor.trim() || !allowed.has(s.actor) ? i + 1 : 0)).filter(Boolean)
  const altIssues = d.alternates
    .map((a, i) => {
      const p: string[] = []
      if (!Number.isInteger(a.atStep) || a.atStep < 1 || a.atStep > steps.length) p.push('branches from a step that does not exist')
      if (!a.condition.trim()) p.push('has no condition')
      if (!a.steps.trim()) p.push('has no steps')
      if (a.outcome === 'rejoin' && (!a.rejoinAt || a.rejoinAt < 1 || a.rejoinAt > steps.length)) p.push('rejoins at a step that does not exist')
      return p.length ? `A${i + 1} ${p.join(', ')}` : ''
    })
    .filter(Boolean)
  const uiSteps = [...steps.map((s) => s.action), ...d.alternates.map((a) => a.steps)].filter((t) => UI_TERMS.test(t))
  return [
    { id: 'name', ok: !!d.name.trim() && !!d.kind, message: d.name.trim() && d.kind ? 'Named and typed.' : 'Give the scenario a name and a type (nominal, weather, charging, maintenance).' },
    { id: 'actors', ok: performers.length >= 2 && !!d.primaryActor && performers.includes(d.primaryActor), message: performers.length < 2 ? 'List the actors who take part (at least two besides AeroLink itself; an environmental factor does not count).' : !d.primaryActor || !performers.includes(d.primaryActor) ? 'Choose the primary actor — the one whose goal the scenario serves — from the actor list (not an environmental factor).' : `${actors.length} actors; primary actor ${d.primaryActor}.`, cite: { reading: 'R59', pages: '453' } },
    { id: 'trigger', ok: d.trigger.trim().length > 0, message: d.trigger.trim() ? 'Trigger stated.' : 'State the trigger event that starts the scenario.', cite: { reading: 'R59', pages: '453' } },
    { id: 'preconditions', ok: d.preconditions.trim().length > 0, message: d.preconditions.trim() ? 'Preconditions stated.' : 'State the preconditions: what is true before the trigger (system state, environment).' },
    { id: 'steps', ok: steps.length >= 3 && steps.every((s) => s.action.trim()), message: steps.length >= 3 ? 'Main flow has at least three steps.' : 'Write the main flow as at least three simple steps.', cite: { reading: 'R59', pages: '453' } },
    { id: 'step-actors', ok: steps.length > 0 && stepsWithoutActor.length === 0, message: stepsWithoutActor.length ? `Step(s) ${stepsWithoutActor.join(', ')} have no actor from the actor list, or are given to an environmental factor (RB-2.4: steps without actors score 2).` : 'Every step names its actor.' },
    { id: 'alternates', ok: d.alternates.length >= 1 && altIssues.length === 0, message: d.alternates.length === 0 ? 'Add at least one alternate or exception flow (L3 acceptance).' : altIssues.length ? `${altIssues.join('; ')}.` : `${d.alternates.length} alternate flow(s), each with a branch step, condition and outcome.` },
    { id: 'end-states', ok: !!d.successEnd.trim() && !!d.failureEnd.trim(), message: d.successEnd.trim() && d.failureEnd.trim() ? 'Success and failure/degraded end states stated.' : 'State both end states: the goal reached, and the state when it falls short.', cite: { reading: 'R59', pages: '453–454' } },
    { id: 'no-ui', ok: uiSteps.length === 0, message: uiSteps.length ? `Interface or implementation detail in: “${uiSteps[0]}”. Scenarios state intent, not the interface.` : 'No interface or implementation detail in the steps.', cite: { reading: 'R59', pages: '454–455' } },
    { id: 'traced', ok: d.capabilities.some((c) => /^CAP-\d{3}$/.test(c)), message: d.capabilities.length ? `Exercises ${d.capabilities.join(', ')}.` : 'Trace the scenario to the capability (CAP) it exercises.' },
  ]
}

export const scenarioAcceptable = (d: ScenarioDraft) => checkScenario(d).every((f) => f.ok)

/** Serialise a draft to the attribute shape used by the reference scenarios (src/model/reference/week03.ts). */
export function toScenarioAttributes(d: ScenarioDraft): Record<string, string> {
  const steps = d.steps.filter((s) => s.action.trim())
  return {
    kind: d.kind,
    official: d.official,
    actors: [`${d.primaryActor} (primary)`, ...actorsOf(d).filter((a) => a !== d.primaryActor).map((a) => ((d.environment ?? []).includes(a) ? `${a} (environment)` : a))].join('; '),
    trigger: d.trigger.trim(),
    preconditions: d.preconditions.trim(),
    mainFlow: steps.map((s, i) => `${i + 1}. ${s.actor}: ${s.action.trim()}`).join(' '),
    alternateFlows: d.alternates
      .map((a, i) => `A${i + 1} (step ${a.atStep}): ${a.condition.trim()} - ${a.steps.trim()}${a.outcome === 'rejoin' ? ` Rejoin at step ${a.rejoinAt}.` : ' Scenario ends.'}`)
      .join(' '),
    endState: `Success: ${d.successEnd.trim()} Failure/degraded: ${d.failureEnd.trim()}`,
  }
}

/** Infer a scenario's type from its attributes or its name (reference scenarios carry no `kind`). */
export function kindOf(e: Element): ScenarioKind {
  const k = e.attributes?.kind
  if (typeof k === 'string' && SCENARIO_KINDS.some((s) => s.id === k)) return k as ScenarioKind
  const n = e.name.toLowerCase()
  if (n.includes('weather')) return 'weather'
  if (n.includes('charg')) return 'charging'
  if (n.includes('mainten')) return 'maintenance'
  if (n.includes('transport') || n.includes('nominal') || n.includes('ride')) return 'nominal'
  return 'other'
}

const FIELDS = ['actors', 'trigger', 'preconditions', 'mainFlow', 'alternateFlows', 'endState'] as const

/** L3 coverage over the scenarios in the workspace: the three required types, each scenario with all six parts. */
export function scenarioCoverage(m: EngineeringModel) {
  const scns = m.elements.filter((e) => e.kind === 'SCN' && e.status === 'active')
  const kinds = new Set(scns.map(kindOf))
  const incomplete = scns.filter((s) => FIELDS.some((f) => !String(s.attributes?.[f] ?? '').trim())).map((s) => s.id)
  return {
    count: scns.length,
    nominal: kinds.has('nominal'),
    weather: kinds.has('weather'),
    chargingOrMaintenance: kinds.has('charging') || kinds.has('maintenance'),
    incomplete,
    ok: kinds.has('nominal') && kinds.has('weather') && (kinds.has('charging') || kinds.has('maintenance')) && incomplete.length === 0,
  }
}

/**
 * The SCN-005 worked example as a draft (the lesson's worked example (c); values FICTIONAL). Recorded through
 * toScenarioAttributes it equals the reference SCN-005 (src/model/reference/week03.ts; test-asserted).
 */
export const WORKED_SCN005: ScenarioDraft = {
  official: 'SCN-005',
  name: 'Weather Disruption',
  kind: 'weather',
  actorIds: ['STK-001', 'STK-008', 'EXT-001', 'EXT-003'],
  environment: ['EXT-003'],
  otherActors: 'Operations centre duty manager',
  primaryActor: 'Operations centre duty manager',
  trigger: 'The forecast for a vertiport crosses a weather limit within the next 30 min (limits TBD-01, U-001).',
  preconditions: 'Flights are scheduled and some are airborne; weather data are received for all six vertiports; alternates and the 20 % energy reserve policy are in force.',
  steps: [
    { actor: SYSTEM_ACTOR, action: 'Flags vertiport V3 as approaching its weather limits and lists the affected departures, arrivals and airborne flights.' },
    { actor: 'Operations centre duty manager', action: 'Declares a weather hold for V3: no departures to or from V3.' },
    { actor: 'STK-008', action: 'Diverts each airborne flight bound for V3 to its planned alternate within the energy reserve.' },
    { actor: 'EXT-001', action: 'Accepts the revised flight intents for the diverted flights.' },
    { actor: SYSTEM_ACTOR, action: 'Notifies affected passengers of a new boarding time, an alternate vertiport or a refund.' },
    { actor: 'STK-001', action: 'Each affected passenger accepts a new time or vertiport, or takes the refund.' },
    { actor: 'Operations centre duty manager', action: 'Lifts the hold when the forecast has been back inside limits for 30 min; the backlog is re-timed.' },
  ],
  alternates: [
    { atStep: 3, condition: 'conditions at the alternate also approach limits while the aircraft is airborne', steps: 'Divert to the nearest open vertiport within the reserve; if none is reachable within the reserve, declare a priority landing with the ANSP.', outcome: 'rejoin', rejoinAt: 5 },
    { atStep: 2, condition: 'two or more vertiports reach limits (region-wide event)', steps: 'Suspend all departures network-wide; land airborne flights at the nearest open vertiport; offer passengers public transport (EXT-005).', outcome: 'end' },
    { atStep: 7, condition: 'the hold lasts longer than 2 h', steps: 'Cancel the remaining bookings to V3 for the day and refund; reposition aircraft for the next morning.', outcome: 'end' },
  ],
  successEnd: 'All aircraft on the ground or safely diverted; no flight dispatched outside limits; the backlog flown within the day.',
  failureEnd: 'Service at V3 suspended for the day with every affected passenger re-accommodated or refunded and no flight outside limits.',
  capabilities: ['CAP-005'],
}

/**
 * Rebuild a builder draft from a recorded scenario (the attribute format written by toScenarioAttributes), so that a
 * scenario recorded by any route, including the instructor reference, can be run through checkScenario. Capabilities
 * come from the scenario's derives-from links. Returns undefined parts as empty strings, which the checks then flag.
 */
export function draftFromScenario(e: Element, m: EngineeringModel): ScenarioDraft {
  const a = e.attributes ?? {}
  const str = (k: string) => String(a[k] ?? '')
  const tokens = splitList(str('actors').replace(/,/g, ' '))
  let primary = ''
  const environment: string[] = []
  const names = tokens.map((t) => {
    const p = t.match(/^(.*) \(primary\)$/)
    if (p) { primary = p[1].trim(); return primary }
    const env = t.match(/^(.*) \(environment\)$/)
    if (env) { environment.push(env[1].trim()); return env[1].trim() }
    return t
  })
  const isModelId = (x: string) => /^(STK|EXT)-\d{3}$/.test(x)
  const steps: Step[] = [...str('mainFlow').matchAll(/(\d+)\. ([^:]+?): (.*?)(?= \d+\. [^:]+?: |$)/g)].map((x) => ({ actor: x[2].trim(), action: x[3].trim() }))
  const alternates: AltFlow[] = str('alternateFlows')
    .split(/ (?=A\d+ \(step \d+\): )/)
    .map((chunk) => chunk.trim().match(/^A\d+ \(step (\d+)\): (.*?) - (.*?)(?: Rejoin at step (\d+)\.| (Scenario ends)\.)$/))
    .filter((x): x is RegExpMatchArray => !!x)
    .map((x) => ({ atStep: Number(x[1]), condition: x[2], steps: x[3], outcome: x[4] ? ('rejoin' as const) : ('end' as const), ...(x[4] ? { rejoinAt: Number(x[4]) } : {}) }))
  const end = str('endState').match(/^Success: (.*?) Failure\/degraded: (.*)$/)
  const kind = kindOf(e)
  return {
    official: str('official'),
    name: e.name,
    kind,
    actorIds: names.filter(isModelId),
    environment,
    otherActors: names.filter((x) => !isModelId(x)).join('; '),
    primaryActor: primary,
    trigger: str('trigger'),
    preconditions: str('preconditions'),
    steps,
    alternates,
    successEnd: end?.[1] ?? '',
    failureEnd: end?.[2] ?? '',
    capabilities: m.links.filter((l) => l.source === e.id && l.type === 'derives-from' && /^CAP-\d{3}$/.test(l.target)).map((l) => l.target),
  }
}
