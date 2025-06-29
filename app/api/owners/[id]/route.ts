import { NextRequest, NextResponse } from 'next/server'
import { OwnerService } from '@/lib/services/owner-service'

// GET /api/owners/[id] - Get a specific owner
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const owner = await OwnerService.getOwnerById(params.id)
    return NextResponse.json(owner)
  } catch (error) {
    console.error('API: Error fetching owner:', error)
    
    if (error instanceof Error && error.message === 'Owner not found') {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch owner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/owners/[id] - Update an owner
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const owner = await OwnerService.updateOwner(params.id, body)
    return NextResponse.json(owner)
  } catch (error) {
    console.error('API: Error updating owner:', error)
    
    if (error instanceof Error && error.message === 'Owner not found') {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update owner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/owners/[id] - Delete an owner
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await OwnerService.deleteOwner(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Error deleting owner:', error)
    
    if (error instanceof Error && error.message === 'Owner not found') {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete owner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 