// Map-specific TypeScript interfaces and types

import { Property } from "./property"

// Basic coordinate types
export interface Coordinates {
  lat: number
  lng: number
}

export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

// Map configuration types
export interface MapConfig {
  center: Coordinates
  zoom: number
  mapTypeId: google.maps.MapTypeId
  mapTypeControl: boolean
  streetViewControl: boolean
  fullscreenControl: boolean
  zoomControl: boolean
  styles: google.maps.MapTypeStyle[]
}

export interface MapInitializationOptions {
  center?: Coordinates
  zoom?: number
  mapTypeId?: google.maps.MapTypeId
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
  zoomControl?: boolean
  styles?: google.maps.MapTypeStyle[]
}

// Map style types
export type MapStyle = "light" | "dark" | "satellite" | "terrain"

// Panel layout types
export interface PanelLayout {
  listPanel: {
    width: string
    minWidth: string
    maxWidth: string
    resizable: boolean
  }
  mapPanel: {
    width: string
    minWidth: string
  }
}

// Property marker types
export interface PropertyMarker {
  id: string
  position: Coordinates
  property: Property
  isSelected: boolean
  isHovered: boolean
}

export interface MarkerConfig {
  id: string
  position: Coordinates
  title?: string
  description?: string
  icon?: string
  color?: string
  size?: "small" | "medium" | "large"
  clickable?: boolean
  draggable?: boolean
}

export interface MarkerSettings {
  default: MarkerConfig
  selected: MarkerConfig
  hover: MarkerConfig
}

// Map state types
export type LoadingState =
  | "initializing"
  | "loading_api"
  | "creating_map"
  | "loading_markers"
  | "ready"
  | "error"

export type ErrorType =
  | "api_key_missing"
  | "api_key_invalid"
  | "network_error"
  | "initialization_error"
  | "container_error"
  | "coordinates_error"

export interface MapState {
  isLoading: boolean
  loadingState: LoadingState
  error: string | null
  errorType: ErrorType | null
  isInitialized: boolean
}

// Map interaction types
export interface MapInteraction {
  type: "click" | "hover" | "drag" | "zoom"
  coordinates?: Coordinates
  propertyId?: string
  data?: any
}

// Map bounds and viewport types
export interface MapViewport {
  center: Coordinates
  zoom: number
  bounds: Bounds
}

// Component prop interfaces
export interface GoogleMapContainerProps {
  properties?: Property[]
  center?: Coordinates
  zoom?: number
  className?: string
  style?: MapStyle
  options?: MapInitializationOptions
  highlightedPropertyId?: string | null
  onMapReady?: (map: google.maps.Map) => void
  onMapError?: (error: string) => void
  onMapClick?: (coordinates: Coordinates) => void
  onMapBoundsChanged?: (viewport: MapViewport) => void
  onMarkerClick?: (property: Property) => void
  onMapCenterChange?: (center: Coordinates) => void
  onMapZoomChange?: (zoom: number) => void
}

export interface PropertyMapPanelProps {
  properties: Property[]
  selectedProperty?: Property | null
  highlightedPropertyId?: string | null
  center?: Coordinates
  zoom?: number
  onPropertySelect?: (property: Property) => void
  onPropertyDeselect?: () => void
  onMarkerClick?: (property: Property) => void
  onMapCenterChange?: (center: Coordinates) => void
  onMapZoomChange?: (zoom: number) => void
  className?: string
}

export interface PropertyListPanelProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect?: (property: Property) => void
  onPropertyDeselect?: () => void
  onPropertyUpdated?: (updatedProperty: Property) => void
  className?: string
  resizable?: boolean
}

export interface PropertyMapViewProps {
  properties: Property[]
  className?: string
  layout?: "split" | "stacked" | "fullscreen"
  defaultCenter?: Coordinates
  defaultZoom?: number
  mapStyle?: MapStyle
  onPropertyUpdated?: (updatedProperty: Property) => void
}

// Google Maps type extensions
declare global {
  namespace google.maps {
    interface MapOptions {
      // Custom properties we might add
      customStyle?: MapStyle
      enableClustering?: boolean
      clusterOptions?: {
        gridSize: number
        maxZoom: number
        styles: Array<{
          url: string
          width: number
          height: number
          textColor: string
          textSize: number
        }>
      }
    }

    interface MarkerOptions {
      // Custom marker properties
      propertyId?: string
      isSelected?: boolean
      isHovered?: boolean
      customIcon?: MarkerConfig
    }
  }
}

// Map service types
export interface MapService {
  initialize(): Promise<void>
  createMap(
    container: HTMLElement,
    options: MapInitializationOptions
  ): Promise<google.maps.Map>
  addMarker(map: google.maps.Map, marker: PropertyMarker): google.maps.Marker
  removeMarker(marker: google.maps.Marker): void
  updateMarker(
    marker: google.maps.Marker,
    updates: Partial<PropertyMarker>
  ): void
  fitBounds(map: google.maps.Map, bounds: Bounds): void
  panTo(map: google.maps.Map, center: Coordinates): void
  setZoom(map: google.maps.Map, zoom: number): void
  destroy(): void
}

// Map event types
export interface MapEvents {
  onMapReady: (map: google.maps.Map) => void
  onMapClick: (event: google.maps.MapMouseEvent) => void
  onMapBoundsChanged: () => void
  onMapZoomChanged: () => void
  onMarkerClick: (marker: google.maps.Marker, property: Property) => void
  onMarkerMouseOver: (marker: google.maps.Marker, property: Property) => void
  onMarkerMouseOut: (marker: google.maps.Marker, property: Property) => void
}

// Map utility types
export interface MapUtils {
  calculateCenter(coordinates: Coordinates[]): Coordinates
  calculateBounds(coordinates: Coordinates[]): Bounds
  calculateZoomForBounds(bounds: Bounds): number
  formatCoordinates(coordinates: Coordinates): string
  isValidCoordinate(coordinates: Coordinates): boolean
  distanceBetween(point1: Coordinates, point2: Coordinates): number
}

// Map theme types
export interface MapTheme {
  name: string
  styles: google.maps.MapTypeStyle[]
  description?: string
}

// Map performance types
export interface MapPerformance {
  renderTime: number
  markerCount: number
  memoryUsage: number
  frameRate: number
}

// Map accessibility types
export interface MapAccessibility {
  enableKeyboardNavigation: boolean
  enableScreenReader: boolean
  highContrastMode: boolean
  largeTextMode: boolean
}

// Export commonly used types
export type {
  Coordinates as LatLng,
  MapConfig as MapOptions,
  PropertyMarker as Marker,
  MapState as State,
}

/**
 * Property marker specific configuration
 */
export interface PropertyMarkerConfig extends MarkerConfig {
  property: Property
  price?: string
  roi?: string
  units?: number
}

/**
 * Map view configuration
 */
export interface MapViewConfig {
  center: Coordinates
  zoom: number
  minZoom?: number
  maxZoom?: number
  mapType?: "roadmap" | "satellite" | "hybrid" | "terrain"
}

/**
 * Map bounds for filtering properties
 */
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

/**
 * Map interaction state
 */
export interface MapInteractionState {
  isDragging: boolean
  isZooming: boolean
  selectedMarkerId?: string
  hoveredMarkerId?: string
}

/**
 * Map filter options
 */
export interface MapFilters {
  priceRange?: {
    min: number
    max: number
  }
  roiRange?: {
    min: number
    max: number
  }
  unitsRange?: {
    min: number
    max: number
  }
  propertyTypes?: string[]
}
