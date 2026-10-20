// The book-style Week 1 flow (WEEK1_LEARNING_DESIGN): Overview → Learn → Practice → Check & submit, one stage on screen
// at a time. Routes: /week/1 (Overview), /week/1/learn[/:section], /week/1/practice, /week/1/check.
import { useEffect } from 'react'
import { WEEKS } from '../content/course'
import { LEARN_SECTIONS } from '../content/learn/week01'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import { Link } from '../lib/router'
import { useApp } from '../state/AppState'
import { CheckSubmit } from './CheckSubmit'
import { StageBar, TopBar } from './Chrome'
import { STAGES, type FlowStage as Stage } from './route'
import { Learn } from './Learn'
import { Overview } from './Overview'
import { Practice } from './Practice'
import { FlowProvider, useFlow } from './state'
import { readPrediction } from './storage'

function FlowBody({ stage, section }: { stage: Stage; section?: string }) {
  const { allRead, state, patch } = useFlow()
  const { instructor, quiz } = useApp()
  const w = WEEKS[0]
  const workbench = stage === 'practice' && (allRead || instructor) && !!state.practiceStarted && !state.practiceGuide
  const quizDone = WEEK1_QUIZ.every((q) => quiz[q.id])
  useEffect(() => {
    if (stage === 'check' && !state.checkVisited) patch('checkVisited', true)
  }, [stage, state.checkVisited, patch])
  useEffect(() => {
    const s = LEARN_SECTIONS.find((x) => x.id === section)
    const label = STAGES.find((x) => x.id === stage)!.label
    document.title = `Week 1 · ${label}${stage === 'learn' && s ? `: ${s.code} ${s.title}` : ''} · SysML Learning Studio`
  }, [stage, section])
  return (
    <div className={`lf-root${workbench ? ' is-app' : ''}`} data-testid="week-flow" data-stage={stage}>
      <a href="#lf-main" className="lf-skip" onClick={(e) => (e.preventDefault(), document.getElementById('lf-main')?.focus())}>
        Skip to content
      </a>
      <TopBar
        title={`Week ${w.number} — ${w.title}`}
        right={
          <Link to="/week/1/classic" className="whitespace-nowrap text-[13px]">
            Classic page
          </Link>
        }
      >
        <StageBar current={stage} done={{ overview: !!readPrediction(), learn: allRead, check: quizDone && !!state.checkVisited }} locked={{ practice: !allRead && !instructor }} />
      </TopBar>
      <main id="lf-main" tabIndex={-1} className={`lf-main${workbench ? ' is-workbench' : ''}`}>
        {stage === 'overview' && <Overview />}
        {stage === 'learn' && <Learn section={section} />}
        {stage === 'practice' && <Practice />}
        {stage === 'check' && <CheckSubmit />}
      </main>
    </div>
  )
}

export default function WeekFlow({ stage, section }: { stage: Stage; section?: string }) {
  return (
    <FlowProvider>
      <FlowBody stage={stage} section={section} />
    </FlowProvider>
  )
}
