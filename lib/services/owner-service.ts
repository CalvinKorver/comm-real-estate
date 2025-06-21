import { prisma } from '@/lib/shared/prisma'

export class OwnerService {
  /**
   * Get an owner by ID with their properties
   */
  static async getOwnerWithProperties(ownerId: string) {
    if (!ownerId) {
      throw new Error('Owner ID is required')
    }

    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        properties: true,
      },
    })

    if (!owner) {
      throw new Error('Owner not found')
    }

    return owner
  }
} 