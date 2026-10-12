import { useMemo, useState, type ChangeEvent } from 'react'
import { ELEMENT_KINDS, KIND_INFO, LINK_RULES, completeThreads, requirementCoverage, validateModel, type ElementKind, type EngineeringModel, type LinkType } from '../model/engineering'
import { referenceUpTo } from '../model/reference'
import { useWorkspace } from '../state/Workspace'
import { Link } from '../lib/router'
import { Badge, Button, Card, PageHeader } from '../components/ui'
import { DataTable } from './WeekPage'

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const LINK_TYPES = Object.keys(LINK_RULES) as LinkType[]

/** The student's AeroLink engineering model: every artefact the weekly tools create, with its links and checks. */
export function ModelWorkspacePage() {
  const ws = useWorkspace()
  const [kind, setKind] = useState<ElementKind | 'all'>('all')
  const [view, setView] = useState<'mine' | 'reference'>('mine')
  const [refWeek, setRefWeek] = useState(14)
  const [message, setMessage] = useState('')
  const [confirmLoad, setConfirmLoad] = useState(false)
  const [linkForm, setLinkForm] = useState<{ source: string; type: LinkType; target: string }>({ source: '', type: 'derives-from', target: '' })

  const model: EngineeringModel = useMemo(() => (view === 'mine' ? ws.model : referenceUpTo(refWeek)), [view, ws.model, refWeek])
  const issues = useMemo(() => validateModel(model), [model])
  const coverage = useMemo(() => requirementCoverage(model), [model])
  const threads = useMemo(() => completeThreads(model), [model])
  const counts = useMemo(() => Object.fromEntries(ELEMENT_KINDS.map((k) => [k, model.elements.filter((e) => e.kind === k && e.status === 'active').length])), [model])
  const shown = model.elements.filter((e) => kind === 'all' || e.kind === kind)
  const names = useMemo(() => Object.fromEntries(model.elements.map((e) => [e.id, e.name])), [model])

  const onImport = async (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]
    if (!f) return
    try {
      const data = JSON.parse(await f.text()) as EngineeringModel & { format?: string }
      if (!Array.isArray(data.elements) || !Array.isArray(data.links)) throw new Error('File is not an AeroLink model export')
      const errs = validateModel(data).filter((i) => i.severity === 'error')
      if (errs.length) throw new Error(`Model has ${errs.length} error(s), first: ${errs[0].message}`)
      ws.replaceAll(data)
      setMessage(`Imported ${data.elements.length} elements and ${data.links.length} links (stakeholders stay in the stakeholder editor).`)
    } catch (e) {
      setMessage(`Import failed: ${(e as Error).message}`)
    }
    ev.target.value = ''
  }

  const addLink = () => {
    const r = ws.addLink(linkForm.source.trim(), linkForm.type, linkForm.target.trim())
    setMessage(r.error ? `Link not added: ${r.error}` : `Added ${r.id}: ${linkForm.source} ${LINK_RULES[linkForm.type].reads} ${linkForm.target}`)
  }

  const coverageRow = (label: string, n: number) => [label, `${n} of ${coverage.length}`, coverage.length ? `${Math.round((100 * n) / coverage.length)} %` : '—']

  return (
    <div className="space-y-5">
      <PageHeader
        title="AeroLink engineering model"
        subtitle="One model for the whole course: stakeholders, needs, requirements, measures, risks, trade decisions, architecture and verification, linked with the course's ten relationship types. This is a teaching representation of the model's content, not a SysML v2 model; Part II expresses the same elements in SysML v2."
      />
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div role="radiogroup" aria-label="Which model to show" className="flex gap-2">
            <Button variant={view === 'mine' ? 'secondary' : 'ghost'} onClick={() => setView('mine')} ariaLabel="Show my team model">
              My model
            </Button>
            <Button variant={view === 'reference' ? 'secondary' : 'ghost'} onClick={() => setView('reference')} ariaLabel="Show the instructor reference model">
              Instructor reference
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            Reference as at the end of week
            <select aria-label="Reference week" value={refWeek} onChange={(e) => setRefWeek(Number(e.target.value))} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
              {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            Element type
            <select aria-label="Element type filter" value={kind} onChange={(e) => setKind(e.target.value as ElementKind | 'all')} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
              <option value="all">All ({model.elements.length})</option>
              {ELEMENT_KINDS.filter((k) => counts[k]).map((k) => (
                <option key={k} value={k}>
                  {k} — {KIND_INFO[k].label} ({counts[k]})
                </option>
              ))}
            </select>
          </label>
        </div>
        {view === 'mine' && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Button variant="ghost" onClick={() => download('aerolink-model.json', JSON.stringify({ format: 'sysml-studio/aerolink-model@1', exported: new Date().toISOString(), ...ws.model }, null, 2))}>
              Export JSON
            </Button>
            <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              Import JSON
              <input type="file" accept="application/json" className="sr-only" onChange={onImport} />
            </label>
            {!confirmLoad ? (
              <Button variant="ghost" onClick={() => setConfirmLoad(true)}>
                Load reference up to week {refWeek}…
              </Button>
            ) : (
              <span className="flex items-center gap-2">
                Replaces your model and your stakeholder map with the instructor reference.
                <Button
                  variant="danger"
                  onClick={() => {
                    ws.loadReference(refWeek)
                    setConfirmLoad(false)
                    setMessage(`Loaded the instructor reference as at week ${refWeek} (recovery input, lab plan §C.4).`)
                  }}
                >
                  Replace
                </Button>
                <Button variant="secondary" onClick={() => setConfirmLoad(false)}>
                  Cancel
                </Button>
              </span>
            )}
          </div>
        )}
        {message && (
          <p role="status" className="mt-3 text-sm" data-testid="model-message">
            {message}
          </p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Model checks</h2>
          <p className="mt-1 text-sm" data-testid="model-issues">
            {issues.filter((i) => i.severity === 'error').length} errors · {issues.filter((i) => i.severity === 'warning').length} warnings
          </p>
          <ul className="mt-2 max-h-48 list-disc overflow-y-auto pl-5 text-xs">
            {issues.slice(0, 50).map((i, k) => (
              <li key={k}>
                <Badge tone={i.severity === 'error' ? 'rose' : 'amber'}>{i.severity}</Badge> {i.message}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Requirement coverage</h2>
          <div className="mt-2">
            <DataTable
              caption="Active requirements with each kind of trace (Week 12 audit)"
              header={['Trace', 'Count', 'Share']}
              rows={[coverageRow('Parent (derives-from / refines)', coverage.filter((c) => c.hasParent).length), coverageRow('Satisfied by a design element', coverage.filter((c) => c.satisfied).length), coverageRow('Verified by a VER activity', coverage.filter((c) => c.verified).length)]}
            />
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Complete digital threads</h2>
          <p className="mt-1 text-sm" data-testid="thread-count">
            {threads.length} complete 11-link thread{threads.length === 1 ? '' : 's'} (CP5 minimum: 3)
          </p>
          <ol className="mt-2 max-h-48 list-decimal overflow-y-auto pl-5 text-xs">
            {threads.slice(0, 10).map((t) => (
              <li key={t.ids.join('>')} className="font-mono">
                {t.ids.join(' → ')}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Explore threads and impact in <Link to="/week/12" className="underline">Week 12</Link> and <Link to="/week/13" className="underline">Week 13</Link>.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Elements</h2>
        <div className="mt-2">
          <DataTable
            caption={`${shown.length} element(s)${view === 'reference' ? ' in the instructor reference' : ' in your model'}; values are fictional teaching data`}
            header={['ID', 'Type', 'Name', 'Statement', 'Provenance', 'Status']}
            rows={shown.map((e) => [e.id, e.kind, e.name, e.text ?? '', e.provenance, e.status === 'retired' ? `retired: ${e.retiredReason ?? ''}` : 'active'])}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Links</h2>
        {view === 'mine' && (
          <div className="mt-2 flex flex-wrap items-end gap-2 text-sm">
            <label className="flex flex-col">
              Source ID
              <input aria-label="Link source ID" value={linkForm.source} onChange={(e) => setLinkForm({ ...linkForm, source: e.target.value })} className="rounded border border-slate-300 px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-900" placeholder="REQ-SYS-001" />
            </label>
            <label className="flex flex-col">
              Relationship
              <select aria-label="Link type" value={linkForm.type} onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value as LinkType })} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                {LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LINK_RULES[t].reads}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col">
              Target ID
              <input aria-label="Link target ID" value={linkForm.target} onChange={(e) => setLinkForm({ ...linkForm, target: e.target.value })} className="rounded border border-slate-300 px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-900" placeholder="CAP-001" />
            </label>
            <Button onClick={addLink}>Add link</Button>
          </div>
        )}
        <div className="mt-3">
          <DataTable
            caption={`${model.links.length} link(s)`}
            header={['Link', 'Source', 'Relationship', 'Target', 'Rationale']}
            rows={model.links.map((l) => [l.id, `${l.source} ${names[l.source] ?? '(missing)'}`, LINK_RULES[l.type].reads, `${l.target} ${names[l.target] ?? '(missing)'}`, l.rationale ?? ''])}
          />
        </div>
      </Card>
    </div>
  )
}
