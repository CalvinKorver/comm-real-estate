import { PropertyReconciliationService, PropertyData, PropertyMatch } from '@/lib/services/property-reconciliation';

// Mock Prisma
jest.mock('@/lib/shared/prisma', () => ({
  prisma: {
    property: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Property Reconciliation Service', () => {
  let service: PropertyReconciliationService;
  let mockPrisma: any;

  beforeEach(() => {
    service = new PropertyReconciliationService();
    mockPrisma = require('@/lib/shared/prisma').prisma;
    jest.clearAllMocks();
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
}); 