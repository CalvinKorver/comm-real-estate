import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data - order matters for foreign key constraints
  await prisma.paceConstraint.deleteMany()  // Delete child tables first
  await prisma.block.deleteMany()
  await prisma.workout.deleteMany()
  await prisma.user.deleteMany()

  // First create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  })

  // Create the workout
  const workout = await prisma.workout.create({
    data: {
      name: 'Complete Training Run',
      isFavorite: true,
      imageName: 'runner',
      userId: user.id,
    },
  })

  // Create warmup block
  const warmupBlock = await prisma.block.create({
    data: {
      blockType: 'WARMUP',
      workoutId: workout.id,
      metricType: 'DISTANCE',
      distance: 1.0,
      distanceUnit: 'MILES',
    },
  })

  // Create rest block first (needed for work block reference)
  const restBlock = await prisma.block.create({
    data: {
      blockType: 'REST',
      workoutId: workout.id,
      metricType: 'TIME',
      duration: 180, // 3 minutes
    },
  })

  // Create work block with rest block reference
  const workBlock = await prisma.block.create({
    data: {
      blockType: 'WORK',
      workoutId: workout.id,
      metricType: 'DISTANCE',
      distance: 3.0,
      distanceUnit: 'MILES',
      repeats: 3,
      restBlockId: restBlock.id,
      paceConstraint: {
        create: {
          duration: 480, // 8 minutes
          unit: 'MILES',
        },
      },
    },
  })

  // Create cooldown block
  const cooldownBlock = await prisma.block.create({
    data: {
      blockType: 'COOLDOWN',
      workoutId: workout.id,
      metricType: 'DISTANCE',
      distance: 1.0,
      distanceUnit: 'MILES',
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