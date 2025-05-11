import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { BlockType, MetricType, DistanceUnit } from '@/types/workout'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('API: Fetching workouts from database')
    const workouts = await prisma.workout.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        blocks: {
          include: {
            paceConstraint: true,
            restBlock: true,
            workBlocks: true
          }
        }
      }
    })
    
    console.log('API: Successfully fetched workouts:', workouts.length)
    console.log('API: Sample work block data:', JSON.stringify(workouts[0]?.blocks?.find(b => b.blockType === 'WORK'), null, 2))
    return NextResponse.json(workouts)
  } catch (error) {
    console.error('API: Error fetching workouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workouts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, blocks, userId, imageName = 'runner' } = body

    // Validate required fields
    if (!name || !blocks || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, blocks, and userId are required' },
        { status: 400 }
      )
    }

    // Create the workout with its blocks in a transaction
    const workout = await prisma.$transaction(async (tx) => {
      // Create the workout
      const workout = await tx.workout.create({
        data: {
          name,
          imageName,
          userId,
          isFavorite: false,
          isActive: true,
        },
      })

      // Create blocks in sequence to handle dependencies
      for (const block of blocks) {
        const { blockType, metricType, distance, distanceUnit, duration, repeats, paceConstraint } = block

        // Create the block
        const createdBlock = await tx.block.create({
          data: {
            blockType,
            workoutId: workout.id,
            metricType,
            distance,
            distanceUnit,
            duration,
            repeats,
          },
        })

        // If there's a pace constraint, create it
        if (paceConstraint) {
          await tx.paceConstraint.create({
            data: {
              duration: paceConstraint.duration,
              unit: paceConstraint.unit,
              blockId: createdBlock.id,
            },
          })
        }
      }

      // Return the created workout with its blocks
      return tx.workout.findUnique({
        where: { id: workout.id },
        include: {
          blocks: {
            include: {
              paceConstraint: true,
              restBlock: true,
              workBlocks: true,
            },
          },
        },
      })
    })

    return NextResponse.json(workout)
  } catch (error) {
    console.error('API: Error creating workout:', error)
    return NextResponse.json(
      { error: 'Failed to create workout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 