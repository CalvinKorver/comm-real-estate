import {
  BaseGeocodingClient,
  GeocodingRequest,
  GeocodingResult,
} from "./geocoding-client"

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    place_id: string
    types: string[]
  }>
  status: string
}

export class GoogleGeocodingClient extends BaseGeocodingClient {
  private apiKey: string
  private baseUrl = "https://maps.googleapis.com/maps/api/geocode/json"

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async geocode(request: GeocodingRequest): Promise<GeocodingResult | null> {
    try {
      const fullAddress = this.buildFullAddress(request)
      const url = `${this.baseUrl}?address=${encodeURIComponent(fullAddress)}&key=${this.apiKey}`

      const response = await fetch(url)
      const data: GoogleGeocodingResponse = await response.json()

      if (data.status !== "OK" || !data.results.length) {
        console.warn(
          `Geocoding failed for address: ${fullAddress}. Status: ${data.status}`
        )
        return null
      }

      const result = data.results[0]
      const coordinates = result.geometry.location

      if (!this.validateCoordinates(coordinates.lat, coordinates.lng)) {
        console.warn(`Invalid coordinates returned for address: ${fullAddress}`)
        return null
      }

      return {
        coordinates,
        formattedAddress: result.formatted_address,
        confidence: this.determineConfidence(result.types),
        placeId: result.place_id,
      }
    } catch (error) {
      console.error("Error during geocoding:", error)
      return null
    }
  }

  async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<GeocodingResult | null> {
    try {
      if (!this.validateCoordinates(lat, lng)) {
        console.warn(
          `Invalid coordinates for reverse geocoding: ${lat}, ${lng}`
        )
        return null
      }

      const url = `${this.baseUrl}?latlng=${lat},${lng}&key=${this.apiKey}`

      const response = await fetch(url)
      const data: GoogleGeocodingResponse = await response.json()

      if (data.status !== "OK" || !data.results.length) {
        console.warn(
          `Reverse geocoding failed for coordinates: ${lat}, ${lng}. Status: ${data.status}`
        )
        return null
      }

      const result = data.results[0]

      return {
        coordinates: { lat, lng },
        formattedAddress: result.formatted_address,
        confidence: this.determineConfidence(result.types),
        placeId: result.place_id,
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error)
      return null
    }
  }

  private determineConfidence(types: string[]): "high" | "medium" | "low" {
    // High confidence: street_address, premise, subpremise
    if (
      types.some((type) =>
        ["street_address", "premise", "subpremise"].includes(type)
      )
    ) {
      return "high"
    }

    // Medium confidence: route, intersection, neighborhood
    if (
      types.some((type) =>
        ["route", "intersection", "neighborhood"].includes(type)
      )
    ) {
      return "medium"
    }

    // Low confidence: locality, administrative_area_level_1, etc.
    return "low"
  }
}
