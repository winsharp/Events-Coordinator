import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: { host: true, allowedHosts: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    reporters: ['default', 'json'],
    outputFile: { json: './test-results.json' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/lib/**/*.{ts,tsx}', 'src/api/**/*.{ts,tsx}', 'src/context/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
      exclude: ['src/mocks/**', 'src/setupTests.ts', 'src/test/**'],
      thresholds: { statements: 70, branches: 60, functions: 65, lines: 75 },
    },
  },
})
