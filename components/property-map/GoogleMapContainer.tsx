"use client"

import { useEffect, useRef, useState } from 'react'
import { 
  MapInitializer, 
  GoogleMapsErrorHandler, 
  mapUtils,
  MAP_CENTERS,
  ZOOM_LEVELS,
  MAP_STYLES
} from '@/lib/google-maps'
import type { 
  GoogleMapContainerProps,
  Coordinates,
  MapStyle,
  MapInitializationOptions,
  MapViewport
} from '@/types/map'

declare global {
  interface Window {
    google: typeof google
  }
}

export default function GoogleMapContainer({ 
  center = MAP_CENTERS.NEW_YORK,
  zoom = ZOOM_LEVELS.CITY,
  className = "",
  style = MAP_STYLES.LIGHT,
  options = {},
  onMapReady,
  onMapError,
  onMapClick,
  onMapBoundsChanged
}: GoogleMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) {
        const errorMsg = 'Map container not found'
        setError(errorMsg)
        setIsLoading(false)
        onMapError?.(errorMsg)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Validate coordinates
        if (!mapUtils.isValidCoordinate(center)) {
          const errorMsg = 'Invalid coordinates provided'
          throw new Error(errorMsg)
        }

        // Initialize map using utility library
        const map = await MapInitializer.createMapWithCustomStyle(
          mapRef.current,
          style,
          {
            center,
            zoom,
            ...options
          }
        )

        mapInstanceRef.current = map

        // Set up map event listeners
        if (onMapReady) {
          onMapReady(map)
        }

        if (onMapClick) {
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const coordinates: Coordinates = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              }
              onMapClick(coordinates)
            }
          })
        }

        if (onMapBoundsChanged) {
          map.addListener('bounds_changed', () => {
            const bounds = map.getBounds()
            if (bounds) {
              const viewport: MapViewport = {
                center: {
                  lat: map.getCenter()!.lat(),
                  lng: map.getCenter()!.lng()
                },
                zoom: map.getZoom()!,
                bounds: {
                  north: bounds.getNorthEast().lat(),
                  south: bounds.getSouthWest().lat(),
                  east: bounds.getNorthEast().lng(),
                  west: bounds.getSouthWest().lng()
                }
              }
              onMapBoundsChanged(viewport)
            }
          })
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error initializing map:', err)
        const errorMessage = GoogleMapsErrorHandler.handleAPIError(err)
        setError(errorMessage)
        setIsLoading(false)
        onMapError?.(errorMessage)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        // Clean up map instance if needed
        mapInstanceRef.current = null
      }
    }
  }, [center.lat, center.lng, zoom, style, options, onMapReady, onMapError, onMapClick, onMapBoundsChanged])

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && mapUtils.isValidCoordinate(center)) {
      mapInstanceRef.current.setCenter(center)
      mapInstanceRef.current.setZoom(zoom)
    }
  }, [center.lat, center.lng, zoom])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // The useEffect will re-run and attempt to initialize the map again
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />
    </div>
  )
} 