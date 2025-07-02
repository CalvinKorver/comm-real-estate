import { ContactService, Contact, ContactUpdateInput } from '@/lib/services/contact-service';
import { CreateContactInput } from '@/types/contact';

// Mock Prisma
jest.mock('@/lib/shared/prisma', () => ({
  prisma: {
    contact: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Contact Service', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = require('@/lib/shared/prisma').prisma;
    jest.clearAllMocks();
  });

  describe('createContact', () => {
    it('should create a contact with all fields', async () => {
      const contactData: CreateContactInput = {
        phone: '206-555-0101',
        email: 'john@email.com',
        type: 'Cell',
        priority: 1,
        notes: 'Primary contact',
        ownerId: 'owner-1'
      };

      const mockCreatedContact = {
        id: 'contact-1',
        phone: '206-555-0101',
        email: 'john@email.com',
        type: 'Cell',
        priority: 1,
        notes: 'Primary contact',
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.contact.create.mockResolvedValue(mockCreatedContact);

      const result = await ContactService.createContact(contactData);

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: {
          phone: '206-555-0101',
          email: 'john@email.com',
          type: 'Cell',
          priority: 1,
          notes: 'Primary contact',
          owner_id: 'owner-1'
        }
      });

      expect(result).toEqual({
        id: 'contact-1',
        phone: '206-555-0101',
        email: 'john@email.com',
        type: 'Cell',
        priority: 1,
        notes: 'Primary contact',
        owner_id: 'owner-1',
        created_at: mockCreatedContact.created_at,
        updated_at: mockCreatedContact.updated_at
      });
    });

    it('should create a contact with minimal fields', async () => {
      const contactData: CreateContactInput = {
        type: 'Email',
        priority: 1,
        ownerId: 'owner-1'
      };

      const mockCreatedContact = {
        id: 'contact-1',
        phone: null,
        email: null,
        type: 'Email',
        priority: 1,
        notes: null,
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.contact.create.mockResolvedValue(mockCreatedContact);

      const result = await ContactService.createContact(contactData);

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: {
          phone: undefined,
          email: undefined,
          type: 'Email',
          priority: 1,
          notes: undefined,
          owner_id: 'owner-1'
        }
      });

      expect(result).toEqual({
        id: 'contact-1',
        phone: undefined,
        email: undefined,
        type: 'Email',
        priority: 1,
        notes: undefined,
        owner_id: 'owner-1',
        created_at: mockCreatedContact.created_at,
        updated_at: mockCreatedContact.updated_at
      });
    });
  });

  describe('updateContact', () => {
    it('should update a contact with all fields', async () => {
      const contactId = 'contact-1';
      const updateData: ContactUpdateInput = {
        phone: '206-555-0202',
        email: 'john.updated@email.com',
        type: 'Work',
        priority: 2,
        notes: 'Updated contact info'
      };

      const mockUpdatedContact = {
        id: 'contact-1',
        phone: '206-555-0202',
        email: 'john.updated@email.com',
        type: 'Work',
        priority: 2,
        notes: 'Updated contact info',
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.contact.update.mockResolvedValue(mockUpdatedContact);

      const result = await ContactService.updateContact(contactId, updateData);

      expect(mockPrisma.contact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: {
          phone: '206-555-0202',
          email: 'john.updated@email.com',
          type: 'Work',
          priority: 2,
          notes: 'Updated contact info'
        }
      });

      expect(result).toEqual({
        id: 'contact-1',
        phone: '206-555-0202',
        email: 'john.updated@email.com',
        type: 'Work',
        priority: 2,
        notes: 'Updated contact info',
        owner_id: 'owner-1',
        created_at: mockUpdatedContact.created_at,
        updated_at: mockUpdatedContact.updated_at
      });
    });

    it('should update a contact with partial fields', async () => {
      const contactId = 'contact-1';
      const updateData: ContactUpdateInput = {
        phone: '206-555-0202'
      };

      const mockUpdatedContact = {
        id: 'contact-1',
        phone: '206-555-0202',
        email: 'john@email.com',
        type: 'Cell',
        priority: 1,
        notes: null,
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.contact.update.mockResolvedValue(mockUpdatedContact);

      const result = await ContactService.updateContact(contactId, updateData);

      expect(mockPrisma.contact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: {
          phone: '206-555-0202',
          email: undefined,
          type: undefined,
          priority: undefined,
          notes: undefined
        }
      });

      expect(result).toEqual({
        id: 'contact-1',
        phone: '206-555-0202',
        email: 'john@email.com',
        type: 'Cell',
        priority: 1,
        notes: undefined,
        owner_id: 'owner-1',
        created_at: mockUpdatedContact.created_at,
        updated_at: mockUpdatedContact.updated_at
      });
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact', async () => {
      const contactId = 'contact-1';

      mockPrisma.contact.delete.mockResolvedValue({ id: 'contact-1' });

      await ContactService.deleteContact(contactId);

      expect(mockPrisma.contact.delete).toHaveBeenCalledWith({
        where: { id: 'contact-1' }
      });
    });
  });

  describe('getContactsByOwner', () => {
    it('should get contacts for an owner ordered by priority', async () => {
      const ownerId = 'owner-1';

      const mockContacts = [
        {
          id: 'contact-1',
          phone: '206-555-0101',
          email: 'john@email.com',
          type: 'Cell',
          priority: 1,
          notes: 'Primary contact',
          owner_id: 'owner-1',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'contact-2',
          phone: '206-555-0202',
          email: 'john.work@email.com',
          type: 'Work',
          priority: 2,
          notes: null,
          owner_id: 'owner-1',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPrisma.contact.findMany.mockResolvedValue(mockContacts);

      const result = await ContactService.getContactsByOwner(ownerId);

      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: { owner_id: 'owner-1' },
        orderBy: { priority: 'asc' }
      });

      expect(result).toEqual([
        {
          id: 'contact-1',
          phone: '206-555-0101',
          email: 'john@email.com',
          type: 'Cell',
          priority: 1,
          notes: 'Primary contact',
          owner_id: 'owner-1',
          created_at: mockContacts[0].created_at,
          updated_at: mockContacts[0].updated_at
        },
        {
          id: 'contact-2',
          phone: '206-555-0202',
          email: 'john.work@email.com',
          type: 'Work',
          priority: 2,
          notes: undefined,
          owner_id: 'owner-1',
          created_at: mockContacts[1].created_at,
          updated_at: mockContacts[1].updated_at
        }
      ]);
    });

    it('should return empty array when no contacts found', async () => {
      const ownerId = 'owner-1';

      mockPrisma.contact.findMany.mockResolvedValue([]);

      const result = await ContactService.getContactsByOwner(ownerId);

      expect(result).toEqual([]);
    });
  });

  describe('updateOwnerContacts', () => {
    it('should create new contacts', async () => {
      const ownerId = 'owner-1';
      const contacts = [
        {
          id: 'temp-1',
          phone: '206-555-0101',
          email: 'john@email.com',
          type: 'Cell',
          priority: 1,
          notes: 'Primary contact',
          action: 'create' as const
        }
      ];

      const mockCreatedContact = {
        id: 'contact-1',
        phone: '206-555-0101',
        email: 'john@email.com',
        type: 'Cell',
        priority: 1,
        notes: 'Primary contact',
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          contact: {
            create: jest.fn().mockResolvedValue(mockCreatedContact),
            update: jest.fn(),
            delete: jest.fn()
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await ContactService.updateOwnerContacts(ownerId, contacts);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'contact-1',
          phone: '206-555-0101',
          email: 'john@email.com',
          type: 'Cell',
          priority: 1,
          notes: 'Primary contact',
          owner_id: 'owner-1',
          created_at: mockCreatedContact.created_at,
          updated_at: mockCreatedContact.updated_at
        }
      ]);
    });

    it('should update existing contacts', async () => {
      const ownerId = 'owner-1';
      const contacts = [
        {
          id: 'contact-1',
          phone: '206-555-0202',
          email: 'john.updated@email.com',
          type: 'Work',
          priority: 2,
          notes: 'Updated contact',
          action: 'update' as const
        }
      ];

      const mockUpdatedContact = {
        id: 'contact-1',
        phone: '206-555-0202',
        email: 'john.updated@email.com',
        type: 'Work',
        priority: 2,
        notes: 'Updated contact',
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          contact: {
            create: jest.fn(),
            update: jest.fn().mockResolvedValue(mockUpdatedContact),
            delete: jest.fn()
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await ContactService.updateOwnerContacts(ownerId, contacts);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'contact-1',
          phone: '206-555-0202',
          email: 'john.updated@email.com',
          type: 'Work',
          priority: 2,
          notes: 'Updated contact',
          owner_id: 'owner-1',
          created_at: mockUpdatedContact.created_at,
          updated_at: mockUpdatedContact.updated_at
        }
      ]);
    });

    it('should delete existing contacts', async () => {
      const ownerId = 'owner-1';
      const contacts = [
        {
          id: 'contact-1',
          type: 'Cell',
          priority: 1,
          action: 'delete' as const
        }
      ];

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          contact: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn().mockResolvedValue({ id: 'contact-1' })
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await ContactService.updateOwnerContacts(ownerId, contacts);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle mixed operations', async () => {
      const ownerId = 'owner-1';
      const contacts = [
        {
          id: 'temp-1',
          phone: '206-555-0101',
          type: 'Cell',
          priority: 1,
          action: 'create' as const
        },
        {
          id: 'contact-1',
          phone: '206-555-0202',
          type: 'Work',
          priority: 2,
          action: 'update' as const
        },
        {
          id: 'contact-2',
          type: 'Email',
          priority: 1,
          action: 'delete' as const
        }
      ];

      const mockCreatedContact = {
        id: 'contact-3',
        phone: '206-555-0101',
        email: null,
        type: 'Cell',
        priority: 1,
        notes: null,
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockUpdatedContact = {
        id: 'contact-1',
        phone: '206-555-0202',
        email: null,
        type: 'Work',
        priority: 2,
        notes: null,
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          contact: {
            create: jest.fn().mockResolvedValue(mockCreatedContact),
            update: jest.fn().mockResolvedValue(mockUpdatedContact),
            delete: jest.fn().mockResolvedValue({ id: 'contact-2' })
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await ContactService.updateOwnerContacts(ownerId, contacts);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('contact-3');
      expect(result[1].id).toBe('contact-1');
    });

    it('should skip invalid operations', async () => {
      const ownerId = 'owner-1';
      const contacts = [
        {
          id: 'contact-1',
          type: 'Cell',
          priority: 1,
          action: 'update' as const
        },
        {
          id: 'temp-1',
          type: 'Email',
          priority: 1,
          action: 'create' as const
        }
      ];

      const mockCreatedContact = {
        id: 'contact-2',
        phone: null,
        email: 'test@email.com',
        type: 'Email',
        priority: 1,
        notes: null,
        owner_id: 'owner-1',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          contact: {
            create: jest.fn().mockResolvedValue(mockCreatedContact),
            update: jest.fn().mockResolvedValue({
              id: 'contact-1',
              phone: '206-555-0101',
              email: null,
              type: 'Cell',
              priority: 1,
              notes: null,
              owner_id: 'owner-1',
              created_at: new Date(),
              updated_at: new Date()
            }),
            delete: jest.fn()
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await ContactService.updateOwnerContacts(ownerId, contacts);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });
}); 