"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { Property } from '@/types/property'

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

interface PropertyEditPhoneTableProps {
  property: Property
  phoneNumbers: PhoneNumber[]
  onPhoneNumbersChange: (phoneNumbers: PhoneNumber[]) => void
}

export function PropertyEditPhoneTable({ 
  property, 
  phoneNumbers, 
  onPhoneNumbersChange 
}: PropertyEditPhoneTableProps) {
  const [newPhone, setNewPhone] = useState({ phone: '', type: 'Mobile', notes: '' })

  const addPhoneNumber = () => {
    const firstOwner = property.owners?.[0];
    if (!firstOwner) return;
    
    const updatedPhoneNumbers = [...phoneNumbers, {
      id: `temp-${Date.now()}`,
      ownerId: firstOwner.id,
      phone: newPhone.phone,
      type: newPhone.type,
      notes: newPhone.notes,
      priority: phoneNumbers.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
    }];
    onPhoneNumbersChange(updatedPhoneNumbers);
    setNewPhone({ phone: '', type: 'Mobile', notes: '' });
  };

  const removePhoneNumber = (index: number) => {
    const phoneToRemove = phoneNumbers[index];
    if (phoneToRemove.id.startsWith('temp-')) {
      // If it's a temporary phone number, just remove it from state
      onPhoneNumbersChange(phoneNumbers.filter((_, i) => i !== index));
    } else {
      // If it's an existing phone number, mark it for deletion
      const updated = [...phoneNumbers];
      updated[index] = { ...updated[index], phone: '', type: 'deleted' };
      onPhoneNumbersChange(updated);
    }
  };

  const updatePhoneNumber = (index: number, field: keyof PhoneNumber, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = { ...updated[index], [field]: value, updated_at: new Date() };
    onPhoneNumbersChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Phone Numbers Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow>
              <TableHead className="">Phone</TableHead>
              <TableHead className="">Type</TableHead>
              <TableHead className="">Notes</TableHead>
              <TableHead className="">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phoneNumbers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No phone numbers
                </TableCell>
              </TableRow>
            ) : (
              phoneNumbers.map((phone, index) => {
                const isMarkedForDeletion = phone.type === 'deleted';
                
                return (
                  <TableRow key={phone.id || index}>
                    <TableCell className="p-3">
                      {phone.phone}
                    </TableCell>
                    <TableCell className="p-3">
                      {phone.type}
                      {/* <Input
                        value={phone.type}
                        onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
                        placeholder="Type"
                        className="border-0 p-0 bg-transparent w-24"
                        disabled={isMarkedForDeletion}
                      /> */}
                    </TableCell>
                    <TableCell className="p-3">
                      <Input
                        value={phone.notes || ''}
                        onChange={(e) => updatePhoneNumber(index, 'notes', e.target.value)}
                        placeholder="Notes"
                        className="border-0 p-0 bg-transparent"
                        disabled={isMarkedForDeletion}
                      />
                    </TableCell>
                    <TableCell className="p-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoneNumber(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
        <Input
          value={newPhone.notes}
          onChange={(e) => setNewPhone({ ...newPhone, notes: e.target.value })}
          placeholder="Notes"
          className="flex-1"
        />
        <Button type="button" onClick={addPhoneNumber} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>
    </div>
  )
} 