import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import type { ElementKind } from '../../model/engineering'
import { referenceUpTo } from '../../model/reference'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { KIND_MAPPING, L9_PACKAGES, buildMapping, mappingMarkdown, referenceProblems, shortNameProblem, summarise, type KindChoice, type PackageChoice } from './mapping'

type Store = { choices: Partial<Record<ElementKind, KindChoice>>; tryId: string; tryText: string; refText: string }

const INITIAL: Store = { choices: {}, tryId: '', tryText: '', refText: "Physical::aeroLink.'PHY-003'" }

export function PackageMapper() {
  const { model } = useWorkspace()
  const [store, setStore] = usePersistentState<Store>('w09-mapper', INITIAL)
  const [useReference, setUseReference] = useState(false)
  const source = useReference ? referenceUpTo(8).elements : model.elements
  const rows = useMemo(() => buildMapping(source, store.choices), [source, store.choices])
  const summary = summarise(rows)
  const kinds = [...new Set(rows.map((r) => r.kind))].sort()
  const tryRow = rows.find((r) => r.id === store.tryId) ?? rows[0]
  const tryProblem = tryRow ? shortNameProblem(tryRow.id, store.tryText) : null
  const refProblems = referenceProblems(store.refText)
  const setChoice = (k: ElementKind, c: KindChoice) => setStore({ ...store, choices: { ...store.choices, [k]: { ...store.choices[k], ...c } } })

  return (
    <div className="space-y-3 text-sm" data-testid="w09-mapper">
      <p>
        This tool reads your workspace (Part I artefacts, by ID) and proposes where each kind goes among the nine L9 packages, the SysML construct the course reference uses, and the short-name form of each ID. It produces a <strong>planning table</strong> for your L9 deliverable. It is not a SysML model, and it does not check SysML: your model file is checked only by the course-designated checker.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={useReference} onChange={(e) => setUseReference(e.target.checked)} />
          Preview with the instructor reference baseline up to Week 8 (read-only; nothing is written to your workspace)
        </label>
        <span role="status" data-testid="w09-mapper-summary">
          {summary.elements === 0
            ? 'No elements: your workspace is empty. Tick the preview box, or record your Part I artefacts first.'
            : `${summary.elements} elements; ${summary.mapped} placed in a package; ${summary.unmapped.length ? `kinds without an L9 package: ${summary.unmapped.join(', ')}` : 'every kind placed'}; ${summary.withProblems} with open problems.`}
        </span>
      </div>

      {kinds.length > 0 && (
        <table className="w-full border-collapse text-xs">
          <caption className="text-left font-medium">Placement by kind (change a proposal only with a recorded reason)</caption>
          <thead>
            <tr className="border-b border-slate-300 text-left dark:border-slate-700">
              <th className="p-1">Kind</th>
              <th className="p-1">Proposed (C.2 / reference)</th>
              <th className="p-1">Your package</th>
              <th className="p-1">Reason if different</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map((k) => {
              const m = KIND_MAPPING[k]
              const c = store.choices[k] ?? {}
              return (
                <tr key={k} className="border-b border-slate-200 align-top dark:border-slate-800">
                  <td className="p-1 font-mono">{k}</td>
                  <td className="p-1">
                    {m.pkg ?? <strong>none at L9</strong>} · {m.construct}
                    {m.note && <span className="block text-slate-600 dark:text-slate-400">{m.note}</span>}
                  </td>
                  <td className="p-1">
                    <select aria-label={`Package for ${k}`} className="rounded border border-slate-300 bg-white px-1 py-0.5 dark:border-slate-700 dark:bg-slate-900" value={c.pkg ?? m.pkg ?? ''} onChange={(e) => setChoice(k, { pkg: (e.target.value || undefined) as PackageChoice | undefined })}>
                      <option value="">(undecided)</option>
                      {L9_PACKAGES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value="Other">Other (a package you add)</option>
                    </select>
                    {(c.pkg ?? m.pkg) === 'Other' && (
                      <input aria-label={`Name of the package you add for ${k}`} placeholder="Package name, e.g. Analysis" className="mt-1 block w-full rounded border border-slate-300 bg-white px-1 py-0.5 dark:border-slate-700 dark:bg-slate-900" value={c.otherName ?? ''} onChange={(e) => setChoice(k, { otherName: e.target.value })} />
                    )}
                  </td>
                  <td className="p-1">
                    <input aria-label={`Reason for placing ${k}`} className="w-full rounded border border-slate-300 bg-white px-1 py-0.5 dark:border-slate-700 dark:bg-slate-900" value={c.reason ?? ''} onChange={(e) => setChoice(k, { reason: e.target.value })} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {rows.length > 0 && (
        <div className="max-h-80 overflow-auto rounded border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-xs" data-testid="w09-mapper-rows">
            <caption className="text-left font-medium">Element mapping ({rows.length} rows)</caption>
            <thead>
              <tr className="border-b border-slate-300 text-left dark:border-slate-700">
                <th className="p-1">ID</th>
                <th className="p-1">Package</th>
                <th className="p-1">Short name</th>
                <th className="p-1">Declared name</th>
                <th className="p-1">Problems</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-200 align-top dark:border-slate-800">
                  <td className="p-1 font-mono">{r.id}</td>
                  <td className="p-1">{r.pkgLabel}</td>
                  <td className="p-1 font-mono">{r.shortName}</td>
                  <td className="p-1 font-mono">{r.declaredName}</td>
                  <td className="p-1">{r.problems.length ? <span>⚠ {r.problems.join(' ')}</span> : 'none'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Practise the quoting rule</legend>
        {tryRow ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col">
              Element
              <select aria-label="Element to write" className="rounded border border-slate-300 bg-white px-1 py-0.5 dark:border-slate-700 dark:bg-slate-900" value={tryRow.id} onChange={(e) => setStore({ ...store, tryId: e.target.value })}>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col">
              Short name as you would write it
              <input aria-label="Short name as you would write it" className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-900" value={store.tryText} onChange={(e) => setStore({ ...store, tryText: e.target.value })} />
            </label>
            <span role="status" data-testid="w09-shortname-feedback">
              {store.tryText ? (tryProblem ? `✗ ${tryProblem}` : '✓ Correct form for this ID.') : ''}
            </span>
          </div>
        ) : (
          <p>No elements to practise on yet.</p>
        )}
        <label className="mt-2 flex flex-col">
          A reference to an element by ID (qualified name or feature chain)
          <input aria-label="Reference to check" className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-900" value={store.refText} onChange={(e) => setStore({ ...store, refText: e.target.value })} />
        </label>
        <p role="status" data-testid="w09-reference-feedback">
          {refProblems.length ? `✗ ${refProblems.join(' ')}` : '✓ Every segment is a basic name or quoted. (Whether it resolves is for the checker to say.)'}
        </p>
      </fieldset>

      {rows.length > 0 && (
        <details>
          <summary className="cursor-pointer">Mapping table (Markdown) for the L9 deliverable</summary>
          <textarea aria-label="Mapping table in Markdown" readOnly className="mt-1 h-48 w-full rounded border border-slate-300 bg-white p-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-900" value={mappingMarkdown(rows, store.choices)} />
        </details>
      )}
      <Button variant="secondary" onClick={() => setStore(INITIAL)}>
        Clear my choices
      </Button>
    </div>
  )
}
