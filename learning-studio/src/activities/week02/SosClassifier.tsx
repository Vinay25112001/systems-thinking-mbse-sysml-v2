import { useState } from 'react'
import { Badge, Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  CHARACTERISTICS,
  SOS_CASES,
  SOS_TYPE_DEFINITION,
  SOS_TYPE_LABEL,
  evaluateCase,
  type CaseAnswer,
  type Governance,
  type Rating,
  type SosType,
  type Verdict,
} from './sos'

const RATING_LABEL: Record<Rating, string> = { yes: 'Present', partly: 'Partly', no: 'Absent' }
const VERDICT_LABEL: Record<Verdict, string> = { sos: 'A system of systems', 'not-sos': 'Not an SoS (a system and/or enterprise)', borderline: 'Borderline — needs an explicit argument' }
const GOV_QUESTIONS: { key: keyof Governance; label: string }[] = [
  { key: 'agreedPurpose', label: 'Is there a centrally agreed purpose for the whole?' },
  { key: 'designatedManager', label: 'Is there a designated SoS manager with resources for the SoS?' },
  { key: 'subordinated', label: 'Is the constituents’ normal operational mode subordinated to the central purpose?' },
]
const select = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const ok = 'text-emerald-700 dark:text-emerald-300'
const bad = 'text-rose-700 dark:text-rose-300'

const empty = (): CaseAnswer => ({ ratings: {}, governance: {} })

export function SosClassifier() {
  const [answers, setAnswers] = usePersistentState<Record<string, CaseAnswer>>('w02-sos', {})
  const [caseId, setCaseId] = useState(SOS_CASES[0].id)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const c = SOS_CASES.find((x) => x.id === caseId)!
  const a = answers[c.id] ?? empty()
  const set = (patch: Partial<CaseAnswer>) => {
    setAnswers((prev) => ({ ...prev, [c.id]: { ...(prev[c.id] ?? empty()), ...patch } }))
    setChecked((p) => ({ ...p, [c.id]: false }))
  }
  const f = evaluateCase(c, a)
  const isChecked = !!checked[c.id]

  return (
    <div data-testid="w02-sos-classifier" className="space-y-4 text-sm">
      <div>
        <label htmlFor="w02-sos-case" className="mr-2 font-medium">
          Case
        </label>
        <select id="w02-sos-case" className={select} value={caseId} onChange={(e) => setCaseId(e.target.value)}>
          {SOS_CASES.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <p className="mt-2 rounded bg-slate-50 p-2 dark:bg-slate-800/60">{c.description}</p>
      </div>

      <fieldset>
        <legend className="font-semibold">Step 1 — rate Maier’s five characteristics</legend>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">Characteristic</th>
              <th className="py-1 pr-2">Your rating</th>
              {isChecked && <th className="py-1">Instructor key</th>}
            </tr>
          </thead>
          <tbody>
            {CHARACTERISTICS.map((x) => {
              const v = a.ratings[x.id]
              const match = v === c.key[x.id]
              return (
                <tr key={x.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                  <td className="py-1.5 pr-2">
                    <span className="font-medium">{x.label}</span> {x.principal && <Badge tone="violet">principal</Badge>}
                    <p className="text-xs text-slate-600 dark:text-slate-400">{x.question}</p>
                  </td>
                  <td className="py-1.5 pr-2">
                    <select aria-label={`Rate ${x.label}`} className={select} value={v ?? ''} onChange={(e) => set({ ratings: { ...a.ratings, [x.id]: (e.target.value || undefined) as Rating | undefined } })}>
                      <option value="">Choose…</option>
                      {(Object.keys(RATING_LABEL) as Rating[]).map((r) => (
                        <option key={r} value={r}>
                          {RATING_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  {isChecked && (
                    <td className={`py-1.5 text-xs ${v ? (match ? ok : bad) : ''}`}>
                      {v ? (match ? '✓ Matches: ' : `✗ Key: ${RATING_LABEL[c.key[x.id]]}. `) : `Key: ${RATING_LABEL[c.key[x.id]]}. `}
                      {c.why[x.id]}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="mt-1">
          <CitationText c={{ reading: 'R08', pages: '832–833' }} /> · <CitationText c={{ reading: 'R09', pages: '866' }} />
        </p>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">Step 2 — your classification</legend>
        <div className="mt-1 flex flex-col gap-1">
          {(Object.keys(VERDICT_LABEL) as Verdict[]).map((v) => (
            <label key={v} className="flex items-center gap-2">
              <input type="radio" name={`w02-verdict-${c.id}`} checked={a.verdict === v} onChange={() => set({ verdict: v })} />
              {VERDICT_LABEL[v]}
            </label>
          ))}
        </div>
      </fieldset>

      {a.verdict === 'sos' && (
        <fieldset>
          <legend className="font-semibold">Step 3 — governance and SoS type</legend>
          {GOV_QUESTIONS.map((q) => (
            <div key={q.key} className="mt-1 flex flex-wrap items-center gap-2">
              <span>{q.label}</span>
              <select aria-label={q.label} className={select} value={a.governance[q.key] === undefined ? '' : a.governance[q.key] ? 'yes' : 'no'} onChange={(e) => set({ governance: { ...a.governance, [q.key]: e.target.value === '' ? undefined : e.target.value === 'yes' } })}>
                <option value="">Choose…</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label htmlFor={`w02-type-${c.id}`}>SoS type</label>
            <select id={`w02-type-${c.id}`} className={select} value={a.type ?? ''} onChange={(e) => set({ type: (e.target.value || undefined) as SosType | undefined })}>
              <option value="">Choose…</option>
              {(Object.keys(SOS_TYPE_LABEL) as SosType[]).map((t) => (
                <option key={t} value={t}>
                  {SOS_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 dark:text-slate-400">
            {(Object.keys(SOS_TYPE_LABEL) as SosType[]).map((t) => (
              <li key={t}>
                <strong>{SOS_TYPE_LABEL[t]}:</strong> {SOS_TYPE_DEFINITION[t]}
              </li>
            ))}
          </ul>
          <p className="mt-1">
            <CitationText c={{ reading: 'R09', pages: '868–869' }} />
          </p>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={() => setChecked((p) => ({ ...p, [c.id]: true }))} disabled={!a.verdict}>
          Check my classification
        </Button>
        <span className="text-xs text-slate-500 dark:text-slate-400">{f.ratingsAnswered} of 5 characteristics rated</span>
      </div>

      {isChecked && (
        <div role="status" className="space-y-1 rounded border border-slate-200 p-3 dark:border-slate-700" data-testid="w02-sos-feedback">
          <p>
            Your ratings match the key on <strong>{f.ratingMatches}</strong> of {f.ratingsAnswered} answered characteristics.
          </p>
          {f.impliedVerdict ? (
            <p className={f.consistent ? ok : bad}>
              {f.consistent ? '✓ Follows. ' : '✗ Does not follow. '}
              Applying Maier’s rule to <em>your own</em> ratings gives: {VERDICT_LABEL[f.impliedVerdict]}.{' '}
              {f.consistent
                ? f.needsArgument
                  ? 'Your classification follows from your ratings only if you argue explicitly why the “partly” rating falls short of independence (R09 p.866: a system without both characteristics is not an SoS). Write that argument in your memo.'
                  : 'Your classification follows from your ratings.'
                : 'Your classification does not follow from your ratings — revisit one or the other.'}
            </p>
          ) : (
            <p>Rate both principal characteristics to see what your ratings imply.</p>
          )}
          {f.decidedByNonPrincipal && (
            <p className={bad}>✗ You called it an SoS although a principal characteristic is absent. Geographic distribution, emergence and evolution are common in SoS but are not taxonomic classifiers (R08 p.833).</p>
          )}
          <p className={f.verdictMatchesKey ? ok : bad}>
            {f.verdictMatchesKey ? '✓ Matches the key. ' : '✗ Differs from the key. '}
            Instructor verdict: {VERDICT_LABEL[c.verdict]}
            {c.alsoAccept?.length ? ` (also accepted when argued: ${c.alsoAccept.map((v) => VERDICT_LABEL[v]).join('; ')})` : ''}. {c.verdictWhy}
          </p>
          {a.verdict === 'sos' && f.impliedType && (
            <p className={f.typeConsistent && f.typeMatchesKey !== false ? ok : bad}>
              {f.typeConsistent === undefined ? '' : f.typeConsistent ? '✓ Type follows from your governance answers. ' : '✗ Type does not follow from your governance answers. '}
              Your governance answers imply a {SOS_TYPE_LABEL[f.impliedType].toLowerCase()} SoS{a.type ? `; you chose ${SOS_TYPE_LABEL[a.type].toLowerCase()}` : ''}.
              {c.type ? ` Instructor key: ${SOS_TYPE_LABEL[c.type].toLowerCase()}${f.typeMatchesKey === undefined ? '' : f.typeMatchesKey ? ' (✓ matches)' : ' (✗ differs)'}.` : ''}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The key is instructor-authored and arguable for “partly” ratings. A well-reasoned different rating can earn full credit in the memo if the verdict follows from it.
          </p>
        </div>
      )}
    </div>
  )
}
