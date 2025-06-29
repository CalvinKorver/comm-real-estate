import { NextRequest, NextResponse } from 'next/server';
import { CSVRow, processCSVRow, validateCSVRow, createContactsForOwner } from './csv-processor';
import { prisma } from '@/lib/shared/prisma';
import { createContactsFromCSV } from '@/types/contact';
import { CoordinateService } from './coordinate-service';

export interface UploadResult {
  success: boolean;
  message: string;
  processedRows: number;
  errors: Array<{
    row: number;
    address: string;
    errors: string[];
  }>;
  duplicates: Array<{
    row: number;
    address: string;
    message: string;
  }>;
  createdOwners: number;
  createdProperties: number;
  createdContacts: number;
  geocodedProperties: number;
  geocodingErrors: string[];
}

export interface ProcessedData {
  owners: Array<{
    firstName: string;
    lastName: string;
    fullName?: string;
    llcContact?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }>;
  properties: Array<{
    street_address: string;
    city: string;
    zip_code: number;
    state?: string;
    parcel_id?: string;
  }>;
  contacts: Array<{
    ownerId: string;
    phone?: string;
    email?: string;
    type: string;
    priority: number;
  }>;
}

// Smart name parsing function
function parseOwnerName(fullName: string): {
  firstName: string;
  lastName: string;
  fullName: string;
  isLLC: boolean;
  llcName?: string;
} {
  const trimmedName = fullName.trim();
  
  // Check if it's an LLC
  if (trimmedName.toLowerCase().includes('llc')) {
    return {
      firstName: trimmedName, // Store full LLC name as firstName
      lastName: '', // Empty lastName for LLCs
      fullName: trimmedName,
      isLLC: true,
      llcName: trimmedName,
    };
  }

  // Handle various separators and formats
  const separators = ['&', 'and', 'AND', 'And'];
  let parts: string[] = [];
  
  // Try to split by common separators
  for (const separator of separators) {
    if (trimmedName.includes(separator)) {
      parts = trimmedName.split(separator).map(part => part.trim()).filter(part => part);
      break;
    }
  }
  
  // If no separator found, try to split by spaces and look for patterns
  if (parts.length === 0) {
    const words = trimmedName.split(' ').filter(word => word);
    
    // Handle single names
    if (words.length === 1) {
      return {
        firstName: words[0],
        lastName: '',
        fullName: trimmedName,
        isLLC: false,
      };
    }
    
    // Handle two-word names (likely first + last)
    if (words.length === 2) {
      return {
        firstName: words[0],
        lastName: words[1],
        fullName: trimmedName,
        isLLC: false,
      };
    }
    
    // For longer names, try to identify patterns
    // Look for initials (single letters)
    const initials = words.filter(word => word.length === 1);
    const fullWords = words.filter(word => word.length > 1);
    
    if (initials.length > 0 && fullWords.length > 0) {
      // Pattern like "A Ashenbrenner & M Suzanna"
      const firstName = initials[0] + ' ' + fullWords[0];
      const lastName = fullWords.slice(1).join(' ');
      return {
        firstName,
        lastName,
        fullName: trimmedName,
        isLLC: false,
      };
    }
    
    // Default: first word as first name, rest as last name
    return {
      firstName: words[0],
      lastName: words.slice(1).join(' '),
      fullName: trimmedName,
      isLLC: false,
    };
  }
  
  // Handle multiple parts (multiple people)
  if (parts.length === 2) {
    // Two people: "Aaron & Abby Cave"
    const person1 = parts[0].split(' ').filter(word => word);
    const person2 = parts[1].split(' ').filter(word => word);
    
    // Combine the names intelligently
    let firstName = '';
    let lastName = '';
    
    if (person1.length === 1 && person2.length === 1) {
      // "Aaron & Abby" - both first names
      firstName = person1[0] + ' & ' + person2[0];
      lastName = '';
    } else if (person1.length === 1 && person2.length === 2) {
      // "Aaron & Abby Cave" - first person has first name, second has first + last
      firstName = person1[0] + ' & ' + person2[0];
      lastName = person2[1];
    } else if (person1.length === 2 && person2.length === 1) {
      // "Aaron Cave & Abby" - first person has first + last, second has first name
      firstName = person1[0] + ' & ' + person2[0];
      lastName = person1[1];
    } else if (person1.length === 2 && person2.length === 2) {
      // "Aaron Cave & Abby Smith" - both have first + last
      firstName = person1[0] + ' & ' + person2[0];
      lastName = person1[1] + ' & ' + person2[1];
    } else {
      // Complex case, just combine
      firstName = parts[0];
      lastName = parts[1];
    }
    
    return {
      firstName,
      lastName,
      fullName: trimmedName,
      isLLC: false,
    };
  }
  
  // More than 2 parts - complex case
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' & '),
    fullName: trimmedName,
    isLLC: false,
  };
}

export async function processCSVUpload(file: File): Promise<UploadResult> {
  try {
    // Read the file content
    const text = await file.text();
    const lines = text.split('\n');
    
    // Parse CSV headers (assuming first line is headers)
    const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const result: UploadResult = {
      success: true,
      message: 'CSV processed successfully',
      processedRows: 0,
      errors: [],
      duplicates: [],
      createdOwners: 0,
      createdProperties: 0,
      createdContacts: 0,
      geocodedProperties: 0,
      geocodingErrors: [],
    };

    // Initialize coordinate service
    const coordinateService = new CoordinateService();

    // Track addresses to detect duplicates
    const processedAddresses = new Set<string>();
    const validRows: Array<{ row: number; csvRow: CSVRow; address: string }> = [];

    // First pass: validate all rows and collect valid ones
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const values = parseCSVLine(line);
      
      // Create CSV row object
      const csvRow: CSVRow = {};
      headers.forEach((header, index) => {
        csvRow[header as keyof CSVRow] = values[index] || '';
      });

      // Get the address for error reporting
      const address = csvRow.Address || 'Unknown Address';
      const normalizedAddress = address.toLowerCase().trim();

      // Check for duplicates
      if (processedAddresses.has(normalizedAddress)) {
        result.duplicates.push({
          row: i + 2,
          address: `"${address}"`,
          message: 'Duplicate address - only first occurrence will be processed',
        });
        continue;
      }
      processedAddresses.add(normalizedAddress);

      // Validate row
      const validation = validateCSVRow(csvRow);
      if (!validation.isValid) {
        result.errors.push({
          row: i + 2,
          address: `"${address}"`,
          errors: validation.errors,
        });
        continue;
      }

      // Add to valid rows for processing
      validRows.push({ row: i + 2, csvRow, address });
    }

    // Second pass: process valid rows and save to database
    for (const { row, csvRow, address } of validRows) {
      try {
        // Process the row
        const { owner, property } = processCSVRow(csvRow);
        
        // Handle unknown zip and city values
        if (property.zip_code === 0) {
          property.zip_code = -1; // Use -1 to represent "unknown" in database
        }
        if (!property.city || property.city.trim() === '') {
          property.city = 'unknown';
        }

        // Parse the owner name intelligently
        const parsedName = parseOwnerName(owner.fullName || '');
        
        // Create owner with parsed name
        const createdOwner = await prisma.owner.create({
          data: {
            firstName: parsedName.firstName,
            lastName: parsedName.lastName,
            fullName: parsedName.fullName,
            llcContact: owner.llcContact,
            streetAddress: owner.streetAddress,
            city: owner.city,
            state: owner.state,
            zipCode: owner.zipCode,
          },
        });

        // Create property and link to owner
        const createdProperty = await prisma.property.create({
          data: {
            street_address: property.street_address,
            city: property.city,
            zip_code: property.zip_code,
            state: property.state,
            parcel_id: property.parcel_id,
            net_operating_income: 0, // Default values for now
            price: 0,
            return_on_investment: 0,
            number_of_units: 0,
            square_feet: 0,
            owners: {
              connect: { id: createdOwner.id }
            }
          },
        });

        // Create contacts for the owner
        const contactInputs = createContactsFromCSV(createdOwner.id, csvRow);
        const createdContacts = await prisma.contact.createMany({
          data: contactInputs,
        });

        // Geocode the property
        try {
          const coordinates = await coordinateService.getOrCreateCoordinates(
            createdProperty.id,
            property.street_address,
            property.city,
            property.state,
            property.zip_code.toString()
          );

          if (coordinates) {
            result.geocodedProperties++;
          } else {
            result.geocodingErrors.push(`Failed to geocode: ${property.street_address}, ${property.city}`);
          }
        } catch (geocodingError) {
          result.geocodingErrors.push(`Geocoding error for ${property.street_address}: ${geocodingError}`);
        }

        result.createdOwners++;
        result.createdProperties++;
        result.createdContacts += createdContacts.count;
        result.processedRows++;

      } catch (error) {
        console.error(`Error processing row ${row} (${address}):`, error);
        result.errors.push({
          row,
          address: `"${address}"`,
          errors: [error instanceof Error ? error.message : 'Database error occurred'],
        });
      }
    }

    return result;
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      processedRows: 0,
      errors: [],
      duplicates: [],
      createdOwners: 0,
      createdProperties: 0,
      createdContacts: 0,
      geocodedProperties: 0,
      geocodingErrors: [],
    };
  }
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Future method to actually save data to database
export async function saveProcessedData(data: ProcessedData): Promise<UploadResult> {
  // This will be implemented next
  // For now, just return a dummy result
  return {
    success: true,
    message: 'Data would be saved to database (dummy method)',
    processedRows: data.owners.length,
    errors: [],
    duplicates: [],
    createdOwners: data.owners.length,
    createdProperties: data.properties.length,
    createdContacts: data.contacts.length,
    geocodedProperties: 0,
    geocodingErrors: [],
  };
} 