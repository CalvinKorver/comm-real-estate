import { vi, describe, it, expect, beforeEach } from 'vitest';
import { processCSVRow, validateCSVRow, createContactsForOwner, CSVRow } from '@/lib/services/csv-processor';
import { createContactsFromCSV } from '@/types/contact';

// Mock the contact creation function
vi.mock('@/types/contact', () => ({
  createContactsFromCSV: vi.fn()
}));

describe('CSV Processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processCSVRow', () => {
    it('should process a valid CSV row correctly', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        City: 'Seattle',
        State: 'WA',
        Zip: '98101',
        'Email 1': 'john@email.com',
        'Wireless 1': '206-555-0101',
        'LLC Contact': 'John Smith',
        OwnerAddress: '456 Oak Ave',
        OwnerCity: 'Portland',
        OwnerState: 'OR',
        OwnerZip: '97201',
        ParcelId: '12345'
      };

      const result = processCSVRow(csvRow);

      expect(result.owner).toEqual({
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        llc_contact: 'John Smith',
        street_address: '456 Oak Ave',
        city: 'Portland',
        state: 'OR',
        zip_code: '97201',
        contacts: []
      });

      expect(result.property).toEqual({
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: '12345'
      });
    });

    it('should handle missing optional fields', () => {
      const csvRow: CSVRow = {
        OwnerName: 'Jane Doe',
        Address: '789 Pine Rd'
      };

      const result = processCSVRow(csvRow);

      expect(result.owner).toEqual({
        first_name: 'Jane',
        last_name: 'Doe',
        full_name: 'Jane Doe',
        llc_contact: undefined,
        street_address: undefined,
        city: undefined,
        state: undefined,
        zip_code: undefined,
        contacts: []
      });

      expect(result.property).toEqual({
        street_address: '789 Pine Rd',
        city: 'unknown',
        zip_code: 0,
        state: undefined,
        parcel_id: undefined
      });
    });

    it('should handle single name', () => {
      const csvRow: CSVRow = {
        OwnerName: 'Madonna',
        Address: '123 Main St'
      };

      const result = processCSVRow(csvRow);

      expect(result.owner).toEqual({
        first_name: 'Madonna',
        last_name: '',
        full_name: 'Madonna',
        llc_contact: undefined,
        street_address: undefined,
        city: undefined,
        state: undefined,
        zip_code: undefined,
        contacts: []
      });
    });

    it('should handle empty name', () => {
      const csvRow: CSVRow = {
        OwnerName: '',
        Address: '123 Main St'
      };

      const result = processCSVRow(csvRow);

      expect(result.owner).toEqual({
        first_name: '',
        last_name: '',
        full_name: undefined,
        llc_contact: undefined,
        street_address: undefined,
        city: undefined,
        state: undefined,
        zip_code: undefined,
        contacts: []
      });
    });

    it('should handle zip code conversion', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        Zip: '98101'
      };

      const result = processCSVRow(csvRow);

      expect(result.property.zip_code).toBe(98101);
    });

    it('should handle invalid zip code', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        Zip: 'invalid'
      };

      const result = processCSVRow(csvRow);

      expect(result.property.zip_code).toBe(0);
    });

    it('should handle empty zip code', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        Zip: ''
      };

      const result = processCSVRow(csvRow);

      expect(result.property.zip_code).toBe(0);
    });

    it('should handle ListName field', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        ListName: 'Investment Properties'
      };

      const result = processCSVRow(csvRow);

      // ListName should be available in the CSV row but not processed by this function
      // The actual list creation happens in the upload processor
      expect(csvRow.ListName).toBe('Investment Properties');
      expect(result.owner).toEqual({
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        llc_contact: undefined,
        street_address: undefined,
        city: undefined,
        state: undefined,
        zip_code: undefined,
        contacts: []
      });
      expect(result.property).toEqual({
        street_address: '123 Main St',
        city: 'unknown',
        zip_code: 0,
        state: undefined,
        parcel_id: undefined
      });
    });

    it('should handle empty ListName field', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        ListName: ''
      };

      const result = processCSVRow(csvRow);

      expect(csvRow.ListName).toBe('');
      expect(result.owner.first_name).toBe('John');
      expect(result.property.street_address).toBe('123 Main St');
    });
  });

  describe('validateCSVRow', () => {
    it('should validate a correct CSV row', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        City: 'Seattle',
        State: 'WA',
        Zip: '98101',
        'Email 1': 'john@email.com',
        'Wireless 1': '206-555-0101'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject missing owner name', () => {
      const csvRow: CSVRow = {
        Address: '123 Main St',
        City: 'Seattle',
        State: 'WA',
        Zip: '98101'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('OwnerName is required');
    });

    it('should reject empty owner name', () => {
      const csvRow: CSVRow = {
        OwnerName: '   ',
        Address: '123 Main St'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('OwnerName is required');
    });

    it('should reject missing address', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        City: 'Seattle',
        State: 'WA',
        Zip: '98101'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    it('should reject empty address', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '   '
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    it('should reject invalid zip code format', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        Zip: 'invalid'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Zip code must be in valid format (e.g., 12345 or 12345-6789)');
    });

    it('should accept valid zip code formats', () => {
      const validZips = ['12345', '12345-6789'];
      
      validZips.forEach(zip => {
        const csvRow: CSVRow = {
          OwnerName: 'John Smith',
          Address: '123 Main St',
          Zip: zip
        };

        const result = validateCSVRow(csvRow);

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain('Zip code must be in valid format');
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = ['invalid-email', '@email.com', 'john@', 'john.email.com'];
      
      invalidEmails.forEach(email => {
        const csvRow: CSVRow = {
          OwnerName: 'John Smith',
          Address: '123 Main St',
          'Email 1': email
        };

        const result = validateCSVRow(csvRow);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Email 1 is not in valid format');
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = ['john@email.com', 'john.smith@company.co.uk', 'test+tag@domain.org'];
      
      validEmails.forEach(email => {
        const csvRow: CSVRow = {
          OwnerName: 'John Smith',
          Address: '123 Main St',
          'Email 1': email
        };

        const result = validateCSVRow(csvRow);

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain('Email 1 is not in valid format');
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = ['invalid', '0123456789', 'abc-def-ghij'];
      
      invalidPhones.forEach(phone => {
        const csvRow: CSVRow = {
          OwnerName: 'John Smith',
          Address: '123 Main St',
          'Wireless 1': phone
        };

        const result = validateCSVRow(csvRow);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Wireless 1 is not in valid phone format');
      });
    });

    it('should accept valid phone formats', () => {
      const validPhones = [
        '206-555-0101',
        '(206) 555-0101',
        '206.555.0101',
        '2065550101',
        '+1-206-555-0101'
      ];
      
      validPhones.forEach(phone => {
        const csvRow: CSVRow = {
          OwnerName: 'John Smith',
          Address: '123 Main St',
          'Wireless 1': phone
        };

        const result = validateCSVRow(csvRow);

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain('Wireless 1 is not in valid phone format');
      });
    });

    it('should collect all validation errors', () => {
      const csvRow: CSVRow = {
        OwnerName: '',
        Address: '',
        Zip: 'invalid',
        'Email 1': 'invalid-email',
        'Wireless 1': 'invalid-phone'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.errors).toContain('OwnerName is required');
      expect(result.errors).toContain('Address is required');
      expect(result.errors).toContain('Zip code must be in valid format (e.g., 12345 or 12345-6789)');
      expect(result.errors).toContain('Email 1 is not in valid format');
      expect(result.errors).toContain('Wireless 1 is not in valid phone format');
    });

    it('should allow empty optional fields', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        City: '',
        State: '',
        Zip: '',
        'Email 1': '',
        'Wireless 1': ''
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should allow ListName field', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        ListName: 'Investment Properties'
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should allow empty ListName field', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        ListName: ''
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should allow undefined ListName field', () => {
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St'
        // ListName is undefined
      };

      const result = validateCSVRow(csvRow);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('createContactsForOwner', () => {
    it('should call createContactsFromCSV with correct parameters', () => {
      const ownerId = 'test-owner-id';
      const csvRow: CSVRow = {
        OwnerName: 'John Smith',
        Address: '123 Main St',
        'Email 1': 'john@email.com',
        'Wireless 1': '206-555-0101'
      };

      const mockContacts = [
        { email: 'john@email.com', type: 'Email', priority: 1, ownerId },
        { phone: '206-555-0101', type: 'Cell', priority: 1, ownerId }
      ];

      (createContactsFromCSV as any).mockReturnValue(mockContacts);

      const result = createContactsForOwner(ownerId, csvRow);

      expect(createContactsFromCSV).toHaveBeenCalledWith(ownerId, csvRow);
      expect(result).toEqual(mockContacts);
    });
  });
}); 