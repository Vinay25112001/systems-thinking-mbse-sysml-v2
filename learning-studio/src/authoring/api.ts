// Typed calls of the instructor authoring API (server/services/contentRoutes.ts). The server authorizes every call
// again (instructor role); this module only shapes requests and answers.
import { api } from '../services/backend'
import type { DiffSummary } from '../publishing/diff'
import type { AnyBody, ItemKind, ItemSummary, ReleaseInfo, RevisionMeta, Scope, StudentPayload, Validation } from '../publishing/types'

export type ItemDetail = {
  item: { id: string; kind: ItemKind; title: string; parentId: string | null; sectionId: string | null; codeChanged: boolean }
  revisions: RevisionMeta[]
  draft: { meta: RevisionMeta; body: AnyBody; validation: Validation; stale: boolean } | null
  published: { meta: RevisionMeta; body: AnyBody } | null
  seed: AnyBody
  archived: boolean
}
export type PlanItem = { itemId: string; title: string; kind: ItemKind; from: { revisionId: string; seq: number } | null; to: { revisionId: string; seq: number; state: string }; summary: DiffSummary; validation: Validation; stale: boolean; restoredFromSeq: number | null }
export type Plan = { planToken: string; expiresAt: string; items: PlanItem[]; errors: number; stale: boolean; studentData: string }
export type Release = { id: string; seq: number; publishedAt: string; publishedBy: string; note: string; items: { itemId: string; revisionId: string; action: 'publish' | 'archive' }[] }

const enc = encodeURIComponent
export const listItems = async () => (await api<{ items: ItemSummary[]; release: ReleaseInfo }>('GET', '/authoring/items')).data
export const getItem = async (id: string) => (await api<ItemDetail>('GET', `/authoring/items/${enc(id)}`)).data
export const getRevision = async (id: string, rev: string) => (await api<{ meta: RevisionMeta; body: AnyBody }>('GET', `/authoring/items/${enc(id)}/revisions/${enc(rev)}`)).data
export const saveDraft = async (id: string, body: AnyBody, version: number | null) => (await api<{ draft: RevisionMeta; body: AnyBody; validation: Validation }>('POST', `/authoring/items/${enc(id)}/draft`, { body, version })).data
export const markReady = async (id: string, version: number) => (await api('POST', `/authoring/items/${enc(id)}/draft/ready`, { version })).data
export const returnToDraft = async (id: string) => (await api('POST', `/authoring/items/${enc(id)}/draft/return`, {})).data
export const discardDraft = async (id: string) => (await api('DELETE', `/authoring/items/${enc(id)}/draft`, {})).data
export const restore = async (id: string, revisionId: string) => (await api<{ draftId: string; seq: number; restoredFromSeq: number }>('POST', `/authoring/items/${enc(id)}/restore`, { revisionId })).data
export const archive = async (id: string, note: string) => (await api<{ releaseId: string }>('POST', `/authoring/items/${enc(id)}/archive`, { note })).data
export const plan = async (items: string[]) => (await api<Plan>('POST', '/authoring/publish-plan', { items })).data
export const publish = async (planToken: string, note: string, acknowledgeStale: boolean) => (await api<{ releaseId: string; publishedAt: string }>('POST', '/authoring/releases', { planToken, note, acknowledgeStale })).data
export const releases = async () => (await api<{ releases: Release[] }>('GET', '/authoring/releases')).data.releases
export const preview = async (scope: Scope, itemId: string) => (await api<StudentPayload & { preview: { itemId: string; revisionId: string; seq: number } | null }>('GET', `/authoring/preview/${scope}?item=${enc(itemId)}`)).data
