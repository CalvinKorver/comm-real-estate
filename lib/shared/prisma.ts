import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with appropriate database URL based on environment
const createPrismaClient = () => {
  if (process.env.NODE_ENV === 'test') {
    // Use test database URL for test environment
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.POSTGRES_URL_NON_POOLING
        }
      }
    })
  }
  
  // Use non-pooling connection for production to avoid prepared statement conflicts
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 