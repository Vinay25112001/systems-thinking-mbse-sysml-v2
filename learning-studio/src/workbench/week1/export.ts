// Markdown export of the Week 1 L1 record (team deliverable).
import week01 from '../../content/weeks/week01'
import type { EngineeringModel } from '../../model/engineering'
import type { Workbench } from '../context'
import { BEHAVIOUR_SCENARIO, COURSE_ROLES, MERGED_ROLE, analyseLoop, l1Artefact, loopsArtefact, varLabel } from './logic'

/** Markdown export of the L1 record (team deliverable). */
export function l1Markdown(wb: Workbench, model: EngineeringModel): string {
  const rec = l1Artefact(wb.state.artefacts)
  const loops = loopsArtefact(wb.state.artefacts).loops
  const ent = model.elements.find((e) => e.kind === 'ENT' && e.status === 'active')
  const ext = model.elements.filter((e) => e.kind === 'EXT' && e.status === 'active')
  const L: string[] = [`# ${week01.lab.id} record — ${week01.lab.title}`, '', `Exported from the AeroLink Workbench, ${new Date().toISOString().slice(0, 10)}. All AeroLink values are FICTIONAL.`, '']
  L.push('## 1. System of interest', ent ? `**${ent.id} ${ent.name}** (owner ${ent.owner ?? '—'}, ${ent.provenance}): ${ent.text ?? ''}` : '_Not recorded._', '', `Rejected boundary: ${ent?.attributes?.rejectedBoundary ?? '_not recorded_'}`, '')
  L.push('## 2. Context', '| ID | External system or actor | Exchange | Owner | Provenance |', '|---|---|---|---|---|')
  for (const e of ext) L.push(`| ${e.id} | ${e.name} | ${e.attributes?.exchange ?? e.text ?? ''} | ${e.owner ?? ''} | ${e.provenance} |`)
  L.push('', '## 3. Causal loops')
  for (const l of loops) {
    const a = analyseLoop(l)
    L.push(`### ${l.id} ${l.name} — declared ${l.declared || '(not declared)'} (owner ${l.owner || '—'}, ${l.provenance})`, ...a.links.map((k) => `- ${k.from} → ${k.to}: ${k.polarity || '(no polarity)'}`), `- variables: ${l.vars.map(varLabel).join(', ')}`, '')
  }
  L.push('## 4. Emergent behavior', rec.behaviour ? `Behavior: ${BEHAVIOUR_SCENARIO[rec.behaviour].label}` : '_Not chosen._', '', rec.explanation || '_No explanation yet._', '')
  L.push('## 5. Team charter', ...COURSE_ROLES.map((r) => `- ${r}: ${rec.threePersonTeam && r === MERGED_ROLE ? 'merged with Architecture' : rec.roles[r] || '—'}`), '', `Decision rules: ${rec.decisionRules}`, '', `Communication norms: ${rec.norms}`, '', `Owned prefixes: ${rec.prefixes}`, '')
  return L.join('\n')
}

