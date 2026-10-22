// Verifies the student edition (dist-student/) contains no instructor-only material, and proves the check can fail by
// confirming the same markers ARE present in the instructor build (dist/) when it exists. Two kinds of material:
//
//   1. Exam banks (src/instructor/exams): every distinctive phrase of every bank must be absent from every emitted file.
//   2. Lecture faculty notes and slide purposes (src/content/lectures/**/session*.ts): every string inside a slide's
//      `notes` object and every `purpose` string yields a marker (the longest run without escapable characters, 40
//      characters, so that minifier escaping or XML escaping cannot hide it). No marker may appear in the student
//      JavaScript. The student build ships no Week 1 deck (Week 1 lectures are instructor-only, A23; spec NAV-13; review
//      M4A F5; FD-g) and no faculty handout file; the Weeks 2–6 and 8 decks it ships must have empty speaker notes, and
//      every .pptx link the student edition renders must resolve to a shipped deck (FD-g link integrity). In dist/ every
//      marker must appear in the JavaScript, and every deck must carry speaker notes (which proves the deck reader works).
//
// Run by `npm run build:student` after the student build. Build dist/ first (`npm run build`) for the both-directions
// proof; without it, only the student side is checked and the script says so.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import ts from 'typescript'

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const textFiles = (d) => walk(d).filter((f) => !/\.(pptx|png|jpe?g|webp|woff2?|ttf|ico)$/i.test(f))
const read = (d) => textFiles(d).map((f) => readFileSync(f, 'utf8')).join('\n')
let failed = false
const fail = (msg) => {
  console.error(msg)
  failed = true
}

// ------------------------------------------------------------------------------------------- 1. exam banks
const examDir = join(app, 'src', 'instructor', 'exams')
const examPhrases = readdirSync(examDir).flatMap((f) => {
  // strip comments: only text that can reach the bundle counts as a marker
  const text = readFileSync(join(examDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  // distinctive markers: the bank title and each item's leading label ("A1 (5 pts; …").
  return [...text.matchAll(/'([A-C]\d \(\d+ pts;[^']{0,40})/g)].map((m) => m[1]).concat([...text.matchAll(/title: '([^']+)'/g)].map((m) => m[1]))
})
if (examPhrases.length < 3) throw new Error(`too few exam markers found (${examPhrases.length}); the check would be meaningless`)

// ------------------------------------------------------------------------------------------- 2. faculty notes
const lectureFiles = walk(join(app, 'src', 'content', 'lectures')).filter((f) => /[\\/]week\d+[\\/]session\d+\.ts$/.test(f))
/** Splits a lecture file's string literals into instructor text (inside a slide's `notes` object, or a `purpose`)
 *  and public text (everything else: slide faces, the student lesson). */
function lectureStrings(file) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const notes = []
  const pub = []
  const visit = (node, inNotes) => {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === 'notes' && ts.isObjectLiteralExpression(node.initializer)) {
        visit(node.initializer, true)
        return
      }
      if (node.name.text === 'purpose' && ts.isStringLiteral(node.initializer)) {
        notes.push(node.initializer.text)
        return
      }
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) (inNotes ? notes : pub).push(node.text)
    // forEachChild stops at the first truthy return, so the callback must return nothing
    ts.forEachChild(node, (c) => {
      visit(c, inNotes)
    })
  }
  visit(sf, false)
  return { notes, pub }
}
/** The longest run free of characters a bundler or the XML of a deck may escape (quotes, backslash, $, <, >, &) and of
 *  inline markup (*), cut to 40 characters. Other Unicode is kept: the bundle and the decks are UTF-8. */
function marker(s) {
  const runs = s.match(/[^\\'"`$<>&*\n]{40,}/g)
  if (!runs) return null
  const best = runs.sort((a, b) => b.length - a.length)[0].trim()
  return best.length >= 40 ? best.slice(0, 40) : null
}
const split = lectureFiles.map(lectureStrings)
// A marker that also occurs in public text (a teach line that quotes the slide or the lesson, or any other source
// file) would legitimately reach the student build, so it is not a marker of instructor content.
const publicText = [
  ...split.flatMap((x) => x.pub),
  ...walk(join(app, 'src')).filter((f) => /\.(ts|tsx)$/.test(f) && !lectureFiles.includes(f) && !/\.test\.tsx?$/.test(f)).map((f) => readFileSync(f, 'utf8')),
].join(' ')
const noteMarkers = [...new Set(split.flatMap((x) => x.notes.map(marker).filter(Boolean)))].filter((m) => !publicText.includes(m))
if (noteMarkers.length < 50) throw new Error(`too few faculty-notes markers found (${noteMarkers.length} in ${lectureFiles.length} lecture files); the check would be meaningless`)

/** The text of every notes slide of every deck under a directory. */
async function deckNotes(dir) {
  const d = join(dir, 'lectures')
  if (!existsSync(d)) return []
  const decks = []
  for (const f of readdirSync(d).filter((x) => x.endsWith('.pptx'))) {
    const zip = await JSZip.loadAsync(readFileSync(join(d, f)))
    const names = Object.keys(zip.files).filter((n) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n))
    const texts = await Promise.all(names.map(async (n) => [...(await zip.file(n).async('string')).matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join(' ')))
    decks.push({ file: relative(app, join(d, f)), slides: names.length, text: texts.join('\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'") })
  }
  return decks
}

// ------------------------------------------------------------------------------------------- student side
const studentDir = join(app, 'dist-student')
const student = read(studentDir)
const leakedExam = examPhrases.filter((p) => student.includes(p))
if (leakedExam.length) fail(`STUDENT BUILD LEAKS ${leakedExam.length} exam marker(s):\n  ${leakedExam.join('\n  ')}`)
else console.log(`student build: none of ${examPhrases.length} exam markers present`)

const leakedNotes = noteMarkers.filter((p) => student.includes(p))
if (leakedNotes.length) fail(`STUDENT BUILD LEAKS ${leakedNotes.length} faculty-notes marker(s), e.g.:\n  ${leakedNotes.slice(0, 8).join('\n  ')}`)
else console.log(`student build: none of ${noteMarkers.length} faculty-notes markers present in the JavaScript and other text files`)

// (a) Week 1 decks and faculty handout files (review M4A F5, FD-g): none may ship. The pattern covers any Week 1 deck,
// every document format a handout could take, and any non-code file named as a handout, faculty or speaker-notes asset
// (code chunks such as a handout route's JavaScript are covered by the marker scans above). The Weeks 2–6 and 8 decks
// ship (A24) with blanked notes, checked below.
const FACULTY_ASSET = /(^|[\\/])week01-[^\\/]*\.(pptx|ppt|potx|key|odp)$|\.(docx|doc|pdf|md)$|(^|[\\/])[^\\/]*(handout|faculty|speaker-?notes)[^\\/]*\.(?!js$|css$|map$)[a-z0-9]+$/i
const facultyAssets = (dir) => walk(dir).filter((f) => FACULTY_ASSET.test(relative(dir, f))).map((f) => relative(dir, f))
const studentAssets = facultyAssets(studentDir)
if (studentAssets.length) fail(`STUDENT BUILD SHIPS ${studentAssets.length} Week 1 deck or faculty handout file(s):\n  ${studentAssets.join('\n  ')}`)
else console.log('student build: no Week 1 lecture deck and no faculty handout file')
const studentDecks = await deckNotes(studentDir)
for (const d of studentDecks) {
  const words = d.text.replace(/\s+/g, ' ').trim()
  const hits = noteMarkers.filter((p) => d.text.includes(p)).length
  if (words || hits) fail(`STUDENT DECK ${d.file} still has speaker notes (${words.length} characters, ${hits} markers)`)
  else console.log(`student deck ${d.file}: ${d.slides} notes slides, all empty`)
}

// ------------------------------------------------------------------------------------------- 3. My Project (A22, P1-T14)
// The project workspace is student-facing: it must ship in the student build (and in dist/ below). Its markers are
// distinctive strings of the project module that the bundler keeps verbatim.
const projectMarkers = ['sysml-studio-project', 'sysml-studio-projects', 'Now apply this engineering method to your own enterprise.', 'This browser is not saving your project. Export before you close the tab.']
const missingProject = projectMarkers.filter((m) => !student.includes(m))
if (missingProject.length) fail(`STUDENT BUILD LACKS My Project (missing: ${missingProject.join(' | ')})`)
else console.log(`student build: My Project present (${projectMarkers.length} of ${projectMarkers.length} project markers)`)

// ------------------------------------------------------------------------------------------- 4. Week 1 student surfaces (M4 part A, X14)
// --- week1-m4a ---
// (a) Bundle markers that must never ship to students: the instructor toggles and banners (NAV-02), the textbook's
//     faculty placeholder and gap notes (spec §d.10), and the pending-decision objectives line of the earlier week page.
const gapSource = readFileSync(join(app, 'src', 'week1', 'learn', 'gaps.ts'), 'utf8')
const gapNotes = [...gapSource.matchAll(/need: '([^']+)'/g)].map((m) => marker(m[1]) ?? m[1].slice(0, 40))
const W1_MARKERS = {
  // ("Instructor mode" alone also occurs in course text about the setting, so the banner sentence is the marker)
  'instructor toggle': ['Instructor review mode', 'Instructor mode: instructor material is visible', 'Instructor view (interim', 'Show review controls throughout the app'],
  'faculty placeholder': ['Section in preparation (pending verified source)', 'Faculty view only (not in the student edition)', ...gapNotes],
  // (review M4A F7: the earlier second marker, the unrouted B1.6 objective, is tree-shaken from both builds, so it could
  // never be found; the Overview's faculty workload flag that briefly replaced it was removed when faculty accepted the
  // 8.1 h workload, DECISION_LOG A26. The remaining marker is present in the instructor's Week 1 chunk, so the probe is real.)
  'pending-decision text': ['proposed, pending faculty approval'],
}
// --- week1-m4b --- M4 part B filled every gap, so gaps.ts lists none; the two placeholder markers stay (and are probed in
// dist/ below). The minimum applies only while the list is not explicitly empty.
const gapListEmpty = /GAPS_SOURCE: Record<string, Gap> = \{\}/.test(gapSource)
if (!gapListEmpty && gapNotes.length < 10) throw new Error(`too few textbook gap markers (${gapNotes.length}); the check would be meaningless`)
if (gapListEmpty) console.log('student build: textbook gap list is empty (M4b); faculty placeholder markers still checked')
// --- end week1-m4b ---
// Pending-decision wording is checked in the Week 1 student chunks and the homepage (Weeks 2–8 keep their own pages
// until they are rebuilt on the Week 1 template; their objectives lists still show proposed objectives as such).
const w1Student = walk(join(studentDir, 'assets')).filter((f) => /[\\/](Week1App|Homepage)-[^\\/]+\.js$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n')
if (!w1Student.includes('learn-reader')) fail('Week 1 student chunk not found (expected assets/Week1App-*.js); the Week 1 checks would prove nothing')
for (const [kind, list] of Object.entries(W1_MARKERS)) {
  const scope = kind === 'pending-decision text' ? w1Student : student
  const leaked = list.filter((m) => scope.includes(m))
  if (leaked.length) fail(`STUDENT BUILD LEAKS ${leaked.length} ${kind} marker(s):\n  ${leaked.join('\n  ')}`)
  else console.log(`student build: none of ${list.length} ${kind} markers present`)
}
// (b) What students actually read in Learn: the Week 1 textbook model is loaded through Vite in student mode (the same
//     plugins and edition constant as the student build) and every rendered string is scanned for register (R) and
//     source (S) codes, the faculty placeholder and pending-decision wording. A bundle scan cannot do this, because the
//     lesson source keeps its inline codes for the slides and the Weeks 2–8 readers; Learn turns them into footnotes.
{
  const { createServer } = await import('vite')
  const server = await createServer({ root: app, mode: 'student', logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const model = await server.ssrLoadModule('/src/week1/learn/model.ts')
    const book = await server.ssrLoadModule('/src/week1/learn/textbook.ts')
    const cite = await server.ssrLoadModule('/src/week1/learn/studentText.ts')
    const chapters = model.CHAPTER_MODELS()
    const texts = chapters.flatMap((m) => [m.chapter.title, ...m.sections.flatMap((s) => [s.section.title, ...s.blocks.map(model.blockText)]), ...m.notes.map((n) => cite.studentCitation(n.cite))])
    const all = texts.join('\n')
    const codes = [...new Set(all.match(/\bR\d{2,3}[a-z]?\b|\bS\d{2}\b/g) ?? [])]
    if (codes.length) fail(`STUDENT LEARN RENDERS register/source codes: ${codes.slice(0, 12).join(', ')}`)
    else console.log(`student Learn: ${chapters.length} chapters, ${chapters.reduce((a, m) => a + m.sections.length, 0)} sections, ${chapters.reduce((a, m) => a + m.notes.length, 0)} footnotes, no R- or S-codes rendered`)
    const pending = all.match(/instructor to confirm|awaiting faculty|pending faculty|FICTIONAL, proposed|Section in preparation/gi)
    if (pending) fail(`STUDENT LEARN RENDERS pending-decision or placeholder text: ${[...new Set(pending)].join(', ')}`)
    else console.log('student Learn: no pending-decision or placeholder wording rendered')
    if (Object.keys(book.GAPS).length !== 0 || book.GAP_LABEL !== '') fail('STUDENT LEARN carries the faculty gap list (GAPS should be empty in the student edition)')
    else console.log('student Learn: faculty gap list empty in the student edition')
    if (chapters.length !== 11 || all.length < 50000) fail(`STUDENT LEARN looks incomplete (${chapters.length} chapters, ${all.length} characters); the scan would prove nothing`)

    // (c) Every student-visible Week 1 surface as rendered (review M4A F7): each Learn chapter page with its knowledge
    //     checks, common-errors box, reference rail (Definitions here, AeroLink at a glance, Used later, side notes) and
    //     chapter navigation; the back matter (references, glossary, Week 1 in one page); the Week 1 Overview; the
    //     homepage; and the check feedback shown after an answer. Rendered to static markup through Vite in student mode
    //     (src/week1/learn/studentSurfaces.tsx) and scanned with the rules of src/week1/learn/studentScan.ts: register
    //     codes, pending and placeholder wording, slide pointers, rubric codes, stale lesson or session references,
    //     option letters, dangling "below" and the course term "goal(s)" outside quotations (A25).
    //     LEAK_CHECK_MUTATE=surface injects banned strings into one rendered page, to show this scan fails.
    const { JSDOM } = await import('jsdom')
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
    dom.window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    // a browser-like global scope for the pages rendered in a DOM (the project store cannot render on a server)
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    for (const k of Object.getOwnPropertyNames(dom.window)) if (!(k in globalThis)) try { globalThis[k] = dom.window[k] } catch { /* read-only */ }
    globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(Date.now()), 16)
    globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id)
    const surf = await server.ssrLoadModule('/src/week1/learn/studentSurfaces.tsx')
    const scan = await server.ssrLoadModule('/src/week1/learn/studentScan.ts')
    const pages = [...surf.studentSurfaces(), ...(await surf.studentWorkbenchSurfaces())].map((x) => ({ route: x.route, text: surf.visibleText(x.html) }))
    if (process.env.LEAK_CHECK_MUTATE === 'surface') {
      pages[2].text += ' Every need traces to the mission or a goal (slide 9). See the brief below (RB-1.3); in the Session 2 lesson the answer is therefore C, pending faculty approval, R11 p.553.'
      console.log('LEAK_CHECK_MUTATE=surface: injected banned strings into the rendered text of ' + pages[2].route)
    }
    // Learn, the Overview and the homepage: no hit at all. Guided Practice, My Project / Lab and Review & Submit (rebuilt
    // in M5/M6; review N6): within the recorded per-rule ceilings of studentScan.ts DEFERRED_STAGE_HITS.
    const hits = pages.flatMap((pg) => scan.violations(pg.route, pg.text))
    const routes = pages.map((pg) => pg.route)
    const expected = ['/', '/week/1', ...Array.from({ length: 11 }, (_, i) => `/week/1/learn/ch${String(i + 1).padStart(2, '0')}`), '/week/1/learn/refs', '/week/1/learn/glossary', '/week/1/learn/summary', '/week/1/project', '/week/1/project/instructions' /* m6 */, '/week/1/review', 'practice and lab tool: Week 1 mission texts']
    const missing = expected.filter((r) => !routes.includes(r))
    const size = pages.reduce((a, pg) => a + pg.text.length, 0)
    if (missing.length || size < 150000) fail(`STUDENT SURFACE SCAN looks incomplete (missing ${missing.join(', ') || 'none'}; ${size} characters); it would prove nothing`)
    if (hits.length) fail(`STUDENT SURFACES RENDER ${hits.length} banned string(s):\n  ${hits.slice(0, 20).join('\n  ')}`)
    else console.log(`student surfaces: ${pages.length} rendered surfaces (homepage, Overview, 11 chapters, 3 back-matter pages, check feedback, My Project / Lab, Review & Submit, the Week 1 mission texts of Guided Practice and the lab tool; text plus alt/aria-label/title; ${size.toLocaleString('en-US')} characters), ${scan.STUDENT_TEXT_RULES.length + 1} rules, no banned string (M5/M6 stages within their ceilings)`)

    // --- week1-m5: Guided Practice, scanned in full (no ceiling) ---
    //     Every task and step of src/week1/practice, before any answer and with every feedback block showing (seeded
    //     practice), rendered in a DOM in student mode and scanned with every rule of studentScan.ts, "goal" included.
    //     LEAK_CHECK_MUTATE=practice injects an RB code into one practice surface, to show this scan fails.
    {
      const prac = await server.ssrLoadModule('/src/week1/practice/practiceSurfaces.tsx')
      const ppages = (await prac.practiceSurfaces()).map((x) => ({ route: x.route, text: surf.visibleText(x.html) }))
      if (process.env.LEAK_CHECK_MUTATE === 'practice') {
        ppages[0].text += ' Rubric RB-1.3 and a goal.'
        console.log('LEAK_CHECK_MUTATE=practice: injected an RB code and "goal" into ' + ppages[0].route)
      }
      const phits = ppages.flatMap((pg) => scan.scanStudentText(pg.text).map((h) => `${pg.route} [${h.rule}] …${h.context}…`))
      const psize = ppages.reduce((a, pg) => a + pg.text.length, 0)
      if (ppages.length < 28 || psize < 50000) fail(`GUIDED PRACTICE SCAN looks incomplete (${ppages.length} surfaces, ${psize} characters)`)
      else if (phits.length) fail(`GUIDED PRACTICE RENDERS ${phits.length} banned string(s): ${phits.slice(0, 20).join(' | ')}`)
      else console.log(`guided practice: ${ppages.length} rendered surfaces (6 tasks, every step, fresh and with all feedback; ${psize.toLocaleString('en-US')} characters), no banned string, no ceiling`)
    }
    // --- end week1-m5 ---

    // (d) Deck link integrity (FD-g): every .pptx link the student edition renders (dashboard, the Weeks 2–6 and 8 week
    //     pages, every lecture entry card and slide viewer; src/lectures/deckLinks.tsx) resolves to a deck shipped in
    //     dist-student/, and no Week 1 deck is linked. LEAK_CHECK_MUTATE=decklink adds a link to a missing deck.
    const deckMod = await server.ssrLoadModule('/src/lectures/deckLinks.tsx')
    const linkPages = await deckMod.deckLinkPages()
    if (process.env.LEAK_CHECK_MUTATE === 'decklink') {
      linkPages[0].hrefs.push('./lectures/week02-session9.pptx')
      console.log('LEAK_CHECK_MUTATE=decklink: added a link to ./lectures/week02-session9.pptx on the ' + linkPages[0].page)
    }
    const links = linkPages.flatMap((lp) => lp.hrefs.map((h) => ({ page: lp.page, href: h })))
    const broken = links.filter((l) => !existsSync(join(studentDir, l.href.replace(/^\.\//, ''))))
    const week1Links = links.filter((l) => /week01-/.test(l.href))
    if (links.length < 12) fail(`STUDENT DECK LINK CHECK found only ${links.length} .pptx links; the Weeks 2–6 and 8 week pages should carry at least 12, so the check would prove nothing`)
    if (broken.length) fail(`STUDENT EDITION RENDERS ${broken.length} broken deck link(s):\n  ${broken.slice(0, 12).map((l) => `${l.page}: ${l.href}`).join('\n  ')}`)
    if (week1Links.length) fail(`STUDENT EDITION LINKS ${week1Links.length} Week 1 deck(s): ${[...new Set(week1Links.map((l) => l.page))].join(', ')}`)
    if (!broken.length && !week1Links.length) console.log(`student deck links: ${links.length} .pptx links on ${linkPages.filter((lp) => lp.hrefs.length).length} of ${linkPages.length} rendered pages, every one resolves to a shipped deck, none to a Week 1 deck`)
  } finally {
    await server.close()
  }
}
// --- end week1-m4a ---

// ------------------------------------------------------------------------------------------- instructor side (proves the check can fail)
const instrDir = join(app, 'dist')
if (existsSync(instrDir)) {
  const instr = read(instrDir)
  const foundExam = examPhrases.filter((p) => instr.includes(p)).length
  console.log(`instructor build (dist/): ${foundExam} of ${examPhrases.length} exam markers present`)
  if (foundExam !== examPhrases.length)
    fail('The instructor build must contain every exam marker, or the check cannot detect a leak of the missing ones. Rebuild dist/ (npm run build) and re-run; if still missing, fix the marker extraction.')
  const missing = noteMarkers.filter((p) => !instr.includes(p))
  console.log(`instructor build (dist/): ${noteMarkers.length - missing.length} of ${noteMarkers.length} faculty-notes markers present`)
  if (missing.length)
    fail(`The instructor build must contain every faculty-notes marker (missing ${missing.length}, e.g. "${missing[0]}"). Rebuild dist/ (npm run build) from the current sources and re-run; if still missing, fix the marker extraction.`)
  const instrProject = projectMarkers.filter((m) => instr.includes(m)).length
  console.log(`instructor build (dist/): ${instrProject} of ${projectMarkers.length} My Project markers present`)
  if (instrProject !== projectMarkers.length) fail('The instructor build must contain My Project too.')
  // --- week1-m4a --- the Week 1 markers are present in the instructor build, so their absence above means something
  // review M4A F7: every kind has a real positive probe, the pending-decision kind included (its markers are looked
  // for in the instructor's Week 1 chunks, the same scope the student check reads)
  const w1Instr = walk(join(instrDir, 'assets')).filter((f) => /[\\/](Week1App|Homepage)-[^\\/]+\.js$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n')
  for (const [kind, list] of Object.entries(W1_MARKERS)) {
    const probe = list.slice(0, 2)
    const where = kind === 'pending-decision text' ? w1Instr : instr
    const missingW1 = probe.filter((m) => !where.includes(m))
    console.log(`instructor build (dist/): ${probe.length - missingW1.length} of ${probe.length} ${kind} probe markers present`)
    if (missingW1.length) fail(`The instructor build must contain the ${kind} markers (missing: ${missingW1.join(' | ')}), or the Week 1 check cannot detect a leak.`)
  }
  // --- end week1-m4a ---
  const instrDecks = await deckNotes(instrDir)
  for (const d of instrDecks) {
    const hits = noteMarkers.filter((p) => d.text.includes(p)).length
    console.log(`instructor deck ${d.file}: ${d.slides} notes slides, ${d.text.length} characters of notes, ${hits} faculty-notes markers`)
    if (!/TEACH/.test(d.text) || hits === 0) fail(`The instructor deck ${d.file} carries no faculty notes, so the deck check proves nothing.`)
  }
  // the Week 1 deck and handout detector sees the instructor's Week 1 decks, so its silence on dist-student/ means something
  const instrAssets = facultyAssets(instrDir)
  console.log(`instructor build (dist/): ${instrAssets.length} Week 1 deck or handout files detected by the same pattern (expected > 0)`)
  if (instrDecks.length === 0 || instrAssets.length === 0) fail('The instructor build has no Week 1 decks, so the student deck check proves nothing.')
  const expectedStudentDecks = instrDecks.filter((d) => !/week01-/.test(d.file)).length
  if (studentDecks.length !== expectedStudentDecks) fail(`The student build has ${studentDecks.length} decks; expected the ${expectedStudentDecks} non-Week-1 decks of the instructor build.`)
  else console.log(`student build: ${studentDecks.length} of ${instrDecks.length} instructor decks shipped (all but Week 1)`)
} else {
  console.log('dist/ not found: only the student side was checked. Run `npm run build` first for the both-directions proof.')
}

// --- publishing --- (M3) the static student build stays offline-only: no course-server API path, no CSRF header name and
// no publishing/authoring code path (published content reaches students only through the course server). Proven in
// both directions: the same markers are present in the served build (dist/) when it exists.
{
  const PUBLISHING_MARKERS = ['/api/v1', 'X-SLS-CSRF', '/content/weeks/', '/authoring/publish-plan', 'Updated content available']
  const leakedPub = PUBLISHING_MARKERS.filter((m) => student.includes(m))
  if (leakedPub.length) fail(`STUDENT BUILD CONTAINS COURSE-SERVER OR PUBLISHING CODE PATHS: ${leakedPub.join(' | ')}`)
  else console.log(`student build: none of ${PUBLISHING_MARKERS.length} course-server/publishing markers present (offline-only)`)
  if (existsSync(instrDir)) {
    const served = read(instrDir)
    const missingPub = PUBLISHING_MARKERS.filter((m) => !served.includes(m))
    if (missingPub.length) fail(`The served build (dist/) must contain the publishing markers (missing: ${missingPub.join(' | ')}), or the offline-only check proves nothing.`)
    else console.log(`instructor build (dist/): ${PUBLISHING_MARKERS.length} of ${PUBLISHING_MARKERS.length} course-server/publishing markers present`)
  }
}
// --- end publishing ---

if (failed) process.exit(1)
console.log('student build check: PASS')
