// Practice bar above the embedded workbench (book-style flow only; faculty feedback 2026-10-18, items 11 and 13).
import { useWorkbench } from '../context'
import { usePracticeLinks } from '../learnLink'

/** Practice bar (book-style flow only; faculty feedback 2026-10-18, items 11 and 13): overall mission progress, the
 *  orientation page, and the way on to Check & submit once every mission is complete. */
export function PracticeBar() {
  const wb = useWorkbench()
  const links = usePracticeLinks()
  if (!links) return null
  // a single mission shown as parts (the Week 1 lab tool, sign-off Mo3): count its steps, not missions
  const parts = wb.evals.length === 1 && links.partsLabel ? links.partsLabel : undefined
  const done = parts ? wb.evals[0].done : wb.evals.filter((e) => e.complete).length
  const total = parts ? wb.evals[0].total : wb.evals.length
  const complete = done === total
  const unit = parts ? `${parts} complete` : 'missions complete'
  return (
    <div className={`wb-practice-bar${complete ? ' is-complete' : ''}`} role="region" aria-label={links.progressLabel ?? 'Practice progress'} data-testid="practice-bar">
      <label className="flex items-center gap-2">
        <span className="font-semibold">{links.progressLabel ?? 'Practice progress'}</span>
        <progress max={total} value={done} aria-label={`${parts ?? 'Missions'} complete: ${done} of ${total}`} />
        <span className="wb-mono" data-testid="practice-progress">
          {done} of {total} {unit}
        </span>
        {parts && links.partsNote && <span className="text-wb-muted">{links.partsNote}</span>}
      </label>
      <button type="button" className="wb-btn ghost" onClick={links.onGuide} data-testid="open-guide">
        {links.guideLabel ?? 'How the workbench works'}
      </button>
      <span className="wb-sp flex-1" />
      {complete ? (
        <span className="flex flex-wrap items-center gap-2" role="status" data-testid="practice-complete">
          <strong>{links.completeText}</strong>
          <a href={`#${links.checkHref}`} className="wb-btn primary">
            Go to {links.checkLabel ?? 'Check & submit'}
          </a>
        </span>
      ) : (
        <a href={`#${links.checkHref}`} className="wb-link">
          {links.checkLabel ?? 'Check & submit'}
        </a>
      )}
    </div>
  )
}

