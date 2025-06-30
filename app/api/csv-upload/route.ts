import { NextRequest, NextResponse } from 'next/server';
import { processCSVUpload } from '@/lib/services/csv-upload-processor';

export async function POST(request: NextRequest) {
  try {
    // Check if the request has a file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const columnMappingJson = formData.get('columnMapping') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      );
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Parse column mapping
    let columnMapping: Record<string, string | null> = {};
    if (columnMappingJson) {
      try {
        columnMapping = JSON.parse(columnMappingJson);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid column mapping format' },
          { status: 400 }
        );
      }
    }

    console.log(`Processing CSV file: ${file.name} (${file.size} bytes)`);
    console.log('Column mapping:', columnMapping);

    // Process the CSV file with column mapping
    const result = await processCSVUpload(file, columnMapping);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    // Return the processing results
    return NextResponse.json({
      success: true,
      message: result.message,
      summary: {
        processedRows: result.processedRows,
        errors: result.errors.length,
        duplicates: result.duplicates.length,
        createdOwners: result.createdOwners,
        createdProperties: result.createdProperties,
        createdContacts: result.createdContacts,
        geocodedProperties: result.geocodedProperties,
        geocodingErrors: result.geocodingErrors.length,
        mergedProperties: result.mergedProperties,
        mergedOwners: result.mergedOwners,
        reconciliationSummary: result.reconciliationSummary,
      },
      errors: result.errors,
      duplicates: result.duplicates,
      geocodingErrors: result.geocodingErrors,
    });

  } catch (error) {
    console.error('Error in CSV upload endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process CSV file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 