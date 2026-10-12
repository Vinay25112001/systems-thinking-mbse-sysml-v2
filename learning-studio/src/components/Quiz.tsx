import { useState } from 'react'
import type { QuizQuestion } from '../content/quizWeek1'
import { useApp } from '../state/AppState'
import { Badge, Button, CitationText, ReviewControls } from './ui'

function Question({ q, index }: { q: QuizQuestion; index: number }) {
  const { quiz, answerQuiz } = useApp()
  const record = quiz[q.id]
  const [choice, setChoice] = useState<string>('')
  const [revealed, setRevealed] = useState<boolean>(!!record)
  const selected = revealed ? (record?.selected ?? choice) : choice
  const chosen = q.options.find((o) => o.id === selected)

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800" data-testid={`quiz-${q.id}`}>
      <legend className="px-1 text-sm font-semibold">
        Question {index + 1} <Badge>{q.bloom}</Badge> <Badge>{q.objective}</Badge>
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
                  <span className="mt-1 block text-xs text-slate-700 dark:text-slate-300">{o.explanation}</span>
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
        <CitationText c={q.cite} />
      </p>
      <ReviewControls id={`quiz-${q.id}`} label={`Quiz question ${index + 1}`} />
    </fieldset>
  )
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
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
        <Question key={`${q.id}-${version}`} q={q} index={i} />
      ))}
    </div>
  )
}
