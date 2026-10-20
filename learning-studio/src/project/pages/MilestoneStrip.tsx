// The milestone strip (roadmap §2.2): 14 cells grouped Phase I / Phase II, each a link with the week number, the
// whiteboard title and the state in words (never colour alone). Week 1 is computed from the projected Team Record;
// Weeks 2–14 are upcoming (their records join the project in P2).
import { Check } from 'lucide-react'
import { Link } from '../../lib/router'
import { week1Milestone } from '../adapters/week1Status'
import type { MilestoneState, ProjectDoc } from '../model/types'

export const STATE_LABEL: Record<MilestoneState, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', 'checks-passing': 'Checks passing', exported: 'Exported', 'marked-submitted': 'Marked submitted' }

export function weekState(doc: ProjectDoc, week: number): { label: string; short: string; done: boolean; current: boolean } {
  if (week === 1) {
    const m = week1Milestone(doc)
    const done = m.state === 'exported' || m.state === 'marked-submitted'
    return { label: `${STATE_LABEL[m.state]}${m.hasContent && m.pendingApproval ? ' · pending approval' : ''}`, short: STATE_LABEL[m.state], done, current: !done }
  }
  return { label: 'Upcoming', short: week === 8 ? 'Baseline import' : week === 7 || week === 14 ? 'Review' : '', done: false, current: false }
}

export function MilestoneStrip({ doc, current }: { doc: ProjectDoc; current?: number }) {
  const cell = (w: number) => {
    const s = weekState(doc, w)
    const m = doc.milestones.find((x) => x.week === w)
    return (
      <li key={w}>
        <Link to={`/project/milestones/${w}`} aria-current={current === w ? 'page' : undefined} title={m?.title} data-testid={`milestone-${w}`} aria-label={`Week ${w}: ${m?.title ?? ''}. ${s.label}`}>
          <span className={`pj-node${s.done ? ' done' : s.current ? ' current' : w === 8 ? ' key' : ''}`} aria-hidden>
            {s.done ? <Check size={14} strokeWidth={3} /> : w}
          </span>
          <span className="pj-wk">W{w}</span>
          <span className="pj-st" aria-hidden>{s.short}</span>
        </Link>
      </li>
    )
  }
  return (
    <div className="pj-strip" data-testid="milestone-strip">
      <div>
        <h3>Phase I · Systems Thinking Engineering Package</h3>
        <ol>{[1, 2, 3, 4, 5, 6, 7].map(cell)}</ol>
      </div>
      <div>
        <h3>Phase II · SysML v2 model of the same enterprise</h3>
        <ol>{[8, 9, 10, 11, 12, 13, 14].map(cell)}</ol>
      </div>
    </div>
  )
}
