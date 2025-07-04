"use client"

import { useEffect, useRef, useCallback } from 'react'
import { 
  MapInitializer, 
  GoogleMapsErrorHandler, 
  mapUtils,
  MAP_CENTERS,
  ZOOM_LEVELS,
  MAP_STYLES
} from '@/lib/google-maps'
import { useMapActions, useMapState } from '@/contexts/MapContext'
import type { 
  GoogleMapContainerProps,
  Coordinates,
  MapStyle,
  MapInitializationOptions,
  MapViewport
} from '@/types/map'
import type { Property } from '@/types/property'

declare global {
  interface Window {
    google: typeof google
  }
}

export default function GoogleMapContainer({ 
  properties = [],
  center = MAP_CENTERS.NEW_YORK,
  zoom = ZOOM_LEVELS.CITY,
  className = "",
  style = MAP_STYLES.LIGHT,
  options = {},
  highlightedPropertyId = null,
  onMapReady,
  onMapError,
  onMapClick,
  onMapBoundsChanged,
  onMarkerClick,
  onMapCenterChange,
  onMapZoomChange
}: GoogleMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const isUpdatingMapRef = useRef(false) // Flag to prevent feedback loops
  const isIdleRef = useRef(true)
  
  // Use centralized state management
  const { 
    setMapInstance, 
    setLoading, 
    setError, 
    setCenter, 
    setZoom, 
    highlightProperty 
  } = useMapActions()
  
  const { 
    center: mapCenter, 
    zoom: mapZoom, 
    isLoading, 
    error, 
    mapInstance,
    highlightedPropertyId: contextHighlightedPropertyId
  } = useMapState()

  // Use context highlighted property ID if available, otherwise fall back to prop
  const effectiveHighlightedPropertyId = contextHighlightedPropertyId || highlightedPropertyId


  // Helper function to create marker icon
  const createMarkerIcon = (isSelected: boolean) => {
    return {
      url: isSelected 
        ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C10.477 0 6 4.477 6 10c0 7 10 22 10 22s10-15 10-22c0-5.523-4.477-10-10-10z" fill="#dc2626"/>
            <circle cx="16" cy="10" r="6" fill="#ffffff"/>
          </svg>
        `)
        : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C10.477 0 6 4.477 6 10c0 7 10 22 10 22s10-15 10-22c0-5.523-4.477-10-10-10z" fill="#2563eb"/>
            <circle cx="16" cy="10" r="6" fill="#ffffff"/>
          </svg>
        `),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32)
    }
  }

  // Helper function to create markers for properties with coordinates
  const createMarkers = useCallback((map: google.maps.Map, properties: Property[], shouldFitBounds: boolean = false) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
    markersMapRef.current.clear()

    // Filter properties that have coordinates
    const propertiesWithCoordinates = properties.filter(property => property.coordinates)

    // Create markers for each property (without highlighting - that's handled separately)
    propertiesWithCoordinates.forEach(property => {
      if (property.coordinates) {
        const marker = new google.maps.Marker({
          position: {
            lat: property.coordinates.latitude,
            lng: property.coordinates.longitude
          },
          map: map,
          title: `${property.street_address}, ${property.city}`,
          icon: createMarkerIcon(false) // Start with unselected icon
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          onMarkerClick?.(property)
        })

        markersRef.current.push(marker)
        markersMapRef.current.set(property.id, marker)
      }
    })

    // Only fit map bounds on initial load, not on subsequent updates
    if (shouldFitBounds && markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!)
      })
      map.fitBounds(bounds)
    }
  }, [onMarkerClick])

  // Helper function to update marker highlighting
  const updateMarkerHighlighting = useCallback(() => {
    markersMapRef.current.forEach((marker, propertyId) => {
      const isSelected = effectiveHighlightedPropertyId === propertyId
      marker.setIcon(createMarkerIcon(isSelected))
    })
  }, [effectiveHighlightedPropertyId])

  // Initialize map
  useEffect(() => {
    // Capture ref values for cleanup
    const markersMapForCleanup = markersMapRef.current
    
    const initializeMap = async () => {
      if (!mapRef.current) {
        const errorMsg = 'Map container not found'
        setError(errorMsg)
        setLoading(false)
        onMapError?.(errorMsg)
        return
      }

      try {
        setLoading(true)
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
            zoomControl: false,
            ...options
          }
        )

        // Set the map instance first
        setMapInstance(map)
        
        // Wait for the map to be fully ready
        await new Promise(resolve => {
          const checkReady = () => {
            if (map.getCenter() && map.getZoom() !== undefined) {
              resolve(true)
            } else {
              setTimeout(checkReady, 50)
            }
          }
          checkReady()
        })

        // Additional check to ensure map is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100))

        // Create markers for properties with initial bounds fitting
        createMarkers(map, properties, true)
        
        // Apply initial highlighting
        updateMarkerHighlighting()

        // Set up map event listeners AFTER map is ready
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

        // Add an idle listener to update the context when the map has stopped moving
        map.addListener('idle', () => {
          if (isUpdatingMapRef.current) {
            isUpdatingMapRef.current = false
            return
          }

          const center = map.getCenter()
          const zoom = map.getZoom()

          if (center && zoom !== undefined) {
            const newCenter = { lat: center.lat(), lng: center.lng() }
            console.log('Map is idle, updating context state:', { center: newCenter, zoom })
            setCenter(newCenter)
            setZoom(zoom)
            onMapCenterChange?.(newCenter)
            onMapZoomChange?.(zoom)
          }
          isIdleRef.current = true
        })

        map.addListener('dragstart', () => {
          isIdleRef.current = false
        })
        
        // Initialize context state with actual map values
        const actualCenter = map.getCenter()
        const actualZoom = map.getZoom()
        
        if (actualCenter && actualZoom !== undefined) {
          // Set flag to prevent initial feedback
          isUpdatingMapRef.current = true
          
          console.log('Initializing map state:', {
            center: { lat: actualCenter.lat(), lng: actualCenter.lng() },
            zoom: actualZoom
          })
          
          setCenter({
            lat: actualCenter.lat(),
            lng: actualCenter.lng()
          })
          setZoom(actualZoom)
          
          // Reset flag after initial sync
          setTimeout(() => {
            isUpdatingMapRef.current = false
            console.log('Map initialization complete')
          }, 100)
        }

        setLoading(false)

      } catch (err) {
        console.error('Error initializing map:', err)
        const errorMessage = GoogleMapsErrorHandler.handleAPIError(err)
        setError(errorMessage)
        setLoading(false)
        onMapError?.(errorMessage)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      markersMapForCleanup.clear()
      setMapInstance(null)
    }
  }, []) // Empty dependency array intentional - this effect should only run once on mount to prevent infinite re-renders

  // Update markers when properties change (without fitting bounds)
  useEffect(() => {
    if (mapInstance) {
      createMarkers(mapInstance, properties, false)
      // Apply highlighting after markers are created
      updateMarkerHighlighting()
    }
  }, [properties, mapInstance, createMarkers, updateMarkerHighlighting])

  // Update marker highlighting when highlightedPropertyId changes
  useEffect(() => {
    if (mapInstance) {
      updateMarkerHighlighting()
    }
  }, [effectiveHighlightedPropertyId, mapInstance, updateMarkerHighlighting])


  // Update map center and zoom when context state changes
  useEffect(() => {
    if (mapInstance && mapUtils.isValidCoordinate(mapCenter)) {
      const currentCenter = mapInstance.getCenter()
      const currentZoom = mapInstance.getZoom()
      
      // Only proceed if map is fully initialized
      if (!currentCenter || currentZoom === undefined) {
        return
      }
      
      // Only update if values are actually different and the map is idle
      const centerChanged = 
        Math.abs(currentCenter.lat() - mapCenter.lat) > 0.0001 || 
        Math.abs(currentCenter.lng() - mapCenter.lng) > 0.0001
      
      const zoomChanged = Math.abs(currentZoom - mapZoom) > 0.1
      
      if ((centerChanged || zoomChanged) && isIdleRef.current) {
        // Set flag to prevent feedback loop
        isUpdatingMapRef.current = true
        isIdleRef.current = false
        
        try {
          mapInstance.setCenter(mapCenter)
          mapInstance.setZoom(mapZoom)
        } catch (error) {
          console.warn('Error updating map:', error)
          // Even if it fails, reset the flag
          isUpdatingMapRef.current = false
          isIdleRef.current = true
        }
      }
    }
  }, [mapCenter, mapZoom, mapInstance])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
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