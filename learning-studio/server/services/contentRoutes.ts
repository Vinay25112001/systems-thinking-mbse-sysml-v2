// Content publishing routes (M3), spread into the route table (server/routes.ts, block "publishing"). Every route
// declares its action; app.ts calls authorize() before the handler (the single choke point):
//   content.read   — any signed-in account: the latest PUBLISHED content only (student view);
//   content.author — the instructor role: drafts, review, preview, compare, publish, restore, archive. Everyone else
//                    gets 404 (no enumeration, ADM-01), including an admin without the instructor role
//                    (SECURITY_ARCHITECTURE.md §5.2 "✘ (unless also I)").
// Every POST/DELETE also passes the app's JSON + Origin + CSRF checks.
import { ITEM_ID_RE, type Scope } from '../../src/publishing/types'
import { asInstructor, type Resource } from '../authz/policy'
import { badRequest, HttpError, type Ctx, type Reply } from '../http/core'
import type { Route } from '../routes'
import { archiveItem, assemble, discardDraft, ensureSeeded, itemDetail, listItems, markReady, parseDraft, parseItemIds, parsePublish, publishPlan, publishRelease, releaseInfo, releaseList, restoreRevision, returnToDraft, revisionView, saveDraft } from './content'
import { isObj } from '../http/core'

const KB = 1024
const ok = (body: unknown, status = 200): Reply => ({ status, body })
const instructor = (ctx: Ctx) => {
  const ic = asInstructor(ctx.principal)
  if (!ic) throw new HttpError(404, 'not-found', 'Not found.')
  return ic
}
const itemOf = (res: Resource) => {
  if (res.kind !== 'content') throw new Error('route wiring: content item expected')
  return res.item
}
const loadItem = async (ctx: Ctx): Promise<Resource | null> => {
  const id = ctx.params.id ?? ''
  if (!ITEM_ID_RE.test(id)) return null
  await ensureSeeded(ctx.deps)
  const item = await ctx.deps.store.read((r) => r.content.item(id))
  return item ? { kind: 'content', item } : null
}
/** ETag revalidation (design §7.1): `Cache-Control: no-cache` so the browser asks, and 304 when nothing changed. */
function etagged(ctx: Ctx, etag: string, body: () => Promise<unknown>): Promise<Reply> {
  const tag = `"${etag}"`
  const headers = { ETag: tag, 'Cache-Control': 'no-cache' }
  if (ctx.req.headers['if-none-match'] === tag) return Promise.resolve({ status: 304, headers })
  return body().then((b) => ({ status: 200, body: b, headers }))
}
const scopeParam = (v: string | undefined): Scope => {
  if (v === 'course') return 'course'
  if (v === 'week1' || v === '1') return 'week1'
  throw new HttpError(404, 'not-found', 'Not found.')
}

export const CONTENT_ROUTES: Route[] = [
  // ------------------------------------------------------------------------------------------- student view
  {
    method: 'GET', path: '/api/v1/content/release', action: 'content.read',
    handle: async (ctx) => {
      await ensureSeeded(ctx.deps)
      const info = await ctx.deps.store.read(releaseInfo)
      return etagged(ctx, info.releaseId, async () => info)
    },
  },
  {
    method: 'GET', path: '/api/v1/content/course', action: 'content.read',
    handle: async (ctx) => {
      await ensureSeeded(ctx.deps)
      const rel = await ctx.deps.store.read(releaseInfo)
      return etagged(ctx, `${rel.releaseId}:course`, () => ctx.deps.store.read((r) => assemble(r, 'course')))
    },
  },
  {
    method: 'GET', path: '/api/v1/content/weeks/:n', action: 'content.read',
    handle: async (ctx) => {
      if (ctx.params.n !== '1') throw new HttpError(404, 'not-found', 'Not found.') // Weeks 2–14 stay bundled (design §7.4)
      await ensureSeeded(ctx.deps)
      const rel = await ctx.deps.store.read(releaseInfo)
      return etagged(ctx, `${rel.releaseId}:week1`, () => ctx.deps.store.read((r) => assemble(r, 'week1')))
    },
  },

  // ------------------------------------------------------------------------------------------- authoring (instructor)
  {
    method: 'GET', path: '/api/v1/authoring/items', action: 'content.author',
    handle: async (ctx) => {
      instructor(ctx)
      await ensureSeeded(ctx.deps)
      return ok({ items: await ctx.deps.store.read(listItems), release: await ctx.deps.store.read(releaseInfo) })
    },
  },
  { method: 'GET', path: '/api/v1/authoring/items/:id', action: 'content.author', load: loadItem, handle: async (ctx, res) => (instructor(ctx), ok(await ctx.deps.store.read((r) => itemDetail(r, itemOf(res))))) },
  { method: 'GET', path: '/api/v1/authoring/items/:id/revisions/:rev', action: 'content.author', load: loadItem, handle: async (ctx, res) => (instructor(ctx), ok(await ctx.deps.store.read((r) => revisionView(r, itemOf(res), ctx.params.rev ?? '')))) },
  { method: 'POST', path: '/api/v1/authoring/items/:id/draft', action: 'content.author', load: loadItem, limit: 512 * KB, handle: async (ctx, res) => ok(await saveDraft(ctx.deps, instructor(ctx), itemOf(res), parseDraft(ctx.body))) },
  { method: 'POST', path: '/api/v1/authoring/items/:id/draft/ready', action: 'content.author', load: loadItem, limit: 8 * KB, handle: async (ctx, res) => ok(await markReady(ctx.deps, instructor(ctx), itemOf(res), isObj(ctx.body) ? ctx.body.version : undefined)) },
  { method: 'POST', path: '/api/v1/authoring/items/:id/draft/return', action: 'content.author', load: loadItem, limit: 8 * KB, handle: async (ctx, res) => ok(await returnToDraft(ctx.deps, instructor(ctx), itemOf(res))) },
  { method: 'DELETE', path: '/api/v1/authoring/items/:id/draft', action: 'content.author', load: loadItem, limit: 8 * KB, handle: async (ctx, res) => ok(await discardDraft(ctx.deps, instructor(ctx), itemOf(res))) },
  { method: 'POST', path: '/api/v1/authoring/items/:id/restore', action: 'content.author', load: loadItem, limit: 8 * KB, handle: async (ctx, res) => ok(await restoreRevision(ctx.deps, instructor(ctx), itemOf(res), ctx.body), 201) },
  { method: 'POST', path: '/api/v1/authoring/items/:id/archive', action: 'content.author', load: loadItem, limit: 8 * KB, handle: async (ctx, res) => ok(await archiveItem(ctx.deps, instructor(ctx), itemOf(res), ctx.body)) },
  {
    // "Preview as student": the student assembly with the item's open draft as an override (design §6)
    method: 'GET', path: '/api/v1/authoring/preview/:scope', action: 'content.author',
    handle: async (ctx) => {
      instructor(ctx)
      await ensureSeeded(ctx.deps)
      const scope = scopeParam(ctx.params.scope)
      const id = ctx.url.searchParams.get('item') ?? ''
      if (id && !ITEM_ID_RE.test(id)) throw badRequest('Unknown item.')
      return ok(await ctx.deps.store.read(async (r) => {
        const d = id ? await r.content.openDraft(id) : null
        const payload = await assemble(r, scope, d ? new Map([[id, d]]) : new Map())
        return { ...payload, preview: d ? { itemId: id, revisionId: d.id, seq: d.seq } : null }
      }))
    },
  },
  { method: 'POST', path: '/api/v1/authoring/publish-plan', action: 'content.author', limit: 8 * KB, handle: async (ctx) => (await ensureSeeded(ctx.deps), ok(await publishPlan(ctx.deps, instructor(ctx), parseItemIds(ctx.body)))) },
  { method: 'POST', path: '/api/v1/authoring/releases', action: 'content.author', limit: 8 * KB, handle: async (ctx) => ok(await publishRelease(ctx.deps, instructor(ctx), parsePublish(ctx.body)), 201) },
  { method: 'GET', path: '/api/v1/authoring/releases', action: 'content.author', handle: async (ctx) => (instructor(ctx), await ensureSeeded(ctx.deps), ok({ releases: await ctx.deps.store.read(releaseList) })) },
]
