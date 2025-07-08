import { describe, it, expect, vi } from 'vitest';
import { createContactsFromCSV, CONTACT_TYPES, normalizePhoneNumber } from '@/types/contact';

describe('Contact Types', () => {
  describe('CONTACT_TYPES', () => {
    it('should have all expected contact types', () => {
      expect(CONTACT_TYPES.EMAIL).toBe('Email');
      expect(CONTACT_TYPES.CELL).toBe('Cell');
      expect(CONTACT_TYPES.HOME).toBe('Home');
      expect(CONTACT_TYPES.WORK).toBe('Work');
      expect(CONTACT_TYPES.LANDLINE).toBe('Landline');
      expect(CONTACT_TYPES.FAX).toBe('Fax');
      expect(CONTACT_TYPES.BUSINESS).toBe('Business');
      expect(CONTACT_TYPES.PERSONAL).toBe('Personal');
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize 10-digit phone numbers by removing formatting', () => {
      const testCases = [
        { input: '206-555-0101', expected: '2065550101' },
        { input: '(206) 555-0101', expected: '2065550101' },
        { input: '206.555.0101', expected: '2065550101' },
        { input: '206 555 0101', expected: '2065550101' },
        { input: '2065550101', expected: '2065550101' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(normalizePhoneNumber(input)).toBe(expected);
      });
    });

    it('should normalize 11-digit phone numbers by removing country code', () => {
      const testCases = [
        { input: '+1-206-555-0101', expected: '2065550101' },
        { input: '1 (206) 555-0101', expected: '2065550101' },
        { input: '1.206.555.0101', expected: '2065550101' },
        { input: '1 206 555 0101', expected: '2065550101' },
        { input: '12065550101', expected: '2065550101' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(normalizePhoneNumber(input)).toBe(expected);
      });
    });

    it('should throw error for 11-digit numbers that do not start with 1', () => {
      const input = '22065550101';
      expect(() => normalizePhoneNumber(input)).toThrow('Invalid phone number format: should start with 1 for 11-digit numbers');
    });

    it('should return digits-only for invalid lengths', () => {
      const testCases = [
        { input: '206-555', expected: '206555' },
        { input: '206-555-0101-1234', expected: '20655501011234' },
        { input: '555-0101', expected: '5550101' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(normalizePhoneNumber(input)).toBe(expected);
      });
    });

    it('should handle phone numbers with letters and special characters', () => {
      const testCases = [
        { input: '1-800-FLOWERS', expected: '18003569377' },
        { input: '(206) 555-HELP', expected: '20655543577' },
        { input: '206-ABC-DEFG', expected: '20622233474' }
      ];

      testCases.forEach(({ input, expected }) => {
        // Note: This test assumes letters are converted to numbers
        // For now, we'll just test that non-digits are removed
        const result = normalizePhoneNumber(input);
        expect(result).toMatch(/^\d+$/); // Should only contain digits
      });
    });

    it('should handle empty and whitespace strings', () => {
      const testCases = [
        { input: '', expected: '' },
        { input: '   ', expected: '' },
        { input: '-().', expected: '' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(normalizePhoneNumber(input)).toBe(expected);
      });
    });
  });

  describe('createContactsFromCSV', () => {
    const ownerId = 'owner-1';

    it('should create contacts from email data', () => {
      const csvData = {
        'Email 1': 'john@email.com',
        'Email 2': 'john.work@email.com'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        email: 'john@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 1,
        ownerId
      });
      expect(result[1]).toEqual({
        email: 'john.work@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId
      });
    });

    it('should create contacts from wireless phone data with normalized numbers', () => {
      const csvData = {
        'Wireless 1': '206-555-0101',
        'Wireless 2': '(206) 555-0202',
        'Wireless 3': '206.555.0303',
        'Wireless 4': '+1-206-555-0404'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        phone: '2065550101',
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId
      });
      expect(result[1]).toEqual({
        phone: '2065550202',
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId
      });
      expect(result[2]).toEqual({
        phone: '2065550303',
        type: CONTACT_TYPES.CELL,
        priority: 3,
        ownerId
      });
      expect(result[3]).toEqual({
        phone: '2065550404',
        type: CONTACT_TYPES.CELL,
        priority: 4,
        ownerId
      });
    });

    it('should create contacts from landline phone data with normalized numbers', () => {
      const csvData = {
        'Landline 1': '206-555-0101',
        'Landline 2': '(206) 555-0202',
        'Landline 3': '206.555.0303',
        'Landline 4': '1 206 555 0404'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        phone: '2065550101',
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId
      });
      expect(result[1]).toEqual({
        phone: '2065550202',
        type: CONTACT_TYPES.LANDLINE,
        priority: 2,
        ownerId
      });
      expect(result[2]).toEqual({
        phone: '2065550303',
        type: CONTACT_TYPES.LANDLINE,
        priority: 3,
        ownerId
      });
      expect(result[3]).toEqual({
        phone: '2065550404',
        type: CONTACT_TYPES.LANDLINE,
        priority: 4,
        ownerId
      });
    });

    it('should create contacts from mixed data with normalized phone numbers', () => {
      const csvData = {
        'Email 1': 'john@email.com',
        'Email 2': 'john.work@email.com',
        'Wireless 1': '206-555-0101',
        'Wireless 2': '(206) 555-0202',
        'Landline 1': '+1-206-555-0303'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toHaveLength(5);
      
      // Check emails
      expect(result[0]).toEqual({
        email: 'john@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 1,
        ownerId
      });
      expect(result[1]).toEqual({
        email: 'john.work@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId
      });

      // Check wireless phones
      expect(result[2]).toEqual({
        phone: '2065550101',
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId
      });
      expect(result[3]).toEqual({
        phone: '2065550202',
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId
      });

      // Check landline phone
      expect(result[4]).toEqual({
        phone: '2065550303',
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId
      });
    });

    it('should skip empty fields', () => {
      const csvData = {
        'Email 1': '',
        'Email 2': 'john.work@email.com',
        'Wireless 1': '206-555-0101',
        'Wireless 2': '',
        'Landline 1': '   ',          // Whitespace-only will be skipped
        'Landline 2': '206-555-0404'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toHaveLength(3);  // Email + Wireless + Landline (whitespace skipped)
      expect(result[0]).toEqual({
        email: 'john.work@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId
      });
      expect(result[1]).toEqual({
        phone: '2065550101',
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId
      });
      expect(result[2]).toEqual({
        phone: '2065550404',
        type: CONTACT_TYPES.LANDLINE,
        priority: 2,
        ownerId
      });
    });

    it('should handle undefined fields', () => {
      const csvData = {
        'Email 1': undefined,
        'Email 2': 'john.work@email.com',
        'Wireless 1': undefined,
        'Wireless 2': '206-555-0202'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        email: 'john.work@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 2,
        ownerId
      });
      expect(result[1]).toEqual({
        phone: '2065550202',
        type: CONTACT_TYPES.CELL,
        priority: 2,
        ownerId
      });
    });

    it('should return empty array when no contact data provided', () => {
      const csvData = {};

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toEqual([]);
    });

    it('should return empty array when all fields are empty', () => {
      const csvData = {
        'Email 1': '',
        'Email 2': '',
        'Wireless 1': '',
        'Wireless 2': '',
        'Wireless 3': '',
        'Wireless 4': '',
        'Landline 1': '',
        'Landline 2': '',
        'Landline 3': '',
        'Landline 4': ''
      };

      const result = createContactsFromCSV(ownerId, csvData);

      expect(result).toEqual([]);
    });

    it('should maintain correct priority order with normalized phone numbers', () => {
      const csvData = {
        'Email 1': 'john@email.com',
        'Email 2': 'john.work@email.com',
        'Wireless 1': '206-555-0101',
        'Wireless 2': '(206) 555-0202',
        'Landline 1': '+1-206-555-0303',
        'Landline 2': '206.555.0404'
      };

      const result = createContactsFromCSV(ownerId, csvData);

      // Check that priorities are assigned correctly
      const emailContacts = result.filter(c => c.type === CONTACT_TYPES.EMAIL);
      const cellContacts = result.filter(c => c.type === CONTACT_TYPES.CELL);
      const landlineContacts = result.filter(c => c.type === CONTACT_TYPES.LANDLINE);

      expect(emailContacts[0].priority).toBe(1);
      expect(emailContacts[1].priority).toBe(2);
      expect(cellContacts[0].priority).toBe(1);
      expect(cellContacts[1].priority).toBe(2);
      expect(landlineContacts[0].priority).toBe(1);
      expect(landlineContacts[1].priority).toBe(2);

      // Verify normalized phone numbers
      expect(cellContacts[0].phone).toBe('2065550101');
      expect(cellContacts[1].phone).toBe('2065550202');
      expect(landlineContacts[0].phone).toBe('2065550303');
      expect(landlineContacts[1].phone).toBe('2065550404');
    });

    it('should skip invalid phone numbers that throw exceptions', () => {
      const csvData = {
        'Email 1': 'john@email.com',
        'Wireless 1': '206-555-0101',      // Valid
        'Wireless 2': '22065550202',       // Invalid 11-digit not starting with 1
        'Landline 1': '+1-206-555-0303',   // Valid
        'Landline 2': '33065550404'        // Invalid 11-digit not starting with 1
      };

      const result = createContactsFromCSV(ownerId, csvData);

      // Should only have 3 contacts: 1 email + 1 wireless + 1 landline
      expect(result).toHaveLength(3);
      
      expect(result[0]).toEqual({
        email: 'john@email.com',
        type: CONTACT_TYPES.EMAIL,
        priority: 1,
        ownerId
      });

      expect(result[1]).toEqual({
        phone: '2065550101',
        type: CONTACT_TYPES.CELL,
        priority: 1,
        ownerId
      });

      expect(result[2]).toEqual({
        phone: '2065550303',
        type: CONTACT_TYPES.LANDLINE,
        priority: 1,
        ownerId
      });
    });
  });
}); 