// Interactive activities are discovered by file name (*.activity.tsx). Each module exports
// `ACTIVITIES: Record<string, ComponentType>`; the key is what week content names in ActivitySpec.component.
import type { ComponentType } from 'react'

type ActivityModule = { ACTIVITIES: Record<string, ComponentType> }
const modules = import.meta.glob<ActivityModule>('./*.activity.tsx', { eager: true })

export const ACTIVITY_REGISTRY: Record<string, ComponentType> = {}
for (const [path, m] of Object.entries(modules)) {
  for (const [key, c] of Object.entries(m.ACTIVITIES)) {
    if (ACTIVITY_REGISTRY[key]) throw new Error(`Duplicate activity key ${key} in ${path}`)
    ACTIVITY_REGISTRY[key] = c
  }
}
export const ACTIVITY_KEYS = new Set(Object.keys(ACTIVITY_REGISTRY))
