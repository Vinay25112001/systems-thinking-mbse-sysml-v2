// Client-side download of a generated file (exports). Returns false when the browser blocks it.
export function downloadText(name: string, text: string, type = 'text/markdown') {
  try {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch {
    return false
  }
}

