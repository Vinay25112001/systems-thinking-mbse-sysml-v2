// Mission brief: the mission list, the current mission's numbered steps with live check state, recorded inputs,
// hints on request, worked steps on request, "Read more" into the Reference drawer and the debrief.
import { BookOpen, Check, ChevronRight, Lightbulb, Lock, SquareArrowOutUpRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { MissionStep } from '../../content/missions/types'
import { useWorkbench } from '../context'
import { KIND_LABEL, progressOf, recordAnswer, visibleSteps, type MissionEval, type StepEval } from '../missions'
import { useSelection } from '../selection'
import { Tip } from '../ui'
import { VIEW_REGISTRY } from '../views'
import { useLearnLink } from '../learnLink'

function StepInput({ missionId, step }: { missionId: string; step: MissionStep }) {
  const wb = useWorkbench()
  const input = step.input!
  const prog = progressOf(wb.progress, missionId)
  const recorded = prog.answers[input.key]
  const [draft, setDraft] = useState(recorded?.value ?? '')
  const id = useId()
  const locked = !!(input.lock && recorded)
  const record = () => {
    if (!draft.trim()) return
    wb.updateProgress(missionId, (p) => recordAnswer(p, step, draft.trim()))
    wb.log('mission', `Recorded “${input.label}”${input.lock ? ' (locked)' : ''}`)
  }
  const feedback = recorded ? (input.feedback?.[recorded.value] ?? input.feedback?.['*']) : undefined
  return (
    <div className="mt-2 space-y-2">
      {input.type === 'choice' ? (
        <fieldset className="m-0 space-y-1 border-0 p-0">
          <legend className="wb-label">{input.label}</legend>
          {input.options!.map((o) => (
            <label key={o.id} className="wb-choice flex items-start gap-2">
              <input type="radio" name={`${id}-r`} className="mt-0.5" value={o.id} checked={(locked ? recorded!.value : draft) === o.id} disabled={locked} onChange={() => setDraft(o.id)} />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      ) : input.type === 'number' ? (
        <label className="block" htmlFor={`${id}-n`}>
          <span className="wb-label">{input.label}</span>
          <input id={`${id}-n`} className="wb-input mono w-36" inputMode="decimal" value={locked ? recorded!.value : draft} disabled={locked} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && record()} />
        </label>
      ) : (
        <label className="block" htmlFor={`${id}-t`}>
          <span className="wb-label">{input.label}</span>
          <textarea id={`${id}-t`} rows={3} className="wb-textarea" value={locked ? recorded!.value : draft} disabled={locked} onChange={(e) => setDraft(e.target.value)} />
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {locked ? (
          <span className="wb-chip">
            <Lock size={11} aria-hidden /> Recorded and locked
          </span>
        ) : (
          <button type="button" className="wb-btn primary" onClick={record} disabled={!draft.trim() || draft.trim() === recorded?.value} aria-label={`${recorded ? 'Record again' : 'Record'}: ${input.label}`}>
            {recorded ? 'Record again' : 'Record'}
          </button>
        )}
      </div>
      {feedback && <p className="wb-note accent m-0" data-testid="step-feedback">{feedback}</p>}
    </div>
  )
}

function Step({ e, s }: { e: MissionEval; s: StepEval }) {
  const wb = useWorkbench()
  const { select } = useSelection()
  const prog = progressOf(wb.progress, e.mission.id)
  const [open, setOpen] = useState(false)
  const expanded = s.status === 'current' || open
  // a step that has just passed gets a brief completion cue (CSS; none under reduced motion)
  const wasOk = useRef(s.ok)
  const [justDone, setJustDone] = useState(false)
  useEffect(() => {
    const became = s.ok && !wasOk.current
    wasOk.current = s.ok
    if (!became) return
    setJustDone(true)
    const t = setTimeout(() => setJustDone(false), 950)
    return () => clearTimeout(t)
  }, [s.ok])
  const showHint = !!prog.hints[s.step.id]
  const showWorked = !!prog.revealed[s.step.id]
  const st = s.step
  const learnLink = useLearnLink()
  const lesson = learnLink?.(st.readMore) ?? null
  // the debrief an input gives stays visible after the step is done (it is the point of predicting first)
  const recorded = st.input ? prog.answers[st.input.key] : undefined
  const doneFeedback = s.ok && recorded && st.input?.feedback ? (st.input.feedback[recorded.value] ?? st.input.feedback['*']) : undefined
  const toggle = (field: 'hints' | 'revealed') => wb.updateProgress(e.mission.id, (p) => ({ ...p, [field]: { ...p[field], [st.id]: !p[field][st.id] } }))
  const openStep = () => {
    if (st.view) wb.setView(st.view)
    if (st.focus) select(st.focus, { reveal: true })
  }
  return (
    <li className={`wb-step ${justDone ? 'just-done' : ''}`} data-status={s.status} data-testid={`step-${st.id}`}>
      <div className="flex items-start gap-2">
        <span className="wb-step-num" aria-hidden>
          {s.ok ? <Check size={11} /> : s.index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`wb-step-text m-0 ${s.ok && !open ? 'line-clamp-2' : ''}`}>
            <span className="sr-only">
              Step {s.index + 1}, {s.ok ? 'done' : s.status === 'current' ? 'current' : 'not done'}:{' '}
            </span>
            {st.instruction}
          </p>
          {!expanded && (
            <>
              {s.ok && s.detail && <p className="m-0 mt-0.5 text-[12.5px] text-wb-ok">✓ {s.detail}</p>}
              {doneFeedback && <p className="wb-note accent m-0 mt-1" data-testid="step-feedback">{doneFeedback}</p>}
              <button type="button" className="wb-link mt-0.5 text-[12px]" onClick={() => setOpen(true)} aria-expanded={false}>
                Details
              </button>
            </>
          )}
          {expanded && (
            <div className="mt-1.5 space-y-1.5">
              {st.input && <StepInput missionId={e.mission.id} step={st} />}
              {s.detail && (
                <p className={`m-0 text-[13px] ${s.ok ? 'text-wb-ok' : 'text-wb-muted'}`} role={s.status === 'current' ? 'status' : undefined}>
                  {s.ok ? '✓ ' : ''}
                  {s.detail}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                {st.view && wb.view !== st.view && (
                  <button type="button" className="wb-btn" onClick={openStep}>
                    <SquareArrowOutUpRight size={12} aria-hidden /> Open {VIEW_REGISTRY[st.view]?.title ?? st.view}
                  </button>
                )}
                {st.hint && (
                  <button type="button" className="wb-btn ghost" aria-expanded={showHint} onClick={() => toggle('hints')}>
                    <Lightbulb size={12} aria-hidden /> {showHint ? 'Hide hint' : 'Hint'}
                  </button>
                )}
                {st.worked && (
                  <button type="button" className="wb-btn ghost" aria-expanded={showWorked} onClick={() => toggle('revealed')}>
                    <ChevronRight size={12} aria-hidden className={showWorked ? 'rotate-90' : ''} /> {showWorked ? 'Hide worked step' : 'Show worked step'}
                  </button>
                )}
                {lesson && (
                  <a href={`#${lesson.href}`} className="wb-btn ghost" data-testid="step-lesson-link">
                    <BookOpen size={12} aria-hidden /> Lesson: {lesson.label}
                  </a>
                )}
                <button type="button" className="wb-btn ghost" onClick={() => wb.openReference(st.readMore)}>
                  <BookOpen size={12} aria-hidden /> {lesson ? 'Full text' : 'Read more'}
                </button>
                {s.manual && (
                  <button
                    type="button"
                    className={`wb-btn ${s.ok ? '' : 'primary'}`}
                    onClick={() => wb.updateProgress(e.mission.id, (p) => ({ ...p, manual: { ...p.manual, [st.id]: !p.manual[st.id] } }))}
                  >
                    {s.ok ? 'Mark not done' : 'Mark done'}
                  </button>
                )}
              </div>
              {showHint && st.hint && <p className="wb-note m-0">{st.hint}</p>}
              {showWorked && st.worked && <p className="wb-note accent m-0">{st.worked}</p>}
              {st.rubric && <p className="m-0 text-[12px] text-wb-muted">Assessed against {st.rubric}.</p>}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

/** The week's missions as a compact numbered strip: number, state and progress; the title is in the name. */
export function MissionList() {
  const wb = useWorkbench()
  return (
    <ol className="m-0 grid list-none grid-cols-6 gap-1 p-0" aria-label="Week missions" data-testid="mission-list">
      {wb.evals.map((e, i) => {
        const active = e.mission.id === wb.missionId
        return (
          <li key={e.mission.id} className="min-w-0">
            <Tip label={`${i + 1}. ${e.mission.title} — ${e.complete ? 'complete' : `${e.done} of ${e.total} steps`}`}>
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                aria-label={`Mission ${i + 1}: ${e.mission.title}, ${KIND_LABEL[e.mission.kind]}, ${e.complete ? 'complete' : `${e.done} of ${e.total} steps done`}`}
                onClick={() => {
                  wb.setMissionId(e.mission.id)
                  const first = e.steps[e.current]?.step ?? e.mission.steps[0]
                  if (first.view) wb.setView(first.view)
                }}
                className={`flex w-full flex-col items-stretch gap-1 rounded border px-1.5 py-1 text-left ${active ? 'border-wb-accent bg-wb-panel' : 'border-wb-line bg-wb-panel hover:border-wb-line-strong'}`}
              >
                <span className="flex items-center justify-between">
                  <span className={`wb-mono text-[12px] font-semibold ${active ? 'text-wb-accent' : ''}`}>{i + 1}</span>
                  {e.complete && <Check size={12} className="text-wb-ok" aria-hidden />}
                </span>
                <span className="truncate text-[11px] text-wb-muted">{KIND_LABEL[e.mission.kind]}</span>
                <span className="block h-[3px] overflow-hidden rounded bg-wb-sunk" aria-hidden>
                  <span className={`block h-full ${e.complete ? 'bg-wb-ok' : 'bg-wb-accent'}`} style={{ width: `${(100 * e.done) / e.total}%` }} />
                </span>
              </button>
            </Tip>
          </li>
        )
      })}
    </ol>
  )
}

export function MissionBrief() {
  const wb = useWorkbench()
  const e = wb.evals.find((x) => x.mission.id === wb.missionId) ?? wb.evals[0]
  const m = e.mission
  const shown = visibleSteps(e)
  const hidden = e.steps.length - shown.length
  const idx = wb.evals.indexOf(e)
  const before = wb.evals.slice(0, idx).filter((x) => !x.complete).length
  return (
    <div className="wb-brief space-y-3 p-4" data-testid="mission-brief">
      <MissionList />
      <div className="border-t border-wb-line pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="wb-chip accent">{KIND_LABEL[m.kind]}</span>
          <span className="wb-chip">≈ {m.minutes} min</span>
          {m.objectives.map((o) => (
            <span key={o} className="wb-chip">
              {o}
            </span>
          ))}
        </div>
        <h3 className="wb-section-title mt-2" id="wb-mission-title">
          {idx + 1}. {m.title}
        </h3>
        <p className="wb-goal mt-1 mb-0 text-wb-muted">{m.goal}</p>
        {m.kind === 'recall' && before > 0 && <p className="wb-note warn mt-2 mb-0">Recommended after the other missions ({before} not finished yet).</p>}
        {m.kind === 'recall' && (
          <button type="button" className="wb-btn primary mt-2" onClick={() => wb.openAssessments('recall')}>
            Open Assessments → Recall
          </button>
        )}
      </div>
      <ol className="wb-steps" aria-labelledby="wb-mission-title">
        {shown.map((s) => (
          <Step key={`${m.id}-${s.step.id}`} e={e} s={s} />
        ))}
      </ol>
      {hidden > 0 && <p className="m-0 text-[12px] text-wb-muted">{hidden} more step{hidden > 1 ? 's' : ''} appear as you go (guided mission).</p>}
      {e.complete && (
        <div className="wb-note ok" role="status">
          <strong>Mission complete.</strong> {m.debrief ?? ''}
          {idx + 1 < wb.evals.length && (
            <button type="button" className="wb-link ml-1" onClick={() => wb.setMissionId(wb.evals[idx + 1].mission.id)}>
              Next: {wb.evals[idx + 1].mission.title}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
