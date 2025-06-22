import { GeocodingClient, GeocodingRequest, GeocodingResult } from './geocoding-client';
import { GoogleGeocodingClient } from './google-geocoding-client';

export type GeocodingProvider = 'google' | 'mapbox' | 'nominatim';

export class GeocodingService {
  private client: GeocodingClient;

  constructor(provider: GeocodingProvider = 'google') {
    this.client = this.createClient(provider);
  }

  private createClient(provider: GeocodingProvider): GeocodingClient {
    switch (provider) {
      case 'google':
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key is required for geocoding');
        }
        return new GoogleGeocodingClient(apiKey);
      
      case 'mapbox':
        // TODO: Implement Mapbox geocoding client
        throw new Error('Mapbox geocoding not yet implemented');
      
      case 'nominatim':
        // TODO: Implement OpenStreetMap Nominatim geocoding client
        throw new Error('Nominatim geocoding not yet implemented');
      
      default:
        throw new Error(`Unsupported geocoding provider: ${provider}`);
    }
  }

  async geocode(request: GeocodingRequest): Promise<GeocodingResult | null> {
    return this.client.geocode(request);
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    return this.client.reverseGeocode(lat, lng);
  }

  // Convenience method for property addresses
  async geocodeProperty(
    streetAddress: string,
    city: string,
    state?: string,
    zipCode?: string
  ): Promise<GeocodingResult | null> {
    return this.geocode({
      address: streetAddress,
      city,
      state,
      zipCode,
      country: 'US', // Default to US for this application
    });
  }
}

// Singleton instance for easy use throughout the application
let geocodingServiceInstance: GeocodingService | null = null;

export function getGeocodingService(provider?: GeocodingProvider): GeocodingService {
  if (!geocodingServiceInstance) {
    geocodingServiceInstance = new GeocodingService(provider);
  }
  return geocodingServiceInstance;
} 