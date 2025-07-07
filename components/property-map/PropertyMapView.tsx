"use client"

import { useEffect, useMemo, useState } from "react"
import { MapProvider, useMapActions, useMapState } from "@/contexts/MapContext"

import type { Coordinates, MapStyle, PropertyMapViewProps } from "@/types/map"
import type { Property } from "@/types/property"
import { MAP_CENTERS, MAP_STYLES, ZOOM_LEVELS } from "@/lib/map-constants"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import PropertyListPanel from "./PropertyListPanel"
import PropertyMapPanel from "./PropertyMapPanel"

// Inner component that uses the MapContext
function PropertyMapViewContent({
  properties: initialProperties,
  className = "",
  layout = "split",
  defaultCenter = MAP_CENTERS.NEW_YORK,
  defaultZoom = ZOOM_LEVELS.CITY,
  mapStyle = MAP_STYLES.LIGHT,
  onPropertyUpdated,
}: PropertyMapViewProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  )
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(
    null
  )

  // Use centralized state management
  const { setCenter, setZoom, selectProperty, highlightProperty } =
    useMapActions()
  const { center: currentCenter, zoom: currentZoom } = useMapState()

  // Memoize properties to prevent unnecessary re-renders
  const memoizedProperties = useMemo(
    () => initialProperties,
    [initialProperties]
  )

  // Update local properties when initialProperties changes
  useEffect(() => {
    setProperties(memoizedProperties)
  }, [memoizedProperties])

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    setHighlightedMarkerId(property.id)

    // Use centralized state management for map interactions
    selectProperty(property.id)
    highlightProperty(property.id)

    // Implement smart zoom/pan logic directly for side panel clicks
    if (property.coordinates) {
      const propertyCenter = {
        lat: property.coordinates.latitude,
        lng: property.coordinates.longitude,
      }

      // Simple distance check for now - we'll optimize this later
      const latDiff = Math.abs(propertyCenter.lat - currentCenter.lat)
      const lngDiff = Math.abs(propertyCenter.lng - currentCenter.lng)

      // If property is far away, center on it
      if (latDiff > 0.01 || lngDiff > 0.01) {
        setCenter(propertyCenter)
        // Set appropriate zoom level if too zoomed out
        if (currentZoom < 10) {
          setZoom(15)
        }
      }
    }
  }

  const handlePropertyDeselect = () => {
    setSelectedProperty(null)
    setHighlightedMarkerId(null)

    // Use centralized state management
    selectProperty(null)
    highlightProperty(null)

    // Optionally reset map to show all properties
    // setCenter(defaultCenter)
    // setZoom(defaultZoom)
  }

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property)
    setHighlightedMarkerId(property.id)

    // Use centralized state management for map interactions
    selectProperty(property.id)
    highlightProperty(property.id)

    // Don't center map when clicking markers - just select the property
    // This prevents the jumping effect when the marker moves as the map centers
  }

  const handlePropertyUpdated = (updatedProperty: Property) => {
    console.log("PropertyMapView: Property updated:", updatedProperty.id)

    // Update the properties array
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === updatedProperty.id ? updatedProperty : property
      )
    )

    // Update the selected property if it's the one being updated
    if (selectedProperty?.id === updatedProperty.id) {
      setSelectedProperty(updatedProperty)
    }

    // Call the parent callback if provided
    onPropertyUpdated?.(updatedProperty)
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Mobile Layout - Stacked */}
      <div className="block lg:hidden flex-1 min-h-0">
        {/* Map Panel - Full Width on Mobile */}
        <div className="h-80 bg-white border-b">
          <PropertyMapPanel
            properties={properties}
            selectedProperty={selectedProperty}
            highlightedPropertyId={highlightedMarkerId}
            onPropertySelect={handlePropertySelect}
            onPropertyDeselect={handlePropertyDeselect}
            onMarkerClick={handleMarkerClick}
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
            onPropertyUpdated={handlePropertyUpdated}
            className="h-full"
          />
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <PropertyListPanel
              properties={properties}
              selectedProperty={selectedProperty}
              onPropertySelect={handlePropertySelect}
              onPropertyDeselect={handlePropertyDeselect}
              onPropertyUpdated={handlePropertyUpdated}
              className="h-full min-h-0"
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={50}>
            <PropertyMapPanel
              properties={properties}
              selectedProperty={selectedProperty}
              highlightedPropertyId={highlightedMarkerId}
              onPropertySelect={handlePropertySelect}
              onPropertyDeselect={handlePropertyDeselect}
              onMarkerClick={handleMarkerClick}
              className="h-full min-h-0"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Selected Property Details Modal - Mobile Only */}
      {selectedProperty && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-h-2/3 rounded-t-lg overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">
                  Property Details
                </h3>
                <button
                  onClick={handlePropertyDeselect}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
                  <span className="font-medium">
                    ${selectedProperty.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Units:</span>
                  <span className="font-medium">
                    {selectedProperty.number_of_units}
                  </span>
                </div>
                {/* <div className="flex justify-between">
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
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main component that provides the MapContext
export default function PropertyMapView(props: PropertyMapViewProps) {
  return (
    <MapProvider
      initialCenter={props.defaultCenter || MAP_CENTERS.NEW_YORK}
      initialZoom={props.defaultZoom || ZOOM_LEVELS.CITY}
    >
      <PropertyMapViewContent {...props} />
    </MapProvider>
  )
}
