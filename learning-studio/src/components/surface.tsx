// Where an activity is rendered: the classic WeekPage ('classic', the default) or a workbench centre view
// ('workbench'). Activities read it to pick the dense workbench styling (tokens, 12–13 px type, segmented controls,
// compact sliders). Behaviour and text never depend on it, so the classic page and its tests are unaffected.
import { createContext, useContext } from 'react'

export type Surface = 'classic' | 'workbench'

export const SurfaceContext = createContext<Surface>('classic')

export function useSurface(): Surface {
  return useContext(SurfaceContext)
}

/** True when rendered inside a workbench centre view (or when a caller forces the workbench variant). */
export function useIsWorkbench(variant?: Surface): boolean {
  const s = useContext(SurfaceContext)
  return (variant ?? s) === 'workbench'
}

/** Chart colours resolved from the workbench tokens (both themes designed; see theme.css). */
export function chartTokens(dark: boolean) {
  return dark
    ? { axis: '#9ba5b4', grid: '#2b3340', tooltipBg: '#181e27', tooltipLine: '#3d4757', fg: '#e3e8ef' }
    : { axis: '#566071', grid: '#e1e5eb', tooltipBg: '#ffffff', tooltipLine: '#b4bdc9', fg: '#18202d' }
}
