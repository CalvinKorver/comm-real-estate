import { BatchGeocodingService } from "@/lib/services/batch-geocoding"
import { CoordinateService } from "@/lib/services/coordinate-service"
import { GoogleGeocodingClient } from "@/lib/services/google-geocoding-client"

// Mock the environment variable for testing
const mockApiKey = "test-api-key"

describe("Geocoding Services", () => {
  describe("GoogleGeocodingClient", () => {
    let client: GoogleGeocodingClient

    beforeEach(() => {
      client = new GoogleGeocodingClient(mockApiKey)
    })

    it("should build full address correctly", () => {
      const request = {
        address: "123 Main St",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "US",
      }

      // Access the protected method through the class
      const fullAddress = (client as any).buildFullAddress(request)
      expect(fullAddress).toBe("123 Main St, Seattle, WA, 98101, US")
    })

    it("should validate coordinates correctly", () => {
      expect((client as any).validateCoordinates(47.6062, -122.3321)).toBe(true)
      expect((client as any).validateCoordinates(91, 0)).toBe(false) // Invalid latitude
      expect((client as any).validateCoordinates(0, 181)).toBe(false) // Invalid longitude
      expect((client as any).validateCoordinates(NaN, 0)).toBe(false) // Invalid values
    })

    it("should determine confidence correctly", () => {
      expect((client as any).determineConfidence(["street_address"])).toBe(
        "high"
      )
      expect((client as any).determineConfidence(["route"])).toBe("medium")
      expect((client as any).determineConfidence(["locality"])).toBe("low")
    })
  })

  describe("CoordinateService", () => {
    let service: CoordinateService

    beforeEach(() => {
      service = new CoordinateService()
    })

    it("should be instantiated correctly", () => {
      expect(service).toBeInstanceOf(CoordinateService)
    })
  })

  describe("BatchGeocodingService", () => {
    let service: BatchGeocodingService

    beforeEach(() => {
      service = new BatchGeocodingService()
    })

    it("should be instantiated correctly", () => {
      expect(service).toBeInstanceOf(BatchGeocodingService)
    })
  })
})
