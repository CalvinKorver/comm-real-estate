import { describe, expect, it } from "vitest"

import { getTestPrismaClient, seedTestData } from "../setup/test-database"

describe("Database Integration Tests", () => {
  const prisma = getTestPrismaClient()

  it("should connect to test database", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as value`
    expect(result).toBeDefined()
  })

  it("should create and retrieve property data", async () => {
    const property = await prisma.property.create({
      data: {
        street_address: "123 Integration Test St",
        city: "Test City",
        zip_code: 12345,
        state: "WA",
        net_operating_income: 50000,
        price: 500000,
        return_on_investment: 10,
        number_of_units: 1,
        square_feet: 1500,
      },
    })

    expect(property.id).toBeDefined()
    expect(property.street_address).toBe("123 Integration Test St")
    expect(property.city).toBe("Test City")
    expect(property.zip_code).toBe(12345)
  })

  it("should create owner with contacts", async () => {
    const owner = await prisma.owner.create({
      data: {
        first_name: "Test",
        last_name: "Owner",
        contacts: {
          create: [
            {
              phone: "555-123-4567",
              type: "primary",
              priority: 1,
            },
            {
              email: "test@example.com",
              type: "email",
              priority: 1,
            },
          ],
        },
      },
      include: {
        contacts: true,
      },
    })

    expect(owner.id).toBeDefined()
    expect(owner.first_name).toBe("Test")
    expect(owner.last_name).toBe("Owner")
    expect(owner.contacts).toHaveLength(2)

    const phoneContact = owner.contacts.find((c) => c.phone)
    const emailContact = owner.contacts.find((c) => c.email)

    expect(phoneContact?.phone).toBe("555-123-4567")
    expect(emailContact?.email).toBe("test@example.com")
  })

  it("should use seed test data", async () => {
    const { testUser, testProperty, testOwner, testContact } =
      await seedTestData(prisma)

    expect(testUser.email).toBe("test@example.com")
    expect(testProperty.street_address).toBe("123 Test Street")
    expect(testOwner.first_name).toBe("Test")
    expect(testContact.phone).toBe("555-123-4567")

    // Verify relationships
    const propertyWithOwners = await prisma.property.findUnique({
      where: { id: testProperty.id },
      include: { owners: true },
    })

    expect(propertyWithOwners?.owners).toHaveLength(1)
    expect(propertyWithOwners?.owners[0].id).toBe(testOwner.id)
  })
})
