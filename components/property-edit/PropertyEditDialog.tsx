"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Property } from '@/types/property'
import { PropertyEditPhoneTable } from './PropertyEditPhoneTable'
import { PropertyEditNoteTable } from './PropertyEditNoteTable'

interface PropertyEditDialogProps {
  property: Property
  open: boolean
  onOpenChange: (open: boolean) => void
  onPropertyUpdated?: (updatedProperty: Property) => void
}

interface PhoneNumber {
  id: string
  ownerId: string
  phone: string
  email?: string
  type: string
  priority: number
  notes?: string
  created_at: Date
  updated_at: Date
}

interface Note {
  id: string
  content: string
  created_at: string | Date
  updated_at: string | Date
}

export function PropertyEditDialog({ 
  property, 
  open, 
  onOpenChange, 
  onPropertyUpdated 
}: PropertyEditDialogProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(
    property.owners?.flatMap(owner => 
      owner.contacts?.map(contact => ({
        id: contact.id,
        ownerId: contact.owner_id,
        phone: contact.phone || '',
        email: contact.email || '',
        type: contact.type,
        priority: contact.priority,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
      })) || []
    ) || []
  )
  
  const [notes, setNotes] = useState<Note[]>(
    property.notes?.map(note => ({
      id: note.id,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
    })) || []
  )
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const phoneData = phoneNumbers.map(phone => ({
        id: phone.id,
        ownerId: phone.ownerId,
        phone: phone.phone,
        type: phone.type,
        priority: phone.priority,
        notes: phone.notes,
        created_at: phone.created_at,
        updated_at: phone.updated_at
      }));

      // Update contacts for each owner
      for (const owner of property.owners || []) {
        const ownerPhones = phoneData.filter(p => p.ownerId === owner.id)
        if (ownerPhones.length > 0) {
          await fetch(`/api/owners/${owner.id}/contacts`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contacts: ownerPhones })
          })
        }
      }

      // Update property notes if any
      if (notes.length > 0) {
        const newNotes = notes.filter(note => note.id.startsWith('temp-'))
        for (const note of newNotes) {
          await fetch(`/api/properties`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              id: property.id, 
              note: note.content 
            })
          })
        }
      }

      // Fetch updated property
      const response = await fetch(`/api/properties?id=${property.id}`)
      const updatedProperty = await response.json()
      
      onPropertyUpdated?.(updatedProperty)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-h-[90vh] overflow-y-auto md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>{property.street_address}</DialogTitle>
          <DialogDescription>
          {property.city}, {property.zip_code}
          
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Property Address and Owners Section */}
          <div>
          <Label className="text-base font-semibold pb-2">Owners</Label>
            {/* Enhanced Owner Display */}
            <div>
              {property.owners && property.owners.length > 0 ? (
                <div className="space-y-1">
                  {property.owners.length === 1 ? (
                        <p>{`${property.owners[0].first_name} ${property.owners[0].last_name}`}</p>
                  ) : (
                    <div className="space-y-4">
                      {property.owners.map((owner) => (
                        <div key={owner.id}>
                          <p>{`${owner.first_name} ${owner.last_name}`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No owners</p>
              )}
            </div>
          </div>

          {/* Phone Numbers Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Phone Numbers</Label>
            <PropertyEditPhoneTable
              property={property}
              phoneNumbers={phoneNumbers}
              onPhoneNumbersChange={setPhoneNumbers}
            />
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Notes</Label>
            <PropertyEditNoteTable
              notes={notes}
              onNotesChange={setNotes}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 