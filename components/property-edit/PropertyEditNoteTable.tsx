"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

interface Note {
  id: string
  content: string
  created_at: string | Date
  updated_at: string | Date
}

interface PropertyEditNoteTableProps {
  notes: Note[]
  onNotesChange: (notes: Note[]) => void
}

export function PropertyEditNoteTable({ 
  notes, 
  onNotesChange 
}: PropertyEditNoteTableProps) {
  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    if (newNote.trim()) {
      const now = new Date()
      const updatedNotes = [...notes, { 
        id: `temp-${Date.now()}`, 
        content: newNote, 
        created_at: now,
        updated_at: now
      }]
      onNotesChange(updatedNotes)
      setNewNote('')
    }
  }

  const handleRemoveNote = (index: number) => {
    onNotesChange(notes.filter((_, i) => i !== index))
  }

  const updateNote = (index: number, content: string) => {
    const updated = [...notes]
    updated[index].content = content
    updated[index].updated_at = new Date()
    onNotesChange(updated)
  }

  const formatNoteDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const isNewNote = (note: Note) => {
    return note.id.startsWith('temp-')
  }

  return (
    <div className="space-y-4">
      {/* Notes Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow>
              <TableHead className="">Content</TableHead>
              <TableHead className="">Date</TableHead>
              <TableHead className="">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No notes
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note, index) => {
                const isNew = isNewNote(note)
                
                return (
                  <TableRow key={note.id || index}>
                    <TableCell className="p-3">
                      {isNew ? (
                        <Textarea
                          value={note.content}
                          onChange={(e) => updateNote(index, e.target.value)}
                          placeholder="Note content"
                          className="border-0 p-0 bg-transparent resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">
                          {note.content}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-3">
                      {note.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {formatNoteDate(note.created_at)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="p-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNote(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
            {/* Add New Note Row */}
            <TableRow>
              <TableCell className="p-3">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a new note..."
                  className="border-0 p-0 bg-transparent resize-none"
                  rows={3}
                />
              </TableCell>
              <TableCell className="p-3">
                {/* Empty cell for date column */}
              </TableCell>
              <TableCell className="p-3">
                <Button 
                  type="button" 
                  onClick={handleAddNote} 
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 