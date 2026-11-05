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
})()
