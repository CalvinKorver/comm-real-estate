import { prisma } from '@/lib/shared/prisma'
import type { Owner, Contact } from '@/generated/prisma'

export interface OwnerData {
  first_name: string
  last_name: string
  full_name?: string
  llc_contact?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  phone?: string
  email?: string
  contacts?: Array<{
    phone?: string;
    email?: string;
    type: string;
    priority: number;
  }>
}

export interface OwnerMatch {
  owner: Owner
  confidence: number
  matchReason: string
  phoneConflict?: boolean
  emailConflict?: boolean
}

export interface ConflictResolution {
  action: 'merge' | 'create_new' | 'skip'
  targetOwnerId?: string
  phoneResolution?: 'keep_existing' | 'add_new' | 'replace'
  emailResolution?: 'keep_existing' | 'add_new' | 'replace'
}

export class OwnerDeduplicationService {
  /**
   * Normalize phone number for comparison
   */
  normalizePhone(phone: string): string {
    return phone
      .replace(/\D/g, '') // Remove all non-digits
      .replace(/^1/, '') // Remove leading 1 for US numbers
      .slice(-10) // Take last 10 digits
  }

  /**
   * Normalize name for comparison
   */
  normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s]/g, '') // Remove special characters
  }

  /**
   * Calculate name similarity (0-1 scale)
   */
  calculateNameSimilarity(name1: string, name2: string): number {
    const normalized1 = this.normalizeName(name1)
    const normalized2 = this.normalizeName(name2)

    if (normalized1 === normalized2) return 1.0

    // Split into words and compare
    const words1 = normalized1.split(' ')
    const words2 = normalized2.split(' ')

    const commonWords = words1.filter(word => words2.includes(word))
    const totalWords = Math.max(words1.length, words2.length)

    if (totalWords === 0) return 0

    return commonWords.length / totalWords
  }

  /**
   * Find potential duplicates by name and phone
   */
  async findPotentialDuplicates(ownerData: OwnerData): Promise<OwnerMatch[]> {
    const matches: OwnerMatch[] = []

    // Search by full name first
    if (ownerData.full_name) {
      const nameMatches = await prisma.owner.findMany({
        where: {
          OR: [
            { full_name: ownerData.full_name },
            { 
              AND: [
                { first_name: ownerData.first_name },
                { last_name: ownerData.last_name }
              ]
            }
          ]
        },
        include: {
          contacts: true
        }
      })

      for (const match of nameMatches) {
        const nameSimilarity = this.calculateNameSimilarity(
          ownerData.full_name || `${ownerData.first_name} ${ownerData.last_name}`,
          match.full_name || `${match.first_name} ${match.last_name}`
        )

        if (nameSimilarity >= 0.8) {
          const phoneConflict: boolean | undefined = ownerData.phone && ownerData.phone.trim() !== '' ? this.hasPhoneConflict(ownerData.phone, match.contacts) : undefined;
          const emailConflict: boolean | undefined = ownerData.email && ownerData.email.trim() !== '' ? this.hasEmailConflict(ownerData.email, match.contacts) : undefined;

          matches.push({
            owner: match,
            confidence: nameSimilarity,
            matchReason: `Name match (${Math.round(nameSimilarity * 100)}% similarity)`,
            phoneConflict,
            emailConflict
          });
        }
      }
    }

    // Search by phone number if provided
    if (ownerData.phone) {
      const normalizedPhone = this.normalizePhone(ownerData.phone)
      const phoneMatches = await prisma.owner.findMany({
        where: {
          contacts: {
            some: {
              phone: {
                contains: normalizedPhone
              }
            }
          }
        },
        include: {
          contacts: true
        }
      })

      for (const match of phoneMatches) {
        // Check if this owner is already in our matches
        const existingMatch = matches.find(m => m.owner.id === match.id)
        if (existingMatch) {
          existingMatch.confidence = Math.max(existingMatch.confidence, 0.9)
          existingMatch.matchReason = 'Name and phone match'
          existingMatch.phoneConflict = true
        } else {
          matches.push({
            owner: match,
            confidence: 0.9,
            matchReason: 'Phone number match',
            phoneConflict: true
          })
        }
      }
    }

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Check if there's a phone number conflict
   */
  private hasPhoneConflict(newPhone: string, existingContacts: Contact[]): boolean {
    const normalizedNewPhone = this.normalizePhone(newPhone)
    return existingContacts.some(contact => 
      contact.phone && this.normalizePhone(contact.phone) === normalizedNewPhone
    )
  }

  /**
   * Check if there's an email conflict
   */
  private hasEmailConflict(newEmail: string, existingContacts: Contact[]): boolean {
    const normalizedNewEmail = newEmail.toLowerCase().trim()
    return existingContacts.some(contact => 
      contact.email && contact.email.toLowerCase().trim() === normalizedNewEmail
    )
  }

  /**
   * Resolve phone number conflicts
   */
  async resolvePhoneConflicts(
    ownerData: OwnerData, 
    existingOwners: OwnerMatch[]
  ): Promise<ConflictResolution> {
    if (existingOwners.length === 0) {
      return { action: 'create_new' }
    }

    const bestMatch = existingOwners[0]
    
    if (bestMatch.confidence >= 0.95) {
      // High confidence match - merge
      return {
        action: 'merge',
        targetOwnerId: bestMatch.owner.id,
        phoneResolution: bestMatch.phoneConflict ? 'add_new' : 'add_new',
        emailResolution: bestMatch.emailConflict ? 'add_new' : 'add_new'
      }
    } else if (bestMatch.confidence >= 0.8) {
      // Medium confidence - create new to be safe
      return { action: 'create_new' }
    } else {
      // Low confidence - create new
      return { action: 'create_new' }
    }
  }

  /**
   * Merge owner data intelligently
   */
  async mergeOwnerData(existing: Owner, newData: OwnerData): Promise<Owner> {
    const updateData: Partial<Owner> = {}

    // Only update fields that have meaningful new data
    if (newData.llc_contact && !existing.llc_contact) {
      updateData.llc_contact = newData.llc_contact
    }

    if (newData.street_address && !existing.street_address) {
      updateData.street_address = newData.street_address
    }

    if (newData.city && !existing.city) {
      updateData.city = newData.city
    }

    if (newData.state && !existing.state) {
      updateData.state = newData.state
    }

    if (newData.zip_code && !existing.zip_code) {
      updateData.zip_code = newData.zip_code
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      return await prisma.owner.update({
        where: { id: existing.id },
        data: updateData
      })
    }

    return existing
  }

  /**
   * Create a new owner
   */
  async createNewOwner(ownerData: OwnerData): Promise<Owner> {
    return await prisma.owner.create({
      data: {
        first_name: ownerData.first_name,
        last_name: ownerData.last_name,
        full_name: ownerData.full_name,
        llc_contact: ownerData.llc_contact,
        street_address: ownerData.street_address,
        city: ownerData.city,
        state: ownerData.state,
        zip_code: ownerData.zip_code,
      }
    })
  }

  /**
   * Add contact information to an owner
   */
  async addContactToOwner(ownerId: string, phone?: string, email?: string): Promise<void> {
    const contactsToCreate = []

    if (phone) {
      contactsToCreate.push({
        owner_id: ownerId,
        phone,
        type: 'phone',
        priority: 1
      })
    }

    if (email) {
      contactsToCreate.push({
        owner_id: ownerId,
        email,
        type: 'email',
        priority: 1
      })
    }

    if (contactsToCreate.length > 0) {
      await prisma.contact.createMany({
        data: contactsToCreate,
        skipDuplicates: true
      })
    }
  }

  /**
   * Add multiple contacts to an owner with proper deduplication
   */
  async addContactsToOwner(
    ownerId: string, 
    contacts: Array<{
      phone?: string;
      email?: string;
      type: string;
      priority: number;
    }>
  ): Promise<void> {
    if (contacts.length === 0) return;

    // Get existing contacts for this owner
    const existingContacts = await prisma.contact.findMany({
      where: { owner_id: ownerId }
    });

    const contactsToCreate = [];

    for (const contact of contacts) {
      // Skip if both phone and email are empty
      if (!contact.phone && !contact.email) continue;

      // Check for duplicates
      const isDuplicate = existingContacts.some(existing => {
        if (contact.phone && existing.phone) {
          return this.normalizePhone(contact.phone) === this.normalizePhone(existing.phone);
        }
        if (contact.email && existing.email) {
          return contact.email.toLowerCase().trim() === existing.email.toLowerCase().trim();
        }
        return false;
      });

      if (!isDuplicate) {
        contactsToCreate.push({
          owner_id: ownerId,
          phone: contact.phone || null,
          email: contact.email || null,
          type: contact.type,
          priority: contact.priority
        });
      }
    }

    if (contactsToCreate.length > 0) {
      await prisma.contact.createMany({
        data: contactsToCreate,
        skipDuplicates: true
      });
    }
  }

  /**
   * Process an owner with full deduplication logic
   */
  async processOwner(ownerData: OwnerData): Promise<{
    owner: Owner
    action: 'created' | 'merged' | 'updated'
    matches?: OwnerMatch[]
  }> {
    // Find potential duplicates
    const matches = await this.findPotentialDuplicates(ownerData)

    // Prepare contacts array for processing
    const contactsToAdd = [];
    
    // Add legacy phone/email fields as contacts if they exist
    if (ownerData.phone || ownerData.email) {
      contactsToAdd.push({
        phone: ownerData.phone,
        email: ownerData.email,
        type: ownerData.phone ? 'Cell' : 'Email',
        priority: 1
      });
    }
    
    // Add any additional contacts from the contacts array
    if (ownerData.contacts) {
      contactsToAdd.push(...ownerData.contacts);
    }

    if (matches.length === 0) {
      // No matches found - create new owner
      const newOwner = await this.createNewOwner(ownerData)
      await this.addContactsToOwner(newOwner.id, contactsToAdd)

      return {
        owner: newOwner,
        action: 'created'
      }
    }

    // Resolve conflicts
    const resolution = await this.resolvePhoneConflicts(ownerData, matches)

    if (resolution.action === 'create_new') {
      // Create new owner despite matches
      const newOwner = await this.createNewOwner(ownerData)
      await this.addContactsToOwner(newOwner.id, contactsToAdd)

      return {
        owner: newOwner,
        action: 'created',
        matches
      }
    } else if (resolution.action === 'merge' && resolution.targetOwnerId) {
      // Merge with existing owner
      const existingOwner = await prisma.owner.findUnique({
        where: { id: resolution.targetOwnerId }
      })

      if (!existingOwner) {
        throw new Error('Target owner not found for merge')
      }

      const mergedOwner = await this.mergeOwnerData(existingOwner, ownerData)
      // Add all new contacts to the merged owner - this ensures contacts are merged properly
      await this.addContactsToOwner(mergedOwner.id, contactsToAdd)

      return {
        owner: mergedOwner,
        action: 'merged',
        matches
      }
    } else {
      throw new Error('Invalid conflict resolution action')
    }
  }
} 