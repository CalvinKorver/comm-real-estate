import { prisma } from '@/lib/shared/prisma'
import type { Owner, Contact } from '@/generated/prisma'

export interface OwnerData {
  firstName: string
  lastName: string
  fullName?: string
  llcContact?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
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
    if (ownerData.fullName) {
      const nameMatches = await prisma.owner.findMany({
        where: {
          OR: [
            { fullName: ownerData.fullName },
            { 
              AND: [
                { firstName: ownerData.firstName },
                { lastName: ownerData.lastName }
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
          ownerData.fullName || `${ownerData.firstName} ${ownerData.lastName}`,
          match.fullName || `${match.firstName} ${match.lastName}`
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
    if (newData.llcContact && !existing.llcContact) {
      updateData.llcContact = newData.llcContact
    }

    if (newData.streetAddress && !existing.streetAddress) {
      updateData.streetAddress = newData.streetAddress
    }

    if (newData.city && !existing.city) {
      updateData.city = newData.city
    }

    if (newData.state && !existing.state) {
      updateData.state = newData.state
    }

    if (newData.zipCode && !existing.zipCode) {
      updateData.zipCode = newData.zipCode
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
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        fullName: ownerData.fullName,
        llcContact: ownerData.llcContact,
        streetAddress: ownerData.streetAddress,
        city: ownerData.city,
        state: ownerData.state,
        zipCode: ownerData.zipCode,
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
        ownerId,
        phone,
        type: 'Cell',
        priority: 1
      })
    }

    if (email) {
      contactsToCreate.push({
        ownerId,
        email,
        type: 'Email',
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
   * Process an owner with full deduplication logic
   */
  async processOwner(ownerData: OwnerData): Promise<{
    owner: Owner
    action: 'created' | 'merged' | 'updated'
    matches?: OwnerMatch[]
  }> {
    // Find potential duplicates
    const matches = await this.findPotentialDuplicates(ownerData)

    if (matches.length === 0) {
      // No matches found - create new owner
      const newOwner = await this.createNewOwner(ownerData)
      await this.addContactToOwner(newOwner.id, ownerData.phone, ownerData.email)

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
      await this.addContactToOwner(newOwner.id, ownerData.phone, ownerData.email)

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
      await this.addContactToOwner(mergedOwner.id, ownerData.phone, ownerData.email)

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