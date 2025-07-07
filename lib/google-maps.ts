// Google Maps API Configuration and Utilities

import type {
  Bounds,
  Coordinates,
  ErrorType,
  LoadingState,
  MapConfig,
  MapInitializationOptions,
  MapState,
  MapStyle,
  MapViewport,
  MarkerConfig,
  PropertyMarker,
} from "@/types/map"

import {
  ANIMATION_DURATIONS,
  DEFAULT_MAP_CONFIG,
  ERROR_TYPES,
  INTERACTION_SETTINGS,
  LOADING_STATES,
  MAP_CENTERS,
  MAP_LIMITS,
  MAP_STYLES,
  MARKER_SETTINGS,
  ZOOM_LEVELS,
} from "./map-constants"

// Custom map styles for different themes
export const MAP_STYLE_CONFIGS: Record<MapStyle, google.maps.MapTypeStyle[]> = {
  [MAP_STYLES.LIGHT]: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
  [MAP_STYLES.DARK]: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
  [MAP_STYLES.SATELLITE]: [], // Satellite uses default Google Maps styling
  [MAP_STYLES.TERRAIN]: [], // Terrain uses default Google Maps styling
}

// API Key Management
export class GoogleMapsAPIKeyManager {
  private static instance: GoogleMapsAPIKeyManager
  private apiKey: string | null = null
  private isLoaded: boolean = false
  private loadPromise: Promise<void> | null = null

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null
  }

  static getInstance(): GoogleMapsAPIKeyManager {
    if (!GoogleMapsAPIKeyManager.instance) {
      GoogleMapsAPIKeyManager.instance = new GoogleMapsAPIKeyManager()
    }
    return GoogleMapsAPIKeyManager.instance
  }

  getAPIKey(): string | null {
    return this.apiKey
  }

  setAPIKey(key: string): void {
    this.apiKey = key
  }

  hasAPIKey(): boolean {
    return !!this.apiKey
  }

  isAPILoaded(): boolean {
    return this.isLoaded
  }

  // Load Google Maps API
  async loadAPI(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve()
    }

    if (this.loadPromise) {
      return this.loadPromise
    }

    if (!this.apiKey) {
      throw new Error(
        "Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable."
      )
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true
        resolve()
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      )
      if (existingScript) {
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            this.isLoaded = true
            resolve()
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      // Load the script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        this.isLoaded = true
        resolve()
      }

      script.onerror = () => {
        this.loadPromise = null
        reject(new Error("Failed to load Google Maps API"))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  // Unload API (for cleanup)
  unloadAPI(): void {
    const script = document.querySelector('script[src*="maps.googleapis.com"]')
    if (script) {
      document.head.removeChild(script)
    }
    this.isLoaded = false
    this.loadPromise = null
  }
}

// Map Initialization Utilities
export class MapInitializer {
  private static apiManager = GoogleMapsAPIKeyManager.getInstance()

  static async createMap(
    container: HTMLElement,
    options: MapInitializationOptions = {}
  ): Promise<google.maps.Map> {
    try {
      // Load API if not already loaded
      await this.apiManager.loadAPI()

      // Merge options with defaults
      const config: MapConfig = {
        center: DEFAULT_MAP_CONFIG.center,
        zoom: DEFAULT_MAP_CONFIG.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: INTERACTION_SETTINGS.MAP_TYPE_CONTROL,
        streetViewControl: INTERACTION_SETTINGS.STREET_VIEW_CONTROL,
        fullscreenControl: INTERACTION_SETTINGS.FULLSCREEN_CONTROL,
        zoomControl: INTERACTION_SETTINGS.ZOOM_CONTROL,
        styles: [],
        ...options,
      }

      // Create map instance
      const map = new window.google.maps.Map(container, {
        center: config.center,
        zoom: config.zoom,
        mapTypeId: config.mapTypeId,
        mapTypeControl: config.mapTypeControl,
        streetViewControl: config.streetViewControl,
        fullscreenControl: config.fullscreenControl,
        zoomControl: config.zoomControl,
        styles: config.styles,
        scrollwheel: INTERACTION_SETTINGS.SCROLL_WHEEL,
        draggable: INTERACTION_SETTINGS.DRAGGABLE,
      })

      return map
    } catch (error) {
      throw new Error(
        `Failed to initialize map: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  static async createMapWithCustomStyle(
    container: HTMLElement,
    style: MapStyle = MAP_STYLES.LIGHT,
    options: MapInitializationOptions = {}
  ): Promise<google.maps.Map> {
    const styleConfig =
      MAP_STYLE_CONFIGS[style] || MAP_STYLE_CONFIGS[MAP_STYLES.LIGHT]
    return this.createMap(container, {
      ...options,
      styles: styleConfig,
    })
  }
}

// Error Handling Utilities
export class GoogleMapsErrorHandler {
  static handleAPIError(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return "Google Maps API key is invalid or missing. Please check your configuration."
      }
      if (error.message.includes("Failed to load")) {
        return "Failed to load Google Maps. Please check your internet connection."
      }
      return error.message
    }
    return "An unknown error occurred with Google Maps."
  }

  static getErrorType(error: unknown): ErrorType {
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return ERROR_TYPES.API_KEY_INVALID
      }
      if (error.message.includes("Failed to load")) {
        return ERROR_TYPES.NETWORK_ERROR
      }
      if (error.message.includes("Invalid coordinates")) {
        return ERROR_TYPES.COORDINATES_ERROR
      }
    }
    return ERROR_TYPES.INITIALIZATION_ERROR
  }

  static isAPIKeyError(error: unknown): boolean {
    return this.getErrorType(error) === ERROR_TYPES.API_KEY_INVALID
  }

  static isNetworkError(error: unknown): boolean {
    return this.getErrorType(error) === ERROR_TYPES.NETWORK_ERROR
  }
}

// Utility Functions
export const mapUtils = {
  // Calculate center point from multiple coordinates
  calculateCenter(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
      return DEFAULT_MAP_CONFIG.center
    }

    if (coordinates.length === 1) {
      return coordinates[0]
    }

    const sum = coordinates.reduce(
      (acc, coord) => ({ lat: acc.lat + coord.lat, lng: acc.lng + coord.lng }),
      { lat: 0, lng: 0 }
    )

    return {
      lat: sum.lat / coordinates.length,
      lng: sum.lng / coordinates.length,
    }
  },

  // Calculate bounds from coordinates
  calculateBounds(coordinates: Coordinates[]): Bounds {
    if (coordinates.length === 0) {
      return {
        north: MAP_LIMITS.MAX_LAT,
        south: MAP_LIMITS.MIN_LAT,
        east: MAP_LIMITS.MAX_LNG,
        west: MAP_LIMITS.MIN_LNG,
      }
    }

    const lats = coordinates.map((c) => c.lat)
    const lngs = coordinates.map((c) => c.lng)

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    }
  },

  // Calculate appropriate zoom level for bounds
  calculateZoomForBounds(bounds: Bounds): number {
    const latDiff = Math.abs(bounds.north - bounds.south)
    const lngDiff = Math.abs(bounds.east - bounds.west)
    const maxDiff = Math.max(latDiff, lngDiff)

    if (maxDiff > 180) return ZOOM_LEVELS.WORLD
    if (maxDiff > 90) return ZOOM_LEVELS.CONTINENT
    if (maxDiff > 45) return ZOOM_LEVELS.COUNTRY
    if (maxDiff > 22.5) return ZOOM_LEVELS.STATE
    if (maxDiff > 11.25) return ZOOM_LEVELS.REGION
    if (maxDiff > 5.625) return ZOOM_LEVELS.CITY
    if (maxDiff > 2.813) return ZOOM_LEVELS.DISTRICT
    if (maxDiff > 1.406) return ZOOM_LEVELS.NEIGHBORHOOD
    if (maxDiff > 0.703) return ZOOM_LEVELS.STREET
    return ZOOM_LEVELS.BUILDING
  },

  // Format coordinates for display
  formatCoordinates(coordinates: Coordinates): string {
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
  },

  // Validate coordinates
  isValidCoordinate(coordinates: Coordinates): boolean {
    return (
      coordinates.lat >= MAP_LIMITS.MIN_LAT &&
      coordinates.lat <= MAP_LIMITS.MAX_LAT &&
      coordinates.lng >= MAP_LIMITS.MIN_LNG &&
      coordinates.lng <= MAP_LIMITS.MAX_LNG
    )
  },

  // Calculate distance between two points (Haversine formula)
  distanceBetween(point1: Coordinates, point2: Coordinates): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },
}

// Export singleton instance and constants
export const googleMapsAPI = GoogleMapsAPIKeyManager.getInstance()
export { MAP_CENTERS, ZOOM_LEVELS, MAP_STYLES, LOADING_STATES, ERROR_TYPES }
