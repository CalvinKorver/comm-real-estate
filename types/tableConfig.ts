import { ReactNode } from 'react'
import type { PhoneLabel } from './property'

// Base interface for all table items
export interface BaseTableItem {
  id: string
  type: string
  priority: number
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

// Generic table item with flexible primary field
export interface TableItem<T extends string = string> extends BaseTableItem {
  [key: string]: any
}

// Specific item types
export interface PhoneTableItem extends BaseTableItem {
  ownerId: string
  phone: string
  email?: string
  label?: PhoneLabel
}

export interface EmailTableItem extends BaseTableItem {
  ownerId: string
  email: string
  phone?: string
  label?: PhoneLabel
}

export interface NoteTableItem extends BaseTableItem {
  content: string
}

// Column configuration
export interface TableColumn<T = any> {
  key: string
  header: string
  width: string
  renderer: ColumnRenderer<T>
  editable?: boolean
  required?: boolean
}

// Column renderer function type
export type ColumnRenderer<T = any> = (
  item: T,
  index: number,
  updateItem: (index: number, field: string, value: any) => void,
  allItems: T[]
) => ReactNode

// Table configuration
export interface TableConfig<T = any> {
  columns: TableColumn<T>[]
  emptyMessage?: string
  addButtonText?: string
  filterFn?: (item: T) => boolean
  createNewItem: () => T
  validateNewItem?: (item: T) => boolean
}

// Built-in renderer types
export interface SelectOption {
  value: string
  label: string
}

export interface RendererProps<T = any> {
  item: T
  index: number
  updateItem: (index: number, field: string, value: any) => void
  allItems: T[]
  field: string
  placeholder?: string
  disabled?: boolean
  options?: SelectOption[]
  className?: string
  rows?: number
  type?: string
}

// Table actions interface
export interface TableActions<T = any> {
  onAdd: (item: T) => void
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
}