// Content publishing service (M3, limited scope per DECISION_LOG A24; CONTENT_PUBLISHING_DESIGN.md §4–§7, §10).
// Lifecycle DRAFT → READY FOR REVIEW → PUBLISHED → SUPERSEDED / ARCHIVED for the course introduction, the course
// settings (department placeholder) and the Week 1 Learn sections. Every write goes through Store.tx and touches only
// the content tables and the audit log (server/test/content.test.ts proves the other stores are byte-identical).
//   - Seed: the code-authored content becomes r1 PUBLISHED in REL-0001 at first start (idempotent; items added to the
//     code later are seeded into a new release; a code change after seeding is reported, never applied silently).
//   - One open draft per item (unique index); draft saves use a version check (409 names the other editor and time).
//   - Validation (src/publishing/validate.ts, shared with the editor) runs on every save; errors block "mark ready",
//     the publish plan and publish.
//   - Publish needs a plan token (10 minutes, bound to the instructor and to the exact draft/published versions) and a
//     change note; a stale draft (published head moved since the draft started) needs an explicit acknowledgement.
//   - Restore copies an earlier revision into a NEW draft (restoredFrom), then the normal publish path. History is linear.
//   - Students read only published revisions through assemble(); drafts are reachable only through authoring routes.
import { randomBytes } from 'node:crypto'
import { canonicalJson } from '../../src/project/transfer/exportProject'
import { diffBodies, type DiffSummary } from '../../src/publishing/diff'
import { blockNo, seedItems, type SeedItem } from '../../src/publishing/seed'
import { COURSE_INTRO_ID, scopeOfKind, sectionIdOf, type AnyBody, type ItemKind, type ItemSummary, type RevisionMeta, type Scope, type SectionBody, type StudentPayload, type Validation } from '../../src/publishing/types'
import { validateBody, withdrawalIssues } from '../../src/publishing/validate'
import type { InstructorContext } from '../authz/policy'
import { badRequest, HttpError, isObj, sha256, str, type Deps } from '../http/core'
import type { ContentItemRow, ReleaseRow, RevisionRow } from '../repo/content'
import type { Repos, Store } from '../repo/types'

export const SYSTEM_AUTHOR = 'system'
export const PLAN_TTL_MS = 10 * 60 * 1000
const bodySha = (b: unknown) => sha256(canonicalJson(b))
const relId = (seq: number) => `REL-${String(seq).padStart(4, '0')}`

// ------------------------------------------------------------------------------------------- seed
let seedCache: SeedItem[] | null = null
/** The code-authored content, evaluated once per process. */
export const seeds = () => (seedCache ??= seedItems())
const seedById = () => new Map(seeds().map((s) => [s.id, s]))

const seeded = new WeakMap<Store, Promise<void>>()
/** Seeds every missing item as r1 PUBLISHED (one release). Idempotent and safe to call on every request. */
export function ensureSeeded(deps: Deps): Promise<void> {
  const have = seeded.get(deps.store)
  if (have) return have
  const p: Promise<void> = seedNow(deps).then(
    () => undefined,
    (e) => {
      seeded.delete(deps.store)
      throw e
    },
  )
  seeded.set(deps.store, p)
  return p
}
export async function seedNow(deps: Deps): Promise<{ seeded: number; releaseId: string | null }> {
  const list = seeds()
  return deps.store.tx(async (r) => {
    const have = new Set((await r.content.items()).map((i) => i.id))
    const missing = list.filter((s) => !have.has(s.id))
    if (!missing.length) return { seeded: 0, releaseId: null }
    const at = deps.clock().toISOString()
    const seq = await r.content.nextReleaseSeq()
    const id = relId(seq)
    const items: ReleaseRow['items'] = []
    for (const s of missing) {
      const sha = bodySha(s.body)
      await r.content.createItem({ id: s.id, kind: s.kind, week: s.week, parentId: s.parentId, title: s.title, sort: s.sort, seedSha256: sha, createdAt: at, createdBy: SYSTEM_AUTHOR })
      const revId = crypto.randomUUID()
      await r.content.insertRevision({ id: revId, itemId: s.id, seq: 1, state: 'published', body: JSON.stringify(s.body), bodySha256: sha, baseRevisionId: null, restoredFrom: null, authorId: SYSTEM_AUTHOR, createdAt: at, updatedAt: at, submittedAt: at, submittedBy: SYSTEM_AUTHOR, publishedAt: at, publishedBy: SYSTEM_AUTHOR, releaseId: id, supersededAt: null, archivedAt: null, archivedBy: null, changeNote: 'Seed from the code-authored source', version: 1 })
      items.push({ itemId: s.id, revisionId: revId, action: 'publish' })
    }
    await r.content.insertRelease({ id, seq, publishedAt: at, publishedBy: SYSTEM_AUTHOR, note: seq === 1 ? 'Seed from the code-authored source (published v1)' : `Seed of ${missing.length} new code-authored item(s)`, items })
    await r.audit.append({ at, actorUserId: null, actorRole: 'system', action: 'content.seed', targetType: 'content_release', targetId: id, outcome: 'ok', detail: { items: missing.length } })
    return { seeded: missing.length, releaseId: id }
  })
}

// ------------------------------------------------------------------------------------------- helpers
const parse = (r: RevisionRow): AnyBody => JSON.parse(r.body) as AnyBody
async function names(r: Repos, ids: (string | null)[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  for (const id of new Set(ids.filter((x): x is string => !!x))) {
    if (id === SYSTEM_AUTHOR) out.set(id, 'Seed (code-authored source)')
    else out.set(id, (await r.identity.userById(id))?.displayName ?? 'former account')
  }
  return out
}
function meta(x: RevisionRow, nm: Map<string, string>, seqOf: Map<string, number>): RevisionMeta {
  return {
    id: x.id, itemId: x.itemId, seq: x.seq, state: x.state, bodySha256: x.bodySha256, baseRevisionId: x.baseRevisionId, restoredFrom: x.restoredFrom,
    restoredFromSeq: x.restoredFrom ? (seqOf.get(x.restoredFrom) ?? null) : null,
    author: nm.get(x.authorId) ?? '', createdAt: x.createdAt, updatedAt: x.updatedAt, submittedAt: x.submittedAt, submittedBy: x.submittedBy ? (nm.get(x.submittedBy) ?? '') : null,
    publishedAt: x.publishedAt, publishedBy: x.publishedBy ? (nm.get(x.publishedBy) ?? '') : null, releaseId: x.releaseId, supersededAt: x.supersededAt, archivedAt: x.archivedAt,
    archivedBy: x.archivedBy ? (nm.get(x.archivedBy) ?? '') : null, changeNote: x.changeNote, version: x.version,
  }
}
async function seedBody(r: Repos, itemId: string): Promise<AnyBody> {
  const r1 = await r.content.revisionBySeq(itemId, 1)
  if (!r1) throw new HttpError(500, 'server', 'The content item has no seed revision.')
  return parse(r1)
}
/** The highest block number an item ever used (a deleted block id is never reissued, design §3). */
async function maxBlockNo(r: Repos, item: ContentItemRow): Promise<number> {
  if (item.kind !== 'learn-section') return 0
  let m = 0
  for (const x of await r.content.revisions(item.id)) for (const b of (parse(x) as SectionBody).blocks ?? []) m = Math.max(m, blockNo(b.id))
  return m
}
export async function validateStored(r: Repos, item: ContentItemRow, body: unknown): Promise<{ body: AnyBody; validation: Validation }> {
  // M3 review L2: a non-seed block id is accepted only if the open draft or the published revision uses it
  let known: Set<string> | undefined
  if (item.kind === 'learn-section') {
    known = new Set()
    for (const x of [await r.content.openDraft(item.id), await r.content.published(item.id)]) if (x) for (const b of (parse(x) as SectionBody).blocks ?? []) known.add(b.id)
  }
  return validateBody(item.kind, body, await seedBody(r, item.id), await maxBlockNo(r, item), known)
}
const inScope = (kind: ItemKind, scope: Scope) => scopeOfKind(kind) === scope
const audit = (r: Repos, ic: InstructorContext, at: string, action: string, targetId: string, detail?: Record<string, unknown>) => r.audit.append({ at, actorUserId: ic.userId, actorRole: 'instructor', action, targetType: 'content_item', targetId, outcome: 'ok', detail })

// ------------------------------------------------------------------------------------------- student view
export async function releaseInfo(r: Repos): Promise<{ releaseId: string; publishedAt: string }> {
  const rel = await r.content.latestRelease()
  return rel ? { releaseId: rel.id, publishedAt: rel.publishedAt } : { releaseId: 'none', publishedAt: '' }
}
/** THE assembly function (design §6): the student payload from student-visible rows only (published revisions).
 *  The instructor preview calls it with `overrides` (item → draft revision), so a preview equals the future payload. */
export async function assemble(r: Repos, scope: Scope, overrides: Map<string, RevisionRow> = new Map()): Promise<StudentPayload> {
  const items = new Map((await r.content.items()).map((i) => [i.id, i]))
  const out: StudentPayload = { releaseId: (await releaseInfo(r)).releaseId, scope, items: {}, withdrawn: [] }
  for (const x of await r.content.allPublished()) {
    const it = items.get(x.itemId)
    if (!it || !inScope(it.kind, scope) || overrides.has(x.itemId)) continue
    out.items[x.itemId] = { revisionId: x.id, seq: x.seq, publishedAt: x.publishedAt ?? '', body: parse(x) }
  }
  for (const [itemId, x] of overrides) {
    const it = items.get(itemId)
    if (!it || !inScope(it.kind, scope)) continue
    out.items[itemId] = { revisionId: x.id, seq: x.seq, publishedAt: x.updatedAt, body: parse(x) }
  }
  out.withdrawn = (await r.content.withdrawnItems()).filter((id) => items.has(id) && inScope(items.get(id)!.kind, scope) && !overrides.has(id))
  return out
}

// ------------------------------------------------------------------------------------------- authoring: read
export async function listItems(r: Repos): Promise<ItemSummary[]> {
  const sm = seedById()
  const items = await r.content.items()
  const drafts = new Map((await r.content.openDrafts()).map((d) => [d.itemId, d]))
  const nm = await names(r, [...drafts.values()].map((d) => d.authorId))
  const pubs = new Map((await r.content.allPublished()).map((p) => [p.itemId, p]))
  const withdrawn = new Set(await r.content.withdrawnItems())
  return items.map((i) => {
    const p = pubs.get(i.id)
    const d = drafts.get(i.id)
    const s = sm.get(i.id)
    return {
      id: i.id, kind: i.kind, title: i.title, parentId: i.parentId, sort: i.sort,
      published: p ? { id: p.id, seq: p.seq, publishedAt: p.publishedAt ?? '' } : null,
      draft: d ? { id: d.id, seq: d.seq, state: d.state as 'draft' | 'ready-for-review', author: nm.get(d.authorId) ?? '', updatedAt: d.updatedAt } : null,
      archived: withdrawn.has(i.id),
      codeChanged: !!s && bodySha(s.body) !== i.seedSha256,
    }
  })
}
export async function itemDetail(r: Repos, item: ContentItemRow) {
  const revs = await r.content.revisions(item.id)
  const nm = await names(r, revs.flatMap((x) => [x.authorId, x.submittedBy, x.publishedBy, x.archivedBy]))
  const seqOf = new Map(revs.map((x) => [x.id, x.seq]))
  const draft = revs.find((x) => x.state === 'draft' || x.state === 'ready-for-review') ?? null
  const published = revs.find((x) => x.state === 'published') ?? null
  const seed = await seedBody(r, item.id)
  const s = seedById().get(item.id)
  return {
    item: { id: item.id, kind: item.kind, title: item.title, parentId: item.parentId, sectionId: sectionIdOf(item.id), codeChanged: !!s && bodySha(s.body) !== item.seedSha256 },
    revisions: revs.map((x) => meta(x, nm, seqOf)).reverse(),
    draft: draft ? { meta: meta(draft, nm, seqOf), body: parse(draft), validation: (await validateStored(r, item, parse(draft))).validation, stale: (draft.baseRevisionId ?? null) !== (published?.id ?? null) } : null,
    published: published ? { meta: meta(published, nm, seqOf), body: parse(published) } : null,
    seed,
    archived: !published && revs.some((x) => x.state === 'archived'),
  }
}
export async function revisionView(r: Repos, item: ContentItemRow, revId: string) {
  const x = /^[0-9a-f-]{36}$/.test(revId) ? await r.content.revision(revId) : null
  if (!x || x.itemId !== item.id) throw new HttpError(404, 'not-found', 'Not found.')
  const revs = await r.content.revisions(item.id)
  const nm = await names(r, [x.authorId, x.submittedBy, x.publishedBy, x.archivedBy])
  return { meta: meta(x, nm, new Map(revs.map((y) => [y.id, y.seq]))), body: parse(x) }
}
export async function releaseList(r: Repos) {
  const rels = await r.content.releases(100)
  const nm = await names(r, rels.map((x) => x.publishedBy))
  return rels.map((x) => ({ ...x, publishedBy: nm.get(x.publishedBy) ?? '' }))
}

// ------------------------------------------------------------------------------------------- authoring: write
export function parseDraft(b: unknown): { body: unknown; version: number | null } {
  if (!isObj(b) || !('body' in b)) throw badRequest('Send the draft body.')
  const version = b.version === undefined || b.version === null ? null : Number(b.version)
  if (version !== null && !Number.isInteger(version)) throw badRequest('version must be a number.')
  return { body: b.body, version }
}
export async function saveDraft(deps: Deps, ic: InstructorContext, item: ContentItemRow, input: { body: unknown; version: number | null }) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const { body, validation } = await validateStored(r, item, input.body)
    const json = JSON.stringify(body)
    const sha = bodySha(body)
    let draft = await r.content.openDraft(item.id)
    if (draft) {
      if (input.version === null || input.version !== draft.version) {
        const who = (await names(r, [draft.authorId])).get(draft.authorId)
        throw new HttpError(409, 'conflict', `${who} saved this draft at ${draft.updatedAt}, after you opened it. Reload their draft, or copy your text first.`, { editor: who, at: draft.updatedAt, version: draft.version })
      }
      if (draft.state === 'ready-for-review') {
        // editing a draft that was marked ready returns it to draft (design §4.2 "return"), recorded
        if (!(await r.content.setState(draft.id, 'ready-for-review', 'draft', { submittedAt: null, submittedBy: null }, at))) throw new HttpError(409, 'conflict', 'The draft changed meanwhile; reload it.')
        await audit(r, ic, at, 'content.return', item.id, { revision: draft.id, reason: 'edited' })
      }
      if (!(await r.content.updateDraft(draft.id, json, sha, draft.version, at, ic.userId))) throw new HttpError(409, 'conflict', 'The draft changed meanwhile; reload it.')
    } else {
      if (input.version !== null) throw new HttpError(409, 'conflict', 'This draft was published or discarded meanwhile. Reload the item.')
      const published = await r.content.published(item.id)
      const id = crypto.randomUUID()
      await r.content.insertRevision({ id, itemId: item.id, seq: await r.content.nextSeq(item.id), state: 'draft', body: json, bodySha256: sha, baseRevisionId: published?.id ?? null, restoredFrom: null, authorId: ic.userId, createdAt: at, updatedAt: at, submittedAt: null, submittedBy: null, publishedAt: null, publishedBy: null, releaseId: null, supersededAt: null, archivedAt: null, archivedBy: null, changeNote: '', version: 1 })
    }
    draft = (await r.content.openDraft(item.id))!
    await audit(r, ic, at, 'content.draft.save', item.id, { revision: draft.id, seq: draft.seq, errors: validation.errors.length })
    const nm = await names(r, [draft.authorId])
    return { draft: meta(draft, nm, new Map()), body, validation }
  })
}
async function requireDraft(r: Repos, item: ContentItemRow) {
  const d = await r.content.openDraft(item.id)
  if (!d) throw new HttpError(409, 'conflict', 'This item has no open draft.')
  return d
}
export async function markReady(deps: Deps, ic: InstructorContext, item: ContentItemRow, version: unknown) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const d = await requireDraft(r, item)
    if (Number(version) !== d.version) throw new HttpError(409, 'conflict', 'The draft changed since you opened it; reload it.')
    if (d.state !== 'draft') throw new HttpError(409, 'conflict', 'The draft is already marked ready for review.')
    const { validation } = await validateStored(r, item, parse(d))
    if (validation.errors.length) throw new HttpError(422, 'integrity', 'Fix the errors before marking the draft ready for review.', { validation })
    await r.content.setState(d.id, 'draft', 'ready-for-review', { submittedAt: at, submittedBy: ic.userId }, at)
    await audit(r, ic, at, 'content.ready', item.id, { revision: d.id })
    return { ok: true }
  })
}
export async function returnToDraft(deps: Deps, ic: InstructorContext, item: ContentItemRow) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const d = await requireDraft(r, item)
    if (d.state !== 'ready-for-review') throw new HttpError(409, 'conflict', 'The draft is not marked ready for review.')
    await r.content.setState(d.id, 'ready-for-review', 'draft', { submittedAt: null, submittedBy: null }, at)
    await audit(r, ic, at, 'content.return', item.id, { revision: d.id })
    return { ok: true }
  })
}
export async function discardDraft(deps: Deps, ic: InstructorContext, item: ContentItemRow) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const d = await requireDraft(r, item)
    await r.content.deleteOpenDraft(d.id)
    await audit(r, ic, at, 'content.discard', item.id, { revision: d.id, seq: d.seq })
    return { ok: true }
  })
}
export async function restoreRevision(deps: Deps, ic: InstructorContext, item: ContentItemRow, b: unknown) {
  const revisionId = isObj(b) && typeof b.revisionId === 'string' ? b.revisionId : ''
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const src = /^[0-9a-f-]{36}$/.test(revisionId) ? await r.content.revision(revisionId) : null
    if (!src || src.itemId !== item.id) throw new HttpError(404, 'not-found', 'That revision does not exist.')
    if (src.state === 'draft' || src.state === 'ready-for-review') throw badRequest('Only a published, superseded or archived revision can be restored.')
    if (await r.content.openDraft(item.id)) throw new HttpError(409, 'conflict', 'This item already has an open draft. Publish or discard it before restoring an earlier version.')
    const published = await r.content.published(item.id)
    const body = parse(src)
    const id = crypto.randomUUID()
    const seq = await r.content.nextSeq(item.id)
    await r.content.insertRevision({ id, itemId: item.id, seq, state: 'draft', body: src.body, bodySha256: bodySha(body), baseRevisionId: published?.id ?? null, restoredFrom: src.id, authorId: ic.userId, createdAt: at, updatedAt: at, submittedAt: null, submittedBy: null, publishedAt: null, publishedBy: null, releaseId: null, supersededAt: null, archivedAt: null, archivedBy: null, changeNote: '', version: 1 })
    await audit(r, ic, at, 'content.restore', item.id, { revision: id, seq, restoredFrom: src.id, restoredFromSeq: src.seq })
    return { draftId: id, seq, restoredFromSeq: src.seq }
  })
}
export async function archiveItem(deps: Deps, ic: InstructorContext, item: ContentItemRow, b: unknown) {
  const note = str(isObj(b) ? b.note : undefined, 'A reason for withdrawing', 500, { min: 3 })
  const at = deps.clock().toISOString()
  if (item.kind !== 'learn-section') throw new HttpError(409, 'conflict', item.id === COURSE_INTRO_ID ? 'The course introduction cannot be withdrawn; publish a new version instead.' : 'The course settings cannot be withdrawn; publish a new version instead.')
  return deps.store.tx(async (r) => {
    const p = await r.content.published(item.id)
    if (!p) throw new HttpError(409, 'conflict', 'This item has no published version to withdraw.')
    const withdrawn = new Set((await r.content.withdrawnItems()).map((id) => sectionIdOf(id)!).filter(Boolean))
    withdrawn.add(sectionIdOf(item.id)!)
    const issues = withdrawalIssues(withdrawn)
    if (issues.length) throw new HttpError(422, 'integrity', issues[0].message, { validation: { errors: issues, warnings: [] } })
    const seq = await r.content.nextReleaseSeq()
    const id = relId(seq)
    if (!(await r.content.setState(p.id, 'published', 'archived', { archivedAt: at, archivedBy: ic.userId }, at))) throw new HttpError(409, 'conflict', 'The published version changed meanwhile; reload.')
    await r.content.insertRelease({ id, seq, publishedAt: at, publishedBy: ic.userId, note: `Withdrawn: ${note}`, items: [{ itemId: item.id, revisionId: p.id, action: 'archive' }] })
    await audit(r, ic, at, 'content.archive', item.id, { revision: p.id, release: id })
    return { releaseId: id }
  })
}

// ------------------------------------------------------------------------------------------- publish plan and release
type PlanEntry = { itemId: string; draftId: string; draftVersion: number; publishedId: string | null; stale: boolean }
type Plan = { userId: string; expires: number; entries: PlanEntry[] }
const plans = new WeakMap<Store, Map<string, Plan>>()
const planMap = (deps: Deps) => {
  let m = plans.get(deps.store)
  if (!m) plans.set(deps.store, (m = new Map()))
  for (const [k, v] of m) if (v.expires < deps.clock().getTime()) m.delete(k)
  return m
}
export type PlanItem = { itemId: string; title: string; kind: ItemKind; from: { revisionId: string; seq: number } | null; to: { revisionId: string; seq: number; state: string }; summary: DiffSummary; validation: Validation; stale: boolean; restoredFromSeq: number | null }

export function parseItemIds(b: unknown): string[] {
  const ids = isObj(b) && Array.isArray(b.items) ? b.items : []
  const out = [...new Set(ids.filter((x): x is string => typeof x === 'string'))]
  if (!out.length || out.length > 100) throw badRequest('Choose between 1 and 100 items to publish.')
  return out
}
export async function publishPlan(deps: Deps, ic: InstructorContext, itemIds: string[]) {
  const now = deps.clock().getTime()
  const out = await deps.store.read(async (r) => {
    const items: PlanItem[] = []
    const entries: PlanEntry[] = []
    for (const id of itemIds) {
      const item = await r.content.item(id)
      if (!item) throw new HttpError(404, 'not-found', `No content item ${id.slice(0, 40)}.`)
      const d = await r.content.openDraft(id)
      if (!d) throw new HttpError(409, 'conflict', `${item.title}: there is no draft to publish.`)
      const p = await r.content.published(id)
      const body = parse(d)
      const { validation } = await validateStored(r, item, body)
      const stale = (d.baseRevisionId ?? null) !== (p?.id ?? null)
      const restoredFromSeq = d.restoredFrom ? ((await r.content.revision(d.restoredFrom))?.seq ?? null) : null
      items.push({ itemId: id, title: item.title, kind: item.kind, from: p ? { revisionId: p.id, seq: p.seq } : null, to: { revisionId: d.id, seq: d.seq, state: d.state }, summary: diffBodies(item.kind, p ? parse(p) : null, body).summary, validation, stale, restoredFromSeq })
      entries.push({ itemId: id, draftId: d.id, draftVersion: d.version, publishedId: p?.id ?? null, stale })
    }
    return { items, entries }
  })
  const token = randomBytes(24).toString('base64url')
  const expires = now + PLAN_TTL_MS
  planMap(deps).set(token, { userId: ic.userId, expires, entries: out.entries })
  return {
    planToken: token,
    expiresAt: new Date(expires).toISOString(),
    items: out.items,
    errors: out.items.reduce((s, i) => s + i.validation.errors.length, 0),
    stale: out.items.some((i) => i.stale),
    studentData: 'None affected: a publish writes only the content store and the audit log. Projects, progress and submissions are separate stores.',
  }
}
export function parsePublish(b: unknown): { planToken: string; note: string; acknowledgeStale: boolean } {
  const x = isObj(b) ? b : {}
  const planToken = typeof x.planToken === 'string' && /^[A-Za-z0-9_-]{20,64}$/.test(x.planToken) ? x.planToken : ''
  if (!planToken) throw badRequest('Review the publish plan first.')
  return { planToken, note: str(x.note, 'A change note', 500, { min: 3 }), acknowledgeStale: x.acknowledgeStale === true }
}
export async function publishRelease(deps: Deps, ic: InstructorContext, input: { planToken: string; note: string; acknowledgeStale: boolean }) {
  const m = planMap(deps)
  const plan = m.get(input.planToken)
  if (!plan || plan.userId !== ic.userId) throw new HttpError(409, 'conflict', 'The publish plan expired or is not yours. Review the plan again.', { reason: 'plan-stale' })
  const at = deps.clock().toISOString()
  const out = await deps.store.tx(async (r) => {
    for (const e of plan.entries) {
      const d = await r.content.openDraft(e.itemId)
      const p = await r.content.published(e.itemId)
      if (!d || d.id !== e.draftId || d.version !== e.draftVersion || (p?.id ?? null) !== e.publishedId) throw new HttpError(409, 'conflict', 'Something changed since the plan was made (a draft was edited or another version was published). Review the plan again.', { reason: 'plan-stale' })
      const item = (await r.content.item(e.itemId))!
      const { validation } = await validateStored(r, item, parse(d))
      if (validation.errors.length) throw new HttpError(422, 'integrity', `${item.title}: fix the errors before publishing.`, { validation })
      if (e.stale && !input.acknowledgeStale) throw new HttpError(409, 'conflict', `${item.title}: a newer version was published after this draft started. Compare it with the published version and confirm.`, { reason: 'stale-draft' })
    }
    const seq = await r.content.nextReleaseSeq()
    const id = relId(seq)
    const items: ReleaseRow['items'] = []
    for (const e of plan.entries) {
      const d = (await r.content.openDraft(e.itemId))!
      if (e.publishedId && !(await r.content.setState(e.publishedId, 'published', 'superseded', { supersededAt: at }, at))) throw new HttpError(409, 'conflict', 'The published version changed meanwhile.', { reason: 'plan-stale' })
      const ok = await r.content.setState(d.id, d.state, 'published', { publishedAt: at, publishedBy: ic.userId, releaseId: id, changeNote: input.note, ...(d.submittedAt ? {} : { submittedAt: at, submittedBy: ic.userId }) }, at)
      if (!ok) throw new HttpError(409, 'conflict', 'The draft changed meanwhile.', { reason: 'plan-stale' })
      items.push({ itemId: e.itemId, revisionId: d.id, action: 'publish' })
      await audit(r, ic, at, 'content.publish', e.itemId, { revision: d.id, seq: d.seq, release: id, selfReviewed: !d.submittedAt || d.submittedBy === ic.userId })
    }
    await r.content.insertRelease({ id, seq, publishedAt: at, publishedBy: ic.userId, note: input.note, items })
    return { releaseId: id, publishedAt: at, items: items.length }
  })
  m.delete(input.planToken)
  return out
}
