import { useMemo, useState } from 'react'
import { WEEKS } from '../content/course'
import { DRAFT_WEEKS } from '../content/draftWeeks'
import { CURRENT_CONTENT, WEEK_CONTENT } from '../content/weeks'
import { useApp, type ReviewStatus } from '../state/AppState'
import { Link } from '../lib/router'
import { Badge, Button, Card, PageHeader, ProvenanceBadge } from '../components/ui'

type Item = { id: string; label: string; area: string; provenance?: string; link: string }

// Item IDs are stable so recorded decisions survive the A19 schedule change: the reviewed draft modules keep their IDs and
// are now listed (and linked) as earlier draft material; the new schedule's week outlines have their own IDs.
export function reviewableItems(): Item[] {
  const live = (week: number) => !!CURRENT_CONTENT[week]
  const where = (week: number) => (live(week) ? { area: `Week ${week}`, link: `/week/${week}` } : { area: `Earlier draft (old Week ${week})`, link: `/draft/${week}` })
  return [
    ...Object.values(WEEK_CONTENT)
      .sort((x, y) => x.week - y.week)
      .flatMap((c) => {
        const { area, link } = where(c.week)
        return [
          ...c.blocks.map((b) => ({ id: b.id, label: b.title, area: `${area} lesson`, provenance: b.provenance, link })),
          { id: `w${c.week}-lab`, label: `${c.lab.id} — ${c.lab.title}`, area: `${area} lab`, link },
          { id: `w${c.week}-assignment`, label: c.assignment.title, area: `${area} assignment`, link },
          ...c.quiz.map((q, i) => ({ id: `quiz-${q.id}`, label: `Q${i + 1}: ${q.prompt}`, area: `${area} knowledge check`, link })),
        ]
      }),
    ...WEEKS.map((w) => ({ id: `week-${w.number}-schedule`, label: `Week ${w.number} outline: ${w.title}`, area: 'Course outline (A19 schedule)', link: `/week/${w.number}` })),
    ...DRAFT_WEEKS.map((w) => ({ id: `week-${w.number}-outline`, label: `Earlier outline, old Week ${w.number}: ${w.title}`, area: 'Earlier outline (superseded)', link: `/draft/${w.number}` })),
    { id: 'data-sheet', label: 'AeroLink Data Sheet (fictional parameters)', area: 'Case study', provenance: 'fictional', link: '/workspace/aerolink' },
    { id: 'stakeholder-checks', label: 'Stakeholder map acceptance checks', area: 'Lab L2', link: '/workspace/stakeholders' },
    { id: 'toolchain-statement', label: 'SysML toolchain statement', area: 'Phase II', link: '/sysml' },
  ]
}

/** Builds and downloads the review log (called from a click handler only). */
function downloadReviewLog(items: Item[], reviews: Record<string, { status: ReviewStatus; note: string; at: string }>) {
  const payload = {
    format: 'sysml-studio/review-log@1',
    exported: new Date().toISOString(),
    note: 'Review decisions recorded in a browser by a reviewer. Not an official university record.',
    items: items.map((i) => ({ ...i, ...(reviews[i.id] ?? { status: 'pending', note: '' }) })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sysml-studio-review-log.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function InstructorReview() {
  const { instructor, setInstructor, reviews, setReview } = useApp()
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all')
  const items = useMemo(() => reviewableItems(), [])
  const statusOf = (id: string): ReviewStatus => reviews[id]?.status ?? 'pending'
  const counts = { pending: 0, approved: 0, 'changes-requested': 0 } as Record<ReviewStatus, number>
  items.forEach((i) => counts[statusOf(i.id)]++)
  const shown = items.filter((i) => filter === 'all' || statusOf(i.id) === filter)

  const exportReviews = () => downloadReviewLog(items, reviews)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Instructor review"
        subtitle="Faculty review workspace for the prototype content. Approve or request changes item by item; decisions are stored in this browser and can be exported as a JSON review log."
      >
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={instructor} onChange={(e) => setInstructor(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          Show review controls throughout the app
        </label>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-semibold" data-testid="count-pending">{counts.pending}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
          <p className="text-2xl font-semibold" data-testid="count-approved">{counts.approved}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Changes requested</p>
          <p className="text-2xl font-semibold" data-testid="count-changes">{counts['changes-requested']}</p>
        </Card>
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm">
            Show{' '}
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
              <option value="all">All items ({items.length})</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="changes-requested">Changes requested</option>
            </select>
          </label>
          <Button variant="secondary" onClick={exportReviews}>
            Export review log (JSON)
          </Button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
                <th className="py-1 pr-2">Area</th>
                <th className="py-1 pr-2">Item</th>
                <th className="py-1 pr-2">Provenance</th>
                <th className="py-1 pr-2">Decision</th>
                <th className="py-1">Note</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                  <td className="py-1.5 pr-2 text-xs">{i.area}</td>
                  <td className="py-1.5 pr-2">
                    <Link to={i.link} className="hover:underline">{i.label}</Link>
                  </td>
                  <td className="py-1.5 pr-2">{i.provenance ? <ProvenanceBadge value={i.provenance} /> : <Badge>—</Badge>}</td>
                  <td className="py-1.5 pr-2">
                    <select
                      aria-label={`Decision for ${i.label}`}
                      value={statusOf(i.id)}
                      onChange={(e) => setReview(i.id, { status: e.target.value as ReviewStatus, note: reviews[i.id]?.note ?? '' })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve</option>
                      <option value="changes-requested">Request changes</option>
                    </select>
                  </td>
                  <td className="py-1.5">
                    <input
                      aria-label={`Note for ${i.label}`}
                      value={reviews[i.id]?.note ?? ''}
                      onChange={(e) => setReview(i.id, { status: statusOf(i.id), note: e.target.value })}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">What instructor mode shows</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Provenance badges on every lesson block (source-based, instructor-authored, fictional data, lab-sheet content).</li>
          <li>Inline approve / request-changes controls on lesson blocks, quiz questions, week outlines and the data sheet.</li>
          <li>The instructor example stakeholder map (teaching content) in the stakeholder editor, for rubric calibration.</li>
        </ul>
      </Card>
    </div>
  )
}
