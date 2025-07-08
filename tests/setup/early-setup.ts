import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables BEFORE any other imports
// This ensures that NODE_ENV=test is set before Prisma clients are created
dotenv.config({ path: path.join(process.cwd(), '.env.test') })

console.log('Early setup - Environment variables loaded:', {
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.POSTGRES_URL_NON_POOLING ? 'loaded' : 'missing',
  prismaUrl: process.env.POSTGRES_PRISMA_URL ? 'loaded' : 'missing'
})