import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PropertyService } from '@/lib/services/property-service';
import { prisma } from '@/lib/shared/prisma';

// Mock Prisma
vi.mock('@/lib/shared/prisma', () => ({
  prisma: {
    property: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    contact: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    note: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('PropertyService', () => {
  const mockPrisma = prisma as any;
  let mockTransaction: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock transaction
    mockTransaction = {
      property: {
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      contact: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      note: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockTransaction));
  });

  describe('updatePropertyComprehensive', () => {
    const mockPropertyId = 'property-1';
    const mockExistingProperty = {
      id: mockPropertyId,
      street_address: '123 Test St',
      city: 'Test City',
      zip_code: '12345',
      owners: [
        {
          id: 'owner-1',
          contacts: [
            {
              id: 'contact-1',
              phone: '206-555-0101',
              email: 'test@email.com',
              type: 'Cell',
              priority: 1,
              owner_id: 'owner-1'
            }
          ]
        }
      ],
      notes: [
        {
          id: 'note-1',
          content: 'Test note',
          property_id: mockPropertyId
        }
      ]
    };

    beforeEach(() => {
      mockPrisma.property.findUnique.mockResolvedValue(mockExistingProperty);
      mockTransaction.property.update.mockResolvedValue(mockExistingProperty);
      mockTransaction.property.findUnique.mockResolvedValue(mockExistingProperty);
    });

    it('should handle contact deletion successfully', async () => {
      const updateData = {
        contacts: [
          {
            ownerId: 'owner-1',
            contacts: [
              {
                id: 'contact-1',
                phone: '206-555-0101',
                email: 'test@email.com',
                type: 'Cell',
                priority: 1,
                action: 'delete' as const
              }
            ]
          }
        ]
      };

      mockTransaction.contact.delete.mockResolvedValue({ id: 'contact-1' });

      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.contact.delete).toHaveBeenCalledWith({
        where: { id: 'contact-1' }
      });
      expect(result).toEqual(mockExistingProperty);
    });

    it('should handle note deletion successfully', async () => {
      const updateData = {
        notes: [
          {
            id: 'note-1',
            content: 'Test note',
            action: 'delete' as const
          }
        ]
      };

      mockTransaction.note.delete.mockResolvedValue({ id: 'note-1' });

      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.note.delete).toHaveBeenCalledWith({
        where: { id: 'note-1' }
      });
      expect(result).toEqual(mockExistingProperty);
    });

    it('should gracefully handle P2025 error when deleting non-existent contact', async () => {
      const updateData = {
        contacts: [
          {
            ownerId: 'owner-1',
            contacts: [
              {
                id: 'non-existent-contact',
                phone: '206-555-0101',
                email: 'test@email.com',
                type: 'Cell',
                priority: 1,
                action: 'delete' as const
              }
            ]
          }
        ]
      };

      // Mock P2025 error (record not found)
      const p2025Error = new Error('Record to delete does not exist');
      (p2025Error as any).code = 'P2025';
      mockTransaction.contact.delete.mockRejectedValue(p2025Error);

      // Should not throw error
      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.contact.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent-contact' }
      });
      expect(result).toEqual(mockExistingProperty);
    });

    it('should gracefully handle P2025 error when deleting non-existent note', async () => {
      const updateData = {
        notes: [
          {
            id: 'non-existent-note',
            content: 'Test note',
            action: 'delete' as const
          }
        ]
      };

      // Mock P2025 error (record not found)
      const p2025Error = new Error('Record to delete does not exist');
      (p2025Error as any).code = 'P2025';
      mockTransaction.note.delete.mockRejectedValue(p2025Error);

      // Should not throw error
      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.note.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent-note' }
      });
      expect(result).toEqual(mockExistingProperty);
    });

    it('should throw non-P2025 errors when deleting contacts', async () => {
      const updateData = {
        contacts: [
          {
            ownerId: 'owner-1',
            contacts: [
              {
                id: 'contact-1',
                phone: '206-555-0101',
                email: 'test@email.com',
                type: 'Cell',
                priority: 1,
                action: 'delete' as const
              }
            ]
          }
        ]
      };

      // Mock different error (not P2025)
      const otherError = new Error('Database connection failed');
      (otherError as any).code = 'P2002';
      mockTransaction.contact.delete.mockRejectedValue(otherError);

      await expect(
        PropertyService.updatePropertyComprehensive(mockPropertyId, updateData)
      ).rejects.toThrow('Database connection failed');
    });

    it('should throw non-P2025 errors when deleting notes', async () => {
      const updateData = {
        notes: [
          {
            id: 'note-1',
            content: 'Test note',
            action: 'delete' as const
          }
        ]
      };

      // Mock different error (not P2025)
      const otherError = new Error('Database connection failed');
      (otherError as any).code = 'P2002';
      mockTransaction.note.delete.mockRejectedValue(otherError);

      await expect(
        PropertyService.updatePropertyComprehensive(mockPropertyId, updateData)
      ).rejects.toThrow('Database connection failed');
    });

    it('should skip deleting contacts with temp IDs', async () => {
      const updateData = {
        contacts: [
          {
            ownerId: 'owner-1',
            contacts: [
              {
                id: 'temp-123',
                phone: '206-555-0101',
                email: 'test@email.com',
                type: 'Cell',
                priority: 1,
                action: 'delete' as const
              }
            ]
          }
        ]
      };

      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.contact.delete).not.toHaveBeenCalled();
      expect(result).toEqual(mockExistingProperty);
    });

    it('should skip deleting notes with temp IDs', async () => {
      const updateData = {
        notes: [
          {
            id: 'temp-456',
            content: 'Test note',
            action: 'delete' as const
          }
        ]
      };

      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.note.delete).not.toHaveBeenCalled();
      expect(result).toEqual(mockExistingProperty);
    });

    it('should handle multiple contact and note deletions with mixed success/failure', async () => {
      const updateData = {
        contacts: [
          {
            ownerId: 'owner-1',
            contacts: [
              {
                id: 'contact-1',
                phone: '206-555-0101',
                email: 'test@email.com',
                type: 'Cell',
                priority: 1,
                action: 'delete' as const
              },
              {
                id: 'contact-2',
                phone: '206-555-0102',
                email: 'test2@email.com',
                type: 'Cell',
                priority: 2,
                action: 'delete' as const
              }
            ]
          }
        ],
        notes: [
          {
            id: 'note-1',
            content: 'Test note 1',
            action: 'delete' as const
          },
          {
            id: 'note-2',
            content: 'Test note 2',
            action: 'delete' as const
          }
        ]
      };

      // First contact deletion succeeds
      mockTransaction.contact.delete.mockResolvedValueOnce({ id: 'contact-1' });
      
      // Second contact deletion fails with P2025
      const p2025Error = new Error('Record to delete does not exist');
      (p2025Error as any).code = 'P2025';
      mockTransaction.contact.delete.mockRejectedValueOnce(p2025Error);

      // First note deletion succeeds
      mockTransaction.note.delete.mockResolvedValueOnce({ id: 'note-1' });
      
      // Second note deletion fails with P2025
      mockTransaction.note.delete.mockRejectedValueOnce(p2025Error);

      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.contact.delete).toHaveBeenCalledTimes(2);
      expect(mockTransaction.note.delete).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockExistingProperty);
    });

    it('should handle create, update, and delete operations together', async () => {
      const updateData = {
        contacts: [
          {
            ownerId: 'owner-1',
            contacts: [
              {
                id: 'temp-new-contact',
                phone: '206-555-0103',
                email: 'new@email.com',
                type: 'Cell',
                priority: 1,
                action: 'create' as const
              },
              {
                id: 'contact-1',
                phone: '206-555-0101',
                email: 'updated@email.com',
                type: 'Cell',
                priority: 1,
                action: 'update' as const
              },
              {
                id: 'contact-2',
                phone: '206-555-0102',
                email: 'test2@email.com',
                type: 'Cell',
                priority: 2,
                action: 'delete' as const
              }
            ]
          }
        ],
        notes: [
          {
            id: 'temp-new-note',
            content: 'New note',
            action: 'create' as const
          },
          {
            id: 'note-1',
            content: 'Updated note',
            action: 'update' as const
          },
          {
            id: 'note-2',
            content: 'Note to delete',
            action: 'delete' as const
          }
        ]
      };

      mockTransaction.contact.create.mockResolvedValue({ id: 'new-contact' });
      mockTransaction.contact.update.mockResolvedValue({ id: 'contact-1' });
      mockTransaction.contact.delete.mockResolvedValue({ id: 'contact-2' });
      
      mockTransaction.note.create.mockResolvedValue({ id: 'new-note' });
      mockTransaction.note.update.mockResolvedValue({ id: 'note-1' });
      mockTransaction.note.delete.mockResolvedValue({ id: 'note-2' });

      const result = await PropertyService.updatePropertyComprehensive(mockPropertyId, updateData);

      expect(mockTransaction.contact.create).toHaveBeenCalledWith({
        data: {
          phone: '206-555-0103',
          email: 'new@email.com',
          type: 'Cell',
          label: undefined,
          priority: 1,
          notes: undefined,
          owner_id: 'owner-1'
        }
      });

      expect(mockTransaction.contact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: {
          phone: '206-555-0101',
          email: 'updated@email.com',
          type: 'Cell',
          label: undefined,
          priority: 1,
          notes: undefined
        }
      });

      expect(mockTransaction.contact.delete).toHaveBeenCalledWith({
        where: { id: 'contact-2' }
      });

      expect(mockTransaction.note.create).toHaveBeenCalledWith({
        data: {
          content: 'New note',
          property_id: mockPropertyId
        }
      });

      expect(mockTransaction.note.update).toHaveBeenCalledWith({
        where: { id: 'note-1' },
        data: { content: 'Updated note' }
      });

      expect(mockTransaction.note.delete).toHaveBeenCalledWith({
        where: { id: 'note-2' }
      });

      expect(result).toEqual(mockExistingProperty);
    });

    it('should throw error when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        PropertyService.updatePropertyComprehensive('non-existent-property', {})
      ).rejects.toThrow('Property not found');
    });
  });
});