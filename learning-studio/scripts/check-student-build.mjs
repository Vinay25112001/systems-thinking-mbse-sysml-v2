// Verifies the student edition (dist-student/) contains no instructor-only exam material: every distinctive
// phrase of every exam bank in src/instructor/exams must be absent from every emitted file. Also proves the
// check can fail by confirming the same phrases ARE present in the instructor build (dist/) when it exists.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const read = (d) => walk(d).map((f) => readFileSync(f, 'utf8')).join('\n')

const examDir = join(app, 'src', 'instructor', 'exams')
const phrases = readdirSync(examDir).flatMap((f) => {
  // strip comments: only text that can reach the bundle counts as a marker
  const text = readFileSync(join(examDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  // distinctive markers: the bank title and each item's leading label ("A1 (5 pts; …").
  return [...text.matchAll(/'([A-C]\d \(\d+ pts;[^']{0,40})/g)].map((m) => m[1]).concat([...text.matchAll(/title: '([^']+)'/g)].map((m) => m[1]))
})
if (phrases.length < 3) throw new Error(`too few exam markers found (${phrases.length}); the check would be meaningless`)

const student = read(join(app, 'dist-student'))
const leaked = phrases.filter((p) => student.includes(p))
if (leaked.length) {
  console.error(`STUDENT BUILD LEAKS ${leaked.length} exam marker(s):\n  ${leaked.join('\n  ')}`)
  process.exit(1)
}
console.log(`student build: none of ${phrases.length} exam markers present`)
if (existsSync(join(app, 'dist'))) {
  const instr = read(join(app, 'dist'))
  const found = phrases.filter((p) => instr.includes(p)).length
  console.log(`instructor build (dist/): ${found} of ${phrases.length} markers present`)
  if (found !== phrases.length) {
    console.error('The instructor build must contain every marker, or the check cannot detect a leak of the missing ones. Rebuild dist/ (npx vite build) and re-run; if still missing, fix the marker extraction.')
    process.exit(1)
  }
}
