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
  // proxy: /api reaches the local course server (M2, server/; `npm run server`). changeOrigin stays false, so the server
  // sees Host 127.0.0.1:5173, which its Host and Origin allow-lists accept (SECURITY_ARCHITECTURE.md §4.3, §9).
  server: { host: '127.0.0.1', port: 5173, strictPort: true, warmup: { clientFiles: ['./src/main.tsx'] }, watch: { ignored: ['**/dist/**', '**/dist-student/**', '**/test-results/**'] }, proxy: { '/api': { target: process.env.SLS_API_TARGET ?? 'http://127.0.0.1:5174', changeOrigin: false } } },
  // optimizeDeps.include: libraries reached only through lazily imported chunks (the workbench behind Guided Practice)
  // are pre-bundled at startup; discovered at runtime instead, a restarted dev server answered "504 Outdated Optimize
  // Dep" and the workbench failed to load (2026-10-21). watch.ignored: build output must not trigger page reloads.
  optimizeDeps: { include: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-tooltip', 'react-resizable-panels', 'lucide-react', 'fflate' /* m6: the Excel import (lazy Week 1 chunk) */, 'recharts', '@xyflow/react' /* m6 review: lazy Dashboard / week pages answered 504 Outdated Optimize Dep on a long-running dev server */] },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
})
