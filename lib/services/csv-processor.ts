import { createContactsFromCSV } from '@/types/contact';

export interface CSVRow {
  OwnerName?: string;
  'LLC Contact'?: string;
  'Email 1'?: string;
  'Email 2'?: string;
  Address?: string;
  City?: string;
  Zip?: string;
  State?: string;
  ParcelId?: string;
  OwnerAddress?: string;
  OwnerCity?: string;
  OwnerState?: string;
  OwnerZip?: string;
  'Wireless 1'?: string;
  'Wireless 2'?: string;
  'Wireless 3'?: string;
  'Wireless 4'?: string;
  'Landline 1'?: string;
  'Landline 2'?: string;
  'Landline 3'?: string;
  'Landline 4'?: string;
}

export interface ProcessedOwner {
  first_name: string;
  last_name: string;
  full_name?: string;
  llc_contact?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contacts: Array<{
    phone?: string;
    email?: string;
    type: string;
    priority: number;
  }>;
}

export interface ProcessedProperty {
  street_address: string;
  city: string;
  zip_code: number;
  state?: string;
  parcel_id?: string;
}

export function processCSVRow(row: CSVRow): {
  owner: ProcessedOwner;
  property: ProcessedProperty;
} {
  // Process owner name
  const ownerName = row.OwnerName || '';
  const nameParts = ownerName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Process owner data
  const owner: ProcessedOwner = {
    first_name: firstName,
    last_name: lastName,
    full_name: ownerName || undefined,
    llc_contact: row['LLC Contact'] || undefined,
    street_address: row.OwnerAddress || undefined,
    city: row.OwnerCity || undefined,
    state: row.OwnerState || undefined,
    zip_code: row.OwnerZip || undefined,
    contacts: [], // Will be populated below
  };

  // Process property data
  const city = row.City?.trim() || 'unknown';
  const zipStr = row.Zip?.trim() || '0';
  const zipCode = parseInt(zipStr, 10) || 0;
  
  const property: ProcessedProperty = {
    street_address: row.Address || '',
    city: city,
    zip_code: zipCode,
    state: row.State || undefined,
    parcel_id: row.ParcelId || undefined,
  };

  // Process contacts (will be added after owner is created)
  // We'll use the helper function from contact.ts
  // This will be called after the owner is created and we have the ownerId

  return { owner, property };
}

export function validateCSVRow(row: CSVRow): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!row.OwnerName?.trim()) {
    errors.push('OwnerName is required');
  }

  if (!row.Address?.trim()) {
    errors.push('Address is required');
  }

  // City and Zip are now optional - will be set to "unknown" if empty
  // if (!row.City?.trim()) {
  //   errors.push('City is required');
  // }

  // if (!row.Zip?.trim()) {
  //   errors.push('Zip is required');
  // }

  // Validate zip code format only if zip is provided
  if (row.Zip && row.Zip.trim() && !/^\d{5}(-\d{4})?$/.test(row.Zip)) {
    errors.push('Zip code must be in valid format (e.g., 12345 or 12345-6789)');
  }

  // Validate email formats
  if (row['Email 1'] && !isValidEmail(row['Email 1'])) {
    errors.push('Email 1 is not in valid format');
  }

  if (row['Email 2'] && !isValidEmail(row['Email 2'])) {
    errors.push('Email 2 is not in valid format');
  }

  // Validate phone formats (basic validation)
  const phoneFields = [
    'Wireless 1', 'Wireless 2', 'Wireless 3', 'Wireless 4',
    'Landline 1', 'Landline 2', 'Landline 3', 'Landline 4'
  ];

  phoneFields.forEach(field => {
    if (row[field as keyof CSVRow] && !isValidPhone(row[field as keyof CSVRow] as string)) {
      errors.push(`${field} is not in valid phone format`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Must have digits to be valid
  if (digitsOnly.length === 0) {
    return false;
  }
  
  // Valid US phone numbers should be:
  // - 10 digits (US domestic) and first digit 2-9
  // - 11 digits starting with 1 (US with country code)
  if (digitsOnly.length === 10) {
    // First digit should be 2-9 for valid US area codes
    return digitsOnly[0] >= '2' && digitsOnly[0] <= '9';
  } else if (digitsOnly.length === 11) {
    return digitsOnly.startsWith('1');
  }
  
  return false;
}

export function createContactsForOwner(ownerId: string, row: CSVRow) {
  return createContactsFromCSV(ownerId, row);
} 