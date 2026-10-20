// Week 1 model browser (rebuilt 2026-10-18): the AeroLink rehearsal items (boundary candidates, the stakeholder and
// needs exercises, the student's optional ENT and EXT elements) and the team's own Week 1 Team Record, part by part.
import { BOUNDARY_ITEMS } from '../../content/week1'
import { ELEMENT_KINDS, KIND_INFO } from '../../model/engineering'
import type { TreeGroup, WeekState, WeekUi } from '../context'
import { CANDIDATES, CLASSIFY_ROWS, classifiedCount, identifiedCount, needsArtefact, stakeholderArtefact } from './stakeholders'
import { checkAiStatement, checkCharterPart, checkContextPart, checkExported, checkNeedsPart, checkProposal, checkRegister, teamArtefact, type PartCheck } from './team'

const BOUNDARY_LABEL: Record<string, string> = { inside: 'inside', environment: 'environment', irrelevant: 'irrelevant' }

/** The Team Record parts, with the id the model browser, the missions and Problems use. */
export const TEAM_PARTS: { id: string; label: string }[] = [
  { id: 'team:charter', label: '1 Team charter' },
  { id: 'team:proposal', label: '2 Enterprise proposal' },
  { id: 'team:context', label: '3 Context' },
  { id: 'team:register', label: '4 Stakeholder register' },
  { id: 'team:needs', label: '5 Initial needs' },
  { id: 'team:ai', label: '6 AI usage statement' },
  { id: 'team:export', label: 'Export' },
]

export function teamPartCheck(id: string, s: Pick<WeekState, 'artefacts'>): PartCheck | undefined {
  const r = teamArtefact(s.artefacts)
  if (id === 'team:charter') return checkCharterPart(r.charter)
  if (id === 'team:proposal') return checkProposal(r.proposal)
  if (id === 'team:context') return checkContextPart(r)
  if (id === 'team:register') return checkRegister(r)
  if (id === 'team:needs') return checkNeedsPart(r)
  if (id === 'team:ai') return checkAiStatement(r)
  if (id === 'team:export') return checkExported(r)
  return undefined
}

export function week1Tree(s: WeekState): TreeGroup[] {
  const active = s.model.elements.filter((e) => e.status === 'active')
  const byKind = (k: string) => active.filter((e) => e.kind === k).map((e) => ({ id: e.id, label: e.id, sub: e.name, kind: e.kind }))
  const stk = stakeholderArtefact(s.artefacts)
  const needs = needsArtefact(s.artefacts)
  const team = teamArtefact(s.artefacts)
  const groups: TreeGroup[] = [
    {
      id: 'g-team',
      label: 'Team Record (your enterprise)',
      items: [
        ...TEAM_PARTS.map((p) => ({ id: p.id, label: p.label, sub: teamPartCheck(p.id, s)!.ok ? 'complete' : 'incomplete', kind: 'team-part' })),
        ...team.stakeholders.map((x) => ({ id: `team:${x.id}`, label: x.id, sub: x.name || '(unnamed)', kind: 'team-stakeholder' })),
        ...team.needs.map((x) => ({ id: `team:${x.id}`, label: x.id, sub: x.name || '(unnamed)', kind: 'team-need' })),
      ],
    },
    {
      id: 'g-aero-stk',
      label: 'AeroLink stakeholders (rehearsal)',
      items: [
        { id: 'stk:identify', label: 'Part 1 Who has a stake?', sub: `${identifiedCount(stk)}/${CANDIDATES.length} marked`, kind: 'exercise' },
        { id: 'stk:classify', label: 'Part 2 Classification', sub: `${classifiedCount(stk)}/${CLASSIFY_ROWS.length} classified`, kind: 'exercise' },
        { id: 'stk:row', label: 'Part 3 Register row', sub: stk.rowRecordedAt ? 'recorded' : 'not recorded', kind: 'exercise' },
      ],
    },
    {
      id: 'g-aero-needs',
      label: 'AeroLink needs (rehearsal)',
      items: [
        { id: 'needs:diagnose', label: 'Part 1 Diagnose drafts', sub: needs.critiqueCheckedAt ? 'checked' : 'not checked', kind: 'exercise' },
        { id: 'needs:write', label: 'Part 2 Write needs', sub: `${needs.needs.length} recorded`, kind: 'exercise' },
      ],
    },
    {
      id: 'g-boundary',
      label: 'Boundary candidates (rehearsal)',
      items: BOUNDARY_ITEMS.map((b) => ({ id: `boundary:${b.id}`, label: b.name, sub: s.boundary[b.id] ? BOUNDARY_LABEL[s.boundary[b.id]] : 'unclassified', kind: 'boundary' })),
    },
    { id: 'g-ent', label: 'AeroLink system of interest (optional)', items: byKind('ENT'), empty: 'Optional: record it in Boundary & context', emptyView: 'boundary' },
    { id: 'g-ext', label: 'AeroLink external systems (optional)', items: byKind('EXT'), empty: 'Optional: add them in Boundary & context', emptyView: 'boundary' },
  ]
  for (const k of ELEMENT_KINDS) {
    if (['ENT', 'EXT'].includes(k)) continue
    const items = byKind(k)
    if (items.length) groups.push({ id: `g-${k}`, label: KIND_INFO[k].label, items })
  }
  return groups
}

export const week1HomeView: WeekUi['homeView'] = (id) => {
  if (id.startsWith('ENT-') || id.startsWith('EXT-') || id.startsWith('boundary:')) return 'boundary'
  if (id.startsWith('stk:')) return 'stakeholders'
  if (id.startsWith('needs:')) return 'needs'
  if (id.startsWith('team:')) return 'team'
  return undefined
}

export function week1Entities(s: WeekState): Record<string, string> {
  const out: Record<string, string> = {}
  for (const b of BOUNDARY_ITEMS) if (s.boundary[b.id]) out[`boundary:${b.id}`] = s.boundary[b.id]
  const stk = stakeholderArtefact(s.artefacts)
  if (identifiedCount(stk)) out['stk:identify'] = JSON.stringify(stk.identified)
  if (classifiedCount(stk)) out['stk:classify'] = JSON.stringify(stk.classes)
  if (stk.rowRecordedAt) out['stk:row'] = JSON.stringify(stk.row)
  for (const n of needsArtefact(s.artefacts).needs) out[`needs:${n.id}`] = JSON.stringify([n.text, n.traces])
  const team = teamArtefact(s.artefacts)
  for (const x of [...team.context, ...team.stakeholders, ...team.needs]) out[`team:${x.id}`] = JSON.stringify(x)
  if (team.proposal.name || team.proposal.soi) out['team:proposal'] = JSON.stringify(team.proposal)
  if (Object.keys(team.charter.roles).length || team.charter.decisionRules) out['team:charter'] = JSON.stringify(team.charter)
  return out
}

export function week1Metrics(s: WeekState): Record<string, number> {
  const team = teamArtefact(s.artefacts)
  return {
    'Boundary candidates classified': BOUNDARY_ITEMS.filter((b) => s.boundary[b.id]).length,
    'AeroLink stakeholders classified': classifiedCount(stakeholderArtefact(s.artefacts)),
    'AeroLink needs recorded': needsArtefact(s.artefacts).needs.length,
    'Team stakeholders': team.stakeholders.length,
    'Team needs': team.needs.length,
  }
}

export function week1LabelOf(id: string, s: WeekState): string | undefined {
  if (id.startsWith('boundary:')) return BOUNDARY_ITEMS.find((b) => `boundary:${b.id}` === id)?.name
  const part = TEAM_PARTS.find((p) => p.id === id)
  if (part) return `Team Record, part ${part.label}`
  if (id.startsWith('team:')) {
    const team = teamArtefact(s.artefacts)
    const key = id.slice(5)
    const row = [...team.context, ...team.stakeholders, ...team.needs].find((x) => x.id === key)
    return row ? `${row.id} ${row.name}`.trim() : key
  }
  return undefined
}
