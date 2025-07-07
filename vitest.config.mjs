import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    // Default configuration for unit tests
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    globals: true,
    // Coverage configuration matching Jest setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'lib/**/*.{ts,tsx}',
        'app/api/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/.next/**',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        './lib/workouts.ts': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        }
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})