// Week 1 routes, kept out of the lazy page chunk so App can route without loading it. Milestone M4 part A
// (DECISION_LOG A23–A25; docs/week1/spec/WEEK1_DESIGN_SPECIFICATION.md §b.2, NAV-10…NAV-12): the student path is
//   /week/1                         Overview
//   /week/1/learn[/:chapter]        Learn, the Week 1 digital textbook (chapter ch01…ch11, refs, glossary, summary);
//                                   a section is the fragment: /week/1/learn/ch06#ch06-03
//   /week/1/practice[/:task]        Guided Practice (M5): tasks gp-1…gp-6 on AeroLink, own practice store
//   /week/1/project[/:part]         My Project / Lab (M6): the Week 1 canvas; part = team, enterprise, boundary,
//                                   stakeholders, concerns, relationships, needs, assumptions, week8
//   /week/1/project/instructions    the Lab L1 instructions (moved off the canvas into their own page, MP-26)
//   /week/1/project/tool            the earlier lab tool (Team enterprise view): instructor edition only since M6; the
//                                   student edition redirects to the canvas (the source is kept)
//   /week/1/review                  Review & Submit (M6: package review, states, submission snapshot, faculty feedback)
// Earlier routes redirect (no 404). The lecture viewer, handout and .pptx stay reachable for the instructor only
// (interim gate until M2 auth: the instructor edition with instructor mode on; see week1LectureGate).
export type Week1Page = 'overview' | 'learn' | 'learn-from-slide' | 'practice' | 'project' | 'project-instructions' | 'project-tool' | 'review'

export type Week1Route = { page: Week1Page; chapter?: string; section?: string; session?: number; slide?: number; task?: string; part?: string } | { redirect: string }
// --- m6 ---
/** The canvas parts that have their own URL (src/project/canvas/Canvas.tsx CANVAS_PARTS). */
export const PROJECT_PART_IDS = ['team', 'enterprise', 'boundary', 'stakeholders', 'concerns', 'relationships', 'needs', 'assumptions', 'week8'] as const
// --- end m6 ---

export const WEEK1_PATHS = {
  overview: '/week/1',
  learn: '/week/1/learn',
  practice: '/week/1/practice',
  project: '/week/1/project',
  'project-tool': '/week/1/project/tool',
  review: '/week/1/review',
  // earlier keys kept so existing links (Dashboard, Lab, Assessment, workbench links) land on the new stage directly
  home: '/week/1',
  examples: '/week/1/learn/ch06#ch06-07',
  lab: '/week/1/project',
  'lab-tool': '/week/1/project/tool',
  assessment: '/week/1/review',
} as const

/** Chapter route ids, in reading order, and the back matter. */
export const CHAPTER_IDS = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08', 'ch09', 'ch10', 'ch11'] as const
export const BACK_MATTER_IDS = ['refs', 'glossary', 'summary'] as const

export const learnPath = (chapter?: string, section?: string) => `/week/1/learn${chapter ? `/${chapter}` : ''}${section ? `#${section}` : ''}`

/** The earlier self-study Learn sections (l1…l7) and the lesson section that taught each (kept: quiz and test links). */
export const LEARN_TO_LESSON: Record<string, string> = {
  l1: 's1-lesson-teams',
  l2: 's1-lesson-soi',
  l3: 's1-lesson-boundary',
  l4: 's1-lesson-stakeholders',
  l5: 's1-lesson-classifying',
  l6: 's2-l-needs-reqs',
  l7: 's2-l-well-formed',
}

/** Legacy lesson section ids (session1.ts / session2.ts studentLesson) → the textbook section that now opens with
 *  their text (spec §d.1 alias table). learn/learn.test.tsx proves every target section exists and absorbs the lesson. */
export const LEGACY_TO_SECTION: Record<string, string> = {
  's1-lesson-why': 'ch01-01',
  's1-lesson-system': 'ch02-02',
  's1-lesson-soi': 'ch02-06',
  's1-lesson-boundary': 'ch04-01',
  's1-lesson-lifecycle': 'ch05-01',
  's1-lesson-teams': 'ch11-01',
  's1-lesson-stakeholders': 'ch06-01',
  's1-lesson-classifying': 'ch06-05',
  's2-l-concerns': 'ch07-01',
  's2-l-needs-reqs': 'ch09-01',
  's2-l-integrated-set': 'ch09-03',
  's2-l-well-formed': 'ch09-04',
  's2-l-elicitation': 'ch08-01',
  's2-l-conflict': 'ch09-06',
  's2-l-errors': 'ch09-08',
  's2-l-case-register': 'ch06-07',
  's2-l-case-needs': 'ch09-07',
  's2-l-case-audit': 'ch10-03',
  's2-l-why-methods': 'ch10-04',
  's2-l-bridge': 'ch10-05',
  's2-l-lab': 'ch11-05',
  's2-l-references': 'refs',
}

/** Any identifier that once named Week 1 reading content → the URL of the textbook location (spec §d.1). */
export function resolveLearnAlias(raw: string): string | null {
  const id = raw.replace(/^w01\.(lesson|learn)\./, '').replace(/^w1-/, '')
  if ((CHAPTER_IDS as readonly string[]).includes(id) || (BACK_MATTER_IDS as readonly string[]).includes(id)) return learnPath(id)
  const sec = id.match(/^(ch\d\d)-\d\d$/)
  if (sec && (CHAPTER_IDS as readonly string[]).includes(sec[1])) return learnPath(sec[1], id)
  const lesson = LEARN_TO_LESSON[id] ?? id
  const target = LEGACY_TO_SECTION[lesson]
  if (target) return target === 'refs' ? learnPath('refs') : learnPath(target.slice(0, 4), target)
  return null
}

export function week1Route(path: string): Week1Route | null {
  const [raw, frag] = path.split('#')
  const p = raw.replace(/\/+$/, '')
  if (p === '/week/1') return { page: 'overview' }
  if (p === WEEK1_PATHS.practice) return { page: 'practice' }
  const gp = p.match(/^\/week\/1\/practice\/(gp-[1-6])$/)
  if (gp) return { page: 'practice', task: gp[1] }
  if (p.startsWith(`${WEEK1_PATHS.practice}/`)) return { redirect: WEEK1_PATHS.practice }
  if (p === WEEK1_PATHS.project) return { page: 'project' }
  if (p === WEEK1_PATHS['project-tool']) return { page: 'project-tool' }
  // --- m6 ---
  if (p === `${WEEK1_PATHS.project}/instructions`) return { page: 'project-instructions' }
  const part = p.match(/^\/week\/1\/project\/([a-z0-9]+)$/)
  if (part && (PROJECT_PART_IDS as readonly string[]).includes(part[1])) return { page: 'project', part: part[1] }
  // --- end m6 ---
  if (p === WEEK1_PATHS.review) return { page: 'review' }
  if (p === WEEK1_PATHS.learn) return { page: 'learn' }
  // earlier routes → their equivalents
  if (p === '/week/1/overview' || p === '/week/1/classic') return { redirect: WEEK1_PATHS.overview }
  if (p === '/week/1/examples') return { redirect: learnPath('ch06', 'ch06-07') }
  if (p === '/week/1/examples/practice') return { redirect: WEEK1_PATHS.practice }
  if (p === '/week/1/lab') return { redirect: WEEK1_PATHS.project }
  if (p === '/week/1/lab/tool') return { redirect: WEEK1_PATHS['project-tool'] }
  if (p === '/week/1/assessment' || p === '/week/1/check') return { redirect: WEEK1_PATHS.review }
  if (p === '/week/1/lesson') return { redirect: WEEK1_PATHS.learn }
  const lesson = p.match(/^\/week\/1\/lesson\/([a-z0-9.-]+)$/)
  if (lesson) return { redirect: resolveLearnAlias(lesson[1]) ?? WEEK1_PATHS.learn }
  const fromSlide = p.match(/^\/week\/1\/learn\/from-slide\/(\d)(?:\/(\d+))?$/)
  if (fromSlide) return { page: 'learn-from-slide', session: parseInt(fromSlide[1], 10), slide: fromSlide[2] ? parseInt(fromSlide[2], 10) : undefined }
  const learn = p.match(/^\/week\/1\/learn\/([a-z0-9.-]+)$/)
  if (learn) {
    const id = learn[1]
    if ((CHAPTER_IDS as readonly string[]).includes(id) || (BACK_MATTER_IDS as readonly string[]).includes(id)) return { page: 'learn', chapter: id, ...(frag ? { section: frag } : {}) }
    return { redirect: resolveLearnAlias(id) ?? WEEK1_PATHS.learn }
  }
  return null
}

/** Interim instructor gate for the Week 1 lecture viewer, handout and reader (spec NAV-12, NAV-21): until M2 brings
 *  server roles, only the instructor edition with instructor mode on may open them. Everyone else is sent to the Learn
 *  chapter that teaches the slide. Returns the redirect target, or null when the lecture route may render. */
export function week1LectureGate(path: string, instructorAllowed: boolean): string | null {
  const p = path.split('#')[0].replace(/\/+$/, '')
  const m = p.match(/^\/week\/1\/lecture\/(\d)(?:\/(\d+|handout))?$/)
  if (!m) return null
  if (instructorAllowed) return null
  return m[2] && m[2] !== 'handout' ? `/week/1/learn/from-slide/${m[1]}/${m[2]}` : `/week/1/learn/from-slide/${m[1]}`
}

export type Week1NavItem = { id: 'overview' | 'learn' | 'practice' | 'project' | 'review'; label: string; short: string; sub: string; to: string; identity: 'course' | 'example' | 'project'; match: (p: string) => boolean }

/** The Week 1 stage bar, in path order (spec §b.2). `match` decides the current stage from the path. */
export const WEEK1_NAV: Week1NavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', sub: 'Start here', to: WEEK1_PATHS.overview, identity: 'course', match: (p) => p === '/week/1' },
  { id: 'learn', label: 'Learn', short: 'Learn', sub: 'Textbook, 11 chapters', to: WEEK1_PATHS.learn, identity: 'course', match: (p) => p.startsWith('/week/1/learn') },
  { id: 'practice', label: 'Guided Practice', short: 'Practice', sub: 'AeroLink, the instructor example', to: WEEK1_PATHS.practice, identity: 'example', match: (p) => p.startsWith('/week/1/practice') },
  { id: 'project', label: 'My Project / Lab', short: 'Project', sub: 'Your enterprise', to: WEEK1_PATHS.project, identity: 'project', match: (p) => p.startsWith('/week/1/project') },
  { id: 'review', label: 'Review & Submit', short: 'Review', sub: 'Check and submit', to: WEEK1_PATHS.review, identity: 'course', match: (p) => p.startsWith('/week/1/review') },
]
