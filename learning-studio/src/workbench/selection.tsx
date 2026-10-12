// Global selection (WORKBENCH_SPEC §3): one selected element across the model browser, centre views, properties,
// problems and the impact view; `highlighted` holds the elements a change just touched.
import { createContext, useContext } from 'react'

export type Selection = {
  selectedId: string | null
  select: (id: string | null, opts?: { reveal?: boolean; openView?: boolean }) => void
  hovered: string | null
  setHovered: (id: string | null) => void
  highlighted: ReadonlySet<string>
  /** Incremented when a caller asks the model browser to scroll the selection into view. */
  revealTick: number
}

export const SelectionContext = createContext<Selection>({
  selectedId: null,
  select: () => {},
  hovered: null,
  setHovered: () => {},
  highlighted: new Set(),
  revealTick: 0,
})

export function useSelection(): Selection {
  return useContext(SelectionContext)
}
