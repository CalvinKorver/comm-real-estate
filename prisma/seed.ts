import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()

  const owner1 = await prisma.owner.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      streetAddress: '123 Main St',
      city: 'San Francisco',
      zipCode: '94105',
      phoneNumber: '415-555-0123',
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      streetAddress: '456 Market St',
      city: 'San Francisco',
      zipCode: '94103',
      phoneNumber: '415-555-0124',
    },
  });

  const owner3 = await prisma.owner.create({
    data: {
      firstName: 'Michael',
      lastName: 'Brown',
      streetAddress: '789 Mission St',
      city: 'San Francisco',
      zipCode: '94107',
      phoneNumber: '415-555-0125',
    },
  });

  // Create a sample property
  const property = await prisma.property.create({
    data: {
      street_address: '1400 N 95th Street',
      city: 'Seattle',
      zip_code: 94105,
      net_operating_income: 120000,
      price: 1500000,
      return_on_investment: 8,
      number_of_units: 4,
      square_feet: 4200,
      owners: {
        connect: [
          { id: owner1.id },
          { id: owner2.id },
          { id: owner3.id },
        ],
      },
      images: {
        create: [
          { url: '/p1-1.jpg', alt: 'Property Main Image', order: 0 },
          { url: '/p1-2.jpg', alt: 'Property Image 2', order: 1 },
          { url: '/p1-3.jpg', alt: 'Property Image 3', order: 2 },
          { url: '/p1-4.jpg', alt: 'Property Image 4', order: 3 },
          { url: '/p1-5.jpg', alt: 'Property Image 5', order: 4 },
          { url: '/p1-6.jpg', alt: 'Property Image 6', order: 5 },
        ],
      },
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