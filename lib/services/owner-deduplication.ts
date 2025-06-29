import { prisma } from '@/lib/shared/prisma'

export interface OwnerMatch {
  existingOwner: any
  confidence: number
  reason: string
}

export interface DeduplicationResult {
  shouldCreate: boolean
  existingOwner?: any
  confidence: number
  reason: string
}

export class OwnerDeduplicationService {
  /**
   * Find potential matches for a new owner
   */
  static async findPotentialMatches(
    firstName: string,
    lastName: string,
    fullName?: string,
    phoneNumber?: string
  ): Promise<OwnerMatch[]> {
    const matches: OwnerMatch[] = []

    // Search by exact name match
    const exactNameMatches = await prisma.owner.findMany({
      where: {
        OR: [
          {
            AND: [
              { firstName: { equals: firstName, mode: 'insensitive' } },
              { lastName: { equals: lastName, mode: 'insensitive' } }
            ]
          },
          {
            fullName: { equals: fullName || `${firstName} ${lastName}`, mode: 'insensitive' }
          }
        ]
      },
      include: {
        contacts: true
      }
    })

    exactNameMatches.forEach(owner => {
      matches.push({
        existingOwner: owner,
        confidence: 0.95,
        reason: 'Exact name match'
      })
    })

    // Search by phone number if provided
    if (phoneNumber) {
      const phoneMatches = await prisma.owner.findMany({
        where: {
          OR: [
            { phoneNumber: { equals: phoneNumber, mode: 'insensitive' } },
            {
              contacts: {
                some: {
                  phone: { equals: phoneNumber, mode: 'insensitive' }
                }
              }
            }
          ]
        },
        include: {
          contacts: true
        }
      })

      phoneMatches.forEach(owner => {
        const existingMatch = matches.find(m => m.existingOwner.id === owner.id)
        if (existingMatch) {
          existingMatch.confidence = Math.min(0.98, existingMatch.confidence + 0.3)
          existingMatch.reason += ' + phone match'
        } else {
          matches.push({
            existingOwner: owner,
            confidence: 0.8,
            reason: 'Phone number match'
          })
        }
      })
    }

    // Search by similar names (fuzzy matching)
    const similarNameMatches = await prisma.owner.findMany({
      where: {
        OR: [
          { firstName: { contains: firstName.substring(0, 3), mode: 'insensitive' } },
          { lastName: { contains: lastName.substring(0, 3), mode: 'insensitive' } },
          { fullName: { contains: firstName.substring(0, 3), mode: 'insensitive' } }
        ]
      },
      include: {
        contacts: true
      }
    })

    similarNameMatches.forEach(owner => {
      const existingMatch = matches.find(m => m.existingOwner.id === owner.id)
      if (!existingMatch) {
        const similarity = this.calculateNameSimilarity(
          `${firstName} ${lastName}`,
          `${owner.firstName} ${owner.lastName}`
        )
        if (similarity > 0.7) {
          matches.push({
            existingOwner: owner,
            confidence: similarity * 0.8,
            reason: 'Similar name match'
          })
        }
      }
    })

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Determine if we should create a new owner or use an existing one
   */
  static async shouldCreateNewOwner(
    firstName: string,
    lastName: string,
    fullName?: string,
    phoneNumber?: string
  ): Promise<DeduplicationResult> {
    const matches = await this.findPotentialMatches(firstName, lastName, fullName, phoneNumber)

    if (matches.length === 0) {
      return {
        shouldCreate: true,
        confidence: 1.0,
        reason: 'No matches found'
      }
    }

    const bestMatch = matches[0]

    // If confidence is very high, don't create new owner
    if (bestMatch.confidence > 0.9) {
      return {
        shouldCreate: false,
        existingOwner: bestMatch.existingOwner,
        confidence: bestMatch.confidence,
        reason: bestMatch.reason
      }
    }

    // If confidence is medium, create new owner but flag for review
    if (bestMatch.confidence > 0.7) {
      return {
        shouldCreate: true,
        existingOwner: bestMatch.existingOwner,
        confidence: bestMatch.confidence,
        reason: `Potential duplicate: ${bestMatch.reason}`
      }
    }

    // Low confidence, create new owner
    return {
      shouldCreate: true,
      confidence: 1.0,
      reason: 'No strong matches found'
    }
  }

  /**
   * Calculate similarity between two names
   */
  private static calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '')
    const n1 = normalize(name1)
    const n2 = normalize(name2)

    if (n1 === n2) return 1.0

    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(n1, n2)
    const maxLength = Math.max(n1.length, n2.length)
    
    return 1 - (distance / maxLength)
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Merge duplicate owners (manual process)
   */
  static async mergeOwners(primaryOwnerId: string, duplicateOwnerId: string) {
    // Get both owners
    const primaryOwner = await prisma.owner.findUnique({
      where: { id: primaryOwnerId },
      include: { properties: true, contacts: true }
    })

    const duplicateOwner = await prisma.owner.findUnique({
      where: { id: duplicateOwnerId },
      include: { properties: true, contacts: true }
    })

    if (!primaryOwner || !duplicateOwner) {
      throw new Error('One or both owners not found')
    }

    // Transfer properties from duplicate to primary
    const propertiesToUpdate = await prisma.property.findMany({
      where: {
        owners: {
          some: { id: duplicateOwnerId }
        }
      }
    })

    for (const property of propertiesToUpdate) {
      await prisma.property.update({
        where: { id: property.id },
        data: {
          owners: {
            disconnect: { id: duplicateOwnerId },
            connect: { id: primaryOwnerId }
          }
        }
      })
    }

    // Transfer contacts from duplicate to primary
    await prisma.contact.updateMany({
      where: { ownerId: duplicateOwnerId },
      data: { ownerId: primaryOwnerId }
    })

    // Delete the duplicate owner
    await prisma.owner.delete({
      where: { id: duplicateOwnerId }
    })

    return primaryOwner
  }
} 