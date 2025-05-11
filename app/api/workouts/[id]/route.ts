import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { isActive } = body

    const workout = await prisma.workout.update({
      where: { id },
      data: { isActive },
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

    return NextResponse.json(workout)
  } catch (error) {
    console.error('API: Error updating workout:', error)
    return NextResponse.json(
      { error: 'Failed to update workout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 