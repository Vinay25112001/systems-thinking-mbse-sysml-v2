// Week submission routes (M6; spec §g). Kept in their own module (like the publishing routes) so the shared route table
// gets one delimited line. Every route declares its authorization action and its resource loader; server/app.ts calls
// authorize() before the handler runs. A student reaches only the own team's submissions (others answer 404).
import { asInstructor } from '../authz/policy'
import { HttpError, type Ctx, type Reply } from '../http/core'
import type { Route } from '../routes'
import { SUBMISSION_STATES, type SubmissionState } from '../repo/submissions'
import type { Resource } from '../authz/policy'
import { decideSubmission, instructorSubmissionView, parseSubmission, parseSubmissionDecision, submissionView, submit } from './submissions'

const ID = /^[A-Za-z0-9-]{1,64}$/
const param = (ctx: Ctx, k: string) => {
  const v = ctx.params[k]
  if (!ID.test(v ?? '')) throw new HttpError(404, 'not-found', 'Not found.')
  return v
}
const loadProject = async (ctx: Ctx): Promise<Resource | null> => {
  const id = param(ctx, 'id')
  const project = await ctx.deps.store.read((r) => r.projects.get(id))
  return project ? { kind: 'project', project } : null
}
const loadSubmission = async (ctx: Ctx): Promise<Resource | null> => {
  const id = param(ctx, 'id')
  return ctx.deps.store.read(async (r) => {
    const submission = await r.submissions.get(id)
    const project = submission ? await r.projects.get(submission.projectId) : null
    return submission && project ? { kind: 'submission', submission, project } : null
  })
}
const ok = (body: unknown, status = 200): Reply => ({ status, body })
const instructor = (ctx: Ctx) => {
  const ic = asInstructor(ctx.principal)
  if (!ic) throw new HttpError(404, 'not-found', 'Not found.')
  return ic
}

export const SUBMISSION_ROUTES: Route[] = [
  {
    // m6 (review H-1): the restore point of one import, by the import's own id (bound to its change set)
    method: 'GET', path: '/api/v1/projects/:id/imports/:importId', action: 'project.read', load: loadProject,
    handle: async (ctx, res) => {
      if (res.kind !== 'project') throw new Error('route wiring: project expected')
      const out = await ctx.deps.store.read(async (r) => {
        const rec = await r.projects.importRecord(res.project.id, param(ctx, 'importId'))
        if (!rec) return null
        // confirmation N-1: the record is honoured only while its version is still the one the server wrote for it
        const snaps = await r.projects.snapshots(res.project.id)
        const s = snaps.find((x) => x.id === rec.preImportSnapshot)
        return { rec, bound: !!s && s.kind === 'pre-import' && s.label === `Before import ${rec.chgId}` }
      })
      if (!out) throw new HttpError(404, 'not-found', 'Not found.')
      if (!out.bound) throw new HttpError(410, 'not-found', 'The version saved before this import is no longer stored, so the import cannot be undone from here. Choose a version in History instead.')
      return ok({ import: out.rec })
    },
  },
  {
    method: 'GET', path: '/api/v1/projects/:id/submissions', action: 'submission.read', load: loadProject,
    handle: async (ctx, res) => {
      if (res.kind !== 'project') throw new Error('route wiring: project expected')
      return ok({ submissions: await ctx.deps.store.read(async (r) => Promise.all((await r.submissions.byProject(res.project.id)).map((s) => submissionView(r, s)))) })
    },
  },
  {
    method: 'POST', path: '/api/v1/projects/:id/submissions', action: 'submission.create', load: loadProject, limit: 96 * 1024,
    handle: async (ctx, res) => {
      if (res.kind !== 'project') throw new Error('route wiring: project expected')
      return ok(await submit(ctx.deps, ctx.principal!, res.project, parseSubmission(ctx.body)), 201)
    },
  },
  {
    method: 'GET', path: '/api/v1/submissions', action: 'submission.queue',
    handle: async (ctx) => {
      const ic = instructor(ctx)
      const state = ctx.url.searchParams.get('state')
      if (state && !(SUBMISSION_STATES as readonly string[]).includes(state)) throw new HttpError(400, 'bad-request', 'Unknown state.')
      // superseded submissions stay on record but are listed only on request (?state=superseded or ?all=1; review M-3)
      const all = ctx.url.searchParams.get('all') === '1'
      return ok({ submissions: await ctx.deps.store.read(async (r) => Promise.all((await r.submissions.list((state as SubmissionState) ?? undefined)).filter((s) => state || all || s.state !== 'superseded').map((s) => instructorSubmissionView(ic, r, s)))) })
    },
  },
  {
    method: 'POST', path: '/api/v1/submissions/:id/decision', action: 'submission.decide', load: loadSubmission, limit: 64 * 1024,
    handle: async (ctx, res) => {
      if (res.kind !== 'submission') throw new Error('route wiring: submission expected')
      return ok(await decideSubmission(ctx.deps, instructor(ctx), res.submission, parseSubmissionDecision(ctx.body)))
    },
  },
]
