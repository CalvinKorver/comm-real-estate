"use client"

import { BasePropertyEditTable } from './BasePropertyEditTable'
import { textRenderer, selectRenderer, labelOptions } from './tableRenderers'
import type { Property, PhoneLabel } from '@/types/property'
import type { PhoneTableItem, TableConfig } from '@/types/tableConfig'

interface PhoneNumber extends PhoneTableItem {
  ownerId: string
  phone: string
  email?: string
  label?: PhoneLabel
  created_at: Date | string
  updated_at: Date | string
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
  
  const phoneTableConfig: TableConfig<PhoneNumber> = {
    columns: [
      {
        key: 'phone',
        header: 'Phone',
        width: '25%',
        renderer: textRenderer('phone', 'New phone number'),
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
    filterFn: (phone) => Boolean(phone.phone && phone.phone.trim()),
    createNewItem: () => ({
      id: '',
      ownerId: '',
      phone: '',
      email: '',
      type: 'Mobile',
      label: undefined,
      notes: '',
      priority: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }),
    validateNewItem: (item) => Boolean(item.phone && item.phone.trim()),
  }

  return (
    <BasePropertyEditTable
      items={phoneNumbers}
      onItemsChange={onPhoneNumbersChange}
      config={phoneTableConfig}
      property={property}
    />
  )
}