import { defineConfig } from 'vitest/config'

// Course server tests (M2): node environment, server/**/*.test.ts only. Each test opens an in-memory SQLite database
// (or a temporary folder for backup tests) and an HTTP listener on an ephemeral port; nothing touches the repository.
export default defineConfig({
  // VITE_BACKEND=auto: src/services/backend.ts keeps its server path (client.test.ts drives it against the real server)
  define: { 'import.meta.env.VITE_EDITION': JSON.stringify('server'), 'import.meta.env.VITE_BACKEND': JSON.stringify('auto') },
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts'],
    testTimeout: 60_000,
    pool: 'forks',
  },
})