// The browser side of server mode, end to end against the real server: ProjectStore + HttpProjectAdapter (the code the
// SPA runs), with a teammate acting through the API. Covers: "Saved" only after the server confirmed; server-stamped
// document adopted; automatic rebase when a teammate changed other fields; "Conflict requires review" (nothing
// overwritten) when the same field changed, and the recovery that keeps the unsaved edits as a version; visible refusal
// of a self-declared approval; polling picks up a teammate's change.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ProjectDoc } from '../../src/project/model/types'
import { ProjectStore } from '../../src/project/store/ProjectStore'
import { getBackend, outboxKeys, refreshSession, signIn, signOut } from '../../src/services/backend'
import { HttpProjectAdapter } from '../../src/services/httpProjectAdapter'
import { cid, Client, ORIGIN, startTest, type T, type TestUser } from './helpers'

let t: T
const realFetch: typeof fetch = globalThis.fetch.bind(globalThis)
let mate: Client
let store: ProjectStore
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!
const settle = async (s: ProjectStore) => {
  await s.flush()
  for (let i = 0; i < 20 && (s.getState().save.kind === 'saving' || s.getState().save.kind === 'pending'); i++) await new Promise((r) => setTimeout(r, 10))
}

beforeEach(async () => {
  t = await startTest()
  const a = await t.user('student', 'Team 1', { initials: 'AA' })
  ;(t as T & { aa?: typeof a }).aa = a
  const bb = await t.user('student', 'Team 1', { initials: 'BB' })
  ;(t as T & { bb?: typeof bb }).bb = bb
  mate = await t.signedIn(bb)
  // the SPA's relative /api/v1 calls go to the test server, with this "browser's" own cookie jar
  let cookie = ''
  globalThis.fetch = (async (input: string | URL | Request, init: RequestInit = {}) => {
    if (!(typeof input === 'string' && input.startsWith('/'))) return realFetch(input, init) // the teammate's own client
    const url = t.base + input
    const r = await realFetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN, ...(cookie ? { Cookie: cookie } : {}) } })
    for (const c of r.headers.getSetCookie()) cookie = c.split(';')[0]
    return r
  }) as typeof fetch
  await signIn(a.login, a.password)
  const session = getBackend().session!
  store = new ProjectStore(new HttpProjectAdapter(session), { autosaveMs: 5, retryMs: 5 })
  await store.init()
  await store.create({ teamLabel: 'ignored', initials: 'ZZ', enterpriseName: 'Client Test Enterprise' })
})
afterEach(async () => {
  store.dispose()
  globalThis.fetch = realFetch
  await t.close()
})

const mateEdits = async (path: string, after: string) => {
  const p = (await mate.get(`/api/v1/projects/${store.getState().doc!.project.uid}`)).body
  const e = ent(p.doc)
  const r = await mate.post(`/api/v1/projects/${p.doc.project.uid}/changes`, { baseVersion: p.version, changes: [{ clientChangeId: cid(), source: 'editor', summary: `BB edits ${path}`, ops: [{ op: 'update-artifact', uid: e.uid, fields: [{ path, before: path === 'title' ? e.title : e.attributes[path.slice(11)], after }] }] }] })
  expect(r.status).toBe(200)
}
const edit = (path: string, after: string) =>
  store.apply((doc) => {
    const e = ent(doc)
    return [{ op: 'update-artifact', uid: e.uid, fields: [{ path, before: (path === 'title' ? e.title : e.attributes[path.slice(11)]) as never, after }] }]
  })

describe('server mode in the browser store', () => {
  it('creates the team project on the server and adopts the server document (team label, real members)', () => {
    const st = store.getState()
    expect(st.storage).toBe('http')
    expect(st.save.kind).toBe('saved')
    expect(st.doc!.team.label).toBe('Team 1')
    expect(st.doc!.team.members.map((m) => m.initials).sort()).toEqual(['AA', 'BB'])
    expect(st.changes.at(-1)!.actor?.userId).toBeTruthy()
  })
  it('says Saved only after the server confirmed, and adopts the server-stamped change', async () => {
    expect(edit('attributes.problem', 'Long waits at the pier').ok).toBe(true)
    expect(store.getState().save.kind).toBe('pending')
    await settle(store)
    const st = store.getState()
    expect(st.save.kind).toBe('saved')
    expect(st.changes.at(-1)!.by).toBe('AA')
    expect(st.changes.at(-1)!.actor).toBeTruthy()
    const server = (await mate.get(`/api/v1/projects/${st.doc!.project.uid}`)).body
    expect(ent(server.doc).attributes.problem).toBe('Long waits at the pier')
  })
  it('merges automatically when a teammate saved a different field meanwhile', async () => {
    await mateEdits('attributes.domain', 'Water transit')
    edit('attributes.problem', 'Ferry schedules do not match trains')
    await settle(store)
    const st = store.getState()
    expect(st.save.kind).toBe('saved')
    expect(st.notice).toMatch(/Merged with BB/)
    expect(ent(st.doc!).attributes.domain).toBe('Water transit')
    expect(ent(st.doc!).attributes.problem).toBe('Ferry schedules do not match trains')
  })
  it('reports "Conflict requires review" when the teammate changed the same field, overwrites nothing, and keeps the unsaved edit as a version', async () => {
    await mateEdits('title', 'Name chosen by BB')
    edit('title', 'Name chosen by AA')
    await settle(store)
    let st = store.getState()
    expect(st.save.kind).toBe('conflict')
    expect(st.readOnly).toBe(true)
    expect(st.readOnlyReason).toMatch(/BB saved a change to the same item/)
    const uid = st.doc!.project.uid
    expect(ent((await mate.get(`/api/v1/projects/${uid}`)).body.doc).title).toBe('Name chosen by BB')
    await store.takeOver()
    st = store.getState()
    expect(st.save.kind).not.toBe('conflict')
    expect(st.readOnly).toBe(false)
    expect(ent(st.doc!).title).toBe('Name chosen by BB')
    const kept = st.snapshots.find((s) => s.kind === 'pre-restore')!
    expect(kept).toBeTruthy()
    const snap = await store.getSnapshot(kept.id)
    expect(ent(snap!.doc).title).toBe('Name chosen by AA')
  })
  it('refuses a self-declared approval visibly, before anything is sent', () => {
    const r = store.apply((doc) => [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'attributes.approval', before: ent(doc).attributes.approval as never, after: { decision: 'approved', decidedOn: '2026-10-21' } }] }])
    expect(r.ok).toBe(false)
    expect(store.getState().refused?.reason).toMatch(/decided by your instructor/)
    expect(store.getState().save.kind).toBe('saved')
  })
  it('polling picks up a teammate’s change when nothing is pending here', async () => {
    await mateEdits('attributes.soi', 'Shuttle boat fleet')
    expect(await store.pollRemote()).toBe(true)
    expect(ent(store.getState().doc!).attributes.soi).toBe('Shuttle boat fleet')
    expect(store.getState().notice).toMatch(/Updated with BB/)
    expect(await store.pollRemote()).toBe(false) // 304: nothing new
  })
  it('restores a version on the server as a new revision', async () => {
    edit('attributes.problem', 'First wording')
    await settle(store)
    const v = await store.saveVersion('Before rewrite')
    edit('attributes.problem', 'Second wording')
    await settle(store)
    const id = store.getState().snapshots.find((s) => s.label === 'Before rewrite')?.id ?? v.id
    const r = await store.restore(id, 'Back to the first wording')
    expect(r.ok).toBe(true)
    await settle(store)
    expect(store.getState().save.kind).toBe('saved')
    const server = (await mate.get(`/api/v1/projects/${store.getState().doc!.project.uid}`)).body
    expect(ent(server.doc).attributes.problem).toBe('First wording')
  })
})

// ------------------------------------------------------------------------------------------- M2 review fixes (browser side)
class MemoryStorage {
  m = new Map<string, string>()
  getItem = (k: string) => this.m.get(k) ?? null
  setItem = (k: string, v: string) => void this.m.set(k, v)
  removeItem = (k: string) => void this.m.delete(k)
}
const login = async () => {
  const u = (t as T & { aa?: { login: string; password: string } }).aa!
  return signIn(u.login, u.password)
}
/** Lets the clock pass the student idle limit; the teammate signs in again (only this "browser" stays signed out). */
const expire = async () => {
  t.advance(3 * 3600 * 1000)
  mate = await t.signedIn((t as T & { bb?: TestUser }).bb!)
}

describe('M4: no silent loss when the session ends', () => {
  let box: MemoryStorage
  let s2: ProjectStore
  beforeEach(async () => {
    box = new MemoryStorage()
    await refreshSession() // the session now names the team project
    s2 = new ProjectStore(new HttpProjectAdapter(getBackend().session!, { outbox: box }), { autosaveMs: 5, retryMs: 5 })
    await s2.init()
  })
  afterEach(() => s2.dispose())
  const edit2 = (s: ProjectStore, path: string, after: string) => s.apply((doc) => [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path, before: undefined, after }] }])

  it('an expired session keeps the edit (memory + outbox), says "sign in", and saves it once after signing in again in place', async () => {
    await expire() // past the student idle limit
    expect(edit2(s2, 'attributes.problem', 'Written while signed out').ok).toBe(true)
    await settle(s2)
    let st = s2.getState()
    expect(st.save.kind).toBe('error')
    expect(st.save.signin).toBe(true)
    expect(s2.hasUnsaved()).toBe(true) // the unload guard warns
    expect(getBackend().status).toBe('signed-out')
    expect([...box.m.keys()]).toHaveLength(1)
    expect(ent(st.doc!).attributes.problem).toBe('Written while signed out')
    await login()
    await s2.flush()
    st = s2.getState()
    expect(st.save.kind).toBe('saved')
    expect(s2.hasUnsaved()).toBe(false)
    expect(box.m.size).toBe(0)
    const server = (await mate.get(`/api/v1/projects/${st.doc!.project.uid}/changes`)).body.changes
    expect(server.filter((c: { summary: string; ops: { fields?: { after: unknown }[] }[] }) => JSON.stringify(c.ops).includes('Written while signed out'))).toHaveLength(1)
  })
  it('a reload after the session ended recovers the outbox and saves it with the version check', async () => {
    await expire()
    edit2(s2, 'attributes.soi', 'Night ferry fleet')
    await settle(s2)
    expect(s2.getState().save.signin).toBe(true)
    s2.dispose()
    // "reload": a new page signs in and opens a new store over the same tab storage
    await login()
    const s3 = new ProjectStore(new HttpProjectAdapter(getBackend().session!, { outbox: box }), { autosaveMs: 5, retryMs: 5 })
    await s3.init()
    expect(s3.getState().notice).toMatch(/Recovered 1 unsaved change/)
    expect(ent(s3.getState().doc!).attributes.soi).toBe('Night ferry fleet')
    await settle(s3)
    expect(s3.getState().save.kind).toBe('saved')
    expect(box.m.size).toBe(0)
    expect(ent((await mate.get(`/api/v1/projects/${s3.getState().doc!.project.uid}`)).body.doc).attributes.soi).toBe('Night ferry fleet')
    s3.dispose()
  })
  it('a recovered edit that collides with a teammate’s save is a conflict, never an overwrite', async () => {
    await expire()
    edit2(s2, 'title', 'Name typed while signed out')
    await settle(s2)
    s2.dispose()
    await mateEdits('title', 'Name saved by BB meanwhile')
    await login()
    const s3 = new ProjectStore(new HttpProjectAdapter(getBackend().session!, { outbox: box }), { autosaveMs: 5, retryMs: 5 })
    await s3.init()
    await settle(s3)
    expect(s3.getState().save.kind).toBe('conflict')
    expect(ent((await mate.get(`/api/v1/projects/${s3.getState().doc!.project.uid}`)).body.doc).title).toBe('Name saved by BB meanwhile')
    s3.dispose()
  })
})

describe('H1 (browser): warning before an edit changes an approved proposal', () => {
  it('asks once before a material edit; "cancel" changes nothing; "OK" saves and the server marks it for re-review', async () => {
    const ins = await t.signedIn(await t.user('instructor', undefined, { initials: 'PR' }))
    const uid = store.getState().doc!.project.uid
    const req = await mate.post(`/api/v1/projects/${uid}/approval-requests`)
    expect((await ins.post(`/api/v1/approvals/${req.body.approval.id}/decision`, { decision: 'approved' })).status).toBe(200)
    const asked: string[] = []
    let answer = false
    await refreshSession()
    const s4 = new ProjectStore(new HttpProjectAdapter(getBackend().session!, { outbox: null, confirm: (m) => (asked.push(m), answer) }), { autosaveMs: 5, retryMs: 5 })
    await s4.init()
    const e4 = (path: string, after: string) => s4.apply((doc) => [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path, before: undefined, after }] }])
    // non-material: no question
    expect(e4('attributes.domain', 'Water transit').ok).toBe(true)
    expect(asked).toHaveLength(0)
    await settle(s4)
    // material, declined: refused visibly, nothing pending
    expect(e4('title', 'Different enterprise').ok).toBe(false)
    expect(asked[0]).toMatch(/This changes your approved proposal; it will need instructor re-review/)
    expect(s4.getState().refused?.reason).toMatch(/stays as the instructor approved it/)
    expect(s4.hasUnsaved()).toBe(false)
    // material, accepted: asked once for a run of keystrokes, saved, approval moves to re-review
    answer = true
    expect(e4('title', 'Different enterprise').ok).toBe(true)
    expect(e4('title', 'Different enterprise 2').ok).toBe(true)
    expect(asked).toHaveLength(2)
    await settle(s4)
    expect(s4.getState().save.kind).toBe('saved')
    expect((await mate.get(`/api/v1/projects/${uid}/approval`)).body.approval.state).toBe('approved-changes-pending')
    expect((ent(s4.getState().doc!).attributes.approval as { decision: string }).decision).toBe('changed-since-approval')
    // no more questions while it is already waiting for re-review
    expect(e4('title', 'Different enterprise 3').ok).toBe(true)
    expect(asked).toHaveLength(2)
    s4.dispose()
  })
})

describe('N4 (confirmation review): signing out clears this account’s outbox in the tab', () => {
  it('removes the signed-in account’s outbox entries and nothing else', async () => {
    const m = new Map<string, string>()
    const ss = { get length() { return m.size }, key: (i: number) => [...m.keys()][i] ?? null, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), clear: () => m.clear() }
    const had = (globalThis as { sessionStorage?: unknown }).sessionStorage
    ;(globalThis as { sessionStorage?: unknown }).sessionStorage = ss
    try {
      const me = getBackend().session!.user.id
      m.set(`sls-outbox:v1:${me}:p1`, '{}')
      m.set('sls-outbox:v1:someone-else:p1', '{}')
      m.set('unrelated', 'x')
      expect(outboxKeys(me)).toEqual([`sls-outbox:v1:${me}:p1`])
      await signOut()
      expect([...m.keys()].sort()).toEqual(['sls-outbox:v1:someone-else:p1', 'unrelated'])
    } finally {
      ;(globalThis as { sessionStorage?: unknown }).sessionStorage = had
    }
  })
})
