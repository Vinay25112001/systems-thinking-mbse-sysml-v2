// Writes the laboratory instructions from their single sources (each Laboratory page renders the same module):
//   docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md from src/content/lab/week01Lab.ts
//   docs/lectures/week02/WEEK2_LAB_INSTRUCTIONS.md from src/content/lab/week02Lab.ts
//   docs/lectures/week03/WEEK3_LAB_INSTRUCTIONS.md from src/content/lab/week03Lab.ts
//   docs/lectures/week04/WEEK4_LAB_INSTRUCTIONS.md from src/content/lab/week04Lab.ts
//   docs/lectures/week05/WEEK5_LAB_INSTRUCTIONS.md from src/content/lab/week05Lab.ts
// Loads the TypeScript sources through Vite's SSR loader in middleware mode: no port is opened and no server is left
// behind. Each week is written independently, so one failing module never blocks the other. Optional arguments select
// the weeks (`node scripts/build-lab-md.mjs 2`); with none, every week is written. week1.test.tsx and
// src/content/lab/week02Lab.test.ts fail if a file is stale.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LABS = [
  { week: 1, module: '/src/content/lab/week01Lab.ts', out: path.join(APP, 'docs', 'lectures', 'week01', 'WEEK1_LAB_INSTRUCTIONS.md') },
  { week: 2, module: '/src/content/lab/week02Lab.ts', out: path.join(APP, 'docs', 'lectures', 'week02', 'WEEK2_LAB_INSTRUCTIONS.md') },
  { week: 3, module: '/src/content/lab/week03Lab.ts', out: path.join(APP, 'docs', 'lectures', 'week03', 'WEEK3_LAB_INSTRUCTIONS.md') },
  { week: 4, module: '/src/content/lab/week04Lab.ts', out: path.join(APP, 'docs', 'lectures', 'week04', 'WEEK4_LAB_INSTRUCTIONS.md') },
  { week: 5, module: '/src/content/lab/week05Lab.ts', out: path.join(APP, 'docs', 'lectures', 'week05', 'WEEK5_LAB_INSTRUCTIONS.md') },
  { week: 8, module: '/src/content/lab/week08Lab.ts', out: path.join(APP, 'docs', 'lectures', 'week08', 'WEEK8_LAB_INSTRUCTIONS.md') },
]
const wanted = process.argv.slice(2).map(Number).filter(Boolean)
const server = await createServer({ root: APP, configFile: path.join(APP, 'vite.config.ts'), logLevel: 'warn', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } })
let code = 0
try {
  for (const lab of LABS.filter((l) => !wanted.length || wanted.includes(l.week))) {
    try {
      const mod = await server.ssrLoadModule(lab.module)
      mkdirSync(path.dirname(lab.out), { recursive: true })
      writeFileSync(lab.out, mod.labMarkdown(), 'utf8')
      console.log(`wrote ${path.relative(APP, lab.out)}`)
    } catch (e) {
      console.error(`lab:md failed for week ${lab.week}: ${e instanceof Error ? e.message : e}`)
      code = 1
    }
  }
} finally {
  await server.close()
}
process.exit(code)
