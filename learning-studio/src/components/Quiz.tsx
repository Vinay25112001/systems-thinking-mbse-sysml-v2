import { useState } from 'react'
import { getLecture } from '../content/lectures'
import { getReading } from '../content/readings'
import { allSlides } from '../content/lectures/text'
import type { QuizQuestion } from '../content/quizWeek1'
import type { QuizTaught } from '../content/schema'
import { useApp } from '../state/AppState'
import { readableSlideRefs } from './quizText'
import { Badge, Button, CitationText, ReviewControls } from './ui'

/** "Session 2, slide 9 “What makes a need well formed”; lesson: “Well-formed needs …”" for an item's `lecture`. */
function taughtIn(t: QuizTaught): string | undefined {
  const l = getLecture(t.week, t.session)
  if (!l) return undefined
  const slides = allSlides(l)
  const i = slides.findIndex((s) => s.id === t.slide)
  const sec = l.studentLesson.find((s) => s.id === t.section)
  if (i < 0 || !sec) return undefined
  return `Session ${t.session}, slide ${i + 1} “${slides[i].title}”; lesson: “${sec.title}”`
}

/** `studentSafe` (M6, Review & Submit): the source in words without its register code, no lecture slide pointer. */
const plainSource = (c: NonNullable<QuizQuestion['cite']>) => {
  const r = getReading(c.reading)
  return `${r.sourceTitle}, “${r.title}”, ${r.unit === 'slide' ? 'sl.' : 'p.'}${c.pages ?? r.firstPage}`
}
function Question({ q, index, bloomText, studentSafe = false }: { q: QuizQuestion; index: number; bloomText: (b: string) => string; studentSafe?: boolean }) {
  const { quiz, answerQuiz } = useApp()
  const record = quiz[q.id]
  const [choice, setChoice] = useState<string>('')
  const [revealed, setRevealed] = useState<boolean>(!!record)
  const selected = revealed ? (record?.selected ?? choice) : choice
  const chosen = q.options.find((o) => o.id === selected)

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800" data-testid={`quiz-${q.id}`}>
      <legend className="px-1 text-sm font-semibold">
        Question {index + 1} <Badge>{bloomText(q.bloom)}</Badge> <Badge>{q.objective}</Badge>
      </legend>
      <p className="mb-3">{q.prompt}</p>
      <div className="space-y-2">
        {q.options.map((o) => {
          const isCorrect = revealed && o.correct
          const isWrongChoice = revealed && o.id === selected && !o.correct
          return (
            <label
              key={o.id}
              className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm ${
                isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : isWrongChoice ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <input type="radio" name={q.id} value={o.id} checked={selected === o.id} disabled={revealed} onChange={() => setChoice(o.id)} className="mt-0.5" />
              <span>
                {o.text}
                {revealed && (o.id === selected || o.correct) && (
                  <span className="mt-1 block text-xs text-slate-700 dark:text-slate-300">{readableSlideRefs(o.explanation)}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!revealed ? (
          <Button
            disabled={!choice}
            onClick={() => {
              const opt = q.options.find((o) => o.id === choice)!
              answerQuiz(q.id, choice, opt.correct)
              setRevealed(true)
            }}
          >
            Check answer
          </Button>
        ) : (
          <>
            <span role="status" className={chosen?.correct ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'font-semibold text-rose-700 dark:text-rose-300'}>
              {chosen?.correct ? 'Correct' : 'Not quite — review the explanation and try again'}
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                setChoice('')
                setRevealed(false)
              }}
            >
              Try again
            </Button>
          </>
        )}
        {record && <span className="text-xs text-slate-500 dark:text-slate-400">Attempts: {record.attempts}</span>}
      </div>
      <p className="mt-2">
        {studentSafe ? <span className="text-xs text-slate-600 dark:text-slate-300">Source: {q.cite ? plainSource(q.cite) : 'course convention'}</span> : q.cite ? <CitationText c={q.cite} /> : <span className="text-xs text-slate-600 dark:text-slate-300">Source: course convention ({q.courseSource})</span>}
      </p>
      {!studentSafe && q.lecture && taughtIn(q.lecture) && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300" data-testid={`quiz-${q.id}-taught`}>
          Taught in: {taughtIn(q.lecture)}
        </p>
      )}
      <ReviewControls id={`quiz-${q.id}`} label={`Quiz question ${index + 1}`} />
    </fieldset>
  )
}

/** `bloomText` maps the stored Bloom label for display (Week 1 passes its American label, review F09). */
export function Quiz({ questions, bloomText = (b) => b, studentSafe = false }: { questions: QuizQuestion[]; bloomText?: (b: string) => string; studentSafe?: boolean }) {
  const { quiz, resetQuiz } = useApp()
  // remount questions only on an explicit reset (remounting on answer would drop keyboard focus)
  const [version, setVersion] = useState(0)
  const correct = questions.filter((q) => quiz[q.id]?.correct).length
  const answered = questions.filter((q) => quiz[q.id]).length
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm" data-testid="quiz-score">
          Score: <strong>{correct}</strong> correct of {questions.length} ({answered} answered). Formative — not graded.
        </p>
        <Button
          variant="ghost"
          onClick={() => {
            resetQuiz(questions.map((q) => q.id))
            setVersion((v) => v + 1)
          }}
        >
          Reset knowledge check
        </Button>
      </div>
      {questions.map((q, i) => (
        <Question key={`${q.id}-${version}`} q={q} index={i} bloomText={bloomText} studentSafe={studentSafe} />
      ))}
    </div>
  )
}
