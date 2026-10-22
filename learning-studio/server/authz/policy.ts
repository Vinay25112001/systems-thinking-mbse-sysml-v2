// The single authorization choke point (SECURITY_ARCHITECTURE.md §5.1). Every route in server/routes.ts declares an
// action; the app loads the route's resource and calls authorize() before the handler runs. Handlers never decide
// access themselves. Rules:
//   - hidden resources answer 404, not 403, so a student cannot enumerate other teams (IDOR);
//   - instructors READ student work and decide approvals; they never write a project (403, they know it exists);
//   - faculty-only data reaches serialisers only through an InstructorContext, a type that only this module creates.
import type { ApprovalRow, ProjectRow, TeamRow } from '../repo/types'
import type { ContentItemRow } from '../repo/content' // publishing (M3)
import type { SubmissionRow } from '../repo/submissions' // m6
import type { Principal } from '../http/core'

export type Action =
  | 'session.self' // own session, password, logout
  | 'user.list' | 'user.create' | 'user.reset-password' | 'user.unlock'
  | 'team.list' | 'team.create' | 'team.read' | 'team.manage' | 'team.join'
  | 'project.create' | 'project.read' | 'project.write'
  | 'approval.request' | 'approval.read' | 'approval.queue' | 'approval.decide'
  | 'audit.read'
  // --- publishing --- read = published content (any signed-in account); author = drafts/publish (instructor only)
  | 'content.read' | 'content.author'
  // --- m6 --- create = a member submits the team's package; queue/decide = instructor only
  | 'submission.create' | 'submission.read' | 'submission.queue' | 'submission.decide'
  // --- end m6 ---
  // --- end publishing ---

export type Resource =
  | { kind: 'none' }
  | { kind: 'team'; team: TeamRow }
  | { kind: 'project'; project: ProjectRow }
  | { kind: 'approval'; approval: ApprovalRow; project: ProjectRow }
  | { kind: 'content'; item: ContentItemRow } // publishing (M3)
  | { kind: 'submission'; submission: SubmissionRow; project: ProjectRow } // m6
export type Decision = 'allow' | 'not-found' | 'forbidden'

declare const INSTRUCTOR: unique symbol
/** Proof that the caller holds the instructor role; required by every serialiser of faculty-only fields. */
export type InstructorContext = Principal & { readonly [INSTRUCTOR]: true }
export const isInstructor = (p: Principal | null) => !!p && p.roles.has('instructor')
export const isAdmin = (p: Principal | null) => !!p && p.roles.has('admin')
export const isStudent = (p: Principal | null) => !!p && p.roles.has('student')
/** The only constructor of an InstructorContext. */
export function asInstructor(p: Principal | null): InstructorContext | null {
  return isInstructor(p) ? (p as InstructorContext) : null
}

const teamOf = (r: Resource): string | null => (r.kind === 'team' ? r.team.id : r.kind === 'project' ? r.project.teamId : r.kind === 'approval' ? r.project.teamId : r.kind === 'submission' ? r.project.teamId /* m6 */ : null)
/** Active member of the team that owns the resource. */
const member = (p: Principal, r: Resource) => isStudent(p) && !!p.teamId && p.teamId === teamOf(r)

export function authorize(p: Principal | null, action: Action, r: Resource = { kind: 'none' }): Decision {
  if (!p) return 'not-found' // the app answers 401 before this for session routes
  const staff = isInstructor(p) || isAdmin(p)
  switch (action) {
    case 'session.self':
      return 'allow'
    case 'user.list':
    case 'user.create':
    case 'user.reset-password':
      return staff ? 'allow' : 'not-found'
    case 'user.unlock':
    case 'audit.read':
      return isAdmin(p) ? 'allow' : 'not-found'
    case 'team.list':
      return 'allow' // students see their own team only (the handler filters by principal.teamId)
    case 'team.create':
    case 'team.manage':
      return isInstructor(p) ? 'allow' : 'not-found'
    case 'team.join':
      return isStudent(p) ? 'allow' : 'forbidden'
    case 'team.read':
      return isInstructor(p) || member(p, r) ? 'allow' : 'not-found'
    case 'project.read':
    case 'approval.read':
      return isInstructor(p) || member(p, r) ? 'allow' : 'not-found'
    case 'project.create':
    case 'project.write':
    case 'approval.request':
      if (member(p, r)) return 'allow'
      return isInstructor(p) ? 'forbidden' : 'not-found' // instructors read student work but never write it
    case 'approval.queue':
    case 'approval.decide':
      return isInstructor(p) ? 'allow' : 'not-found'
    // --- publishing ---
    case 'content.read':
      return 'allow' // published content only; the handlers read student-visible rows only (assemble)
    // --- m6 ---
    case 'submission.read':
      return isInstructor(p) || member(p, r) ? 'allow' : 'not-found'
    case 'submission.create':
      if (member(p, r)) return 'allow'
      return isInstructor(p) ? 'forbidden' : 'not-found' // instructors never submit for a team
    case 'submission.queue':
    case 'submission.decide':
      return isInstructor(p) ? 'allow' : 'not-found'
    // --- end m6 ---
    case 'content.author':
      return isInstructor(p) ? 'allow' : 'not-found' // drafts are never reachable by students (404, ADM-01)
    // --- end publishing ---
  }
}
