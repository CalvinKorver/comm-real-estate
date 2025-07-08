import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    name: 'integration',
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
    // Setup files for test database - order matters!
    setupFiles: ['./tests/setup/early-setup.ts', './tests/setup/integration-setup.ts'],
    // Global setup for database initialization
    globalSetup: './tests/setup/global-setup.ts',
    globalTeardown: './tests/setup/global-setup.ts',
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