import { useState } from 'react'
import GoogleMapContainer from './GoogleMapContainer'
import type { PropertyMapPanelProps } from '@/types/map'
import { PANEL_WIDTHS } from '@/lib/map-constants'

export default function PropertyMapPanel({
  properties,
  selectedProperty,
  highlightedPropertyId,
  center,
  zoom,
  onPropertySelect,
  onPropertyDeselect,
  onMarkerClick,
  onMapCenterChange,
  onMapZoomChange,
  className = ""
}: PropertyMapPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In a real implementation, loading and error would be managed by the map logic

  return (
    <section
      className={`${PANEL_WIDTHS.MAP_PANEL.DEFAULT} h-full bg-white flex flex-col relative ${className}`}
      style={{ minWidth: 0 }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-red-500 mb-2">Error loading map</div>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      {/* Map Container */}
      <div className="flex-1">
        <GoogleMapContainer 
          properties={properties}
          center={center}
          zoom={zoom}
          highlightedPropertyId={highlightedPropertyId}
          onMapError={setError}
          onMapReady={() => setIsLoading(false)}
          onMarkerClick={onMarkerClick}
          onMapCenterChange={onMapCenterChange}
          onMapZoomChange={onMapZoomChange}
        />
      </div>
    </section>
  )
} 