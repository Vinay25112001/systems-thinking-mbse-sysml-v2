// Lecture routes (kept out of the lazy lecture chunk so App can route without loading it):
//   /week/:n/lecture/:session[/:slide]   web slide viewer (slide is 1-based)
//   /week/:n/lecture/:session/handout    print-friendly handout of every slide
//   /week/:n/lesson[/:section]           single-column student reader
//   /figure/:id                          one registered figure on a clean 1600×900 canvas (PNG capture for the .pptx)
export type LectureRoute =
  | { kind: 'viewer'; week: number; session: number; slide?: number }
  | { kind: 'handout'; week: number; session: number }
  | { kind: 'lesson'; week: number; section?: string }
  | { kind: 'figure'; id: string }

export function lectureRoute(path: string): LectureRoute | null {
  const p = path.replace(/\/+$/, '')
  let m = p.match(/^\/week\/(\d+)\/lecture\/(\d+)(?:\/(\d+|handout))?$/)
  if (m) {
    const week = parseInt(m[1], 10)
    const session = parseInt(m[2], 10)
    if (m[3] === 'handout') return { kind: 'handout', week, session }
    return { kind: 'viewer', week, session, slide: m[3] ? parseInt(m[3], 10) : undefined }
  }
  m = p.match(/^\/week\/(\d+)\/lesson(?:\/([a-z0-9-]+))?$/)
  if (m) return { kind: 'lesson', week: parseInt(m[1], 10), section: m[2] }
  m = p.match(/^\/figure\/([a-z0-9-]+)$/)
  if (m) return { kind: 'figure', id: m[1] }
  return null
}

export const viewerPath = (week: number, session: number, slide?: number) => `/week/${week}/lecture/${session}${slide ? `/${slide}` : ''}`
export const handoutPath = (week: number, session: number) => `/week/${week}/lecture/${session}/handout`
export const lessonPath = (week: number, section?: string) => `/week/${week}/lesson${section ? `/${section}` : ''}`
/** Where the generated deck is served from (scripts/build-lectures.mjs copies it into public/lectures/). */
export const pptxHref = (stem: string) => `./lectures/${stem}.pptx`

/** Weeks with a lecture-first week page (Week 1, and Weeks 2, 3, 4, 5 and 8 on the same template). */
export const WEEK_PAGES = new Set([1, 2, 3, 4, 5, 8])
/** Where a lecture page leads back to: the week page when the week has one, else the dashboard. */
export const backOf = (week: number) => (WEEK_PAGES.has(week) ? { back: `/week/${week}`, backLabel: `Week ${week}` } : { back: '/', backLabel: 'Dashboard' })
