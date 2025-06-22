"use client"

import { useState } from 'react'
import type { Property } from '@/types/property'
import type { PropertyMapViewProps, Coordinates, MapStyle } from '@/types/map'
import { MAP_CENTERS, ZOOM_LEVELS, MAP_STYLES } from '@/lib/map-constants'
import PropertyMapPanel from './PropertyMapPanel'
import PropertyListPanel from './PropertyListPanel'

export default function PropertyMapView({ 
  properties,
  className = "",
  layout = 'split',
  defaultCenter = MAP_CENTERS.NEW_YORK,
  defaultZoom = ZOOM_LEVELS.CITY,
  mapStyle = MAP_STYLES.LIGHT
}: PropertyMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
  }

  const handlePropertyDeselect = () => {
    setSelectedProperty(null)
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Mobile Layout - Stacked */}
      <div className="block lg:hidden flex-1 min-h-0">
        {/* Map Panel - Full Width on Mobile */}
        <div className="h-96 bg-white border-b">
          <PropertyMapPanel
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            onPropertyDeselect={handlePropertyDeselect}
            className="h-full"
          />
        </div>

        {/* Properties List Panel - Full Width on Mobile */}
        <div className="flex-1 bg-white min-h-0">
          <PropertyListPanel
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            onPropertyDeselect={handlePropertyDeselect}
            className="h-full"
          />
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:flex flex-1 min-h-0">
        {/* Properties List Panel - Left Side (max 750px) */}
        <PropertyListPanel
          properties={properties}
          selectedProperty={selectedProperty}
          onPropertySelect={handlePropertySelect}
          onPropertyDeselect={handlePropertyDeselect}
          className="w-[750px] max-w-[750px] border-r h-full min-h-0"
        />

        {/* Map Panel - Right Side (remaining space) */}
        <PropertyMapPanel
          properties={properties}
          selectedProperty={selectedProperty}
          onPropertySelect={handlePropertySelect}
          onPropertyDeselect={handlePropertyDeselect}
          className="flex-1 h-full min-h-0"
        />
      </div>

      {/* Selected Property Details Modal - Mobile Only */}
      {selectedProperty && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-2/3 rounded-t-lg overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Property Details</h3>
                <button
                  onClick={handlePropertyDeselect}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-foreground mb-2">
                {selectedProperty.street_address}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedProperty.city}, {selectedProperty.zip_code}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-medium">${selectedProperty.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Units:</span>
                  <span className="font-medium">{selectedProperty.number_of_units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Square Feet:</span>
                  <span className="font-medium">{selectedProperty.square_feet.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ROI:</span>
                  <span className="font-medium">{selectedProperty.return_on_investment}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">NOI:</span>
                  <span className="font-medium">${selectedProperty.net_operating_income.toLocaleString()}/year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 