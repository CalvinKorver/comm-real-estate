import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/owners/[id] - Get an owner and their properties
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ownerId } = await params
    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 })
    }
    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        properties: true,
      },
    })
    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }
    return NextResponse.json(owner)
  } catch (error) {
    console.error('API: Error fetching owner with properties:', error)
    return NextResponse.json({ error: 'Failed to fetch owner with properties', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 