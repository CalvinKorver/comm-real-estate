import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()

  // Create a sample property
  const property = await prisma.property.create({
    data: {
      street_address: '123 Main St',
      city: 'San Francisco',
      zip_code: 94105,
      net_operating_income: 120000,
      price: 1500000,
      return_on_investment: 8,
      owner: 'John Doe',
      number_of_units: 4,
      square_feet: 4000
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 