import { useId } from 'react'
import type { ElementProvenance } from '../model/engineering'

/** Provenance choices a student may record (lab plan §C.2 rule 5). Instructor-only tags are excluded. */
export const STUDENT_PROVENANCE: { value: ElementProvenance; label: string }[] = [
  { value: 'team-derived', label: 'Team-derived' },
  { value: 'team-assumption', label: 'Team assumption' },
  { value: 'AI-suggested-reviewed', label: 'AI-suggested, reviewed by the owner' },
  { value: 'cited', label: 'Cited from a source' },
]

export type ProvenanceOwner = { provenance: ElementProvenance; owner: string }

export const DEFAULT_PROVENANCE_OWNER: ProvenanceOwner = { provenance: 'team-derived', owner: '' }

/** Owner initials are required for individual accountability (syllabus §12): 2–4 letters. */
export function ownerProblem(owner: string): string | null {
  return /^[A-Za-z]{2,4}$/.test(owner.trim()) ? null : 'Enter the owner’s initials (2–4 letters).'
}

/**
 * Shared owner + provenance inputs for every workspace recorder. Pass the values into `apply()` as
 * `{ owner, provenance }` on each element the student creates.
 */
export function ProvenanceOwnerFields({ value, onChange }: { value: ProvenanceOwner; onChange: (v: ProvenanceOwner) => void }) {
  const id = useId()
  const problem = value.owner ? ownerProblem(value.owner) : null
  return (
    <div className="flex flex-wrap items-end gap-3 text-sm" data-testid="provenance-owner">
      <label className="flex flex-col" htmlFor={`${id}-owner`}>
        Owner (initials)
        <input
          id={`${id}-owner`}
          value={value.owner}
          onChange={(e) => onChange({ ...value, owner: e.target.value })}
          aria-invalid={!!problem}
          aria-describedby={problem ? `${id}-owner-err` : undefined}
          className="w-24 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          placeholder="e.g. JS"
        />
      </label>
      <label className="flex flex-col" htmlFor={`${id}-prov`}>
        Provenance
        <select
          id={`${id}-prov`}
          value={value.provenance}
          onChange={(e) => onChange({ ...value, provenance: e.target.value as ElementProvenance })}
          className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          {STUDENT_PROVENANCE.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      {problem && (
        <p id={`${id}-owner-err`} role="alert" className="text-xs text-rose-700 dark:text-rose-300">
          {problem}
        </p>
      )}
      {value.provenance === 'AI-suggested-reviewed' && (
        <p className="basis-full text-xs text-slate-700 dark:text-slate-300">
          Record in your AI usage statement what the tool suggested and what you changed or rejected (RB-12.3).
        </p>
      )}
    </div>
  )
}
