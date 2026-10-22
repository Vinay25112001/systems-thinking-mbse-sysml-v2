// Content publishing (M3, limited scope per DECISION_LOG A24; design CONTENT_PUBLISHING_DESIGN.md). Shared by the course
// server (store, lifecycle, validation at mark-ready and publish) and the browser (instructor editor, student overlay).
// Pure types: no React, no server code. The bodies are the EVALUATED, serialised form of the code-authored content
// (design §1: content is code, so publishing operates on its evaluated form, never on TypeScript text).
import type { FigureRef, LessonBlock } from '../content/lectures/types'
import type { Citation } from '../content/readings'

export type ContentState = 'draft' | 'ready-for-review' | 'published' | 'superseded' | 'archived'
export const CONTENT_STATES: readonly ContentState[] = ['draft', 'ready-for-review', 'published', 'superseded', 'archived']

/** The item kinds in the limited scope: the course introduction (homepage text), the course settings (department
 *  placeholder) and the Week 1 Learn sections. Slides, faculty notes, lab and assessments stay code-authored (A24). */
export type ItemKind = 'course-intro' | 'course-settings' | 'learn-section'
export type Scope = 'course' | 'week1'
export const scopeOfKind = (k: ItemKind): Scope => (k === 'learn-section' ? 'week1' : 'course')

export const COURSE_INTRO_ID = 'course.intro.home'
export const COURSE_SETTINGS_ID = 'course.settings'
export const LEARN_PREFIX = 'w01.learn.'
export const learnItemId = (sectionId: string) => `${LEARN_PREFIX}${sectionId}`
export const sectionIdOf = (itemId: string) => (itemId.startsWith(LEARN_PREFIX) ? itemId.slice(LEARN_PREFIX.length) : null)
/** Stable content ids accepted by the store (design §3 / spec §d.1). */
export const ITEM_ID_RE = /^(?:course\.intro\.home|course\.settings|w01\.learn\.ch\d\d-\d\d)$/

// ------------------------------------------------------------------------------------------- Learn section body
/** A block of a Learn section with its stable block id (`b001`…, design §3: assigned in source order at seed; a new
 *  block takes the next number; a deleted id is never reissued). `cites` are footnotes attached after a reused
 *  paragraph; `optional` marks extension reading. Both are read-only in the limited editor. */
export type BodyBlock = { id: string; optional?: true; cites?: Citation[] } & (
  | Exclude<LessonBlock, { kind: 'figure' } | { kind: 'slide-ref' }>
  | { kind: 'figure'; figure: FigureRef }
  | { kind: 'interactive'; ifig: 'IF-1' | 'IF-6' | 'IF-7' }
)
export type SectionBody = { title: string; blocks: BodyBlock[] }

/** Blocks whose text the limited editor may change. Everything else (definitions, tables, equations, worked steps,
 *  figures, interactive figures) is read-only and must stay identical to the seed revision. */
export const EDITABLE_BLOCK_KINDS = ['para', 'heading', 'bullets', 'callout'] as const
/** The only block kind an instructor may add or delete. */
export const ADDABLE_BLOCK_KIND = 'para'

// ------------------------------------------------------------------------------------------- course introduction
export type IntroPara = { text: string; label?: 'course framing'; cite?: Citation; quote?: { text: string; cite: Citation; attribution: string } }
export type CourseIntroBody = {
  title: string
  lede: string
  what: IntroPara[]
  phases: IntroPara[]
  aerolink: string[]
  enterprise: string[]
  submit: { what: string; detail: string }[]
  submitNote: string
  stages: { id: string; label: string; identity: 'course' | 'example' | 'project'; line: string }[]
  savedStatic: string
  start: string
}
export type CourseSettingsBody = { department_label: string; department_label_verified: boolean }

export type BodyOf<K extends ItemKind> = K extends 'learn-section' ? SectionBody : K extends 'course-intro' ? CourseIntroBody : CourseSettingsBody
export type AnyBody = SectionBody | CourseIntroBody | CourseSettingsBody

// ------------------------------------------------------------------------------------------- wire shapes
/** What students receive (GET content/course, content/weeks/1): published bodies only, from student-visible tables. */
export type PublishedItem = { revisionId: string; seq: number; publishedAt: string; body: AnyBody }
export type StudentPayload = { releaseId: string; scope: Scope; items: Record<string, PublishedItem>; withdrawn: string[] }
export type ReleaseInfo = { releaseId: string; publishedAt: string }

export type Issue = { severity: 'error' | 'warning'; rule: string; where: string; message: string }
export type Validation = { errors: Issue[]; warnings: Issue[] }

export type RevisionMeta = {
  id: string
  itemId: string
  seq: number
  state: ContentState
  bodySha256: string
  baseRevisionId: string | null
  restoredFrom: string | null
  restoredFromSeq: number | null
  author: string
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  submittedBy: string | null
  publishedAt: string | null
  publishedBy: string | null
  releaseId: string | null
  supersededAt: string | null
  archivedAt: string | null
  archivedBy: string | null
  changeNote: string
  version: number
}
export type ItemSummary = {
  id: string
  kind: ItemKind
  title: string
  parentId: string | null
  sort: number
  published: { id: string; seq: number; publishedAt: string } | null
  draft: { id: string; seq: number; state: 'draft' | 'ready-for-review'; author: string; updatedAt: string } | null
  archived: boolean
  /** The code module no longer equals the seed revision r1 (a developer edited the TypeScript after seeding). */
  codeChanged: boolean
}
