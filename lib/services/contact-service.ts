import { prisma } from '@/lib/shared/prisma'
import type { CreateContactInput } from '@/types/contact'
import { PhoneLabel } from '@/types/property'

export interface ContactUpdateInput {
  phone?: string
  email?: string
  type?: string
  label?: PhoneLabel
  priority?: number
  notes?: string
}

export interface Contact {
  id: string;
  phone?: string;
  email?: string;
  type: string;
  label?: PhoneLabel;
  priority: number;
  notes?: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export class ContactService {
  /**
   * Create a new contact
   */
  static async createContact(data: CreateContactInput): Promise<Contact> {
    const contact = await prisma.contact.create({
      data: {
        phone: data.phone,
        email: data.email,
        type: data.type,
        label: (data as any).label,
        priority: data.priority,
        notes: data.notes,
        owner_id: (data as any).ownerId
      }
    })

    return {
      ...contact,
      phone: contact.phone || undefined,
      email: contact.email || undefined,
      label: contact.label as PhoneLabel | undefined,
      notes: contact.notes || undefined
    }
  }

  /**
   * Update an existing contact
   */
  static async updateContact(id: string, data: ContactUpdateInput): Promise<Contact> {
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        phone: data.phone,
        email: data.email,
        type: data.type,
        label: data.label,
        priority: data.priority,
        notes: data.notes
      }
    })

    return {
      ...contact,
      phone: contact.phone || undefined,
      email: contact.email || undefined,
      label: contact.label as PhoneLabel | undefined,
      notes: contact.notes || undefined
    }
  }

  /**
   * Delete a contact
   */
  static async deleteContact(id: string): Promise<void> {
    await prisma.contact.delete({
      where: { id }
    })
  }

  /**
   * Get contacts for an owner
   */
  static async getContactsByOwner(owner_id: string): Promise<Contact[]> {
    const contacts = await prisma.contact.findMany({
      where: { owner_id },
      orderBy: { priority: 'asc' }
    })

    return contacts.map(contact => ({
      ...contact,
      phone: contact.phone || undefined,
      email: contact.email || undefined,
      label: contact.label as PhoneLabel | undefined,
      notes: contact.notes || undefined
    }))
  }

  /**
   * Update multiple contacts for an owner
   */
  static async updateOwnerContacts(owner_id: string, contacts: Array<{
    id?: string
    phone?: string
    email?: string
    type: string
    label?: PhoneLabel
    priority: number
    notes?: string
    action: 'create' | 'update' | 'delete'
  }>): Promise<Contact[]> {
    // Use a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      const results: Contact[] = []

      for (const contact of contacts) {
        switch (contact.action) {
          case 'create':
            if (contact.id?.startsWith('temp-')) {
              // This is a new contact
              const newContact = await tx.contact.create({
                data: {
                  phone: contact.phone,
                  email: contact.email,
                  type: contact.type,
                  label: contact.label,
                  priority: contact.priority,
                  notes: contact.notes,
                  owner_id
                }
              })
              results.push({
                ...newContact,
                phone: newContact.phone || undefined,
                email: newContact.email || undefined,
                label: newContact.label as PhoneLabel | undefined,
                notes: newContact.notes || undefined
              })
            }
            break

          case 'update':
            if (contact.id && !contact.id.startsWith('temp-')) {
              // This is an existing contact
              const updatedContact = await tx.contact.update({
                where: { id: contact.id },
                data: {
                  phone: contact.phone,
                  email: contact.email,
                  type: contact.type,
                  label: contact.label,
                  priority: contact.priority,
                  notes: contact.notes
                }
              })
              results.push({
                ...updatedContact,
                phone: updatedContact.phone || undefined,
                email: updatedContact.email || undefined,
                label: updatedContact.label as PhoneLabel | undefined,
                notes: updatedContact.notes || undefined
              })
            }
            break

          case 'delete':
            if (contact.id && !contact.id.startsWith('temp-')) {
              // Delete existing contact
              await tx.contact.delete({
                where: { id: contact.id }
              })
            }
            break
        }
      }

      return results
    })
  }
} 