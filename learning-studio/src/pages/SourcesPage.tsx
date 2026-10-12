import { useEffect, useState } from 'react'
import { READINGS, formatCitation } from '../content/readings'
import { Badge, Card, PageHeader } from '../components/ui'

const LEVEL: Record<string, string> = { E: 'Essential', X: 'Extension', I: 'Instructor reference' }

/** `focus` (from a Learn section's "Read more", route /sources/:id/:pages) names the exact pages to read and highlights
 *  that reading in the register. */
export function SourcesPage({ focus }: { focus?: { id: string; pages?: string } } = {}) {
  const [source, setSource] = useState('all')
  const [level, setLevel] = useState('all')
  const sources = Array.from(new Set(READINGS.map((r) => r.source)))
  const rows = READINGS.filter((r) => (source === 'all' || r.source === source) && (level === 'all' || r.level === level))
  const verified = READINGS.filter((r) => r.verified).length
  const target = focus ? READINGS.find((r) => r.id === focus.id) : undefined
  useEffect(() => {
    if (target) document.querySelector(`[data-reading-row="${target.id}"]`)?.scrollIntoView?.({ block: 'center' })
  }, [target])
  return (
    <div className="space-y-5">
      <PageHeader
        title="Verified sources"
        subtitle="Every citation in the app resolves to this register, generated from the project’s reading register (_source_cache/verification/readings.py). A reading is verified when its expected title appears on the cited first page and, for SEBoK, no reference list starts inside the range."
      />
      {target && (
        <Card className="border-brand-500">
          <h2 className="font-semibold" data-testid="read-more-target">
            Read more: {formatCitation({ reading: target.id, pages: focus!.pages })}
          </h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            Open {target.sourceTitle} in the course materials at {target.unit === 'slide' ? 'slides' : 'PDF pages'} {focus!.pages ?? `${target.firstPage}–${target.lastPage}`}. SEBoK page numbers are PDF page indices, not the printed page numbers.
          </p>
        </Card>
      )}
      <Card>
        <p className="text-sm">
          <strong>{verified}</strong> of {READINGS.length} entries pass the automated check; R30 is a declared exception (its last paragraph shares p.1395 with its
          reference list). Source documents are local course materials and are not distributed with this app.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <label>
            Source{' '}
            <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
              <option value="all">All</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Level{' '}
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
              <option value="all">All</option>
              <option value="E">Essential</option>
              <option value="X">Extension</option>
              <option value="I">Instructor reference</option>
            </select>
          </label>
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm" data-testid="sources-table">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Source</th>
                <th className="py-1 pr-2">Title on first page</th>
                <th className="py-1 pr-2">Range</th>
                <th className="py-1 pr-2">Level</th>
                <th className="py-1">Verification</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-reading-row={r.id} className={`border-b border-slate-100 dark:border-slate-800 ${target?.id === r.id ? 'bg-brand-50 font-medium dark:bg-slate-800' : ''}`}>
                  <td className="py-1 pr-2 font-mono text-xs">{r.id}</td>
                  <td className="py-1 pr-2 text-xs">{r.sourceTitle}</td>
                  <td className="py-1 pr-2">{r.title || '—'}</td>
                  <td className="py-1 pr-2 font-mono text-xs">
                    {r.unit === 'slide' ? 'sl.' : 'p.'}
                    {r.firstPage}–{r.lastPage}
                  </td>
                  <td className="py-1 pr-2 text-xs">{LEVEL[r.level]}</td>
                  <td className="py-1">{r.verified ? <Badge tone="emerald">Verified</Badge> : r.declaredException ? <Badge tone="amber">Declared exception</Badge> : <Badge tone="rose">Not verified</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
