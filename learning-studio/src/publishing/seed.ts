// The seed (design §10.1, limited scope): the code-authored content evaluated into publishable bodies. The course server
// writes these as revision r1 PUBLISHED in release REL-0001 at first start (idempotent). The TypeScript modules stay
// the offline / GitHub Pages / static-student-build source and the .pptx source; nothing here edits them.
//   - course.intro.home  ← src/content/homepage.ts (HOMEPAGE, minus its review marker)
//   - course.settings    ← src/content/courseSettings.ts (the department placeholder)
//   - w01.learn.chNN-nn  ← src/week1/learn/textbook.ts: every part resolved to its blocks exactly as model.ts renders
//                          them (sentence cuts applied, slide figures resolved, slide pointers dropped), each block given a
//                          stable id b001, b002 … in source order.
import { COURSE_SETTINGS } from '../content/courseSettings'
import { HOMEPAGE } from '../content/homepage'
import { allSlides } from '../content/lectures/text'
import { CHAPTERS, LESSONS, partBlocks, type Section } from '../week1/learn/textbook'
import { COURSE_INTRO_ID, COURSE_SETTINGS_ID, learnItemId, type AnyBody, type BodyBlock, type CourseIntroBody, type CourseSettingsBody, type ItemKind, type SectionBody } from './types'

export type SeedItem = { id: string; kind: ItemKind; week: number | null; parentId: string | null; title: string; sort: number; body: AnyBody }

export const blockId = (n: number) => `b${String(n).padStart(3, '0')}`
/** Block numbers are 1…99999 (M3 review L2: one regex for ids, numbers and the cap). */
export const MAX_BLOCK_NO = 99999
export const blockNo = (id: string) => (/^b\d{3,5}$/.test(id) ? Number(id.slice(1)) : 0)

/** The publishable body of one Learn section, built from its parts the way model.ts builds the render model. */
export function sectionSeedBody(section: Section): SectionBody {
  const blocks: BodyBlock[] = []
  const next = () => blockId(blocks.length + 1)
  for (const p of section.parts) {
    if (p.kind === 'interactive') {
      blocks.push({ id: next(), kind: 'interactive', ifig: p.id })
      continue
    }
    const slides = p.kind === 'lesson' ? allSlides(LESSONS[p.lesson].lecture) : []
    const resolved = partBlocks(p)
    resolved.forEach((b, k) => {
      let out: BodyBlock | null
      if (b.kind === 'slide-ref') out = null
      else if (b.kind === 'figure') {
        const f = 'slide' in b ? slides.find((s) => s.id === b.slide)?.figure : b.figure
        out = f ? { id: '', kind: 'figure', figure: structuredClone(f) } : null
      } else out = { id: '', ...structuredClone(b) } as BodyBlock
      if (!out) return
      out.id = next()
      if (p.kind === 'reuse' && p.optional) out.optional = true
      if (p.kind === 'reuse' && p.cites && k === resolved.length - 1 && out.kind === 'para') out.cites = structuredClone(p.cites)
      blocks.push(out)
    })
  }
  return { title: section.title, blocks }
}

export function courseIntroSeedBody(): CourseIntroBody {
  const { review: _review, university: _university, ...rest } = HOMEPAGE
  void _review
  void _university
  return structuredClone(rest) as CourseIntroBody
}
export const courseSettingsSeedBody = (): CourseSettingsBody => ({ department_label: COURSE_SETTINGS.department_label, department_label_verified: COURSE_SETTINGS.department_label_verified })

/** Every item of the limited scope with its seed body, in display order. */
export function seedItems(): SeedItem[] {
  const out: SeedItem[] = [
    { id: COURSE_INTRO_ID, kind: 'course-intro', week: null, parentId: null, title: 'Course introduction (homepage)', sort: 0, body: courseIntroSeedBody() },
    { id: COURSE_SETTINGS_ID, kind: 'course-settings', week: null, parentId: null, title: 'Course settings: department label', sort: 1, body: courseSettingsSeedBody() },
  ]
  let sort = 10
  for (const ch of CHAPTERS)
    for (const s of ch.sections) out.push({ id: learnItemId(s.id), kind: 'learn-section', week: 1, parentId: `w01.learn.${ch.id}`, title: s.title, sort: sort++, body: sectionSeedBody(s) })
  return out
}
