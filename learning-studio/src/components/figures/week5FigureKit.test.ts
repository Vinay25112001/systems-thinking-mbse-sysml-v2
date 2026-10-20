import { describe, expect, it } from 'vitest'
import { MODULARITY, minLinkClearance } from './week5FigureKit'

describe('Week 5 modularity figure geometry (review Mo4)', () => {
  it('no link passes within node radius + 8 of a node it does not join, in either panel', () => {
    expect(minLinkClearance(MODULARITY.links, MODULARITY.grouped)).toBeGreaterThan(MODULARITY.r + 8)
    expect(minLinkClearance(MODULARITY.links, MODULARITY.scattered)).toBeGreaterThan(MODULARITY.r + 8)
  })
  it('five links cross the module boundary', () => {
    expect(MODULARITY.links.filter(([a, b]) => a < 3 !== b < 3)).toHaveLength(5)
  })
  it('negative direction: the pre-review layout fails the clearance check', () => {
    const old = [{ x: 540, y: 150 }, { x: 640, y: 150 }, { x: 590, y: 245 }, { x: 750, y: 320 }, { x: 850, y: 320 }, { x: 800, y: 415 }]
    expect(minLinkClearance(MODULARITY.links, old)).toBeLessThan(MODULARITY.r + 8)
  })
})
