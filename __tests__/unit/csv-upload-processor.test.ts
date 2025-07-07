import { processCSVUpload, suggestColumnMapping, extractCSVHeaders } from '@/lib/services/csv-upload-processor';
import { CoordinateService } from '@/lib/services/coordinate-service';
import { PropertyReconciliationService } from '@/lib/services/property-reconciliation';
import { OwnerDeduplicationService } from '@/lib/services/owner-deduplication';

// Mock the services
jest.mock('@/lib/services/coordinate-service');
jest.mock('@/lib/services/property-reconciliation');
jest.mock('@/lib/services/owner-deduplication');
jest.mock('@/lib/shared/prisma', () => ({
  prisma: {}
}));

describe('CSV Upload Processor', () => {
  const mockCoordinateService = {
    getOrCreateCoordinates: jest.fn()
  };
  const mockPropertyReconciliationService = {
    processProperty: jest.fn()
  };
  const mockOwnerDeduplicationService = {
    processOwner: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service constructors
    (CoordinateService as jest.Mock).mockImplementation(() => mockCoordinateService);
    (PropertyReconciliationService as jest.Mock).mockImplementation(() => mockPropertyReconciliationService);
    (OwnerDeduplicationService as jest.Mock).mockImplementation(() => mockOwnerDeduplicationService);
  });

  describe('processCSVUpload - Happy Path', () => {
    it('should process a valid CSV file successfully', async () => {
      // Mock service responses
      mockOwnerDeduplicationService.processOwner.mockResolvedValue({
        owner: { id: 'owner-123' },
        action: 'created'
      });
      
      mockPropertyReconciliationService.processProperty.mockResolvedValue({
        property: { id: 'property-456' },
        action: 'created'
      });
      
      mockCoordinateService.getOrCreateCoordinates.mockResolvedValue({
        id: 'coord-789',
        latitude: 47.6062,
        longitude: -122.3321
      });

      const csvContent = `street_address,city,zip_code,full_name,phone,email
123 Main St,Seattle,98101,John Smith,206-555-0101,john@email.com
456 Oak Ave,Portland,97201,Jane Doe,503-555-0102,jane@email.com`;

      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const columnMapping = {
        'street_address': 'street_address',
        'city': 'city',
        'zip_code': 'zip_code',
        'full_name': 'full_name',
        'phone': 'phone',
        'email': 'email'
      };

      const result = await processCSVUpload(file, columnMapping);

      expect(result.success).toBe(true);
      expect(result.processedRows).toBe(2);
      expect(result.createdOwners).toBe(2);
      expect(result.createdProperties).toBe(2);
      expect(result.geocodedProperties).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('processCSVUpload - Empty Rows', () => {
    it('should ignore empty CSV rows without addresses', async () => {
      const csvContent = `street_address,city,zip_code,full_name,phone,email
123 Main St,Seattle,98101,John Smith,206-555-0101,john@email.com
,,,,,
   ,   ,   ,   ,   ,   
456 Oak Ave,Portland,97201,Jane Doe,503-555-0102,jane@email.com
,Portland,97201,Empty Address,503-555-0103,empty@email.com`;

      // Mock service responses for valid rows
      mockOwnerDeduplicationService.processOwner.mockResolvedValue({
        owner: { id: 'owner-123' },
        action: 'created'
      });
      
      mockPropertyReconciliationService.processProperty.mockResolvedValue({
        property: { id: 'property-456' },
        action: 'created'
      });
      
      mockCoordinateService.getOrCreateCoordinates.mockResolvedValue({
        id: 'coord-789',
        latitude: 47.6062,
        longitude: -122.3321
      });

      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const columnMapping = {
        'street_address': 'street_address',
        'city': 'city',
        'zip_code': 'zip_code',
        'full_name': 'full_name',
        'phone': 'phone',
        'email': 'email'
      };

      const result = await processCSVUpload(file, columnMapping);

      expect(result.success).toBe(true);
      expect(result.processedRows).toBe(2); // Only 2 rows with valid addresses
      expect(result.createdOwners).toBe(2);
      expect(result.createdProperties).toBe(2);
      expect(result.errors).toHaveLength(0); // Empty rows don't generate errors
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('suggestColumnMapping', () => {
    it('should suggest correct mappings for common CSV headers', () => {
      const csvHeaders = ['Address', 'City', 'Zip', 'Owner Name', 'Phone', 'Email'];
      const dbFields = ['street_address', 'city', 'zip_code', 'full_name', 'phone', 'email'];

      const mapping = suggestColumnMapping(csvHeaders, dbFields);

      expect(mapping['Address']).toBe('street_address');
      expect(mapping['City']).toBe('city');
      expect(mapping['Zip']).toBe('zip_code');
      expect(mapping['Owner Name']).toBe('full_name');
      expect(mapping['Phone']).toBe('phone');
      expect(mapping['Email']).toBe('email');
    });

    it('should handle numbered phone and email fields', () => {
      const csvHeaders = ['Wireless 1', 'Wireless 2', 'Email 1', 'Email 2'];
      const dbFields = ['phone', 'email'];

      const mapping = suggestColumnMapping(csvHeaders, dbFields);

      expect(mapping['Wireless 1']).toBe('phone');
      expect(mapping['Wireless 2']).toBe('phone');
      expect(mapping['Email 1']).toBe('email');
      expect(mapping['Email 2']).toBe('email');
    });
  });

  describe('extractCSVHeaders', () => {
    it('should extract headers from CSV file', async () => {
      const csvContent = `street_address,city,zip_code,full_name
123 Main St,Seattle,98101,John Smith`;

      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      const headers = await extractCSVHeaders(file);

      expect(headers).toEqual(['street_address', 'city', 'zip_code', 'full_name']);
    });
  });
});