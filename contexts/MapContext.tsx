"use client"

import React, { createContext, ReactNode, useContext, useReducer } from "react"

import type { Bounds, Coordinates, MapViewport } from "@/types/map"
import { MAP_CENTERS, MAP_LIMITS, ZOOM_LEVELS } from "@/lib/map-constants"

// Map State Interface
export interface MapState {
  center: Coordinates
  zoom: number
  bounds: Bounds | null
  selectedPropertyId: string | null
  highlightedPropertyId: string | null
  isLoading: boolean
  error: string | null
  mapInstance: google.maps.Map | null
}

// Map Actions
export type MapAction =
  | { type: "SET_CENTER"; payload: Coordinates }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_BOUNDS"; payload: Bounds }
  | { type: "SET_SELECTED_PROPERTY"; payload: string | null }
  | { type: "SET_HIGHLIGHTED_PROPERTY"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MAP_INSTANCE"; payload: google.maps.Map | null }
  | { type: "ZOOM_IN" }
  | { type: "ZOOM_OUT" }
  | { type: "RESET_VIEW" }
  | { type: "FIT_BOUNDS"; payload: Bounds }
  | { type: "PAN_TO"; payload: Coordinates }

// Initial State
const initialState: MapState = {
  center: MAP_CENTERS.NEW_YORK,
  zoom: ZOOM_LEVELS.CITY,
  bounds: null,
  selectedPropertyId: null,
  highlightedPropertyId: null,
  isLoading: false,
  error: null,
  mapInstance: null,
}

// Map Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_CENTER":
      return { ...state, center: action.payload }

    case "SET_ZOOM":
      return {
        ...state,
        zoom: Math.max(
          MAP_LIMITS.MIN_ZOOM,
          Math.min(MAP_LIMITS.MAX_ZOOM, action.payload)
        ),
      }

    case "SET_BOUNDS":
      return { ...state, bounds: action.payload }

    case "SET_SELECTED_PROPERTY":
      return { ...state, selectedPropertyId: action.payload }

    case "SET_HIGHLIGHTED_PROPERTY":
      return { ...state, highlightedPropertyId: action.payload }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_MAP_INSTANCE":
      return { ...state, mapInstance: action.payload }

    case "ZOOM_IN":
      const newZoomIn = Math.min(MAP_LIMITS.MAX_ZOOM, state.zoom + 1)
      return { ...state, zoom: newZoomIn }

    case "ZOOM_OUT":
      const newZoomOut = Math.max(MAP_LIMITS.MIN_ZOOM, state.zoom - 1)
      return { ...state, zoom: newZoomOut }

    case "RESET_VIEW":
      return {
        ...state,
        center: MAP_CENTERS.NEW_YORK,
        zoom: ZOOM_LEVELS.CITY,
        selectedPropertyId: null,
        highlightedPropertyId: null,
      }

    case "FIT_BOUNDS":
      return { ...state, bounds: action.payload }

    case "PAN_TO":
      return { ...state, center: action.payload }

    default:
      return state
  }
}

// Map Context
interface MapContextType {
  state: MapState
  dispatch: React.Dispatch<MapAction>
  // Convenience methods
  setCenter: (center: Coordinates) => void
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  selectProperty: (propertyId: string | null) => void
  highlightProperty: (propertyId: string | null) => void
  setMapInstance: (map: google.maps.Map | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

// Map Provider Component
interface MapProviderProps {
  children: ReactNode
  initialCenter?: Coordinates
  initialZoom?: number
}

export function MapProvider({
  children,
  initialCenter = MAP_CENTERS.NEW_YORK,
  initialZoom = ZOOM_LEVELS.CITY,
}: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, {
    ...initialState,
    center: initialCenter,
    zoom: initialZoom,
  })

  // Convenience methods
  const setCenter = (center: Coordinates) => {
    dispatch({ type: "SET_CENTER", payload: center })
  }

  const setZoom = (zoom: number) => {
    dispatch({ type: "SET_ZOOM", payload: zoom })
  }

  const zoomIn = () => {
    dispatch({ type: "ZOOM_IN" })
  }

  const zoomOut = () => {
    dispatch({ type: "ZOOM_OUT" })
  }

  const resetView = () => {
    dispatch({ type: "RESET_VIEW" })
  }

  const selectProperty = (propertyId: string | null) => {
    dispatch({ type: "SET_SELECTED_PROPERTY", payload: propertyId })
  }

  const highlightProperty = (propertyId: string | null) => {
    dispatch({ type: "SET_HIGHLIGHTED_PROPERTY", payload: propertyId })
  }

  const setMapInstance = (map: google.maps.Map | null) => {
    dispatch({ type: "SET_MAP_INSTANCE", payload: map })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const value: MapContextType = {
    state,
    dispatch,
    setCenter,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    selectProperty,
    highlightProperty,
    setMapInstance,
    setLoading,
    setError,
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

// Custom Hook to use Map Context
export function useMap() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider")
  }
  return context
}

// Hook for map state only
export function useMapState() {
  const { state } = useMap()
  return state
}

// Hook for map actions only
export function useMapActions() {
  const {
    dispatch,
    setCenter,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    selectProperty,
    highlightProperty,
    setMapInstance,
    setLoading,
    setError,
  } = useMap()
  return {
    dispatch,
    setCenter,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    selectProperty,
    highlightProperty,
    setMapInstance,
    setLoading,
    setError,
  }
}
