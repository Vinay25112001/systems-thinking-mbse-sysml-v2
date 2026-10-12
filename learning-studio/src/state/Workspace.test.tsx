import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Providers } from './Providers'
import { useWorkspace } from './Workspace'
import { validateModel } from '../model/engineering'

const wrapper = ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>

describe('workspace batch API', () => {
  beforeEach(() => window.localStorage.clear())

  it('creates elements and links between them in one atomic update', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper })
    let r: ReturnType<typeof result.current.apply> = { ids: {}, linkIds: [] }
    act(() => {
      r = result.current.apply({
        elements: [
          { key: 'n', kind: 'NEED', name: 'Predictable waits', provenance: 'team-derived' },
          { key: 'c', kind: 'CAP', name: 'Demand-responsive dispatch', provenance: 'team-derived' },
        ],
        links: [
          { source: 'n', type: 'derives-from', target: 'STK-001' },
          { source: 'c', type: 'derives-from', target: 'n' },
        ],
      })
    })
    expect(r.error).toBeUndefined()
    expect(r.ids).toEqual({ n: 'NEED-001', c: 'CAP-001' })
    expect(result.current.model.links.map((l) => `${l.source}>${l.target}`)).toEqual(['NEED-001>STK-001', 'CAP-001>NEED-001'])
    expect(validateModel(result.current.model)).toEqual([])
  })

  it('applies nothing when any link is not allowed', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper })
    let r: ReturnType<typeof result.current.apply> = { ids: {}, linkIds: [] }
    act(() => {
      r = result.current.apply({ elements: [{ key: 'n', kind: 'NEED', name: 'x', provenance: 'team-derived' }], links: [{ source: 'STK-001', type: 'verifies', target: 'n' }] })
    })
    expect(r.error).toMatch(/not an allowed relationship/)
    expect(result.current.model.elements.some((e) => e.kind === 'NEED')).toBe(false)
  })

  it('never reuses IDs after retire, reset or delete', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper })
    act(() => void result.current.apply({ elements: [{ key: 'a', kind: 'REQ', reqLevel: 'SYS', name: 'r', provenance: 'team-derived' }] }))
    act(() => result.current.reset())
    let r: ReturnType<typeof result.current.apply> = { ids: {}, linkIds: [] }
    act(() => {
      r = result.current.apply({ elements: [{ key: 'b', kind: 'REQ', reqLevel: 'SYS', name: 'r2', provenance: 'team-derived' }] })
    })
    expect(r.ids.b).toBe('REQ-SYS-002')
  })
})
