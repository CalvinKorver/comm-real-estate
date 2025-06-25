import React, { forwardRef } from 'react'
import type { Property } from '@/types/property'

interface PropertyListItemProps {
  property: Property
  selected: boolean
  onClick?: () => void
}

const PropertyListItem = forwardRef<HTMLDivElement, PropertyListItemProps>(({ property, selected, onClick }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-emerald-500 bg-emerald-50 shadow-md min-h-[360px]'
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
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{property.owners?.[0]?.firstName} {property.owners?.[0]?.lastName}</span>
          </p>
        </div>
      </div>
    </div>
  )
})

PropertyListItem.displayName = 'PropertyListItem'

export default PropertyListItem 