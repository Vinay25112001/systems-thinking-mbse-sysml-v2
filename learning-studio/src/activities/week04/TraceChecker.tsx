import { useMemo, useState } from 'react'
import { Badge, Button } from '../../components/ui'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { auditSet, drawSample, rb3SelfAudit } from './trace'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function TraceChecker() {
  const { model } = useWorkspace()
  const [source, setSource] = useState<'mine' | 'reference'>('mine')
  const [seed, setSeed] = useState(1)
  const [sample, setSample] = useState<string[] | null>(null)
  const m = useMemo(() => (source === 'mine' ? model : referenceUpTo(4)), [source, model])
  const a = useMemo(() => auditSet(m), [m])
  const rows = sample ? rb3SelfAudit(a.reqs, sample) : null

  return (
    <div className="space-y-3 text-sm" data-testid="w04-trace-checker">
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Requirement set to audit</legend>
        <label className="flex items-center gap-1">
          <input type="radio" name="w04-trace-source" checked={source === 'mine'} onChange={() => { setSource('mine'); setSample(null) }} />
          My workspace
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="w04-trace-source" checked={source === 'reference'} onChange={() => { setSource('reference'); setSample(null) }} />
          Instructor reference (read-only; for calibration)
        </label>
      </fieldset>

      <section aria-labelledby="w04-set-h" data-testid="w04-set-summary">
        <h4 id="w04-set-h" className="font-semibold">Set checks</h4>
        <ul className="list-disc pl-5">
          <li>
            Size: {a.total} requirements ({a.byLevel.STK} REQ-STK, {a.byLevel.SYS} REQ-SYS). L4 asks for 15–20: {a.sizeOk ? 'met' : 'not met'}.
          </li>
          <li>
            Types: {a.byType.functional} functional, {a.byType.performance} performance, {a.byType.interface} interface, {a.byType.constraint} constraint{a.byType.untyped ? `, ${a.byType.untyped} untyped` : ''}.{' '}
            {a.missingTypes.length ? `Missing: ${a.missingTypes.join(', ')} (RB-3.5 asks for a balanced set).` : 'All four types present.'}
          </li>
          <li>Orphans (no parent): {a.orphans.length ? a.orphans.join(', ') : 'none'}.</li>
          <li>Needs or capabilities with no child requirement: {a.childlessParents.length ? a.childlessParents.join(', ') : 'none'}.</li>
          <li>Duplicate statements: {a.duplicates.length ? a.duplicates.map((d) => d.join(' = ')).join('; ') : 'none'}.</li>
          <li>
            {a.clean} of {a.total} requirements have no failing heuristic check.
          </li>
        </ul>
      </section>

      {a.total > 0 && (
        <table className="w-full text-left text-xs">
          <caption className="text-left font-medium">Per-requirement checks (failing and to-review checks named; see the quality lab for explanations)</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">ID</th>
              <th className="py-1 pr-2">Type / method</th>
              <th className="py-1 pr-2">Parents</th>
              <th className="py-1 pr-2">Owner / provenance</th>
              <th className="py-1 pr-2">Fail</th>
              <th className="py-1">To review</th>
            </tr>
          </thead>
          <tbody>
            {a.reqs.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 align-top dark:border-slate-800" data-testid={`w04-trace-${r.id}`}>
                <td className="py-0.5 pr-2">
                  {r.id}
                  {!r.idOk && ' (ID not in the REQ-STK/REQ-SYS scheme)'}
                  {!r.levelAttrOk && ' (level attribute disagrees with ID)'}
                </td>
                <td className="py-0.5 pr-2">
                  {r.type ?? '—'} / {r.method ?? '—'}
                </td>
                <td className="py-0.5 pr-2">{r.parents.join(', ') || '—'}</td>
                <td className="py-0.5 pr-2">
                  {r.owner ?? '—'} / {r.provenance}
                </td>
                <td className="py-0.5 pr-2">{r.fails.length ? <Badge tone="rose">✗ {r.fails.join(', ')}</Badge> : 'none'}</td>
                <td className="py-0.5">{r.advisories.join(', ') || 'none'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section aria-labelledby="w04-rb3-h" className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <h4 id="w04-rb3-h" className="font-semibold">RB-3 self-audit on a random sample of 10</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          The grader draws 10 requirements at random and scores RB-3.1–3.4 as the percentage of the sample that meets each condition (≥ 90 % → 4, 75–89 % → 3, 50–74 % → 2, &lt; 50 % → 1). Here the conditions are approximated by the heuristic checks, so this is a rehearsal: the grader’s judgement, not this proxy, decides. RB-3.5 and 3.6 are judged on the whole set.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1">
            Seed
            <input type="number" className={`${input} w-24`} value={seed} onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)} />
          </label>
          <Button variant="secondary" disabled={a.total === 0} onClick={() => setSample(drawSample(a.reqs.map((r) => r.id), seed))}>
            Draw sample
          </Button>
        </div>
        {sample && rows && (
          <div className="mt-2" data-testid="w04-rb3">
            <p>Sample: {sample.join(', ')}</p>
            <table className="mt-1 text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-1 pr-3">Criterion</th>
                  <th className="py-1 pr-3">Met</th>
                  <th className="py-1">Proxy level</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-0.5 pr-3">
                      RB-{r.id} {r.label}
                    </td>
                    <td className="py-0.5 pr-3">
                      {r.met} of {r.of} ({r.pct} %)
                    </td>
                    <td className="py-0.5">{r.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
