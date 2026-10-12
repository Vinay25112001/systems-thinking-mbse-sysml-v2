// Workbench regions for keyboard navigation (F6 / Shift+F6) and the shortcut list shown by `?`.
const REGION_ORDER = ['topbar', 'rail', 'brief', 'view', 'dock', 'browser', 'properties', 'status']

/** Moves focus to the next (or previous) visible region; exported for tests. */
export function cycleRegion(root: ParentNode, backwards: boolean): string | null {
  const regions = [...root.querySelectorAll<HTMLElement>('[data-wb-region]')]
    .filter((el) => el.getClientRects().length > 0 || el.dataset.wbAlwaysVisible === 'true')
    .sort((a, b) => REGION_ORDER.indexOf(a.dataset.wbRegion!) - REGION_ORDER.indexOf(b.dataset.wbRegion!))
  if (!regions.length) return null
  const active = document.activeElement
  const cur = regions.findIndex((r) => r === active || r.contains(active))
  const next = regions[(cur + (backwards ? -1 : 1) + regions.length) % regions.length] ?? regions[0]
  next.focus()
  return next.dataset.wbRegion ?? null
}


export const SHORTCUTS: [string, string][] = [
  ['F6 / Shift+F6', 'Move to the next / previous region (top bar, rail, mission brief, view, dock, model browser, properties, status bar)'],
  ['↑ ↓ Home End', 'Move in the model browser'],
  ['→ ←', 'Expand / collapse a group in the model browser'],
  ['Enter or Space', 'Select the focused element'],
  ['/', 'Search the model browser'],
  ['Ctrl+Z / Ctrl+Shift+Z', 'Undo / redo the last model edit (outside text fields; listed in Changes & impact)'],
  ['Esc', 'Close the open drawer or dialog'],
  ['?', 'Show this list'],
]

