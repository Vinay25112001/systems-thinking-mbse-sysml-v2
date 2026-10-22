// Writes the GENERATED Week 9 SysML v2 files (GENERATED9_FILES in src/workbench/week9/generated.ts) from their single
// source, the lab tool's generator (src/workbench/week9/requirements.ts), so the course-designated checker validates
// exactly what the lecture shows and what the lab tool produces:
//   sysml/lectures/week09/aerolink_needs_requirements_v02.sysml   the AeroLink worked example (week09/aerolinkCase.ts)
//   sysml/lectures/week09/labtool_team07_model_v02.sysml          the lab tool's output for the fixture team
//   sysml/lectures/week09/labtool_stress_model_v02.sysml          an adversarial input set, generated twice
//   sysml/lectures/week09/labtool_collision_model_v02.sysml       the Week 8 collision names with the fixture data
// Then run the checker on the folder (one run at a time):
//   python -I scripts/check_sysml.py sysml/lectures/week09 --report sysml/lectures/week09/week09-report.json
// src/workbench/week9/sysmlWeek09.test.ts fails when a file is stale or the report does not match the files.
// Loads the TypeScript through Vite's SSR loader in middleware mode: no port is opened, no server is left behind.
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(APP, 'sysml', 'lectures', 'week09')
const server = await createServer({ root: APP, configFile: path.join(APP, 'vite.config.ts'), logLevel: 'warn', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } })
let code = 0
try {
  const gen = await server.ssrLoadModule('/src/workbench/week9/generated.ts')
  mkdirSync(OUT, { recursive: true })
  for (const f of gen.GENERATED9_FILES()) {
    writeFileSync(path.join(APP, 'sysml', f.file), f.text, 'utf8')
    console.log(`wrote sysml/${f.file}`)
  }
} catch (e) {
  console.error(`build-week09-sysml failed: ${e instanceof Error ? e.stack : e}`)
  code = 1
} finally {
  await server.close()
}
process.exit(code)
