"use client"

import { useState, useEffect } from 'react'
import { Property } from '@/types/property'
import PropertyMapView from '@/components/property-map/PropertyMapView'

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function PropertiesMapPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData | null>(null)

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all properties for the map (no pagination needed for map view)
      const response = await fetch('/api/properties?limit=10')
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      
      const data = await response.json()
      console.log("Map: Fetched properties for map view:", data.properties.length)
      
      setProperties(data.properties)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Map: Failed to load properties:', error)
      setError('Failed to load properties for map view')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle property updates from the PropertyEditDialog
  const handlePropertyUpdated = (updatedProperty: Property) => {
    console.log("Map: Property updated:", updatedProperty.id)
    
    // Update the property in the local state
    setProperties(prevProperties => 
      prevProperties.map(property => 
        property.id === updatedProperty.id ? updatedProperty : property
      )
    )
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-white border-b shrink-0">
          <div className="w-full px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Properties Map
            </h1>
            <p className="text-muted-foreground">
              Loading properties for map view...
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-white border-b shrink-0">
          <div className="w-full px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Properties Map
            </h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-2">Error loading properties</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchProperties}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
      {/* Header */}
      <div className="bg-white border-b shrink-0">
        <div className="w-full px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Map
          </h1>

          {properties.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {properties.length} properties
            </p>
          )}
        </div>
      </div>

      {/* Map View Component - Takes remaining height */}
      <div className="flex-1 min-h-0">
        <PropertyMapView 
          properties={properties} 
          onPropertyUpdated={handlePropertyUpdated}
        />
      </div>
    </div>
  )
} 