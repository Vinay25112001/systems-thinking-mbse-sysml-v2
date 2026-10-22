// M3 review fixes (_source_cache/review/m3_publishing_review.md): M1 attribution of quotations, L1 frozen metadata,
// L2 block ids never reissued and bounded, L3 invisible / confusable characters before the leak rules.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { seedItems } from '../../src/publishing/seed'
import type { BodyBlock, SectionBody } from '../../src/publishing/types'
import { validateBody } from '../../src/publishing/validate'
import { splitCitations } from '../../src/week1/learn/studentText'
import { startTest, type Client, type T } from './helpers'

let t: T
let inst: Client
beforeEach(async () => {
  t = await startTest()
  inst = await t.signedIn(await t.user('instructor'))
})
afterEach(async () => t.close())

const SEEDS = seedItems().filter((s) => s.kind === 'learn-section')
const enc = encodeURIComponent
const hasCite = (text: string) => splitCitations(text).some((x) => 'cite' in x)
const find = (pred: (b: Extract<BodyBlock, { kind: 'para' }>) => boolean) => {
  for (const s of SEEDS) for (const b of (s.body as SectionBody).blocks) if (b.kind === 'para' && !b.cites && pred(b)) return { s, b }
  throw new Error('no such paragraph in the seed')
}
const withText = (body: SectionBody, id: string, text: string): SectionBody => ({ ...body, blocks: body.blocks.map((b) => (b.id === id ? ({ ...b, text } as BodyBlock) : b)) })
const stripCites = (text: string) => text.replace(/\s*\((?:[^()]*\bR\d{2,3}[a-z]? pp?\.[^()]*)\)/g, '').replace(/\bR\d{2,3}[a-z]? pp?\. ?\d+(?:[–-]\d+)?/g, '')
const draft = (id: string, body: unknown, version: number | null = null) => inst.post(`/api/v1/authoring/items/${enc(id)}/draft`, { body, version })

describe('M1: a quotation keeps its citation', () => {
  it('removing the citation of a paragraph that quotes a source is an ERROR (editor validator and server)', async () => {
    const { s, b } = find((x) => /“[^”]+”/.test(x.text) && hasCite(x.text))
    const body = withText(s.body as SectionBody, b.id, stripCites(b.text))
    expect(stripCites(b.text)).not.toBe(b.text)
    const local = validateBody('learn-section', body, s.body)
    expect(local.validation.errors.map((e) => e.rule)).toContain('attribution-removed')
    const r = await draft(s.id, body)
    expect(r.body.validation.errors.map((e: { rule: string }) => e.rule)).toContain('attribution-removed')
    expect((await inst.post(`/api/v1/authoring/items/${enc(s.id)}/draft/ready`, { version: r.body.draft.version })).status).toBe(422)
  })
  it('a citation removed from a paragraph without quotations stays a warning', () => {
    const { s, b } = find((x) => !/“/.test(x.text) && hasCite(x.text))
    const v = validateBody('learn-section', withText(s.body as SectionBody, b.id, stripCites(b.text)), s.body).validation
    expect(v.errors).toEqual([])
    expect(v.warnings.map((w) => w.rule)).toContain('citation-removed')
  })
})

describe('L1: published revision metadata and releases are immutable', () => {
  it('direct SQL cannot change metadata of published/superseded rows, release notes or item identity', async () => {
    await inst.get('/api/v1/authoring/items') // seeds
    const db = (t.store as unknown as { db: import('node:sqlite').DatabaseSync }).db
    for (const sql of [
      "UPDATE content_revisions SET change_note = 'rewritten' WHERE state = 'published'",
      "UPDATE content_revisions SET published_by = 'someone' WHERE state = 'published'",
      "UPDATE content_revisions SET author_id = 'someone' WHERE state = 'published'",
      "UPDATE content_revisions SET seq = seq + 100 WHERE state = 'published'",
      "UPDATE content_revisions SET published_at = '2000-01-01' WHERE state = 'published'",
      "UPDATE content_revisions SET updated_at = '2000-01-01' WHERE state = 'published'",
      "UPDATE content_revisions SET archived_at = '2000-01-01' WHERE state = 'published'",
      "UPDATE content_releases SET note = 'rewritten'",
      "UPDATE content_releases SET published_by = 'someone'",
      "UPDATE content_items SET seed_sha256 = 'x'",
    ])
      expect(() => db.prepare(sql).run(), sql).toThrow(/immutable|append-only/)
    // the permitted transitions still work (publish → supersede, archive)
    const s = SEEDS[3]
    const p = (await inst.get(`/api/v1/authoring/items/${enc(s.id)}`)).body
    const b = (s.body as SectionBody).blocks.find((x) => x.kind === 'para' && !x.cites && !/“/.test(x.text))
    if (b && b.kind === 'para') {
      const d = await draft(s.id, withText(s.body as SectionBody, b.id, `${b.text} One added sentence.`))
      expect(d.status).toBe(200)
      const plan = (await inst.post('/api/v1/authoring/publish-plan', { items: [s.id] })).body
      expect((await inst.post('/api/v1/authoring/releases', { planToken: plan.planToken, note: 'Transition still allowed.' })).status).toBe(201)
      expect(db.prepare("SELECT state FROM content_revisions WHERE id = ?").get(p.revisions[0].id)).toEqual({ state: 'superseded' })
      expect(() => db.prepare("UPDATE content_revisions SET change_note = 'x' WHERE state = 'superseded'").run()).toThrow(/immutable/)
    }
  })
})

describe('L2: paragraph ids are unique within an item, never reissued and bounded', () => {
  const s = SEEDS.find((x) => x.id === 'w01.learn.ch02-01') ?? SEEDS[0]
  const seed = s.body as SectionBody
  const publish = async (note: string) => {
    const plan = (await inst.post('/api/v1/authoring/publish-plan', { items: [s.id] })).body
    const r = await inst.post('/api/v1/authoring/releases', { planToken: plan.planToken, note })
    expect(r.status, JSON.stringify(r.body)).toBe(201)
  }
  it('a deleted id re-sent by a client is repaired to a fresh id (not reissued)', async () => {
    const a = await draft(s.id, { ...seed, blocks: [...seed.blocks, { id: 'new-1', kind: 'para', text: 'Added paragraph one.' }] })
    const added = a.body.body.blocks.at(-1).id as string
    await publish('Add a paragraph.')
    await draft(s.id, seed) // delete it again
    await publish('Remove the paragraph.')
    const c = await draft(s.id, { ...seed, blocks: [...seed.blocks, { id: added, kind: 'para', text: 'Different text under a retired id.' }] })
    expect(c.status).toBe(200)
    const last = c.body.body.blocks.at(-1)
    expect(last.id).not.toBe(added)
    expect(Number(last.id.slice(1))).toBe(Number(added.slice(1)) + 1)
    expect(c.body.validation.warnings.map((w: { rule: string }) => w.rule)).toContain('block-id-repaired')
  })
  it('an out-of-range id is repaired and the next save still works', async () => {
    const a = await draft(s.id, { ...seed, blocks: [...seed.blocks, { id: 'b99999', kind: 'para', text: 'A forged high id.' }] })
    expect(a.status).toBe(200)
    const id = a.body.body.blocks.at(-1).id as string
    expect(id).not.toBe('b99999')
    const b = await draft(s.id, { ...a.body.body, blocks: [...a.body.body.blocks, { id: 'new-2', kind: 'para', text: 'Another paragraph.' }] }, a.body.draft.version)
    expect(b.status).toBe(200)
    expect(b.body.body.blocks).toHaveLength(seed.blocks.length + 2)
    expect(b.body.validation.errors).toEqual([])
    const ids = b.body.body.blocks.map((x: { id: string }) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((x: string) => /^b\d{3,5}$/.test(x))).toBe(true)
  })
  it('a duplicated id is refused', () => {
    const p = seed.blocks.find((x) => x.kind === 'para' && !x.cites)!
    const v = validateBody('learn-section', { ...seed, blocks: [...seed.blocks, { ...p }] }, seed).validation
    expect(v.errors.map((e) => e.message).join(' ')).toMatch(/appears twice/)
  })
})

describe('L3: invisible and confusable characters', () => {
  const { s, b } = find((x) => !/“/.test(x.text))
  const check = (text: string) => validateBody('learn-section', withText(s.body as SectionBody, b.id, text), s.body).validation.errors.map((e) => e.rule)
  it('a zero-width space inside a register code is refused and the code is still found', () => {
    const rules = check('As R\u200B11 explains, boundaries matter.')
    expect(rules).toContain('invisible-chars')
    expect(rules).toContain('leak:register-code')
  })
  it('bidi controls, BOM and soft hyphens are refused', () => {
    for (const c of ['\u202E', '\u2066', '\uFEFF', '\u00AD', '\u200F']) expect(check(`Plain text${c} here.`), JSON.stringify(c)).toContain('invisible-chars')
  })
  it('a Cyrillic letter imitating a code is refused; full-width digits are normalised before the scan', () => {
    expect(check('As \u042011 explains, boundaries matter.')).toContain('confusable')
    expect(check('As R\uFF11\uFF11 explains, boundaries matter.')).toContain('leak:register-code')
  })
  it('the same rules hold on the server', async () => {
    const r = await draft(s.id, withText(s.body as SectionBody, b.id, 'As R\u200B11 explains, boundaries matter.'))
    expect(r.body.validation.errors.map((e: { rule: string }) => e.rule)).toEqual(expect.arrayContaining(['invisible-chars', 'leak:register-code']))
  })
})
