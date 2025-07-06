import { exec } from 'child_process'
import { promisify } from 'util'
import dotenv from 'dotenv'
import path from 'path'

const execAsync = promisify(exec)

export default async function globalSetup() {
  // Load test environment variables
  const result = dotenv.config({ path: path.join(process.cwd(), '.env.test') })
  console.log('Environment variables loaded:', {
    loaded: result.parsed ? Object.keys(result.parsed) : 'none',
    error: result.error?.message
  })
  
  console.log('🐳 Starting test database container...')
  
  try {
    // Start the test database container
    await execAsync('docker-compose -f docker-compose.test.yml up -d --wait')
    
    console.log('✅ Test database container is ready')
    
    // Wait a bit for the database to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Run Prisma migrations on the test database
    console.log('🔄 Running Prisma migrations on test database...')
    await execAsync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.POSTGRES_URL_NON_POOLING,
      }
    })
    
    console.log('✅ Test database migrations completed')
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error)
    throw error
  }
}

export async function globalTeardown() {
  console.log('🧹 Cleaning up test database container...')
  
  try {
    await execAsync('docker-compose -f docker-compose.test.yml down -v')
    console.log('✅ Test database container cleaned up')
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error)
  }
}