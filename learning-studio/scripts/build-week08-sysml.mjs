// Writes the GENERATED Week 8 SysML v2 files (GENERATED_FILES in src/workbench/week8/generated.ts) from their single source, the lab tool's generator
// (src/workbench/week8/skeleton.ts), so the course-designated checker validates exactly what the lecture shows and what
// the lab tool produces:
//   sysml/lectures/week08/aerolink_context_stakeholders_v01.sysml  the AeroLink worked example (week08/aerolinkCase.ts)
//   sysml/lectures/week08/labtool_team07_model_v01.sysml            the lab tool's output for the fixture team record
//   sysml/lectures/week08/labtool_stress_model_v01.sysml            an adversarial team record (escaping, shadowing)
//   sysml/lectures/week08/labtool_collision_model_v01.sysml         register names that collide (renamed, reported)
// Then run the checker on the folder (one run at a time):
//   python -I scripts/check_sysml.py sysml/lectures/week08 --report sysml/lectures/week08/week08-report.json
// src/workbench/week8/sysmlWeek08.test.ts fails when a file is stale or the report does not match the files.
// Loads the TypeScript through Vite's SSR loader in middleware mode: no port is opened, no server is left behind.
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(APP, 'sysml', 'lectures', 'week08')
const server = await createServer({ root: APP, configFile: path.join(APP, 'vite.config.ts'), logLevel: 'warn', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } })
let code = 0
try {
  const gen = await server.ssrLoadModule('/src/workbench/week8/generated.ts')
  mkdirSync(OUT, { recursive: true })
  for (const f of gen.GENERATED_FILES()) {
    writeFileSync(path.join(APP, 'sysml', f.file), f.text, 'utf8')
    console.log(`wrote sysml/${f.file}`)
  }
} catch (e) {
  console.error(`build-week08-sysml failed: ${e instanceof Error ? e.stack : e}`)
  code = 1
} finally {
  await server.close()
}
process.exit(code)
