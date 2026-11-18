// Applies the saved theme before the first paint, so a reader with a dark theme does not see the page flash light while
// the app loads (AppState.tsx takes over once React runs, and follows the system setting from then on). A file, not an
// inline script, because the course server's Content-Security-Policy allows scripts from the site itself only.
;(function () {
  try {
    var saved = JSON.parse(window.localStorage.getItem('sysml-studio:v1:theme') || '"system"')
    var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  } catch {
    // storage or matchMedia unavailable: the app sets the theme when it starts
  }
  // The display settings (src/nav/display.ts, the same rules: cleanDisplay and applyDisplay): glass, frost, solid
  // panels, less motion and text size, so a reader who chose solid panels or a larger text sees them from the first paint.
  try {
    var r = JSON.parse(window.localStorage.getItem('sysml-studio:v1:display') || 'null') || {}
    var num = function (v, lo, hi, d) {
      return typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : d
    }
    var size = r.size === 'large' || r.size === 'larger' ? r.size : 'default'
    var root = document.documentElement
    root.style.setProperty('--glass-a', String(num(r.glass, 45, 100, 62) / 100))
    root.style.setProperty('--glass-blur', num(r.frost, 0, 32, 18) + 'px')
    root.style.setProperty('--text-zoom', String({ default: 1, large: 1.1, larger: 1.2 }[size]))
    root.dataset.surface = r.solid === true ? 'solid' : 'glass'
    root.dataset.motion = r.calm === true ? 'calm' : 'full'
    root.dataset.textSize = size
  } catch {
    // storage unavailable or not JSON: the app applies the defaults when it starts
  }
})()
