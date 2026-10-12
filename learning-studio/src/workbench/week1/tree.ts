// Week 1 model browser: the student's engineering elements (ENT, EXT, STK, …) plus the systems-thinking artefacts
// the week uses — boundary candidates, the student's causal loops, and the explorer's variables and loops.
import { ALL_LOOPS, LOOP_NODES } from '../../content/causalLoops'
import { BOUNDARY_ITEMS } from '../../content/week1'
import { ELEMENT_KINDS, KIND_INFO } from '../../model/engineering'
import type { TreeGroup, WeekState, WeekUi } from '../context'
import { analyseLoop, l1Artefact, loopIsSound, loopsArtefact } from './logic'

const BOUNDARY_LABEL: Record<string, string> = { inside: 'inside', environment: 'environment', irrelevant: 'irrelevant' }

export function week1Tree(s: WeekState): TreeGroup[] {
  const active = s.model.elements.filter((e) => e.status === 'active')
  const byKind = (k: string) => active.filter((e) => e.kind === k).map((e) => ({ id: e.id, label: e.id, sub: e.name, kind: e.kind }))
  const loops = loopsArtefact(s.artefacts).loops
  const groups: TreeGroup[] = [
    { id: 'g-ent', label: 'System of interest', items: byKind('ENT'), empty: 'Record the SoI in Boundary & context', emptyView: 'boundary' },
    { id: 'g-ext', label: 'External systems', items: byKind('EXT'), empty: 'Add external systems in Boundary & context', emptyView: 'boundary' },
    {
      id: 'g-boundary',
      label: 'Boundary candidates',
      items: BOUNDARY_ITEMS.map((b) => ({ id: `boundary:${b.id}`, label: b.name, sub: s.boundary[b.id] ? BOUNDARY_LABEL[s.boundary[b.id]] : 'unclassified', kind: 'boundary' })),
    },
    { id: 'g-myloops', label: 'My causal loops', items: loops.map((l) => ({ id: l.id, label: l.id, sub: l.name || '(unnamed)', kind: 'loop' })), empty: 'Build a loop in Causal loops', emptyView: 'loops' },
    { id: 'g-loops', label: 'Explorer loops', items: ALL_LOOPS.map((l) => ({ id: `loop:${l.id}`, label: l.id, sub: l.name, kind: 'explorer-loop' })) },
    { id: 'g-vars', label: 'Explorer variables', items: LOOP_NODES.map((n) => ({ id: `var:${n.id}`, label: n.label, kind: 'variable' })) },
    { id: 'g-stk', label: 'Stakeholders', items: byKind('STK'), empty: 'Add stakeholders in Stakeholders', emptyView: 'stakeholders' },
  ]
  for (const k of ELEMENT_KINDS) {
    if (['ENT', 'EXT', 'STK'].includes(k)) continue
    const items = byKind(k)
    if (items.length) groups.push({ id: `g-${k}`, label: KIND_INFO[k].label, items })
  }
  return groups
}

export const week1HomeView: WeekUi['homeView'] = (id) => {
  if (id.startsWith('ENT-') || id.startsWith('EXT-') || id.startsWith('boundary:')) return 'boundary'
  if (id.startsWith('LOOP-') || id.startsWith('loop:') || id.startsWith('var:')) return 'loops'
  if (id.startsWith('STK-')) return 'stakeholders'
  return undefined
}

export function week1Entities(s: WeekState): Record<string, string> {
  const out: Record<string, string> = {}
  for (const b of BOUNDARY_ITEMS) if (s.boundary[b.id]) out[`boundary:${b.id}`] = s.boundary[b.id]
  for (const l of loopsArtefact(s.artefacts).loops) out[l.id] = JSON.stringify(l)
  const l1 = l1Artefact(s.artefacts)
  if (l1.explanation || l1.behaviour) out['L1 emergent behaviour'] = JSON.stringify([l1.behaviour, l1.explanation])
  if (Object.keys(l1.roles).length || l1.decisionRules || l1.norms || l1.prefixes) out['L1 team charter'] = JSON.stringify([l1.roles, l1.decisionRules, l1.norms, l1.prefixes, l1.threePersonTeam])
  return out
}

export function week1Metrics(s: WeekState): Record<string, number> {
  const loops = loopsArtefact(s.artefacts).loops
  return {
    'Boundary candidates classified': BOUNDARY_ITEMS.filter((b) => s.boundary[b.id]).length,
    'Student loops': loops.length,
    'Loops passing the polarity checks': loops.filter(loopIsSound).length,
    'Loops beyond the explorer': loops.filter((l) => loopIsSound(l) && analyseLoop(l).beyondExplorer).length,
  }
}

export function week1LabelOf(id: string, s: WeekState): string | undefined {
  if (id.startsWith('boundary:')) return BOUNDARY_ITEMS.find((b) => `boundary:${b.id}` === id)?.name
  if (id.startsWith('var:')) return LOOP_NODES.find((n) => `var:${n.id}` === id)?.label
  if (id.startsWith('loop:')) return `${id.slice(5)} ${ALL_LOOPS.find((l) => `loop:${l.id}` === id)?.name ?? ''}`.trim()
  if (id.startsWith('LOOP-')) {
    const l = loopsArtefact(s.artefacts).loops.find((x) => x.id === id)
    return l ? `${l.id} ${l.name}`.trim() : id
  }
  return undefined
}
