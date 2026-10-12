import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Local-only prototype: the dev server binds to localhost and a fixed port.
export default defineConfig({
  // Relative asset paths so the static build works from any folder or a GitHub Pages sub-path (hash routing).
  base: './',
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
})
