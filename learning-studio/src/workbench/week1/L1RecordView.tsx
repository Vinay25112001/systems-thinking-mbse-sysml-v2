// L1 record (Week 1, own mission): the deliverables tracker for Lab L1 with machine completeness checks, the
// emergent-behaviour explanation, the team charter, and a Markdown export of the whole record for upload.
import { Download } from 'lucide-react'
import { useId } from 'react'
import week01 from '../../content/weeks/week01'
import { useWorkspace } from '../../state/Workspace'
import { useWorkbench } from '../context'
import { StateChip } from '../ui'
import { downloadText } from '../download'
import { l1Markdown } from './export'
import {
  BEHAVIOUR_SCENARIO, COURSE_ROLES, EMPTY_L1, L1_KEY, MERGED_ROLE, MIN_EXPLANATION_WORDS, l1Artefact, loopsArtefact, loopsMentioned, words, type L1Record,
} from './logic'

function useL1() {
  const wb = useWorkbench()
  const rec = l1Artefact(wb.state.artefacts)
  const patch = (p: Partial<L1Record>) => wb.setArtefact<L1Record>(L1_KEY, (prev) => ({ ...EMPTY_L1, ...(prev ?? {}), ...p }))
  return { rec, patch }
}

function Tracker() {
  const wb = useWorkbench()
  const own = wb.evals.find((e) => e.mission.kind === 'own')
  if (!own) return null
  return (
    <section aria-labelledby="l1-tracker-h" className="rounded border border-wb-line bg-wb-panel">
      <div className="wb-ph">
        <h2 id="l1-tracker-h">Lab {week01.lab.id} deliverables</h2>
        <span className="wb-sp" />
        <span className="wb-count">
          {own.done}/{own.total} complete
        </span>
      </div>
      <table className="wb-table" data-testid="l1-tracker">
        <thead>
          <tr>
            <th scope="col">Part</th>
            <th scope="col">Check</th>
            <th scope="col">Detail</th>
            <th scope="col">Assessed by</th>
          </tr>
        </thead>
        <tbody>
          {own.steps.map((s) => (
            <tr key={s.step.id}>
              <td className="font-medium">{s.step.instruction.split('.')[0]}</td>
              <td>
                <StateChip ok={s.ok}>{s.ok ? 'complete' : s.manual ? 'mark done' : 'incomplete'}</StateChip>
              </td>
              <td className="text-wb-muted">{s.detail}</td>
              <td className="wb-mono text-[11px]">{s.step.rubric ?? (s.manual ? 'instructor' : 'machine check')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-wb-muted">
        Machine checks test completeness (counts, polarity, owners). They do not grade the reasoning: {week01.assignment.rubricScope.split('. ')[1]}.
      </p>
    </section>
  )
}

function Emergent() {
  const { rec, patch } = useL1()
  const wb = useWorkbench()
  const id = useId()
  const loops = loopsArtefact(wb.state.artefacts).loops
  const mentioned = loopsMentioned(rec.explanation, loops)
  return (
    <section aria-labelledby="l1-emergent-h" className="rounded border border-wb-line bg-wb-panel">
      <div className="wb-ph">
        <h2 id="l1-emergent-h">Emergent behaviour (L1 step 4)</h2>
      </div>
      <div className="space-y-2 p-3">
        <p className="text-[12px] text-wb-muted">{week01.lab.steps[3].detail}</p>
        <fieldset className="flex flex-wrap gap-4 border-0 p-0">
          <legend className="wb-label">Behaviour</legend>
          {(Object.keys(BEHAVIOUR_SCENARIO) as ('plateau' | 'overbuild')[]).map((k) => (
            <label key={k} className="flex items-center gap-1.5">
              <input type="radio" name={`${id}-b`} checked={rec.behaviour === k} onChange={() => patch({ behaviour: k })} />
              {BEHAVIOUR_SCENARIO[k].label}
            </label>
          ))}
        </fieldset>
        <label className="block" htmlFor={`${id}-x`}>
          <span className="wb-label">Causal explanation — name the loops involved (e.g. R1, B2, or your own LOOP IDs)</span>
          <textarea id={`${id}-x`} rows={7} className="wb-textarea" value={rec.explanation} onChange={(e) => patch({ explanation: e.target.value })} />
        </label>
        <p className="wb-mono text-[11px] text-wb-muted">
          {words(rec.explanation)} / {MIN_EXPLANATION_WORDS} words · loops named: {mentioned.length ? mentioned.join(', ') : 'none'}
        </p>
      </div>
    </section>
  )
}

function Charter() {
  const { rec, patch } = useL1()
  const id = useId()
  return (
    <section aria-labelledby="l1-charter-h" className="rounded border border-wb-line bg-wb-panel">
      <div className="wb-ph">
        <h2 id="l1-charter-h">Team charter (L1 step 5)</h2>
      </div>
      <div className="space-y-3 p-3">
        <p className="text-[12px] text-wb-muted">{week01.lab.steps[4].detail}</p>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={rec.threePersonTeam} onChange={(e) => patch({ threePersonTeam: e.target.checked })} />
          3-person team (AI &amp; Data Management merges with Architecture)
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {COURSE_ROLES.map((r, i) => {
            const merged = rec.threePersonTeam && r === MERGED_ROLE
            return (
              <label key={r} htmlFor={`${id}-r${i}`}>
                <span className="wb-label">
                  {r} {merged && '(merged with Architecture)'}
                </span>
                <input id={`${id}-r${i}`} className="wb-input mono w-28" value={merged ? '' : (rec.roles[r] ?? '')} disabled={merged} placeholder="initials" onChange={(e) => patch({ roles: { ...rec.roles, [r]: e.target.value } })} />
              </label>
            )
          })}
        </div>
        <label className="block" htmlFor={`${id}-d`}>
          <span className="wb-label">Decision rules</span>
          <textarea id={`${id}-d`} rows={2} className="wb-textarea" value={rec.decisionRules} onChange={(e) => patch({ decisionRules: e.target.value })} />
        </label>
        <label className="block" htmlFor={`${id}-n`}>
          <span className="wb-label">Communication norms</span>
          <textarea id={`${id}-n`} rows={2} className="wb-textarea" value={rec.norms} onChange={(e) => patch({ norms: e.target.value })} />
        </label>
        <label className="block" htmlFor={`${id}-p`}>
          <span className="wb-label">Owned element prefixes for the term (per member, e.g. “JS: REQ, VER”)</span>
          <textarea id={`${id}-p`} rows={2} className="wb-textarea wb-mono" value={rec.prefixes} onChange={(e) => patch({ prefixes: e.target.value })} />
        </label>
      </div>
    </section>
  )
}

export function L1RecordView() {
  const wb = useWorkbench()
  const { model } = useWorkspace()
  const exportRecord = () => {
    const ok = downloadText('L1-record.md', l1Markdown(wb, model))
    wb.log('export', ok ? 'Exported the L1 record (L1-record.md)' : 'Export failed: downloads are blocked in this browser')
  }
  return (
    <div className="wb-view-body" data-testid="view-l1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 max-w-[80ch] text-wb-muted">{week01.lab.title}. {week01.lab.setting === 'team' ? 'Team lab' : 'Individual lab'}; objectives {week01.lab.objectives.join(', ')}.</p>
        <button type="button" className="wb-btn" onClick={exportRecord}>
          <Download size={13} aria-hidden /> Export L1 record (.md)
        </button>
      </div>
      <Tracker />
      <div className="grid gap-3 xl:grid-cols-2">
        <Emergent />
        <Charter />
      </div>
    </div>
  )
}
