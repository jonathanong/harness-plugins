import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['plugins/**/*.test.mts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['plugins/**/*.mts'],
      // bin/ holds only process glue; bin.smoke.test.mts runs it as a child process.
      exclude: ['plugins/**/*.test.mts', 'plugins/*/bin/**'],
      thresholds: { 100: true },
    },
  },
})
