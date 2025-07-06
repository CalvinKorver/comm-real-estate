import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'integration-ci',
    include: ['tests/integration/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    // Disable parallel execution for integration tests to prevent database conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Set longer timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
    // Setup files for test database (no Docker setup needed in CI)
    setupFiles: ['./tests/setup/integration-setup-ci.ts'],
    // Configure environment variables
    env: {
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  // Configure external dependencies
  optimizeDeps: {
    exclude: ['@prisma/client'],
  },
})