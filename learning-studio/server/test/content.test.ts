// Content publishing (M3): seed, lifecycle, validation, restore, archive, plan tokens, version checks, the DB-level
// immutability guards and the isolation of the content store from projects / progress / submissions.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { seedItems } from '../../src/publishing/seed'
import type { BodyBlock, SectionBody } from '../../src/publishing/types'
import { validateBody } from '../../src/publishing/validate'
import { APP_ROOT } from '../config'
import { seedNow } from '../services/content'
import { createTeamProject, startTest, type Client, type T } from './helpers'

let t: T
let inst: Client
let stu: Client
beforeEach(async () => {
  t = await startTest()
  inst = await t.signedIn(await t.user('instructor'))
  stu = await t.signedIn(await t.user('student', 'Team 1'))
})
afterEach(async () => t.close())

const SEEDS = seedItems()
/** A Learn section with a plain editable paragraph (no attached footnotes) and the id of that paragraph. */
const target = (() => {
  for (const s of SEEDS) {
    if (s.kind !== 'learn-section') continue
    const b = (s.body as SectionBody).blocks.find((x) => x.kind === 'para' && !x.cites && !/“/.test(x.text) && /R\d\d/.test(x.text) === false)
    if (b) return { id: s.id, para: b.id, body: s.body as SectionBody }
  }
  throw new Error('no editable paragraph in the seed')
})()
const withDefinition = SEEDS.find((s) => s.kind === 'learn-section' && (s.body as SectionBody).blocks.some((b) => b.kind === 'definition'))!
const MARK = 'Zebracorn boundary sentence for the publishing test.'
const edited = (body: SectionBody, para: string, text: string): SectionBody => ({ ...body, blocks: body.blocks.map((b) => (b.id === para ? ({ ...b, text } as BodyBlock) : b)) })
const enc = encodeURIComponent

async function draft(c: Client, id: string, body: unknown, version: number | null = null) {
  return c.post(`/api/v1/authoring/items/${enc(id)}/draft`, { body, version })
}
async function publish(c: Client, ids: string[], note = 'Clarify the boundary paragraph.', extra: Record<string, unknown> = {}) {
  const plan = await c.post('/api/v1/authoring/publish-plan', { items: ids })
  expect(plan.status, JSON.stringify(plan.body)).toBe(200)
  return { plan, res: await c.post('/api/v1/authoring/releases', { planToken: plan.body.planToken, note, ...extra }) }
}
const studentWeek = async (c: Client = stu) => (await c.get('/api/v1/content/weeks/1')).body

describe('seed', () => {
  it('every code-authored item validates cleanly against itself (published v1 needs no correction)', () => {
    for (const s of SEEDS) {
      const v = validateBody(s.kind, structuredClone(s.body), s.body, 0)
      expect(v.validation.errors, `${s.id}: ${JSON.stringify(v.validation.errors.slice(0, 2))}`).toEqual([])
      expect(JSON.stringify(v.body)).toBe(JSON.stringify(s.body))
    }
  })
  it('seeds r1 PUBLISHED in REL-0001 at first use, idempotently', async () => {
    const w = await studentWeek()
    expect(w.releaseId).toBe('REL-0001')
    const learn = SEEDS.filter((s) => s.kind === 'learn-section')
    expect(Object.keys(w.items)).toHaveLength(learn.length)
    expect(learn.length).toBeGreaterThanOrEqual(50)
    expect(w.items[target.id].seq).toBe(1)
    expect(w.items[target.id].body).toEqual(target.body)
    expect(await seedNow(t.app.deps)).toEqual({ seeded: 0, releaseId: null })
    const c = (await stu.get('/api/v1/content/course')).body
    expect(Object.keys(c.items).sort()).toEqual(['course.intro.home', 'course.settings'])
    expect(c.items['course.settings'].body).toEqual({ department_label: '', department_label_verified: false })
    expect((await stu.get('/api/v1/content/release')).body.releaseId).toBe('REL-0001')
    const list = (await inst.get('/api/v1/authoring/items')).body.items
    expect(list.every((i: { published: { seq: number }; codeChanged: boolean }) => i.published?.seq === 1 && !i.codeChanged)).toBe(true)
  })
  it('answers 304 to a matching ETag (cheap release polling)', async () => {
    const a = await stu.get('/api/v1/content/weeks/1')
    expect(a.headers.get('cache-control')).toBe('no-cache')
    const b = await stu.get('/api/v1/content/weeks/1', { 'If-None-Match': a.headers.get('etag')! })
    expect(b.status).toBe(304)
  })
})

describe('lifecycle: draft → ready → publish → superseded; restore; discard', () => {
  it('runs Demo A on the API: students keep the old text until publish, then see it; restore brings r1 back as r3', async () => {
    const s1 = await draft(inst, target.id, edited(target.body, target.para, MARK))
    expect(s1.status, JSON.stringify(s1.body)).toBe(200)
    expect(s1.body.draft.seq).toBe(2)
    expect(s1.body.validation.errors).toEqual([])
    // the student still sees the published text; the draft text appears nowhere in student responses
    expect(JSON.stringify(await studentWeek())).not.toContain(MARK)
    // preview = the student assembly with the draft as override
    const pv = (await inst.get(`/api/v1/authoring/preview/week1?item=${enc(target.id)}`)).body
    expect(JSON.stringify(pv.items[target.id].body)).toContain(MARK)
    expect(pv.preview.seq).toBe(2)
    // mark ready, then publish with a plan and a change note
    expect((await inst.post(`/api/v1/authoring/items/${enc(target.id)}/draft/ready`, { version: s1.body.draft.version })).status).toBe(200)
    const { plan, res } = await publish(inst, [target.id])
    expect(plan.body.items[0]).toMatchObject({ itemId: target.id, from: { seq: 1 }, to: { seq: 2 }, stale: false, summary: { changed: 1, added: 0, removed: 0 } })
    expect(plan.body.studentData).toMatch(/None affected/)
    expect(res.status, JSON.stringify(res.body)).toBe(201)
    expect(res.body.releaseId).toBe('REL-0002')
    const w = await studentWeek()
    expect(w.releaseId).toBe('REL-0002')
    expect(JSON.stringify(w.items[target.id].body)).toContain(MARK)
    expect(w.items[target.id].seq).toBe(2)
    // history: r2 published (self-reviewed), r1 superseded
    const d = (await inst.get(`/api/v1/authoring/items/${enc(target.id)}`)).body
    expect(d.revisions.map((r: { seq: number; state: string }) => `${r.seq}:${r.state}`)).toEqual(['2:published', '1:superseded'])
    expect(d.revisions[0].changeNote).toBe('Clarify the boundary paragraph.')
    expect(d.revisions[0].releaseId).toBe('REL-0002')
    // restore r1 → a NEW draft r3 copying r1, then the normal publish path
    const r1 = d.revisions[1]
    const rs = await inst.post(`/api/v1/authoring/items/${enc(target.id)}/restore`, { revisionId: r1.id })
    expect(rs.status).toBe(201)
    expect(rs.body).toMatchObject({ seq: 3, restoredFromSeq: 1 })
    expect(JSON.stringify(await studentWeek())).toContain(MARK) // a restore is a draft until published
    const p2 = await publish(inst, [target.id], 'Restore the reviewed wording (r1).')
    expect(p2.plan.body.items[0].restoredFromSeq).toBe(1)
    expect(p2.res.status).toBe(201)
    const w3 = await studentWeek()
    expect(w3.items[target.id].body).toEqual(target.body)
    expect(w3.items[target.id].seq).toBe(3)
    const h = (await inst.get(`/api/v1/authoring/items/${enc(target.id)}`)).body.revisions
    expect(h.map((r: { seq: number; state: string; restoredFromSeq: number | null }) => `${r.seq}:${r.state}:${r.restoredFromSeq ?? ''}`)).toEqual(['3:published:1', '2:superseded:', '1:superseded:'])
    const rels = (await inst.get('/api/v1/authoring/releases')).body.releases
    expect(rels.map((r: { id: string }) => r.id)).toEqual(['REL-0003', 'REL-0002', 'REL-0001'])
    // audit trail, without bodies
    const audit = JSON.stringify(await t.store.read((r) => r.audit.list(100)))
    expect(audit).toContain('content.publish')
    expect(audit).toContain('content.restore')
    expect(audit).not.toContain(MARK)
  })
  it('one open draft per item, with a version check that names the other editor', async () => {
    const other = await t.signedIn(await t.user('instructor'))
    const a = await draft(inst, target.id, edited(target.body, target.para, 'First text.'))
    expect(a.status).toBe(200)
    const b = await draft(other, target.id, edited(target.body, target.para, 'Second text.')) // opened before, no version
    expect(b.status).toBe(409)
    const c = await draft(other, target.id, edited(target.body, target.para, 'Third text.'), a.body.draft.version + 5)
    expect(c.status).toBe(409)
    expect(c.body.message).toMatch(/Test instructor \d+ saved this draft/)
    const d = await draft(other, target.id, edited(target.body, target.para, 'Fourth text.'), a.body.draft.version)
    expect(d.status).toBe(200)
    expect(d.body.draft.seq).toBe(2) // the same draft row
  })
  it('editing a ready draft returns it to draft; discard removes only the draft', async () => {
    const a = await draft(inst, target.id, edited(target.body, target.para, 'Ready text.'))
    await inst.post(`/api/v1/authoring/items/${enc(target.id)}/draft/ready`, { version: a.body.draft.version })
    let d = (await inst.get(`/api/v1/authoring/items/${enc(target.id)}`)).body
    expect(d.draft.meta.state).toBe('ready-for-review')
    const b = await draft(inst, target.id, edited(target.body, target.para, 'Changed again.'), d.draft.meta.version)
    expect(b.body.draft.state).toBe('draft')
    expect((await inst.del(`/api/v1/authoring/items/${enc(target.id)}/draft`)).status).toBe(200)
    d = (await inst.get(`/api/v1/authoring/items/${enc(target.id)}`)).body
    expect(d.draft).toBeNull()
    expect(d.revisions.map((r: { seq: number }) => r.seq)).toEqual([1])
    expect((await inst.post(`/api/v1/authoring/items/${enc(target.id)}/restore`, { revisionId: d.revisions[0].id })).status).toBe(201)
    expect((await inst.post(`/api/v1/authoring/items/${enc(target.id)}/restore`, { revisionId: d.revisions[0].id })).status).toBe(409) // one open draft
  })
  it('adds and deletes paragraphs; new blocks get the next id and ids are never reissued', async () => {
    const add = { ...target.body, blocks: [...target.body.blocks, { id: 'new-1', kind: 'para', text: 'An added paragraph about boundaries.' }] }
    const a = await draft(inst, target.id, add)
    const ids = a.body.body.blocks.map((b: BodyBlock) => b.id)
    const max = Math.max(...target.body.blocks.map((b) => Number(b.id.slice(1))))
    expect(ids[ids.length - 1]).toBe(`b${String(max + 1).padStart(3, '0')}`)
    await publish(inst, [target.id])
    // delete the added paragraph, then add another: it takes max+2, not max+1
    const again = { ...target.body, blocks: [...target.body.blocks, { id: 'new-x', kind: 'para', text: 'A second added paragraph.' }] }
    const b = await draft(inst, target.id, again)
    const last = b.body.body.blocks[b.body.body.blocks.length - 1].id
    expect(last).toBe(`b${String(max + 2).padStart(3, '0')}`)
  })
})

describe('validation (errors block mark-ready, plan and publish)', () => {
  const cases: [string, (b: SectionBody) => unknown, RegExp][] = [
    ['unknown register entry', (b) => edited(b, target.para, 'A claim with a source (R999 p.12).'), /citation-unknown/],
    ['page outside the verified range', (b) => edited(b, target.para, 'A claim with a source (R11 p.99999).'), /citation-range/],
    ['HTML', (b) => edited(b, target.para, 'Click <script>alert(1)</script> here.'), /markup/],
    ['faculty placeholder wording', (b) => edited(b, target.para, 'Faculty note: say this slowly.'), /leak:placeholder/],
    ['a bare register code', (b) => edited(b, target.para, 'As R11 explains, boundaries matter.'), /leak:register-code/],
    ['the course term', (b) => edited(b, target.para, 'Each goal of AeroLink is measurable.'), /leak:goal-term/],
  ]
  for (const [name, make, rule] of cases)
    it(`refuses ${name}`, async () => {
      const s = await draft(inst, target.id, make(target.body))
      expect(s.status).toBe(200) // a draft may be invalid; it is saved with its validation
      expect(JSON.stringify(s.body.validation.errors)).toMatch(rule)
      const ready = await inst.post(`/api/v1/authoring/items/${enc(target.id)}/draft/ready`, { version: s.body.draft.version })
      expect(ready.status).toBe(422)
      const plan = await inst.post('/api/v1/authoring/publish-plan', { items: [target.id] })
      expect(plan.body.errors).toBeGreaterThan(0)
      const res = await inst.post('/api/v1/authoring/releases', { planToken: plan.body.planToken, note: 'Try to publish an invalid draft.' })
      expect(res.status).toBe(422)
      expect(JSON.stringify(await studentWeek())).not.toMatch(/R999|Zebracorn|<script>|Faculty note:|R11 p.99999|Each goal of AeroLink/)
    })
  it('refuses an added non-paragraph block: the error is reported and the stored draft keeps only allowed blocks', async () => {
    const s = await draft(inst, target.id, { ...target.body, blocks: [...target.body.blocks, { id: 'new-2', kind: 'heading', text: 'New heading' }] })
    expect(JSON.stringify(s.body.validation.errors)).toMatch(/read-only/)
    expect(JSON.stringify(s.body.body)).not.toContain('New heading')
  })
  it('keeps definitions read-only: changed or deleted definitions are refused, and the stored block is the seed block', async () => {
    const body = structuredClone(withDefinition.body) as SectionBody
    const def = body.blocks.find((b) => b.kind === 'definition')! as Extract<BodyBlock, { kind: 'definition' }>
    def.text = `${def.text} (simplified)`
    const s = await draft(inst, withDefinition.id, body)
    expect(JSON.stringify(s.body.validation.errors)).toMatch(/read-only/)
    expect(JSON.stringify(s.body.body)).not.toContain('(simplified)')
    const del = { ...body, blocks: body.blocks.filter((b) => b.kind !== 'definition') }
    const s2 = await draft(inst, withDefinition.id, del, s.body.draft.version)
    expect(JSON.stringify(s2.body.validation.errors)).toMatch(/cannot be deleted/)
  })
  it('keeps every quotation of the seed text verbatim', async () => {
    const q = SEEDS.flatMap((s) => (s.kind === 'learn-section' ? (s.body as SectionBody).blocks.filter((b) => b.kind === 'para' && /“[^”]+”/.test(b.text)).map((b) => ({ s, b })) : []))[0]
    const body = structuredClone(q.s.body) as SectionBody
    const p = body.blocks.find((b) => b.id === q.b.id)! as Extract<BodyBlock, { kind: 'para' }>
    p.text = p.text.replace(/“([^”]+)”/, (_m, inner: string) => `“${inner.slice(0, -1)}x”`)
    const s = await draft(inst, q.s.id, body)
    expect(JSON.stringify(s.body.validation.errors)).toMatch(/quotation-changed/)
  })
  it('course introduction and settings: structure read-only, department label rules', async () => {
    const intro = structuredClone(SEEDS.find((s) => s.id === 'course.intro.home')!.body) as Record<string, unknown>
    intro.lede = 'A clearer lede for the course homepage.'
    const a = await draft(inst, 'course.intro.home', intro)
    expect(a.body.validation.errors).toEqual([])
    ;(intro.aerolink as string[]).push('An extra sentence.')
    const b = await draft(inst, 'course.intro.home', intro, a.body.draft.version)
    expect(JSON.stringify(b.body.validation.errors)).toMatch(/fixed/)
    const s1 = await draft(inst, 'course.settings', { department_label: 'Department of Example Engineering', department_label_verified: false })
    expect(s1.body.validation.errors).toEqual([])
    expect(JSON.stringify(s1.body.validation.warnings)).toMatch(/university name alone/)
    const s2 = await draft(inst, 'course.settings', { department_label: '', department_label_verified: true }, s1.body.draft.version)
    expect(JSON.stringify(s2.body.validation.errors)).toMatch(/cannot be empty/)
    const s3 = await draft(inst, 'course.settings', { department_label: '<b>Dept</b>', department_label_verified: true }, s2.body.draft.version)
    expect(s3.body.validation.errors.length).toBeGreaterThan(0)
  })
})

describe('publish plan, stale drafts, archive', () => {
  it('a plan expires after 10 minutes, belongs to its instructor and goes stale when the draft changes', async () => {
    const a = await draft(inst, target.id, edited(target.body, target.para, 'Plan text one.'))
    const plan = (await inst.post('/api/v1/authoring/publish-plan', { items: [target.id] })).body
    const other = await t.signedIn(await t.user('instructor'))
    expect((await other.post('/api/v1/authoring/releases', { planToken: plan.planToken, note: 'Not my plan.' })).status).toBe(409)
    await draft(inst, target.id, edited(target.body, target.para, 'Plan text two.'), a.body.draft.version)
    const stale = await inst.post('/api/v1/authoring/releases', { planToken: plan.planToken, note: 'Publish after an edit.' })
    expect(stale.status).toBe(409)
    expect(stale.body.reason).toBe('plan-stale')
    const plan2 = (await inst.post('/api/v1/authoring/publish-plan', { items: [target.id] })).body
    expect((await inst.post('/api/v1/authoring/releases', { planToken: plan2.planToken, note: '' })).status).toBe(400) // change note required
    t.advance(10 * 60 * 1000 + 1000)
    expect((await inst.post('/api/v1/authoring/releases', { planToken: plan2.planToken, note: 'Too late.' })).status).toBe(409)
  })
  it('archive withdraws a section (new release, gap-free numbering kept); referenced sections and the intro refuse', async () => {
    const sec = SEEDS.find((s) => s.id === 'w01.learn.ch04-02') ?? SEEDS.find((s) => s.kind === 'learn-section' && s.id.endsWith('-02'))!
    expect((await inst.post(`/api/v1/authoring/items/${enc('course.intro.home')}/archive`, { note: 'Withdraw the homepage.' })).status).toBe(409)
    const ref = await inst.post(`/api/v1/authoring/items/${enc('w01.learn.ch10-04')}/archive`, { note: 'Withdraw a referenced section.' })
    expect(ref.status).toBe(422)
    expect(ref.body.message).toMatch(/refers to this section by its number/)
    // a draft started before the withdrawal becomes stale
    const d = await draft(inst, sec.id, sec.body)
    const ar = await inst.post(`/api/v1/authoring/items/${enc(sec.id)}/archive`, { note: 'Withdraw for revision.' })
    expect(ar.status).toBe(200)
    const w = await studentWeek()
    expect(w.withdrawn).toEqual([sec.id])
    expect(w.items[sec.id]).toBeUndefined()
    expect(w.releaseId).toBe(ar.body.releaseId)
    void d
    const plan = (await inst.post('/api/v1/authoring/publish-plan', { items: [sec.id] })).body
    expect(plan.stale).toBe(true)
    const refused = await inst.post('/api/v1/authoring/releases', { planToken: plan.planToken, note: 'Bring it back.' })
    expect(refused.status).toBe(409)
    expect(refused.body.reason).toBe('stale-draft')
    const done = await inst.post('/api/v1/authoring/releases', { planToken: plan.planToken, note: 'Bring it back.', acknowledgeStale: true })
    expect(done.status).toBe(201)
    expect((await studentWeek()).withdrawn).toEqual([])
  })
})

describe('database guards and store isolation', () => {
  it('published bodies are immutable and history cannot be deleted (triggers)', async () => {
    await studentWeek()
    const db = (t.store as unknown as { db: import('node:sqlite').DatabaseSync }).db
    expect(() => db.prepare("UPDATE content_revisions SET body = '{}' WHERE state = 'published'").run()).toThrow(/immutable/)
    expect(() => db.prepare("DELETE FROM content_revisions WHERE state = 'published'").run()).toThrow(/never deleted/)
    expect(() => db.prepare("UPDATE content_revisions SET state = 'draft' WHERE state = 'published'").run()).toThrow(/not allowed/)
    expect(() => db.prepare('DELETE FROM content_release_items').run()).toThrow(/append-only/)
  })
  it('a publish, restore and archive leave every other store byte-identical (projects, teams, users, approvals, progress, submissions)', async () => {
    const teamId = (await t.store.read((r) => r.teams.list()))[0].id
    expect((await createTeamProject(stu, teamId)).status).toBe(201)
    const db = (t.store as unknown as { db: import('node:sqlite').DatabaseSync }).db
    const SKIP = new Set(['audit_log', 'sessions', 'server_meta', 'schema_migrations', 'content_schema_migrations', 'sqlite_sequence'])
    const snapshot = () => {
      const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map((x) => x.name).filter((n) => !n.startsWith('content_') && !SKIP.has(n))
      return Object.fromEntries(tables.map((n) => [n, JSON.stringify(db.prepare(`SELECT * FROM "${n}" ORDER BY rowid`).all())]))
    }
    const before = snapshot()
    expect(Object.keys(before)).toEqual(expect.arrayContaining(['projects', 'project_changes', 'project_snapshots', 'teams', 'team_memberships', 'users', 'approval_requests', 'approval_faculty_notes']))
    expect(before.projects.length).toBeGreaterThan(10)
    await draft(inst, target.id, edited(target.body, target.para, MARK))
    await publish(inst, [target.id])
    const r1 = (await inst.get(`/api/v1/authoring/items/${enc(target.id)}`)).body.revisions.at(-1)
    await inst.post(`/api/v1/authoring/items/${enc(target.id)}/restore`, { revisionId: r1.id })
    await publish(inst, [target.id], 'Restore r1.')
    await inst.post(`/api/v1/authoring/items/${enc('w01.learn.ch02-02')}/archive`, { note: 'Withdraw for the isolation test.' })
    expect(snapshot()).toEqual(before)
  })
  it('the content repository names no table of another store', () => {
    const sql = readFileSync(join(APP_ROOT, 'server', 'repo', 'content.ts'), 'utf8')
    const tables = [...sql.matchAll(/\b(?:FROM|INTO|UPDATE|JOIN|TABLE|ON)\s+([a-z_]+)/g)].map((m) => m[1]).filter((n) => n.length > 2 && !['content_revisions', 'content_items', 'content_releases', 'content_release_items', 'content_schema_migrations', 'sqlite_master'].includes(n))
    expect([...new Set(tables)]).toEqual([])
  })
})
