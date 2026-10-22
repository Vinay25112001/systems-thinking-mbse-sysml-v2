// The route table (/api/v1). Every route declares its authorization action and, when it acts on a team, project or
// approval, a loader for that resource; server/app.ts loads it and calls authorize() — the single choke point — before
// the handler runs. A loader returning null is a 404, exactly like a hidden resource.
// Endpoint list with authorization: docs/server/M2_BACKEND_REPORT.md §4.
import { asInstructor, isInstructor, type Action, type Resource } from './authz/policy'
import { badRequest, HttpError, isObj, sessionCookie, sha256, str, type Ctx, type Reply } from './http/core'
import { changePassword, sessionInfo, signIn, signOut } from './services/auth'
import { decideApproval, instructorView, parseDecision, requestApproval, studentView } from './services/approvals'
import { analyze, changeView, createProject, deleteSnapshot, exportFile, nameMap, parseChanges, projectView, putSnapshot, submitChanges } from './services/projects'
import { APPROVAL_STATES } from './repo/types'
import { addMember, createInvite, createTeam, createUser, joinTeam, listUsers, parseNewUser, removeMember, resetPassword, teamView, unlockUser } from './services/teams'
import { CONTENT_ROUTES } from './services/contentRoutes' // publishing (M3)
import { SUBMISSION_ROUTES } from './services/submissionRoutes' // m6

export type Route = {
  method: 'GET' | 'POST' | 'DELETE'
  path: string
  action: Action | 'public'
  /** Body size limit in bytes (SECURITY_ARCHITECTURE.md §7); default 256 KB. */
  limit?: number
  /** Reachable while the account must change its password. */
  passwordChange?: boolean
  load?: (ctx: Ctx) => Promise<Resource | null>
  handle: (ctx: Ctx, res: Resource) => Promise<Reply>
}

const KB = 1024
const ID = /^[A-Za-z0-9-]{1,64}$/
const idParam = (ctx: Ctx, k: string) => {
  const v = ctx.params[k]
  if (!ID.test(v ?? '')) throw new HttpError(404, 'not-found', 'Not found.')
  return v
}
const loadProject = async (ctx: Ctx): Promise<Resource | null> => {
  const id = idParam(ctx, 'id')
  const project = await ctx.deps.store.read((r) => r.projects.get(id))
  return project ? { kind: 'project', project } : null
}
const loadTeam = async (ctx: Ctx): Promise<Resource | null> => {
  const id = idParam(ctx, 'id')
  const team = await ctx.deps.store.read((r) => r.teams.get(id))
  return team ? { kind: 'team', team } : null
}
const loadApproval = async (ctx: Ctx): Promise<Resource | null> => {
  const id = idParam(ctx, 'id')
  return ctx.deps.store.read(async (r) => {
    const approval = await r.approvals.get(id)
    const project = approval ? await r.projects.get(approval.projectId) : null
    return approval && project ? { kind: 'approval', approval, project } : null
  })
}
const project = (res: Resource) => {
  if (res.kind !== 'project') throw new Error('route wiring: project expected')
  return res.project
}
const team = (res: Resource) => {
  if (res.kind !== 'team') throw new Error('route wiring: team expected')
  return res.team
}
const me = (ctx: Ctx) => ctx.principal!
const ok = (body: unknown, status = 200): Reply => ({ status, body })
/** Instructor-only handlers obtain their InstructorContext here; authorize() already allowed the action. */
const instructor = (ctx: Ctx) => {
  const ic = asInstructor(ctx.principal)
  if (!ic) throw new HttpError(404, 'not-found', 'Not found.')
  return ic
}

export const ROUTES: Route[] = [
  // ------------------------------------------------------------------------------------------- health & auth
  { method: 'GET', path: '/api/v1/health', action: 'public', handle: async () => ok({ ok: true }) },
  {
    method: 'POST', path: '/api/v1/auth/login', action: 'public', limit: 8 * KB,
    handle: async (ctx) => {
      const b = isObj(ctx.body) ? ctx.body : {}
      const login = typeof b.login === 'string' ? b.login.slice(0, 64) : ''
      const password = typeof b.password === 'string' ? b.password.slice(0, 256) : ''
      if (!login || !password) throw badRequest('Enter your login and password.')
      const s = await signIn(ctx.deps, login, password, ctx.ip, ctx.token)
      ctx.cookies.push(sessionCookie(ctx.deps.config, s.token, Math.round((Date.parse(s.row.expiresAt) - ctx.now.getTime()) / 1000)))
      return ok(await ctx.deps.store.read((r) => sessionInfo(r, ctx.deps.config, s.principal, s.row, s.token)))
    },
  },
  {
    method: 'POST', path: '/api/v1/auth/logout', action: 'session.self', passwordChange: true,
    handle: async (ctx) => {
      await signOut(ctx.deps.store, ctx.session!.tokenHash, me(ctx).userId, ctx.now)
      ctx.cookies.push(sessionCookie(ctx.deps.config, null, 0))
      return ok({ ok: true })
    },
  },
  {
    method: 'GET', path: '/api/v1/auth/session', action: 'session.self', passwordChange: true,
    handle: async (ctx) => ok(await ctx.deps.store.read((r) => sessionInfo(r, ctx.deps.config, me(ctx), ctx.session!, ctx.token!))),
  },
  {
    method: 'POST', path: '/api/v1/auth/password', action: 'session.self', passwordChange: true, limit: 8 * KB,
    handle: async (ctx) => {
      const b = isObj(ctx.body) ? ctx.body : {}
      const s = await changePassword(ctx.deps, me(ctx), String(b.current ?? ''), String(b.next ?? ''), ctx.session!.tokenHash, ctx.session!.createdAt)
      ctx.cookies.push(sessionCookie(ctx.deps.config, s.token, Math.round((Date.parse(s.row.expiresAt) - ctx.now.getTime()) / 1000)))
      const fresh = await ctx.deps.store.read(async (r) => ({ ...me(ctx), user: (await r.identity.userById(me(ctx).userId))! }))
      return ok(await ctx.deps.store.read((r) => sessionInfo(r, ctx.deps.config, fresh, s.row, s.token)))
    },
  },

  // ------------------------------------------------------------------------------------------- accounts (staff)
  { method: 'GET', path: '/api/v1/users', action: 'user.list', handle: async (ctx) => ok({ users: await ctx.deps.store.read(listUsers) }) },
  { method: 'POST', path: '/api/v1/users', action: 'user.create', limit: 8 * KB, handle: async (ctx) => ok(await createUser(ctx.deps, me(ctx), parseNewUser(ctx.body)), 201) },
  { method: 'POST', path: '/api/v1/users/:id/reset-password', action: 'user.reset-password', handle: async (ctx) => ok(await resetPassword(ctx.deps, me(ctx), idParam(ctx, 'id'))) },
  { method: 'POST', path: '/api/v1/users/:id/unlock', action: 'user.unlock', handle: async (ctx) => ok(await unlockUser(ctx.deps, me(ctx), idParam(ctx, 'id'))) },
  { method: 'GET', path: '/api/v1/audit', action: 'audit.read', handle: async (ctx) => ok({ entries: await ctx.deps.store.read((r) => r.audit.list(200)) }) },

  // ------------------------------------------------------------------------------------------- teams
  {
    method: 'GET', path: '/api/v1/teams', action: 'team.list',
    handle: async (ctx) =>
      ok({
        teams: await ctx.deps.store.read(async (r) => {
          const p = me(ctx)
          const list = isInstructor(p) ? await r.teams.list() : p.teamId ? [await r.teams.get(p.teamId)].filter((t) => !!t) : []
          return Promise.all(list.map((t) => teamView(r, t!)))
        }),
      }),
  },
  { method: 'POST', path: '/api/v1/teams', action: 'team.create', limit: 8 * KB, handle: async (ctx) => ok(await createTeam(ctx.deps, instructor(ctx), ctx.body), 201) },
  { method: 'POST', path: '/api/v1/teams/join', action: 'team.join', limit: 8 * KB, handle: async (ctx) => ok(await joinTeam(ctx.deps, me(ctx), ctx.body)) },
  { method: 'GET', path: '/api/v1/teams/:id', action: 'team.read', load: loadTeam, handle: async (ctx, res) => ok(await ctx.deps.store.read((r) => teamView(r, team(res)))) },
  { method: 'POST', path: '/api/v1/teams/:id/members', action: 'team.manage', load: loadTeam, limit: 8 * KB, handle: async (ctx, res) => ok(await addMember(ctx.deps, instructor(ctx), team(res), ctx.body)) },
  { method: 'DELETE', path: '/api/v1/teams/:id/members/:uid', action: 'team.manage', load: loadTeam, handle: async (ctx, res) => ok(await removeMember(ctx.deps, instructor(ctx), team(res), idParam(ctx, 'uid'))) },
  { method: 'POST', path: '/api/v1/teams/:id/invites', action: 'team.manage', load: loadTeam, handle: async (ctx, res) => ok(await createInvite(ctx.deps, instructor(ctx), team(res)), 201) },
  {
    // create the team's project: from a document built in the browser (empty, or from the Week 1 record), or by importing
    // an exported project / Week 1 file. Student-initiated only; browser data is never uploaded automatically.
    method: 'POST', path: '/api/v1/teams/:id/project', action: 'project.create', load: loadTeam, limit: 5 * KB * KB,
    handle: async (ctx, res) => {
      const b = isObj(ctx.body) ? ctx.body : {}
      const mode = b.mode === 'import' ? 'import' : b.mode === 'doc' ? 'doc' : null
      if (!mode) throw badRequest('mode must be doc or import.')
      const fileName = str(b.fileName, 'fileName', 200, { optional: true })
      const analyzed = await analyze(mode === 'import' ? { file: b.file, fileName } : { doc: b.doc, changes: b.changes, fileName })
      const clientChangeId = typeof b.clientChangeId === 'string' && /^[A-Za-z0-9:_-]{8,100}$/.test(b.clientChangeId) ? b.clientChangeId : null
      return ok(await createProject(ctx.deps, me(ctx), team(res), { mode, analyzed, clientChangeId }), 201)
    },
  },

  // ------------------------------------------------------------------------------------------- projects
  {
    method: 'GET', path: '/api/v1/projects/:id', action: 'project.read', load: loadProject,
    handle: async (ctx, res) => {
      const p = project(res)
      const etag = `"v${p.version}"`
      if (ctx.req.headers['if-none-match'] === etag) return { status: 304, headers: { ETag: etag } }
      return { status: 200, body: projectView(p), headers: { ETag: etag } }
    },
  },
  {
    method: 'GET', path: '/api/v1/projects/:id/changes', action: 'project.read', load: loadProject,
    handle: async (ctx, res) => {
      const since = Number(ctx.url.searchParams.get('since') ?? -1)
      if (!Number.isInteger(since)) throw badRequest('since must be a version number.')
      const p = project(res)
      return ok(await ctx.deps.store.read(async (r) => {
        const rows = await r.projects.changes(p.id, since)
        const names = await nameMap(r, rows.map((c) => c.actorUserId))
        return { version: p.version, changes: rows.map((c) => changeView(c, names)) }
      }))
    },
  },
  {
    method: 'POST', path: '/api/v1/projects/:id/changes', action: 'project.write', load: loadProject, limit: 1024 * KB,
    handle: async (ctx, res) => ok(await submitChanges(ctx.deps, me(ctx), project(res).id, await parseChanges(ctx.body))),
  },
  {
    // who stored each version is shown as initials (M2 review M3), never as an account id
    method: 'GET', path: '/api/v1/projects/:id/snapshots', action: 'project.read', load: loadProject,
    handle: async (ctx, res) =>
      ok({
        snapshots: await ctx.deps.store.read(async (r) => {
          const rows = await r.projects.snapshots(project(res).id)
          const initials = new Map<string, string>()
          for (const id of new Set(rows.map((x) => x.createdBy))) initials.set(id, (await r.identity.userById(id))?.initials ?? '')
          return rows.map(({ createdBy, ...m }) => ({ ...m, createdBy: initials.get(createdBy) ?? '' }))
        }),
      }),
  },
  {
    method: 'GET', path: '/api/v1/projects/:id/snapshots/:snp', action: 'project.read', load: loadProject,
    handle: async (ctx, res) => {
      const snp = /^SNP-\d{3,6}$/.test(ctx.params.snp ?? '') ? ctx.params.snp : ''
      const s = snp ? await ctx.deps.store.read((r) => r.projects.snapshot(project(res).id, snp)) : null
      if (!s) throw new HttpError(404, 'not-found', 'Not found.')
      const { createdBy: _c, ...rest } = s
      void _c
      return ok(rest)
    },
  },
  { method: 'POST', path: '/api/v1/projects/:id/snapshots', action: 'project.write', load: loadProject, limit: 1024 * KB, handle: async (ctx, res) => ok(await putSnapshot(ctx.deps, me(ctx), project(res), ctx.body), 201) },
  { method: 'DELETE', path: '/api/v1/projects/:id/snapshots/:snp', action: 'project.write', load: loadProject, handle: async (ctx, res) => ok(await deleteSnapshot(ctx.deps, me(ctx), project(res), String(ctx.params.snp ?? ''))) },
  {
    method: 'GET', path: '/api/v1/projects/:id/export', action: 'project.read', load: loadProject,
    handle: async (ctx, res) => {
      const p = project(res)
      const file = await ctx.deps.store.read((r) => exportFile(r, p, me(ctx).user.initials, ctx.now.toISOString()))
      const name = `team-${(p.doc.team.label || 'NN').replace(/[^A-Za-z0-9-]+/g, '-')}-project-${ctx.now.toISOString().slice(0, 10)}.json`
      if (isInstructor(me(ctx))) await ctx.deps.store.tx((r) => r.audit.append({ at: ctx.now.toISOString(), actorUserId: me(ctx).userId, actorRole: 'instructor', action: 'project.export', targetType: 'project', targetId: p.id, outcome: 'ok' }))
      return { status: 200, body: file, headers: { 'Content-Disposition': `attachment; filename="${name}"` } }
    },
  },

  // ------------------------------------------------------------------------------------------- approvals
  {
    method: 'GET', path: '/api/v1/projects/:id/approval', action: 'approval.read', load: loadProject,
    handle: async (ctx, res) => {
      const p = project(res)
      return ok(await ctx.deps.store.read(async (r) => {
        const a = await r.approvals.latest(p.id)
        const ic = asInstructor(ctx.principal)
        return { approval: a ? (ic ? await instructorView(ic, r, a) : await studentView(r, a)) : null }
      }))
    },
  },
  { method: 'POST', path: '/api/v1/projects/:id/approval-requests', action: 'approval.request', load: loadProject, handle: async (ctx, res) => ok(await requestApproval(ctx.deps, me(ctx), project(res)), 201) },
  {
    method: 'GET', path: '/api/v1/approvals', action: 'approval.queue',
    handle: async (ctx) => {
      const ic = instructor(ctx)
      const state = ctx.url.searchParams.get('state')
      if (state && !(APPROVAL_STATES as readonly string[]).includes(state)) throw badRequest('Unknown state.')
      return ok({ approvals: await ctx.deps.store.read(async (r) => Promise.all((await r.approvals.list((state as never) ?? undefined)).map((a) => instructorView(ic, r, a)))) })
    },
  },
  {
    method: 'POST', path: '/api/v1/approvals/:id/decision', action: 'approval.decide', load: loadApproval, limit: 16 * KB,
    handle: async (ctx, res) => {
      if (res.kind !== 'approval') throw new Error('route wiring: approval expected')
      return ok(await decideApproval(ctx.deps, instructor(ctx), res.approval, parseDecision(ctx.body)))
    },
  },
  // --- publishing --- content store: published content (students) and authoring (instructor); server/services/contentRoutes.ts
  ...CONTENT_ROUTES,
  // --- end publishing ---
  // --- m6 --- Week submissions: a member submits (immutable snapshot), the instructor decides; server/services/submissionRoutes.ts
  ...SUBMISSION_ROUTES,
  // --- end m6 ---
]

/** Matches '/api/v1/projects/:id' against a path; returns the parameters or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/')
  const b = path.split('/')
  if (a.length !== b.length) return null
  const out: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) {
      try {
        out[a[i].slice(1)] = decodeURIComponent(b[i])
      } catch {
        return null
      }
    } else if (a[i] !== b[i]) return null
  }
  return out
}
export const tokenHashOf = (token: string) => sha256(token)
