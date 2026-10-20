// Student edition (`npm run build:student`, Vite mode "student"): faculty notes and other instructor content must not
// ship. This plugin does two things, only in that mode:
//   1. transform: in every lecture source (src/content/lectures/**/session*.ts and the fixture) each slide's `notes`
//      object and its instructor-facing `purpose` string are replaced by empty values before the module is compiled,
//      so the note text never enters the module graph or the bundle (the TypeScript AST is used, not a regex, so the
//      edit is exact whatever the strings contain);
//   2. writeBundle: every PowerPoint deck copied from public/lectures/ into the output has its speaker notes blanked
//      (ppt/notesSlides/*.xml keep their structure; every text run is emptied), so the downloadable deck carries the
//      slides only.
// scripts/check-student-build.mjs then proves both: no notes text in dist-student/ (JavaScript or decks), and the same
// text present in the instructor build dist/.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'
import ts from 'typescript'
import type { Plugin } from 'vite'

export const STUDENT_MODE = 'student'
const LECTURE_SOURCE = /[\\/]src[\\/]content[\\/]lectures[\\/](week\d+[\\/]session\d+|fixture[\\/]demo)\.ts$/
const EMPTY_NOTES = "{ teach: [], why: '', transition: '', timing: '' }"

/** Replaces every `notes: …` and `purpose: …` property value in a lecture source with an empty value. */
export function stripLectureSource(code: string, fileName = 'lecture.ts'): { code: string; notes: number; purposes: number } {
  const sf = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const edits: { start: number; end: number; text: string }[] = []
  let notes = 0
  let purposes = 0
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
      const name = node.name.text
      if (name === 'notes' && ts.isObjectLiteralExpression(node.initializer)) {
        edits.push({ start: node.initializer.getStart(sf), end: node.initializer.getEnd(), text: EMPTY_NOTES })
        notes++
        return
      }
      if (name === 'purpose' && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer) || ts.isTemplateExpression(node.initializer))) {
        edits.push({ start: node.initializer.getStart(sf), end: node.initializer.getEnd(), text: "''" })
        purposes++
        return
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  let out = code
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end)
  return { code: out, notes, purposes }
}

/** Empties every text run of every notes slide in a .pptx (the slides themselves are untouched). */
export async function stripDeckNotes(buf: Buffer): Promise<{ buf: Buffer; slides: number }> {
  const zip = await JSZip.loadAsync(buf)
  const names = Object.keys(zip.files).filter((n) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n))
  for (const name of names) {
    const xml = await zip.file(name)!.async('string')
    zip.file(name, xml.replace(/<a:t>[^<]*<\/a:t>/g, '<a:t></a:t>').replace(/<a:t\/>/g, '<a:t></a:t>'))
  }
  return { buf: await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }), slides: names.length }
}

export function studentEdition(): Plugin {
  let active = false
  let outDir = ''
  return {
    name: 'student-edition',
    enforce: 'pre',
    configResolved(config) {
      active = config.mode === STUDENT_MODE
      outDir = config.build.outDir.startsWith('/') || /^[A-Za-z]:/.test(config.build.outDir) ? config.build.outDir : join(config.root, config.build.outDir)
    },
    transform(code, id) {
      if (!active || !LECTURE_SOURCE.test(id.split('?')[0])) return null
      const r = stripLectureSource(code, id)
      if (r.notes === 0) this.warn(`student edition: no faculty notes found in ${id}`)
      return { code: r.code, map: null }
    },
    async writeBundle() {
      if (!active) return
      const dir = join(outDir, 'lectures')
      if (!existsSync(dir)) return
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.pptx'))) {
        const { buf, slides } = await stripDeckNotes(readFileSync(join(dir, f)))
        writeFileSync(join(dir, f), buf)
        this.info?.(`student edition: blanked the speaker notes of ${slides} slides in lectures/${f}`)
      }
    },
  }
}
