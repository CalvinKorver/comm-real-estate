// Map Constants and Configuration

// Default Map Centers
export const MAP_CENTERS = {
  NEW_YORK: { lat: 40.7128, lng: -74.0060 },
  LOS_ANGELES: { lat: 34.0522, lng: -118.2437 },
  CHICAGO: { lat: 41.8781, lng: -87.6298 },
  HOUSTON: { lat: 29.7604, lng: -95.3698 },
  PHOENIX: { lat: 33.4484, lng: -112.0740 },
  PHILADELPHIA: { lat: 39.9526, lng: -75.1652 },
  SAN_ANTONIO: { lat: 29.4241, lng: -98.4936 },
  SAN_DIEGO: { lat: 32.7157, lng: -117.1611 },
  DALLAS: { lat: 32.7767, lng: -96.7970 },
  SAN_JOSE: { lat: 37.3382, lng: -121.8863 },
  AUSTIN: { lat: 30.2672, lng: -97.7431 },
  JACKSONVILLE: { lat: 30.3322, lng: -81.6557 },
  FORT_WORTH: { lat: 32.7555, lng: -97.3308 },
  COLUMBUS: { lat: 39.9612, lng: -82.9988 },
  CHARLOTTE: { lat: 35.2271, lng: -80.8431 },
  SAN_FRANCISCO: { lat: 37.7749, lng: -122.4194 },
  INDIANAPOLIS: { lat: 39.7684, lng: -86.1581 },
  SEATTLE: { lat: 47.6062, lng: -122.3321 },
  DENVER: { lat: 39.7392, lng: -104.9903 },
  WASHINGTON_DC: { lat: 38.9072, lng: -77.0369 }
} as const

// Default Zoom Levels
export const ZOOM_LEVELS = {
  WORLD: 1,
  CONTINENT: 3,
  COUNTRY: 5,
  STATE: 7,
  REGION: 9,
  CITY: 11,
  DISTRICT: 13,
  NEIGHBORHOOD: 15,
  STREET: 17,
  BUILDING: 19
} as const

// Default Map Configuration
export const DEFAULT_MAP_CONFIG = {
  center: MAP_CENTERS.NEW_YORK,
  zoom: ZOOM_LEVELS.CITY,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  zoomControl: true
} as const

// Panel Width Ratios
export const PANEL_WIDTHS = {
  LIST_PANEL: {
    DEFAULT: 'w-80',
    MIN: 'min-w-[20rem]',
    MAX: 'max-w-md',
    RESIZABLE: true
  },
  MAP_PANEL: {
    DEFAULT: 'flex-1',
    MIN_WIDTH: 'min-w-0'
  }
} as const

// Map Styling Constants
export const MAP_STYLES = {
  LIGHT: 'light',
  DARK: 'dark',
  SATELLITE: 'satellite',
  TERRAIN: 'terrain'
} as const

// Map Control Positions
export const CONTROL_POSITIONS = {
  TOP_LEFT: 'TOP_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT'
} as const

// Map Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 500,
  SLOW: 1000
} as const

// Map Interaction Settings
export const INTERACTION_SETTINGS = {
  SCROLL_WHEEL: true,
  DRAGGABLE: true,
  ZOOM_CONTROL: true,
  STREET_VIEW_CONTROL: true,
  MAP_TYPE_CONTROL: true,
  FULLSCREEN_CONTROL: true
} as const

// Property Marker Settings
export const MARKER_SETTINGS = {
  DEFAULT_ICON: {
    url: '/markers/default-marker.png',
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 }
  },
  SELECTED_ICON: {
    url: '/markers/selected-marker.png',
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 40 }
  },
  HOVER_ICON: {
    url: '/markers/hover-marker.png',
    scaledSize: { width: 36, height: 36 },
    anchor: { x: 18, y: 36 }
  }
} as const

// Map Bounds and Limits
export const MAP_LIMITS = {
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
  MIN_LAT: -90,
  MAX_LAT: 90,
  MIN_LNG: -180,
  MAX_LNG: 180
} as const

// Responsive Breakpoints for Map
export const MAP_BREAKPOINTS = {
  MOBILE: 'max-width: 768px',
  TABLET: 'min-width: 769px and max-width: 1024px',
  DESKTOP: 'min-width: 1025px'
} as const

// Map Loading States
export const LOADING_STATES = {
  INITIALIZING: 'initializing',
  LOADING_API: 'loading_api',
  CREATING_MAP: 'creating_map',
  LOADING_MARKERS: 'loading_markers',
  READY: 'ready',
  ERROR: 'error'
} as const

// Map Error Types
export const ERROR_TYPES = {
  API_KEY_MISSING: 'api_key_missing',
  API_KEY_INVALID: 'api_key_invalid',
  NETWORK_ERROR: 'network_error',
  INITIALIZATION_ERROR: 'initialization_error',
  CONTAINER_ERROR: 'container_error',
  COORDINATES_ERROR: 'coordinates_error'
} as const 