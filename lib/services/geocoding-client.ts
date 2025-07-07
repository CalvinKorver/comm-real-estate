export interface GeocodingResult {
  coordinates: {
    lat: number
    lng: number
  }
  formattedAddress: string
  confidence: "high" | "medium" | "low"
  placeId?: string
}

export interface GeocodingRequest {
  address: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface GeocodingClient {
  geocode(request: GeocodingRequest): Promise<GeocodingResult | null>
  reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null>
}

export abstract class BaseGeocodingClient implements GeocodingClient {
  abstract geocode(request: GeocodingRequest): Promise<GeocodingResult | null>
  abstract reverseGeocode(
    lat: number,
    lng: number
  ): Promise<GeocodingResult | null>

  protected buildFullAddress(request: GeocodingRequest): string {
    const parts = [request.address]

    if (request.city) parts.push(request.city)
    if (request.state) parts.push(request.state)
    if (request.zipCode) parts.push(request.zipCode)
    if (request.country) parts.push(request.country)

    return parts.join(", ")
  }

  protected validateCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    )
  }
}
