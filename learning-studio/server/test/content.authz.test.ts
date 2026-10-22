// Authorization matrix and leak crawl of the content routes (M3; SECURITY_ARCHITECTURE.md §5.2, §6 items 4–5; spec
// ADM-01, ADM-02). Roles: anonymous, student, admin WITHOUT the instructor role, instructor. Drafts are reachable only
// through authoring/* (instructor); every other caller gets 404 there. Every write needs the CSRF header.
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { seedItems } from '../../src/publishing/seed'
import type { BodyBlock, SectionBody } from '../../src/publishing/types'
import { ROUTES } from '../routes'
import { startTest, type Client, type T } from './helpers'

let t: T
let who: Record<'anon' | 'student' | 'admin' | 'instructor', Client>
const SEED = seedItems().find((s) => s.kind === 'learn-section' && (s.body as SectionBody).blocks.some((b) => b.kind === 'para' && !b.cites))!
const PARA = (SEED.body as SectionBody).blocks.find((b) => b.kind === 'para' && !b.cites)!.id
const DRAFT_MARK = 'Okapi-draft-marker-7741 never reaches students.'
const draftBody = () => ({ ...(SEED.body as SectionBody), blocks: (SEED.body as SectionBody).blocks.map((b) => (b.id === PARA ? ({ ...b, text: DRAFT_MARK } as BodyBlock) : b)) })
const id = encodeURIComponent(SEED.id)

beforeEach(async () => {
  t = await startTest()
  who = {
    anon: t.client(),
    student: await t.signedIn(await t.user('student', 'Team 1')),
    admin: await t.signedIn(await t.user('admin')),
    instructor: await t.signedIn(await t.user('instructor')),
  }
})
afterEach(async () => t.close())

type Case = { name: string; method: 'GET' | 'POST' | 'DELETE'; path: () => string; body?: () => unknown; author: boolean }
let revId = ''
const CASES: Case[] = [
  { name: 'release', method: 'GET', path: () => '/api/v1/content/release', author: false },
  { name: 'course', method: 'GET', path: () => '/api/v1/content/course', author: false },
  { name: 'week 1', method: 'GET', path: () => '/api/v1/content/weeks/1', author: false },
  { name: 'items', method: 'GET', path: () => '/api/v1/authoring/items', author: true },
  { name: 'item', method: 'GET', path: () => `/api/v1/authoring/items/${id}`, author: true },
  { name: 'revision', method: 'GET', path: () => `/api/v1/authoring/items/${id}/revisions/${revId}`, author: true },
  { name: 'preview', method: 'GET', path: () => `/api/v1/authoring/preview/week1?item=${id}`, author: true },
  { name: 'releases', method: 'GET', path: () => '/api/v1/authoring/releases', author: true },
  { name: 'save draft', method: 'POST', path: () => `/api/v1/authoring/items/${id}/draft`, body: () => ({ body: draftBody(), version: null }), author: true },
  { name: 'mark ready', method: 'POST', path: () => `/api/v1/authoring/items/${id}/draft/ready`, body: () => ({ version: 1 }), author: true },
  { name: 'return', method: 'POST', path: () => `/api/v1/authoring/items/${id}/draft/return`, body: () => ({}), author: true },
  { name: 'discard', method: 'DELETE', path: () => `/api/v1/authoring/items/${id}/draft`, author: true },
  { name: 'restore', method: 'POST', path: () => `/api/v1/authoring/items/${id}/restore`, body: () => ({ revisionId: revId }), author: true },
  { name: 'archive', method: 'POST', path: () => `/api/v1/authoring/items/${id}/archive`, body: () => ({ note: 'Withdraw it.' }), author: true },
  { name: 'publish plan', method: 'POST', path: () => '/api/v1/authoring/publish-plan', body: () => ({ items: [SEED.id] }), author: true },
  { name: 'publish', method: 'POST', path: () => '/api/v1/authoring/releases', body: () => ({ planToken: 'x'.repeat(32), note: 'Publish it.' }), author: true },
]

describe('every content route is in the matrix', () => {
  beforeAll(() => undefined)
  it('lists all content routes of the route table', () => {
    const table = ROUTES.filter((r) => r.path.includes('/content/') || r.path.includes('/authoring/')).map((r) => `${r.method} ${r.path}`)
    expect(table.length).toBe(CASES.length)
    expect(new Set(table).size).toBe(CASES.length)
  })
})

describe('authorization matrix', () => {
  const call = (c: Client, k: Case) => c.req(k.method, k.path(), k.method === 'GET' ? undefined : (k.body?.() ?? {}))
  beforeEach(async () => {
    const d = (await who.instructor.get(`/api/v1/authoring/items/${id}`)).body
    revId = d.revisions[0].id
  })
  for (const k of CASES) {
    it(`${k.method} ${k.name}: anonymous 401`, async () => expect((await call(who.anon, k)).status).toBe(401))
    it(`${k.method} ${k.name}: student ${k.author ? '404' : 'allowed'}`, async () => {
      const r = await call(who.student, k)
      if (k.author) expect(r.status).toBe(404)
      else expect(r.status).toBe(200)
    })
    it(`${k.method} ${k.name}: admin without the instructor role ${k.author ? '404' : 'allowed'}`, async () => {
      const r = await call(who.admin, k)
      if (k.author) expect(r.status).toBe(404)
      else expect(r.status).toBe(200)
    })
    it(`${k.method} ${k.name}: instructor allowed (never 401/403/404 for a valid item)`, async () => {
      const r = await call(who.instructor, k)
      expect([401, 403]).not.toContain(r.status)
      if (k.method === 'GET') expect(r.status).toBe(200)
    })
    if (k.method !== 'GET')
      it(`${k.method} ${k.name}: refused without the CSRF header, even for the instructor`, async () => {
        const r = await who.instructor.req(k.method, k.path(), k.body?.() ?? {}, { 'X-SLS-CSRF': '' })
        expect(r.status).toBe(403)
        expect(r.body.code).toBe('csrf')
      })
  }
  it('an unknown item id is 404 for the instructor too (and the same 404 for a student)', async () => {
    expect((await who.instructor.get('/api/v1/authoring/items/w01.learn.ch99-99')).status).toBe(404)
    expect((await who.student.get('/api/v1/authoring/items/w01.learn.ch99-99')).status).toBe(404)
    expect((await who.student.get('/api/v1/content/weeks/2')).status).toBe(404)
  })
})

describe('leak crawl: drafts never reach a student response (ADM-02)', () => {
  it('a saved draft marker appears in no student-reachable response, and is found through the instructor routes', async () => {
    const s = await who.instructor.post(`/api/v1/authoring/items/${id}/draft`, { body: draftBody(), version: null })
    expect(s.status).toBe(200)
    const d = (await who.instructor.get(`/api/v1/authoring/items/${id}`)).body
    revId = d.draft.meta.id
    const seen: string[] = []
    for (const k of CASES.filter((c) => c.method === 'GET')) {
      for (const c of [who.student, who.admin, who.anon]) {
        const r = await c.get(k.path())
        seen.push(`${k.name}:${r.status}`)
        expect(JSON.stringify(r.body) ?? '', `${k.name}`).not.toContain('Okapi-draft-marker-7741')
        if (k.author) expect(r.status).not.toBe(200)
      }
    }
    // the draft revision id itself is no key for a student
    expect((await who.student.get(`/api/v1/authoring/items/${id}/revisions/${revId}`)).status).toBe(404)
    // the check can fail: the instructor routes do return the marker
    for (const p of [`/api/v1/authoring/items/${id}`, `/api/v1/authoring/items/${id}/revisions/${revId}`, `/api/v1/authoring/preview/week1?item=${id}`]) expect(JSON.stringify((await who.instructor.get(p)).body)).toContain('Okapi-draft-marker-7741')
    expect(seen.length).toBe(24) // 8 GET routes × 3 non-instructor callers
  })
})
