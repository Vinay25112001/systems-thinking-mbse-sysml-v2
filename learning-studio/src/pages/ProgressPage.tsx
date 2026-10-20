import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { WEEKS } from '../content/course'
import { CURRENT_CONTENT } from '../content/weeks'
import { validateStakeholderMap } from '../model/stakeholderValidation'
import { removeKey } from '../lib/storage'
import { useApp } from '../state/AppState'
import { fraction, weekProgress } from '../state/progress'
import { Button, Card, PageHeader, ProgressBar } from '../components/ui'

export function ProgressPage() {
  const { completed, quiz, boundary, map, resolvedTheme } = useApp()
  const [confirm, setConfirm] = useState(false)
  const w1 = weekProgress(1, completed, quiz, boundary)
  const checks = validateStakeholderMap(map.stakeholders, map.relationships)
  const data = WEEKS.map((w) => ({ week: `W${w.number}`, percent: Math.round(fraction(weekProgress(w.number, completed, quiz, boundary)) * 100), available: !!CURRENT_CONTENT[w.number] }))
  const attempts = Object.values(CURRENT_CONTENT).flatMap((c) => c.quiz).reduce((a, q) => a + (quiz[q.id]?.attempts ?? 0), 0)
  const axis = resolvedTheme === 'dark' ? '#94a3b8' : '#475569'

  return (
    <div className="space-y-5">
      <PageHeader title="My progress" subtitle="Computed from what you have actually done in this browser. Weeks being rebuilt from the Week 1 template have no interactive content yet; they show 0% and are marked provisional." />
      <Card>
        <h2 className="font-semibold">Week 1</h2>
        <div className="mt-3 space-y-3">
          {w1.parts.map((p) => (
            <ProgressBar key={p.label} value={fraction(p)} label={`${p.label} (${p.done}/${p.total})`} />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Knowledge-check attempts so far: {attempts}</p>
      </Card>
      <Card>
        <h2 className="font-semibold">Completion by week</h2>
        <div className="mt-2 h-64" role="img" aria-label="Bar chart of completion by week; the table below gives the same data.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="week" stroke={axis} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke={axis} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Bar dataKey="percent" name="Completion" fill="#2f6fd6" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">Completion by week (table equivalent)</caption>
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
              <th className="py-1">Week</th>
              <th className="py-1">Status</th>
              <th className="py-1">Completion</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.week} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{d.week}</td>
                <td className="py-1">{d.available ? 'Authored module' : 'Provisional: being rebuilt'}</td>
                <td className="py-1">{d.available ? `${d.percent}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h2 className="font-semibold">Stakeholder map (Lab L2)</h2>
        <p className="mt-1 text-sm">
          {checks.filter((c) => c.passed).length} of {checks.length} acceptance checks passed.
        </p>
      </Card>
      <Card>
        <h2 className="font-semibold">Reset my progress</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Clears lesson completion, knowledge-check answers and the boundary exercise. Your stakeholder map is kept.</p>
        <div className="mt-3">
          {!confirm ? (
            <Button variant="ghost" onClick={() => setConfirm(true)}>
              Reset progress…
            </Button>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              This cannot be undone.
              <Button
                variant="danger"
                onClick={() => {
                  ;['completed', 'quiz', 'boundary'].forEach(removeKey)
                  window.location.reload()
                }}
              >
                Yes, reset
              </Button>
              <Button variant="secondary" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}
