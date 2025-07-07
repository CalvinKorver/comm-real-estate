"use client"

import { useMapActions, useMapState } from "@/contexts/MapContext"

import type { Property } from "@/types/property"
import { MAP_LIMITS } from "@/lib/map-constants"

interface MapZoomControlsProps {
  className?: string
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  showResetButton?: boolean
  showFitAllButton?: boolean
  properties?: Property[]
}

export default function MapZoomControls({
  className = "",
  position = "top-right",
  showResetButton = true,
  showFitAllButton = true,
  properties = [],
}: MapZoomControlsProps) {
  const { zoomIn, zoomOut, resetView, setCenter, setZoom } = useMapActions()
  const { zoom } = useMapState()

  const isZoomInDisabled = zoom >= MAP_LIMITS.MAX_ZOOM
  const isZoomOutDisabled = zoom <= MAP_LIMITS.MIN_ZOOM

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }

  const handleFitAllProperties = () => {
    if (properties.length === 0) return

    // Filter properties with coordinates
    const propertiesWithCoordinates = properties.filter(
      (property) => property.coordinates
    )

    if (propertiesWithCoordinates.length === 0) return

    // Calculate center of all properties
    const totalLat = propertiesWithCoordinates.reduce(
      (sum, property) => sum + property.coordinates!.latitude,
      0
    )
    const totalLng = propertiesWithCoordinates.reduce(
      (sum, property) => sum + property.coordinates!.longitude,
      0
    )

    const centerLat = totalLat / propertiesWithCoordinates.length
    const centerLng = totalLng / propertiesWithCoordinates.length

    setCenter({ lat: centerLat, lng: centerLng })
    setZoom(12) // Zoom level that shows multiple properties
  }

  return (
    <div className={`absolute ${positionClasses[position]} z-10 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Zoom In Button */}
        <button
          onClick={zoomIn}
          disabled={isZoomInDisabled}
          className={`
            w-10 h-10 flex items-center justify-center border-b border-gray-200
            hover:bg-gray-50 transition-colors duration-200
            ${
              isZoomInDisabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:text-gray-900"
            }
          `}
          title="Zoom In"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={zoomOut}
          disabled={isZoomOutDisabled}
          className={`
            w-10 h-10 flex items-center justify-center border-b border-gray-200
            hover:bg-gray-50 transition-colors duration-200
            ${
              isZoomOutDisabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:text-gray-900"
            }
          `}
          title="Zoom Out"
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
              d="M20 12H4"
            />
          </svg>
        </button>

        {/* Fit All Properties Button */}
        {showFitAllButton && properties.length > 0 && (
          <button
            onClick={handleFitAllProperties}
            className="
              w-10 h-10 flex items-center justify-center border-b border-gray-200
              text-gray-700 hover:text-gray-900 hover:bg-gray-50 
              transition-colors duration-200
            "
            title="Fit All Properties"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        )}

        {/* Reset View Button */}
        {showResetButton && (
          <button
            onClick={resetView}
            className="
              w-10 h-10 flex items-center justify-center border-t border-gray-200
              text-gray-700 hover:text-gray-900 hover:bg-gray-50 
              transition-colors duration-200
            "
            title="Reset View"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
