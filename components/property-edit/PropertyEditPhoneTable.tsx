"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { Property, PhoneLabel } from '@/types/property'

interface PhoneNumber {
  id: string
  ownerId: string
  phone: string
  email?: string
  type: string
  label?: PhoneLabel
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
  const [newPhone, setNewPhone] = useState({ phone: '', type: 'Mobile', label: undefined as PhoneLabel | undefined, notes: '' })

  const addPhoneNumber = () => {
    const firstOwner = property.owners?.[0];
    if (!firstOwner) return;
    
    const updatedPhoneNumbers = [...phoneNumbers, {
      id: `temp-${Date.now()}`,
      ownerId: firstOwner.id,
      phone: newPhone.phone,
      type: newPhone.type,
      label: newPhone.label,
      notes: newPhone.notes,
      priority: phoneNumbers.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
    }];
    onPhoneNumbersChange(updatedPhoneNumbers);
    setNewPhone({ phone: '', type: 'Mobile', label: undefined, notes: '' });
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

  const updatePhoneNumber = (index: number, field: keyof PhoneNumber, value: string | PhoneLabel) => {
    const updated = [...phoneNumbers];
    updated[index] = { ...updated[index], [field]: value, updated_at: new Date() };
    onPhoneNumbersChange(updated);
  };

  const phoneLabelOptions = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'husband', label: 'Husband' },
    { value: 'wife', label: 'Wife' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'property_manager', label: 'Property Manager' },
    { value: 'attorney', label: 'Attorney' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'grandson', label: 'Grandson' },
    { value: 'granddaughter', label: 'Granddaughter' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-4">
      {/* Phone Numbers Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow>
              <TableHead className="">Phone</TableHead>
              <TableHead className="">Label</TableHead>
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
                      <Select
                        value={phone.label || ''}
                        onValueChange={(value) => updatePhoneNumber(index, 'label', value as PhoneLabel)}
                        disabled={isMarkedForDeletion}
                      >
                        <SelectTrigger className="w-full border-0 p-0 bg-transparent">
                          <SelectValue placeholder="Select label" />
                        </SelectTrigger>
                        <SelectContent>
                          {phoneLabelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            {/* Add New Phone Row */}
            <TableRow>
              <TableCell className="p-3">
                <Input
                  value={newPhone.phone}
                  onChange={(e) => setNewPhone({ ...newPhone, phone: e.target.value })}
                  placeholder="New phone number"
                  className="border-0 p-0 bg-transparent"
                />
              </TableCell>
              <TableCell className="p-3">
                <Select
                  value={newPhone.label || ''}
                  onValueChange={(value) => setNewPhone({ ...newPhone, label: value as PhoneLabel })}
                >
                  <SelectTrigger className="w-full border-0 p-0 bg-transparent">
                    <SelectValue placeholder="Select label" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneLabelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-3">
                <Input
                  value={newPhone.notes}
                  onChange={(e) => setNewPhone({ ...newPhone, notes: e.target.value })}
                  placeholder="Notes"
                  className="border-0 p-0 bg-transparent"
                />
              </TableCell>
              <TableCell className="p-3">
                <Button 
                  type="button" 
                  onClick={addPhoneNumber} 
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