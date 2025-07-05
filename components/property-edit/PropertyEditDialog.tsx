"use client"

import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import type { Property, PhoneLabel } from '@/types/property'
import { PropertyEditPhoneTable } from './PropertyEditPhoneTable'
import { PropertyEditEmailTable } from './PropertyEditEmailTable'
import { PropertyEditNoteTable } from './PropertyEditNoteTable'
import { sortContactsByPriority } from '@/utils/contactSorting'

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
  label?: PhoneLabel
  priority: number
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

interface EmailContact {
  id: string
  ownerId: string
  email: string
  phone?: string
  type: string
  label?: PhoneLabel
  priority: number
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

interface Note {
  id: string
  content: string
  type: string
  priority: number
  notes?: string
  created_at: string | Date
  updated_at: string | Date
}

export function PropertyEditDialog({ 
  property, 
  open, 
  onOpenChange, 
  onPropertyUpdated 
}: PropertyEditDialogProps) {
  console.log(property)
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(
    sortContactsByPriority(
      property.owners?.flatMap(owner => 
        owner.contacts?.filter(contact => contact.phone && contact.phone.trim() !== '').map(contact => ({
          id: contact.id,
          ownerId: contact.owner_id,
          phone: contact.phone || '',
          email: contact.email || '',
          type: contact.type,
          label: contact.label,
          priority: contact.priority,
          notes: contact.notes,
          created_at: contact.created_at,
          updated_at: contact.updated_at,
        })) || []
      ) || []
    )
  )
  
  const [emailContacts, setEmailContacts] = useState<EmailContact[]>(
    sortContactsByPriority(
      property.owners?.flatMap(owner => 
        owner.contacts?.filter(contact => contact.email && contact.email.trim() !== '').map(contact => ({
          id: contact.id,
          ownerId: contact.owner_id,
          email: contact.email || '',
          phone: contact.phone || '',
          type: contact.type,
          label: contact.label,
          priority: contact.priority,
          notes: contact.notes,
          created_at: contact.created_at,
          updated_at: contact.updated_at,
        })) || []
      ) || []
    )
  )
  
  const [notes, setNotes] = useState<Note[]>(
    property.notes?.map(note => ({
      id: note.id,
      content: note.content,
      type: 'note',
      priority: 0,
      notes: '',
      created_at: note.created_at,
      updated_at: note.updated_at,
    })) || []
  )
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalProperty, setOriginalProperty] = useState<Property>(property)

  // Update state when property changes
  useEffect(() => {
    if (property.id !== originalProperty.id) {
      setOriginalProperty(property)
      setPhoneNumbers(
        sortContactsByPriority(
          property.owners?.flatMap(owner => 
            owner.contacts?.filter(contact => contact.phone && contact.phone.trim() !== '').map(contact => ({
              id: contact.id,
              ownerId: contact.owner_id,
              phone: contact.phone || '',
              email: contact.email || '',
              type: contact.type,
              label: contact.label,
              priority: contact.priority,
              notes: contact.notes,
              created_at: contact.created_at,
              updated_at: contact.updated_at,
            })) || []
          ) || []
        )
      )
      setEmailContacts(
        sortContactsByPriority(
          property.owners?.flatMap(owner => 
            owner.contacts?.filter(contact => contact.email && contact.email.trim() !== '').map(contact => ({
              id: contact.id,
              ownerId: contact.owner_id,
              email: contact.email || '',
              phone: contact.phone || '',
              type: contact.type,
              label: contact.label,
              priority: contact.priority,
              notes: contact.notes,
              created_at: contact.created_at,
              updated_at: contact.updated_at,
            })) || []
          ) || []
        )
      )
      setNotes(
        property.notes?.map(note => ({
          id: note.id,
          content: note.content,
          type: 'note',
          priority: 0,
          notes: '',
          created_at: note.created_at,
          updated_at: note.updated_at,
        })) || []
      )
    }
  }, [property, originalProperty.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare contacts data with actions
      const contactsData = property.owners?.map(owner => {
        const ownerPhones = phoneNumbers.filter(p => p.ownerId === owner.id)
        const ownerEmails = emailContacts.filter(e => e.ownerId === owner.id)
        
        const allContacts = [...ownerPhones, ...ownerEmails]
        
        return {
          ownerId: owner.id,
          contacts: allContacts.map(contact => {
            const originalContact = owner.contacts?.find(c => c.id === contact.id)
            if (!originalContact) {
              // New contact
              return {
                id: contact.id,
                phone: 'phone' in contact ? contact.phone : '',
                email: 'email' in contact ? contact.email : '',
                type: contact.type,
                label: contact.label,
                priority: contact.priority,
                notes: contact.notes,
                action: 'create' as const
              }
            } else {
              // Check if contact was modified
              const isModified = 
                ('phone' in contact ? contact.phone !== originalContact.phone : false) ||
                ('email' in contact ? contact.email !== originalContact.email : false) ||
                contact.type !== originalContact.type ||
                contact.label !== originalContact.label ||
                contact.priority !== originalContact.priority ||
                contact.notes !== originalContact.notes
              
              if (isModified) {
                return {
                  id: contact.id,
                  phone: 'phone' in contact ? contact.phone : originalContact.phone,
                  email: 'email' in contact ? contact.email : originalContact.email,
                  type: contact.type,
                  label: contact.label,
                  priority: contact.priority,
                  notes: contact.notes,
                  action: 'update' as const
                }
              }
              return null
            }
          }).filter(Boolean)
        }
      }).filter(owner => owner.contacts.length > 0) || []

      // Prepare notes data with actions
      const originalNotes = property.notes || []
      const notesData = notes.map(note => {
        const originalNote = originalNotes.find(n => n.id === note.id)
        if (!originalNote) {
          // New note
          return {
            id: note.id,
            content: note.content,
            action: 'create' as const
          }
        } else {
          // Check if note was modified
          if (note.content !== originalNote.content) {
            return {
              id: note.id,
              content: note.content,
              action: 'update' as const
            }
          }
          return null
        }
      }).filter(Boolean)

      // Check if there are any changes
      if (contactsData.length === 0 && notesData.length === 0) {
        toast.info('No changes to save')
        onOpenChange(false)
        return
      }

      // Optimistic update - immediately update the UI
      const optimisticProperty = {
        ...property,
        owners: property.owners?.map(owner => {
          const ownerPhones = phoneNumbers.filter(p => p.ownerId === owner.id)
          const ownerEmails = emailContacts.filter(e => e.ownerId === owner.id)
          
          const allContacts = [...ownerPhones, ...ownerEmails]
          
          return {
            ...owner,
            contacts: allContacts.map(contact => ({
              id: contact.id,
              phone: 'phone' in contact ? contact.phone : '',
              email: 'email' in contact ? contact.email : '',
              type: contact.type,
              label: contact.label,
              priority: contact.priority,
              notes: contact.notes,
              owner_id: contact.ownerId,
              created_at: new Date(contact.created_at),
              updated_at: new Date()
            }))
          }
        }),
        notes: notes.map(note => ({
          id: note.id,
          content: note.content,
          property_id: property.id,
          created_at: new Date(note.created_at),
          updated_at: new Date()
        }))
      }

      // Call optimistic update callback immediately
      onPropertyUpdated?.(optimisticProperty)

      // Single API call to update everything
      const response = await fetch(`/api/properties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: property.id,
          contacts: contactsData,
          notes: notesData
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update property: ${response.statusText}`)
      }

      const updatedProperty = await response.json()
      
      // Update with the actual server response
      onPropertyUpdated?.(updatedProperty)
      toast.success('Property updated successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating property:', error)
      
      // Revert optimistic update on error
      onPropertyUpdated?.(originalProperty)
      
      toast.error('Failed to update property. Please try again.')
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

          {/* Email Addresses Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Email Addresses</Label>
            <PropertyEditEmailTable
              property={property}
              emailContacts={emailContacts}
              onEmailContactsChange={setEmailContacts}
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