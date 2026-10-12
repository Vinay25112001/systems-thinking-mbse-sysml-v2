// Week 3 — mission, goals and objectives (MGO) recorder logic (pure).
// Source basis (R10 p.543–546): SEBoK has FOUR levels. The mission states why the project and system of interest
// exist; goals are elaborated from the mission and divide it into manageable pieces; objectives are elaborated from
// the goals and say in more detail what must be done; measures are quantitative metrics (MOE) used to validate the
// system against the objectives. SEBoK's own example objectives are qualitative ("Receive finished home brew coffee
// within minutes upon request") and the quantity sits in a separate measure ("within 2 minutes", p.546).
// COURSE CONVENTION (not SEBoK's): the recorder stores each objective together with its measure (MOE), a numeric
// target, a unit and a horizon, so that RB-2.1 ("measurable objectives traced to stakeholder concerns") can be checked.
// The horizon rule, the concern-trace rule (direct, or inherited through the parent goal) and the vague-word lists are
// instructor-authored; R10 says nothing about horizons or concern traces.
import type { Citation } from '../../content/readings'
import { kindOfId, type EngineeringModel } from '../../model/engineering'

export type MgoLevel = 'mission' | 'goal' | 'objective'
export type MgoDraft = {
  level: MgoLevel | ''
  name: string
  text: string
  /** Parent MGO (goal → mission, objective → goal). */
  parent: string
  /** Concerns (CON) or stakeholders (STK) the statement answers. */
  concerns: string[]
  /** The measure (MOE in SEBoK's terms) that validates the objective; course convention: recorded with it. */
  measure: string
  target: string
  unit: string
  horizon: string
}

export const blankMgo = (): MgoDraft => ({ level: '', name: '', text: '', parent: '', concerns: [], measure: '', target: '', unit: '', horizon: '' })

/** Puffery in a statement: nobody can observe it, at any level. SEBoK's objectives may be qualitative, but specific. */
const PUFFERY = /\b(excellent|world-class|best-in-class|user-friendly|seamless|state-of-the-art|optimal|high-quality|outstanding|superior)\b/i
/** A measure must name a quantity, not a direction or an aspiration. */
const VAGUE_MEASURE = /\b(minimi[sz]e|maximi[sz]e|optimi[sz]e|as (soon|quickly|fast|much|little|high|low) as possible)\b/i

export type MgoFinding = { id: string; ok: boolean; message: string; cite?: Citation }

/**
 * `parentLevel` is the level of the chosen parent; `inheritedConcerns` are the CON/STK items the parent goal traces to
 * (both looked up by the caller from the model). An objective may answer a concern directly or through its goal.
 */
export function checkMgo(d: MgoDraft, parentLevel?: MgoLevel, inheritedConcerns: string[] = []): MgoFinding[] {
  const words = d.text.trim().split(/\s+/).filter(Boolean).length
  const f: MgoFinding[] = [
    { id: 'basic', ok: !!d.level && !!d.name.trim() && words >= 6, message: !d.level ? 'Choose the level: mission, goal or objective.' : !d.name.trim() ? 'Give it a short name.' : words < 6 ? 'Write the statement in full (at least six words).' : 'Level, name and statement present.' },
  ]
  if (d.level === 'goal' || d.level === 'objective') {
    const want: MgoLevel = d.level === 'goal' ? 'mission' : 'goal'
    f.push({
      id: 'parent',
      ok: parentLevel === want,
      message: parentLevel === want ? `Elaborated from a ${want}.` : `A ${d.level} is elaborated from a ${want} (SEBoK): choose its parent ${want}.`,
      cite: { reading: 'R10', pages: '543' },
    })
  }
  const puff = d.text.match(PUFFERY)?.[0]
  f.push({ id: 'vague', ok: !puff, message: puff ? `“${puff}” cannot be observed by anyone. Say what the stakeholder experiences (SEBoK’s example objective: “receive finished home brew coffee within minutes upon request”).` : 'No unobservable wording.', cite: puff ? { reading: 'R10', pages: '546' } : undefined })
  if (d.level === 'objective') {
    const target = Number(d.target)
    const vagueMeasure = d.measure.match(VAGUE_MEASURE)?.[0]
    const measurable = !!d.measure.trim() && !vagueMeasure && d.target.trim() !== '' && Number.isFinite(target) && !!d.unit.trim()
    f.push(
      {
        id: 'measure',
        ok: measurable,
        message: measurable
          ? `Measure (MOE): ${d.measure.trim()}, target ${target} ${d.unit.trim()}.`
          : vagueMeasure
            ? `“${vagueMeasure}” is a direction, not a measure: name the quantity that will be measured.`
            : 'Course rule (RB-2.1): record the objective with its measure (SEBoK’s MOE, a quantitative metric), a numeric target and a unit.',
        cite: { reading: 'R10', pages: '544' },
      },
      { id: 'horizon', ok: d.horizon.trim().length > 0, message: d.horizon.trim() ? `Applies ${d.horizon.trim()}.` : 'Course rule: say by when, or over what period, the target applies (e.g. “each month from month 6”).' },
    )
  }
  if (d.level === 'mission' || d.level === 'objective') {
    const direct = d.concerns.filter((c) => /^(CON|STK)-\d{3}$/.test(c))
    const inherited = d.level === 'objective' ? inheritedConcerns.filter((c) => /^(CON|STK)-\d{3}$/.test(c)) : []
    const traced = direct.length > 0 || inherited.length > 0
    f.push({
      id: 'traced',
      ok: traced,
      message: direct.length ? `Answers ${direct.join(', ')}.` : inherited.length ? `Answers ${inherited.join(', ')} through its goal ${d.parent}.` : 'Course rule (RB-2.1): trace it to the stakeholder concern(s) it answers, directly or through its goal.',
    })
  }
  return f
}

export const mgoAcceptable = (d: MgoDraft, parentLevel?: MgoLevel, inheritedConcerns: string[] = []) => checkMgo(d, parentLevel, inheritedConcerns).every((x) => x.ok)

export function mgoAttributes(d: MgoDraft): Record<string, string | number> {
  if (d.level !== 'objective') return { level: d.level }
  return { level: d.level, measure: d.measure.trim(), target: Number(d.target), unit: d.unit.trim(), horizon: d.horizon.trim() }
}

/** CON/STK items an MGO derives from directly. */
export const concernsOf = (m: EngineeringModel, id: string) =>
  m.links.filter((l) => l.source === id && l.type === 'derives-from' && ['CON', 'STK'].includes(kindOfId(l.target) ?? '')).map((l) => l.target)

/** Rebuild a recorder draft from an MGO in a model, with its parent level and inherited concerns (used to check the reference). */
export function mgoDraftOf(m: EngineeringModel, id: string): { draft: MgoDraft; parentLevel?: MgoLevel; inherited: string[] } {
  const e = m.elements.find((x) => x.id === id)!
  const a = e.attributes ?? {}
  const parent = m.links.find((l) => l.source === id && l.type === 'derives-from' && kindOfId(l.target) === 'MGO')?.target ?? ''
  const parentLevel = m.elements.find((x) => x.id === parent)?.attributes?.level as MgoLevel | undefined
  const draft: MgoDraft = {
    level: (a.level as MgoLevel) ?? '',
    name: e.name,
    text: e.text ?? '',
    parent,
    concerns: concernsOf(m, id),
    measure: String(a.measure ?? ''),
    target: a.target === undefined ? '' : String(a.target),
    unit: String(a.unit ?? ''),
    horizon: String(a.horizon ?? ''),
  }
  return { draft, parentLevel, inherited: parent ? concernsOf(m, parent) : [] }
}
