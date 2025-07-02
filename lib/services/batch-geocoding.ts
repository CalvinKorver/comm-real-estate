import { prisma } from '@/lib/shared/prisma';
import { CoordinateService } from './coordinate-service';
import { Property } from '@/generated/prisma';

export interface BatchGeocodingResult {
  totalProperties: number;
  propertiesWithCoordinates: number;
  propertiesWithoutCoordinates: number;
  geocodedSuccessfully: number;
  geocodingFailed: number;
  errors: string[];
  estimatedTimeRemaining?: string;
}

export class BatchGeocodingService {
  private coordinateService: CoordinateService;

  constructor() {
    this.coordinateService = new CoordinateService();
  }

  /**
   * Get statistics about properties and their coordinate status
   */
  async getGeocodingStats(): Promise<BatchGeocodingResult> {
    try {
      const totalProperties = await prisma.property.count();
      const propertiesWithCoordinates = await prisma.coordinate.count();
      const propertiesWithoutCoordinates = totalProperties - propertiesWithCoordinates;

      return {
        totalProperties,
        propertiesWithCoordinates,
        propertiesWithoutCoordinates,
        geocodedSuccessfully: 0,
        geocodingFailed: 0,
        errors: [],
      };
    } catch (error) {
      console.error('Error getting geocoding stats:', error);
      return {
        totalProperties: 0,
        propertiesWithCoordinates: 0,
        propertiesWithoutCoordinates: 0,
        geocodedSuccessfully: 0,
        geocodingFailed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Batch geocode properties that don't have coordinates
   */
  async batchGeocodeAllProperties(
    batchSize: number = 10,
    delayBetweenBatches: number = 1000
  ): Promise<BatchGeocodingResult> {
    try {
      // Get properties without coordinates
      const propertiesWithoutCoordinates = await prisma.property.findMany({
        where: {
          coordinates: null,
        },
        select: {
          id: true,
          street_address: true,
          city: true,
          state: true,
          zip_code: true,
        },
      });

      const result: BatchGeocodingResult = {
        totalProperties: await prisma.property.count(),
        propertiesWithCoordinates: await prisma.coordinate.count(),
        propertiesWithoutCoordinates: propertiesWithoutCoordinates.length,
        geocodedSuccessfully: 0,
        geocodingFailed: 0,
        errors: [],
      };

      if (propertiesWithoutCoordinates.length === 0) {
        return result;
      }

      // Convert null values to undefined for the geocoding service
      const propertiesForGeocoding = propertiesWithoutCoordinates.map((property: { id: string; street_address: string; city: string; state: string | null; zip_code: number }) => ({
        ...property,
        state: property.state || undefined,
      }));

      // Process in batches
      for (let i = 0; i < propertiesForGeocoding.length; i += batchSize) {
        const batch = propertiesForGeocoding.slice(i, i + batchSize);
        
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(propertiesForGeocoding.length / batchSize)}`);
        
        const batchResult = await this.coordinateService.batchGeocodeProperties(batch);
        
        result.geocodedSuccessfully += batchResult.success;
        result.geocodingFailed += batchResult.failed;
        result.errors.push(...batchResult.errors);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < propertiesForGeocoding.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      return result;
    } catch (error) {
      console.error('Error in batch geocoding:', error);
      return {
        totalProperties: 0,
        propertiesWithCoordinates: 0,
        propertiesWithoutCoordinates: 0,
        geocodedSuccessfully: 0,
        geocodingFailed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Geocode a specific property by ID
   */
  async geocodeProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          street_address: true,
          city: true,
          state: true,
          zip_code: true,
        },
      });

      if (!property) {
        return { success: false, error: 'Property not found' };
      }

      const coordinates = await this.coordinateService.getOrCreateCoordinates(
        property.id,
        property.street_address,
        property.city,
        property.state || '',
        property.zip_code.toString()
      );

      return {
        success: !!coordinates,
        error: coordinates ? undefined : 'Failed to geocode property',
      };
    } catch (error) {
      console.error('Error geocoding property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get properties that need geocoding
   */
  async getPropertiesNeedingGeocoding(limit: number = 100): Promise<Array<{
    id: string;
    street_address: string;
    city: string;
    state?: string;
    zip_code: number;
  }>> {
    try {
      const properties = await prisma.property.findMany({
        where: {
          coordinates: null,
        },
        select: {
          id: true,
          street_address: true,
          city: true,
          state: true,
          zip_code: true,
        },
        take: limit,
      });

      // Convert null values to undefined
      return properties.map((property: { id: string; street_address: string; city: string; state: string | null; zip_code: number }) => ({
        ...property,
        state: property.state || undefined,
      }));
    } catch (error) {
      console.error('Error getting properties needing geocoding:', error);
      return [];
    }
  }
} 