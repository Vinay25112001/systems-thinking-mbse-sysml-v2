// Readable Markdown report of the whole project (data model §10.2): overview, milestones, artifacts by type with their
// relationships in and out, open review flags, the Week 8 mapping preview and a summary of recent changes.
import { MISSION_ID } from '../../workbench/week1/team'
import { buildPreview } from '../adapters/week8'
import { week1Milestone, week1Validation } from '../adapters/week1Status'
import { displayTitle, enterpriseOf, projectTitle } from '../model/create'
import { numOf } from '../model/ids'
import { ARTIFACT_INFO, sentence, TYPE_ORDER } from '../model/vocabulary'
import { MAPPING_STATUS_LABEL, MAPPING_STATUSES, type ChangeSet, type ProjectDoc } from '../model/types'

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
const STATE: Record<string, string> = { 'not-started': 'not started', 'in-progress': 'in progress', 'checks-passing': 'checks passing', exported: 'exported', 'marked-submitted': 'marked submitted' }

export function projectReport(doc: ProjectDoc, changes: ChangeSet[] = [], today = new Date().toISOString().slice(0, 10)): string {
  const ent = enterpriseOf(doc)
  const art = (uid: string) => doc.artifacts[uid]
  const m1 = week1Milestone(doc)
  const val = week1Validation(doc)
  const approval = (ent?.attributes.approval ?? {}) as Record<string, string>
  const L: string[] = [
    `# Project report: ${cell(projectTitle(doc))}`,
    '',
    `Team ${cell(doc.team.label) || '(no label)'} · generated ${today} from My Project (SysML Learning Studio). Project revision ${doc.rev}.`,
    '',
    '> This report is generated from the team’s project in one browser. Names of who changed what are self-declared initials, not verified identities. The checks report which course checks pass; they do not judge whether the engineering is right.',
    '',
    '## Enterprise overview',
    '',
    `- Enterprise (ENT-001): ${cell(ent?.title ?? '') || '(not named)'}`,
    `- Domain: ${cell(String(ent?.attributes.domain ?? '')) || '(not written)'}`,
    `- Problem statement: ${cell(String(ent?.attributes.problem ?? '')) || '(not written)'}`,
    `- Mission (${MISSION_ID}): ${cell(Object.values(doc.artifacts).find((a) => a.id === MISSION_ID)?.description ?? '') || '(not written)'}`,
    `- System of interest: ${cell(String(ent?.attributes.soi ?? '')) || '(not written)'}`,
    `- Instructor decision (as recorded by the team): ${approval.decision ? `${approval.decision}${approval.decidedOn ? `, ${approval.decidedOn}` : ''}` : 'not recorded'}`,
    `- Team roles (initials): ${Object.entries(doc.team.roles).filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`).join('; ') || '(not recorded)'}`,
    '',
    '## Milestones',
    '',
    '| Week | Title | State |',
    '|---|---|---|',
    ...doc.milestones.map((m) => `| ${m.week} | ${cell(m.title)} | ${m.week === 1 ? `${STATE[m1.state]}${m1.pendingApproval && m1.hasContent ? ' (pending approval)' : ''}` : 'upcoming'} |`),
    '',
  ]
  const types = [...new Set(Object.values(doc.artifacts).map((a) => a.type))].sort((a, b) => (TYPE_ORDER.get(a) ?? 0) - (TYPE_ORDER.get(b) ?? 0))
  L.push('## Artifacts', '')
  for (const t of types) {
    const list = Object.values(doc.artifacts).filter((a) => a.type === t).sort((a, b) => numOf(a.id) - numOf(b.id))
    L.push(`### ${ARTIFACT_INFO[t].plural}`, '', '| ID | Title or statement | Checks | Review | Provenance | Relationships |', '|---|---|---|---|---|---|')
    for (const a of list) {
      const rels = Object.values(doc.relationships).filter((r) => !r.draft && r.status !== 'retired' && (r.from === a.uid || r.to === a.uid)).map((r) => `${sentence(art(r.from)?.id ?? '?', r.type, art(r.to)?.id ?? '?')}${r.status === 'suspect' ? ' (suspect)' : ''}`)
      const v = val.get(a.uid)
      L.push(`| ${a.id}${a.status === 'retired' ? ' (retired)' : ''} | ${cell(displayTitle(a))} | ${v ? v.state : 'unchecked'} | ${a.review.state} | ${a.provenance.kind} | ${cell(rels.join('; '))} |`)
    }
    L.push('')
  }
  const stk = Object.values(doc.relationships).filter((r) => r.category === 'stakeholder' && r.status !== 'retired')
  if (stk.length) {
    L.push('### Stakeholder relationships', '', '| ID | Relationship | Note |', '|---|---|---|')
    for (const r of stk) L.push(`| ${r.id} | ${cell(`${String(r.attributes?.fromText ?? '')} ${r.type || '(type not chosen)'} ${String(r.attributes?.toText ?? '')}`)} | ${cell(r.note ?? '')} |`)
    L.push('')
  }
  const flags = Object.values(doc.artifacts).filter((a) => a.review.state === 'needs-review')
  L.push('## Open review flags', '', flags.length ? '' : 'None.')
  for (const a of flags) if (a.review.state === 'needs-review') L.push(`- ${a.id}: ${a.review.causes.map((c) => `${c.changedId} changed (${c.change}, via ${c.path.join(' → ')})`).join('; ')}`)
  L.push('')
  const pv = buildPreview(doc, today)
  L.push('## Week 8 mapping preview (not yet confirmed)', '', MAPPING_STATUSES.map((s) => `${MAPPING_STATUS_LABEL[s]}: ${pv.counts[s]}`).join(' · '), '')
  L.push('## Recent changes', '')
  for (const c of changes.slice(-20).reverse()) L.push(`- ${c.at.slice(0, 16).replace('T', ' ')} · ${c.by || 'not recorded'} (self-declared) · ${c.source} · ${cell(c.summary)}${c.rationale ? ` — rationale: ${cell(c.rationale)}` : ''}`)
  if (!changes.length) L.push('No changes recorded yet.')
  L.push('')
  return L.join('\n')
}
