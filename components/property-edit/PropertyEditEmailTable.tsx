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

interface EmailContact {
  id: string
  ownerId: string
  email: string
  phone?: string
  type: string
  label?: PhoneLabel
  priority: number
  notes?: string
  created_at: Date
  updated_at: Date
}

interface PropertyEditEmailTableProps {
  property: Property
  emailContacts: EmailContact[]
  onEmailContactsChange: (emailContacts: EmailContact[]) => void
}

export function PropertyEditEmailTable({ 
  property, 
  emailContacts, 
  onEmailContactsChange 
}: PropertyEditEmailTableProps) {
  const [newEmail, setNewEmail] = useState({ email: '', type: 'Email', label: undefined as PhoneLabel | undefined, notes: '' })

  const addEmailContact = () => {
    const firstOwner = property.owners?.[0];
    if (!firstOwner) return;
    
    const updatedEmailContacts = [...emailContacts, {
      id: `temp-${Date.now()}`,
      ownerId: firstOwner.id,
      email: newEmail.email,
      type: newEmail.type,
      label: newEmail.label,
      notes: newEmail.notes,
      priority: emailContacts.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
    }];
    onEmailContactsChange(updatedEmailContacts);
    setNewEmail({ email: '', type: 'Email', label: undefined, notes: '' });
  };

  const removeEmailContact = (index: number) => {
    const emailToRemove = emailContacts[index];
    if (emailToRemove.id.startsWith('temp-')) {
      // If it's a temporary email contact, just remove it from state
      onEmailContactsChange(emailContacts.filter((_, i) => i !== index));
    } else {
      // If it's an existing email contact, mark it for deletion
      const updated = [...emailContacts];
      updated[index] = { ...updated[index], email: '', type: 'deleted' };
      onEmailContactsChange(updated);
    }
  };

  const updateEmailContact = (index: number, field: keyof EmailContact, value: string | PhoneLabel) => {
    const updated = [...emailContacts];
    updated[index] = { ...updated[index], [field]: value, updated_at: new Date() };
    onEmailContactsChange(updated);
  };

  const emailLabelOptions = [
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
      {/* Email Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow>
              <TableHead className="">Email</TableHead>
              <TableHead className="">Label</TableHead>
              <TableHead className="">Notes</TableHead>
              <TableHead className="">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailContacts.filter(contact => contact.email && contact.email.trim() !== '').length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No email addresses
                </TableCell>
              </TableRow>
            ) : (
              emailContacts.filter(contact => contact.email && contact.email.trim() !== '').map((contact, index) => {
                const isMarkedForDeletion = contact.type === 'deleted';
                
                return (
                  <TableRow key={contact.id || index}>
                    <TableCell className="p-3">
                      {contact.email}
                    </TableCell>
                    <TableCell className="p-3">
                      <Select
                        value={contact.label || ''}
                        onValueChange={(value) => updateEmailContact(emailContacts.indexOf(contact), 'label', value as PhoneLabel)}
                        disabled={isMarkedForDeletion}
                      >
                        <SelectTrigger className="w-full border-0 p-0 bg-transparent">
                          <SelectValue placeholder="Select label" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailLabelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-3">
                      <Input
                        value={contact.notes || ''}
                        onChange={(e) => updateEmailContact(emailContacts.indexOf(contact), 'notes', e.target.value)}
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
                        onClick={() => removeEmailContact(emailContacts.indexOf(contact))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {/* Add New Email Row */}
            <TableRow>
              <TableCell className="p-3">
                <Input
                  value={newEmail.email}
                  onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                  placeholder="New email address"
                  className="border-0 p-0 bg-transparent"
                  type="email"
                />
              </TableCell>
              <TableCell className="p-3">
                <Select
                  value={newEmail.label || ''}
                  onValueChange={(value) => setNewEmail({ ...newEmail, label: value as PhoneLabel })}
                >
                  <SelectTrigger className="w-full border-0 p-0 bg-transparent">
                    <SelectValue placeholder="Select label" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailLabelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-3">
                <Input
                  value={newEmail.notes}
                  onChange={(e) => setNewEmail({ ...newEmail, notes: e.target.value })}
                  placeholder="Notes"
                  className="border-0 p-0 bg-transparent"
                />
              </TableCell>
              <TableCell className="p-3">
                <Button 
                  type="button" 
                  onClick={addEmailContact} 
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