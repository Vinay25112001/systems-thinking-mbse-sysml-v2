// Verifies the student edition (dist-student/) contains no instructor-only material, and proves the check can fail by
// confirming the same markers ARE present in the instructor build (dist/) when it exists. Two kinds of material:
//
//   1. Exam banks (src/instructor/exams): every distinctive phrase of every bank must be absent from every emitted file.
//   2. Lecture faculty notes and slide purposes (src/content/lectures/**/session*.ts): every string inside a slide's
//      `notes` object and every `purpose` string yields a marker (the longest run without escapable characters, 40
//      characters, so that minifier escaping or XML escaping cannot hide it). No marker may appear in the student JavaScript, and the
//      student decks (dist-student/lectures/*.pptx) must have empty speaker notes. In dist/ every marker must appear
//      in the JavaScript, and every deck must carry speaker notes.
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
  const instrDecks = await deckNotes(instrDir)
  for (const d of instrDecks) {
    const hits = noteMarkers.filter((p) => d.text.includes(p)).length
    console.log(`instructor deck ${d.file}: ${d.slides} notes slides, ${d.text.length} characters of notes, ${hits} faculty-notes markers`)
    if (!/TEACH/.test(d.text) || hits === 0) fail(`The instructor deck ${d.file} carries no faculty notes, so the deck check proves nothing.`)
  }
  if (studentDecks.length !== instrDecks.length) fail(`The student build has ${studentDecks.length} decks and the instructor build ${instrDecks.length}.`)
} else {
  console.log('dist/ not found: only the student side was checked. Run `npm run build` first for the both-directions proof.')
}

if (failed) process.exit(1)
console.log('student build check: PASS')
