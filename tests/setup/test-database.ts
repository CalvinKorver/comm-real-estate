import { PrismaClient } from '../../generated/prisma'

/**
 * Create a test-specific Prisma client with proper database URL
 */
export function getTestPrismaClient() {
  // In CI environment, use environment variables, otherwise use local Docker database
  const localDbUrl = 'postgresql://test_user:test_password@localhost:5433/comm_real_estate_test?connect_timeout=15'
  
  if (process.env.CI) {
    // Use CI environment variables (already set at job level)
    return new PrismaClient()
  } else {
    // Use local Docker database
    return new PrismaClient({
      datasources: {
        db: {
          url: localDbUrl
        }
      }
    })
  }
}

/**
 * Reset the test database by clearing all tables
 * This ensures each test starts with a clean state
 */
export async function resetDatabase(prismaClient?: PrismaClient) {
  const prisma = prismaClient || getTestPrismaClient()
  
  try {
    await prisma.$transaction([
      // Delete in order to respect foreign key constraints
      prisma.contact.deleteMany(),
      prisma.note.deleteMany(),
      prisma.propertyImage.deleteMany(),
      prisma.coordinate.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.verificationToken.deleteMany(),
      prisma.user.deleteMany(),
      // Delete the many-to-many relation records
      prisma.propertyList.deleteMany(),
      prisma.list.deleteMany(),
      prisma.owner.deleteMany(),
      prisma.property.deleteMany(),
    ])
  } finally {
    if (!prismaClient) {
      await prisma.$disconnect()
    }
  }
}

/**
 * Seed the database with common test data
 * This can be used in tests that need some base data
 */
export async function seedTestData(prismaClient?: PrismaClient) {
  const prisma = prismaClient || getTestPrismaClient()
  
  try {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }
    })

    // Create test list
    const testList = await prisma.list.create({
      data: {
        name: 'Test List',
      }
    })

    // Create test property
    const testProperty = await prisma.property.create({
      data: {
        street_address: '123 Test Street',
        city: 'Test City',
        zip_code: 12345,
        state: 'WA',
        net_operating_income: 50000,
        price: 500000,
        return_on_investment: 10,
        number_of_units: 1,
        square_feet: 1500,
      }
    })

    // Connect property to list
    await prisma.propertyList.create({
      data: {
        property_id: testProperty.id,
        list_id: testList.id,
      }
    })

    // Create test owner
    const testOwner = await prisma.owner.create({
      data: {
        first_name: 'Test',
        last_name: 'Owner',
        properties: {
          connect: { id: testProperty.id }
        }
      }
    })

    // Create test contact
    const testContact = await prisma.contact.create({
      data: {
        phone: '555-123-4567',
        email: 'owner@example.com',
        type: 'primary',
        priority: 1,
        owner_id: testOwner.id,
      }
    })

    return {
      testUser,
      testList,
      testProperty,
      testOwner,
      testContact,
    }
  } finally {
    if (!prismaClient) {
      await prisma.$disconnect()
    }
  }
}