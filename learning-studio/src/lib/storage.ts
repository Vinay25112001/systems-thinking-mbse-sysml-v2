// Safe, versioned localStorage access. Storage can be unavailable (private mode, blocked site data),
// so every read and write is guarded and the app must work without it.
const PREFIX = 'sysml-studio:v1:'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* storage unavailable: nothing to remove */
  }
}

export const STORAGE_PREFIX = PREFIX
