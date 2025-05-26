import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import { type NextRequest } from 'next/server'
import { MetricType } from '@/types/workout'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { metricType, duration } = body

    // Validate metricType
    if (metricType && !Object.values(MetricType).includes(metricType)) {
      return NextResponse.json(
        { error: 'Invalid metricType value' },
        { status: 400 }
      )
    }

    // Build data object for update
    const updateData: any = {};
    
    if (metricType !== undefined) {
      updateData.metricType = metricType;
    }
    
    if (duration !== undefined) {
      // Make sure duration is a number (in seconds)
      updateData.duration = typeof duration === 'number' ? Math.round(duration) : 0;
    }

    const block = await prisma.block.update({
      where: { id },
      data: updateData,
      include: {
        paceConstraint: true,
        restBlock: true,
        workBlocks: true,
      },
    })

    return NextResponse.json(block)
  } catch (error) {
    console.error('API: Error updating block:', error)
    return NextResponse.json(
      { error: 'Failed to update block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 