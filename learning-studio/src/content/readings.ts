import data from './readings.generated.json'

export type Reading = {
  id: string
  source: string
  sourceTitle: string
  title: string
  firstPage: number
  lastPage: number
  unit: 'slide' | 'pdf-page'
  level: 'E' | 'X' | 'I'
  verification: string
  verified: boolean
  declaredException: boolean
}

export const READINGS: Reading[] = data.readings as Reading[]
const byId = new Map(READINGS.map((r) => [r.id, r]))

export function getReading(id: string): Reading {
  const r = byId.get(id)
  if (!r) throw new Error(`Unknown reading ${id}: every citation must exist in the verified register`)
  return r
}

/** A citation points into a verified reading, optionally narrowing the page/slide range. */
export type Citation = { reading: string; pages?: string; note?: string }

export function formatCitation(c: Citation): string {
  const r = getReading(c.reading)
  const unit = r.unit === 'slide' ? 'sl.' : 'p.'
  const range = c.pages ?? (r.firstPage === r.lastPage ? `${r.firstPage}` : `${r.firstPage}–${r.lastPage}`)
  return `${r.id} · ${r.sourceTitle}, "${r.title}", ${unit}${range}`
}

/** Pages cited must lie inside the reading's verified range. */
export function citationInRange(c: Citation): boolean {
  const r = getReading(c.reading)
  if (!c.pages) return true
  const nums = c.pages.split(/[–,-]/).map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n))
  return nums.every((n) => n >= r.firstPage && n <= r.lastPage)
}
