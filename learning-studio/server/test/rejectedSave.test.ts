// M7 confirmation N1 / second confirmation S1: a change set the course server refuses for its content (400: here a
// Week 8 mapping whose package name is not a package) is never discarded and never reported as saved. Driven end to
// end like the SPA: ProjectStore + HttpProjectAdapter against the real server. The student is told in plain words that
// the change was refused and not saved; the edits stay in the tab and in the outbox; the existing recovery ("Keep my
// edits as a version and load the saved project") writes the version first and then lets later edits save. An
// automatic drop of the refused change was tried and withdrawn (it could lose work on a stale token, lost access or a
// failed version write): see docs/week1/M7_REPORT.md §6.2.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ModelMapping, ProjectDoc } from '../../src/project/model/types'
import { ProjectStore } from '../../src/project/store/ProjectStore'
import { getBackend, signIn } from '../../src/services/backend'
import { HttpProjectAdapter } from '../../src/services/httpProjectAdapter'
import { ORIGIN, startTest, type T } from './helpers'

let t: T
const realFetch: typeof fetch = globalThis.fetch.bind(globalThis)
let store: ProjectStore
const mem = new Map<string, string>()
const box = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) }
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!
const settle = async (s: ProjectStore) => {
  await s.flush()
  for (let i = 0; i < 50 && (s.getState().save.kind === 'saving' || s.getState().save.kind === 'pending'); i++) await new Promise((r) => setTimeout(r, 10))
}

beforeEach(async () => {
  t = await startTest()
  mem.clear()
  const a = await t.user('student', 'Team 1', { initials: 'AA' })
  let cookie = ''
  globalThis.fetch = (async (input: string | URL | Request, init: RequestInit = {}) => {
    if (!(typeof input === 'string' && input.startsWith('/'))) return realFetch(input, init)
    const r = await realFetch(t.base + input, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN, ...(cookie ? { Cookie: cookie } : {}) } })
    for (const c of r.headers.getSetCookie()) cookie = c.split(';')[0]
    return r
  }) as typeof fetch
  await signIn(a.login, a.password)
  store = new ProjectStore(new HttpProjectAdapter(getBackend().session!, { outbox: box }), { autosaveMs: 5, retryMs: 5 })
  await store.init()
  await store.create({ teamLabel: 'ignored', initials: 'ZZ', enterpriseName: 'Refusal Test Enterprise' })
  await settle(store)
})
afterEach(async () => {
  store.dispose()
  globalThis.fetch = realFetch
  await t.close()
})

describe('a change the course server refuses for its content is never lost or reported as saved', () => {
  it('reports "not saved" in plain words, keeps the edit in the tab and the outbox; the recovery keeps a version, then later edits save', async () => {
    const before = store.getState().snapshots.length
    const bad: ModelMapping = { uid: 'map-bad-1', id: 'MAP-001', artifact: ent(store.getState().doc!).uid, elements: [], rule: 'custom', status: 'mapped', statusReason: 'x', findings: [], sourceRevision: 1, week: 8, pkg: 'owned by what it measures', source: { id: 'ENT-001', title: 'x', projectRev: 0 } }
    expect(store.apply([{ op: 'upsert-mapping', mapping: bad }]).ok).toBe(true)
    await settle(store)
    const st = store.getState()
    expect(st.save.kind).toBe('error') // never "saved"
    expect(st.save.reason).toMatch(/the course server refused this change, so it was not saved \(.*not a package.*\)\. Your edits are still here/)
    expect(st.doc!.mappings['map-bad-1']).toBeDefined() // nothing discarded from the tab
    expect(store.hasUnsaved()).toBe(true)
    expect([...mem.values()].join('')).toContain('map-bad-1') // and the outbox still holds it (survives a reload)
    expect(st.snapshots.length).toBe(before)
    // the existing recovery: the version is written first, then the saved project is loaded
    await store.takeOver()
    const after = store.getState()
    expect(after.snapshots.length).toBe(before + 1)
    expect(after.doc!.mappings['map-bad-1']).toBeUndefined()
    // later edits save normally
    const e = ent(after.doc!)
    store.apply([{ op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.domain', before: e.attributes.domain as never, after: 'Urban transport' }] }])
    await settle(store)
    expect(store.getState().save.kind).toBe('saved')
    expect(ent(store.getState().doc!).attributes.domain).toBe('Urban transport')
  })
})
