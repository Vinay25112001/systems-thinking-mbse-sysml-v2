import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider, useApp } from './AppState'
import { loadJSON, saveJSON } from '../lib/storage'
import { matchRoute } from '../lib/router'

const wrapper = ({ children }: { children: ReactNode }) => <AppStateProvider>{children}</AppStateProvider>
const base = { category: 'customers' as const, concern: '', interest: 3, influence: 3, rationale: '', provenance: 'student' as const }

beforeEach(() => window.localStorage.clear())

describe('stakeholder map state', () => {
  it('issues sequential IDs and never reuses a deleted ID', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    let a = '', b = ''
    act(() => { a = result.current.addStakeholder({ ...base, name: 'A' }) })
    expect(a).toBe('STK-007')
    act(() => result.current.deleteStakeholder(a))
    act(() => { b = result.current.addStakeholder({ ...base, name: 'B' }) })
    expect(b).toBe('STK-008')
    act(() => result.current.resetMap())
    let c = ''
    act(() => { c = result.current.addStakeholder({ ...base, name: 'C' }) })
    expect(c).toBe('STK-009')
  })

  it('cascades relationship deletion and rejects self-links and duplicates', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    let r1: string | null = null
    act(() => { r1 = result.current.addRelationship({ source: 'STK-001', target: 'STK-002', type: 'funds', note: '' }) })
    expect(r1).toBe('REL-001')
    let dup: string | null = 'x'
    act(() => { dup = result.current.addRelationship({ source: 'STK-001', target: 'STK-002', type: 'funds', note: '' }) })
    expect(dup).toBeNull()
    let self: string | null = 'x'
    act(() => { self = result.current.addRelationship({ source: 'STK-001', target: 'STK-001', type: 'funds', note: '' }) })
    expect(self).toBeNull()
    act(() => result.current.deleteStakeholder('STK-002'))
    expect(result.current.map.relationships).toHaveLength(0)
  })

  it('persists to storage and restores on a new provider', () => {
    const first = renderHook(() => useApp(), { wrapper })
    act(() => { first.result.current.addStakeholder({ ...base, name: 'Persisted' }) })
    first.unmount()
    const second = renderHook(() => useApp(), { wrapper })
    expect(second.result.current.map.stakeholders.map((s) => s.name)).toContain('Persisted')
  })
})

describe('storage resilience', () => {
  it('falls back gracefully when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    const spy2 = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(loadJSON('x', 42)).toBe(42)
    expect(saveJSON('x', 1)).toBe(false)
    spy.mockRestore()
    spy2.mockRestore()
  })
})

describe('router', () => {
  it('matches parameterised routes', () => {
    expect(matchRoute('/week/:n', '/week/3')).toEqual({ n: '3' })
    expect(matchRoute('/week/:n', '/roadmap')).toBeNull()
  })
})
