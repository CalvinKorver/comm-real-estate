import { useState, useRef, useEffect } from 'react'
import type { Property } from '@/types/property'
import type { PropertyListPanelProps } from '@/types/map'
import { PANEL_WIDTHS } from '@/lib/map-constants'
import PropertyListItem from './PropertyListItem'

export default function PropertyListPanel({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyDeselect,
  className = "",
  resizable = true
}: PropertyListPanelProps) {
  // Create refs for each property
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (selectedProperty && itemRefs.current[selectedProperty.id]) {
      itemRefs.current[selectedProperty.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedProperty])

  return (
    <aside
      className={`${PANEL_WIDTHS.LIST_PANEL.DEFAULT} ${PANEL_WIDTHS.LIST_PANEL.MIN} ${PANEL_WIDTHS.LIST_PANEL.MAX} h-full border-r bg-white shadow-lg flex flex-col overflow-y-auto ${className}`}
      style={resizable ? { resize: 'horizontal', overflow: 'auto' } : undefined}
    >
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            Properties ({properties.length})
          </h2>
          {selectedProperty && (
            <button
              onClick={onPropertyDeselect}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {properties.map((property) => (
            <PropertyListItem
              key={property.id}
              property={property}
              selected={selectedProperty?.id === property.id}
              onClick={() => onPropertySelect?.(property)}
              ref={el => (itemRefs.current[property.id] = el)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
} 