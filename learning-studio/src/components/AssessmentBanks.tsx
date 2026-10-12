import { useEffect, useState } from 'react'
import { IS_STUDENT_EDITION, loadExamBanks, type ExamBank } from '../instructor'

/** Exam banks for one week, loaded on demand in instructor mode; absent from the student edition. */
export function AssessmentBanks({ week }: { week: number }) {
  const [banks, setBanks] = useState<ExamBank[] | null>(null)
  useEffect(() => {
    let live = true
    loadExamBanks().then((b) => live && setBanks(b.filter((x) => x.week === week)))
    return () => {
      live = false
    }
  }, [week])
  if (IS_STUDENT_EDITION || !banks || banks.length === 0) return null
  return (
    <section aria-labelledby={`banks-${week}`} className="mt-4" data-testid="assessment-banks">
      <h3 id={`banks-${week}`} className="text-sm font-semibold">
        Assessment banks (instructor edition only)
      </h3>
      {banks.map((b) => (
        <details key={b.id} className="mt-2 rounded border border-amber-300 p-2 dark:border-amber-800">
          <summary className="cursor-pointer text-sm font-medium">{b.title}</summary>
          <p className="mt-2 text-sm">{b.overview}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{b.mapping}</p>
        </details>
      ))}
    </section>
  )
}
