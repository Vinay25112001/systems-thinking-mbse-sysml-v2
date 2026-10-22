// FD-g: the student build drops only the Week 1 decks (A23), and only Week 1 deck links disappear from it.
import { describe, expect, it, vi } from 'vitest'
import { deckShipped } from './decks'

describe('Which decks ship (FD-g)', () => {
  it('the instructor edition ships every deck', () => {
    for (const stem of ['week01-session1', 'week02-session2', 'week08-session1']) expect(deckShipped(stem), stem).toBe(true)
  })

  it('the student edition drops the Week 1 decks only', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_EDITION', 'student')
    try {
      const { deckShipped: student } = await import('./decks')
      expect(student('week01-session1')).toBe(false)
      expect(student('week01-session2')).toBe(false)
      for (const stem of ['week02-session1', 'week03-session2', 'week04-session1', 'week05-session2', 'week06-session1', 'week07-session1', 'week07-session2', 'week08-session2']) expect(student(stem), stem).toBe(true)
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })
})
