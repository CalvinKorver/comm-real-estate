"use client"

import { useMapState } from "@/contexts/MapContext"

interface MapStateDebuggerProps {
  className?: string
}

export default function MapStateDebugger({
  className = "",
}: MapStateDebuggerProps) {
  const {
    center,
    zoom,
    selectedPropertyId,
    highlightedPropertyId,
    isLoading,
    error,
  } = useMapState()

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}
    >
      <h3 className="font-semibold text-sm text-gray-700 mb-3">
        Map State Debugger
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Center:</span>
          <span className="font-mono">
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Zoom:</span>
          <span className="font-mono">{zoom}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Selected Property:</span>
          <span className="font-mono text-gray-500">
            {selectedPropertyId
              ? selectedPropertyId.slice(0, 8) + "..."
              : "None"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Highlighted Property:</span>
          <span className="font-mono text-gray-500">
            {highlightedPropertyId
              ? highlightedPropertyId.slice(0, 8) + "..."
              : "None"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Loading:</span>
          <span
            className={`font-mono ${isLoading ? "text-blue-600" : "text-green-600"}`}
          >
            {isLoading ? "Yes" : "No"}
          </span>
        </div>
        {error && (
          <div className="flex justify-between">
            <span className="text-gray-600">Error:</span>
            <span className="font-mono text-red-600 text-xs">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
