import { beforeEach, afterAll } from 'vitest'
import { resetDatabase, getTestPrismaClient } from './test-database'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables for each test file
dotenv.config({ path: path.join(process.cwd(), '.env.test') })

console.log('Test environment setup:', {
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.POSTGRES_URL_NON_POOLING ? 'loaded' : 'missing',
  prismaUrl: process.env.POSTGRES_PRISMA_URL ? 'loaded' : 'missing'
})

let testPrisma: any

// Reset database before each test
beforeEach(async () => {
  // Get the test Prisma client
  testPrisma = getTestPrismaClient()
  await resetDatabase(testPrisma)
})

// Close database connection after all tests
afterAll(async () => {
  if (testPrisma) {
    await testPrisma.$disconnect()
  }
})