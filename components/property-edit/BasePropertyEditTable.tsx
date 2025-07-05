"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { TableConfig, TableActions, BaseTableItem } from '@/types/tableConfig'

interface BasePropertyEditTableProps<T extends BaseTableItem> {
  items: T[]
  onItemsChange: (items: T[]) => void
  config: TableConfig<T>
  property?: any // Optional property object for context
}

export function BasePropertyEditTable<T extends BaseTableItem>({ 
  items, 
  onItemsChange, 
  config,
  property 
}: BasePropertyEditTableProps<T>) {
  const [newItem, setNewItem] = useState<T>(config.createNewItem())

  const filteredItems = config.filterFn ? items.filter(config.filterFn) : items

  const addItem = () => {
    if (config.validateNewItem && !config.validateNewItem(newItem)) {
      return
    }

    const now = new Date()
    const itemToAdd = {
      ...newItem,
      id: `temp-${Date.now()}`,
      priority: items.length + 1,
      created_at: now,
      updated_at: now,
    } as T

    // For items that need ownerId, use first owner if available
    if (property?.owners?.[0] && 'ownerId' in itemToAdd) {
      (itemToAdd as any).ownerId = property.owners[0].id
    }

    onItemsChange([...items, itemToAdd])
    setNewItem(config.createNewItem())
  }

  const removeItem = (index: number) => {
    const actualIndex = items.indexOf(filteredItems[index])
    const itemToRemove = items[actualIndex]
    
    if (itemToRemove.id.startsWith('temp-')) {
      // Remove temporary items immediately
      onItemsChange(items.filter((_, i) => i !== actualIndex))
    } else {
      // Mark existing items for deletion
      const updated = [...items]
      updated[actualIndex] = { ...updated[actualIndex], type: 'deleted' }
      onItemsChange(updated)
    }
  }

  const updateItem = (filteredIndex: number, field: string, value: any) => {
    const actualIndex = items.indexOf(filteredItems[filteredIndex])
    const updated = [...items]
    updated[actualIndex] = { 
      ...updated[actualIndex], 
      [field]: value, 
      updated_at: new Date() 
    }
    onItemsChange(updated)
  }

  const updateNewItem = (field: string, value: any) => {
    setNewItem(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden">
        <Table style={{tableLayout: 'fixed', width: '100%'}}>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  style={{width: column.width}}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, index) => {
              const isMarkedForDeletion = item.type === 'deleted'
              
              return (
                <TableRow key={item.id || index}>
                  {config.columns.map((column) => (
                    <TableCell key={column.key} className="p-3">
                      {column.key === 'actions' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className={isMarkedForDeletion ? 'opacity-50' : ''}>
                          {column.renderer(item, index, updateItem, filteredItems)}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
            
            {/* Add New Item Row */}
            <TableRow>
              {config.columns.map((column) => (
                <TableCell key={column.key} className="p-3">
                  {column.key === 'actions' ? (
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : column.editable !== false ? (
                    column.renderer(newItem, -1, updateNewItem, [newItem])
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {/* Empty cell for non-editable columns in add row */}
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}