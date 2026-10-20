// The Week 8 install-and-run guide: its recorded outputs are the checker report's, formatted exactly as
// scripts/check_sysml.py prints them; the downloads are the course's own files; every step gives commands for all three
// systems and they agree with the folder layout the script expects; the checksums are the published ones; the guide
// states who must install and that a PASS is not meaning. Each check is shown able to fail.
import { describe, expect, it } from 'vitest'
import checkerPy from '../../../scripts/check_sysml.py?raw'
import launcherJava from '../../../scripts/sysml-launcher/SysMLBatchCheck.java?raw'
import toolchainMd from '../../../docs/SYSML_TOOLCHAIN.md?raw'
import labMd from '../../../docs/lectures/week08/WEEK8_LAB_INSTRUCTIONS.md?raw'
import { CHECKER_WHAT, CHECKER_WHO, DOWNLOADS, JDK_SHA256, JDK_WINDOWS_SHA256, KERNEL_FILES, KERNEL_SHA256, LAYOUT, OS_LABEL, PROOF_OUTPUT, STEPS, TROUBLESHOOTING, checkerMarkdown, recordedRun, resultLines, type OsKey } from './week08Checker'
import { sysmlSource } from '../../lib/sysml'

const OSES = Object.keys(OS_LABEL) as OsKey[]

describe('Week 8 checker guide', () => {
  it('prints results in the format of check_sysml.py print_results (status padded to 5, two spaces, path; diagnostics indented 9, severity padded to 7, location padded to 8)', () => {
    expect(checkerPy).toContain('label = f"{e[\'status\']:<5} (expected {e[\'expected\']}: {\'OK\' if ok else \'MISMATCH\'})"')
    expect(checkerPy).toContain('print(f"{label:<5}  {e[\'file\']}")')
    expect(checkerPy).toContain('print(f"         {d[\'severity\']:<7} {loc:<8} {d[\'message\']}")')
    expect(checkerPy).toContain('{s[\'files\']} file(s): {s[\'PASS\']} PASS, {s[\'FAIL\']} FAIL, {s[\'ERROR\']} ERROR. Report: ')
    expect(resultLines('tool_proof_pass.sysml', 'models/tool_proof_pass.sysml')).toEqual(['PASS  (expected PASS: OK)  models/tool_proof_pass.sysml'])
    expect(resultLines('invalid_tool_proof_unquoted_id.sysml', 'models/x.sysml')).toEqual([
      'FAIL  (expected FAIL: OK)  models/x.sysml',
      "         ERROR   9:12     mismatched input '-' expecting '>'",
      "         ERROR   9:18     no viable alternative at input 'roadNetwork'",
    ])
  })
  it('the recorded tool proof is the report’s: PASS with no message, then FAIL at 9:12, and the summary counts', () => {
    expect(PROOF_OUTPUT[0]).toMatch(/^OMG SysML v2 Pilot Implementation .* release 2026-08 \(kernel 0\.62\.0\), Java 21\.0\.12\.1\+1-LTS, library load … s$/)
    expect(PROOF_OUTPUT.at(-1)).toBe('2 file(s): 1 PASS, 1 FAIL, 0 ERROR. Report: models/proof-report.json')
    expect(PROOF_OUTPUT.filter((l) => /^(PASS|FAIL) /.test(l))).toHaveLength(2)
    expect(() => recordedRun(['no_such_file.sysml'])).toThrow(/not in the Week 8 checker report/)
  })
  it('the downloads are the course’s own script, launcher and the two validated tool-proof files', () => {
    const by = Object.fromEntries(DOWNLOADS.map((d) => [d.name, d]))
    expect(by['check_sysml.py'].text()).toBe(checkerPy)
    expect(by['SysMLBatchCheck.java'].text()).toBe(launcherJava)
    expect(by['tool_proof_pass.sysml'].text()).toBe(sysmlSource('lectures/week08/tool_proof_pass.sysml'))
    expect(by['invalid_tool_proof_unquoted_id.sysml'].text()).toBe(sysmlSource('lectures/week08/invalid_tool_proof_unquoted_id.sysml'))
    expect(by['check_sysml.py'].saveIn).toBe('checker/scripts/')
    expect(by['SysMLBatchCheck.java'].saveIn).toBe('checker/scripts/sysml-launcher/')
  })
  it('the layout is the one check_sysml.py expects: tools/ two levels above the script, jdk-21 and sysml-pilot-2026-08/kernel inside it', () => {
    expect(checkerPy).toContain('PROJECT_DIR = STUDIO_DIR.parent')
    expect(checkerPy).toContain('STUDIO_DIR = SCRIPTS_DIR.parent')
    expect(checkerPy).toContain('TOOLS_DIR = Path(os.environ.get("SYSML_TOOLS_DIR", PROJECT_DIR / "tools")).resolve()')
    expect(checkerPy).toContain('JDK_DIR = TOOLS_DIR / "jdk-21"')
    expect(checkerPy).toContain('PILOT_DIR = TOOLS_DIR / f"sysml-pilot-{RELEASE}"')
    expect(checkerPy).toContain('LAUNCHER_SRC = SCRIPTS_DIR / "sysml-launcher" / "SysMLBatchCheck.java"')
    const tree = LAYOUT.join('\n')
    for (const part of ['sysml-checker/', 'checker/', 'scripts/', 'check_sysml.py', 'sysml-launcher/', 'SysMLBatchCheck.java', 'models/', 'tools/', 'jdk-21/', 'sysml-pilot-2026-08/kernel/']) expect(tree).toContain(part)
  })
  it('every step with commands has them for Windows, macOS and Linux, and they use the layout names', () => {
    for (const s of STEPS.filter((x) => x.commands)) for (const os of OSES) expect(s.commands![os].length, `${s.id}/${os}`).toBeGreaterThan(0)
    const all = (os: OsKey) => STEPS.flatMap((s) => s.commands?.[os] ?? []).join('\n')
    for (const os of OSES) {
      expect(all(os), os).toMatch(/jdk-21/)
      expect(all(os), os).toMatch(/sysml-pilot-2026-08\/kernel/)
      expect(all(os), os).toMatch(/check_sysml\.py models[\\/]tool_proof_pass\.sysml models[\\/]invalid_tool_proof_unquoted_id\.sysml/)
      expect(all(os), os).toMatch(/entries unpacked/)
      // the unpack prints the file count (folder entries excluded), which the step note states
      expect(all(os), os).toContain("sum(not n.endswith('/') for n in z.namelist())")
    }
    expect(KERNEL_FILES).toBe(99)
    expect(STEPS.find((s) => s.id === 'kernel')?.note?.text).toContain('the file count must be 99 (95 standard-library files')
    expect(all('macos')).toContain('Contents/Home')
    expect(all('windows')).toMatch(/Get-FileHash/)
  })
  it('the checksums are the published ones (Windows JDK and kernel as in the toolchain provenance)', () => {
    expect(toolchainMd).toContain(JDK_WINDOWS_SHA256)
    expect(toolchainMd).toContain(KERNEL_SHA256)
    expect(Object.keys(JDK_SHA256)).toHaveLength(5)
    for (const v of Object.values(JDK_SHA256)) expect(v).toMatch(/^[0-9a-f]{64}$/)
    const cmd = STEPS.flatMap((s) => Object.values(s.commands ?? {}).flat()).join('\n')
    for (const v of Object.values(JDK_SHA256)) expect(cmd.toLowerCase()).toContain(v)
  })
  it('states who must install (one per team), that a personal installation is optional, and that a PASS is not meaning', () => {
    expect(CHECKER_WHO.text).toMatch(/every team needs one working installation/)
    expect(CHECKER_WHO.text).toMatch(/optional/)
    expect(CHECKER_WHAT.text).toMatch(/never shows that the model says what your register says/)
    expect(TROUBLESHOOTING.length).toBeGreaterThanOrEqual(8)
    expect(TROUBLESHOOTING.some((t) => /Traceback/.test(t.symptom))).toBe(true)
  })
  it('the lab instructions carry the guide, and no student text names a Week 7 installation task', () => {
    const md = checkerMarkdown().join('\n')
    expect(labMd.replace(/\r\n/g, '\n')).toContain(md)
    expect(`${md}\n${labMd}`).not.toMatch(/pre-Phase-II|installed in (the )?Week 7/i)
    expect('the checker is installed in the Week 7 pre-Phase-II task').toMatch(/pre-Phase-II|installed in (the )?Week 7/i)
    expect(md).not.toMatch(/\b(S0\d|S10|R\d{2}[a-z]?|RB-\d|FD-\d)\b/)
  })
})
