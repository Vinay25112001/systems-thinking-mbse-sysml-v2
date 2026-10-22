// Writes the GENERATED Week 11 SysML v2 files (GENERATED11_FILES in src/workbench/week11/generated.ts) from their single
// source, the lab tool's generator (src/workbench/week11/physical.ts), so the course-designated checker validates
// exactly what the lecture shows and what the lab tool produces:
//   sysml/lectures/week11/aerolink_physical_interfaces_v04.sysml    the AeroLink worked example (week11/aerolinkCase.ts)
//   sysml/lectures/week11/labtool_team07_model_v04.sysml          the lab tool's output for the fixture team
//   sysml/lectures/week11/labtool_stress_model_v04.sysml          an adversarial input set, generated twice
//   sysml/lectures/week11/labtool_collision_model_v04.sysml       the Week 10 collision names with the fixture data
// Then run the checker on the folder (one run at a time):
//   python -I scripts/check_sysml.py sysml/lectures/week11 --report sysml/lectures/week11/week11-report.json
// src/workbench/week11/sysmlWeek11.test.ts fails when a file is stale or the report does not match the files.
// Loads the TypeScript through Vite's SSR loader in middleware mode: no port is opened, no server is left behind.
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(APP, 'sysml', 'lectures', 'week11')
const server = await createServer({ root: APP, configFile: path.join(APP, 'vite.config.ts'), logLevel: 'warn', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } })
let code = 0
try {
  const gen = await server.ssrLoadModule('/src/workbench/week11/generated.ts')
  mkdirSync(OUT, { recursive: true })
  for (const f of gen.GENERATED11_FILES()) {
    writeFileSync(path.join(APP, 'sysml', f.file), f.text, 'utf8')
    console.log(`wrote sysml/${f.file}`)
  }
  // the corrected Week 5 export the Week 11 e2e imports (Week 11 review m6)
  mkdirSync(path.join(APP, 'e2e', 'fixtures'), { recursive: true })
  writeFileSync(path.join(APP, gen.E2E_WEEK5_FILE), gen.FIXTURE_WEEK5_JSON + '\n', 'utf8')
  console.log(`wrote ${gen.E2E_WEEK5_FILE}`)
} catch (e) {
  console.error(`build-week11-sysml failed: ${e instanceof Error ? e.stack : e}`)
  code = 1
} finally {
  await server.close()
}
process.exit(code)
