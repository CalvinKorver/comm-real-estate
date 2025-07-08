import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import dotenv from 'dotenv'
import path from 'path'

const execAsync = promisify(exec)
let nextServer: any = null

export default async function globalSetup() {
  // Load test environment variables
  const result = dotenv.config({ path: path.join(process.cwd(), '.env.test') })
  console.log('Environment variables loaded:', {
    loaded: result.parsed ? Object.keys(result.parsed) : 'none',
    error: result.error?.message
  })
  
  // Skip Docker setup in CI environment
  if (process.env.CI) {
    console.log('🔧 CI environment detected - skipping Docker setup')
    console.log('✅ Using GitHub Actions PostgreSQL service')
    return
  }
  
  console.log('🐳 Starting test database container...')
  
  try {
    // Start the test database container
    await execAsync('docker-compose -f docker-compose.test.yml up -d --wait')
    
    console.log('✅ Test database container is ready')
    
    // Wait a bit for the database to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Run Prisma migrations on the test database
    console.log('🔄 Running Prisma migrations on test database...')
    const localDbUrl = 'postgresql://test_user:test_password@localhost:5433/comm_real_estate_test?connect_timeout=15'
    await execAsync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: localDbUrl,
        POSTGRES_PRISMA_URL: localDbUrl,
        POSTGRES_URL_NON_POOLING: localDbUrl,
      }
    })
    
    console.log('✅ Test database migrations completed')
    
    // In CI, the server is already started by the workflow
    if (process.env.CI) {
      console.log('🔧 CI environment detected - skipping Next.js server startup')
      console.log('✅ Using CI-managed Next.js server')
      return
    }
    
    // Kill any existing process on port 3001
    try {
      await execAsync('lsof -ti:3001 | xargs kill -9 2>/dev/null || true')
      console.log('🧹 Cleaned up any existing process on port 3001')
    } catch (error) {
      // Ignore errors - port might be free
    }

    // Start Next.js server with test environment
    console.log('🚀 Starting Next.js server with test environment...')
    nextServer = spawn('npm', ['run', 'dev'], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DATABASE_URL: localDbUrl,
        POSTGRES_PRISMA_URL: localDbUrl,
        POSTGRES_URL_NON_POOLING: localDbUrl,
        PORT: '3001'
      },
      stdio: 'pipe'
    })
    
    // Wait for Next.js server to be ready
    await new Promise((resolve, reject) => {
      let output = ''
      let errorOutput = ''
      const timeout = setTimeout(() => {
        console.error('Next.js server startup timeout. Last output:', output)
        console.error('Error output:', errorOutput)
        reject(new Error('Next.js server failed to start within 30 seconds'))
      }, 30000)
      
      nextServer.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString()
        output += chunk
        console.log('Next.js server:', chunk.trim())
        
        if (chunk.includes('Ready in') || chunk.includes('started server on') || chunk.includes('Local:')) {
          clearTimeout(timeout)
          resolve(true)
        }
      })
      
      nextServer.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString()
        errorOutput += chunk
        console.error('Next.js server error:', chunk.trim())
        
        if (chunk.includes('EADDRINUSE')) {
          clearTimeout(timeout)
          reject(new Error(`Port 3001 is already in use. Error: ${chunk}`))
        }
      })
      
      nextServer.on('error', (error: Error) => {
        clearTimeout(timeout)
        reject(error)
      })
      
      nextServer.on('exit', (code: number) => {
        if (code !== 0) {
          clearTimeout(timeout)
          reject(new Error(`Next.js server exited with code ${code}`))
        }
      })
    })
    
    console.log('✅ Next.js server started with test environment')
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error)
    throw error
  }
}

export async function globalTeardown() {
  // Stop Next.js server
  if (nextServer) {
    console.log('🛑 Stopping Next.js server...')
    
    // Try graceful shutdown first
    nextServer.kill('SIGTERM')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Force kill if still running
    if (!nextServer.killed) {
      nextServer.kill('SIGKILL')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('✅ Next.js server stopped')
  }
  
  // Skip Docker cleanup in CI environment
  if (process.env.CI) {
    console.log('🔧 CI environment detected - skipping Docker cleanup')
    return
  }
  
  console.log('🧹 Cleaning up test database container...')
  
  try {
    await execAsync('docker-compose -f docker-compose.test.yml down -v')
    console.log('✅ Test database container cleaned up')
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error)
  }
}