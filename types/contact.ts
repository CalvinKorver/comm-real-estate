export interface Contact {
  id: string;
  phone?: string;
  email?: string;
  type: string;
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
    contacts.push({
      phone: csvData['Wireless 1'],
      type: CONTACT_TYPES.CELL,
      priority: 1,
      ownerId,
    });
  }

  if (csvData['Wireless 2']) {
    contacts.push({
      phone: csvData['Wireless 2'],
      type: CONTACT_TYPES.CELL,
      priority: 2,
      ownerId,
    });
  }

  if (csvData['Wireless 3']) {
    contacts.push({
      phone: csvData['Wireless 3'],
      type: CONTACT_TYPES.CELL,
      priority: 3,
      ownerId,
    });
  }

  if (csvData['Wireless 4']) {
    contacts.push({
      phone: csvData['Wireless 4'],
      type: CONTACT_TYPES.CELL,
      priority: 4,
      ownerId,
    });
  }

  // Process landline phones
  if (csvData['Landline 1']) {
    contacts.push({
      phone: csvData['Landline 1'],
      type: CONTACT_TYPES.LANDLINE,
      priority: 1,
      ownerId,
    });
  }

  if (csvData['Landline 2']) {
    contacts.push({
      phone: csvData['Landline 2'],
      type: CONTACT_TYPES.LANDLINE,
      priority: 2,
      ownerId,
    });
  }

  if (csvData['Landline 3']) {
    contacts.push({
      phone: csvData['Landline 3'],
      type: CONTACT_TYPES.LANDLINE,
      priority: 3,
      ownerId,
    });
  }

  if (csvData['Landline 4']) {
    contacts.push({
      phone: csvData['Landline 4'],
      type: CONTACT_TYPES.LANDLINE,
      priority: 4,
      ownerId,
    });
  }

  return contacts;
} 