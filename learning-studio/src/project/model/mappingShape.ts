// Defensive reading of a stored or imported mapping record (M7 review M7-2). A record written by hand, by an older
// tool or by a damaged file must never crash the Week 8 preview or the lab tool: every field is checked; a record
// without a usable uid and MAP ID is left out (null); a malformed optional field (source, pkg, confirmedBy) is dropped
// and reported in `problems`, never guessed.
import { ID_RE } from './ids'
import { MAPPING_STATUSES, type ModelMapping } from './types'
import { isWeek8Package } from './week8Packages'

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const text = (x: unknown) => (typeof x === 'string' ? x : '')
const texts = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === 'string') : [])
const num = (x: unknown, d: number) => (typeof x === 'number' && Number.isFinite(x) ? x : d)

export function cleanMapping(x: unknown): { mapping: ModelMapping | null; problems: string[] } {
  if (!isObj(x) || typeof x.uid !== 'string' || !x.uid || typeof x.id !== 'string' || !ID_RE('MAP').test(x.id)) return { mapping: null, problems: ['a mapping record without a usable ID was left out'] }
  const problems: string[] = []
  const status = MAPPING_STATUSES.includes(x.status as ModelMapping['status']) ? (x.status as ModelMapping['status']) : 'not-mapped'
  if (x.status !== undefined && status !== x.status) problems.push(`${x.id}: unknown status, read as not mapped`)
  const c = x.confirmedBy
  const confirmedBy = isObj(c) && typeof c.at === 'string' && typeof c.by === 'string' && typeof c.change === 'string' ? { at: c.at, by: c.by, change: c.change } : undefined
  if (c !== undefined && !confirmedBy) problems.push(`${x.id}: who confirmed it could not be read and was left out`)
  const s = x.source
  const source = isObj(s) && typeof s.id === 'string' && s.id ? { id: s.id, title: text(s.title), projectRev: num(s.projectRev, 0) } : undefined
  if (s !== undefined && (!source || typeof (s as Record<string, unknown>).title !== 'string')) problems.push(`${x.id}: the Week 1 item it was made for could not be fully read${source ? '' : ' and was left out'}`)
  if (x.pkg !== undefined && typeof x.pkg !== 'string') problems.push(`${x.id}: the package could not be read and was left out`)
  // the course server refuses any other package name, so a record holding one must never be written back as it is
  const pkg = typeof x.pkg === 'string' && x.pkg && isWeek8Package(x.pkg) ? x.pkg : ''
  if (typeof x.pkg === 'string' && x.pkg && !pkg) problems.push(`${x.id}: “${x.pkg.slice(0, 60)}” is not a package of the course working mapping and was left out`)
  const mapping: ModelMapping = {
    uid: x.uid,
    id: x.id,
    artifact: text(x.artifact),
    elements: texts(x.elements),
    rule: text(x.rule),
    status,
    statusReason: text(x.statusReason),
    findings: texts(x.findings),
    ...(confirmedBy ? { confirmedBy } : {}),
    sourceRevision: num(x.sourceRevision, 0),
    week: num(x.week, 8),
    ...(pkg ? { pkg } : {}),
    ...(source ? { source } : {}),
  }
  return { mapping, problems }
}
