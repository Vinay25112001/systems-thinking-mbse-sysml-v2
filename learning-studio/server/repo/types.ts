// Repository ports (docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md §5). Async from day one, so a PostgreSQL
// implementation changes no service code. One port per store (PROJECT_DATA_SCHEMA.md §2). Services reach them only through
// Store.read / Store.tx, never by holding a connection.
import type { ChangeSet, ProjectDoc, SnapshotMeta } from '../../src/project/model/types'
import type { InstructorContext } from '../authz/policy'

export type Role = 'student' | 'instructor' | 'admin'
export const ROLES: readonly Role[] = ['student', 'instructor', 'admin']

export type UserRow = {
  id: string
  displayName: string
  email: string | null
  initials: string
  status: 'active' | 'disabled'
  mustChangePassword: boolean
  demo: boolean
  createdAt: string
  createdBy: string | null
}
export type Credential = { userId: string; hash: string; failedCount: number; lockedUntil: string | null }
export type SessionRow = { tokenHash: string; userId: string; csrfHash: string; createdAt: string; lastSeenAt: string; idleSeconds: number; expiresAt: string }

export interface IdentityRepo {
  createUser(u: UserRow, login: string, hash: string, roles: Role[], grantedBy: string | null): Promise<void>
  userById(id: string): Promise<UserRow | null>
  /** The user and credential for a local login name (normalised lower-case). */
  byLogin(login: string): Promise<{ user: UserRow; cred: Credential } | null>
  loginOf(userId: string): Promise<string | null>
  roles(userId: string): Promise<Role[]>
  listUsers(): Promise<(UserRow & { login: string | null; roles: Role[] })[]>
  setPassword(userId: string, hash: string, mustChange: boolean, at: string): Promise<void>
  setLoginFailures(userId: string, failedCount: number, lockedUntil: string | null): Promise<void>
  countUsers(): Promise<number>
  countDemoUsers(): Promise<number>
  createSession(s: SessionRow): Promise<void>
  session(tokenHash: string): Promise<SessionRow | null>
  touchSession(tokenHash: string, at: string): Promise<void>
  deleteSession(tokenHash: string): Promise<void>
  deleteSessionsOf(userId: string, exceptTokenHash?: string): Promise<number>
  /** Deletes sessions past their absolute or idle expiry (and revoked ones). */
  deleteExpiredSessions(nowIso: string): Promise<number>
}

export type TeamRow = { id: string; label: string; maxMembers: number; status: 'active' | 'archived'; createdBy: string; createdAt: string }
export type MemberRow = { userId: string; displayName: string; initials: string; joinedAt: string }
export interface TeamRepo {
  create(t: TeamRow): Promise<void>
  get(id: string): Promise<TeamRow | null>
  list(): Promise<TeamRow[]>
  members(teamId: string): Promise<MemberRow[]>
  activeTeamOf(userId: string): Promise<TeamRow | null>
  addMember(teamId: string, userId: string, by: string, at: string): Promise<void>
  removeMember(teamId: string, userId: string, by: string, at: string): Promise<boolean>
  createInvite(codeHash: string, teamId: string, by: string, expiresAt: string, maxUses: number): Promise<void>
  invite(codeHash: string): Promise<{ teamId: string; expiresAt: string; maxUses: number; uses: number } | null>
  useInvite(codeHash: string): Promise<void>
}

export type ProjectRow = { id: string; teamId: string; doc: ProjectDoc; version: number; createdAt: string; createdBy: string; updatedAt: string; updatedBy: string }
export type ChangeRow = ChangeSet & { seq: number; version: number; actorUserId: string | null; clientChangeId: string | null }
export type SnapshotRow = SnapshotMeta & { createdBy: string }
export interface ProjectRepo {
  create(p: ProjectRow): Promise<void>
  get(id: string): Promise<ProjectRow | null>
  byTeam(teamId: string): Promise<ProjectRow | null>
  list(): Promise<ProjectRow[]>
  /** Writes the new document only if the stored version is still `expectedVersion` (false otherwise). */
  update(id: string, doc: ProjectDoc, expectedVersion: number, by: string, at: string): Promise<boolean>
  appendChange(projectId: string, c: ChangeRow): Promise<void>
  nextSeq(projectId: string): Promise<number>
  changes(projectId: string, sinceVersion?: number): Promise<ChangeRow[]>
  changesByClientIds(projectId: string, ids: string[]): Promise<ChangeRow[]>
  putSnapshot(projectId: string, s: SnapshotRow, doc: ProjectDoc): Promise<void>
  snapshots(projectId: string): Promise<SnapshotRow[]>
  snapshot(projectId: string, snpId: string): Promise<(SnapshotRow & { doc: ProjectDoc }) | null>
  deleteSnapshot(projectId: string, snpId: string): Promise<boolean>
  maxSnapshotNo(projectId: string): Promise<number>
  /** Count and stored bytes of a project's snapshots (the M3 quota). */
  snapshotUsage(projectId: string): Promise<{ count: number; bytes: number }>
  putImportRecord(r: { id: string; projectId: string; userId: string; at: string; format: string; fileName: string | null; fileSha256: string | null; fileSize: number | null; warnings: string; createdIds: string[]; chgId: string; preImportSnapshot: string }): Promise<void>
  /** m6 (review H-1): one import record of the project by its id (the import's own id, bound to its change set). */
  importRecord(projectId: string, id: string): Promise<{ id: string; at: string; format: string; fileName: string | null; createdIds: string[]; chgId: string; preImportSnapshot: string } | null>
  /** m6 (confirmation N-2): whether an import id is used by any project (import_records.id is a global key). */
  importRecordAnywhere(id: string): Promise<boolean>
}

export type ApprovalState = 'pending' | 'approved' | 'approved-changes-pending' | 'revision-requested' | 'withdrawn'
export const APPROVAL_STATES: readonly ApprovalState[] = ['pending', 'approved', 'approved-changes-pending', 'revision-requested', 'withdrawn']
export type ApprovalRow = {
  id: string
  projectId: string
  state: ApprovalState
  requestedBy: string
  requestedAt: string
  proposalSnapshot: string
  decidedBy: string | null
  decidedAt: string | null
  decisionComment: string | null
  /** SHA-256 of the approved material content (src/project/model/approvalBinding.ts), set when approved (H1). */
  approvedHash: string | null
  /** When the approved proposal's material content first differed from the approved snapshot. */
  changedAt: string | null
  supersedes: string | null
}
export interface ApprovalRepo {
  create(a: ApprovalRow): Promise<void>
  get(id: string): Promise<ApprovalRow | null>
  latest(projectId: string): Promise<ApprovalRow | null>
  history(projectId: string): Promise<ApprovalRow[]>
  list(state?: ApprovalState): Promise<ApprovalRow[]>
  /** Records the decision on a pending request (false when it was not pending any more). */
  decide(id: string, state: ApprovalState, by: string, at: string, comment: string, approvedHash: string | null): Promise<boolean>
  /** Moves a request from one state to another (false when its state was not `from`). */
  setState(id: string, from: ApprovalState, to: ApprovalState, at: string | null): Promise<boolean>
}

/** The faculty store (PROJECT_DATA_SCHEMA.md §2; SECURITY_ARCHITECTURE.md §6.1): instructor-only material in its own
 *  table, reachable only with an InstructorContext. No student query joins it (M2 review M5). */
export interface FacultyRepo {
  approvalNote(ic: InstructorContext, approvalId: string): Promise<string | null>
  putApprovalNote(ic: InstructorContext, approvalId: string, note: string, at: string): Promise<void>
}

export type AuditEntry = { at: string; actorUserId: string | null; actorRole: string | null; action: string; targetType?: string; targetId?: string; outcome: 'ok' | 'denied' | 'error'; detail?: Record<string, unknown> }
export interface AuditRepo {
  append(e: AuditEntry): Promise<void>
  list(limit?: number): Promise<(AuditEntry & { seq: number })[]>
}
export interface MetaRepo {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

// --- publishing --- (the content store, server/repo/content.ts)
export type { ContentRepo } from './content'
import type { ContentRepo } from './content'
// --- end publishing ---
// --- m6 --- (the submissions store, server/repo/submissions.ts)
export type { SubmissionRepo } from './submissions'
import type { SubmissionRepo } from './submissions'
// --- end m6 ---
export type Repos = { identity: IdentityRepo; teams: TeamRepo; projects: ProjectRepo; approvals: ApprovalRepo; faculty: FacultyRepo; audit: AuditRepo; meta: MetaRepo; content: ContentRepo /* publishing */; submissions: SubmissionRepo /* m6 */ }

/** The only way services reach the database. `tx` is one serialisable transaction (all or nothing); `read` is a
 *  consistent read. Do CPU-heavy or slow asynchronous work (scrypt, file parsing) BEFORE entering either. */
export interface Store {
  read<T>(fn: (r: Repos) => Promise<T>): Promise<T>
  tx<T>(fn: (r: Repos) => Promise<T>): Promise<T>
  close(): void
}
