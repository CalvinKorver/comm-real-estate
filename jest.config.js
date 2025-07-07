module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Only run tests in __tests__ directory to avoid conflicts with Vitest
  testMatch: [
    '**/__tests__/**/*.{js,ts,tsx}'
  ],
  // Explicitly ignore Vitest integration tests
  testPathIgnorePatterns: [
    '/node_modules/',
    'tests/integration/',
    'tests/setup/',
    'tests/utils/'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      babelConfig: {
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
      }
    }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
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
  },
} 