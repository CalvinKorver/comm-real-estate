import { prisma } from '@/lib/shared/prisma';
import { getGeocodingService } from './geocoding-service';

export interface CoordinateData {
  latitude: number;
  longitude: number;
  confidence: 'high' | 'medium' | 'low';
  placeId?: string;
}

export class CoordinateService {
  /**
   * Get coordinates for a property, geocoding if necessary
   */
  async getOrCreateCoordinates(
    propertyId: string,
    streetAddress: string,
    city: string,
    state?: string,
    zipCode?: string
  ): Promise<CoordinateData | null> {
    try {
      // First, try to get existing coordinates
      const existingCoordinates = await prisma.coordinate.findUnique({
        where: { propertyId },
      });

      if (existingCoordinates) {
        return {
          latitude: existingCoordinates.latitude,
          longitude: existingCoordinates.longitude,
          confidence: existingCoordinates.confidence as 'high' | 'medium' | 'low',
          placeId: existingCoordinates.placeId || undefined,
        };
      }

      // If no coordinates exist, geocode the address
      const geocodingService = getGeocodingService();
      const geocodingResult = await geocodingService.geocodeProperty(
        streetAddress,
        city,
        state,
        zipCode
      );

      if (!geocodingResult) {
        console.warn(`Failed to geocode address: ${streetAddress}, ${city}, ${state} ${zipCode}`);
        return null;
      }

      // Save the coordinates to the database
      const savedCoordinates = await prisma.coordinate.create({
        data: {
          propertyId,
          latitude: geocodingResult.coordinates.lat,
          longitude: geocodingResult.coordinates.lng,
          confidence: geocodingResult.confidence,
          placeId: geocodingResult.placeId,
        },
      });

      return {
        latitude: savedCoordinates.latitude,
        longitude: savedCoordinates.longitude,
        confidence: savedCoordinates.confidence as 'high' | 'medium' | 'low',
        placeId: savedCoordinates.placeId || undefined,
      };
    } catch (error) {
      console.error('Error getting or creating coordinates:', error);
      return null;
    }
  }

  /**
   * Update coordinates for a property
   */
  async updateCoordinates(
    propertyId: string,
    coordinates: CoordinateData
  ): Promise<CoordinateData | null> {
    try {
      const updatedCoordinates = await prisma.coordinate.upsert({
        where: { propertyId },
        update: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          confidence: coordinates.confidence,
          placeId: coordinates.placeId,
          updatedAt: new Date(),
        },
        create: {
          propertyId,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          confidence: coordinates.confidence,
          placeId: coordinates.placeId,
        },
      });

      return {
        latitude: updatedCoordinates.latitude,
        longitude: updatedCoordinates.longitude,
        confidence: updatedCoordinates.confidence as 'high' | 'medium' | 'low',
        placeId: updatedCoordinates.placeId || undefined,
      };
    } catch (error) {
      console.error('Error updating coordinates:', error);
      return null;
    }
  }

  /**
   * Get coordinates for multiple properties
   */
  async getCoordinatesForProperties(propertyIds: string[]): Promise<Map<string, CoordinateData>> {
    try {
      const coordinates = await prisma.coordinate.findMany({
        where: {
          propertyId: { in: propertyIds },
        },
      });

      const coordinatesMap = new Map<string, CoordinateData>();
      
      for (const coord of coordinates) {
        coordinatesMap.set(coord.propertyId, {
          latitude: coord.latitude,
          longitude: coord.longitude,
          confidence: coord.confidence as 'high' | 'medium' | 'low',
          placeId: coord.placeId || undefined,
        });
      }

      return coordinatesMap;
    } catch (error) {
      console.error('Error getting coordinates for properties:', error);
      return new Map();
    }
  }

  /**
   * Delete coordinates for a property
   */
  async deleteCoordinates(propertyId: string): Promise<boolean> {
    try {
      await prisma.coordinate.delete({
        where: { propertyId },
      });
      return true;
    } catch (error) {
      console.error('Error deleting coordinates:', error);
      return false;
    }
  }

  /**
   * Batch geocode properties that don't have coordinates
   */
  async batchGeocodeProperties(properties: Array<{
    id: string;
    street_address: string;
    city: string;
    state?: string;
    zip_code: number;
  }>): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const geocodingService = getGeocodingService();

    for (const property of properties) {
      try {
        // Check if coordinates already exist
        const existingCoordinates = await prisma.coordinate.findUnique({
          where: { propertyId: property.id },
        });

        if (existingCoordinates) {
          continue; // Skip if coordinates already exist
        }

        // Geocode the property
        const geocodingResult = await geocodingService.geocodeProperty(
          property.street_address,
          property.city,
          property.state,
          property.zip_code.toString()
        );

        if (geocodingResult) {
          // Save coordinates
          await prisma.coordinate.create({
            data: {
              propertyId: property.id,
              latitude: geocodingResult.coordinates.lat,
              longitude: geocodingResult.coordinates.lng,
              confidence: geocodingResult.confidence,
              placeId: geocodingResult.placeId,
            },
          });
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`Failed to geocode: ${property.street_address}, ${property.city}`);
        }

        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.failed++;
        results.errors.push(`Error geocoding ${property.street_address}: ${error}`);
      }
    }

    return results;
  }
} 