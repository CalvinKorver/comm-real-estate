import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import { type NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // First delete all related entities - blocks and their related data
    await prisma.$transaction(async (tx) => {
      // Get all blocks for this workout
      const blocks = await tx.block.findMany({
        where: { workoutId: id },
        select: { id: true }
      });
      
      const blockIds = blocks.map(block => block.id);
      
      // Delete pace constraints
      await tx.paceConstraint.deleteMany({
        where: { blockId: { in: blockIds } }
      });
      
      // Delete blocks
      await tx.block.deleteMany({
        where: { workoutId: id }
      });
      
      // Finally delete the workout
      await tx.workout.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API: Error deleting workout:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 