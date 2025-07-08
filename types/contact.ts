import { PhoneLabel } from './property'

export interface Contact {
  id: string;
  phone?: string;
  email?: string;
  type: string;
  label?: PhoneLabel;
  priority: number;
  notes?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactInput {
  phone?: string;
  email?: string;
  type: string;
  label?: PhoneLabel;
  priority: number;
  notes?: string;
  ownerId: string;
}

// Common contact types for consistency
export const CONTACT_TYPES = {
  EMAIL: 'Email',
  CELL: 'Cell',
  HOME: 'Home',
  WORK: 'Work',
  LANDLINE: 'Landline',
  FAX: 'Fax',
  BUSINESS: 'Business',
  PERSONAL: 'Personal',
} as const;

export type ContactType = typeof CONTACT_TYPES[keyof typeof CONTACT_TYPES];

// Phone number normalization function
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle different cases:
  // - If 11 digits and starts with 1 (US country code), remove the 1
  // - If 10 digits, use as-is
  // - Otherwise, return as-is (validation will catch invalid formats)
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.substring(1); // Remove leading 1
  } else if (digitsOnly.length == 11 && !digitsOnly.startsWith('1')) {
    throw new Error('Invalid phone number format: should start with 1 for 11-digit numbers');
  } else if (digitsOnly.length === 10) {
    return digitsOnly;
  } else {
    // Return original for validation to catch
    return digitsOnly;
  }
}

// Safe phone number normalization for CSV processing
function safeNormalizePhoneNumber(phone: string): string | null {
  try {
    const normalized = normalizePhoneNumber(phone);
    // Skip empty results (e.g., from whitespace-only input)
    return normalized.length > 0 ? normalized : null;
  } catch (error) {
    // Log the error and skip this phone number
    console.warn(`Skipping invalid phone number during CSV import: ${phone}`, error);
    return null;
  }
}

// Helper function to create contacts from CSV data
export function createContactsFromCSV(
  ownerId: string,
  csvData: {
    'Email 1'?: string;
    'Email 2'?: string;
    'Wireless 1'?: string;
    'Wireless 2'?: string;
    'Wireless 3'?: string;
    'Wireless 4'?: string;
    'Landline 1'?: string;
    'Landline 2'?: string;
    'Landline 3'?: string;
    'Landline 4'?: string;
  }
): CreateContactInput[] {
  const contacts: CreateContactInput[] = [];

  // Process emails
  if (csvData['Email 1']) {
    contacts.push({
      email: csvData['Email 1'],
      type: CONTACT_TYPES.EMAIL,
      priority: 1,
      ownerId,
    });
  }

  if (csvData['Email 2']) {
    contacts.push({
      email: csvData['Email 2'],
      type: CONTACT_TYPES.EMAIL,
      priority: 2,
      ownerId,
    });
  }

  // Process wireless phones
  if (csvData['Wireless 1']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Wireless 1']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId,
      });
    }
  }

  if (csvData['Wireless 2']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Wireless 2']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId,
      });
    }
  }

  if (csvData['Wireless 3']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Wireless 3']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.CELL,
        priority: 3,
        ownerId,
      });
    }
  }

  if (csvData['Wireless 4']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Wireless 4']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.CELL,
        priority: 4,
        ownerId,
      });
    }
  }

  // Process landline phones
  if (csvData['Landline 1']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Landline 1']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId,
      });
    }
  }

  if (csvData['Landline 2']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Landline 2']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.LANDLINE,
        priority: 2,
        ownerId,
      });
    }
  }

  if (csvData['Landline 3']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Landline 3']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.LANDLINE,
        priority: 3,
        ownerId,
      });
    }
  }

  if (csvData['Landline 4']) {
    const normalizedPhone = safeNormalizePhoneNumber(csvData['Landline 4']);
    if (normalizedPhone) {
      contacts.push({
        phone: normalizedPhone,
        type: CONTACT_TYPES.LANDLINE,
        priority: 4,
        ownerId,
      });
    }
  }

  return contacts;
} 