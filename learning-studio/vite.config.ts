import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { studentEdition } from './student-edition.ts'

// Local-only prototype: the dev server binds to localhost and a fixed port.
export default defineConfig({
  // Relative asset paths so the static build works from any folder or a GitHub Pages sub-path (hash routing).
  base: './',
  // studentEdition() is inert except in `vite build --mode student`, where it strips faculty notes (student-edition.ts).
  plugins: [studentEdition(), react(), tailwindcss()],
  // warmup: transform the app entry as soon as the dev server starts, so the first page load (the first e2e test on a
  // cold server) does not wait for the whole module graph (sign-off review m1)
  server: { host: '127.0.0.1', port: 5173, strictPort: true, warmup: { clientFiles: ['./src/main.tsx'] } },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
})
