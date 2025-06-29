import { NextRequest, NextResponse } from 'next/server'
import { ContactService } from '@/lib/services/contact-service'

// PUT /api/owners/[id]/contacts - Update contacts for an owner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { contacts } = body

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'Contacts array is required' },
        { status: 400 }
      )
    }

    const updatedContacts = await ContactService.updateOwnerContacts(id, contacts)
    return NextResponse.json(updatedContacts)
  } catch (error) {
    console.error('API: Error updating contacts:', error)
    
    return NextResponse.json(
      { error: 'Failed to update contacts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET /api/owners/[id]/contacts - Get contacts for an owner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contacts = await ContactService.getContactsByOwner(id)
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('API: Error fetching contacts:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 