"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, X } from 'lucide-react'
import type { Property, Note as PropertyNote, Contact } from '@/types/property'

interface PropertyEditDialogProps {
  property: Property
  open: boolean
  onOpenChange: (open: boolean) => void
  onPropertyUpdated?: (updatedProperty: Property) => void
}

interface PhoneNumber {
  id?: string
  phone: string
  type: string
  ownerId?: string
  priority?: number
  createdAt?: Date
  updatedAt?: Date
  action?: 'create' | 'update' | 'delete'
}

interface Note {
  id: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
}

export function PropertyEditDialog({ 
  property, 
  open, 
  onOpenChange, 
  onPropertyUpdated 
}: PropertyEditDialogProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(
    property.owners?.flatMap(owner => 
      owner.contacts?.filter(c => c.phone).map(contact => ({
        id: contact.id,
        phone: contact.phone || '',
        type: contact.type,
        ownerId: owner.id,
        priority: contact.priority,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      })) || []
    ) || []
  )
  
  const [notes, setNotes] = useState<PropertyNote[]>(
    property.notes?.map(note => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    })) || []
  )
  
  const [newPhone, setNewPhone] = useState({ phone: '', type: 'Mobile' })
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddPhone = () => {
    if (newPhone.phone.trim()) {
      // Add to the first owner if available, otherwise create a placeholder
      const firstOwner = property.owners?.[0]
      setPhoneNumbers([...phoneNumbers, { 
        ...newPhone, 
        id: `temp-${Date.now()}`,
        ownerId: firstOwner?.id,
        priority: phoneNumbers.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        action: 'create'
      }])
      setNewPhone({ phone: '', type: 'Mobile' })
    }
  }

  const handleRemovePhone = (index: number) => {
    const phoneToRemove = phoneNumbers[index]
    if (phoneToRemove.id && !phoneToRemove.id.startsWith('temp-')) {
      // Mark existing phone for deletion
      const updated = [...phoneNumbers]
      updated[index] = { ...phoneToRemove, action: 'delete' }
      setPhoneNumbers(updated)
    } else {
      // Remove temporary phone
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const now = new Date()
      setNotes([...notes, { 
        id: `temp-${Date.now()}`, 
        content: newNote, 
        createdAt: now,
        updatedAt: now
      }])
      setNewNote('')
    }
  }

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Update contacts for each owner
      for (const owner of property.owners || []) {
        const ownerPhones = phoneNumbers.filter(p => p.ownerId === owner.id)
        if (ownerPhones.length > 0) {
          const contactsToUpdate = ownerPhones.map(phone => ({
            id: phone.id,
            phone: phone.phone,
            email: undefined,
            type: phone.type,
            priority: phone.priority || 1,
            action: phone.action || (phone.id?.startsWith('temp-') ? 'create' : 'update')
          }))

          await fetch(`/api/owners/${owner.id}/contacts`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contacts: contactsToUpdate })
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
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update phone numbers and notes for this property
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Property Address and Owners Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-bold text-foreground text-lg">
                {property.street_address}
              </h3>
              <p className="text-sm text-muted-foreground">
                {property.city}, {property.zip_code}
              </p>
            </div>
            
            {/* Enhanced Owner Display */}
            <div>
              {property.owners && property.owners.length > 0 ? (
                <div className="space-y-1">
                  {property.owners.length === 1 ? (
                    <p className="text-sm text-foreground font-semibold">
                      {property.owners[0].firstName} {property.owners[0].lastName}
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground font-semibold">
                        {property.owners.length} Owners
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {property.owners.slice(0, 2).map((owner, idx) => (
                          <div key={owner.id}>
                            {owner.firstName} {owner.lastName}
                            {idx === 0 && property.owners && property.owners.length > 2 && ' + more...'}
                          </div>
                        ))}
                      </div>
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
            
            {/* Phone Numbers Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Phone</th>
                    <th className="text-left p-3 text-sm font-medium">Owner</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {phoneNumbers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted-foreground">
                        No phone numbers
                      </td>
                    </tr>
                  ) : (
                    phoneNumbers.map((phone, index) => {
                      // Find the owner for this contact
                      const owner = property.owners?.find(o => o.id === phone.ownerId);
                      const isMarkedForDeletion = phone.action === 'delete';
                      
                      return (
                        <tr key={phone.id || index} className={`border-t ${isMarkedForDeletion ? 'bg-red-50' : ''}`}>
                          <td className="p-3">
                            <Input
                              value={phone.phone}
                              onChange={(e) => {
                                const updated = [...phoneNumbers]
                                updated[index].phone = e.target.value
                                if (!updated[index].action && !updated[index].id?.startsWith('temp-')) {
                                  updated[index].action = 'update'
                                }
                                setPhoneNumbers(updated)
                              }}
                              placeholder="Phone number"
                              className="border-0 p-0 bg-transparent"
                              disabled={isMarkedForDeletion}
                            />
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}
                          </td>
                          <td className="p-3">
                            <Input
                              value={phone.type}
                              onChange={(e) => {
                                const updated = [...phoneNumbers]
                                updated[index].type = e.target.value
                                if (!updated[index].action && !updated[index].id?.startsWith('temp-')) {
                                  updated[index].action = 'update'
                                }
                                setPhoneNumbers(updated)
                              }}
                              placeholder="Type"
                              className="border-0 p-0 bg-transparent w-24"
                              disabled={isMarkedForDeletion}
                            />
                          </td>
                          <td className="p-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePhone(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Add New Phone Number */}
            <div className="flex items-center gap-2">
              <Input
                value={newPhone.phone}
                onChange={(e) => setNewPhone({ ...newPhone, phone: e.target.value })}
                placeholder="New phone number"
                className="flex-1"
              />
              <Input
                value={newPhone.type}
                onChange={(e) => setNewPhone({ ...newPhone, type: e.target.value })}
                placeholder="Type"
                className="w-24"
              />
              <Button type="button" onClick={handleAddPhone} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Notes</Label>
            
            {/* Existing Notes */}
            {notes.length > 0 && (
              <div className="space-y-2">
                {notes.map((note, index) => (
                  <div key={note.id || index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Textarea
                        value={note.content}
                        onChange={(e) => {
                          const updated = [...notes]
                          updated[index].content = e.target.value
                          setNotes(updated)
                        }}
                        placeholder="Note content"
                        className="flex-1"
                        rows={3}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNote(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {note.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Note */}
            <div className="space-y-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                rows={3}
              />
              <Button type="button" onClick={handleAddNote} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
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