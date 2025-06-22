import { useState } from 'react'
import type { Property } from '@/types/property'
import type { PropertyListPanelProps } from '@/types/map'
import { PANEL_WIDTHS } from '@/lib/map-constants'

export default function PropertyListPanel({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyDeselect,
  className = "",
  resizable = true
}: PropertyListPanelProps) {
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
            <div
              key={property.id}
              onClick={() => onPropertySelect?.(property)}
              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedProperty?.id === property.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">
                    {property.street_address}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {property.city}, {property.zip_code}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{property.number_of_units} units</span>
                    <span>{property.square_feet.toLocaleString()} sq ft</span>
                    <span>{property.return_on_investment}% ROI</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-lg">
                    ${property.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${property.net_operating_income.toLocaleString()}/year NOI
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
} 