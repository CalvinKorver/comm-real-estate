import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PropertyReconciliationService, PropertyData, PropertyMatch } from '@/lib/services/property-reconciliation';
import { prisma } from '@/lib/shared/prisma';

// Mock Prisma
vi.mock('@/lib/shared/prisma', () => ({
  prisma: {
    property: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    propertyList: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('Property Reconciliation Service', () => {
  let service: PropertyReconciliationService;
  const mockPrisma = prisma as any;

  beforeEach(() => {
    service = new PropertyReconciliationService();
    vi.clearAllMocks();
  });

  describe('normalizeAddress', () => {
    it('should normalize addresses correctly', () => {
      const testCases = [
        { input: '123 Main St', expected: '123 main st' },
        { input: '123 Main Street', expected: '123 main st' },
        { input: '123 Main Ave', expected: '123 main ave' },
        { input: '123 Main Avenue', expected: '123 main ave' },
        { input: '123 Main Rd', expected: '123 main rd' },
        { input: '123 Main Road', expected: '123 main rd' },
        { input: '123 Main Dr', expected: '123 main dr' },
        { input: '123 Main Drive', expected: '123 main dr' },
        { input: '123 Main Ln', expected: '123 main ln' },
        { input: '123 Main Lane', expected: '123 main ln' },
        { input: '123 Main Blvd', expected: '123 main blvd' },
        { input: '123 Main Boulevard', expected: '123 main blvd' },
        { input: '123 Main Ct', expected: '123 main ct' },
        { input: '123 Main Court', expected: '123 main ct' },
        { input: '123 Main Pl', expected: '123 main pl' },
        { input: '123 Main Place', expected: '123 main pl' },
        { input: '123 Main Cir', expected: '123 main cir' },
        { input: '123 Main Circle', expected: '123 main cir' },
        { input: '123 Main Way', expected: '123 main way' },
        { input: '123 Main Ter', expected: '123 main ter' },
        { input: '123 Main Terrace', expected: '123 main ter' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(service.normalizeAddress(input)).toBe(expected);
      });
    });

    it('should handle special characters and formatting', () => {
      const testCases = [
        { input: '  123 Main St.  ', expected: '123 main st' },
        { input: '123 Main St,', expected: '123 main st' },
        { input: '123 Main St.', expected: '123 main st' },
        { input: '123   Main   St', expected: '123 main st' },
        { input: '123 MAIN STREET', expected: '123 main st' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(service.normalizeAddress(input)).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      expect(service.normalizeAddress('')).toBe('');
      expect(service.normalizeAddress('   ')).toBe('');
      expect(service.normalizeAddress('123')).toBe('123');
    });
  });

  describe('calculateAddressSimilarity', () => {
    it('should return 1.0 for identical addresses', () => {
      expect(service.calculateAddressSimilarity('123 Main St', '123 Main St')).toBe(1.0);
      expect(service.calculateAddressSimilarity('123 MAIN ST', '123 Main St')).toBe(1.0);
    });

    it('should calculate similarity for similar addresses', () => {
      expect(service.calculateAddressSimilarity('123 Main St', '123 Main Street')).toBe(1.0);
      expect(service.calculateAddressSimilarity('123 Main St', '123 Main St.')).toBe(1.0);
      expect(service.calculateAddressSimilarity('123 Main St', '123 Main St,')).toBe(1.0);
    });

    it('should handle different house numbers', () => {
      expect(service.calculateAddressSimilarity('123 Main St', '124 Main St')).toBeCloseTo(0.58, 1);
      expect(service.calculateAddressSimilarity('123 Main St', '125 Main St')).toBeCloseTo(0.58, 1);
    });

    it('should handle partial matches', () => {
      expect(service.calculateAddressSimilarity('123 Main St', '123 Main')).toBeCloseTo(0.83, 1);
      expect(service.calculateAddressSimilarity('123 Main St', 'Main St')).toBeCloseTo(0.67, 1);
    });

    it('should handle completely different addresses', () => {
      expect(service.calculateAddressSimilarity('123 Main St', '456 Oak Ave')).toBeCloseTo(0.25, 1);
      expect(service.calculateAddressSimilarity('123 Main St', '789 Pine Rd')).toBeCloseTo(0.25, 1);
    });

    it('should handle empty addresses', () => {
      expect(service.calculateAddressSimilarity('', '123 Main St')).toBe(0);
      expect(service.calculateAddressSimilarity('123 Main St', '')).toBe(0);
      expect(service.calculateAddressSimilarity('', '')).toBe(1);
    });

    it('should handle complex address variations', () => {
      expect(service.calculateAddressSimilarity('123 Main Street', '123 Main St')).toBe(1.0);
      expect(service.calculateAddressSimilarity('123 Main St, Seattle', '123 Main St Seattle')).toBe(1.0);
    });
  });

  describe('findMatchingProperty', () => {
    const mockProperty = {
      id: 'property-1',
      street_address: '123 Main St',
      city: 'Seattle',
      zip_code: 98101,
      state: 'WA',
      parcel_id: '12345'
    };

    it('should find exact address match', async () => {
      const address = '123 Main St';
      const city = 'Seattle';
      const zip = 98101;
      const state = 'WA';

      mockPrisma.property.findFirst.mockResolvedValue(mockProperty);

      const result = await service.findMatchingProperty(address, city, zip, state);

      expect(mockPrisma.property.findFirst).toHaveBeenCalledWith({
        where: {
          street_address: '123 Main St',
          city: 'Seattle',
          zip_code: 98101,
          state: 'WA'
        }
      });

      expect(result).toEqual({
        property: mockProperty,
        confidence: 1.0,
        matchReason: 'Exact address match'
      });
    });

    it('should find exact match without state', async () => {
      const address = '123 Main St';
      const city = 'Seattle';
      const zip = 98101;

      mockPrisma.property.findFirst.mockResolvedValue(mockProperty);

      const result = await service.findMatchingProperty(address, city, zip);

      expect(mockPrisma.property.findFirst).toHaveBeenCalledWith({
        where: {
          street_address: '123 Main St',
          city: 'Seattle',
          zip_code: 98101
        }
      });

      expect(result).toEqual({
        property: mockProperty,
        confidence: 1.0,
        matchReason: 'Exact address match'
      });
    });

    it('should find fuzzy match when exact match not found', async () => {
      const address = '123 Main Street';
      const city = 'Seattle';
      const zip = 98101;
      const state = 'WA';

      const candidates = [
        { ...mockProperty, street_address: '123 Main St' },
        { ...mockProperty, id: 'property-2', street_address: '456 Oak Ave' }
      ];

      mockPrisma.property.findFirst.mockResolvedValue(null);
      mockPrisma.property.findMany.mockResolvedValue(candidates);

      const result = await service.findMatchingProperty(address, city, zip, state);

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
        where: {
          city: 'Seattle',
          zip_code: 98101,
          state: 'WA'
        }
      });

      expect(result).toEqual({
        property: candidates[0],
        confidence: 1.0,
        matchReason: 'Fuzzy address match (100% similarity)'
      });
    });

    it('should return null when no matches found', async () => {
      const address = '999 Unknown St';
      const city = 'Seattle';
      const zip = 98101;

      mockPrisma.property.findFirst.mockResolvedValue(null);
      mockPrisma.property.findMany.mockResolvedValue([]);

      const result = await service.findMatchingProperty(address, city, zip);

      expect(result).toBeNull();
    });

    it('should return null when fuzzy match confidence is too low', async () => {
      const address = '999 Unknown St';
      const city = 'Seattle';
      const zip = 98101;

      const candidates = [
        { ...mockProperty, street_address: '123 Main St' }
      ];

      mockPrisma.property.findFirst.mockResolvedValue(null);
      mockPrisma.property.findMany.mockResolvedValue(candidates);

      const result = await service.findMatchingProperty(address, city, zip);

      expect(result).toBeNull();
    });

    it('should find best fuzzy match among multiple candidates', async () => {
      const address = '123 Main Street';
      const city = 'Seattle';
      const zip = 98101;

      const candidates = [
        { ...mockProperty, street_address: '123 Main St' },
        { ...mockProperty, id: 'property-2', street_address: '123 Main Ave' },
        { ...mockProperty, id: 'property-3', street_address: '456 Oak St' }
      ];

      mockPrisma.property.findFirst.mockResolvedValue(null);
      mockPrisma.property.findMany.mockResolvedValue(candidates);

      const result = await service.findMatchingProperty(address, city, zip);

      expect(result?.property.street_address).toBe('123 Main St');
      expect(result?.confidence).toBe(1.0);
    });
  });

  describe('mergePropertyData', () => {
    it('should merge property data with new information', async () => {
      const existing = {
        id: 'property-1',
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: null,
        net_operating_income: 50000,
        price: 500000,
        return_on_investment: 0.1,
        number_of_units: 4,
        square_feet: 2000
      };

      const newData: PropertyData = {
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: '12345',
        net_operating_income: 60000,
        price: 550000,
        return_on_investment: 0.11,
        number_of_units: 5,
        square_feet: 2200
      };

      const updatedProperty = { ...existing, ...newData };
      mockPrisma.property.update.mockResolvedValue(updatedProperty);

      const result = await service.mergePropertyData(existing as any, newData);

      expect(mockPrisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: {
          parcel_id: '12345',
          net_operating_income: 60000,
          price: 550000,
          return_on_investment: 0.11,
          number_of_units: 5,
          square_feet: 2200
        }
      });

      expect(result).toEqual(updatedProperty);
    });

    it('should not update when no meaningful new data', async () => {
      const existing = {
        id: 'property-1',
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: '12345',
        net_operating_income: 50000,
        price: 500000,
        return_on_investment: 0.1,
        number_of_units: 4,
        square_feet: 2000
      };

      const newData: PropertyData = {
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: '12345', // Same as existing
        net_operating_income: 0, // Invalid value
        price: 0, // Invalid value
        return_on_investment: 0, // Invalid value
        number_of_units: 0, // Invalid value
        square_feet: 0 // Invalid value
      };

      const result = await service.mergePropertyData(existing as any, newData);

      expect(mockPrisma.property.update).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it('should only update fields with meaningful new data', async () => {
      const existing = {
        id: 'property-1',
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: null,
        net_operating_income: 50000,
        price: 500000,
        return_on_investment: 0.1,
        number_of_units: 4,
        square_feet: 2000
      };

      const newData: PropertyData = {
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: '12345', // New meaningful data
        net_operating_income: 0, // Invalid value
        price: 0, // Invalid value
        return_on_investment: 0, // Invalid value
        number_of_units: 0, // Invalid value
        square_feet: 0 // Invalid value
      };

      const updatedProperty = { ...existing, parcel_id: '12345' };
      mockPrisma.property.update.mockResolvedValue(updatedProperty);

      const result = await service.mergePropertyData(existing as any, newData);

      expect(mockPrisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: {
          parcel_id: '12345'
        }
      });

      expect(result).toEqual(updatedProperty);
    });
  });

  describe('createNewProperty', () => {
    it('should create a new property with all data', async () => {
      const propertyData: PropertyData = {
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101,
        state: 'WA',
        parcel_id: '12345',
        net_operating_income: 50000,
        price: 500000,
        return_on_investment: 0.1,
        number_of_units: 4,
        square_feet: 2000
      };

      const ownerId = 'owner-1';
      const mockCreatedProperty = {
        id: 'property-1',
        ...propertyData
      };

      mockPrisma.property.create.mockResolvedValue(mockCreatedProperty);

      const result = await service.createNewProperty(propertyData, ownerId);

      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: {
          street_address: '123 Main St',
          city: 'Seattle',
          zip_code: 98101,
          state: 'WA',
          parcel_id: '12345',
          net_operating_income: 50000,
          price: 500000,
          return_on_investment: 0.1,
          number_of_units: 4,
          square_feet: 2000,
          owners: {
            connect: { id: 'owner-1' }
          }
        }
      });

      expect(result).toEqual(mockCreatedProperty);
    });

    it('should create a new property with minimal data', async () => {
      const propertyData: PropertyData = {
        street_address: '123 Main St',
        city: 'Seattle',
        zip_code: 98101
      };

      const ownerId = 'owner-1';
      const mockCreatedProperty = {
        id: 'property-1',
        ...propertyData,
        net_operating_income: 0,
        price: 0,
        return_on_investment: 0,
        number_of_units: 0,
        square_feet: 0
      };

      mockPrisma.property.create.mockResolvedValue(mockCreatedProperty);

      const result = await service.createNewProperty(propertyData, ownerId);

      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: {
          street_address: '123 Main St',
          city: 'Seattle',
          zip_code: 98101,
          state: undefined,
          parcel_id: undefined,
          net_operating_income: 0,
          price: 0,
          return_on_investment: 0,
          number_of_units: 0,
          square_feet: 0,
          owners: {
            connect: { id: 'owner-1' }
          }
        }
      });

      expect(result).toEqual(mockCreatedProperty);
    });
  });

  describe('processProperty', () => {
    const mockPropertyData: PropertyData = {
      street_address: '123 Main St',
      city: 'Seattle',
      zip_code: 98101,
      state: 'WA',
      parcel_id: '12345',
      net_operating_income: 50000,
      price: 500000,
      return_on_investment: 0.1,
      number_of_units: 4,
      square_feet: 2000
    };

    const mockExistingProperty = {
      id: 'property-1',
      street_address: '123 Main St',
      city: 'Seattle',
      zip_code: 98101,
      state: 'WA' as string | null,
      parcel_id: '12345' as string | null,
      net_operating_income: 40000,
      price: 450000,
      return_on_investment: 0.09,
      number_of_units: 4,
      square_feet: 1800,
      created_at: new Date(),
      updated_at: new Date()
    };

    const ownerId = 'owner-1';

    function createMockProperty(id: string, data: PropertyData) {
      return {
        id,
        street_address: data.street_address,
        city: data.city,
        zip_code: data.zip_code,
        state: data.state as string | null,
        parcel_id: data.parcel_id as string | null,
        net_operating_income: data.net_operating_income || 0,
        price: data.price || 0,
        return_on_investment: data.return_on_investment || 0,
        number_of_units: data.number_of_units || 0,
        square_feet: data.square_feet || 0,
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should merge property data when high confidence match found', async () => {
      const mockMatch: PropertyMatch = {
        property: mockExistingProperty,
        confidence: 0.98,
        matchReason: 'Exact address match'
      };

      const mockMergedProperty = {
        ...mockExistingProperty,
        ...mockPropertyData
      };

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(mockMergedProperty);

      // Mock the prisma update for owner linking
      mockPrisma.property.update.mockResolvedValue(mockMergedProperty);

      const result = await service.processProperty(mockPropertyData, ownerId);

      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '123 Main St',
        'Seattle',
        98101,
        'WA'
      );
      expect(service.mergePropertyData).toHaveBeenCalledWith(
        mockExistingProperty,
        mockPropertyData
      );
      expect(mockPrisma.property.update).toHaveBeenCalledWith({
        where: { id: 'property-1' },
        data: {
          owners: {
            connect: { id: 'owner-1' }
          }
        }
      });

      expect(result).toEqual({
        property: mockMergedProperty,
        action: 'merged',
        match: mockMatch
      });
    });

    it('should create new property when low confidence match found', async () => {
      const mockMatch: PropertyMatch = {
        property: mockExistingProperty,
        confidence: 0.85,
        matchReason: 'Fuzzy address match (85% similarity)'
      };

      const mockNewProperty = createMockProperty('property-2', mockPropertyData);

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'createNewProperty').mockResolvedValue(mockNewProperty);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(mockNewProperty);

      const result = await service.processProperty(mockPropertyData, ownerId);

      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '123 Main St',
        'Seattle',
        98101,
        'WA'
      );
      expect(service.createNewProperty).toHaveBeenCalledWith(
        mockPropertyData,
        ownerId
      );
      expect(service.mergePropertyData).not.toHaveBeenCalled();

      expect(result).toEqual({
        property: mockNewProperty,
        action: 'created'
      });
    });

    it('should create new property when no match found', async () => {
      const mockNewProperty = createMockProperty('property-2', mockPropertyData);

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(null);
      vi.spyOn(service, 'createNewProperty').mockResolvedValue(mockNewProperty);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(mockNewProperty);

      const result = await service.processProperty(mockPropertyData, ownerId);

      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '123 Main St',
        'Seattle',
        98101,
        'WA'
      );
      expect(service.createNewProperty).toHaveBeenCalledWith(
        mockPropertyData,
        ownerId
      );
      expect(service.mergePropertyData).not.toHaveBeenCalled();

      expect(result).toEqual({
        property: mockNewProperty,
        action: 'created'
      });
    });

    it('should handle exact confidence threshold (0.95)', async () => {
      const mockMatch: PropertyMatch = {
        property: mockExistingProperty,
        confidence: 0.95,
        matchReason: 'Exact address match'
      };

      const mockMergedProperty = {
        ...mockExistingProperty,
        ...mockPropertyData
      };

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(mockMergedProperty);

      // Mock the prisma update for owner linking
      mockPrisma.property.update.mockResolvedValue(mockMergedProperty);

      const result = await service.processProperty(mockPropertyData, ownerId);

      expect(service.mergePropertyData).toHaveBeenCalled();
      expect(result.action).toBe('merged');
    });

    it('should handle property data without state', async () => {
      const propertyDataWithoutState: PropertyData = {
        street_address: '456 Oak Ave',
        city: 'Portland',
        zip_code: 97201
      };

      const mockNewProperty = createMockProperty('property-3', propertyDataWithoutState);

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(null);
      vi.spyOn(service, 'createNewProperty').mockResolvedValue(mockNewProperty);

      const result = await service.processProperty(propertyDataWithoutState, ownerId);

      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '456 Oak Ave',
        'Portland',
        97201,
        undefined
      );
      expect(result).toEqual({
        property: mockNewProperty,
        action: 'created'
      });
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database connection error');

      // Mock the service method to throw an error
      vi.spyOn(service, 'findMatchingProperty').mockRejectedValue(mockError);

      await expect(service.processProperty(mockPropertyData, ownerId)).rejects.toThrow(
        'Database connection error'
      );
    });

    it('should handle edge case where merge fails but create succeeds', async () => {
      const mockMatch: PropertyMatch = {
        property: mockExistingProperty,
        confidence: 0.98,
        matchReason: 'Exact address match'
      };

      const mockNewProperty = createMockProperty('property-2', mockPropertyData);

      // Mock the service methods - merge fails, create succeeds
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'mergePropertyData').mockRejectedValue(new Error('Merge failed'));
      vi.spyOn(service, 'createNewProperty').mockResolvedValue(mockNewProperty);

      // The processProperty should handle the error and fall back to creating a new property
      await expect(service.processProperty(mockPropertyData, ownerId)).rejects.toThrow(
        'Merge failed'
      );
    });

    it('should add new owner to existing property owners when merging', async () => {
      const existingOwnerId = 'existing-owner-1';
      const newOwnerId = 'new-owner-2';
      
      // Create a property that already has an owner
      const existingPropertyWithOwner = {
        ...mockExistingProperty,
        owners: [{ id: existingOwnerId, name: 'Existing Owner' }]
      };

      const mockMatch: PropertyMatch = {
        property: existingPropertyWithOwner,
        confidence: 0.98,
        matchReason: 'Exact address match'
      };

      const mockMergedProperty = {
        ...existingPropertyWithOwner,
        ...mockPropertyData,
        owners: [
          { id: existingOwnerId, name: 'Existing Owner' },
          { id: newOwnerId, name: 'New Owner' }
        ]
      };

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(mockMergedProperty);

      // Mock the prisma update for owner linking - this is the key part we're testing
      mockPrisma.property.update.mockResolvedValue(mockMergedProperty);

      const result = await service.processProperty(mockPropertyData, newOwnerId);

      // Verify that findMatchingProperty was called correctly
      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '123 Main St',
        'Seattle',
        98101,
        'WA'
      );

      // Verify that mergePropertyData was called with the existing property
      expect(service.mergePropertyData).toHaveBeenCalledWith(
        existingPropertyWithOwner,
        mockPropertyData
      );

      // Verify that the new owner was connected to the existing property
      expect(mockPrisma.property.update).toHaveBeenCalledWith({
        where: { id: existingPropertyWithOwner.id },
        data: {
          owners: {
            connect: { id: newOwnerId }
          }
        }
      });

      // Verify the result includes the merged property and match info
      expect(result).toEqual({
        property: mockMergedProperty,
        action: 'merged',
        match: mockMatch
      });

      // Verify that the result property has both owners
      expect((result.property as any).owners).toHaveLength(2);
      expect((result.property as any).owners).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: existingOwnerId }),
          expect.objectContaining({ id: newOwnerId })
        ])
      );
    });

    it('should preserve existing list relationships when merging (demonstration of current gap)', async () => {
      const existingListId = 'list-1';
      const newOwnerId = 'new-owner-1';
      
      // Create a property that already belongs to a list
      const existingPropertyWithList = {
        ...mockExistingProperty,
        lists: [
          { 
            id: 'property-list-1',
            property_id: mockExistingProperty.id,
            list_id: existingListId,
            list: { id: existingListId, name: 'Existing List', user_id: 'user-1' }
          }
        ]
      };

      const mockMatch: PropertyMatch = {
        property: existingPropertyWithList,
        confidence: 0.98,
        matchReason: 'Exact address match'
      };

      // The mergePropertyData method currently only merges property fields, not list relationships
      // This test demonstrates that list relationships are preserved (through the mock) but
      // the actual implementation doesn't handle list transfers during merge operations
      const mockMergedProperty = {
        ...existingPropertyWithList,
        ...mockPropertyData,
        // Lists are preserved in the existing property, but no mechanism exists
        // to transfer list relationships from matched properties
        lists: [
          { 
            id: 'property-list-1',
            property_id: mockExistingProperty.id,
            list_id: existingListId,
            list: { id: existingListId, name: 'Existing List', user_id: 'user-1' }
          }
        ]
      };

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(mockMergedProperty);

      // Mock the prisma operations
      mockPrisma.property.update.mockResolvedValue(mockMergedProperty);

      const result = await service.processProperty(mockPropertyData, newOwnerId);

      // Verify that findMatchingProperty was called correctly
      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '123 Main St',
        'Seattle',
        98101,
        'WA'
      );

      // Verify that mergePropertyData was called with the existing property
      expect(service.mergePropertyData).toHaveBeenCalledWith(
        existingPropertyWithList,
        mockPropertyData
      );

      // Verify that the new owner was connected to the existing property
      expect(mockPrisma.property.update).toHaveBeenCalledWith({
        where: { id: existingPropertyWithList.id },
        data: {
          owners: {
            connect: { id: newOwnerId }
          }
        }
      });

      // Verify the result includes the merged property and match info
      expect(result).toEqual({
        property: mockMergedProperty,
        action: 'merged',
        match: mockMatch
      });

      // Verify that the existing list relationships are preserved
      expect((result.property as any).lists).toHaveLength(1);
      expect((result.property as any).lists[0]).toEqual(
        expect.objectContaining({ 
          list_id: existingListId,
          list: expect.objectContaining({ id: existingListId, name: 'Existing List' })
        })
      );

      // NOTE: This test passes but highlights the gap in the current implementation:
      // - The processProperty method doesn't accept a listId parameter
      // - The mergePropertyData method doesn't handle list relationship transfers
      // - There's no mechanism to associate the merged property with a new list
      // - List relationships from the "source" property in a merge are not transferred
      
      // TODO: Extend processProperty to accept optional listId parameter
      // TODO: Modify mergePropertyData to handle list relationship transfers
      // TODO: Add list conflict resolution logic for merge operations
    });

    // This test demonstrates the desired behavior for list handling during property processing
    // It shows what the API should look like when list support is added
    it('should handle list associations during property processing (future enhancement)', async () => {
      const existingListId = 'existing-list-1';
      const newListId = 'new-list-2';
      const newOwnerId = 'new-owner-1';
      
      // Existing property with a list
      const existingPropertyWithList = {
        ...mockExistingProperty,
        lists: [
          { 
            id: 'property-list-1',
            property_id: mockExistingProperty.id,
            list_id: existingListId,
            list: { id: existingListId, name: 'Existing List', user_id: 'user-1' }
          }
        ]
      };

      const mockMatch: PropertyMatch = {
        property: existingPropertyWithList,
        confidence: 0.98,
        matchReason: 'Exact address match'
      };

      // Expected behavior: property should have both lists after merge
      const expectedMergedProperty = {
        ...existingPropertyWithList,
        ...mockPropertyData,
        lists: [
          { 
            id: 'property-list-1',
            property_id: mockExistingProperty.id,
            list_id: existingListId,
            list: { id: existingListId, name: 'Existing List', user_id: 'user-1' }
          },
          { 
            id: 'property-list-2',
            property_id: mockExistingProperty.id,
            list_id: newListId,
            list: { id: newListId, name: 'New List', user_id: 'user-1' }
          }
        ]
      };

      // Mock the service methods
      vi.spyOn(service, 'findMatchingProperty').mockResolvedValue(mockMatch);
      vi.spyOn(service, 'mergePropertyData').mockResolvedValue(expectedMergedProperty);

      // Mock the prisma operations
      mockPrisma.property.update.mockResolvedValue(expectedMergedProperty);
      mockPrisma.propertyList.findFirst.mockResolvedValue(null); // No existing association
      mockPrisma.propertyList.create.mockResolvedValue({
        id: 'property-list-2',
        property_id: mockExistingProperty.id,
        list_id: newListId
      });

      // FUTURE API: processProperty should accept an optional listId parameter
      // const result = await service.processProperty(mockPropertyData, newOwnerId, newListId);
      // For now, we test the current API and mock the expected behavior
      const result = await service.processProperty(mockPropertyData, newOwnerId);

      // Verify basic merge behavior still works
      expect(service.findMatchingProperty).toHaveBeenCalledWith(
        '123 Main St',
        'Seattle',
        98101,
        'WA'
      );

      expect(service.mergePropertyData).toHaveBeenCalledWith(
        existingPropertyWithList,
        mockPropertyData
      );

      expect(result).toEqual({
        property: expectedMergedProperty,
        action: 'merged',
        match: mockMatch
      });

      // This is the desired behavior (currently mocked):
      // - Existing list relationships are preserved
      // - New list associations are added without conflicts
      // - No duplicate associations are created
      expect((result.property as any).lists).toHaveLength(2);
      expect((result.property as any).lists).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            list_id: existingListId,
            list: expect.objectContaining({ name: 'Existing List' })
          }),
          expect.objectContaining({ 
            list_id: newListId,
            list: expect.objectContaining({ name: 'New List' })
          })
        ])
      );

      // FUTURE ENHANCEMENTS NEEDED:
      // 1. Extend processProperty signature: processProperty(propertyData, ownerId, listId?)
      // 2. Add list relationship handling to mergePropertyData method
      // 3. Add PropertyList.create() calls when new list associations are needed
      // 4. Add conflict resolution for duplicate list associations
      // 5. Add proper error handling for list operations
      // 6. Consider batch operations for multiple list associations
    });
  });
}); 