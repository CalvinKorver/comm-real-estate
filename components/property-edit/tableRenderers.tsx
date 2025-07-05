import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ColumnRenderer, SelectOption, RendererProps } from '@/types/tableConfig'
import type { PhoneLabel } from '@/types/property'

// Built-in renderers for common column types

export const textRenderer = (field: string, placeholder?: string, type?: string): ColumnRenderer => {
  const TextRenderer = (item: any, index: number, updateItem: (index: number, field: string, value: any) => void) => {
    const isAddRow = index === -1
    const value = item[field] || ''
    
    // Only make phone/email fields read-only for existing items (not notes)
    if (!isAddRow && (field === 'phone' || field === 'email') && !item.id?.startsWith('temp-')) {
      // Display mode for primary fields in existing rows
      return <div className="text-sm">{value}</div>
    }
    
    return (
      <Input
        value={value}
        onChange={(e) => {
          updateItem(index, field, e.target.value)
        }}
        placeholder={placeholder}
        type={type}
        className="border-0 p-0 bg-transparent"
        disabled={item.type === 'deleted'}
      />
    )
  }
  TextRenderer.displayName = 'TextRenderer'
  return TextRenderer
}

export const textareaRenderer = (field: string, placeholder?: string, rows: number = 3): ColumnRenderer => {
  const TextareaRenderer = (item: any, index: number, updateItem: (index: number, field: string, value: any) => void) => {
    const isAddRow = index === -1
    const value = item[field] || ''
    const isNewItem = item.id?.startsWith('temp-')
    
    if (!isAddRow && !isNewItem) {
      // Display mode for existing items
      return <div className="whitespace-pre-wrap text-sm">{value}</div>
    }
    
    return (
      <Textarea
        value={value}
        onChange={(e) => {
          updateItem(index, field, e.target.value)
        }}
        placeholder={placeholder}
        rows={rows}
        className="border-0 p-0 bg-transparent resize-none"
        disabled={item.type === 'deleted'}
      />
    )
  }
  TextareaRenderer.displayName = 'TextareaRenderer'
  return TextareaRenderer
}

export const selectRenderer = (field: string, options: SelectOption[], placeholder?: string): ColumnRenderer => {
  const SelectRenderer = (item: any, index: number, updateItem: (index: number, field: string, value: any) => void) => {
    const isAddRow = index === -1
    const value = item[field] || ''
    
    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          updateItem(index, field, newValue)
        }}
        disabled={item.type === 'deleted'}
      >
        <SelectTrigger className="w-full border-0 p-0 bg-transparent">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  SelectRenderer.displayName = 'SelectRenderer'
  return SelectRenderer
}

export const dateRenderer = (field: string): ColumnRenderer => {
  const DateRenderer = (item: any) => {
    const date = item[field]
    if (!date) return null
    
    return (
      <p className="text-xs text-muted-foreground">
        {new Date(date).toLocaleDateString()}
      </p>
    )
  }
  DateRenderer.displayName = 'DateRenderer'
  return DateRenderer
}

// Label options for phone/email tables
export const labelOptions: SelectOption[] = [
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
]