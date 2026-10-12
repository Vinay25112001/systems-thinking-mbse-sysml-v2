// SysML v2 listings shown in lessons are files under learning-studio/sysml/. A listing may only be labelled
// "validated" when sysml/validation-report.json (written by scripts/check_sysml.py, which runs the reference
// implementation) records PASS for a file whose SHA-256 matches the text the app displays.
// sysml/instructor/** holds answer-key listings: validated by the checker like every listing, but never bundled into the app.
const sources = import.meta.glob<string>(['../../sysml/**/*.sysml', '!../../sysml/instructor/**'], { query: '?raw', import: 'default', eager: true })
const reports = import.meta.glob<ValidationReport>('../../sysml/validation-report.json', { import: 'default', eager: true })

export type ValidationEntry = { file: string; sha256: string; status: 'PASS' | 'FAIL'; diagnostics: unknown[] }
export type ValidationReport = { tool?: { name?: string; release?: string; kernelVersion?: string }; timestamp?: string; files: ValidationEntry[] }

/** Human-readable name of the tool that produced the report, e.g. "OMG SysML v2 Pilot Implementation release 2026-08". */
export function toolLabel(r: ValidationReport | null = SYSML_REPORT): string {
  if (!r?.tool) return 'the reference implementation'
  const name = (r.tool.name ?? 'the reference implementation').replace(/\s*\(.*\)$/, '')
  return r.tool.release ? `${name} release ${r.tool.release}` : name
}

const norm = (f: string) => f.split('\\').join('/').replace(/^.*?sysml\//, '')

export const SYSML_SOURCES: Record<string, string> = Object.fromEntries(Object.entries(sources).map(([k, v]) => [norm(k), v]))
export const SYSML_REPORT: ValidationReport | null = Object.values(reports)[0] ?? null

export function sysmlSource(file: string): string | undefined {
  return SYSML_SOURCES[norm(file)]
}

export function reportEntry(file: string): ValidationEntry | undefined {
  return SYSML_REPORT?.files.find((e) => norm(e.file) === norm(file))
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
