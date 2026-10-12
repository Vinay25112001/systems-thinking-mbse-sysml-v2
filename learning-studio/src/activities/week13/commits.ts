// Week 13 graduate example (d): commit-based change analysis, following the Systems Modeling API and Services v1.1
// Beta 2 Project Data Versioning model (S08 §7.1.2, R88 p.32-35, PDF page indices). Pure logic, unit-tested.
//
// What the source defines and this file implements:
//   - A Commit has previousCommits, a `change` set of DataVersions (created, updated or deleted data; a deletion is a
//     DataVersion whose payload is null) and the derived `versionedData` (p.33).
//   - versionedData = updatedNotDeleted ∪ retained, where retained comes from the previous commits' versionedData minus
//     the identities changed in this commit, one DataVersion per identity (p.34, steps 1-5 and the OCL).
//   - Invariants (p.34): a deletion is valid only if a previous commit holds that identity; an identity appears at most
//     once in a change; a merge commit must resolve every identity whose version differs between its parents by listing
//     it in its change; `created` must be strictly later than every previous commit's.
//   - Commits are immutable and not destructible; a Branch is a mutable pointer (head); a Tag is an immutable pointer used
//     for baselines (p.35-36).
// What is COURSE INTERPRETATION (labelled in the lesson): using the identity set that differs between two commits as the
// SEED of an impact analysis, and the claim that a diff alone is not an impact set.

export type DataVersion = { identity: string; payload: string | null }
export type Commit = { id: string; created: string; previousCommits: string[]; change: DataVersion[]; note?: string }

/** versionedData of a commit as identity -> payload (R88 p.34, steps 1-5). Throws on a missing previous commit. */
export function versionedData(commitId: string, commits: Commit[], memo = new Map<string, Map<string, string>>()): Map<string, string> {
  const hit = memo.get(commitId)
  if (hit) return hit
  const c = commits.find((x) => x.id === commitId)
  if (!c) throw new Error(`Unknown commit ${commitId}`)
  const updatedIdentities = new Set(c.change.map((d) => d.identity))
  const result = new Map<string, string>()
  for (const p of c.previousCommits) {
    for (const [identity, payload] of versionedData(p, commits, memo)) {
      if (updatedIdentities.has(identity)) continue // step 3
      if (!result.has(identity)) result.set(identity, payload) // step 4: one per identity
    }
  }
  for (const d of c.change) if (d.payload !== null) result.set(d.identity, d.payload) // steps 1 and 5
  memo.set(commitId, result)
  return result
}

export type Violation = { commit: string; rule: 'merge-unresolved' | 'invalid-deletion' | 'duplicate-identity' | 'time-order'; identity?: string; message: string }

/** Checks the four invariants of R88 p.34 on every commit. */
export function checkHistory(commits: Commit[]): Violation[] {
  const out: Violation[] = []
  const at = (id: string) => commits.find((c) => c.id === id)
  for (const c of commits) {
    const seen = new Set<string>()
    for (const d of c.change) {
      if (seen.has(d.identity)) out.push({ commit: c.id, rule: 'duplicate-identity', identity: d.identity, message: `${c.id} lists ${d.identity} twice in its change set.` })
      seen.add(d.identity)
      if (d.payload === null && !c.previousCommits.some((p) => versionedData(p, commits).has(d.identity)))
        out.push({ commit: c.id, rule: 'invalid-deletion', identity: d.identity, message: `${c.id} deletes ${d.identity}, which no previous commit contains.` })
    }
    if (c.previousCommits.length > 1) {
      const parents = c.previousCommits.map((p) => versionedData(p, commits))
      const ids = new Set(parents.flatMap((m) => [...m.keys()]))
      for (const id of [...ids].sort()) {
        const versions = parents.map((m) => (m.has(id) ? m.get(id)! : null))
        const differs = versions.some((v) => v !== versions[0])
        if (differs && !seen.has(id)) out.push({ commit: c.id, rule: 'merge-unresolved', identity: id, message: `${c.id} merges parents that hold different versions of ${id} but does not list ${id} in its change set.` })
      }
    }
    for (const p of c.previousCommits) {
      const pc = at(p)
      if (pc && !(Date.parse(c.created) > Date.parse(pc.created))) out.push({ commit: c.id, rule: 'time-order', message: `${c.id} (${c.created}) is not strictly later than ${p} (${pc.created}).` })
    }
  }
  return out
}

export type Diff = { added: string[]; changed: string[]; deleted: string[] }

/** Identities that differ between two commits' versionedData (the seed of an impact analysis; course interpretation). */
export function diff(fromCommit: string, toCommit: string, commits: Commit[]): Diff {
  const a = versionedData(fromCommit, commits)
  const b = versionedData(toCommit, commits)
  const added = [...b.keys()].filter((k) => !a.has(k)).sort()
  const deleted = [...a.keys()].filter((k) => !b.has(k)).sort()
  const changed = [...b.keys()].filter((k) => a.has(k) && a.get(k) !== b.get(k)).sort()
  return { added, changed, deleted }
}

/** Mutability and destruction of the three reference records (R88 p.36 table). */
export const RECORD_SEMANTICS = [
  { record: 'Commit', mutable: false, destructible: false },
  { record: 'Branch', mutable: true, destructible: true },
  { record: 'Tag', mutable: false, destructible: true },
] as const

// ------------------------------------------------------------------------------------------------
// The worked history (FICTIONAL): CP4 baseline, the REQ-SYS-001 change on main, a battery study on a branch, and a merge.

export const WORKED_HISTORY: Commit[] = [
  {
    id: 'C1', created: '2026-11-13T21:00:00Z', previousCommits: [], note: 'CP4 model, tagged cp4-baseline',
    change: [
      { identity: 'REQ-SYS-001', payload: 'maxChargeTime = 20 min' },
      { identity: 'TPM-001', payload: 'threshold 20 min; estimate 18 min' },
      { identity: 'VER-001', payload: 'criterion: all 30 charges <= 20.0 min' },
      { identity: 'TPM-003', payload: 'estimate 23 %' },
    ],
  },
  {
    id: 'C2', created: '2026-11-24T15:10:00Z', previousCommits: ['C1'], note: 'main: REQ-SYS-001 tightened to 18 min',
    change: [
      { identity: 'REQ-SYS-001', payload: 'maxChargeTime = 18 min' },
      { identity: 'TPM-001', payload: 'threshold 18 min; estimate 18 min' },
    ],
  },
  {
    id: 'C3', created: '2026-11-24T16:40:00Z', previousCommits: ['C1'], note: 'battery-study branch: new supplier data',
    change: [
      { identity: 'TPM-001', payload: 'threshold 20 min; estimate 18.4 min' },
      { identity: 'TPM-003', payload: 'estimate 21.5 %' },
    ],
  },
  {
    id: 'C4', created: '2026-11-25T09:00:00Z', previousCommits: ['C2', 'C3'], note: 'merge of battery-study into main (first draft: lists only the identity both branches edited)',
    change: [{ identity: 'TPM-001', payload: 'threshold 18 min; estimate 18.4 min' }],
  },
]

/** The merge as the API requires it (R88 p.34): every identity whose version differs between C2 and C3 is listed. */
export const RESOLVED_MERGE: Commit = {
  id: 'C4', created: '2026-11-25T09:00:00Z', previousCommits: ['C2', 'C3'], note: 'merge of battery-study into main, conflicts resolved',
  change: [
    { identity: 'REQ-SYS-001', payload: 'maxChargeTime = 18 min' },
    { identity: 'TPM-001', payload: 'threshold 18 min; estimate 18.4 min' },
    { identity: 'TPM-003', payload: 'estimate 21.5 %' },
  ],
}
export const RESOLVED_HISTORY: Commit[] = [...WORKED_HISTORY.filter((c) => c.id !== 'C4'), RESOLVED_MERGE]
