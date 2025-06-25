import { NextRequest, NextResponse } from 'next/server'
import { PropertyService } from '@/lib/services/property-service'

// GET: List notes for a property
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = params.id
  if (!propertyId) return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 })
  const notes = await PropertyService.getNotesForProperty(propertyId)
  return NextResponse.json(notes)
}

// POST: Add a note to a property
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = params.id
  const { content } = await req.json()
  if (!propertyId || !content) return NextResponse.json({ error: 'Missing propertyId or content' }, { status: 400 })
  const note = await PropertyService.addNoteToProperty(propertyId, content)
  return NextResponse.json(note)
}

// PUT: Update a note (expects noteId and content in body)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { noteId, content } = await req.json()
  if (!noteId || !content) return NextResponse.json({ error: 'Missing noteId or content' }, { status: 400 })
  const note = await PropertyService.updateNote(noteId, content)
  return NextResponse.json(note)
}

// DELETE: Delete a note (expects noteId in body)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { noteId } = await req.json()
  if (!noteId) return NextResponse.json({ error: 'Missing noteId' }, { status: 400 })
  await PropertyService.deleteNote(noteId)
  return NextResponse.json({ success: true })
} 