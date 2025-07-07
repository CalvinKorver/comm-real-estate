import { hash } from "bcrypt"

import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()

  // Create a test user
  const hashedPassword = await hash("password123", 10)
  const testUser = await prisma.user.create({
    data: {
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      password: hashedPassword,
    },
  })

  console.log("Test user created:", testUser.email)

  const owner1 = await prisma.owner.create({
    data: {
      first_name: "Owen",
      last_name: "Twoprops",
      street_address: "123 Main St",
      city: "San Francisco",
      zip_code: "94105",
      phone_number: "415-555-0123",
    },
  })

  const owner2 = await prisma.owner.create({
    data: {
      first_name: "Sarah",
      last_name: "Johnson",
      street_address: "456 Market St",
      city: "San Francisco",
      zip_code: "94103",
      phone_number: "415-555-0124",
    },
  })

  const owner3 = await prisma.owner.create({
    data: {
      first_name: "Michael",
      last_name: "Brown",
      street_address: "789 Mission St",
      city: "San Francisco",
      zip_code: "94107",
      phone_number: "415-555-0125",
    },
  })

  // Create a sample property
  const property1 = await prisma.property.create({
    data: {
      street_address: "1400 N 95th Street",
      city: "Seattle",
      zip_code: 94105,
      net_operating_income: 90000,
      price: 1500000,
      return_on_investment: 8,
      number_of_units: 4,
      square_feet: 4200,
      owners: {
        connect: [{ id: owner1.id }, { id: owner2.id }, { id: owner3.id }],
      },
      coordinates: {
        create: {
          latitude: 47.6062,
          longitude: -122.3321,
          confidence: "high",
          place_id: "ChIJKxjxuxlqkFQR3CK6O1HNNqY",
        },
      },
      images: {
        create: [
          { url: "/p1-1.jpg", alt: "Property Main Image", order: 0 },
          { url: "/p1-2.jpg", alt: "Property Image 2", order: 1 },
          { url: "/p1-3.jpg", alt: "Property Image 3", order: 2 },
          { url: "/p1-4.jpg", alt: "Property Image 4", order: 3 },
          { url: "/p1-5.jpg", alt: "Property Image 5", order: 4 },
          { url: "/p1-6.jpg", alt: "Property Image 6", order: 5 },
        ],
      },
    },
  })

  const property2 = await prisma.property.create({
    data: {
      street_address: "112 N 24th Street",
      city: "Edmonds",
      zip_code: 98115,
      net_operating_income: 60000,
      price: 2100000,
      return_on_investment: 4,
      number_of_units: 5,
      square_feet: 5200,
      owners: {
        connect: [{ id: owner1.id }],
      },
      coordinates: {
        create: {
          latitude: 47.8107,
          longitude: -122.3774,
          confidence: "high",
          place_id: "ChIJKxjxuxlqkFQR3CK6O1HNNqY",
        },
      },
      images: {
        create: [
          { url: "/p1-1.jpg", alt: "Property Main Image", order: 0 },
          { url: "/p1-2.jpg", alt: "Property Image 2", order: 1 },
          { url: "/p1-3.jpg", alt: "Property Image 3", order: 2 },
          { url: "/p1-4.jpg", alt: "Property Image 4", order: 3 },
          { url: "/p1-5.jpg", alt: "Property Image 5", order: 4 },
          { url: "/p1-6.jpg", alt: "Property Image 6", order: 5 },
        ],
      },
    },
  })

  const property3 = await prisma.property.create({
    data: {
      street_address: "83 E 13rd Ave",
      city: "Tukwila",
      zip_code: 91223,
      net_operating_income: 10000,
      price: 900000,
      return_on_investment: 2,
      number_of_units: 3,
      square_feet: 2200,
      owners: {
        connect: [{ id: owner2.id }],
      },
      coordinates: {
        create: {
          latitude: 47.475,
          longitude: -122.2889,
          confidence: "high",
          place_id: "ChIJKxjxuxlqkFQR3CK6O1HNNqY",
        },
      },
      images: {
        create: [
          { url: "/p1-1.jpg", alt: "Property Main Image", order: 0 },
          { url: "/p1-2.jpg", alt: "Property Image 2", order: 1 },
          { url: "/p1-3.jpg", alt: "Property Image 3", order: 2 },
          { url: "/p1-4.jpg", alt: "Property Image 4", order: 3 },
          { url: "/p1-5.jpg", alt: "Property Image 5", order: 4 },
          { url: "/p1-6.jpg", alt: "Property Image 6", order: 5 },
        ],
      },
    },
  })

  console.log("Seed data created successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
