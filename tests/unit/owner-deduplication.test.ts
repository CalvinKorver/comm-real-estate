import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OwnerDeduplicationService, OwnerData, OwnerMatch, ConflictResolution } from '@/lib/services/owner-deduplication';
import { prisma } from '@/lib/shared/prisma';

// Mock Prisma
vi.mock('@/lib/shared/prisma', () => ({
  prisma: {
    owner: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    contact: {
      create: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

describe('Owner Deduplication Service', () => {
  let service: OwnerDeduplicationService;
  const mockPrisma = prisma as any;

  beforeEach(() => {
    service = new OwnerDeduplicationService();
    vi.clearAllMocks();
  });

  describe('normalizePhone', () => {
    it('should normalize phone numbers correctly', () => {
      const testCases = [
        { input: '206-555-0101', expected: '2065550101' },
        { input: '(206) 555-0101', expected: '2065550101' },
        { input: '206.555.0101', expected: '2065550101' },
        { input: '2065550101', expected: '2065550101' },
        { input: '+1-206-555-0101', expected: '2065550101' },
        { input: '1-206-555-0101', expected: '2065550101' },
        { input: '206-555-0101 ext 123', expected: '5550101123' },
        { input: '555-0101', expected: '5550101' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(service.normalizePhone(input)).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      expect(service.normalizePhone('')).toBe('');
      expect(service.normalizePhone('123')).toBe('23');
      expect(service.normalizePhone('abc')).toBe('');
    });
  });

  describe('normalizeName', () => {
    it('should normalize names correctly', () => {
      const testCases = [
        { input: 'John Smith', expected: 'john smith' },
        { input: '  John   Smith  ', expected: 'john smith' },
        { input: 'JOHN SMITH', expected: 'john smith' },
        { input: 'John-Smith', expected: 'johnsmith' },
        { input: 'John & Jane Smith', expected: 'john  jane smith' },
        { input: 'Smith Properties LLC', expected: 'smith properties llc' },
        { input: 'A Ashenbrenner & M Suzanna', expected: 'a ashenbrenner  m suzanna' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(service.normalizeName(input)).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      expect(service.normalizeName('')).toBe('');
      expect(service.normalizeName('   ')).toBe('');
      expect(service.normalizeName('A')).toBe('a');
    });
  });

  describe('calculateNameSimilarity', () => {
    it('should return 1.0 for identical names', () => {
      expect(service.calculateNameSimilarity('John Smith', 'John Smith')).toBe(1.0);
      expect(service.calculateNameSimilarity('john smith', 'JOHN SMITH')).toBe(1.0);
    });

    it('should calculate similarity for similar names', () => {
      expect(service.calculateNameSimilarity('John Smith', 'John S.')).toBe(0.5);
      expect(service.calculateNameSimilarity('John Smith', 'J. Smith')).toBe(0.5);
      expect(service.calculateNameSimilarity('John Smith', 'John Smyth')).toBe(0.5);
    });

    it('should handle different name lengths', () => {
      expect(service.calculateNameSimilarity('John', 'John Smith')).toBe(0.5);
      expect(service.calculateNameSimilarity('John Smith', 'John')).toBe(0.5);
    });

    it('should handle empty names', () => {
      expect(service.calculateNameSimilarity('', 'John Smith')).toBe(0);
      expect(service.calculateNameSimilarity('John Smith', '')).toBe(0);
      expect(service.calculateNameSimilarity('', '')).toBe(1);
    });

    it('should handle special characters and variations', () => {
      expect(service.calculateNameSimilarity('John-Smith', 'John Smith')).toBe(0);
      expect(service.calculateNameSimilarity('John & Jane', 'John Jane')).toBeCloseTo(0.67, 1);
    });

    it('should handle LLC and business names', () => {
      expect(service.calculateNameSimilarity('Smith Properties LLC', 'Smith Properties')).toBeCloseTo(0.67, 1);
      expect(service.calculateNameSimilarity('A Ashenbrenner & M Suzanna', 'A Ashenbrenner M Suzanna')).toBeCloseTo(0.8, 1);
    });
  });

  describe('findPotentialDuplicates', () => {
    const mockOwner = {
      id: 'owner-1',
      first_name: 'John',
      last_name: 'Smith',
      full_name: 'John Smith',
      contacts: [
        { phone: '206-555-0101', email: 'john@email.com' }
      ]
    };

    it('should find exact name matches', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        phone: '206-555-0101'
      };

      mockPrisma.owner.findMany.mockResolvedValue([mockOwner]);

      const result = await service.findPotentialDuplicates(ownerData);

      expect(mockPrisma.owner.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { full_name: 'John Smith' },
            { 
              AND: [
                { first_name: 'John' },
                { last_name: 'Smith' }
              ]
            }
          ]
        },
        include: {
          contacts: true
        }
      });

      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe(1.0);
      expect(result[0].matchReason).toBe('Name and phone match');
    });

    it('should find phone number matches', async () => {
      const ownerData: OwnerData = {
        first_name: 'Jane',
        last_name: 'Doe',
        full_name: 'Jane Doe',
        phone: '206-555-0101'
      };

      mockPrisma.owner.findMany
        .mockResolvedValueOnce([]) // First call for name search
        .mockResolvedValueOnce([mockOwner]); // Second call for phone search

      const result = await service.findPotentialDuplicates(ownerData);

      expect(mockPrisma.owner.findMany).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe(0.9);
      expect(result[0].matchReason).toBe('Phone number match');
      expect(result[0].phoneConflict).toBe(true);
    });

    it('should combine name and phone matches', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        phone: '206-555-0101'
      };

      mockPrisma.owner.findMany
        .mockResolvedValueOnce([mockOwner]) // Name search
        .mockResolvedValueOnce([mockOwner]); // Phone search

      const result = await service.findPotentialDuplicates(ownerData);

      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe(1.0);
      expect(result[0].matchReason).toBe('Name and phone match');
      expect(result[0].phoneConflict).toBe(true);
    });

    it('should return empty array when no matches found', async () => {
      const ownerData: OwnerData = {
        first_name: 'Jane',
        last_name: 'Doe',
        full_name: 'Jane Doe'
      };

      mockPrisma.owner.findMany.mockResolvedValue([]);

      const result = await service.findPotentialDuplicates(ownerData);

      expect(result).toEqual([]);
    });

    it('should sort results by confidence', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        phone: '206-555-0101'
      };

      const mockOwner2 = {
        id: 'owner-2',
        first_name: 'John',
        last_name: 'Smyth',
        full_name: 'John Smyth',
        contacts: []
      };

      mockPrisma.owner.findMany
        .mockResolvedValueOnce([mockOwner, mockOwner2]) // Name search
        .mockResolvedValueOnce([mockOwner]); // Phone search finds same owner

      const result = await service.findPotentialDuplicates(ownerData);

      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe(1.0);
      expect(result[0].matchReason).toBe('Name and phone match');
    });
  });

  describe('resolvePhoneConflicts', () => {
    it('should return create_new when no existing owners', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith'
      };

      const result = await service.resolvePhoneConflicts(ownerData, []);

      expect(result.action).toBe('create_new');
    });

    it('should return merge for high confidence matches', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        phone: '206-555-0101'
      };

      const existingOwners: OwnerMatch[] = [
        {
          owner: { id: 'owner-1', first_name: 'John', last_name: 'Smith' } as any,
          confidence: 0.95,
          matchReason: 'High confidence match',
          phoneConflict: true,
          emailConflict: false
        }
      ];

      const result = await service.resolvePhoneConflicts(ownerData, existingOwners);

      expect(result.action).toBe('merge');
      expect(result.targetOwnerId).toBe('owner-1');
      expect(result.phoneResolution).toBe('add_new');
      expect(result.emailResolution).toBe('add_new');
    });

    it('should return create_new for low confidence matches', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        phone: '206-555-0101'
      };

      const existingOwners: OwnerMatch[] = [
        {
          owner: { id: 'owner-1', first_name: 'John', last_name: 'Smyth' } as any,
          confidence: 0.7,
          matchReason: 'Low confidence match',
          phoneConflict: false,
          emailConflict: false
        }
      ];

      const result = await service.resolvePhoneConflicts(ownerData, existingOwners);

      expect(result.action).toBe('create_new');
    });
  });

  describe('createNewOwner', () => {
    it('should create a new owner with all data', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        llc_contact: 'John Smith',
        street_address: '123 Main St',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101',
        phone: '206-555-0101',
        email: 'john@email.com'
      };

      const mockCreatedOwner = {
        id: 'new-owner-id',
        ...ownerData
      };

      mockPrisma.owner.create.mockResolvedValue(mockCreatedOwner);

      const result = await service.createNewOwner(ownerData);

      expect(mockPrisma.owner.create).toHaveBeenCalledWith({
        data: {
          first_name: 'John',
          last_name: 'Smith',
          full_name: 'John Smith',
          llc_contact: 'John Smith',
          street_address: '123 Main St',
          city: 'Seattle',
          state: 'WA',
          zip_code: '98101'
        }
      });

      expect(result).toEqual(mockCreatedOwner);
    });

    it('should create a new owner with minimal data', async () => {
      const ownerData: OwnerData = {
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith'
      };

      const mockCreatedOwner = {
        id: 'new-owner-id',
        ...ownerData
      };

      mockPrisma.owner.create.mockResolvedValue(mockCreatedOwner);

      const result = await service.createNewOwner(ownerData);

      expect(mockPrisma.owner.create).toHaveBeenCalledWith({
        data: {
          first_name: 'John',
          last_name: 'Smith',
          full_name: 'John Smith',
          llc_contact: undefined,
          street_address: undefined,
          city: undefined,
          state: undefined,
          zip_code: undefined
        }
      });

      expect(result).toEqual(mockCreatedOwner);
    });
  });

  describe('addContactToOwner', () => {
    it('should add phone contact to owner', async () => {
      const ownerId = 'owner-1';
      const phone = '206-555-0101';

      await service.addContactToOwner(ownerId, phone);

      expect(mockPrisma.contact.createMany).toHaveBeenCalledWith({
        data: [{
          phone: '206-555-0101',
          type: 'phone',
          priority: 1,
          owner_id: 'owner-1'
        }],
        skipDuplicates: true
      });
    });

    it('should add email contact to owner', async () => {
      const ownerId = 'owner-1';
      const email = 'john@email.com';

      await service.addContactToOwner(ownerId, undefined, email);

      expect(mockPrisma.contact.createMany).toHaveBeenCalledWith({
        data: [{
          email: 'john@email.com',
          type: 'email',
          priority: 1,
          owner_id: 'owner-1'
        }],
        skipDuplicates: true
      });
    });

    it('should add both phone and email contacts', async () => {
      const ownerId = 'owner-1';
      const phone = '206-555-0101';
      const email = 'john@email.com';

      await service.addContactToOwner(ownerId, phone, email);

      expect(mockPrisma.contact.createMany).toHaveBeenCalledWith({
        data: [
          {
            phone: '206-555-0101',
            type: 'phone',
            priority: 1,
            owner_id: 'owner-1'
          },
          {
            email: 'john@email.com',
            type: 'email',
            priority: 1,
            owner_id: 'owner-1'
          }
        ],
        skipDuplicates: true
      });
    });

    it('should not create contacts when no phone or email provided', async () => {
      const ownerId = 'owner-1';

      await service.addContactToOwner(ownerId);

      expect(mockPrisma.contact.createMany).not.toHaveBeenCalled();
    });
  });
}); 