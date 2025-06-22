import { NextRequest, NextResponse } from 'next/server';
import { BatchGeocodingService } from '@/lib/services/batch-geocoding';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const batchService = new BatchGeocodingService();
    const result = await batchService.geocodeProperty(propertyId);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to geocode property'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property geocoded successfully',
      propertyId,
    });
  } catch (error) {
    console.error('Error geocoding property:', error);
    return NextResponse.json(
      { 
        error: 'Failed to geocode property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 