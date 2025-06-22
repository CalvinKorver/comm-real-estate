export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Extract coordinates from property address
 * This is a placeholder for actual geocoding service integration
 */
export function extractCoordinatesFromAddress(
  streetAddress: string,
  city: string,
  state?: string,
  zipCode?: string | number
): Coordinates | null {
  // TODO: Integrate with actual geocoding service (Google Maps, Mapbox, etc.)
  // For now, return null to indicate coordinates need to be fetched
  return null
}

/**
 * Provide fallback coordinates for a given city/state
 * Useful when exact address geocoding fails
 */
export function getFallbackCoordinates(city: string, state?: string): Coordinates {
  // Common fallback coordinates for major cities
  const fallbackCoords: Record<string, Coordinates> = {
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Philadelphia': { lat: 39.9526, lng: -75.1652 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
    'Dallas': { lat: 32.7767, lng: -96.7970 },
    'San Jose': { lat: 37.3382, lng: -121.8863 },
  }

  const locationKey = state ? `${city}, ${state}` : city
  return fallbackCoords[locationKey] || { lat: 39.8283, lng: -98.5795 } // US center
}

/**
 * Basic coordinate validation
 */
export function validateCoordinates(coordinates: Coordinates): boolean {
  return (
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180 &&
    !isNaN(coordinates.lat) &&
    !isNaN(coordinates.lng)
  )
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180)
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
} 