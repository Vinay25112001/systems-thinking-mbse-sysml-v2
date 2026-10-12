import { describe, expect, it } from 'vitest'
import { SYSML_REPORT, SYSML_SOURCES, reportEntry, sha256Hex as sha, toolLabel } from './sysml'
import { WEEK_CONTENT } from '../content/weeks'

describe('SysML validation record', () => {
  it('names the tool in plain text', () => {
    expect(toolLabel()).toMatch(/Pilot Implementation release 2026-08/)
  })

  it('every listing shown in a lesson was validated in exactly its current text, with the expected outcome', async () => {
    const listings = Object.values(WEEK_CONTENT).flatMap((c) => c.blocks.flatMap((b) => b.sysml ?? []))
    expect(SYSML_REPORT).not.toBeNull()
    for (const l of listings) {
      const e = reportEntry(l.file)
      expect(e, `${l.file} missing from validation-report.json: run npm run content:sysml`).toBeDefined()
      expect(e!.sha256, `${l.file} changed since validation: run npm run content:sysml`).toBe(await sha(SYSML_SOURCES[l.file]))
      expect(e!.status, l.file).toBe(l.intent === 'conformant' ? 'PASS' : 'FAIL')
    }
  })

  it('mutation: a one-character change to a listing no longer matches its record', async () => {
    const [file, text] = Object.entries(SYSML_SOURCES).find(([f]) => reportEntry(f))!
    expect(await sha(text + ' ')).not.toBe(reportEntry(file)!.sha256)
  })
})

describe('instructor-only listings', () => {
  it('nothing under sysml/instructor/ is bundled into the app', () => {
    expect(Object.keys(SYSML_SOURCES).filter((f) => f.startsWith('instructor/'))).toEqual([])
    expect(Object.keys(SYSML_SOURCES).length).toBeGreaterThan(10) // the glob still finds the public listings
  })
})
