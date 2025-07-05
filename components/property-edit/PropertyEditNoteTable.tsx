"use client"

import { BasePropertyEditTable } from './BasePropertyEditTable'
import { textareaRenderer, dateRenderer } from './tableRenderers'
import type { NoteTableItem, TableConfig } from '@/types/tableConfig'

interface Note extends NoteTableItem {
  content: string
}

interface PropertyEditNoteTableProps {
  notes: Note[]
  onNotesChange: (notes: Note[]) => void
}

export function PropertyEditNoteTable({ 
  notes, 
  onNotesChange 
}: PropertyEditNoteTableProps) {
  
  const noteTableConfig: TableConfig<Note> = {
    columns: [
      {
        key: 'content',
        header: 'Content',
        width: '65%',
        renderer: textareaRenderer('content', 'Add a new note...', 3),
        editable: true,
        required: true,
      },
      {
        key: 'created_at',
        header: 'Date',
        width: '25%',
        renderer: dateRenderer('created_at'),
        editable: false,
      },
      {
        key: 'actions',
        header: 'Actions',
        width: '10%',
        renderer: () => null, // Actions are handled by base component
        editable: false,
      },
    ],
    createNewItem: () => ({
      id: '',
      content: '',
      type: 'note',
      priority: 0,
      notes: '',
      created_at: new Date(),
      updated_at: new Date(),
    }),
    validateNewItem: (item) => Boolean(item.content && item.content.trim()),
  }

  return (
    <BasePropertyEditTable
      items={notes}
      onItemsChange={onNotesChange}
      config={noteTableConfig}
    />
  )
}