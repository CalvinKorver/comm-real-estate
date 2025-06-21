import { NextRequest, NextResponse } from 'next/server'
import { OwnerService } from '@/lib/services/owner-service'

// GET /api/owners/[id] - Get an owner and their properties
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ownerId } = await params
    
    try {
      const owner = await OwnerService.getOwnerWithProperties(ownerId)
      return NextResponse.json(owner)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Owner ID is required') {
          return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 })
        }
        if (error.message === 'Owner not found') {
          return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
        }
      }
      throw error
    }
  } catch (error) {
    console.error('API: Error fetching owner with properties:', error)
    return NextResponse.json({ error: 'Failed to fetch owner with properties', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 