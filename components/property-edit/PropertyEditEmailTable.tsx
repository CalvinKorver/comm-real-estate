"use client"

import { BasePropertyEditTable } from './BasePropertyEditTable'
import { textRenderer, selectRenderer, labelOptions } from './tableRenderers'
import type { Property, PhoneLabel } from '@/types/property'
import type { EmailTableItem, TableConfig } from '@/types/tableConfig'

interface EmailContact extends EmailTableItem {
  ownerId: string
  email: string
  phone?: string
  label?: PhoneLabel
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
  
  const emailTableConfig: TableConfig<EmailContact> = {
    columns: [
      {
        key: 'email',
        header: 'Email',
        width: '25%',
        renderer: textRenderer('email', 'New email address', 'email'),
        editable: true,
        required: true,
      },
      {
        key: 'label',
        header: 'Label',
        width: '20%',
        renderer: selectRenderer('label', labelOptions, 'Select label'),
        editable: true,
      },
      {
        key: 'notes',
        header: 'Notes',
        width: '45%',
        renderer: textRenderer('notes', 'Notes'),
        editable: true,
      },
      {
        key: 'actions',
        header: 'Actions',
        width: '10%',
        renderer: () => null, // Actions are handled by base component
        editable: false,
      },
    ],
    filterFn: (contact) => contact.email && contact.email.trim() !== '',
    createNewItem: () => ({
      id: '',
      ownerId: '',
      email: '',
      phone: '',
      type: 'Email',
      label: undefined,
      notes: '',
      priority: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }),
    validateNewItem: (item) => Boolean(item.email && item.email.trim()),
  }

  return (
    <BasePropertyEditTable
      items={emailContacts}
      onItemsChange={onEmailContactsChange}
      config={emailTableConfig}
      property={property}
    />
  )
}