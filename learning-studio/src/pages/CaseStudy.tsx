import { DATA_SHEET, ENTERPRISE, OFFICIAL_ELEMENTS, THREAD_LAYERS } from '../model/airtaxi'
import { useApp } from '../state/AppState'
import { Link } from '../lib/router'
import { Badge, Card, PageHeader, ReviewControls } from '../components/ui'

export function CaseStudy() {
  const { map } = useApp()
  const counts: Record<string, number> = {
    Stakeholder: map.stakeholders.length,
    'Logical Element': 0,
    'Physical Element': 0,
    'Information Flow': 0,
  }
  return (
    <div className="space-y-5">
      <PageHeader
        title="Air Taxi Enterprise workspace"
        subtitle={`${ENTERPRISE.name} (${ENTERPRISE.id}) — a fictional urban air-taxi operator used as the continuous case study. Every artifact you create keeps a stable ID so it can be traced from stakeholder analysis into the SysML v2 model.`}
      />
      <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          AeroLink is fictional. The course source collection contains no eVTOL, vertiport or FAA technical sources, so every number below is an instructor-set
          FICTIONAL teaching parameter. Do not cite these values as facts about real aircraft or regulations; record your own assumptions in the AROU register.
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold">Required digital thread (course requirement, MBSE draft syllabus)</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Stakeholder → Need → Capability → Requirement → Behavior → Logical Element → Physical Element → Information Flow → Verification Method → MOE/MOP →
          Associated Risk. Layers fill in as the course builds them; nothing is shown as complete before it exists.
        </p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" data-testid="thread-layers">
          {THREAD_LAYERS.map((l, i) => {
            const n = counts[l.name] ?? 0
            const active = l.name === 'Stakeholder'
            return (
              <li key={l.name} className={`rounded-lg border p-2 text-sm ${active ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
                <span className="text-xs text-slate-500 dark:text-slate-400">{i + 1}.</span> <strong>{l.name}</strong>
                <span className="block text-xs">
                  {active ? (
                    <>
                      {n} element(s) in your <Link to="/workspace/stakeholders" className="underline">stakeholder map</Link>
                    </>
                  ) : (
                    `Built from Week ${l.week}`
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {(
          [
            ['Logical functions', OFFICIAL_ELEMENTS.logical],
            ['Physical elements', OFFICIAL_ELEMENTS.physical],
            ['Operational scenarios', OFFICIAL_ELEMENTS.scenarios],
            ['Information items', OFFICIAL_ELEMENTS.information],
          ] as const
        ).map(([title, items]) => (
          <Card key={title}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{title}</h2>
              <Badge tone="emerald">Named in the lab sheet</Badge>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {items.map((e) => (
                <li key={e.id}>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{e.id}</span> {e.name} <span className="text-xs text-slate-500 dark:text-slate-400">({e.source})</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Listed, not yet modelled. Teams decompose and model these in Weeks 8–11.</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">AeroLink Data Sheet</h2>
          <Badge tone="amber">FICTIONAL</Badge>
        </div>
        <table className="mt-2 w-full text-left text-sm" data-testid="data-sheet">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
              <th className="py-1">Parameter</th>
              <th className="py-1">Value</th>
              <th className="py-1">Unit</th>
            </tr>
          </thead>
          <tbody>
            {DATA_SHEET.map((p) => (
              <tr key={p.key} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{p.label}</td>
                <td className="py-1 font-mono">{p.value}</td>
                <td className="py-1">{p.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Chosen for teaching tractability; not derived from any aircraft, operator or regulation.</p>
        <ReviewControls id="data-sheet" label="AeroLink Data Sheet" />
      </Card>

      <Card>
        <h2 className="font-semibold">Course questions this case must answer (from the lab sheet)</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Trade study (Week 7): additional aircraft vs additional vertiports, or another approved enterprise decision.</li>
          <li>Impact analysis (Week 13): What if battery range decreases? What if passenger demand doubles? What if regulations change?</li>
          <li>Evolution (Week 14): adding autonomous flight operations.</li>
        </ul>
      </Card>
    </div>
  )
}
