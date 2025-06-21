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
  firstName: string;
  lastName: string;
  fullName?: string;
  llcContact?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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
    firstName,
    lastName,
    fullName: ownerName || undefined,
    llcContact: row['LLC Contact'] || undefined,
    streetAddress: row.OwnerAddress || undefined,
    city: row.OwnerCity || undefined,
    state: row.OwnerState || undefined,
    zipCode: row.OwnerZip || undefined,
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
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone);
}

export function createContactsForOwner(ownerId: string, row: CSVRow) {
  return createContactsFromCSV(ownerId, row);
} 