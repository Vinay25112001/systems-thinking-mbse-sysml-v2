import { useState } from 'react'
import { Button } from '../../components/ui'
import { referenceUpTo } from '../../model/reference'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { EMPTY_TRANSLATION, assemble, checkTranslation, summariseChecks, type Translation } from './translator'

type Store = { byReq: Record<string, Translation | undefined>; selected: string }

const FIELDS: { key: keyof Translation; label: string; placeholder: string; wide?: boolean }[] = [
  { key: 'shortName', label: 'Short name (the requirement ID)', placeholder: "<'REQ-SYS-0nn'>" },
  { key: 'declaredName', label: 'Declared name', placeholder: "'Title from your table'" },
  { key: 'docText', label: 'doc text (the statement)', placeholder: 'The … shall …', wide: true },
  { key: 'subjectName', label: 'Subject name', placeholder: 'e.g. chargingSystem' },
  { key: 'subjectType', label: 'Subject type (a definition)', placeholder: 'e.g. ChargingSystems' },
  { key: 'paramName', label: 'Parameter name (optional)', placeholder: 'e.g. maxChargeTime' },
  { key: 'paramType', label: 'Parameter type', placeholder: 'e.g. DurationValue' },
  { key: 'paramValue', label: 'Bound value (empty for a TBD)', placeholder: 'e.g. 20 [min]' },
  { key: 'constraint', label: 'Required constraint expression', placeholder: 'e.g. chargingSystem.chargeTimeToDispatch <= maxChargeTime', wide: true },
]

const mark = (ok: boolean | null) => (ok === true ? '✓ pass' : ok === false ? '✗ fails' : '? reviewer decides')

export function ReqTranslator() {
  const { model } = useWorkspace()
  const [useReference, setUseReference] = useState(false)
  const [store, setStore] = usePersistentState<Store>('w10-translator', { byReq: {}, selected: '' })
  const reqs = (useReference ? referenceUpTo(8).elements : model.elements).filter((e) => e.kind === 'REQ' && e.status === 'active')
  const req = reqs.find((r) => r.id === store.selected) ?? reqs[0]
  const t = (req && store.byReq[req.id]) ?? EMPTY_TRANSLATION
  const checks = req ? checkTranslation(req, t) : []
  const sum = summariseChecks(checks)
  const set = (k: keyof Translation, v: string) => req && setStore({ ...store, selected: req.id, byReq: { ...store.byReq, [req.id]: { ...t, [k]: v } } })

  return (
    <div className="space-y-3 text-sm" data-testid="w10-translator">
      <p>
        Choose a requirement from your workspace and write each part of its SysML v2 requirement usage. The tool checks the fields you type against explicit criteria, each with its source. It is a <strong>teaching aid, not a SysML parser</strong>: it does not validate SysML, and the assembled text below is valid only once the course-designated checker accepts it in your model. Its wording checks are narrow: the direction check reads the limit words just before the value (“within”, “at least”, and negated forms such as “shall not take more than” or “shall not be less than”), and does not judge a statement worded any other way; the value check reads the parameter type you declare (a …Value type needs a unit; Real, Integer and Natural take none; percentages are written as fractions, a course convention). Nothing is written to your workspace.
      </p>
      <label className="flex items-center gap-1.5">
        <input type="checkbox" checked={useReference} onChange={(e) => setUseReference(e.target.checked)} />
        Practise on the instructor reference requirements (read-only; nothing is written to your workspace)
      </label>
      {reqs.length === 0 ? (
        <p role="status" data-testid="w10-translator-empty">
          No requirements in your workspace. Record your CP2 requirements first, or tick the practice box.
        </p>
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Requirement</span>
            <select aria-label="Requirement to translate" className="rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-900" value={req!.id} onChange={(e) => setStore({ ...store, selected: e.target.value })}>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} {r.name}
                </option>
              ))}
            </select>
          </label>
          <blockquote className="border-l-4 border-slate-300 pl-2 dark:border-slate-700" data-testid="w10-translator-statement">
            <span className="font-mono">{req!.id}</span>: {req!.text ?? '(no statement recorded)'}
          </blockquote>
          <div className="grid gap-2 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.key} className={`flex flex-col gap-1 ${f.wide ? 'sm:col-span-2' : ''}`}>
                <span>{f.label}</span>
                <input className="rounded border border-slate-300 p-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-900" aria-label={f.label} placeholder={f.placeholder} value={t[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              </label>
            ))}
          </div>
          <ul className="space-y-1" data-testid="w10-translator-checks" aria-label="Checks">
            {checks.map((c) => (
              <li key={c.id} className="rounded border border-slate-200 p-1.5 dark:border-slate-800">
                <strong>{mark(c.ok)}</strong> — {c.label}. {c.message} <span className="text-xs text-slate-600 dark:text-slate-400">[{c.source}]</span>
              </li>
            ))}
          </ul>
          <p role="status" data-testid="w10-translator-summary">
            {sum.passed} pass, {sum.failed} fail, {sum.advisory} for a reviewer to decide.
          </p>
          <div>
            <p className="font-medium">Assembled text (copy into your model, then run the checker)</p>
            <pre tabIndex={0} aria-label="Assembled SysML text for the selected requirement" className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-950" data-testid="w10-translator-text">
              <code>{assemble(t)}</code>
            </pre>
          </div>
          <Button variant="secondary" onClick={() => setStore({ ...store, byReq: { ...store.byReq, [req!.id]: undefined } })}>
            Clear this requirement
          </Button>
        </>
      )}
    </div>
  )
}
